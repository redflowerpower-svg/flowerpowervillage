import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Mail,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  AtSign
} from 'lucide-react';
import { useResortAdminStore } from '../store/useResortAdminStore';

/**
 * NewsletterCampaignSection — Invio campagne email ai clienti Octorate.
 * Supporta la selezione dell'account mittente (flowerpowerphayam vs redflowerpower)
 * e gestisce il batching lato client per evitare i timeout Vercel.
 * Scope: /src/admin/resort (compartimento stagno).
 */
export const NewsletterCampaignSection: React.FC = () => {
  const rawOctorateBookings = useResortAdminStore((s) => s.rawOctorateBookings);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [campaignCode, setCampaignCode] = useState('03-08-26 PHISHING');
  const [senderAccount, setSenderAccount] = useState('red');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);

  // Storia campagne per email: { "email@x.com": ["03-08-26 PHISHING", "PROMO_02"] }
  const [history, setHistory] = useState<Record<string, string[]>>({});

  // Carica la storia dal localStorage al mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('emailHistory') || localStorage.getItem('fpv_newsletter_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // localStorage non disponibile, ignora
    }
  }, []);

  // Filtra solo prenotazioni con checkin >= oggi
  const futureBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (rawOctorateBookings || []).filter((b: any) => {
      const checkin = String(b.checkin || b.check_in || b.checkIn || '');
      return checkin >= today;
    });
  }, [rawOctorateBookings]);

  // Helper difensivo per estrarre i dati guest dalla struttura Octorate variabile
  const getGuest = (b: any) => b.guest || b.customer || b.reservation?.guest || {};
  const getEmail = (b: any) => {
    const g = getGuest(b);
    return (g.email || b.guest_email || '').toLowerCase().trim();
  };
  const getGuestName = (b: any) => {
    const g = getGuest(b);
    const given = g.givenName || g.firstName || '';
    const family = g.familyName || g.lastName || '';
    return `${given} ${family}`.trim() || b.guest_name || 'Ospite';
  };
  const getCheckin = (b: any) =>
    String(b.checkin || b.check_in || b.checkIn || '').slice(0, 10);

  // Email ancora non avvisate per questa campagna
  const uniqueEmailsToSend = useMemo(() => {
    const emails = new Set<string>();
    futureBookings.forEach((b: any) => {
      const email = getEmail(b);
      if (!email || !email.includes('@')) return;
      const sentCodes = history[email] || [];
      if (!sentCodes.includes(campaignCode.trim())) {
        emails.add(email);
      }
    });
    return Array.from(emails);
  }, [futureBookings, history, campaignCode]);

  // Prenotazioni già avvisate per questa campagna
  const notifiedBookings = useMemo(() =>
    futureBookings.filter((b: any) => {
      const email = getEmail(b);
      return email && (history[email] || []).includes(campaignCode.trim());
    }),
    [futureBookings, history, campaignCode]
  );

  // Prenotazioni ancora da avvisare
  const pendingBookings = useMemo(() =>
    futureBookings.filter((b: any) => {
      const email = getEmail(b);
      return !email || !(history[email] || []).includes(campaignCode.trim());
    }),
    [futureBookings, history, campaignCode]
  );

  const handleSend = async () => {
    if (!subject || !message || !campaignCode) {
      alert('Compila tutti i campi (Codice, Oggetto e Messaggio).');
      return;
    }

    if (uniqueEmailsToSend.length === 0) {
      setStatus({ ok: false, text: 'Tutti i clienti sono già stati avvisati per questa campagna.' });
      return;
    }

    setSending(true);
    setStatus(null);
    const BATCH_SIZE = 25;
    const totalBatches = Math.ceil(uniqueEmailsToSend.length / BATCH_SIZE);
    let successCount = 0;
    let lastError = '';

    for (let i = 0; i < totalBatches; i++) {
      setStatus({
        ok: true,
        text: `⏳ Invio blocco ${i + 1} di ${totalBatches}...`
      });

      const batch = uniqueEmailsToSend.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

      try {
        const res = await fetch('/api/resort/send-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: batch, subject, message, senderAccount })
        });

        if (res.ok) {
          successCount += batch.length;
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error('Errore blocco newsletter', i, errData);
          lastError = errData.error || errData.message || `Errore HTTP ${res.status}`;
        }
      } catch (e: any) {
        console.error('Errore rete blocco newsletter', i, e);
        lastError = e?.message || 'Errore di connessione di rete';
      }

      if (i < totalBatches - 1) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    if (successCount > 0) {
      const newHistory = { ...history };
      uniqueEmailsToSend.forEach((em) => {
        if (!newHistory[em]) newHistory[em] = [];
        if (!newHistory[em].includes(campaignCode.trim())) {
          newHistory[em].push(campaignCode.trim());
        }
      });
      localStorage.setItem('emailHistory', JSON.stringify(newHistory));
      localStorage.setItem('fpv_newsletter_history', JSON.stringify(newHistory));
      setHistory(newHistory);
      setStatus({
        ok: true,
        text: `✅ Finito! Inviato a ${successCount} contatti.${lastError ? ` (Alcune invii falliti: ${lastError})` : ''}`
      });
    } else {
      setStatus({ ok: false, text: `Errore: ${lastError || 'Nessun invio riuscito.'}` });
    }

    setSending(false);
  };

  const handleClearHistory = () => {
    if (!window.confirm(`Cancellare la storia delle campagne per "${campaignCode}"?`)) return;
    const newHistory = { ...history };
    Object.keys(newHistory).forEach((email) => {
      newHistory[email] = newHistory[email].filter((c) => c !== campaignCode.trim());
    });
    localStorage.setItem('emailHistory', JSON.stringify(newHistory));
    localStorage.setItem('fpv_newsletter_history', JSON.stringify(newHistory));
    setHistory(newHistory);
    setStatus({ ok: true, text: `Storia campagna "${campaignCode}" azzerata.` });
  };

  return (
    <div className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl shadow-emerald-950/30 space-y-5 ring-1 ring-emerald-500/10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow shadow-emerald-900/40">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              📧 Newsletter & Allerte
            </h3>
            <p className="text-stone-400 text-xs font-medium">
              Tracciamento per codice campagna e selezione dinamica dell'account SMTP mittente.
            </p>
          </div>
        </div>
        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          BCC — Privacy Garantita
        </span>
      </div>

      {/* Statistiche campagna corrente */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-3 text-center space-y-1">
          <div className="text-2xl font-black text-white">{futureBookings.length}</div>
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <Users className="w-3 h-3" /> Totale Futuri
          </div>
        </div>
        <div className="bg-rose-950/30 border border-rose-700/30 rounded-2xl p-3 text-center space-y-1">
          <div className="text-2xl font-black text-rose-400">{pendingBookings.length}</div>
          <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Da Avvisare
          </div>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-700/30 rounded-2xl p-3 text-center space-y-1">
          <div className="text-2xl font-black text-emerald-400">{notifiedBookings.length}</div>
          <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3" /> Già Avvisati
          </div>
        </div>
      </div>

      {/* Form Codice + Oggetto + Selettore Account */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-emerald-400" />
            Codice Campagna
          </label>
          <input
            type="text"
            placeholder="Codice Campagna"
            value={campaignCode}
            onChange={(e) => setCampaignCode(e.target.value)}
            className="w-full bg-stone-950/80 border border-stone-700 focus:border-emerald-500/60 rounded-2xl px-4 py-2.5 text-sm text-white font-mono font-bold placeholder:text-stone-600 outline-none transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-emerald-400" />
            Oggetto Email
          </label>
          <input
            type="text"
            placeholder="Oggetto email"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={150}
            className="w-full bg-stone-950/80 border border-stone-700 focus:border-emerald-500/60 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <AtSign className="w-3 h-3 text-emerald-400" />
            Account Mittente
          </label>
          <select
            value={senderAccount}
            onChange={(e) => setSenderAccount(e.target.value)}
            className="w-full bg-stone-950/80 border border-stone-700 focus:border-emerald-500/60 rounded-2xl px-4 py-2.5 text-sm text-stone-200 outline-none transition-colors cursor-pointer"
          >
            <option value="phayam">Usa: flowerpowerphayam@gmail.com</option>
            <option value="red">Usa: redflowerpower@gmail.com</option>
          </select>
        </div>
      </div>

      {/* Corpo messaggio */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
          Messaggio
        </label>
        <textarea
          placeholder="Messaggio..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full bg-stone-950/80 border border-stone-700 focus:border-emerald-500/60 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none transition-colors resize-y leading-relaxed"
        />
      </div>

      {/* Azioni */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-emerald-500/20">
        <div className="flex-1 space-y-1">
          {status && (
            <div className={`flex items-start gap-2 text-xs font-bold ${status.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {status.ok
                ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              }
              <span>{status.text}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {notifiedBookings.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
              title={`Azzera la storia per la campagna "${campaignCode}"`}
            >
              ↺ Reset
            </button>
          )}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || uniqueEmailsToSend.length === 0}
            className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Invio...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Invia a {uniqueEmailsToSend.length} contatti</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sezione Dettaglio Clienti Collassabile */}
      <div className="border-t border-stone-800 pt-3 space-y-3">
        <button
          type="button"
          onClick={() => setIsListOpen((v) => !v)}
          className="w-full flex justify-between items-center bg-stone-900 hover:bg-stone-850 border border-stone-800 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-stone-300 uppercase tracking-wider transition-all cursor-pointer"
        >
          <span>
            Dettaglio Gruppi Clienti ({futureBookings.length} totali)
          </span>
          {isListOpen
            ? <ChevronUp className="w-4 h-4 text-stone-400" />
            : <ChevronDown className="w-4 h-4 text-stone-400" />
          }
        </button>

        {isListOpen && (
          <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 space-y-5">

            {/* Gruppo 1: Da avvisare */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-stone-800">
                <Clock className="w-3.5 h-3.5" />
                ⏳ Da avvisare ({pendingBookings.length})
              </h4>
              {pendingBookings.length === 0 ? (
                <p className="text-stone-600 text-[11px] italic pl-1">
                  Nessuno — tutti già avvisati per questa campagna.
                </p>
              ) : (
                <ul className="space-y-1 max-h-44 overflow-y-auto pr-1 text-sm">
                  {pendingBookings.map((b: any) => {
                    const email = getEmail(b);
                    return (
                      <li key={String(b.id || b.reservationId || Math.random())}
                          className="text-stone-400 hover:text-stone-200 transition-colors py-0.5">
                        • {getGuestName(b)} {email && <span className="text-stone-500 font-mono text-xs ml-2">({email})</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Gruppo 2: Già avvisati */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-stone-800">
                <CheckCircle className="w-3.5 h-3.5" />
                ✅ Già avvisati ({notifiedBookings.length})
              </h4>
              {notifiedBookings.length === 0 ? (
                <p className="text-stone-600 text-[11px] italic pl-1">
                  Nessuno ancora avvisato per questa campagna.
                </p>
              ) : (
                <ul className="space-y-1 max-h-44 overflow-y-auto pr-1 text-sm">
                  {notifiedBookings.map((b: any) => {
                    const email = getEmail(b);
                    return (
                      <li key={String(b.id || b.reservationId || Math.random())}
                          className="text-stone-400 py-0.5">
                        • {getGuestName(b)} {email && <span className="text-emerald-500/60 font-mono text-xs ml-2">({email})</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
