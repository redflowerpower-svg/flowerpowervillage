import fs from 'fs';

const translationsData = JSON.parse(fs.readFileSync('scratch/all_components_translations.json', 'utf8'));
const cartTrans = translationsData.cart;

const cartDrawerPath = 'src/pizza/components/CartDrawer.tsx';
let content = fs.readFileSync(cartDrawerPath, 'utf8');

// Build ES, FR, RU, ZH objects for labels
const newCartLabels = {
  ES: {
    title: cartTrans.ES.title || 'Tu Carrito',
    emptyTitle: cartTrans.ES.emptyTitle || 'Tu carrito está vacío',
    emptyDesc: cartTrans.ES.emptyDesc || 'Elige platos auténticos hechos a mano por nuestra chef italiana',
    totalText: cartTrans.ES.totalText || 'TOTAL A PAGAR',
    subtotalText: cartTrans.ES.subtotalText || 'Subtotal platos',
    firstOrderDiscountText: cartTrans.ES.firstOrderDiscountText || 'Descuento 1er Pedido (10%)',
    deliveryText: cartTrans.ES.deliveryText || 'Envío en Ranong',
    freeText: cartTrans.ES.freeText || 'GRATIS',
    freeDeliveryApplied: cartTrans.ES.freeDeliveryApplied || '¡Envío GRATIS aplicado! (Pedido > 300฿)',
    welcomePrivilegeNote: cartTrans.ES.welcomePrivilegeNote || '¡10% de descuento de bienvenida aplicado a tu comida!',
    checkoutBtn: cartTrans.ES.checkoutBtn || 'PROCEDER AL PAGO',
    continueShoppingBtn: cartTrans.ES.continueShoppingBtn || '← Volver al Menú y elegir más platos',
    addMoreDishesBtn: cartTrans.ES.addMoreDishesBtn || '+ Sigue eligiendo de nuestro Menú',
    ordersPausedBtn: cartTrans.ES.ordersPausedBtn || 'Pedidos pausados temporalmente',
    ordersClosedBtn: cartTrans.ES.ordersClosedBtn || 'Pizzería actualmente cerrada',
    callPizzeria: cartTrans.ES.callPizzeria || 'Llamar a la pizzería (Ranong)',
    footerInfo: cartTrans.ES.footerInfo || 'Cocina italiana artesanal • Entrega rápida en Ranong',
    pairingRitualTitle: cartTrans.ES.pairingRitualTitle || 'Completa tu Pedido',
    pairingRitualSubtitle: cartTrans.ES.pairingRitualSubtitle || '3 combinaciones recomendadas por nuestra cocina',
    slot1Badge: cartTrans.ES.slot1Badge || '1. Refresco',
    slot2Badge: cartTrans.ES.slot2Badge || '2. Café',
    slot3Badge: cartTrans.ES.slot3Badge || '3. Postre',
    openSlot1: cartTrans.ES.openSlot1 || 'Todos los refrescos',
    openSlot2: cartTrans.ES.openSlot2 || 'Todo el café y té',
    openSlot3: cartTrans.ES.openSlot3 || 'Todos los postres',
    slotAlt1Badge: cartTrans.ES.slotAlt1Badge || '1. Pizza',
    slotAlt2Badge: cartTrans.ES.slotAlt2Badge || '2. Pasta',
    slotAlt3Badge: cartTrans.ES.slotAlt3Badge || '3. Guarnición',
    openSlotAlt1: cartTrans.ES.openSlotAlt1 || 'Todas las pizzas',
    openSlotAlt2: cartTrans.ES.openSlotAlt2 || 'Toda la pasta',
    openSlotAlt3: cartTrans.ES.openSlotAlt3 || 'Todas las guarniciones',
    addDrinkBtn: cartTrans.ES.addDrinkBtn || '+ Añadir',
    freeDeliveryRemaining: (amount) => `¡Solo faltan ${amount}฿ para el Envío GRATIS!`,
    freeDeliveryAchieved: cartTrans.ES.freeDeliveryAchieved || '¡Envío GRATIS desbloqueado! 🎉',
    wineDineInBadge: cartTrans.ES.wineDineInBadge || 'Privilegio Bodega • 10% DTO',
    wineDineInTitle: cartTrans.ES.wineDineInTitle || 'Reserva en Restaurante: 10% Dto en tu Botella de Vino',
    wineDineInDesc: cartTrans.ES.wineDineInDesc || 'Reserva una mesa o cabaña en nuestro jardín en Ranong y recibe un 10% de descuento en cualquier botella de vino de nuestra bodega.',
    wineDineInBtn: cartTrans.ES.wineDineInBtn || 'Reservar Mesa con 10% Dto Vino',
    wineDiscountBadge: cartTrans.ES.wineDiscountBadge || '-10% DTO VINO',
    deliveryIncluded: cartTrans.ES.deliveryIncluded || '✓ Envío incluido',
    tableOrderBtn: cartTrans.ES.tableOrderBtn || 'Enviar Pedido a Mesa',
    tableAddMoreBtn: cartTrans.ES.tableAddMoreBtn || '+ Añadir más platos / bebidas',
  },
  FR: {
    title: cartTrans.FR.title || 'Votre Panier',
    emptyTitle: cartTrans.FR.emptyTitle || 'Votre panier est vide',
    emptyDesc: cartTrans.FR.emptyDesc || 'Sélectionnez des plats authentiques préparés par notre chef italienne',
    totalText: cartTrans.FR.totalText || 'TOTAL À PAYER',
    subtotalText: cartTrans.FR.subtotalText || 'Sous-total plats',
    firstOrderDiscountText: cartTrans.FR.firstOrderDiscountText || 'Remise 1ère commande (10%)',
    deliveryText: cartTrans.FR.deliveryText || 'Livraison à Ranong',
    freeText: cartTrans.FR.freeText || 'GRATUIT',
    freeDeliveryApplied: cartTrans.FR.freeDeliveryApplied || 'Livraison GRATUITE appliquée ! (Commande > 300฿)',
    welcomePrivilegeNote: cartTrans.FR.welcomePrivilegeNote || '10% de réduction de bienvenue appliquée sur vos plats !',
    checkoutBtn: cartTrans.FR.checkoutBtn || 'COMMANDER',
    continueShoppingBtn: cartTrans.FR.continueShoppingBtn || '← Retour au Menu pour choisir d\'autres plats',
    addMoreDishesBtn: cartTrans.FR.addMoreDishesBtn || '+ Continuer à choisir sur notre Menu',
    ordersPausedBtn: cartTrans.FR.ordersPausedBtn || 'Commandes temporairement suspendues',
    ordersClosedBtn: cartTrans.FR.ordersClosedBtn || 'Pizzeria actuellement fermée',
    callPizzeria: cartTrans.FR.callPizzeria || 'Appeler la cuisine (Ranong)',
    footerInfo: cartTrans.FR.footerInfo || 'Cuisine italienne artisanale • Livraison rapide à Ranong',
    pairingRitualTitle: cartTrans.FR.pairingRitualTitle || 'Complétez votre Repas',
    pairingRitualSubtitle: cartTrans.FR.pairingRitualSubtitle || '3 accords recommandés par notre cuisine',
    slot1Badge: cartTrans.FR.slot1Badge || '1. Boisson',
    slot2Badge: cartTrans.FR.slot2Badge || '2. Café',
    slot3Badge: cartTrans.FR.slot3Badge || '3. Dessert',
    openSlot1: cartTrans.FR.openSlot1 || 'Toutes les boissons',
    openSlot2: cartTrans.FR.openSlot2 || 'Tous les cafés et thés',
    openSlot3: cartTrans.FR.openSlot3 || 'Tous les desserts',
    slotAlt1Badge: cartTrans.FR.slotAlt1Badge || '1. Pizza',
    slotAlt2Badge: cartTrans.FR.slotAlt2Badge || '2. Pâtes',
    slotAlt3Badge: cartTrans.FR.slotAlt3Badge || '3. Accompagnement',
    openSlotAlt1: cartTrans.FR.openSlotAlt1 || 'Toutes les pizzas',
    openSlotAlt2: cartTrans.FR.openSlotAlt2 || 'Toutes les pâtes',
    openSlotAlt3: cartTrans.FR.openSlotAlt3 || 'Tous les accompagnements',
    addDrinkBtn: cartTrans.FR.addDrinkBtn || '+ Ajouter',
    freeDeliveryRemaining: (amount) => `Plus que ${amount}฿ pour la Livraison GRATUITE !`,
    freeDeliveryAchieved: cartTrans.FR.freeDeliveryAchieved || 'Livraison GRATUITE débloquée ! 🎉',
    wineDineInBadge: cartTrans.FR.wineDineInBadge || 'Privilège Cave • -10%',
    wineDineInTitle: cartTrans.FR.wineDineInTitle || 'Réservez au Restaurant : 10% de réduction sur votre bouteille',
    wineDineInDesc: cartTrans.FR.wineDineInDesc || 'Réservez une table ou une hutte en bambou dans notre jardin à Ranong et obtenez 10% de réduction sur n\'importe quelle bouteille de notre cave.',
    wineDineInBtn: cartTrans.FR.wineDineInBtn || 'Réserver une table avec 10% sur le vin',
    wineDiscountBadge: cartTrans.FR.wineDiscountBadge || '-10% REMISE VIN',
    deliveryIncluded: cartTrans.FR.deliveryIncluded || '✓ Livraison incluse',
    tableOrderBtn: cartTrans.FR.tableOrderBtn || 'Envoyer la commande à table',
    tableAddMoreBtn: cartTrans.FR.tableAddMoreBtn || '+ Ajouter d\'autres plats / boissons',
  },
  RU: {
    title: cartTrans.RU.title || 'Ваша корзина',
    emptyTitle: cartTrans.RU.emptyTitle || 'Ваша корзина пуста',
    emptyDesc: cartTrans.RU.emptyDesc || 'Выберите блюда, с любовью приготовленные нашим итальянским шеф-поваром',
    totalText: cartTrans.RU.totalText || 'ИТОГО К ОПЛАТЕ',
    subtotalText: cartTrans.RU.subtotalText || 'Сумма блюд',
    firstOrderDiscountText: cartTrans.RU.firstOrderDiscountText || 'Скидка на 1-й заказ (10%)',
    deliveryText: cartTrans.RU.deliveryText || 'Доставка по Ранонгу',
    freeText: cartTrans.RU.freeText || 'БЕСПЛАТНО',
    freeDeliveryApplied: cartTrans.RU.freeDeliveryApplied || 'БЕСПЛАТНАЯ доставка применена! (Заказ > 300฿)',
    welcomePrivilegeNote: cartTrans.RU.welcomePrivilegeNote || 'Скидка 10% на первый заказ применена к блюдам!',
    checkoutBtn: cartTrans.RU.checkoutBtn || 'ПЕРЕЙТИ К ОПЛАТЕ',
    continueShoppingBtn: cartTrans.RU.continueShoppingBtn || '← Вернуться в меню и выбрать ещё',
    addMoreDishesBtn: cartTrans.RU.addMoreDishesBtn || '+ Продолжить выбор из меню',
    ordersPausedBtn: cartTrans.RU.ordersPausedBtn || 'Заказы временно приостановлены',
    ordersClosedBtn: cartTrans.RU.ordersClosedBtn || 'Пиццерия сейчас закрыта',
    callPizzeria: cartTrans.RU.callPizzeria || 'Позвонить в пиццерию (Ранонг)',
    footerInfo: cartTrans.RU.footerInfo || 'Итальянская кухня ручной работы • Быстрая доставка в Ранонге',
    pairingRitualTitle: cartTrans.RU.pairingRitualTitle || 'Дополните ваш заказ',
    pairingRitualSubtitle: cartTrans.RU.pairingRitualSubtitle || '3 рекомендуемых сочетания от нашей кухни',
    slot1Badge: cartTrans.RU.slot1Badge || '1. Напиток',
    slot2Badge: cartTrans.RU.slot2Badge || '2. Кофе',
    slot3Badge: cartTrans.RU.slot3Badge || '3. Десерт',
    openSlot1: cartTrans.RU.openSlot1 || 'Все напитки',
    openSlot2: cartTrans.RU.openSlot2 || 'Весь кофе и чай',
    openSlot3: cartTrans.RU.openSlot3 || 'Все десерты',
    slotAlt1Badge: cartTrans.RU.slotAlt1Badge || '1. Пицца',
    slotAlt2Badge: cartTrans.RU.slotAlt2Badge || '2. Паста',
    slotAlt3Badge: cartTrans.RU.slotAlt3Badge || '3. Закуска',
    openSlotAlt1: cartTrans.RU.openSlotAlt1 || 'Все пиццы',
    openSlotAlt2: cartTrans.RU.openSlotAlt2 || 'Вся паста',
    openSlotAlt3: cartTrans.RU.openSlotAlt3 || 'Все закуски',
    addDrinkBtn: cartTrans.RU.addDrinkBtn || '+ Добавить',
    freeDeliveryRemaining: (amount) => `Ещё всего ${amount}฿ до БЕСПЛАТНОЙ доставки!`,
    freeDeliveryAchieved: cartTrans.RU.freeDeliveryAchieved || 'БЕСПЛАТНАЯ доставка открыта! 🎉',
    wineDineInBadge: cartTrans.RU.wineDineInBadge || 'Привилегия винного погреба • 10% СКИДКА',
    wineDineInTitle: cartTrans.RU.wineDineInTitle || 'Забронируйте столик: Скидка 10% на бутылку вина',
    wineDineInDesc: cartTrans.RU.wineDineInDesc || 'Забронируйте столик или беседку в нашем саду в Ранонге и получите скидку 10% на любую бутылку вина из нашего погреба.',
    wineDineInBtn: cartTrans.RU.wineDineInBtn || 'Забронировать столик со скидкой 10% на вино',
    wineDiscountBadge: cartTrans.RU.wineDiscountBadge || '-10% СКИДКА НА ВИНО',
    deliveryIncluded: cartTrans.RU.deliveryIncluded || '✓ Доставка включена',
    tableOrderBtn: cartTrans.RU.tableOrderBtn || 'Отправить заказ к столу',
    tableAddMoreBtn: cartTrans.RU.tableAddMoreBtn || '+ Добавить ещё блюда / напитки',
  },
  ZH: {
    title: cartTrans.ZH.title || '您的购物车',
    emptyTitle: cartTrans.ZH.emptyTitle || '您的购物车是空的',
    emptyDesc: cartTrans.ZH.emptyDesc || '选择由我们的意大利主厨精心制作的地道美食',
    totalText: cartTrans.ZH.totalText || '应付总额',
    subtotalText: cartTrans.ZH.subtotalText || '菜品小计',
    firstOrderDiscountText: cartTrans.ZH.firstOrderDiscountText || '首单特惠（10%折扣）',
    deliveryText: cartTrans.ZH.deliveryText || '拉廊府配送费',
    freeText: cartTrans.ZH.freeText || '免费',
    freeDeliveryApplied: cartTrans.ZH.freeDeliveryApplied || '已享受免费配送！（订单满 300฿）',
    welcomePrivilegeNote: cartTrans.ZH.welcomePrivilegeNote || '已为您菜品应用 10% 新客欢迎折扣！',
    checkoutBtn: cartTrans.ZH.checkoutBtn || '前往结账',
    continueShoppingBtn: cartTrans.ZH.continueShoppingBtn || '← 返回菜单选择更多美食',
    addMoreDishesBtn: cartTrans.ZH.addMoreDishesBtn || '+ 继续从菜单中挑选',
    ordersPausedBtn: cartTrans.ZH.ordersPausedBtn || '订单暂时暂停接收',
    ordersClosedBtn: cartTrans.ZH.ordersClosedBtn || '披萨店目前已打烊',
    callPizzeria: cartTrans.ZH.callPizzeria || '拨打披萨店电话（拉廊）',
    footerInfo: cartTrans.ZH.footerInfo || '手工正宗意式料理 • 拉廊市区极速配送',
    pairingRitualTitle: cartTrans.ZH.pairingRitualTitle || '让这顿饭更完美',
    pairingRitualSubtitle: cartTrans.ZH.pairingRitualSubtitle || '后厨精心推荐的 3 大经典搭配',
    slot1Badge: cartTrans.ZH.slot1Badge || '1. 饮品',
    slot2Badge: cartTrans.ZH.slot2Badge || '2. 咖啡',
    slot3Badge: cartTrans.ZH.slot3Badge || '3. 甜点',
    openSlot1: cartTrans.ZH.openSlot1 || '查看全部饮品',
    openSlot2: cartTrans.ZH.openSlot2 || '查看全部咖啡茶饮',
    openSlot3: cartTrans.ZH.openSlot3 || '查看全部甜点',
    slotAlt1Badge: cartTrans.ZH.slotAlt1Badge || '1. 披萨',
    slotAlt2Badge: cartTrans.ZH.slotAlt2Badge || '2. 意面',
    slotAlt3Badge: cartTrans.ZH.slotAlt3Badge || '3. 小吃',
    openSlotAlt1: cartTrans.ZH.openSlotAlt1 || '查看全部披萨',
    openSlotAlt2: cartTrans.ZH.openSlotAlt2 || '查看全部意面',
    openSlotAlt3: cartTrans.ZH.openSlotAlt3 || '查看全部小吃',
    addDrinkBtn: cartTrans.ZH.addDrinkBtn || '+ 添加',
    freeDeliveryRemaining: (amount) => `再买 ${amount}฿ 即可享受免费配送！`,
    freeDeliveryAchieved: cartTrans.ZH.freeDeliveryAchieved || '已解锁免费配送！🎉',
    wineDineInBadge: cartTrans.ZH.wineDineInBadge || '酒窖特权 • 9折优惠',
    wineDineInTitle: cartTrans.ZH.wineDineInTitle || '到店订座：整瓶葡萄酒立享9折特惠',
    wineDineInDesc: cartTrans.ZH.wineDineInDesc || '在拉廊花园预订座位或竹亭，即可享受我们酒窖内任意意大利或进口整瓶葡萄酒 9 折优惠。',
    wineDineInBtn: cartTrans.ZH.wineDineInBtn || '预订座位并享葡萄酒 9 折',
    wineDiscountBadge: cartTrans.ZH.wineDiscountBadge || '-10% 葡萄酒特惠',
    deliveryIncluded: cartTrans.ZH.deliveryIncluded || '✓ 已含配送费',
    tableOrderBtn: cartTrans.ZH.tableOrderBtn || '提交桌台订单',
    tableAddMoreBtn: cartTrans.ZH.tableAddMoreBtn || '+ 添加更多菜品 / 饮品',
  },
};

