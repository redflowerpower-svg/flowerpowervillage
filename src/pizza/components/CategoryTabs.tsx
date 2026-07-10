import { useRef } from 'react';
import type { MenuCategory } from '../data/menuData';
import { Pizza, Salad, UtensilsCrossed, Cake, Coffee } from 'lucide-react';

interface Props {
  categories: MenuCategory[];
  activeId: string;
  onChange: (id: string) => void;
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'pizze-classiche': Pizza,
  'antipasti': Salad,
  'pasta': UtensilsCrossed,
  'dolci': Cake,
  'bevande': Coffee,
};

const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = {
  'pizze-classiche': {
    IT: { name: 'Pizze Classiche', desc: 'Impasto a fermentazione naturale' },
    EN: { name: 'Classic Pizzas', desc: 'Slow-fermented Italian dough' },
    TH: { name: 'พิซซ่าคลาสสิค', desc: 'แป้งหมักธรรมชาติสูตรดั้งเดิม' },
    DE: { name: 'Klassische Pizzas', desc: 'Natursauerteig-Pizzaboden' },
  },
  'antipasti': {
    IT: { name: 'Antipasti', desc: 'Bruschette e taglieri misti' },
    EN: { name: 'Starters', desc: 'Bruschetta and mixed platters' },
    TH: { name: 'อาหารเรียกน้ำย่อย', desc: 'บรูสเก็ตต้าและถาดรวมชีส' },
    DE: { name: 'Vorspeisen', desc: 'Bruschetta und Aufschnittteller' },
  },
  'pasta': {
    IT: { name: 'Pasta', desc: 'Primi piatti della tradizione' },
    EN: { name: 'Pasta Dishes', desc: 'Traditional Italian pasta' },
    TH: { name: 'พาสต้า', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิม' },
    DE: { name: 'Pasta', desc: 'Traditionelle italienische Pasta' },
  },
  'dolci': {
    IT: { name: 'Dolci', desc: 'Tiramisù e dessert artigianali' },
    EN: { name: 'Desserts', desc: 'Tiramisù and homemade desserts' },
    TH: { name: 'ของหวาน', desc: 'ทิรามิสุและขนมหวานโฮมเมด' },
    DE: { name: 'Desserts', desc: 'Tiramisù und hausgemachte Desserts' },
  },
  'bevande': {
    IT: { name: 'Bevande', desc: 'Bibite e shake rinfrescanti' },
    EN: { name: 'Drinks & Beverages', desc: 'Soft drinks and fresh shakes' },
    TH: { name: 'เครื่องดื่ม', desc: 'เครื่องดื่มและมิลค์เชคผลไม้สด' },
    DE: { name: 'Getränke', desc: 'Softdrinks und frische Shakes' },
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
      <div className="hidden md:grid md:grid-cols-5 gap-4 mb-4">
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
