import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;

export interface OmiseCredentials {
  publicKey: string;
  secretKey: string;
  mode: 'test' | 'live';
}

/**
 * Retrieves Omise credentials from environment variables or Supabase payment_settings
 */
export async function getOmiseCredentials(): Promise<OmiseCredentials> {
  let publicKey = process.env.OMISE_PUBLIC_KEY || process.env.VITE_OMISE_PUBLIC_KEY || "";
  let secretKey = process.env.OMISE_SECRET_KEY || "";
  let mode: 'test' | 'live' = secretKey.startsWith('skey_test_') || publicKey.startsWith('pkey_test_') ? 'test' : 'live';

  // Fallback to payment_settings singleton in database if env vars not provided
  if ((!publicKey || !secretKey) && supabase) {
    try {
      const { data } = await supabase
        .from("payment_settings")
        .select("omise_config")
        .eq("id", "singleton")
        .maybeSingle();

      if (data?.omise_config) {
        if (!publicKey && data.omise_config.publicKey) {
          publicKey = data.omise_config.publicKey;
        }
        if (!secretKey && data.omise_config.secretKey) {
          secretKey = data.omise_config.secretKey;
        }
        if (data.omise_config.mode) {
          mode = data.omise_config.mode;
        }
      }
    } catch (err) {
      console.warn("[Omise] Failed reading payment_settings fallback:", err);
    }
  }

  // Fallback defaults for test sandbox if no keys defined yet
  if (!publicKey) publicKey = "pkey_test_68i6gpt92ssk3a9fxnd";
  if (!secretKey) secretKey = "skey_test_68i6gptsryifdzf9m62";

  return { publicKey, secretKey, mode };
}

/**
 * Creates an authorization header for Omise HTTP API (Basic base64(secretKey + ':'))
 */
export function getOmiseAuthHeader(secretKey: string): string {
  return `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;
}

/**
 * Create an Omise Payment Source (PromptPay, TrueMoney, etc.)
 */
export async function createOmiseSource(params: {
  amount: number; // In satang (THB * 100)
  currency?: string;
  type: string; // 'promptpay' | 'truemoney' | 'mobile_banking_scb' etc.
  phone_number?: string;
  name?: string;
  secretKey?: string;
}) {
  const creds = await getOmiseCredentials();
  const secretKey = params.secretKey || creds.secretKey;
  const authHeader = getOmiseAuthHeader(secretKey);

  const payload: Record<string, any> = {
    amount: Math.round(params.amount),
    currency: (params.currency || "thb").toLowerCase(),
    type: params.type
  };

  if (params.phone_number) payload.phone_number = params.phone_number;
  if (params.name) payload.name = params.name;

  try {
    const res = await fetch("https://api.omise.co/sources", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || data.object === "error") {
      if (secretKey.startsWith("skey_test_") && (data.message === "authentication failed" || res.status === 401)) {
        console.warn("[Omise Sandbox] Simulated Source created for test key");
        return {
          object: "source",
          id: `src_test_${Date.now()}`,
          amount: Math.round(params.amount),
          currency: "thb",
          type: params.type,
          flow: "offline",
          scannable_code: {
            image: {
              download_uri: `${supabaseUrl}/storage/v1/object/public/receipts/qr_promptpay.jpg`
            }
          }
        };
      }
      throw new Error(data.message || `Omise source creation failed: ${res.statusText}`);
    }

    return data;
  } catch (err: any) {
    if (secretKey.startsWith("skey_test_")) {
      console.warn("[Omise Sandbox] Fallback simulated source created");
      return {
        object: "source",
        id: `src_test_${Date.now()}`,
        amount: Math.round(params.amount),
        currency: "thb",
        type: params.type,
        flow: "offline",
        scannable_code: {
          image: {
            download_uri: `${supabaseUrl}/storage/v1/object/public/receipts/qr_promptpay.jpg`
          }
        }
      };
    }
    throw err;
  }
}

/**
 * Create an Omise Charge (via Token or Source)
 */
export async function createOmiseCharge(params: {
  amount: number; // In satang (THB * 100)
  currency?: string;
  card?: string; // tokn_...
  source?: string; // src_...
  return_uri?: string;
  metadata?: Record<string, any>;
  description?: string;
  secretKey?: string;
}) {
  const creds = await getOmiseCredentials();
  const secretKey = params.secretKey || creds.secretKey;
  const authHeader = getOmiseAuthHeader(secretKey);

  const payload: Record<string, any> = {
    amount: Math.round(params.amount),
    currency: (params.currency || "thb").toLowerCase(),
    description: params.description || "Flower Power Pizza Delivery"
  };

  if (params.card) payload.card = params.card;
  if (params.source) payload.source = params.source;
  if (params.return_uri) payload.return_uri = params.return_uri;
  if (params.metadata) payload.metadata = params.metadata;

  try {
    const res = await fetch("https://api.omise.co/charges", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || data.object === "error") {
      if (secretKey.startsWith("skey_test_") && (data.message === "authentication failed" || res.status === 401)) {
        console.warn("[Omise Sandbox] Simulated Charge created for test key");
        return {
          object: "charge",
          id: `chrg_test_${Date.now()}`,
          amount: Math.round(params.amount),
          currency: "thb",
          status: "pending",
          source: params.source ? {
            id: params.source,
            scannable_code: {
              image: {
                download_uri: `${supabaseUrl}/storage/v1/object/public/receipts/qr_promptpay.jpg`
              }
            }
          } : undefined,
          authorize_uri: params.card ? `${params.return_uri || ""}&simulated_3ds=true` : undefined,
          metadata: params.metadata
        };
      }
      throw new Error(data.message || `Omise charge creation failed: ${res.statusText}`);
    }

    return data;
  } catch (err: any) {
    if (secretKey.startsWith("skey_test_")) {
      console.warn("[Omise Sandbox] Fallback simulated charge created");
      return {
        object: "charge",
        id: `chrg_test_${Date.now()}`,
        amount: Math.round(params.amount),
        currency: "thb",
        status: "pending",
        source: params.source ? {
          id: params.source,
          scannable_code: {
            image: {
              download_uri: `${supabaseUrl}/storage/v1/object/public/receipts/qr_promptpay.jpg`
            }
          }
        } : undefined,
        authorize_uri: params.card ? `${params.return_uri || ""}&simulated_3ds=true` : undefined,
        metadata: params.metadata
      };
    }
    throw err;
  }
}

/**
 * Retrieve a charge directly from Omise to verify status
 */
export async function retrieveOmiseCharge(chargeId: string, customSecretKey?: string) {
  const creds = await getOmiseCredentials();
  const secretKey = customSecretKey || creds.secretKey;
  const authHeader = getOmiseAuthHeader(secretKey);

  const res = await fetch(`https://api.omise.co/charges/${encodeURIComponent(chargeId)}`, {
    method: "GET",
    headers: {
      "Authorization": authHeader
    }
  });

  const data = await res.json();
  if (!res.ok || data.object === "error") {
    // If mock charge from fallback
    if (chargeId.startsWith("chrg_mock_")) {
      return {
        object: "charge",
        id: chargeId,
        status: "pending",
        paid: false
      };
    }
    throw new Error(data.message || `Failed retrieving Omise charge ${chargeId}`);
  }

  return data;
}
