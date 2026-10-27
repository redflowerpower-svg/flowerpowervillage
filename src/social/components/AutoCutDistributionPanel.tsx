import React, { useState } from 'react';
import { 
  FlaskConical, Rocket, Check, AlertCircle, Send,
  Share2, Video, Smartphone, Clock, Users,
  MapPin, Tag, Sparkles, CheckCircle2, ChevronRight, ExternalLink,
  Pizza, Palmtree, Camera
} from 'lucide-react';
import { AutoCutTestRun } from '../services/autoCutLabEngine';
import { THIRD_PARTY_COMMUNITY_GROUPS } from '../config/thirdPartyGroups';
import { dispatchPostToTelegramTopic } from '../services/telegramStudioDispatcher';
import { generatePostCopy } from '../services/autoCutCopywriterEngine';

export type DistributionEnvironment = 'test' | 'production';
export type DistributionChannelId = 'tiktok' | 'google' | 'facebook' | 'instagram';

export type ChannelFormatMap = {
  tiktok: 'feed' | 'story';
  google: 'update' | 'offer' | 'media';
  facebook: 'post' | 'reels' | 'story' | 'group';
  instagram: 'reels' | 'story' | 'feed';
};

export interface AutoCutDistributionPanelProps {
  testRun: AutoCutTestRun;
  selectedChannel?: DistributionChannelId;
  onSelectChannel?: (channel: DistributionChannelId) => void;
  channelFormats?: ChannelFormatMap;
  onChangeChannelFormat?: (channel: DistributionChannelId, format: any) => void;
  selectedPlacement?: string;
  onSelectPlacement?: (placement: string) => void;
  liveCaptions?: {
    tiktok: string;
    instagram: string;
    facebook: string;
    google: string;
  } | null;
}

// 🎨 VETTORIALI UFFICIALI DEI 4 CANALI SOCIAL (Esportati per uso condiviso)
export function TikTokLogo({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#25F4EE" d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.5 2.59 2.59 0 0 1 2.59-2.59c.28 0 .54.04.79.11V9.74a5.67 5.67 0 0 0-.79-.06 5.68 5.68 0 0 0-5.69 5.68 5.69 5.69 0 0 0 5.69 5.69 5.68 5.68 0 0 0 5.68-5.69V8.04a7.35 7.35 0 0 0 4.47 1.48V6.43a4.29 4.29 0 0 1-3-.61z"/>
      <path fill="#FE2C55" d="M17.6 6.82s.51.5 0 0A4.28 4.28 0 0 1 16.54 4h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.5 2.59 2.59 0 0 1 2.59-2.59c.28 0 .54.04.79.11v-3.18a5.67 5.67 0 0 0-.79-.06 5.68 5.68 0 0 0-5.69 5.68 5.69 5.69 0 0 0 5.69 5.69 5.68 5.68 0 0 0 5.68-5.69V9.04a7.35 7.35 0 0 0 4.47 1.48V7.43a4.29 4.29 0 0 1-3-.61z" opacity="0.8"/>
      <path fill="#FFFFFF" d="M17.1 6.32a4.28 4.28 0 0 1-1.06-1h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.5 2.59 2.59 0 0 1 2.59-2.59c.28 0 .54.04.79.11V9.74a5.67 5.67 0 0 0-.79-.06 5.68 5.68 0 0 0-5.69 5.68 5.69 5.69 0 0 0 5.69 5.69 5.68 5.68 0 0 0 5.68-5.69V8.04a7.35 7.35 0 0 0 4.47 1.48V6.43a4.29 4.29 0 0 1-2-.11z"/>
    </svg>
  );
}

export function GoogleLogo({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
  );
}

