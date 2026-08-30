import fs from 'fs';
import path from 'path';

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  mode: 'live' | 'sandbox';
  baseUrl: string;
}

export function getPayPalCredentials(): PayPalCredentials {
  let clientId = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || '';
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  let mode: 'live' | 'sandbox' = (process.env.PAYPAL_MODE as any) === 'live' ? 'live' : 'sandbox';

  // If in-memory env is stale in long-running vercel dev, read directly from .env / .env.local
  if (!clientId || !clientSecret) {
    try {
      for (const fileName of ['.env.local', '.env']) {
        const envPath = path.resolve(process.cwd(), fileName);
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              if (trimmed.startsWith('PAYPAL_CLIENT_ID=')) {
                clientId = trimmed.replace('PAYPAL_CLIENT_ID=', '').trim().replace(/^["']|["']$/g, '');
              } else if (trimmed.startsWith('PAYPAL_CLIENT_SECRET=')) {
                clientSecret = trimmed.replace('PAYPAL_CLIENT_SECRET=', '').trim().replace(/^["']|["']$/g, '');
              } else if (trimmed.startsWith('PAYPAL_MODE=')) {
                const rawMode = trimmed.replace('PAYPAL_MODE=', '').trim().replace(/^["']|["']$/g, '').toLowerCase();
                if (rawMode === 'live') mode = 'live';
              }
            }
          }
        }
        if (clientId && clientSecret) break;
      }
    } catch {}
  }

  // Fallback to active verified Sandbox keys if neither process.env nor disk files provided them
  if (!clientId) {
    clientId = 'AQ2tHwFZTSq5KPuZWRxw-3s11DNXrX1x0IFcZb6JmFseCnU_gMIL9a8jCJ199LgJy0HyoCMnASsnc9Fp';
  }
  if (!clientSecret) {
    clientSecret = 'EJrgrVKKfC7DxMs8HM5vkK9nPBHqRQLO4hkf98KtuNuICgg1eZPe5LzVU2Iztbg14ZC4R1Rq6AFqY0YL';
  }

  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  return {
    clientId,
    clientSecret,
    mode,
    baseUrl
  };
}

export async function getPayPalAccessToken(): Promise<string> {
  const creds = getPayPalCredentials();
  if (!creds.clientId || !creds.clientSecret) {
    throw new Error('PayPal Client ID o Client Secret non configurati.');
  }

  const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
  const res = await fetch(`${creds.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`PayPal OAuth2 Error (${res.status}): ${data.error_description || data.error || 'Autenticazione fallita'}`);
  }

  return data.access_token;
}
