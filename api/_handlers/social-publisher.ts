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

  // 0. POST /api/social-publisher?action=generate_ai_post_copy
  if (action === "generate_ai_post_copy") {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
    }

    try {
      const {
        brand = 'pizza',
        mode = 'P1',
        dishes = [],
        season = ''
      } = body;

      const isPizza = brand === 'pizza';
      const prompt = isPizza
        ? `Sei un esperto di social media marketing e traduttore creativo per Flower Power Pizza a Ranong, Thailandia.
Genera un post social multilingue e virale seguendo rigorosamente queste istruzioni:
- Piatti mostrati nel filmato: ${dishes.join(', ')}
- Stagione/Meteo: ${season}
- STILE: TASSATIVAMENTE NON FARE MONOBLOCCHI! Usa interlinee doppie e a capo frequenti per una lettura ariosa, ritmata ed accattivante.
- THAI 🇹🇭: Al maschile con particelle simpatiche e vive (es. ครับ, เลยครับ, ฟินสุดๆ, พาความอร่อยมารายงานตัวครับ), emoticon creative, proverbio thailandese geniale pertinente al tema, chiusura con invito a ordinare su www.flowerpowerpizza.com con sconto 10% prima prenotazione. Includi DIRETTAMENTE nel testo thai 4-5 hashtag virali thai (es. #FlowerPowerPizza, hashtag del piatto, #ของกินระนอง, #อร่อยบอกต่อ, #ระนอง).
- INGLESE 🇬🇧: Linguaggio giovanile, fresco, accattivante ma umile, a capo ariosi, proverbio a tema senza apici "", chiusura con 10% sconto. Includi DIRETTAMENTE nel testo 4-5 hashtag inglesi virali (es. #FlowerPowerPizza, hashtag piatto, #RanongFoodie, #ThailandEats).
- ITALIANO 🇮🇹: Traduzione letterale dal thai con a capo ariosi e proverbio tradotto in evidenza, chiusura con 10% sconto.
- LINK & TAG: Link fisso Google Maps Ranong Hotspring e tag @flowerpowerphayam.

Rispondi SOLO con un JSON valido con questa struttura esatta:
{
  "thaiContent": "...",
  "englishContent": "...",
  "italianContent": "..."
}`
        : `Sei un esperto di social media marketing e traduttore creativo per Flower Power Village a Koh Phayam, Thailandia.
Genera un post social multilingue e virale seguendo rigorosamente queste istruzioni:
- Alloggi mostrati nel filmato: ${dishes.join(', ')}
- Stagione: ${season}
- STILE: TASSATIVAMENTE NON FARE MONOBLOCCHI! Usa interlinee doppie e a capo frequenti per una lettura ariosa.
- INGLESE 🇬🇧: Fresco, umile, accattivante, proverbio a tema senza apici "", chiusura con invito a prenotare su www.flowerpowervillage.com con miglior prezzo garantito e 10% diretto. Includi 4-5 hashtag virali in inglese (es. #FlowerPowerVillage, hashtag alloggio, #KohPhayam, #BuffaloBay, #TropicalEscape).
- THAI 🇹🇭: Reinterpretazione al maschile con particelle amichevoli (ครับ, เลยครับ), regole toponimi: Koh Phayam = เกาะพยาม, Buffalo Bay = อ่าวเขาควาย, Long Beach = อ่าวใหญ่. Proverbio thai a tema, chiusura 10%. Includi 4-5 hashtag virali in thai (es. #FlowerPowerVillage, hashtag alloggio, #เกาะพยาม, #อ่าวเขาควาย, #ที่พักเกาะพยาม).
- ITALIANO 🇮🇹: Traduzione letterale dal thai con proverbio tradotto e chiusura 10%.
- LINK & TAG: Link fisso www.flowerpowervillage.com e tag @flowerpowerpizzaranong.

Rispondi SOLO con un JSON valido con questa struttura esatta:
{
  "thaiContent": "...",
  "englishContent": "...",
  "italianContent": "..."
}`;

      const aiRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (!aiRes.ok) {
        throw new Error(`DeepSeek API error: ${aiRes.status}`);
      }

      const aiData = await aiRes.json();
      const rawJson = aiData.choices?.[0]?.message?.content;
      const parsed = JSON.parse(rawJson);
      return res.status(200).json({ success: true, data: parsed });
    } catch (err: any) {
      console.error('[social-publisher] DeepSeek AI copy generation error:', err);
      return res.status(500).json({ error: err.message || 'DeepSeek generation failed' });
    }
  }

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

      // Check Google Business Profile Account
      let googleAccount: any = null;
      let googleLocations: any[] = [];
      let isGoogleConnected = false;

      if (supabase) {
        try {
          const { data: gData } = await supabase
            .from("telegram_config")
            .select("*")
            .eq("id", "google_business_token")
            .maybeSingle();

          if (gData && gData.bot_token) {
            try {
              const parsed = JSON.parse(gData.chat_id || "{}");
              isGoogleConnected = true;
              googleLocations = parsed.locations || [];
              googleAccount = {
                accountName: parsed.primary_account || "Flower Power",
                locations: googleLocations,
                scope: parsed.scope,
                expiresAt: parsed.expires_at,
                updatedAt: gData.updated_at
              };
            } catch {}
          }
        } catch {}
      }

      // Default smart locations for Flower Power brands if not yet retrieved from live API
      if (googleLocations.length === 0) {
        googleLocations = [
          {
            account: "accounts/primary",
            name: "locations/fp_pizza_ranong",
            title: "Flower Power Pizza - Ranong Hotspring",
            websiteUri: "https://flowerpowerpizza.com",
            brand: "pizza"
          },
          {
            account: "accounts/primary",
            name: "locations/fp_village_phayam",
            title: "Flower Power Farm Village & Spa",
            websiteUri: "https://flowerpowervillage.com",
            brand: "village"
          }
        ];
      }

      const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
      const redirectUri = process.env.TIKTOK_REDIRECT_URI || "https://flowerpowerpizza.com/api/social-callback";
      
      const authUrl = clientKey
        ? `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(clientKey)}&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=fp_social_studio`
        : "";

      // Google OAuth URL
      const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
      const host = (req.headers["x-forwarded-host"] || req.headers.host || "") as string;
      const googleRedirectUri = host.includes("localhost")
        ? "http://localhost:3000/api/social-callback"
        : (process.env.GOOGLE_REDIRECT_URI || "https://flowerpowerpizza.com/api/social-callback");

      const googleAuthUrl = googleClientId
        ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(googleRedirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/business.manage')}&access_type=offline&prompt=consent&state=google_social_studio`
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
        google: {
          connected: isGoogleConnected,
          clientId: googleClientId ? `${googleClientId.slice(0, 16)}...` : null,
          redirectUri: googleRedirectUri,
          authUrl: googleAuthUrl,
          account: googleAccount,
          locations: googleLocations
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
      const isPizza = brand === "pizza";
      const brandContext = isPizza
        ? "Flower Power Pizza Ranong: Authentic Italian pizza (48h slow-fermented crust, 100% Italian flour, wood-fired oven), homemade fresh pasta, Italian craft sausages, and fine wines in a tropical garden near Raksawarin Hot Springs in Ranong, Thailand."
        : "Flower Power Farm Village & Spa: Tropical eco-resort on Koh Phayam island, Thailand. Organic farm, luxury bungalows, swimming pool, natural wellness, and authentic Italian dining.";

      const prompt = `You are a world-class viral social media manager for "${brandContext}".
Create a high-converting, viral caption with relevant hashtags for ${platform.toUpperCase()}.
Topic / Content Idea: "${topic}"
Tone of Voice: ${tone}

CATEGORICAL BILINGUAL FORMAT RULES:
1. Every post MUST strictly contain BOTH Thai and English text, each preceded by its national flag emoji:
${isPizza ? `   - BRAND IS PIZZERIA RANONG:
     * FIRST BLOCK: 🇹🇭 Thai language text with authentic viral social media slang and friendly particles (e.g. นะคะ, จ้า, น้าา, ฟินมากกก, อร่อยแสงออกปาก, สายกินห้ามพลาด, ชีสเยิ้มๆ, เตาฟืนหอมกรุ่น, ปักหมุดด่วน). It must sound like an enthusiastic, charming local food influencer, NEVER robotic!
     * DOUBLE LINE BREAK
     * SECOND BLOCK: 🇬🇧 English language text with mouthwatering artisanal storytelling (48h fermented sourdough, traditional wood-fired stone oven, waterfall garden in Ranong, dine-in or fast delivery CTA).` : `   - BRAND IS KOH PHAYAM VILLAGE:
     * FIRST BLOCK: 🇬🇧 English language text with captivating tropical eco-resort storytelling, island bliss, birdsong, organic farm breakfasts, and serene nature on Koh Phayam Island.
     * DOUBLE LINE BREAK
     * SECOND BLOCK: 🇹🇭 Thai language text with authentic viral travel blogger tone and inviting particles (e.g. นะคะ, จ้า, น้าา, ชิลสุดๆ, ฟีลดีมากกก, พักผ่อนฮีลใจ, ปักหมุดที่พัก, ห้ามพลาดเลยน้า).`}
2. Season both language blocks with engaging viral emojis (🔥, 🍕, 🤤, 🌿, 🏝️, ✨, 🥥).
3. Conclude with 8-12 hyper-relevant viral hashtags combining English and Thai (e.g. ${isPizza ? '#RanongFood #PizzaRanong #RanongHotspring #ItalianFoodThailand #WoodFiredPizza #อร่อยบอกต่อ #รีวิวระนอง #เที่ยวระนอง #พิซซ่าเตาฟืน' : '#KohPhayam #KohPhayamIsland #EcoResortThailand #ThailandTravel #HiddenThailand #เที่ยวเกาะพยาม #เกาะพยาม #รีวิวที่พัก #เที่ยวระนอง'}).
4. Keep the total length under 300 words.
5. Return ONLY a JSON object with this exact format:
{
  "hook": "${isPizza ? '🇹🇭 ...' : '🇬🇧 ...'}",
  "body": "...",
  "cta": "...",
  "hashtags": ["#Tag1", "#Tag2", "..."],
  "fullCaption": "${isPizza ? '🇹🇭 [Thai text with viral particles]\\n\\n🇬🇧 [English text]\\n\\n#Tags' : '🇬🇧 [English text]\\n\\n🇹🇭 [Thai text with viral particles]\\n\\n#Tags'}"
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

  // 4b. POST /api/social-publisher?action=analyze_visual_ai (Google Gemini Vision + DeepSeek AI)
  if (action === "analyze_visual_ai") {
    const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || (body.deepseekApiKey || "");
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || (body.geminiApiKey || "");

    const {
      imageUrl = "",
      brand = "pizza", // 'pizza' or 'village'
      itemTitle = "Pizza Margherita",
      itemTitleTh = "พิซซ่ามาเกริต้า",
      category = "Pizza",
      price = 240,
      currentTheme = "standard"
    } = body;

    try {
      // 1. Fase Vision AI (Google Gemini 1.5 Flash se disponibile, altrimenti fallback contestuale)
      let visualAnalysis: any = {
        subject: itemTitle,
        dominantColors: brand === "pizza" ? ["#ea580c", "#1c1917"] : ["#059669", "#064e3b"],
        visualElements: brand === "pizza"
          ? ["crosta dorata cotta a legna", "pomodoro brillante", "mozzarella filante", "foglie di basilico fresco"]
          : ["costruzione in legno naturale", "giardino tropicale", "amaca", "palme da cocco"],
        negativeSpaceBestPosition: "bottom",
        lighting: brand === "pizza" ? "calda e invitante da forno a pietra" : "luce naturale dorata tropicale",
        usedGemini: false
      };

      if (geminiKey && imageUrl) {
        try {
          const imgRes = await fetch(imageUrl);
          if (imgRes.ok) {
            const arrayBuffer = await imgRes.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            const contentType = imgRes.headers.get("content-type") || "image/jpeg";

            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        {
                          text: `You are an expert food & tropical hospitality art director. Analyze this photo of "${itemTitle}" (${brand === "pizza" ? "Italian wood-fired pizza & pasta in Ranong, Thailand" : "Tropical eco-resort on Koh Phayam Island, Thailand"}).
Return ONLY a JSON object:
{
  "subject": "detected primary subject",
  "dominantColors": ["#hex1", "#hex2"],
  "visualElements": ["element1", "element2", "element3"],
  "negativeSpaceBestPosition": "bottom" or "top",
  "lighting": "lighting style description"
}`
                        },
                        {
                          inlineData: {
                            mimeType: contentType,
                            data: base64Data
                          }
                        }
                      ]
                    }
                  ],
                  generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                  }
                })
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const textOut = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textOut) {
                const parsed = JSON.parse(textOut);
                visualAnalysis = { ...visualAnalysis, ...parsed, usedGemini: true };
              }
            }
          }
        } catch (gErr: any) {
          console.warn("[SocialPublisher] Gemini Vision optional call bypassed:", gErr.message);
        }
      }

      // 2. Fase DeepSeek AI: Generazione Copy Bilingue Virale, Carosello a 3 Slide & Reel Overlay
      if (!deepseekKey) {
        // Fallback programmatico senza DeepSeek
        return res.status(200).json({
          success: true,
          visualAnalysis,
          reelOverlay: {
            title: brand === "pizza" ? `🍕 ${itemTitleTh || itemTitle} อบเตาฟืนแท้ๆ` : `🌴 ${itemTitle} เกาะพยาม`,
            subtitle: brand === "pizza" ? "Impasto a lenta lievitazione & ingredienti freschi" : "Immerso nella natura tropicale senza auto",
            badge: brand === "pizza" ? "🔥 เตาฟืน 100%" : "✨ Eco-Luxury",
            priceTag: price ? `${price} THB` : ""
          },
          slides: [
            {
              id: "slide-1",
              slideType: "hook",
              title: brand === "pizza" ? `🍕 ${itemTitleTh} อร่อยฟินแสงออกปาก!` : `🌴 ${itemTitle} พักผ่อนฮีลใจ`,
              subtitle: brand === "pizza" ? "Autentica tradizione italiana a Ranong" : "La vera pace dell'isola di Koh Phayam",
              badge: brand === "pizza" ? "🔥 เตาฟืนแท้" : "🏝️ Koh Phayam",
              ctaText: "Swipe per i dettagli ➔"
            },
            {
              id: "slide-2",
              slideType: "feature",
              title: visualAnalysis.visualElements?.slice(0, 2).join(" • ") || itemTitle,
              subtitle: "Qualità artigianale e rispetto delle materie prime",
              badge: "✨ Artigianale",
              ctaText: "Scopri di più ➔"
            },
            {
              id: "slide-3",
              slideType: "cta",
              title: brand === "pizza" ? "สั่งเดลิเวอรี่ส่งไวถึงบ้าน หรือแวะมาทานที่สวนน้ำแร่" : "จองตรงราคาดีที่สุดบนเว็บไซต์",
              subtitle: brand === "pizza" ? "flowerpowerpizza.com • Sconto 10% primo ordine" : "flowerpowervillage.com • Prenota subito",
              badge: price ? `${price} THB` : "🌟 Prenota Ora",
              ctaText: brand === "pizza" ? "Ordina Online 🍕" : "Prenota Diretto 🌴"
            }
          ],
          socialCaption: {
            thai: brand === "pizza" ? `สายกินห้ามพลาด! ${itemTitleTh} อบเตาฟืนหอมกรุ่นชีสเยิ้มๆ ปักหมุดระนองนะคะ 🍕🔥` : `หนีความวุ่นวายมาพักผ่อนที่เกาะพยามกับ ${itemTitle} บรรยากาศสุดชิลล์ 🌿🏝️`,
            english: brand === "pizza" ? `Craving real Italian pizza in Ranong? Try our ${itemTitle} baked in traditional stone oven!` : `Pure island serenity at Flower Power Village Koh Phayam. Experience ${itemTitle}.`,
            hashtags: brand === "pizza" ? ["#PizzaRanong", "#RanongFood", "#รีวิวระนอง", "#ของกินระนอง", "#FlowerPowerPizza"] : ["#KohPhayam", "#PhayamIsland", "#เที่ยวเกาะพยาม", "#FlowerPowerVillage"]
          }
        });
      }

      const isPizza = brand === "pizza";
      const prompt = `You are the viral Creative Director for Flower Power (${isPizza ? "Pizzeria & Italian Restaurant in Ranong, Thailand" : "Eco-resort on Koh Phayam Island, Thailand"}).
We are creating a high-converting TikTok / Instagram 9:16 Video Reel and 3-Slide Carousel.
Visual Elements detected in photo: ${JSON.stringify(visualAnalysis.visualElements)}
Subject: "${itemTitle}" (Thai: "${itemTitleTh}")
Price: ${price} THB
Theme/Occasion: "${currentTheme}"

MANDATORY RULES:
1. For Ranong Pizza:
   - Primary language must be THAI with authentic viral food influencer tone (นะคะ, จ้า, ฟินมากกก, อร่อยแสงออกปาก, สายกินห้ามพลาด, ชีสเยิ้มๆ, เตาฟืนหอมกรุ่น).
   - Secondary language must be ITALIAN with authentic gourmet pride.
2. For Koh Phayam Village:
   - Primary language ENGLISH (tropical bliss, peaceful island life), Secondary THAI (พักผ่อนฮีลใจ, ชิลสุดๆ, ธรรมชาติ).
3. Generate 3 slides:
   - Slide 1: Magnetic viral Hook (title under 8 words, subtitle under 12 words, short badge 2-3 words, CTA "Swipe ➔")
   - Slide 2: Feature/Sensory detail highlighting detected visual elements
   - Slide 3: Strong Call To Action with website link & price
4. Generate Reel Overlay texts:
   - title (Hook bilingue, compact, impactful)
   - subtitle (Sensory detail)
   - badge (Eye-catching badge with emoji)
   - priceTag ("${price} THB")
5. Return ONLY a valid JSON:
{
  "reelOverlay": {
    "title": "...",
    "subtitle": "...",
    "badge": "...",
    "priceTag": "${price ? `${price} THB` : ''}"
  },
  "slides": [
    { "id": "slide-1", "slideType": "hook", "title": "...", "subtitle": "...", "badge": "...", "ctaText": "Swipe ➔" },
    { "id": "slide-2", "slideType": "feature", "title": "...", "subtitle": "...", "badge": "...", "ctaText": "Scopri ➔" },
    { "id": "slide-3", "slideType": "cta", "title": "...", "subtitle": "...", "badge": "...", "ctaText": "${isPizza ? 'Ordina Online 🍕' : 'Prenota Diretto 🌴'}" }
  ],
  "socialCaption": {
    "thai": "...",
    "english": "...",
    "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"]
  }
}`;

      const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!aiRes.ok) {
        throw new Error(`DeepSeek API failed: ${await aiRes.text()}`);
      }

      const aiData = await aiRes.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const generated = JSON.parse(content);

      return res.status(200).json({
        success: true,
        visualAnalysis,
        reelOverlay: generated.reelOverlay,
        slides: generated.slides,
        socialCaption: generated.socialCaption
      });
    } catch (err: any) {
      console.error("[SocialPublisher] analyze_visual_ai error:", err);
      return res.status(500).json({ error: "Visual AI analysis error", message: err.message });
    }
  }

  // 5. POST /api/social-publisher?action=publish_google (Publish to Google Maps / Local Posts)
  if (action === "publish_google" || action === "publish_google_post") {
    const {
      summary = "",
      locationName,
      brand = "pizza",
      actionType = "ORDER",
      actionUrl = "https://flowerpowerpizza.com",
      mediaUrl = "",
      topicType = "STANDARD"
    } = body;

    let googleToken = "";
    if (supabase) {
      try {
        const { data: gData } = await supabase
          .from("telegram_config")
          .select("*")
          .eq("id", "google_business_token")
          .maybeSingle();
        if (gData?.bot_token) {
          googleToken = gData.bot_token;
        }
      } catch {}
    }

    if (!googleToken) {
      // In sandbox / unauthenticated demo mode, provide realistic simulation response
      const simulatedPostId = `g_post_${brand}_${Date.now().toString(36)}`;
      return res.status(200).json({
        success: true,
        simulation: true,
        postId: simulatedPostId,
        message: "Google Business Profile Post published successfully (Sandbox / Demo mode)",
        post: {
          name: `${locationName || 'locations/fp_pizza_ranong'}/localPosts/${simulatedPostId}`,
          languageCode: "en",
          summary,
          callToAction: {
            actionType,
            url: actionUrl
          },
          topicType,
          createTime: new Date().toISOString()
        }
      });
    }

    try {
      const targetLocation = locationName || (brand === "pizza" ? "locations/fp_pizza_ranong" : "locations/fp_village_phayam");
      const postPayload: any = {
        languageCode: "en",
        summary: summary.slice(0, 1500),
        topicType,
        callToAction: actionUrl ? {
          actionType: actionType || (brand === "village" ? "BOOK" : "ORDER"),
          url: actionUrl
        } : undefined
      };

      if (mediaUrl) {
        postPayload.media = [
          {
            mediaFormat: mediaUrl.endsWith(".mp4") ? "VIDEO" : "PHOTO",
            sourceUrl: mediaUrl
          }
        ];
      }

      console.log(`[SocialPublisher] Publishing to Google Business Profile ${targetLocation}:`, postPayload);

      const gRes = await fetch(`https://mybusiness.googleapis.com/v4/${targetLocation}/localPosts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${googleToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postPayload)
      });

      const gData = await gRes.json();
      console.log("[SocialPublisher] Google publish response:", gData);

      if (!gRes.ok || gData.error) {
        return res.status(400).json({
          error: "Google Business Profile API error",
          details: gData.error || gData
        });
      }

      return res.status(200).json({
        success: true,
        post: gData
      });
    } catch (gErr: any) {
      return res.status(500).json({ error: "Google publish exception", message: gErr.message });
    }
  }

  // 6. POST /api/social-publisher?action=sandbox_simulate (For Demo Video Walkthrough)
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
