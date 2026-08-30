import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CreditCard,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Copy,
  Sparkles,
  Hotel,
  Calendar,
  Users,
  RefreshCw,
  ExternalLink,
  Globe
} from 'lucide-react';

interface KsherCheckoutModalDemoProps {
  isOpen: boolean;
  onClose: () => void;
  accommodationName?: string;
  totalAmount?: number; // e.g. 12,000 THB
  depositPercent?: number; // 30%
}

export const KsherCheckoutModalDemo: React.FC<KsherCheckoutModalDemoProps> = ({
  isOpen,
  onClose,
  accommodationName = 'Jungle Villa (Koh Phayam)',
  totalAmount = 12000,
  depositPercent = 30
}) => {
  // Default to 'card' (Priority to International Credit Cards)
  const [selectedChannel, setSelectedChannel] = useState<'promptpay' | 'card'>('card');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');

  const depositAmount = Math.round((totalAmount * depositPercent) / 100);
  const balanceAmount = totalAmount - depositAmount;
  const directPaymentLink = `https://gateway.ksher.com/pay/card/mch39593/KSHER-39593-${depositAmount}`;

  useEffect(() => {
    if (!isOpen) {
      setPaymentStatus('pending');
      setTimeLeft(600);
      setSelectedChannel('card');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(directPaymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulateWebhookSuccess = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
              FP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Flower Power Resort Checkout</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ksher Gateway (Carte Internazionali)
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Koh Phayam Island, Thailand</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-850 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {paymentStatus === 'success' ? (
            /* SUCCESS STATE */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-white">Pagamento Ricevuto con Successo!</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  La caparra del 30% (฿{depositAmount.toLocaleString()} THB) è stata elaborata istantaneamente da Ksher. La prenotazione è confermata.
                </p>
              </div>

              {/* Booking Voucher Summary */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span className="text-stone-400">Codice Prenotazione:</span>
                  <span className="font-mono font-bold text-amber-400">FP-KSHER-99824</span>
                </div>
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span className="text-stone-400">Alloggio:</span>
                  <span className="font-bold text-white">{accommodationName}</span>
                </div>
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span className="text-stone-400">Caparra Pagata Oggi:</span>
                  <span className="font-mono font-bold text-emerald-400">฿{depositAmount.toLocaleString()} THB</span>
                </div>
                <div className="flex justify-between pt-1 text-stone-400">
                  <span>Saldo al Check-in:</span>
                  <span className="font-mono text-stone-300">฿{balanceAmount.toLocaleString()} THB</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('pending')}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
                >
                  Riprova Simulazione
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow cursor-pointer"
                >
                  Chiudi Schermata
                </button>
              </div>
            </div>
          ) : (
            /* PENDING CHECKOUT STATE */
            <>
              {/* Order Summary Box */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <Hotel className="w-3.5 h-3.5" />
                    {accommodationName}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-500" /> 10 Feb - 15 Feb (5 Notti)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-stone-500" /> 2 Ospiti
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                    Caparra Richiesta (30%)
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    ฿{depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Saldo all'arrivo: ฿{balanceAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Direct Payment Link Action Bar */}
              <div className="p-3 bg-stone-950/80 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Link Diretto Pagamento Ksher Card
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono truncate block">
                      {directPaymentLink}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-xl border border-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copiato' : 'Copia Link'}
                  </button>
                  <a
                    href={directPaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Apri Pagamento
                  </a>
                </div>
              </div>

              {/* Payment Channel Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-950 rounded-2xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('card')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedChannel === 'card'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Carta di Credito (Default)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('promptpay')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedChannel === 'promptpay'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  PromptPay QR (Banche TH)
                </button>
              </div>

              {/* Credit Card View */}
              {selectedChannel === 'card' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
                    <span>Circuiti Internazionali:</span>
                    <div className="flex items-center gap-2 font-mono font-bold text-stone-300 text-[10px]">
                      <span className="text-blue-400">VISA</span>
                      <span className="text-amber-400">Mastercard</span>
                      <span className="text-emerald-400">JCB</span>
                      <span className="text-red-400">UnionPay</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-300 mb-1">
                      Numero di Carta
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                      />
                      <CreditCard className="w-4 h-4 text-stone-500 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">Scadenza</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        placeholder="123"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-300 mb-1">
                      Titolare della Carta
                    </label>
                    <input
                      type="text"
                      placeholder="NOME COGNOME"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateWebhookSuccess}
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Paga ฿{depositAmount.toLocaleString()} THB con Carta Ksher
                  </button>
                </div>
              )}

              {/* PromptPay View */}
              {selectedChannel === 'promptpay' && (
                <div className="text-center space-y-4 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" /> Scadenza QR: {formatTime(timeLeft)}
                  </div>

                  {/* QR Box */}
                  <div className="relative inline-block bg-white p-4 rounded-3xl shadow-2xl border-4 border-emerald-500/40">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=00020101021229370016A000000677010111011300668123456785802TH53037645407${depositAmount}.005802TH6304ABCD`}
                      alt="Ksher PromptPay QR"
                      className="w-44 h-44 mx-auto rounded-xl"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-emerald-600/30 rounded-2xl pointer-events-none m-2"></div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-stone-200 font-bold flex items-center justify-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      Inquadra con la tua App Bancaria per pagare ฿{depositAmount.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Supporta tutte le banche tailandesi (K-Plus, SCB Easy, Krungthai, Bangkok Bank, TrueMoney)
                    </p>
                  </div>

                  <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-between text-xs">
                    <div className="text-left">
                      <span className="text-[10px] text-stone-500 block">ID Transazione Ksher</span>
                      <span className="font-mono text-stone-300 text-[11px]">KSHER-DEMO-39593</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[11px] bg-stone-850 hover:bg-stone-800 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-700 cursor-pointer"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiato' : 'Copia'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer / Test Lab Controller */}
        {paymentStatus !== 'success' && (
          <div className="p-4 bg-stone-950/90 border-t border-stone-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pannello Test Lab: simula la ricezione del bonifico / webhook</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={paymentStatus === 'processing'}
                onClick={handleSimulateWebhookSuccess}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifica Transazione...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Simula Pagamento Ricevuto (Successo)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
