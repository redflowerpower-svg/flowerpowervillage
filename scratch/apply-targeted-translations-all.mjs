import fs from 'fs';

const translations = JSON.parse(fs.readFileSync('scratch/deepseek_targeted_translations.json', 'utf8'));

// -------------------------------------------------------------
// 1. UPDATE DeliveryMenu.tsx (Wine Compliance Banner on Homepage)
// -------------------------------------------------------------
const dmPath = 'src/pizza/pages/DeliveryMenu.tsx';
let dmContent = fs.readFileSync(dmPath, 'utf8');

// Replace Wine Banner Badge
const oldWineBadge = `                        {lang === 'TH' ? '🍷 สิทธิพิเศษไวน์ • ลด 10% ที่โต๊ะอาหาร' :
                         lang === 'IT' ? '🍷 DEGUSTAZIONE IN LOCALE • SCONTO 10%' :
                         lang === 'DE' ? '🍷 WEINVERKOSTUNG VOR ORT • 10% RABATT' :
                         '🍷 DINE-IN WINE PRIVILEGE • 10% OFF'}`;

const newWineBadge = `                        {translations[lang]?.wineBannerBadge || translations['EN'].wineBannerBadge}`;

dmContent = dmContent.replace(oldWineBadge, newWineBadge);

// Replace Wine Banner Title
const oldWineTitle = `                    {lang === 'TH' ? 'ไวน์นำเข้าชั้นเลิศ • จองโต๊ะล่วงหน้ารับส่วนลดพิเศษ 10%' :
                     lang === 'IT' ? 'Selezione Vini al Ristorante • Prenota dal sito e ricevi il 10% di sconto' :
                     lang === 'DE' ? 'Erlesene Weinkarte • Online reservieren und 10% Rabatt genießen' :
                     'Fine Wine Selection • Book online to receive an exclusive 10% table discount'}`;

const newWineTitle = `                    {translations[lang]?.wineBannerTitle || translations['EN'].wineBannerTitle}`;

dmContent = dmContent.replace(oldWineTitle, newWineTitle);

// Replace Wine Banner Desc
const oldWineDesc = `                    {lang === 'TH' 
                      ? 'ตามกฎหมายแห่งราชอาณาจักรไทย การสั่งซื้อเครื่องดื่มแอลกอฮอล์ออนไลน์เพื่อจัดส่งถึงบ้านไม่สามารถทำได้ ขอเชิญท่านมาลิ้มลองไวน์ชั้นเลิศในบรรยากาศสบายๆ ณ ร้านของเรา: จองโต๊ะผ่านเว็บไซต์ รับส่วนลด 10% สำหรับไวน์ทุกขวดที่โต๊ะอาหารทันที!'
                      : lang === 'IT'
                      ? 'In conformità con le leggi del Regno di Thailandia, la vendita e consegna a domicilio di alcolici online non è consentita. Ti invitiamo a degustare i nostri vini direttamente al ristorante: prenotando dal nostro sito web ricevi subito il 10% di sconto su tutte le bottiglie al tavolo!'
                      : lang === 'DE'
                      ? 'Gemäß den gesetzlichen Bestimmungen Thailands ist die Online-Lieferung von Alkohol untersagt. Genießen Sie unsere Weine vor Ort im Restaurant: Bei einer Tischreservierung über unsere Website erhalten Sie 10% Rabatt auf alle Weinflaschen am Tisch!'
                      : 'In compliance with Thai law, online delivery of alcohol is not permitted. We invite you to enjoy our cellar selection at our restaurant in Ranong: reserve a table from our website to get a 10% discount on all wine bottles at your table!'}`;

const newWineDesc = `                    {translations[lang]?.wineBannerDesc || translations['EN'].wineBannerDesc}`;

dmContent = dmContent.replace(oldWineDesc, newWineDesc);

// Replace Wine Banner Button
const oldWineBtn = `                      {lang === 'TH' ? 'จองโต๊ะรับส่วนลด 10%' :
                       lang === 'IT' ? 'Prenota Tavolo (-10% Vini)' :
                       lang === 'DE' ? 'Tisch Reservieren (-10%)' :
                       'Book Table (-10% Wine)'}`;

const newWineBtn = `                      {translations[lang]?.wineBannerButton || translations['EN'].wineBannerButton}`;

dmContent = dmContent.replace(oldWineBtn, newWineBtn);

