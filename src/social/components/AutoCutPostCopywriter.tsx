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
  } | null>(null);
  const [showPromptInspector, setShowPromptInspector] = useState(false);

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
        thaiContent: scrubWoodFired(basePostData.thaiContent),
        englishContent: scrubWoodFired(basePostData.englishContent)
      };
    }

    const stripTags = (t: string) => scrubWoodFired(t.replace(/[ \t]*#\S+/g, '').replace(/\n{3,}/g, '\n\n').trim());
    const th = ensureLangFlag(stripTags(aiOverride.thaiContent || basePostData.thaiContent), 'th');
    const en = ensureLangFlag(stripTags(aiOverride.englishContent || basePostData.englishContent), 'en');
    const tagFooter = [...basePostData.thaiHashtags, ...basePostData.englishHashtags].join(' ');
    
    const isPizza = testRun.brand === 'pizza';
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
    const mapsLink = isPizza
      ? 'https://maps.app.goo.gl/qjpYt6t69y17R4DF6'
      : 'https://maps.app.goo.gl/mugY88Wpuzjeebf56';
    const siteUrl = isPizza ? 'https://www.flowerpowerpizza.com' : 'https://www.flowerpowervillage.com';
    const directLinkNotice = isPizza
      ? `👉 สั่งเดลิเวอรี่ออนไลน์ / Order Online Direct (10% Off):\n🔗 ${siteUrl}\n📍 Google Maps GPS:\n${mapsLink}\n📍 Check-in: ${fbCheckin}\n${postData.crossTag}`
      : `👉 จองห้องพักออนไลน์ / Book Your Island Stay Direct:\n🔗 ${siteUrl}\n📍 Google Maps GPS:\n${mapsLink}\n📍 Check-in: ${fbCheckin}\n${postData.crossTag}`;
    const tagFooter = [...postData.thaiHashtags, ...postData.englishHashtags].join(' ');
    return isPizza
      ? `${postData.thaiContent}\n\n${postData.englishContent}\n\n${directLinkNotice}\n\n${tagFooter}`
      : `${postData.englishContent}\n\n${postData.thaiContent}\n\n${directLinkNotice}\n\n${tagFooter}`;
  }, [postData, isPizza, fbTargetUrl, fbCheckin]);

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

        {/* Barra di Stato DeepSeek AI, Tasto Ispezione Prompt & Tasto Rigenera */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Sparkles className={`w-3.5 h-3.5 text-amber-300 shrink-0 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span className="font-semibold text-xs">
                {isGeneratingAi ? 'DeepSeek AI sta scrivendo il copy...' : (aiOverride ? 'Copy DeepSeek AI Attivo' : 'Copy Bilingue Autonomo')}
              </span>
              {aiOverride && !isGeneratingAi && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Copy DeepSeek AI sincronizzato live"></span>
              )}
            </div>

            {/* Tasto Trasparenza Prompt DeepSeek */}
            <button
              type="button"
              onClick={() => setShowPromptInspector(!showPromptInspector)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                showPromptInspector
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm shadow-cyan-950/50'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Visualizza il prompt ingegnerizzato in italiano inviato a DeepSeek AI"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{showPromptInspector ? 'Nascondi Prompt' : 'Prompt DeepSeek AI'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleGenerateDeepSeekAi()}
            disabled={isGeneratingAi}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-xs font-bold text-white shadow-md shadow-purple-950/40 transition disabled:opacity-50 active:scale-95 cursor-pointer"
            title="Rigenera un nuovo copy ad effetto con DeepSeek AI per questo piatto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white shrink-0 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Scrittura in corso...' : 'Rigenera Copy AI'}</span>
          </button>
        </div>

        {/* 📜 PANNELLO TRASPARENZA PROMPT DEEPSEEK (Italiano) */}
        {showPromptInspector && (
          <div className="mt-2.5 p-3.5 bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-2xl space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-cyan-300 uppercase tracking-wide">
                  Prompt DeepSeek AI (Italiano)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Trasparenza Live
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(livePromptPreview, 'prompt_text')}
                  className="text-[10px] text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 transition cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>{copiedType === 'prompt_text' ? 'Copiato!' : 'Copia Prompt'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPromptInspector(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 transition cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Questo è il prompt esatto inviato a DeepSeek con tutte le coordinate vive del momento (piatto selezionato, giorno della settimana, orario thai, meteo sensoriale e istruzioni culturali).
            </p>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto selection:bg-cyan-500/30">
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
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black border border-amber-500/40">TH</span>
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
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-black border border-sky-500/40">EN</span>
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
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Parametri API & POI TikTok</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('tiktok', 'feed')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeTiktokFormat === 'feed' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Feed Video (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('tiktok', 'story')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeTiktokFormat === 'story' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Stories (Telegram)
                </button>
              </div>
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
                <option value="Flower Power Pizza Ranong">Flower Power Pizza Ranong (Hotspring)</option>
                <option value="Flower Power Village Koh Phayam">Flower Power Village Koh Phayam (Buffalo Bay)</option>
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
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Parametri Google Business Profile</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('google', 'update')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeGoogleFormat === 'update' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Novità
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('google', 'offer')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeGoogleFormat === 'offer' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Offerta Promo
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('google', 'media')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeGoogleFormat === 'media' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
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
                <span className="text-[10px] text-emerald-400/90 block">
                  ✓ Formato Novità Standard: post visibile nella bacheca di Google Maps e Ricerca con link d'azione diretto.
                </span>
              </div>
            )}

            {/* CASO 2: OFFERTA SPECIALE PROMO (Richiede campi specifici API Google) */}
            {activeGoogleFormat === 'offer' && (
              <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dati Specifici Offerta Google (Richiesti da API)</span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-amber-200/80 block mb-0.5">Titolo Offerta Promo:</label>
                  <input
                    type="text"
                    value={googleOfferTitle}
                    onChange={e => setGoogleOfferTitle(e.target.value)}
                    placeholder="es. Sconto 10% Primo Ordine Online"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Data Inizio Validità:</label>
                    <input
                      type="date"
                      value={googleStartDate}
                      onChange={e => setGoogleStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Data Fine Validità:</label>
                    <input
                      type="date"
                      value={googleEndDate}
                      onChange={e => setGoogleEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Codice Coupon / Voucher:</label>
                    <input
                      type="text"
                      value={googleCoupon}
                      onChange={e => setGoogleCoupon(e.target.value)}
                      placeholder="es. WELCOME10"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Pulsante Riscatto CTA:</label>
                    <select
                      value={googleCtaType}
                      onChange={e => setGoogleCtaType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-sans"
                    >
                      <option value="ORDER">RISCATTA ONLINE (Order Now)</option>
                      <option value="BOOK">PRENOTA PROMO (Book Now)</option>
                      <option value="LEARN_MORE">DETTAGLI (Learn More)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Termini & Condizioni Offerta:</label>
                  <input
                    type="text"
                    value={googleTerms}
                    onChange={e => setGoogleTerms(e.target.value)}
                    placeholder="es. Non cumulabile con altri sconti..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 font-sans"
                  />
                </div>
              </div>
            )}

            {/* CASO 3: GOOGLE MAPS MEDIA GALLERY */}
            {activeGoogleFormat === 'media' && (
              <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Caricamento Diretto Gallery Fotografica Google Maps</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  In questo formato il video e la copertina vengono inseriti direttamente nella sezione Foto/Video di Google Maps dell'attività.
                  Non genera un post effimero, ma un asset visivo permanente che compare a tutti i viaggiatori che cercano il ristorante o il resort.
                </p>
              </div>
            )}

            <span className="text-[10px] text-emerald-400/90 block">
              ✓ Gli hashtag vengono rimossi automaticamente nell'unione finale (penalizzanti su Google Maps).
            </span>
          </div>
        )}

        {/* FACEBOOK PARAMETERS */}
        {selectedChannel === 'facebook' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-blue-600/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Parametri Facebook</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('facebook', 'post')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeFacebookFormat === 'post' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Post Pagina
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('facebook', 'reels')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeFacebookFormat === 'reels' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Reels
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('facebook', 'story')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeFacebookFormat === 'story' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Stories
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('facebook', 'group')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeFacebookFormat === 'group' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Gruppo Phayam
                </button>
              </div>
            </div>

            {activeFacebookFormat === 'group' ? (
              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-600/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Gruppo Community Koh Phayam (Topic 2 Telegram)</span>
                  </span>
                  <a
                    href="https://www.facebook.com/share/g/1Hyh1mJ7Hu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-mono font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Apri Gruppo FB</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Invia automaticamente una scheda pronta con testo persuasivo bilingue al bot Telegram dello Staff sul Topic 2, con pulsante per la condivisione istantanea nel gruppo Facebook dei residenti e viaggiatori dell'isola.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
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
                    <option value="Flower Power Pizza Ranong">Flower Power Pizza Ranong</option>
                    <option value="Flower Power Village Koh Phayam">Flower Power Village Koh Phayam</option>
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
          </div>
        )}

        {/* INSTAGRAM PARAMETERS */}
        {selectedChannel === 'instagram' && (
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-pink-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-pink-300 flex items-center gap-1.5 uppercase tracking-wider">
                <MousePointerClick className="w-3.5 h-3.5 text-pink-400" />
                <span>Impostazioni Instagram</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('instagram', 'reels')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeInstagramFormat === 'reels' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Reels (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('instagram', 'story')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeInstagramFormat === 'story' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Stories (24h)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeChannelFormat && onChangeChannelFormat('instagram', 'feed')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${activeInstagramFormat === 'feed' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Feed Post
                </button>
              </div>
            </div>

            {activeInstagramFormat === 'story' ? (
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
                <span className="text-[10px] text-purple-300/80 block">
                  ✓ Nelle Stories Instagram la didascalia lunga non viene mostrata nel feed: l'utente visualizza l'adesivo interattivo con link diretto.
                </span>
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
