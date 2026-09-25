import nodemailer from 'nodemailer';
import { sendDepartmentTelegramMessage } from './telegram.js';

/**
 * Identifica se una prenotazione Octorate è DIRETTA:
 * - Canale 233: Sito Web Diretto (Flower Power)
 * - Canale 270: octoevo (Inserimento manuale Reception / Backoffice in Octorate)
 * - Canale 288: octoevo autosubmit
 * Esclude tassativamente tutti i canali OTA esterni (Booking.com, Agoda, Airbnb, Expedia, etc.)
 */
export function isDirectReservation(booking: any): boolean {
  if (!booking) return false;

  const channelId = Number(booking.channelId || booking.channel || 0);
  const channelName = String(booking.channelName || booking.channel || '').toLowerCase().trim();

  // ID Canali Diretti Octorate
  if ([233, 270, 288].includes(channelId)) {
    return true;
  }

  // Se il nome canale corrisponde a prenotazione diretta interna
  if (
    channelName === 'octorate' ||
    channelName === 'octoevo' ||
    channelName === 'octoevo autosubmit' ||
    channelName === 'direct' ||
    channelName.includes('direct booking') ||
    channelName.includes('sito') ||
    channelName.includes('website') ||
    channelName.includes('reception') ||
    channelName.includes('walk-in')
  ) {
    return true;
  }

  // Se appartiene a canali OTA noti, NON è diretta
  if (
    channelName.includes('booking') ||
    channelName.includes('agoda') ||
    channelName.includes('airbnb') ||
    channelName.includes('expedia') ||
    channelName.includes('trip.com') ||
    channelName.includes('ctrip') ||
    channelName.includes('hostelworld')
  ) {
    return false;
  }

  return false;
}

/**
 * Genera il template HTML elegante con il brand Flower Power Village
 */
