import React, { useState } from 'react';
import { Key, Check, Percent, Mail, Play, Globe, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { UniversalCheckoutModalDemo } from './UniversalCheckoutModalDemo';

export const PayPalTab: React.FC = () => {
  const { settings, updatePayPalConfig, saveSettings, saving, saveSuccess } = usePaymentsAdminStore();
  const config = settings.paypal_config;
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [directLinkAmount, setDirectLinkAmount] = useState<number>(3600);
  const [copiedLink, setCopiedLink] = useState(false);

  const directPaymentUrl = `https://sandbox.paypal.com/checkoutnow?token=PAYPAL-FP-${directLinkAmount}`;

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
        gateway="paypal"
        accommodationName="Jungle Villa (Koh Phayam)"
        totalAmount={12000}
        depositPercent={30}
        paypalSurcharge={config.surchargePercent || 10}
        receiverEmail={config.receiverEmail || 'payments@flowerpowerphayam.com'}
      />

      {/* Top Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
              <span className="font-black text-xl">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  PayPal (Metodo di Pagamento Parallelo)
                </h2>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    config.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {config.enabled ? 'Attivo' : 'Sospeso'}
                </span>
              </div>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                PayPal rimane sempre disponibile come metodo alternativo per gli ospiti che preferiscono pagare con il proprio saldo o carta internazionale. Puoi variare l'indirizzo di ricezione dei pagamenti in qualunque momento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsDemoOpen(true)}
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-stone-950" />
              <span>💳 Apri Checkout Carta (PayPal)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Payment Link Card for Customer */}
      <div className="bg-stone-900/90 border border-amber-500/40 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Link di Pagamento Diretto PayPal / Carta
              </h3>
              <p className="text-xs text-stone-400">
                Invia questo link all'ospite per completare il pagamento tramite il portale PayPal o carta internazionale.
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
              className="w-24 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500 text-right"
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
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copiato' : 'Copia Link'}
            </button>
            <a
              href={directPaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Apri Link di Pagamento
            </a>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          1. Account Beneficiario di Ricezione Fondi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Email PayPal Business / Account Ricevente
            </label>
            <input
              type="email"
              value={config.receiverEmail}
              onChange={(e) => updatePayPalConfig({ receiverEmail: e.target.value })}
              placeholder="es. pagamenti@flowerpowerphayam.com"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              I pagamenti diretti PayPal verranno accreditati su questo indirizzo.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              Commissione / Tariffa di Gestione (%)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              step="0.5"
              value={config.surchargePercent}
              onChange={(e) => updatePayPalConfig({ surchargePercent: Number(e.target.value) })}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Attualmente impostato al {config.surchargePercent}% (indicato chiaramente al cliente).
            </p>
          </div>
        </div>
      </div>

      {/* Advanced API REST (Optional for Smart Buttons) */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Key className="w-4 h-4" />
          2. Credenziali API PayPal REST (Opzionali per Checkout Diretto)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              PayPal Client ID
            </label>
            <input
              type="text"
              value={config.clientId}
              onChange={(e) => updatePayPalConfig({ clientId: e.target.value })}
              placeholder="AXX... (Client ID dall'app PayPal Developer)"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              PayPal Secret Key
            </label>
            <input
              type="password"
              value={config.clientSecret}
              onChange={(e) => updatePayPalConfig({ clientSecret: e.target.value })}
              placeholder="EXX... (Secret Key)"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-300 mb-1">Modalità PayPal</label>
          <div className="grid grid-cols-2 gap-2 max-w-md">
            <button
              type="button"
              onClick={() => updatePayPalConfig({ mode: 'sandbox' })}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                config.mode === 'sandbox'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                  : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
              }`}
            >
              🧪 PayPal Sandbox
            </button>
            <button
              type="button"
              onClick={() => updatePayPalConfig({ mode: 'live' })}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                config.mode === 'live'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
              }`}
            >
              ⚡ PayPal Live Production
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-800">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Impostazioni PayPal salvate!
            </span>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => saveSettings()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-extrabold shadow transition-all cursor-pointer"
          >
            {saving ? 'Salvataggio...' : 'Salva Configurazione PayPal'}
          </button>
        </div>
      </div>
    </div>
  );
};
