import { useState, useRef, useEffect, useCallback } from 'react';
import { useCartStore } from '../store/cartStore';
import { useLocationStore, RESTAURANT_LAT, RESTAURANT_LNG } from '../store/locationStore';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Loader2 } from 'lucide-react';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';

type SubmitPhase = 'idle' | 'sending' | 'timeout' | 'rejected';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

const QR_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/qr_promptpay.jpg`;

const translations = {
  IT: {
    step1Title: 'I Tuoi Dati',
    namePlaceholder: 'Nome',
    phonePlaceholder: 'Telefono',
    addressPlaceholder: 'Indirizzo di Consegna',
    verifyLoc: 'Verifica Posizione',
    verifyingLoc: 'Verifica in corso...',
    outOfRange: (dist: number, max: number) => `Siamo spiacenti, la tua posizione è a ${dist.toFixed(1)} km. Consegniamo fino a un massimo di ${max} km.`,
    simLoc: 'Simula posizione (Test)',
    continueBtn: 'Continua',
    step2Title: 'Metodo di Pagamento',
    optPromptPay: 'PromptPay (QR Code)',
    optCash: 'Contanti alla consegna',
    uploadBtn: 'Carica screenshot ricevuta',
    submitBtn: 'CONFERMA E INVIA ORDINE',
    uploadPromptBtn: 'CARICA RICEVUTA PER PROCEDERE',
    backBtn: 'Torna indietro',
    successTitle: "LA CUOCA É ALL'OPERA!",
    successDesc: 'Grazie! Il tuo ordine è stato registrato ed è in fase di preparazione. A breve riceverai una chiamata di conferma.',
    closeBtn: 'Chiudi',
    waitText: 'Attendere...',
    confirmMapLoc: 'Conferma Posizione sulla Mappa',
    mapInstructions: 'Trascina il pin rosso sulla tua esatta posizione di consegna',
    locConfirmed: (dist: number) => `Posizione confermata! (Distanza: ${dist.toFixed(1)} km)`,
    detectLocBtn: 'Trova la mia posizione',
    sendingTitle: "Invio ordine in corso...",
    sendingHint: "Attendi la conferma della cucina",
    timeoutTitle: 'La cucina è molto occupata o il tablet dello staff è offline.',
    timeoutHint: 'Il tuo ordine potrebbe comunque essere arrivato. Premi Riprova o contattaci direttamente.',
    retryBtn: 'Riprova l\'invio dell\'ordine',
    emergencyTitle: 'Preferisci contattarci direttamente?',
    trackerPreparing: 'Rimani su questa pagina! Stiamo preparando le tue pizze. Questa schermata si aggiornerà automaticamente non appena il fattorino salirà in motorino.',
    trackerEstimate: (mins: number) => `Tempo stimato di consegna: ~${mins} minuti`,
    trackerDelivering: 'DELIVERY IN ARRIVO!',
  },
  EN: {
    step1Title: 'Your Information',
    namePlaceholder: 'Name',
    phonePlaceholder: 'Phone',
    addressPlaceholder: 'Delivery Address',
    verifyLoc: 'Verify Location',
    verifyingLoc: 'Verifying...',
    outOfRange: (dist: number, max: number) => `We are sorry, your location is ${dist.toFixed(1)} km away. We deliver up to ${max} km max.`,
    simLoc: 'Simulate location (Test)',
    continueBtn: 'Continue',
    step2Title: 'Payment Method',
    optPromptPay: 'PromptPay (QR Code)',
    optCash: 'Cash on delivery',
    uploadBtn: 'Upload receipt screenshot',
    submitBtn: 'CONFIRM AND SEND ORDER',
    uploadPromptBtn: 'UPLOAD RECEIPT TO PROCEED',
    backBtn: 'Go Back',
    successTitle: "Kitchen is at work!",
    successDesc: 'Thank you! Your order has been recorded and is being prepared. You will receive a confirmation call shortly.',
    closeBtn: 'Close',
    waitText: 'Please wait...',
    confirmMapLoc: 'Confirm Location on Map',
    mapInstructions: 'Drag the red pin to your exact delivery location',
    locConfirmed: (dist: number) => `Location confirmed! (Distance: ${dist.toFixed(1)} km)`,
    detectLocBtn: 'Find my location',
    sendingTitle: 'Sending your order...',
    sendingHint: 'Waiting for kitchen confirmation',
    timeoutTitle: 'The kitchen is very busy or the staff tablet is offline.',
    timeoutHint: 'Your order may still have arrived. Press Retry or contact us directly.',
    retryBtn: 'Retry sending the order',
    emergencyTitle: 'Prefer to contact us directly?',
    trackerPreparing: 'Stay on this page! We are preparing your pizzas. This screen will update automatically as soon as the driver gets on the scooter.',
    trackerEstimate: (mins: number) => `Estimated delivery time: ~${mins} minutes`,
    trackerDelivering: 'Delivery is on the way!',
  },
  TH: {
    step1Title: 'ข้อมูลของคุณ',
    namePlaceholder: 'ชื่อ',
    phonePlaceholder: 'เบอร์โทรศัพท์',
    addressPlaceholder: 'ที่อยู่จัดส่ง',
    verifyLoc: 'ตรวจสอบตำแหน่ง',
    verifyingLoc: 'กำลังตรวจสอบ...',
    outOfRange: (dist: number, max: number) => `ขออภัย ตำแหน่งของคุณอยู่ห่างออกไป ${dist.toFixed(1)} กม. เราจัดส่งได้ไม่เกิน ${max} กม.`,
    simLoc: 'จำลองตำแหน่ง (ทดสอบ)',
    continueBtn: 'ดำเนินการต่อ',
    step2Title: 'วิธีการชำระเงิน',
    optPromptPay: 'PromptPay (QR Code)',
    optCash: 'เก็บเงินปลายทาง',
    uploadBtn: 'อัปโหลดภาพหน้าจอใบเสร็จ',
    submitBtn: 'ยืนยันและส่งคำสั่งซื้อ',
    uploadPromptBtn: 'อัปโหลดใบเสร็จเพื่อดำเนินการต่อ',
    backBtn: 'ย้อนกลับ',
    successTitle: 'ส่งคำสั่งซื้อสำเร็จแล้ว!',
    successDesc: 'ขอบคุณ! คำสั่งซื้อของคุณได้รับการบันทึกแล้วและกำลังอยู่ในขั้นตอนการเตรียมการ คุณจะได้รับสายยืนยันในไม่ช้า',
    closeBtn: 'ปิด',
    waitText: 'กรุณารอสักครู่...',
    confirmMapLoc: 'ยืนยันตำแหน่งบนแผนที่',
    mapInstructions: 'ลากหมุดสีแดงไปยังตำแหน่งจัดส่งที่ถูกต้องของคุณ',
    locConfirmed: (dist: number) => `ยืนยันตำแหน่งแล้ว! (ระยะทาง: ${dist.toFixed(1)} กม.)`,
    detectLocBtn: 'ค้นหาตำแหน่งของฉัน',
    sendingTitle: 'กำลังส่งคำสั่งซื้อ...',
    sendingHint: 'รอการยืนยันจากครัว',
    timeoutTitle: 'ครัวยุ่งมากหรือแท็บเล็ตของพนักงานออฟไลน์',
    timeoutHint: 'คำสั่งซื้อของคุณอาจส่งถึงแล้ว กด ลองใหม่ หรือติดต่อเราโดยตรง',
    retryBtn: 'ลองส่งคำสั่งซื้ออีกครั้ง',
    emergencyTitle: 'ต้องการติดต่อเราโดยตรง?',
    trackerPreparing: 'โปรดเปิดหน้านี้ค้างไว้! เรากำลังเตรียมพิซซ่าของคุณ หน้าจอนี้จะอัปเดตโดยอัตโนมัติทันทีที่พนักงานขับรถมอเตอร์ไซค์ออกเดินทาง',
    trackerEstimate: (mins: number) => `เวลาจัดส่งโดยประมาณ: ~${mins} นาที`,
    trackerDelivering: 'พนักงานจัดส่งออกเดินทางแล้ว! พิซซ่าของคุณกำลังเดินทางไปส่ง',
  },
  DE: {
    step1Title: 'Ihre Daten',
    namePlaceholder: 'Name',
    phonePlaceholder: 'Telefon',
    addressPlaceholder: 'Lieferadresse',
    verifyLoc: 'Standort verifizieren',
    verifyingLoc: 'Überprüfung...',
    outOfRange: (dist: number, max: number) => `Es tut uns leid, Ihr Standort ist ${dist.toFixed(1)} km entfernt. Wir liefern bis maximal ${max} km.`,
    simLoc: 'Standort simulieren (Test)',
    continueBtn: 'Weiter',
    step2Title: 'Zahlungsmethode',
    optPromptPay: 'PromptPay (QR-Code)',
    optCash: 'Barzahlung bei Lieferung',
    uploadBtn: 'Quittungs-Screenshot hochladen',
    submitBtn: 'BESTÄTIGEN UND SENDEN',
    uploadPromptBtn: 'QUITTUNG HOCHLADEN',
    backBtn: 'Zurück',
    successTitle: 'Bestellung erfolgreich gesendet!',
    successDesc: 'Vielen Dank! Ihre Bestellung wurde registriert und wird vorbereitet. Sie erhalten in Kürze einen Bestätigungsanruf.',
    closeBtn: 'Schließen',
    waitText: 'Bitte warten...',
    confirmMapLoc: 'Standort auf Karte bestätigen',
    mapInstructions: 'Ziehen Sie die rote Nadel auf Ihren genauen Lieferort',
    locConfirmed: (dist: number) => `Standort bestätigt! (Entfernung: ${dist.toFixed(1)} km)`,
    detectLocBtn: 'Meinen Standort finden',
    sendingTitle: 'Bestellung wird gesendet...',
    sendingHint: 'Warte auf Küchenbestätigung',
    timeoutTitle: 'Die Küche ist sehr beschäftigt oder das Tablet ist offline.',
    timeoutHint: 'Ihre Bestellung ist möglicherweise trotzdem angekommen. Erneut versuchen oder uns direkt kontaktieren.',
    retryBtn: 'Bestellung erneut senden',
    emergencyTitle: 'Möchten Sie uns direkt kontaktieren?',
    trackerPreparing: 'Bleiben Sie auf dieser Seite! Wir bereiten Ihre Pizzen vor. Dieser Bildschirm wird automatisch aktualisiert, sobald sich der Fahrer auf den Roller setzt.',
    trackerEstimate: (mins: number) => `Geschätzte Lieferzeit: ~${mins} Minuten`,
    trackerDelivering: 'Der Fahrer ist losgefahren! Ihre Pizza ist auf dem Weg.',
  },
};

// React component to dynamically center and zoom the Google Map
function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(15); // Forced zoom=15 as requested for Bang Rin, Ranong
    }
  }, [center.lat, center.lng, map]);
  return null;
}

// React component to draw a 5 km circle around the restaurant
function MapCircle({ center, radius }: { center: { lat: number; lng: number }; radius: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const circle = new google.maps.Circle({
      map,
      center,
      radius,
      fillColor: '#8B1E1E',
      fillOpacity: 0.08,
      strokeColor: '#8B1E1E',
      strokeOpacity: 0.5,
      strokeWeight: 1.5
    });
    return () => {
      circle.setMap(null);
    };
  }, [map, center, radius]);
  return null;
}

// Helper to format and clean Google address data
const formatGoogleAddress = (result: google.maps.GeocoderResult, lang: string): string => {
  if (!result || !result.address_components) return '';
  const addressComponents = result.address_components;

  let placeName = '';
  // Search for lodging / POIs to put in evidence
  const POIComponent = addressComponents.find(c =>
    c.types.includes('establishment') || 
    c.types.includes('point_of_interest') || 
    c.types.includes('lodging') || 
    c.types.includes('premise')
  );
  if (POIComponent) {
    placeName = POIComponent.long_name;
  }

  const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
  const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
  const subLocality = addressComponents.find(c => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'))?.long_name || '';
  const locality = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
  const province = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';

  const roadDetails = [streetNumber, route].filter(Boolean).join(' ');
  const localDetails = [subLocality, locality, province].filter(Boolean).join(', ');

  let rawAddress = '';
  if (placeName) {
    rawAddress = `${placeName.toUpperCase()}`;
    const details = [roadDetails, localDetails].filter(Boolean).join(', ');
    if (details) {
      rawAddress += ` - ${details}`;
    }
  } else {
    rawAddress = result.formatted_address || [roadDetails, localDetails].filter(Boolean).join(', ');
  }

  // Clean Thai characters and orphan punctuation/parentheses/spaces
  let cleaned = rawAddress.replace(/[\u0e00-\u0e7f]+/g, '');
  cleaned = cleaned.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/,\s*,/g, ',');
  cleaned = cleaned.replace(/-\s*-/g, '-');
  cleaned = cleaned.replace(/^\s*[.,\-\s]+/g, '');
  cleaned = cleaned.replace(/[.,\-\s]+\s*$/g, '');

  return cleaned.trim();
};

export default function CheckoutFlow({ onClose, onSuccess, lang }: Props) {
  const { items, getTotal, clearCart } = useCartStore();
  const {
    requestLocation,
    setConfirmedLocation,
    setSimulatedLocation,
    isLoading: locationLoading,
    distanceKm,
    maxRadiusKm,
    isDeliverable,
    error: locationError,
  } = useLocationStore();

  const total = getTotal();
  const deliveryFee = total >= 200 ? 0 : 30;
  const finalTotal = total + deliveryFee;
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsAppActive, setWhatsAppActive] = useState(false);
  const [lineActive, setLineActive] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>({ lat: RESTAURANT_LAT, lng: RESTAURANT_LNG });
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  // Advanced browser autofill prevention states and hooks
  const [addressFieldId] = useState(() => 'addr-' + Math.random().toString(36).substring(2, 9));
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);

  // Timeout / retry overlay states
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [countdownSeconds, setCountdownSeconds] = useState(300);
  // Tracks the ID of the order currently waiting for confirmation
  const currentOrderIdRef = useRef<string | null>(null);

  const [isDeliveringActive, setIsDeliveringActive] = useState(false);

  // Travel time in minutes based on distance (minimum delivery time is always at least 10 minutes)
  const travelMins = Math.max(10, Math.round((distanceKm || 0) * 3.5));

  // Unified timer hook that manages Banner 3 (5m), Banner 4 (15m), and Banner 5 (travelMins) countdowns
  useEffect(() => {
    let initial = 300;
    if (submitPhase === 'sending') {
      initial = 300; // 5 minutes for Banner 3
    } else if (submitPhase === 'idle' && step === 3) {
      if (!isDeliveringActive) {
        initial = 1500; // 25 minutes for Banner 4
      } else {
        initial = travelMins * 60; // Travel time in seconds for Banner 5
      }
    }
    setCountdownSeconds(initial);

    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          if (submitPhase === 'sending') {
            setSubmitPhase('timeout');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitPhase, step, isDeliveringActive, travelMins]);

  const formatMMSS = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerRatio = () => {
    if (submitPhase === 'sending') {
      return countdownSeconds / 300;
    } else if (submitPhase === 'idle' && step === 3) {
      if (!isDeliveringActive) {
        return countdownSeconds / 1500;
      } else {
        return countdownSeconds / (travelMins * 60);
      }
    }
    return 1;
  };

  // Stable BroadcastChannel listener — lives for the entire lifetime of the modal.
  // Handles ORDER_ACCEPTED, ORDER_REJECTED, and ORDER_DELIVERING messages.
  useEffect(() => {
    let channel1: BroadcastChannel | null = null;
    let channel2: BroadcastChannel | null = null;

    const handleMessage = (event: MessageEvent) => {
      try {
        const { type, orderId } = event.data || {};
        // Only react to messages that match the order we submitted
        if (orderId && currentOrderIdRef.current && String(orderId) !== String(currentOrderIdRef.current)) return;

        if (type === 'ORDER_ACCEPTED') {
          setSubmitPhase('idle');
          setLoading(false);
          setStep(3);
          setIsDeliveringActive(false);
        } else if (type === 'ORDER_REJECTED') {
          currentOrderIdRef.current = null;
          setLoading(false);
          setSubmitPhase('rejected');
        } else if (type === 'ORDER_DELIVERING') {
          setSubmitPhase('idle');
          setLoading(false);
          setStep(3);
          setIsDeliveringActive(true);
        }
      } catch (e) {
        console.warn('BroadcastChannel message parse error:', e);
      }
    };

    try {
      channel1 = new BroadcastChannel('flower_power_orders_channel');
      channel1.onmessage = handleMessage;
    } catch (e) {
      console.warn('flower_power_orders_channel not available:', e);
    }

    try {
      channel2 = new BroadcastChannel('pizza_orders_channel');
      channel2.onmessage = handleMessage;
    } catch (e) {
      console.warn('pizza_orders_channel not available:', e);
    }

    return () => {
      try { channel1?.close(); } catch (_) {}
      try { channel2?.close(); } catch (_) {}
    };
  }, []);

  // Poll order status from Supabase to handle cross-device/server-side status updates (e.g. from Telegram webhook)
  useEffect(() => {
    if (!currentOrderIdRef.current) return;

    const interval = setInterval(async () => {
      const orderId = currentOrderIdRef.current;
      if (!orderId) return;

      try {
        const { data, error } = await supabase
          .from('pizza_orders')
          .select('status')
          .eq('id', orderId)
          .single();

        if (error) {
          console.warn('[CheckoutFlow Polling] Error fetching order status:', error);
          return;
        }

        if (data) {
          const status = data.status;
          console.log(`[CheckoutFlow Polling] Order status check: ${status} for ID: ${orderId}`);

          if (status === 'preparing' && (submitPhase === 'sending' || step !== 3)) {
            setSubmitPhase('idle');
            setLoading(false);
            setStep(3);
            setIsDeliveringActive(false);

            try {
              const ch = new BroadcastChannel('pizza_orders_channel');
              ch.postMessage({ type: 'ORDER_ACCEPTED', orderId });
              ch.close();
            } catch (e) {}
            try {
              const ch = new BroadcastChannel('flower_power_orders_channel');
              ch.postMessage({ type: 'ORDER_ACCEPTED', orderId });
              ch.close();
            } catch (e) {}
          } else if (status === 'delivering' && !isDeliveringActive) {
            setIsDeliveringActive(true);
            setSubmitPhase('idle');
            setLoading(false);
            setStep(3);

            try {
              const ch = new BroadcastChannel('pizza_orders_channel');
              ch.postMessage({ type: 'ORDER_DELIVERING', orderId });
              ch.close();
            } catch (e) {}
            try {
              const ch = new BroadcastChannel('flower_power_orders_channel');
              ch.postMessage({ type: 'ORDER_DELIVERING', orderId });
              ch.close();
            } catch (e) {}
          } else if (status === 'rejected' && submitPhase !== 'rejected') {
            currentOrderIdRef.current = null;
            setLoading(false);
            setSubmitPhase('rejected');

            try {
              const ch = new BroadcastChannel('pizza_orders_channel');
              ch.postMessage({ type: 'ORDER_REJECTED', orderId });
              ch.close();
            } catch (e) {}
            try {
              const ch = new BroadcastChannel('flower_power_orders_channel');
              ch.postMessage({ type: 'ORDER_REJECTED', orderId });
              ch.close();
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('[CheckoutFlow Polling] Crash during status check:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [submitPhase, step, isDeliveringActive]);

  useEffect(() => {
    if (isEditingAddress && addressInputRef.current) {
      addressInputRef.current.focus();
      const timer = setTimeout(() => {
        setIsReadOnly(false);
      }, 60);
      return () => clearTimeout(timer);
    } else {
      setIsReadOnly(true);
    }
  }, [isEditingAddress]);

  const outOfRange = distanceKm !== null && !isDeliverable;
  const t = translations[lang];

  // Geocoding helper with strict language rules and clean text processing
  const fetchReverseGeocoding = async (lat: number, lng: number) => {
    const targetLang = lang === 'TH' ? 'th' : 'en';
    try {
      if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps API not loaded yet for geocoding.');
        return;
      }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng }, language: targetLang },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const formatted = formatGoogleAddress(results[0], lang);
            setAddress(formatted);
          } else {
            console.error('Google Geocoding failed with status:', status);
          }
        }
      );
    } catch (err) {
      console.error('Google Maps Geocoding error:', err);
    }
  };

  const detectUserGPS = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPos({ lat: latitude, lng: longitude });
        setIsLocationConfirmed(false);
        // Clear confirmed state
        useLocationStore.setState({ distanceKm: null, userLat: null, userLng: null });
        await fetchReverseGeocoding(latitude, longitude);
      },
      () => {
        // Geolocation failed or denied, keep default restaurant center
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Trigger GPS detection when Step 1 is active
  useEffect(() => {
    if (step === 1) {
      detectUserGPS();
    }
  }, [step]);

  const doSubmit = useCallback(async () => {
    setIsDeliveringActive(false);
    setSubmitPhase('sending');
    setLoading(true);

    try {
      let receiptUrl: string | null = null;

      if (paymentMethod === 'promptpay' && receiptFile) {
        const safeName = receiptFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${Date.now()}-${safeName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(uploadData.path);

        receiptUrl = urlData.publicUrl;
      }

      // Serialize coordinates into the address string as a fallback for the admin panel
      const finalAddress = markerPos
        ? `${address || 'Nessun indirizzo'} [COORD: ${markerPos.lat},${markerPos.lng}]`
        : (address || 'Nessun indirizzo');

      const orderData: Record<string, unknown> = {
        customer_name: name || 'Cliente',
        phone: phone || '0000000000',
        address: finalAddress,
        items,
        total: finalTotal,
        status: 'new',
        payment_method: paymentMethod,
        receipt_url: receiptUrl,
        latitude: markerPos ? markerPos.lat : null,
        longitude: markerPos ? markerPos.lng : null,
        has_whatsapp: whatsAppActive,
        has_line: lineActive
      };

      const { data: insertedRows, error } = await supabase
        .from('pizza_orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('Database insert error:', error.message, error.details || '');
        if (import.meta.env.DEV) {
          console.warn('DEV MODE: Simulating order — overlay stays open waiting for Dashboard.');
          const simulatedInserted = {
            id: 'ord-simulated-' + Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            ...orderData
          } as any;

          // Register the order ID so the stable listener can match it
          currentOrderIdRef.current = simulatedInserted.id;

          try {
            const { useAdminOrderStore } = await import('../../admin/store/adminOrderStore');
            useAdminOrderStore.getState().addOrder(simulatedInserted);
          } catch (e) {
            console.warn('Admin store not loaded yet:', e);
          }

          try {
            const channel = new BroadcastChannel('flower_power_orders_channel');
            channel.postMessage({ type: 'NEW_ORDER', order: simulatedInserted });
            channel.close();
          } catch (e) {
            console.warn('BroadcastChannel error:', e);
          }
        } else {
          throw error;
        }
      } else if (insertedRows && insertedRows[0]) {
        // Register the real DB order ID so the stable listener can match it
        currentOrderIdRef.current = String(insertedRows[0].id);

        try {
          const { useAdminOrderStore } = await import('../../admin/store/adminOrderStore');
          useAdminOrderStore.getState().addOrder(insertedRows[0]);
        } catch (e) {
          console.warn('Admin store not loaded yet:', e);
        }

        try {
          const channel = new BroadcastChannel('flower_power_orders_channel');
          channel.postMessage({ type: 'NEW_ORDER', order: insertedRows[0] });
          channel.close();
        } catch (e) {
          console.warn('BroadcastChannel error:', e);
        }

        // Trigger Telegram notification asynchronously (failsafe)
        try {
          fetch('/api/telegram-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: insertedRows[0].id })
          }).catch(e => console.error('Telegram notify fetch failed:', e));
        } catch (e) {
          console.warn('Failed triggering Telegram notify call:', e);
        }
      }
    } catch (err) {
      console.error('Checkout submission crash caught:', err);
      currentOrderIdRef.current = null;
      setLoading(false);
      // Show timeout/failure UI with retry button — never silently bypass in any mode
      setSubmitPhase('timeout');
    }
  }, [paymentMethod, receiptFile, address, markerPos, name, phone, items, finalTotal, whatsAppActive, lineActive]);

  const handleSubmit = () => {
    doSubmit();
  };

  const renderCountdownCircle = (totalSeconds: number, strokeColor: string = "#8B1E1E") => {
    const formatted = formatMMSS(countdownSeconds);
    return (
      <div className="relative w-24 h-24 mx-auto flex-shrink-0 flex items-center justify-center">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="42" fill="none" stroke="#f5f5f4" strokeWidth="6" />
          <circle
            cx="48" cy="48" r="42" fill="none"
            stroke={strokeColor} strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - getTimerRatio())}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-stone-850 tabular-nums">{formatted}</span>
        </div>
      </div>
    );
  };

  const renderSupportSection = () => (
    <div className="w-full border-t border-stone-100 pt-4 space-y-2 flex-shrink-0">
      <p className="text-stone-500 text-[10px] font-semibold text-center leading-relaxed">
        Non esitare a contattarci per qualunque informazione o modifica all'ordine
      </p>
      <p className="text-[#8B1E1E] font-black text-center text-sm tracking-wider">
        0949.800.200
      </p>
      <div className="flex gap-4 justify-center w-full max-w-xs mx-auto pt-1">
        <a
          href="https://wa.me/66949800200"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer shadow-md"
        >
          <svg viewBox="0 0 175.216 175.552" className="w-3 h-3"><path fill="white" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13-.006 10.765 2.816 21.269 8.17 30.517l-8.65 31.59 32.258-8.465c8.896 4.856 18.939 7.408 29.128 7.412h.026c33.73 0 61.162-27.423 61.174-61.13.006-16.347-6.354-31.721-17.895-43.273-11.541-11.552-26.91-17.923-43.033-17.781z"/></svg>
          WhatsApp
        </a>
        <a
          href="https://line.me/ti/p/fdvhy-V1dH"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer shadow-md"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3"><rect width="24" height="24" rx="4" fill="transparent"/><path fill="white" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629z"/></svg>
          LINE
        </a>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md h-[600px] p-5 border border-stone-300 text-stone-850 relative rounded-[2rem] shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Flower Power Pizza Logo at the top of all states */}
        <div className="flex justify-center w-full border-b border-stone-100 pb-3 flex-shrink-0">
          <img
            src="/Flower_Power_Pizza_-_HotSpring.png"
            alt="Flower Power Pizza Logo"
            className="h-11 w-auto object-contain"
          />
        </div>

        {/* X Close Button: only shown on Step 1, Step 2 (when idle), and Step 3 (when delivering is active) */}
        {!(step === 3 && !isDeliveringActive) && submitPhase === 'idle' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-850 hover:bg-stone-100 transition-all cursor-pointer z-20"
          >
            <X size={18} />
          </button>
        )}

        {submitPhase === 'idle' && step === 1 && (
          <div className="flex-grow flex flex-col justify-between overflow-y-auto mt-2.5 space-y-3">
            <div className="space-y-2.5 px-0.5">
              <h2 className="text-lg font-black tracking-tight text-stone-850" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {t.step1Title}
              </h2>
              
              <input
                className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-inset focus:ring-[#8B1E1E] transition-all text-xs"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={e => setName(e.target.value)}
              />
              
              <input
                className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-inset focus:ring-[#8B1E1E] transition-all text-xs"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />

              <div className="flex gap-4 px-1 py-1">
                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsAppActive}
                    onChange={(e) => setWhatsAppActive(e.target.checked)}
                    className="accent-[#8B1E1E]"
                  />
                  WhatsApp
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lineActive}
                    onChange={(e) => setLineActive(e.target.checked)}
                    className="accent-[#8B1E1E]"
                  />
                  LINE
                </label>
              </div>

              {isEditingAddress ? (
                <textarea
                  ref={addressInputRef}
                  className="w-full bg-stone-50 border border-[#8B1E1E] p-2 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#8B1E1E] transition-all text-xs h-14 resize-none"
                  placeholder={t.addressPlaceholder}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  onBlur={() => setIsEditingAddress(false)}
                  readOnly={isReadOnly}
                  autoComplete="new-password"
                  name={addressFieldId}
                  id={addressFieldId}
                />
              ) : (
                <div
                  onClick={() => setIsEditingAddress(true)}
                  className="w-full bg-stone-50 border border-stone-300 p-2 rounded-xl text-stone-800 text-xs h-14 overflow-y-auto cursor-pointer select-none flex items-start"
                >
                  {address ? (
                    <span className="text-stone-800 break-words w-full leading-normal">{address}</span>
                  ) : (
                    <span className="text-stone-400 w-full">{t.addressPlaceholder}</span>
                  )}
                </div>
              )}

              {/* Map Area */}
              <div className="space-y-1">
                <p className="text-[9px] text-stone-500 font-bold uppercase tracking-wider pl-1">{t.mapInstructions}</p>
                <div className="relative w-full h-[130px] rounded-xl border border-stone-300 overflow-hidden bg-stone-100">
                  <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <Map
                      defaultCenter={{ lat: RESTAURANT_LAT, lng: RESTAURANT_LNG }}
                      defaultZoom={15}
                      disableDefaultUI={true}
                      gestureHandling="cooperative"
                      style={{ height: '100%', width: '100%' }}
                    >
                      <MapController center={markerPos} />
                      <MapCircle center={{ lat: RESTAURANT_LAT, lng: RESTAURANT_LNG }} radius={maxRadiusKm * 1000} />
                      
                      <Marker
                        position={{ lat: RESTAURANT_LAT, lng: RESTAURANT_LNG + 0.00005 }}
                        icon={{
                          url: '/Flower_Power_Pizza_-_HotSpring.png',
                          scaledSize: (typeof google !== 'undefined' && google.maps && google.maps.Size) ? new google.maps.Size(32, 32) : undefined
                        }}
                      />

                      <Marker
                        position={{ lat: markerPos.lat, lng: markerPos.lng }}
                        draggable={true}
                        onDragEnd={async (e) => {
                          if (e.latLng) {
                            const lat = e.latLng.lat();
                            const lng = e.latLng.lng();
                            setMarkerPos({ lat, lng });
                            setIsLocationConfirmed(false);
                            useLocationStore.setState({ distanceKm: null, userLat: null, userLng: null });
                            await fetchReverseGeocoding(lat, lng);
                          }
                        }}
                      />
                    </Map>
                  </APIProvider>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Vuoi impostare la posizione del Pin Rosso come sede ufficiale della pizzeria?")) {
                        localStorage.setItem('pizza_restaurant_lat', markerPos.lat.toString());
                        localStorage.setItem('pizza_restaurant_lng', markerPos.lng.toString());
                        alert("Sede salvata con successo! Ricarica per applicare.");
                        window.location.reload();
                      }
                    }}
                    className="absolute top-2 left-2 z-[400] bg-white hover:bg-stone-50 text-[#8B1E1E] px-2 py-1 text-[8px] font-black rounded-lg border border-stone-300 shadow-md flex items-center justify-center transition-all cursor-pointer"
                    title="Imposta come sede ufficiale pizzeria"
                  >
                    Imposta Sede
                  </button>

                  <button
                    type="button"
                    onClick={detectUserGPS}
                    className="absolute bottom-2 right-2 z-[400] bg-white hover:bg-stone-55 text-stone-700 p-1.5 rounded-lg border border-stone-300 shadow-md flex items-center justify-center transition-all cursor-pointer"
                    title={t.detectLocBtn}
                  >
                    <MapPin size={12} className="text-[#8B1E1E]" />
                  </button>
                </div>
              </div>

              {/* Map confirmation button */}
              <button
                type="button"
                onClick={() => {
                  setConfirmedLocation(markerPos.lat, markerPos.lng);
                  setIsLocationConfirmed(true);
                }}
                className={`w-full py-2 text-[9px] tracking-wider uppercase font-extrabold transition-all rounded-full border cursor-pointer ${
                  isLocationConfirmed && distanceKm !== null && isDeliverable
                    ? 'bg-stone-100 border-stone-300 text-stone-500'
                    : 'bg-stone-900 border-stone-900 text-white hover:bg-stone-850'
                }`}
              >
                {t.confirmMapLoc}
              </button>

              {/* Location status / error messages */}
              {locationError && !distanceKm && (
                <p className="text-amber-600 text-[9px] text-center font-bold">{locationError}</p>
              )}

              {distanceKm !== null && isDeliverable && (
                <p className="text-green-800 text-[9px] text-center font-bold bg-green-50/50 p-1.5 rounded-xl border border-green-200/60">
                  {t.locConfirmed(distanceKm)}
                </p>
              )}

              {outOfRange && (
                <div className="bg-red-50/50 p-2 rounded-xl border border-red-200/60 text-center">
                  <p className="text-[#8B1E1E] text-[9px] leading-relaxed font-bold">
                    {t.outOfRange(distanceKm!, maxRadiusKm)}
                  </p>
                  <button
                    onClick={setSimulatedLocation}
                    className="text-[8px] text-red-800 font-extrabold underline mt-1 block mx-auto cursor-pointer"
                  >
                    {t.simLoc}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={distanceKm === null || outOfRange || !name || !phone || !address}
              className="w-full bg-[#8B1E1E] hover:bg-[#721818] text-white p-2.5 rounded-full font-bold transition-all disabled:bg-stone-100 disabled:text-stone-400 disabled:shadow-none shadow-sm hover:shadow-md cursor-pointer duration-200 transform active:scale-95 text-[9px] tracking-wider uppercase flex-shrink-0"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t.continueBtn}
            </button>
          </div>
        )}

        {submitPhase === 'idle' && step === 2 && (
          <div className="flex-grow flex flex-col justify-between overflow-hidden mt-2.5 space-y-2.5">
            <div className="space-y-3 px-0.5">
              <h2 className="text-lg font-black tracking-tight text-stone-850" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {t.step2Title}
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'promptpay'
                      ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 text-[#8B1E1E] ring-2 ring-inset ring-[#8B1E1E]/20'
                      : 'border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100/50'
                  }`}
                >
                  <span className="font-bold text-xs uppercase tracking-wider">{t.optPromptPay}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'cash'
                      ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 text-[#8B1E1E] ring-2 ring-inset ring-[#8B1E1E]/20'
                      : 'border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100/50'
                  }`}
                >
                  <span className="font-bold text-xs uppercase tracking-wider">{t.optCash}</span>
                </button>
              </div>

              {paymentMethod === 'promptpay' ? (
                /* ── BANNER 1: SCELTA METODO DI PAGAMENTO (PROMPTPAY) ── */
                <div className="space-y-2.5 pt-0.5 animate-fadeIn flex flex-col items-center">
                  <div className="bg-white border border-stone-200 p-1.5 rounded-xl shadow-sm max-w-[115px] mx-auto">
                    <img src={QR_URL} alt="QR PromptPay" className="w-full h-auto object-contain" />
                  </div>

                  <div className="text-center space-y-0.5 shrink-0">
                    <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Importo da pagare</p>
                    <p className="text-base font-black text-[#8B1E1E] tracking-tight">{finalTotal} ฿</p>
                    {deliveryFee > 0 ? (
                      <p className="text-[8px] text-stone-400 font-medium">(inclusi {deliveryFee} ฿ di consegna)</p>
                    ) : (
                      <p className="text-[9.5px] font-extrabold text-emerald-600 uppercase tracking-wider">
                        {lang === 'IT' && 'Consegna GRATIS'}
                        {lang === 'EN' && 'FREE Delivery'}
                        {lang === 'TH' && 'ฟรีค่าจัดส่ง'}
                        {lang === 'DE' && 'Gratis-Lieferung'}
                      </p>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-xs border border-dashed border-stone-300 p-1.5 text-[10px] text-stone-550 font-bold rounded-xl hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-colors cursor-pointer bg-stone-50/50"
                  >
                    {receiptFile ? receiptFile.name : t.uploadBtn}
                  </button>
                </div>
              ) : (
                /* ── BANNER 2: SCELTA METODO DI PAGAMENTO (CONTANTI) ── */
                <div className="py-6 text-center animate-fadeIn space-y-3">
                  <p className="text-stone-600 text-xs leading-relaxed max-w-xs mx-auto font-medium">
                    Il pagamento verrà effettuato in contanti al momento della consegna del tuo ordine.
                  </p>
                  <div className="text-center space-y-0.5 shrink-0">
                    <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Importo da pagare alla consegna</p>
                    <p className="text-base font-black text-stone-850 tracking-tight">{finalTotal} ฿</p>
                    {deliveryFee > 0 ? (
                      <p className="text-[8px] text-stone-400 font-medium">(inclusi {deliveryFee} ฿ di consegna)</p>
                    ) : (
                      <p className="text-[9.5px] font-extrabold text-emerald-600 uppercase tracking-wider">
                        {lang === 'IT' && 'Consegna GRATIS'}
                        {lang === 'EN' && 'FREE Delivery'}
                        {lang === 'TH' && 'ฟรีค่าจัดส่ง'}
                        {lang === 'DE' && 'Gratis-Lieferung'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 flex-shrink-0">
              <button
                onClick={handleSubmit}
                disabled={loading || (paymentMethod === 'promptpay' && !receiptFile)}
                className={`w-full p-3 font-bold rounded-full text-[10px] tracking-wider uppercase transition-all duration-200 transform active:scale-95 shadow-md ${
                  paymentMethod === 'promptpay' && !receiptFile
                    ? 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed'
                    : 'bg-[#8B1E1E] hover:bg-[#721818] text-white hover:shadow-lg cursor-pointer'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {loading
                  ? t.waitText
                  : paymentMethod === 'promptpay' && !receiptFile
                    ? t.uploadPromptBtn
                    : t.submitBtn}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-stone-100 hover:bg-stone-200 p-2 text-[10px] text-stone-500 font-semibold rounded-full cursor-pointer transition-all"
              >
                {t.backBtn}
              </button>
            </div>
          </div>
        )}

        {/* ── BANNER 3: ATTESA CONFERMA CUCINA (5 MINUTI - FORMATO MM:SS) ── */}
        {submitPhase === 'sending' && (
          <div className="flex-grow flex flex-col justify-between overflow-hidden mt-4 space-y-4">
            <div className="text-center py-2 space-y-4">
              {renderCountdownCircle(300)}
              
              <div className="space-y-1">
                <p className="text-stone-850 font-bold text-sm">
                  {t.sendingTitle}
                </p>
                <p className="text-stone-500 text-xs leading-relaxed">{t.sendingHint}</p>
              </div>
            </div>

            {renderSupportSection()}
          </div>
        )}

        {/* Rejection State View */}
        {submitPhase === 'rejected' && (
          <div className="flex-grow flex flex-col justify-between overflow-hidden mt-4 space-y-4">
            <div className="text-center py-4 space-y-4">
              <h3 className="text-lg font-bold text-stone-850" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Siamo spiacenti!</h3>
              <p className="text-stone-600 text-xs leading-relaxed px-4 max-w-xs mx-auto">
                La cucina è al completo o temporaneamente impossibilitata a prendere in carico l'ordine.
                Ti invitiamo a contattarci direttamente per qualsiasi esigenza.
              </p>
            </div>

            <div className="space-y-3">
              {renderSupportSection()}
              
              <button
                onClick={() => { setSubmitPhase('idle'); setLoading(false); }}
                className="w-full bg-stone-100 hover:bg-stone-200 p-2 text-xs text-stone-500 font-semibold rounded-full cursor-pointer transition-all"
              >
                Torna al modulo
              </button>
            </div>
          </div>
        )}

        {/* Timeout State View */}
        {submitPhase === 'timeout' && (
          <div className="flex-grow flex flex-col justify-between overflow-hidden mt-4 space-y-4">
            <div className="text-center py-4 space-y-4">
              <h3 className="text-sm font-bold text-stone-850 leading-snug">{t.timeoutTitle}</h3>
              <p className="text-stone-500 text-xs leading-relaxed px-4">{t.timeoutHint}</p>
            </div>

            <div className="space-y-3">
              {renderSupportSection()}

              <button
                onClick={() => {
                  setSubmitPhase('idle');
                  setLoading(false);
                  setTimeout(() => doSubmit(), 50);
                }}
                className="w-full bg-[#8B1E1E] hover:bg-[#721818] text-white font-bold py-2.5 rounded-full text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md"
              >
                {t.retryBtn}
              </button>
            </div>
          </div>
        )}

        {/* ── BANNER 4: PREPARAZIONE IN CORSO (LA CUOKA È ALL'OPERA! 15 MINUTI) ── */}
        {submitPhase === 'idle' && step === 3 && !isDeliveringActive && (
          <div className="flex-grow flex flex-col justify-between overflow-hidden mt-4 space-y-4">
            <div className="text-center space-y-4 py-1">
              <h2 className="text-base font-black text-[#8B1E1E] tracking-tight uppercase" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {t.successTitle}
              </h2>
              
              <p className="text-stone-700 text-xs leading-relaxed px-4 mx-auto">
                Stiamo preparando il tuo ordine con cura, al momento. Resta su questa pagina: ti avviseremo automaticamente non appena il tuo ordine lascerà il nostro ristorante per la consegna.
              </p>

              {renderCountdownCircle(1500)}
            </div>

            {renderSupportSection()}
          </div>
        )}

        {/* ── BANNER 5: DELIVERY IN VIAGGIO (MOTORINO PARTITO) ── */}
        {submitPhase === 'idle' && step === 3 && isDeliveringActive && (
          <div className="flex-grow flex flex-col justify-between overflow-hidden mt-4 space-y-4">
            <div className="text-center space-y-4 py-1">
              <h2 className="text-lg font-black text-emerald-600 tracking-tight uppercase" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {t.trackerDelivering}
              </h2>
              
              <p className="text-stone-700 text-xs leading-relaxed px-4 mx-auto font-semibold">
                Distanza dalla pizzeria: {(distanceKm || 0).toFixed(1)} km — Tempo stimato di viaggio: ~{travelMins} minuti
              </p>

              {renderCountdownCircle(travelMins * 60, "#059669")}
            </div>

            <div className="space-y-3">
              {renderSupportSection()}

              <button
                onClick={() => { clearCart(); onSuccess(); }}
                className="bg-[#8B1E1E] hover:bg-[#721818] text-white p-2.5 w-full rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-95 text-xs tracking-wider uppercase cursor-pointer flex-shrink-0"
              >
                {t.closeBtn.toUpperCase()}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
