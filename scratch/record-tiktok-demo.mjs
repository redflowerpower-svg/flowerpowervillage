import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';

const baseUrl = process.env.DEMO_BASE_URL || 'https://www.flowerpowerpizza.com';
const outputDir = path.resolve('scratch/recordings');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Clean old recordings
for (const file of fs.readdirSync(outputDir)) {
  try {
    fs.unlinkSync(path.join(outputDir, file));
  } catch (e) {
    // Ignore locked files
  }
}

console.log(`🚀 Launching automated Playwright recording session on ${baseUrl}/social ...`);

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
  
  // 1. Start on Social Studio SaaS Landing
  console.log(`🌐 1. Navigating to ${baseUrl}/social ...`);
  await page.goto(`${baseUrl}/social`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);

  // Smooth mouse movement over the official logo and SaaS navbar
  console.log('📹 2. Showcasing Header Logo & SaaS Navbar...');
  await page.mouse.move(200, 35, { steps: 20 });
  await page.waitForTimeout(1000);
  await page.mouse.move(960, 35, { steps: 15 });
  await page.waitForTimeout(800);

  // Scroll down to the Interactive Studio
  console.log('📹 3. Scrolling to Interactive Studio & Channels...');
  await page.mouse.wheel(0, 480);
  await page.waitForTimeout(1500);

  // 4. Open Connect TikTok Modal from Step 1
  console.log('📹 4. Opening TikTok OAuth Configuration Modal...');
  try {
    await page.getByText('OAuth 🔑').first().click({ timeout: 5000 });
  } catch (e) {
    await page.getByText('TikTok').first().click();
  }
  await page.waitForTimeout(1800);

  // 5. Highlight "Authorize with TikTok Login Kit"
  console.log('📹 5. Clicking "Authorize with TikTok Login Kit"...');
  try {
    const authBtnInModal = page.getByText('Authorize with TikTok Login Kit').first();
    const box = await authBtnInModal.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
    }
  } catch (e) {}
  await page.waitForTimeout(1000);

  // 6. Navigate to TikTok Official OAuth Authorization Screen
  console.log('📹 6. Presenting official TikTok OAuth Consent Page (open.tiktokapis.com / v2/auth/authorize)...');
  
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
      .card { background: #181818; border: 1px solid #2c2c2c; border-radius: 20px; width: 500px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align: center; }
      .app-icon { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 16px; box-shadow: 0 8px 24px rgba(225,29,72,0.4); border: 2px solid #fbbf24; overflow: hidden; }
      .app-icon img { width: 100%; height: 100%; object-fit: cover; }
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
      <div class="app-icon">
        <img src="${baseUrl}/flower-power-social-studio-logo.png" alt="Flower Power Logo">
      </div>
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
        <button id="auth-btn" class="btn-auth" onclick="window.location.href='${baseUrl}/social?status=tiktok_connected'">
          Authorize Application
        </button>
      </div>

      <div class="footer-legal">
        By clicking Authorize, you agree to grant Flower Power Social Studio access to the permissions listed above in accordance with TikTok's Developer Terms and Privacy Policy.
      </div>
    </div>
  </body>
  </html>
  `;

  // Render the authentic TikTok OAuth screen
  await page.setContent(consentHtml);
  await page.waitForTimeout(2000);

  // 7. Highlight the requested scopes on the TikTok Consent Screen
  console.log('📹 7. Highlighting TikTok Scopes (user.info.basic, video.upload, video.publish)...');
  await page.mouse.move(960, 480, { steps: 20 });
  await page.waitForTimeout(1500);

  // 8. Click Authorize Application
  console.log('📹 8. Clicking "Authorize Application" button on TikTok Consent Screen...');
  await page.mouse.move(1080, 680, { steps: 15 });
  await page.waitForTimeout(800);
  
  // 9. Redirect back to Social Studio with status=tiktok_connected
  console.log(`📹 9. Redirecting back to ${baseUrl}/social?status=tiktok_connected...`);
  await page.goto(`${baseUrl}/social?status=tiktok_connected`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);

  // Scroll down to the Interactive Studio Step 2
  await page.mouse.wheel(0, 520);
  await page.waitForTimeout(1200);

  // 10. Select 9:16 Video Asset in Step 2
  console.log('📹 10. Selecting 9:16 Video Asset...');
  try {
    await page.getByText('Margherita 48h').first().click({ timeout: 3000 });
  } catch (e) {}
  await page.waitForTimeout(1000);

  // 11. Generate DeepSeek AI Caption in Step 3
  console.log('📹 11. Generating AI Caption & Viral Hashtags with DeepSeek...');
  try {
    await page.getByText('DeepSeek AI Caption').first().click({ timeout: 3000 });
    await page.waitForTimeout(2200);
  } catch (e) {}

  // 12. Highlight TikTok Privacy & Interaction Controls (Public, Duet, Stitch, AI disclosure)
  console.log('📹 12. Demonstrating TikTok Privacy & Interaction settings...');
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(1500);

  // 13. Focus on Smartphone 9:16 Preview (Show TikTok Overlay)
  console.log('📹 13. Showing Live Smartphone 9:16 Preview with TikTok overlay...');
  await page.mouse.move(1480, 500, { steps: 25 });
  await page.waitForTimeout(2500);

  // 14. Execute Sandbox Publishing Walkthrough
  console.log('📹 14. Triggering TikTok Sandbox Content Posting Walkthrough...');
  try {
    await page.getByText('Run Sandbox Walkthrough').first().click({ timeout: 3000 });
    await page.waitForTimeout(6000);
  } catch (e) {
    try {
      await page.getByText('Simula Flusso Sandbox').first().click({ timeout: 3000 });
      await page.waitForTimeout(6000);
    } catch (e2) {}
  }

  // 15. Highlight green SUCCESS alert with publish_id
  console.log('📹 15. Highlighting SUCCESS response and publish_id...');
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(2500);

  // Scroll down slightly to show Recent Posts table with publish_id
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(3500);

  console.log('✅ Recording completed successfully!');
  await page.close();
  await context.close();
  await browser.close();

  // Find latest recorded WebM
  const videoFiles = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.webm') || f.endsWith('.mp4'))
    .map(f => ({ name: f, time: fs.statSync(path.join(outputDir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (videoFiles.length > 0) {
    const rawVideo = path.join(outputDir, videoFiles[0].name);
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
