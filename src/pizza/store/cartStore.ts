import { create } from 'zustand';
import type { ExtraOption, Variant } from '../data/menuData';

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  nameTh: string;
  nameIt?: string;
  nameDe?: string;
  nameMm?: string;
  name_mm?: string;
  quantity: number;
  basePrice: number;
  selectedVariant?: Variant | null;
  selectedExtras?: ExtraOption[];
  image: string;
  lasagnaDate?: string; // Pre-order date for lasagna (required, min 1 day in advance)
  isHalalChicken?: boolean; // Replaces pork ingredients with 100% chicken meat
}

export function calcItemTotal(item: CartItem): number {
  const quantity = Number(item.quantity ?? 1);
  const basePrice = Number(item.basePrice ?? (item as any).price ?? 0);
  const variantPrice = (item.selectedVariant?.price != null && Number(item.selectedVariant.price) > 0)
    ? Number(item.selectedVariant.price)
    : (basePrice + Number(item.selectedVariant?.priceModifier ?? 0));
  const extrasTotal = (item.selectedExtras || []).reduce((sum, e) => sum + Number(e.price ?? 0), 0);
  const safeQty = isNaN(quantity) || quantity <= 0 ? 1 : quantity;
  return (variantPrice + extrasTotal) * safeQty;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'cartId'> | any) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  updateCartItem: (cartId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) => {
    const extras = item.selectedExtras || [];
    const variant = item.selectedVariant || null;
    const basePrice = Number(item.basePrice ?? item.price ?? 0);
    const quantity = Number(item.quantity ?? 1);
    const cartId = `${item.productId || item.id || 'item'}-${variant?.id ?? 'base'}-${extras.map((e: any) => e.id).join('-')}-${Date.now()}`;
    const cleanItem: CartItem = {
      productId: item.productId || item.id || '',
      name: item.name || '',
      nameTh: item.nameTh || item.name || '',
      nameIt: item.nameIt,
      nameDe: item.nameDe,
      nameMm: item.nameMm || item.name_mm,
      name_mm: item.nameMm || item.name_mm,
      image: item.image || '',
      basePrice: isNaN(basePrice) ? 0 : basePrice,
      quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
      selectedVariant: variant,
      selectedExtras: extras,
      lasagnaDate: item.lasagnaDate,
      isHalalChicken: item.isHalalChicken,
      cartId,
    };
    set((state) => ({ items: [...state.items, cleanItem] }));
  },

  removeItem: (cartId) => {
    set((state) => ({ items: state.items.filter((i) => i.cartId !== cartId) }));
  },

  updateQuantity: (cartId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => i.cartId === cartId ? { ...i, quantity } : i),
    }));
  },

  updateCartItem: (cartId, updates) => {
    set((state) => ({
      items: state.items.map((i) => (i.cartId === cartId ? { ...i, ...updates } : i)),
    }));
  },

  clearCart: () => set({ items: [] }),
  setItems: (items) => set({ items: Array.isArray(items) ? items : [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getTotal: () => get().items.reduce((sum, item) => sum + calcItemTotal(item), 0),
  getCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
