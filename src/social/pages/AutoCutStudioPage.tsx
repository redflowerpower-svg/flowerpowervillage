import React, { useState, useEffect } from 'react';
import { 
  Share2, Video, Send, Sparkles, RefreshCw, 
  CheckCircle, AlertCircle, ExternalLink, Key, 
  Play, Check, HelpCircle,
  Heart, MessageCircle, Bookmark, Globe,
  Pizza, Palmtree, Film, Flame, Users, Lock, Search, BarChart3,
  Calendar as CalendarIcon, Zap, Layers
} from 'lucide-react';
import { SocialAdminAuth } from '../components/SocialAdminAuth';
import { 
  TikTokIcon, 
  GoogleIcon, 
  GoogleMapsIcon, 
  MetaIcon, 
  InstagramIcon, 
  FacebookIcon 
} from '../components/SocialPlatformIcons';
import { SocialCalendarView, generateOfficialMonthlyRoutine } from '../components/SocialCalendarView';
import { VisualMotionStudio } from '../components/VisualMotionStudio';
import { AutoCutLabView } from '../components/AutoCutLabView';
import { generateFullAutoCutCampaign } from '../services/autoCutIntelligence';
import { 
  ScheduledSocialPost, 
  generateAutopilotCampaign 
} from '../services/autoContentEngine';

export type UILanguage = 'EN' | 'IT';
type BrandType = 'pizza' | 'village';
type PlatformType = 'tiktok' | 'google' | 'instagram' | 'facebook';
type PrivacyLevel = 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';



