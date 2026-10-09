import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/pizza/components/CheckoutFlow.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `        // If a promo code was used, increment usage counter & clear session promo
        if (activePromoCode) {
          try {
            incrementPizzaPromoUsage(activePromoCode);
            clearAppliedPizzaPromo();
          } catch (e) {
            console.warn('Failed incrementing promo usage:', e);
          }
        }`;

const replacement = `        // If a promo code was used, increment usage counter & clear session promo
        const promoToIncrement = activePromoCode || appliedPromo?.code || getAppliedPizzaPromo()?.code;
        if (promoToIncrement) {
          try {
            incrementPizzaPromoUsage(promoToIncrement).catch(e => console.warn('Failed incrementing cloud promo usage:', e));
            clearAppliedPizzaPromo();
          } catch (e) {
            console.warn('Failed incrementing promo usage:', e);
          }
        }`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const updatedNorm = normContent.replace(normTarget, replacement.replace(/\r\n/g, '\n'));
  const finalContent = content.includes('\r\n') ? updatedNorm.replace(/\n/g, '\r\n') : updatedNorm;
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('✅ Updated CheckoutFlow.tsx promo consumption');
} else {
  console.log('❌ Target not found in CheckoutFlow.tsx');
}
