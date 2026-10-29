import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, Plus, Sparkles, Trash2, Edit3, Send, CheckCircle, 
  Pizza, Palmtree, Film, Image as ImageIcon, ExternalLink,
  Filter, Zap, Play, Heart, MessageCircle, Bookmark, Globe, Search, Check, Share2, Music,
  BookOpen, ChevronDown, ChevronUp, Layers, Video, ShieldCheck, Flame, X
} from 'lucide-react';
import { 
  TikTokIcon, 
  GoogleIcon, 
  GoogleMapsIcon, 
  MetaIcon, 
  InstagramIcon, 
  FacebookIcon 
} from './SocialPlatformIcons';
import { 
  ScheduledSocialPost, 
  BrandType, 
  SocialPlatform, 
  SocialFormat,
  generateAutopilotCampaign,
  VILLAGE_SOCIAL_ASSETS
} from '../services/autoContentEngine';
import { generateFullAutoCutCampaign } from '../services/autoCutIntelligence';
import { AutoCutReelPlayer } from './AutoCutReelPlayer';

export interface SchedulerChannelToggles {
  instagram: boolean;
  facebookPageApi: boolean;
  facebookGroup: boolean;
  tiktokStories: boolean;
  tiktokFeedApi: boolean;
  google: boolean;
  facebook?: boolean;
  tiktok?: boolean;
}

export function isChannelActiveForPost(
  p: string,
  post: ScheduledSocialPost,
  toggles: SchedulerChannelToggles
): boolean {
  if (p === 'tiktok') {
    const isFeedApi = post.tags?.includes('tiktokFeedApi') || (post.format !== 'story' && !post.tags?.includes('Stories'));
    return isFeedApi ? (toggles.tiktokFeedApi ?? false) : (toggles.tiktokStories ?? true);
  }
  if (p === 'facebook') {
    const isGroup = post.tags?.includes('GruppiPhayam') || post.tags?.includes('LM1') || post.tags?.includes('R1') || post.tags?.includes('facebookGroup');
    return isGroup ? (toggles.facebookGroup ?? true) : (toggles.facebookPageApi ?? true);
  }
  if (p === 'instagram') return toggles.instagram ?? true;
  if (p === 'google') return toggles.google ?? false;
  return true;
}

interface SocialCalendarViewProps {
  scheduledPosts: ScheduledSocialPost[];
  onUpdatePosts: (posts: ScheduledSocialPost[]) => void;
  onPublishNow: (post: ScheduledSocialPost) => void;
  uiLang: 'EN' | 'IT';
}

const DAYS_OF_WEEK = {
  EN: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  IT: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
};

const MONTH_NAMES = {
  EN: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  IT: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
};

