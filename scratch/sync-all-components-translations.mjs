import fs from 'fs';
import path from 'path';

// 1. Read DeepSeek API Key
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
  console.error('❌ DEEPSEEK_API_KEY not configured!');
  process.exit(1);
}

const TARGET_LANGS = ['ES', 'FR', 'RU', 'ZH'];

const LANG_MAP = {
  ES: 'Spanish',
  FR: 'French',
  RU: 'Russian',
  ZH: 'Chinese (Simplified)'
};

async function callDeepSeek(prompt, systemMsg = 'You are a professional restaurant & food delivery UI translator.') {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// -------------------------------------------------------------
// 1. CATEGORY TABS TRANSLATIONS
// -------------------------------------------------------------
const categoryDefinitions = {
  'daily-specials': {
    name: 'Daily\nSpecials',
    desc: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef with premium ingredients.'
  },
  'traditional-italian-pizza': {
    name: 'Italian\nPizza',
    desc: 'Pizza is the heart of our restaurant. We use only selected Italian ingredients, from flour to tomato, from cheeses to cold cuts, with no compromise on quality. Our traditional high-hydration Italian pizza is made with a 90% water dough, slowly matured for at least 36 hours. The result is a crispy, light, highly digestible pizza, full of flavor.'
  },
  'pasta': {
    name: 'Pasta &\nPrimi',
    desc: 'Traditional Italian pasta and homemade first courses.'
  },
  'italian-salads': {
    name: 'Salads &\nSides',
    desc: 'Fresh rich Italian salads, delicious side dishes, and traditional savory main courses.'
  },
  'pizza-sandwich': {
    name: 'Focaccia &\nSandwich',
    desc: 'Fragrant focaccia with extra virgin olive oil baked in the oven and filled to order with the best Italian cured meats, and tempting golden stuffed pizza sandwiches.'
  },
  'pizza-burgers': {
    name: 'Pizza\nBurger',
    desc: 'Made with freshly baked burger buns and homemade Italian-style patties, served with french fries, ketchup, and mayonnaise: fresh, tasty, and satisfying.'
  },
  'french-fries': {
    name: 'French\nFries',
    desc: 'Golden, crispy french fries served piping hot with ketchup and mayonnaise.'
  },
  'desserts': {
    name: 'Desserts &\nSweets',
    desc: 'Homemade artisan tiramisu, cheesecakes, cakes of the day, and delicious Italian desserts.'
  },
  'breakfast-and-snacks': {
    name: 'Snacks &\nBreakfast',
    desc: 'Hearty breakfasts, warm toasts, freshly made eggs, and fresh tropical fruit bowls.'
  },
  'coffee-shop': {
    name: 'Coffee &\nTea',
    desc: 'Authentic Italian espresso, creamy cappuccino, iced coffees, and fine tea selections.'
  },
  'fruit-drinks': {
    name: 'Fruit Shakes\n& Drinks',
    desc: 'Fresh tropical fruit blended on the spot, energizing smoothies, and refreshing shakes.'
  },
  'soft-drinks': {
    name: 'Soft Drinks\n& Water',
    desc: 'Chilled canned soft drinks, natural mineral water, and sparkling soda.'
  },
  'beers': {
    name: 'Bottled\nBeers',
    desc: 'Top Thai and international bottled beers served ice cold.'
  },
  'wines': {
    name: 'Wine\nList',
    desc: 'Exclusive selection of Italian and international wines, perfectly paired with our menu.'
  }
};

async function translateCategoryTabs() {
  console.log('🔄 Translating CategoryTabs categories for ES, FR, RU, ZH...');
  const prompt = `Translate the following restaurant menu category details into Spanish (ES), French (FR), Russian (RU), and Simplified Chinese (ZH).
Keep newline characters '\\n' in the category names so they fit across two lines.
Return JSON with format:
{
  "ES": { "daily-specials": { "name": "...", "desc": "..." }, ... },
  "FR": { ... },
  "RU": { ... },
  "ZH": { ... }
}
Source English:
${JSON.stringify(categoryDefinitions, null, 2)}`;

  const result = await callDeepSeek(prompt);
  return result;
}

// -------------------------------------------------------------
// 2. CHECKOUT FLOW TRANSLATIONS
// -------------------------------------------------------------
const checkoutFlowEnglishStrings = {
  confirmMapLoc: 'DELIVER HERE (CONFIRM LOCATION)',
  mapInstructions: 'Tap map or move pin to your delivery spot',
  tapHint: 'Tap map to drop pin',
  expandMap: 'Expand',
  collapseMap: 'Minimize',
  locConfirmed: 'Location confirmed!',
  detectLocBtn: 'Find my location',
  simLoc: 'Simulate location (Test)',
  scanningPrompt: 'Scan QR with your Thai banking app (SCB, KBank, Bangkok Bank, Krungthai)',
  awaitingPayment: 'Awaiting bank confirmation...',
  paymentConfirmedTitle: 'PAYMENT RECEIVED!',
  manualSlipFallback: 'Or upload receipt screenshot manually',
  uploadBtn: 'Upload receipt screenshot',
  uploadPromptBtn: 'UPLOAD RECEIPT TO PROCEED',
  kbankStep4: 'Upload payment receipt screenshot',
  sendingTitle: 'Sending your order...',
  sendingHint: 'Waiting for kitchen confirmation',
  timeoutTitle: 'The kitchen is very busy or staff tablet is offline.',
  timeoutHint: 'Your order may still have arrived. Press Retry or contact us directly.',
  retryBtn: 'Retry sending order',
  emergencyTitle: 'Prefer to contact us directly?',
  trackerPreparing: 'Stay on this page! We are preparing your pizzas. This screen will update automatically as soon as the rider leaves.',
  trackerTakeawayPreparing: 'Stay on this page! We are preparing your takeaway order. This screen will update as soon as your pizzas are hot and ready for pickup!',
  trackerDelivering: 'Rider is on the way! Your pizza is coming.',
  trackerTakeawayReady: 'YOUR ORDER IS READY!',
  trackerTakeawayReadyDesc: 'Your pizzas have just been freshly baked! You can pick them up at the counter of our pizzeria at Ranong Hot Springs.',
  supportNotice: 'Feel free to contact us for any inquiry or change to your order',
  rejectedTitle: 'We are sorry!',
  rejectedDesc: 'The kitchen is currently full or temporarily unable to accept orders. Please contact us directly.',
  backToFormBtn: 'Back to form',
  waitText: 'Please wait...',
  cardSecurityNotice: '3D Secure transaction with Omise Vault encryption (SSL 256-bit)'
};

async function translateCheckoutFlow() {
  console.log('🔄 Translating CheckoutFlow missing strings for ES, FR, RU, ZH...');
  const prompt = `Translate the following checkout, map, payment and order tracking UI strings into Spanish (ES), French (FR), Russian (RU), and Simplified Chinese (ZH).
Return JSON with format:
{
  "ES": { ... },
  "FR": { ... },
  "RU": { ... },
  "ZH": { ... }
}
Source English:
${JSON.stringify(checkoutFlowEnglishStrings, null, 2)}`;

  const result = await callDeepSeek(prompt);
  return result;
}

// -------------------------------------------------------------
// 3. CART DRAWER TRANSLATIONS
// -------------------------------------------------------------
const cartDrawerEnglish = {
  title: 'Your Cart',
  emptyTitle: 'Your cart is empty',
  emptyDesc: 'Select authentic dishes handcrafted by our Italian Chef',
  totalText: 'TOTAL TO PAY',
  subtotalText: 'Dishes subtotal',
  firstOrderDiscountText: '1st Order Discount (10%)',
  deliveryText: 'Ranong Delivery',
  freeText: 'FREE',
  freeDeliveryApplied: 'FREE Delivery applied (Order > 300฿)',
  welcomePrivilegeNote: '10% Welcome Discount applied to your food!',
  checkoutBtn: 'PROCEED TO CHECKOUT',
  continueShoppingBtn: '← Back to Menu & choose more dishes',
  addMoreDishesBtn: '+ Keep choosing from our Menu',
  ordersPausedBtn: 'Orders Temporarily Paused',
  ordersClosedBtn: 'Pizzeria Currently Closed',
  callPizzeria: 'Call Kitchen (Ranong)',
  footerInfo: 'Handcrafted Italian Cuisine • Fast Delivery in Ranong',
  pairingRitualTitle: 'Complete your Meal',
  pairingRitualSubtitle: '3 recommended pairings from our kitchen',
  slot1Badge: '1. Soft Drink',
  slot2Badge: '2. Coffee',
  slot3Badge: '3. Dessert',
  openSlot1: 'All Drinks',
  openSlot2: 'All Coffee & Tea',
  openSlot3: 'All Desserts',
  slotAlt1Badge: '1. Pizza',
  slotAlt2Badge: '2. Pasta',
  slotAlt3Badge: '3. Side Dish',
  openSlotAlt1: 'All Pizzas',
  openSlotAlt2: 'All Pasta',
  openSlotAlt3: 'All Sides',
  addDrinkBtn: '+ Add',
  freeDeliveryRemainingTpl: 'Only {amount}฿ away from FREE Delivery!',
  freeDeliveryAchieved: 'FREE Delivery unlocked! 🎉',
  wineDineInBadge: 'Wine Privilege • 10% OFF',
  wineDineInTitle: 'Book at Restaurant: 10% Off Your Wine Bottle',
  wineDineInDesc: 'Reserve a table or bamboo hut in our Ranong garden and get 10% off any Italian or international wine bottle from our cellar.',
  wineDineInBtn: 'Book Table with 10% Wine Discount',
  wineDiscountBadge: '-10% WINE DISCOUNT',
  deliveryIncluded: '✓ Delivery included',
  tableOrderBtn: 'Proceed Table Order',
  tableAddMoreBtn: '+ Add more dishes / drinks',
  tableService: 'Table Service',
  tableServiceFree: 'Free',
  canLabel: 'Can:',
  sizeLabel: 'Size:',
  formatLabel: 'Format:'
};

async function translateCartDrawer() {
  console.log('🔄 Translating CartDrawer labels for ES, FR, RU, ZH...');
  const prompt = `Translate the following cart drawer labels and food delivery UI strings into Spanish (ES), French (FR), Russian (RU), and Simplified Chinese (ZH).
Keep '{amount}' placeholder unchanged in 'freeDeliveryRemainingTpl'.
Return JSON with format:
{
  "ES": { ... },
  "FR": { ... },
  "RU": { ... },
  "ZH": { ... }
}
Source English:
${JSON.stringify(cartDrawerEnglish, null, 2)}`;

  const result = await callDeepSeek(prompt);
  return result;
}

// -------------------------------------------------------------
// 4. MENU GRID & PRODUCT MODAL TRANSLATIONS
// -------------------------------------------------------------
const menuGridEnglish = {
  sizeOptions: 'Size options',
  extraIngredients: 'extra ingredients',
  startingAt: 'Starting at',
  price: 'Price',
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
  splitSecondHalfRequired: '⚠️ Please select the 2nd half to proceed',
  splitAverageNotice: '50/50 price: exact average of both 12" flavours',
  splitSelectedBadge: 'Selected Flavor',
  chickenOptionTitle: '100% Chicken Option (Halal-friendly)',
  chickenOptionDesc: 'Replaces pork & cold cuts with chicken',
  chickenOptionSelected: 'Chicken Selected',
  chickenOptionSelect: '+ Choose Chicken',
  spicinessHeader: 'Spiciness Level',
  spicinessSelect1: 'select 1 option',
  sugarHeader: 'Sugar Level',
  sugarSelect1: 'select 1 option',
  fruitHeader: 'Choose Fruit',
  fruitSelect1: 'select 1 option',
  saucesHeader: 'Select Sauces (max 2)',
  extrasHeader: 'Extra Ingredients',
  choosePastaFormat: 'Choose Pasta Format',
  chooseCan: 'Choose your Can',
  chooseSize: 'Choose Size',
  dineInOnly: 'Dine-in Only • Not available for delivery',
  tableDiscountBadge: '-5% TABLE',
  filterAll: 'All',
  filterVeggie: 'Veggie',
  filterVegan: 'Vegan'
};

async function translateMenuGrid() {
  console.log('🔄 Translating MenuGrid & Modal strings for ES, FR, RU, ZH...');
  const prompt = `Translate the following menu and dish customization UI strings into Spanish (ES), French (FR), Russian (RU), and Simplified Chinese (ZH).
Return JSON with format:
{
  "ES": { ... },
  "FR": { ... },
  "RU": { ... },
  "ZH": { ... }
}
Source English:
${JSON.stringify(menuGridEnglish, null, 2)}`;

  const result = await callDeepSeek(prompt);
  return result;
}

// -------------------------------------------------------------
// MAIN RUNNER
// -------------------------------------------------------------
async function run() {
  try {
    const categoriesResult = await translateCategoryTabs();
    const checkoutResult = await translateCheckoutFlow();
    const cartResult = await translateCartDrawer();
    const menuGridResult = await translateMenuGrid();

    const output = {
      categories: categoriesResult,
      checkout: checkoutResult,
      cart: cartResult,
      menuGrid: menuGridResult
    };

    fs.writeFileSync('scratch/all_components_translations.json', JSON.stringify(output, null, 2));
    console.log('✅ All translations fetched successfully and saved to scratch/all_components_translations.json');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
