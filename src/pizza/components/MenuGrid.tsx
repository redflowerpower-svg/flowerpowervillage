import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { MenuItem } from '../data/menuData';
import ProductModal from './ProductModal';

interface Props {
  items: MenuItem[];
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

const labels = {
  IT: {
    sizeOptions: 'Opzioni taglia',
    extraIngredients: 'ingredienti extra',
  },
  EN: {
    sizeOptions: 'Size options',
    extraIngredients: 'extra ingredients',
  },
  TH: {
    sizeOptions: 'ตัวเลือกขนาด',
    extraIngredients: 'เครื่องปรุงเพิ่มเติม',
  },
  DE: {
    sizeOptions: 'Größenoptionen',
    extraIngredients: 'Zusatzzutaten',
  },
};

export default function MenuGrid({ items, lang }: Props) {
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const t = labels[lang];

  const getTranslatedName = (item: MenuItem) => {
    if (lang === 'TH' && item.nameTh) return item.nameTh;
    return item.name;
  };

  const getTranslatedDesc = (item: MenuItem) => {
    if (lang === 'TH' && item.descriptionTh) return item.descriptionTh;
    return item.description;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="group bg-white border border-stone-300 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer will-change-transform"
            onClick={() => setSelected(item)}
          >
            {/* IMAGE CONTAINER WITH HOVER OVERLAY */}
            <div className="relative h-48 bg-stone-100 overflow-hidden flex-shrink-0 rounded-t-[2rem]">
              <img
                src={item.image}
                alt={getTranslatedName(item)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[1px]"
              >
                <div className="p-3.5 bg-stone-900/90 rounded-full border border-stone-700 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Plus size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-stone-850 font-black tracking-tight text-base leading-snug" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem' }}>
                    {getTranslatedName(item)}
                  </h4>
                </div>
                <span className="text-[#8B1E1E] font-extrabold text-base mt-0.5 whitespace-nowrap">{item.price} ฿</span>
              </div>

              <p className="text-stone-500 text-xs leading-relaxed line-clamp-3 mt-1 flex-1">{getTranslatedDesc(item)}</p>

              {/* Extras indicators / options */}
              {(item.extras?.length || item.variants?.length) ? (
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E]/60 flex-shrink-0" />
                  <span>
                    {item.variants?.length ? `${t.sizeOptions} · ` : ''}
                    {item.extras?.length ? `${item.extras.length} ${t.extraIngredients}` : ''}
                  </span>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {selected && <ProductModal item={selected} onClose={() => setSelected(null)} lang={lang} />}
    </>
  );
}
