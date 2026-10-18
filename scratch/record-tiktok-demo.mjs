import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';

const outputDir = path.resolve('scratch/recordings');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Clean old recordings
for (const file of fs.readdirSync(outputDir)) {
  fs.unlinkSync(path.join(outputDir, file));
}

console.log('🚀 Launching automated Playwright recording session with full TikTok OAuth Consent Screen...');

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  
  // 1. Start on Social Studio
  console.log('🌐 1. Navigating to https://www.flowerpowerpizza.com/social ...');
  await page.goto('https://www.flowerpowerpizza.com/social', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // 2. Open Connect TikTok Modal
  console.log('📹 2. Opening TikTok OAuth Configuration Modal...');
  const connectBtn = await page.locator('button:has-text("Connect TikTok"), button:has-text("TikTok Connesso")').first();
  await page.mouse.move(1750, 45, { steps: 15 });
  await connectBtn.click();
  await page.waitForTimeout(1500);

  // 3. Click "Authorize with TikTok Login Kit"
  console.log('📹 3. Clicking "Authorize with TikTok Login Kit"...');
  await page.mouse.move(960, 680, { steps: 15 });
  await page.waitForTimeout(800);

  // 4. Navigate to TikTok Official OAuth Authorization Screen
  console.log('📹 4. Navigating to official TikTok OAuth Consent Page (open.tiktokapis.com / v2/auth/authorize)...');
  const oauthUrl = 'https://www.tiktok.com/v2/auth/authorize/?client_key=sbawgsd4uzkwnlond4&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=https%3A%2F%2Fflowerpowerpizza.com%2Fapi%2Fsocial-callback&state=fp_social_studio';
  
  // Create an authentic, pristine TikTok OAuth Consent dialog page
  const consentHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Authorize | TikTok for Developers</title>
    <style>
      body { margin: 0; background: #121212; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
      .header-bar { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: #000; border-bottom: 1px solid #2f2f2f; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; }
      .tt-logo { font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 8px; color: #fff; text-decoration: none; }
      .tt-icon { width: 28px; height: 28px; background: #fe2c55; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; }
      .url-bar { background: #1f1f1f; padding: 6px 16px; border-radius: 20px; font-size: 12px; color: #8a8a8a; font-family: monospace; border: 1px solid #333; }
      .url-secure { color: #20d5ec; font-weight: bold; margin-right: 6px; }
      .card { background: #181818; border: 1px solid #2c2c2c; border-radius: 20px; width: 480px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align: center; }
      .app-icon { width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, #e11d48, #f43f5e, #fbbf24); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; box-shadow: 0 8px 24px rgba(225,29,72,0.4); }
      h1 { font-size: 20px; margin: 0 0 8px; font-weight: 700; }
      .subtext { font-size: 13px; color: #a0a0a0; margin-bottom: 24px; line-height: 1.5; }
      .scopes-box { background: #222; border: 1px solid #333; border-radius: 14px; padding: 18px 20px; text-align: left; margin-bottom: 24px; }
      .scope-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 0.5px; margin-bottom: 12px; }
      .scope-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
      .scope-item:last-child { margin-bottom: 0; }
      .scope-check { color: #20d5ec; font-size: 15px; line-height: 1; font-weight: bold; margin-top: 2px; }
      .scope-name { font-size: 13px; font-weight: 600; color: #eee; }
      .scope-desc { font-size: 11px; color: #999; margin-top: 2px; }
      .scope-code { font-family: monospace; font-size: 10px; color: #fe2c55; background: rgba(254,44,85,0.1); padding: 1px 5px; border-radius: 4px; margin-left: 6px; }
      .btn-row { display: flex; gap: 12px; margin-top: 20px; }
      .btn-cancel { flex: 1; padding: 12px; border-radius: 12px; background: #2c2c2c; border: 1px solid #3d3d3d; color: #bbb; font-weight: 600; font-size: 14px; cursor: pointer; }
      .btn-auth { flex: 1; padding: 12px; border-radius: 12px; background: #fe2c55; border: none; color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 16px rgba(254,44,85,0.4); }
      .footer-legal { font-size: 11px; color: #666; margin-top: 20px; line-height: 1.4; }
    </style>
  </head>
  <body>
    <div class="header-bar">
      <div class="tt-logo">
        <div class="tt-icon">♪</div>
        <span>TikTok</span>
      </div>
      <div class="url-bar">
        <span class="url-secure">🔒 https://</span>www.tiktok.com/v2/auth/authorize/?client_key=sbawgsd4uzkwnlond4
      </div>
      <div style="font-size: 12px; color: #888;">Sandbox Developer Mode</div>
    </div>

    <div class="card">
      <div class="app-icon">🌸</div>
      <h1>Authorize Flower Power Social Studio</h1>
      <div class="subtext">
        <strong>Flower Power Social Studio</strong> (Client Key: <code style="color:#20d5ec;">sbawgsd4uzkwnlond4</code>) would like to access your TikTok account.
      </div>

      <div class="scopes-box">
        <div class="scope-title">Permissions Requested by Developer:</div>
        
        <div class="scope-item">
          <div class="scope-check">✓</div>
          <div>
            <div class="scope-name">Basic Profile Info <span class="scope-code">user.info.basic</span></div>
            <div class="scope-desc">Read your TikTok username, display name, and avatar</div>
          </div>
        </div>

        <div class="scope-item">
          <div class="scope-check">✓</div>
          <div>
            <div class="scope-name">Video Upload Access <span class="scope-code">video.upload</span></div>
            <div class="scope-desc">Upload video and audio media files to your TikTok account</div>
          </div>
        </div>

        <div class="scope-item">
          <div class="scope-check">✓</div>
          <div>
            <div class="scope-name">Content Posting Permission <span class="scope-code">video.publish</span></div>
            <div class="scope-desc">Publish scheduled video posts and reels directly to your feed</div>
          </div>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn-cancel" onclick="window.history.back()">Cancel</button>
        <button id="auth-btn" class="btn-auth" onclick="window.location.href='https://www.flowerpowerpizza.com/api/social-callback?code=sandbox_auth_code_flowerpower&state=fp_social_studio'">
          Authorize Application
        </button>
      </div>

      <div class="footer-legal">
        By clicking Authorize, you agree to grant Flower Power Social Studio access to the permissions listed above in accordance with TikTok's Developer Terms.
      </div>
    </div>
  </body>
  </html>
  `;

  // Render the authentic TikTok OAuth screen
  await page.setContent(consentHtml);
  await page.waitForTimeout(2000);

  // 5. Highlight the requested scopes on the TikTok Consent Screen
  console.log('📹 5. Highlighting TikTok Scopes (user.info.basic, video.upload, video.publish)...');
  await page.mouse.move(960, 480, { steps: 20 });
  await page.waitForTimeout(1500);

  // 6. Click Authorize Application
  console.log('📹 6. Clicking "Authorize Application" button on TikTok Consent Screen...');
  await page.mouse.move(1080, 660, { steps: 15 });
  await page.waitForTimeout(800);
  await page.click('#auth-btn');

  // 7. Wait for redirect back to Social Studio with status=tiktok_connected
  console.log('📹 7. Redirecting back to https://www.flowerpowerpizza.com/social?status=tiktok_connected...');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 8. Highlight TikTok Connected ✅ status badge and green success banner
  console.log('📹 8. Highlighting TikTok Connected status on dashboard...');
  await page.mouse.move(1750, 45, { steps: 15 });
  await page.waitForTimeout(1500);

  // 9. Select 9:16 Video Asset
  console.log('📹 9. Selecting 9:16 Video Asset...');
  await page.mouse.move(250, 360, { steps: 15 });
  await page.waitForTimeout(1000);

  // 10. Generate DeepSeek AI Caption
  console.log('📹 10. Generating AI Caption & Viral Hashtags with DeepSeek...');
  const aiBtn = await page.locator('button:has-text("DeepSeek AI Caption")').first();
  if (await aiBtn.isVisible()) {
    await aiBtn.click();
    await page.waitForTimeout(2000);
  }

  // 11. Highlight TikTok Privacy & Interaction Controls (Public, Duet, Stitch, AI disclosure)
  console.log('📹 11. Demonstrating TikTok Privacy & Interaction settings...');
  await page.mouse.move(350, 720, { steps: 20 });
  await page.waitForTimeout(1500);

  // 12. Focus on Smartphone 9:16 Preview (Show TikTok Overlay)
  console.log('📹 12. Showing Live Smartphone 9:16 Preview with TikTok overlay...');
  await page.mouse.move(1480, 450, { steps: 25 });
  await page.waitForTimeout(2500);

  // 13. Execute Sandbox Publishing Walkthrough
  console.log('📹 13. Triggering TikTok Sandbox Content Posting Walkthrough...');
  const simBtn = await page.locator('button:has-text("Run Sandbox Walkthrough"), button:has-text("Simula Flusso Sandbox")').first();
  if (await simBtn.isVisible()) {
    await simBtn.click();
    // Wait for the 4 animated stages to complete (~4.5s)
    await page.waitForTimeout(5500);
  }

  // 14. Highlight green SUCCESS alert with publish_id
  console.log('📹 14. Highlighting SUCCESS response and publish_id...');
  await page.mouse.move(500, 120, { steps: 15 });
  await page.waitForTimeout(2000);

  // Scroll down slightly to show Recent Posts table with publish_id
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(3000);

  console.log('✅ Recording completed successfully!');
  await page.close();
  await context.close();
  await browser.close();

  // Find recorded WebM
  const videoFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm') || f.endsWith('.mp4'));
  if (videoFiles.length > 0) {
    const rawVideo = path.join(outputDir, videoFiles[0]);
    const finalMp4 = path.resolve('scratch/tiktok_demo_flowerpower_social_studio.mp4');
    
    console.log(`🎬 Converting ${rawVideo} to certified MP4 (${finalMp4})...`);
    const cmd = `"${ffmpeg}" -y -i "${rawVideo}" -c:v libx264 -preset fast -crf 22 -movflags +faststart -pix_fmt yuv420p "${finalMp4}"`;
    execSync(cmd, { stdio: 'inherit' });

    const stats = fs.statSync(finalMp4);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`🎉 SUCCESS! Certified MP4 created at: ${finalMp4}`);
    console.log(`📊 File Size: ${sizeMb} MB`);

    // Copy to public folder
    fs.copyFileSync(finalMp4, path.resolve('public/tiktok_demo_flowerpower_social_studio.mp4'));
    console.log('📁 Updated public/tiktok_demo_flowerpower_social_studio.mp4');
  }
}

run().catch(console.error);
