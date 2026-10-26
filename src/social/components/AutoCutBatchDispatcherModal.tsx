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
  RotateCcw,
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

export type AspectRatioChoice = '9:16' | '4:3' | 'both';

interface QueueItem {
  id: string; // e.g. "P1_9:16"
  mode: AutoCutLabMode;
  aspectRatio: '9:16' | '4:3';
  label: string;
}

interface ItemStatus {
  state: 'idle' | 'preparing' | 'rendering' | 'uploading' | 'dispatching' | 'done' | 'error';
  progress: number;
  message: string;
  videoUrl?: string;
  error?: string;
}

const ALL_MODES: {
  mode: AutoCutLabMode;
  category: 'pizza' | 'village' | 'stories';
  title: string;
  durationLabel: string;
}[] = [
  // Pizzeria Ranong
  { mode: 'P1', category: 'pizza', title: '1 Piatto Culinario Iconico', durationLabel: '~12s · Rapido' },
  { mode: 'P2', category: 'pizza', title: '2 Piatti & Connessioni Culinari', durationLabel: '~18s · Medio' },
  { mode: 'P3', category: 'pizza', title: '3 Piatti Menu Completo', durationLabel: '~24s · Vetrina' },
  { mode: 'DS', category: 'pizza', title: 'Daily Special Fuori Menu', durationLabel: '~15s · Live Specials' },

  // Villaggio Koh Phayam
  { mode: 'V1', category: 'village', title: '3 Alloggi Tropicali Panoramica', durationLabel: '~24s · Alloggi' },
  { mode: 'V2', category: 'village', title: '5 Foto Stesso Alloggio', durationLabel: '~37s · Suite Tour' },
  { mode: 'V3', category: 'village', title: '7 Alloggi Resort & Verande', durationLabel: '~50s · Grand Tour' },

  // Stories Koh Phayam
  { mode: 'R1', category: 'stories', title: 'Ristorante Buffalo Bay Ranong & Phayam', durationLabel: '~25s · Stories Delivery' },
  { mode: 'LM1', category: 'stories', title: 'Last Minute Alloggi Liberi (Prezzi Reali)', durationLabel: '~25s · Stories Flash' }
];

