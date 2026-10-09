import { Language } from '../../../pizza/config/languages';

export type KdsLanguage = 'en' | 'th' | 'mm' | 'it' | 'de';

export interface ExtraTranslationEntry {
  it: string;
  en: string;
  th: string;
  mm: string;
  de: string;
}

/**
 * Universal Certified Extra, Topping, Variant, Dough and Format Dictionary
 * Translations powered by DeepSeek AI & authentic culinary terminology.
 */
export const KDS_EXTRA_DICTIONARY: Record<string, ExtraTranslationEntry> = {
  // Cheeses & Dairy
  'mozzarella': {
    it: 'Mozzarella',
    en: 'Mozzarella Cheese',
    th: 'มอสซาเรลล่าชีส',
    mm: 'မော့ဇာရဲလား ချိစ်',
    de: 'Mozzarella-Käse'
  },
  'doppia mozzarella': {
    it: 'Doppia Mozzarella',
    en: 'Double Mozzarella',
    th: 'เพิ่มมอสซาเรลล่าชีส 2 เท่า',
    mm: 'မော့ဇာရဲလား ချိစ် ၂ ဆ',
    de: 'Doppelte Mozzarella'
  },
  'extra mozzarella': {
    it: 'Extra Mozzarella',
    en: 'Extra Mozzarella',
    th: 'เพิ่มมอสซาเรลล่าชีส',
    mm: 'မော့ဇာရဲလား ချိစ် အပို',
    de: 'Extra Mozzarella'
  },
  'bufala': {
    it: 'Mozzarella di Bufala',
    en: 'Buffalo Mozzarella',
    th: 'มอสซาเรลล่าชีสนมควาย',
    mm: 'ကျွဲနို့ မော့ဇာရဲလား ချိစ်',
    de: 'Büffelmozzarella'
  },
  'mozzarella di bufala': {
    it: 'Mozzarella di Bufala',
    en: 'Buffalo Mozzarella',
    th: 'มอสซาเรลล่าชีสนมควาย',
    mm: 'ကျွဲနို့ မော့ဇာရဲလား ချိစ်',
    de: 'Büffelmozzarella'
  },
  'burrata': {
    it: 'Burrata Fresca',
    en: 'Fresh Burrata',
    th: 'บูร์ราต้าชีสสด',
    mm: 'ဘူရာတာ ချိစ်စို',
    de: 'Frische Burrata'
  },
  'burratina': {
    it: 'Burratina Fresca',
    en: 'Fresh Mini Burrata',
    th: 'บูร์ราติน่าชีสสด',
    mm: 'ဘူရာတီနာ ချိစ်စို အသေး',
    de: 'Frische Mini-Burrata'
  },
  'gorgonzola': {
    it: 'Gorgonzola DOP',
    en: 'Gorgonzola Blue Cheese',
    th: 'กอร์กอนโซล่าบลูชีส',
    mm: 'ဂေါ်ဂွန်ဇိုလာ ဘလူးချိစ်',
    de: 'Gorgonzola Blauschimmelkäse'
  },
  'parmigiano': {
    it: 'Parmigiano',
    en: 'Parmesan',
    th: 'พาร์มิจาโน',
    mm: 'ပါမာဂျာနို',
    de: 'Parmesan'
  },
  'parmesan': {
    it: 'Parmigiano',
    en: 'Parmesan',
    th: 'พาร์มิจาโน',
    mm: 'ပါမာဂျာနို',
    de: 'Parmesan'
  },
  'ext-double-parmesan': {
    it: 'Parmigiano',
    en: 'Parmesan',
    th: 'พาร์มิจาโน',
    mm: 'ပါမာဂျာနို',
    de: 'Parmesan'
  },
  '10171': {
    it: 'Parmigiano',
    en: 'Parmesan',
    th: 'พาร์มิจาโน',
    mm: 'ပါမာဂျာနို',
    de: 'Parmesan'
  },
  'parmigiano reggiano': {
    it: 'Parmigiano',
    en: 'Parmesan',
    th: 'พาร์มิจาโน',
    mm: 'ပါမာဂျာနို',
    de: 'Parmesan'
  },
  'grana': {
    it: 'Grana Padano',
    en: 'Grana Padano',
    th: 'กรานาปาดาโนชีส',
    mm: 'ဂရာနာ ပါဒါနို ချိစ်',
    de: 'Grana Padano'
  },
  'grana padano': {
    it: 'Grana Padano',
    en: 'Grana Padano',
    th: 'กรานาปาดาโนชีส',
    mm: 'ဂရာနာ ပါဒါနို ချိစ်',
    de: 'Grana Padano'
  },
  'pecorino': {
    it: 'Pecorino Romano',
    en: 'Pecorino Romano',
    th: 'เปโคริโน่ชีสนมแกะ',
    mm: 'သိုးနို့ ပီကိုရီနို ချိစ်',
    de: 'Pecorino Romano'
  },
  'pecorino romano': {
    it: 'Pecorino Romano',
    en: 'Pecorino Romano',
    th: 'เปโคริโน่โรมาโนชีส',
    mm: 'ပီကိုရီနို ရိုမာနို ချိစ်',
    de: 'Pecorino Romano'
  },
  'ricotta': {
    it: 'Ricotta Fresca',
    en: 'Fresh Ricotta Cheese',
    th: 'ริคอตต้าชีสสด',
    mm: 'ရီကော့တာ ချိစ်',
    de: 'Frischer Ricotta'
  },
  'mascarpone': {
    it: 'Mascarpone',
    en: 'Mascarpone',
    th: 'มาสคาโปเนชีส',
    mm: 'မတ်စ်ကာပိုနီ ချိစ်',
    de: 'Mascarpone'
  },
  'scamorza': {
    it: 'Scamorza Affumicata',
    en: 'Smoked Scamorza Cheese',
    th: 'สคามอร์ซารมควัน',
    mm: 'အမွှေးနံ့သာ စကာမော်ဇာ ချိစ်',
    de: 'Geräucherter Scamorza'
  },
  'scamorza affumicata': {
    it: 'Scamorza Affumicata',
    en: 'Smoked Scamorza Cheese',
    th: 'สคามอร์ซารมควัน',
    mm: 'အမွှေးနံ့သာ စကာမော်ဇာ ချိစ်',
    de: 'Geräucherter Scamorza'
  },
  'fontina': {
    it: 'Fontina',
    en: 'Fontina Cheese',
    th: 'ฟอนติน่าชีส',
    mm: 'ဖွန်တီနာ ချိစ်',
    de: 'Fontina-Käse'
  },
  'formaggio': {
    it: 'Formaggio',
    en: 'Cheese',
    th: 'ชีส',
    mm: 'ချိစ်',
    de: 'Käse'
  },
  '4 formaggi': {
    it: '4 Formaggi',
    en: '4 Cheeses Selection',
    th: 'ชีส 4 ชนิด',
    mm: 'ချိစ် ၄ မျိုး',
    de: '4 Käsesorten'
  },

  // Meats & Cold Cuts
  'prosciutto': {
    it: 'Prosciutto Cotto',
    en: 'Italian Ham',
    th: 'แฮม',
    mm: 'ဝက်ပေါင်ခြောက် / ဟမ်',
    de: 'Italienischer Schinken'
  },
  'prosciutto cotto': {
    it: 'Prosciutto Cotto Italiano',
    en: 'Italian Cooked Ham',
    th: 'แฮมสุกอิตาเลียน',
    mm: 'အီတလီ ဝက်ပေါင်ခြောက်ပြုတ်',
    de: 'Italienischer Kochschinken'
  },
  'cotto': {
    it: 'Prosciutto Cotto',
    en: 'Cooked Ham',
    th: 'แฮมสุก',
    mm: 'ဟမ်',
    de: 'Kochschinken'
  },
  'prosciutto crudo': {
    it: 'Prosciutto Crudo di Parma',
    en: 'Parma Ham (Crudo)',
    th: 'พาร์มาแฮมดิบ',
    mm: 'ပါမာ ဝက်ပေါင်ခြောက်စိမ်း',
    de: 'Parma-Schinken (Crudo)'
  },
  'crudo': {
    it: 'Prosciutto Crudo',
    en: 'Parma Ham (Crudo)',
    th: 'พาร์มาแฮม',
    mm: 'ပါမာ ဟမ်',
    de: 'Rohschinken (Crudo)'
  },
  'prosciutto di parma': {
    it: 'Prosciutto di Parma DOP',
    en: 'Authentic Parma Ham DOP',
    th: 'พาร์มาแฮมแท้',
    mm: 'ပါမာ ဝက်ပေါင်ခြောက်စစ်စစ်',
    de: 'Echter Parma-Schinken'
  },
  'capocollo': {
    it: 'Capocollo Artigianale',
    en: 'Artisan Capocollo (Coppa)',
    th: 'คาโปคอลโล่ (แฮมสันคออิตาเลียน)',
    mm: 'ကာပိုကိုလို အီတလီ ဝက်လည်ပင်းသားခြောက်',
    de: 'Handwerklicher Capocollo'
  },
  'salame': {
    it: 'Salame Italiano',
    en: 'Italian Salami',
    th: 'ซาลามี่',
    mm: 'ဆာလာမီ အမဲ/ဝက်အူချောင်း',
    de: 'Italienische Salami'
  },
  'salame piccante': {
    it: 'Salame Piccante (Pepperoni)',
    en: 'Spicy Salami (Pepperoni)',
    th: 'เปปเปอโรนี่รสเผ็ด',
    mm: 'ငရုတ်ကောင်း ဆာလာမီ အစပ် (ပက်ပါရိုနီ)',
    de: 'Scharfe Salami (Pepperoni)'
  },
  'salame dolce': {
    it: 'Salame Dolce',
    en: 'Mild Salami',
    th: 'ซาลามี่รสกลมกล่อม',
    mm: 'ဆာလာမီ အရသာညင်သာ',
    de: 'Milde Salami'
  },
  'salame milano': {
    it: 'Salame Milano',
    en: 'Milano Salami',
    th: 'มิลาโนซาลามี่',
    mm: 'မီလာနို ဆာလာမီ',
    de: 'Mailänder Salami'
  },
  'salsiccia': {
    it: 'Salsiccia Fresca',
    en: 'Italian Fresh Sausage',
    th: 'ไส้กรอกหมูสดอิตาเลียน',
    mm: 'အီတလီ ဝက်အူချောင်းစိမ်း',
    de: 'Italienische Frische Bratwurst'
  },
  'salsiccia fresca': {
    it: 'Salsiccia Fresca',
    en: 'Italian Fresh Sausage',
    th: 'ไส้กรอกหมูสดอิตาเลียน',
    mm: 'အီတလီ ဝက်အူချောင်းလတ်လတ်ဆတ်ဆတ်',
    de: 'Italienische Frische Bratwurst'
  },
  'bacon': {
    it: 'Bacon Croccante',
    en: 'Crispy Bacon',
    th: 'เบคอนกรอบ',
    mm: 'ဘေကွန်ကြွပ်',
    de: 'Knuspriger Speck'
  },
  'pancetta': {
    it: 'Pancetta Italiana',
    en: 'Italian Pancetta',
    th: 'แพนเช็ตต้าหมูสามชั้นอิตาเลียน',
    mm: 'ဝက်သုံးထပ်သား အီတလီစတိုင်',
    de: 'Italienische Pancetta'
  },
  'guanciale': {
    it: 'Guanciale di Norcia',
    en: 'Guanciale (Cured Pork Jowl)',
    th: 'กวนชาเล่แก้มหมูอิตาเลียน',
    mm: 'ဝက်ပါးသားခြောက်',
    de: 'Guanciale (Schweinebacke)'
  },
  'speck': {
    it: 'Speck del Trentino',
    en: 'Smoked Speck Ham',
    th: 'สเปคแฮมรมควัน',
    mm: 'အမွှေးနံ့သာ ဝက်ပေါင်ခြောက်',
    de: 'Südtiroler Speck'
  },
  'bresaola': {
    it: 'Bresaola della Valtellina',
    en: 'Bresaola (Cured Beef)',
    th: 'เบรซาโอล่าเนื้อวัวแห้งอิตาเลียน',
    mm: 'ဘရီဆာအိုလာ အမဲသားခြောက်',
    de: 'Bresaola (Rinderschinken)'
  },
  'wurstel': {
    it: 'Wurstel',
    en: 'Vienna Sausage (Wurstel)',
    th: 'ไส้กรอกเวียนนา',
    mm: 'ဗီယင်နာ ဝက်အူချောင်း',
    de: 'Wiener Würstchen'
  },
  'pollo': {
    it: 'Pollo 100%',
    en: 'Chicken',
    th: 'เนื้อไก่',
    mm: 'ကြက်သား',
    de: 'Hähnchen'
  },
  'petto di pollo': {
    it: 'Petto di Pollo',
    en: 'Chicken Breast',
    th: 'อกไก่',
    mm: 'ကြက်ရင်အုံသား',
    de: 'Hähnchenbrust'
  },
  'manzo': {
    it: 'Manzo Scelto',
    en: 'Beef',
    th: 'เนื้อวัว',
    mm: 'အမဲသား',
    de: 'Rindfleisch'
  },
  'macinato': {
    it: 'Carne Macinata',
    en: 'Minced Meat',
    th: 'เนื้อบด',
    mm: 'အမဲ/ဝက် အသားကြိတ်',
    de: 'Hackfleisch'
  },
  'carne trita': {
    it: 'Carne Trita',
    en: 'Minced Meat',
    th: 'เนื้อบด',
    mm: 'အသားကြိတ်',
    de: 'Hackfleisch'
  },
  'nduja': {
    it: "'Nduja di Spilinga",
    en: "'Nduja Spicy Sausage",
    th: 'อันดูยาพริกซาลามี่เผ็ดคาลาเบรีย',
    mm: 'အန်ဒူယာ အစပ်ဆာလာမီ',
    de: "'Nduja Scharfe Streichwurst"
  },
  'mortadella': {
    it: 'Mortadella di Bologna IGP',
    en: 'Mortadella Bologna IGP',
    th: 'มอร์ทาเดลล่าแฮมอิตาเลียน',
    mm: 'မော်တာဒယ်လာ ဝက်ပေါင်ခြောက်',
    de: 'Mortadella Bologna'
  },

  // Seafood
  'tonno': {
    it: 'Tonno',
    en: 'Tuna',
    th: 'ปลาทูน่า',
    mm: 'တူနာငါး',
    de: 'Thunfisch'
  },
  'tonno sott\'olio': {
    it: 'Tonno all\'Olio di Oliva',
    en: 'Tuna in Olive Oil',
    th: 'ปลาทูน่าในน้ำมันมะกอก',
    mm: 'သံလွင်ဆီစိမ် တူနာငါး',
    de: 'Thunfisch in Olivenöl'
  },
  'acciughe': {
    it: 'Acciughe del Cantabrico',
    en: 'Anchovies',
    th: 'ปลาแอนโชวี่เค็ม',
    mm: 'ငါးနီတူဆားနယ်',
    de: 'Sardellen (Anchovis)'
  },
  'alici': {
    it: 'Alici',
    en: 'Anchovies',
    th: 'ปลาแอนโชวี่',
    mm: 'ငါးနီတူဆားနယ်',
    de: 'Sardellen'
  },
  'gamberi': {
    it: 'Gamberi Freschi',
    en: 'Fresh Prawns',
    th: 'กุ้งสด',
    mm: 'ပုစွန်လတ်လတ်ဆတ်ဆတ်',
    de: 'Frische Garnelen'
  },
  'gamberetti': {
    it: 'Gamberetti',
    en: 'Shrimps',
    th: 'กุ้งตัวเล็ก',
    mm: 'ပုစွန်ဆိတ်',
    de: 'Krabben / Shrimps'
  },
  'salmone': {
    it: 'Salmone Norvegese',
    en: 'Salmon',
    th: 'แซลมอน',
    mm: 'ဆယ်လမွန်ငါး',
    de: 'Lachs'
  },
  'salmone affumicato': {
    it: 'Salmone Affumicato',
    en: 'Smoked Salmon',
    th: 'แซลมอนรมควัน',
    mm: 'ဆယ်လမွန်ငါး အခိုးအငွေ့ကျက်',
    de: 'Räucherlachs'
  },
  'calamari': {
    it: 'Calamari Freschi',
    en: 'Squid / Calamari',
    th: 'ปลาหมึก',
    mm: 'ပြည်ကြီးငါး',
    de: 'Tintenfisch (Calamari)'
  },
  'cozze': {
    it: 'Cozze Fresche',
    en: 'Mussels',
    th: 'หอยแมลงภู่',
    mm: 'ယောက်သွားခွံနက်',
    de: 'Miesmuscheln'
  },
  'vongole': {
    it: 'Vongole Veraci',
    en: 'Clams',
    th: 'หอยตลับ',
    mm: 'ယောက်သွားခွံဖြူ',
    de: 'Venusmuscheln'
  },
  'frutti di mare': {
    it: 'Frutti di Mare Scelti',
    en: 'Seafood Mix',
    th: 'อาหารทะเลรวม',
    mm: 'ပင်လယ်စာ အစုံ',
    de: 'Meeresfrüchte-Mischung'
  },
  'polpa di granchio': {
    it: 'Polpa di Granchio Fresca',
    en: 'Fresh Crab Meat',
    th: 'เนื้อปูม้าสด',
    mm: 'ဂဏန်းသား အသားစစ်စစ်',
    de: 'Frisches Krabbenfleisch'
  },

  // Vegetables, Nuts & Herbs
  'funghi': {
    it: 'Funghi Champignon Freschi',
    en: 'Fresh Mushrooms',
    th: 'เห็ดแชมปิญองสด',
    mm: 'မှိုလတ်လတ်ဆတ်ဆတ်',
    de: 'Frische Champignons'
  },
  'funghi freschi': {
    it: 'Funghi Freschi',
    en: 'Fresh Mushrooms',
    th: 'เห็ดสด',
    mm: 'မှိုလတ်လတ်ဆတ်ဆတ်',
    de: 'Frische Pilze'
  },
  'funghi porcini': {
    it: 'Funghi Porcini',
    en: 'Porcini Mushrooms',
    th: 'เห็ดพอร์ชินี่',
    mm: 'ပေါ်ချီနီ မှိုမွှေး',
    de: 'Steinpilze (Porcini)'
  },
  'porcini': {
    it: 'Funghi Porcini',
    en: 'Porcini Mushrooms',
    th: 'เห็ดพอร์ชินี่',
    mm: 'ပေါ်ချီနီ မှိုမွှေး',
    de: 'Steinpilze'
  },
  'tartufo': {
    it: 'Tartufo Nero',
    en: 'Black Truffle',
    th: 'เห็ดทรัฟเฟิลดำ',
    mm: 'ထရက်ဖယ်လ် မှိုမည်း',
    de: 'Schwarzer Trüffel'
  },
  'olio al tartufo': {
    it: 'Olio al Tartufo',
    en: 'Truffle Oil',
    th: 'น้ำมันเห็ดทรัฟเฟิล',
    mm: 'ထရက်ဖယ်လ် အမွှေးဆီ',
    de: 'Trüffelöl'
  },
  'anacardi': {
    it: 'Anacardi Tostati',
    en: 'Roasted Cashews',
    th: 'เม็ดมะม่วงหิมพานต์คั่ว',
    mm: 'သီဟိုဠ်စေ့လှော်',
    de: 'Geröstete Cashewnüsse'
  },
  'noci': {
    it: 'Noci',
    en: 'Walnuts',
    th: 'วอลนัท',
    mm: 'သစ်ကြားသီး',
    de: 'Walnüsse'
  },
  'pomodoro': {
    it: 'Pomodoro',
    en: 'Tomato',
    th: 'มะเขือเทศ',
    mm: 'ခရမ်းချဉ်သီး',
    de: 'Tomate'
  },
  'pomodorini': {
    it: 'Pomodorini Ciliegino',
    en: 'Cherry Tomatoes',
    th: 'มะเขือเทศราชินีสด',
    mm: 'ချယ်ရီ ခရမ်းချဉ်သီး',
    de: 'Kirschtomaten'
  },
  'pomodori secchi': {
    it: 'Pomodori Secchi',
    en: 'Sun-Dried Tomatoes',
    th: 'มะเขือเทศอบแห้ง',
    mm: 'ခရမ်းချဉ်သီးခြောက်',
    de: 'Getrocknete Tomaten'
  },
  'salsa pomodoro': {
    it: 'Salsa di Pomodoro',
    en: 'Tomato Sauce',
    th: 'ซอสมะเขือเทศเข้มข้น',
    mm: 'ခရမ်းချဉ်သီးဆော့စ်',
    de: 'Tomatensauce'
  },
  'olive': {
    it: 'Olive',
    en: 'Olives',
    th: 'มะกอก',
    mm: 'သံလွင်သီး',
    de: 'Oliven'
  },
  'olive nere': {
    it: 'Olive Nere',
    en: 'Black Olives',
    th: 'มะกอกดำ',
    mm: 'သံလွင်သီး အမည်း',
    de: 'Schwarze Oliven'
  },
  'olive verdi': {
    it: 'Olive Verdi',
    en: 'Green Olives',
    th: 'มะกอกเขียว',
    mm: 'သံလွင်သီး အစိမ်း',
    de: 'Grüne Oliven'
  },
  'capperi': {
    it: 'Capperi di Pantelleria',
    en: 'Capers',
    th: 'เคเปอร์',
    mm: 'ကေပါ အစေ့ချဉ်',
    de: 'Kapern'
  },
  'carciofi': {
    it: 'Carciofi alla Romana',
    en: 'Artichokes',
    th: 'อาร์ติโชก',
    mm: 'အာတီချုတ် ပန်းဖူး',
    de: 'Artischocken'
  },
  'cipolla': {
    it: 'Cipolla',
    en: 'Onion',
    th: 'หอมใหญ่',
    mm: 'ကြက်သွန်နီကြီး',
    de: 'Zwiebel'
  },
  'cipolla rossa': {
    it: 'Cipolla Rossa di Tropea',
    en: 'Red Onion',
    th: 'หอมแดง',
    mm: 'ကြက်သွန်နီနီ',
    de: 'Rote Zwiebel'
  },
  'peperoni': {
    it: 'Peperoni Grigliati',
    en: 'Grilled Bell Peppers',
    th: 'พริกหวานย่าง',
    mm: 'ငရုတ်ပွကင်',
    de: 'Gegrillte Paprika'
  },
  'peperoncino': {
    it: 'Peperoncino Piccante',
    en: 'Fresh Hot Chili',
    th: 'พริกเผ็ดสด',
    mm: 'ငရုတ်သီးစိမ်းစပ်',
    de: 'Scharfe Peperoni / Chili'
  },
  'peperoncino fresco': {
    it: 'Peperoncino Fresco',
    en: 'Fresh Hot Chili',
    th: 'พริกสดเผ็ด',
    mm: 'ငရုတ်သီးစိမ်းလတ်လတ်ဆတ်ဆတ်',
    de: 'Frische Peperoni'
  },
  'olio piccante': {
    it: 'Olio al Peperoncino Piccante',
    en: 'Spicy Chili Oil',
    th: 'น้ำมันพริกเผ็ด',
    mm: 'ငရုတ်သီးစပ်ဆီ',
    de: 'Scharfes Chiliöl'
  },
  'melanzane': {
    it: 'Melanzane Grigliate',
    en: 'Grilled Eggplants',
    th: 'มะเขือม่วงย่าง',
    mm: 'ခရမ်းသီးကင်',
    de: 'Gegrillte Auberginen'
  },
  'zucchine': {
    it: 'Zucchine Grigliate',
    en: 'Grilled Zucchini',
    th: 'ซูกินีย่าง',
    mm: 'ကျောက်ဖရုံသီးကင်',
    de: 'Gegrillte Zucchini'
  },
  'rucola': {
    it: 'Rucola Fresca',
    en: 'Fresh Rocket Salad',
    th: 'ผักร็อคเก็ตสด',
    mm: 'ရော့ကက် ရွက်စိမ်း',
    de: 'Frischer Rucola'
  },
  'spinaci': {
    it: 'Spinaci Freschi',
    en: 'Spinach',
    th: 'ผักโขม',
    mm: 'ဟင်းနုနွယ်ရွက်',
    de: 'Spinat'
  },
  'basilico': {
    it: 'Basilico Fresco',
    en: 'Fresh Basil',
    th: 'ใบโหระพาอิตาเลียน',
    mm: 'ပင်စိမ်းလတ်လတ်ဆတ်ဆတ်',
    de: 'Frisches Basilikum'
  },
  'origano': {
    it: 'Origano',
    en: 'Oregano',
    th: 'ออริกาโน่',
    mm: 'အော်ရီဂါနို အမွှေးရွက်',
    de: 'Oregano'
  },
  'aglio': {
    it: 'Aglio',
    en: 'Garlic',
    th: 'กระเทียมสด',
    mm: 'ကြက်သွန်ဖြူ',
    de: 'Knoblauch'
  },
  'prezzemolo': {
    it: 'Prezzemolo Fresco',
    en: 'Fresh Parsley',
    th: 'พาร์สลีย์สด',
    mm: 'တရုတ်နံနံ / ပါစလေ',
    de: 'Frische Petersilie'
  },
  'rosmarino': {
    it: 'Rosmarino',
    en: 'Rosemary',
    th: 'โรสแมรี่',
    mm: 'ရို့စ်မေရီ အမွှေးရွက်',
    de: 'Rosmarin'
  },
  'ananas': {
    it: 'Ananas Fresco',
    en: 'Pineapple',
    th: 'สับปะรด',
    mm: 'နာနတ်သီး',
    de: 'Ananas'
  },
  'mais': {
    it: 'Mais Dolce',
    en: 'Sweet Corn',
    th: 'ข้าวโพดหวาน',
    mm: 'ပြောင်းဖူးချို',
    de: 'Mais'
  },
  'patate': {
    it: 'Patate al Forno',
    en: 'Potatoes',
    th: 'มันฝรั่ง',
    mm: 'အာလူး',
    de: 'Kartoffeln'
  },
  'patatine': {
    it: 'Patatine Fritte Croccanti',
    en: 'French Fries',
    th: 'เฟรนช์ฟรายส์',
    mm: 'အာလူးချောင်းကြော်',
    de: 'Pommes Frites'
  },
  'patatine fritte': {
    it: 'Patatine Fritte Croccanti',
    en: 'French Fries',
    th: 'เฟรนช์ฟรายส์กรอบ',
    mm: 'အာလူးချောင်းကြော်',
    de: 'Pommes Frites'
  },
  'french fries': {
    it: 'Patatine Fritte',
    en: 'French Fries',
    th: 'เฟรนช์ฟรายส์กรอบ',
    mm: 'အာလူးချောင်းကြော်',
    de: 'Pommes Frites'
  },

  // Eggs & Sauces
  'uovo': {
    it: 'Uovo Fresco',
    en: 'Egg',
    th: 'ไข่ไก่สด',
    mm: 'ကြက်ဥ',
    de: 'Ei'
  },
  'uovo sodo': {
    it: 'Uovo Sodo',
    en: 'Boiled Egg',
    th: 'ไข่ต้ม',
    mm: 'ကြက်ဥပြုတ်',
    de: 'Gekochtes Ei'
  },
  'uovo all\'occhio': {
    it: 'Uovo all\'Occhio di Bue',
    en: 'Fried Egg',
    th: 'ไข่ดาว',
    mm: 'ကြက်ဥကြော် မကျက်တကျက်',
    de: 'Spiegelei'
  },
  'pesto': {
    it: 'Pesto Genovese Fresco',
    en: 'Basil Pesto Sauce',
    th: 'ซอสเพสโต้ใบโหระพา',
    mm: 'ပင်စိမ်းဆော့စ်စိမ်း',
    de: 'Basilikum-Pesto'
  },
  'pesto genovese': {
    it: 'Pesto Genovese',
    en: 'Genoese Basil Pesto',
    th: 'ซอสเพสโต้เจโนเวเซ่',
    mm: 'ပင်စိမ်းဆော့စ်စိမ်း',
    de: 'Genueser Pesto'
  },
  'panna': {
    it: 'Panna Fresca',
    en: 'Fresh Cream',
    th: 'ครีมสด',
    mm: 'နို့ခရင်မ်စစ်စစ်',
    de: 'Frische Sahne'
  },
  'maionese': {
    it: 'Maionese',
    en: 'Mayonnaise',
    th: 'มายองเนส',
    mm: 'မရိုနိစ်',
    de: 'Mayonnaise'
  },
  'ketchup': {
    it: 'Ketchup',
    en: 'Ketchup',
    th: 'ซอสมะเขือเทศ',
    mm: 'ခရမ်းချဉ်သီးဆော့စ်ချို',
    de: 'Ketchup'
  },
  'salsa bbq': {
    it: 'Salsa Barbecue',
    en: 'BBQ Sauce',
    th: 'ซอสบาร์บีคิว',
    mm: 'ဘီဘီကျူးဆော့စ်',
    de: 'BBQ-Sauce'
  },
  'bbq sauce': {
    it: 'Salsa Barbecue',
    en: 'BBQ Sauce',
    th: 'ซอสบาร์บีคิว',
    mm: 'ဘီဘီကျူးဆော့စ်',
    de: 'BBQ-Sauce'
  },
  'salsa tartara': {
    it: 'Salsa Tartara',
    en: 'Tartar Sauce',
    th: 'ซอสทาร์ทาร์',
    mm: 'တာတာဆော့စ်',
    de: 'Remoulade / Tartarsauce'
  },
  'senape': {
    it: 'Senape',
    en: 'Mustard',
    th: 'มัสตาร์ด',
    mm: 'မုန်ညင်းဆော့စ်',
    de: 'Senf'
  },
  'tabasco': {
    it: 'Tabasco',
    en: 'Tabasco Sauce',
    th: 'ทาบาสโก้',
    mm: 'တာဘက်စ်ကို ဆော့စ်စပ်',
    de: 'Tabasco'
  },
  'olio evo': {
    it: 'Olio Extra Vergine di Oliva',
    en: 'Extra Virgin Olive Oil',
    th: 'น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น',
    mm: 'သံလွင်ဆီစစ်စစ်',
    de: 'Natives Olivenöl Extra'
  },
  'aceto balsamico': {
    it: 'Aceto Balsamico di Modena',
    en: 'Balsamic Glaze / Vinegar',
    th: 'น้ำส้มสายชูบัลซามิก',
    mm: 'ဘယ်လ်ဆာမစ်ရှာလကာရည်',
    de: 'Balsamico-Essig'
  },
  'crema di tartufo': {
    it: 'Crema di Tartufo Nero',
    en: 'Truffle Cream',
    th: 'ครีมเห็ดทรัฟเฟิล',
    mm: 'ထရက်ဖယ်လ် ခရင်မ်ဆော့စ်',
    de: 'Trüffelcreme'
  },

  // Variants, Sizes & Formats
  'normale': {
    it: 'Misura Normale (33 cm)',
    en: 'Normal Size (33cm)',
    th: 'ขนาดปกติ (33 ซม.)',
    mm: 'ပုံမှန်အရွယ်အစား (၃၃ စင်တီမီတာ)',
    de: 'Normale Größe (33cm)'
  },
  'standard': {
    it: 'Standard',
    en: 'Standard',
    th: 'ขนาดมาตรฐาน',
    mm: 'စံအရွယ်အစား',
    de: 'Standard'
  },
  'baby': {
    it: 'Misura Baby (24 cm)',
    en: 'Baby Size (24cm)',
    th: 'ขนาดเล็กสำหรับเด็ก (24 ซม.)',
    mm: 'ကလေးအရွယ်အစား (၂၄ စင်တီမီတာ)',
    de: 'Baby-Größe (24cm)'
  },
  'maxi': {
    it: 'Misura Maxi (45 cm)',
    en: 'Maxi Size (45cm)',
    th: 'ขนาดใหญ่พิเศษ (45 ซม.)',
    mm: 'အထူးအရွယ်အစားကြီး (၄၅ စင်တီမီတာ)',
    de: 'Maxi-Größe (45cm)'
  },
  'famiglia': {
    it: 'Misura Famiglia',
    en: 'Family Size',
    th: 'ขนาดครอบครัว',
    mm: 'မိသားစုအရွယ်အစား',
    de: 'Familien-Größe'
  },
  'calzone': {
    it: 'Ripieno Calzone Chiuso',
    en: 'Calzone Folded',
    th: 'แบบพับ (คาลโซเน่)',
    mm: 'ခေါက်ထားသော ပီဇာ (ကယ်လ်ဇိုနီ)',
    de: 'Gefaltete Calzone'
  },
  'calice': {
    it: 'Calice',
    en: 'By the Glass',
    th: 'แก้ว',
    mm: 'ဖန်ခွက်',
    de: 'Glas'
  },
  'bottiglia': {
    it: 'Bottiglia Intera',
    en: 'Whole Bottle',
    th: 'ขวด',
    mm: 'ပုလင်း',
    de: 'Flasche'
  },
  'doppio impasto': {
    it: 'Doppio Impasto Soffice',
    en: 'Double Thick Dough',
    th: 'แป้งหนานุ่ม 2 เท่า',
    mm: 'မုန့်သားအထူ ၂ ဆ',
    de: 'Doppelter Dicker Teig'
  },
  'senza glutine': {
    it: 'Impasto Senza Glutine',
    en: 'Gluten Free Dough',
    th: 'แป้งปลอดกลูเตน',
    mm: 'ဂလူတန်မပါသော မုန့်သား',
    de: 'Glutenfreier Teig'
  },
  'gluten free': {
    it: 'Senza Glutine',
    en: 'Gluten Free',
    th: 'ปลอดกลูเตน',
    mm: 'ဂလူတန်မပါဝင်ပါ',
    de: 'Glutenfrei'
  },
  'integrale': {
    it: 'Impasto Farina Integrale',
    en: 'Whole Wheat Dough',
    th: 'แป้งโฮลวีท',
    mm: 'ဂျုံကြမ်း မုန့်သား',
    de: 'Vollkornteig'
  },
  'ben cotta': {
    it: 'Cottura Ben Cotta / Croccante',
    en: 'Well Done / Crispy',
    th: 'อบกรอบพิเศษ',
    mm: 'အထူး ကြွပ်ရွအောင် ဖုတ်ပါ',
    de: 'Gut Durchgebacken / Knusprig'
  },
  'poco cotta': {
    it: 'Cottura Poco Cotta / Morbida',
    en: 'Lightly Baked / Soft',
    th: 'อบนุ่มพอดี',
    mm: 'နူးညံ့အောင် ဖုတ်ပါ',
    de: 'Leicht Gebacken / Weich'
  },
  'tagliata a fette': {
    it: 'Tagliata a Fette',
    en: 'Sliced',
    th: 'ตัดแบ่งชิ้นพร้อมทาน',
    mm: 'အချပ်လိုက် ဖြတ်ပေးပါ',
    de: 'Geschnitten'
  },
  'non tagliata': {
    it: 'Non Tagliata',
    en: 'Not Sliced',
    th: 'ไม่ตัดเป็นชิ้น',
    mm: 'အချပ် မဖြတ်ပါနှင့်',
    de: 'Ungeschnitten'
  },

  // Dietary Specials
  '100% pollo': {
    it: '100% Pollo (Halal)',
    en: '100% Chicken (Halal-friendly)',
    th: 'เนื้อไก่ 100% (ฮาลาล)',
    mm: 'ကြက်သား ၁၀၀% (ဟလာလ်)',
    de: '100% Hähnchen (Halal)'
  },
  'halal chicken': {
    it: '100% Pollo (Halal)',
    en: '100% Chicken (Halal-friendly)',
    th: 'เนื้อไก่ 100% (ฮาลาล)',
    mm: 'ကြက်သား ၁၀၀% (ဟလာလ်)',
    de: '100% Hähnchen (Halal)'
  },
  'no maiale': {
    it: 'Senza Maiale',
    en: 'No Pork',
    th: 'ไม่ใส่เนื้อหมู',
    mm: 'ဝက်သားမပါပါ',
    de: 'Ohne Schweinefleisch'
  },
  'veggie': {
    it: 'Vegetariano',
    en: 'Vegetarian',
    th: 'มังสวิรัติ',
    mm: 'သက်သတ်လွတ် (နို့ထွက်ပစ္စည်းပါ)',
    de: 'Vegetarisch'
  },
  'vegan': {
    it: 'Vegano 100%',
    en: '100% Vegan',
    th: 'เจ / วีแกน 100%',
    mm: 'သက်သတ်လွတ် ၁၀၀%',
    de: '100% Vegan'
  },

  // Spiciness Levels
  'spicy-no': {
    it: 'Non Piccante (0%)',
    en: 'Not Spicy (0%)',
    th: 'ไม่เผ็ด (0%)',
    mm: 'မစပ်ပါ (၀%)',
    de: 'Nicht Scharf (0%)'
  },
  'non piccante': {
    it: 'Non Piccante (0%)',
    en: 'Not Spicy (0%)',
    th: 'ไม่เผ็ด (0%)',
    mm: 'မစပ်ပါ (၀%)',
    de: 'Nicht Scharf (0%)'
  },
  'not spicy': {
    it: 'Non Piccante (0%)',
    en: 'Not Spicy (0%)',
    th: 'ไม่เผ็ด (0%)',
    mm: 'မစပ်ပါ (၀%)',
    de: 'Nicht Scharf (0%)'
  },
  'spicy-light': {
    it: 'Poco Piccante 🌶️',
    en: 'Mild Spicy 🌶️',
    th: 'เผ็ดน้อย 🌶️',
    mm: 'အစပ်နည်းနည်း 🌶️',
    de: 'Leicht Scharf 🌶️'
  },
  'poco piccante': {
    it: 'Poco Piccante 🌶️',
    en: 'Mild Spicy 🌶️',
    th: 'เผ็ดน้อย 🌶️',
    mm: 'အစပ်နည်းနည်း 🌶️',
    de: 'Leicht Scharf 🌶️'
  },
  'mild spicy': {
    it: 'Poco Piccante 🌶️',
    en: 'Mild Spicy 🌶️',
    th: 'เผ็ดน้อย 🌶️',
    mm: 'အစပ်နည်းနည်း 🌶️',
    de: 'Leicht Scharf 🌶️'
  },
  'spicy-medium': {
    it: 'Medio Piccante 🌶️🌶️',
    en: 'Medium Spicy 🌶️🌶️',
    th: 'เผ็ดปานกลาง 🌶️🌶️',
    mm: 'အစပ်အလယ်အလတ် 🌶️🌶️',
    de: 'Mittelscharf 🌶️🌶️'
  },
  'medio piccante': {
    it: 'Medio Piccante 🌶️🌶️',
    en: 'Medium Spicy 🌶️🌶️',
    th: 'เผ็ดปานกลาง 🌶️🌶️',
    mm: 'အစပ်အလယ်အလတ် 🌶️🌶️',
    de: 'Mittelscharf 🌶️🌶️'
  },
  'medium spicy': {
    it: 'Medio Piccante 🌶️🌶️',
    en: 'Medium Spicy 🌶️🌶️',
    th: 'เผ็ดปานกลาง 🌶️🌶️',
    mm: 'အစပ်အလယ်အလတ် 🌶️🌶️',
    de: 'Mittelscharf 🌶️🌶️'
  },
  'spicy-very': {
    it: 'Molto Piccante 🔥🌶️',
    en: 'Very Spicy 🔥🌶️',
    th: 'เผ็ดมาก 🔥🌶️',
    mm: 'အစပ်အလွန်များ 🔥🌶️',
    de: 'Sehr Scharf 🔥🌶️'
  },
  'molto piccante': {
    it: 'Molto Piccante 🔥🌶️',
    en: 'Very Spicy 🔥🌶️',
    th: 'เผ็ดมาก 🔥🌶️',
    mm: 'အစပ်အလွန်များ 🔥🌶️',
    de: 'Sehr Scharf 🔥🌶️'
  },
  'very spicy': {
    it: 'Molto Piccante 🔥🌶️',
    en: 'Very Spicy 🔥🌶️',
    th: 'เผ็ดมาก 🔥🌶️',
    mm: 'အစပ်အလွန်များ 🔥🌶️',
    de: 'Sehr Scharf 🔥🌶️'
  },

  // Sugar / Sweetness Levels
  'sugar-no': {
    it: 'Senza Zucchero (0%)',
    en: 'No Sugar (0%)',
    th: 'ไม่ใส่น้ำตาล (0%)',
    mm: 'သကြားမပါ (၀%)',
    de: 'Ohne Zucker (0%)'
  },
  'senza zucchero': {
    it: 'Senza Zucchero (0%)',
    en: 'No Sugar (0%)',
    th: 'ไม่ใส่น้ำตาล (0%)',
    mm: 'သကြားမပါ (၀%)',
    de: 'Ohne Zucker (0%)'
  },
  'no sugar': {
    it: 'Senza Zucchero (0%)',
    en: 'No Sugar (0%)',
    th: 'ไม่ใส่น้ำตาล (0%)',
    mm: 'သကြားမပါ (၀%)',
    de: 'Ohne Zucker (0%)'
  },
  'sugar-less': {
    it: 'Poco Dolce (50%)',
    en: 'Less Sugar (50%)',
    th: 'หวานน้อย (50%)',
    mm: 'သကြားနည်း (၅၀%)',
    de: 'Weniger Zucker (50%)'
  },
  'poco dolce': {
    it: 'Poco Dolce (50%)',
    en: 'Less Sugar (50%)',
    th: 'หวานน้อย (50%)',
    mm: 'သကြားနည်း (၅၀%)',
    de: 'Weniger Zucker (50%)'
  },
  'less sugar': {
    it: 'Poco Dolce (50%)',
    en: 'Less Sugar (50%)',
    th: 'หวานน้อย (50%)',
    mm: 'သကြားနည်း (၅၀%)',
    de: 'Weniger Zucker (50%)'
  },
  'sugar-regular': {
    it: 'Dolce Normale (100%)',
    en: 'Normal Sweet (100%)',
    th: 'หวานปกติ (100%)',
    mm: 'ပုံမှန်ချိုသည် (၁၀၀%)',
    de: 'Normale Süße (100%)'
  },
  'dolce normale': {
    it: 'Dolce Normale (100%)',
    en: 'Normal Sweet (100%)',
    th: 'หวานปกติ (100%)',
    mm: 'ပုံမှန်ချိုသည် (၁၀၀%)',
    de: 'Normale Süße (100%)'
  },
  'normal sweet': {
    it: 'Dolce Normale (100%)',
    en: 'Normal Sweet (100%)',
    th: 'หวานปกติ (100%)',
    mm: 'ပုံမှန်ချိုသည် (၁၀၀%)',
    de: 'Normale Süße (100%)'
  },

  // Sauces & Condiments
  'sauce-none': {
    it: 'Senza Salsa',
    en: 'No Sauce',
    th: 'ไม่ใส่ซอส',
    mm: 'ဆော့စ်မပါ',
    de: 'Ohne Sauce'
  },
  'sauce-ketchup': {
    it: 'Ketchup',
    en: 'Ketchup',
    th: 'ซอสมะเขือเทศ',
    mm: 'ခရမ်းချဉ်သီးဆော့စ်',
    de: 'Ketchup'
  },
  'sauce-mayo': {
    it: 'Maionese',
    en: 'Mayonnaise',
    th: 'มายองเนส',
    mm: 'မေယိုနိစ်',
    de: 'Mayonnaise'
  },
  'sauce-chili': {
    it: 'Salsa Piccante',
    en: 'Chili Sauce',
    th: 'ซอสพริก',
    mm: 'ငရုတ်သီးဆော့စ်',
    de: 'Chilisauce'
  },
  'sauce-bbq': {
    it: 'Salsa Barbecue',
    en: 'BBQ Sauce',
    th: 'ซอสบาร์บีคิว',
    mm: 'ဘီဘီကျူးဆော့စ်',
    de: 'BBQ-Sauce'
  },

  // Fruits for Smoothies & Shakes
  'fruit-watermelon': {
    it: 'Anguria Fresca',
    en: 'Fresh Watermelon',
    th: 'แตงโมสด',
    mm: 'လတ်ဆတ်သော ဖရဲသီး',
    de: 'Frische Wassermelone'
  },
  'fruit-pineapple': {
    it: 'Ananas Fresco',
    en: 'Fresh Pineapple',
    th: 'สับปะรดสด',
    mm: 'လတ်ဆတ်သော နာနတ်သီး',
    de: 'Frische Ananas'
  },
  'fruit-banana': {
    it: 'Banana Fresca',
    en: 'Fresh Banana',
    th: 'กล้วยหอมสด',
    mm: 'လတ်ဆတ်သော ငှက်ပျောသီး',
    de: 'Frische Banane'
  },
  'fruit-papaya': {
    it: 'Papaya Fresca',
    en: 'Fresh Papaya',
    th: 'มะละกอสุกสด',
    mm: 'လတ်ဆတ်သော သင်္ဘောသီး',
    de: 'Frische Papaya'
  },
  'fruit-lime': {
    it: 'Lime / Limone Fresco',
    en: 'Fresh Lime',
    th: 'มะนาวสด',
    mm: 'လတ်ဆတ်သော သံပရာသီး',
    de: 'Frische Limette'
  },
  'fruit-coconut': {
    it: 'Cocco Fresco',
    en: 'Fresh Coconut',
    th: 'มะพร้าวสด',
    mm: 'လတ်ဆတ်သော အုန်းသီး',
    de: 'Frische Kokosnuss'
  },
  'fruit-mango': {
    it: 'Mango Fresco',
    en: 'Fresh Mango',
    th: 'มะม่วงสุกสด',
    mm: 'လတ်ဆတ်သော သရက်သီး',
    de: 'Frische Mango'
  },

  // Pasta Formats
  'format-spaghetti': {
    it: 'Spaghetti',
    en: 'Spaghetti',
    th: 'เส้นสปาเก็ตตี้',
    mm: 'စပါဂက်တီ ခေါက်ဆွဲ',
    de: 'Spaghetti'
  },
  'format-penne': {
    it: 'Penne Rigate',
    en: 'Penne Pasta',
    th: 'เส้นเพนเน่',
    mm: 'ပန်နီ ခေါက်ဆွဲ',
    de: 'Penne Rigate'
  },
  'format-tagliatelle': {
    it: 'Tagliatelle all\'Uovo',
    en: 'Egg Tagliatelle',
    th: 'เส้นตัลยาเตลเล่ไข่',
    mm: 'တာလီယာတယ်လီ ကြက်ဥခေါက်ဆွဲ',
    de: 'Ei-Tagliatelle'
  },
  'format-fettuccine': {
    it: 'Fettuccine',
    en: 'Fettuccine',
    th: 'เส้นเฟตตูชินี',
    mm: 'ဖက်တူချီနီ ခေါက်ဆွဲ',
    de: 'Fettuccine'
  },
  'format-gnocchi': {
    it: 'Gnocchi di Patate',
    en: 'Potato Gnocchi',
    th: 'ย็อกกี้มันฝรั่ง',
    mm: 'အာလူး ညော့ကီ',
    de: 'Kartoffel-Gnocchi'
  },
  'format-ravioli': {
    it: 'Ravioli Artigianali',
    en: 'Artisan Ravioli',
    th: 'ราวิโอลี่โฮมเมด',
    mm: 'ရာဗီအိုလီ အီတလီအစာသွပ်',
    de: 'Hausgemachte Ravioli'
  },

  // Sizes & Split Formats
  '8"': {
    it: '8" (Mini)',
    en: '8" (Mini)',
    th: '8 นิ้ว (มินิ)',
    mm: '၈ လက်မ (အသေး)',
    de: '8" (Mini)'
  },
  '8': {
    it: '8" (Mini)',
    en: '8" (Mini)',
    th: '8 นิ้ว (มินิ)',
    mm: '၈ လက်မ (အသေး)',
    de: '8" (Mini)'
  },
  'variant-8': {
    it: '8" (Mini)',
    en: '8" (Mini)',
    th: '8 นิ้ว (มินิ)',
    mm: '၈ လက်မ (အသေး)',
    de: '8" (Mini)'
  },
  '12"': {
    it: '12" (Standard)',
    en: '12" (Standard)',
    th: '12 นิ้ว (ขนาดมาตรฐาน)',
    mm: '၁၂ လက်မ (စံအရွယ်အစား)',
    de: '12" (Standard)'
  },
  '12': {
    it: '12" (Standard)',
    en: '12" (Standard)',
    th: '12 นิ้ว (ขนาดมาตรฐาน)',
    mm: '၁၂ လက်မ (စံအရွယ်အစား)',
    de: '12" (Standard)'
  },
  'variant-12': {
    it: '12" (Standard)',
    en: '12" (Standard)',
    th: '12 นิ้ว (ขนาดมาตรฐาน)',
    mm: '၁၂ လက်မ (စံအရွယ်အစား)',
    de: '12" (Standard)'
  },
  'variant-half-half': {
    it: '12" Metà & Metà',
    en: '12" Half & Half',
    th: '12" ฮาล์ฟ & ฮาล์ฟ',
    mm: '၁၂" နှစ်မျိုးစပ်',
    de: '12" Halb & Halb'
  },
  'half-half': {
    it: '12" Metà & Metà',
    en: '12" Half & Half',
    th: '12" ฮาล์ฟ & ฮาล์ฟ',
    mm: '၁၂" နှစ်မျိုးစပ်',
    de: '12" Halb & Halb'
  }
};

