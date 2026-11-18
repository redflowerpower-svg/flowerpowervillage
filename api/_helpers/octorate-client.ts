/**
 * 🔌 Layer Base Octorate: Client Trasporto HTTP & Timestamp Utilities
 *
 * Modulo 100% puro e privo di logica di dominio (niente mirror, niente minStay, niente cascade).
 */

/**
 * Invia in sequenza chunk verso /calendar/bulk con pausa inter-batch e retry
 * automatico su risposte HTTP 403/429 / API_QUOTA_EXCEEDED di Octorate.
 */
export async function postOctorateCalendarBulkWithRetry(
  headers: Record<string, string>,
  chunks: any[][],
  options?: {
    interBatchDelayMs?: number;
    quotaRetryDelayMs?: number;
    maxQuotaRetries?: number;
    logPrefix?: string;
  }
): Promise<{ lastStatus: number; succeededItems: number }> {
  const interBatchDelayMs = options?.interBatchDelayMs ?? 1200;
  const quotaRetryDelayMs = options?.quotaRetryDelayMs ?? 2500;
  const maxQuotaRetries = options?.maxQuotaRetries ?? 2;
  const logPrefix = options?.logPrefix || '[OCTORATE BULK]';
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let lastStatus = 200;
  let succeededItems = 0;

  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    if (idx > 0 && interBatchDelayMs > 0) {
      await sleep(interBatchDelayMs);
    }

    for (let attempt = 0; attempt <= maxQuotaRetries; attempt++) {
      const bulkRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
        method: 'POST',
        headers,
        body: JSON.stringify(chunk)
      });
      lastStatus = bulkRes.status;
      const bulkText = await bulkRes.text().catch(() => '');
      let bulkJson: any = null;
      try {
        bulkJson = bulkText ? JSON.parse(bulkText) : null;
      } catch {
        // risposta non JSON
      }

      if (bulkRes.ok && bulkJson?.success !== false) {
        succeededItems += chunk.length;
        console.log(`${logPrefix} Bulk batch ${idx + 1}/${chunks.length} sent (${chunk.length} items, HTTP ${bulkRes.status}).`);
        break;
      }

      const isQuotaError =
        bulkRes.status === 403 ||
        bulkRes.status === 429 ||
        bulkText.includes('API_QUOTA_EXCEEDED');

      if (isQuotaError && attempt < maxQuotaRetries) {
        console.warn(`${logPrefix} Quota Octorate (HTTP ${bulkRes.status}) su batch ${idx + 1}/${chunks.length}, attendo ${quotaRetryDelayMs}ms e riprovo (${attempt + 1}/${maxQuotaRetries})...`);
        await sleep(quotaRetryDelayMs);
        continue;
      }

      console.error(`${logPrefix} Errore batch ${idx + 1}/${chunks.length} (HTTP ${bulkRes.status}): ${bulkText.slice(0, 200)}`);
      break;
    }
  }

  return { lastStatus, succeededItems };
}

/**
 * Converte timestamp Octorate con eventuale suffisso timezone tra parentesi quadre
 * (es. "2026-11-18T10:15:30Z[UTC]") in millisecondi epoch.
 */
export function parseOctorateTimestampMs(raw?: string | null): number {
  if (!raw) return 0;
  const cleaned = String(raw).trim().replace(/\[[^\]]+\]$/, '');
  const ms = Date.parse(cleaned);
  return Number.isNaN(ms) ? 0 : ms;
}
