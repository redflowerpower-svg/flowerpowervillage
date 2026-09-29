import nodemailer from "nodemailer";

interface ExtractedMetadata {
  cleanAddress: string;
  customerEmail: string;
  deliveryNotes: string;
  orderLang: "IT" | "EN" | "TH" | "DE";
  deviceId: string;
  discountAmount: number;
  promoCode?: string;
  isHotelGuest: boolean;
}

/**
 * Parses embedded bracket tags from the serialized address string:
 * e.g. "Ranong 85000 [ADDR_TH: ...] [COORD: 9.9,98.6] [EMAIL: user@example.com] [NOTE: Ring bell] [LANG: IT] [DID: ...] [PROMO: PIZZA2026] [DISCOUNT: 45] [HOTEL: true]"
 */
export function extractOrderMetadata(rawAddress?: string): ExtractedMetadata {
  if (!rawAddress) {
    return { cleanAddress: "Ranong", customerEmail: "", deliveryNotes: "", orderLang: "EN", deviceId: "", discountAmount: 0, promoCode: "", isHotelGuest: false };
  }

  const emailMatch = rawAddress.match(/\[EMAIL:\s*([^\]]+)\]/i);
  const noteMatch = rawAddress.match(/\[NOTE:\s*([^\]]+)\]/i);
  const langMatch = rawAddress.match(/\[LANG:\s*([^\]]+)\]/i);
  const didMatch = rawAddress.match(/\[DID:\s*([^\]]+)\]/i);
  const promoMatch = rawAddress.match(/\[PROMO:\s*([^\]]+)\]/i);
  const discountMatch = rawAddress.match(/\[DISCOUNT:\s*([^\]]+)\]/i);
  const hotelMatch = rawAddress.match(/\[HOTEL:\s*([^\]]+)\]/i);

  let cleanAddress = rawAddress
    .replace(/\[(COORD|ADDR_TH|EMAIL|NOTE|LANG|DID|PROMO|DISCOUNT|HOTEL):[^\]]+\]/gi, "")
    .trim();

  const customerEmail = emailMatch ? emailMatch[1].trim() : "";
  const deliveryNotes = noteMatch ? noteMatch[1].trim() : "";
  const rawLang = langMatch ? langMatch[1].trim().toUpperCase() : "EN";
  const orderLang = (["IT", "EN", "TH", "DE"].includes(rawLang) ? rawLang : "EN") as "IT" | "EN" | "TH" | "DE";
  const deviceId = didMatch ? didMatch[1].trim() : "";
  const promoCode = promoMatch ? promoMatch[1].trim().toUpperCase() : "";
  const discountAmount = discountMatch ? parseFloat(discountMatch[1].trim()) || 0 : 0;
  const isHotelGuest = hotelMatch ? hotelMatch[1].trim().toLowerCase() === "true" : false;

  return {
    cleanAddress: cleanAddress || "Ranong, Thailand",
    customerEmail,
    deliveryNotes,
    orderLang,
    deviceId,
    promoCode,
    discountAmount,
    isHotelGuest
  };
}

