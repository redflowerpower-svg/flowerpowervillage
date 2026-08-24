import fetch from 'node-fetch';
import fs from 'fs';

const HF_TOKEN = process.env.HF_TOKEN || '';

async function testEndpoints() {
  const sampleUrl = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp';
  const imgRes = await fetch(sampleUrl);
  const imgBuffer = await imgRes.arrayBuffer();

  const endpoints = [
    'https://router.huggingface.co/hf-inference/models/briaai/RMBG-1.4',
    'https://router.huggingface.co/models/briaai/RMBG-1.4',
    'https://api-inference.huggingface.co/models/briaai/RMBG-1.4'
  ];

  for (const url of endpoints) {
    console.log(`\nTesting URL: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/octet-stream'
        },
        body: Buffer.from(imgBuffer)
      });
      console.log('Status:', response.status, response.statusText);
      const ct = response.headers.get('content-type');
      console.log('Content-Type:', ct);
      if (response.ok) {
        const resBuf = await response.arrayBuffer();
        console.log('Success! Size:', resBuf.byteLength, 'bytes');
        fs.writeFileSync('scratch/test-cutout.png', Buffer.from(resBuf));
        console.log('Saved cutout to scratch/test-cutout.png');
        break;
      } else {
        console.log('Body:', await response.text());
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testEndpoints();
