export interface PizzeriaServiceStatus {
  isOpen: boolean;
  pausedUntil: string | null;
  pauseReason: string;
  openingHours: {
    openTime: string; // e.g. "17:00"
    closeTime: string; // e.g. "22:30"
    closedDays: number[]; // e.g. [] (0=Sun, 1=Mon, ..., 6=Sat)
  };
  lastUpdated: string;
}

export const DEFAULT_PIZZERIA_STATUS: PizzeriaServiceStatus = {
  isOpen: true,
  pausedUntil: null,
  pauseReason: 'busy',
  openingHours: {
    openTime: '17:00',
    closeTime: '22:30',
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

/**
 * Calculates current status based on Ranong / Thailand time (Asia/Bangkok, UTC+7).
 */
export function calculateServiceState(status: PizzeriaServiceStatus): ServiceCalculationResult {
  // 1. Get current date & time in Asia/Bangkok (UTC+7)
  const now = new Date();
  
  // Calculate Bangkok time offset
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bangkokMs = utcMs + (7 * 3600000);
  const bangkokDate = new Date(bangkokMs);

  const currentDay = bangkokDate.getDay(); // 0 = Sun, 1 = Mon ...
  const currentHours = bangkokDate.getHours();
  const currentMinutes = bangkokDate.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // 2. Check if manually closed
  if (!status.isOpen) {
    return {
      state: 'CLOSED_OFF_HOURS',
      canOrder: false,
      remainingMinutes: 0,
      reopenTimeFormatted: status.openingHours.openTime,
      reason: 'manual_close'
    };
  }

  // 3. Check if temporary pause is active
  if (status.pausedUntil) {
    const pauseTime = new Date(status.pausedUntil).getTime();
    const diffMs = pauseTime - now.getTime();
    if (diffMs > 0) {
      const remainingMinutes = Math.ceil(diffMs / 60000);
      const pauseDate = new Date(pauseTime);
      const reopenUtcMs = pauseDate.getTime() + (pauseDate.getTimezoneOffset() * 60000);
      const reopenBangkokDate = new Date(reopenUtcMs + (7 * 3600000));
      const hh = String(reopenBangkokDate.getHours()).padStart(2, '0');
      const mm = String(reopenBangkokDate.getMinutes()).padStart(2, '0');

      return {
        state: 'PAUSED',
        canOrder: false,
        remainingMinutes,
        reopenTimeFormatted: `${hh}:${mm}`,
        reason: status.pauseReason || 'busy'
      };
    }
  }

  // 4. Check regular opening hours (Ranong local time)
  const { openTime, closeTime, closedDays } = status.openingHours;

  if (closedDays && closedDays.includes(currentDay)) {
    return {
      state: 'CLOSED_OFF_HOURS',
      canOrder: false,
      remainingMinutes: 0,
      reopenTimeFormatted: openTime,
      reason: 'weekly_closed_day'
    };
  }

  const [openH, openM] = (openTime || '17:00').split(':').map(Number);
  const [closeH, closeM] = (closeTime || '22:30').split(':').map(Number);
  const openTotalMinutes = openH * 60 + openM;
  const closeTotalMinutes = closeH * 60 + closeM;

  // Standard evening shift (e.g. 17:00 - 22:30)
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

/**
 * Fetch current status from backend API
 */
export async function fetchPizzeriaStatus(): Promise<PizzeriaServiceStatus> {
  try {
    const res = await fetch('/api/pizza-service-status');
    if (res.ok) {
      const data = await res.json();
      if (data && data.status) {
        return data.status;
      }
    }
  } catch (e) {
    console.warn('[pizzaServiceStatus] Fetch failed, using fallback:', e);
  }
  return DEFAULT_PIZZERIA_STATUS;
}

/**
 * Update status via backend API (called by KDS Tablet or Admin)
 */
export async function updatePizzeriaStatus(update: Partial<PizzeriaServiceStatus>): Promise<PizzeriaServiceStatus> {
  try {
    const res = await fetch('/api/pizza-service-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status) {
        // Broadcast change locally
        try {
          const bc = new BroadcastChannel('flower_power_service_status');
          bc.postMessage({ type: 'STATUS_UPDATED', status: data.status });
          bc.close();
        } catch (err) {}
        return data.status;
      }
    }
  } catch (e) {
    console.error('[pizzaServiceStatus] Update error:', e);
  }
  return DEFAULT_PIZZERIA_STATUS;
}
