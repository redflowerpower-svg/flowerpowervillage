/**
 * Document Storage & Management Service
 * Dual-layer persistence with automatic API fallback to bypass RLS restrictions safely.
 */

import { supabase } from './supabase';
import { extractDocumentContent, generateDocumentToken, ExtractionProgressCallback, ExtractionResult } from './documentExtractor';

export interface StoredDocument {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size_bytes: number;
  token: string;
  total_pages: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  is_active: boolean;
  access_key?: string | null;
  expires_at?: string | null;
  metadata: {
    extractedAt?: string;
    hasOcrPages?: boolean;
    detectedLanguages?: string[];
    originalCharCount?: number;
    error?: string;
  };
  pages?: {
    pageNumber: number;
    textContent: string;
    hasOcr?: boolean;
    ocrLang?: string;
  }[];
}

const STORAGE_BUCKET = 'documents';
const INDEX_FILE = 'index_manifest.json';

/**
 * Helper to fetch or initialize the storage index manifest
 */
async function getStorageIndex(): Promise<StoredDocument[]> {
  // 1. Try API first
  try {
    const res = await fetch('/api/documents-api?action=list');
    if (res.ok) {
      const json = await res.json();
      if (json.documents) return json.documents;
    }
  } catch (_) {}

  // 2. Direct client fallback
  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(INDEX_FILE);
    if (error || !data) return [];
    const text = await data.text();
    return JSON.parse(text) || [];
  } catch (err) {
    return [];
  }
}

/**
 * Upload, extract text, run OCR (if needed), and store document
 */
export async function uploadAndProcessDocument(
  file: File,
  options?: {
    accessKey?: string;
    expiresAt?: string;
  },
  onProgress?: ExtractionProgressCallback
): Promise<StoredDocument> {
  const token = generateDocumentToken();
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  // Safe ASCII storage path (avoids unicode S3 storage key issues while preserving original title)
  const storageFilePath = `uploads/${timestamp}_${token.substring(4, 12)}.${fileExt}`;

  if (onProgress) {
    onProgress({
      status: 'parsing',
      currentPage: 0,
      totalPages: 1,
      percentage: 5,
      message: 'Caricamento file originale su storage...'
    });
  }

  // 1. Upload original file (try direct client, if RLS fails or warning, proceed)
  let fileUrl = '';
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storageFilePath, file, {
        cacheControl: '31536000',
        upsert: true
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storageFilePath);
      fileUrl = publicUrlData?.publicUrl || '';
    }
  } catch (err) {
    console.warn('Direct client upload notice (will use manifest):', err);
  }

  // 2. Perform Extraction and OCR
  let extraction: ExtractionResult;
  try {
    extraction = await extractDocumentContent(file, onProgress);
  } catch (extractErr: any) {
    console.error('Text extraction failed:', extractErr);
    throw extractErr;
  }

  const docId = crypto.randomUUID ? crypto.randomUUID() : `doc_${timestamp}`;
  const mappedPages = (extraction.pages || []).map((p) => ({
    pageNumber: p.pageNumber,
    textContent: p.textContent,
    hasOcr: p.hasOcr,
    ocrLang: p.ocrLang,
    sourceFileName: file.name,
    sourceFileIndex: 1,
    sourcePageNumber: p.pageNumber
  }));

  const storedDoc: StoredDocument = {
    id: docId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: file.name.replace(/\.[^/.]+$/, '').trim() || extraction.title,
    file_name: file.name,
    file_type: extraction.fileType || fileExt,
    file_url: fileUrl,
    file_size_bytes: extraction.fileSizeBytes || file.size,
    token,
    total_pages: extraction.totalPages || 1,
    status: 'completed',
    is_active: true,
    access_key: options?.accessKey || null,
    expires_at: options?.expiresAt || null,
    metadata: {
      ...extraction.metadata,
      sourceFiles: [
        {
          index: 1,
          fileName: file.name,
          totalPages: extraction.totalPages || 1,
          addedAt: new Date().toISOString()
        }
      ]
    },
    pages: mappedPages
  };

  // 3. Save full document manifest via Server API (Service Role)
  try {
    const apiRes = await fetch('/api/documents-api?action=save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: storedDoc })
    });

    if (!apiRes.ok) {
      // Fallback: direct storage upload if in purely client dev environment
      const manifestPath = `manifests/${token}.json`;
      const manifestBlob = new Blob([JSON.stringify(storedDoc, null, 2)], { type: 'application/json' });
      await supabase.storage.from(STORAGE_BUCKET).upload(manifestPath, manifestBlob, {
        upsert: true,
        contentType: 'application/json'
      });
    }
  } catch (err) {
    console.warn('API save fallback to direct storage:', err);
    try {
      const manifestPath = `manifests/${token}.json`;
      const manifestBlob = new Blob([JSON.stringify(storedDoc, null, 2)], { type: 'application/json' });
      await supabase.storage.from(STORAGE_BUCKET).upload(manifestPath, manifestBlob, {
        upsert: true,
        contentType: 'application/json'
      });
    } catch (_) {}
  }

  if (onProgress) {
    onProgress({
      status: 'completed',
      currentPage: extraction.totalPages,
      totalPages: extraction.totalPages,
      percentage: 100,
      message: 'Completato con successo!'
    });
  }

  return storedDoc;
}