export function generateCancellationEmailHTML(params: {
  guestName: string;
  reservationId: string | number;
  checkIn: string;
  checkOut: string;
  roomName: string;
}): string {
  const { guestName, reservationId, checkIn, checkOut, roomName } = params;

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cancellazione Prenotazione - Flower Power Village</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e7e5e4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0a09; width: 100%;">
    <tr>
      <td align="center" style="padding: 30px 15px;">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #1c1917; border: 1px solid #292524; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 35px 25px 25px; background: linear-gradient(180deg, #1c1917 0%, #141210 100%); border-bottom: 1px solid #292524;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                FLOWER POWER VILLAGE
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 3px; color: #10b981; font-weight: 700; text-transform: uppercase;">
                Koh Phayam · Thailand
              </p>
            </td>
          </tr>

          <!-- Cancellation Notice Banner -->
          <tr>
            <td style="padding: 25px 30px 15px;">
              <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 16px 20px; text-align: center;">
                <span style="font-size: 12px; font-weight: 800; color: #f87171; letter-spacing: 1.5px; text-transform: uppercase;">
                  Conferma di Cancellazione Prenotazione
                </span>
                <p style="margin: 6px 0 0; font-size: 13px; color: #d6d3d1;">
                  La tua prenotazione <strong>#${reservationId}</strong> è stata cancellata con successo.
                </p>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 10px 30px 25px; line-height: 1.6; font-size: 14px; color: #d6d3d1;">
              <p style="margin-top: 0;">
                Gentile <strong>${guestName}</strong>,
              </p>
              <p>
                Ti confermiamo che la prenotazione per il tuo soggiorno presso il <strong>Flower Power Village</strong> è stata annullata nei nostri sistemi secondo la tua richiesta.
              </p>

              <!-- Booking Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #292524; border-radius: 14px; padding: 18px 20px; margin: 20px 0;">
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #a8a29e; text-transform: uppercase; font-weight: bold;">Riferimento:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #ffffff; font-family: monospace; font-weight: bold;">#${reservationId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #a8a29e; text-transform: uppercase; font-weight: bold;">Alloggio:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #ffffff; font-weight: bold;">${roomName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #a8a29e; text-transform: uppercase; font-weight: bold;">Check-in Previsto:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #10b981; font-weight: bold;">${checkIn}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #a8a29e; text-transform: uppercase; font-weight: bold;">Check-out Previsto:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; color: #10b981; font-weight: bold;">${checkOut}</td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #a8a29e; margin-bottom: 25px;">
                Qualora il tuo piano tariffario prevedesse un rimborso o se desideri riprogrammare il soggiorno in un altro periodo, il nostro staff è a tua completa disposizione.
              </p>

              <!-- Contacts Button -->
              <div style="text-align: center; margin: 25px 0 10px;">
                <a href="mailto:flowerpowerphayam@gmail.com" style="background-color: #10b981; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; border-radius: 12px; display: inline-block;">
                  Contatta la Reception
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 25px; background-color: #141210; border-top: 1px solid #292524; font-size: 11px; color: #78716c;">
              <p style="margin: 0 0 6px;">
                Flower Power Village · Aow Kao Beach, Koh Phayam, Ranong 85000, Thailand
              </p>
              <p style="margin: 0;">
                WhatsApp: +66 94 980 0200 · Email: flowerpowerphayam@gmail.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Gestisce la notifica di cancellazione per le sole prenotazioni dirette:
 * 1. Invia email personalizzata all'ospite tramite SMTP Gmail (flowerpowerphayam@gmail.com)
 * 2. Invia alert immediato sul gruppo Telegram del Villaggio (Koh Phayam)
 */
export async function handleDirectReservationCancellation(booking: any): Promise<{
  processed: boolean;
  emailSent: boolean;
  telegramNotified: boolean;
  reason?: string;
}> {
  if (!booking) {
    return { processed: false, emailSent: false, telegramNotified: false, reason: 'Nessun dato prenotazione' };
  }

  // 1. Verifica se è una prenotazione diretta (nostro sito o Octorate interno)
  if (!isDirectReservation(booking)) {
    console.log(`[Cancellation] Prenotazione #${booking.id} è da OTA (${booking.channelName || booking.channelId}). Nessuna email cliente inviata (Regola Solo Prenotazioni Dirette).`);
    
    // Invia comunque un alert informativo riservato allo STAFF su Telegram
    const otaAlertMsg = `ℹ️ <b>[Cancellazione OTA da PMS]</b>\n` +
      `Prenotazione: <b>#${booking.id}</b>\n` +
      `Canale: <b>${booking.channelName || 'OTA'}</b>\n` +
      `Ospite: <b>${booking.guestName || booking.firstName + ' ' + booking.lastName || 'N/D'}</b>\n` +
      `Date: <code>${(booking.checkin || '').slice(0, 10)} ➔ ${(booking.checkout || '').slice(0, 10)}</code>\n` +
      `🔒 <i>Nessuna email cliente inviata dal sito (gestita direttamente da ${booking.channelName || 'OTA'}).</i>`;
    
    sendDepartmentTelegramMessage('village', otaAlertMsg).catch(() => {});
    return { processed: false, emailSent: false, telegramNotified: true, reason: 'Prenotazione OTA: email cliente esclusa' };
  }

  const reservationId = booking.id;
  const guestName = (booking.guestName || `${booking.firstName || ''} ${booking.lastName || ''}`).trim() || 'Ospite';
  const guestEmail = (booking.guestMailAddress || booking.email || booking.customerEmail || '').trim();
  const roomName = booking.roomName || booking.room?.name || 'Alloggio Flower Power';
  const checkIn = (booking.checkin || booking.checkIn || '').slice(0, 10);
  const checkOut = (booking.checkout || booking.checkOut || '').slice(0, 10);
  const channelName = booking.channelName || (booking.channelId === 233 ? 'Sito Web Diretto' : 'Octorate Diretto');

  let emailSent = false;

  // 2. Invio Email Cliente tramite SMTP Gmail Flower Power
  if (guestEmail && guestEmail.includes('@')) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: true,
        auth: {
          user: process.env.SMTP_USER || "flowerpowerphayam@gmail.com",
          pass: process.env.SMTP_PASS || "feoz edoy nzrl glid",
        },
      });

      const htmlContent = generateCancellationEmailHTML({
        guestName,
        reservationId,
        checkIn,
        checkOut,
        roomName
      });

      await transporter.sendMail({
        from: `"Flower Power Village" <${process.env.SMTP_USER || "flowerpowerphayam@gmail.com"}>`,
        to: guestEmail,
        replyTo: "flowerpowerphayam@gmail.com",
        subject: `Cancellazione Confermata · Flower Power Village #${reservationId}`,
        html: htmlContent
      });

      emailSent = true;
      console.log(`[Cancellation] Email di cancellazione inviata con successo a ${guestEmail} per prenotazione #${reservationId}.`);
    } catch (mailErr: any) {
      console.error(`[Cancellation Error] Invio email fallito per #${reservationId}:`, mailErr);
    }
  } else {
    console.warn(`[Cancellation] Nessun indirizzo email valido trovato per la prenotazione diretta #${reservationId}.`);
  }

  // 3. Notifica Telegram al gruppo dello Staff del Villaggio
  let telegramNotified = false;
  try {
    const staffAlertMsg = `❌ <b>[Cancellazione Prenotazione Diretta]</b>\n` +
      `Prenotazione: <b>#${reservationId}</b>\n` +
      `Canale: <b>${channelName}</b>\n` +
      `Ospite: <b>${guestName}</b>\n` +
      `Alloggio: <b>${roomName}</b>\n` +
      `Date: <code>${checkIn} ➔ ${checkOut}</code>\n` +
      (emailSent 
        ? `📧 <b>Email cliente inviata con successo a:</b> <code>${guestEmail}</code>` 
        : `⚠️ <b>Email non inviata:</b> ${guestEmail ? 'Errore SMTP' : 'Email non presente'}`);

    const tgRes = await sendDepartmentTelegramMessage('village', staffAlertMsg);
    telegramNotified = tgRes.success;
  } catch (tgErr: any) {
    console.warn(`[Cancellation Warning] Telegram alert fallito per #${reservationId}:`, tgErr);
  }

  return {
    processed: true,
    emailSent,
    telegramNotified
  };
}
