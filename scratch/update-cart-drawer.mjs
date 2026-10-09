import fs from 'fs';
import path from 'path';

const cartDrawerPath = path.resolve('src/pizza/components/CartDrawer.tsx');
let content = fs.readFileSync(cartDrawerPath, 'utf8');

// 1. Add fetchCloudPizzaPromoCodes to imports
if (!content.includes('fetchCloudPizzaPromoCodes')) {
  content = content.replace(
    'clearAppliedPizzaPromo',
    'clearAppliedPizzaPromo,\r\n  fetchCloudPizzaPromoCodes'
  );
}

// 2. Update handleApplyPromo
const oldFn = `  const handleApplyPromo = (codeToApply?: string) => {
    const targetCode = (codeToApply !== undefined ? codeToApply : promoInput).trim().toUpperCase();
    if (!targetCode) {
      setPromoError(
        lang === 'IT' ? '📱 Segui i nostri social media per ricevere codici promozionali ed offerte esclusive!' :
        lang === 'TH' ? '📱 ติดตามช่องทางโซเชียลของเราเพื่อรับโค้ดโปรโมชั่นและข้อเสนอสุดพิเศษ!' :
        lang === 'DE' ? '📱 Folge unseren Social-Media-Kanälen, um Promo-Codes und exklusive Angebote zu erhalten!' :
        lang === 'MM' ? '📱 သင့်အတွက် သီးသန့် ပရိုမိုးရှင်း ကုဒ်များနှင့် အထူးကမ်းလှမ်းချက်များကို ရရှိရန် ကျွန်ုပ်တို့၏ ဆိုရှယ်မီဒီယာ ချန်နယ်များကို လိုက်ကြည့်ပါ။' :
        '📱 Follow our social media channels to receive promo codes and exclusive offers!'
      );
      setPromoSuccess(null);
      return;
    }
    const res = validatePizzaPromoCode(targetCode, subtotal, undefined, lang);
    if (!res.valid || !res.promo) {
      setPromoError(res.error || (lang === 'IT' ? 'Codice non valido' : 'Invalid promo code'));
      setPromoSuccess(null);
      return;
    }
    setAppliedPizzaPromo(res.promo);
    setAppliedPromo(res.promo);
    setPromoError(null);
    const discountText = res.promo.discountType === 'percentage' ? \`-\${res.promo.discountValue}%\` : \`-฿\${res.promo.discountValue}\`;
    setPromoSuccess(
      lang === 'IT' ? \`Coupon \${res.promo.code} (\${discountText}) applicato!\` :
      lang === 'TH' ? \`ใช้รหัส \${res.promo.code} (\${discountText}) สำเร็จ!\` :
      lang === 'DE' ? \`Gutschein \${res.promo.code} (\${discountText}) angewendet!\` :
      lang === 'MM' ? \`ကုဒ် \${res.promo.code} (\${discountText}) အသုံးပြုပြီး!\` :
      \`Coupon \${res.promo.code} (\${discountText}) applied!\`
    );
  };`;

const newFn = `  const handleApplyPromo = async (codeToApply?: string) => {
    const targetCode = (codeToApply !== undefined ? codeToApply : promoInput).trim().toUpperCase();
    if (!targetCode) {
      setPromoError(
        lang === 'IT' ? '📱 Segui i nostri social media per ricevere codici promozionali ed offerte esclusive!' :
        lang === 'TH' ? '📱 ติดตามช่องทางโซเชียลของเราเพื่อรับโค้ดโปรโมชั่นและข้อเสนอสุดพิเศษ!' :
        lang === 'DE' ? '📱 Folge unseren Social-Media-Kanälen, um Promo-Codes und exklusive Angebote zu erhalten!' :
        lang === 'MM' ? '📱 သင့်အတွက် သီးသန့် ပရိုမိုးရှင်း ကုဒ်များနှင့် အထူးကမ်းလှမ်းချက်များကို ရရှိရန် ကျွန်ုပ်တို့၏ ဆိုရှယ်မီဒီယာ ချန်နယ်များကို လိုက်ကြည့်ပါ။' :
        '📱 Follow our social media channels to receive promo codes and exclusive offers!'
      );
      setPromoSuccess(null);
      return;
    }
    let res = validatePizzaPromoCode(targetCode, subtotal, undefined, lang);
    if (!res.valid || !res.promo) {
      try {
        const cloudCodes = await fetchCloudPizzaPromoCodes();
        res = validatePizzaPromoCode(targetCode, subtotal, cloudCodes, lang);
      } catch (_) {}
    }

    if (!res.valid || !res.promo) {
      setPromoError(res.error || (lang === 'IT' ? 'Codice non valido' : 'Invalid promo code'));
      setPromoSuccess(null);
      return;
    }
    setAppliedPizzaPromo(res.promo);
    setAppliedPromo(res.promo);
    setPromoError(null);
    const discountText = res.promo.discountType === 'percentage' ? \`-\${res.promo.discountValue}%\` : \`-฿\${res.promo.discountValue}\`;
    setPromoSuccess(
      lang === 'IT' ? \`Coupon \${res.promo.code} (\${discountText}) applicato!\` :
      lang === 'TH' ? \`ใช้รหัส \${res.promo.code} (\${discountText}) สำเร็จ!\` :
      lang === 'DE' ? \`Gutschein \${res.promo.code} (\${discountText}) angewendet!\` :
      lang === 'MM' ? \`ကုဒ် \${res.promo.code} (\${discountText}) အသုံးပြုပြီး!\` :
      \`Coupon \${res.promo.code} (\${discountText}) applied!\`
    );
  };`;

// Normalize \r\n for replacement
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedOldFn = oldFn.replace(/\r\n/g, '\n');
const normalizedNewFn = newFn.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedOldFn)) {
  const updated = normalizedContent.replace(normalizedOldFn, normalizedNewFn);
  fs.writeFileSync(cartDrawerPath, updated, 'utf8');
  console.log('✅ Successfully updated CartDrawer.tsx');
} else {
  console.log('⚠️ Could not match oldFn in CartDrawer.tsx');
}