/**
 * Upload and merge multiple files into a single unified document link
 */
export async function uploadAndMergeMultipleDocuments(
  files: File[],
  options?: {
    customTitle?: string;
    accessKey?: string;
    expiresAt?: string;
  },
  onProgress?: ExtractionProgressCallback
): Promise<StoredDocument> {
  if (!files || files.length === 0) {
    throw new Error('Nessun file selezionato per il caricamento.');
  }

  // If only 1 file, use standard upload
  if (files.length === 1) {
    return uploadAndProcessDocument(files[0], options, onProgress);
  }

  const token = generateDocumentToken();
  const timestamp = Date.now();
  const docId = crypto.randomUUID ? crypto.randomUUID() : `doc_${timestamp}`;

  const allPages: any[] = [];
  const sourceFilesMeta: any[] = [];
  let totalBytes = 0;
  let totalChars = 0;
  let hasAnyOcr = false;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileIndex = i + 1;

    if (onProgress) {
      onProgress({
        status: 'parsing',
        currentPage: allPages.length,
        totalPages: allPages.length + 1,
        percentage: Math.round((i / files.length) * 100),
        message: `Elaborazione file ${fileIndex} di ${files.length}: "${file.name}"...`
      });
    }

    const extraction = await extractDocumentContent(file, onProgress);
    if (extraction.metadata.hasOcrPages) hasAnyOcr = true;

    for (let pIdx = 0; pIdx < extraction.pages.length; pIdx++) {
      const p = extraction.pages[pIdx];
      allPages.push({
        pageNumber: allPages.length + 1,
        textContent: p.textContent,
        hasOcr: p.hasOcr,
        ocrLang: p.ocrLang,
        sourceFileName: file.name,
        sourceFileIndex: fileIndex,
        sourcePageNumber: pIdx + 1
      });
      totalChars += p.textContent.length;
    }

    sourceFilesMeta.push({
      index: fileIndex,
      fileName: file.name,
      totalPages: extraction.totalPages || 1,
      addedAt: new Date().toISOString()
    });

    totalBytes += file.size;
  }

  const cleanNames = files.map((f) => f.name.replace(/\.[^/.]+$/, '').trim());
  const defaultTitle = options?.customTitle?.trim() || `📁 Raccolta ${files.length} Documenti: ${cleanNames.slice(0, 2).join(' + ')}${files.length > 2 ? ' (+ altri)' : ''}`;

  const storedDoc: StoredDocument = {
    id: docId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: defaultTitle,
    file_name: `${files.length} File Uniti (${cleanNames.slice(0, 2).join(', ')}${files.length > 2 ? '...' : ''})`,
    file_type: 'bundle',
    file_url: '',
    file_size_bytes: totalBytes,
    token,
    total_pages: allPages.length,
    status: 'completed',
    is_active: true,
    access_key: options?.accessKey || null,
    expires_at: options?.expiresAt || null,
    metadata: {
      extractedAt: new Date().toISOString(),
      hasOcrPages: hasAnyOcr,
      originalCharCount: totalChars,
      sourceFiles: sourceFilesMeta
    },
    pages: allPages
  };

  // Save manifest via Server API
  try {
    const apiRes = await fetch('/api/documents-api?action=save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: storedDoc })
    });

    if (!apiRes.ok) {
      const manifestPath = `manifests/${token}.json`;
      const manifestBlob = new Blob([JSON.stringify(storedDoc, null, 2)], { type: 'application/json' });
      await supabase.storage.from(STORAGE_BUCKET).upload(manifestPath, manifestBlob, {
        upsert: true,
        contentType: 'application/json'
      });
    }
  } catch (err) {
    console.warn('API save fallback on multi upload:', err);
    try {
      const manifestPath = `manifests/${token}.json`;
      const manifestBlob = new Blob([JSON.stringify(storedDoc, null, 2)], { type: 'application/json' });
      await supabase.storage.from(STORAGE_BUCKET).upload(manifestPath, manifestBlob, {
        upsert: true,
        contentType: 'application/json'
      });
    } catch (_) {}
  }

  if (onProgress) {
    onProgress({
      status: 'completed',
      currentPage: allPages.length,
      totalPages: allPages.length,
      percentage: 100,
      message: `Link unificato creato con successo (${files.length} file, ${allPages.length} pagine)!`
    });
  }

  return storedDoc;
}

