-- Migration: 20260825000000_create_pdf_document_reader_tables.sql
-- Description: Create tables for Document & PDF Web Reader (stored_documents, document_pages)

CREATE TABLE IF NOT EXISTS public.stored_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_url TEXT,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  token TEXT UNIQUE NOT NULL,
  total_pages INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  access_key TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.document_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.stored_documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  text_content TEXT NOT NULL DEFAULT '',
  has_ocr BOOLEAN NOT NULL DEFAULT false,
  ocr_lang TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_document_page UNIQUE (document_id, page_number)
);

-- Indices for rapid lookup & pagination
CREATE INDEX IF NOT EXISTS idx_stored_docs_token ON public.stored_documents (token);
CREATE INDEX IF NOT EXISTS idx_stored_docs_created ON public.stored_documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_pages_doc_page ON public.document_pages (document_id, page_number);

-- Enable RLS
ALTER TABLE public.stored_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;

-- Policies for public reading via token / serverless
DROP POLICY IF EXISTS "Public read access for active stored_documents" ON public.stored_documents;
CREATE POLICY "Public read access for active stored_documents"
  ON public.stored_documents
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for document_pages of active documents" ON public.document_pages;
CREATE POLICY "Public read access for document_pages of active documents"
  ON public.document_pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stored_documents sd
      WHERE sd.id = document_pages.document_id AND sd.is_active = true
    )
  );

-- Service role full access policies
DROP POLICY IF EXISTS "Service role full access on stored_documents" ON public.stored_documents;
CREATE POLICY "Service role full access on stored_documents"
  ON public.stored_documents
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on document_pages" ON public.document_pages;
CREATE POLICY "Service role full access on document_pages"
  ON public.document_pages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- --------------------------------------------------------
-- Storage Bucket & Objects Policies for 'documents'
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public select on documents bucket" ON storage.objects;
CREATE POLICY "Public select on documents bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow upload to documents bucket" ON storage.objects;
CREATE POLICY "Allow upload to documents bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow update to documents bucket" ON storage.objects;
CREATE POLICY "Allow update to documents bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow delete from documents bucket" ON storage.objects;
CREATE POLICY "Allow delete from documents bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents');

