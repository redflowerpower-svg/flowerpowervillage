import React, { useState, useEffect } from 'react';
import { 
  Bot,
  FileSpreadsheet,
  Save,
  Database, 
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
  Hash, 
  BookOpen, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Info,
  CheckCircle
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

interface MemoryRuleItem {
  id: string;
  title: string;
  content: string;
  category: 'rule' | 'faq' | 'accommodation' | 'policy' | 'golden_example';
  active: boolean;
  created_at?: string;
}

const PRESET_EXAMPLES = [
  {
    label: '🇬🇧 Famiglia con bimbi piccoli (Inglese)',
    text: 'Hi! We are 2 families (4 adults, 2 toddlers aged 1 and 3). We want to stay for 10 nights in February. Do you have adjacent bungalows or villas? Are there mosquito nets and baby cots available, and what is your cancellation policy? Best, Tobias'
  },
  {
    label: '🇮🇹 Coppia per 14 notti (Italiano)',
    text: 'Buongiorno Flower Power Village! Vorremmo venire per 14 notti a Marzo. Abbiamo visto la Villa Penthouse e il Bungalow Red. C\'è qualche sconto per soggiorni lunghi? La colazione è inclusa? Un caro saluto, Marco'
  },
  {
    label: '🇩🇪 Richiesta Tenda Glamping (Tedesco)',
    text: 'Hallo! Wir planen eine Reise nach Koh Phayam im März für 10 Tage. Haben Sie ein Camel Glamping Zelt frei für 2 Erwachsene? Haben die Zelte private Badezimmer und Ventilatoren? Herzliche Grüße, Thomas'
  },
  {
    label: '🇹🇭 Richiesta Capodanno (Thai)',
    text: 'สวัสดีครับ สนใจห้องพักช่วงปีใหม่ วันที่ 30 ธันวาคม ถึง 2 มกราคม สำหรับ 2 คนครับ มีบังกะโลว่างไหมครับ ขอรายละเอียดราคาหน่อยครับ'
  }
];

export function BookingConciergeStudio() {
  const [activeTab, setActiveTab] = useState<'studio' | 'memory' | 'prompt_sheet'>('studio');
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

  // Master Sheet & System Prompt state
  const [customPrompt, setCustomPrompt] = useState('');
  const [masterSheet, setMasterSheet] = useState<{ id: string; name: string; url: string } | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [promptFeedback, setPromptFeedback] = useState<string | null>(null);
  const [sheetFeedback, setSheetFeedback] = useState<string | null>(null);

  const fetchPromptAndSheet = async () => {
    setLoadingPrompt(true);
    try {
      const res = await fetch('/api/booking-concierge?action=get_prompt');
      if (res.ok) {
        const data = await res.json();
        if (data.customPrompt) setCustomPrompt(data.customPrompt);
        if (data.masterSheet) setMasterSheet(data.masterSheet);
      }
    } catch (e) {
      console.warn('Errore lettura prompt e sheet:', e);
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleSavePrompt = async () => {
    setSavingPrompt(true);
    setPromptFeedback(null);
    try {
      const res = await fetch('/api/booking-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_prompt',
          prompt: customPrompt
        })
      });
      const data = await res.json();
      if (data.success) {
        setPromptFeedback('✅ Prompt salvato! Attivo su Telegram, Studio e sito web.');
        setTimeout(() => setPromptFeedback(null), 4000);
      } else {
        setPromptFeedback('⚠️ Errore durante il salvataggio del prompt');
      }
    } catch (e: any) {
      setPromptFeedback(`Errore: ${e.message}`);
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleSyncMasterSheet = async () => {
    setSyncingSheet(true);
    setSheetFeedback(null);
    try {
      const res = await fetch('/api/booking-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_sheet' })
      });
      const data = await res.json();
      if (data.success && data.sheet) {
        setMasterSheet(data.sheet);
        setSheetFeedback('✅ Foglio Google Sheet Master sincronizzato e verificato con successo!');
        setTimeout(() => setSheetFeedback(null), 5000);
      } else {
        setSheetFeedback('⚠️ Errore sincronizzazione Google Sheet');
      }
    } catch (e: any) {
      setSheetFeedback(`Errore: ${e.message}`);
    } finally {
      setSyncingSheet(false);
    }
  };

  // Memory & Knowledge Base state
  const [rules, setRules] = useState<MemoryRuleItem[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<'rule' | 'faq' | 'policy'>('rule');
  const [savingRule, setSavingRule] = useState(false);

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

  // Fetch Learned Rules from Memory
  const fetchMemoryRules = async () => {
    setLoadingRules(true);
    try {
      const res = await fetch('/api/booking-concierge?action=get_memory');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.items)) {
          setRules(json.items);
        }
      }
    } catch (e) {
      console.warn('Errore lettura regole di memoria:', e);
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    fetchTelegramConfig();
    fetchMemoryRules();
    fetchPromptAndSheet();
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: SavedInquiry) => {
    const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 15);
    setHistory(updated);
    try {
      localStorage.setItem('fpv_booking_concierge_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  };

  // Process Inquiry
  const handleProcessInquiry = async () => {
    if (!inputText.trim()) return;

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
        throw new Error(data.error || 'Errore durante l\'interpretazione');
      }

      setResult(data.result);
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

  // Toggle Rule Active State
  const handleToggleRule = async (id: string, currentActive: boolean) => {
    const nextState = !currentActive;
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: nextState } : r));

    try {
      await fetch('/api/booking-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_rule',
          id,
          active: nextState
        })
      });
    } catch (err) {
      console.error('Errore toggle regola:', err);
      fetchMemoryRules();
    }
  };

  // Delete Rule
  const handleDeleteRule = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa regola dalla memoria?')) return;
    setRules(prev => prev.filter(r => r.id !== id));

    try {
      await fetch('/api/booking-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_rule',
          id
        })
      });
    } catch (err) {
      console.error('Errore eliminazione regola:', err);
      fetchMemoryRules();
    }
  };

  // Add New Rule Manually
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim() || !newRuleContent.trim()) return;

    setSavingRule(true);
    try {
      const res = await fetch('/api/booking-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_rule',
          title: newRuleTitle.trim(),
          content: newRuleContent.trim(),
          category: newRuleCategory,
          active: true
        })
      });

      if (res.ok) {
        setNewRuleTitle('');
        setNewRuleContent('');
        fetchMemoryRules();
      }
    } catch (err) {
      console.error('Errore salvataggio nuova regola:', err);
    } finally {
      setSavingRule(false);
    }
  };

  // Sync Telegram Webhook
  const handleSyncWebhook = async () => {
    setSyncingWebhook(true);
    setWebhookMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/sync-telegram-webhook?department=village', {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookMessage(`✅ Webhook sincronizzato con successo su Vercel! Bot: @${data.botInfo?.username}`);
        fetchTelegramConfig();
      } else {
        setWebhookMessage(`⚠️ Errore sincronizzazione: ${data.error || 'Operazione fallita'}`);
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
              DeepSeek AI Booking CRM & Memory
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hospitality CRM & Concierge Memory
            </h1>
            <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Knowledge base del villaggio completa, interpretazione intelligente delle date e ciclo di memoria interattivo human-in-the-loop: rispondi al bot su Telegram per istruirlo e memorizzare regole permanenti.
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
              <div className="flex items-center justify-between">
                <span>Regole Memoria:</span>
                <span className="font-semibold text-emerald-400">
                  {rules.filter(r => r.active).length} attive su {rules.length}
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

        {/* Tab Selector */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-stone-800/80">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'studio'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Studio & Offerte
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'memory'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Knowledge Base & Regole Apprese ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('prompt_sheet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'prompt_sheet'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Prompt di Sistema & Google Sheet Master
          </button>
        </div>
      </div>

      {/* TAB 1: STUDIO */}
      {activeTab === 'studio' && (
        <>
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
                  placeholder="Incolla qui la richiesta ricevuta (WhatsApp, email o DM)... es. 'Hi, do you have a bungalow for 2 people with mosquito nets from 15th Feb?'"
                  rows={6}
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition resize-y font-sans leading-relaxed"
                />

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Esempi di Prova Rapidi:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESET_EXAMPLES.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setInputText(ex.text)}
                        className="text-left text-xs p-2.5 rounded-xl bg-stone-950/70 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800/70 transition truncate flex items-center justify-between group"
                      >
                        <span className="font-medium truncate">{ex.label}</span>
                        <ArrowRight className="w-3 h-3 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleProcessInquiry}
                  disabled={loading || !inputText.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Elaborazione DeepSeek AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Interpreta & Genera Risposta</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI Output (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {result ? (
                <div className="space-y-6">
                  {/* Extracted Parameters Card */}
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Dati Estratti Automaticamente
                      </h2>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                        Lingua: {result.detectedLanguage}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Cliente</span>
                        <span className="text-stone-200 font-bold truncate block mt-0.5">
                          {result.guestName || 'Non specificato'}
                        </span>
                      </div>
                      <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Mese / Periodo</span>
                        <span className="text-amber-400 font-bold block mt-0.5">
                          {result.checkInDate && result.checkOutDate ? `${result.checkInDate}` : result.targetMonth}
                        </span>
                      </div>
                      <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Notti</span>
                        <span className="text-stone-200 font-bold block mt-0.5">
                          {result.numNights ? `${result.numNights} notti` : 'Flessibile'}
                        </span>
                      </div>
                      <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Ospiti</span>
                        <span className="text-stone-200 font-bold block mt-0.5">
                          {result.numGuests ? `${result.numGuests} persone` : '1-2'}
                        </span>
                      </div>
                    </div>

                    {/* Direct Calendar Link Box */}
                    <div className="bg-gradient-to-r from-amber-950/30 to-stone-950 p-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                          Link Calendario Live Generato
                        </span>
                        <a
                          href={result.calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-stone-200 hover:text-amber-300 font-mono truncate block underline decoration-amber-500/50"
                        >
                          {result.calendarUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyToClipboard(result.calendarUrl, 'url')}
                          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                          title="Copia link"
                        >
                          {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={result.calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 transition font-bold"
                          title="Apri link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Ready Reply */}
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Risposta Pronta per WhatsApp / Chat
                      </h3>
                      <button
                        onClick={() => copyToClipboard(result.politeReplyWhatsApp, 'whatsapp')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                      >
                        {copiedWhatsApp ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiato!</span>
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

                  {/* Email Ready Reply */}
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Risposta Formale per Email
                      </h3>
                      <button
                        onClick={() => copyToClipboard(result.politeReplyEmail, 'email')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
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
                    Incolla il testo a sinistra o clicca uno degli esempi rapidi, poi premi "Interpreta & Genera Risposta" per vedere i dati estratti e le risposte pronte arricchite dalla Knowledge Base.
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
        </>
      )}

      {/* TAB 2: KNOWLEDGE BASE & LEARNED RULES (CRM MEMORY) */}
      {activeTab === 'memory' && (
        <div className="space-y-8">
          {/* Add New Rule Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Aggiungi Direttiva o Regola Permanente
            </h2>
            <p className="text-xs text-stone-400">
              Le regole salvate qui vengono iniettate automaticamente nel prompt di DeepSeek per tutte le risposte generate sia su Telegram sia qui nella Dashboard.
            </p>

            <form onSubmit={handleAddRule} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    placeholder="Titolo regola (es. 'Sconto 10% per 10+ Notti', 'Policy Culla')"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <div>
                  <select
                    value={newRuleCategory}
                    onChange={(e: any) => setNewRuleCategory(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="rule">Regola Operativa</option>
                    <option value="policy">Policy / Termini</option>
                    <option value="faq">FAQ Villaggio</option>
                  </select>
                </div>
              </div>

              <textarea
                value={newRuleContent}
                onChange={(e) => setNewRuleContent(e.target.value)}
                placeholder="Descrizione dettagliata della regola (es. 'Per soggiorni di 10 o più notti proporre sempre uno sconto del 10% sulla prenotazione diretta. Ricordare che la colazione all'italiana con cornetti freschi e caffè espresso è disponibile alla bakery per 150-250 THB.')."
                rows={3}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 resize-y"
              />

              <button
                type="submit"
                disabled={savingRule || !newRuleTitle.trim() || !newRuleContent.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                {savingRule ? 'Salvataggio in corso...' : 'Salva Direttiva nella Memoria'}
              </button>
            </form>
          </div>

          {/* List of Active Learned Rules */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Regole e Direttive Attive ({rules.length})
                </h2>
                <p className="text-xs text-stone-400">
                  Puoi attivare, disattivare o eliminare le regole apprese dal bot via Telegram o inserite manualmente.
                </p>
              </div>
              <button
                onClick={fetchMemoryRules}
                disabled={loadingRules}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
                title="Ricarica regole"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRules ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingRules ? (
              <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                Caricamento memoria in corso...
              </div>
            ) : rules.length === 0 ? (
              <div className="p-8 text-center bg-stone-950/60 rounded-2xl border border-dashed border-stone-800 text-stone-400 text-xs space-y-2">
                <Info className="w-6 h-6 text-amber-400/60 mx-auto" />
                <p className="font-semibold text-stone-300">Nessuna regola personalizzata memorizzata.</p>
                <p className="text-stone-500 max-w-md mx-auto">
                  Quando Marco risponde a un'offerta nel topic Telegram con una critica o correzione, il bot proporrà automaticamente di salvarla qui come regola permanente!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-2xl border transition space-y-3 flex flex-col justify-between ${
                      rule.active
                        ? 'bg-stone-950 border-amber-500/30'
                        : 'bg-stone-950/40 border-stone-800/80 opacity-60'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">
                          {rule.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          rule.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-stone-800 text-stone-500'
                        }`}>
                          {rule.active ? 'Attiva' : 'Disattivata'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed font-sans">
                        {rule.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-900 text-xs">
                      <span className="text-[10px] text-stone-500">
                        Categoria: {rule.category || 'rule'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRule(rule.id, rule.active)}
                          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition"
                        >
                          {rule.active ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">On</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-stone-500" />
                              <span className="text-stone-500">Off</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 rounded text-stone-500 hover:text-red-400 transition"
                          title="Elimina regola"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Village Knowledge Summary */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Knowledge Base Base del Villaggio (Sempre Attiva)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> Alloggi & Dotazioni
                </span>
                <ul className="text-stone-400 space-y-1 list-disc list-inside">
                  <li>Zanzariere su TUTTI i letti</li>
                  <li>AC + Ventola nelle Ville</li>
                  <li>Ventilatore a soffitto nei Bungalow e Tende</li>
                  <li>Bagno tropicale all'aperto nei Bungalow</li>
                  <li>Elettricità 24h & Wi-Fi ad alta velocità</li>
                </ul>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Ristorante & Bakery
                </span>
                <ul className="text-stone-400 space-y-1 list-disc list-inside">
                  <li>Autentica cucina italiana fatta a mano</li>
                  <li>Pizza su pietra e pasta fresca</li>
                  <li>Colazione all'italiana (espresso e cornetti caldi)</li>
                  <li>Piatti tipici Thai freschi</li>
                  <li>Colazione alla carta (~150-250 THB)</li>
                </ul>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Policy, Bambini & Spiaggia
                </span>
                <ul className="text-stone-400 space-y-1 list-disc list-inside">
                  <li>Spiaggia Buffalo Bay a 1-2 min a piedi (150m)</li>
                  <li>Culle su richiesta (200 THB/notte)</li>
                  <li>Cancellazione gratuita fino a 14gg prima</li>
                  <li>Sconto soggiorni lunghi (10-15%)</li>
                  <li>Speedboat da Ranong (35 min, ~350 THB)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM PROMPT & MASTER GOOGLE SHEET */}
      {activeTab === 'prompt_sheet' && (
        <div className="space-y-8">
          {/* Section 1: Master Google Sheet Knowledge Base */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileSpreadsheet className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-bold text-white">Google Sheet Master Knowledge Base</h2>
                </div>
                <p className="text-xs text-stone-400">
                  Database ufficiale diviso in 5 schede ("Doc"). L'AI Concierge attinge da qui per rispondere e vi scrive automaticamente ogni correzione ricevuta su Telegram.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {masterSheet?.url && (
                  <a
                    href={masterSheet.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Apri Google Sheet Ufficiale
                  </a>
                )}
                <button
                  onClick={handleSyncMasterSheet}
                  disabled={syncingSheet}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition border border-stone-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncingSheet ? 'animate-spin' : ''}`} />
                  {syncingSheet ? 'Sincronizzazione in corso...' : 'Sincronizza / Verifica Foglio'}
                </button>
              </div>
            </div>

            {sheetFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {sheetFeedback}
              </div>
            )}

            {/* 5 Master Tabs Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Home className="w-4 h-4" /> 01_Alloggi_e_Capienze
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">Doc 1</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Penthouse (4 pax), Peace & Love (3 pax), Jungle (4 pax), Bungalow Red/Yellow/Green (2 pax), Tende Glamping (2 pax). Dotazioni, letti, bagni tropicali e prezzi base.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4" /> 02_Trasporti_e_Arrivi
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">Doc 2</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Mr. Gong Taxi fidato (300 THB solo / 200 THB a persona per 2+), motoscafi (350 THB, 35 min), battelli lenti (200 THB), voli AirAsia per Ranong e minivan da Phuket.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> 03_Ristorante_e_Bakery
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">Doc 3</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Cucina aperta 07:30 - 22:00. Colazione italiana à la carte con espresso e cornetti caldi (~150-250 THB). Pizza gourmet, pasta fresca e specialità Thai autentiche.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> 04_Policy_e_Villaggio
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">Doc 4</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Spiaggia Buffalo Bay a 150 metri reali (1-2 min a piedi). Wi-Fi fibra ottica ad alta velocità. Culle a 100 THB/notte. Animali ammessi con preavviso. Sconti lunghi soggiorni.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 md:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4" /> 05_Regole_e_FAQ_Telegram (Auto-Apprendimento)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">Auto-Sync</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Ogni volta che Marco critica o corregge una risposta sul gruppo Telegram, l'AI riconosce la categoria e archivia la direttiva qui. Tutte le future offerte seguiranno questa regola!
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: AI System Prompt Editor */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-bold text-white">Prompt di Sistema & Direttive Personalizzate</h2>
                </div>
                <p className="text-xs text-stone-400">
                  Modifica il prompt di sistema dell'AI. Le direttive qui inserite vengono iniettate insieme alla verifica disponibilità PMS in tempo reale.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSavePrompt}
                  disabled={savingPrompt}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingPrompt ? 'Salvataggio in corso...' : 'Salva Modifiche Prompt'}
                </button>
              </div>
            </div>

            {promptFeedback && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                {promptFeedback}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Direttive aggiuntive o override del Concierge:</span>
                <span className="font-mono text-stone-500">{customPrompt.length} caratteri</span>
              </div>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={12}
                placeholder="Inserisci qui eventuali istruzioni personalizzate per l'AI Concierge (es. promozioni stagionali in corso, formule di benvenuto preferite, regole speciali per le prenotazioni)..."
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition leading-relaxed"
              />
            </div>

            <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800/80 text-xs text-stone-400 space-y-1.5">
              <span className="font-bold text-stone-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" /> Come opera il motore AI Concierge
              </span>
              <p>
                1. <b>Verifica PMS in tempo reale:</b> Se la richiesta contiene date, l'assistente consulta Octorate PMS e propone <i>esclusivamente</i> le camere con disponibilità effettiva.
              </p>
              <p>
                2. <b>Knowledge Base Ufficiale:</b> Le 5 schede master garantiscono risposte esatte (150m dalla spiaggia, colazione alla bakery, taxi Mr. Gong).
              </p>
              <p>
                3. <b>Multi-piattaforma:</b> Questo identico prompt governa sia il Bot Telegram, sia le simulazioni nello Studio, sia il futuro Chatbot integrato nel sito web.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
