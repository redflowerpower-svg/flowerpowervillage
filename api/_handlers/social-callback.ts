import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Handles TikTok OAuth 2.0 Authorization Code callback.
 * Endpoint: /api/social-callback
 */
export async function handleSocialCallback(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const query = req.query || {};
  const body = req.body || {};

  const code = (query.code || body.code) as string | undefined;
  const state = (query.state || body.state) as string | undefined;
  const error = (query.error || body.error) as string | undefined;
  const errorDescription = (query.error_description || body.error_description) as string | undefined;

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || "https://flowerpowerpizza.com/api/social-callback";

  // Action: Refresh Token
  if (query.action === "refresh" || body.action === "refresh") {
    const refreshToken = (body.refresh_token || query.refresh_token) as string;
    if (!refreshToken) {
      return res.status(400).json({ error: "Missing refresh_token" });
    }
    if (!clientKey || !clientSecret) {
      return res.status(500).json({ error: "Server credentials missing" });
    }

    try {
      const refreshParams = new URLSearchParams();
      refreshParams.append("client_key", clientKey);
      refreshParams.append("client_secret", clientSecret);
      refreshParams.append("grant_type", "refresh_token");
      refreshParams.append("refresh_token", refreshToken);

      const rRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
        },
        body: refreshParams.toString(),
      });
      const rData = await rRes.json();
      if (!rRes.ok || (rData.error && rData.error.code !== "ok" && rData.error.code !== 0)) {
        return res.status(400).json({ error: "Refresh failed", details: rData });
      }

      const payload = rData.data || rData;
      if (supabase && payload.open_id) {
        await supabase.from("social_accounts").upsert({
          platform: "tiktok",
          open_id: payload.open_id,
          access_token: payload.access_token,
          refresh_token: payload.refresh_token || refreshToken,
          expires_in: payload.expires_in ? Number(payload.expires_in) : null,
          refresh_expires_in: payload.refresh_expires_in ? Number(payload.refresh_expires_in) : null,
          scope: payload.scope || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "open_id" });
      }
      return res.status(200).json(payload);
    } catch (e: any) {
      return res.status(500).json({ error: "Refresh exception", message: e.message });
    }
  }

  // 1. Check if user or TikTok returned an error
  if (error) {
    console.error("[SocialCallback] TikTok OAuth Error:", error, errorDescription);
    const redirectUrl = `/social?status=error&error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || "Autorizzazione TikTok annullata o non riuscita")}`;
    return res.redirect(302, redirectUrl);
  }

  // 2. Validate authorization code
  if (!code) {
    console.warn("[SocialCallback] Missing 'code' parameter in query or body");
    if (req.headers.accept?.includes("application/json")) {
      return res.status(400).json({ error: "Missing authorization code" });
    }
    return res.redirect(302, "/social?status=missing_code");
  }

  if (!clientKey || !clientSecret) {
    console.error("[SocialCallback] Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET in environment variables");
    return res.status(500).json({ 
      error: "Server configuration error", 
      message: "TikTok API credentials are not set on server" 
    });
  }

  try {
    console.log("[SocialCallback] Exchanging code for TikTok access token...");
    
    const tokenParams = new URLSearchParams();
    tokenParams.append("client_key", clientKey);
    tokenParams.append("client_secret", clientSecret);
    tokenParams.append("code", code);
    tokenParams.append("grant_type", "authorization_code");
    tokenParams.append("redirect_uri", redirectUri);

    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();

    // Check for API-level errors
    if (!tokenRes.ok || (tokenData.error && tokenData.error.code !== "ok" && tokenData.error.code !== 0 && tokenData.error.code !== "")) {
      const errMsg = tokenData.error?.message || tokenData.message || "Failed to exchange TikTok code for token";
      console.error("[SocialCallback] TikTok Token Exchange Failed:", tokenData);
      return res.redirect(302, `/social?status=error&message=${encodeURIComponent(errMsg)}`);
    }

    const payload = tokenData.data || tokenData;
    const {
      open_id,
      access_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
      scope
    } = payload;

    if (!open_id || !access_token) {
      console.error("[SocialCallback] Invalid token response payload:", tokenData);
      return res.redirect(302, "/social?status=error&message=Invalid+payload+from+TikTok");
    }

    console.log(`[SocialCallback] Token exchange successful for open_id: ${open_id}`);

    // 4. Save to Supabase
    if (supabase) {
      try {
        // Primary: Upsert into social_accounts table
        const { error: upsertErr } = await supabase.from("social_accounts").upsert({
          platform: "tiktok",
          open_id,
          access_token,
          refresh_token: refresh_token || null,
          expires_in: expires_in ? Number(expires_in) : null,
          refresh_expires_in: refresh_expires_in ? Number(refresh_expires_in) : null,
          scope: scope || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "open_id" });

        if (upsertErr) {
          console.warn("[SocialCallback] Error saving to social_accounts table, using telegram_config fallback:", upsertErr.message);
          
          // Fallback: store in telegram_config so tokens are NEVER lost
          await supabase.from("telegram_config").upsert({
            id: `tiktok_${open_id}`,
            bot_token: access_token,
            chat_id: JSON.stringify({ open_id, refresh_token, scope, expires_in }),
            updated_at: new Date().toISOString(),
          });
        } else {
          console.log("[SocialCallback] Successfully saved account into social_accounts table!");
        }
      } catch (dbErr: any) {
        console.error("[SocialCallback] Database error saving TikTok credentials:", dbErr.message);
      }
    }

    // 5. Successful redirect to /social dashboard
    const successRedirect = `/social?status=tiktok_connected&open_id=${encodeURIComponent(open_id)}`;
    return res.redirect(302, successRedirect);

  } catch (err: any) {
    console.error("[SocialCallback] Unexpected server exception:", err);
    return res.redirect(302, `/social?status=error&message=${encodeURIComponent(err.message || "Internal server error")}`);
  }
}