// Replace labels in CartDrawer.tsx
const labelsEndRegex = /  MM: \{[\s\S]*?tableAddMoreBtn: '\+ အစားအသောက်\/အအေးများ ထပ်ရွေးမည်',\r?\n  \},\r?\n\};/;

const newLabelsEnd = `  MM: {
    title: 'သင်၏ ဈေးဝယ်ခြင်းတောင်း',
    emptyTitle: 'ဈေးဝယ်ခြင်းတောင်းထဲတွင် အရာမရှိသေးပါ',
    emptyDesc: 'ကျွန်ုပ်တို့၏ အီတလီစားဖိုမှူး လက်ရာစစ်စစ် ဟင်းလျာများကို ရွေးချယ်ပါ',
    totalText: 'ကျသင့်ငွေ စုစုပေါင်း',
    subtotalText: 'အစားအသောက် စုစုပေါင်း',
    firstOrderDiscountText: 'ပထမဆုံး အော်ဒါ လျှော့စျေး (10%)',
    deliveryText: 'ရနောင်းမြို့တွင်း ပို့ဆောင်ခ',
    freeText: 'အခမဲ့',
    freeDeliveryApplied: 'အခမဲ့ ပို့ဆောင်ပေးပါသည် (300฿ အထက်)',
    welcomePrivilegeNote: 'ပထမဆုံး အော်ဒါအတွက် 10% အထူးလျှော့စျေး ရရှိပါသည်!',
    checkoutBtn: 'ငွေပေးချေရန် ဆက်သွားမည်',
    continueShoppingBtn: '← မီနူးသို့ ပြန်သွားပြီး အစားအသောက် ထပ်ရွေးမည်',
    addMoreDishesBtn: '+ မီနူးမှ အရသာရှိသော အစားအစာများ ထပ်ရွေးမည်',
    ordersPausedBtn: 'အော်ဒါလက်ခံခြင်း ခေတ္တရပ်နားထားပါသည်',
    ordersClosedBtn: 'ဆိုင်လောလောဆယ် ပိတ်ထားပါသည်',
    callPizzeria: 'ဆိုင်သို့ ဖုန်းခေါ်ဆိုရန် (ရနောင်း)',
    footerInfo: 'အီတလီ အစားအစာစစ်စစ် • ရနောင်းမြို့တွင်း အမြန်ပို့ဆောင်ပေးပါသည်',
    pairingRitualTitle: 'တွဲဖက်စားသုံးရန် အကြံပြုချက်',
    pairingRitualSubtitle: 'ကျွန်ုပ်တို့ မီးဖိုချောင်မှ အကြံပြုထားသော အကောင်းဆုံး ၃ မျိုး',
    slot1Badge: '၁။ အအေး / အချိုရည်',
    slot2Badge: '၂။ ကော်ဖီ',
    slot3Badge: '၃။ အချိုပွဲ',
    openSlot1: 'အအေး / အချိုရည် အားလုံး',
    openSlot2: 'ကော်ဖီနှင့် လက်ဖက်ရည် အားလုံး',
    openSlot3: 'အချိုပွဲ အားလုံး',
    slotAlt1Badge: '၁။ ပီဇာ',
    slotAlt2Badge: '၂။ ပါစတာ',
    slotAlt3Badge: '၃။ အဆာပြေ',
    openSlotAlt1: 'ပီဇာ အားလုံး',
    openSlotAlt2: 'ပါစတာ အားလုံး',
    openSlotAlt3: 'အဆာပြေ အားလုံး',
    addDrinkBtn: '+ ထည့်မည်',
    freeDeliveryRemaining: (amount: number) => \`အခမဲ့ ပို့ဆောင်ခ ရရှိရန် \${amount}฿ သာ လိုပါတော့သည်!\`,
    freeDeliveryAchieved: 'အခမဲ့ ပို့ဆောင်ခ ရရှိပါပြီ! 🎉',
    wineDineInBadge: 'ဆိုင်တွင် သုံးဆောင်ရန် • 10% လျှော့စျေး',
    wineDineInTitle: 'ဆိုင်တွင် စားပွဲကြိုတင်မှာယူပါ: ဝိုင်ပုလင်း 10% လျှော့စျေး',
    wineDineInDesc: 'ရနောင်း ရေပူစမ်းအနီး ကျွန်ုပ်တို့၏ ဥယျာဉ်စားသောက်ဆိုင်တွင် စားပွဲ သို့မဟုတ် ဝါးတဲကြိုတင်မှာယူပြီး ဝိုင်ပုလင်းတိုင်းအတွက် 10% လျှော့စျေး ရယူလိုက်ပါ။',
    wineDineInBtn: 'စားပွဲကြိုတင်မှာယူပြီး ဝိုင် 10% လျှော့စျေး ရယူမည်',
    wineDiscountBadge: '-10% ဝိုင်လျှော့စျေး',
    deliveryIncluded: '✓ ပို့ဆောင်ခ အခမဲ့ ပါဝင်ပြီး',
    tableOrderBtn: 'စားပွဲသို့ အော်ဒါပို့မည်',
    tableAddMoreBtn: '+ အစားအသောက်/အအေးများ ထပ်ရွေးမည်',
  },
  ES: ${JSON.stringify(newCartLabels.ES, (k, v) => typeof v === 'function' ? v.toString() : v, 2).replace('"freeDeliveryRemaining": "[Function]"', 'freeDeliveryRemaining: (amount: number) => `¡Solo faltan ${amount}฿ para el Envío GRATIS!`')},
  FR: ${JSON.stringify(newCartLabels.FR, (k, v) => typeof v === 'function' ? v.toString() : v, 2).replace('"freeDeliveryRemaining": "[Function]"', 'freeDeliveryRemaining: (amount: number) => `Plus que ${amount}฿ pour la Livraison GRATUITE !`')},
  RU: ${JSON.stringify(newCartLabels.RU, (k, v) => typeof v === 'function' ? v.toString() : v, 2).replace('"freeDeliveryRemaining": "[Function]"', 'freeDeliveryRemaining: (amount: number) => `Ещё всего ${amount}฿ до БЕСПЛАТНОЙ доставки!`')},
  ZH: ${JSON.stringify(newCartLabels.ZH, (k, v) => typeof v === 'function' ? v.toString() : v, 2).replace('"freeDeliveryRemaining": "[Function]"', 'freeDeliveryRemaining: (amount: number) => `再买 ${amount}฿ 即可享受免费配送！`')},
};`;

