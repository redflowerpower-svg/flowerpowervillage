import fs from 'fs';
import path from 'path';

/**
 * =============================================================================
 * 🌐 DEEPSEEK BATCH TRANSLATOR - 4 NEW LANGUAGES (ES, FR, RU, ZH)
 * =============================================================================
 */

let apiKey = process.env.DEEPSEEK_API_KEY || '';
if (!apiKey) {
  const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2 && parts[0].trim() === 'DEEPSEEK_API_KEY') {
        apiKey = parts.slice(1).join('=').trim();
      }
    });
  }
}

if (!apiKey) {
  console.error('❌ DEEPSEEK_API_KEY non trovata.');
  process.exit(1);
}

const TARGET_LANGS = [
  { code: 'ES', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'FR', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'RU', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'ZH', name: 'Chinese Simplified (简体中文)', flag: '🇨🇳' }
];

async function callDeepSeek(prompt, systemPrompt = 'You are a professional native translator for high-end Italian restaurant & pizzeria menus.') {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API Error: ${res.status} - ${errText}`);
  }

  const json = await res.json();
  return JSON.parse(json.choices[0].message.content);
}

async function run() {
  console.log('🚀 Avvio traduzione DeepSeek per 4 nuove lingue: ES, FR, RU, ZH...');

  // 1. Traduzione Labels UI per MenuGrid & Dining Tablet & Checkout
  const uiSource = {
    sizeOptions: 'Size options',
    extraIngredients: 'extra ingredients',
    startingAt: 'Starting at',
    totalFinito: 'Total price',
    confirmText: 'Order',
    closeText: 'Close',
    customizeText: 'Customize',
    chooseText: 'Add',
    freeText: 'Free',
    lasagnaBadge: '🍝 Min. 2 people · Pre-order 1 day in advance',
    lasagnaDateLabel: 'Select pickup / delivery date',
    lasagnaDatePlaceholder: 'Choose a date...',
    lasagnaDateRequired: '⚠️ Please select a date to proceed',
    lasagnaWhyLabel: 'Preparation takes time to guarantee the best quality.',
    splitVariantName: '12" Half & Half 🌓',
    splitChooseSecondHalf: 'Choose 2nd half',
    splitSearchPlaceholder: 'Search pizza for 2nd half...',
    splitFirstHalfLabel: '1st Half (Base)',
    splitSecondHalfLabel: '2nd Half',
    splitSecondHalfRequired: '⚠️ Please select a 2nd half to proceed',
    splitAverageNotice: '50/50 Price: exact average of the two 12" flavors',
    splitSelectedBadge: 'Selected Flavor',
    chickenOptionTitle: '100% Chicken Option (Halal-friendly)',
    chickenOptionDesc: 'Replaces pork cold cuts/meat with chicken',
    chickenOptionSelected: 'Chicken Selected',
    chickenOptionSelect: '+ Choose Chicken',
    cartEmpty: 'Your cart is empty',
    cartTitle: 'Your Order',
    cartSubtotal: 'Subtotal',
    cartDelivery: 'Delivery fee',
    cartFreeDelivery: 'Free delivery',
    cartDiscount10: '10% Welcome Discount',
    cartDiscount5Table: '-5% Table Discount',
    cartCheckoutBtn: 'PROCEED TO CHECKOUT',
    cartAddMore: 'Add more items',
    step1Title: 'Your Information & Service',
    fulfillmentDelivery: 'Home Delivery',
    fulfillmentTakeaway: 'Restaurant Pickup (Takeaway)',
    pickupLocationTitle: 'Pickup at Restaurant',
    pickupLocationAddress: 'Flower Power Pizza – Ranong Hot Springs, Bang Rin',
    pickupLocationHours: '⏰ Pickup Hours: 11:00 – 21:30 (Open)',
    pickupNotesPlaceholder: 'Pickup notes (e.g. arrival time, requests...)',
    namePlaceholder: 'Name',
    phonePlaceholder: 'Phone',
    emailPlaceholder: 'Email for receipt & tracking',
    notesPlaceholder: 'Delivery notes (e.g. buzzer, floor, allergies...)',
    invalidNameHint: 'Please enter a real and valid name',
    invalidPhoneHint: 'Please enter a valid phone number',
    invalidEmailHint: 'Please enter a valid email address',
    addressPlaceholder: 'Delivery Address',
    verifyLoc: 'Verify Location',
    verifyingLoc: 'Verifying...',
    outOfRange: 'We are sorry, your location is out of range. We deliver up to 6 km max.',
    deliveryBeyond6kmNotice: 'Home delivery is available up to 6 km. You can order with Takeaway and come pick up your hot pizza from us at Ranong Hot Springs!',
    switchToTakeawayBtn: 'Switch to Takeaway',
    outOfRangeTakeawayNotice: 'Online ordering is available for customers in Ranong (up to 6 km for delivery, up to 25 km for takeaway). Your current location is over 25 km away. You can still browse our menu freely!',
    outOfRangeTitle: 'You Are Outside the Ordering Area',
    continueBtn: 'Continue',
    step2Title: 'Payment Method',
    optPromptPay: 'PromptPay QR (Kasikorn Bank)',
    optCard: 'Card (Visa/MC)',
    optCash: 'Cash on delivery',
    optCashTakeaway: 'Cash on pickup at counter',
    cardHolderLabel: 'Cardholder Name',
    cardNumberLabel: 'Card Number (16 digits)',
    cardExpLabel: 'Expires (MM/YY)',
    cardCvvLabel: 'CVV',
    generateQrBtn: 'GENERATE PROMPTPAY QR',
    payCardBtn: 'CONFIRM & PAY WITH CARD',
    submitBtn: 'CONFIRM AND SEND ORDER',
    backBtn: 'Go Back',
    successTitle: 'Kitchen is at work!',
    successDesc: 'Thank you! Your order has been recorded and is being prepared.',
    closeBtn: 'Close',
    tableWelcomeDiscountTitle: 'Welcome to Flower Power Pizza!',
    tableWelcomeDiscountDesc: 'You are seated at the restaurant: a -5% immediate discount is automatically applied to all dishes and pizzas on your tablet.',
    tableStartOrderingBtn: 'Start Ordering at Table (-5%)',
    tableLeadGenTitle: 'Receive a 10% Discount Coupon for Home Delivery!',
    tableLeadGenDesc: 'Enter your details to receive your 10% Welcome Coupon valid for your next delivery order on flowerpowerpizza.com.',
    tableLeadGenSubmit: 'Get My 10% Coupon',
    tableCheckoutTitle: 'Table Order Confirmation',
    tablePayPromptPay: 'PromptPay QR (0% Fee)',
    tablePayCardPOS: 'Credit / Debit Card (Mobile POS at Table)',
    tablePayCash: 'Cash at Counter / Waiter'
  };

  const translatedUI = {};

  for (const lang of TARGET_LANGS) {
    console.log(`⏳ Traduzione UI per ${lang.code} (${lang.name})...`);
    const prompt = `Translate this JSON dictionary into ${lang.name}. Return JSON with exact same keys.\n\nInput:\n${JSON.stringify(uiSource, null, 2)}`;
    const res = await callDeepSeek(prompt, `You are a native translator for a premium Italian restaurant in Thailand. Translate UI texts into ${lang.name} accurately and elegantly.`);
    translatedUI[lang.code] = res;
    console.log(`✅ Completato ${lang.code}!`);
  }

  fs.writeFileSync('scratch/deepseek_4langs_ui.json', JSON.stringify(translatedUI, null, 2));
  console.log('🎉 Traduzioni UI salvate in scratch/deepseek_4langs_ui.json');
}

run().catch(console.error);
