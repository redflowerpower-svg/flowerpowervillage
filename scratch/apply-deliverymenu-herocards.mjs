import fs from 'fs';

// 1. UPDATE DeliveryMenu.tsx
const dmPath = 'src/pizza/pages/DeliveryMenu.tsx';
let dmContent = fs.readFileSync(dmPath, 'utf8');

// Card 1
dmContent = dmContent.replace(
  `                {lang === 'TH' ? 'จองโต๊ะ' :
                 lang === 'IT' ? 'Prenota Tavolo' :
                 lang === 'DE' ? 'Tisch Buchen' :
                 lang === 'MM' ? 'စားပွဲ ကြိုတင်ဘွတ်ကင်' :
                 'Book a Table'}`,
  `                {lang === 'TH' ? 'จองโต๊ะ' :
                 lang === 'IT' ? 'Prenota Tavolo' :
                 lang === 'DE' ? 'Tisch Buchen' :
                 lang === 'MM' ? 'စားပွဲ ကြိုတင်ဘွတ်ကင်' :
                 lang === 'ES' ? 'Reservar Mesa' :
                 lang === 'FR' ? 'Réserver une Table' :
                 lang === 'RU' ? 'Забронировать стол' :
                 lang === 'ZH' ? '预订座位' :
                 'Book a Table'}`
);

dmContent = dmContent.replace(
  `                {lang === 'TH' ? 'โต๊ะในร่ม กลางแจ้ง หรือซุ้มไม้ไผ่ในสวน' :
                 lang === 'IT' ? "Tavoli al chiuso, all'aperto o in capanna" :
                 lang === 'DE' ? 'Innen-, Außenbereich oder Bambushütte' :
                 lang === 'MM' ? 'အတွင်းခန်း၊ အပြင်ဘက် သို့မဟုတ် သဘာဝ ဝါးတဲ' :
                 'Indoor, outdoor tables or bamboo garden hut'}`,
  `                {lang === 'TH' ? 'โต๊ะในร่ม กลางแจ้ง หรือซุ้มไม้ไผ่ในสวน' :
                 lang === 'IT' ? "Tavoli al chiuso, all'aperto o in capanna" :
                 lang === 'DE' ? 'Innen-, Außenbereich oder Bambushütte' :
                 lang === 'MM' ? 'အတွင်းခန်း၊ အပြင်ဘက် သို့မဟုတ် သဘာဝ ဝါးတဲ' :
                 lang === 'ES' ? 'Mesas interiores, exteriores o cabaña de bambú' :
                 lang === 'FR' ? 'Tables intérieures, extérieures ou hutte en bambou' :
                 lang === 'RU' ? 'Столики в зале, на воздухе или в бамбуковой беседке' :
                 lang === 'ZH' ? '室内、户外座位或花园竹亭' :
                 'Indoor, outdoor tables or bamboo garden hut'}`
);

dmContent = dmContent.replace(
  `<span>{lang === 'TH' ? 'จองเลย' : lang === 'IT' ? 'Prenota' : lang === 'DE' ? 'Reservieren' : lang === 'MM' ? 'ယခု ဘွတ်ကင်လုပ်မည်' : 'Book Now'}</span>`,
  `<span>{lang === 'TH' ? 'จองเลย' : lang === 'IT' ? 'Prenota' : lang === 'DE' ? 'Reservieren' : lang === 'MM' ? 'ယခု ဘွတ်ကင်လုပ်မည်' : lang === 'ES' ? 'Reservar' : lang === 'FR' ? 'Réserver' : lang === 'RU' ? 'Забронировать' : lang === 'ZH' ? '立即预订' : 'Book Now'}</span>`
);

// Card 2: 10% OFF
dmContent = dmContent.replace(
  `                {lang === 'TH' ? 'ลด 10%' :
                   lang === 'IT' ? '10% Sconto' :
                   lang === 'DE' ? '10% Rabatt' :
                   lang === 'MM' ? '၁၀% လျှော့စျေး' :
                   '10% OFF'}`,
  `                {lang === 'TH' ? 'ลด 10%' :
                   lang === 'IT' ? '10% Sconto' :
                   lang === 'DE' ? '10% Rabatt' :
                   lang === 'MM' ? '၁၀% လျှော့စျေး' :
                   lang === 'ES' ? '10% Dto' :
                   lang === 'FR' ? '-10% Remise' :
                   lang === 'RU' ? 'Скидка 10%' :
                   lang === 'ZH' ? '9折特惠' :
                   '10% OFF'}`
);

