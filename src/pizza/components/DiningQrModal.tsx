import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  ExternalLink,
  UtensilsCrossed
} from 'lucide-react';
import { Language } from '../config/languages';
import { I18N_DINING_QR } from '../data/diningQrI18n';
import { formatTableStationName } from '../utils/tableUtils';
import { buildDiningQrUrl } from '../services/diningSessionService';

interface DiningQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableKey: string;
  sessionToken: string;
  lang?: Language;
}

export const DiningQrModal: React.FC<DiningQrModalProps> = ({
  isOpen,
  onClose,
  tableKey,
  sessionToken,
  lang = 'IT'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tableKey) return null;

  const t = I18N_DINING_QR[lang] || I18N_DINING_QR.IT;
  const stationName = formatTableStationName(tableKey, lang);
  const shareUrl = buildDiningQrUrl(tableKey, sessionToken);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareUrl)}&margin=10`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy link failed:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn antialiased"
      style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
    >
      <div className="w-full max-w-lg bg-stone-900 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 relative overflow-hidden space-y-6">
        
        {/* Glow decorations */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/60 shrink-0">
              <Smartphone className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{t.modalTitle}</span>
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi modale QR Code"
            className="w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table & Discount Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-950/80 border border-stone-800 rounded-2xl p-3 px-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              {t.tableCodeLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-red-900/60 border border-red-500/60 text-white font-black text-xs uppercase tracking-wider">
              {stationName}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>-5% SCONTO TAVOLO</span>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-2 relative z-10">
          <div className="p-3 bg-white rounded-3xl shadow-2xl shadow-red-950/60 border-4 border-stone-800 relative group">
            <img 
              src={qrApiUrl} 
              alt={`QR Code ${stationName}`}
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-2xl transition-transform duration-200 group-hover:scale-[1.02]" 
            />
            <div className="absolute inset-0 rounded-2xl border border-stone-300 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 text-stone-400 text-xs max-w-sm leading-relaxed px-2">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t.scanInstructions}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2 border-t border-stone-800 relative z-10">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full bg-stone-800 hover:bg-stone-700 active:bg-stone-600 border border-stone-600/80 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-black">{t.linkCopied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-300" />
                <span>{t.copyLink}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t.liveConnectedNotice} • Scadenza automatica al pagamento</span>
          </div>
        </div>

      </div>
    </div>
  );
};
