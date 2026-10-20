import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Copy, Check, RefreshCw,
  MapPin, AtSign, Calendar, Share2
} from 'lucide-react';
import { AutoCutTestRun } from '../services/autoCutLabEngine';
import { 
  generatePostCopy, 
  PostCopyResult 
} from '../services/autoCutCopywriterEngine';

interface AutoCutPostCopywriterProps {
  testRun: AutoCutTestRun;
}

export function AutoCutPostCopywriter({ testRun }: AutoCutPostCopywriterProps) {
  const [proverbSeed, setProverbSeed] = useState(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'th' | 'en' | 'links'>('all');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiOverride, setAiOverride] = useState<{
    thaiContent?: string;
    englishContent?: string;
  } | null>(null);

  // Reset override AI quando cambia la prova o il proverbio
  React.useEffect(() => {
    setAiOverride(null);
  }, [testRun.mode, proverbSeed]);

  // Genera i testi base a 0ms (con layout arioso, particelle e hashtag del piatto)
  const basePostData: PostCopyResult = useMemo(() => {
    return generatePostCopy(testRun, proverbSeed);
  }, [testRun, proverbSeed]);

  // Applica eventuale override live DeepSeek
  const postData: PostCopyResult = useMemo(() => {
    if (!aiOverride) return basePostData;
    const th = aiOverride.thaiContent || basePostData.thaiContent;
    const en = aiOverride.englishContent || basePostData.englishContent;
    
    const isPizza = testRun.brand === 'pizza';
    const fullCaptionInstagram = isPizza
      ? `${th}\n\n${en}\n\n${basePostData.fixedLink}\n\n${basePostData.crossTag}`
      : `${en}\n\n${th}\n\n${basePostData.fixedLink}\n\n${basePostData.crossTag}`;

    const fullCaptionTikTok = isPizza
      ? `${th}\n\n${en}\n\n${basePostData.fixedLink}\n${basePostData.crossTag}`
      : `${en}\n\n${th}\n\n${basePostData.fixedLink}\n${basePostData.crossTag}`;

    return {
      ...basePostData,
      thaiContent: th,
      englishContent: en,
      italianContent: '',
      fullCaptionInstagram,
      fullCaptionTikTok
    };
  }, [basePostData, aiOverride, testRun.brand]);

  // Generazione Live con DeepSeek AI
  const handleGenerateDeepSeekAi = async () => {
    setIsGeneratingAi(true);
    try {
      const dishes = testRun.scenes.map(s => s.sourceName || s.titlePrimary);
      const res = await fetch('/api/social-publisher?action=generate_ai_post_copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: testRun.brand,
          mode: testRun.mode,
          dishes,
          season: basePostData.seasonContext
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAiOverride(json.data);
        }
      }
    } catch (err) {
      console.warn('[AutoCutPostCopywriter] DeepSeek API live notice:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Gestione copia negli appunti con feedback visivo
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const isPizza = testRun.brand === 'pizza';

  return (
    <div className="w-full bg-[#121826] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
      {/* Glow d'atmosfera */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        isPizza ? 'bg-rose-500/10' : 'bg-emerald-500/10'
      }`} />

      {/* Intestazione Pannello */}
      <div className="pb-3 border-b border-slate-800/80 relative z-10 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isPizza 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-tight truncate">
                  AI Post Content Studio
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                  isPizza ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {testRun.mode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium shrink-0">
            <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none">
              {postData.seasonContext.split(':')[0] || 'Green Season'}
            </span>
          </div>
        </div>

        {/* Dettaglio Stagionalità & Tono */}
        <p className="text-[11px] text-slate-400 leading-snug bg-slate-900/40 p-2 rounded-xl border border-slate-800/60 font-sans">
          🌿 {postData.seasonContext}
        </p>

        {/* Pulsanti Azione Header: 2 Colonne a Piena Larghezza (Zero sbordamenti) */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setProverbSeed(s => s + 1)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition shadow-sm active:scale-95"
            title="Genera un'altra combinazione con proverbio differente"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Nuovo Proverbio</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateDeepSeekAi}
            disabled={isGeneratingAi}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-purple-950/40 transition disabled:opacity-50 active:scale-95"
            title="Lancia il prompt personalizzato direttamente dentro DeepSeek AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span className="truncate">{isGeneratingAi ? 'Generazione...' : '✨ DeepSeek AI Live'}</span>
          </button>
        </div>
      </div>

      {/* Barra di Navigazione Tab */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10 pt-1">
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              activeTab === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutto Insieme
          </button>
          <button
            onClick={() => setActiveTab('th')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'th' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇹🇭 Thai
          </button>
          <button
            onClick={() => setActiveTab('en')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'en' ? 'bg-slate-800 text-sky-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'links' ? 'bg-slate-800 text-rose-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            📍 Link & Tag
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          ✨ Hashtag virali nel testo
        </span>
      </div>

      {/* Pulsanti Grandi per Copia Veloce Meta / TikTok */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10">
        <button
          onClick={() => handleCopy(postData.fullCaptionInstagram, 'ig')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-indigo-600/20 hover:from-pink-600/30 hover:via-purple-600/30 hover:to-indigo-600/30 border border-purple-500/40 text-xs font-bold text-white transition shadow-sm active:scale-[0.98]"
        >
          {copiedType === 'ig' ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="text-emerald-300">Copiato per Instagram & Facebook!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-pink-400" />
              <span>Copia Tutto per Instagram / Facebook</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleCopy(postData.fullCaptionTikTok, 'tt')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition shadow-sm active:scale-[0.98]"
        >
          {copiedType === 'tt' ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="text-emerald-300">Copiato per TikTok!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copia per TikTok (Caption Ottimizzata)</span>
            </>
          )}
        </button>
      </div>

      {/* Contenuto Testi Multilingua con Hashtag Integrati (Sempre Tutto Aperto e Visibile, Zero Scrollbar) */}
      <div className="space-y-3 relative z-10 text-xs">
        
        {/* 1° Blocco: THAI 🇹🇭 */}
        {(activeTab === 'all' || activeTab === 'th') && (
          <div className="p-3 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-1.5 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                <span>🇹🇭 THAI CAPTION + HASHTAG VIRALI</span>
              </span>
              <button
                onClick={() => handleCopy(postData.thaiContent, 'th_only')}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 transition"
              >
                {copiedType === 'th_only' ? '✓ Copiato' : 'Copia'}
              </button>
            </div>
            <p className="text-slate-200 leading-relaxed font-normal whitespace-pre-line">
              {postData.thaiContent}
            </p>
          </div>
        )}

        {/* 2° Blocco: INGLESE 🇬🇧 */}
        {(activeTab === 'all' || activeTab === 'en') && (
          <div className="p-3 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-1.5 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-sky-300 flex items-center gap-1.5">
                <span>🇬🇧 ENGLISH CAPTION + HASHTAG VIRALI</span>
              </span>
              <button
                onClick={() => handleCopy(postData.englishContent, 'en_only')}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 transition"
              >
                {copiedType === 'en_only' ? '✓ Copiato' : 'Copia'}
              </button>
            </div>
            <p className="text-slate-200 leading-relaxed font-normal whitespace-pre-line">
              {postData.englishContent}
            </p>
          </div>
        )}


        {/* 4° Blocco: LINK & TAG */}
        {(activeTab === 'all' || activeTab === 'links') && (
          <div className="p-3 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
            <div className="space-y-2">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Link Fisso & Mappa</span>
                  </span>
                  <button
                    onClick={() => handleCopy(postData.fixedLink, 'fixed_link')}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 transition"
                  >
                    {copiedType === 'fixed_link' ? '✓ Copiato' : 'Copia'}
                  </button>
                </div>
                <p className="text-slate-300 text-[11px] font-mono whitespace-pre-line break-all leading-relaxed">
                  {postData.fixedLink}
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-0.5">
                    <AtSign className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Cross-Tag Ufficiale</span>
                  </span>
                  <p className="text-indigo-300 font-bold text-xs truncate">
                    {postData.crossTag}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(postData.crossTag, 'cross_tag')}
                  className="text-[10px] text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 transition shrink-0"
                >
                  {copiedType === 'cross_tag' ? '✓ Copiato' : 'Copia'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