const copy = {
  received: {
    IT: {
      subject: (id: string | number) => `🍕 Ricevuta Ordine Flower Power Pizza Ranong #${id}`,
      title: "Grazie per il tuo ordine!",
      subtitle: "Abbiamo ricevuto la tua richiesta e la ricevuta di pagamento.",
      desc: "Il nostro staff ha preso in carico la comanda. Ti aggiorneremo non appena le pizze entreranno nel forno!",
      statusBadge: "ORDINE RICEVUTO & CONFERMATO",
      statusColor: "#059669"
    },
    EN: {
      subject: (id: string | number) => `🍕 Order Receipt Flower Power Pizza Ranong #${id}`,
      title: "Thank you for your order!",
      subtitle: "We have received your order and payment receipt.",
      desc: "Our kitchen staff has received your order. We'll update you as soon as your pizzas enter the oven!",
      statusBadge: "ORDER RECEIVED & CONFIRMED",
      statusColor: "#059669"
    },
    TH: {
      subject: (id: string | number) => `🍕 ใบเสร็จรับเงิน Flower Power Pizza Ranong #${id}`,
      title: "ขอบคุณสำหรับคำสั่งซื้อของคุณ!",
      subtitle: "เราได้รับออเดอร์และยืนยันการชำระเงินเรียบร้อยแล้ว",
      desc: "ทีมงานร้านพิซซ่าได้รับรายการอาหารแล้ว จะแจ้งเตือนทันทีที่พิซซ่าของคุณเริ่มเข้าเตาอบ!",
      statusBadge: "ได้รับออเดอร์และยืนยันแล้ว",
      statusColor: "#059669"
    },
    DE: {
      subject: (id: string | number) => `🍕 Bestellbeleg Flower Power Pizza Ranong #${id}`,
      title: "Vielen Dank für Ihre Bestellung!",
      subtitle: "Wir haben Ihre Bestellung und Zahlungsbeleg erhalten.",
      desc: "Unser Küchenteam hat die Bestellung aufgenommen. Wir benachrichtigen Sie, sobald Ihre Pizza in den Ofen kommt!",
      statusBadge: "BESTELLUNG BESTÄTIGT",
      statusColor: "#059669"
    }
  },
  preparing: {
    IT: {
      subject: (id: string | number) => `👨‍🍳 Pizza in Forno! Aggiornamento Ordine #${id}`,
      title: "La tua pizza è in forno!",
      subtitle: "Il nostro pizzaiolo ha iniziato la preparazione.",
      desc: "Prepariamo l'impasto con ingredienti freschi italiani. Appena sfornata, la pizza verrà affidata al rider.",
      statusBadge: "IN PREPARAZIONE / NEL FORNO",
      statusColor: "#d97706"
    },
    EN: {
      subject: (id: string | number) => `👨‍🍳 Pizza in the Oven! Order Update #${id}`,
      title: "Your pizza is in the oven!",
      subtitle: "Our pizzaiolo has started preparing your order.",
      desc: "Baked fresh with authentic Italian ingredients. As soon as it comes out of the oven, our rider will pick it up.",
      statusBadge: "IN PREPARATION / BAKING",
      statusColor: "#d97706"
    },
    TH: {
      subject: (id: string | number) => `👨‍🍳 พิซซ่ากำลังอบ! อัปเดตออเดอร์ #${id}`,
      title: "พิซซ่าของคุณกำลังเข้าเตาอบ!",
      subtitle: "เชฟของเราเริ่มเตรียมอาหารและอบพิซซ่าให้คุณแล้ว",
      desc: "อบสดใหม่ด้วยวัตถุดิบนำเข้าจากอิตาลี เมื่ออบเสร็จเรียบร้อยจะส่งมอบให้ไรเดอร์ออกเดินทางทันที",
      statusBadge: "กำลังอบ & เตรียมอาหาร",
      statusColor: "#d97706"
    },
    DE: {
      subject: (id: string | number) => `👨‍🍳 Pizza im Ofen! Bestell-Update #${id}`,
      title: "Ihre Pizza ist im Ofen!",
      subtitle: "Unser Pizzaiolo hat mit der Zubereitung begonnen.",
      desc: "Frisch zubereitet mit original italienischen Zutaten. Sobald sie fertig ist, macht sich der Fahrer auf den Weg.",
      statusBadge: "IN ZUBEREITUNG",
      statusColor: "#d97706"
    }
  },
  delivering: {
    IT: {
      subject: (id: string | number) => `🛵 Rider in Viaggio! Il tuo ordine #${id} sta arrivando`,
      title: "Il rider è partito!",
      subtitle: "Le tue pizze calde sono in arrivo all'indirizzo indicato.",
      desc: "Il nostro rider sta arrivando. Tieni il telefono vicino in caso di necessità per il citofono o l'ingresso.",
      statusBadge: "IN CONSEGNA / RIDER IN ARRIVO",
      statusColor: "#2563eb"
    },
    EN: {
      subject: (id: string | number) => `🛵 Rider on the Way! Your order #${id} is arriving`,
      title: "The rider has departed!",
      subtitle: "Your piping hot pizzas are on their way to your location.",
      desc: "Our delivery rider is en route. Please keep your phone handy in case they need directions upon arrival.",
      statusBadge: "OUT FOR DELIVERY",
      statusColor: "#2563eb"
    },
    TH: {
      subject: (id: string | number) => `🛵 ไรเดอร์ออกเดินทางแล้ว! ออเดอร์ #${id} กำลังไปส่ง`,
      title: "ไรเดอร์ออกเดินทางแล้ว!",
      subtitle: "พิซซ่าร้อนๆ กำลังเดินทางไปส่งตามที่อยู่ที่คุณระบุ",
      desc: "ไรเดอร์ของเรากำลังเดินทาง โปรดเปิดเสียงโทรศัพท์ไว้เผื่อกรณีติดต่อสอบถามจุดรับสินค้า",
      statusBadge: "กำลังจัดส่ง",
      statusColor: "#2563eb"
    },
    DE: {
      subject: (id: string | number) => `🛵 Fahrer unterwegs! Ihre Bestellung #${id} kommt`,
      title: "Der Fahrer ist unterwegs!",
      subtitle: "Ihre heißen Pizzen sind auf dem Weg zu Ihnen.",
      desc: "Unser Lieferfahrer ist unterwegs. Bitte halten Sie Ihr Telefon bereit, falls er Rückfragen zur Anfahrt hat.",
      statusBadge: "IN ZUSTELLUNG",
      statusColor: "#2563eb"
    }
  },
  completed: {
    IT: {
      subject: (id: string | number) => `✅ Ordine Consegnato! Buon Appetito #${id}`,
      title: "Ordine consegnato!",
      subtitle: "Buon appetito da tutto il team di Flower Power Pizza.",
      desc: "Speriamo che la nostra pizza italiana ti piaccia. Se ti fa piacere, lascia una recensione o scrivi al nostro WhatsApp!",
      statusBadge: "CONSEGNATO & COMPLETATO",
      statusColor: "#16a34a"
    },
    EN: {
      subject: (id: string | number) => `✅ Order Delivered! Enjoy your meal #${id}`,
      title: "Order delivered!",
      subtitle: "Enjoy your meal from the Flower Power Pizza team.",
      desc: "We hope you love your authentic Italian pizza. Feel free to leave a review or message us on WhatsApp!",
      statusBadge: "DELIVERED & COMPLETED",
      statusColor: "#16a34a"
    },
    TH: {
      subject: (id: string | number) => `✅ จัดส่งเรียบร้อย! ขอให้อร่อยกับมื้ออาหาร #${id}`,
      title: "จัดส่งเรียบร้อยแล้ว!",
      subtitle: "ขอให้เพลิดเพลินกับอาหารมื้ออร่อยจากทีมงาน Flower Power Pizza",
      desc: "เราหวังว่าคุณจะประทับใจรสชาติพิซซ่าอิตาเลียนแท้ๆ หากต้องการสั่งเพิ่มหรือมีข้อเสนอแนะ ติดต่อเราได้ตลอดเวลา!",
      statusBadge: "จัดส่งสำเร็จเรียบร้อย",
      statusColor: "#16a34a"
    },
    DE: {
      subject: (id: string | number) => `✅ Bestellung Geliefert! Guten Appetit #${id}`,
      title: "Bestellung erfolgreich geliefert!",
      subtitle: "Guten Appetit wünscht Ihnen das gesamte Flower Power Team.",
      desc: "Wir hoffen, unsere italienische Pizza schmeckt Ihnen. Hinterlassen Sie gerne ein Feedback auf WhatsApp!",
      statusBadge: "GELIEFERT & ABGESCHLOSSEN",
      statusColor: "#16a34a"
    }
  }
};

