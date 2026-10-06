import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Search, 
  Check, 
  UtensilsCrossed, 
  Beer, 
  Wine as WineIcon, 
  Coffee, 
  Pizza, 
  Sparkles, 
  Loader2,
  Trash2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { menuData, MenuItem } from '../../../pizza/data/menuData';
import { INITIAL_WINE_COLLECTION, WineCardData } from '../../../pizza/data/wineData';
import { supabase } from '../../../lib/supabase';
import { PizzaOrder } from '../store/usePizzaAdminStore';

interface AddTableItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PizzaOrder | null;
  onOrderUpdated: () => void;
  kdsLang?: 'en' | 'th';
}

interface StagedItem {
  id: string;
  name: string;
  nameTh?: string;
  price: number;
  quantity: number;
  variant?: string;
  extras?: string[];
  addedByStaff?: boolean;
}

export const AddTableItemsModal: React.FC<AddTableItemsModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
  kdsLang = 'en'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Flatten and prepare full catalog
  const fullCatalog = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      nameTh?: string;
      nameIt?: string;
      category: string;
      categoryName: string;
      price: number;
      variants?: any[];
      extras?: any[];
    }> = [];

    menuData.forEach((cat) => {
      cat.items.forEach((item) => {
        list.push({
          id: item.id,
          name: item.name,
          nameTh: item.nameTh,
          nameIt: item.nameIt,
          category: cat.id,
          categoryName: cat.name,
          price: typeof item.price === 'number' ? item.price : 150,
          variants: item.variants,
          extras: item.extras
        });
      });
    });

    // Also include wine collection
    INITIAL_WINE_COLLECTION.forEach((wine) => {
      const priceNum = typeof wine.price === 'string' 
        ? parseFloat(wine.price.replace(/[^0-9.]/g, '')) || 1190 
        : (wine.price || 1190);

      list.push({
        id: wine.id,
        name: wine.title,
        nameTh: wine.titleTh || wine.title,
        nameIt: wine.titleIt || wine.title,
        category: 'wines',
        categoryName: 'Carta dei Vini',
        price: priceNum,
        variants: undefined,
        extras: undefined
      });
    });

    return list;
  }, []);

  // Filtered items based on category and search query
  const filteredCatalog = useMemo(() => {
    return fullCatalog.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchTh = (item.nameTh || '').toLowerCase().includes(q);
        const matchIt = (item.nameIt || '').toLowerCase().includes(q);
        const matchCat = item.categoryName.toLowerCase().includes(q);
        return matchName || matchTh || matchIt || matchCat;
      }
      return true;
    });
  }, [fullCatalog, selectedCategory, searchQuery]);

  if (!isOpen || !order) return null;

  const tableLabel = order.table_number || (order.address?.includes('Tavolo') ? order.address.replace(/^\[.*?\]\s*/, '') : `Ordine #${order.id}`);

  const handleAddItem = (catalogItem: typeof fullCatalog[0]) => {
    setStagedItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === catalogItem.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: catalogItem.id,
          name: catalogItem.name,
          nameTh: catalogItem.nameTh,
          price: catalogItem.price,
          quantity: 1,
          addedByStaff: true
        }
      ];
    });
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setStagedItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as StagedItem[];
    });
  };

  const handleRemoveStagedItem = (itemId: string) => {
    setStagedItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Calculate new additions subtotal
  const stagedSubtotal = stagedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const stagedDiscount = Math.round(stagedSubtotal * 0.05);
  const stagedNetTotal = Math.max(0, stagedSubtotal - stagedDiscount);

  // Existing order calculations
  const existingTotal = Number(order.total) || 0;
  const newGrandTotal = existingTotal + stagedNetTotal;

  const handleConfirmAdditions = async () => {
    if (stagedItems.length === 0) {
      setErrorMessage(kdsLang === 'th' ? 'กรุณาเลือกรายการอาหารหรือเครื่องดื่มก่อน' : 'Seleziona almeno un articolo da aggiungere.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

      // Existing items array
      const currentItems = Array.isArray(order.items) ? [...order.items] : [];

      // Format newly staged items with staff timestamp
      const newItemsToAdd = stagedItems.map((item) => ({
        cartId: `staff-add-${Date.now()}-${item.id}`,
        productId: item.id,
        name: `${item.name} [Aggiunta Staff ${timeStr}]`,
        nameTh: item.nameTh ? `${item.nameTh} [เพิ่ม ${timeStr}]` : undefined,
        quantity: item.quantity,
        basePrice: item.price,
        total: Math.round(item.price * item.quantity * 0.95), // 5% discount
        addedByStaff: true,
        addedAt: now.toISOString()
      }));

      const mergedItems = [...currentItems, ...newItemsToAdd];
      const additionNote = `[Aggiunta ${timeStr}]: ${stagedItems.map(i => `${i.quantity}x ${i.name}`).join(', ')}`;
      const updatedAddress = order.address ? `${order.address} [NOTE: ${additionNote}]` : `[NOTE: ${additionNote}]`;

      // Update in Supabase
      const { error } = await supabase
        .from('pizza_orders')
        .update({
          items: mergedItems,
          total: newGrandTotal,
          address: updatedAddress,
          status: 'new'
        })
        .eq('id', order.id);

      if (error) throw error;

      // Broadcast update across tabs
      try {
        const bc1 = new BroadcastChannel('flower_power_orders_channel');
        bc1.postMessage({ type: 'ORDER_UPDATED', orderId: order.id, isTableReload: true, hasNewItems: true });
        bc1.close();
      } catch (_) {}
      try {
        const bc2 = new BroadcastChannel('pizza_orders_channel');
        bc2.postMessage({ type: 'ORDER_UPDATED', orderId: order.id, isTableReload: true, hasNewItems: true });
        bc2.close();
      } catch (_) {}

      setSuccessMessage(
        kdsLang === 'th'
          ? `เพิ่มรายการเข้า ${tableLabel} สำเร็จ (+${stagedNetTotal} ฿)`
          : `Aggiunti con successo ${stagedItems.length} articoli a ${tableLabel} (+${stagedNetTotal} ฿)`
      );

      setTimeout(() => {
        onOrderUpdated();
        onClose();
      }, 900);
    } catch (err: any) {
      console.error('Error adding items to table order:', err);
      setErrorMessage(err.message || 'Errore durante il salvataggio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'all', label: kdsLang === 'th' ? 'ทั้งหมด' : 'Tutto il Menu', icon: Sparkles },
    { id: 'beers', label: kdsLang === 'th' ? 'เบียร์' : 'Birre Fresche', icon: Beer },
    { id: 'wines', label: kdsLang === 'th' ? 'ไวน์' : 'Vini Pregiati', icon: WineIcon },
    { id: 'traditional-italian-pizza', label: kdsLang === 'th' ? 'พิซซ่า' : 'Pizze Classiche', icon: Pizza },
    { id: 'pasta', label: kdsLang === 'th' ? 'พาสต้า' : 'Primi & Pasta', icon: UtensilsCrossed },
    { id: 'coffee-shop', label: kdsLang === 'th' ? 'กาแฟ' : 'Caffetteria & Tè', icon: Coffee },
    { id: 'soft-drinks', label: kdsLang === 'th' ? 'น้ำอัดลม' : 'Bibite & Acqua', icon: Sparkles },
    { id: 'desserts', label: kdsLang === 'th' ? 'ของหวาน' : 'Dolci & Dessert', icon: Sparkles }
  ];

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-[#131722] border-2 border-amber-500/60 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="bg-[#181d28] px-5 py-4 border-b border-stone-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  {kdsLang === 'th' ? 'เพิ่มรายการที่โต๊ะ' : 'Aggiungi Piatti & Bevande al Tavolo'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider font-mono shadow-xs">
                  {tableLabel}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {kdsLang === 'th' 
                  ? `ออเดอร์ #${order.id} • ลูกค้า: ${order.customer_name} • ยอดปัจจุบัน: ${existingTotal} ฿` 
                  : `Comanda #${order.id} • Cliente: ${order.customer_name} • Conto Attuale: ${existingTotal} ฿`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-stone-800">
          
          {/* Left Column: Menu Selector (7 cols) */}
          <div className="md:col-span-7 flex flex-col h-full overflow-hidden p-4 space-y-3">
            
            {/* Search Bar */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={kdsLang === 'th' ? 'ค้นหาอาหาร, พิซซ่า, เบียร์, ไวน์, กาแฟ...' : 'Cerca pizza, birra, pasta, vino, caffè...'}
                className="w-full bg-[#0b0e14] border border-stone-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-stone-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Quick Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[380px] md:max-h-full">
              {filteredCatalog.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-xs">
                  {kdsLang === 'th' ? 'ไม่พบรายการที่ค้นหา' : 'Nessun prodotto trovato.'}
                </div>
              ) : (
                filteredCatalog.map((item) => {
                  const staged = stagedItems.find((i) => i.id === item.id);
                  const discountedPrice = Math.round(item.price * 0.95);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        staged
                          ? 'bg-amber-950/40 border-amber-400/80 shadow-md'
                          : 'bg-[#181d28] border-stone-800 hover:border-stone-600 hover:bg-[#1f2533]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">
                            {kdsLang === 'th' && item.nameTh ? item.nameTh : item.name}
                          </span>
                        </div>
                        {item.nameTh && kdsLang !== 'th' && (
                          <span className="text-[11px] text-stone-400 block truncate">
                            {item.nameTh}
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono font-black text-amber-300">
                            {discountedPrice} ฿
                          </span>
                          <span className="text-[10px] text-stone-500 line-through font-mono">
                            {item.price} ฿
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-600 font-extrabold">
                            -5%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {staged ? (
                          <div className="flex items-center gap-1.5 bg-[#0b0e14] px-2 py-1 rounded-xl border border-amber-500/60" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-amber-300 text-sm px-1.5">
                              {staged.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-300 flex items-center justify-center transition-colors shadow-xs"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Staged Basket for Table (5 cols) */}
          <div className="md:col-span-5 flex flex-col h-full bg-[#10131a] p-4 justify-between">
            
            <div className="space-y-3 overflow-hidden flex flex-col flex-1">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2 shrink-0">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>{kdsLang === 'th' ? 'รายการที่จะเพิ่ม' : 'Vassoio Nuovi Articoli'}</span>
                  <span className="px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[11px]">
                    {stagedItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </span>
                {stagedItems.length > 0 && (
                  <button
                    onClick={() => setStagedItems([])}
                    className="text-[11px] text-stone-500 hover:text-red-400 font-bold uppercase"
                  >
                    {kdsLang === 'th' ? 'ล้าง' : 'Svuota'}
                  </button>
                )}
              </div>

              {/* Staged Items List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[220px] md:max-h-full">
                {stagedItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-600">
                    <UtensilsCrossed className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-xs font-bold text-stone-500 uppercase">
                      {kdsLang === 'th' ? 'ยังไม่ได้เลือกรายการ' : 'Nessun articolo selezionato'}
                    </p>
                    <p className="text-[11px] text-stone-600 mt-1">
                      {kdsLang === 'th' ? 'แตะที่รายการด้านซ้ายเพื่อเพิ่ม' : 'Tocca i prodotti a sinistra per aggiungerli al conto.'}
                    </p>
                  </div>
                ) : (
                  stagedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-[#171c26] border border-stone-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-white block truncate">
                          {item.name}
                        </span>
                        <span className="font-mono text-amber-400 text-[11px]">
                          {item.quantity}x • {Math.round(item.price * item.quantity * 0.95)} ฿
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveStagedItem(item.id)}
                          className="p-1 rounded-lg text-stone-500 hover:text-red-400 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Summary & Action */}
            <div className="pt-3 border-t border-stone-800 space-y-2.5 shrink-0 mt-2">
              <div className="bg-[#0b0e14] p-3 rounded-2xl border border-stone-800 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-stone-400">
                  <span>{kdsLang === 'th' ? 'ยอดเดิม:' : 'Conto precedente:'}</span>
                  <span className="text-white font-bold">{existingTotal} ฿</span>
                </div>
                <div className="flex items-center justify-between text-amber-300">
                  <span>{kdsLang === 'th' ? 'เพิ่มใหม่ (-5%):' : 'Nuove aggiunte (-5%):'}</span>
                  <span className="font-bold">+{stagedNetTotal} ฿</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 text-sm font-black pt-1 border-t border-stone-800">
                  <span>{kdsLang === 'th' ? 'ยอดรวมใหม่:' : 'NUOVO TOTALE TAVOLO:'}</span>
                  <span className="text-base">{newGrandTotal} ฿</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting || stagedItems.length === 0}
                onClick={handleConfirmAdditions}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{kdsLang === 'th' ? 'กำลังบันทึก...' : 'Invio in cucina...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>
                      {kdsLang === 'th' 
                        ? `ยืนยันและเพิ่มเข้าโต๊ะ (+${stagedNetTotal} ฿)` 
                        : `Conferma & Invia Comanda (+${stagedNetTotal} ฿)`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
