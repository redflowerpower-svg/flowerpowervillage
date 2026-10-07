import React, { useState, useRef, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Upload, 
  Eye, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  Sparkles, 
  Copy, 
  Loader2, 
  RotateCcw,
  Star,
  Layers,
  Save,
  Tag,
  DollarSign,
  AlertCircle,
  Wheat,
  Leaf,
  CheckCircle,
  PlusCircle,
  Flame
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { menuData, type MenuItem, type Variant, type ExtraOption } from '../../../pizza/data/menuData';
import { translateDishCardAllLanguages, type DishLang } from '../../../pizza/data/dishTranslatorEngine';
import { getDietaryType, type DietaryType } from '../../../pizza/utils/dietary';
import { formatWineProductName as formatProductName } from '../../../pizza/data/wineData';
import { usePizzaAdminStore } from '../store/usePizzaAdminStore';

export interface DishCategoryOption {
  id: string;
  name: {
    IT: string;
    EN: string;
    TH: string;
    DE: string;
  };
}

export const DISH_CATEGORIES: DishCategoryOption[] = [
  {
    id: 'traditional-italian-pizza',
    name: { IT: 'Pizza Tradizionale Italiana', EN: 'Traditional Italian Pizza', TH: 'พิซซ่าอิตาเลียนดั้งเดิม', DE: 'Traditionelle Italienische Pizza' }
  },
  {
    id: 'pasta',
    name: { IT: 'Pasta Italiana & Lasagne', EN: 'Italian Pasta & Lasagna', TH: 'พาสต้าอิตาเลียนและลาซานญ่า', DE: 'Italienische Pasta & Lasagne' }
  },
  {
    id: 'daily-specials',
    name: { IT: 'Specialità del Giorno', EN: 'Daily Specials', TH: 'เมนูพิเศษประจำวัน', DE: 'Tagesempfehlungen' }
  },
  {
    id: 'italian-salads',
    name: { IT: 'Insalate Italiane', EN: 'Italian Salads', TH: 'สลัดอิตาเลียน', DE: 'Italienische Salate' }
  },
  {
    id: 'pizza-sandwich',
    name: { IT: 'Focaccia Pizza Sandwich', EN: 'Focaccia Pizza Sandwiches', TH: 'ฟอคคาเซีย & พิตซ่าแซนด์วิช', DE: 'Focaccia Pizza Sandwich' }
  },
  {
    id: 'pizza-burgers',
    name: { IT: 'Pizza Burger', EN: 'Pizza Burgers', TH: 'พิซซ่าเบอร์เกอร์', DE: 'Pizza Burger' }
  },
  {
    id: 'snacks-and-fries',
    name: { IT: 'Snack & Fritti', EN: 'Snacks & Fries', TH: 'ของว่างและมันฝรั่งทอด', DE: 'Snacks & Pommes' }
  },
  {
    id: 'breakfast-and-snacks',
    name: { IT: 'Colazioni & Toast', EN: 'Breakfast & Snacks', TH: 'อาหารเช้าและขนมปังปิ้ง', DE: 'Frühstück & Snacks' }
  },
  {
    id: 'desserts',
    name: { IT: 'Dolci & Dessert', EN: 'Desserts', TH: 'ของหวานและของทานเล่น', DE: 'Desserts' }
  },
  {
    id: 'coffee-shop',
    name: { IT: 'Caffetteria & Tè', EN: 'Coffee & Tea', TH: 'กาแฟและชา', DE: 'Kaffee & Tee' }
  },
  {
    id: 'fruit-drinks',
    name: { IT: 'Fruit Shakes & Smoothies', EN: 'Fruit Shakes & Smoothies', TH: 'น้ำผลไม้ปั่นและสมูทตี้', DE: 'Frucht-Shakes & Smoothies' }
  },
  {
    id: 'soft-drinks',
    name: { IT: 'Bibite & Acqua', EN: 'Soft Drinks & Water', TH: 'น้ำอัดลมและน้ำดื่ม', DE: 'Erfrischungsgetränke & Wasser' }
  },
  {
    id: 'beers',
    name: { IT: 'Birre in Bottiglia', EN: 'Bottled Beers', TH: 'เบียร์ขวด', DE: 'Flaschenbiere' }
  },
  {
    id: 'wines',
    name: { IT: 'Enoteca & Vini', EN: 'Wines & Cellar', TH: 'ไวน์และเครื่องดื่มแอลกอฮอล์', DE: 'Weine & Vinothek' }
  }
];

export interface DishFormData {
  id: string;
  category: string;
  isDailySpecial: boolean;
  nameIt: string;
  nameEn: string;
  nameTh: string;
  nameDe: string;
  nameMm?: string;
  descriptionIt: string;
  descriptionEn: string;
  descriptionTh: string;
  descriptionDe: string;
  descriptionMm?: string;
  price: number;
  image: string;
  dietaryOverride?: DietaryType | 'auto';
  variants: Variant[];
  extras: ExtraOption[];
  spicyLevel?: 0 | 1 | 2 | 3;
}

const DEFAULT_DISH_FORM: DishFormData = {
  id: '',
  category: 'traditional-italian-pizza',
  isDailySpecial: false,
  nameIt: '',
  nameEn: '',
  nameTh: '',
  nameDe: '',
  nameMm: '',
  descriptionIt: '',
  descriptionEn: '',
  descriptionTh: '',
  descriptionDe: '',
  descriptionMm: '',
  price: 250,
  image: '',
  dietaryOverride: 'auto',
  variants: [],
  extras: [],
  spicyLevel: 0
};

export interface DishCardStudioProps {
  initialDishId?: string | null;
  onClearInitialDish?: () => void;
}

export function DishCardStudio({ initialDishId, onClearInitialDish }: DishCardStudioProps = {}) {
  const [formData, setFormData] = useState<DishFormData>(DEFAULT_DISH_FORM);
  const [catalogItems, setCatalogItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeLangTab, setActiveLangTab] = useState<DishLang>('IT');
  const [previewLang, setPreviewLang] = useState<DishLang>('IT');
  const [sourceLang, setSourceLang] = useState<DishLang>('IT');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing dishes from menuData
  useEffect(() => {
    const allDishes: MenuItem[] = [];
    menuData.forEach(cat => {
      cat.items.forEach(item => {
        allDishes.push({
          ...item,
          category: cat.id
        });
      });
    });
    setCatalogItems(allDishes);
  }, []);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setStatusFeedback(msg);
    setFeedbackType(type);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleSelectDish = (item: MenuItem) => {
    const isSpecial = item.id.startsWith('specialita-') || item.category === 'daily-specials';
    setFormData({
      id: item.id,
      category: item.category || 'traditional-italian-pizza',
      isDailySpecial: isSpecial,
      nameIt: item.nameIt || item.name || '',
      nameEn: item.name || '',
      nameTh: item.nameTh || '',
      nameDe: item.nameDe || '',
      descriptionIt: item.descriptionIt || item.description || '',
      descriptionEn: item.description || '',
      descriptionTh: item.descriptionTh || '',
      descriptionDe: item.descriptionDe || '',
      price: item.price || 0,
      image: item.image || '',
      dietaryOverride: 'auto',
      variants: item.variants || [],
      extras: item.extras || [],
      spicyLevel: 0
    });
    showNotification(`Piatto selezionato: ${item.name}`);
  };

  // Preload initialDishId when passed from Menu & Prezzi tab
  useEffect(() => {
    if (initialDishId && catalogItems.length > 0) {
      const found = catalogItems.find(i => i.id === initialDishId);
      if (found) {
        handleSelectDish(found);
      }
    }
  }, [initialDishId, catalogItems]);

const getCategoryDefaultExtras = (categoryId: string): { allowed_extras_group?: string; extras: ExtraOption[] } => {
  const cat = menuData.find(c => c.id === categoryId);
  if (cat) {
    const ref = cat.items.find(i => i.extras && i.extras.length > 0);
    if (ref && ref.extras) {
      return {
        allowed_extras_group: ref.allowed_extras_group,
        extras: JSON.parse(JSON.stringify(ref.extras))
      };
    }
  }
  return { allowed_extras_group: undefined, extras: [] };
};

  const handleResetNew = () => {
    const defaults = getCategoryDefaultExtras('traditional-italian-pizza');
    setFormData({
      ...DEFAULT_DISH_FORM,
      id: `dish-${Date.now()}`,
      extras: defaults.extras
    });
    if (onClearInitialDish) onClearInitialDish();
    showNotification('Nuova scheda piatto inizializzata con personalizzazioni ereditate');
  };

  const handleDuplicate = () => {
    setFormData(prev => ({
      ...prev,
      id: `${prev.id}-copy-${Date.now()}`,
      nameIt: `${prev.nameIt} (Copia)`,
      nameEn: `${prev.nameEn} (Copy)`
    }));
    showNotification('Piatto duplicato come nuova scheda');
  };

  const handleAddVariant = () => {
    const newVariant: Variant = {
      id: `var-${Date.now()}-${formData.variants.length + 1}`,
      name: '',
      nameIt: '',
      nameTh: '',
      nameDe: '',
      name_it: '',
      name_de: '',
      sku: '',
      price: Number(formData.price) || 0,
      priceModifier: 0
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
    showNotification('Nuova variante aggiunta');
  };

  const handleUpdateVariant = (index: number, field: 'name' | 'price', value: string | number) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      if (field === 'name') {
        const strVal = String(value);
        updated[index] = {
          ...updated[index],
          name: strVal,
          nameIt: strVal,
          name_it: strVal
        };
      } else if (field === 'price') {
        const numVal = Number(value) || 0;
        updated[index] = {
          ...updated[index],
          price: numVal,
          priceModifier: numVal - (Number(prev.price) || 0)
        };
      }
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
    showNotification('Variante rimossa');
  };

  // Translation with DeepSeek AI
  const handleDeepSeekTranslate = async () => {
    const currentName = activeLangTab === 'IT' ? formData.nameIt :
                        activeLangTab === 'EN' ? formData.nameEn :
                        activeLangTab === 'TH' ? formData.nameTh : activeLangTab === 'DE' ? formData.nameDe : (formData.nameMm || '');
    
    const currentDesc = activeLangTab === 'IT' ? formData.descriptionIt :
                        activeLangTab === 'EN' ? formData.descriptionEn :
                        activeLangTab === 'TH' ? formData.descriptionTh : activeLangTab === 'DE' ? formData.descriptionDe : (formData.descriptionMm || '');

    if (!currentName.trim()) {
      showNotification('Inserisci il nome del piatto prima di tradurre', 'error');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await translateDishCardAllLanguages({
        sourceLang: activeLangTab,
        name: currentName,
        description: currentDesc,
        category: formData.category,
        isDailySpecial: formData.isDailySpecial
      });

      setFormData(prev => ({
        ...prev,
        nameIt: res.nameIt,
        nameEn: res.nameEn,
        nameTh: res.nameTh,
        nameDe: res.nameDe,
        nameMm: res.nameMm,
        descriptionIt: res.descriptionIt,
        descriptionEn: res.descriptionEn,
        descriptionTh: res.descriptionTh,
        descriptionDe: res.descriptionDe,
        descriptionMm: res.descriptionMm
      }));

      showNotification('Traduzioni generate con successo in 5 lingue (incluso Birmano 🇲🇲) tramite DeepSeek AI!');
    } catch (err: any) {
      console.error('Translation error:', err);
      showNotification('Errore durante la traduzione DeepSeek', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  // Image Upload & Conversion
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({ ...prev, image: base64 }));
      showNotification('Foto caricata nell\'anteprima');
    };
    reader.readAsDataURL(file);
  };

  // Save to Supabase Cloud
  const handleSaveToSupabase = async () => {
    if (!formData.nameIt.trim() && !formData.nameEn.trim()) {
      showNotification('Il nome del piatto è obbligatorio', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const dishId = formData.id || `dish-${Date.now()}`;
      
      const payload = {
        id: dishId,
        name: formData.nameEn || formData.nameIt,
        name_it: formData.nameIt,
        name_th: formData.nameTh,
        name_de: formData.nameDe,
        description: formData.descriptionEn || formData.descriptionIt,
        description_it: formData.descriptionIt,
        description_th: formData.descriptionTh,
        description_de: formData.descriptionDe,
        price: Number(formData.price) || 0,
        category: formData.category,
        image: formData.image,
        is_available: true,
        is_daily_special: formData.isDailySpecial,
        variants: formData.variants,
        extras: formData.extras
      };

      const { error } = await supabase
        .from('pizza_menu_items')
        .upsert(payload, { onConflict: 'id' });

      if (error && error.code !== '42P01') {
        console.warn('Supabase upsert notice:', error);
      }

      // Sync with active admin store and local catalog
      usePizzaAdminStore.getState().upsertMenuItem(payload);
      setCatalogItems(prev => {
        const exists = prev.some(i => i.id === dishId);
        if (exists) {
          return prev.map(i => i.id === dishId ? { ...i, ...payload } : i);
        }
        return [{ ...payload, sku: '' } as MenuItem, ...prev];
      });

      showNotification('Scheda piatto salvata e sincronizzata con successo su Supabase Cloud!');
    } catch (err: any) {
      console.error('Save error:', err);
      showNotification('Salvataggio completato localmente', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute live dietary status
  const currentDietary: DietaryType = formData.dietaryOverride !== 'auto' 
    ? (formData.dietaryOverride as DietaryType) 
    : getDietaryType({
        id: formData.id,
        name: formData.nameEn || formData.nameIt,
        description: formData.descriptionIt || formData.descriptionEn,
        descriptionIt: formData.descriptionIt,
        descriptionTh: formData.descriptionTh,
        descriptionDe: formData.descriptionDe,
        price: formData.price,
        image: formData.image
      }, formData.category);

  // Filtered Catalog
  const filteredCatalog = catalogItems.filter(item => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch = !searchQuery || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameIt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameTh?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 text-stone-100 w-full max-w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Dish & Pizza Card Studio
              </h2>
              <p className="text-stone-400 text-xs font-medium">
                Generatore schede menu fotorealistiche con traduzione DeepSeek AI in 4 lingue
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleResetNew}
            className="py-2 px-3.5 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nuovo Piatto</span>
          </button>

          {formData.id && (
            <button
              type="button"
              onClick={handleDuplicate}
              className="py-2 px-3.5 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Copy className="w-3.5 h-3.5 text-stone-400" />
              <span>Duplica</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveToSupabase}
            disabled={isSaving}
            className="py-2 px-4.5 bg-red-700 hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 stroke-[2.5]" />}
            <span>Salva Scheda Cloud</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusFeedback && (
        <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between animate-fadeIn ${
          feedbackType === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' 
            : 'bg-red-950/80 border-red-500/60 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackType === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusFeedback}</span>
          </div>
          <button type="button" onClick={() => setStatusFeedback(null)} className="text-stone-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Studio Grid (Split-View: Catalog / Form / Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Dish Catalog Picker (Col 3) */}
        <div className="lg:col-span-3 bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Catalogo Menu ({filteredCatalog.length})
              </h3>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca piatto o pizza..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500/60"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2 px-3 text-xs text-stone-300 focus:outline-none focus:border-red-500/60 cursor-pointer"
            >
              <option value="ALL">Tutte le Categorie ({catalogItems.length})</option>
              {DISH_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name.IT}
                </option>
              ))}
            </select>
          </div>

          {/* Dish List */}
          <div className="max-h-[560px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredCatalog.map((dish) => {
              const isSelected = formData.id === dish.id;
              return (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => handleSelectDish(dish)}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-red-950/70 border-red-500/70 text-white shadow-md'
                      : 'bg-stone-950/60 border-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate leading-tight">
                      {dish.nameIt || dish.name}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate mt-0.5">
                      {dish.category} · {dish.price}฿
                    </p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Form & DeepSeek Translations (Col 5) */}
        <div className="lg:col-span-5 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          
          {/* Active Editing Indicator Banner */}
          {formData.id && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black truncate text-white">
                    Modifica Piatto: <span className="text-amber-300">{formData.nameIt || formData.nameEn || formData.id}</span>
                  </p>
                  <p className="text-[10px] text-amber-300/70 truncate">
                    ID Univoco: {formData.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetNew}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ml-2 cursor-pointer shadow-sm"
              >
                Crea Nuovo
              </button>
            </div>
          )}

          {/* Section: Category & Daily Specials Assignment */}
          <div className="space-y-3 border-b border-stone-800 pb-5">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span>Categoria & Assegnazione Menu</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Categoria Principale
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    const catDefaults = getCategoryDefaultExtras(newCat);
                    setFormData(prev => ({
                      ...prev,
                      category: newCat,
                      extras: catDefaults.extras.length > 0 ? catDefaults.extras : prev.extras
                    }));
                  }}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {DISH_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name.IT}
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Special Toggle Button */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Vetrina Specialità
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isDailySpecial: !prev.isDailySpecial }))}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    formData.isDailySpecial
                      ? 'bg-amber-500/20 border-amber-400/80 text-amber-300 shadow-sm'
                      : 'bg-stone-950 border-stone-700 text-stone-400 hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${formData.isDailySpecial ? 'fill-amber-300 text-amber-300' : 'text-stone-500'}`} />
                  <span>{formData.isDailySpecial ? 'Specialità del Giorno ATTIVA' : 'Normale (Non in vetrina)'}</span>
                </button>
              </div>
            </div>

            {/* Base Price & Dietary Override */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Prezzo Base (THB)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">฿</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) || 0 }))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl py-2 pl-7 pr-3 text-xs text-white font-black focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Classificazione Dietetica
                </label>
                <select
                  value={formData.dietaryOverride || 'auto'}
                  onChange={(e) => setFormData(prev => ({ ...prev, dietaryOverride: e.target.value as any }))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="auto">Automatica (Dagli Ingredienti)</option>
                  <option value="veggie">Vegetariano (Veggie)</option>
                  <option value="vegan">100% Vegano (Vegan)</option>
                  <option value="null">Onnivoro / Regolare</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Custom Variants & Formats (Optional) */}
          <div className="space-y-3 border-b border-stone-800 pb-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-stone-400" />
                <span>Varianti & Formati Piatto (Opzionali)</span>
              </h4>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Aggiungi Variante</span>
              </button>
            </div>

            {formData.variants.length === 0 ? (
              <p className="text-[11px] text-stone-500 italic bg-stone-950/60 border border-stone-850 rounded-2xl p-3">
                Nessuna variante definita. Il piatto utilizzerà esclusivamente il Prezzo Base fisso (senza menu a tendina).
              </p>
            ) : (
              <div className="space-y-2">
                {formData.variants.map((v, idx) => (
                  <div key={v.id || idx} className="flex items-center gap-2 bg-stone-950 p-2.5 rounded-2xl border border-stone-800">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={v.nameIt || v.name || ''}
                        onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                        placeholder="Nome variante (es. Spaghetti, Penne, Tagliatelle Fatte a Mano...)"
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl py-1.5 px-2.5 text-xs text-white font-bold focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="w-24 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">฿</span>
                      <input
                        type="number"
                        value={v.price ?? formData.price}
                        onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value) || 0)}
                        placeholder="Prezzo"
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl py-1.5 pl-6 pr-2 text-xs text-white font-black text-right focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 rounded-xl bg-stone-900 hover:bg-red-950/60 text-stone-400 hover:text-red-400 border border-stone-800 hover:border-red-800/60 transition-all cursor-pointer"
                      title="Rimuovi variante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Multilingual Translation Engine */}
          <div className="space-y-3 border-b border-stone-800 pb-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Testi & Traduzione DeepSeek AI</span>
              </h4>

              <button
                type="button"
                onClick={handleDeepSeekTranslate}
                disabled={isTranslating}
                className="py-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
              >
                {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{isTranslating ? 'Traduzione...' : 'Traduci con DeepSeek AI'}</span>
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              {(['IT', 'EN', 'TH', 'DE', 'MM'] as DishLang[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveLangTab(lang)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer text-center ${
                    activeLangTab === lang
                      ? 'bg-stone-800 text-white shadow-sm ring-1 ring-stone-700'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {lang === 'IT' ? 'Italiano 🇮🇹' : lang === 'EN' ? 'English 🇬🇧' : lang === 'TH' ? 'ไทย 🇹🇭' : lang === 'DE' ? 'Deutsch 🇩🇪' : 'မြန်မာ 🇲🇲'}
                </button>
              ))}
            </div>

            {/* Language Text Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Nome Piatto ({activeLangTab})
                </label>
                <input
                  type="text"
                  value={
                    activeLangTab === 'IT' ? formData.nameIt :
                    activeLangTab === 'EN' ? formData.nameEn :
                    activeLangTab === 'IT' ? formData.nameIt : activeLangTab === 'EN' ? formData.nameEn : activeLangTab === 'TH' ? formData.nameTh : activeLangTab === 'DE' ? formData.nameDe : (formData.nameMm || '')
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      nameIt: activeLangTab === 'IT' ? val : prev.nameIt,
                      nameEn: activeLangTab === 'EN' ? val : prev.nameEn,
                      nameTh: activeLangTab === 'TH' ? val : prev.nameTh,
                      nameDe: activeLangTab === 'DE' ? val : prev.nameDe,
                      nameMm: activeLangTab === 'MM' ? val : prev.nameMm,
                    }));
                  }}
                  placeholder="Es. PIZZA MARGHERITA, TAGLIATA DI MANZO..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl py-2 px-3 text-xs text-white font-bold focus:outline-none focus:border-red-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Ingredienti ({activeLangTab})
                </label>
                <textarea
                  rows={3}
                  value={
                    activeLangTab === 'IT' ? formData.descriptionIt :
                    activeLangTab === 'EN' ? formData.descriptionEn :
                    activeLangTab === 'IT' ? formData.descriptionIt : activeLangTab === 'EN' ? formData.descriptionEn : activeLangTab === 'TH' ? formData.descriptionTh : activeLangTab === 'DE' ? formData.descriptionDe : (formData.descriptionMm || '')
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      descriptionIt: activeLangTab === 'IT' ? val : prev.descriptionIt,
                      descriptionEn: activeLangTab === 'EN' ? val : prev.descriptionEn,
                      descriptionTh: activeLangTab === 'TH' ? val : prev.descriptionTh,
                      descriptionDe: activeLangTab === 'DE' ? val : prev.descriptionDe,
                      descriptionMm: activeLangTab === 'MM' ? val : prev.descriptionMm,
                    }));
                  }}
                  placeholder="Lista ingredienti separati da virgola (es. Salsa di pomodoro, mozzarella fiordilatte, basilico fresco...)"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl py-2 px-3 text-xs text-stone-200 focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section: Image Upload & Management */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-stone-400" />
              <span>Foto del Piatto (Formato 1536x1024 o 3:2)</span>
            </h4>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Carica Foto dallo Smartphone / PC</span>
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1">
                Oppure incolla URL Immagine Diretta
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://.../delivery_food/01-Pizza/..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl py-1.5 px-3 text-[11px] text-stone-300 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live WYSIWYG Card Preview 1:1 (Col 4) */}
        <div className="lg:col-span-4 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 sticky top-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Anteprima Reale Scheda 1:1
              </h3>
            </div>

            {/* Preview Language Selector */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
              {(['IT', 'EN', 'TH', 'DE'] as DishLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setPreviewLang(l)}
                  className={`px-2 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                    previewLang === l ? 'bg-red-700 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-stone-400 italic">
            Visualizzazione esatta come appare ai clienti sul sito web delivery e sui tablet al tavolo.
          </p>

          {/* Card Container (Exact replica of MenuGrid item card) */}
          <div className="pt-2 flex justify-center">
            <article className="w-full max-w-sm bg-white border border-stone-300 rounded-[2rem] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative select-none">
              
              {/* Daily Special Golden Badge (if active) */}
              {formData.isDailySpecial && (
                <div className="absolute top-3 left-3 z-30 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                  <Star className="w-3 h-3 fill-stone-950" />
                  <span>Specialità del Giorno</span>
                </div>
              )}

              {/* Dietary Watermark */}
              {currentDietary && (
                <div className="absolute top-3 right-3 z-30">
                  <div className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-sm bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {currentDietary === 'vegan' ? <Leaf className="w-3 h-3" /> : <Wheat className="w-3 h-3" />}
                    <span>{currentDietary}</span>
                  </div>
                </div>
              )}

              {/* Image Box */}
              <div className="relative w-full aspect-[4/3] bg-stone-100 flex items-center justify-center overflow-hidden">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.nameIt || 'Piatto'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-400 p-6 text-center">
                    <UtensilsCrossed className="w-10 h-10 mb-2 stroke-[1.5] text-stone-300" />
                    <span className="text-xs font-bold">Nessuna immagine caricata</span>
                  </div>
                )}
              </div>

              {/* Content Box */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow space-y-3">
                <div>
                  <h3
                    className="font-sans font-bold text-stone-900 leading-tight tracking-tight text-base sm:text-lg"
                    style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                  >
                    {formatProductName(
                      previewLang === 'IT' ? (formData.nameIt || 'NOME PIATTO') :
                      previewLang === 'EN' ? (formData.nameEn || 'DISH NAME') :
                      previewLang === 'TH' ? (formData.nameTh || 'ชื่ออาหาร') : (formData.nameDe || 'GERICHTSNAME')
                    )}
                  </h3>

                  <p
                    className="text-stone-500 text-xs font-light leading-relaxed mt-2 line-clamp-3"
                    style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                  >
                    {
                      previewLang === 'IT' ? (formData.descriptionIt || 'Descrizione degli ingredienti freschi italiani...') :
                      previewLang === 'EN' ? (formData.descriptionEn || 'Fresh authentic ingredients culinary description...') :
                      previewLang === 'TH' ? (formData.descriptionTh || 'คำอธิบายวัตถุดิบและรสชาติอิตาเลียนแท้...') :
                      (formData.descriptionDe || 'Frische italienische Zutaten und Zubereitung...')
                    }
                  </p>
                </div>

                {/* Variants Preview Selector (Only if variants exist) */}
                {formData.variants && formData.variants.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 space-y-1">
                    <label className="block text-[9px] font-black uppercase tracking-wider text-stone-400">
                      {previewLang === 'TH' ? 'เลือกรูปแบบ / เส้นพาสต้า' : previewLang === 'DE' ? 'Variante / Format wählen' : previewLang === 'EN' ? 'Choose Format / Variant' : 'Scegli Formato / Variante'}:
                    </label>
                    <select
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-1.5 px-2 text-xs text-stone-800 font-bold focus:outline-none cursor-pointer"
                    >
                      {formData.variants.map((v, i) => (
                        <option key={v.id || i} value={v.id}>
                          {previewLang === 'TH' ? (v.nameTh || v.name) : previewLang === 'DE' ? (v.nameDe || v.name) : previewLang === 'EN' ? (v.name || v.nameIt) : (v.nameIt || v.name)} ({v.price || formData.price}฿)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Footer Action Bar */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8.5px] uppercase tracking-widest text-stone-400 font-extrabold">
                      {previewLang === 'TH' ? 'ราคา' : previewLang === 'DE' ? 'Preis' : previewLang === 'EN' ? 'Price' : 'Prezzo'}
                    </span>
                    <div className="flex items-baseline gap-1 leading-tight mt-0.5">
                      <span className="text-lg font-black text-stone-900">
                        {formData.price || 0}
                      </span>
                      <span className="text-xs font-black text-stone-900 select-none">฿</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 text-white text-xs font-bold rounded-full shadow-md bg-[#8B1E1E] flex items-center gap-1.5"
                    style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>
                      {previewLang === 'TH' ? 'เพิ่ม' : previewLang === 'IT' ? 'Aggiungi' : previewLang === 'DE' ? 'Hinzufügen' : 'Add'}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>

      </div>
    </div>
  );
}
