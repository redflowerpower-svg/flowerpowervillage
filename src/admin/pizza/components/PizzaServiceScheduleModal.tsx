import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  Moon, 
  Save, 
  XCircle, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  fetchPizzeriaStatus, 
  updatePizzeriaStatus, 
  calculateServiceState, 
  getBangkokTime,
  PizzeriaServiceStatus, 
  DEFAULT_PIZZERIA_STATUS,
  ServiceCalculationResult 
} from '../../../pizza/services/pizzaServiceStatus';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: (status: PizzeriaServiceStatus) => void;
}

export const PizzaServiceScheduleModal: React.FC<Props> = ({ isOpen, onClose, onStatusChanged }) => {
  const [serviceStatus, setServiceStatus] = useState<PizzeriaServiceStatus>(DEFAULT_PIZZERIA_STATUS);
  const [serviceCalc, setServiceCalc] = useState<ServiceCalculationResult>(() => calculateServiceState(DEFAULT_PIZZERIA_STATUS));
  const [editOpenTime, setEditOpenTime] = useState<string>('11:00');
  const [editCloseTime, setEditCloseTime] = useState<string>('21:30');
  const [customPauseMinutes, setCustomPauseMinutes] = useState<number>(45);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const syncStatus = async () => {
    const st = await fetchPizzeriaStatus();
    setServiceStatus(st);
    setServiceCalc(calculateServiceState(st));
    if (st.openingHours) {
      setEditOpenTime(st.openingHours.openTime || '11:00');
      setEditCloseTime(st.openingHours.closeTime || '21:30');
    }
  };

  useEffect(() => {
    if (isOpen) {
      syncStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('flower_power_service_status');
        bc.onmessage = (ev) => {
          if (ev.data?.type === 'STATUS_UPDATED' && ev.data?.status) {
            setServiceStatus(ev.data.status);
            setServiceCalc(calculateServiceState(ev.data.status));
            // Do NOT overwrite user editing inputs while modal is open
          }
        };
      }
    } catch (e) {}

    return () => {
      if (bc) bc.close();
    };
  }, []);

  if (!isOpen) return null;

  const handleSaveHours = async () => {
    setIsUpdating(true);
    const newOpeningHours = {
      openTime: editOpenTime,
      closeTime: editCloseTime,
      closedDays: serviceStatus.openingHours?.closedDays || []
    };
    const updated = await updatePizzeriaStatus({
      openingHours: newOpeningHours
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    if (updated.openingHours) {
      setEditOpenTime(updated.openingHours.openTime);
      setEditCloseTime(updated.openingHours.closeTime);
    }
    setIsUpdating(false);
    setSaveSuccess(true);
    if (onStatusChanged) onStatusChanged(updated);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleApplyPause = async (minutes: number) => {
    setIsUpdating(true);
    const pauseUntil = new Date(Date.now() + minutes * 60000).toISOString();
    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: pauseUntil,
      pauseReason: 'busy'
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setIsUpdating(false);
    if (onStatusChanged) onStatusChanged(updated);
    onClose();
  };

  const handleResumeService = async () => {
    setIsUpdating(true);
    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: null,
      pauseReason: ''
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setIsUpdating(false);
    if (onStatusChanged) onStatusChanged(updated);
    onClose();
  };

  const handleStopTonight = async () => {
    setIsUpdating(true);
    const updated = await updatePizzeriaStatus({
      isOpen: false,
      pausedUntil: null,
      pauseReason: 'closed_tonight'
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setIsUpdating(false);
    if (onStatusChanged) onStatusChanged(updated);
    onClose();
  };

  const handleForceOpenNow = async () => {
    setIsUpdating(true);
    const bangkok = getBangkokTime();
    const newOpen = bangkok.timeStr;

    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: null,
      pauseReason: '',
      openingHours: {
        ...serviceStatus.openingHours,
        openTime: newOpen
      }
    });
    setEditOpenTime(newOpen);
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setIsUpdating(false);
    if (onStatusChanged) onStatusChanged(updated);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#141824] border border-stone-700/80 rounded-3xl p-6 shadow-2xl text-stone-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-tight">
                Controllo Servizio Delivery & Orari
              </h3>
              <p className="text-xs text-stone-400">
                Sincronizzato in tempo reale tra Dashboard, Kitchen Monitor e Sito Web
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Live State Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          serviceCalc.state === 'OPEN'
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
            : serviceCalc.state === 'PAUSED'
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
              : 'bg-stone-900 border-stone-700 text-stone-300'
        }`}>
          <div className="flex items-center gap-3">
            {serviceCalc.state === 'OPEN' ? (
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : serviceCalc.state === 'PAUSED' ? (
              <PauseCircle className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-5 h-5 text-blue-300" />
            )}
            <div>
              <p className="text-xs font-black uppercase tracking-wider">
                {serviceCalc.state === 'OPEN' && 'Servizio Ordini: APERTO & ATTIVO'}
                {serviceCalc.state === 'PAUSED' && `Servizio Ordini: IN PAUSA (${serviceCalc.remainingMinutes} min rimanenti)`}
                {serviceCalc.state === 'CLOSED_OFF_HOURS' && 'Servizio Ordini: CHIUSO'}
              </p>
              <p className="text-[11px] text-stone-400">
                {serviceCalc.state === 'OPEN' && `Orario regolare: ${serviceStatus.openingHours.openTime} – ${serviceStatus.openingHours.closeTime}`}
                {serviceCalc.state === 'PAUSED' && `Riapertura automatica alle ore ${serviceCalc.reopenTimeFormatted}`}
                {serviceCalc.state === 'CLOSED_OFF_HOURS' && `Riapre alle ore ${serviceStatus.openingHours.openTime}`}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action: Reopen or Open Early */}
        {serviceCalc.state === 'PAUSED' && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleResumeService}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Riapri Ordini Online Adesso</span>
          </button>
        )}

        {serviceCalc.state === 'CLOSED_OFF_HOURS' && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleForceOpenNow}
            className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Avvia Servizio Adesso (Anticipa Apertura)</span>
          </button>
        )}

        {/* SECTION 1: PAUSA RAPIDA */}
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
            ⏸️ Pausa Temporanea (Blocca temporaneamente nuovi ordini)
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleApplyPause(30)}
              className="py-2.5 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-black text-xs uppercase border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              <span>⏸️ Pausa 30 min</span>
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleApplyPause(60)}
              className="py-2.5 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-black text-xs uppercase border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              <span>⏸️ Pausa 60 min</span>
            </button>
          </div>

          {/* Custom Pause Duration */}
          <div className="flex gap-2 items-center pt-1">
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
              disabled={isUpdating}
              onClick={() => handleApplyPause(customPauseMinutes)}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow disabled:opacity-50"
            >
              Applica Pausa ({customPauseMinutes} min)
            </button>
          </div>

          <button
            type="button"
            disabled={isUpdating}
            onClick={handleStopTonight}
            className="w-full py-2.5 rounded-xl bg-red-950/70 hover:bg-red-800 text-red-200 font-black text-xs uppercase border border-red-700/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors mt-2 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 text-red-400" />
            <span>Ferma Ordini per Stasera (Chiudi Cucina)</span>
          </button>
        </div>

        {/* SECTION 2: ORARI FISSI DI ESERCIZIO */}
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-300 uppercase tracking-wider block">
              🕒 Orari di Esercizio Pizzeria (Tutta la Delivery Food)
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span>🇹🇭</span>
              <span>Ranong (UTC+7)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-400 block mb-1">
                Orario Apertura
              </label>
              <input
                type="time"
                value={editOpenTime}
                onChange={(e) => setEditOpenTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#090b0e] border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-400 block mb-1">
                Orario Chiusura
              </label>
              <input
                type="time"
                value={editCloseTime}
                onChange={(e) => setEditCloseTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#090b0e] border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isUpdating}
            onClick={handleSaveHours}
            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow ${
              saveSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:text-white'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Orario Salvato ed Applicato al Sito!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>Salva ed Applica Nuovi Orari</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
