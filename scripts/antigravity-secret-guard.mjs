#!/usr/bin/env node
/**
 * Antigravity Native PreToolUse Secret Guard
 * 100% offline, zero external dependencies, fail-safe.
 * Blocks accidental reads of plaintext secret files (.env, .secret_docs/*.md)
 * and shell commands containing hardcoded secret keys.
 */
import path from 'path';

const SECRET_PATTERNS = [
  { name: 'Stripe Secret Key', regex: /sk_(live|test)_[0-9a-zA-Z]{24,}/ },
  { name: 'Stripe Webhook Secret', regex: /whsec_[0-9a-zA-Z]{32,}/ },
  { name: 'Omise Secret Key', regex: /skey_(live|test)_[0-9a-zA-Z]{15,}/ },
  { name: 'Octorate Client Secret', regex: /secret_[0-9a-f]{32}[A-Z0-9]+/ },
  { name: 'Telegram Bot Token', regex: /[0-9]{9,11}:[a-zA-Z0-9_-]{35}/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Token', regex: /(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{22,})/ },
  { name: 'OpenAI / Anthropic Key', regex: /sk-(proj|ant)-[a-zA-Z0-9_-]{20,}/ },
  { name: 'DeepSeek API Key', regex: /sk-[0-9a-zA-Z]{32,}/ },
  { name: 'Private Key Block', regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
];

const PLACEHOLDER_MARKERS = ['placeholder', 'sk_test_...', 'skey_test_...', 'YOUR_API_KEY'];

function allow() {
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(JSON.stringify({ decision: 'deny', reason }));
  process.exit(0);
}

function isSensitiveFilePath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return false;
  const normalized = rawPath.replace(/\\/g, '/').toLowerCase();
  const base = path.posix.basename(normalized);

  // Allow safe templates and encrypted vault files
  if (
    base === '.env.example' ||
    base === '.env.sample' ||
    base === '.env.template' ||
    base.endsWith('.enc')
  ) {
    return false;
  }

  // Block .env, .env.local, .env.production, etc.
  if (base === '.env' || base.startsWith('.env.')) {
    return true;
  }

  // Block plaintext files inside .secret_docs/
  if (normalized.includes('/.secret_docs/') || normalized.startsWith('.secret_docs/')) {
    return true;
  }

  return false;
}

function isSensitiveShellCommand(cmd) {
  if (!cmd || typeof cmd !== 'string') return null;

  // Allow placeholder/example text
  const isPlaceholder = PLACEHOLDER_MARKERS.some((m) => cmd.includes(m));
  if (!isPlaceholder) {
    for (const rule of SECRET_PATTERNS) {
      if (rule.regex.test(cmd)) {
        return `Rilevato potenziale segreto in chiaro nel comando (${rule.name}).`;
      }
    }
  }

  // Block direct printing/reading of .env or plaintext .secret_docs via shell commands
  const readCmdRegex = /\b(cat|type|get-content|gc|more|less|head|tail|findstr|select-string)\b/i;
  if (readCmdRegex.test(cmd)) {
    const mentionsEnv = /(^|[\s"'/\\])\.env(\.local|\.production|\.development)?([\s"']|$)/i.test(cmd);
    const mentionsPlainSecretDoc = /\.secret_docs[/\\][^"'\s]+(?<!\.enc)([\s"']|$)/i.test(cmd);
    if (mentionsEnv || mentionsPlainSecretDoc) {
      return 'Bloccata lettura diretta via terminale di file credenziali (.env / .secret_docs). Usa scratch/test-credentials-verification.mjs per diagnostica sicura.';
    }
  }

  return null;
}

let rawInput = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  rawInput += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!rawInput.trim()) return allow();
    const payload = JSON.parse(rawInput);
    const toolName = (payload?.toolCall?.name || '').toLowerCase();
    const args = payload?.toolCall?.args || {};

    if (toolName === 'read_file' || toolName === 'view_file') {
      const targetPath = args.Path || args.path || args.AbsolutePath || '';
      if (isSensitiveFilePath(targetPath)) {
        return deny(
          `🛡️ Scudo Anti-Leak Antigravity: lettura bloccata su "${path.basename(targetPath)}". I file .env e .secret_docs in chiaro non devono mai entrare nel contesto AI.`
        );
      }
    }

    if (toolName === 'run_command') {
      const cmd = args.CommandLine || args.command || '';
      const violation = isSensitiveShellCommand(cmd);
      if (violation) {
        return deny(`🛡️ Scudo Anti-Leak Antigravity: ${violation}`);
      }
    }

    return allow();
  } catch {
    // Fail-safe: never block the IDE on unexpected input
    return allow();
  }
});
