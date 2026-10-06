export type DishLang = 'IT' | 'EN' | 'TH' | 'DE' | 'MM';

export interface DishTranslationResult {
  name: Record<DishLang, string>;
  nameIt: string;
  nameEn: string;
  nameTh: string;
  nameDe: string;
  nameMm: string;
  description: Record<DishLang, string>;
  descriptionIt: string;
  descriptionEn: string;
  descriptionTh: string;
  descriptionDe: string;
  descriptionMm: string;
}

export async function translateDishCardAllLanguages(params: {
  sourceLang: DishLang;
  name: string;
  description: string;
  category: string;
  isDailySpecial?: boolean;
}): Promise<DishTranslationResult> {
  const { sourceLang, name, description, category, isDailySpecial } = params;

  // Try calling the serverless backend DeepSeek endpoint first
  try {
    const response = await fetch('/api/dish-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceLang,
        name,
        description,
        category,
        isDailySpecial
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.name && data.description) {
        return {
          name: {
            IT: data.name.IT || name,
            EN: data.name.EN || name,
            TH: data.name.TH || name,
            DE: data.name.DE || name,
            MM: data.name.MM || name,
          },
          nameIt: data.name.IT || name,
          nameEn: data.name.EN || name,
          nameTh: data.name.TH || name,
          nameDe: data.name.DE || name,
          nameMm: data.name.MM || name,
          description: {
            IT: data.description.IT || description,
            EN: data.description.EN || description,
            TH: data.description.TH || description,
            DE: data.description.DE || description,
            MM: data.description.MM || description,
          },
          descriptionIt: data.description.IT || description,
          descriptionEn: data.description.EN || description,
          descriptionTh: data.description.TH || description,
          descriptionDe: data.description.DE || description,
          descriptionMm: data.description.MM || description,
        };
      }
    }
  } catch (e) {
    console.warn('[dishTranslatorEngine] API call error, using local fallback:', e);
  }

  // Fallback: Maintain source input across all fields
  return {
    name: { IT: name, EN: name, TH: name, DE: name, MM: name },
    nameIt: name,
    nameEn: name,
    nameTh: name,
    nameDe: name,
    nameMm: name,
    description: { IT: description, EN: description, TH: description, DE: description, MM: description },
    descriptionIt: description,
    descriptionEn: description,
    descriptionTh: description,
    descriptionDe: description,
    descriptionMm: description,
  };
}
