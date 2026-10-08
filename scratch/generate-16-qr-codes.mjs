import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const OUTPUT_DIR = path.resolve('scratch/appo');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const DINING_TABLES = [
  { id: '01', name: 'Tavolo 1', filename: '01_Tavolo_1' },
  { id: '02', name: 'Tavolo 2', filename: '02_Tavolo_2' },
  { id: '03', name: 'Tavolo 3', filename: '03_Tavolo_3' },
  { id: '04', name: 'Tavolo 4', filename: '04_Tavolo_4' },
  { id: '05', name: 'Tavolo 5', filename: '05_Tavolo_5' },
  { id: '06', name: 'Tavolo 6', filename: '06_Tavolo_6' },
  { id: '07', name: 'Tavolo 7', filename: '07_Tavolo_7' },
  { id: '08', name: 'Tavolo 8', filename: '08_Tavolo_8' },
  { id: '09', name: 'Tavolo 9', filename: '09_Tavolo_9' },
  { id: '10', name: 'Tavolo 10', filename: '10_Tavolo_10' },
  { id: '11', name: 'Tavolo 11', filename: '11_Tavolo_11' },
  { id: '12', name: 'Tavolo 12', filename: '12_Tavolo_12' },
  { id: '13', name: 'Cliente 1', filename: '13_Cliente_1' },
  { id: '14', name: 'Cliente 2', filename: '14_Cliente_2' },
  { id: '15', name: 'Cliente 3', filename: '15_Cliente_3' },
  { id: '16', name: 'Cliente 4', filename: '16_Cliente_4' },
];

const BASE_URL = 'https://www.flowerpowerpizza.com';

async function generateAll() {
  console.log(`🚀 Generazione 16 QR Code ad Alta Risoluzione in ${OUTPUT_DIR}...`);

  for (const table of DINING_TABLES) {
    const targetUrl = `${BASE_URL}/dining?table=${encodeURIComponent(table.name)}&token=permanent_table_qr`;
    
    const pngPath = path.join(OUTPUT_DIR, `${table.filename}.png`);
    const svgPath = path.join(OUTPUT_DIR, `${table.filename}.svg`);

    // 1. Ultra High-Res PNG (2048x2048, Error Correction Level H - 30% redundancy)
    await QRCode.toFile(pngPath, targetUrl, {
      type: 'png',
      width: 2048,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // 2. Scalable Vector Graphics (SVG, infinite resolution for print typography)
    await QRCode.toFile(svgPath, targetUrl, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log(`✅ [${table.id}/16] Generato: ${table.filename}.png & .svg -> URL: ${targetUrl}`);
  }

  // Create a clean index list file for reference
  const indexContent = `# 📋 Indice 16 QR Code Segnatavolo - Flower Power Pizza Ranong

Tutti i QR Code sono puliti (senza scritte o cornici) ad altissima definizione (PNG 2048x2048px + Vettoriale SVG) con Error Correction Level High (H).

| N° | Postazione / Tavolo | File PNG (2048px) | File SVG (Vettoriale) | URL Codificato |
|---|---|---|---|---|
${DINING_TABLES.map(t => `| ${t.id} | **${t.name}** | \`${t.filename}.png\` | \`${t.filename}.svg\` | \`${BASE_URL}/dining?table=${encodeURIComponent(t.name)}&token=permanent_table_qr\` |`).join('\n')}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README_QR_CODES.md'), indexContent, 'utf8');
  console.log(`\n🎉 Generazione completata con successo! 16 PNG + 16 SVG salvati in scratch/appo/`);
}

generateAll().catch(err => {
  console.error('Errore generazione QR:', err);
  process.exit(1);
});
