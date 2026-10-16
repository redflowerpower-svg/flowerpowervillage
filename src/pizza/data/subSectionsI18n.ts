import { Language } from "../config/languages";

export const CATEGORY_DETAILS: Record<string, Record<Language, { name: string; desc: string }>> = {
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

export const DAILY_SPECIALS_SECTIONS = [
  {
    "id": "fresh-showcase",
    "name": {
      "IT": "Oggi in Vetrina • Freschi di Giornata",
      "EN": "Today's Showcase • Freshly Prepared",
      "TH": "เมนูพร้อมเสิร์ฟสดใหม่ในตู้กระจกวันนี้",
      "DE": "Heute in der Vitrine • Frisch Zubereitet",
      "MM": "ယနေ့ အထူးပြသခန်း • လတ်ဆတ်သော လက်ရာများ",
      "ES": "Hoy en vitrina • Frescos del día",
      "FR": "Aujourd'hui en vitrine • Frais du jour",
      "RU": "Сегодня на витрине • Свежие блюда дня",
      "ZH": "今日橱窗特献 • 每日新鲜现烤"
    },
    "desc": {
      "IT": "Specialità artigianali, torte da forno e lasagne preparate fresche dal nostro chef, pronte subito per essere gustate.",
      "EN": "Artisanal specialties, homemade cakes, and fresh oven-baked lasagna prepared by our chef, ready to serve immediately.",
      "TH": "ขนมเค้กโฮมเมด พายอบ และลาซานญ่าสดใหม่จากเตา ปรุงโดยเชฟของเรา พร้อมเสิร์ฟทันที",
      "DE": "Handwerkliche Spezialitäten, ofenfrische Kuchen und hausgemachte Lasagne von unserem Chefkoch, sofort servierbereit.",
      "MM": "ကျွန်ုပ်တို့ စားဖိုမှူး၏ လတ်လတ်ဆတ်ဆတ် ဖုတ်ထားသော ကိတ်မုန့်များ၊ ပီဇာများနှင့် လာဆန်းညားများ၊ ချက်ချင်း သုံးဆောင်နိုင်ပါသည်။",
      "ES": "Especialidades artesanales, tartas caseras y lasaña recién horneada por nuestro chef, listas para degustar de inmediato.",
      "FR": "Spécialités artisanales, gâteaux maison et lasagnes fraîches cuites au four par notre chef, prêtes à déguster immédiatement.",
      "RU": "Фирменные деликатесы, домашние пироги и свежеиспеченная лазанья от нашего шеф-повара, готовые к подаче сразу.",
      "ZH": "主厨手工匠心特制糕点、每日自制新鲜烤蛋糕与正宗焗烤千层意面，现点立享。"
    }
  },
  {
    "id": "pasta",
    "name": {
      "IT": "Primi Piatti",
      "EN": "First Courses",
      "TH": "อาหารจานแรก (พาสต้า)",
      "DE": "Erste Gänge (Pasta)",
      "MM": "ပထမဟင်းလျာများ (ပတ်စ်တာ)",
      "ES": "Platos de pasta y entrantes",
      "FR": "Plats de pâtes et entrées",
      "RU": "Паста и первые блюда",
      "ZH": "意面和头盘"
    },
    "desc": {
      "IT": "Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali con formati a scelta.",
      "EN": "Seafood Spaghetti, Fresh Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and artisanal Ravioli with your choice of pasta format.",
      "TH": "สปาเก็ตตี้ซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมด เลือกเส้นและรูปแบบได้ตามใจชอบ",
      "DE": "Meeresfrüchte-Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte Ravioli mit wählbaren Formaten.",
      "MM": "လတ်ဆတ်သော ပင်လယ်စာ စပါဂက်တီ၊ ဂဏန်းသား၊ ဆယ်လ်မွန်၊ ပြည်ကြီးငါးမှင်ခေါက်ဆွဲနှင့် လက်လုပ် ရာဗီအိုလီများ။",
      "ES": "Espaguetis con marisco, carne de cangrejo fresco, penne con salmón, tagliatelle con tinta de calamar y raviolis artesanales con el formato de pasta que elijas.",
      "FR": "Spaghetti aux fruits de mer, chair de crabe fraîche, penne au saumon, tagliatelles à l'encre de seiche et raviolis artisanaux avec le format de pâtes de votre choix.",
      "RU": "Спагетти с морепродуктами, свежее крабовое мясо, пенне с лососем, тальятелле с чернилами кальмара и артизанальные равиоли с выбором формата пасты.",
      "ZH": "海鲜意面、新鲜蟹肉、三文鱼笔管面、墨鱼汁宽面，以及手工意大利饺，可选您喜欢的意面形状。"
    }
  },
  {
    "id": "traditional-italian-pizza",
    "name": {
      "IT": "Pizze Gourmet Speciali",
      "EN": "Gourmet Special Pizzas",
      "TH": "พิซซ่ากูร์เมต์สูตรพิเศษ",
      "DE": "Gourmet-Spezialpizzen",
      "MM": "အထူး ဂူးမေး ပီဇာများ",
      "ES": "Pizzas gourmet especiales",
      "FR": "Pizzas gourmet spéciales",
      "RU": "Гурманские специальные пиццы",
      "ZH": "美食特色披萨"
    },
    "desc": {
      "IT": "Pizze artigianali a lievitazione naturale con polpa di granchio fresca o salsiccia nostrana, spinaci e gorgonzola.",
      "EN": "Artisanal naturally leavened pizzas with fresh crab meat or local sausage, spinach, and gorgonzola.",
      "TH": "พิซซ่าแป้งหมักยีสต์ธรรมชาติ หน้าเนื้อปูม้าสด และไส้กรอกหมูอิตาเลียนกับผักสตีลัชชี",
      "DE": "Handwerkliche Pizzen mit natürlicher Hefe und frischem Krabbenfleisch oder einheimischer Wurst, Spinat und Gorgonzola.",
      "MM": "လတ်ဆတ်သော ဂဏန်းသား သို့မဟုတ် အီတလီ ဝက်အူချောင်းဖြင့် ဖုတ်ထားသော လက်လုပ် ပီဇာများ။",
      "ES": "Pizzas artesanales con fermentación natural, con carne de cangrejo fresco o salchicha local, espinacas y gorgonzola.",
      "FR": "Pizzas artisanales à levain naturel avec chair de crabe fraîche ou saucisse locale, épinards et gorgonzola.",
      "RU": "Артизанальные пиццы на естественной закваске со свежим крабовым мясом или местной колбасой, шпинатом и горгонзолой.",
      "ZH": "手工天然发酵披萨，搭配新鲜蟹肉或本地香肠、菠菜和戈贡佐拉奶酪。"
    }
  },
  {
    "id": "daily-specials",
    "name": {
      "IT": "Secondi Piatti Tradizionali",
      "EN": "Traditional Main Courses",
      "TH": "อาหารจานหลักแบบดั้งเดิม",
      "DE": "Traditionelle Hauptgerichte",
      "MM": "ရိုးရာ အဓိက အစားအစာများ",
      "ES": "Platos principales tradicionales",
      "FR": "Plats principaux traditionnels",
      "RU": "Традиционные основные блюда",
      "ZH": "传统主菜"
    },
    "desc": {
      "IT": "Grandi classici e torte salate della tradizione italiana preparati al momento: Cotoletta alla Milanese, Cotechino artigianale con Purè e autentica Torta Pasqualina ligure.",
      "EN": "Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.",
      "TH": "เมนูคลาสสิกและพายอบสไตล์อิตาเลียน: มิลานีสคัตเล็ตหมูทอดกรอบ ไส้กรอกโคเตคิโนโบราณพร้อมมันบด และพายตอร์ตา ปาสควาลินา",
      "DE": "Italienische Klassiker & herzhafte Torten: Knuspriges Mailänder Schnitzel, traditioneller Cotechino mit Kartoffelpüree und ligurische Torta Pasqualina.",
      "MM": "လတ်လတ်ဆတ်ဆတ် ချက်ပြုတ်ထားသော အီတလီ ရိုးရာ ဂန္တဝင် အစားအစာများနှင့် အရသာရှိ ပီဇာမုန့်များ။",
      "ES": "Grandes clásicos y sabrosas tartas italianas preparadas al momento: milanesa, cotechino artesanal con puré de patatas y auténtica torta pasqualina ligur.",
      "FR": "Grands classiques et tourtes italiennes savoureuses préparées fraîches : escalope milanaise, cotechino artisanal avec purée de pommes de terre et authentique torta pasqualina ligure.",
      "RU": "Великие классические блюда и пикантные итальянские пироги, приготовленные свежими: миланский шницель, артизанальный котекино с картофельным пюре и аутентичная лигурийская торта пасквалина.",
      "ZH": "经典美味与咸香意大利馅饼，新鲜制作：米兰式炸肉排、手工科泰基诺香肠配土豆泥，以及正宗利古里亚复活节馅饼。"
    }
  },
  {
    "id": "pizza-sandwich",
    "name": {
      "IT": "Focacce Artigianali",
      "EN": "Artisanal Focaccias",
      "TH": "ฟอคคาเซียอบสดสไตล์อิตาเลียน",
      "DE": "Hausgemachte Focaccia",
      "MM": "လက်လုပ် ဖိုကာချာ မုန့်များ",
      "ES": "Focaccias artesanales",
      "FR": "Focaccias artisanales",
      "RU": "Ремесленные фокаччи",
      "ZH": "手工佛卡夏"
    },
    "desc": {
      "IT": "Focacce fragranti da impasto pizza cotte al forno e farcite con i migliori salumi italiani selezionati: Finocchiona, Pancetta arrotolata, Porchetta, Prosciutto Cotto e Salame.",
      "EN": "Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Finocchiona, Rolled Pancetta, Porchetta, Cooked Ham, and Salami.",
      "TH": "ฟอคคาเซียอบสดใหม่กรอบนอกนุ่มใน สอดไส้โคลด์คัทอิตาเลียนชั้นเลิศ: ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี",
      "DE": "Ofenfrische Focaccia gefüllt mit feinsten italienischen Wurstspezialitäten: Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.",
      "MM": "အီတလီ အသားလွှာ အကောင်းစားများ ညှပ်ထားသော မီးဖိုဖုတ် ဖိုကာချာ မုန့်များ။",
      "ES": "Focaccias de masa de pizza recién horneadas con los mejores embutidos italianos.",
      "FR": "Focaccias au four avec les meilleures charcuteries italiennes sélectionnées.",
      "RU": "Ароматные запеченные фокаччи из теста для пиццы с лучшими итальянскими мясными деликатесами.",
      "ZH": "新鲜烤制的披萨面团佛卡夏，搭配精选优质意大利冷切肉。"
    }
  }
];

export const ITALIAN_SALADS_SECTIONS = [
  {
    "id": "salads",
    "name": {
      "IT": "Insalate Italiane",
      "EN": "Italian Salads",
      "TH": "สลัดอิตาเลียน",
      "DE": "Italienische Salate",
      "MM": "အီတလီဆလတ်များ",
      "ES": "Ensaladas italianas",
      "FR": "Salades italiennes",
      "RU": "Итальянские салаты",
      "ZH": "意式沙拉"
    },
    "desc": {
      "IT": "Insalate fresche con uova, pollo, patate o tonno preparate con verdure selezionate e condite con salse artigianali.",
      "EN": "Fresh salads with eggs, chicken, potatoes or tuna prepared with selected crisp vegetables and artisan dressings.",
      "TH": "สลัดสดใหม่ใส่ไข่ ไก่ มันฝรั่ง หรือทูน่า ปรุงด้วยผักสดคัดสรรและน้ำสลัดโฮมเมด",
      "DE": "Frische Salate mit Eiern, Hähnchen, Kartoffeln oder Thunfisch, zubereitet mit ausgewähltem Gemüse und hausgemachten Dressings.",
      "MM": "ကြက်ဥ၊ ကြက်သား၊ အာလူး သို့မဟုတ် တူနာငါးတို့ဖြင့် ပြင်ဆင်ထားသော လတ်ဆတ်သည့် အသုပ်များ။",
      "ES": "Ensaladas frescas con huevos, pollo, patatas o atún, preparadas con verduras crujientes seleccionadas y aderezos artesanales.",
      "FR": "Salades fraîches avec œufs, poulet, pommes de terre ou thon, préparées avec des légumes croquants sélectionnés et des vinaigrettes artisanales.",
      "RU": "Свежие салаты с яйцами, курицей, картофелем или тунцом, приготовленные из отборных хрустящих овощей и авторских заправок.",
      "ZH": "新鲜沙拉，配以鸡蛋、鸡肉、土豆或金枪鱼，搭配精选脆爽蔬菜和手工酱汁。"
    }
  },
  {
    "id": "main-courses",
    "name": {
      "IT": "Secondi Piatti Tradizionali",
      "EN": "Traditional Main Courses",
      "TH": "อาหารจานหลักแบบดั้งเดิม",
      "DE": "Traditionelle Hauptgerichte",
      "MM": "ရိုးရာ အဓိက အစားအစာများ",
      "ES": "Platos principales tradicionales",
      "FR": "Plats principaux traditionnels",
      "RU": "Традиционные основные блюда",
      "ZH": "传统主菜"
    },
    "desc": {
      "IT": "Grandi classici e torte salate della tradizione italiana: Cotoletta alla Milanese con patate, Cotechino artigianale con purè e autentica Torta Pasqualina ligure.",
      "EN": "Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.",
      "TH": "เมนูคลาสสิกและพายอบสไตล์อิตาเลียน: มิลานีสคัตเล็ตหมูทอดกรอบ ไส้กรอกโคเตคิโนโบราณพร้อมมันบด และพายตอร์ตา ปาสควาลินา",
      "DE": "Italienische Klassiker & herzhafte Torten: Knuspriges Mailänder Schnitzel, traditioneller Cotechino mit Kartoffelpüree und ligurische Torta Pasqualina.",
      "MM": "လတ်လတ်ဆတ်ဆတ် ချက်ပြုတ်ထားသော အီတလီ ရိုးရာ ဂန္တဝင် အစားအစာများနှင့် အရသာရှိ ပီဇာမုန့်များ။",
      "ES": "Clásicos culinarios italianos y tartas saladas recién hechas: Milanesa crujiente con patatas fritas, Cotechino artesanal con puré de patatas y Torta Pasqualina ligur.",
      "FR": "Classiques de la cuisine italienne et tourtes salées préparées fraîches : escalope milanaise croustillante avec frites, cotechino artisanal avec purée de pommes de terre, et torta pasqualina ligure.",
      "RU": "Итальянская кулинарная классика и пикантные пироги, приготовленные свежими: хрустящая миланская котлета с картофелем фри, ремесленный котекино с картофельным пюре и лигурийская пасхальная торта.",
      "ZH": "意式经典美食和咸味派新鲜制作：酥脆米兰炸肉排配薯条，手工科特基诺香肠配土豆泥，以及利古里亚复活节派。"
    }
  }
];

export const SALAD_SUBFILTER_LABELS: Record<string, { all: string; salads: string; mains: string }> = {
  "IT": {
    "all": "Tutti i Piatti",
    "salads": "Insalate Italiane",
    "mains": "Secondi Piatti"
  },
  "EN": {
    "all": "All Dishes",
    "salads": "Italian Salads",
    "mains": "Main Courses"
  },
  "TH": {
    "all": "ทุกจาน",
    "salads": "สลัดอิตาเลียน",
    "mains": "จานหลัก"
  },
  "DE": {
    "all": "Alle Gerichte",
    "salads": "Italienische Salate",
    "mains": "Hauptgerichte"
  },
  "MM": {
    "all": "ဟင်းလျာအားလုံး",
    "salads": "အီတလီဆလတ်များ",
    "mains": "အဓိကဟင်းလျာများ"
  },
  "ES": {
    "all": "Todos los platos",
    "salads": "Ensaladas italianas",
    "mains": "Platos principales"
  },
  "FR": {
    "all": "Tous les plats",
    "salads": "Salades italiennes",
    "mains": "Plats principaux"
  },
  "RU": {
    "all": "Все блюда",
    "salads": "Итальянские салаты",
    "mains": "Основные блюда"
  },
  "ZH": {
    "all": "所有菜品",
    "salads": "意式沙拉",
    "mains": "主菜"
  }
};

export const SANDWICH_SUBFILTER_LABELS: Record<string, { all: string; focacce: string; sandwiches: string }> = {
  "IT": {
    "all": "Tutti i Piatti",
    "focacce": "Focacce",
    "sandwiches": "Pizza Sandwich"
  },
  "EN": {
    "all": "All Dishes",
    "focacce": "Focaccia",
    "sandwiches": "Pizza Sandwich"
  },
  "TH": {
    "all": "ทุกจาน",
    "focacce": "โฟกัชชา",
    "sandwiches": "พิซซ่าแซนด์วิช"
  },
  "DE": {
    "all": "Alle Gerichte",
    "focacce": "Focacce",
    "sandwiches": "Pizza-Sandwich"
  },
  "MM": {
    "all": "ဟင်းလျာအားလုံး",
    "focacce": "ဖိုကာချာများ",
    "sandwiches": "ပီဇာဆန်းဒဝစ်"
  },
  "ES": {
    "all": "Todos los platos",
    "focacce": "Focaccia",
    "sandwiches": "Sándwich de pizza"
  },
  "FR": {
    "all": "Tous les plats",
    "focacce": "Focaccia",
    "sandwiches": "Sandwich à la pizza"
  },
  "RU": {
    "all": "Все блюда",
    "focacce": "Фокачча",
    "sandwiches": "Пицца-сэндвич"
  },
  "ZH": {
    "all": "所有菜品",
    "focacce": "佛卡夏",
    "sandwiches": "披萨三明治"
  }
};

export const FOCACCIA_SANDWICH_SECTIONS = [
  {
    "id": "focacce",
    "name": {
      "IT": "Focacce",
      "EN": "Focaccia",
      "TH": "โฟกัชชา",
      "DE": "Focacce",
      "MM": "ဖိုကာချာများ",
      "ES": "Focaccia",
      "FR": "Focaccia",
      "RU": "Фокачча",
      "ZH": "佛卡夏"
    },
    "desc": {
      "IT": "Focacce fragranti da impasto pizza all'olio extravergine d'oliva cotte al forno e farcite al momento con i migliori salumi italiani selezionati: Milanese, Finocchiona, Pancetta arrotolata, Porchetta, Prosciutto Cotto e Salame.",
      "EN": "Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Milanese cutlet, Tuscan Finocchiona, Rolled Pancetta, Roasted Porchetta, Cooked Ham, and Salami.",
      "TH": "ฟอคคาเซียแป้งพิซซ่าอบสดใหม่สไตล์โฮมเมด สอดไส้โคลด์คัทอิตาเลียนพรีเมียม: มิลานีส, ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี",
      "DE": "Ofenfrische Pizza-Focaccia gefüllt mit feinsten italienischen Spezialitäten: Mailänder Schnitzel, Toskanische Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.",
      "MM": "အီတလီ အသားလွှာ အကောင်းစားများနှင့် မီးဖိုဖုတ် ဖိုကာချာ မုန့်များ။",
      "ES": "Fragantes focaccias de masa de pizza horneadas, rellenas de embutidos italianos premium: milanesa, Finocchiona toscana, Pancetta enrollada, Porchetta asada, jamón cocido y salami.",
      "FR": "Focaccias parfumées à base de pâte à pizza cuite au four, garnies de charcuteries italiennes de qualité supérieure : escalope milanaise, finocchiona toscane, pancetta roulée, porchetta rôtie, jambon cuit et salami.",
      "RU": "Ароматные фокаччи из теста для пиццы, запеченные в печи, с начинкой из премиальных итальянских мясных деликатесов: миланская котлета, тосканская финоккьона, рулетики из панчетты, жареная порчетта, вареная ветчина и салями.",
      "ZH": "香气扑鼻的烤箱烘焙披萨面团佛卡夏，夹入优质意大利冷切肉：米兰炸肉排、托斯卡纳芬诺基奥纳香肠、卷状培根、烤猪肉卷、熟火腿和萨拉米。"
    }
  },
  {
    "id": "pizza-sandwiches",
    "name": {
      "IT": "Pizza Sandwich",
      "EN": "Pizza Sandwich",
      "TH": "พิซซ่าแซนด์วิช",
      "DE": "Pizza-Sandwich",
      "MM": "ပီဇာဆန်းဒဝစ်",
      "ES": "Sándwich de pizza",
      "FR": "Sandwich à la pizza",
      "RU": "Пицца-сэндвич",
      "ZH": "披萨三明治"
    },
    "desc": {
      "IT": "Gustosi panini racchiusi nel nostro impasto pizza dorato e croccante con formaggio filante, pomodoro fresco e salumi italiani selezionati.",
      "EN": "Flavorful sandwiches wrapped in our golden, crispy pizza crust with melted cheese, fresh tomatoes, and premium Italian cold cuts.",
      "TH": "แซนด์วิชแป้งพิซซ่ากรอบนอกนุ่มใน สอดไส้ชีสเยิ้มๆ มะเขือเทศสด และโคลด์คัทอิตาเลียนชั้นเลิศ",
      "DE": "Köstliche Sandwiches in knusprigem Pizzateig mit geschmolzenem Käse, frischen Tomaten und feinen italienischen Wurstwaren.",
      "MM": "ရွှေဝါရောင် ကြွပ်ကြွပ်ရွ ပီဇာမုန့်သား၊ အရည်ပျော်နေသော ချိစ်နှင့် အသားလွှာများ ပါဝင်သော ပီဇာဆန်းဒဝစ်။",
      "ES": "Sabrosos sándwiches envueltos en nuestra masa de pizza dorada y crujiente, con queso fundido, tomates frescos y embutidos italianos premium.",
      "FR": "Sandwichs savoureux enveloppés dans notre croûte de pizza dorée et croustillante, avec fromage fondu, tomates fraîches et charcuteries italiennes de qualité supérieure.",
      "RU": "Ароматные сэндвичи, завернутые в нашу золотистую хрустящую корочку для пиццы с расплавленным сыром, свежими помидорами и премиальными итальянскими мясными деликатесами.",
      "ZH": "风味十足的三明治，包裹在我们金黄酥脆的披萨饼皮中，配以融化的奶酪、新鲜番茄和优质意大利冷切肉。"
    }
  }
];

export const PASTA_SAUCES = [
  {
    "id": "special-pasta",
    "name": {
      "IT": "Specialità & Paste Ripiene",
      "EN": "Chef's Specials & Stuffed Pasta",
      "TH": "พาสต้าและราวิโอลีสูตรพิเศษ",
      "DE": "Spezialitäten & Gefüllte Pasta",
      "MM": "အထူးလက်ရာနှင့် အစာသွပ် ခေါက်ဆွဲ",
      "ES": "Especialidades del chef y pasta rellena",
      "FR": "Spécialités du chef et pâtes farcies",
      "RU": "Особые блюда от шефа и паста с начинкой",
      "ZH": "厨师特选和馅料意面"
    },
    "desc": {
      "IT": "Creazioni di mare e di terra della nostra cuoca: Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali ripieni.",
      "EN": "Seafood and artisan specialties: Seafood Spaghetti, Blue Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and handmade stuffed Ravioli.",
      "TH": "พาสต้าซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมดสอดไส้สูตรดั้งเดิม",
      "DE": "Meeresfrüchte- und Spezialitätenkreationen: Frutti di Mare Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte gefüllte Ravioli.",
      "MM": "ပင်လယ်စာ စပါဂက်တီ၊ ဂဏန်းသား၊ ဆယ်လ်မွန်နှင့် လက်လုပ် ရာဗီအိုလီ အထူးဟင်းလျာများ။",
      "ES": "Especialidades de marisco y artesanales: espaguetis con marisco, carne de cangrejo azul, penne con salmón, tagliatelle con tinta de calamar y raviolis rellenos hechos a mano.",
      "FR": "Spécialités de la mer et artisanales : spaghetti aux fruits de mer, chair de crabe bleu, penne au saumon, tagliatelles à l'encre de seiche et raviolis farcis faits à la main.",
      "RU": "Морские и авторские specialties: спагетти с морепродуктами, мясо синего краба, пенне с лососем, тальятелле с чернилами кальмара и ручная равioli с начинкой.",
      "ZH": "海鲜和手工特色菜：海鲜意大利面、蓝蟹肉、三文鱼笔管面、墨鱼汁宽面和手工馅料意大利饺。"
    },
    "pattern": "special"
  },
  {
    "id": "aglio-olio",
    "name": {
      "IT": "Aglio, Olio e Peperoncino",
      "EN": "Garlic, Oil & Chili",
      "TH": "อากลิโอ โอลิโอ พริกแห้ง",
      "DE": "Knoblauch, Öl & Chili",
      "MM": "ကြက်သွန်ဖြူ၊ သံလွင်ဆီနှင့် ငရုတ်သီး",
      "ES": "Ajo, aceite y guindilla",
      "FR": "Ail, huile et piment",
      "RU": "Чеснок, масло и чили",
      "ZH": "蒜香、橄榄油和辣椒"
    },
    "desc": {
      "IT": "Un classico italiano semplice e saporito preparato con aglio, olio extravergine d'oliva e peperoncino, con un gusto intenso e aromatico che delizia ogni singolo morso.",
      "EN": "A simple and flavorful Italian classic made with garlic, olive oil, and chili, with an intense, aromatic taste that delights every single bite",
      "TH": "พาสต้าผัดกระเทียม น้ำมันมะกอก และพริกแห้ง รสชาติเข้มข้นจัดจ้านสไตล์อิตาเลียน",
      "DE": "Ein einfacher und geschmackvoller italienischer Klassiker aus Knoblauch, Olivenöl und Chili, mit einem intensiven, aromatischen Geschmack, der jeden Bissen begeistert.",
      "MM": "ကြက်သွန်ဖြူ၊ သံလွင်ဆီနှင့် ငရုတ်သီးတို့ဖြင့် မွှေးပျံ့စွာ ကြော်ထားသော ဂန္တဝင် အီတလီ ခေါက်ဆွဲ။",
      "ES": "Un clásico italiano sencillo y sabroso hecho con ajo, aceite de oliva y guindilla, con un sabor intenso y aromático que deleita cada bocado.",
      "FR": "Un classique italien simple et savoureux à base d'ail, d'huile d'olive et de piment, au goût intense et aromatique qui ravit chaque bouchée.",
      "RU": "Простая и ароматная итальянская классика, приготовленная с чесноком, оливковым маслом и чили, с интенсивным, ароматным вкусом, который радует каждый кусочек.",
      "ZH": "简单而美味的意大利经典，由大蒜、橄榄油和辣椒制成，味道浓郁芳香，每一口都令人愉悦"
    },
    "pattern": "Garlic, Oil"
  },
  {
    "id": "pomodoro",
    "name": {
      "IT": "Salsa di Pomodoro",
      "EN": "Tomato Sauce",
      "TH": "ซอสมะเขือเทศ",
      "DE": "Tomatensauce",
      "MM": "ခရမ်းချဉ်သီးဆော့စ်",
      "ES": "Salsa de tomate",
      "FR": "Sauce tomate",
      "RU": "Томатный соус",
      "ZH": "番茄酱"
    },
    "desc": {
      "IT": "Salsa di pomodoro all'italiana preparata con pomodori maturi, olio d'oliva, aglio o cipolla, sale e basilico. È il cuore pulsante della cucina italiana.",
      "EN": "Italian tomato sauce made with ripe tomatoes, olive oil, garlic or onion, salt, and basil. It's the heart of Italian cuisine",
      "TH": "ซอสมะเขือเทศอิตาเลียนรสเข้มข้น เคี่ยวกับกระเทียม หอมใหญ่ และใบโหระพาอิตาเลียน",
      "DE": "Italienische Tomatensauce aus reifen Tomaten, Olivenöl, Knoblauch oder Zwiebeln, Salz und Basilikum. Sie ist das Herz der italienischen Küche.",
      "MM": "မှည့်ဝင်းသော ခရမ်းချဉ်သီး၊ သံလွင်ဆီနှင့် ပင်စိမ်းရွက်တို့ဖြင့် ချက်ထားသော ရိုးရာ အီတလီဆော့စ်။",
      "ES": "Salsa de tomate italiana hecha con tomates maduros, aceite de oliva, ajo o cebolla, sal y albahaca. Es el corazón de la cocina italiana.",
      "FR": "Sauce tomate italienne préparée avec des tomates mûres, de l'huile d'olive, de l'ail ou de l'oignon, du sel et du basilic. C'est le cœur de la cuisine italienne.",
      "RU": "Итальянский томатный соус, приготовленный из спелых помидоров, оливкового масла, чеснока или лука, соли и базилика. Это сердце итальянской кухни.",
      "ZH": "用成熟番茄、橄榄油、大蒜或洋葱、盐和罗勒制成的意大利番茄酱。它是意大利美食的核心"
    },
    "pattern": "Tomato Sauce"
  },
  {
    "id": "pesto",
    "name": {
      "IT": "Pesto Genovese",
      "EN": "Pesto Genovese",
      "TH": "ซอสเพสโต้",
      "DE": "Pesto Genovese",
      "MM": "ပက်စတို ဆော့စ်",
      "ES": "Pesto genovés",
      "FR": "Pesto génois",
      "RU": "Песто генуэзское",
      "ZH": "热那亚青酱"
    },
    "desc": {
      "IT": "Salsa fresca al basilico con anacardi, parmigiano, aglio e olio d'oliva, con un sapore ricco e aromatico che evoca i profumi di Genova.",
      "EN": "Fresh basil sauce with cashews, parmesan cheese, garlic, and olive oil, with a rich, aromatic flavor that evokes the scent of Genoa",
      "TH": "ซอสใบโหระพาอิตาเลียนปั่นสดใหม่ ใส่เม็ดมะม่วงหิมพานต์ พาเมซานชีส กระเทียม และน้ำมันมะกอก",
      "DE": "Frische Basilikumsauce mit Cashewnüssen, Parmesankäse, Knoblauch und Olivenöl, mit einem reichen, aromatischen Geschmack, der an Genua erinnert.",
      "MM": "လတ်ဆတ်သော ပင်စိမ်းရွက်၊ သီဟိုဠ်စေ့၊ ပါမီဂျန်ချိစ်နှင့် သံလွင်ဆီတို့ဖြင့် ပြုလုပ်ထားသော မွှေးပျံ့သည့် ပက်စတိုဆော့စ်။",
      "ES": "Salsa fresca de albahaca con anacardos, queso parmesano, ajo y aceite de oliva, con un sabor rico y aromático que evoca el aroma de Génova.",
      "FR": "Sauce fraîche au basilic avec noix de cajou, parmesan, ail et huile d'olive, à la saveur riche et aromatique qui évoque le parfum de Gênes.",
      "RU": "Свежий соус из базилика с кешью, сыром пармезан, чесноком и оливковым маслом, с богатым, ароматным вкусом, напоминающим аромат Генуи.",
      "ZH": "新鲜罗勒酱配腰果、帕尔马干酪、大蒜和橄榄油，风味浓郁芳香，让人想起热那亚的气息"
    },
    "pattern": "Pesto Genovese"
  },
  {
    "id": "amatriciana",
    "name": {
      "IT": "Salsa Amatriciana",
      "EN": "Amatriciana",
      "TH": "ซอสอามาริเชียนา",
      "DE": "Amatriciana",
      "MM": "အာမာထရီချာနာ ဆော့စ်",
      "ES": "Amatriciana",
      "FR": "Amatriciana",
      "RU": "Аматричана",
      "ZH": "阿马特里切纳"
    },
    "desc": {
      "IT": "Salsa in stile romano con pomodoro, guanciale e pecorino, cotta lentamente per ottenere un sapore dolce e sapido bilanciato, un classico della tradizione italiana.",
      "EN": "Roman-style sauce with tomato, cured pork cheek, and pecorino, slowly cooked for a balanced sweet and savory flavor, a classic of Italian tradition",
      "TH": "ซอสสไตล์โรมันเข้มข้น เคี่ยวกับแก้มหมูรมควัน กวานชาเล มะเขือเทศ และชีสเปโกริโน",
      "DE": "Sauce nach römischer Art mit Tomaten, Guanciale und Pecorino, langsam gekocht für einen ausgewogenen süß-würzigen Geschmack, ein Klassiker der italienischen Tradition.",
      "MM": "ခရမ်းချဉ်သီး၊ ဝက်ပါးစပ်သားနှင့် ပီကိုရီနိုချိစ်တို့ဖြင့် ဖြည်းညင်းစွာ ချက်ထားသော ရိုးရာ ရောမဆော့စ်။",
      "ES": "Salsa al estilo romano con tomate, carrillada de cerdo curada y pecorino, cocinada a fuego lento para un sabor equilibrado entre dulce y salado, un clásico de la tradición italiana.",
      "FR": "Sauce à la romaine avec tomate, joue de porc et pecorino, mijotée lentement pour une saveur équilibrée entre doux et salé, un classique de la tradition italienne.",
      "RU": "Соус в римском стиле с томатами, свиной щековиной и пекорино, медленно приготовленный для сбалансированного сладкого и соленого вкуса, классика итальянской традиции.",
      "ZH": "罗马风味酱汁，配以番茄、腌猪颊肉和佩科里诺奶酪，慢炖出均衡的甜咸风味，是意大利传统的经典"
    },
    "pattern": "Amatriciana"
  },
  {
    "id": "carbonara",
    "name": {
      "IT": "Salsa Carbonara",
      "EN": "Carbonara",
      "TH": "ซอสคาโบนาร่า",
      "DE": "Carbonara",
      "MM": "ကာဘိုနာရာ ဆော့စ်",
      "ES": "Carbonara",
      "FR": "Carbonara",
      "RU": "Карбонара",
      "ZH": "卡邦尼"
    },
    "desc": {
      "IT": "Ricetta autentica romana con tuorlo d'uovo fresco, guanciale croccante e formaggio pecorino romano D.O.P., cremosa e irresistibile.",
      "EN": "Authentic Roman recipe with fresh egg yolk, crispy guanciale, and aged Pecorino Romano D.O.P. cheese, rich and velvety.",
      "TH": "สูตรต้นตำรับแท้จากกรุงโรม ผสมผสานไข่แดงสด กวานชาเลกรอบ และชีสเปโกริโน โรมาโน",
      "DE": "Authentisches römisches Rezept mit frischem Eigelb, knusprigem Guanciale und Pecorino Romano D.O.P., cremig und unwiderstehlich.",
      "MM": "လတ်ဆတ်သော ကြက်ဥအနှစ်၊ ကြွပ်ရွသော ဝက်ပါးစပ်သားနှင့် ပီကိုရီနိုချိစ်တို့ဖြင့် ဖျော်စပ်ထားသော စစ်မှန်သည့် ရောမ ကာဘိုနာရာ။",
      "ES": "Auténtica receta romana con yema de huevo, guanciale y queso pecorino.",
      "FR": "Recette romaine authentique avec jaune d'œuf, guanciale et fromage pecorino.",
      "RU": "Аутентичный римский рецепт с яичным желтком, гуанчале и сыром пекорино.",
      "ZH": "正宗的罗马食谱，配以蛋黄、猪颊肉和佩科里诺奶酪"
    },
    "pattern": "Carbonara"
  },
  {
    "id": "bolognese",
    "name": {
      "IT": "Ragù alla Bolognese",
      "EN": "Bolognese Ragù",
      "TH": "ซอสเนื้อโบโลเนส",
      "DE": "Bolognese Ragù",
      "MM": "ဘိုလိုနိစ် အမဲသားဆော့စ်",
      "ES": "Ragú boloñés",
      "FR": "Ragù bolognaise",
      "RU": "Болоньезе рагу",
      "ZH": "博洛尼亚肉酱"
    },
    "desc": {
      "IT": "Salsa ricca e corposa di carne macinata di maiale cotta a fuoco lento per ore con pomodoro e aromi, come vuole la tradizione emiliana.",
      "EN": "Rich and savory slow-cooked minced pork meat sauce simmered with tomatoes and herbs according to true Italian tradition.",
      "TH": "ซอสเนื้อหมูสับเคี่ยวไฟอ่อนนานหลายชั่วโมงกับมะเขือเทศและเครื่องเทศตามแบบฉบับอิตาลีแท้",
      "DE": "Herzhaftes, stundenlang sanft geköcheltes Fleischragù mit Tomaten und Kräutern nach echter italienischer Tradition.",
      "MM": "ခရမ်းချဉ်သီးနှင့် ဟင်းခတ်အမွှေးအကြိုင်များဖြင့် နာရီပေါင်းများစွာ ဖြည်းညင်းစွာ ကျိုထားသော အမဲ/ဝက်သားဆော့စ်။",
      "ES": "Salsa tradicional de carne picada cocinada a fuego lento.",
      "FR": "Sauce traditionnelle à la viande hachée mijotée lentement.",
      "RU": "Традиционный соус из мясного фарша, приготовленный на медленном огне.",
      "ZH": "慢炖的传统肉末酱"
    },
    "pattern": "Bolognese"
  },
  {
    "id": "gorgonzola",
    "name": {
      "IT": "Crema di Gorgonzola",
      "EN": "Creamy Gorgonzola",
      "TH": "ซอสครีมกอร์กอนโซล่า",
      "DE": "Cremiges Gorgonzola",
      "MM": "ဂေါ်ဂွန်ဇိုလာ ချိစ်ဆော့စ်",
      "ES": "Gorgonzola cremoso",
      "FR": "Gorgonzola crémeux",
      "RU": "Сливочная горгонзола",
      "ZH": "奶油戈贡佐拉"
    },
    "desc": {
      "IT": "Salsa vellutata e intensa a base di autentico formaggio erborinato Gorgonzola D.O.P. fuso con burro di qualità.",
      "EN": "Rich, creamy and intense sauce made with authentic melted Italian Gorgonzola D.O.P. blue cheese and butter.",
      "TH": "ซอสครีมชีสบลูชีสกอร์กอนโซล่าแท้ รสชาติเข้มข้น หอมมัน กลมกล่อม",
      "DE": "Samtig-würzige Sauce aus geschmolzenem italienischen Gorgonzola D.O.P. Blauschimmelkäse und Butter.",
      "MM": "စစ်မှန်သော အီတလီ ဂေါ်ဂွန်ဇိုလာ ဘလူးချိစ်နှင့် ထောပတ်တို့ဖြင့် ဖျော်စပ်ထားသော အရသာပြည့်ဝသည့် ဆော့စ်။",
      "ES": "Rica salsa de queso azul italiano.",
      "FR": "Sauce riche au fromage bleu italien.",
      "RU": "Насыщенный итальянский соус из голубого сыра.",
      "ZH": "浓郁的意大利蓝纹奶酪酱"
    },
    "pattern": "Gorgonzola"
  }
];

export const PASTA_FILTER_LABELS: Record<string, { all: string }> = {
  "IT": {
    "all": "Tutti i Condimenti"
  },
  "EN": {
    "all": "All Pasta Sauces"
  },
  "TH": {
    "all": "ซอสพาสต้าทั้งหมด"
  },
  "DE": {
    "all": "Alle Nudelsaucen"
  },
  "MM": {
    "all": "ခေါက်ဆွဲဆော့စ်အားလုံး"
  },
  "ES": {
    "all": "Todas las Salsas"
  },
  "FR": {
    "all": "Toutes les Sauces"
  },
  "RU": {
    "all": "Все соусы для пасты"
  },
  "ZH": {
    "all": "全部意面酱汁"
  }
};

export const WINE_FILTER_LABELS: Record<string, {
  allTypes: string;
  allCountries: string;
  filterByCountry: string;
  italianFirstBadge: string;
  noWinesFound: string;
  resetFilters: string;
  winesCount: string;
  wineCount: string;
}> = {
  "IT": {
    "allTypes": "Tutti i Vini",
    "allCountries": "Tutte le Origini",
    "filterByCountry": "Origine",
    "italianFirstBadge": "Selezione Italiana in Evidenza",
    "noWinesFound": "Nessun vino trovato con i filtri selezionati.",
    "resetFilters": "Mostra tutti i vini",
    "winesCount": "etichette",
    "wineCount": "etichetta"
  },
  "EN": {
    "allTypes": "All Wines",
    "allCountries": "All Origins",
    "filterByCountry": "Origin",
    "italianFirstBadge": "Italian Selection Featured",
    "noWinesFound": "No wines found matching your selected filters.",
    "resetFilters": "Show all wines",
    "winesCount": "wines",
    "wineCount": "wine"
  },
  "TH": {
    "allTypes": "ไวน์ทั้งหมด",
    "allCountries": "ทุกแหล่งกำเนิด",
    "filterByCountry": "แหล่งกำเนิด",
    "italianFirstBadge": "คัดสรรพิเศษจากอิตาลี",
    "noWinesFound": "ไม่พบรายการไวน์ตามตัวกรองที่เลือก",
    "resetFilters": "แสดงไวน์ทั้งหมด",
    "winesCount": "รายการ",
    "wineCount": "รายการ"
  },
  "DE": {
    "allTypes": "Alle Weine",
    "allCountries": "Alle Herkunftsländer",
    "filterByCountry": "Herkunft",
    "italianFirstBadge": "Italienische Auswahl im Fokus",
    "noWinesFound": "Keine Weine für die ausgewählten Filter gefunden.",
    "resetFilters": "Alle Weine anzeigen",
    "winesCount": "Weine",
    "wineCount": "Wein"
  },
  "MM": {
    "allTypes": "ဝိုင် အားလုံး",
    "allCountries": "မူရင်းနိုင်ငံ အားလုံး",
    "filterByCountry": "မူရင်းနိုင်ငံ",
    "italianFirstBadge": "အီတလီ အထူးရွေးချယ်မှု",
    "noWinesFound": "ရွေးချယ်ထားသော စစ်ထုတ်မှုနှင့် ကိုက်ညီသော ဝိုင် မရှိပါ။",
    "resetFilters": "ဝိုင် အားလုံး ပြသရန်",
    "winesCount": "မျိုး",
    "wineCount": "မျိုး"
  },
  "ES": {
    "allTypes": "Todos los Vinos",
    "allCountries": "Todos los Orígenes",
    "filterByCountry": "Origen",
    "italianFirstBadge": "Selección Italiana Destacada",
    "noWinesFound": "No se encontraron vinos con los filtros seleccionados.",
    "resetFilters": "Mostrar todos los vinos",
    "winesCount": "vinos",
    "wineCount": "vino"
  },
  "FR": {
    "allTypes": "Tous les Vins",
    "allCountries": "Toutes les Origines",
    "filterByCountry": "Origine",
    "italianFirstBadge": "Sélection Italienne à l'Honneur",
    "noWinesFound": "Aucun vin trouvé avec les filtres sélectionnés.",
    "resetFilters": "Afficher tous les vins",
    "winesCount": "vins",
    "wineCount": "vin"
  },
  "RU": {
    "allTypes": "Все Вина",
    "allCountries": "Все Страны",
    "filterByCountry": "Происхождение",
    "italianFirstBadge": "Итальянская Коллекция",
    "noWinesFound": "Вина не найдены по выбранным фильтрам.",
    "resetFilters": "Показать все вина",
    "winesCount": "вин",
    "wineCount": "вино"
  },
  "ZH": {
    "allTypes": "所有葡萄酒",
    "allCountries": "所有产地",
    "filterByCountry": "产地",
    "italianFirstBadge": "精选意大利佳酿",
    "noWinesFound": "未找到符合所选条件的葡萄酒。",
    "resetFilters": "显示所有葡萄酒",
    "winesCount": "款",
    "wineCount": "款"
  }
};
