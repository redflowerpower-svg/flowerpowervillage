import React, { useState, useRef, useEffect } from 'react';
import { 
  Wine, 
  Upload, 
  Layers, 
  Eye, 
  Check, 
  Sliders, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  Plus, 
  CheckCircle2, 
  ZoomIn, 
  Target,
  Undo2,
  Scissors,
  Wand2,
  Sparkles,
  GripVertical,
  Copy,
  Loader2,
  Zap
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { translateWineCardAllLanguages, WineLang } from '../../../pizza/data/wineTranslatorEngine';

import { 
  WineCardData, 
  WINE_COUNTRY_OPTIONS, 
  WINE_TYPE_OPTIONS, 
  INITIAL_WINE_COLLECTION,
  renderCountryFlag,
  formatSubtitle,
  renderWinePrice,
  getWineTranslatedTitle,
  getWineTranslatedSubtitle,
  getWineTranslatedDesc
} from '../../../pizza/data/wineData';
export type { WineCardData };
export { WINE_COUNTRY_OPTIONS, WINE_TYPE_OPTIONS };

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return '';
      if (word.includes("'")) {
        const parts = word.split("'");
        return parts.map(p => p ? (p.charAt(0).toUpperCase() + p.slice(1)) : '').join("'");
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const formatLiveTitleInput = (raw: string): string => {
  if (!raw) return '';
  const lines = raw.split('\n');
  return lines.map((line, idx) => {
    if (idx === 0 || idx === 1) {
      return line.toUpperCase();
    }
    const hasTrailingSpace = line.endsWith(' ');
    const formatted = toTitleCase(line);
    return hasTrailingSpace && !formatted.endsWith(' ') ? formatted + ' ' : formatted;
  }).join('\n');
};



const convertImageToOptimizedWebP = async (
  imageUrlOrData: string,
  maxWidth = 600,
  maxHeight = 1200,
  quality = 0.88
): Promise<{ blob: Blob; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context non disponibile'));
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Conversione WebP fallita'));
            return;
          }
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve({ blob, dataUrl });
        },
        'image/webp',
        quality
      );
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrlOrData;
  });
};

