import React, { useState } from 'react';
import { ShieldAlert, MessageCircle, Mail, CheckCircle, AlertCircle, Loader2, Phone } from 'lucide-react';
import { useResortAdminStore } from '../store/useResortAdminStore';

/**
 * PhishingAlertSection — Pannello Admin Resort per l'invio di avvisi di sicurezza
 * ai clienti con prenotazioni future in caso di violazione dati Octorate.
 * Scope: /src/admin/resort (compartimento stagno, non interagisce con /pizze).
 */

function normalizePhone(phone: string): string {
  if (!phone) return '';
  let c = phone.replace(/[\s\-().+]/g, '');
  // Rimuovi il + iniziale (già fatto sopra)
  // Se inizia con 0, converti al formato internazionale tailandese (+66)
  if (c.startsWith('0')) {
    c = '66' + c.substring(1);
  }
  // Se ancora presente un + (es. +66...) lo rimuoviamo
  c = c.replace(/^\+/, '');
  return c;
}

const WA_MESSAGE = encodeURIComponent(
  '⚠️ SECURITY ALERT — Flower Power Village ⚠️\n\n' +
  'Dear guest, we are informing you that our booking system Octorate ' +
  'has reported a potential data breach. ' +
  'If you receive any message requesting extra payments or asking you to click links, ' +
  'DO NOT COMPLY and block the sender immediately.\n\n' +
  'We will NEVER ask for additional payments via WhatsApp or unknown email addresses.\n\n' +
  '— Flower Power Village Team, Koh Phayam 🌸'
);

