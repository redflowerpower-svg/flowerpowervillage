import React from 'react';
import {
  Wifi,
  Snowflake,
  Lock,
  Droplets,
  Wind,
  Utensils,
  Coffee,
  Laptop,
  Sofa,
  Sprout,
  Sun,
  Maximize,
  Armchair,
  Waves,
  Dumbbell,
  Sparkles,
  Briefcase,
  Info
} from 'lucide-react';
import { Language } from '../../lib/translations';

export interface RoomFeaturesGridProps {
  features?: any;
  details?: any;
  featuresArray?: string[];
  squareMeters?: number;
  lang?: Language | string;
}

interface CategoryConfig {
  id: string;
  titles: Record<string, string>;
  keys: string[];
}

const categories: CategoryConfig[] = [
  {
    id: 'space_connectivity',
    titles: {
      IT: 'Spazio & Connettività',
      EN: 'Space & Connectivity',
      DE: 'Raum & Konnektivität',
      TH: 'พื้นที่และการเชื่อมต่อ'
    },
    keys: ['room_size', 'wifi', 'hubit_coworking']
  },
  {
    id: 'climate_safety',
    titles: {
      IT: 'Clima & Sicurezza',
      EN: 'Climate & Safety',
      DE: 'Klima & Sicherheit',
      TH: 'สภาพอากาศและความปลอดภัย'
    },
    keys: ['air_conditioning', 'ceiling_fan', 'safe']
  },
  {
    id: 'interior_comfort',
    titles: {
      IT: 'Interni & Comfort',
      EN: 'Interior & Comfort',
      DE: 'Interieur & Komfort',
      TH: 'การตกแต่งภายในและความสะดวกสบาย'
    },
    keys: ['desk', 'sofa_bed']
  },
  {
    id: 'kitchen_amenities',
    titles: {
      IT: 'Cucina & Servizi',
      EN: 'Kitchen & Amenities',
      DE: 'Küche & Ausstattung',
      TH: 'ห้องครัวและสิ่งอำนวยความสะดวก'
    },
    keys: ['hot_water', 'kitchen', 'refrigerator']
  },
  {
    id: 'private_outdoor',
    titles: {
      IT: 'Aree Esterne Private',
      EN: 'Private Outdoor Areas',
      DE: 'Private Außenbereiche',
      TH: 'พื้นที่กลางแจ้งส่วนตัว'
    },
    keys: ['outdoor_lounge', 'terrace_balcony', 'private_garden']
  },
  {
    id: 'resort_facilities',
    titles: {
      IT: 'Servizi Comuni del Resort',
      EN: 'Shared Resort Facilities',
      DE: 'Gemeinsame Resorteinrichtungen',
      TH: 'สิ่งอำนวยความสะดวกส่วนกลางของรีสอร์ท'
    },
    keys: ['swimming_pool', 'gym', 'yoga_temple']
  }
];

