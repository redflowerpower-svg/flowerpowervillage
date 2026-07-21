async function run() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('ERROR: TELEGRAM_BOT_TOKEN is not defined in environment.');
    process.exit(1);
  }
  const webhookUrl = 'https://hope-basket-stat-shall.trycloudflare.com/api/telegram-webhook';

  console.log(`Setting webhook...`);
  console.log(`Token: ${token}`);
  console.log(`URL: ${webhookUrl}`);

  const telegramUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  try {
    const res = await fetch(telegramUrl);
    const data = await res.json();
    console.log('\n--- TELEGRAM API RESPONSE ---');
    console.log('Status Code:', res.status);
    console.log('Body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Network Error:', err.message);
  }
}

run();
