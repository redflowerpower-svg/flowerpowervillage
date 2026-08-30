import { Pizza, Hotel, MapPin, ArrowRight, ShieldCheck, Activity, BellRing, CalendarCheck, FileText, Sparkles, Lock, CreditCard } from 'lucide-react';

interface AdminGatewayProps {
  onSelectDepartment: (dept: 'pizza' | 'resort' | 'docs' | 'payments') => void;
}

export function AdminGateway({ onSelectDepartment }: AdminGatewayProps) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-950 text-stone-100 px-4 py-8 md:py-12 flex flex-col justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Bivio di Selezione Reparto
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Scegli il Modulo da Gestire
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
            Seleziona la dashboard desiderata per accedere alla gestione operativa della Pizzeria (Ranong), del Villaggio (Koh Phayam), del Web Reader Documenti o del Centro Pagamenti.
          </p>
        </div>

        {/* Split Cards Grid (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          
          {/* Card 1: Resort / Booking Engine (Koh Phayam) */}
          <div
            onClick={() => onSelectDepartment('resort')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-emerald-600/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-5">
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
                  <Activity className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Sync Octorate PMS</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-5 mt-5 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-3 px-4 bg-stone-800 group-hover:bg-emerald-700 text-stone-200 group-hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Accedi Resort</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Pizzeria (Ranong) */}
          <div
            onClick={() => onSelectDepartment('pizza')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-red-600/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-700 via-amber-600 to-red-600 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-5">
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
                  Pipeline ordini live, stato cucina, notifiche sonore e geolocalizzazione rider.
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
            <div className="pt-5 mt-5 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-3 px-4 bg-stone-800 group-hover:bg-red-700 text-stone-200 group-hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Accedi Pizzeria</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Document & PDF Web Reader (LLM Ready) */}
          <div
            onClick={() => onSelectDepartment('docs')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-sky-600/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-sky-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-400 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-5">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 shadow-inner group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 bg-stone-950 border border-stone-800 text-stone-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  LLM & AI
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-sky-400 transition-colors">
                  📄 Web Reader Documenti
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Carica PDF, Word, immagini e genera pagine web HTML fedeli per la lettura automatica di agenti AI.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-stone-850">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>OCR Multi-lingua (IT, EN, TH)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Link Segreti & noindex Sicuro</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-5 mt-5 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-3 px-4 bg-stone-800 group-hover:bg-sky-700 text-stone-200 group-hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Accedi Web Reader</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 4: Payments & Multi-Gateway Center */}
          <div
            onClick={() => onSelectDepartment('payments')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-5">
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
                  💳 Centro Pagamenti
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  Gestione, alternanza e simulazione per Stripe, Ksher (THB), Omise e PayPal con Test Lab integrato.
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
            <div className="pt-5 mt-5 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-3 px-4 bg-stone-800 group-hover:bg-amber-600 text-stone-200 group-hover:text-stone-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Gestisci Pagamenti</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
