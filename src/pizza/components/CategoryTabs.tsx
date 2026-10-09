import { useRef, useEffect } from 'react';
import type { MenuCategory } from '../data/menuData';
import { Pizza, Salad, Coffee, Beer, Sandwich, Dessert, Croissant, GlassWater, CupSoda, Wine, Sparkles } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../config/languages';

interface Props {
  categories: MenuCategory[];
  activeId: string;
  onChange: (id: string) => void;
  lang?: Language;
}

// Custom highly contextual food icons matching Lucide styling
const PastaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 16c0 3 4.5 5 9 5s9-2 9-5" />
    <path d="M2 15h20" />
    <path d="M4 12c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0" />
    <path d="M4 9c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0" />
    <path d="M4 6c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0" />
  </svg>
);

const BurgerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Top Bun */}
    <path d="M3 11c0-4.4 4-8 9-8s9 3.6 9 8H3z" />
    {/* Patty */}
    <path d="M4 14h16" />
    {/* Cheese / Lettuce */}
    <path d="M3 14l2 2h14l2-2" />
    {/* Bottom Bun */}
    <path d="M5 18h14c0 2-3.1 3-7 3s-7-1-7-3z" />
  </svg>
);

const FriesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Fries sticking up */}
    <path d="M6 14V3c.5-.5 1-.5 1.5 0v11" />
    <path d="M10 14V2c.5-.5 1-.5 1.5 0v12" />
    <path d="M14 14V4c.5-.5 1-.5 1.5 0v10" />
    <path d="M18 14V7c.5-.5 1-.5 1.5 0v7" />
    {/* Box */}
    <path d="M 5 14 L 7 22 H 17 L 19 14" />
    <path d="M 5 14 C 9 16 15 16 19 14" />
  </svg>
);

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'daily-specials': Sparkles,
  'traditional-italian-pizza': Pizza,
  'pasta': PastaIcon,
  'italian-salads': Salad,
  'pizza-sandwich': Sandwich,
  'pizza-burgers': BurgerIcon,
  'french-fries': FriesIcon,
  'desserts': Dessert,
  'breakfast-and-snacks': Croissant,
  'coffee-shop': Coffee,
  'fruit-drinks': GlassWater,
  'soft-drinks': CupSoda,
  'beers': Beer,
  'wines': Wine,
};

