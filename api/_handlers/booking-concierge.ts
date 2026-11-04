import { VercelRequest, VercelResponse } from "@vercel/node";
import { processBookingInquiry } from "../_helpers/ai-booking-concierge.js";

export async function handleBookingConcierge(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, sourceLangHint } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Il parametro "message" è obbligatorio e non può essere vuoto.' });
  }

  try {
    const result = await processBookingInquiry({
      text: message.trim(),
      sourceLangHint: sourceLangHint || undefined,
      currentDate: new Date()
    });

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('[handleBookingConcierge Error]:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Errore durante l\'elaborazione della richiesta con l\'AI Concierge'
    });
  }
}

