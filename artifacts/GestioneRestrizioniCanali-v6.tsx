import React, { useState, useEffect, memo } from 'react';
import { 
  useRestrictionsStore, 
  RATE_PLANS, 
  PlannedPeriod, 
  addDay 
} from './useRestrictionsStore-v6';

const TIMELINE_START = '2026-10-01';
const PX_PER_DAY = 6; // 6px per giorno per un perfetto righello di visualizzazione

const TIMELINE_MONTHS = [
  { label: 'ott', days: 31, year: 2026 },
  { label: 'nov', days: 30, year: 2026 },
  { label: 'dic', days: 31, year: 2026 },
  { label: 'gen', days: 31, year: 2027 },
  { label: 'feb', days: 28, year: 2027 },
  { label: 'mar', days: 31, year: 2027 },
  { label: 'apr', days: 30, year: 2027 },
  { label: 'mag', days: 31, year: 2027 }
];

const RESORT_ACCOMMODATIONS = [
  { slug: 'jungle-villa', name: 'Jungle Villa', hasAC: true },
  { slug: 'jungle-villa-left', name: 'Jungle Villa Left', hasAC: true },
  { slug: 'jungle-villa-right', name: 'Jungle Villa Right', hasAC: true },
  { slug: 'peace-love-villa', name: 'Peace & Love Villa', hasAC: true },
  { slug: 'villa-penthouse', name: 'Villa Penthouse', hasAC: true },
  { slug: 'yellow-bungalow', name: 'Yellow Bungalow', hasAC: true },
  { slug: 'red-bungalow', name: 'Red Bungalow', hasAC: true },
  { slug: 'green-bungalow', name: 'Green Bungalow', hasAC: true },
  { slug: 'lagoon-tent', name: 'Lagoon Tent', hasAC: false },
  { slug: 'camel-tent', name: 'Camel Tent', hasAC: false },
  { slug: 'internal-room', name: 'Internal Room', hasAC: false },
  { slug: 'room-1', name: 'Room 1', hasAC: true },
  { slug: 'room-2', name: 'Room 2', hasAC: true },
  { slug: 'room-3', name: 'Room 3', hasAC: true },
  { slug: 'room-4', name: 'Room 4', hasAC: true },
  { slug: 'room-5', name: 'Room 5', hasAC: true },
  { slug: 'lodge-1', name: 'Lodge 1', hasAC: true },
  { slug: 'lodge-2', name: 'Lodge 2', hasAC: true }
];

// Helper per formattare data ISO (YYYY-MM-DD) in italiano (GG/MM/AAAA)
const formatToItalianDate = (isoStr: string): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
  }
  return isoStr;
};

// Helper per calcolare la durata in giorni
const getDaysBetween = (from: string, to: string) => {
  const d1 = new Date(from);
  const d2 = new Date(to);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 14;
  const diff = d2.getTime() - d1.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
};

// Calcola la larghezza orizzontale in px basata sui giorni
const getPeriodWidth = (from: string, to: string) => {
  const days = getDaysBetween(from, to);
  return days * PX_PER_DAY;
};

// Calcola lo sfasamento (spacer) iniziale rispetto a TIMELINE_START
const getSpacerWidth = (from: string) => {
  const tStart = new Date(TIMELINE_START);
  const dStart = new Date(from);
  if (isNaN(dStart.getTime()) || dStart < tStart) return 0;
  const diff = dStart.getTime() - tStart.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days * PX_PER_DAY;
};

const isACRatePlan = (key: string): boolean => {
  return key.toLowerCase().includes('ac');
};

// --- SOTTO-COMPONENTI MEMOIZZATI PER RIDURRE I RE-RENDER ---

interface PeriodCardProps {
  p: PlannedPeriod;
  idx: number;
  ratePlanKey: string;
  isComparing: boolean;
  liveP?: PlannedPeriod;
  isSaving: boolean;
  syncStatus: string;
  onUpdate: (key: string, idx: number, updated: Partial<PlannedPeriod>) => void;
  onRemove: (key: string, idx: number) => void;
  onSync: (key: string, idx: number) => void;
  onAddNext: (key: string) => void;
  isLast: boolean;
}

