import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck, Trash2, RefreshCw, Plus, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDisplayDate } from '../../../lib/dateUtils';

interface ClosedRoomLockItem {
  id: string;
  roomKey: string;
  motherId: number;
  roomName: string;
  dateFrom: string;
  dateTo: string;
  reason?: string;
  enabled: boolean;
  updatedAt: string;
}

interface LockableRoomOption {
  roomKey: string;
  motherId: number;
  name: string;
  productsCount: number;
}

function getTodayStr(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export const ClosedRoomLocksSection: React.FC = () => {
  const [locks, setLocks] = useState<ClosedRoomLockItem[]>([]);
  const [rooms, setRooms] = useState<LockableRoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [selectedRoomKey, setSelectedRoomKey] = useState('r1');
  const [dateFrom, setDateFrom] = useState(getTodayStr());
  const [dateTo, setDateTo] = useState('2027-05-31');
  const [reason, setReason] = useState('Stanza chiusa / Accordi privati');

  const fetchLocks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/octorate-closed-room-locks');
      const data = await res.json();
      if (res.ok && data?.success) {
        setLocks(Array.isArray(data.locks) ? data.locks : []);
        setRooms(Array.isArray(data.rooms) ? data.rooms : []);
      }
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Errore caricamento lock stanze chiuse' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocks();
  }, []);

  const handleCreateAndSeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/octorate-closed-room-locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          roomKey: selectedRoomKey,
          dateFrom,
          dateTo,
          reason,
          sealNow: true
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Errore salvataggio lock');
      }
      setLocks(Array.isArray(data.locks) ? data.locks : []);
      const sealedCount = data?.sealResult?.sealedEntries ?? 0;
      setFeedback({
        type: 'ok',
        text: `Lock attivato e sigillato su Octorate (${sealedCount} tariffe/blocchi chiusi a avail=0 + StopSell=ON).`
      });
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Errore attivazione lock' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async (lock: ClosedRoomLockItem) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/octorate-closed-room-locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          id: lock.id,
          enabled: !lock.enabled
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Errore toggle');
      setLocks(Array.isArray(data.locks) ? data.locks : []);
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Errore toggle lock' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResealNow = async (lock: ClosedRoomLockItem) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/octorate-closed-room-locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          roomKey: lock.roomKey,
          dateFrom: lock.dateFrom,
          dateTo: lock.dateTo,
          reason: lock.reason,
          sealNow: true
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Errore risigillatura');
      setLocks(Array.isArray(data.locks) ? data.locks : []);
      setFeedback({
        type: 'ok',
        text: `${lock.roomName} risigillata su Octorate (${data?.sealResult?.sealedEntries ?? 0} entry).`
      });
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Errore risigillatura' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLock = async (lockId: string) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/octorate-closed-room-locks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lockId })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Errore eliminazione');
      setLocks(Array.isArray(data.locks) ? data.locks : []);
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Errore eliminazione lock' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-900/90 border border-amber-500/30 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Scudo Stanze Chiuse (Hard-Lock Anti-Riapertura)
            </h3>
            <p className="text-xs text-stone-400">
              Impedisce a Octorate di riaprire le notti (0 → 1) quando cancelli o riduci una prenotazione manuale su una stanza chiusa.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchLocks}
          disabled={loading || submitting}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1.5 border border-stone-700 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl px-4 py-2.5 text-xs font-bold flex items-center gap-2 border ${
            feedback.type === 'ok'
              ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-200'
              : 'bg-red-950/60 border-red-600/50 text-red-200'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleCreateAndSeal} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
        <div className="md:col-span-3 space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">Alloggio da Proteggere</label>
          <select
            value={selectedRoomKey}
            onChange={(e) => setSelectedRoomKey(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
          >
            {(rooms.length > 0 ? rooms : [
              { roomKey: 'r1', motherId: 293963, name: 'Room 1', productsCount: 13 },
              { roomKey: 'r2', motherId: 293959, name: 'Room 2', productsCount: 13 },
              { roomKey: 'r3', motherId: 293948, name: 'Room 3', productsCount: 13 }
            ]).map(r => (
              <option key={r.roomKey} value={r.roomKey}>
                {r.name} (#{r.motherId})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">Data Inizio</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            required
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">Data Fine</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            required
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono"
          />
        </div>

        <div className="md:col-span-3 space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">Motivo</label>
            <button
              type="button"
              onClick={() => {
                setDateFrom(getTodayStr());
                setDateTo('2027-05-31');
              }}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3 h-3" /> Tutta la Stagione
            </button>
          </div>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="es. Chiusa / Accordo cliente"
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            {submitting ? 'Sigillo...' : 'Lock & Sigilla'}
          </button>
        </div>
      </form>

      {locks.length === 0 && !loading ? (
        <div className="text-xs text-stone-500 italic px-2 py-1">
          Nessun Hard-Lock attivo al momento. Aggiungi una stanza chiusa (es. Room 1, Room 2, Room 3) qui sopra per proteggerla automaticamente da riaperture su cancellazione o riduzione.
        </div>
      ) : (
        <div className="space-y-2">
          {locks.map(lock => (
            <div
              key={lock.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border ${
                lock.enabled
                  ? 'bg-stone-950/80 border-amber-500/40'
                  : 'bg-stone-950/30 border-stone-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <ShieldCheck className={`w-4 h-4 shrink-0 ${lock.enabled ? 'text-amber-400' : 'text-stone-500'}`} />
                <div className="min-w-0">
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>{lock.roomName}</span>
                    <span className="text-[10px] font-mono text-stone-400">#{lock.motherId}</span>
                    <span className="text-[11px] font-mono text-amber-300">
                      {formatDisplayDate(lock.dateFrom)} → {formatDisplayDate(lock.dateTo)}
                    </span>
                  </div>
                  {lock.reason && <div className="text-[11px] text-stone-400 truncate">{lock.reason}</div>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleLock(lock)}
                  disabled={submitting}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border cursor-pointer ${
                    lock.enabled
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-stone-900 text-stone-400 border-stone-700'
                  }`}
                >
                  {lock.enabled ? 'ATTIVO' : 'IN PAUSA'}
                </button>
                <button
                  type="button"
                  onClick={() => handleResealNow(lock)}
                  disabled={submitting}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
                >
                  Risigilla Ora
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLock(lock.id)}
                  disabled={submitting}
                  className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 cursor-pointer"
                  title="Rimuovi Hard-Lock"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
