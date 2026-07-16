export interface ExtraOption {
  id: string;
  name: string;
  nameTh: string;
  sku: string;
  price: number;
}

export interface Variant {
  id: string;
  name: string;
  nameTh: string;
  sku: string;
  price: number;
  priceModifier: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  price: number;
  image: string;
  image_file?: string;
  sku?: string;
  variants?: Variant[];
  extras?: ExtraOption[];
  allowed_extras_group?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  nameTh: string;
  icon: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    "id": "traditional-italian-pizza",
    "name": "Traditional Italian Pizza",
    "nameTh": "พิซซ่าอิตาเลียนแบบดั้งเดิม",
    "icon": "🍕",
    "items": [
      {
        "id": "pizza-marinara-vegan",
        "name": "PIZZA MARINARA Vegan",
        "nameTh": "พิซซ่ามารีนาร่า มังสวิรัติ",
        "description": "Tomato Sauce, Garlic, Olive Oil",
        "descriptionTh": "ซอสมะเขือเทศ, กระเทียม, น้ำมันมะกอก",
        "price": 170,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/01-pizza-marinara-vegan.webp",
        "image_file": "01-Pizza/01-pizza-marinara-vegan.webp",
        "sku": "",
        "variants": [
          {
            "id": "10000",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10000",
            "price": 170,
            "priceModifier": 0
          },
          {
            "id": "10136",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10136",
            "price": 100,
            "priceModifier": -70
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-margherita",
        "name": "PIZZA MARGHERITA",
        "nameTh": "พิซซ่ามาร์การิต้า",
        "description": "Tomato Sauce, Olive Oil, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ชีสมอซซาเรลล่า",
        "price": 190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/02-pizza-margherita.webp",
        "image_file": "01-Pizza/02-pizza-margherita.webp",
        "sku": "",
        "variants": [
          {
            "id": "10001",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10001",
            "price": 190,
            "priceModifier": 0
          },
          {
            "id": "10119",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10119",
            "price": 120,
            "priceModifier": -70
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-sweet-bell-pepper-vegan",
        "name": "PIZZA SWEET BELL PEPPER Vegan",
        "nameTh": "พิซซ่าพริกหวานมังสวิรัติ",
        "description": "Tomato Sauce, Olive Oil, Sweet Bell Peppers",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, พริกหวาน",
        "price": 230,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/03-pizza-sweet-bell-pepper-vegan.webp",
        "image_file": "01-Pizza/03-pizza-sweet-bell-pepper-vegan.webp",
        "sku": "",
        "variants": [
          {
            "id": "10002",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10002",
            "price": 230,
            "priceModifier": 0
          },
          {
            "id": "10234",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10234",
            "price": 130,
            "priceModifier": -100
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "calzone",
        "name": "CALZONE",
        "nameTh": "คัลโซเน่",
        "description": "Tomato Sauce, Olive Oil, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ชีสมอสซาเรลล่า",
        "price": 210,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/04-calzone.webp",
        "image_file": "01-Pizza/04-calzone.webp",
        "sku": "",
        "variants": [
          {
            "id": "10003",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10003",
            "price": 210,
            "priceModifier": 0
          },
          {
            "id": "10014",
            "name": "12\" (Ham & Cheese)",
            "nameTh": "12\" (Ham & Cheese)",
            "sku": "10014",
            "price": 250,
            "priceModifier": 40
          },
          {
            "id": "10041",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10041",
            "price": 140,
            "priceModifier": -70
          },
          {
            "id": "10066",
            "name": "8\" (Ham & Cheese)",
            "nameTh": "8\" (Ham & Cheese)",
            "sku": "10066",
            "price": 165,
            "priceModifier": -45
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-bismark",
        "name": "PIZZA BISMARK",
        "nameTh": "พิซซ่าบิสมาร์ก",
        "description": "Tomato Sauce, Olive Oil, Egg, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ไข่, ชีสมอซซาเรลล่า",
        "price": 240,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/05-pizza-bismark.webp",
        "image_file": "01-Pizza/05-pizza-bismark.webp",
        "sku": "",
        "variants": [
          {
            "id": "10004",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10004",
            "price": 240,
            "priceModifier": 0
          },
          {
            "id": "10104",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10104",
            "price": 150,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-ham-and-cheese",
        "name": "PIZZA HAM & CHEESE",
        "nameTh": "พิซซ่าแฮมและชีส",
        "description": "Tomato Sauce, Olive Oil, Ham, Egg, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, แฮม, ชีสมอซซาเรลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/06-pizza-ham-and-cheese.webp",
        "image_file": "01-Pizza/06-pizza-ham-and-cheese.webp",
        "sku": "",
        "variants": [
          {
            "id": "10005",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10005",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10110",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10110",
            "price": 165,
            "priceModifier": -85
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-mushrooms-and-tofu-vegan",
        "name": "PIZZA MUSHROOMS & TOFU Vegan",
        "nameTh": "พิซซ่าเห็ดและเต้าหู้มังสวิรัติ",
        "description": "Tomato Sauce, Mushrooms, Tofu",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, เห็ด, เต้าหู้",
        "price": 230,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/07-pizza-mushrooms-and-tofu-vegan.webp",
        "image_file": "01-Pizza/07-pizza-mushrooms-and-tofu-vegan.webp",
        "sku": "",
        "variants": [
          {
            "id": "10006",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10006",
            "price": 230,
            "priceModifier": 0
          },
          {
            "id": "10137",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10137",
            "price": 150,
            "priceModifier": -80
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-nutella",
        "name": "PIZZA NUTELLA",
        "nameTh": "พิซซ่านูเทลล่า",
        "description": "Nutella",
        "descriptionTh": "นูเทลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/08-pizza-nutella.webp",
        "image_file": "01-Pizza/08-pizza-nutella.webp",
        "sku": "",
        "variants": [
          {
            "id": "10007",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10007",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10139",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10139",
            "price": 160,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-vegetables",
        "name": "PIZZA VEGETABLES",
        "nameTh": "พิซซ่าผัก",
        "description": "Tomato Sauce, Olive Oil, Vegetables, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ผัก, ชีสมอซซาเรลล่า",
        "price": 230,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/09-pizza-vegetables.webp",
        "image_file": "01-Pizza/09-pizza-vegetables.webp",
        "sku": "",
        "variants": [
          {
            "id": "10008",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10008",
            "price": 230,
            "priceModifier": 0
          },
          {
            "id": "10243",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10243",
            "price": 150,
            "priceModifier": -80
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-artichokes",
        "name": "PIZZA ARTICHOKES",
        "nameTh": "พิซซ่าอาร์ติโชค",
        "description": "Tomato Sauce, Olive Oil, Artichokes, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, อาร์ติโชค, ชีสมอซซาเรลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/10-pizza-artichokes.webp",
        "image_file": "01-Pizza/10-pizza-artichokes.webp",
        "sku": "",
        "variants": [
          {
            "id": "10009",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10009",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10090",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10090",
            "price": 160,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-bacon",
        "name": "PIZZA BACON",
        "nameTh": "พิซซ่าเบคอน",
        "description": "Tomato Sauce, Olive Oil, Bacon, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, เบคอน, ชีสมอซซาเรลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/11-pizza-bacon.webp",
        "image_file": "01-Pizza/11-pizza-bacon.webp",
        "sku": "",
        "variants": [
          {
            "id": "10010",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10010",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10018",
            "name": "12\" (Bismark)",
            "nameTh": "12\" (Bismark)",
            "sku": "10018",
            "price": 270,
            "priceModifier": 20
          },
          {
            "id": "10091",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10091",
            "price": 160,
            "priceModifier": -90
          },
          {
            "id": "10101",
            "name": "8\" (Bismark)",
            "nameTh": "8\" (Bismark)",
            "sku": "10101",
            "price": 170,
            "priceModifier": -80
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-pineapple",
        "name": "PIZZA PINEAPPLE",
        "nameTh": "พิซซ่าสับปะรด",
        "description": "Tomato Sauce, Olive Oil, Pineapple, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, สับปะรด, ชีสมอซซาเรลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/12-pizza-pineapple.webp",
        "image_file": "01-Pizza/12-pizza-pineapple.webp",
        "sku": "",
        "variants": [
          {
            "id": "10011",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10011",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10240",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10240",
            "price": 160,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-sweet-bell-pepper-cheese",
        "name": "PIZZA SWEET BELL PEPPER CHEESE",
        "nameTh": "พิซซ่าพริกหวานและชีส",
        "description": "Tomato Sauce, Olive Oil, Sweet Bell Peppers, Mozzarella",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, พริกหวาน, ชีสมอซซาเรลล่า",
        "price": 270,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/13-pizza-sweet-bell-pepper-cheese.webp",
        "image_file": "01-Pizza/13-pizza-sweet-bell-pepper-cheese.webp",
        "sku": "",
        "variants": [
          {
            "id": "10012",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10012",
            "price": 270,
            "priceModifier": 0
          },
          {
            "id": "10244",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10244",
            "price": 180,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-wurstel",
        "name": "PIZZA WURSTEL",
        "nameTh": "พิซซ่าใส้กรอกเยอรมัน",
        "description": "Tomato Sauce, German Sausage, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, ไส้กรอกเยอรมัน, ชีสมอซซาเรลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/14-pizza-wurstel.webp",
        "image_file": "01-Pizza/14-pizza-wurstel.webp",
        "sku": "",
        "variants": [
          {
            "id": "10013",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10013",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10245",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10245",
            "price": 160,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "calzone-ham-and-cheese",
        "name": "CALZONE HAM & CHEESE",
        "nameTh": "คัลโซเน่แฮมและชีส",
        "description": "Tomato Sauce, Ham, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, แฮม, ชีสมอสซาเรลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/15-calzone-ham-and-cheese.webp",
        "image_file": "01-Pizza/15-calzone-ham-and-cheese.webp",
        "sku": "",
        "variants": [
          {
            "id": "10014",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10014",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10066",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10066",
            "price": 165,
            "priceModifier": -85
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-salame",
        "name": "PIZZA SALAME",
        "nameTh": "พิซซ่าสลามี",
        "description": "Tomato Sauce, Olive Oil, Salame, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, สลามี, ชีสมอซซาเรลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/16-pizza-salame.webp",
        "image_file": "01-Pizza/16-pizza-salame.webp",
        "sku": "",
        "variants": [
          {
            "id": "10015",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10015",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10024",
            "name": "12\" (Gorgonzola)",
            "nameTh": "12\" (Gorgonzola)",
            "sku": "10024",
            "price": 320,
            "priceModifier": 70
          },
          {
            "id": "10016",
            "name": "12\" (Calabrese)",
            "nameTh": "12\" (Calabrese)",
            "sku": "10016",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10247",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10247",
            "price": 160,
            "priceModifier": -90
          },
          {
            "id": "10256",
            "name": "8\" (Gorgonzola)",
            "nameTh": "8\" (Gorgonzola)",
            "sku": "10256",
            "price": 210,
            "priceModifier": -40
          },
          {
            "id": "10248",
            "name": "8\" (Calabrese)",
            "nameTh": "8\" (Calabrese)",
            "sku": "10248",
            "price": 160,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-salame-calabrese",
        "name": "PIZZA SALAME CALABRESE",
        "nameTh": "พิซซ่าสลามีคาลาเบรี",
        "description": "Tomato Sauce, Olive Oil, Spicy Salame, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, สลามีเผ็ด, ชีสมอซซาเรลล่า",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/17-pizza-salame-calabrese.webp",
        "image_file": "01-Pizza/17-pizza-salame-calabrese.webp",
        "sku": "",
        "variants": [
          {
            "id": "10016",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10016",
            "price": 250,
            "priceModifier": 0
          },
          {
            "id": "10248",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10248",
            "price": 160,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-ham-and-artichokes",
        "name": "PIZZA HAM & ARTICHOKES",
        "nameTh": "พิซซ่าแฮมและอาร์ติโชค",
        "description": "Tomato Sauce, Olive Oil, Ham, Artichokes, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, แฮม, อาร์ติโชค, ชีสมอซซาเรลล่า",
        "price": 290,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/18-pizza-ham-and-artichokes.webp",
        "image_file": "01-Pizza/18-pizza-ham-and-artichokes.webp",
        "sku": "",
        "variants": [
          {
            "id": "10017",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10017",
            "price": 290,
            "priceModifier": 0
          },
          {
            "id": "10109",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10109",
            "price": 190,
            "priceModifier": -100
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-bacon-bismark",
        "name": "PIZZA BACON BISMARK",
        "nameTh": "พิซซ่าเบคอนบิสมาร์ก",
        "description": "Tomato Sauce, Olive Oil, Bacon, Egg, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, เบคอน, ไข่, ชีสมอซซาเรลล่า",
        "price": 270,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/19-pizza-bacon-bismark.webp",
        "image_file": "01-Pizza/19-pizza-bacon-bismark.webp",
        "sku": "",
        "variants": [
          {
            "id": "10018",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10018",
            "price": 270,
            "priceModifier": 0
          },
          {
            "id": "10101",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10101",
            "price": 170,
            "priceModifier": -100
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-ham-and-mushrooms",
        "name": "PIZZA HAM & MUSHROOMS",
        "nameTh": "พิซซ่าแฮมและเห็ด",
        "description": "Tomato Sauce, Olive Oil, Ham, Mushrooms, Mozzarella",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, แฮม, เห็ด, ชีสมอซซาเรลล่า",
        "price": 260,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/20-pizza-ham-and-mushrooms.webp",
        "image_file": "01-Pizza/20-pizza-ham-and-mushrooms.webp",
        "sku": "",
        "variants": [
          {
            "id": "10019",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10019",
            "price": 260,
            "priceModifier": 0
          },
          {
            "id": "10112",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10112",
            "price": 170,
            "priceModifier": -90
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-ham-and-sweet-bell-pepper",
        "name": "PIZZA HAM & SWEET BELL PEPPER",
        "nameTh": "พิซซ่าแฮมและพริกหวาน",
        "description": "Tomato Sauce, Olive Oil, Ham, Sweet Bell Peppers, Mozzarella",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, แฮม, พริกหวาน, ชีสมอซซาเรลล่า",
        "price": 290,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/21-pizza-ham-and-sweet-bell-pepper.webp",
        "image_file": "01-Pizza/21-pizza-ham-and-sweet-bell-pepper.webp",
        "sku": "",
        "variants": [
          {
            "id": "10020",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10020",
            "price": 290,
            "priceModifier": 0
          },
          {
            "id": "10115",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10115",
            "price": 190,
            "priceModifier": -100
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-pesto",
        "name": "PIZZA PESTO",
        "nameTh": "พิซซ่าเพสโต้",
        "description": "Pesto Basil Sauce, Olive Oil, Mozzarella Cheese",
        "descriptionTh": "ซอสเพสโต้, น้ำมันมะกอก, ชีสมอซซาเรลล่า",
        "price": 280,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/22-pizza-pesto.webp",
        "image_file": "01-Pizza/22-pizza-pesto.webp",
        "sku": "",
        "variants": [
          {
            "id": "10021",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10021",
            "price": 280,
            "priceModifier": 0
          },
          {
            "id": "10140",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10140",
            "price": 180,
            "priceModifier": -100
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-tuna",
        "name": "PIZZA TUNA",
        "nameTh": "พิซซ่าทูน่า",
        "description": "Tomato Sauce, Olive Oil, Garlic, Onions, Tuna, Mozzarella",
        "descriptionTh": "ซอสมะเขือเทศ, กระเทียม, หัวหอม, ปลาทูน่า, ชีสมอซซาเรลล่า",
        "price": 280,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/23-pizza-tuna.webp",
        "image_file": "01-Pizza/23-pizza-tuna.webp",
        "sku": "",
        "variants": [
          {
            "id": "10022",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10022",
            "price": 280,
            "priceModifier": 0
          },
          {
            "id": "10254",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10254",
            "price": 180,
            "priceModifier": -100
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-hawaiian",
        "name": "PIZZA HAWAIIAN",
        "nameTh": "พิซซ่าฮาวายเอี้ยน",
        "description": "Tomato Sauce, Olive Oil, Ham, Pineapple, Mozzarella Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, แฮม, สับปะรด, ชีสมอซซาเรลล่า",
        "price": 290,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/24-pizza-hawaiian.webp",
        "image_file": "01-Pizza/24-pizza-hawaiian.webp",
        "sku": "",
        "variants": [
          {
            "id": "10023",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10023",
            "price": 290,
            "priceModifier": 0
          },
          {
            "id": "10117",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10117",
            "price": 190,
            "priceModifier": -100
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-salame-and-gorgonzola",
        "name": "PIZZA SALAME & GORGONZOLA",
        "nameTh": "พิซซ่าสลามีกอร์กอนโซล่า",
        "description": "Tomato Sauce, Olive Oil, Salame, Gorgonzola, Mozzarella",
        "descriptionTh": "ซอสมะเขือเทศ, สลามี, กอร์กอนโซล่า, ชีสมอซซาเรลล่า",
        "price": 320,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/25-pizza-salame-and-gorgonzola.webp",
        "image_file": "01-Pizza/25-pizza-salame-and-gorgonzola.webp",
        "sku": "",
        "variants": [
          {
            "id": "10024",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10024",
            "price": 320,
            "priceModifier": 0
          },
          {
            "id": "10256",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10256",
            "price": 210,
            "priceModifier": -110
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-4-formaggi",
        "name": "PIZZA 4 FORMAGGI",
        "nameTh": "พิซซ่าชีสสี่ชนิด",
        "description": "Mozzarella Cheese, Cheddar, Gorgonzola Cheese, Parmesan",
        "descriptionTh": "ชีสมอสซาเรลล่า,เชดดาร์, ชีสกอร์กอนโซล่า, พาร์เมซาน",
        "price": 330,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/26-pizza-4-formaggi.webp",
        "image_file": "01-Pizza/26-pizza-4-formaggi.webp",
        "sku": "",
        "variants": [
          {
            "id": "10025",
            "name": "12\" (4)",
            "nameTh": "12\" (4)",
            "sku": "10025",
            "price": 330,
            "priceModifier": 0
          },
          {
            "id": "10067",
            "name": "8\" (4)",
            "nameTh": "8\" (4)",
            "sku": "10067",
            "price": 220,
            "priceModifier": -110
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-4-stagioni",
        "name": "PIZZA 4 STAGIONI",
        "nameTh": "พิซซ่าคาโวร์สตาจิโอเน",
        "description": "Tomato Sauce, Ham, Mushrooms, Artichokes, Olives, Mozzarella",
        "descriptionTh": "ซอสมะเขือเทศ, แฮม, เห็ด, อาร์ติโชค, มะกอก, ชีสมอซซาเรลล่า",
        "price": 350,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/27-pizza-4-stagioni.webp",
        "image_file": "01-Pizza/27-pizza-4-stagioni.webp",
        "sku": "",
        "variants": [
          {
            "id": "10026",
            "name": "12\" (4)",
            "nameTh": "12\" (4)",
            "sku": "10026",
            "price": 350,
            "priceModifier": 0
          },
          {
            "id": "10089",
            "name": "8\" (4)",
            "nameTh": "8\" (4)",
            "sku": "10089",
            "price": 240,
            "priceModifier": -110
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-capricciosa",
        "name": "PIZZA CAPRICCIOSA",
        "nameTh": "พิซซ่าคาปริโชซ่า",
        "description": "Tomato Sauce, Ham, Mushrooms, Artichokes, Olives, Mozzarella",
        "descriptionTh": "ซอสมะเขือเทศ, แฮม, เห็ด, อาร์ติโชค, มะกอก, ชีสมอซซาเรลล่า",
        "price": 350,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/28-pizza-capricciosa.webp",
        "image_file": "01-Pizza/28-pizza-capricciosa.webp",
        "sku": "",
        "variants": [
          {
            "id": "10027",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10027",
            "price": 350,
            "priceModifier": 0
          },
          {
            "id": "10106",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10106",
            "price": 240,
            "priceModifier": -110
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-flower-power",
        "name": "PIZZA FLOWER POWER",
        "nameTh": "พิซซ่าฟลาวเวอร์พาวเวอร์",
        "description": "Italian Sausage, Artichokes, Gorgonzola, Mozzarella",
        "descriptionTh": "ไส้กรอกอิตาลี, อาร์ติโชค, ชีสกอร์กอนโซล่า, ชีสมอสซาเรลล่า",
        "price": 350,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/29-pizza-flower-power.webp",
        "image_file": "01-Pizza/29-pizza-flower-power.webp",
        "sku": "",
        "variants": [
          {
            "id": "10028",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10028",
            "price": 350,
            "priceModifier": 0
          },
          {
            "id": "10108",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10108",
            "price": 240,
            "priceModifier": -110
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-puttanesca",
        "name": "PIZZA PUTTANESCA",
        "nameTh": "พิซซ่าพุตตาเนสกา",
        "description": "Tomato Sauce, Salty Anchovies, Capers, Olives, Mozzarella",
        "descriptionTh": "มะเขือเทศ, ปลาแอนโชวี่เค็ม,เคเปอร์, มะกอก, ชีสมอสซาเรลล่า",
        "price": 350,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/30-pizza-puttanesca.webp",
        "image_file": "01-Pizza/30-pizza-puttanesca.webp",
        "sku": "",
        "variants": [
          {
            "id": "10029",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10029",
            "price": 350,
            "priceModifier": 0
          },
          {
            "id": "10261",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10261",
            "price": 240,
            "priceModifier": -110
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-seafood",
        "name": "PIZZA SEAFOOD",
        "nameTh": "พิซซ่าซีฟู้ด",
        "description": "Tomato Sauce, Olive Oil, Garlic, Seafood",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, กระเทียม, ซีฟู้ด",
        "price": 350,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/31-pizza-seafood.webp",
        "image_file": "01-Pizza/31-pizza-seafood.webp",
        "sku": "",
        "variants": [
          {
            "id": "10030",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10030",
            "price": 350,
            "priceModifier": 0
          },
          {
            "id": "10262",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10262",
            "price": 240,
            "priceModifier": -110
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      },
      {
        "id": "pizza-stella",
        "name": "PIZZA STELLA",
        "nameTh": "พิซซ่าดาว",
        "description": "German Sausage, Bacon, Gorgonzola, Egg, Mozzarella",
        "descriptionTh": "ฮ็อตด็อก, เบคอน, ชีสกอร์กอนโซล่า, ไข่, ชีสมอสซาเรลล่า",
        "price": 350,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/32-pizza-stella.webp",
        "image_file": "01-Pizza/32-pizza-stella.webp",
        "sku": "",
        "variants": [
          {
            "id": "10031",
            "name": "12\"",
            "nameTh": "12\"",
            "sku": "10031",
            "price": 350,
            "priceModifier": 0
          },
          {
            "id": "10263",
            "name": "8\"",
            "nameTh": "8\"",
            "sku": "10263",
            "price": 240,
            "priceModifier": -110
          }
        ],
        "extras": [
          {
            "id": "10122",
            "name": "1 Egg Extra",
            "nameTh": "ไข่ไก่เพิ่ม",
            "sku": "10122",
            "price": 20
          },
          {
            "id": "10285",
            "name": "Anchovies Extra",
            "nameTh": "แองโชวี่เพิ่ม",
            "sku": "10285",
            "price": 50
          },
          {
            "id": "10096",
            "name": "Artichoke Extra",
            "nameTh": "อาร์ติโชคเพิ่ม",
            "sku": "10096",
            "price": 50
          },
          {
            "id": "10111",
            "name": "Bacon Extra",
            "nameTh": "เบคอนเพิ่ม",
            "sku": "10111",
            "price": 50
          },
          {
            "id": "10138",
            "name": "Black Olives Extra",
            "nameTh": "มะกอกดำเพิ่ม",
            "sku": "10138",
            "price": 40
          },
          {
            "id": "10121",
            "name": "Capers Extra",
            "nameTh": "เคเปอร์เพิ่ม",
            "sku": "10121",
            "price": 40
          },
          {
            "id": "10129",
            "name": "Chicken Ham Extra",
            "nameTh": "แฮมไก่เพิ่ม",
            "sku": "10129",
            "price": 50
          },
          {
            "id": "10141",
            "name": "Chicken Salame Extra",
            "nameTh": "ซาลามี่ไก่เพิ่ม",
            "sku": "10141",
            "price": 50
          },
          {
            "id": "10102",
            "name": "Extra \" Mozzarella Cheese",
            "nameTh": "ชีสมอซซาเรลล่าเพิ่ม",
            "sku": "10102",
            "price": 50
          },
          {
            "id": "10191",
            "name": "Fresh Tomato Extra",
            "nameTh": "มะเขือเทศสดเพิ่ม",
            "sku": "10191",
            "price": 20
          },
          {
            "id": "10118",
            "name": "Gorgonzola Extra",
            "nameTh": "ชีสกอร์กอนโซล่าเพิ่ม",
            "sku": "10118",
            "price": 50
          },
          {
            "id": "10113",
            "name": "Ham Extra",
            "nameTh": "แฮมเพิ่ม",
            "sku": "10113",
            "price": 50
          },
          {
            "id": "10236",
            "name": "Hotdog Extra",
            "nameTh": "ฮอทดอกเพิ่ม",
            "sku": "10236",
            "price": 50
          },
          {
            "id": "10094",
            "name": "Mushrooms Extra",
            "nameTh": "เห็ดเพิ่ม",
            "sku": "10094",
            "price": 30
          },
          {
            "id": "10068",
            "name": "Onion/Garlic Extra",
            "nameTh": "หอมใหญ่/กระเทียมเพิ่ม",
            "sku": "10068",
            "price": 20
          },
          {
            "id": "10171",
            "name": "Parmesan cheese 🧀",
            "nameTh": "พาร์เมซานชีสเพิ่ม",
            "sku": "10171",
            "price": 20
          },
          {
            "id": "10062",
            "name": "Pesto Sauce Extra",
            "nameTh": "ซอสเพสโต้เพิ่ม",
            "sku": "10062",
            "price": 60
          },
          {
            "id": "10095",
            "name": "Pineapple Extra",
            "nameTh": "สับปะรดเพิ่ม",
            "sku": "10095",
            "price": 30
          },
          {
            "id": "10088",
            "name": "Salame Calabrese Extra",
            "nameTh": "ซาลามี่คาลาเบรียเพิ่ม",
            "sku": "10088",
            "price": 50
          },
          {
            "id": "10087",
            "name": "Salame Extra",
            "nameTh": "ซาลามี่เพิ่ม",
            "sku": "10087",
            "price": 50
          },
          {
            "id": "10086",
            "name": "Sausage Extra",
            "nameTh": "ไส้กรอกเพิ่ม",
            "sku": "10086",
            "price": 50
          },
          {
            "id": "10107",
            "name": "Sweet Bell Peppers Extra",
            "nameTh": "พริกหวานเพิ่ม",
            "sku": "10107",
            "price": 50
          },
          {
            "id": "10172",
            "name": "Tofu Extra",
            "nameTh": "เต้าหู้เพิ่ม",
            "sku": "10172",
            "price": 50
          },
          {
            "id": "10120",
            "name": "Tuna Extra",
            "nameTh": "ทูน่าเพิ่ม",
            "sku": "10120",
            "price": 50
          },
          {
            "id": "10100",
            "name": "Vegetables Extra",
            "nameTh": "ผักเพิ่ม",
            "sku": "10100",
            "price": 50
          }
        ],
        "allowed_extras_group": "Pizza Extras"
      }
    ]
  },
  {
    "id": "pasta",
    "name": "Pasta",
    "nameTh": "พาสต้า",
    "icon": "🍝",
    "items": [
      {
        "id": "spaghetti-aglio-e-olio",
        "name": "SPAGHETTI AGLIO E OLIO",
        "nameTh": "สปาเกตตี้ อาลิโอ เอ โอลิโอ",
        "description": "Olive Oil, Garlic, Fresh Chili, Parmesan Cheese",
        "descriptionTh": "น้ำมันมะกอก, กระเทียม, พริกสด, ชีสพาร์เมซาน",
        "price": 110,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Garlic, Oil & Chili/01-spaghetti-aglio-e-olio.webp",
        "image_file": "02-Pasta/Garlic, Oil & Chili/01-spaghetti-aglio-e-olio.webp",
        "sku": "10153",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "penne-aglio-e-olio",
        "name": "PENNE AGLIO E OLIO",
        "nameTh": "เพนเน่ อาลิโอ เอ โอลิโอ",
        "description": "Olive Oil, Garlic, Fresh Chili, Parmesan Cheese",
        "descriptionTh": "น้ำมันมะกอก, กระเทียม, พริกสด, ชีสพาร์เมซาน",
        "price": 110,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Garlic, Oil & Chili/02-penne-aglio-e-olio.webp",
        "image_file": "02-Pasta/Garlic, Oil & Chili/02-penne-aglio-e-olio.webp",
        "sku": "10184",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tagliatelle-aglio-e-olio",
        "name": "TAGLIATELLE AGLIO E OLIO",
        "nameTh": "ทาเกรียเทลล่า พริกกระเทียม",
        "description": "Olive Oil, Garlic, Fresh Chili, Parmesan Cheese",
        "descriptionTh": "น้ำมันมะกอก, กระเทียม, พริกสด, ชีสพาร์เมซาน",
        "price": 130,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Garlic, Oil & Chili/03-tagliatelle-aglio-e-olio.webp",
        "image_file": "02-Pasta/Garlic, Oil & Chili/03-tagliatelle-aglio-e-olio.webp",
        "sku": "10200",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "gnocchi-aglio-e-olio",
        "name": "GNOCCHI AGLIO E OLIO",
        "nameTh": "ญอคคี พริกกระเทียม",
        "description": "Olive Oil, Garlic, Fresh Chili, Parmesan Cheese",
        "descriptionTh": "น้ำมันมะกอก, กระเทียม, พริกสด, ชีสพาร์เมซาน",
        "price": 150,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Garlic, Oil & Chili/04-gnocchi-aglio-e-olio.webp",
        "image_file": "02-Pasta/Garlic, Oil & Chili/04-gnocchi-aglio-e-olio.webp",
        "sku": "10180",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "ravioli-aglio-e-olio",
        "name": "RAVIOLI AGLIO E OLIO",
        "nameTh": "ราวิโอลี พริกกระเทียม",
        "description": "Olive Oil, Garlic, Fresh Chili, Parmesan Cheese",
        "descriptionTh": "น้ำมันมะกอก, กระเทียม, พริกสด, ชีสพาร์เมซาน",
        "price": 190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Garlic, Oil & Chili/05-ravioli-aglio-e-olio.webp",
        "image_file": "02-Pasta/Garlic, Oil & Chili/05-ravioli-aglio-e-olio.webp",
        "sku": "10050",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "spaghetti-al-pomodoro",
        "name": "SPAGHETTI AL POMODORO",
        "nameTh": "สปาเกตตี้ อัล โพโมโดโร่",
        "description": "Tomato Sauce, Olive Oil, Oregano, Basil, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ออริกาโน, โหระพา, พาร์เมซานชีส",
        "price": 150,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Tomato Sauce/06-spaghetti-al-pomodoro.webp",
        "image_file": "02-Pasta/Tomato Sauce/06-spaghetti-al-pomodoro.webp",
        "sku": "10185",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "penne-al-pomodoro",
        "name": "PENNE AL POMODORO",
        "nameTh": "เพนเน่ อัล โพโมโดโร่",
        "description": "Tomato Sauce, Olive Oil, Oregano, Basil, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ออริกาโน, โหระพา, พาร์เมซานชีส",
        "price": 150,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Tomato Sauce/07-penne-al-pomodoro.webp",
        "image_file": "02-Pasta/Tomato Sauce/07-penne-al-pomodoro.webp",
        "sku": "10170",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tagliatelle-al-pomodoro",
        "name": "TAGLIATELLE AL POMODORO",
        "nameTh": "ทาเกรียเทลล่า อัล มะเขือเทศ",
        "description": "Tomato Sauce, Olive Oil, Oregano, Basil, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ออริกาโน, โหระพา, พาร์เมซานชีส",
        "price": 170,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Tomato Sauce/08-tagliatelle-al-pomodoro.webp",
        "image_file": "02-Pasta/Tomato Sauce/08-tagliatelle-al-pomodoro.webp",
        "sku": "10198",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "gnocchi-al-pomodoro",
        "name": "GNOCCHI AL POMODORO",
        "nameTh": "ญอคคี อัล มะเขือเทศ",
        "description": "Tomato Sauce, Olive Oil, Oregano, Basil, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ออริกาโน, โหระพา, พาร์เมซานชีส",
        "price": 190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Tomato Sauce/09-gnocchi-al-pomodoro.webp",
        "image_file": "02-Pasta/Tomato Sauce/09-gnocchi-al-pomodoro.webp",
        "sku": "10179",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "ravioli-al-pomodoro",
        "name": "RAVIOLI AL POMODORO",
        "nameTh": "ราวิโอลี อัล มะเขือเทศ",
        "description": "Tomato Sauce, Olive Oil, Oregano, Basil, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, น้ำมันมะกอก, ออริกาโน, โหระพา, พาร์เมซานชีส",
        "price": 230,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Tomato Sauce/10-ravioli-al-pomodoro.webp",
        "image_file": "02-Pasta/Tomato Sauce/10-ravioli-al-pomodoro.webp",
        "sku": "10051",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "spaghetti-al-pesto",
        "name": "SPAGHETTI AL PESTO",
        "nameTh": "สปาเกตตี้ อัล เพสโต้",
        "description": "Basil, Garlic, Cashew Nuts, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "โหระพา, กระเทียม, เม็ดมะม่วง, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 150,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Pesto Genovese/11-spaghetti-al-pesto.webp",
        "image_file": "02-Pasta/Pesto Genovese/11-spaghetti-al-pesto.webp",
        "sku": "10158",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "penne-al-pesto",
        "name": "PENNE AL PESTO",
        "nameTh": "เพนเน่ อัล เพสโต้",
        "description": "Basil, Garlic, Cashew Nuts, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "โหระพา, กระเทียม, เม็ดมะม่วง, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 150,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Pesto Genovese/12-penne-al-pesto.webp",
        "image_file": "02-Pasta/Pesto Genovese/12-penne-al-pesto.webp",
        "sku": "10173",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tagliatelle-al-pesto",
        "name": "TAGLIATELLE AL PESTO",
        "nameTh": "ทาเกรียเทลล่า อัล เพสโต้",
        "description": "Basil, Garlic, Cashew Nuts, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "โหระพา, กระเทียม, เม็ดมะม่วง, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 170,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Pesto Genovese/13-tagliatelle-al-pesto.webp",
        "image_file": "02-Pasta/Pesto Genovese/13-tagliatelle-al-pesto.webp",
        "sku": "10194",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "gnocchi-al-pesto",
        "name": "GNOCCHI AL PESTO",
        "nameTh": "ญอคคี อัล เพสโต้",
        "description": "Basil, Garlic, Cashew Nuts, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "โหระพา, กระเทียม, เม็ดมะม่วง, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Pesto Genovese/14-gnocchi-al-pesto.webp",
        "image_file": "02-Pasta/Pesto Genovese/14-gnocchi-al-pesto.webp",
        "sku": "10175",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "ravioli-al-pesto",
        "name": "RAVIOLI AL PESTO",
        "nameTh": "ราวิโอลี อัล เพสโต้",
        "description": "Basil, Garlic, Cashew Nuts, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "โหระพา, กระเทียม, เม็ดมะม่วง, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 230,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Pesto Genovese/15-ravioli-al-pesto.webp",
        "image_file": "02-Pasta/Pesto Genovese/15-ravioli-al-pesto.webp",
        "sku": "10052",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "spaghetti-amatriciana",
        "name": "SPAGHETTI AMATRICIANA",
        "nameTh": "สปาเกตตี้ อามาทริเซียน่า",
        "description": "Tomato Sauce, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 160,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Amatriciana/16-spaghetti-amatriciana.webp",
        "image_file": "02-Pasta/Amatriciana/16-spaghetti-amatriciana.webp",
        "sku": "10152",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "penne-amatriciana",
        "name": "PENNE AMATRICIANA",
        "nameTh": "เพนเน่ อามาทริเซียน่า",
        "description": "Tomato Sauce, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 160,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Amatriciana/17-penne-amatriciana.webp",
        "image_file": "02-Pasta/Amatriciana/17-penne-amatriciana.webp",
        "sku": "10181",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tagliatelle-amatriciana",
        "name": "TAGLIATELLE AMATRICIANA",
        "nameTh": "ทาเกรียเทลล่า อามาทริเซียน่า",
        "description": "Tomato Sauce, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Amatriciana/18-tagliatelle-amatriciana.webp",
        "image_file": "02-Pasta/Amatriciana/18-tagliatelle-amatriciana.webp",
        "sku": "10196",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "gnocchi-amatriciana",
        "name": "GNOCCHI AMATRICIANA",
        "nameTh": "ญอคคี อามาทริเซียน่า",
        "description": "Tomato Sauce, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 200,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Amatriciana/19-gnocchi-amatriciana.webp",
        "image_file": "02-Pasta/Amatriciana/19-gnocchi-amatriciana.webp",
        "sku": "10177",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "ravioli-amatriciana",
        "name": "RAVIOLI AMATRICIANA",
        "nameTh": "ราวิโอลี อามาทริเซียน่า",
        "description": "Tomato Sauce, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ซอสมะเขือเทศ, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 240,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Amatriciana/20-ravioli-amatriciana.webp",
        "image_file": "02-Pasta/Amatriciana/20-ravioli-amatriciana.webp",
        "sku": "10053",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "spaghetti-alla-bolognese",
        "name": "SPAGHETTI ALLA BOLOGNESE",
        "nameTh": "สปาเกตตี้ อัลลา โบโลเนเซ่",
        "description": "Tomato Sauce, Pork, Olive Oil, Parmesan Cheese, Spices",
        "descriptionTh": "ซอสมะเขือเทศ, หมูสับ, น้ำมันมะกอก, ชีสพาร์เมซาน, เครื่องเทศ",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/21-spaghetti-alla-bolognese.webp",
        "image_file": "21-spaghetti-alla-bolognese.webp",
        "sku": "10160",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "penne-alla-bolognese",
        "name": "PENNE ALLA BOLOGNESE",
        "nameTh": "เพนเน่ อัลลา โบโลเนเซ่",
        "description": "Tomato Sauce, Pork, Olive Oil, Parmesan Cheese, Spices",
        "descriptionTh": "ซอสมะเขือเทศ, หมูสับ, น้ำมันมะกอก, ชีสพาร์เมซาน, เครื่องเทศ",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/22-penne-alla-bolognese.webp",
        "image_file": "22-penne-alla-bolognese.webp",
        "sku": "10155",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tagliatelle-alla-bolognese",
        "name": "TAGLIATELLE ALLA BOLOGNESE",
        "nameTh": "ทาเกรียเทลล่า อัลลา โบโลเนส",
        "description": "Tomato Sauce, Pork, Olive Oil, Parmesan Cheese, Spices",
        "descriptionTh": "ซอสมะเขือเทศ, หมูสับ, น้ำมันมะกอก, ชีสพาร์เมซาน, เครื่องเทศ",
        "price": 200,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/23-tagliatelle-alla-bolognese.webp",
        "image_file": "23-tagliatelle-alla-bolognese.webp",
        "sku": "10197",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "gnocchi-alla-bolognese",
        "name": "GNOCCHI ALLA BOLOGNESE",
        "nameTh": "ญอคคี อัลลา โบโลเนส",
        "description": "Tomato Sauce, Pork, Olive Oil, Parmesan Cheese, Spices",
        "descriptionTh": "ซอสมะเขือเทศ, หมูสับ, น้ำมันมะกอก, ชีสพาร์เมซาน, เครื่องเทศ",
        "price": 220,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/24-gnocchi-alla-bolognese.webp",
        "image_file": "24-gnocchi-alla-bolognese.webp",
        "sku": "10178",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "ravioli-alla-bolognese",
        "name": "RAVIOLI ALLA BOLOGNESE",
        "nameTh": "ราวิโอลี อัลลา โบโลเนส",
        "description": "Tomato Sauce, Pork, Olive Oil, Parmesan Cheese, Spices",
        "descriptionTh": "ซอสมะเขือเทศ, หมูสับ, น้ำมันมะกอก, ชีสพาร์เมซาน, เครื่องเทศ",
        "price": 260,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/25-ravioli-alla-bolognese.webp",
        "image_file": "25-ravioli-alla-bolognese.webp",
        "sku": "10054",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "spaghetti-alla-carbonara",
        "name": "SPAGHETTI ALLA CARBONARA",
        "nameTh": "สปาเกตตี้ อัลลา คาร์โบนารา",
        "description": "Egg, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ไข่, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Carbonara/26-spaghetti-alla-carbonara.webp",
        "image_file": "02-Pasta/Carbonara/26-spaghetti-alla-carbonara.webp",
        "sku": "10151",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "penne-alla-carbonara",
        "name": "PENNE ALLA CARBONARA",
        "nameTh": "เพนเน่ อัลลา คาร์โบนารา",
        "description": "Egg, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ไข่, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Carbonara/27-penne-alla-carbonara.webp",
        "image_file": "02-Pasta/Carbonara/27-penne-alla-carbonara.webp",
        "sku": "10182",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tagliatelle-alla-carbonara",
        "name": "TAGLIATELLE ALLA CARBONARA",
        "nameTh": "ทาเกรียเทลล่า อัลลา คาร์โบนารา",
        "description": "Egg, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ไข่, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 200,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Carbonara/28-tagliatelle-alla-carbonara.webp",
        "image_file": "02-Pasta/Carbonara/28-tagliatelle-alla-carbonara.webp",
        "sku": "10195",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "gnocchi-alla-carbonara",
        "name": "GNOCCHI ALLA CARBONARA",
        "nameTh": "ญอคคี อัลลา คาร์โบนารา",
        "description": "Egg, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ไข่, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 220,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Carbonara/29-gnocchi-alla-carbonara.webp",
        "image_file": "02-Pasta/Carbonara/29-gnocchi-alla-carbonara.webp",
        "sku": "10176",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "ravioli-alla-carbonara",
        "name": "RAVIOLI ALLA CARBONARA",
        "nameTh": "ราวิโอลี อัลลา คาร์โบนารา",
        "description": "Egg, Guanciale, Olive Oil, Pecorino Romano, Parmesan Cheese",
        "descriptionTh": "ไข่, หมูแก้ม, น้ำมันมะกอก, ชีสเปโคริโน, ชีสพาร์เมซาน",
        "price": 260,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Carbonara/30-ravioli-alla-carbonara.webp",
        "image_file": "02-Pasta/Carbonara/30-ravioli-alla-carbonara.webp",
        "sku": "10055",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "spaghetti-4-formaggi",
        "name": "SPAGHETTI 4 FORMAGGI",
        "nameTh": "สปาเก็ตตี้ 4 ชีส",
        "description": "Gorgonzola Cheese, Parmisan, Mozzarella, Kitchen Cream",
        "descriptionTh": "กอร์กอนโซลา, พาร์มีจาโน, มอซซาเรลลา, ครีมทำอาหาร",
        "price": 200,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Four Cheeses/31-spaghetti-4-formaggi.webp",
        "image_file": "02-Pasta/Four Cheeses/31-spaghetti-4-formaggi.webp",
        "sku": "10188",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "penne-4-formaggi",
        "name": "PENNE 4 FORMAGGI",
        "nameTh": "เพนเน่ 4 ชีส",
        "description": "Gorgonzola Cheese, Parmisan, Mozzarella, Kitchen Cream",
        "descriptionTh": "กอร์กอนโซลา, พาร์มีจาโน, มอซซาเรลลา, ครีมทำอาหาร",
        "price": 200,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Four Cheeses/32-penne-4-formaggi.webp",
        "image_file": "02-Pasta/Four Cheeses/32-penne-4-formaggi.webp",
        "sku": "10187",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tagliatelle-4-formaggi",
        "name": "TAGLIATELLE 4 FORMAGGI",
        "nameTh": "ทาเกรียเทลล่า 4 ชีส",
        "description": "Gorgonzola Cheese, Parmisan, Mozzarella, Kitchen Cream",
        "descriptionTh": "กอร์กอนโซลา, พาร์มีจาโน, มอซซาเรลลา, ครีมทำอาหาร",
        "price": 220,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Four Cheeses/33-tagliatelle-4-formaggi.webp",
        "image_file": "02-Pasta/Four Cheeses/33-tagliatelle-4-formaggi.webp",
        "sku": "10199",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "gnocchi-4-formaggi",
        "name": "GNOCCHI 4 FORMAGGI",
        "nameTh": "ญอคคี 4 ชีส",
        "description": "Gorgonzola Cheese, Parmisan, Mozzarella, Kitchen Cream",
        "descriptionTh": "กอร์กอนโซลา, พาร์มีจาโน, มอซซาเรลลา, ครีมทำอาหาร",
        "price": 240,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Four Cheeses/34-gnocchi-4-formaggi.webp",
        "image_file": "02-Pasta/Four Cheeses/34-gnocchi-4-formaggi.webp",
        "sku": "10186",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "ravioli-4-formaggi",
        "name": "RAVIOLI 4 FORMAGGI",
        "nameTh": "ราวิโอลี 4 ชีส",
        "description": "Gorgonzola Cheese, Parmisan, Mozzarella, Kitchen Cream",
        "descriptionTh": "กอร์กอนโซลา, พาร์มีจาโน, มอซซาเรลลา, ครีมทำอาหาร",
        "price": 280,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Four Cheeses/35-ravioli-4-formaggi.webp",
        "image_file": "02-Pasta/Four Cheeses/35-ravioli-4-formaggi.webp",
        "sku": "10056",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "spaghetti-flower-power",
        "name": "SPAGHETTI FLOWER POWER",
        "nameTh": "สปาเกตตี้ ฟลาวเวอร์ พาวเวอร์",
        "description": "Italian Sausage, Artichokes, Gorgonzola Cheese, Black Pepper",
        "descriptionTh": "ไส้กรอกอิตาเลียน, อาติโช๊ค, กอร์กอนโซล่าชีส, พริกไทยดำ",
        "price": 230,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Flower Power/36-spaghetti-flower-power.webp",
        "image_file": "02-Pasta/Flower Power/36-spaghetti-flower-power.webp",
        "sku": "10159",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "penne-flower-power",
        "name": "PENNE FLOWER POWER",
        "nameTh": "เพนเน่ ฟลาวเวอร์ พาวเวอร์",
        "description": "Italian Sausage, Artichokes, Gorgonzola Cheese, Black Pepper",
        "descriptionTh": "ไส้กรอกอิตาเลียน, อาติโช๊ค, กอร์กอนโซล่าชีส, พริกไทยดำ",
        "price": 230,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Flower Power/37-penne-flower-power.webp",
        "image_file": "02-Pasta/Flower Power/37-penne-flower-power.webp",
        "sku": "10183",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tagliatelle-flower-power",
        "name": "TAGLIATELLE FLOWER POWER",
        "nameTh": "ทาเกรียเทลล่า ฟลาวเวอร์ พาวเวอร์",
        "description": "Italian Sausage, Artichokes, Gorgonzola Cheese, Black Pepper",
        "descriptionTh": "ไส้กรอกอิตาเลียน, อาติโช๊ค, กอร์กอนโซล่าชีส, พริกไทยดำ",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Flower Power/38-tagliatelle-flower-power.webp",
        "image_file": "02-Pasta/Flower Power/38-tagliatelle-flower-power.webp",
        "sku": "10192",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "gnocchi-flower-power",
        "name": "GNOCCHI FLOWER POWER",
        "nameTh": "ญอคคี ฟลาวเวอร์ พาวเวอร์",
        "description": "Italian Sausage, Artichokes, Gorgonzola Cheese, Black Pepper",
        "descriptionTh": "ไส้กรอกอิตาเลียน, อาติโช๊ค, กอร์กอนโซล่าชีส, พริกไทยดำ",
        "price": 270,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Flower Power/39-gnocchi-flower-power.webp",
        "image_file": "02-Pasta/Flower Power/39-gnocchi-flower-power.webp",
        "sku": "10174",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "ravioli-flower-power",
        "name": "RAVIOLI FLOWER POWER",
        "nameTh": "ราวิโอลี ฟลาวเวอร์ พาวเวอร์",
        "description": "Italian Sausage, Artichokes, Gorgonzola Cheese, Black Pepper",
        "descriptionTh": "ไส้กรอกอิตาเลียน, อาติโช๊ค, กอร์กอนโซล่าชีส, พริกไทยดำ",
        "price": 310,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Flower Power/40-ravioli-flower-power.webp",
        "image_file": "02-Pasta/Flower Power/40-ravioli-flower-power.webp",
        "sku": "10057",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "baked-bolognese-lasagna",
        "name": "BAKED BOLOGNESE LASAGNA",
        "nameTh": "ลาซานญ่าอบซอสโบโลเนส",
        "description": "Béchamel, Bolognese Sauce, Parmesan",
        "descriptionTh": "เบชาเมล, ซอสโบโลเนส, พาร์เมซาน",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/03-Lasagne/01-baked-bolognese-lasagna.png",
        "image_file": "03-Lasagne/01-baked-bolognese-lasagna.png",
        "sku": "10038",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "baked-pesto-lasagna",
        "name": "BAKED PESTO LASAGNA",
        "nameTh": "ลาซานญ่าอบเพสโต้",
        "description": "Béchamel, Pesto Sauce, Parmesan",
        "descriptionTh": "เบชาเมล, ซอสเพสโต้, พาร์เมซาน",
        "price": 270,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/03-Lasagne/02-baked-pesto-lasagna.png",
        "image_file": "03-Lasagne/02-baked-pesto-lasagna.png",
        "sku": "10302",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "baked-seafood-lasagna",
        "name": "BAKED SEAFOOD LASAGNA",
        "nameTh": "ลาซานญ่าอบซีฟู้ด",
        "description": "Béchamel, Seafood, Parmesan",
        "descriptionTh": "เบชาเมล, ซีฟู้ด, พาร์เมซาน",
        "price": 290,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/03-Lasagne/03-baked-seafood-lasagna.png",
        "image_file": "03-Lasagne/03-baked-seafood-lasagna.png",
        "sku": "10303",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  },
  {
    "id": "italian-salads",
    "name": "Italian Salads",
    "nameTh": "สลัดอิตาเลียน",
    "icon": "🥗",
    "items": [
      {
        "id": "egg-and-vegetable-salad",
        "name": "EGG AND VEGETABLE SALAD",
        "nameTh": "สลัดไข่และผัก",
        "description": "2 Boiled Eggs, Cabbage, Cucumber, Tomato, Onions, Mayonnaise, Yogurt Dressing",
        "descriptionTh": "ไข่ต้มสุก 2 ฟอง, กะหล่ำปลี, แตงกวา, มะเขือเทศ, หัวหอม, มายองเนส, น้ำสลัดโยเกิร์ต",
        "price": 130,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/01-egg-and-vegetable-salad.webp",
        "image_file": "04-Italian-Salads/01-egg-and-vegetable-salad.webp",
        "sku": "10206",
        "variants": [],
        "extras": [
          {
            "id": "10035",
            "name": "Chicken Extra",
            "nameTh": "ไก่เพิ่ม",
            "sku": "10035",
            "price": 40
          }
        ],
        "allowed_extras_group": "Salad Extras"
      },
      {
        "id": "potato-salad",
        "name": "POTATO SALAD",
        "nameTh": "สลัดมันฝรั่ง",
        "description": "Tuna, Boiled Potatoes, 1 Boiled Egg, Cabbage, Tomato, Onions, Yogurt Dressing",
        "descriptionTh": "ทูน่า, มันฝรั่งต้ม, ไข่ต้ม 1 ฟอง, กะหล่ำปลี, มะเขือเทศ, หัวหอม, น้ำสลัดโยเกิร์ต",
        "price": 160,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/02-potato-salad.webp",
        "image_file": "04-Italian-Salads/02-potato-salad.webp",
        "sku": "10207",
        "variants": [],
        "extras": [
          {
            "id": "10035",
            "name": "Chicken Extra",
            "nameTh": "ไก่เพิ่ม",
            "sku": "10035",
            "price": 40
          }
        ],
        "allowed_extras_group": "Salad Extras"
      },
      {
        "id": "chicken-salad",
        "name": "CHICKEN SALAD",
        "nameTh": "สลัดไก่",
        "description": "Boiled Chicken, Tomato, Cabbage, Carrots, Cucumber, Mustard, Yogurt Dressing",
        "descriptionTh": "ไก่ต้ม, มะเขือเทศ, กะหล่ำปลี, แครอท, แตงกวา, มัสตาร์ด, เสิร์ฟพร้อมน้ำสลัดโยเกิร์ต",
        "price": 190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/03-chicken-salad.webp",
        "image_file": "04-Italian-Salads/03-chicken-salad.webp",
        "sku": "10205",
        "variants": [],
        "extras": [
          {
            "id": "10035",
            "name": "Chicken Extra",
            "nameTh": "ไก่เพิ่ม",
            "sku": "10035",
            "price": 40
          }
        ],
        "allowed_extras_group": "Salad Extras"
      },
      {
        "id": "tuna-and-egg-salad",
        "name": "TUNA AND EGG SALAD",
        "nameTh": "สลัดทูน่าและไข่",
        "description": "Tuna, 2 Boiled Eggs, Cabbage, Tomato, Cucumber, Onion, Yogurt Dressing",
        "descriptionTh": "ทูน่า, ไข่ต้ม 2 ฟอง, กะหล่ำปลี, มะเขือเทศ, แตงกวา, หัวหอม, โยเกิร์ต, น้ำสลัด",
        "price": 190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/04-tuna-and-egg-salad.webp",
        "image_file": "04-Italian-Salads/04-tuna-and-egg-salad.webp",
        "sku": "10208",
        "variants": [],
        "extras": [
          {
            "id": "10035",
            "name": "Chicken Extra",
            "nameTh": "ไก่เพิ่ม",
            "sku": "10035",
            "price": 40
          }
        ],
        "allowed_extras_group": "Salad Extras"
      }
    ]
  },
  {
    "id": "pizza-sandwich",
    "name": "Pizza Sandwich",
    "nameTh": "พิตซ่าแซนด์วิช",
    "icon": "🥪",
    "items": [
      {
        "id": "pizza-sandwich-parma-ham",
        "name": "PIZZA SANDWICH PARMA HAM",
        "nameTh": "พิซซ่าแซนด์วิช พาร์ม่าแฮม",
        "description": "Parma Cooked Ham, Mozzarella Cheese, Lettuce, Fresh Tomato, Sauces",
        "descriptionTh": "แฮมอบสไตล์พาร์ม่า, มอซซาเรลล่าชีส, ผักกาดหอม, มะเขือเทศสด, ซอสตามที่เลือก",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/01-pizza-sandwich-parma-ham.webp",
        "image_file": "05-Pizza-Sandwiches/01-pizza-sandwich-parma-ham.webp",
        "sku": "10045",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "pizza-sandwich-salame",
        "name": "PIZZA SANDWICH SALAME",
        "nameTh": "พิซซ่าแซนด์วิช ซาลามี่",
        "description": "Salami, Mozzarella Cheese, Lettuce, Fresh Tomato, Sauces",
        "descriptionTh": "ซาลามี่, มอซซาเรลล่าชีส, ผักกาดหอม, มะเขือเทศสด, ซอสตามที่เลือก",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/02-pizza-sandwich-salame.webp",
        "image_file": "05-Pizza-Sandwiches/02-pizza-sandwich-salame.webp",
        "sku": "10046",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "pizza-sandwich-spicy-salame",
        "name": "PIZZA SANDWICH SPICY SALAME",
        "nameTh": "พิซซ่าแซนด์วิช ซาลามี่เผ็ด",
        "description": "Spicy Salami, Mozzarella Cheese, Lettuce, Fresh Tomato, Sauces",
        "descriptionTh": "ซาลามี่เผ็ด, มอซซาเรลล่าชีส, ผักกาดหอม, มะเขือเทศสด, ซอสตามที่เลือก",
        "price": 200,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/03-pizza-sandwich-spicy-salame.webp",
        "image_file": "05-Pizza-Sandwiches/03-pizza-sandwich-spicy-salame.webp",
        "sku": "10047",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  },
  {
    "id": "pizza-burgers",
    "name": "Pizza Burgers",
    "nameTh": "พิซซ่าเบอร์เกอร์",
    "icon": "🍔",
    "items": [
      {
        "id": "chicken-pizza-burger-with-french-fries",
        "name": "CHICKEN PIZZA BURGER WITH FRENCH FRIES",
        "nameTh": "พิซซ่าเบอร์เกอร์ไก่พร้อมมันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/01-chicken-pizza-burger-with-french-fries.webp",
        "image_file": "06-Pizza-Burgers/01-chicken-pizza-burger-with-french-fries.webp",
        "sku": "10168",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "pork-pizza-burger-with-french-fries",
        "name": "PORK PIZZA BURGER WITH FRENCH FRIES",
        "nameTh": "พิซซ่าเบอร์เกอร์หมูพร้อมมันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 180,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/02-pork-pizza-burger-with-french-fries.webp",
        "image_file": "06-Pizza-Burgers/02-pork-pizza-burger-with-french-fries.webp",
        "sku": "10168",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "beef-pizza-burger-with-french-fries",
        "name": "BEEF PIZZA BURGER WITH FRENCH FRIES",
        "nameTh": "พิซซ่าเบอร์เกอร์เนื้อวัวพร้อมมันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 220,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/03-beef-pizza-burger-with-french-fries.webp",
        "image_file": "06-Pizza-Burgers/03-beef-pizza-burger-with-french-fries.webp",
        "sku": "10167",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "fish-pizza-burger-with-french-fries",
        "name": "FISH PIZZA BURGER WITH FRENCH FRIES",
        "nameTh": "พิซซ่าเบอร์เกอร์ปลา พร้อมมันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 210,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/04-fish-pizza-burger-with-french-fries.webp",
        "image_file": "06-Pizza-Burgers/04-fish-pizza-burger-with-french-fries.webp",
        "sku": "10304",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "cheese-pizza-burger-with-french-fries",
        "name": "CHEESE PIZZA BURGER WITH FRENCH FRIES",
        "nameTh": "พิซซ่าเบอร์เกอร์ชีสพร้อมมันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 210,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/05-cheese-pizza-burger-with-french-fries.webp",
        "image_file": "06-Pizza-Burgers/05-cheese-pizza-burger-with-french-fries.webp",
        "sku": "10049",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  },
  {
    "id": "french-fries",
    "name": "French Fries",
    "nameTh": "มันฝรั่งทอด",
    "icon": "🍟",
    "items": [
      {
        "id": "french-fries",
        "name": "FRENCH FRIES",
        "nameTh": "มันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/01-french-fries.webp",
        "image_file": "07-French-Fries/01-french-fries.webp",
        "sku": "10154",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "sausages-and-french-fries",
        "name": "SAUSAGES & FRENCH FRIES",
        "nameTh": "ไส้กรอก & มันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 160,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/02-sausages-and-french-fries.webp",
        "image_file": "07-French-Fries/02-sausages-and-french-fries.webp",
        "sku": "10042",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "onion-rings-and-french-fries",
        "name": "ONION RINGS & FRENCH FRIES",
        "nameTh": "หอมทอดกรอบ & มันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/03-onion-rings-and-french-fries.webp",
        "image_file": "07-French-Fries/03-onion-rings-and-french-fries.webp",
        "sku": "10034",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "chicken-nuggets-and-french-fries",
        "name": "CHICKEN NUGGETS & FRENCH FRIES",
        "nameTh": "นักเก็ตไก่ & มันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 220,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/04-chicken-nuggets-and-french-fries.webp",
        "image_file": "07-French-Fries/04-chicken-nuggets-and-french-fries.webp",
        "sku": "10036",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "fish-nuggets-and-french-fries",
        "name": "FISH NUGGETS & FRENCH FRIES",
        "nameTh": "นักเก็ตปลา & มันฝรั่งทอด",
        "description": "",
        "descriptionTh": "",
        "price": 250,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/05-fish-nuggets-and-french-fries.webp",
        "image_file": "07-French-Fries/05-fish-nuggets-and-french-fries.webp",
        "sku": "10043",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  },
  {
    "id": "desserts",
    "name": "Desserts",
    "nameTh": "ของหวาน",
    "icon": "🍰",
    "items": [
      {
        "id": "affogato-al-caffè",
        "name": "AFFOGATO AL CAFFÈ",
        "nameTh": "อัฟโฟกาโต้อัลคาเฟ่",
        "description": "",
        "descriptionTh": "",
        "price": 130,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/01-affogato-al-caffe.webp",
        "image_file": "08-Desserts/01-affogato-al-caffe.webp",
        "sku": "10201",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "cake-of-the-day",
        "name": "CAKE OF THE DAY",
        "nameTh": "เค้กประจำวัน",
        "description": "",
        "descriptionTh": "",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/02-cake-of-the-day.webp",
        "image_file": "08-Desserts/02-cake-of-the-day.webp",
        "sku": "10032",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "tiramisu",
        "name": "TIRAMISU",
        "nameTh": "ทีรามิสุ",
        "description": "",
        "descriptionTh": "",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/03-tiramisu.webp",
        "image_file": "08-Desserts/03-tiramisu.webp",
        "sku": "10135",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "crepes",
        "name": "CREPES",
        "nameTh": "เครป",
        "description": "",
        "descriptionTh": "",
        "price": 150,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/04-crepes.webp",
        "image_file": "08-Desserts/04-crepes.webp",
        "sku": "",
        "variants": [
          {
            "id": "10291",
            "name": "Banana",
            "nameTh": "กล้วย",
            "sku": "10291",
            "price": 150,
            "priceModifier": 0
          },
          {
            "id": "10290",
            "name": "Normal",
            "nameTh": "ธรรมดา",
            "sku": "10290",
            "price": 120,
            "priceModifier": -30
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "pancake",
        "name": "PANCAKE",
        "nameTh": "แพนเค้ก",
        "description": "",
        "descriptionTh": "",
        "price": 210,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/05-pancake.webp",
        "image_file": "08-Desserts/05-pancake.webp",
        "sku": "",
        "variants": [
          {
            "id": "10293",
            "name": "Banana",
            "nameTh": "กล้วย",
            "sku": "10293",
            "price": 210,
            "priceModifier": 0
          },
          {
            "id": "10292",
            "name": "Normal",
            "nameTh": "ธรรมดา",
            "sku": "10292",
            "price": 180,
            "priceModifier": -30
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  },
  {
    "id": "breakfast-and-snacks",
    "name": "Breakfast And Snacks",
    "nameTh": "อาหารเช้าและของว่าง",
    "icon": "🍳",
    "items": [
      {
        "id": "italian-breakfast",
        "name": "ITALIAN BREAKFAST",
        "nameTh": "อาหารเช้าแบบอิตาเลียน",
        "description": "Cake of the Day, Cappuccino, Fruit Juice",
        "descriptionTh": "เค้กประจำวัน, คาปูชิโน่, น้ำผลไม้",
        "price": 170,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/01-italian-breakfast.webp",
        "image_file": "09-Breakfast-and-Snacks/01-italian-breakfast.webp",
        "sku": "10224",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "american-breakfast",
        "name": "AMERICAN BREAKFAST",
        "nameTh": "อาหารเช้าแบบอเมริกัน",
        "description": "2 Fried Eggs, Bacon, Butter, Jam, Coffee, Fruit Juice, 2 Toasted Slices",
        "descriptionTh": "ไข่ดาว 2 ฟอง, เบคอน, เนย, แยม, กาแฟ, น้ำผลไม้, ขนมปัง 2 แผ่น",
        "price": 190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/02-american-breakfast.webp",
        "image_file": "09-Breakfast-and-Snacks/02-american-breakfast.webp",
        "sku": "10223",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "eggs-and-bacon",
        "name": "EGGS & BACON",
        "nameTh": "ไข่และเบคอน",
        "description": "2 Fried Eggs, Bacon, 1 Toasted Slice",
        "descriptionTh": "ไข่ดาว 2 ฟอง, เบคอน, ขนมปัง 1 แผ่น",
        "price": 110,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/03-eggs-and-bacon.webp",
        "image_file": "09-Breakfast-and-Snacks/03-eggs-and-bacon.webp",
        "sku": "10268",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "butter-and-jam",
        "name": "BUTTER & JAM",
        "nameTh": "เนยและแยม",
        "description": "2 Toasted Slices, Jam and Butter",
        "descriptionTh": "ขนมปัง 2 แผ่น, แยม และ เนย",
        "price": 70,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/04-butter-and-jam.webp",
        "image_file": "09-Breakfast-and-Snacks/04-butter-and-jam.webp",
        "sku": "10267",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "nutella-bread",
        "name": "NUTELLA BREAD",
        "nameTh": "ขนมปังนูเทลล่า",
        "description": "2 Toasted Slices Spread With Nutella",
        "descriptionTh": "ขนมปัง 2 แผ่น ทานูเทลล่า",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/05-nutella-bread.webp",
        "image_file": "09-Breakfast-and-Snacks/05-nutella-bread.webp",
        "sku": "10266",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "italian-toast",
        "name": "ITALIAN TOAST",
        "nameTh": "อิตาเลียนโทสต์",
        "description": "2 Toasted Slices Filled With Ham And Cheese",
        "descriptionTh": "ขนมปัง 2 แผ่น สอดไส้แฮมและชีส",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/06-italian-toast.webp",
        "image_file": "09-Breakfast-and-Snacks/06-italian-toast.webp",
        "sku": "10229",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "french-toast",
        "name": "FRENCH TOAST",
        "nameTh": "เฟรนช์โทสต์",
        "description": "2 Fried Toasts With Milk and Egg, Honey",
        "descriptionTh": "ขนมปัง 2 แผ่น ชุบในนมและไข่ ทอด ราดน้ำผึ้ง",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/07-french-toast.webp",
        "image_file": "09-Breakfast-and-Snacks/07-french-toast.webp",
        "sku": "10227",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "french-rolls",
        "name": "FRENCH ROLLS",
        "nameTh": "เฟรนช์โรล",
        "description": "3 Fried Toasts with Milk And Egg, Filled with Ham & Cheese",
        "descriptionTh": "ขนมปัง 3 แผ่นชุบในนมและไข่ทอดและสอดไส้แฮมและชีส",
        "price": 130,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/08-french-rolls.webp",
        "image_file": "09-Breakfast-and-Snacks/08-french-rolls.webp",
        "sku": "10228",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "pastries",
        "name": "PASTRIES",
        "nameTh": "ขนมอบ",
        "description": "Fresh Pastries of the Day, Ask the Staff (+30฿ Nutella)",
        "descriptionTh": "ขนมอบสดประจำวัน สอบถามพนักงาน (+30฿ นูเทลล่า)",
        "price": 0,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/09-pastries.webp",
        "image_file": "09-Breakfast-and-Snacks/09-pastries.webp",
        "sku": "10249",
        "variants": [],
        "extras": [
          {
            "id": "extra-nutella-extra",
            "name": "Nutella Extra",
            "nameTh": "นูเทลล่าเพิ่ม",
            "sku": "",
            "price": 30
          }
        ],
        "allowed_extras_group": "Croissant Modifiers"
      },
      {
        "id": "fruit-salad",
        "name": "FRUIT SALAD",
        "nameTh": "มาซิโดเนียผลไม้",
        "description": "Seasonal Fresh Fruit Salad (+30฿ Yogurt)",
        "descriptionTh": "มาซิโดเนียผลไม้สดตามฤดูกาล (+30฿ โยเกิร์ต)",
        "price": 120,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/09-Breakfast-and-Snacks/10-fruit-salad.webp",
        "image_file": "09-Breakfast-and-Snacks/10-fruit-salad.webp",
        "sku": "",
        "variants": [
          {
            "id": "10132",
            "name": "Normal",
            "nameTh": "ธรรมดา",
            "sku": "10132",
            "price": 120,
            "priceModifier": 0
          },
          {
            "id": "10231",
            "name": "Yogurt",
            "nameTh": "โยเกิร์ต",
            "sku": "10231",
            "price": 150,
            "priceModifier": 30
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  },
  {
    "id": "coffee-shop",
    "name": "Coffee Shop",
    "nameTh": "ร้านกาแฟ",
    "icon": "☕",
    "items": [
      {
        "id": "caffè-espresso",
        "name": "CAFFÈ ESPRESSO",
        "nameTh": "เอสเพรสโซ่",
        "description": "",
        "descriptionTh": "",
        "price": 40,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/01-caffe-espresso.webp",
        "image_file": "10-Coffee-Shop/01-caffe-espresso.webp",
        "sku": "10093",
        "variants": [],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "americano",
        "name": "AMERICANO",
        "nameTh": "กาแฟอเมริกาโน",
        "description": "",
        "descriptionTh": "",
        "price": 50,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/02-americano.webp",
        "image_file": "10-Coffee-Shop/02-americano.webp",
        "sku": "",
        "variants": [
          {
            "id": "10219",
            "name": "Hot",
            "nameTh": "ร้อน",
            "sku": "10219",
            "price": 50,
            "priceModifier": 0
          },
          {
            "id": "10222",
            "name": "Iced",
            "nameTh": "เย็น",
            "sku": "10222",
            "price": 70,
            "priceModifier": 20
          }
        ],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "cappuccino",
        "name": "CAPPUCCINO",
        "nameTh": "คาปูชิโน่",
        "description": "",
        "descriptionTh": "",
        "price": 60,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/03-cappuccino.webp",
        "image_file": "10-Coffee-Shop/03-cappuccino.webp",
        "sku": "",
        "variants": [
          {
            "id": "10220",
            "name": "Hot",
            "nameTh": "ร้อน",
            "sku": "10220",
            "price": 60,
            "priceModifier": 0
          },
          {
            "id": "10221",
            "name": "Iced",
            "nameTh": "เย็น",
            "sku": "10221",
            "price": 80,
            "priceModifier": 20
          }
        ],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "latte-macchiato",
        "name": "LATTE MACCHIATO",
        "nameTh": "ลาเต้ มัคคิอาโต้",
        "description": "",
        "descriptionTh": "",
        "price": 70,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/04-latte-macchiato.webp",
        "image_file": "10-Coffee-Shop/04-latte-macchiato.webp",
        "sku": "",
        "variants": [
          {
            "id": "10044",
            "name": "Hot",
            "nameTh": "ร้อน",
            "sku": "10044",
            "price": 70,
            "priceModifier": 0
          },
          {
            "id": "10164",
            "name": "Iced",
            "nameTh": "เย็น",
            "sku": "10164",
            "price": 90,
            "priceModifier": 20
          }
        ],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "mini-affogato-al-caffé",
        "name": "MINI AFFOGATO AL CAFFÉ",
        "nameTh": "มินิ อัฟโฟกาโต กาแฟ",
        "description": "",
        "descriptionTh": "",
        "price": 60,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/05-mini-affogato-al-caffe.webp",
        "image_file": "10-Coffee-Shop/05-mini-affogato-al-caffe.webp",
        "sku": "10092",
        "variants": [],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "marocchino",
        "name": "MAROCCHINO",
        "nameTh": "กาแฟมอคคาครีม",
        "description": "",
        "descriptionTh": "",
        "price": 65,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/06-marocchino.webp",
        "image_file": "10-Coffee-Shop/06-marocchino.webp",
        "sku": "",
        "variants": [
          {
            "id": "10163",
            "name": "Hot",
            "nameTh": "ร้อน",
            "sku": "10163",
            "price": 65,
            "priceModifier": 0
          },
          {
            "id": "10216",
            "name": "Iced",
            "nameTh": "เย็น",
            "sku": "10216",
            "price": 85,
            "priceModifier": 20
          }
        ],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "hot-chocolate",
        "name": "HOT CHOCOLATE",
        "nameTh": "ช็อกโกแลตร้อน",
        "description": "",
        "descriptionTh": "",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/07-hot-chocolate.webp",
        "image_file": "10-Coffee-Shop/07-hot-chocolate.webp",
        "sku": "10214",
        "variants": [],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "milk-and-honey",
        "name": "MILK AND HONEY",
        "nameTh": "นมและน้ำผึ้ง",
        "description": "",
        "descriptionTh": "",
        "price": 70,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/08-milk-and-honey.webp",
        "image_file": "10-Coffee-Shop/08-milk-and-honey.webp",
        "sku": "",
        "variants": [
          {
            "id": "10264",
            "name": "Hot",
            "nameTh": "ร้อน",
            "sku": "10264",
            "price": 70,
            "priceModifier": 0
          },
          {
            "id": "10273",
            "name": "Iced",
            "nameTh": "เย็น",
            "sku": "10273",
            "price": 90,
            "priceModifier": 20
          }
        ],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "red-thai-tea",
        "name": "RED THAI TEA",
        "nameTh": "ชาแดงไทย",
        "description": "",
        "descriptionTh": "",
        "price": 50,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/09-red-thai-tea.webp",
        "image_file": "10-Coffee-Shop/09-red-thai-tea.webp",
        "sku": "",
        "variants": [
          {
            "id": "10213",
            "name": "Hot",
            "nameTh": "ร้อน",
            "sku": "10213",
            "price": 50,
            "priceModifier": 0
          },
          {
            "id": "10217",
            "name": "Iced",
            "nameTh": "เย็น",
            "sku": "10217",
            "price": 70,
            "priceModifier": 20
          }
        ],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      },
      {
        "id": "green-thai-tea",
        "name": "GREEN THAI TEA",
        "nameTh": "ชาเขียวไทย",
        "description": "",
        "descriptionTh": "",
        "price": 50,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/10-green-thai-tea.webp",
        "image_file": "10-Coffee-Shop/10-green-thai-tea.webp",
        "sku": "",
        "variants": [
          {
            "id": "10215",
            "name": "Hot",
            "nameTh": "ร้อน",
            "sku": "10215",
            "price": 50,
            "priceModifier": 0
          },
          {
            "id": "10218",
            "name": "Iced",
            "nameTh": "เย็น",
            "sku": "10218",
            "price": 70,
            "priceModifier": 20
          }
        ],
        "extras": [
          {
            "id": "10166",
            "name": "Extra Coffee",
            "nameTh": "ช็อตกาแฟเพิ่ม",
            "sku": "10166",
            "price": 30
          }
        ],
        "allowed_extras_group": "Coffee Shop Modifiers"
      }
    ]
  },
  {
    "id": "fruit-drinks",
    "name": "Fruit Drinks",
    "nameTh": "เครื่องดื่มผลไม้",
    "icon": "🍹",
    "items": [
      {
        "id": "fruit-shakes-(choice-of-fruit)",
        "name": "FRUIT SHAKES (Choice of Fruit)",
        "nameTh": "น้ำผลไม้ปั่น (ผลไม้ตามเลือก)",
        "description": "",
        "descriptionTh": "",
        "price": 70,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/11-Fruit-Drinks/01-fruit-shakes-choice-of-fruit.webp",
        "image_file": "11-Fruit-Drinks/01-fruit-shakes-choice-of-fruit.webp",
        "sku": "10146",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "smoothies-(choice-of-fruit)",
        "name": "SMOOTHIES (Choice of Fruit)",
        "nameTh": "สมูทตี้ (ผลไม้ตามเลือก)",
        "description": "",
        "descriptionTh": "",
        "price": 80,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/11-Fruit-Drinks/02-smoothies-choice-of-fruit.webp",
        "image_file": "11-Fruit-Drinks/02-smoothies-choice-of-fruit.webp",
        "sku": "10147",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "lassis-(choice-of-fruit)",
        "name": "LASSIS (Choice of Fruit)",
        "nameTh": "ลัสซี่ (ผลไม้ตามเลือก)",
        "description": "",
        "descriptionTh": "",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/11-Fruit-Drinks/03-lassis-choice-of-fruit.webp",
        "image_file": "11-Fruit-Drinks/03-lassis-choice-of-fruit.webp",
        "sku": "10149",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "frappés-(choice-of-fruit)",
        "name": "FRAPPÉS (Choice of Fruit)",
        "nameTh": "เฟรปเป้ (ผลไม้ตามเลือก)",
        "description": "",
        "descriptionTh": "",
        "price": 100,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/11-Fruit-Drinks/04-frappes-choice-of-fruit.webp",
        "image_file": "11-Fruit-Drinks/04-frappes-choice-of-fruit.webp",
        "sku": "10148",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "cold-pressed-juice-(choice-of-fruit)",
        "name": "COLD-PRESSED JUICE (Choice of Fruit)",
        "nameTh": "น้ำสกัดเย็น (ผลไม้ตามเลือก)",
        "description": "",
        "descriptionTh": "",
        "price": 110,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/11-Fruit-Drinks/05-cold-pressed-juice-choice-of-fruit.webp",
        "image_file": "11-Fruit-Drinks/05-cold-pressed-juice-choice-of-fruit.webp",
        "sku": "10306",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  },
  {
    "id": "soft-drinks",
    "name": "Soft Drinks",
    "nameTh": "น้ำอัดลม",
    "icon": "🥤",
    "items": [
      {
        "id": "soda-water",
        "name": "SODA WATER",
        "nameTh": "น้ำโซดา",
        "description": "",
        "descriptionTh": "",
        "price": 20,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/12-Soft-Drinks/01-soda-water.webp",
        "image_file": "12-Soft-Drinks/01-soda-water.webp",
        "sku": "10070",
        "variants": [],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "soft-drink-cans",
        "name": "SOFT DRINK CANS",
        "nameTh": "กระป๋องน้ำอัดลม",
        "description": "Fanta, Sprite, Coca-Cola",
        "descriptionTh": "แฟนต้า, สไปรท์, โคคา-โคล่า",
        "price": 30,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/12-Soft-Drinks/02-coca-cola.webp",
        "image_file": "12-Soft-Drinks/02-coca-cola.webp",
        "sku": "",
        "variants": [
          {
            "id": "10071",
            "name": "Coke",
            "nameTh": "Coke",
            "sku": "10071",
            "price": 30,
            "priceModifier": 0
          },
          {
            "id": "10082",
            "name": "Coke Zero",
            "nameTh": "Coke Zero",
            "sku": "10082",
            "price": 30,
            "priceModifier": 0
          },
          {
            "id": "10072",
            "name": "Fanta",
            "nameTh": "Fanta",
            "sku": "10072",
            "price": 30,
            "priceModifier": 0
          },
          {
            "id": "10073",
            "name": "Sprite Can",
            "nameTh": "Sprite Can",
            "sku": "10073",
            "price": 30,
            "priceModifier": 0
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "drinking-water",
        "name": "DRINKING WATER",
        "nameTh": "น้ำดื่ม",
        "description": "",
        "descriptionTh": "",
        "price": 30,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/12-Soft-Drinks/06-drinking-water.webp",
        "image_file": "12-Soft-Drinks/06-drinking-water.webp",
        "sku": "",
        "variants": [
          {
            "id": "10105",
            "name": "Big",
            "nameTh": "ใหญ่",
            "sku": "10105",
            "price": 30,
            "priceModifier": 0
          },
          {
            "id": "10069",
            "name": "Small",
            "nameTh": "เล็ก",
            "sku": "10069",
            "price": 20,
            "priceModifier": -10
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  },
  {
    "id": "beers-and-wines",
    "name": "Beers & Wines",
    "nameTh": "เบียร์และไวน์",
    "icon": "🍻",
    "items": [
      {
        "id": "chang-beer",
        "name": "CHANG BEER",
        "nameTh": "เบียร์ช้าง",
        "description": "",
        "descriptionTh": "",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/13-Beers/01-chang-beer-big.webp",
        "image_file": "13-Beers/01-chang-beer-big.webp",
        "sku": "",
        "variants": [
          {
            "id": "10084",
            "name": "Big",
            "nameTh": "ใหญ่",
            "sku": "10084",
            "price": 90,
            "priceModifier": 0
          },
          {
            "id": "10074",
            "name": "Small",
            "nameTh": "เล็ก",
            "sku": "10074",
            "price": 60,
            "priceModifier": -30
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "leo-beer",
        "name": "LEO BEER",
        "nameTh": "เบียร์ลีโอ",
        "description": "",
        "descriptionTh": "",
        "price": 90,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/13-Beers/03-leo-beer-big.webp",
        "image_file": "13-Beers/03-leo-beer-big.webp",
        "sku": "",
        "variants": [
          {
            "id": "10083",
            "name": "Big",
            "nameTh": "ใหญ่",
            "sku": "10083",
            "price": 90,
            "priceModifier": 0
          },
          {
            "id": "10075",
            "name": "Small",
            "nameTh": "เล็ก",
            "sku": "10075",
            "price": 60,
            "priceModifier": -30
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "singha-beer",
        "name": "SINGHA BEER",
        "nameTh": "เบียร์สิงห์",
        "description": "",
        "descriptionTh": "",
        "price": 100,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/13-Beers/05-singha-beer-big.webp",
        "image_file": "13-Beers/05-singha-beer-big.webp",
        "sku": "",
        "variants": [
          {
            "id": "10085",
            "name": "Big",
            "nameTh": "ใหญ่",
            "sku": "10085",
            "price": 100,
            "priceModifier": 0
          },
          {
            "id": "10076",
            "name": "Small",
            "nameTh": "เล็ก",
            "sku": "10076",
            "price": 70,
            "priceModifier": -30
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "italian-wines",
        "name": "ITALIAN WINES",
        "nameTh": "ไวน์อิตาเลียน",
        "description": "",
        "descriptionTh": "",
        "price": 1190,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp",
        "image_file": "14-Wines/01-italian-wines.webp",
        "sku": "",
        "variants": [
          {
            "id": "10079",
            "name": "Chardonnay",
            "nameTh": "Chardonnay",
            "sku": "10079",
            "price": 1190,
            "priceModifier": 0
          },
          {
            "id": "10125",
            "name": "Glass (of Red Wine)",
            "nameTh": "แก้ว (of Red Wine)",
            "sku": "10125",
            "price": 120,
            "priceModifier": -1070
          },
          {
            "id": "10124",
            "name": "Glass (of White Wine)",
            "nameTh": "แก้ว (of White Wine)",
            "sku": "10124",
            "price": 120,
            "priceModifier": -1070
          },
          {
            "id": "10308",
            "name": "Open Wine",
            "nameTh": "Open Wine",
            "sku": "10308",
            "price": 100,
            "priceModifier": -1090
          },
          {
            "id": "10078",
            "name": "Primitivo",
            "nameTh": "Primitivo",
            "sku": "10078",
            "price": 1190,
            "priceModifier": 0
          },
          {
            "id": "10144",
            "name": "Prosecco",
            "nameTh": "Prosecco",
            "sku": "10144",
            "price": 1290,
            "priceModifier": 100
          },
          {
            "id": "10130",
            "name": "Red Poggio alto",
            "nameTh": "Red Poggio alto",
            "sku": "10130",
            "price": 1190,
            "priceModifier": 0
          },
          {
            "id": "10157",
            "name": "White​ Poggio alto",
            "nameTh": "White​ Poggio alto",
            "sku": "10157",
            "price": 1190,
            "priceModifier": 0
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      },
      {
        "id": "wines-from-around-the-world",
        "name": "WINES FROM AROUND THE WORLD",
        "nameTh": "ไวน์จากทั่วโลก",
        "description": "",
        "descriptionTh": "",
        "price": 1290,
        "image": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/02-wines-from-around-the-world.webp",
        "image_file": "14-Wines/02-wines-from-around-the-world.webp",
        "sku": "",
        "variants": [
          {
            "id": "10145",
            "name": "Brut",
            "nameTh": "Brut",
            "sku": "10145",
            "price": 1290,
            "priceModifier": 0
          },
          {
            "id": "10127",
            "name": "Fruit wine Rosé de france",
            "nameTh": "Fruit wine Rosé de france",
            "sku": "10127",
            "price": 990,
            "priceModifier": -300
          },
          {
            "id": "10131",
            "name": "Graziosa rose",
            "nameTh": "Graziosa rose",
            "sku": "10131",
            "price": 950,
            "priceModifier": -340
          },
          {
            "id": "10080",
            "name": "Red Birchgrove",
            "nameTh": "Red Birchgrove",
            "sku": "10080",
            "price": 790,
            "priceModifier": -500
          },
          {
            "id": "10063",
            "name": "Red ViñaToldos",
            "nameTh": "Red ViñaToldos",
            "sku": "10063",
            "price": 690,
            "priceModifier": -600
          },
          {
            "id": "10081",
            "name": "White Viña Toldos",
            "nameTh": "White Viña Toldos",
            "sku": "10081",
            "price": 790,
            "priceModifier": -500
          },
          {
            "id": "10099",
            "name": "White​ Birchgrove",
            "nameTh": "White​ Birchgrove",
            "sku": "10099",
            "price": 690,
            "priceModifier": -600
          }
        ],
        "extras": [],
        "allowed_extras_group": "None"
      }
    ]
  }
];
