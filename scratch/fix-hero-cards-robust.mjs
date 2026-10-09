import fs from 'fs';

let content = fs.readFileSync('src/pizza/pages/DeliveryMenu.tsx', 'utf8');

const HERO_CARD_TEXTS = {
  card1: {
    title: {
      IT: 'Prenota Tavolo',
      EN: 'Book a Table',
      TH: 'จองโต๊ะ',
      MM: 'စားပွဲ ကြိုတင်ဘွတ်ကင်',
      DE: 'Tisch Buchen',
      ES: 'Reservar Mesa',
      FR: 'Réserver une Table',
      RU: 'Забронировать стол',
      ZH: '预订餐桌'
    },
    desc: {
      IT: "Tavoli al chiuso, all'aperto o in capanna",
      EN: 'Indoor, outdoor tables or bamboo garden hut',
      TH: 'โต๊ะในร่ม กลางแจ้ง หรือซุ้มไม้ไผ่ในสวน',
      MM: 'အတွင်းခန်း၊ အပြင်ဘက် သို့မဟုတ် သဘာဝ ဝါးတဲ',
      DE: 'Innen-, Außenbereich oder Bambushütte',
      ES: 'Mesas interiores, exteriores o cabaña de bambú',
      FR: 'Tables intérieures, extérieures ou hutte en bambou',
      RU: 'Столики в зале, на террасе или в бамбуковом домике',
      ZH: '室内、室外餐桌或花园竹林小屋'
    },
    btn: {
      IT: 'Prenota',
      EN: 'Book Now',
      TH: 'จองเลย',
      MM: 'ယခု ဘွတ်ကင်လုပ်မည်',
      DE: 'Reservieren',
      ES: 'Reservar',
      FR: 'Réserver',
      RU: 'Забронировать',
      ZH: '立即预订'
    }
  },
  card2: {
    title: {
      IT: '10% Sconto',
      EN: '10% OFF',
      TH: 'ลด 10%',
      MM: '၁၀% လျှော့စျေး',
      DE: '10% Rabatt',
      ES: '10% Descuento',
      FR: '10% de Réduction',
      RU: 'Скидка 10%',
      ZH: '立享9折'
    },
    desc: {
      IT: 'Il tuo 1° ordine? Sconto applicato nel carrello!',
      EN: '1st order? Discount applied automatically in cart!',
      TH: 'สั่งครั้งแรก? รับส่วนลดอัตโนมัติในตะกร้าทันที',
      MM: 'ပထမဆုံး အော်ဒါလား? ခြင်းတောင်းထဲတွင် အလိုအလျောက် လျှော့ပေးပါသည်!',
      DE: '1. Bestellung? Rabatt direkt im Warenkorb!',
      ES: '¿Primer pedido? ¡Descuento aplicado en el carrito!',
      FR: '1ère commande ? Réduction appliquée dans le panier !',
      RU: 'Первый заказ? Скидка применяется в корзине!',
      ZH: '首次下单？结账时在购物车中自动减免！'
    },
    badge: {
      IT: 'Nel Carrello',
      EN: 'In Cart',
      TH: 'ในตะกร้า',
      MM: 'ခြင်းတောင်းထဲတွင်',
      DE: 'Im Warenkorb',
      ES: 'En el Carrito',
      FR: 'Au Panier',
      RU: 'В корзине',
      ZH: '在购物车中'
    }
  },
  card3: {
    title1: {
      IT: 'Delivery &',
      EN: 'Delivery &',
      TH: 'เดลิเวอรี่ &',
      MM: 'ပို့ဆောင်မှု &',
      DE: 'Lieferung &',
      ES: 'Entrega &',
      FR: 'Livraison &',
      RU: 'Доставка &',
      ZH: '外送配送 &'
    },
    title2: {
      IT: ' Asporto',
      EN: ' Takeaway',
      TH: ' รับที่ร้าน',
      MM: ' ဆိုင်မှလာယူရန်',
      DE: ' Abholung',
      ES: ' Para Llevar',
      FR: ' À Emporter',
      RU: ' Самовывоз',
      ZH: ' 门店自取'
    },
    desc: {
      IT: 'A Ranong (>300฿ gratis), asporto sempre gratis!',
      EN: 'Ranong (>300฿ free), takeaway always free!',
      TH: 'ส่งไว (>300฿ ฟรี) และรับเองที่ร้านฟรีเสมอ',
      MM: 'ရနောင်းမြို့တွင်း (>300฿ အခမဲ့)၊ ဆိုင်မှလာယူပါက အမြဲအခမဲ့!',
      DE: 'In Ranong (>300฿ gratis), Abholung immer gratis!',
      ES: 'En Ranong (>300฿ gratis), ¡para llevar siempre gratis!',
      FR: 'À Ranong (>300฿ gratuit), à emporter toujours gratuit !',
      RU: 'По Ранонгу (>300฿ бесплатно), самовывоз всегда бесплатно!',
      ZH: '拉廊市区（满300฿包邮），外卖自取永久免费！'
    },
    btn: {
      IT: 'Al Menu',
      EN: 'To Menu',
      TH: 'ดูเมนู',
      MM: 'မီနူးသို့',
      DE: 'Zur Karte',
      ES: 'Ver Menú',
      FR: 'Au Menu',
      RU: 'В меню',
      ZH: '查看菜单'
    }
  }
};

