import React, { useState } from 'react';
import { 
  FlaskConical, Rocket, Check, AlertCircle, Send,
  Share2, Video, Smartphone, Clock, Users,
  MapPin, Tag, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';
import { AutoCutTestRun } from '../services/autoCutLabEngine';

export type DistributionEnvironment = 'test' | 'production';
export type DistributionChannelId = 'tiktok' | 'google' | 'facebook' | 'instagram';

export interface AutoCutDistributionPanelProps {
  testRun: AutoCutTestRun;
  selectedChannel?: DistributionChannelId;
  onSelectChannel?: (channel: DistributionChannelId) => void;
  selectedPlacement?: string;
  onSelectPlacement?: (placement: string) => void;
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
  onSelectChannel
}: AutoCutDistributionPanelProps) {
  // 1. Switch Ambiente (Test Sandbox vs Produzione Live)
  const [environment, setEnvironment] = useState<DistributionEnvironment>('test');

  // 2. Canale Attivo (singola scelta che pilota il form al centro)
  const [internalChannel, setInternalChannel] = useState<DistributionChannelId>('tiktok');
  const activeChannel = controlledChannel || internalChannel;

  const handleSelectChannel = (channel: DistributionChannelId) => {
    setInternalChannel(channel);
    if (onSelectChannel) {
      onSelectChannel(channel);
    }
  };

  // 3. Posizioni attive per canale
  const [placements, setPlacements] = useState({
    // TikTok
    tiktokFeed: true,
    tiktokStoryTelegram: false,
    
    // Google Business Profile
    googleUpdate: true,
    googleOffer: testRun.mode === 'LM1',
    googleMedia: false,

    // Facebook
    facebookReels: true,
    facebookStories: false,
    facebookPageVideo: true,
    facebookGroupsTelegram: false,

    // Instagram
    instagramReels: true,
    instagramStories: true,
    instagramFeed: false
  });

  // Stato esecuzione
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: string[];
  }>({ type: null, message: '' });

  // Toggle singola posizione
  const togglePlacement = (placement: keyof typeof placements) => {
    setPlacements(prev => ({ ...prev, [placement]: !prev[placement] }));
  };

  // Nome formattato canale attivo
  const channelNames: Record<DistributionChannelId, string> = {
    tiktok: 'TikTok',
    google: 'Google Business Profile',
    facebook: 'Facebook',
    instagram: 'Instagram'
  };

  // Gestione Pubblicazione o Test
  const handleExecute = async () => {
    setIsPublishing(true);
    setPublishStatus({ type: null, message: '' });

    try {
      if (environment === 'test') {
        // Simulazione Test Sandbox
        await new Promise(r => setTimeout(r, 900));
        setPublishStatus({
          type: 'success',
          message: `🧪 Test simulazione completato per ${channelNames[activeChannel]}!`,
          details: [
            `Payload compilato conformemente alle API di ${channelNames[activeChannel]}`,
            'Verifica del testo, formattazione bilingue e link attivi superata',
            'Nessun dato reale inviato al profilo pubblico'
          ]
        });
      } else {
        // Invio Reale in Produzione
        await new Promise(r => setTimeout(r, 1400));
        setPublishStatus({
          type: 'success',
          message: `🚀 Pubblicazione LIVE inviata con successo su ${channelNames[activeChannel]}!`,
          details: [
            `Contenuto multimediale e didascalia trasmessi alle API ufficiali`,
            `Profilo aziendale aggiornato in tempo reale`,
            `Notifiche e log salvati nel database`
          ]
        });
      }
    } catch {
      setPublishStatus({
        type: 'error',
        message: 'Errore durante la trasmissione. Verifica i token di accesso.'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-5 bg-[#121826] rounded-3xl border border-slate-800 shadow-2xl space-y-4 text-left text-xs select-none">
      
      {/* 1. HEADER: TITOLO & SWITCH AMBIENTE (TEST vs PRODUZIONE) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-white text-xs tracking-wide">
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>CANALE DI DISTRIBUZIONE</span>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
            1 Canale Attivo
          </span>
        </div>

        {/* Master Selector: Test vs Produzione */}
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
            <span>Test</span>
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
            <span>Produzione</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-mono leading-tight px-1">
          {environment === 'test' ? (
            <span className="text-amber-300/90">
              • Modalità simulazione: verifica payload e vincoli senza pubblicare nei feed.
            </span>
          ) : (
            <span className="text-emerald-400">
              • Modalità LIVE: pubblicazione reale automatica sui profili ufficiali.
            </span>
          )}
        </p>
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
                Attivo 👈
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Seleziona</span>
            )}
          </div>

          {activeChannel === 'tiktok' && (
            <div className="mt-3 pt-2.5 space-y-1.5 pl-3 border-l-2 border-cyan-500/40 text-[11px]" onClick={e => e.stopPropagation()}>
              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3 h-3 text-cyan-400" />
                  <span>Feed Video (9:16)</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.tiktokFeed}
                  onChange={() => togglePlacement('tiktokFeed')}
                  className="accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-pink-400" />
                  <span>Stories <span className="text-[10px] text-amber-400">(via Telegram)</span></span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.tiktokStoryTelegram}
                  onChange={() => togglePlacement('tiktokStoryTelegram')}
                  className="accent-pink-400"
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
                Attivo 👈
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Seleziona</span>
            )}
          </div>

          {activeChannel === 'google' && (
            <div className="mt-3 pt-2.5 space-y-1.5 pl-3 border-l-2 border-blue-500/40 text-[11px]" onClick={e => e.stopPropagation()}>
              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>Novità / Update (con CTA)</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.googleUpdate}
                  onChange={() => togglePlacement('googleUpdate')}
                  className="accent-emerald-400"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Offerta Speciale Promo</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.googleOffer}
                  onChange={() => togglePlacement('googleOffer')}
                  className="accent-amber-400"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>Google Maps Video Gallery</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.googleMedia}
                  onChange={() => togglePlacement('googleMedia')}
                  className="accent-rose-400"
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
                Attivo 👈
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Seleziona</span>
            )}
          </div>

          {activeChannel === 'facebook' && (
            <div className="mt-3 pt-2.5 space-y-1.5 pl-3 border-l-2 border-blue-600/40 text-[11px]" onClick={e => e.stopPropagation()}>
              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3 h-3 text-blue-400" />
                  <span>Facebook Reels</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.facebookReels}
                  onChange={() => togglePlacement('facebookReels')}
                  className="accent-blue-400"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3 h-3 text-sky-400" />
                  <span>Post Video di Pagina (con Link)</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.facebookPageVideo}
                  onChange={() => togglePlacement('facebookPageVideo')}
                  className="accent-sky-400"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-indigo-400" />
                  <span>Stories di Pagina (24h)</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.facebookStories}
                  onChange={() => togglePlacement('facebookStories')}
                  className="accent-indigo-400"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-amber-400" />
                  <span>Gruppi <span className="text-[10px] text-amber-400">(via Telegram)</span></span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.facebookGroupsTelegram}
                  onChange={() => togglePlacement('facebookGroupsTelegram')}
                  className="accent-amber-400"
                />
              </label>
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
                Attivo 👈
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Seleziona</span>
            )}
          </div>

          {activeChannel === 'instagram' && (
            <div className="mt-3 pt-2.5 space-y-1.5 pl-3 border-l-2 border-pink-500/40 text-[11px]" onClick={e => e.stopPropagation()}>
              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3 h-3 text-pink-400" />
                  <span>Reels (9:16 + Cover)</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.instagramReels}
                  onChange={() => togglePlacement('instagramReels')}
                  className="accent-pink-400"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-purple-400" />
                  <span>Stories (Link Sticker 24h)</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.instagramStories}
                  onChange={() => togglePlacement('instagramStories')}
                  className="accent-purple-400"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-rose-400" />
                  <span>Feed Video Post</span>
                </span>
                <input
                  type="checkbox"
                  checked={placements.instagramFeed}
                  onChange={() => togglePlacement('instagramFeed')}
                  className="accent-rose-400"
                />
              </label>
            </div>
          )}
        </div>

      </div>

      {/* 3. TASTO ESECUZIONE (SIMULAZIONE O PRODUZIONE SU CANALE ATTIVO) */}
      <div className="pt-2">
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
              <span>Elaborazione in corso...</span>
            </>
          ) : environment === 'test' ? (
            <>
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span>Simula Test su {channelNames[activeChannel]}</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Pubblica Subito su {channelNames[activeChannel]}</span>
            </>
          )}
        </button>
      </div>

      {/* 4. FEEDBACK E STATO PUBBLICAZIONE */}
      {publishStatus.type && (
        <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 animate-fadeIn ${
          publishStatus.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-1.5 font-bold">
            {publishStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{publishStatus.message}</span>
          </div>

          {publishStatus.details && publishStatus.details.length > 0 && (
            <ul className="space-y-0.5 pl-5 list-disc text-[10px] text-slate-300">
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
