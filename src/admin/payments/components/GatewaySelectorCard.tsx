import React, { useState } from 'react';
import { CheckCircle2, Zap, CreditCard, QrCode, ExternalLink, Play } from 'lucide-react';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { PrimaryGateway } from '../types';
import { UniversalCheckoutModalDemo } from './UniversalCheckoutModalDemo';

export const GatewaySelectorCard: React.FC = () => {
  const { settings, updatePrimaryGateway, updatePayPalConfig, setActiveTab } = usePaymentsAdminStore();
  const [demoGateway, setDemoGateway] = useState<PrimaryGateway | 'paypal' | null>(null);

  const gateways: {
    id: PrimaryGateway;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    icon: React.ReactNode;
    description: string;
    features: string[];
    status: 'active' | 'ready' | 'pending';
  }[] = [
    {
      id: 'ksher',
      title: 'Ksher Payment Gateway',
      subtitle: 'Gateway Principale (Carte Internazionali & QR)',
      badge: 'Consigliato Default',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
      description: 'Soluzione primaria per incassi diretti con Carte di Credito Internazionali (Visa, Mastercard, JCB, UnionPay) e PromptPay QR.',
      features: ['Carte di Credito Internazionali', 'PromptPay QR Thailandese', 'Zero commissioni nascoste TH'],
      status: 'active'
    },
    {
      id: 'stripe',
      title: 'Stripe Global',
      subtitle: 'Attualmente collegato (Sandbox / Live)',
      badge: settings.stripe_config.target === 'TEST' ? 'Sandbox Mode' : 'Live Account',
      badgeColor: settings.stripe_config.target === 'TEST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: <CreditCard className="w-6 h-6 text-blue-400" />,
      description: 'Standard globale per carte di credito e checkout internazionale multi-valuta con Apple Pay e Google Pay.',
      features: ['Carte di Credito Globali', 'Apple Pay & Google Pay', 'Supporto Switch Account Multipli'],
      status: 'ready'
    },
    {
      id: 'omise',
      title: 'Omise Payments',
      subtitle: 'In fase di approvazione (Sandbox attivo)',
      badge: 'Sandbox Ready',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      description: 'Gateway moderno thailandese per carte di credito con 3D-Secure e PromptPay tokenizzato.',
      features: ['Tokenizzazione Carte Credito', '3D Secure 2.0 OTP', 'Pronto per Live Switch'],
      status: 'pending'
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
                    ? 'bg-stone-850 border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
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
                    <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center">
                      {gw.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${gw.badgeColor}`}
                    >
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
                      {isSelected ? 'Predefinito' : 'Imposta Predefinito'}
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

      {/* Parallel PayPal Card */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
              <span className="font-black text-lg">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  PayPal (Metodo Parallelo Stabile)
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    settings.paypal_config.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
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
              className="text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
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
