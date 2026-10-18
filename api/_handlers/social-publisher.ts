import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Social Publisher & Content Posting API Handler
 * Reparto Stagno: Social Media Studio (/social)
 * Supports TikTok Content Posting API v2 & Meta Graph API
 */
export async function handleSocialPublisher(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const query = req.query || {};
  const body = req.body || {};
  const action = (query.action || body.action || "") as string;

  // 1. GET /api/social-publisher?action=status
  if (action === "status" || action === "get_account") {
    try {
      let tiktokAccount: any = null;

      if (supabase) {
        // Try social_accounts
        const { data } = await supabase
          .from("social_accounts")
          .select("open_id, account_name, avatar_url, expires_in, scope, updated_at, is_active")
          .eq("platform", "tiktok")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          tiktokAccount = data;
        } else {
          // Check telegram_config fallback
          const { data: fbData } = await supabase
            .from("telegram_config")
            .select("*")
            .like("id", "tiktok_%")
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fbData) {
            try {
              const parsed = JSON.parse(fbData.chat_id);
              tiktokAccount = {
                open_id: parsed.open_id || fbData.id.replace("tiktok_", ""),
                scope: parsed.scope || "user.info.basic,video.publish,video.upload",
                updated_at: fbData.updated_at,
                is_active: true,
                is_fallback: true
              };
            } catch {}
          }
        }
      }

      const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
      const redirectUri = process.env.TIKTOK_REDIRECT_URI || "https://flowerpowerpizza.com/api/social-callback";
      
      const authUrl = clientKey
        ? `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(clientKey)}&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=fp_social_studio`
        : "";

      const hasMetaPizza = !!process.env.META_PIZZA_PAGE_TOKEN;
      const hasMetaVillage = !!process.env.META_VILLAGE_PAGE_TOKEN;

      return res.status(200).json({
        success: true,
        tiktok: {
          connected: !!tiktokAccount,
          clientKey: clientKey ? `${clientKey.slice(0, 6)}...` : null,
          redirectUri,
          authUrl,
          account: tiktokAccount
        },
        meta: {
          connected: hasMetaPizza || hasMetaVillage,
          pizza: {
            pageId: process.env.META_PIZZA_PAGE_ID || "410856732111386",
            igId: process.env.META_PIZZA_IG_ID || "17841469176521344",
            connected: hasMetaPizza
          },
          village: {
            pageId: process.env.META_VILLAGE_PAGE_ID || "106883044573670",
            igId: process.env.META_VILLAGE_IG_ID || "17841444373676743",
            connected: hasMetaVillage
          }
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: "Failed to fetch account status", message: e.message });
    }
  }

  // 2. POST /api/social-publisher?action=publish_video
  if (action === "publish_video") {
    const {
      accessToken,
      openId,
      videoUrl,
      title = "",
      privacyLevel = "PUBLIC_TO_EVERYONE",
      disableComment = false,
      disableDuet = false,
      disableStitch = false,
      brand = "pizza"
    } = body;

    let token = accessToken;

    // If token not passed, look up active token from DB
    if (!token && supabase) {
      const { data } = await supabase
        .from("social_accounts")
        .select("access_token")
        .eq("platform", "tiktok")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.access_token) {
        token = data.access_token;
      } else {
        const { data: fbData } = await supabase
          .from("telegram_config")
          .select("bot_token")
          .like("id", "tiktok_%")
          .limit(1)
          .maybeSingle();
        if (fbData?.bot_token) {
          token = fbData.bot_token;
        }
      }
    }

    if (!token) {
      return res.status(400).json({
        error: "Missing TikTok access token. Please authorize your TikTok account first."
      });
    }

    if (!videoUrl) {
      return res.status(400).json({ error: "Missing videoUrl parameter" });
    }

    try {
      const payload = {
        post_info: {
          title: title.slice(0, 2200),
          privacy_level: privacyLevel,
          disable_duet: disableDuet,
          disable_comment: disableComment,
          disable_stitch: disableStitch,
          video_cover_timestamp_ms: 1000
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl
        }
      };

      console.log("[SocialPublisher] Initializing TikTok video publish:", payload);

      const ttRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(payload)
      });

      const ttData = await ttRes.json();
      console.log("[SocialPublisher] TikTok init response:", ttData);

      const publishId = ttData?.data?.publish_id;
      const isSuccess = ttRes.ok && (!ttData.error || ttData.error.code === "ok" || ttData.error.code === 0);

      // Log or store post
      if (supabase) {
        try {
          await supabase.from("social_scheduled_posts").insert({
            brand,
            platform: "tiktok",
            title,
            caption: title,
            media_url: videoUrl,
            media_type: "video",
            status: isSuccess ? "publishing" : "failed",
            publish_id: publishId || null,
            error_message: isSuccess ? null : (ttData.error?.message || "Publish init failed"),
            metadata: ttData
          });
        } catch {}
      }

      if (!isSuccess) {
        return res.status(ttRes.status || 400).json({
          success: false,
          error: ttData.error?.message || "Failed to initialize TikTok video publish",
          raw: ttData
        });
      }

      return res.status(200).json({
        success: true,
        publish_id: publishId,
        raw: ttData
      });
    } catch (err: any) {
      console.error("[SocialPublisher] Publish exception:", err);
      return res.status(500).json({ error: "Publish exception", message: err.message });
    }
  }

  // 3. POST /api/social-publisher?action=check_status
  if (action === "check_status") {
    const { publishId, accessToken } = body;
    if (!publishId) {
      return res.status(400).json({ error: "Missing publishId" });
    }

    let token = accessToken;
    if (!token && supabase) {
      const { data } = await supabase
        .from("social_accounts")
        .select("access_token")
        .eq("platform", "tiktok")
        .limit(1)
        .maybeSingle();
      if (data?.access_token) token = data.access_token;
    }

    if (!token) {
      return res.status(400).json({ error: "Missing TikTok token" });
    }

    try {
      const stRes = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ publish_id: publishId })
      });

      const stData = await stRes.json();
      return res.status(200).json({
        success: stRes.ok,
        status: stData?.data?.status || "UNKNOWN",
        fail_reason: stData?.data?.fail_reason,
        post_ids: stData?.data?.publicaly_available_post_id,
        raw: stData
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Status check failed", message: err.message });
    }
  }

  // 4. POST /api/social-publisher?action=ai_caption (DeepSeek AI Integration)
  if (action === "ai_caption") {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" });
    }

    const {
      topic = "Pizza Margherita Napoletana",
      brand = "pizza", // 'pizza' or 'village'
      platform = "tiktok", // 'tiktok', 'instagram', 'facebook'
      language = "IT", // 'IT', 'EN', 'TH'
      tone = "viral" // 'viral', 'gourmet', 'relax'
    } = body;

    try {
      const brandContext = brand === "pizza"
        ? "Flower Power Pizza Ranong: Authentic Italian pizza (48h slow-fermented crust, 100% Italian flour), homemade fresh pasta, Italian craft sausages, and fine wines in a tropical garden near Raksawarin Hot Springs in Ranong, Thailand."
        : "Flower Power Farm Village & Spa: Tropical eco-resort on Koh Phayam island, Thailand. Organic farm, luxury bungalows, swimming pool, natural wellness, and authentic Italian dining.";

      const prompt = `You are a world-class viral social media manager for "${brandContext}".
Create a high-converting, viral caption with relevant hashtags for ${platform.toUpperCase()}.
Topic / Content Idea: "${topic}"
Language: ${language}
Tone of Voice: ${tone}

Rules:
1. Include an irresistible hook on the first line (emojis + curiosity/excitement).
2. Write 2-3 engaging body lines with sensory details and clear call-to-action (CTA).
3. Provide 8-12 hyper-relevant hashtags tailored to Ranong / Koh Phayam / Thailand / Foodies / Travel.
4. Keep the total length under 300 words.
5. Return ONLY a JSON object with this exact format:
{
  "hook": "...",
  "body": "...",
  "cta": "...",
  "hashtags": ["#Tag1", "#Tag2", "..."],
  "fullCaption": "..."
}`;

      const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        return res.status(500).json({ error: "DeepSeek API failed", details: errText });
      }

      const aiData = await aiRes.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      return res.status(200).json({ success: true, result: parsed });
    } catch (err: any) {
      return res.status(500).json({ error: "AI generation error", message: err.message });
    }
  }

  // 5. POST /api/social-publisher?action=sandbox_simulate (For Demo Video Walkthrough)
  if (action === "sandbox_simulate") {
    const { videoUrl = "https://flowerpowerpizza.com/demo-reel.mp4", title = "Pizza Night at Flower Power Ranong 🍕 #RanongFood #AuthenticPizza" } = body;
    const mockPublishId = `v_pub_url~v2.${Math.random().toString(36).substring(2, 10)}${Date.now()}`;

    return res.status(200).json({
      success: true,
      simulation: true,
      publish_id: mockPublishId,
      status: "PROCESSING_UPLOAD",
      message: "TikTok Sandbox Content Posting API initialized successfully (Demo Mode)",
      details: {
        privacy_level: "PUBLIC_TO_EVERYONE",
        video_url: videoUrl,
        title,
        timestamp: new Date().toISOString()
      }
    });
  }

  return res.status(400).json({ error: "Unknown action parameter" });
}
