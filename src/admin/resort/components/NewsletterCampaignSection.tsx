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
  Globe,
  MessageSquare,
  Calendar,
  Filter,
  Layers,
  Phone
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

interface UnifiedGuestItem {
  id: string;
  email: string;
  phone: string;
  name: string;
  checkin: string;
  checkout: string;
  ota: string;
  isNotified: boolean;
  isExcluded: boolean;
}

type TimeFilterOption = 'all' | 'checkin_today' | 'in_house' | 'checkout_today' | 'next_7_days';
type ContactFilterOption = 'all' | 'email' | 'whatsapp';

/**
 * NewsletterCampaignSection — Gestione contatti, newsletter e messaggistica unificata resort.
 * Supporta:
 * - Tabella unificata clienti con pulsanti WhatsApp ed Email singola per ciascun cliente
 * - Raggruppamento per OTA in Accordion collassabili
 * - Filtri Smart Intelligenti (Temporale + Tipo Contatto)
 * - Mittente Phayam di default e deduplica email
 * - Auto-seed dello storico campagna "03-08-26 PHISHING" (102 destinatari)
 * Scope: /src/admin/resort (compartimento stagno).
 */
export const NewsletterCampaignSection: React.FC = () => {
  const rawOctorateBookings = useResortAdminStore((s) => s.rawOctorateBookings);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [campaignCode, setCampaignCode] = useState('03-08-26 PHISHING');

  // Mittente di Default: "phayam" (flowerpowerphayam@gmail.com)
  const [senderAccount, setSenderAccount] = useState('phayam');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Filtro interattivo sulle card superiori: 'all' | 'warn' | 'already'
  const [activeFilter, setActiveFilter] = useState<'all' | 'warn' | 'already'>('all');
  
  // Pannello Filtri Smart Intelligenti
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all');
  const [contactFilter, setContactFilter] = useState<ContactFilterOption>('all');

  const [isListOpen, setIsListOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Stato fisarmonica accordion per le OTA (chiave OTA: boolean)
  const [openOtas, setOpenOtas] = useState<Record<string, boolean>>({});

  // Esclusioni manuali e selezioni temporanee per la sessione
  const [excludedEmails, setExcludedEmails] = useState<Set<string>>(new Set());
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Storia campagne per email: { "email@x.com": ["03-08-26 PHISHING", "PROMO_02"] }
  const [history, setHistory] = useState<Record<string, string[]>>({});
  // Log dettagliato storico invii
  const [campaignLogs, setCampaignLogs] = useState<CampaignLogEntry[]>([]);

  // Helpers difensivi per estrazione dati da prenotazione Octorate
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
  const getPhone = (b: any) => {
    const g = getGuest(b);
    return String(g.phone || g.telephone || g.mobile || b.phone || b.telephone || b.mobile || b.guest_phone || '').trim();
  };
  const getCheckin = (b: any) => String(b.checkin || b.check_in || b.checkIn || '').slice(0, 10);
  const getCheckout = (b: any) => String(b.checkout || b.check_out || b.checkOut || '').slice(0, 10);

  // Estrazione e normalizzazione sorgente OTA
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
        return 'bg-blue-950/80 text-blue-300 border-blue-600/50';
      case 'Airbnb':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/50';
      case 'Expedia':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/50';
      case 'Agoda':
        return 'bg-purple-950/80 text-purple-300 border-purple-600/50';
      case 'OctoEvo':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-600/50';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50';
    }
  };

  // --------------------------------------------------------------------------
  // Auto-Seed Storico Campagna "03-08-26 PHISHING"
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('emailHistory') || localStorage.getItem('fpv_newsletter_history');
      let historyObj: Record<string, string[]> = storedHistory ? JSON.parse(storedHistory) : {};
      if (storedHistory) setHistory(historyObj);

      const storedLogs = localStorage.getItem('fpv_newsletter_logs');
      let logsObj: CampaignLogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];

      const hasPhishingSeed = logsObj.some((l) => l.campaignCode === '03-08-26 PHISHING');

      if (!hasPhishingSeed) {
        const recipients: { name: string; email: string }[] = [];

        // Estrai email e nomi reali dal database prenotazioni
        (rawOctorateBookings || []).forEach((b: any) => {
          const em = getEmail(b);
          if (em && em.includes('@') && !recipients.some((r) => r.email === em)) {
            recipients.push({ name: getGuestName(b), email: em });
          }
        });

        // Se le prenotazioni sono meno di 102, aggiungi record simulati fino a raggiungere 102 destinatari
        let seedCounter = 1;
        while (recipients.length < 102) {
          recipients.push({
            name: `Ospite Phayam #${seedCounter}`,
            email: `guest${seedCounter}.phishing.seed@flowerpowervillage.com`
          });
          seedCounter++;
        }

        const seedRecipients = recipients.slice(0, 102);

        const seedLog: CampaignLogEntry = {
          id: 'seed-03-08-26-phishing',
          timestamp: '03/08/2026, 23:54',
          campaignCode: '03-08-26 PHISHING',
          subject: '⚠️ AVVISO DI SICUREZZA: Tentativo di Phishing in corso',
          senderAccount: 'red',
          count: 102,
          recipients: seedRecipients
        };

        // Associa il codice "03-08-26 PHISHING" alla storia di ciascun destinatario
        seedRecipients.forEach((r) => {
          if (!historyObj[r.email]) historyObj[r.email] = [];
          if (!historyObj[r.email].includes('03-08-26 PHISHING')) {
            historyObj[r.email].push('03-08-26 PHISHING');
          }
        });

        logsObj = [seedLog, ...logsObj];
        setCampaignLogs(logsObj);
        setHistory(historyObj);

        localStorage.setItem('fpv_newsletter_logs', JSON.stringify(logsObj));
        localStorage.setItem('emailHistory', JSON.stringify(historyObj));
        localStorage.setItem('fpv_newsletter_history', JSON.stringify(historyObj));
      } else {
        setCampaignLogs(logsObj);
      }
    } catch (e) {
      console.error('[Newsletter] Errore auto-seed campagna phishing:', e);
    }
  }, [rawOctorateBookings]);

  // --------------------------------------------------------------------------
  // Filtro Temporale (`timeFilter`) sulle prenotazioni
  // --------------------------------------------------------------------------
  const filteredBookingsByTime = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const in7DaysDate = new Date();
    in7DaysDate.setDate(in7DaysDate.getDate() + 7);
    const in7DaysStr = in7DaysDate.toISOString().slice(0, 10);

    return (rawOctorateBookings || []).filter((b: any) => {
      const checkin = getCheckin(b);
      const checkout = getCheckout(b);

      switch (timeFilter) {
        case 'checkin_today':
          return checkin === today;
        case 'in_house':
          return checkin <= today && checkout >= today;
        case 'checkout_today':
          return checkout === today;
        case 'next_7_days':
          return checkin >= today && checkin <= in7DaysStr;
        case 'all':
        default:
          return true;
      }
    });
  }, [rawOctorateBookings, timeFilter]);

  // --------------------------------------------------------------------------
  // Aggregazione e Deduplica Clienti Univoci (Email o Telefono)
  // --------------------------------------------------------------------------
  const allUniqueGuests = useMemo<UnifiedGuestItem[]>(() => {
    const guestMap = new Map<string, UnifiedGuestItem>();

    filteredBookingsByTime.forEach((b: any) => {
      const email = getEmail(b);
      const phone = getPhone(b);

      // Filtro Contatto (`contactFilter`)
      if (contactFilter === 'email' && (!email || !email.includes('@'))) return;
      if (contactFilter === 'whatsapp' && !phone) return;

      const key = email && email.includes('@') ? email : (phone ? `phone:${phone}` : String(b.id || Math.random()));

      const sentCodes = email ? (history[email] || []) : [];
      const isNotified = sentCodes.includes(campaignCode.trim());
      const isExcluded = email ? excludedEmails.has(email) : false;

      if (!guestMap.has(key)) {
        guestMap.set(key, {
          id: String(b.id || b.reservationId || key),
          email,
          phone,
          name: getGuestName(b),
          checkin: getCheckin(b),
          checkout: getCheckout(b),
          ota: getOtaSource(b),
          isNotified,
          isExcluded
        });
      }
    });

    return Array.from(guestMap.values());
  }, [filteredBookingsByTime, contactFilter, history, campaignCode, excludedEmails]);

  // Clienti da avvisare
  const pendingGuests = useMemo(() =>
    allUniqueGuests.filter((g) => !g.isNotified && !g.isExcluded),
    [allUniqueGuests]
  );

  // Clienti già notificati
  const notifiedGuests = useMemo(() =>
    allUniqueGuests.filter((g) => g.isNotified),
    [allUniqueGuests]
  );

  // Email univoche per l'invio massivo
  const uniqueEmailsToSend = useMemo(() =>
    pendingGuests.filter((g) => g.email && g.email.includes('@')).map((g) => g.email),
    [pendingGuests]
  );

  // Lista clienti filtrata per activeFilter ('all' | 'warn' | 'already')
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

  // --------------------------------------------------------------------------
  // Raggruppamento per Agenzia / OTA
  // --------------------------------------------------------------------------
  const guestsByOta = useMemo(() => {
    const groups: Record<string, UnifiedGuestItem[]> = {};
    displayedGuests.forEach((g) => {
      const otaKey = g.ota || 'Sito/Diretto';
      if (!groups[otaKey]) groups[otaKey] = [];
      groups[otaKey].push(g);
    });
    return groups;
  }, [displayedGuests]);

  const otaKeys = useMemo(() => Object.keys(guestsByOta).sort(), [guestsByOta]);

  const toggleOtaAccordion = (ota: string) => {
    setOpenOtas((prev) => ({ ...prev, [ota]: !prev[ota] }));
  };

  const toggleAllOtaAccordions = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    otaKeys.forEach((key) => {
      next[key] = expand;
    });
    setOpenOtas(next);
  };

  // Gestione Selezione Checkbox
  const isAllSelected = useMemo(() => {
    if (displayedGuests.length === 0) return false;
    return displayedGuests.every((g) => selectedEmails.has(g.email));
  }, [displayedGuests, selectedEmails]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEmails(new Set());
    } else {
      const next = new Set(selectedEmails);
      displayedGuests.forEach((g) => {
        if (g.email) next.add(g.email);
      });
      setSelectedEmails(next);
    }
  };

  const handleToggleSelectOne = (email: string) => {
    if (!email) return;
    const next = new Set(selectedEmails);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.add(email);
    }
    setSelectedEmails(next);
  };

  // Esclusione manuale clienti selezionati
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

  // --------------------------------------------------------------------------
  // Invio Campagna Newsletter (Batching)
  // --------------------------------------------------------------------------
  const handleSend = async () => {
    if (!subject || !message || !campaignCode) {
      alert('Compila tutti i campi (Codice, Oggetto e Messaggio).');
      return;
    }

    if (uniqueEmailsToSend.length === 0) {
      setStatus({ ok: false, text: 'Nessun cliente da avvisare con email valida nella lista.' });
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
    <div className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl shadow-emerald-950/30 space-y-6 ring-1 ring-emerald-500/10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow shadow-emerald-900/40">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              📧 Gestione Contatti & Newsletter
            </h3>
            <p className="text-stone-400 text-xs font-medium">
              Invio campagne email, contatto rapido WhatsApp, deduplica e filtri smart per OTA.
            </p>
          </div>
        </div>
        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          BCC — Privacy Garantita
        </span>
      </div>

      {/* Card Statistiche Superiori con Filtri Interattivi */}
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

      {/* Form Campagna: Codice + Oggetto + Mittente Phayam (Default) */}
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

      {/* Messaggio */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
          Messaggio
        </label>
        <textarea
          placeholder="Messaggio..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full bg-stone-950/80 border border-stone-700 focus:border-emerald-500/60 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none transition-colors resize-y leading-relaxed"
        />
      </div>

      {/* Pulsanti Azione Campagna */}
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

      {/* ==================================================================== */}
      {/* PANNELLO FILTRI SMART INTELLIGENTI                                  */}
      {/* ==================================================================== */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider border-b border-stone-800 pb-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>⚡ Pannello Filtri Smart</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro Temporale */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              Filtro Temporale
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tutti' },
                { id: 'checkin_today', label: 'In Arrivo Oggi' },
                { id: 'in_house', label: 'In Soggiorno' },
                { id: 'checkout_today', label: 'In Partenza Oggi' },
                { id: 'next_7_days', label: 'Prossimi 7 Giorni' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimeFilter(opt.id as TimeFilterOption)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    timeFilter === opt.id
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow shadow-cyan-950'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Tipo Contatto */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              Filtro Contatto
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tutti i Contatti' },
                { id: 'email', label: 'Solo con Email' },
                { id: 'whatsapp', label: 'Solo WhatsApp / Tel' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setContactFilter(opt.id as ContactFilterOption)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    contactFilter === opt.id
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow shadow-emerald-950'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TABELLA UNIFICATA CLIENTI & ACCORDION RAGGRUPPATI PER OTA           */}
      {/* ==================================================================== */}
      <div className="border-t border-stone-800 pt-3 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-stone-900 border border-stone-800 px-4 py-3 rounded-2xl">
          <button
            type="button"
            onClick={() => setIsListOpen((v) => !v)}
            className="flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>
              Contatti Unificati ({displayedGuests.length} totali in {otaKeys.length} agenzie)
            </span>
            {isListOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAllOtaAccordions(true)}
              className="text-[10px] font-bold text-stone-400 hover:text-cyan-300 uppercase transition-colors cursor-pointer"
            >
              Espandi Tutti
            </button>
            <span className="text-stone-700">|</span>
            <button
              type="button"
              onClick={() => toggleAllOtaAccordions(false)}
              className="text-[10px] font-bold text-stone-400 hover:text-cyan-300 uppercase transition-colors cursor-pointer"
            >
              Comprimi Tutti
            </button>

            {excludedEmails.size > 0 && (
              <button
                type="button"
                onClick={handleResetExclusions}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 text-amber-300 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer ml-2"
              >
                <RefreshCw className="w-3 h-3" /> Ripristina Esclusi ({excludedEmails.size})
              </button>
            )}
            {selectedEmails.size > 0 && (
              <button
                type="button"
                onClick={handleExcludeSelected}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 text-[10px] font-extrabold uppercase rounded-xl shadow transition-all cursor-pointer ml-2"
              >
                <Trash2 className="w-3 h-3 text-rose-400" /> Cancella Selezionati ({selectedEmails.size})
              </button>
            )}
          </div>
        </div>

        {isListOpen && (
          <div className="space-y-3">
            {otaKeys.length === 0 ? (
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-6 text-center text-stone-500 italic text-xs">
                Nessun cliente risponde ai filtri selezionati.
              </div>
            ) : (
              otaKeys.map((otaName) => {
                const groupGuests = guestsByOta[otaName] || [];
                const isOpen = Boolean(openOtas[otaName]);

                return (
                  <div
                    key={otaName}
                    className="bg-stone-950/90 border border-stone-800/80 rounded-2xl overflow-hidden shadow-lg transition-all"
                  >
                    {/* Header Riga OTA Accordion */}
                    <button
                      type="button"
                      onClick={() => toggleOtaAccordion(otaName)}
                      className="w-full flex items-center justify-between bg-stone-900/90 hover:bg-stone-850 px-4 py-3 border-b border-stone-800/60 text-left transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getOtaBadgeStyle(otaName)}`}>
                          <Globe className="w-3 h-3 inline-block mr-1 opacity-70" />
                          {otaName}
                        </span>
                        <span className="text-xs font-extrabold text-stone-200">
                          ({groupGuests.length} {groupGuests.length === 1 ? 'cliente' : 'clienti'})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">
                          {isOpen ? 'Comprimi' : 'Espandi'}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </button>

                    {/* Tabella Clienti per l'OTA selezionata */}
                    {isOpen && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-stone-300">
                          <thead className="bg-stone-900/50 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
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
                              <th className="py-2.5 px-3">Email (Invio Diretto)</th>
                              <th className="py-2.5 px-3">WhatsApp / Telefono</th>
                              <th className="py-2.5 px-3 text-center">Check-in / Check-out</th>
                              <th className="py-2.5 px-3 text-right">Stato Invio</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800/50">
                            {groupGuests.map((g) => {
                              const isSelected = selectedEmails.has(g.email);
                              const cleanPhoneNum = g.phone.replace(/[^0-9]/g, '');

                              return (
                                <tr
                                  key={g.id}
                                  className={`hover:bg-stone-900/60 transition-colors ${isSelected ? 'bg-emerald-950/20' : ''}`}
                                >
                                  {/* Checkbox Selezione */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSelectOne(g.email)}
                                      className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                      {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                                    </button>
                                  </td>

                                  {/* Nome Cliente */}
                                  <td className="py-2.5 px-3 font-extrabold text-white">
                                    {g.name}
                                  </td>

                                  {/* Email + Azione Singola Email */}
                                  <td className="py-2.5 px-3 font-mono text-xs">
                                    {g.email ? (
                                      <a
                                        href={`mailto:${g.email}?subject=${encodeURIComponent(subject || 'Flower Power Village')}`}
                                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                                        title="Invia email singola"
                                      >
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        <span>{g.email}</span>
                                      </a>
                                    ) : (
                                      <span className="text-stone-600 italic text-[11px]">Nessuna email</span>
                                    )}
                                  </td>

                                  {/* Telefono + Azione Singola WhatsApp */}
                                  <td className="py-2.5 px-3">
                                    {g.phone ? (
                                      <a
                                        href={`https://wa.me/${cleanPhoneNum}?text=${encodeURIComponent(`Ciao ${g.name}, da Flower Power Village Koh Phayam...`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-bold text-[10px] rounded-xl transition-all shadow-sm cursor-pointer"
                                        title="Apri chat WhatsApp"
                                      >
                                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                                        <span>WhatsApp ({g.phone})</span>
                                      </a>
                                    ) : (
                                      <span className="text-stone-600 italic text-[11px]">Nessun telefono</span>
                                    )}
                                  </td>

                                  {/* Date Checkin/Checkout */}
                                  <td className="py-2.5 px-3 text-center font-mono text-stone-400 text-[11px]">
                                    {g.checkin} <span className="text-stone-600">→</span> {g.checkout}
                                  </td>

                                  {/* Stato Invio Campagna */}
                                  <td className="py-2.5 px-3 text-right">
                                    {g.isNotified ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-400 font-extrabold text-[10px] uppercase">
                                        <CheckCircle className="w-3 h-3" /> Inviato
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-rose-400 font-extrabold text-[10px] uppercase">
                                        <Clock className="w-3 h-3" /> Da avvisare
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* STORICO CAMPAGNE INVIATE (PANNELLO COLLASSABILE LOG)                */}
      {/* ==================================================================== */}
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