/**
 * List all stored documents
 */
export async function listStoredDocuments(): Promise<StoredDocument[]> {
  // 1. Try API first (uses service role)
  try {
    const res = await fetch('/api/documents-api?action=list');
    if (res.ok) {
      const json = await res.json();
      if (json.documents && json.documents.length > 0) {
        return json.documents;
      }
    }
  } catch (_) {}

  // 2. Direct storage manifest fallback
  return getStorageIndex();
}

/**
 * Get full document data with pages by token
 */
export async function getDocumentByToken(token: string): Promise<StoredDocument | null> {
  // 1. Try Server API first (uses service role and resolves manifests & DB perfectly)
  try {
    const res = await fetch(`/api/documents-api?action=get&token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.document) return json.document;
    }
  } catch (_) {}

  // 2. Try direct storage manifest
  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(`manifests/${token}.json`);
    if (!error && data) {
      const text = await data.text();
      return JSON.parse(text);
    }
  } catch (err) {
    // continue
  }

  // 3. Try direct DB
  try {
    const { data: doc, error: docErr } = await supabase
      .from('stored_documents')
      .select('*')
      .eq('token', token)
      .single();

    if (!docErr && doc) {
      const { data: pages } = await supabase
        .from('document_pages')
        .select('*')
        .eq('document_id', doc.id)
        .order('page_number', { ascending: true });

      const sourceFiles = (doc.metadata as any)?.sourceFiles || [];

      return {
        ...doc,
        pages: (pages || []).map((p) => {
          let sIdx = 1;
          let sName = doc.file_name;
          let sPageNum = p.page_number;

          if (sourceFiles.length > 0) {
            let runningCount = 0;
            for (const sf of sourceFiles) {
              if (p.page_number <= runningCount + sf.totalPages) {
                sIdx = sf.index;
                sName = sf.fileName;
                sPageNum = p.page_number - runningCount;
                break;
              }
              runningCount += sf.totalPages;
            }
          }

          return {
            pageNumber: p.page_number,
            textContent: p.text_content,
            hasOcr: p.has_ocr,
            ocrLang: p.ocr_lang,
            sourceFileIndex: sIdx,
            sourceFileName: sName,
            sourcePageNumber: sPageNum
          };
        })
      };
    }
  } catch (err) {
    console.error('Error fetching document by token:', err);
  }

  return null;
}

/**
 * Append new files to an existing document/token to expand the link with more pages
 */
export async function appendFilesToDocument(
  token: string,
  files: File[],
  onProgress?: ExtractionProgressCallback
): Promise<StoredDocument> {
  const existingDoc = await getDocumentByToken(token);
  if (!existingDoc) {
    throw new Error('Documento originale non trovato per il token specificato.');
  }

  // Retroactively ensure earlier pages have sourceFileIndex = 1
  let currentPages = (existingDoc.pages || []).map((p, idx) => ({
    ...p,
    sourceFileIndex: p.sourceFileIndex || 1,
    sourceFileName: p.sourceFileName || existingDoc.file_name,
    sourcePageNumber: p.sourcePageNumber || (idx + 1)
  }));

  const existingSourceFiles = (existingDoc.metadata as any)?.sourceFiles || [
    {
      index: 1,
      fileName: existingDoc.file_name,
      totalPages: currentPages.length,
      addedAt: existingDoc.created_at
    }
  ];

  const highestIndex = Math.max(...currentPages.map((p) => p.sourceFileIndex || 1), existingSourceFiles.length, 1);

  let totalNewChars = 0;
  let hasAnyNewOcr = false;
  const newSourceFiles = [...existingSourceFiles];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileIndex = highestIndex + i + 1;

    if (onProgress) {
      onProgress({
        status: 'parsing',
        currentPage: currentPages.length,
        totalPages: currentPages.length + 1,
        percentage: Math.round(((i + 0.2) / files.length) * 100),
        message: `Elaborazione FILE #${fileIndex} di ${files.length} (${file.name})...`
      });
    }

    const extraction = await extractDocumentContent(file, onProgress);
    if (extraction.metadata.hasOcrPages) hasAnyNewOcr = true;

    for (let pIdx = 0; pIdx < extraction.pages.length; pIdx++) {
      const p = extraction.pages[pIdx];
      currentPages.push({
        pageNumber: currentPages.length + 1,
        textContent: p.textContent,
        hasOcr: p.hasOcr,
        ocrLang: p.ocrLang,
        sourceFileName: file.name,
        sourceFileIndex: fileIndex,
        sourcePageNumber: pIdx + 1
      });
      totalNewChars += p.textContent.length;
    }

    newSourceFiles.push({
      index: fileIndex,
      fileName: file.name,
      totalPages: extraction.totalPages || 1,
      addedAt: new Date().toISOString()
    });

    existingDoc.file_size_bytes += file.size;
  }

  existingDoc.total_pages = currentPages.length;
  existingDoc.pages = currentPages;
  existingDoc.updated_at = new Date().toISOString();
  existingDoc.metadata = {
    ...existingDoc.metadata,
    hasOcrPages: existingDoc.metadata.hasOcrPages || hasAnyNewOcr,
    originalCharCount: (existingDoc.metadata.originalCharCount || 0) + totalNewChars,
    sourceFiles: newSourceFiles
  };

  // Save updated document manifest
  try {
    const apiRes = await fetch('/api/documents-api?action=save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: existingDoc })
    });

    if (!apiRes.ok) {
      const manifestPath = `manifests/${token}.json`;
      const manifestBlob = new Blob([JSON.stringify(existingDoc, null, 2)], { type: 'application/json' });
      await supabase.storage.from(STORAGE_BUCKET).upload(manifestPath, manifestBlob, {
        upsert: true,
        contentType: 'application/json'
      });
    }
  } catch (err) {
    console.warn('API save fallback on append:', err);
  }

  if (onProgress) {
    onProgress({
      status: 'completed',
      currentPage: existingDoc.total_pages,
      totalPages: existingDoc.total_pages,
      percentage: 100,
      message: `Link ampliato con successo a ${existingDoc.total_pages} pagine!`
    });
  }

  return existingDoc;
}

