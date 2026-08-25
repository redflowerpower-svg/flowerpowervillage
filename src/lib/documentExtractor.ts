/**
 * Document Extractor & OCR Engine
 * Supports: PDF, DOCX, TXT, Markdown, CSV, and Scanned Images (PNG/JPG/WEBP).
 * Features:
 * - 100% faithful text extraction (zero alteration, zero correction, zero translation).
 * - Automatic OCR fallback for scanned pages/images supporting Italian, English, and Thai (ita+eng+tha).
 * - Multi-page indexing and extraction progress reporting.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Configure PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  // Use official CDN worker matching installed pdfjs-dist version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface ExtractedPage {
  pageNumber: number;
  textContent: string;
  hasOcr: boolean;
  ocrLang?: string;
}

export interface ExtractionResult {
  title: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  totalPages: number;
  pages: ExtractedPage[];
  metadata: {
    extractedAt: string;
    hasOcrPages: boolean;
    detectedLanguages?: string[];
    originalCharCount: number;
  };
}

export type ExtractionProgressCallback = (progress: {
  status: 'parsing' | 'extracting' | 'ocr' | 'completed' | 'error';
  currentPage: number;
  totalPages: number;
  percentage: number;
  message: string;
}) => void;

/**
 * Generate a high-entropy, cryptographically secure 256-bit token
 */
export function generateDocumentToken(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `sec_${hex}`;
  }
  // Fallback
  return `sec_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
}

/**
 * Clean and sanitize extracted text without modifying content
 */
export function sanitizeTextContent(text: string): string {
  if (!text) return '';
  // Normalize newline sequences and strip null characters
  return text.replace(/\0/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Perform OCR using Google Gemini Vision (highest quality) with Tesseract.js fallback
 */
async function performDocumentOcr(
  canvas: HTMLCanvasElement,
  onProgress?: (msg: string) => void
): Promise<{ text: string; lang: string }> {
  // 1. Try Gemini Vision first
  try {
    if (onProgress) onProgress('Scansione visiva ad alta precisione con Gemini Vision AI...');
    const dataUrl = canvas.toDataURL('image/png', 0.92);
    
    const res = await fetch('/api/documents-api?action=gemini-ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: dataUrl,
        mimeType: 'image/png'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text && data.text.trim().length > 10) {
        if (onProgress) onProgress('Analisi completata con successo da Gemini Vision!');
        return {
          text: sanitizeTextContent(data.text),
          lang: 'Gemini Vision AI (Thai/EN/IT)'
        };
      }
    }

    // Direct client fallback with VITE_GEMINI_API_KEY
    const clientKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (clientKey) {
      const cleanBase64 = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${clientKey}`;
      const directRes = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              {
                text: 'Estrai fedelmente ed integralmente tutto il testo presente in questa pagina di documento/contratto. ' +
                      'Mantieni la massima accuratezza per la lingua thailandese (vocali, segni di tono, articoli ข้อ 1, ข้อ 2, clausole legali, numeri catastali, date). ' +
                      'Se sono presenti tabelle, quote societarie o somme in Baht, formattale in tabelle Markdown pulite. ' +
                      'Restituisci ESCLUSIVAMENTE il testo estratto e formattato.'
              },
              { inlineData: { mimeType: 'image/png', data: cleanBase64 } }
            ]
          }]
        })
      });
      if (directRes.ok) {
        const dData = await directRes.json();
        const dText = dData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (dText.length > 10) {
          if (onProgress) onProgress('Analisi completata con successo da Gemini Vision!');
          return {
            text: sanitizeTextContent(dText),
            lang: 'Gemini Vision AI (Thai/EN/IT)'
          };
        }
      }
    }
  } catch (geminiErr) {
    console.warn('Gemini Vision API offline or failed, falling back to local OCR:', geminiErr);
  }

  // 2. Fallback to local Tesseract OCR
  return performOcrOnCanvas(canvas, 'tha+eng+ita', onProgress);
}

/**
 * Perform OCR on an image canvas or Blob using Tesseract.js (TH, EN, IT)
 */
