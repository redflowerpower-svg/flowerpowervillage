import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  Lock, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  FileSpreadsheet, 
  Image as ImageIcon,
  FolderOpen,
  PlusCircle,
  Plus,
  Minus,
  Timer,
  Calendar,
  Layers,
  X,
  Link as LinkIcon,
  Files,
  Edit2,
  Tag,
  Bot
} from 'lucide-react';
import { 
  uploadAndProcessDocument, 
  uploadAndMergeMultipleDocuments,
  appendFilesToDocument,
  updateDocumentExpiration,
  updateDocumentTitle,
  listStoredDocuments, 
  toggleDocumentActive, 
  deleteStoredDocument, 
  StoredDocument 
} from '../../lib/documentStore';

interface UploadQueueItem {
  id: string;
  files: File[];
  isMergeBatch: boolean;
  status: 'pending' | 'parsing' | 'extracting' | 'ocr' | 'completed' | 'error';
  percentage: number;
  message: string;
  doc?: StoredDocument;
  error?: string;
}

export default function DocumentReaderStudio() {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Upload State
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [mergeIntoSingleLink, setMergeIntoSingleLink] = useState<boolean>(true);
  const [customBundleTitle, setCustomBundleTitle] = useState('');
  const [forceVisionMode, setForceVisionMode] = useState<boolean>(true);
  
  // Expiration State: mode 'minutes' | 'datetime' | 'none'
  const [expirationMode, setExpirationMode] = useState<'minutes' | 'datetime' | 'none'>('minutes');
  const [countdownMinutes, setCountdownMinutes] = useState<number>(30);
  const [customDateTime, setCustomDateTime] = useState('');
  
  // Append / Expand state
  const [appendingToken, setAppendingToken] = useState<string | null>(null);
  const [appendProgress, setAppendProgress] = useState<{ percentage: number; message: string } | null>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Expiration Modal state
  const [editingExpDoc, setEditingExpDoc] = useState<StoredDocument | null>(null);
  const [editExpMinutes, setEditExpMinutes] = useState<number>(30);

  // Edit Title Modal state
  const [editingTitleDoc, setEditingTitleDoc] = useState<StoredDocument | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live countdown clock ticker for historical list
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const list = await listStoredDocuments();
      setDocuments(list);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateExpirationTimestamp = (): string | undefined => {
    if (expirationMode === 'none') return undefined;
    if (expirationMode === 'minutes') {
      if (!countdownMinutes || countdownMinutes <= 0) return undefined;
      const expireDate = new Date(Date.now() + countdownMinutes * 60 * 1000);
      return expireDate.toISOString();
    }
    if (expirationMode === 'datetime') {
      if (!customDateTime) return undefined;
      return new Date(customDateTime).toISOString();
    }
    return undefined;
  };

  const handleFilesSelected = (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    if (mergeIntoSingleLink && files.length > 1) {
      const newBatchItem: UploadQueueItem = {
        id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        files,
        isMergeBatch: true,
        status: 'pending',
        percentage: 0,
        message: `In attesa di unire ${files.length} file in un unico link...`
      };
      setQueue((prev) => [...prev, newBatchItem]);
    } else {
      const newItems: UploadQueueItem[] = files.map((f) => ({
        id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        files: [f],
        isMergeBatch: false,
        status: 'pending',
        percentage: 0,
        message: 'In attesa di elaborazione...'
      }));
      setQueue((prev) => [...prev, ...newItems]);
    }
  };

  // Process queue sequentially
  useEffect(() => {
    const processQueue = async () => {
      const nextItem = queue.find((q) => q.status === 'pending');
      if (!nextItem || isProcessing) return;

      setIsProcessing(true);

      const updateItem = (updates: Partial<UploadQueueItem>) => {
        setQueue((prev) => prev.map((q) => (q.id === nextItem.id ? { ...q, ...updates } : q)));
      };

      try {
        updateItem({ status: 'parsing', percentage: 10, message: 'Inizializzazione...' });

        const calculatedExpiresAt = calculateExpirationTimestamp();
        let doc: StoredDocument;

        if (nextItem.isMergeBatch && nextItem.files.length > 1) {
          doc = await uploadAndMergeMultipleDocuments(
            nextItem.files,
            {
              customTitle: customBundleTitle.trim() || undefined,
              accessKey: accessKey.trim() || undefined,
              expiresAt: calculatedExpiresAt,
              forceVision: forceVisionMode
            },
            (prog) => {
              updateItem({
                status: prog.status as any,
                percentage: prog.percentage,
                message: prog.message
              });
            }
          );
        } else {
          doc = await uploadAndProcessDocument(
            nextItem.files[0],
            {
              accessKey: accessKey.trim() || undefined,
              expiresAt: calculatedExpiresAt,
              forceVision: forceVisionMode
            },
            (prog) => {
              updateItem({
                status: prog.status as any,
                percentage: prog.percentage,
                message: prog.message
              });
            }
          );

          if (customBundleTitle.trim()) {
            await updateDocumentTitle(doc.token, customBundleTitle.trim());
            doc.title = customBundleTitle.trim();
          }
        }

        updateItem({
          status: 'completed',
          percentage: 100,
          message: nextItem.isMergeBatch 
            ? `Creato Unico Link con ${nextItem.files.length} file (${doc.total_pages} pag.)!` 
            : 'Elaborato con successo!',
          doc
        });

        // Reset custom title input for next upload
        setCustomBundleTitle('');
        loadDocuments();
      } catch (err: any) {
        console.error('Processing error:', err);
        updateItem({
          status: 'error',
          percentage: 100,
          message: err.message || 'Errore elaborazione',
          error: err.message
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processQueue();
  }, [queue, isProcessing, accessKey, expirationMode, countdownMinutes, customDateTime, customBundleTitle]);

  // Handle Append / Expand Files
  const handleAppendFiles = async (files: FileList | File[]) => {
    if (!appendingToken || files.length === 0) return;

    setAppendProgress({ percentage: 10, message: 'Avvio estrazione file aggiuntivi...' });

    try {
      const updated = await appendFilesToDocument(
        appendingToken,
        Array.from(files),
        (prog) => {
          setAppendProgress({
            percentage: prog.percentage,
            message: prog.message
          });
        }
      );

      setDocuments((prev) => prev.map((d) => (d.token === appendingToken ? updated : d)));
      setTimeout(() => {
        setAppendingToken(null);
        setAppendProgress(null);
      }, 1500);
    } catch (err: any) {
      alert(`Errore durante l'aggiunta file: ${err.message}`);
      setAppendProgress(null);
    }
  };

  const handleCopyLink = (token: string, key?: string | null) => {
    const origin = window.location.origin;
    const keyParam = key ? `?key=${encodeURIComponent(key)}` : '';
    const fullUrl = `${origin}/read/${token}${keyParam}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleToggleActive = async (token: string, currentActive: boolean) => {
    try {
      await toggleDocumentActive(token, !currentActive);
      setDocuments((prev) =>
        prev.map((d) => (d.token === token ? { ...d, is_active: !currentActive } : d))
      );
    } catch (err) {
      alert('Errore nella modifica dello stato.');
    }
  };

  const handleDelete = async (token: string, title: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare definitivamente il documento "${title}"?\nTutte le pagine e i file estratti verranno cancellati.`)) {
      return;
    }
    try {
      await deleteStoredDocument(token);
      setDocuments((prev) => prev.filter((d) => d.token !== token));
    } catch (err) {
      alert('Errore durante l\'eliminazione.');
    }
  };

  const handleSaveEditedExpiration = async () => {
    if (!editingExpDoc) return;
    let newExpiresAt: string | null = null;
    if (editExpMinutes > 0) {
      newExpiresAt = new Date(Date.now() + editExpMinutes * 60 * 1000).toISOString();
    }
    await updateDocumentExpiration(editingExpDoc.token, newExpiresAt);
    setDocuments((prev) =>
      prev.map((d) => (d.token === editingExpDoc.token ? { ...d, expires_at: newExpiresAt } : d))
    );
    setEditingExpDoc(null);
  };

  const handleSaveEditedTitle = async () => {
    if (!editingTitleDoc || !newTitleInput.trim()) return;
    await updateDocumentTitle(editingTitleDoc.token, newTitleInput.trim());
    setDocuments((prev) =>
      prev.map((d) => (d.token === editingTitleDoc.token ? { ...d, title: newTitleInput.trim() } : d))
    );
    setEditingTitleDoc(null);
  };

  const getRemainingTimeBadge = (expiresAt?: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-950 text-red-400 border border-red-800/60 rounded flex items-center gap-1">
          <Clock size={11} />
          <span>Scaduto</span>
        </span>
      );
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let timeStr = '';
    if (hours > 0) timeStr = `${hours}h ${minutes}m`;
    else if (minutes > 0) timeStr = `${minutes}m ${seconds}s`;
    else timeStr = `${seconds}s`;

    const isUrgent = diff < 10 * 60 * 1000; // < 10 min

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
        isUrgent
          ? 'bg-amber-950/80 text-amber-300 border-amber-700/80 animate-pulse'
          : 'bg-stone-900 text-stone-300 border-stone-700'
      }`}>
        <Timer size={11} className={isUrgent ? 'text-amber-400' : 'text-stone-400'} />
        <span>Scade tra: <strong>{timeStr}</strong></span>
      </span>
    );
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.file_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.token.includes(searchQuery);

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'ocr') return matchesSearch && doc.metadata?.hasOcrPages;
    if (filterType === 'excel') return matchesSearch && (doc.file_type === 'excel' || doc.file_name.endsWith('.xlsx') || doc.file_name.endsWith('.xls'));
    if (filterType === 'bundle') return matchesSearch && (doc.file_type === 'bundle' || ((doc.metadata as any)?.sourceFiles?.length > 1));
    return matchesSearch && doc.file_type === filterType;
  });

  const getFileIcon = (type: string, fileName?: string) => {
    const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
    if (type === 'bundle') return <Layers className="text-sky-400" size={18} />;
    if (type === 'excel' || ['xlsx', 'xls', 'ods', 'csv'].includes(ext)) return <FileSpreadsheet className="text-emerald-400" size={18} />;
    if (['docx', 'doc'].includes(ext) || type === 'docx') return <FileCheck className="text-blue-400" size={18} />;
    if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext) || type === 'image') return <ImageIcon className="text-amber-400" size={18} />;
    return <FileText className="text-red-400" size={18} />;
  };

  return (
    <div className="space-y-8 animate-fadeIn text-stone-100 font-sans">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B1E1E]/20 border border-[#8B1E1E]/40 text-[#f87171] rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Document & PDF Web Reader (LLM & Mini-Site Generator)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Conversione Documenti in Mini-Siti Web
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Trasforma PDF, fogli Excel, contratti e immagini in un <strong>mini-sito web strutturato</strong> comprensibile da umani e modelli LLM. Rinomina i documenti, unisci più file in un unico link e gestisci scadenze in tempo reale.
          </p>
        </div>
      </div>

      {/* Upload Zone & Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag & Drop Card */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Upload size={16} className="text-[#8B1E1E]" />
              <span>Caricamento Documenti & Fogli di Calcolo</span>
            </h3>
            <span className="text-[11px] text-stone-400 font-bold bg-stone-950 px-2.5 py-0.5 rounded-lg border border-stone-800">
              PDF, EXCEL (.xlsx), Word, TXT, CSV, Immagini
            </span>
          </div>

          {/* Custom Document Title Input during upload */}
          <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl space-y-1.5">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <Tag size={13} className="text-[#f87171]" />
              <span>Nome / Titolo Personalizzato del Documento (Opzionale)</span>
            </label>
            <input
              type="text"
              value={customBundleTitle}
              onChange={(e) => setCustomBundleTitle(e.target.value)}
              placeholder="Es. Certificato Società 2026, Contratto Affitto, Listino Prezzi..."
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-stone-600 outline-none focus:border-[#8B1E1E] font-medium"
            />
            <p className="text-[10px] text-stone-500">
              Se inserito, questo titolo apparirà come intestazione del mini-sito e nello storico.
            </p>
          </div>

          {/* Merge Mode Toggle Banner - ALWAYS ON BY DEFAULT */}
          <div 
            onClick={() => setMergeIntoSingleLink(!mergeIntoSingleLink)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none ${
              mergeIntoSingleLink 
                ? 'bg-sky-950/70 border-sky-600/80 shadow-md' 
                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                mergeIntoSingleLink ? 'bg-sky-600 text-white border-sky-400 shadow-inner' : 'bg-stone-900 text-stone-500 border-stone-800'
              }`}>
                {mergeIntoSingleLink ? <Check size={18} className="stroke-[3]" /> : <Files size={18} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {mergeIntoSingleLink ? '✓ Unione File Multipli: ATTIVA (Default)' : '⚪ Link Separati per ciascun file'}
                  </span>
                  {mergeIntoSingleLink && (
                    <span className="text-[10px] bg-sky-900 text-sky-200 border border-sky-500/80 px-2 py-0.5 rounded-md font-bold">
                      Predefinito
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                  {mergeIntoSingleLink
                    ? 'I file selezionati verranno uniti in 1 unico link. (Clicca qui se invece vuoi creare link separati).'
                    : 'Ogni file genererà un link indipendente. (Clicca qui per riattivare l\'unione automatica).'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center self-end sm:self-center">
              <div className={`w-12 h-6 rounded-full p-0.5 transition-colors border ${
                mergeIntoSingleLink ? 'bg-sky-600 border-sky-400' : 'bg-stone-800 border-stone-700'
              }`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  mergeIntoSingleLink ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </div>

            {/* Gemini Vision AI Toggle */}
            <div 
              onClick={() => setForceVisionMode(!forceVisionMode)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                forceVisionMode 
                  ? 'bg-emerald-950/40 border-emerald-600/60 shadow-sm shadow-emerald-950/50' 
                  : 'bg-stone-950/40 border-stone-800 text-stone-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  forceVisionMode ? 'bg-emerald-800 text-white' : 'bg-stone-800 text-stone-400'
                }`}>
                  ✨
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Scansione Avanzata Gemini Vision AI</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">Attivo</span>
                  </p>
                  <p className="text-[10px] text-stone-400">OCR ad alta precisione per contratti complessi, timbri e lingua Thailandese</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full border transition-colors flex items-center p-0.5 ${
                forceVisionMode ? 'bg-emerald-600 border-emerald-400' : 'bg-stone-800 border-stone-700'
              }`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  forceVisionMode ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFilesSelected(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              dragOver
                ? 'border-[#8B1E1E] bg-[#8B1E1E]/10 scale-[1.01]'
                : 'border-stone-700/80 bg-stone-950/60 hover:border-stone-500 hover:bg-stone-950'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf,.docx,.doc,.xlsx,.xls,.ods,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilesSelected(e.target.files);
                }
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-stone-850 border border-stone-700 flex items-center justify-center text-stone-300 shadow-inner group-hover:scale-110 transition-transform">
              <FolderOpen size={24} className="text-[#f87171]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Trascina qui <span className="text-[#f87171] underline underline-offset-4">uno o più file contemporaneamente</span>
              </p>
              <p className="text-stone-500 text-xs mt-1">
                Supporta selezione multipla su PC e Smartphone (PDF, Excel, Word, Immagini)
              </p>
            </div>
          </div>
        </div>

        {/* Security & Expiration Settings Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Timer size={16} className="text-amber-500" />
              <span>Scadenza & Protezione</span>
            </h3>

            {/* Expiration Mode Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center justify-between">
                <span>Conto alla Rovescia / Scadenza</span>
                {expirationMode === 'minutes' && (
                  <span className="text-amber-400 text-[11px] lowercase">
                    ~ alle {new Date(Date.now() + countdownMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </label>

              {/* Mode Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 mb-2.5">
                <button
                  type="button"
                  onClick={() => setExpirationMode('minutes')}
                  className={`py-1 rounded-lg text-[11px] font-bold transition-all ${
                    expirationMode === 'minutes'
                      ? 'bg-[#8B1E1E] text-white shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Minuti (Timer)
                </button>
                <button
                  type="button"
                  onClick={() => setExpirationMode('datetime')}
                  className={`py-1 rounded-lg text-[11px] font-bold transition-all ${
                    expirationMode === 'datetime'
                      ? 'bg-[#8B1E1E] text-white shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Data Fissa
                </button>
                <button
                  type="button"
                  onClick={() => setExpirationMode('none')}
                  className={`py-1 rounded-lg text-[11px] font-bold transition-all ${
                    expirationMode === 'none'
                      ? 'bg-[#8B1E1E] text-white shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Nessuna
                </button>
              </div>

              {/* Minutes countdown controller */}
              {expirationMode === 'minutes' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCountdownMinutes((m) => Math.max(1, m - 5))}
                      className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-black transition-all cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min="1"
                        max="10080"
                        value={countdownMinutes}
                        onChange={(e) => setCountdownMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-center text-xs font-bold text-white outline-none focus:border-[#8B1E1E]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-500 font-semibold pointer-events-none">
                        min
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCountdownMinutes((m) => m + 5)}
                      className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-black transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[10, 15, 30, 60, 120, 1440].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setCountdownMinutes(mins)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          countdownMinutes === mins
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                        }`}
                      >
                        {mins < 60 ? `${mins}m` : mins === 60 ? '1 ora' : mins === 120 ? '2 ore' : '24 ore'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Datetime selector */}
              {expirationMode === 'datetime' && (
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#8B1E1E]"
                />
              )}
            </div>

            {/* Access Key */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Chiave d'Accesso Segreta (Opzionale)
              </label>
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Es. password123 (opzionale)"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder:text-stone-600 outline-none focus:border-[#8B1E1E]"
              />
            </div>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 text-[10px] text-stone-400 flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            <span>Protezione anti-crawler <code>noindex, nofollow</code> sempre inclusa.</span>
          </div>
        </div>
      </div>

      {/* Upload Queue Progress */}
      {queue.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <RefreshCw size={15} className={`text-sky-400 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Coda di Elaborazione ({queue.length})</span>
            </h3>
            <button
              onClick={() => setQueue([])}
              className="text-stone-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              Pulisci Coda
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 shrink-0">
                    {item.isMergeBatch ? (
                      <Layers className="text-sky-400" size={18} />
                    ) : (
                      getFileIcon(item.files[0].name.split('.').pop() || 'file', item.files[0].name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {item.isMergeBatch
                        ? `${item.files.length} File Uniti: ${item.files.map((f) => f.name).join(', ')}`
                        : item.files[0].name}
                    </p>
                    <p className="text-[11px] text-stone-400">{item.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status === 'completed' && item.doc && (
                    <button
                      onClick={() => handleCopyLink(item.doc!.token, item.doc!.access_key)}
                      className="bg-[#8B1E1E] hover:bg-[#721818] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      {copiedToken === item.doc.token ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                      <span>{copiedToken === item.doc.token ? 'Copiato!' : 'Copia Link'}</span>
                    </button>
                  )}

                  {item.status !== 'completed' && item.status !== 'error' && (
                    <div className="w-24 bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#8B1E1E] h-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  )}

                  {item.status === 'error' && (
                    <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                      <AlertCircle size={14} />
                      <span>Fallito</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden input for Appending extra files to existing link */}
      <input
        type="file"
        ref={appendFileInputRef}
        multiple
        accept=".pdf,.docx,.doc,.xlsx,.xls,.ods,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleAppendFiles(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* Append in progress banner */}
      {appendProgress && (
        <div className="bg-sky-950/80 border border-sky-700/60 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="text-sky-400 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Ampliamento Link in corso...</p>
              <p className="text-[11px] text-sky-200">{appendProgress.message}</p>
            </div>
          </div>
          <div className="w-32 bg-sky-900 rounded-full h-2 overflow-hidden shrink-0">
            <div className="bg-sky-400 h-full transition-all duration-300" style={{ width: `${appendProgress.percentage}%` }} />
          </div>
        </div>
      )}

      {/* Historical Documents Archive */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <FileText size={20} className="text-[#f87171]" />
              <span>Storico Documenti Web Reader</span>
            </h3>
            <p className="text-stone-400 text-xs mt-0.5">
              Gestisci, rinomina titoli, ingrandisci con nuovi file o imposta conti alla rovescia ({documents.length} totali)
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per titolo, file o token..."
                className="bg-stone-950 border border-stone-700 text-white pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none focus:border-[#8B1E1E] w-48 sm:w-64"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-stone-950 border border-stone-700 text-stone-300 py-1.5 px-3 rounded-xl text-xs outline-none cursor-pointer font-bold"
            >
              <option value="all">Tutti i formati</option>
              <option value="bundle">🔗 File Uniti / Bundle</option>
              <option value="excel">📊 Solo Excel (.xlsx, .xls)</option>
              <option value="pdf">Solo PDF</option>
              <option value="docx">Solo Word (.docx)</option>
              <option value="txt">Solo Testo / MD</option>
              <option value="image">Solo Immagini</option>
              <option value="ocr">Solo Scansioni OCR</option>
            </select>

            <button
              onClick={loadDocuments}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-all cursor-pointer"
              title="Ricarica archivio"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Documents Table / Grid */}
        {loading ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#8B1E1E]" />
            <p>Caricamento archivio documenti...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs bg-stone-950 rounded-2xl border border-stone-800/80 p-8">
            <FileText size={32} className="mx-auto mb-2 text-stone-600 opacity-50" />
            <p className="font-bold text-stone-400">Nessun documento trovato</p>
            <p className="text-[11px] text-stone-600 mt-1">Carica uno o più file per generare la pagina web reader.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              const keyParam = doc.access_key ? `?key=${encodeURIComponent(doc.access_key)}` : '';
              const fullUrl = `${origin}/read/${doc.token}${keyParam}`;
              const isCopied = copiedToken === doc.token;
              const sourceFilesList = (doc.metadata as any)?.sourceFiles || [];
              const isMultiFile = sourceFilesList.length > 1 || doc.file_type === 'bundle';

              return (
                <div
                  key={doc.token}
                  className={`bg-stone-950 border rounded-2xl p-4 sm:p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    doc.is_active
                      ? 'border-stone-800 hover:border-stone-700'
                      : 'border-stone-850 opacity-60 bg-stone-950/40'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl shrink-0 mt-0.5">
                      {getFileIcon(doc.file_type, doc.file_name)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white truncate max-w-md">{doc.title}</span>
                        <button
                          onClick={() => {
                            setEditingTitleDoc(doc);
                            setNewTitleInput(doc.title);
                          }}
                          className="text-stone-400 hover:text-[#f87171] p-1 transition-colors cursor-pointer"
                          title="Rinomina documento"
                        >
                          <Edit2 size={13} />
                        </button>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-stone-800 text-stone-300 rounded">
                          {doc.file_type}
                        </span>
                        {isMultiFile && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800/60 rounded flex items-center gap-1">
                            <Layers size={10} className="text-sky-400" />
                            <span>{sourceFilesList.length || 2} File Uniti</span>
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-850 text-stone-300 rounded border border-stone-700 flex items-center gap-1">
                          <span>{doc.total_pages} {doc.total_pages === 1 ? 'pagina' : 'pagine'}</span>
                        </span>
                        {doc.metadata?.hasOcrPages && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800/40 rounded flex items-center gap-1">
                            <Sparkles size={10} />
                            <span>OCR</span>
                          </span>
                        )}
                        {doc.access_key && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/40 rounded flex items-center gap-1">
                            <Lock size={10} />
                            <span>Protetto</span>
                          </span>
                        )}
                        {getRemainingTimeBadge(doc.expires_at)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
                        <span>File principale: <strong className="text-stone-300 font-normal">{doc.file_name}</strong></span>
                        <span>·</span>
                        <span>{(doc.file_size_bytes / 1024).toFixed(0)} KB</span>
                        <span>·</span>
                        <span>{new Date(doc.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>

                      {/* Sub-files badge list if multi-file */}
                      {isMultiFile && sourceFilesList.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1.5">
                          {sourceFilesList.map((sf: any) => (
                            <span key={sf.index} className="text-[10px] bg-stone-900 border border-sky-800/80 text-sky-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono shadow-sm">
                              <span className="w-4 h-4 rounded-md bg-sky-950 text-sky-300 border border-sky-700 text-[9px] font-black flex items-center justify-center">#{sf.index}</span>
                              <span className="truncate max-w-[240px] font-bold text-stone-200">{sf.fileName}</span>
                              <span className="text-sky-400 font-sans font-bold text-[9px]">({sf.totalPages} pag.)</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Token Bar */}
                      <div className="pt-1 flex items-center gap-2">
                        <code className="text-[10px] bg-stone-900 border border-stone-800 text-stone-400 px-2 py-0.5 rounded font-mono truncate max-w-xs sm:max-w-md select-all">
                          {fullUrl}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-850">
                    {/* INGRANDISCI LINK (+ FILE) */}
                    <button
                      onClick={() => {
                        setAppendingToken(doc.token);
                        appendFileInputRef.current?.click();
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-700/60 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                      title="Aggiungi altri file PDF, Excel o Word per espandere questo link"
                    >
                      <PlusCircle size={14} className="text-sky-400" />
                      <span>+ Ingrandisci Link</span>
                    </button>

                    {/* COPIA LINK */}
                    <button
                      onClick={() => handleCopyLink(doc.token, doc.access_key)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#8B1E1E] hover:bg-[#721818] text-white'
                      }`}
                      title="Copia URL mini-sito web"
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copiato!' : 'Copia Link'}</span>
                    </button>

                    {/* COPIA LINK PER CHATGPT / LLM */}
                    <button
                      onClick={() => {
                        const rawApiUrl = `${origin}/api/read?token=${doc.token}${keyParam ? `&key=${encodeURIComponent(doc.access_key || '')}` : ''}`;
                        navigator.clipboard.writeText(rawApiUrl);
                        setCopiedToken(`llm_${doc.token}`);
                        setTimeout(() => setCopiedToken(null), 2500);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                      title="Copia URL con puro testo statico istantaneo per ChatGPT, Claude e Bot LLM"
                    >
                      {copiedToken === `llm_${doc.token}` ? <Check size={14} className="text-emerald-300" /> : <Bot size={14} className="text-emerald-400" />}
                      <span>{copiedToken === `llm_${doc.token}` ? 'Copiato per LLM!' : 'Link ChatGPT'}</span>
                    </button>

                    {/* APRI */}
                    <a
                      href={`/read/${doc.token}${keyParam}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700 flex items-center gap-1.5 transition-all"
                      title="Apri mini-sito reader"
                    >
                      <ExternalLink size={14} />
                      <span>Apri</span>
                    </a>

                    {/* MODIFICA SCADENZA / TIMER */}
                    <button
                      onClick={() => {
                        setEditingExpDoc(doc);
                        setEditExpMinutes(30);
                      }}
                      className="p-2 rounded-xl text-xs font-semibold bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-400 transition-all cursor-pointer"
                      title="Imposta o prolunga conto alla rovescia"
                    >
                      <Timer size={15} />
                    </button>

                    {/* TOGGLE ACTIVE */}
                    <button
                      onClick={() => handleToggleActive(doc.token, doc.is_active)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        doc.is_active
                          ? 'bg-stone-850 border-stone-700 text-stone-300 hover:text-amber-400'
                          : 'bg-amber-950/40 border-amber-800 text-amber-400'
                      }`}
                      title={doc.is_active ? 'Disattiva link temporaneamente' : 'Riattiva link'}
                    >
                      {doc.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>

                    {/* ELIMINA */}
                    <button
                      onClick={() => handleDelete(doc.token, doc.title)}
                      className="p-2 rounded-xl text-xs font-semibold bg-stone-850 hover:bg-red-950 border border-stone-700 hover:border-red-800 text-stone-400 hover:text-red-400 transition-all cursor-pointer"
                      title="Elimina definitivamente"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Title Modal */}
      {editingTitleDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Tag size={18} className="text-[#f87171]" />
                <span>Rinomina Documento</span>
              </h3>
              <button
                onClick={() => setEditingTitleDoc(null)}
                className="text-stone-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Nome File Originale (Inalterabile):</span>
                <span className="text-xs text-stone-300 font-mono font-bold block truncate">{editingTitleDoc.file_name}</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Titolo Identificativo Web (Mini-Sito & Storico)
                </label>
                <input
                  type="text"
                  value={newTitleInput}
                  onChange={(e) => setNewTitleInput(e.target.value)}
                  placeholder="Inserisci il titolo identificativo..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white outline-none focus:border-[#8B1E1E]"
                  autoFocus
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Questo titolo identifica il link per te e per i lettori, mentre il file originale rimarrà sempre tracciato.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setEditingTitleDoc(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveEditedTitle}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#8B1E1E] hover:bg-[#721818] text-white cursor-pointer shadow"
              >
                Salva Titolo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expiration Modal */}
      {editingExpDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Timer size={18} className="text-amber-400" />
                <span>Imposta Timer / Scadenza</span>
              </h3>
              <button
                onClick={() => setEditingExpDoc(null)}
                className="text-stone-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-white truncate">{editingExpDoc.title}</p>
              <p className="text-[11px] text-stone-400">
                Seleziona quanti minuti di validità assegnare a questo documento a partire da adesso:
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditExpMinutes((m) => Math.max(0, m - 5))}
                  className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-black transition-all cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="0"
                    max="10080"
                    value={editExpMinutes}
                    onChange={(e) => setEditExpMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2 text-center text-sm font-bold text-white outline-none focus:border-[#8B1E1E]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 font-semibold pointer-events-none">
                    minuti
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditExpMinutes((m) => m + 5)}
                  className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-black transition-all cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[10, 15, 30, 60, 120, 1440, 0].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setEditExpMinutes(mins)}
                    className={`text-xs font-bold px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                      editExpMinutes === mins
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    {mins === 0 ? 'Nessuna scadenza' : mins < 60 ? `${mins} min` : mins === 60 ? '1 ora' : mins === 120 ? '2 ore' : '24 ore'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setEditingExpDoc(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveEditedExpiration}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#8B1E1E] hover:bg-[#721818] text-white cursor-pointer shadow"
              >
                Salva Scadenza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
