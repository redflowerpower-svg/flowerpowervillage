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
    MM: { name: 'နေ့စဉ် အထူးဟင်းလျာများ', desc: 'အီတလီစားဖိုမှူးမှ လတ်ဆတ်သော ရာသီပေါ် ကုန်ကြမ်းများဖြင့် နေ့စဉ် သီးသန့် ဖန်တီးထားသော အထူးဟင်းလျာများ။' },
  },
  'traditional-italian-pizza': {
    IT: { name: 'Pizze Classiche', desc: "La pizza è il cuore del nostro locale. Utilizziamo solo ingredienti italiani selezionati di prima qualità: dalla farina al pomodoro, dai formaggi ai salumi, senza scendere a compromessi. La nostra pizza tradizionale ad alta idratazione è realizzata con un impasto al 90% d'acqua, fatto maturare lentamente per almeno 36 ore. Il результат è una pizza croccante, leggera, altamente digeribile e ricca di sapore." },
    EN: { name: "Traditional Italian Pizza", desc: "Pizza Is The Heart Of Our Restaurant. We Use Only Selected Italian Ingredients, From Flour To Tomato, From Cheeses To Cold Cuts, With No Compromise On Quality. Our Traditional High-Hydration Italian Pizza Is Made With A 90% Water Dough, Slowly Matured For At Least 36 Hours. The Result Is A Crispy, Light, Highly Digestible Pizza, Full Of Flavor." },
    TH: { name: 'พิซซ่าคลาสสิค', desc: "พิซซ่าคือหัวใจของร้านอาหารของเรา เราใช้เฉพาะวัตถุดิบอิตาเลียนที่คัดสรรมาอย่างดี ตั้งแต่แป้ง มะเขือเทศ ชีส ไปจนถึงโคลด์คัต โดยไม่ประนีประนอมด้านคุณภาพ พิซซ่าอิตาเลียนแบบดั้งเดิมของเราเป็นแป้งไฮเดรชันสูง ผสมน้ำถึง 90% และหมักอย่างช้าๆ อย่างน้อย 36 ชั่วโมง ผลลัพธ์คือพิซซ่าที่กรอบ เบา ย่อยง่าย และเต็มไปด้วยรสชาติ" },
    DE: { name: 'Klassische Pizzas', desc: "Die Pizza ist das Herzstück unseres Restaurants. Wir verwenden ausschließlich ausgewählte italienische Zutaten bester Qualität: vom Mehl bis zu den Tomaten, vom Käse bis zum Aufschnitt, ohne Kompromisse. Unsere traditionelle italienische Pizza mit hohem Feuchtigkeitsgehalt wird aus einem Teig mit 90 % Wasseranteil hergestellt, der mindestens 36 Stunden lang langsam reift. Das Ergebnis ist eine knusprige, leichte, besonders bekömmliche und geschmacksintensive Pizza." },
    MM: { name: 'ရိုးရာ အီတလီ ပီဇာ', desc: "ကျွန်ုပ်တို့၏ အဓိက နှလုံးသည် ပီဇာဖြစ်ပါသည်။ အီတလီမှ တင်သွင်းသော ပရီမီယံ ကုန်ကြမ်းများကိုသာ အသုံးပြုထားပြီး ၃၆ နာရီကြာ သဘာဝနည်းဖြင့် အချဉ်ဖောက်ထားသောကြောင့် ကြွပ်ဆတ်၊ ပေါ့ပါးပြီး အစာကြေလွယ်ကာ အရသာအလွန်ပြည့်စုံပါသည်။" },
  },
  'pasta': {
    IT: { name: 'Pasta', desc: 'Primi piatti della tradizione' },
    EN: { name: 'Pasta Dishes', desc: 'Traditional Italian pasta' },
    TH: { name: 'พาสต้า', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิม' },
    DE: { name: 'Pasta', desc: 'Traditionelle italienische Pasta' },
    MM: { name: 'ခေါက်ဆွဲ', desc: 'ရိုးရာ အီတလီ ခေါက်ဆွဲ ဟင်းလျာများ' },
  },
  'italian-salads': {
    IT: { name: "Insalate Italiane", desc: "Insalate in stile italiano con verdure fresche e ingredienti sani e di alta qualità. Servite con gustose salse fatte in casa e olio extravergine d'oliva: fresche, deliziose e salutari." },
    EN: { name: "Italian Salads", desc: "Italian-style salads with fresh vegetables and healthy, high-quality ingredients. Served with tasty homemade sauces, extra virgin olive oil: fresh, delicious, and healthy." },
    TH: { name: 'สลัดสไตล์อิตาเลียน', desc: "สลัดสไตล์อิตาเลียน ผักสดกรอบ วัตถุดิบคุณภาพดีต่อสุขภาพ เสิร์ฟพร้อมน้ำสลัดโฮมเมดสูตรพิเศษและน้ำมันมะกอกบริสุทธิ์ สด อร่อย และมีประโยชน์" },
    DE: { name: 'Italienische Salate', desc: "Salate nach italienischer Art mit frischem Gemüse und gesunden, hochwertigen Zutaten. Serviert mit leckeren hausgemachten Dressings und nativem Olivenöl extra: frisch, lecker und gesund." },
    MM: { name: 'အီတလီ စာလတ်', desc: "လတ်ဆတ်သော ဟင်းသီးဟင်းရွက်များနှင့် အထူးသံလွင်ဆီတို့ဖြင့် ပြုလုပ်ထားသော ကျန်းမာရေးနှင့်ညီညွတ်သည့် အီတလီစတိုင် စာလတ်များ။" },
  },
  'pizza-sandwich': {
    IT: { name: "Focaccia\nPizza Sandwich", desc: "La focaccia è un delizioso pane tradizionale italiano originario di Genova. Farciscila con i tuoi ingredienti preferiti e crea il tuo panino personalizzato." },
    EN: { name: "Focaccia\nPizza Sandwich", desc: "Focaccia is a delicious traditional Italian bread originating from Genoa. Stuff it with your favorite ingredients and build your own custom sandwich." },
    TH: { name: 'ฟอกาเซีย\nพิซซ่าแซนด์วิช', desc: "ฟอกาเซียคือขนมปังดั้งเดิมของอิตาลีจากเมืองเจนัว นำมาสอดไส้วัตถุดิบที่คุณชื่นชอบเพื่อสร้างแซนด์วิชในแบบของคุณเอง" },
    DE: { name: "Focaccia\nPizza Sandwich", desc: "Focaccia ist ein köstliches traditionelles italienisches Brot aus Genua. Belege es mit deinen Lieblingszutaten und erstelle dein individuelles Sandwich." },
    MM: { name: 'ဖိုကာချာ\nပီဇာ ဆန်းဒဝစ်', desc: "ဂျီနိုဗာ ရိုးရာ မီးဖုတ် ဖိုကာချာ မုန့်သားဖြင့် အလယ်တွင် အသား၊ ချိစ်နှင့် ဟင်းသီးဟင်းရွက်များ ညှပ်ထားသော ဆန်းဒဝစ်။" },
  },
  'pizza-burgers': {
    IT: { name: "Pizza Burger", desc: "Preparati con pane per hamburger appena sfornato e hamburger fatti in casa in stile italiano, serviti con patatine fritte, ketchup e maionese: freschi, gustosi e soddisfacenti." },
    EN: { name: "Pizza Burger", desc: "Made with freshly baked burger buns and homemade Italian-style patties, served with french fries, ketchup, and mayonnaise: fresh, tasty, and satisfying." },
    TH: { name: 'พิซซ่าเบอร์เกอร์', desc: "ทำจากขนมปังเบอร์เกอร์อบสดใหม่และเนื้อเบอร์เกอร์โฮมเมดสไตล์อิตาเลียน เสิร์ฟพร้อมเฟรนช์ฟรายส์ ซอสมะเขือเทศ และมายองเนส สด อร่อย และอิ่มคุ้ม" },
    DE: { name: "Pizza Burger", desc: "Hergestellt mit frisch gebackenen Burgerbrötchen und hausgemachten Patties nach italienischer Art, serviert mit Pommes frites, Ketchup und Mayonnaise: frisch, lecker und sättigend." },
    MM: { name: 'ပီဇာ ဘာဂါ', desc: "အသစ်ဖုတ်ထားသော ပီဇာမုန့်သားဖြင့် ပြုလုပ်ထားသည့် အိမ်လုပ် ဘာဂါနှင့် အာလူးကြော်။" },
  },
  'french-fries': {
    IT: { name: "Fritti & Sfizi", desc: "Patatine fritte dorate e croccanti, anelli di cipolla e snack sfiziosi." },
    EN: { name: "French Fries & Snacks", desc: "Golden and crispy french fries, onion rings, and delicious finger food." },
    TH: { name: 'เฟรนช์ฟรายส์และของทานเล่น', desc: "เฟรนช์ฟรายส์สีทองกรอบอร่อย หอมทอด และของทานเล่นรสเลิศ" },
    DE: { name: "Pommes & Snacks", desc: "Goldgelbe, knusprige Pommes frites, Zwiebelringe und köstliches Fingerfood." },
    MM: { name: 'အာလူးကြော်နှင့် အမြည်းများ', desc: "ရွှေဝါရောင် ကြွပ်ကြွပ်ရွ အာလူးကြော်နှင့် ကြက်သွန်ကွင်းကြော်များ။" },
  },
  'desserts': {
    IT: { name: "Dolci & Dessert", desc: "Tiramisù artigianale fatto in casa, cheesecake, torte del giorno e deliziosi dessert italiani." },
    EN: { name: "Desserts & Sweets", desc: "Homemade artisan tiramisu, cheesecakes, cakes of the day, and delicious Italian desserts." },
    TH: { name: 'ของหวานและเค้ก', desc: "ทีรามิสุโฮมเมดสไตล์อิตาเลียนแท้ ชีสเค้ก เค้กประจำวัน และของหวานแสนอร่อย" },
    DE: { name: "Desserts & Süßes", desc: "Hausgemachtes Tiramisu, Cheesecake, Tageskuchen und köstliche italienische Desserts." },
    MM: { name: 'အချိုပွဲနှင့် ဒက်ဆာ့တ်', desc: "နာမည်ကြီး တီရာမီဆု၊ အိမ်လုပ်ကိတ်များနှင့် ကော်ဖီ အက်ဖိုဂါတို။" },
  },
  'breakfast-and-snacks': {
    IT: { name: "Colazione & Toast", desc: "Colazioni nutrienti, toast caldi, uova preparate al momento e macedonia di frutta fresca." },
    EN: { name: "Breakfast & Toast", desc: "Hearty breakfasts, warm toasts, freshly made eggs, and fresh tropical fruit bowls." },
    TH: { name: 'อาหารเช้าและโทสต์', desc: "อาหารเช้าเพื่อสุขภาพ โทสต์ร้อนๆ ไข่ดาว/ออมเล็ตปรุงสดใหม่ และผลไม้รวมสด" },
    DE: { name: "Frühstück & Toast", desc: "Herzhaftes Frühstück, warme Toasts, frisch zubereitete Eierspeisen und frischer Obstsalat." },
    MM: { name: 'နံနက်စာနှင့် သရေစာ', desc: "ပေါင်မုန့်မီးကင်၊ ကြက်ဥကြော်နှင့် လတ်ဆတ်သော သစ်သီးစုံ။" },
  },
  'coffee-shop': {
    IT: { name: "Caffetteria & Tè", desc: "Autentico espresso italiano, cappuccino cremoso, caffè freddi e selezione di tè pregiati." },
    EN: { name: "Coffee & Tea", desc: "Authentic Italian espresso, creamy cappuccino, iced coffees, and fine tea selections." },
    TH: { name: 'กาแฟและชา', desc: "เอสเพรสโซ่อิตาเลียนแท้ คาปูชิโน่ฟองนุ่ม กาแฟเย็น และชาคุณภาพคัดสรร" },
    DE: { name: "Kaffee & Tee", desc: "Authentischer italienischer Espresso, cremiger Cappuccino, Eiskaffee und erlesene Teesorten." },
    MM: { name: 'ကော်ဖီဆိုင်', desc: "စစ်မှန်သော အီတလီ အက်စ်ပရက်ဆို၊ ခရင်မ်ဆန်သော ကာပူချီနိုနှင့် လက်ဖက်ရည်များ။" },
  },
  'fruit-drinks': {
    IT: { name: "Frullati & Smoothie", desc: "Frutta tropicale fresca frullata al momento, smoothie energetici e shake rinfrescanti." },
    EN: { name: "Fruit Shakes & Smoothies", desc: "Fresh tropical fruit blended on the spot, energizing smoothies, and refreshing shakes." },
    TH: { name: 'น้ำผลไม้ปั่นและสมูทตี้', desc: "ผลไม้เมืองร้อนสดใหม่ปั่นสดๆ สมูทตี้เพิ่มพลัง และเครื่องดื่มปั่นเย็นชื่นใจ" },
    DE: { name: "Frucht-Shakes & Smoothies", desc: "Frische tropische Früchte frisch gemixt, energiereiche Smoothies und erfrischende Shakes." },
    MM: { name: 'သစ်သီးဖျော်ရည်များ', desc: "လတ်ဆတ်သော ရာသီပေါ် သစ်သီးဖျော်ရည်များနှင့် စမုသီများ။" },
  },
  'soft-drinks': {
    IT: { name: "Bibite & Acqua", desc: "Bibite rinfrescanti in lattina, acqua minerale naturale e soda servite fredde." },
    EN: { name: "Soft Drinks & Water", desc: "Chilled canned soft drinks, natural mineral water, and sparkling soda." },
    TH: { name: 'น้ำอัดลมและน้ำดื่ม', desc: "น้ำอัดลมกระป๋องแช่เย็น น้ำแร่ธรรมชาติ และโซดาเย็นสดชื่น" },
    DE: { name: "Erfrischungsgetränke & Wasser", desc: "Gekühlte Softdrinks in der Dose, natürliches Mineralwasser und spritziges Soda." },
    MM: { name: 'အအေးနှင့် သောက်ရေသန့်', desc: "ဗူးသွပ်အအေးများ၊ သဘာဝတွင်းထွက်ရေနှင့် အေးမြလန်းဆန်းစေသော သောက်စရာများ။" },
  },
  'beers': {
    IT: { name: "Birre Fresche", desc: "Le migliori marche di birra in bottiglia grande e piccola, servite ghiacciate." },
    EN: { name: "Chilled Beers", desc: "Top Thai and international bottled beers served ice cold." },
    TH: { name: 'เบียร์เย็นฉ่ำ', desc: "เบียร์ไทยและต่างประเทศชั้นนำ เสิร์ฟเย็นเจี๊ยบทั้งขวดใหญ่และขวดเล็ก" },
    DE: { name: "Gekühlte Biere", desc: "Beste thailändische und internationale Flaschenbiere eiskalt serviert." },
    MM: { name: 'ဘီယာများ', desc: "အကောင်းဆုံး ထိုင်းနှင့် နိုင်ငံတကာ ဘီယာပုလင်း အေးအေးများ။" },
  },
  'wines': {
    IT: { name: "Carta dei Vini Pregiati", desc: "Selezione esclusiva di vini italiani e internazionali, perfetti per esaltare ogni piatto." },
    EN: { name: "Fine Wine List", desc: "Exclusive selection of Italian and international wines, perfectly paired with our menu." },
    TH: { name: 'ไวน์ชั้นเลิศ', desc: "คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นยอด เพื่อเติมเต็มรสชาติอาหารมื้อพิเศษของคุณ" },
    DE: { name: "Erlesene Weinkarte", desc: "Exklusive Auswahl an italienischen und internationalen Weinen, perfekt abgestimmt auf jedes Gericht." },
    MM: { name: 'ဝိုင်များ', desc: "ကျွန်ုပ်တို့၏ ဟင်းလျာ အရသာတိုင်းကို ပိုမိုပြည့်စုံစေရန် ဂရုတစိုက် ရွေးချယ်ထားသော အီတလီနှင့် နိုင်ငံတကာ ဝိုင်ကောင်းများ။" },
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
