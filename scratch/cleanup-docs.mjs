import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

let envText = '';
try { envText += fs.readFileSync('.env.local', 'utf8') + '\n'; } catch (_) {}
try { envText += fs.readFileSync('.env', 'utf8') + '\n'; } catch (_) {}

const envVars = {};
for (const line of envText.split('\n')) {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[match[1]] = val;
  }
}

const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function run() {
  const { data: files } = await supabase.storage.from('documents').list('manifests');
  console.log('Manifest files on storage:', files?.map(f => f.name));

  const validDocs = [];
  for (const f of (files || [])) {
    if (f.name.endsWith('.json')) {
      const { data } = await supabase.storage.from('documents').download('manifests/' + f.name);
      if (data) {
        try {
          const doc = JSON.parse(await data.text());
          validDocs.push(doc);
        } catch (_) {}
      }
    }
  }

  console.log('Valid manifests loaded:', validDocs.map(d => ({ title: d.title, token: d.token, date: d.created_at })));

  // If more than 1, sort descending by date and keep ONLY the single most recent one
  validDocs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const toKeep = validDocs.slice(0, 1);
  const toDelete = validDocs.slice(1);

  console.log('Strictly keeping 1 document:', toKeep.map(d => ({ title: d.title, token: d.token })));
  console.log('Deleting older ones:', toDelete.map(d => ({ title: d.title, token: d.token })));

  for (const d of toDelete) {
    await supabase.storage.from('documents').remove([`manifests/${d.token}.json`]);
    const { data: row } = await supabase.from('stored_documents').select('id').eq('token', d.token).single();
    if (row?.id) {
      await supabase.from('document_pages').delete().eq('document_id', row.id);
      await supabase.from('stored_documents').delete().eq('id', row.id);
    } else {
      await supabase.from('stored_documents').delete().eq('token', d.token);
    }
  }

  // Save clean index
  const indexEntries = toKeep.map(d => {
    const copy = { ...d };
    delete copy.pages;
    return copy;
  });

  await supabase.storage.from('documents').upload(
    'index_manifest.json',
    Buffer.from(JSON.stringify(indexEntries, null, 2)),
    { upsert: true, contentType: 'application/json' }
  );

  console.log('FINAL RESULT: Exact count in archive =', indexEntries.length);
}

run();
