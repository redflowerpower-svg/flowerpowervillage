import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePizzaAdminStore, sanitizePizzaOrder } from '../store/usePizzaAdminStore';
import type { PizzaOrder, CartItemSaved } from '../../../pizza/types';
import { RESTAURANT_LAT, RESTAURANT_LNG } from '../../../pizza/store/locationStore';
import {
  requestScreenWakeLock,
  releaseScreenWakeLock,
  startContinuousAlarm,
  stopContinuousAlarm,
  testKitchenAlarm,
  initKitchenAudio
} from '../utils/kitchenAudioWakeLock';
import {
  Clock,
  Volume2,
  VolumeX,
  BellOff,
  MessageCircle,
  Maximize,
  Minimize,
  CheckCircle,
  Flame,
  Bike,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Phone,
  MapPin,
  Send,
  Eye,
  ArrowLeft
} from 'lucide-react';

const formatWhatsAppPhone = (phone: string) => {
  let clean = (phone || '').replace(/[^0-9]/g, '');
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
  const [selectedMobileTab, setSelectedMobileTab] = useState<'new' | 'preparing' | 'ready'>('new');
  const [prepTimeCustom, setPrepTimeCustom] = useState<Record<string, number>>({});

  // 1. Clock timer
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch orders and subscribe to Supabase Realtime
  useEffect(() => {
    fetchOrders();
    const unsubscribe = subscribeToRealtime();
    return () => {
      unsubscribe();
      stopContinuousAlarm();
      releaseScreenWakeLock();
    };
  }, []);

  // 3. Screen Wake Lock (keep screen awake on tablet)
  useEffect(() => {
    const acquireLock = async () => {
      const ok = await requestScreenWakeLock();
      setWakeLockActive(ok);
    };

    acquireLock();

    // Re-acquire when returning from other apps / tabs
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

  // Set of order IDs acknowledged/handled by staff (permanently stops ringing)
  const [acknowledgedOrderIds, setAcknowledgedOrderIds] = useState<Set<string>>(() => new Set());

  // 4. Categorize active orders
  const newOrders = useMemo(() => {
    return orders.filter(o => o.status === 'new' || (o.status as any) === 'received');
  }, [orders]);

  // Only truly unacknowledged new orders trigger the loud audio alarm
  const unacknowledgedNewOrders = useMemo(() => {
    return newOrders.filter(o => !acknowledgedOrderIds.has(String(o.id)));
  }, [newOrders, acknowledgedOrderIds]);

  const preparingOrders = useMemo(() => {
    return orders.filter(o => o.status === 'preparing');
  }, [orders]);

  const readyOrders = useMemo(() => {
    return orders.filter(o => o.status === 'delivering' || (o.status as any) === 'ready');
  }, [orders]);

  // 5. Sound Alarm Management: ONLY trigger alarm if there are UNACKNOWLEDGED new orders and sound is enabled
  useEffect(() => {
    if (unacknowledgedNewOrders.length > 0 && !soundMuted) {
      startContinuousAlarm();
    } else {
      stopContinuousAlarm();
    }
  }, [unacknowledgedNewOrders.length, soundMuted]);

  // Manually silence the alarm with one tap
  const handleSilenceAlarm = () => {
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => {
      const next = new Set(prev);
      newOrders.forEach(o => next.add(String(o.id)));
      return next;
    });
  };

  // Handle Accept Order (Phase 1)
  const handleAcceptOrder = async (orderId: string, minutes: number = 30) => {
    initKitchenAudio();
    // Force kill the alarm immediately
    stopContinuousAlarm();
    // Add to acknowledged set so this order can never trigger the buzzer again
    setAcknowledgedOrderIds(prev => {
      const next = new Set(prev);
      next.add(String(orderId));
      return next;
    });
    await updateOrderStatus(orderId, 'preparing');
  };

  // Handle Order Ready (Phase 2: Sfornato / In consegna rider)
  const handleOrderReady = async (orderId: string) => {
    initKitchenAudio();
    await updateOrderStatus(orderId, 'delivering');
  };

  // Handle Order Completed
  const handleOrderCompleted = async (orderId: string) => {
    initKitchenAudio();
    await updateOrderStatus(orderId, 'completed');
  };

  // Toggle Fullscreen (crucial for Samsung Tab A and landscape phones)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Calculate elapsed minutes since order created
  const getElapsedMinutes = (dateStr: string) => {
    if (!dateStr) return 0;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diffMs / 60000);
  };

  return (
    <div 
      className="min-h-screen bg-[#0e1117] text-white flex flex-col font-sans select-none antialiased"
      onClick={() => initKitchenAudio()}
    >
      {/* ─── TOP KITCHEN STATUS BAR ─────────────────────────────────────── */}
      <header className="bg-[#161a23] border-b-2 border-stone-800 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shrink-0">
        
        {/* Left: Brand + Digital Clock */}
        <div className="flex items-center gap-3">
          <Link 
            to="/admin" 
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Torna al Back Office Amministrativo"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-none flex items-center gap-2">
              <span className="text-[#e11d48]">🍕</span>
              <span>KITCHEN MONITOR</span>
            </h1>
            <span className="text-[11px] font-bold text-stone-400">FLOWER POWER PIZZA RANONG</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#090b0e] border border-stone-800 font-mono text-lg font-black text-amber-400 tracking-wider">
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Center: Live Order Counters */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedMobileTab('new')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              newOrders.length > 0 
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30' 
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            <span>DA FARE</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-white text-[11px]">
              {newOrders.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedMobileTab('preparing')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              preparingOrders.length > 0 
                ? 'bg-amber-500 text-stone-950 font-black' 
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">IN FORNO</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-stone-950 text-[11px]">
              {preparingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedMobileTab('ready')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              readyOrders.length > 0 
                ? 'bg-blue-600 text-white font-black' 
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PRONTE</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-white text-[11px]">
              {readyOrders.length}
            </span>
          </button>
        </div>

        {/* Right: Tablet Controls (WakeLock, Audio, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          {/* Pulsante rapido FERMA SUONERIA quando la comanda suona */}
          {unacknowledgedNewOrders.length > 0 && !soundMuted && (
            <button
              type="button"
              onClick={handleSilenceAlarm}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 animate-bounce shadow-lg shadow-red-600/50 cursor-pointer border border-white/40"
              title="Silenzia subito la suoneria per questa comanda"
            >
              <BellOff className="w-4 h-4 stroke-[3]" />
              <span>SILENZIA SUONO</span>
            </button>
          )}
          {/* Wake Lock Status Badge */}
          <button
            onClick={() => requestScreenWakeLock().then(ok => setWakeLockActive(ok))}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors ${
              wakeLockActive 
                ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300' 
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
            }`}
            title={wakeLockActive ? 'Schermo sempre acceso attivo' : 'Tocca per bloccare lo spegnimento schermo'}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${wakeLockActive ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'}`} />
            <span className="hidden lg:inline">{wakeLockActive ? 'SCHERMO ATTIVO' : 'SVEGLIA SCHERMO'}</span>
          </button>

          {/* Sound Alarm Toggle & Test */}
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
            className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all ${
              soundMuted 
                ? 'bg-red-950 border-red-700 text-red-300' 
                : 'bg-stone-800 border-stone-700 text-emerald-400 hover:bg-stone-700'
            }`}
            title={soundMuted ? 'Suoneria disattivata (tocca per attivare)' : 'Suoneria attiva (tocca per silenziare)'}
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Test Sound Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              testKitchenAlarm();
            }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-black"
            title="Ascolta tono allarme comanda"
          >
            TEST 🔔
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
            title={isFullscreen ? 'Esci da schermo intero' : 'Attiva schermo intero per tablet'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ─── MAIN 3-COLUMN KITCHEN BOARD ────────────────────────────────── */}
      <main className="flex-1 p-2 sm:p-3 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">

        {/* ─── COLONNA 1: NUOVE COMANDE (DA ACCETTARE) ────────────────────── */}
        <section className={`flex flex-col bg-[#131720] border-2 rounded-2xl overflow-hidden ${
          newOrders.length > 0 ? 'border-red-600 shadow-xl shadow-red-950/40' : 'border-stone-800'
        } ${selectedMobileTab !== 'new' ? 'hidden md:flex' : 'flex'}`}>
          
          <div className="bg-[#1b202c] px-3 py-2.5 border-b border-stone-800 flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-wider text-red-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span>DA ACCETTARE ({newOrders.length})</span>
            </h2>
            {newOrders.length > 0 && (
              <span className="text-[10px] font-black bg-red-600/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full uppercase animate-pulse">
                🔔 SUONA IN CUCINA
              </span>
            )}
          </div>

          <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
            {newOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <CheckCircle className="w-12 h-12 text-stone-700 mb-2" />
                <p className="font-black text-sm uppercase text-stone-400">Nessuna nuova comanda</p>
                <p className="text-xs text-stone-600">Il tablet suonerà appena arriva un nuovo ordine.</p>
              </div>
            ) : (
              newOrders.map(order => {
                const elapsed = getElapsedMinutes(order.created_at);
                const items = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
                const { address } = parseCoordsFromAddress(order.address);
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';

                return (
                  <div 
                    key={order.id}
                    className="bg-[#1a1f2c] border-2 border-red-500/80 rounded-2xl p-3 shadow-lg flex flex-col gap-2.5 animate-pulse"
                  >
                    {/* Header Comanda */}
                    <div className="flex items-center justify-between border-b border-stone-700 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xl text-white tracking-wider">#{orderNumber}</span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-red-600 text-white">
                          RICEVUTO DA {elapsed} MIN
                        </span>
                      </div>
                      <span className="font-black text-lg text-emerald-400 font-mono">
                        {order.total} ฿
                      </span>
                    </div>

                    {/* Cliente & Indirizzo */}
                    <div className="text-xs space-y-0.5 text-stone-300">
                      <div className="font-black text-white text-sm flex items-center justify-between">
                        <span>👤 {order.customer_name}</span>
                        <a 
                          href={`tel:${order.phone}`} 
                          className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1"
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

                    {/* Lista Pizze & Piatti da preparare (FONT GIGANTI PER IL BANCO) */}
                    <div className="bg-[#0f131a] p-2.5 rounded-xl border border-stone-800 space-y-2">
                      {items.map((item, idx) => {
                        const name = formatProductName(item.name);
                        const variant = item.selectedVariant ? String(item.selectedVariant) : '';
                        const extras = Array.isArray(item.selectedExtras) ? item.selectedExtras : [];

                        return (
                          <div key={idx} className="border-b border-stone-800 last:border-0 pb-1.5 last:pb-0">
                            <div className="flex items-baseline gap-2">
                              <span className="font-black text-lg sm:text-xl text-amber-400 font-mono">
                                {item.quantity}x
                              </span>
                              <div className="flex-1">
                                <span className="font-black text-base sm:text-lg text-white leading-tight block">
                                  {name}
                                </span>
                                {variant && (
                                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wide">
                                    Taglia: {variant}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Ingredienti EXTRA evidenziati in giallo brillante */}
                            {extras.length > 0 && (
                              <div className="mt-1 pl-6 flex flex-wrap gap-1">
                                {extras.map((ex: any, exIdx: number) => {
                                  const exName = typeof ex === 'string' ? ex : (ex.name || ex.nameIt || 'Extra');
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

                    {/* Azioni Comanda: ACCETTA SUBITO (FERMA L'ALLARME) */}
                    <div className="pt-1 flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAcceptOrder(order.id, prepTimeCustom[order.id] || 30)}
                          className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
                        >
                          <CheckCircle className="w-5 h-5 text-white stroke-[3]" />
                          <span>ACCETTA ({prepTimeCustom[order.id] || 30} MIN)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            stopContinuousAlarm();
                            setAcknowledgedOrderIds(prev => new Set(prev).add(String(order.id)));
                          }}
                          className="px-3.5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-white font-black text-xs uppercase tracking-wider border border-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-transform"
                          title="Silenzia la suoneria senza ancora accettare"
                        >
                          <BellOff className="w-4 h-4 text-red-400" />
                          <span className="hidden sm:inline">MUTO</span>
                        </button>
                      </div>

                      {/* Selettore rapido minuti prep */}
                      <div className="grid grid-cols-3 gap-1">
                        {[20, 30, 45].map(min => (
                          <button
                            key={min}
                            type="button"
                            onClick={() => setPrepTimeCustom(prev => ({ ...prev, [order.id]: min }))}
                            className={`py-1.5 rounded-lg text-xs font-black uppercase transition-colors ${
                              (prepTimeCustom[order.id] || 30) === min 
                                ? 'bg-amber-400 text-stone-950' 
                                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
                            }`}
                          >
                            {min} min
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ─── COLONNA 2: IN FORNO & IN PREPARAZIONE ──────────────────────── */}
        <section className={`flex flex-col bg-[#131720] border-2 border-stone-800 rounded-2xl overflow-hidden ${
          selectedMobileTab !== 'preparing' ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="bg-[#1b202c] px-3 py-2.5 border-b border-stone-800 flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>IN FORNO & PREPARAZIONE ({preparingOrders.length})</span>
            </h2>
          </div>

          <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <Flame className="w-12 h-12 text-stone-700 mb-2" />
                <p className="font-black text-sm uppercase text-stone-400">Nessun ordine in forno</p>
                <p className="text-xs text-stone-600">Gli ordini accettati appariranno qui con il timer.</p>
              </div>
            ) : (
              preparingOrders.map(order => {
                const elapsed = getElapsedMinutes(order.created_at);
                const items = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';

                // Timer badge color: Green (<15m), Yellow (15-25m), Red (>25m)
                const timerColor = elapsed > 25 ? 'bg-red-600 text-white animate-pulse' : elapsed > 15 ? 'bg-amber-500 text-stone-950 font-black' : 'bg-emerald-600 text-white';

                return (
                  <div 
                    key={order.id}
                    className="bg-[#181d28] border-2 border-amber-500/50 rounded-2xl p-3 shadow-md flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-stone-700 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xl text-white tracking-wider">#{orderNumber}</span>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${timerColor}`}>
                          IN FORNO DA {elapsed} MIN
                        </span>
                      </div>
                      <span className="text-xs font-bold text-stone-400">👤 {order.customer_name}</span>
                    </div>

                    {/* Dettaglio Pizze */}
                    <div className="bg-[#0f131a] p-2.5 rounded-xl border border-stone-800 space-y-2">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-baseline gap-2">
                          <span className="font-black text-lg text-amber-400 font-mono">
                            {item.quantity}x
                          </span>
                          <span className="font-black text-base text-white">
                            {formatProductName(item.name)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tasto Gigante: ORDINE PRONTO / SFORNATO */}
                    <button
                      type="button"
                      onClick={() => handleOrderReady(order.id)}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
                    >
                      <CheckCircle className="w-5 h-5 text-white stroke-[3]" />
                      <span>PIZZE SFORNATE ➔ PRONTE PER RIDER</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ─── COLONNA 3: PRONTE / IN CONSEGNA ────────────────────────────── */}
        <section className={`flex flex-col bg-[#131720] border-2 border-stone-800 rounded-2xl overflow-hidden ${
          selectedMobileTab !== 'ready' ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="bg-[#1b202c] px-3 py-2.5 border-b border-stone-800 flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Bike className="w-4 h-4 text-blue-500" />
              <span>PRONTE & IN CONSEGNA ({readyOrders.length})</span>
            </h2>
          </div>

          <div className="flex-1 p-2 space-y-2.5 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <Bike className="w-12 h-12 text-stone-700 mb-2" />
                <p className="font-black text-sm uppercase text-stone-400">Nessuna pizza in consegna</p>
                <p className="text-xs text-stone-600">Le pizze sfornate appariranno qui per il rider.</p>
              </div>
            ) : (
              readyOrders.map(order => {
                const { address, lat, lng } = parseCoordsFromAddress(order.address);
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';

                // Customer WhatsApp Link (trilingual dispatch notice)
                const cleanPhone = formatWhatsAppPhone(order.phone);
                const customerMsg = encodeURIComponent(
                  `🍕 *FLOWER POWER PIZZA RANONG* 🛵\n` +
                  `Ciao ${order.customer_name}!\n` +
                  `Il tuo ordine #${orderNumber} è appena stato sfornato ed è partito con il nostro rider!\n\n` +
                  `Your order #${orderNumber} is freshly baked and on the way with our rider!\n` +
                  `พิซซ่าของคุณอบเสร็จแล้วและกำลังเดินทางไปส่งนะคะ ✨\n\n` +
                  `Arriviamo tra pochissimo!`
                );

                // WhatsApp message link for driver
                const driverMsg = encodeURIComponent(
                  `🛵 *CONSEGNA FLOWER POWER PIZZA*\n` +
                  `Ordine #${orderNumber} per ${order.customer_name}\n` +
                  `📞 Tel: ${order.phone}\n` +
                  `🏠 Indirizzo: ${address}\n` +
                  `🗺️ Mappa: https://www.google.com/maps?q=${lat},${lng}`
                );

                return (
                  <div 
                    key={order.id}
                    className="bg-[#181d28] border-2 border-blue-500/50 rounded-2xl p-3 shadow-md flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-stone-700 pb-2">
                      <span className="font-black text-xl text-white tracking-wider">#{orderNumber}</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-600 text-white">
                        PRONTO PER IL RIDER
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-stone-300">
                      <p className="font-black text-white text-sm">👤 {order.customer_name} ({order.phone})</p>
                      <p className="text-stone-400 text-xs flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{address}</span>
                      </p>
                    </div>

                    {/* FASE 2: Avviso al Cliente (WhatsApp o Chiamata) */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${customerMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-transform cursor-pointer"
                        title="Avvisa subito il cliente su WhatsApp che il rider sta arrivando"
                      >
                        <MessageCircle className="w-4 h-4 fill-white/20" />
                        <span>AVVISA CLIENTE</span>
                      </a>

                      <a
                        href={`tel:${order.phone}`}
                        className="py-2.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-transform"
                        title="Chiama al telefono il cliente"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Chiama</span>
                      </a>
                    </div>

                    {/* FASE 2: Driver Helper & Mappa */}
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/?text=${driverMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                        title="Invia posizione e comanda al rider su WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Invia a Rider</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        title="Apri navigazione Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mappa</span>
                      </a>
                    </div>

                    {/* Tasto: CONSEGNATO & ARCHIVIA */}
                    <button
                      type="button"
                      onClick={() => handleOrderCompleted(order.id)}
                      className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 hover:text-white font-bold text-xs uppercase tracking-wider border border-stone-700 transition-colors"
                    >
                      ✓ CONSEGNATO / ARCHIVIA ORDINE
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
