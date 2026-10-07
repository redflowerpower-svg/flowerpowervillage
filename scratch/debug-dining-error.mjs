import { chromium } from 'playwright';

async function main() {
  console.log('🚀 Launching Chrome to debug /dining...');
  const browser = await chromium.launch({ 
    headless: true,
    channel: 'chrome'
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });

  page.on('pageerror', err => {
    console.error('🔴 [PAGE ERROR]:', err.message);
    console.error('🔴 [STACK]:', err.stack);
  });

  try {
    console.log('Navigating to https://www.flowerpowerpizza.com/dining ...');
    await page.goto('https://www.flowerpowerpizza.com/dining', { waitUntil: 'commit', timeout: 15000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'scratch/dining_production_verified.png' });
    console.log('📸 Screenshot saved to scratch/dining_production_verified.png');
    const errorPre = await page.$eval('pre', el => el.innerText).catch(() => null);
    if (errorPre) {
      console.log('💥 ERROR PRE CONTENT FOUND:');
      console.log(errorPre);
    } else {
      console.log('✅ No error pre found. Title:', await page.title());
    }
  } catch (e) {
    console.error('Navigation error on 3000:', e.message);
  } finally {
    await browser.close();
  }
}

main();