/**
 * Sends a multilingual branded email notification to the customer for pizza delivery orders
 */
export async function sendPizzaOrderEmail(
  order: any,
  eventType: "received" | "preparing" | "delivering" | "completed"
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  const smtpHost = process.env.PIZZA_SMTP_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.PIZZA_SMTP_PORT || process.env.SMTP_PORT || 465);
  const smtpUser = process.env.PIZZA_SMTP_USER || "flowerpowerpizzaranong.th@gmail.com";
  const smtpPass = (process.env.PIZZA_SMTP_PASS || process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (!smtpPass) {
    console.warn("[Pizza Email] SMTP password missing in environment variables. Skipping customer email.");
    return { success: false, skipped: true, error: "SMTP credentials not configured" };
  }

  const { cleanAddress, customerEmail, deliveryNotes, orderLang } = extractOrderMetadata(order.address);

  if (!customerEmail || !customerEmail.includes("@")) {
    console.log(`[Pizza Email] Order #${order.id} has no customer email address in metadata. Skipping email.`);
    return { success: false, skipped: true, error: "No customer email" };
  }

  const langKey = orderLang || "EN";
  const textGroup = copy[eventType] || copy.received;
  const t = textGroup[langKey] || textGroup.EN;

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsRows = items
    .map((item: any) => {
      const vName = typeof item.selectedVariant === "object" ? item.selectedVariant.name : item.selectedVariant;
      const extras = Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0
        ? item.selectedExtras.map((e: any) => e.name || e).join(", ")
        : "";
      const price = item.itemTotal || item.total || (item.basePrice ? item.basePrice * (item.quantity || 1) : 0);

      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e7e5e4;">
            <div style="font-weight: bold; color: #1c1917; font-size: 14px;">
              ${item.quantity}x ${item.name || item.nameIt || "Pizza"}
              ${vName ? `<span style="font-size: 12px; color: #78716c; font-weight: normal;"> (${vName})</span>` : ""}
            </div>
            ${item.nameTh ? `<div style="font-size: 12px; color: #a8a29e; font-style: italic;">${item.nameTh}</div>` : ""}
            ${extras ? `<div style="font-size: 11px; color: #b45309; padding-top: 2px;">+ Extra: ${extras}</div>` : ""}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e7e5e4; text-align: right; font-weight: bold; color: #8B1E1E; font-size: 14px; white-space: nowrap;">
            ${price} ฿
          </td>
        </tr>
      `;
    })
    .join("");

  const paymentLabel = order.payment_method?.includes("card")
    ? "💳 Credit / Debit Card (Online 3DS)"
    : order.payment_method?.includes("promptpay")
      ? "📱 PromptPay QR (Online)"
      : "💵 Cash on Delivery / Contanti";

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
                  <td align="center" style="background: linear-gradient(135deg, #8B1E1E 0%, #5c1010 100%); padding: 26px 20px 20px;">
                    <img src="https://flower-power-village.com/flower-power-pizza-logo-256.png" alt="Flower Power Pizza Ranong" style="width: 72px; height: 72px; object-fit: contain; margin-bottom: 10px; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 900;">FLOWER POWER PIZZA</h1>
                    <p style="color: #fde68a; margin: 4px 0 0; font-size: 12px; font-weight: bold; letter-spacing: 1px;">AUTHENTIC ITALIAN PIZZERIA · RANONG</p>
                  </td>
                </tr>

                <!-- Status Banner -->
                <tr>
                  <td style="padding: 24px 24px 16px; text-align: center;">
                    <div style="display: inline-block; padding: 6px 16px; background-color: ${t.statusColor}15; color: ${t.statusColor}; border: 1.5px solid ${t.statusColor}; border-radius: 999px; font-size: 11px; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 14px;">
                      ${t.statusBadge}
                    </div>
                    <h2 style="color: #1c1917; margin: 0 0 6px; font-size: 22px; font-weight: 900;">${t.title}</h2>
                    <p style="color: #78716c; margin: 0; font-size: 14px; line-height: 1.4;">${t.subtitle}</p>
                    <p style="color: #57534e; margin: 12px 0 0; font-size: 13px; line-height: 1.5; background-color: #fafaf9; padding: 12px; border-radius: 12px; border: 1px solid #f5f5f4;">${t.desc}</p>
                  </td>
                </tr>

                <!-- Order Info Card -->
                <tr>
                  <td style="padding: 0 24px 16px;">
                    <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 14px; padding: 14px 16px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px;">
                        <tr>
                          <td style="color: #78716c; padding-bottom: 6px;"><b>Order ID / หมายเลขออเดอร์:</b></td>
                          <td style="color: #1c1917; text-align: right; font-weight: bold; font-family: monospace; font-size: 13px; padding-bottom: 6px;">#${order.id}</td>
                        </tr>
                        <tr>
                          <td style="color: #78716c; padding-bottom: 6px;"><b>Customer / ลูกค้า:</b></td>
                          <td style="color: #1c1917; text-align: right; font-weight: bold; padding-bottom: 6px;">${order.customer_name || "Cliente"}</td>
                        </tr>
                        ${order.phone ? `
                        <tr>
                          <td style="color: #78716c; padding-bottom: 6px;"><b>Phone / เบอร์โทร:</b></td>
                          <td style="color: #1c1917; text-align: right; font-weight: bold; padding-bottom: 6px;">${order.phone}</td>
                        </tr>` : ""}
                        <tr>
                          <td style="color: #78716c; padding-bottom: 6px;"><b>Payment / ชำระโดย:</b></td>
                          <td style="color: #059669; text-align: right; font-weight: bold; padding-bottom: 6px;">${paymentLabel}</td>
                        </tr>
                        <tr>
                          <td style="color: #78716c;"><b>Address / ที่อยู่จัดส่ง:</b></td>
                          <td style="color: #1c1917; text-align: right; font-size: 11px; max-width: 240px;">${cleanAddress}</td>
                        </tr>
                        ${deliveryNotes ? `
                        <tr>
                          <td style="color: #b45309; padding-top: 6px;"><b>Notes / หมายเหตุ:</b></td>
                          <td style="color: #b45309; text-align: right; font-size: 11px; padding-top: 6px; font-weight: bold;">📝 ${deliveryNotes}</td>
                        </tr>` : ""}
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Items Breakdown -->
                <tr>
                  <td style="padding: 0 24px 20px;">
                    <h3 style="color: #1c1917; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px; border-bottom: 2px solid #8B1E1E; padding-bottom: 4px;">
                      Dettaglio Ordine / Order Summary
                    </h3>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${itemsRows}
                      <tr>
                        <td style="padding-top: 14px; font-size: 13px; color: #78716c;">Subtotale / Subtotal:</td>
                        <td style="padding-top: 14px; text-align: right; font-size: 13px; font-weight: bold; color: #1c1917;">${order.total} ฿</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 4px; font-size: 15px; font-weight: 900; color: #1c1917;">TOTALE / TOTAL:</td>
                        <td style="padding-top: 4px; text-align: right; font-size: 18px; font-weight: 900; color: #8B1E1E;">${order.total} ฿</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Contact & Support Footer -->
                <tr>
                  <td style="background-color: #1c1917; padding: 20px 24px; text-align: center; color: #a8a29e; font-size: 11px; border-top: 1px solid #292524;">
                    <p style="margin: 0 0 6px; color: #ffffff; font-weight: bold; font-size: 13px;">Flower Power Pizza Ranong</p>
                    <p style="margin: 0 0 10px;">Ban Bang Rin, Mueang Ranong District, Ranong 85000, Thailand</p>
                    <div style="margin: 8px 0;">
                      <a href="https://wa.me/66949800200" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size: 11px; margin: 0 4px;">
                        WhatsApp: +66 94 980 0200
                      </a>
                      <a href="tel:+66949800200" style="display: inline-block; background-color: #8B1E1E; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size: 11px; margin: 0 4px;">
                        Call: 0949.800.200
                      </a>
                    </div>
                    <p style="margin: 12px 0 0; color: #78716c; font-size: 10px;">© Flower Power Village & Pizza Ranong. Tutti i diritti riservati.</p>
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
      subject: t.subject(order.id),
      html: emailHtml
    });

    console.log(`[Pizza Email] Sent "${eventType}" email to ${customerEmail} for Order #${order.id} (MsgID: ${info.messageId})`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Pizza Email] Failed sending "${eventType}" email to ${customerEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}