dmContent = dmContent.replace(
  `                <p className="text-stone-700 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-medium line-clamp-3">
                  {lang === 'TH' ? 'สั่งครั้งแรก? รับส่วนลดอัตโนมัติในตะกร้าทันที' :
                   lang === 'IT' ? 'Il tuo 1° ordine? Sconto applicato nel carrello!' :
                   lang === 'DE' ? '1. Bestellung? Rabatt direkt im Warenkorb!' :
                   lang === 'MM' ? 'ပထမဆုံး အော်ဒါလား? ခြင်းတောင်းထဲတွင် အလိုအလျောက် လျှော့ပေးပါသည်!' :
                   '1st order? Discount applied automatically in cart!'}
                </p>`,
  `                <p className="text-stone-700 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-medium line-clamp-3">
                  {lang === 'TH' ? 'สั่งครั้งแรก? รับส่วนลดอัตโนมัติในตะกร้าทันที' :
                   lang === 'IT' ? 'Il tuo 1° ordine? Sconto applicato nel carrello!' :
                   lang === 'DE' ? '1. Bestellung? Rabatt direkt im Warenkorb!' :
                   lang === 'MM' ? 'ပထမဆုံး အော်ဒါလား? ခြင်းတောင်းထဲတွင် အလိုအလျောက် လျှော့ပေးပါသည်!' :
                   lang === 'ES' ? '¿1er pedido? ¡Descuento automático en el carrito!' :
                   lang === 'FR' ? '1ère commande ? Remise automatique au panier !' :
                   lang === 'RU' ? '1-й заказ? Скидка применится прямо в корзине!' :
                   lang === 'ZH' ? '首单点餐？购物车立享自动折扣！' :
                   '1st order? Discount applied automatically in cart!'}
                </p>`
);

dmContent = dmContent.replace(
  `<span>{lang === 'TH' ? 'ในตะกร้า' : lang === 'IT' ? 'Nel Carrello' : lang === 'DE' ? 'Im Warenkorb' : lang === 'MM' ? 'ခြင်းတောင်းထဲတွင်' : 'In Cart'}</span>`,
  `<span>{lang === 'TH' ? 'ในตะกร้า' : lang === 'IT' ? 'Nel Carrello' : lang === 'DE' ? 'Im Warenkorb' : lang === 'MM' ? 'ခြင်းတောင်းထဲတွင်' : lang === 'ES' ? 'En el Carrito' : lang === 'FR' ? 'Au Panier' : lang === 'RU' ? 'В корзине' : lang === 'ZH' ? '在购物车中' : 'In Cart'}</span>`
);

// Card 3: Delivery & Takeaway
dmContent = dmContent.replace(
  `                {lang === 'TH' ? <><span>เดลิเวอรี่ &amp;</span><br className="sm:hidden"/><span> รับที่ร้าน</span></> :
                 lang === 'IT' ? <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Asporto</span></> :
                 lang === 'DE' ? <><span>Lieferung &amp;</span><br className="sm:hidden"/><span> Abholung</span></> :
                 lang === 'MM' ? <><span>ပို့ဆောင်မှု &amp;</span><br className="sm:hidden"/><span> ဆိုင်မှလာယူရန်</span></> :
                 <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Takeaway</span></>}`,
  `                {lang === 'TH' ? <><span>เดลิเวอรี่ &amp;</span><br className="sm:hidden"/><span> รับที่ร้าน</span></> :
                 lang === 'IT' ? <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Asporto</span></> :
                 lang === 'DE' ? <><span>Lieferung &amp;</span><br className="sm:hidden"/><span> Abholung</span></> :
                 lang === 'MM' ? <><span>ပို့ဆောင်မှု &amp;</span><br className="sm:hidden"/><span> ဆိုင်မှလာယူရန်</span></> :
                 lang === 'ES' ? <><span>Entrega &amp;</span><br className="sm:hidden"/><span> Para Llevar</span></> :
                 lang === 'FR' ? <><span>Livraison &amp;</span><br className="sm:hidden"/><span> À Emporter</span></> :
                 lang === 'RU' ? <><span>Доставка &amp;</span><br className="sm:hidden"/><span> Самовывоз</span></> :
                 lang === 'ZH' ? <><span>外卖配送 &amp;</span><br className="sm:hidden"/><span> 进店自取</span></> :
                 <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Takeaway</span></>}`
);

