import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getDocumentByToken, StoredDocument } from '../lib/documentStore';
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Check, 
  Copy, 
  AlertCircle, 
  Sparkles, 
  Timer, 
  Clock, 
  Layers, 
  Folder, 
  FileCheck, 
  FileSpreadsheet, 
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Share2,
  FileCode,
  Hash
} from 'lucide-react';

const FILE_THEMES = [
  {
    name: 'Red/Crimson',
    gradient: 'from-rose-950/90 via-stone-900 to-stone-900',
    border: 'border-rose-700/70',
    badge: 'bg-rose-900/90 text-rose-200 border-rose-600',
    textAccent: 'text-rose-400',
    pageHeaderBg: 'bg-rose-950/70 border-rose-800/80',
    iconColor: 'text-rose-400'
  },
  {
    name: 'Sky/Blue',
    gradient: 'from-sky-950/90 via-stone-900 to-stone-900',
    border: 'border-sky-600/70',
    badge: 'bg-sky-900/90 text-sky-200 border-sky-500',
    textAccent: 'text-sky-400',
    pageHeaderBg: 'bg-sky-950/70 border-sky-800/80',
    iconColor: 'text-sky-400'
  },
  {
    name: 'Emerald/Green',
    gradient: 'from-emerald-950/90 via-stone-900 to-stone-900',
    border: 'border-emerald-600/70',
    badge: 'bg-emerald-900/90 text-emerald-200 border-emerald-500',
    textAccent: 'text-emerald-400',
    pageHeaderBg: 'bg-emerald-950/70 border-emerald-800/80',
    iconColor: 'text-emerald-400'
  },
  {
    name: 'Amber/Gold',
    gradient: 'from-amber-950/90 via-stone-900 to-stone-900',
    border: 'border-amber-600/70',
    badge: 'bg-amber-900/90 text-amber-200 border-amber-500',
    textAccent: 'text-amber-400',
    pageHeaderBg: 'bg-amber-950/70 border-amber-800/80',
    iconColor: 'text-amber-400'
  },
  {
    name: 'Purple/Violet',
    gradient: 'from-purple-950/90 via-stone-900 to-stone-900',
    border: 'border-purple-600/70',
    badge: 'bg-purple-900/90 text-purple-200 border-purple-500',
    textAccent: 'text-purple-400',
    pageHeaderBg: 'bg-purple-950/70 border-purple-800/80',
    iconColor: 'text-purple-400'
  }
];

