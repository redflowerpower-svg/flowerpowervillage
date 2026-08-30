import React, { useState } from 'react';
import { Zap, Key, Shield, Check, Eye, EyeOff, Sparkles, Play, Globe, Copy, CheckCircle2, ExternalLink, CreditCard } from 'lucide-react';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { UniversalCheckoutModalDemo } from './UniversalCheckoutModalDemo';

export const OmiseTab: React.FC = () => {
  const { settings, updateOmiseConfig, saveSettings, saving, saveSuccess } = usePaymentsAdminStore();
  const config = settings.omise_config;
  const [showSecret, setShowSecret] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [directLinkAmount, setDirectLinkAmount] = useState<number>(3600);
  const [copiedLink, setCopiedLink] = useState(false);

  const directPaymentUrl = `https://pay.omise.co/charges/chrg_test_${directLinkAmount}`;

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
        gateway="omise"
        accommodationName="Jungle Villa (Koh Phayam)"
        totalAmount={12000}
        depositPercent={30}
      />

      {/* Top Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 flex-shrink-0 shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Omise Payment Gateway
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  In Approvazione • Sandbox Attivo
                </span>
              </div>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Gateway avanzato per carte di credito e PromptPay thailandese. Attualmente puoi testare l'integrazione con le chiavi di Sandbox (pkey_test / skey_test) e passare a Live con 1 clic all'approvazione del conto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsDemoOpen(true)}
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>💳 Apri Checkout Carta (Omise)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Payment Link Card for Customer */}
      <div className="bg-stone-900/90 border border-purple-500/40 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Link di Pagamento Diretto con Carta (Omise Hosted Link)
              </h3>
              <p className="text-xs text-stone-400">
                Invia questo link al cliente per fargli inserire direttamente la propria carta su checkout sicuro Omise.
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
              className="w-24 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-purple-400 focus:outline-none focus:border-purple-500 text-right"
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
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copiato' : 'Copia Link'}
            </button>
            <a
              href={directPaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Apri Link di Pagamento
            </a>
          </div>
        </div>
      </div>

      {/* Omise Setup & Status Alert */}
      <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-2xl flex items-start gap-3 text-xs text-purple-200">
        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Stato Integrazione Omise:</strong> L'architettura è già 100% predisposta per ricevere pagamenti sia in modalità di test che reale. Quando riceverai la conferma di approvazione da Omise, basterà incollare le chiavi Live e selezionare <em>Live Mode</em>.
        </p>
      </div>

      {/* Credentials Card */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Key className="w-4 h-4" />
          1. Credenziali Omise (Public & Secret Key)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Omise Public Key (pkey_test_... / pkey_...)
            </label>
            <input
              type="text"
              value={config.publicKey}
              onChange={(e) => updateOmiseConfig({ publicKey: e.target.value })}
              placeholder="pkey_test_5xxxxxxxxxxxx"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Omise Secret Key (skey_test_... / skey_...)
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={config.secretKey}
                onChange={(e) => updateOmiseConfig({ secretKey: e.target.value })}
                placeholder="skey_test_5xxxxxxxxxxxx"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-white cursor-pointer"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-300 mb-1">Modalità Operativa Omise</label>
          <div className="grid grid-cols-2 gap-2 max-w-md">
            <button
              type="button"
              onClick={() => updateOmiseConfig({ mode: 'test' })}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                config.mode === 'test'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                  : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
              }`}
            >
              🧪 Sandbox Mode (Attivo)
            </button>
            <button
              type="button"
              onClick={() => updateOmiseConfig({ mode: 'live' })}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                config.mode === 'live'
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
              }`}
            >
              ⚡ Live Mode (Post-Approvazione)
            </button>
          </div>
        </div>
      </div>

      {/* Supported Features */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          2. Funzionalità & Metodi di Pagamento Omise
        </h3>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 bg-stone-950 rounded-2xl border border-stone-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">Carte di Credito / 3D Secure</span>
              <span className="text-[11px] text-stone-400">Checkout integrato con tokenizzazione e verifica OTP bancaria</span>
            </div>
            <input
              type="checkbox"
              checked={config.supportCard}
              onChange={(e) => updateOmiseConfig({ supportCard: e.target.checked })}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-stone-950 rounded-2xl border border-stone-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">PromptPay QR Omise</span>
              <span className="text-[11px] text-stone-400">QR dinamico generato tramite API Omise con auto-expiring</span>
            </div>
            <input
              type="checkbox"
              checked={config.supportPromptPay}
              onChange={(e) => updateOmiseConfig({ supportPromptPay: e.target.checked })}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
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
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-extrabold shadow transition-all cursor-pointer"
          >
            {saving ? 'Salvataggio...' : 'Salva Configurazione Omise'}
          </button>
        </div>
      </div>
    </div>
  );
};
