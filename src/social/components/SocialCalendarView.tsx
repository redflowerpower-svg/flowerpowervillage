import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, Plus, Sparkles, Trash2, Edit3, Send, CheckCircle, 
  Pizza, Palmtree, Film, Image as ImageIcon, ExternalLink,
  Filter, Zap, Play, Heart, MessageCircle, Bookmark, Globe, Search, Check, Share2, Music,
  BookOpen, ChevronDown, ChevronUp, Layers, Video, ShieldCheck, Flame
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

  // ⚡ CARICA LA ROUTINE QUOTIDIANA AUTOMATICA (6 Task Al Giorno per 30 Giorni)
  const handleLoadDailyRoutine = () => {
    const routinePosts: ScheduledSocialPost[] = [];
    const villageAssets = VILLAGE_SOCIAL_ASSETS;

    const pizzaMenuSample = [
      { id: 'margherita', name: 'Margherita Tradizionale', cat: 'PIZZE TRADIZIONALI', price: 180 },
      { id: 'diavola', name: 'Diavola Piccante', cat: 'PIZZE TRADIZIONALI', price: 230 },
      { id: 'quattro-formaggi', name: 'Quattro Formaggi Cremosa', cat: 'PIZZE TRADIZIONALI', price: 260 },
      { id: 'ravioli-walnut', name: 'Ravioli Artigianali al Tocco', cat: 'PASTE FRESCHE', price: 220 },
      { id: 'lasagna-bolognese', name: 'Lasagna Tradizionale al Forno', cat: 'DAILY SHOWCASE', price: 240 },
      { id: 'gnocchi-sorrentina', name: 'Gnocchi alla Sorrentina', cat: 'PASTE FRESCHE', price: 210 },
      { id: 'focaccia-farcita', name: 'Focaccia Ligure Farcita', cat: 'PIZZE & FOCACCE', price: 190 },
      { id: 'parmigiana', name: 'Parmigiana di Melanzane', cat: 'SECONDI PIATTI', price: 230 },
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDate = new Date(`${dateStr}T12:00:00Z`);
      const dayOfWeek = dayDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

      const villageAsset = villageAssets[(day - 1) % villageAssets.length];
      const pizzaItem = pizzaMenuSample[(day - 1) % pizzaMenuSample.length];
      const isAltCapCut = (day % 3 === 0);

      // 1. ORE 09:00 · 🏝️ LM1 Stories Last Minute Villaggio
      routinePosts.push({
        id: `routine_lm1_${day}`,
        brand: 'village',
        platforms: ['instagram', 'facebook', 'tiktok', 'google'],
        format: 'story',
        editorial_format: 'video_reel',
        scheduled_for: `${dateStr}T09:00:00.000Z`,
        title: `LM1 Available Tonight: ${villageAsset.name}`,
        caption: `🔥 AVAILABLE TONIGHT at Flower Power Village! ${villageAsset.name} available with direct booking discount.`,
        media_url: villageAsset.image,
        source_item_id: villageAsset.id,
        price: villageAsset.price,
        status: 'scheduled',
        tags: ['LM1', 'LastMinute', 'Stories', 'Resort'],
        cta_url: villageAsset.cta_url || 'https://flowerpowervillage.com',
        title_en: villageAsset.name,
        badge: '🔥 AVAILABLE TONIGHT'
      });

      // 2. ORE 11:30 · 🍕 Story Pranzo / Daily Showcase Pizzeria
      routinePosts.push({
        id: `routine_lunch_${day}`,
        brand: 'pizza',
        platforms: ['instagram', 'facebook'],
        format: 'story',
        editorial_format: 'video_reel',
        scheduled_for: `${dateStr}T11:30:00.000Z`,
        title: `DS Pranzo: ${pizzaItem.name}`,
        caption: `Pranzo fresco a Ranong! Consegna rapida in 30 min con ${pizzaItem.name}. #RanongDelivery`,
        media_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        source_item_id: pizzaItem.id,
        price: pizzaItem.price,
        status: 'scheduled',
        tags: ['DS', 'Pranzo', 'Stories', 'Pizza'],
        cta_url: 'https://flowerpowerpizza.com',
        title_en: pizzaItem.name,
        badge: '✨ FRESCO DI GIORNATA'
      });

      // 3. ORE 14:30 · 🏝️ Reel Alloggio / Tour Villaggio (Alternato con CC1 CapCut)
      routinePosts.push({
        id: `routine_village_reel_${day}`,
        brand: 'village',
        platforms: ['instagram', 'tiktok', 'facebook'],
        format: 'reel',
        editorial_format: 'video_reel',
        scheduled_for: `${dateStr}T14:30:00.000Z`,
        title: isAltCapCut ? `CC1 Filmato CapCut: Relax Koh Phayam` : `V2 Suite Tour: ${villageAsset.name}`,
        caption: isAltCapCut 
          ? `Momenti di pura pace a Koh Phayam Island. Amache, brezze tropicali e natura incontaminata. #KohPhayam` 
          : `Esplora ${villageAsset.name}. Suite ventilata nel cuore del giardino tropicale. #FlowerPowerVillage`,
        media_url: villageAsset.image,
        source_item_id: villageAsset.id,
        price: villageAsset.price,
        status: 'scheduled',
        tags: isAltCapCut ? ['CC1', 'CapCut', 'Reels'] : ['V2', 'SuiteTour', 'Reels'],
        cta_url: villageAsset.cta_url || 'https://flowerpowervillage.com',
        title_en: villageAsset.name,
        badge: isAltCapCut ? '🎬 CAPCUT CLIP' : '🌿 SUITE BREEZY TOUR'
      });

      // 4. ORE 17:00 · 🏝️ R1 Post nei Gruppi Facebook Koh Phayam
      routinePosts.push({
        id: `routine_r1_${day}`,
        brand: 'village',
        platforms: ['facebook'],
        format: 'feed',
        editorial_format: 'video_reel',
        scheduled_for: `${dateStr}T17:00:00.000Z`,
        title: `R1 Post Gruppi Phayam: Cena Italiana stasera!`,
        caption: `Stasera a Koh Phayam pizza artigianale italiana, pasta fresca e secondi caldi! Consegna al bungalow o cena nel giardino. WhatsApp: +66 82 284 3124.`,
        media_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        source_item_id: 'restaurant_dinner',
        price: 250,
        status: 'scheduled',
        tags: ['R1', 'GruppiPhayam', 'Dinner', 'Facebook'],
        cta_url: 'https://flowerpowerpizza.com',
        badge: '🛵 DELIVERY ISOLA'
      });

      // 5. ORE 17:45 · 🍕 Reel Pizza & Cucina Ranong (Serale)
      routinePosts.push({
        id: `routine_dinner_${day}`,
        brand: 'pizza',
        platforms: ['instagram', 'tiktok', 'facebook'],
        format: 'reel',
        editorial_format: 'video_reel',
        scheduled_for: `${dateStr}T17:45:00.000Z`,
        title: isAltCapCut ? `CC1 CapCut Clip: Pizzeria Forno` : `P1 Pizza Tradizionale: ${pizzaItem.name}`,
        caption: `Impasto a lievitazione naturale 48h, cornicione fragrante e ingredienti italiani DOP. Consegna a Ranong su flowerpowerpizza.com 🍕🛵💨`,
        media_url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800',
        source_item_id: pizzaItem.id,
        price: pizzaItem.price,
        status: 'scheduled',
        tags: isAltCapCut ? ['CC1', 'CapCut', 'Pizza'] : ['P1', 'PizzaReel', 'Ranong'],
        cta_url: 'https://flowerpowerpizza.com',
        title_en: pizzaItem.name,
        badge: isAltCapCut ? '🎬 CAPCUT FORNO' : '🍕 48H NATURAL PROOFING'
      });

      // 6. LUNEDÌ & VENERDÌ ORE 10:00 · 📍 Google Business Novità (4:3 Companion)
      if (dayOfWeek === 1 || dayOfWeek === 5) {
        routinePosts.push({
          id: `routine_google_${day}`,
          brand: (day % 2 === 0) ? 'pizza' : 'village',
          platforms: ['google'],
          format: 'google_post',
          editorial_format: 'static_post',
          scheduled_for: `${dateStr}T10:00:00.000Z`,
          title: `Google Novità 4:3: ${(day % 2 === 0) ? pizzaItem.name : villageAsset.name}`,
          caption: (day % 2 === 0)
            ? `Scopri l'autentica pizza italiana a Ranong con impasto a lenta lievitazione. Ordina subito online.`
            : `Prenota direttamente il tuo soggiorno ecologico a Koh Phayam al miglior prezzo garantito.`,
          media_url: (day % 2 === 0) ? 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800' : villageAsset.image,
          source_item_id: (day % 2 === 0) ? pizzaItem.id : villageAsset.id,
          status: 'scheduled',
          tags: ['Google', 'Novità', 'LocalSEO'],
          cta_url: (day % 2 === 0) ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com',
          badge: '📍 GOOGLE 4:3'
        });
      }
    }

    onUpdatePosts(routinePosts);
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
    if (post.platforms.includes('google')) return 'GOOG';
    return post.brand === 'pizza' ? 'P1' : 'V1';
  };

  const getFormatBadgeStyle = (code: string) => {
    switch (code) {
      case 'LM1': return 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50';
      case 'R1': return 'bg-blue-600/30 text-blue-300 border-blue-400/50';
      case 'CC1': return 'bg-purple-600/30 text-purple-300 border-purple-400/50';
      case 'P1': return 'bg-rose-600/30 text-rose-300 border-rose-400/50';
      case 'P2': return 'bg-amber-600/30 text-amber-300 border-amber-400/50';
      case 'P3': return 'bg-orange-600/30 text-orange-300 border-orange-400/50';
      case 'DS': return 'bg-yellow-600/30 text-yellow-300 border-yellow-400/50';
      case 'V1': return 'bg-teal-600/30 text-teal-300 border-teal-400/50';
      case 'V2': return 'bg-cyan-600/30 text-cyan-300 border-cyan-400/50';
      case 'V3': return 'bg-sky-600/30 text-sky-300 border-sky-400/50';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
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

      {/* Top Calendar Toolbar */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {uiLang === 'EN' ? 'Today' : 'Oggi'}
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
            {MONTH_NAMES[uiLang][month]} {year}
          </h2>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Brand Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setSelectedBrandFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedBrandFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {uiLang === 'EN' ? 'All' : 'Tutti'}
            </button>
            <button
              onClick={() => setSelectedBrandFilter('pizza')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedBrandFilter === 'pizza'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🍕 Pizza</span>
            </button>
            <button
              onClick={() => setSelectedBrandFilter('village')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedBrandFilter === 'village'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏝️ Village</span>
            </button>
            <button
              onClick={() => setSelectedBrandFilter('capcut')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedBrandFilter === 'capcut'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎬 CapCut CC1</span>
            </button>
          </div>

          {/* ⚡ PULSANTE CARICA ROUTINE QUOTIDIANA (6 Task al Giorno) */}
          <button
            type="button"
            onClick={handleLoadDailyRoutine}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-rose-950/50 transition cursor-pointer"
            title="Popola automaticamente il mese con la routine strategica concordata (09:00 LM1, 11:30 Pranzo, 14:30 Reel, 17:00 R1, 17:45 Cena, Google)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{uiLang === 'EN' ? '⚡ Load Daily Routine (6/Day)' : '⚡ Carica Routine Quotidiana (6/Giorno)'}</span>
          </button>

          {/* Reset / Clear */}
          <button
            type="button"
            onClick={() => onUpdatePosts([])}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold transition"
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
            const dayPosts = postsByDay[dayNum] || [];

            return (
              <div 
                key={`day-${dayNum}`} 
                className={`min-h-[160px] p-2 flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/30' : 'hover:bg-slate-900/40'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-850">
                  <span className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
                  }`}>
                    {dayNum}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                        {dayPosts.length}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenAddBlockModal(dayNum)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition"
                      title={`Aggiungi blocchetto al ${dayNum} ${MONTH_NAMES.IT[month]}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day Posts List (BLOCCHETTI COLORATI SNELLITI) */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[175px] pr-0.5 scrollbar-thin">
                  {dayPosts.map((post) => {
                    const postTime = new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const formatCode = getFormatCode(post);
                    const isPizza = post.brand === 'pizza';
                    const brandEmoji = post.tags?.includes('CC1') ? '🎬' : (isPizza ? '🍕' : '🏝️');
                    const badgeStyle = getFormatBadgeStyle(formatCode);
                    const blockBorder = getBlockBorderColor(post);

                    // Pulisci il titolo per renderlo snello e compatto
                    const shortTitle = post.title.replace(/^(P1|P2|P3|DS|V1|V2|V3|LM1|R1|CC1)\s*(Available Tonight:|\s*Reel\s*|\s*·\s*)?/i, '').trim();

                    return (
                      <div
                        key={post.id}
                        onClick={() => {
                          setInspectingPost(post);
                          setInspectPreviewPlatform(post.platforms[0] || 'tiktok');
                        }}
                        className={`px-2 py-1.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-between gap-1 shadow group select-none ${blockBorder}`}
                        title={`${post.title} · ${postTime}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs shrink-0">{brandEmoji}</span>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 ${badgeStyle}`}>
                            {formatCode}
                          </span>
                          <span className="text-[10px] font-bold text-slate-100 truncate leading-tight">
                            {shortTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-mono text-[9px] text-slate-400 font-semibold">{postTime}</span>
                          <div className="flex items-center gap-0.5">
                            {post.platforms.map((p) => (
                              <span key={p} className="shrink-0 opacity-80 group-hover:opacity-100">
                                {p === 'tiktok' && <TikTokIcon className="w-2.5 h-2.5 text-white" />}
                                {p === 'google' && <GoogleIcon className="w-2.5 h-2.5" />}
                                {p === 'instagram' && <InstagramIcon className="w-2.5 h-2.5" />}
                                {p === 'facebook' && <FacebookIcon className="w-2.5 h-2.5" />}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    onClick={() => {
                      onPublishNow(inspectingPost);
                      setInspectingPost(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Pubblica Subito</span>
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
