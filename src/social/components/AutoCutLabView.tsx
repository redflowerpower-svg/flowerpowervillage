import React, { useState } from 'react';
import { 
  Sparkles, Pizza, Palmtree, RefreshCw, Music, 
  Layers, Info, CheckCircle2, ChevronRight, Volume2, ShieldCheck,
  Eye, Zap, Sliders, AlertTriangle, Ban, Type, Video, Clock, Target, Compass, Bookmark
} from 'lucide-react';
import { MenuItem } from '../../pizza/data/menuData';
import { 
  AutoCutLabMode, 
  AutoCutTestRun, 
  generateAutoCutTestByMode,
  fetchLiveLastMinuteRooms,
  generateLM1Test,
  fetchLiveKitchenAvailability,
  getLiveDailySpecialDishes,
  fetchLiveDailySpecials,
  generateDSTest
} from '../services/autoCutLabEngine';
import { AUTOCUT_RULES_REGISTRY } from '../services/autoCutRulesRegistry';
import { AutoCutLabPlayer } from './AutoCutLabPlayer';
import { AutoCutPostCopywriter, PostCaptionsBundle } from './AutoCutPostCopywriter';
import { AutoCutDistributionPanel, DistributionChannelId } from './AutoCutDistributionPanel';

export function AutoCutLabView() {
  const [activeMode, setActiveMode] = useState<AutoCutLabMode>('P1');
  const [selectedChannel, setSelectedChannel] = useState<DistributionChannelId>('tiktok');
  const [liveCaptions, setLiveCaptions] = useState<PostCaptionsBundle | null>(null);
  const [testsByMode, setTestsByMode] = useState<Partial<Record<AutoCutLabMode, AutoCutTestRun>>>(() => {
    const init = generateAutoCutTestByMode('P1');
    return { P1: init };
  });
  const [currentTest, setCurrentTest] = useState<AutoCutTestRun>(() => generateAutoCutTestByMode('P1'));
  const [shuffleKey, setShuffleKey] = useState(0);
  const [dailySpecialDishes, setDailySpecialDishes] = useState<MenuItem[]>(() => getLiveDailySpecialDishes());
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  // Helper unificato per creare un nuovo montaggio video reale per una data modalità
  const createTestForMode = async (mode: AutoCutLabMode): Promise<AutoCutTestRun> => {
    if (mode === 'DS') {
      const specials = await fetchLiveDailySpecials();
      setDailySpecialDishes(specials);
      return generateDSTest(specials);
    }
    if (mode === 'LM1') {
      const rooms = await fetchLiveLastMinuteRooms();
      if (rooms && rooms.length > 0) {
        return generateLM1Test(rooms);
      }
    }
    if (['P1', 'P2', 'P3', 'R1'].includes(mode)) {
      await fetchLiveKitchenAvailability();
    }
    return generateAutoCutTestByMode(mode);
  };

  // Sincronizzazione iniziale degli overrides di disponibilità del Kitchen Monitor e Daily Specials
  React.useEffect(() => {
    fetchLiveKitchenAvailability().then(() => {
      const liveSpecials = getLiveDailySpecialDishes();
      setDailySpecialDishes(liveSpecials);
      const initialP1 = generateAutoCutTestByMode('P1');
      setCurrentTest(initialP1);
      setTestsByMode(prev => ({ ...prev, P1: initialP1 }));
      setShuffleKey(k => k + 1);
    });
  }, []);

  // Switch di modalità: visualizza il video già pronto in memoria senza rigenerare!
  const handleSelectMode = async (mode: AutoCutLabMode) => {
    setActiveMode(mode);

    // Switch di modalità: non avviare la riproduzione in automatico
    setShouldAutoPlay(false);

    // Se per questa modalità esiste già un video in memoria, mostralo direttamente
    const existing = testsByMode[mode];
    if (existing) {
      setCurrentTest(existing);
      setShuffleKey(k => k + 1);
      return;
    }

    // Altrimenti genera il primo video per questa modalità e conservalo nella memoria
    setIsGenerating(true);
    try {
      const newTest = await createTestForMode(mode);
      setTestsByMode(prev => ({ ...prev, [mode]: newTest }));
      setCurrentTest(newTest);
      setShuffleKey(k => k + 1);
    } finally {
      setIsGenerating(false);
    }
  };

  // Genera esplicitamente un NUOVO video per la modalità corrente
  const handleRegenerateCurrent = async () => {
    setIsGenerating(true);
    setShouldAutoPlay(true);
    try {
      const newTest = await createTestForMode(activeMode);
      setTestsByMode(prev => ({ ...prev, [activeMode]: newTest }));
      setCurrentTest(newTest);
      setShuffleKey(k => k + 1);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto pb-12">
      
      {/* Header Intro Banco di Taratura */}
      <div className="bg-[#121826] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AUTOCUT STUDIO · 9 FORMATI UFFICIALI</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
                Ken Burns Pan & Zoom Multi-Track
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Taratura & Studio AutoCut
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Testa singolarmente i 9 format pilota (P1-P3, DS Daily Special Pizzeria, V1-V3 Villaggio, R1 & LM1 Stories Koh Phayam) con montaggio Ken Burns continuo senza scatti e musica MP3 sincronizzata.
              Tutti i piatti e gli alloggi sono estratti in modo <strong>100% reale</strong> secondo disponibilità effettiva.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRegenerateCurrent}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition active:scale-95 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generazione in corso...' : `Genera Nuovo Video (${activeMode})`}</span>
          </button>
        </div>

        {/* 🎛️ SELETTORE DEI FORMATI UFFICIALI (PIZZERIA P1-P3 & DS, VILLAGGIO V1-V3, STORIES KOH PHAYAM R1 & LM1) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Gruppo 1: Pizzeria Ranong (P1, P2, P3 & DS) */}
          <div className="bg-slate-900/60 border border-rose-950/40 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <Pizza className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Pizzeria Ranong
                </span>
              </div>
              <span className="text-[10px] text-rose-400/80 font-mono">Thai / EN · 4 Formati</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectMode('P1')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'P1'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-rose-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black tracking-tight">P1</span>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">1 Piatto</span>
                <span className="text-[9px] opacity-75 font-mono">Full MP3</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('P2')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'P2'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-rose-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black tracking-tight">P2</span>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">3 Stessa Cat</span>
                <span className="text-[9px] opacity-75 font-mono">Full MP3</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('P3')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'P3'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-rose-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black tracking-tight">P3</span>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">3 Cat Miste</span>
                <span className="text-[9px] opacity-75 font-mono">Full MP3</span>
              </button>

              {/* FORMATO: DS (Daily Special) */}
              <button
                type="button"
                onClick={() => handleSelectMode('DS')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'DS'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-rose-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black tracking-tight">DS</span>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">Daily Special</span>
                <span className="text-[9px] opacity-75 font-mono">Full MP3</span>
              </button>
            </div>
          </div>

          {/* Gruppo 2: Villaggio Alloggi (V1, V2, V3) */}
          <div className="bg-slate-900/60 border border-emerald-950/40 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <Palmtree className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Villaggio Koh Phayam
                </span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">EN / Thai · Octorate</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectMode('V1')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'V1'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black tracking-tight">V1</span>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">1 Alloggio</span>
                <span className="text-[9px] opacity-75 font-mono">Max 8s</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('V2')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'V2'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black tracking-tight">V2</span>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">5 Foto Stesso</span>
                <span className="text-[9px] opacity-75 font-mono">Full MP3</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('V3')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'V3'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black tracking-tight">V3</span>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">5 Diversi</span>
                <span className="text-[9px] opacity-75 font-mono">Full MP3</span>
              </button>
            </div>
          </div>

          {/* Gruppo 3: Stories Speciali (R1 Restaurant WhatsApp & LM1 Last Minute Live) */}
          <div className="bg-slate-900/60 border border-amber-950/40 rounded-2xl p-3 md:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Stories Koh Phayam
                </span>
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono">Delivery & Last Minute</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectMode('R1')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'R1'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-300 shadow-lg shadow-emerald-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black tracking-tight">R1</span>
                  <span className="text-[9px] px-1 rounded bg-[#25D366] text-stone-950 font-bold">WA</span>
                </div>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">5 Piatti Resort</span>
                <span className="text-[9px] opacity-80 text-emerald-300 font-mono">+66 095 882 5573</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('LM1')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  activeMode === 'LM1'
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white border-amber-300 shadow-lg shadow-amber-900/50 scale-[1.02]'
                    : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black tracking-tight">LM1</span>
                <span className="text-[10px] font-semibold mt-0.5 leading-tight">Last Minute Live</span>
                <span className="text-[9px] opacity-80 text-amber-300 font-mono">Prezzo Reale Oggi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Workbench: Left Smartphone Player vs Center AI Post Studio vs Right Distribution Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 1. COLONNA SINISTRA: Smartphone Mockup con AutoCut Player (spostato a sinistra) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-start">
          <div className="w-full max-w-[340px] mb-1.5">
            <button
              type="button"
              onClick={handleRegenerateCurrent}
              disabled={isGenerating}
              className="w-full text-xs font-bold py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700/80 flex items-center justify-center gap-2 transition active:scale-95 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generazione...' : 'Genera Nuovo Video'}</span>
            </button>
          </div>

          <div className="w-full max-w-[340px] flex flex-col items-center relative">
            <AutoCutLabPlayer
              key={`${activeMode}_${shuffleKey}`}
              testRun={currentTest}
              autoPlay={shouldAutoPlay}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-mono pl-1">
            Tocca lo schermo per mettere in pausa o riavvolgere
          </span>
        </div>

        {/* 2. COLONNA CENTRALE: AI Post Content Studio & Traduzioni in Colonna (Dinamico per Canale) */}
        <div className="lg:col-span-5 xl:col-span-6 space-y-4">
          <AutoCutPostCopywriter
            testRun={currentTest}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            onCaptionsChange={setLiveCaptions}
          />
        </div>

        {/* 3. COLONNA DESTRA: Canale di Distribuzione Stretto con Canali Incolonnati + STORYBOARD SOTTO IN VERTICALE */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4">
          <AutoCutDistributionPanel
            testRun={currentTest}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            liveCaptions={liveCaptions}
          />

          {/* STORYBOARD (ex Diagnostica Live) */}
          <div className="bg-[#121826] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                  Storyboard
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                {currentTest.scenes.length} {currentTest.scenes.length === 1 ? 'Foto' : 'Scene'}
              </span>
            </div>

            {/* Traccia Audio Casuale & Durata */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800/90 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Music className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider block">MP3 Attuale</span>
                  <span className="text-xs font-bold text-white truncate block">{currentTest.audioTrack.title}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] font-mono font-bold text-amber-300 shrink-0">
                {currentTest.mode === 'P1' ? 'Beat Outro' : `${currentTest.totalDuration.toFixed(1)}s`}
              </span>
            </div>

            {/* Sequenza Live delle Scene dello Storyboard (Altezza naturale senza scrollbar) */}
            <div className="space-y-2">
              {currentTest.scenes.map((scene, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>

                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
                    <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-[11px] font-bold text-white truncate">
                        {scene.titlePrimary.replace(/\n+/g, ' ')}
                      </h4>
                      <span className="text-[10px] font-mono text-amber-300 font-bold shrink-0">
                        {scene.priceLabel}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {scene.titleSecondary.replace(/\n+/g, ' ')}
                    </p>

                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 text-[9px] font-mono mt-1 border border-indigo-800/40">
                      <Compass className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                      <span>{scene.trajectory.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SEZIONE INFERIORE A TUTTA LARGHEZZA: ARCHIVIO REGOLE UFFICIALI & SPECIFICHE FORMATO */}
      <div className="mt-12 pt-8 border-t border-slate-800/80 space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
                Archivio Regole Ufficiali & Specifiche Formato
              </h3>
              <p className="text-xs text-slate-400">
                Specifiche architetturali, cinematica di camera e gerarchia semantica per il format {activeMode}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 self-start sm:self-auto">
            Motore AutoCut V2
          </span>
        </div>

        {(() => {
          const currentRule = AUTOCUT_RULES_REGISTRY[activeMode] || AUTOCUT_RULES_REGISTRY.P1;
          const badgeBg = currentRule?.badgeColor === 'rose'
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            : currentRule?.badgeColor === 'emerald'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

          return (
            <div className="w-full bg-[#121826] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Testata della Scheda Regole */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 relative z-10">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide border uppercase ${badgeBg}`}>
                    {currentRule.badgeLabel}
                  </span>
                  <div>
                    <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                      {currentRule.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentRule.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                    Archivio Specifiche Ufficiali
                  </span>
                </div>
              </div>

              {/* Row 1: 3 Pillole Specifiche + Obiettivo Strategico (Griglia a 4 colonne) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <Target className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Piattaforme</span>
                    <span className="text-xs font-bold text-white truncate block">{currentRule.targetPlatform}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <Video className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Canvas & Aspect</span>
                    <span className="text-xs font-bold text-white truncate block">{currentRule.aspectRatio}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Timing & MP3</span>
                    <span className="text-xs font-bold text-white truncate block">AutoCut Audio Beat</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/50 rounded-2xl border border-indigo-900/50 flex items-start gap-2.5">
                  <Target className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="text-[10px] uppercase font-bold text-indigo-300 block tracking-wider mb-0.5">Obiettivo:</strong>
                    <p className="text-xs text-slate-200 line-clamp-2">
                      {currentRule.objective}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2: Asset Ammessi & Esclusioni Categoriche (2 Colonne Ampie) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
                {/* Asset Ammessi */}
                <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-900/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Asset Ammessi</h4>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                    {currentRule.assetRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Esclusioni e Filtri */}
                <div className="p-4 bg-rose-950/20 rounded-2xl border border-rose-900/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Esclusioni Categoriche</h4>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                    {currentRule.exclusions.map((excl, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{excl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Row 3: Gerarchia Tipografica & Semantica (Orizzontale a 4 Colonne) */}
              <div className="p-4 sm:p-5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Gerarchia Tipografica & Semantica Orizzontale</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {currentRule.typographyRules.topBanner && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Banner Superiore:</span>
                      <span className="text-slate-200 font-medium">{currentRule.typographyRules.topBanner}</span>
                    </div>
                  )}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Titolo Primario (Thai):</span>
                    <span className="text-slate-200 font-medium">{currentRule.typographyRules.primaryTitle}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Titolo Secondario (Inglese):</span>
                    <span className="text-slate-200 font-medium">{currentRule.typographyRules.secondaryTitle}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Cartellino Prezzo (Badge):</span>
                    <span className="text-slate-200 font-medium">{currentRule.typographyRules.priceBadge}</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Cinematica di Camera & Outro Brand (2 Colonne) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
                <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Cinematica Camera</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentRule.cameraMovement}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Outro Brand & CTA</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ⏱️ {currentRule.outroSpec.timing}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-300">
                    {currentRule.outroSpec.elements.map((elem, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{elem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Row 5: Divieti Categorici di Sistema (Orizzontale Pieno) */}
              <div className="p-4 sm:p-5 bg-red-950/30 rounded-2xl border border-red-900/50 space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">Divieti Categorici (Zero Tolleranza)</h4>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-red-200/90 pt-1">
                  {currentRule.strictProhibitions.map((prohib, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 bg-red-950/40 p-2 rounded-xl border border-red-900/30">
                      <span className="text-red-400 font-bold shrink-0">⚠️</span>
                      <span>{prohib}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          );
        })()}
      </div>

    </div>
  );
}
