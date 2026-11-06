import { VercelRequest, VercelResponse } from "@vercel/node";
import { processBookingInquiry } from "../_helpers/ai-booking-concierge.js";

const META_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "flowerpower_meta_secure_webhook_2026";
const WHATSAPP_CLOUD_API_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN || "";
const META_PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || "";
const GRAPH_API_VERSION = "v21.0";

// Memory cache to prevent processing duplicate messages from Meta retries
const processedMessageIds = new Set<string>();
function isDuplicate(messageId?: string): boolean {
  if (!messageId) return false;
  if (processedMessageIds.has(messageId)) return true;
  processedMessageIds.add(messageId);
  setTimeout(() => processedMessageIds.delete(messageId), 10 * 60 * 1000);
  return false;
}

export async function handleMetaWebhook(req: VercelRequest, res: VercelResponse) {
  // ----------------------------------------------------
  // 1. GET: HANDSHAKE DI VERIFICA META DEVELOPERS
  // ----------------------------------------------------
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
      console.log("[Meta Webhook GET] Handshake completato con successo!");
      // Risposta in testo semplice richiesta da Meta (HTTP 200 + challenge)
      return res.status(200).send(challenge);
    }

    console.warn("[Meta Webhook GET] Token mismatch o richiesta non valida:", token);
    return res.status(403).send("Verification token mismatch");
  }

  // ----------------------------------------------------
  // 2. POST: RICEZIONE MESSAGGI (WhatsApp, Messenger, Instagram)
  // ----------------------------------------------------
  if (req.method === "POST") {
    const body = req.body;
    if (!body || !body.object) {
      return res.status(400).send("Bad request");
    }

    // ⚡ REGOLA D'ORO META: rispondi subito 200 OK per evitare retry a catena
    res.status(200).send("EVENT_RECEIVED");

    try {
      // A) WHATSAPP CLOUD API
      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === "messages") {
              const val = change.value;
              const phoneNumberId = val?.metadata?.phone_number_id;
              for (const msg of val?.messages || []) {
                if (isDuplicate(msg.id)) continue;

                const text = msg.text?.body || msg.caption || "";
                if (text.trim()) {
                  console.log(`[WhatsApp Inbound] Da: ${msg.from} - Testo: "${text}"`);

                  // Inoltro all'IA Concierge del Villaggio
                  const aiResult = await processBookingInquiry({
                    text: text.trim(),
                    currentDate: new Date()
                  });

                  const replyText = aiResult?.reply;
                  if (replyText && WHATSAPP_CLOUD_API_TOKEN && phoneNumberId) {
                    await sendWhatsAppMessage(phoneNumberId, msg.from, replyText);
                  }
                }
              }
            }
          }
        }
      }

      // B) FACEBOOK MESSENGER & INSTAGRAM DIRECT
      if (body.object === "page" || body.object === "instagram") {
        for (const entry of body.entry || []) {
          const events = [...(entry.messaging || []), ...(entry.standby || [])];
          for (const ev of events) {
            if (ev.message && !ev.message.is_echo && ev.message.text) {
              if (isDuplicate(ev.message.mid)) continue;

              const text = ev.message.text.trim();
              const senderId = ev.sender?.id;
              console.log(`[Meta Messenger/Instagram Inbound] Da: ${senderId} - Testo: "${text}"`);

              const aiResult = await processBookingInquiry({
                text,
                currentDate: new Date()
              });

              const replyText = aiResult?.reply;
              if (replyText && META_PAGE_ACCESS_TOKEN && senderId) {
                await sendMetaPageMessage(senderId, replyText);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error("[Meta Webhook Processing Error]:", err?.message || err);
    }
    return;
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function sendWhatsAppMessage(phoneNumberId: string, toPhone: string, text: string) {
  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_CLOUD_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhone,
        type: "text",
        text: { preview_url: false, body: text }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[WhatsApp Send Error]:", res.status, err);
    } else {
      console.log(`[WhatsApp Outbound] Risposta inviata con successo a ${toPhone}`);
    }
  } catch (err: any) {
    console.error("[WhatsApp Send Network Error]:", err?.message);
  }
}

async function sendMetaPageMessage(recipientId: string, text: string) {
  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages?access_token=${META_PAGE_ACCESS_TOKEN}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[Meta Page Send Error]:", res.status, err);
    } else {
      console.log(`[Meta Page Outbound] Risposta inviata con successo a ${recipientId}`);
    }
  } catch (err: any) {
    console.error("[Meta Page Send Network Error]:", err?.message);
  }
}
