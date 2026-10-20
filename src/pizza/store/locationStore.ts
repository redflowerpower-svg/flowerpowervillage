import { create } from 'zustand';
import { calculateDistance } from '../utils/distance';

// Coordinate ufficiali Flower Power - Ranong terraferma (vicino terme Raksawarin)
export let RESTAURANT_LAT = 9.9579545;
export let RESTAURANT_LNG = 98.6477837;

if (typeof window !== 'undefined') {
  const cachedLat = localStorage.getItem('pizza_restaurant_lat');
  const cachedLng = localStorage.getItem('pizza_restaurant_lng');
  if (cachedLat && cachedLng) {
    RESTAURANT_LAT = parseFloat(cachedLat);
    RESTAURANT_LNG = parseFloat(cachedLng);
  }
}

export const DEFAULT_DELIVERY_RADIUS_KM = 6;
export const DEFAULT_TAKEAWAY_RADIUS_KM = 25;

interface LocationState {
  userLat: number | null;
  userLng: number | null;
  distanceKm: number | null;
  maxRadiusKm: number;
  maxTakeawayRadiusKm: number;
  isDeliverable: boolean;
  isTakeawayAllowed: boolean;
  isLoading: boolean;
  error: string | null;

  requestLocation: () => Promise<{ lat: number; lng: number } | null>;
  setConfirmedLocation: (lat: number, lng: number) => void;
  setMaxRadius: (radius: number) => void;
  setMaxTakeawayRadius: (radius: number) => void;
  setSimulatedLocation: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLat: null,
  userLng: null,
  distanceKm: null,
  maxRadiusKm: DEFAULT_DELIVERY_RADIUS_KM,
  maxTakeawayRadiusKm: DEFAULT_TAKEAWAY_RADIUS_KM,
  isDeliverable: true,
  isTakeawayAllowed: true,
  isLoading: false,
  error: null,

  requestLocation: () => {
    return new Promise((resolve) => {
      set({ isLoading: true, error: null });

      if (!navigator.geolocation) {
        set({ error: 'Geolocalizzazione non supportata dal browser', isLoading: false });
        resolve(null);
        return;
      }

      const applyPos = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(RESTAURANT_LAT, RESTAURANT_LNG, latitude, longitude);
        set({
          userLat: latitude,
          userLng: longitude,
          distanceKm: distance,
          isDeliverable: distance <= get().maxRadiusKm,
          isTakeawayAllowed: distance <= get().maxTakeawayRadiusKm,
          isLoading: false,
          error: null
        });
        resolve({ lat: latitude, lng: longitude });
      };

      // Stadio 1: Tentativo rapido e ad alta precisione (15s timeout, accetta cache recente fino a 60s)
      navigator.geolocation.getCurrentPosition(
        applyPos,
        (err) => {
          // Stadio 2: Se timeout o segnale GPS debole al chiuso, fallback a precisione standard (WiFi / Cella telefonica)
          if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
            navigator.geolocation.getCurrentPosition(
              applyPos,
              (err2) => {
                const msg = err2.code === err2.PERMISSION_DENIED
                  ? 'Permessi GPS non concessi. Puoi indicare la posizione sulla mappa.'
                  : 'Segnale GPS non disponibile. Puoi indicare la posizione sulla mappa.';
                set({ error: msg, isLoading: false });
                resolve(null);
              },
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
            );
          } else {
            const msg = err.code === err.PERMISSION_DENIED
              ? 'Permessi GPS non concessi. Puoi indicare la posizione sulla mappa.'
              : 'Impossibile rilevare la posizione GPS.';
            set({ error: msg, isLoading: false });
            resolve(null);
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  },

  setConfirmedLocation: (lat, lng) => {
    const distance = calculateDistance(RESTAURANT_LAT, RESTAURANT_LNG, lat, lng);
    set({
      userLat: lat,
      userLng: lng,
      distanceKm: distance,
      isDeliverable: distance <= get().maxRadiusKm,
      isTakeawayAllowed: distance <= get().maxTakeawayRadiusKm,
      isLoading: false,
      error: null
    });
  },

  setSimulatedLocation: () => {
    set({
      userLat: RESTAURANT_LAT + 0.01,
      userLng: RESTAURANT_LNG + 0.01,
      distanceKm: 1.5,
      isDeliverable: true,
      isTakeawayAllowed: true,
      isLoading: false,
      error: null,
    });
  },

  setMaxRadius: (radius) => {
    const currentDistance = get().distanceKm;
    set({
      maxRadiusKm: radius,
      isDeliverable: currentDistance !== null ? currentDistance <= radius : true
    });
  },

  setMaxTakeawayRadius: (radius) => {
    const currentDistance = get().distanceKm;
    set({
      maxTakeawayRadiusKm: radius,
      isTakeawayAllowed: currentDistance !== null ? currentDistance <= radius : true
    });
  }
}));

