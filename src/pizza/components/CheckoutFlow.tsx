import { useState, useRef } from 'react';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const QR_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/qr_promptpay.jpg`;

export default function CheckoutFlow({ onClose, onSuccess }: Props) {
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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-stone-900 w-full max-w-md p-6 border border-stone-800 text-white relative rounded-lg shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X size={20} /></button>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-light">I Tuoi Dati</h2>
            <input className="w-full bg-stone-800 p-3 rounded" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
            <input className="w-full bg-stone-800 p-3 rounded" placeholder="Telefono" value={phone} onChange={e => setPhone(e.target.value)} />
            <textarea className="w-full bg-stone-800 p-3 rounded" placeholder="Indirizzo" value={address} onChange={e => setAddress(e.target.value)} />

            <button type="button" onClick={requestLocation} className="w-full bg-stone-800 p-2 text-sm flex items-center justify-center gap-2 hover:bg-stone-700">
              {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <><MapPin size={16} /> Verifica Posizione</>}
            </button>

            {locationError && (
              <p className="text-amber-400 text-xs text-center">{locationError}</p>
            )}

            {outOfRange && (
              <div className="bg-red-900/50 p-3 rounded border border-red-700 text-center">
                <p className="text-red-200 text-sm font-bold">
                  Siamo spiacenti, la tua posizione è a {distanceKm!.toFixed(1)} km.
                  Consegniamo fino a un massimo di {maxRadiusKm} km.
                </p>
                <button onClick={setSimulatedLocation} className="text-[10px] text-red-400 underline mt-2">
                  Simula posizione (Test)
                </button>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={outOfRange}
              className="w-full bg-red-700 p-3 rounded font-bold disabled:bg-stone-800 disabled:text-stone-600 transition-all"
            >
              Continua
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-light">Pagamento</h2>
            <select className="w-full bg-stone-800 p-3 rounded" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="promptpay">PromptPay (QR)</option>
              <option value="cash">Contanti alla consegna</option>
            </select>

            {paymentMethod === 'promptpay' && (
              <div className="space-y-3">
                <img src={QR_URL} alt="QR PromptPay" className="w-48 h-48 mx-auto object-contain bg-white p-2 rounded" />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed p-2 text-xs hover:border-white transition-colors"
                >
                  {receiptFile ? receiptFile.name : 'Carica ricevuta'}
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || (paymentMethod === 'promptpay' && !receiptFile)}
              className={`w-full p-3 font-bold rounded transition-colors ${
                paymentMethod === 'promptpay' && !receiptFile
                  ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
                  : 'bg-green-700 text-white hover:bg-green-600'
              }`}
            >
              {loading
                ? 'Attendere...'
                : paymentMethod === 'promptpay' && !receiptFile
                  ? 'CARICA RICEVUTA PER CONFERMARE'
                  : 'CONFERMA E INVIA'}
            </button>
            <button onClick={() => setStep(1)} className="w-full bg-stone-800 p-2 text-xs text-stone-400 mt-2 rounded">
              Torna indietro
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <h2 className="text-xl">Ordine Inviato!</h2>
            <button onClick={() => { clearCart(); onSuccess(); }} className="bg-stone-700 p-3 w-full mt-4 rounded">
              Chiudi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
