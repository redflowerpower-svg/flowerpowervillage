import fs from 'fs';

const translationsData = JSON.parse(fs.readFileSync('scratch/all_components_translations.json', 'utf8'));
const categoriesTrans = translationsData.categories;

const targetFile = 'src/pizza/components/CategoryTabs.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

const existingCategoryDetails = {
  'daily-specials': {
    IT: { name: 'Piatti del\nGiorno', desc: 'Creazioni esclusive e piatti speciali del giorno preparati dal nostro chef con ingredienti freschi di stagione.' },
    EN: { name: 'Daily\nSpecials', desc: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef with premium ingredients.' },
    TH: { name: 'จานพิเศษ\nประจำวัน', desc: 'เมนูพิเศษประจำวันรังสรรค์โดยเชฟชาวอิตาเลียน ด้วยวัตถุดิบสดใหม่ตามฤดูกาลและรสชาติอิตาเลียนแท้' },
    DE: { name: 'Tages-\ngerichte', desc: 'Täglich wechselnde Spezialitäten und saisonale Gerichte unseres Chefkochs aus frischen Zutaten.' },
    MM: { name: 'နေ့စဉ်\nဟင်းပွဲများ', desc: 'အီတလီစားဖိုမှူးမှ လတ်ဆတ်သော ရာသီပေါ် ကုန်ကြမ်းများဖြင့် နေ့စဉ် သီးသန့် ဖန်တီးထားသော အထူးဟင်းလျာများ။' },
  },
  'traditional-italian-pizza': {
    IT: { name: 'Pizze\nClassiche', desc: "La pizza è il cuore del nostro locale. Utilizziamo solo ingredienti italiani selezionati di prima qualità: dalla farina al pomodoro, dai formaggi ai salumi, senza scendere a compromessi. La nostra pizza tradizionale ad alta idratazione è realizzata con un impasto al 90% d'acqua, fatto maturare lentamente per almeno 36 ore. Il risultato è una pizza croccante, leggera, altamente digeribile e ricca di sapore." },
    EN: { name: "Italian\nPizza", desc: "Pizza Is The Heart Of Our Restaurant. We Use Only Selected Italian Ingredients, From Flour To Tomato, From Cheeses To Cold Cuts, With No Compromise On Quality. Our Traditional High-Hydration Italian Pizza Is Made With A 90% Water Dough, Slowly Matured For At Least 36 Hours. The Result Is A Crispy, Light, Highly Digestible Pizza, Full Of Flavor." },
    TH: { name: 'พิซซ่า\nคลาสสิก', desc: "พิซซ่าคือหัวใจของร้านอาหารของเรา เราใช้เฉพาะวัตถุดิบอิตาเลียนที่คัดสรรมาอย่างดี ตั้งแต่แป้ง มะเขือเทศ ชีส ไปจนถึงโคลด์คัต โดยไม่ประนีประนอมด้านคุณภาพ พิซซ่าอิตาเลียนแบบดั้งเดิมของเราเป็นแป้งไฮเดรชันสูง ผสมน้ำถึง 90% และหมักอย่างช้าๆ อย่างน้อย 36 ชั่วโมง ผลลัพธ์คือพิซซ่าที่กรอบ เบา ย่อยง่าย และเต็มไปด้วยรสชาติ" },
    DE: { name: 'Klassische\nPizza', desc: "Die Pizza ist das Herzstück unseres Restaurants. Wir verwenden ausschließlich ausgewählte italienische Zutaten bester Qualität: vom Mehl bis zu den Tomaten, vom Käse bis zum Aufschnitt, ohne Kompromisse. Unsere traditionelle italienische Pizza mit hohem Feuchtigkeitsgehalt wird aus einem Teig mit 90 % Wasseranteil hergestellt, der mindestens 36 Stunden lang langsam reift. Das Ergebnis ist eine knusprige, leichte, besonders bekömmliche und geschmacksintensive Pizza." },
    MM: { name: 'ရိုးရာ အီတလီ\nပီဇာ', desc: "ကျွန်ုပ်တို့၏ အဓိက နှလုံးသည် ပီဇာဖြစ်ပါသည်။ အီတလီမှ တင်သွင်းသော ပရီမီယံ ကုန်ကြမ်းများကိုသာ အသုံးပြုထားပြီး ၃၆ နာရီကြာ သဘာဝနည်းဖြင့် အချဉ်ဖောက်ထားသောကြောင့် ကြွပ်ဆတ်၊ ပေါ့ပါးပြီး အစာကြေလွယ်ကာ အရသာအလွန်ပြည့်စုံပါသည်။" },
  },
  'pasta': {
    IT: { name: 'Primi\nPiatti', desc: 'Primi piatti della tradizione e pasta fresca fatta in casa.' },
    EN: { name: 'Pasta &\nPrimi', desc: 'Traditional Italian pasta and homemade first courses.' },
    TH: { name: 'พาสต้า &\nจานเส้น', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิมและพาสต้าสดโฮมเมด' },
    DE: { name: 'Pasta &\nNudeln', desc: 'Traditionelle italienische Pasta und hausgemachte Nudelgerichte.' },
    MM: { name: 'ခေါက်ဆွဲ &\nပတ်စ်တာ', desc: 'ရိုးရာ အီတလီ ခေါက်ဆွဲ ဟင်းလျာများ။' },
  },
  'italian-salads': {
    IT: { name: "Insalate &\nContorni", desc: "Fresche insalate ricche all'italiana, contorni sfiziosi e gustosi secondi piatti della tradizione." },
    EN: { name: "Salads &\nSides", desc: "Fresh rich Italian salads, delicious side dishes, and traditional savory main courses." },
    TH: { name: "สลัด &\nเครื่องเคียง", desc: "สลัดอิตาเลียนสดใหม่ วัตถุดิบคุณภาพเยี่ยม และอาหารจานหลักสไตล์อิตาเลียน" },
    DE: { name: "Salate &\nBeilagen", desc: "Frische italienische Salate und traditionelle herzhafte Hauptgerichte." },
    MM: { name: "ဆလတ် &\nအရံဟင်း", desc: "လတ်ဆတ်သော အီတလီဆလတ်များနှင့် ရိုးရာ အရသာရှိသော အဓိကဟင်းလျာများ။" },
  },
  'pizza-sandwich': {
    IT: { name: "Focaccia &\nSandwich", desc: "Fraganti focacce all'olio extravergine d'oliva cotte al forno e farcite al momento con i migliori salumi italiani, e golosi pizza sandwich ripieni e dorati." },
    EN: { name: "Focaccia &\nSandwich", desc: "Fragrant focaccia with extra virgin olive oil baked in the oven and filled to order with the best Italian cured meats, and tempting golden stuffed pizza sandwiches." },
    TH: { name: "โฟกัชชา &\nแซนด์วิช", desc: "โฟกัชชาหอมกรุ่นทำจากน้ำมันมะกอกเอ็กซ์ตร้าเวอร์จินอบในเตา และยัดไส้สดใหม่ด้วยเนื้อสัตว์อิตาเลียนชั้นเยี่ยม พร้อมพิซซ่าแซนด์วิชไส้แน่นสีทอง" },
    DE: { name: "Focaccia &\nSandwich", desc: "Duftende Focacce mit nativem Olivenöl extra, im Ofen gebacken und frisch belegt mit den besten italienischen Wurstwaren, und verführerische, goldbraune gefüllte Pizza-Sandwiches." },
    MM: { name: "ဖိုကာချာ &\nဆန်းဒဝစ်", desc: "အိုလီဗာဆီအပိုဖြင့် ဖုတ်ထားသော မွှေးကြိုင်သော ဖိုကာချာများနှင့် အကောင်းဆုံး အီတလီအသားခြောက်များဖြင့် ချက်ချင်းဖြည့်ထားသော၊ ထို့အပြင် အရသာရှိပြီး ရွှေရောင်သန်းသော ပီဇာဆန်းဒဝစ်များ။" },
  },
  'pizza-burgers': {
    IT: { name: "Pizza\nBurger", desc: "Preparati con pane per hamburger appena sfornato e hamburger fatti in casa in stile italiano, serviti con patatine fritte, ketchup e maionese: freschi, gustosi e soddisfacenti." },
    EN: { name: "Pizza\nBurger", desc: "Made with freshly baked burger buns and homemade Italian-style patties, served with french fries, ketchup, and mayonnaise: fresh, tasty, and satisfying." },
    TH: { name: 'พิซซ่า\nเบอร์เกอร์', desc: "ทำจากขนมปังเบอร์เกอร์อบสดใหม่และเนื้อเบอร์เกอร์โฮมเมดสไตล์อิตาเลียน เสิร์ฟพร้อมเฟรนช์ฟรายส์ ซอสมะเขือเทศ และมายองเนส สด อร่อย และอิ่มคุ้ม" },
    DE: { name: "Pizza\nBurger", desc: "Hergestellt mit frisch gebackenen Burgerbrötchen und hausgemachten Patties nach italienischer Art, serviert mit Pommes frites, Ketchup und Mayonnaise: frisch, lecker und sättigend." },
    MM: { name: 'ပီဇာ\nဘာဂါ', desc: "အသစ်ဖုတ်ထားသော ပီဇာမုန့်သားဖြင့် ပြုလုပ်ထားသည့် အိမ်လုပ် ဘာဂါနှင့် အာလူးကြော်။" },
  },
  'french-fries': {
    IT: { name: "Patatine\nFritte", desc: "Patatine fritte dorate, croccanti e servite caldissime con ketchup e maionese." },
    EN: { name: "French\nFries", desc: "Golden, crispy french fries served piping hot with ketchup and mayonnaise." },
    TH: { name: "มันฝรั่ง\nทอด", desc: "เฟรนช์ฟรายส์สีทองกรอบอร่อย ทอดสดใหม่เสิร์ฟร้อนๆ พร้อมซอสมะเขือเทศและมายองเนส" },
    DE: { name: "Pommes\nFrites", desc: "Goldgelbe, knusprige Pommes frites heiß serviert mit Ketchup und Mayonnaise." },
    MM: { name: "အာလူး\nကြော်", desc: "ရွှေဝါရောင် ကြွပ်ကြွပ်ရွ အာလူးကြော်များကို အပူပူလေးဖြင့် ကက်ချပ်နှင့် မေယိုနိုက်တွဲဖက်ကျွေးပါသည်။" },
  },
  'desserts': {
    IT: { name: "Dolci &\nDessert", desc: "Tiramisù artigianale fatto in casa, cheesecake, torte del giorno e deliziosi dessert italiani." },
    EN: { name: "Desserts &\nSweets", desc: "Homemade artisan tiramisu, cheesecakes, cakes of the day, and delicious Italian desserts." },
    TH: { name: 'ของหวาน &\nเค้ก', desc: "ทีรามิสุโฮมเมดสไตล์อิตาเลียนแท้ ชีสเค้ก เค้กประจำวัน และของหวานแสนอร่อย" },
    DE: { name: "Desserts &\nSüßes", desc: "Hausgemachtes Tiramisu, Cheesecake, Tageskuchen und köstliche italienische Desserts." },
    MM: { name: 'အချိုပွဲ &\nဒက်ဆာ့တ်', desc: "နာမည်ကြီး တီရာမီဆု၊ အိမ်လုပ်ကိတ်များနှင့် ကော်ဖီ အက်ဖိုဂါတို။" },
  },
  'breakfast-and-snacks': {
    IT: { name: "Snack &\nColazioni", desc: "Colazioni nutrienti, toast caldi, uova preparate al momento e macedonia di frutta fresca." },
    EN: { name: "Snacks &\nBreakfast", desc: "Hearty breakfasts, warm toasts, freshly made eggs, and fresh tropical fruit bowls." },
    TH: { name: 'อาหารเช้า &\nของว่าง', desc: "อาหารเช้าเพื่อสุขภาพ โทสต์ร้อนๆ ไข่ดาว/ออมเล็ตปรุงสดใหม่ และผลไม้รวมสด" },
    DE: { name: "Frühstück &\nSnacks", desc: "Herzhaftes Frühstück, warme Toasts, frisch zubereitete Eierspeisen und frischer Obstsalat." },
    MM: { name: 'မနက်စာ &\nမုန့်များ', desc: "ပေါင်မုန့်မီးကင်၊ ကြက်ဥကြော်နှင့် လတ်ဆတ်သော သစ်သီးစုံ။" },
  },
  'coffee-shop': {
    IT: { name: "Caffetteria\n& Tè", desc: "Autentico espresso italiano, cappuccino cremoso, caffè freddi e selezione di tè pregiati." },
    EN: { name: "Coffee &\nTea", desc: "Authentic Italian espresso, creamy cappuccino, iced coffees, and fine tea selections." },
    TH: { name: 'กาแฟ &\nชา', desc: "เอสเพรสโซ่อิตาเลียนแท้ คาปูชิโน่ฟองนุ่ม กาแฟเย็น และชาคุณภาพคัดสรร" },
    DE: { name: "Kaffee &\nTee", desc: "Authentischer italienischer Espresso, cremiger Cappuccino, Eiskaffee und erlesene Teesorten." },
    MM: { name: 'ကော်ဖီ &\nလက်ဖက်ရည်', desc: "စစ်မှန်သော အီတလီ အက်စ်ပရက်ဆို၊ ခရင်မ်ဆန်သော ကာပူချီနိုနှင့် လက်ဖက်ရည်များ။" },
  },
  'fruit-drinks': {
    IT: { name: "Frullati &\nSmoothie", desc: "Frutta tropicale fresca frullata al momento, smoothie energetici e shake rinfrescanti." },
    EN: { name: "Fruit Shakes\n& Drinks", desc: "Fresh tropical fruit blended on the spot, energizing smoothies, and refreshing shakes." },
    TH: { name: 'น้ำผลไม้ปั่น\n& สมูทตี้', desc: "ผลไม้เมืองร้อนสดใหม่ปั่นสดๆ สมูทตี้เพิ่มพลัง และเครื่องดื่มปั่นเย็นชื่นใจ" },
    DE: { name: "Frucht-Shakes\n& Smoothies", desc: "Frische tropische Früchte frisch gemixt, energiereiche Smoothies und erfrischende Shakes." },
    MM: { name: 'သစ်သီးဖျော်ရည်\nနှင့် စမူးသီး', desc: "လတ်ဆတ်သော ရာသီပေါ် သစ်သီးဖျော်ရည်များနှင့် စမုသီများ။" },
  },
  'soft-drinks': {
    IT: { name: "Bibite &\nAcqua", desc: "Bibite rinfrescanti in lattina, acqua minerale naturale e soda servite fredde." },
    EN: { name: "Soft Drinks\n& Water", desc: "Chilled canned soft drinks, natural mineral water, and sparkling soda." },
    TH: { name: 'น้ำอัดลม &\nน้ำดื่ม', desc: "น้ำอัดลมกระป๋องแช่เย็น น้ำแร่ธรรมชาติ และโซดาเย็นสดชื่น" },
    DE: { name: "Getränke &\nWasser", desc: "Gekühlte Softdrinks in der Dose, natürliches Mineralwasser und spritziges Soda." },
    MM: { name: 'အအေးနှင့်\nသောက်ရေသန့်', desc: "ဗူးသွပ်အအေးများ၊ သဘာဝတွင်းထွက်ရေနှင့် အေးမြလန်းဆန်းစေသော သောက်စရာများ။" },
  },
  'beers': {
    IT: { name: "Birre in\nBottiglia", desc: "Le migliori marche di birra in bottiglia grande e piccola, servite ghiacciate." },
    EN: { name: "Bottled\nBeers", desc: "Top Thai and international bottled beers served ice cold." },
    TH: { name: 'เบียร์\nขวด', desc: "เบียร์ไทยและต่างประเทศชั้นนำ เสิร์ฟเย็นเจี๊ยบทั้งขวดใหญ่และขวดเล็ก" },
    DE: { name: "Flaschen-\nbiere", desc: "Beste thailändische und internationale Flaschenbiere eiskalt serviert." },
    MM: { name: 'ပုလင်း\nဘီယာ', desc: "အကောင်းဆုံး ထိုင်းနှင့် နိုင်ငံတကာ ဘီယာပုလင်း အေးအေးများ။" },
  },
  'wines': {
    IT: { name: "Carta dei\nVini", desc: "Selezione esclusiva di vini italiani e internazionali, perfetti per esaltare ogni piatto." },
    EN: { name: "Wine\nList", desc: "Exclusive selection of Italian and international wines, perfectly paired with our menu." },
    TH: { name: 'รายการ\nไวน์', desc: "คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นยอด เพื่อเติมเต็มรสชาติอาหารมื้อพิเศษของคุณ" },
    DE: { name: "Wein-\nkarte", desc: "Exklusive Auswahl an italienischen und internationalen Weinen, perfekt abgestimmt auf jedes Gericht." },
    MM: { name: 'ဝိုင်\nစာရင်း', desc: "ကျွန်ုပ်တို့၏ ဟင်းလျာ အရသာတိုင်းကို ပိုမိုပြည့်စုံစေရန် ဂရုတစိုက် ရွေးချယ်ထားသော အီတလီနှင့် နိုင်ငံတကာ ဝိုင်ကောင်းများ။" },
  },
};

const fullCategoryDetails = {};
for (const catId of Object.keys(existingCategoryDetails)) {
  fullCategoryDetails[catId] = {
    ...existingCategoryDetails[catId],
    ES: categoriesTrans.ES[catId] || existingCategoryDetails[catId].EN,
    FR: categoriesTrans.FR[catId] || existingCategoryDetails[catId].EN,
    RU: categoriesTrans.RU[catId] || existingCategoryDetails[catId].EN,
    ZH: categoriesTrans.ZH[catId] || existingCategoryDetails[catId].EN,
  };
}

const newCategoryDetailsStr = `const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = ${JSON.stringify(fullCategoryDetails, null, 2)};`;

// Replace using regex
const regex = /const categoryDetails: Record<string, Record<string, \{ name: string; desc: string \}>> = \{[\s\S]*?\};\r?\n\r?\nexport default function CategoryTabs/;

if (regex.test(content)) {
  content = content.replace(regex, newCategoryDetailsStr + '\n\nexport default function CategoryTabs');
  content = content.replaceAll(
    'const details = categoryDetails[item.id]?.[lang] || { name: item.name, desc: \'\' };',
    'const details = categoryDetails[item.id]?.[lang] || categoryDetails[item.id]?.EN || categoryDetails[item.id]?.IT || { name: item.name, desc: \'\' };'
  );
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('✅ Updated CategoryTabs.tsx with all 9 languages successfully!');
} else {
  console.error('❌ Regex match failed for CategoryTabs.tsx');
}
