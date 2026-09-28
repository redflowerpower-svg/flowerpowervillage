import nodemailer from "nodemailer";

export interface TableReservationEmailPayload {
  id: string;
  customer_name: string;
  contact: string;
  email: string;
  guests: number | string;
  reservation_date: string;
  reservation_time: string;
  seating_area: string;
  notes?: string;
  lang?: "IT" | "EN" | "TH" | "DE";
}

const copy = {
  IT: {
    subject: (id: string) => `🍽️ Conferma Ricezione Prenotazione Tavolo #${id} - Flower Power Pizza Ranong`,
    statusBadge: "RICHIESTA PRESA IN CARICO",
    title: "Grazie per la tua prenotazione!",
    subtitle: "Abbiamo preso in carico la tua richiesta per Flower Power Pizza Ranong.",
    desc: "Il nostro staff ha registrato i dettagli del tuo tavolo. Ti aspettiamo con la nostra autentica pizza italiana e pasta fresca artigianale!",
    detailsTitle: "DETTAGLI DELLA PRENOTAZIONE",
    idLabel: "ID Prenotazione",
    nameLabel: "Nome Ospite",
    dateLabel: "Data",
    timeLabel: "Orario",
    guestsLabel: "Numero Ospiti",
    areaLabel: "Ambiente Scelto",
    contactLabel: "Recapito (Tel/LINE)",
    notesLabel: "Note Speciali",
    footerNotice: "Se desideri modificare l'orario o aggiungere richieste speciali, contattaci subito su WhatsApp o LINE.",
    areaIndoor: "Sala interna",
    areaOutdoor: "Tavoli esterni",
    areaHut: "Capanna tipica",
    areaAny: "Nessuna preferenza"
  },
  EN: {
    subject: (id: string) => `🍽️ Table Booking Request Confirmation #${id} - Flower Power Pizza Ranong`,
    statusBadge: "BOOKING RECEIVED",
    title: "Thank you for your reservation!",
    subtitle: "We have received your table booking request at Flower Power Pizza Ranong.",
    desc: "Our team has noted all your details. We look forward to welcoming you with authentic Italian pizza and homemade pasta!",
    detailsTitle: "BOOKING SUMMARY",
    idLabel: "Booking ID",
    nameLabel: "Guest Name",
    dateLabel: "Date",
    timeLabel: "Time",
    guestsLabel: "Guests",
    areaLabel: "Seating Area",
    contactLabel: "Contact (Phone/LINE)",
    notesLabel: "Special Notes",
    footerNotice: "Need to adjust your time or guest count? Feel free to reach out directly via WhatsApp or LINE.",
    areaIndoor: "Indoor Hall",
    areaOutdoor: "Outdoor Tables",
    areaHut: "Garden Hut",
    areaAny: "No Preference"
  },
  TH: {
    subject: (id: string) => `🍽️ ยืนยันการรับคำขอจองโต๊ะ #${id} - ฟลาวเวอร์ พาวเวอร์ พิซซ่า ระนอง`,
    statusBadge: "ได้รับข้อมูลการจองแล้ว",
    title: "ขอบคุณสำหรับการจองโต๊ะ!",
    subtitle: "เราได้รับคำขอจองโต๊ะของคุณที่ ฟลาวเวอร์ พาวเวอร์ พิซซ่า ระนอง เรียบร้อยแล้ว",
    desc: "พนักงานของร้านได้บันทึกข้อมูลการจองของท่านเรียบร้อยแล้ว แล้วพบกับพิซซ่าอิตาเลียนแท้และพาสต้าเส้นสดสูตรดั้งเดิม!",
    detailsTitle: "รายละเอียดการจองโต๊ะ",
    idLabel: "หมายเลขการจอง",
    nameLabel: "ชื่อผู้จอง",
    dateLabel: "วันที่",
    timeLabel: "เวลา",
    guestsLabel: "จำนวนท่าน",
    areaLabel: "โซนที่นั่ง",
    contactLabel: "ช่องทางติดต่อ (โทร/LINE)",
    notesLabel: "หมายเหตุเพิ่มเติม",
    footerNotice: "หากต้องการเปลี่ยนแปลงเวลาหรือสอบถามเพิ่มเติม สามารถทักหาเราทาง WhatsApp หรือ LINE ได้ทันที",
    areaIndoor: "ห้องด้านใน",
    areaOutdoor: "โต๊ะด้านนอก",
    areaHut: "ซุ้มกระท่อม",
    areaAny: "ทุกโซนที่ว่าง"
  },
  DE: {
    subject: (id: string) => `🍽️ Tischreservierung Eingangsbestätigung #${id} - Flower Power Pizza Ranong`,
    statusBadge: "RESERVIERUNG ERHALTEN",
    title: "Vielen Dank für Ihre Reservierung!",
    subtitle: "Wir haben Ihre Reservierungsanfrage bei Flower Power Pizza Ranong erhalten.",
    desc: "Unser Team hat alle Details erfasst. Wir freuen uns darauf, Sie mit authentischer italienischer Pizza und hausgemachter Pasta zu begrüßen!",
    detailsTitle: "RESERVIERUNGSDETAILS",
    idLabel: "Reservierungs-ID",
    nameLabel: "Gastname",
    dateLabel: "Datum",
    timeLabel: "Uhrzeit",
    guestsLabel: "Personen",
    areaLabel: "Bereich",
    contactLabel: "Kontakt (Tel/LINE)",
    notesLabel: "Besondere Wünsche",
    footerNotice: "Möchten Sie Zeit oder Personenanzahl anpassen? Kontaktieren Sie uns gerne direkt über WhatsApp oder LINE.",
    areaIndoor: "Innenbereich",
    areaOutdoor: "Außenbereich",
    areaHut: "Gartenhütte",
    areaAny: "Keine Präferenz"
  }
};

