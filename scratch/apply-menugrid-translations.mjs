import fs from 'fs';

const translationsData = JSON.parse(fs.readFileSync('scratch/all_components_translations.json', 'utf8'));
const menuTrans = translationsData.menuGrid;

// 1. UPDATE ProductModal.tsx
const productModalPath = 'src/pizza/components/ProductModal.tsx';
let pmContent = fs.readFileSync(productModalPath, 'utf8');

const pmLabels = {
  IT: {
    sizeTitle: 'Taglia',
    extraTitle: 'Ingredienti Extra',
    addText: 'Aggiungi',
    freeText: 'Gratis',
  },
  EN: {
    sizeTitle: 'Size',
    extraTitle: 'Extra Ingredients',
    addText: 'Add',
    freeText: 'Free',
  },
  TH: {
    sizeTitle: 'ขนาด',
    extraTitle: 'เครื่องปรุงเพิ่มเติม',
    addText: 'เพิ่มลงตะกร้า',
    freeText: 'ฟรี',
  },
  DE: {
    sizeTitle: 'Größe',
    extraTitle: 'Zusätzliche Zutaten',
    addText: 'Hinzufügen',
    freeText: 'Gratis',
  },
  MM: {
    sizeTitle: 'အရွယ်အစား',
    extraTitle: 'အပိုထည့်စရာများ',
    addText: 'ထည့်မည်',
    freeText: 'အခမဲ့',
  },
  ES: {
    sizeTitle: 'Tamaño',
    extraTitle: 'Ingredientes extra',
    addText: 'Añadir',
    freeText: 'Gratis',
  },
  FR: {
    sizeTitle: 'Taille',
    extraTitle: 'Ingrédients supplémentaires',
    addText: 'Ajouter',
    freeText: 'Gratuit',
  },
  RU: {
    sizeTitle: 'Размер',
    extraTitle: 'Дополнительные ингредиенты',
    addText: 'Добавить',
    freeText: 'Бесплатно',
  },
  ZH: {
    sizeTitle: '尺寸',
    extraTitle: '额外配料',
    addText: '添加',
    freeText: '免费',
  }
};

const pmRegex = /const labels = \{[\s\S]*?\};\r?\n\r?\nexport default function ProductModal/;
pmContent = pmContent.replace(pmRegex, `const labels = ${JSON.stringify(pmLabels, null, 2)};\n\nexport default function ProductModal`);
pmContent = pmContent.replace(
  'const t = labels[lang] || labels[\'IT\'];',
  'const t = labels[lang] || labels.EN || labels.IT;'
);
fs.writeFileSync(productModalPath, pmContent, 'utf8');
console.log('✅ Updated ProductModal.tsx');

// 2. UPDATE MenuGrid.tsx
const menuGridPath = 'src/pizza/components/MenuGrid.tsx';
let mgContent = fs.readFileSync(menuGridPath, 'utf8');

