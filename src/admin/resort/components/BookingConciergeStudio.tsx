import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  Globe, 
  User, 
  Home, 
  Users, 
  RefreshCw, 
  MessageSquare, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  HelpCircle,
  Hash
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface BookingInquiryResult {
  detectedLanguage: string;
  guestName: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  targetMonth: string;
  numNights: number | null;
  numGuests: number | null;
  numAdults: number | null;
  numChildren: number | null;
  requestedAccommodation: string | null;
  accommodationSlug: string | null;
  politeReplyWhatsApp: string;
  politeReplyEmail: string;
  emailSubject: string;
  shortSummary: string;
  calendarUrl: string;
}

interface SavedInquiry {
  id: string;
  timestamp: string;
  rawText: string;
  result: BookingInquiryResult;
}

const PRESET_EXAMPLES = [
  {
    label: '🇬🇧 WhatsApp (Inglese)',
    text: 'Hi! We are looking for a bungalow for 2 people from 15th to 22nd February 2027. Do you have availability and what is the rate? Thank you, Sarah'
  },
  {
    label: '🇮🇹 Email (Italiano)',
    text: 'Buongiorno Flower Power Village, siamo una famiglia di 3 persone (2 adulti e 1 bimbo di 5 anni) e vorremmo venire a trovarvi dal 10 al 18 Gennaio. Ci piaceva molto la Villa Penthouse, è libera? C\'è possibilità di avere un lettino extra? Un saluto, Marco'
  },
  {
    label: '🇩🇪 Richiesta (Tedesco)',
    text: 'Hallo! Wir planen eine Reise nach Koh Phayam im März für 10 Tage. Haben Sie ein Zelt oder einen Bungalow frei für 2 Erwachsene? Herzliche Grüße, Thomas'
  },
  {
    label: '🇹🇭 Richiesta (Thai)',
    text: 'สวัสดีครับ สนใจห้องพักช่วงปีใหม่ วันที่ 30 ธันวาคม ถึง 2 มกราคม สำหรับ 2 คนครับ มีบังกะโลว่างไหมครับ ขอรายละเอียดราคาหน่อยครับ'
  }
];