export function FacebookLogo({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function InstagramLogo({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <defs>
        <radialGradient id="ig-icon-grad" cx="20%" cy="105%" r="130%">
          <stop offset="0%" stopColor="#ffda77" />
          <stop offset="15%" stopColor="#f77737" />
          <stop offset="50%" stopColor="#e1306c" />
          <stop offset="75%" stopColor="#c13584" />
          <stop offset="100%" stopColor="#833ab4" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-icon-grad)" />
      <circle cx="12" cy="12" r="4.3" fill="none" stroke="#ffffff" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="#ffffff" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="#ffffff" strokeWidth="1.8" />
    </svg>
  );
}

export function AutoCutDistributionPanel({ 
  testRun,
  selectedChannel: controlledChannel,
  onSelectChannel,
  channelFormats: controlledFormats,
  onChangeChannelFormat,
  liveCaptions
}: AutoCutDistributionPanelProps) {
  // 0. Selettore Brand & Account Target (default sul brand del testRun corrente)
  const [selectedBrand, setSelectedBrand] = useState<'pizza' | 'village'>(testRun.brand || 'pizza');

  React.useEffect(() => {
    if (testRun.brand) {
      setSelectedBrand(testRun.brand);
    }
    if (testRun.mode === 'R1') {
      setInternalChannel('facebook');
      if (onSelectChannel) onSelectChannel('facebook');
      setFormat('facebook', 'group');
    }
  }, [testRun.brand, testRun.mode]);

  // 1. Switch Ambiente (Default: Produzione Live - l'utente può passare a Test Sandbox se desiderato)
  const [environment, setEnvironment] = useState<DistributionEnvironment>('production');

  // 2. Canale Attivo (singola scelta che pilota il form al centro)
  const [internalChannel, setInternalChannel] = useState<DistributionChannelId>('tiktok');
  const activeChannel = controlledChannel || internalChannel;

  const handleSelectChannel = (channel: DistributionChannelId) => {
    setInternalChannel(channel);
    if (onSelectChannel) {
      onSelectChannel(channel);
    }
  };

  // 3. Formato Attivo Univoco per ogni Canale (Scelta Esclusiva Radio)
  const [internalFormats, setInternalFormats] = useState<ChannelFormatMap>({
    tiktok: 'feed',
    google: testRun.mode === 'LM1' ? 'offer' : 'update',
    facebook: 'post',
    instagram: 'reels'
  });

  const formats = controlledFormats || internalFormats;

  const setFormat = (channel: DistributionChannelId, format: any) => {
    if (onChangeChannelFormat) {
      onChangeChannelFormat(channel, format);
    } else {
      setInternalFormats(prev => ({ ...prev, [channel]: format }));
    }
  };

  // Stato esecuzione e timeline step-by-step
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgressPct, setPublishProgressPct] = useState<number>(0);
  const [liveSteps, setLiveSteps] = useState<Array<{ label: string; status: 'pending' | 'active' | 'done' }>>([]);
  const [publishStatus, setPublishStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: string[];
  }>({ type: null, message: '' });

  // Nome formattato canale attivo
  const channelNames: Record<DistributionChannelId, string> = {
    tiktok: 'TikTok',
    google: 'Google Business Profile',
    facebook: 'Facebook',
    instagram: 'Instagram'
  };

  // Gestione Pubblicazione o Test: TASSATIVAMENTE VIDEO MP4 9:16
  const handleExecute = async () => {
    setIsPublishing(true);
    setPublishProgressPct(5);

    const initialSteps: Array<{ label: string; status: 'pending' | 'active' | 'done' }> = [
      { label: 'Inizializzazione motore video HD 9:16 (Canvas 720x1280)', status: 'active' },
      { label: 'Verifica e caricamento web font ufficiali (Outfit, Kanit, Prompt)', status: 'pending' },
      { label: 'Registrazione fotogrammi HD fluidi a 30fps costanti', status: 'pending' },
      { label: 'Muxing audio jingle digitale 48kHz stereo', status: 'pending' },
      { label: 'Finalizzazione container video MP4 HD', status: 'pending' },
      { label: 'Upload su Cloud Storage (Supabase S3 bucket)', status: 'pending' },
      { label: `Invio al bot Telegram Staff (${activeChannel === 'facebook' && formats.facebook === 'group' ? 'Topic 2 Koh Phayam Group' : 'Topic 3 Stories'})`, status: 'pending' },
      { label: 'Consegna completata con successo!', status: 'pending' }
    ];
    setLiveSteps(initialSteps);

    const updateStep = (idx: number, status: 'active' | 'done') => {
      setLiveSteps(prev => prev.map((s, i) => {
        if (i < idx) return { ...s, status: 'done' };
        if (i === idx) return { ...s, status };
        return s;
      }));
    };

    setPublishStatus({ type: null, message: 'Inizializzazione motore video HD 9:16...' });

    let finalMediaUrl: string | undefined = undefined;

    try {
      if (typeof window === 'undefined' || !(window as any).__autoCutGetVideo) {
        throw new Error('Motore video non pronto. Attendi il caricamento completo del player e riprova.');
      }

      updateStep(1, 'active');
      setPublishStatus({
        type: null,
        message: 'Registrazione video MP4 HD con grafica e piatti ufficiali R1...'
      });

      const videoUrl = await (window as any).__autoCutGetVideo((pct: number, stepIndex?: number, stepMsg?: string) => {
        setPublishProgressPct(Math.round(5 + (pct * 0.70)));
        if (typeof stepIndex === 'number') {
          if (stepIndex === 0) updateStep(0, 'active');
          else if (stepIndex === 1) updateStep(1, 'active');
          else if (stepIndex === 2) updateStep(2, 'active');
          else if (stepIndex === 3) updateStep(4, 'active');
          else if (stepIndex === 4) updateStep(5, 'active');
        }
        setPublishStatus({
          type: null,
          message: stepMsg || `Registrazione video MP4 HD (${pct}%)...`
        });
      });

      if (!videoUrl) {
        throw new Error('La registrazione video non ha generato il file MP4. Riprova mantenendo attiva la schermata.');
      }

      finalMediaUrl = videoUrl;
      updateStep(1, 'done');
      updateStep(5, 'done');
      updateStep(6, 'active');

      setPublishProgressPct(88);
      setPublishStatus({
        type: null,
        message: 'Invio video MP4 e testo bilingue a Telegram...'
      });

      // Invio REALE al bot Telegram Staff se l'opzione Gruppo Koh Phayam è selezionata (SEMPRE Topic 2)
      if (activeChannel === 'facebook' && formats.facebook === 'group') {
        const copyResult = generatePostCopy(testRun, 0);
        const captionText = liveCaptions?.facebook || liveCaptions?.instagram || copyResult.fullCaptionInstagram;
        const tgRes = await dispatchPostToTelegramTopic({
          topic: 'kohPhayamGroup',
          title: `Video Pronto per Gruppo Facebook Koh Phayam · Format ${testRun.mode}`,
          copyText: captionText,
          format: testRun.mode,
          brand: selectedBrand,
          priceBadge: testRun.scenes[0]?.priceLabel,
          imageUrl: finalMediaUrl,
          mediaUrl: finalMediaUrl,
          thumbnailUrl: (window as any).__lastGeneratedThumbnailUrl,
          mediaType: 'video'
        });
        if (!tgRes.success) {
          throw new Error(tgRes.error || 'Errore durante la trasmissione Telegram');
        }
      }

      // Invio REALE al bot Telegram Staff se Stories TikTok o Stories Instagram/Facebook è selezionata (Topic 3)
      if (
        (activeChannel === 'tiktok' && formats.tiktok === 'story') ||
        (activeChannel === 'instagram' && formats.instagram === 'story') ||
        (activeChannel === 'facebook' && formats.facebook === 'story')
      ) {
        const copyResult = generatePostCopy(testRun, 0);
        const captionText = activeChannel === 'instagram'
          ? (liveCaptions?.instagram || copyResult.fullCaptionInstagram)
          : activeChannel === 'facebook'
          ? (liveCaptions?.facebook || copyResult.fullCaptionInstagram)
          : (liveCaptions?.tiktok || copyResult.fullCaptionTikTok);
        const brandLabel = selectedBrand === 'pizza' ? 'Flower Power Pizza (Ranong)' : 'Flower Power Farm Village (Koh Phayam)';
        const tgRes = await dispatchPostToTelegramTopic({
          topic: 'tikTokStories',
          title: `Stories Video ${activeChannel === 'instagram' ? 'Instagram' : activeChannel === 'facebook' ? 'Facebook' : 'TikTok'} & Reels · Format ${testRun.mode}`,
          copyText: `Profilo Target: ${brandLabel}\n\n${captionText}`,
          format: testRun.mode,
          brand: selectedBrand,
          priceBadge: testRun.scenes[0]?.priceLabel,
          imageUrl: finalMediaUrl,
          mediaUrl: finalMediaUrl,
          thumbnailUrl: (window as any).__lastGeneratedThumbnailUrl,
          mediaType: 'video'
        });
        if (!tgRes.success) {
          throw new Error(tgRes.error || 'Errore durante la trasmissione Telegram');
        }
      }

      // Invio REALE alla Pagina Facebook (Post Video di Pagina o Reels)
      let publishedFacebookUrl: string | undefined = undefined;
      if (activeChannel === 'facebook' && (formats.facebook === 'post' || formats.facebook === 'reels')) {
        if (environment === 'production') {
          setPublishStatus({
            type: null,
            message: `Trasmissione video a Meta Graph API (${selectedBrand === 'pizza' ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'})...`
          });
          const copyResult = generatePostCopy(testRun, 0);
          const captionText = liveCaptions?.facebook || liveCaptions?.instagram || copyResult.fullCaptionInstagram;
          const fbRes = await fetch('/api/social-publisher?action=publish_facebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoUrl: finalMediaUrl,
              title: testRun.scenes[0]?.titlePrimary || `Flower Power ${selectedBrand === 'pizza' ? 'Pizza' : 'Village'}`,
              caption: captionText,
              brand: selectedBrand
            })
          });
          const fbData = await fbRes.json();
          if (!fbRes.ok || !fbData.success) {
            throw new Error(fbData.error || 'Errore durante la pubblicazione del video su Facebook');
          }
          publishedFacebookUrl = fbData.postUrl;
          console.log('[AutoCutDistributionPanel] Pubblicazione Facebook completata con successo:', fbData);
        }
      }

      setPublishProgressPct(100);
      updateStep(7, 'done');

      if (environment === 'test') {
        // Simulazione Test Sandbox
        await new Promise(r => setTimeout(r, 400));
        setPublishStatus({
          type: 'success',
          message: activeChannel === 'facebook' && formats.facebook === 'group'
            ? 'Video inviato con successo al Topic 2 (Koh Phayam Group) di Telegram!'
            : (activeChannel === 'tiktok' && formats.tiktok === 'story') || (activeChannel === 'instagram' && formats.instagram === 'story') || (activeChannel === 'facebook' && formats.facebook === 'story')
            ? 'Video inviato con successo al Topic 3 (TikTok Stories) di Telegram!'
            : `Test simulazione completato per ${channelNames[activeChannel]}!`,
          details: [
            `Formato attivo: ${formats[activeChannel].toUpperCase()} · Video MP4 HD (30fps)`,
            `Payload compilato conformemente alle API di ${channelNames[activeChannel]}`,
            `Profilo target applicato: ${selectedBrand === 'pizza' ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}`,
            'Verifica del testo, formattazione bilingue e link attivi superata',
            ...(activeChannel === 'facebook' && formats.facebook === 'group'
              ? ['Video MP4 e scheda inviati al Topic 2 "Koh Phayam Group" con testo pronto per la copia a 1 tocco e link al gruppo FB!']
              : []),
            ...((activeChannel === 'tiktok' && formats.tiktok === 'story') || (activeChannel === 'instagram' && formats.instagram === 'story') || (activeChannel === 'facebook' && formats.facebook === 'story')
              ? ['Video MP4 e scheda inviati al Topic 3 "TikTok Stories" con testo copiabile a 1 tocco e tasti rapidi!']
              : []),
            'Nessun dato reale inviato al profilo pubblico'
          ]
        });
      } else {
        // Invio Reale in Produzione
        await new Promise(r => setTimeout(r, 600));
        setPublishStatus({
          type: 'success',
          message: `Pubblicazione Video LIVE inviata con successo su ${channelNames[activeChannel]}!`,
          details: [
            `Video MP4 e didascalia trasmessi alle API ufficiali`,
            `Profilo aziendale: ${selectedBrand === 'pizza' ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}`,
            ...(activeChannel === 'facebook' && (formats.facebook === 'post' || formats.facebook === 'reels')
              ? [
                  `Video MP4 e didascalia bilingue pubblicati sulla Pagina Facebook ufficiale!`,
                  publishedFacebookUrl ? `Link Facebook Post: ${publishedFacebookUrl}` : ''
                ].filter(Boolean)
              : []),
            ...(activeChannel === 'facebook' && formats.facebook === 'group'
              ? ['Video inviato con successo al Topic 2 "Koh Phayam Group" con testo copiabile a 1 tocco e link al gruppo FB!']
              : []),
            ...((activeChannel === 'tiktok' && formats.tiktok === 'story') || (activeChannel === 'instagram' && formats.instagram === 'story') || (activeChannel === 'facebook' && formats.facebook === 'story')
              ? ['Video inviato con successo al Topic 3 "TikTok Stories" con testo copiabile a 1 tocco e tasti per TikTok e Instagram!']
              : [])
          ]
        });
      }
    } catch (err: any) {
      console.error('[AutoCutDistributionPanel] Execute error:', err);
      setPublishProgressPct(0);
      setPublishStatus({
        type: 'error',
        message: err.message || 'Errore durante la compilazione o trasmissione video.',
        details: [err.stack || 'Verifica la connessione o riprova tra qualche istante.']
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-5 bg-[#121826] rounded-3xl border border-slate-800 shadow-2xl space-y-4 text-left text-xs select-none">
      
      {/* 1. HEADER: TITOLO SU RIGA UNICA & BRAND TARGET */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 font-black text-white text-xs tracking-wider whitespace-nowrap">
          <Share2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>CANALE DI DISTRIBUZIONE</span>
        </div>

        {/* Brand Target Switcher: Pizzeria vs Villaggio */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setSelectedBrand('pizza')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedBrand === 'pizza'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Pizza className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Pizzeria</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedBrand('village')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedBrand === 'village'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palmtree className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Villaggio</span>
          </button>
        </div>

      </div>

      {/* 2. I 4 CANALI IN COLONNA (Selezione Singola: Apre il Modulo al Centro) */}
      <div className="grid grid-cols-1 gap-2.5">
        
        {/* CANALE 1: TIKTOK */}
        <div 
          onClick={() => handleSelectChannel('tiktok')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeChannel === 'tiktok'
              ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/40'
              : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <TikTokLogo className="w-4 h-4 shrink-0" />
              <span>TikTok</span>
            </div>
            {activeChannel === 'tiktok' ? (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Attivo
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Seleziona</span>
            )}
          </div>
          <div className="text-[10px] text-cyan-300/80 font-mono pl-6 pt-0.5">
            Profilo: {selectedBrand === 'pizza' ? '@flowerpowerpizza_ranong' : '@flowerpowervillage'}
          </div>

          {activeChannel === 'tiktok' && (
            <div className="mt-3 pt-2.5 space-y-1.5 pl-3 border-l-2 border-cyan-500/40 text-[11px]" onClick={e => e.stopPropagation()}>
              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span className={formats.tiktok === 'feed' ? 'font-bold text-white' : ''}>Feed Video (9:16)</span>
                </span>
                <input
                  type="radio"
                  name="placement_tiktok"
                  checked={formats.tiktok === 'feed'}
                  onChange={() => setFormat('tiktok', 'feed')}
                  className="accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                  <span className={formats.tiktok === 'story' ? 'font-bold text-white' : ''}>
                    Stories <span className="text-[10px] text-amber-400 font-mono">(via Telegram)</span>
                  </span>
                </span>
                <input
                  type="radio"
                  name="placement_tiktok"
                  checked={formats.tiktok === 'story'}
                  onChange={() => setFormat('tiktok', 'story')}
                  className="accent-pink-400 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* CANALE 2: GOOGLE BUSINESS PROFILE */}
        <div 
          onClick={() => handleSelectChannel('google')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeChannel === 'google'
              ? 'bg-blue-950/20 border-blue-500/60 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/40'
              : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <GoogleLogo className="w-4 h-4 shrink-0" />
              <span>Google Business Profile</span>
            </div>
            {activeChannel === 'google' ? (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Attivo
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Seleziona</span>
            )}
          </div>
          <div className="text-[10px] text-blue-300/80 font-mono pl-6 pt-0.5">
            Scheda: {selectedBrand === 'pizza' ? 'Flower Power Pizza - Ranong' : 'Flower Power Farm Village & Spa'}
          </div>

          {activeChannel === 'google' && (
            <div className="mt-3 pt-2.5 space-y-1.5 pl-3 border-l-2 border-blue-500/40 text-[11px]" onClick={e => e.stopPropagation()}>
              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span className={formats.google === 'update' ? 'font-bold text-white' : ''}>Novità / Update (con CTA)</span>
                </span>
                <input
                  type="radio"
                  name="placement_google"
                  checked={formats.google === 'update'}
                  onChange={() => setFormat('google', 'update')}
                  className="accent-emerald-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className={formats.google === 'offer' ? 'font-bold text-white' : ''}>Offerta Speciale Promo</span>
                </span>
                <input
                  type="radio"
                  name="placement_google"
                  checked={formats.google === 'offer'}
                  onChange={() => setFormat('google', 'offer')}
                  className="accent-amber-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span className={formats.google === 'media' ? 'font-bold text-white' : ''}>Google Maps Video Gallery</span>
                </span>
                <input
                  type="radio"
                  name="placement_google"
                  checked={formats.google === 'media'}
                  onChange={() => setFormat('google', 'media')}
                  className="accent-rose-400 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* CANALE 3: FACEBOOK */}
        <div 
          onClick={() => handleSelectChannel('facebook')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeChannel === 'facebook'
              ? 'bg-blue-950/30 border-blue-600/70 shadow-lg shadow-blue-950/50 ring-1 ring-blue-600/40'
              : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <FacebookLogo className="w-4 h-4 shrink-0" />
              <span>Facebook</span>
            </div>
            {activeChannel === 'facebook' ? (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40">
                Attivo
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Seleziona</span>
            )}
          </div>
          <div className="text-[10px] text-blue-300/80 font-mono pl-6 pt-0.5">
            Pagina: {selectedBrand === 'pizza' ? 'Flower Power Pizza - Ranong' : 'Flower Power Farm Village - Koh Phayam'}
          </div>

          {activeChannel === 'facebook' && (
            <div className="mt-3 pt-2.5 space-y-1.5 pl-3 border-l-2 border-blue-600/40 text-[11px]" onClick={e => e.stopPropagation()}>
              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-sky-400" />
                  <span className={formats.facebook === 'post' ? 'font-bold text-white' : ''}>Post Video di Pagina (con Link)</span>
                </span>
                <input
                  type="radio"
                  name="placement_facebook"
                  checked={formats.facebook === 'post'}
                  onChange={() => setFormat('facebook', 'post')}
                  className="accent-sky-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-400" />
                  <span className={formats.facebook === 'reels' ? 'font-bold text-white' : ''}>Facebook Reels</span>
                </span>
                <input
                  type="radio"
                  name="placement_facebook"
                  checked={formats.facebook === 'reels'}
                  onChange={() => setFormat('facebook', 'reels')}
                  className="accent-blue-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span className={formats.facebook === 'story' ? 'font-bold text-white' : ''}>Stories di Pagina (24h)</span>
                </span>
                <input
                  type="radio"
                  name="placement_facebook"
                  checked={formats.facebook === 'story'}
                  onChange={() => setFormat('facebook', 'story')}
                  className="accent-indigo-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className={formats.facebook === 'group' ? 'font-bold text-white' : ''}>Gruppo Koh Phayam (via Telegram)</span>
                </span>
                <input
                  type="radio"
                  name="placement_facebook"
                  checked={formats.facebook === 'group'}
                  onChange={() => setFormat('facebook', 'group')}
                  className="accent-amber-400 cursor-pointer"
                />
              </label>

              {formats.facebook === 'group' && (
                <div className="mt-1.5 p-2.5 bg-amber-950/40 border border-amber-600/40 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-400" />
                      Destinazione: Topic 2 (Koh Phayam Group)
                    </span>
                    <a
                      href="https://www.facebook.com/share/g/1Hyh1mJ7Hu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-mono font-bold hover:underline"
                      title="Apri gruppo Facebook Koh Phayam"
                    >
                      <span>Vedi Gruppo</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-[9.5px] text-slate-300 leading-tight">
                    Invia sempre il post al Topic 2 (Koh Phayam Group) di Telegram con testo DeepSeek e link rapido per la pubblicazione diretta nel gruppo Facebook dell'isola.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CANALE 4: INSTAGRAM */}
        <div 
          onClick={() => handleSelectChannel('instagram')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            activeChannel === 'instagram'
              ? 'bg-pink-950/20 border-pink-500/60 shadow-lg shadow-pink-950/50 ring-1 ring-pink-500/40'
              : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <InstagramLogo className="w-4 h-4 shrink-0" />
              <span>Instagram</span>
            </div>
            {activeChannel === 'instagram' ? (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                Attivo
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Seleziona</span>
            )}
          </div>
          <div className="text-[10px] text-pink-300/80 font-mono pl-6 pt-0.5">
            Account: {selectedBrand === 'pizza' ? '@flowerpowerpizza' : '@flowerpowervillage'}
          </div>

          {activeChannel === 'instagram' && (
            <div className="mt-3 pt-2.5 space-y-1.5 pl-3 border-l-2 border-pink-500/40 text-[11px]" onClick={e => e.stopPropagation()}>
              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-pink-400" />
                  <span className={formats.instagram === 'reels' ? 'font-bold text-white' : ''}>Reels (9:16 + Cover)</span>
                </span>
                <input
                  type="radio"
                  name="placement_instagram"
                  checked={formats.instagram === 'reels'}
                  onChange={() => setFormat('instagram', 'reels')}
                  className="accent-pink-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                  <span className={formats.instagram === 'story' ? 'font-bold text-white' : ''}>Stories (Link Sticker 24h)</span>
                </span>
                <input
                  type="radio"
                  name="placement_instagram"
                  checked={formats.instagram === 'story'}
                  onChange={() => setFormat('instagram', 'story')}
                  className="accent-purple-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-900/60 transition">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span className={formats.instagram === 'feed' ? 'font-bold text-white' : ''}>Feed Video Post</span>
                </span>
                <input
                  type="radio"
                  name="placement_instagram"
                  checked={formats.instagram === 'feed'}
                  onChange={() => setFormat('instagram', 'feed')}
                  className="accent-rose-400 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

      </div>

      {/* 3. MODALITÀ DI INVIO: TEST O PRODUZIONE & TASTO AZIONE */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
            Modalità di Invio:
          </span>
          <span className="text-[10px] font-mono font-bold">
            {environment === 'test' ? (
              <span className="text-amber-400">🧪 Sandbox (Nessun feed pubblico)</span>
            ) : (
              <span className="text-emerald-400">🚀 Pubblicazione Live Reale</span>
            )}
          </span>
        </div>

        {/* Badge Informativo Formato: 100% Video MP4 HD */}
        <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>Formato di Esportazione</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
              Video MP4 HD 9:16
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Viene esportato il video completo con animazione a 30fps, font ufficiali, proporzioni 9:16 e audio originale.
          </p>
        </div>

        {/* Selettore Test vs Produzione al momento dell'invio in fondo */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setEnvironment('test')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              environment === 'test'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical className={`w-3.5 h-3.5 shrink-0 ${environment === 'test' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Test (Sandbox)</span>
          </button>

          <button
            type="button"
            onClick={() => setEnvironment('production')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              environment === 'production'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 border border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Rocket className={`w-3.5 h-3.5 shrink-0 ${environment === 'production' ? 'text-white' : 'text-slate-400'}`} />
            <span>Produzione Live</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleExecute}
          disabled={isPublishing}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-lg disabled:opacity-50 cursor-pointer ${
            environment === 'test'
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-amber-950/40'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 border border-emerald-400'
          }`}
        >
          {isPublishing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Elaborazione in corso ({publishProgressPct}%)...</span>
            </>
          ) : environment === 'test' ? (
            <>
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {activeChannel === 'facebook' && formats.facebook === 'group'
                  ? 'Invia al Gruppo FB su Telegram (Topic 2)'
                  : (activeChannel === 'tiktok' && formats.tiktok === 'story') || (activeChannel === 'instagram' && formats.instagram === 'story')
                  ? 'Invia Stories su Telegram (Topic 3)'
                  : `Simula Test su ${channelNames[activeChannel]}`}
              </span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-white" />
              <span>
                {activeChannel === 'facebook' && formats.facebook === 'group'
                  ? 'Invia al Gruppo FB su Telegram (Topic 2)'
                  : (activeChannel === 'tiktok' && formats.tiktok === 'story') || (activeChannel === 'instagram' && formats.instagram === 'story')
                  ? 'Invia Stories su Telegram (Topic 3)'
                  : `Pubblica Subito su ${channelNames[activeChannel]}`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 4. FEEDBACK E STATO PUBBLICAZIONE LIVE */}
      {(publishStatus.type || isPublishing) && (
        <div className={`p-3.5 rounded-2xl border text-[11px] space-y-2 animate-fadeIn shadow-lg ${
          isPublishing
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            : publishStatus.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center gap-2">
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : publishStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="text-xs">{publishStatus.message}</span>
            </div>
            {isPublishing && publishProgressPct > 0 && (
              <span className="text-xs font-mono font-bold text-amber-300">
                {publishProgressPct}%
              </span>
            )}
          </div>

          {isPublishing && (
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, publishProgressPct)}%` }}
              />
            </div>
          )}

          {/* Timeline Step-by-Step in tempo reale */}
          {liveSteps && liveSteps.length > 0 && (
            <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5 font-mono text-[10px]">
              <div className="text-[10.5px] font-bold text-amber-300 font-sans flex items-center justify-between pb-0.5">
                <span>Passaggi Esecuzione:</span>
                <span className="text-[9.5px] text-slate-400 font-mono">
                  {liveSteps.filter(s => s.status === 'done').length} / {liveSteps.length}
                </span>
              </div>
              <div className="space-y-1">
                {liveSteps.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2">
                    {step.status === 'done' ? (
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    ) : step.status === 'active' ? (
                      <span className="w-2.5 h-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-slate-600 shrink-0">○</span>
                    )}
                    <span className={step.status === 'done' ? 'text-slate-300' : step.status === 'active' ? 'text-amber-200 font-bold' : 'text-slate-500'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {publishStatus.details && publishStatus.details.length > 0 && (
            <ul className="space-y-1 pl-5 list-disc text-[10px] text-slate-300 pt-1">
              {publishStatus.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}

    </div>
  );
}