export async function sendTableReservationEmail(
  data: TableReservationEmailPayload
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  const customerEmail = data.email?.trim();
  if (!customerEmail || !customerEmail.includes("@")) {
    console.log(`[Table Email] Reservation #${data.id} has no valid email. Skipping.`);
    return { success: false, skipped: true, error: "No customer email provided" };
  }

  const smtpHost = process.env.PIZZA_SMTP_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.PIZZA_SMTP_PORT || process.env.SMTP_PORT || 465);
  const smtpUser = process.env.PIZZA_SMTP_USER || "flowerpowerpizzaranong.th@gmail.com";
  const smtpPass = (process.env.PIZZA_SMTP_PASS || "uwai psxe chzi pawb").replace(/\s+/g, "");

  if (!smtpPass) {
    console.warn("[Table Email] SMTP password missing. Skipping email.");
    return { success: false, skipped: true, error: "SMTP credentials not configured" };
  }

  const langKey = (data.lang && ["IT", "EN", "TH", "DE"].includes(data.lang) ? data.lang : "IT") as "IT" | "EN" | "TH" | "DE";
  const t = copy[langKey] || copy.IT;

  let areaName = t.areaAny;
  if (data.seating_area === "indoor") areaName = t.areaIndoor;
  else if (data.seating_area === "outdoor") areaName = t.areaOutdoor;
  else if (data.seating_area === "hut") areaName = t.areaHut;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 24px 12px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e7e5e4;">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #064e3b 0%, #043629 100%); padding: 26px 20px 20px;">
                    <img src="https://flower-power-village.com/flower-power-pizza-logo-256.png" alt="Flower Power Pizza Ranong" style="width: 72px; height: 72px; object-fit: contain; margin-bottom: 10px; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 900;">FLOWER POWER PIZZA</h1>
                    <p style="color: #a7f3d0; margin: 4px 0 0; font-size: 12px; font-weight: bold; letter-spacing: 1px;">RISTORANTE & PIZZERIA · RANONG</p>
                  </td>
                </tr>

                <!-- Status Banner -->
                <tr>
                  <td style="padding: 24px 24px 16px; text-align: center;">
                    <div style="display: inline-block; padding: 6px 16px; background-color: #064e3b15; color: #064e3b; border: 1.5px solid #064e3b; border-radius: 999px; font-size: 11px; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 14px;">
                      ✓ ${t.statusBadge}
                    </div>
                    <h2 style="color: #1c1917; margin: 0 0 6px; font-size: 22px; font-weight: 900;">${t.title}</h2>
                    <p style="color: #78716c; margin: 0; font-size: 14px; line-height: 1.4;">${t.subtitle}</p>
                    <p style="color: #57534e; margin: 12px 0 0; font-size: 13px; line-height: 1.5; background-color: #fafaf9; padding: 12px; border-radius: 12px; border: 1px solid #f5f5f4;">${t.desc}</p>
                  </td>
                </tr>

                <!-- Details Summary Card -->
                <tr>
                  <td style="padding: 0 24px 20px;">
                    <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 14px; padding: 16px 18px;">
                      <h3 style="color: #1c1917; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; border-bottom: 2px solid #064e3b; padding-bottom: 6px; font-weight: 900;">
                        ${t.detailsTitle}
                      </h3>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                        <tr>
                          <td style="color: #78716c; padding-bottom: 8px;"><b>${t.idLabel}:</b></td>
                          <td style="color: #064e3b; text-align: right; font-weight: 900; font-family: monospace; font-size: 14px; padding-bottom: 8px;">#${data.id}</td>
                        </tr>
                        <tr>
                          <td style="color: #78716c; padding-bottom: 8px;"><b>${t.nameLabel}:</b></td>
                          <td style="color: #1c1917; text-align: right; font-weight: bold; padding-bottom: 8px;">${data.customer_name}</td>
                        </tr>
                        <tr>
                          <td style="color: #78716c; padding-bottom: 8px;"><b>${t.dateLabel}:</b></td>
                          <td style="color: #1c1917; text-align: right; font-weight: bold; padding-bottom: 8px;">📅 ${data.reservation_date}</td>
                        </tr>
                        <tr>
                          <td style="color: #78716c; padding-bottom: 8px;"><b>${t.timeLabel}:</b></td>
                          <td style="color: #1c1917; text-align: right; font-weight: bold; padding-bottom: 8px;">🕒 ${data.reservation_time}</td>
                        </tr>
                        <tr>
                          <td style="color: #78716c; padding-bottom: 8px;"><b>${t.guestsLabel}:</b></td>
                          <td style="color: #1c1917; text-align: right; font-weight: bold; padding-bottom: 8px;">👥 ${data.guests}</td>
                        </tr>
                        <tr>
                          <td style="color: #78716c; padding-bottom: 8px;"><b>${t.areaLabel}:</b></td>
                          <td style="color: #064e3b; text-align: right; font-weight: 900; padding-bottom: 8px;">${areaName}</td>
                        </tr>
                        <tr>
                          <td style="color: #78716c; padding-bottom: 8px;"><b>${t.contactLabel}:</b></td>
                          <td style="color: #1c1917; text-align: right; font-size: 12px; padding-bottom: 8px;">${data.contact}</td>
                        </tr>
                        ${data.notes ? `
                        <tr>
                          <td style="color: #b45309; padding-top: 6px;"><b>${t.notesLabel}:</b></td>
                          <td style="color: #b45309; text-align: right; font-size: 12px; padding-top: 6px; font-style: italic;">📝 ${data.notes}</td>
                        </tr>` : ""}
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Direct Support Links -->
                <tr>
                  <td style="padding: 0 24px 20px; text-align: center;">
                    <p style="color: #78716c; font-size: 12px; margin: 0 0 12px; line-height: 1.4;">${t.footerNotice}</p>
                    <div style="margin: 4px 0;">
                      <a href="https://wa.me/66949800200" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 10px; font-weight: bold; font-size: 12px; margin: 0 4px;">
                        WhatsApp Chat
                      </a>
                      <a href="https://line.me/ti/p/fdvhy-V1dH" style="display: inline-block; background-color: #06C755; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 10px; font-weight: bold; font-size: 12px; margin: 0 4px;">
                        LINE Chat
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Contact & Support Footer -->
                <tr>
                  <td style="background-color: #1c1917; padding: 20px 24px; text-align: center; color: #a8a29e; font-size: 11px; border-top: 1px solid #292524;">
                    <p style="margin: 0 0 6px; color: #ffffff; font-weight: bold; font-size: 13px;">Flower Power Pizza Ranong</p>
                    <p style="margin: 0 0 10px;">Ban Bang Rin, Mueang Ranong District, Ranong 85000, Thailand</p>
                    <p style="margin: 8px 0 0; color: #78716c; font-size: 10px;">© Flower Power Village & Pizza Ranong. Tutti i diritti riservati.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const info = await transporter.sendMail({
      from: `"Flower Power Pizza Ranong" <${smtpUser}>`,
      to: customerEmail,
      subject: t.subject(data.id),
      html: emailHtml
    });

    console.log(`[Table Email] Sent confirmation email to ${customerEmail} for Reservation #${data.id} (MsgID: ${info.messageId})`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Table Email] Failed sending email to ${customerEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}
