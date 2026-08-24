import React, { useEffect, useState } from 'react';
import { usePizzaSettingsStore, PizzaRoutingMode } from '../store/usePizzaSettingsStore';
import { 
  Pizza, 
  Globe, 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone,
  Utensils,
  CalendarCheck,
  ShoppingBag
} from 'lucide-react';

export const PizzeriaSettingsSection: React.FC = () => {
  const { settings, loading, error, fetchSettings, updateSettings } = usePizzaSettingsStore();
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [tableUrl, setTableUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setDeliveryUrl(settings.gloriaFoodDeliveryUrl || '');
      setTableUrl(settings.gloriaFoodTableUrl || '');
    }
  }, [settings]);

  const handleToggleMode = async (mode: PizzaRoutingMode) => {
    if (!settings) return;
    const success = await updateSettings({ routingMode: mode });
    if (success) {
      triggerSuccessMessage();
    }
  };

  const handleSaveUrls = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const success = await updateSettings({ 
      gloriaFoodDeliveryUrl: deliveryUrl,
      gloriaFoodTableUrl: tableUrl
    });
    if (success) {
      triggerSuccessMessage();
    }
  };

  const triggerSuccessMessage = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

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
              Instradamento Pizzeria & Link Ufficiali
            </h2>
            <p className="text-xs text-stone-400">
              Gestisci l'ambiente visibile ai clienti e i link ufficiali diretti di Gloria Food (Cibo e Tavoli).
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

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Errore: {error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Impostazioni e link aggiornati con successo!</span>
        </div>
      )}

      {/* Main Switch Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Option 1: Gloria Food (Landing Provvisoria Protetta con 2 Link) */}
        <button
          type="button"
          onClick={() => handleToggleMode('gloria_food')}
          className={`flex flex-col items-start p-6 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            settings?.routingMode === 'gloria_food'
              ? 'bg-amber-950/20 border-amber-500/60 ring-2 ring-amber-500/20 shadow-xl'
              : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 opacity-60 hover:opacity-100'
          }`}
        >
          {settings?.routingMode === 'gloria_food' && (
            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-amber-500 rounded-bl-lg shadow-sm" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <Globe className={`w-5 h-5 ${settings?.routingMode === 'gloria_food' ? 'text-amber-400' : 'text-stone-400'}`} />
            <span className={`font-black text-sm uppercase tracking-wider ${settings?.routingMode === 'gloria_food' ? 'text-amber-300' : 'text-stone-300'}`}>
              Ambiente Provvisorio (Gloria Food)
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            Mostra la landing page Flower Power con i 2 pulsanti diretti e protetti per <strong>Ordinazione Cibo</strong> e <strong>Prenotazione Tavolo</strong> su Gloria Food.
          </p>
          <div className="mt-auto flex items-center justify-between w-full">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
              settings?.routingMode === 'gloria_food'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-stone-850 text-stone-500'
            }`}>
              {settings?.routingMode === 'gloria_food' ? '● ATTIVO ORA PER GLI OSPITI' : 'Inattivo'}
            </span>
            <a
              href="/pizza"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Vedi Anteprima</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </button>

        {/* Option 2: Nuovo Sistema Custom Delivery React */}
        <button
          type="button"
          onClick={() => handleToggleMode('custom')}
          className={`flex flex-col items-start p-6 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
            settings?.routingMode === 'custom'
              ? 'bg-emerald-950/20 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xl'
              : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 opacity-60 hover:opacity-100'
          }`}
        >
          {settings?.routingMode === 'custom' && (
            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-bl-lg shadow-sm" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className={`w-5 h-5 ${settings?.routingMode === 'custom' ? 'text-emerald-400' : 'text-stone-400'}`} />
            <span className={`font-black text-sm uppercase tracking-wider ${settings?.routingMode === 'custom' ? 'text-emerald-300' : 'text-stone-300'}`}>
              Nuovo Sistema Delivery Custom (React)
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            Abilita l'ordinazione diretta nel nostro portale React, con catalogo dinamico, geolocalizzazione GPS, pagamenti PromptPay e tracciamento rider in tempo reale.
          </p>
          <div className="mt-auto flex items-center justify-between w-full">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
              settings?.routingMode === 'custom'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-stone-850 text-stone-500'
            }`}>
              {settings?.routingMode === 'custom' ? '● ATTIVO ORA PER GLI OSPITI' : 'Inattivo'}
            </span>
            <a
              href="/pizza?mode=custom"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Vedi Anteprima</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </button>

      </div>

      {/* Two Direct Gloria Food URLs Configuration */}
      <div className="p-6 bg-stone-950/50 rounded-2xl border border-stone-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-stone-200 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            Configurazione Link Ufficiali Gloria Food
          </h3>
          <span className="text-[10px] text-stone-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Apertura protetta senza rischi di iframe o perdita cookie
          </span>
        </div>

        <form onSubmit={handleSaveUrls} className="space-y-4">
          
          {/* Field 1: Ordinazione Cibo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-red-400" />
                1. Link Ordinazione Cibo (Delivery & Asporto)
              </label>
              {deliveryUrl && (
                <a
                  href={deliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
            <input
              type="url"
              value={deliveryUrl}
              onChange={(e) => setDeliveryUrl(e.target.value)}
              placeholder="https://www.foodbooking.com/ordering/restaurant/menu?company_uid=...&restaurant_uid=..."
              required
              className="w-full bg-stone-900 border border-stone-800 hover:border-stone-700 focus:border-red-500 text-stone-200 text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all font-mono"
            />
          </div>

          {/* Field 2: Prenotazione Tavolo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                2. Link Prenotazione Tavolo (Table Reservation)
              </label>
              {tableUrl && (
                <a
                  href={tableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
            <input
              type="url"
              value={tableUrl}
              onChange={(e) => setTableUrl(e.target.value)}
              placeholder="https://www.foodbooking.com/ordering/restaurant/menu/reservation?company_uid=...&restaurant_uid=..."
              required
              className="w-full bg-stone-900 border border-stone-800 hover:border-stone-700 focus:border-amber-500 text-stone-200 text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all font-mono"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:bg-stone-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40"
            >
              <Save className="w-4 h-4" />
              <span>Salva Entrambi i Link</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
