import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/booking/components/booking-engine.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = '{appliedPromo && (\r\n        <div className="fixed bottom-0 left-0 right-0 z-50';
const targetLF = '{appliedPromo && (\n        <div className="fixed bottom-0 left-0 right-0 z-50';
const replacement = '{appliedPromo && !selectedRoom && (\r\n        <div className="fixed bottom-0 left-0 right-0 z-30';
const replacementLF = '{appliedPromo && !selectedRoom && (\n        <div className="fixed bottom-0 left-0 right-0 z-30';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Replaced CRLF in booking-engine.tsx');
} else if (content.includes(targetLF)) {
  content = content.replace(targetLF, replacementLF);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Replaced LF in booking-engine.tsx');
} else {
  console.log('Target not found directly in booking-engine.tsx');
}
