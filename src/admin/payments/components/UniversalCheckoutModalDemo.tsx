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
  Hotel,
  Calendar,
  Users,
  RefreshCw,
  Zap,
  Globe,
  ExternalLink
} from 'lucide-react';
import { PrimaryGateway } from '../types';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { calculatePaymentTotal, PaymentMethod } from '../../../lib/paymentCalculations';

interface UniversalCheckoutModalDemoProps {
  isOpen: boolean;
  onClose: () => void;
  gateway: PrimaryGateway | 'paypal';
  accommodationName?: string;
  totalAmount?: number; // e.g. 12,000 THB
  depositPercent?: number; // 30%
  paypalSurcharge?: number; // e.g. 10%
  receiverEmail?: string;
}

export const UniversalCheckoutModalDemo: React.FC<UniversalCheckoutModalDemoProps> = ({
  isOpen,
  onClose,
  gateway,
  accommodationName = 'Jungle Villa (Koh Phayam)',
  totalAmount = 12000,
  depositPercent = 30,
  receiverEmail = 'payments@flowerpowerphayam.com'
}) => {
  const { settings } = usePaymentsAdminStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    gateway === 'paypal' ? 'paypal' : (gateway === 'stripe' ? 'stripe' : 'ksher')
  );
  // Default to 'card' (Priority to International Credit Cards)
  const [selectedChannel, setSelectedChannel] = useState<'promptpay' | 'card'>('card');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');

  const baseDeposit = Math.round((totalAmount * depositPercent) / 100);
  const pricing = calculatePaymentTotal(baseDeposit, selectedMethod, 'it');
  const finalDeposit = pricing.finalTotal;
  const balanceAmount = totalAmount - baseDeposit;

  const [liveSessionUrl, setLiveSessionUrl] = useState<string>('');
  const [liveQrCodeUrl, setLiveQrCodeUrl] = useState<string>('');
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(false);
  const [txId, setTxId] = useState<string>('');

  // Fetch real checkout session on modal open or channel switch
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingSession(true);

    fetch('/api/payments-admin?action=create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway,
        amount: finalDeposit,
        paymentChannel: selectedChannel,
        customerName: 'Ospite Test',
        customerEmail: receiverEmail
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setIsLoadingSession(false);
        if (data.success) {
          if (data.checkoutUrl) setLiveSessionUrl(data.checkoutUrl);
          if (data.qrCodeUrl) setLiveQrCodeUrl(data.qrCodeUrl);
          if (data.transactionId) setTxId(data.transactionId);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsLoadingSession(false);
        console.warn('Real checkout creation notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, gateway, selectedChannel, finalDeposit, receiverEmail, settings]);

  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);

  const directPaymentLink = liveSessionUrl || '';

  useEffect(() => {
    if (!isOpen) {
      setPaymentStatus('pending');
      setTimeLeft(600);
      setSelectedChannel('card');
      setGatewayError(null);
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
    if (directPaymentLink) {
      navigator.clipboard?.writeText?.(directPaymentLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleProceedToRealPayment = async () => {
    setGatewayError(null);
    if (liveSessionUrl) {
      window.open(liveSessionUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Open window synchronously on user click to bypass popup blockers
    const paymentWindow = window.open('about:blank', '_blank');

    setIsProcessingCheckout(true);
    try {
      const res = await fetch('/api/payments-admin?action=create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway,
          amount: finalDeposit,
          paymentChannel: selectedChannel,
          customerName: 'Ospite Test',
          customerEmail: receiverEmail
        })
      });
      const data = await res.json();
      setIsProcessingCheckout(false);

      if (data.checkoutUrl) {
        setLiveSessionUrl(data.checkoutUrl);
        if (paymentWindow) {
          paymentWindow.location.href = data.checkoutUrl;
        } else {
          window.location.href = data.checkoutUrl;
        }
      } else {
        if (paymentWindow) paymentWindow.close();
        setGatewayError(
          data.message ||
          'Il gateway non ha restituito un URL di pagamento. Verifica la configurazione del gateway.'
        );
      }
    } catch (err: any) {
      if (paymentWindow) paymentWindow.close();
      setIsProcessingCheckout(false);
      setGatewayError(`Errore di comunicazione con il gateway: ${err.message}`);
    }
  };

  const handleSimulateWebhookSuccess = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
    }, 1200);
  };

  const getGatewayInfo = () => {
    switch (gateway) {
      case 'ksher':
        return {
          title: 'Ksher Payment Gateway (Carta Internazionale)',
          badge: 'Ksher THB (Live mch39593)',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          accentColor: 'text-emerald-400',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500'
        };
      case 'stripe':
        return {
          title: 'Stripe Checkout Experience (Carta di Credito)',
          badge: 'Stripe Global Elements',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          accentColor: 'text-blue-400',
          btnBg: 'bg-blue-600 hover:bg-blue-500'
        };
      case 'omise':
        return {
          title: 'Omise Payments (Carta di Credito Sandbox)',
          badge: 'Omise 3D-Secure',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          accentColor: 'text-purple-400',
          btnBg: 'bg-purple-600 hover:bg-purple-500'
        };
      case 'paypal':
        return {
          title: 'PayPal Smart Checkout (Wallet & Carta)',
          badge: 'PayPal Standard',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          accentColor: 'text-amber-400',
          btnBg: 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black'
        };
    }
  };

  const gwInfo = getGatewayInfo();

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
                <h3 className="text-sm font-black text-white">{gwInfo.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${gwInfo.badgeColor}`}>
                  {gwInfo.badge}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Flower Power Resort (Koh Phayam, Thailand)</p>
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
                  La caparra del 30% (฿{finalDeposit.toLocaleString()} THB) è stata elaborata tramite <strong className="text-white uppercase">{gateway}</strong>. La prenotazione è confermata.
                </p>
              </div>

              {/* Booking Voucher Summary */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span className="text-stone-400">Codice Prenotazione:</span>
                  <span className="font-mono font-bold text-amber-400">FP-{gateway.toUpperCase()}-77219</span>
                </div>
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span className="text-stone-400">Gateway Utilizzato:</span>
                  <span className="font-bold text-white uppercase">{gateway}</span>
                </div>
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span className="text-stone-400">Alloggio:</span>
                  <span className="font-bold text-white">{accommodationName}</span>
                </div>
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span className="text-stone-400">Caparra Pagata Oggi:</span>
                  <span className="font-mono font-bold text-emerald-400">฿{finalDeposit.toLocaleString()} THB</span>
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
              {/* Order Summary Box with VAT 7% and Total Amount Payable */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                      Total Amount Payable / Totale da Pagare
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      ฿{finalDeposit.toLocaleString('it-IT', { minimumFractionDigits: 2 })} <span className="text-xs text-stone-400 font-sans">THB</span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium mt-0.5">
                      {pricing.disclaimer}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">
                      Saldo al check-in: ฿{balanceAmount.toLocaleString()} THB
                    </div>
                  </div>
                </div>

                {/* Method Switcher Bar */}
                <div className="pt-2 border-t border-stone-850 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-stone-400">Metodo di Pagamento:</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('bank_transfer'); setGatewayError(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMethod === 'bank_transfer'
                        ? 'bg-stone-200 text-stone-950 shadow font-black'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    🏦 Bonifico / Contanti
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('ksher'); setGatewayError(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMethod === 'ksher'
                        ? 'bg-emerald-600 text-white shadow font-black'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    🟢 Cash (Ksher)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('paypal'); setGatewayError(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMethod === 'paypal'
                        ? 'bg-amber-500 text-stone-950 shadow font-black'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    🟡 PayPal
                  </button>
                </div>
              </div>

              {/* DIRECT PAYMENT LINK ACTION BAR (For all gateways) */}
              <div className="p-3 bg-stone-950/80 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Link Diretto Pagamento con Carta
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

              {/* GATEWAY NOTICE / ERROR BANNER */}
              {gatewayError && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-300 block">Stato Comunicazione Gateway:</span>
                    <p className="text-[11px] text-stone-300 leading-relaxed">{gatewayError}</p>
                  </div>
                </div>
              )}

              {/* 1. BANK TRANSFER FLOW */}
              {selectedMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-300 font-bold border-b border-stone-850 pb-2">
                      <span>Banca di Ricezione:</span>
                      <span className="text-emerald-400 font-mono">Kasikorn Bank (KBank) / SCB</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-850 pb-2">
                      <span className="text-stone-400">Intestatario Conto:</span>
                      <span className="font-bold text-white">Flower Power Village Co., Ltd.</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-850 pb-2">
                      <span className="text-stone-400">Numero di Conto (THB):</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">081-2-34567-8</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-stone-400">Totale Esatto da Bonificare:</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">฿{finalDeposit.toLocaleString()} THB</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                    Effettua il bonifico dell'importo esatto e invia la contabile o ricevuta via WhatsApp/Telegram per la conferma immediata.
                  </p>

                  <button
                    type="button"
                    onClick={handleSimulateWebhookSuccess}
                    className="w-full py-3.5 bg-stone-100 hover:bg-white text-stone-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Conferma Pagamento Bonifico (฿{finalDeposit.toLocaleString()} THB)
                  </button>
                </div>
              )}

              {/* 2. KSHER FLOW */}
              {selectedMethod === 'ksher' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-950 rounded-2xl border border-stone-800">
                    <button
                      type="button"
                      onClick={() => { setSelectedChannel('card'); setGatewayError(null); }}
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
                      onClick={() => { setSelectedChannel('promptpay'); setGatewayError(null); }}
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

                  {selectedChannel === 'card' ? (
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

                      <button
                        type="button"
                        disabled={isProcessingCheckout || isLoadingSession}
                        onClick={handleProceedToRealPayment}
                        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isProcessingCheckout || isLoadingSession ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Connessione a Cash (Ksher)...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            Procedi al Pagamento Reale Cash (฿{finalDeposit.toLocaleString()} THB)
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 pt-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                        <Clock className="w-3.5 h-3.5" /> Scadenza QR: {formatTime(timeLeft)}
                      </div>

                      <div className="relative inline-block bg-white p-4 rounded-3xl shadow-2xl border-4 border-emerald-500/40">
                        <img
                          src={liveQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=00020101021229370016A000000677010111011300668123456785802TH53037645407${finalDeposit}.005802TH6304ABCD`}
                          alt="Ksher PromptPay QR"
                          className="w-44 h-44 mx-auto rounded-xl"
                        />
                        <div className="absolute inset-0 border-2 border-dashed border-emerald-600/30 rounded-2xl pointer-events-none m-2"></div>
                      </div>

                      <p className="text-xs text-stone-200 font-bold flex items-center justify-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        Inquadra con app bancaria per pagare ฿{finalDeposit.toLocaleString()} (Ksher mch39593)
                      </p>

                      <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-between text-xs">
                        <div className="text-left">
                          <span className="text-[10px] text-stone-500 block">ID Transazione Ksher RSA</span>
                          <span className="font-mono text-stone-300 text-[11px]">{txId || 'KSHER-39593'}</span>
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
                </div>
              )}

              {/* 3. PAYPAL FLOW */}
              {selectedMethod === 'paypal' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-2xl space-y-2 text-xs text-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-amber-400" />
                        Account di Ricezione Fondi:
                      </span>
                      <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                        {receiverEmail}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Il cliente effettua il checkout con saldo PayPal o inserisce direttamente la propria carta di credito internazionale.
                    </p>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleProceedToRealPayment}
                      className="w-full py-3.5 bg-[#FFC439] hover:bg-[#F2BA36] text-stone-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span className="font-black italic text-base">Pay</span>
                      <span className="font-black italic text-base text-[#003087]">Pal</span>
                      <span className="text-xs font-bold text-stone-800 ml-1">
                        / Carta Internazionale (฿{finalDeposit.toLocaleString()} THB)
                      </span>
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
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulatore Gateway: prova la conferma automatica dell'addebito</span>
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