// Existing labels in MenuGrid
const existingMgLabels = {
  IT: {
    sizeOptions: 'Opzioni taglia',
    extraIngredients: 'ingredienti extra',
    startingAt: 'A partire da',
    totalFinito: 'Totale finito',
    confirmText: 'Ordina',
    closeText: 'Chiudi',
    customizeText: 'Personalizza',
    chooseText: 'Aggiungi',
    freeText: 'Gratis',
    lasagnaBadge: '🍝 Min. 2 persone · Prenotazione con 1 giorno di anticipo',
    lasagnaDateLabel: 'Seleziona data di ritiro / consegna',
    lasagnaDatePlaceholder: 'Scegli una data...',
    lasagnaDateRequired: '⚠️ Seleziona una data per procedere',
    lasagnaWhyLabel: 'La preparazione richiede tempo per garantire il massimo della bontà.',
    splitVariantName: '12" Metà & Metà 🌓',
    splitChooseSecondHalf: 'Scegli la 2ª metà',
    splitSearchPlaceholder: 'Cerca pizza per la 2ª metà...',
    splitFirstHalfLabel: '1ª Metà (Base)',
    splitSecondHalfLabel: '2ª Metà',
    splitSecondHalfRequired: '⚠️ Seleziona la 2ª metà per procedere',
    splitAverageNotice: 'Prezzo 50/50: media esatta dei due gusti 12"',
    splitSelectedBadge: 'Gusto Scelto',
    chickenOptionTitle: 'Opzione 100% Pollo (Halal-friendly)',
    chickenOptionDesc: 'Sostituisce salumi/maiale con pollo',
    chickenOptionSelected: 'Pollo Selezionato',
    chickenOptionSelect: '+ Scegli Pollo',
  },
  EN: {
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
    splitSecondHalfRequired: '⚠️ Please select the 2nd half to proceed',
    splitAverageNotice: '50/50 price: exact average of both 12" flavours',
    splitSelectedBadge: 'Selected Flavor',
    chickenOptionTitle: '100% Chicken Option (Halal-friendly)',
    chickenOptionDesc: 'Replaces pork & cold cuts with chicken',
    chickenOptionSelected: 'Chicken Selected',
    chickenOptionSelect: '+ Choose Chicken',
  },
  TH: {
    sizeOptions: 'ตัวเลือกขนาด',
    extraIngredients: 'เครื่องปรุงเพิ่มเติม',
    startingAt: 'ราคาเริ่มต้น',
    totalFinito: 'ราคารวม',
    confirmText: 'สั่งเลย',
    closeText: 'ปิด',
    customizeText: 'ปรับแต่ง',
    chooseText: 'เพิ่ม',
    freeText: 'ฟรี',
    lasagnaBadge: '🍝 ขั้นต่ำ 2 ที่ · สั่งล่วงหน้า 1 วัน',
    lasagnaDateLabel: 'เลือกวันที่รับ / จัดส่ง',
    lasagnaDatePlaceholder: 'เลือกวันที่...',
    lasagnaDateRequired: '⚠️ กรุณาเลือกวันที่ก่อนดำเนินการ',
    lasagnaWhyLabel: 'ใช้เวลาเตรียมนานเพื่อให้ได้รสชาติที่ดีที่สุด',
    splitVariantName: '12" ฮาล์ฟ & ฮาล์ฟ 🌓',
    splitChooseSecondHalf: 'เลือกหน้าที่ 2',
    splitSearchPlaceholder: 'ค้นหาพิซซ่าหน้าที่ 2...',
    splitFirstHalfLabel: 'หน้าที่ 1 (ฐาน)',
    splitSecondHalfLabel: 'หน้าที่ 2',
    splitSecondHalfRequired: '⚠️ กรุณาเลือกหน้าที่ 2 ก่อนสั่งซื้อ',
    splitAverageNotice: 'ราคา 50/50: หารเฉลี่ยราคาพิซซ่าขนาด 12" ทั้งสองหน้า',
    splitSelectedBadge: 'หน้าที่เลือก',
    chickenOptionTitle: 'ตัวเลือกเนื้อไก่ 100% (Halal-friendly)',
    chickenOptionDesc: 'เปลี่ยนหมู/ไส้กรอกเป็นเนื้อไก่ 100%',
    chickenOptionSelected: 'เลือกไก่แล้ว',
    chickenOptionSelect: '+ เลือกไก่',
  },
  DE: {
    sizeOptions: 'Größenoptionen',
    extraIngredients: 'Zusatzzutaten',
    startingAt: 'Ab-Preis',
    totalFinito: 'Gesamtpreis',
    confirmText: 'Bestellen',
    closeText: 'Schließen',
    customizeText: 'Konfigurieren',
    chooseText: 'Hinzufügen',
    freeText: 'Gratis',
    lasagnaBadge: '🍝 Min. 2 Personen · 1 Tag im Voraus bestellen',
    lasagnaDateLabel: 'Abhol- / Lieferdatum wählen',
    lasagnaDatePlaceholder: 'Datum auswählen...',
    lasagnaDateRequired: '⚠️ Bitte ein Datum auswählen, um fortzufahren',
    lasagnaWhyLabel: 'Die Zubereitung braucht Zeit, um höchste Qualität zu garantieren.',
    splitVariantName: '12" Halb & Halb 🌓',
    splitChooseSecondHalf: '2. Hälfte wählen',
    splitSearchPlaceholder: 'Pizza für 2. Hälfte suchen...',
    splitFirstHalfLabel: '1. Hälfte (Basis)',
    splitSecondHalfLabel: '2. Hälfte',
    splitSecondHalfRequired: '⚠️ Bitte 2. Hälfte auswählen',
    splitAverageNotice: '50/50-Preis: Exakter Durchschnitt der zwei 12"-Pizzen',
    splitSelectedBadge: 'Gewählte Sorte',
    chickenOptionTitle: '100% Hähnchen (Halal-friendly)',
    chickenOptionDesc: 'Ersetzt Schwein durch Geflügel',
    chickenOptionSelected: 'Geflügel Gewählt',
    chickenOptionSelect: '+ Geflügel Wählen',
  },
  MM: {
    sizeOptions: 'အရွယ်အစား ရွေးချယ်မှု',
    extraIngredients: 'အပိုထည့်စရာများ',
    startingAt: 'စတင်သည့်စျေး',
    totalFinito: 'စုစုပေါင်း စျေးနှုန်း',
    confirmText: 'မှာယူပါ',
    closeText: 'ပိတ်မည်',
    customizeText: 'စိတ်ကြိုက်ပြင်ဆင်မည်',
    chooseText: 'ထည့်မည်',
    freeText: 'အခမဲ့',
    lasagnaBadge: '🍝 အနည်းဆုံး ၂ ယောက်စာ · ၁ ရက် ကြိုတင်မှာယူပါ',
    lasagnaDateLabel: 'လာယူမည့် / ပို့ဆောင်မည့် ရက်စွဲ ရွေးပါ',
    lasagnaDatePlaceholder: 'ရက်စွဲ ရွေးပါ...',
    lasagnaDateRequired: '⚠️ ရှေ့ဆက်ရန် ရက်စွဲ ရွေးချယ်ပါ',
    lasagnaWhyLabel: 'အကောင်းဆုံး အရသာနှင့် အရည်အသွေး ရရှိရန် အချိန်ယူ ပြင်ဆင်ရပါသည်။',
    splitVariantName: '12" တဝက်စီ နှစ်မျိုးစပ် (Half & Half) 🌓',
    splitChooseSecondHalf: 'ဒုတိယ တဝက် ရွေးပါ',
    splitSearchPlaceholder: 'ဒုတိယ တဝက်အတွက် ပီဇာ ရှာရန်...',
    splitFirstHalfLabel: 'ပထမ တဝက် (အဓိက)',
    splitSecondHalfLabel: 'ဒုတိယ တဝက်',
    splitSecondHalfRequired: '⚠️ ရှေ့ဆက်ရန် ဒုတိယ တဝက်ကို ရွေးပါ',
    splitAverageNotice: '၅၀/၅၀ စျေးနှုန်း - ၁၂ လက်မ နှစ်မျိုး၏ ပျမ်းမျှ စျေးနှုန်း အတိအကျ',
    splitSelectedBadge: 'ရွေးချယ်ထားသော အရသာ',
    chickenOptionTitle: '၁၀၀% ကြက်သား ရွေးချယ်မှု (Halal-friendly)',
    chickenOptionDesc: 'ဝက်သားနှင့် ဝက်အူချောင်းအစား ကြက်သားဖြင့် ပြောင်းလဲပေးပါသည်',
    chickenOptionSelected: 'ကြက်သား ရွေးချယ်ထားသည်',
    chickenOptionSelect: '+ ကြက်သား ရွေးမည်',
  },
  ES: {
    sizeOptions: menuTrans.ES.sizeOptions || 'Opciones de tamaño',
    extraIngredients: menuTrans.ES.extraIngredients || 'ingredientes extra',
    startingAt: menuTrans.ES.startingAt || 'Desde',
    totalFinito: menuTrans.ES.totalFinito || 'Precio total',
    confirmText: menuTrans.ES.confirmText || 'Pedir',
    closeText: menuTrans.ES.closeText || 'Cerrar',
    customizeText: menuTrans.ES.customizeText || 'Personalizar',
    chooseText: menuTrans.ES.chooseText || 'Añadir',
    freeText: menuTrans.ES.freeText || 'Gratis',
    lasagnaBadge: menuTrans.ES.lasagnaBadge || '🍝 Mín. 2 personas · Pedir con 1 día de antelación',
    lasagnaDateLabel: menuTrans.ES.lasagnaDateLabel || 'Selecciona fecha de recogida / entrega',
    lasagnaDatePlaceholder: menuTrans.ES.lasagnaDatePlaceholder || 'Elige una fecha...',
    lasagnaDateRequired: menuTrans.ES.lasagnaDateRequired || '⚠️ Por favor, selecciona una fecha para continuar',
    lasagnaWhyLabel: menuTrans.ES.lasagnaWhyLabel || 'La preparación requiere tiempo para garantizar la mejor calidad.',
    splitVariantName: menuTrans.ES.splitVariantName || '12" Mitad y mitad 🌓',
    splitChooseSecondHalf: menuTrans.ES.splitChooseSecondHalf || 'Elige la 2ª mitad',
    splitSearchPlaceholder: menuTrans.ES.splitSearchPlaceholder || 'Busca pizza para la 2ª mitad...',
    splitFirstHalfLabel: menuTrans.ES.splitFirstHalfLabel || '1ª Mitad (Base)',
    splitSecondHalfLabel: menuTrans.ES.splitSecondHalfLabel || '2ª Mitad',
    splitSecondHalfRequired: menuTrans.ES.splitSecondHalfRequired || '⚠️ Por favor, selecciona una 2ª mitad para continuar',
    splitAverageNotice: menuTrans.ES.splitAverageNotice || 'Precio 50/50: promedio exacto de los dos sabores de 12"',
    splitSelectedBadge: menuTrans.ES.splitSelectedBadge || 'Sabor seleccionado',
    chickenOptionTitle: menuTrans.ES.chickenOptionTitle || 'Opción 100% Pollo (apto para Halal)',
    chickenOptionDesc: menuTrans.ES.chickenOptionDesc || 'Reemplaza embutidos y cerdo por pollo',
    chickenOptionSelected: menuTrans.ES.chickenOptionSelected || 'Pollo seleccionado',
    chickenOptionSelect: menuTrans.ES.chickenOptionSelect || '+ Elegir pollo',
  },
  FR: {
    sizeOptions: menuTrans.FR.sizeOptions || 'Options de taille',
    extraIngredients: menuTrans.FR.extraIngredients || 'ingrédients supplémentaires',
    startingAt: menuTrans.FR.startingAt || 'À partir de',
    totalFinito: menuTrans.FR.totalFinito || 'Prix total',
    confirmText: menuTrans.FR.confirmText || 'Commander',
    closeText: menuTrans.FR.closeText || 'Fermer',
    customizeText: menuTrans.FR.customizeText || 'Personnaliser',
    chooseText: menuTrans.FR.chooseText || 'Ajouter',
    freeText: menuTrans.FR.freeText || 'Gratuit',
    lasagnaBadge: menuTrans.FR.lasagnaBadge || '🍝 Min. 2 personnes · Précommande 1 jour à l\'avance',
    lasagnaDateLabel: menuTrans.FR.lasagnaDateLabel || 'Sélectionnez la date de retrait / livraison',
    lasagnaDatePlaceholder: menuTrans.FR.lasagnaDatePlaceholder || 'Choisissez une date...',
    lasagnaDateRequired: menuTrans.FR.lasagnaDateRequired || '⚠️ Veuillez sélectionner une date pour continuer',
    lasagnaWhyLabel: menuTrans.FR.lasagnaWhyLabel || 'La préparation prend du temps pour garantir la meilleure qualité.',
    splitVariantName: menuTrans.FR.splitVariantName || '12" Moitié & Moitié 🌓',
    splitChooseSecondHalf: menuTrans.FR.splitChooseSecondHalf || 'Choisissez la 2e moitié',
    splitSearchPlaceholder: menuTrans.FR.splitSearchPlaceholder || 'Rechercher une pizza pour la 2e moitié...',
    splitFirstHalfLabel: menuTrans.FR.splitFirstHalfLabel || '1ère moitié (Base)',
    splitSecondHalfLabel: menuTrans.FR.splitSecondHalfLabel || '2ème moitié',
    splitSecondHalfRequired: menuTrans.FR.splitSecondHalfRequired || '⚠️ Veuillez choisir la 2ème moitié pour continuer',
    splitAverageNotice: menuTrans.FR.splitAverageNotice || 'Prix 50/50 : moyenne exacte des deux saveurs de 12"',
    splitSelectedBadge: menuTrans.FR.splitSelectedBadge || 'Saveur choisie',
    chickenOptionTitle: menuTrans.FR.chickenOptionTitle || 'Option 100% Poulet (adapté Halal)',
    chickenOptionDesc: menuTrans.FR.chickenOptionDesc || 'Remplace le porc et la charcuterie par du poulet',
    chickenOptionSelected: menuTrans.FR.chickenOptionSelected || 'Poulet sélectionné',
    chickenOptionSelect: menuTrans.FR.chickenOptionSelect || '+ Choisir poulet',
  },
  RU: {
    sizeOptions: menuTrans.RU.sizeOptions || 'Варианты размера',
    extraIngredients: menuTrans.RU.extraIngredients || 'дополнительные ингредиенты',
    startingAt: menuTrans.RU.startingAt || 'От',
    totalFinito: menuTrans.RU.totalFinito || 'Итоговая цена',
    confirmText: menuTrans.RU.confirmText || 'Заказать',
    closeText: menuTrans.RU.closeText || 'Закрыть',
    customizeText: menuTrans.RU.customizeText || 'Настроить',
    chooseText: menuTrans.RU.chooseText || 'Добавить',
    freeText: menuTrans.RU.freeText || 'Бесплатно',
    lasagnaBadge: menuTrans.RU.lasagnaBadge || '🍝 Мин. 2 персоны · Предзаказ за 1 день',
    lasagnaDateLabel: menuTrans.RU.lasagnaDateLabel || 'Выберите дату самовывоза / доставки',
    lasagnaDatePlaceholder: menuTrans.RU.lasagnaDatePlaceholder || 'Выберите дату...',
    lasagnaDateRequired: menuTrans.RU.lasagnaDateRequired || '⚠️ Пожалуйста, выберите дату для продолжения',
    lasagnaWhyLabel: menuTrans.RU.lasagnaWhyLabel || 'Приготовление требует времени для обеспечения наилучшего качества.',
    splitVariantName: menuTrans.RU.splitVariantName || '12" Половина и половина 🌓',
    splitChooseSecondHalf: menuTrans.RU.splitChooseSecondHalf || 'Выберите 2-ю половину',
    splitSearchPlaceholder: menuTrans.RU.splitSearchPlaceholder || 'Поиск пиццы для 2-й половины...',
    splitFirstHalfLabel: menuTrans.RU.splitFirstHalfLabel || '1-я половина (База)',
    splitSecondHalfLabel: menuTrans.RU.splitSecondHalfLabel || '2-я половина',
    splitSecondHalfRequired: menuTrans.RU.splitSecondHalfRequired || '⚠️ Пожалуйста, выберите 2-ю половину',
    splitAverageNotice: menuTrans.RU.splitAverageNotice || 'Цена 50/50: точное среднее арифметическое двух вкусов 12"',
    splitSelectedBadge: menuTrans.RU.splitSelectedBadge || 'Выбранный вкус',
    chickenOptionTitle: menuTrans.RU.chickenOptionTitle || 'Вариант 100% курица (Халяль)',
    chickenOptionDesc: menuTrans.RU.chickenOptionDesc || 'Заменяет свинину и колбасы курицей',
    chickenOptionSelected: menuTrans.RU.chickenOptionSelected || 'Курица выбрана',
    chickenOptionSelect: menuTrans.RU.chickenOptionSelect || '+ Выбрать курицу',
  },
  ZH: {
    sizeOptions: menuTrans.ZH.sizeOptions || '尺寸选项',
    extraIngredients: menuTrans.ZH.extraIngredients || '额外配料',
    startingAt: menuTrans.ZH.startingAt || '起价',
    totalFinito: menuTrans.ZH.totalFinito || '总价',
    confirmText: menuTrans.ZH.confirmText || '下单',
    closeText: menuTrans.ZH.closeText || '关闭',
    customizeText: menuTrans.ZH.customizeText || '自定义',
    chooseText: menuTrans.ZH.chooseText || '添加',
    freeText: menuTrans.ZH.freeText || '免费',
    lasagnaBadge: menuTrans.ZH.lasagnaBadge || '🍝 最少2人份 · 提前1天预订',
    lasagnaDateLabel: menuTrans.ZH.lasagnaDateLabel || '选择自取 / 配送日期',
    lasagnaDatePlaceholder: menuTrans.ZH.lasagnaDatePlaceholder || '选择日期...',
    lasagnaDateRequired: menuTrans.ZH.lasagnaDateRequired || '⚠️ 请选择日期以继续',
    lasagnaWhyLabel: menuTrans.ZH.lasagnaWhyLabel || '精心制作需要时间，以确保最佳口感与品质。',
    splitVariantName: menuTrans.ZH.splitVariantName || '12" 双拼半半 🌓',
    splitChooseSecondHalf: menuTrans.ZH.splitChooseSecondHalf || '选择后半部分',
    splitSearchPlaceholder: menuTrans.ZH.splitSearchPlaceholder || '搜索第二种披萨口味...',
    splitFirstHalfLabel: menuTrans.ZH.splitFirstHalfLabel || '前半部分（基础）',
    splitSecondHalfLabel: menuTrans.ZH.splitSecondHalfLabel || '后半部分',
    splitSecondHalfRequired: menuTrans.ZH.splitSecondHalfRequired || '⚠️ 请选择后半部分口味以继续',
    splitAverageNotice: menuTrans.ZH.splitAverageNotice || '50/50 价格：两种12寸披萨价格的精确平均值',
    splitSelectedBadge: menuTrans.ZH.splitSelectedBadge || '已选口味',
    chickenOptionTitle: menuTrans.ZH.chickenOptionTitle || '100% 鸡肉选项（清真友好）',
    chickenOptionDesc: menuTrans.ZH.chickenOptionDesc || '将猪肉和熟食冷肉替换为优质鸡肉',
    chickenOptionSelected: menuTrans.ZH.chickenOptionSelected || '已选择鸡肉',
    chickenOptionSelect: menuTrans.ZH.chickenOptionSelect || '+ 选择鸡肉',
  },
};