/**
 * Universal Extra / Topping resolver for Kitchen Monitor
 */
export function resolveExtraDisplayName(extra: any, targetLang: KdsLanguage): string {
  if (!extra) return '';
  const langKey = targetLang === 'mm' ? 'mm' : targetLang === 'th' ? 'th' : targetLang === 'it' ? 'it' : targetLang === 'de' ? 'de' : 'en';

  if (typeof extra === 'object') {
    // If exact language field is directly available on the object
    if (langKey === 'th' && extra.nameTh && typeof extra.nameTh === 'string' && extra.nameTh.trim()) {
      return extra.nameTh.trim();
    }
    if (langKey === 'en' && (extra.nameEn || extra.name) && typeof (extra.nameEn || extra.name) === 'string' && (extra.nameEn || extra.name).trim()) {
      return (extra.nameEn || extra.name).trim();
    }
    if (langKey === 'it' && (extra.nameIt || extra.name_it) && typeof (extra.nameIt || extra.name_it) === 'string') {
      return (extra.nameIt || extra.name_it).trim();
    }
    if (langKey === 'de' && (extra.nameDe || extra.name_de) && typeof (extra.nameDe || extra.name_de) === 'string') {
      return (extra.nameDe || extra.name_de).trim();
    }
    if (langKey === 'mm' && (extra.nameMm || extra.name_mm) && typeof (extra.nameMm || extra.name_mm) === 'string') {
      return (extra.nameMm || extra.name_mm).trim();
    }

    const candId = String(extra.id || '').trim().toLowerCase();
    if (candId && KDS_EXTRA_DICTIONARY[candId]) {
      return KDS_EXTRA_DICTIONARY[candId][langKey] || KDS_EXTRA_DICTIONARY[candId].en;
    }

    const candName = String(extra.name || extra.nameIt || extra.name_it || '').trim().toLowerCase();
    if (candName && KDS_EXTRA_DICTIONARY[candName]) {
      return KDS_EXTRA_DICTIONARY[candName][langKey] || KDS_EXTRA_DICTIONARY[candName].en;
    }

    return String(extra.name || extra.nameIt || (langKey === 'th' ? 'พิเศษ' : langKey === 'it' ? 'Extra' : 'Extra'));
  }

  const str = String(extra).trim().toLowerCase();
  if (KDS_EXTRA_DICTIONARY[str]) {
    return KDS_EXTRA_DICTIONARY[str][langKey] || KDS_EXTRA_DICTIONARY[str].en;
  }
  return String(extra).trim();
}

