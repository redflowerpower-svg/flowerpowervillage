import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuration
const REPORT_PATH = path.resolve(process.cwd(), '.secret_docs/api_credentials_report.md');
const ENC_PATH = path.resolve(process.cwd(), '.secret_docs/api_credentials_report.md.enc');
const ENV_PATH = path.resolve(process.cwd(), '.env');
const ENV_LOCAL_PATH = path.resolve(process.cwd(), '.env.local');

// Get master vault key from env or fallback default key
function getMasterKey() {
  let key = process.env.MASTER_VAULT_KEY;
  if (!key && fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    for (const line of envContent.split('\n')) {
      if (line.startsWith('MASTER_VAULT_KEY=')) {
        key = line.split('=')[1]?.trim();
        break;
      }
    }
  }
  return key || 'FlowerPower_Phayam_Ranong_2026_VaultKey';
}

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

export function encryptVault() {
  const masterKey = getMasterKey();
  if (!fs.existsSync(REPORT_PATH)) {
    throw new Error(`File non trovato per la cifratura: ${REPORT_PATH}`);
  }
  const plainText = fs.readFileSync(REPORT_PATH, 'utf8');
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const derivedKey = deriveKey(masterKey, salt);

  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  let ciphertext = cipher.update(plainText, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag();

  const payload = {
    version: 1,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ciphertext: ciphertext,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(ENC_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`🔒 Vault cifrato con successo in: ${ENC_PATH}`);
  return true;
}

export function decryptVault() {
  const masterKey = getMasterKey();
  if (!fs.existsSync(ENC_PATH)) {
    throw new Error(`File cifrato non trovato: ${ENC_PATH}`);
  }
  const rawPayload = fs.readFileSync(ENC_PATH, 'utf8');
  const payload = JSON.parse(rawPayload);

  const salt = Buffer.from(payload.salt, 'hex');
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const derivedKey = deriveKey(masterKey, salt);

  const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  // Write decoded report
  const dir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(REPORT_PATH, decrypted, 'utf8');
  console.log(`🔓 Vault decifrato con successo in: ${REPORT_PATH}`);

  // Generate / update .env & .env.local
  syncEnvFromReport(decrypted);
  return true;
}

function syncEnvFromReport(reportText) {
  // Extract values from markdown code blocks or text
  const extract = (pattern) => {
    const match = reportText.match(pattern);
    return match ? match[1].trim() : '';
  };

  const supabaseUrl = extract(/\*\*Project URL:\*\*\s*`([^`]+)`/) || 'https://gjqevgkbjkharczhikcl.supabase.co';
  const supabaseAnonKey = extract(/\*\*Anon \(Public\) Key:\*\*\s*`([^`]+)`/);
  const supabaseServiceKey = extract(/\*\*Service Role Key \(Bypass RLS\):\*\*\s*`([^`]+)`/);

  const stripePublishable = extract(/\*\*Stripe Publishable Key \(TEST\):\*\*\s*`([^`]+)`/);
  const stripeSecret = extract(/\*\*Stripe Secret Key \(TEST\):\*\*\s*`([^`]+)`/);
  const stripeWebhookSecret = extract(/\*\*Stripe Webhook Secret:\*\*\s*`([^`]+)`/);

  const octorateStructureId = extract(/\*\*Structure \(Hotel\) ID:\*\*\s*`([^`]+)`/) || '366879';
  const octorateChannelId = extract(/\*\*Direct Booking Channel ID:\*\*\s*`([^`]+)`/) || '233';
  const octorateClientId = extract(/\*\*Client ID:\*\*\s*`([^`]+)`/);
  const octorateClientSecret = extract(/\*\*Client Secret Key:\*\*\s*`([^`]+)`/);
  const octorateRedirectUri = extract(/\*\*OAuth Redirect URI:\*\*\s*`([^`]+)`/) || 'https://localhost/';
  const octorateAccessToken = extract(/\*\*OAuth Access Token \(Singleton in DB\):\*\*\s*`([^`]+)`/);
  const octorateRefreshToken = extract(/\*\*OAuth Refresh Token \(Singleton in DB\):\*\*\s*`([^`]+)`/);

  const telegramBotToken = extract(/\*\*Bot Token:\*\*\s*`([^`]+)`/);
  const telegramChatId = extract(/\*\*Chat \(Group\) ID:\*\*\s*`([^`]+)`/);

  const smtpHost = extract(/\*\*SMTP Server Host:\*\*\s*`([^`]+)`/) || 'smtp.gmail.com';
  const smtpPort = extract(/\*\*SMTP Port:\*\*\s*`([^`]+)`/) || '465';
  const smtpUser = extract(/\*\*SMTP User:\*\*\s*`([^`]+)`/);
  const smtpPass = extract(/\*\*SMTP App Password \(Gmail\):\*\*\s*`([^`]+)`/);

  const googleMapsKey = extract(/\*\*Google Maps API Key:\*\*\s*`([^`]+)`/);

  const masterVaultKey = getMasterKey();

  const envLines = [
    `MASTER_VAULT_KEY=${masterVaultKey}`,
    `VITE_SUPABASE_URL=${supabaseUrl}`,
    `VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`,
    `SUPABASE_URL=${supabaseUrl}`,
    `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}`,
    ``,
    `# Octorate Channel Manager - OAuth Credentials`,
    `VITE_OCTORATE_STRUCTURE_ID=${octorateStructureId}`,
    `VITE_OCTORATE_CHANNEL_ID=${octorateChannelId}`,
    `VITE_OCTORATE_CLIENT_ID=${octorateClientId}`,
    `OCTORATE_SECRET_KEY=${octorateClientSecret}`,
    `VITE_OCTORATE_SECRET_KEY=${octorateClientSecret}`,
    `VITE_OCTORATE_REDIRECT_URI=${octorateRedirectUri}`,
    `OCTORATE_ACCESS_TOKEN=${octorateAccessToken}`,
    `OCTORATE_REFRESH_TOKEN=${octorateRefreshToken}`,
    ``,
    `# Stripe Keys`,
    `STRIPE_TARGET=TEST`,
    `VITE_STRIPE_PUBLISHABLE_KEY=${stripePublishable}`,
    `STRIPE_SECRET_KEY=${stripeSecret}`,
    `STRIPE_SECRET_KEY_TEST=${stripeSecret}`,
    `STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}`,
    ``,
    `# Telegram Bot`,
    `TELEGRAM_BOT_TOKEN=${telegramBotToken}`,
    `TELEGRAM_CHAT_ID=${telegramChatId}`,
    ``,
    `# Gmail SMTP`,
    `SMTP_HOST=${smtpHost}`,
    `SMTP_PORT=${smtpPort}`,
    `SMTP_USER=${smtpUser}`,
    `SMTP_PASS=${smtpPass}`,
    ``,
    `# Google Maps`,
    `VITE_GOOGLE_MAPS_API_KEY=${googleMapsKey}`
  ].join('\n');

  fs.writeFileSync(ENV_PATH, envLines, 'utf8');
  console.log(`✅ File .env generato/sincronizzato con successo.`);

  // Write .env.local
  const envLocalContent = `# Created by Vercel CLI & Vault-Sync
INTERNAL_API_SECRET=""
NX_DAEMON="false"
TURBO_CACHE="remote:rw"
TURBO_DOWNLOAD_LOCAL_ENABLED="true"
TURBO_REMOTE_ONLY="true"
TURBO_RUN_SUMMARY="true"

${envLines}
`;
  fs.writeFileSync(ENV_LOCAL_PATH, envLocalContent, 'utf8');
  console.log(`✅ File .env.local generato/sincronizzato con successo.`);
}

// Command execution if called directly
const mode = process.argv[2];
if (mode === 'encrypt') {
  encryptVault();
} else if (mode === 'decrypt') {
  decryptVault();
} else if (mode) {
  console.log(`Uso: node scratch/vault-sync.mjs [encrypt|decrypt]`);
}
