import React, { useState, useEffect } from 'react';
import { QrCode, CreditCard, Clock, CheckCircle2, Copy, ShieldCheck, Smartphone, RefreshCw, ExternalLink, Globe } from 'lucide-react';

interface KsherUserInterfacePreviewProps {
  amount?: number;
  merchantName?: string;
  appId?: string;
}

export const KsherUserInterfacePreview: React.FC<KsherUserInterfacePreviewProps> = ({
  amount = 1250,
  merchantName = 'Flower Power Village & Pizzeria',
  appId = 'mch39593'
}) => {
  // Default to 'card' (International Credit Cards)
  const [selectedChannel, setSelectedChannel] = useState<'promptpay' | 'card'>('card');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const directPaymentLink = `https://gateway.ksher.com/pay/card/${appId}/KSHER-39593-DEMO`;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyPromptPay = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(directPaymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto text-stone-100 font-sans">
      {/* Top Banner / Merchant Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
            Ksher Smart Checkout
          </span>
          <h4 className="text-sm font-black text-white">{merchantName}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 block">Totale da pagare</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
            ฿{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Direct Payment Link Action Card */}
      <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="text-left">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Link Pagamento Carta</span>
            <span className="text-[11px] text-stone-300 font-mono truncate block max-w-[200px] sm:max-w-[240px]">
              {directPaymentLink}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="Copia Link Pagamento"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copiato' : 'Copia'}
          </button>
          <a
            href={directPaymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="Apri Link Pagamento Cliente"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Apri
          </a>
        </div>
      </div>

      {/* Payment Channel Tabs (Card First) */}
      <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-stone-900 rounded-2xl border border-stone-800">
        <button
          type="button"
          onClick={() => setSelectedChannel('card')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedChannel === 'card'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Carte Internazionali (Default)
        </button>

        <button
          type="button"
          onClick={() => setSelectedChannel('promptpay')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedChannel === 'promptpay'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          PromptPay QR (Banche TH)
        </button>
      </div>

      {/* Credit Card Ksher Content (Primary) */}
      {selectedChannel === 'card' && (
        <div className="mt-5 space-y-3 text-left">
          {/* Card Brands Accepted */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 bg-stone-900/60 px-3 py-1.5 rounded-xl border border-stone-800">
            <span>Circuiti supportati:</span>
            <div className="flex items-center gap-2 font-mono font-bold text-stone-300 text-[10px]">
              <span className="text-blue-400">VISA</span>
              <span className="text-amber-400">Mastercard</span>
              <span className="text-emerald-400">JCB</span>
              <span className="text-red-400">UnionPay</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-300 mb-1">
              Numero Carta di Credito (Ksher Gateway)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="4000 1234 5678 9010"
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">CVV / CVC</label>
              <input
                type="password"
                placeholder="123"
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-300 mb-1">Titolare della Carta</label>
            <input
              type="text"
              placeholder="NOME E COGNOME"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              type="button"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Paga ฿{amount.toLocaleString('en-US')} con Carta Ksher
            </button>
            <a
              href={directPaymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-stone-850 hover:bg-stone-800 text-emerald-400 border border-emerald-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Link Diretto
            </a>
          </div>
        </div>
      )}

      {/* PromptPay Content */}
      {selectedChannel === 'promptpay' && (
        <div className="mt-5 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5" /> Scade tra: {formatTime(timeLeft)}
          </div>

          {/* QR Code Container */}
          <div className="relative inline-block bg-white p-4 rounded-3xl shadow-2xl border-4 border-emerald-500/30">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021229370016A000000677010111011300668123456785802TH530376454071250.005802TH6304ABCD"
              alt="PromptPay QR Code"
              className="w-44 h-44 mx-auto rounded-xl"
            />
            <div className="absolute inset-0 border-2 border-dashed border-emerald-600/30 rounded-2xl pointer-events-none m-2"></div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-stone-300 font-semibold flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Scansiona con App Bancaria TH (PromptPay)
            </p>
            <p className="text-[11px] text-stone-500">
              (K-Plus, SCB Easy, Krungthai NEXT, Bangkok Bank, TrueMoney)
            </p>
          </div>

          <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="text-left">
              <span className="text-[10px] text-stone-500 block">ID Transazione Ksher</span>
              <span className="font-mono text-stone-300 text-[11px]">KSHER-DEMO-998241</span>
            </div>
            <button
              type="button"
              onClick={handleCopyPromptPay}
              className="flex items-center gap-1 text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-700 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiato' : 'Copia ID'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Security Badges */}
      <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          3D-Secure 2.0 & PCI-DSS
        </span>
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Verifica Automatica Webhook
        </span>
      </div>
    </div>
  );
};
