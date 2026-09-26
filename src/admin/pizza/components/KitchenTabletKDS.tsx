import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, 
  Bike, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  BellOff, 
  Maximize, 
  Minimize, 
  Clock, 
  MapPin, 
  Phone, 
  Send, 
  ExternalLink,
  MessageCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  Moon,
  Save,
  X
} from 'lucide-react';
import { usePizzaAdminStore, PizzaOrder } from '../store/usePizzaAdminStore';
import { 
  initKitchenAudio, 
  startContinuousAlarm, 
  stopContinuousAlarm, 
  testKitchenAlarm,
  startDispatchReminderAlarm,
  stopDispatchReminderAlarm,
  playGentleReminderChime,
  requestScreenWakeLock, 
  releaseScreenWakeLock 
} from '../utils/kitchenAudioWakeLock';
import { menuData } from '../../../pizza/data/menuData';
import { 
  fetchPizzeriaStatus, 
  updatePizzeriaStatus, 
  calculateServiceState, 
  getBangkokTime,
  PizzeriaServiceStatus, 
  DEFAULT_PIZZERIA_STATUS,
  ServiceCalculationResult
} from '../../../pizza/services/pizzaServiceStatus';

// Coords fallback for Flower Power Pizza Ranong
const RESTAURANT_LAT = 9.958742;
const RESTAURANT_LNG = 98.634812;

type CartItemSaved = {
  name: string;
  nameTh?: string;
  quantity: number;
  basePrice?: number;
  selectedVariant?: any;
  selectedExtras?: any[];
};

// Build quick lookup map for Thai names from menuData
const menuThaiLookup: Record<string, string> = {};
// Universal Extra Translation Dictionary (mapping all extras from menuData)
const extraLookup: Record<string, { th: string; en: string }> = {};

menuData.forEach(cat => {
  cat.items.forEach((it: any) => {
    if (it.name) {
      menuThaiLookup[it.name.trim().toLowerCase()] = it.nameTh || '';
    }
    if (it.extras && Array.isArray(it.extras)) {
      it.extras.forEach((ex: any) => {
        const th = ex.nameTh || '';
        const en = ex.name || '';
        const itName = ex.nameIt || ex.name_it || '';
        const deName = ex.nameDe || ex.name_de || '';

        const entry = { th: th || en, en: en || th };
        if (en) extraLookup[en.trim().toLowerCase()] = entry;
        if (itName) extraLookup[itName.trim().toLowerCase()] = entry;
        if (th) extraLookup[th.trim().toLowerCase()] = entry;
        if (deName) extraLookup[deName.trim().toLowerCase()] = entry;
      });
    }
  });
});

const getThaiName = (item: CartItemSaved): string => {
  if (item.nameTh && typeof item.nameTh === 'string' && item.nameTh.trim()) {
    return item.nameTh.trim();
  }
  const clean = String(item.name || '').trim().toLowerCase();
  return menuThaiLookup[clean] || '';
};

export const getExtraDisplayName = (ex: any, lang: 'en' | 'th'): string => {
  if (!ex) return '';
  if (typeof ex === 'object') {
    if (lang === 'th' && ex.nameTh && typeof ex.nameTh === 'string' && ex.nameTh.trim()) {
      return ex.nameTh.trim();
    }
    const candidate = (ex.name || ex.nameIt || '').trim().toLowerCase();
    if (candidate && extraLookup[candidate]) {
      return lang === 'th' ? extraLookup[candidate].th : extraLookup[candidate].en;
    }
    return ex.name || ex.nameIt || (lang === 'th' ? 'พิเศษ' : 'Extra');
  }

  // If ex is a string (e.g. "Doppia Mozzarella" or "Extra Cheese")
  const str = String(ex).trim();
  const lower = str.toLowerCase();
  if (extraLookup[lower]) {
    return lang === 'th' ? extraLookup[lower].th : extraLookup[lower].en;
  }
  return str;
};

const translateAddressToThai = (addr: string): string => {
  if (!addr) return '';
  if (/[\u0E00-\u0E7F]/.test(addr)) return addr;

  let thAddr = addr;
  const replacements: [RegExp, string][] = [
    [/Bang\s*Rin/gi, 'ต.บางริ้น'],
    [/Khao\s*Niwet/gi, 'ต.เขานิเวศน์'],
    [/Pak\s*Nam/gi, 'ต.ปากน้ำ'],
    [/Ngao/gi, 'ต.หงาว'],
    [/Bang\s*Non/gi, 'ต.บางนอน'],
    [/Mueang\s*Ranong|Muang\s*Ranong/gi, 'อ.เมืองระนอง'],
    [/Raksawarin|Hot\s*Springs?/gi, 'บ่อน้ำร้อนรักษะวาริน'],
    [/Ranong/gi, 'จ.ระนอง'],
    [/Thailand(ia)?/gi, 'ประเทศไทย'],
    [/Soi\s*(\d+)/gi, 'ซอย $1'],
    [/Moo\s*(\d+)/gi, 'หมู่ $1'],
  ];

  for (const [pattern, rep] of replacements) {
    thAddr = thAddr.replace(pattern, rep);
  }
  return thAddr;
};

const formatProductName = (name: any) => {
  if (!name) return 'Pizza';
  let str = typeof name === 'string' ? name : (name.name || name.nameIt || 'Prodotto');
  return str.toUpperCase();
};

const parseCoordsFromAddress = (addressStr: string) => {
  if (!addressStr || typeof addressStr !== 'string') {
    return { address: addressStr || 'N/A', addressTh: addressStr || 'N/A', lat: RESTAURANT_LAT, lng: RESTAURANT_LNG };
  }

  // Extract explicit Thai address if present
  let addressTh = '';
  const thMatch = addressStr.match(/\[ADDR_TH:\s*([^\]]+)\]/i);
  if (thMatch) {
    addressTh = thMatch[1].trim();
  }

  let lat = RESTAURANT_LAT;
  let lng = RESTAURANT_LNG;

  const coordMatch = addressStr.match(/\[COORD:\s*([0-9.-]+)\s*,\s*([0-9.-]+)\]/i)
                  || addressStr.match(/\[Lat:\s*([0-9.-]+)\s*,\s*Lng:\s*([0-9.-]+)\]/i);
  if (coordMatch) {
    lat = parseFloat(coordMatch[1]);
    lng = parseFloat(coordMatch[2]);
  }

  const cleanAddress = addressStr
    .replace(/\s*\[ADDR_TH:[^\]]+\]/gi, '')
    .replace(/\s*\[(COORD|Lat)[^\]]*\]/gi, '')
    .trim();

  if (!addressTh) {
    addressTh = translateAddressToThai(cleanAddress);
  }

  return { address: cleanAddress, addressTh, lat, lng };
};

