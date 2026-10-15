import { sendDepartmentTelegramMessage } from "./telegram.js";

export interface CanonicalAccommodation {
  key: string;
  name: string;
  motherId: number;
  linkedKeys?: string[];
}

function resolveCanonicalAccommodation(
  booking: any,
  accommodationsMap?: Record<string, { motherId: number; name: string; ids: string[]; keywords: string[][]; linkedKeys?: string[] }>
): CanonicalAccommodation | null {
  if (!booking || !accommodationsMap) return null;
  const bProduct = String(booking.product || booking.pmsProduct || booking.accommodation_id || booking.roomId || '').trim();
  const bName = String(booking.roomName || booking.accommodation_name || booking.room_name || '').toLowerCase().trim();

  // 1. Direct match by Product ID in rate plans map
  if (bProduct) {
    for (const [key, entry] of Object.entries(accommodationsMap)) {
      if (entry.ids.includes(bProduct)) {
        return { key, name: entry.name, motherId: entry.motherId, linkedKeys: entry.linkedKeys };
      }
    }
  }

  // 2. Fuzzy match by name/keywords
  if (bName) {
    if (bName.includes('jvr') || bName.includes('right')) {
      return { key: 'jungle villa right', name: 'Jungle Villa Right', motherId: 495796, linkedKeys: ['jungle villa'] };
    }
    if (bName.includes('jvl') || bName.includes('left')) {
      return { key: 'jungle villa left', name: 'Jungle Villa Left', motherId: 495795, linkedKeys: ['jungle villa'] };
    }

    for (const [key, entry] of Object.entries(accommodationsMap)) {
      const matchAllGroups = entry.keywords.every(group => group.some(kw => bName.includes(kw)));
      if (matchAllGroups) {
        return { key, name: entry.name, motherId: entry.motherId, linkedKeys: entry.linkedKeys };
      }
    }
  }

  return null;
}

function formatDeltaTime(date1Str: string, date2Str: string): string {
  if (!date1Str || !date2Str) return 'N/A';
  const t1 = new Date(date1Str).getTime();
  const t2 = new Date(date2Str).getTime();
  if (isNaN(t1) || isNaN(t2)) return 'N/A';
  const diffSec = Math.abs(Math.round((t2 - t1) / 1000));
  if (diffSec < 60) return `${diffSec} secondi di distanza`;
  const diffMin = Math.floor(diffSec / 60);
  const remSec = diffSec % 60;
  if (diffMin < 60) return `${diffMin} min e ${remSec} sec di distanza`;
  const diffHours = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  return `${diffHours} ore e ${remMin} min di distanza`;
}

function formatThaiDateTime(raw: string): string {
  if (!raw) return 'N/A';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Asia/Bangkok',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(d) + ' (Thailandia UTC+7)';
  } catch {
    return raw;
  }
}

/**
 * Scansiona le prenotazioni attive per rilevare collisioni/overbooking su alloggi identici o collegati,
 * inviando una notifica istantanea su Telegram per ogni nuovo conflitto rilevato (con deduplicazione).
 */
