import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, MessageSquare, Check, X, RefreshCw, Filter, Sparkles, AlertCircle, Mail } from 'lucide-react';

export interface TableReservation {
  id: string;
  customer_name: string;
  contact: string;
  email?: string;
  guests: number | string;
  reservation_date: string;
  reservation_time: string;
  seating_area: 'indoor' | 'outdoor' | 'hut' | 'any';
  occasion?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

const AREA_DISPLAY = {
  indoor: { label: '🏠 Sala Interna', color: 'bg-blue-950/60 text-blue-300 border-blue-800/60' },
  outdoor: { label: '🌿 Tavoli Esterni', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' },
  hut: { label: '🛖 Capanna', color: 'bg-amber-950/60 text-amber-300 border-amber-800/60' },
  any: { label: '🎲 Nessuna Preferenza', color: 'bg-stone-800 text-stone-300 border-stone-700' }
};

const STATUS_DISPLAY = {
  pending: { label: 'In Attesa', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  confirmed: { label: 'Confermata', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  completed: { label: 'Completata', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  cancelled: { label: 'Cancellata', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' }
};

export function PizzaTableReservationsSection() {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/table-reservation');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.reservations)) {
          setReservations(data.reservations);
        }
      }
    } catch (e) {
      console.warn('Error fetching reservations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    const timer = setInterval(fetchReservations, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: TableReservation['status']) => {
    // Optimistic update
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    try {
      await fetch('/api/table-reservation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
    } catch (e) {
      console.warn('Status update error:', e);
    }
  };

  const filtered = reservations.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (dateFilter && r.reservation_date !== dateFilter) return false;
    return true;
  });

  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-700/20 text-red-400 border border-red-700/30 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                📅 Prenotazioni Tavoli & Capanne
              </h2>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-stone-950 animate-pulse">
                  {pendingCount} Nuove
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">
              Gestione tavoli in sala interna, tavoli esterni e capanne nel giardino con cascata
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchReservations}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Aggiorna</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 p-2.5 rounded-2xl border border-stone-800">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(st => {
            const count = st === 'all' ? reservations.length : reservations.filter(r => r.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === st
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <span>
                  {st === 'all' && 'Tutte'}
                  {st === 'pending' && 'In Attesa'}
                  {st === 'confirmed' && 'Confermate'}
                  {st === 'completed' && 'Completate'}
                  {st === 'cancelled' && 'Cancellate'}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-black">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Date Filter Input */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white focus:outline-none focus:border-red-500"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-xs text-stone-400 hover:text-white underline cursor-pointer"
            >
              Reset data
            </button>
          )}
        </div>
      </div>

      {/* Reservations List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-stone-900/40 border border-stone-800 rounded-3xl space-y-3">
          <Calendar className="w-10 h-10 text-stone-600 mx-auto" />
          <p className="text-stone-300 font-bold text-sm">
            Nessuna prenotazione trovata
          </p>
          <p className="text-stone-500 text-xs">
            Le nuove richieste inviate dai clienti dal sito web compariranno qui e su Telegram in tempo reale.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(res => {
            const areaInfo = AREA_DISPLAY[res.seating_area] || AREA_DISPLAY.any;
            const statusInfo = STATUS_DISPLAY[res.status] || STATUS_DISPLAY.pending;
            const isThaiPhone = res.contact.startsWith('0') || res.contact.startsWith('+66');
            const cleanPhone = res.contact.replace(/[^0-9]/g, '');

            const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '66' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
              `Ciao ${res.customer_name}, ti confermiamo la tua prenotazione a Flower Power Pizza per ${res.guests} persone in data ${res.reservation_date} alle ore ${res.reservation_time} (${areaInfo.label}). A presto!`
            )}`;

            return (
              <div
                key={res.id}
                className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 space-y-4 shadow-sm hover:border-stone-700 transition-all flex flex-col justify-between"
              >
                {/* Top: ID, Status, Seating Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-stone-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
                      #{res.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${areaInfo.color}`}>
                        {areaInfo.label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Date details */}
                  <div className="pt-1">
                    <h3 className="text-base font-black text-white">
                      {res.customer_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-300 mt-1.5">
                      <span className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Calendar className="w-3.5 h-3.5" />
                        {res.reservation_date}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-white">
                        <Clock className="w-3.5 h-3.5 text-red-400" />
                        {res.reservation_time}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                        <Users className="w-3.5 h-3.5" />
                        {res.guests} Ospiti
                      </span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-stone-400 font-semibold flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-stone-500" />
                        Contatto:
                      </span>
                      <span className="font-mono font-bold text-white">
                        {res.contact}
                      </span>
                    </div>

                    {res.email && (
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="text-stone-400 font-semibold flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-stone-500" />
                          Email:
                        </span>
                        <span className="font-mono text-emerald-300 text-[11px] truncate max-w-[200px]">
                          {res.email}
                        </span>
                      </div>
                    )}

                    {res.occasion && (
                      <div className="flex items-center gap-1.5 text-amber-300 pt-1 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>Occasione: {res.occasion}</span>
                      </div>
                    )}

                    {res.notes && (
                      <p className="text-stone-300 text-[11px] italic pt-1 border-t border-stone-850 mt-1">
                        "{res.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Quick WhatsApp response */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Status switches */}
                  <div className="flex items-center gap-1.5">
                    {res.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Conferma</span>
                      </button>
                    )}

                    {res.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(res.id, 'completed')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Completata</span>
                      </button>
                    )}

                    {res.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-900/60 text-stone-400 hover:text-rose-300 text-xs font-bold cursor-pointer transition-all"
                        title="Annulla Prenotazione"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
