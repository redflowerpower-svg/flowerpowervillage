import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Copy, Check, RefreshCw,
  MapPin, AtSign, Calendar, Share2, Tag,
  ExternalLink, MousePointerClick, MessageSquare,
  Users, CheckCircle2, Sliders, ShieldCheck,
  Layers, ArrowDown, FileText, Send
} from 'lucide-react';
import { AutoCutTestRun } from '../services/autoCutLabEngine';
import { findAccommodationIdentity } from '../../booking/resort/config/accommodations';
import { 
  generatePostCopy, 
  ensureLangFlag,
  toUnicodeBold,
  applyUnicodeBoldHook,
  sanitizeSocialBullets,
  PostCopyResult 
} from '../services/autoCutCopywriterEngine';
import { 
  DistributionChannelId, 
  ChannelFormatMap,
  TikTokLogo, 
  GoogleLogo, 
  FacebookLogo, 
  InstagramLogo 
} from './AutoCutDistributionPanel';
import { getLiveWeather, WeatherConditionSummary } from '../services/ranongWeatherService';

export function DeepSeekWhaleLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        fill="#3B82F6" 
        d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-1.12-1.35c.038-.344.298-.597.64-.618.342-.02.664.195.769.525.048.15.068.303.041.455z" 
      />
    </svg>
  );
}

export interface UpcomingHoliday {
  name: string;
  nameThai: string;
  dateStr: string;
  emoji: string;
  daysAway: number;
}

export function getUpcomingHoliday(referenceDate: Date = new Date()): UpcomingHoliday {
  const year = referenceDate.getFullYear();
  
  // Calendario Festività Nazionali Thai & Internazionali
  const holidaySchedule: Array<{
    name: string;
    nameThai: string;
    month: number; // 0-11
    day: number;
    emoji: string;
  }> = [
    { name: 'Capodanno', nameThai: 'วันขึ้นปีใหม่', month: 0, day: 1, emoji: '🎆' },
    { name: "San Valentino", nameThai: 'วันวาเลนไทน์', month: 1, day: 14, emoji: '💖' },
    { name: 'Chakri Memorial Day', nameThai: 'วันจักรี', month: 3, day: 6, emoji: '👑' },
    { name: 'Songkran (Capodanno Thai)', nameThai: 'วันสงกรานต์', month: 3, day: 13, emoji: '💦' },
    { name: 'Festa del Lavoro', nameThai: 'วันแรงงานแห่งชาติ', month: 4, day: 1, emoji: '🛠️' },
    { name: 'Festa della Mamma Thai', nameThai: 'วันแม่แห่งชาติ', month: 7, day: 12, emoji: '💙' },
    { name: 'King Chulalongkorn Day', nameThai: 'วันปิยมหาราช', month: 9, day: 23, emoji: '🏛️' },
    { name: 'Halloween', nameThai: 'วันฮาโลวีน', month: 9, day: 31, emoji: '🎃' },
    { name: 'Loy Krathong', nameThai: 'วันลอยกระทง', month: 10, day: 15, emoji: '🌕' },
    { name: 'Festa del Re / National Day', nameThai: 'วันชาติไทย', month: 11, day: 5, emoji: '🇹🇭' },
    { name: 'Giorno della Costituzione', nameThai: 'วันรัฐธรรมนูญ', month: 11, day: 10, emoji: '📜' },
    { name: 'Natale', nameThai: 'วันคริสต์มาส', month: 11, day: 25, emoji: '🎄' },
    { name: "San Silvestro", nameThai: 'วันสิ้นปี', month: 11, day: 31, emoji: '✨' },
  ];

  const todayMs = new Date(year, referenceDate.getMonth(), referenceDate.getDate()).getTime();
  
  let nextHoliday: { name: string; nameThai: string; month: number; day: number; emoji: string } | null = null;
  let targetYear = year;

  for (const h of holidaySchedule) {
    const hDate = new Date(year, h.month, h.day).getTime();
    if (hDate >= todayMs) {
      nextHoliday = h;
      break;
    }
  }

  if (!nextHoliday) {
    nextHoliday = holidaySchedule[0];
    targetYear = year + 1;
  }

  const targetDate = new Date(targetYear, nextHoliday.month, nextHoliday.day);
  const diffDays = Math.ceil((targetDate.getTime() - todayMs) / (1000 * 60 * 60 * 24));

  const monthNamesIt = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
  ];

  return {
    name: nextHoliday.name,
    nameThai: nextHoliday.nameThai,
    dateStr: `${nextHoliday.day} ${monthNamesIt[nextHoliday.month]}`,
    emoji: nextHoliday.emoji,
    daysAway: Math.max(0, diffDays)
  };
}

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
  channelFormats?: ChannelFormatMap;
  onChangeChannelFormat?: (channel: DistributionChannelId, format: any) => void;
  onCaptionsChange?: (captions: PostCaptionsBundle) => void;
  aiGenTrigger?: number;
}

