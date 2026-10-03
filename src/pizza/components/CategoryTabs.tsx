import { useRef, useEffect } from 'react';
import type { MenuCategory } from '../data/menuData';
import { Pizza, Salad, Coffee, Beer, Sandwich, Dessert, Croissant, GlassWater, CupSoda, Wine, Sparkles } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../config/languages';

interface Props {
  categories: MenuCategory[];
  activeId: string;
  onChange: (id: string) => void;
  lang?: Language;
}

// Custom highly contextual food icons matching Lucide styling
const PastaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 16c0 3 4.5 5 9 5s9-2 9-5" />
    <path d="M2 15h20" />
    <path d="M4 12c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0" />
    <path d="M4 9c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0" />
    <path d="M4 6c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0" />
  </svg>
);

const BurgerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Top Bun */}
    <path d="M3 11c0-4.4 4-8 9-8s9 3.6 9 8H3z" />
    {/* Patty */}
    <path d="M4 14h16" />
    {/* Cheese / Lettuce */}
    <path d="M3 14l2 2h14l2-2" />
    {/* Bottom Bun */}
    <path d="M5 18h14c0 2-3.1 3-7 3s-7-1-7-3z" />
  </svg>
);

const FriesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Fries sticking up */}
    <path d="M6 14V3c.5-.5 1-.5 1.5 0v11" />
    <path d="M10 14V2c.5-.5 1-.5 1.5 0v12" />
    <path d="M14 14V4c.5-.5 1-.5 1.5 0v10" />
    <path d="M18 14V7c.5-.5 1-.5 1.5 0v7" />
    {/* Box */}
    <path d="M 5 14 L 7 22 H 17 L 19 14" />
    <path d="M 5 14 C 9 16 15 16 19 14" />
  </svg>
);

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'daily-specials': Sparkles,
  'traditional-italian-pizza': Pizza,
  'pasta': PastaIcon,
  'italian-salads': Salad,
  'pizza-sandwich': Sandwich,
  'pizza-burgers': BurgerIcon,
  'french-fries': FriesIcon,
  'desserts': Dessert,
  'breakfast-and-snacks': Croissant,
  'coffee-shop': Coffee,
  'fruit-drinks': GlassWater,
  'soft-drinks': CupSoda,
  'beers': Beer,
  'wines': Wine,
};

