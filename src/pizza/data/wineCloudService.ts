import { WineCardData, INITIAL_WINE_COLLECTION } from './wineData';

const CLOUD_JSON_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/wine_collection.json';

/**
 * Carica la collezione di vini direttamente dal Cloud Supabase (con cache-buster).
 * Se offline o in errore, fa fallback trasparente su localStorage o su INITIAL_WINE_COLLECTION.
 */
export async function fetchCloudWineCollection(): Promise<WineCardData[]> {
  try {
    const res = await fetch(`${CLOUD_JSON_URL}?_ts=${Date.now()}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const cloudData = await res.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        try {
          localStorage.setItem('fp_wine_collection', JSON.stringify(cloudData));
        } catch (_) {}
        return cloudData;
      }
    }
  } catch (err) {
    console.warn('[WineCloudService] Fetch cloud fallito, uso fallback locale:', err);
  }

  // Fallback 1: localStorage
  try {
    const saved = localStorage.getItem('fp_wine_collection');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}

  // Fallback 2: Codice sorgente master
  return INITIAL_WINE_COLLECTION;
}

/**
 * Salva la collezione aggiornata e l'eventuale nuova immagine di bottiglia
 * tramite l'endpoint backend `/api/wine-collection` con chiave service_role.
 * Bypassa al 100% le regole RLS di Supabase e aggiorna il Cloud per tutti i dispositivi.
 */
export async function saveCloudWineCollection(
  updatedCollection: WineCardData[],
  imageUpload?: { fileName: string; dataBase64: string }
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // 1. Salva subito in localStorage come cache istantanea
    try {
      localStorage.setItem('fp_wine_collection', JSON.stringify(updatedCollection));
    } catch (_) {}

    // 2. Invia al backend per persistenza permanente nel Cloud Supabase
    const response = await fetch('/api/wine-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection: updatedCollection,
        uploadImage: imageUpload
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.imageUrl
    };
  } catch (err: any) {
    console.error('[WineCloudService] Errore salvataggio Cloud:', err);
    return {
      success: false,
      error: err.message || 'Errore di connessione'
    };
  }
}