/**
 * Universal Variant / Format resolver for Kitchen Monitor
 */
export function resolveVariantDisplayName(variant: any, targetLang: KdsLanguage): string {
  if (!variant) return '';
  const langKey = targetLang === 'mm' ? 'mm' : targetLang === 'th' ? 'th' : targetLang === 'it' ? 'it' : targetLang === 'de' ? 'de' : 'en';

  if (typeof variant === 'object') {
    if (langKey === 'th' && variant.nameTh && typeof variant.nameTh === 'string' && variant.nameTh.trim()) {
      return variant.nameTh.trim();
    }
    if (langKey === 'en' && (variant.nameEn || variant.name) && typeof (variant.nameEn || variant.name) === 'string' && (variant.nameEn || variant.name).trim()) {
      return (variant.nameEn || variant.name).trim();
    }
    if (langKey === 'it' && (variant.nameIt || variant.name_it) && typeof (variant.nameIt || variant.name_it) === 'string') {
      return (variant.nameIt || variant.name_it).trim();
    }
    if (langKey === 'de' && (variant.nameDe || variant.name_de) && typeof (variant.nameDe || variant.name_de) === 'string') {
      return (variant.nameDe || variant.name_de).trim();
    }
    if (langKey === 'mm' && (variant.nameMm || variant.name_mm) && typeof (variant.nameMm || variant.name_mm) === 'string') {
      return (variant.nameMm || variant.name_mm).trim();
    }

    const candId = String(variant.id || '').trim().toLowerCase();
    if (candId && KDS_EXTRA_DICTIONARY[candId]) {
      return KDS_EXTRA_DICTIONARY[candId][langKey] || KDS_EXTRA_DICTIONARY[candId].en;
    }

    const cand = String(variant.name || variant.nameIt || '').trim().toLowerCase();
    if (cand && KDS_EXTRA_DICTIONARY[cand]) {
      return KDS_EXTRA_DICTIONARY[cand][langKey] || KDS_EXTRA_DICTIONARY[cand].en;
    }
    return String(variant.name || variant.nameIt || (langKey === 'th' ? 'ปกติ' : 'Standard'));
  }

  const raw = String(variant).trim().toLowerCase();
  if (KDS_EXTRA_DICTIONARY[raw]) {
    return KDS_EXTRA_DICTIONARY[raw][langKey] || KDS_EXTRA_DICTIONARY[raw].en;
  }
  return String(variant).trim();
}

