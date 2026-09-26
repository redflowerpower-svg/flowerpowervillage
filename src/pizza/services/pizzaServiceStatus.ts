import { useState, useEffect } from 'react';

export interface PizzeriaServiceStatus {
  isOpen: boolean;
  pausedUntil: string | null;
  pauseReason: string;
  openingHours: {
    openTime: string; // e.g. "11:00"
    closeTime: string; // e.g. "21:30"
    closedDays: number[]; // e.g. [] (0=Sun, 1=Mon, ..., 6=Sat)
  };
  lastUpdated: string;
}

export const DEFAULT_PIZZERIA_STATUS: PizzeriaServiceStatus = {
  isOpen: true,
  pausedUntil: null,
  pauseReason: 'busy',
  openingHours: {
    openTime: '11:00',
    closeTime: '21:30',
    closedDays: []
  },
  lastUpdated: new Date().toISOString()
};

export type ServiceCurrentState = 'OPEN' | 'PAUSED' | 'CLOSED_OFF_HOURS';

export interface ServiceCalculationResult {
  state: ServiceCurrentState;
  canOrder: boolean;
  remainingMinutes: number;
  reopenTimeFormatted: string;
  reason: string;
}

export interface BangkokTimeInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  totalMinutes: number; // hour * 60 + minute
  timeStr: string; // "HH:MM"
  fullTimeStr: string; // "HH:MM:SS"
}

/**
 * Extract time & date strictly in Thailand / Ranong Timezone (Asia/Bangkok, UTC+7).
 * Works 100% reliably regardless of the client machine/tablet's local timezone.
 */
export function getBangkokTime(date: Date = new Date()): BangkokTimeInfo {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'short',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const rawHour = parseInt(partMap.hour || '0', 10);
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = parseInt(partMap.minute || '0', 10);
  const second = parseInt(partMap.second || '0', 10);
  const year = parseInt(partMap.year || '2026', 10);
  const month = parseInt(partMap.month || '1', 10);
  const day = parseInt(partMap.day || '1', 10);

  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
  };
  const dayOfWeek = weekdayMap[partMap.weekday || 'Sun'] ?? 0;

  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  const ss = String(second).padStart(2, '0');

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayOfWeek,
    totalMinutes: hour * 60 + minute,
    timeStr: `${hh}:${mm}`,
    fullTimeStr: `${hh}:${mm}:${ss}`
  };
}

/**
 * Calculates current status based strictly on Ranong / Thailand time (Asia/Bangkok, UTC+7).
 */
export function calculateServiceState(status: PizzeriaServiceStatus): ServiceCalculationResult {
  // 1. Get current time strictly in Asia/Bangkok (UTC+7)
  const bangkok = getBangkokTime();
  const currentDay = bangkok.dayOfWeek;
  const currentTotalMinutes = bangkok.totalMinutes;

  // 2. Check if manually closed
  if (!status.isOpen) {
    return {
      state: 'CLOSED_OFF_HOURS',
      canOrder: false,
      remainingMinutes: 0,
      reopenTimeFormatted: status.openingHours?.openTime || '11:00',
      reason: 'manual_close'
    };
  }

  // 3. Check if temporary pause is active
  if (status.pausedUntil) {
    const pauseDate = new Date(status.pausedUntil);
    const diffMs = pauseDate.getTime() - Date.now();
    if (diffMs > 0) {
      const remainingMinutes = Math.ceil(diffMs / 60000);
      const pauseBangkok = getBangkokTime(pauseDate);

      return {
        state: 'PAUSED',
        canOrder: false,
        remainingMinutes,
        reopenTimeFormatted: pauseBangkok.timeStr,
        reason: status.pauseReason || 'busy'
      };
    }
  }

  // 4. Check regular opening hours (Ranong / Thailand local time)
  const { openTime = '11:00', closeTime = '21:30', closedDays = [] } = status.openingHours || {};

  if (closedDays && closedDays.includes(currentDay)) {
    return {
      state: 'CLOSED_OFF_HOURS',
      canOrder: false,
      remainingMinutes: 0,
      reopenTimeFormatted: openTime,
      reason: 'weekly_closed_day'
    };
  }

  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const openTotalMinutes = (openH || 0) * 60 + (openM || 0);
  const closeTotalMinutes = (closeH || 0) * 60 + (closeM || 0);

  // Before opening shift (e.g. current 10:00, open 11:30)
  if (currentTotalMinutes < openTotalMinutes) {
    const remainingMinutes = openTotalMinutes - currentTotalMinutes;
    return {
      state: 'CLOSED_OFF_HOURS',
      canOrder: false,
      remainingMinutes,
      reopenTimeFormatted: openTime,
      reason: 'before_opening'
    };
  }

  // After closing shift (e.g. current 21:45, close 21:30)
  if (currentTotalMinutes >= closeTotalMinutes) {
    // Closed for today, reopens tomorrow at openTime
    const minutesUntilMidnight = (24 * 60) - currentTotalMinutes;
    const remainingMinutes = minutesUntilMidnight + openTotalMinutes;
    return {
      state: 'CLOSED_OFF_HOURS',
      canOrder: false,
      remainingMinutes,
      reopenTimeFormatted: openTime,
      reason: 'after_closing'
    };
  }

  // We are within opening hours and no pause active!
  return {
    state: 'OPEN',
    canOrder: true,
    remainingMinutes: 0,
    reopenTimeFormatted: '',
    reason: ''
  };
}

