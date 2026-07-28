import { Pizza, Hotel, MapPin, ArrowRight, ShieldCheck, Activity, BellRing, CalendarCheck } from 'lucide-react';

interface AdminGatewayProps {
  onSelectDepartment: (dept: 'pizza' | 'resort') => void;
}

export function AdminGateway({ onSelectDepartment }: AdminGatewayProps) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-950 text-stone-100 px-4 py-8 md:py-12 flex flex-col justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Bivio di Selezione Reparto
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Scegli il Reparto da Gestire
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
            Seleziona la dashboard desiderata per accedere alla gestione operativa della Pizzeria (Ranong) o del Villaggio (Koh Phayam).
          </p>
        </div>

        {/* Split Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4">
          
          {/* Card 1: Resort / Booking Engine (Koh Phayam) */}
          <div
            onClick={() => onSelectDepartment('resort')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-emerald-600/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-6">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Hotel className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 bg-stone-950 border border-stone-800 text-stone-300 text-xs font-bold px-3 py-1 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  Koh Phayam
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  🏨 Resort & Booking Engine
                </h3>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  Gestione alloggi (Bungalows, Ville, Glamping, Hub), prenotazioni ospiti, tariffe scontate dirette e stato integrazione Octorate Channel Manager.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-stone-850">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <CalendarCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Panoramica Prenotazioni & Statistiche Occupazione</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Hotel className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Catalogo Alloggi & Stato Disponibilità</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Activity className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Sincronizzazione Octorate Channel Manager (ID 366879)</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-6 mt-6 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-3.5 px-5 bg-stone-800 group-hover:bg-emerald-700 text-stone-200 group-hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Accedi al Resort</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Pizzeria (Ranong) */}
          <div
            onClick={() => onSelectDepartment('pizza')}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-red-600/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-950/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-700 via-amber-600 to-red-600 rounded-t-3xl group-hover:h-2 transition-all"></div>

            <div className="space-y-6">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Pizza className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 bg-stone-950 border border-stone-800 text-stone-300 text-xs font-bold px-3 py-1 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Ranong
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                  🍕 Pizzeria & Delivery Food
                </h3>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  Gestione ordini in tempo reale, cambio stati in cucina, notifiche sonore immediate e tracciamento GPS dei rider sul territorio di Ranong.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-stone-850">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Activity className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>Pipeline Ordini Live & Monitor Cucina</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <BellRing className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Notifiche Sonore & Telegram Alert</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Mappe e Geolocalizzazione Rider GPS</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-6 mt-6 border-t border-stone-800/60">
              <button
                type="button"
                className="w-full py-3.5 px-5 bg-stone-800 group-hover:bg-red-700 text-stone-200 group-hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>Accedi alla Pizzeria</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
