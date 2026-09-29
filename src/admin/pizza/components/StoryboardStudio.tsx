import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Play, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Save, 
  Smartphone, 
  Clock, 
  Sliders, 
  FileText, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  Code, 
  Share2, 
  MousePointer, 
  Layers, 
  HelpCircle,
  Video,
  ChevronDown
} from 'lucide-react';
import type { StoryboardConfig, StoryboardBlock, StoryboardActionType } from '../types/storyboardTypes';
import { DEFAULT_STORYBOARDS } from '../data/defaultStoryboards';

const ACTION_CATALOG: { type: StoryboardActionType; label: string; icon: string; defaultDuration: number; desc: string }[] = [
  { type: 'navigate', label: 'Ingresso Menu / Home', icon: '🏠', defaultDuration: 1500, desc: 'Apre il website in formato mobile a pieno schermo' },
  { type: 'focus_element', label: 'Soffermati su Elemento / Banner', icon: '🔍', defaultDuration: 1200, desc: 'Evidenzia e mette a fuoco un banner o elemento chiave' },
  { type: 'click_category', label: 'Seleziona Categoria Menu', icon: '📑', defaultDuration: 1600, desc: 'Clicca sulla categoria (Pizze, Pasta, Vini, Dolci)' },
  { type: 'open_product_modal', label: 'Apri Scheda Piatto', icon: '🍕', defaultDuration: 1800, desc: 'Tocca e apre il modal di dettaglio e personalizzazione' },
  { type: 'select_variant', label: 'Seleziona Variante / Taglia', icon: '📐', defaultDuration: 1200, desc: 'Sceglie la taglia (es. Normale, Gigante)' },
  { type: 'toggle_extra', label: 'Aggiungi Ingrediente Extra', icon: '➕', defaultDuration: 1200, desc: 'Aggiunge un extra come Mozzarella, Funghi, ecc.' },
  { type: 'add_to_cart_and_close', label: 'Aggiungi al Carrello', icon: '🛒', defaultDuration: 1400, desc: 'Aggiunge al carrello e chiude il modal del piatto' },
  { type: 'open_cart_drawer', label: 'Apri Carrello Laterale', icon: '🛍️', defaultDuration: 1600, desc: 'Apre il cassetto laterale mostrando i subtotali' },
  { type: 'click_checkout_button', label: 'Passaggio a Checkout', icon: '💳', defaultDuration: 2000, desc: 'Apre la schermata di cassa e pagamento PromptPay' },
  { type: 'fill_checkout_form', label: 'Compila Dati Checkout', icon: '✍️', defaultDuration: 2500, desc: 'Digita nome, telefono e indirizzo di consegna' },
  { type: 'open_table_reservation_modal', label: 'Apri Prenota Tavolo', icon: '🛖', defaultDuration: 1800, desc: 'Apre il modulo di prenotazione tavoli e capanne 24H' },
  { type: 'fill_table_reservation', label: 'Compila Prenotazione Tavolo', icon: '📝', defaultDuration: 2500, desc: 'Compila persone, data, ora e capanna' },
  { type: 'scroll_down', label: 'Scorri in Basso (Smooth Scroll)', icon: '⬇️', defaultDuration: 1500, desc: 'Scorrimento morbido per mostrare i contenuti' },
  { type: 'scroll_up', label: 'Scorri in Alto', icon: '⬆️', defaultDuration: 1200, desc: 'Ritorna verso la cima della pagina' },
  { type: 'pause', label: 'Pausa di Attesa / Finale', icon: '⏱️', defaultDuration: 2000, desc: 'Trattiene la visuale per consentire la lettura' },
];