const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = {
  "daily-specials": {
    "IT": {
      "name": "Piatti del\nGiorno",
      "desc": "Creazioni esclusive e piatti speciali del giorno preparati dal nostro chef con ingredienti freschi di stagione."
    },
    "EN": {
      "name": "Daily\nSpecials",
      "desc": "Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef with premium ingredients."
    },
    "TH": {
      "name": "จานพิเศษ\nประจำวัน",
      "desc": "เมนูพิเศษประจำวันรังสรรค์โดยเชฟชาวอิตาเลียน ด้วยวัตถุดิบสดใหม่ตามฤดูกาลและรสชาติอิตาเลียนแท้"
    },
    "DE": {
      "name": "Tages-\ngerichte",
      "desc": "Täglich wechselnde Spezialitäten und saisonale Gerichte unseres Chefkochs aus frischen Zutaten."
    },
    "MM": {
      "name": "နေ့စဉ်\nဟင်းပွဲများ",
      "desc": "အီတလီစားဖိုမှူးမှ လတ်ဆတ်သော ရာသီပေါ် ကုန်ကြမ်းများဖြင့် နေ့စဉ် သီးသန့် ဖန်တီးထားသော အထူးဟင်းလျာများ။"
    },
    "ES": {
      "name": "Especiales\ndel día",
      "desc": "Creaciones diarias exclusivas y especialidades de temporada preparadas al momento por nuestro chef italiano con ingredientes premium."
    },
    "FR": {
      "name": "Suggestions\ndu jour",
      "desc": "Créations quotidiennes exclusives et spécialités de saison fraîchement préparées par notre chef italien avec des ingrédients premium."
    },
    "RU": {
      "name": "Ежедневные\nспециальные предложения",
      "desc": "Эксклюзивные ежедневные блюда и сезонные специальности, свежеприготовленные нашим итальянским шеф-поваром из премиальных ингредиентов."
    },
    "ZH": {
      "name": "每日\n特价",
      "desc": "由我们的意大利厨师使用优质食材新鲜制作的独家每日创意菜和时令特色菜。"
    }
  },
  "traditional-italian-pizza": {
    "IT": {
      "name": "Pizze\nClassiche",
      "desc": "La pizza è il cuore del nostro locale. Utilizziamo solo ingredienti italiani selezionati di prima qualità: dalla farina al pomodoro, dai formaggi ai salumi, senza scendere a compromessi. La nostra pizza tradizionale ad alta idratazione è realizzata con un impasto al 90% d'acqua, fatto maturare lentamente per almeno 36 ore. Il risultato è una pizza croccante, leggera, altamente digeribile e ricca di sapore."
    },
    "EN": {
      "name": "Italian\nPizza",
      "desc": "Pizza Is The Heart Of Our Restaurant. We Use Only Selected Italian Ingredients, From Flour To Tomato, From Cheeses To Cold Cuts, With No Compromise On Quality. Our Traditional High-Hydration Italian Pizza Is Made With A 90% Water Dough, Slowly Matured For At Least 36 Hours. The Result Is A Crispy, Light, Highly Digestible Pizza, Full Of Flavor."
    },
    "TH": {
      "name": "พิซซ่า\nคลาสสิก",
      "desc": "พิซซ่าคือหัวใจของร้านอาหารของเรา เราใช้เฉพาะวัตถุดิบอิตาเลียนที่คัดสรรมาอย่างดี ตั้งแต่แป้ง มะเขือเทศ ชีส ไปจนถึงโคลด์คัต โดยไม่ประนีประนอมด้านคุณภาพ พิซซ่าอิตาเลียนแบบดั้งเดิมของเราเป็นแป้งไฮเดรชันสูง ผสมน้ำถึง 90% และหมักอย่างช้าๆ อย่างน้อย 36 ชั่วโมง ผลลัพธ์คือพิซซ่าที่กรอบ เบา ย่อยง่าย และเต็มไปด้วยรสชาติ"
    },
    "DE": {
      "name": "Klassische\nPizza",
      "desc": "Die Pizza ist das Herzstück unseres Restaurants. Wir verwenden ausschließlich ausgewählte italienische Zutaten bester Qualität: vom Mehl bis zu den Tomaten, vom Käse bis zum Aufschnitt, ohne Kompromisse. Unsere traditionelle italienische Pizza mit hohem Feuchtigkeitsgehalt wird aus einem Teig mit 90 % Wasseranteil hergestellt, der mindestens 36 Stunden lang langsam reift. Das Ergebnis ist eine knusprige, leichte, besonders bekömmliche und geschmacksintensive Pizza."
    },
    "MM": {
      "name": "ရိုးရာ အီတလီ\nပီဇာ",
      "desc": "ကျွန်ုပ်တို့၏ အဓိက နှလုံးသည် ပီဇာဖြစ်ပါသည်။ အီတလီမှ တင်သွင်းသော ပရီမီယံ ကုန်ကြမ်းများကိုသာ အသုံးပြုထားပြီး ၃၆ နာရီကြာ သဘာဝနည်းဖြင့် အချဉ်ဖောက်ထားသောကြောင့် ကြွပ်ဆတ်၊ ပေါ့ပါးပြီး အစာကြေလွယ်ကာ အရသာအလွန်ပြည့်စုံပါသည်။"
    },
    "ES": {
      "name": "Pizza\nitaliana",
      "desc": "La pizza es el corazón de nuestro restaurante. Utilizamos solo ingredientes italianos seleccionados, desde la harina hasta el tomate, desde los quesos hasta los embutidos, sin comprometer la calidad. Nuestra pizza italiana tradicional de alta hidratación está hecha con una masa al 90% de agua, madurada lentamente durante al menos 36 horas. El resultado es una pizza crujiente, ligera, altamente digestiva y llena de sabor."
    },
    "FR": {
      "name": "Pizza\nitalienne",
      "desc": "La pizza est le cœur de notre restaurant. Nous utilisons uniquement des ingrédients italiens sélectionnés, de la farine à la tomate, des fromages aux charcuteries, sans compromis sur la qualité. Notre pizza italienne traditionnelle à haute hydratation est faite avec une pâte à 90% d'eau, lentement maturée pendant au moins 36 heures. Le résultat est une pizza croustillante, légère, très digeste et pleine de saveur."
    },
    "RU": {
      "name": "Итальянская\nпицца",
      "desc": "Пицца — сердце нашего ресторана. Мы используем только отборные итальянские ингредиенты, от муки до томатов, от сыров до мясных деликатесов, без компромиссов в качестве. Наша традиционная итальянская пицца с высокой гидратацией готовится из теста с 90% воды, медленно созревающего не менее 36 часов. Результат — хрустящая, легкая, легкоусвояемая пицца, полная вкуса."
    },
    "ZH": {
      "name": "意大利\n披萨",
      "desc": "披萨是我们餐厅的核心。我们只使用精选的意大利食材，从面粉到番茄，从奶酪到冷切肉，绝不妥协品质。我们的传统高含水量意大利披萨采用90%水分的面团，经过至少36小时的缓慢熟成。结果是酥脆、轻盈、易消化、风味十足的披萨。"
    }
  },
  "pasta": {
    "IT": {
      "name": "Primi\nPiatti",
      "desc": "Primi piatti della tradizione e pasta fresca fatta in casa."
    },
    "EN": {
      "name": "Pasta &\nPrimi",
      "desc": "Traditional Italian pasta and homemade first courses."
    },
    "TH": {
      "name": "พาสต้า &\nจานเส้น",
      "desc": "เมนูพาสต้าอิตาเลียนดั้งเดิมและพาสต้าสดโฮมเมด"
    },
    "DE": {
      "name": "Pasta &\nNudeln",
      "desc": "Traditionelle italienische Pasta und hausgemachte Nudelgerichte."
    },
    "MM": {
      "name": "ခေါက်ဆွဲ &\nပတ်စ်တာ",
      "desc": "ရိုးရာ အီတလီ ခေါက်ဆွဲ ဟင်းလျာများ။"
    },
    "ES": {
      "name": "Pasta y\nprimeros",
      "desc": "Pasta italiana tradicional y primeros platos caseros."
    },
    "FR": {
      "name": "Pâtes et\nprimi",
      "desc": "Pâtes italiennes traditionnelles et entrées maison."
    },
    "RU": {
      "name": "Паста и\nпервые блюда",
      "desc": "Традиционная итальянская паста и домашние первые блюда."
    },
    "ZH": {
      "name": "意面与\n前菜",
      "desc": "传统意大利面和自制前菜。"
    }
  },
  "italian-salads": {
    "IT": {
      "name": "Insalate &\nContorni",
      "desc": "Fresche insalate ricche all'italiana, contorni sfiziosi e gustosi secondi piatti della tradizione."
    },
    "EN": {
      "name": "Salads &\nSides",
      "desc": "Fresh rich Italian salads, delicious side dishes, and traditional savory main courses."
    },
    "TH": {
      "name": "สลัด &\nเครื่องเคียง",
      "desc": "สลัดอิตาเลียนสดใหม่ วัตถุดิบคุณภาพเยี่ยม และอาหารจานหลักสไตล์อิตาเลียน"
    },
    "DE": {
      "name": "Salate &\nBeilagen",
      "desc": "Frische italienische Salate und traditionelle herzhafte Hauptgerichte."
    },
    "MM": {
      "name": "ဆလတ် &\nအရံဟင်း",
      "desc": "လတ်ဆတ်သော အီတလီဆလတ်များနှင့် ရိုးရာ အရသာရှိသော အဓိကဟင်းလျာများ။"
    },
    "ES": {
      "name": "Ensaladas\ny guarniciones",
      "desc": "Frescas y abundantes ensaladas italianas, deliciosas guarniciones y tradicionales platos principales salados."
    },
    "FR": {
      "name": "Salades et\naccompagnements",
      "desc": "Salades italiennes fraîches et riches, délicieux accompagnements et plats principaux salés traditionnels."
    },
    "RU": {
      "name": "Салаты и\nгарниры",
      "desc": "Свежие и богатые итальянские салаты, вкусные гарниры и традиционные сытные основные блюда."
    },
    "ZH": {
      "name": "沙拉与\n配菜",
      "desc": "新鲜丰富的意大利沙拉、美味的配菜和传统咸味主菜。"
    }
  },
  "pizza-sandwich": {
    "IT": {
      "name": "Focaccia &\nSandwich",
      "desc": "Fraganti focacce all'olio extravergine d'oliva cotte al forno e farcite al momento con i migliori salumi italiani, e golosi pizza sandwich ripieni e dorati."
    },
    "EN": {
      "name": "Focaccia &\nSandwich",
      "desc": "Fragrant focaccia with extra virgin olive oil baked in the oven and filled to order with the best Italian cured meats, and tempting golden stuffed pizza sandwiches."
    },
    "TH": {
      "name": "โฟกัชชา &\nแซนด์วิช",
      "desc": "โฟกัชชาหอมกรุ่นทำจากน้ำมันมะกอกเอ็กซ์ตร้าเวอร์จินอบในเตา และยัดไส้สดใหม่ด้วยเนื้อสัตว์อิตาเลียนชั้นเยี่ยม พร้อมพิซซ่าแซนด์วิชไส้แน่นสีทอง"
    },
    "DE": {
      "name": "Focaccia &\nSandwich",
      "desc": "Duftende Focacce mit nativem Olivenöl extra, im Ofen gebacken und frisch belegt mit den besten italienischen Wurstwaren, und verführerische, goldbraune gefüllte Pizza-Sandwiches."
    },
    "MM": {
      "name": "ဖိုကာချာ &\nဆန်းဒဝစ်",
      "desc": "အိုလီဗာဆီအပိုဖြင့် ဖုတ်ထားသော မွှေးကြိုင်သော ဖိုကာချာများနှင့် အကောင်းဆုံး အီတလီအသားခြောက်များဖြင့် ချက်ချင်းဖြည့်ထားသော၊ ထို့အပြင် အရသာရှိပြီး ရွှေရောင်သန်းသော ပီဇာဆန်းဒဝစ်များ။"
    },
    "ES": {
      "name": "Focaccia y\nbocadillos",
      "desc": "Fragante focaccia con aceite de oliva virgen extra horneada en el horno y rellena al momento con los mejores embutidos italianos, y tentadores bocadillos de pizza dorados y rellenos."
    },
    "FR": {
      "name": "Focaccia et\nsandwichs",
      "desc": "Focaccia parfumée à l'huile d'olive extra vierge cuite au four et garnie à la commande avec les meilleures charcuteries italiennes, et tentants sandwichs de pizza dorés et farcis."
    },
    "RU": {
      "name": "Фокачча и\nсэндвичи",
      "desc": "Ароматная фокачча с оливковым маслом extra virgin, запеченная в печи и наполненная по заказу лучшими итальянскими мясными деликатесами, и соблазнительные золотистые сэндвичи-пиццы с начинкой."
    },
    "ZH": {
      "name": "佛卡夏与\n三明治",
      "desc": "用特级初榨橄榄油烤制的香浓佛卡夏，按订单填入最好的意大利腌肉，以及诱人的金色夹心披萨三明治。"
    }
  },
  "pizza-burgers": {
    "IT": {
      "name": "Pizza\nBurger",
      "desc": "Preparati con pane per hamburger appena sfornato e hamburger fatti in casa in stile italiano, serviti con patatine fritte, ketchup e maionese: freschi, gustosi e soddisfacenti."
    },
    "EN": {
      "name": "Pizza\nBurger",
      "desc": "Made with freshly baked burger buns and homemade Italian-style patties, served with french fries, ketchup, and mayonnaise: fresh, tasty, and satisfying."
    },
    "TH": {
      "name": "พิซซ่า\nเบอร์เกอร์",
      "desc": "ทำจากขนมปังเบอร์เกอร์อบสดใหม่และเนื้อเบอร์เกอร์โฮมเมดสไตล์อิตาเลียน เสิร์ฟพร้อมเฟรนช์ฟรายส์ ซอสมะเขือเทศ และมายองเนส สด อร่อย และอิ่มคุ้ม"
    },
    "DE": {
      "name": "Pizza\nBurger",
      "desc": "Hergestellt mit frisch gebackenen Burgerbrötchen und hausgemachten Patties nach italienischer Art, serviert mit Pommes frites, Ketchup und Mayonnaise: frisch, lecker und sättigend."
    },
    "MM": {
      "name": "ပီဇာ\nဘာဂါ",
      "desc": "အသစ်ဖုတ်ထားသော ပီဇာမုန့်သားဖြင့် ပြုလုပ်ထားသည့် အိမ်လုပ် ဘာဂါနှင့် အာလူးကြော်။"
    },
    "ES": {
      "name": "Hamburguesa\nde pizza",
      "desc": "Hecha con panecillos de hamburguesa recién horneados y hamburguesas caseras al estilo italiano, servida con patatas fritas, ketchup y mayonesa: fresca, sabrosa y satisfactoria."
    },
    "FR": {
      "name": "Burger\npizza",
      "desc": "Faits avec des pains à burger fraîchement cuits et des galettes maison à l'italienne, servis avec frites, ketchup et mayonnaise : frais, savoureux et satisfaisants."
    },
    "RU": {
      "name": "Пицца-\nбургер",
      "desc": "Приготовлен из свежеиспеченных булочек для бургеров и домашних котлет в итальянском стиле, подается с картофелем фри, кетчупом и майонезом: свежий, вкусный и сытный."
    },
    "ZH": {
      "name": "披萨\n汉堡",
      "desc": "用新鲜烘焙的汉堡面包和自制意式肉饼制成，配薯条、番茄酱和蛋黄酱：新鲜、美味、令人满足。"
    }
  },
  "french-fries": {
    "IT": {
      "name": "Patatine\nFritte",
      "desc": "Patatine fritte dorate, croccanti e servite caldissime con ketchup e maionese."
    },
    "EN": {
      "name": "French\nFries",
      "desc": "Golden, crispy french fries served piping hot with ketchup and mayonnaise."
    },
    "TH": {
      "name": "มันฝรั่ง\nทอด",
      "desc": "เฟรนช์ฟรายส์สีทองกรอบอร่อย ทอดสดใหม่เสิร์ฟร้อนๆ พร้อมซอสมะเขือเทศและมายองเนส"
    },
    "DE": {
      "name": "Pommes\nFrites",
      "desc": "Goldgelbe, knusprige Pommes frites heiß serviert mit Ketchup und Mayonnaise."
    },
    "MM": {
      "name": "အာလူး\nကြော်",
      "desc": "ရွှေဝါရောင် ကြွပ်ကြွပ်ရွ အာလူးကြော်များကို အပူပူလေးဖြင့် ကက်ချပ်နှင့် မေယိုနိုက်တွဲဖက်ကျွေးပါသည်။"
    },
    "ES": {
      "name": "Patatas\nfritas",
      "desc": "Patatas fritas doradas y crujientes servidas bien calientes con ketchup y mayonesa."
    },
    "FR": {
      "name": "Frites\nfrançaises",
      "desc": "Frites dorées et croustillantes servies bien chaudes avec ketchup et mayonnaise."
    },
    "RU": {
      "name": "Картофель\nфри",
      "desc": "Золотистый, хрустящий картофель фри, подается горячим с кетчупом и майонезом."
    },
    "ZH": {
      "name": "炸\n薯条",
      "desc": "金黄酥脆的炸薯条，热腾腾地配上番茄酱和蛋黄酱。"
    }
  },
  "desserts": {
    "IT": {
      "name": "Dolci &\nDessert",
      "desc": "Tiramisù artigianale fatto in casa, cheesecake, torte del giorno e deliziosi dessert italiani."
    },
    "EN": {
      "name": "Desserts &\nSweets",
      "desc": "Homemade artisan tiramisu, cheesecakes, cakes of the day, and delicious Italian desserts."
    },
    "TH": {
      "name": "ของหวาน &\nเค้ก",
      "desc": "ทีรามิสุโฮมเมดสไตล์อิตาเลียนแท้ ชีสเค้ก เค้กประจำวัน และของหวานแสนอร่อย"
    },
    "DE": {
      "name": "Desserts &\nSüßes",
      "desc": "Hausgemachtes Tiramisu, Cheesecake, Tageskuchen und köstliche italienische Desserts."
    },
    "MM": {
      "name": "အချိုပွဲ &\nဒက်ဆာ့တ်",
      "desc": "နာမည်ကြီး တီရာမီဆု၊ အိမ်လုပ်ကိတ်များနှင့် ကော်ဖီ အက်ဖိုဂါတို။"
    },
    "ES": {
      "name": "Postres y\ndulces",
      "desc": "Tiramisú artesanal casero, tartas de queso, pasteles del día y deliciosos postres italianos."
    },
    "FR": {
      "name": "Desserts et\nsucreries",
      "desc": "Tiramisu artisanal maison, cheesecakes, gâteaux du jour et délicieux desserts italiens."
    },
    "RU": {
      "name": "Десерты и\nсладости",
      "desc": "Домашний артизанальный тирамису, чизкейки, торты дня и вкусные итальянские десерты."
    },
    "ZH": {
      "name": "甜点与\n甜品",
      "desc": "自制手工提拉米苏、芝士蛋糕、当日蛋糕和美味的意大利甜点。"
    }
  },
  "breakfast-and-snacks": {
    "IT": {
      "name": "Snack &\nColazioni",
      "desc": "Colazioni nutrienti, toast caldi, uova preparate al momento e macedonia di frutta fresca."
    },
    "EN": {
      "name": "Snacks &\nBreakfast",
      "desc": "Hearty breakfasts, warm toasts, freshly made eggs, and fresh tropical fruit bowls."
    },
    "TH": {
      "name": "อาหารเช้า &\nของว่าง",
      "desc": "อาหารเช้าเพื่อสุขภาพ โทสต์ร้อนๆ ไข่ดาว/ออมเล็ตปรุงสดใหม่ และผลไม้รวมสด"
    },
    "DE": {
      "name": "Frühstück &\nSnacks",
      "desc": "Herzhaftes Frühstück, warme Toasts, frisch zubereitete Eierspeisen und frischer Obstsalat."
    },
    "MM": {
      "name": "မနက်စာ &\nမုန့်များ",
      "desc": "ပေါင်မုန့်မီးကင်၊ ကြက်ဥကြော်နှင့် လတ်ဆတ်သော သစ်သီးစုံ။"
    },
    "ES": {
      "name": "Aperitivos y\ndesayuno",
      "desc": "Desayunos abundantes, tostadas calientes, huevos recién hechos y frescos tazones de fruta tropical."
    },
    "FR": {
      "name": "En-cas et\npetit-déjeuner",
      "desc": "Petits-déjeuners copieux, toasts chauds, œufs fraîchement préparés et bols de fruits tropicaux frais."
    },
    "RU": {
      "name": "Закуски и\nзавтрак",
      "desc": "Сытные завтраки, теплые тосты, свежеприготовленные яйца и свежие чаши с тропическими фруктами."
    },
    "ZH": {
      "name": "小吃与\n早餐",
      "desc": "丰盛的早餐、热吐司、新鲜制作的鸡蛋和新鲜热带水果碗。"
    }
  },
  "coffee-shop": {
    "IT": {
      "name": "Caffetteria\n& Tè",
      "desc": "Autentico espresso italiano, cappuccino cremoso, caffè freddi e selezione di tè pregiati."
    },
    "EN": {
      "name": "Coffee &\nTea",
      "desc": "Authentic Italian espresso, creamy cappuccino, iced coffees, and fine tea selections."
    },
    "TH": {
      "name": "กาแฟ &\nชา",
      "desc": "เอสเพรสโซ่อิตาเลียนแท้ คาปูชิโน่ฟองนุ่ม กาแฟเย็น และชาคุณภาพคัดสรร"
    },
    "DE": {
      "name": "Kaffee &\nTee",
      "desc": "Authentischer italienischer Espresso, cremiger Cappuccino, Eiskaffee und erlesene Teesorten."
    },
    "MM": {
      "name": "ကော်ဖီ &\nလက်ဖက်ရည်",
      "desc": "စစ်မှန်သော အီတလီ အက်စ်ပရက်ဆို၊ ခရင်မ်ဆန်သော ကာပူချီနိုနှင့် လက်ဖက်ရည်များ။"
    },
    "ES": {
      "name": "Café y\nté",
      "desc": "Auténtico espresso italiano, cremoso capuchino, cafés helados y finas selecciones de té."
    },
    "FR": {
      "name": "Café et\nthé",
      "desc": "Authentique espresso italien, cappuccino crémeux, cafés glacés et sélections de thés fins."
    },
    "RU": {
      "name": "Кофе и\nчай",
      "desc": "Настоящий итальянский эспрессо, сливочный капучино, холодные кофейные напитки и изысканные сорта чая."
    },
    "ZH": {
      "name": "咖啡与\n茶",
      "desc": "正宗的意大利浓缩咖啡、奶油卡布奇诺、冰咖啡和精选优质茶。"
    }
  },
  "fruit-drinks": {
    "IT": {
      "name": "Frullati &\nSmoothie",
      "desc": "Frutta tropicale fresca frullata al momento, smoothie energetici e shake rinfrescanti."
    },
    "EN": {
      "name": "Fruit Shakes\n& Drinks",
      "desc": "Fresh tropical fruit blended on the spot, energizing smoothies, and refreshing shakes."
    },
    "TH": {
      "name": "น้ำผลไม้ปั่น\n& สมูทตี้",
      "desc": "ผลไม้เมืองร้อนสดใหม่ปั่นสดๆ สมูทตี้เพิ่มพลัง และเครื่องดื่มปั่นเย็นชื่นใจ"
    },
    "DE": {
      "name": "Frucht-Shakes\n& Smoothies",
      "desc": "Frische tropische Früchte frisch gemixt, energiereiche Smoothies und erfrischende Shakes."
    },
    "MM": {
      "name": "သစ်သီးဖျော်ရည်\nနှင့် စမူးသီး",
      "desc": "လတ်ဆတ်သော ရာသီပေါ် သစ်သီးဖျော်ရည်များနှင့် စမုသီများ။"
    },
    "ES": {
      "name": "Batidos de fruta\ny bebidas",
      "desc": "Fruta tropical fresca mezclada al momento, batidos energizantes y refrescantes batidos."
    },
    "FR": {
      "name": "Milkshakes aux fruits\net boissons",
      "desc": "Fruits tropicaux frais mixés sur place, smoothies énergisants et shakes rafraîchissants."
    },
    "RU": {
      "name": "Фруктовые коктейли\nи напитки",
      "desc": "Свежие тропические фрукты, смешанные на месте, энергетические смузи и освежающие коктейли."
    },
    "ZH": {
      "name": "水果奶昔\n与饮品",
      "desc": "现场混合的新鲜热带水果、能量冰沙和清爽奶昔。"
    }
  },
  "soft-drinks": {
    "IT": {
      "name": "Bibite &\nAcqua",
      "desc": "Bibite rinfrescanti in lattina, acqua minerale naturale e soda servite fredde."
    },
    "EN": {
      "name": "Soft Drinks\n& Water",
      "desc": "Chilled canned soft drinks, natural mineral water, and sparkling soda."
    },
    "TH": {
      "name": "น้ำอัดลม &\nน้ำดื่ม",
      "desc": "น้ำอัดลมกระป๋องแช่เย็น น้ำแร่ธรรมชาติ และโซดาเย็นสดชื่น"
    },
    "DE": {
      "name": "Getränke &\nWasser",
      "desc": "Gekühlte Softdrinks in der Dose, natürliches Mineralwasser und spritziges Soda."
    },
    "MM": {
      "name": "အအေးနှင့်\nသောက်ရေသန့်",
      "desc": "ဗူးသွပ်အအေးများ၊ သဘာဝတွင်းထွက်ရေနှင့် အေးမြလန်းဆန်းစေသော သောက်စရာများ။"
    },
    "ES": {
      "name": "Refrescos\ny agua",
      "desc": "Refrescos en lata fríos, agua mineral natural y soda con gas."
    },
    "FR": {
      "name": "Boissons gazeuses\net eau",
      "desc": "Boissons gazeuses en canette fraîches, eau minérale naturelle et soda pétillant."
    },
    "RU": {
      "name": "Безалкогольные напитки\nи вода",
      "desc": "Охлажденные безалкогольные напитки в банках, природная минеральная вода и газированная содовая."
    },
    "ZH": {
      "name": "软饮料\n与水",
      "desc": "冰镇罐装软饮料、天然矿泉水和气泡苏打水。"
    }
  },
  "beers": {
    "IT": {
      "name": "Birre in\nBottiglia",
      "desc": "Le migliori marche di birra in bottiglia grande e piccola, servite ghiacciate."
    },
    "EN": {
      "name": "Bottled\nBeers",
      "desc": "Top Thai and international bottled beers served ice cold."
    },
    "TH": {
      "name": "เบียร์\nขวด",
      "desc": "เบียร์ไทยและต่างประเทศชั้นนำ เสิร์ฟเย็นเจี๊ยบทั้งขวดใหญ่และขวดเล็ก"
    },
    "DE": {
      "name": "Flaschen-\nbiere",
      "desc": "Beste thailändische und internationale Flaschenbiere eiskalt serviert."
    },
    "MM": {
      "name": "ပုလင်း\nဘီယာ",
      "desc": "အကောင်းဆုံး ထိုင်းနှင့် နိုင်ငံတကာ ဘီယာပုလင်း အေးအေးများ။"
    },
    "ES": {
      "name": "Cervezas\nen botella",
      "desc": "Las mejores cervezas tailandesas e internacionales en botella servidas bien frías."
    },
    "FR": {
      "name": "Bières\nen bouteille",
      "desc": "Meilleures bières thaïlandaises et internationales en bouteille servies glacées."
    },
    "RU": {
      "name": "Пиво\nв бутылках",
      "desc": "Лучшие тайские и международные бутылочные сорта пива, подаются ледяными."
    },
    "ZH": {
      "name": "瓶装\n啤酒",
      "desc": "顶级泰国和国际瓶装啤酒，冰镇供应。"
    }
  },
  "wines": {
    "IT": {
      "name": "Carta dei\nVini",
      "desc": "Selezione esclusiva di vini italiani e internazionali, perfetti per esaltare ogni piatto."
    },
    "EN": {
      "name": "Wine\nList",
      "desc": "Exclusive selection of Italian and international wines, perfectly paired with our menu."
    },
    "TH": {
      "name": "รายการ\nไวน์",
      "desc": "คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นยอด เพื่อเติมเต็มรสชาติอาหารมื้อพิเศษของคุณ"
    },
    "DE": {
      "name": "Wein-\nkarte",
      "desc": "Exklusive Auswahl an italienischen und internationalen Weinen, perfekt abgestimmt auf jedes Gericht."
    },
    "MM": {
      "name": "ဝိုင်\nစာရင်း",
      "desc": "ကျွန်ုပ်တို့၏ ဟင်းလျာ အရသာတိုင်းကို ပိုမိုပြည့်စုံစေရန် ဂရုတစိုက် ရွေးချယ်ထားသော အီတလီနှင့် နိုင်ငံတကာ ဝိုင်ကောင်းများ။"
    },
    "ES": {
      "name": "Carta de\nvinos",
      "desc": "Selección exclusiva de vinos italianos e internacionales, perfectamente maridados con nuestro menú."
    },
    "FR": {
      "name": "Carte des\nvins",
      "desc": "Sélection exclusive de vins italiens et internationaux, parfaitement assortis à notre menu."
    },
    "RU": {
      "name": "Винная\nкарта",
      "desc": "Эксклюзивная подборка итальянских и международных вин, идеально сочетающихся с нашим меню."
    },
    "ZH": {
      "name": "葡萄酒\n单",
      "desc": "独家精选的意大利和国际葡萄酒，与我们的菜单完美搭配。"
    }
  }
};