const uploadBottleImageToSupabase = async (
  imageDataOrBlob: string | Blob,
  fileName: string
): Promise<string> => {
  let fileBlob: Blob;
  if (typeof imageDataOrBlob === 'string') {
    const res = await convertImageToOptimizedWebP(imageDataOrBlob);
    fileBlob = res.blob;
  } else {
    fileBlob = imageDataOrBlob;
  }

  const cleanName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `bottle-${Date.now()}`;

  const storagePath = `14-Wines/${cleanName}.webp`;

  const { data, error } = await supabase.storage
    .from('delivery_food')
    .upload(storagePath, fileBlob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from('delivery_food')
    .getPublicUrl(storagePath);

  return publicData.publicUrl;
};

const formatProductName = (name: string) => {
  if (!name) return "";
  
  // Supporto a capo manuale (\n) su 2, 3 o più righe
  // 1ª riga: TUTTO MAIUSCOLO (100% font)
  // 2ª riga: TUTTO MAIUSCOLO (91% font, molto vicina)
  // 3ª riga+: Prima Lettera Maiuscola e le altre minuscole per tutte le parole (Title Case, 84% font, charcoal, mt-1)
  if (name.includes('\n')) {
    const lines = name.split('\n');
    return (
      <span className="flex flex-col text-[14.9px] sm:text-[16.1px] tracking-tight">
        {lines.map((line, idx) => {
          if (idx === 0) {
            return (
              <span key={idx} className="block leading-[1.1] uppercase">
                {line.toUpperCase()}
              </span>
            );
          }
          if (idx === 1) {
            return (
              <span key={idx} className="block text-[0.91em] font-bold leading-[1.1] mt-0.5 uppercase">
                {line.toUpperCase()}
              </span>
            );
          }
          return (
            <span key={idx} className="block text-stone-600 font-semibold text-[0.84em] leading-[1.15] mt-1">
              {toTitleCase(line)}
            </span>
          );
        })}
      </span>
    );
  }

  // Supporto connettori linguistici
  const splitKeywords = [' WITH ', ' CON ', ' พร้อม', ' MIT ', ' & '];
  const upperName = name.toUpperCase();
  for (const kw of splitKeywords) {
    if (upperName.includes(kw)) {
      const idx = upperName.indexOf(kw);
      const part1 = name.substring(0, idx);
      const matchWord = name.substring(idx, idx + kw.length);
      const part2 = name.substring(idx + kw.length);
      return (
        <span className="flex flex-col">
          <span className="block leading-[1.05] uppercase">{part1.toUpperCase()}</span>
          <span className="block text-[0.91em] font-bold leading-[1.05] mt-0.5 uppercase">
            {matchWord.trimStart().toUpperCase()}{part2.toUpperCase()}
          </span>
        </span>
      );
    }
  }

  // Ripartizione intelligente su 2 righe per denominazioni lunghe (> 18 caratteri e 3+ parole)
  const words = name.trim().split(/\s+/);
  if (words.length >= 3 && name.length > 18) {
    const mid = Math.ceil(words.length / 2);
    return (
      <>
        {words.slice(0, mid).join(' ')}
        <br />
        {words.slice(mid).join(' ')}
      </>
    );
  }

  return name;
};



const createBlankWineTemplate = (): WineCardData => ({
  id: `wine-${Date.now()}`,
  title: '',
  categorySubtitle: '',
  categoryType: 'red',
  flag: '🇮🇹',
  description: '',
  alcohol: '',
  price: '',
  bannerColor: '#8b0000',
  bottleImage: '',
  showLogoBadge: false,
  bottleScale: 100,
  bottleScaleX: 100,
  bottleOffsetX: 0,
  bottleOffsetY: 0,
  isAvailable: true,
  updatedAt: new Date().toISOString().split('T')[0]
});

export const WineCardStudio: React.FC = () => {
  const [subView, setSubView] = useState<'gallery' | 'editor'>('gallery');
  const [collection, setCollection] = useState<WineCardData[]>(() => {
    try {
      const deletedRaw = localStorage.getItem('fp_deleted_wine_ids');
      const deletedSet = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

      const saved = localStorage.getItem('fp_wine_collection');
      if (saved) {
        const parsed = JSON.parse(saved);
        const parsedMap = new Map(parsed.map((item: any) => [item.id, item]));
        
        const merged: WineCardData[] = [];
        parsed.forEach((item: any) => {
          if (!deletedSet.has(item.id)) {
            merged.push({
              ...item,
              isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
              bottleScaleX: item.bottleScaleX !== undefined ? item.bottleScaleX : 100,
              bottleOffsetX: item.bottleOffsetX !== undefined ? item.bottleOffsetX : 0
            });
          }
        });

        INITIAL_WINE_COLLECTION.forEach((initItem) => {
          if (!parsedMap.has(initItem.id) && !deletedSet.has(initItem.id)) {
            merged.push(initItem);
          }
        });
        return merged;
      }
      return INITIAL_WINE_COLLECTION.filter(w => !deletedSet.has(w.id));
    } catch {
      return INITIAL_WINE_COLLECTION;
    }
  });

  const [formData, setFormData] = useState<WineCardData>(() => createBlankWineTemplate());
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'red' | 'white' | 'rose' | 'sparkling' | 'available' | 'unavailable'>('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState('');
  const [isBatchOptimizing, setIsBatchOptimizing] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState('');
  const [showGuideSilhouette, setShowGuideSilhouette] = useState(true);
  const [isGuideConfigOpen, setIsGuideConfigOpen] = useState(false);
  const [guideSaveSuccess, setGuideSaveSuccess] = useState(false);
  const [guideCustom, setGuideCustom] = useState(() => {
    try {
      const saved = localStorage.getItem('fp_wine_guide_silhouette');
      return saved ? JSON.parse(saved) : {
        bodyWidth: 62,      // Larghezza corpo (px)
        height: 290,        // Altezza totale (px)
        neckWidth: 12,      // Larghezza collo (px)
        neckHeight: 55,     // Altezza collo (px)
        shoulderCurve: 35,  // Curvatura spalle (px)
        offsetY: 0          // Posizione Y (px)
      };
    } catch {
      return {
        bodyWidth: 62,
        height: 290,
        neckWidth: 12,
        neckHeight: 55,
        shoulderCurve: 35,
        offsetY: 0
      };
    }
  });

  // TOOL 2: SAGOMA DEDICATA PER IL RITAGLIO DEI BORDI (ARANCIONE)
  const [showCutSilhouette, setShowCutSilhouette] = useState(false);
  const [isCutConfigOpen, setIsCutConfigOpen] = useState(false);
  const [workbenchZoom, setWorkbenchZoom] = useState(140);
  const [previewMode, setPreviewMode] = useState<'card' | 'workbench'>('card');
  const [cutCustom, setCutCustom] = useState({
    bodyWidth: 62,
    height: 290,
    neckWidth: 12,
    neckHeight: 55,
    shoulderCurve: 35,
    shoulderArc: 50,          // Ampiezza / Tensione arco raccordo collo-spalla (%)
    shoulderKnuckle: 65,      // Raccordo / Curvatura angolo esterno spalla-fianco (%)
    offsetY: 0,
    baseCurve: 4,             // Pancia / Curvatura centrale fondo (px)
    baseCornerRadius: 4       // Raggio / Arco smussatura angoli fondo/spigoli culo (px)
  });

  const [selectedWineLightbox, setSelectedWineLightbox] = useState<WineCardData | null>(null);
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [isDetectingEdges, setIsDetectingEdges] = useState(false);
  const [detectFeedback, setDetectFeedback] = useState<string | null>(null);
  const [isAiRemoving, setIsAiRemoving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [previewLang, setPreviewLang] = useState<'IT' | 'EN' | 'TH' | 'DE'>('IT');
  const [descLangTab, setDescLangTab] = useState<'IT' | 'EN' | 'TH' | 'DE'>('IT');
  const [draggedWineId, setDraggedWineId] = useState<string | null>(null);
  const [dragOverWineId, setDragOverWineId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('fp_wine_collection', JSON.stringify(collection));
    } catch (e) {
      console.error('Error saving wine collection:', e);
    }
  }, [collection]);

  const getWineStudioDesc = (w: WineCardData | null, targetLang: 'IT' | 'EN' | 'TH' | 'DE' = previewLang) => {
    if (!w) return '';
    if (targetLang === 'TH' && (w as any).descriptionTh) return (w as any).descriptionTh;
    if (targetLang === 'IT' && (w as any).descriptionIt) return (w as any).descriptionIt;
    if (targetLang === 'DE' && (w as any).descriptionDe) return (w as any).descriptionDe;
    if (targetLang === 'EN' && (w as any).descriptionEn) return (w as any).descriptionEn;
    return w.description || '';
  };

  const handleFieldChange = (field: keyof WineCardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleAvailability = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollection(prev => prev.map(w => {
      if (w.id === id) {
        const updated = { ...w, isAvailable: !w.isAvailable };
        if (formData.id === id) {
          setFormData(updated);
        }
        return updated;
      }
      return w;
    }));
  };

  const changeBottleImageWithHistory = (newImage: string) => {
    if (formData.bottleImage && formData.bottleImage !== newImage) {
      setImageHistory(prev => [...prev, formData.bottleImage]);
    }
    handleFieldChange('bottleImage', newImage);
  };

  const handleCardDrop = (targetWineId: string) => {
    if (!draggedWineId || draggedWineId === targetWineId) {
      setDraggedWineId(null);
      setDragOverWineId(null);
      return;
    }

    const fromIndex = collection.findIndex(w => w.id === draggedWineId);
    const toIndex = collection.findIndex(w => w.id === targetWineId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedWineId(null);
      setDragOverWineId(null);
      return;
    }

    const updated = [...collection];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    setCollection(updated);
    try {
      localStorage.setItem('fp_wine_collection', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving reordered wine collection:', e);
    }
    setDraggedWineId(null);
    setDragOverWineId(null);
  };

  const handleUndoImage = () => {
    if (imageHistory.length === 0) return;
    const previous = imageHistory[imageHistory.length - 1];
    setImageHistory(prev => prev.slice(0, -1));
    setFormData(prev => ({ ...prev, bottleImage: previous }));
  };

  const autoDetectBottleSilhouette = async (customUrl?: string) => {
    const targetUrl = customUrl || formData.bottleImage;
    if (!targetUrl) return;

    setIsDetectingEdges(true);
    setDetectFeedback(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = targetUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const W = 200;
      const H = 640;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsDetectingEdges(false);
        return;
      }

      const imgAspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
      const boxAspect = W / H;
      let drawW = W;
      let drawH = H;
      if (imgAspect > boxAspect) {
        drawW = W;
        drawH = W / imgAspect;
      } else {
        drawH = H;
        drawW = H * imgAspect;
      }

      const bScale = (formData.bottleScale || 100) / 100;
      const bScaleX = (formData.bottleScaleX || 100) / 100;
      const bOffsetY = ((formData.bottleOffsetY || 0) / 320) * H;

      ctx.translate(W / 2, H / 2 + bOffsetY);
      ctx.scale(bScale * bScaleX, bScale);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;

      // Campionamento 4 angoli per colore sfondo
      const cornerIndices = [0, (W - 1) * 4, ((H - 1) * W) * 4, ((H - 1) * W + (W - 1)) * 4];
      let bgR = 0, bgG = 0, bgB = 0, bgA = 0;
      cornerIndices.forEach(idx => {
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
        bgA += data[idx + 3];
      });
      bgR /= cornerIndices.length;
      bgG /= cornerIndices.length;
      bgB /= cornerIndices.length;
      bgA /= cornerIndices.length;

      const isBgTransparent = bgA < 40;

      const rowWidths: number[] = new Array(H).fill(0);

      for (let y = 0; y < H; y++) {
        let leftX = -1;
        let rightX = -1;

        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          let isBottle = false;
          if (isBgTransparent) {
            isBottle = a > 40;
          } else {
            const diff = Math.sqrt(
              Math.pow(r - bgR, 2) +
              Math.pow(g - bgG, 2) +
              Math.pow(b - bgB, 2)
            ) + Math.abs(a - bgA);
            isBottle = diff > 24 && a > 30;
          }

          if (isBottle) {
            if (leftX === -1) leftX = x;
            rightX = x;
          }
        }

        if (leftX !== -1 && rightX !== -1 && (rightX - leftX) > 2) {
          rowWidths[y] = rightX - leftX;
        }
      }

      let topY = -1;
      let bottomY = -1;

      for (let y = 0; y < H; y++) {
        if (rowWidths[y] >= 4 && topY === -1) {
          topY = y;
        }
        if (rowWidths[y] >= 8) {
          bottomY = y;
        }
      }

      if (topY !== -1 && bottomY !== -1 && (bottomY - topY) >= 50) {
        const detectedOffsetY = Math.round((topY / H) * 320 - 6);
        const detectedHeight = Math.round(((bottomY - topY) / H) * 320);

        const neckStart = topY + Math.round((bottomY - topY) * 0.05);
        const neckEnd = topY + Math.round((bottomY - topY) * 0.22);
        const neckSamples: number[] = [];
        for (let y = neckStart; y <= neckEnd; y++) {
          if (rowWidths[y] > 2) neckSamples.push(rowWidths[y]);
        }
        neckSamples.sort((a, b) => a - b);
        const rawNeckW = neckSamples.length > 0 ? neckSamples[Math.floor(neckSamples.length * 0.4)] : 24;
        const detectedNeckWidth = Math.max(8, Math.min(32, Math.round((rawNeckW / W) * 100)));

        const bodyStart = topY + Math.round((bottomY - topY) * 0.45);
        const bodyEnd = topY + Math.round((bottomY - topY) * 0.85);
        const bodySamples: number[] = [];
        for (let y = bodyStart; y <= bodyEnd; y++) {
          if (rowWidths[y] > 5) bodySamples.push(rowWidths[y]);
        }
        bodySamples.sort((a, b) => a - b);
        const rawBodyW = bodySamples.length > 0 ? bodySamples[Math.floor(bodySamples.length * 0.75)] : 120;
        const detectedBodyWidth = Math.max(35, Math.min(92, Math.round((rawBodyW / W) * 100)));

        let inflectionY = neckEnd;
        for (let y = topY + Math.round((bottomY - topY) * 0.1); y <= bodyStart; y++) {
          if (rowWidths[y] > rawNeckW * 1.3) {
            inflectionY = y;
            break;
          }
        }
        const detectedNeckHeight = Math.max(10, Math.min(140, Math.round(((inflectionY - topY) / H) * 320)));

        let shoulderEndY = bodyStart;
        for (let y = inflectionY; y <= bodyStart; y++) {
          if (rowWidths[y] >= rawBodyW * 0.85) {
            shoulderEndY = y;
            break;
          }
        }
        const detectedShoulderCurve = Math.max(5, Math.min(100, Math.round(((shoulderEndY - inflectionY) / H) * 320)));

        setCutCustom(prev => ({
          ...prev,
          offsetY: detectedOffsetY,
          height: detectedHeight,
          neckWidth: detectedNeckWidth,
          bodyWidth: detectedBodyWidth,
          neckHeight: detectedNeckHeight,
          shoulderCurve: detectedShoulderCurve,
          shoulderArc: 45
        }));

        setIsCutConfigOpen(false);
        setShowCutSilhouette(false);
        setPreviewMode('card');
        setDetectFeedback('✨ Bordi calibrati in background! Apri lo strumento taglio per visualizzarli o rifinirli.');
        setTimeout(() => setDetectFeedback(null), 4000);
      } else {
        setDetectFeedback('Bordi non rilevati automaticamente. Puoi regolarli manualmente.');
        setTimeout(() => setDetectFeedback(null), 3000);
      }
    } catch (err) {
      console.warn('Auto-detect edges failed:', err);
      setDetectFeedback('Immagine caricata. Puoi modellare la sagoma con i cursori.');
      setTimeout(() => setDetectFeedback(null), 3000);
    } finally {
      setIsDetectingEdges(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgUrl = event.target.result as string;
          changeBottleImageWithHistory(imgUrl);
          // Esegue l'auto-fitting intelligente dei bordi sulla sagoma senza ritagliare
          autoDetectBottleSilhouette(imgUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiRemoveBackground = async () => {
    if (!formData.bottleImage || isAiRemoving) return;
    setIsAiRemoving(true);
    setAiProgressText('Avvio IA...');

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      setAiProgressText('Elaborazione IA...');

      const blob = await removeBackground(formData.bottleImage, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            setAiProgressText(`IA: ${pct}%`);
          } else {
            setAiProgressText('IA in corso...');
          }
        }
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        changeBottleImageWithHistory(base64data);
        setDetectFeedback('✨ Sfondo e bordi rimossi con successo tramite IA!');
        setTimeout(() => setDetectFeedback(null), 4000);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error('AI background removal error:', err);
      setDetectFeedback('Errore IA. Puoi usare la sagoma di ritaglio manuale.');
      setTimeout(() => setDetectFeedback(null), 4000);
    } finally {
      setIsAiRemoving(false);
      setAiProgressText(null);
    }
  };

  const handleClipBySilhouette = async () => {
    if (!formData.bottleImage) return;

    try {
      const origImg = new Image();
      origImg.crossOrigin = 'anonymous';
      origImg.src = formData.bottleImage;
      await new Promise((res, rej) => {
        origImg.onload = res;
        origImg.onerror = rej;
      });

      // Alta definizione: 800px x 2560px (proporzione esatta 100:320 corrispondente al viewBox SVG 0 0 100 320)
      const W = 800;
      const H = 2560;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scaleX = W / 100; // 8
      const scaleY = H / 320; // 8

      // 1. Disegna il percorso vettoriale della SAGOMA DI TAGLIO (cutCustom)
      ctx.save();
      ctx.beginPath();

      const nw = cutCustom.neckWidth * scaleX;
      const nh = cutCustom.neckHeight * scaleY;
      const bw = cutCustom.bodyWidth * scaleX;
      const sc = cutCustom.shoulderCurve * scaleY;
      const bh = cutCustom.height * scaleY;
      const oy = cutCustom.offsetY * scaleY;
      const topY = 6 * scaleY + oy;
      const neckBottomY = topY + nh;
      const shoulderBottomY = neckBottomY + sc;
      const bodyBottomY = topY + bh;
      const bc = (cutCustom.baseCurve !== undefined ? cutCustom.baseCurve : 4) * scaleY;
      const bcr = (cutCustom.baseCornerRadius !== undefined ? cutCustom.baseCornerRadius : 4) * scaleX;
      const sa = (cutCustom.shoulderArc !== undefined ? cutCustom.shoulderArc : 50) / 100;
      const sk = (cutCustom.shoulderKnuckle !== undefined ? cutCustom.shoulderKnuckle : 65) / 100;

      // 1. Inizio da angolo superiore sinistro del tappo/collo (taglio dritto e pulito)
      ctx.moveTo(W / 2 - nw / 2, topY);
      
      // Taglio orizzontale superiore dritto del tappo
      ctx.lineTo(W / 2 + nw / 2, topY);

      // Collo destro (scende dritto lungo tutta la lunghezza impostata)
      ctx.lineTo(W / 2 + nw / 2, neckBottomY);

      // Spalla destra con raccordo collo e raccordo spalla-fianco regolabili
      const cp1RX = W / 2 + nw / 2 + (bw / 2 - nw / 2) * (sa * 0.5);
      const cp1RY = neckBottomY + sc * (1 - sa * 0.6) * 0.6;
      const cp2RX = W / 2 + bw / 2 - (bw / 2 - nw / 2) * ((1 - sk) * 0.4);
      const cp2RY = shoulderBottomY - sc * (sk * 0.6) * 0.8;
      ctx.bezierCurveTo(cp1RX, cp1RY, cp2RX, cp2RY, W / 2 + bw / 2, shoulderBottomY);

      // Corpo destro fino allo spigolo del fondo
      ctx.lineTo(W / 2 + bw / 2, bodyBottomY - bcr);

      // Angolo destro raccordato del culo
      ctx.bezierCurveTo(
        W / 2 + bw / 2, bodyBottomY,
        W / 2 + bw / 2, bodyBottomY + bc,
        W / 2 + bw / 2 - bcr, bodyBottomY + bc
      );

      // Pancia centrale fondo / culo
      ctx.bezierCurveTo(
        W / 2 + bw / 4, bodyBottomY + bc * 1.05,
        W / 2 - bw / 4, bodyBottomY + bc * 1.05,
        W / 2 - bw / 2 + bcr, bodyBottomY + bc
      );

      // Angolo sinistro raccordato del culo
      ctx.bezierCurveTo(
        W / 2 - bw / 2, bodyBottomY + bc,
        W / 2 - bw / 2, bodyBottomY,
        W / 2 - bw / 2, bodyBottomY - bcr
      );

      // Corpo sinistro
      ctx.lineTo(W / 2 - bw / 2, shoulderBottomY);

      // Spalla sinistra con raccordo collo e raccordo spalla-fianco regolabili
      const cp2LX = W / 2 - bw / 2 + (bw / 2 - nw / 2) * ((1 - sk) * 0.4);
      const cp2LY = shoulderBottomY - sc * (sk * 0.6) * 0.8;
      const cp1LX = W / 2 - nw / 2 - (bw / 2 - nw / 2) * (sa * 0.5);
      const cp1LY = neckBottomY + sc * (1 - sa * 0.6) * 0.6;
      ctx.bezierCurveTo(cp2LX, cp2LY, cp1LX, cp1LY, W / 2 - nw / 2, neckBottomY);

      // Collo sinistro sale dritto fino in cima
      ctx.lineTo(W / 2 - nw / 2, topY);
      ctx.closePath();

      // Applica il ritaglio vettoriale: tutto ciò che è fuori dalla sagoma diventa trasparente
      ctx.clip();

      const imgAspect = (origImg.naturalWidth || origImg.width) / (origImg.naturalHeight || origImg.height);
      const boxAspect = W / H;
      let drawW = W;
      let drawH = H;

      if (imgAspect > boxAspect) {
        drawW = W;
        drawH = W / imgAspect;
      } else {
        drawH = H;
        drawW = H * imgAspect;
      }

      const bScale = (formData.bottleScale || 100) / 100;
      const bScaleX = (formData.bottleScaleX || 100) / 100;
      const bOffsetY = (formData.bottleOffsetY || 0) * scaleY;

      ctx.translate(W / 2, H / 2 + bOffsetY);
      ctx.scale(bScale * bScaleX, bScale);
      ctx.drawImage(origImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const croppedPng = canvas.toDataURL('image/png');
      
      changeBottleImageWithHistory(croppedPng);
      handleFieldChange('bottleScale', 100);
      handleFieldChange('bottleScaleX', 100);
      handleFieldChange('bottleOffsetY', 0);
      setShowCutSilhouette(false);
      setIsCutConfigOpen(false);
      setPreviewMode('card');
    } catch (e) {
      console.error('Errore ritaglio su sagoma:', e);
      alert('Errore durante il ritaglio dell\'immagine sulla sagoma.');
    }
  };

  const handleSaveToCollection = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatusText('Ottimizzazione WebP...');

    try {
      let finalBottleImage = formData.bottleImage;

      if (formData.bottleImage && (formData.bottleImage.startsWith('data:') || formData.bottleImage.startsWith('blob:'))) {
        setSaveStatusText('Caricamento WebP su Supabase...');
        try {
          const wineSlug = (formData.title || 'wine')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 30) || 'wine';

          const uploadedUrl = await uploadBottleImageToSupabase(
            formData.bottleImage,
            `${wineSlug}-${Date.now()}`
          );
          finalBottleImage = uploadedUrl;
        } catch (uploadErr) {
          console.warn('Upload Supabase fallito, mantengo WebP compresso locale:', uploadErr);
          const optimized = await convertImageToOptimizedWebP(formData.bottleImage);
          finalBottleImage = optimized.dataUrl;
        }
      }

      const existingIndex = collection.findIndex(w => w.id === formData.id);
      const now = new Date().toISOString().split('T')[0];
      const itemToSave: WineCardData = { 
        ...formData, 
        bottleImage: finalBottleImage,
        bottleScaleX: formData.bottleScaleX || 100,
        bottleOffsetX: formData.bottleOffsetX || 0,
        updatedAt: now 
      };

      let updated: WineCardData[];
      if (existingIndex >= 0) {
        updated = [...collection];
        updated[existingIndex] = itemToSave;
        setCollection(updated);
      } else {
        const newId = `wine-${Date.now()}`;
        const newItem = { ...itemToSave, id: newId };
        updated = [newItem, ...collection];
        setCollection(updated);
        setFormData(newItem);
      }

      try {
        localStorage.setItem('fp_wine_collection', JSON.stringify(updated));
      } catch (storageErr) {
        console.error('Errore salvataggio localStorage:', storageErr);
      }

      setFormData(prev => ({ ...prev, bottleImage: finalBottleImage }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
      alert('Si è verificato un errore durante il salvataggio della scheda.');
    } finally {
      setIsSaving(false);
      setSaveStatusText('');
    }
  };

  const handleBatchOptimizeAllWines = async () => {
    if (isBatchOptimizing) return;
    setIsBatchOptimizing(true);
    try {
      const updated = [...collection];
      let changedCount = 0;

      for (let i = 0; i < updated.length; i++) {
        const wine = updated[i];
        if (wine.bottleImage && (wine.bottleImage.startsWith('data:') || !wine.bottleImage.includes('.webp'))) {
          setBatchProgressText(`Ottimizzazione ${i + 1}/${updated.length}: ${wine.title.split('\n')[0]}...`);
          try {
            const wineSlug = (wine.title || wine.id)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .slice(0, 30);
            
            const webpUrl = await uploadBottleImageToSupabase(
              wine.bottleImage,
              `${wineSlug}-${Date.now()}`
            );
            updated[i] = { ...wine, bottleImage: webpUrl };
            changedCount++;
          } catch (e) {
            console.warn(`Impossibile ottimizzare vino ${wine.id}:`, e);
          }
        }
      }

      setCollection(updated);
      try {
        localStorage.setItem('fp_wine_collection', JSON.stringify(updated));
      } catch (e) {
        console.error('Errore salvataggio collezione:', e);
      }
      alert(`Ottimizzazione completata! ${changedCount} immagini compresse in WebP e salvate.`);
    } catch (err) {
      console.error('Errore batch optimization:', err);
      alert('Errore durante l\'ottimizzazione batch.');
    } finally {
      setIsBatchOptimizing(false);
      setBatchProgressText('');
    }
  };

  const handleEditWine = (wine: WineCardData) => {
    setImageHistory([]);
    setFormData({
      ...wine,
      title: wine.title || '',
      titleIt: (wine as any).titleIt || wine.title || '',
      titleEn: (wine as any).titleEn || wine.title || '',
      titleTh: (wine as any).titleTh || wine.title || '',
      titleDe: (wine as any).titleDe || wine.title || '',
      categorySubtitle: wine.categorySubtitle || '',
      subtitleIt: (wine as any).subtitleIt || wine.categorySubtitle || '',
      subtitleEn: (wine as any).subtitleEn || wine.categorySubtitle || '',
      subtitleTh: (wine as any).subtitleTh || wine.categorySubtitle || '',
      subtitleDe: (wine as any).subtitleDe || wine.categorySubtitle || '',
      description: wine.description || '',
      descriptionIt: (wine as any).descriptionIt || wine.description || '',
      descriptionEn: (wine as any).descriptionEn || wine.description || '',
      descriptionTh: (wine as any).descriptionTh || wine.description || '',
      descriptionDe: (wine as any).descriptionDe || wine.description || '',
      bottleScaleX: wine.bottleScaleX || 100,
      bottleOffsetX: wine.bottleOffsetX || 0
    });
    setIsCutConfigOpen(false);
    setShowCutSilhouette(false);
    setIsGuideConfigOpen(false);
    setShowGuideSilhouette(true);
    setPreviewMode('card');
    setSubView('editor');
  };

  const handleAutoTranslateCurrentWine = async () => {
    setIsTranslating(true);
    try {
      // 1. Determine current source inputs based on descLangTab (Mother Language)
      const currentTitle = (
        descLangTab === 'IT' ? (formData.titleIt || formData.title || '') :
        descLangTab === 'TH' ? (formData.titleTh || formData.title || '') :
        descLangTab === 'DE' ? (formData.titleDe || formData.title || '') :
        (formData.titleEn || formData.title || '')
      );
      const titleParts = currentTitle.split('\n');
      const vigna = titleParts[0] || '';
      const dettagli = titleParts[1] || '';
      const brand = titleParts[2] || '';

      const currentSub = (
        descLangTab === 'IT' ? (formData.subtitleIt || formData.categorySubtitle || '') :
        descLangTab === 'TH' ? (formData.subtitleTh || formData.categorySubtitle || '') :
        descLangTab === 'DE' ? (formData.subtitleDe || formData.categorySubtitle || '') :
        (formData.subtitleEn || formData.categorySubtitle || '')
      );
      const subParts = currentSub.split('\n');
      const wineType = subParts[0] || '';
      const origin = subParts.slice(1).join('\n') || '';

      const desc = (
        descLangTab === 'IT' ? (formData.descriptionIt || formData.description || '') :
        descLangTab === 'TH' ? (formData.descriptionTh || '') :
        descLangTab === 'DE' ? (formData.descriptionDe || '') :
        (formData.descriptionEn || formData.description || '')
      );

      // 2. Try DeepSeek AI backend API
      const res = await fetch('/api/wine-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang: descLangTab,
          vigna,
          dettagli,
          brand,
          wineType,
          origin,
          description: desc
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const ai = json.data;
          setFormData(prev => ({
            ...prev,
            title: ai.title?.EN || ai.title?.[descLangTab] || prev.title,
            titleIt: ai.title?.IT || prev.titleIt || prev.title,
            titleEn: ai.title?.EN || prev.titleEn || prev.title,
            titleTh: ai.title?.TH || prev.titleTh || prev.title,
            titleDe: ai.title?.DE || prev.titleDe || prev.title,
            categorySubtitle: ai.categorySubtitle?.EN || ai.categorySubtitle?.[descLangTab] || prev.categorySubtitle,
            subtitleIt: ai.categorySubtitle?.IT || prev.subtitleIt || prev.categorySubtitle,
            subtitleEn: ai.categorySubtitle?.EN || prev.subtitleEn || prev.categorySubtitle,
            subtitleTh: ai.categorySubtitle?.TH || prev.subtitleTh || prev.categorySubtitle,
            subtitleDe: ai.categorySubtitle?.DE || prev.subtitleDe || prev.categorySubtitle,
            description: ai.description?.EN || prev.description,
            descriptionIt: ai.description?.IT || prev.descriptionIt || prev.description,
            descriptionEn: ai.description?.EN || prev.descriptionEn || prev.description,
            descriptionTh: ai.description?.TH || prev.descriptionTh,
            descriptionDe: ai.description?.DE || prev.descriptionDe,
          }));
          return;
        }
      }

      // Fallback if network/API unavailable
      const trans = translateWineCardAllLanguages({
        sourceLang: descLangTab,
        vigna,
        dettagli,
        brand,
        wineType,
        origin,
        description: desc
      });

      setFormData(prev => ({
        ...prev,
        title: trans.title.EN || trans.title[descLangTab] || prev.title,
        titleIt: trans.titleIt,
        titleEn: trans.titleEn,
        titleTh: trans.titleTh,
        titleDe: trans.titleDe,
        categorySubtitle: trans.categorySubtitle,
        subtitleIt: trans.subtitleIt,
        subtitleEn: trans.subtitleEn,
        subtitleTh: trans.subtitleTh,
        subtitleDe: trans.subtitleDe,
        description: trans.descriptionEn || prev.description,
        descriptionIt: trans.descriptionIt,
        descriptionEn: trans.descriptionEn,
        descriptionTh: trans.descriptionTh,
        descriptionDe: trans.descriptionDe,
      }));

    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDuplicateWine = (wine: WineCardData) => {
    setImageHistory([]);
    const duplicated: WineCardData = {
      ...wine,
      id: `wine-${Date.now()}`,
      bottleScaleX: wine.bottleScaleX || 100,
      bottleOffsetX: wine.bottleOffsetX || 0,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setFormData(duplicated);
    setIsCutConfigOpen(false);
    setShowCutSilhouette(false);
    setIsGuideConfigOpen(false);
    setShowGuideSilhouette(true);
    setPreviewMode('card');
    setSubView('editor');
  };

  const handleDeleteWine = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa scheda vino dalla galleria?')) {
      const updated = collection.filter(w => w.id !== id);
      setCollection(updated);
      try {
        localStorage.setItem('fp_wine_collection', JSON.stringify(updated));
        const deletedRaw = localStorage.getItem('fp_deleted_wine_ids');
        const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedList.includes(id)) {
          deletedList.push(id);
          localStorage.setItem('fp_deleted_wine_ids', JSON.stringify(deletedList));
        }
      } catch (e) {
        console.error('Error persisting wine deletion:', e);
      }
      if (formData.id === id) {
        setFormData(updated[0] || createBlankWineTemplate());
      }
    }
  };

  const handleNewWine = () => {
    setImageHistory([]);
    setFormData(createBlankWineTemplate());
    setIsCutConfigOpen(false);
    setShowCutSilhouette(false);
    setIsGuideConfigOpen(false);
    setShowGuideSilhouette(true);
    setPreviewMode('card');
    setSubView('editor');
  };

  const filteredCollection = collection.filter(item => {
    let matchesFilter = true;
    if (galleryFilter === 'available') {
      matchesFilter = item.isAvailable === true;
    } else if (galleryFilter === 'unavailable') {
      matchesFilter = item.isAvailable === false;
    } else if (galleryFilter !== 'all') {
      matchesFilter = item.categoryType === galleryFilter;
    }

    const s = gallerySearch.toLowerCase();
    const matchesSearch = !s || item.title.toLowerCase().includes(s) || item.categorySubtitle.toLowerCase().includes(s) || item.price.includes(s);
    return matchesFilter && matchesSearch;
  });

  const availableCount = collection.filter(c => c.isAvailable).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-[#3b3530] to-stone-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-stone-700">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-2xl text-red-400">
            <Wine className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              <span>Wine Card Studio & Gestione Vendita</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {availableCount} / {collection.length} IN VENDITA
              </span>
            </h2>
            <p className="text-xs text-stone-300">
              Gestisci le schede vino, la formattazione visiva e attiva/disattiva con il baffetto la disponibilità nel menu delivery food.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-stone-950/60 p-1.5 rounded-2xl border border-stone-800 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSubView('gallery')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              subView === 'gallery'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Carta dei Vini ({collection.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData(createBlankWineTemplate());
              setImageHistory([]);
              setShowGuideSilhouette(true);
              setShowCutSilhouette(false);
              setIsCutConfigOpen(false);
              setPreviewMode('card');
              setSubView('editor');
            }}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              subView === 'editor'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Studio & Modifica</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: GALLERIA FOTOGRAFICA CARTA DEI VINI */}
      {/* ========================================================================= */}
      {subView === 'gallery' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Sticky on scroll (Search, Category Filters, Language Switcher, New Wine) */}
          <div className="sticky top-0 sm:top-16 z-30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-md transition-all">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                type="button"
                onClick={() => setGalleryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  galleryFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tutti ({collection.length})
              </button>

              <button
                type="button"
                onClick={() => setGalleryFilter('available')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  galleryFilter === 'available'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>In Vendita ({availableCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setGalleryFilter('unavailable')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  galleryFilter === 'unavailable'
                    ? 'bg-stone-700 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-stone-400 inline-block"></span>
                <span>Non in Vendita ({collection.length - availableCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setGalleryFilter('red')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  galleryFilter === 'red'
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'bg-red-50 text-red-800 hover:bg-red-100'
                }`}
              >
                🍷 Rossi
              </button>
              <button
                type="button"
                onClick={() => setGalleryFilter('white')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  galleryFilter === 'white'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                🥂 Bianchi
              </button>
            </div>

            {/* Search & Add New */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cerca vino o prezzo..."
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Language preview switcher */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <span className="text-[9px] font-black text-stone-400 px-1 uppercase">Lingua:</span>
                  {(['IT', 'EN', 'TH', 'DE'] as const).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setPreviewLang(l)}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        previewLang === l
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`}
                    >
                      {l === 'IT' ? '🇮🇹 IT' : l === 'EN' ? '🇬🇧 EN' : l === 'TH' ? '🇹🇭 TH' : '🇩🇪 DE'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isBatchOptimizing}
                  onClick={handleBatchOptimizeAllWines}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isBatchOptimizing
                      ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                  }`}
                  title="Comprime tutte le immagini delle schede vino in formato WebP leggero e le carica su Supabase"
                >
                  {isBatchOptimizing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                      <span>{batchProgressText || 'Ottimizzazione...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Comprimi Foto in WebP</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNewWine}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Nuovo Vino</span>
                </button>
              </div>
            </div>

          </div>

          {/* Info Banner per Drag and Drop Reordering */}
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50/90 border border-amber-300/80 px-4 py-2.5 rounded-2xl shadow-xs animate-fadeIn">
            <GripVertical className="w-4 h-4 text-amber-700 shrink-0" />
            <span>💡 <strong>Trascina e rilascia le schede con il mouse</strong> per riordinare la loro posizione esatta sul sito web e nel menu delivery.</span>
          </div>

          {/* Wine Cards Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollection.map((wine) => (
              <div
                key={wine.id}
                draggable={true}
                onDragStart={(e) => {
                  setDraggedWineId(wine.id);
                  e.dataTransfer.setData('text/plain', wine.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverWineId !== wine.id) {
                    setDragOverWineId(wine.id);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverWineId === wine.id) {
                    setDragOverWineId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleCardDrop(wine.id);
                }}
                onDragEnd={() => {
                  setDraggedWineId(null);
                  setDragOverWineId(null);
                }}
                className={`max-w-[380px] w-full mx-auto group bg-white border rounded-[2rem] transition-all duration-200 flex flex-col justify-between overflow-hidden relative min-h-[460px] sm:min-h-[500px] select-none ${
                  draggedWineId === wine.id
                    ? 'opacity-40 scale-95 ring-2 ring-amber-500 shadow-inner'
                    : dragOverWineId === wine.id
                      ? 'ring-4 ring-amber-500 scale-[1.03] shadow-2xl border-amber-500 z-20'
                      : 'shadow-sm hover:shadow-2xl hover:-translate-y-1'
                } ${
                  wine.isAvailable ? 'border-stone-300' : 'border-stone-300 opacity-75 grayscale-[20%]'
                }`}
              >
                {/* TOP AVAILABILITY BAR (BAFFETTO DI VENDITA + DRAG HANDLE) */}
                <div className={`px-3 sm:px-4 py-2 flex items-center justify-between border-b transition-colors shrink-0 ${
                  wine.isAvailable 
                    ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800' 
                    : 'bg-stone-100 border-stone-200 text-stone-500'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {/* Drag Handle Icon */}
                    <div 
                      className="p-1 text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing shrink-0" 
                      title="Trascina con il mouse per cambiare ordine"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleAvailability(wine.id, e)}
                      className="flex items-center gap-2 cursor-pointer select-none group/toggle"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        wine.isAvailable
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                          : 'border-2 border-stone-400 bg-white group-hover/toggle:border-stone-600'
                      }`}>
                        {wine.isAvailable && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        {wine.isAvailable ? 'In Vendita' : 'Non in Vendita'}
                      </span>
                    </button>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    wine.isAvailable ? 'bg-emerald-200/60 text-emerald-900' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {wine.isAvailable ? 'Visibile' : 'Nascosto'}
                  </span>
                </div>

                {/* 100% Exact Card Component from MenuGrid */}
                <div 
                  onClick={() => setSelectedWineLightbox(wine)}
                  className="flex flex-row flex-grow cursor-pointer relative min-h-[460px] sm:min-h-[500px]"
                >
                  {/* Left (35%): Vertical Bottle Portion */}
                  <div className="w-[35%] bg-stone-50 border-r border-stone-200 p-3 flex items-center justify-center relative overflow-hidden flex-shrink-0 min-h-[460px] sm:min-h-[500px]">
                    <div 
                      className="w-full h-full flex items-center justify-center transition-transform duration-300"
                      style={{
                        transform: `scale(${wine.bottleScale / 100}) scaleX(${(wine.bottleScaleX || 100) / 100}) translateX(${((wine.bottleOffsetX || 0) / 3.2)}%) translateY(${(wine.bottleOffsetY / 3.2)}%)`
                      }}
                    >
                      <img
                        src={wine.bottleImage}
                        alt={wine.title}
                        className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-stone-950/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[0.5px]">
                      <div className="p-2 bg-stone-900/90 rounded-full border border-stone-700 shadow-md">
                        <ZoomIn size={15} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Right (65%): Details & Action Portion */}
                  <div className="w-[65%] p-4 sm:p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <h3
                        className="font-sans font-bold text-stone-900 leading-tight tracking-tight"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                      >
                        {formatProductName(getWineTranslatedTitle(wine, previewLang))}
                      </h3>

                      {(getWineTranslatedSubtitle(wine, previewLang) || wine.flag) && (
                        <div 
                          className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 mt-2.5 sm:mt-3 flex items-center gap-2.5 leading-tight"
                          style={{ 
                            fontFamily: previewLang === 'TH' ? "'Prompt', 'Kanit', sans-serif" : 'Outfit, system-ui, sans-serif',
                            fontWeight: 900
                          }}
                        >
                          {wine.flag && <span className="shrink-0 flex items-center">{renderCountryFlag(wine.flag)}</span>}
                          <span className={`flex-1 flex flex-col justify-center leading-snug ${previewLang === 'TH' ? 'font-black text-[11px] sm:text-[12px] tracking-tight' : 'font-black'}`}>
                            {formatSubtitle(getWineTranslatedSubtitle(wine, previewLang))}
                          </span>
                        </div>
                      )}

                      <p
                        className="text-stone-500 text-xs font-light leading-snug mt-3 sm:mt-3.5"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                      >
                        {getWineTranslatedDesc(wine, previewLang)}
                      </p>

                      {wine.alcohol && (
                        <span className="inline-block mt-1.5 text-[10px] font-bold text-stone-400">
                          {wine.alcohol.replace('.', ',')} Vol.
                        </span>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-stone-400 font-extrabold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                          Prezzo
                        </span>
                        {renderWinePrice(wine.price)}
                      </div>

                      <span
                        className={`px-3.5 py-2 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 pointer-events-none ${
                          wine.isAvailable ? 'bg-[#8B1E1E]' : 'bg-stone-400'
                        }`}
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                      >
                        <Plus size={13} />
                        <span>Aggiungi</span>
                      </span>
                    </div>

                  </div>
                </div>

                {/* Card Action Bar (Admin Controls) */}
                <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditWine(wine)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Modifica Scheda</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateWine(wine)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-amber-50 hover:border-amber-300 text-stone-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title="Duplica questa scheda e portala nello Studio per modificarla"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>Duplica</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWine(wine.id)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Elimina vino"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {filteredCollection.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <Wine className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">Nessuna scheda vino trovata</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Nessun vino corrisponde ai filtri di ricerca selezionati.
              </p>
              <button
                type="button"
                onClick={handleNewWine}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs cursor-pointer"
              >
                Crea Nuova Scheda Vino
              </button>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STUDIO CREATIVO & EDITOR LIVE */}
      {/* ========================================================================= */}
      {subView === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative">
          
          {/* RIGHT COLUMN: PREVIEW CONTAINER (CLEAN STICKY PREVIEW) */}
          <div className="lg:col-span-6 lg:order-2 sticky top-0 lg:top-6 z-30 self-start w-full bg-stone-950/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none pt-1 pb-2 lg:py-0 border-b lg:border-none border-stone-800 lg:border-transparent shadow-xl lg:shadow-none transition-all">
            
              {previewMode === 'workbench' ? (
                <div className="relative w-full h-[360px] sm:h-[600px] bg-stone-950 rounded-2xl sm:rounded-3xl border-2 border-amber-500/60 flex items-center justify-center overflow-hidden shadow-2xl p-4 sm:p-6 select-none animate-fadeIn">
                  
                  {/* Griglia Tecnica di Precisione a Contrasto */}
                  <div 
                    className="absolute inset-0 opacity-15 pointer-events-none" 
                    style={{ 
                      backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                      backgroundPosition: '0 0, 12px 12px'
                    }}
                  />

                  {/* Box Centrale Scalabile con Zoom Banco */}
                  <div 
                    className="relative h-[82%] aspect-[100/320] flex items-center justify-center transition-transform duration-150"
                    style={{ transform: `scale(${workbenchZoom / 100})` }}
                  >
                    {/* SAGOMA LASER ARANCIONE DI TAGLIO INGRANDITA */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-visible">
                      <svg 
                        viewBox="0 0 100 320" 
                        className="w-full h-full overflow-visible" 
                        fill="none"
                      >
                        {/* Profilo Tratteggiato Taglio Completo con Glow Laser */}
                        <path 
                          d={`
                            M ${50 - cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY}
                            L ${50 + cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY}
                            L ${50 + cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY + cutCustom.neckHeight}
                            C ${50 + cutCustom.neckWidth / 2 + (cutCustom.bodyWidth / 2 - cutCustom.neckWidth / 2) * ((cutCustom.shoulderArc ?? 50) / 100 * 0.5)} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve * (1 - (cutCustom.shoulderArc ?? 50) / 100 * 0.6) * 0.6}, ${50 + cutCustom.bodyWidth / 2 - (cutCustom.bodyWidth / 2 - cutCustom.neckWidth / 2) * ((1 - (cutCustom.shoulderKnuckle ?? 65) / 100) * 0.4)} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve * (1 - ((cutCustom.shoulderKnuckle ?? 65) / 100 * 0.6) * 0.8)}, ${50 + cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve}
                            L ${50 + cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height - (cutCustom.baseCornerRadius ?? 4)}
                            C ${50 + cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height}, ${50 + cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4)}, ${50 + cutCustom.bodyWidth / 2 - (cutCustom.baseCornerRadius ?? 4)} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4)}
                            C ${50 + cutCustom.bodyWidth / 4} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4) * 1.05}, ${50 - cutCustom.bodyWidth / 4} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4) * 1.05}, ${50 - cutCustom.bodyWidth / 2 + (cutCustom.baseCornerRadius ?? 4)} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4)}
                            C ${50 - cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4)}, ${50 - cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height}, ${50 - cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height - (cutCustom.baseCornerRadius ?? 4)}
                            L ${50 - cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve}
                            C ${50 - cutCustom.bodyWidth / 2 + (cutCustom.bodyWidth / 2 - cutCustom.neckWidth / 2) * ((1 - (cutCustom.shoulderKnuckle ?? 65) / 100) * 0.4)} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve * (1 - ((cutCustom.shoulderKnuckle ?? 65) / 100 * 0.6) * 0.8)}, ${50 - cutCustom.neckWidth / 2 - (cutCustom.bodyWidth / 2 - cutCustom.neckWidth / 2) * ((cutCustom.shoulderArc ?? 50) / 100 * 0.5)} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve * (1 - (cutCustom.shoulderArc ?? 50) / 100 * 0.6) * 0.6}, ${50 - cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY + cutCustom.neckHeight}
                            L ${50 - cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY}
                            Z
                          `}
                          stroke="#f59e0b" 
                          strokeWidth="1.2" 
                          strokeDasharray="3 2" 
                          className="filter drop-shadow-[0_0_3px_rgba(245,158,11,0.7)]"
                        />
                      </svg>
                    </div>

                    {/* Bottiglia Reale Regolabile (Nessun placeholder sotto la sagoma) */}
                    <div 
                      className="w-full h-full flex items-center justify-center transition-transform duration-200 relative z-10"
                      style={{
                        transform: `scale(${formData.bottleScale / 100}) scaleX(${(formData.bottleScaleX || 100) / 100}) translateX(${((formData.bottleOffsetX || 0) / 3.2)}%) translateY(${(formData.bottleOffsetY / 3.2)}%)`
                      }}
                    >
                      {formData.bottleImage && (
                        <img
                          src={formData.bottleImage}
                          alt={formData.title || 'Bottiglia'}
                          className="max-h-full max-w-full object-contain filter drop-shadow-2xl"
                        />
                      )}
                    </div>
                  </div>

                  {/* Barra Inferiore di Controllo Zoom del Banco di Lavoro */}
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-stone-700 flex items-center gap-2 sm:gap-3 z-30 shadow-2xl">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400">Zoom:</span>
                    <input 
                      type="range" 
                      min="80" 
                      max="240" 
                      value={workbenchZoom} 
                      onChange={(e) => setWorkbenchZoom(Number(e.target.value))}
                      className="w-20 sm:w-28 accent-amber-500 cursor-pointer" 
                    />
                    <span className="text-xs font-mono font-bold text-white w-8 sm:w-10">{workbenchZoom}%</span>
                    <div className="flex items-center gap-1 border-l border-stone-700 pl-1.5 sm:pl-2">
                      {[100, 140, 180, 220].map(z => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => setWorkbenchZoom(z)}
                          className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold cursor-pointer transition-colors ${
                            workbenchZoom === z ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {z}%
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                /* VISTA 2: ANTEPRIMA REALISTICA CARD DELIVERY */
                <div className="w-full flex items-center justify-center p-0 select-none animate-fadeIn">
                  <div
                    ref={cardRef}
                    className={`max-w-[380px] w-full mx-auto group bg-white border border-stone-300 rounded-[2rem] shadow-xl sm:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative select-none min-h-[460px] sm:min-h-[500px] ${
                      formData.isAvailable ? 'border-stone-300' : 'border-stone-300 opacity-75 grayscale-[20%]'
                    }`}
                  >
                    {/* TOP AVAILABILITY BAR (BAFFETTO DI VENDITA - IDENTICO ALLA GALLERIA) */}
                    <div className={`px-4 py-2 flex items-center justify-between border-b transition-colors shrink-0 ${
                      formData.isAvailable 
                        ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800' 
                        : 'bg-stone-100 border-stone-200 text-stone-500'
                    }`}>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('isAvailable', !formData.isAvailable)}
                        className="flex items-center gap-2 cursor-pointer select-none group/toggle"
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          formData.isAvailable
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                            : 'border-2 border-stone-400 bg-white group-hover/toggle:border-stone-600'
                        }`}>
                          {formData.isAvailable && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider">
                          {formData.isAvailable ? 'In Vendita (Attivo)' : 'Non in Vendita'}
                        </span>
                      </button>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        formData.isAvailable ? 'bg-emerald-200/60 text-emerald-900' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {formData.isAvailable ? 'Visibile' : 'Nascosto'}
                      </span>
                    </div>

                  {/* 100% Exact Card Component from MenuGrid & Gallery */}
                  <div className="flex flex-row flex-grow relative min-h-[460px] sm:min-h-[500px]">
                    {/* Left (35%): Vertical Bottle Portion */}
                    <div className="w-[35%] bg-stone-50 border-r border-stone-200 p-3 flex items-center justify-center relative overflow-hidden flex-shrink-0 min-h-[460px] sm:min-h-[500px]">
                      
                      {/* 1. SAGOMA GUIDA VETTORIALE STANDARD (GRIGIA) */}
                      {showGuideSilhouette && !showCutSilhouette && (
                        <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none z-10 select-none">
                          <svg 
                            viewBox="0 0 100 320" 
                            className="h-[88%] w-auto overflow-visible" 
                            fill="none"
                          >
                            {/* Tappo / Capsula superiore */}
                            <rect 
                              x={50 - (guideCustom.neckWidth + 4) / 2} 
                              y={6 + guideCustom.offsetY} 
                              width={guideCustom.neckWidth + 4} 
                              height={8} 
                              rx={1.5} 
                              stroke="#78716c" 
                              strokeWidth="1.5" 
                              strokeDasharray="3 3" 
                            />

                            {/* Profilo Tratteggiato Completo della Bottiglia */}
                            <path 
                              d={`
                                M ${50 - guideCustom.neckWidth / 2} ${14 + guideCustom.offsetY}
                                L ${50 - guideCustom.neckWidth / 2} ${14 + guideCustom.offsetY + guideCustom.neckHeight}
                                C ${50 - guideCustom.neckWidth / 2} ${14 + guideCustom.offsetY + guideCustom.neckHeight + guideCustom.shoulderCurve * 0.4}, ${50 - guideCustom.bodyWidth / 2} ${14 + guideCustom.offsetY + guideCustom.neckHeight + guideCustom.shoulderCurve * 0.6}, ${50 - guideCustom.bodyWidth / 2} ${14 + guideCustom.offsetY + guideCustom.neckHeight + guideCustom.shoulderCurve}
                                L ${50 - guideCustom.bodyWidth / 2} ${14 + guideCustom.offsetY + guideCustom.height}
                                C ${50 - guideCustom.bodyWidth / 2} ${14 + guideCustom.offsetY + guideCustom.height + 4}, ${50 + guideCustom.bodyWidth / 2} ${14 + guideCustom.offsetY + guideCustom.height + 4}, ${50 + guideCustom.bodyWidth / 2} ${14 + guideCustom.offsetY + guideCustom.height}
                                L ${50 + guideCustom.bodyWidth / 2} ${14 + guideCustom.offsetY + guideCustom.neckHeight + guideCustom.shoulderCurve}
                                C ${50 + guideCustom.bodyWidth / 2} ${14 + guideCustom.offsetY + guideCustom.neckHeight + guideCustom.shoulderCurve * 0.6}, ${50 + guideCustom.neckWidth / 2} ${14 + guideCustom.offsetY + guideCustom.neckHeight + guideCustom.shoulderCurve * 0.4}, ${50 + guideCustom.neckWidth / 2} ${14 + guideCustom.offsetY + guideCustom.neckHeight}
                                L ${50 + guideCustom.neckWidth / 2} ${14 + guideCustom.offsetY}
                                Z
                              `}
                              stroke="#78716c" 
                              strokeWidth="1.5" 
                              strokeDasharray="4 3" 
                            />
                          </svg>
                        </div>
                      )}

                      {/* 2. SAGOMA DEDICATA AL RITAGLIO DEI BORDI (LASER ARANCIONE CON RACCORDI COMPLETI) */}
                      {showCutSilhouette && (
                        <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none z-10 select-none">
                          <svg 
                            viewBox="0 0 100 320" 
                            className="h-[88%] w-auto overflow-visible" 
                            fill="none"
                          >
                            {/* Profilo Tratteggiato Taglio Completo (Tappo Dritto + Collo Allungabile + Raccordo Spalla + Angoli Fondo + Pancia Culo) */}
                            <path 
                              d={`
                                M ${50 - cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY}
                                L ${50 + cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY}
                                L ${50 + cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY + cutCustom.neckHeight}
                                C ${50 + cutCustom.neckWidth / 2 + (cutCustom.bodyWidth / 2 - cutCustom.neckWidth / 2) * ((cutCustom.shoulderArc ?? 50) / 100 * 0.5)} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve * (1 - (cutCustom.shoulderArc ?? 50) / 100 * 0.6) * 0.6}, ${50 + cutCustom.bodyWidth / 2 - (cutCustom.bodyWidth / 2 - cutCustom.neckWidth / 2) * ((1 - (cutCustom.shoulderKnuckle ?? 65) / 100) * 0.4)} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve * (1 - ((cutCustom.shoulderKnuckle ?? 65) / 100 * 0.6) * 0.8)}, ${50 + cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve}
                                L ${50 + cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height - (cutCustom.baseCornerRadius ?? 4)}
                                C ${50 + cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height}, ${50 + cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4)}, ${50 + cutCustom.bodyWidth / 2 - (cutCustom.baseCornerRadius ?? 4)} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4)}
                                C ${50 + cutCustom.bodyWidth / 4} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4) * 1.05}, ${50 - cutCustom.bodyWidth / 4} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4) * 1.05}, ${50 - cutCustom.bodyWidth / 2 + (cutCustom.baseCornerRadius ?? 4)} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4)}
                                C ${50 - cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height + (cutCustom.baseCurve ?? 4)}, ${50 - cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height}, ${50 - cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.height - (cutCustom.baseCornerRadius ?? 4)}
                                L ${50 - cutCustom.bodyWidth / 2} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve}
                                C ${50 - cutCustom.bodyWidth / 2 + (cutCustom.bodyWidth / 2 - cutCustom.neckWidth / 2) * ((1 - (cutCustom.shoulderKnuckle ?? 65) / 100) * 0.4)} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve * (1 - ((cutCustom.shoulderKnuckle ?? 65) / 100 * 0.6) * 0.8)}, ${50 - cutCustom.neckWidth / 2 - (cutCustom.bodyWidth / 2 - cutCustom.neckWidth / 2) * ((cutCustom.shoulderArc ?? 50) / 100 * 0.5)} ${6 + cutCustom.offsetY + cutCustom.neckHeight + cutCustom.shoulderCurve * (1 - (cutCustom.shoulderArc ?? 50) / 100 * 0.6) * 0.6}, ${50 - cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY + cutCustom.neckHeight}
                                L ${50 - cutCustom.neckWidth / 2} ${6 + cutCustom.offsetY}
                                Z
                              `}
                              stroke="#ea580c" 
                              strokeWidth="1.2" 
                              strokeDasharray="3 2" 
                            />
                          </svg>
                        </div>
                      )}

                      {/* Bottiglia Reale Regolabile (Nessun placeholder sotto la sagoma) */}
                      <div 
                        className="w-full h-full flex items-center justify-center transition-transform duration-200 relative z-0"
                        style={{
                          transform: `scale(${formData.bottleScale / 100}) scaleX(${(formData.bottleScaleX || 100) / 100}) translateX(${((formData.bottleOffsetX || 0) / 3.2)}%) translateY(${(formData.bottleOffsetY / 3.2)}%)`
                        }}
                      >
                        {formData.bottleImage && (
                          <img
                            src={formData.bottleImage}
                            alt={formData.title || 'Bottiglia'}
                            className="max-h-full max-w-full object-contain filter drop-shadow-md"
                          />
                        )}
                      </div>
                    </div>

                    {/* Right (65%): Details */}
                    <div className="w-[65%] p-4 sm:p-5 flex flex-col justify-between flex-grow min-h-[460px] sm:min-h-[500px]">
                      <div>
                        <h3
                          className="font-sans font-bold text-stone-900 leading-tight tracking-tight"
                          style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                        >
                          {formData.title ? (
                            formatProductName(getWineTranslatedTitle(formData, previewLang))
                          ) : (
                            <span className="text-stone-300 font-bold tracking-wider">NOME VINO</span>
                          )}
                        </h3>

                        {/* Sottotitolo / Provenienza (Bandierina centrata su 2 righe) */}
                        <div 
                          className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 mt-2.5 sm:mt-3 flex items-center gap-2.5 leading-tight"
                          style={{ 
                            fontFamily: previewLang === 'TH' ? "'Prompt', 'Kanit', sans-serif" : 'Outfit, system-ui, sans-serif',
                            fontWeight: 900
                          }}
                        >
                          {formData.flag && <span className="shrink-0 flex items-center">{renderCountryFlag(formData.flag)}</span>}
                          <span className={`flex-1 flex flex-col justify-center leading-snug ${previewLang === 'TH' ? 'font-black text-[11px] sm:text-[12px] tracking-tight' : 'font-black'}`}>
                            {getWineTranslatedSubtitle(formData, previewLang) ? (
                              formatSubtitle(getWineTranslatedSubtitle(formData, previewLang))
                            ) : (
                              <span className="text-amber-800/40">SOTTOTITOLO / PROVENIENZA</span>
                            )}
                          </span>
                        </div>

                        <p
                          className="text-stone-500 text-xs font-light leading-snug mt-3 sm:mt-3.5"
                          style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                        >
                          {getWineTranslatedDesc(formData, previewLang) || (
                            <span className="text-stone-300 italic">Note di degustazione e abbinamenti consigliati...</span>
                          )}
                        </p>

                        {formData.alcohol && (
                          <span className="inline-block mt-1.5 text-[10px] font-bold text-stone-400">
                            {(formData.alcohol.includes('%') ? formData.alcohol : `${formData.alcohol}%`).replace('.', ',')} Vol.
                          </span>
                        )}
                      </div>

                      {/* Bottom Bar: Price & Add Button */}
                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-widest text-stone-400 font-extrabold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                            Prezzo
                          </span>
                          {renderWinePrice(formData.price)}
                        </div>

                        <span
                          className={`px-3.5 py-2 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 pointer-events-none ${
                            formData.isAvailable ? 'bg-[#8B1E1E]' : 'bg-stone-400'
                          }`}
                          style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                        >
                          <Plus size={13} />
                          <span>Aggiungi</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

          {/* LEFT COLUMN: FORM CONTROLS (SCROLLS UNDER PREVIEW ON MOBILE) */}
          <div className="lg:col-span-6 lg:order-1 w-full space-y-6 bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-sm">
            
            {/* Header / Save Button */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Parametri Scheda Vino</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewWine}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-stone-300"
                  title="Azzera tutti i campi per iniziare una nuova scheda vuota"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuova Scheda</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveToCollection}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                    isSaving 
                      ? 'bg-amber-600 animate-pulse cursor-wait' 
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{saveStatusText || 'Salvataggio...'}</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Salvato!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salva Scheda</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Immagine Bottiglia (Upload Pulito con Undo) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-stone-600 block">
                  Foto Bottiglia Verticale:
                </label>
                {imageHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndoImage}
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                    title="Annulla l'ultima modifica e ripristina la foto precedente"
                  >
                    <Undo2 className="w-3 h-3 text-amber-800" />
                    <span>↩️ Torna Indietro ({imageHistory.length})</span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4 text-stone-300" />
                  <span>Carica Foto</span>
                </button>

                {/* TASTO AI RIMUOVI SFONDO / BORDI */}
                <button
                  type="button"
                  disabled={!formData.bottleImage || isAiRemoving}
                  onClick={handleAiRemoveBackground}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                    isAiRemoving
                      ? 'bg-purple-100 text-purple-700 animate-pulse border border-purple-300'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:opacity-95 text-white shadow-purple-200'
                  }`}
                  title="Rimuovi automaticamente lo sfondo e i bordi con l'Intelligenza Artificiale"
                >
                  <Wand2 className="w-3.5 h-3.5 text-white" />
                  <span>{isAiRemoving ? (aiProgressText || 'Rimozione IA...') : 'Rimuovi Bordi IA'}</span>
                </button>
              </div>

              {/* URL manuale */}
              <input
                type="text"
                value={formData.bottleImage}
                onChange={(e) => changeBottleImageWithHistory(e.target.value)}
                placeholder="https://... URL immagine Supabase o esterna"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            {/* Regolazione Fine Bottiglia (Scala Zoom, Stretch X & Offset Y) */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                  Regolazione Geometrica Bottiglia
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Tasto Sagoma Guida Standard */}
                  <button
                    type="button"
                    onClick={() => setShowGuideSilhouette(prev => !prev)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      showGuideSilhouette
                        ? 'bg-stone-800 text-white shadow-xs'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                    title="Mostra / Nascondi la sagoma grigia di proporzione standard"
                  >
                    <Target className="w-3 h-3 text-stone-300" />
                    <span>Guida: {showGuideSilhouette ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Tasto Sagoma di Taglio Laser */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !showCutSilhouette;
                      setShowCutSilhouette(next);
                      if (next) {
                        setIsCutConfigOpen(true);
                        setPreviewMode('workbench');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                      showCutSilhouette
                        ? 'bg-amber-600 text-stone-950 shadow-xs'
                        : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    }`}
                    title="Attiva la sagoma arancione di ritaglio per eliminare lo sfondo"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>Taglio: {showCutSilhouette ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Slider 1: Scala / Zoom Generale */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                  <span>Zoom / Scala Dimensione:</span>
                  <span>{formData.bottleScale || 100}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="800"
                  value={formData.bottleScale || 100}
                  onChange={(e) => handleFieldChange('bottleScale', Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Stretch Orizzontale (Larghezza X) */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                  <span>Stretch Orizzontale (Larghezza X):</span>
                  <span>{formData.bottleScaleX || 100}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  value={formData.bottleScaleX || 100}
                  onChange={(e) => handleFieldChange('bottleScaleX', Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Posizione Orizzontale (Offset X) */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                  <span>Posizione Orizzontale (Offset X):</span>
                  <span>{formData.bottleOffsetX || 0} px</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={formData.bottleOffsetX || 0}
                  onChange={(e) => handleFieldChange('bottleOffsetX', Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Slider 4: Posizione Verticale (Altezza Y) */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                  <span>Posizione Verticale (Altezza Y):</span>
                  <span>{formData.bottleOffsetY || 0} px</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  value={formData.bottleOffsetY || 0}
                  onChange={(e) => handleFieldChange('bottleOffsetY', Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* ========================================================= */}
            {/* TOOL 1 A SCOMPARSA: MODIFICA SAGOMA GUIDA STANDARD (GRIGIO) */}
            {/* ========================================================= */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsGuideConfigOpen(prev => !prev)}
                  className="text-[11px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-stone-400" />
                  <span>{isGuideConfigOpen ? 'Nascondi Calibrazione Guida' : '⚙️ Modifica Sagoma Guida Standard (Grigia)'}</span>
                </button>

                {isGuideConfigOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('fp_wine_guide_silhouette', JSON.stringify(guideCustom));
                      setGuideSaveSuccess(true);
                      setTimeout(() => {
                        setGuideSaveSuccess(false);
                        setIsGuideConfigOpen(false);
                      }, 1800);
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    {guideSaveSuccess ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Sagoma Salvata!</span>
                      </>
                    ) : (
                      <>
                        <span>💾 Salva come Definitiva</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* PANNELLO DI CALIBRAZIONE SAGOMA GUIDA STANDARD */}
              {isGuideConfigOpen && (
                <div className="mt-3 p-4 rounded-2xl bg-stone-100 border border-stone-300 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-stone-600" />
                      <span>Parametri Sagoma Guida Standard (Grigia)</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-stone-500">
                      L:{guideCustom.bodyWidth} | H:{guideCustom.height}
                    </span>
                  </div>

                  {/* 1. Larghezza Corpo / Fianchi */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-0.5">
                      <span>Larghezza Fianchi / Corpo:</span>
                      <span className="text-stone-900">{guideCustom.bodyWidth} px</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      value={guideCustom.bodyWidth}
                      onChange={(e) => setGuideCustom(prev => ({ ...prev, bodyWidth: Number(e.target.value) }))}
                      className="w-full accent-stone-800 cursor-pointer"
                    />
                  </div>

                  {/* 2. Altezza Totale Sagoma */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-0.5">
                      <span>Altezza Totale:</span>
                      <span className="text-stone-900">{guideCustom.height} px</span>
                    </div>
                    <input
                      type="range"
                      min="180"
                      max="390"
                      value={guideCustom.height}
                      onChange={(e) => setGuideCustom(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full accent-stone-800 cursor-pointer"
                    />
                  </div>

                  {/* 3. Larghezza Collo */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-0.5">
                      <span>Larghezza Collo:</span>
                      <span className="text-stone-900">{guideCustom.neckWidth} px</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="32"
                      value={guideCustom.neckWidth}
                      onChange={(e) => setGuideCustom(prev => ({ ...prev, neckWidth: Number(e.target.value) }))}
                      className="w-full accent-stone-800 cursor-pointer"
                    />
                  </div>

                  {/* 4. Lunghezza Collo */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-0.5">
                      <span>Lunghezza Collo:</span>
                      <span className="text-stone-900">{guideCustom.neckHeight} px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      value={guideCustom.neckHeight}
                      onChange={(e) => setGuideCustom(prev => ({ ...prev, neckHeight: Number(e.target.value) }))}
                      className="w-full accent-stone-800 cursor-pointer"
                    />
                  </div>

                  {/* 5. Curvatura Spalla */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-0.5">
                      <span>Curvatura Spalla:</span>
                      <span className="text-stone-900">{guideCustom.shoulderCurve} px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={guideCustom.shoulderCurve}
                      onChange={(e) => setGuideCustom(prev => ({ ...prev, shoulderCurve: Number(e.target.value) }))}
                      className="w-full accent-stone-800 cursor-pointer"
                    />
                  </div>

                  {/* 6. Offset Y */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-stone-700 mb-0.5">
                      <span>Posizione Y Sagoma:</span>
                      <span className="text-stone-900">{guideCustom.offsetY} px</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={guideCustom.offsetY}
                      onChange={(e) => setGuideCustom(prev => ({ ...prev, offsetY: Number(e.target.value) }))}
                      className="w-full accent-stone-800 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* TOOL 2 A SCOMPARSA: STRUMENTO SAGOMA DI RITAGLIO (ARANCIONE) */}
            {/* ========================================================= */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCutConfigOpen;
                    setIsCutConfigOpen(next);
                    if (next) {
                      setShowCutSilhouette(true);
                      setPreviewMode('workbench');
                    } else {
                      setShowCutSilhouette(false);
                      setPreviewMode('card');
                    }
                  }}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isCutConfigOpen ? 'Nascondi Strumento Taglio' : 'Strumento Sagoma di Ritaglio (Arancione)'}</span>
                </button>

                {isCutConfigOpen && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!formData.bottleImage || isDetectingEdges}
                      onClick={() => autoDetectBottleSilhouette()}
                      className="text-[10px] font-black uppercase tracking-wider text-amber-800 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Rileva i bordi della bottiglia ed adatta automaticamente la sagoma"
                    >
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>{isDetectingEdges ? 'Rilevamento...' : 'Auto-Bordi'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCutCustom({ ...guideCustom })}
                      className="text-[10px] font-bold text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      title="Copia le dimensioni esatte della sagoma standard"
                    >
                      Copia da Guida
                    </button>
                  </div>
                )}
              </div>

              {/* PANNELLO SAGOMA DI RITAGLIO DEDICATA */}
              {isCutConfigOpen && (
                <div className="mt-3 p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-400/80 space-y-3.5 animate-fadeIn shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-600" />
                      <span>Modella Sagoma di Taglio (Laser Arancione)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Selettore Vista Anteprima (Disponibile dentro lo strumento di ritaglio) */}
                      <div className="flex items-center gap-1 bg-amber-200/80 p-0.5 rounded-xl border border-amber-300">
                        <button
                          type="button"
                          onClick={() => setPreviewMode('workbench')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            previewMode === 'workbench'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-amber-900 hover:bg-amber-300/60'
                          }`}
                        >
                          🔍 Banco Ingrandito
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode('card')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            previewMode === 'card'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-amber-900 hover:bg-amber-300/60'
                          }`}
                        >
                          🎴 Card Delivery
                        </button>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-amber-700">
                        L:{cutCustom.bodyWidth} | H:{cutCustom.height}
                      </span>
                    </div>
                  </div>

                  {/* Preset Sagome di Taglio */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-800">Preset Rapidi:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: '🍷 Bordolese', bw: 62, h: 290, nw: 12, nh: 65, sc: 35, sa: 35, sk: 60, bc: 2, bcr: 3 },
                        { label: '🍾 Borgognotta', bw: 68, h: 285, nw: 13, nh: 55, sc: 70, sa: 75, sk: 85, bc: 6, bcr: 8 },
                        { label: '🥂 Spumante', bw: 72, h: 280, nw: 15, nh: 50, sc: 65, sa: 80, sk: 80, bc: 10, bcr: 12 },
                        { label: '🌾 Renana', bw: 54, h: 320, nw: 11, nh: 85, sc: 30, sa: 85, sk: 70, bc: 3, bcr: 4 },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setCutCustom(prev => ({
                            ...prev,
                            bodyWidth: preset.bw,
                            height: preset.h,
                            neckWidth: preset.nw,
                            neckHeight: preset.nh,
                            shoulderCurve: preset.sc,
                            shoulderArc: preset.sa,
                            shoulderKnuckle: preset.sk,
                            baseCurve: preset.bc,
                            baseCornerRadius: preset.bcr
                          }))}
                          className="px-2 py-1.5 rounded-lg bg-white border border-amber-300 hover:border-amber-600 text-[10px] font-bold text-stone-800 hover:text-amber-900 transition-all cursor-pointer text-center shadow-2xs"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1. Larghezza Corpo / Fianchi Taglio */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Larghezza Corpo Taglio:</span>
                      <span className="text-stone-900">{cutCustom.bodyWidth} px</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="95"
                      value={cutCustom.bodyWidth}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, bodyWidth: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 2. Altezza Totale Taglio */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Altezza Totale Taglio:</span>
                      <span className="text-stone-900">{cutCustom.height} px</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="390"
                      value={cutCustom.height}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 3. Larghezza Collo Taglio */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Larghezza Collo & Tappo:</span>
                      <span className="text-stone-900">{cutCustom.neckWidth} px</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="35"
                      value={cutCustom.neckWidth}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, neckWidth: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 4. Lunghezza Collo Taglio (Estensione Indipendente) */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Lunghezza Collo (Allungamento):</span>
                      <span className="text-stone-900">{cutCustom.neckHeight} px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="180"
                      value={cutCustom.neckHeight}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, neckHeight: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 5. Altezza Caduta Spalla (+20% Max) */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Altezza Caduta Spalla:</span>
                      <span className="text-stone-900">{cutCustom.shoulderCurve} px</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="120"
                      value={cutCustom.shoulderCurve}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, shoulderCurve: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 6. Ampiezza Arco Raccordo Collo-Spalla (Interno) */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Arco Raccordo Collo-Spalla (Interno):</span>
                      <span className="text-stone-900">{cutCustom.shoulderArc ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cutCustom.shoulderArc ?? 50}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, shoulderArc: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 7. Raccordo Angolo Esterno Spalla -> Fianco Pancia */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Raccordo Angolo Esterno Spalla (Morbidezza Pancia):</span>
                      <span className="text-stone-900">{cutCustom.shoulderKnuckle ?? 65}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cutCustom.shoulderKnuckle ?? 65}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, shoulderKnuckle: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 8. Pancia / Curvatura Centrale Fondo Culo */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Curvatura Pancia Fondo Culo:</span>
                      <span className="text-stone-900">{cutCustom.baseCurve ?? 4} px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="0.5"
                      value={cutCustom.baseCurve ?? 4}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, baseCurve: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 9. Raggio / Arco Smussatura Angoli Fondo Culo (NUOVO) */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Arco / Raggio Angoli Laterali Fondo:</span>
                      <span className="text-stone-900">{cutCustom.baseCornerRadius ?? 4} px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="18"
                      step="0.5"
                      value={cutCustom.baseCornerRadius ?? 4}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, baseCornerRadius: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* 10. Offset Y Taglio */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-900 mb-0.5">
                      <span>Posizione Y Taglio:</span>
                      <span className="text-stone-900">{cutCustom.offsetY} px</span>
                    </div>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      value={cutCustom.offsetY}
                      onChange={(e) => setCutCustom(prev => ({ ...prev, offsetY: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* TASTO ESEGUI RITAGLIO SU QUESTA SAGOMA */}
                  <div className="pt-2 border-t border-amber-300">
                    <button
                      type="button"
                      disabled={!formData.bottleImage}
                      onClick={handleClipBySilhouette}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Scissors className="w-4 h-4 stroke-[2.5]" />
                      <span>Esegui Taglio su questa Sagoma</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* BARRA LINGUE & TASTO AUTO-TRADUZIONE AI */}
            <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-amber-900">Lingua Modifica:</span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-amber-200 shadow-2xs">
                  {[
                    { id: 'IT', label: '🇮🇹 IT' },
                    { id: 'EN', label: '🇬🇧 EN' },
                    { id: 'TH', label: '🇹🇭 TH' },
                    { id: 'DE', label: '🇩🇪 DE' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setDescLangTab(tab.id as any);
                        setPreviewLang(tab.id as any);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                        descLangTab === tab.id
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isTranslating}
                onClick={handleAutoTranslateCurrentWine}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 disabled:opacity-60 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                title="Traduce automaticamente con DeepSeek AI nelle altre 3 lingue"
              >
                {isTranslating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isTranslating ? 'Traduzione DeepSeek AI...' : 'Auto-Traduci Tutte le 4 Lingue'}</span>
              </button>
            </div>

            {/* Nome Vino suddiviso in 3 campi: Vigna, Dettagli, Brand */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-stone-600 block">
                  Nome e Denominazione ({descLangTab}):
                </span>
                <span className="text-[9px] text-stone-400 font-bold">
                  (Vigna · Dettagli · Brand)
                </span>
              </div>

              {(() => {
                const currentFullTitle = (
                  descLangTab === 'IT' ? (formData.titleIt || formData.title || '') :
                  descLangTab === 'TH' ? (formData.titleTh || formData.title || '') :
                  descLangTab === 'DE' ? (formData.titleDe || formData.title || '') :
                  (formData.titleEn || formData.title || '')
                );
                const titleParts = currentFullTitle.split('\n');
                const pVigna = titleParts[0] || '';
                const pDettagli = titleParts[1] || '';
                const pBrand = titleParts[2] || '';

                const updateTitleParts = (newV: string, newD: string, newB: string) => {
                  const arr = [newV, newD, newB];
                  while (arr.length > 0 && !arr[arr.length - 1]) {
                    arr.pop();
                  }
                  const formatted = formatLiveTitleInput(arr.join('\n'));
                  if (descLangTab === 'IT') handleFieldChange('titleIt', formatted);
                  else if (descLangTab === 'TH') handleFieldChange('titleTh', formatted);
                  else if (descLangTab === 'DE') handleFieldChange('titleDe', formatted);
                  else handleFieldChange('titleEn', formatted);
                  handleFieldChange('title', formatted);
                };

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* 1. Vigna */}
                    <div>
                      <label className="text-[11px] font-black uppercase text-stone-500 block mb-1">
                        1. Vigna:
                      </label>
                      <input
                        type="text"
                        value={pVigna}
                        onChange={(e) => updateTitleParts(e.target.value.toUpperCase(), pDettagli, pBrand)}
                        placeholder="es. PRIMITIVO PUGLIA"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-tight"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                      />
                    </div>

                    {/* 2. Dettagli */}
                    <div>
                      <label className="text-[11px] font-black uppercase text-stone-500 block mb-1">
                        2. Dettagli:
                      </label>
                      <input
                        type="text"
                        value={pDettagli}
                        onChange={(e) => updateTitleParts(pVigna, e.target.value.toUpperCase(), pBrand)}
                        placeholder="es. IGT PEPA / DOC"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-tight"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                      />
                    </div>

                    {/* 3. Brand */}
                    <div>
                      <label className="text-[11px] font-black uppercase text-stone-500 block mb-1">
                        3. Brand:
                      </label>
                      <input
                        type="text"
                        value={pBrand}
                        onChange={(e) => updateTitleParts(pVigna, pDettagli, e.target.value)}
                        placeholder="es. Canoro / Millesimato"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 tracking-tight"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Nazione Vino, Tipo di Vino & Area */}
            <div className="space-y-3">
              {/* 1. Nazione Vino & Bandiera (Menù a Tendina) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black uppercase text-stone-600 shrink-0">
                    Nazione & Bandiera:
                  </label>
                  <div className="p-1.5 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center shrink-0 min-w-[40px] min-h-[36px]">
                    {renderCountryFlag(formData.flag || '🇮🇹')}
                  </div>
                </div>

                <div className="flex-1">
                  <select
                    value={
                      WINE_COUNTRY_OPTIONS.find(c => c.flag === formData.flag || c.code === formData.flag)?.flag || formData.flag || '🇮🇹'
                    }
                    onChange={(e) => {
                      const selectedFlag = e.target.value;
                      const cObj = WINE_COUNTRY_OPTIONS.find(c => c.flag === selectedFlag || c.code === selectedFlag) || WINE_COUNTRY_OPTIONS[0];
                      handleFieldChange('flag', cObj.flag);

                      // Helper to extract area
                      const extractArea = (originLine: string) => {
                        if (!originLine) return '';
                        const parts = originLine.split(/\s*[-·]\s*/);
                        if (parts.length > 1) return parts.slice(1).join(' - ').trim();
                        const single = originLine.trim().toUpperCase();
                        const isC = WINE_COUNTRY_OPTIONS.some(c => Object.values(c.names).some(n => n.toUpperCase() === single));
                        return isC ? '' : originLine.trim();
                      };

                      const updateSub = (sub: string, l: 'IT' | 'EN' | 'TH' | 'DE') => {
                        const [t = '', ...r] = (sub || '').split('\n');
                        const existingOrigin = r.join('\n');
                        const area = extractArea(existingOrigin);
                        const countryName = cObj.names[l];
                        const newOrigin = area ? `${countryName} - ${area}` : countryName;
                        return t ? `${t}\n${newOrigin}` : newOrigin;
                      };

                      const sIt = updateSub(formData.subtitleIt || formData.categorySubtitle || '', 'IT');
                      const sEn = updateSub(formData.subtitleEn || formData.categorySubtitle || '', 'EN');
                      const sTh = updateSub(formData.subtitleTh || formData.categorySubtitle || '', 'TH');
                      const sDe = updateSub(formData.subtitleDe || formData.categorySubtitle || '', 'DE');

                      handleFieldChange('subtitleIt', sIt);
                      handleFieldChange('subtitleEn', sEn);
                      handleFieldChange('subtitleTh', sTh);
                      handleFieldChange('subtitleDe', sDe);
                      handleFieldChange('categorySubtitle', descLangTab === 'IT' ? sIt : descLangTab === 'TH' ? sTh : descLangTab === 'DE' ? sDe : sEn);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                  >
                    <option value="" disabled>-- Seleziona Nazione Vino --</option>
                    {WINE_COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.flag}>
                        {c.flag} {c.names[descLangTab] || c.label} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Tipo di Vino & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tipo di Vino (Menù a Tendina) */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-600 block mb-1">
                    Tipo di Vino ({descLangTab}):
                  </label>
                  {(() => {
                    const currentFullSub = (
                      descLangTab === 'IT' ? (formData.subtitleIt || formData.categorySubtitle || '') :
                      descLangTab === 'TH' ? (formData.subtitleTh || formData.categorySubtitle || '') :
                      descLangTab === 'DE' ? (formData.subtitleDe || formData.categorySubtitle || '') :
                      (formData.subtitleEn || formData.categorySubtitle || '')
                    );
                    const [currentType = '', ...rest] = currentFullSub.split('\n');

                    // Match existing type
                    const matchedType = WINE_TYPE_OPTIONS.find(t => 
                      t.id === formData.categoryType || 
                      Object.values(t.names).some(n => n.toUpperCase() === currentType.trim().toUpperCase())
                    ) || WINE_TYPE_OPTIONS[0];

                    return (
                      <select
                        value={matchedType.id}
                        onChange={(e) => {
                          const selectedTypeId = e.target.value as 'red' | 'white' | 'rose' | 'sparkling';
                          const typeObj = WINE_TYPE_OPTIONS.find(t => t.id === selectedTypeId) || WINE_TYPE_OPTIONS[0];
                          handleFieldChange('categoryType', selectedTypeId);

                          const updateSubWithType = (sub: string, l: 'IT' | 'EN' | 'TH' | 'DE') => {
                            const [_, ...r] = (sub || '').split('\n');
                            const orig = r.join('\n');
                            const newTypeName = typeObj.names[l];
                            return orig ? `${newTypeName}\n${orig}` : newTypeName;
                          };

                          const sIt = updateSubWithType(formData.subtitleIt || formData.categorySubtitle || '', 'IT');
                          const sEn = updateSubWithType(formData.subtitleEn || formData.categorySubtitle || '', 'EN');
                          const sTh = updateSubWithType(formData.subtitleTh || formData.categorySubtitle || '', 'TH');
                          const sDe = updateSubWithType(formData.subtitleDe || formData.categorySubtitle || '', 'DE');

                          handleFieldChange('subtitleIt', sIt);
                          handleFieldChange('subtitleEn', sEn);
                          handleFieldChange('subtitleTh', sTh);
                          handleFieldChange('subtitleDe', sDe);
                          handleFieldChange('categorySubtitle', descLangTab === 'IT' ? sIt : descLangTab === 'TH' ? sTh : descLangTab === 'DE' ? sDe : sEn);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs font-black text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer uppercase"
                        style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                      >
                        {WINE_TYPE_OPTIONS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.names[descLangTab]}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* Area */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-600 block mb-1">
                    Area ({descLangTab}):
                  </label>
                  {(() => {
                    const currentFullSub = (
                      descLangTab === 'IT' ? (formData.subtitleIt || formData.categorySubtitle || '') :
                      descLangTab === 'TH' ? (formData.subtitleTh || formData.categorySubtitle || '') :
                      descLangTab === 'DE' ? (formData.subtitleDe || formData.categorySubtitle || '') :
                      (formData.subtitleEn || formData.categorySubtitle || '')
                    );
                    const [currentType = '', ...rest] = currentFullSub.split('\n');
                    const originLine = rest.join('\n');
                    const cObj = WINE_COUNTRY_OPTIONS.find(c => c.flag === formData.flag || c.code === formData.flag) || WINE_COUNTRY_OPTIONS[0];
                    
                    const extractArea = (str: string) => {
                      if (!str) return '';
                      const parts = str.split(/\s*[-·]\s*/);
                      if (parts.length > 1) return parts.slice(1).join(' - ').trim();
                      const single = str.trim().toUpperCase();
                      const isC = WINE_COUNTRY_OPTIONS.some(c => Object.values(c.names).some(n => n.toUpperCase() === single));
                      return isC ? '' : str.trim();
                    };

                    const areaValue = extractArea(originLine);

                    return (
                      <input
                        type="text"
                        value={areaValue}
                        onChange={(e) => {
                          const newArea = e.target.value.toUpperCase();
                          const countryName = cObj.names[descLangTab] || 'ITALIA';
                          const newOriginLine = newArea ? `${countryName} - ${newArea}` : countryName;
                          const combined = currentType ? `${currentType}\n${newOriginLine}` : newOriginLine;
                          if (descLangTab === 'IT') handleFieldChange('subtitleIt', combined);
                          else if (descLangTab === 'TH') handleFieldChange('subtitleTh', combined);
                          else if (descLangTab === 'DE') handleFieldChange('subtitleDe', combined);
                          else handleFieldChange('subtitleEn', combined);
                          handleFieldChange('categorySubtitle', combined);
                        }}
                        placeholder="es. PUGLIA / SICILIA / VALLE CENTRALE"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs font-black text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-wider leading-snug"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Descrizione & Note di Degustazione */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-stone-600 block">
                Note di Degustazione ({descLangTab}):
              </label>

              {descLangTab === 'IT' && (
                <textarea
                  rows={4}
                  value={formData.descriptionIt || formData.description || ''}
                  onChange={(e) => {
                    handleFieldChange('descriptionIt', e.target.value);
                    handleFieldChange('description', e.target.value);
                  }}
                  placeholder="Descrizione in Italiano..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-none"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                />
              )}

              {descLangTab === 'EN' && (
                <textarea
                  rows={4}
                  value={formData.descriptionEn || formData.description || ''}
                  onChange={(e) => {
                    handleFieldChange('descriptionEn', e.target.value);
                    if (!formData.description) handleFieldChange('description', e.target.value);
                  }}
                  placeholder="Description in English..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-none"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                />
              )}

              {descLangTab === 'TH' && (
                <textarea
                  rows={4}
                  value={formData.descriptionTh || ''}
                  onChange={(e) => handleFieldChange('descriptionTh', e.target.value)}
                  placeholder="คำอธิบายภาษาไทย (ทันสมัยและเข้าใจง่าย)..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-none"
                  style={{ fontFamily: 'IBM Plex Sans Thai, Outfit, system-ui, sans-serif' }}
                />
              )}

              {descLangTab === 'DE' && (
                <textarea
                  rows={4}
                  value={formData.descriptionDe || ''}
                  onChange={(e) => handleFieldChange('descriptionDe', e.target.value)}
                  placeholder="Beschreibung auf Deutsch..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-none"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                />
              )}
            </div>

            {/* Gradazione Alcolica & Prezzo (Con Simboli % e ฿ Fissi) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black uppercase text-stone-600 block mb-1">
                  Gradazione Alcolica:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.alcohol ? formData.alcohol.replace(/%\s*Vol\.?/i, '').replace(/%/g, '').replace('.', ',').trim() : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9,.]/g, '').replace('.', ',');
                      handleFieldChange('alcohol', val ? `${val}%` : '');
                    }}
                    placeholder="es. 13,5"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400 pointer-events-none select-none">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-stone-600 block mb-1">
                  Prezzo:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.price ? formData.price.replace(/[^\d]/g, '') : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d]/g, '');
                      handleFieldChange('price', val ? `${val} ฿` : '');
                    }}
                    placeholder="es. 1190"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs font-black text-[#8B1E1E] focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-stone-400 pointer-events-none select-none">
                    ฿
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

            {/* ========================================================================= */}
      {/* LIGHTBOX POPUP DI VISUALIZZAZIONE SCHEDA INGRANDITA A SCHERMO INTERO      */}
      {/* ========================================================================= */}
      {selectedWineLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedWineLightbox(null)}
        >
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedWineLightbox(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* The Full Rendered White Card at True Proportions */}
            <div
              className="w-full bg-white border border-stone-300 rounded-[2rem] shadow-2xl flex flex-row overflow-hidden select-none min-h-[320px] sm:min-h-[360px]"
            >
              {/* Bottle Box */}
              <div className="w-[35%] bg-stone-50 border-r border-stone-200 p-3 flex items-center justify-center relative overflow-hidden flex-shrink-0 min-h-[320px] sm:min-h-[360px]">
                <div 
                  className="w-full h-full flex items-center justify-center transition-transform duration-300"
                  style={{
                    transform: `scale(${selectedWineLightbox.bottleScale / 100}) scaleX(${(selectedWineLightbox.bottleScaleX || 100) / 100}) translateX(${((selectedWineLightbox.bottleOffsetX || 0) / 3.2)}%) translateY(${(selectedWineLightbox.bottleOffsetY / 3.2)}%)`
                  }}
                >
                  <img
                    src={selectedWineLightbox.bottleImage}
                    alt={selectedWineLightbox.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md"
                  />
                </div>
              </div>

              {/* Content Box */}
              <div className="w-[65%] p-5 sm:p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3
                    className="font-sans font-bold text-stone-900 leading-tight tracking-tight"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                  >
                    {formatProductName(getWineTranslatedTitle(selectedWineLightbox, previewLang))}
                  </h3>

                  {/* Sottotitolo / Provenienza (Bandierina centrata su 2 righe) */}
                  {(getWineTranslatedSubtitle(selectedWineLightbox, previewLang) || selectedWineLightbox.flag) && (
                    <div 
                      className="text-[11px] sm:text-[12px] font-black uppercase tracking-wider text-amber-900 mt-1.5 flex items-center gap-2.5 leading-tight"
                      style={{ 
                        fontFamily: previewLang === 'TH' ? "'Prompt', 'Kanit', sans-serif" : 'Outfit, system-ui, sans-serif',
                        fontWeight: 900
                      }}
                    >
                      {selectedWineLightbox.flag && <span className="shrink-0 flex items-center">{renderCountryFlag(selectedWineLightbox.flag)}</span>}
                      <span className={`flex-1 flex flex-col justify-center leading-snug ${previewLang === 'TH' ? 'font-black text-[12px] sm:text-[13px] tracking-tight' : 'font-black'}`}>
                        {formatSubtitle(getWineTranslatedSubtitle(selectedWineLightbox, previewLang))}
                      </span>
                    </div>
                  )}

                  <p
                    className="text-stone-500 text-xs font-light leading-relaxed mt-2"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                  >
                    {getWineTranslatedDesc(selectedWineLightbox, previewLang)}
                  </p>

                  {selectedWineLightbox.alcohol && (
                    <span className="inline-block mt-2.5 text-[10px] font-bold text-stone-400">
                      {selectedWineLightbox.alcohol.replace('.', ',')} Vol.
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-widest text-stone-400 font-extrabold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                      Prezzo
                    </span>
                    {renderWinePrice(selectedWineLightbox.price)}
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-2 bg-[#8B1E1E] hover:bg-[#721818] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                  >
                    <Plus size={13} />
                    <span>Aggiungi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Lightbox */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  handleEditWine(selectedWineLightbox);
                  setSelectedWineLightbox(null);
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Modifica Scheda</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWineLightbox(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 hover:text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Chiudi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