export const StoryboardStudio: React.FC = () => {
  const [storyboards, setStoryboards] = useState<StoryboardConfig[]>(() => {
    try {
      const saved = localStorage.getItem('fp_storyboards_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_STORYBOARDS;
  });

  const [activeStoryboardId, setActiveStoryboardId] = useState<string>(storyboards[0]?.id || 'tiktok-pizza-order-15s');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'preview' | 'json'>('timeline');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const activeStoryboard = storyboards.find(s => s.id === activeStoryboardId) || storyboards[0];

  // Save to local storage
  const handleSaveStoryboards = (updatedList: StoryboardConfig[]) => {
    setStoryboards(updatedList);
    try {
      localStorage.setItem('fp_storyboards_data', JSON.stringify(updatedList, null, 2));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Error saving storyboards:', e);
    }
  };

  const updateActiveStoryboard = (updater: (prev: StoryboardConfig) => StoryboardConfig) => {
    const updatedList = storyboards.map(s => {
      if (s.id === activeStoryboard.id) {
        const updated = updater(s);
        return { ...updated, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    handleSaveStoryboards(updatedList);
  };

  // Reorder Blocks
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...activeStoryboard.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const [moved] = blocks.splice(index, 1);
    blocks.splice(targetIndex, 0, moved);
    updateActiveStoryboard(prev => ({ ...prev, blocks }));
  };

  // Delete Block
  const deleteBlock = (blockId: string) => {
    updateActiveStoryboard(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId)
    }));
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  // Duplicate Block
  const duplicateBlock = (block: StoryboardBlock, index: number) => {
    const newBlock: StoryboardBlock = {
      ...block,
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${block.title} (Copia)`
    };
    const blocks = [...activeStoryboard.blocks];
    blocks.splice(index + 1, 0, newBlock);
    updateActiveStoryboard(prev => ({ ...prev, blocks }));
  };

  // Add Action Block
  const addActionBlock = (actionType: StoryboardActionType) => {
    const catalogItem = ACTION_CATALOG.find(a => a.type === actionType) || ACTION_CATALOG[0];
    const newBlock: StoryboardBlock = {
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: actionType,
      title: `${catalogItem.icon} ${catalogItem.label}`,
      description: catalogItem.desc,
      durationMs: catalogItem.defaultDuration,
      pauseAfterMs: 600,
      scrollAmount: actionType === 'scroll_down' ? 400 : undefined
    };
    updateActiveStoryboard(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
    setShowAddModal(false);
    setSelectedBlockId(newBlock.id);
  };

  // Calculate Total Duration
  const totalDurationMs = activeStoryboard.blocks.reduce((acc, b) => acc + (b.durationMs || 0) + (b.pauseAfterMs || 0), 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(1);

  const runnerCommand = `node scratch/storyboard_runner.mjs --storyboard=${activeStoryboard.id}`;

  const copyRunnerCommand = () => {
    navigator.clipboard.writeText(runnerCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const selectedBlock = activeStoryboard.blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black tracking-wider uppercase">
              <Film className="w-3.5 h-3.5" />
              <span>TikTok Video Engine (9:16)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Storyboard Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                HD 1080x1920
              </span>
            </h2>
            <p className="text-stone-400 text-sm max-w-2xl leading-relaxed">
              Pianifica, configura e registra video promozionali verticali ad altissima risoluzione per TikTok, Instagram Reels e Shorts emulando gesti e tocchi umani realistici.
            </p>
          </div>

          {/* Quick Actions / Preset Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={activeStoryboardId}
                onChange={(e) => {
                  setActiveStoryboardId(e.target.value);
                  setSelectedBlockId(null);
                }}
                className="bg-stone-800 hover:bg-stone-750 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-stone-700 appearance-none pr-10 cursor-pointer shadow-md focus:outline-none focus:border-rose-500"
              >
                {storyboards.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={copyRunnerCommand}
              className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-2xl border border-stone-700 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {copiedCommand ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-rose-400" />}
              <span>{copiedCommand ? 'Comando Copiato!' : 'Copia Runner CLI'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveStoryboards(storyboards)}
              className="px-5 py-3 bg-gradient-to-r from-rose-600 to-[#8B1E1E] hover:from-rose-500 hover:to-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Salvato!' : 'Salva Storyboard'}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-rose-400 border border-stone-700">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-stone-400 text-[11px] font-medium">Formato Emulato</div>
              <div className="font-extrabold text-stone-100">{activeStoryboard.targetDevice} (9:16)</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-amber-400 border border-stone-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-stone-400 text-[11px] font-medium">Durata Stimata Video</div>
              <div className="font-extrabold text-amber-300">{totalDurationSec}s ({activeStoryboard.blocks.length} Scene)</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-emerald-400 border border-stone-700">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-stone-400 text-[11px] font-medium">Simulatore Touch</div>
              <div className="font-extrabold text-emerald-400">{activeStoryboard.cursorSimulation ? 'Attivo (Gesti Umani)' : 'Disattivato'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-sky-400 border border-stone-700">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="text-stone-400 text-[11px] font-medium">Output Diretto</div>
              <div className="font-extrabold text-sky-300">./video_out/ ({activeStoryboard.viewportWidth}x{activeStoryboard.viewportHeight})</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-stone-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Timeline Blocchi Azione ({activeStoryboard.blocks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Anteprima Sequenza Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Configurazione JSON / Runner</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer mb-1"
        >
          <Plus className="w-4 h-4 text-rose-400" />
          <span>Aggiungi Blocco Azione</span>
        </button>
      </div>

      {/* TAB 1: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Blocks List (Col 7) */}
          <div className="lg:col-span-7 space-y-3">
            {activeStoryboard.blocks.map((block, index) => {
              const isSelected = block.id === selectedBlockId;
              const catalogMatch = ACTION_CATALOG.find(a => a.type === block.type);

              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-rose-50/60 border-rose-400 shadow-md ring-2 ring-rose-500/20'
                      : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 text-base flex items-center justify-center shrink-0 mt-0.5">
                        {catalogMatch?.icon || '🎬'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                            Fase #{index + 1}
                          </span>
                          <span className="text-xs font-black text-stone-900">{block.title}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">{block.description}</p>

                        {/* Badges / Params Snippets */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>{(block.durationMs / 1000).toFixed(1)}s</span>
                          </span>

                          {block.targetProductName && (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
                              🍕 {block.targetProductName}
                            </span>
                          )}

                          {block.targetVariantName && (
                            <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200">
                              📐 {block.targetVariantName}
                            </span>
                          )}

                          {block.speechText && (
                            <span className="text-[10px] font-medium text-stone-600 italic truncate max-w-xs bg-stone-100 px-2 py-0.5 rounded-md">
                              💬 &ldquo;{block.speechText}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Controls */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }}
                        disabled={index === 0}
                        title="Sposta su"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }}
                        disabled={index === activeStoryboard.blocks.length - 1}
                        title="Sposta giù"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); duplicateBlock(block, index); }}
                        title="Duplica"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                        title="Elimina"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Block Parameters Editor (Col 5) */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm sticky top-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-600" />
                <h3 className="font-extrabold text-sm text-stone-900">
                  {selectedBlock ? 'Parametri Blocco Selezionato' : 'Seleziona un Blocco'}
                </h3>
              </div>
              {selectedBlock && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                  {selectedBlock.type}
                </span>
              )}
            </div>

            {selectedBlock ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Titolo Scena</label>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateActiveStoryboard(prev => ({
                        ...prev,
                        blocks: prev.blocks.map(b => b.id === selectedBlock.id ? { ...b, title: val } : b)
                      }));
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Durata Azione (ms)</label>
                    <input
                      type="number"
                      step="100"
                      value={selectedBlock.durationMs}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1000;
                        updateActiveStoryboard(prev => ({
                          ...prev,
                          blocks: prev.blocks.map(b => b.id === selectedBlock.id ? { ...b, durationMs: val } : b)
                        }));
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Pausa Successiva (ms)</label>
                    <input
                      type="number"
                      step="100"
                      value={selectedBlock.pauseAfterMs || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveStoryboard(prev => ({
                          ...prev,
                          blocks: prev.blocks.map(b => b.id === selectedBlock.id ? { ...b, pauseAfterMs: val } : b)
                        }));
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                    />
                  </div>
                </div>

                {/* Specific Action Inputs */}
                {(selectedBlock.type === 'open_product_modal') && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Nome Piatto / Pizza</label>
                    <input
                      type="text"
                      placeholder="es. Margherita, Diavola, Carbonara"
                      value={selectedBlock.targetProductName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveStoryboard(prev => ({
                          ...prev,
                          blocks: prev.blocks.map(b => b.id === selectedBlock.id ? { ...b, targetProductName: val } : b)
                        }));
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                    />
                  </div>
                )}

                {(selectedBlock.type === 'select_variant') && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Nome Variante (es. Gigante, Normale)</label>
                    <input
                      type="text"
                      value={selectedBlock.targetVariantName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveStoryboard(prev => ({
                          ...prev,
                          blocks: prev.blocks.map(b => b.id === selectedBlock.id ? { ...b, targetVariantName: val } : b)
                        }));
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                    />
                  </div>
                )}

                {(selectedBlock.type === 'click_category') && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">ID Categoria (es. pizza, pasta, wines, drinks)</label>
                    <input
                      type="text"
                      value={selectedBlock.targetCategory || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveStoryboard(prev => ({
                          ...prev,
                          blocks: prev.blocks.map(b => b.id === selectedBlock.id ? { ...b, targetCategory: val } : b)
                        }));
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                    />
                  </div>
                )}

                {(selectedBlock.type === 'scroll_down' || selectedBlock.type === 'scroll_up') && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Pixel di Scorrimento</label>
                    <input
                      type="number"
                      value={selectedBlock.scrollAmount || 400}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 400;
                        updateActiveStoryboard(prev => ({
                          ...prev,
                          blocks: prev.blocks.map(b => b.id === selectedBlock.id ? { ...b, scrollAmount: val } : b)
                        }));
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Sottotitolo / Voce Guida (Speech Text)</label>
                  <textarea
                    rows={2}
                    placeholder="Testo vocale o sottotitolo mostrato a video durante l'azione..."
                    value={selectedBlock.speechText || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateActiveStoryboard(prev => ({
                        ...prev,
                        blocks: prev.blocks.map(b => b.id === selectedBlock.id ? { ...b, speechText: val } : b)
                      }));
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-none focus:border-[#8B1E1E]"
                  />
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-stone-400 space-y-3">
                <Sliders className="w-8 h-8 mx-auto text-stone-300 stroke-1" />
                <p className="text-xs">Clicca su una scheda a sinistra per modificare tempi, testi e parametri di quell&rsquo;azione.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PREVIEW SIMULATION */}
      {activeTab === 'preview' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 text-white space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Simulatore Sequenza Video (9:16)</h3>
              <p className="text-stone-400 text-xs">Riepilogo cronologico delle azioni che Playwright eseguirà ad alta velocità.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30">
              Durata: {totalDurationSec}s
            </span>
          </div>

          <div className="space-y-3">
            {activeStoryboard.blocks.map((block, idx) => (
              <div key={block.id} className="flex items-center gap-4 bg-stone-800/80 p-4 rounded-2xl border border-stone-700/60">
                <div className="w-8 h-8 rounded-xl bg-stone-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-100">{block.title}</span>
                    <span className="text-[11px] text-amber-400 font-bold">{(block.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                  {block.speechText && (
                    <p className="text-stone-400 text-xs mt-1 italic">&ldquo;{block.speechText}&rdquo;</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: JSON / RUNNER */}
      {activeTab === 'json' && (
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 text-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">storyboard.json</span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(activeStoryboard, null, 2));
                setCopiedCommand(true);
                setTimeout(() => setCopiedCommand(false), 2000);
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded-xl text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copia JSON</span>
            </button>
          </div>
          <pre className="p-4 bg-black/60 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-96 border border-stone-800">
            {JSON.stringify(activeStoryboard, null, 2)}
          </pre>
        </div>
      )}

      {/* ADD ACTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-black text-stone-900">Aggiungi Blocco Azione</h3>
                <p className="text-xs text-stone-500">Seleziona il tipo di interazione da aggiungere allo Storyboard video.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACTION_CATALOG.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addActionBlock(item.type)}
                  className="p-4 rounded-2xl border border-stone-200 hover:border-[#8B1E1E] hover:bg-rose-50/40 transition-all text-left group flex items-start gap-3 cursor-pointer shadow-2xs hover:shadow-md"
                >
                  <span className="text-2xl shrink-0 p-2 bg-stone-100 group-hover:bg-white rounded-xl border border-stone-200">
                    {item.icon}
                  </span>
                  <div>
                    <div className="text-xs font-black text-stone-900 group-hover:text-[#8B1E1E]">{item.label}</div>
                    <div className="text-[11px] text-stone-500 mt-1 leading-snug">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