export function AutoCutPostCopywriter({ 
  testRun,
  selectedChannel = 'tiktok',
  onSelectChannel,
  channelFormats,
  onChangeChannelFormat,
  onCaptionsChange,
  aiGenTrigger
}: AutoCutPostCopywriterProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [liveWeather, setLiveWeather] = useState<WeatherConditionSummary | null>(null);
  const [aiOverride, setAiOverride] = useState<{
    thaiContent?: string;
    englishContent?: string;
    promptSent?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    } | null;
  } | null>(null);
  const [showPromptInspector, setShowPromptInspector] = useState(false);

  // 💰 Saldo Ufficiale Account DeepSeek API e Token Tracking
  const [accountBalance, setAccountBalance] = useState<{
    totalBalanceUsd: number;
    totalBalanceThb: number;
    estimatedTokensRemaining: number;
    currency: string;
  } | null>(null);

  const [accumulatedTokens, setAccumulatedTokens] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const val = localStorage.getItem('autocut_deepseek_accumulated_tokens');
        return val ? parseInt(val, 10) || 0 : 0;
      } catch (e) { return 0; }
    }
    return 0;
  });

  const fetchDeepSeekBalance = React.useCallback(async () => {
    try {
      const res = await fetch('/api/social-publisher?action=deepseek_balance');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.balance?.balance_infos?.[0]) {
          const info = json.balance.balance_infos[0];
          const totalUsd = parseFloat(info.total_balance) || 0;
          const totalThb = totalUsd * 35;
          const estTokens = Math.floor(totalUsd / 0.00000060);
          setAccountBalance({
            totalBalanceUsd: totalUsd,
            totalBalanceThb: totalThb,
            estimatedTokensRemaining: estTokens,
            currency: info.currency || 'USD'
          });
        }
      }
    } catch (e) {
      console.warn('[AutoCutPostCopywriter] fetch balance notice:', e);
    }
  }, []);

  React.useEffect(() => {
    fetchDeepSeekBalance();
  }, [fetchDeepSeekBalance]);

  // Metriche Token e Costo stimato in THB per DeepSeek AI
  const aiCostMetrics = useMemo(() => {
    const usage = aiOverride?.usage;
    const promptTokens = usage?.prompt_tokens || 450;
    const completionTokens = usage?.completion_tokens || 170;
    const totalTokens = usage?.total_tokens || (promptTokens + completionTokens);
    // DeepSeek V3: $0.14/1M input, $0.28/1M output, cambio 1 USD = 35 THB
    const costUsd = (promptTokens * 0.00000014) + (completionTokens * 0.00000028);
    const costThb = (costUsd * 35).toFixed(4); // es. "0.0039"
    return {
      hasRealUsage: !!usage,
      totalTokens,
      costThb
    };
  }, [aiOverride]);

  // Calcolo Dinamico Mese, Stagione & Prossima Festività (Ranong / Koh Phayam / Internazionali)
  const now = useMemo(() => new Date(), []);
  const currentMonthName = useMemo(() => {
    const monthNamesIt = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return monthNamesIt[now.getMonth()];
  }, [now]);

  const currentSeasonTag = useMemo(() => {
    const m = now.getMonth();
    // Nov - Apr = High Season, Mag - Ott = Green Season
    return (m >= 10 || m <= 3) ? '☀️ High Season' : '🌿 Green Season';
  }, [now]);

  const upcomingHoliday = useMemo(() => getUpcomingHoliday(now), [now]);

  // Stati Dinamici per Canale
  // 1. TikTok State
  const [tiktokPoi, setTiktokPoi] = useState(testRun.brand === 'pizza' ? 'Flower Power Pizza Ranong' : 'Flower Power Village Koh Phayam');
  const [tiktokDuet, setTiktokDuet] = useState(true);
  const [tiktokStitch, setTiktokStitch] = useState(true);
  const [tiktokComment, setTiktokComment] = useState(true);

  // 2. Instagram State
  const [igPlacement, setIgPlacement] = useState<'reels' | 'stories'>('reels');
  const [igStickerUrl, setIgStickerUrl] = useState(testRun.brand === 'pizza' ? 'https://www.flowerpowerpizza.com/delivery' : 'https://www.flowerpowervillage.com');
  const [igStickerText, setIgStickerText] = useState(testRun.brand === 'pizza' ? 'Ordina Online (-10%)' : 'Prenota Bungalow');
  const [igCollaborator, setIgCollaborator] = useState(testRun.brand === 'pizza' ? '@flowerpowerphayam' : '@flowerpowerpizzaranong');

  // 3. Facebook State
  const [fbCtaType, setFbCtaType] = useState(testRun.brand === 'pizza' ? 'ORDER_NOW' : 'BOOK_NOW');
  const [fbTargetUrl, setFbTargetUrl] = useState(testRun.brand === 'pizza' ? 'https://www.flowerpowerpizza.com' : 'https://www.flowerpowervillage.com');
  const [fbCheckin, setFbCheckin] = useState(testRun.brand === 'pizza' ? 'Flower Power Pizza Ranong' : 'Flower Power Village Koh Phayam');

  // 4. Formati e Parametri Dinamici Canali
  const activeTiktokFormat = channelFormats?.tiktok || 'feed';
  const activeInstagramFormat = channelFormats?.instagram || 'reels';
  const activeFacebookFormat = channelFormats?.facebook || 'post';
  const activeGoogleFormat = channelFormats?.google || 'update';

  const [googleCtaType, setGoogleCtaType] = useState(testRun.brand === 'pizza' ? 'ORDER' : 'BOOK');
  const [googleCoupon, setGoogleCoupon] = useState('WELCOME10');
  const [googleOfferTitle, setGoogleOfferTitle] = useState(testRun.brand === 'pizza' ? 'Sconto Benvenuto 10% Primo Ordine' : '10% Privilegio Prenotazione Diretta');
  const [googleStartDate, setGoogleStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [googleEndDate, setGoogleEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [googleTerms, setGoogleTerms] = useState(
    testRun.brand === 'pizza' 
      ? 'Valido per ordini delivery online diretti su flowerpowerpizza.com. Non cumulabile con altri sconti.' 
      : 'Valido per prenotazioni dirette sul sito ufficiale flowerpowervillage.com.'
  );

  // Firma identificativa univoca del video/scena attuale (cambia appena si genera un nuovo piatto/video/alloggio)
  const currentDishKey = testRun.scenes.map(s => `${s.sourceName || s.titlePrimary || ''}_${s.imageUrl}`).join('|');
  const testRunSignature = `${testRun.brand}_${testRun.mode}_${currentDishKey}`;

  // Risoluzione URL diretto univoco per gli alloggi del villaggio (V1, V2, V3, LM1)
  const villageAccIdent = React.useMemo(() => {
    if (testRun.brand !== 'village') return undefined;
    for (const s of testRun.scenes) {
      const match = findAccommodationIdentity(s.lodgingTitle) || findAccommodationIdentity(s.sourceName) || findAccommodationIdentity(s.titlePrimary);
      if (match) return match;
    }
    return undefined;
  }, [testRun]);

  const villageTargetUrl = villageAccIdent ? villageAccIdent.directUrl : 'https://www.flowerpowervillage.com';

  // Sincronizzazione automatica parametri al cambio modalità o brand
  React.useEffect(() => {
    const isP = testRun.brand === 'pizza';
    setTiktokPoi(isP ? 'Flower Power Pizza Ranong' : 'Flower Power Village Koh Phayam');
    setIgStickerUrl(isP ? 'https://www.flowerpowerpizza.com/delivery' : villageTargetUrl);
    setIgStickerText(isP ? 'Ordina Online (-10%)' : 'Prenota Bungalow');
    setIgCollaborator(isP ? '@flowerpowerphayam' : '@flowerpowerpizzaranong');
    setFbCtaType(isP ? 'ORDER_NOW' : 'BOOK_NOW');
    setFbTargetUrl(isP ? 'https://www.flowerpowerpizza.com' : villageTargetUrl);
    setFbCheckin(isP ? 'Flower Power Pizza Ranong' : 'Flower Power Village Koh Phayam');
    setGoogleCtaType(isP ? 'ORDER' : 'BOOK');
    setGoogleOfferTitle(isP ? 'Sconto Benvenuto 10% Primo Ordine' : '10% Privilegio Prenotazione Diretta');
  }, [testRun.brand, testRun.mode, villageTargetUrl]);

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

  // Calcolo seed deterministico basato sulla firma univoca del video (zero rimescolamenti arbitrari al cambio scheda!)
  const deterministicSeed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < testRunSignature.length; i++) {
      hash = ((hash << 5) - hash) + testRunSignature.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }, [testRunSignature]);

  // Genera i testi base deterministici a 0ms (con layout arioso, particelle e hashtag del piatto)
  const basePostData: PostCopyResult = useMemo(() => {
    return generatePostCopy(testRun, deterministicSeed);
  }, [testRun, deterministicSeed]);

  // Generazione Live con DeepSeek AI (SOLO su click manuale dell'utente o programmazione!)
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
        description: s.badgeCategory || '',
        priceValue: s.priceValue,
        priceLabel: s.priceLabel
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
          // Incrementa token accumulati e aggiorna saldo live
          const usedTok = json.data.usage?.total_tokens || 580;
          setAccumulatedTokens(prev => {
            const next = prev + usedTok;
            try { localStorage.setItem('autocut_deepseek_accumulated_tokens', String(next)); } catch (e) {}
            return next;
          });
          fetchDeepSeekBalance();

          // 🛡️ REGOLA 21: Salva nella cache locale associato alla firma univoca del piatto/video
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`autocut_ai_copy_${testRunSignature}`, JSON.stringify(json.data));
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.warn('[AutoCutPostCopywriter] DeepSeek API live notice:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  }, [testRun, basePostData.seasonContext, liveWeather, testRunSignature]);

  // Applica eventuale override live DeepSeek
  const postData: PostCopyResult = useMemo(() => {
    const isPizza = testRun.brand === 'pizza';

    // 🛡️ REGOLA IMMODIFICABILE 27: Zero elementi marini inesistenti per Flower Power Village
    const scrubNonExistentMarine = (t: string) => {
      if (isPizza) return t;
      return t
        .replace(/\b(sound of (the )?waves|sound of ocean waves|ocean waves|crashing waves|sound of the ocean|sound of the sea)\b/gi, 'peaceful sounds of nature')
        .replace(/\b(ocean breeze|sea breeze|island breezes|breezes from the sea)\b/gi, 'fresh tropical breeze')
        .replace(/\b(beachfront|on the beach|by the sea|steps from the beach|steps from the ocean)\b/gi, 'nestled in tropical nature')
        .replace(/\b(rumore delle onde|suono delle onde|onde dell'oceano|rumore del mare)\b/gi, 'suoni rilassanti della natura')
        .replace(/\b(brezza marina|brezza dell'oceano|brezza del mare)\b/gi, 'fresca brezza tropicale')
        .replace(/\b(in riva al mare|sulla spiaggia|fronte mare|a due passi dal mare)\b/gi, 'immerso nella natura tropicale')
        .replace(/เสียงคลื่น(ริมทะเล|ซัดสาด)?/g, 'เสียงธรรมชาติอันเงียบสงบ')
        .replace(/ลมทะเล/g, 'สายลมอ่อนท่ามกลางสวนทรอปิคอล')
        .replace(/ริมทะเล/g, 'ท่ามกลางธรรมชาติอันร่มรื่น')
        .replace(/🌊/g, '🌺');
    };

    // 🛡️ REGOLA IMMODIFICABILE 16 & 18: Zero hashtag inline e zero forno a legna
    const scrubWoodFired = (t: string) => {
      return t
        .replace(/\b(wood-fired|wood fired|wood-oven|wood oven)\s*(oven|pizza|crust)?/gi, 'authentic Italian pizza')
        .replace(/\bforno a legna\b/gi, 'forno tradizionale per pizza')
        .replace(/\baroma di legna\b/gi, 'profumo di pizza appena sfornata')
        .replace(/เตาฟืน/g, 'เตาอบพิซซ่า');
    };

    if (!aiOverride) {
      return {
        ...basePostData,
        thaiContent: sanitizeSocialBullets(applyUnicodeBoldHook(scrubNonExistentMarine(scrubWoodFired(basePostData.thaiContent)))),
        englishContent: sanitizeSocialBullets(applyUnicodeBoldHook(scrubNonExistentMarine(scrubWoodFired(basePostData.englishContent))))
      };
    }

    const stripTags = (t: string) => scrubNonExistentMarine(scrubWoodFired(t.replace(/[ \t]*#\S+/g, '').replace(/\n{3,}/g, '\n\n').trim()));
    const th = sanitizeSocialBullets(applyUnicodeBoldHook(ensureLangFlag(stripTags(aiOverride.thaiContent || basePostData.thaiContent), 'th')));
    const en = sanitizeSocialBullets(applyUnicodeBoldHook(ensureLangFlag(stripTags(aiOverride.englishContent || basePostData.englishContent), 'en')));
    const tagFooter = [...basePostData.thaiHashtags, ...basePostData.englishHashtags].join(' ');
    const fullCaptionInstagram = isPizza
      ? `${th}\n\n${en}\n\n${basePostData.fixedLink}\n\n${basePostData.crossTag}\n\n${tagFooter}`
      : `${en}\n\n${th}\n\n${basePostData.fixedLink}\n\n${basePostData.crossTag}\n\n${tagFooter}`;

    const fullCaptionTikTok = isPizza
      ? `${th}\n\n${en}\n\n${basePostData.fixedLink}\n${basePostData.crossTag}\n\n${tagFooter}`
      : `${en}\n\n${th}\n\n${basePostData.fixedLink}\n${basePostData.crossTag}\n\n${tagFooter}`;

    return {
      ...basePostData,
      thaiContent: th,
      englishContent: en,
      italianContent: '',
      fullCaptionInstagram,
      fullCaptionTikTok
    };
  }, [basePostData, aiOverride, testRun.brand]);

  // 🛡️ REGOLA 21 AGENTS.MD: ZERO SPRECO TOKEN & PERSISTENZA AL REFRESH E AL CAMBIO SCHEDA
  // 1. Controlla prima se per questa signature esiste già un copy AI salvato in localStorage
  // 2. Se esiste, caricalo all'istante a 0ms e ZERO CHIAMATE API (zero token consumati)
  // 3. Se NON esiste, mostra il copy base autonomo deterministico
  React.useEffect(() => {
    const cacheKey = `autocut_ai_copy_${testRunSignature}`;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.thaiContent || parsed.englishContent)) {
            setAiOverride(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading AI cache:', e);
      }
    }

    // Nessuna cache precedente: mostra il copy base senza chiamare DeepSeek a vuoto
    setAiOverride(null);
  }, [testRunSignature]);

  // 🚀 CHIAMATA ESPLICITA DEEPSEEK AI SU CLICK GENERAZIONE:
  // Viene eseguita SOLO quando l'utente clicca sul pulsante "Genera Nuovo Video"!
  // Al primo avvio/F5/refresh del browser isFirstMountRef protegge da qualsiasi chiamata automatica.
  const isFirstMountRef = React.useRef(true);
  const prevTriggerRef = React.useRef(aiGenTrigger);

  React.useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    if (aiGenTrigger !== undefined && aiGenTrigger > 0 && aiGenTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = aiGenTrigger;
      handleGenerateDeepSeekAi();
    }
  }, [aiGenTrigger, handleGenerateDeepSeekAi]);

  // Gestione copia negli appunti con feedback visivo
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const isPizza = testRun.brand === 'pizza';

  // 📜 Trasparenza Live: Calcolo del prompt ingegnerizzato in tempo reale (visibile a 0ms prima ancora di cliccare Rigenera!)
  const livePromptPreview = useMemo(() => {
    if (aiOverride?.promptSent) return aiOverride.promptSent;

    const isP = testRun.brand === 'pizza';
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const thaiDate = new Date(utc + (3600000 * 7));
    const thaiDayOfWeek = thaiDate.getDay();
    const thaiHours = thaiDate.getHours();

    const daysContext = [
      { it: 'Domenica', th: 'วันอาทิตย์', angle: 'Domenica di puro relax e ricarica: zero stress, comfort food sul divano prima di ricominciare la settimana.' },
      { it: 'Lunedì', th: 'วันจันทร์', angle: 'Lunedì: inizio settimana, serve una coccola o un boost di buonumore per partire alla grande.' },
      { it: 'Martedì', th: 'วันอังคาร', angle: 'Martedì: routine lavorativa, voglia di una pausa gustosa senza complicazioni.' },
      { it: 'Mercoledì', th: 'วันพุธ', angle: 'Mercoledì: giro di boa della settimana, ci si premia a metà percorso.' },
      { it: 'Giovedì', th: 'วันพฤหัสบดี', angle: 'Giovedì: aria di pre-weekend, si pianifica la serata con amici o famiglia.' },
      { it: 'Venerdì', th: 'วันศุกร์แห่งชาติ', angle: 'Venerdì Nazionale (วันศุกร์แห่งชาติ): festa e liberazione! Stasera niente fornelli, premiati con un pizza party!' },
      { it: 'Sabato', th: 'วันเสาร์', angle: 'Sabato sera: relax totale, maratona serie TV, film, amici o serata romantica.' }
    ];
    const todayCtx = daysContext[thaiDayOfWeek];

    let mealMoment = 'Cena & Serata (momento clou per rilassarsi, ordinare caldo a casa o cenare in compagnia)';
    if (thaiHours >= 11 && thaiHours < 15) {
      mealMoment = 'Pranzo (pausa appetitosa, energia autentica, consegna rapida in ufficio o a casa)';
    } else if (thaiHours >= 15 && thaiHours < 18) {
      mealMoment = 'Tardo Pomeriggio / Pre-Cena (il momento in cui sale la voglia di qualcosa di sfizioso e confortevole)';
    }

    let weatherAngle = 'Clima tropicale piacevole: perfetto per gustare una cena all\'aperto o rilassarsi con buon cibo.';
    if (liveWeather) {
      if (liveWeather.isRaining) {
        weatherAngle = isP
          ? `FUORI STA PIOVENDO A RANONG (${liveWeather.tempC}°C). In Thailandia e a Ranong la pioggia è l'occasione perfetta per il "Sabai Sabai": non bagnarsi in scooter, stare comodi sul divano con la serie TV, mentre il rider di Flower Power bussa con la pizza caldissima in scatola termica.`
          : `PIOGGIA TROPICALE A KOH PHAYAM (${liveWeather.tempC}°C). Il suono rilassante della pioggia sulle foglie di palma a Buffalo Bay e la quiete intima del bungalow.`;
      } else if (liveWeather.isNight) {
        weatherAngle = `Serata stellata tropicale (${liveWeather.tempC}°C): aria piacevole, brezza serale, la compagnia giusta e il profumo irresistibile delle specialità appena preparate.`;
      } else {
        weatherAngle = `Giornata serena e luminosa (${liveWeather.tempC}°C): sole tropicale, energia positiva, voglia di sapori freschi e autentici.`;
      }
    }

    const dishListText = testRun.scenes.map(s => {
      const name = (s.sourceName || s.titlePrimary || '').replace(/[\r\n]+/g, ' ').trim();
      const nameTh = (s.titleSecondary || '').replace(/[\r\n]+/g, ' ').trim();
      const desc = s.badgeCategory || 'Autentica ricetta artigianale';
      return `- ${name} (${nameTh}): ${desc}`;
    }).join('\n');

    if (testRun.mode === 'R1') {
      return `Sei il copywriter creativo di Flower Power Restaurant & Island Delivery a Koh Phayam, Thailandia (Buffalo Bay / อ่าวเขาควาย).
Scrivi un micro-post social biculturale (THAI in alto + INGLESE in basso) vivace, accogliente e appetitoso, per invitare le persone a mangiare nel nostro ristorante nel giardino tropicale o ordinare con consegna a domicilio su tutta l'isola di Koh Phayam via WhatsApp.

CONTESTO ATTUALE:
- I 5 Piatti protagonisti nel video di oggi:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${basePostData.seasonContext || 'Stagione tropicale'}
- Canali di contatto: WhatsApp Delivery +66 095 882 5573 | Tavolo nel giardino tropicale a Buffalo Bay | www.flowerpowervillage.com

REGOLE FONDAMENTALI DI SCRITTURA:
1. DIVIETO ASSOLUTO DI PARLARE DI UN SOLO PIATTO (REGOLA CORALE 5 PIATTI):
   Il video mostra una carrellata di 5 piatti diversi (es. pasta fresca fatta a mano, pizze tradizionali italiane da 12 pollici, secondi, insalate, burger).
   NON concentrarti solo sul primo piatto! Parla della varietà del menu o presenta i piatti protagonisti come un banchetto ideale da condividere in compagnia (Food Sharing).
2. CONTESTUALITÀ UMANA & METEO: Sfrutta pioggia, sole o serata dopo il mare in modo complice.
3. STRUTTURA: MASSIMO 4 RIGHE per lingua. Nomi piatti continui su singola riga. Proverbio del giorno. Chiusura WhatsApp (+66 095 882 5573). Zero forno a legna. Emoji contestuali.`;
    }

    if (testRun.mode === 'LM1') {
      return `Sei il copywriter creativo di Flower Power Village a Koh Phayam, Thailandia (eco-resort tropicale ad Aow Khao Kwai / Buffalo Bay).
Scrivi un micro-post / Story LAST MINUTE biculturale (INGLESE in alto + THAI in basso) ad altissima conversione, magnetico e dal ritmo vivace.

CONTESTO ATTUALE:
- Alloggi LIBERI STASERA con tariffe Last Minute certificate dal calendario Octorate:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${basePostData.seasonContext || 'Stagione tropicale'}
- Sito ufficiale per prenotazione istantanea: www.flowerpowervillage.com

REGOLE FONDAMENTALI DI SCRITTURA:
1. TEMA LAST MINUTE & URGENZA POSITIVA: Camere e bungalow liberi per stanotte a prezzi speciali a cascata verificati.
2. CITARE LA DISPONIBILITÀ: Menziona le opzioni disponibili stanotte e il vantaggio del prezzo speciale.
3. STRUTTURA: MASSIMO 3-4 RIGHE per lingua. Invito a prenotare subito su www.flowerpowervillage.com prima che si esauriscano. ZERO menzione di sunset/tramonto. Zero forno a legna. Emoji contestuali.`;
    }

    if (testRun.mode === 'V3') {
      return `Sei il copywriter creativo di Flower Power Village a Koh Phayam, Thailandia (eco-resort tropicale a Buffalo Bay / อ่าวเขาควาย).
Scrivi un micro-post social biculturale (INGLESE in alto + THAI in basso) immersivo ed evocativo per presentare la panoramica completa del resort con 5 alloggi diversi.

CONTESTO ATTUALE:
- I 5 Alloggi protagonisti del tour nel video:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${basePostData.seasonContext || 'Stagione tropicale'}
- Sito ufficiale: www.flowerpowervillage.com (Miglior tariffa diretta garantita online + 10% privilegio prenotazione diretta)

REGOLE FONDAMENTALI DI SCRITTURA:
1. RESORT TOUR DEI 5 ALLOGGI (VARIETÀ & SPIRITO SLOW LIFE):
   Panoramica di 5 alloggi diversi (dalla suite panoramica ai bungalow in legno nei giardini e tende glamping). Un angolo di paradiso per ogni viaggiatore.
2. ATMOSFERA KOH PHAYAM: Pace autentica dell'isola car-free, amaca tra le palme, brezza e profumo dei fiori a Buffalo Bay.
3. STRUTTURA: MASSIMO 3-4 RIGHE per lingua. Proverbio sul viaggio/lentezza. Chiusura su www.flowerpowervillage.com. ZERO parola sunset. Zero forno a legna. Emoji contestuali.`;
    }

    if (isP) {
      return `Sei il copywriter creativo di Flower Power Pizza a Ranong, Thailandia (autentica pizzeria tradizionale e cucina artigianale italiana).
Scrivi un micro-post social biculturale (THAI in alto + INGLESE in basso) magnetico, divertente e profondamente calato nel costume e nella vita reale thailandese.

CONTESTO ATTUALE:
- Piatti protagonisti:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${basePostData.seasonContext || 'Clima tropicale'}
- Sito ufficiale: www.flowerpowerpizza.com (10% sconto primo ordine online)

REGOLE FONDAMENTALI DI SCRITTURA:
1. DIVIETO BOLLETTINO METEO: Varia sempre l'attacco (esperienza sensoriale, relax serale, pizza party).
2. GERGO THAI: Caldo, spontaneo, moderno.
3. STRUTTURA: MASSIMO 3-4 RIGHE per lingua. Nomi piatti continui su singola riga. Proverbio del giorno. Chiusura flowerpowerpizza.com (-10%). ZERO forno a legna. Emoji contestuali.`;
    }

    return `Sei il copywriter creativo di Flower Power Village a Koh Phayam, Thailandia (eco-resort tropicale a Buffalo Bay / อ่าวเขาควาย).
Scrivi un micro-post social biculturale (INGLESE in alto + THAI in basso) evocativo, rilassante e magnetico.

CONTESTO ATTUALE:
- Alloggio protagonista:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${basePostData.seasonContext || 'Stagione tropicale'}
- Sito ufficiale: www.flowerpowervillage.com (Miglior tariffa diretta garantita)

REGOLE FONDAMENTALI DI SCRITTURA:
1. DIVIETO DI MONOTONIA: Varia sempre l'attacco (rumore del mare, magia del legno, slow life).
2. CULTURA SLOW LIFE DI KOH PHAYAM: Pace autentica, amaca, brezza a Buffalo Bay.
3. STRUTTURA: MASSIMO 3-4 RIGHE per lingua. Nomi alloggi continui. Proverbio saggio. Chiusura flowerpowervillage.com. ZERO sunset. Zero forno a legna. Emoji contestuali.`;
  }, [aiOverride, testRun, liveWeather, basePostData.seasonContext]);

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
    const tagFooter = [...postData.thaiHashtags, ...postData.englishHashtags].join(' ');
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${callout}\n\n${tagFooter}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${callout}\n\n${tagFooter}`;
  }, [postData, isPizza, tiktokPoi]);

  // 2. Didascalia Finale per Instagram
  const finalInstagramCaption = useMemo(() => {
    const siteUrl = isPizza ? 'www.flowerpowerpizza.com' : 'www.flowerpowervillage.com';
    const callout = igPlacement === 'stories'
      ? `🔗 Link Sticker: ${igStickerText} ➔ ${igStickerUrl}\n🌐 ${siteUrl}\n${postData.crossTag}`
      : `✨ จิ้มลิงก์หน้าโปรไฟล์เพื่อสั่งเดลิเวอรี่ / Link in Bio to Order 👆\n🌐 ${siteUrl} (${isPizza ? '10% Off 1st Order' : 'Best Rate Direct'})\n📍 ${isPizza ? 'Ranong Hotspring' : 'Buffalo Bay, Koh Phayam'}\nCo-Author: ${igCollaborator}\n${postData.crossTag}`;
    const tagFooter = [...postData.thaiHashtags, ...postData.englishHashtags].join(' ');
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${callout}\n\n${tagFooter}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${callout}\n\n${tagFooter}`;
  }, [postData, isPizza, igPlacement, igStickerText, igStickerUrl, igCollaborator]);

  // 3. Didascalia Finale per Facebook (Link 100% cliccabile)
  const finalFacebookCaption = useMemo(() => {
    const isGroup = activeFacebookFormat === 'group';
    const mapsLink = isPizza
      ? 'https://maps.app.goo.gl/qjpYt6t69y17R4DF6'
      : 'https://maps.app.goo.gl/mugY88Wpuzjeebf56';
    const siteUrl = isPizza ? 'https://www.flowerpowerpizza.com' : 'https://www.flowerpowervillage.com';
    const directLinkNotice = isPizza
      ? `👉 สั่งเดลิเวอรี่ออนไลน์ / Order Online Direct (10% Off):\n🔗 ${siteUrl}\n📍 Google Maps GPS:\n${mapsLink}\n📍 Check-in: ${fbCheckin}\n${postData.crossTag}`
      : `👉 จองห้องพักออนไลน์ / Book Your Island Stay Direct:\n🔗 ${siteUrl}\n📍 Google Maps GPS:\n${mapsLink}\n📍 Check-in: ${fbCheckin}\n${postData.crossTag}`;
    const tagFooter = [...postData.thaiHashtags, ...postData.englishHashtags].join(' ');

    // 🛡️ REGOLA IMMODIFICABILE: Se il post è destinato al Gruppo Facebook di Koh Phayam (isGroup),
    // la gerarchia linguistica è TASSATIVAMENTE:
    // 1️⃣ INGLESE (sopra per residenti internazionali, backpackers e viaggiatori)
    // 2️⃣ THAILANDESE (sotto)
    // 3️⃣ LINK SITO, GPS & CHECK-IN
    // 4️⃣ HASHTAG UNIFICATI RIGOROSAMENTE IN CODA (ALLA FINE, MAI IN MEZZO)
    if (isGroup) {
      return `${postData.englishContent}\n\n${postData.thaiContent}\n\n${directLinkNotice}\n\n${tagFooter}`;
    }

    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${directLinkNotice}\n\n${tagFooter}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${directLinkNotice}\n\n${tagFooter}`;
  }, [postData, isPizza, activeFacebookFormat, fbTargetUrl, fbCheckin]);

  // 4. Didascalia Finale per Google Business Profile (SEO Locale + Bottone)
  const finalGoogleCaption = useMemo(() => {
    const cleanThai = postData.thaiContent.replace(/#\S+/g, '').trim();
    const cleanEn = postData.englishContent.replace(/#\S+/g, '').trim();
    const siteUrl = isPizza ? 'www.flowerpowerpizza.com' : 'www.flowerpowervillage.com';
    const fullSiteUrl = isPizza ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com';
    
    if (activeGoogleFormat === 'offer') {
      const datesStr = `📅 Validità Promozione: dal ${googleStartDate} al ${googleEndDate}`;
      const couponStr = googleCoupon ? `🏷️ Codice Coupon: ${googleCoupon}` : '';
      const termsStr = googleTerms ? `📜 Condizioni: ${googleTerms}` : '';
      return `🎁 ${googleOfferTitle.toUpperCase()}\n\n${cleanThai}\n\n${cleanEn}\n\n${datesStr}\n${couponStr}\n${termsStr}\n🌐 ${siteUrl}\n📌 Pulsante Azione: [${googleCtaType}] ➔ ${fullSiteUrl}`;
    }
    if (activeGoogleFormat === 'media') {
      return `[Google Maps Media Gallery]\n\n${cleanThai}\n\n${cleanEn}\n\n📍 Geolocalizzazione: ${isPizza ? 'Ranong, Thailand' : 'Koh Phayam Island, Ranong'}\n🌐 ${siteUrl}`;
    }
    return `${cleanThai}\n\n${cleanEn}\n\n🌐 ${siteUrl} · ${isPizza ? 'Ranong Delivery' : 'Koh Phayam Resort'}\n📌 Pulsante Azione: [${googleCtaType}] ➔ ${fullSiteUrl}`;
  }, [postData, activeGoogleFormat, googleOfferTitle, googleCoupon, googleStartDate, googleEndDate, googleTerms, googleCtaType, isPizza]);

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
      {/* Glow d'atmosfera sottile */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        selectedChannel === 'tiktok' ? 'bg-cyan-500/5' :
        selectedChannel === 'google' ? 'bg-blue-500/5' :
        selectedChannel === 'facebook' ? 'bg-blue-600/5' :
        'bg-indigo-500/5'
      }`} />

      {/* 🧭 COCKPIT EXECUTIVE SOCIAL STUDIO (Ultra Compatto & Zero Spazio Sprecato) */}
      <div className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl space-y-3 relative z-10 backdrop-blur-sm">
        {/* RIGA 1: CANALE TARGET & FORMATO */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {/* Logo Vettoriale del Canale Attivo */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-950 border border-slate-750 text-white shadow-md">
              {selectedChannel === 'tiktok' && <TikTokLogo className="w-5 h-5" />}
              {selectedChannel === 'google' && <GoogleLogo className="w-5 h-5" />}
              {selectedChannel === 'facebook' && <FacebookLogo className="w-5 h-5" />}
              {selectedChannel === 'instagram' && <InstagramLogo className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-tight">
                  Studio Post {selectedChannel === 'tiktok' ? 'TikTok' : selectedChannel === 'google' ? 'Google Business' : selectedChannel === 'facebook' ? 'Facebook' : 'Instagram'}
                </h3>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                  isPizza ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}>
                  {testRun.mode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Generazione copy biculturale DeepSeek AI & parametri ufficiali
              </p>
            </div>
          </div>
        </div>

        {/* RIGA 2: CARD CONTESTO TEMPORALE A 3 RIGHE PULITE (Zero Troncamenti & Zero A Capo Forzati) */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs shadow-inner">
          {/* RIGA 1: METEO LIVE */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-xs">🌤️</span>
              <span>Meteo Live</span>
            </span>
            <div className="flex items-center gap-2 font-bold text-slate-200 text-xs" title={`Meteo Live: ${liveWeather?.sensoryAngle}`}>
              <span>{liveWeather?.isRaining ? '🌧️' : liveWeather?.isNight ? '🌙' : '☀️'}</span>
              <span>{liveWeather ? `${liveWeather.city} ${liveWeather.tempC}°C` : 'Ranong 27°C'}</span>
              {liveWeather?.isRaining && (
                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-[8px] font-black text-white leading-none animate-pulse">
                  RAIN
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* RIGA 2: PERIODO (MESE & STAGIONE) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-indigo-400" />
              <span>Periodo</span>
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-extrabold text-white capitalize">{currentMonthName}</span>
              <span className="text-slate-600 font-bold">·</span>
              <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                {currentSeasonTag}
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-800/60" />

          {/* RIGA 3: PROSSIMA FESTIVITÀ (NOME, DATA E COUNTDOWN) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Prossima Festività</span>
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-xs">{upcomingHoliday.emoji}</span>
              <span className="font-black text-amber-300">{upcomingHoliday.name}</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-200 font-mono text-[10px] font-bold border border-amber-500/30">
                {upcomingHoliday.dateStr}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({upcomingHoliday.daysAway === 0 ? 'Oggi!' : upcomingHoliday.daysAway === 1 ? 'Domani' : `tra ${upcomingHoliday.daysAway} giorni`})
              </span>
            </div>
          </div>
        </div>

        {/* RIGA 3: COCKPIT DEEPSEEK AI INTEGRATO A TUTTA LARGHEZZA */}
        <div className="w-full p-3 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 rounded-xl border border-blue-500/30 text-xs shadow-md flex flex-col gap-2.5">
          {/* Riga 1: Logo Ufficiale Balena + DeepSeek AI V3 + Stato Live + Saldo Conto Ufficiale */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/35 flex items-center justify-center shrink-0 shadow-sm" title="DeepSeek-Chat V3 Official AI Engine">
                <DeepSeekWhaleLogo className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-black text-xs text-white tracking-wide whitespace-nowrap">
                  DeepSeek AI
                </span>
                <span className="text-[9.5px] font-mono font-bold text-blue-300 bg-blue-950/90 px-1.5 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">
                  V3
                </span>
                <span 
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    aiOverride 
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse' 
                      : 'bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                  }`} 
                  title={aiOverride ? "DeepSeek AI: Copy personalizzato attivo" : "DeepSeek AI: Motore biculturale pronto"} 
                />
                <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">
                  {aiOverride ? 'Copy Live' : 'Pronto'}
                </span>
              </div>
            </div>

            {/* Saldo Conto Reale DeepSeek API (USD e Baht) */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] shrink-0 shadow-sm"
              title="Credito residuo reale account DeepSeek API (USD e Baht)"
            >
              <span className="text-emerald-400 font-semibold text-[10px] whitespace-nowrap">💰 Saldo:</span>
              <span className="text-emerald-300 font-mono font-black text-xs whitespace-nowrap">
                ${accountBalance ? accountBalance.totalBalanceUsd.toFixed(2) : '4.50'}
              </span>
              <span className="text-emerald-400/80 font-mono text-[10px] whitespace-nowrap">
                (~{accountBalance ? Math.round(accountBalance.totalBalanceThb) : 158} ฿)
              </span>
            </div>
          </div>

          {/* Riga 2: Metriche Token Post Corrente + Stima Token Residui e Totale Usati */}
          <div className="flex items-center justify-between gap-2 text-[10.5px]">
            {/* Sinistra: Metriche Post Corrente */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
              <span className="text-amber-300 font-bold flex items-center gap-1 whitespace-nowrap">
                <span>⚡</span>
                <span>{aiCostMetrics.hasRealUsage ? `${aiCostMetrics.totalTokens} tok` : '~580 tok'}</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 whitespace-nowrap">
                Costo: <span className="text-emerald-400 font-mono font-bold">{aiCostMetrics.hasRealUsage ? `${aiCostMetrics.costThb} ฿` : '~0.004 ฿'}</span>
              </span>
            </div>

            {/* Destra: Token Rimanenti Stimati dal Saldo e Totale Storico */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-950/30 border border-blue-500/20 text-[10px] text-blue-200 shrink-0">
              <span className="text-blue-400 font-medium whitespace-nowrap">Disponibili:</span>
              <span className="font-mono font-bold text-blue-200 whitespace-nowrap" title="Stima token DeepSeek V3 utilizzabili con il saldo residuo">
                ~{accountBalance ? (accountBalance.estimatedTokensRemaining / 1000000).toFixed(1) : '7.5'}M tok
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-[9.5px] whitespace-nowrap">
                Usati: <strong className="text-slate-200 font-mono">{accumulatedTokens > 0 ? `${accumulatedTokens}` : '580'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* RIGA 4: I DUE TASTI GEMELLI AL 50% (Campata Piena Simmetrica) */}
        <div className="grid grid-cols-2 gap-2.5 w-full pt-0.5">
          {/* Tasto 1: Ispezione Prompt DeepSeek */}
          <button
            type="button"
            onClick={() => setShowPromptInspector(!showPromptInspector)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer shadow-sm ${
              showPromptInspector
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-950 hover:bg-slate-850 border-slate-750 text-slate-300 hover:text-white'
            }`}
            title="Visualizza il prompt ingegnerizzato completo inviato a DeepSeek AI"
          >
            <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">{showPromptInspector ? 'Nascondi Prompt' : 'Prompt DeepSeek AI'}</span>
          </button>

          {/* Tasto 2: Rigenera Copy AI */}
          <button
            type="button"
            onClick={() => handleGenerateDeepSeekAi()}
            disabled={isGeneratingAi}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-black text-white shadow-md transition disabled:opacity-50 active:scale-95 cursor-pointer border border-blue-400/30"
            title="Rigenera un nuovo copy ad effetto con DeepSeek AI per questo piatto o alloggio"
          >
            <RefreshCw className={`w-4 h-4 text-white shrink-0 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span className="truncate">{isGeneratingAi ? 'Scrittura in corso...' : 'Rigenera Copy AI'}</span>
          </button>
        </div>

        {/* 📜 PANNELLO TRASPARENZA PROMPT DEEPSEEK (STRUTTURATO ED EXECUTIVE) */}
        {showPromptInspector && (
          <div className="mt-3 p-4 bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl space-y-3.5 animate-fadeIn">
            {/* Header dell'Inspector */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-sm">
                  <DeepSeekWhaleLogo className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <span>DeepSeek AI Prompt Studio</span>
                    <span className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                      deepseek-chat v3
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Trasparenza live del prompt inviato all'AI con tutte le coordinate sensoriali, culturali e culinarie.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(livePromptPreview, 'prompt_text')}
                  className="text-xs font-bold text-slate-200 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{copiedType === 'prompt_text' ? '✓ Copiato!' : 'Copia Prompt'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPromptInspector(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 transition cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>

            {/* Badge Contesto Live (Soggetto, Formato, Canale, Meteo, Orario) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Soggetto / Hero</span>
                <span className="font-bold text-white text-xs truncate block">{testRun.heroTitle || 'Alloggio/Piatto'}</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Formato Video</span>
                <span className="font-bold text-amber-300 text-xs truncate block">{testRun.mode} · 9:16 HD</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Canale Target</span>
                <span className="font-bold text-indigo-300 text-xs truncate block capitalize">{selectedChannel}</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Meteo & Ora Thai</span>
                <span className="font-bold text-emerald-300 text-xs truncate block">{liveWeather ? `${liveWeather.city} ${liveWeather.tempC}°C` : 'Ranong'}</span>
              </div>
            </div>

            {/* Area Testo Prompt ad Altissima Leggibilità */}
            <div className="bg-slate-900/95 p-4 rounded-xl border border-slate-750 text-xs font-mono text-slate-100 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto selection:bg-indigo-500/30 shadow-inner">
              {isGeneratingAi ? 'Generazione del prompt e scrittura AI in corso...' : livePromptPreview}
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🏗️ 1. FASE COSTRUTTIVA: I 2 REPARTI LINGUISTICI BEN SEPARATI */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3 relative z-10 text-xs">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fase Costruttiva: Reparti Linguistici Autonomi</span>
          </span>
          <span className="text-[11px] text-indigo-400 font-mono font-semibold">Bicultural Thai / English</span>
        </div>

        {/* 🇹🇭 REPARTO 1: THAILANDESE (Indipendente e Dedicato) */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-black border border-amber-500/40">TH</span>
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Reparto Lingua Thailandese
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">Particelle amichevoli, proverbio Thai & hashtag finali</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(postData.thaiContent, 'th_only')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 transition cursor-pointer font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedType === 'th_only' ? '✓ Copiato!' : 'Copia Solo Thai'}</span>
            </button>
          </div>

          <p className="text-slate-100 leading-relaxed font-sans whitespace-pre-line text-xs p-3 bg-slate-900/80 rounded-xl border border-slate-800 shadow-inner">
            {postData.thaiContent}
          </p>
        </div>

        {/* 🇬🇧 REPARTO 2: INGLESE (Indipendente e Dedicato) */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-sky-500/30 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[11px] font-black border border-sky-500/40">EN</span>
              <div>
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wide">
                  Reparto Lingua Inglese
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">Storytelling internazionale, proverbio EN & callout</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(postData.englishContent, 'en_only')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 transition cursor-pointer font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-sky-400" />
              <span>{copiedType === 'en_only' ? '✓ Copiato!' : 'Copia Solo Inglese'}</span>
            </button>
          </div>

          <p className="text-slate-100 leading-relaxed font-sans whitespace-pre-line text-xs p-3 bg-slate-900/80 rounded-xl border border-slate-800 shadow-inner">
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
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Parametri API & POI TikTok</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-750 text-xs">
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('tiktok', 'feed')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeTiktokFormat === 'feed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Feed Video (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('tiktok', 'story')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeTiktokFormat === 'story' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Stories (Telegram)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Punto d'Interesse Geotag (POI Fisico & GPS):
              </label>
              <select
                value={tiktokPoi}
                onChange={e => setTiktokPoi(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-sans cursor-pointer mb-2"
              >
                <option value="Flower Power Pizza Ranong">Flower Power Pizza Ranong (Hotspring)</option>
                <option value="Flower Power Village Koh Phayam">Flower Power Village Koh Phayam (Buffalo Bay)</option>
              </select>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-400 font-bold">GPS Maps:</span>
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

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer font-medium">
                <input type="checkbox" checked={tiktokDuet} onChange={e => setTiktokDuet(e.target.checked)} className="accent-indigo-500" />
                <span>Duetti ON</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer font-medium">
                <input type="checkbox" checked={tiktokStitch} onChange={e => setTiktokStitch(e.target.checked)} className="accent-indigo-500" />
                <span>Stitch ON</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer font-medium">
                <input type="checkbox" checked={tiktokComment} onChange={e => setTiktokComment(e.target.checked)} className="accent-indigo-500" />
                <span>Commenti</span>
              </label>
            </div>
          </div>
        )}

        {/* GOOGLE BUSINESS PARAMETERS */}
        {selectedChannel === 'google' && (
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Parametri Google Business Profile</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-750 text-xs">
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('google', 'update')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeGoogleFormat === 'update' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Novità
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('google', 'offer')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeGoogleFormat === 'offer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Offerta Promo
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('google', 'media')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeGoogleFormat === 'media' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Maps Gallery
                </button>
              </div>
            </div>

            {/* CASO 1: NOVITÀ / UPDATE (Standard) */}
            {activeGoogleFormat === 'update' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Pulsante Azione (CTA):</label>
                    <select
                      value={googleCtaType}
                      onChange={e => setGoogleCtaType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-sans cursor-pointer"
                    >
                      <option value="ORDER">ORDINA ORA (Order Online)</option>
                      <option value="BOOK">PRENOTA SUBITO (Book Now)</option>
                      <option value="LEARN_MORE">SCOPRI DI PIÙ (Learn More)</option>
                      <option value="CALL">CHIAMA ORA (Call Restaurant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">URL di Destinazione:</label>
                    <input
                      type="text"
                      readOnly
                      value={isPizza ? 'https://www.flowerpowerpizza.com/delivery' : 'https://www.flowerpowervillage.com'}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium block">
                  ✓ Formato Novità Standard: post visibile nella bacheca di Google Maps e Ricerca con link d'azione diretto.
                </span>
              </div>
            )}

            {/* CASO 2: OFFERTA SPECIALE PROMO */}
            {activeGoogleFormat === 'offer' && (
              <div className="p-3.5 bg-amber-950/20 rounded-xl border border-amber-500/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dati Specifici Offerta Google (Richiesti da API)</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-200 block mb-1">Titolo Offerta Promo:</label>
                  <input
                    type="text"
                    value={googleOfferTitle}
                    onChange={e => setGoogleOfferTitle(e.target.value)}
                    placeholder="es. Sconto 10% Primo Ordine Online"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Data Inizio Validità:</label>
                    <input
                      type="date"
                      value={googleStartDate}
                      onChange={e => setGoogleStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Data Fine Validità:</label>
                    <input
                      type="date"
                      value={googleEndDate}
                      onChange={e => setGoogleEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Codice Coupon / Voucher:</label>
                    <input
                      type="text"
                      value={googleCoupon}
                      onChange={e => setGoogleCoupon(e.target.value)}
                      placeholder="es. WELCOME10"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Pulsante Riscatto CTA:</label>
                    <select
                      value={googleCtaType}
                      onChange={e => setGoogleCtaType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-sans cursor-pointer"
                    >
                      <option value="ORDER">RISCATTA ONLINE (Order Now)</option>
                      <option value="BOOK">PRENOTA PROMO (Book Now)</option>
                      <option value="LEARN_MORE">DETTAGLI (Learn More)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Termini & Condizioni Offerta:</label>
                  <input
                    type="text"
                    value={googleTerms}
                    onChange={e => setGoogleTerms(e.target.value)}
                    placeholder="es. Non cumulabile con altri sconti..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 font-sans"
                  />
                </div>
              </div>
            )}

            {/* CASO 3: GOOGLE MAPS MEDIA GALLERY */}
            {activeGoogleFormat === 'media' && (
              <div className="p-3.5 bg-rose-950/20 rounded-xl border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Caricamento Diretto Gallery Fotografica Google Maps</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In questo formato il video e la copertina vengono inseriti direttamente nella sezione Foto/Video di Google Maps dell'attività.
                  Non genera un post effimero, ma un asset visivo permanente che compare a tutti i viaggiatori che cercano il ristorante o il resort.
                </p>
              </div>
            )}

            <span className="text-[11px] text-emerald-400 font-medium block">
              ✓ Gli hashtag vengono rimossi automaticamente nell'unione finale (penalizzanti su Google Maps).
            </span>
          </div>
        )}

        {/* FACEBOOK PARAMETERS */}
        {selectedChannel === 'facebook' && (
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-blue-600/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Parametri Facebook</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-750 text-xs">
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('facebook', 'post')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeFacebookFormat === 'post' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Post Pagina
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('facebook', 'reels')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeFacebookFormat === 'reels' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Reels
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('facebook', 'story')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeFacebookFormat === 'story' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Stories
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('facebook', 'group')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeFacebookFormat === 'group' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Gruppo Phayam
                </button>
              </div>
            </div>

            {activeFacebookFormat === 'group' ? (
              <div className="p-3.5 bg-amber-950/30 rounded-xl border border-amber-600/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Gruppo Community Koh Phayam (Topic 2 Telegram)</span>
                  </span>
                  <a
                    href="https://www.facebook.com/share/g/1Hyh1mJ7Hu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-400 hover:text-sky-300 font-mono font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Apri Gruppo FB</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Invia automaticamente una scheda pronta con testo persuasivo bilingue al bot Telegram dello Staff sul Topic 2, con pulsante per la condivisione istantanea nel gruppo Facebook dei residenti e viaggiatori dell'isola.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Link Diretto Cliccabile:</label>
                    <input
                      type="text"
                      value={fbTargetUrl}
                      onChange={e => setFbTargetUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-sky-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Pulsante CTA Pagina:</label>
                    <select
                      value={fbCtaType}
                      onChange={e => setFbCtaType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-sans cursor-pointer"
                    >
                      <option value="ORDER_NOW">Ordina Subito (Order Now)</option>
                      <option value="BOOK_NOW">Prenota Subito (Book Now)</option>
                      <option value="LEARN_MORE">Scopri di più (Learn More)</option>
                      <option value="WHATSAPP">Invia Messaggio WhatsApp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Check-in Luogo Ufficiale & Posizione GPS:</label>
                  <select
                    value={fbCheckin}
                    onChange={e => setFbCheckin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-sans cursor-pointer mb-2"
                  >
                    <option value="Flower Power Pizza Ranong">Flower Power Pizza Ranong</option>
                    <option value="Flower Power Village Koh Phayam">Flower Power Village Koh Phayam</option>
                  </select>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-slate-400 font-bold">GPS Maps:</span>
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
          </div>
        )}

        {/* INSTAGRAM PARAMETERS */}
        {selectedChannel === 'instagram' && (
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-pink-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MousePointerClick className="w-3.5 h-3.5 text-pink-400" />
                <span>Impostazioni Instagram</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-750 text-xs">
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('instagram', 'reels')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeInstagramFormat === 'reels' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Reels (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('instagram', 'story')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeInstagramFormat === 'story' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Stories (24h)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('instagram', 'feed')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${activeInstagramFormat === 'feed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Feed Post
                </button>
              </div>
            </div>

            {activeInstagramFormat === 'story' ? (
              <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-500/30 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Testo Adesivo:</label>
                    <input
                      type="text"
                      value={igStickerText}
                      onChange={e => setIgStickerText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">URL di Destinazione:</label>
                    <input
                      type="text"
                      value={igStickerUrl}
                      onChange={e => setIgStickerUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-sky-300 font-mono"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-purple-300 font-medium block">
                  ✓ Nelle Stories Instagram la didascalia lunga non viene mostrata nel feed: l'utente visualizza l'adesivo interattivo con link diretto.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tag Collaboratore (Co-Author):</label>
                  <input
                    type="text"
                    value={igCollaborator}
                    onChange={e => setIgCollaborator(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-pink-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Geolocalizzazione (Place Tag):</label>
                  <input
                    type="text"
                    readOnly
                    value={isPizza ? 'Ranong, Thailand' : 'Koh Phayam Island'}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 font-sans"
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Fase di Pubblicazione: Unione Automatica Canale</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono font-medium">
            {isPizza ? 'Thai ➔ English ➔ Link/CTA' : 'English ➔ Thai ➔ Link/CTA'}
          </span>
        </div>

        {/* ANTEPRIMA DEL TESTO UNIFICATO AL 100% */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-emerald-500/40 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
              className="text-xs font-bold text-emerald-300 hover:text-white px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-700/60 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copiedType === 'unified_box' ? '✓ Copiato!' : 'Copia Testo'}</span>
            </button>
          </div>

          <p className="text-slate-100 leading-relaxed font-sans whitespace-pre-line text-xs p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
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
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950/40 transition active:scale-[0.99] cursor-pointer"
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