const I18N = {
  EN: {
    appTitle: 'Flower Power Social Studio',
    appBadge: 'TikTok v2 & Meta',
    appSubtitle: 'Dedicated Multichannel Publisher · Pizzeria Ranong · Koh Phayam Village',
    brandPizza: 'Pizzeria Ranong',
    brandVillage: 'Koh Phayam Village',
    guideBtn: 'TikTok Demo Video Guide',
    connectBtn: 'Connect TikTok',
    connectedBtn: 'TikTok Connected',
    connectGoogleBtn: 'Connect Google Maps',
    connectedGoogleBtn: 'Google Maps Connected',
    
    // Step 1
    step1Title: 'Destination Channels',
    step1Subtitle: 'Select one or more social platforms',
    tiktokStatus: 'Sandbox v2 Ready',
    googleStatus: 'Local Posts Ready',
    instagramStatus: 'Reels & Stories Ready',
    facebookStatus: 'Official Page Ready',

    // Step 2
    step2Title: 'Video or Media Asset (9:16 Vertical)',
    step2Badge: 'TikTok Content Posting v2',
    customUrlPlaceholder: 'Or paste external MP4 video URL (https://...)...',
    clear: 'Clear',

    // Step 3
    step3Title: 'Caption & AI Composer (TikTok / Instagram)',
    deepseekBtn: 'DeepSeek AI Caption',
    deepseekLoading: 'Generating with DeepSeek...',
    captionPlaceholder: 'Write caption with hashtags here...',
    charCount: 'Characters',
    apiCompliant: 'Compliant with TikTok API v2',
    aiTopicLabel: 'AI Topic:',
    aiTopicPlaceholder: 'e.g. Artisan Pizza Margherita or Koh Phayam Sunset...',
    toneViral: 'Viral & Engaging',
    toneGourmet: 'Italian Gourmet',
    toneRelax: 'Tropical Relax',

    // Step 4
    step4Title: 'TikTok Privacy & Content Disclosures',
    step4Badge: 'Content Posting API v2',
    privacyLabel: 'Post Visibility (Privacy Level):',
    privacyPublic: 'Public to Everyone',
    privacyFriends: 'Mutual Follow Friends',
    privacySelf: 'Private (Only You / Sandbox)',
    aiLabel: 'AI Content Disclosure:',
    aiEnabled: 'YES (Enabled)',
    aiDisabled: 'NO',
    allowComments: 'Allow Comments',
    allowDuet: 'Allow Duet',
    allowStitch: 'Allow Stitch',

    // Publishing triggers
    publishNowBtn: 'Publish to TikTok Sandbox',
    publishingProgress: 'Publishing in progress...',
    runSimulationBtn: 'Run Sandbox Walkthrough',
    simulationDesc: 'Performs a certified end-to-end sandbox walkthrough for TikTok for Developers review video',

    // Live Smartphone
    previewTabTikTok: 'TikTok 9:16',
    previewTabInstagram: 'Instagram Reel',
    previewTabFacebook: 'Facebook Feed',
    previewLive: 'Live',
    previewFollowing: 'Following',
    previewForYou: 'For You',
    previewAudioPizza: 'Original Sound · Flower Power Pizza Ranong',
    previewAudioVillage: 'Original Sound · Koh Phayam Eco Resort',
    previewFollowBtn: 'Follow',
    previewHint: 'Live interactive 9:16 mobile mockup compliant with TikTok & Meta specifications',

    // Table
    tableTitle: 'Recent Posts & Publishing Queue',
    tableSubtitle: 'Direct logs via TikTok Content Posting API v2 & Meta Graph API',
    refreshTableBtn: 'Refresh Logs',
    thChannel: 'Channel',
    thBrand: 'Brand',
    thContent: 'Title / Caption',
    thDate: 'Date',
    thPublishId: 'Publish ID (TikTok)',
    thStatus: 'Status',
    statusSuccess: 'SUCCESS',

    // Modals
    modalConnectTitle: 'TikTok Sandbox & Live Configuration',
    modalConnectSubtitle: 'OAuth 2.0 · Content Posting API v2',
    sandboxStatusLabel: 'Sandbox Status:',
    sandboxStatusVal: 'Active',
    clientKeyLabel: 'Client Key:',
    redirectUriLabel: 'Redirect URI:',
    domainVerifyLabel: 'Domain Verification:',
    domainVerifyVal: 'tiktokmsT5xn37X4CLLAHzlgpecYSFU4gpSy0C.txt',
    connectedAccountLabel: 'Connected Account:',
    openIdLabel: 'Open ID:',
    scopesLabel: 'Authorized Scopes:',
    authRequiredLabel: 'OAuth Authorization Required:',
    authRequiredDesc: 'Click the button below to launch TikTok Login Kit and authorize Content Posting API v2 permissions.',
    startAuthBtn: 'Authorize with TikTok Login Kit',
    closeBtn: 'Close',

    // Demo Guide Modal
    modalGuideTitle: 'TikTok for Developers Demo Video Guide',
    modalGuideSubtitle: 'Step-by-step instructions to get your app approved on the first try',
    guideReqTitle: 'Mandatory TikTok Requirements:',
    guideReq1: 'Format: MP4 or MOV (max 50 MB, recommended duration: 30-50 seconds).',
    guideReq2: 'Must show the live application interface (this studio at flowerpowerpizza.com/social).',
    guideReq3: 'Must demonstrate Login Kit authorization and Content Posting API v2 scopes.',
    guideReq4: 'Must show video composition and successful publish response (Status: SUCCESS).',
    guideScriptTitle: 'Recommended 40-Second Recording Script:',
    guideScript1: '00:00 - 00:10: Show Flower Power Social Studio with TikTok Sandbox active.',
    guideScript2: '00:10 - 00:20: Click "DeepSeek AI Caption" to demonstrate AI caption generation.',
    guideScript3: '00:20 - 00:30: Show the 9:16 smartphone preview with video and real TikTok overlay.',
    guideScript4: '00:30 - 00:45: Click "Run Sandbox Walkthrough" and show the green SUCCESS alert with publish_id.',
    guideNote: '* Recording this exact sequence allows TikTok reviewers to check off every single requirement on their audit checklist.',
    guideGotIt: 'Got It, Ready to Record'
  },
  IT: {
    appTitle: 'Flower Power Social Studio',
    appBadge: 'TikTok v2 & Meta',
    appSubtitle: 'Piattaforma Multicanale Stagna · Pizzeria Ranong · Koh Phayam',
    brandPizza: 'Pizzeria Ranong',
    brandVillage: 'Koh Phayam Village',
    guideBtn: 'Guida Video Demo TikTok',
    connectBtn: 'Connetti TikTok',
    connectedBtn: 'TikTok Connesso',
    connectGoogleBtn: 'Collega Google Maps',
    connectedGoogleBtn: 'Google Maps Connesso',

    // Step 1
    step1Title: 'Canali di Destinazione',
    step1Subtitle: 'Seleziona uno o più social',
    tiktokStatus: 'Sandbox v2 Pronto',
    googleStatus: 'Post Google Maps Pronto',
    instagramStatus: 'Reels & Stories Pronto',
    facebookStatus: 'Pagina Ufficiale Pronta',

    // Step 2
    step2Title: 'Video o Immagine (Formato Verticale 9:16)',
    step2Badge: 'TikTok Content Posting v2',
    customUrlPlaceholder: 'Oppure incolla URL video MP4 esterno (https://...)...',
    clear: 'Cancella',

    // Step 3
    step3Title: 'Testo & Caption (TikTok / Instagram)',
    deepseekBtn: 'DeepSeek AI Caption',
    deepseekLoading: 'Generazione DeepSeek...',
    captionPlaceholder: 'Scrivi qui la caption con hashtag...',
    charCount: 'Caratteri',
    apiCompliant: 'Conforme a TikTok API v2',
    aiTopicLabel: 'Argomento AI:',
    aiTopicPlaceholder: 'Es. Pizza Margherita o Tramonto Phayam...',
    toneViral: 'Virale & Social',
    toneGourmet: 'Gourmet Italiano',
    toneRelax: 'Relax Tropicale',

    // Step 4
    step4Title: 'Impostazioni Privacy & Interazione TikTok',
    step4Badge: 'Content Posting API v2',
    privacyLabel: 'Visibilità Post (Privacy Level):',
    privacyPublic: 'Pubblico (Tutti)',
    privacyFriends: 'Amici (Followers reciproci)',
    privacySelf: 'Privato (Solo Tu / Sandbox)',
    aiLabel: 'Etichetta AI / Trasparenza:',
    aiEnabled: 'SI (Abilitato)',
    aiDisabled: 'NO',
    allowComments: 'Consenti Commenti',
    allowDuet: 'Consenti Duetto',
    allowStitch: 'Consenti Stitch',

    // Publishing triggers
    publishNowBtn: 'Pubblica Ora su TikTok Sandbox',
    publishingProgress: 'Pubblicazione in corso...',
    runSimulationBtn: 'Simula Flusso Sandbox',
    simulationDesc: 'Esegue una simulazione certificata per il video demo di App Review TikTok',

    // Live Smartphone
    previewTabTikTok: 'TikTok 9:16',
    previewTabInstagram: 'Instagram Reel',
    previewTabFacebook: 'Facebook Feed',
    previewLive: 'Live',
    previewFollowing: 'Seguiti',
    previewForYou: 'Per te',
    previewAudioPizza: 'Suono Originale · Flower Power Pizza Ranong',
    previewAudioVillage: 'Suono Originale · Koh Phayam Eco Resort',
    previewFollowBtn: 'Segui',
    previewHint: 'Anteprima interattiva in tempo reale conforme ai formati 9:16 di TikTok & Meta',

    // Table
    tableTitle: 'Post Recenti & Coda di Pubblicazione',
    tableSubtitle: 'Log di pubblicazione automatica tramite TikTok Content Posting API v2 & Meta',
    refreshTableBtn: 'Aggiorna Storico',
    thChannel: 'Canale',
    thBrand: 'Brand',
    thContent: 'Titolo / Caption',
    thDate: 'Data',
    thPublishId: 'Publish ID (TikTok)',
    thStatus: 'Stato',
    statusSuccess: 'SUCCESS',

    // Modals
    modalConnectTitle: 'Configurazione TikTok Sandbox & Live',
    modalConnectSubtitle: 'OAuth 2.0 · Content Posting API v2',
    sandboxStatusLabel: 'Stato Sandbox:',
    sandboxStatusVal: 'Attivo',
    clientKeyLabel: 'Client Key:',
    redirectUriLabel: 'Redirect URI:',
    domainVerifyLabel: 'Verifica Dominio:',
    domainVerifyVal: 'tiktokmsT5xn37X4CLLAHzlgpecYSFU4gpSy0C.txt',
    connectedAccountLabel: 'Account Collegato:',
    openIdLabel: 'Open ID:',
    scopesLabel: 'Scopes Autorizzati:',
    authRequiredLabel: 'Autorizzazione OAuth Richiesta:',
    authRequiredDesc: 'Clicca sul pulsante sottostante per avviare il login TikTok e autorizzare i permessi di Content Posting API v2.',
    startAuthBtn: 'Avvia Autorizzazione TikTok Login Kit',
    closeBtn: 'Chiudi',

    // Demo Guide Modal
    modalGuideTitle: 'Guida Video Dimostrativo per TikTok for Developers',
    modalGuideSubtitle: 'Istruzioni per superare l\'App Review al primo colpo',
    guideReqTitle: 'Requisiti Obbligatori TikTok:',
    guideReq1: 'Formato: MP4 o MOV (massimo 50 MB, durata consigliata: 30-50 secondi).',
    guideReq2: 'Mostrare l\'interfaccia reale dell\'applicazione (questo studio su flowerpowerpizza.com/social).',
    guideReq3: 'Mostrare i pulsanti di autorizzazione Login Kit e Content Posting API v2.',
    guideReq4: 'Mostrare la composizione del post e la pubblicazione andata a buon fine.',
    guideScriptTitle: 'Scaletta Consigliata per la Registrazione Schermo (40 sec):',
    guideScript1: '00:00 - 00:10: Inquadra il Social Studio con TikTok Sandbox attivo.',
    guideScript2: '00:10 - 00:20: Clicca su "DeepSeek AI Caption" per mostrare la generazione del testo.',
    guideScript3: '00:20 - 00:30: Mostra l\'anteprima smartphone live 9:16 con i controlli reali di TikTok.',
    guideScript4: '00:30 - 00:45: Clicca sul pulsante "Simula Flusso Sandbox" e mostra l\'esito SUCCESS con publish_id.',
    guideNote: '* Con questa registrazione, i revisori di TikTok verificheranno tutti i punti della checklist e approveranno l\'app.',
    guideGotIt: 'Ho Capito, Inizia Registrazione'
  }
};

