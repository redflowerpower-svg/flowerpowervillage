import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  try {
    // 1. Try fetching from Supabase table resort_bookings
    let { data: sbData, error: sbError } = await supabaseAdmin
      .from('resort_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (sbError || !sbData || sbData.length === 0) {
      // Try alternative table reservations
      const { data: resData } = await supabaseAdmin
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (resData && resData.length > 0) {
        sbData = resData;
      }
    }

    // 2. Try fetching active reservations from Octorate API if token is present
    const { data: tokenData } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .maybeSingle();

    let octorateReservations: any[] = [];
    if (tokenData?.access_token) {
      try {
        const dateFrom = req.query.dateFrom || new Date().toISOString().substring(0, 10);
        const octRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation?dateFrom=${dateFrom}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json'
          }
        });

        if (octRes.ok) {
          const octJson = await octRes.json();
          const items = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : []);
          octorateReservations = items.map((r: any) => ({
            id: String(r.id || r.reservationId || Math.random()),
            guest_name: r.guestName || r.guest_name || `${r.first_name || 'Ospite'} ${r.last_name || ''}`.trim(),
            guest_email: r.email || r.guestEmail || '',
            guest_phone: r.phone || '',
            accommodation_id: String(r.roomTypeId || r.roomId || r.accommodation_id || ''),
            accommodation_name: r.roomName || r.accommodation_name || '',
            check_in: String(r.checkIn || r.check_in || '').slice(0, 10),
            check_out: String(r.checkOut || r.check_out || '').slice(0, 10),
            guests: Number(r.pax || r.guests || 2),
            total_price: Number(r.totalAmount || r.total_price || 0),
            deposit_paid: Number(r.deposit || 0),
            status: r.status === 'CANCELLED' ? 'cancelled' : 'confirmed',
            source_channel: r.ota || r.source_channel || r.channel || 'Booking.com'
          }));
        }
      } catch (octErr) {
        console.warn('[api/resort/octorate-bookings] Octorate reservations fetch notice:', octErr);
      }
    }

    const combinedBookings = [...(sbData || []), ...octorateReservations];

    return res.status(200).json({ success: true, data: combinedBookings });
  } catch (error: any) {
    console.error('[api/resort/octorate-bookings] Exception:', error);
    return res.status(500).json({ error: error.message });
  }
}