// Ensure translations object is imported or injected into DeliveryMenu.tsx
if (!dmContent.includes('const targetedTranslations: any =')) {
  dmContent = `const targetedTranslations: Record<string, any> = ${JSON.stringify(translations, null, 2)};\n` + dmContent;
  dmContent = dmContent.replaceAll('translations[lang]', 'targetedTranslations[lang]');
  dmContent = dmContent.replaceAll('translations[\'EN\']', 'targetedTranslations[\'EN\']');
}

fs.writeFileSync(dmPath, dmContent, 'utf8');
console.log('✅ Updated DeliveryMenu.tsx Wine Banner for all 9 languages.');

// -------------------------------------------------------------
// 2. UPDATE CheckoutFlow.tsx (10% Discount, Takeaway Box, K-Shop & Omise steps)
// -------------------------------------------------------------
const cfPath = 'src/pizza/components/CheckoutFlow.tsx';
let cfContent = fs.readFileSync(cfPath, 'utf8');

// 10% First Order Welcome Discount Banner in Checkout
const oldCfDiscount = `{lang === 'TH' ? 'ส่วนลดต้อนรับ 10% สั่งครั้งแรก' :
                       lang === 'IT' ? 'Sconto 1° Ordine (10%) Applicato' :
                       lang === 'DE' ? '10% Erstbesteller-Rabatt Aktiviert' :
                       '10% 1st Order Welcome Discount'}`;

const newCfDiscount = `{translations[lang]?.checkoutFirstOrderDiscount || translations['EN'].checkoutFirstOrderDiscount}`;

cfContent = cfContent.replace(oldCfDiscount, newCfDiscount);

// Takeaway box explanation
const oldTakeawayBox = `<div className="bg-white/90 border border-stone-200 rounded-xl px-3 py-2 text-[10.5px] text-stone-600 max-w-xs leading-relaxed shadow-2xs">
                  {lang === 'IT' && 'Le tue pizze verranno sfornate calde e confezionate in scatole termiche pronte per il tuo arrivo al banco del ristorante.'}
                  {lang === 'EN' && 'Your pizzas will be baked fresh and packed in thermal boxes ready for your arrival at our restaurant counter.'}
                  {lang === 'TH' && 'พิซซ่าอบสดใหม่ร้อนๆ พร้อมกล่องเก็บความร้อนเพื่อรอคุณมารับที่เคาน์เตอร์ร้าน'}
                  {lang === 'DE' && 'Ihre Pizzen werden frisch gebacken und in Wärmeboxen abholbereit an unserer Theke für Sie bereitgestellt.'}
                </div>`;

const newTakeawayBox = `<div className="bg-white/90 border border-stone-200 rounded-xl px-3 py-2 text-[10.5px] text-stone-600 max-w-xs leading-relaxed shadow-2xs">
                  {translations[lang]?.takeawayBoxExplanation || translations['EN'].takeawayBoxExplanation}
                </div>`;

cfContent = cfContent.replace(oldTakeawayBox, newTakeawayBox);

