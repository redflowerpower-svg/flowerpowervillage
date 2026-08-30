import crypto from 'crypto';

/**
 * Ksher Cryptographic Helper for Signature Generation and Verification.
 * Supports both:
 * 1. Standard Ksher Secret Key (MD5 / HMAC) generated via the blue 'Reset' button in Ksher Merchant Portal.
 * 2. Asymmetric RSA Private Key (.pem) when configured.
 */

export function normalizePrivateKey(key: string): string {
  if (!key) return '';
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned.replace(/\\n/g, '\n');
}

import fs from 'fs';
import path from 'path';

export function getKsherPrivateKey(): string {
  let key = process.env.KSHER_PRIVATE_KEY || '';
  // If in-memory env is stale, read fresh from .env
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('KSHER_PRIVATE_KEY=')) {
          key = line.replace('KSHER_PRIVATE_KEY=', '').trim();
          break;
        }
      }
    }
  } catch {}
  return normalizePrivateKey(key);
}

export function getKsherSecretKey(): string {
  return process.env.KSHER_SECRET_KEY || '';
}

export function getKsherAppId(): string {
  return process.env.KSHER_APP_ID || 'mch39593';
}

/**
 * Builds the canonical string for Ksher signature calculation:
 * - Excludes 'sign' parameter and empty fields.
 * - Sorts keys in ASCII alphabetical order.
 * - Joins them as key1=value1key2=value2... (without & delimiter as per official Ksher API spec).
 */
export function buildKsherSignString(params: Record<string, any>): string {
  const keys = Object.keys(params)
    .filter((k) => k !== 'sign' && params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();

  return keys.map((k) => `${k}=${params[k]}`).join('');
}

/**
 * Generates the signature for Ksher payment requests:
 * - RSA-MD5 digest in hex format as per official Ksher specification.
 */
export function signKsherPayload(params: Record<string, any>, keyOrSecret?: string): string {
  const signString = buildKsherSignString(params);
  const key = keyOrSecret || getKsherPrivateKey() || getKsherSecretKey();

  if (!key) {
    throw new Error('Ksher Private Key / Secret mancante nel server / .env / configurazione');
  }

  const normalized = normalizePrivateKey(key);

  if (normalized.includes('-----BEGIN') || normalized.includes('PRIVATE KEY')) {
    // Official Ksher RSA-MD5 signature
    const signer = crypto.createSign('RSA-MD5');
    signer.update(signString, 'utf8');
    signer.end();
    return signer.sign(normalized, 'hex').toLowerCase();
  }

  // Standard MD5 mode
  return crypto.createHash('md5').update(signString + normalized, 'utf8').digest('hex').toLowerCase();
}

/**
 * Verifies the signature on a webhook callback or response payload.
 */
export function verifyKsherSignature(params: Record<string, any>, signature: string, secretOrPubKey: string): boolean {
  try {
    const signString = buildKsherSignString(params);
    const key = normalizePrivateKey(secretOrPubKey);

    if (key.includes('-----BEGIN') || key.includes('PUBLIC KEY')) {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(signString, 'utf8');
      verifier.end();
      return verifier.verify(key, signature, 'hex');
    }

    const calculated = crypto.createHash('md5').update(signString + key, 'utf8').digest('hex').toLowerCase();
    return calculated === signature.toLowerCase();
  } catch (err) {
    console.error('Ksher signature verification error:', err);
    return false;
  }
}
