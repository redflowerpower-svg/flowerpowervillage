import fs from 'fs';

const filePath = 'src/pizza/data/i18n.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace any broken literal multiline string assignment in i18n
// Match patterns like: CODE: 'something\nsomething',
const lines = content.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if line starts with key like ES: '... but doesn't end with quote and comma or quote
  const match = line.match(/^(\s*)([A-Z]{2}):\s*'(.*)$/);
  if (match) {
    const indent = match[1];
    const code = match[2];
    const strStart = match[3];

    // Check if it ends with single quote followed by optional comma/semicolon
    if (!strStart.trim().match(/'\s*,?\s*$/) || (strStart.includes("'") && strStart.endsWith("\\'"))) {
      // It spans multiple lines
      let combined = strStart;
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        combined += '\\n' + nextLine;
        if (nextLine.match(/'\s*,?\s*$/) && !nextLine.endsWith("\\'")) {
          break;
        }
        j++;
      }
      i = j; // advance outer loop
      // Clean up closing quote
      combined = combined.replace(/'\s*,?\s*$/, '');
      // Clean up extra backslashes if any
      fixedLines.push(`${indent}${code}: '${combined}',`);
      continue;
    }
  }

  fixedLines.push(line);
}

fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');
console.log('✅ Checked and sanitized i18n.ts!');
