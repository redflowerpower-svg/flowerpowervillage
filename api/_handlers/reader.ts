/**
 * Server-Side HTML Web Reader Handler
 * Serves /read/[token] and /read/[token]/page/[page_number] with pure semantic HTML.
 * Designed for 100% LLM, AI agent, and search bot readability without client JS.
 */

import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

const STORAGE_BUCKET = "documents";

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightSearch(text: string, query: string): string {
  if (!query || !query.trim()) return escapeHtml(text);
  const escapedText = escapeHtml(text);
  const escapedQuery = escapeHtml(query.trim());
  const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return escapedText.replace(regex, '<mark style="background-color: #fef08a; color: #854d0e; padding: 2px 4px; border-radius: 4px; font-weight: bold;">$1</mark>');
}

function formatServerContent(textContent: string, searchParam: string): string {
  if (!textContent) return '<p style="color:#71717a; font-style:italic;">[Pagina vuota]</p>';

  // Check if content is tabular / Excel sheet
  if (textContent.includes(" | ")) {
    const lines = textContent.split("\n").filter((l) => l.trim().length > 0);
    const titleLine = lines[0].startsWith("=== 📊 FOGLIO:") ? lines[0] : null;
    const dataLines = titleLine ? lines.slice(1) : lines;

    return `
      ${titleLine ? `<div style="font-size:12px; font-weight:800; color:#34d399; background:#064e3b; border:1px solid #059669; padding:6px 12px; border-radius:8px; display:inline-block; margin-bottom:12px;">${escapeHtml(titleLine.replace(/[=]/g, '').trim())}</div>` : ""}
      <div style="overflow-x:auto; border:1px solid #27272a; border-radius:8px; margin-top:8px;">
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
          <tbody>
            ${dataLines.map((line, rIdx) => {
              const cells = line.split(" | ").map((c) => c.trim());
              const isHeader = rIdx === 0;
              return `
                <tr style="border-bottom:1px solid #27272a; background:${isHeader ? '#27272a; font-weight:bold; color:#f4f4f5;' : rIdx % 2 === 0 ? '#18181b;' : '#1e1e24;'}">
                  ${cells.map((cell) => `
                    <td style="padding:8px 12px; border-right:1px solid #27272a; white-space:pre;">${highlightSearch(cell, searchParam)}</td>
                  `).join("")}
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  return `<div class="page-content">${highlightSearch(textContent, searchParam)}</div>`;
}

export async function handleDocumentReader(req: VercelRequest, res: VercelResponse) {
  // Set Anti-Indexing & Security Headers
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  const rawUrl = req.url || "";
  const queryToken = (req.query.token as string) || "";
  const searchParam = (req.query.q as string) || "";
  const keyParam = (req.query.key as string) || "";

  let token = (queryToken && queryToken !== 'read') ? queryToken : '';
  if (!token) {
    let pathClean = rawUrl.split("?")[0].replace(/^\/+/, "");
    pathClean = pathClean.replace(/^api\//, "").replace(/^read\/?/, "");
    const pathParts = pathClean.split("/").filter(Boolean);
    token = pathParts[0] || "";
    if (token === "read" && pathParts.length > 1) {
      token = pathParts[1];
    }
  }

  let targetPageNum: number | null = null;
  if (req.query.page) {
    targetPageNum = parseInt(req.query.page as string, 10) || null;
  } else {
    const rawParts = rawUrl.split("?")[0].split("/").filter(Boolean);
    const pageIdx = rawParts.indexOf("page");
    if (pageIdx !== -1 && rawParts.length > pageIdx + 1) {
      targetPageNum = parseInt(rawParts[pageIdx + 1], 10) || null;
    }
  }

  if (!token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="utf-8">
        <meta name="robots" content="noindex, nofollow">
        <title>Token Documento Mancante</title>
        <style>body{font-family:system-ui,sans-serif;background:#18181b;color:#f4f4f5;padding:40px;text-align:center;}</style>
      </head>
      <body>
        <h1>Token documento mancante</h1>
        <p>Specificare un token valido per accedere al reader.</p>
      </body>
      </html>
    `);
  }

  // 1. Fetch document from Storage manifest or DB
  let docData: any = null;

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(`manifests/${token}.json`);
      if (!error && data) {
        const text = await data.text();
        docData = JSON.parse(text);
      }
    } catch (err) {
      console.warn("Storage manifest fetch error:", err);
    }

    if (!docData) {
      try {
        const { data: doc, error: docErr } = await supabaseAdmin
          .from("stored_documents")
          .select("*")
          .eq("token", token)
          .single();

        if (!docErr && doc) {
          const { data: pages } = await supabaseAdmin
            .from("document_pages")
            .select("*")
            .eq("document_id", doc.id)
            .order("page_number", { ascending: true });

          docData = {
            ...doc,
            pages: (pages || []).map((p: any) => ({
              pageNumber: p.page_number,
              textContent: p.text_content,
              hasOcr: p.has_ocr,
              ocrLang: p.ocr_lang
            }))
          };
        }
      } catch (err) {
        console.error("DB query error in reader:", err);
      }
    }
  }

  // 2. Check existence & active status
  if (!docData) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="utf-8">
        <meta name="robots" content="noindex, nofollow">
        <title>Documento Non Trovato</title>
        <style>body{font-family:system-ui,sans-serif;background:#18181b;color:#f4f4f5;padding:50px;text-align:center;line-height:1.6;}h1{color:#ef4444;}</style>
      </head>
      <body>
        <h1>Documento Non Trovato (404)</h1>
        <p>Il documento richiesto non esiste o è stato rimosso.</p>
      </body>
      </html>
    `);
  }

  if (docData.is_active === false) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="utf-8">
        <meta name="robots" content="noindex, nofollow">
        <title>Documento Disattivato</title>
        <style>body{font-family:system-ui,sans-serif;background:#18181b;color:#f4f4f5;padding:50px;text-align:center;line-height:1.6;}h1{color:#f59e0b;}</style>
      </head>
      <body>
        <h1>Documento Temporaneamente Disattivato</h1>
        <p>L'accesso a questa documentazione è stato sospeso dall'amministratore.</p>
      </body>
      </html>
    `);
  }

  // 3. Verify access key if required
  if (docData.access_key && docData.access_key.trim()) {
    if (!keyParam || keyParam.trim() !== docData.access_key.trim()) {
      return res.status(401).send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="utf-8">
          <meta name="robots" content="noindex, nofollow">
          <title>Accesso Riservato</title>
          <style>body{font-family:system-ui,sans-serif;background:#18181b;color:#f4f4f5;padding:50px;text-align:center;max-width:500px;margin:0 auto;}input,button{padding:10px 14px;border-radius:8px;font-size:14px;margin-top:10px;}input{width:100%;background:#27272a;border:1px solid #3f3f46;color:#fff;box-sizing:border-box;}button{background:#8B1E1E;color:#fff;border:0;cursor:pointer;font-weight:bold;width:100%;}</style>
        </head>
        <body>
          <h1 style="color:#e11d48;">🔒 Documento Protetto</h1>
          <p>Questo documento richiede una chiave di autorizzazione per la lettura.</p>
          <form method="GET" action="">
            <input type="password" name="key" placeholder="Inserisci la chiave d'accesso..." required autofocus />
            ${searchParam ? `<input type="hidden" name="q" value="${escapeHtml(searchParam)}" />` : ""}
            <button type="submit">Accedi al Documento</button>
          </form>
        </body>
        </html>
      `);
    }
  }

  // 4. Check expiration date
  if (docData.expires_at) {
    const expiry = new Date(docData.expires_at).getTime();
    if (Date.now() > expiry) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="utf-8">
          <meta name="robots" content="noindex, nofollow">
          <title>Documento Scaduto</title>
          <style>body{font-family:system-ui,sans-serif;background:#18181b;color:#f4f4f5;padding:50px;text-align:center;line-height:1.6;}h1{color:#ef4444;}</style>
        </head>
        <body>
          <h1>Documento Scaduto (410 Gone)</h1>
          <p>La finestra temporale di consultazione per questo documento è terminata.</p>
        </body>
        </html>
      `);
    }
  }

  // 5. Filter / Select pages
  const allPages: any[] = docData.pages || [];
  let visiblePages = allPages;

  if (targetPageNum !== null) {
    visiblePages = allPages.filter((p: any) => p.pageNumber === targetPageNum);
    if (visiblePages.length === 0 && allPages.length > 0) {
      visiblePages = [allPages[0]];
      targetPageNum = 1;
    }
  }

  // Apply search query filter if present
  let matchCount = 0;
  if (searchParam && searchParam.trim()) {
    const qLower = searchParam.trim().toLowerCase();
    visiblePages = visiblePages.filter((p: any) => {
      const match = (p.textContent || "").toLowerCase().includes(qLower);
      if (match) matchCount++;
      return match;
    });
  }

  const title = escapeHtml(docData.title || docData.file_name || "Documento");
  const totalPages = docData.total_pages || allPages.length || 1;
  const fileType = escapeHtml((docData.file_type || "pdf").toUpperCase());
  const createdDate = new Date(docData.created_at || Date.now()).toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const baseUrl = `/read/${token}`;
  const keyQueryString = keyParam ? `&key=${encodeURIComponent(keyParam)}` : "";

  // Render pure, ultra-clean server HTML
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
  <title>${title} — Web Reader</title>
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #18181b;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --border: #27272a;
      --accent: #8B1E1E;
      --accent-light: #f43f5e;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #fafafa;
        --card-bg: #ffffff;
        --text: #18181b;
        --text-muted: #71717a;
        --border: #e4e4e7;
        --accent: #8B1E1E;
        --accent-light: #be123c;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.65;
      padding: 0 16px 60px 16px;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
    }
    header {
      padding: 32px 0 20px 0;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      align-items: center;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--border);
      color: var(--text-muted);
    }
    .badge-accent {
      background: var(--accent);
      color: #ffffff;
    }
    .badge-ocr {
      background: #0284c7;
      color: #ffffff;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      color: var(--text);
    }
    .meta-info {
      font-size: 13px;
      color: var(--text-muted);
    }
    .nav-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .search-form {
      display: flex;
      gap: 8px;
      flex-grow: 1;
      max-width: 400px;
    }
    .search-input {
      flex-grow: 1;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 13px;
    }
    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      background: var(--border);
      color: var(--text);
      border: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary {
      background: var(--accent);
      color: #ffffff;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .page-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 28px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .page-content {
      font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 15px;
      white-space: pre-wrap;
      word-break: break-word;
      color: var(--text);
      line-height: 1.7;
    }
    .pagination-footer {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 32px;
    }
    .toc-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 16px 0;
    }
    .toc-link {
      padding: 4px 10px;
      font-size: 12px;
      border-radius: 6px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text);
      text-decoration: none;
      font-weight: 600;
    }
    .toc-link.active {
      background: var(--accent);
      color: #ffffff;
      border-color: var(--accent);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badges">
        <span class="badge badge-accent">${fileType}</span>
        <span class="badge">${totalPages} ${totalPages === 1 ? "PAGINA" : "PAGINE"}</span>
        ${docData.metadata?.hasOcrPages ? '<span class="badge badge-ocr">🔍 TESTO ESTRATTO CON OCR</span>' : ""}
        <span class="badge">🔒 PROTETTO</span>
      </div>
      <h1>${title}</h1>
      <p class="meta-info">File: ${escapeHtml(docData.file_name)} · Caricato il ${createdDate} · Lettura diretta HTML</p>
    </header>

    <div class="nav-bar">
      <form method="GET" action="${baseUrl}" class="search-form">
        <input 
          type="text" 
          name="q" 
          value="${escapeHtml(searchParam)}" 
          placeholder="Cerca parole o frasi nel documento..." 
          class="search-input"
        />
        ${keyParam ? `<input type="hidden" name="key" value="${escapeHtml(keyParam)}" />` : ""}
        <button type="submit" class="btn btn-primary">Cerca</button>
        ${searchParam ? `<a href="${baseUrl}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ""}" class="btn">Reset</a>` : ""}
      </form>

      <div style="display:flex; gap:8px; align-items:center;">
        ${targetPageNum !== null ? `
          <a href="${baseUrl}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ""}" class="btn">Mostra Tutte le Pagine</a>
        ` : `
          <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Vista Completa (${totalPages} pag.)</span>
        `}
      </div>
    </div>

    ${totalPages > 1 ? `
      <div class="toc-grid">
        <span style="font-size:12px; font-weight:700; color:var(--text-muted); align-self:center; margin-right:4px;">Pagine:</span>
        ${allPages.map((p: any) => `
          <a href="${baseUrl}/page/${p.pageNumber}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ""}" class="toc-link ${targetPageNum === p.pageNumber ? "active" : ""}">
            ${p.pageNumber}
          </a>
        `).join("")}
      </div>
    ` : ""}

    ${searchParam ? `
      <div style="margin-bottom:18px; font-size:13px; color:var(--text-muted);">
        Risultati per: <strong>"${escapeHtml(searchParam)}"</strong> · 
        ${visiblePages.length === 0 ? '<span style="color:#ef4444;">Nessuna corrispondenza trovata</span>' : `Trovate corrispondenze in ${visiblePages.length} pagina/e`}
      </div>
    ` : ""}

    <main>
      ${visiblePages.length === 0 ? `
        <div class="page-card" style="text-align:center; padding:40px;">
          <p style="color:var(--text-muted);">Nessun contenuto da visualizzare con i filtri attuali.</p>
        </div>
      ` : visiblePages.map((page: any, idx: number) => {
        const fileIdx = page.sourceFileIndex || 1;
        const fileName = page.sourceFileName || docData.file_name;
        const pageInThisFile = page.sourcePageNumber || page.pageNumber;
        const prevPageFileIdx = idx > 0 ? (visiblePages[idx - 1].sourceFileIndex || 1) : null;
        const isFirstPageOfFile = (targetPageNum === null && (idx === 0 || fileIdx !== prevPageFileIdx));

        return `
          ${isFirstPageOfFile ? `
            <div style="background:linear-gradient(90deg, #082f49 0%, #18181b 100%); border:1px solid #0284c7; border-radius:12px; padding:14px 20px; margin:${idx === 0 ? '0' : '36px'} 0 16px 0; display:flex; align-items:center; gap:12px;">
              <div style="width:32px; height:32px; border-radius:8px; background:#0369a1; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px;">#${fileIdx}</div>
              <div>
                <div style="font-size:12px; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.05em;">DOCUMENTO #${fileIdx} NEL LINK</div>
                <div style="font-size:13px; color:#f0f9ff; font-weight:600;">${escapeHtml(fileName)}</div>
              </div>
            </div>
          ` : ''}
          <article class="page-card" id="page-${page.pageNumber}">
            <div class="page-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="background:#082f49; color:#38bdf8; border:1px solid #0284c7; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">FILE #${fileIdx}</span>
                <span>Pagina ${page.pageNumber} di ${totalPages} ${pageInThisFile ? `· (Pag. ${pageInThisFile} del File #${fileIdx})` : ''}</span>
              </div>
              ${page.hasOcr ? `<span style="color:#0284c7;">OCR Attivo (${escapeHtml(page.ocrLang || "ita+eng+tha")})</span>` : "<span>Testo Diretto</span>"}
            </div>
            ${formatServerContent(page.textContent || "", searchParam)}
          </article>
        `;
      }).join("")}
    </main>

    ${targetPageNum !== null && totalPages > 1 ? `
      <footer class="pagination-footer">
        ${targetPageNum > 1 ? `
          <a href="${baseUrl}/page/${targetPageNum - 1}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ""}" class="btn">
            ← Pagina Precedente (${targetPageNum - 1})
          </a>
        ` : ""}
        ${targetPageNum < totalPages ? `
          <a href="${baseUrl}/page/${targetPageNum + 1}${keyParam ? `?key=${encodeURIComponent(keyParam)}` : ""}" class="btn btn-primary">
            Pagina Successiva (${targetPageNum + 1}) →
          </a>
        ` : ""}
      </footer>
    ` : ""}
  </div>
</body>
</html>`;

  return res.status(200).send(html);
}
