export interface CartItemSaved {
  productId: string;
  name: string;
  nameTh: string;
  nameIt?: string;
  nameDe?: string;
  quantity: number;
  basePrice: number;
  selectedVariant: string | null;
  selectedExtras: { id: string; name: string; price: number }[];
  itemTotal: number;
}

export interface PizzaOrder {
  id?: string;
  created_at?: string;
  customer_name: string;
  phone: string;
  address: string;
  items: CartItemSaved[];
  total: number;
  status: 'new' | 'preparing' | 'delivering' | 'completed' | 'rejected';
  payment_method: 'promptpay' | 'cash';
  receipt_url: string | null;
  telegram_notified?: boolean;
  has_whatsapp?: boolean;
  has_line?: boolean;
  tracking_active?: boolean;
  driver_latitude?: number;
  driver_longitude?: number;
  telegram_message_id?: string | number;
}
