import { useState, useRef } from 'react';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

const QR_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/qr_promptpay.jpg`;

const translations = {
  IT: {
    step1Title: 'I Tuoi Dati',
    namePlaceholder: 'Nome',
    phonePlaceholder: 'Telefono',
    addressPlaceholder: 'Indirizzo di Consegna',
    verifyLoc: 'Verifica Posizione',
    verifyingLoc: 'Verifica in corso...',
    outOfRange: (dist: number, max: number) => `Siamo spiacenti, la tua posizione è a ${dist.toFixed(1)} km. Consegniamo fino a un massimo di ${max} km.`,
    simLoc: 'Simula posizione (Test)',
    continueBtn: 'Continua',
    step2Title: 'Metodo di Pagamento',
    optPromptPay: 'PromptPay (QR Code)',
    optCash: 'Contanti alla consegna',
    uploadBtn: 'Carica screenshot ricevuta',
    submitBtn: 'CONFERMA E INVIA ORDINE',
    uploadPromptBtn: 'CARICA RICEVUTA PER PROCEDERE',
    backBtn: 'Torna indietro',
    successTitle: 'Ordine Inviato con Successo!',
    successDesc: 'Grazie! Il tuo ordine è stato registrato ed è in fase di preparazione. A breve riceverai una chiamata di conferma.',
    closeBtn: 'Chiudi',
    waitText: 'Attendere...',
  },
  EN: {
    step1Title: 'Your Information',
    namePlaceholder: 'Name',
    phonePlaceholder: 'Phone',
    addressPlaceholder: 'Delivery Address',
    verifyLoc: 'Verify Location',
    verifyingLoc: 'Verifying...',
    outOfRange: (dist: number, max: number) => `We are sorry, your location is ${dist.toFixed(1)} km away. We deliver up to ${max} km max.`,
    simLoc: 'Simulate location (Test)',
    continueBtn: 'Continue',
    step2Title: 'Payment Method',
    optPromptPay: 'PromptPay (QR Code)',
    optCash: 'Cash on delivery',
    uploadBtn: 'Upload receipt screenshot',
    submitBtn: 'CONFIRM AND SEND ORDER',
    uploadPromptBtn: 'UPLOAD RECEIPT TO PROCEED',
    backBtn: 'Go Back',
    successTitle: 'Order Submitted Successfully!',
    successDesc: 'Thank you! Your order has been recorded and is being prepared. You will receive a confirmation call shortly.',
    closeBtn: 'Close',
    waitText: 'Please wait...',
  },
  TH: {
    step1Title: 'ข้อมูลของคุณ',
    namePlaceholder: 'ชื่อ',
    phonePlaceholder: 'เบอร์โทรศัพท์',
    addressPlaceholder: 'ที่อยู่จัดส่ง',
    verifyLoc: 'ตรวจสอบตำแหน่ง',
    verifyingLoc: 'กำลังตรวจสอบ...',
    outOfRange: (dist: number, max: number) => `ขออภัย ตำแหน่งของคุณอยู่ห่างออกไป ${dist.toFixed(1)} กม. เราจัดส่งได้ไม่เกิน ${max} กม.`,
    simLoc: 'จำลองตำแหน่ง (ทดสอบ)',
    continueBtn: 'ดำเนินการต่อ',
    step2Title: 'วิธีการชำระเงิน',
    optPromptPay: 'PromptPay (QR Code)',
    optCash: 'เก็บเงินปลายทาง',
    uploadBtn: 'อัปโหลดภาพหน้าจอใบเสร็จ',
    submitBtn: 'ยืนยันและส่งคำสั่งซื้อ',
    uploadPromptBtn: 'อัปโหลดใบเสร็จเพื่อดำเนินการต่อ',
    backBtn: 'ย้อนกลับ',
    successTitle: 'ส่งคำสั่งซื้อสำเร็จแล้ว!',
    successDesc: 'ขอบคุณ! คำสั่งซื้อของคุณได้รับการบันทึกแล้วและกำลังอยู่ในขั้นตอนการเตรียมการ คุณจะได้รับสายยืนยันในไม่ช้า',
    closeBtn: 'ปิด',
    waitText: 'กรุณารอสักครู่...',
  },
  DE: {
    step1Title: 'Ihre Daten',
    namePlaceholder: 'Name',
    phonePlaceholder: 'Telefon',
    addressPlaceholder: 'Lieferadresse',
    verifyLoc: 'Standort verifizieren',
    verifyingLoc: 'Überprüfung...',
    outOfRange: (dist: number, max: number) => `Es tut uns leid, Ihr Standort ist ${dist.toFixed(1)} km entfernt. Wir liefern bis maximal ${max} km.`,
    simLoc: 'Standort simulieren (Test)',
    continueBtn: 'Weiter',
    step2Title: 'Zahlungsmethode',
    optPromptPay: 'PromptPay (QR-Code)',
    optCash: 'Barzahlung bei Lieferung',
    uploadBtn: 'Quittungs-Screenshot hochladen',
    submitBtn: 'BESTÄTIGEN UND SENDEN',
    uploadPromptBtn: 'QUITTUNG HOCHLADEN',
    backBtn: 'Zurück',
    successTitle: 'Bestellung erfolgreich gesendet!',
    successDesc: 'Vielen Dank! Ihre Bestellung wurde registriert und wird vorbereitet. Sie erhalten in Kürze einen Bestätigungsanruf.',
    closeBtn: 'Schließen',
    waitText: 'Bitte warten...',
  },
};

export default function CheckoutFlow({ onClose, onSuccess, lang }: Props) {
  const { items, getTotal, clearCart } = useCartStore();
  const {
    requestLocation,
    setSimulatedLocation,
    isLoading: locationLoading,
    distanceKm,
    maxRadiusKm,
    isDeliverable,
    error: locationError,
  } = useLocationStore();

  const total = getTotal();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const outOfRange = distanceKm !== null && !isDeliverable;
  const t = translations[lang];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let receiptUrl: string | null = null;

      if (paymentMethod === 'promptpay' && receiptFile) {
        const safeName = receiptFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${Date.now()}-${safeName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(uploadData.path);

        receiptUrl = urlData.publicUrl;
      }

      const orderData: Record<string, unknown> = {
        customer_name: name || 'Cliente',
        phone: phone || '0000000000',
        address: address || 'Nessun indirizzo',
        items,
        total,
        status: 'new',
        payment_method: paymentMethod,
        receipt_url: receiptUrl,
      };

      const { error } = await supabase.from('pizza_orders').insert([orderData]);
      if (error) throw error;

      clearCart();
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Errore invio: ' + (err instanceof Error ? err.message : 'Controlla database'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md p-6 border border-stone-300 text-stone-800 relative rounded-[2rem] shadow-2xl overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black tracking-tight text-stone-850 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.45rem' }}>
              {t.step1Title}
            </h2>
            
            <input
              className="w-full bg-stone-50 border border-stone-300 p-3 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all text-sm"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            
            <input
              className="w-full bg-stone-50 border border-stone-300 p-3 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all text-sm"
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            
            <textarea
              className="w-full bg-stone-50 border border-stone-300 p-3 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all text-sm h-24 resize-none"
              placeholder={t.addressPlaceholder}
              value={address}
              onChange={e => setAddress(e.target.value)}
            />

            <button
              type="button"
              onClick={requestLocation}
              className="w-full bg-stone-100 hover:bg-stone-200/80 border border-stone-300 p-2.5 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-850 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {locationLoading ? (
                <Loader2 size={15} className="animate-spin text-[#8B1E1E]" />
              ) : (
                <>
                  <MapPin size={14} className="text-[#8B1E1E]" />
                  <span>{locationLoading ? t.verifyingLoc : t.verifyLoc}</span>
                </>
              )}
            </button>

            {locationError && (
              <p className="text-amber-600 text-xs text-center font-medium">{locationError}</p>
            )}

            {outOfRange && (
              <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200 text-center">
                <p className="text-[#8B1E1E] text-xs leading-relaxed font-bold">
                  {t.outOfRange(distanceKm!, maxRadiusKm)}
                </p>
                <button
                  onClick={setSimulatedLocation}
                  className="text-[10px] text-red-800 font-extrabold underline mt-2 block mx-auto cursor-pointer"
                >
                  {t.simLoc}
                </button>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={outOfRange || !name || !phone || !address}
              className="w-full bg-[#8B1E1E] hover:bg-[#721818] text-white p-3.5 rounded-full font-bold transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none shadow-md hover:shadow-lg cursor-pointer duration-200 transform active:scale-95 text-xs tracking-wider uppercase mt-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t.continueBtn}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black tracking-tight text-stone-850 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.45rem' }}>
              {t.step2Title}
            </h2>
            
            <select
              className="w-full bg-stone-50 border border-stone-300 p-3 rounded-2xl text-stone-800 focus:outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all text-sm cursor-pointer"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="promptpay">{t.optPromptPay}</option>
              <option value="cash">{t.optCash}</option>
            </select>

            {paymentMethod === 'promptpay' && (
              <div className="space-y-3 pt-2">
                <div className="bg-white border border-stone-200 p-3.5 rounded-2xl shadow-sm max-w-[200px] mx-auto">
                  <img src={QR_URL} alt="QR PromptPay" className="w-full h-auto object-contain" />
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-stone-300 p-3 text-xs text-stone-500 font-semibold rounded-2xl hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-colors cursor-pointer bg-stone-50/50"
                >
                  {receiptFile ? receiptFile.name : t.uploadBtn}
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading || (paymentMethod === 'promptpay' && !receiptFile)}
                className={`w-full p-3.5 font-bold rounded-full text-xs tracking-wider uppercase transition-all duration-200 transform active:scale-95 shadow-md ${
                  paymentMethod === 'promptpay' && !receiptFile
                    ? 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed'
                    : 'bg-[#8B1E1E] hover:bg-[#721818] text-white hover:shadow-lg cursor-pointer'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {loading
                  ? t.waitText
                  : paymentMethod === 'promptpay' && !receiptFile
                    ? t.uploadPromptBtn
                    : t.submitBtn}
              </button>
              
              <button
                onClick={() => setStep(1)}
                className="w-full bg-stone-100 hover:bg-stone-200 p-2 text-xs text-stone-500 font-semibold mt-3 rounded-full cursor-pointer transition-all"
              >
                {t.backBtn}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6 space-y-4">
            <h2 className="text-2xl font-black text-emerald-600 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {t.successTitle}
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed max-w-xs mx-auto">
              {t.successDesc}
            </p>
            <button
              onClick={() => { clearCart(); onSuccess(); }}
              className="bg-[#8B1E1E] hover:bg-[#721818] text-white p-3.5 w-full mt-4 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-95 text-xs tracking-wider uppercase cursor-pointer"
            >
              {t.closeBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
