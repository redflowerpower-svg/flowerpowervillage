/**
 * Omise (Opn Payments) Client SDK & API Service for Pizza Delivery (/pizza)
 * Completely isolated from Village Booking (/village Ksher)
 */

declare global {
  interface Window {
    Omise?: {
      setPublicKey: (key: string) => void;
      createToken: (
        type: 'card',
        data: {
          name: string;
          number: string;
          expiration_month: number;
          expiration_year: number;
          security_code: string;
          city?: string;
          postal_code?: string;
        },
        callback: (statusCode: number, response: any) => void
      ) => void;
      createSource: (
        type: string,
        data: any,
        callback: (statusCode: number, response: any) => void
      ) => void;
    };
  }
}

const OMISE_SCRIPT_URL = 'https://cdn.omise.co/omise.js';

/**
 * Returns the client-side Omise Publishable Key
 */
export function getOmisePublicKey(): string {
  return (
    import.meta.env.VITE_OMISE_PUBLIC_KEY ||
    (typeof process !== 'undefined' && process.env?.OMISE_PUBLIC_KEY) ||
    ''
  );
}

let omiseScriptPromise: Promise<void> | null = null;

/**
 * Dynamically loads the official Omise.js library from CDN
 */
export function loadOmiseScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (window.Omise) {
    try {
      window.Omise.setPublicKey(getOmisePublicKey());
    } catch (e) {
      console.warn('[Omise.js] setPublicKey warning:', e);
    }
    return Promise.resolve();
  }

  if (omiseScriptPromise) return omiseScriptPromise;

  omiseScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${OMISE_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        window.Omise?.setPublicKey(getOmisePublicKey());
        resolve();
      });
      existing.addEventListener('error', () => reject(new Error('Failed loading Omise.js')));
      return;
    }

    const script = document.createElement('script');
    script.src = OMISE_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      try {
        window.Omise?.setPublicKey(getOmisePublicKey());
      } catch (e) {
        console.warn('[Omise.js] setPublicKey onload warning:', e);
      }
      resolve();
    };
    script.onerror = () => reject(new Error('Failed loading Omise.js from CDN'));
    document.head.appendChild(script);
  });

  return omiseScriptPromise;
}

export interface CardFormData {
  name: string;
  number: string;
  expMonth: string | number;
  expYear: string | number;
  cvv: string;
}

/**
 * Creates a single-use card token via Omise Vault (card numbers never touch our backend)
 */
export async function tokenizeCreditCard(card: CardFormData): Promise<string> {
  await loadOmiseScript();

  if (!window.Omise) {
    throw new Error('Omise.js is not available in browser environment');
  }

  window.Omise.setPublicKey(getOmisePublicKey());

  const cleanNumber = card.number.replace(/\D/g, '');
  const month = parseInt(String(card.expMonth), 10);
  let year = parseInt(String(card.expYear), 10);
  if (year < 100) year += 2000;

  return new Promise((resolve, reject) => {
    window.Omise!.createToken(
      'card',
      {
        name: card.name.trim(),
        number: cleanNumber,
        expiration_month: month,
        expiration_year: year,
        security_code: card.cvv.trim()
      },
      (statusCode: number, response: any) => {
        if (statusCode === 200 && response.object === 'token') {
          resolve(response.id);
        } else {
          const msg = response.message || response.error || 'Card tokenization failed';
          reject(new Error(msg));
        }
      }
    );
  });
}

/**
 * Creates an Omise PromptPay QR Charge via backend
 */
export async function createPromptPayCharge(params: {
  orderId: string | number;
  amount: number;
  customerName?: string;
  phone?: string;
}): Promise<{
  chargeId: string;
  qrCodeUrl: string;
  expiresAt?: string;
  amount: number;
}> {
  const res = await fetch('/api/omise-charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: params.orderId,
      amount: params.amount,
      paymentChannel: 'promptpay',
      customerName: params.customerName,
      phone: params.phone
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed generating Omise PromptPay QR');
  }

  return {
    chargeId: data.chargeId,
    qrCodeUrl: data.qrCodeUrl,
    expiresAt: data.expiresAt,
    amount: data.amount
  };
}

/**
 * Creates an Omise Card Charge via backend (handles 3-D Secure redirect)
 */
export async function createCardCharge(params: {
  orderId: string | number;
  amount: number;
  cardToken: string;
  returnUri?: string;
  customerName?: string;
  phone?: string;
}): Promise<{
  chargeId: string;
  status: 'successful' | 'pending' | 'failed';
  authorizeUri?: string;
  paid?: boolean;
  requires3DS?: boolean;
}> {
  const res = await fetch('/api/omise-charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: params.orderId,
      amount: params.amount,
      paymentChannel: 'card',
      cardToken: params.cardToken,
      returnUri: params.returnUri,
      customerName: params.customerName,
      phone: params.phone
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Omise credit card charge failed');
  }

  return {
    chargeId: data.chargeId,
    status: data.status,
    authorizeUri: data.authorizeUri,
    paid: data.paid,
    requires3DS: data.requires3DS
  };
}

/**
 * Check or poll status of an Omise charge
 */
export async function checkOmiseChargeStatus(params: {
  chargeId?: string;
  orderId?: string | number;
}): Promise<{
  paid: boolean;
  status: string;
  failureMessage?: string;
}> {
  const query = new URLSearchParams();
  if (params.chargeId) query.set('chargeId', params.chargeId);
  if (params.orderId) query.set('orderId', String(params.orderId));

  const res = await fetch(`/api/omise-check-status?${query.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed checking Omise charge status');
  }

  return {
    paid: Boolean(data.paid),
    status: data.status,
    failureMessage: data.failureMessage
  };
}
