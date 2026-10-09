import fs from 'fs';

let content = fs.readFileSync('src/pizza/pages/DeliveryMenu.tsx', 'utf8');

// Replace Card 1 title
const oldCard1Title = `{lang === 'TH' ? 'จองโต๊ะ' :
                  lang === 'IT' ? 'Prenota Tavolo' :
                  lang === 'DE' ? 'Tisch Buchen' :
                  lang === 'MM' ? 'စားပွဲ ကြိုတင်ဘွတ်ကင်' :
                  'Book a Table'}`;

const newCard1Title = `{lang === 'TH' ? 'จองโต๊ะ' :
                  lang === 'IT' ? 'Prenota Tavolo' :
                  lang === 'DE' ? 'Tisch Buchen' :
                  lang === 'MM' ? 'စားပွဲ ကြိုတင်ဘွတ်ကင်' :
                  lang === 'ES' ? 'Reservar Mesa' :
                  lang === 'FR' ? 'Réserver une Table' :
                  lang === 'RU' ? 'Забронировать стол' :
                  lang === 'ZH' ? '预订餐桌' :
                  'Book a Table'}`;

content = content.replace(oldCard1Title, newCard1Title);

// Replace Card 1 desc
const oldCard1Desc = `{lang === 'TH' ? 'โต๊ะในร่ม กลางแจ้ง หรือซุ้มไม้ไผ่ในสวน' :
                 lang === 'IT' ? "Tavoli al chiuso, all'aperto o in capanna" :
                 lang === 'DE' ? 'Innen-, Außenbereich oder Bambushütte' :
                 lang === 'MM' ? 'အတွင်းခန်း၊ အပြင်ဘက် သို့မဟုတ် သဘာဝ ဝါးတဲ' :
                 'Indoor, outdoor tables or bamboo garden hut'}`;

const newCard1Desc = `{lang === 'TH' ? 'โต๊ะในร่ม กลางแจ้ง หรือซุ้มไม้ไผ่ในสวน' :
                 lang === 'IT' ? "Tavoli al chiuso, all'aperto o in capanna" :
                 lang === 'DE' ? 'Innen-, Außenbereich oder Bambushütte' :
                 lang === 'MM' ? 'အတွင်းခန်း၊ အပြင်ဘက် သို့မဟုတ် သဘာဝ ဝါးတဲ' :
                 lang === 'ES' ? 'Mesas interiores, exteriores o cabaña de bambú' :
                 lang === 'FR' ? 'Tables intérieures, extérieures ou hutte en bambou' :
                 lang === 'RU' ? 'Столики в зале, на террасе или в бамбуковом домике' :
                 lang === 'ZH' ? '室内、室外餐桌或花园竹林小屋' :
                 'Indoor, outdoor tables or bamboo garden hut'}`;

content = content.replace(oldCard1Desc, newCard1Desc);

// Replace Card 2 title
const oldCard2Title = `{lang === 'TH' ? 'ลด 10%' :
                   lang === 'IT' ? '10% Sconto' :
                   lang === 'DE' ? '10% Rabatt' :
                   lang === 'MM' ? '၁၀% လျှော့စျေး' :
                   '10% OFF'}`;

const newCard2Title = `{lang === 'TH' ? 'ลด 10%' :
                   lang === 'IT' ? '10% Sconto' :
                   lang === 'DE' ? '10% Rabatt' :
                   lang === 'MM' ? '၁၀% လျှော့စျေး' :
                   lang === 'ES' ? '10% Descuento' :
                   lang === 'FR' ? '10% de Réduction' :
                   lang === 'RU' ? 'Скидка 10%' :
                   lang === 'ZH' ? '立享9折' :
                   '10% OFF'}`;

content = content.replace(oldCard2Title, newCard2Title);

// Replace Card 2 desc
const oldCard2Desc = `{lang === 'TH' ? 'สั่งครั้งแรก? รับส่วนลดอัตโนมัติในตะกร้าทันที' :
                   lang === 'IT' ? 'Il tuo 1° ordine? Sconto applicato nel carrello!' :
                   lang === 'DE' ? '1. Bestellung? Rabatt direkt im Warenkorb!' :
                   lang === 'MM' ? 'ပထမဆုံး အော်ဒါလား? ခြင်းတောင်းထဲတွင် အလိုအလျောက် လျှော့ပေးပါသည်!' :
                   '1st order? Discount applied automatically in cart!'}`;