const PeriodCard: React.FC<PeriodCardProps> = memo(({
  p,
  idx,
  ratePlanKey,
  isComparing,
  liveP,
  isSaving,
  syncStatus,
  onUpdate,
  onRemove,
  onSync,
  onAddNext,
  isLast
}) => {
  const isMismatched = !liveP || 
    p.dateFrom !== liveP.dateFrom || 
    p.dateTo !== liveP.dateTo || 
    p.onlyCheckoutDays !== liveP.onlyCheckoutDays;

  const isCircled = isComparing && isMismatched;
  const cardWidth = getPeriodWidth(p.dateFrom, p.dateTo);

  return (
    <div className="flex items-center gap-2 h-full">
      <div 
        className={`flex-shrink-0 rounded-2xl border p-4 bg-stone-950/80 transition-all ${
          isCircled 
            ? 'ring-4 ring-yellow-400 border-yellow-400 bg-yellow-950/20 shadow-[0_0_15px_rgba(234,179,8,0.6)]' 
            : 'border-stone-750'
        }`}
        style={{ width: `${Math.max(240, cardWidth)}px` }}
      >
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wide">inizio</span>
            <input 
              type="date"
              value={p.dateFrom}
              onClick={(e) => e.currentTarget.showPicker()}
              onFocus={(e) => e.currentTarget.showPicker()}
              onChange={(e) => onUpdate(ratePlanKey, idx, { dateFrom: e.target.value })}
              className="w-full text-xs bg-stone-900 border border-stone-800 hover:border-stone-750 focus:border-violet-500 rounded-lg px-2 py-1.5 text-violet-300 font-semibold focus:outline-none transition-all font-mono cursor-pointer"
            />
            <span className="text-[9px] text-stone-500 mt-0.5 block font-mono">
              {formatToItalianDate(p.dateFrom)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wide">fine</span>
            <input 
              type="date"
              value={p.dateTo}
              onClick={(e) => e.currentTarget.showPicker()}
              onFocus={(e) => e.currentTarget.showPicker()}
              onChange={(e) => onUpdate(ratePlanKey, idx, { dateTo: e.target.value })}
              className="w-full text-xs bg-stone-900 border border-stone-800 hover:border-stone-750 focus:border-violet-500 rounded-lg px-2 py-1.5 text-violet-300 font-semibold focus:outline-none transition-all font-mono cursor-pointer"
            />
            <span className="text-[9px] text-stone-500 mt-0.5 block font-mono">
              {formatToItalianDate(p.dateTo)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1.5 border-t border-stone-900/60 pt-2.5">
          <input 
            type="number"
            min="0"
            max="30"
            value={p.onlyCheckoutDays}
            onChange={(e) => onUpdate(ratePlanKey, idx, { onlyCheckoutDays: parseInt(e.target.value, 10) || 0 })}
            className="w-12 text-center text-xs bg-stone-900 border border-stone-800 focus:border-violet-500 rounded px-1 py-1 text-emerald-400 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[10px] text-stone-300 font-bold tracking-wider font-sans">GIORNI ONLY CHECK OUT</span>
        </div>

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-stone-900/40">
          <button
            onClick={() => onRemove(ratePlanKey, idx)}
            className="text-[10px] px-2 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 rounded transition-all font-semibold"
          >
            Rimuovi
          </button>
          <button
            onClick={() => onSync(ratePlanKey, idx)}
            disabled={isSaving}
            className={`px-2.5 py-1 text-[10px] font-bold rounded shadow transition-all ${
              syncStatus === 'syncing'
                ? 'bg-amber-600 text-stone-100'
                : syncStatus === 'success'
                ? 'bg-emerald-600 text-stone-100'
                : 'bg-violet-850 hover:bg-violet-700 text-stone-100 border border-violet-500/30'
            }`}
          >
            {syncStatus === 'syncing' ? '⏳...' : syncStatus === 'success' ? '✅ Sincronizzato' : '⚡ Sync'}
          </button>
        </div>
      </div>

      {isLast && (
        <button
          onClick={() => onAddNext(ratePlanKey)}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-850 hover:bg-violet-900 text-violet-300 hover:text-white font-bold border border-stone-750 hover:border-violet-500 flex items-center justify-center transition-all shadow-md z-20 cursor-pointer"
          title="Aggiungi periodo successivo (Data Inizio auto-calcolata)"
        >
          +
        </button>
      )}
    </div>
  );
});

PeriodCard.displayName = 'PeriodCard';

// Componente principale della vista
export const GestioneRestrizioniCanali: React.FC = () => {
  const {
    plannedPeriods,
    liveOctorateRestrictions,
    isSaving,
    isBulkSaving,
    bulkSyncProgress,
    isComparing,
    setIsComparing,
    updatePlannedPeriod,
    addNextPlannedPeriod,
    removePlannedPeriod,
    syncRatePlanToOctorate,
    syncAllRatePlansToOctorate,
    fetchLiveRestrictions
  } = useRestrictionsStore();

  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({});
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveRestrictions();
  }, [fetchLiveRestrictions]);

  const handleSyncPeriod = async (ratePlanKey: string, index: number) => {
    const syncKey = `${ratePlanKey}_${index}`;\n    setSyncStatus(prev => ({ ...prev, [syncKey]: 'syncing' }));
    
    const res = await syncRatePlanToOctorate(ratePlanKey, index);
    if (res.success) {
      setSyncStatus(prev => ({ ...prev, [syncKey]: 'success' }));\n      setTimeout(() => setSyncStatus(prev => ({ ...prev, [syncKey]: '' })), 3000);
    } else {
      setSyncStatus(prev => ({ ...prev, [syncKey]: 'error' }));\n      alert(`Errore di sincronizzazione: ${res.message}`);
    }
  };

  const handleBulkSyncAll = async () => {
    const confirmAction = window.confirm(
      '⚠️ ATTENZIONE: Sei sicuro di voler sincronizzare in blocco TUTTI i 12 piani tariffari reali su Octorate PMS?\\nLa procedura verrà eseguita in sequenza di sicurezza per garantire la stabilità di rete.'
    );
    if (!confirmAction) return;

    const res = await syncAllRatePlansToOctorate();
    if (res.success) {
      alert('🎉 Sincronizzazione bulk completata con successo su Octorate!');
    } else {
      alert(`⚠️ Errore di sincronizzazione bulk: ${res.message}`);
    }
  };

  return (
    <div className="p-6 bg-stone-900 border border-violet-500/20 rounded-xl shadow-2xl text-stone-100 max-w-full overflow-hidden">
      {/* INTESTAZIONE GENERALE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-2">
            🌳 GESTIONE TARIFFE DERIVATE (RESTRIZIONI & FAILSAFE) - V6
          </h2>
          <p className="text-sm text-stone-400 mt-1">
            Matrice orizzontale proporzionale (6px/giorno) ottimizzata con sub-componenti React.memo ed eventi dedicati.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`px-4 py-2 rounded text-sm font-semibold shadow-md border transition-all ${
              isComparing
                ? 'bg-yellow-400 border-yellow-300 text-stone-950 font-bold hover:bg-yellow-300 animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
          >
            ⚖️ {isComparing ? 'Nascondi Discrepanze' : 'Evidenzia Discrepanze'}
          </button>
          
          <button
            onClick={handleBulkSyncAll}
            disabled={isBulkSaving}
            className={`px-4 py-2 rounded text-sm font-bold shadow-md border flex items-center gap-2 transition-all ${
              isBulkSaving
                ? 'bg-amber-600 border-amber-500 text-stone-100 cursor-not-allowed animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-red-800 hover:bg-red-700 text-stone-100 border-red-650'
            }`}
          >
            {isBulkSaving 
              ? `⏳ SINC BULK (${bulkSyncProgress.current}/${bulkSyncProgress.total})` 
              : '⚡ SINCRONIZZAZIONE BULK...'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* 👑 TABELLA 1: PLANCIA LOCALE EDITABILE */}
        <div className="p-5 bg-stone-950/40 border border-stone-800 rounded-xl">
          <h3 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
            👑 Tabella 1: Plancia di Pianificazione Locale (Editabile)
          </h3>

          <div className="flex border border-stone-800/80 rounded-lg overflow-hidden bg-stone-950/20">
            
            {/* COLONNA SINISTRA: PIANI TARIFFARI */}
            <div className="w-[280px] min-w-[280px] border-r border-stone-800 bg-stone-900/40 select-none">
              <div className="h-12 border-b border-stone-800 flex items-center px-4 bg-stone-950/60">
                <span className="text-xs uppercase text-stone-400 tracking-wider font-bold">Piani Tariffari / Canali</span>
              </div>
              <div className="divide-y divide-stone-850">
                {RATE_PLANS.map(rp => (
                  <div key={rp.key} className="transition-all">
                    <div 
                      onClick={() => setExpandedPlan(expandedPlan === rp.key ? null : rp.key)}
                      className={`p-4 cursor-pointer hover:bg-stone-850/40 transition-colors ${expandedPlan === rp.key ? 'bg-violet-950/10' : ''}`}
                    >\n                      <div className="font-bold text-stone-200 text-sm font-mono flex items-center justify-between">
                        <span>{rp.label}</span>
                        <span className="text-[10px] text-stone-500 font-sans">
                          {expandedPlan === rp.key ? '▼ Nascondi' : '▲ Camere'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1 font-mono">{rp.fullName}</div>
                      <div className="text-[10px] text-violet-400 mt-0.5 bg-violet-950/30 px-1.5 py-0.5 rounded w-fit border border-violet-500/10 font-mono">
                        {rp.agencies}
                      </div>
                    </div>

                    {expandedPlan === rp.key && (
                      <div className="bg-stone-950/60 p-2 space-y-1.5 border-t border-stone-850/50">
                        <div className="text-[10px] uppercase text-stone-500 font-bold px-2 pb-1 border-b border-stone-900">Alloggi Associati:</div>
                        {RESORT_ACCOMMODATIONS.map(acc => {
                          const isBlocked = isACRatePlan(rp.key) && !acc.hasAC;
                          return (
                            <div key={acc.slug} className="flex justify-between items-center px-2 py-1 text-xs">
                              <span className={`font-medium ${isBlocked ? 'text-stone-600 line-through' : 'text-stone-300'}`}>
                                {acc.name}
                              </span>
                              {isBlocked ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-950/40 text-red-400 rounded border border-red-950/30 font-semibold">
                                  ❄️ Bloccato (No AC)
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 rounded border border-emerald-950/30 font-semibold">
                                  🟢 Attivo
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* COLONNA DESTRA: TIMELINE GRAFICA ORIZZONTALE */}
            <div className="flex-1 overflow-x-auto">
              
              {/* TIMELINE MONTHS HEADER */}
              <div className="h-12 border-b border-stone-800 flex bg-stone-950/40 relative select-none">
                {TIMELINE_MONTHS.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="border-r border-stone-900/60 flex items-center justify-center text-sm font-semibold text-stone-300 uppercase tracking-wider"
                    style={{ width: `${m.days * PX_PER_DAY}px` }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>

              {/* TIMELINE ROWS */}
              <div className="divide-y divide-stone-850">
                {RATE_PLANS.map(rp => {
                  const periods = plannedPeriods[rp.key] || [];
                  const livePeriods = liveOctorateRestrictions[rp.key] || [];
                  const spacerWidth = periods.length > 0 ? getSpacerWidth(periods[0].dateFrom) : 0;

                  return (
                    <div 
                      key={rp.key} 
                      className="min-h-[148px] flex items-center relative transition-all"
                      style={{ height: expandedPlan === rp.key ? `${148 + RESORT_ACCOMMODATIONS.length * 28 + 30}px` : '148px' }}
                    >
                      {spacerWidth > 0 && (
                        <div style={{ width: `${spacerWidth}px` }} className="flex-shrink-0 h-full border-r border-stone-800/10 bg-stone-950/5" />
                      )}

                      <div className="flex items-center gap-2 px-3 relative h-full">
                        {periods.map((p, idx) => {
                          const liveP = livePeriods[idx];
                          const syncKey = `${rp.key}_${idx}`;

                          return (
                            <PeriodCard
                              key={p.id}
                              p={p}
                              idx={idx}
                              ratePlanKey={rp.key}
                              isComparing={isComparing}
                              liveP={liveP}
                              isSaving={isSaving}
                              syncStatus={syncStatus[syncKey] || ''}
                              onUpdate={updatePlannedPeriod}
                              onRemove={removePlannedPeriod}
                              onSync={handleSyncPeriod}
                              onAddNext={addNextPlannedPeriod}
                              isLast={idx === periods.length - 1}
                            />
                          );
                        })}

                        {periods.length === 0 && (
                          <button
                            onClick={() => addNextPlannedPeriod(rp.key)}
                            className="w-10 h-10 rounded-full bg-stone-850 hover:bg-violet-900 text-violet-300 hover:text-white font-bold border border-stone-750 flex items-center justify-center transition-all"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* 📡 TABELLA 2: DATI LIVE DA OCTORATE */}
        <div className="p-5 bg-stone-950/40 border border-stone-800 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-violet-300 flex items-center gap-2">
              📡 Tabella 2: Stato di Allineamento Live (Scaricato da Octorate)
            </h3>
            <span className="text-xs text-stone-400 bg-stone-950 px-3 py-1 rounded-full border border-stone-800 font-sans">
              🟢 Coincide | 🟡 Discrepanza Rilevata
            </span>
          </div>

          <div className="flex border border-stone-800/80 rounded-lg overflow-hidden bg-stone-950/20">
            
            <div className="w-[280px] min-w-[280px] border-r border-stone-800 bg-stone-900/40 select-none">
              <div className="h-12 border-b border-stone-800 flex items-center px-4 bg-stone-950/60">
                <span className="text-xs uppercase text-stone-400 tracking-wider font-bold">Piani Tariffari / Canali</span>
              </div>
              <div className="divide-y divide-stone-850">
                {RATE_PLANS.map(rp => (
                  <div key={rp.key} className="p-4 bg-stone-900/10">
                    <div className="font-bold text-stone-300 text-sm font-mono">{rp.label}</div>
                    <div className="text-[11px] text-stone-500 mt-1 font-mono">{rp.fullName}</div>
                    <div className="text-[10px] text-violet-500 mt-0.5 font-mono">🔗 {rp.agencies}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              
              <div className="h-12 border-b border-stone-800 flex bg-stone-950/40 relative select-none">
                {TIMELINE_MONTHS.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="border-r border-stone-900/60 flex items-center justify-center text-sm font-semibold text-stone-300 uppercase tracking-wider"
                    style={{ width: `${m.days * PX_PER_DAY}px` }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-stone-850">
                {RATE_PLANS.map(rp => {
                  const periods = plannedPeriods[rp.key] || [];
                  const livePeriods = liveOctorateRestrictions[rp.key] || [];
                  const spacerWidth = livePeriods.length > 0 ? getSpacerWidth(livePeriods[0].dateFrom) : 0;

                  return (
                    <div key={rp.key} className="h-[148px] flex items-center relative">
                      {spacerWidth > 0 && (
                        <div style={{ width: `${spacerWidth}px` }} className="flex-shrink-0 h-full border-r border-stone-800/10 bg-stone-950/5" />
                      )}

                      <div className="flex items-center gap-2 px-3 relative h-full">
                        {livePeriods.map((liveP, idx) => {
                          const period = periods[idx];
                          const isMismatched = !period || 
                            period.dateFrom !== liveP.dateFrom || 
                            period.dateTo !== liveP.dateTo || 
                            period.onlyCheckoutDays !== liveP.onlyCheckoutDays;

                          const isCircled = isComparing && isMismatched;
                          const cardWidth = getPeriodWidth(liveP.dateFrom, liveP.dateTo);

                          return (
                            <div 
                              key={liveP.id}
                              className={`flex-shrink-0 rounded-2xl border p-4 transition-all ${
                                isCircled 
                                  ? 'bg-yellow-950/30 border-2 border-yellow-400 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.5)] scale-[1.03] font-bold' 
                                  : isMismatched
                                  ? 'bg-amber-950/20 border border-amber-500/20 text-amber-300'
                                  : 'bg-emerald-950/15 border border-emerald-500/25 text-emerald-400'
                              }`}
                              style={{ width: `${Math.max(240, cardWidth)}px` }}
                            >
                              <div className="flex justify-between items-center mb-1 text-xs">
                                <span className="font-semibold uppercase text-stone-400">Periodo:</span>
                                <span className="font-mono font-bold bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                                  {formatToItalianDate(liveP.dateFrom)} ➔ {formatToItalianDate(liveP.dateTo)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-1.5 border-t border-stone-900/60 pt-2.5">
                                <div className="w-12 text-center text-xs bg-stone-900 border border-stone-800 rounded px-1 py-1 text-emerald-400 font-bold font-mono">
                                  {liveP.onlyCheckoutDays}
                                </div>
                                <span className="text-[10px] text-stone-300 font-bold tracking-wider font-sans">GIORNI ONLY CHECK OUT</span>
                              </div>

                              {isMismatched && (
                                <div className={`text-[10px] mt-2 font-sans flex items-center gap-1 font-bold ${isCircled ? 'text-yellow-400' : 'text-amber-500'}`}>
                                  ⚠️ Discrepanza rilevata col modello locale!
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};