const cleanTranslations: Record<string, Record<string, string>> = {
  wifi: {
    IT: 'Wi-Fi',
    EN: 'Wi-Fi',
    DE: 'Wi-Fi',
    TH: 'Wi-Fi'
  },
  hubit_coworking: {
    IT: 'Accesso HUBit@ CoWorking Area 100Mbps',
    EN: 'Access HUBit@ CoWorking Area 100Mbps',
    DE: 'Zugang HUBit@ CoWorking Area 100Mbps',
    TH: 'เข้าใช้ HUBit@ CoWorking Area 100Mbps'
  },
  air_conditioning: {
    IT: 'Aria Condizionata',
    EN: 'Air Conditioning',
    DE: 'Klimaanlage',
    TH: 'เครื่องปรับอากาศ'
  },
  ceiling_fan: {
    IT: 'Ventilatore a soffitto',
    EN: 'Ceiling Fan',
    DE: 'Deckenventilator',
    TH: 'พัดลมเพดาน'
  },
  safe: {
    IT: 'Cassaforte',
    EN: 'In-room Safe',
    DE: 'Zimmersafe',
    TH: 'ตู้นิรภัย'
  },
  desk: {
    IT: 'Scrivania / Area lavoro',
    EN: 'Desk / Workspace',
    DE: 'Schreibtisch',
    TH: 'โต๊ะทำงาน'
  },
  sofa_bed: {
    IT: 'Divano Letto',
    EN: 'Sofa Bed',
    DE: 'Schlafsofa',
    TH: 'โซฟาเบด'
  },
  hot_water: {
    IT: 'Acqua Calda',
    EN: 'Hot Water',
    DE: 'Warmwasser',
    TH: 'เครื่องทำน้ำอุ่น'
  },
  kitchen: {
    IT: 'Cucina privata',
    EN: 'Private Kitchen',
    DE: 'Private Küche',
    TH: 'ห้องครัวส่วนตัว'
  },
  refrigerator: {
    IT: 'Frigorifero',
    EN: 'Refrigerator',
    DE: 'Kühlschrank',
    TH: 'ตู้เย็น'
  },
  outdoor_lounge: {
    IT: "Salotto all'aperto",
    EN: 'Outdoor lounge area',
    DE: 'Lounge-Bereich im Freien',
    TH: 'พื้นที่นั่งเล่นกลางแจ้ง'
  },
  terrace_balcony: {
    IT: 'Terrazzo o Balcone',
    EN: 'Terrace / Balcony',
    DE: 'Terrasse / Balkon',
    TH: 'ระเบียง'
  },
  private_garden: {
    IT: 'Giardino privato',
    EN: 'Private Garden',
    DE: 'Privater Garten',
    TH: 'สวนส่วนตัว'
  },
  swimming_pool: {
    IT: 'Piscina',
    EN: 'Swimming Pool',
    DE: 'Schwimmbad',
    TH: 'สระว่ายน้ำ'
  },
  gym: {
    IT: 'Palestra',
    EN: 'Gym / Fitness',
    DE: 'Fitnessraum',
    TH: 'ห้องฟิตเนส'
  },
  yoga_temple: {
    IT: 'Tempio Yoga',
    EN: 'Yoga Temple',
    DE: 'Yoga-Tempel',
    TH: 'ศาลาโยคะ'
  }
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  hubit_coworking: Briefcase,
  air_conditioning: Snowflake,
  ceiling_fan: Wind,
  safe: Lock,
  desk: Laptop,
  sofa_bed: Sofa,
  hot_water: Droplets,
  kitchen: Utensils,
  refrigerator: Coffee,
  outdoor_lounge: Armchair,
  terrace_balcony: Sun,
  private_garden: Sprout,
  swimming_pool: Waves,
  gym: Dumbbell,
  yoga_temple: Sparkles,
  room_size: Maximize
};

const defaultAcNotes: Record<string, string> = {
  IT: "Aria Condizionata disponibile in ogni camera. Se non è inclusa o prepagata nella tua prenotazione, è utilizzabile a consumo al costo di 40 THB per kWh (pari a circa 20 THB all'ora). Si consiglia di tenere porte e finestre chiuse mentre è in funzione.",
  EN: "Air Conditioning is available in every unit. If not included or prepaid in your booking, it is available on a pay-as-you-go basis at 40 THB per kWh (approximately 20 THB per hour). We kindly ask you to keep doors and windows closed while running.",
  DE: "Klimaanlage ist in jeder Einheit verfügbar. Wenn sie nicht in Ihrer Buchung enthalten oder vorausbezahlt ist, kann sie verbrauchsabhängig für 40 THB pro kWh (ca. 20 THB pro Stunde) genutzt werden. Bitte halten Sie Türen und Fenster während des Betriebs geschlossen.",
  TH: "มีเครื่องปรับอากาศในทุกยูนิต หากไม่ได้รวมอยู่ในรายการจอง สามารถใช้งานแบบชำระตามจริงในราคา 40 บาทต่อ kWh (ประมาณ 20 บาทต่อชั่วโมง) กรุณาปิดประตูและหน้าต่างขณะเปิดใช้งาน"
};

// Helper function to strip any potential emoji characters
function stripEmojis(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
}

