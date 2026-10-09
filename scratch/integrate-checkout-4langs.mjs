import fs from 'fs';

console.log('🚀 Avvio integrazione 4 lingue in CheckoutFlow.tsx...');

const ui = JSON.parse(fs.readFileSync('scratch/deepseek_4langs_ui.json', 'utf8'));

let checkoutCode = fs.readFileSync('src/pizza/components/CheckoutFlow.tsx', 'utf8');

const generateCheckoutLang = (code, data) => `  ${code}: {
    step1Title: '${data.step1Title}',
    fulfillmentDelivery: '${data.fulfillmentDelivery}',
    fulfillmentTakeaway: '${data.fulfillmentTakeaway}',
    pickupLocationTitle: '${data.pickupLocationTitle}',
    pickupLocationAddress: '${data.pickupLocationAddress}',
    pickupLocationHours: '${data.pickupLocationHours}',
    pickupNotesPlaceholder: '${data.pickupNotesPlaceholder}',
    namePlaceholder: '${data.namePlaceholder}',
    phonePlaceholder: '${data.phonePlaceholder}',
    emailPlaceholder: '${data.emailPlaceholder}',
    notesPlaceholder: '${data.notesPlaceholder}',
    invalidNameHint: '${data.invalidNameHint}',
    invalidPhoneHint: '${data.invalidPhoneHint}',
    invalidEmailHint: '${data.invalidEmailHint}',
    addressPlaceholder: '${data.addressPlaceholder}',
    verifyLoc: '${data.verifyLoc}',
    verifyingLoc: '${data.verifyingLoc}',
    outOfRange: (dist: number, max: number) => \`${data.outOfRange.replace(/6 km/g, '\${max} km')}\`,
    deliveryBeyond6kmNotice: (dist: number) => \`${data.deliveryBeyond6kmNotice} (\${dist.toFixed(1)} km)\`,
    switchToTakeawayBtn: '${data.switchToTakeawayBtn}',
    outOfRangeTakeawayNotice: '${data.outOfRangeTakeawayNotice}',
    outOfRangeTitle: '${data.outOfRangeTitle}',
    simLoc: 'Simulate location (Test)',
    continueBtn: '${data.continueBtn}',
    step2Title: '${data.step2Title}',
    optPromptPay: '${data.optPromptPay}',
    optCard: '${data.optCard}',
    optCash: '${data.optCash}',
    optCashTakeaway: '${data.optCashTakeaway}',
    cardHolderLabel: '${data.cardHolderLabel}',
    cardNumberLabel: '${data.cardNumberLabel}',
    cardExpLabel: '${data.cardExpLabel}',
    cardCvvLabel: '${data.cardCvvLabel}',
    cardSecurityNotice: '3D Secure (256-bit SSL encryption)',
    generateQrBtn: '${data.generateQrBtn}',
    payCardBtn: '${data.payCardBtn}',
    scanningPrompt: 'Scan QR with your banking app',
    awaitingPayment: 'Awaiting bank confirmation...',
    paymentConfirmedTitle: 'PAYMENT RECEIVED!',
    manualSlipFallback: 'Upload receipt screenshot',
    uploadBtn: 'Upload receipt',
    submitBtn: '${data.submitBtn}',
    uploadPromptBtn: 'UPLOAD RECEIPT TO PROCEED',
    kbankStep4: 'Upload receipt screenshot',
    backBtn: '${data.backBtn}',
    successTitle: '${data.successTitle}',
    successDesc: '${data.successDesc}',
    closeBtn: '${data.closeBtn}',
    waitText: 'Please wait...',
    confirmMapLoc: 'DELIVER HERE (CONFIRM LOCATION)',
    mapInstructions: 'Tap map or move pin to your delivery spot',
    tapHint: 'Tap map to drop pin',
    expandMap: 'Expand',
    collapseMap: 'Minimize',
    locConfirmed: (dist: number) => \`Location confirmed! (~\${dist.toFixed(1)} km)\`,
    detectLocBtn: 'Find my location',
    sendingTitle: 'Sending your order...',
    sendingHint: 'Waiting for kitchen confirmation',
    timeoutTitle: 'The kitchen is busy. Please contact us directly if needed.',
    timeoutHint: 'Your order may still have arrived.',
    retryBtn: 'Retry sending order',
    emergencyTitle: 'Contact us directly',
    trackerPreparing: 'Preparing your pizzas...',
    trackerTakeawayPreparing: 'Preparing your takeaway order...',
    trackerEstimate: (mins: number) => \`Estimated delivery time: ~\${mins} minutes\`,
    trackerDelivering: 'Delivery on the way!',
    trackerTakeawayReady: 'ORDER IS READY!',
    trackerTakeawayReadyDesc: 'Your pizzas are hot and ready for pickup at Ranong Hot Springs!',
    supportNotice: 'Feel free to contact us for any inquiries',
    trackerDeliveryDetails: (dist: number, mins: number) => \`Distance: \${dist.toFixed(1)} km — Travel time: ~\${mins} mins\`,
  },`;

const esBlock = generateCheckoutLang('ES', ui.ES);
const frBlock = generateCheckoutLang('FR', ui.FR);
const ruBlock = generateCheckoutLang('RU', ui.RU);
const zhBlock = generateCheckoutLang('ZH', ui.ZH);

const allBlocks = `\n${esBlock}\n${frBlock}\n${ruBlock}\n${zhBlock}\n};`;

if (!checkoutCode.includes('ES: {')) {
  checkoutCode = checkoutCode.replace(/\n\};\s*\n\/\/ React component to dynamically center Google Map/, `${allBlocks}\n\n// React component to dynamically center Google Map`);
}

fs.writeFileSync('src/pizza/components/CheckoutFlow.tsx', checkoutCode, 'utf8');
console.log('✅ CheckoutFlow.tsx aggiornato con le 9 lingue!');
