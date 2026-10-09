import fs from 'fs';
import path from 'path';

// 1. Update DeliveryMenu.tsx
const deliveryMenuPath = path.resolve('src/pizza/pages/DeliveryMenu.tsx');
let dmContent = fs.readFileSync(deliveryMenuPath, 'utf8');

// Add fetchCloudPizzaPromoCodes to imports
if (!dmContent.includes('fetchCloudPizzaPromoCodes')) {
  dmContent = dmContent.replace(
    /clearAppliedPizzaPromo\r?\n\}/,
    'clearAppliedPizzaPromo,\r\n  fetchCloudPizzaPromoCodes\r\n}'
  );
}

// Update the URL promo useEffect
const oldEffectRegex = /\/\/ Parse & auto-apply promo code from \?promo= or \?coupon= URL parameters \(Village parity\)\r?\n\s*useEffect\(\(\) => \{[\s\S]*?\}, \[lang\]\);/;

const newEffect = `// Parse & auto-apply promo code from ?promo= or ?coupon= URL parameters (Village parity) + Cloud Sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;
    const initPromo = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('promo') || params.get('coupon');

      try {
        const cloudCodes = await fetchCloudPizzaPromoCodes();
        if (isMounted && urlCode) {
          const res = validatePizzaPromoCode(urlCode, 0, cloudCodes, lang);
          if (res.valid && res.promo) {
            setAppliedPizzaPromo(res.promo);
            setAppliedPromo(res.promo);
          }
        }
      } catch (err) {
        if (isMounted && urlCode) {
          const res = validatePizzaPromoCode(urlCode, 0, undefined, lang);
          if (res.valid && res.promo) {
            setAppliedPizzaPromo(res.promo);
            setAppliedPromo(res.promo);
          }
        }
      }
    };

    initPromo();

    return () => {
      isMounted = false;
    };
  }, [lang]);`;

if (oldEffectRegex.test(dmContent)) {
  dmContent = dmContent.replace(oldEffectRegex, newEffect);
  fs.writeFileSync(deliveryMenuPath, dmContent, 'utf8');
  console.log('✅ Successfully updated DeliveryMenu.tsx');
} else {
  console.log('⚠️ Could not match old effect in DeliveryMenu.tsx');
}

// 2. Update CartDrawer.tsx to check cloud codes on apply
const cartDrawerPath = path.resolve('src/pizza/components/CartDrawer.tsx');
let cdContent = fs.readFileSync(cartDrawerPath, 'utf8');

if (!cdContent.includes('fetchCloudPizzaPromoCodes')) {
  cdContent = cdContent.replace(
    /clearAppliedPizzaPromo\r?\n\}/,
    'clearAppliedPizzaPromo,\r\n  fetchCloudPizzaPromoCodes\r\n}'
  );
}

const oldApplyPromoRegex = /const handleApplyPromo = \(\) => \{[\s\S]*?const res = validatePizzaPromoCode\(targetCode, subtotal, undefined, lang\);[\s\S]*?const discountText = res\.promo\.discountType === 'percentage'/;

const newApplyPromo = `const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError(
        lang === 'TH' ? '📱 ติดตามช่องทางโซเชียลของเราเพื่อรับโค้ดโปรโมชั่นและข้อเสนอสุดพิเศษ!' :
        lang === 'DE' ? '📱 Folge unseren Social-Media-Kanälen, um Promo-Codes und exklusive Angebote zu erhalten!' :
        lang === 'MM' ? '📱 သင့်အတွက် သီးသန့် ပရိုမိုးရှင်း ကုဒ်များနှင့် အထူးကမ်းလှမ်းချက်များကို ရရှိရန် ကျွန်ုပ်တို့၏ ဆိုရှယ်မီဒီယာ ချန်နယ်များကို လိုက်ကြည့်ပါ။' :
        '📱 Follow our social media channels to receive promo codes and exclusive offers!'
      );
      setPromoSuccess(null);
      return;
    }
    const targetCode = promoInput.trim().toUpperCase();
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
    const discountText = res.promo.discountType === 'percentage'`;

if (oldApplyPromoRegex.test(cdContent)) {
  cdContent = cdContent.replace(oldApplyPromoRegex, newApplyPromo);
  fs.writeFileSync(cartDrawerPath, cdContent, 'utf8');
  console.log('✅ Successfully updated CartDrawer.tsx');
} else {
  console.log('⚠️ Could not match handleApplyPromo in CartDrawer.tsx');
}