export default function CategoryTabs({ categories, activeId, onChange, lang: propLang }: Props) {
  const storeLang = useLanguageStore((s) => s.lang);
  const lang = propLang || storeLang || 'IT';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Exact number of columns to ensure all categories always fit across exactly 2 uniform rows
  const cols = Math.max(1, Math.ceil(categories.length / 2));

  // Engaging intro teaser animation on mobile: scrolls across all categories to show the full variety, then returns smoothly to start
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof window === 'undefined' || window.innerWidth >= 768) return;

    let isUserInteracting = false;
    let animId: number | null = null;
    let timeoutId1: NodeJS.Timeout | null = null;
    let timeoutId2: NodeJS.Timeout | null = null;

    const stopAnimation = () => {
      isUserInteracting = true;
      if (animId) cancelAnimationFrame(animId);
      if (timeoutId1) clearTimeout(timeoutId1);
      if (timeoutId2) clearTimeout(timeoutId2);
    };

    el.addEventListener('touchstart', stopAnimation, { passive: true });
    el.addEventListener('mousedown', stopAnimation, { passive: true });
    el.addEventListener('wheel', stopAnimation, { passive: true });

    const animateScroll = (from: number, to: number, duration: number, easingFn: (t: number) => number, onComplete?: () => void) => {
      const startTime = performance.now();

      const step = (currentTime: number) => {
        if (isUserInteracting) return;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easingFn(progress);

        el.scrollLeft = from + (to - from) * eased;

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        } else if (onComplete && !isUserInteracting) {
          onComplete();
        }
      };

      animId = requestAnimationFrame(step);
    };

    // Gentle ease for reading as categories pass by
    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    // Snappy dynamic ease-out for returning swiftly to start
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    // Trigger after a brief delay so the user sees the page settle
    timeoutId1 = setTimeout(() => {
      if (isUserInteracting || !el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 30) return;

      // 1) Very slow, relaxed and clearly readable scroll across all categories (~5200ms)
      animateScroll(0, maxScroll, 5200, easeInOutSine, () => {
        // 2) Pause briefly at the end to register the last categories
        timeoutId2 = setTimeout(() => {
          if (isUserInteracting || !el) return;
          // 3) Snappy dynamic return to start (~950ms)
          animateScroll(el.scrollLeft, 0, 950, easeOutQuart);
        }, 450);
      });
    }, 600);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (timeoutId1) clearTimeout(timeoutId1);
      if (timeoutId2) clearTimeout(timeoutId2);
      el.removeEventListener('touchstart', stopAnimation);
      el.removeEventListener('mousedown', stopAnimation);
      el.removeEventListener('wheel', stopAnimation);
    };
  }, []);

  return (
    <div className="w-full">
      {/* MOBILE CATEGORY SELECTOR (High contrast square mini-cards slider - No truncation) */}
      <div
        ref={scrollRef}
        className="flex md:hidden gap-2.5 overflow-x-auto pb-3 pt-1 px-1 snap-x no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((item) => {
          const isSelected = item.id === activeId;
          const details = categoryDetails[item.id]?.[lang] || categoryDetails[item.id]?.EN || categoryDetails[item.id]?.IT || { name: item.name, desc: '' };
          const Icon = categoryIcons[item.id] || Pizza;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`w-[86px] min-w-[86px] h-[92px] flex flex-col items-center justify-between p-2 rounded-2xl transition-all duration-200 border-2 text-center shrink-0 snap-align-start cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-b from-[#8B1E1E] to-[#611010] border-[#8B1E1E] text-white shadow-lg ring-2 ring-[#8B1E1E]/30 scale-[1.02]'
                  : 'bg-[#ede5d8] border-[#cfbea6] text-[#2c1a11] shadow-[0_2px_6px_rgba(44,26,17,0.10)] hover:bg-[#e6dcce] hover:border-[#8B1E1E]/50 active:bg-[#dfd3c3]'
              }`}
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
            >
              <div
                className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isSelected 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'bg-[#ded0bf] text-[#8B1E1E] shadow-inner'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.3]" />
              </div>
              <div className="flex-1 flex items-center justify-center w-full min-h-[30px] mt-0.5 px-0.5">
                <span className="text-[10px] font-extrabold tracking-tight uppercase leading-[1.12] text-balance break-words">
                  {details.name.includes('\n') ? (
                    details.name.split('\n').map((line, idx) => (
                      <span key={idx} className="block">{line}</span>
                    ))
                  ) : (
                    details.name
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* DESKTOP CATEGORY SELECTOR (High contrast rectangular cards grid - exactly 2 equal rows) */}
      <div 
        className="hidden md:grid gap-2.5 lg:gap-3 mb-6 w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
        }}
      >
        {categories.map((item) => {
          const isSelected = item.id === activeId;
          const details = categoryDetails[item.id]?.[lang] || categoryDetails[item.id]?.EN || categoryDetails[item.id]?.IT || { name: item.name, desc: '' };
          const Icon = categoryIcons[item.id] || Pizza;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`w-full h-[100px] sm:h-[106px] lg:h-[110px] flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all duration-200 border-2 text-center group cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-b from-[#8B1E1E] to-[#611010] border-[#8B1E1E] text-white shadow-lg ring-2 ring-[#8B1E1E]/30 scale-[1.02]'
                  : 'bg-[#ede5d8] border-[#cfbea6] text-[#2c1a11] shadow-[0_2px_6px_rgba(44,26,17,0.08)] hover:bg-[#e6dcce] hover:border-[#8B1E1E]/50 hover:text-black hover:shadow-md active:scale-[0.98]'
              }`}
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isSelected 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'bg-[#ded0bf] text-[#8B1E1E] group-hover:bg-[#8B1E1E]/15 shadow-inner'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.3]" />
              </div>
              <div className="flex-1 flex items-center justify-center w-full min-h-[32px] px-0.5 mt-1">
                <span className="text-[10px] sm:text-[10.5px] lg:text-[11px] font-black tracking-wide uppercase leading-tight text-balance break-words">
                  {details.name.includes('\n') ? (
                    details.name.split('\n').map((line, idx) => (
                      <span key={idx} className="block">{line}</span>
                    ))
                  ) : (
                    details.name
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
