/**
 * Official Payment Calculation Engine for Flower Power (Village & Pizzeria).
 * 
 * Rules:
 * 1. Base Price is subject to 7% VAT -> Subtotal = BasePrice * 1.07
 * 2. Payment Method processing costs (incorporated directly into final total):
 *    - Bank Transfer / Cash on Delivery: 0% extra -> Total = Subtotal
 *    - Ksher Payment Gateway (Cards / PromptPay): +4% -> Total = Subtotal * 1.04
 *    - PayPal: +10% -> Total = Subtotal * 1.10
 * 3. Transparent & Elegant UX: No separate "fee" or "surcharge" lines.
 *    Single final total with discrete notice: "VAT and applicable payment processing costs included."
 */

export type PaymentMethod = 'bank_transfer' | 'cash' | 'ksher' | 'ksher_card' | 'ksher_promptpay' | 'paypal' | 'stripe';

export interface PriceBreakdown {
  basePrice: number;        // Prezzo base del prodotto/soggiorno
  vatRate: number;          // 0.07 (7%)
  vatAmount: number;        // Importo VAT 7%
  subtotalWithVat: number;  // Prezzo base + VAT 7% (Totale normale)
  paymentMethod: PaymentMethod;
  processingRate: number;   // 0, 0.04, o 0.10
  processingCost: number;   // Importo costi di gestione incorporati
  finalTotal: number;       // Totale finale definitivo applicabile
  disclaimer: string;       // Nota discreta nella lingua richiesta
}

export function calculatePaymentTotal(
  basePrice: number,
  method: PaymentMethod,
  lang: 'it' | 'en' | 'th' | 'de' = 'en'
): PriceBreakdown {
  const safeBasePrice = Math.max(0, Number(basePrice) || 0);
  const vatRate = 0.07;
  const vatAmount = Math.round(safeBasePrice * vatRate);
  const subtotalWithVat = safeBasePrice + vatAmount;

  let processingRate = 0;
  if (method === 'ksher' || method === 'ksher_card' || method === 'ksher_promptpay') {
    processingRate = 0.04; // 4% Ksher processing cost (Cards & PromptPay)
  } else if (method === 'paypal') {
    processingRate = 0.10; // 10% PayPal processing cost
  } else if (method === 'stripe') {
    processingRate = 0.04; // 4% Stripe standard
  }

  const finalTotal = Math.round(subtotalWithVat * (1 + processingRate));
  const processingCost = finalTotal - subtotalWithVat;

  const disclaimers: Record<string, string> = {
    it: 'IVA (VAT 7%) e costi di elaborazione pagamento applicabili inclusi.',
    en: 'VAT and applicable payment processing costs included.',
    th: 'รวมภาษีมูลค่าเพิ่ม (VAT 7%) และค่าธรรมเนียมการประมวลผลการชำระเงินที่เกี่ยวข้องแล้ว',
    de: 'MwSt. (VAT 7%) und anfallende Zahlungsabwicklungskosten inbegriffen.'
  };

  return {
    basePrice: safeBasePrice,
    vatRate,
    vatAmount,
    subtotalWithVat,
    paymentMethod: method,
    processingRate,
    processingCost,
    finalTotal,
    disclaimer: disclaimers[lang] || disclaimers.en
  };
}
