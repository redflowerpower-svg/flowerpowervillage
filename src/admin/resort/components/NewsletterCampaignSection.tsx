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
  AtSign,
  Trash2,
  RefreshCw,
  History,
  CheckSquare,
  Square,
  Globe
} from 'lucide-react';
import { useResortAdminStore } from '../store/useResortAdminStore';

interface CampaignLogEntry {
  id: string;
  timestamp: string;
  campaignCode: string;
  subject: string;
  senderAccount: string;
  count: number;
  recipients: { name: string; email: string }[];
}

interface UniqueGuestItem {
  id: string;
  email: string;
  name: string;
  checkin: string;
  ota: string;
  isNotified: boolean;
  isExcluded: boolean;
}

/**
 * NewsletterCampaignSection — Invio campagne email ai clienti Octorate.
 * Supporta mittente di default (flowerpowerphayam), deduplica email,
 * categorizzazione per OTA, filtri interattivi, esclusione manuale e storico dettagliato.
 * Scope: /src/admin/resort (compartimento stagno).
 */
export const NewsletterCampaignSection: React.FC = () => {
  const rawOctorateBookings = useResortAdminStore((s) => s.rawOctorateBookings);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [campaignCode, setCampaignCode] = useState('03-08-26 PHISHING');

  // 1. Mittente di Default: "phayam" (flowerpowerphayam@gmail.com)
  const [senderAccount, setSenderAccount] = useState('phayam');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Filtro interattivo sulle card superiori: 'all' | 'warn' | 'already'
  const [activeFilter, setActiveFilter] = useState<'all' | 'warn' | 'already'>('all');
  const [isListOpen, setIsListOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Esclusioni manuali temporanee per questa sessione (email escluse dall'invio)
  const [excludedEmails, setExcludedEmails] = useState<Set<string>>(new Set());
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Storia campagne per email: { "email@x.com": ["03-08-26 PHISHING", "PROMO_02"] }
  const [history, setHistory] = useState<Record<string, string[]>>({});
  // Log dettagliato storico invii
  const [campaignLogs, setCampaignLogs] = useState<CampaignLogEntry[]>([]);

  // Carica storia e log dal localStorage al mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('emailHistory') || localStorage.getItem('fpv_newsletter_history');
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedLogs = localStorage.getItem('fpv_newsletter_logs');
      if (storedLogs) setCampaignLogs(JSON.parse(storedLogs));
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

  // Helpers difensivi per estrazione dati
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

  // Estrazione sorgente OTA
  const getOtaSource = (b: any): string => {
    const src = b.source || b.channel || b.portal || b.sourceName || b.channelName || b.reservation?.source || b.ota || '';
    const str = String(src).toLowerCase();
    if (str.includes('booking')) return 'Booking.com';
    if (str.includes('airbnb')) return 'Airbnb';
    if (str.includes('expedia')) return 'Expedia';
    if (str.includes('octoevo') || str.includes('octorate')) return 'OctoEvo';
    if (str.includes('agoda')) return 'Agoda';
    if (str.includes('hostelworld')) return 'Hostelworld';
    return src ? String(src) : 'Sito/Diretto';
  };

  // Badge colorato per OTA
  const getOtaBadgeStyle = (ota: string) => {
    switch (ota) {
      case 'Booking.com':
        return 'bg-blue-950/60 text-blue-300 border-blue-600/40';
      case 'Airbnb':
        return 'bg-rose-950/60 text-rose-300 border-rose-600/40';
      case 'Expedia':
        return 'bg-amber-950/60 text-amber-300 border-amber-600/40';
      case 'Agoda':
        return 'bg-purple-950/60 text-purple-300 border-purple-600/40';
      default:
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40';
    }
  };

  // 2. Deduplica: Estrai lista clienti con email univoche
  const allUniqueGuests = useMemo<UniqueGuestItem[]>(() => {
    const guestMap = new Map<string, UniqueGuestItem>();

    futureBookings.forEach((b: any) => {
      const email = getEmail(b);
      if (!email || !email.includes('@')) return;

      const sentCodes = history[email] || [];
      const isNotified = sentCodes.includes(campaignCode.trim());
      const isExcluded = excludedEmails.has(email);

      if (!guestMap.has(email)) {
        guestMap.set(email, {
          id: String(b.id || b.reservationId || email),
          email,
          name: getGuestName(b),
          checkin: getCheckin(b),
          ota: getOtaSource(b),
          isNotified,
          isExcluded
        });
      }
    });

    return Array.from(guestMap.values());
  }, [futureBookings, history, campaignCode, excludedEmails]);

  // Clienti effettivi ancora da avvisare (non notificati e non esclusi)
  const pendingGuests = useMemo(() =>
    allUniqueGuests.filter((g) => !g.isNotified && !g.isExcluded),
    [allUniqueGuests]
  );

  // Clienti già notificati
  const notifiedGuests = useMemo(() =>
    allUniqueGuests.filter((g) => g.isNotified),
    [allUniqueGuests]
  );

  // Email univoche da inviare per questa esecuzione
  const uniqueEmailsToSend = useMemo(() =>
    pendingGuests.map((g) => g.email),
    [pendingGuests]
  );

  // Lista filtrata per la tabella in base ad activeFilter ('all' | 'warn' | 'already')
  const displayedGuests = useMemo(() => {
    switch (activeFilter) {
      case 'warn':
        return allUniqueGuests.filter((g) => !g.isNotified && !g.isExcluded);
      case 'already':
        return allUniqueGuests.filter((g) => g.isNotified);
      case 'all':
      default:
        return allUniqueGuests.filter((g) => !g.isExcluded);
    }
  }, [allUniqueGuests, activeFilter]);

  // Gestione selezione Checkbox
  const isAllSelected = useMemo(() => {
    if (displayedGuests.length === 0) return false;
    return displayedGuests.every((g) => selectedEmails.has(g.email));
  }, [displayedGuests, selectedEmails]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEmails(new Set());
    } else {
      const next = new Set(selectedEmails);
      displayedGuests.forEach((g) => next.add(g.email));
      setSelectedEmails(next);
    }
  };

  const handleToggleSelectOne = (email: string) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.add(email);
    }
    setSelectedEmails(next);
  };

  // 4. Cancellazione/Esclusione manuale selezionati
  const handleExcludeSelected = () => {
    if (selectedEmails.size === 0) return;
    const nextExcluded = new Set(excludedEmails);
    selectedEmails.forEach((email) => nextExcluded.add(email));
    setExcludedEmails(nextExcluded);
    setSelectedEmails(new Set());
  };

  const handleResetExclusions = () => {
    setExcludedEmails(new Set());
    setSelectedEmails(new Set());
  };

  // Invio campagna email
  const handleSend = async () => {
    if (!subject || !message || !campaignCode) {
      alert('Compila tutti i campi (Codice, Oggetto e Messaggio).');
      return;
    }

    if (uniqueEmailsToSend.length === 0) {
      setStatus({ ok: false, text: 'Nessun cliente da avvisare nella lista corrente.' });
      return;
    }

    setSending(true);
    setStatus(null);
    const BATCH_SIZE = 25;
    const totalBatches = Math.ceil(uniqueEmailsToSend.length / BATCH_SIZE);
    let successCount = 0;
    let lastError = '';

    const sentRecipients: { name: string; email: string }[] = [];

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
          batch.forEach((em) => {
            const guestObj = allUniqueGuests.find((g) => g.email === em);
            sentRecipients.push({ name: guestObj?.name || 'Ospite', email: em });
          });
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
      // Aggiorna storia per email
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

      // 5. Salva Log Dettagliato Campagna Inviata
      const newLogEntry: CampaignLogEntry = {
        id: String(Date.now()),
        timestamp: new Date().toLocaleString('it-IT'),
        campaignCode: campaignCode.trim(),
        subject: subject.trim(),
        senderAccount,
        count: successCount,
        recipients: sentRecipients
      };
      const updatedLogs = [newLogEntry, ...campaignLogs];
      setCampaignLogs(updatedLogs);
      localStorage.setItem('fpv_newsletter_logs', JSON.stringify(updatedLogs));

      setStatus({
        ok: true,
        text: `✅ Finito! Inviato con successo a ${successCount} contatti.${lastError ? ` (Note: ${lastError})` : ''}`
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

  const handleClearLogs = () => {
    if (!window.confirm('Cancellare interamente lo storico log invii?')) return;
    setCampaignLogs([]);
    localStorage.removeItem('fpv_newsletter_logs');
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
              Tracciamento per codice campagna, deduplica e selezione dinamica account SMTP.
            </p>
          </div>
        </div>
        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          BCC — Privacy Garantita
        </span>
      </div>

      {/* 3. Statistiche e Filtri Interattivi sulle Card Superiori */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: Totale Futuri Univoci */}
        <div
          onClick={() => {
            setActiveFilter('all');
            setIsListOpen(true);
          }}
          className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer select-none ${
            activeFilter === 'all'
              ? 'bg-stone-900 border-2 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-500/30 scale-[1.02]'
              : 'bg-stone-950/60 border border-stone-800 hover:bg-stone-900/80 hover:opacity-90'
          }`}
        >
          <div className="text-2xl font-black text-white">{allUniqueGuests.length}</div>
          <div className="text-[10px] text-stone-300 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
            <Users className="w-3 h-3 text-cyan-400" /> Totale Univoci
          </div>
        </div>

        {/* Card 2: Da Avvisare */}
        <div
          onClick={() => {
            setActiveFilter('warn');
            setIsListOpen(true);
          }}
          className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer select-none ${
            activeFilter === 'warn'
              ? 'bg-rose-950/60 border-2 border-amber-400 shadow-lg shadow-rose-950/50 ring-2 ring-amber-500/30 scale-[1.02]'
              : 'bg-rose-950/30 border border-rose-700/30 hover:bg-rose-950/50 hover:opacity-90'
          }`}
        >
          <div className="text-2xl font-black text-rose-400">{pendingGuests.length}</div>
          <div className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-rose-400" /> Da Avvisare
          </div>
        </div>

        {/* Card 3: Già Avvisati */}
        <div
          onClick={() => {
            setActiveFilter('already');
            setIsListOpen(true);
          }}
          className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer select-none ${
            activeFilter === 'already'
              ? 'bg-emerald-950/60 border-2 border-emerald-400 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/30 scale-[1.02]'
              : 'bg-emerald-950/30 border border-emerald-700/30 hover:bg-emerald-950/50 hover:opacity-90'
          }`}
        >
          <div className="text-2xl font-black text-emerald-400">{notifiedGuests.length}</div>
          <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Già Avvisati
          </div>
        </div>
      </div>

      {/* Form Codice + Oggetto + Selettore Account Mittente (Default: phayam) */}
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
            <option value="phayam">Usa: flowerpowerphayam@gmail.com (Default)</option>
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

      {/* Azioni Principali */}
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
          {notifiedGuests.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
              title={`Azzera la storia per la campagna "${campaignCode}"`}
            >
              ↺ Reset Stato Campagna
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
                <span>Invio in corso...</span>
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

      {/* 4. Tabella Clienti & Gestione Selezione / Esclusioni */}
      <div className="border-t border-stone-800 pt-3 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-stone-900 border border-stone-800 px-4 py-2.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setIsListOpen((v) => !v)}
            className="flex items-center gap-2 text-xs font-extrabold text-stone-200 uppercase tracking-wider cursor-pointer"
          >
            <span>
              📋 Tabella Clienti ({displayedGuests.length} visibili — Filtro: {activeFilter.toUpperCase()})
            </span>
            {isListOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Azioni veloci su Tabella (Cancella Selezionati / Ripristina) */}
          <div className="flex items-center gap-2">
            {excludedEmails.size > 0 && (
              <button
                type="button"
                onClick={handleResetExclusions}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 text-amber-300 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Ripristina Esclusi ({excludedEmails.size})
              </button>
            )}
            {selectedEmails.size > 0 && (
              <button
                type="button"
                onClick={handleExcludeSelected}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 text-[10px] font-extrabold uppercase rounded-xl shadow transition-all cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-rose-400" /> Cancella Selezionati ({selectedEmails.size})
              </button>
            )}
          </div>
        </div>

        {isListOpen && (
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl overflow-hidden shadow-inner">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-900/90 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800 sticky top-0 z-10 backdrop-blur">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                        title={isAllSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
                      >
                        {isAllSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3 text-center">Check-in</th>
                    <th className="py-2.5 px-3 text-center">Canale / OTA</th>
                    <th className="py-2.5 px-3 text-right">Stato Invio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {displayedGuests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-stone-500 italic">
                        Nessun cliente presente in questo filtro.
                      </td>
                    </tr>
                  ) : (
                    displayedGuests.map((g) => {
                      const isSelected = selectedEmails.has(g.email);
                      return (
                        <tr
                          key={g.id}
                          className={`hover:bg-stone-900/50 transition-colors ${isSelected ? 'bg-emerald-950/20' : ''}`}
                        >
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectOne(g.email)}
                              className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="py-2 px-3 font-extrabold text-white">
                            {g.name}
                          </td>
                          <td className="py-2 px-3 font-mono text-stone-300">
                            {g.email}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-stone-400 text-[11px]">
                            {g.checkin}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getOtaBadgeStyle(g.ota)}`}>
                              <Globe className="w-2.5 h-2.5 opacity-70" />
                              {g.ota}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {g.isNotified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px] uppercase">
                                <CheckCircle className="w-3 h-3" /> Inviato
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[10px] uppercase">
                                <Clock className="w-3 h-3" /> Da avvisare
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. Storico Campagne Inviate (Pannello Collassabile) */}
      <div className="border-t border-stone-800 pt-3 space-y-3">
        <button
          type="button"
          onClick={() => setIsHistoryOpen((v) => !v)}
          className="w-full flex justify-between items-center bg-stone-900 hover:bg-stone-850 border border-stone-800 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-stone-300 uppercase tracking-wider transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            📋 Storico Invii Campagne ({campaignLogs.length} invii salvati)
          </span>
          {isHistoryOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {isHistoryOpen && (
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-3">
            {campaignLogs.length === 0 ? (
              <p className="text-stone-500 text-xs italic text-center py-4">
                Nessun invio salvato nello storico.
              </p>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="text-[10px] font-bold text-stone-400 hover:text-rose-400 uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    🗑️ Svuota Storico Log
                  </button>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {campaignLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 border-b border-stone-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-md font-mono">
                            {log.campaignCode}
                          </span>
                          <span className="text-stone-300 font-bold truncate max-w-xs">
                            {log.subject}
                          </span>
                        </div>
                        <span className="text-stone-500 text-[11px] font-mono">
                          🕒 {log.timestamp}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2">
                        <div>
                          Mittente: <span className="text-stone-200 font-bold">{log.senderAccount === 'red' ? 'redflowerpower@gmail.com' : 'flowerpowerphayam@gmail.com'}</span>
                        </div>
                        <div>
                          Destinatari: <span className="text-emerald-400 font-black">{log.count} inviati</span>
                        </div>
                      </div>

                      {/* Lista destinatari compattata */}
                      <details className="text-[11px] text-stone-400 cursor-pointer pt-1">
                        <summary className="hover:text-emerald-400 font-bold select-none">
                          Visualizza {log.recipients?.length || log.count} destinatari
                        </summary>
                        <div className="mt-2 bg-stone-950 border border-stone-800/80 rounded-xl p-2.5 max-h-36 overflow-y-auto space-y-1">
                          {(log.recipients || []).map((r, idx) => (
                            <div key={idx} className="flex justify-between items-center text-stone-300 border-b border-stone-900/80 pb-0.5 last:border-0">
                              <span className="font-semibold text-white">{r.name}</span>
                              <span className="font-mono text-stone-500 text-[10px]">{r.email}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
