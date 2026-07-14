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

interface LocationState {
  userLat: number | null;
  userLng: number | null;
  distanceKm: number | null;
  maxRadiusKm: number;
  isDeliverable: boolean;
  isLoading: boolean;
  error: string | null;

  requestLocation: () => Promise<{ lat: number; lng: number } | null>;
  setConfirmedLocation: (lat: number, lng: number) => void;
  setMaxRadius: (radius: number) => void;
  setSimulatedLocation: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLat: null,
  userLng: null,
  distanceKm: null,
  maxRadiusKm: 5,
  isDeliverable: true,
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

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          set({
            userLat: latitude,
            userLng: longitude,
            isLoading: false
          });
          resolve({ lat: latitude, lng: longitude });
        },
        (_error) => {
          set({ error: 'Permessi GPS non concessi o segnale non disponibile.', isLoading: false });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 6000 }
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
  }
}));