const newCard2Desc = `{lang === 'TH' ? 'สั่งครั้งแรก? รับส่วนลดอัตโนมัติในตะกร้าทันที' :
                   lang === 'IT' ? 'Il tuo 1° ordine? Sconto applicato nel carrello!' :
                   lang === 'DE' ? '1. Bestellung? Rabatt direkt im Warenkorb!' :
                   lang === 'MM' ? 'ပထမဆုံး အော်ဒါလား? ခြင်းတောင်းထဲတွင် အလိုအလျောက် လျှော့ပေးပါသည်!' :
                   lang === 'ES' ? '¿Primer pedido? ¡Descuento aplicado en el carrito!' :
                   lang === 'FR' ? '1ère commande ? Réduction appliquée dans le panier !' :
                   lang === 'RU' ? 'Первый заказ? Скидка применяется в корзине!' :
                   lang === 'ZH' ? '首次下单？结账时在购物车中自动减免！' :
                   '1st order? Discount applied automatically in cart!'}`;

content = content.replace(oldCard2Desc, newCard2Desc);

// Replace Card 3 title
const oldCard3Title = `{lang === 'TH' ? <><span>เดลิเวอรี่ &amp;</span><br className="sm:hidden"/><span> รับที่ร้าน</span></> :
                 lang === 'IT' ? <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Asporto</span></> :
                 lang === 'DE' ? <><span>Lieferung &amp;</span><br className="sm:hidden"/><span> Abholung</span></> :
                 lang === 'MM' ? <><span>ပို့ဆောင်မှု &amp;</span><br className="sm:hidden"/><span> ဆိုင်မှလာယူရန်</span></> :
                 <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Takeaway</span></>}`;

const newCard3Title = `{lang === 'TH' ? <><span>เดลิเวอรี่ &amp;</span><br className="sm:hidden"/><span> รับที่ร้าน</span></> :
                 lang === 'IT' ? <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Asporto</span></> :
                 lang === 'DE' ? <><span>Lieferung &amp;</span><br className="sm:hidden"/><span> Abholung</span></> :
                 lang === 'MM' ? <><span>ပို့ဆောင်မှု &amp;</span><br className="sm:hidden"/><span> ဆိုင်မှလာယူရန်</span></> :
                 lang === 'ES' ? <><span>Entrega &amp;</span><br className="sm:hidden"/><span> Para Llevar</span></> :
                 lang === 'FR' ? <><span>Livraison &amp;</span><br className="sm:hidden"/><span> À Emporter</span></> :
                 lang === 'RU' ? <><span>Доставка &amp;</span><br className="sm:hidden"/><span> Самовывоз</span></> :
                 lang === 'ZH' ? <><span>外送配送 &amp;</span><br className="sm:hidden"/><span> 门店自取</span></> :
                 <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Takeaway</span></>}`;

content = content.replace(oldCard3Title, newCard3Title);

// Replace Card 3 desc
const oldCard3Desc = `{lang === 'TH' ? 'ส่งไว (>300฿ ฟรี) และรับเองที่ร้านฟรีเสมอ' :
                 lang === 'IT' ? 'A Ranong (>300฿ gratis), asporto sempre gratis!' :
                 lang === 'DE' ? 'In Ranong (>300฿ gratis), Abholung immer gratis!' :
                 lang === 'MM' ? 'ရနောင်းမြို့တွင်း (>300฿ အခမဲ့)၊ ဆိုင်မှလာယူပါက အမြဲအခမဲ့!' :
                 'Ranong (>300฿ free), takeaway always free!'}`;

const newCard3Desc = `{lang === 'TH' ? 'ส่งไว (>300฿ ฟรี) และรับเองที่ร้านฟรีเสมอ' :
                 lang === 'IT' ? 'A Ranong (>300฿ gratis), asporto sempre gratis!' :
                 lang === 'DE' ? 'In Ranong (>300฿ gratis), Abholung immer gratis!' :
                 lang === 'MM' ? 'ရနောင်းမြို့တွင်း (>300฿ အခမဲ့)၊ ဆိုင်မှလာယူပါက အမြဲအခမဲ့!' :
                 lang === 'ES' ? 'En Ranong (>300฿ gratis), ¡para llevar siempre gratis!' :
                 lang === 'FR' ? 'À Ranong (>300฿ gratuit), à emporter toujours gratuit !' :
                 lang === 'RU' ? 'По Ранонгу (>300฿ бесплатно), самовывоз всегда бесплатно!' :
                 lang === 'ZH' ? '拉廊市区（满300฿包邮），外卖自取永久免费！' :
                 'Ranong (>300฿ free), takeaway always free!'}`;

content = content.replace(oldCard3Desc, newCard3Desc);

fs.writeFileSync('src/pizza/pages/DeliveryMenu.tsx', content, 'utf8');
console.log('✅ Successfully updated all 3 Hero cards in DeliveryMenu.tsx');
