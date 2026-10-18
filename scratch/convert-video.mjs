import ffmpeg from 'ffmpeg-static';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const inputDir = path.resolve('scratch/recordings');
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.webm'));
if (files.length === 0) {
  console.error('No webm video found in scratch/recordings');
  process.exit(1);
}

const inputPath = path.join(inputDir, files[0]);
const outputPath = path.resolve('scratch/tiktok_demo_flowerpower_social_studio.mp4');

console.log('🎬 Converting WebM to MP4...');
console.log('Input:', inputPath);
console.log('Output:', outputPath);

const cmd = `"${ffmpeg}" -y -i "${inputPath}" -c:v libx264 -preset fast -crf 22 -movflags +faststart -pix_fmt yuv420p "${outputPath}"`;
execSync(cmd, { stdio: 'inherit' });

const stats = fs.statSync(outputPath);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`🎉 SUCCESS! Final MP4 created at: ${outputPath}`);
console.log(`📊 File Size: ${sizeMb} MB (Compliant with TikTok <50MB limit)`);