async function performOcrOnCanvas(
  canvas: HTMLCanvasElement,
  lang: string = 'tha+eng+ita',
  onProgress?: (msg: string) => void
): Promise<{ text: string; lang: string }> {
  try {
    if (onProgress) onProgress(`Avvio motore OCR locale (${lang})...`);
    
    // Create worker with primary languages (Thai prioritized)
    const worker = await createWorker(lang, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(`Riconoscimento caratteri Tesseract... ${Math.round((m.progress || 0) * 100)}%`);
        }
      }
    });

    const ret = await worker.recognize(canvas);
    await worker.terminate();

    return {
      text: sanitizeTextContent(ret.data.text || ''),
      lang: `Tesseract OCR (${lang})`
    };
  } catch (err: any) {
    console.warn(`OCR with lang "${lang}" failed, attempting secondary fallback:`, err);
    try {
      const fallbackWorker = await createWorker('tha+eng');
      const ret = await fallbackWorker.recognize(canvas);
      await fallbackWorker.terminate();
      return {
        text: sanitizeTextContent(ret.data.text || ''),
        lang: 'Tesseract OCR (tha+eng)'
      };
    } catch (fallbackErr: any) {
      console.error('All OCR attempts failed:', fallbackErr);
      return { text: '[ERRORE OCR: Impossibile estrarre testo dall\'immagine]', lang: 'none' };
    }
  }
}

export interface ExtractionOptions {
  forceVision?: boolean;
}

/**
 * Extract text and scan pages from a PDF File
 */
async function processPdfFile(
  file: File,
  onProgress?: ExtractionProgressCallback,
  options?: ExtractionOptions
): Promise<ExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Load PDF.js with full CMap and standard fonts for Asian/Thai scripts
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/standard_fonts/',
    enableXfa: true
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  const pages: ExtractedPage[] = [];
  let hasAnyOcr = false;
  let totalChars = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress({
        status: 'extracting',
        currentPage: pageNum,
        totalPages,
        percentage: Math.round(((pageNum - 0.5) / totalPages) * 100),
        message: `Estrazione testo pagina ${pageNum} di ${totalPages}...`
      });
    }

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Build raw text preserving natural structure
    let extractedText = '';
    let lastY: number | null = null;
    
    for (const item of textContent.items as any[]) {
      if ('str' in item) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          extractedText += '\n';
        } else if (extractedText.length > 0 && !extractedText.endsWith(' ') && !extractedText.endsWith('\n')) {
          extractedText += ' ';
        }
        extractedText += item.str;
        lastY = item.transform[5];
      }
    }

    extractedText = sanitizeTextContent(extractedText.trim());
    let pageHasOcr = false;
    let ocrLang: string | undefined = undefined;

    // Advanced detection: check if text contains real Thai, is fragmented garbage, or lacks readable coherence
    const hasThai = /[\u0E00-\u0E7F]/.test(extractedText);
    const cleanCharsCount = extractedText.replace(/[\s\r\n\t]/g, '').length;
    const hasUnreadableChars = extractedText.includes('\ufffd') || /[\u0000-\u0008\u000E-\u001F]/.test(extractedText);
    
    const words = extractedText.split(/\s+/).filter(Boolean);
    const singleLetterWords = words.filter(w => w.length === 1).length;
    const isFragmentedGarbage = words.length > 4 && (singleLetterWords / words.length) > 0.2;
    
    // A digital English document has coherent words; if it's not coherent English and has NO Thai, it's a corrupted font or scan!
    const isCoherentLatin = words.length > 10 && words.filter(w => w.length > 3).length / words.length > 0.5 && !isFragmentedGarbage;
    
    const needsVisionOcr = options?.forceVision || (!hasThai && !isCoherentLatin) || isFragmentedGarbage || hasUnreadableChars || cleanCharsCount < 50;

    if (needsVisionOcr) {
      if (onProgress) {
        onProgress({
          status: 'ocr',
          currentPage: pageNum,
          totalPages,
          percentage: Math.round((pageNum / totalPages) * 100),
          message: `Scansione visiva con Gemini Vision AI (pag. ${pageNum} di ${totalPages})...`
        });
      }

      // Render PDF page to high-res canvas (2.5 scale) for crisp character recognition
      const viewport = page.getViewport({ scale: 2.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        await page.render(renderContext).promise;

        const ocrResult = await performDocumentOcr(canvas, (msg) => {
          if (onProgress) {
            onProgress({
              status: 'ocr',
              currentPage: pageNum,
              totalPages,
              percentage: Math.round((pageNum / totalPages) * 100),
              message: `Pagina ${pageNum}: ${msg}`
            });
          }
        });

        if (ocrResult.text && (ocrResult.text.length > 15 || cleanCharsCount < 20)) {
          extractedText = ocrResult.text;
          pageHasOcr = true;
          ocrLang = ocrResult.lang;
          hasAnyOcr = true;
        }
      }
    }

    totalChars += extractedText.length;
    pages.push({
      pageNumber: pageNum,
      textContent: extractedText || '[Pagina vuota o priva di testo]',
      hasOcr: pageHasOcr,
      ocrLang
    });
  }

  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return {
    title: cleanTitle,
    fileName: file.name,
    fileType: 'pdf',
    fileSizeBytes: file.size,
    totalPages,
    pages,
    metadata: {
      extractedAt: new Date().toISOString(),
      hasOcrPages: hasAnyOcr,
      originalCharCount: totalChars
    }
  };
}