// K-Shop Guide Steps
const oldKshopGuide = `<p className="flex items-center gap-1 font-bold text-stone-800 text-[9px]">
                      <Smartphone size={11} className="text-[#8B1E1E] shrink-0" />
                      <span>
                        {lang === 'IT' && 'Come pagare con K-Shop (Kasikorn Bank):'}
                        {lang === 'EN' && 'How to pay with K-Shop (Kasikorn Bank):'}
                        {lang === 'TH' && 'วิธีชำระเงินผ่าน K-Shop (ธนาคารกสิกรไทย):'}
                        {lang === 'DE' && 'So zahlen Sie mit K-Shop (Kasikorn Bank):'}
                      </span>
                    </p>
                    <ol className="space-y-1 pl-3.5 list-decimal marker:text-[#8B1E1E] marker:font-bold leading-tight">
                      <li>
                        {lang === 'IT' && 'Salva il QR code o inquadralo direttamente con la tua App Bancaria.'}
                        {lang === 'EN' && 'Save the QR code or scan it directly with your Banking App.'}
                        {lang === 'TH' && 'บันทึกรูป QR หรือสแกนผ่านแอปธนาคาร'}
                        {lang === 'DE' && 'QR-Code speichern oder direkt mit Banking-App scannen.'}
                      </li>
                      <li>
                        {lang === 'IT' && \`Inserisci manualmente l'importo esatto: \${finalTotal} ฿\`}
                        {lang === 'EN' && \`Manually enter the exact order total: \${finalTotal} ฿\`}
                        {lang === 'TH' && \`ระบุยอดเงินชำระให้ตรงกับยอดสั่งซื้อ: \${finalTotal} ฿\`}
                        {lang === 'DE' && \`Geben Sie den genauen Gesamtbetrag manuell ein: \${finalTotal} ฿\`}
                      </li>
                      <li>
                        {lang === 'IT' && 'Conferma il bonifico ed effettua il pagamento.'}
                        {lang === 'EN' && 'Confirm the transfer and complete the payment.'}
                        {lang === 'TH' && 'ยืนยันการโอนเงินและทำรายการให้เรียบร้อย'}
                        {lang === 'DE' && 'Überweisung bestätigen und Zahlung abschließen.'}
                      </li>
                      <li className="font-bold text-[#8B1E1E]">
                        {lang === 'IT' && 'Carica lo screenshot della ricevuta di pagamento (slip) qui sotto.'}
                        {lang === 'EN' && 'Upload your payment receipt screenshot (slip) below.'}
                        {lang === 'TH' && 'อัปโหลดภาพหน้าจอสลิปหลักฐานการโอนเงินด้านล่าง'}
                        {lang === 'DE' && 'Laden Sie den Zahlungsbeleg-Screenshot (Slip) unten hoch.'}
                      </li>
                    </ol>`;

const newKshopGuide = `<p className="flex items-center gap-1 font-bold text-stone-800 text-[9px]">
                      <Smartphone size={11} className="text-[#8B1E1E] shrink-0" />
                      <span>{translations[lang]?.kshopTitle || translations['EN'].kshopTitle}</span>
                    </p>
                    <ol className="space-y-1 pl-3.5 list-decimal marker:text-[#8B1E1E] marker:font-bold leading-tight">
                      <li>{translations[lang]?.kshopStep1 || translations['EN'].kshopStep1}</li>
                      <li>{(translations[lang]?.kshopStep2 || translations['EN'].kshopStep2).replace('{amount}', String(finalTotal))}</li>
                      <li>{translations[lang]?.kshopStep3 || translations['EN'].kshopStep3}</li>
                      <li className="font-bold text-[#8B1E1E]">{translations[lang]?.kshopStep4 || translations['EN'].kshopStep4}</li>
                    </ol>`;

cfContent = cfContent.replace(oldKshopGuide, newKshopGuide);

// Omise generating & notices
cfContent = cfContent.replace(
  `                            {lang === 'IT' && 'Generazione QR Omise...'}
                            {lang === 'EN' && 'Generating Omise QR...'}
                            {lang === 'TH' && 'กำลังสร้าง QR Code...'}
                            {lang === 'DE' && 'Omise QR wird generiert...'}`,
  `                            {translations[lang]?.omiseGenerating || translations['EN'].omiseGenerating}`
);

cfContent = cfContent.replace(
  `                            {lang === 'IT' && '✅ Nessun upload richiesto — conferma automatica dopo il pagamento.'}
                            {lang === 'EN' && '✅ No upload needed — payment confirmed automatically.'}
                            {lang === 'TH' && '✅ ไม่ต้องอัปโหลดสลิป — ระบบยืนยันอัตโนมัติหลังชำระเงิน'}
                            {lang === 'DE' && '✅ Kein Upload nötig — Zahlung wird automatisch bestätigt.'}`,
  `                            {translations[lang]?.omiseNoUploadNeeded || translations['EN'].omiseNoUploadNeeded}`
);

cfContent = cfContent.replace(
  `                            {lang === 'IT' && 'Impossibile caricare il QR Omise. Riprova.'}
                            {lang === 'EN' && 'Failed to load Omise QR. Please retry.'}
                            {lang === 'TH' && 'ไม่สามารถโหลด QR Code ได้ กรุณาลองใหม่อีกครั้ง'}
                            {lang === 'DE' && 'Omise QR konnte nicht geladen werden. Bitte erneut versuchen.'}`,
  `                            {translations[lang]?.omiseFailedToLoad || translations['EN'].omiseFailedToLoad}`
);

