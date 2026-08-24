import fetch from 'node-fetch';
import fs from 'fs';

const HF_TOKEN = process.env.HF_TOKEN || '';
const MODEL = 'facebook/detr-resnet-50-panoptic';

async function testExtraction() {
  const sampleUrl = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp';
  const imgRes = await fetch(sampleUrl);
  const imgBuffer = await imgRes.arrayBuffer();

  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/octet-stream'
    },
    body: Buffer.from(imgBuffer)
  });

  const data = await response.json();
  console.log('Detected objects:', data.map(d => ({ label: d.label, score: d.score })));

  const bottleItem = data.find(d => d.label === 'bottle' || d.label.includes('bottle')) || data[0];
  if (bottleItem && bottleItem.mask) {
    const maskBuffer = Buffer.from(bottleItem.mask, 'base64');
    fs.writeFileSync('scratch/bottle-mask.png', maskBuffer);
    console.log('Saved mask to scratch/bottle-mask.png! Mask bytes:', maskBuffer.byteLength);
  }
}

testExtraction();
