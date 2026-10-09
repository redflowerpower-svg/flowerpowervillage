import fs from 'fs';
import path from 'path';

const checkoutPath = path.join(process.cwd(), 'src/pizza/components/CheckoutFlow.tsx');
let checkoutCode = fs.readFileSync(checkoutPath, 'utf8');

// Helper to format discount line
const discountSavingsBlock = `{discountAmount > 0 && (
                      <p className="text-[9px] font-black text-emerald-700">
                        🎉 {appliedPromo 
                             ? (lang === 'TH' ? \`ใช้ส่วนลดโปรโมชั่น \${appliedPromo.code}: ประหยัด \${discountAmount}฿\` :
                                lang === 'IT' ? \`Risparmi \${discountAmount}฿ (Coupon \${appliedPromo.code})\` :
                                lang === 'DE' ? \`Sie sparen \${discountAmount}฿ (Code \${appliedPromo.code})\` :
                                \`You save \${discountAmount}฿ (Coupon \${appliedPromo.code})\`)
                             : (lang === 'TH' ? \`ประหยัด \${discountAmount}฿ (ส่วนลดสั่งครั้งแรก 10%)\` :
                                lang === 'IT' ? \`Risparmi \${discountAmount}฿ (Sconto 1° Ordine 10%)\` :
                                lang === 'DE' ? \`Sie sparen \${discountAmount}฿ (10% Erstbesteller-Rabatt)\` :
                                \`You save \${discountAmount}฿ (10% 1st Order Discount)\`)}
                      </p>
                    )}`;

// Replace strike-through total condition: if discountAmount > 0, show original total crossed out
checkoutCode = checkoutCode.replace(/\{isEligible && discountAmount > 0 && \(\s*<span className="text-stone-400 line-through text-xs font-medium">\s*\{subtotal \+ deliveryFee\}฿\s*<\/span>\s*\)\}/g, 
  `{discountAmount > 0 && (
                        <span className="text-stone-400 line-through text-xs font-medium">
                          {subtotal + deliveryFee}฿
                        </span>
                      )}`
);

// Replace savings text in credit card and cash
checkoutCode = checkoutCode.replace(/\{isEligible && discountAmount > 0 && \(\s*<p className="text-\[9px\] font-black text-emerald-700">[\s\S]*?<\/p>\s*\)\}/g,
  discountSavingsBlock
);

fs.writeFileSync(checkoutPath, checkoutCode, 'utf8');
console.log('Successfully updated payment summary discount breakdown in CheckoutFlow.tsx');
