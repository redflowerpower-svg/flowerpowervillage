import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Pizza,
  Palmtree,
  Flame,
  Tv,
  Smartphone,
  CheckSquare,
  Square,
  ExternalLink,
  StopCircle
} from 'lucide-react';
import { AutoCutLabMode, AutoCutTestRun } from '../services/autoCutLabEngine';
import { StudioTopicKey, TELEGRAM_STUDIO_CONFIG } from '../config/telegramStudioConfig';
import { dispatchPostToTelegramTopic } from '../services/telegramStudioDispatcher';
import { generatePostCopy } from '../services/autoCutCopywriterEngine';

export interface AutoCutBatchDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: AutoCutLabMode;
  onSelectMode: (mode: AutoCutLabMode) => Promise<void>;
  testsByMode: Partial<Record<AutoCutLabMode, AutoCutTestRun>>;
  createTestForMode: (mode: AutoCutLabMode) => Promise<AutoCutTestRun>;
}

export interface AvailableVideoOption {
  id: string; // e.g. "P1_9:16" o "P1_4:3"
  mode: AutoCutLabMode;
  aspectRatio: '9:16' | '4:3';
  category: 'pizza' | 'village' | 'stories';
  title: string;
  durationLabel: string;
}

/**
 * Tutte e 12 le sole opzioni video reali disponibili:
 * - 9 verticali (9:16)
 * - 3 orizzontali (4:3) disponibili ESCLUSIVAMENTE per P1, V1 e LM1
 */
export const AVAILABLE_VIDEO_OPTIONS: AvailableVideoOption[] = [
  // 🍕 Pizzeria Ranong (5 opzioni)
  { id: 'P1_9:16', mode: 'P1', aspectRatio: '9:16', category: 'pizza', title: '1 Piatto Culinario Iconico', durationLabel: '~12s · Rapido' },
  { id: 'P1_4:3',  mode: 'P1', aspectRatio: '4:3',  category: 'pizza', title: '1 Piatto Culinario Iconico', durationLabel: '~12s · Rapido' },
  { id: 'P2_9:16', mode: 'P2', aspectRatio: '9:16', category: 'pizza', title: '2 Piatti & Connessioni Culinari', durationLabel: '~18s · Medio' },
  { id: 'P3_9:16', mode: 'P3', aspectRatio: '9:16', category: 'pizza', title: '3 Piatti Menu Completo', durationLabel: '~24s · Vetrina' },
  { id: 'DS_9:16', mode: 'DS', aspectRatio: '9:16', category: 'pizza', title: 'Daily Special Fuori Menu', durationLabel: '~15s · Live Specials' },

  // 🌴 Villaggio Koh Phayam (4 opzioni)
  { id: 'V1_9:16', mode: 'V1', aspectRatio: '9:16', category: 'village', title: '3 Alloggi Tropicali Panoramica', durationLabel: '~24s · Alloggi' },
  { id: 'V1_4:3',  mode: 'V1', aspectRatio: '4:3',  category: 'village', title: '3 Alloggi Tropicali Panoramica', durationLabel: '~24s · Alloggi' },
  { id: 'V2_9:16', mode: 'V2', aspectRatio: '9:16', category: 'village', title: '5 Foto Stesso Alloggio', durationLabel: '~37s · Suite Tour' },
  { id: 'V3_9:16', mode: 'V3', aspectRatio: '9:16', category: 'village', title: '7 Alloggi Resort & Verande', durationLabel: '~50s · Grand Tour' },

  // ⚡ Stories Koh Phayam (3 opzioni)
  { id: 'R1_9:16',  mode: 'R1',  aspectRatio: '9:16', category: 'stories', title: 'Ristorante Buffalo Bay Ranong & Phayam', durationLabel: '~25s · Stories Delivery' },
  { id: 'LM1_9:16', mode: 'LM1', aspectRatio: '9:16', category: 'stories', title: 'Last Minute Alloggi Liberi (Prezzi Reali)', durationLabel: '~25s · Stories Flash' },
  { id: 'LM1_4:3',  mode: 'LM1', aspectRatio: '4:3',  category: 'stories', title: 'Last Minute Alloggi Liberi (Prezzi Reali)', durationLabel: '~25s · Stories Flash' }
];

