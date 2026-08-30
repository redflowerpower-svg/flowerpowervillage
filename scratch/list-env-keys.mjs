import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');
const keys = [];
for (const line of content.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key] = trimmed.split('=');
    if (key) keys.push(key.trim());
  }
}
console.log('Available ENV Keys:', keys);