const mgLabelsRegex = /const labels = \{[\s\S]*?\};\r?\n\r?\n\/\/ Returns tomorrow's date/;
mgContent = mgContent.replace(mgLabelsRegex, `const labels = ${JSON.stringify(existingMgLabels, null, 2)};\n\n// Returns tomorrow's date`);
mgContent = mgContent.replace(
  'const t = labels[lang] || labels[\'IT\'];',
  'const t = labels[lang] || labels.EN || labels.IT;'
);

// Update getVariantHeaderLabel helper to cover all 9 languages
const variantHeaderLabelFn = `  const getVariantHeaderLabel = (it: MenuItem) => {
    if (it.variants?.some(v => v.id.startsWith('format-')) || it.id.includes('pasta') || it.id.includes('scoglio') || it.id.includes('salmone') || it.id.includes('ravioli') || it.id.includes('seppia') || it.id.includes('granchio')) {
      if (lang === 'TH') return 'เลือกรูปแบบเส้นพาสต้า';
      if (lang === 'DE') return 'Pasta-Format wählen';
      if (lang === 'ES') return 'Elige formato de pasta';
      if (lang === 'FR') return 'Choisissez le format de pâtes';
      if (lang === 'RU') return 'Выберите формат пасты';
      if (lang === 'ZH') return '选择意面种类';
      if (lang === 'MM') return 'ခေါက်ဆွဲ ပုံစံ ရွေးပါ';
      if (lang === 'IT') return 'Scegli il Formato di Pasta';
      return 'Choose Pasta Format';
    }
    if (it.id === 'soft-drink-cans' || it.id.includes('drink') || it.id.includes('can') || it.id.includes('bibit')) {
      if (lang === 'TH') return 'เลือกรสชาติ / เครื่องดื่มกระป๋อง';
      if (lang === 'DE') return 'Wähle deine Dose';
      if (lang === 'ES') return 'Elige tu lata';
      if (lang === 'FR') return 'Choisissez votre canette';
      if (lang === 'RU') return 'Выберите банку';
      if (lang === 'ZH') return '选择饮料罐';
      if (lang === 'MM') return 'အအေးဗူး ရွေးပါ';
      if (lang === 'IT') return 'Scegli la tua Lattina';
      return 'Choose your Can';
    }
    if (it.id.includes('beer') || it.id.includes('water')) {
      if (lang === 'TH') return 'เลือกขนาด / รูปแบบ';
      if (lang === 'DE') return 'Format wählen';
      if (lang === 'ES') return 'Elige tamaño';
      if (lang === 'FR') return 'Choisissez la taille';
      if (lang === 'RU') return 'Выберите размер';
      if (lang === 'ZH') return '选择尺寸';
      if (lang === 'MM') return 'အရွယ်အစား ရွေးပါ';
      if (lang === 'IT') return 'Scegli Formato';
      return 'Choose Size';
    }
    if (lang === 'TH') return 'ขนาด';
    if (lang === 'DE') return 'Größe';
    if (lang === 'ES') return 'Tamaño';
    if (lang === 'FR') return 'Taille';
    if (lang === 'RU') return 'Размер';
    if (lang === 'ZH') return '尺寸';
    if (lang === 'MM') return 'အရွယ်အစား';
    if (lang === 'IT') return 'Taglia';
    return 'Size';
  };`;