const STORAGE_KEY = 'fp_pizzeria_service_status';

export function getLocalStatus(): PizzeriaServiceStatus | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export function saveLocalStatus(status: PizzeriaServiceStatus) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    }
  } catch (e) {}
}

const PUBLIC_STATUS_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/pizzeria_service_status.json';

/**
 * Fetch current status from Supabase public CDN & backend API (with cache-busting & localStorage instant fallback)
 */
export async function fetchPizzeriaStatus(): Promise<PizzeriaServiceStatus> {
  const local = getLocalStatus();
  
  // 1. Try direct Supabase public URL with unique timestamp query param (instant CDN bypass, zero cold-starts)
  try {
    const res = await fetch(`${PUBLIC_STATUS_URL}?_ts=${Date.now()}_${Math.random()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && data.openingHours) {
        saveLocalStatus(data);
        return data as PizzeriaServiceStatus;
      }
    }
  } catch (err) {
    // Failover to API route
  }

  // 2. Fallback to API route
  try {
    const res = await fetch(`/api/pizza-service-status?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status) {
        saveLocalStatus(data.status);
        return data.status;
      }
    }
  } catch (e) {
    console.warn('[pizzaServiceStatus] Fetch failed, using local/fallback:', e);
  }
  return local || DEFAULT_PIZZERIA_STATUS;
}

/**
 * Update status via backend API (called by KDS Tablet or Admin)
 */
export async function updatePizzeriaStatus(update: Partial<PizzeriaServiceStatus>): Promise<PizzeriaServiceStatus> {
  const current = getLocalStatus() || DEFAULT_PIZZERIA_STATUS;
  const optimistic: PizzeriaServiceStatus = {
    ...current,
    ...update,
    openingHours: {
      ...current.openingHours,
      ...(update.openingHours || {})
    },
    lastUpdated: new Date().toISOString()
  };
  saveLocalStatus(optimistic);

  // Broadcast instantly to all tabs / windows
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('flower_power_service_status');
      bc.postMessage({ type: 'STATUS_UPDATED', status: optimistic });
      bc.close();
    }
  } catch (err) {}

  try {
    const res = await fetch('/api/pizza-service-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(optimistic)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status) {
        saveLocalStatus(data.status);
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('flower_power_service_status');
            bc.postMessage({ type: 'STATUS_UPDATED', status: data.status });
            bc.close();
          }
        } catch (err) {}
        return data.status;
      }
    }
  } catch (e) {
    console.error('[pizzaServiceStatus] Update error:', e);
  }
  return optimistic;
}

/**
 * React hook for live reactive pizzeria service status across all customer & admin pages.
 * Instantly synchronizes via BroadcastChannel and localStorage cache.
 */
export function usePizzeriaStatus(): PizzeriaServiceStatus {
  const [status, setStatus] = useState<PizzeriaServiceStatus>(() => getLocalStatus() || DEFAULT_PIZZERIA_STATUS);

  useEffect(() => {
    fetchPizzeriaStatus().then(setStatus);
    const interval = setInterval(() => {
      fetchPizzeriaStatus().then(setStatus);
    }, 15000);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('flower_power_service_status');
        bc.onmessage = (ev) => {
          if (ev.data?.type === 'STATUS_UPDATED' && ev.data?.status) {
            setStatus(ev.data.status);
          }
        };
      }
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

  return status;
}