cfContent = cfContent.replace(
  `<span>{lang === 'IT' ? 'Salva QR' : lang === 'TH' ? 'บันทึกรูป QR' : lang === 'DE' ? 'QR Speichern' : 'Save QR'}</span>`,
  `<span>{translations[lang]?.saveQrBtn || translations['EN'].saveQrBtn}</span>`
);

cfContent = cfContent.replace(
  `<span>{lang === 'IT' ? 'Riprova QR Omise' : lang === 'TH' ? 'ลองใหม่' : lang === 'DE' ? 'Erneut versuchen' : 'Retry QR'}</span>`,
  `<span>{translations[lang]?.retryQrBtn || translations['EN'].retryQrBtn}</span>`
);

// Inject targetedTranslations in CheckoutFlow
if (!cfContent.includes('const targetedTranslations: Record<string, any> =')) {
  cfContent = `const targetedTranslations: Record<string, any> = ${JSON.stringify(translations, null, 2)};\n` + cfContent;
  cfContent = cfContent.replaceAll('translations[lang]', 'targetedTranslations[lang]');
  cfContent = cfContent.replaceAll('translations[\'EN\']', 'targetedTranslations[\'EN\']');
}

fs.writeFileSync(cfPath, cfContent, 'utf8');
console.log('✅ Updated CheckoutFlow.tsx with 9-language welcome discount and payment guides.');

// -------------------------------------------------------------
// 3. UPDATE CartDrawer.tsx (Pairing Items & Extras Dictionary)
// -------------------------------------------------------------
const cdPath = 'src/pizza/components/CartDrawer.tsx';
let cdContent = fs.readFileSync(cdPath, 'utf8');

// Inject targetedTranslations in CartDrawer
if (!cdContent.includes('const targetedTranslations: Record<string, any> =')) {
  cdContent = `const targetedTranslations: Record<string, any> = ${JSON.stringify(translations, null, 2)};\n` + cdContent;
}

// Upgrade getTranslatedName to check extras & pairing dictionary
const cdLookupSnippet = `    // Fast dictionary lookup for pairing dishes and extras in all 9 languages
    const curLang = lang || 'IT';
    const dict = targetedTranslations[curLang];
    if (dict) {
      if (dict.pairingDishes && dict.pairingDishes[pid]) return dict.pairingDishes[pid];
      if (dict.extras && dict.extras[pid]) return dict.extras[pid];
    }
`;

if (!cdContent.includes('dict.pairingDishes')) {
  cdContent = cdContent.replace(
    'const pid = (o.productId || o.id || \'\').trim().toLowerCase();',
    'const pid = (o.productId || o.id || \'\').trim().toLowerCase();\n' + cdLookupSnippet
  );
}

fs.writeFileSync(cdPath, cdContent, 'utf8');
console.log('✅ Updated CartDrawer.tsx pairing dishes and extras dictionary.');

// -------------------------------------------------------------
// 4. UPDATE MenuGrid.tsx (Extras Dictionary for all 9 languages)
// -------------------------------------------------------------
const mgPath = 'src/pizza/components/MenuGrid.tsx';
let mgContent = fs.readFileSync(mgPath, 'utf8');

if (!mgContent.includes('const targetedTranslations: Record<string, any> =')) {
  mgContent = `const targetedTranslations: Record<string, any> = ${JSON.stringify(translations, null, 2)};\n` + mgContent;
}

const mgLookupSnippet = `  const getTranslatedName = (item: { id?: string; name: string; nameTh?: string; nameIt?: string; nameDe?: string; nameMm?: string; name_mm?: string; nameEs?: string; nameFr?: string; nameRu?: string; nameZh?: string }) => {
    const pid = (item.id || '').trim().toLowerCase();
    const curLang = lang || 'IT';
    const dict = targetedTranslations[curLang];
    if (dict) {
      if (dict.extras && dict.extras[pid]) return dict.extras[pid];
      if (dict.pairingDishes && dict.pairingDishes[pid]) return dict.pairingDishes[pid];
    }
`;

mgContent = mgContent.replace(
  '  const getTranslatedName = (item: { name: string; nameTh?: string; nameIt?: string; nameDe?: string; nameMm?: string; name_mm?: string }) => {',
  mgLookupSnippet
);

fs.writeFileSync(mgPath, mgContent, 'utf8');
console.log('✅ Updated MenuGrid.tsx extras lookup dictionary for all 9 languages.');
