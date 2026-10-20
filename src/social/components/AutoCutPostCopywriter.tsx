import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Copy, Check, RefreshCw,
  MapPin, AtSign, Calendar, Share2, Tag,
  ExternalLink, MousePointerClick, MessageSquare,
  Users, CheckCircle2, Sliders, ShieldCheck
} from 'lucide-react';
import { AutoCutTestRun } from '../services/autoCutLabEngine';
import { 
  generatePostCopy, 
  PostCopyResult 
} from '../services/autoCutCopywriterEngine';
import { 
  DistributionChannelId, 
  TikTokLogo, 
  GoogleLogo, 
  FacebookLogo, 
  InstagramLogo 
} from './AutoCutDistributionPanel';

interface AutoCutPostCopywriterProps {
  testRun: AutoCutTestRun;
  selectedChannel?: DistributionChannelId;
  onSelectChannel?: (channel: DistributionChannelId) => void;
}

export function AutoCutPostCopywriter({ 
  testRun,
  selectedChannel = 'tiktok',
  onSelectChannel
}: AutoCutPostCopywriterProps) {
  const [proverbSeed, setProverbSeed] = useState(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'channel_form' | 'th' | 'en' | 'all'>('channel_form');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiOverride, setAiOverride] = useState<{
    thaiContent?: string;
    englishContent?: string;
  } | null>(null);

  // Stati Dinamici per Canale
  // 1. TikTok State
  const [tiktokPoi, setTiktokPoi] = useState(testRun.brand === 'pizza' ? 'Flower Power Pizza Ranong' : 'Flower Power Village Koh Phayam');
  const [tiktokDuet, setTiktokDuet] = useState(true);
  const [tiktokStitch, setTiktokStitch] = useState(true);
  const [tiktokComment, setTiktokComment] = useState(true);

  // 2. Instagram State
  const [igPlacement, setIgPlacement] = useState<'reels' | 'stories'>('reels');
  const [igStickerUrl, setIgStickerUrl] = useState(testRun.brand === 'pizza' ? 'https://www.flowerpowerpizza.com/delivery' : 'https://www.flowerpowervillage.com');
  const [igStickerText, setIgStickerText] = useState(testRun.brand === 'pizza' ? '🍕 Ordina Online (-10%)' : '🌴 Prenota Bungalow');
  const [igCollaborator, setIgCollaborator] = useState(testRun.brand === 'pizza' ? '@flowerpowerphayam' : '@flowerpowerpizzaranong');

  // 3. Facebook State
  const [fbCtaType, setFbCtaType] = useState(testRun.brand === 'pizza' ? 'ORDER_NOW' : 'BOOK_NOW');
  const [fbTargetUrl, setFbTargetUrl] = useState(testRun.brand === 'pizza' ? 'https://www.flowerpowerpizza.com' : 'https://www.flowerpowervillage.com');
  const [fbCheckin, setFbCheckin] = useState(testRun.brand === 'pizza' ? 'Flower Power Pizza Ranong' : 'Flower Power Village Koh Phayam');

  // 4. Google Business Profile State
  const [googlePostType, setGooglePostType] = useState<'update' | 'offer'>('update');
  const [googleCtaType, setGoogleCtaType] = useState(testRun.brand === 'pizza' ? 'ORDER' : 'BOOK');
  const [googleCoupon, setGoogleCoupon] = useState('WELCOME10');
  const [googleOfferTitle, setGoogleOfferTitle] = useState(testRun.brand === 'pizza' ? 'Sconto Benvenuto 10% Primo Ordine' : '10% Privilegio Prenotazione Diretta');

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
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const isPizza = testRun.brand === 'pizza';

  // Didascalie Sartoriali per Ciascun Canale
  // 1. TikTok: Senza link HTTP grezzi (morti), con invito "Link in Bio" e tag del POI
  const tailoredTikTokCaption = useMemo(() => {
    const callout = isPizza
      ? `🛵 สั่งอาหาร / จองโต๊ะ: จิ้มลิงก์หน้าโปรไฟล์ (Link in Bio) 👆✨\n📍 พิกัด: ${tiktokPoi}\n${postData.crossTag}`
      : `🌴 จองตรงราคาดีที่สุด: จิ้มลิงก์หน้าโปรไฟล์ (Link in Bio) 👆✨\n📍 พิกัด: ${tiktokPoi}\n${postData.crossTag}`;
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${callout}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${callout}`;
  }, [postData, isPizza, tiktokPoi]);

  // 2. Instagram: Reels (visual layout senza link morti) o Stories con Sticker Link
  const tailoredInstagramCaption = useMemo(() => {
    const callout = igPlacement === 'stories'
      ? `🔗 Link Sticker: ${igStickerText} ➔ ${igStickerUrl}\n${postData.crossTag}`
      : `✨ จิ้มลิงก์หน้าโปรไฟล์เพื่อสั่งเดลิเวอรี่ / Link in Bio to Order\n📍 ${isPizza ? 'Ranong Hotspring' : 'Buffalo Bay, Koh Phayam'}\nCo-Author: ${igCollaborator}\n${postData.crossTag}`;
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${callout}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${callout}`;
  }, [postData, isPizza, igPlacement, igStickerText, igStickerUrl, igCollaborator]);

  // 3. Facebook: Con Link Cliccabile HTTP in evidenza + CTA
  const tailoredFacebookCaption = useMemo(() => {
    const directLinkNotice = isPizza
      ? `👉 สั่งเดลิเวอรี่ออนไลน์ / Order Online Direct:\n🔗 ${fbTargetUrl}\n📍 Check-in: ${fbCheckin}\n${postData.crossTag}`
      : `👉 จองห้องพักออนไลน์ / Book Your Island Stay:\n🔗 ${fbTargetUrl}\n📍 Check-in: ${fbCheckin}\n${postData.crossTag}`;
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${directLinkNotice}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${directLinkNotice}`;
  }, [postData, isPizza, fbTargetUrl, fbCheckin]);

  // 4. Google Business: Zero Hashtag (penalizzanti per SEO Maps), testo pulito keyword-rich
  const tailoredGoogleCaption = useMemo(() => {
    const cleanThai = postData.thaiContent.replace(/#\S+/g, '').trim();
    const cleanEn = postData.englishContent.replace(/#\S+/g, '').trim();
    
    if (googlePostType === 'offer') {
      return `🎁 ${googleOfferTitle.toUpperCase()}\n\n${cleanThai}\n\n${cleanEn}\n\n🏷️ Codice Coupon: ${googleCoupon}\n📌 Pulsante Azione: [${googleCtaType}] ➔ ${isPizza ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com'}`;
    }
    return `${cleanThai}\n\n${cleanEn}\n\n📌 Pulsante Azione: [${googleCtaType}] ➔ ${isPizza ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com'}`;
  }, [postData, googlePostType, googleOfferTitle, googleCoupon, googleCtaType, isPizza]);

  return (
    <div className="w-full bg-[#121826] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
      {/* Glow d'atmosfera */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        selectedChannel === 'tiktok' ? 'bg-cyan-500/10' :
        selectedChannel === 'google' ? 'bg-blue-500/10' :
        selectedChannel === 'facebook' ? 'bg-blue-600/10' :
        'bg-pink-500/10'
      }`} />

      {/* INTESTAZIONE DINAMICA: PILOTATA DAL CANALE SELEZIONATO A DESTRA */}
      <div className="pb-3 border-b border-slate-800/80 relative z-10 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo Vettoriale del Canale Attivo */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
              selectedChannel === 'tiktok' ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' :
              selectedChannel === 'google' ? 'bg-blue-950/40 border-blue-500/40 text-blue-300' :
              selectedChannel === 'facebook' ? 'bg-blue-900/40 border-blue-600/40 text-blue-300' :
              'bg-pink-950/40 border-pink-500/40 text-pink-300'
            }`}>
              {selectedChannel === 'tiktok' && <TikTokLogo className="w-5 h-5" />}
              {selectedChannel === 'google' && <GoogleLogo className="w-5 h-5" />}
              {selectedChannel === 'facebook' && <FacebookLogo className="w-5 h-5" />}
              {selectedChannel === 'instagram' && <InstagramLogo className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-tight truncate">
                  {selectedChannel === 'tiktok' && 'Modulo Dedicato TikTok'}
                  {selectedChannel === 'google' && 'Modulo Dedicato Google Business'}
                  {selectedChannel === 'facebook' && 'Modulo Dedicato Facebook'}
                  {selectedChannel === 'instagram' && 'Modulo Dedicato Instagram'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                  isPizza ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {testRun.mode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {selectedChannel === 'tiktok' && 'Didascalia senza link morti · POI Geotag · Feed Nei Dintorni'}
                {selectedChannel === 'google' && 'Local SEO Maps · Zero Hashtag Spam · Tasto CTA & Offerte'}
                {selectedChannel === 'facebook' && 'Link Cliccabile Diretto · Scheda OpenGraph · Check-in'}
                {selectedChannel === 'instagram' && 'Reels & Stories · Link Sticker 24h · Tag Collaboratore'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium shrink-0">
            <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[110px] sm:max-w-none">
              {postData.seasonContext.split(':')[0] || 'Green Season'}
            </span>
          </div>
        </div>

        {/* Pulsanti Azione Header: Nuovo Proverbio + DeepSeek AI */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setProverbSeed(s => s + 1)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition shadow-sm active:scale-95 cursor-pointer"
            title="Genera un'altra combinazione con proverbio differente"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Nuovo Proverbio</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateDeepSeekAi}
            disabled={isGeneratingAi}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-purple-950/40 transition disabled:opacity-50 active:scale-95 cursor-pointer"
            title="Lancia il prompt personalizzato direttamente dentro DeepSeek AI"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span className="truncate">{isGeneratingAi ? 'Generazione...' : '✨ DeepSeek AI Live'}</span>
          </button>
        </div>
      </div>

      {/* 🎛️ MODULO CAMPI SARTORIALI DEDICATO PER IL CANALE SELEZIONATO */}
      <div className="space-y-3 relative z-10 text-xs">
        
        {/* A. CONTESTO & CAMPI SPECIFICI PER TIKTOK */}
        {selectedChannel === 'tiktok' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Parametri API & POI TikTok</span>
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono">Geo Indexing</span>
            </div>

            {/* Scelta POI (Point of Interest) */}
            <div>
              <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                Punto d'Interesse Geotag (POI Fisico):
              </label>
              <select
                value={tiktokPoi}
                onChange={e => setTiktokPoi(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
              >
                <option value="Flower Power Pizza Ranong">📍 Flower Power Pizza Ranong (Hotspring)</option>
                <option value="Flower Power Village Koh Phayam">📍 Flower Power Village Koh Phayam (Buffalo Bay)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                • Questo POI aggancia il video alla pagina del luogo di TikTok spingendolo nel feed locale.
              </span>
            </div>

            {/* Toggles Interazione TikTok */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tiktokDuet}
                  onChange={e => setTiktokDuet(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Duetti ON</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tiktokStitch}
                  onChange={e => setTiktokStitch(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Stitch ON</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tiktokComment}
                  onChange={e => setTiktokComment(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Commenti</span>
              </label>
            </div>
          </div>
        )}

        {/* B. CONTESTO & CAMPI SPECIFICI PER GOOGLE BUSINESS PROFILE */}
        {selectedChannel === 'google' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Parametri Post Google Business</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setGooglePostType('update')}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${googlePostType === 'update' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Novità
                </button>
                <button
                  type="button"
                  onClick={() => setGooglePostType('offer')}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${googlePostType === 'offer' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
                >
                  Offerta
                </button>
              </div>
            </div>

            {/* Pulsante CTA Ufficiale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                  Pulsante Azione (CTA):
                </label>
                <select
                  value={googleCtaType}
                  onChange={e => setGoogleCtaType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400 font-sans"
                >
                  <option value="ORDER">ORDINA ORA (Order Online)</option>
                  <option value="BOOK">PRENOTA SUBITO (Book Now)</option>
                  <option value="LEARN_MORE">SCOPRI DI PIÙ (Learn More)</option>
                  <option value="CALL">CHIAMA ORA (Call Restaurant)</option>
                </select>
              </div>

              <div>
                <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                  URL di Destinazione:
                </label>
                <input
                  type="text"
                  readOnly
                  value={isPizza ? 'https://www.flowerpowerpizza.com/delivery' : 'https://www.flowerpowervillage.com'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono truncate"
                />
              </div>
            </div>

            {/* Dettagli Offerta Speciale */}
            {googlePostType === 'offer' && (
              <div className="p-2.5 bg-amber-950/20 rounded-xl border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Campi Offerta Promozionale Google Maps</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={googleOfferTitle}
                    onChange={e => setGoogleOfferTitle(e.target.value)}
                    placeholder="Titolo Offerta"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-sans"
                  />
                  <input
                    type="text"
                    value={googleCoupon}
                    onChange={e => setGoogleCoupon(e.target.value)}
                    placeholder="Codice Coupon (es. WELCOME10)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>
            )}

            <span className="text-[10px] text-emerald-400/90 block">
              ✓ Gli hashtag sono stati rimossi automaticamente dal testo (penalizzano il posizionamento locale su Google Maps).
            </span>
          </div>
        )}

        {/* C. CONTESTO & CAMPI SPECIFICI PER FACEBOOK */}
        {selectedChannel === 'facebook' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-blue-600/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Link Cliccabile & Check-in Facebook</span>
              </span>
              <span className="text-[10px] text-blue-400/80 font-mono">OpenGraph Card</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                  Link Diretto Cliccabile nel Post:
                </label>
                <input
                  type="text"
                  value={fbTargetUrl}
                  onChange={e => setFbTargetUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-sky-300 font-mono"
                />
              </div>

              <div>
                <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                  Pulsante CTA Pagina:
                </label>
                <select
                  value={fbCtaType}
                  onChange={e => setFbCtaType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400 font-sans"
                >
                  <option value="ORDER_NOW">Ordina Subito (Order Now)</option>
                  <option value="BOOK_NOW">Prenota Subito (Book Now)</option>
                  <option value="LEARN_MORE">Scopri di più (Learn More)</option>
                  <option value="WHATSAPP">Invia Messaggio WhatsApp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                Check-in Luogo Ufficiale:
              </label>
              <select
                value={fbCheckin}
                onChange={e => setFbCheckin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-sans"
              >
                <option value="Flower Power Pizza Ranong">📍 Flower Power Pizza Ranong</option>
                <option value="Flower Power Village Koh Phayam">📍 Flower Power Village Koh Phayam</option>
              </select>
            </div>
          </div>
        )}

        {/* D. CONTESTO & CAMPI SPECIFICI PER INSTAGRAM */}
        {selectedChannel === 'instagram' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-pink-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-pink-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MousePointerClick className="w-3.5 h-3.5 text-pink-400" />
                <span>Impostazioni Instagram (Reels & Stories)</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setIgPlacement('reels')}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${igPlacement === 'reels' ? 'bg-pink-600 text-white' : 'text-slate-400'}`}
                >
                  Reels (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => setIgPlacement('stories')}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${igPlacement === 'stories' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                >
                  Stories (24h)
                </button>
              </div>
            </div>

            {igPlacement === 'stories' ? (
              <div className="p-2.5 bg-purple-950/20 rounded-xl border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Adesivo Link Interattivo (Story Link Sticker)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Testo Adesivo:</label>
                    <input
                      type="text"
                      value={igStickerText}
                      onChange={e => setIgStickerText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">URL di Destinazione:</label>
                    <input
                      type="text"
                      value={igStickerUrl}
                      onChange={e => setIgStickerUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-sky-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                    Tag Collaboratore (Co-Author):
                  </label>
                  <input
                    type="text"
                    value={igCollaborator}
                    onChange={e => setIgCollaborator(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-pink-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                    Geolocalizzazione (Place Tag):
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={isPizza ? 'Ranong, Thailand' : 'Koh Phayam Island'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-sans"
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* PULSANTE GRANDE: COPIA SARTORIALE PER IL CANALE SELEZIONATO */}
      <div className="pt-1">
        <button
          onClick={() => {
            if (selectedChannel === 'tiktok') handleCopy(tailoredTikTokCaption, 'tt');
            if (selectedChannel === 'instagram') handleCopy(tailoredInstagramCaption, 'ig');
            if (selectedChannel === 'facebook') handleCopy(tailoredFacebookCaption, 'fb');
            if (selectedChannel === 'google') handleCopy(tailoredGoogleCaption, 'google');
          }}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs text-white transition shadow-lg active:scale-[0.98] cursor-pointer ${
            selectedChannel === 'tiktok' ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-cyan-950/50' :
            selectedChannel === 'google' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-blue-950/50' :
            selectedChannel === 'facebook' ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 shadow-blue-950/50' :
            'bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-950/50'
          }`}
        >
          {copiedType ? (
            <>
              <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
              <span className="text-emerald-100 uppercase tracking-wide">
                Copiato per {selectedChannel.toUpperCase()}!
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>
                Copia Didascalia Sartoriale per {selectedChannel === 'tiktok' ? 'TikTok' : selectedChannel === 'google' ? 'Google Business' : selectedChannel === 'facebook' ? 'Facebook' : 'Instagram'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* BARRA TAB DI ISPEZIONE TESTI */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10 pt-2 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('channel_form')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              activeTab === 'channel_form' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Testo Canale Attivo
          </button>
          <button
            onClick={() => setActiveTab('th')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'th' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇹🇭 Solo Thai
          </button>
          <button
            onClick={() => setActiveTab('en')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'en' ? 'bg-slate-800 text-sky-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇬🇧 Solo EN
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'all' ? 'bg-slate-800 text-emerald-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutto
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          {selectedChannel === 'google' ? '🚫 Zero hashtag (Anti-Spam Maps)' : '✨ Hashtag virali nel testo'}
        </span>
      </div>

      {/* ANTEPRIMA DEL TESTO ATTIVO */}
      <div className="p-3 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2 relative text-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
            <span>Didascalia Pronta ({selectedChannel.toUpperCase()})</span>
          </span>
          <button
            onClick={() => {
              const text = selectedChannel === 'tiktok' ? tailoredTikTokCaption :
                selectedChannel === 'google' ? tailoredGoogleCaption :
                selectedChannel === 'facebook' ? tailoredFacebookCaption :
                tailoredInstagramCaption;
              handleCopy(text, 'current_box');
            }}
            className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 transition"
          >
            {copiedType === 'current_box' ? '✓ Copiato' : 'Copia Testo'}
          </button>
        </div>

        <p className="text-slate-200 leading-relaxed font-normal whitespace-pre-line font-sans text-[11.5px]">
          {activeTab === 'channel_form' && (
            selectedChannel === 'tiktok' ? tailoredTikTokCaption :
            selectedChannel === 'google' ? tailoredGoogleCaption :
            selectedChannel === 'facebook' ? tailoredFacebookCaption :
            tailoredInstagramCaption
          )}
          {activeTab === 'th' && postData.thaiContent}
          {activeTab === 'en' && postData.englishContent}
          {activeTab === 'all' && (
            `${postData.thaiContent}\n\n${postData.englishContent}\n\n${postData.fixedLink}\n\n${postData.crossTag}`
          )}
        </p>
      </div>

    </div>
  );
}