content = content.replace(labelsEndRegex, newLabelsEnd);

// Ensure fallback for t
content = content.replace(
  'const t = labels[lang] || labels[\'IT\'];',
  'const t = labels[lang] || labels.EN || labels.IT;'
);

// Localize in-cart can label
content = content.replace(
  "<span>{lang === 'TH' ? 'รสชาติ:' : lang === 'DE' ? 'Dose:' : lang === 'EN' ? 'Can:' : 'Lattina:'}</span>",
  "<span>{lang === 'TH' ? 'รสชาติ:' : lang === 'DE' ? 'Dose:' : lang === 'ES' ? 'Lata:' : lang === 'FR' ? 'Canette :' : lang === 'RU' ? 'Банка:' : lang === 'ZH' ? '罐装:' : lang === 'MM' ? 'အအေးဗူး:' : lang === 'IT' ? 'Lattina:' : 'Can:'}</span>"
);

// Localize in-cart size label
content = content.replace(
  "{item.productId.includes('beer') || item.productId.includes('water')\n                                        ? (lang === 'TH' ? 'ขนาด:' : lang === 'DE' ? 'Format:' : lang === 'EN' ? 'Size:' : 'Formato:')\n                                        : (lang === 'TH' ? 'ขนาด:' : lang === 'DE' ? 'Größe:' : lang === 'EN' ? 'Size:' : 'Taglia:')}",
  "{item.productId.includes('beer') || item.productId.includes('water')\n                                        ? (lang === 'TH' ? 'ขนาด:' : lang === 'DE' ? 'Format:' : lang === 'ES' ? 'Formato:' : lang === 'FR' ? 'Format :' : lang === 'RU' ? 'Формат:' : lang === 'ZH' ? '规格:' : lang === 'MM' ? 'အရွယ်အစား:' : lang === 'IT' ? 'Formato:' : 'Size:')\n                                        : (lang === 'TH' ? 'ขนาด:' : lang === 'DE' ? 'Größe:' : lang === 'ES' ? 'Tamaño:' : lang === 'FR' ? 'Taille :' : lang === 'RU' ? 'Размер:' : lang === 'ZH' ? '尺寸:' : lang === 'MM' ? 'အရွယ်အစား:' : lang === 'IT' ? 'Taglia:' : 'Size:')}"
);

