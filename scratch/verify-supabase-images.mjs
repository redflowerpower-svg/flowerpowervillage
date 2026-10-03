import fs from 'fs';
import https from 'https';

const menuDataPath = 'src/pizza/data/menuData.ts';
const content = fs.readFileSync(menuDataPath, 'utf8');

const jsonStart = content.indexOf('export const menuCategories');
const dataStr = content.slice(content.indexOf('=', jsonStart) + 1, content.lastIndexOf(';'));
const categories = eval('(' + dataStr + ')');

const daily = categories.find(c => c.id === 'daily-specials');
console.log(`Verifying ${daily.items.length} images on Supabase Storage...\n`);

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let bytes = 0;
      res.on('data', (chunk) => { bytes += chunk.length; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length'] || bytes
        });
      });
    }).on('error', (err) => {
      resolve({ statusCode: 'ERR', error: err.message });
    });
  });
}

async function run() {
  const results = [];
  for (let i = 0; i < daily.items.length; i++) {
    const item = daily.items[i];
    const url = item.image;
    const res = await checkUrl(url);
    results.push({
      index: i + 1,
      id: item.id,
      name: item.nameIt || item.name,
      url: url,
      status: res.statusCode,
      type: res.contentType,
      sizeKb: res.contentLength ? (res.contentLength / 1024).toFixed(1) + ' KB' : 'N/A'
    });
  }

  console.log('| # | Piatto | Status | Formato | Dimensione | Cartella Supabase |');
  console.log('|---|---|---|---|---|---|');
  let allOk = true;
  results.forEach(r => {
    const folder = r.url.split('/delivery_food/')[1]?.split('/')[0] || 'root';
    const statusText = r.status === 200 ? '✅ 200 OK' : `❌ ${r.status}`;
    if (r.status !== 200) allOk = false;
    console.log(`| ${r.index} | **${r.name.replace('\n', ' ')}** | ${statusText} | ${r.type || 'N/A'} | ${r.sizeKb} | \`${folder}\` |`);
  });

  console.log(`\nEsito verifica: ${allOk ? 'TUTTE LE IMMAGINI SONO ATTIVE E VISIBILI AL 100% SU SUPABASE CLOUD' : 'Alcune immagini presentano problemi'}`);
}

run();