export async function checkAndNotifyOverbookings(
  bookings: any[],
  supabaseAdmin: any,
  accommodationsMap?: Record<string, { motherId: number; name: string; ids: string[]; keywords: string[][]; linkedKeys?: string[] }>
): Promise<{ detected: number; notified: number }> {
  if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
    return { detected: 0, notified: 0 };
  }

  // 1. Filtra solo prenotazioni attive / confermate
  const activeBookings = bookings.filter(b => {
    const st = String(b.status || '').toUpperCase().trim();
    return st !== 'CANCELLED' && st !== 'CANCELED' && st !== 'DELETED' && st !== 'VOID' && st !== 'REJECTED' && !b.cancelled && !b.isCancelled;
  });

  // 2. Mappa ciascuna prenotazione al suo alloggio canonico
  interface ResolvedBooking {
    raw: any;
    id: string;
    canonical: CanonicalAccommodation;
    checkin: string;
    checkout: string;
    created: string;
    guestName: string;
    channel: string;
    totalPrice: string;
  }

  const mappedList: ResolvedBooking[] = [];
  for (const b of activeBookings) {
    const canonical = resolveCanonicalAccommodation(b, accommodationsMap);
    if (!canonical) continue;

    const cin = String(b.checkin || b.checkIn || '').slice(0, 10);
    const cout = String(b.checkout || b.checkOut || '').slice(0, 10);
    if (!cin || !cout) continue;

    const bookerGuest = (b.guests || []).find((g: any) => g.type === 'BOOKER') || b.guests?.[0];
    const guestName = bookerGuest
      ? `${bookerGuest.givenName || ''} ${bookerGuest.familyName || ''}`.trim()
      : (`${b.firstName || ''} ${b.lastName || ''}`.trim() || b.guestName || 'Ospite OTA');

    mappedList.push({
      raw: b,
      id: String(b.id),
      canonical,
      checkin: cin,
      checkout: cout,
      created: b.createTime || b.created || b.creationDate || '',
      guestName: guestName || 'Ospite Non Specificato',
      channel: b.channelName || b.channel || b.ota || 'OTA',
      totalPrice: `${b.totalPaid || b.totalGross || b.totalPrice || 'N/A'} ${b.currency || 'THB'}`
    });
  }

  let detectedCount = 0;
  let notifiedCount = 0;

  // 3. Verifica sovrapposizioni tra tutte le coppie di prenotazioni
  for (let i = 0; i < mappedList.length; i++) {
    for (let j = i + 1; j < mappedList.length; j++) {
      const b1 = mappedList[i];
      const b2 = mappedList[j];

      // Verifichiamo se competono per lo stesso alloggio fisico:
      // Caso A: Stesso alloggio (es. Penthouse vs Penthouse)
      // Caso B: Alloggi collegati (es. Jungle Villa intera vs Jungle Villa Left o Right)
      const isSameRoom = b1.canonical.key === b2.canonical.key;
      const isLinked = (b1.canonical.linkedKeys && b1.canonical.linkedKeys.includes(b2.canonical.key)) ||
                       (b2.canonical.linkedKeys && b2.canonical.linkedKeys.includes(b1.canonical.key));

      if (!isSameRoom && !isLinked) continue;

      // Condizione canonica di overlap di date: b1.checkin < b2.checkout AND b2.checkin < b1.checkout
      if (b1.checkin < b2.checkout && b2.checkin < b1.checkout) {
        detectedCount++;

        // Ordina cronologicamente le due prenotazioni (chi è arrivato prima)
        const [firstBooking, secondBooking] = (b1.created && b2.created && b1.created <= b2.created)
          ? [b1, b2]
          : [b2, b1];

        // Chiave univoca di collisione per deduplicazione nel database
        const sortedIds = [b1.id, b2.id].sort();
        const collisionKey = `overbooking_${sortedIds[0]}_${sortedIds[1]}`;

        // 4. Verifica se abbiamo già inviato l'allarme per questa coppia
        if (supabaseAdmin) {
          try {
            const { data: existing } = await supabaseAdmin
              .from('telegram_config')
              .select('id')
              .eq('id', collisionKey)
              .maybeSingle();

            if (existing && existing.id) {
              // Già notificato in precedenza, non spammare la chat dello staff
              continue;
            }
          } catch (dbErr) {
            console.warn('[Overbooking Detector] Errore verifica notifica esistente:', dbErr);
          }
        }

        // 5. Costruzione messaggio di emergenza per lo Staff Village
        const deltaTime = formatDeltaTime(firstBooking.created, secondBooking.created);
        const roomTitle = isSameRoom
          ? firstBooking.canonical.name
          : `${firstBooking.canonical.name} ⚡ ${secondBooking.canonical.name} (Conflitto Unità Collegata)`;

        const alertMessage = 
`🚨 <b>ALLERTA OVERBOOKING IMMEDIATA!</b>
━━━━━━━━━━━━━━━━━━━━
🏨 <b>Alloggio:</b> <b>${roomTitle}</b>
📅 <b>Periodo Conflitto:</b> ${firstBooking.checkin} ➔ ${firstBooking.checkout}

<b>1️⃣ Prima Prenotazione Ricevuta:</b>
• <b>Ospite:</b> ${firstBooking.guestName}
• <b>Canale:</b> ${firstBooking.channel} (ID <code>#${firstBooking.id}</code>)
• <b>Data Creazione:</b> ${formatThaiDateTime(firstBooking.created)}
• <b>Importo:</b> ${firstBooking.totalPrice}

<b>2️⃣ Seconda Prenotazione (Overbooking):</b>
• <b>Ospite:</b> ${secondBooking.guestName}
• <b>Canale:</b> ${secondBooking.channel} (ID <code>#${secondBooking.id}</code>)
• <b>Data Creazione:</b> ${formatThaiDateTime(secondBooking.created)}
• <b>Importo:</b> ${secondBooking.totalPrice}
• <b>Scarto Temporale:</b> ⏱️ <b>${deltaTime}</b>

━━━━━━━━━━━━━━━━━━━━
⚠️ <b>Azione Richiesta:</b>
Verificare tempestivamente l'alloggio per contattare i clienti o il supporto OTA per una riallocazione protetta.`;

        console.log(`[Overbooking Detector] 🚨 Rilevato overbooking #${firstBooking.id} & #${secondBooking.id} su ${roomTitle}. Invio Telegram...`);

        try {
          const telegramRes = await sendDepartmentTelegramMessage('village', alertMessage);
          if (telegramRes.success) {
            notifiedCount++;
            console.log(`[Overbooking Detector] ✅ Alert Telegram inviato con successo per collisione ${collisionKey}.`);

            // Salva nel database per deduplicazione futura
            if (supabaseAdmin) {
              await supabaseAdmin.from('telegram_config').upsert({
                id: collisionKey,
                bot_token: 'notified',
                chat_id: `${firstBooking.id}:${secondBooking.id}`,
                updated_at: new Date().toISOString()
              });
            }
          } else {
            console.error(`[Overbooking Detector] ❌ Errore invio Telegram:`, telegramRes.error);
          }
        } catch (tgErr) {
          console.error(`[Overbooking Detector] ❌ Errore critico invio Telegram:`, tgErr);
        }
      }
    }
  }

  return { detected: detectedCount, notified: notifiedCount };
}