const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = {
  'daily-specials': {
    IT: { name: 'Specialità del Giorno', desc: 'Creazioni esclusive e piatti speciali del giorno preparati dal nostro chef con ingredienti freschi di stagione.' },
    EN: { name: 'Daily Specials', desc: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef with premium ingredients.' },
    TH: { name: 'เมนูพิเศษประจำวัน', desc: 'เมนูพิเศษประจำวันรังสรรค์โดยเชฟชาวอิตาเลียน ด้วยวัตถุดิบสดใหม่ตามฤดูกาลและรสชาติอิตาเลียนแท้' },
    DE: { name: 'Tagesempfehlungen', desc: 'Täglich wechselnde Spezialitäten und saisonale Gerichte unseres Chefkochs aus frischen Zutaten.' },
  },
  'traditional-italian-pizza': {
    IT: { name: 'Pizze Classiche', desc: "La pizza è il cuore del nostro locale. Utilizziamo solo ingredienti italiani selezionati di prima qualità: dalla farina al pomodoro, dai formaggi ai salumi, senza scendere a compromessi. La nostra pizza tradizionale ad alta idratazione è realizzata con un impasto al 90% d'acqua, fatto maturare lentamente per almeno 36 ore. Il risultato è una pizza croccante, leggera, altamente digeribile e ricca di sapore." },
    EN: { name: "Traditional Italian Pizza", desc: "Pizza Is The Heart Of Our Restaurant. We Use Only Selected Italian Ingredients, From Flour To Tomato, From Cheeses To Cold Cuts, With No Compromise On Quality. Our Traditional High-Hydration Italian Pizza Is Made With A 90% Water Dough, Slowly Matured For At Least 36 Hours. The Result Is A Crispy, Light, Highly Digestible Pizza, Full Of Flavor." },
    TH: { name: 'พิซซ่าคลาสสิค', desc: "พิซซ่าคือหัวใจของร้านอาหารของเรา เราใช้เฉพาะวัตถุดิบอิตาเลียนที่คัดสรรมาอย่างดี ตั้งแต่แป้ง มะเขือเทศ ชีส ไปจนถึงโคลด์คัต โดยไม่ประนีประนอมด้านคุณภาพ พิซซ่าอิตาเลียนแบบดั้งเดิมของเราเป็นแป้งไฮเดรชันสูง ผสมน้ำถึง 90% และหมักอย่างช้าๆ อย่างน้อย 36 ชั่วโมง ผลลัพธ์คือพิซซ่าที่กรอบ เบา ย่อยง่าย และเต็มไปด้วยรสชาติ" },
    DE: { name: 'Klassische Pizzas', desc: "Die Pizza ist das Herzstück unseres Restaurants. Wir verwenden ausschließlich ausgewählte italienische Zutaten bester Qualität: vom Mehl bis zu den Tomaten, vom Käse bis zum Aufschnitt, ohne Kompromisse. Unsere traditionelle italienische Pizza mit hohem Feuchtigkeitsgehalt wird aus einem Teig mit 90 % Wasseranteil hergestellt, der mindestens 36 Stunden lang langsam reift. Das Ergebnis ist eine knusprige, leichte, besonders bekömmliche und geschmacksintensive Pizza." },
  },
  'pasta': {
    IT: { name: 'Pasta', desc: 'Primi piatti della tradizione' },
    EN: { name: 'Pasta Dishes', desc: 'Traditional Italian pasta' },
    TH: { name: 'พาสต้า', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิม' },
    DE: { name: 'Pasta', desc: 'Traditionelle italienische Pasta' },
  },
  'italian-salads': {
    IT: { name: "Insalate Italiane", desc: "Insalate in stile italiano con verdure fresche e ingredienti sani e di alta qualità. Servite con gustose salse fatte in casa e olio extravergine d'oliva: fresche, deliziose e salutari." },
    EN: { name: "Italian Salads", desc: "Italian-style salads with fresh vegetables and healthy, high-quality ingredients. Served with tasty homemade sauces, extra virgin olive oil. Fresh, delicious and healthy" },
    TH: { name: 'สลัดอิตาเลียน', desc: "สลัดสไตล์อิตาเลียน ทำจากผักสดและวัตถุดิบเพื่อสุขภาพคุณภาพสูง เสิร์ฟพร้อมซอสโฮมเมดรสอร่อยและน้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิน สดใหม่ อร่อย และดีต่อสุขภาพ" },
    DE: { name: 'Italienische Salate', desc: "Salate nach italienischer Art mit frischem Gemüse und gesunden, hochwertigen Zutaten. Serviert mit schmackhaften hausgemachten Dressings und nativem Olivenöl extra: Frisch, köstlich und gesund." },
  },
  'pizza-sandwich': {
    IT: { name: "Focaccia\nPizza Sandwich", desc: "La focaccia è un delizioso pane tradizionale italiano originario di Genova. Farciscila con i tuoi ingredienti preferiti e crea il tuo panino personalizzato." },
    EN: { name: "Focaccia\nPizza Sandwiches", desc: "Focaccia Is A Italian Traditional Delicius Bread From Genoa. Fill It With Your Favorite Ingredients And Create Your Custom Sandwich" },
    TH: { name: "ฟอคคาเซีย\nพิตซ่าแซนด์วิช", desc: "ฟอคคาเซียเป็นขนมปังดั้งเดิมแสนอร่อยจากเมืองเจนัว เติมไส้ด้วยวัตถุดิบที่คุณชอบและสร้างแซนด์วิชในแบบของคุณ" },
    DE: { name: "Focaccia\nPizza Sandwich", desc: "Die Focaccia ist ein köstliches traditionelles italienisches Brot aus Genua. Belegen Sie sie mit Ihren Lieblingszutaten und kreieren Sie Ihr ganz persönliches Sandwich." },
  },
  'pizza-burgers': {
    IT: { name: "Pizza Burger", desc: "Preparati con pane per hamburger appena sfornato e hamburger fatti in casa in stile italiano, serviti con patatine fritte, ketchup e maionese: freschi, gustosi e soddisfacenti." },
    EN: { name: "Pizza Burgers", desc: "Prepared With Freshly Baked Burger Buns And Homemade Italian-Style Hamburgers, Served With French Fries, Ketchup And Mayonnaise. Fresh, Tasty And Satisfying" },
    TH: { name: 'พิซซ่าเบอร์เกอร์', desc: "ทำจากเบอร์เกอร์บันอบสดใหม่ และแฮมเบอร์เกอร์โฮมเมดสไตล์อิตาเลียน เสิร์ฟพร้อมเฟรนช์ฟรายส์ ซอสมะเขือเทศและมายองเนส สดใหม่ทุกจาน" },
    DE: { name: 'Pizza Burger', desc: "Zubereitet mit frisch gebackenen Burger-Brötchen und hausgemachten Hamburger-Patties nach italienischer Art, serviert mit Pommes frites, Ketchup und Mayonnaise: Frisch, lecker und sättigend." },
  },
  'french-fries': {
    IT: { name: "Patatine Fritte", desc: "Le patatine fritte sono preparate al momento su ordinazione, croccanti e deliziose, e vengono servite con ketchup e maionese. Scegli la tua versione preferita e gustale." },
    EN: { name: "French Fries", desc: "French Fries Are Freshly Prepared To Order, Crispy And Delicious, And Served With Ketchup And Mayonnaise. Choose Your Favorite Version And Enjoy" },
    TH: { name: 'มันฝรั่งทอด', desc: "เฟรนช์ฟรายส์ทอดสดใหม่ตามออเดอร์ กรอบนอกนุ่มใน เสิร์ฟพร้อมซอสมะเขือเทศและมายองเนส แสนอร่อย เลือกเวอร์ชั่นที่คุณชอบได้เลย" },
    DE: { name: 'Pommes Frites', desc: "Unsere Pommes frites werden frisch auf Bestellung zubereitet, sind knusprig und lecker und werden mit Ketchup und Mayonnaise serviert. Wählen Sie Ihre Lieblingsvariante und genießen Sie." },
  },
  'desserts': {
    IT: { name: "Dolci", desc: "Il dessert è il momento in cui il pasto si trasforma in puro piacere. I nostri dolci sono fatti a mano, preparati con ingredienti freschi e genuini e tutta la passione della cucina casalinga." },
    EN: { name: "Desserts", desc: "Dessert Is The Moment When A Meal Becomes The Ultimate Pleasure. Our Sweets Are Handmade, Prepared With Fresh, Genuine Ingredients And Homemade Passion" },
    TH: { name: 'ของหวาน', desc: "ของหวานคือช่วงเวลาที่มื้ออาหารกลายเป็นความสุขสูงสุด ขนมของเราทำแบบโฮมเมด ใช้วัตถุดิบสดใหม่และแท้จริง พร้อมความหลงใหลในการทำด้วยมือ" },
    DE: { name: 'Desserts', desc: "Das Dessert ist der Moment, in dem ein Essen zum ultimativen Genuss wird. Unsere Süßspeisen sind handgemacht, zubereitet aus frischen, natürlichen Zutaten und mit einer großen Portion Leidenschaft." },
  },
  'breakfast-and-snacks': {
    IT: { name: "Colazione e Snack", desc: "La colazione è il pasto più importante della giornata, il momento che detta il ritmo a tutto ciò che segue. Iniziare la giornata con ingredienti freschi, genuini e di alta qualità, preparati al momento con cura, fa davvero la differenza, offrendo un sapore autentico, energia duratura e un piacevole inizio." },
    EN: { name: "Breakfast And Snacks", desc: "Breakfast Is The Most Important Meal Of The Day, The Moment That Sets The Tone And Rhythm For Everything That Follows. Starting Your Day With Fresh, Genuine, High-Quality Ingredients, Carefully Prepared To Order, Truly Makes All The Difference, Offering Real Flavor, Lasting Energy, And An Enjoyable Start To The Day" },
    TH: { name: 'อาหารเช้าและของว่าง', desc: "การเริ่มต้นวันใหม่ด้วยอาหารเช้าเป็นสิ่งสำคัญที่สุดของวัน เป็นช่วงเวลาที่กำหนดจังหวะและอารมณ์ของทั้งวัน การเลือกใช้วัตถุดิบที่สดใหม่ เป็นธรรมชาติ และมีคุณภาพ ซึ่งปรุงสดใหม่ทุกจานด้วยความใส่ใจ จะช่วยเติมพลัง สร้างความสุข มอบรสชาติที่แท้จริง และสร้างจังหวะที่ดีให้คุณเริ่มต้นวันได้อย่างสมบูรณ์แบบมากยิ่งขึ้น" },
    DE: { name: 'Frühstück & Snacks', desc: "Das Frühstück ist die wichtigste Mahlzeit des Tages – der Moment, der den Rhythmus für alles Kommende vorgeibt. Starten Sie Ihren Tag mit frischen, natürlichen und hochwertigen Zutaten, die sorgfältig auf Bestellung zubereitet werden. Das macht den Unterschied und bietet echten Geschmack, lang anhaltende Energie und einen rundum gelungenen Start in den Tag." },
  },
  'coffee-shop': {
    IT: { name: "Caffetteria", desc: "Il caffè è il cuore della cultura italiana. Non è solo una bevanda, ma un rituale quotidiano di pausa e piacere, da gustare lentamente e con un sorriso, ogni giorno. Dall'espresso alle versioni più golose, ogni tazza offre un'esperienza autentica e semplice, fatta di sapore e piccoli dettagli curati con passione." },
    EN: { name: "Coffee Shop", desc: "Coffee Is The Heart Of Italian Culture. It Is Not Just A Drink, But A Daily Ritual Of Pause And Pleasure, To Be Enjoyed Slowly With A Smile, Every Day. From Espresso To More Indulgent Versions, Every Cup Offers An Authentic Experience, Simple, Made Of Flavor And Small Details Crafted With Passion" },
    TH: { name: 'ร้านกาแฟ', desc: "กาแฟคือหัวใจของวัฒนธรรมอิตาลี ไม่ใช่แค่เครื่องดื่ม แต่คือพิธีกรรมประจำวันของการหยุดพัก ความผ่อนคลาย และความสุขเล็กๆ ที่ควรดื่มด่ำอย่างสบายใจ พร้อมรอยยิ้ม in ทุกๆ วัน ตั้งแต่เอสเพรสโซไปจนถึงสูตรที่เข้มข้นยิ่งขึ้น ทุกถ้วยมอบประสบการณ์ที่แท้จริง เรียบง่าย เต็มไปด้วยรสชาติ และรายละเอียดเล็กๆ ที่เปี่ยมด้วยความหลงใหล" },
    DE: { name: 'Kaffeeshop', desc: "Kaffee ist das Herzstück der italienischen Kultur. Er ist nicht nur ein Getraenk, sondern ein tägliches Ritual der Pause und des Genusses, das man jeden Tag in aller Ruhe und mit einem Lächeln zelebrieren sollte. Vom klassischen Espresso bis hin zu feinen Kaffeespezialitäten bietet jede Tasse ein authentisches, einfaches Erlebnis, geprägt von vollem Aroma und liebevollen Details." },
  },
  'fruit-drinks': {
    IT: { name: "Bevande alla Frutta", desc: "Tutte le nostre bevande alla frutta sono preparate fresche al momento con frutta fresca e ingredienti di alta qualità accuratamente selezionati, per offrire un sapore pieno e rinfrescante." },
    EN: { name: "Fruit Drinks", desc: "All Our Fruit Drinks Are Made Fresh To Order With Fresh Fruit And Carefully Selected High-Quality Ingredients, Delivering A Full And Refreshing Flavor" },
    TH: { name: 'เครื่องดื่มผลไม้', desc: "เครื่องดื่มผลไม้ของเราทั้งหมดทำสดใหม่ทุกแก้ว จากผลไม้สดและวัตถุดิบคัดสรรคุณภาพเยี่ยม ให้รสชาติสดชื่นเต็มเปี่ยม" },
    DE: { name: 'Fruchtgetränke', desc: "Alle unsere Fruchtgetränke werden frisch auf Bestellung aus frischen Früchten und sorgfältig ausgewählten, hochwertigen Zutaten zubereitet und bieten einen vollen, erfrischenden Geschmack." },
  },
  'soft-drinks': {
    IT: { name: 'Bibite & Acqua', desc: 'Bibite analcoliche in lattina, acqua minerale naturale e bevande rinfrescanti servite fredde.' },
    EN: { name: 'Soft Drinks & Water', desc: 'Canned soft drinks, natural mineral water, and chilled refreshing beverages.' },
    TH: { name: 'น้ำอัดลมและน้ำดื่ม', desc: 'น้ำอัดลมกระป๋อง น้ำดื่มธรรมชาติ และเครื่องดื่มเพิ่มความสดชื่นเสิร์ฟเย็น' },
    DE: { name: 'Erfrischungsgetränke & Wasser', desc: 'Erfrischungsgetränke in der Dose, natürliches Mineralwasser und gekühlte Getränke.' },
  },
  'beers': {
    IT: { name: 'Birre', desc: 'Le migliori marche di birra servite in bottiglie grandi e piccole ghiacciate.' },
    EN: { name: 'Beers', desc: 'The best Thai and international bottled beers served ice cold.' },
    TH: { name: 'เบียร์', desc: 'เบียร์ไทยและต่างประเทศขวดแก้วยอดนิยม เสิร์ฟเย็นเจี๊ยบชื่นใจ' },
    DE: { name: 'Biere', desc: 'Die besten thailändischen und internationalen Flaschenbiere eiskalt serviert.' },
  },
  'wines': {
    IT: { name: 'Vini', desc: 'Selezione accurata di vini italiani ed internazionali pregiati, ideali da abbinare ai nostri piatti.' },
    EN: { name: 'Wines', desc: 'Carefully curated selection of fine Italian and international wines, perfect to enhance every dish.' },
    TH: { name: 'ไวน์', desc: 'คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นเลิศอย่างพิถีพิถัน เหมาะสำหรับทานคู่กับอาหารทุกจาน' },
    DE: { name: 'Weine', desc: 'Sorgfältig zusammengestellte Auswahl an feinen italienischen und internationalen Weinen.' },
  },
};

export default function CategoryTabs({ categories, activeId, onChange, lang: propLang }: Props) {
  const storeLang = useLanguageStore((s) => s.lang);
  const lang = propLang || storeLang || 'IT';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Exact number of columns to ensure all categories always fit across exactly 2 uniform rows
  const cols = Math.max(1, Math.ceil(categories.length / 2));

  // Engaging intro teaser animation on mobile: scrolls across all categories to show the full variety, then returns smoothly to start
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof window === 'undefined' || window.innerWidth >= 768) return;

    let isUserInteracting = false;
    let animId: number | null = null;
    let timeoutId1: NodeJS.Timeout | null = null;
    let timeoutId2: NodeJS.Timeout | null = null;

    const stopAnimation = () => {
      isUserInteracting = true;
      if (animId) cancelAnimationFrame(animId);
      if (timeoutId1) clearTimeout(timeoutId1);
      if (timeoutId2) clearTimeout(timeoutId2);
    };

    el.addEventListener('touchstart', stopAnimation, { passive: true });
    el.addEventListener('mousedown', stopAnimation, { passive: true });
    el.addEventListener('wheel', stopAnimation, { passive: true });

    const animateScroll = (from: number, to: number, duration: number, easingFn: (t: number) => number, onComplete?: () => void) => {
      const startTime = performance.now();

      const step = (currentTime: number) => {
        if (isUserInteracting) return;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easingFn(progress);

        el.scrollLeft = from + (to - from) * eased;

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        } else if (onComplete && !isUserInteracting) {
          onComplete();
        }
      };

      animId = requestAnimationFrame(step);
    };

    // Gentle ease for reading as categories pass by
    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    // Snappy dynamic ease-out for returning swiftly to start
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    // Trigger after a brief delay so the user sees the page settle
    timeoutId1 = setTimeout(() => {
      if (isUserInteracting || !el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 30) return;

      // 1) Very slow, relaxed and clearly readable scroll across all categories (~5200ms)
      animateScroll(0, maxScroll, 5200, easeInOutSine, () => {
        // 2) Pause briefly at the end to register the last categories
        timeoutId2 = setTimeout(() => {
          if (isUserInteracting || !el) return;
          // 3) Snappy dynamic return to start (~950ms)
          animateScroll(el.scrollLeft, 0, 950, easeOutQuart);
        }, 450);
      });
    }, 600);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (timeoutId1) clearTimeout(timeoutId1);
      if (timeoutId2) clearTimeout(timeoutId2);
      el.removeEventListener('touchstart', stopAnimation);
      el.removeEventListener('mousedown', stopAnimation);
      el.removeEventListener('wheel', stopAnimation);
    };
  }, []);

  return (
    <div className="w-full">
      {/* MOBILE CATEGORY SELECTOR (Pill-shaped slider) */}
      <div
        ref={scrollRef}
        className="flex md:hidden gap-2 overflow-x-auto pb-4 snap-x no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((item) => {
          const isSelected = item.id === activeId;
          const details = categoryDetails[item.id]?.[lang] || { name: item.name, desc: '' };
          const Icon = categoryIcons[item.id] || Pizza;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 border text-xs font-bold whitespace-nowrap snap-align-start cursor-pointer shadow-sm ${
                isSelected
                  ? 'bg-[#8B1E1E] border-[#8B1E1E] text-white shadow-md'
                  : 'bg-stone-50 border-stone-300 text-stone-600 active:bg-stone-100'
              }`}
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
            >
              <Icon className="w-4 h-4" />
              <span className="uppercase">{details.name.replace('\n', ' ')}</span>
            </button>
          );
        })}
      </div>

      {/* DESKTOP CATEGORY SELECTOR (Rectangular cards grid - exactly 2 equal rows) */}
      <div 
        className="hidden md:grid gap-2.5 lg:gap-3 mb-6 w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
        }}
      >
        {categories.map((item) => {
          const isSelected = item.id === activeId;
          const details = categoryDetails[item.id]?.[lang] || { name: item.name, desc: '' };
          const Icon = categoryIcons[item.id] || Pizza;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`w-full h-[98px] sm:h-[104px] lg:h-[108px] flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all duration-200 border text-center group cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-b from-[#8B1E1E] to-[#6d1515] border-[#8B1E1E] text-white shadow-md ring-2 ring-[#8B1E1E]/20 scale-[1.02]'
                  : 'bg-stone-50/90 border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-white hover:text-stone-900 hover:shadow-sm active:scale-[0.98]'
              }`}
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isSelected 
                    ? 'bg-white/15 text-white' 
                    : 'bg-stone-200/70 text-[#8B1E1E] group-hover:bg-[#8B1E1E]/10'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
              </div>
              <div className="flex-1 flex items-center justify-center w-full min-h-[32px] px-0.5 mt-1">
                <span className="text-[10px] sm:text-[10.5px] lg:text-[11px] font-black tracking-wide uppercase leading-tight line-clamp-2 text-balance">
                  {details.name.includes('\n') ? (
                    details.name.split('\n').map((line, idx) => (
                      <span key={idx} className="block">{line}</span>
                    ))
                  ) : (
                    details.name
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
