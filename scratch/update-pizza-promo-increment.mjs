import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/pizza/services/pizzaPromoService.ts');
let content = fs.readFileSync(filePath, 'utf8');

const target = `export function incrementPizzaPromoUsage(codeOrId: string): void {
  if (!codeOrId) return;
  const clean = codeOrId.trim().toUpperCase();
  const list = loadPizzaPromoCodes();
  const updated = list.map((p) => {
    if (p.id === codeOrId || p.code.trim().toUpperCase() === clean) {
      const nextUsed = (p.slotsUsed || 0) + 1;
      return {
        ...p,
        slotsUsed: nextUsed,
        active: p.isSingleUse ? false : (p.slotsTotal > 0 && nextUsed >= p.slotsTotal ? false : p.active)
      };
    }
    return p;
  });
  savePizzaPromoCodes(updated);
}`;

const replacement = `export async function incrementPizzaPromoUsage(codeOrId: string): Promise<void> {
  if (!codeOrId) return;
  const clean = codeOrId.trim().toUpperCase();
  const list = await fetchCloudPizzaPromoCodes().catch(() => loadPizzaPromoCodes());
  const updated = list.map((p) => {
    if (p.id === codeOrId || p.code.trim().toUpperCase() === clean) {
      const nextUsed = (p.slotsUsed || 0) + 1;
      return {
        ...p,
        slotsUsed: nextUsed,
        active: p.isSingleUse ? false : (p.slotsTotal > 0 && nextUsed >= p.slotsTotal ? false : p.active)
      };
    }
    return p;
  });
  savePizzaPromoCodes(updated);
  await saveCloudPizzaPromoCodes(updated);
}`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const updatedNorm = normContent.replace(normTarget, replacement.replace(/\r\n/g, '\n'));
  const finalContent = content.includes('\r\n') ? updatedNorm.replace(/\n/g, '\r\n') : updatedNorm;
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('✅ Updated incrementPizzaPromoUsage in pizzaPromoService.ts');
} else {
  console.log('❌ Target not found in pizzaPromoService.ts');
}
