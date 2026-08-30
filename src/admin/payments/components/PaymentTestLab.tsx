import React, { useState } from 'react';
import { FlaskConical, Play, CheckCircle2, XCircle, Clock, ShieldCheck, Terminal, Trash2, ExternalLink, Copy, CreditCard } from 'lucide-react';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { PrimaryGateway } from '../types';

export const PaymentTestLab: React.FC = () => {
  const { settings, runTestTransaction, testResults, clearTestResults, isSimulating } = usePaymentsAdminStore();

  const [selectedGateway, setSelectedGateway] = useState<PrimaryGateway | 'paypal'>(settings.active_primary_gateway);
  const [testAmount, setTestAmount] = useState<number>(100);
  const [channel, setChannel] = useState<'promptpay' | 'card' | 'wallet'>('card'); // Default to card
  const [customerName, setCustomerName] = useState<string>('Marco Test Guest');
  const [customerEmail, setCustomerEmail] = useState<string>('test-guest@flowerpowerphayam.com');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleLaunchTest = async () => {
    await runTestTransaction({
      gateway: selectedGateway,
      amount: testAmount,
      paymentChannel: channel,
      customerName,
      customerEmail,
      description: `Test transazione ${selectedGateway.toUpperCase()} da Payment Test Lab`
    });
  };

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard?.writeText?.(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Payment Test Lab & Simulatore Gateway
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Sandbox Environment
              </span>
            </div>
            <p className="text-stone-400 text-xs sm:text-sm mt-1">
              Testa la generazione di Link di Pagamento diretti con Carta di Credito, sessioni Ksher Pay, Stripe e Omise in totale sicurezza e isolamento protetto.
            </p>
          </div>
        </div>
      </div>

      {/* Test Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameter Controls */}
        <div className="lg:col-span-5 space-y-4 bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Play className="w-4 h-4" />
            1. Parametri della Transazione di Prova
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Gateway da Testare</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ksher', label: 'Ksher (Predefinito)' },
                  { id: 'stripe', label: 'Stripe Global' },
                  { id: 'omise', label: 'Omise THB' },
                  { id: 'paypal', label: 'PayPal' }
                ].map((gw) => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setSelectedGateway(gw.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedGateway === gw.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {gw.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Canale di Pagamento</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: '💳 Carta Credito' },
                  { id: 'promptpay', label: '📱 PromptPay' },
                  { id: 'wallet', label: '👛 Wallet' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id as any)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      channel === ch.id
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow'
                        : 'bg-stone-950 text-stone-400 border-stone-800'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Importo di Test (THB)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Nome Ospite di Test</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Email di Test</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleLaunchTest}
              className="w-full mt-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              {isSimulating ? 'Generazione Link Pagamento...' : `Genera Link Pagamento ${selectedGateway.toUpperCase()} (฿${testAmount})`}
            </button>
          </div>
        </div>

        {/* Right Output: Execution Console & Results Log */}
        <div className="lg:col-span-7 space-y-4 bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Console Link di Pagamento & Log Transazioni
              </h3>
              {testResults.length > 0 && (
                <button
                  type="button"
                  onClick={clearTestResults}
                  className="text-[11px] text-stone-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Svuota Log
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {testResults.length === 0 ? (
                <div className="p-8 text-center bg-stone-950 rounded-2xl border border-dashed border-stone-800 text-stone-500 space-y-2">
                  <FlaskConical className="w-8 h-8 mx-auto text-stone-600" />
                  <p className="text-xs">Nessun test eseguito finora.</p>
                  <p className="text-[11px] text-stone-600">
                    Seleziona il gateway (es. Ksher) e clicca per generare il Link di Pagamento con Carta di Credito.
                  </p>
                </div>
              ) : (
                testResults.map((res, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border transition-all ${
                      res.success
                        ? 'bg-stone-950 border-emerald-500/40 text-stone-200'
                        : 'bg-stone-950 border-red-500/40 text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {res.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-mono text-xs font-black uppercase text-amber-400">
                          {res.gateway}
                        </span>
                        <span className="text-[10px] font-mono bg-stone-850 px-2 py-0.5 rounded border border-stone-700 text-stone-300">
                          {res.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {res.timestamp}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-stone-300">{res.message}</p>

                    {/* PROMPTPAY QR PREVIEW */}
                    {res.qrCodeUrl && (
                      <div className="mt-3 p-3 bg-stone-900 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                        <div className="bg-white p-2 rounded-xl shadow-md flex-shrink-0">
                          <img
                            src={res.qrCodeUrl}
                            alt="PromptPay QR Code"
                            className="w-28 h-28 object-contain"
                          />
                        </div>
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-emerald-400 block">
                            📱 QR Code PromptPay Ufficiale Generato:
                          </span>
                          <p className="text-stone-300 text-[11px]">
                            Inquadra con qualsiasi app bancaria thailandese per inviare l'importo esatto tramite standard EMVCo.
                          </p>
                          <a
                            href={res.qrCodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold pt-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Ingrandisci QR Code
                          </a>
                        </div>
                      </div>
                    )}

                    {/* DIRECT PAYMENT LINK ACTION BAR */}
                    {res.checkoutUrl && (
                      <div className="mt-3 p-3 bg-stone-900 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="overflow-hidden">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                            Link Ufficiale di Pagamento ({res.gateway.toUpperCase()}):
                          </span>
                          <span className="text-[11px] font-mono text-stone-300 truncate block">
                            {res.checkoutUrl}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(res.checkoutUrl!, index)}
                            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-stone-700 cursor-pointer"
                          >
                            {copiedIndex === index ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedIndex === index ? 'Copiato' : 'Copia'}
                          </button>
                          <a
                            href={res.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Paga Ora ({res.gateway.toUpperCase()})
                          </a>
                        </div>
                      </div>
                    )}

                    {res.transactionId && (
                      <div className="mt-2 text-[11px] font-mono text-stone-400">
                        TX ID: <span className="text-emerald-400">{res.transactionId}</span>
                      </div>
                    )}

                    {res.details && (
                      <pre className="mt-2 p-2 bg-stone-900 rounded-xl text-[10px] font-mono text-stone-400 overflow-x-auto border border-stone-800">
                        {JSON.stringify(res.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tutti i test e i link di pagamento avvengono in isolamento protetto
            </span>
            <span className="font-mono text-stone-400">Totale Test: {testResults.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
