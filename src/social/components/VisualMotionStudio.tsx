import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CATALOG_PRESET_ITEMS, 
  THEMATIC_MARKETING_PRESETS, 
  VISUAL_COLLECTION_PRESETS,
  VisualCollectionPreset,
  VisualCatalogItem, 
  CarouselSlide, 
  buildCarouselSlides,
  analyzeVisualWithAI,
  VisualAIResponse,
  OmnichannelPlatform,
  PlatformAdaptation,
  buildOmnichannelAdaptations
} from '../services/visualMotionEngine';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Layers, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Check,
  Smartphone,
  Eye,
  Flame,
  CloudRain,
  Sunset,
  Palmtree,
  Pizza,
  Download,
  Video,
  Loader2,
  Wand2,
  RefreshCw,
  MapPin,
  ExternalLink,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Send,
  Star,
  ThumbsUp,
  Compass,
  Music,
  Volume2,
  VolumeX,
  Film,
  Search,
  Camera,
  MoreHorizontal,
  Plus
} from 'lucide-react';

export interface PostSchedulePayload {
  brand: 'pizza' | 'village';
  platforms: ('tiktok' | 'instagram' | 'facebook' | 'google')[];
  format: 'reel' | 'feed' | 'story' | 'google_post';
  title?: string;
  caption: string;
  mediaUrl: string;
  scheduledDate?: string;
  scheduledTime?: string;
  ctaUrl?: string;
  ctaLabel?: string;
}

export type CameraTrajectory = 
  | 'auto_cinematic'
  | 'pan_left_to_right'
  | 'pan_right_to_left'
  | 'tilt_top_to_bottom'
  | 'tilt_bottom_to_top'
  | 'push_in_focal'
  | 'diagonal_up_right'
  | 'diagonal_up_left';

export type OverlayAtmosphere = 
  | 'none'
  | 'auto_context'
  | 'light_streaks'
  | 'warm_steam'
  | 'tropical_sunbeams'
  | 'sparkle_stars'
  | 'abstract_bokeh'
  | 'floating_hearts';

interface VisualMotionStudioProps {
  onSchedulePost?: (postData: PostSchedulePayload | PostSchedulePayload[]) => void;
  uiLang?: 'IT' | 'EN';
}

/**
 * 🏰 Mappatura Rigorosa Pan & Scan Alloggi Villaggio (Website Assets)
 * Regola Ferrea:
 * - Le 4 sole traiettorie ammesse per garantire il 100% di visibilità della stanza:
 *   1. pan_left_to_right (↔️ SX ➔ DX)
 *   2. pan_right_to_left (↔️ DX ➔ SX)
 *   3. diagonal_up_right (↗️ Basso-SX ➔ Alto-DX)
 *   4. diagonal_up_left (↖️ Basso-DX ➔ Alto-SX)
 * - Ciascun alloggio ha la propria traiettoria di partenza differenziata e univoca.
 */
export const VILLAGE_WEBSITE_TRAJECTORIES: CameraTrajectory[] = [
  'pan_left_to_right',
  'pan_right_to_left',
  'diagonal_up_right',
  'diagonal_up_left'
];

export function getVillageAccommodationTrajectory(itemId: string, stepIndex = 0): CameraTrajectory {
  const KNOWN_LODGING_OFFSETS: Record<string, number> = {
    'villa-penthouse-panoramic': 0, // ↔️ Pan SX ➔ DX
    'red-bungalow-tropical': 1,     // ↔️ Pan DX ➔ SX
    'yellow-bungalow-oasis': 2,     // ↗️ Diagonale Basso-SX ➔ Alto-DX
    'bamboo-bungalow-nature': 3,    // ↖️ Diagonale Basso-DX ➔ Alto-SX
  };

  let offset = KNOWN_LODGING_OFFSETS[itemId];
  if (offset === undefined) {
    let hash = 0;
    for (let i = 0; i < itemId.length; i++) {
      hash = (hash << 5) - hash + itemId.charCodeAt(i);
      hash |= 0;
    }
    offset = Math.abs(hash) % VILLAGE_WEBSITE_TRAJECTORIES.length;
  }

  const idx = (offset + stepIndex) % VILLAGE_WEBSITE_TRAJECTORIES.length;
  return VILLAGE_WEBSITE_TRAJECTORIES[idx];
}

/**
 * 🖋️ Suddivisione Semantica Intelligente delle Righe per Canvas e UI
 * Rispetta rigorosamente:
 * 1. Punteggiatura forte (due punti ':', trattino '—', bullet '•') spezzando a capo pulito
 * 2. Connettori logici (' & ', ' WITH ', ' CON ', ' พร้อม ', ' และ ', ' สไตล์ ', ' สูตร ')
 * 3. Segmentazione Thai sicura (Intl.Segmenter) per non spezzare mai le parole a metà
 * 4. Zero parole orfane isolate a fine riga
 */
export function formatSemanticLines(
  text: string,
  ctx?: CanvasRenderingContext2D | null,
  maxWidth?: number
): string[] {
  if (!text) return [];

  // Spezza su eventuali newline già presenti
  const paragraphs = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const finalLines: string[] = [];

  for (const para of paragraphs) {
    // Se c'è un due punti ':', spezza rigorosamente dietro i due punti
    // Esempio: "I Re dello Street Food: Burger & Focacce" -> ["I Re dello Street Food:", "Burger & Focacce"]
    if (para.includes(':')) {
      const parts = para.split(':');
      const first = parts[0].trim() + ':';
      const rest = parts.slice(1).join(':').trim();
      if (first) processSegment(first);
      if (rest) processSegment(rest);
      continue;
    }

    processSegment(para);
  }

  function processSegment(segment: string) {
    if (!segment) return;

    // Se non c'è canvas context o maxWidth (es. rendering HTML):
    if (!ctx || !maxWidth) {
      // Se il segmento è lungo (> 24 caratteri) e ha un connettore evidente, spezziamo sul connettore
      const connectorRegex = /([\s]+(?:&|WITH|CON|พร้อม|และ|สไตล์|สูตร)[\s]+)/i;
      if (segment.length > 24 && connectorRegex.test(segment)) {
        const parts = segment.split(connectorRegex);
        if (parts.length >= 3) {
          finalLines.push(parts[0].trim());
          finalLines.push((parts[1].trim() + ' ' + parts.slice(2).join('').trim()).trim());
          return;
        }
      }
      finalLines.push(segment);
      return;
    }

    // Se c'è canvas context e maxWidth:
    // Se sta già comodamente dentro maxWidth, teniamolo intero!
    if (ctx.measureText(segment).width <= maxWidth) {
      finalLines.push(segment);
      return;
    }

    // Se supera maxWidth, cerchiamo anzitutto una divisione naturale su connettori o trattini
    const connectorRegex = /([\s]+(?:&|WITH|CON|พร้อม|และ|สไตล์|สูตร|—|–)[\s]+)/i;
    if (connectorRegex.test(segment)) {
      const parts = segment.split(connectorRegex);
      let left = '';
      let right = '';
      for (let i = 0; i < parts.length; i++) {
        const candidate = left ? left + parts[i] : parts[i];
        if (ctx.measureText(candidate.trim()).width <= maxWidth && i < parts.length - 1) {
          left = candidate;
        } else {
          right = parts.slice(i).join('');
          break;
        }
      }
      if (left && right) {
        finalLines.push(left.trim());
        processSegment(right.trim());
        return;
      }
    }

    // Altrimenti spezziamo sulle parole senza spezzare le sillabe Thai
    const words = splitWords(segment);
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        finalLines.push(currentLine.trim());
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      finalLines.push(currentLine.trim());
    }
  }

  function splitWords(str: string): string[] {
    if (str.includes(' ')) {
      return str.split(/\s+/).filter(Boolean);
    }
    // Thai senza spazi: usiamo Intl.Segmenter se disponibile nel browser
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      try {
        const segmenter = new (Intl as any).Segmenter('th', { granularity: 'word' });
        const segs = Array.from(segmenter.segment(str)).map((s: any) => s.segment);
        const grouped: string[] = [];
        let buff = '';
        for (const s of segs) {
          buff += s;
          if (buff.length >= 6) {
            grouped.push(buff);
            buff = '';
          }
        }
        if (buff) grouped.push(buff);
        return grouped.length > 0 ? grouped : [str];
      } catch {
        return [str];
      }
    }
    return [str];
  }

  return finalLines;
}

// 🎵 Suite Jingle Ufficiale Flower Power Pizza (5 Tagli R&B Soul Proprietari)
export interface JingleTrackOption {
  id: string;
  code: string;
  title: string;
  part: string;
  tagline: string;
  badge: string;
  duration: string;
  src: string;
}

export const JINGLE_TRACKS: JingleTrackOption[] = [
  {
    id: 'yeah',
    code: '01',
    title: 'Yeah!',
    part: 'Parte 1',
    tagline: 'Hook essenziale e intro universale ad alto impatto ritmico',
    badge: '🔥 Hook 13s',
    duration: '13.0s',
    src: '/audio/01-flower-power-yeah.mp3'
  },
  {
    id: 'so_good',
    code: '02',
    title: 'So Good',
    part: 'Parte 2',
    tagline: 'Claim del gusto goloso per pizze fumanti e primi piani',
    badge: '😋 Taste 13s',
    duration: '13.0s',
    src: '/audio/02-flower-power-so-good.mp3'
  },
  {
    id: 'ranong',
    code: '03',
    title: 'Ranong',
    part: 'Parte 3',
    tagline: 'Geolocalizzazione forte per Ranong locals, turisti e delivery',
    badge: '📍 Ranong 13s',
    duration: '13.0s',
    src: '/audio/03-flower-power-ranong.mp3'
  },
  {
    id: 'aroi_mak_mak',
    code: '04',
    title: 'Aroi Mak Mak',
    part: 'Parte 4',
    tagline: 'Slang Thai virale (อร่อยมากๆ) per TikTok e pubblico thailandese',
    badge: '🇹🇭 Thai 13s',
    duration: '13.0s',
    src: '/audio/04-flower-power-aroi-mak-mak.mp3'
  },
  {
    id: 'full',
    code: '00',
    title: 'Full Jingle',
    part: 'Completa',
    tagline: 'Sigla R&B completa con tutte le 4 sezioni montate e outro',
    badge: '🎵 Full 28s',
    duration: '27.8s',
    src: '/audio/00-flower-power-jingle-full.mp3'
  }
];

// 🌺 Suite Sonora Ufficiale Flower Power Village (11 Brani Koh Phayam Vibes)
export const VILLAGE_AUDIO_TRACKS: JingleTrackOption[] = [
  {
    id: 'village_01',
    code: '01',
    title: 'Island Disco Paradise',
    part: 'Disco Funk Anni 70',
    tagline: 'Solare, energico e retrò con fiati e basso funk',
    badge: '🪩 Disco 26s',
    duration: '25.7s',
    src: '/audio/village/01%20Flower%20Power%20Village%20-%20Island%20Disco%20Paradise%20(Disco%20Funk).mp3'
  },
  {
    id: 'village_02',
    code: '02',
    title: 'Island Funk Groove',
    part: 'Tropical Funk Pop',
    tagline: 'Groovy e festoso per aperitivi al tramonto e social',
    badge: '🌴 Funk 31s',
    duration: '31.0s',
    src: '/audio/village/02%20Flower%20Power%20Village%20-%20Island%20Funk%20Groove%20(Tropical%20Funk).mp3'
  },
  {
    id: 'village_03',
    code: '03',
    title: 'Phayam Island Groove',
    part: 'Island Disco Pop',
    tagline: 'Atmosfera tropicale e festosa per piscina e cocktail',
    badge: '🌺 Pop 26s',
    duration: '25.6s',
    src: '/audio/village/03%20Flower%20Power%20Village%20-%20Phayam%20Island%20Groove%20(Island%20Disco).mp3'
  },
  {
    id: 'village_04',
    code: '04',
    title: 'Island Vibes & Sun',
    part: 'Reggae Island Pop',
    tagline: 'Solare, rilassante e spensierato per spiagge e sole',
    badge: '🌺 Reggae 31s',
    duration: '31.0s',
    src: '/audio/village/04%20Flower%20Power%20Village%20-%20Island%20Vibes%20&%20Golden%20Sun%20(Reggae%20Pop).mp3'
  },
  {
    id: 'village_05',
    code: '05',
    title: 'Sunshine Riddim',
    part: 'Reggae Roots',
    tagline: 'Riddim rilassato con chitarra skank e organo',
    badge: '🏝️ Roots 31s',
    duration: '31.0s',
    src: '/audio/village/05%20Flower%20Power%20Village%20-%20Island%20Sunshine%20Riddim%20(Reggae%20Roots).mp3'
  },
  {
    id: 'village_06',
    code: '06',
    title: 'Phayam Paradise Vibes',
    part: 'Island Reggae',
    tagline: 'Vibes tropicali e spensierate per amache e natura',
    badge: '🏝️ Reggae 31s',
    duration: '31.0s',
    src: '/audio/village/06%20Flower%20Power%20Village%20-%20Koh%20Phayam%20Paradise%20Vibes%20(Island%20Reggae).mp3'
  },
  {
    id: 'village_07',
    code: '07',
    title: 'Tropical Escape',
    part: 'Tropical Reggae',
    tagline: 'Ritmo vivace per escursioni e vita all aperto',
    badge: '🌴 Escape 31s',
    duration: '30.9s',
    src: '/audio/village/07%20Flower%20Power%20Village%20-%20Tropical%20Island%20Escape%20(Tropical%20Reggae).mp3'
  },
  {
    id: 'village_08',
    code: '08',
    title: 'Sweet Island Sunshine',
    part: 'Chillhop Lo-Fi R&B',
    tagline: 'Piano Rhodes vintage e beat morbido per mattina e relax',
    badge: '☀️ Lo-Fi 19s',
    duration: '18.9s',
    src: '/audio/village/08%20Flower%20Power%20Village%20-%20Sweet%20Island%20Sunshine%20(Chillhop%20Lo-Fi).mp3'
  },
  {
    id: 'village_09',
    code: '09',
    title: 'Love in Koh Phayam',
    part: 'Vocal Jazz Bossa',
    tagline: 'Voce calda, contrabbasso e pianoforte per cene intime',
    badge: '🌺 Bossa 31s',
    duration: '31.0s',
    src: '/audio/village/09%20Flower%20Power%20Village%20-%20Love%20in%20Koh%20Phayam%20(Vocal%20Jazz%20Bossa).mp3'
  },
  {
    id: 'village_10',
    code: '10',
    title: 'Tropical Sanctuary',
    part: 'Neo-Soul Lounge',
    tagline: 'Voce sognante e chitarra soft per bungalow e giardino',
    badge: '🌺 Neo-Soul 31s',
    duration: '31.0s',
    src: '/audio/village/10%20Flower%20Power%20Village%20-%20Tropical%20Soul%20Sanctuary%20(Neo-Soul%20Lounge).mp3'
  },
  {
    id: 'village_11',
    code: '11',
    title: 'Sabai Life & Breeze',
    part: 'Tropical Acoustic Bossa',
    tagline: 'Chitarra acustica e pace per il risveglio nel resort',
    badge: '🌺 Sabai 31s',
    duration: '30.9s',
    src: '/audio/village/11%20Flower%20Power%20Village%20-%20Island%20Breeze%20&%20Sabai%20Life%20(Tropical%20Acoustic).mp3'
  }
];