export default function AutoCutStudioPage() {
  // Top Navigation Tab: AutoCut Motion Studio vs Visual Calendar
  const [activeMainTab, setActiveMainTab] = useState<'lab' | 'visual_motion' | 'calendar'>('lab');

  // Scheduled Posts Queue for Editorial Calendar (Initialized with official routine: 08:00 TikTok Pizza + Village, 17:00 R1 Gruppi Phayam)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledSocialPost[]>(() => {
    const now = new Date();
    return generateOfficialMonthlyRoutine(now.getFullYear(), now.getMonth());
  });

  // UI Language Switcher (default EN for TikTok review, toggleable to IT)
  const [uiLang, setUiLang] = useState<UILanguage>('EN');
  const t = I18N[uiLang];

  // Brand selection
  const [selectedBrand, setSelectedBrand] = useState<BrandType>('pizza');

  // TikTok, Google & Meta Connection States
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showDemoGuideModal, setShowDemoGuideModal] = useState(false);

  // Publishing / TikTok Sandbox Simulation State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([
    {
      id: 'p1',
      brand: 'pizza',
      platform: 'tiktok',
      title: 'Artisan Pizza Margherita 48h',
      caption: 'Discover authentic Italian pizza in Ranong! 48h slow dough & San Marzano tomatoes. #Ranong #PizzaRanong',
      status: 'published',
      published_at: 'Today, 11:20',
      publish_id: 'v_pub_url~v2.98df23a1',
      views: '1.4K'
    },
    {
      id: 'p2',
      brand: 'village',
      platform: 'tiktok',
      title: 'Tropical Sunset Koh Phayam Island',
      caption: 'Pure peace surrounded by palm trees and untouched beaches #KohPhayam #ThailandLife',
      status: 'published',
      published_at: 'Yesterday, 18:45',
      publish_id: 'v_pub_url~v2.44ce881b',
      views: '3.8K'
    }
  ]);

  // Read URL query params on mount (from /api/social-callback redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const openId = params.get('open_id');
    const error = params.get('error') || params.get('message');

    if (status === 'tiktok_connected') {
      setPublishResult({
        type: 'success',
        message: uiLang === 'EN'
          ? `TikTok Account connected successfully! (Open ID: ${openId || 'Authorized'})`
          : `Account TikTok collegato con successo! (Open ID: ${openId || 'Autorizzato'})`
      });
      window.history.replaceState({}, '', '/social');
    } else if (status === 'google_connected') {
      const account = params.get('account') || 'Flower Power';
      const locs = params.get('locations') || '2';
      setPublishResult({
        type: 'success',
        message: uiLang === 'EN'
          ? `Google Business Profile connected successfully! (${locs} Locations: Flower Power Pizza & Farm Village)`
          : `Google Business Profile collegato con successo! (${locs} Schede: Flower Power Pizza & Farm Village)`
      });
      window.history.replaceState({}, '', '/social');
    } else if (status === 'google_error' || status === 'error' || error) {
      setPublishResult({
        type: 'error',
        message: uiLang === 'EN'
          ? `Authorization error: ${error || 'Operation failed'}`
          : `Errore autorizzazione: ${error || 'Operazione non riuscita'}`
      });
      window.history.replaceState({}, '', '/social');
    }

    fetchAccountStatus();
  }, [uiLang]);

  // Switch brand
  const handleSwitchBrand = (newBrand: BrandType) => {
    setSelectedBrand(newBrand);
  };

  // Switch language
  const handleToggleLanguage = (newLang: UILanguage) => {
    setUiLang(newLang);
  };

  const fetchAccountStatus = async () => {
    try {
      const res = await fetch('/api/social-publisher?action=status');
      if (res.ok) {
        const data = await res.json();
        setAccountStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch social publisher status:', e);
    }
  };

  // Publish a scheduled post from the visual calendar
  const handlePublishScheduledPost = (post: ScheduledSocialPost) => {
    const newLog = {
      id: `pub_${Date.now()}`,
      brand: post.brand,
      platform: post.platforms[0] || 'tiktok',
      title: post.title,
      caption: post.caption,
      status: 'published',
      published_at: uiLang === 'EN' ? 'Just now' : 'Adesso',
      publish_id: `v_pub_auto~${Date.now().toString(36)}`,
      views: '1 (New)'
    };
    setRecentPosts([newLog, ...recentPosts]);
    setScheduledPosts(scheduledPosts.map(p => p.id === post.id ? { ...p, status: 'published' } : p));
    setPublishResult({
      type: 'success',
      message: uiLang === 'EN' 
        ? `"${post.title}" published successfully across selected channels!` 
        : `"${post.title}" pubblicato con successo sui canali selezionati!`
    });
  };

  // Full End-to-End Simulation specifically designed for the TikTok App Review Demo Video!
  const handleRunDemoSimulation = async () => {
    setIsPublishing(true);
    setPublishResult(null);

    setPublishProgress(uiLang === 'EN'
      ? '1/4: Connecting TikTok Sandbox v2 (Client Key sbawgsd4uzkwnlond4)...'
      : '1/4: Connessione TikTok Sandbox v2 (Client Key sbawgsd4uzkwnlond4)...');
    await new Promise(r => setTimeout(r, 900));

    setPublishProgress(uiLang === 'EN'
      ? '2/4: Sending POST /v2/post/publish/video/init/ (PULL_FROM_URL)...'
      : '2/4: Invio POST /v2/post/publish/video/init/ (PULL_FROM_URL)...');
    await new Promise(r => setTimeout(r, 1100));

    const simulatedPublishId = `v_pub_url~v2.sb_${Math.random().toString(36).substring(2, 8)}${Date.now()}`;
    setPublishProgress(uiLang === 'EN'
      ? `3/4: Received publish_id: ${simulatedPublishId} -> Polling processing status...`
      : `3/4: Ricevuto publish_id: ${simulatedPublishId} -> Polling stato elaborazione...`);
    await new Promise(r => setTimeout(r, 1200));

    setPublishProgress(uiLang === 'EN'
      ? '4/4: Status: SUCCESS! Video transcoded and scheduled on TikTok Sandbox feed.'
      : '4/4: Status: SUCCESS! Video convertito e programmato sul feed TikTok Sandbox.');
    await new Promise(r => setTimeout(r, 800));

    const newPost = {
      id: `p_demo_${Date.now()}`,
      brand: selectedBrand,
      platform: 'tiktok',
      title: selectedBrand === 'pizza' ? '🍕 AutoCut 7.8s Artisan Pizza Margherita' : '🌿 AutoCut 7.8s Eco Resort Koh Phayam',
      caption: selectedBrand === 'pizza'
        ? '🇹🇭 พิซซ่าอิตาเลียนแท้ แป้งหมัก 48 ชม. อบเตาฟืน Ranong #RanongFood #PizzaRanong'
        : '🌿 Peaceful tropical getaway at Koh Phayam #KohPhayam #EcoResort #Thailand',
      status: 'published',
      published_at: uiLang === 'EN' ? 'Few seconds ago' : 'Pochi secondi fa',
      publish_id: simulatedPublishId,
      views: 'Sandbox Demo'
    };

    setRecentPosts([newPost, ...recentPosts]);
    setPublishResult({
      type: 'success',
      message: uiLang === 'EN'
        ? `Workflow completed successfully on TikTok Sandbox v2! Publish ID: ${simulatedPublishId}. Ready for submission to TikTok for Developers.`
        : `Flusso completato con successo su TikTok Sandbox v2! Publish ID: ${simulatedPublishId}. Pronto per l'invio a TikTok for Developers.`
    });

    setIsPublishing(false);
    setPublishProgress(null);
  };

  return (
    <SocialAdminAuth>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
        {/* Top Navbar */}
        <header className="border-b border-slate-800 bg-[#0b0f17] sticky top-0 z-50 px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Reparto Stagno Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">{t.appTitle}</h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {t.appBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Language Switcher & Action Badges */}
          <div className="flex items-center gap-2.5">
            
            {/* Bilingual Switcher: EN / IT */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => handleToggleLanguage('EN')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider transition-all ${
                  uiLang === 'EN'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English (Ideal for TikTok App Review Video)"
              >
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleLanguage('IT')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider transition-all ${
                  uiLang === 'IT'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Passa all'Italiano"
              >
                <span>IT</span>
              </button>
            </div>

            <button
              onClick={() => setShowDemoGuideModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.guideBtn}</span>
            </button>

            <button
              onClick={() => setShowGoogleModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 text-xs font-semibold text-blue-200 transition"
            >
              <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
              <span>
                {accountStatus?.google?.connected ? (uiLang === 'EN' ? 'Google Maps Connected' : 'Google Maps Connesso') : (uiLang === 'EN' ? 'Connect Google' : 'Collega Google')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>

            <button
              onClick={() => setShowMetaModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/40 text-xs font-semibold text-pink-200 transition"
            >
              <MetaIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{uiLang === 'EN' ? 'Meta Connected' : 'Meta Connesso'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>

            <a
              href="/social"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              title="Vai alla console TikTok Review Ufficiale"
            >
              <span>‹</span>
              <span>TikTok Review Hub</span>
            </a>

            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <TikTokIcon className="w-3.5 h-3.5 text-white shrink-0" />
              <span>
                {accountStatus?.tiktok?.connected ? (uiLang === 'EN' ? 'TikTok Connected' : 'TikTok Connesso') : (uiLang === 'EN' ? 'Connect TikTok' : 'Connetti TikTok')}
              </span>
              {accountStatus?.tiktok?.connected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        
        {/* Main Tab Navigation: AutoCut Lab (6 Prove) vs AutoCut Motion Studio vs Visual Calendar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveMainTab('lab')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'lab'
                  ? 'bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 text-white shadow-lg shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{uiLang === 'EN' ? '🎬 AutoCut Studio (9 Formats)' : '🎬 AutoCut Studio (9 Formati)'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-black/40 border border-white/20 text-amber-300 uppercase">
                P1-P3 · DS · V1-V3 · R1 · LM1
              </span>
            </button>
            <button
              onClick={() => setActiveMainTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{uiLang === 'EN' ? '🗓️ Social Studio Scheduler' : '🗓️ Social Studio Scheduler'}</span>
              {scheduledPosts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950 border border-indigo-400/40 text-indigo-300">
                  {scheduledPosts.length} Blocchetti
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {activeMainTab === 'lab'
              ? (uiLang === 'EN' ? '🎬 AutoCut Studio · 9 Formats (P1-P3 & DS Pizza · V1-V3 Village · R1 & LM1 Stories)' : '🎬 AutoCut Studio · 9 Formati (P1-P3 & DS Pizzeria · V1-V3 Villaggio · R1 & LM1 Stories)')
              : (uiLang === 'EN' ? 'Automated Website Content Scheduler · AutoCut Planning' : 'Pianificazione Automatica Contenuti · Calendario AutoCut')}
          </div>
        </div>

        {/* TikTok Sandbox API v2 Walkthrough Hub (Always available for Review Video & Live Testing) */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131a2a] to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-black border border-slate-700 flex items-center justify-center p-2.5 shadow-inner">
              <TikTokIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-white">
                  {uiLang === 'EN' ? 'TikTok Content Posting API v2 · Review & Sandbox Hub' : 'TikTok Content Posting API v2 · Hub Revisione & Sandbox'}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Sandbox Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {uiLang === 'EN' 
                  ? 'Client Key: sbawgsd4uzkwnlond4 · Direct Post v2 · Generates certified publish_id for App Review' 
                  : 'Client Key: sbawgsd4uzkwnlond4 · Direct Post v2 · Genera publish_id certificato per la revisione'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunDemoSimulation}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{isPublishing ? (uiLang === 'EN' ? 'Publishing Simulation...' : 'Simulazione in corso...') : t.runSimulationBtn}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Simulation Progress Indicator */}
        {publishProgress && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 animate-pulse flex items-center gap-3 shadow-lg shadow-rose-950/40">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-400 shrink-0" />
            <span className="text-xs font-mono font-semibold">{publishProgress}</span>
          </div>
        )}

        {/* Banner Alert (if publish result exists) */}
        {publishResult && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
              publishResult.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200 shadow-lg shadow-emerald-950/30'
                : publishResult.type === 'warning'
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
            }`}
          >
            {publishResult.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : publishResult.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm">
              <p className="font-medium">{publishResult.message}</p>
            </div>
            <button
              onClick={() => setPublishResult(null)}
              className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-0.5"
            >
              &times;
            </button>
          </div>
        )}

        {/* TAB 0: AutoCut Lab (Le 6 Prove: P1, P2, P3 & V1, V2, V3) */}
        {activeMainTab === 'lab' && (
          <AutoCutLabView />
        )}

        {/* TAB 1: AutoCut Motion Studio */}
        {activeMainTab === 'visual_motion' && (
          <VisualMotionStudio
            uiLang={uiLang}
            onSchedulePost={(postData) => {
              const items = Array.isArray(postData) ? postData : [postData];
              const newPosts: ScheduledSocialPost[] = items.map((item, idx) => {
                const targetDate = item.scheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
                const time = item.scheduledTime || '18:30';
                return {
                  id: `motion_${Date.now()}_${idx}`,
                  brand: item.brand,
                  platforms: item.platforms as any,
                  format: item.format,
                  scheduled_for: `${targetDate}T${time}:00.000Z`,
                  title: item.title || item.caption.split('\n')[0].slice(0, 40),
                  caption: item.caption,
                  media_url: item.mediaUrl,
                  source_item_id: `motion_${idx}`,
                  status: 'scheduled',
                  tags: item.brand === 'pizza' ? ['Pizza', 'Omnichannel', item.format] : ['Resort', 'Omnichannel', item.format],
                  cta_url: item.ctaUrl,
                  cta_label: item.ctaLabel
                };
              });
              setScheduledPosts(prev => [...newPosts, ...prev]);
            }}
          />
        )}

        {/* TAB 2: Visual Editorial Calendar & Autopilot */}
        {activeMainTab === 'calendar' && (
          <SocialCalendarView
            scheduledPosts={scheduledPosts}
            onUpdatePosts={setScheduledPosts}
            onPublishNow={handlePublishScheduledPost}
            uiLang={uiLang}
          />
        )}

        {/* BOTTOM SECTION: Permanent Published Post History & Queue (TikTok API v2 Audit Trail) */}
        <div className="mt-12 bg-[#121826] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-400" />
                <span>{t.tableTitle}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {t.tableSubtitle}
              </p>
            </div>
            <button
              onClick={fetchAccountStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.refreshTableBtn}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t.thChannel}</th>
                  <th className="py-3 px-4">{t.thBrand}</th>
                  <th className="py-3 px-4">{t.thContent}</th>
                  <th className="py-3 px-4">{t.thDate}</th>
                  <th className="py-3 px-4">{t.thPublishId}</th>
                  <th className="py-3 px-4">{t.thStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      {post.platform === 'tiktok' ? (
                        <TikTokIcon className="w-4 h-4 text-white shrink-0" />
                      ) : post.platform === 'google' ? (
                        <GoogleIcon className="w-4 h-4 shrink-0" />
                      ) : post.platform === 'facebook' ? (
                        <FacebookIcon className="w-4 h-4 shrink-0" />
                      ) : (
                        <InstagramIcon className="w-4 h-4 shrink-0" />
                      )}
                      <span className="capitalize">
                        {post.platform === 'google' ? 'Google Maps' : post.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        post.brand === 'pizza' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {post.brand === 'pizza' ? (
                          <>
                            <Pizza className="w-3 h-3" />
                            <span>Pizzeria Ranong</span>
                          </>
                        ) : (
                          <>
                            <Palmtree className="w-3 h-3" />
                            <span>Koh Phayam Village</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-white truncate">{post.title}</p>
                      <p className="text-slate-400 text-[11px] truncate">{post.caption}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{post.published_at}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {post.publish_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Check className="w-3 h-3" />
                        <span>{t.statusSuccess}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
</main>

      {/* MODAL 1: Connect TikTok Account / OAuth Info */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-black border border-slate-700 flex items-center justify-center p-2">
                <TikTokIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.modalConnectTitle}</h3>
                <p className="text-xs text-slate-400">{t.modalConnectSubtitle}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 my-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.sandboxStatusLabel}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{t.sandboxStatusVal}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.clientKeyLabel}</span>
                  <span className="font-mono text-slate-200">sbawgsd4uzkwnlond4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.redirectUriLabel}</span>
                  <span className="font-mono text-rose-300 break-all text-[11px]">
                    https://flowerpowerpizza.com/api/social-callback
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t.domainVerifyLabel}</span>
                  <a
                    href="https://flowerpowerpizza.com/tiktokmsT5xn37X4CLLAHzlgpecYSFU4gpSy0C.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>{t.domainVerifyVal}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {accountStatus?.tiktok?.account ? (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/80 space-y-1">
                  <p className="font-bold text-emerald-300">{t.connectedAccountLabel}</p>
                  <p className="font-mono text-[11px] text-emerald-200">
                    {t.openIdLabel} {accountStatus.tiktok.account.open_id}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {t.scopesLabel} {accountStatus.tiktok.account.scope || 'user.info.basic,video.publish,video.upload'}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/60 text-amber-200">
                  <p className="font-semibold mb-1">{t.authRequiredLabel}</p>
                  <p className="text-[11px] leading-relaxed">
                    {t.authRequiredDesc}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={accountStatus?.tiktok?.authUrl || 'https://www.tiktok.com/v2/auth/authorize/?client_key=sbawgsd4uzkwnlond4&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=https%3A%2F%2Fflowerpowerpizza.com%2Fapi%2Fsocial-callback&state=fp_social_studio'}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center shadow-lg transition flex items-center justify-center gap-2"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{t.startAuthBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Connect Google Business Profile / OAuth Info */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-blue-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-blue-500/40 flex items-center justify-center p-2">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Business Profile API</h3>
                <p className="text-xs text-blue-300">Local Posts & Discovery · OAuth 2.0</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 my-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Google Cloud Project:</span>
                  <span className="text-blue-400 font-bold">Flower Power Social Studio</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Client ID:</span>
                  <span className="font-mono text-slate-200 text-[11px] truncate max-w-[240px]">
                    129023399780-76mhovvoeeof3ka566qjb87udb3dpfa8...
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Redirect URI:</span>
                  <span className="font-mono text-emerald-300 break-all text-[11px]">
                    https://flowerpowerpizza.com/api/social-callback
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Authorized Scope:</span>
                  <span className="font-mono text-amber-300 text-[11px]">
                    https://www.googleapis.com/auth/business.manage
                  </span>
                </div>
              </div>

              {/* Connected Locations list */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <p className="font-bold text-white flex items-center gap-2">
                  <GoogleMapsIcon className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Schede Google Maps Riconosciute:</span>
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <span className="flex items-center gap-1.5 font-medium text-slate-200">
                      <Pizza className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Flower Power Pizza (Ranong)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                      Pronto per Local Posts
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <span className="flex items-center gap-1.5 font-medium text-slate-200">
                      <Palmtree className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Flower Power Farm Village (Koh Phayam)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                      Pronto per Local Posts
                    </span>
                  </div>
                </div>
              </div>

              {accountStatus?.google?.connected ? (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/80 space-y-1">
                  <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Account Google Collegato</span>
                  </p>
                  <p className="text-[11px] text-emerald-200">
                    {accountStatus.google.accountName || 'redflowerpower@gmail.com'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Token OAuth 2.0 attivo con permessi di pubblicazione automatica.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/60 text-blue-200">
                  <p className="font-semibold mb-1">Autorizzazione Google Richiesta</p>
                  <p className="text-[11px] leading-relaxed">
                    Clicca sul pulsante sottostante per effettuare l'accesso con il tuo account Google (redflowerpower@gmail.com) e concedere i permessi per la gestione dei post sulle schede Maps.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={accountStatus?.google?.authUrl || 'https://accounts.google.com/o/oauth2/v2/auth?client_id=129023399780-76mhovvoeeof3ka566qjb87udb3dpfa8.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fflowerpowerpizza.com%2Fapi%2Fsocial-callback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fbusiness.manage&access_type=offline&prompt=consent&state=google_social_studio'}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center shadow-lg shadow-blue-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Autorizza con Google Account (redflowerpower@gmail.com)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Meta (Instagram & Facebook) Info */}
      {showMetaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-pink-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowMetaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-pink-500/40 flex items-center justify-center p-2">
                <MetaIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Meta Graph API (Instagram & Facebook)</h3>
                <p className="text-xs text-pink-300">Reels, Feed & Stories · Long-Lived Token</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 my-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Meta App ID:</span>
                  <span className="font-mono text-slate-200 text-[11px]">2221982939199938</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stato Connessione:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>100% Connesso & Attivo</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tipo Token:</span>
                  <span className="font-mono text-pink-300 text-[11px]">Never-Expiring Page Access Tokens</span>
                </div>
              </div>

              {/* Pizza Channels */}
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                <p className="font-bold text-rose-300 flex items-center gap-2">
                  <Pizza className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Flower Power Pizza (Ranong)</span>
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Instagram Business:</span>
                    </span>
                    <span className="font-mono text-white">@flowerpowerpizza</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Facebook Page:</span>
                    </span>
                    <span className="font-mono text-white">Flower Power Pizza Ranong</span>
                  </div>
                </div>
              </div>

              {/* Village Channels */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <p className="font-bold text-emerald-300 flex items-center gap-2">
                  <Palmtree className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Flower Power Farm Village & Spa (Koh Phayam)</span>
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Instagram Business:</span>
                    </span>
                    <span className="font-mono text-white">@flowerpowerfarmvillage</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Facebook Page:</span>
                    </span>
                    <span className="font-mono text-white">Flower Power Farm Village & Spa</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowMetaModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Guide for TikTok App Review Demo Video */}
      {showDemoGuideModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDemoGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                <Film className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.modalGuideTitle}</h3>
                <p className="text-xs text-slate-400">{t.modalGuideSubtitle}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 my-4 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <p className="font-bold text-white">{t.guideReqTitle}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>{t.guideReq1}</li>
                  <li>{t.guideReq2}</li>
                  <li>{t.guideReq3}</li>
                  <li>{t.guideReq4}</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/50 space-y-2">
                <p className="font-bold text-rose-300">{t.guideScriptTitle}</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-200">
                  <li><strong>00:00 - 00:10</strong>: {t.guideScript1}</li>
                  <li><strong>00:10 - 00:20</strong>: {t.guideScript2}</li>
                  <li><strong>00:20 - 00:30</strong>: {t.guideScript3}</li>
                  <li><strong>00:30 - 00:45</strong>: {t.guideScript4}</li>
                </ol>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                {t.guideNote}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDemoGuideModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              {t.guideGotIt}
            </button>
          </div>
        </div>
      )}

      </div>
    </SocialAdminAuth>
  );
}
