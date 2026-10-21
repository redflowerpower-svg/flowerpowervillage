import { Pizza, Hotel, MapPin, ArrowRight, ShieldCheck, Activity, BellRing, CalendarCheck, FileText, Sparkles, CreditCard, Video, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminGatewayProps {
  onSelectDepartment: (dept: 'pizza' | 'resort' | 'docs' | 'payments') => void;
}

export function AdminGateway({ onSelectDepartment }: AdminGatewayProps) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-950 text-stone-100 px-4 py-6 md:py-10 flex flex-col justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-inner">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Staff Portal · Admin FP
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Pannello di Controllo & Gestione
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
            Seleziona il modulo per accedere alla gestione operativa del Resort (Koh Phayam), della Pizzeria (Ranong), del Centro Pagamenti o del Social Studio.
          </p>
        </div>

        {/* Primary Operational Cards Grid (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          
          {/* Card 1: Resort / Booking Engine (Koh Phayam) */}
          <div
            onClick={() => onSelectDepartment('resort')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-emerald-600/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Hotel className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 bg-stone-950 border border-stone-800 text-stone-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  Koh Phayam
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  🏨 Resort & Booking
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Alloggi, disponibilità, prenotazioni ospiti e sincronizzazione Octorate Channel Manager.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-stone-850">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Prenotazioni & Occupazione</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Activity className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span>Sync Octorate PMS</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 mt-4 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-stone-800 group-hover:bg-emerald-700 text-stone-200 group-hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Accedi Resort</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Pizzeria & Delivery (Ranong) */}
          <div
            onClick={() => onSelectDepartment('pizza')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-red-600/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-700 via-amber-600 to-red-600 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Pizza className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 bg-stone-950 border border-stone-800 text-stone-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-red-500" />
                  Ranong
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-red-400 transition-colors">
                  🍕 Pizzeria & Delivery
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Pipeline ordini live, stato cucina KDS, notifiche sonore e geolocalizzazione rider.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-stone-850">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Activity className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span>Pipeline Ordini & Cucina</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <BellRing className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Alert Telegram & Rider GPS</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 mt-4 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-stone-800 group-hover:bg-red-700 text-stone-200 group-hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Accedi Pizzeria</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Payments & Multi-Gateway Center */}
          <div
            onClick={() => onSelectDepartment('payments')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 bg-stone-950 border border-stone-800 text-stone-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Multi-Gateway
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                  💳 Gestione Pagamenti
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Alternanza gateway per Stripe, Ksher (THB), Omise e PayPal con Test Lab e report contabili.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-stone-850">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Switch Live Gateway Primario</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>🧪 Test Lab & Simulatore</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 mt-4 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-stone-800 group-hover:bg-amber-600 text-stone-200 group-hover:text-stone-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Gestisci Pagamenti</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 4: Social Media Studio (TikTok, Meta, Reels, AutoCut) */}
          <Link
            to="/social"
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-fuchsia-600/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-fuchsia-950/20 cursor-pointer flex flex-col justify-between overflow-hidden text-left"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-rose-500 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-950/60 border border-fuchsia-800/60 flex items-center justify-center text-fuchsia-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 bg-stone-950 border border-stone-800 text-fuchsia-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  TikTok & Meta
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-fuchsia-400 transition-colors">
                  📱 Social Studio
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Regia video AutoCut 9:16 con 9 formati, player Ken Burns, meteo Ranong e DeepSeek AI copywriter.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-stone-850">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Video className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" />
                  <span>AutoCut 9 Formati & Ken Burns</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                  <span>DeepSeek AI & Proverbio</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4 mt-4 border-t border-stone-800/60">
              <div className="w-full py-2.5 px-4 bg-stone-800 group-hover:bg-gradient-to-r group-hover:from-fuchsia-600 group-hover:to-pink-600 text-stone-200 group-hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow">
                <span>Apri Social Studio</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </Link>

        </div>

        {/* Secondary Section: Support Tools & Archive (Web Reader Documenti) */}
        <div className="pt-6 border-t border-stone-850/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-600"></span>
              Moduli Secondari & Strumenti di Supporto
            </span>
            <span className="text-[11px] text-stone-400">
              Modulo documentale opzionale
            </span>
          </div>

          <div
            onClick={() => onSelectDepartment('docs')}
            className="group relative bg-stone-900/50 hover:bg-stone-900/90 border border-stone-800 hover:border-sky-700/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-950/50 border border-sky-800/50 flex items-center justify-center text-sky-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    📄 Web Reader & Documenti
                  </h4>
                  <span className="bg-sky-950/80 border border-sky-800/60 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Archivio & OCR
                  </span>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed max-w-3xl">
                  Caricamento PDF, Word, immagini e generazione di pagine web HTML per la lettura automatica di agenti AI.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="py-2 px-3.5 bg-stone-800 group-hover:bg-sky-700 text-stone-300 group-hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all flex-shrink-0 cursor-pointer self-end sm:self-auto"
            >
              <span>Accedi Web Reader</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
