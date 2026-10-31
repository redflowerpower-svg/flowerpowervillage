import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wine as WineIcon, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Save,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { WineCardData, INITIAL_WINE_COLLECTION, renderCountryFlag, formatWineProductName } from '../../../pizza/data/wineData';
import { fetchCloudWineCollection } from '../../../pizza/data/wineCloudService';
import { 
  fetchVillageWineConfig, 
  saveVillageWineConfig, 
  VillageWineConfig 
} from '../../../booking/services/villageWineCloudService';

export const VillageWineManager: React.FC = () => {
  const [wines, setWines] = useState<WineCardData[]>([]);
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Caricamento iniziale dei dati
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [cloudWines, villageConfig] = await Promise.all([
          fetchCloudWineCollection(),
          fetchVillageWineConfig()
        ]);

        if (isMounted) {
          const list = (cloudWines && cloudWines.length > 0) ? cloudWines : INITIAL_WINE_COLLECTION;
          setWines(list);
          setDisabledIds(new Set(villageConfig.disabledWineIds || []));
          setPriceOverrides(villageConfig.priceOverrides || {});
        }
      } catch (err) {
        console.error('[VillageWineManager] Errore caricamento:', err);
        if (isMounted) {
          setWines(INITIAL_WINE_COLLECTION);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Toggle disponibilità singolo vino
  const handleToggleWine = (wineId: string) => {
    setDisabledIds(prev => {
      const next = new Set(prev);
      if (next.has(wineId)) {
        next.delete(wineId); // Ora è ATTIVO
      } else {
        next.add(wineId); // Ora è DISATTIVATO / ESAURITO
      }
      return next;
    });
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  // Attiva tutti
  const handleEnableAll = () => {
    setDisabledIds(new Set());
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  // Disattiva tutti
  const handleDisableAll = () => {
    const allIds = new Set(wines.map(w => w.id));
    setDisabledIds(allIds);
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  // Salva configurazione nel Cloud
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: VillageWineConfig = {
        disabledWineIds: Array.from(disabledIds),
        priceOverrides: priceOverrides,
        updatedAt: new Date().toISOString()
      };
      const res = await saveVillageWineConfig(payload);
      if (res.success) {
        setHasUnsavedChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Errore nel salvataggio cloud: ' + (res.error || 'Verifica la connessione'));
      }
    } catch (e: any) {
      alert('Errore: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtro vini per ricerca e categoria
  const filteredWines = useMemo(() => {
    return wines.filter(w => {
      // Filtro categoria
      if (selectedCategory !== 'all' && w.categoryType !== selectedCategory) {
        return false;
      }
      // Filtro ricerca
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (w.title || '').toLowerCase();
      const titleIt = (w.titleIt || '').toLowerCase();
      const titleEn = (w.titleEn || '').toLowerCase();
      const sub = (w.categorySubtitle || '').toLowerCase();
      const desc = (w.description || '').toLowerCase();
      return title.includes(q) || titleIt.includes(q) || titleEn.includes(q) || sub.includes(q) || desc.includes(q);
    });
  }, [wines, selectedCategory, searchQuery]);

  const totalCount = wines.length;
  const disabledCount = disabledIds.size;
  const activeCount = Math.max(0, totalCount - disabledCount);

  if (loading) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-stone-300">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-3" />
        <p className="font-bold">Caricamento Carta dei Vini del Villaggio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Testata di Controllo & Statistiche */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                <WineIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Carta dei Vini — Koh Phayam</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold tracking-normal uppercase">
                    Resort Live
                  </span>
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm mt-0.5">
                  Metti o togli i vini disponibili al Villaggio. I vini attivi vengono mostrati istantaneamente a chi inquadra il codice QR <code className="text-amber-300 font-mono text-xs">/wine-list</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/wine-list"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700 hover:border-amber-400/40 shadow-sm"
              title="Apri la pagina pubblica della carta vini in una nuova scheda"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Anteprima Pagina QR</span>
            </a>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 animate-pulse ring-2 ring-amber-400/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizzazione Cloud...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Salvato nel Cloud!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{hasUnsavedChanges ? 'Salva Modifiche Cloud' : 'Cloud Sincronizzato'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pillole Statistiche Radar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-stone-800/80">
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-3">
            <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Vini in Catalogo</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{totalCount}</div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3">
            <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Attivi al Villaggio</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">{activeCount}</div>
          </div>

          <div className="bg-rose-950/20 border border-rose-800/30 rounded-xl p-3">
            <div className="text-[11px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              <span>Esauriti / Disattivati</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-300 mt-0.5">{disabledCount}</div>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 flex flex-col justify-between">
            <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Azioni Rapide</div>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handleEnableAll}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Attiva Tutti
              </button>
              <span className="text-stone-600">•</span>
              <button
                type="button"
                onClick={handleDisableAll}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
              >
                Disattiva Tutti
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Avviso modifiche non salvate */}
      {hasUnsavedChanges && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-amber-300 text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Hai delle modifiche non salvate sulla disponibilità dei vini. Clicca &quot;Salva Modifiche Cloud&quot; per renderle visibili a tutti i clienti.</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 bg-amber-500 text-stone-950 rounded-lg text-xs font-black uppercase hover:bg-amber-400 transition-all shrink-0 cursor-pointer"
          >
            Salva Ora
          </button>
        </div>
      )}

      {/* Barra Ricerca & Filtri Categoria */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-3">
        {/* Ricerca testuale */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per nome vino, vitigno o regione..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categorie Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Tutti' },
            { id: 'red', label: '🔴 Rossi' },
            { id: 'white', label: '⚪ Bianchi' },
            { id: 'rose', label: '🌸 Rosati' },
            { id: 'sparkling', label: '🥂 Bollicine' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Griglia Schede Vini con Switch On/Off */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWines.map((wine) => {
          const isDisabled = disabledIds.has(wine.id);
          const isAvailableAtVillage = !isDisabled;

          return (
            <div
              key={wine.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isAvailableAtVillage
                  ? 'bg-stone-900/90 border-stone-700/80 shadow-md hover:border-emerald-500/50'
                  : 'bg-stone-950/60 border-stone-800/80 opacity-60 hover:opacity-90'
              }`}
            >
              {/* Parte Superiore: Info & Foto */}
              <div className="p-4 flex items-start gap-3.5">
                {/* Bottiglia */}
                <div className="w-16 h-24 bg-stone-950/90 rounded-xl border border-stone-800/80 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                  {wine.bottleImage ? (
                    <img
                      src={wine.bottleImage}
                      alt={wine.title}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <WineIcon className="w-6 h-6 text-stone-600" />
                  )}
                  {isDisabled && (
                    <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[1px] flex items-center justify-center">
                      <EyeOff className="w-5 h-5 text-rose-400" />
                    </div>
                  )}
                </div>

                {/* Dettagli vino */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm">{renderCountryFlag(wine)}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {wine.categoryType?.toUpperCase()}
                    </span>
                    {wine.alcohol && (
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-800 px-1.5 py-0.2 rounded">
                        {wine.alcohol}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-stone-100 text-sm leading-snug mt-1 truncate font-serif">
                    {formatWineProductName(wine.title || wine.titleIt || wine.titleEn)}
                  </h3>

                  <p className="text-[11px] text-stone-400 italic truncate mt-0.5">
                    {wine.categorySubtitle || wine.subtitleIt || wine.subtitleEn || 'Vino Pregiato Selezionato'}
                  </p>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-stone-400 text-xs">Prezzo:</span>
                    <span className="text-sm font-black text-amber-400">
                      {wine.price || '1,190'} ฿
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra Inferiore: Interruttore Metti / Togli */}
              <div className={`px-4 py-3 border-t flex items-center justify-between gap-3 ${
                isAvailableAtVillage
                  ? 'bg-emerald-950/30 border-emerald-800/30'
                  : 'bg-rose-950/20 border-rose-900/30'
              }`}>
                <div className="flex items-center gap-2">
                  {isAvailableAtVillage ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Attivo al Villaggio</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-400 uppercase tracking-wider">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Esaurito / Nascosto</span>
                    </span>
                  )}
                </div>

                {/* Switch Button */}
                <button
                  type="button"
                  onClick={() => handleToggleWine(wine.id)}
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAvailableAtVillage ? 'bg-emerald-500' : 'bg-stone-700'
                  }`}
                  aria-pressed={isAvailableAtVillage}
                  title={isAvailableAtVillage ? 'Clicca per disattivare vino' : 'Clicca per attivare vino'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isAvailableAtVillage ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWines.length === 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400">
          <WineIcon className="w-8 h-8 mx-auto text-stone-600 mb-2" />
          <p className="font-bold">Nessun vino trovato per i criteri selezionati.</p>
        </div>
      )}
    </div>
  );
};

