import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envVars = {};
  const files = ['.env.local', '.env'];
  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0 && !envVars[key.trim()]) {
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  }
  return envVars;
}

const envVars = loadEnv();
const supabase = createClient(
  envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

function formatDMY(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ore ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

function extractOrderMetadata(rawAddress) {
  if (!rawAddress) return { cleanAddress: 'Ranong', customerEmail: '', deliveryNotes: '' };
  const emailMatch = rawAddress.match(/\[EMAIL:\s*([^\]]+)\]/i);
  const noteMatch = rawAddress.match(/\[NOTE:\s*([^\]]+)\]/i);
  const cleanAddress = rawAddress
    .replace(/\[(COORD|ADDR_TH|EMAIL|NOTE|LANG|DID|PROMO|DISCOUNT|HOTEL|DINING_VOUCHER|DINE-IN|INTEGRAZIONE_COMANDA|TABLE_RESERVATION|DATE|TIME|GUESTS|AREA|OCCASION|TB_CODE|WINE_PRIVILEGE|CANCELLED):[^\]]*\]/gi, '')
    .trim();
  return {
    cleanAddress: cleanAddress || 'Ranong (Al Tavolo / Ristorante)',
    customerEmail: emailMatch ? emailMatch[1].trim() : '',
    deliveryNotes: noteMatch ? noteMatch[1].trim() : ''
  };
}

async function sendOrderWithRetry(botToken, chatId, targetThreadId, lines, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: targetThreadId,
          text: lines,
          parse_mode: 'HTML',
          disable_notification: true,
          disable_web_page_preview: true
        })
      });

      const resJson = await res.json();
      if (resJson.ok) {
        return { success: true, messageId: resJson.result?.message_id };
      }

      // Handle Telegram 429 Too Many Requests
      if (resJson.error_code === 429 && resJson.parameters?.retry_after) {
        const waitSec = (resJson.parameters.retry_after || 30) + 1;
        console.log(`⏳ [Rate Limit Telegram] Attesa di ${waitSec}s prima di riprovare...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
        continue; // retry
      }

      return { success: false, error: resJson.description };
    } catch (e) {
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

// Support optional list of specific IDs to re-run: e.g. node script.mjs --missing
async function run() {
  const args = process.argv.slice(2);
  const onlyFailedList = [
    49, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
    91, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 117,
    141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168,
    191, 192, 193, 194, 195, 196, 197, 199, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221,
    242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271
  ];

  const filterIds = args.includes('--missing') ? onlyFailedList : null;

  console.log(`🚀 Avvio sincronizzazione storico ordini Telegram${filterIds ? ` (Solo ${filterIds.length} ordini mancanti)` : ''}...`);

  const { data: pizzaConfig } = await supabase.from('telegram_config').select('*').eq('id', 'pizza').maybeSingle();
  const botToken = pizzaConfig?.bot_token || env.TELEGRAM_PIZZA_BOT_TOKEN;
  const chatId = pizzaConfig?.chat_id || env.TELEGRAM_PIZZA_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram bot_token o chat_id mancanti (non trovati in Supabase né nelle variabili d\'ambiente).');
  }

  const TOPIC_RESTAURANT = 3;
  const TOPIC_WEBSITE = 5;

  let query = supabase.from('pizza_orders').select('*').order('id', { ascending: true });
  if (filterIds) {
    query = query.in('id', filterIds);
  }

  const { data: orders, error } = await query;
  if (error || !orders) {
    console.error('❌ Errore caricamento ordini:', error);
    process.exit(1);
  }

  console.log(`📦 Da elaborare: ${orders.length} ordini.`);

  let countRestaurant = 0;
  let countWebsite = 0;
  let countErrors = 0;

  for (let idx = 0; idx < orders.length; idx++) {
    const order = orders[idx];

    const isDining = Boolean(
      (order.address && (order.address.includes('[DINE-IN:') || order.address.includes('[TABLE_RESERVATION]'))) ||
      order.table_number ||
      (order.phone && String(order.phone).includes('Dining Table')) ||
      (order.payment_method && String(order.payment_method).includes('at_table'))
    );

    const targetThreadId = isDining ? TOPIC_RESTAURANT : TOPIC_WEBSITE;
    const meta = extractOrderMetadata(order.address);

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsText = items
      .map((item) => {
        let str = `• <b>${item.quantity || 1}x ${item.name}</b>`;
        if (item.nameTh) str += `\n  <i>${item.nameTh}</i>`;
        if (item.selectedVariant) {
          const v = typeof item.selectedVariant === 'object' ? item.selectedVariant.name : item.selectedVariant;
          str += ` (Size: ${v})`;
        }
        if (Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0) {
          const ex = item.selectedExtras.map(e => e.name || e).join(', ');
          str += `\n  <i>+ Extra: ${ex}</i>`;
        }
        return str;
      })
      .join('\n');

    const header = isDining
      ? `🍽️ <b>STORICO COMANDA TAVOLO</b> (#${order.id})`
      : `🛵 <b>STORICO ORDINE SITO WEB</b> (#${order.id})`;

    const statusBadge = order.status === 'completed'
      ? '✅ <b>Status:</b> Completato / สำเร็จ'
      : order.status === 'cancelled' || order.status === 'rejected'
      ? '❌ <b>Status:</b> Cancellato / ยกเลิก'
      : `ℹ️ <b>Status:</b> ${order.status}`;

    const lines = [
      header,
      `📅 <b>Data Comanda / วันที่:</b> ${formatDMY(order.created_at)}`,
      statusBadge,
      ``,
      `<b>Cliente / ลูกค้า:</b> ${order.customer_name || '-'}`,
      order.phone && order.phone !== '-' ? `📞 <b>Telefono:</b> ${order.phone}` : null,
      meta.customerEmail ? `📧 <b>Email:</b> ${meta.customerEmail}` : null,
      `<b>Luogo / ที่อยู่:</b> ${meta.cleanAddress}`,
      meta.deliveryNotes ? `📝 <b>Note:</b> <i>${meta.deliveryNotes}</i>` : null,
      ``,
      `<b>Articoli / รายการ:</b>`,
      itemsText || '<i>Nessun dettaglio articoli</i>',
      ``,
      `<b>Totale / ยอดรวม:</b> ${order.total} THB`,
      `<b>Pagamento:</b> ${order.payment_method || 'Standard'}`
    ].filter(Boolean).join('\n');

    const result = await sendOrderWithRetry(botToken, chatId, targetThreadId, lines);
    if (result.success) {
      if (isDining) countRestaurant++;
      else countWebsite++;
    } else {
      countErrors++;
      console.warn(`[Order #${order.id}] Errore persistente:`, result.error);
    }

    if ((idx + 1) % 10 === 0 || idx === orders.length - 1) {
      console.log(`[Progresso] ${idx + 1}/${orders.length} (Restaurant: ${countRestaurant}, Website: ${countWebsite}, Errori: ${countErrors})`);
    }

    // Default delay: 1000ms tra i messaggi per rispettare la policy Telegram (max 20 msg/min nei gruppi)
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\n🎉 Operazione completata! Restaurant: ${countRestaurant}, Website: ${countWebsite}, Errori: ${countErrors}`);
}

run().catch(console.error);
