import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  CheckSquare, 
  Square, 
  Bed, 
  Bath, 
  Maximize, 
  Wrench, 
  FileText, 
  Check, 
  AlertCircle, 
  ArrowRight,
  Database,
  Globe
} from 'lucide-react';
import { useResortAdminStore } from '../store/useResortAdminStore';

export interface OctorateComparisonItem {
  id: string;
  slug: string;
  name: string;
  category?: string;
  octorateId?: number;
  dbData: {
    rooms: number;
    bathrooms: number;
    beds: string;
    squareMeters: number;
    features: string[];
    headline: string;
    description: string;
  };
  octorateData: {
    id: number;
    name: string;
    bedroomQuantity: number;
    bathroomQuantity: number;
    bedQuantity: number;
    squareMetersSize: number;
    roomAmenities: string[];
    headline: string;
    description: string;
  } | null;
}

export const OctorateImportSection: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [comparisons, setComparisons] = useState<OctorateComparisonItem[]>([]);

  // Selection states per accommodation ID
  const [selectedRooms, setSelectedRooms] = useState<Record<string, boolean>>({});
  const [selectedAmenities, setSelectedAmenities] = useState<Record<string, boolean>>({});
  const [selectedBedsBath, setSelectedBedsBath] = useState<Record<string, boolean>>({});
  const [selectedDescription, setSelectedDescription] = useState<Record<string, boolean>>({});

  // Fetch live comparison from backend handler
  const fetchComparisonData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/resort/octorate-import');
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: 'Errore risposta server' }));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Errore nel recupero dati da Octorate');
      }

      const items: OctorateComparisonItem[] = data.comparisons || [];
      setComparisons(items);

      // Pre-select all rooms and fields that have live Octorate data
      const initialRooms: Record<string, boolean> = {};
      const initialAmenities: Record<string, boolean> = {};
      const initialBedsBath: Record<string, boolean> = {};
      const initialDesc: Record<string, boolean> = {};

      items.forEach((item) => {
        if (item.octorateData) {
          initialRooms[item.id] = true;
          initialAmenities[item.id] = true;
          initialBedsBath[item.id] = true;
          initialDesc[item.id] = false; // Description off by default to avoid accidental overwrites
        }
      });

      setSelectedRooms(initialRooms);
      setSelectedAmenities(initialAmenities);
      setSelectedBedsBath(initialBedsBath);
      setSelectedDescription(initialDesc);
    } catch (err: any) {
      console.error('[OctorateImportSection] fetch error:', err);
      setError(err.message || 'Errore durante la connessione alle API di Octorate.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  // Toggle master select all rooms
  const handleToggleSelectAll = () => {
    const allSelected = comparisons.every((item) => selectedRooms[item.id]);
    const newRoomsState: Record<string, boolean> = {};
    const newAmenitiesState: Record<string, boolean> = {};
    const newBedsBathState: Record<string, boolean> = {};
    const newDescState: Record<string, boolean> = {};

    comparisons.forEach((item) => {
      if (item.octorateData) {
        newRoomsState[item.id] = !allSelected;
        newAmenitiesState[item.id] = !allSelected;
        newBedsBathState[item.id] = !allSelected;
        newDescState[item.id] = !allSelected;
      }
    });

    setSelectedRooms(newRoomsState);
    setSelectedAmenities(newAmenitiesState);
    setSelectedBedsBath(newBedsBathState);
    setSelectedDescription(newDescState);
  };

  // Toggle single room master checkbox
  const handleToggleRoom = (id: string) => {
    const nextVal = !selectedRooms[id];
    setSelectedRooms((prev) => ({ ...prev, [id]: nextVal }));
    setSelectedAmenities((prev) => ({ ...prev, [id]: nextVal }));
    setSelectedBedsBath((prev) => ({ ...prev, [id]: nextVal }));
  };

  // Apply Sync POST request to Supabase
  const handleApplySync = async () => {
    setSyncing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const selectedUpdates = comparisons
        .filter((item) => selectedRooms[item.id] && item.octorateData)
        .map((item) => ({
          id: item.id,
          slug: item.slug,
          syncAmenities: Boolean(selectedAmenities[item.id]),
          syncBedsBath: Boolean(selectedBedsBath[item.id]),
          syncDescription: Boolean(selectedDescription[item.id]),
          bedroomQuantity: item.octorateData?.bedroomQuantity,
          bathroomQuantity: item.octorateData?.bathroomQuantity,
          bedQuantity: item.octorateData?.bedQuantity,
          squareMetersSize: item.octorateData?.squareMetersSize,
          roomAmenities: item.octorateData?.roomAmenities,
          headline: item.octorateData?.headline,
          description: item.octorateData?.description
        }));

      if (selectedUpdates.length === 0) {
        throw new Error('Nessun alloggio selezionato per la sincronizzazione.');
      }

      const response = await fetch('/api/resort/octorate-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: selectedUpdates })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: 'Errore risposta server' }));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Errore durante l\'aggiornamento su Supabase');
      }

      setSuccessMessage(`✅ Sincronizzazione completata con successo! Aggiornati ${resData.updatedCount} alloggi su Supabase.`);
      
      // Refresh comparisons to show updated state
      await fetchComparisonData();
    } catch (err: any) {
      console.error('[OctorateImportSection] sync error:', err);
      setError(err.message || 'Errore durante l\'applicazione degli aggiornamenti.');
    } finally {
      setSyncing(false);
    }
  };

  const selectedCount = comparisons.filter((c) => selectedRooms[c.id]).length;

  return (
    <section 
      id="sec-octorate-import-module"
      className="bg-fuchsia-950/20 border-2 border-fuchsia-500/40 shadow-xl shadow-fuchsia-950/30 ring-1 ring-fuchsia-500/10 rounded-3xl p-6 space-y-6"
    >
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-fuchsia-500/20 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl text-fuchsia-400">
              <Sliders className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
              <span>📡 IMPORTAZIONE & SINCRONIZZAZIONE SPECIFICHE OCTORATE ➔ SUPABASE</span>
            </h3>
          </div>
          <p className="text-xs text-fuchsia-200/70 font-medium pl-1">
            Estrai e confronta in tempo reale le caratteristiche fisiche degli alloggi da Booking/Octorate (letti, bagni, metratura, servizi, descrizioni) ed aggiorna la tabella <code className="text-fuchsia-300 font-mono">accommodations</code> su Supabase.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            id="btn-fetch-octorate-comparison"
            type="button"
            onClick={fetchComparisonData}
            disabled={loading}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-850 border border-fuchsia-500/30 hover:border-fuchsia-400 text-fuchsia-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            title="Ricarica confronto da Octorate"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-fuchsia-400' : ''}`} />
            <span>{loading ? 'CARICAMENTO...' : 'RICARICA LIVE'}</span>
          </button>

          <button
            id="btn-sync-selected-accommodations"
            type="button"
            onClick={handleApplySync}
            disabled={syncing || selectedCount === 0}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-fuchsia-950/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'SINCRONIZZAZIONE...' : `⚡ SINCRONIZZA SELEZIONATI (${selectedCount})`}</span>
          </button>
        </div>
      </header>

      {/* FEEDBACK MESSAGES */}
      {error && (
        <div id="msg-octorate-import-error" className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl flex items-center gap-3 text-xs text-rose-200 font-semibold shadow-md">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div id="msg-octorate-import-success" className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-xs text-emerald-200 font-semibold shadow-md animate-fade-in">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* MASTER TOOLBAR */}
      <div className="flex items-center justify-between bg-stone-900/80 border border-fuchsia-500/20 px-4 py-3 rounded-2xl text-xs text-stone-300">
        <div className="flex items-center gap-3">
          <button
            id="btn-select-all-octorate-import"
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 text-fuchsia-300 font-bold hover:text-fuchsia-200 transition-colors cursor-pointer select-none"
          >
            {comparisons.length > 0 && comparisons.every((item) => selectedRooms[item.id]) ? (
              <CheckSquare className="w-4 h-4 text-fuchsia-400" />
            ) : (
              <Square className="w-4 h-4 text-stone-500" />
            )}
            <span>SELEZIONA TUTTI GLI ALLOGGI ({comparisons.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-stone-400 font-mono">
          {selectedCount} su {comparisons.length} alloggi pronti per la sincronizzazione
        </div>
      </div>

      {/* COMPARISON LIST / SPLIT-SCREEN CARDS */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-stone-950/40 border border-fuchsia-500/20 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-fuchsia-400 animate-spin mx-auto" />
          <p className="text-xs font-serif italic text-stone-400">
            Connessione a Octorate in corso... Recupero caratteristiche fisiche e servizi degli alloggi.
          </p>
        </div>
      ) : comparisons.length === 0 ? (
        <div className="p-8 text-center bg-stone-950/40 border border-stone-800 rounded-2xl text-xs text-stone-400">
          Nessun alloggio trovato per il confronto. Clicca su <strong className="text-fuchsia-300">"RICARICA LIVE"</strong> per interrogare Octorate.
        </div>
      ) : (
        <div className="space-y-6">
          {comparisons.map((item) => {
            const isSelected = Boolean(selectedRooms[item.id]);
            const hasOctorateData = Boolean(item.octorateData);

            return (
              <article 
                key={item.id}
                id={`card-octorate-sync-${item.id}`}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isSelected 
                    ? 'border-fuchsia-500/50 bg-stone-950/90 shadow-lg shadow-fuchsia-950/20 ring-1 ring-fuchsia-500/20' 
                    : 'border-stone-800 bg-stone-950/50 opacity-75 hover:opacity-100'
                }`}
              >
                {/* ROOM HEADER & SELECTION TOGGLES */}
                <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-stone-900/90 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <button
                      id={`chk-select-room-${item.id}`}
                      type="button"
                      disabled={!hasOctorateData}
                      onClick={() => handleToggleRoom(item.id)}
                      className="cursor-pointer text-fuchsia-400 hover:text-fuchsia-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-fuchsia-400" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-500" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.category && (
                          <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-[10px] text-fuchsia-300 font-bold rounded-md uppercase">
                            {item.category}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-mono">
                        ID Supabase: <span className="text-stone-300">{item.id}</span> | Slug: <span className="text-stone-300">{item.slug}</span> | Octorate ID: <span className="text-fuchsia-400 font-bold">{item.octorateId || item.octorateData?.id || 'Non Mappato'}</span>
                      </p>
                    </div>
                  </div>

                  {/* GRANULAR CHECKBOX OPTIONS */}
                  {hasOctorateData && (
                    <div className="flex flex-wrap items-center gap-3 bg-stone-950/80 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
                      <label 
                        htmlFor={`chk-amenities-${item.id}`}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-stone-300 cursor-pointer select-none hover:text-fuchsia-300"
                      >
                        <input
                          id={`chk-amenities-${item.id}`}
                          type="checkbox"
                          checked={Boolean(selectedAmenities[item.id])}
                          onChange={(e) => setSelectedAmenities(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          className="rounded border-stone-700 text-fuchsia-600 focus:ring-fuchsia-500 accent-fuchsia-500 cursor-pointer"
                        />
                        <Wrench className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Servizi ({item.octorateData?.roomAmenities.length || 0})</span>
                      </label>

                      <label 
                        htmlFor={`chk-beds-bath-${item.id}`}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-stone-300 cursor-pointer select-none hover:text-fuchsia-300"
                      >
                        <input
                          id={`chk-beds-bath-${item.id}`}
                          type="checkbox"
                          checked={Boolean(selectedBedsBath[item.id])}
                          onChange={(e) => setSelectedBedsBath(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          className="rounded border-stone-700 text-fuchsia-600 focus:ring-fuchsia-500 accent-fuchsia-500 cursor-pointer"
                        />
                        <Bed className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Letti & Bagni</span>
                      </label>

                      <label 
                        htmlFor={`chk-desc-${item.id}`}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-stone-300 cursor-pointer select-none hover:text-fuchsia-300"
                      >
                        <input
                          id={`chk-desc-${item.id}`}
                          type="checkbox"
                          checked={Boolean(selectedDescription[item.id])}
                          onChange={(e) => setSelectedDescription(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          className="rounded border-stone-700 text-fuchsia-600 focus:ring-fuchsia-500 accent-fuchsia-500 cursor-pointer"
                        />
                        <FileText className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Descrizione</span>
                      </label>
                    </div>
                  )}
                </header>

                {/* SPLIT-SCREEN COMPARISON BODY */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  {/* LEFT: SUPABASE CURRENT STATE */}
                  <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="font-black text-stone-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <span>SUPABASE (STATO ATTUALE NEL DATABASE)</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                        DB Attuale
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-stone-300 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-stone-400" />
                        <span>Camere: <strong>{item.dbData.rooms}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-3.5 h-3.5 text-stone-400" />
                        <span>Bagni: <strong>{item.dbData.bathrooms}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Maximize className="w-3.5 h-3.5 text-stone-400" />
                        <span>Metratura: <strong>{item.dbData.squareMeters ? `${item.dbData.squareMeters} m²` : 'N/D'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>Letti: <strong>{item.dbData.beds}</strong></span>
                      </div>
                    </div>

                    {/* FEATURES / AMENITIES */}
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase font-bold text-stone-400">Servizi / Features DB ({item.dbData.features.length}):</span>
                      {item.dbData.features.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.dbData.features.map((feat, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-stone-800/80 border border-stone-700/60 text-stone-300 text-[10px] rounded-md">
                              {feat}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-500 italic">Nessun servizio registrato.</span>
                      )}
                    </div>

                    {/* HEADLINE / DESCRIPTION */}
                    {(item.dbData.headline || item.dbData.description) && (
                      <div className="space-y-1 pt-1 border-t border-stone-800/60">
                        {item.dbData.headline && (
                          <p className="text-[11px] font-bold text-stone-200">
                            {item.dbData.headline}
                          </p>
                        )}
                        {item.dbData.description && (
                          <p className="text-[10px] text-stone-400 line-clamp-2 italic">
                            {item.dbData.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: OCTORATE LIVE STATE */}
                  <div className="bg-fuchsia-950/30 border border-fuchsia-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-2">
                      <span className="font-black text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                        <Globe className="w-4 h-4 text-fuchsia-400" />
                        <span>OCTORATE / BOOKING (DATI LIVE ESTRATTI)</span>
                      </span>
                      <span className="text-[10px] font-mono text-fuchsia-300 bg-fuchsia-900/60 border border-fuchsia-700/40 px-2 py-0.5 rounded-md">
                        {hasOctorateData ? 'Live Sync OK' : 'Non Trovato'}
                      </span>
                    </div>

                    {hasOctorateData && item.octorateData ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-fuchsia-100 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-fuchsia-400" />
                            <span>Camere: <strong className="text-white">{item.octorateData.bedroomQuantity}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bath className="w-3.5 h-3.5 text-fuchsia-400" />
                            <span>Bagni: <strong className="text-white">{item.octorateData.bathroomQuantity}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize className="w-3.5 h-3.5 text-fuchsia-400" />
                            <span>Metratura: <strong className="text-white">{item.octorateData.squareMetersSize ? `${item.octorateData.squareMetersSize} m²` : 'N/D'}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>Letti: <strong className="text-white">{item.octorateData.bedQuantity}</strong></span>
                          </div>
                        </div>

                        {/* OCTORATE AMENITIES */}
                        <div className="space-y-1">
                          <span className="block text-[10px] uppercase font-bold text-fuchsia-300">
                            Room Amenities Octorate ({item.octorateData.roomAmenities.length}):
                          </span>
                          {item.octorateData.roomAmenities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.octorateData.roomAmenities.map((amenity, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-fuchsia-900/50 border border-fuchsia-500/40 text-fuchsia-200 text-[10px] rounded-md font-semibold">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-fuchsia-300/60 italic">Nessun servizio restituito dalle API Octorate.</span>
                          )}
                        </div>

                        {/* OCTORATE HEADLINE / DESCRIPTION */}
                        {(item.octorateData.headline || item.octorateData.description) && (
                          <div className="space-y-1 pt-1 border-t border-fuchsia-500/20">
                            {item.octorateData.headline && (
                              <p className="text-[11px] font-bold text-fuchsia-100">
                                {item.octorateData.headline}
                              </p>
                            )}
                            {item.octorateData.description && (
                              <p className="text-[10px] text-fuchsia-200/70 line-clamp-2 italic">
                                {item.octorateData.description}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-6 text-center text-xs text-stone-400 italic">
                        Impossibile trovare un alloggio corrispondente su Octorate con ID <code className="text-stone-300 font-mono">{item.octorateId || 'n/a'}</code>.
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
