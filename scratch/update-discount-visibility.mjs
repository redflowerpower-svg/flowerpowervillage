import fs from 'fs';
import path from 'path';

const checkoutPath = path.join(process.cwd(), 'src/pizza/components/CheckoutFlow.tsx');
let checkoutCode = fs.readFileSync(checkoutPath, 'utf8');

// In Step 1, show promo coupon if appliedPromo is present, otherwise show first order if !appliedPromo && isEligible
const oldStep1Banner = `{isEligible && discountAmount > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border border-emerald-400/50 rounded-xl p-2 flex items-center justify-between shadow-2xs animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🎉</span>
                    <span className="text-[10px] font-black text-emerald-950 uppercase tracking-wide">
                      {lang === 'TH' ? 'ส่วนลดต้อนรับ 10% สั่งครั้งแรก' :
                       lang === 'IT' ? 'Sconto 1° Ordine (10%) Applicato' :
                       lang === 'DE' ? '10% Erstbesteller-Rabatt Aktiviert' :
                       '10% 1st Order Welcome Discount'}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-300">
                    -{discountAmount}฿
                  </span>
                </div>
              )}`;

const newStep1Banner = `{appliedPromo && discountAmount > 0 ? (
                <div className="bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-500/15 border border-amber-400/60 rounded-xl p-2.5 flex items-center justify-between shadow-2xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎟️</span>
                    <div>
                      <span className="text-[10px] font-black text-amber-950 uppercase tracking-wide block">
                        {lang === 'TH' ? \`คูปองส่วนลด \${appliedPromo.code}\` :
                         lang === 'IT' ? \`Coupon \${appliedPromo.code} Applicato\` :
                         lang === 'DE' ? \`Gutscheincode \${appliedPromo.code} Aktiv\` :
                         \`Coupon \${appliedPromo.code} Applied\`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-black text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-lg border border-amber-400">
                    -{discountAmount}฿
                  </span>
                </div>
              ) : (!appliedPromo && isEligible && discountAmount > 0) ? (
                <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border border-emerald-400/50 rounded-xl p-2 flex items-center justify-between shadow-2xs animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🎉</span>
                    <span className="text-[10px] font-black text-emerald-950 uppercase tracking-wide">
                      {lang === 'TH' ? 'ส่วนลดต้อนรับ 10% สั่งครั้งแรก' :
                       lang === 'IT' ? 'Sconto 1° Ordine (10%) Applicato' :
                       lang === 'DE' ? '10% Erstbesteller-Rabatt Aktiviert' :
                       '10% 1st Order Welcome Discount'}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-300">
                    -{discountAmount}฿
                  </span>
                </div>
              ) : null}`;

// Replace normalized line breaks
const normCheckout = checkoutCode.replace(/\r\n/g, '\n');
const normOldStep1 = oldStep1Banner.replace(/\r\n/g, '\n');

if (normCheckout.includes(normOldStep1)) {
  const updated = normCheckout.replace(normOldStep1, newStep1Banner);
  fs.writeFileSync(checkoutPath, updated, 'utf8');
  console.log('Updated Step 1 banner in CheckoutFlow.tsx');
} else {
  console.log('Old step 1 banner not matched directly, replacing regex...');
  const rx = /\{\s*isEligible\s*&&\s*discountAmount\s*>\s*0\s*&&\s*\(\s*<div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50[\s\S]*?<\/div>\s*\)\s*\}/;
  if (rx.test(normCheckout)) {
    const updated = normCheckout.replace(rx, newStep1Banner);
    fs.writeFileSync(checkoutPath, updated, 'utf8');
    console.log('Replaced Step 1 banner via regex in CheckoutFlow.tsx');
  } else {
    console.error('Regex match failed in CheckoutFlow.tsx');
  }
}
