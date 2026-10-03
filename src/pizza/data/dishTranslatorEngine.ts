export type DishLang = 'IT' | 'EN' | 'TH' | 'DE';

export interface DishTranslationResult {
  name: Record<DishLang, string>;
  nameIt: string;
  nameEn: string;
  nameTh: string;
  nameDe: string;
  description: Record<DishLang, string>;
  descriptionIt: string;
  descriptionEn: string;
  descriptionTh: string;
  descriptionDe: string;
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
          },
          nameIt: data.name.IT || name,
          nameEn: data.name.EN || name,
          nameTh: data.name.TH || name,
          nameDe: data.name.DE || name,
          description: {
            IT: data.description.IT || description,
            EN: data.description.EN || description,
            TH: data.description.TH || description,
            DE: data.description.DE || description,
          },
          descriptionIt: data.description.IT || description,
          descriptionEn: data.description.EN || description,
          descriptionTh: data.description.TH || description,
          descriptionDe: data.description.DE || description,
        };
      }
    }
  } catch (e) {
    console.warn('[dishTranslatorEngine] API call error, using local fallback:', e);
  }

  // Fallback: Maintain source input across all fields
  return {
    name: { IT: name, EN: name, TH: name, DE: name },
    nameIt: name,
    nameEn: name,
    nameTh: name,
    nameDe: name,
    description: { IT: description, EN: description, TH: description, DE: description },
    descriptionIt: description,
    descriptionEn: description,
    descriptionTh: description,
    descriptionDe: description,
  };
}