const topCardsBlock = `{/* Dynamic Promotions & Table Booking Cards (3 Rich Vertical Cards Side-by-Side on Mobile / Expansive on Desktop) */}
        <div className={\`grid gap-2 sm:gap-3.5 max-w-6xl mx-auto px-2 mb-4 sm:mb-6 mt-2 sm:mt-4 \${
          isFirstOrderEligible ? 'grid-cols-3 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-2'
        }\`}>
          {/* Card 1 (🟢 VERDE): Prenota un Tavolo o Capanna */}
          <div 
            onClick={() => setIsReservationModalOpen(true)}
            className="p-2.5 sm:p-3.5 md:p-4.5 bg-gradient-to-br from-[#064e3b] via-[#053d2e] to-[#032b20] text-white rounded-2xl sm:rounded-3xl flex flex-col justify-between gap-1.5 sm:gap-2.5 shadow-md border border-emerald-600/50 hover:border-emerald-400 hover:shadow-emerald-950/40 hover:shadow-xl transition-all cursor-pointer group text-left min-h-[130px] sm:min-h-[148px]"
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-emerald-800/90 border border-emerald-500/50 text-emerald-300 group-hover:scale-105 group-hover:bg-emerald-400 group-hover:text-stone-950 transition-all flex items-center justify-center shrink-0 rounded-xl shadow-xs">
                <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors" />
              </div>
              <h4 className="text-white font-black text-[9.5px] sm:text-xs md:text-sm leading-tight group-hover:text-emerald-300 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {(${JSON.stringify(HERO_CARD_TEXTS.card1.title)})[lang] || 'Book a Table'}
              </h4>
            </div>

            <div className="space-y-0.5">
              <p className="text-emerald-100/90 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-normal line-clamp-3">
                {(${JSON.stringify(HERO_CARD_TEXTS.card1.desc)})[lang] || 'Indoor, outdoor tables or bamboo garden hut'}
              </p>
            </div>

            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[9px] md:text-xs text-stone-950 font-black bg-emerald-400 group-hover:bg-emerald-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-xs transition-all">
                <span>{(${JSON.stringify(HERO_CARD_TEXTS.card1.btn)})[lang] || 'Book Now'}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </div>

          {/* Card 2 (⚪ BIANCO & ORO): 10% Welcome Discount */}
          {isFirstOrderEligible && (
            <div className="p-2.5 sm:p-3.5 md:p-4.5 bg-gradient-to-br from-white via-amber-50/60 to-amber-100/40 text-stone-900 rounded-2xl sm:rounded-3xl flex flex-col justify-between gap-1.5 sm:gap-2.5 shadow-md border-2 border-amber-300/90 ring-1 ring-amber-400/30 hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer group text-left min-h-[130px] sm:min-h-[148px]">
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-amber-400 text-stone-950 group-hover:scale-105 group-hover:bg-stone-950 group-hover:text-amber-300 transition-all flex items-center justify-center shrink-0 rounded-xl shadow-xs">
                  <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5] transition-colors" />
                </div>
                <h4 className="text-stone-950 font-black text-[9.5px] sm:text-xs md:text-sm leading-tight group-hover:text-amber-600 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {(${JSON.stringify(HERO_CARD_TEXTS.card2.title)})[lang] || '10% OFF'}
                </h4>
              </div>

              <div className="space-y-0.5">
                <p className="text-stone-700 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-medium line-clamp-3">
                  {(${JSON.stringify(HERO_CARD_TEXTS.card2.desc)})[lang] || '1st order? Discount applied automatically in cart!'}
                </p>
              </div>

              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[9px] md:text-xs text-emerald-900 font-bold bg-emerald-100/95 border border-emerald-300/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span>{(${JSON.stringify(HERO_CARD_TEXTS.card2.badge)})[lang] || 'In Cart'}</span>
                </span>
              </div>
            </div>
          )}

          {/* Card 3 (🔴 ROSSO): Delivery Area & Free Delivery >300฿ + Takeaway */}
          <div 
            onClick={() => {
              const el = document.getElementById('menu-category-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2.5 sm:p-3.5 md:p-4.5 bg-gradient-to-br from-[#8B1E1E] via-[#781818] to-[#5a1111] text-white rounded-2xl sm:rounded-3xl flex flex-col justify-between gap-1.5 sm:gap-2.5 shadow-md border border-red-700/60 hover:border-red-400 hover:shadow-red-950/40 hover:shadow-xl transition-all cursor-pointer group text-left min-h-[130px] sm:min-h-[148px]"
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white/15 border border-white/25 group-hover:scale-105 group-hover:bg-white group-hover:text-[#8B1E1E] transition-all flex items-center justify-center shrink-0 rounded-xl text-white shadow-xs">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors" />
              </div>
              <h4 className="text-white font-black text-[9.5px] sm:text-xs md:text-sm leading-tight group-hover:text-red-200 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span>{(${JSON.stringify(HERO_CARD_TEXTS.card3.title1)})[lang] || 'Delivery &'}</span>
                <br className="sm:hidden"/>
                <span>{(${JSON.stringify(HERO_CARD_TEXTS.card3.title2)})[lang] || ' Takeaway'}</span>
              </h4>
            </div>

            <div className="space-y-0.5">
              <p className="text-red-100/90 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-normal line-clamp-3">
                {(${JSON.stringify(HERO_CARD_TEXTS.card3.desc)})[lang] || 'Ranong (>300฿ free), takeaway always free!'}
              </p>
            </div>

            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[9px] md:text-xs text-white font-black bg-white/20 group-hover:bg-white group-hover:text-[#8B1E1E] border border-white/25 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-xs transition-all">
                <span>{(${JSON.stringify(HERO_CARD_TEXTS.card3.btn)})[lang] || 'To Menu'}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </div>
        </div>`;

const startIdx = content.indexOf('{/* Dynamic Promotions & Table Booking Cards');
const endIdx = content.indexOf('{/* Category Tabs directly on background */}');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + topCardsBlock + '\n        \n        ' + content.substring(endIdx);
  fs.writeFileSync('src/pizza/pages/DeliveryMenu.tsx', content, 'utf8');
  console.log('✅ Successfully replaced top cards in DeliveryMenu.tsx with bulletproof multi-language dictionary!');
} else {
  console.error('Could not find markers');
}
