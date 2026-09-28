import React, { useState } from 'react';
import { CheckCircle2, Zap, CreditCard, QrCode } from 'lucide-react';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { PrimaryGateway, PromptPayProvider } from '../types';
import { UniversalCheckoutModalDemo } from './UniversalCheckoutModalDemo';

export const GatewaySelectorCard: React.FC = () => {
  const { settings, updatePrimaryGateway, updatePromptPayProvider, updatePayPalConfig, saveSettings, saving, saveSuccess, setActiveTab } = usePaymentsAdminStore();
  const [demoGateway, setDemoGateway] = useState<PrimaryGateway | 'paypal' | null>(null);

  const gateways: {
    id: PrimaryGateway;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    iconBg: string;
    icon: React.ReactNode;
    description: string;
    features: string[];
    status: 'active' | 'ready' | 'pending';
    ringColor: string;
    selectedBg: string;
  }[] = [
    {
      id: 'ksher',
      title: 'Ksher Pay',
      subtitle: 'Gateway Principale (Carte Internazionali)',
      badge: 'Consigliato Default',
      badgeColor: 'bg-[#f4a0a0]/10 text-[#e87c7c] border-[#e87c7c]/40',
      iconBg: 'bg-[#fff0f0] border-[#e87c7c]/30',
      icon: <CreditCard className="w-6 h-6" style={{ color: '#e87c7c' }} />,
      description: 'Gateway per incassi con Carte di Credito Internazionali (Visa, Mastercard, JCB, UnionPay). Separato dal sistema QR PromptPay KBank.',
      features: ['Carte di Credito Internazionali', 'Visa / Mastercard / JCB / UnionPay', 'Zero commissioni nascoste TH'],
      status: 'active',
      ringColor: 'ring-[#e87c7c]/40 border-[#e87c7c]/70 shadow-[#e87c7c]/10',
      selectedBg: 'bg-[#fff5f5]/5'
    },
    {
      id: 'omise',
      title: 'Omise Payments',
      subtitle: 'In fase di approvazione (Sandbox attivo)',
      badge: 'Sandbox Ready',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      iconBg: 'bg-sky-950/60 border-sky-800/40',
      icon: <Zap className="w-6 h-6 text-sky-400" />,
      description: 'Gateway moderno thailandese con 3D-Secure, PromptPay tokenizzato e conferma automatica dei pagamenti.',
      features: ['Tokenizzazione Carte Credito', '3D Secure 2.0 OTP', 'PromptPay Conferma Automatica'],
      status: 'pending',
      ringColor: 'ring-sky-500/40 border-sky-500/70 shadow-sky-500/10',
      selectedBg: 'bg-sky-950/10'
    },
    {
      id: 'stripe',
      title: 'Stripe Global',
      subtitle: 'Attualmente collegato (Sandbox / Live)',
      badge: settings.stripe_config.target === 'TEST' ? 'Sandbox Mode' : 'Live Account',
      badgeColor: settings.stripe_config.target === 'TEST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      iconBg: 'bg-stone-900 border-stone-800',
      icon: <CreditCard className="w-6 h-6 text-blue-400" />,
      description: 'Standard globale per carte di credito e checkout internazionale multi-valuta con Apple Pay e Google Pay.',
      features: ['Carte di Credito Globali', 'Apple Pay & Google Pay', 'Supporto Switch Account Multipli'],
      status: 'ready',
      ringColor: 'ring-blue-500/40 border-blue-500/50 shadow-blue-500/10',
      selectedBg: 'bg-blue-950/10'
    }
  ];

  return (
    <div className="space-y-6">
      {demoGateway && (
        <UniversalCheckoutModalDemo
          isOpen={Boolean(demoGateway)}
          onClose={() => setDemoGateway(null)}
          gateway={demoGateway}
          accommodationName="Jungle Villa (Koh Phayam)"
          totalAmount={12000}
          depositPercent={30}
          paypalSurcharge={settings.paypal_config.surchargePercent || 10}
          receiverEmail={settings.paypal_config.receiverEmail || 'payments@flowerpowerphayam.com'}
        />
      )}

      {/* Primary Gateway Switcher Box */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              Selettore Gateway Primario
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Scegli il Gateway Primario di Incasso
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-1">
              Seleziona quale servizio riceverà i pagamenti con carta di credito o PromptPay dai clienti.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 px-4 py-2 rounded-2xl border border-stone-800 text-xs font-mono text-stone-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Attivo Ora:{' '}
            <strong className="text-emerald-400 uppercase font-black">
              {settings.active_primary_gateway}
            </strong>
          </div>
        </div>

        {/* 3 Gateway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {gateways.map((gw) => {
            const isSelected = settings.active_primary_gateway === gw.id;
            return (
              <div
                key={gw.id}
                onClick={() => updatePrimaryGateway(gw.id)}
                className={`relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${gw.selectedBg} ${gw.ringColor} shadow-lg ring-1`
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    In Uso (Predefinito)
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${gw.iconBg}`}>
                      {gw.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${gw.badgeColor}`}>
                      {gw.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white">{gw.title}</h3>
                  <p className="text-stone-400 text-xs mt-1 leading-snug">{gw.subtitle}</p>
                  <p className="text-stone-500 text-[11px] mt-2.5 leading-relaxed">{gw.description}</p>

                  <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-1.5">
                    {gw.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(gw.id);
                      }}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                    >
                      ⚙️ Configura Parametri
                    </button>

                    <button
                      type="button"
                      onClick={() => updatePrimaryGateway(gw.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700'
                      }`}
                    >
                      {isSelected ? '✓ Predefinito' : 'Imposta Predefinito'}
                    </button>
                  </div>

                  {/* Direct Card Payment Link Test Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDemoGateway(gw.id);
                    }}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-750 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>🔗 Apri Link Pagamento Carta</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PromptPay Provider Selector */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-extrabold uppercase tracking-wider mb-2">
              <QrCode className="w-3.5 h-3.5" />
              Selettore QR PromptPay
            </div>
            <h2 className="text-xl font-black text-white">Gateway PromptPay Attivo</h2>
            <p className="text-stone-400 text-xs mt-1">
              Scegli quale sistema genera il QR PromptPay mostrato ai clienti durante il checkout. KBank (Kasikorn) richiede conferma manuale con upload ricevuta; Omise conferma automaticamente.
            </p>
          </div>
          <button
            type="button"
            id="save-promptpay-provider-btn"
            onClick={() => saveSettings()}
            disabled={saving}
            className={`text-xs font-bold px-5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
              saveSuccess
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-400'
            }`}
          >
            {saving ? '⏳ Salvataggio...' : saveSuccess ? '✅ Salvato!' : '💾 Salva Impostazione'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          {/* KBank PromptPay Option */}
          <div
            id="promptpay-select-kbank"
            onClick={() => updatePromptPayProvider('kbank')}
            className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 ${
              settings.active_promptpay_provider === 'kbank' || settings.active_promptpay_provider === 'ksher'
                ? 'border-[#e87c7c] bg-[#fff0f0]/5 ring-1 ring-[#e87c7c]/30 shadow-lg shadow-[#e87c7c]/10'
                : 'border-stone-800 bg-stone-950/60 hover:border-[#e87c7c]/40'
            }`}
          >
            {(settings.active_promptpay_provider === 'kbank' || settings.active_promptpay_provider === 'ksher') && (
              <div className="absolute -top-2.5 right-4 bg-[#e87c7c] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Attivo Ora
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff0f0]/10 border border-[#e87c7c]/30 flex items-center justify-center">
                <QrCode className="w-5 h-5" style={{ color: '#e87c7c' }} />
              </div>
              <div>
                <p className="text-sm font-black text-white">KBank — Kasikorn Bank (K-Shop)</p>
                <p className="text-[11px] text-stone-400">QR statico K-Shop con upload ricevuta manuale</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
                <CheckCircle2 className="w-3 h-3 text-[#e87c7c] flex-shrink-0" />
                <span>QR PromptPay KBank (K-Shop / Kasikorn)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
                <CheckCircle2 className="w-3 h-3 text-[#e87c7c] flex-shrink-0" />
                <span>Cliente inserisce importo e carica slip</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                <span className="text-amber-400">⚠️</span>
                <span>Conferma manuale obbligatoria</span>
              </div>
            </div>
            <div className={`w-full py-2 rounded-xl text-xs font-bold text-center border transition-all ${
              settings.active_promptpay_provider === 'kbank' || settings.active_promptpay_provider === 'ksher'
                ? 'bg-[#e87c7c]/20 text-[#e87c7c] border-[#e87c7c]/40'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-[#e87c7c]/30 hover:text-[#f4a0a0]'
            }`}>
              {settings.active_promptpay_provider === 'kbank' || settings.active_promptpay_provider === 'ksher' ? '✓ PromptPay KBank Selezionato' : 'Seleziona KBank PromptPay'}
            </div>
          </div>

          {/* Omise PromptPay Option */}
          <div
            id="promptpay-select-omise"
            onClick={() => updatePromptPayProvider('omise')}
            className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 ${
              settings.active_promptpay_provider === 'omise'
                ? 'border-sky-500 bg-sky-950/10 ring-1 ring-sky-500/30 shadow-lg shadow-sky-500/10'
                : 'border-stone-800 bg-stone-950/60 hover:border-sky-500/40'
            }`}
          >
            {settings.active_promptpay_provider === 'omise' && (
              <div className="absolute -top-2.5 right-4 bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Attivo Ora
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Omise PromptPay</p>
                <p className="text-[11px] text-stone-400">QR dinamico con conferma automatica</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
                <CheckCircle2 className="w-3 h-3 text-sky-400 flex-shrink-0" />
                <span>QR tokenizzato via API Omise</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
                <CheckCircle2 className="w-3 h-3 text-sky-400 flex-shrink-0" />
                <span>Nessun upload ricevuta necessario</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>Conferma automatica al pagamento</span>
              </div>
            </div>
            <div className={`w-full py-2 rounded-xl text-xs font-bold text-center border transition-all ${
              settings.active_promptpay_provider === 'omise'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-sky-500/30 hover:text-sky-300'
            }`}>
              {settings.active_promptpay_provider === 'omise' ? '✓ PromptPay Omise Selezionato' : 'Seleziona Omise PromptPay'}
            </div>
          </div>
        </div>
      </div>

      {/* Parallel PayPal Card */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#003087]/30 border border-[#003087]/60 flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="font-black text-lg" style={{ color: '#009cde' }}>P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  PayPal <span className="text-[11px] font-semibold text-stone-400">(Metodo Parallelo Stabile)</span>
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    settings.paypal_config.enabled
                      ? 'bg-[#003087]/20 text-[#009cde] border-[#003087]/40'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {settings.paypal_config.enabled ? 'Attivo' : 'Disattivato'}
                </span>
              </div>
              <p className="text-stone-400 text-xs mt-1">
                Offerto come opzione aggiuntiva al cliente finale. Riceve i fondi sull'account:{' '}
                <span className="font-mono text-amber-400 font-bold">
                  {settings.paypal_config.receiverEmail || 'Non configurato'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setDemoGateway('paypal')}
              className="text-xs font-bold bg-[#003087]/10 hover:bg-[#003087]/20 border border-[#003087]/30 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              style={{ color: '#009cde' }}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>🔗 Link Pagamento PayPal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paypal')}
              className="text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              ⚙️ Parametri
            </button>
            <button
              type="button"
              onClick={() =>
                updatePayPalConfig({ enabled: !settings.paypal_config.enabled })
              }
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border cursor-pointer ${
                settings.paypal_config.enabled
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
              }`}
            >
              {settings.paypal_config.enabled ? 'Sospendi' : 'Abilita'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