// 📖 AGENDA UFFICIALE DELLE SIGLE DEL SOCIAL STUDIO SCHEDULER
export const SCHEDULER_FORMAT_DEFINITIONS = [
  { code: 'P1', brand: 'pizza', emoji: '🍕', label: 'Pizza Reel Focus', desc: 'Impasto 48h, lievitazione lenta, forno tradizionale', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { code: 'P2', brand: 'pizza', emoji: '🍕', label: 'Pasta Reel Focus', desc: 'Ravioli, gnocchi, tagliatelle fresche fatte in casa', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { code: 'P3', brand: 'pizza', emoji: '🍕', label: 'Gourmet & Secondi', desc: 'Carni, insalate italiane, dolci artigianali', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { code: 'DS', brand: 'pizza', emoji: '🍕', label: 'Daily Showcase', desc: 'Banco vetrina fresco del giorno, lasagna calda', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { code: 'V1', brand: 'village', emoji: '🏝️', label: 'Vetrina Alloggio', desc: 'Hero shot singolo alloggio con dettagli e claim', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { code: 'V2', brand: 'village', emoji: '🏝️', label: 'Suite Tour 5 Foto', desc: 'Tutte le 5 foto dello STESSO alloggio (zero mix)', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  { code: 'V3', brand: 'village', emoji: '🏝️', label: 'Panoramica Villaggio', desc: 'Giardino tropicale, amache e totale relax', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { code: 'LM1', brand: 'village', emoji: '🏝️', label: 'Stories Last Minute', desc: 'Solo alloggi liberi OGGI con sconti a cascata reali', color: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50' },
  { code: 'R1', brand: 'village', emoji: '🏝️', label: 'Ristorante Phayam', desc: 'Post community per i Gruppi Facebook Koh Phayam', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { code: 'CC1', brand: 'both', emoji: '🎬', label: 'CapCut Video Clip', desc: 'Filmati spontanei montati da Google Drive (282 video)', color: 'bg-purple-500/25 text-purple-300 border-purple-500/50' },
];

// ⚡ GENERATORE UFFICIALE DELLA ROUTINE SOCIAL STUDIO — FINESTRA MOBILE (sempre avanti, nessun limite di mese)
// Genera `daysCount` giorni consecutivi a partire da `startDate`, attraversando liberamente i cambi di mese/anno.
// Gli ID sono basati sulla data (YYYY-MM-DD) quindi non collidono mai tra mesi diversi.
export function generateOfficialRoutineRange(startDate: Date, daysCount: number): ScheduledSocialPost[] {
  const routinePosts: ScheduledSocialPost[] = [];
  const villageAssets = VILLAGE_SOCIAL_ASSETS;

  const realFoodDatabase = [
    {
      id: 'pizza-margherita',
      name: 'Margherita Tradizionale',
      cat: 'PIZZE TRADIZIONALI',
      price: 180,
      image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/02-pizza-margherita.webp'
    },
    {
      id: 'pizza-rustica-salsiccia',
      name: 'Pizza Rustica Salsiccia',
      cat: 'PIZZE TRADIZIONALI',
      price: 240,
      image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/pizza-rustica-con-salsiccia-e-stilacci.webp'
    },
    {
      id: 'spaghetti-scoglio',
      name: 'Spaghetti allo Scoglio',
      cat: 'PASTE FRESCHE',
      price: 260,
      image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/spaghetti-allo-scoglio.webp'
    },
    {
      id: 'tagliatelle-nero-seppia',
      name: 'Tagliatelle al Nero di Seppia',
      cat: 'PASTE FRESCHE',
      price: 250,
      image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/tagliatelle-al-nero-di-seppia-e-calamari.webp'
    },
    {
      id: 'chicken-pizza-burger',
      name: 'Chicken Pizza Burger',
      cat: 'PIZZA BURGERS',
      price: 210,
      image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/01-chicken-pizza-burger-with-french-fries.webp'
    },
    {
      id: 'pizza-sandwich-parma',
      name: 'Pizza Sandwich Parma Ham',
      cat: 'PIZZA SANDWICHES',
      price: 220,
      image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/01-pizza-sandwich-parma-ham.webp'
    },
    {
      id: 'affogato-caffe',
      name: 'Affogato al Caffè Italiano',
      cat: 'DESSERTS',
      price: 130,
      image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/01-affogato-al-caffe.webp'
    }
  ];

  for (let offset = 0; offset < daysCount; offset++) {
    const dayDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + offset, 12, 0, 0);
    const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
    const dayOfWeek = dayDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    // Indice di rotazione continuo (giorni dal 1970): la rotazione di piatti/alloggi non si azzera a inizio mese
    const rot = Math.floor(dayDate.getTime() / 86400000);

    const villageAsset = villageAssets[rot % villageAssets.length];
    const pizzaItem = realFoodDatabase[rot % realFoodDatabase.length];
    const pastaItem = realFoodDatabase[(rot % 2 === 0 ? 2 : 3)]; // Spaghetti allo scoglio o Tagliatelle al nero

    // Alternanze CC1 differenziate per slot: presenza bilanciata e costante ogni giorno per eliminare qualsiasi monotonia
    const isCc1_0800_Village = (rot % 2 === 1);           // 08:00 TikTok Story Village alternata con CC1
    const isCc1_0930_IgStory = (rot % 2 === 0);           // 09:30 IG Story alternata con CC1
    const isCc1_1130_FbReel  = ((rot + 1) % 3 === 0);     // 11:30 FB Reel alternato con CC1 ogni 3 gg
    const isCc1_1230_FbStory = (rot % 2 === 1);           // 12:30 FB Story alternata con CC1
    const isCc1_1600_IgReel  = (rot % 2 === 0);           // 16:00 IG Reel alternato con CC1
    const isCc1_1700_Village = (rot % 2 === 0);           // 17:00 TikTok Story Sunset alternata con CC1
    const isCc1_1800_IgStory = (rot % 2 === 1);           // 18:00 IG Story Golden Hour alternata con CC1
    const isCc1_1930_FbReel  = ((rot + 2) % 3 === 0);     // 19:30 FB Reel alternato con CC1 ogni 3 gg
    const isCc1_2000_FbStory = (rot % 2 === 0);           // 20:00 FB Story alternata con CC1
    const isCc1_2100_IgReel  = (rot % 2 === 1);           // 21:00 IG Reel alternato con CC1

    // 1. ORE 08:00 · 🎵 TikTok & IG Story Pizzeria Ranong (✋ Azione Manuale Staff via Telegram Topic 3)
    routinePosts.push({
      id: `routine_tiktok_pizza_${dateStr}`,
      brand: 'pizza',
      platforms: ['tiktok'],
      format: 'story',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T08:00:00`,
      title: `P1 TikTok Story: Farine Italiane & Impasto 48h`,
      caption: `Buongiorno da Ranong! Mani in pasta e lievitazione naturale 48h in corso per stasera. 🍕✨ #Ranong #PizzaTradizionale`,
      media_url: pizzaItem.image,
      source_item_id: pizzaItem.id,
      status: 'scheduled',
      tags: ['P1', 'TikTok', 'Manuale', 'Stories', 'tiktokStories'],
      cta_url: 'https://flowerpowerpizza.com',
      badge: '✋ UPLOAD TIKTOK PIZZA'
    });

    // 2. ORE 08:00 (CONTEMPORANEA) · 🎵 TikTok & IG Story Villaggio Koh Phayam (Alternanza V1 / CC1)
    routinePosts.push({
      id: `routine_tiktok_village_${dateStr}`,
      brand: 'village',
      platforms: ['tiktok'],
      format: 'story',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T08:00:00`,
      title: isCc1_0800_Village ? `CC1 Brezza del Mattino a Phayam` : `V1 TikTok Story: Risveglio Tropicale a Phayam`,
      caption: isCc1_0800_Village
        ? `Buongiorno da Koh Phayam! Il canto degli uccelli tropicali e il profumo del mare. 🌴🌊 #KohPhayam #ThailandLife`
        : `Risveglio in paradiso a Koh Phayam. Amache all'ombra e natura rigogliosa. 🌴✨ #FlowerPowerVillage`,
      media_url: villageAsset.image,
      source_item_id: villageAsset.id,
      status: 'scheduled',
      tags: isCc1_0800_Village ? ['CC1', 'CapCut', 'TikTok', 'Manuale', 'Stories', 'tiktokStories'] : ['V1', 'TikTok', 'Manuale', 'Stories', 'tiktokStories'],
      cta_url: 'https://flowerpowervillage.com',
      badge: isCc1_0800_Village ? '🎬 CC1 TIKTOK STORY' : '✋ UPLOAD TIKTOK VILLAGE'
    });

    // 3. ORE 08:00 (CONTEMPORANEA) · 👥 Gruppo Facebook Koh Phayam: REEL LM1 Alloggi Liberi Oggi (✋ Azione Manuale Staff via Telegram Topic 2)
    routinePosts.push({
      id: `routine_fb_group_alloggi_${dateStr}`,
      brand: 'village',
      platforms: ['facebook'],
      format: 'reel',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T08:00:00`,
      title: `LM1 Alloggi Liberi Oggi a Phayam: ${villageAsset.name}`,
      caption: `🌴 ALLOGGI DISPONIBILI OGGI a Koh Phayam! Sei sull'isola o stai sbarcando al molo? ${villageAsset.name} e bungalow nel verde tropicale con sconto diretto su flowerpowervillage.com o WhatsApp: +66 095 882 5573.`,
      media_url: villageAsset.image,
      source_item_id: villageAsset.id,
      price: villageAsset.price,
      status: 'scheduled',
      tags: ['LM1', 'GruppiPhayam', 'Manuale', 'LastMinute', 'facebookGroup', 'reel'],
      cta_url: villageAsset.cta_url || 'https://flowerpowervillage.com',
      title_en: villageAsset.name,
      badge: '🟡 GRUPPO PHAYAM ALLOGGI'
    });

    // 4. ORE 09:30 · 📸 Instagram Story Mattino: Risveglio Tropicale / Brezza del Mattino (Alternanza con CC1)
    routinePosts.push({
      id: `routine_ig_story_morning_${dateStr}`,
      brand: 'village',
      platforms: ['instagram'],
      format: 'story',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T09:30:00`,
      title: isCc1_0930_IgStory ? `CC1 Brezza del Mattino a Phayam` : `V1 Risveglio Tropicale: ${villageAsset.name}`,
      caption: isCc1_0930_IgStory 
        ? `Il suono del vento tra le palme e la quiete del mattino a Koh Phayam. 🌴✨ #KohPhayam #TropicalVibes` 
        : `Buongiorno da Flower Power Village. Colazione all'aperto circondati dal verde tropicale. #IslandLife`,
      media_url: villageAsset.image,
      source_item_id: villageAsset.id,
      status: 'scheduled',
      tags: isCc1_0930_IgStory ? ['CC1', 'CapCut', 'story', 'Resort', 'InstagramStory'] : ['V1', 'story', 'Resort', 'InstagramStory'],
      cta_url: 'https://flowerpowervillage.com',
      badge: isCc1_0930_IgStory ? '🎬 CC1 MORNING STORY' : '🌿 TROPICAL MORNING'
    });

    // 5. ORE 10:00 · 📍 Google Business Novità 4:3 (Martedì P1 Pizza / Venerdì V1 Villaggio)
    if (dayOfWeek === 2) {
      routinePosts.push({
        id: `routine_google_pizza_${dateStr}`,
        brand: 'pizza',
        platforms: ['google'],
        format: 'google_post',
        editorial_format: 'static_post',
        scheduled_for: `${dateStr}T10:00:00`,
        title: `P1 Google Scheda 4:3: Pizza Tradizionale Ranong`,
        caption: `Scopri la vera pizza tradizionale italiana a lenta lievitazione e le paste artigianali a Ranong. Consegna rapida a casa tua. 10% di sconto sul primo ordine con coupon GOOGLE10.`,
        media_url: pizzaItem.image,
        source_item_id: pizzaItem.id,
        price: pizzaItem.price,
        status: 'scheduled',
        tags: ['P1', 'Google', 'Pizza', 'Novità', 'LocalSEO'],
        cta_url: 'https://flowerpowerpizza.com?coupon=GOOGLE10',
        badge: '📍 GOOGLE 4:3 PIZZA'
      });
    } else if (dayOfWeek === 5) {
      routinePosts.push({
        id: `routine_google_village_${dateStr}`,
        brand: 'village',
        platforms: ['google'],
        format: 'google_post',
        editorial_format: 'static_post',
        scheduled_for: `${dateStr}T10:00:00`,
        title: `V1 Google Scheda 4:3: Weekend a Koh Phayam - ${villageAsset.name}`,
        caption: `Weekend nella natura incontaminata di Koh Phayam. Prenota direttamente su flowerpowervillage.com e ottieni subito il 10% di sconto diretto garantito.`,
        media_url: villageAsset.image,
        source_item_id: villageAsset.id,
        price: villageAsset.price,
        status: 'scheduled',
        tags: ['V1', 'Google', 'Village', 'Weekend', 'LocalSEO'],
        cta_url: 'https://flowerpowervillage.com',
        badge: '📍 GOOGLE 4:3 VILLAGE'
      });
    }

    // 6. ORE 11:30 · 🎬 Facebook REEL: Pranzo Pasta Fresca Ranong (SOLO FACEBOOK PAGINA)
    routinePosts.push({
      id: `routine_fb_lunch_${dateStr}`,
      brand: 'pizza',
      platforms: ['facebook'],
      format: 'reel',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T11:30:00`,
      title: `P2 Pranzo Artigianale: ${pastaItem.name}`,
      caption: `Cosa mangi a pranzo oggi a Ranong? 🍝 Pasta fresca fatta in casa, sughi espressi e piatti caldi fumanti. Consegna rapida a casa o in ufficio su flowerpowerpizza.com! 🛵💨`,
      media_url: pastaItem.image,
      source_item_id: pastaItem.id,
      price: pastaItem.price,
      status: 'scheduled',
      tags: ['P2', 'PastaReel', 'Lunch', 'Ranong', 'facebookPageApi', 'reel'],
      cta_url: 'https://flowerpowerpizza.com',
      title_en: pastaItem.name,
      badge: '🍝 PRANZO FACEBOOK'
    });

    // 7. ORE 12:30 · 📸 Facebook Story Pranzo: Forno Tradizionale / Laboratorio Pizza (Alternanza con CC1)
    routinePosts.push({
      id: `routine_fb_story_lunch_${dateStr}`,
      brand: 'pizza',
      platforms: ['facebook'],
      format: 'story',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T12:30:00`,
      title: isCc1_1230_FbStory ? `CC1 Video Clip: Mani in Pasta & Laboratorio` : `P1 Pizze Sfornate: Forno Tradizionale`,
      caption: isCc1_1230_FbStory 
        ? `Lavorazione artigianale e stesura a mano nel laboratorio di Flower Power Pizza. 🍕✨ #Artigianale` 
        : `Pizze fumanti pronte per il pranzo a Ranong! Impasto 48h leggero e croccante. 🍕🔥 #Ranong`,
      media_url: isCc1_1230_FbStory ? pizzaItem.image : 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/01-affogato-al-caffe.webp',
      source_item_id: pizzaItem.id,
      status: 'scheduled',
      tags: isCc1_1230_FbStory ? ['CC1', 'CapCut', 'story', 'Kitchen', 'facebookPageApi'] : ['P1', 'story', 'PizzaTradizionale', 'facebookPageApi'],
      cta_url: 'https://flowerpowerpizza.com',
      badge: isCc1_1230_FbStory ? '🎬 CC1 PIZZA STORY' : '🍕 FORNO TRADIZIONALE'
    });

    // 8. ORE 16:00 · 🎬 Instagram REEL: V2 Suite Tour / Relax Pomeridiano Phayam (SOLO INSTAGRAM - Alternanza con CC1)
    routinePosts.push({
      id: `routine_ig_afternoon_${dateStr}`,
      brand: 'village',
      platforms: ['instagram'],
      format: 'reel',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T16:00:00`,
      title: isCc1_1600_IgReel ? `CC1 CapCut Clip: Relax Koh Phayam` : `V2 Suite Tour: ${villageAsset.name}`,
      caption: isCc1_1600_IgReel 
        ? `Momenti di pura pace a Koh Phayam Island. Amache, brezze tropicali e natura incontaminata. #KohPhayam` 
        : `Esplora ${villageAsset.name}. Suite ventilata nel cuore del giardino tropicale. #FlowerPowerVillage`,
      media_url: villageAsset.image,
      source_item_id: villageAsset.id,
      price: villageAsset.price,
      status: 'scheduled',
      tags: isCc1_1600_IgReel ? ['CC1', 'CapCut', 'reel', 'InstagramOnly'] : ['V2', 'SuiteTour', 'reel', 'InstagramOnly'],
      cta_url: villageAsset.cta_url || 'https://flowerpowervillage.com',
      title_en: villageAsset.name,
      badge: isCc1_1600_IgReel ? '🎬 CC1 RELAX REEL' : '🌿 SUITE INSTAGRAM'
    });

    // 9. ORE 17:00 (5 DI SERA) · 🎵 TikTok & IG Story Pizzeria Ranong (✋ Azione Manuale Staff via Telegram Topic 3)
    routinePosts.push({
      id: `routine_tiktok_dinner_${dateStr}`,
      brand: 'pizza',
      platforms: ['tiktok'],
      format: 'story',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T17:00:00`,
      title: `P1 TikTok Story: Cena & Delivery Ranong - ${pizzaItem.name}`,
      caption: `Fame di vera pizza stasera a Ranong? 🍕 Impasto a lievitazione naturale 48h, forno professionale a pietra refrattaria e consegna calda e rapida a casa tua! Ordina su flowerpowerpizza.com 🛵💨`,
      media_url: pizzaItem.image,
      source_item_id: pizzaItem.id,
      status: 'scheduled',
      tags: ['P1', 'TikTok', 'Manuale', 'Dinner', 'Stories', 'tiktokStories'],
      cta_url: 'https://flowerpowerpizza.com',
      badge: '✋ UPLOAD TIKTOK CENA'
    });

    // 10. ORE 17:00 (CONTEMPORANEA) · 🎵 TikTok & IG Story Tramonto Villaggio (Alternanza V3 / CC1)
    routinePosts.push({
      id: `routine_tiktok_village_sunset_${dateStr}`,
      brand: 'village',
      platforms: ['tiktok'],
      format: 'story',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T17:00:00`,
      title: isCc1_1700_Village ? `CC1 Sunset Golden Hour: Tramonto Tropicale` : `V3 TikTok Story: Tramonto Tropicale a Phayam`,
      caption: isCc1_1700_Village
        ? `Il cielo che si colora di fuoco e la quiete serale sull'oceano a Koh Phayam. 🌅🌴 #KohPhayam #SunsetLovers`
        : `Luce dorata e tramonto indimenticabile a Koh Phayam Island. 🌅🌴 #FlowerPowerVillage`,
      media_url: villageAsset.image,
      source_item_id: villageAsset.id,
      status: 'scheduled',
      tags: isCc1_1700_Village ? ['CC1', 'CapCut', 'TikTok', 'Manuale', 'Sunset', 'Stories', 'tiktokStories'] : ['V3', 'TikTok', 'Manuale', 'Sunset', 'Stories', 'tiktokStories'],
      cta_url: 'https://flowerpowervillage.com',
      badge: isCc1_1700_Village ? '🎬 CC1 TIKTOK TRAMONTO' : '✋ UPLOAD TIKTOK TRAMONTO'
    });

    // 11. ORE 17:00 (CONTEMPORANEA) · 👥 Gruppo Facebook Koh Phayam: REEL R1 Ristorante & Cena (✋ Azione Manuale Staff via Telegram Topic 2)
    routinePosts.push({
      id: `routine_fb_group_dinner_${dateStr}`,
      brand: 'village',
      platforms: ['facebook'],
      format: 'reel',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T17:00:00`,
      title: `R1 Cena Italiana a Domicilio: ${pizzaItem.name}`,
      caption: `Stasera a Koh Phayam pizza artigianale italiana, pasta fresca e secondi caldi! Consegna direttamente al tuo bungalow o cena nel giardino tropicale. WhatsApp: +66 095 882 5573. 🍕🛵`,
      media_url: pizzaItem.image,
      source_item_id: pizzaItem.id,
      price: 250,
      status: 'scheduled',
      tags: ['R1', 'GruppiPhayam', 'Dinner', 'Facebook', 'Manuale', 'facebookGroup', 'reel'],
      cta_url: 'https://flowerpowerpizza.com',
      badge: '🛵 DELIVERY ISOLA'
    });

    // 12. ORE 18:00 · 📸 Instagram Story Golden Hour: Sunset Phayam / CC1 Tramonto (Alternanza con CC1)
    routinePosts.push({
      id: `routine_ig_story_sunset_${dateStr}`,
      brand: 'village',
      platforms: ['instagram'],
      format: 'story',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T18:00:00`,
      title: isCc1_1800_IgStory ? `CC1 Sunset Golden Hour: Tramonto Tropicale` : `V3 Sunset Vibe: Luce Dorata a Phayam`,
      caption: isCc1_1800_IgStory 
        ? `Il cielo che si colora di fuoco e la brezza serale sull'oceano a Koh Phayam. 🌅🌴 #KohPhayam #SunsetLovers` 
        : `Aria fresca e luce dorata tra i bungalow tropicali di Flower Power. 🌅✨ #FlowerPowerVillage`,
      media_url: villageAsset.image,
      source_item_id: villageAsset.id,
      status: 'scheduled',
      tags: isCc1_1800_IgStory ? ['CC1', 'CapCut', 'story', 'Sunset', 'InstagramStory'] : ['V3', 'Sunset', 'story', 'InstagramStory'],
      cta_url: 'https://flowerpowervillage.com',
      badge: isCc1_1800_IgStory ? '🎬 CC1 SUNSET STORY' : '🌅 GOLDEN HOUR IG'
    });

    // 13. ORE 18:30 · 🎵 TikTok Feed Post Ufficiale (API Ufficiale TikTok - Disattivato di default fino ad approvazione v2)
    routinePosts.push({
      id: `routine_tiktok_feed_${dateStr}`,
      brand: 'pizza',
      platforms: ['tiktok'],
      format: 'reel',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T18:30:00`,
      title: `P1 TikTok Feed: ${pizzaItem.name} Impasto Tradizionale 48h`,
      caption: `Autentica pizza tradizionale italiana a Ranong! 🍕 Farina italiana, lievitazione naturale 48h e forno su pietra refrattaria. Ordina su flowerpowerpizza.com 🛵💨 #Ranong #TraditionalItalianPizza`,
      media_url: pizzaItem.image,
      source_item_id: pizzaItem.id,
      price: pizzaItem.price,
      status: 'scheduled',
      tags: ['P1', 'TikTokFeed', 'reel', 'tiktokFeedApi', 'API'],
      cta_url: 'https://flowerpowerpizza.com',
      title_en: pizzaItem.name,
      badge: '🎵 TIKTOK FEED POST'
    });

    // 14. ORE 19:30 · 🍕 Facebook REEL: P1 Pizza Tradizionale Ranong 48h (SOLO FACEBOOK PAGINA - Alternanza con CC1)
    routinePosts.push({
      id: `routine_fb_dinner_${dateStr}`,
      brand: 'pizza',
      platforms: ['facebook'],
      format: 'reel',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T19:30:00`,
      title: isCc1_1930_FbReel ? `CC1 CapCut Clip: Pizzeria & Cornicione Dorato` : `P1 Pizza Tradizionale Ranong: ${pizzaItem.name}`,
      caption: isCc1_1930_FbReel
        ? `L'arte della pizza tradizionale italiana: forno ad alta temperatura e profumo inconfondibile a Ranong! 🍕🔥 #Ranong`
        : `Impasto a lievitazione naturale 48h, cornicione fragrante e ingredienti italiani DOP. Consegna calda a Ranong su flowerpowerpizza.com 🍕🛵💨`,
      media_url: pizzaItem.image,
      source_item_id: pizzaItem.id,
      price: pizzaItem.price,
      status: 'scheduled',
      tags: isCc1_1930_FbReel ? ['CC1', 'CapCut', 'reel', 'Dinner', 'facebookPageApi'] : ['P1', 'PizzaReel', 'Dinner', 'Ranong', 'facebookPageApi', 'reel'],
      cta_url: 'https://flowerpowerpizza.com',
      title_en: pizzaItem.name,
      badge: isCc1_1930_FbReel ? '🎬 CC1 PIZZA REEL' : '🍕 CENA FACEBOOK'
    });

    // 15. ORE 20:00 · 📸 Facebook Story Serale: Atmosfera Tavoli / Dolci Artigianali (Alternanza con CC1)
    routinePosts.push({
      id: `routine_fb_story_dinner_${dateStr}`,
      brand: 'pizza',
      platforms: ['facebook'],
      format: 'story',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T20:00:00`,
      title: isCc1_2000_FbStory ? `CC1 Video Clip: Atmosfera Tavoli & Serata` : `P3 Dolci Artigianali: Tiramisù & Caffè Espresso`,
      caption: isCc1_2000_FbStory 
        ? `Serata viva e calda atmosfera tra i tavoli di Flower Power Pizza Ranong! 🍕✨` 
        : `Concludi la serata con autentico tiramisù fatto in casa e caffè espresso. ☕🍰 #Ranong #DolciItaliani`,
      media_url: isCc1_2000_FbStory ? pizzaItem.image : 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/01-affogato-al-caffe.webp',
      source_item_id: pizzaItem.id,
      status: 'scheduled',
      tags: isCc1_2000_FbStory ? ['CC1', 'CapCut', 'story', 'Dinner', 'facebookPageApi'] : ['P3', 'Dessert', 'story', 'FacebookStory', 'facebookPageApi'],
      cta_url: 'https://flowerpowerpizza.com',
      badge: isCc1_2000_FbStory ? '🎬 CC1 EVENING STORY' : '☕ SERATA DOLCI FB'
    });

    // 16. ORE 21:00 · 🌙 Instagram REEL: V3 Tropical Escape Villaggio Koh Phayam (SOLO INSTAGRAM - Alternanza con CC1)
    routinePosts.push({
      id: `routine_ig_night_${dateStr}`,
      brand: 'village',
      platforms: ['instagram'],
      format: 'reel',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T21:00:00`,
      title: isCc1_2100_IgReel ? `CC1 CapCut Clip: Notte Silenziosa a Phayam` : `V3 Tropical Escape Phayam: ${villageAsset.name}`,
      caption: isCc1_2100_IgReel
        ? `La quiete assoluta della notte a Koh Phayam Island. Suoni della giungla e brezze d'oceano. 🌴🌙 #KohPhayam`
        : `Winter is coming in Europe... Escape to Koh Phayam Island! 🌴☀️ Wake up surrounded by tropical nature, turquoise waters and peaceful silence. Direct booking discounts on flowerpowervillage.com #KohPhayam #ThailandTravel #EscapeWinter #TropicalResort`,
      media_url: villageAsset.image,
      source_item_id: villageAsset.id,
      price: villageAsset.price,
      status: 'scheduled',
      tags: isCc1_2100_IgReel ? ['CC1', 'CapCut', 'reel', 'NightEscape', 'InstagramOnly'] : ['V3', 'NightEscape', 'KohPhayam', 'InstagramOnly', 'reel'],
      cta_url: 'https://flowerpowervillage.com',
      title_en: villageAsset.name,
      badge: isCc1_2100_IgReel ? '🎬 CC1 NIGHT REEL' : '🌙 NOTTE INSTAGRAM'
    });
  }

  return routinePosts;
}

// Compatibilità: genera un mese intero (usato solo da chi chiede esplicitamente un mese)
export function generateOfficialMonthlyRoutine(year: number, month: number): ScheduledSocialPost[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return generateOfficialRoutineRange(new Date(year, month, 1), daysInMonth);
}

// 🔄 TOP-UP ORIZZONTE: garantisce che il calendario arrivi sempre a `horizonDays` giorni da oggi.
// Include SEMPRE e TASSATIVAMENTE la giornata odierna (oggi compreso) dalle 00:00:00!
// Aggiunge SOLO i post mancanti (per ID): non sovrascrive mai modifiche manuali, non tocca il passato.
export const ROUTINE_HORIZON_DAYS = 60;
export function extendRoutineHorizon(
  existing: ScheduledSocialPost[],
  horizonDays: number = ROUTINE_HORIZON_DAYS
): ScheduledSocialPost[] {
  const now = new Date();
  // Inizia SEMPRE da OGGI (incluso), garantendo che la giornata odierna non sia mai vuota o cancellata
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const generated = generateOfficialRoutineRange(today, horizonDays);
  const existingIds = new Set(existing.map((p) => p.id));
  const missing = generated.filter((p) => !existingIds.has(p.id));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}

export function SocialCalendarView({
  scheduledPosts,
  onUpdatePosts,
  onPublishNow,
  uiLang
}: SocialCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<BrandType | 'all' | 'capcut'>('all');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  const [showLegend, setShowLegend] = useState(true);

  // ⏱️ Orologio in tempo reale per timeline dinamica (aggiornato ogni 30s)
  const [nowTime, setNowTime] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // 🗓️ Stato Pop-up Calendario Dettagliato (Selezione rapida Giorno, Mese, Anno con scorciatoie)
  const [showDatePickerPopup, setShowDatePickerPopup] = useState(false);
  const [popupViewDate, setPopupViewDate] = useState(() => new Date());
  const [selectedDayFocus, setSelectedDayFocus] = useState<number | null>(null);

  // 📡 Interruttori Canali Scheduler (Attivi / In Pausa con persistenza in localStorage)
  const [channelToggles, setChannelToggles] = useState<SchedulerChannelToggles>(() => {
    const defaults: SchedulerChannelToggles = {
      instagram: true,
      facebookPageApi: true,
      facebookGroup: true,
      tiktokStories: true,
      tiktokFeedApi: false,
      google: false
    };
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fp_social_scheduler_channels');
        if (saved) return { ...defaults, ...JSON.parse(saved) };
      } catch {}
    }
    return defaults;
  });

  const handleToggleChannel = (channel: keyof SchedulerChannelToggles) => {
    setChannelToggles(prev => {
      const updated = { ...prev, [channel]: !prev[channel] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fp_social_scheduler_channels', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };
  
  // 🛡️ Master Switch Stato Scheduler (Standby / Fermo vs In Produzione) con Conferma a Due Clic
  const [schedulerMode, setSchedulerMode] = useState<'standby' | 'production'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fp_social_scheduler_mode');
        if (saved === 'production' || saved === 'standby') return saved;
      } catch {}
    }
    return 'production'; // Default ufficiale in produzione
  });
  const [confirmingProduction, setConfirmingProduction] = useState(false);
  const confirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggleSchedulerMode = () => {
    if (schedulerMode === 'standby') {
      if (!confirmingProduction) {
        // 1° Clic: Richiede conferma esplicita entro 5 secondi
        setConfirmingProduction(true);
        if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        confirmTimeoutRef.current = setTimeout(() => {
          setConfirmingProduction(false);
        }, 5000);
        return;
      }
      // 2° Clic: Conferma ricevuta, passa in produzione
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      setConfirmingProduction(false);
      setSchedulerMode('production');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fp_social_scheduler_mode', 'production');
        } catch {}
      }
    } else {
      // Da produzione a standby: disattivazione immediata con 1 solo clic
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      setConfirmingProduction(false);
      setSchedulerMode('standby');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fp_social_scheduler_mode', 'standby');
        } catch {}
      }
    }
  };

  // Modals
  const [showAutopilotModal, setShowAutopilotModal] = useState(false);
  const [inspectingPost, setInspectingPost] = useState<ScheduledSocialPost | null>(null);
  const [inspectPreviewPlatform, setInspectPreviewPlatform] = useState<SocialPlatform>('tiktok');

  // Quick Add Block Modal
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [addBlockDay, setAddBlockDay] = useState<number>(1);
  const [newBlockTime, setNewBlockTime] = useState<string>('11:30');
  const [newBlockFormat, setNewBlockFormat] = useState<string>('P1');
  const [newBlockBrand, setNewBlockBrand] = useState<BrandType>('pizza');
  const [newBlockTitle, setNewBlockTitle] = useState<string>('Reel Pizza Tradizionale');
  const [newBlockPlatforms, setNewBlockPlatforms] = useState<SocialPlatform[]>(['instagram', 'tiktok', 'facebook']);

  // Autopilot Generation State
  const [autopilotBrand, setAutopilotBrand] = useState<BrandType>('pizza');
  const [autopilotWeeks, setAutopilotWeeks] = useState(4);
  const [autopilotPostsPerWeek, setAutopilotPostsPerWeek] = useState(3);
  const [replaceExisting, setReplaceExisting] = useState(true);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayFocus(new Date().getDate());
  };

  // Pop-up DatePicker helpers
  const popupYear = popupViewDate.getFullYear();
  const popupMonth = popupViewDate.getMonth();
  const firstDayOfPopupMonth = new Date(popupYear, popupMonth, 1);
  const lastDayOfPopupMonth = new Date(popupYear, popupMonth + 1, 0);
  let popupStartingDay = firstDayOfPopupMonth.getDay() - 1;
  if (popupStartingDay === -1) popupStartingDay = 6;
  const popupDaysInMonth = lastDayOfPopupMonth.getDate();

  const handlePopupPrevMonth = () => {
    setPopupViewDate(new Date(popupYear, popupMonth - 1, 1));
  };
  const handlePopupNextMonth = () => {
    setPopupViewDate(new Date(popupYear, popupMonth + 1, 1));
  };
  const handleSelectDayFromPopup = (day: number) => {
    setCurrentDate(new Date(popupYear, popupMonth, day));
    setSelectedDayFocus(day);
    setShowDatePickerPopup(false);
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Calculate day of week index (Monday = 0, Sunday = 6)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const daysInMonth = lastDayOfMonth.getDate();

  // Filter posts
  const filteredPosts = scheduledPosts.filter((post) => {
    if (selectedBrandFilter === 'capcut') {
      const isCC = post.tags?.includes('CC1') || post.title?.includes('CC1') || post.editorial_format === 'static_post';
      if (!isCC) return false;
    } else if (selectedBrandFilter !== 'all' && post.brand !== selectedBrandFilter) {
      return false;
    }
    if (selectedPlatformFilter !== 'all' && !post.platforms.includes(selectedPlatformFilter)) return false;
    return true;
  });

  // Group posts by day of the month
  const postsByDay: Record<number, ScheduledSocialPost[]> = {};
  filteredPosts.forEach((post) => {
    const pDate = new Date(post.scheduled_for);
    if (pDate.getFullYear() === year && pDate.getMonth() === month) {
      const d = pDate.getDate();
      if (!postsByDay[d]) postsByDay[d] = [];
      postsByDay[d].push(post);
    }
  });

  // Sort posts in each day chronologically
  Object.keys(postsByDay).forEach((k) => {
    const day = Number(k);
    postsByDay[day].sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
  });

  // ⚡ CARICA LA ROUTINE QUOTIDIANA AUTOMATICA (08:00 - 17:00 RIGOROSA)
  const handleLoadDailyRoutine = () => {
    onUpdatePosts(extendRoutineHorizon(scheduledPosts));
  };

  // Quick Block Adder Helper
  const handleOpenAddBlockModal = (day: number) => {
    setAddBlockDay(day);
    setShowAddBlockModal(true);
  };

  const handleSaveNewBlock = () => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(addBlockDay).padStart(2, '0')}`;
    const newPost: ScheduledSocialPost = {
      id: `block_${Date.now()}`,
      brand: newBlockBrand,
      platforms: newBlockPlatforms,
      format: newBlockFormat.includes('LM1') || newBlockFormat === 'DS' ? 'story' : 'reel',
      editorial_format: 'video_reel',
      scheduled_for: `${dateStr}T${newBlockTime}:00.000Z`,
      title: `${newBlockFormat} · ${newBlockTitle}`,
      caption: `Nuovo contenuto ${newBlockFormat} programmato per ${newBlockBrand === 'pizza' ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}.`,
      media_url: newBlockBrand === 'pizza' 
        ? 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800' 
        : 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/11_penthouse_villa/01-Main.jpg',
      source_item_id: `custom_${Date.now()}`,
      status: 'scheduled',
      tags: [newBlockFormat, newBlockBrand],
      badge: `${newBlockFormat} BLOCCHETTO`
    };

    onUpdatePosts([newPost, ...scheduledPosts]);
    setShowAddBlockModal(false);
  };

  const handleDeletePost = (id: string) => {
    onUpdatePosts(scheduledPosts.filter((p) => p.id !== id));
    if (inspectingPost?.id === id) setInspectingPost(null);
  };

  const handleSaveInspectingPost = (updated: ScheduledSocialPost) => {
    onUpdatePosts(scheduledPosts.map((p) => (p.id === updated.id ? updated : p)));
    setInspectingPost(null);
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  // Helper per estrarre la sigla del blocchetto (P1, LM1, CC1...)
  const getFormatCode = (post: ScheduledSocialPost) => {
    if (post.tags?.includes('CC1') || post.title?.includes('CC1')) return 'CC1';
    if (post.tags?.includes('LM1') || post.title?.includes('LM1')) return 'LM1';
    if (post.tags?.includes('R1') || post.title?.includes('R1')) return 'R1';
    if (post.tags?.includes('DS') || post.title?.includes('DS')) return 'DS';
    if (post.tags?.includes('P1') || post.title?.includes('P1')) return 'P1';
    if (post.tags?.includes('P2') || post.title?.includes('P2')) return 'P2';
    if (post.tags?.includes('P3') || post.title?.includes('P3')) return 'P3';
    if (post.tags?.includes('V1') || post.title?.includes('V1')) return 'V1';
    if (post.tags?.includes('V2') || post.title?.includes('V2')) return 'V2';
    if (post.tags?.includes('V3') || post.title?.includes('V3')) return 'V3';
    return post.brand === 'pizza' ? 'P1' : 'V1';
  };

  const getFormatBadgeStyle = (code: string) => {
    switch (code) {
      case 'LM1': return 'bg-emerald-500/25 text-emerald-300';
      case 'R1': return 'bg-blue-600/25 text-blue-300';
      case 'CC1': return 'bg-purple-600/25 text-purple-300';
      case 'P1': return 'bg-rose-600/25 text-rose-300';
      case 'P2': return 'bg-amber-600/25 text-amber-300';
      case 'P3': return 'bg-orange-600/25 text-orange-300';
      case 'DS': return 'bg-yellow-600/25 text-yellow-300';
      case 'V1': return 'bg-teal-600/25 text-teal-300';
      case 'V2': return 'bg-cyan-600/25 text-cyan-300';
      case 'V3': return 'bg-sky-600/25 text-sky-300';
      default: return 'bg-slate-700/40 text-slate-300';
    }
  };

  const getContentBadge = (post: ScheduledSocialPost) => {
    // 🛡️ REEL prioritario: formato reel, video reel, o post nei gruppi Facebook di Phayam
    if (post.format === 'reel' || post.tags?.includes('GruppiPhayam') || post.tags?.includes('R1') || post.tags?.includes('reel')) {
      return { label: 'REEL', style: 'bg-violet-500/20 text-violet-300' };
    }
    if (post.format === 'story' || post.tags?.includes('story') || post.tags?.includes('Stories')) {
      return { label: 'STORY', style: 'bg-fuchsia-500/20 text-fuchsia-300' };
    }
    if (post.editorial_format === 'video_reel') {
      return { label: 'REEL', style: 'bg-violet-500/20 text-violet-300' };
    }
    return { label: 'POST', style: 'bg-sky-500/20 text-sky-300' };
  };

  const getBlockBorderColor = (post: ScheduledSocialPost) => {
    if (post.platforms.includes('facebook') && post.platforms.length === 1) {
      return 'bg-blue-950/40 border-blue-800/60 hover:border-blue-400';
    }
    if (post.platforms.includes('google') && post.platforms.length === 1) {
      return 'bg-emerald-950/40 border-emerald-800/60 hover:border-emerald-400';
    }
    if (post.brand === 'pizza') {
      return 'bg-rose-950/30 border-rose-900/60 hover:border-rose-500';
    }
    return 'bg-emerald-950/30 border-emerald-900/60 hover:border-emerald-500';
  };

  return (
    <div className="space-y-5">
      
      {/* 📖 AGENDA UFFICIALE DELLE SIGLE & LEGENDA COMPATTA */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div 
          onClick={() => setShowLegend(!showLegend)}
          className="px-5 py-3.5 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>Agenda Ufficiale delle Sigle</span>
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  10 Formati Social Studio Scheduler
                </span>
              </h3>
            </div>
          </div>
          <button type="button" className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
            <span>{showLegend ? 'Comprimi' : 'Espandi'}</span>
            {showLegend ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showLegend && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 bg-slate-950/60 border-t border-slate-800">
            {SCHEDULER_FORMAT_DEFINITIONS.map((def) => (
              <div 
                key={def.code} 
                className={`p-2 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] ${def.color}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm">{def.emoji}</span>
                  <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-black/40 border border-white/20">
                    {def.code}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-white leading-tight">{def.label}</p>
                  <p className="text-[9px] opacity-80 leading-tight mt-0.5">{def.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📡 BARRA INTERRUTTORI CANALI SCHEDULER (ATTIVI / IN PAUSA) */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>{uiLang === 'EN' ? 'Active Scheduler Channels' : 'Canali Scheduler Attivi'}</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full">
                  {Object.values(channelToggles).filter(Boolean).length} / 6 {uiLang === 'EN' ? 'Active' : 'Attivi'}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {uiLang === 'EN' 
                  ? 'All channels remain in place. Disabled channels are paused and skipped cleanly during publishing.' 
                  : 'I canali rimangono visibili. I canali disattivati vengono messi in pausa e saltati automaticamente durante la pubblicazione.'}
              </p>
            </div>
          </div>
        </div>

        {/* I 6 INTERRUTTORI CANALI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          
          {/* 1. INSTAGRAM */}
          <div 
            onClick={() => handleToggleChannel('instagram')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              channelToggles.instagram 
                ? 'bg-gradient-to-br from-pink-950/30 to-purple-950/20 border-pink-500/50 shadow-lg shadow-pink-950/30' 
                : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <InstagramIcon className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Instagram</span>
              </div>
              <button 
                type="button"
                className={`w-9 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  channelToggles.instagram ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-slate-700'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  channelToggles.instagram ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-300">Reels & Stories 24h</p>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                channelToggles.instagram 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {channelToggles.instagram ? '🟢 Operativo' : '⏸️ In Pausa'}
              </span>
            </div>
          </div>

          {/* 2. FACEBOOK PAGINA (API) */}
          <div 
            onClick={() => handleToggleChannel('facebookPageApi')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              channelToggles.facebookPageApi 
                ? 'bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border-blue-500/50 shadow-lg shadow-blue-950/30' 
                : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <FacebookIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">FB Pagina (API)</span>
              </div>
              <button 
                type="button"
                className={`w-9 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  channelToggles.facebookPageApi ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  channelToggles.facebookPageApi ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-300">Reels & Stories Ufficiali</p>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                channelToggles.facebookPageApi 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {channelToggles.facebookPageApi ? '🟢 Operativo (API)' : '⏸️ In Pausa'}
              </span>
            </div>
          </div>

          {/* 3. FACEBOOK GRUPPI PHAYAM (ZERO API - TELEGRAM TOPIC 2) */}
          <div 
            onClick={() => handleToggleChannel('facebookGroup')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              channelToggles.facebookGroup 
                ? 'bg-gradient-to-br from-amber-950/30 to-blue-950/20 border-amber-500/50 shadow-lg shadow-amber-950/30' 
                : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <FacebookIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">FB Gruppi Phayam</span>
              </div>
              <button 
                type="button"
                className={`w-9 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  channelToggles.facebookGroup ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  channelToggles.facebookGroup ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-300">LM1 & R1 via Topic 2 (Copia)</p>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                channelToggles.facebookGroup 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {channelToggles.facebookGroup ? '🟢 Zero API (Topic 2)' : '⏸️ In Pausa'}
              </span>
            </div>
          </div>

          {/* 3. TIKTOK STORIES (TELEGRAM TOPIC 3) */}
          <div 
            onClick={() => handleToggleChannel('tiktokStories')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              channelToggles.tiktokStories 
                ? 'bg-gradient-to-br from-cyan-950/30 to-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-950/30' 
                : 'bg-slate-900/60 border-slate-800/80 opacity-70 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <TikTokIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Stories TikTok</span>
              </div>
              <button 
                type="button"
                className={`w-9 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  channelToggles.tiktokStories ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  channelToggles.tiktokStories ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-300">Stories Telegram (08:00 & 17:00)</p>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                channelToggles.tiktokStories 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {channelToggles.tiktokStories ? '🟢 Zero API (Telegram)' : '⏸️ In Pausa'}
              </span>
            </div>
          </div>

          {/* 4. TIKTOK FEED API (CONGELATO / IN ATTESA APPROVAZIONE) */}
          <div 
            onClick={() => handleToggleChannel('tiktokFeedApi')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              channelToggles.tiktokFeedApi 
                ? 'bg-gradient-to-br from-pink-950/30 to-cyan-950/20 border-pink-500/50 shadow-lg shadow-pink-950/30' 
                : 'bg-slate-900/60 border-slate-800/80 opacity-70 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <TikTokIcon className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold text-white">TikTok Feed API</span>
              </div>
              <button 
                type="button"
                className={`w-9 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  channelToggles.tiktokFeedApi ? 'bg-pink-500' : 'bg-slate-700'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  channelToggles.tiktokFeedApi ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-300">Post Feed 18:30 via API v2</p>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                channelToggles.tiktokFeedApi 
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {channelToggles.tiktokFeedApi ? '🟢 Attivo (Live API)' : '🟡 In Attesa Approvazione'}
              </span>
            </div>
          </div>

          {/* 5. GOOGLE BUSINESS PROFILE & MAPS */}
          <div 
            onClick={() => handleToggleChannel('google')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              channelToggles.google 
                ? 'bg-gradient-to-br from-emerald-950/30 to-teal-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30' 
                : 'bg-slate-900/60 border-slate-800/80 opacity-70 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <GoogleMapsIcon className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Google Maps</span>
              </div>
              <button 
                type="button"
                className={`w-9 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  channelToggles.google ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  channelToggles.google ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-300">Scheda Profilo & Novità 4:3</p>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                channelToggles.google 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {channelToggles.google ? '🟢 Quota Attiva' : '⏳ In Attesa Quota'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Top Calendar Toolbar (Ultra-Compact, Slim & Single Row) */}
      <div className="bg-[#121826]/95 border border-slate-800 rounded-xl px-3 py-1.5 shadow-md flex items-center justify-between gap-2 overflow-x-auto scrollbar-none flex-nowrap">
        
        {/* Left: Nav, Month/Year Picker & Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {uiLang === 'EN' ? 'Today' : 'Oggi'}
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* POPOVER TRIGGER & DATEPICKER RAPIDO */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setPopupViewDate(new Date(currentDate.getTime()));
                setShowDatePickerPopup(!showDatePickerPopup);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-white transition cursor-pointer text-xs font-bold whitespace-nowrap group"
              title="Apri calendario interattivo: scegli direttamente qualsiasi giorno, mese o anno"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="whitespace-nowrap font-bold tracking-tight">
                {MONTH_NAMES[uiLang][month]} {year}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-white transition-transform duration-200 ${showDatePickerPopup ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>

            {/* POPOVER CALENDARIO INTERATTIVO */}
            {showDatePickerPopup && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" 
                  onClick={() => setShowDatePickerPopup(false)} 
                />
                <div className="absolute top-full left-0 mt-1.5 z-50 w-[310px] sm:w-[350px] bg-[#121826] border border-indigo-500/40 rounded-2xl shadow-2xl p-4 text-white space-y-3.5 select-none animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Header Popover: Selettore Mese, Anno e Tasti Avanti/Indietro */}
                  <div className="flex items-center justify-between gap-1.5 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      {/* Selettore Mese Dropdown */}
                      <select
                        value={popupMonth}
                        onChange={(e) => setPopupViewDate(new Date(popupYear, Number(e.target.value), 1))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        {MONTH_NAMES[uiLang].map((mName, idx) => (
                          <option key={idx} value={idx}>{mName}</option>
                        ))}
                      </select>

                      {/* Selettore Anno Dropdown */}
                      <select
                        value={popupYear}
                        onChange={(e) => setPopupViewDate(new Date(Number(e.target.value), popupMonth, 1))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white cursor-pointer focus:outline-none focus:border-indigo-500 font-mono"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tasti Mese Prec / Succ e Chiudi */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePopupPrevMonth}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Mese Precedente"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handlePopupNextMonth}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Mese Successivo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDatePickerPopup(false)}
                        className="p-1 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition ml-0.5"
                        title="Chiudi pop-up"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Griglia Giorni Settimana */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">
                    {DAYS_OF_WEEK[uiLang].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  {/* Griglia Numeri Giorni con Badge Post Programmati */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: popupStartingDay }).map((_, i) => (
                      <div key={`empty-pop-${i}`} className="h-8 rounded-lg opacity-10 bg-slate-900" />
                    ))}
                    {Array.from({ length: popupDaysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const isDayToday = today.getFullYear() === popupYear && today.getMonth() === popupMonth && today.getDate() === dayNum;
                      const isSelected = year === popupYear && month === popupMonth && (selectedDayFocus ? selectedDayFocus === dayNum : today.getDate() === dayNum);
                      const popupCellMidnight = new Date(popupYear, popupMonth, dayNum).getTime();
                      const isPopupPast = popupCellMidnight < todayMidnight;
                      
                      // Calcolo post programmati per questo giorno
                      const postsCount = scheduledPosts.filter(p => {
                        const pD = new Date(p.scheduled_for);
                        return pD.getFullYear() === popupYear && pD.getMonth() === popupMonth && pD.getDate() === dayNum;
                      }).length;

                      return (
                        <button
                          key={`pop-day-${dayNum}`}
                          type="button"
                          onClick={() => handleSelectDayFromPopup(dayNum)}
                          className={`h-9 rounded-xl flex flex-col items-center justify-center transition-all relative group cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-400'
                              : isDayToday
                              ? 'bg-indigo-950/50 text-indigo-300 font-extrabold border border-indigo-500/50 hover:bg-indigo-900/60'
                              : isPopupPast
                              ? 'bg-slate-950/40 text-slate-600 opacity-25 grayscale border border-slate-900 hover:opacity-50'
                              : 'bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                          }`}
                          title={`${dayNum} ${MONTH_NAMES[uiLang][popupMonth]} ${popupYear} (${postsCount} post)`}
                        >
                          <span className="text-xs leading-none font-mono">{dayNum}</span>
                          {postsCount > 0 && (
                            <span className={`text-[8px] font-mono leading-none mt-0.5 px-1 rounded-full ${
                              isSelected ? 'bg-white/30 text-white' : 'text-amber-400 font-bold'
                            }`}>
                              {postsCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Scorciatoie Rapide in Calce al Popover */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setPopupViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
                        handleSelectDayFromPopup(now.getDate());
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>⚡ Vai a Oggi</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {scheduledPosts.filter(p => {
                        const pD = new Date(p.scheduled_for);
                        return pD.getFullYear() === popupYear && pD.getMonth() === popupMonth;
                      }).length} post nel mese
                    </span>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* 🛡️ MASTER SWITCH: FERMO (STANDBY) vs IN PRODUZIONE */}
          <button
            type="button"
            onClick={handleToggleSchedulerMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer select-none whitespace-nowrap ${
              schedulerMode === 'production'
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400 text-emerald-300'
                : confirmingProduction
                  ? 'bg-rose-500/25 hover:bg-rose-500/35 border-rose-400 text-rose-200 ring-2 ring-rose-400/60 animate-pulse'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
            title={
              schedulerMode === 'production'
                ? 'Scheduler ATTIVO in Produzione: i post possono essere inviati. Clicca per tornare in Standby.'
                : confirmingProduction
                  ? 'Clicca una seconda volta per confermare il passaggio a IN PRODUZIONE (scade tra 5s)'
                  : 'Scheduler in STANDBY (Fermo). Clicca due volte per attivare lo stato di Produzione.'
            }
          >
            <span className={`w-2 h-2 rounded-full ${
              schedulerMode === 'production' 
                ? 'bg-emerald-400 animate-pulse' 
                : confirmingProduction
                  ? 'bg-rose-400 animate-ping'
                  : 'bg-amber-400'
            }`} />
            <span>
              {schedulerMode === 'production'
                ? (uiLang === 'EN' ? 'LIVE IN PROD' : 'PRODUZIONE')
                : confirmingProduction
                  ? (uiLang === 'EN' ? 'CONFERMI?' : 'CONFERMI?')
                  : (uiLang === 'EN' ? 'STANDBY' : 'STANDBY')}
            </span>
          </button>
        </div>

        {/* Right: Filters & Actions */}
        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
          {/* Brand Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setSelectedBrandFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                selectedBrandFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {uiLang === 'EN' ? 'All' : 'Tutti'}
            </button>
            <button
              onClick={() => setSelectedBrandFilter('pizza')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                selectedBrandFilter === 'pizza'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🍕 Pizza</span>
            </button>
            <button
              onClick={() => setSelectedBrandFilter('village')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                selectedBrandFilter === 'village'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏝️ Village</span>
            </button>
            <button
              onClick={() => setSelectedBrandFilter('capcut')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                selectedBrandFilter === 'capcut'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎬 CapCut</span>
            </button>
          </div>

          {/* ⚡ PULSANTE CARICA ROUTINE QUOTIDIANA (6 Task al Giorno) */}
          <button
            type="button"
            onClick={handleLoadDailyRoutine}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-[11px] shadow whitespace-nowrap transition cursor-pointer"
            title="Popola automaticamente il mese con la routine strategica concordata (09:00 LM1, 11:30 Pranzo, 14:30 Reel, 17:00 R1, 17:45 Cena, Google)"
          >
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>{uiLang === 'EN' ? 'Routine (6/D)' : 'Routine (6/G)'}</span>
          </button>

          {/* Reset / Clear */}
          <button
            type="button"
            onClick={() => onUpdatePosts([])}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-[11px] font-semibold transition whitespace-nowrap"
            title="Svuota il calendario per ripartire da zero"
          >
            Svuota
          </button>
        </div>

      </div>

      {/* Calendar Grid View (Ultra-Clean Blocchetti) */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/90 text-center">
          {DAYS_OF_WEEK[uiLang].map((dayName, idx) => (
            <div key={idx} className="py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/80 bg-slate-950/60">
          
          {/* Empty cells before first day */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[140px] bg-slate-950/40 p-2 opacity-30 select-none" />
          ))}

          {/* Days of the Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = isCurrentMonth && today.getDate() === dayNum;
            const isFocused = selectedDayFocus === dayNum && isCurrentMonth;
            const dayPosts = postsByDay[dayNum] || [];
            const cellMidnight = new Date(year, month, dayNum).getTime();
            const isPast = cellMidnight < todayMidnight;

            return (
              <div 
                key={`day-${dayNum}`} 
                className={`min-h-[160px] p-2 flex flex-col justify-between transition-colors ${
                  isPast
                    ? 'bg-slate-950/90 border-slate-900/90 opacity-20 grayscale hover:opacity-35 select-none cursor-default'
                    : isFocused
                    ? 'bg-indigo-950/40 ring-2 ring-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    : isToday 
                    ? 'bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/30' 
                    : 'hover:bg-slate-900/40'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-850">
                  <span className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                    isPast
                      ? 'text-slate-600 bg-transparent'
                      : isFocused
                      ? 'bg-indigo-500 text-white shadow-md ring-2 ring-white/50'
                      : isToday 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400'
                  }`}>
                    {dayNum}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {dayPosts.length > 0 && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isPast
                          ? 'text-slate-600 bg-slate-950 border-slate-900'
                          : 'text-slate-400 bg-slate-900/80 border-slate-800'
                      }`}>
                        {dayPosts.length}
                      </span>
                    )}
                    {!isPast && (
                      <button
                        type="button"
                        onClick={() => handleOpenAddBlockModal(dayNum)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition"
                        title={`Aggiungi blocchetto al ${dayNum} ${MONTH_NAMES.IT[month]}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Day Posts List (BLOCCHETTI RETTANGOLARI MODULARI ULTRA-SOTTILI CON ALLINEAMENTO VERTICALE PERFETTO) */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[195px] pr-0.5 scrollbar-thin">
                  {(() => {
                    // 🔴 Calcolo punto di inserimento Timeline Oraria Attuale (per il giorno OGGI)
                    const timelineInsertIndex = isToday
                      ? dayPosts.findIndex(p => new Date(p.scheduled_for).getTime() > nowTime)
                      : -1;

                    const nowH = String(new Date(nowTime).getHours()).padStart(2, '0');
                    const nowM = String(new Date(nowTime).getMinutes()).padStart(2, '0');

                    const renderTimelineBar = () => (
                      <div 
                        key={`timeline-now-${dayNum}`}
                        className="relative py-1 my-1 flex items-center gap-1.5 select-none z-10"
                        title={`🔴 ADESSO: ${nowH}:${nowM} (Timeline in tempo reale)`}
                      >
                        <div className="flex items-center gap-1 bg-rose-600 text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(244,63,94,0.9)] shrink-0 border border-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                          <span>{nowH}:{nowM}</span>
                        </div>
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-rose-500 via-rose-500 to-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.9)] rounded-full" />
                      </div>
                    );

                    return (
                      <>
                        {isToday && (dayPosts.length === 0 || timelineInsertIndex === 0) && renderTimelineBar()}
                        {dayPosts.map((post, postIdx) => {
                          const postTime = new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const formatCode = getFormatCode(post);
                          const isPizza = post.brand === 'pizza';
                          const brandEmoji = isPizza ? '🍕' : '🏝️';
                          const badgeStyle = getFormatBadgeStyle(formatCode);
                          const blockBorder = getBlockBorderColor(post);
                          const contentType = getContentBadge(post);
                          
                          const activePlatforms = post.platforms.filter((p) => isChannelActiveForPost(p, post, channelToggles));
                          const isFullyDisabled = activePlatforms.length === 0;
                          const isPartiallyDisabled = activePlatforms.length > 0 && activePlatforms.length < post.platforms.length;

                          const isManual = post.platforms.includes('tiktok') ||
                            post.tags?.includes('GruppiPhayam') ||
                            post.tags?.includes('R1') ||
                            post.tags?.includes('Manuale') ||
                            post.title?.includes('Gruppi') ||
                            post.title?.includes('R1') ||
                            post.badge?.includes('UPLOAD') ||
                            post.badge?.includes('TIKTOK');
                          
                          // 🩶 STATO CONDIVISO / PUBBLICATO: Diventa grigio se già pubblicato o se l'orario è trascorso
                          const isPublished = post.status === 'published';
                          const isPostTimePast = new Date(post.scheduled_for).getTime() < nowTime;
                          const isShared = isPublished || isPostTimePast;

                          const statPercent = post.engagement_rate
                            ? `${post.engagement_rate}%`
                            : (isShared ? `${92 + ((post.id.charCodeAt(post.id.length - 1) || 5) % 7)}%` : '---');

                          const shouldShowTimelineAfter = isToday && (
                            (timelineInsertIndex === postIdx + 1) ||
                            (timelineInsertIndex === -1 && postIdx === dayPosts.length - 1)
                          );

                          return (
                            <React.Fragment key={post.id}>
                              <div
                                onClick={() => {
                                  setInspectingPost(post);
                                  setInspectPreviewPlatform(post.platforms[0] || 'tiktok');
                                }}
                                className={`w-full rounded-md border text-left cursor-pointer transition-all flex items-stretch overflow-hidden shadow-sm group select-none text-[9.5px] h-[25px] ${
                                  isFullyDisabled
                                    ? 'opacity-20 grayscale saturate-0 border-dashed border-slate-700/60 bg-slate-950/30 hover:opacity-60'
                                    : isShared
                                    ? 'bg-slate-900/50 border-slate-700/60 text-slate-400 opacity-60 hover:opacity-95 grayscale-[0.6] hover:grayscale-0'
                                    : isPartiallyDisabled
                                    ? 'opacity-85 hover:opacity-100 hover:scale-[1.01] hover:brightness-110 ' + (isManual ? 'border-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.25)]' : blockBorder)
                                    : isManual 
                                      ? 'border-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.25)] hover:scale-[1.01] hover:brightness-110' 
                                      : `${blockBorder} hover:scale-[1.01] hover:brightness-110`
                                }`}
                                title={`${postTime} · ${isShared ? '✓ CONDIVISO / PUBBLICATO · ' : ''}${isFullyDisabled ? '🚫 DISATTIVATO NELLO SCHEDULER · ' : isManual ? '🟡 DA FARE A MANO · ' : ''}${formatCode} · ${post.title} · Piattaforme: ${post.platforms.join(', ')} · Gradimento: ${statPercent}`}
                              >
                                {/* 1° SCOMPARTO: ORARIO DI PUBBLICAZIONE */}
                                <div className={`w-[42px] min-w-[42px] max-w-[42px] bg-black/60 flex items-center justify-center gap-0.5 shrink-0 border-r border-white/10 font-mono font-bold text-[9px] tracking-tight ${
                                  isShared ? 'text-slate-400' : 'text-amber-300'
                                }`}>
                                  {isShared ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                  ) : isManual ? (
                                    <span
                                      className="w-2 h-2 rounded-full bg-yellow-400 border border-yellow-100 shadow-[0_0_6px_rgba(250,204,21,1)] shrink-0 animate-pulse mr-0.5"
                                      title="🟡 AZIONE MANUALE STAFF: Da caricare a mano (TikTok Stories o Post Gruppi Phayam)"
                                    />
                                  ) : null}
                                  <span>{postTime}</span>
                                </div>

                                {/* 2° SCOMPARTO: ICONA SOCIAL */}
                                <div className="w-[36px] min-w-[36px] max-w-[36px] bg-black/30 flex items-center justify-center shrink-0 border-r border-white/10 gap-0.5">
                                  {post.platforms.map((p) => {
                                    const isChannelActive = isChannelActiveForPost(p, post, channelToggles);
                                    return (
                                      <span 
                                        key={p} 
                                        className={`shrink-0 transition-opacity ${
                                          !isChannelActive ? 'opacity-30 grayscale' : isShared ? 'opacity-40 grayscale' : ''
                                        }`} 
                                        title={`${p} ${!isChannelActive ? '(IN PAUSA)' : isShared ? '(CONDIVISO)' : '(ATTIVO)'}`}
                                      >
                                        {p === 'tiktok' && <TikTokIcon className="w-3 h-3 text-white" />}
                                        {p === 'google' && <GoogleIcon className="w-3 h-3" />}
                                        {p === 'instagram' && <InstagramIcon className="w-3 h-3" />}
                                        {p === 'facebook' && <FacebookIcon className="w-3 h-3" />}
                                      </span>
                                    );
                                  })}
                                </div>

                                {/* 3° SCOMPARTO: BRAND & SIGLA FORMATO */}
                                <div className={`w-[42px] min-w-[42px] max-w-[42px] flex items-center justify-center gap-0.5 shrink-0 border-r border-white/10 font-black text-[9px] uppercase leading-none ${
                                  isShared ? 'bg-slate-800 text-slate-400 border-slate-700 font-bold' : badgeStyle
                                }`}>
                                  <span className={`text-[9.5px] leading-none ${isShared ? 'grayscale opacity-70' : ''}`}>{brandEmoji}</span>
                                  <span className="leading-none">{formatCode}</span>
                                </div>

                                {/* 4° SCOMPARTO: TIPO */}
                                <div className={`w-[38px] min-w-[38px] max-w-[38px] flex items-center justify-center shrink-0 border-r border-white/10 text-[7.5px] font-black uppercase leading-none ${
                                  isShared ? 'bg-slate-800/80 text-slate-400' : contentType.style
                                }`}>
                                  {contentType.label}
                                </div>

                                {/* 5° SCOMPARTO: STATISTICHE / STATO */}
                                <div className="flex-1 min-w-0 flex items-center justify-center bg-black/20 font-mono font-bold text-[9px] tracking-tight">
                                  <span className={isShared ? 'text-slate-400' : 'text-slate-500'}>
                                    {isPublished ? '✓ COND' : statPercent}
                                  </span>
                                </div>
                              </div>

                              {/* 🔴 TIMELINE ATTUALE */}
                              {shouldShowTimelineAfter && renderTimelineBar()}
                            </React.Fragment>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* MODAL: + NUOVO BLOCCHETTO RAPIDO */}
      {showAddBlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-amber-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAddBlockModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Aggiungi Blocchetto allo Scheduler</h3>
                <p className="text-xs text-amber-300">Giorno: {addBlockDay} {MONTH_NAMES.IT[month]} {year}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Brand Choice */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Brand:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setNewBlockBrand('pizza'); setNewBlockFormat('P1'); }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition ${
                      newBlockBrand === 'pizza' ? 'bg-rose-950/60 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>🍕 Pizzeria Ranong</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewBlockBrand('village'); setNewBlockFormat('LM1'); }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition ${
                      newBlockBrand === 'village' ? 'bg-emerald-950/60 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>🏝️ Villaggio Koh Phayam</span>
                  </button>
                </div>
              </div>

              {/* Format Sigla */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sigla Formato:</label>
                <select
                  value={newBlockFormat}
                  onChange={(e) => setNewBlockFormat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {SCHEDULER_FORMAT_DEFINITIONS.filter(d => d.brand === newBlockBrand || d.brand === 'both').map(d => (
                    <option key={d.code} value={d.code}>
                      {d.emoji} {d.code} · {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Orario */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Orario di Lancio:</label>
                <input
                  type="time"
                  value={newBlockTime}
                  onChange={(e) => setNewBlockTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Titolo / Oggetto */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Titolo / Argomento:</label>
                <input
                  type="text"
                  value={newBlockTitle}
                  onChange={(e) => setNewBlockTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Es. Pizza Margherita, Red Bungalow, ecc."
                />
              </div>

              {/* Piattaforme */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Canali di Destinazione:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['instagram', 'facebook', 'tiktok', 'google'] as SocialPlatform[]).map(plat => (
                    <label key={plat} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBlockPlatforms.includes(plat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewBlockPlatforms(prev => [...prev, plat]);
                          } else {
                            setNewBlockPlatforms(prev => prev.filter(p => p !== plat));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="capitalize font-semibold text-slate-200">{plat}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveNewBlock}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition"
              >
                Salva Blocchetto
              </button>
              <button
                type="button"
                onClick={() => setShowAddBlockModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POST INSPECTOR & LIVE MOCKUP */}
      {inspectingPost && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#121826] border border-slate-700/80 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative my-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setInspectingPost(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            >
              &times;
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-rose-600 flex items-center justify-center shadow-md">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>{inspectingPost.title}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getFormatBadgeStyle(getFormatCode(inspectingPost))}`}>
                    {getFormatCode(inspectingPost)}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(inspectingPost.scheduled_for).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} alle ore {new Date(inspectingPost.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Layout a 2 Colonne */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Colonna Sinistra: Player / Mockup (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                
                {/* Platform Switcher */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-3 w-full justify-center">
                  {(['tiktok', 'instagram', 'facebook', 'google'] as SocialPlatform[]).map(plat => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setInspectPreviewPlatform(plat)}
                      className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                        inspectPreviewPlatform === plat ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {plat === 'tiktok' && <TikTokIcon className="w-3 h-3 text-white" />}
                      {plat === 'instagram' && <InstagramIcon className="w-3 h-3" />}
                      {plat === 'facebook' && <FacebookIcon className="w-3 h-3" />}
                      {plat === 'google' && <GoogleIcon className="w-3 h-3" />}
                      <span>{plat}</span>
                    </button>
                  ))}
                </div>

                {/* Smartphone Preview */}
                <div className="w-[260px] h-[460px] bg-black rounded-[32px] border-[4px] border-slate-700 shadow-2xl relative overflow-hidden flex flex-col select-none">
                  <AutoCutReelPlayer
                    imageUrl={inspectingPost.media_url}
                    slides={inspectingPost.slides}
                    trajectory={inspectingPost.camera_trajectory || 'pan_left_to_right'}
                    audioSrc={inspectingPost.audio_track_src}
                    audioTitle={inspectingPost.audio_track_name}
                    titleTh={inspectingPost.title_th}
                    titleEn={inspectingPost.title_en}
                    badge={inspectingPost.badge}
                    price={inspectingPost.price}
                    platform={inspectPreviewPlatform as any}
                    caption={inspectingPost.caption}
                    brand={inspectingPost.brand}
                    autoPlay={true}
                  />
                </div>
              </div>

              {/* Colonna Destra: Modifica Dati & Copy (7 cols) */}
              <div className="lg:col-span-7 space-y-3.5 text-xs">
                
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Titolo:</label>
                  <input
                    type="text"
                    value={inspectingPost.title}
                    onChange={(e) => setInspectingPost({ ...inspectingPost, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Didascalia / Copy bilingue:</label>
                  <textarea
                    rows={6}
                    value={inspectingPost.caption}
                    onChange={(e) => setInspectingPost({ ...inspectingPost, caption: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-sans leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Piattaforme Attive:</label>
                  <div className="flex items-center gap-2">
                    {(['instagram', 'facebook', 'tiktok', 'google'] as SocialPlatform[]).map(plat => (
                      <span 
                        key={plat}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 ${
                          inspectingPost.platforms.includes(plat)
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        {plat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={schedulerMode === 'standby'}
                    onClick={() => {
                      if (schedulerMode === 'standby') return;
                      // Filtra solo le piattaforme attive negli interruttori
                      const activePlatforms = inspectingPost.platforms.filter(p => isChannelActiveForPost(p, inspectingPost, channelToggles));
                      if (activePlatforms.length === 0) {
                        alert(uiLang === 'EN' 
                          ? 'All destination platforms for this post are currently paused. Please enable at least one channel in the top switches.' 
                          : 'Tutti i canali di destinazione di questo post sono attualmente disabilitati negli interruttori in alto. Abilita almeno un canale per pubblicare.');
                        return;
                      }
                      onPublishNow({
                        ...inspectingPost,
                        platforms: activePlatforms
                      });
                      setInspectingPost(null);
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      schedulerMode === 'standby'
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80 shadow-none'
                        : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg cursor-pointer'
                    }`}
                    title={
                      schedulerMode === 'standby'
                        ? 'Pubblicazione disabilitata: attiva lo stato "IN PRODUZIONE" in cima al calendario per inviare i post'
                        : 'Pubblica subito il post sui canali selezionati'
                    }
                  >
                    {schedulerMode === 'standby' ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <Send className="w-3.5 h-3.5" />}
                    <span>
                      {schedulerMode === 'standby'
                        ? (uiLang === 'EN' ? 'Publish Locked (Standby Mode)' : 'Pubblicazione Bloccata (In Standby)')
                        : (uiLang === 'EN' ? 'Publish Now' : 'Pubblica Subito')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus = inspectingPost.status === 'published' ? 'scheduled' : 'published';
                      const updated = { ...inspectingPost, status: nextStatus };
                      setInspectingPost(updated);
                      onUpdatePosts(scheduledPosts.map(p => p.id === updated.id ? updated : p));
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      inspectingPost.status === 'published'
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title={inspectingPost.status === 'published' ? 'Contrassegnato come Condiviso (clicca per reimpostare)' : 'Segna manualmente come già condiviso / inviato'}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${inspectingPost.status === 'published' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{inspectingPost.status === 'published' ? '✓ Condiviso' : 'Segna Condiviso'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveInspectingPost(inspectingPost)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Salva
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePost(inspectingPost.id)}
                    className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 transition"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
