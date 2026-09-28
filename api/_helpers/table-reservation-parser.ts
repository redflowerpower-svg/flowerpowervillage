export interface TableReservationData {
  id?: string;
  customer_name: string;
  contact: string;
  email?: string;
  guests: number | string;
  reservation_date: string;
  reservation_time: string;
  seating_area: 'indoor' | 'outdoor' | 'hut' | 'any';
  occasion?: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  lang?: 'IT' | 'EN' | 'TH' | 'DE';
  created_at?: string;
  telegram_message_id?: number | string | null;
}

export const AREA_LABELS: Record<string, string> = {
  indoor: '🏠 Sala Interna',
  outdoor: '🌿 Tavoli Esterni',
  hut: '🛖 Capanna',
  any: '🎲 Nessuna Preferenza'
};

export function serializeTableReservationToAddress(data: TableReservationData): string {
  const code = data.id || '';
  const statusFlag = data.status === 'cancelled' ? ' [CANCELLED:true]' : '';
  return `[TABLE_RESERVATION] [DATE:${data.reservation_date}] [TIME:${data.reservation_time}] [GUESTS:${data.guests}] [AREA:${data.seating_area}] [OCCASION:${data.occasion || ''}] [NOTE:${data.notes || ''}] [EMAIL:${data.email || ''}] [LANG:${data.lang || 'IT'}] [TB_CODE:${code}]${statusFlag}`;
}

export function parseTableReservationFromOrder(order: any): TableReservationData {
  const addr = String(order.address || '');
  const dateMatch = addr.match(/\[DATE:\s*([^\]]+)\]/i);
  const timeMatch = addr.match(/\[TIME:\s*([^\]]+)\]/i);
  const guestsMatch = addr.match(/\[GUESTS:\s*([^\]]+)\]/i);
  const areaMatch = addr.match(/\[AREA:\s*([^\]]+)\]/i);
  const emailMatch = addr.match(/\[EMAIL:\s*([^\]]+)\]/i);
  const occasionMatch = addr.match(/\[OCCASION:\s*([^\]]+)\]/i);
  const noteMatch = addr.match(/\[NOTE:\s*([^\]]+)\]/i);
  const langMatch = addr.match(/\[LANG:\s*([^\]]+)\]/i);
  const isCancelledFlag = addr.includes('[CANCELLED:true]') || addr.includes('[CANCELLED]');

  const rawArea = areaMatch ? areaMatch[1].trim().toLowerCase() : 'any';
  const seatingArea = (['indoor', 'outdoor', 'hut', 'any'].includes(rawArea) ? rawArea : 'any') as TableReservationData['seating_area'];
  const guestsNum = guestsMatch ? parseInt(guestsMatch[1].trim(), 10) : 2;

  let status: TableReservationData['status'] = 'pending';
  if (isCancelledFlag) {
    status = 'cancelled';
  } else if (order.status === 'completed' || order.status === 'preparing' || order.status === 'delivering') {
    status = 'confirmed';
  } else {
    status = 'pending';
  }

  return {
    id: String(order.id),
    customer_name: order.customer_name || 'Cliente',
    contact: order.phone || '',
    email: emailMatch ? emailMatch[1].trim() : '',
    guests: isNaN(guestsNum) ? 2 : guestsNum,
    reservation_date: dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0],
    reservation_time: timeMatch ? timeMatch[1].trim() : '19:00',
    seating_area: seatingArea,
    occasion: occasionMatch ? occasionMatch[1].trim() : '',
    notes: noteMatch ? noteMatch[1].trim() : '',
    status,
    lang: (langMatch ? langMatch[1].trim().toUpperCase() : 'IT') as any,
    created_at: order.created_at || new Date().toISOString(),
    telegram_message_id: order.telegram_message_id || null
  };
}

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
