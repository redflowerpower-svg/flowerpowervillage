import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Building2,
  Pizza,
  CreditCard,
  Search,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText
} from 'lucide-react';

export interface PaymentInvoiceRecord {
  id: string;
  department: 'resort' | 'pizza';
  orderNo: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceDescription: string;
  gateway: 'ksher' | 'paypal' | 'stripe';
  paymentChannel: 'card' | 'promptpay' | 'paypal_wallet';
  grossAmount: number; // in THB
  gatewayFee: number; // in THB
  netAmount: number; // in THB
  currency: string;
  transactionId: string;
  date: string; // ISO string
  status: 'PAID' | 'REFUNDED';
}

// Sample initial data showing realistic records for Resort and Pizzeria (100% settled, zero deposit mentions)
const INITIAL_RECORDS: PaymentInvoiceRecord[] = [
  {
    id: 'INV-2026-001',
    department: 'resort',
    orderNo: 'FP-RESORT-2026-012',
    customerName: 'Marco Rossi',
    customerEmail: 'marco.rossi@example.it',
    customerPhone: '+39 340 1234567',
    serviceDescription: 'Jungle Villa (Koh Phayam) - Soggiorno Saldato (2 Notti)',
    gateway: 'ksher',
    paymentChannel: 'card',
    grossAmount: 3600,
    gatewayFee: 108,
    netAmount: 3492,
    currency: 'THB',
    transactionId: 'KSHER-39593-948172',
    date: '2026-08-30T10:15:00Z',
    status: 'PAID'
  },
  {
    id: 'INV-2026-002',
    department: 'pizza',
    orderNo: 'FP-PIZZA-2026-045',
    customerName: 'Somchai Prasert',
    customerEmail: 'somchai@email.th',
    customerPhone: '+66 81 234 5678',
    serviceDescription: '2x Pizza Margherita + 1x Pizza Diavola (Delivery Ranong - Saldato)',
    gateway: 'ksher',
    paymentChannel: 'promptpay',
    grossAmount: 780,
    gatewayFee: 6.24,
    netAmount: 773.76,
    currency: 'THB',
    transactionId: 'KSHER-PP-882190',
    date: '2026-08-30T12:30:00Z',
    status: 'PAID'
  },
  {
    id: 'INV-2026-003',
    department: 'resort',
    orderNo: 'FP-RESORT-2026-014',
    customerName: 'Hans Müller',
    customerEmail: 'hans.mueller@gmx.de',
    customerPhone: '+49 170 9876543',
    serviceDescription: 'Bungalow Vista Mare - Soggiorno Saldato (3 Notti)',
    gateway: 'paypal',
    paymentChannel: 'paypal_wallet',
    grossAmount: 5280, // Total with incorporated costs
    gatewayFee: 253.44,
    netAmount: 5026.56,
    currency: 'THB',
    transactionId: 'PAYPAL-984019284',
    date: '2026-08-29T16:45:00Z',
    status: 'PAID'
  },
  {
    id: 'INV-2026-004',
    department: 'pizza',
    orderNo: 'FP-PIZZA-2026-048',
    customerName: 'Elena Bianchi',
    customerEmail: 'elena.b@gmail.com',
    customerPhone: '+39 347 5556677',
    serviceDescription: 'Pizza 4 Formaggi + Patatine Fritte & Birra Singha (Saldato)',
    gateway: 'ksher',
    paymentChannel: 'card',
    grossAmount: 490,
    gatewayFee: 14.7,
    netAmount: 475.3,
    currency: 'THB',
    transactionId: 'KSHER-39593-948201',
    date: '2026-08-29T19:10:00Z',
    status: 'PAID'
  }
];