/**
 * Universal Item Characteristics Resolver for Kitchen Display System (KDS)
 * Extracts all features (size, spiciness, sugar, fruit, sauces, halal, dates, toppings)
 * fully localized in the active kitchen monitor language.
 */
export interface KdsItemDetails {
  variantLabel: string | null;
  isHalfHalf: boolean;
  halfHalfTitle: string | null;
  spicyBadge: string | null;
  sugarBadge: string | null;
  fruitBadge: string | null;
  sauces: string[];
  regularExtras: string[];
  isHalal: boolean;
  halalBadge: string | null;
  lasagnaDate: string | null;
}

export function parseKdsItemDetails(item: any, targetLang: KdsLanguage): KdsItemDetails {
  const langKey = targetLang === 'mm' ? 'mm' : targetLang === 'th' ? 'th' : targetLang === 'it' ? 'it' : targetLang === 'de' ? 'de' : 'en';
  
  // 1. Variant extraction
  const rawVariant = item.selectedVariant || item.variant || null;
  let variantLabel = rawVariant ? resolveVariantDisplayName(rawVariant, targetLang) : null;

  // 2. Half & Half detection
  const isHalfHalf = Boolean(
    (rawVariant && typeof rawVariant === 'object' && rawVariant.id === 'variant-half-half') ||
    (typeof rawVariant === 'string' && (rawVariant.includes('half') || rawVariant.includes('metà') || rawVariant.includes('ฮาล์ฟ'))) ||
    String(item.name || '').toLowerCase().includes('half & half') ||
    String(item.nameIt || '').toLowerCase().includes('metà & metà') ||
    String(item.nameTh || '').includes('ฮาล์ฟ')
  );

  let halfHalfTitle: string | null = null;
  if (isHalfHalf) {
    if (langKey === 'th') {
      halfHalfTitle = item.nameTh || item.name;
    } else if (langKey === 'mm') {
      halfHalfTitle = item.nameMm || item.name_mm || item.nameTh || item.name;
    } else if (langKey === 'it') {
      halfHalfTitle = item.nameIt || item.name_it || item.name;
    } else if (langKey === 'de') {
      halfHalfTitle = item.nameDe || item.name_de || item.name;
    } else {
      halfHalfTitle = item.name || item.nameIt;
    }
  }

  // 3. Halal Chicken
  const isHalal = Boolean(
    item.isHalalChicken ||
    String(item.name || '').includes('100% Chicken') ||
    String(item.nameTh || '').includes('เนื้อไก่ 100%') ||
    String(item.nameIt || '').includes('100% Pollo') ||
    String(item.productId || '').includes('-chicken')
  );
  const halalBadge = isHalal 
    ? (langKey === 'th' ? '🍗 เนื้อไก่ 100% (ฮาลาล)' : langKey === 'mm' ? '🍗 ကြက်သား ၁၀၀% (ဟလာလ်)' : langKey === 'it' ? '🍗 100% Pollo (Halal)' : langKey === 'de' ? '🍗 100% Hähnchen (Halal)' : '🍗 100% Chicken (Halal)')
    : null;

  // 4. Lasagna Pre-order Date
  const lasagnaDate = item.lasagnaDate ? String(item.lasagnaDate) : null;

  // 5. Extras separation (Spicy, Sugar, Fruit, Sauce, Regular)
  const rawExtras: any[] = Array.isArray(item.selectedExtras) 
    ? item.selectedExtras 
    : Array.isArray(item.extras) 
      ? item.extras 
      : [];

  let spicyBadge: string | null = null;
  let sugarBadge: string | null = null;
  let fruitBadge: string | null = null;
  const sauces: string[] = [];
  const regularExtras: string[] = [];

  rawExtras.forEach(ex => {
    const exId = typeof ex === 'object' ? String(ex.id || '').toLowerCase() : String(ex).toLowerCase();
    const exName = resolveExtraDisplayName(ex, targetLang);

    if (exId.startsWith('spicy-') || exId.includes('piccante') || exId.includes('spicy')) {
      if (!spicyBadge) spicyBadge = exName;
    } else if (exId.startsWith('sugar-') || exId.includes('sugar') || exId.includes('zucchero')) {
      if (!sugarBadge) sugarBadge = exName;
    } else if (exId.startsWith('fruit-')) {
      if (!fruitBadge) fruitBadge = exName;
    } else if (exId.startsWith('sauce-') || exId.includes('ketchup') || exId.includes('mayo') || exId.includes('chili')) {
      sauces.push(exName);
    } else {
      if (exName) regularExtras.push(exName);
    }
  });

  return {
    variantLabel,
    isHalfHalf,
    halfHalfTitle,
    spicyBadge,
    sugarBadge,
    fruitBadge,
    sauces,
    regularExtras,
    isHalal,
    halalBadge,
    lasagnaDate
  };
}

