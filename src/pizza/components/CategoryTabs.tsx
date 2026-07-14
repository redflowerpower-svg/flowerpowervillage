import { useRef } from 'react';
import type { MenuCategory } from '../data/menuData';
import { Pizza, Salad, UtensilsCrossed, Cake, Coffee, Beer, Wine, Sandwich } from 'lucide-react';

interface Props {
  categories: MenuCategory[];
  activeId: string;
  onChange: (id: string) => void;
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'traditional-italian-pizza': Pizza,
  'pasta': UtensilsCrossed,
  'italian-salads': Salad,
  'pizza-sandwich': Sandwich,
  'pizza-burgers': UtensilsCrossed,
  'french-fries': UtensilsCrossed,
  'desserts': Cake,
  'breakfast-and-snacks': UtensilsCrossed,
  'coffee-shop': Coffee,
  'fruit-drinks': Coffee,
  'soft-drinks': Coffee,
  'beers-and-wines': Beer,
};

const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = {
  'traditional-italian-pizza': {
    IT: { name: 'Pizze Classiche', desc: 'Impasto a fermentazione naturale' },
    EN: { name: 'Classic Pizzas', desc: 'Slow-fermented Italian dough' },
    TH: { name: 'พิซซ่าคลาสสิค', desc: 'แป้งหมักธรรมชาติสูตรดั้งเดิม' },
    DE: { name: 'Klassische Pizzas', desc: 'Natursauerteig-Pizzaboden' },
  },
  'pasta': {
    IT: { name: 'Pasta', desc: 'Primi piatti della tradizione' },
    EN: { name: 'Pasta Dishes', desc: 'Traditional Italian pasta' },
    TH: { name: 'พาสต้า', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิม' },
    DE: { name: 'Pasta', desc: 'Traditionelle italienische Pasta' },
  },
  'italian-salads': {
    IT: { name: 'Insalate Italiane', desc: 'Verdure fresche e ingredienti sani' },
    EN: { name: 'Italian Salads', desc: 'Fresh salads with olive oil' },
    TH: { name: 'สลัดอิตาเลียน', desc: 'ผักสดและน้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิน' },
    DE: { name: 'Italienische Salate', desc: 'Frische Salate mit Olivenöl' },
  },
  'pizza-sandwich': {
    IT: { name: 'Pizza Sandwich', desc: 'Pane appena sfornato farcito' },
    EN: { name: 'Pizza Sandwich', desc: 'Freshly baked sandwich' },
    TH: { name: 'พิตซ่าแซนด์วิช', desc: 'อบใหม่ร้อนๆ ไส้แน่น' },
    DE: { name: 'Pizza Sandwich', desc: 'Frisch gebackenes Sandwich' },
  },
  'pizza-burgers': {
    IT: { name: 'Pizza Burger', desc: 'Hamburger in stile italiano' },
    EN: { name: 'Pizza Burgers', desc: 'Italian-style burgers' },
    TH: { name: 'พิซซ่าเบอร์เกอร์', desc: 'เบอร์เกอร์โฮมเมดสไตล์อิตาเลียน' },
    DE: { name: 'Pizza Burger', desc: 'Burger nach italienischer Art' },
  },
  'french-fries': {
    IT: { name: 'Patatine Fritte', desc: 'Dorate e croccanti' },
    EN: { name: 'French Fries', desc: 'Crispy and golden' },
    TH: { name: 'มันฝรั่งทอด', desc: 'เฟรนช์ฟรายส์ทอดสดใหม่' },
    DE: { name: 'Pommes Frites', desc: 'Knusprig und goldbraun' },
  },
  'desserts': {
    IT: { name: 'Dolci', desc: 'Tiramisù e dessert artigianali' },
    EN: { name: 'Desserts', desc: 'Tiramisù and homemade desserts' },
    TH: { name: 'ของหวาน', desc: 'ทิรามิสุและขนมหวานโฮมเมด' },
    DE: { name: 'Desserts', desc: 'Tiramisù und hausgemachte Desserts' },
  },
  'breakfast-and-snacks': {
    IT: { name: 'Colazione & Snack', desc: 'Per iniziare la giornata' },
    EN: { name: 'Breakfast & Snacks', desc: 'To start your day' },
    TH: { name: 'อาหารเช้าและของว่าง', desc: 'เริ่มต้นวันใหม่ด้วยพลังงาน' },
    DE: { name: 'Frühstück & Snacks', desc: 'Für einen guten Start in den Tag' },
  },
  'coffee-shop': {
    IT: { name: 'Caffetteria', desc: 'Caffè espresso italiano' },
    EN: { name: 'Coffee Shop', desc: 'Italian espresso coffee' },
    TH: { name: 'ร้านกาแฟ', desc: 'เอสเพรสโซ่อิตาเลียนแท้' },
    DE: { name: 'Kaffeeshop', desc: 'Italienischer Espresso' },
  },
  'fruit-drinks': {
    IT: { name: 'Bevande alla Frutta', desc: 'Frullati e shake freschi' },
    EN: { name: 'Fruit Drinks', desc: 'Fresh fruit shakes' },
    TH: { name: 'เครื่องดื่มผลไม้', desc: 'ผลไม้สดปั่นสดใหม่' },
    DE: { name: 'Fruchtgetränke', desc: 'Frische Frucht-Shakes' },
  },
  'soft-drinks': {
    IT: { name: 'Bibite', desc: 'Bibite rinfrescanti' },
    EN: { name: 'Soft Drinks', desc: 'Refreshing drinks' },
    TH: { name: 'น้ำอัดลม', desc: 'เครื่องดื่มไร้แอลกอฮอล์' },
    DE: { name: 'Alkoholfreie Getränke', desc: 'Erfrischungsgetränke' },
  },
  'beers-and-wines': {
    IT: { name: 'Birre & Vini', desc: 'Birre fresche e selezione di vini italiani' },
    EN: { name: 'Beers & Wines', desc: 'Chilled beers and Italian wine selection' },
    TH: { name: 'เบียร์และไวน์', desc: 'เบียร์เย็นๆ และไวน์อิตาเลียนคัดสรร' },
    DE: { name: 'Biere & Weine', desc: 'Gekühlte Biere und ausgewählte italienische Weine' },
  },
};

export default function CategoryTabs({ categories, activeId, onChange, lang }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
                  ? 'bg-[#8B1E1E] border-[#8B1E1E] text-white'
                  : 'bg-stone-50 border-stone-300 text-stone-600 active:bg-stone-100'
              }`}
              style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
            >
              <Icon className="w-4 h-4" />
              <span className="uppercase">{details.name}</span>
            </button>
          );
        })}
      </div>

      {/* DESKTOP CATEGORY SELECTOR (Rectangular cards grid) */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 gap-4 mb-4">
        {categories.map((item) => {
          const isSelected = item.id === activeId;
          const details = categoryDetails[item.id]?.[lang] || { name: item.name, desc: '' };
          const Icon = categoryIcons[item.id] || Pizza;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 border text-center group cursor-pointer ${
                isSelected
                  ? 'bg-[#8B1E1E] border-[#8B1E1E] text-white shadow-md'
                  : 'bg-stone-50 border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-100/50'
              }`}
              style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
            >
              <div
                className={`p-3 rounded-xl mb-3 transition-colors ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-stone-200/50 text-[#8B1E1E] group-hover:bg-stone-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase">
                {details.name}
              </span>
              <span
                className={`text-[10px] mt-1 font-light ${
                  isSelected ? 'text-stone-200' : 'text-stone-400'
                }`}
              >
                {details.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