export function AutoCutBatchDispatcherModal({
  isOpen,
  onClose,
  activeMode,
  onSelectMode,
  testsByMode,
  createTestForMode
}: AutoCutBatchDispatcherModalProps) {
  // Modal selection state
  const [selectedModes, setSelectedModes] = useState<AutoCutLabMode[]>(['P1', 'P2', 'V3', 'LM1']);
  const [aspectChoice, setAspectChoice] = useState<AspectRatioChoice>('9:16');
  const [targetTopic, setTargetTopic] = useState<StudioTopicKey>('tikTokStories');

  // Queue runner state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>({});
  const [overallSummary, setOverallSummary] = useState<{ total: number; success: number; failed: number } | null>(null);

  const isCancelledRef = useRef(false);

  // Sync selected modes if modal just opened and empty
  useEffect(() => {
    if (isOpen && selectedModes.length === 0) {
      setSelectedModes(['P1', 'P2', 'V3', 'LM1']);
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

  // Toggle selection
  const handleToggleMode = (mode: AutoCutLabMode) => {
    if (isProcessing) return;
    setSelectedModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  // Presets
  const handleSelectAll = () => {
    if (isProcessing) return;
    setSelectedModes(ALL_MODES.map(m => m.mode));
  };
  const handleSelectPizza = () => {
    if (isProcessing) return;
    setSelectedModes(['P1', 'P2', 'P3', 'DS']);
  };
  const handleSelectVillage = () => {
    if (isProcessing) return;
    setSelectedModes(['V1', 'V2', 'V3', 'R1', 'LM1']);
  };
  const handleDeselectAll = () => {
    if (isProcessing) return;
    setSelectedModes([]);
  };

  // Costruisci la lista dei task in coda in base alle selezioni
  const buildQueue = (): QueueItem[] => {
    const list: QueueItem[] = [];
    selectedModes.forEach(mode => {
      if (aspectChoice === '9:16' || aspectChoice === 'both') {
        list.push({
          id: `${mode}_9:16`,
          mode,
          aspectRatio: '9:16',
          label: `${mode} · 9:16 Verticale`
        });
      }
      if (aspectChoice === '4:3' || aspectChoice === 'both') {
        list.push({
          id: `${mode}_4:3`,
          mode,
          aspectRatio: '4:3',
          label: `${mode} · 4:3 Orizzontale`
        });
      }
    });
    return list;
  };

  // Avvio sequenziale di compilazione e invio a Telegram
  const handleStartBatch = async () => {
    const items = buildQueue();
    if (items.length === 0) return;

    setQueueItems(items);
    setIsProcessing(true);
    isCancelledRef.current = false;
    setOverallSummary(null);

    // Inizializza gli stati
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

        // 2. Registrazione e Compilazione Video (60 FPS con formato aspect ratio richiesto)
        setItemStatuses(prev => ({
          ...prev,
          [item.id]: {
            state: 'rendering',
            progress: 15,
            message: `Rendering 60 FPS (${item.aspectRatio === '4:3' ? '1440x1080' : '1080x1920'})...`
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

        const isPizza = item.mode === 'P1' || item.mode === 'P2' || item.mode === 'P3' || item.mode === 'DS';
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
          title: `Verifica Batch · Format ${item.mode} (${aspectLabel})`,
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

  const totalItemsCount = selectedModes.length * (aspectChoice === 'both' ? 2 : 1);

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
                  Verifica Sequenziale Video Telegram
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Batch Quality Check
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scegli i formati da verificare e il layout video. Il sistema li compilerà uno dopo l'altro a 60 FPS e li invierà in fila a Telegram.
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
        <div className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto relative z-10 custom-scrollbar">

          {/* 1. SELETTORE ASPECT RATIO (L'OPZIONE SPECIFICA DEL 4 TERZI!) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Formato Aspect Ratio Video</span>
              </span>
              <span className="text-[11px] text-cyan-400/90 font-mono">
                {aspectChoice === 'both' ? '2 video per formato (9:16 + 4:3)' : '1 video per formato'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Opzione 9:16 */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setAspectChoice('9:16')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  aspectChoice === '9:16'
                    ? 'bg-cyan-500/15 border-cyan-400/60 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${aspectChoice === '9:16' ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${aspectChoice === '9:16' ? 'text-cyan-300' : 'text-white'}`}>
                    📱 9:16 Verticale
                  </div>
                  <div className="text-[10px] text-slate-400">
                    1080x1920 Full HD (TikTok, Reels, Stories)
                  </div>
                </div>
              </button>

              {/* Opzione 4:3 (L'OPZIONE SPECIFICA RICHIESTA DALL'UTENTE) */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setAspectChoice('4:3')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  aspectChoice === '4:3'
                    ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-950/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${aspectChoice === '4:3' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${aspectChoice === '4:3' ? 'text-amber-300' : 'text-white'}`}>
                    🖥️ 4:3 Orizzontale
                  </div>
                  <div className="text-[10px] text-slate-400">
                    1440x1080 Full HD (Post Facebook & Monitor)
                  </div>
                </div>
              </button>

              {/* Opzione Entrambi */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setAspectChoice('both')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  aspectChoice === 'both'
                    ? 'bg-rose-500/15 border-rose-400/60 shadow-lg shadow-rose-950/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${aspectChoice === 'both' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${aspectChoice === 'both' ? 'text-rose-300' : 'text-white'}`}>
                    🔄 Entrambi (9:16 + 4:3)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Compila entrambe le versioni in sequenza
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* 2. SELEZIONE FORMATI (PRESET RAPIDI + GRIGLIA) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Formati da Inviare ({selectedModes.length} selezionati)</span>
              </span>

              {/* Bottoni Preset */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                >
                  Tutti (9)
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSelectPizza}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition"
                >
                  Solo Pizzeria (4)
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSelectVillage}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
                >
                  Solo Villaggio (5)
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

            {/* Griglia a 3 Colonne per Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Colonna Pizzeria Ranong */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1 text-xs font-bold text-rose-400">
                  <Pizza className="w-3.5 h-3.5" />
                  <span>Pizzeria Ranong</span>
                </div>
                <div className="space-y-1.5">
                  {ALL_MODES.filter(m => m.category === 'pizza').map(m => {
                    const isSelected = selectedModes.includes(m.mode);
                    return (
                      <button
                        key={m.mode}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleToggleMode(m.mode)}
                        className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-500/15 border-rose-500/50 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${isSelected ? 'bg-rose-500 text-white' : 'border border-slate-600'}`}>
                            {isSelected && <CheckSquare className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs mr-1.5">{m.mode}</span>
                            <span className="text-[11px]">{m.title}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-1">
                          {m.durationLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colonna Villaggio Koh Phayam */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1 text-xs font-bold text-emerald-400">
                  <Palmtree className="w-3.5 h-3.5" />
                  <span>Villaggio Koh Phayam</span>
                </div>
                <div className="space-y-1.5">
                  {ALL_MODES.filter(m => m.category === 'village').map(m => {
                    const isSelected = selectedModes.includes(m.mode);
                    return (
                      <button
                        key={m.mode}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleToggleMode(m.mode)}
                        className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-white' : 'border border-slate-600'}`}>
                            {isSelected && <CheckSquare className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs mr-1.5">{m.mode}</span>
                            <span className="text-[11px]">{m.title}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-1">
                          {m.durationLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colonna Stories Koh Phayam */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1 text-xs font-bold text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Stories Koh Phayam</span>
                </div>
                <div className="space-y-1.5">
                  {ALL_MODES.filter(m => m.category === 'stories').map(m => {
                    const isSelected = selectedModes.includes(m.mode);
                    return (
                      <button
                        key={m.mode}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleToggleMode(m.mode)}
                        className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${isSelected ? 'bg-amber-500 text-black' : 'border border-slate-600'}`}>
                            {isSelected && <CheckSquare className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs mr-1.5">{m.mode}</span>
                            <span className="text-[11px]">{m.title}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-1">
                          {m.durationLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* 3. DESTINAZIONE TELEGRAM */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>3. Destinazione Supergruppo Telegram Staff (ID: -1004492692624)</span>
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
                    threadId: 3 · Ricezione video 9:16 / 4:3 con copy bilingue
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
                    threadId: 2 · Ricezione video con formattazione per Gruppo FB
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 4. MONITOR PROGRESSO SEQUENZIALE & CODA (QUANDO ATTIVO O COMPLETATO) */}
          {(isProcessing || queueItems.length > 0) && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span>Elaborazione Sequenziale in Corso ({currentIndex + 1} di {queueItems.length})</span>
                    </>
                  ) : overallSummary ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Riepilogo Verifica: {overallSummary.success} Inviati / {overallSummary.failed} Errori</span>
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
                          <span className="font-bold text-white mr-1.5">{item.label}</span>
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
                Compilazione in corso: non chiudere questa scheda del browser.
              </span>
            ) : (
              <span>
                Totale da compilare: <strong className="text-white">{totalItemsCount} video</strong> ({selectedModes.length} format × {aspectChoice === 'both' ? '2 layout' : '1 layout'})
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
              disabled={isProcessing || selectedModes.length === 0}
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
                  <span>Avvia Invio a Telegram ({totalItemsCount} Video)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