const oldVariantHeaderRegex = /const getVariantHeaderLabel = \(it: MenuItem\) => \{[\s\S]*?\};\r?\n\r?\n  const getTranslatedName/;
mgContent = mgContent.replace(oldVariantHeaderRegex, variantHeaderLabelFn + '\n\n  const getTranslatedName');

// Update getGroupedExtras helper to cover all 9 languages
const groupedExtrasFn = `  const getGroupedExtras = (item: MenuItem) => {
    const groups: { title: string; maxSelection?: number; items: ExtraOption[]; type: 'option' | 'extra'; idPrefix: string }[] = [];
    
    const spicyItems = item.extras?.filter((e) => e.id.startsWith('spicy-')) ?? [];
    const sugarItems = item.extras?.filter((e) => e.id.startsWith('sugar-')) ?? [];
    const fruitItems = item.extras?.filter((e) => e.id.startsWith('fruit-')) ?? [];
    const sauceItems = item.extras?.filter((e) => e.id.startsWith('sauce-')) ?? [];
    const regularItems = item.extras?.filter((e) => 
      !e.id.startsWith('spicy-') && 
      !e.id.startsWith('sugar-') && 
      !e.id.startsWith('fruit-') && 
      !e.id.startsWith('sauce-')
    ) ?? [];

    if (spicyItems.length > 0) {
      const title = lang === 'TH' ? 'ระดับความเผ็ด' : lang === 'IT' ? 'Livello di Piccantezza' : lang === 'DE' ? 'Schärfegrad' : lang === 'ES' ? 'Nivel de picante' : lang === 'FR' ? 'Niveau de piquant' : lang === 'RU' ? 'Уровень остроты' : lang === 'ZH' ? '辣度等级' : lang === 'MM' ? 'အစပ်အဆင့်' : 'Spiciness Level';
      groups.push({
        title,
        maxSelection: 1,
        items: spicyItems,
        type: 'option',
        idPrefix: 'spicy-'
      });
    }

    if (sugarItems.length > 0) {
      const title = lang === 'TH' ? 'ระดับความหวาน' : lang === 'IT' ? 'Livello di Zucchero' : lang === 'DE' ? 'Süßegrad' : lang === 'ES' ? 'Nivel de azúcar' : lang === 'FR' ? 'Niveau de sucre' : lang === 'RU' ? 'Уровень сахара' : lang === 'ZH' ? '甜度等级' : lang === 'MM' ? 'အချိုအဆင့်' : 'Sugar Level';
      groups.push({
        title,
        maxSelection: 1,
        items: sugarItems,
        type: 'option',
        idPrefix: 'sugar-'
      });
    }

    if (fruitItems.length > 0) {
      const title = lang === 'TH' ? 'เลือกผลไม้' : lang === 'IT' ? 'Scelta della Frutta' : lang === 'DE' ? 'Fruchtauswahl' : lang === 'ES' ? 'Elige fruta' : lang === 'FR' ? 'Choix des fruits' : lang === 'RU' ? 'Выбор фруктов' : lang === 'ZH' ? '选择水果' : lang === 'MM' ? 'သစ်သီး ရွေးပါ' : 'Choose Fruit';
      groups.push({
        title,
        maxSelection: 1,
        items: fruitItems,
        type: 'option',
        idPrefix: 'fruit-'
      });
    }

    if (sauceItems.length > 0) {
      const title = lang === 'TH' ? 'เลือกซอส (สูงสุด 2 ชนิด)' : lang === 'IT' ? 'Seleziona Salse (max 2)' : lang === 'DE' ? 'Saucen wählen (max 2)' : lang === 'ES' ? 'Selecciona salsas (máx 2)' : lang === 'FR' ? 'Sélectionnez sauces (max 2)' : lang === 'RU' ? 'Выберите соусы (макс 2)' : lang === 'ZH' ? '选择酱料（最多2种）' : lang === 'MM' ? 'ဆော့စ် ရွေးပါ (အများဆုံး ၂ မျိုး)' : 'Select Sauces (max 2)';
      groups.push({
        title,
        maxSelection: 2,
        items: sauceItems,
        type: 'option',
        idPrefix: 'sauce-'
      });
    }

    if (regularItems.length > 0) {
      const title = lang === 'TH' ? 'เครื่องปรุงเพิ่มเติม' : lang === 'IT' ? 'Ingredienti Extra' : lang === 'DE' ? 'Zusatzzutaten' : lang === 'ES' ? 'Ingredientes extra' : lang === 'FR' ? 'Ingrédients supplémentaires' : lang === 'RU' ? 'Дополнительные ингредиенты' : lang === 'ZH' ? '额外配料' : lang === 'MM' ? 'အပိုထည့်စရာများ' : 'Extra Ingredients';
      groups.push({
        title,
        items: regularItems,
        type: 'extra',
        idPrefix: 'regular'
      });
    }

    return groups;
  };`;

