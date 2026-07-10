import React, { useState, useEffect } from 'react';
import { Coffee, Wind, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAccommodations, EnrichedAccommodation } from '../../data/accommodationsService';
import { checkAvailability } from '../../lib/octorate';
import { translations, Language } from '../../lib/translations';
import { PRICE_CONFIG } from '../config/accommodations';

interface RoomGridProps {
  lang: Language;
  activeCategory: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  onResetFilters?: () => void;
  onSelectRoom?: (room: any, pricing: any, extras: { breakfast: boolean; ac: boolean }) => void;
  oauthConnected?: boolean;
}

function calculateStayDays(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function isLowSeason(checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const lowSeasonMonths = [4, 5, 6, 7, 8, 9];
  const startMonth = start.getMonth();
  const endMonth = end.getMonth();
  return lowSeasonMonths.includes(startMonth) || lowSeasonMonths.includes(endMonth);
}

function getDiscountInfo(days: number): { label: string; discount: number; color: string } {
  if (days >= 30) {
    return { label: "Tariffa Long-Term Coliving (-20%)", discount: 0.20, color: "bg-emerald-600" };
  } else if (days >= 15) {
    return { label: "Sconto Medium-Stay (-15%)", discount: 0.15, color: "bg-emerald-500" };
  } else if (days > 0) {
    return { label: "Prezzo Diretto Garantito (-10%)", discount: 0.10, color: "bg-primary" };
  }
  return { label: "", discount: 0, color: "" };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export const RoomGrid: React.FC<RoomGridProps> = ({
  lang,
  activeCategory,
  guests,
  checkIn,
  checkOut,
  onResetFilters,
  onSelectRoom,
  oauthConnected,
}) => {
  const [rooms, setRooms] = useState<EnrichedAccommodation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [octorateRooms, setOctorateRooms] = useState<any[]>([]);
  const [showDevMapping, setShowDevMapping] = useState<boolean>(false);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, { breakfast: boolean; ac: boolean }>>({});

  const [availabilityResults, setAvailabilityResults] = useState<any[]>([]);
  const [isOctorateOffline, setIsOctorateOffline] = useState<boolean>(false);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [availabilityChecked, setAvailabilityChecked] = useState<boolean>(false);

  // Gallery Modal State
  const [activeGalleryRoom, setActiveGalleryRoom] = useState<EnrichedAccommodation | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const stayDays = calculateStayDays(checkIn, checkOut);
  const lowSeason = isLowSeason(checkIn, checkOut);
  const discountInfo = getDiscountInfo(stayDays);
  const isMaxSavings = stayDays >= 30 && lowSeason;

  const t = (key: keyof typeof translations['IT'], variables?: Record<string, string | number>) => {
    let text = translations[lang][key] || translations['IT'][key] || '';
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // Load accommodations from Supabase
  useEffect(() => {
    setLoading(true);
    fetchAccommodations()
      .then((data) => {
        setRooms(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading accommodations:", err);
        setError(err.message || "Errore durante il caricamento degli alloggi.");
        setLoading(false);
      });
  }, []);

  // Load live prices from Octorate (mock API routes)
  useEffect(() => {
    if (oauthConnected) {
      const structureId = import.meta.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
      console.log(`[Octorate Debug] Fetching roomrates for structure ID: ${structureId}`);
      
      const fetchRates = async () => {
        const { getStoredTokens, refreshAccessToken } = await import('../../lib/octorate');
        const tokens = await getStoredTokens();
        if (!tokens) {
          console.warn("[Octorate Debug] oauthConnected is true but getStoredTokens returned null");
          return;
        }

        let res = await fetch(`/api-octorate/connect/rest/v1/roomrates/${structureId}`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${tokens.access_token}`,
          },
        });
        
        if (res.status === 401 || res.status === 403) {
          console.log("[Octorate Debug] Roomrates fetch returned 401/403, attempting to refresh token...");
          try {
            const newTokens = await refreshAccessToken();
            res = await fetch(`/api-octorate/connect/rest/v1/roomrates/${structureId}`, {
              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${newTokens.access_token}`,
              },
            });
          } catch (refreshErr) {
            console.error("[Octorate Debug] Failed to refresh token during roomrates fetch:", refreshErr);
          }
        }
        
        console.log(`[Octorate Debug] Response status: ${res.status}`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("[Octorate Debug] Received roomrates data:", data);
        if (Array.isArray(data)) {
          setOctorateRooms(data);
        } else {
          console.warn("[Octorate Debug] Data is not an array:", data);
        }
      };

      fetchRates().catch((err) => console.error("[Octorate Debug] Error loading roomrates:", err));
    } else {
      console.log("[Octorate Debug] Octorate is not connected (oauthConnected is false)");
    }
  }, [oauthConnected]);

  // Load dynamic date-specific availability and pricing from Octorate
  useEffect(() => {
    if (oauthConnected && checkIn && checkOut && stayDays > 0) {
      console.log(`[Octorate Debug] Querying availability: CheckIn: ${checkIn}, CheckOut: ${checkOut}, Guests: ${guests}`);
      setLoadingAvailability(true);
      setAvailabilityChecked(false);
      checkAvailability(checkIn, checkOut, guests)
        .then((results) => {
          // Log stringified complete response as requested
          console.log("[Octorate Debug] Availability payload stringified:", JSON.stringify(results));
          
          if (Array.isArray(results)) {
            setAvailabilityResults(results);
            setIsOctorateOffline(false);
          } else {
            console.warn("[Octorate Debug] Availability response is not an array:", results);
            setIsOctorateOffline(true);
          }
          setAvailabilityChecked(true);
          setLoadingAvailability(false);
        })
        .catch((err) => {
          console.error("[Octorate Debug] checkAvailability failed with network error:", err);
          setIsOctorateOffline(true);
          setAvailabilityResults([]);
          setAvailabilityChecked(true);
          setLoadingAvailability(false);
        });
    } else {
      setAvailabilityResults([]);
      setIsOctorateOffline(false);
      setAvailabilityChecked(checkIn && checkOut && stayDays > 0 ? true : false);
      setLoadingAvailability(false);
    }
  }, [oauthConnected, checkIn, checkOut, guests, stayDays]);

  // Gallery keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeGalleryRoom) return;
      if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'Escape') {
        closeGallery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGalleryRoom, activeImageIndex]);

  const openGallery = (room: EnrichedAccommodation) => {
    if (room.images && room.images.length > 0) {
      setActiveGalleryRoom(room);
      setActiveImageIndex(0);
    }
  };

  const closeGallery = () => {
    setActiveGalleryRoom(null);
  };

  const nextImage = () => {
    if (!activeGalleryRoom) return;
    setActiveImageIndex((prev) => (prev + 1) % activeGalleryRoom.images.length);
  };

  const prevImage = () => {
    if (!activeGalleryRoom) return;
    setActiveImageIndex((prev) => (prev - 1 + activeGalleryRoom.images.length) % activeGalleryRoom.images.length);
  };


  // Enrich dynamically loaded accommodations with live Octorate info
  const enrichedRooms = rooms.map((room) => {
    let finalPriceHigh = room.base_price_high;
    let finalPriceLow = room.base_price_low;
    let isLiveFromOctorate = false;

    if (room.octorateId) {
      const octorateMatch = octorateRooms.find((r) => r.id === room.octorateId);
      if (octorateMatch && octorateMatch.minimumSellingPrice) {
        finalPriceHigh = octorateMatch.minimumSellingPrice;
        finalPriceLow = Math.round(octorateMatch.minimumSellingPrice * 0.25); // preserve low season ratio
        isLiveFromOctorate = true;
      }
    }

    return {
      ...room,
      base_price_high: finalPriceHigh,
      base_price_low: finalPriceLow,
      isLive: isLiveFromOctorate,
    };
  });

  // Filter accommodations
  const filteredRooms = enrichedRooms.filter((room) => {
    const normalizedActive = (activeCategory || '').toUpperCase();
    const normalizedRoomCat = room.category.toUpperCase();

    if (normalizedActive !== 'TUTTI' && normalizedRoomCat !== normalizedActive) {
      return false;
    }
    if (guests && room.capacity < guests) {
      return false;
    }

    // After availability check: hide rooms marked as unavailable by Octorate
    if (availabilityChecked && !loadingAvailability && !isOctorateOffline && availabilityResults.length > 0 && room.octorateId) {
      const availMatch = availabilityResults.find((a) => String(a.accommodationId) === String(room.octorateId));
      if (availMatch && !availMatch.available) {
        return false;
      }
    }

    return true;
  });

  const calculateFinalPrice = (item: typeof enrichedRooms[0]) => {
    const staticBasePrice = (isMaxSavings || (stayDays >= 30 && lowSeason))
      ? item.base_price_low
      : item.base_price_high;

    let basePrice = staticBasePrice;
    let isAvailable = true;
    let usingDynamicPrice = false;

    // Use dynamic availability/price if Octorate is online and we have results
    if (!isOctorateOffline && availabilityResults.length > 0 && item.octorateId) {
      const availMatch = availabilityResults.find((a) => String(a.accommodationId) === String(item.octorateId));
      if (availMatch) {
        if (availMatch.available) {
          basePrice = availMatch.pricePerNight || (availMatch.totalPrice / stayDays) || staticBasePrice;
          usingDynamicPrice = true;
        } else {
          isAvailable = false;
        }
      }
    }

    const discountedPrice = basePrice * (1 - discountInfo.discount);

    // Floor price check
    if (item.octorateId) {
      const octorateMatch = octorateRooms.find((r) => r.id === item.octorateId);
      if (octorateMatch && octorateMatch.minimumSellingPrice) {
        if (usingDynamicPrice && basePrice < octorateMatch.minimumSellingPrice) {
          console.warn(`[Octorate Warning] Dynamic price (${basePrice} THB) for ${item.name} is lower than safety floor (${octorateMatch.minimumSellingPrice} THB). Forcing safety floor.`);
          basePrice = octorateMatch.minimumSellingPrice;
        }
      }
    }

    return {
      original: item.base_price_high,
      basePriceLordo: basePrice,
      final: Math.round(discountedPrice),
      perNight: Math.round(discountedPrice),
      total: stayDays > 0 ? Math.round(discountedPrice * stayDays) : 0,
      savings: isMaxSavings
        ? Math.round((item.base_price_high - discountedPrice) / item.base_price_high * 100)
        : Math.round(discountInfo.discount * 100),
      isAvailable,
      usingDynamicPrice
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 w-full">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-emerald-800 rounded-full animate-spin mb-4"></div>
        <p className="text-stone-500 font-serif italic text-base">Caricamento alloggi in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-red-50/50 rounded-3xl border border-red-200 p-8 w-full">
        <p className="text-red-800 text-lg font-bold">Errore di connessione</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (filteredRooms.length === 0) {
    return (
      <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-300 p-8 w-full">
        <p className="text-muted-foreground text-lg">
          Nessun alloggio soddisfa i criteri di ricerca selezionati.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-4 text-primary font-semibold text-sm hover:underline"
          >
            Azzera i filtri
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((item) => {
          const isDateSelected = stayDays > 0;
          const isUnlocked = isDateSelected && guests > 0 && availabilityChecked && !loadingAvailability;
          const pricing = calculateFinalPrice(item);
          
          // Retrieve local extras selection for this specific room
          const extras = selectedExtras[item.id] || { breakfast: false, ac: false };
          
          // Extra guests surcharge
          const extraGuests = Math.min(item.maxExtraGuests, Math.max(0, guests - item.baseGuests));
          const extraGuestsPricePerNight = extraGuests * PRICE_CONFIG.EXTRA_GUEST_PRICE;
          const extraGuestsPrice = extraGuestsPricePerNight * stayDays;
          
          // Calculate extras pricing
          const breakfastPrice = extras.breakfast ? (PRICE_CONFIG.BREAKFAST_PRICE * guests * stayDays) : 0;
          const acPrice = extras.ac ? PRICE_CONFIG.AC_SURCHARGE : 0;
          
          // Pricing hierarchy matching: Totale = ((Prezzo_Base * Notti) + Costi_Extra) * (1 - Sconto)
          const discountRate = discountInfo.discount; // e.g. 0.10, 0.15, or 0.20
          
          // Prezzo Base Lordo totalizzato per le notti
          const baseRoomTotalLordo = pricing.basePriceLordo * stayDays;
          
          // Somma extra totali (inclusi ospiti aggiuntivi e servizi selezionati)
          const extraCostsTotalLordo = extraGuestsPrice + breakfastPrice + acPrice;
          
          // Totale Lordo complessivo
          const totalLordo = baseRoomTotalLordo + extraCostsTotalLordo;
          
          // Calcolo sconto del 10% (o sconti long-stay progressivi) sul totale lordo
          const discountAmount = Math.round(totalLordo * discountRate);
          const finalTotalPrice = totalLordo - discountAmount;
          
          // Prezzo per notte scontato comprensivo di supplemento ospiti extra (per il compact view)
          // (Prezzo_Base + Extra_Ospiti) * (1 - Sconto)
          const finalNightlyPrice = Math.round((pricing.basePriceLordo + extraGuestsPricePerNight) * (1 - discountRate));
          
          const pricingWithExtras = {
            ...pricing,
            final: finalNightlyPrice,
            extraGuests: extraGuestsPrice,
            breakfast: breakfastPrice,
            ac: acPrice,
            total: finalTotalPrice,
            discountAmount: discountAmount,
            totalLordo: totalLordo
          };

          const toggleExtra = (roomId: string, type: 'breakfast' | 'ac') => {
            setSelectedExtras((prev) => {
              const current = prev[roomId] || { breakfast: false, ac: false };
              return {
                ...prev,
                [roomId]: {
                  ...current,
                  [type]: !current[type]
                }
              };
            });
          };

          const isExpanded = isUnlocked && expandedRoomId === item.id;

          const handleScrollToCalendar = (cardEl: HTMLElement | null) => {
            // Usa getElementById per trovare ESATTAMENTE la sticky search bar,
            // evitando di intercettare altri <form> presenti nel DOM del sito madre
            const searchForm = document.getElementById('booking-search-form') as HTMLElement | null;
            if (!searchForm) return;

            // Scroll the form (sticky bar) into viewport first
            const formRect = searchForm.getBoundingClientRect();
            const scrollTop = window.scrollY + formRect.top;
            window.scrollTo({ top: scrollTop, behavior: 'smooth' });

            // If we have the card element, after scroll settle, position the window
            // so the calendar bar sits exactly ~10px above the card (1 cm)
            if (cardEl) {
              setTimeout(() => {
                const cardRect = cardEl.getBoundingClientRect();
                const formHeight = searchForm.offsetHeight;
                // Target: card should appear ~38px below the sticky form bottom
                const targetScroll = window.scrollY + cardRect.top - formHeight - 38;
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
              }, 400);
            }

            // Apply pulse-highlight animation to the form
            setTimeout(() => {
              searchForm.classList.add('pulse-highlight');
              setTimeout(() => {
                searchForm.classList.remove('pulse-highlight');
              }, 2000);
            }, 300);
          };

          return (
            <article
              key={item.id}
              className="bg-stone-50 rounded-[2rem] border border-stone-300 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group will-change-transform"
            >
              {/* IMAGE HEADER - CLICKABLE GALLERY POPUP */}
              <div 
                onClick={() => openGallery(item)}
                className="relative h-64 bg-stone-300 overflow-hidden flex-shrink-0 rounded-t-[2rem] cursor-pointer group/image"
              >
                {item.images && item.images.length > 0 ? (
                  <>
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500 brightness-[0.96] contrast-[1.03]"
                    />
                    {/* Vertical gradient overlay: darkens only the edges (top/bottom) for badges legibility, keeping center clear and bright */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none transition-opacity duration-300 group-hover/image:opacity-80" />
                    
                    {/* Stylish Hover Gallery Overlay */}
                    <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-2 font-semibold text-xs backdrop-blur-[2px]">
                      <div className="p-3 bg-stone-900/90 rounded-full border border-stone-700 shadow-lg scale-90 group-hover/image:scale-100 transition-transform duration-300">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="tracking-wide uppercase text-[10px]">Vedi Galleria ({item.images.length})</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-stone-300 text-muted-foreground p-4 border-b border-stone-400">
                    <span className="font-serif italic text-sm text-muted-foreground tracking-wide">
                      Photos coming soon
                    </span>
                  </div>
                )}
                <span className={`absolute top-4 left-4 glass-badge-dark text-white text-[9px] font-bold tracking-wider px-3 py-1.5 rounded-xl shadow-sm ${item.category.toUpperCase() !== "THE HUB GUESTHOUSE" ? "uppercase" : ""}`}>
                  {item.category.toUpperCase() === "THE HUB GUESTHOUSE" ? "HUBit@" : item.category}
                </span>
 
                {/* Capacity badge — bottom right of image */}
                <span className="absolute bottom-4 right-4 glass-badge-dark text-white text-[9px] font-bold tracking-wider px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {lang === 'IT' ? `Fino a ${item.capacity} ospiti` : `Up to ${item.capacity} guests`}
                </span>
 
                {isUnlocked && discountInfo.label && (
                  <span className={`absolute top-4 right-4 ${discountInfo.color} text-white text-[9px] font-bold tracking-wider px-3 py-1.5 rounded-xl shadow-sm uppercase`}>
                    {discountInfo.label.split(' ')[0]} {discountInfo.label.match(/\(-?\d+%\)/)?.[0]}
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-sans text-lg font-bold text-stone-900 leading-tight tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-xs font-light leading-relaxed mb-4 flex-grow">
                  {item.description}
                </p>

                <p className="text-stone-500 text-[11px] font-medium mb-3">
                  {t('beds')}: {item.beds}
                </p>




                {!isUnlocked ? (
                  /* ================= STATO LOCKED ================= */
                  <div className="mt-auto pt-4 border-t border-stone-300">
                    <button
                      type="button"
                      onClick={(e) => handleScrollToCalendar(e.currentTarget.closest('article'))}
                      className="w-full bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white text-xs font-bold py-3.5 px-4 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer text-center tracking-wide"
                    >
                      {loadingAvailability ? "Verifica disponibilità..." : "Seleziona date per il prezzo"}
                    </button>
                  </div>
                ) : (
                  /* ================= STATO UNLOCKED ================= */
                  <div className="flex flex-col flex-grow mt-auto pt-4 border-t border-stone-300">
                    {isExpanded && (
                      <div className="mb-6 bg-stone-200/40 p-4 rounded-2xl border border-stone-300/50 space-y-4">
                        <span className="block text-[9px] uppercase tracking-wider text-stone-500 font-extrabold mb-1">
                          {t('extraServicesTitle' as any)}:
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExtra(item.id, 'breakfast')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                              extras.breakfast
                                ? "bg-emerald-800 border-emerald-800 text-white"
                                : "bg-white border-stone-300 text-stone-600 hover:bg-stone-100/50"
                            }`}
                          >
                            <Coffee className="w-3.5 h-3.5" />
                            <span>Colazione</span>
                          </button>

                          {/* AC toggle — hidden for Tende Glamping (no AC available) */}
                          {item.category.toUpperCase() !== 'TENDE GLAMPING' && (
                            <button
                              type="button"
                              onClick={() => toggleExtra(item.id, 'ac')}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                                extras.ac
                                  ? "bg-emerald-800 border-emerald-800 text-white"
                                  : "bg-white border-stone-300 text-stone-600 hover:bg-stone-100/50"
                              }`}
                            >
                              <Wind className="w-3.5 h-3.5" />
                              <span>Aria Cond.</span>
                            </button>
                          )}
                        </div>

                        {/* DETAILED PRICE BREAKDOWN INSIDE THE DRAWER */}
                        <div className="space-y-2 pt-3 border-t border-stone-300 text-xs">
                          <span className="block text-[9px] uppercase tracking-wider text-stone-500 font-extrabold mb-1">
                            Dettaglio Costi:
                          </span>
                          <div className="space-y-1.5 text-stone-600 font-medium">
                            <div className="flex justify-between">
                              <span>Alloggio ({stayDays} {stayDays === 1 ? 'notte' : 'notti'}):</span>
                              <span>{formatPrice(baseRoomTotalLordo)}</span>
                            </div>
                            
                            {extraGuests > 0 && (
                              <div className="flex justify-between">
                                <span>Ospiti aggiuntivi ({extraGuests} pers.):</span>
                                <span>{formatPrice(extraGuestsPrice)}</span>
                              </div>
                            )}
                            
                            {extras.breakfast && (
                              <div className="flex justify-between">
                                <span>Colazione:</span>
                                <span>{formatPrice(breakfastPrice)}</span>
                              </div>
                            )}
                            
                            {extras.ac && (
                              <div className="flex justify-between">
                                <span>Aria Condizionata:</span>
                                <span>{formatPrice(acPrice)}</span>
                              </div>
                            )}

                            <div className="flex justify-between font-bold border-t border-dashed border-stone-300 pt-1.5 text-stone-700">
                              <span>Subtotale Lordo:</span>
                              <span>{formatPrice(totalLordo)}</span>
                            </div>

                            <div className="flex justify-between text-emerald-700 font-bold">
                              <span>Sconto Diretto (-{Math.round(discountRate * 100)}%):</span>
                              <span>-{formatPrice(discountAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5 flex-wrap">
                          {isExpanded ? "Totale Finito" : t('pricePerNight')}
                          {item.isLive && !isOctorateOffline && (
                            <span className="inline-block bg-emerald-100 text-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-400/20 backdrop-blur-sm shadow-sm animate-pulse">
                              Live Octorate
                            </span>
                          )}
                          {isOctorateOffline && item.octorateId && (
                            <span className="inline-block bg-amber-100 text-amber-800 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-400/20 backdrop-blur-sm shadow-sm">
                              Tariffa offline
                            </span>
                          )}
                        </span>
                        
                        {pricing.isAvailable ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-baseline gap-2">
                              {isExpanded ? (
                                <>
                                  <span className="text-xl font-extrabold text-emerald-800">
                                    {formatPrice(pricingWithExtras.total)}
                                  </span>
                                  {pricingWithExtras.discountAmount > 0 && (
                                    <span className="text-xs line-through text-stone-400">
                                      {formatPrice(pricingWithExtras.totalLordo)}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className="text-xl font-extrabold text-stone-900">
                                    {formatPrice(pricingWithExtras.final)}
                                  </span>
                                  {pricing.savings > 0 && (
                                    <span className="text-xs line-through text-stone-400">
                                      {formatPrice(Math.round(pricing.basePriceLordo + extraGuestsPricePerNight))}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            {!isExpanded && (
                              <p className="text-primary font-bold text-xs">
                                {lang === 'IT' && <>Totale: <span className="text-emerald-700 font-extrabold">{formatPrice(pricingWithExtras.total)}</span> ({stayDays} notti)</>}
                                {lang === 'EN' && <>Total: <span className="text-emerald-700 font-extrabold">{formatPrice(pricingWithExtras.total)}</span> ({stayDays} nights)</>}
                                {lang === 'TH' && <>รวม: <span className="text-emerald-700 font-extrabold">{formatPrice(pricingWithExtras.total)}</span> ({stayDays} คืน)</>}
                                {lang === 'DE' && <>Gesamt: <span className="text-emerald-700 font-extrabold">{formatPrice(pricingWithExtras.total)}</span> ({stayDays} Nächte)</>}
                                {pricing.savings > 0 && (
                                  <span className="text-emerald-600 ml-1.5 font-extrabold">
                                    -{pricing.savings}%
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="py-2">
                            <span className="inline-block text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-xl">
                              Non disponibile
                            </span>
                          </div>
                        )}
                      </div>

                      {pricing.isAvailable ? (
                        isExpanded ? (
                          <button
                            onClick={() => onSelectRoom && onSelectRoom(item, pricingWithExtras, extras)}
                            className="bg-stone-900 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 hover:px-7 cursor-pointer"
                          >
                            Conferma
                          </button>
                        ) : (
                          <button
                            onClick={() => setExpandedRoomId(item.id)}
                            className="bg-stone-900 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 hover:px-7 cursor-pointer"
                          >
                            Configura
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="bg-stone-200 text-stone-400 text-xs font-semibold px-6 py-3 rounded-full cursor-not-allowed pointer-events-none border border-stone-300 shadow-none"
                        >
                          Non Disponibile
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* OCTORATE DEV MAPPING HELPER */}
      {oauthConnected && (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-stone-900 border border-stone-850 rounded-3xl text-stone-300 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <h3 className="font-bold text-stone-100 uppercase tracking-wider text-xs">
                Octorate Dev Room Mapping & Diagnostics (Produzione)
              </h3>
            </div>
            <button
              onClick={() => setShowDevMapping(!showDevMapping)}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-750 text-[10px] font-bold uppercase rounded-lg border border-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
            >
              {showDevMapping ? "Nascondi" : "Mostra Diagnostica"}
            </button>
          </div>
          
          {showDevMapping && (
            <div className="space-y-6 animate-fadeIn text-xs">
              <div>
                <h4 className="font-bold text-stone-100 mb-2 uppercase tracking-wide text-[10px] text-emerald-400">
                  1. Stato Mappatura Camere del Sito
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2 px-2">Camera Sito</th>
                        <th className="py-2 px-2">ID nel Codice</th>
                        <th className="py-2 px-2">Stato</th>
                        <th className="py-2 px-2">Octorate Room/Rate Name</th>
                        <th className="py-2 px-2">Consiglio / Correzione</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/50">
                      {rooms.map((room) => {
                        const octorateMatch = octorateRooms.find((r) => r.id === room.octorateId);
                        
                        let suggestion = "";
                        if (!octorateMatch && octorateRooms.length > 0) {
                          const potentialMatches = octorateRooms.filter((r) => {
                            const octorateRoomName = (r.room?.name || "").toLowerCase();
                            const siteRoomName = room.name.toLowerCase();
                            return octorateRoomName.includes(siteRoomName) || siteRoomName.includes(octorateRoomName) ||
                                   (room.name === "Internal Room" && octorateRoomName.includes("inter"));
                          });
                          if (potentialMatches.length > 0) {
                            suggestion = potentialMatches.map(m => "Usa ID: " + m.id + " (" + (m.room?.name || 'N/D') + " - " + (m.name || 'N/D') + ")").join(" | ");
                          }
                        }

                        return (
                          <tr key={room.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-2 px-2 font-semibold text-stone-200">{room.name}</td>
                            <td className="py-2 px-2 font-mono text-stone-400">{room.octorateId || "Mancante"}</td>
                            <td className="py-2 px-2">
                              {octorateMatch ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">Mappato OK</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full font-bold">Non Trovato</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-stone-300">
                              {octorateMatch ? octorateMatch.room?.name + " (" + octorateMatch.name + ")" : "-"}
                            </td>
                            <td className="py-2 px-2 text-amber-400 font-medium">{suggestion || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-100 mb-2 uppercase tracking-wide text-[10px] text-emerald-400">
                  2. Tariffe Ricevute da Octorate (Elenco Completo)
                </h4>
                {octorateRooms.length === 0 ? (
                  <p className="text-xs text-amber-500 font-semibold italic">Nessuna tariffa caricata da Octorate o connessione in corso...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-800 text-stone-400">
                          <th className="py-2 px-2">Stanza Octorate (room.name)</th>
                          <th className="py-2 px-2">Room ID (room.id)</th>
                          <th className="py-2 px-2">Tariffa Name</th>
                          <th className="py-2 px-2">Rate ID (rate.id)</th>
                          <th className="py-2 px-2 text-right">Prezzo Min.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/50">
                        {octorateRooms.map((rate) => (
                          <tr key={rate.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-2 px-2 font-semibold text-stone-200">{rate.room?.name || "N/D"}</td>
                            <td className="py-2 px-2 font-mono text-stone-400">{rate.room?.id || "N/D"}</td>
                            <td className="py-2 px-2 text-stone-400">{rate.name || "N/D"}</td>
                            <td className="py-2 px-2 text-emerald-400 font-mono font-bold select-all">{rate.id}</td>
                            <td className="py-2 px-2 text-right font-semibold text-stone-200">เธฟ{rate.minimumSellingPrice || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-stone-100 mb-2 uppercase tracking-wide text-[10px] text-emerald-400">
                  3. JSON Grezzo Ricevuto da Octorate (API Response)
                </h4>
                <textarea
                  readOnly
                  value={octorateRooms.length > 0 ? JSON.stringify(octorateRooms, null, 2) : "In attesa di caricamento o nessun dato ricevuto..."}
                  className="w-full h-48 bg-stone-950 border border-stone-850 rounded-xl p-3 font-mono text-[10px] text-emerald-400 focus:outline-none focus:border-stone-800"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* STYLISH GALLERY POPUP MODAL */}
      {activeGalleryRoom && activeGalleryRoom.images && activeGalleryRoom.images.length > 0 && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center py-4 px-2 md:p-6 bg-stone-950/95 backdrop-blur-md select-none transition-all duration-300 overflow-hidden h-screen">
          
          {/* Close button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white cursor-pointer transition-all duration-200 z-[110]"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Main image container */}
          <div className="relative w-full max-w-5xl flex-1 min-h-0 flex items-center justify-center py-2 md:py-4">
            
            {/* Left arrow */}
            <button
              onClick={prevImage}
              className="absolute left-2 md:left-4 p-2 md:p-3 rounded-full bg-stone-900/60 hover:bg-stone-800/80 text-white border border-stone-800/50 cursor-pointer transition-all duration-200 z-10 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>

            {/* Main Image */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl bg-stone-900/10">
              <img
                src={activeGalleryRoom.images[activeImageIndex]}
                alt={`${activeGalleryRoom.title} - ${activeImageIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-2xl transition-all duration-300"
              />
            </div>

            {/* Right arrow */}
            <button
              onClick={nextImage}
              className="absolute right-2 md:right-4 p-2 md:p-3 rounded-full bg-stone-900/60 hover:bg-stone-800/80 text-white border border-stone-800/50 cursor-pointer transition-all duration-200 z-10 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Thumbnails list (placed ABOVE caption) */}
          <div className="w-full max-w-3xl flex items-center justify-start md:justify-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar flex-shrink-0 mt-8 mb-4 md:mt-10 md:mb-6">
            {activeGalleryRoom.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`relative w-20 h-14 md:w-24 md:h-18 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                  i === activeImageIndex
                    ? "border-emerald-500 scale-105 shadow-md shadow-emerald-500/20 opacity-100"
                    : "border-stone-800 opacity-40 hover:opacity-100 hover:scale-102"
                }`}
              >
                <img
                  src={src}
                  alt={`preview-${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Info Caption (placed BELOW thumbnails) */}
          <div className="w-full max-w-3xl text-center px-4 flex-shrink-0 mb-4 md:mb-6">
            <h4 className="text-white text-2xl md:text-4xl font-sans tracking-tight mb-2 font-bold">
              {activeGalleryRoom.title}
            </h4>
            <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed line-clamp-3 md:line-clamp-none">
              {activeGalleryRoom.description}
            </p>
            <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full bg-stone-900/80 text-[10px] md:text-xs text-stone-400 border border-stone-800/50 uppercase font-bold tracking-widest">
              Foto {activeImageIndex + 1} di {activeGalleryRoom.images.length}
            </span>
          </div>

        </div>
      )}
    </>
  );
};

