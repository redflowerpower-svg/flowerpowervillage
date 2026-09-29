import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Patterns to identify dangerous literal values
const SECRET_REGEXES = [
  { name: 'Stripe Secret Key', regex: /sk_(live|test)_[0-9a-zA-Z]{24,}/ },
  { name: 'Stripe Webhook Secret', regex: /whsec_[0-9a-zA-Z]{32,}/ },
  { name: 'Omise Secret Key', regex: /skey_(live|test)_[0-9a-zA-Z]{15,}/ },
  { name: 'Omise Public Key Literal in Backend', regex: /pkey_(live|test)_[0-9a-zA-Z]{15,}/ },
  { name: 'Octorate Client Secret Literal', regex: /secret_[0-9a-f]{32}[A-Z0-9]+/ },
  { name: 'Telegram Bot Token', regex: /[0-9]{9,11}:[a-zA-Z0-9_-]{35}/ },
  { name: 'Supabase Service Role JWT', regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/ },
  { name: 'Hardcoded Google App Password (4x4)', regex: /['"][a-z]{4}\s+[a-z]{4}\s+[a-z]{4}\s+[a-z]{4}['"]/ },
  { name: 'DeepSeek API Key', regex: /sk-[0-9a-zA-Z]{32,}/ },
  { name: 'Google Maps Key Literal in Backend', regex: /AIzaSy[0-9a-zA-Z_-]{33}/ },
];

// Folders to scan
const SCAN_DIRS = ['api', 'src', '.agents', 'documentation_reports'];
const IGNORED_FILES = ['.env', '.secret_docs'];

const issues = [];

function scanDir(dir) {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) return;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        scanDir(relPath);
      }
    } else if (entry.isFile()) {
      scanFile(relPath);
    }
  }
}

function scanFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    for (const rule of SECRET_REGEXES) {
      if (rule.regex.test(line)) {
        // Exclude generic documentation placeholder patterns like sk_test_... or skey_test_...
        if (line.includes('placeholder') || line.includes('sk_test_...') || line.includes('skey_test_...')) {
          continue;
        }
        issues.push({
          file: filePath,
          line: idx + 1,
          rule: rule.name,
          preview: line.trim()
        });
      }
    }
  });
}

console.log('🔍 Starting Comprehensive Security Audit across codebase...');
for (const dir of SCAN_DIRS) {
  scanDir(dir);
}

console.log('\n--- SCAN RESULTS ---');
if (issues.length === 0) {
  console.log('🎉 0 SECRETS DETECTED! Codebase is 100% blindato and secure.');
} else {
  console.log(`⚠️ FOUND ${issues.length} POTENTIAL SECRET LEAKS:\n`);
  for (const issue of issues) {
    console.log(`❌ [${issue.rule}] in ${issue.file}:${issue.line}`);
    console.log(`   > ${issue.preview}\n`);
  }
}
