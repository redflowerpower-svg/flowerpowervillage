import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wine as WineIcon, 
  Search, 
  ChevronDown, 
  ArrowLeft, 
  Globe, 
  Sparkles, 
  X, 
  Info, 
  ExternalLink,
  MessageCircle,
  Thermometer,
  Utensils,
  Home,
  Lock,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { 
  WineCardData, 
  INITIAL_WINE_COLLECTION, 
  sortWinesByCountryOrder, 
  renderCountryFlag, 
  formatWineProductName,
  getWineTranslatedTitle,
  getWineTranslatedSubtitle,
  getWineTranslatedDesc,
  renderWinePrice 
} from '../pizza/data/wineData';
import { fetchCloudWineCollection } from '../pizza/data/wineCloudService';
import { fetchVillageWineConfig } from '../booking/services/villageWineCloudService';
import VillageSlideshow from '../components/VillageSlideshow';

type Lang = 'IT' | 'EN' | 'TH' | 'DE';

const TRANSLATIONS = {
  IT: {
    backToVillage: 'Torna al Villaggio',
    backToVillageHome: 'Torna alla Home',
    wineListNav: 'Carta dei Vini',
    staffAdminBtn: 'Gestione Vini (Staff Admin)',
    pageTitle: 'Carta dei Vini Pregiati',
    pageSubtitle: 'Selezione esclusiva di vini italiani e internazionali per il Ristorante di Flower Power Village • Koh Phayam',
    houseWineTitle: 'Vino della Casa alla Spina',
    houseWineDesc: 'Servito fresco al calice o in caraffa • Disponibile Bianco e Rosso',
    glass: '1 Calice (150ml)',
    glassPrice: '120 Baht',
    jug: '1 Caraffa (75cl)',
    jugPrice: '590 Baht',
    searchPlaceholder: 'Cerca per nome vino, vitigno, regione...',
    allWines: 'Tutti i Vini',
    redWines: 'Rossi',
    whiteWines: 'Bianchi',
    roseWines: 'Rosati',
    sparklingWines: 'Bollicine',
    dessertWines: 'Dolci',
    bottlePrice: 'Prezzo Bottiglia',
    detailsBtn: 'Dettagli Sommelier',
    servingTemp: 'Temp. Servizio',
    pairings: 'Abbinamenti Consigliati',
    dineInNotice: 'Servito esclusivamente al tavolo nel ristorante di Flower Power Village a Koh Phayam.',
    reserveTable: 'Richiedi al Personale / WhatsApp',
    noWinesFound: 'Nessun vino trovato con i filtri selezionati.',
    sommelierNotes: 'Note di Degustazione Sommelier',
    alcoholLabel: 'Gradazione Alcolica'
  },
  EN: {
    backToVillage: 'Back to Village',
    backToVillageHome: 'Back to Home',
    wineListNav: 'Wine List',
    staffAdminBtn: 'Wine Management (Staff Admin)',
    pageTitle: 'Fine Wine Selection',
    pageSubtitle: 'Exclusive selection of Italian and international wines for Flower Power Village Restaurant • Koh Phayam',
    houseWineTitle: 'House Wine on Tap',
    houseWineDesc: 'Served chilled by the glass or jug • Red and White available',
    glass: '1 Glass (150ml)',
    glassPrice: '120 Baht',
    jug: '1 Jug (75cl)',
    jugPrice: '590 Baht',
    searchPlaceholder: 'Search by wine title, grape, region...',
    allWines: 'All Wines',
    redWines: 'Reds',
    whiteWines: 'Whites',
    roseWines: 'Rosé',
    sparklingWines: 'Sparkling',
    dessertWines: 'Dessert',
    bottlePrice: 'Bottle Price',
    detailsBtn: 'Sommelier Notes',
    servingTemp: 'Serving Temp.',
    pairings: 'Recommended Pairings',
    dineInNotice: 'Served exclusively for dine-in guests at Flower Power Village Restaurant, Koh Phayam.',
    reserveTable: 'Ask Staff / WhatsApp',
    noWinesFound: 'No wines found matching your search criteria.',
    sommelierNotes: 'Sommelier Tasting Notes',
    alcoholLabel: 'Alcohol by Volume'
  },
  TH: {
    backToVillage: 'กลับสู่หน้าหลักวิลเลจ',
    backToVillageHome: 'กลับหน้าแรก (HOME)',
    wineListNav: 'เมนูไวน์',
    staffAdminBtn: 'จัดการความพร้อมไวน์ (Admin)',
    pageTitle: 'เมนูไวน์นำเข้าคุณภาพพรีเมียม',
    pageSubtitle: 'คอลเลกชันไวน์อิตาเลียนและไวน์ชั้นนำระดับโลก ณ ร้านอาหาร ฟลาวเวอร์ พาวเวอร์ วิลเลจ • เกาะพยาม',
    houseWineTitle: 'ไวน์ประจำร้าน (House Wine)',
    houseWineDesc: 'เสิร์ฟเย็นสดชื่น มีทั้งไวน์แดงและไวน์ขาว',
    glass: '1 แก้ว (150 มล.)',
    glassPrice: '120 บาท',
    jug: '1 เหยือก (75 ซล.)',
    jugPrice: '590 บาท',
    searchPlaceholder: 'ค้นหาชื่อไวน์ พันธุ์องุ่น แหล่งผลิต...',
    allWines: 'ไวน์ทั้งหมด',
    redWines: 'ไวน์แดง',
    whiteWines: 'ไวน์ขาว',
    roseWines: 'ไวน์โรเซ่',
    sparklingWines: 'สปาร์กลิงไวน์',
    dessertWines: 'ไวน์หวาน',
    bottlePrice: 'ราคาขวด',
    detailsBtn: 'รายละเอียดซอมเมอลิเยร์',
    servingTemp: 'อุณหภูมิเสิร์ฟ',
    pairings: 'แนะนำทานคู่กับ',
    dineInNotice: 'บริการเสิร์ฟเฉพาะผู้ที่รับประทานอาหารที่ร้าน ฟลาวเวอร์ พาวเวอร์ วิลเลจ เกาะพยาม เท่านั้น',
    reserveTable: 'สอบถามพนักงาน / WhatsApp',
    noWinesFound: 'ไม่พบรายการไวน์ตามเงื่อนไขที่เลือก',
    sommelierNotes: 'บันทึกการชิมจากซอมเมอลิเยร์',
    alcoholLabel: 'ระดับแอลกอฮอล์'
  },
  DE: {
    backToVillage: 'Zurück zum Village',
    backToVillageHome: 'Zur Startseite (HOME)',
    wineListNav: 'Weinkarte',
    staffAdminBtn: 'Weinverwaltung (Staff Admin)',
    pageTitle: 'Exklusive Weinkarte',
    pageSubtitle: 'Ausgewählte italienische und internationale Weine für das Restaurant im Flower Power Village • Koh Phayam',
    houseWineTitle: 'Hauswein vom Fass',
    houseWineDesc: 'Frisch serviert im Glas oder in der Karaffe • Rot- und Weißwein erhältlich',
    glass: '1 Glas (150ml)',
    glassPrice: '120 Baht',
    jug: '1 Karaffe (75cl)',
    jugPrice: '590 Baht',
    searchPlaceholder: 'Nach Weinnamen, Rebsorte oder Region suchen...',
    allWines: 'Alle Weine',
    redWines: 'Rotweine',
    whiteWines: 'Weißweine',
    roseWines: 'Roséweine',
    sparklingWines: 'Schaumweine',
    dessertWines: 'Dessertweine',
    bottlePrice: 'Flaschenpreis',
    detailsBtn: 'Sommelier-Details',
    servingTemp: 'Serviertemperatur',
    pairings: 'Empfohlene Gerichte',
    dineInNotice: 'Wird exklusiv im Restaurant des Flower Power Village auf Koh Phayam serviert.',
    reserveTable: 'Personal anfragen / WhatsApp',
    noWinesFound: 'Keine Weine gefunden, die den Kriterien entsprechen.',
    sommelierNotes: 'Verkostungsnotizen des Sommeliers',
    alcoholLabel: 'Alkoholgehalt'
  }
};