// Localize Table service row
content = content.replace(
  "<span>{lang === 'TH' ? 'บริการที่โต๊ะ' : lang === 'IT' ? 'Servizio al Tavolo' : lang === 'DE' ? 'Tischservice' : lang === 'MM' ? 'စားပွဲ ဝန်ဆောင်မှု' : 'Table Service'}</span>",
  "<span>{lang === 'TH' ? 'บริการที่โต๊ะ' : lang === 'IT' ? 'Servizio al Tavolo' : lang === 'DE' ? 'Tischservice' : lang === 'ES' ? 'Servicio en Mesa' : lang === 'FR' ? 'Service à Table' : lang === 'RU' ? 'Обслуживание столика' : lang === 'ZH' ? '桌台服务' : lang === 'MM' ? 'စားပွဲ ဝန်ဆောင်မှု' : 'Table Service'}</span>"
);

content = content.replace(
  "<span className=\"font-bold\">{lang === 'TH' ? 'ฟรี' : lang === 'IT' ? 'Gratuito' : lang === 'DE' ? 'Kostenlos' : lang === 'MM' ? 'အခမဲ့' : 'Free'}</span>",
  "<span className=\"font-bold\">{lang === 'TH' ? 'ฟรี' : lang === 'IT' ? 'Gratuito' : lang === 'DE' ? 'Kostenlos' : lang === 'ES' ? 'Gratis' : lang === 'FR' ? 'Gratuit' : lang === 'RU' ? 'Бесплатно' : lang === 'ZH' ? '免费' : lang === 'MM' ? 'အခမဲ့' : 'Free'}</span>"
);

