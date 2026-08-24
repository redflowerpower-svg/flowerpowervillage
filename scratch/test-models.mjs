import fetch from 'node-fetch';
import fs from 'fs';

const HF_TOKEN = process.env.HF_TOKEN || '';

const candidateModels = [
  'briaai/RMBG-2.0',
  'ZhengPeng7/BiRefNet',
  'briaai/RMBG-1.4',
  'facebook/detr-resnet-50-panoptic',
  'nvidia/segformer-b0-finetuned-ade-512-512'
];

async function testModels() {
  const sampleUrl = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp';
  const imgRes = await fetch(sampleUrl);
  const imgBuffer = await imgRes.arrayBuffer();

  for (const model of candidateModels) {
    console.log(`\nTesting model: ${model}`);
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;
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
      const text = await response.text();
      console.log('Body snippet:', text.slice(0, 200));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testModels();
