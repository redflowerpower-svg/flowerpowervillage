import { menuData, MenuItem } from '../../../pizza/data/menuData';
import { INITIAL_WINE_COLLECTION, WineCardData } from '../../../pizza/data/wineData';
import { KdsLanguage, resolveExtraDisplayName, resolveVariantDisplayName } from './kdsExtraDictionary';

export interface CanonicalDishRecord {
  id: string;
  names: {
    it: string;
    en: string;
    th: string;
    mm: string;
    de: string;
  };
  category: string;
  isWine?: boolean;
}

// Normalizer for fuzzy & clean key matching
export function normalizeCatalogKey(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[\(\)\[\]\{\}\.,\/#!$%\^&\*;:{}=\-_`~?]/g, ' ') // replace symbols with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Master in-memory catalog index
const CATALOG_BY_ID = new Map<string, CanonicalDishRecord>();
const CATALOG_BY_NAME = new Map<string, CanonicalDishRecord>();

/**
 * Initialize and build Master Index from menuData + wineData
 */
function buildMasterCatalogIndex() {
  CATALOG_BY_ID.clear();
  CATALOG_BY_NAME.clear();

  // 1. Index All Food Dishes & Beverages from menuData
  menuData.forEach(category => {
    category.items.forEach((dish: any) => {
      const itName = (dish.nameIt || dish.name_it || dish.name || '').trim();
      const enName = (dish.name || dish.nameEn || itName).trim();
      const thName = (dish.nameTh || dish.name_th || enName).trim();
      const deName = (dish.nameDe || dish.name_de || enName).trim();
      const mmName = (dish.nameMm || dish.name_mm || thName).trim();

      const record: CanonicalDishRecord = {
        id: dish.id,
        category: category.id,
        names: {
          it: itName.toUpperCase(),
          en: enName.toUpperCase(),
          th: thName,
          mm: mmName,
          de: deName.toUpperCase()
        }
      };

      CATALOG_BY_ID.set(dish.id.toLowerCase(), record);

      // Map all possible name keys to this canonical record
      [itName, enName, thName, deName, mmName, dish.id].forEach(alias => {
        if (alias) {
          const raw = alias.trim().toLowerCase();
          const norm = normalizeCatalogKey(alias);
          if (raw) CATALOG_BY_NAME.set(raw, record);
          if (norm) CATALOG_BY_NAME.set(norm, record);
        }
      });
    });
  });

  // 2. Index All Wine Collection from INITIAL_WINE_COLLECTION
  INITIAL_WINE_COLLECTION.forEach((wine: WineCardData) => {
    const itName = (wine.titleIt || wine.title || '').trim();
    const enName = (wine.titleEn || wine.title || itName).trim();
    const thName = (wine.titleTh || wine.title || enName).trim();
    const deName = (wine.titleDe || wine.title || enName).trim();
    const mmName = (wine.titleMm || wine.title || thName).trim();

    const record: CanonicalDishRecord = {
      id: wine.id,
      category: 'wines',
      isWine: true,
      names: {
        it: itName.toUpperCase(),
        en: enName.toUpperCase(),
        th: thName,
        mm: mmName,
        de: deName.toUpperCase()
      }
    };

    CATALOG_BY_ID.set(wine.id.toLowerCase(), record);

    [itName, enName, thName, deName, mmName, wine.id].forEach(alias => {
      if (alias) {
        const raw = alias.trim().toLowerCase();
        const norm = normalizeCatalogKey(alias);
        if (raw) CATALOG_BY_NAME.set(raw, record);
        if (norm) CATALOG_BY_NAME.set(norm, record);
      }
    });
  });
}

// Build catalog index immediately on module import
buildMasterCatalogIndex();

/**
 * Find dish in Master Catalog by Item payload
 */
export function findCanonicalDish(item: any): CanonicalDishRecord | null {
  if (!item) return null;

  // 1. Try lookup by explicit ID / productId
  const rawId = String(item.productId || item.id || '').trim().toLowerCase();
  if (rawId && CATALOG_BY_ID.has(rawId)) {
    return CATALOG_BY_ID.get(rawId)!;
  }

  // 2. Try lookup by direct name variants
  const candidates: string[] = [
    item.name,
    item.nameIt,
    item.name_it,
    item.nameTh,
    item.name_th,
    item.nameDe,
    item.name_de,
    item.nameMm,
    item.name_mm,
    item.title,
    rawId
  ].filter(Boolean);

  for (const cand of candidates) {
    const raw = String(cand).trim().toLowerCase();
    if (CATALOG_BY_NAME.has(raw)) {
      return CATALOG_BY_NAME.get(raw)!;
    }
    const norm = normalizeCatalogKey(String(cand));
    if (CATALOG_BY_NAME.has(norm)) {
      return CATALOG_BY_NAME.get(norm)!;
    }
  }

  return null;
}

/**
 * Universal Dish Display Name Resolver for Kitchen Monitor
 */
export function resolveDishDisplayName(item: any, targetLang: KdsLanguage): string {
  if (!item) return '';
  const langKey = targetLang === 'mm' ? 'mm' : targetLang === 'th' ? 'th' : targetLang === 'it' ? 'it' : targetLang === 'de' ? 'de' : 'en';

  // 1. Check if the item already has the requested language field directly populated
  if (langKey === 'th' && item.nameTh && typeof item.nameTh === 'string' && item.nameTh.trim()) {
    return item.nameTh.trim();
  }
  if (langKey === 'mm' && item.nameMm && typeof item.nameMm === 'string' && item.nameMm.trim()) {
    return item.nameMm.trim();
  }
  if (langKey === 'de' && item.nameDe && typeof item.nameDe === 'string' && item.nameDe.trim()) {
    return item.nameDe.trim().toUpperCase();
  }
  if (langKey === 'it' && (item.nameIt || item.name_it) && typeof (item.nameIt || item.name_it) === 'string') {
    return (item.nameIt || item.name_it).trim().toUpperCase();
  }

  // 2. Lookup in Master Catalog Matrix
  const found = findCanonicalDish(item);
  if (found && found.names[langKey]) {
    return found.names[langKey];
  }

  // 3. Clean fallback
  const rawName = String(item.name || item.nameIt || item.nameTh || 'DISH').trim();
  return rawName.toUpperCase();
}

/**
 * Universal Subtitle Resolver for Kitchen Monitor (Provides secondary bilingual reference)
 */
export function resolveDishSubtitle(item: any, targetLang: KdsLanguage): string | null {
  if (!item) return null;

  const found = findCanonicalDish(item);

  if (targetLang === 'th') {
    // In Thai mode, show English as secondary subtitle
    if (found?.names?.en) return found.names.en;
    if (item.name && typeof item.name === 'string') return item.name.toUpperCase();
  } else if (targetLang === 'mm') {
    // In Burmese mode, show Thai or English as secondary subtitle
    if (found?.names?.th) return found.names.th;
    if (found?.names?.en) return found.names.en;
  } else if (targetLang === 'it') {
    // In Italian mode, show English/Thai subtitle if different
    if (found?.names?.en && found.names.en !== found.names.it) return found.names.en;
  } else {
    // In English mode, show Italian original name or Thai name as subtitle
    if (found?.names?.it && found.names.it !== found.names.en) return found.names.it;
    if (found?.names?.th) return found.names.th;
  }

  return null;
}
