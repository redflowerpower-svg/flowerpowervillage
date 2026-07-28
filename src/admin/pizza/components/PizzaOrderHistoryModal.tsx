import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { CartItemSaved } from '../../../pizza/types';
import { 
  Calendar, 
  X, 
  Loader2, 
  Download, 
  Search, 
  FileText, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PizzaOrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const parseAddressAndCoords = (addressStr: string) => {
  if (!addressStr) return { address: '', lat: null, lng: null, hasCoords: false };
  const match = addressStr.match(/^(.*?)\s*\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]$/);
  if (match) {
    return {
      address: match[1].trim(),
      lat: parseFloat(match[2]),
      lng: parseFloat(match[3]),
      hasCoords: true
    };
  }
  return { address: addressStr.trim(), lat: null, lng: null, hasCoords: false };
};

export function PizzaOrderHistoryModal({ isOpen, onClose }: PizzaOrderHistoryModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [dateRangeType, setDateRangeType] = useState<string>('today');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>('');
  
  const [viewedOrders, setViewedOrders] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [hasViewed, setHasViewed] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Auto fetch today's historical orders on modal open
      handleViewOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: formatDate(startOfMonth), end: formatDate(today) };
      }
      case 'lastMonth': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start: formatDate(startOfLastMonth), end: formatDate(endOfLastMonth) };
      }
      default:
        return { start: startDate, end: endDate };
    }
  };

  const handleRangeTypeChange = (type: string) => {
    setDateRangeType(type);
    if (type !== 'custom') {
      const { start, end } = getPresetDates(type);
      setStartDate(start);
      setEndDate(end);
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
      console.error('[PizzaOrderHistoryModal] Error fetching orders:', err);
      alert('Errore durante il recupero degli ordini: ' + err.message);
    } finally {
      setViewLoading(false);
    }
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
        alert('Nessun ordine trovato nel periodo selezionato.');
        setExportLoading(false);
        return;
      }

      // UTF-8 BOM + semicolon separator for Excel
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
    } catch (err: any) {
      console.error('[PizzaOrderHistoryModal] Error exporting CSV:', err);
      alert('Errore durante l\'esportazione: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const filteredOrders = viewedOrders.filter(order => {
    const query = archiveSearchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const orderId = order.id ? String(order.id).substring(0, 8).toLowerCase() : '';
    const customer = (order.customer_name || '').toLowerCase();
    const phone = (order.phone || '').toLowerCase();
    const address = (order.address || '').toLowerCase();
    const status = (order.status || '').toLowerCase();
    const payment = (order.payment_method || '').toLowerCase();
    
    const itemsList = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
    const itemsText = itemsList.map(i => (i.name || '').toLowerCase()).join(' ');

    return orderId.includes(query) ||
           customer.includes(query) ||
           phone.includes(query) ||
           address.includes(query) ||
           status.includes(query) ||
           payment.includes(query) ||
           itemsText.includes(query);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-5xl h-[85vh] p-4 sm:p-6 text-stone-200 relative rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/10 border border-red-500/20 rounded-2xl text-red-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base uppercase tracking-widest font-black text-white">
                Archivio Storico Ordini Database
              </h3>
              <p className="text-xs text-stone-400">Filtra per intervallo temporale, cerca nel database ed esporta in CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-all cursor-pointer border border-stone-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 mt-4 overflow-hidden">
          
          {/* Left Controls Pane */}
          <div className="w-full md:w-80 flex flex-col justify-between flex-shrink-0 border-b md:border-b-0 md:border-r border-stone-800 pb-4 md:pb-0 md:pr-6 gap-4">
            <div className="space-y-4">
              {/* Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Periodo Rapido</label>
                <select
                  value={dateRangeType}
                  onChange={e => handleRangeTypeChange(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="today">Oggi</option>
                  <option value="yesterday">Ieri</option>
                  <option value="last7">Ultimi 7 Giorni</option>
                  <option value="thisMonth">Questo Mese</option>
                  <option value="lastMonth">Mese Scorso</option>
                  <option value="custom">Periodo Personalizzato</option>
                </select>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Da</label>
                  <input
                    type="date"
                    disabled={dateRangeType !== 'custom'}
                    className="w-full bg-stone-950 border border-stone-800 p-2 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">A</label>
                  <input
                    type="date"
                    disabled={dateRangeType !== 'custom'}
                    className="w-full bg-stone-950 border border-stone-800 p-2 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Search Bar */}
              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                <label className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider block">Filtra Risultati</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
                  <input
                    className="w-full bg-stone-950 border border-stone-800 pl-8 pr-3 py-2 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none focus:border-red-500 text-xs"
                    placeholder="Nome, telefono, ID ordine, piatto..."
                    value={archiveSearchQuery}
                    onChange={e => setArchiveSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mt-4 md:mt-0">
              <button
                onClick={handleViewOrders}
                disabled={viewLoading}
                className="w-full py-2.5 border border-red-500/40 bg-red-600/10 text-red-400 hover:bg-red-600/20 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {viewLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Visualizza Ordini ({viewedOrders.length})
                  </>
                )}
              </button>

              <button
                onClick={handleExportExcel}
                disabled={exportLoading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-stone-800 disabled:text-stone-500 text-white text-xs tracking-wider uppercase font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-950/40"
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generazione CSV...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Esporta CSV / Excel
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Orders List Display */}
          <div className="flex-1 flex flex-col overflow-hidden bg-stone-950/60 rounded-2xl border border-stone-800/80 p-4">
            {!hasViewed ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <Calendar size={48} className="opacity-20 stroke-1 mb-3 text-stone-400" />
                <p className="text-xs font-medium max-w-sm">
                  Seleziona un periodo temporale e clicca <strong>"Visualizza Ordini"</strong> per consultare lo storico del database.
                </p>
              </div>
            ) : viewLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-red-400">
                <Loader2 size={36} className="animate-spin mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider">Caricamento ordini dal database...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <AlertCircle size={40} className="opacity-30 stroke-1 mb-3 text-stone-400" />
                <p className="text-xs font-bold uppercase tracking-wider">Nessun ordine trovato</p>
                <p className="text-xs text-stone-500 mt-1">Nessun record corrisponde ai filtri selezionati per il periodo indicato.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {filteredOrders.map((order) => {
                  const orderId = order.id ? String(order.id).substring(0, 8).toUpperCase() : 'N/A';
                  const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('it-IT') : 'N/A';
                  const { address } = parseAddressAndCoords(order.address || '');
                  const itemsList = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];

                  const getStatusBadge = (st: string) => {
                    switch (st) {
                      case 'new':
                        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-600/20 text-red-400 border border-red-500/30">Nuovo</span>;
                      case 'preparing':
                        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">In Preparazione</span>;
                      case 'delivering':
                        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">In Consegna</span>;
                      case 'completed':
                        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Consegnato</span>;
                      case 'rejected':
                      case 'cancelled':
                        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-stone-700 text-stone-300 border border-stone-600">Annullato</span>;
                      default:
                        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-stone-800 text-stone-400">{st}</span>;
                    }
                  };

                  return (
                    <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 space-y-2 hover:border-stone-700 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white font-mono">#{orderId}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                            <Clock size={12} /> {dateStr}
                          </span>
                          <span className="font-black text-amber-400">{order.total || 0} ฿</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-extrabold text-stone-200">{order.customer_name || 'Cliente non specificato'}</p>
                          {order.phone && (
                            <p className="text-stone-400 text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone size={11} className="text-stone-500" /> {order.phone}
                            </p>
                          )}
                          {address && (
                            <p className="text-stone-400 text-[11px] flex items-center gap-1 mt-0.5 line-clamp-1">
                              <MapPin size={11} className="text-stone-500 flex-shrink-0" /> {address}
                            </p>
                          )}
                        </div>

                        <div className="bg-stone-950/40 p-2 rounded-lg border border-stone-850">
                          <p className="text-[10px] uppercase font-bold text-stone-500 mb-1">Piatti Ordinati ({itemsList.length})</p>
                          <div className="space-y-0.5 max-h-20 overflow-y-auto pr-1">
                            {itemsList.map((item, idx) => {
                              const nameStr = typeof item.name === 'string' ? item.name : ((item.name as any)?.name || (item.name as any)?.nameIt || 'Articolo');
                              const variantStr = typeof item.selectedVariant === 'string' ? item.selectedVariant : ((item.selectedVariant as any)?.name || '');
                              return (
                                <p key={idx} className="text-[11px] text-stone-300 leading-tight">
                                  <span className="font-bold text-red-400">{item.quantity || 1}x</span> {nameStr}
                                  {variantStr && <span className="text-stone-500 text-[10px]"> ({variantStr})</span>}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