export const VisualMotionStudio: React.FC<VisualMotionStudioProps> = ({
  onSchedulePost,
  uiLang = 'IT'
}) => {
  // 🎯 Macro-Formato Editoriale Master:
  // 'video_reel': Suite Video 9:16 con Musica & Motion (Instagram Reels + Facebook Reels + TikTok)
  // 'static_post': Suite Post Immagine Statica & Link Cliccabile (Facebook Feed Post + Google Maps Scheda Locale)
  const [editorialFormat, setEditorialFormat] = useState<'video_reel' | 'static_post'>('video_reel');

  // 🌐 Piattaforma Attiva per la skin di anteprima (Instagram, Facebook, TikTok, Google Maps)
  const [activePlatform, setActivePlatform] = useState<OmnichannelPlatform>('instagram');

  // Modalità display interna canvas/anteprima
  const [activeMode, setActiveMode] = useState<'carousel' | 'motion_reel' | 'feed_post' | 'google_local'>('motion_reel');

  const [selectedBrand, setSelectedBrand] = useState<'pizza' | 'village'>('pizza');
  
  // 🍱 Tipo Selezione: Singolo Piatto Iconico vs Collezione Tematica (es. Burger & Focacce, Seafood, Pizza Masters)
  const [selectionType, setSelectionType] = useState<'single' | 'collection'>('single');
  const [selectedItem, setSelectedItem] = useState<VisualCatalogItem>(CATALOG_PRESET_ITEMS[0]);
  const [selectedCollection, setSelectedCollection] = useState<VisualCollectionPreset | null>(null);

  const [languagePriority, setLanguagePriority] = useState<'TH_FIRST' | 'EN_FIRST' | 'IT_FIRST'>('TH_FIRST');
  
  // Stato Carosello
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Stato Motion Reel Playback Controllato (Durata 7.8s con Stop Finale & Replay)
  const [isPlayingMotion, setIsPlayingMotion] = useState(true);
  const [isReelFinished, setIsReelFinished] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 🎬 Regia Cinematica Pan & Scan (Pan Orizzontale, Diagonale, Push-in)
  const [cameraTrajectory, setCameraTrajectory] = useState<CameraTrajectory>('auto_cinematic');

  // ✨ Atmosfera & Sovrimpressioni Grafiche Polimorfiche (Luce, Rombi, Stelle, Cuori, Vapore)
  const [overlayAtmosphere, setOverlayAtmosphere] = useState<OverlayAtmosphere>('auto_context');

  // 📐 Guide Safe Zone Ufficiali Broadcast (Meta / TikTok)
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);

  // Stato personalizzazione testi
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customBadge, setCustomBadge] = useState('');
  const [customPrice, setCustomPrice] = useState<string>('');

  // Stato Analisi Visiva AI (Gemini Vision + DeepSeek)
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysisLog, setAiAnalysisLog] = useState<string | null>(null);
  const [aiCaptionData, setAiCaptionData] = useState<{ thai?: string; english?: string; hashtags?: string[] } | null>(null);

  // Stato Registrazione Video Reel (Canvas 9:16 captureStream & MediaRecorder)
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [downloadedVideoNotice, setDownloadedVideoNotice] = useState(false);

  // 🎵 Suite Sonora Attiva: Pizzeria (5 Jingle R&B) vs Villaggio (11 Brani Koh Phayam Vibes)
  const currentBrandAudioTracks = useMemo(() => {
    return selectedBrand === 'village' ? VILLAGE_AUDIO_TRACKS : JINGLE_TRACKS;
  }, [selectedBrand]);

  const [selectedJingleTrackId, setSelectedJingleTrackId] = useState<string>('yeah');
  const [isJingleAudioEnabled, setIsJingleAudioEnabled] = useState(true);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Commutazione automatica traccia predefinita al cambio brand
  useEffect(() => {
    const isCurrentTrackInBrand = currentBrandAudioTracks.some(t => t.id === selectedJingleTrackId);
    if (!isCurrentTrackInBrand) {
      const defaultTrack = selectedBrand === 'village' ? 'village_01' : 'yeah';
      setSelectedJingleTrackId(defaultTrack);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlayingAudioPreview(false);
      }
    }
  }, [selectedBrand, currentBrandAudioTracks, selectedJingleTrackId]);

  const activeJingleTrack = useMemo(() => {
    return currentBrandAudioTracks.find(t => t.id === selectedJingleTrackId) || currentBrandAudioTracks[0];
  }, [currentBrandAudioTracks, selectedJingleTrackId]);

  const toggleAudioPreview = (targetTrackId?: string) => {
    // Se viene passato un trackId:
    if (targetTrackId) {
      if (targetTrackId !== selectedJingleTrackId) {
        // Seleziona la nuova traccia
        setSelectedJingleTrackId(targetTrackId);
        const newTrack = currentBrandAudioTracks.find(t => t.id === targetTrackId) || activeJingleTrack;
        
        // Se l'audio stava già suonando, passa al nuovo brano
        if (isPlayingAudioPreview && audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.src = newTrack.src;
          audioPlayerRef.current.currentTime = 0;
          audioPlayerRef.current.play().catch(e => console.log('Audio playback info:', e));
        } else if (audioPlayerRef.current) {
          audioPlayerRef.current.src = newTrack.src;
          audioPlayerRef.current.currentTime = 0;
        }
        return;
      } else {
        // Se si clicca sulla traccia già selezionata, fa toggle Play/Pausa
        if (isPlayingAudioPreview) {
          if (audioPlayerRef.current) audioPlayerRef.current.pause();
          setIsPlayingAudioPreview(false);
          return;
        }
      }
    }

    // Toggle Play / Pausa generale per la traccia attiva
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(activeJingleTrack.src);
      audioPlayerRef.current.loop = true;
      audioPlayerRef.current.onended = () => setIsPlayingAudioPreview(false);
    } else {
      if (!audioPlayerRef.current.src.endsWith(activeJingleTrack.src)) {
        audioPlayerRef.current.src = activeJingleTrack.src;
      }
    }

    if (isPlayingAudioPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingAudioPreview(false);
    } else {
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.play().then(() => {
        setIsPlayingAudioPreview(true);
      }).catch((err) => console.log('Audio playback prevented:', err));
    }
  };

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Notifica pianificazione
  const [scheduledSuccess, setScheduledSuccess] = useState(false);
  const [scheduledMessage, setScheduledMessage] = useState<string | null>(null);

  // Adattamenti nativi calcolati
  const adaptations = buildOmnichannelAdaptations(selectedItem, customTitle, customSubtitle);

  // 📝 Didascalie Social Ufficiali (Testo del Post Reale)
  const tiktokCaption = useMemo(() => {
    if (aiCaptionData) {
      return `${aiCaptionData.thai || selectedItem.titleTh} ${aiCaptionData.english || selectedItem.titleEn}\n\n${(aiCaptionData.hashtags || adaptations.tiktok.hashtags).join(' ')}`;
    }
    return `${adaptations.tiktok.titleHook}\n${adaptations.tiktok.subtitleOrBody}\n\n${adaptations.tiktok.hashtags.join(' ')}`;
  }, [aiCaptionData, selectedItem, adaptations.tiktok]);

  const instagramCaption = useMemo(() => {
    if (aiCaptionData) {
      return selectedItem.brand === 'pizza'
        ? `🇮🇹 ${customTitle || selectedItem.titleIt}\n🇹🇭 ${aiCaptionData.thai || selectedItem.titleTh}\n\n${customSubtitle || selectedItem.descriptionIt}\n\n${(aiCaptionData.hashtags || adaptations.instagram.hashtags).join(' ')}`
        : `🇬🇧 ${customTitle || selectedItem.titleEn}\n🇹🇭 ${aiCaptionData.thai || selectedItem.titleTh}\n\n${customSubtitle || selectedItem.descriptionEn}\n\n${(aiCaptionData.hashtags || adaptations.instagram.hashtags).join(' ')}`;
    }
    return `${adaptations.instagram.titleHook}\n\n${adaptations.instagram.subtitleOrBody}\n\n${adaptations.instagram.ctaText}\n\n${adaptations.instagram.hashtags.join(' ')}`;
  }, [aiCaptionData, selectedItem, customTitle, customSubtitle, adaptations.instagram]);

  const facebookReelsCaption = useMemo(() => {
    if (aiCaptionData) {
      return `${aiCaptionData.thai || selectedItem.titleTh}\n${aiCaptionData.english || selectedItem.titleEn}\n\n${(aiCaptionData.hashtags || adaptations.facebook.hashtags).join(' ')}`;
    }
    return `${adaptations.facebook.titleHook}\n\n${adaptations.facebook.subtitleOrBody}\n\n${adaptations.facebook.hashtags.join(' ')}`;
  }, [aiCaptionData, selectedItem, adaptations.facebook]);

  // Quando cambia piattaforma, adatta automaticamente il display mode e i testi
  const handleSelectPlatform = (platform: OmnichannelPlatform) => {
    setActivePlatform(platform);
    if (editorialFormat === 'video_reel') {
      setActiveMode('motion_reel');
    } else {
      if (platform === 'facebook') {
        setActiveMode('feed_post');
      } else if (platform === 'google') {
        setActiveMode('google_local');
      } else {
        setActiveMode('carousel');
      }
    }
  };

  // Aggiorna slides e campi quando cambia item, collezione o piattaforma
  useEffect(() => {
    if (selectionType === 'collection' && selectedCollection) {
      const colItems = selectedCollection.itemIds
        .map(id => CATALOG_PRESET_ITEMS.find(it => it.id === id)!)
        .filter(Boolean);

      const colSlides: CarouselSlide[] = colItems.map((it, idx) => ({
        id: `${it.id}-slide-${idx}`,
        slideType: idx === 0 ? 'hook' : (idx === colItems.length - 1 ? 'cta' : 'feature'),
        title: it.titleTh,
        subtitle: it.titleEn,
        badge: it.badgeTh || it.badgeEn || it.badgeIt,
        imageUrl: it.imageUrl,
        overlayGradient: idx === 0 ? 'vibrant-warm' : 'dark-bottom',
        ctaText: idx === colItems.length - 1 ? 'สั่งออนไลน์ ➔' : 'Swipe ➔'
      }));

      setSlides(colSlides);
      setCurrentSlideIndex(0);
      setCustomTitle(selectedCollection.nameTh);
      setCustomSubtitle(selectedCollection.nameEn);
      setCustomBadge(selectedCollection.badge);
      setCustomPrice(colItems[0]?.price ? `${colItems[0].price}฿+` : '');
    } else {
      const generated = buildCarouselSlides(selectedItem, languagePriority);
      setSlides(generated);
      setCurrentSlideIndex(0);

      const adapt = adaptations[activePlatform];
      setCustomTitle(selectedItem.titleTh || adapt.titleHook);
      setCustomSubtitle(selectedItem.titleEn || adapt.subtitleOrBody.slice(0, 80));
      setCustomBadge(adapt.badgeLabel);
      setCustomPrice(selectedItem.price ? `${selectedItem.price} THB` : '');
    }
    setAiCaptionData(null);
  }, [selectedItem, selectedCollection, selectionType, languagePriority, activePlatform]);

  // Motore Animazione Dinamica Canvas 9:16 (Multi-Scena per Collezioni / Ken Burns Zoom per Singolo)
  useEffect(() => {
    if (activeMode !== 'motion_reel' && activeMode !== 'feed_post') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determina elementi da renderizzare
    const activeItems = (selectionType === 'collection' && selectedCollection)
      ? selectedCollection.itemIds.map(id => CATALOG_PRESET_ITEMS.find(it => it.id === id)!).filter(Boolean)
      : [selectedItem];

    // Precarica immagini
    const loadedImages: HTMLImageElement[] = activeItems.map(item => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.imageUrl;
      return img;
    });

    let startTime = performance.now();
    // ⏱️ Durata fissa 7.8s calibrata per massimo retention su TikTok & Reels (finestra 7.5 - 8.0s)
    const TOTAL_REEL_DURATION = 7.8;
    const itemDuration = TOTAL_REEL_DURATION / activeItems.length;
    const totalCycle = TOTAL_REEL_DURATION;
    const transitionDuration = activeItems.length > 1 ? Math.min(0.55, itemDuration * 0.25) : 0;

    const VILLAGE_WEBSITE_TRAJECTORIES: CameraTrajectory[] = [
      'pan_left_to_right',
      'pan_right_to_left',
      'diagonal_up_right',
      'diagonal_up_left'
    ];

    const GENERAL_TRAJECTORIES: CameraTrajectory[] = [
      'pan_left_to_right',
      'tilt_top_to_bottom',
      'pan_right_to_left',
      'push_in_focal',
      'tilt_bottom_to_top',
      'diagonal_up_right',
      'diagonal_up_left'
    ];

    const resolveItemTrajectory = (item: VisualCatalogItem, itemIdx: number): CameraTrajectory => {
      const isVillageWebsite = item.brand === 'village' && (item as any).source !== 'telegram_cloud';
      if (cameraTrajectory === 'auto_cinematic') {
        if (isVillageWebsite) {
          return getVillageAccommodationTrajectory(item.id, itemIdx);
        } else {
          const itemSeed = item.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const trajIdx = (itemIdx + itemSeed) % GENERAL_TRAJECTORIES.length;
          return GENERAL_TRAJECTORIES[trajIdx];
        }
      } else if (isVillageWebsite && !VILLAGE_WEBSITE_TRAJECTORIES.includes(cameraTrajectory)) {
        return getVillageAccommodationTrajectory(item.id, itemIdx);
      }
      return cameraTrajectory;
    };

    const render = (now: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = now;
      }
      const rawElapsed = (now - startTimeRef.current) / 1000;
      const elapsed = Math.min(TOTAL_REEL_DURATION, rawElapsed);
      const isEnded = rawElapsed >= TOTAL_REEL_DURATION;

      // Gestione Audio Anteprima Live: sincronizzato con dissolvenza a 6.6s
      if (audioPlayerRef.current && isJingleAudioEnabled && isPlayingMotion) {
        if (elapsed >= 6.6) {
          const fadeProgress = (TOTAL_REEL_DURATION - elapsed) / 1.2;
          audioPlayerRef.current.volume = Math.max(0, Math.min(1, fadeProgress));
        } else {
          audioPlayerRef.current.volume = 1.0;
        }
      }

      // 1. Calcolo Scena e Progressione
      // Per immagine singola: l'intero filmato dura quanto il movimento da A a B, ZERO ritorni indietro!
      let activeIdx = 0;
      let timeInScene = elapsed;
      let subElapsed = Math.min(1.0, elapsed / TOTAL_REEL_DURATION);

      if (activeItems.length > 1) {
        activeIdx = Math.min(activeItems.length - 1, Math.floor(elapsed / itemDuration));
        timeInScene = elapsed - (activeIdx * itemDuration);
        subElapsed = Math.min(1.0, timeInScene / itemDuration);
      }

      const currentItem = activeItems[activeIdx];
      const currentImg = loadedImages[activeIdx];
      const activeTraj = resolveItemTrajectory(currentItem, activeIdx);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 🎬 Disegno Layer Immagine con Regia Ken Burns Unidirezionale
      const renderImageLayer = (
        img: HTMLImageElement | undefined, 
        traj: CameraTrajectory, 
        subT: number, 
        alpha: number
      ) => {
        if (img && img.complete && img.naturalWidth > 0) {
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const canvasAspect = w / h;
          let baseW = w;
          let baseH = h;
          if (imgAspect > canvasAspect) {
            baseH = h;
            baseW = h * imgAspect;
          } else {
            baseW = w;
            baseH = w / imgAspect;
          }

          // Curva morbida Quad Ease-In-Out
          const t = subT < 0.5 
            ? 2 * subT * subT 
            : 1 - Math.pow(-2 * subT + 2, 2) / 2;

          let currentScale = 1.15;
          let panX = 0;
          let panY = 0;

          const maxPanX = Math.max(0, (baseW * 1.15 - w) / 2);
          const maxPanY = Math.max(0, (baseH * 1.18 - h) / 2);

          switch (traj) {
            case 'pan_left_to_right': {
              currentScale = 1.15;
              panX = maxPanX - (t * 2 * maxPanX);
              panY = 0;
              break;
            }
            case 'pan_right_to_left': {
              currentScale = 1.15;
              panX = -maxPanX + (t * 2 * maxPanX);
              panY = 0;
              break;
            }
            case 'tilt_top_to_bottom': {
              currentScale = 1.18;
              panX = 0;
              panY = maxPanY - (t * 2 * maxPanY);
              break;
            }
            case 'tilt_bottom_to_top': {
              currentScale = 1.18;
              panX = 0;
              panY = -maxPanY + (t * 2 * maxPanY);
              break;
            }
            case 'push_in_focal': {
              currentScale = 1.05 + (t * 0.23);
              panX = 0;
              panY = 0;
              break;
            }
            case 'diagonal_up_left': {
              currentScale = 1.18;
              panX = -maxPanX + (t * 2 * maxPanX);
              panY = -maxPanY + (t * 2 * maxPanY);
              break;
            }
            case 'diagonal_up_right':
            default: {
              currentScale = 1.18;
              panX = maxPanX - (t * 2 * maxPanX);
              panY = -maxPanY + (t * 2 * maxPanY);
              break;
            }
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.translate(w / 2 + panX, h / 2 + panY);
          ctx.scale(currentScale, currentScale);
          ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
          ctx.restore();
        } else if (alpha >= 0.95) {
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(0, 0, w, h);
        }
      };

      // 1. Disegna la scena corrente (Base a piena opacità)
      renderImageLayer(currentImg, activeTraj, subElapsed, 1.0);

      // 2. 🌁 Transizione Cinematografica Cross-Dissolve Morbida tra Scena Corrente e Successiva
      if (activeItems.length > 1 && transitionDuration > 0 && timeInScene > (itemDuration - transitionDuration)) {
        const transitionProgress = (timeInScene - (itemDuration - transitionDuration)) / transitionDuration;
        // Curva sinusoidale pura per una sfumatura vellutata senza stacchi
        const crossAlpha = 0.5 - 0.5 * Math.cos(transitionProgress * Math.PI);
        const nextIdx = (activeIdx + 1) % activeItems.length;
        const nextItem = activeItems[nextIdx];
        const nextImg = loadedImages[nextIdx];
        const nextTraj = resolveItemTrajectory(nextItem, nextIdx);

        // Sovrappone la scena successiva che entra dolcemente
        renderImageLayer(nextImg, nextTraj, transitionProgress * 0.08, crossAlpha);
      }

      ctx.globalAlpha = 1.0;

      // 🌟 Risoluzione Atmosfera Singola e Coerente (1 SOLO EFFETTO PER TUTTA LA CLIP, ZERO ALTERNANZA)
      let currentAtmosphere = overlayAtmosphere;
      if (currentAtmosphere === 'auto_context') {
        const itemSeed = currentItem.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        if (currentItem.brand === 'village') {
          // Per il villaggio: 1 effetto solare coerente per tutta la clip
          const villageAtm: OverlayAtmosphere[] = ['tropical_sunbeams', 'abstract_bokeh', 'light_streaks'];
          currentAtmosphere = villageAtm[itemSeed % villageAtm.length];
        } else {
          // Per la pizzeria: piatti caldi/fumanti (warm_steam) oppure luce/stelle/bokeh
          const cat = (currentItem.category || '').toLowerCase();
          if (cat.includes('pizza') || cat.includes('pasta') || cat.includes('hot') || cat.includes('burger')) {
            currentAtmosphere = 'warm_steam';
          } else {
            const pizzaAtm: OverlayAtmosphere[] = [
              'light_streaks',
              'sparkle_stars',
              'abstract_bokeh',
              'warm_steam'
            ];
            currentAtmosphere = pizzaAtm[itemSeed % pizzaAtm.length];
          }
        }
      }

      // 1. ⚡ RIGHE DI LUCE CINEMATOGRAFICHE (Carezza Anamorfica Unica a 35° da 0s a 7.8s)
      if (currentAtmosphere === 'light_streaks') {
        // Unico passaggio maestoso lungo l'intera durata del video
        const streakProgress = Math.min(1.0, Math.max(0, elapsed / TOTAL_REEL_DURATION));
        // Curva morbida sinusoidale per iniziare piano, scorrere con grazia ed uscire delicatamente
        const smoothStreak = 0.5 - 0.5 * Math.cos(streakProgress * Math.PI);
        const streakX = (smoothStreak * (w + 700)) - 350;
        
        ctx.save();
        ctx.translate(streakX, h * 0.42);
        ctx.rotate(-Math.PI / 5);

        // Fascio largo morbido dorato/bianco caldo
        const gradStreak = ctx.createLinearGradient(-110, 0, 110, 0);
        gradStreak.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradStreak.addColorStop(0.5, 'rgba(254, 240, 138, 0.22)');
        gradStreak.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradStreak;
        ctx.fillRect(-110, -h * 1.5, 220, h * 3);

        // Riga centrale di riflesso brillante anamorfico
        const gradCore = ctx.createLinearGradient(-18, 0, 18, 0);
        gradCore.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradCore.addColorStop(0.5, 'rgba(255, 255, 255, 0.50)');
        gradCore.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradCore;
        ctx.fillRect(-18, -h * 1.5, 36, h * 3);

        // Sottile contro-riflesso di accompagnamento
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.fillRect(55, -h * 1.5, 3.5, h * 3);

        ctx.restore();
      }

      // 2. ✦ STELLE GOURMET (18 Scintille Distribuite su Tutto lo Spazio)
      if (currentAtmosphere === 'sparkle_stars') {
        const starCoords = [
          { x: w * 0.15, y: h * 0.22, size: 16 },
          { x: w * 0.82, y: h * 0.18, size: 19 },
          { x: w * 0.88, y: h * 0.44, size: 14 },
          { x: w * 0.12, y: h * 0.48, size: 18 },
          { x: w * 0.50, y: h * 0.14, size: 21 },
          { x: w * 0.72, y: h * 0.58, size: 15 },
          { x: w * 0.28, y: h * 0.64, size: 13 },
          { x: w * 0.38, y: h * 0.28, size: 17 },
          { x: w * 0.65, y: h * 0.32, size: 20 },
          { x: w * 0.22, y: h * 0.38, size: 12 },
          { x: w * 0.78, y: h * 0.70, size: 15 },
          { x: w * 0.45, y: h * 0.52, size: 14 },
          // Micro-puntini diamante perlacei
          { x: w * 0.30, y: h * 0.18, size: 8 },
          { x: w * 0.60, y: h * 0.22, size: 7 },
          { x: w * 0.85, y: h * 0.32, size: 8 },
          { x: w * 0.18, y: h * 0.58, size: 7 },
          { x: w * 0.55, y: h * 0.68, size: 8 },
          { x: w * 0.75, y: h * 0.15, size: 6 }
        ];

        starCoords.forEach((st, sIdx) => {
          const starPhase = (elapsed * 1.8 + sIdx * 0.9) % (Math.PI * 2);
          const starBright = Math.max(0, Math.sin(starPhase));
          if (starBright > 0.05) {
            ctx.save();
            ctx.translate(st.x, st.y);
            const curSize = st.size * starBright;

            if (st.size > 10) {
              // Stella classica a 4 punte
              ctx.beginPath();
              ctx.moveTo(0, -curSize);
              ctx.quadraticCurveTo(0, 0, curSize, 0);
              ctx.quadraticCurveTo(0, 0, 0, curSize);
              ctx.quadraticCurveTo(0, 0, -curSize, 0);
              ctx.quadraticCurveTo(0, 0, 0, -curSize);
              ctx.closePath();

              ctx.fillStyle = `rgba(251, 191, 36, ${starBright * 0.65})`;
              ctx.shadowColor = '#fbbf24';
              ctx.shadowBlur = 12 * starBright;
              ctx.fill();

              ctx.fillStyle = `rgba(255, 255, 255, ${starBright * 0.92})`;
              ctx.beginPath();
              ctx.arc(0, 0, curSize * 0.22, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Micro-diamante scintillante
              ctx.fillStyle = `rgba(255, 255, 255, ${starBright * 0.85})`;
              ctx.shadowColor = '#fef08a';
              ctx.shadowBlur = 8 * starBright;
              ctx.beginPath();
              ctx.arc(0, 0, curSize * 0.5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        });
      }

      // 3. 🌀 BOKEH OTTICO CIRCOLARE f/1.2 (Grandi Dischi Luminosi Sfocati da Obiettivo Fotografico)
      if (currentAtmosphere === 'abstract_bokeh') {
        const bokehCount = 9;
        for (let b = 0; b < bokehCount; b++) {
          const bProgress = ((elapsed * 26 + b * 65) % (h * 0.70));
          const bY = h * 0.78 - bProgress;
          const bX = (w * 0.12) + ((b * 95) % (w * 0.78)) + Math.sin(elapsed * 0.8 + b) * 22;
          const bRadius = 32 + (b % 4) * 12; // Da 32px a 68px, generosi e visibili!
          const bAlpha = Math.max(0, Math.sin((bProgress / (h * 0.70)) * Math.PI) * 0.38);

          ctx.save();
          ctx.translate(bX, bY);

          // Gradiente radiale da bokeh di prestigio (nucleo caldo, bordo morbidissimo)
          const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bRadius);
          if (b % 2 === 0) {
            radGrad.addColorStop(0, `rgba(254, 240, 138, ${bAlpha * 0.55})`);
            radGrad.addColorStop(0.5, `rgba(251, 191, 36, ${bAlpha * 0.30})`);
            radGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
          } else {
            radGrad.addColorStop(0, `rgba(255, 255, 255, ${bAlpha * 0.50})`);
            radGrad.addColorStop(0.6, `rgba(254, 240, 138, ${bAlpha * 0.20})`);
            radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(0, 0, bRadius, 0, Math.PI * 2);
          ctx.fill();

          // Sottilissimo anello perimetrale tipico degli obiettivi vintage
          ctx.strokeStyle = `rgba(255, 255, 255, ${bAlpha * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.restore();
        }
      }

      // 4. ❤️ CUORI FLUTTUANTI (Grandi, Caldi e Visibili per Post Romantici)
      if (currentAtmosphere === 'floating_hearts') {
        const heartCount = 12;
        for (let k = 0; k < heartCount; k++) {
          const hProgress = ((elapsed * 34 + k * 65) % (h * 0.75));
          const heartY = h * 0.80 - hProgress;
          const heartX = (w * 0.14) + ((k * 76) % (w * 0.72)) + Math.sin(elapsed * 1.3 + k) * 18;
          const hAlpha = Math.max(0, Math.sin((hProgress / (h * 0.75)) * Math.PI) * 0.45);
          const hs = 20 + (k % 4) * 4; // Dimensioni 20-32px, chiare e corpose!

          ctx.save();
          ctx.translate(heartX, heartY);
          ctx.beginPath();
          ctx.moveTo(0, -hs * 0.25);
          ctx.bezierCurveTo(-hs * 0.8, -hs * 0.8, -hs * 1.1, hs * 0.35, 0, hs);
          ctx.bezierCurveTo(hs * 1.1, hs * 0.35, hs * 0.8, -hs * 0.8, 0, -hs * 0.25);
          ctx.closePath();

          ctx.fillStyle = `rgba(244, 63, 94, ${hAlpha * 0.70})`;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10 * hAlpha;
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${hAlpha * 0.85})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 5. ☀️ RAGGI TROPICALI (Raggiera Solare a Ventaglio a Tutto Campo / Koh Phayam God Rays)
      if (currentAtmosphere === 'tropical_sunbeams') {
        const rayCount = 7;
        const originX = w * 0.25; // Punto sorgente solare in alto
        const originY = -50;
        
        ctx.save();
        for (let b = 0; b < rayCount; b++) {
          // Ventaglio che copre l'intero schermo 9:16 da sinistra a destra
          const baseAngle = 0.20 + (b * 0.18) + Math.sin(elapsed * 0.6 + b) * 0.02;
          const raySpread = 0.12 + Math.sin(elapsed * 0.9 + b) * 0.015;

          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(originX + Math.cos(baseAngle) * h * 1.6, originY + Math.sin(baseAngle) * h * 1.6);
          ctx.lineTo(originX + Math.cos(baseAngle + raySpread) * h * 1.6, originY + Math.sin(baseAngle + raySpread) * h * 1.6);
          ctx.closePath();

          const rayGrad = ctx.createRadialGradient(originX, originY, 50, originX, originY, h * 1.4);
          rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
          rayGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.14)');
          rayGrad.addColorStop(0.8, 'rgba(254, 240, 138, 0.04)');
          rayGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

          ctx.fillStyle = rayGrad;
          ctx.fill();
        }

        // Alone solare centrale caldo nel cielo
        const sunGlow = ctx.createRadialGradient(originX, originY, 0, originX, originY, 180);
        sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.40)');
        sunGlow.addColorStop(0.5, 'rgba(254, 240, 138, 0.20)');
        sunGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(originX, originY, 180, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. 💨 VAPORE CALDO NATURALE (Volute Termiche Ampie che Salgono su Tutto lo Schermo)
      if (currentAtmosphere === 'warm_steam') {
        const steamCount = 10;
        for (let s = 0; s < steamCount; s++) {
          // Sale da fondo/centro piatto (h * 0.65) fino in cima allo schermo (h * 0.05)
          const travelDistance = h * 0.60;
          const steamProgress = ((elapsed * 48 + s * 45) % travelDistance);
          const steamY = (h * 0.65) - steamProgress;
          // Distribuzione su tutta la larghezza del piatto (da w*0.2 a w*0.8) con moto sinusoidale naturale
          const baseX = (w * 0.22) + ((s * 58) % (w * 0.56));
          const steamX = baseX + Math.sin(elapsed * 1.6 + s) * 28;
          // Dissolvenza morbida mentre sale verso l'alto
          const progressNorm = steamProgress / travelDistance;
          const steamAlpha = Math.sin(progressNorm * Math.PI) * 0.20;
          const steamRadius = 26 + (progressNorm * 42); // Si espande mentre sale!

          ctx.save();
          const steamGrad = ctx.createRadialGradient(steamX, steamY, 0, steamX, steamY, steamRadius);
          steamGrad.addColorStop(0, `rgba(255, 255, 255, ${steamAlpha * 1.2})`);
          steamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${steamAlpha * 0.5})`);
          steamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = steamGrad;
          ctx.beginPath();
          ctx.arc(steamX, steamY, steamRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Sfumatura gradiente scuro inferiore per garantire leggibilità del testo
      const gradBottom = ctx.createLinearGradient(0, h * 0.42, 0, h);
      gradBottom.addColorStop(0, 'rgba(0,0,0,0)');
      gradBottom.addColorStop(0.5, 'rgba(0,0,0,0.65)');
      gradBottom.addColorStop(1, 'rgba(0,0,0,0.92)');
      ctx.fillStyle = gradBottom;
      ctx.fillRect(0, h * 0.42, w, h * 0.58);

      // Sfumatura gradiente superiore leggero per badge
      // Sfumatura gradiente superiore leggera per contrasto pulito
      const gradTop = ctx.createLinearGradient(0, 0, 0, h * 0.15);
      gradTop.addColorStop(0, 'rgba(0,0,0,0.5)');
      gradTop.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, w, h * 0.15);

      // ✍️ Testo Titolo a Sinistra in Safe Zone (Sopra la didascalia dell'app social)
      ctx.textAlign = 'left';
      const posX = 26;

      // 1. Testo Tailandese (Grosso a Sinistra)
      const thaiText = activeItems.length > 1
        ? currentItem.titleTh
        : (customTitle || currentItem.titleTh);

      // Ombra morbida per staccare dal piatto
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px "Noto Sans Thai", sans-serif';
      const thaiLines = formatSemanticLines(thaiText, ctx, w - 110);

      // 2. Testo Inglese (Subito Sotto a Sinistra)
      const englishText = activeItems.length > 1
        ? currentItem.titleEn
        : (customSubtitle || currentItem.titleEn);

      ctx.font = 'bold 16px sans-serif';
      const engLines = formatSemanticLines(englishText, ctx, w - 110);

      // 🏷️ Badge Promozionale (Opzionale, integrato sopra il titolo)
      const badgeText = customBadge || currentItem.badgeTh || currentItem.badgeIt;
      const hasBadge = Boolean(badgeText);

      // Calcola posizione Y iniziale per Safe Zone (lasciando liberi i 255px inferiori del canvas per la UI social nativa)
      const priceText = currentItem.price ? `${currentItem.price} THB` : customPrice;
      const hasPrice = Boolean(priceText);
      const totalBlockHeight = (hasBadge ? 28 : 0) + (thaiLines.length * 34) + (engLines.length * 22) + (hasPrice ? 42 : 8);
      let textY = h - 255 - totalBlockHeight;

      // Disegna micro-badge se presente (integrato a sinistra sopra il titolo)
      if (hasBadge) {
        ctx.fillStyle = currentItem.brand === 'pizza' ? 'rgba(234, 88, 12, 0.9)' : 'rgba(5, 150, 105, 0.9)';
        ctx.beginPath();
        ctx.roundRect(posX, textY - 18, 160, 24, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`✨ ${badgeText.slice(0, 20)}`, posX + 10, textY - 2);
        textY += 18;
      }

      // Disegna Titolo Tailandese (Grosso in Alto a Sinistra)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px "Noto Sans Thai", sans-serif';
      thaiLines.slice(0, 3).forEach(line => {
        ctx.fillText(line, posX, textY);
        textY += 34;
      });

      // Disegna Sottotitolo Inglese (Subito Sotto a Sinistra)
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 16px sans-serif';
      engLines.slice(0, 3).forEach(line => {
        ctx.fillText(line, posX, textY);
        textY += 22;
      });

      // 3. Cartellino Prezzo Glassmorphism Minimal Chic (Subito Sotto a Sinistra)
      if (hasPrice) {
        textY += 6;
        ctx.shadowColor = 'transparent';

        // Estrai cifra e valuta pulite (es. "240" e "฿")
        const cleanPrice = priceText.replace(/\bTHB\b/gi, '฿').replace(/[^\d฿\s\w]/g, '').trim();
        const priceParts = cleanPrice.split(/\s+/);
        const amountPart = priceParts[0] || priceText;
        const currencyPart = '฿';
        const fullText = amountPart ? `${amountPart}฿` : '';

        ctx.font = '900 15px Kanit, sans-serif';
        const textMetrics = ctx.measureText(fullText);

        const pillWidth = 22 + textMetrics.width + 8;
        const pillHeight = 24;
        const pillY = textY - 17;

        // Ombra 3D neo-brutale nera
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(posX + 2, pillY + 2, pillWidth, pillHeight, 5);
        ctx.fill();

        // Sfondo Banner Giallo brillante #FFE500
        ctx.fillStyle = '#FFE500';
        ctx.beginPath();
        ctx.roundRect(posX, pillY, pillWidth, pillHeight, 5);
        ctx.fill();

        // Bordo Nero netto 2px
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(posX, pillY, pillWidth, pillHeight, 5);
        ctx.stroke();

        // Puntino rosso rubino
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(posX + 10, pillY + pillHeight / 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Cifra e Baht ฿ unificati in Kanit 900 nero
        ctx.font = '900 15px Kanit, sans-serif';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(fullText, posX + 18, pillY + 17);
      }

      // Resetta ombra per elementi successivi
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Indicatore di Scena Multi-Piatto se collezione attiva (posizionato in alto a centro-top)
      if (activeItems.length > 1) {
        const barW = (w - 60) / activeItems.length;
        activeItems.forEach((_, bIdx) => {
          ctx.fillStyle = bIdx === activeIdx ? '#f97316' : 'rgba(255,255,255,0.35)';
          ctx.beginPath();
          ctx.roundRect(30 + bIdx * barW, 20, barW - 4, 3, 1.5);
          ctx.fill();
        });
      }

      // ⏱️ Barra di Avanzamento Reel Nativa (Stile TikTok / Reels Scrubbing Bar in basso)
      const progressBarWidth = (elapsed / TOTAL_REEL_DURATION) * w;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(0, h - 3, progressBarWidth, 3);

      if (isEnded) {
        setIsPlayingMotion(false);
        setIsReelFinished(true);
        startTimeRef.current = null;
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
          audioPlayerRef.current.volume = 1.0;
        }
        return; // ⏹️ STOP! Il video termina sul fermo immagine finale, pronto per essere rivisto con Play!
      }

      if (isPlayingMotion) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMode, selectedItem, selectedCollection, selectionType, customTitle, customSubtitle, customBadge, customPrice, isPlayingMotion, cameraTrajectory, overlayAtmosphere]);

  // 🔄 Funzione Play / Replay da Cima a Fondo
  const handleToggleReelPlayback = () => {
    if (isPlayingMotion) {
      // Mette in pausa
      setIsPlayingMotion(false);
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
    } else {
      // Fa ripartire il reel da 0.0s fino a 7.8s
      startTimeRef.current = performance.now();
      setIsReelFinished(false);
      setIsPlayingMotion(true);
      if (isJingleAudioEnabled && audioPlayerRef.current) {
        audioPlayerRef.current.src = activeJingleTrack.src;
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.volume = 1.0;
        audioPlayerRef.current.play().catch(e => console.log('Audio preview play:', e));
      }
    }
  };

  // Quando l'utente seleziona un nuovo piatto/alloggio, o cambia traiettoria/effetto, riavvia l'anteprima pulita da 0
  useEffect(() => {
    startTimeRef.current = performance.now();
    setIsReelFinished(false);
    setIsPlayingMotion(true);
  }, [selectedItem, selectedCollection, cameraTrajectory, overlayAtmosphere]);



  // 🧠 Analisi Visiva AI (Google Gemini Vision + DeepSeek AI)
  const handleRunVisualAI = async () => {
    try {
      setIsAnalyzingAI(true);
      setAiAnalysisLog(uiLang === 'IT' ? 'Analisi inquadratura con Google Gemini Vision...' : 'Analyzing composition with Google Gemini Vision...');

      const res = await analyzeVisualWithAI({
        imageUrl: selectedItem.imageUrl,
        brand: selectedItem.brand,
        itemTitle: selectedItem.titleIt,
        itemTitleTh: selectedItem.titleTh,
        category: selectedItem.category,
        price: selectedItem.price
      });

      if (res.success) {
        setAiAnalysisLog(uiLang === 'IT' ? 'Generazione copy biculturale con DeepSeek AI...' : 'Generating viral copy with DeepSeek AI...');
        
        if (res.reelOverlay) {
          if (res.reelOverlay.title) setCustomTitle(res.reelOverlay.title);
          if (res.reelOverlay.subtitle) setCustomSubtitle(res.reelOverlay.subtitle);
          if (res.reelOverlay.badge) setCustomBadge(res.reelOverlay.badge);
          if (res.reelOverlay.priceTag) setCustomPrice(res.reelOverlay.priceTag);
        }

        if (res.slides && res.slides.length > 0) {
          const mappedSlides = res.slides.map((s, idx) => ({
            ...s,
            imageUrl: selectedItem.imageUrl,
            overlayGradient: idx === 0 
              ? (selectedItem.brand === 'pizza' ? 'vibrant-warm' as const : 'tropical-emerald' as const)
              : (idx === 1 ? 'dark-bottom' as const : 'dark-top-bottom' as const)
          }));
          setSlides(mappedSlides);
          setCurrentSlideIndex(0);
        }

        if (res.socialCaption) {
          setAiCaptionData(res.socialCaption);
        }

        const noticeMsg = res.visualAnalysis?.usedGemini 
          ? (uiLang === 'IT' ? '✨ Analisi completata con Google Gemini Vision + DeepSeek AI!' : '✨ Completed with Google Gemini Vision + DeepSeek AI!')
          : (uiLang === 'IT' ? '✨ Generazione completata con DeepSeek AI (Soggetto rilevato)!' : '✨ Generated with DeepSeek AI!');
        setAiAnalysisLog(noticeMsg);
        setTimeout(() => setAiAnalysisLog(null), 4500);
      }
    } catch (err: any) {
      console.error("Visual AI error:", err);
      setAiAnalysisLog(uiLang === 'IT' ? `Errore analisi AI: ${err.message}` : `AI analysis error: ${err.message}`);
      setTimeout(() => setAiAnalysisLog(null), 5000);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // 🎥 Esportazione Video Reel (MediaRecorder 9:16 su Canvas 60fps con Audio Jingle Ufficiale Muxato)
  const handleExportReelVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecordingVideo(true);
      setRecordingProgress(0);
      setIsPlayingMotion(true);

      const canvasStream = canvas.captureStream(60);
      let recordingStream = canvasStream;
      let exportAudioCtx: AudioContext | null = null;
      let exportAudioEl: HTMLAudioElement | null = null;

      // 🎵 Mixaggio Audio Jingle Suite Ufficiale con Fade Out negli ultimi 1.2s (da 6.6s a 7.8s)
      if (isJingleAudioEnabled) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            exportAudioCtx = new AudioContextClass();
            exportAudioEl = new Audio(activeJingleTrack.src);
            exportAudioEl.crossOrigin = 'anonymous';
            exportAudioEl.currentTime = 0;
            const source = exportAudioCtx.createMediaElementSource(exportAudioEl);
            const gainNode = exportAudioCtx.createGain();
            const dest = exportAudioCtx.createMediaStreamDestination();

            source.connect(gainNode);
            gainNode.connect(dest);

            // 🎚️ Fade out progressivo: volume pieno fino a 6.6s, poi discesa morbida a zero a 7.8s
            const aStart = exportAudioCtx.currentTime;
            gainNode.gain.setValueAtTime(1.0, aStart);
            gainNode.gain.setValueAtTime(1.0, aStart + 6.6);
            gainNode.gain.linearRampToValueAtTime(0.0001, aStart + 7.8);

            exportAudioEl.play().catch(e => console.log('Audio playback info:', e));

            const audioTracks = dest.stream.getAudioTracks();
            if (audioTracks.length > 0) {
              recordingStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...audioTracks
              ]);
            }
          }
        } catch (audioErr) {
          console.warn('Audio mixing fallback to video only:', audioErr);
        }
      }

      const mimeTypes = [
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];
      let selectedMime = mimeTypes.find(t => {
        try { return MediaRecorder.isTypeSupported(t); } catch { return false; }
      }) || 'video/webm';

      const recorder = new MediaRecorder(recordingStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      // ⏱️ Durata fissa 7.8s (Finestra d'oro social TikTok & Reels)
      const durationSeconds = 7.8;
      const intervalMs = 100;
      let elapsedMs = 0;

      const timer = setInterval(() => {
        elapsedMs += intervalMs;
        const pct = Math.min(100, Math.round((elapsedMs / (durationSeconds * 1000)) * 100));
        setRecordingProgress(pct);

        if (elapsedMs >= durationSeconds * 1000) {
          clearInterval(timer);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, intervalMs);

      recorder.onstop = () => {
        if (exportAudioEl) {
          exportAudioEl.pause();
          exportAudioEl = null;
        }
        if (exportAudioCtx && exportAudioCtx.state !== 'closed') {
          exportAudioCtx.close().catch(() => {});
          exportAudioCtx = null;
        }

        const blob = new Blob(chunks, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        setIsRecordingVideo(false);

        // Download automatico del file video con audio integrato
        const a = document.createElement('a');
        a.href = url;
        const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        a.download = `flowerpower_reel_${selectedItem.brand}_${selectedItem.id}_${activeJingleTrack.code}_${activeJingleTrack.id}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setDownloadedVideoNotice(true);
        setTimeout(() => setDownloadedVideoNotice(false), 5000);
      };

      recorder.start(100);
    } catch (err: any) {
      console.error("Video recording failed:", err);
      setIsRecordingVideo(false);
      alert(uiLang === 'IT' ? `Errore registrazione video: ${err.message}` : `Video export error: ${err.message}`);
    }
  };

  // Costruzione payload nativo specifico per singola piattaforma
  const buildPlatformPayload = (platform: OmnichannelPlatform): PostSchedulePayload => {
    const brand = selectedItem.brand;
    const adapt = adaptations[platform];
    const isPizza = brand === 'pizza';

    let format: 'reel' | 'feed' | 'story' | 'google_post' = 'feed';
    if (platform === 'tiktok') {
      format = selectionType === 'collection' || activeMode === 'motion_reel' ? 'reel' : 'feed';
    } else if (platform === 'instagram') {
      format = 'reel';
    } else if (platform === 'facebook') {
      format = 'feed';
    } else if (platform === 'google') {
      format = 'google_post';
    }

    let caption = '';
    if (platform === 'tiktok') {
      caption = `${adapt.titleHook}\n\n${adapt.subtitleOrBody}\n\n${adapt.ctaText}\n\n${adapt.hashtags.join(' ')}`;
    } else if (platform === 'instagram') {
      caption = aiCaptionData
        ? (isPizza
            ? `🇮🇹 ${customTitle || selectedItem.titleIt}\n🇹🇭 ${aiCaptionData.thai || selectedItem.titleTh}\n\n${customSubtitle || selectedItem.descriptionIt}\n\n${(aiCaptionData.hashtags || adapt.hashtags).join(' ')}`
            : `🇬🇧 ${customTitle || selectedItem.titleEn}\n🇹🇭 ${aiCaptionData.thai || selectedItem.titleTh}\n\n${customSubtitle || selectedItem.descriptionEn}\n\n${(aiCaptionData.hashtags || adapt.hashtags).join(' ')}`)
        : `✨ ${adapt.titleHook}\n\n${adapt.subtitleOrBody}\n\n${adapt.ctaText}\n\n${adapt.hashtags.join(' ')}`;
    } else if (platform === 'facebook') {
      caption = `${adapt.titleHook}\n\n${adapt.subtitleOrBody}\n\n🌐 Ordina subito / Prenota online: ${adapt.clickableLink}\n\n${adapt.hashtags.join(' ')}`;
    } else if (platform === 'google') {
      caption = `${adapt.titleHook}\n${adapt.subtitleOrBody}\n\n📍 Flower Power ${isPizza ? 'Ranong' : 'Koh Phayam'} • ${adapt.ctaText}: ${adapt.clickableLink}`;
    }

    // Orari strategici di pubblicazione:
    // Pranzo (11:30) per Facebook e Google Maps (decisioni d'asporto/visita)
    // Sera (18:30) per TikTok e Instagram (intrattenimento/cena)
    const scheduledTime = (platform === 'google' || platform === 'facebook') ? '11:30' : '18:30';

    return {
      brand,
      platforms: [platform],
      format,
      title: adapt.titleHook.slice(0, 50),
      caption,
      mediaUrl: selectedItem.imageUrl,
      scheduledTime,
      ctaUrl: adapt.clickableLink,
      ctaLabel: adapt.ctaText
    };
  };

  // Pianificazione per la singola piattaforma attiva
  const handleScheduleSingle = (targetPlatform: OmnichannelPlatform = activePlatform) => {
    if (!onSchedulePost) return;
    const payload = buildPlatformPayload(targetPlatform);
    onSchedulePost(payload);

    setScheduledMessage(
      uiLang === 'IT'
        ? `Post programmato con successo per ${adaptations[targetPlatform].platformLabel}!`
        : `Post successfully scheduled for ${adaptations[targetPlatform].platformLabel}!`
    );
    setScheduledSuccess(true);
    setTimeout(() => {
      setScheduledSuccess(false);
      setScheduledMessage(null);
    }, 4000);
  };

  // 🌟 Pianificazione unificata per il formato editoriale attivo (Video Reel vs Post Foto)
  const handleScheduleUnified = () => {
    if (!onSchedulePost) return;
    const targetPlatforms: OmnichannelPlatform[] = editorialFormat === 'video_reel'
      ? ['instagram', 'facebook', 'tiktok']
      : ['facebook', 'google'];

    const payloads = targetPlatforms.map(p => buildPlatformPayload(p));
    onSchedulePost(payloads);

    setScheduledMessage(
      editorialFormat === 'video_reel'
        ? (uiLang === 'IT'
            ? '🎬 Reel 9:16 sincronizzato con successo su Instagram Reels, Facebook Reels e TikTok!'
            : '🎬 9:16 Reel successfully synchronized to Instagram Reels, Facebook Reels & TikTok!')
        : (uiLang === 'IT'
            ? '📸 Post Foto HD sincronizzato con successo su Facebook Feed e Scheda Google Maps!'
            : '📸 HD Photo Post successfully synchronized to Facebook Feed & Google Maps Profile!')
    );
    setScheduledSuccess(true);
    setTimeout(() => {
      setScheduledSuccess(false);
      setScheduledMessage(null);
    }, 4500);
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-6 shadow-2xl backdrop-blur-xl text-stone-100">
      {/* Testata Studio Grafico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Visual Motion Studio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold uppercase">
                  TikTok & Reels Ready
                </span>
              </h2>
              <p className="text-sm text-stone-400">
                {uiLang === 'IT' 
                  ? 'Crea Caroselli e Video Motion 9:16 con testi animati partendo dalle foto del nostro sito.' 
                  : 'Create Carousels and 9:16 Motion Videos with animated text overlays from our site photos.'}
              </p>
            </div>
          </div>
        </div>

        {/* Switch 2 Macro-Formati Editoriali Master */}
        <div className="flex bg-stone-950 p-1.5 rounded-xl border border-stone-800 self-start md:self-auto gap-1">
          <button
            type="button"
            onClick={() => {
              setEditorialFormat('video_reel');
              setActiveMode('motion_reel');
              setActivePlatform('instagram');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              editorialFormat === 'video_reel'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg ring-1 ring-purple-400/50'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{uiLang === 'IT' ? '🎥 Video Reel 9:16' : '🎥 9:16 Video Reel'}</span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-amber-200">
              IG + FB + TikTok
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditorialFormat('static_post');
              setActiveMode('feed_post');
              setActivePlatform('facebook');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              editorialFormat === 'static_post'
                ? 'bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 text-white shadow-lg ring-1 ring-blue-400/50'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{uiLang === 'IT' ? '📸 Post Foto & Link' : '📸 Photo Post & Link'}</span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-blue-200">
              FB Feed + Google
            </span>
          </button>
        </div>
      </div>

      {/* 🌐 Banner Ecosistema Destinatari Attivi */}
      <div className="mt-5 p-3 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-400">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{uiLang === 'IT' ? 'Ecosistema di Pubblicazione Unificato' : 'Unified Publishing Ecosystem'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                {editorialFormat === 'video_reel' ? '3 Canali Video 9:16' : '2 Canali Web & Local'}
              </span>
            </div>
            <div className="text-[11px] text-stone-400">
              {editorialFormat === 'video_reel'
                ? (uiLang === 'IT'
                  ? 'Il video 7.8s con audio integrato viene distribuito contemporaneamente su Instagram Reels, Facebook Reels e TikTok.'
                  : 'The 7.8s video with sound is published simultaneously to Instagram Reels, Facebook Reels & TikTok.')
                : (uiLang === 'IT'
                  ? 'La foto HD con copy persuasivo e link al sito viene distribuita su Facebook Feed e Scheda Google Maps.'
                  : 'The high-res photo with direct links is published to Facebook Feed and Google Maps Profile.')}
            </div>
          </div>
        </div>

        {/* Canali Inclusi nel Formato Selezionato */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          {editorialFormat === 'video_reel' ? (
            <>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                <Video className="w-3 h-3" /> Instagram Reels
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                <Video className="w-3 h-3" /> Facebook Reels
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-stone-800 text-stone-200 border border-stone-700 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> TikTok
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Facebook Feed (Link)
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Google Maps
              </span>
            </>
          )}
        </div>
      </div>

      {/* Grid Principale: Selettori a sinistra + Mockup Telefono a destra */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* COLONNA SINISTRA: Controlli, Catalogo & Personalizzazione (7 Colonne) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Selezione Brand & Tipo Selezione (Singolo vs Collezione Tematica) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                1. {uiLang === 'IT' ? 'Brand & Formato Narrativo' : 'Brand & Story Format'}
              </label>
              
              {/* Toggle Singolo vs Collezione */}
              <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800 text-[11px]">
                <button
                  onClick={() => {
                    setSelectionType('single');
                    setSelectedCollection(null);
                  }}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    selectionType === 'single'
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {uiLang === 'IT' ? 'Singolo Piatto / Alloggio' : 'Single Subject'}
                </button>
                <button
                  onClick={() => {
                    setSelectionType('collection');
                    const firstCol = VISUAL_COLLECTION_PRESETS.find(c => c.brand === selectedBrand) || VISUAL_COLLECTION_PRESETS[0];
                    setSelectedCollection(firstCol);
                  }}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    selectionType === 'collection'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  ✨ {uiLang === 'IT' ? 'Collezione Tematica (Fast-Cut)' : 'Theme Collection (Fast-Cut)'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedBrand('pizza');
                  const firstPizza = CATALOG_PRESET_ITEMS.find(i => i.brand === 'pizza')!;
                  setSelectedItem(firstPizza);
                  if (selectionType === 'collection') {
                    const firstCol = VISUAL_COLLECTION_PRESETS.find(c => c.brand === 'pizza')!;
                    setSelectedCollection(firstCol);
                  }
                }}
                className={`flex items-center justify-center gap-3 p-3.5 rounded-xl border text-sm font-bold transition-all ${
                  selectedBrand === 'pizza'
                    ? 'border-orange-500/80 bg-orange-500/15 text-orange-300 shadow-md ring-1 ring-orange-500/50'
                    : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Pizza className="w-5 h-5 text-orange-400" />
                <span>Pizzeria Ranong 🍕</span>
              </button>
              <button
                onClick={() => {
                  setSelectedBrand('village');
                  const firstVillage = CATALOG_PRESET_ITEMS.find(i => i.brand === 'village')!;
                  setSelectedItem(firstVillage);
                  if (selectionType === 'collection') {
                    const firstCol = VISUAL_COLLECTION_PRESETS.find(c => c.brand === 'village')!;
                    setSelectedCollection(firstCol);
                  }
                }}
                className={`flex items-center justify-center gap-3 p-3.5 rounded-xl border text-sm font-bold transition-all ${
                  selectedBrand === 'village'
                    ? 'border-emerald-500/80 bg-emerald-500/15 text-emerald-300 shadow-md ring-1 ring-emerald-500/50'
                    : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Palmtree className="w-5 h-5 text-emerald-400" />
                <span>Villaggio Koh Phayam 🌴</span>
              </button>
            </div>
          </div>

          {/* 2. Selezione: o COLLEZIONI TEMATICHE o SINGOLI PIATTI */}
          {selectionType === 'collection' ? (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                2. {uiLang === 'IT' ? 'Scegli la Collezione Tematica (Video Multi-Scena Ritmato)' : 'Choose Theme Collection (Rhythmic Multi-Scene)'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VISUAL_COLLECTION_PRESETS.filter(c => c.brand === selectedBrand).map(col => {
                  const isSelected = selectedCollection?.id === col.id;
                  const colDishes = col.itemIds.map(id => CATALOG_PRESET_ITEMS.find(it => it.id === id)!).filter(Boolean);
                  return (
                    <div
                      key={col.id}
                      onClick={() => setSelectedCollection(col)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'border-orange-500 bg-orange-950/30 ring-2 ring-orange-500/40 shadow-xl'
                          : 'border-stone-800 bg-stone-950/70 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          {col.badge}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {col.itemIds.length} scene a ritmo
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white mb-1">{uiLang === 'IT' ? col.nameIt : col.nameEn}</p>
                      <p className="text-xs text-stone-400 mb-2">{col.nameTh}</p>
                      
                      {/* Mini miniature piatti collezione */}
                      <div className="flex gap-1.5 pt-1">
                        {colDishes.map((d, dIdx) => (
                          <img 
                            key={dIdx} 
                            src={d.imageUrl} 
                            alt={d.titleIt} 
                            className="w-10 h-10 rounded-lg object-cover border border-stone-800 shadow-sm" 
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">
                2. {uiLang === 'IT' ? 'Scegli Soggetto dal Sito' : 'Choose Subject from Site Catalog'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATALOG_PRESET_ITEMS.filter(i => i.brand === selectedBrand).map(item => {
                  const isSelected = selectedItem.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer group rounded-xl border overflow-hidden transition-all bg-stone-950/80 ${
                        isSelected 
                          ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-lg' 
                          : 'border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="relative h-24 overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.titleIt} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {item.price && (
                          <span className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-full">
                            {item.price}฿
                          </span>
                        )}
                        {item.brand === 'village' && (
                          <span className="absolute bottom-1.5 left-1.5 bg-emerald-950/85 backdrop-blur-md text-[9px] font-bold text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1 shadow">
                            {getVillageAccommodationTrajectory(item.id, 0) === 'pan_left_to_right' && '↔️ SX➔DX'}
                            {getVillageAccommodationTrajectory(item.id, 0) === 'pan_right_to_left' && '↔️ DX➔SX'}
                            {getVillageAccommodationTrajectory(item.id, 0) === 'diagonal_up_right' && '↗️ Diag SX➔DX'}
                            {getVillageAccommodationTrajectory(item.id, 0) === 'diagonal_up_left' && '↖️ Diag DX➔SX'}
                          </span>
                        )}
                      </div>
                      <div className="p-2 text-left">
                        <p className="text-xs font-bold text-stone-200 truncate">{item.titleIt}</p>
                        <p className="text-[10px] text-stone-400 truncate">{item.titleTh}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Marketing Contestuale: Festività & Temi Speciali */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">
              3. {uiLang === 'IT' ? 'Temi Speciali & Festività' : 'Special Event & Weather Themes'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THEMATIC_MARKETING_PRESETS.filter(t => t.brand === 'both' || t.brand === selectedBrand).map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setCustomTitle(theme.hookTitle);
                    setCustomSubtitle(theme.hookSubtitle);
                    setCustomBadge(theme.badge);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-800 bg-stone-950/50 hover:bg-stone-800/60 text-stone-300 text-xs font-medium text-left transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{uiLang === 'IT' ? theme.nameIt : theme.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Magic Box: Analisi Visiva Gemini Vision + DeepSeek Copywriter */}
          <div className="p-4 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-stone-950 to-indigo-950/40 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-purple-500/20 text-purple-400">
                    <Wand2 className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {uiLang === 'IT' ? 'AI Visual Art Director' : 'AI Visual Art Director'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                    Gemini Vision + DeepSeek
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {uiLang === 'IT'
                    ? 'Analizza composizione, ingredienti e crea copy biculturale per tutti i 4 ambienti.'
                    : 'Analyzes composition & framing, creating viral copy for all 4 native platforms.'}
                </p>
              </div>

              <button
                onClick={handleRunVisualAI}
                disabled={isAnalyzingAI}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex-shrink-0 ${
                  isAnalyzingAI
                    ? 'bg-purple-800/60 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02] shadow-purple-600/30'
                }`}
              >
                {isAnalyzingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                    <span>{uiLang === 'IT' ? 'Analisi in corso...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{uiLang === 'IT' ? '✨ Genera con AI' : '✨ Generate with AI'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Log / Feedback AI */}
            {aiAnalysisLog && (
              <div className="mt-3 p-2.5 rounded-lg bg-purple-900/30 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2 animate-fadeIn">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
                <span className="font-medium">{aiAnalysisLog}</span>
              </div>
            )}
          </div>

          {/* 4. Personalizzazione Testi per la Piattaforma Attiva */}
          <div className="bg-stone-950/70 p-4 rounded-xl border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <span>4. {uiLang === 'IT' ? 'Testi Adattati per' : 'Tailored Texts for'}</span>
                <span className="text-orange-400 font-bold">{adaptations[activePlatform]?.platformLabel}</span>
              </span>
              
              {/* Priorità Lingua */}
              <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-[11px]">
                <button
                  onClick={() => setLanguagePriority('TH_FIRST')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    languagePriority === 'TH_FIRST' ? 'bg-orange-500 text-white' : 'text-stone-400'
                  }`}
                >
                  🇹🇭 Thai 1°
                </button>
                <button
                  onClick={() => setLanguagePriority('IT_FIRST')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    languagePriority === 'IT_FIRST' ? 'bg-orange-500 text-white' : 'text-stone-400'
                  }`}
                >
                  🇮🇹 Ita 1°
                </button>
                <button
                  onClick={() => setLanguagePriority('EN_FIRST')}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    languagePriority === 'EN_FIRST' ? 'bg-orange-500 text-white' : 'text-stone-400'
                  }`}
                >
                  🇬🇧 Eng 1°
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-amber-300 font-bold block mb-1">
                🇹🇭 {uiLang === 'IT' ? 'Titolo Principale (Tailandese - Bello Grosso Centrale)' : 'Main Title (Thai - Large & Centered)'}
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                className="w-full bg-stone-900 border border-amber-500/40 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-stone-300 font-semibold block mb-1">
                🇬🇧 {uiLang === 'IT' ? 'Sottotitolo / Dettaglio (Inglese - Più Piccolo Sotto)' : 'Subtitle (English - Smaller Below)'}
              </label>
              <textarea
                rows={activePlatform === 'facebook' ? 3 : 2}
                value={customSubtitle}
                onChange={e => setCustomSubtitle(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Badge Promozionale</label>
                <input
                  type="text"
                  value={customBadge}
                  onChange={e => setCustomBadge(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Prezzo / Offerta</label>
                <input
                  type="text"
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* 5. Regia Video Reel 9:16 (AutoCut 7.8s) - Visibile se in formato Video Reel */}
          {editorialFormat === 'video_reel' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>5. {uiLang === 'IT' ? 'Regia Video Reel 9:16 (AutoCut 7.8s)' : '9:16 Video Reel Director (7.8s AutoCut)'}</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                  Ken Burns + Atmosphere + Audio
                </span>
              </div>

              {/* Selettore Regia Cinematica (Pan & Scan Engine a 60 FPS) */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {uiLang === 'IT' ? 'Regia di Camera (Pan & Scan Unidirezionale)' : 'Camera Pan & Scan Motion'}
                  </span>
                  {selectedBrand === 'village' && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                      🏰 Alloggi Website (Pan & Diag)
                    </span>
                  )}
                </div>

                {selectedBrand === 'village' && (
                  <div className="mb-2.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 flex items-center gap-1.5">
                    <span>📐</span>
                    <span>
                      {uiLang === 'IT'
                        ? 'Regola Alloggi Website: per mostrare l\'intero alloggio sono attivi solo Pan Orizzontale & Diagonali.'
                        : 'Website Lodgings Rule: only Horizontal Pan & Diagonals active for 100% full-room visibility.'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setCameraTrajectory('auto_cinematic')}
                    className={`col-span-2 sm:col-span-3 px-2 py-2 rounded-lg border transition-all text-center ${
                      cameraTrajectory === 'auto_cinematic'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🎬 Auto Regia ({selectedBrand === 'village' ? 'Rotazione Pan & Diagonali' : 'Tutte le Traiettorie'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraTrajectory('pan_left_to_right')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      cameraTrajectory === 'pan_left_to_right'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ↔️ Pan SX➔DX
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraTrajectory('pan_right_to_left')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      cameraTrajectory === 'pan_right_to_left'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ↔️ Pan DX➔SX
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraTrajectory('diagonal_up_right')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      cameraTrajectory === 'diagonal_up_right'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ↗️ Basso-SX ➔ Alto-DX
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraTrajectory('diagonal_up_left')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      cameraTrajectory === 'diagonal_up_left'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ↖️ Basso-DX ➔ Alto-SX
                  </button>

                  {/* Effetti Verticali & Punch-in riservati a Food o clip Telegram/Cloud */}
                  <button
                    type="button"
                    disabled={selectedBrand === 'village'}
                    onClick={() => setCameraTrajectory('tilt_top_to_bottom')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      selectedBrand === 'village'
                        ? 'opacity-30 cursor-not-allowed bg-stone-950 border-stone-900 text-stone-600'
                        : cameraTrajectory === 'tilt_top_to_bottom'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                    title={selectedBrand === 'village' ? 'Disattivato per Alloggi Website: taglia la visuale della stanza' : ''}
                  >
                    ⬇️ Tilt Discesa
                  </button>
                  <button
                    type="button"
                    disabled={selectedBrand === 'village'}
                    onClick={() => setCameraTrajectory('tilt_bottom_to_top')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      selectedBrand === 'village'
                        ? 'opacity-30 cursor-not-allowed bg-stone-950 border-stone-900 text-stone-600'
                        : cameraTrajectory === 'tilt_bottom_to_top'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                    title={selectedBrand === 'village' ? 'Disattivato per Alloggi Website: taglia la visuale della stanza' : ''}
                  >
                    ⬆️ Tilt Salita
                  </button>
                  <button
                    type="button"
                    disabled={selectedBrand === 'village'}
                    onClick={() => setCameraTrajectory('push_in_focal')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      selectedBrand === 'village'
                        ? 'opacity-30 cursor-not-allowed bg-stone-950 border-stone-900 text-stone-600'
                        : cameraTrajectory === 'push_in_focal'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                    title={selectedBrand === 'village' ? 'Disattivato per Alloggi Website: taglia la visuale della stanza' : ''}
                  >
                    🎯 Punch-In
                  </button>
                </div>
              </div>

              {/* Selettore Atmosfera & Sovrimpressioni Grafiche (1 Unico Effetto Fisso a 60 FPS) */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {uiLang === 'IT' ? 'Effetto Grafico / Trasparenza (1 Unico Effetto Fisso)' : 'Visual Atmosphere Overlay (1 Fixed Mood)'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Zero Alternanza</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setOverlayAtmosphere('auto_context')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center flex items-center justify-center gap-1.5 ${
                      overlayAtmosphere === 'auto_context'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>🎭</span>
                    <span>{uiLang === 'IT' ? 'Auto Coerente (1 Fisso)' : 'Auto Mood (1 Fixed)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayAtmosphere('none')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      overlayAtmosphere === 'none'
                        ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow ring-1 ring-emerald-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🌿 {uiLang === 'IT' ? 'Puro (Zero Effetti)' : 'Clean (No Overlay)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayAtmosphere('light_streaks')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      overlayAtmosphere === 'light_streaks'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ⚡ Carezza di Luce (Tutto lo Schermo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayAtmosphere('warm_steam')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      overlayAtmosphere === 'warm_steam'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    💨 Vapore Caldo A Tutto Schermo
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayAtmosphere('tropical_sunbeams')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      overlayAtmosphere === 'tropical_sunbeams'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ☀️ Raggi Phayam (Raggiera Estesa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayAtmosphere('sparkle_stars')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      overlayAtmosphere === 'sparkle_stars'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ✦ Stelle Gourmet (18 Scintille)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayAtmosphere('abstract_bokeh')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      overlayAtmosphere === 'abstract_bokeh'
                        ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🌀 Bokeh Ottico f/1.2 (35-70px)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayAtmosphere('floating_hearts')}
                    className={`px-2 py-2 rounded-lg border transition-all text-center ${
                      overlayAtmosphere === 'floating_hearts'
                        ? 'bg-rose-500/25 border-rose-500 text-rose-300 shadow ring-1 ring-rose-500/40'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ❤️ Cuori Morbidi Fluttuanti
                  </button>
                </div>
              </div>

              {/* 🎵 Suite Sonora Ufficiale (Pizzeria: 5 Tagli Jingle R&B | Villaggio: 11 Brani Koh Phayam) */}
              <div className={`p-3.5 rounded-2xl border shadow-xl shadow-black/50 ${
                selectedBrand === 'village'
                  ? 'bg-gradient-to-br from-emerald-950/40 via-stone-900/90 to-teal-950/30 border-emerald-500/35'
                  : 'bg-gradient-to-br from-amber-950/40 via-stone-900/90 to-orange-950/30 border-amber-500/35'
              }`}>
                {/* Testata: Titolo + Play Generale + Switch ON/OFF */}
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-stone-800/80">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleAudioPreview()}
                      className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                        isPlayingAudioPreview
                          ? selectedBrand === 'village'
                            ? 'bg-emerald-500 text-stone-950 border-emerald-400 animate-pulse shadow-md shadow-emerald-500/40'
                            : 'bg-amber-500 text-stone-950 border-amber-400 animate-pulse shadow-md shadow-amber-500/40'
                          : 'bg-stone-950 border-stone-800 text-stone-300 hover:text-white hover:border-stone-600'
                      }`}
                      title={isPlayingAudioPreview ? 'Metti in Pausa' : 'Ascolta Traccia Attiva'}
                    >
                      {isPlayingAudioPreview ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Music className={`w-3.5 h-3.5 ${selectedBrand === 'village' ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <span className={selectedBrand === 'village' ? 'text-emerald-300' : 'text-amber-300'}>
                          {selectedBrand === 'village' ? 'Village Soundscape Suite' : 'Jingle Suite Ufficiale'}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                          selectedBrand === 'village'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {selectedBrand === 'village' ? 'Koh Phayam Vibes' : 'R&B Soul'}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                        <span className={`font-semibold ${selectedBrand === 'village' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {activeJingleTrack.code}. {activeJingleTrack.title}
                        </span>
                        <span>•</span>
                        <span className="text-stone-400 truncate max-w-[200px] sm:max-w-xs">{activeJingleTrack.tagline}</span>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-300 select-none bg-stone-950/90 px-2.5 py-1.5 rounded-lg border border-stone-800 hover:border-stone-700 shrink-0">
                    <input
                      type="checkbox"
                      checked={isJingleAudioEnabled}
                      onChange={e => setIsJingleAudioEnabled(e.target.checked)}
                      className={`w-4 h-4 rounded bg-stone-900 border-stone-700 cursor-pointer ${
                        selectedBrand === 'village' ? 'accent-emerald-500' : 'accent-amber-500'
                      }`}
                    />
                    <span className="text-[11px] text-stone-300 font-medium">
                      Audio nel Reel
                    </span>
                  </label>
                </div>

                {/* Selettore dei Brani / Stem */}
                <div className="pt-2.5">
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2 flex items-center justify-between">
                    <span>
                      {selectedBrand === 'village' 
                        ? `Colonna Sonora Resort (${currentBrandAudioTracks.length} Brani d'Atmosfera):` 
                        : 'Taglio Sonoro per il Reel (In Battuta 13s / 28s):'}
                    </span>
                    <span className="text-[9px] text-stone-400 font-normal">clicca per ascoltare & selezionare</span>
                  </div>

                  <div className={`grid grid-cols-2 sm:grid-cols-3 gap-1.5 ${
                    selectedBrand === 'village' ? 'max-h-64 overflow-y-auto pr-1' : ''
                  }`}>
                    {currentBrandAudioTracks.map(track => {
                      const isSelected = track.id === selectedJingleTrackId;
                      const isTrackPlaying = isSelected && isPlayingAudioPreview;

                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => toggleAudioPreview(track.id)}
                          className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? selectedBrand === 'village'
                                ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/50'
                                : 'bg-amber-950/50 border-amber-500/80 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-500/50'
                              : 'bg-stone-950/80 border-stone-800/90 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 w-full mb-1">
                            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-black/40 border border-white/5 font-bold text-stone-300">
                              {track.code}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                              isSelected
                                ? selectedBrand === 'village'
                                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                  : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                                : 'bg-stone-900 border-stone-700/60 text-stone-400'
                            }`}>
                              {track.badge}
                            </span>
                          </div>

                          <div className="flex items-center justify-between w-full">
                            <div className="truncate">
                              <div className="text-xs font-bold truncate text-white">
                                {track.title}
                              </div>
                              <div className="text-[9px] text-stone-400 truncate">
                                {track.part}
                              </div>
                            </div>
                            <div className="shrink-0 ml-1">
                              {isTrackPlaying ? (
                                <span className="flex h-2.5 w-2.5 relative">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                    selectedBrand === 'village' ? 'bg-emerald-400' : 'bg-amber-400'
                                  }`}></span>
                                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                    selectedBrand === 'village' ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}></span>
                                </span>
                              ) : isSelected ? (
                                <Check className={`w-3.5 h-3.5 ${selectedBrand === 'village' ? 'text-emerald-400' : 'text-amber-400'}`} />
                              ) : (
                                <Play className="w-3 h-3 text-stone-500" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Azioni di Schedulazione: Omnichannel Sync vs Singolo Canale */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            {/* Tasto 1 (Primario): Sincronizza Ecosistema Attivo */}
            <button
              onClick={handleScheduleUnified}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] border border-purple-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>
                {editorialFormat === 'video_reel'
                  ? (uiLang === 'IT'
                      ? '🌟 Sincronizza Reel su Instagram + Facebook + TikTok'
                      : '🌟 Sync Reel to Instagram + Facebook + TikTok')
                  : (uiLang === 'IT'
                      ? '🌟 Sincronizza Post su Facebook Feed + Google Maps'
                      : '🌟 Sync Post to Facebook Feed + Google Maps')}
              </span>
            </button>

            {/* Tasto 2 (Secondario): Pianifica solo per la piattaforma selezionata */}
            <button
              onClick={() => handleScheduleSingle(activePlatform)}
              className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-stone-300 bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 hover:text-white flex items-center justify-center gap-2 transition-all hover:border-orange-500/50"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>
                {uiLang === 'IT'
                  ? `Pianifica solo per ${adaptations[activePlatform]?.platformLabel}`
                  : `Schedule for ${adaptations[activePlatform]?.platformLabel} only`}
              </span>
            </button>
          </div>

          {scheduledSuccess && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg shadow-emerald-950/40">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>
                {scheduledMessage || (uiLang === 'IT'
                  ? 'Contenuto inserito con successo nel calendario di pubblicazione!'
                  : 'Content successfully scheduled into editorial calendar!')}
              </span>
            </div>
          )}

        </div>

        {/* COLONNA DESTRA: Mockup Telefono Verticale con Interfaccia NATIVA (5 Colonne) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* Selettore Skin Mockup Smartphone Super-Compatto (Zero Layout Shift) */}
          <div className="w-full max-w-[320px] mb-3 flex items-center justify-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 shadow-md">
            {editorialFormat === 'video_reel' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlatform('instagram');
                    setActiveMode('motion_reel');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activePlatform === 'instagram'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  <span>IG Reels</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlatform('facebook');
                    setActiveMode('motion_reel');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activePlatform === 'facebook'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  <span>FB Reels</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlatform('tiktok');
                    setActiveMode('motion_reel');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activePlatform === 'tiktok'
                      ? 'bg-stone-800 text-white shadow border border-stone-600'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>TikTok</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlatform('facebook');
                    setActiveMode('feed_post');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activePlatform === 'facebook'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Facebook Feed</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlatform('google');
                    setActiveMode('google_local');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activePlatform === 'google'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>Google Maps</span>
                </button>
              </>
            )}

            {/* Micro-pulsante Toggle Safe Zone Guide (Broadcast Meta/TikTok) */}
            <button
              type="button"
              onClick={() => setShowSafeZone(!showSafeZone)}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all border shrink-0 ${
                showSafeZone
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Mostra / Nascondi Linee Guida Safe Zone Ufficiali Meta & TikTok"
            >
              <span>📐 Safe Zone</span>
            </button>
          </div>

          {/* Sticky Smartphone Container (Zero Jump) */}
          <div className="sticky top-6 flex flex-col items-center">

          {/* Telaio Smartphone 9:16 */}
          <div className="relative w-[320px] h-[570px] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-stone-800 ring-1 ring-stone-700/50 flex flex-col justify-between overflow-hidden">
            
            {/* Notch / Speaker del telefono */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-900 rounded-full z-40" />

            {/* Contenuto interno dello smartphone */}
            <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden bg-stone-950 flex flex-col justify-between">
              
              {/* 📐 Griglia Safe Zone Ufficiale Meta / TikTok (se attiva) */}
              {showSafeZone && (
                <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between">
                  {/* Fascia Superiore Non Sicura (75px) */}
                  <div className="h-[75px] bg-red-500/10 border-b border-dashed border-red-500/60 flex items-start justify-end p-2">
                    <span className="text-[9px] font-mono font-bold bg-black/80 text-red-300 px-1.5 py-0.5 rounded border border-red-500/40">
                      Top UI (Status & Header)
                    </span>
                  </div>

                  {/* Area Libera Sicura Centrale */}
                  <div className="flex-1 flex justify-between">
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[10px] font-mono font-bold bg-black/75 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/50 shadow-lg">
                        ✅ Safe Zone (100% Visibile)
                      </span>
                    </div>
                    {/* Colonna Laterale Non Sicura (55px) */}
                    <div className="w-[55px] bg-red-500/10 border-l border-dashed border-red-500/60 flex items-center justify-center">
                      <span className="text-[8px] font-mono font-bold bg-black/80 text-red-300 px-1 py-0.5 rounded -rotate-90 whitespace-nowrap">
                        Actions (55px)
                      </span>
                    </div>
                  </div>

                  {/* Fascia Inferiore Non Sicura (145px) */}
                  <div className="h-[145px] bg-red-500/10 border-t border-dashed border-red-500/60 flex items-end justify-between p-2">
                    <span className="text-[9px] font-mono font-bold bg-black/80 text-red-300 px-1.5 py-0.5 rounded border border-red-500/40">
                      Bottom UI (Caption & Music)
                    </span>
                  </div>
                </div>
              )}
              
              {/* ⏯️ Pulsante Play / Replay al Centro dello Smartphone quando è in pausa o terminato */}
              {(!isPlayingMotion || isReelFinished) && editorialFormat === 'video_reel' && (
                <div 
                  onClick={handleToggleReelPlayback}
                  className="absolute inset-0 z-40 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer group transition-all"
                >
                  <button 
                    className="w-16 h-16 rounded-full bg-stone-900/90 border-2 border-amber-400 text-amber-300 shadow-2xl flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Riproduci Reel"
                  >
                    {isReelFinished ? (
                      <RefreshCw className="w-7 h-7 text-amber-300" />
                    ) : (
                      <Play className="w-8 h-8 text-amber-300 ml-1" />
                    )}
                  </button>
                  <span className="mt-3 px-3.5 py-1 rounded-full bg-stone-950/90 border border-stone-700 text-stone-200 text-[11px] font-bold shadow-xl tracking-wide">
                    {isReelFinished 
                      ? (uiLang === 'IT' ? '🔄 Rivedi Reel (7.8s)' : '🔄 Replay Reel (7.8s)') 
                      : (uiLang === 'IT' ? '▶ Riproduci Reel' : '▶ Play Reel')}
                  </span>
                </div>
              )}

              {/* 1. MOCKUP NATIVO TIKTOK (Video Reel o Carosello) */}
              {activePlatform === 'tiktok' && (
                <div className="relative w-full h-full flex flex-col justify-between select-none">
                  {editorialFormat === 'video_reel' || activeMode === 'motion_reel' ? (
                    <canvas ref={canvasRef} width={540} height={960} onClick={handleToggleReelPlayback} className="w-full h-full object-cover cursor-pointer" />
                  ) : (
                    <div className="relative w-full h-full flex flex-col justify-between">
                      <img src={currentSlide?.imageUrl || selectedItem.imageUrl} alt="TikTok" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

                      {/* Badge in alto al centro */}
                      {(customBadge || currentSlide?.badge) && (
                        <div className="absolute top-10 inset-x-0 flex justify-center z-20">
                          <span className="px-3 py-1 rounded-full bg-orange-600/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-sm border border-orange-400/40">
                            ✨ {customBadge || currentSlide?.badge}
                          </span>
                        </div>
                      )}

                      {/* Overlay a Sinistra */}
                      <div className="absolute left-3.5 right-16 bottom-24 z-20 flex flex-col items-start text-left pointer-events-none">
                        <h2 className="text-base font-black text-white text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] tracking-wide leading-snug font-sans space-y-0.5">
                          {formatSemanticLines(customTitle || currentSlide?.title || selectedItem.titleTh).map((line, idx) => (
                            <span key={idx} className="block whitespace-pre-wrap">{line}</span>
                          ))}
                        </h2>
                        <div className="text-xs font-semibold text-stone-300 text-left drop-shadow mt-1 leading-snug space-y-0.5">
                          {formatSemanticLines(customSubtitle || currentSlide?.subtitle || selectedItem.titleEn).map((line, idx) => (
                            <span key={idx} className="block whitespace-pre-wrap text-stone-300/90">{line}</span>
                          ))}
                        </div>
                        {selectedItem.price && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/85 backdrop-blur-md text-white shadow-xl border border-amber-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                            <span className="text-xs font-black tracking-wide text-white">
                              {selectedItem.price}
                            </span>
                            <span className="text-[10px] font-bold text-amber-300 tracking-wider">
                              THB
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Header Nativo TikTok (Seguiti | Per te + Cerca) */}
                  <div className="absolute top-5 inset-x-0 z-30 flex items-center justify-between px-4 text-white pointer-events-none drop-shadow">
                    <div className="w-5" />
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-stone-300/80 hover:text-white">Seguiti</span>
                      <div className="flex flex-col items-center">
                        <span className="text-white font-black tracking-wide">Per te</span>
                        <span className="w-4 h-0.5 bg-white rounded-full mt-0.5 shadow-sm" />
                      </div>
                    </div>
                    <Search className="w-4 h-4 text-white drop-shadow" />
                  </div>

                  {/* Icone laterali native TikTok */}
                  <div className="absolute right-2 bottom-12 z-30 flex flex-col items-center gap-3 text-white pointer-events-none">
                    {/* Profilo con Badge '+' Rosso */}
                    <div className="relative mb-1">
                      <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-lg bg-stone-900">
                        <img src={selectedItem.imageUrl} className="w-full h-full object-cover" alt="avatar" />
                      </div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <Heart className="w-6 h-6 text-white fill-white/10 drop-shadow" />
                      <span className="text-[9px] font-bold text-white drop-shadow">8.4K</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageCircle className="w-6 h-6 text-white fill-white/10 drop-shadow" />
                      <span className="text-[9px] font-bold text-white drop-shadow">246</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bookmark className="w-6 h-6 text-white fill-white/10 drop-shadow" />
                      <span className="text-[9px] font-bold text-white drop-shadow">618</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Share2 className="w-6 h-6 text-white drop-shadow" />
                      <span className="text-[9px] font-bold text-white drop-shadow">115</span>
                    </div>

                    {/* Disco Vinile Rotante con Solchi */}
                    <div className="w-8 h-8 rounded-full bg-stone-950 border-2 border-stone-700 animate-spin-slow flex items-center justify-center shadow-xl relative mt-1">
                      <div className="w-3.5 h-3.5 rounded-full border border-stone-800 bg-amber-500 flex items-center justify-center overflow-hidden">
                        <span className="text-[7px]">🎵</span>
                      </div>
                    </div>
                  </div>

                  {/* Didascalia Nativa TikTok in Basso a Sinistra (Vero Post Social) */}
                  <div className="absolute bottom-3 left-3 right-14 z-30 flex flex-col items-start text-left text-white pointer-events-none">
                    <p className="text-xs font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] tracking-wide font-sans">
                      @flowerpower_{selectedItem.brand}
                    </p>

                    <div className="mt-1 text-left w-full pointer-events-auto">
                      <p className={`text-[11px] leading-snug text-stone-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] whitespace-pre-line font-sans transition-all ${
                        isCaptionExpanded 
                          ? 'max-h-36 overflow-y-auto pr-1 bg-black/75 backdrop-blur-sm p-2 rounded-lg border border-white/20' 
                          : 'line-clamp-2'
                      }`}>
                        {tiktokCaption}
                      </p>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setIsCaptionExpanded(!isCaptionExpanded); }}
                        className="text-[10px] font-bold text-stone-300 hover:text-white underline mt-0.5 drop-shadow cursor-pointer"
                      >
                        {isCaptionExpanded ? (uiLang === 'IT' ? 'meno' : 'less') : (uiLang === 'IT' ? '...altro' : '...more')}
                      </button>
                    </div>

                    {/* Ticker Audio TikTok */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-stone-200 drop-shadow truncate max-w-full">
                      <Music className="w-3 h-3 text-white shrink-0 animate-pulse" />
                      <span className="truncate">Suono originale - {activeJingleTrack.title} • Flower Power</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MOCKUP NATIVO INSTAGRAM REELS */}
              {activePlatform === 'instagram' && (
                <div className="relative w-full h-full flex flex-col justify-between select-none">
                  <canvas ref={canvasRef} width={540} height={960} onClick={handleToggleReelPlayback} className="w-full h-full object-cover cursor-pointer" />
                  
                  {/* Top Bar Instagram Reels (Reels ⌄ + Fotocamera) */}
                  <div className="absolute top-5 inset-x-0 z-30 flex items-center justify-between px-4 text-white pointer-events-none drop-shadow">
                    <div className="flex items-center gap-1 text-sm font-extrabold tracking-wide">
                      <span>Reels</span>
                      <span className="text-xs">⌄</span>
                    </div>
                    <Camera className="w-4 h-4 text-white drop-shadow" />
                  </div>

                  {/* Icone laterali native Instagram Reels */}
                  <div className="absolute right-2 bottom-12 z-30 flex flex-col items-center gap-3.5 text-white pointer-events-none">
                    <div className="flex flex-col items-center">
                      <Heart className="w-6 h-6 text-white drop-shadow stroke-[2.2]" />
                      <span className="text-[9px] font-bold text-white drop-shadow mt-0.5">2.9K</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageCircle className="w-6 h-6 text-white drop-shadow stroke-[2.2]" />
                      <span className="text-[9px] font-bold text-white drop-shadow mt-0.5">142</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Send className="w-6 h-6 text-white drop-shadow -rotate-12 stroke-[2.2]" />
                      <span className="text-[9px] font-bold text-white drop-shadow mt-0.5">88</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MoreHorizontal className="w-5 h-5 text-white drop-shadow stroke-[2.5]" />
                    </div>

                    {/* Copertina Mini Audio con Bordo */}
                    <div className="w-6 h-6 rounded-md border border-white/80 overflow-hidden shadow-lg bg-stone-900 mt-1">
                      <img src={selectedItem.imageUrl} className="w-full h-full object-cover" alt="audio cover" />
                    </div>
                  </div>

                  {/* Didascalia Nativa Instagram in Basso a Sinistra (Vero Post Social) */}
                  <div className="absolute bottom-3 left-3 right-14 z-30 flex flex-col items-start text-left text-white pointer-events-none">
                    {/* Profilo & Tasto Segui */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full border border-white/80 overflow-hidden shadow shrink-0 bg-stone-900">
                        <img src={selectedItem.imageUrl} className="w-full h-full object-cover" alt="avatar" />
                      </div>
                      <span className="text-xs font-bold drop-shadow text-white truncate max-w-[125px]">
                        flowerpower_{selectedItem.brand}
                      </span>
                      <span className="text-[10px] border border-white/80 px-2 py-0.5 rounded-full font-bold text-white shadow-sm bg-black/20 backdrop-blur-sm">
                        Segui
                      </span>
                    </div>

                    {/* Contenuto Post Reale con Toggle Espandi */}
                    <div className="mt-1.5 text-left w-full pointer-events-auto">
                      <p className={`text-[11px] leading-snug text-stone-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] whitespace-pre-line font-sans transition-all ${
                        isCaptionExpanded 
                          ? 'max-h-36 overflow-y-auto pr-1 bg-black/75 backdrop-blur-sm p-2 rounded-lg border border-white/20' 
                          : 'line-clamp-2'
                      }`}>
                        {instagramCaption}
                      </p>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setIsCaptionExpanded(!isCaptionExpanded); }}
                        className="text-[10px] font-bold text-stone-300 hover:text-white underline mt-0.5 drop-shadow cursor-pointer"
                      >
                        {isCaptionExpanded ? (uiLang === 'IT' ? 'meno' : 'less') : (uiLang === 'IT' ? '...altro' : '...more')}
                      </button>
                    </div>

                    {/* Audio Bar Instagram */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-stone-200 drop-shadow truncate max-w-full">
                      <Music className="w-3 h-3 text-white shrink-0" />
                      <span className="truncate">flowerpower_{selectedItem.brand} • Audio originale</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MOCKUP NATIVO FACEBOOK: REELS (Video) vs POST FEED (Foto & Link) */}
              {activePlatform === 'facebook' && (
                editorialFormat === 'video_reel' || activeMode === 'motion_reel' ? (
                  <div className="relative w-full h-full flex flex-col justify-between select-none">
                    <canvas ref={canvasRef} width={540} height={960} onClick={handleToggleReelPlayback} className="w-full h-full object-cover cursor-pointer" />
                    
                    {/* Top Bar Facebook Reels */}
                    <div className="absolute top-5 left-4 z-30 flex items-center gap-2 text-white font-black text-xs drop-shadow pointer-events-none">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-black shadow">f</div>
                      <span>Reels</span>
                    </div>

                    {/* Icone laterali native Facebook Reels */}
                    <div className="absolute right-2 bottom-12 z-30 flex flex-col items-center gap-3.5 text-white pointer-events-none">
                      <div className="flex flex-col items-center">
                        <ThumbsUp className="w-6 h-6 text-white drop-shadow stroke-[2.2]" />
                        <span className="text-[9px] font-bold text-white drop-shadow mt-0.5">3.1K</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <MessageCircle className="w-6 h-6 text-white drop-shadow stroke-[2.2]" />
                        <span className="text-[9px] font-bold text-white drop-shadow mt-0.5">84</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Share2 className="w-6 h-6 text-white drop-shadow stroke-[2.2]" />
                        <span className="text-[9px] font-bold text-white drop-shadow mt-0.5">52</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <MoreHorizontal className="w-5 h-5 text-white drop-shadow stroke-[2.5]" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-blue-600/90 border border-white/80 animate-spin-slow flex items-center justify-center shadow-lg mt-1">
                        <span className="text-[8px]">🎵</span>
                      </div>
                    </div>

                    {/* Bottom bar Facebook Reels con Didascalia Reale */}
                    <div className="absolute bottom-3 left-3 right-14 z-30 flex flex-col items-start text-left text-white pointer-events-none">
                      {/* Pagina & Tasto Segui */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full border border-blue-500 overflow-hidden shadow shrink-0 bg-stone-900">
                          <img src={selectedItem.imageUrl} className="w-full h-full object-cover" alt="avatar" />
                        </div>
                        <span className="text-xs font-bold drop-shadow text-white truncate max-w-[125px]">
                          Flower Power {selectedItem.brand === 'pizza' ? 'Ranong' : 'Village'}
                        </span>
                        <span className="text-blue-400 text-[10px] font-bold">✔</span>
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                          Segui
                        </span>
                      </div>

                      {/* Contenuto Post Reale con Toggle Espandi */}
                      <div className="mt-1.5 text-left w-full pointer-events-auto">
                        <p className={`text-[11px] leading-snug text-stone-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] whitespace-pre-line font-sans transition-all ${
                          isCaptionExpanded 
                            ? 'max-h-36 overflow-y-auto pr-1 bg-black/75 backdrop-blur-sm p-2 rounded-lg border border-white/20' 
                            : 'line-clamp-2'
                        }`}>
                          {facebookReelsCaption}
                        </p>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setIsCaptionExpanded(!isCaptionExpanded); }}
                          className="text-[10px] font-bold text-stone-300 hover:text-white underline mt-0.5 drop-shadow cursor-pointer"
                        >
                          {isCaptionExpanded ? (uiLang === 'IT' ? 'meno' : 'less') : (uiLang === 'IT' ? '...altro' : '...more')}
                        </button>
                      </div>

                      {/* Audio Bar Facebook */}
                      <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-stone-200 drop-shadow truncate max-w-full">
                        <Music className="w-3 h-3 text-white shrink-0" />
                        <span className="truncate">Flower Power • Audio originale</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-stone-900 text-stone-100 flex flex-col justify-between p-3 overflow-y-auto">
                    {/* Facebook Header */}
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                            FP
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white flex items-center gap-1">
                              Flower Power {selectedItem.brand === 'pizza' ? 'Pizza Ranong' : 'Village'}
                              <span className="text-blue-400 text-[10px]">✔</span>
                            </p>
                            <p className="text-[10px] text-stone-400">Poco fa • 🌍</p>
                          </div>
                        </div>
                      </div>

                      {/* Testo Post Facebook */}
                      <div className="py-2 text-left space-y-1.5">
                        <p className="text-xs font-semibold text-white">{customTitle}</p>
                        <p className="text-[11px] text-stone-300 leading-relaxed whitespace-pre-line">{customSubtitle}</p>
                        
                        {/* Link cliccabile Facebook */}
                        <a 
                          href={adaptations.facebook.clickableLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 underline pt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {adaptations.facebook.clickableLink}
                        </a>
                      </div>
                    </div>

                    {/* Immagine Post Facebook */}
                    <div className="relative rounded-xl overflow-hidden my-2 border border-stone-800 h-48">
                      <img src={selectedItem.imageUrl} className="w-full h-full object-cover" alt="FB" />
                      {customBadge && (
                        <span className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {customBadge}
                        </span>
                      )}
                    </div>

                    {/* Facebook Bottom Bar Like/Comment */}
                    <div className="pt-2 border-t border-stone-800 flex items-center justify-around text-stone-400 text-xs">
                      <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Mi piace</span>
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-stone-200 cursor-pointer">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Commenta</span>
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-stone-200 cursor-pointer">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Condividi</span>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* 4. MOCKUP NATIVO GOOGLE MAPS (Business Profile) */}
              {activePlatform === 'google' && (
                <div className="relative w-full h-full bg-stone-900 text-stone-100 flex flex-col justify-between p-3.5 text-left">
                  {/* Google Maps Header */}
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Google Maps • Scheda Attività</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Flower Power {selectedItem.brand === 'pizza' ? 'Pizza & Wine (Ranong)' : 'Farm Village (Koh Phayam)'}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 my-1">
                      <span>4.9</span>
                      <div className="flex text-amber-400">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-stone-400 text-[10px]">(248 recensioni) • ฿฿</span>
                    </div>
                  </div>

                  {/* Foto Statica Pulita in Alta Risoluzione */}
                  <div className="relative rounded-xl overflow-hidden border border-stone-800 h-52 my-2 shadow-md">
                    <img src={selectedItem.imageUrl} className="w-full h-full object-cover" alt="Google Local" />
                    {selectedItem.price && (
                      <span className="absolute bottom-2 right-2 bg-amber-400 border-2 border-black text-black font-black text-xs px-2.5 py-0.5 rounded-lg shadow-md">
                        {selectedItem.price} ฿
                      </span>
                    )}
                  </div>

                  {/* Dettagli e Pulsante Ordina Online */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-200">{customTitle}</p>
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{customSubtitle}</p>
                    
                    <a
                      href={adaptations.google.clickableLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all mt-1"
                    >
                      <span>{adaptations.google.ctaText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

            </div>

            {/* Frecce di Navigazione Carosello se in modalità Carosello Foto */}
            {activeMode === 'carousel' && activePlatform === 'tiktok' && editorialFormat !== 'video_reel' && slides.length > 1 && (
              <div className="flex items-center justify-between px-2 pt-2 text-stone-400 text-xs z-30">
                <button
                  onClick={() => setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : slides.length - 1))}
                  className="p-1 rounded-full hover:bg-stone-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-mono text-[11px]">
                  Slide {currentSlideIndex + 1} di {slides.length}
                </span>
                <button
                  onClick={() => setCurrentSlideIndex(prev => (prev < slides.length - 1 ? prev + 1 : 0))}
                  className="p-1 rounded-full hover:bg-stone-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Pulsante Download Video Reel 9:16 (sotto lo smartphone, visibile se video_reel) */}
          {editorialFormat === 'video_reel' && (
            <div className="w-full max-w-[320px] mt-3">
              <button
                type="button"
                onClick={handleExportReelVideo}
                disabled={isRecordingVideo}
                className={`w-full py-3 px-3 rounded-xl font-bold text-xs text-white border transition-all flex items-center justify-center gap-2 ${
                  isRecordingVideo
                    ? 'bg-amber-600/30 border-amber-500/50 cursor-not-allowed'
                    : 'bg-stone-950 hover:bg-stone-850 border-amber-500/40 text-amber-300 hover:text-white shadow-lg shadow-amber-500/10 hover:border-amber-400'
                }`}
              >
                {isRecordingVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>
                      {uiLang === 'IT'
                        ? `Registrazione Reel... ${recordingProgress}% (60 FPS)`
                        : `Recording Reel... ${recordingProgress}% (60 FPS)`}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>
                      {uiLang === 'IT' ? '🎥 Scarica Video Reel 9:16 HD (60 FPS)' : '🎥 Download 9:16 Reel Video HD (60 FPS)'}
                    </span>
                  </>
                )}
              </button>

              {isRecordingVideo && (
                <div className="w-full bg-stone-950 rounded-full h-1.5 mt-2 border border-stone-800 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 transition-all duration-200" 
                    style={{ width: `${recordingProgress}%` }}
                  />
                </div>
              )}

              {downloadedVideoNotice && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{uiLang === 'IT' ? 'Video Reel salvato nel computer!' : 'Reel Video saved to your computer!'}</span>
                </div>
              )}
            </div>
          )}

          </div>
        </div>

      </div>
    </div>
  );
};

