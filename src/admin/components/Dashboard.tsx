import { useEffect, useState, useRef } from 'react';
import { useAdminOrderStore } from '../store/adminOrderStore';
import { supabase } from '../../lib/supabase';
import { RESTAURANT_LAT, RESTAURANT_LNG } from '../../pizza/store/locationStore';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import type { PizzaOrder, CartItemSaved } from '../../pizza/types';
import { 
  Clock, 
  Phone, 
  MapPin, 
  RefreshCw, 
  LogOut, 
  ExternalLink, 
  Loader2, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Send,
  CheckCircle,
  Pizza,
  Users,
  X,
  Calendar
} from 'lucide-react';

// Helper to extract coordinates and clean address string
const parseAddressAndCoords = (addressStr: string) => {
  if (!addressStr || typeof addressStr !== 'string') {
    return { address: 'Nessun indirizzo', lat: RESTAURANT_LAT, lng: RESTAURANT_LNG, hasCoords: false };
  }
  
  try {
    const coordMatch = addressStr.match(/\[COORD:\s*([^,]+),\s*([^\]]+)\]/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      const cleanAddress = addressStr.replace(/\[COORD:\s*[^\]]+\]/, '').trim();
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { address: cleanAddress, lat, lng, hasCoords: true };
      }
    }
  } catch (e) {
    console.error('Error parsing coordinates from address:', e);
  }
  return { address: addressStr, lat: RESTAURANT_LAT, lng: RESTAURANT_LNG, hasCoords: false };
};

