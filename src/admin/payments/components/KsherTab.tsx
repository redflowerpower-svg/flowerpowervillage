import React, { useState } from 'react';
import { QrCode, Key, Check, Eye, EyeOff, Sparkles, Smartphone, CreditCard, Globe, Copy, CheckCircle2, ExternalLink, Play } from 'lucide-react';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { KsherUserInterfacePreview } from './KsherUserInterfacePreview';
import { UniversalCheckoutModalDemo } from './UniversalCheckoutModalDemo';

export const KsherTab: React.FC = () => {
  const { settings, updateKsherConfig, saveSettings, saving, saveSuccess } = usePaymentsAdminStore();
  const config = settings.ksher_config;
  const [showSecret, setShowSecret] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [directLinkAmount, setDirectLinkAmount] = useState<number>(3600);
  const [copiedLink, setCopiedLink] = useState(false);

  const directPaymentUrl = `https://gateway.ksher.com/pay/card/${config.appId || 'mch39593'}/KSHER-39593-${directLinkAmount}`;

  const handleCopyDirectLink = () => {
    navigator.clipboard?.writeText?.(directPaymentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      <UniversalCheckoutModalDemo
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        gateway="ksher"
        accommodationName="Jungle Villa (Koh Phayam)"
        totalAmount={12000}
        depositPercent={30}
      />

      {/* Top Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-inner">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Ksher Payment Gateway
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Gateway Principale (Carte & PromptPay)
                </span>
              </div>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Configurazione delle credenziali e dei link di pagamento per carte di credito internazionali (Visa, Mastercard, JCB) e PromptPay QR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsDemoOpen(true)}
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>💳 Apri Checkout Carta (Ksher)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {showPreview ? 'Nascondi Preview' : 'Mostra Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* Direct Payment Link Card for Customer */}
      <div className="bg-stone-900/90 border border-emerald-500/40 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Link di Pagamento Diretto con Carta (Ksher Hosted Link)
              </h3>
              <p className="text-xs text-stone-400">
                Invia questo link al cliente (o via email/WhatsApp/Telegram) per farlo pagare direttamente con carta di credito internazionale.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-stone-400 font-semibold">Importo:</span>
            <input
              type="number"
              min="10"
              step="100"
              value={directLinkAmount}
              onChange={(e) => setDirectLinkAmount(Number(e.target.value))}
              className="w-24 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-right"
            />
            <span className="text-xs font-mono font-bold text-stone-300">THB</span>
          </div>
        </div>

        <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <span className="font-mono text-stone-300 truncate max-w-xl text-[11px]">
            {directPaymentUrl}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyDirectLink}
              className="px-3 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-xl border border-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copiato' : 'Copia Link'}
            </button>
            <a
              href={directPaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Apri Link di Pagamento
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Settings on Left, Interactive Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Column */}
        <div className={showPreview ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
          {/* Credentials Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Key className="w-4 h-4" />
              1. Credenziali Ksher Merchant
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Nome Merchant Visibile al Cliente
                </label>
                <input
                  type="text"
                  value={config.merchantName}
                  onChange={(e) => updateKsherConfig({ merchantName: e.target.value })}
                  placeholder="Flower Power Koh Phayam"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Ksher App ID / Merchant ID
                </label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => updateKsherConfig({ appId: e.target.value })}
                  placeholder="mch_ksher_xxxxx"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Ksher Secret Key (MD5 / HMAC Signature)
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={config.secretKey}
                    onChange={(e) => updateKsherConfig({ secretKey: e.target.value })}
                    placeholder="Chiave segreta Ksher..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-white"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Modalità Operativa</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateKsherConfig({ mode: 'test' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      config.mode === 'test'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    🧪 Sandbox / Test Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => updateKsherConfig({ mode: 'live' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      config.mode === 'live'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    ⚡ Live Production Mode
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Channels Toggle */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              2. Canali di Pagamento Abilitati per Ksher
            </h3>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-emerald-500/30 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-emerald-400 block flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Carte di Credito Internazionali (Primario)
                  </span>
                  <span className="text-[11px] text-stone-400">Accetta Visa, Mastercard, JCB, UnionPay con 3D-Secure</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.supportCard}
                  onChange={(e) => updateKsherConfig({ supportCard: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-stone-950 rounded-2xl border border-stone-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" /> PromptPay QR Dinamico
                  </span>
                  <span className="text-[11px] text-stone-400">Genera QR bancario per ospiti con app thailandesi</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.supportPromptPay}
                  onChange={(e) => updateKsherConfig({ supportPromptPay: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Save Bar */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-800">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Salvato con successo!
                </span>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={() => saveSettings()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-extrabold shadow transition-all cursor-pointer"
              >
                {saving ? 'Salvataggio...' : 'Salva Configurazione Ksher'}
              </button>
            </div>
          </div>
        </div>

        {/* Live UX Preview Column */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Anteprima Interfaccia Carta Ksher
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Live Demo Mockup</span>
            </div>

            <KsherUserInterfacePreview
              amount={1250}
              merchantName={config.merchantName || 'Flower Power'}
              appId={config.appId || 'mch39593'}
            />
          </div>
        )}
      </div>
    </div>
  );
};
