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
import { revokeDiningTableSession } from '../services/diningSessionService';

const QR_KSHOP_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/qr_promptpay.jpg`;

interface TableSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableKey: string;
  ordersForTable: any[];
  lang?: Language;
  onSettled: () => void;
}

const I18N: Record<string, any> = {
  "IT": {
    "title": "Chiusura & Saldo Conto al Tavolo",
    "station": "Postazione:",
    "itemsHeading": "Dettaglio Portate & Bevande",
    "subtotal": "Totale Portate",
    "discount": "Sconto Promozionale",
    "totalPayable": "Totale Finale da Saldare",
    "paymentSection": "Modalità di Incasso",
    "payPromptPay": "PromptPay K-Shop Kasikorn",
    "payCard": "Carta / POS al Tavolo",
    "payCash": "Contanti al Tavolo",
    "confirmBtn": "Conferma Pagamento & Chiudi Tavolo",
    "processing": "Chiusura in corso...",
    "successTitle": "Conto Saldato & Tavolo Chiuso!",
    "successDesc": "Il tavolo è stato liberato con successo ed archiviato.",
    "closeBtn": "Torna al Menu"
  },
  "EN": {
    "title": "Table Closing & Bill Settlement",
    "station": "Station:",
    "itemsHeading": "Food & Beverage Details",
    "subtotal": "Items Total",
    "discount": "Promotional Discount",
    "totalPayable": "Final Total to Pay",
    "paymentSection": "Payment Method",
    "payPromptPay": "PromptPay K-Shop Kasikorn",
    "payCard": "Card / POS at Table",
    "payCash": "Cash at Table",
    "confirmBtn": "Confirm Payment & Close Table",
    "processing": "Closing in progress...",
    "successTitle": "Bill Settled & Table Closed!",
    "successDesc": "The table has been successfully cleared and archived.",
    "closeBtn": "Back to Menu"
  },
  "TH": {
    "title": "ปิดบิลและชำระเงินที่โต๊ะ",
    "station": "สถานี:",
    "itemsHeading": "รายละเอียดอาหารและเครื่องดื่ม",
    "subtotal": "ยอดรวมอาหาร",
    "discount": "ส่วนลดโปรโมชั่น",
    "totalPayable": "ยอดสุทธิที่ต้องชำระ",
    "paymentSection": "วิธีการชำระเงิน",
    "payPromptPay": "พร้อมเพย์ K-Shop กสิกรไทย",
    "payCard": "บัตร / เครื่องรูดบัตรที่โต๊ะ",
    "payCash": "เงินสดที่โต๊ะ",
    "confirmBtn": "ยืนยันการชำระเงินและปิดโต๊ะ",
    "processing": "กำลังปิดโต๊ะ...",
    "successTitle": "ชำระเงินเรียบร้อยและปิดโต๊ะแล้ว!",
    "successDesc": "โต๊ะว่างเรียบร้อยและถูกเก็บเข้าคลังแล้ว",
    "closeBtn": "กลับสู่เมนู"
  },
  "MM": {
    "title": "စားပွဲပေါ်တွင် ငွေရှင်းခြင်းနှင့် စာရင်းပိတ်ခြင်း",
    "station": "နေရာ:",
    "itemsHeading": "အစားအသောက်နှင့် သောက်စရာ အသေးစိတ်",
    "subtotal": "အစားအသောက် စုစုပေါင်း",
    "discount": "ပရိုမိုးရှင်း လျှော့စျေး",
    "totalPayable": "ပေးရမည့် စုစုပေါင်း",
    "paymentSection": "ငွေပေးချေမှု နည်းလမ်း",
    "payPromptPay": "PromptPay K-Shop Kasikorn",
    "payCard": "ကတ် / POS စားပွဲပေါ်တွင်",
    "payCash": "ငွေသား စားပွဲပေါ်တွင်",
    "confirmBtn": "ငွေပေးချေမှု အတည်ပြုပြီး စားပွဲပိတ်မည်",
    "processing": "ပိတ်နေသည်...",
    "successTitle": "စာရင်းရှင်းပြီး စားပွဲပိတ်ပြီးပါပြီ!",
    "successDesc": "စားပွဲကို အောင်မြင်စွာ လွှတ်ပေးပြီး သိမ်းဆည်းပြီးပါပြီ။",
    "closeBtn": "မီနူးသို့ ပြန်သွားမည်"
  },
  "DE": {
    "title": "Tischabschluss & Rechnungsbegleichung",
    "station": "Station:",
    "itemsHeading": "Details zu Speisen & Getränken",
    "subtotal": "Gesamtsumme Speisen",
    "discount": "Aktionsrabatt",
    "totalPayable": "Endgültiger zu zahlender Betrag",
    "paymentSection": "Zahlungsart",
    "payPromptPay": "PromptPay K-Shop Kasikorn",
    "payCard": "Karte / POS am Tisch",
    "payCash": "Bargeld am Tisch",
    "confirmBtn": "Zahlung bestätigen & Tisch schließen",
    "processing": "Abschluss läuft...",
    "successTitle": "Rechnung beglichen & Tisch geschlossen!",
    "successDesc": "Der Tisch wurde erfolgreich freigegeben und archiviert.",
    "closeBtn": "Zurück zum Menü"
  },
  "FR": {
    "title": "Clôture & Règlement de l'Addition à Table",
    "station": "Poste :",
    "itemsHeading": "Détail des Plats & Boissons",
    "subtotal": "Total des Plats",
    "discount": "Remise Promotionnelle",
    "totalPayable": "Total Final à Payer",
    "paymentSection": "Mode de Paiement",
    "payPromptPay": "PromptPay K-Shop Kasikorn",
    "payCard": "Carte / TPE à Table",
    "payCash": "Espèces à Table",
    "confirmBtn": "Confirmer le Paiement & Fermer la Table",
    "processing": "Clôture en cours...",
    "successTitle": "Addition Réglée & Table Fermée !",
    "successDesc": "La table a été libérée avec succès et archivée.",
    "closeBtn": "Retour au Menu"
  },
  "ES": {
    "title": "Cierre y Pago de Cuenta en la Mesa",
    "station": "Estación:",
    "itemsHeading": "Detalle de Platos y Bebidas",
    "subtotal": "Total de Platos",
    "discount": "Descuento Promocional",
    "totalPayable": "Total Final a Pagar",
    "paymentSection": "Método de Pago",
    "payPromptPay": "PromptPay K-Shop Kasikorn",
    "payCard": "Tarjeta / POS en la Mesa",
    "payCash": "Efectivo en la Mesa",
    "confirmBtn": "Confirmar Pago y Cerrar Mesa",
    "processing": "Cerrando...",
    "successTitle": "¡Cuenta Pagada y Mesa Cerrada!",
    "successDesc": "La mesa ha sido liberada y archivada con éxito.",
    "closeBtn": "Volver al Menú"
  },
  "RU": {
    "title": "Закрытие счета и оплата за столом",
    "station": "Станция:",
    "itemsHeading": "Детали блюд и напитков",
    "subtotal": "Итого по блюдам",
    "discount": "Промо-скидка",
    "totalPayable": "Итоговая сумма к оплате",
    "paymentSection": "Способ оплаты",
    "payPromptPay": "PromptPay K-Shop Kasikorn",
    "payCard": "Карта / POS за столом",
    "payCash": "Наличные за столом",
    "confirmBtn": "Подтвердить оплату и закрыть стол",
    "processing": "Закрытие...",
    "successTitle": "Счет оплачен и стол закрыт!",
    "successDesc": "Стол успешно освобожден и архивирован.",
    "closeBtn": "Вернуться в меню"
  },
  "ZH": {
    "title": "餐桌结账与清台",
    "station": "站点：",
    "itemsHeading": "菜品与饮品明细",
    "subtotal": "菜品总计",
    "discount": "促销折扣",
    "totalPayable": "应付总额",
    "paymentSection": "收款方式",
    "payPromptPay": "PromptPay K-Shop Kasikorn",
    "payCard": "刷卡 / 餐桌POS机",
    "payCash": "餐桌现金支付",
    "confirmBtn": "确认支付并关闭餐桌",
    "processing": "正在结账...",
    "successTitle": "账单已结清，餐桌已关闭！",
    "successDesc": "餐桌已成功释放并归档。",
    "closeBtn": "返回菜单"
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
      for (const id of orderIds) {
        try {
          await fetch('/api/pizza-order-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: id, status: 'completed' })
          });
        } catch (e) {}

        try {
          await supabase
            .from('pizza_orders')
            .update({
              status: 'completed',
              payment_method: paymentLabel
            })
            .eq('id', id);
        } catch (e) {}
      }

      // Revoke and close dynamic table QR session
      try {
        revokeDiningTableSession(tableKey);
      } catch (_) {}

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

              {/* Total Breakdown */}
              <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-amber-400/30 flex items-center justify-between">
                <span className="text-sm font-black text-white uppercase">{t.totalPayable}</span>
                <span className="text-xl font-black text-amber-300 font-mono">{grandTotal} ฿</span>
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