// Share preformatted text for driver delivery details
const getDriverMessageEncoded = (order: PizzaOrder, lat: number, lng: number) => {
  const items = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
  const itemsText = items
    .map(item => `• ${item.quantity}x ${item.name}${item.selectedVariant ? ` (${item.selectedVariant})` : ''}${Array.isArray(item.selectedExtras) && item.selectedExtras.length ? ` [+ ${item.selectedExtras.map(e => e.name).join(', ')}]` : ''}`)
    .join('\n');
  
  const { address } = parseAddressAndCoords(order.address);
  const timeStr = order.created_at ? new Date(order.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
  const orderId = order.id ? String(order.id).substring(0, 8).toUpperCase() : 'N/A';
  
  const text = `🛵 *CONSEGNA ORDINE FLOWER POWER*\n` +
               `-------------------------------\n` +
               `📌 *ID Ordine*: #${orderId}\n` +
               `🕒 *Orario*: ${timeStr}\n` +
               `👤 *Cliente*: ${order.customer_name}\n` +
               `📞 *Telefono*: ${order.phone}\n` +
               `🏠 *Indirizzo*: ${address}\n` +
               `-------------------------------\n` +
               `🍕 *Dettaglio Pizze*:\n${itemsText}\n` +
               `-------------------------------\n` +
               `🗺️ *Navigatore*: https://www.google.com/maps?q=${lat},${lng}`;
  
  return encodeURIComponent(text);
};

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { orders, loading, fetchOrders, updateOrderStatus } = useAdminOrderStore();
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string; phone: string; address: string; date: string; itemsText?: string; total?: number }>>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showExportModal, setShowExportModal] = useState(false);
  const [dateRangeType, setDateRangeType] = useState('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportLoading, setExportLoading] = useState(false);
  const [viewedOrders, setViewedOrders] = useState<any[]>([]);
  const [hasViewed, setHasViewed] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');

  const [syncingWebhook, setSyncingWebhook] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [inputBotToken, setInputBotToken] = useState('');
  const [inputChatId, setInputChatId] = useState('');

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleSyncWebhook = async () => {
    if (!inputBotToken.trim()) {
      showToast("Errore: Inserisci il token del Bot prima di procedere.", true);
      return;
    }

    setSyncingWebhook(true);
    try {
      // Determine the protocol and host from the current window location
      const host = window.location.host;
      const protocol = window.location.protocol; // http: or https:
      const webhookUrl = `${protocol}//${host}/api/telegram-webhook`;

      // Get user session JWT token to authenticate database upsert in API route
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/admin/sync-telegram-webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          botToken: inputBotToken.trim(),
          chatId: inputChatId.trim(),
          webhookUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Webhook Telegram sincronizzato con successo!\nURL: ${data.webhookUrl}`, false);
      } else {
        showToast(`Errore: ${data.error || 'Risposta non valida'}`, true);
      }
    } catch (err: any) {
      showToast(`Errore di rete: ${err.message}`, true);
    } finally {
      setSyncingWebhook(false);
    }
  };

  // Load contacts from localStorage (strictly for today's orders)
  const loadContacts = () => {
    try {
      const stored = localStorage.getItem('pizza_completed_contacts');
      if (stored) {
        let parsed = JSON.parse(stored);
        
        // Keep ONLY contacts completed on the current local day!
        const todayStr = new Date().toDateString();
        parsed = parsed.filter((c: any) => new Date(c.date).toDateString() === todayStr);
        
        // Save today's list back to localStorage
        localStorage.setItem('pizza_completed_contacts', JSON.stringify(parsed));
        
        // Sort by date descending (newest first)
        parsed.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setContacts(parsed);
      } else {
        setContacts([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (status === 'completed') {
      const order = orders.find(o => o.id === id);
      if (order) {
        try {
          const stored = localStorage.getItem('pizza_completed_contacts');
          const currentContacts = stored ? JSON.parse(stored) : [];
          
          const cleanAddress = parseAddressAndCoords(order.address).address;
          const orderItems = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
          
          const newContact = {
            id: order.id || `contact-${Date.now()}`,
            name: order.customer_name || 'Cliente',
            phone: order.phone || '',
            address: cleanAddress,
            date: new Date().toISOString(),
            itemsText: orderItems.map(item => `${item.quantity || 1}x ${item.name || 'Articolo'}`).join(', '),
            total: order.total || 0
          };
          
          // Filter out older identical phone entries and prepend the new one
          const filtered = currentContacts.filter((c: any) => c.phone !== newContact.phone);
          filtered.unshift(newContact);
          
          // Filter for current day only
          const todayStr = new Date().toDateString();
          const todayFiltered = filtered.filter((c: any) => new Date(c.date).toDateString() === todayStr);
          
          localStorage.setItem('pizza_completed_contacts', JSON.stringify(todayFiltered));
          loadContacts();
        } catch (e) {
          console.error('Error saving contact:', e);
        }
      }
    }
    await updateOrderStatus(id, status as any);
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const startIso = `${startDate}T00:00:00.000Z`;
      const endIso = `${endDate}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from('pizza_orders')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const exportOrders = data || [];
      if (exportOrders.length === 0) {
        alert("Nessun ordine trovato nel periodo selezionato.");
        setExportLoading(false);
        return;
      }

      // Format as CSV (Excel compatible, with UTF-8 BOM and semicolon separator)
      let csvContent = '\uFEFF'; 
      const headers = [
        'ID Ordine',
        'Data e Ora',
        'Cliente',
        'Telefono',
        'Indirizzo',
        'Metodo Pagamento',
        'Totale (THB)',
        'Stato',
        'Dettaglio Piatti'
      ];
      csvContent += headers.join(';') + '\n';

      exportOrders.forEach((order: any) => {
        const orderId = order.id ? String(order.id).substring(0, 8).toUpperCase() : 'N/A';
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('it-IT') : 'N/A';
        const clientName = (order.customer_name || 'Cliente').replace(/;/g, ' ');
        const phoneNum = (order.phone || '').replace(/;/g, ' ');
        
        const cleanAddress = parseAddressAndCoords(order.address).address.replace(/;/g, ' ').replace(/\n/g, ' ');
        const payMethod = order.payment_method === 'promptpay' ? 'PromptPay' : 'Contanti';
        const totalAmount = order.total || 0;
        const statusStr = order.status;
        
        const itemsList = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
        const itemsText = itemsList
          .map(item => `${item.quantity || 1}x ${item.name || 'Articolo'}${item.selectedVariant ? ` (${item.selectedVariant})` : ''}`)
          .join(', ')
          .replace(/;/g, ' ');

        const row = [
          orderId,
          dateStr,
          clientName,
          phoneNum,
          cleanAddress,
          payMethod,
          totalAmount,
          statusStr,
          itemsText
        ];
        
        csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `storico_ordini_${startDate}_al_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowExportModal(false);
    } catch (err: any) {
      console.error('Error exporting historical orders:', err);
      alert('Si è verificato un errore durante l\'esportazione: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const getPresetDates = (type: string) => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    switch (type) {
      case 'today':
        return { start: formatDate(today), end: formatDate(today) };
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return { start: formatDate(yesterday), end: formatDate(yesterday) };
      }
      case 'last7': {
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 6);
        return { start: formatDate(last7), end: formatDate(today) };
      }
      case 'thisMonth': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: formatDate(firstDay), end: formatDate(today) };
      }
      case 'lastMonth': {
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start: formatDate(firstDayLastMonth), end: formatDate(lastDayLastMonth) };
      }
      default:
        return null;
    }
  };

  const handleRangeTypeChange = (type: string) => {
    setDateRangeType(type);
    const preset = getPresetDates(type);
    if (preset) {
      setStartDate(preset.start);
      setEndDate(preset.end);
    }
  };

  const handleViewOrders = async () => {
    setViewLoading(true);
    setHasViewed(true);
    try {
      const startIso = `${startDate}T00:00:00.000Z`;
      const endIso = `${endDate}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from('pizza_orders')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setViewedOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching on-screen orders:', err);
      alert('Si è verificato un errore durante il caricamento: ' + err.message);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
    setViewedOrders([]);
    setHasViewed(false);
    setDateRangeType('today');
    setArchiveSearchQuery('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  // Poll orders every 10 seconds (fallback) and listen to Supabase Realtime changes
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);

    const channel = supabase
      .channel('pizza_orders_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pizza_orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // Audio warning sound loop for new orders
  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  useEffect(() => {
    if (newOrdersCount > 0 && !isMuted) {
      const playTone = () => {
        try {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const now = ctx.currentTime;
          
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(880, now);
          osc1.frequency.exponentialRampToValueAtTime(440, now + 0.3);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1320, now + 0.15);
          osc2.frequency.exponentialRampToValueAtTime(660, now + 0.45);

          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

          osc1.start(now);
          osc1.stop(now + 0.6);
          osc2.start(now + 0.15);
          osc2.stop(now + 0.6);
        } catch (e) {
          console.warn('Web Audio warning play blocked:', e);
        }
      };

      playTone();
      const interval = setInterval(playTone, 4500);
      return () => clearInterval(interval);
    }
  }, [newOrdersCount, isMuted]);

  // Kanban status lists filtering
  // Column 1: Nuovi Ordini — shows only status === 'new'
  const colNew = orders.filter(o => o.status === 'new');
  // Column 2: In Consegna — shows only status === 'preparing'
  const colDelivering = orders.filter(o => o.status === 'preparing');
  // Column 3: Consegnato — shows only status === 'delivering'
  const colDone = orders.filter(o => o.status === 'delivering');

  return (
    <div className="min-h-screen text-stone-100 flex flex-col font-sans" style={{ background: '#0c0a09' }}>
      
      {/* Header bar */}
      <header className="sticky top-0 z-20 px-6 py-4 border-b border-stone-800 flex items-center justify-between backdrop-blur-md bg-[#0c0a09]/95">
        <div>
          <h1 className="text-xl font-light text-white flex items-center gap-2.5" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.6rem' }}>
            <img src="/Flower_Power_Pizza_-_HotSpring.png" alt="Flower Power Logo" className="w-8 h-8 object-contain" /> Kitchen & Delivery Dashboard
          </h1>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">
            Flower Power Pizza · Ranong
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound Alert Toggle */}
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isMuted 
                ? 'border-stone-700 text-stone-500 hover:text-stone-300 hover:border-stone-600' 
                : 'border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-950/40'
            }`}
            title={isMuted ? 'Unmute New Order Sound' : 'Mute New Order Sound'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="animate-bounce" />}
          </button>

          {/* Refresh Action */}
          <button 
            onClick={fetchOrders} 
            disabled={loading} 
            className="p-2 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-600 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Aggiorna Ordini"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#c5a572]' : ''} />
          </button>

          {/* Contacts Directory */}
          <button 
            onClick={() => { loadContacts(); setShowContacts(true); }} 
            className="p-2 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-600 rounded-xl transition-all cursor-pointer"
            title="Archivio Contatti"
          >
            <Users size={16} />
          </button>



          {/* Export Orders Calendar */}
          <button 
            onClick={() => { 
              handleCloseExportModal(); 
              setShowExportModal(true); 
              setTimeout(() => {
                handleViewOrders();
              }, 100);
            }} 
            className="p-2 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-600 rounded-xl transition-all cursor-pointer"
            title="Esporta Storico Ordini"
          >
            <Calendar size={16} />
          </button>

          {/* Logout Action */}
          <button 
            onClick={onLogout} 
            className="p-2 border border-red-950 text-red-500 hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Kanban Board Container */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start overflow-y-auto">
        
        {/* Column 1: Nuovi Ordini */}
        <section className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-red-400">Nuovi Ordini</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-900/30">{colNew.length}</span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1">
            {colNew.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-600 text-xs">
                <Pizza size={24} className="opacity-10 stroke-1 mb-2" />
                Nessun nuovo ordine
              </div>
            ) : (
              colNew.map(order => (
                <OrderCard key={order.id} order={order} onAdvance={handleUpdateStatus} />
              ))
            )}
          </div>
        </section>

        {/* Column 2: In Consegna */}
        <section className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-amber-400">In Consegna</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-900/30">{colDelivering.length}</span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1">
            {colDelivering.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-600 text-xs">
                <Pizza size={24} className="opacity-10 stroke-1 mb-2" />
                Nessun ordine in consegna
              </div>
            ) : (
              colDelivering.map(order => (
                <OrderCard key={order.id} order={order} onAdvance={handleUpdateStatus} />
              ))
            )}
          </div>
        </section>

        {/* Column 3: Consegnato */}
        <section className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-emerald-400">Consegnato</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">{colDone.length}</span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1">
            {colDone.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-600 text-xs">
                <Pizza size={24} className="opacity-10 stroke-1 mb-2" />
                Nessun ordine consegnato oggi
              </div>
            ) : (
              colDone.map(order => (
                <OrderCard key={order.id} order={order} onAdvance={handleUpdateStatus} />
              ))
            )}
          </div>
        </section>

      {/* Real-time Delivery Tracking Map */}
      {orders.some(o => o.tracking_active) && (
        <section className="col-span-1 lg:col-span-3 bg-stone-900/40 border border-stone-800/80 rounded-3xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs uppercase tracking-widest font-extrabold text-emerald-400">Mappa Consegne in Tempo Reale</h2>
            <span className="ml-auto text-xs text-stone-500">Tracciamento motorino attivo (🛵)</span>
          </div>

          <div className="relative w-full h-[400px] rounded-2xl border border-stone-800 overflow-hidden bg-stone-950">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
              <Map
                defaultCenter={{ lat: RESTAURANT_LAT, lng: RESTAURANT_LNG }}
                defaultZoom={14}
                disableDefaultUI={false}
                gestureHandling="cooperative"
                style={{ height: '100%', width: '100%' }}
              >
                {/* 1. Marker della Pizzeria */}
                <Marker
                  position={{ lat: RESTAURANT_LAT, lng: RESTAURANT_LNG }}
                  title="Flower Power Pizza"
                  icon={{
                    url: '/Flower_Power_Pizza_-_HotSpring.png',
                    scaledSize: (typeof google !== 'undefined' && google.maps && google.maps.Size) ? new google.maps.Size(36, 36) : undefined
                  }}
                />

                {/* 2. Marker per ciascun Ordine in Tracciamento */}
                {orders.filter(o => o.tracking_active).map(order => {
                  const coords = parseAddressAndCoords(order.address || "");
                  const hasCustomerCoords = coords.hasCoords;
                  const hasDriverCoords = order.driver_latitude && order.driver_longitude && order.driver_latitude !== -99;
                  
                  return (
                    <div key={order.id}>
                      {/* Marker Cliente */}
                      {hasCustomerCoords && (
                        <Marker
                          position={{ lat: coords.lat, lng: coords.lng }}
                          title={`Cliente: ${order.customer_name} (Ordine #${order.id})`}
                          label={{ text: "👤", fontSize: "16px" }}
                        />
                      )}

                      {/* Marker Motorino / Driver */}
                      {hasDriverCoords && (
                        <Marker
                          position={{ lat: Number(order.driver_latitude), lng: Number(order.driver_longitude) }}
                          title={`Motorino: Ordine #${order.id} (${order.customer_name})`}
                          label={{ text: "🛵", fontSize: "24px" }}
                        />
                      )}
                    </div>
                  );
                })}
              </Map>
            </APIProvider>
          </div>
        </section>
      )}

      </main>

      {/* Contacts Overlay Modal */}
      {showContacts && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-2xl h-[550px] p-6 text-stone-200 relative rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Users className="text-[#c5a572] w-5 h-5" />
                <h3 className="text-sm uppercase tracking-widest font-extrabold text-[#c5a572]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Registro Contatti Clienti
                </h3>
              </div>
              <button
                onClick={() => setShowContacts(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search and Action Bar */}
            <div className="my-4 flex gap-3 flex-shrink-0">
              <input
                className="flex-1 bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-inset focus:ring-[#c5a572] transition-all text-xs"
                placeholder="Cerca per nome o numero di telefono..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => {
                  if (confirm("Sei sicuro di voler cancellare tutti i contatti salvati?")) {
                    localStorage.removeItem('pizza_completed_contacts');
                    setContacts([]);
                  }
                }}
                className="px-4 py-2 border border-red-950/60 bg-red-950/10 text-red-400 hover:bg-red-950/20 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Svuota Tutto
              </button>
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {contacts.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                c.phone.includes(searchQuery)
              ).length === 0 ? (
                <div className="text-center py-20 text-stone-600 text-xs">
                  <Users size={32} className="opacity-10 stroke-1 mx-auto mb-2" />
                  Nessun contatto in archivio
                </div>
              ) : (
                contacts
                  .filter(c => 
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    c.phone.includes(searchQuery)
                  )
                  .map(contact => {
                    const dateStr = new Date(contact.date).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    return (
                      <div key={contact.id} className="bg-stone-950 border border-stone-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-stone-200 text-sm">{contact.name}</span>
                            <span className="text-[10px] text-stone-500 font-medium">({dateStr})</span>
                            {contact.total !== undefined && (
                              <span className="text-[10px] text-amber-400 font-bold bg-[#c5a572]/10 border border-[#c5a572]/20 px-1.5 py-0.5 rounded">
                                {contact.total} ฿
                              </span>
                            )}
                          </div>
                          <p className="text-stone-400 text-[11px] leading-relaxed break-words">{contact.address}</p>
                          {(contact as any).itemsText && (
                            <p className="text-stone-500 text-[10px] italic leading-normal pt-1.5 flex items-center gap-1 border-t border-stone-900/60 mt-1.5">
                              🍕 {(contact as any).itemsText}
                            </p>
                          )}
                        </div>
                        <a
                          href={`tel:${contact.phone}`}
                          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 bg-stone-900 hover:border-[#c5a572] hover:text-[#c5a572] rounded-xl text-stone-300 font-bold transition-all"
                        >
                          <Phone size={12} /> {contact.phone}
                        </a>
                      </div>
                    );
                  })
              )}
            </div>

          </div>
        </div>
      )}

      {/* Export Orders Calendar Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-4xl h-[600px] p-6 text-stone-200 relative rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="text-[#c5a572] w-5 h-5" />
                <h3 className="text-sm uppercase tracking-widest font-extrabold text-[#c5a572]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Archivio Storico Ordini
                </h3>
              </div>
              <button
                onClick={handleCloseExportModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Content Layout */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 mt-4 overflow-hidden">
              
              {/* Left Pane: Filters & Actions */}
              <div className="w-full md:w-80 flex flex-col justify-between flex-shrink-0 border-b md:border-b-0 md:border-r border-stone-800 pb-4 md:pb-0 md:pr-6">
                <div className="space-y-4">
                  {/* Preset Dropdown Menu */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Periodo Rapido</label>
                    <select
                      value={dateRangeType}
                      onChange={e => handleRangeTypeChange(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#c5a572] cursor-pointer"
                    >
                      <option value="today">Oggi</option>
                      <option value="yesterday">Ieri</option>
                      <option value="last7">Ultimi 7 Giorni</option>
                      <option value="thisMonth">Questo Mese</option>
                      <option value="lastMonth">Mese Scorso</option>
                      <option value="custom">Periodo Personalizzato</option>
                    </select>
                  </div>

                  {/* Custom Date Pickers */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Data Inizio</label>
                      <input
                        type="date"
                        disabled={dateRangeType !== 'custom'}
                        className="w-full bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#c5a572] disabled:opacity-50 disabled:cursor-not-allowed"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Data Fine</label>
                      <input
                        type="date"
                        disabled={dateRangeType !== 'custom'}
                        className="w-full bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#c5a572] disabled:opacity-50 disabled:cursor-not-allowed"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* General Search Input */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-800">
                    <label className="text-[10px] text-[#c5a572] font-extrabold uppercase tracking-wider block">Cerca nel Database</label>
                    <input
                      className="w-full bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#c5a572] focus:ring-1 focus:ring-inset focus:ring-[#c5a572] transition-all text-xs"
                      placeholder="Nome, telefono, ID, piatto..."
                      value={archiveSearchQuery}
                      onChange={e => setArchiveSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="space-y-2 mt-4 md:mt-0">
                  <button
                    onClick={handleViewOrders}
                    disabled={viewLoading}
                    className="w-full py-2.5 border border-[#c5a572]/40 bg-[#c5a572]/5 text-[#c5a572] hover:bg-[#c5a572]/15 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {viewLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Caricamento...
                      </>
                    ) : (
                      '👀 VISUALIZZA A SCHERMO'
                    )}
                  </button>

                  <button
                    onClick={handleExportExcel}
                    disabled={exportLoading}
                    className="w-full py-2.5 bg-[#c5a572] hover:bg-[#b0915f] disabled:bg-stone-850 disabled:text-stone-500 text-stone-950 text-xs tracking-wider uppercase font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {exportLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Download...
                      </>
                    ) : (
                      '📥 SCARICA EXCEL (.CSV)'
                    )}
                  </button>
                </div>
              </div>

              {/* Right Pane: Historical Data Display */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {!hasViewed ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-600">
                    <Calendar size={48} className="opacity-10 stroke-1 mb-3" />
                    <p className="text-xs font-medium max-w-sm">
                      Seleziona un periodo temporale e premi <strong>"Visualizza a Schermo"</strong> per consultare l'elenco degli ordini direttamente qui.
                    </p>
                  </div>
                ) : viewLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#c5a572]">
                    <Loader2 size={36} className="animate-spin mb-3" />
                    <p className="text-xs">Caricamento storico in corso...</p>
                  </div>
                ) : viewedOrders.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-600">
                    <Calendar size={48} className="opacity-10 stroke-1 mb-3" />
                    <p className="text-xs font-medium">Nessun ordine trovato per le date selezionate.</p>
                  </div>
                ) : (() => {
                  const filtered = viewedOrders.filter(order => {
                    const query = archiveSearchQuery.toLowerCase().trim();
                    if (!query) return true;
                    
                    const orderId = order.id ? String(order.id).substring(0, 8).toLowerCase() : '';
                    const customer = (order.customer_name || '').toLowerCase();
                    const phone = (order.phone || '').toLowerCase();
                    const address = (order.address || '').toLowerCase();
                    const status = (order.status || '').toLowerCase();
                    const payment = (order.payment_method || '').toLowerCase();
                    
                    const itemsList = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
                    const itemsText = itemsList.map(i => i.name.toLowerCase()).join(' ');

                    return orderId.includes(query) ||
                           customer.includes(query) ||
                           phone.includes(query) ||
                           address.includes(query) ||
                           status.includes(query) ||
                           payment.includes(query) ||
                           itemsText.includes(query);
                  });

                  return (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-stone-800 text-[10px] text-stone-550 font-bold uppercase tracking-wider flex-shrink-0">
                        <span>Elenco Risultati</span>
                        <span>{filtered.length} di {viewedOrders.length} ordini trovati</span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar pb-4">
                        {filtered.length === 0 ? (
                          <div className="text-center py-20 text-stone-600 text-xs">
                            Nessun ordine corrisponde alla ricerca
                          </div>
                        ) : (
                          filtered.map((order: any) => {
                            const orderId = order.id ? String(order.id).substring(0, 8).toUpperCase() : 'N/A';
                            const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A';

                            const orderItems = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
                            const itemsSummary = orderItems.map(i => `${i.quantity}x ${i.name}`).join(', ');

                            return (
                              <div key={order.id} className="bg-stone-950 border border-stone-850 p-3.5 rounded-2xl flex items-start justify-between gap-4 text-xs hover:border-stone-750 transition-colors">
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-[#c5a572]">#{orderId}</span>
                                    <span className="font-bold text-stone-200">{order.customer_name}</span>
                                    <span className="text-[10px] text-stone-500 font-medium">({dateStr})</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                      order.status === 'completed' 
                                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                                        : 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                                    }`}>
                                      {order.status === 'completed' ? 'Consegnato' : order.status}
                                    </span>
                                  </div>
                                  <p className="text-stone-400 text-[11px] leading-relaxed break-words">
                                    📞 {order.phone} · 📍 {parseAddressAndCoords(order.address).address}
                                  </p>
                                  {itemsSummary && (
                                    <p className="text-stone-500 text-[10px] italic pt-1 flex items-center gap-1">
                                      🍕 {itemsSummary}
                                    </p>
                                  )}
                                </div>
                                <span className="font-black text-stone-200 px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg flex-shrink-0 self-center">
                                  {order.total || 0} ฿
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Sezione Nuovo Dominio */}
      <div className="mx-6 mb-6 p-6 bg-stone-900/30 border border-red-950/50 rounded-3xl space-y-4">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#c5a572]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Nuovo Dominio
          </h3>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">
            Configurazione rapida del Bot Telegram per cambi di dominio in produzione
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              TELEGRAM_BOT_TOKEN
            </label>
            <input
              type="text"
              placeholder="Inserisci il token del Bot da @BotFather"
              value={inputBotToken}
              onChange={(e) => setInputBotToken(e.target.value)}
              className="w-full bg-stone-950 border border-stone-850 p-2.5 rounded-xl text-stone-200 placeholder-stone-650 focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-inset focus:ring-red-900 transition-all text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              TELEGRAM_CHAT_ID
            </label>
            <input
              type="text"
              placeholder="Inserisci l'ID del gruppo privato (es. -100...)"
              value={inputChatId}
              onChange={(e) => setInputChatId(e.target.value)}
              className="w-full bg-stone-950 border border-stone-850 p-2.5 rounded-xl text-stone-200 placeholder-stone-650 focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-inset focus:ring-red-900 transition-all text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSyncWebhook} 
            disabled={syncingWebhook} 
            className="px-5 py-2.5 bg-red-950/20 border border-red-800/40 text-red-400 hover:bg-red-950/30 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider"
          >
            <RefreshCw size={14} className={syncingWebhook ? 'animate-spin' : ''} />
            Sincronizza Webhook Telegram
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn pointer-events-none">
          <div className={`px-5 py-3 rounded-2xl shadow-2xl border text-xs max-w-sm backdrop-blur-md flex items-center gap-2 ${
            toastMessage.isError 
              ? 'bg-red-950/90 border-red-800/60 text-red-200' 
              : 'bg-emerald-950/90 border-emerald-800/60 text-emerald-200'
          }`}>
            <span className="font-semibold break-all leading-relaxed whitespace-pre-line">{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Kanban order element card
function OrderCard({ order, onAdvance }: { order: PizzaOrder; onAdvance: (id: string, status: any) => void }) {
  try {
    console.log("Dato ordine ricevuto nella Dashboard:", order);
    const items = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
    const createdAt = order.created_at ? new Date(order.created_at) : null;
    const timeStr = createdAt ? createdAt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
    
    const { address, lat, lng, hasCoords } = parseAddressAndCoords(order.address);
    const msgEncoded = getDriverMessageEncoded(order, lat, lng);

    // Status mapping logic
    const isNew = order.status === 'new';
    const isPreparing = order.status === 'preparing';
    const isDelivering = order.status === 'delivering';
    const isCompleted = order.status === 'completed';

    return (
      <div 
        className="bg-stone-950/80 border rounded-2xl p-4.5 space-y-4 transition-all duration-300 shadow-lg hover:border-stone-700/80"
        style={{
          borderColor: isNew ? 'rgba(239, 68, 68, 0.35)' : isPreparing ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.2)'
        }}
      >
        {/* Header Info */}
        <div className="flex items-start justify-between gap-2 border-b border-stone-900 pb-2">
          <div>
            <h3 className="font-semibold text-stone-200 text-sm tracking-tight">{order.customer_name || 'Cliente'}</h3>
            <div className="flex items-center gap-3.5 mt-1 text-[10px] text-stone-500 font-medium">
              <span className="flex items-center gap-1"><Clock size={12} className="text-[#c5a572]" /> {timeStr}</span>
              <a href={`tel:${order.phone}`} className="flex items-center gap-1 hover:text-[#c5a572] transition-colors"><Phone size={12} className="text-[#c5a572]" /> {order.phone || 'N/A'}</a>
            </div>
          </div>
          <span className="text-sm font-black text-white px-2 py-0.5 bg-[#8B1E1E]/20 text-[#fbbf24] border border-[#8B1E1E]/30 rounded-md">
            {order.total || 0} ฿
          </span>
        </div>

        {/* Cart Items — full detail for new orders, compact one-liner for delivering/completed */}
        {isNew ? (
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-stone-500 text-[10px] italic">Dettaglio piatti non disponibile</p>
            ) : (
              items.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between text-stone-200">
                    <span className="font-semibold">{item.quantity || 1}x {item.name || 'Articolo'}</span>
                    <span className="text-stone-500">{(item.itemTotal || 0)} ฿</span>
                  </div>
                  {item.selectedVariant && (
                    <span className="text-[10px] text-stone-400 bg-stone-900/60 px-1.5 py-0.5 rounded border border-stone-800/40 mt-1 inline-block">
                      Taglia: {typeof item.selectedVariant === 'object' ? ((item.selectedVariant as any).name || 'Standard') : String(item.selectedVariant)}
                    </span>
                  )}
                  {Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0 && (
                    <ul className="pl-3 text-[10px] text-stone-500 mt-1 space-y-0.5">
                      {item.selectedExtras.map((extra, eIdx) => (
                        <li key={eIdx}>+ {extra.name} {extra.price > 0 ? `(+${extra.price}฿)` : ''}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Compact one-liner for delivering / completed */
          <p className="text-[11px] text-stone-400 leading-relaxed">
            {items.length === 0
              ? 'Nessun dettaglio disponibile'
              : items.map(item => `${item.quantity || 1}x ${item.name || 'Articolo'}`).join(' · ')}
          </p>
        )}

        {/* ── NEW ONLY: Address, Maps link, Receipt, Driver share ── */}
        {isNew && (
          <>
            {/* Address Details */}
            <div className="text-xs">
              <div className="flex items-start gap-1.5 text-stone-300 leading-relaxed bg-stone-900/30 p-2 rounded-xl border border-stone-900">
                <MapPin size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                <span className="break-words select-all">{address}</span>
              </div>
            </div>

            {/* Google Maps Link Button */}
            {hasCoords && !isNaN(lat) && !isNaN(lng) && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl bg-stone-900 border border-[#c5a572]/30 text-[#c5a572] hover:bg-[#c5a572]/15 hover:border-[#c5a572]/65 hover:text-white transition-all text-center cursor-pointer shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                📍 Apri in Google Maps
              </a>
            )}

            {/* Receipt Preview */}
            {order.receipt_url && (
              <div className="flex items-center justify-between text-[10px] bg-[#c5a572]/5 border border-[#c5a572]/20 p-2 rounded-xl">
                <span className="text-stone-400">Metodo: PromptPay (Ricevuta)</span>
                <a 
                  href={order.receipt_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#c5a572] hover:text-white transition-colors"
                >
                  <ExternalLink size={10} /> Vedi screenshot
                </a>
              </div>
            )}

            {/* Driver WhatsApp / LINE share links */}
            {hasCoords && (
              <div className="space-y-1.5 pt-2 border-t border-stone-900">
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Invia a Fattorino:</p>
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={`https://wa.me/?text=${msgEncoded}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-[10px] tracking-wider uppercase font-extrabold rounded-xl bg-[#25D366] text-white hover:opacity-90 transition-all text-center"
                  >
                    <Send size={11} /> WhatsApp
                  </a>
                  <a 
                    href={`https://line.me/R/msg/text/?${msgEncoded}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-[10px] tracking-wider uppercase font-extrabold rounded-xl bg-[#06C755] text-white hover:opacity-90 transition-all text-center"
                  >
                    <Send size={11} /> LINE
                  </a>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PREPARING/DELIVERING ONLY: keep receipt link for payment verification ── */}
        {(isPreparing || isDelivering) && order.receipt_url && (
          <div className="flex items-center justify-between text-[10px] bg-[#c5a572]/5 border border-[#c5a572]/20 p-2 rounded-xl">
            <span className="text-stone-400">PromptPay (Ricevuta)</span>
            <a 
              href={order.receipt_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#c5a572] hover:text-white transition-colors"
            >
              <ExternalLink size={10} /> Vedi screenshot
            </a>
          </div>
        )}

        {/* ── State Advancing Buttons ── */}
        <div className="pt-1">
          {/* NEW → CONFERMA / Rifiuta Ordine */}
          {isNew && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const data = { type: 'ORDER_ACCEPTED', orderId: order.id };
                  try {
                    const ch = new BroadcastChannel('flower_power_orders_channel');
                    ch.postMessage(data);
                    ch.close();
                  } catch (e) {}
                  try {
                    const ch = new BroadcastChannel('pizza_orders_channel');
                    ch.postMessage(data);
                    ch.close();
                  } catch (e) {}
                  onAdvance(order.id!, 'preparing');
                }}
                className="flex-grow flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-extrabold bg-[#c5a572]/15 border border-[#c5a572]/40 text-[#c5a572] hover:bg-[#c5a572]/20 transition-all cursor-pointer animate-pulse font-sans"
              >
                CONFERMA <ChevronRight size={14} />
              </button>
              <button
                onClick={() => {
                  const data = { type: 'ORDER_REJECTED', orderId: order.id };
                  try {
                    const ch = new BroadcastChannel('flower_power_orders_channel');
                    ch.postMessage(data);
                    ch.close();
                  } catch (e) {}
                  try {
                    const ch = new BroadcastChannel('pizza_orders_channel');
                    ch.postMessage(data);
                    ch.close();
                  } catch (e) {}
                  onAdvance(order.id!, 'rejected');
                }}
                className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-xs uppercase tracking-widest font-extrabold bg-red-950/30 border border-red-800/40 text-red-400 hover:bg-red-950/50 transition-all cursor-pointer font-sans"
                title="Rifiuta e notifica il cliente"
              >
                Rifiuta Ordine
              </button>
            </div>
          )}

          {/* PREPARING → start delivery (+ broadcast ORDER_DELIVERING) */}
          {isPreparing && (
            <button
              onClick={() => {
                const data = { type: 'ORDER_DELIVERING', orderId: order.id };
                try {
                  const ch = new BroadcastChannel('flower_power_orders_channel');
                  ch.postMessage(data);
                  ch.close();
                } catch (e) {}
                try {
                  const ch = new BroadcastChannel('pizza_orders_channel');
                  ch.postMessage(data);
                  ch.close();
                } catch (e) {}
                onAdvance(order.id!, 'delivering');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-extrabold bg-amber-600/15 border border-amber-600/40 text-amber-400 hover:bg-amber-600/20 transition-all cursor-pointer animate-pulse font-sans"
            >
              🛵 FAI PARTIRE LA DELIVERY
            </button>
          )}

          {/* DELIVERING → confirm delivery */}
          {isDelivering && (
            <button
              onClick={() => onAdvance(order.id!, 'completed')}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-extrabold bg-emerald-600/15 border border-emerald-600/40 text-emerald-400 hover:bg-emerald-600/20 transition-all cursor-pointer font-sans"
            >
              CONSEGNATO <CheckCircle size={14} className="ml-1" />
            </button>
          )}

          {/* COMPLETED → no action */}
          {isCompleted && (
            <div className="flex items-center justify-center gap-1.5 py-1.5 text-stone-600 text-[10px] font-semibold uppercase tracking-wider">
              ✓ Archiviato
            </div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error('Crash prevented on OrderCard rendering for order:', order?.id, err);
    return null;
  }
}