export function BookingConciergeStudio() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingInquiryResult | null>(null);

  // Copy feedback states
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Telegram bot state
  const [telegramStatus, setTelegramStatus] = useState<{
    configured: boolean;
    botInfo?: { username?: string; first_name?: string };
    webhookUrl?: string;
  } | null>(null);
  const [syncingWebhook, setSyncingWebhook] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<SavedInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('fpv_booking_concierge_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch Telegram Village Bot status
  const fetchTelegramConfig = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/sync-telegram-webhook?department=village', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        const data = await res.json();
        setTelegramStatus(data);
      }
    } catch (e) {
      console.warn('Errore lettura status Telegram village:', e);
    }
  };

  useEffect(() => {
    fetchTelegramConfig();
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: SavedInquiry) => {
    const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 15);
    setHistory(updated);
    try {
      localStorage.setItem('fpv_booking_concierge_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Errore salvataggio cronologia concierge:', e);
    }
  };

  // Submit inquiry to DeepSeek backend
  const handleProcessInquiry = async () => {
    if (!inputText.trim()) {
      setError('Incolla o digita un messaggio prima di procedere.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/booking-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText.trim() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Errore durante l\'elaborazione');
      }

      setResult(data.result);

      // Save to local history
      saveToHistory({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        rawText: inputText.trim(),
        result: data.result
      });
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  // Sync / Register Webhook for Telegram
  const handleSyncWebhook = async () => {
    setSyncingWebhook(true);
    setWebhookMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/sync-telegram-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          department: 'village',
          botToken: telegramStatus?.botInfo ? undefined : '', // will read from db if already stored
          testMessage: false
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookMessage(`✅ Webhook registrato con successo su Telegram: ${data.webhookUrl}`);
        fetchTelegramConfig();
      } else {
        setWebhookMessage(`⚠️ Errore registrazione webhook: ${data.error || 'Verifica il bot'}`);
      }
    } catch (e: any) {
      setWebhookMessage(`Errore di rete: ${e.message}`);
    } finally {
      setSyncingWebhook(false);
    }
  };

  const copyToClipboard = (text: string, type: 'whatsapp' | 'email' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'whatsapp') {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    } else if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Header Banner & Telegram Status */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              DeepSeek AI Booking Concierge
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Assistente Offerte & Calendario Live
            </h1>
            <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Incolla qualsiasi richiesta clienti da WhatsApp o Email. L'AI interpreta le date, genera una risposta calda ed empatica nella lingua dell'ospite e genera il link diretto al calendario live per far completare la prenotazione autonomamente.
            </p>
          </div>

          {/* Telegram Topic Status Card */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-[320px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>Telegram Bot (@{telegramStatus?.botInfo?.username || 'flower_power_village_bot'})</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="text-xs text-stone-400 space-y-1 bg-stone-900/60 rounded-xl p-2.5 border border-stone-800/60">
              <div className="flex items-center justify-between">
                <span>Supergruppo:</span>
                <span className="font-semibold text-stone-200">FPV Dashboard</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Topic Attivo:</span>
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Booking Offers
                </span>
              </div>
            </div>

            <button
              onClick={handleSyncWebhook}
              disabled={syncingWebhook}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition border border-stone-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingWebhook ? 'animate-spin' : ''}`} />
              {syncingWebhook ? 'Sincronizzazione Webhook...' : 'Sincronizza Webhook Telegram'}
            </button>
            {webhookMessage && (
              <p className="text-[11px] text-stone-300 break-all">{webhookMessage}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input and Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Messaggio Ricevuto dal Cliente
              </h2>
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="text-xs text-stone-400 hover:text-stone-200 transition"
                >
                  Pulisci
                </button>
              )}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Incolla qui il testo della richiesta ricevuta via WhatsApp, Email o Social (es: 'Hi, do you have any bungalow from 15 to 22 Feb for 2 people?')..."
              rows={8}
              className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition resize-none"
            />

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleProcessInquiry}
              disabled={loading || !inputText.trim()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-950/40 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Elaborazione con DeepSeek...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Interpreta & Genera Risposta</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets / Examples */}
          <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 space-y-2.5">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              💡 Oppure prova un esempio rapido:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(ex.text);
                    setError(null);
                  }}
                  className="text-left p-2.5 rounded-xl bg-stone-950/70 hover:bg-stone-800 border border-stone-800/80 text-stone-300 text-xs font-medium transition truncate"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Results & Ready-to-Send Replies (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Extracted Data Badges */}
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Dati Rilevati dall'AI
                  </h3>
                  <span className="text-xs text-stone-400 font-medium">
                    {result.shortSummary}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800/70">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      Lingua
                    </div>
                    <div className="mt-1 font-bold text-stone-100 text-sm">
                      {result.detectedLanguage}
                    </div>
                  </div>

                  <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800/70">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      Cliente
                    </div>
                    <div className="mt-1 font-bold text-stone-100 text-sm truncate">
                      {result.guestName || 'Non specificato'}
                    </div>
                  </div>

                  <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800/70">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                      <Home className="w-3.5 h-3.5 text-emerald-400" />
                      Alloggio
                    </div>
                    <div className="mt-1 font-bold text-stone-100 text-sm truncate capitalize">
                      {result.accommodationSlug || result.requestedAccommodation || 'Qualsiasi'}
                    </div>
                  </div>

                  <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800/70">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      Ospiti
                    </div>
                    <div className="mt-1 font-bold text-stone-100 text-sm">
                      {result.numGuests ? `${result.numGuests} pers.` : '2 (default)'}
                    </div>
                  </div>
                </div>

                {/* Period Box */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-stone-300">Periodo Identificato:</span>
                    <span className="text-xs font-bold text-amber-300">
                      {result.checkInDate && result.checkOutDate
                        ? `${result.checkInDate} ➔ ${result.checkOutDate} (${result.numNights || '?'} notti)`
                        : `Mese: ${result.targetMonth}`}
                    </span>
                  </div>
                </div>

                {/* Direct Calendar Link Box */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                    🔗 Link Diretto al Calendario Live Generato:
                  </span>
                  <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-2xl p-2.5">
                    <input
                      type="text"
                      readOnly
                      value={result.calendarUrl}
                      className="bg-transparent text-amber-300 text-xs font-mono w-full focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(result.calendarUrl, 'url')}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUrl ? 'Copiato' : 'Copia'}
                    </button>
                    <a
                      href={result.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 transition flex-shrink-0"
                      title="Apri nel browser"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Ready-to-Send WhatsApp Reply Box */}
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Risposta Pronta per WhatsApp / Chat
                  </h4>
                  <button
                    onClick={() => copyToClipboard(result.politeReplyWhatsApp, 'whatsapp')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95"
                  >
                    {copiedWhatsApp ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiato negli Appunti!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copia per WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 text-stone-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {result.politeReplyWhatsApp}
                </div>
              </div>

              {/* Ready-to-Send Email Reply Box */}
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Risposta Pronta per Email Formale
                  </h4>
                  <button
                    onClick={() => copyToClipboard(result.politeReplyEmail, 'email')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-950/40 transition active:scale-95"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiato negli Appunti!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copia per Email</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-stone-950/80 rounded-xl p-3 border border-stone-800 text-xs font-semibold text-stone-300">
                  <span className="text-stone-500">Oggetto suggerito: </span>
                  {result.emailSubject}
                </div>

                <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 text-stone-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {result.politeReplyEmail}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-900/40 border border-dashed border-stone-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[380px] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-stone-800/60 flex items-center justify-center text-stone-500 mb-2">
                <Bot className="w-7 h-7 text-amber-500/60" />
              </div>
              <h3 className="text-base font-bold text-stone-300">In attesa di un messaggio da interpretare</h3>
              <p className="text-xs text-stone-500 max-w-sm">
                Incolla il testo a sinistra o clicca uno degli esempi rapidi, poi premi "Interpreta & Genera Risposta" per vedere i dati estratti e le risposte pronte.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. History of Recent Inquiries */}
      {history.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Ultime Richieste Elaborate
            </h3>
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('fpv_booking_concierge_history');
              }}
              className="text-xs text-stone-500 hover:text-stone-300 transition"
            >
              Svuota Cronologia
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setInputText(item.rawText);
                  setResult(item.result);
                }}
                className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800/80 hover:border-amber-500/40 transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">
                    {item.result.detectedLanguage} • {item.result.guestName || 'Ospite'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-stone-400 line-clamp-2">
                  {item.rawText}
                </p>
                <div className="text-[11px] text-emerald-400 font-medium truncate pt-1 border-t border-stone-900 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                  {item.result.shortSummary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