export function KitchenTabletKDS() {
  const { orders, fetchOrders, updateOrderStatus, subscribeToRealtime } = usePizzaAdminStore();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMobileTab, setSelectedMobileTab] = useState<'kitchen' | 'ready'>('kitchen');
  const [prepTimeCustom, setPrepTimeCustom] = useState<Record<string, number>>({});

  // 1. Language Toggle (🇬🇧 EN / 🇹🇭 TH)
  const [kdsLang, setKdsLang] = useState<'en' | 'th'>(() => {
    return (localStorage.getItem('kitchen_kds_lang') as 'en' | 'th') || 'th';
  });

  const changeLanguage = (lang: 'en' | 'th') => {
    setKdsLang(lang);
    localStorage.setItem('kitchen_kds_lang', lang);
  };

  // 2. Service Status & Pause Modal
  const [serviceStatus, setServiceStatus] = useState<PizzeriaServiceStatus>(DEFAULT_PIZZERIA_STATUS);
  const [serviceCalc, setServiceCalc] = useState<ServiceCalculationResult>(() => calculateServiceState(DEFAULT_PIZZERIA_STATUS));
  const [showPauseModal, setShowPauseModal] = useState(false);
  const showPauseModalRef = useRef(false);
  showPauseModalRef.current = showPauseModal;

  // Opening hours inputs and custom pause time
  const [editOpenTime, setEditOpenTime] = useState<string>('11:00');
  const [editCloseTime, setEditCloseTime] = useState<string>('21:30');
  const [customPauseMinutes, setCustomPauseMinutes] = useState<number>(45);
  const [hoursSavedSuccess, setHoursSavedSuccess] = useState<boolean>(false);

  const refreshServiceStatus = async () => {
    const st = await fetchPizzeriaStatus();
    setServiceStatus(st);
    setServiceCalc(calculateServiceState(st));
    // CRITICAL: NEVER overwrite inputs if the modal is currently open and being edited!
    if (!showPauseModalRef.current && st.openingHours) {
      setEditOpenTime(st.openingHours.openTime || '11:00');
      setEditCloseTime(st.openingHours.closeTime || '21:30');
    }
  };

  useEffect(() => {
    refreshServiceStatus();
    const interval = setInterval(refreshServiceStatus, 20000);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('flower_power_service_status');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'STATUS_UPDATED' && ev.data?.status) {
          setServiceStatus(ev.data.status);
          setServiceCalc(calculateServiceState(ev.data.status));
          // Do NOT overwrite user editing inputs if modal is currently open
          if (!showPauseModalRef.current && ev.data.status.openingHours) {
            setEditOpenTime(ev.data.status.openingHours.openTime || '11:00');
            setEditCloseTime(ev.data.status.openingHours.closeTime || '21:30');
          }
        }
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

  // Open Pause / Schedule Modal
  const handleOpenPauseModal = () => {
    if (serviceStatus.openingHours) {
      setEditOpenTime(serviceStatus.openingHours.openTime || '11:00');
      setEditCloseTime(serviceStatus.openingHours.closeTime || '21:30');
    }
    setShowPauseModal(true);
  };

  // Save Opening Hours
  const handleSaveOpeningHours = async () => {
    const newOpeningHours = {
      openTime: editOpenTime,
      closeTime: editCloseTime,
      closedDays: serviceStatus.openingHours?.closedDays || []
    };

    // 1. Immediately apply optimistic state
    const optimistic: PizzeriaServiceStatus = {
      ...serviceStatus,
      openingHours: newOpeningHours,
      lastUpdated: new Date().toISOString()
    };
    setServiceStatus(optimistic);
    setServiceCalc(calculateServiceState(optimistic));
    setHoursSavedSuccess(true);

    // 2. Persist to API & Supabase
    const updated = await updatePizzeriaStatus({
      openingHours: newOpeningHours
    });

    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    if (updated.openingHours) {
      setEditOpenTime(updated.openingHours.openTime);
      setEditCloseTime(updated.openingHours.closeTime);
    }

    setTimeout(() => {
      setHoursSavedSuccess(false);
      setShowPauseModal(false);
    }, 1200);
  };

  // Force Open Now (start service immediately in Thailand time even if before regular open time)
  const handleForceOpenNow = async () => {
    const bangkok = getBangkokTime();
    const newOpen = bangkok.timeStr;

    const newOpeningHours = {
      ...serviceStatus.openingHours,
      openTime: newOpen
    };

    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: null,
      pauseReason: '',
      openingHours: newOpeningHours
    });
    setEditOpenTime(newOpen);
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setShowPauseModal(false);
  };

  // Set Pause / Resume handlers
  const handleApplyPause = async (minutes: number) => {
    const pauseUntil = new Date(Date.now() + minutes * 60000).toISOString();
    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: pauseUntil,
      pauseReason: 'busy'
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setShowPauseModal(false);
  };

  const handleStopTonight = async () => {
    const updated = await updatePizzeriaStatus({
      isOpen: false,
      pausedUntil: null,
      pauseReason: 'closed_tonight'
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setShowPauseModal(false);
  };

  const handleResumeService = async () => {
    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: null,
      pauseReason: ''
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setShowPauseModal(false);
  };

  // 3. Clock timer - ALWAYS Thailand / Ranong local time (Asia/Bangkok, UTC+7)
  useEffect(() => {
    const updateClock = () => {
      const bangkok = getBangkokTime();
      setCurrentTime(bangkok.fullTimeStr);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 4. Fetch orders and subscribe to Supabase Realtime
  useEffect(() => {
    fetchOrders();
    const unsubscribe = subscribeToRealtime();
    return () => {
      unsubscribe();
      stopContinuousAlarm();
      stopDispatchReminderAlarm();
      releaseScreenWakeLock();
    };
  }, []);

  // 5. Screen Wake Lock
  useEffect(() => {
    const acquireLock = async () => {
      const ok = await requestScreenWakeLock();
      setWakeLockActive(ok);
    };

    acquireLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        acquireLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseScreenWakeLock();
    };
  }, []);

  // Timestamps when orders were accepted into preparation (persisted to localStorage)
  const [acceptedTimestamps, setAcceptedTimestamps] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('kitchen_accepted_timestamps');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Set of order IDs whose 15-minute dispatch reminder has been manually snoozed/silenced
  const [silencedReminderIds, setSilencedReminderIds] = useState<Set<string>>(() => new Set());

  // Set of order IDs acknowledged/handled by staff for new incoming buzzer
  const [acknowledgedOrderIds, setAcknowledgedOrderIds] = useState<Set<string>>(() => new Set());

  // 6. Group into 2 PHASES:
  // Phase 1: In Kitchen (New orders to accept)
  const kitchenOrders = useMemo(() => {
    return orders.filter(o => o.status === 'new' || (o.status as any) === 'received');
  }, [orders]);

  // Phase 2: In Preparation & Delivering (Orders confirmed, cooking or out for delivery)
  const readyOrders = useMemo(() => {
    return orders.filter(o => o.status === 'preparing' || o.status === 'delivering' || (o.status as any) === 'ready');
  }, [orders]);

  // Helper to calculate minutes spent in preparation
  const getElapsedPrepMinutes = (order: PizzaOrder) => {
    const acceptedAt = acceptedTimestamps[String(order.id)];
    if (acceptedAt) {
      return Math.floor((Date.now() - acceptedAt) / 60000);
    }
    if (order.created_at) {
      return Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
    }
    return 0;
  };

  // Truly unacknowledged new orders trigger the buzzer
  const unacknowledgedNewOrders = useMemo(() => {
    return orders.filter(o => (o.status === 'new' || (o.status as any) === 'received') && !acknowledgedOrderIds.has(String(o.id)));
  }, [orders, acknowledgedOrderIds]);

  // Phase 2 orders cooking for 15+ minutes that need rider dispatch reminder
  const overdueDispatchOrders = useMemo(() => {
    return readyOrders.filter(o => {
      if (o.status !== 'preparing') return false;
      const mins = getElapsedPrepMinutes(o);
      return mins >= 15 && !silencedReminderIds.has(String(o.id));
    });
  }, [readyOrders, acceptedTimestamps, silencedReminderIds, currentTime]);

  // 7. Sound Alarm Management (Urgent Alarm for New Orders + Gentle Chime for 15-min Dispatch Reminder)
  useEffect(() => {
    if (soundMuted) {
      stopContinuousAlarm();
      stopDispatchReminderAlarm();
      return;
    }

    // Priority 1: High-urgency loud alarm for unacknowledged new orders
    if (unacknowledgedNewOrders.length > 0) {
      stopDispatchReminderAlarm();
      startContinuousAlarm();
    } else {
      stopContinuousAlarm();

      // Priority 2: Gentle melodic reminder chime for orders cooking for 15+ minutes
      if (overdueDispatchOrders.length > 0) {
        startDispatchReminderAlarm();
      } else {
        stopDispatchReminderAlarm();
      }
    }
  }, [unacknowledgedNewOrders.length, overdueDispatchOrders.length, soundMuted]);

  const handleSilenceAlarm = () => {
    stopContinuousAlarm();
    stopDispatchReminderAlarm();
    setAcknowledgedOrderIds(prev => {
      const next = new Set(prev);
      unacknowledgedNewOrders.forEach(o => next.add(String(o.id)));
      return next;
    });
    setSilencedReminderIds(prev => {
      const next = new Set(prev);
      overdueDispatchOrders.forEach(o => next.add(String(o.id)));
      return next;
    });
  };

  const handleSnoozeReminder = (orderId: string) => {
    initKitchenAudio();
    setSilencedReminderIds(prev => new Set(prev).add(String(orderId)));
  };

  // Actions
  const handleAcceptOrder = async (orderId: string, minutes: number = 30) => {
    initKitchenAudio();
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => new Set(prev).add(String(orderId)));
    setAcceptedTimestamps(prev => {
      const next = { ...prev, [orderId]: Date.now() };
      try { localStorage.setItem('kitchen_accepted_timestamps', JSON.stringify(next)); } catch (e) {}
      return next;
    });
    await updateOrderStatus(orderId, 'preparing');
  };

  const handleOrderReady = async (orderId: string) => {
    initKitchenAudio();
    setSilencedReminderIds(prev => new Set(prev).add(String(orderId)));
    await updateOrderStatus(orderId, 'delivering');
  };

  const handleOrderCompleted = async (orderId: string) => {
    initKitchenAudio();
    setSilencedReminderIds(prev => new Set(prev).add(String(orderId)));
    await updateOrderStatus(orderId, 'completed');
  };

  const handleOrderCancelled = async (orderId: string) => {
    initKitchenAudio();
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => new Set(prev).add(String(orderId)));
    setSilencedReminderIds(prev => new Set(prev).add(String(orderId)));
    await updateOrderStatus(orderId, 'cancelled');
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Elapsed minutes helper
  const getElapsedMinutes = (dateStr: string) => {
    if (!dateStr) return 0;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diffMs / 60000);
  };

  // Dictionary for UI strings based on kdsLang
  const t = {
    kitchenTitle: kdsLang === 'th' ? 'ครัวพิซซ่า' : 'KITCHEN MONITOR',
    brandSubtitle: kdsLang === 'th' ? 'ฟลาวเวอร์ พาวเวอร์ พิซซ่า ระนอง' : 'FLOWER POWER PIZZA RANONG',
    col1Title: kdsLang === 'th' ? 'ออเดอร์ใหม่ (รอรับ & เริ่มทำ)' : 'NEW ORDERS (TO ACCEPT)',
    col2Title: kdsLang === 'th' ? 'กำลังเตรียม & กำลังส่ง' : 'PREPARING & DELIVERING',
    noKitchenOrders: kdsLang === 'th' ? 'ไม่มีออเดอร์ใหม่' : 'NO NEW ORDERS',
    noKitchenSub: kdsLang === 'th' ? 'แท็บเล็ตจะส่งเสียงเตือนเมื่อมีออเดอร์ใหม่เข้ามา' : 'Tablet will ring when a new order arrives.',
    noReadyOrders: kdsLang === 'th' ? 'ไม่มีออเดอร์กำลังทำหรือส่ง' : 'NO ORDERS IN PREPARATION',
    noReadySub: kdsLang === 'th' ? 'ออเดอร์ที่รับแล้วจะแสดงที่นี่เพื่อจัดเตรียมและส่ง' : 'Accepted orders will appear here for preparation & delivery.',
    acceptBtn: kdsLang === 'th' ? 'รับออเดอร์' : 'ACCEPT ORDER',
    muteBtn: kdsLang === 'th' ? 'ปิดเสียง' : 'MUTE',
    muteAlarmBar: kdsLang === 'th' ? 'ปิดเสียงเตือน' : 'MUTE ALARM',
    dispatchRiderBtn: kdsLang === 'th' ? '🛵 ไรเดอร์ออกไปส่งแล้ว' : '🛵 DISPATCH RIDER (OUT)',
    bakedBtn: kdsLang === 'th' ? 'อบเสร็จแล้ว ➔ ส่งให้ไรเดอร์' : 'BAKED ➔ READY FOR RIDER',
    directArchiveBtn: kdsLang === 'th' ? '✓ ปิดงานทันที' : '✓ ARCHIVE DIRECTLY',
    deliveredBtn: kdsLang === 'th' ? '✓ ส่งเรียบร้อยแล้ว / บันทึกประวัติ' : '✓ DELIVERED & ARCHIVED',
    cancelBtn: kdsLang === 'th' ? '✕ ยกเลิก' : '✕ CANCEL',
    minAgo: kdsLang === 'th' ? 'นาทีที่แล้ว' : 'm ago',
    cookingFor: kdsLang === 'th' ? 'กำลังอบ' : 'COOKING',
    min: kdsLang === 'th' ? 'นาที' : 'min',
    newBadge: kdsLang === 'th' ? 'ออเดอร์ใหม่' : 'NEW ORDER',
    callBtn: kdsLang === 'th' ? 'โทร' : 'CALL',
    notifyCustBtn: kdsLang === 'th' ? 'แจ้งลูกค้า' : 'NOTIFY CUSTOMER',
    sendRiderBtn: kdsLang === 'th' ? 'ส่งไรเดอร์' : 'RIDER MAP',
    mapBtn: kdsLang === 'th' ? 'แผนที่' : 'MAP',
    screenOn: kdsLang === 'th' ? 'เปิดจอค้าง' : 'SCREEN ON',
    testSound: kdsLang === 'th' ? 'ทดสอบ 🔔' : 'TEST 🔔',
    serviceOpen: kdsLang === 'th' ? 'เปิดรับออเดอร์' : 'ONLINE: OPEN',
    servicePaused: kdsLang === 'th' ? 'พักรับออเดอร์' : 'ONLINE: PAUSED',
    serviceClosed: kdsLang === 'th' ? 'ปิดตามเวลา' : 'ONLINE: CLOSED',
    hoursTitle: kdsLang === 'th' ? 'เวลาเปิด - ปิดร้าน' : 'OPENING & CLOSING HOURS',
    openTimeLabel: kdsLang === 'th' ? 'เวลาเปิด:' : 'Open Time:',
    closeTimeLabel: kdsLang === 'th' ? 'เวลาปิด:' : 'Close Time:',
    saveHoursBtn: kdsLang === 'th' ? 'บันทึกเวลาเปิด-ปิด' : 'SAVE HOURS',
    hoursSaved: kdsLang === 'th' ? 'บันทึกเรียบร้อย!' : 'HOURS SAVED!',
    customPauseLabel: kdsLang === 'th' ? 'กำหนดเวลาหยุดพักเอง (นาที):' : 'Custom Pause Duration (min):',
    applyCustomPause: kdsLang === 'th' ? 'ตั้งเวลาพัก' : 'SET PAUSE',
    openNowEarly: kdsLang === 'th' ? 'เปิดรับออเดอร์ทันที (เริ่มบริการ)' : 'START SERVICE NOW (OPEN EARLY)',
    sizeLabel: kdsLang === 'th' ? 'ขนาด' : 'Size',
    extraLabel: kdsLang === 'th' ? 'พิเศษ' : 'Extra',
    dispatchReminderBadge: kdsLang === 'th' ? '⏰ เกิน 15 นาที: ไรเดอร์ออกส่งหรือยัง?' : '⏰ 15+ MIN: DISPATCH RIDER!',
    snoozeReminderBtn: kdsLang === 'th' ? 'ปิดเสียงเตือน' : 'SNOOZE CHIME',
  };

  return (
    <div 
      className="min-h-screen bg-[#0b0e14] text-white flex flex-col font-sans select-none antialiased"
      onClick={() => initKitchenAudio()}
    >
      {/* ─── TOP KITCHEN STATUS BAR (NO BACK ARROW, OFFICIAL LOGO) ──────────────── */}
      <header className="bg-[#131722] border-b-2 border-stone-800 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shrink-0">
        
        {/* Left: Official Brand Logo + Title + Clock */}
        <div className="flex items-center gap-3">
          <img 
            src="/flower-power-pizza-emblem.png" 
            alt="Flower Power Pizza" 
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          />

          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-none">
              {t.kitchenTitle}
            </h1>
            <span className="text-[11px] font-bold text-amber-400">
              {t.brandSubtitle}
            </span>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center px-3 py-1 rounded-xl bg-[#080a0f] border border-stone-800 font-mono tracking-wider leading-tight">
            <div className="flex items-center gap-1.5 text-base lg:text-lg font-black text-amber-400">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{currentTime}</span>
            </div>
            <span className="text-[10px] font-bold text-stone-500 tracking-normal flex items-center gap-1">
              <span>🇹🇭 Ranong</span>
              <span className="text-amber-500/80 font-mono">UTC+7</span>
            </span>
          </div>
        </div>

        {/* Center: Mobile 2-Phase Switcher (only shown on small screens) */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => setSelectedMobileTab('kitchen')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedMobileTab === 'kitchen'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            <span>{t.col1Title.split('(')[0]}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-white text-[11px]">
              {kitchenOrders.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedMobileTab('ready')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedMobileTab === 'ready'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            <span>{t.col2Title.split('(')[0]}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-white text-[11px]">
              {readyOrders.length}
            </span>
          </button>
        </div>

        {/* Right: Controls & Language Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Quick Mute Alarm button when alarm is buzzing */}
          {unacknowledgedNewOrders.length > 0 && !soundMuted && (
            <button
              type="button"
              onClick={handleSilenceAlarm}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 animate-bounce shadow-lg shadow-red-600/50 cursor-pointer border border-white/40"
              title={t.muteAlarmBar}
            >
              <BellOff className="w-4 h-4 stroke-[3]" />
              <span>{t.muteAlarmBar}</span>
            </button>
          )}

          {/* Quick Mute Dispatch Reminder chime when sounding */}
          {unacknowledgedNewOrders.length === 0 && overdueDispatchOrders.length > 0 && !soundMuted && (
            <button
              type="button"
              onClick={handleSilenceAlarm}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-lg shadow-amber-500/40 cursor-pointer border border-amber-300"
              title={t.snoozeReminderBtn}
            >
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span>{kdsLang === 'th' ? `เตือนส่ง: ${overdueDispatchOrders.length}` : `DISPATCH: ${overdueDispatchOrders.length}`}</span>
            </button>
          )}

          {/* Service Status / Pause Management Button */}
          <button
            onClick={handleOpenPauseModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 border transition-all cursor-pointer ${
              serviceCalc.state === 'OPEN'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                : serviceCalc.state === 'PAUSED'
                  ? 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse hover:bg-amber-900 shadow-md shadow-amber-600/30'
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white'
            }`}
            title="Manage delivery service, pause & opening hours"
          >
            {serviceCalc.state === 'OPEN' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">{t.serviceOpen}</span>
              </>
            ) : serviceCalc.state === 'PAUSED' ? (
              <>
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span>
                  {kdsLang === 'th' ? `พัก: ${serviceCalc.remainingMinutes} น.` : `PAUSED: ${serviceCalc.remainingMinutes}m`}
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-300" />
                <span>
                  {kdsLang === 'th' ? `ปิด (เปิด ${serviceStatus.openingHours?.openTime || '11:00'})` : `CLOSED (OPENS ${serviceStatus.openingHours?.openTime || '11:00'})`}
                </span>
              </>
            )}
          </button>

          {/* Language Switcher Toggle (🇬🇧 EN / 🇹🇭 TH) */}
          <div className="flex items-center rounded-xl bg-[#090b0f] p-0.5 border border-stone-700">
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                kdsLang === 'en' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Switch to English"
            >
              <span className="text-sm">🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('th')}
              className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                kdsLang === 'th' 
                  ? 'bg-amber-500 text-stone-950 shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
              title="เปลี่ยนเป็นภาษาไทย"
            >
              <span className="text-sm">🇹🇭</span>
              <span>TH</span>
            </button>
          </div>

          {/* Screen Wake Lock Status Badge */}
          <button
            onClick={() => requestScreenWakeLock().then(ok => setWakeLockActive(ok))}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
              wakeLockActive 
                ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300' 
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
            }`}
            title={wakeLockActive ? 'Screen stay-awake ON' : 'Tap to keep screen awake'}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${wakeLockActive ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'}`} />
            <span className="hidden lg:inline">{t.screenOn}</span>
          </button>

          {/* Sound Alarm Toggle */}
          <button
            onClick={() => {
              if (soundMuted) {
                setSoundMuted(false);
                testKitchenAlarm();
              } else {
                setSoundMuted(true);
                stopContinuousAlarm();
                stopDispatchReminderAlarm();
              }
            }}
            className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
              soundMuted 
                ? 'bg-red-950 border-red-700 text-red-300' 
                : 'bg-stone-800 border-stone-700 text-emerald-400 hover:bg-stone-700'
            }`}
            title={soundMuted ? 'Unmute buzzer' : 'Mute buzzer'}
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Test Sound Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playGentleReminderChime();
            }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-black cursor-pointer"
            title="Test 15-min dispatch reminder alarm"
          >
            {t.testSound}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen kiosk'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ─── MAIN 2-PHASE KITCHEN BOARD (50% / 50% SPLIT) ────────────────── */}
      <main className="flex-1 p-2 sm:p-3 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* ─── PHASE 1: IN KITCHEN (TO PREPARE & COOK) ────────────────────── */}
        <section className={`flex flex-col bg-[#11141c] border-2 rounded-2xl overflow-hidden ${
          unacknowledgedNewOrders.length > 0 ? 'border-red-600 shadow-xl shadow-red-950/40' : 'border-stone-800'
        } ${selectedMobileTab !== 'kitchen' ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Column Header */}
          <div className="bg-[#181d28] px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <h2 className="font-black text-sm lg:text-base uppercase tracking-wider text-red-400 flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${unacknowledgedNewOrders.length > 0 ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`} />
              <span>{t.col1Title}</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-mono">
                {kitchenOrders.length}
              </span>
            </h2>

            {unacknowledgedNewOrders.length > 0 && (
              <span className="text-[11px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full uppercase animate-pulse shadow">
                🔔 RINGING
              </span>
            )}
          </div>

          {/* Orders Scrollable Container */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {kitchenOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500">
                <CheckCircle className="w-16 h-16 text-stone-700 mb-3" />
                <p className="font-black text-base uppercase text-stone-400">{t.noKitchenOrders}</p>
                <p className="text-xs text-stone-600 mt-1 max-w-sm">{t.noKitchenSub}</p>
              </div>
            ) : (
              kitchenOrders.map(order => {
                const elapsed = getElapsedMinutes(order.created_at);
                const items = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
                const { address, addressTh, lat, lng } = parseCoordsFromAddress(order.address);
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';

                return (
                  <div 
                    key={order.id}
                    className="bg-[#171c26] border-2 border-red-500 rounded-2xl p-3.5 shadow-xl shadow-red-950/40 flex flex-col gap-3 transition-all animate-pulse"
                  >
                    {/* Header: Order Number, Elapsed Time & Total */}
                    <div className="flex items-center justify-between border-b border-stone-700/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-2xl text-white tracking-wider font-mono">
                          #{orderNumber}
                        </span>
                        <span className="text-xs font-black px-2.5 py-1 rounded-md bg-red-600 text-white uppercase tracking-wider animate-bounce">
                          🚨 {t.newBadge} ({elapsed} {t.minAgo})
                        </span>
                      </div>
                      <span className="font-black text-xl text-emerald-400 font-mono">
                        {order.total} ฿
                      </span>
                    </div>

                    {/* Customer & Address (Clean text + Maps button, no phone dialer / no WhatsApp) */}
                    <div className="text-xs space-y-1 text-stone-300">
                      <div className="font-black text-white text-sm flex items-center justify-between">
                        <span>👤 {order.customer_name}</span>
                        <span className="px-2.5 py-1 bg-stone-800 text-amber-300 rounded-lg text-xs font-mono font-bold">
                          📞 {order.phone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="text-stone-300 text-xs flex items-center gap-1.5 truncate flex-1 font-medium">
                          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="truncate">{kdsLang === 'th' ? addressTh : address}</span>
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-800 text-blue-300 hover:text-white border border-blue-600/40 text-[11px] font-black flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          title="Open Maps"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t.mapBtn}</span>
                        </a>
                      </div>
                    </div>

                    {/* Giant Items List */}
                    <div className="bg-[#0b0e14] p-3 rounded-xl border border-stone-800 space-y-3">
                      {items.map((item, idx) => {
                        const nameEn = formatProductName(item.name);
                        const thaiName = getThaiName(item);
                        const displayName = kdsLang === 'th' ? (thaiName || nameEn) : nameEn;
                        const subName = kdsLang === 'th' ? (thaiName ? nameEn : '') : thaiName;
                        const variant = item.selectedVariant ? (typeof item.selectedVariant === 'object' ? item.selectedVariant.name : String(item.selectedVariant)) : '';
                        const extras = Array.isArray(item.selectedExtras) ? item.selectedExtras : [];

                        return (
                          <div key={idx} className="border-b border-stone-800/80 last:border-0 pb-2.5 last:pb-0">
                            <div className="flex items-baseline gap-2.5">
                              <span className="font-black text-xl lg:text-2xl text-amber-400 font-mono shrink-0">
                                {item.quantity}x
                              </span>
                              <div className="flex-1">
                                <span className="font-black text-base lg:text-lg text-white leading-tight block">
                                  {displayName}
                                </span>
                                {subName && (
                                  <span className="text-xs font-semibold text-stone-400 block mt-0.5">
                                    {subName}
                                  </span>
                                )}
                                {variant && (
                                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wide block mt-0.5">
                                    {t.sizeLabel}: {variant}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Extra ingredients translated universally */}
                            {extras.length > 0 && (
                              <div className="mt-1.5 pl-7 flex flex-wrap gap-1">
                                {extras.map((ex: any, exIdx: number) => {
                                  const exName = getExtraDisplayName(ex, kdsLang);
                                  return (
                                    <span 
                                      key={exIdx}
                                      className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-xs uppercase"
                                    >
                                      + {exName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* NEW ORDER ACTIONS: ACCEPT OR MUTE */}
                    <div className="pt-1 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptOrder(order.id, prepTimeCustom[order.id] || 30)}
                          className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
                        >
                          <CheckCircle className="w-5 h-5 text-white stroke-[3]" />
                          <span>{t.acceptBtn} ({prepTimeCustom[order.id] || 30} {t.min})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            stopContinuousAlarm();
                            setAcknowledgedOrderIds(prev => new Set(prev).add(String(order.id)));
                          }}
                          className="px-4 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-white font-black text-xs uppercase tracking-wider border border-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-transform"
                          title={t.muteBtn}
                        >
                          <BellOff className="w-4 h-4 text-red-400" />
                          <span>{t.muteBtn}</span>
                        </button>
                      </div>

                      {/* Fast prep time selector + Cancel */}
                      <div className="flex items-center gap-1.5">
                        {[20, 30, 45].map(min => (
                          <button
                            key={min}
                            type="button"
                            onClick={() => setPrepTimeCustom(prev => ({ ...prev, [order.id]: min }))}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-colors cursor-pointer ${
                              (prepTimeCustom[order.id] || 30) === min 
                                ? 'bg-amber-400 text-stone-950' 
                                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
                            }`}
                          >
                            {min} {t.min}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleOrderCancelled(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-red-950 text-stone-400 hover:text-red-400 text-xs font-bold border border-stone-700 cursor-pointer transition-colors"
                          title="Reject/Cancel"
                        >
                          {t.cancelBtn}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ─── PHASE 2: READY FOR RIDER & DELIVERING ──────────────────────── */}
        <section className={`flex flex-col bg-[#11141c] border-2 border-stone-800 rounded-2xl overflow-hidden ${
          selectedMobileTab !== 'ready' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Column Header */}
          <div className="bg-[#181d28] px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <h2 className="font-black text-sm lg:text-base uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Bike className="w-4 h-4 text-blue-500" />
              <span>{t.col2Title}</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-mono">
                {readyOrders.length}
              </span>
            </h2>
          </div>

          {/* Orders Scrollable Container */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500">
                <Bike className="w-16 h-16 text-stone-700 mb-3" />
                <p className="font-black text-base uppercase text-stone-400">{t.noReadyOrders}</p>
                <p className="text-xs text-stone-600 mt-1 max-w-sm">{t.noReadySub}</p>
              </div>
            ) : (
              readyOrders.map(order => {
                const elapsed = getElapsedMinutes(order.created_at);
                const elapsedPrep = getElapsedPrepMinutes(order);
                const isOverdue = order.status === 'preparing' && elapsedPrep >= 15;
                const items = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
                const { address, addressTh, lat, lng } = parseCoordsFromAddress(order.address);
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';
                const isDelivering = order.status === 'delivering';

                return (
                  <div 
                    key={order.id}
                    className={`bg-[#171c26] border-2 rounded-2xl p-3.5 shadow-lg flex flex-col gap-3 transition-all ${
                      isDelivering 
                        ? 'border-blue-500/80 shadow-blue-950/40' 
                        : isOverdue 
                          ? 'border-amber-400 border-dashed shadow-amber-500/30 ring-2 ring-amber-400/30' 
                          : 'border-amber-500/80 shadow-amber-950/30'
                    }`}
                  >
                    {/* Header: Order Number, Status Badge & Total */}
                    <div className="flex items-center justify-between border-b border-stone-700/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-2xl text-white tracking-wider font-mono">
                          #{orderNumber}
                        </span>
                        {isDelivering ? (
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-600 text-white uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                            <Bike className="w-3.5 h-3.5" />
                            <span>{kdsLang === 'th' ? 'ไรเดอร์กำลังไปส่ง' : 'DELIVERING'}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-500 text-stone-950 uppercase tracking-wider flex items-center gap-1 font-black">
                            <Flame className="w-3.5 h-3.5 text-stone-950" />
                            <span>{t.cookingFor} {elapsed} {t.min}</span>
                          </span>
                        )}
                      </div>
                      <span className="font-black text-xl text-emerald-400 font-mono">
                        {order.total} ฿
                      </span>
                    </div>

                    {/* 15+ Minutes Dispatch Alert Banner */}
                    {isOverdue && !isDelivering && (
                      <div className="bg-amber-500/20 border border-amber-400/80 text-amber-200 px-3 py-2 rounded-xl flex items-center justify-between text-xs font-black animate-pulse">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0 stroke-[2.5]" />
                          <span>{t.dispatchReminderBadge} ({elapsedPrep} {t.min})</span>
                        </div>
                        {!silencedReminderIds.has(String(order.id)) && (
                          <button
                            type="button"
                            onClick={() => handleSnoozeReminder(order.id)}
                            className="px-2 py-1 rounded bg-amber-400 text-stone-950 text-[10px] font-black uppercase hover:bg-amber-300 cursor-pointer shadow"
                            title={t.snoozeReminderBtn}
                          >
                            {t.snoozeReminderBtn}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Customer & Address + Open Maps Button (NO TEL/NO WHATSAPP) */}
                    <div className="text-xs space-y-1.5 text-stone-300">
                      <div className="font-black text-white text-sm flex items-center justify-between">
                        <span>👤 {order.customer_name}</span>
                        <span className="px-2.5 py-1 bg-stone-800 text-amber-300 rounded-lg text-xs font-mono font-bold">
                          📞 {order.phone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="text-stone-300 text-xs flex items-center gap-1.5 truncate flex-1 font-medium">
                          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="truncate">{kdsLang === 'th' ? addressTh : address}</span>
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shrink-0 transition-transform shadow-md cursor-pointer"
                          title="Open Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t.mapBtn}</span>
                        </a>
                      </div>
                    </div>

                    {/* Full Ordered Items List with Universal Translated Extras */}
                    <div className="bg-[#0b0e14] p-3 rounded-xl border border-stone-800 space-y-3">
                      {items.map((item, idx) => {
                        const nameEn = formatProductName(item.name);
                        const thaiName = getThaiName(item);
                        const displayName = kdsLang === 'th' ? (thaiName || nameEn) : nameEn;
                        const subName = kdsLang === 'th' ? (thaiName ? nameEn : '') : thaiName;
                        const variant = item.selectedVariant ? (typeof item.selectedVariant === 'object' ? item.selectedVariant.name : String(item.selectedVariant)) : '';
                        const extras = Array.isArray(item.selectedExtras) ? item.selectedExtras : [];

                        return (
                          <div key={idx} className="border-b border-stone-800/80 last:border-0 pb-2.5 last:pb-0">
                            <div className="flex items-baseline gap-2.5">
                              <span className="font-black text-xl lg:text-2xl text-amber-400 font-mono shrink-0">
                                {item.quantity}x
                              </span>
                              <div className="flex-1">
                                <span className="font-black text-base lg:text-lg text-white leading-tight block">
                                  {displayName}
                                </span>
                                {subName && (
                                  <span className="text-xs font-semibold text-stone-400 block mt-0.5">
                                    {subName}
                                  </span>
                                )}
                                {variant && (
                                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wide block mt-0.5">
                                    {t.sizeLabel}: {variant}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Extra ingredients translated universally */}
                            {extras.length > 0 && (
                              <div className="mt-1.5 pl-7 flex flex-wrap gap-1">
                                {extras.map((ex: any, exIdx: number) => {
                                  const exName = getExtraDisplayName(ex, kdsLang);
                                  return (
                                    <span 
                                      key={exIdx}
                                      className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-xs uppercase"
                                    >
                                      + {exName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons for Phase 2 */}
                    {!isDelivering ? (
                      /* Status is 'preparing': Dispatch Rider OR Direct Archive */
                      <div className="pt-1 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleOrderReady(order.id)}
                          className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform ${
                            isOverdue 
                              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 hover:from-amber-400 hover:to-blue-500 text-white animate-pulse shadow-amber-500/30' 
                              : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                          }`}
                        >
                          <Bike className="w-5 h-5 text-white" />
                          <span>{t.dispatchRiderBtn} {isOverdue ? `(15+ ${t.min})` : ''}</span>
                        </button>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOrderCompleted(order.id)}
                            className="flex-1 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 active:scale-95 text-emerald-100 hover:text-white font-bold text-xs uppercase tracking-wider border border-emerald-600 transition-colors cursor-pointer"
                          >
                            {t.directArchiveBtn}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOrderCancelled(order.id)}
                            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 font-bold text-xs uppercase border border-stone-700 transition-colors cursor-pointer"
                          >
                            {t.cancelBtn}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Status is 'delivering': Delivered & Archived */
                      <div className="pt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOrderCompleted(order.id)}
                          className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider border border-emerald-500 shadow-lg cursor-pointer transition-transform flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5 text-white stroke-[2.5]" />
                          <span>{t.deliveredBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOrderCancelled(order.id)}
                          className="px-3 py-3.5 rounded-xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 font-bold text-xs uppercase border border-stone-700 transition-colors cursor-pointer"
                        >
                          {t.cancelBtn}
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>

      {/* ─── PAUSE & SERVICE MANAGEMENT MODAL ────────────────────────────── */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b26] border-2 border-stone-700 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-6 h-6 text-amber-400" />
                <h3 className="font-black text-lg text-white uppercase">
                  {kdsLang === 'th' ? 'จัดการบริการเดลิเวอรี่' : 'MANAGE DELIVERY SERVICE'}
                </h3>
              </div>
              <button
                onClick={() => setShowPauseModal(false)}
                className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current State Info */}
            <div className="p-3.5 rounded-2xl bg-[#0d1017] border border-stone-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-bold">
                  {kdsLang === 'th' ? 'สถานะปัจจุบัน:' : 'Current Status:'}
                </span>
                <span className={`font-black uppercase px-2.5 py-1 rounded-md text-xs ${
                  serviceCalc.state === 'OPEN' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' 
                    : serviceCalc.state === 'PAUSED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                      : 'bg-stone-800 text-stone-300 border border-stone-700'
                }`}>
                  {serviceCalc.state === 'OPEN' ? t.serviceOpen : serviceCalc.state === 'PAUSED' ? t.servicePaused : t.serviceClosed}
                </span>
              </div>

              {serviceCalc.state === 'PAUSED' && serviceCalc.remainingMinutes > 0 && (
                <div className="flex justify-between items-center pt-1 text-amber-400 font-bold border-t border-stone-800/80">
                  <span>{kdsLang === 'th' ? 'จะเปิดรับในอีก:' : 'Reopening In:'}</span>
                  <span>{serviceCalc.remainingMinutes} {t.min} ({serviceCalc.reopenTimeFormatted})</span>
                </div>
              )}

              {serviceCalc.state === 'CLOSED_OFF_HOURS' && (
                <div className="flex justify-between items-center pt-1 text-stone-300 font-bold border-t border-stone-800/80">
                  <span>{kdsLang === 'th' ? 'เวลาเปิดตามรอบ:' : 'Regular Opening:'}</span>
                  <span>{serviceStatus.openingHours.openTime} - {serviceStatus.openingHours.closeTime}</span>
                </div>
              )}
            </div>

            {/* Quick Action: REOPEN NOW OR OPEN EARLY */}
            {serviceCalc.state === 'PAUSED' && (
              <button
                type="button"
                onClick={handleResumeService}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                <PlayCircle className="w-5 h-5 text-white stroke-[2.5]" />
                <span>{kdsLang === 'th' ? 'เปิดรับออเดอร์ทันที' : 'REOPEN ONLINE ORDERS NOW'}</span>
              </button>
            )}

            {serviceCalc.state === 'CLOSED_OFF_HOURS' && (
              <button
                type="button"
                onClick={handleForceOpenNow}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                <PlayCircle className="w-4 h-4 text-white stroke-[2.5]" />
                <span>{t.openNowEarly}</span>
              </button>
            )}

            {/* SECTION 1: PAUSE BUTTONS (30 MIN, 60 MIN & CUSTOM TIME) */}
            <div className="space-y-2 pt-1 border-t border-stone-800">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                {kdsLang === 'th' ? '⏸️ พักรับออเดอร์ชั่วคราว:' : '⏸️ TEMPORARY PAUSE:'}
              </span>

              {/* 30 Min and 60 Min */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPause(30)}
                  className="py-3 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-black text-xs uppercase border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <span>⏸️ 30 {t.min}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPause(60)}
                  className="py-3 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-black text-xs uppercase border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <span>⏸️ 60 {t.min}</span>
                </button>
              </div>

              {/* Custom Pause Duration Input */}
              <div className="pt-1 space-y-1">
                <label className="text-[11px] font-bold text-stone-400 block">
                  {t.customPauseLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    value={customPauseMinutes}
                    onChange={(e) => setCustomPauseMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                    className="w-24 px-3 py-2 bg-[#090b0e] border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPause(customPauseMinutes)}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow"
                  >
                    {t.applyCustomPause} ({customPauseMinutes} {t.min})
                  </button>
                </div>
              </div>

              {/* Stop For Tonight Button */}
              <button
                type="button"
                onClick={handleStopTonight}
                className="w-full py-2.5 rounded-xl bg-red-950/70 hover:bg-red-800 text-red-200 font-black text-xs uppercase border border-red-700/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors mt-2"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>{kdsLang === 'th' ? 'ปิดรับออเดอร์สำหรับคืนนี้' : 'STOP ORDERS FOR TONIGHT'}</span>
              </button>
            </div>

            {/* SECTION 2: OPENING & CLOSING HOURS CONFIGURATION */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-300 uppercase tracking-wider block">
                  🕒 {t.hoursTitle}
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>🇹🇭</span>
                  <span>Ranong (UTC+7)</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-400 block mb-1">
                    {t.openTimeLabel}
                  </label>
                  <input
                    type="time"
                    value={editOpenTime}
                    onChange={(e) => setEditOpenTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#090b0e] border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-400 block mb-1">
                    {t.closeTimeLabel}
                  </label>
                  <input
                    type="time"
                    value={editCloseTime}
                    onChange={(e) => setEditCloseTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#090b0e] border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveOpeningHours}
                className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow ${
                  hoursSavedSuccess 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:text-white'
                }`}
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>{hoursSavedSuccess ? t.hoursSaved : t.saveHoursBtn}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