export const RoomFeaturesGrid: React.FC<RoomFeaturesGridProps> = ({
  features,
  details,
  featuresArray,
  squareMeters,
  lang = 'IT'
}) => {
  const currentLang = String(lang || 'IT').toUpperCase();
  const validLang = ['IT', 'EN', 'DE', 'TH'].includes(currentLang) ? currentLang : 'IT';

  let raw = features || details?.features || details;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = {};
    }
  }
  const feats = (typeof raw === 'object' && raw !== null) ? raw : {};
  const sqMeters = squareMeters || details?.squareMeters || feats?.room_size || feats?.squareMeters || 0;

  // Build active features map
  const activeFeaturesMap: Record<string, { key: string; label: string; IconComponent: React.ComponentType<{ className?: string }> }> = {};

  if (sqMeters > 0) {
    let sizeLabel = `Metratura: ${sqMeters} mq`;
    if (validLang === 'EN') sizeLabel = `Size: ${sqMeters} sqm`;
    else if (validLang === 'DE') sizeLabel = `Größe: ${sqMeters} m²`;
    else if (validLang === 'TH') sizeLabel = `ขนาดห้อง: ${sqMeters} ตร.ม.`;

    activeFeaturesMap['room_size'] = {
      key: 'room_size',
      label: sizeLabel,
      IconComponent: Maximize
    };
  }

  const allKeys = Object.keys(cleanTranslations);
  allKeys.forEach((key) => {
    if (feats && feats[key] === true) {
      const rawText = cleanTranslations[key]?.[validLang] || cleanTranslations[key]?.['IT'] || key;
      activeFeaturesMap[key] = {
        key,
        label: stripEmojis(rawText),
        IconComponent: iconMap[key] || Sparkles
      };
    }
  });

  // Fallback: If no boolean features object exists but featuresArray is provided
  if (Object.keys(activeFeaturesMap).length === 0 && Array.isArray(featuresArray) && featuresArray.length > 0) {
    featuresArray.forEach((str, index) => {
      if (str) {
        const cleanStr = stripEmojis(str);
        if (cleanStr) {
          activeFeaturesMap[`arr_${index}`] = {
            key: `arr_${index}`,
            label: cleanStr,
            IconComponent: Sparkles
          };
        }
      }
    });
  }

  // Air conditioning check for consumption banner
  const hasAc = (feats && feats.air_conditioning === true) || 
    (Array.isArray(featuresArray) && featuresArray.some(s => typeof s === 'string' && (s.toLowerCase().includes('ac') || s.toLowerCase().includes('aria') || s.toLowerCase().includes('air'))));

  // Extract AC Note
  const acNoteObj = feats?.ac_consumption_note;
  let acNoteText = defaultAcNotes[validLang] || defaultAcNotes['IT'];
  if (acNoteObj) {
    if (typeof acNoteObj === 'string') {
      acNoteText = stripEmojis(acNoteObj);
    } else if (typeof acNoteObj === 'object' && acNoteObj !== null) {
      const rawVal = acNoteObj[validLang.toLowerCase()] || acNoteObj[validLang] || acNoteObj['it'] || acNoteText;
      acNoteText = stripEmojis(rawVal);
    }
  }

  const acBannerTitle = validLang === 'EN' ? 'Pay-As-You-Go Air Conditioning' : validLang === 'DE' ? 'Klimaanlage nach Verbrauch' : validLang === 'TH' ? 'ข้อมูลการใช้เครื่องปรับอากาศ' : 'Aria Condizionata a Consumo';

  const hasAnyActive = Object.keys(activeFeaturesMap).length > 0;
  if (!hasAnyActive && !hasAc) {
    return null;
  }

  return (
    <div className="space-y-6 my-3" id="sec-room-features-grid">
      {categories.map((cat) => {
        // Find which items in this category are active
        const items = cat.keys
          .map((k) => activeFeaturesMap[k])
          .filter(Boolean);

        if (items.length === 0) return null;

        const categoryTitle = cat.titles[validLang] || cat.titles['IT'];

        return (
          <div key={cat.id} className="space-y-3">
            {/* CATEGORY TITLE WITH ELEGANT EMERALD INDICATOR */}
            <div className="flex items-center gap-2 border-b border-stone-800/80 pb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <h5 className="text-xs font-black text-stone-300 uppercase tracking-wider">
                {categoryTitle}
              </h5>
            </div>

            {/* CATEGORY ITEMS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((feat) => {
                const IconComp = feat.IconComponent;
                return (
                  <div
                    key={feat.key}
                    className="border border-stone-800/80 bg-stone-900/40 hover:bg-stone-900/70 hover:border-emerald-500/40 rounded-xl p-3 flex items-center gap-3.5 transition-all shadow-sm group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-stone-900 border border-stone-800 text-emerald-400 group-hover:text-emerald-300 group-hover:scale-105 transition-all flex-shrink-0 shadow-inner">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-extrabold text-stone-100 tracking-tight leading-tight">
                      {feat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ELEGANT CLIMA CONSUMPTION BANNER */}
      {hasAc && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 text-stone-300 rounded-2xl p-4 space-y-1.5 shadow-md mt-4">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{acBannerTitle}</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed italic font-medium">
            {acNoteText}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomFeaturesGrid;
