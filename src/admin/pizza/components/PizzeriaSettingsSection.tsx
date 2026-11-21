import React, { useEffect, useState } from 'react';
import { usePizzaSettingsStore } from '../store/usePizzaSettingsStore';
import { PizzaServiceScheduleModal } from './PizzaServiceScheduleModal';
import { 
  fetchPizzeriaStatus, 
  calculateServiceState, 
  PizzeriaServiceStatus, 
  DEFAULT_PIZZERIA_STATUS,
  ServiceCalculationResult 
} from '../../../pizza/services/pizzaServiceStatus';
import { DiningNetworkSettingsCard } from './DiningNetworkSettingsCard';
import { 
  Pizza, 
  Globe, 
  CheckCircle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone,
  Clock,
  PauseCircle,
  Moon,
  Ban
} from 'lucide-react';

export const PizzeriaSettingsSection: React.FC = () => {
  const { settings, loading, error, fetchSettings } = usePizzaSettingsStore();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<PizzeriaServiceStatus>(DEFAULT_PIZZERIA_STATUS);
  const [serviceCalc, setServiceCalc] = useState<ServiceCalculationResult>(() => calculateServiceState(DEFAULT_PIZZERIA_STATUS));

  useEffect(() => {
    fetchPizzeriaStatus().then(st => {
      setServiceStatus(st);
      setServiceCalc(calculateServiceState(st));
    });
    const interval = setInterval(() => {
      fetchPizzeriaStatus().then(st => {
        setServiceStatus(st);
        setServiceCalc(calculateServiceState(st));
      });
    }, 20000);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('flower_power_service_status');
        bc.onmessage = (ev) => {
          if (ev.data?.type === 'STATUS_UPDATED' && ev.data?.status) {
            setServiceStatus(ev.data.status);
            setServiceCalc(calculateServiceState(ev.data.status));
          }
        };
      }
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center p-8 bg-stone-900/40 rounded-xl border border-stone-800">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mr-2" />
        <span className="text-stone-400 font-medium">Caricamento impostazioni...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-stone-900/90 rounded-3xl border border-stone-800 shadow-2xl max-w-4xl mx-auto my-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/40 rounded-2xl border border-red-500/30">
            <Pizza className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">
              Instradamento Pizzeria & Canale Ufficiale
            </h2>
            <p className="text-xs text-stone-400">
              Sistema di ordinazione 100% nativo proprietario su flowerpowerpizza.com collegato al Kitchen Monitor (KDS).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchSettings()}
          disabled={loading}
          className="p-2 hover:bg-stone-800 rounded-xl border border-stone-800 text-stone-400 hover:text-stone-200 transition-all cursor-pointer"
          title="Aggiorna impostazioni"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Status Live Banner: Hours & Pause */}
      <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            serviceCalc.state === 'open' 
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/40' 
              : serviceCalc.state === 'paused'
                ? 'bg-amber-950/60 text-amber-400 border border-amber-600/40'
                : 'bg-stone-800 text-stone-400 border border-stone-700'
          }`}>
            {serviceCalc.state === 'open' && <Clock className="w-5 h-5 animate-pulse" />}
            {serviceCalc.state === 'paused' && <PauseCircle className="w-5 h-5" />}
            {serviceCalc.state === 'closed' && <Moon className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                serviceCalc.state === 'open' 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50' 
                  : serviceCalc.state === 'paused'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                    : 'bg-stone-800 text-stone-300 border border-stone-700'
              }`}>
                {serviceCalc.stateText}
              </span>
              <span className="text-xs font-semibold text-stone-300">
                {serviceCalc.detail}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Orari standard: {serviceStatus.opening_time} - {serviceStatus.closing_time} (Ora Bangkok)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Gestisci Orari & Pausa</span>
        </button>
      </div>

      {/* Routing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Active: Sistema Custom Delivery React */}
        <div className="flex flex-col items-start p-6 rounded-2xl border text-left bg-emerald-950/20 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-bl-lg shadow-sm" />
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span className="font-black text-sm uppercase tracking-wider text-emerald-300">
              Sistema Delivery Nativo (100% Attivo)
            </span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed mb-4">
            Tutti gli ordini passano direttamente dal nuovo carrello React di <strong>flowerpowerpizza.com</strong>, con invio istantaneo al Kitchen Monitor (KDS), pagamenti PromptPay/Cash e geolocalizzazione GPS.
          </p>
          <div className="mt-auto flex items-center justify-between w-full">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ● ATTIVO ESCLUSIVO
            </span>
            <a
              href="/pizza"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Vedi Menu Live</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Decommissioned: Gloria Food / Foodbooking */}
        <div className="flex flex-col items-start p-6 rounded-2xl border text-left bg-stone-950/40 border-stone-850 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-5 h-5 text-red-400" />
            <span className="font-black text-sm uppercase tracking-wider text-stone-400">
              Piattaforme Esterne (Gloria Food / Foodbooking)
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            Account Gloria Food / Foodbooking definitivamente chiuso e disattivato. Nessun link o reindirizzamento esterno è presente sul sito.
          </p>
          <div className="mt-auto flex items-center justify-between w-full">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-800/40">
              DISMESSO DEFINITIVAMENTE
            </span>
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>0% Dipendenza Esterna</span>
            </span>
          </div>
        </div>

      </div>

      {/* Restaurant Wi-Fi Whitelist & Dining Tablet Network Protection */}
      <DiningNetworkSettingsCard />

      {/* Pizza Service & Hours Schedule Modal */}
      <PizzaServiceScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onStatusChanged={(st) => {
          setServiceStatus(st);
          setServiceCalc(calculateServiceState(st));
        }}
      />
    </div>
  );
};
