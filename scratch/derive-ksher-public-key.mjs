import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { normalizePrivateKey } from '../api/_helpers/ksher.js';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
}

const privateKeyPem = normalizePrivateKey(envVars.KSHER_PRIVATE_KEY);

try {
  const pubKeyObject = crypto.createPublicKey(privateKeyPem);
  const pubKeyPem = pubKeyObject.export({ type: 'spki', format: 'pem' });
  console.log('--- DERIVED PUBLIC KEY FROM KSHER_PRIVATE_KEY ---');
  console.log(pubKeyPem);
} catch (err) {
  console.error('Error deriving public key:', err.message);
}