dmContent = dmContent.replace(
  `                <p className="text-red-100/90 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-normal line-clamp-3">
                {lang === 'TH' ? 'ส่งไว (>300฿ ฟรี) และรับเองที่ร้านฟรีเสมอ' :
                 lang === 'IT' ? 'A Ranong (>300฿ gratis), asporto sempre gratis!' :
                 lang === 'DE' ? 'In Ranong (>300฿ gratis), Abholung immer gratis!' :
                 lang === 'MM' ? 'ရနောင်းမြို့တွင်း (>300฿ အခမဲ့)၊ ဆိုင်မှလာယူပါက အမြဲအခမဲ့!' :
                 'Ranong (>300฿ free), takeaway always free!'}
              </p>`,
  `                <p className="text-red-100/90 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-normal line-clamp-3">
                {lang === 'TH' ? 'ส่งไว (>300฿ ฟรี) และรับเองที่ร้านฟรีเสมอ' :
                 lang === 'IT' ? 'A Ranong (>300฿ gratis), asporto sempre gratis!' :
                 lang === 'DE' ? 'In Ranong (>300฿ gratis), Abholung immer gratis!' :
                 lang === 'MM' ? 'ရနောင်းမြို့တွင်း (>300฿ အခမဲ့)၊ ဆိုင်မှလာယူပါက အမြဲအခမဲ့!' :
                 lang === 'ES' ? 'En Ranong (>300฿ gratis), ¡para llevar siempre gratis!' :
                 lang === 'FR' ? 'À Ranong (>300฿ gratuit), à emporter toujours gratuit !' :
                 lang === 'RU' ? 'По Ранонгу (>300฿ бесплатно), самовывоз всегда бесплатно!' :
                 lang === 'ZH' ? '拉廊市区（满300฿免配送费），自取始终免费！' :
                 'Ranong (>300฿ free), takeaway always free!'}
              </p>`
);

dmContent = dmContent.replace(
  `<span>{lang === 'TH' ? 'ดูเมนู' : lang === 'IT' ? 'Al Menu' : lang === 'DE' ? 'Zur Karte' : lang === 'MM' ? 'မီနူးသို့' : 'To Menu'}</span>`,
  `<span>{lang === 'TH' ? 'ดูเมนู' : lang === 'IT' ? 'Al Menu' : lang === 'DE' ? 'Zur Karte' : lang === 'MM' ? 'မီနူးသို့' : lang === 'ES' ? 'Ver Menú' : lang === 'FR' ? 'Au Menu' : lang === 'RU' ? 'В меню' : lang === 'ZH' ? '查看菜单' : 'To Menu'}</span>`
);

// Dietary Filter segmented bar in DeliveryMenu.tsx
dmContent = dmContent.replace(
  `                      {lang === 'TH' ? 'ทั้งหมด' :
                       lang === 'IT' ? 'Tutti' :
                       lang === 'DE' ? 'Alle' :
                       lang === 'MM' ? 'အားလုံး' :
                       'All'}`,
  `                      {lang === 'TH' ? 'ทั้งหมด' :
                       lang === 'IT' ? 'Tutti' :
                       lang === 'DE' ? 'Alle' :
                       lang === 'MM' ? 'အားလုံး' :
                       lang === 'ES' ? 'Todos' :
                       lang === 'FR' ? 'Tous' :
                       lang === 'RU' ? 'Все' :
                       lang === 'ZH' ? '全部' :
                       'All'}`
);