// Localize Free delivery banner text inside green button
const freeDeliveryTplRegex = /\{subtotal < 300 \? \([\s\S]*?\) : \([\s\S]*?\)\}/;
const newFreeDeliveryTpl = `{subtotal < 300 ? (
                      <span>
                        {typeof t.freeDeliveryRemaining === 'function' ? t.freeDeliveryRemaining(300 - subtotal) : \`Only \${300 - subtotal}฿ to FREE Delivery!\`}
                      </span>
                    ) : (
                      <span className="text-amber-200 font-black">
                        {t.freeDeliveryAchieved || '🎉 FREE Delivery unlocked!'}
                      </span>
                    )}`;

content = content.replace(freeDeliveryTplRegex, newFreeDeliveryTpl);

// Halal Chicken Badge
content = content.replace(
  "{lang === 'TH' ? 'เนื้อไก่ 100%' : lang === 'IT' ? '100% Pollo' : lang === 'DE' ? '100% Geflügel' : '100% Chicken'}",
  "{lang === 'TH' ? 'เนื้อไก่ 100%' : lang === 'IT' ? '100% Pollo' : lang === 'DE' ? '100% Geflügel' : lang === 'ES' ? '100% Pollo' : lang === 'FR' ? '100% Poulet' : lang === 'RU' ? '100% Курица' : lang === 'ZH' ? '100% 鸡肉' : lang === 'MM' ? '၁၀၀% ကြက်သား' : '100% Chicken'}"
);

fs.writeFileSync(cartDrawerPath, content, 'utf8');
console.log('✅ Updated CartDrawer.tsx with all 9 languages successfully!');
