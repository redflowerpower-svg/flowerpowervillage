import { VercelRequest, VercelResponse } from "@vercel/node";
import { 
  processBookingInquiry, 
  refineReplyWithFeedback, 
  getCustomSystemPrompt, 
  saveCustomSystemPrompt 
} from "../_helpers/ai-booking-concierge.js";
import { 
  getAllMemoryItems, 
  saveMemoryItem, 
  toggleMemoryItem, 
  deleteMemoryItem 
} from "../_helpers/concierge-memory.js";
import { getOrCreateMasterSpreadsheet } from "../_helpers/google-sheets-sync.js";

export async function handleBookingConcierge(req: VercelRequest, res: VercelResponse) {
  // Support GET for fetching memory items or prompt
  if (req.method === 'GET') {
    const action = String(req.query?.action || 'memory').toLowerCase();
    if (action === 'memory' || action === 'get_memory' || action === 'rules') {
      try {
        const items = await getAllMemoryItems();
        return res.status(200).json({ success: true, items });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    if (action === 'get_prompt' || action === 'prompt') {
      try {
        const customPrompt = await getCustomSystemPrompt();
        let masterSheet = null;
        try {
          masterSheet = await getOrCreateMasterSpreadsheet();
        } catch (sheetErr: any) {
          console.warn('[handleBookingConcierge] Sheet read warning:', sheetErr.message);
        }
        return res.status(200).json({ 
          success: true, 
          customPrompt: customPrompt || '',
          masterSheet
        });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(400).json({ error: 'Azione GET non riconosciuta' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const action = String(body.action || req.query?.action || '').toLowerCase();

  try {
    // 1. Memory: Get items
    if (action === 'get_memory' || action === 'memory') {
      const items = await getAllMemoryItems();
      return res.status(200).json({ success: true, items });
    }

    // 2. Memory: Save new rule or FAQ
    if (action === 'save_rule') {
      const { title, content, category, active } = body;
      if (!title || !content) {
        return res.status(400).json({ success: false, error: 'Parametri "title" e "content" obbligatori.' });
      }
      const saved = await saveMemoryItem({ title, content, category, active });
      return res.status(200).json({ success: true, item: saved });
    }

    // 3. Memory: Toggle rule active state
    if (action === 'toggle_rule') {
      const { id, active } = body;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Parametro "id" obbligatorio.' });
      }
      const ok = await toggleMemoryItem(id, Boolean(active));
      return res.status(200).json({ success: ok });
    }

    // 4. Memory: Delete rule
    if (action === 'delete_rule') {
      const { id } = body;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Parametro "id" obbligatorio.' });
      }
      const ok = await deleteMemoryItem(id);
      return res.status(200).json({ success: ok });
    }

    // 5. System Prompt: Get
    if (action === 'get_prompt') {
      const customPrompt = await getCustomSystemPrompt();
      const masterSheet = await getOrCreateMasterSpreadsheet().catch(() => null);
      return res.status(200).json({ 
        success: true, 
        customPrompt: customPrompt || '',
        masterSheet
      });
    }

    // 6. System Prompt: Save
    if (action === 'save_prompt') {
      const promptText = typeof body.prompt === 'string' ? body.prompt : '';
      const ok = await saveCustomSystemPrompt(promptText);
      return res.status(200).json({ success: ok });
    }

    // 7. Master Google Sheet: Sync or Create
    if (action === 'sync_sheet') {
      const sheet = await getOrCreateMasterSpreadsheet();
      return res.status(200).json({ success: true, sheet });
    }

    // 8. Refine reply with user feedback
    if (action === 'refine') {
      const { originalInquiry, currentReply, userFeedback, calendarUrl, guestName, accommodationSlug } = body;
      if (!userFeedback || !userFeedback.trim()) {
        return res.status(400).json({ success: false, error: 'Parametro "userFeedback" obbligatorio.' });
      }
      const refined = await refineReplyWithFeedback({
        originalInquiry: originalInquiry || currentReply || '',
        currentReply: currentReply || '',
        userFeedback: userFeedback.trim(),
        calendarUrl,
        guestName,
        accommodationSlug
      });
      return res.status(200).json({ success: true, result: refined });
    }

    // 9. Default: Process guest booking inquiry
    const message = body.message || body.text;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Il parametro "message" è obbligatorio e non può essere vuoto.' });
    }

    const result = await processBookingInquiry({
      text: message.trim(),
      sourceLangHint: body.sourceLangHint || undefined,
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