const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'TH', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' }
];

const KOH_PHAYAM_COORDS = { lat: 9.759608, lon: 98.410898 };
const MAX_PHAYAM_RADIUS_KM = 10.0;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const VillageWineListPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('fp_selected_lang');
      if (savedLang && ['IT', 'EN', 'TH', 'DE'].includes(savedLang)) {
        return savedLang as Lang;
      }
      const browser = navigator.language.slice(0, 2).toUpperCase();
      return ['IT', 'EN', 'TH', 'DE'].includes(browser) ? (browser as Lang) : 'EN';
    }
    return 'EN';
  });

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [wines, setWines] = useState<WineCardData[]>([]);
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWine, setSelectedWine] = useState<WineCardData | null>(null);

  // Stato di geolocalizzazione automatica: 'checking' | 'phayam' | 'mainland' | 'prompt_choice'
  const [geoState, setGeoState] = useState<'checking' | 'phayam' | 'mainland' | 'prompt_choice'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('stay') === 'village' || 
        params.get('loc') === 'phayam' || 
        params.get('location') === 'village' || 
        params.get('skip_geo') === 'true'
      ) {
        return 'phayam';
      }
      const saved = sessionStorage.getItem('fp_wine_qr_location');
      if (saved === 'phayam') return 'phayam';
    }
    return 'checking';
  });

  useEffect(() => {
    if (geoState !== 'checking') return;

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoState('prompt_choice');
      return;
    }

    const fallbackTimer = setTimeout(() => {
      setGeoState((prev) => (prev === 'checking' ? 'prompt_choice' : prev));
    }, 3000);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(fallbackTimer);
          const { latitude, longitude } = position.coords;
          const distKm = calculateDistanceKm(latitude, longitude, KOH_PHAYAM_COORDS.lat, KOH_PHAYAM_COORDS.lon);

          if (distKm <= MAX_PHAYAM_RADIUS_KM) {
            // L'utente è a Koh Phayam (entro 10km dall'isola)
            try { sessionStorage.setItem('fp_wine_qr_location', 'phayam'); } catch (_) {}
            setGeoState('phayam');
          } else {
            // L'utente è sulla terraferma (Ranong o altrove)
            setGeoState('mainland');
            window.location.replace('https://www.flowerpowerpizza.com/?category=wines');
          }
        },
        () => {
          clearTimeout(fallbackTimer);
          setGeoState('prompt_choice');
        },
        {
          enableHighAccuracy: false,
          timeout: 2800,
          maximumAge: 300000
        }
      );
    } catch (e) {
      clearTimeout(fallbackTimer);
      setGeoState('prompt_choice');
    }

    return () => clearTimeout(fallbackTimer);
  }, [geoState]);


  const t = TRANSLATIONS[lang] || TRANSLATIONS.EN;

  // Sincronizza lang in localStorage e attributo data-lang su html
  useEffect(() => {
    try {
      localStorage.setItem('fp_selected_lang', lang);
      document.documentElement.setAttribute('data-lang', lang);
      document.title = `${t.pageTitle} — Flower Power Village Koh Phayam`;
    } catch (_) {}
  }, [lang, t.pageTitle]);

  // Caricamento dati vini + configurazione disponibilità villaggio
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [cloudWines, villageConfig] = await Promise.all([
          fetchCloudWineCollection(),
          fetchVillageWineConfig()
        ]);

        if (isMounted) {
          const raw = (cloudWines && cloudWines.length > 0) ? cloudWines : INITIAL_WINE_COLLECTION;
          setWines(raw);
          setDisabledIds(new Set(villageConfig.disabledWineIds || []));
        }
      } catch (err) {
        console.warn('[VillageWineListPage] Fallback locale:', err);
        if (isMounted) {
          setWines(INITIAL_WINE_COLLECTION);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Gestione tasto ESC per chiudere lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedWine(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtra solo i vini attivi al Villaggio e applica ricerca / categoria
  const visibleWines = useMemo(() => {
    // 1. Escludi vini disattivati al villaggio
    const activeAtVillage = wines.filter(w => {
      if (w.isAvailable === false) return false;
      if (disabledIds.has(w.id)) return false;
      return true;
    });

    // 2. Ordina per Paese (Italia, Francia, ecc.)
    const sorted = sortWinesByCountryOrder(activeAtVillage);

    // 3. Filtro categoria e ricerca
    return sorted.filter(w => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'dessert') {
          // Dolci possono avere categoryType 'red'/'white' ma descrizioni da dessert
          const isSweet = (w.categorySubtitle || '').toLowerCase().includes('passito') ||
                          (w.categorySubtitle || '').toLowerCase().includes('moscato') ||
                          (w.categorySubtitle || '').toLowerCase().includes('dolce') ||
                          (w.categorySubtitle || '').toLowerCase().includes('dessert') ||
                          (w.title || '').toLowerCase().includes('passito') ||
                          (w.title || '').toLowerCase().includes('moscato');
          if (!isSweet && w.categoryType !== 'dessert') return false;
        } else if (w.categoryType !== selectedCategory) {
          return false;
        }
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (getWineTranslatedTitle(w, lang) || w.title || '').toLowerCase();
      const sub = (getWineTranslatedSubtitle(w, lang) || w.categorySubtitle || '').toLowerCase();
      const desc = (getWineTranslatedDesc(w, lang) || w.description || '').toLowerCase();
      return title.includes(q) || sub.includes(q) || desc.includes(q);
    });
  }, [wines, disabledIds, selectedCategory, searchQuery, lang]);

  // Conteggi per categoria
  const categoryCounts = useMemo(() => {
    const activeAtVillage = wines.filter(w => w.isAvailable !== false && !disabledIds.has(w.id));
    return {
      all: activeAtVillage.length,
      red: activeAtVillage.filter(w => w.categoryType === 'red').length,
      white: activeAtVillage.filter(w => w.categoryType === 'white').length,
      rose: activeAtVillage.filter(w => w.categoryType === 'rose').length,
      sparkling: activeAtVillage.filter(w => w.categoryType === 'sparkling').length,
    };
  }, [wines, disabledIds]);

  return (
    <div className="min-h-screen text-stone-900 font-sans antialiased selection:bg-amber-200 selection:text-stone-950 pb-16" style={{ backgroundColor: '#FAF8F5' }}>
      
      {/* ═══════════════════════════════════════════════════════════════
           SCHERMO LOCALIZZAZIONE IN CORSO (CELLE TELEFONICHE + GPS)
      ══════════════════════════════════════════════════════════════════ */}
      {geoState === 'checking' && (
        <div className="fixed inset-0 z-[120] bg-[#3b3530] text-stone-100 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-2xl bg-stone-900 border border-stone-700/80 p-2 flex items-center justify-center mb-4 shadow-xl">
            <img src="/FP_04_-_LOGO_OFFICIAL_HD.png" alt="Flower Power" className="max-h-full max-w-full object-contain animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-black text-amber-300">Flower Power System</h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xs leading-relaxed">
            Rilevamento posizione in corso...<br />
            <span className="text-stone-400 font-mono text-[11px]">(Koh Phayam ↔ Ranong Terraferma)</span>
          </p>
          <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 border border-stone-700 text-[11px] text-amber-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Verifica celle telefoniche & GPS</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
           SCHERMO REDIRECT TERRAFERMA (RANONG FLOWER POWER PIZZA)
      ══════════════════════════════════════════════════════════════════ */}
      {geoState === 'mainland' && (
        <div className="fixed inset-0 z-[120] bg-[#3b3530] text-stone-100 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-2xl bg-stone-900 border border-stone-700/80 p-2 flex items-center justify-center mb-4 shadow-xl">
            <img src="/FP_04_-_LOGO_OFFICIAL_HD.png" alt="Flower Power" className="max-h-full max-w-full object-contain" />
          </div>
          <h2 className="text-2xl font-serif font-black text-amber-300">Ti trovi sulla terraferma</h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xs leading-relaxed">
            Reindirizzamento verso Flower Power Pizza Ranong...
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Apertura menu pizzeria & vini Ranong...</span>
          </div>
          <a
            href="https://www.flowerpowerpizza.com/?category=wines"
            className="mt-6 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
          >
            Apri Flower Power Pizza
          </a>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
           MODALE BIVIO RAPIDO (SE GPS RIFIUTATO O DISATTIVATO)
      ══════════════════════════════════════════════════════════════════ */}
      {geoState === 'prompt_choice' && (
        <div className="fixed inset-0 z-[110] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#3b3530] text-white border border-stone-700 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl animate-scaleUp">
            <img src="/FP_04_-_LOGO_OFFICIAL_HD.png" alt="Flower Power" className="w-16 h-16 object-contain mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-300">Dove ti trovi?</h2>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Seleziona la tua sede per visualizzare la carta dei vini corretta:
            </p>

            <div className="grid grid-cols-1 gap-3.5 mt-6">
              {/* Opzione 1: Koh Phayam */}
              <button
                type="button"
                onClick={() => {
                  try { sessionStorage.setItem('fp_wine_qr_location', 'phayam'); } catch (_) {}
                  setGeoState('phayam');
                }}
                className="w-full p-4 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all group cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🏝️</span>
                  <div>
                    <h3 className="font-black text-white text-sm group-hover:text-emerald-300 transition-colors">
                      Sono a Koh Phayam
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Vedi la Carta dei Vini di Flower Power Village
                    </p>
                  </div>
                </div>
              </button>

              {/* Opzione 2: Terraferma / Ranong */}
              <a
                href="https://www.flowerpowerpizza.com/?category=wines"
                className="w-full p-4 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-amber-500/50 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-md block"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🍕</span>
                  <div>
                    <h3 className="font-black text-white text-sm group-hover:text-amber-300 transition-colors">
                      Sono sulla Terraferma (Ranong)
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Apri Flower Power Pizza & Wine Ranong
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════
           NAVBAR SUPERIORE DEL VILLAGGIO
      ══════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#3b3530]/95 backdrop-blur-md border-b border-stone-800 shadow-lg py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* Tasto HOME ultra-chiaro & Logo */}
          <div className="flex items-center gap-3">
            <a
              href="/village"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 group"
              title={t.backToVillageHome}
            >
              <Home className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
              <span>HOME</span>
            </a>

            <a
              href="/village"
              className="flex items-center gap-2 text-stone-200 hover:text-white transition-colors group cursor-pointer"
            >
              <img
                src="/FP_04_-_LOGO_OFFICIAL_HD.png"
                alt="Flower Power Village"
                className="w-8 h-8 object-contain"
              />
              <div className="hidden sm:block text-left leading-tight">
                <span className="font-sans font-black text-xs uppercase tracking-wider text-white block">
                  FLOWER POWER <span className="font-light italic text-[#a2b997]">Village</span>
                </span>
                <span className="text-[10px] text-stone-400 block">Koh Phayam • Thailand</span>
              </div>
            </a>
          </div>

          {/* Destra: Switch Terraferma + Selettore Lingua */}
          <div className="flex items-center gap-2 relative">
            {/* Switch rapido per terraferma */}
            <a
              href="https://www.flowerpowerpizza.com/?category=wines"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer mr-2"
              title="Sei sulla terraferma a Ranong? Clicca qui per Flower Power Pizza"
            >
              <span>🍕</span>
              <span>Ranong Pizza</span>
            </a>

            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold border border-stone-700 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#a2b997]" />
              <span>{LANG_OPTIONS.find(l => l.code === lang)?.flag}</span>
              <span className="uppercase">{lang}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {isLangOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsLangOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-36 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                  {LANG_OPTIONS.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLang(item.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                        lang === item.code 
                          ? 'bg-amber-500/20 text-amber-300 font-black' 
                          : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <span className="text-base">{item.flag}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
           HEADER PRINCIPALE CON BANNER RUSTICO KOH PHAYAM
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 mt-20 sm:mt-24">
        {/* Barra di Navigazione Ritorno Rapido HOME */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <a
            href="/village"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 border border-stone-200/80 shadow-xs text-xs font-black uppercase tracking-wider transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-500 group-hover:-translate-x-1 transition-transform" />
            <Home className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.backToVillageHome}</span>
          </a>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-stone-500">
            <span>Flower Power Village</span>
            <span>/</span>
            <span className="text-amber-700 font-black">{t.wineListNav}</span>
          </div>
        </div>

        <header className="relative text-stone-100 py-6 sm:py-8 px-4 sm:px-8 overflow-hidden rounded-3xl shadow-xl mb-6" style={{ backgroundColor: '#3b3530' }}>
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <VillageSlideshow />
          </div>
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[0.5px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10.5px] font-black uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dine-in Cellar • Koh Phayam</span>
            </div>

            <h1 
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.01em' }}
            >
              {t.pageTitle}
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm mt-2 font-light leading-relaxed">
              {t.pageSubtitle}
            </p>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════
             BANNER VINO DELLA CASA (DAL VOLANTINO / QR CARTACEO)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-[#3b3530] to-[#2b2622] text-stone-100 rounded-3xl p-5 sm:p-7 shadow-lg border border-amber-500/30 mb-8 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <WineIcon className="w-48 h-48 text-amber-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍷</span>
                <h2 
                  className="text-xl sm:text-2xl font-black text-amber-300"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  {t.houseWineTitle}
                </h2>
              </div>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 leading-relaxed">
                {t.houseWineDesc}
              </p>
            </div>

            {/* Prezzi Calice & Caraffa (Direttamente dal QR code menu) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
              <div className="bg-stone-900/80 border border-stone-700/80 rounded-2xl p-3.5 sm:p-4 text-center">
                <div className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                  {t.glass}
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                  120 ฿
                </div>
              </div>

              <div className="bg-stone-900/80 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 text-center ring-1 ring-amber-500/20">
                <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                  {t.jug}
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                  590 ฿
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
             BARRA RICERCA & FILTRI CATEGORIA
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-stone-200 mb-8 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Campo di ricerca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Categorie Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: t.allWines, count: categoryCounts.all },
                { id: 'red', label: `🔴 ${t.redWines}`, count: categoryCounts.red },
                { id: 'white', label: `⚪ ${t.whiteWines}`, count: categoryCounts.white },
                { id: 'rose', label: `🌸 ${t.roseWines}`, count: categoryCounts.rose },
                { id: 'sparkling', label: `🥂 ${t.sparklingWines}`, count: categoryCounts.sparkling },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === tab.id
                      ? 'bg-[#3b3530] text-amber-300 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedCategory === tab.id ? 'bg-stone-800 text-amber-300' : 'bg-stone-200 text-stone-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
             GRIGLIA SCHEDE DEI VINI PREGIATI (STILE IDENTICO PIZZERIA)
        ══════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 shadow-sm">
            <WineIcon className="w-10 h-10 animate-bounce mx-auto text-amber-500 mb-3" />
            <p className="font-bold text-stone-600">Caricamento selezione della cantina...</p>
          </div>
        ) : visibleWines.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm text-stone-500">
            <WineIcon className="w-10 h-10 mx-auto text-stone-400 mb-2" />
            <p className="font-bold">{t.noWinesFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWines.map((wine) => {
              const translatedTitle = getWineTranslatedTitle(wine, lang) || wine.title;
              const translatedSubtitle = getWineTranslatedSubtitle(wine, lang) || wine.categorySubtitle;
              const translatedDesc = getWineTranslatedDesc(wine, lang) || wine.description;

              return (
                <article
                  key={wine.id}
                  onClick={() => setSelectedWine(wine)}
                  className="group bg-white border border-stone-200 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative select-none min-h-[460px] cursor-pointer"
                >
                  <div className="flex flex-row flex-grow relative min-h-[460px]">
                    {/* Left (35%): Bottiglia su sfondo tenue */}
                    <div className="w-[35%] bg-[#FAF8F5] border-r border-stone-200/90 p-3 flex items-center justify-center relative overflow-hidden flex-shrink-0 min-h-[460px]">
                      <div 
                        className="w-full h-full flex items-center justify-center transition-transform duration-300"
                        style={{
                          transform: `scale(${((wine as any).bottleScale || 100) / 100}) scaleX(${((wine as any).bottleScaleX || 100) / 100}) translateX(${(((wine as any).bottleOffsetX || 0) / 3.2)}%) translateY(${(((wine as any).bottleOffsetY || 0) / 3.2)}%)`
                        }}
                      >
                        <img
                          src={wine.bottleImage}
                          alt={translatedTitle}
                          loading="lazy"
                          decoding="async"
                          className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    </div>

                    {/* Right (65%): Dettagli del vino */}
                    <div className="w-[65%] p-4 sm:p-5 flex flex-col justify-between flex-grow">
                      <div>
                        {/* Nome del vino */}
                        <h3
                          className="font-bold text-stone-900 leading-tight text-base sm:text-lg"
                          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.01em' }}
                        >
                          {formatWineProductName(translatedTitle)}
                        </h3>

                        {/* Sottotitolo & Bandiera Nazione */}
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {renderCountryFlag(wine)}
                          <span className="text-xs text-stone-500 font-serif italic">
                            {translatedSubtitle}
                          </span>
                        </div>

                        {/* Gradazione Alcolica */}
                        {wine.alcohol && (
                          <div className="mt-2">
                            <span className="inline-block text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                              {wine.alcohol}
                            </span>
                          </div>
                        )}

                        {/* Descrizione Organolettica */}
                        <p
                          className="text-stone-500 text-xs font-light leading-relaxed mt-2.5 line-clamp-4"
                          style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                        >
                          {translatedDesc}
                        </p>
                      </div>

                      {/* Pricing & Dettagli Bar */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-widest text-stone-400 font-extrabold">
                            {t.bottlePrice}
                          </span>
                          <div className="flex items-baseline gap-1 leading-tight">
                            <span className="text-lg sm:text-xl font-black text-stone-900">
                              {renderWinePrice(wine.price)}
                            </span>
                            <span className="text-xs font-black text-stone-900 select-none">฿</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWine(wine);
                          }}
                          className="w-full py-2 bg-[#3b3530] hover:bg-[#2b2622] text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{t.detailsBtn}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
             NOTA CONCLUSIVA DINE-IN KOH PHAYAM
        ══════════════════════════════════════════════════════════════════ */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 mb-3">
            <WineIcon className="w-6 h-6" />
          </div>
          <h3 
            className="text-xl sm:text-2xl font-black text-stone-900"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Flower Power Village Restaurant & Wine Cellar
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm max-w-xl mx-auto mt-1 leading-relaxed">
            {t.dineInNotice}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/66958825573"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.reserveTable}</span>
            </a>

            <a
              href="/village/restaurant-pizzeria"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Utensils className="w-4 h-4 text-stone-600" />
              <span>Menu Ristorante</span>
            </a>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
             AREA RISERVATA STAFF / ADMIN DASHBOARD (CON ACCESSO PASSWORD)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="mt-12 pt-6 border-t border-stone-300/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Flower Power Village Resort & Italian Restaurant • Koh Phayam</span>
          </div>

          <a
            href="/admin?dept=resort&tab=wines"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#3b3530] hover:bg-[#272320] text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-400/60 shadow-md font-bold transition-all active:scale-95 group cursor-pointer"
            title="Pannello di controllo riservato allo staff (protetto da password)"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <WineIcon className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-300 transition-colors" />
            <span className="text-xs uppercase tracking-wider font-black">{t.staffAdminBtn}</span>
            <Lock className="w-3 h-3 text-stone-400" />
          </a>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           MODALE LIGHTBOX SOMMELIER (FULL SCREEN ZOOM DETAILS)
      ══════════════════════════════════════════════════════════════════ */}
      {selectedWine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div 
            className="absolute inset-0" 
            onClick={() => setSelectedWine(null)} 
          />

          <div 
            className="relative z-10 bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 flex flex-col md:flex-row gap-6 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsante chiusura */}
            <button
              onClick={() => setSelectedWine(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all cursor-pointer z-20"
              title="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bottiglia a tutta altezza */}
            <div className="w-full md:w-5/12 bg-[#FAF8F5] rounded-2xl p-6 flex items-center justify-center border border-stone-200/60 min-h-[280px]">
              <img
                src={selectedWine.bottleImage}
                alt={getWineTranslatedTitle(selectedWine, lang) || selectedWine.title}
                className="max-h-72 max-w-full object-contain filter drop-shadow-xl"
              />
            </div>

            {/* Dettagli completi */}
            <div className="w-full md:w-7/12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base">{renderCountryFlag(selectedWine)}</span>
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                    {selectedWine.categoryType?.toUpperCase()}
                  </span>
                  {selectedWine.alcohol && (
                    <span className="text-[10.5px] font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                      {selectedWine.alcohol}
                    </span>
                  )}
                </div>

                <h2 
                  className="text-2xl sm:text-3xl font-black text-stone-950 mt-2 leading-tight"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  {formatWineProductName(getWineTranslatedTitle(selectedWine, lang) || selectedWine.title)}
                </h2>

                <p className="text-xs sm:text-sm text-stone-500 font-serif italic mt-1">
                  {getWineTranslatedSubtitle(selectedWine, lang) || selectedWine.categorySubtitle}
                </p>

                {/* Note del sommelier */}
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.sommelierNotes}</span>
                  </h4>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {getWineTranslatedDesc(selectedWine, lang) || selectedWine.description}
                  </p>
                </div>
              </div>

              {/* Prezzo e azione */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-stone-400 font-extrabold block">
                    {t.bottlePrice}
                  </span>
                  <div className="flex items-baseline gap-1 text-2xl font-black text-stone-950">
                    <span>{renderWinePrice(selectedWine.price)}</span>
                    <span className="text-sm">฿</span>
                  </div>
                </div>

                <a
                  href="https://wa.me/66958825573"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#3b3530] hover:bg-[#2b2622] text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all inline-flex items-center gap-1.5 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.reserveTable}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillageWineListPage;

