import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, Plus, Sparkles, Trash2, Edit3, Send, CheckCircle, 
  Pizza, Palmtree, Film, Image as ImageIcon, ExternalLink,
  Filter, Zap, Play, Heart, MessageCircle, Bookmark, Globe, Search, Check, Share2, Music
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
  generateAutopilotCampaign 
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

export function SocialCalendarView({
  scheduledPosts,
  onUpdatePosts,
  onPublishNow,
  uiLang
}: SocialCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<BrandType | 'all'>('all');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  
  // Modals
  const [showAutopilotModal, setShowAutopilotModal] = useState(false);
  const [inspectingPost, setInspectingPost] = useState<ScheduledSocialPost | null>(null);
  const [inspectPreviewPlatform, setInspectPreviewPlatform] = useState<SocialPlatform>('tiktok');

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
    if (selectedBrandFilter !== 'all' && post.brand !== selectedBrandFilter) return false;
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

  // Run autopilot campaign generator (con opzione pulizia integrale)
  const handleRunAutopilot = () => {
    const newCampaign = generateAutopilotCampaign({
      brand: autopilotBrand,
      startDate: new Date(),
      weeksCount: autopilotWeeks,
      postsPerWeek: autopilotPostsPerWeek
    });

    onUpdatePosts(replaceExisting ? newCampaign : [...scheduledPosts, ...newCampaign]);
    setShowAutopilotModal(false);
  };

  const handleDeletePost = (id: string) => {
    onUpdatePosts(scheduledPosts.filter((p) => p.id !== id));
    if (inspectingPost?.id === id) setInspectingPost(null);
  };

  const handleSaveInspectingPost = (updated: ScheduledSocialPost) => {
    onUpdatePosts(scheduledPosts.map((p) => (p.id === updated.id ? updated : p)));
    setInspectingPost(null);
  };

  // Rigenerazione Totale con Motore AutoCut (Wipe & Replace sia Pizzeria che Villaggio)
  const handleRegenerateAllAutoCutCampaign = () => {
    const fullCampaign = generateFullAutoCutCampaign() as ScheduledSocialPost[];
    onUpdatePosts(fullCampaign);
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="space-y-6">
      
      {/* Top Calendar Toolbar */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
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

          <h2 className="text-lg font-bold text-white tracking-wide">
            {MONTH_NAMES[uiLang][month]} {year}
          </h2>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
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
              {uiLang === 'EN' ? 'All Brands' : 'Tutti'}
            </button>
            <button
              onClick={() => setSelectedBrandFilter('pizza')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedBrandFilter === 'pizza'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pizza className="w-3 h-3" />
              <span>Ranong</span>
            </button>
            <button
              onClick={() => setSelectedBrandFilter('village')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedBrandFilter === 'village'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palmtree className="w-3 h-3" />
              <span>Phayam</span>
            </button>
          </div>

          {/* Quick Total AutoCut Regenerate Button */}
          <button
            type="button"
            onClick={handleRegenerateAllAutoCutCampaign}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition"
            title="Rigenera l'intero palinsesto con il motore AutoCut 7.8s (MP3 + Pan & Scan)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{uiLang === 'EN' ? '⚡ Generate All AutoCut (Wipe & Replace)' : '⚡ Genera Tutto AutoCut (Pulisci & Sostituisci)'}</span>
          </button>

          {/* Autopilot Button (Key Feature!) */}
          <button
            onClick={() => setShowAutopilotModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{uiLang === 'EN' ? 'Custom Campaign' : 'Campagna Personalizzata'}</span>
          </button>
        </div>

      </div>

      {/* Calendar Grid View */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/90 text-center">
          {DAYS_OF_WEEK[uiLang].map((dayName, idx) => (
            <div key={idx} className="py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/80 bg-slate-950/60">
          
          {/* Empty cells before first day */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] bg-slate-950/40 p-2 opacity-30 select-none" />
          ))}

          {/* Days of the Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = isCurrentMonth && today.getDate() === dayNum;
            const dayPosts = postsByDay[dayNum] || [];

            return (
              <div 
                key={`day-${dayNum}`} 
                className={`min-h-[135px] p-2 flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/30' : 'hover:bg-slate-900/40'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
                  }`}>
                    {dayNum}
                  </span>

                  {dayPosts.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {dayPosts.length} {dayPosts.length === 1 ? 'post' : 'posts'}
                    </span>
                  )}
                </div>

                {/* Day Posts List */}
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[140px] pr-0.5">
                  {dayPosts.map((post) => {
                    const postTime = new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isPizza = post.brand === 'pizza';

                    return (
                      <div
                        key={post.id}
                        onClick={() => {
                          setInspectingPost(post);
                          setInspectPreviewPlatform(post.platforms[0] || 'tiktok');
                        }}
                        className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-2 shadow group ${
                          isPizza 
                            ? 'bg-rose-950/40 border-rose-800/50 hover:border-rose-500 text-rose-100'
                            : 'bg-emerald-950/40 border-emerald-800/50 hover:border-emerald-500 text-emerald-100'
                        }`}
                      >
                        {/* Media Thumbnail with AutoCut Reel Indicator */}
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-800 shrink-0 relative">
                          <img src={post.media_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play className="w-3 h-3 text-white fill-white drop-shadow" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[9px] text-slate-400">{postTime}</span>
                            <div className="flex items-center gap-0.5">
                              {post.platforms.map((p) => (
                                <span key={p} className="shrink-0">
                                  {p === 'tiktok' && <TikTokIcon className="w-2.5 h-2.5 text-white" />}
                                  {p === 'google' && <GoogleIcon className="w-2.5 h-2.5" />}
                                  {p === 'instagram' && <InstagramIcon className="w-2.5 h-2.5" />}
                                  {p === 'facebook' && <FacebookIcon className="w-2.5 h-2.5" />}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] font-bold truncate leading-tight mt-0.5 text-white">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {post.slides && post.slides.length > 1 ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 text-[8px] font-mono font-bold border border-amber-500/40">
                                ⚡ AutoCut {post.slides.length} Scene
                              </span>
                            ) : (
                              <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-mono font-bold">
                                🎬 7.8s
                              </span>
                            )}
                            {post.audio_track_name && (
                              <span className="text-[8px] text-slate-400 font-mono truncate max-w-[90px]">
                                🎵 {post.audio_track_name.split('(')[0]}
                              </span>
                            )}
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

      {/* MODAL: Autopilot Campaign Generator Setup */}
      {showAutopilotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAutopilotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {uiLang === 'EN' ? 'Autopilot Content Campaign' : 'Generatore Pilota Automatico'}
                </h3>
                <p className="text-xs text-amber-300">
                  {uiLang === 'EN' ? 'Auto-schedules real dishes & rooms from your website' : 'Pianifica in automatico piatti del menu e alloggi del villaggio'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 my-4">
              
              {/* Brand Choice */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">
                  {uiLang === 'EN' ? 'Target Brand:' : 'Brand di Destinazione:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAutopilotBrand('pizza')}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-semibold transition ${
                      autopilotBrand === 'pizza'
                        ? 'bg-rose-950/40 border-rose-500 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Pizza className="w-4 h-4 text-rose-400" />
                    <div className="text-left">
                      <p className="text-xs">Flower Power Pizza</p>
                      <p className="text-[10px] text-slate-500 font-normal">Pizzeria Ranong</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutopilotBrand('village')}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-semibold transition ${
                      autopilotBrand === 'village'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Palmtree className="w-4 h-4 text-emerald-400" />
                    <div className="text-left">
                      <p className="text-xs">Farm Village & Spa</p>
                      <p className="text-[10px] text-slate-500 font-normal">Koh Phayam Island</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Weeks Count & Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">
                    {uiLang === 'EN' ? 'Campaign Duration:' : 'Durata Campagna:'}
                  </label>
                  <select
                    value={autopilotWeeks}
                    onChange={(e) => setAutopilotWeeks(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={2}>{uiLang === 'EN' ? '2 Weeks (Sprint)' : '2 Settimane'}</option>
                    <option value={4}>{uiLang === 'EN' ? '4 Weeks (Full Month)' : '4 Settimane (1 Mese)'}</option>
                    <option value={8}>{uiLang === 'EN' ? '8 Weeks (Season Plan)' : '8 Settimane (Stagione)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">
                    {uiLang === 'EN' ? 'Frequency:' : 'Frequenza Post:'}
                  </label>
                  <select
                    value={autopilotPostsPerWeek}
                    onChange={(e) => setAutopilotPostsPerWeek(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={2}>2 post / week (Pranzo & Cena)</option>
                    <option value={3}>3 post / week (Consigliato)</option>
                    <option value={5}>5 post / week (Alta Visibilità)</option>
                  </select>
                </div>
              </div>

              {/* Explanatory Banner */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] leading-relaxed text-slate-300 space-y-1">
                <p className="font-semibold text-amber-300">
                  {uiLang === 'EN' ? 'How Autopilot Works:' : 'Cosa Farà il Pilota Automatico:'}
                </p>
                <p>
                  {autopilotBrand === 'pizza'
                    ? (uiLang === 'EN' 
                        ? '1. Selects authentic dishes from menuData.ts without repetitions.\n2. Writes certified Italian & English copywriting for TikTok, Reels, Facebook and Google Maps.\n3. Sets optimal lunch (11:30) and dinner (17:45) publishing times.'
                        : '1. Seleziona piatti autentici dal catalogo menuData.ts senza ripetizioni.\n2. Compone testi dedicati per TikTok, Instagram Reels, Facebook e Google Maps.\n3. Pianifica negli orari migliori per la ristorazione (11:30 e 17:45).')
                    : (uiLang === 'EN'
                        ? '1. Highlights Jungle Villas, Eco-Bungalows, and Sunset experiences on Koh Phayam.\n2. Formats posts with direct Book Room links for Google Maps and Meta.'
                        : '1. Valorizza Ville tropicali, Bungalow e tramonti di Koh Phayam.\n2. Inserisce i link diretti per la prenotazione su Google Maps e Meta.')
                  }
                </p>
              </div>

              {/* Wipe & Replace Toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <div className="text-left">
                  <p className="text-xs text-white font-bold">
                    {uiLang === 'EN' ? 'Wipe & Replace (Clean Slate)' : 'Pulizia Totale & Sostituzione'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {uiLang === 'EN'
                      ? 'Removes all old posts and replaces them with new AutoCut 7.8s Motion + MP3 Audio.'
                      : 'Elimina tutti i vecchi post e li sostituisce con il nuovo motore AutoCut + MP3 Audio.'}
                  </p>
                </div>
              </label>

            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleRunAutopilot}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {uiLang === 'EN' 
                    ? `Generate ${autopilotWeeks * autopilotPostsPerWeek} Scheduled Posts` 
                    : `Genera ${autopilotWeeks * autopilotPostsPerWeek} Post Programmati`
                  }
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowAutopilotModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {uiLang === 'EN' ? 'Cancel' : 'Annulla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Definitive High-Fidelity Live Preview & Editor */}
      {inspectingPost && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#121826] border border-slate-700/80 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  inspectingPost.brand === 'pizza' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {inspectingPost.brand === 'pizza' ? <Pizza className="w-3.5 h-3.5" /> : <Palmtree className="w-3.5 h-3.5" />}
                  <span>{inspectingPost.brand === 'pizza' ? 'Flower Power Pizza Ranong' : 'Flower Power Farm Village'}</span>
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {uiLang === 'EN' ? 'Definitive Post Preview' : 'Anteprima Definitiva Post'}
                </span>
              </div>

              <button
                onClick={() => setInspectingPost(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800 transition leading-none"
              >
                &times;
              </button>
            </div>

            {/* 2-Column Responsive Layout: Left Live Mockup vs Right Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Full-Fidelity Interactive Platform Mockup (6 cols) */}
              <div className="lg:col-span-6 flex flex-col items-center">
                
                {/* Platform Preview Selector Bar */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-3 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => setInspectPreviewPlatform('tiktok')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                      inspectPreviewPlatform === 'tiktok'
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TikTokIcon className="w-3.5 h-3.5 text-white" />
                    <span>TikTok</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectPreviewPlatform('instagram')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                      inspectPreviewPlatform === 'instagram'
                        ? 'bg-pink-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectPreviewPlatform('facebook')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                      inspectPreviewPlatform === 'facebook'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectPreviewPlatform('google')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                      inspectPreviewPlatform === 'google'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span>Google</span>
                  </button>
                </div>

                {/* Smartphone / Post Mockup Frame */}
                <div className="w-[285px] h-[520px] bg-black rounded-[38px] border-[5px] border-slate-700 shadow-2xl relative overflow-hidden flex flex-col select-none ring-1 ring-white/10">
                  
                  {/* Speaker Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2"></div>
                    <div className="w-7 h-1 bg-slate-800 rounded-full"></div>
                  </div>

                  {/* Main Media Background - AutoCut Reel Player Dinamico 7.8s con Pan & Scan & Audio MP3 */}
                  <div className="w-full h-full relative bg-slate-950 flex items-center justify-center overflow-hidden">
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

                    {/* TIKTOK 9:16 LIVE OVERLAY */}
                    {inspectPreviewPlatform === 'tiktok' && (
                      <div className="absolute inset-0 flex flex-col justify-between p-3 pt-7 text-white pointer-events-none">
                        
                        {/* Top bar */}
                        <div className="flex items-center justify-between text-xs font-bold px-1 pt-1">
                          <span className="text-white/60">Live</span>
                          <div className="flex items-center gap-2.5">
                            <span className="text-white/60">Following</span>
                            <span className="text-white border-b-2 border-white pb-0.5">For You</span>
                          </div>
                          <Search className="w-3.5 h-3.5 text-white/70" />
                        </div>

                        {/* Right Action Icons Column */}
                        <div className="absolute right-2 bottom-14 flex flex-col items-center gap-3 text-center">
                          <div className="relative mb-0.5">
                            <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-rose-600 flex items-center justify-center text-xs font-bold">
                              {inspectingPost.brand === 'pizza' ? 'FP' : 'FV'}
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">
                              +
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-rose-500">
                              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                            </div>
                            <span className="text-[9px] font-semibold mt-0.5">14.2K</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                              <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[9px] font-semibold mt-0.5">328</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                              <Bookmark className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[9px] font-semibold mt-0.5">1.9K</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                              <Share2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[9px] font-semibold mt-0.5">912</span>
                          </div>

                          <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center animate-spin">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                          </div>
                        </div>

                        {/* Bottom Caption & Audio */}
                        <div className="w-[78%] pb-1 space-y-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">
                              {inspectingPost.brand === 'pizza' ? '@flowerpowerpizza' : '@flowerpowervillage'}
                            </span>
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          </div>

                          <p className="text-[11px] text-white/95 line-clamp-3 leading-snug drop-shadow-md">
                            {inspectingPost.caption}
                          </p>

                          <div className="flex items-center gap-1.5 text-[9px] text-white/80 pt-0.5 font-medium truncate">
                            <TikTokIcon className="w-3 h-3 text-white shrink-0" />
                            <span className="truncate">
                              {inspectingPost.brand === 'pizza' ? 'Original Sound · Flower Power Ranong' : 'Original Sound · Koh Phayam Island'}
                            </span>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* INSTAGRAM REEL LIVE OVERLAY */}
                    {inspectPreviewPlatform === 'instagram' && (
                      <div className="absolute inset-0 flex flex-col justify-between p-3.5 pt-8 text-white pointer-events-none">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <InstagramIcon className="w-4 h-4" />
                            <span>Reels</span>
                          </span>
                          <InstagramIcon className="w-4 h-4" />
                        </div>

                        <div className="space-y-1.5 pb-2 text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center text-[10px] font-bold">
                              {inspectingPost.brand === 'pizza' ? 'FP' : 'FV'}
                            </div>
                            <span className="text-xs font-semibold">
                              {inspectingPost.brand === 'pizza' ? 'flowerpowerpizza' : 'flowerpowerfarmvillage'}
                            </span>
                            <span className="text-[9px] border border-white/60 px-2 py-0.5 rounded font-medium">Follow</span>
                          </div>
                          <p className="text-[11px] line-clamp-3 text-white/95 drop-shadow">
                            {inspectingPost.caption}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FACEBOOK FEED LIVE OVERLAY */}
                    {inspectPreviewPlatform === 'facebook' && (
                      <div className="absolute inset-0 bg-slate-900 text-white flex flex-col justify-between p-3 pt-8 overflow-y-auto">
                        <div className="space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <FacebookIcon className="w-7 h-7 shrink-0" />
                            <div>
                              <div className="text-xs font-bold leading-tight">
                                {inspectingPost.brand === 'pizza' ? 'Flower Power Pizza Ranong' : 'Flower Power Farm Village & Spa'}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <span>1 min ·</span>
                                <Globe className="w-2.5 h-2.5 inline" />
                                <span>Public</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                            {inspectingPost.caption}
                          </p>
                        </div>

                        <div className="h-40 rounded-lg overflow-hidden bg-black my-2 border border-slate-800">
                          <img src={inspectingPost.media_url} alt="" className="w-full h-full object-cover" />
                        </div>

                        <div className="border-t border-slate-800 pt-1.5 flex items-center justify-around text-slate-400 text-[10px] font-semibold">
                          <span>Like</span>
                          <span>Comment</span>
                          <span>Share</span>
                        </div>
                      </div>
                    )}

                    {/* GOOGLE MAPS LOCAL POST LIVE OVERLAY */}
                    {inspectPreviewPlatform === 'google' && (
                      <div className="absolute inset-0 bg-[#202124] text-white flex flex-col justify-between p-3.5 pt-8 text-left">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center p-1 shrink-0">
                              <GoogleIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                                <span>{inspectingPost.brand === 'pizza' ? 'Flower Power Pizza - Ranong' : 'Flower Power Farm Village & Spa'}</span>
                                <CheckCircle className="w-3 h-3 text-blue-400 shrink-0" />
                              </div>
                              <div className="text-[9px] text-slate-400">Google Maps · Local Post</div>
                            </div>
                          </div>

                          <div className="h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
                            <img src={inspectingPost.media_url} alt="" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-[8px] text-white font-mono">
                              GOOGLE MAPS & SEARCH
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-200 line-clamp-3 leading-relaxed">
                            {inspectingPost.caption}
                          </p>
                        </div>

                        <div className="pt-2">
                          <div className="w-full py-2 px-3 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow">
                            <span>{inspectingPost.cta_label || (inspectingPost.brand === 'pizza' ? 'ORDER ONLINE' : 'BOOK ROOM')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Bottom Home Indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full z-20"></div>
                </div>

                <span className="text-[10px] text-slate-500 mt-2 text-center">
                  {uiLang === 'EN' ? 'Interactive live preview updating in real-time as you type' : 'Anteprima dinamica aggiornata in tempo reale durante la scrittura'}
                </span>
              </div>

              {/* RIGHT COLUMN: Post Editor & Publishing Controls (6 cols) */}
              <div className="lg:col-span-6 space-y-4 text-xs text-slate-300 text-left">
                
                {/* Title */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {uiLang === 'EN' ? 'Campaign / Dish Title:' : 'Titolo Piatto / Campagna:'}
                  </label>
                  <input
                    type="text"
                    value={inspectingPost.title}
                    onChange={(e) => setInspectingPost({ ...inspectingPost, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Scheduled Date & Time */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{uiLang === 'EN' ? 'Scheduled Slot:' : 'Orario di Pubblicazione:'}</span>
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {new Date(inspectingPost.scheduled_for).toLocaleString([], { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {uiLang === 'EN' 
                      ? 'Optimal high-engagement slot chosen automatically for hospitality.' 
                      : 'Slot ottimale ad alta interazione selezionato automaticamente.'
                    }
                  </p>
                </div>

                {/* 🎵 Audio Suite MP3 & AutoCut 7.8s Badge */}
                {inspectingPost.audio_track_name && (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-200 flex items-center justify-between gap-2 shadow-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">{inspectingPost.audio_track_name}</p>
                        <p className="text-[10px] text-purple-300/80 truncate">
                          AutoCut 7.8s • {inspectingPost.camera_trajectory || 'Pan Cinematic'} • {inspectingPost.overlay_atmosphere || 'Naturale'}
                        </p>
                      </div>
                    </div>
                    {inspectingPost.audio_track_src && (
                      <button
                        type="button"
                        onClick={() => {
                          const a = new Audio(inspectingPost.audio_track_src);
                          a.play().catch(e => console.log('Audio playback info:', e));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow transition shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Ascolta MP3</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Target Platforms Toggle */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">
                    {uiLang === 'EN' ? 'Target Destination Channels:' : 'Canali di Destinazione:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['tiktok', 'google', 'instagram', 'facebook'] as SocialPlatform[]).map((plat) => {
                      const isSelected = inspectingPost.platforms.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => {
                            const newPlats = isSelected 
                              ? inspectingPost.platforms.filter((p) => p !== plat)
                              : [...inspectingPost.platforms, plat];
                            setInspectingPost({ ...inspectingPost, platforms: newPlats });
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition ${
                            isSelected 
                              ? 'bg-slate-800 border-indigo-500 text-white shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {plat === 'tiktok' && <TikTokIcon className="w-3.5 h-3.5 text-white" />}
                          {plat === 'google' && <GoogleIcon className="w-3.5 h-3.5" />}
                          {plat === 'instagram' && <InstagramIcon className="w-3.5 h-3.5" />}
                          {plat === 'facebook' && <FacebookIcon className="w-3.5 h-3.5" />}
                          <span className="capitalize">{plat === 'google' ? 'Google Maps' : plat}</span>
                          {isSelected && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Caption Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">
                      {uiLang === 'EN' ? 'Caption & Hashtags:' : 'Testo & Hashtag del Post:'}
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {inspectingPost.caption.length} / 2200
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={inspectingPost.caption}
                    onChange={(e) => setInspectingPost({ ...inspectingPost, caption: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
                    placeholder="Write caption here..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onPublishNow(inspectingPost);
                      setInspectingPost(null);
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{uiLang === 'EN' ? 'Publish Now to Channels' : 'Pubblica Subito sui Canali'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveInspectingPost(inspectingPost)}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    {uiLang === 'EN' ? 'Save Changes' : 'Salva Modifiche'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePost(inspectingPost.id)}
                    className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 transition shrink-0"
                    title={uiLang === 'EN' ? 'Delete Post' : 'Elimina dalla Programmazione'}
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
