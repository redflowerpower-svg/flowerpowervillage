import { useState, useEffect } from 'react';
import { Clock, Phone, AlertCircle } from 'lucide-react';
import { 
  fetchPizzeriaStatus, 
  calculateServiceState, 
  PizzeriaServiceStatus, 
  DEFAULT_PIZZERIA_STATUS,
  ServiceCalculationResult 
} from '../services/pizzaServiceStatus';

interface ServiceStatusBannerProps {
  lang: 'IT' | 'EN' | 'TH' | 'DE';
  onStatusChange?: (canOrder: boolean) => void;
}

export function ServiceStatusBanner({ lang, onStatusChange }: ServiceStatusBannerProps) {
  const [, setStatus] = useState<PizzeriaServiceStatus>(DEFAULT_PIZZERIA_STATUS);
  const [calc, setCalc] = useState<ServiceCalculationResult>(() => calculateServiceState(DEFAULT_PIZZERIA_STATUS));

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      const st = await fetchPizzeriaStatus();
      if (!isMounted) return;
      setStatus(st);
      const res = calculateServiceState(st);
      setCalc(res);
      if (onStatusChange) onStatusChange(res.canOrder);
    };

    refresh();
    const interval = setInterval(refresh, 15000);

    // BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('flower_power_service_status');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'STATUS_UPDATED' && ev.data?.status && isMounted) {
          setStatus(ev.data.status);
          const res = calculateServiceState(ev.data.status);
          setCalc(res);
          if (onStatusChange) onStatusChange(res.canOrder);
        }
      };
    } catch (e) {}

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [onStatusChange]);

  // If service is active and open, no banner needed!
  if (calc.state === 'OPEN') {
    return null;
  }

  // Calculate hours & minutes for display
  const remH = Math.floor(calc.remainingMinutes / 60);
  const remM = calc.remainingMinutes % 60;
  const timeFormatted = remH > 0 ? `${remH}h ${remM}m` : `${remM} min`;

  // Multilingual labels for IT, EN, TH, DE
  const content = {
    IT: {
      pausedTitle: 'Ordinazioni Online Momentaneamente Sospese',
      pausedDesc: `La cucina è al completo per garantire la massima qualità dei piatti. Nuovi ordini tra: ${calc.remainingMinutes} min (alle ${calc.reopenTimeFormatted})`,
      closedTitle: 'La Pizzeria è al momento Chiusa',
      closedDesc: `Riapriamo oggi alle ${calc.reopenTimeFormatted} (tra ${remH > 0 ? `${remH} ore e ${remM} min` : `${remM} min`}). Sfoglia pure il menu!`,
      callText: 'Per informazioni: Chiama la Pizzeria'
    },
    EN: {
      pausedTitle: 'Online Orders Temporarily Paused',
      pausedDesc: `Our kitchen is currently busy preparing active orders. Orders will resume in: ${calc.remainingMinutes} min (at ${calc.reopenTimeFormatted})`,
      closedTitle: 'Pizzeria is Currently Closed',
      closedDesc: `We reopen today at ${calc.reopenTimeFormatted} (in ${timeFormatted}). Feel free to explore our menu!`,
      callText: 'For urgent inquiries: Call Pizzeria'
    },
    TH: {
      pausedTitle: 'ระบบสั่งอาหารออนไลน์ปิดชั่วคราว',
      pausedDesc: `ครัวกำลังเร่งปรุงอาหารเพื่อคุณภาพที่ดีที่สุด จะเปิดรับออเดอร์ใหม่ในอีก: ${calc.remainingMinutes} นาที (เวลา ${calc.reopenTimeFormatted} น.)`,
      closedTitle: 'ร้านพิซซ่าปิดบริการในขณะนี้',
      closedDesc: `จะเปิดรับออเดอร์วันนี้เวลา ${calc.reopenTimeFormatted} น. (อีก ${remH > 0 ? `${remH} ชม. ${remM} นาที` : `${remM} นาที`}) คุณสามารถเลือกดูเมนูล่วงหน้าได้ค่ะ`,
      callText: 'สอบถามข้อมูลเพิ่มเติม: โทรหาร้าน'
    },
    DE: {
      pausedTitle: 'Online-Bestellungen vorübergehend pausiert',
      pausedDesc: `Die Küche bereitet gerade Bestellungen vor. Neue Bestellungen sind wieder möglich in: ${calc.remainingMinutes} Min (um ${calc.reopenTimeFormatted} Uhr)`,
      closedTitle: 'Pizzeria derzeit geschlossen',
      closedDesc: `Wir öffnen heute um ${calc.reopenTimeFormatted} Uhr (in ${timeFormatted}). Du kannst gerne unsere Speisekarte durchstöbern!`,
      callText: 'Für dringende Fragen: Pizzeria anrufen'
    }
  }[lang];

  const isPaused = calc.state === 'PAUSED';

  return (
    <aside 
      aria-label="Pizzeria Service Status"
      className={`w-full mb-6 p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 animate-fadeIn ${
        isPaused 
          ? 'bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-stone-900 text-amber-100 border-amber-500/50 shadow-amber-950/30'
          : 'bg-gradient-to-r from-stone-900 via-[#1c1917] to-stone-900 text-stone-200 border-stone-700/80 shadow-black/40'
      }`}
    >
      {/* Icon + Message */}
      <div className="flex items-center gap-3.5 text-center md:text-left flex-1">
        <div className={`p-3 rounded-2xl flex-shrink-0 ${
          isPaused ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-stone-800 text-amber-400 border border-stone-700'
        }`}>
          {isPaused ? <Clock className="w-6 h-6 animate-pulse" /> : <AlertCircle className="w-6 h-6 text-stone-300" />}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              {isPaused ? content.pausedTitle : content.closedTitle}
            </h4>
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
              isPaused 
                ? 'bg-amber-500 text-stone-950 animate-bounce' 
                : 'bg-stone-800 text-stone-300 border border-stone-700'
            }`}>
              ⏱️ {timeFormatted}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
            {isPaused ? content.pausedDesc : content.closedDesc}
          </p>
        </div>
      </div>

      {/* Call Button */}
      <div className="shrink-0 flex items-center gap-2">
        <a
          href="tel:0958825698"
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center gap-2 border border-white/20 shadow-sm transition-all"
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>{content.callText}</span>
        </a>
      </div>
    </aside>
  );
}
