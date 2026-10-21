import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Copy, Check, RefreshCw,
  MapPin, AtSign, Calendar, Share2, Tag,
  ExternalLink, MousePointerClick, MessageSquare,
  Users, CheckCircle2, Sliders, ShieldCheck,
  Layers, ArrowDown, FileText, Send
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
import { getLiveWeather, WeatherConditionSummary } from '../services/ranongWeatherService';

export interface PostCaptionsBundle {
  tiktok: string;
  instagram: string;
  facebook: string;
  google: string;
}

interface AutoCutPostCopywriterProps {
  testRun: AutoCutTestRun;
  selectedChannel?: DistributionChannelId;
  onSelectChannel?: (channel: DistributionChannelId) => void;
  onCaptionsChange?: (captions: PostCaptionsBundle) => void;
}

export function AutoCutPostCopywriter({ 
  testRun,
  selectedChannel = 'tiktok',
  onSelectChannel,
  onCaptionsChange
}: AutoCutPostCopywriterProps) {
  const [proverbSeed, setProverbSeed] = useState(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [liveWeather, setLiveWeather] = useState<WeatherConditionSummary | null>(null);
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

  // Firma identificativa univoca del video/scena attuale (cambia appena si genera un nuovo piatto/video/alloggio)
  const currentDishKey = testRun.scenes.map(s => `${s.sourceName || s.titlePrimary || ''}_${s.imageUrl}`).join('|');
  const testRunSignature = `${testRun.brand}_${testRun.mode}_${currentDishKey}`;

  // Sincronizzazione automatica parametri al cambio modalità o brand
  React.useEffect(() => {
    const isP = testRun.brand === 'pizza';
    setTiktokPoi(isP ? 'Flower Power Pizza Ranong' : 'Flower Power Village Koh Phayam');
    setIgStickerUrl(isP ? 'https://www.flowerpowerpizza.com/delivery' : 'https://www.flowerpowervillage.com');
    setIgStickerText(isP ? '🍕 Ordina Online (-10%)' : '🌴 Prenota Bungalow');
    setIgCollaborator(isP ? '@flowerpowerphayam' : '@flowerpowerpizzaranong');
    setFbCtaType(isP ? 'ORDER_NOW' : 'BOOK_NOW');
    setFbTargetUrl(isP ? 'https://www.flowerpowerpizza.com' : 'https://www.flowerpowervillage.com');
    setFbCheckin(isP ? 'Flower Power Pizza Ranong' : 'Flower Power Village Koh Phayam');
    setGoogleCtaType(isP ? 'ORDER' : 'BOOK');
    setGoogleOfferTitle(isP ? 'Sconto Benvenuto 10% Primo Ordine' : '10% Privilegio Prenotazione Diretta');
  }, [testRun.brand, testRun.mode]);

  // Carica meteo live reale di Ranong / Koh Phayam
  React.useEffect(() => {
    let isMounted = true;
    getLiveWeather(testRun.brand === 'pizza' ? 'Ranong' : 'Koh Phayam')
      .then(w => {
        if (isMounted) setLiveWeather(w);
      })
      .catch(console.warn);
    return () => { isMounted = false; };
  }, [testRun.brand]);

  // Genera i testi base a 0ms (con layout arioso, particelle e hashtag del piatto)
  const basePostData: PostCopyResult = useMemo(() => {
    return generatePostCopy(testRun, proverbSeed);
  }, [testRun, proverbSeed]);

  // Generazione Live con DeepSeek AI (contestuale a meteo, ingredienti e tradizione)
  const handleGenerateDeepSeekAi = React.useCallback(async (wOverride?: WeatherConditionSummary | null) => {
    setIsGeneratingAi(true);
    try {
      const dishes = testRun.scenes.map(s => 
        (s.sourceName || s.titlePrimary || '')
          .replace(/[\r\n]+/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim()
      ).filter(Boolean);

      const dishDetails = testRun.scenes.map(s => ({
        name: (s.sourceName || s.titlePrimary || '').replace(/[\r\n]+/g, ' ').trim(),
        nameTh: (s.titleSecondary || '').replace(/[\r\n]+/g, ' ').trim(),
        description: s.badgeCategory || ''
      }));

      const activeWeather = wOverride !== undefined ? wOverride : liveWeather;

      const res = await fetch('/api/social-publisher?action=generate_ai_post_copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: testRun.brand,
          mode: testRun.mode,
          dishes,
          dishDetails,
          season: basePostData.seasonContext,
          weather: activeWeather
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
  }, [testRun, basePostData.seasonContext, liveWeather]);

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

  // 🚀 AUTOMATISMO TOTALE: Quando cambia il piatto o il video:
  // 1. Rimescola il seed per avere sempre un proverbio e layout differente all'istante
  // 2. Lancia in automatico DeepSeek AI per generare il copy vivo e contestuale
  React.useEffect(() => {
    setProverbSeed(Math.floor(Math.random() * 1000000));
    setAiOverride(null);
    handleGenerateDeepSeekAi();
  }, [testRunSignature]);

  // Gestione copia negli appunti con feedback visivo
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const isPizza = testRun.brand === 'pizza';

  // 1. Didascalia Finale per TikTok (Clean domain + Link in Bio)
  const finalTikTokCaption = useMemo(() => {
    const mapsLink = isPizza
      ? 'https://maps.app.goo.gl/qjpYt6t69y17R4DF6'
      : 'https://maps.app.goo.gl/mugY88Wpuzjeebf56';
    const siteUrl = isPizza ? 'www.flowerpowerpizza.com' : 'www.flowerpowervillage.com';
    const discount = isPizza ? ' (ลด 10% ออร์เดอร์แรก)' : '';
    const callout = isPizza
      ? `🛵 สั่งอาหาร / จองโต๊ะ: จิ้มลิงก์หน้าโปรไฟล์ (Link in Bio) 👆✨\n🌐 ${siteUrl}${discount}\n📍 พิกัด (GPS): ${mapsLink}\n${postData.crossTag}`
      : `🌴 จองตรงราคาดีที่สุด: จิ้มลิงก์หน้าโปรไฟล์ (Link in Bio) 👆✨\n🌐 ${siteUrl}\n📍 พิกัด (GPS): ${mapsLink}\n${postData.crossTag}`;
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${callout}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${callout}`;
  }, [postData, isPizza, tiktokPoi]);

  // 2. Didascalia Finale per Instagram
  const finalInstagramCaption = useMemo(() => {
    const siteUrl = isPizza ? 'www.flowerpowerpizza.com' : 'www.flowerpowervillage.com';
    const callout = igPlacement === 'stories'
      ? `🔗 Link Sticker: ${igStickerText} ➔ ${igStickerUrl}\n🌐 ${siteUrl}\n${postData.crossTag}`
      : `✨ จิ้มลิงก์หน้าโปรไฟล์เพื่อสั่งเดลิเวอรี่ / Link in Bio to Order 👆\n🌐 ${siteUrl} (${isPizza ? '10% Off 1st Order' : 'Best Rate Direct'})\n📍 ${isPizza ? 'Ranong Hotspring' : 'Buffalo Bay, Koh Phayam'}\nCo-Author: ${igCollaborator}\n${postData.crossTag}`;
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${callout}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${callout}`;
  }, [postData, isPizza, igPlacement, igStickerText, igStickerUrl, igCollaborator]);

  // 3. Didascalia Finale per Facebook (Link 100% cliccabile)
  const finalFacebookCaption = useMemo(() => {
    const mapsLink = isPizza
      ? 'https://maps.app.goo.gl/qjpYt6t69y17R4DF6'
      : 'https://maps.app.goo.gl/mugY88Wpuzjeebf56';
    const siteUrl = isPizza ? 'https://www.flowerpowerpizza.com' : 'https://www.flowerpowervillage.com';
    const directLinkNotice = isPizza
      ? `👉 สั่งเดลิเวอรี่ออนไลน์ / Order Online Direct (10% Off):\n🔗 ${siteUrl}\n📍 Google Maps GPS:\n${mapsLink}\n📍 Check-in: ${fbCheckin}\n${postData.crossTag}`
      : `👉 จองห้องพักออนไลน์ / Book Your Island Stay Direct:\n🔗 ${siteUrl}\n📍 Google Maps GPS:\n${mapsLink}\n📍 Check-in: ${fbCheckin}\n${postData.crossTag}`;
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${directLinkNotice}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${directLinkNotice}`;
  }, [postData, isPizza, fbTargetUrl, fbCheckin]);

  // 4. Didascalia Finale per Google Business Profile (SEO Locale + Bottone)
  const finalGoogleCaption = useMemo(() => {
    const cleanThai = postData.thaiContent.replace(/#\S+/g, '').trim();
    const cleanEn = postData.englishContent.replace(/#\S+/g, '').trim();
    const siteUrl = isPizza ? 'www.flowerpowerpizza.com' : 'www.flowerpowervillage.com';
    const fullSiteUrl = isPizza ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com';
    
    if (googlePostType === 'offer') {
      return `🎁 ${googleOfferTitle.toUpperCase()}\n\n${cleanThai}\n\n${cleanEn}\n\n🌐 ${siteUrl}\n🏷️ Codice Coupon: ${googleCoupon}\n📌 Pulsante Azione: [${googleCtaType}] ➔ ${fullSiteUrl}`;
    }
    return `${cleanThai}\n\n${cleanEn}\n\n🌐 ${siteUrl} · ${isPizza ? 'Ranong Delivery' : 'Koh Phayam Resort'}\n📌 Pulsante Azione: [${googleCtaType}] ➔ ${fullSiteUrl}`;
  }, [postData, googlePostType, googleOfferTitle, googleCoupon, googleCtaType, isPizza]);

  useEffect(() => {
    if (onCaptionsChange) {
      onCaptionsChange({
        tiktok: finalTikTokCaption,
        instagram: finalInstagramCaption,
        facebook: finalFacebookCaption,
        google: finalGoogleCaption
      });
    }
  }, [finalTikTokCaption, finalInstagramCaption, finalFacebookCaption, finalGoogleCaption, onCaptionsChange]);

  return (
    <div className="w-full bg-[#121826] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
      {/* Glow d'atmosfera */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        selectedChannel === 'tiktok' ? 'bg-cyan-500/10' :
        selectedChannel === 'google' ? 'bg-blue-500/10' :
        selectedChannel === 'facebook' ? 'bg-blue-600/10' :
        'bg-pink-500/10'
      }`} />

      {/* HEADER STUDIO: CANALE ATTIVO & STAGIONALITÀ */}
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
                  Studio Post {selectedChannel === 'tiktok' ? 'TikTok' : selectedChannel === 'google' ? 'Google Business' : selectedChannel === 'facebook' ? 'Facebook' : 'Instagram'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                  isPizza ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {testRun.mode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Fase costruttiva a 2 reparti separati ➔ Unione automatica alla pubblicazione
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 🌦️ Live Weather Badge (Ranong / Koh Phayam) */}
            {liveWeather && (
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold shrink-0 transition-colors ${
                  liveWeather.isRaining 
                    ? 'bg-blue-950/80 border-blue-500/60 text-blue-200 shadow-sm shadow-blue-950/50' 
                    : liveWeather.isNight
                    ? 'bg-purple-950/80 border-purple-500/50 text-purple-200'
                    : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                }`}
                title={`Meteo Live: ${liveWeather.sensoryAngle}`}
              >
                <span className="text-xs">{liveWeather.isRaining ? '🌧️' : liveWeather.isNight ? '🌙' : '☀️'}</span>
                <span>{liveWeather.city} {liveWeather.tempC}°C</span>
                {liveWeather.isRaining && (
                  <span className="px-1 py-0.2 rounded-xs bg-rose-600 text-[8px] font-black text-white animate-pulse">
                    RAIN
                  </span>
                )}
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium shrink-0">
              <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-none">
                {postData.seasonContext.split(':')[0] || 'Green Season'}
              </span>
            </div>
          </div>
        </div>

        {/* Barra di Stato DeepSeek AI & Tasto Rigenera */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 shrink-0 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span className="font-semibold text-xs">
              {isGeneratingAi ? 'DeepSeek AI sta scrivendo il copy...' : (aiOverride ? '✨ Copy DeepSeek AI Attivo' : 'Copy Bilingue Autonomo')}
            </span>
            {aiOverride && !isGeneratingAi && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Copy DeepSeek AI sincronizzato live"></span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleGenerateDeepSeekAi()}
            disabled={isGeneratingAi}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-xs font-bold text-white shadow-md shadow-purple-950/40 transition disabled:opacity-50 active:scale-95 cursor-pointer"
            title="Rigenera un nuovo copy ad effetto con DeepSeek AI per questo piatto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white shrink-0 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Scrittura in corso...' : '✨ Rigenera Copy AI'}</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🏗️ 1. FASE COSTRUTTIVA: I 2 REPARTI LINGUISTICI BEN SEPARATI */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3 relative z-10 text-xs">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fase Costruttiva: Reparti Linguistici Autonomi</span>
          </span>
          <span className="text-[10px] text-indigo-400 font-mono">Bicultural Thai / English</span>
        </div>

        {/* 🇹🇭 REPARTO 1: THAILANDESE (Indipendente e Dedicato) */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-amber-500/30 space-y-2 shadow-md">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🇹🇭</span>
              <div>
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  Reparto Lingua Thailandese
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Particelle amichevoli, proverbio Thai & hashtag</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(postData.thaiContent, 'th_only')}
              className="text-[10px] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition cursor-pointer"
            >
              {copiedType === 'th_only' ? '✓ Copiato!' : 'Copia Solo Thai'}
            </button>
          </div>

          <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line text-[11.5px] p-2 bg-slate-900/50 rounded-xl border border-slate-800/80">
            {postData.thaiContent}
          </p>
        </div>

        {/* 🇬🇧 REPARTO 2: INGLESE (Indipendente e Dedicato) */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-sky-500/30 space-y-2 shadow-md">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🇬🇧</span>
              <div>
                <h4 className="text-xs font-black text-sky-300 uppercase tracking-wide">
                  Reparto Lingua Inglese
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Storytelling internazionale, proverbio EN & callout</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(postData.englishContent, 'en_only')}
              className="text-[10px] text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition cursor-pointer"
            >
              {copiedType === 'en_only' ? '✓ Copiato!' : 'Copia Solo Inglese'}
            </button>
          </div>

          <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line text-[11.5px] p-2 bg-slate-900/50 rounded-xl border border-slate-800/80">
            {postData.englishContent}
          </p>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ⚙️ 2. PARAMETRI SPECIFICI DEL CANALE SELEZIONATO              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3 relative z-10 text-xs">
        
        {/* TIKTOK PARAMETERS */}
        {selectedChannel === 'tiktok' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Parametri API & POI TikTok</span>
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono">Geo Indexing</span>
            </div>

            <div>
              <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">
                Punto d'Interesse Geotag (POI Fisico & GPS):
              </label>
              <select
                value={tiktokPoi}
                onChange={e => setTiktokPoi(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans cursor-pointer mb-1.5"
              >
                <option value="Flower Power Pizza Ranong">📍 Flower Power Pizza Ranong (Hotspring)</option>
                <option value="Flower Power Village Koh Phayam">📍 Flower Power Village Koh Phayam (Buffalo Bay)</option>
              </select>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-400">GPS Maps:</span>
                <a
                  href={tiktokPoi.includes('Village') ? 'https://maps.app.goo.gl/mugY88Wpuzjeebf56' : 'https://maps.app.goo.gl/qjpYt6t69y17R4DF6'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:underline truncate"
                >
                  {tiktokPoi.includes('Village') ? 'https://maps.app.goo.gl/mugY88Wpuzjeebf56' : 'https://maps.app.goo.gl/qjpYt6t69y17R4DF6'}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input type="checkbox" checked={tiktokDuet} onChange={e => setTiktokDuet(e.target.checked)} className="accent-cyan-400" />
                <span>Duetti ON</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input type="checkbox" checked={tiktokStitch} onChange={e => setTiktokStitch(e.target.checked)} className="accent-cyan-400" />
                <span>Stitch ON</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input type="checkbox" checked={tiktokComment} onChange={e => setTiktokComment(e.target.checked)} className="accent-cyan-400" />
                <span>Commenti</span>
              </label>
            </div>
          </div>
        )}

        {/* GOOGLE BUSINESS PARAMETERS */}
        {selectedChannel === 'google' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-blue-500/30 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">Pulsante Azione (CTA):</label>
                <select
                  value={googleCtaType}
                  onChange={e => setGoogleCtaType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400 font-sans cursor-pointer"
                >
                  <option value="ORDER">ORDINA ORA (Order Online)</option>
                  <option value="BOOK">PRENOTA SUBITO (Book Now)</option>
                  <option value="LEARN_MORE">SCOPRI DI PIÙ (Learn More)</option>
                  <option value="CALL">CHIAMA ORA (Call Restaurant)</option>
                </select>
              </div>

              <div>
                <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">URL di Destinazione:</label>
                <input
                  type="text"
                  readOnly
                  value={isPizza ? 'https://www.flowerpowerpizza.com/delivery' : 'https://www.flowerpowervillage.com'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono truncate"
                />
              </div>
            </div>

            {googlePostType === 'offer' && (
              <div className="p-2.5 bg-amber-950/20 rounded-xl border border-amber-500/30 space-y-2">
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
              ✓ Gli hashtag vengono rimossi automaticamente nell'unione finale (penalizzanti su Maps).
            </span>
          </div>
        )}

        {/* FACEBOOK PARAMETERS */}
        {selectedChannel === 'facebook' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-blue-600/30 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Link Cliccabile & Check-in Facebook</span>
              </span>
              <span className="text-[10px] text-blue-400/80 font-mono">OpenGraph Card</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">Link Diretto Cliccabile:</label>
                <input
                  type="text"
                  value={fbTargetUrl}
                  onChange={e => setFbTargetUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-sky-300 font-mono"
                />
              </div>

              <div>
                <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">Pulsante CTA Pagina:</label>
                <select
                  value={fbCtaType}
                  onChange={e => setFbCtaType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400 font-sans cursor-pointer"
                >
                  <option value="ORDER_NOW">Ordina Subito (Order Now)</option>
                  <option value="BOOK_NOW">Prenota Subito (Book Now)</option>
                  <option value="LEARN_MORE">Scopri di più (Learn More)</option>
                  <option value="WHATSAPP">Invia Messaggio WhatsApp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">Check-in Luogo Ufficiale & Posizione GPS:</label>
              <select
                value={fbCheckin}
                onChange={e => setFbCheckin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-sans cursor-pointer mb-1.5"
              >
                <option value="Flower Power Pizza Ranong">📍 Flower Power Pizza Ranong</option>
                <option value="Flower Power Village Koh Phayam">📍 Flower Power Village Koh Phayam</option>
              </select>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-slate-400">GPS Maps:</span>
                <a
                  href={fbCheckin.includes('Village') ? 'https://maps.app.goo.gl/mugY88Wpuzjeebf56' : 'https://maps.app.goo.gl/qjpYt6t69y17R4DF6'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-300 hover:underline truncate"
                >
                  {fbCheckin.includes('Village') ? 'https://maps.app.goo.gl/mugY88Wpuzjeebf56' : 'https://maps.app.goo.gl/qjpYt6t69y17R4DF6'}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* INSTAGRAM PARAMETERS */}
        {selectedChannel === 'instagram' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-pink-500/30 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
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
                  <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">Tag Collaboratore (Co-Author):</label>
                  <input
                    type="text"
                    value={igCollaborator}
                    onChange={e => setIgCollaborator(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-pink-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-slate-400 block mb-1">Geolocalizzazione (Place Tag):</label>
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🚀 3. FASE DI PUBBLICAZIONE: UNIONE AUTOMATICA FINALE          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="pt-2 border-t border-slate-800 space-y-3 relative z-10 text-xs">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Fase di Pubblicazione: Unione Automatica Canale</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isPizza ? 'Thai ➔ English ➔ Link/CTA' : 'English ➔ Thai ➔ Link/CTA'}
          </span>
        </div>

        {/* ANTEPRIMA DEL TESTO UNIFICATO AL 100% */}
        <div className="p-3.5 bg-emerald-950/20 rounded-2xl border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Didascalia Finale per {selectedChannel.toUpperCase()}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const text = selectedChannel === 'tiktok' ? finalTikTokCaption :
                  selectedChannel === 'google' ? finalGoogleCaption :
                  selectedChannel === 'facebook' ? finalFacebookCaption :
                  finalInstagramCaption;
                handleCopy(text, 'unified_box');
              }}
              className="text-[10px] text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/60 transition cursor-pointer"
            >
              {copiedType === 'unified_box' ? '✓ Copiato!' : 'Copia Testo'}
            </button>
          </div>

          <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line text-[11.5px] p-2 bg-slate-950/60 rounded-xl border border-emerald-900/40">
            {selectedChannel === 'tiktok' && finalTikTokCaption}
            {selectedChannel === 'google' && finalGoogleCaption}
            {selectedChannel === 'facebook' && finalFacebookCaption}
            {selectedChannel === 'instagram' && finalInstagramCaption}
          </p>
        </div>

        {/* PULSANTE GRANDE FINALE DI COPIA UNIFICATA */}
        <button
          onClick={() => {
            if (selectedChannel === 'tiktok') handleCopy(finalTikTokCaption, 'tt_final');
            if (selectedChannel === 'instagram') handleCopy(finalInstagramCaption, 'ig_final');
            if (selectedChannel === 'facebook') handleCopy(finalFacebookCaption, 'fb_final');
            if (selectedChannel === 'google') handleCopy(finalGoogleCaption, 'google_final');
          }}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs text-white transition shadow-lg active:scale-[0.98] cursor-pointer ${
            selectedChannel === 'tiktok' ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-cyan-950/50' :
            selectedChannel === 'google' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-blue-950/50' :
            selectedChannel === 'facebook' ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 shadow-blue-950/50' :
            'bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-950/50'
          }`}
        >
          {copiedType && copiedType.endsWith('_final') ? (
            <>
              <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
              <span className="text-emerald-100 uppercase tracking-wide">
                Didascalia Finale Unificata Copiata!
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>
                Copia Didascalia Unificata per {selectedChannel === 'tiktok' ? 'TikTok' : selectedChannel === 'google' ? 'Google Business' : selectedChannel === 'facebook' ? 'Facebook' : 'Instagram'}
              </span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
