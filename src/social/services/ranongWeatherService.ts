/**
 * 🌦️ Ranong & Koh Phayam Live Weather Service
 * Interroga Open-Meteo API (gratuita, zero API key, risposta in ~50ms)
 * per determinare in tempo reale le condizioni meteo di Ranong e Koh Phayam
 * (pioggia, temporale, sole, temperatura, sera/giorno).
 * Include cache in memoria di 10 minuti per evitare chiamate ripetute.
 */

export interface WeatherConditionSummary {
  city: 'Ranong' | 'Koh Phayam';
  tempC: number;
  isRaining: boolean;
  isHeavyRain: boolean;
  isNight: boolean;
  weatherCode: number;
  labelIt: string;
  labelTh: string;
  labelEn: string;
  sensoryAngle: string; // Ispirazione contestuale per DeepSeek AI
}

// Coordinate GPS
const RANONG_COORDS = { lat: 9.9658, lon: 98.6348 };
const PHAYAM_COORDS = { lat: 9.7300, lon: 98.4000 };

// Cache in memoria (10 minuti)
let cachedWeather: {
  ranong?: { data: WeatherConditionSummary; timestamp: number };
  phayam?: { data: WeatherConditionSummary; timestamp: number };
} = {};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minuti

/**
 * Traduzione codici WMO in etichette sensoriali biculturali
 */
function interpretWeather(
  code: number, 
  temp: number, 
  isDay: boolean, 
  rainMm: number, 
  city: 'Ranong' | 'Koh Phayam'
): WeatherConditionSummary {
  // WMO Code Reference:
  // 51-55: Pioggerella (Drizzle)
  // 61-65: Pioggia (Rain)
  // 80-82: Rovesci / Acquazzoni tropicali (Showers)
  // 95-99: Temporali (Thunderstorm)
  const isDrizzle = code >= 51 && code <= 55;
  const isRegularRain = code >= 61 && code <= 65;
  const isShower = code >= 80 && code <= 82;
  const isThunder = code >= 95 && code <= 99;
  const isRaining = isDrizzle || isRegularRain || isShower || isThunder || rainMm > 0;
  const isHeavyRain = isThunder || code === 65 || code === 82 || rainMm > 2.0;
  const isNight = !isDay;

  let labelIt = 'Sereno';
  let labelTh = 'อากาศแจ่มใส';
  let labelEn = 'Clear';
  let sensoryAngle = '';

  if (isThunder) {
    labelIt = `Temporale tropicale (${temp}°C)`;
    labelTh = `พายุฝนฟ้าคะนองใน${city === 'Ranong' ? 'ระนอง' : 'เกาะพยาม'} (${temp}°C)`;
    labelEn = `Tropical Thunderstorm (${temp}°C)`;
    sensoryAngle = `Temporale forte fuori: massimo contrasto con il calore accogliente della pizza appena sfornata e consegna rapida senza bagnarsi a domicilio.`;
  } else if (isHeavyRain || isShower) {
    labelIt = `Pioggia battente a ${city} (${temp}°C)`;
    labelTh = `ฝนตกหนักฉ่ำๆ ใน${city === 'Ranong' ? 'ระนอง' : 'เกาะพยาม'} (${temp}°C)`;
    labelEn = `Heavy Tropical Rain (${temp}°C)`;
    sensoryAngle = `Fuori piove a dirotto (Ranong città della pioggia '8 mesi di pioggia'): comfort food caldo, profumo del forno, non bagnarti e ricevi la pizza calda nei box termici sul divano.`;
  } else if (isRaining) {
    labelIt = `Pioggia leggera (${temp}°C)`;
    labelTh = `ฝนตกโปรยปราย เย็นสบาย (${temp}°C)`;
    labelEn = `Light Rain (${temp}°C)`;
    sensoryAngle = `Aria fresca e pioggia leggera: atmosfera intima, perfetta per una cena confortevole con pasta fresca o pizza artigianale croccante.`;
  } else if (isNight) {
    labelIt = `Serata piacevole a ${city} (${temp}°C)`;
    labelTh = `ยามค่ำคืนสบายๆ ใน${city === 'Ranong' ? 'ระนอง' : 'เกาะพยาม'} (${temp}°C)`;
    labelEn = `Pleasant Evening (${temp}°C)`;
    sensoryAngle = `Serata rilassante e conviviale: cena italiana sotto le stelle o delivery puntuale per chiudere la giornata con autentico gusto.`;
  } else {
    labelIt = `Cielo limpido e sole (${temp}°C)`;
    labelTh = `ท้องฟ้าแจ่มใส แดดดี (${temp}°C)`;
    labelEn = `Sunny & Warm (${temp}°C)`;
    sensoryAngle = `Giornata radiosa: freschezza degli ingredienti italiani, mozzarella fior di latte, verande all'aperto e convivialità vivace.`;
  }

  return {
    city,
    tempC: Math.round(temp),
    isRaining,
    isHeavyRain,
    isNight,
    weatherCode: code,
    labelIt,
    labelTh,
    labelEn,
    sensoryAngle
  };
}

/**
 * Ottiene il meteo live per Ranong o Koh Phayam con fallback sicuro
 */
export async function getLiveWeather(city: 'Ranong' | 'Koh Phayam' = 'Ranong'): Promise<WeatherConditionSummary> {
  const coords = city === 'Ranong' ? RANONG_COORDS : PHAYAM_COORDS;
  const cacheKey = city === 'Ranong' ? 'ranong' : 'phayam';

  const existing = cachedWeather[cacheKey];
  if (existing && Date.now() - existing.timestamp < CACHE_TTL_MS) {
    return existing.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,precipitation,rain,weather_code,is_day&timezone=Asia%2FBangkok`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);

    const data = await res.json();
    const curr = data.current;
    const summary = interpretWeather(
      curr.weather_code ?? 0,
      curr.temperature_2m ?? 28,
      Boolean(curr.is_day),
      (curr.rain ?? curr.precipitation ?? 0),
      city
    );

    cachedWeather[cacheKey] = {
      data: summary,
      timestamp: Date.now()
    };

    return summary;
  } catch (err) {
    console.warn('[ranongWeatherService] Fallback to default tropical weather:', err);
    // Fallback naturale: clima piacevole tipico di Ranong
    return {
      city,
      tempC: 28,
      isRaining: false,
      isHeavyRain: false,
      isNight: false,
      weatherCode: 1,
      labelIt: 'Clima tropicale (28°C)',
      labelTh: 'อากาศสบายๆ ในระนอง (28°C)',
      labelEn: 'Tropical Breeze (28°C)',
      sensoryAngle: 'Atmosfera tropicale conviviale con profumo autentico di cucina italiana.'
    };
  }
}