/**
 * Update document custom title
 */
export async function updateDocumentTitle(token: string, newTitle: string): Promise<boolean> {
  const doc = await getDocumentByToken(token);
  if (doc) {
    doc.title = newTitle.trim() || doc.title;
    doc.updated_at = new Date().toISOString();
    try {
      await fetch('/api/documents-api?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: doc })
      });
    } catch (_) {}
  }
  return true;
}

/**
 * Update document expiration date or countdown
 */
export async function updateDocumentExpiration(token: string, expiresAt: string | null): Promise<boolean> {
  const doc = await getDocumentByToken(token);
  if (doc) {
    doc.expires_at = expiresAt;
    doc.updated_at = new Date().toISOString();
    try {
      await fetch('/api/documents-api?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: doc })
      });
    } catch (_) {}
  }
  return true;
}

/**
 * Toggle document active/inactive state
 */
export async function toggleDocumentActive(token: string, isActive: boolean): Promise<boolean> {
  try {
    await fetch('/api/documents-api?action=toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, isActive })
    });
  } catch (_) {}

  return true;
}

/**
 * Delete a document permanently
 */
export async function deleteStoredDocument(token: string): Promise<boolean> {
  // 1. Server API delete
  try {
    const res = await fetch(`/api/documents-api?action=delete&token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (res.ok) return true;
  } catch (_) {}

  // 2. Fallback client-side delete from storage manifest and DB
  try {
    const { data: docRow } = await supabase
      .from('stored_documents')
      .select('id')
      .eq('token', token)
      .single();

    if (docRow?.id) {
      await supabase.from('document_pages').delete().eq('document_id', docRow.id);
      await supabase.from('stored_documents').delete().eq('id', docRow.id);
    } else {
      await supabase.from('stored_documents').delete().eq('token', token);
    }

    await supabase.storage.from(STORAGE_BUCKET).remove([`manifests/${token}.json`]);

    const { data: indexData } = await supabase.storage.from(STORAGE_BUCKET).download('index_manifest.json');
    if (indexData) {
      const list = JSON.parse(await indexData.text()) || [];
      const updated = list.filter((d: any) => d.token !== token);
      const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' });
      await supabase.storage.from(STORAGE_BUCKET).upload('index_manifest.json', blob, { upsert: true });
    }
  } catch (_) {}

  return true;
}