export default function DocumentReaderPage() {
  const { token, pageNum } = useParams<{ token: string; pageNum?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doc, setDoc] = useState<StoredDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [copied, setCopied] = useState(false);
  const [remainingTimeStr, setRemainingTimeStr] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  const query = searchParams.get('q') || '';
  const keyParam = searchParams.get('key') || '';
  const currentPage = pageNum ? parseInt(pageNum, 10) : null;

  useEffect(() => {
    async function load() {
      if (!token) {
        setError('Token documento mancante');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const found = await getDocumentByToken(token);
        if (!found) {
          setError('Documento non trovato o rimosso.');
          setLoading(false);
          return;
        }

        if (found.is_active === false) {
          setError('Questo documento è stato temporaneamente disattivato dall\'amministratore.');
          setLoading(false);
          return;
        }

        if (found.expires_at && new Date(found.expires_at).getTime() < Date.now()) {
          setError('La finestra di consultazione temporanea per questo documento è terminata (Scaduto).');
          setLoading(false);
          return;
        }

        if (found.access_key && found.access_key.trim()) {
          if (!keyParam || keyParam.trim() !== found.access_key.trim()) {
            setIsAuthorized(false);
            setDoc(found);
            setLoading(false);
            return;
          }
        }

        setIsAuthorized(true);
        setDoc(found);
      } catch (err: any) {
        setError(err.message || 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, keyParam]);

  // Live Countdown Timer
  useEffect(() => {
    if (!doc?.expires_at) {
      setRemainingTimeStr(null);
      return;
    }

    const updateTimer = () => {
      const diff = new Date(doc.expires_at!).getTime() - Date.now();
      if (diff <= 0) {
        setRemainingTimeStr('Scaduto');
        setError('La finestra di consultazione temporanea per questo documento è terminata (Scaduto).');
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setIsUrgent(diff < 5 * 60 * 1000);

      if (hours > 0) {
        setRemainingTimeStr(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setRemainingTimeStr(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [doc]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc) return;
    if (accessKeyInput.trim() === (doc.access_key || '').trim()) {
      setIsAuthorized(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('key', accessKeyInput.trim());
      setSearchParams(newParams);
    } else {
      alert('Chiave d\'accesso non corretta.');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Smart Content Parser & Formatter:
   * Turns plain flat text into beautiful, structured, readable paragraphs,
   * tables, highlighted key-value items, and distinct headers.
   */
  const renderSmartFormattedContent = (content: string, searchQuery: string) => {
    if (!content || !content.trim()) {
      return <p className="text-stone-500 italic p-4 text-center">[Nessun testo presente in questa pagina]</p>;
    }

    // 1. Check if Excel Tabular format (contains ' | ')
    if (content.includes(' | ')) {
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const titleLine = lines[0].startsWith('=== 📊 FOGLIO:') ? lines[0] : null;
      const dataLines = titleLine ? lines.slice(1) : lines;

      return (
        <div className="space-y-4">
          {titleLine && (
            <div className="text-xs font-black text-emerald-300 bg-emerald-950/80 border border-emerald-600 px-3.5 py-1.5 rounded-xl inline-flex items-center gap-2 shadow-sm">
              <FileSpreadsheet size={15} />
              <span>{titleLine.replace(/[=]/g, '').trim()}</span>
            </div>
          )}
          <div className="overflow-x-auto border border-stone-700/80 rounded-2xl bg-stone-950/90 shadow-inner">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <tbody>
                {dataLines.map((line, rIdx) => {
                  const cells = line.split(' | ').map((c) => c.trim());
                  const isHeaderRow = rIdx === 0;
                  return (
                    <tr 
                      key={rIdx} 
                      className={`border-b border-stone-800 transition-colors ${
                        isHeaderRow 
                          ? 'bg-stone-850 font-extrabold text-stone-100 border-b-2 border-stone-600' 
                          : rIdx % 2 === 0 ? 'bg-stone-950 hover:bg-stone-900/80' : 'bg-stone-900/40 hover:bg-stone-900/80'
                      }`}
                    >
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-3 whitespace-pre border-r border-stone-800/80 last:border-r-0 text-stone-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 2. Structured Document Text Parsing (PDF, Word, TXT)
    const rawLines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = (key: number) => {
      if (currentParagraph.length === 0) return null;
      const text = currentParagraph.join(' ').trim();
      currentParagraph = [];
      if (!text) return null;

      // Key-Value badge formatting (e.g. "Ref: 698500215000400" or "วันที่: ...")
      if (text.includes(':') && text.length < 140 && !text.includes('\n')) {
        const parts = text.split(':');
        const label = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        if (label.length > 1 && label.length < 40 && value.length > 0) {
          return (
            <div key={key} className="bg-stone-950/80 border border-stone-800 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-sm">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{label}</span>
              <span className="text-sm font-semibold text-white font-mono">{value}</span>
            </div>
          );
        }
      }

      return (
        <p key={key} className="text-stone-200 text-sm sm:text-base leading-relaxed font-sans select-text">
          {text}
        </p>
      );
    };

    rawLines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        const p = flushParagraph(index);
        if (p) elements.push(p);
        return;
      }

      // Check for prominent Headings / Numbered Articles (e.g. "1. ข้อความ...", "หมวดที่ 1", "Art. 1", "CONTRATTO...")
      const isNumberedItem = /^[0-9]+[.)]\s+/.test(trimmed) || /^(ข้อ|หมวด|มาตรา|Art\.|Sezione)\s+[0-9]+/i.test(trimmed);
      const isUppercaseHeader = trimmed.length < 90 && trimmed === trimmed.toUpperCase() && /[A-ZÀ-ÿ\u0E00-\u0E7F]/.test(trimmed);

      if (isNumberedItem) {
        const p = flushParagraph(index);
        if (p) elements.push(p);

        elements.push(
          <div key={`item-${index}`} className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80 shadow-sm my-2">
            <div className="w-6 h-6 rounded-lg bg-stone-800 text-stone-300 border border-stone-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              <Hash size={13} className="text-[#f87171]" />
            </div>
            <div className="text-sm sm:text-base text-stone-200 font-medium leading-relaxed select-text flex-1">
              {trimmed}
            </div>
          </div>
        );
        return;
      }

      if (isUppercaseHeader) {
        const p = flushParagraph(index);
        if (p) elements.push(p);

        elements.push(
          <h3 key={`h-${index}`} className="text-base sm:text-lg font-black text-white tracking-wide border-l-4 border-[#8B1E1E] pl-3 py-1 my-3 bg-stone-950/40 rounded-r-xl">
            {trimmed}
          </h3>
        );
        return;
      }

      currentParagraph.push(trimmed);
    });

    const lastP = flushParagraph(rawLines.length + 100);
    if (lastP) elements.push(lastP);

    return <div className="space-y-3">{elements}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-stone-700 border-t-[#8B1E1E] rounded-full animate-spin mx-auto" />
          <p className="text-stone-400 text-sm font-medium">Caricamento mini-sito web in corso...</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold">Accesso Non Disponibile</h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <Lock size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Documento Protetto</h2>
            <p className="text-stone-400 text-xs mt-1.5">Questo documento richiede una chiave di sicurezza per essere consultato.</p>
          </div>
          <form onSubmit={handleKeySubmit} className="space-y-3">
            <input
              type="password"
              value={accessKeyInput}
              onChange={(e) => setAccessKeyInput(e.target.value)}
              placeholder="Inserisci la chiave d'accesso..."
              className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8B1E1E]"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full bg-[#8B1E1E] hover:bg-[#721818] text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer"
            >
              Sblocca Documento
            </button>
          </form>
        </div>
      </div>
    );
  }

  const allPages = doc.pages || [];
  let visiblePages = allPages;
  if (currentPage !== null) {
    visiblePages = allPages.filter((p) => p.pageNumber === currentPage);
    if (visiblePages.length === 0 && allPages.length > 0) {
      visiblePages = [allPages[0]];
    }
  }

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    visiblePages = visiblePages.filter((p) => (p.textContent || '').toLowerCase().includes(q));
  }

  // Calculate distinct source files
  const sourceFilesList: any[] = (doc.metadata as any)?.sourceFiles || [];
  const totalFilesCount = Math.max(
    sourceFilesList.length,
    Math.max(...allPages.map((p) => (p as any).sourceFileIndex || 1), 1)
  );

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-stone-100 antialiased font-sans pb-20">
      {/* Top Navbar */}
      <nav className="border-b border-stone-800 bg-stone-900/95 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5 shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B1E1E] to-[#b91c1c] text-white font-black text-sm flex items-center justify-center shadow-lg">
              FP
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight block">Flower Power Reader</span>
              <span className="text-[10px] text-stone-400 font-semibold block -mt-0.5">Document Viewer & LLM Mini-Site</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyUrl}
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Link Copiato!' : 'Copia Link'}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Countdown Banner if set */}
        {remainingTimeStr && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold transition-all shadow-xl ${
            isUrgent
              ? 'bg-rose-950/90 border-rose-600 text-rose-100 animate-pulse'
              : 'bg-amber-950/80 border-amber-600 text-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-black/40 border border-amber-600/40">
                <Timer size={18} className={isUrgent ? 'text-rose-400' : 'text-amber-400'} />
              </div>
              <div>
                <span className="block font-black text-white text-sm">Disponibilità Temporanea Attiva</span>
                <span className="text-[11px] opacity-90">Questo mini-sito scadrà automaticamente tra <strong>{remainingTimeStr}</strong></span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider px-3 py-1 bg-black/50 rounded-lg border border-amber-700/60 font-black">
              AUTO-CHIUDI
            </span>
          </div>
        )}

        {/* HERO MINI-SITE HEADER */}
        <header className="bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border-2 border-stone-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#8B1E1E] text-white text-xs font-extrabold uppercase px-3 py-1 rounded-xl tracking-wider shadow">
                {doc.file_type === 'bundle' ? 'RACCOLTA MULTI-FILE' : doc.file_type.toUpperCase()}
              </span>
              <span className="bg-stone-800 text-stone-200 border border-stone-700 text-xs font-bold uppercase px-3 py-1 rounded-xl flex items-center gap-1.5">
                <Layers size={13} className="text-sky-400" />
                <span>{doc.total_pages} {doc.total_pages === 1 ? 'PAGINA' : 'PAGINE TOTALI'}</span>
              </span>
              {totalFilesCount > 1 && (
                <span className="bg-sky-950 text-sky-200 border border-sky-600 text-xs font-black uppercase px-3 py-1 rounded-xl flex items-center gap-1.5 shadow">
                  <Folder size={13} className="text-sky-400" />
                  <span>{totalFilesCount} FILE UNITI NEL LINK</span>
                </span>
              )}
              {doc.metadata?.hasOcrPages && (
                <span className="bg-amber-950 text-amber-300 border border-amber-700 text-xs font-bold uppercase px-3 py-1 rounded-xl flex items-center gap-1">
                  <Sparkles size={13} />
                  <span>OCR ATTIVO</span>
                </span>
              )}
            </div>

            {/* Main Title (Identificativo Web) */}
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {doc.title}
            </h1>

            {/* Original File Info Bar */}
            <div className="p-3.5 bg-stone-950/90 rounded-2xl border border-stone-800 text-xs text-stone-300 flex flex-wrap items-center gap-3">
              <span className="font-bold text-stone-400 flex items-center gap-1.5">
                <FileText size={14} className="text-[#f87171]" />
                <span>File originale:</span>
              </span>
              <strong className="text-white font-mono bg-stone-900 px-2.5 py-0.5 rounded-lg border border-stone-800 truncate max-w-md">
                {doc.file_name}
              </strong>
              <span>·</span>
              <span>{(doc.file_size_bytes / 1024).toFixed(0)} KB</span>
              <span>·</span>
              <span>Generato il {new Date(doc.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>

            {/* MULTI-FILE DIRECT JUMP BAR */}
            {sourceFilesList.length > 1 && (
              <div className="bg-gradient-to-r from-sky-950/60 to-stone-950 p-4 rounded-2xl border border-sky-800/80 space-y-2.5">
                <p className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-2">
                  <Folder size={14} className="text-sky-400" />
                  <span>Documenti Inclusi in questo Link (Clicca per saltare):</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sourceFilesList.map((sf: any, sfIdx: number) => {
                    const theme = FILE_THEMES[sfIdx % FILE_THEMES.length];
                    return (
                      <a
                        key={sf.index}
                        href={`#file-section-${sf.index}`}
                        className="bg-stone-900 hover:bg-stone-850 border border-stone-700 hover:border-sky-400 p-3 rounded-xl flex items-center justify-between transition-all group shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-6 h-6 rounded-lg ${theme.badge} text-xs font-black flex items-center justify-center shrink-0 shadow`}>
                            #{sf.index}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs text-stone-200 group-hover:text-white font-bold truncate">{sf.fileName}</p>
                            <p className="text-[10px] text-stone-400">{sf.totalPages} pagine</p>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-stone-500 group-hover:text-sky-400 transition-colors shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xl">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('q', e.target.value);
                else newParams.delete('q');
                setSearchParams(newParams);
              }}
              placeholder="Cerca parole o codici nel documento..."
              className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#8B1E1E]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentPage !== null ? (
              <Link
                to={`/read/${token}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ''}`}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-stone-700"
              >
                ← Torna a Vista Completa ({doc.total_pages} pag.)
              </Link>
            ) : (
              <span className="text-stone-300 text-xs font-bold px-3 py-1.5 bg-stone-950 rounded-xl border border-stone-800">
                Vista Completa ({doc.total_pages} pag.)
              </span>
            )}
          </div>
        </div>

        {/* QUICK PAGE BUTTONS (TOC) */}
        {doc.total_pages > 1 && (
          <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-stone-400">
              <span className="flex items-center gap-1.5">
                <Bookmark size={13} className="text-[#f87171]" />
                <span>Salto Rapido Pagina:</span>
              </span>
              {totalFilesCount > 1 && (
                <span className="text-sky-400 text-xs font-semibold">{totalFilesCount} File inclusi</span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              {allPages.map((p, idx) => {
                const active = currentPage === p.pageNumber;
                const fileIdx = (p as any).sourceFileIndex || 1;
                const prevFileIdx = idx > 0 ? ((allPages[idx - 1] as any).sourceFileIndex || 1) : null;
                const isNewFileStart = idx === 0 || fileIdx !== prevFileIdx;
                const theme = FILE_THEMES[(fileIdx - 1) % FILE_THEMES.length];

                return (
                  <React.Fragment key={p.pageNumber}>
                    {isNewFileStart && totalFilesCount > 1 && (
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${theme.badge} ml-2 first:ml-0 shadow-sm`}>
                        FILE #{fileIdx}
                      </span>
                    )}
                    <Link
                      to={`/read/${token}/page/${p.pageNumber}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ''}`}
                      className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#8B1E1E] text-white shadow-lg scale-110 border-2 border-white/40'
                          : 'bg-stone-950 border border-stone-700 text-stone-200 hover:bg-stone-800 hover:text-white'
                      }`}
                      title={`Pagina ${p.pageNumber} (${(p as any).sourceFileName || 'File #' + fileIdx})`}
                    >
                      {p.pageNumber}
                    </Link>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* PAGES MAIN CONTAINER */}
        <main className="space-y-8">
          {visiblePages.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-2">
              <p className="text-base font-bold text-white">Nessun risultato trovato</p>
              <p className="text-stone-400 text-xs">Nessun testo corrisponde alla ricerca specificata.</p>
            </div>
          ) : (
            visiblePages.map((page, idx) => {
              const fileIdx = (page as any).sourceFileIndex || 1;
              const fileName = (page as any).sourceFileName || doc.file_name;
              const pageInThisFile = (page as any).sourcePageNumber || page.pageNumber;
              const prevPageFileIdx = idx > 0 ? ((visiblePages[idx - 1] as any).sourceFileIndex || 1) : null;
              const isFirstPageOfFile = (currentPage === null && (idx === 0 || fileIdx !== prevPageFileIdx));
              const theme = FILE_THEMES[(fileIdx - 1) % FILE_THEMES.length];

              return (
                <div key={page.pageNumber} id={`page-${page.pageNumber}`} className="space-y-4">
                  {/* PROMINENT FILE DIVIDER BANNER */}
                  {isFirstPageOfFile && totalFilesCount > 1 && (
                    <div 
                      id={`file-section-${fileIdx}`} 
                      className={`bg-gradient-to-r ${theme.gradient} border-2 ${theme.border} rounded-3xl p-5 sm:p-6 flex items-center justify-between gap-4 shadow-2xl mt-12 first:mt-0`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-stone-950/80 border border-white/20 flex items-center justify-center text-white font-black text-base shadow-inner shrink-0">
                          #{fileIdx}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white uppercase tracking-wider">
                              DOCUMENTO #{fileIdx} NEL LINK
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${theme.badge}`}>
                              FILE #{fileIdx}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-white font-black truncate mt-1">
                            {fileName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAGE CARD */}
                  <article
                    className={`bg-stone-900 border-2 ${totalFilesCount > 1 ? theme.border : 'border-stone-700'} rounded-3xl shadow-2xl overflow-hidden`}
                  >
                    {/* Page Card Header Bar */}
                    <div className={`${theme.pageHeaderBg} border-b border-stone-800 px-6 py-4 flex items-center justify-between text-xs font-bold text-stone-200`}>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase shadow-sm ${theme.badge}`}>
                          FILE #{fileIdx}
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          Pagina {page.pageNumber} di {doc.total_pages}
                          {totalFilesCount > 1 && pageInThisFile ? ` · (Pag. ${pageInThisFile} del Documento #${fileIdx})` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {page.hasOcr ? (
                          <span className="bg-amber-950/80 text-amber-300 border border-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Sparkles size={11} />
                            <span>OCR ({page.ocrLang || 'ita+eng+tha'})</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px] font-semibold">Testo Diretto</span>
                        )}
                      </div>
                    </div>

                    {/* Page Card Body */}
                    <div className="p-6 sm:p-8 bg-stone-900/95">
                      {renderSmartFormattedContent(page.textContent, query)}
                    </div>
                  </article>
                </div>
              );
            })
          )}
        </main>

        {/* Pagination navigation footer */}
        {currentPage !== null && doc.total_pages > 1 && (
          <footer className="flex justify-center gap-3 mt-8">
            {currentPage > 1 && (
              <Link
                to={`/read/${token}/page/${currentPage - 1}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ''}`}
                className="bg-stone-900 border border-stone-700 hover:bg-stone-800 text-stone-200 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
              >
                <ArrowLeft size={15} />
                <span>Pagina Precedente</span>
              </Link>
            )}
            {currentPage < doc.total_pages && (
              <Link
                to={`/read/${token}/page/${currentPage + 1}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ''}`}
                className="bg-[#8B1E1E] hover:bg-[#721818] text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-xl"
              >
                <span>Pagina Successiva</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
