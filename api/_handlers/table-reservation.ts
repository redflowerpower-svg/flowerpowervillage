import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getTelegramCredentials } from "../_helpers/telegram.js";
import { sendTableReservationEmail } from "../_helpers/table-reservation-email.js";
import type { TableReservationData } from "../_helpers/table-reservation-parser.js";
import { 
  AREA_LABELS, 
  serializeTableReservationToAddress, 
  parseTableReservationFromOrder, 
  escapeHtml 
} from "../_helpers/table-reservation-parser.js";

export type { TableReservationData };

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function handleTableReservation(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 0. DELETE: Remove table reservation / order permanently
  if (req.method === 'DELETE' || req.body?.action === 'delete') {
    const id = req.body?.id || (req.query?.id as string);
    if (!id) {
      return res.status(400).json({ error: 'Missing id' });
    }
    if (supabase) {
      try {
        await supabase.from('pizza_orders').delete().eq('id', id);
        return res.status(200).json({ success: true, deleted: true, id });
      } catch (err: any) {
        return res.status(500).json({ error: 'Failed to delete table reservation', message: err.message });
      }
    }
    return res.status(200).json({ success: true, deleted: true, id });
  }

  // 1. GET: Fetch list of reservations (from pizza_orders table where payment_method is table_reservation)
  if (req.method === 'GET') {
    if (!supabase) {
      return res.status(200).json({ reservations: [] });
    }
    try {
      const { data, error } = await supabase
        .from('pizza_orders')
        .select('*')
        .or('payment_method.eq.table_reservation,payment_method.eq.table')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('[TableReservation GET] Error querying pizza_orders:', error.message);
        return res.status(200).json({ reservations: [] });
      }

      const reservations: TableReservationData[] = (data || []).map(order => parseTableReservationFromOrder(order));
      return res.status(200).json({ reservations });
    } catch (e: any) {
      console.warn('[TableReservation GET] Exception:', e);
      return res.status(200).json({ reservations: [] });
    }
  }

  // 2. PATCH: Update reservation status (e.g. from Kitchen Tablet KDS or Admin Dashboard)
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: 'Missing id or status' });
    }

    const isApproved = status === 'confirmed' || status === 'preparing' || status === 'completed';
    const isCancelled = status === 'cancelled' || status === 'rejected';

    if (supabase) {
      try {
        const { data: currentOrder } = await supabase
          .from('pizza_orders')
          .select('*')
          .eq('id', id)
          .single();

        let updatedAddress = currentOrder?.address || '';
        if (isCancelled && !updatedAddress.includes('[CANCELLED]')) {
          updatedAddress += ' [CANCELLED:true]';
        } else if (isApproved && updatedAddress.includes('[CANCELLED')) {
          updatedAddress = updatedAddress.replace(/\s*\[CANCELLED:[^\]]+\]/gi, '').replace(/\s*\[CANCELLED\]/gi, '');
        }

        const dbStatus = isApproved ? 'completed' : isCancelled ? 'cancelled' : 'new';

        const { data: updatedOrder, error: patchErr } = await supabase
          .from('pizza_orders')
          .update({ 
            status: dbStatus,
            address: updatedAddress 
          })
          .eq('id', id)
          .select('*')
          .single();

        if (patchErr) {
          console.warn('[TableReservation PATCH] Error updating pizza_orders:', patchErr);
        }

        // Update Telegram message in staff channel if message_id exists
        if (updatedOrder && updatedOrder.telegram_message_id) {
          const { botToken, chatId } = await getTelegramCredentials('pizza');
          if (botToken && chatId) {
            const resData = parseTableReservationFromOrder(updatedOrder);
            const seatingLabel = AREA_LABELS[resData.seating_area] || resData.seating_area;

            let text = `🍽️ <b>PRENOTAZIONE TAVOLO / CAPANNA</b>\n`;
            text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            text += `📌 <b>ID Prenotazione</b>: <code>#${resData.id}</code>\n`;
            text += `👤 <b>Cliente</b>: <b>${escapeHtml(resData.customer_name)}</b>\n`;
            text += `📞 <b>Contatto (LINE / Tel)</b>: <code>${escapeHtml(resData.contact)}</code>\n`;
            if (resData.email) {
              text += `✉️ <b>Email</b>: <code>${escapeHtml(resData.email)}</code>\n`;
            }
            text += `👥 <b>Ospiti</b>: <b>${resData.guests} persone</b>\n`;
            text += `📅 <b>Data</b>: <b>${resData.reservation_date}</b>\n`;
            text += `🕒 <b>Orario</b>: <b>${resData.reservation_time}</b>\n`;
            text += `🛖 <b>Ambiente</b>: <b>${seatingLabel}</b>\n`;
            if (resData.occasion) {
              text += `🎉 <b>Occasione</b>: ${escapeHtml(resData.occasion)}\n`;
            }
            if (resData.notes) {
              text += `📝 <b>Note Speciali</b>: <i>${escapeHtml(resData.notes)}</i>\n`;
            }
            text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            if (isApproved) {
              text += `✅ <b>STATO: PRENOTAZIONE CONFERMATA / ยืนยันแล้ว</b>\n`;
              text += `👤 <i>Approvato da Kitchen Monitor / Gestione Ristorante</i>`;
            } else {
              text += `❌ <b>STATO: PRENOTAZIONE ANNULLATA / ยกเลิกแล้ว</b>\n`;
              text += `👤 <i>Annullato da Kitchen Monitor / Gestione Ristorante</i>`;
            }

            const inlineKeyboard = isApproved ? {
              inline_keyboard: [
                [
                  { text: "✖ Annulla / ยกเลิก", callback_data: `reject_table_${id}` }
                ]
              ]
            } : {
              inline_keyboard: [
                [
                  { text: "🟢 Ri-approva / ยืนยันอีกครั้ง", callback_data: `approve_table_${id}` }
                ]
              ]
            };

            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: updatedOrder.telegram_message_id,
                text,
                parse_mode: 'HTML',
                reply_markup: inlineKeyboard
              })
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('[TableReservation PATCH] Error updating:', err);
      }
    }
    return res.status(200).json({ success: true, id, status: isApproved ? 'confirmed' : isCancelled ? 'cancelled' : 'pending' });
  }

  // 3. POST: Create new reservation
  if (req.method === 'POST') {
    const body = req.body as TableReservationData;
    if (!body || !body.customer_name || !body.contact || !body.reservation_date || !body.reservation_time) {
      return res.status(400).json({ error: 'Missing required reservation fields' });
    }

    const seatingArea = body.seating_area || 'any';
    const seatingLabel = AREA_LABELS[seatingArea] || seatingArea;
    const customerEmail = body.email?.trim() || '';

    const isWinePrivilege = Boolean(
      body.is_wine_privilege ||
      (body.notes && (
        body.notes.toLowerCase().includes('10%') ||
        body.notes.toLowerCase().includes('vino') ||
        body.notes.toLowerCase().includes('wine') ||
        body.notes.toLowerCase().includes('ส่วนลดไวน์') ||
        body.notes.toLowerCase().includes('weinkeller-rabatt')
      ))
    );

    const tempCode = `TB-${Date.now().toString().slice(-4)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

    const reservationRecord: TableReservationData = {
      id: tempCode,
      customer_name: body.customer_name.trim(),
      contact: body.contact.trim(),
      email: customerEmail,
      guests: body.guests || 2,
      reservation_date: body.reservation_date,
      reservation_time: body.reservation_time,
      seating_area: seatingArea,
      occasion: body.occasion?.trim() || '',
      notes: body.notes?.trim() || '',
      is_wine_privilege: isWinePrivilege,
      status: 'pending',
      lang: body.lang || 'IT',
      created_at: new Date().toISOString()
    };

    const addressStr = serializeTableReservationToAddress(reservationRecord);

    const orderInsertPayload = {
      customer_name: reservationRecord.customer_name,
      phone: reservationRecord.contact,
      address: addressStr,
      items: [{
        name: `Prenotazione Tavolo (${seatingLabel})${isWinePrivilege ? ' [Sconto 10% Vino]' : ''}`,
        nameTh: `จองโต๊ะ (${seatingLabel})${isWinePrivilege ? ' [ส่วนลดไวน์ 10%]' : ''}`,
        quantity: Number(reservationRecord.guests) || 2,
        selectedVariant: `${reservationRecord.guests} Ospiti / ${reservationRecord.reservation_date} ${reservationRecord.reservation_time}`
      }],
      total: 0,
      status: 'new',
      payment_method: 'table_reservation',
      has_whatsapp: true,
      has_line: true,
      created_at: reservationRecord.created_at
    };

    let actualOrderId = tempCode;

    // Save persistently into Supabase pizza_orders
    if (supabase) {
      try {
        const { data: insertedOrder, error: dbErr } = await supabase
          .from('pizza_orders')
          .insert([orderInsertPayload])
          .select('id')
          .single();

        if (dbErr) {
          console.warn('[TableReservation] pizza_orders insert error:', dbErr);
        } else if (insertedOrder && insertedOrder.id) {
          actualOrderId = String(insertedOrder.id);
          reservationRecord.id = actualOrderId;
        }
      } catch (dbEx) {
        console.warn('[TableReservation] Exception inserting into pizza_orders:', dbEx);
      }
    }

    // Send Confirmation Email to Customer (if email provided)
    if (customerEmail && customerEmail.includes('@')) {
      try {
        await sendTableReservationEmail({
          id: actualOrderId,
          customer_name: reservationRecord.customer_name,
          contact: reservationRecord.contact,
          email: customerEmail,
          guests: reservationRecord.guests,
          reservation_date: reservationRecord.reservation_date,
          reservation_time: reservationRecord.reservation_time,
          seating_area: reservationRecord.seating_area,
          notes: reservationRecord.notes,
          is_wine_privilege: reservationRecord.is_wine_privilege,
          lang: reservationRecord.lang
        });
      } catch (emailErr) {
        console.warn('[TableReservation Email] Error sending customer confirmation:', emailErr);
      }
    }

    // Send Telegram Notification to Staff with Interactive Approval Buttons
    try {
      const { botToken, chatId } = await getTelegramCredentials('pizza');
      if (botToken && chatId) {
        let text = `🍽️ <b>NUOVA PRENOTAZIONE TAVOLO / CAPANNA</b>\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        if (isWinePrivilege) {
          text += `🍷 <b>PRIVILEGIO CANTINA: -10% SULLA BOTTIGLIA DI VINO</b> 🏷️\n`;
          text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        }
        text += `📌 <b>ID Prenotazione</b>: <code>#${actualOrderId}</code>\n`;
        text += `👤 <b>Cliente</b>: <b>${escapeHtml(reservationRecord.customer_name)}</b>\n`;
        text += `📞 <b>Contatto (LINE / Tel)</b>: <code>${escapeHtml(reservationRecord.contact)}</code>\n`;
        if (customerEmail) {
          text += `✉️ <b>Email</b>: <code>${escapeHtml(customerEmail)}</code>\n`;
        }
        text += `👥 <b>Ospiti</b>: <b>${reservationRecord.guests} persone</b>\n`;
        text += `📅 <b>Data</b>: <b>${reservationRecord.reservation_date}</b>\n`;
        text += `🕒 <b>Orario</b>: <b>${reservationRecord.reservation_time}</b>\n`;
        text += `🛖 <b>Ambiente</b>: <b>${seatingLabel}</b>\n`;
        if (reservationRecord.occasion) {
          text += `🎉 <b>Occasione</b>: ${escapeHtml(reservationRecord.occasion)}\n`;
        }
        if (reservationRecord.notes) {
          text += `📝 <b>Note Speciali</b>: <i>${escapeHtml(reservationRecord.notes)}</i>\n`;
        }
        text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `⏳ <b>STATO: In attesa di approvazione</b>\n`;
        text += `📍 <i>Flower Power Pizza Ranong</i>`;

        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: "🟢 Approva Prenotazione / ยืนยัน", callback_data: `approve_table_${actualOrderId}` },
              { text: "✖ Rifiuta / ยกเลิก", callback_data: `reject_table_${actualOrderId}` }
            ]
          ]
        };

        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard
          })
        });

        const tgJson = await tgRes.json();
        if (tgJson?.ok && tgJson?.result?.message_id && supabase) {
          const msgId = tgJson.result.message_id;
          reservationRecord.telegram_message_id = msgId;
          await supabase
            .from('pizza_orders')
            .update({ 
              telegram_notified: true, 
              telegram_message_id: msgId 
            })
            .eq('id', actualOrderId);
        }
      }
    } catch (telegramErr) {
      console.warn('[TableReservation Telegram] Notification error:', telegramErr);
    }

    return res.status(200).json({
      success: true,
      reservation: reservationRecord,
      message: 'Reservation submitted successfully'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
