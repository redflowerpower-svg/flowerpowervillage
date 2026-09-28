import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Mail,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  CheckSquare,
  Square,
  Globe,
  Tag,
  FlaskConical,
  Pizza,
  Wine,
  Sparkles,
  DollarSign,
  Phone,
  Eye,
  X,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { extractOrderMetadata } from '../../../pizza/utils/orderMetadata';

export interface PizzaCustomerRecord {
  email: string;
  name: string;
  phone: string;
  lang: 'IT' | 'EN' | 'TH' | 'DE';
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  lastAddress: string;
  notes: string;
  isTest?: boolean;
}

const TEST_PIZZA_RECIPIENTS: PizzaCustomerRecord[] = [
  {
    email: 'redflowerpower@gmail.com',
    name: 'Marco (Admin Test 1)',
    phone: '+66958825573',
    lang: 'IT',
    ordersCount: 99,
    totalSpent: 12500,
    lastOrderDate: new Date().toISOString(),
    lastAddress: 'Ranong Main Hub [TEST]',
    notes: 'Contatto di collaudo principale',
    isTest: true
  },
  {
    email: 'redflowerpower@hotmail.it',
    name: 'Marco (Admin Test 2)',
    phone: '+66964365296',
    lang: 'EN',
    ordersCount: 50,
    totalSpent: 8900,
    lastOrderDate: new Date().toISOString(),
    lastAddress: 'Ranong Second Hub [TEST]',
    notes: 'Contatto di collaudo secondario',
    isTest: true
  },
  {
    email: 'simona.gnani@gmail.com',
    name: 'Simona (Staff Test)',
    phone: '+66979345393',
    lang: 'IT',
    ordersCount: 30,
    totalSpent: 4500,
    lastOrderDate: new Date().toISOString(),
    lastAddress: 'Ranong Staff [TEST]',
    notes: 'Staff Quality Check',
    isTest: true
  }
];

const PRESET_TEMPLATES = [
  {
    id: 'weekend_promo',
    name: '🍕 Promo Weekend & Famiglia',
    icon: Pizza,
    subject: '🍕 Weekend Special: Sconto 10% sulle Pizze & Consegna Gratuita a Ranong!',
    message: `Ciao {name}!\n\nQuesto fine settimana regalati il vero sapore della pizza italiana a legna a Ranong.\n\n🔥 Ordina almeno 2 pizze e ricevi subito:\n- 10% di sconto sul totale\n- Consegna a domicilio rapida con i nostri rider dedicati\n\nVisita il nostro sito https://flower-power-village.com/pizza o contattaci direttamente su WhatsApp al 0949.800.200 per prenotare la tua consegna calda e fragrante.\n\nA presto!\nFlower Power Pizza Ranong Team`
  },
  {
    id: 'new_pizza',
    name: '🌟 Nuova Pizza del Mese',
    icon: Sparkles,
    subject: '🌟 Nuova Creazione in Menu da Flower Power Pizza Ranong!',
    message: `Gentile {name},\n\nSiamo entusiasti di presentarti la nuova pizza speciale di questa settimana, preparata con ingredienti freschissimi e lievitazione naturale di oltre 48 ore.\n\n🧀 Vieni a provarla sul nostro menu online:\n👉 https://flower-power-village.com/pizza\n\nOrdina online in pochi secondi con geolocalizzazione GPS precisa e pagamento sicuro con PromptPay o Carta.\n\nBuon appetito!\nFlower Power Pizza Ranong`
  },
  {
    id: 'wine_selection',
    name: '🍷 Selezione Vini & Cantina',
    icon: Wine,
    subject: '🍷 Nuovi Arrivi dalla Cantina Italiana a Ranong!',
    message: `Caro {name},\n\nAbbiamo appena rinnovato la nostra selezione di vini e birre artigianali per accompagnare le tue pizze preferite.\n\nScopri i nuovi arrivi italiani (Prosecco DOC, Chianti, Pinot Grigio) disponibili per la consegna a domicilio a Ranong.\n\nSfoglia la nostra Wine Card online: https://flower-power-village.com/pizza\n\nSalute!\nFlower Power Pizza & Wine Studio`
  },
  {
    id: 'thai_local',
    name: '🇹🇭 โปรโมชั่นพิเศษ (Promo Thai)',
    icon: Globe,
    subject: '🍕 พิซซ่าอิตาเลียนแท้ อบเตาฟืน พร้อมส่งถึงบ้านคุณในระนอง!',
    message: `สวัสดีคุณ {name}!\n\nFlower Power Pizza Ranong ขอมอบโปรโมชั่นพิเศษสำหรับคุณและครอบครัว:\n\n✨ สั่งพิซซ่าอบเตาฟืนแท้ ส่งร้อนๆ ถึงหน้าบ้านในเขตระนอง\n✨ สั่งซื้อง่ายผ่านเว็บพร้อมระบุพิกัด GPS แม่นยำ\n✨ ชำระสะดวกผ่าน PromptPay QR หรือบัตรเครดิต\n\nสั่งเลยตอนนี้: https://flower-power-village.com/pizza\nหรือโทร: 0949.800.200\n\nขอให้อร่อยกับพิซซ่าอิตาเลียนแท้ครับ/ค่ะ!`
  }
];