const oldGroupedExtrasRegex = /const getGroupedExtras = \(item: MenuItem\) => \{[\s\S]*?\};\r?\n\r?\n  const getFruitEmoji/;
mgContent = mgContent.replace(oldGroupedExtrasRegex, groupedExtrasFn + '\n\n  const getFruitEmoji');

// Update handleAdd to include split translations for ES, FR, RU, ZH
const splitAddRegex = /const nameEn = `12" Half & Half: \$\{item\.name\} \+ \$\{selectedSecondHalf\.name\}`;[\s\S]*?addItem\(\{[\s\S]*?productId: `\$\{item\.id\}-split-\$\{selectedSecondHalf\.id\}`,/;
const newSplitAdd = `const nameEn = \`12" Half & Half: \${item.name} + \${selectedSecondHalf.name}\`;
      const nameTh = \`12" ฮาล์ฟ & ฮาล์ฟ: \${item.nameTh || item.name} + \${selectedSecondHalf.nameTh || selectedSecondHalf.name}\`;
      const nameIt = \`12" Metà & Metà: \${item.nameIt || item.name} + \${selectedSecondHalf.nameIt || selectedSecondHalf.name}\`;
      const nameDe = \`12" Halb & Halb: \${item.nameDe || item.name} + \${selectedSecondHalf.nameDe || selectedSecondHalf.name}\`;
      const nameMm = \`12" နှစ်မျိုးစပ်: \${(item as any).nameMm || item.name} + \${(selectedSecondHalf as any).nameMm || selectedSecondHalf.name}\`;
      const nameEs = \`12" Mitad y mitad: \${(item as any).nameEs || item.name} + \${(selectedSecondHalf as any).nameEs || selectedSecondHalf.name}\`;
      const nameFr = \`12" Moitié & Moitié: \${(item as any).nameFr || item.name} + \${(selectedSecondHalf as any).nameFr || selectedSecondHalf.name}\`;
      const nameRu = \`12" Половина и половина: \${(item as any).nameRu || item.name} + \${(selectedSecondHalf as any).nameRu || selectedSecondHalf.name}\`;
      const nameZh = \`12" 双拼半半: \${(item as any).nameZh || item.name} + \${(selectedSecondHalf as any).nameZh || selectedSecondHalf.name}\`;

      addItem({
        productId: \`\${item.id}-split-\${selectedSecondHalf.id}\`,
        nameEs,
        nameFr,
        nameRu,
        nameZh,`;

mgContent = mgContent.replace(splitAddRegex, newSplitAdd);

fs.writeFileSync(menuGridPath, mgContent, 'utf8');
console.log('✅ Updated MenuGrid.tsx with all 9 languages, helpers and split logic.');