dmContent = dmContent.replace(
  `                      {lang === 'TH' ? 'มังสวิรัติ' :
                       lang === 'IT' ? 'Veggie' :
                       lang === 'DE' ? 'Veggie' :
                       lang === 'MM' ? 'သတ်သတ်လွတ်' :
                       'Veggie'}`,
  `                      {lang === 'TH' ? 'มังสวิรัติ' :
                       lang === 'IT' ? 'Veggie' :
                       lang === 'DE' ? 'Veggie' :
                       lang === 'MM' ? 'သတ်သတ်လွတ်' :
                       lang === 'ES' ? 'Vegetariano' :
                       lang === 'FR' ? 'Végétarien' :
                       lang === 'RU' ? 'Вегетарианское' :
                       lang === 'ZH' ? '素食' :
                       'Veggie'}`
);

dmContent = dmContent.replace(
  `                      {lang === 'TH' ? 'วีแกน' :
                       lang === 'IT' ? 'Vegan' :
                       lang === 'DE' ? 'Vegan' :
                       lang === 'MM' ? 'ဗီဂျန်' :
                       'Vegan'}`,
  `                      {lang === 'TH' ? 'วีแกน' :
                       lang === 'IT' ? 'Vegan' :
                       lang === 'DE' ? 'Vegan' :
                       lang === 'MM' ? 'ဗီဂျန်' :
                       lang === 'ES' ? 'Vegano' :
                       lang === 'FR' ? 'Végan' :
                       lang === 'RU' ? 'Веганское' :
                       lang === 'ZH' ? '纯素' :
                       'Vegan'}`
);

fs.writeFileSync(dmPath, dmContent, 'utf8');
console.log('✅ Updated DeliveryMenu.tsx with 9 languages on Hero Cards and Dietary Filter.');

// 2. UPDATE DiningTabletSite.tsx
const dtPath = 'src/pizza/pages/DiningTabletSite.tsx';
let dtContent = fs.readFileSync(dtPath, 'utf8');

dtContent = dtContent.replace(
  `                          <span>{lang === 'TH' ? 'ทั้งหมด' : lang === 'IT' ? 'Tutti' : lang === 'DE' ? 'Alle' : lang === 'MM' ? 'အားလုံး' : 'All'}</span>`,
  `                          <span>{lang === 'TH' ? 'ทั้งหมด' : lang === 'IT' ? 'Tutti' : lang === 'DE' ? 'Alle' : lang === 'MM' ? 'အားလုံး' : lang === 'ES' ? 'Todos' : lang === 'FR' ? 'Tous' : lang === 'RU' ? 'Все' : lang === 'ZH' ? '全部' : 'All'}</span>`
);

dtContent = dtContent.replace(
  `                          <span>{lang === 'TH' ? 'มังสวิรัติ' : lang === 'IT' ? 'Veggie' : lang === 'DE' ? 'Veggie' : lang === 'MM' ? 'သတ်သတ်လွတ်' : 'Veggie'}</span>`,
  `                          <span>{lang === 'TH' ? 'มังสวิรัติ' : lang === 'IT' ? 'Veggie' : lang === 'DE' ? 'Veggie' : lang === 'MM' ? 'သတ်သတ်လွတ်' : lang === 'ES' ? 'Vegetariano' : lang === 'FR' ? 'Végétarien' : lang === 'RU' ? 'Вегетарианское' : lang === 'ZH' ? '素食' : 'Veggie'}</span>`
);

dtContent = dtContent.replace(
  `                          <span>{lang === 'TH' ? 'วีแกน' : lang === 'IT' ? 'Vegan' : lang === 'DE' ? 'Vegan' : lang === 'MM' ? 'ဗီဂျန်' : 'Vegan'}</span>`,
  `                          <span>{lang === 'TH' ? 'วีแกน' : lang === 'IT' ? 'Vegan' : lang === 'DE' ? 'Vegan' : lang === 'MM' ? 'ဗီဂျန်' : lang === 'ES' ? 'Vegano' : lang === 'FR' ? 'Végan' : lang === 'RU' ? 'Веганское' : lang === 'ZH' ? '纯素' : 'Vegan'}</span>`
);

fs.writeFileSync(dtPath, dtContent, 'utf8');
console.log('✅ Updated DiningTabletSite.tsx with 9 languages on Dietary Filter.');
