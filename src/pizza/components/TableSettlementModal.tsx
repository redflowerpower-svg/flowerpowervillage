import React, { useState } from 'react';
import { 
  X, 
  UtensilsCrossed, 
  Check, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Loader2, 
  Percent, 
  Phone, 
  User, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  Gift,
  ZoomIn,
  Printer
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Language } from '../config/languages';
import { formatTableStationName } from '../utils/tableUtils';

const QR_KSHOP_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/qr_promptpay.jpg`;

interface TableSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableKey: string;
  ordersForTable: any[];
  lang?: Language;
  onSettled: () => void;
}

const I18N = {
  IT: {
    title: 'Chiusura & Saldo Conto al Tavolo',
    station: 'Postazione:',
    itemsHeading: 'Dettaglio Portate & Bevande',
    subtotal: 'Totale Portate',
    discount: 'Sconto Dining Privilege (-5%)',
    totalPayable: 'Totale Finale da Saldare',
    paymentSection: 'Modalità di Incasso',
    payPromptPay: 'PromptPay K-Shop Kasikorn',
    payCard: 'Carta / POS al Tavolo',
    payCash: 'Contanti al Tavolo',
    confirmBtn: 'Conferma Pagamento & Chiudi Tavolo',
    processing: 'Chiusura in corso...',
    successTitle: 'Conto Saldato & Tavolo Chiuso!',
    successDesc: 'Il tavolo è stato liberato con successo ed archiviato.',
    closeBtn: 'Torna al Menu'
  },
  EN: {
    title: 'Table Tab Settlement & Checkout',
    station: 'Station:',
    itemsHeading: 'Ordered Dishes & Drinks',
    subtotal: 'Dishes Subtotal',
    discount: 'Dining Privilege (-5%)',
    totalPayable: 'Final Total to Settle',
    paymentSection: 'Payment Collection Method',
    payPromptPay: 'PromptPay K-Shop Kasikorn',
    payCard: 'Card / Mobile POS',
    payCash: 'Cash at Table',
    confirmBtn: 'Confirm Settlement & Close Table',
    processing: 'Closing session...',
    successTitle: 'Tab Settled & Table Closed!',
    successDesc: 'Table session has been archived and is now available.',
    closeBtn: 'Back to Menu'
  },
  TH: {
    title: 'เช็คบิลและชำระเงินที่โต๊ะอาหาร',
    station: 'โต๊ะ/ที่นั่ง:',
    itemsHeading: 'รายการอาหารและเครื่องดื่มทั้งหมด',
    subtotal: 'ยอดรวมอาหาร',
    discount: 'ส่วนลดพิเศษที่โต๊ะ (-5%)',
    totalPayable: 'ยอดสุทธิที่ต้องชำระ',
    paymentSection: 'เลือกวิธีการรับชำระเงิน',
    payPromptPay: 'พร้อมเพย์ K-Shop กสิกรไทย',
    payCard: 'รูดบัตรเครดิต / EDC',
    payCash: 'เงินสด',
    confirmBtn: 'ยืนยันรับชำระเงินและปิดโต๊ะ',
    processing: 'กำลังบันทึกรายการ...',
    successTitle: 'เช็คบิลเรียบร้อย โต๊ะว่างแล้ว!',
    successDesc: 'บันทึกการชำระเงินและเคลียร์สถานะโต๊ะเรียบร้อยแล้ว',
    closeBtn: 'กลับสู่หน้าหลัก'
  },
  DE: {
    title: 'Tischabrechnung & Bezahlung',
    station: 'Tisch/Gast:',
    itemsHeading: 'Bestellte Speisen & Getränke',
    subtotal: 'Zwischensumme',
    discount: 'Tisch-Rabatt (-5%)',
    totalPayable: 'Zu zahlender Endbetrag',
    paymentSection: 'Zahlungsart',
    payPromptPay: 'PromptPay K-Shop',
    payCard: 'Karte / Mobiles POS',
    payCash: 'Bargeld am Tisch',
    confirmBtn: 'Zahlung bestätigen & Tisch freigeben',
    processing: 'Wird verarbeitet...',
    successTitle: 'Abrechnung abgeschlossen & Tisch frei!',
    successDesc: 'Der Tisch wurde erfolgreich abgerechnet und freigegeben.',
    closeBtn: 'Zurück zur Speisekarte'
  }
};

export const TableSettlementModal: React.FC<TableSettlementModalProps> = ({
  isOpen,
  onClose,
  tableKey,
  ordersForTable,
  lang = 'IT',
  onSettled
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'card' | 'cash'>('promptpay');
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !tableKey) return null;

  const t = I18N[lang] || I18N.IT;
  const translatedStation = formatTableStationName(tableKey, lang);

  // Flatten all items across active orders for this table
  const allItems: any[] = [];
  let grandTotal = 0;

  ordersForTable.forEach(ord => {
    grandTotal += (ord.total || 0);
    if (Array.isArray(ord.items)) {
      ord.items.forEach((it: any) => {
        allItems.push(it);
      });
    }
  });

  const handleConfirmSettlement = async () => {
    setLoading(true);
    const paymentLabel = paymentMethod === 'promptpay' 
      ? 'promptpay_kshop_at_table' 
      : paymentMethod === 'card' 
        ? 'card_pos_at_table' 
        : 'cash_at_table';

    try {
      const orderIds = ordersForTable.map(o => o.id);
      
      for (const id of orderIds) {
        await supabase
          .from('pizza_orders')
          .update({
            status: 'completed',
            payment_method: paymentLabel
          })
          .eq('id', id);
      }

      // Broadcast completed orders
      try {
        const ch1 = new BroadcastChannel('pizza_orders_channel');
        ch1.postMessage({ type: 'ORDER_COMPLETED', table: tableKey, orderIds });
        ch1.close();
      } catch (_) {}

      try {
        const ch2 = new BroadcastChannel('flower_power_orders_channel');
        ch2.postMessage({ type: 'ORDER_COMPLETED', table: tableKey, orderIds });
        ch2.close();
      } catch (_) {}

      setIsSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setIsSuccess(false);
        onSettled();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error settling table orders:', err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-400/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1E1E] via-[#781818] to-[#5a1111] px-5 py-4 flex items-center justify-between text-white border-b border-red-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight text-white flex items-center gap-2">
                <span>{t.title}</span>
              </h3>
              <p className="text-amber-200/90 text-xs font-bold">
                {t.station} {translatedStation}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-stone-200 flex-1">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4 animate-scaleIn">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
              </div>
              <h4 className="text-2xl font-black text-white">{t.successTitle}</h4>
              <p className="text-sm text-stone-400 max-w-sm mx-auto">{t.successDesc}</p>
            </div>
          ) : (
            <>
              {/* Ordered Dishes List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <span>{t.itemsHeading}</span>
                  <span className="text-stone-400 font-mono text-[11px]">{allItems.length} portate</span>
                </div>
                
                <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-2 max-h-48 overflow-y-auto">
                  {allItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-850 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-black text-amber-400 font-mono">{item.quantity}x</span>
                        <span className="text-white truncate font-medium">{item.name || item.nameIt}</span>
                        {item.variant && <span className="text-stone-400 text-[10px]">({item.variant})</span>}
                      </div>
                      <span className="font-mono text-stone-300 font-bold shrink-0 ml-2">{item.total || item.basePrice * item.quantity} ฿</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Discount Breakdown */}
              <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-amber-400/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>{t.discount}</span>
                  <span className="text-emerald-400 font-bold">-5% AL TAVOLO</span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase">{t.totalPayable}</span>
                  <span className="text-xl font-black text-amber-300 font-mono">{grandTotal} ฿</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  {t.paymentSection}
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'promptpay'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md scale-[1.02]'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-[10.5px] font-black text-center leading-tight">PromptPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md scale-[1.02]'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[10.5px] font-black text-center leading-tight">POS / Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md scale-[1.02]'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-[10.5px] font-black text-center leading-tight">Contanti / Cash</span>
                  </button>
                </div>

                {paymentMethod === 'promptpay' && (
                  <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex items-center gap-3">
                    <img
                      src={QR_KSHOP_URL}
                      alt="PromptPay QR Code"
                      className="w-16 h-16 object-contain rounded-lg border border-stone-700 cursor-pointer"
                      onClick={() => setIsQrZoomOpen(true)}
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-white">K-Shop Kasikorn Bank (0% Commissioni)</p>
                      <p className="text-[11px] text-stone-400">Scansiona con K PLUS, SCB o qualsiasi app bancaria thai.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmSettlement}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 font-black rounded-2xl shadow-xl transition-all cursor-pointer text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t.confirmBtn} ({grandTotal} ฿)</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