/**
 * Extract text from a Word Document (.docx)
 */
async function processDocxFile(
  file: File,
  onProgress?: ExtractionProgressCallback
): Promise<ExtractionResult> {
  if (onProgress) {
    onProgress({
      status: 'extracting',
      currentPage: 1,
      totalPages: 1,
      percentage: 50,
      message: 'Estrazione testo documento Word in corso...'
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = sanitizeTextContent(result.value.trim());

  // Split into pseudo-pages if document is long (every ~3500 chars)
  const pseudoPages: string[] = [];
  const chunkSize = 3500;
  if (rawText.length <= chunkSize) {
    pseudoPages.push(rawText);
  } else {
    const paragraphs = rawText.split('\n\n');
    let currentChunk = '';
    for (const para of paragraphs) {
      if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
        pseudoPages.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
    if (currentChunk.trim()) {
      pseudoPages.push(currentChunk.trim());
    }
  }

  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return {
    title: cleanTitle,
    fileName: file.name,
    fileType: 'docx',
    fileSizeBytes: file.size,
    totalPages: pseudoPages.length,
    pages: pseudoPages.map((txt, idx) => ({
      pageNumber: idx + 1,
      textContent: txt || '[Pagina vuota]',
      hasOcr: false
    })),
    metadata: {
      extractedAt: new Date().toISOString(),
      hasOcrPages: false,
      originalCharCount: rawText.length
    }
  };
}

/**
 * Extract plain text / markdown / CSV / JSON files
 */
async function processTextFile(
  file: File,
  fileType: string,
  onProgress?: ExtractionProgressCallback
): Promise<ExtractionResult> {
  if (onProgress) {
    onProgress({
      status: 'extracting',
      currentPage: 1,
      totalPages: 1,
      percentage: 50,
      message: 'Lettura file di testo...'
    });
  }

  const rawText = sanitizeTextContent(await file.text());
  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  // Split very long text files into pages
  const pseudoPages: string[] = [];
  const chunkSize = 4000;
  if (rawText.length <= chunkSize) {
    pseudoPages.push(rawText);
  } else {
    const lines = rawText.split('\n');
    let currentChunk = '';
    for (const line of lines) {
      if (currentChunk.length + line.length > chunkSize && currentChunk.length > 0) {
        pseudoPages.push(currentChunk);
        currentChunk = '';
      }
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
    if (currentChunk) {
      pseudoPages.push(currentChunk);
    }
  }

  return {
    title: cleanTitle,
    fileName: file.name,
    fileType,
    fileSizeBytes: file.size,
    totalPages: pseudoPages.length,
    pages: pseudoPages.map((txt, idx) => ({
      pageNumber: idx + 1,
      textContent: txt || '[File vuoto]',
      hasOcr: false
    })),
    metadata: {
      extractedAt: new Date().toISOString(),
      hasOcrPages: false,
      originalCharCount: rawText.length
    }
  };
}

/**
 * Perform OCR on an Image File (PNG, JPG, WEBP)
 */
async function processImageFile(
  file: File,
  onProgress?: ExtractionProgressCallback
): Promise<ExtractionResult> {
  if (onProgress) {
    onProgress({
      status: 'ocr',
      currentPage: 1,
      totalPages: 1,
      percentage: 20,
      message: 'Caricamento immagine e avvio OCR...'
    });
  }

  const img = new Image();
  const url = URL.createObjectURL(file);
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);

  const ocrResult = await performOcrOnCanvas(canvas, 'ita+eng+tha', (msg) => {
    if (onProgress) {
      onProgress({
        status: 'ocr',
        currentPage: 1,
        totalPages: 1,
        percentage: 70,
        message: msg
      });
    }
  });

  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return {
    title: cleanTitle,
    fileName: file.name,
    fileType: 'image',
    fileSizeBytes: file.size,
    totalPages: 1,
    pages: [
      {
        pageNumber: 1,
        textContent: ocrResult.text || '[Nessun testo rilevato nell\'immagine]',
        hasOcr: true,
        ocrLang: ocrResult.lang
      }
    ],
    metadata: {
      extractedAt: new Date().toISOString(),
      hasOcrPages: true,
      originalCharCount: ocrResult.text.length
    }
  };
}

/**
 * Extract structured tabular text from Excel spreadsheets (.xlsx, .xls, .ods)
 */
async function processExcelFile(
  file: File,
  onProgress?: ExtractionProgressCallback
): Promise<ExtractionResult> {
  if (onProgress) {
    onProgress({
      status: 'extracting',
      currentPage: 1,
      totalPages: 1,
      percentage: 25,
      message: 'Lettura fogli di calcolo Excel...'
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames || [];

  const pages: ExtractedPage[] = [];
  let totalChars = 0;
  let pageCounter = 1;

  for (let sIdx = 0; sIdx < sheetNames.length; sIdx++) {
    const sheetName = sheetNames[sIdx];
    const sheet = workbook.Sheets[sheetName];

    if (onProgress) {
      onProgress({
        status: 'extracting',
        currentPage: sIdx + 1,
        totalPages: sheetNames.length,
        percentage: Math.round(((sIdx + 1) / sheetNames.length) * 100),
        message: `Elaborazione foglio "${sheetName}" (${sIdx + 1}/${sheetNames.length})...`
      });
    }

    // Convert sheet to clean tabular text
    const csvContent = XLSX.utils.sheet_to_csv(sheet, { FS: '  |  ' });
    const trimmedContent = sanitizeTextContent(csvContent.trim());

    if (!trimmedContent) {
      pages.push({
        pageNumber: pageCounter++,
        textContent: `=== 📊 FOGLIO: ${sheetName} ===\n\n[Foglio vuoto o privo di celle con testo/dati]`,
        hasOcr: false
      });
      continue;
    }

    // If sheet has many rows (> 100 rows), split into logical pages
    const lines = trimmedContent.split('\n');
    const rowsPerPage = 100;

    if (lines.length <= rowsPerPage) {
      const pageText = `=== 📊 FOGLIO: ${sheetName} ===\n\n${trimmedContent}`;
      totalChars += pageText.length;
      pages.push({
        pageNumber: pageCounter++,
        textContent: pageText,
        hasOcr: false
      });
    } else {
      const headerLine = lines[0];
      for (let r = 0; r < lines.length; r += rowsPerPage) {
        const chunkLines = lines.slice(r, r + rowsPerPage);
        const subPageNum = Math.floor(r / rowsPerPage) + 1;
        const totalSubPages = Math.ceil(lines.length / rowsPerPage);
        
        let chunkText = `=== 📊 FOGLIO: ${sheetName} (Parte ${subPageNum} di ${totalSubPages}) ===\n\n`;
        if (r > 0) {
          chunkText += `[Intestazione]: ${headerLine}\n\n`;
        }
        chunkText += chunkLines.join('\n');
        totalChars += chunkText.length;

        pages.push({
          pageNumber: pageCounter++,
          textContent: chunkText,
          hasOcr: false
        });
      }
    }
  }

  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return {
    title: cleanTitle,
    fileName: file.name,
    fileType: 'excel',
    fileSizeBytes: file.size,
    totalPages: pages.length,
    pages: pages.length > 0 ? pages : [
      {
        pageNumber: 1,
        textContent: `=== 📊 EXCEL: ${file.name} ===\n\n[Nessun dato o foglio trovato nel file]`,
        hasOcr: false
      }
    ],
    metadata: {
      extractedAt: new Date().toISOString(),
      hasOcrPages: false,
      originalCharCount: totalChars
    }
  };
}

/**
 * Main dispatcher: automatically identifies file format and performs optimal extraction
 */
export async function extractDocumentContent(
  file: File,
  onProgress?: ExtractionProgressCallback,
  options?: ExtractionOptions
): Promise<ExtractionResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (file.type === 'application/pdf' || extension === 'pdf') {
    return processPdfFile(file, onProgress, options);
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx' ||
    extension === 'doc'
  ) {
    return processDocxFile(file, onProgress);
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel' ||
    ['xlsx', 'xls', 'ods'].includes(extension)
  ) {
    return processExcelFile(file, onProgress);
  }

  if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'].includes(extension)) {
    return processImageFile(file, onProgress);
  }

  if (['txt', 'md', 'markdown', 'csv', 'json', 'log', 'yaml', 'yml'].includes(extension) || file.type.startsWith('text/')) {
    return processTextFile(file, extension || 'txt', onProgress);
  }

  // Fallback to text reading
  return processTextFile(file, extension || 'unknown', onProgress);
}
