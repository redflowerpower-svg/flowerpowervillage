import { Wifi, ParkingCircle, Waves, Utensils, Sparkles, PawPrint } from 'lucide-react';
import { Language } from '../booking/lib/translations';

interface Props {
  lang?: Language;
}

const translations = {
  "IT": {
    "tag": "Perché Sceglierci",
    "title": "Una Fuga Completa sull'Isola",
    "items": [
      {
        "title": "Ristorante 100% Italiano",
        "desc": "Autentica pizza, pasta fatta in casa e piatti classici serviti tutti i giorni dalle 8:00 alle 21:15."
      },
      {
        "title": "Piscina del Villaggio",
        "desc": "Rilassati a bordo piscina circondato dalla lussureggiante vegetazione tropicale, a pochi passi dal tuo bungalow."
      },
      {
        "title": "Spa & Trattamenti",
        "desc": "Massaggi tradizionali thailandesi e trattamenti benessere con operatori qualificati durante la stagione alta."
      },
      {
        "title": "WiFi Gratuito & Parcheggio",
        "desc": "Connessione WiFi ad alta velocità gratuita e parcheggio privato disponibili in tutta la struttura."
      },
      {
        "title": "Animali Benvenuti",
        "desc": "Amiamo gli ospiti a quattro zampe. Ti chiediamo gentilmente di darcene conferma al momento della prenotazione."
      },
      {
        "title": "Aperti tutto l'Anno",
        "desc": "A differenza di molte strutture sull'isola, siamo aperti tutto l'anno per garantirti la massima flessibilità."
      }
    ]
  },
  "EN": {
    "tag": "Why Choose Us",
    "title": "A Complete Island Escape",
    "items": [
      {
        "title": "100% Italian Restaurant",
        "desc": "Authentic pizza, pasta, and Italian classics served daily from 8:00 to 21:15."
      },
      {
        "title": "Village Swimming Pool",
        "desc": "Relax by the pool, surrounded by tropical nature, steps from your bungalow."
      },
      {
        "title": "Spa & Massage",
        "desc": "Traditional Thai massage and spa treatments available during high season."
      },
      {
        "title": "Free WiFi & Parking",
        "desc": "Complimentary high-speed WiFi and private parking throughout the property."
      },
      {
        "title": "Pets Welcome",
        "desc": "We love four-legged guests. Please confirm details at the time of your booking."
      },
      {
        "title": "Open All Year",
        "desc": "Unlike many island resorts, we stay open year-round for your convenience."
      }
    ]
  },
  "TH": {
    "tag": "ทำไมต้องเลือกเรา",
    "title": "การพักผ่อนบนเกาะที่สมบูรณ์แบบ",
    "items": [
      {
        "title": "ร้านอาหารอิตาเลียน 100%",
        "desc": "เสิร์ฟพิซซ่าเตาถ่านแท้ พาสต้าเส้นสด และอาหารอิตาเลียนคลาสสิกทุกวัน เวลา 8:00 ถึง 21:15 น."
      },
      {
        "title": "สระว่ายน้ำส่วนตัว",
        "desc": "ผ่อนคลายริมสระว่ายน้ำ ท่ามกลางธรรมชาติเขตร้อนอันร่มรื่น เพียงไม่กี่ก้าวจากบังกะโลของคุณ"
      },
      {
        "title": "สปา & บริการนวด",
        "desc": "นวดแผนไทยดั้งเดิมและทรีทเมนท์สปาเพื่อการผ่อนคลาย เปิดบริการในช่วงฤดูท่องเที่ยว"
      },
      {
        "title": "ฟรีอินเทอร์เน็ต & ที่จอดรถ",
        "desc": "บริการอินเทอร์เน็ตไร้สายความเร็วสูงฟรี และพื้นที่จอดรถส่วนตัวภายในรีสอร์ท"
      },
      {
        "title": "ยินดีต้อนรับสัตว์เลี้ยง",
        "desc": "เรายินดีต้อนรับสัตว์เลี้ยงแสนรักของคุณ โปรดยืนยันรายละเอียดกับเราล่วงหน้าขณะทำการจอง"
      },
      {
        "title": "เปิดบริการตลอดทั้งปี",
        "desc": "ต่างจากรีสอร์ทอื่นบนเกาะ เราเปิดให้บริการตลอดทั้งปีเพื่อต้อนรับและอำนวยความสะดวกให้คุณเสมอ"
      }
    ]
  },
  "DE": {
    "tag": "Warum Uns Wählen",
    "title": "Eine vollkommene Inselflucht",
    "items": [
      {
        "title": "100% Italienisches Restaurant",
        "desc": "Authentische Pizza, Pasta und italienische Klassiker, täglich serviert von 8:00 bis 21:15 Uhr."
      },
      {
        "title": "Gemeinschafts-Pool",
        "desc": "Entspannen Sie am Pool, umgeben von tropischer Natur, nur wenige Schritte von Ihrem Bungalow entfernt."
      },
      {
        "title": "Spa & Massage",
        "desc": "Traditionelle thailändische Massagen und wellnessanwendungen in der Hochsaison."
      },
      {
        "title": "Kostenloses WLAN & Parken",
        "desc": "Kostenloses Highspeed-WLAN und Privatparkplätze auf dem gesamten Gelände."
      },
      {
        "title": "Haustiere Willkommen",
        "desc": "Wir lieben vierbeinige Gäste. Bitte bestätigen Sie die Details bei Ihrer Buchung."
      },
      {
        "title": "Ganzjährig Geöffnet",
        "desc": "Im Gegensatz zu vielen Inselresorts haben wir das ganze Jahr über für Sie geöffnet."
      }
    ]
  }
};

const icons = [Utensils, Waves, Sparkles, Wifi, PawPrint, ParkingCircle];

export default function VillageHighlights({ lang = 'IT' }: Props) {
  const t = translations[lang] || translations['IT'];

  return (
    <section className="py-24 bg-stone-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p 
            className="text-xs tracking-[0.4em] uppercase text-emerald-700 mb-3" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {t.tag}
          </p>
          <h2
            className="text-stone-850 mb-4"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}
          >
            {t.title}
          </h2>
          <div className="w-12 h-px bg-emerald-600 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.items.map((h, i) => {
            const Icon = icons[i] || Wifi;
            return (
              <div
                key={i}
                className="group p-8 bg-white border border-stone-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 rounded-3xl"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300 mb-5 rounded-2xl">
                  <Icon size={20} className="text-emerald-700" />
                </div>
                <h3
                  className="text-stone-855 mb-3 font-semibold"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif', fontSize: '1.25rem' }}
                >
                  {h.title}
                </h3>
                <p 
                  className="text-sm text-stone-550 leading-relaxed font-light"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {h.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
