import React, { useState, useEffect } from 'react';
import { Zap, Key, Shield, Check, Eye, EyeOff, Sparkles, Play, Globe, Copy, CheckCircle2, ExternalLink, CreditCard, RotateCcw, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { usePaymentsAdminStore } from '../store/usePaymentsAdminStore';
import { UniversalCheckoutModalDemo } from './UniversalCheckoutModalDemo';
import { getOmiseTransactions, markOmiseTransactionRefunded, OmiseRecordedTransaction } from '../lib/omiseTransactions';
import { supabase } from '../../../lib/supabase';

export const OmiseTab: React.FC = () => {
  const { settings, updateOmiseConfig, saveSettings, saving, saveSuccess } = usePaymentsAdminStore();
  const config = settings.omise_config;
  const [showSecret, setShowSecret] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [directLinkAmount, setDirectLinkAmount] = useState<number>(3600);
  const [copiedLink, setCopiedLink] = useState(false);

  // Refund & Query Console States
  const [recordedTransactions, setRecordedTransactions] = useState<OmiseRecordedTransaction[]>(() => getOmiseTransactions());
  const [orderQueryInput, setOrderQueryInput] = useState('');
  const [refundAmountInput, setRefundAmountInput] = useState('');
  const [selectedTxOrderNo, setSelectedTxOrderNo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [refundResult, setRefundResult] = useState<any>(null);

  useEffect(() => {
    async function loadPizzaOmiseOrders() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('pizza_orders')
          .select('*')
          .in('payment_method', ['omise_card', 'omise_promptpay', 'card', 'promptpay'])
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          const fromDb: OmiseRecordedTransaction[] = data.map((o: any) => ({
            orderNo: String(o.id),
            chargeId: (o.receipt_url && o.receipt_url.startsWith('chrg_')) ? o.receipt_url : String(o.id),
            customerName: o.customer_name || 'Cliente Pizzeria',
            purchaseType: 'Pizza Delivery Ranong',
            itemDescription: Array.isArray(o.items) ? o.items.map((i: any) => i.name).slice(0, 2).join(', ') : 'Ordine Pizza',
            amount: Number(o.total || 0),
            channel: (o.payment_method || '').includes('promptpay') ? 'promptpay' : 'card',
            date: o.created_at,
            status: o.status === 'rejected' ? 'REFUNDED' : 'PAID'
          }));

          const local = getOmiseTransactions();
          const combinedMap = new Map<string, OmiseRecordedTransaction>();
          local.forEach(t => combinedMap.set(t.orderNo, t));
          fromDb.forEach(t => combinedMap.set(t.orderNo, t));
          
          // Sort strictly by date descending (most recent first at the top)
          const sorted = Array.from(combinedMap.values()).sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            return timeB - timeA;
          });
          setRecordedTransactions(sorted);
        }
      } catch (err) {
        console.warn('Error loading pizza omise orders:', err);
      }
    }
    loadPizzaOmiseOrders();
  }, []);

  const handleSelectTransaction = (orderNo: string) => {
    setSelectedTxOrderNo(orderNo);
    setActionError(null);
    setQueryResult(null);
    setRefundResult(null);

    const found = recordedTransactions.find((t) => t.orderNo === orderNo);
    if (!found) {
      setOrderQueryInput('');
      setRefundAmountInput('');
      return;
    }

    setOrderQueryInput(found.chargeId || found.orderNo);
    if (found.status === 'REFUNDED') {
      setRefundAmountInput('0');
    } else {
      setRefundAmountInput(found.amount.toString());
    }
  };

  const handleQueryOrder = async () => {
    if (!orderQueryInput.trim()) {
      alert("Inserisci o seleziona un codice transazione o ID Ordine.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setRefundResult(null);

    try {
      const res = await fetch(`/api/payments-admin?action=omise-query&charge_id=${encodeURIComponent(orderQueryInput.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossibile recuperare i dettagli della transazione Omise.");
      }
      setQueryResult(data.charge);
    } catch (err: any) {
      setActionError(err.message);
      setQueryResult(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundOrder = async () => {
    if (!orderQueryInput.trim()) {
      alert("Inserisci o seleziona la transazione da stornare.");
      return;
    }

    const selectedTx = recordedTransactions.find(t => t.orderNo === selectedTxOrderNo || t.chargeId === orderQueryInput.trim());
    if (selectedTx && selectedTx.channel === 'promptpay') {
      alert("⚠️ Attenzione: I pagamenti PromptPay QR non possono essere stornati automaticamente via API (regola della Bank of Thailand).\n\nPer rimborsare il cliente, effettua un bonifico PromptPay diretto al suo numero di telefono dalla tua app bancaria.");
      return;
    }

    const amountToRefund = refundAmountInput ? Number(refundAmountInput) : undefined;
    const amountLabel = amountToRefund ? `฿${amountToRefund.toLocaleString()} THB` : "il 100% dell'importo";
    const confirmed = window.confirm(`Sei sicuro di voler eseguire lo storno per la transazione ${orderQueryInput.trim()} per un importo di ${amountLabel}? I fondi verranno restituiti alla carta del cliente.`);
    if (!confirmed) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/payments-admin?action=omise-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charge_id: orderQueryInput.trim(),
          order_no: selectedTxOrderNo || orderQueryInput.trim(),
          refund_amount: amountToRefund
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Errore durante lo storno su Omise.");
      }
      setRefundResult(data.refundData);
      markOmiseTransactionRefunded(orderQueryInput.trim(), amountToRefund);
      setRecordedTransactions(getOmiseTransactions());
      await handleQueryOrder();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

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

      {/* ── OMISE QUERY & REFUND CONSOLE (IDENTICAL TO KSHER PROCEDURE) ── */}
      <div className="bg-stone-900/90 border border-purple-500/40 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>Console di Interrogazione & Storno Ordine (Omise Opn Payments)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Live & Sandbox
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Verifica lo stato in tempo reale di qualsiasi transazione Omise o esegui lo storno bancario immediato verso la carta del cliente.
              </p>
            </div>
          </div>
        </div>

        {/* Dropdown Selettore Transazioni con Auto-Fill */}
        <div className="p-4 bg-stone-950/80 border border-purple-500/30 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-purple-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              📋 Seleziona Transazione da Rimborsare (Menu a Tendina):
            </label>
            <span className="text-[11px] text-stone-400 font-mono">
              {recordedTransactions.length} pagamenti disponibili
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedTxOrderNo}
              onChange={(e) => handleSelectTransaction(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 hover:border-purple-400 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer transition-all"
            >
              <option value="">-- Seleziona un pagamento recente dalla lista (importo e codice si auto-compilano) --</option>
              {recordedTransactions.map((tx) => {
                const purchaseLabel = tx.purchaseType || 'Pizza Delivery Ranong';
                const itemsDesc = tx.itemDescription ? ` (${tx.itemDescription})` : '';
                const d = tx.date ? new Date(tx.date) : null;
                const timeStr = d ? `${d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : '--:--';
                return (
                  <option key={tx.orderNo} value={tx.orderNo}>
                    🕒 {timeStr} | #{tx.orderNo} | {tx.customerName || 'Cliente'} | 🍕 {purchaseLabel}{itemsDesc} | ฿{tx.amount.toLocaleString()} THB | {tx.channel === 'card' ? '💳 Carta' : '📱 PromptPay'} | {tx.status === 'REFUNDED' ? '↩️ GIÀ STORNATO' : '✅ PAGATO'}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedTxOrderNo && (() => {
            const selectedTx = recordedTransactions.find((t) => t.orderNo === selectedTxOrderNo);
            if (!selectedTx) return null;
            const d = selectedTx.date ? new Date(selectedTx.date) : null;
            return (
              <div className="p-3.5 bg-stone-900/80 rounded-xl border border-stone-800 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-800">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20 text-[11px]">
                    📦 {selectedTx.purchaseType || 'Pizza Delivery'}
                  </span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    🍕 {selectedTx.itemDescription || 'Ordine Pizzeria Ranong'}
                  </span>
                  {d && (
                    <span className="text-amber-300 font-mono text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                      🕒 Ricevuto: {d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} alle ore {d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                  {selectedTx.customerEmail && (
                    <span className="text-stone-500 text-[11px]">
                      ✉️ {selectedTx.customerEmail}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-stone-400">Pagato dal cliente:</span>
                    <span className="font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      ฿{selectedTx.amount.toLocaleString()} THB
                    </span>
                    <span className="text-stone-500 text-[11px]">({selectedTx.channel === 'card' ? 'Carta Visa/MC' : 'PromptPay QR'})</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-stone-400">Quanto vuoi restituire:</span>
                    <span className="font-extrabold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                      ฿{Number(refundAmountInput || selectedTx.amount).toLocaleString()} THB
                    </span>
                    {Number(refundAmountInput || selectedTx.amount) < selectedTx.amount && (
                      <span className="text-[11px] text-stone-400">
                        (Trattieni: ฿{(selectedTx.amount - Number(refundAmountInput || selectedTx.amount)).toLocaleString()} THB)
                      </span>
                    )}
                  </div>
                </div>

                {selectedTx.channel === 'promptpay' && (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-800/50 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Nota PromptPay:</strong> I pagamenti effettuati tramite PromptPay QR non supportano lo storno automatico via API. Per rimborsare il cliente, effettua un bonifico manuale al suo numero di cellulare.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              ID Transazione / Charge ID (es. chrg_test_... o ID Ordine)
            </label>
            <input
              type="text"
              placeholder="es. chrg_test_68i6... o 2701"
              value={orderQueryInput}
              onChange={(e) => setOrderQueryInput(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Importo Storno (Opzionale)
            </label>
            <input
              type="number"
              placeholder="100% se vuoto"
              value={refundAmountInput}
              onChange={(e) => setRefundAmountInput(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="sm:col-span-3 flex items-end gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleQueryOrder}
              className="flex-1 px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-700 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verifica</span>
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRefundOrder}
              className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Storna</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {refundResult && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs text-emerald-300 space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Storno Eseguito con Successo su Omise!</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
              <div><span className="text-stone-400 block">ID Rimborso:</span> {refundResult.id}</div>
              <div><span className="text-stone-400 block">Importo Riaccreditato:</span> ฿{(Number(refundResult.amount || 0) / 100).toFixed(2)} THB</div>
              <div><span className="text-stone-400 block">Stato:</span> {refundResult.status || 'closed'}</div>
              <div><span className="text-stone-400 block">Orario:</span> {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        )}

        {queryResult && (
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-300 flex items-center gap-2">
                Stato Transazione: 
                <span className={`px-2 py-0.5 rounded font-mono font-black text-[11px] ${
                  queryResult.refunded_amount > 0 || queryResult.status === 'refunded' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  queryResult.status === 'successful' || queryResult.paid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-stone-800 text-stone-400'
                }`}>
                  {queryResult.refunded_amount > 0 ? 'REFUNDED' : (queryResult.status || 'UNKNOWN').toUpperCase()}
                </span>
              </span>
              <span className="text-stone-500 text-[11px] font-mono">
                Canale: {queryResult.card ? `Carta (${queryResult.card.brand || 'Visa/MC'} •••• ${queryResult.card.last_digits || ''})` : 'PromptPay QR'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-stone-400">
              <div><span className="text-stone-500 block">Importo Totale:</span> ฿{(Number(queryResult.amount || 0) / 100).toFixed(2)} THB</div>
              <div><span className="text-stone-500 block">Già Rimborsato:</span> ฿{(Number(queryResult.refunded_amount || 0) / 100).toFixed(2)} THB</div>
              <div><span className="text-stone-500 block">Valuta:</span> {(queryResult.currency || 'thb').toUpperCase()}</div>
              <div><span className="text-stone-500 block">Charge ID:</span> {queryResult.id}</div>
            </div>
          </div>
        )}
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