export const AccountingReportsTab: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<'all' | 'resort' | 'pizza'>('all');
  const [selectedGateway, setSelectedGateway] = useState<'all' | 'ksher' | 'paypal'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [records, setRecords] = useState<PaymentInvoiceRecord[]>(INITIAL_RECORDS);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/payments-admin?action=get-transactions')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setLoading(false);
        if (data.transactions && data.transactions.length > 0) {
          setRecords(data.transactions);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoading(false);
        console.warn('Could not fetch DB transactions, using standard records:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesDept = selectedDept === 'all' || r.department === selectedDept;
    const matchesGateway = selectedGateway === 'all' || r.gateway === selectedGateway;
    const matchesMonth = r.date.startsWith(selectedMonth);
    const matchesSearch =
      searchQuery === '' ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesGateway && matchesMonth && matchesSearch;
  });

  // Calculate totals
  const totalGross = filteredRecords.reduce((acc, r) => acc + r.grossAmount, 0);
  const totalFees = filteredRecords.reduce((acc, r) => acc + r.gatewayFee, 0);
  const totalNet = filteredRecords.reduce((acc, r) => acc + r.netAmount, 0);

  // CSV Exporter Helper
  const handleExportCSV = (gatewayFilter?: 'ksher' | 'paypal') => {
    const recordsToExport = filteredRecords.filter((r) =>
      !gatewayFilter ? true : r.gateway === gatewayFilter
    );

    if (recordsToExport.length === 0) {
      alert('Nessun record da esportare con i filtri selezionati.');
      return;
    }

    const headers = [
      'ID Fattura/Ricevuta',
      'Data e Ora (ICT/TH)',
      'Reparto',
      'Numero Ordine/Prenotazione',
      'Cliente',
      'Email',
      'Telefono',
      'Descrizione Servizio/Alloggio',
      'Gateway di Pagamento',
      'Canale/Metodo',
      'Totale Lordo (THB)',
      'Commissione Trattenuta (THB)',
      'Netto Accreditato (THB)',
      'ID Transazione Bancaria',
      'Stato'
    ];

    const rows = recordsToExport.map((r) => [
      `"${r.id}"`,
      `"${new Date(r.date).toLocaleString('it-IT')}"`,
      `"${r.department === 'resort' ? 'Resort (Koh Phayam)' : 'Pizzeria (Ranong)'}"`,
      `"${r.orderNo}"`,
      `"${r.customerName}"`,
      `"${r.customerEmail}"`,
      `"${r.customerPhone || ''}"`,
      `"${r.serviceDescription}"`,
      `"${r.gateway.toUpperCase()}"`,
      `"${r.paymentChannel}"`,
      `"${r.grossAmount.toFixed(2)}"`,
      `"${r.gatewayFee.toFixed(2)}"`,
      `"${r.netAmount.toFixed(2)}"`,
      `"${r.transactionId}"`,
      `"${r.status}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    const prefix = gatewayFilter ? `Report_${gatewayFilter.toUpperCase()}` : 'Report_Completo';
    link.setAttribute(
      'download',
      `FlowerPower_${prefix}_${selectedMonth}_${selectedDept}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Registri Fiscali & Fatture per il Commercialista
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Riconciliazione Automatica
                </span>
              </div>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Genera ed esporta i rendiconti mensili unificati o separati per Cash (Ksher) e PayPal con tutti i dettagli contabili.
              </p>
            </div>
          </div>

          {/* Quick Export Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCSV('ksher')}
              className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scarica Fatture Cash (Ksher THB)</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportCSV('paypal')}
              className="px-3.5 py-2 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Scarica Fatture PayPal</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportCSV()}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Esporta Tutto Unificato (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Totale Incassato Lordo</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ฿{totalGross.toLocaleString('it-IT', { minimumFractionDigits: 2 })} <span className="text-xs text-stone-500 font-sans">THB</span>
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">{filteredRecords.length} transazioni nel periodo</span>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Commissioni Gateway Deducibili</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            - ฿{totalFees.toLocaleString('it-IT', { minimumFractionDigits: 2 })} <span className="text-xs text-stone-500 font-sans">THB</span>
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">Fatturate con Tax Invoice da Ksher</span>
        </div>

        <div className="bg-stone-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-lg bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span className="font-bold">Netto Effettivo in Banca</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">
            ฿{totalNet.toLocaleString('it-IT', { minimumFractionDigits: 2 })} <span className="text-xs text-stone-500 font-sans">THB</span>
          </div>
          <span className="text-[10px] text-emerald-500/80 mt-1 block">Accreditato sul conto aziendale</span>
        </div>
      </div>

      {/* Control Bar: Dropdowns & Filters */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Dropdown 1: Reparto Stagno */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 flex-shrink-0">
              <Building2 className="w-3.5 h-3.5 text-stone-300" /> Reparto:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">🏢 Tutti i Reparti (Resort + Pizzeria)</option>
              <option value="resort">🏨 Solo Resort (Koh Phayam)</option>
              <option value="pizza">🍕 Solo Pizzeria Delivery (Ranong)</option>
            </select>
          </div>

          {/* Dropdown 2: Canale / Gateway */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 flex-shrink-0">
              <CreditCard className="w-3.5 h-3.5 text-stone-300" /> Gateway / Canale:
            </span>
            <select
              value={selectedGateway}
              onChange={(e) => setSelectedGateway(e.target.value as any)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">🌐 Tutti i Gateway di Pagamento</option>
              <option value="ksher">🟢 Solo Cash (Ksher - Carte & PromptPay)</option>
              <option value="paypal">🟡 Solo PayPal (+10% Surcharge)</option>
            </select>
          </div>

          {/* Dropdown 3: Mese di Riferimento */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5 flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-stone-300" /> Mese:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cerca per cliente, ID o servizio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white">
              Elenco Fatture & Transazioni Registrate ({filteredRecords.length})
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-mono">Valuta Base: THB (฿)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/80 text-[11px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-800">
              <tr>
                <th className="px-4 py-3">ID / Data</th>
                <th className="px-4 py-3">Reparto</th>
                <th className="px-4 py-3">Cliente & Contatti</th>
                <th className="px-4 py-3">Descrizione Ordine / Soggiorno</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3 text-right">Lordo (THB)</th>
                <th className="px-4 py-3 text-right">Commissione</th>
                <th className="px-4 py-3 text-right">Netto (THB)</th>
                <th className="px-4 py-3 text-center">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850 font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-stone-500">
                    Nessun pagamento registrato per i filtri selezionati nel mese di {selectedMonth}.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-850/50 transition-colors">
                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-white block">{rec.id}</span>
                      <span className="text-[10px] text-stone-500">
                        {new Date(rec.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {rec.department === 'resort' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Building2 className="w-3 h-3" /> Resort
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Pizza className="w-3 h-3" /> Pizzeria
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-stone-100 block">{rec.customerName}</span>
                      <span className="text-[10px] text-stone-400 block truncate max-w-[140px]">{rec.customerEmail}</span>
                      {rec.customerPhone && <span className="text-[10px] text-stone-500 block font-mono">{rec.customerPhone}</span>}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="text-[11px] text-stone-200 font-medium line-clamp-2">{rec.serviceDescription}</span>
                      <span className="text-[10px] text-stone-500 font-mono block mt-0.5">Ref: {rec.orderNo}</span>
                    </td>
                    <td className="px-4 py-3">
                      {rec.gateway === 'ksher' ? (
                        <div>
                          <span className="font-bold text-emerald-400 text-[11px] block">Cash (Ksher)</span>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">{rec.paymentChannel}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-amber-400 text-[11px] block">PayPal</span>
                          <span className="text-[10px] text-stone-400">+10% Surcharge</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      ฿{rec.grossAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-400/90 text-[11px]">
                      - ฿{rec.gatewayFee.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-emerald-400">
                      ฿{rec.netAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