export const PhishingAlertSection: React.FC = () => {
  const rawOctorateBookings = useResortAdminStore((state) => state.rawOctorateBookings);

  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailResult, setEmailResult] = useState<Record<string, 'ok' | 'err'>>({});
  const [sendingAll, setSendingAll] = useState(false);
  const [allResult, setAllResult] = useState<'ok' | 'err' | null>(null);

  // Filtra solo prenotazioni future (checkin >= oggi)
  const todayStr = new Date().toISOString().slice(0, 10);
  const futureBookings = (rawOctorateBookings || []).filter((b: any) => {
    const checkin = String(b.checkin || b.check_in || b.checkIn || '');
    return checkin >= todayStr;
  });

  // Estrae il guest object in modo difensivo (struttura Octorate variabile)
  const getGuest = (b: any) => b.guest || b.customer || b.reservation?.guest || {};

  const getGuestName = (b: any) => {
    const g = getGuest(b);
    const family = g.familyName || g.lastName || g.surname || '';
    const given = g.givenName || g.firstName || g.name || '';
    return `${family} ${given}`.trim() || b.guest_name || 'Ospite';
  };

  const getPhone = (b: any) => {
    const g = getGuest(b);
    return g.phone || g.mobile || g.telephone || b.guest_phone || '';
  };

  const getEmail = (b: any) => {
    const g = getGuest(b);
    return g.email || b.guest_email || '';
  };

  const getCheckin = (b: any) =>
    String(b.checkin || b.check_in || b.checkIn || '').slice(0, 10);

  // Invia email singola via /api/resort/email-alerts
  const handleSendEmail = async (b: any) => {
    const email = getEmail(b);
    if (!email) return;
    const bookingId = String(b.id || b.reservationId || Math.random());
    setSendingEmail(bookingId);
    try {
      const res = await fetch('/api/resort/email-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [email], guestName: getGuestName(b) }),
      });
      setEmailResult((prev) => ({ ...prev, [bookingId]: res.ok ? 'ok' : 'err' }));
    } catch {
      setEmailResult((prev) => ({ ...prev, [bookingId]: 'err' }));
    } finally {
      setSendingEmail(null);
    }
  };

  // Invio massivo a tutti i clienti con email
  const handleSendAll = async () => {
    const emailList = futureBookings
      .map((b: any) => getEmail(b))
      .filter(Boolean);
    if (emailList.length === 0) return;
    setSendingAll(true);
    setAllResult(null);
    try {
      const res = await fetch('/api/resort/email-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList }),
      });
      setAllResult(res.ok ? 'ok' : 'err');
    } catch {
      setAllResult('err');
    } finally {
      setSendingAll(false);
    }
  };

  const emailCount = futureBookings.filter((b: any) => getEmail(b)).length;
  const waCount = futureBookings.filter((b: any) => getPhone(b)).length;

  return (
    <div className="bg-rose-950/20 border-2 border-rose-500/40 rounded-3xl p-5 sm:p-6 shadow-xl shadow-rose-950/30 space-y-5 ring-1 ring-rose-500/10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-300 flex-shrink-0 shadow shadow-rose-900/40">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              📨 Messaggi Clienti
            </h3>
            <p className="text-stone-400 text-xs font-medium">
              Invia comunicazioni e avvisi di sicurezza ai clienti
              con prenotazioni future (WhatsApp e Email).
            </p>
          </div>
        </div>
        <span className="bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          Comunicazioni Ospiti
        </span>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-3 text-center space-y-1">
          <div className="text-2xl font-black text-white">{futureBookings.length}</div>
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Prenotazioni Future</div>
        </div>
        <div className="bg-green-950/30 border border-green-700/30 rounded-2xl p-3 text-center space-y-1">
          <div className="text-2xl font-black text-green-400">{waCount}</div>
          <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Con WhatsApp</div>
        </div>
        <div className="bg-blue-950/30 border border-blue-700/30 rounded-2xl p-3 text-center space-y-1">
          <div className="text-2xl font-black text-blue-400">{emailCount}</div>
          <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Con Email</div>
        </div>
      </div>

      {/* Invio Massivo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-950/30 border border-rose-500/25 rounded-2xl p-4">
        <div className="space-y-1">
          <p className="text-sm font-black text-rose-300">
            📣 Invio Massivo a Tutti i Clienti
          </p>
          <p className="text-xs text-stone-400">
            Manda l'avviso di sicurezza via email a tutti i {emailCount} ospiti
            con prenotazione futura che hanno fornito un indirizzo email.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleSendAll}
            disabled={sendingAll || emailCount === 0}
            className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            {sendingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Invio in corso...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Invia Email a Tutti ({emailCount})</span>
              </>
            )}
          </button>
          {allResult && (
            <span className={`text-[10px] font-bold flex items-center gap-1 ${
              allResult === 'ok' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {allResult === 'ok'
                ? <><CheckCircle className="w-3 h-3" /> Email inviate con successo</>
                : <><AlertCircle className="w-3 h-3" /> Errore invio email</>
              }
            </span>
          )}
        </div>
      </div>

      {/* Tabella Clienti */}
      {futureBookings.length === 0 ? (
        <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-8 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-stone-600 mx-auto" />
          <p className="text-stone-400 text-sm font-semibold">Nessuna prenotazione futura trovata.</p>
          <p className="text-stone-600 text-xs">
            Il pannello mostra solo i clienti con check-in da oggi in poi.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-950/40">
          <table className="w-full text-left text-xs text-stone-200">
            <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 text-[10px] uppercase font-extrabold tracking-wider">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Arrivo</th>
                <th className="p-3">Contatti</th>
                <th className="p-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {futureBookings.map((b: any) => {
                const bookingId = String(b.id || b.reservationId || Math.random());
                const guestName = getGuestName(b);
                const phone = getPhone(b);
                const email = getEmail(b);
                const checkin = getCheckin(b);
                const waLink = phone
                  ? `https://wa.me/${normalizePhone(phone)}?text=${WA_MESSAGE}`
                  : '#';
                const result = emailResult[bookingId];

                return (
                  <tr key={bookingId} className="hover:bg-stone-900/40 transition-colors">
                    <td className="p-3 font-bold text-white">{guestName}</td>
                    <td className="p-3 font-mono text-amber-400">{checkin || '—'}</td>
                    <td className="p-3 space-y-1">
                      {phone && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Phone className="w-3 h-3" />
                          <span className="font-mono text-[10px]">{phone}</span>
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center gap-1 text-blue-400">
                          <Mail className="w-3 h-3" />
                          <span className="font-mono text-[10px] truncate max-w-[180px]">{email}</span>
                        </div>
                      )}
                      {!phone && !email && (
                        <span className="text-stone-600 text-[10px]">Nessun contatto</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">

                        {/* Pulsante WhatsApp */}
                        {phone && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all"
                            title={`Invia avviso WhatsApp a ${guestName}`}
                          >
                            <MessageCircle className="w-3 h-3" />
                            WA
                          </a>
                        )}

                        {/* Pulsante Email */}
                        {email && (
                          <button
                            type="button"
                            onClick={() => handleSendEmail(b)}
                            disabled={sendingEmail === bookingId}
                            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                            title={`Invia avviso email a ${email}`}
                          >
                            {sendingEmail === bookingId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : result === 'ok' ? (
                              <CheckCircle className="w-3 h-3 text-emerald-300" />
                            ) : result === 'err' ? (
                              <AlertCircle className="w-3 h-3 text-red-300" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            Email
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Nota di sicurezza */}
      <p className="text-[10px] text-stone-500 font-mono italic">
        * Il messaggio WhatsApp è un template precompilato. Il tasto Email invia
        tramite SMTP configurato in variabili d'ambiente (SMTP_HOST / SMTP_USER / SMTP_PASS).
        Nessun dato viene inviato a servizi terzi non autorizzati.
      </p>

    </div>
  );
};
