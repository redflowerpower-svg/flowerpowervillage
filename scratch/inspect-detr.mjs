import fetch from 'node-fetch';

const HF_TOKEN = process.env.HF_TOKEN || '';
const MODEL = 'facebook/detr-resnet-50-panoptic';

async function inspectLabels() {
  // Test with a sample wine bottle image
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
  console.log('All Segments returned:');
  for (const item of data) {
    console.log(`- Label: "${item.label}" | Score: ${item.score} | Mask len: ${item.mask?.length}`);
  }
}

inspectLabels();
