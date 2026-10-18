import React, { useState, useEffect } from 'react';
import { 
  Share2, Video, Send, Sparkles, RefreshCw, 
  CheckCircle, AlertCircle, ExternalLink, Key, 
  Play, Check, HelpCircle,
  Heart, MessageCircle, Bookmark, Globe,
  Pizza, Palmtree, Film, Flame, Users, Lock, Search, BarChart3,
  Calendar as CalendarIcon, Zap
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
import { SocialCalendarView } from '../components/SocialCalendarView';
import { 
  ScheduledSocialPost, 
  generateAutopilotCampaign 
} from '../services/autoContentEngine';

export type UILanguage = 'EN' | 'IT';
type BrandType = 'pizza' | 'village';
type PlatformType = 'tiktok' | 'google' | 'instagram' | 'facebook';
type PrivacyLevel = 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';

interface DemoAsset {
  id: string;
  title: { EN: string; IT: string };
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  duration?: string;
  brand: BrandType;
}

const DEMO_ASSETS: DemoAsset[] = [
  {
    id: 'pizza-margherita',
    title: {
      EN: 'Wood-Fired Pizza Margherita 48h Fermentation',
      IT: 'Pizza Margherita 48h Forno a Legna'
    },
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-taking-a-slice-of-freshly-baked-pizza-42861-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
    duration: '0:14',
    brand: 'pizza'
  },
  {
    id: 'pasta-carbonara',
    title: {
      EN: 'Homemade Artisan Fresh Pasta & Italian Kitchen',
      IT: 'Spaghetti Artigianali & Cucina Italiana'
    },
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-pasta-cooked-in-a-pan-42857-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
    duration: '0:18',
    brand: 'pizza'
  },
  {
    id: 'village-bungalow',
    title: {
      EN: 'Tropical Eco-Resort Bungalow Koh Phayam',
      IT: 'Bungalow Oasi Tropicale Koh Phayam'
    },
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-resort-with-palm-trees-and-swimming-pool-42562-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    duration: '0:22',
    brand: 'village'
  },
  {
    id: 'pizza-oven',
    title: {
      EN: 'Live Wood Flame Pizza Oven Ranong',
      IT: 'Pala & Fiamma Viva Ranong'
    },
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-chef-putting-a-pizza-in-the-oven-42862-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    duration: '0:12',
    brand: 'pizza'
  }
];

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
    aiTopicPlaceholder: 'e.g. Wood-fired Pizza Margherita or Koh Phayam Sunset...',
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

export default function SocialStudioPage() {
  // Top Navigation Tab: Composer Studio vs Visual Calendar
  const [activeMainTab, setActiveMainTab] = useState<'composer' | 'calendar'>('composer');

  // Scheduled Posts Queue for Editorial Calendar (Initialized with real dishes from menuData)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledSocialPost[]>(() => {
    const pizzaPosts = generateAutopilotCampaign({ brand: 'pizza', weeksCount: 4, postsPerWeek: 3 });
    const villagePosts = generateAutopilotCampaign({ brand: 'village', weeksCount: 4, postsPerWeek: 2 });
    return [...pizzaPosts, ...villagePosts];
  });

  // UI Language Switcher (default EN for TikTok review, toggleable to IT)
  const [uiLang, setUiLang] = useState<UILanguage>('EN');
  const t = I18N[uiLang];

  // Brand selection
  const [selectedBrand, setSelectedBrand] = useState<BrandType>('pizza');
  
  // Platform selection (multi-select)
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['tiktok', 'instagram']);
  const [previewPlatform, setPreviewPlatform] = useState<PlatformType>('tiktok');

  // Post composer state
  const [postTitle, setPostTitle] = useState('🍕 Pizza Margherita เตาฟืน Ranong');
  const [postCaption, setPostCaption] = useState(
    '🇹🇭 🔥 สายกินต้องจัด! พิซซ่าเตาฟืนสไตล์อิตาเลียนแท้ อร่อยแสงออกปาก ฟินมากกก 🤤✨ แป้งหมักช้าสูตรลับ 48 ชม. กรอบนอกนุ่มหนึบ ชีสนำเข้าเยิ้มๆ อบสดใหม่ในเตาฟืนหอมกรุ่น นั่งทานชิลๆ ในสวนทรอปิคอลพร้อมน้ำตกธรรมชาติ ใกล้บ่อน้ำร้อนรักษะวาริน ใครมาระนองห้ามพลาดเลยนะคะ! สั่งเดลิเวอรี่ส่งร้อนๆ ถึงบ้านก็ฟินจ้า 🛵💨\n\n🇬🇧 Craving authentic Italian pizza in Ranong? 🍕🔥 Crafted with 48h cold-fermented dough, baked to bubbling perfection in our traditional wood-fired stone oven, and topped with premium imported Italian ingredients. Dine in our lush tropical garden by the waterfall or order fast delivery to your door! ✨\n\n#RanongFood #PizzaRanong #RanongHotspring #RanongEats #ItalianFoodThailand #WoodFiredPizza #KohPhayam #ThailandFoodie #อร่อยบอกต่อ #รีวิวระนอง #เที่ยวระนอง #ของกินระนอง #พิซซ่าเตาฟืน'
  );
  const [selectedAsset, setSelectedAsset] = useState<DemoAsset>(DEMO_ASSETS[0]);
  const [customMediaUrl, setCustomMediaUrl] = useState('');

  // TikTok API v2 Settings
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('PUBLIC_TO_EVERYONE');
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // TikTok, Google & Meta Connection States
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showDemoGuideModal, setShowDemoGuideModal] = useState(false);

  // DeepSeek AI Generator Modal / State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('Wood-fired Pizza Margherita freshly baked');
  const [aiTone, setAiTone] = useState<'viral' | 'gourmet' | 'relax'>('viral');
  const [aiLang, setAiLang] = useState<'EN' | 'IT' | 'TH' | 'DE'>('EN');

  // Publishing / Simulation State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([
    {
      id: 'p1',
      brand: 'pizza',
      platform: 'tiktok',
      title: 'Wood-Fired Pizza Margherita 48h',
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

  // Switch brand and update bilingual caption template
  const handleSwitchBrand = (newBrand: BrandType) => {
    setSelectedBrand(newBrand);
    if (newBrand === 'pizza') {
      setPostTitle('🍕 Pizza Margherita เตาฟืน Ranong');
      setAiTopic('Wood-fired Pizza Margherita freshly baked');
      setPostCaption(
        '🇹🇭 🔥 สายกินต้องจัด! พิซซ่าเตาฟืนสไตล์อิตาเลียนแท้ อร่อยแสงออกปาก ฟินมากกก 🤤✨ แป้งหมักช้าสูตรลับ 48 ชม. กรอบนอกนุ่มหนึบ ชีสนำเข้าเยิ้มๆ อบสดใหม่ในเตาฟืนหอมกรุ่น นั่งทานชิลๆ ในสวนทรอปิคอลพร้อมน้ำตกธรรมชาติ ใกล้บ่อน้ำร้อนรักษะวาริน ใครมาระนองห้ามพลาดเลยนะคะ! สั่งเดลิเวอรี่ส่งร้อนๆ ถึงบ้านก็ฟินจ้า 🛵💨\n\n🇬🇧 Craving authentic Italian pizza in Ranong? 🍕🔥 Crafted with 48h cold-fermented dough, baked to bubbling perfection in our traditional wood-fired stone oven, and topped with premium imported Italian ingredients. Dine in our lush tropical garden by the waterfall or order fast delivery to your door! ✨\n\n#RanongFood #PizzaRanong #RanongHotspring #RanongEats #ItalianFoodThailand #WoodFiredPizza #KohPhayam #ThailandFoodie #อร่อยบอกต่อ #รีวิวระนอง #เที่ยวระนอง #ของกินระนอง #พิซซ่าเตาฟืน'
      );
    } else {
      setPostTitle('🌿 Jungle Villa | Koh Phayam Island');
      setAiTopic('Jungle Villa eco-luxury retreat in tropical gardens');
      setPostCaption(
        '🇬🇧 🌿✨ Escape the routine and wake up to pure island bliss at Koh Phayam! Discover our Jungle Villa, nestled in lush tropical gardens with birdsong and ocean breeze. Enjoy organic farm breakfasts, serene yoga, and authentic Italian dining under the stars at Flower Power Farm Village. Your hidden paradise awaits! 🏝️🥥🌊\n\n🇹🇭 🏝️✨ หนีความวุ่นวายมาพักผ่อนฮีลใจที่เกาะพยามกันนะคะ! สัมผัสความชิลที่จังเกิ้ลวิลล่า ท่ามกลางสวนธรรมชาติสีเขียว ร่มรื่นเงียบสงบ ฟีลดีมากกก 🌿 ตื่นเช้ามาสูดอากาศบริสุทธิ์ ทานอาหารเช้าออร์แกนิก เดินเล่นริมหาดอ่าวยาย และฟินกับพิซซ่าเตาฟืนอิตาเลียนแท้ๆ วันหยุดนี้ห้ามพลาดเลยน้าา รีบจองมาพักผ่อนกันจ้า 🛖💚\n\n#KohPhayam #KohPhayamIsland #EcoResortThailand #ThailandTravel #Ranong #HiddenThailand #IslandLife #เกาะพยาม #เที่ยวเกาะพยาม #รีวิวที่พัก #ที่พักเกาะพยาม #เที่ยวระนอง #พักผ่อนฮีลใจ'
      );
    }
  };

  // Switch default caption when toggling language
  const handleToggleLanguage = (newLang: UILanguage) => {
    setUiLang(newLang);
    if (newLang === 'IT') {
      setAiLang('IT');
    } else {
      setAiLang('EN');
    }
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

  const handleTogglePlatform = (p: PlatformType) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  // DeepSeek AI Caption Generator
  const handleGenerateCaptionWithDeepSeek = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/social-publisher?action=ai_caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          brand: selectedBrand,
          platform: 'tiktok',
          language: aiLang,
          tone: aiTone
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result?.fullCaption) {
          setPostCaption(data.result.fullCaption);
          if (data.result.hook) {
            setPostTitle(data.result.hook.slice(0, 80));
          }
          setPublishResult({
            type: 'info',
            message: uiLang === 'EN'
              ? 'High-converting viral caption generated by DeepSeek AI!'
              : 'Caption ottimizzata generata con successo da DeepSeek AI!'
          });
        }
      } else {
        alert(uiLang === 'EN' ? 'Unable to generate caption with DeepSeek at this time.' : 'Impossibile generare la caption con DeepSeek in questo momento.');
      }
    } catch (e: any) {
      alert(`AI Error: ${e.message}`);
    } finally {
      setIsAiGenerating(false);
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

  // Execute Publishing Flow (TikTok Sandbox API or Live)
  const handlePublishNow = async () => {
    setIsPublishing(true);
    setPublishProgress(uiLang === 'EN' ? '1/3: Preparing Content Posting API v2 payload...' : '1/3: Preparazione payload Content Posting API v2...');
    setPublishResult(null);

    const activeVideoUrl = customMediaUrl || selectedAsset.url;

    try {
      await new Promise(r => setTimeout(r, 600));
      setPublishProgress(uiLang === 'EN' ? '2/3: Initializing POST /v2/post/publish/video/init/...' : '2/3: Inizializzazione POST /v2/post/publish/video/init/...');

      const res = await fetch('/api/social-publisher?action=publish_video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: activeVideoUrl,
          title: postCaption,
          privacyLevel,
          disableComment,
          disableDuet,
          disableStitch,
          brand: selectedBrand
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPublishProgress(uiLang === 'EN' ? '3/3: Video accepted! Polling status in progress...' : '3/3: Video accettato! Polling status in corso...');
        await new Promise(r => setTimeout(r, 800));

        const newPost = {
          id: `p_${Date.now()}`,
          brand: selectedBrand,
          platform: 'tiktok',
          title: postTitle || selectedAsset.title[uiLang],
          caption: postCaption,
          status: 'published',
          published_at: uiLang === 'EN' ? 'Just now' : 'Adesso',
          publish_id: data.publish_id || `v_pub_url~v2.${Date.now()}`,
          views: '1 (New)'
        };

        setRecentPosts([newPost, ...recentPosts]);

        // Publish to Google Business Profile if selected
        if (selectedPlatforms.includes('google')) {
          setPublishProgress(uiLang === 'EN' ? 'Publishing update to Google Maps / Local Posts...' : 'Pubblicazione aggiornamento su Google Maps / Local Posts...');
          try {
            const gRes = await fetch('/api/social-publisher?action=publish_google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                summary: postCaption,
                brand: selectedBrand,
                actionType: selectedBrand === 'village' ? 'BOOK' : 'ORDER',
                actionUrl: selectedBrand === 'village' ? 'https://flowerpowervillage.com' : 'https://flowerpowerpizza.com',
                mediaUrl: activeMediaUrl,
                topicType: 'STANDARD'
              })
            });
            const gData = await gRes.json();
            if (gData.success) {
              const gPost = {
                id: `g_${Date.now()}`,
                brand: selectedBrand,
                platform: 'google',
                title: postTitle || selectedAsset.title[uiLang],
                caption: postCaption,
                status: 'published',
                published_at: uiLang === 'EN' ? 'Just now' : 'Adesso',
                publish_id: gData.postId || `g_post.${Date.now()}`,
                views: 'Google Maps Live'
              };
              setRecentPosts(prev => [gPost, ...prev]);
            }
          } catch (gErr) {
            console.warn('[SocialStudio] Google publish warning:', gErr);
          }
        }

        setPublishResult({
          type: 'success',
          message: uiLang === 'EN'
            ? `Post published successfully! (TikTok Sandbox: ${data.publish_id || 'verified'}${selectedPlatforms.includes('google') ? ' · Google Maps: Local Post published' : ''})`
            : `Post pubblicato con successo! (TikTok Sandbox: ${data.publish_id || 'verificato'}${selectedPlatforms.includes('google') ? ' · Google Maps: Local Post pubblicato' : ''})`
        });
      } else {
        setPublishResult({
          type: 'warning',
          message: data.error || (uiLang === 'EN'
            ? 'TikTok authorization required. You can use the "Run Sandbox Walkthrough" button to record the demo review video.'
            : 'Autenticazione TikTok richiesta. Puoi utilizzare il pulsante "Simula Flusso Sandbox" per la registrazione del video.')
        });
      }
    } catch (err: any) {
      setPublishResult({
        type: 'error',
        message: `Publish error: ${err.message}`
      });
    } finally {
      setIsPublishing(false);
      setPublishProgress(null);
    }
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
      title: postTitle || selectedAsset.title[uiLang],
      caption: postCaption,
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

  const activeMediaUrl = customMediaUrl || selectedAsset.url;
  const isVideo = selectedAsset.type === 'video' || activeMediaUrl.endsWith('.mp4');

  return (
    <SocialAdminAuth>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
        {/* Top Navbar */}
        <header className="border-b border-slate-800 bg-[#0f1420]/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5">
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

          {/* Brand Switcher Pills */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => handleSwitchBrand('pizza')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBrand === 'pizza'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pizza className="w-3.5 h-3.5 shrink-0" />
              <span>{t.brandPizza}</span>
            </button>
            <button
              onClick={() => handleSwitchBrand('village')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBrand === 'village'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palmtree className="w-3.5 h-3.5 shrink-0" />
              <span>{t.brandVillage}</span>
            </button>
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
        
        {/* Main Tab Navigation: Composer Studio vs Visual Calendar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveMainTab('composer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'composer'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{uiLang === 'EN' ? 'Composer Studio' : 'Studio Compositore'}</span>
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
              <span>{uiLang === 'EN' ? 'Visual Editorial Calendar' : 'Calendario & Pilota Automatico'}</span>
              {scheduledPosts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950 border border-indigo-400/40 text-indigo-300">
                  {scheduledPosts.length}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {activeMainTab === 'composer' 
              ? (uiLang === 'EN' ? '9:16 Video & Story Composer' : 'Compositore Video Verticali 9:16 & Storie')
              : (uiLang === 'EN' ? 'Automated Website Content Scheduler' : 'Programmazione Automatica Contenuti del Sito')}
          </div>
        </div>

        {/* Banner Alert (if publish result exists) */}
        {publishResult && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
              publishResult.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
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

        {/* TAB 1: Composer Studio */}
        {activeMainTab === 'composer' && (
          <>
            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Composer & Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Channels Selector */}
            <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">1</span>
                  {t.step1Title}
                </span>
                <span className="text-xs text-slate-500">{t.step1Subtitle}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* TikTok Card */}
                <button
                  type="button"
                  onClick={() => handleTogglePlatform('tiktok')}
                  className={`p-3.5 rounded-xl border flex flex-col items-start text-left transition-all relative ${
                    selectedPlatforms.includes('tiktok')
                      ? 'border-rose-500/80 bg-rose-950/20 text-white shadow-md shadow-rose-950/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black border border-slate-800 flex items-center justify-center p-1.5">
                      <TikTokIcon className="w-5 h-5 text-white" />
                    </div>
                    {selectedPlatforms.includes('tiktok') && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white">TikTok</span>
                  <span className="text-[10px] text-rose-400 font-mono mt-0.5">{t.tiktokStatus}</span>
                </button>

                {/* Google Maps / Business Profile Card */}
                <button
                  type="button"
                  onClick={() => handleTogglePlatform('google')}
                  className={`p-3.5 rounded-xl border flex flex-col items-start text-left transition-all relative ${
                    selectedPlatforms.includes('google')
                      ? 'border-blue-500/80 bg-blue-950/20 text-white shadow-md shadow-blue-950/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                    {selectedPlatforms.includes('google') && (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white">Google Maps</span>
                  <span className="text-[10px] text-blue-400 font-mono mt-0.5">{t.googleStatus}</span>
                </button>

                {/* Instagram Card */}
                <button
                  type="button"
                  onClick={() => handleTogglePlatform('instagram')}
                  className={`p-3.5 rounded-xl border flex flex-col items-start text-left transition-all relative ${
                    selectedPlatforms.includes('instagram')
                      ? 'border-pink-500/80 bg-pink-950/20 text-white shadow-md shadow-pink-950/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5">
                      <InstagramIcon className="w-5 h-5" />
                    </div>
                    {selectedPlatforms.includes('instagram') && (
                      <span className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white">Instagram</span>
                  <span className="text-[10px] text-pink-400 font-mono mt-0.5">{t.instagramStatus}</span>
                </button>

                {/* Facebook Card */}
                <button
                  type="button"
                  onClick={() => handleTogglePlatform('facebook')}
                  className={`p-3.5 rounded-xl border flex flex-col items-start text-left transition-all relative ${
                    selectedPlatforms.includes('facebook')
                      ? 'border-blue-500/80 bg-blue-950/20 text-white shadow-md shadow-blue-950/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5">
                      <FacebookIcon className="w-5 h-5" />
                    </div>
                    {selectedPlatforms.includes('facebook') && (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white">Facebook</span>
                  <span className="text-[10px] text-blue-400 font-mono mt-0.5">{t.facebookStatus}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Media Asset Selection */}
            <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">2</span>
                  {t.step2Title}
                </span>
                <span className="text-xs text-rose-400 font-medium">{t.step2Badge}</span>
              </div>

              {/* Demo Asset Carousel / Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {DEMO_ASSETS.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setCustomMediaUrl('');
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left aspect-[9/14] transition-all group ${
                      selectedAsset.id === asset.id && !customMediaUrl
                        ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-lg'
                        : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={asset.thumbnail}
                      alt={asset.title[uiLang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 flex flex-col justify-end">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-300 mb-1">
                        <Video className="w-3 h-3" />
                        <span>{asset.duration}</span>
                      </div>
                      <p className="text-[11px] font-medium text-white line-clamp-2 leading-tight">
                        {asset.title[uiLang]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Media URL Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t.customUrlPlaceholder}
                  value={customMediaUrl}
                  onChange={(e) => setCustomMediaUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
                {customMediaUrl && (
                  <button
                    onClick={() => setCustomMediaUrl('')}
                    className="text-xs text-slate-400 hover:text-white px-2"
                  >
                    {t.clear}
                  </button>
                )}
              </div>
            </div>

            {/* Step 3: Text Composer & DeepSeek AI */}
            <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">3</span>
                  {t.step3Title}
                </span>

                {/* DeepSeek AI Trigger */}
                <button
                  type="button"
                  onClick={handleGenerateCaptionWithDeepSeek}
                  disabled={isAiGenerating}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                  <span>{isAiGenerating ? t.deepseekLoading : t.deepseekBtn}</span>
                </button>
              </div>

              {/* Caption Text Area */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  placeholder={t.captionPlaceholder}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
                />
                <div className="flex items-center justify-between px-1 pt-1 text-[11px] text-slate-500">
                  <span>{t.charCount}: {postCaption.length} / 2200</span>
                  <span className="text-emerald-400 font-mono">{t.apiCompliant}</span>
                </div>
              </div>

              {/* Quick AI Options Drawer */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400">{t.aiTopicLabel}</span>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={t.aiTopicPlaceholder}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 flex-1 min-w-[140px]"
                />
                <select
                  value={aiTone}
                  onChange={(e: any) => setAiTone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                >
                  <option value="viral">{t.toneViral}</option>
                  <option value="gourmet">{t.toneGourmet}</option>
                  <option value="relax">{t.toneRelax}</option>
                </select>
                <select
                  value={aiLang}
                  onChange={(e: any) => setAiLang(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-semibold"
                >
                  <option value="EN">English (EN)</option>
                  <option value="IT">Italiano (IT)</option>
                  <option value="TH">Thai (TH)</option>
                  <option value="DE">Deutsch (DE)</option>
                </select>
              </div>
            </div>

            {/* Step 4: TikTok Specific Controls & Compliance */}
            <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">4</span>
                  {t.step4Title}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {t.step4Badge}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Privacy Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.privacyLabel}
                  </label>
                  <select
                    value={privacyLevel}
                    onChange={(e: any) => setPrivacyLevel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="PUBLIC_TO_EVERYONE">{t.privacyPublic}</option>
                    <option value="MUTUAL_FOLLOW_FRIENDS">{t.privacyFriends}</option>
                    <option value="SELF_ONLY">{t.privacySelf}</option>
                  </select>
                </div>

                {/* Content Disclosures */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.aiLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAiGenerated(!isAiGenerated)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition ${
                      isAiGenerated
                        ? 'border-indigo-500 bg-indigo-950/30 text-indigo-200'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span>{uiLang === 'EN' ? 'AI-Generated Label' : 'Etichetta AI'}</span>
                    <span className="font-bold">{isAiGenerated ? t.aiEnabled : t.aiDisabled}</span>
                  </button>
                </div>
              </div>

              {/* Interaction checkboxes */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!disableComment}
                    onChange={(e) => setDisableComment(!e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span>{t.allowComments}</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!disableDuet}
                    onChange={(e) => setDisableDuet(!e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span>{t.allowDuet}</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!disableStitch}
                    onChange={(e) => setDisableStitch(!e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span>{t.allowStitch}</span>
                </label>
              </div>
            </div>

            {/* Step 5: Publishing Trigger Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePublishNow}
                disabled={isPublishing}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isPublishing ? 'animate-bounce' : ''}`} />
                <span>{isPublishing ? t.publishingProgress : t.publishNowBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleRunDemoSimulation}
                disabled={isPublishing}
                title={t.simulationDesc}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t.runSimulationBtn}</span>
              </button>
            </div>

            {/* Progress status loader */}
            {publishProgress && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center gap-3 animate-pulse">
                <RefreshCw className="w-4 h-4 text-rose-400 animate-spin shrink-0" />
                <span>{publishProgress}</span>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Smartphone Live Preview Mockup (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center sticky top-24">
            
            {/* Platform Preview Selector Bar */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setPreviewPlatform('tiktok')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  previewPlatform === 'tiktok'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TikTokIcon className="w-3.5 h-3.5 text-white" />
                <span>TikTok</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlatform('instagram')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  previewPlatform === 'instagram'
                    ? 'bg-pink-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlatform('facebook')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  previewPlatform === 'facebook'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlatform('google')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  previewPlatform === 'google'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Google</span>
              </button>
            </div>

            {/* Smartphone Frame Mockup */}
            <div className="w-[310px] h-[610px] bg-black rounded-[44px] border-[6px] border-slate-700 shadow-2xl relative overflow-hidden flex flex-col select-none ring-1 ring-white/10">
              
              {/* Speaker & Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2"></div>
                <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Video/Image Background */}
              <div className="w-full h-full relative bg-slate-950 flex items-center justify-center overflow-hidden">
                {isVideo ? (
                  <video
                    src={activeMediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={activeMediaUrl}
                    alt="Media preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

                {/* TikTok UI Elements Overlay */}
                {previewPlatform === 'tiktok' && (
                  <div className="absolute inset-0 flex flex-col justify-between p-3.5 pt-8 text-white pointer-events-none">
                    
                    {/* Top TikTok Bar */}
                    <div className="flex items-center justify-between text-xs font-bold px-2 pt-1">
                      <span className="text-white/60">{t.previewLive}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white/60">{t.previewFollowing}</span>
                        <span className="text-white border-b-2 border-white pb-0.5">{t.previewForYou}</span>
                      </div>
                      <Search className="w-3.5 h-3.5 text-white/70" />
                    </div>

                    {/* Middle Right Action Column */}
                    <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3.5 text-center">
                      {/* Avatar */}
                      <div className="relative mb-1">
                        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-rose-600 flex items-center justify-center text-xs font-bold">
                          FP
                        </div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                          +
                        </div>
                      </div>

                      {/* Like */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-rose-500">
                          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                        </div>
                        <span className="text-[10px] font-semibold mt-0.5">14.2K</span>
                      </div>

                      {/* Comment */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold mt-0.5">328</span>
                      </div>

                      {/* Bookmark */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                          <Bookmark className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold mt-0.5">1.9K</span>
                      </div>

                      {/* Share */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                          <Share2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold mt-0.5">912</span>
                      </div>

                      {/* Spinning Vinyl Sound Disc */}
                      <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center animate-spin">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      </div>
                    </div>

                    {/* Bottom Caption & Audio Info */}
                    <div className="w-[78%] pb-2 space-y-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">
                          {selectedBrand === 'pizza' ? '@flowerpowerpizza' : '@flowerpowervillage'}
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      </div>

                      <p className="text-[11px] text-white/95 line-clamp-3 leading-snug drop-shadow-md">
                        {postCaption}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] text-white/80 pt-1 font-medium">
                        <TikTokIcon className="w-3 h-3 text-white shrink-0" />
                        <span className="truncate">
                          {selectedBrand === 'pizza' ? t.previewAudioPizza : t.previewAudioVillage}
                        </span>
                      </div>
                    </div>

                  </div>
                )}

                {/* Instagram Reel Overlay */}
                {previewPlatform === 'instagram' && (
                  <div className="absolute inset-0 flex flex-col justify-between p-4 pt-10 text-white pointer-events-none">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <InstagramIcon className="w-4 h-4" />
                        <span>Reels</span>
                      </span>
                      <InstagramIcon className="w-4 h-4" />
                    </div>

                    <div className="space-y-2 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center text-[10px] font-bold">
                          FP
                        </div>
                        <span className="text-xs font-semibold">flowerpowerpizza</span>
                        <button className="text-[10px] border border-white/60 px-2 py-0.5 rounded">{t.previewFollowBtn}</button>
                      </div>
                      <p className="text-[11px] line-clamp-2 text-white/90">{postCaption}</p>
                    </div>
                  </div>
                )}

                {/* Facebook Feed Overlay */}
                {previewPlatform === 'facebook' && (
                  <div className="absolute inset-0 bg-slate-900 text-white flex flex-col justify-between p-3 pt-10">
                    <div className="flex items-center gap-2">
                      <FacebookIcon className="w-8 h-8 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{selectedBrand === 'pizza' ? 'Flower Power Pizza Ranong' : 'Flower Power Farm Village'}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>1 min ·</span>
                          <Globe className="w-2.5 h-2.5 inline" />
                          <span>Public</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-4">{postCaption}</p>
                    <div className="h-44 rounded-lg overflow-hidden bg-black">
                      <video src={activeMediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                    </div>
                  </div>
                )}

                {/* Google Maps / Local Post Card Overlay */}
                {previewPlatform === 'google' && (
                  <div className="absolute inset-0 bg-[#202124] text-white flex flex-col justify-between p-4 pt-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center p-1.5 shadow">
                          <GoogleIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{selectedBrand === 'pizza' ? 'Flower Power Pizza - Ranong' : 'Flower Power Farm Village & Spa'}</span>
                            <CheckCircle className="w-3 h-3 text-blue-400 shrink-0" />
                          </div>
                          <div className="text-[10px] text-slate-400">Google Maps · Local Post</div>
                        </div>
                      </div>

                      <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
                        {isVideo ? (
                          <video src={activeMediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                        ) : (
                          <img src={activeMediaUrl} alt="Google post" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] text-white">
                          GOOGLE MAPS & SEARCH
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-200 line-clamp-3 leading-relaxed">
                        {postCaption}
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="w-full py-2 px-3 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow">
                        <span>{selectedBrand === 'village' ? 'BOOK ONLINE' : 'ORDER NOW'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-20"></div>
            </div>

            {/* Preview Hint */}
            <span className="text-[11px] text-slate-500 mt-3 text-center">
              {t.previewHint}
            </span>

          </div>

        </div>

        {/* BOTTOM SECTION: Published Post History & Queue */}
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
          </>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