interface ItemStatus {
  state: 'idle' | 'preparing' | 'rendering' | 'uploading' | 'dispatching' | 'done' | 'error';
  progress: number;
  message: string;
  videoUrl?: string;
  error?: string;
}

export function AutoCutBatchDispatcherModal({
  isOpen,
  onClose,
  activeMode,
  onSelectMode,
  testsByMode,
  createTestForMode
}: AutoCutBatchDispatcherModalProps) {
  // Lista diretta degli ID selezionati tra le 12 opzioni (nessuna spuntata di default all'apertura)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetTopic, setTargetTopic] = useState<StudioTopicKey>('tikTokStories');

  // Queue runner state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [queueItems, setQueueItems] = useState<AvailableVideoOption[]>([]);
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>({});
  const [overallSummary, setOverallSummary] = useState<{ total: number; success: number; failed: number } | null>(null);

  const isCancelledRef = useRef(false);

  // All'apertura della sezione, assicurati che tutte le opzioni non siano spuntate di default
  useEffect(() => {
    if (isOpen && !isProcessing) {
      setSelectedIds([]);
      setOverallSummary(null);
    }
  }, [isOpen]);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  // Toggle singola opzione video
  const handleToggleId = (id: string) => {
    if (isProcessing) return;
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Presets intelligenti a 1 tocco
  const handleSelectAll = () => {
    if (isProcessing) return;
    setSelectedIds(AVAILABLE_VIDEO_OPTIONS.map(o => o.id));
  };
  const handleSelectOnly916 = () => {
    if (isProcessing) return;
    setSelectedIds(AVAILABLE_VIDEO_OPTIONS.filter(o => o.aspectRatio === '9:16').map(o => o.id));
  };
  const handleSelectOnly43 = () => {
    if (isProcessing) return;
    setSelectedIds(AVAILABLE_VIDEO_OPTIONS.filter(o => o.aspectRatio === '4:3').map(o => o.id));
  };
  const handleSelectPizza = () => {
    if (isProcessing) return;
    setSelectedIds(AVAILABLE_VIDEO_OPTIONS.filter(o => o.category === 'pizza').map(o => o.id));
  };
  const handleSelectVillageAndStories = () => {
    if (isProcessing) return;
    setSelectedIds(AVAILABLE_VIDEO_OPTIONS.filter(o => o.category === 'village' || o.category === 'stories').map(o => o.id));
  };
  const handleDeselectAll = () => {
    if (isProcessing) return;
    setSelectedIds([]);
  };

  // Avvio sequenziale di compilazione e invio a Telegram
  const handleStartBatch = async () => {
    const items = AVAILABLE_VIDEO_OPTIONS.filter(o => selectedIds.includes(o.id));
    if (items.length === 0) return;

    setQueueItems(items);
    setIsProcessing(true);
    isCancelledRef.current = false;
    setOverallSummary(null);

    // Inizializza gli stati di ogni elemento
    const initStatuses: Record<string, ItemStatus> = {};
    items.forEach(it => {
      initStatuses[it.id] = {
        state: 'idle',
        progress: 0,
        message: 'In attesa'
      };
    });
    setItemStatuses(initStatuses);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < items.length; i++) {
      if (isCancelledRef.current) break;

      const item = items[i];
      setCurrentIndex(i);

      // Aggiorna stato iniziale elemento
      setItemStatuses(prev => ({
        ...prev,
        [item.id]: {
          state: 'preparing',
          progress: 5,
          message: `Caricamento formato ${item.mode}...`
        }
      }));

      try {
        // 1. Carica / Attiva la modalità richiesta nel Player
        await onSelectMode(item.mode);

        // Attendi che il player sia pronto con la modalità corretta
        let waitAttempts = 0;
        while (
          waitAttempts < 25 &&
          ((window as any).__autoCutCurrentMode !== item.mode || !(window as any).__autoCutGetVideo)
        ) {
          if (isCancelledRef.current) break;
          await new Promise(r => setTimeout(r, 200));
          waitAttempts++;
        }

        if (isCancelledRef.current) break;

        // Breve pausa per sincronizzazione canvas e font
        await new Promise(r => setTimeout(r, 350));

        if (typeof window === 'undefined' || !(window as any).__autoCutGetVideo) {
          throw new Error('Motore video WebCodecs non pronto nel browser.');
        }

        // 2. Registrazione e Compilazione Video (60 FPS con aspect ratio 9:16 o 4:3)
        setItemStatuses(prev => ({
          ...prev,
          [item.id]: {
            state: 'rendering',
            progress: 15,
            message: `Rendering 60 FPS (${item.aspectRatio === '4:3' ? '1440x1080 4:3' : '1080x1920 9:16'})...`
          }
        }));

        const videoUrl = await (window as any).__autoCutGetVideo(
          (pct: number, _stepIdx?: number, stepMsg?: string) => {
            if (isCancelledRef.current) return;
            const mappedPct = Math.min(88, Math.round(15 + (pct * 0.73)));
            setItemStatuses(prev => ({
              ...prev,
              [item.id]: {
                state: pct >= 88 ? 'uploading' : 'rendering',
                progress: mappedPct,
                message: stepMsg || `Rendering 60 FPS (${pct}%)...`
              }
            }));
          },
          { aspectRatio: item.aspectRatio }
        );

        if (isCancelledRef.current) break;

        if (!videoUrl) {
          throw new Error('La compilazione video non ha restituito un URL valido.');
        }

        // 3. Preparazione Copy Bilingue e Dispatching verso Telegram
        setItemStatuses(prev => ({
          ...prev,
          [item.id]: {
            state: 'dispatching',
            progress: 92,
            message: 'Invio al canale Telegram...',
            videoUrl
          }
        }));

        const testRun: AutoCutTestRun | undefined =
          (window as any).__lastAutoCutTestRun || testsByMode[item.mode];

        const isPizza = item.category === 'pizza';
        const brand = isPizza ? 'pizza' : 'village';

        // Estrazione copy intelligente (cache AI o motore deterministico bilingue)
        let captionText = '';
        const cacheKey = `autocut_ai_copy_${testRun?.signature || item.mode}`;
        try {
          const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.thaiContent || parsed.englishContent)) {
              captionText =
                targetTopic === 'tikTokStories'
                  ? (parsed.fullCaptionTikTok || `${parsed.thaiContent}\n\n${parsed.englishContent}`)
                  : (parsed.fullCaptionInstagram || `${parsed.thaiContent}\n\n${parsed.englishContent}`);
            }
          }
        } catch (e) {}

        if (!captionText && testRun) {
          const copyResult = generatePostCopy(testRun, 0);
          captionText =
            targetTopic === 'tikTokStories'
              ? copyResult.fullCaptionTikTok
              : copyResult.fullCaptionInstagram;
        }

        if (!captionText) {
          captionText = `🔥 Video Ufficiale Flower Power · Format ${item.mode}\n\n👉 Scopri di più su https://flowerpowerpizza.com o https://flowerpowervillage.com!`;
        }

        const aspectLabel = item.aspectRatio === '4:3' ? '🖥️ 4:3 Orizzontale (1440x1080)' : '📱 9:16 Verticale (1080x1920)';
        const brandLabel = brand === 'pizza' ? 'Flower Power Pizza (Ranong)' : 'Flower Power Farm Village (Koh Phayam)';

        const tgRes = await dispatchPostToTelegramTopic({
          topic: targetTopic,
          title: `Video Test · Format ${item.mode} (${aspectLabel})`,
          copyText: `Target: ${brandLabel}\n\n${captionText}`,
          format: item.mode,
          brand: brand,
          priceBadge: testRun?.scenes?.[0]?.priceLabel,
          videoUrl: videoUrl,
          mediaUrl: videoUrl,
          thumbnailUrl: (window as any).__lastGeneratedThumbnailUrl,
          mediaType: 'video'
        });

        if (!tgRes.success) {
          throw new Error(tgRes.error || 'Errore durante la trasmissione Telegram');
        }

        // Elemento completato con successo
        setItemStatuses(prev => ({
          ...prev,
          [item.id]: {
            state: 'done',
            progress: 100,
            message: 'Inviato a Telegram con successo!',
            videoUrl
          }
        }));
        successCount++;

        // Pausa di rispetto rate-limit Telegram tra un video e l'altro (1.2s)
        await new Promise(r => setTimeout(r, 1200));

      } catch (err: any) {
        console.error(`[AutoCutBatch] Errore su ${item.id}:`, err);
        setItemStatuses(prev => ({
          ...prev,
          [item.id]: {
            state: 'error',
            progress: 100,
            message: `Errore: ${err?.message || 'Compilazione o invio fallito'}`,
            error: err?.message || 'Errore imprevisto'
          }
        }));
        failedCount++;
      }
    }

    setIsProcessing(false);
    setCurrentIndex(-1);
    setOverallSummary({
      total: items.length,
      success: successCount,
      failed: failedCount
    });
  };

  // Interruzione manuale del batch
  const handleCancelBatch = () => {
    isCancelledRef.current = true;
    setIsProcessing(false);
  };

  const selectedCount = selectedIds.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div className="bg-[#0e1422] border border-cyan-500/30 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto relative">
        
        {/* Glow decorativo superiore */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-950/50">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Video Test Telegram
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Batch Quality Check
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Seleziona i video che desideri controllare. Il sistema li compilerà a 60 FPS in sequenza e li invierà in fila al tuo Telegram.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto relative z-10 custom-scrollbar">

          {/* BARRA PRESET RAPIDI A 1 TOCCO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Selezionati: <strong className="text-white font-mono">{selectedCount}</strong> di 12 video</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
              >
                Tutti (12)
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSelectOnly916}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition"
              >
                Solo 9:16 (9)
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSelectOnly43}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border border-amber-600/40 transition shadow-sm"
              >
                Solo 4:3 (3)
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSelectPizza}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition"
              >
                Pizzeria (5)
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSelectVillageAndStories}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
              >
                Villaggio (7)
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDeselectAll}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition"
              >
                Deseleziona
              </button>
            </div>
          </div>

          {/* GRIGLIA UNIFICATA DELLE 12 OPZIONI VIDEO REALI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            {/* 1. Colonna Pizzeria Ranong (5 Opzioni) */}
            <div className="bg-slate-900/40 border border-rose-950/40 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <Pizza className="w-3.5 h-3.5" />
                  <span>Pizzeria Ranong</span>
                </div>
                <span className="text-[10px] text-rose-400/80 font-mono">5 Opzioni</span>
              </div>

              <div className="space-y-1.5">
                {AVAILABLE_VIDEO_OPTIONS.filter(o => o.category === 'pizza').map(opt => {
                  const isSelected = selectedIds.includes(opt.id);
                  const is43 = opt.aspectRatio === '4:3';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleToggleId(opt.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? is43
                            ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm shadow-amber-950/30'
                            : 'bg-rose-500/15 border-rose-500/50 text-white shadow-sm shadow-rose-950/30'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            isSelected
                              ? is43
                                ? 'bg-amber-500 text-black'
                                : 'bg-rose-500 text-white'
                              : 'border border-slate-600'
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3 h-3" />}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-white">{opt.mode}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                is43
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {is43 ? '4:3' : '9:16'}
                            </span>
                          </div>
                          <div className="text-[11px] truncate opacity-90">{opt.title}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {opt.durationLabel.split('·')[0].trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Colonna Villaggio Koh Phayam (4 Opzioni) */}
            <div className="bg-slate-900/40 border border-emerald-950/40 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Palmtree className="w-3.5 h-3.5" />
                  <span>Villaggio Koh Phayam</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono">4 Opzioni</span>
              </div>

              <div className="space-y-1.5">
                {AVAILABLE_VIDEO_OPTIONS.filter(o => o.category === 'village').map(opt => {
                  const isSelected = selectedIds.includes(opt.id);
                  const is43 = opt.aspectRatio === '4:3';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleToggleId(opt.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? is43
                            ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm shadow-amber-950/30'
                            : 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm shadow-emerald-950/30'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            isSelected
                              ? is43
                                ? 'bg-amber-500 text-black'
                                : 'bg-emerald-500 text-white'
                              : 'border border-slate-600'
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3 h-3" />}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-white">{opt.mode}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                is43
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {is43 ? '4:3' : '9:16'}
                            </span>
                          </div>
                          <div className="text-[11px] truncate opacity-90">{opt.title}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {opt.durationLabel.split('·')[0].trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Colonna Stories Koh Phayam (3 Opzioni) */}
            <div className="bg-slate-900/40 border border-amber-950/40 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Stories Koh Phayam</span>
                </div>
                <span className="text-[10px] text-amber-400/80 font-mono">3 Opzioni</span>
              </div>

              <div className="space-y-1.5">
                {AVAILABLE_VIDEO_OPTIONS.filter(o => o.category === 'stories').map(opt => {
                  const isSelected = selectedIds.includes(opt.id);
                  const is43 = opt.aspectRatio === '4:3';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleToggleId(opt.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? is43
                            ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm shadow-amber-950/30'
                            : 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm shadow-amber-950/30'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-amber-500 text-black'
                              : 'border border-slate-600'
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3 h-3" />}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-white">{opt.mode}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                is43
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {is43 ? '4:3' : '9:16'}
                            </span>
                          </div>
                          <div className="text-[11px] truncate opacity-90">{opt.title}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {opt.durationLabel.split('·')[0].trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* DESTINAZIONE TELEGRAM */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Destinazione Telegram Staff</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setTargetTopic('tikTokStories')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  targetTopic === 'tikTokStories'
                    ? 'bg-sky-500/15 border-sky-400/60 shadow-lg shadow-sky-950/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="text-2xl">📱</div>
                <div>
                  <div className={`text-xs font-bold ${targetTopic === 'tikTokStories' ? 'text-sky-300' : 'text-white'}`}>
                    Topic 3: TikTok Stories & Reels
                  </div>
                  <div className="text-[10px] text-slate-400">
                    threadId: 3 · Ricezione video con copy bilingue
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setTargetTopic('kohPhayamGroup')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  targetTopic === 'kohPhayamGroup'
                    ? 'bg-emerald-500/15 border-emerald-400/60 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="text-2xl">🌴</div>
                <div>
                  <div className={`text-xs font-bold ${targetTopic === 'kohPhayamGroup' ? 'text-emerald-300' : 'text-white'}`}>
                    Topic 2: Koh Phayam Group FB
                  </div>
                  <div className="text-[10px] text-slate-400">
                    threadId: 2 · Ricezione video per Gruppo Facebook
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* MONITOR PROGRESSO SEQUENZIALE & CODA (QUANDO ATTIVO O COMPLETATO) */}
          {(isProcessing || queueItems.length > 0) && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span>Elaborazione Video in Corso ({currentIndex + 1} di {queueItems.length})</span>
                    </>
                  ) : overallSummary ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Riepilogo Test: {overallSummary.success} Inviati / {overallSummary.failed} Errori</span>
                    </>
                  ) : (
                    <span>Coda Video Pronta</span>
                  )}
                </span>
                
                {isProcessing && (
                  <button
                    type="button"
                    onClick={handleCancelBatch}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Interrompi</span>
                  </button>
                )}
              </div>

              {/* Progress Bar Generale */}
              {isProcessing && (
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 h-full transition-all duration-300"
                    style={{
                      width: `${Math.round(((Math.max(0, currentIndex) + 0.5) / queueItems.length) * 100)}%`
                    }}
                  />
                </div>
              )}

              {/* Lista Dettagliata Elementi in Coda */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {queueItems.map((item, idx) => {
                  const status = itemStatuses[item.id] || { state: 'idle', progress: 0, message: 'In attesa' };
                  const isCurrent = isProcessing && currentIndex === idx;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                        isCurrent
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                          : status.state === 'done'
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                          : status.state === 'error'
                          ? 'bg-rose-500/5 border-rose-500/30 text-rose-300'
                          : 'bg-slate-800/30 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {status.state === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : status.state === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono shrink-0">
                            {idx + 1}
                          </div>
                        )}

                        <div className="truncate">
                          <span className="font-bold text-white mr-1.5">{item.mode} ({item.aspectRatio})</span>
                          <span className="text-[11px] opacity-80">· {status.message}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {status.videoUrl && (
                          <a
                            href={status.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                          >
                            <span>Video MP4</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <span className="font-mono text-[10px] text-slate-400 w-8 text-right">
                          {status.progress}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0a0f1a] flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="text-xs text-slate-400">
            {isProcessing ? (
              <span className="text-cyan-300 flex items-center gap-1.5 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Compilazione video in corso: mantieni attiva questa scheda.
              </span>
            ) : (
              <span>
                Selezionati: <strong className="text-white">{selectedCount} video</strong> da compilare
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition disabled:opacity-40"
            >
              Chiudi
            </button>

            <button
              type="button"
              onClick={handleStartBatch}
              disabled={isProcessing || selectedCount === 0}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 transition active:scale-95 disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Invio in Corso...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Avvia Video Test Telegram ({selectedCount})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