export function PizzaNewsletterSection() {
  const [customers, setCustomers] = useState<PizzaCustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState<'ALL' | 'TH' | 'IT' | 'EN' | 'DE'>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'VIP' | 'NEW' | 'TEST'>('ALL');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Composer State
  const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [message, setMessage] = useState(PRESET_TEMPLATES[0].message);
  const [activeTemplateId, setActiveTemplateId] = useState('weekend_promo');

  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch customers from pizza_orders
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pizza_orders')
        .select('id, customer_name, phone, address, total, created_at, items')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not load pizza orders for CRM:', error.message);
      }

      const map = new Map<string, PizzaCustomerRecord>();

      // Populate test recipients
      for (const t of TEST_PIZZA_RECIPIENTS) {
        map.set(t.email.toLowerCase(), { ...t });
      }

      if (data && Array.isArray(data)) {
        for (const ord of data) {
          const meta = extractOrderMetadata(ord.address);
          const email = meta.customerEmail?.trim().toLowerCase();
          if (!email || !email.includes('@')) continue;

          const existing = map.get(email);
          const orderTotal = Number(ord.total) || 0;
          const orderDate = ord.created_at || new Date().toISOString();

          if (existing) {
            existing.ordersCount += 1;
            existing.totalSpent += orderTotal;
            if (!existing.phone && ord.phone) existing.phone = ord.phone;
            if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = orderDate;
              existing.lastAddress = meta.cleanAddress;
              existing.lang = meta.orderLang;
            }
            if (meta.deliveryNotes) existing.notes = meta.deliveryNotes;
          } else {
            map.set(email, {
              email,
              name: ord.customer_name || 'Cliente Ranong',
              phone: ord.phone || '',
              lang: meta.orderLang || 'EN',
              ordersCount: 1,
              totalSpent: orderTotal,
              lastOrderDate: orderDate,
              lastAddress: meta.cleanAddress,
              notes: meta.deliveryNotes || '',
              isTest: false
            });
          }
        }
      }

      const list = Array.from(map.values());
      setCustomers(list);
      // Select all real/test emails by default
      setSelectedEmails(new Set(list.map(c => c.email)));
    } catch (e) {
      console.error('Error loading CRM pizza customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (langFilter !== 'ALL' && c.lang !== langFilter) return false;
      if (tierFilter === 'VIP' && c.ordersCount < 3) return false;
      if (tierFilter === 'NEW' && c.ordersCount !== 1) return false;
      if (tierFilter === 'TEST' && !c.isTest) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        const matchPhone = c.phone?.toLowerCase().includes(q);
        const matchAddress = c.lastAddress?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchAddress) return false;
      }
      return true;
    });
  }, [customers, langFilter, tierFilter, searchQuery]);

  const toggleSelectEmail = (email: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    const allFilteredSelected = filteredCustomers.every(c => selectedEmails.has(c.email));
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredCustomers.forEach(c => next.delete(c.email));
      } else {
        filteredCustomers.forEach(c => next.add(c.email));
      }
      return next;
    });
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setActiveTemplateId(preset.id);
    setSubject(preset.subject);
    setMessage(preset.message);
  };

  // Send test email
  const handleSendTest = async () => {
    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);
    try {
      const res = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: ['redflowerpower@gmail.com'],
          subject: `[TEST] ${subject}`,
          message: message.replace('{name}', 'Marco (Test)'),
          senderAccount: 'pizza'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invio test fallito');
      }

      setSendSuccess('Email di test inviata con successo a redflowerpower@gmail.com da flowerpowerpizzaranong.th@gmail.com!');
    } catch (err: any) {
      setSendError(err.message || 'Errore durante l\'invio del test');
    } finally {
      setIsSending(false);
    }
  };

  // Send full campaign
  const handleSendCampaign = async () => {
    const targets = Array.from(selectedEmails);
    if (targets.length === 0) {
      alert('Seleziona almeno un destinatario per la campagna!');
      return;
    }

    if (!confirm(`Sei sicuro di voler inviare la campagna a ${targets.length} destinatari tramite flowerpowerpizzaranong.th@gmail.com?`)) {
      return;
    }

    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);
    try {
      const res = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: targets,
          subject,
          message: message.replace('{name}', 'Gentile Cliente'),
          senderAccount: 'pizza'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invio campagna fallito');
      }

      setSendSuccess(`Campagna inviata con successo a ${data.count} destinatari da flowerpowerpizzaranong.th@gmail.com!`);
    } catch (err: any) {
      setSendError(err.message || 'Errore durante l\'invio della campagna');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 text-stone-100 animate-fadeIn" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-stone-900 to-stone-900 border border-red-900/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Marketing & Newsletter Studio Pizza
            </h2>
          </div>
          <p className="text-stone-400 text-xs font-medium">
            Mittente verificato: <span className="text-red-400 font-bold">flowerpowerpizzaranong.th@gmail.com</span> · Invio massivo e segmentazione clienti Ranong
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCustomers}
            disabled={loading}
            className="py-2 px-3.5 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Ricarica CRM</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: CRM & Recipients, Right: Composer & Send) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Customer CRM & Filters (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filters Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Cerca per nome, email, telefono o indirizzo..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-800/80 border border-stone-700 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Language Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['ALL', 'TH', 'IT', 'EN', 'DE'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLangFilter(l)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all cursor-pointer ${
                      langFilter === l
                        ? 'bg-red-700 text-white shadow-sm'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    {l === 'ALL' ? 'Tutti' : l === 'TH' ? '🇹🇭 TH' : l === 'IT' ? '🇮🇹 IT' : l === 'EN' ? '🇬🇧 EN' : '🇩🇪 DE'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters: Tier + Selection counts */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSelectAllFiltered}
                  className="flex items-center gap-1.5 text-stone-300 hover:text-white font-bold cursor-pointer"
                >
                  {filteredCustomers.length > 0 && filteredCustomers.every(c => selectedEmails.has(c.email)) ? (
                    <CheckSquare className="w-4 h-4 text-red-500" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-500" />
                  )}
                  <span>Seleziona ({selectedEmails.size}/{filteredCustomers.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTierFilter('ALL')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${tierFilter === 'ALL' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-stone-200'}`}
                >
                  Tutti ({customers.length})
                </button>
                <button
                  onClick={() => setTierFilter('VIP')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${tierFilter === 'VIP' ? 'bg-amber-600 text-white' : 'text-amber-400/80 hover:text-amber-300'}`}
                >
                  ⭐ VIP (3+ ordini)
                </button>
                <button
                  onClick={() => setTierFilter('TEST')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${tierFilter === 'TEST' ? 'bg-blue-600 text-white' : 'text-blue-400/80 hover:text-blue-300'}`}
                >
                  🧪 Test ({TEST_PIZZA_RECIPIENTS.length})
                </button>
              </div>
            </div>
          </div>

          {/* CRM Customer List */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-2 sm:p-3 shadow-lg max-h-[560px] overflow-y-auto custom-scrollbar space-y-1.5">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-stone-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-xs">Caricamento anagrafiche clienti...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs">
                Nessun cliente corrisponde ai filtri selezionati.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedEmails.has(c.email);
                return (
                  <div
                    key={c.email}
                    onClick={() => toggleSelectEmail(c.email)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-red-950/30 border-red-500/40 hover:bg-red-950/40'
                        : 'bg-stone-800/40 border-stone-800 hover:bg-stone-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-stone-400 flex-shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-red-500" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-600" />
                        )}
                      </div>
                      
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white truncate">{c.name}</span>
                          {c.isTest && (
                            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                              TEST
                            </span>
                          )}
                          <span className="bg-stone-700 text-stone-300 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                            {c.lang}
                          </span>
                          {c.ordersCount >= 3 && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                              ⭐ VIP ({c.ordersCount})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 truncate flex items-center gap-2">
                          <span>{c.email}</span>
                          {c.phone && <span className="text-stone-500">• {c.phone}</span>}
                        </div>
                        {c.lastAddress && (
                          <div className="text-[10px] text-stone-500 truncate">
                            📍 {c.lastAddress}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 space-y-0.5">
                      <div className="text-xs font-black text-red-400">
                        {c.totalSpent > 0 ? `${c.totalSpent} ฿` : 'Test'}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {c.ordersCount} {c.ordersCount === 1 ? 'ordine' : 'ordini'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Composer & Campaign Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Preset Templates */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-400" />
              <span>Modelli Campagna Preimpostati</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_TEMPLATES.map(preset => {
                const IconComp = preset.icon;
                const isActive = activeTemplateId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-red-700 border-red-500 text-white shadow-md'
                        : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:border-stone-600 hover:text-white'
                    }`}
                  >
                    <IconComp className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Composer */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Oggetto dell'Email
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-2xl p-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                placeholder="Inserisci l'oggetto dell'email..."
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                  Contenuto del Messaggio
                </label>
                <span className="text-[10px] text-stone-500">Usa <b>{'{name}'}</b> per il nome</span>
              </div>
              <textarea
                rows={9}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-2xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500 font-mono leading-relaxed"
                placeholder="Scrivi qui il corpo del messaggio..."
              />
            </div>

            {/* Notification Badges */}
            {sendSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{sendSuccess}</span>
              </div>
            )}

            {sendError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="py-2.5 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Anteprima Live</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={isSending}
                  className="py-2.5 px-3 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/40 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
                  <span>Invia Test</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendCampaign}
                disabled={isSending || selectedEmails.size === 0}
                className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:bg-stone-800 disabled:text-stone-500 disabled:shadow-none"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Invio in corso da Gmail SMTP...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Lancia Campagna a {selectedEmails.size} Destinatari</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-500" />
                <span>Anteprima Email di Campagna</span>
              </h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 text-stone-900 shadow-inner">
              <div className="bg-[#8B1E1E] p-4 text-center">
                <h1 className="text-white text-base font-black tracking-wider m-0">
                  🍕 FLOWER POWER PIZZA RANONG
                </h1>
              </div>
              <div className="p-6 text-xs leading-relaxed space-y-3 whitespace-pre-line font-sans text-stone-850">
                <div className="font-bold text-stone-700 border-b pb-2">
                  Oggetto: {subject}
                </div>
                <div>
                  {message.replace('{name}', 'Mario Rossi')}
                </div>
              </div>
              <div className="bg-stone-100 p-3 text-center text-[10px] text-stone-500 border-t border-stone-200">
                <p className="m-0 font-bold">Flower Power Pizza Ranong · Ranong, Thailand</p>
                <p className="m-0 text-[9px] mt-0.5">Ricevi questa email perché hai effettuato un ordine presso la nostra pizzeria.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="py-2 px-5 bg-stone-800 hover:bg-stone-750 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Chiudi Anteprima
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
