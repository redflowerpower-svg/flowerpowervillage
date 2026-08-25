/**
 * Documents Admin API Handler
 * Uses Supabase Service Role to perform uploads, manifest saves, and CRUD operations
 * bypassing RLS restrictions safely for staff members.
 */

import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

const STORAGE_BUCKET = "documents";
const INDEX_FILE = "index_manifest.json";

export async function handleDocumentsApi(req: VercelRequest, res: VercelResponse) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase service role non configurato sul server." });
  }

  const action = (req.query.action as string) || req.body?.action || "";

  // 1. Ensure bucket exists
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.some((b: any) => b.name === STORAGE_BUCKET)) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, { public: true, fileSizeLimit: 52428800 });
    }
  } catch (err) {
    // continue
  }

  // 2. Dispatch actions
  switch (action) {
    case "list": {
      try {
        const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(INDEX_FILE);
        if (error || !data) {
          // Try DB fallback
          const { data: dbDocs } = await supabaseAdmin.from("stored_documents").select("*").order("created_at", { ascending: false });
          return res.status(200).json({ documents: dbDocs || [] });
        }
        const text = await data.text();
        return res.status(200).json({ documents: JSON.parse(text) || [] });
      } catch (err: any) {
        return res.status(200).json({ documents: [] });
      }
    }

    case "get": {
      const token = (req.query.token as string) || req.body?.token;
      if (!token) return res.status(400).json({ error: "Token mancante" });

      try {
        const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(`manifests/${token}.json`);
        if (!error && data) {
          const text = await data.text();
          return res.status(200).json({ document: JSON.parse(text) });
        }

        // DB Fallback
        const { data: doc, error: docErr } = await supabaseAdmin.from("stored_documents").select("*").eq("token", token).single();
        if (docErr || !doc) {
          return res.status(404).json({ error: "Documento non trovato" });
        }

        const { data: pages } = await supabaseAdmin.from("document_pages").select("*").eq("document_id", doc.id).order("page_number", { ascending: true });

        const sourceFiles = (doc.metadata as any)?.sourceFiles || [];

        return res.status(200).json({
          document: {
            ...doc,
            pages: (pages || []).map((p: any) => {
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
          }
        });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    case "save": {
      const doc = req.body?.document;
      if (!doc || !doc.token) {
        return res.status(400).json({ error: "Dati documento mancanti." });
      }

      try {
        // Save manifest
        const manifestBlob = Buffer.from(JSON.stringify(doc, null, 2), "utf-8");
        await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(`manifests/${doc.token}.json`, manifestBlob, {
          upsert: true,
          contentType: "application/json"
        });

        // Update index manifest
        let currentIndex: any[] = [];
        try {
          const { data } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(INDEX_FILE);
          if (data) {
            const text = await data.text();
            currentIndex = JSON.parse(text) || [];
          }
        } catch (_) {}

        const indexEntry = { ...doc };
        delete indexEntry.pages;
        const updatedIndex = [indexEntry, ...currentIndex.filter((d: any) => d.token !== doc.token)];
        
        await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(
          INDEX_FILE,
          Buffer.from(JSON.stringify(updatedIndex, null, 2), "utf-8"),
          { upsert: true, contentType: "application/json" }
        );

        // Try DB insert
        try {
          await supabaseAdmin.from("stored_documents").upsert({
            id: doc.id,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
            title: doc.title,
            file_name: doc.file_name,
            file_type: doc.file_type,
            file_url: doc.file_url,
            file_size_bytes: doc.file_size_bytes,
            token: doc.token,
            total_pages: doc.total_pages,
            status: doc.status,
            is_active: doc.is_active,
            access_key: doc.access_key,
            expires_at: doc.expires_at,
            metadata: doc.metadata
          });

          if (doc.pages && doc.pages.length > 0) {
            const pageRows = doc.pages.map((p: any) => ({
              document_id: doc.id,
              page_number: p.pageNumber,
              text_content: p.textContent,
              has_ocr: p.hasOcr || false,
              ocr_lang: p.ocrLang || null
            }));
            await supabaseAdmin.from("document_pages").upsert(pageRows);
          }
        } catch (dbErr) {
          console.warn("DB upsert skipped:", dbErr);
        }

        return res.status(200).json({ success: true, token: doc.token });
      } catch (err: any) {
        console.error("Save error:", err);
        return res.status(500).json({ error: err.message || "Errore salvataggio." });
      }
    }

    case "toggle": {
      const { token, isActive } = req.body || {};
      if (!token) return res.status(400).json({ error: "Token mancante" });

      try {
        // Update manifest
        try {
          const { data } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(`manifests/${token}.json`);
          if (data) {
            const doc = JSON.parse(await data.text());
            doc.is_active = isActive;
            doc.updated_at = new Date().toISOString();
            await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(
              `manifests/${token}.json`,
              Buffer.from(JSON.stringify(doc, null, 2), "utf-8"),
              { upsert: true, contentType: "application/json" }
            );
          }
        } catch (_) {}

        // Update index
        try {
          const { data } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(INDEX_FILE);
          if (data) {
            const index = JSON.parse(await data.text()) || [];
            const updated = index.map((d: any) => (d.token === token ? { ...d, is_active: isActive } : d));
            await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(
              INDEX_FILE,
              Buffer.from(JSON.stringify(updated, null, 2), "utf-8"),
              { upsert: true, contentType: "application/json" }
            );
          }
        } catch (_) {}

        // Update DB
        try {
          await supabaseAdmin.from("stored_documents").update({ is_active: isActive }).eq("token", token);
        } catch (_) {}

        return res.status(200).json({ success: true });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    case "delete": {
      const token = (req.query.token as string) || req.body?.token;
      if (!token) return res.status(400).json({ error: "Token mancante" });

      try {
        // 1. Fetch document and delete child pages to prevent Foreign Key constraint errors
        try {
          const { data: docRow } = await supabaseAdmin
            .from("stored_documents")
            .select("id, file_url")
            .eq("token", token)
            .single();

          if (docRow?.id) {
            await supabaseAdmin.from("document_pages").delete().eq("document_id", docRow.id);
            await supabaseAdmin.from("stored_documents").delete().eq("id", docRow.id);
          } else {
            await supabaseAdmin.from("stored_documents").delete().eq("token", token);
          }

          if (docRow?.file_url) {
            const urlParts = docRow.file_url.split("/documents/");
            if (urlParts.length > 1) {
              const filePath = decodeURIComponent(urlParts[1]);
              await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([filePath]);
            }
          }
        } catch (dbErr) {
          console.warn("DB delete error:", dbErr);
        }

        // 2. Remove manifest file from storage
        await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([`manifests/${token}.json`]);

        // 3. Remove from index_manifest.json
        try {
          const { data: idxData } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(INDEX_FILE);
          if (idxData) {
            const index = JSON.parse(await idxData.text()) || [];
            const filtered = index.filter((d: any) => d.token !== token);
            await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(
              INDEX_FILE,
              Buffer.from(JSON.stringify(filtered, null, 2), "utf-8"),
              { upsert: true, contentType: "application/json" }
            );
          }
        } catch (_) {}

        return res.status(200).json({ success: true });
      } catch (err: any) {
        console.error("Delete action error:", err);
        return res.status(500).json({ error: err.message });
      }
    }

    default:
      return res.status(400).json({ error: "Azione non valida." });
  }
}
