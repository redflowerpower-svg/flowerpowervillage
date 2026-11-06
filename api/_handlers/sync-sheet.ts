import { VercelRequest, VercelResponse } from "@vercel/node";
import { syncAllSheetsToMarkdown, getLastSyncMetadata } from "../_helpers/google-sheets-sync.js";

/**
 * Endpoint Webhook: Riceve il ping da Google Apps Script ogni volta che
 * Marco modifica una cella, aggiunge una riga o crea una nuova scheda da cellulare o desktop.
 * Riscarica il foglio, estrae i Markdown e aggiorna la memoria dell'AI all'istante!
 */
export async function handleSyncKnowledgeFromSheet(req: VercelRequest, res: VercelResponse) {
  try {
    // Se richiesta sola lettura di stato/metadati
    if (req.method === 'GET' && (req.query?.action === 'status' || req.query?.status === 'true')) {
      const metadata = await getLastSyncMetadata();
      return res.status(200).json({
        success: true,
        metadata: metadata || null
      });
    }

    console.log('[handleSyncKnowledgeFromSheet] Avvio sincronizzazione da Google Sheet...');
    const notifyTelegram = req.query?.notify !== 'false';
    const result = await syncAllSheetsToMarkdown({ notifyTelegram });

    return res.status(200).json({
      success: true,
      message: 'Knowledge Base sincronizzata con successo da Google Sheet a Markdown nativo!',
      ...result
    });
  } catch (error: any) {
    console.error('[handleSyncKnowledgeFromSheet Error]:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Errore durante la sincronizzazione da Google Sheet'
    });
  }
}
