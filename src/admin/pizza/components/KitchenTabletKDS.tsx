import React, { useState, useEffect, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { usePizzaAdminStore, PizzaOrder } from '../store/usePizzaAdminStore';
import { 
  initKitchenAudio, 
  startContinuousAlarm, 
  stopContinuousAlarm, 
  testKitchenAlarm,
  requestScreenWakeLock, 
  releaseScreenWakeLock 
} from '../utils/kitchenAudioWakeLock';
import { menuData } from '../../../pizza/data/menuData';
import { 
  fetchPizzeriaStatus, 
  updatePizzeriaStatus, 
  calculateServiceState, 
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
menuData.forEach(cat => {
  cat.items.forEach((it: any) => {
    if (it.name) {
      menuThaiLookup[it.name.trim().toLowerCase()] = it.nameTh || '';
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

const formatWhatsAppPhone = (rawPhone: string) => {
  let clean = rawPhone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '66' + clean.slice(1);
  }
  return clean;
};

const formatProductName = (name: any) => {
  if (!name) return 'Pizza';
  let str = typeof name === 'string' ? name : (name.name || name.nameIt || 'Prodotto');
  return str.toUpperCase();
};

const parseCoordsFromAddress = (addressStr: string) => {
  if (!addressStr || typeof addressStr !== 'string') {
    return { address: addressStr || 'N/A', lat: RESTAURANT_LAT, lng: RESTAURANT_LNG };
  }
  const match = addressStr.match(/\[Lat:\s*([0-9.-]+),\s*Lng:\s*([0-9.-]+)\]/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    const cleanAddress = addressStr.replace(/\s*\[Lat:[^\]]+\]/, '').trim();
    return { address: cleanAddress, lat, lng };
  }
  return { address: addressStr, lat: RESTAURANT_LAT, lng: RESTAURANT_LNG };
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

  const refreshServiceStatus = async () => {
    const st = await fetchPizzeriaStatus();
    setServiceStatus(st);
    setServiceCalc(calculateServiceState(st));
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
        }
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

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

  // 3. Clock timer
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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

  // Set of order IDs acknowledged/handled by staff
  const [acknowledgedOrderIds, setAcknowledgedOrderIds] = useState<Set<string>>(() => new Set());

  // 6. Group into 2 PHASES:
  // Phase 1: In Kitchen (New & Preparing)
  const kitchenOrders = useMemo(() => {
    return orders.filter(o => o.status === 'new' || (o.status as any) === 'received' || o.status === 'preparing');
  }, [orders]);

  // Phase 2: Ready & Delivering
  const readyOrders = useMemo(() => {
    return orders.filter(o => o.status === 'delivering' || (o.status as any) === 'ready');
  }, [orders]);

  // Truly unacknowledged new orders trigger the buzzer
  const unacknowledgedNewOrders = useMemo(() => {
    return orders.filter(o => (o.status === 'new' || (o.status as any) === 'received') && !acknowledgedOrderIds.has(String(o.id)));
  }, [orders, acknowledgedOrderIds]);

  // 7. Sound Alarm Management
  useEffect(() => {
    if (unacknowledgedNewOrders.length > 0 && !soundMuted) {
      startContinuousAlarm();
    } else {
      stopContinuousAlarm();
    }
  }, [unacknowledgedNewOrders.length, soundMuted]);

  const handleSilenceAlarm = () => {
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => {
      const next = new Set(prev);
      unacknowledgedNewOrders.forEach(o => next.add(String(o.id)));
      return next;
    });
  };

  // Actions
  const handleAcceptOrder = async (orderId: string, minutes: number = 30) => {
    initKitchenAudio();
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => new Set(prev).add(String(orderId)));
    await updateOrderStatus(orderId, 'preparing');
  };

  const handleOrderReady = async (orderId: string) => {
    initKitchenAudio();
    await updateOrderStatus(orderId, 'delivering');
  };

  const handleOrderCompleted = async (orderId: string) => {
    initKitchenAudio();
    await updateOrderStatus(orderId, 'completed');
  };

  const handleOrderCancelled = async (orderId: string) => {
    initKitchenAudio();
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => new Set(prev).add(String(orderId)));
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
    col1Title: kdsLang === 'th' ? 'ในครัว (ต้องทำ & กำลังอบ)' : 'IN KITCHEN (TO PREPARE & COOK)',
    col2Title: kdsLang === 'th' ? 'พร้อมส่ง (ส่งต่อให้ไรเดอร์)' : 'READY (DISPATCH RIDER)',
    noKitchenOrders: kdsLang === 'th' ? 'ไม่มีออเดอร์ในครัว' : 'NO ORDERS IN KITCHEN',
    noKitchenSub: kdsLang === 'th' ? 'แท็บเล็ตจะส่งเสียงเตือนเมื่อมีออเดอร์ใหม่เข้ามา' : 'Tablet will ring when a new order arrives.',
    noReadyOrders: kdsLang === 'th' ? 'ไม่มีออเดอร์พร้อมส่ง' : 'NO ORDERS READY FOR RIDER',
    noReadySub: kdsLang === 'th' ? 'พิซซ่าที่อบเสร็จแล้วจะแสดงที่นี่' : 'Baked pizzas ready for delivery will appear here.',
    acceptBtn: kdsLang === 'th' ? 'รับออเดอร์' : 'ACCEPT ORDER',
    muteBtn: kdsLang === 'th' ? 'ปิดเสียง' : 'MUTE',
    muteAlarmBar: kdsLang === 'th' ? 'ปิดเสียงเตือน' : 'MUTE ALARM',
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
    sizeLabel: kdsLang === 'th' ? 'ขนาด' : 'Size',
    extraLabel: kdsLang === 'th' ? 'พิเศษ' : 'Extra'
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
            src="/Flower_Power_Pizza_-_HotSpring.png" 
            alt="Flower Power Pizza Logo" 
            className="w-10 h-10 object-contain drop-shadow-md shrink-0"
          />

          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-none">
              {t.kitchenTitle}
            </h1>
            <span className="text-[11px] font-bold text-amber-400">
              {t.brandSubtitle}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#080a0f] border border-stone-800 font-mono text-base lg:text-lg font-black text-amber-400 tracking-wider">
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{currentTime}</span>
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

          {/* Service Status / Pause Management Button */}
          <button
            onClick={() => setShowPauseModal(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 border transition-all cursor-pointer ${
              serviceCalc.state === 'OPEN'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                : 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse hover:bg-amber-900 shadow-md shadow-amber-600/30'
            }`}
            title="Manage delivery service & pause orders"
          >
            {serviceCalc.state === 'OPEN' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">{t.serviceOpen}</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span>
                  {kdsLang === 'th' ? `พัก: ${serviceCalc.remainingMinutes} น.` : `PAUSED: ${serviceCalc.remainingMinutes}m`}
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
              testKitchenAlarm();
            }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-black cursor-pointer"
            title="Test alarm sound"
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
                const { address } = parseCoordsFromAddress(order.address);
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';
                const isNew = order.status === 'new' || (order.status as any) === 'received';

                // Timer badge color
                const timerColor = elapsed > 25 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : elapsed > 15 
                    ? 'bg-amber-500 text-stone-950 font-black' 
                    : 'bg-emerald-600 text-white';

                return (
                  <div 
                    key={order.id}
                    className={`bg-[#171c26] border-2 rounded-2xl p-3.5 shadow-lg flex flex-col gap-3 transition-all ${
                      isNew 
                        ? 'border-red-500 shadow-red-950/50 animate-pulse' 
                        : 'border-amber-500/60'
                    }`}
                  >
                    {/* Header: Order Number, Elapsed Time & Total */}
                    <div className="flex items-center justify-between border-b border-stone-700/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-2xl text-white tracking-wider font-mono">
                          #{orderNumber}
                        </span>
                        {isNew ? (
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-red-600 text-white uppercase tracking-wider animate-bounce">
                            🚨 {t.newBadge} ({elapsed} {t.minAgo})
                          </span>
                        ) : (
                          <span className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${timerColor}`}>
                            🔥 {t.cookingFor} {elapsed} {t.min}
                          </span>
                        )}
                      </div>
                      <span className="font-black text-xl text-emerald-400 font-mono">
                        {order.total} ฿
                      </span>
                    </div>

                    {/* Customer & Address */}
                    <div className="text-xs space-y-1 text-stone-300">
                      <div className="font-black text-white text-sm flex items-center justify-between">
                        <span>👤 {order.customer_name}</span>
                        <a 
                          href={`tel:${order.phone}`} 
                          className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.phone}</span>
                        </a>
                      </div>
                      <p className="text-stone-400 text-xs flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{address}</span>
                      </p>
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

                            {/* Extra ingredients highlighted in bright amber badge */}
                            {extras.length > 0 && (
                              <div className="mt-1.5 pl-7 flex flex-wrap gap-1">
                                {extras.map((ex: any, exIdx: number) => {
                                  const exName = typeof ex === 'string' 
                                    ? ex 
                                    : (kdsLang === 'th' ? (ex.nameTh || ex.name || 'Extra') : (ex.name || ex.nameIt || 'Extra'));
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

                    {/* Card Action Buttons */}
                    {isNew ? (
                      /* NEW ORDER: ACCEPT OR MUTE */
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
                    ) : (
                      /* COOKING / PREPARING: BAKED OR DIRECT ARCHIVE */
                      <div className="pt-1 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleOrderReady(order.id)}
                          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
                        >
                          <Flame className="w-5 h-5 text-amber-300" />
                          <span>{t.bakedBtn}</span>
                        </button>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOrderCompleted(order.id)}
                            className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-stone-700 transition-colors cursor-pointer"
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
                    )}

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
                const { address, lat, lng } = parseCoordsFromAddress(order.address);
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';

                // Customer WhatsApp Link (bilingual dispatch notice EN / TH)
                const cleanPhone = formatWhatsAppPhone(order.phone);
                const customerMsg = encodeURIComponent(
                  `🍕 *FLOWER POWER PIZZA RANONG* 🛵\n` +
                  `Hello ${order.customer_name}!\n` +
                  `Your order #${orderNumber} is freshly baked and on the way with our rider!\n\n` +
                  `พิซซ่าของคุณออเดอร์ #${orderNumber} อบเสร็จแล้วและกำลังเดินทางไปส่งนะคะ ✨\n\n` +
                  `See you very soon! / จะถึงในไม่ช้าค่ะ!`
                );

                // Driver WhatsApp Link with Maps
                const driverMsg = encodeURIComponent(
                  `🛵 *FLOWER POWER PIZZA DELIVERY · ส่งพิซซ่า*\n` +
                  `Order #${orderNumber} for ${order.customer_name}\n` +
                  `📞 Tel / โทร: ${order.phone}\n` +
                  `🏠 Address / ที่อยู่: ${address}\n` +
                  `🗺️ Map / แผนที่: https://www.google.com/maps?q=${lat},${lng}`
                );

                return (
                  <div 
                    key={order.id}
                    className="bg-[#171c26] border-2 border-blue-500/60 rounded-2xl p-3.5 shadow-md flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between border-b border-stone-700/80 pb-2.5">
                      <span className="font-black text-2xl text-white tracking-wider font-mono">
                        #{orderNumber}
                      </span>
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-600 text-white uppercase tracking-wider">
                        🛵 {t.col2Title.split('(')[0]}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-stone-300">
                      <p className="font-black text-white text-sm">👤 {order.customer_name} ({order.phone})</p>
                      <p className="text-stone-400 text-xs flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{address}</span>
                      </p>
                    </div>

                    {/* Customer Action (WhatsApp or Phone) */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${customerMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-transform cursor-pointer"
                        title="WhatsApp Customer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white/20" />
                        <span>{t.notifyCustBtn}</span>
                      </a>

                      <a
                        href={`tel:${order.phone}`}
                        className="py-2.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-transform cursor-pointer"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{t.callBtn}</span>
                      </a>
                    </div>

                    {/* Driver Helper (WhatsApp & Google Maps) */}
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/?text=${driverMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                        title="Send to Driver"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.sendRiderBtn}</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
                        title="Open Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t.mapBtn}</span>
                      </a>
                    </div>

                    {/* Complete & Archive Order Button */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOrderCompleted(order.id)}
                        className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider border border-emerald-600 shadow-md cursor-pointer transition-colors"
                      >
                        {t.deliveredBtn}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOrderCancelled(order.id)}
                        className="px-3 py-3 rounded-xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 font-bold text-xs uppercase border border-stone-700 transition-colors cursor-pointer"
                      >
                        {t.cancelBtn}
                      </button>
                    </div>

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
            <div className="p-3 rounded-2xl bg-[#0d1017] border border-stone-800 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-stone-400">
                  {kdsLang === 'th' ? 'สถานะปัจจุบัน:' : 'Current Status:'}
                </span>
                <span className={`font-black uppercase px-2 py-0.5 rounded-md ${
                  serviceCalc.state === 'OPEN' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' 
                    : 'bg-amber-950 text-amber-300 border border-amber-600'
                }`}>
                  {serviceCalc.state === 'OPEN' ? t.serviceOpen : t.servicePaused}
                </span>
              </div>
              {serviceCalc.state !== 'OPEN' && serviceCalc.remainingMinutes > 0 && (
                <div className="flex justify-between items-center pt-1 text-amber-400 font-bold">
                  <span>{kdsLang === 'th' ? 'จะเปิดรับในอีก:' : 'Reopening In:'}</span>
                  <span>{serviceCalc.remainingMinutes} {t.min} ({serviceCalc.reopenTimeFormatted})</span>
                </div>
              )}
            </div>

            {/* If currently paused: REOPEN NOW BUTTON */}
            {serviceCalc.state !== 'OPEN' && (
              <button
                type="button"
                onClick={handleResumeService}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                <PlayCircle className="w-6 h-6 text-white stroke-[2.5]" />
                <span>{kdsLang === 'th' ? 'เปิดรับออเดอร์ทันที' : 'REOPEN ONLINE ORDERS NOW'}</span>
              </button>
            )}

            {/* Quick Pause Duration Options */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                {kdsLang === 'th' ? 'เลือกเวลาหยุดพักชั่วคราว:' : 'Temporary Pause Duration:'}
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[20, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleApplyPause(mins)}
                    className="py-3 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-black text-xs uppercase border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>⏸️ +{mins} {t.min}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stop For Tonight Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleStopTonight}
                className="w-full py-3 rounded-xl bg-red-950/70 hover:bg-red-800 text-red-200 font-black text-xs uppercase border border-red-700/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>{kdsLang === 'th' ? 'ปิดรับออเดอร์สำหรับคืนนี้' : 'STOP ORDERS FOR TONIGHT'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
