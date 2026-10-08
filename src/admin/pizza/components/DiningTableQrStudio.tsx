import React, { useState } from 'react';
import { 
  QrCode, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Smartphone, 
  UtensilsCrossed, 
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { DINING_TABLES, formatTableStationName, getCanonicalTableKey } from '../../../pizza/utils/tableUtils';
import { buildDiningQrUrl } from '../../../pizza/services/diningSessionService';

interface DiningTableQrStudioProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'modal' | 'embedded';
}

export const DiningTableQrStudio: React.FC<DiningTableQrStudioProps> = ({
  isOpen = true,
  onClose,
  variant = 'modal'
}) => {
  const [selectedTable, setSelectedTable] = useState<string>('Tavolo 1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (variant === 'modal' && !isOpen) return null;

  const getQrUrlForTable = (table: string) => {
    const canonical = getCanonicalTableKey(table);
    // Build permanent direct URL for this table
    return buildDiningQrUrl(canonical, 'permanent_table_qr');
  };

  const getQrImageForTable = (table: string, size: number = 320) => {
    const url = getQrUrlForTable(table);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=10`;
  };

  const handleCopyLink = async (table: string) => {
    const url = getQrUrlForTable(table);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedKey(table);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.warn('Copy link failed:', err);
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  const content = (
    <div className="space-y-6 select-none font-sans antialiased text-stone-100">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-950/60 shrink-0">
            <QrCode className="w-6 h-6 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                16 QR CODE FISICI DA TAVOLO
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase shadow-xs">
                Permanent Table Bound
              </span>
            </div>
            <p className="text-xs text-stone-400 font-medium">
              Stampa e posiziona 1 QR Code unico per ciascun tavolo del ristorante
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintAll}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            <span>Stampa 16 QR Code (Schede)</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-stone-800 flex items-center gap-3">
          <Smartphone className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="text-xs">
            <strong className="text-white block font-black">Zero Login & Riconoscimento Lingua</strong>
            <span className="text-stone-400">Si apre nella lingua del telefono (Birmano, TH, EN, DE, IT).</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-stone-800 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <strong className="text-white block font-black">Carrello Condiviso Live a 0ms</strong>
            <span className="text-stone-400">Tutti i commensali dello stesso tavolo vedono lo stesso carrello.</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-stone-800 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
          <div className="text-xs">
            <strong className="text-white block font-black">Disabilitazione Realtime su Tablet</strong>
            <span className="text-stone-400">Il tavolo sul Dining Tablet si colora di rosso/occupato all'istante.</span>
          </div>
        </div>
      </div>

      {/* Grid of all 16 Physical Table QR Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[62vh] overflow-y-auto pr-1">
        {DINING_TABLES.map((table, idx) => {
          const canonical = getCanonicalTableKey(table);
          const qrUrl = getQrUrlForTable(table);
          const qrImg = getQrImageForTable(table, 260);
          const isCopied = copiedKey === table;

          return (
            <div 
              key={canonical}
              className="bg-[#11141c] border-2 border-stone-800 hover:border-amber-400/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-3 transition-all relative group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <h3 className="font-black text-white text-sm uppercase tracking-tight truncate">
                    {table}
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-md">
                  -5% Tavolo
                </span>
              </div>

              {/* QR Image Box */}
              <div className="p-3 bg-white rounded-2xl shadow-inner border-2 border-stone-700 flex flex-col items-center justify-center">
                <img 
                  src={qrImg} 
                  alt={`QR ${table}`} 
                  className="w-36 h-36 object-contain rounded-lg"
                />
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-black text-stone-950 uppercase block leading-tight">
                    FLOWER POWER PIZZA
                  </span>
                  <span className="text-[9.5px] font-bold text-stone-600 block">
                    Inquadra per ordinare • -5% Sconto
                  </span>
                </div>
              </div>

              {/* Actions for this table */}
              <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => handleCopyLink(table)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copia link diretto tavolo"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>Copia Link</span>
                    </>
                  )}
                </button>

                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-blue-950/80 hover:bg-blue-800 text-blue-300 hover:text-white border border-blue-600/40 flex items-center justify-center transition-colors cursor-pointer"
                  title="Apri e prova come smartphone"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );

  if (variant === 'embedded') {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#161b26] border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 max-w-5xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
