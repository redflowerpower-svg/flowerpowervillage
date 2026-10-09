import { useState, useEffect } from 'react';
import { Clock, Phone, AlertCircle } from 'lucide-react';
import { 
  fetchPizzeriaStatus, 
  calculateServiceState, 
  PizzeriaServiceStatus, 
  DEFAULT_PIZZERIA_STATUS,
  ServiceCalculationResult 
} from '../services/pizzaServiceStatus';

import { useLanguageStore } from '../store/languageStore';
import { Language } from '../config/languages';

interface ServiceStatusBannerProps {
  lang?: Language;
  onStatusChange?: (canOrder: boolean) => void;
}

export function ServiceStatusBanner({ lang: propLang, onStatusChange }: ServiceStatusBannerProps) {
  const storeLang = useLanguageStore((s) => s.lang);
  const lang = propLang || storeLang || 'IT';
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

  // Multilingual labels for IT, EN, TH, DE, MM, FR, ES, RU, ZH
  const content: Record<string, any> = {
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
    },
    MM: {
      pausedTitle: 'အွန်လိုင်း အော်ဒါများကို ခေတ္တရပ်နားထားပါသည်',
      pausedDesc: `အကောင်းဆုံး အရည်အသွေး ရရှိစေရန် မီးဖိုချောင်တွင် အော်ဒါများ ပြင်ဆင်နေပါသည်။ အော်ဒါ ပြန်လည်လက်ခံမည့်အချိန်: ${calc.remainingMinutes} မိနစ် (${calc.reopenTimeFormatted})`,
      closedTitle: 'ပီဇာဆိုင် ယခုအချိန်တွင် ပိတ်ထားပါသည်',
      closedDesc: `ယနေ့ ${calc.reopenTimeFormatted} တွင် ပြန်လည်ဖွင့်ပါမည် (${remH > 0 ? `${remH} နာရီ ${remM} မိနစ်` : `${remM} မိနစ်`} အကြာတွင်)။ မီနူးကို ကြိုတင်ကြည့်ရှုနိုင်ပါသည်!`,
      callText: 'အရေးပေါ် မေးမြန်းရန်: ဆိုင်သို့ ဖုန်းဆက်ပါ'
    },
    FR: {
      pausedTitle: 'Commandes en Ligne Momentanément Suspendues',
      pausedDesc: `La cuisine prépare actuellement les commandes pour garantir la meilleure qualité. Nouvelles commandes dans : ${calc.remainingMinutes} min (à ${calc.reopenTimeFormatted})`,
      closedTitle: 'La Pizzeria est Actuellement Fermée',
      closedDesc: `Nous rouvrons aujourd'hui à ${calc.reopenTimeFormatted} (dans ${remH > 0 ? `${remH} h et ${remM} min` : `${remM} min`}). N'hésitez pas à consulter le menu !`,
      callText: 'Pour informations : Appeler la Pizzeria'
    },
    ES: {
      pausedTitle: 'Pedidos Online Temporalmente Pausados',
      pausedDesc: `La cocina está preparando pedidos para garantizar la máxima calidad. Nuevos pedidos en: ${calc.remainingMinutes} min (a las ${calc.reopenTimeFormatted})`,
      closedTitle: 'La Pizzería está Actualmente Cerrada',
      closedDesc: `Reabrimos hoy a las ${calc.reopenTimeFormatted} (en ${remH > 0 ? `${remH} horas y ${remM} min` : `${remM} min`}). ¡Puedes explorar nuestro menú!`,
      callText: 'Para información: Llamar a la Pizzería'
    },
    RU: {
      pausedTitle: 'Онлайн-заказы Временно Приостановлены',
      pausedDesc: `Кухня готовит заказы для гарантии наивысшего качества. Новые заказы через: ${calc.remainingMinutes} мин (в ${calc.reopenTimeFormatted})`,
      closedTitle: 'Пиццерия Сейчас Закрыта',
      closedDesc: `Мы открываемся сегодня в ${calc.reopenTimeFormatted} (через ${remH > 0 ? `${remH} ч и ${remM} мин` : `${remM} мин`}). Вы можете изучить наше меню!`,
      callText: 'Для справок: Позвонить в Пиццерию'
    },
    ZH: {
      pausedTitle: '在线点餐暂时暂停',
      pausedDesc: `后厨正在全力备餐以保证出品品质。将于 ${calc.remainingMinutes} 分钟后恢复接单（${calc.reopenTimeFormatted}）`,
      closedTitle: '披萨店目前已打烊',
      closedDesc: `我们今天将于 ${calc.reopenTimeFormatted} 重新开门营业（剩余 ${remH > 0 ? `${remH} 小时 ${remM} 分钟` : `${remM} 分钟`}）。欢迎浏览菜单！`,
      callText: '咨询信息：拨打餐厅电话'
    }
  };
  const activeContent = content[lang] || content["EN"] || content["IT"];

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
              {isPaused ? activeContent.pausedTitle : activeContent.closedTitle}
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
            {isPaused ? activeContent.pausedDesc : activeContent.closedDesc}
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
          <span>{activeContent.callText}</span>
        </a>
      </div>
    </aside>
  );
}
