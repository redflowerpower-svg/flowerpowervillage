# 📄 Modulo Web Reader & Documenti (Reparto Stagno Autonomo)

## 1. Panoramica del Reparto
Il reparto **Web Reader & Documenti** (`/docs` o `/reader`) è un modulo **completamente indipendente e stagno** rispetto ai reparti Villaggio/Booking (`/villaggio`) e Pizzeria/Delivery (`/pizze`).

Il modulo trasforma file PDF, Excel (`.xlsx`, `.xls`, `.ods`, `.csv`), Word (`.docx`), immagini e testi in **mini-siti web strutturati a 256-bit** (`/read/[token]`), ottimizzati sia per la consultazione umana che per la comprensione immediata da parte di modelli **LLM e Web Agent** (ChatGPT, Claude, Gemini, DeepSeek, crawler cURL/Python).

---

## 2. Architettura & Risorse Dedicate

### A. Codice Sorgente Frontend
* `src/pages/DocumentReaderPage.tsx`: Visualizzatore pubblico a tema mini-sito web (`/read/:token` e `/read/:token/page/:pageNum`).
* `src/admin/components/DocumentReaderStudio.tsx`: Pannello gestionale staff con Drag & Drop multi-file, unione automatica bundle, timer in minuti, ridenominazione titoli ed espansione link.
* `src/lib/documentExtractor.ts`: Motore di estrazione ad altissima fedeltà per PDF (pdfjs-dist), Excel (xlsx SheetJS), DOCX (mammoth) e OCR multilingua (Tesseract ita+eng+tha).
* `src/lib/documentStore.ts`: Layer di persistenza e sincronizzazione con Storage e Database.

### B. Backend & Serverless API Dedicate
* `api/_handlers/documents-api.ts`: API per caricamento, cancellazione atomica a cascata, ridenominazione, aggiornamento scadenze e sincronizzazione indici.
* `api/_handlers/reader.ts`: Renderer server-side in puro HTML semantico per bot, LLM e scraper che non eseguono JavaScript.

### C. Database & Storage Isolati
* **Tabelle Supabase**:
  * `stored_documents`: Record principale con token, titolo identificativo web, nome file originale, tipo file, scadenza (`expires_at`), stato e metadata.
  * `document_pages`: Pagine indicizzate collegate esclusivamente a `stored_documents(id)` con `ON DELETE CASCADE`.
* **Storage Bucket**:
  * Bucket dedicato `documents` contenente i manifesti `manifests/[token].json` e l'indice generale `index_manifest.json`.

---

## 3. Regole di Sviluppo & Isolamento Stagno
1. **Nessuna dipendenza incrociata**: È vietato importare o dipendere da moduli, store o tabelle relative al booking hotel, Octorate, menu pizze, carrello o ordini.
2. **Zero interferenza**: Qualunque modifica o espansione futura del Web Reader deve essere confinata all'interno di questo modulo.
