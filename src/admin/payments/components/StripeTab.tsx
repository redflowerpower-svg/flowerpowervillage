import React, { useState } from 'react';
import { CreditCard, Shield, Key, Globe, Check, Play, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { UniversalCheckoutModalDemo } from './UniversalCheckoutModalDemo';

export const StripeTab: React.FC = () => {
  const { settings, updateStripeConfig, saveSettings, saving, saveSuccess } = usePaymentsAdminStore();
  const config = settings.stripe_config;
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [directLinkAmount, setDirectLinkAmount] = useState<number>(3600);
  const [copiedLink, setCopiedLink] = useState(false);

  const directPaymentUrl = `https://checkout.stripe.com/pay/cs_live_${directLinkAmount}`;

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
        gateway="stripe"
        accommodationName="Jungle Villa (Koh Phayam)"
        totalAmount={12000}
        depositPercent={30}
      />

      {/* Header Info */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Configurazione Stripe Global
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Stripe SDK v2023+
                </span>
              </div>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Gestisci l'account Stripe utilizzato dal sito. Puoi alternare tra la Sandbox di test e i tuoi account live (Thailandia, Italia o Account personalizzato).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsDemoOpen(true)}
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>💳 Apri Checkout Carta (Stripe)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Payment Link Card for Customer */}
      <div className="bg-stone-900/90 border border-blue-500/40 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Link di Pagamento Diretto con Carta (Stripe Checkout Link)
              </h3>
              <p className="text-xs text-stone-400">
                Invia questo link al cliente per fargli inserire direttamente la propria carta di credito su pagina sicura Stripe.
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
              className="w-24 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500 text-right"
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
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copiato' : 'Copia Link'}
            </button>
            <a
              href={directPaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Apri Link di Pagamento
            </a>
          </div>
        </div>
      </div>

      {/* Target Selector */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          1. Profilo di Destinazione / Account Target
        </h3>
        <p className="text-xs text-stone-400">
          Scegli quale ambiente o account Stripe deve elaborare le sessioni di pagamento:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {[
            { id: 'TEST', name: 'Sandbox / Test Mode', desc: 'Modalità simulata sicura (chiavi sk_test / pk_test)', badge: 'Attuale' },
            { id: 'TH', name: 'Stripe Thailandia Live', desc: 'Account principale thailandese per valuta THB', badge: 'Live TH' },
            { id: 'IT', name: 'Stripe Italia Live', desc: 'Account aziendale europeo (EUR / SEPA / Carte)', badge: 'Live EU' },
            { id: 'CUSTOM', name: 'Account Personalizzato', desc: 'Inserisci manualmente chiavi API specifiche', badge: 'Custom' }
          ].map((t) => {
            const isSel = config.target === t.id;
            return (
              <div
                key={t.id}
                onClick={() => updateStripeConfig({ target: t.id as any })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-stone-850 border-blue-500 text-white ring-1 ring-blue-500/40 shadow-lg'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs">{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSel ? 'bg-blue-500/20 text-blue-300' : 'bg-stone-800 text-stone-400'}`}>
                    {t.badge}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Keys Configuration Box */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Key className="w-4 h-4" />
          2. Credenziali & Parametri Account
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Nome Descrittivo Account
            </label>
            <input
              type="text"
              value={config.accountName || ''}
              onChange={(e) => updateStripeConfig({ accountName: e.target.value })}
              placeholder="es. Flower Power Thailand Stripe"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Stripe Publishable Key (Frontend)
            </label>
            <input
              type="text"
              value={config.publishableKey || ''}
              onChange={(e) => updateStripeConfig({ publishableKey: e.target.value })}
              placeholder="pk_test_... oppure pk_live_..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Stripe Secret Key (Backend Protetto)
            </label>
            <input
              type="password"
              value={config.secretKey || ''}
              onChange={(e) => updateStripeConfig({ secretKey: e.target.value })}
              placeholder="sk_test_... oppure sk_live_..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Webhook Secret (whsec_...)
            </label>
            <input
              type="password"
              value={config.webhookSecret || ''}
              onChange={(e) => updateStripeConfig({ webhookSecret: e.target.value })}
              placeholder="whsec_..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl flex items-start gap-3 mt-4 text-xs text-stone-400">
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p>
            Se le chiavi manuali vengono lasciate vuote, il sistema utilizzerà automaticamente le variabili d'ambiente predefinite nel Vault di sicurezza (<code className="text-amber-400 font-mono">STRIPE_SECRET_KEY_{config.target}</code>).
          </p>
        </div>

        {/* Save Bar */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-800">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Impostazioni salvate con successo!
            </span>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => saveSettings()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-extrabold shadow transition-all cursor-pointer"
          >
            {saving ? 'Salvataggio in corso...' : 'Salva Configurazione Stripe'}
          </button>
        </div>
      </div>
    </div>
  );
};
