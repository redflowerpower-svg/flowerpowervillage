import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, 
  Bike, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  BellOff, 
  Maximize, 
  Minimize, 
  Clock, 
  MapPin, 
  Phone, 
  Send, 
  ExternalLink,
  MessageCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  Moon,
  Save,
  RotateCcw,
  X,
  UtensilsCrossed,
  Calendar,
  Users,
  Trash2
} from 'lucide-react';
import { usePizzaAdminStore, PizzaOrder } from '../store/usePizzaAdminStore';
import { supabase } from '../../../lib/supabase';
import { extractTableFromAddress, formatTableStationName, getCanonicalTableKey } from '../../../pizza/utils/tableUtils';
import { 
  initKitchenAudio, 
  startContinuousAlarm, 
  stopContinuousAlarm, 
  testKitchenAlarm,
  startDispatchReminderAlarm,
  stopDispatchReminderAlarm,
  stopAllKitchenAlarms,
  playGentleReminderChime,
  requestScreenWakeLock, 
  releaseScreenWakeLock 
} from '../utils/kitchenAudioWakeLock';
import { menuData } from '../../../pizza/data/menuData';
import { 
  fetchPizzeriaStatus, 
  updatePizzeriaStatus, 
  calculateServiceState, 
  getBangkokTime,
  PizzeriaServiceStatus, 
  DEFAULT_PIZZERIA_STATUS,
  ServiceCalculationResult
} from '../../../pizza/services/pizzaServiceStatus';

export interface TableReservationKDS {
  id: string;
  customer_name: string;
  contact: string;
  email?: string;
  guests: number | string;
  reservation_date: string;
  reservation_time: string;
  seating_area: 'indoor' | 'outdoor' | 'hut' | 'any';
  occasion?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export const isTableReservationOrder = (o: any) => {
  if (!o) return false;
  if (o.payment_method === 'table_reservation' || o.payment_method === 'table') return true;
  const addr = String(o.address || '');
  if (addr.includes('[TABLE_RESERVATION]') || addr.includes('[TB_CODE:') || addr.includes('[GUESTS:')) return true;
  const items = Array.isArray(o.items) ? o.items : [];
  if (items.some((it: any) => String(it.name || '').toLowerCase().includes('prenotazione tavolo') || String(it.nameTh || '').includes('จองโต๊ะ'))) {
    return true;
  }
  return false;
};

export const isDiningTableOrder = (o: any) => {
  if (!o) return false;
  if (isTableReservationOrder(o)) return false;
  const addr = String(o.address || '');
  const meth = String(o.payment_method || '');
  const delType = String(o.delivery_type || '');
  return delType === 'dine_in' || 
         addr.includes('[DINE-IN]') || 
         addr.includes('[DINING_TABLE]') || 
         addr.toLowerCase().includes('tavolo') || 
         addr.toLowerCase().includes('table') || 
         meth.includes('table') || 
         meth.includes('dining') || 
         Boolean(o.table_number);
};

// Coords fallback for Flower Power Pizza Ranong
const RESTAURANT_LAT = 9.958742;
const RESTAURANT_LNG = 98.634812;

type CartItemSaved = {
  name: string;
  nameTh?: string;
  quantity: number;
  basePrice?: number;
  selectedVariant?: any;
  selectedExtras?: any[];
};

// Comprehensive Bilingual Extra / Topping / Variant Translation Dictionary
const EXTRA_TRANSLATIONS: Record<string, { th: string; en: string }> = {
  // Cheeses & Dairy
  'mozzarella': { th: 'มอสซาเรลล่าชีส', en: 'Mozzarella Cheese' },
  'doppia mozzarella': { th: 'เพิ่มมอสซาเรลล่าชีส 2 เท่า', en: 'Double Mozzarella' },
  'extra mozzarella': { th: 'เพิ่มมอสซาเรลล่าชีส', en: 'Extra Mozzarella' },
  'bufala': { th: 'มอสซาเรลล่าชีสนมควาย', en: 'Buffalo Mozzarella' },
  'mozzarella di bufala': { th: 'มอสซาเรลล่าชีสนมควาย', en: 'Buffalo Mozzarella' },
  'burrata': { th: 'บูร์ราต้าชีสสด', en: 'Fresh Burrata' },
  'burratina': { th: 'บูร์ราติน่าชีสสด', en: 'Mini Burrata' },
  'gorgonzola': { th: 'กอร์กอนโซล่าบลูชีส', en: 'Gorgonzola Blue Cheese' },
  'parmigiano': { th: 'พาร์เมซานชีส', en: 'Parmesan Cheese' },
  'parmigiano reggiano': { th: 'พาร์มิจาโนเรจจาโนชีส', en: 'Parmigiano Reggiano' },
  'grana': { th: 'กรานาปาดาโนชีส', en: 'Grana Padano' },
  'grana padano': { th: 'กรานาปาดาโนชีส', en: 'Grana Padano' },
  'pecorino': { th: 'เปโคริโน่ชีสนมแกะ', en: 'Pecorino Cheese' },
  'pecorino romano': { th: 'เปโคริโน่โรมาโนชีส', en: 'Pecorino Romano' },
  'ricotta': { th: 'ริคอตต้าชีส', en: 'Ricotta Cheese' },
  'mascarpone': { th: 'มาสคาโปเนชีส', en: 'Mascarpone' },
  'scamorza': { th: 'สคามอร์ซารมควัน', en: 'Smoked Scamorza' },
  'scamorza affumicata': { th: 'สคามอร์ซารมควัน', en: 'Smoked Scamorza' },
  'fontina': { th: 'ฟอนติน่าชีส', en: 'Fontina Cheese' },
  'formaggio': { th: 'ชีส', en: 'Cheese' },
  '4 formaggi': { th: 'ชีส 4 ชนิด', en: '4 Cheeses' },
  
  // Meats & Cold Cuts
  'prosciutto': { th: 'แฮม', en: 'Ham' },
  'prosciutto cotto': { th: 'แฮมสุกอิตาเลียน', en: 'Cooked Ham' },
  'cotto': { th: 'แฮมสุก', en: 'Cooked Ham' },
  'prosciutto crudo': { th: 'พาร์มาแฮมดิบ', en: 'Parma Ham (Crudo)' },
  'crudo': { th: 'พาร์มาแฮม', en: 'Parma Ham' },
  'prosciutto di parma': { th: 'พาร์มาแฮมแท้', en: 'Parma Ham' },
  'salame': { th: 'ซาลามี่', en: 'Salami' },
  'salame piccante': { th: 'เปปเปอโรนี่รสเผ็ด', en: 'Spicy Salami (Pepperoni)' },
  'salame dolce': { th: 'ซาลามี่รสกลมกล่อม', en: 'Mild Salami' },
  'salame milano': { th: 'มิลาโนซาลามี่', en: 'Milano Salami' },
  'salsiccia': { th: 'ไส้กรอกหมูสดอิตาเลียน', en: 'Italian Pork Sausage' },
  'salsiccia fresca': { th: 'ไส้กรอกหมูสดอิตาเลียน', en: 'Italian Fresh Sausage' },
  'bacon': { th: 'เบคอนกรอบ', en: 'Crispy Bacon' },
  'pancetta': { th: 'แพนเช็ตต้าหมูสามชั้นอิตาเลียน', en: 'Italian Pancetta' },
  'guanciale': { th: 'กวนชาเล่แก้มหมูอิตาเลียน', en: 'Guanciale (Pork Jowl)' },
  'speck': { th: 'สเปคแฮมรมควัน', en: 'Smoked Speck Ham' },
  'bresaola': { th: 'เบรซาโอล่าเนื้อวัวแห้งอิตาเลียน', en: 'Bresaola (Cured Beef)' },
  'wurstel': { th: 'ไส้กรอกเวียนนา', en: 'Vienna Sausage (Wurstel)' },
  'pollo': { th: 'เนื้อไก่', en: 'Chicken' },
  'petto di pollo': { th: 'อกไก่', en: 'Chicken Breast' },
  'manzo': { th: 'เนื้อวัว', en: 'Beef' },
  'macinato': { th: 'เนื้อบด', en: 'Minced Meat' },
  'carne trita': { th: 'เนื้อบด', en: 'Minced Meat' },
  'nduja': { th: 'อันดูยาพริกซาลามี่เผ็ดคาลาเบรีย', en: "'Nduja Spicy Sausage" },
  'mortadella': { th: 'มอร์ทาเดลล่าแฮมอิตาเลียน', en: 'Italian Mortadella' },

  // Seafood
  'tonno': { th: 'ปลาทูน่า', en: 'Tuna' },
  'tonno sott\'olio': { th: 'ปลาทูน่าในน้ำมันมะกอก', en: 'Tuna in Olive Oil' },
  'acciughe': { th: 'ปลาแอนโชวี่เค็ม', en: 'Anchovies' },
  'alici': { th: 'ปลาแอนโชวี่', en: 'Anchovies' },
  'gamberi': { th: 'กุ้งสด', en: 'Fresh Prawns' },
  'gamberetti': { th: 'กุ้งตัวเล็ก', en: 'Shrimps' },
  'salmone': { th: 'แซลมอน', en: 'Salmon' },
  'salmone affumicato': { th: 'แซลมอนรมควัน', en: 'Smoked Salmon' },
  'calamari': { th: 'ปลาหมึก', en: 'Squid / Calamari' },
  'cozze': { th: 'หอยแมลงภู่', en: 'Mussels' },
  'vongole': { th: 'หอยตลับ', en: 'Clams' },
  'frutti di mare': { th: 'อาหารทะเลรวม', en: 'Seafood Mix' },
  'seafood': { th: 'ซีฟู้ดรวม', en: 'Seafood' },

  // Vegetables & Herbs
  'funghi': { th: 'เห็ดแชมปิญองสด', en: 'Fresh Mushrooms' },
  'funghi freschi': { th: 'เห็ดสด', en: 'Fresh Mushrooms' },
  'funghi porcini': { th: 'เห็ดพอร์ชินี่', en: 'Porcini Mushrooms' },
  'porcini': { th: 'เห็ดพอร์ชินี่', en: 'Porcini Mushrooms' },
  'tartufo': { th: 'เห็ดทรัฟเฟิลดำ', en: 'Black Truffle' },
  'olio al tartufo': { th: 'น้ำมันเห็ดทรัฟเฟิล', en: 'Truffle Oil' },
  'pomodoro': { th: 'มะเขือเทศ', en: 'Tomato' },
  'pomodorini': { th: 'มะเขือเทศราชินีสด', en: 'Cherry Tomatoes' },
  'pomodori secchi': { th: 'มะเขือเทศอบแห้ง', en: 'Sun-Dried Tomatoes' },
  'salsa pomodoro': { th: 'ซอสมะเขือเทศเข้มข้น', en: 'Tomato Sauce' },
  'olive': { th: 'มะกอก', en: 'Olives' },
  'olive nere': { th: 'มะกอกดำ', en: 'Black Olives' },
  'olive verdi': { th: 'มะกอกเขียว', en: 'Green Olives' },
  'capperi': { th: 'เคเปอร์', en: 'Capers' },
  'carciofi': { th: 'อาร์ติโชก', en: 'Artichokes' },
  'cipolla': { th: 'หอมใหญ่', en: 'Onion' },
  'cipolla rossa': { th: 'หอมแดง', en: 'Red Onion' },
  'peperoni': { th: 'พริกหวานย่าง', en: 'Bell Peppers' },
  'peperoncino': { th: 'พริกเผ็ดสด', en: 'Chili Peppers' },
  'peperoncino fresco': { th: 'พริกสดเผ็ด', en: 'Fresh Chili' },
  'olio piccante': { th: 'น้ำมันพริกเผ็ด', en: 'Spicy Chili Oil' },
  'melanzane': { th: 'มะเขือม่วงย่าง', en: 'Grilled Eggplants' },
  'zucchine': { th: 'ซูกินีย่าง', en: 'Grilled Zucchini' },
  'rucola': { th: 'ผักร็อคเก็ตสด', en: 'Fresh Rocket Salad' },
  'spinaci': { th: 'ผักโขม', en: 'Spinach' },
  'basilico': { th: 'ใบโหระพาอิตาเลียน', en: 'Fresh Basil' },
  'origano': { th: 'ออริกาโน่', en: 'Oregano' },
  'aglio': { th: 'กระเทียมสด', en: 'Garlic' },
  'prezzemolo': { th: 'พาร์สลีย์', en: 'Parsley' },
  'rosmarino': { th: 'โรสแมรี่', en: 'Rosemary' },
  'ananas': { th: 'สับปะรด', en: 'Pineapple' },
  'mais': { th: 'ข้าวโพดหวาน', en: 'Sweet Corn' },
  'patate': { th: 'มันฝรั่ง', en: 'Potatoes' },
  'patatine': { th: 'เฟรนช์ฟรายส์', en: 'French Fries' },
  'patatine fritte': { th: 'เฟรนช์ฟรายส์กรอบ', en: 'French Fries' },
  'french fries': { th: 'เฟรนช์ฟรายส์กรอบ', en: 'French Fries' },

  // Eggs & Sauces
  'uovo': { th: 'ไข่ไก่สด', en: 'Egg' },
  'uovo sodo': { th: 'ไข่ต้ม', en: 'Boiled Egg' },
  'uovo all\'occhio': { th: 'ไข่ดาว', en: 'Fried Egg' },
  'pesto': { th: 'ซอสเพสโต้ใบโหระพา', en: 'Basil Pesto Sauce' },
  'pesto genovese': { th: 'ซอสเพสโต้เจโนเวเซ่', en: 'Genoese Pesto' },
  'panna': { th: 'ครีมสด', en: 'Fresh Cream' },
  'maionese': { th: 'มายองเนส', en: 'Mayonnaise' },
  'ketchup': { th: 'ซอสมะเขือเทศ', en: 'Ketchup' },
  'salsa bbq': { th: 'ซอสบาร์บีคิว', en: 'BBQ Sauce' },
  'bbq sauce': { th: 'ซอสบาร์บีคิว', en: 'BBQ Sauce' },
  'salsa tartara': { th: 'ซอสทาร์ทาร์', en: 'Tartar Sauce' },
  'senape': { th: 'มัสตาร์ด', en: 'Mustard' },
  'tabasco': { th: 'ทาบาสโก้', en: 'Tabasco' },
  'olio evo': { th: 'น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น', en: 'Extra Virgin Olive Oil' },
  'aceto balsamico': { th: 'น้ำส้มสายชูบัลซามิก', en: 'Balsamic Glaze' },
  'crema di tartufo': { th: 'ครีมเห็ดทรัฟเฟิล', en: 'Truffle Cream' },

  // Variants & Formats
  'normale': { th: 'ขนาดปกติ (33 ซม.)', en: 'Normal Size (33cm)' },
  'baby': { th: 'ขนาดเล็กสำหรับเด็ก (24 ซม.)', en: 'Baby Size (24cm)' },
  'maxi': { th: 'ขนาดใหญ่พิเศษ (45 ซม.)', en: 'Maxi Size (45cm)' },
  'famiglia': { th: 'ขนาดครอบครัว', en: 'Family Size' },
  'calzone': { th: 'แบบพับ (คาลโซเน่)', en: 'Calzone Folded' },
  'doppio impasto': { th: 'แป้งหนานุ่ม 2 เท่า', en: 'Double Thick Dough' },
  'senza glutine': { th: 'แป้งปลอดกลูเตน', en: 'Gluten Free Dough' },
  'gluten free': { th: 'แป้งปลอดกลูเตน', en: 'Gluten Free' },
  'integrale': { th: 'แป้งโฮลวีท', en: 'Whole Wheat Dough' },
  'ben cotta': { th: 'อบกรอบพิเศษ', en: 'Well Done / Crispy' },
  'poco cotta': { th: 'อบนุ่มพอดี', en: 'Lightly Baked' },
  'tagliata a fette': { th: 'ตัดแบ่งชิ้นพร้อมทาน', en: 'Sliced' },
  'non tagliata': { th: 'ไม่ตัดเป็นชิ้น', en: 'Not Sliced' },
};

// Build quick lookup map for Thai and English names from menuData

const EXTRA_BURMESE_LOOKUP: Record<string, string> = {
  'mozzarella': 'မော့ဇာရဲလား ချိစ်',
  'doppia mozzarella': 'မော့ဇာရဲလား ချိစ် ၂ ဆ',
  'extra mozzarella': 'မော့ဇာရဲလား ချိစ် အပို',
  'bufala': 'ကျွဲနို့ မော့ဇာရဲလား ချိစ်',
  'mozzarella di bufala': 'ကျွဲနို့ မော့ဇာရဲလား ချိစ်',
  'burrata': 'ဘူရာတာ ချိစ်စို',
  'burratina': 'ဘူရာတီနာ ချိစ်စို အသေး',
  'gorgonzola': 'ဂေါ်ဂွန်ဇိုလာ ဘလူးချိစ်',
  'parmigiano': 'ပါမီဇန် ချိစ်',
  'parmigiano reggiano': 'ပါမီဂျာနို ရယ်ဂျာနို ချိစ်',
  'grana': 'ဂရာနာ ပါဒါနို ချိစ်',
  'grana padano': 'ဂရာနာ ပါဒါနို ချိစ်',
  'pecorino': 'သိုးနို့ ပီကိုရီနို ချိစ်',
  'pecorino romano': 'ပီကိုရီနို ရိုမာနို ချိစ်',
  'ricotta': 'ရီကော့တာ ချိစ်',
  'mascarpone': 'မတ်စ်ကာပိုနီ ချိစ်',
  'scamorza': 'အမွှေးနံ့သာ စကာမော်ဇာ ချိစ်',
  'formaggio': 'ချိစ်',
  '4 formaggi': 'ချိစ် ၄ မျိုး',
  'prosciutto': 'ဝက်ပေါင်ခြောက် / ဟမ်',
  'prosciutto cotto': 'အီတလီ ဝက်ပေါင်ခြောက်ပြုတ်',
  'cotto': 'ဟမ်',
  'prosciutto crudo': 'ပါမာ ဝက်ပေါင်ခြောက်စိမ်း',
  'crudo': 'ပါမာ ဟမ်',
  'prosciutto di parma': 'ပါမာ ဝက်ပေါင်ခြောက်စစ်စစ်',
  'salame': 'ဆာလာမီ အမဲ/ဝက်အူချောင်း',
  'salame piccante': 'ငရုတ်ကောင်း ဆာလာမီ အစပ် (ပက်ပါရိုနီ)',
  'salame dolce': 'ဆာလာမီ အရသာညင်သာ',
  'salsiccia': 'အီတလီ ဝက်အူချောင်းစိမ်း',
  'salsiccia fresca': 'အီတလီ ဝက်အူချောင်းလတ်လတ်ဆတ်ဆတ်',
  'bacon': 'ဘေကွန်ကြွပ်',
  'pancetta': 'ဝက်သုံးထပ်သား အီတလီစတိုင်',
  'guanciale': 'ဝက်ပါးသားခြောက်',
  'speck': 'အမွှေးနံ့သာ ဝက်ပေါင်ခြောက်',
  'wurstel': 'ဗီယင်နာ ဝက်အူချောင်း',
  'pollo': 'ကြက်သား',
  'petto di pollo': 'ကြက်ရင်အုံသား',
  'manzo': 'အမဲသား',
  'macinato': 'အမဲ/ဝက် အသားကြိတ်',
  'tonno': 'တူနာငါး',
  'acciughe': 'ငါးနီတူဆားနယ်',
  'alici': 'ငါးနီတူဆားနယ်',
  'gamberi': 'ပုစွန်လတ်လတ်ဆတ်ဆတ်',
  'gamberetti': 'ပုစွန်ဆိတ်',
  'salmone': 'ဆယ်လမွန်ငါး',
  'salmone affumicato': 'ဆယ်လမွန်ငါး အခိုးအငွေ့ကျက်',
  'calamari': 'ပြည်ကြီးငါး',
  'cozze': 'ယောက်သွားခွံနက်',
  'vongole': 'ယောက်သွားခွံဖြူ',
  'frutti di mare': 'ပင်လယ်စာ အစုံ',
  'seafood': 'ပင်လယ်စာ အစုံ',
  'funghi': 'မှိုလတ်လတ်ဆတ်ဆတ်',
  'funghi freschi': 'မှိုလတ်လတ်ဆတ်ဆတ်',
  'funghi porcini': 'ပေါ်ချီနီ မှိုမွှေး',
  'tartufo': 'ထရက်ဖယ်လ် မှိုမည်း',
  'pomodoro': 'ခရမ်းချဉ်သီး',
  'pomodorini': 'ချယ်ရီ ခရမ်းချဉ်သီး',
  'pomodori secchi': 'ခရမ်းချဉ်သီးခြောက်',
  'salsa pomodoro': 'ခရမ်းချဉ်သီးဆော့စ်',
  'olive': 'သံလွင်သီး',
  'olive nere': 'သံလွင်သီး အမည်း',
  'olive verdi': 'သံလွင်သီး အစိမ်း',
  'capperi': 'ကေပါ အစေ့ချဉ်',
  'carciofi': 'အာတီချုတ် ပန်းဖူး',
  'cipolla': 'ကြက်သွန်နီကြီး',
  'cipolla rossa': 'ကြက်သွန်နီနီ',
  'peperoni': 'ငရုတ်ပွကင်',
  'peperoncino': 'ငရုတ်သီးစိမ်းစပ်',
  'peperoncino fresco': 'ငရုတ်သီးစိမ်းလတ်လတ်ဆတ်ဆတ်',
  'olio piccante': 'ငရုတ်သီးစပ်ဆီ',
  'melanzane': 'ခရမ်းသီးကင်',
  'zucchine': 'ကျောက်ဖရုံသီးကင်',
  'rucola': 'ရော့ကက် ရွက်စိမ်း',
  'spinaci': 'ဟင်းနုနွယ်ရွက်',
  'basilico': 'ပင်စိမ်းလတ်လတ်ဆတ်ဆတ်',
  'origano': 'အော်ရီဂါနို အမွှေးရွက်',
  'aglio': 'ကြက်သွန်ဖြူ',
  'prezzemolo': 'တရုတ်နံနံ / ပါစလေ',
  'rosmarino': 'ရို့စ်မေရီ အမွှေးရွက်',
  'ananas': 'နာနတ်သီး',
  'mais': 'ပြောင်းဖူးချို',
  'patate': 'အာလူး',
  'patatine': 'အာလူးချောင်းကြော်',
  'patatine fritte': 'အာလူးချောင်းကြော်',
  'french fries': 'အာလူးချောင်းကြော်',
  'uovo': 'ကြက်ဥ',
  'uovo sodo': 'ကြက်ဥပြုတ်',
  "uovo all'occhio": 'ကြက်ဥကြော် မကျက်တကျက်',
  'pesto': 'ပင်စိမ်းဆော့စ်စိမ်း',
  'panna': 'နို့ခရင်မ်စစ်စစ်',
  'maionese': 'မရိုနိစ်',
  'ketchup': 'ခရမ်းချဉ်သီးဆော့စ်ချို',
  'bbq sauce': 'ဘီဘီကျူးဆော့စ်',
  'olio evo': 'သံလွင်ဆီစစ်စစ်',
};

const menuMmLookup: Record<string, string> = {
  'pizza margherita': 'မာဂရီတာ ပီဇာ (ချိစ် & ခရမ်းချဉ်သီး)',
  'pizza marinara (vegan)': 'မာရီနာရာ ပီဇာ (သက်သတ်လွတ် - ကြက်သွန်ဖြူ & ခရမ်းချဉ်သီး)',
  'pizza salame piccante (pepperoni)': 'ဆာလာမီ အစပ် ပီဇာ (ပက်ပါရိုနီ)',
  'pizza prosciutto e funghi': 'ဝက်ပေါင်ခြောက်နှင့် မှို ပီဇာ',
  'pizza 4 formaggi': 'ချိစ် ၄ မျိုး ပီဇာ',
  'pizza capricciosa': 'ကာပရီချိုဆာ ပီဇာ (မှို၊ ဟမ်၊ အာတီချုတ်၊ သံလွင်သီး)',
  'pizza hawaiian': 'ဟာဝိုင်ယန် ပီဇာ (ဟမ်နှင့် နာနတ်သီး)',
  'pizza tonno e cipolla': 'တူနာငါးနှင့် ကြက်သွန်နီ ပီဇာ',
  'pizza carbonara': 'ကာဘိုနာရာ ပီဇာ (ဘေကွန် & ကြက်ဥ)',
  'spaghetti alla carbonara': 'စပါဂက်တီ ကာဘိုနာရာ (ဘေကွန်၊ ကြက်ဥ၊ ချိစ်)',
  'spaghetti alla bolognese': 'စပါဂက်တီ ဘိုလိုနိစ် (အမဲ/ဝက် အသားကြိတ်ဆော့စ်)',
  'spaghetti al pomodoro': 'စပါဂက်တီ ခရမ်းချဉ်သီးဆော့စ်',
  "spaghetti all'amatriciana": 'စပါဂက်တီ အာမာထရီချာနာ (ဝက်သုံးထပ်သားဆော့စ်စပ်)',
  'spaghetti aglio, olio e peperoncino': 'စပါဂက်တီ ကြက်သွန်ဖြူဆီသတ် ငရုတ်သီးစပ်',
  'tagliatelle al ragù bolognese': 'တာလီယာတယ်လေ ခေါက်ဆွဲပြား အသားကြိတ်ဆော့စ်',
  'tagliatelle ai funghi porcini': 'တာလီယာတယ်လေ မှိုမွှေးဆော့စ်',
  "penne all'arrabbiata": 'ပန်နီ အာရာဘီယာတာ (ခရမ်းချဉ်သီးဆော့စ် အစပ်)',
  'penne ai 4 formaggi': 'ပန်နီ ချိစ် ၄ မျိုးဆော့စ်',
  'lasagna alla bolognese': 'လာဇန်းညား အသားကြိတ်ဆော့စ်ဖုတ်',
  'gnocchi al pomodoro e mozzarella (sorrentina)': 'ညော့ကီ အာလူးမုန့်လုံး ခရမ်းချဉ်သီး & ချိစ်',
  'gnocchi ai 4 formaggi': 'ညော့ကီ ချိစ် ၄ မျိုးဆော့စ်',
  'french fries': 'အာလူးချောင်းကြော်',
  'tiramisù classico': 'တီရာမီဆူ ကိတ် အီတလီစစ်စစ်',
  'caffè espresso': 'အက်စ်ပရက်ဆို ကော်ဖီခါး',
  'cappuccino': 'ကပူချီနို ကော်ဖီ',
  'americano': 'အမေရိကာနို ကော်ဖီ',
  'latte macchiato': 'လတ်တေး ကော်ဖီ',
};

const menuThaiLookup: Record<string, string> = {};
const menuEnLookup: Record<string, string> = {};
const extraLookup: Record<string, { th: string; en: string }> = {};

menuData.forEach(cat => {
  cat.items.forEach((it: any) => {
    const enName = it.name ? it.name.trim() : '';
    const thName = it.nameTh ? it.nameTh.trim() : '';
    const itName = it.nameIt || it.name_it || '';

    if (enName) {
      menuThaiLookup[enName.toLowerCase()] = thName || enName;
      menuEnLookup[enName.toLowerCase()] = enName;
    }
    if (itName) {
      menuThaiLookup[itName.trim().toLowerCase()] = thName || enName;
      menuEnLookup[itName.trim().toLowerCase()] = enName;
    }
    if (thName) {
      menuThaiLookup[thName.toLowerCase()] = thName;
      menuEnLookup[thName.toLowerCase()] = enName || thName;
    }

    if (it.extras && Array.isArray(it.extras)) {
      it.extras.forEach((ex: any) => {
        const th = ex.nameTh || '';
        const en = ex.name || '';
        const itN = ex.nameIt || ex.name_it || '';
        const deN = ex.nameDe || ex.name_de || '';

        const entry = { th: th || en, en: en || th };
        if (en) extraLookup[en.trim().toLowerCase()] = entry;
        if (itN) extraLookup[itN.trim().toLowerCase()] = entry;
        if (th) extraLookup[th.trim().toLowerCase()] = entry;
        if (deN) extraLookup[deN.trim().toLowerCase()] = entry;
      });
    }

    if (it.variants && Array.isArray(it.variants)) {
      it.variants.forEach((v: any) => {
        const th = v.nameTh || '';
        const en = v.name || '';
        const itN = v.nameIt || v.name_it || '';
        const deN = v.nameDe || v.name_de || '';

        const entry = { th: th || en, en: en || th };
        if (en) extraLookup[en.trim().toLowerCase()] = entry;
        if (itN) extraLookup[itN.trim().toLowerCase()] = entry;
        if (th) extraLookup[th.trim().toLowerCase()] = entry;
        if (deN) extraLookup[deN.trim().toLowerCase()] = entry;
      });
    }
  });
});

export const getDishDisplayName = (item: CartItemSaved, lang: 'en' | 'th' | 'mm'): string => {
  if (!item) return '';
  const clean = String(item.name || '').trim().toLowerCase();

  if (lang === 'mm') {
    if ((item as any).nameMm && typeof (item as any).nameMm === 'string' && (item as any).nameMm.trim()) {
      return (item as any).nameMm.trim();
    }
    if (menuMmLookup[clean]) {
      return menuMmLookup[clean];
    }
    if (EXTRA_BURMESE_LOOKUP[clean]) {
      return EXTRA_BURMESE_LOOKUP[clean];
    }
    if (menuThaiLookup[clean]) {
      return menuThaiLookup[clean];
    }
    return String(item.name || '').toUpperCase();
  }

  if (lang === 'th') {
    if (item.nameTh && typeof item.nameTh === 'string' && item.nameTh.trim()) {
      return item.nameTh.trim();
    }
    if (menuThaiLookup[clean]) {
      return menuThaiLookup[clean];
    }
    if (EXTRA_TRANSLATIONS[clean]) {
      return EXTRA_TRANSLATIONS[clean].th;
    }
    if (menuEnLookup[clean]) {
      return menuEnLookup[clean];
    }
    return String(item.name || '').toUpperCase();
  }

  // English mode
  if (menuEnLookup[clean]) {
    return menuEnLookup[clean].toUpperCase();
  }
  if (EXTRA_TRANSLATIONS[clean]) {
    return EXTRA_TRANSLATIONS[clean].en.toUpperCase();
  }
  return String(item.name || '').toUpperCase();
};

export const getVariantDisplayName = (v: any, lang: 'en' | 'th' | 'mm'): string => {
  if (!v) return '';
  if (typeof v === 'object') {
    if (lang === 'th' && v.nameTh && typeof v.nameTh === 'string' && v.nameTh.trim()) {
      return v.nameTh.trim();
    }
    if (lang === 'en' && v.name && typeof v.name === 'string' && v.name.trim()) {
      const lower = v.name.trim().toLowerCase();
      if (EXTRA_TRANSLATIONS[lower]) return EXTRA_TRANSLATIONS[lower].en;
      return v.name.trim();
    }
    const cand = (v.name || v.nameIt || '').trim().toLowerCase();
    if (EXTRA_TRANSLATIONS[cand]) {
      return lang === 'th' ? EXTRA_TRANSLATIONS[cand].th : EXTRA_TRANSLATIONS[cand].en;
    }
    if (extraLookup[cand]) {
      return lang === 'th' ? extraLookup[cand].th : extraLookup[cand].en;
    }
    return String(v.name || v.nameIt || (lang === 'th' ? 'ปกติ' : 'Standard'));
  }

  const str = String(v).trim();
  const lower = str.toLowerCase();
  if (EXTRA_TRANSLATIONS[lower]) {
    return lang === 'th' ? EXTRA_TRANSLATIONS[lower].th : EXTRA_TRANSLATIONS[lower].en;
  }
  if (extraLookup[lower]) {
    return lang === 'th' ? extraLookup[lower].th : extraLookup[lower].en;
  }
  return str;
};

export const getExtraDisplayName = (ex: any, lang: 'en' | 'th' | 'mm'): string => {
  if (!ex) return '';
  if (typeof ex === 'object') {
    if (lang === 'th' && ex.nameTh && typeof ex.nameTh === 'string' && ex.nameTh.trim()) {
      return ex.nameTh.trim();
    }
    if (lang === 'en' && ex.name && typeof ex.name === 'string' && ex.name.trim()) {
      const lower = ex.name.trim().toLowerCase();
      if (EXTRA_TRANSLATIONS[lower]) return EXTRA_TRANSLATIONS[lower].en;
      return ex.name.trim();
    }
    const candidate = (ex.name || ex.nameIt || '').trim().toLowerCase();
    if (EXTRA_TRANSLATIONS[candidate]) {
      return lang === 'th' ? EXTRA_TRANSLATIONS[candidate].th : EXTRA_TRANSLATIONS[candidate].en;
    }
    if (extraLookup[candidate]) {
      return lang === 'th' ? extraLookup[candidate].th : extraLookup[candidate].en;
    }
    return ex.name || (lang === 'th' ? 'พิเศษ' : 'Extra');
  }

  const str = String(ex).trim();
  const lower = str.toLowerCase();
  if (EXTRA_TRANSLATIONS[lower]) {
    return lang === 'th' ? EXTRA_TRANSLATIONS[lower].th : EXTRA_TRANSLATIONS[lower].en;
  }
  if (extraLookup[lower]) {
    return lang === 'th' ? extraLookup[lower].th : extraLookup[lower].en;
  }
  return str;
};

const translateAddressToThai = (addr: string): string => {
  if (!addr) return '';
  if (/[\u0E00-\u0E7F]/.test(addr)) return addr;

  let thAddr = addr;
  const replacements: [RegExp, string][] = [
    [/Bang\s*Rin/gi, 'ต.บางริ้น'],
    [/Khao\s*Niwet/gi, 'ต.เขานิเวศน์'],
    [/Pak\s*Nam/gi, 'ต.ปากน้ำ'],
    [/Ngao/gi, 'ต.หงาว'],
    [/Bang\s*Non/gi, 'ต.บางนอน'],
    [/Mueang\s*Ranong|Muang\s*Ranong/gi, 'อ.เมืองระนอง'],
    [/Raksawarin|Hot\s*Springs?/gi, 'บ่อน้ำร้อนรักษะวาริน'],
    [/Ranong/gi, 'จ.ระนอง'],
    [/Thailand(ia)?/gi, 'ประเทศไทย'],
    [/Soi\s*(\d+)/gi, 'ซอย $1'],
    [/Moo\s*(\d+)/gi, 'หมู่ $1'],
  ];

  for (const [pattern, rep] of replacements) {
    thAddr = thAddr.replace(pattern, rep);
  }
  return thAddr;
};

const formatProductName = (name: any) => {
  if (!name) return 'Pizza';
  let str = typeof name === 'string' ? name : (name.name || name.nameIt || 'Prodotto');
  return str.toUpperCase();
};

const parseCoordsFromAddress = (addressStr: string) => {
  if (!addressStr || typeof addressStr !== 'string') {
    return { address: addressStr || 'N/A', addressTh: addressStr || 'N/A', lat: RESTAURANT_LAT, lng: RESTAURANT_LNG };
  }

  // Extract explicit Thai address if present
  let addressTh = '';
  const thMatch = addressStr.match(/\[ADDR_TH:\s*([^\]]+)\]/i);
  if (thMatch) {
    addressTh = thMatch[1].trim();
  }

  // Extract notes and email
  let notes = '';
  const noteMatch = addressStr.match(/\[NOTE:\s*([^\]]+)\]/i);
  if (noteMatch) {
    notes = noteMatch[1].trim();
  }

  let email = '';
  const emailMatch = addressStr.match(/\[EMAIL:\s*([^\]]+)\]/i);
  if (emailMatch) {
    email = emailMatch[1].trim();
  }

  let lat = RESTAURANT_LAT;
  let lng = RESTAURANT_LNG;

  const coordMatch = addressStr.match(/\[COORD:\s*([0-9.-]+)\s*,\s*([0-9.-]+)\]/i)
                  || addressStr.match(/\[Lat:\s*([0-9.-]+)\s*,\s*Lng:\s*([0-9.-]+)\]/i);
  if (coordMatch) {
    lat = parseFloat(coordMatch[1]);
    lng = parseFloat(coordMatch[2]);
  }

  const cleanAddress = addressStr
    .replace(/\s*\[ADDR_TH:[^\]]+\]/gi, '')
    .replace(/\s*\[(COORD|Lat)[^\]]*\]/gi, '')
    .replace(/\s*\[EMAIL:[^\]]+\]/gi, '')
    .replace(/\s*\[NOTE:[^\]]+\]/gi, '')
    .replace(/\s*\[LANG:[^\]]+\]/gi, '')
    .trim();

  if (!addressTh) {
    addressTh = translateAddressToThai(cleanAddress);
  }

  return { address: cleanAddress, addressTh, notes, email, lat, lng };
};

export function KitchenTabletKDS() {
  const { orders, fetchOrders, updateOrderStatus, deleteOrder, subscribeToRealtime } = usePizzaAdminStore();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMobileTab, setSelectedMobileTab] = useState<'kitchen' | 'ready'>('kitchen');
  const [prepTimeCustom, setPrepTimeCustom] = useState<Record<string, number>>({});

  // 1. Language Toggle (🇬🇧 EN / 🇹🇭 TH)
  const [kdsLang, setKdsLang] = useState<'en' | 'th' | 'mm'>(() => {
    return (localStorage.getItem('kitchen_kds_lang') as 'en' | 'th') || 'th';
  });

  const changeLanguage = (lang: 'en' | 'th' | 'mm') => {
    setKdsLang(lang);
    localStorage.setItem('kitchen_kds_lang', lang);
  };

  // 2. Service Status & Pause Modal
  const [serviceStatus, setServiceStatus] = useState<PizzeriaServiceStatus>(DEFAULT_PIZZERIA_STATUS);
  const [serviceCalc, setServiceCalc] = useState<ServiceCalculationResult>(() => calculateServiceState(DEFAULT_PIZZERIA_STATUS));
  const [showPauseModal, setShowPauseModal] = useState(false);
  const showPauseModalRef = useRef(false);
  showPauseModalRef.current = showPauseModal;
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  // 2b. Table Reservations on Kitchen KDS (derived directly and reactively from Supabase Realtime orders)
  const tableReservations: TableReservationKDS[] = useMemo(() => {
    const tableOrders = orders.filter(isTableReservationOrder);
    return tableOrders.map(order => {
      const addr = String(order.address || '');
      const dateMatch = addr.match(/\[DATE:\s*([^\]]+)\]/i);
      const timeMatch = addr.match(/\[TIME:\s*([^\]]+)\]/i);
      const guestsMatch = addr.match(/\[GUESTS:\s*([^\]]+)\]/i);
      const areaMatch = addr.match(/\[AREA:\s*([^\]]+)\]/i);
      const emailMatch = addr.match(/\[EMAIL:\s*([^\]]+)\]/i);
      const occasionMatch = addr.match(/\[OCCASION:\s*([^\]]+)\]/i);
      const noteMatch = addr.match(/\[NOTE:\s*([^\]]+)\]/i);
      const isCancelledFlag = addr.includes('[CANCELLED:true]') || addr.includes('[CANCELLED]');

      const rawArea = areaMatch ? areaMatch[1].trim().toLowerCase() : 'any';
      const seatingArea = (['indoor', 'outdoor', 'hut', 'any'].includes(rawArea) ? rawArea : 'any') as TableReservationKDS['seating_area'];
      const guestsNum = guestsMatch ? parseInt(guestsMatch[1].trim(), 10) : 2;

      let status: TableReservationKDS['status'] = 'pending';
      if (isCancelledFlag || order.status === 'cancelled' || order.status === 'rejected') {
        status = 'cancelled';
      } else if (order.status === 'completed' || order.status === 'preparing' || order.status === 'delivering') {
        status = 'confirmed';
      } else {
        status = 'pending';
      }

      return {
        id: String(order.id),
        customer_name: order.customer_name || 'Cliente',
        contact: order.phone || '',
        email: emailMatch ? emailMatch[1].trim() : '',
        guests: isNaN(guestsNum) ? 2 : guestsNum,
        reservation_date: dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0],
        reservation_time: timeMatch ? timeMatch[1].trim() : '19:00',
        seating_area: seatingArea,
        occasion: occasionMatch ? occasionMatch[1].trim() : '',
        notes: noteMatch ? noteMatch[1].trim() : '',
        status,
        created_at: order.created_at || new Date().toISOString()
      };
    });
  }, [orders]);

  // Opening hours inputs and custom pause time
  const [editOpenTime, setEditOpenTime] = useState<string>('11:00');
  const [editCloseTime, setEditCloseTime] = useState<string>('21:30');
  const [customPauseMinutes, setCustomPauseMinutes] = useState<number>(45);
  const [hoursSavedSuccess, setHoursSavedSuccess] = useState<boolean>(false);

  const refreshServiceStatus = async () => {
    const st = await fetchPizzeriaStatus();
    setServiceStatus(st);
    setServiceCalc(calculateServiceState(st));
    // CRITICAL: NEVER overwrite inputs if the modal is currently open and being edited!
    if (!showPauseModalRef.current && st.openingHours) {
      setEditOpenTime(st.openingHours.openTime || '11:00');
      setEditCloseTime(st.openingHours.closeTime || '21:30');
    }
  };

  useEffect(() => {
    refreshServiceStatus();
    const interval = setInterval(refreshServiceStatus, 20000);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('flower_power_service_status');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'STATUS_UPDATED' && ev.data?.status) {
          setServiceStatus(ev.data.status);
          setServiceCalc(calculateServiceState(ev.data.status));
          // Do NOT overwrite user editing inputs if modal is currently open
          if (!showPauseModalRef.current && ev.data.status.openingHours) {
            setEditOpenTime(ev.data.status.openingHours.openTime || '11:00');
            setEditCloseTime(ev.data.status.openingHours.closeTime || '21:30');
          }
        }
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

  // Open Pause / Schedule Modal
  const handleOpenPauseModal = () => {
    if (serviceStatus.openingHours) {
      setEditOpenTime(serviceStatus.openingHours.openTime || '11:00');
      setEditCloseTime(serviceStatus.openingHours.closeTime || '21:30');
    }
    setShowPauseModal(true);
  };

  // Save Opening Hours
  const handleSaveOpeningHours = async () => {
    const newOpeningHours = {
      openTime: editOpenTime,
      closeTime: editCloseTime,
      closedDays: serviceStatus.openingHours?.closedDays || []
    };

    // 1. Immediately apply optimistic state
    const optimistic: PizzeriaServiceStatus = {
      ...serviceStatus,
      openingHours: newOpeningHours,
      lastUpdated: new Date().toISOString()
    };
    setServiceStatus(optimistic);
    setServiceCalc(calculateServiceState(optimistic));
    setHoursSavedSuccess(true);

    // 2. Persist to API & Supabase
    const updated = await updatePizzeriaStatus({
      openingHours: newOpeningHours
    });

    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    if (updated.openingHours) {
      setEditOpenTime(updated.openingHours.openTime);
      setEditCloseTime(updated.openingHours.closeTime);
    }

    setTimeout(() => {
      setHoursSavedSuccess(false);
      setShowPauseModal(false);
    }, 1200);
  };

  // Force Open Now (start service immediately in Thailand time even if before regular open time)
  const handleForceOpenNow = async () => {
    const bangkok = getBangkokTime();
    const newOpen = bangkok.timeStr;

    const newOpeningHours = {
      ...serviceStatus.openingHours,
      openTime: newOpen
    };

    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: null,
      pauseReason: '',
      openingHours: newOpeningHours
    });
    setEditOpenTime(newOpen);
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setShowPauseModal(false);
  };

  // Set Pause / Resume handlers
  const handleApplyPause = async (minutes: number) => {
    const pauseUntil = new Date(Date.now() + minutes * 60000).toISOString();
    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: pauseUntil,
      pauseReason: 'busy'
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setShowPauseModal(false);
  };

  const handleStopTonight = async () => {
    const updated = await updatePizzeriaStatus({
      isOpen: false,
      pausedUntil: null,
      pauseReason: 'closed_tonight'
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setShowPauseModal(false);
  };

  const handleResumeService = async () => {
    const updated = await updatePizzeriaStatus({
      isOpen: true,
      pausedUntil: null,
      pauseReason: ''
    });
    setServiceStatus(updated);
    setServiceCalc(calculateServiceState(updated));
    setShowPauseModal(false);
  };

  // 3. Clock timer - ALWAYS Thailand / Ranong local time (Asia/Bangkok, UTC+7)
  useEffect(() => {
    const updateClock = () => {
      const bangkok = getBangkokTime();
      setCurrentTime(bangkok.fullTimeStr);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timestamps when orders were accepted into preparation (persisted to localStorage)
  const [acceptedTimestamps, setAcceptedTimestamps] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('kitchen_accepted_timestamps');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Map of order IDs to snooze timestamp for 15-minute dispatch/closure reminder
  const [reminderSnoozedUntil, setReminderSnoozedUntil] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('kitchen_reminder_snoozed_until');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Set of order IDs acknowledged/handled by staff for new incoming buzzer
  const [acknowledgedOrderIds, setAcknowledgedOrderIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('kitchen_acknowledged_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Set of dining table order IDs minimized in bottom dock tray
  const [minimizedTableOrderIds, setMinimizedTableOrderIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('kitchen_minimized_table_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const [selectedTrayOrder, setSelectedTrayOrder] = useState<PizzaOrder | null>(null);

  const updateMinimizedTableOrders = (updater: (prev: Set<string>) => Set<string>) => {
    setMinimizedTableOrderIds(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem('kitchen_minimized_table_orders', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  // 4. Fetch orders, subscribe to Supabase Realtime, BroadcastChannels, and Screen Wake Lock
  useEffect(() => {
    // Initial fetch
    fetchOrders();
    const unsubscribe = subscribeToRealtime();

    const acquireLock = async () => {
      const ok = await requestScreenWakeLock();
      setWakeLockActive(ok);
    };
    acquireLock();

    // Broadcast channel handlers for instant 0ms sync between dining tablet and kitchen monitor
    let bcOrders1: BroadcastChannel | null = null;
    let bcOrders2: BroadcastChannel | null = null;

    const handleIncomingBroadcast = (data: any) => {
      if (!data) return;
      const targetId = data.orderId || data.order?.id;
      const idStr = targetId ? String(targetId) : '';

      // If it's a new order or table reload with new items, re-arm buzzer, unminimize, and fetch new items
      if (data.type === 'NEW_ORDER' || data.isTableReload || data.hasNewItems || data.order?.status === 'new') {
        if (idStr) {
          setAcknowledgedOrderIds(prev => {
            if (!prev.has(idStr)) return prev;
            const next = new Set(prev);
            next.delete(idStr);
            try { localStorage.setItem('kitchen_acknowledged_orders', JSON.stringify(Array.from(next))); } catch (e) {}
            return next;
          });
          setMinimizedTableOrderIds(prev => {
            if (!prev.has(idStr)) return prev;
            const next = new Set(prev);
            next.delete(idStr);
            try { localStorage.setItem('kitchen_minimized_table_orders', JSON.stringify(Array.from(next))); } catch (e) {}
            return next;
          });
        }
        fetchOrders();
      } else if (data.status && idStr) {
        // Direct zero-latency in-memory update for status changes (NEVER fetchOrders here to prevent reverting optimistic state!)
        usePizzaAdminStore.setState(state => ({
          orders: state.orders.map(o => String(o.id) === idStr ? { ...o, status: data.status } : o)
        }));
      }
    };

    try {
      bcOrders1 = new BroadcastChannel('pizza_orders_channel');
      bcOrders1.onmessage = (ev) => handleIncomingBroadcast(ev.data);
    } catch {}

    try {
      bcOrders2 = new BroadcastChannel('flower_power_orders_channel');
      bcOrders2.onmessage = (ev) => handleIncomingBroadcast(ev.data);
    } catch {}

    // Heartbeat safety polling every 10 seconds while tablet screen is open/visible
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    }, 10000);

    // Instant re-fetch when tablet screen turns on, unlocks, or tab regains focus
    const handleWakeupAndFocus = () => {
      if (document.visibilityState === 'visible') {
        acquireLock();
        fetchOrders();
      }
    };

    const handleOnline = () => {
      fetchOrders();
    };

    document.addEventListener('visibilitychange', handleWakeupAndFocus);
    window.addEventListener('focus', handleWakeupAndFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribe();
      if (bcOrders1) bcOrders1.close();
      if (bcOrders2) bcOrders2.close();
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleWakeupAndFocus);
      window.removeEventListener('focus', handleWakeupAndFocus);
      window.removeEventListener('online', handleOnline);
      stopContinuousAlarm();
      stopDispatchReminderAlarm();
      releaseScreenWakeLock();
    };
  }, []);

  // Active Dining Tables in Hall (Guaranteed 1 single card per table in bottom dock)
  const activeDiningOrders = useMemo(() => {
    const rawDining = orders.filter(o => isDiningTableOrder(o) && o.status !== 'completed' && o.status !== 'cancelled');
    const tableMap = new Map<string, PizzaOrder>();
    rawDining.forEach(o => {
      const rawTable = extractTableFromAddress(o.address) || o.table_number || String(o.id);
      const canonicalKey = getCanonicalTableKey(rawTable);
      if (!tableMap.has(canonicalKey)) {
        tableMap.set(canonicalKey, o);
      }
    });
    return Array.from(tableMap.values());
  }, [orders]);

  // 6. Group into PHASES:
  // Table Reservations
  const pendingTableReservations = useMemo(() => {
    return tableReservations.filter(r => r.status === 'pending');
  }, [tableReservations]);

  const completedTableReservations = useMemo(() => {
    return tableReservations.filter(r => r.status === 'confirmed' || r.status === 'completed');
  }, [tableReservations]);

  const unacknowledgedTableReservations = useMemo(() => {
    return pendingTableReservations.filter(r => !acknowledgedOrderIds.has(r.id));
  }, [pendingTableReservations, acknowledgedOrderIds]);

  // Phase 1: In Kitchen (New orders to accept - delivery/takeaway and dining tables)
  // Deduplicates dining table orders by canonical table key so exactly 1 ticket per table is shown
  const kitchenOrders = useMemo(() => {
    const rawKitchen = orders.filter(o => !isTableReservationOrder(o) && (o.status === 'new' || (o.status as any) === 'received'));
    const seenTables = new Set<string>();
    const result: PizzaOrder[] = [];

    for (const order of rawKitchen) {
      if (isDiningTableOrder(order)) {
        const rawTable = extractTableFromAddress(order.address) || order.table_number || String(order.id);
        const tableKey = getCanonicalTableKey(rawTable);
        if (seenTables.has(tableKey)) {
          continue; // Skip duplicate ticket for same table
        }
        seenTables.add(tableKey);
      }
      result.push(order);
    }
    return result;
  }, [orders]);

  // Phase 2: In Preparation & Delivering (Orders confirmed, cooking or out for delivery)
  // Excludes dining table orders that are currently minimized down in the kitchen dock
  const readyOrders = useMemo(() => {
    // 1. First filter active preparing or delivering orders
    const active = orders.filter(o => {
      if (isTableReservationOrder(o)) return false;
      const isReadyStatus = o.status === 'preparing' || o.status === 'delivering' || (o.status as any) === 'ready';
      return isReadyStatus;
    });

    const seenTables = new Set<string>();
    const result: PizzaOrder[] = [];

    for (const order of active) {
      if (isDiningTableOrder(order)) {
        const rawTable = extractTableFromAddress(order.address) || order.table_number || String(order.id);
        const tableKey = getCanonicalTableKey(rawTable);

        // Check if ANY order for this table is currently minimized in the bottom dock
        const isAnyOrderMinimized = minimizedTableOrderIds.has(String(order.id)) || 
          minimizedTableOrderIds.has(tableKey) ||
          orders.some(o => {
            if (o.status === 'completed' || o.status === 'cancelled') return false;
            const oKey = getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id));
            return oKey === tableKey && minimizedTableOrderIds.has(String(o.id));
          });

        if (isAnyOrderMinimized) {
          continue; // Table is active in dock tray, hide completely from right column
        }

        // Deduplicate: if dispatched, show exactly 1 card per table in right column
        if (seenTables.has(tableKey)) {
          continue;
        }
        seenTables.add(tableKey);
      }
      result.push(order);
    }
    return result;
  }, [orders, minimizedTableOrderIds]);

  // Phase 3: Completed Orders Today (Archived & delivered in the last 24h)
  const completedTodayOrders = useMemo(() => {
    return orders.filter(o => !isTableReservationOrder(o) && o.status === 'completed');
  }, [orders]);

  // Helper to calculate minutes spent in preparation
  const getElapsedPrepMinutes = (order: PizzaOrder) => {
    const acceptedAt = acceptedTimestamps[String(order.id)];
    if (acceptedAt) {
      return Math.floor((Date.now() - acceptedAt) / 60000);
    }
    if (order.created_at) {
      return Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
    }
    return 0;
  };

  // Test alarm toggle states
  const [testingNewOrderAlarm, setTestingNewOrderAlarm] = useState(false);
  const [testingReminderAlarm, setTestingReminderAlarm] = useState(false);

  // Truly unacknowledged new orders trigger the buzzer (based strictly on visible, deduplicated kitchenOrders)
  const unacknowledgedNewOrders = useMemo(() => {
    return kitchenOrders.filter(o => !acknowledgedOrderIds.has(String(o.id)));
  }, [kitchenOrders, acknowledgedOrderIds]);

  // Delivery orders cooking for 15+ minutes that need dispatch reminder (EXCLUDES dining room tables & stale orders older than 3h)
  const overdueDispatchOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter(o => {
      if (isTableReservationOrder(o)) return false;
      if (isDiningTableOrder(o)) return false; // Dining room tables do NOT trigger delivery dispatch buzzer
      if (o.status !== 'preparing') return false;
      if (o.created_at) {
        const ageHours = (now - new Date(o.created_at).getTime()) / (3600 * 1000);
        if (ageHours > 3) return false; // Ignore stale historical test orders
      }
      const mins = getElapsedPrepMinutes(o);
      if (mins < 15) return false;
      const snoozedUntil = reminderSnoozedUntil[String(o.id)];
      if (snoozedUntil && now < snoozedUntil) {
        return false;
      }
      return true;
    });
  }, [orders, acceptedTimestamps, reminderSnoozedUntil, currentTime]);

  // 7. Sound Alarm Management (Urgent Alarm for New Orders + Chime for 15-min Dispatch Reminder + Test modes)
  useEffect(() => {
    if (soundMuted) {
      stopContinuousAlarm();
      stopDispatchReminderAlarm();
      if (testingNewOrderAlarm) setTestingNewOrderAlarm(false);
      if (testingReminderAlarm) setTestingReminderAlarm(false);
      return;
    }

    // Priority 1: High-urgency loud alarm for unacknowledged new orders OR unacknowledged table reservations OR Test New Orders Alarm
    if (unacknowledgedNewOrders.length > 0 || unacknowledgedTableReservations.length > 0 || testingNewOrderAlarm) {
      stopDispatchReminderAlarm();
      startContinuousAlarm();
    } else {
      stopContinuousAlarm();

      // Priority 2: Melodic reminder chime for orders cooking for 15+ minutes OR Test Reminder Alarm
      if (overdueDispatchOrders.length > 0 || testingReminderAlarm) {
        startDispatchReminderAlarm();
      } else {
        stopDispatchReminderAlarm();
      }
    }
  }, [unacknowledgedNewOrders.length, unacknowledgedTableReservations.length, overdueDispatchOrders.length, soundMuted, testingNewOrderAlarm, testingReminderAlarm]);

  const toggleTestNewOrderAlarm = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    initKitchenAudio();
    if (testingNewOrderAlarm) {
      setTestingNewOrderAlarm(false);
      stopContinuousAlarm();
    } else {
      if (soundMuted) setSoundMuted(false);
      setTestingReminderAlarm(false);
      stopDispatchReminderAlarm();
      setTestingNewOrderAlarm(true);
    }
  };

  const toggleTestReminderAlarm = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    initKitchenAudio();
    if (testingReminderAlarm) {
      setTestingReminderAlarm(false);
      stopDispatchReminderAlarm();
    } else {
      if (soundMuted) setSoundMuted(false);
      setTestingNewOrderAlarm(false);
      stopContinuousAlarm();
      setTestingReminderAlarm(true);
    }
  };

  const handleSilenceAlarm = () => {
    setTestingNewOrderAlarm(false);
    setTestingReminderAlarm(false);
    stopAllKitchenAlarms();
    setAcknowledgedOrderIds(prev => {
      const next = new Set(prev);
      orders.forEach(o => next.add(String(o.id)));
      tableReservations.forEach(r => next.add(String(r.id)));
      try { localStorage.setItem('kitchen_acknowledged_orders', JSON.stringify(Array.from(next))); } catch (e) {}
      return next;
    });
    const tenMinLater = Date.now() + 10 * 60 * 1000;
    setReminderSnoozedUntil(prev => {
      const next = { ...prev };
      orders.forEach(o => {
        next[String(o.id)] = tenMinLater;
      });
      try { localStorage.setItem('kitchen_reminder_snoozed_until', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleSnoozeReminder = (orderId: string | number, minutes: number = 10) => {
    stopAllKitchenAlarms();
    setTestingReminderAlarm(false);
    setTestingNewOrderAlarm(false);
    const idStr = String(orderId);
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    
    // Acknowledge active orders so continuous buzzer doesn't re-trigger
    setAcknowledgedOrderIds(prev => {
      const next = new Set(prev);
      next.add(idStr);
      orders.forEach(o => next.add(String(o.id)));
      tableReservations.forEach(r => next.add(String(r.id)));
      try { localStorage.setItem('kitchen_acknowledged_orders', JSON.stringify(Array.from(next))); } catch (e) {}
      return next;
    });

    // Snooze this specific order and all currently overdue orders for 10 minutes
    setReminderSnoozedUntil(prev => {
      const next = {
        ...prev,
        [idStr]: snoozeUntil
      };
      overdueDispatchOrders.forEach(o => {
        next[String(o.id)] = snoozeUntil;
      });
      try { localStorage.setItem('kitchen_reminder_snoozed_until', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  // Actions
  const handleArchiveTableReservation = async (resId: string) => {
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => new Set(prev).add(resId));
    await updateOrderStatus(resId, 'completed');
    try {
      await fetch('/api/table-reservation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resId, status: 'confirmed' })
      });
    } catch (err) {
      console.warn('Error archiving table reservation on KDS:', err);
    }
  };

  const handleRejectTableReservation = async (resId: string) => {
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => new Set(prev).add(String(resId)));
    setReminderSnoozedUntil(prev => {
      const next = { ...prev };
      delete next[String(resId)];
      return next;
    });
    await updateOrderStatus(resId, 'cancelled');
    try {
      await fetch('/api/table-reservation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resId, status: 'cancelled' })
      });
    } catch (err) {
      console.warn('Error rejecting table reservation on KDS:', err);
    }
  };

  const handleForceDeleteOrder = async (orderId: string) => {
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => new Set(prev).add(String(orderId)));
    setReminderSnoozedUntil(prev => {
      const next = { ...prev };
      delete next[String(orderId)];
      return next;
    });
    await deleteOrder(orderId);
  };

  const handleAcceptOrder = (orderId: string, minutes: number = 30) => {
    stopContinuousAlarm();
    stopAllKitchenAlarms();

    const target = orders.find(o => String(o.id) === String(orderId));
    const targetTableKey = target ? getCanonicalTableKey(extractTableFromAddress(target.address) || target.table_number || String(target.id)) : '';

    setAcknowledgedOrderIds(prev => {
      const next = new Set(prev);
      next.add(String(orderId));
      if (targetTableKey) {
        orders.forEach(o => {
          if (getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
            next.add(String(o.id));
          }
        });
      }
      try { localStorage.setItem('kitchen_acknowledged_orders', JSON.stringify(Array.from(next))); } catch (e) {}
      return next;
    });

    setAcceptedTimestamps(prev => {
      const next = { ...prev, [orderId]: Date.now() };
      if (targetTableKey) {
        orders.forEach(o => {
          if (getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
            next[String(o.id)] = Date.now();
          }
        });
      }
      try { localStorage.setItem('kitchen_accepted_timestamps', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    // Snooze any reminder for this order so it can never chime immediately
    setReminderSnoozedUntil(prev => {
      const next = { ...prev, [String(orderId)]: Date.now() + 60 * 60 * 1000 };
      if (targetTableKey) {
        orders.forEach(o => {
          if (getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
            next[String(o.id)] = Date.now() + 60 * 60 * 1000;
          }
        });
      }
      try { localStorage.setItem('kitchen_reminder_snoozed_until', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    if (target && isDiningTableOrder(target)) {
      // Put dining table order into minimized bottom tray IMMEDIATELY (all matching table orders and table key)
      updateMinimizedTableOrders(prev => {
        const next = new Set(prev);
        next.add(String(orderId));
        if (targetTableKey) {
          next.add(targetTableKey);
          orders.forEach(o => {
            if (getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
              next.add(String(o.id));
            }
          });
        }
        return next;
      });
    }

    // Trigger instant optimistic update in Zustand store (0ms UI latency)
    updateOrderStatus(orderId, 'preparing');
    if (targetTableKey) {
      orders.forEach(o => {
        if (String(o.id) !== String(orderId) && getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
          updateOrderStatus(o.id, 'preparing');
        }
      });
    }
  };

  const handleDispatchTableOrder = (orderId: string) => {
    const target = orders.find(o => String(o.id) === String(orderId));
    const targetTableKey = target ? getCanonicalTableKey(extractTableFromAddress(target.address) || target.table_number || String(target.id)) : '';

    // Remove all IDs belonging to this table from minimized dock tray so it moves to Phase 2 (Right column)
    updateMinimizedTableOrders(prev => {
      const next = new Set(prev);
      next.delete(String(orderId));
      if (targetTableKey) {
        next.delete(targetTableKey);
        orders.forEach(o => {
          if (getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
            next.delete(String(o.id));
          }
        });
      }
      return next;
    });
    setSelectedTrayOrder(null);
  };

  const handleOrderReady = async (orderId: string) => {
    setReminderSnoozedUntil(prev => {
      const next = { ...prev };
      delete next[String(orderId)];
      return next;
    });
    await updateOrderStatus(orderId, 'delivering');
  };

  const handleOrderCompleted = async (orderId: string) => {
    stopContinuousAlarm();
    stopAllKitchenAlarms();
    const target = orders.find(o => String(o.id) === String(orderId));
    const targetTableKey = (target && isDiningTableOrder(target)) ? getCanonicalTableKey(extractTableFromAddress(target.address) || target.table_number || String(target.id)) : '';

    setReminderSnoozedUntil(prev => {
      const next = { ...prev };
      delete next[String(orderId)];
      if (targetTableKey) {
        orders.forEach(o => {
          if (getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
            delete next[String(o.id)];
          }
        });
      }
      return next;
    });

    if (targetTableKey) {
      const tableOrders = orders.filter(o => getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey && o.status !== 'completed' && o.status !== 'cancelled');
      await Promise.all(tableOrders.map(o => updateOrderStatus(o.id, 'completed')));
      try {
        const bc = new BroadcastChannel('pizza_table_channel');
        bc.postMessage({ type: 'TABLE_SETTLED', tableKey: targetTableKey, orderId });
        bc.close();
      } catch {}
    } else {
      await updateOrderStatus(orderId, 'completed');
    }
  };

  const handleCompleteTableOrder = async (orderId: string) => {
    stopContinuousAlarm();
    stopAllKitchenAlarms();

    const target = orders.find(o => String(o.id) === String(orderId));
    const targetTableKey = target ? getCanonicalTableKey(extractTableFromAddress(target.address) || target.table_number || String(target.id)) : '';

    // 1. Instant 0ms Optimistic UI updates (dismiss alert, close modal, remove from dock & local store)
    setReminderSnoozedUntil(prev => {
      const next = { ...prev };
      delete next[String(orderId)];
      if (targetTableKey) {
        orders.forEach(o => {
          if (getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
            delete next[String(o.id)];
          }
        });
      }
      return next;
    });

    updateMinimizedTableOrders(prev => {
      const next = new Set(prev);
      next.delete(String(orderId));
      if (targetTableKey) {
        next.delete(targetTableKey);
        orders.forEach(o => {
          if (getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey) {
            next.delete(String(o.id));
          }
        });
      }
      return next;
    });
    setSelectedTrayOrder(null);

    // Trigger instant optimistic update in Zustand store for ALL matching table orders
    const tableOrders = targetTableKey 
      ? orders.filter(o => getCanonicalTableKey(extractTableFromAddress(o.address) || o.table_number || String(o.id)) === targetTableKey && o.status !== 'completed' && o.status !== 'cancelled')
      : [target].filter(Boolean) as PizzaOrder[];

    const updatePromises = tableOrders.map(o => updateOrderStatus(o.id, 'completed'));

    // 2. Broadcast immediately to local tablet channels
    const rawTableKey = target ? extractTableFromAddress(target.address) : targetTableKey;
    if (rawTableKey) {
      try {
        const bc = new BroadcastChannel('pizza_table_channel');
        bc.postMessage({ type: 'TABLE_SETTLED', tableKey: rawTableKey, orderId });
        bc.close();
      } catch {}
    }

    // 3. Persist paid status to Supabase in background for all orders of this table
    try {
      const idsToComplete = tableOrders.map(o => o.id);
      if (idsToComplete.length > 0) {
        await Promise.allSettled([
          ...updatePromises,
          supabase
            .from('pizza_orders')
            .update({ status: 'completed' })
            .in('id', idsToComplete)
        ]);
      }
    } catch (err) {
      console.warn('Error completing table orders in Supabase:', err);
    }
  };

  const handleOrderCancelled = async (orderId: string) => {
    initKitchenAudio();
    stopContinuousAlarm();
    setAcknowledgedOrderIds(prev => new Set(prev).add(String(orderId)));
    setReminderSnoozedUntil(prev => {
      const next = { ...prev };
      delete next[String(orderId)];
      return next;
    });

    const target = orders.find(o => String(o.id) === String(orderId));
    if (target && isTableReservationOrder(target)) {
      await handleRejectTableReservation(String(orderId));
      return;
    }

    await updateOrderStatus(orderId, 'cancelled');
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Elapsed minutes helper
  const getElapsedMinutes = (dateStr: string) => {
    if (!dateStr) return 0;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diffMs / 60000);
  };

  // Dictionary for UI strings based on kdsLang
  const t = {
    kitchenTitle: kdsLang === 'mm' ? 'မီးဖိုချောင် မော်နီတာ' : kdsLang === 'th' ? 'ครัวพิซซ่า' : 'KITCHEN MONITOR',
    brandSubtitle: kdsLang === 'mm' ? 'ဖလာဝါ ပါဝါ ပီဇာ ရနောင်း' : kdsLang === 'th' ? 'ฟลาวเวอร์ พาวเวอร์ พิซซ่า ระนอง' : 'FLOWER POWER PIZZA RANONG',
    col1Title: kdsLang === 'mm' ? 'အော်ဒါအသစ်များ (စတင်ချက်ပြုတ်ရန်)' : kdsLang === 'th' ? 'ออเดอร์ใหม่ (รอรับ & เริ่มทำ)' : 'NEW ORDERS (TO ACCEPT)',
    col2Title: kdsLang === 'mm' ? 'ပြင်ဆင်နေဆဲနှင့် ပို့ဆောင်နေဆဲ' : kdsLang === 'th' ? 'กำลังเตรียม & กำลังส่ง' : 'PREPARING & DELIVERING',
    noKitchenOrders: kdsLang === 'mm' ? 'အော်ဒါအသစ် မရှိပါ' : kdsLang === 'th' ? 'ไม่มีออเดอร์ใหม่' : 'NO NEW ORDERS',
    noKitchenSub: kdsLang === 'mm' ? 'အော်ဒါအသစ်ဝင်လာပါက အချက်ပေးသံ မြည်ပါမည်' : kdsLang === 'th' ? 'แท็บเล็ตจะส่งเสียงเตือนเมื่อมีออเดอร์ใหม่เข้ามา' : 'Tablet will ring when a new order arrives.',
    noReadyOrders: kdsLang === 'mm' ? 'ပြင်ဆင်ဆဲ အော်ဒါမရှိပါ' : kdsLang === 'th' ? 'ไม่มีออเดอร์กำลังทำหรือส่ง' : 'NO ORDERS IN PREPARATION',
    noReadySub: kdsLang === 'mm' ? 'လက်ခံထားသော အော်ဒါများကို ဤနေရာတွင် ပြသပါမည်' : kdsLang === 'th' ? 'ออเดอร์ที่รับแล้วจะแสดงที่นี่เพื่อจัดเตรียมและส่ง' : 'Accepted orders will appear here for preparation & delivery.',
    acceptBtn: kdsLang === 'mm' ? 'အော်ဒါ လက်ခံမည်' : kdsLang === 'th' ? 'รับออเดอร์' : 'ACCEPT ORDER',
    muteBtn: kdsLang === 'mm' ? 'အသံပိတ်' : kdsLang === 'th' ? 'ปิดเสียง' : 'MUTE',
    muteAlarmBar: kdsLang === 'mm' ? 'အချက်ပေးသံ ပိတ်မည်' : kdsLang === 'th' ? 'ปิดเสียงเตือน' : 'MUTE ALARM',
    dispatchRiderBtn: kdsLang === 'mm' ? '🛵 ပို့ဆောင်သူ ထွက်ခွာပါပြီ' : kdsLang === 'th' ? '🛵 ไรเดอร์ออกไปส่งแล้ว' : '🛵 DISPATCH RIDER (OUT)',
    bakedBtn: kdsLang === 'mm' ? 'ဖုတ်ပြီးပြီ ➔ ပို့ဆောင်သူထံ လွှဲပေးရန်' : kdsLang === 'th' ? 'อบเสร็จแล้ว ➔ ส่งให้ไรเดอร์' : 'BAKED ➔ READY FOR RIDER',
    directArchiveBtn: kdsLang === 'mm' ? '✓ ပြီးစီးကြောင်း မှတ်တမ်းတင်မည်' : kdsLang === 'th' ? '✓ ปิดงานทันที' : '✓ ARCHIVE DIRECTLY',
    deliveredBtn: kdsLang === 'mm' ? '✓ ပို့ဆောင်ပြီးပါပြီ' : kdsLang === 'th' ? '✓ ส่งเรียบร้อยแล้ว / บันทึกประวัติ' : '✓ DELIVERED & ARCHIVED',
    cancelBtn: kdsLang === 'mm' ? '✕ ပယ်ဖျက်မည်' : kdsLang === 'th' ? '✕ ยกเลิก' : '✕ CANCEL',
    minAgo: kdsLang === 'mm' ? 'မိနစ်အကြာက' : kdsLang === 'th' ? 'นาทีที่แล้ว' : 'm ago',
    cookingFor: kdsLang === 'mm' ? 'ဖုတ်နေဆဲ' : kdsLang === 'th' ? 'กำลังอบ' : 'COOKING',
    min: kdsLang === 'mm' ? 'မိနစ်' : kdsLang === 'th' ? 'นาที' : 'min',
    newBadge: kdsLang === 'mm' ? 'အော်ဒါအသစ်' : kdsLang === 'th' ? 'ออเดอร์ใหม่' : 'NEW ORDER',
    callBtn: kdsLang === 'mm' ? 'ဖုန်းခေါ်' : kdsLang === 'th' ? 'โทร' : 'CALL',
    notifyCustBtn: kdsLang === 'mm' ? 'ဖောက်သည်ထံ အကြောင်းကြားရန်' : kdsLang === 'th' ? 'แจ้งลูกค้า' : 'NOTIFY CUSTOMER',
    sendRiderBtn: kdsLang === 'mm' ? 'မြေပုံ' : kdsLang === 'th' ? 'ส่งไรเดอร์' : 'RIDER MAP',
    mapBtn: kdsLang === 'mm' ? 'မြေပုံ' : kdsLang === 'th' ? 'แผนที่' : 'MAP',
    screenOn: kdsLang === 'mm' ? 'စခရင် ဖွင့်ထားမည်' : kdsLang === 'th' ? 'เปิดจอค้าง' : 'SCREEN ON',
    testSound: kdsLang === 'mm' ? 'အသံစမ်းသပ် 🔔' : kdsLang === 'th' ? 'ทดสอบ 🔔' : 'TEST 🔔',
    serviceOpen: kdsLang === 'mm' ? 'ဖွင့်ထားသည်' : kdsLang === 'th' ? 'เปิดรับออเดอร์' : 'ONLINE: OPEN',
    servicePaused: kdsLang === 'mm' ? 'ခေတ္တပိတ်ထားသည်' : kdsLang === 'th' ? 'พักรับออเดอร์' : 'ONLINE: PAUSED',
    serviceClosed: kdsLang === 'mm' ? 'ပိတ်ထားသည်' : kdsLang === 'th' ? 'ปิดตามเวลา' : 'ONLINE: CLOSED',
    hoursTitle: kdsLang === 'mm' ? 'ဆိုင်ဖွင့်ချိန် - ပိတ်ချိန်' : kdsLang === 'th' ? 'เวลาเปิด - ปิดร้าน' : 'OPENING & CLOSING HOURS',
    openTimeLabel: kdsLang === 'mm' ? 'ဖွင့်ချိန်:' : kdsLang === 'th' ? 'เวลาเปิด:' : 'Open Time:',
    closeTimeLabel: kdsLang === 'mm' ? 'ပိတ်ချိန်:' : kdsLang === 'th' ? 'เวลาปิด:' : 'Close Time:',
    saveHoursBtn: kdsLang === 'mm' ? 'အချိန် သိမ်းဆည်းမည်' : kdsLang === 'th' ? 'บันทึกเวลาเปิด-ปิด' : 'SAVE HOURS',
    hoursSaved: kdsLang === 'mm' ? 'သိမ်းဆည်းပြီးပါပြီ!' : kdsLang === 'th' ? 'บันทึกเรียบร้อย!' : 'HOURS SAVED!',
    customPauseLabel: kdsLang === 'mm' ? 'ခေတ္တရပ်နားချိန် (မိနစ်):' : kdsLang === 'th' ? 'กำหนดเวลาหยุดพักเอง (นาที):' : 'Custom Pause Duration (min):',
    applyCustomPause: kdsLang === 'mm' ? 'ရပ်နားမည်' : kdsLang === 'th' ? 'ตั้งเวลาพัก' : 'SET PAUSE',
    openNowEarly: kdsLang === 'mm' ? 'ယခုချက်ချင်း ဖွင့်မည်' : kdsLang === 'th' ? 'เปิดรับออเดอร์ทันที (เริ่มบริการ)' : 'START SERVICE NOW (OPEN EARLY)',
    sizeLabel: kdsLang === 'mm' ? 'အရွယ်အစား' : kdsLang === 'th' ? 'ขนาด' : 'Size',
    extraLabel: kdsLang === 'mm' ? 'အပိုထည့်ရန်' : kdsLang === 'th' ? 'พิเศษ' : 'Extra',
    dispatchReminderBadge: kdsLang === 'mm' ? '⏰ ၁၅ မိနစ်ကျော်ပြီ: အော်ဒါပိတ်ရန် မမေ့ပါနှင့်' : kdsLang === 'th' ? '⏰ เกิน 15 นาที: เตือนให้ปิดออเดอร์' : '⏰ 15+ MIN: REMEMBER TO CLOSE ORDER',
    snoozeReminderBtn: kdsLang === 'mm' ? '၁၀ မိနစ် ရွှေ့မည်' : kdsLang === 'th' ? 'เลื่อน 10 นาที' : 'SNOOZE 10 MIN',
    snoozedBadge: kdsLang === 'mm' ? 'ရွှေ့ဆိုင်းထားဆဲ' : kdsLang === 'th' ? 'เลื่อนเตือนอยู่' : 'SNOOZED',
    testAlarmBtn: kdsLang === 'mm' ? 'အသံစမ်းသပ် ၁' : kdsLang === 'th' ? 'ทดสอบเสียง 1' : 'TEST 1 🔔',
    testChimeBtn: kdsLang === 'mm' ? 'အသံစမ်းသပ် ၂' : kdsLang === 'th' ? 'ทดสอบเสียง 2' : 'TEST 2 ⏰',
    stopTestBtn: kdsLang === 'mm' ? 'အသံရပ်မည်' : kdsLang === 'th' ? 'หยุดเสียง' : 'STOP',
    rejectResBtn: kdsLang === 'mm' ? '✕ ငြင်းပယ်မည်' : kdsLang === 'th' ? '✕ ปฏิเสธ' : '✕ REJECT',
    deleteBtn: kdsLang === 'mm' ? '🗑️ အပြီးဖျက်မည်' : kdsLang === 'th' ? '🗑️ ลบถาวร' : '🗑️ DELETE',
    orderPaidBtn: kdsLang === 'mm' ? '💳 အော်ဒါ ငွေရှင်းပြီးပါပြီ / ပိတ်ပါ' : kdsLang === 'th' ? '💳 ชำระเงินแล้ว / ปิดโต๊ะ' : '💳 ORDER PAID (CLOSE & ARCHIVE)',
    readyForSettlementBtn: kdsLang === 'mm' ? '✓ ငွေရှင်းရန် အသင့်ဖြစ်နေသည် (ညာဘက်သို့ ရွှေ့ပါ)' : kdsLang === 'th' ? '✓ พร้อมสำหรับการชำระ (ย้ายไปขวา)' : '✓ READY FOR SETTLEMENT (MOVE TO RIGHT)',
    openTableNotice: kdsLang === 'mm' ? 'စားပွဲခုံ ဖွင့်ထားသည်- ထပ်တိုးရန် အသင့်ရှိသည်' : kdsLang === 'th' ? 'โต๊ะเปิดในห้องอาหาร: พร้อมรับรายการเพิ่ม' : 'Open table in dining room: ready for extra orders',
  };

  return (
    <div 
      className="min-h-screen bg-[#0b0e14] text-white flex flex-col font-sans select-none antialiased"
      onClick={() => initKitchenAudio()}
    >
      {/* ─── TOP KITCHEN STATUS BAR (NO BACK ARROW, OFFICIAL LOGO) ──────────────── */}
      <header className="bg-[#131722] border-b-2 border-stone-800 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shrink-0">
        
        {/* Left: Official Brand Logo + Title + Clock */}
        <div className="flex items-center gap-3">
          <img 
            src="/flower-power-pizza-emblem.png" 
            alt="Flower Power Pizza" 
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          />

          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-none">
              {t.kitchenTitle}
            </h1>
            <span className="text-[11px] font-bold text-amber-400">
              {t.brandSubtitle}
            </span>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center px-3 py-1 rounded-xl bg-[#080a0f] border border-stone-800 font-mono tracking-wider leading-tight">
            <div className="flex items-center gap-1.5 text-base lg:text-lg font-black text-amber-400">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{currentTime}</span>
            </div>
            <span className="text-[10px] font-bold text-stone-500 tracking-normal flex items-center gap-1">
              <span>🇹🇭 Ranong</span>
              <span className="text-amber-500/80 font-mono">UTC+7</span>
            </span>
          </div>
        </div>

        {/* Center: Mobile 2-Phase Switcher (only shown on small screens) */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => setSelectedMobileTab('kitchen')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedMobileTab === 'kitchen'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            <span>{t.col1Title.split('(')[0]}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-white text-[11px]">
              {kitchenOrders.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedMobileTab('ready')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedMobileTab === 'ready'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            <span>{t.col2Title.split('(')[0]}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-white text-[11px]">
              {readyOrders.length}
            </span>
          </button>
        </div>

        {/* Right: Controls & Language Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Quick Mute Alarm button when alarm is buzzing */}
          {unacknowledgedNewOrders.length > 0 && !soundMuted && (
            <button
              type="button"
              onClick={handleSilenceAlarm}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 animate-bounce shadow-lg shadow-red-600/50 cursor-pointer border border-white/40"
              title={t.muteAlarmBar}
            >
              <BellOff className="w-4 h-4 stroke-[3]" />
              <span>{t.muteAlarmBar}</span>
            </button>
          )}

          {/* Quick Mute Dispatch Reminder chime when sounding */}
          {unacknowledgedNewOrders.length === 0 && overdueDispatchOrders.length > 0 && !soundMuted && (
            <button
              type="button"
              onClick={handleSilenceAlarm}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-lg shadow-amber-500/40 cursor-pointer border border-amber-300 active:scale-95 transition-all"
              title="Posticipa la suoneria promemoria di 10 minuti"
            >
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span>{kdsLang === 'th' ? `เลื่อน 10 น. (${overdueDispatchOrders.length})` : `POSTICIPA 10 MIN (${overdueDispatchOrders.length})`}</span>
            </button>
          )}

          {/* Service Status / Pause Management Button */}
          <button
            onClick={handleOpenPauseModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 border transition-all cursor-pointer ${
              serviceCalc.state === 'OPEN'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                : serviceCalc.state === 'PAUSED'
                  ? 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse hover:bg-amber-900 shadow-md shadow-amber-600/30'
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white'
            }`}
            title="Manage delivery service, pause & opening hours"
          >
            {serviceCalc.state === 'OPEN' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">{t.serviceOpen}</span>
              </>
            ) : serviceCalc.state === 'PAUSED' ? (
              <>
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span>
                  {kdsLang === 'th' ? `พัก: ${serviceCalc.remainingMinutes} น.` : `PAUSED: ${serviceCalc.remainingMinutes}m`}
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-300" />
                <span>
                  {kdsLang === 'th' ? `ปิด (เปิด ${serviceStatus.openingHours?.openTime || '11:00'})` : `CLOSED (OPENS ${serviceStatus.openingHours?.openTime || '11:00'})`}
                </span>
              </>
            )}
          </button>

          {/* Language Switcher Toggle (🇬🇧 EN / 🇹🇭 TH) */}
          <div className="flex items-center rounded-xl bg-[#090b0f] p-0.5 border border-stone-700">
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                kdsLang === 'en' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Switch to English"
            >
              <span className="text-sm">🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('th')}
              className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                kdsLang === 'th' 
                  ? 'bg-amber-500 text-stone-950 shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
              title="เปลี่ยนเป็นภาษาไทย"
            >
              <span className="text-sm">🇹🇭</span>
              <span>TH</span>
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('mm')}
              className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                kdsLang === 'mm' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
              title="မြန်မာဘာသာသို့ ပြောင်းမည်"
            >
              <span className="text-sm">🇲🇲</span>
              <span>MM</span>
            </button>
          </div>

          {/* Completed Orders Archive Today Button */}
          <button
            type="button"
            onClick={() => setShowCompletedModal(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title={kdsLang === 'th' ? 'ดูประวัติออเดอร์ที่ส่งแล้ววันนี้' : 'View today completed orders archive'}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">{kdsLang === 'th' ? 'ประวัติ' : 'Archive'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[11px] font-black border border-emerald-600/60">
              {completedTodayOrders.length + completedTableReservations.length}
            </span>
          </button>

          {/* Screen Wake Lock Status Badge */}
          <button
            onClick={() => requestScreenWakeLock().then(ok => setWakeLockActive(ok))}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
              wakeLockActive 
                ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300' 
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
            }`}
            title={wakeLockActive ? 'Screen stay-awake ON' : 'Tap to keep screen awake'}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${wakeLockActive ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'}`} />
            <span className="hidden lg:inline">{t.screenOn}</span>
          </button>

          {/* Sound Alarm Toggle */}
          <button
            onClick={() => {
              if (soundMuted) {
                setSoundMuted(false);
                testKitchenAlarm();
              } else {
                setSoundMuted(true);
                stopContinuousAlarm();
                stopDispatchReminderAlarm();
              }
            }}
            className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
              soundMuted 
                ? 'bg-red-950 border-red-700 text-red-300' 
                : 'bg-stone-800 border-stone-700 text-emerald-400 hover:bg-stone-700'
            }`}
            title={soundMuted ? 'Unmute buzzer' : 'Mute buzzer'}
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen kiosk'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ─── MAIN 2-PHASE KITCHEN BOARD (50% / 50% SPLIT) ────────────────── */}
      <main className="flex-1 p-2 sm:p-3 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* ─── PHASE 1: IN KITCHEN (TO PREPARE & COOK) ────────────────────── */}
        <section className={`flex flex-col bg-[#11141c] border-2 rounded-2xl overflow-hidden ${
          unacknowledgedNewOrders.length > 0 ? 'border-red-600 shadow-xl shadow-red-950/40' : 'border-stone-800'
        } ${selectedMobileTab !== 'kitchen' ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Column Header */}
          <div className="bg-[#181d28] px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-black text-sm lg:text-base uppercase tracking-wider text-red-400 flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full ${unacknowledgedNewOrders.length > 0 || unacknowledgedTableReservations.length > 0 ? 'bg-red-500 animate-ping' : 'bg-amber-500'}`} />
                <span>{t.col1Title}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-mono">
                  {kitchenOrders.length + pendingTableReservations.length}
                </span>
              </h2>

              {/* TEST SUONERIA 1 (NEW ORDERS LOUD ALARM) */}
              <button
                type="button"
                onClick={toggleTestNewOrderAlarm}
                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  testingNewOrderAlarm
                    ? 'bg-red-600 text-white border border-red-400 animate-pulse shadow-red-600/50'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 hover:text-white active:scale-95'
                }`}
                title={testingNewOrderAlarm ? 'Stop test' : 'Test suoneria nuovi ordini (continua fino al prossimo click)'}
              >
                {testingNewOrderAlarm ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-white" />
                    <span>{t.stopTestBtn} ⏹</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-red-400" />
                    <span>{t.testAlarmBtn}</span>
                  </>
                )}
              </button>
            </div>

            {unacknowledgedNewOrders.length > 0 && (
              <span className="text-[11px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full uppercase animate-pulse shadow">
                🔔 RINGING
              </span>
            )}
          </div>

          {/* Orders Scrollable Container */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {kitchenOrders.length === 0 && pendingTableReservations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500">
                <CheckCircle className="w-16 h-16 text-stone-700 mb-3" />
                <p className="font-black text-base uppercase text-stone-400">{t.noKitchenOrders}</p>
                <p className="text-xs text-stone-600 mt-1 max-w-sm">{t.noKitchenSub}</p>
              </div>
            ) : (
              <>
                {/* 1. Pending Table Reservations Cards */}
                {pendingTableReservations.map(res => {
                  const cleanPhone = res.contact.replace(/[^0-9]/g, '');
                  const whatsappText = kdsLang === 'th'
                    ? `สวัสดีคุณ ${res.customer_name} ร้าน ฟลาวเวอร์ พาวเวอร์ พิซซ่า ยืนยันการจองโต๊ะสำหรับ ${res.guests} ท่าน วันที่ ${res.reservation_date} เวลา ${res.reservation_time} เจอกันครับ/ค่ะ!`
                    : `Hello ${res.customer_name}, we confirm your table reservation at Flower Power Pizza for ${res.guests} guests on ${res.reservation_date} at ${res.reservation_time}. See you soon!`;
                  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '66' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(whatsappText)}`;

                  return (
                    <div 
                      key={res.id}
                      className="bg-gradient-to-br from-[#064e3b] via-[#053d2e] to-[#042d22] border-2 border-emerald-400 rounded-2xl p-4 shadow-xl shadow-emerald-950/60 flex flex-col gap-3 transition-all animate-pulse hover:animate-none"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-emerald-600/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-400 text-stone-950 flex items-center justify-center font-black shadow-sm">
                            <UtensilsCrossed className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-white text-base">
                                #{res.id}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-400 text-stone-950 shadow-xs">
                                {kdsLang === 'th' ? 'จองโต๊ะใหม่' : 'NEW RESERVATION'}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-200">
                              {kdsLang === 'th' ? 'ทานที่ร้าน' : 'Dine-In Table'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="font-mono text-emerald-300 text-xs font-black block">
                            📅 {res.reservation_date}
                          </span>
                          <span className="font-mono text-white text-sm font-black bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/60 inline-block mt-0.5">
                            🕒 {res.reservation_time}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="bg-black/35 rounded-xl p-3 border border-emerald-600/40 text-xs space-y-2">
                        <div className="flex items-center justify-between font-black text-white text-sm">
                          <span>👤 {res.customer_name}</span>
                          <span className="text-amber-300 font-bold bg-stone-900/90 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                            👥 {res.guests} {kdsLang === 'th' ? 'ท่าน' : 'Guests'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-300 text-[11px] font-medium">{kdsLang === 'th' ? 'โซนที่นั่ง:' : 'Seating Area:'}</span>
                            <span className="font-bold text-white px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/60 text-xs">
                              {res.seating_area === 'hut' 
                                ? (kdsLang === 'th' ? '🛖 กระท่อมไม้ไผ่' : '🛖 Bamboo Hut') 
                                : res.seating_area === 'indoor' 
                                  ? (kdsLang === 'th' ? '🏠 ห้องแอร์' : '🏠 Indoor Room') 
                                  : res.seating_area === 'outdoor' 
                                    ? (kdsLang === 'th' ? '🌿 โซนสวน' : '🌿 Outdoor Garden') 
                                    : (kdsLang === 'th' ? '🎲 ไม่ระบุ' : '🎲 Any Area')}
                            </span>
                          </div>
                          <span className="text-stone-300 font-mono text-[11px]">
                            📞 {res.contact}
                          </span>
                        </div>

                        {res.email && (
                          <div className="text-[11px] text-stone-300 font-mono flex items-center gap-1 truncate pt-0.5">
                            <span>✉️</span>
                            <span className="truncate text-emerald-300">{res.email}</span>
                          </div>
                        )}

                        {res.notes && (
                          <div className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs font-semibold mt-1">
                            <span>📝 {res.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Accept/Archive, Reject, Delete & WhatsApp */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleArchiveTableReservation(res.id)}
                          className="flex-1 py-3 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/50 cursor-pointer transition-all active:scale-95"
                        >
                          <CheckCircle className="w-5 h-5 stroke-[2.5] shrink-0" />
                          <span>{kdsLang === 'th' ? '✓ รับ & บันทึกประวัติ' : '✓ CONFIRM & ARCHIVE'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectTableReservation(res.id)}
                          className="py-3 px-3.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 hover:text-white border border-red-700/80 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shrink-0"
                          title={kdsLang === 'th' ? 'ปฏิเสธการจองโต๊ะ' : 'Reject Table Reservation'}
                        >
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{t.rejectResBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleForceDeleteOrder(res.id)}
                          className="p-3 rounded-xl bg-stone-900 hover:bg-red-950 text-stone-500 hover:text-red-400 border border-stone-800 hover:border-red-800 flex items-center justify-center transition-all cursor-pointer shadow shrink-0"
                          title={kdsLang === 'th' ? 'ลบข้อมูลการจองนี้ออกถาวร' : 'Delete reservation permanently'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {cleanPhone && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-all cursor-pointer shadow shrink-0"
                            title="WhatsApp"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 2. Pizza Delivery & Pickup Orders */}
                {kitchenOrders.map(order => {
                const elapsed = getElapsedMinutes(order.created_at);
                const items = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
                const { address, addressTh, notes, lat, lng } = parseCoordsFromAddress(order.address);
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';
                const tableStationDisplay = formatTableStationName(extractTableFromAddress(order.address) || order.table_number || 'Tavolo', kdsLang === 'th' ? 'TH' : 'EN');

                return (
                  <div 
                    key={order.id}
                    className="bg-[#171c26] border-2 border-red-500 rounded-2xl p-3.5 shadow-xl shadow-red-950/40 flex flex-col gap-3 transition-all animate-pulse"
                  >
                    {/* Header: Order Number, Elapsed Time & Total */}
                    <div className="flex items-center justify-between border-b border-stone-700/80 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-2xl text-white tracking-wider font-mono">
                          #{orderNumber}
                        </span>
                        {isDiningTableOrder(order) && (
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-400 text-stone-950 uppercase tracking-wider flex items-center gap-1 font-mono shadow-sm">
                            <UtensilsCrossed className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{tableStationDisplay}</span>
                          </span>
                        )}
                        <span className="text-xs font-black px-2.5 py-1 rounded-md bg-red-600 text-white uppercase tracking-wider animate-bounce">
                          🚨 {t.newBadge} ({elapsed} {t.minAgo})
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-black text-xl text-emerald-400 font-mono">
                          {order.total} ฿
                        </span>
                        {order.payment_method?.includes('omise') ? (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600 uppercase tracking-wider mt-0.5">
                            ✅ {order.payment_method?.includes('card') ? '💳 CARD 3DS (PAID)' : '📱 PROMPTPAY (PAID)'}
                          </span>
                        ) : isDiningTableOrder(order) ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400 text-stone-950 uppercase tracking-wider mt-0.5 font-bold shadow-sm">
                            🏪 {kdsLang === 'th' ? 'ชำระที่แคชเชียร์' : kdsLang === 'mm' ? 'ငွေရှင်းကောင်တာတွင် ငွေရှင်းရန်' : 'CONTO ALLA CASSA'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-600 uppercase tracking-wider mt-0.5">
                            💵 {kdsLang === 'th' ? 'เงินสด (เก็บปลายทาง)' : 'CASH (COLLECT)'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer & Address (Clean text + Maps button, no phone dialer / no WhatsApp) */}
                    <div className="text-xs space-y-1 text-stone-300">
                      <div className="font-black text-white text-sm flex items-center justify-between">
                        <span>👤 {order.customer_name}</span>
                        <span className="px-2.5 py-1 bg-stone-800 text-amber-300 rounded-lg text-xs font-mono font-bold">
                          📞 {order.phone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="text-stone-300 text-xs flex items-center gap-1.5 truncate flex-1 font-medium">
                          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="truncate">{kdsLang === 'th' ? addressTh : address}</span>
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-800 text-blue-300 hover:text-white border border-blue-600/40 text-[11px] font-black flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          title="Open Maps"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t.mapBtn}</span>
                        </a>
                      </div>
                      {notes && (
                        <div className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-start gap-1.5 mt-1">
                          <span className="shrink-0 text-sm">📝</span>
                          <span className="break-words leading-tight">{notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Giant Items List */}
                    <div className="bg-[#0b0e14] p-3 rounded-xl border border-stone-800 space-y-3">
                      {items.map((item, idx) => {
                        const displayName = getDishDisplayName(item, kdsLang);
                        const subName = kdsLang === 'th' ? getDishDisplayName(item, 'en') : getDishDisplayName(item, 'th');
                        const variant = getVariantDisplayName(item.selectedVariant, kdsLang);
                        const extras = Array.isArray(item.selectedExtras) ? item.selectedExtras : [];

                        return (
                          <div key={idx} className="border-b border-stone-800/80 last:border-0 pb-2.5 last:pb-0">
                            <div className="flex items-baseline gap-2.5">
                              <span className="font-black text-xl lg:text-2xl text-amber-400 font-mono shrink-0">
                                {item.quantity}x
                              </span>
                              <div className="flex-1">
                                <span className="font-black text-base lg:text-lg text-white leading-tight block">
                                  {displayName}
                                </span>
                                {subName && subName !== displayName && (
                                  <span className="text-xs font-semibold text-stone-400 block mt-0.5">
                                    {subName}
                                  </span>
                                )}
                                {variant && (
                                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wide block mt-0.5">
                                    {t.sizeLabel}: {variant}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Extra ingredients translated universally */}
                            {extras.length > 0 && (
                              <div className="mt-1.5 pl-7 flex flex-wrap gap-1">
                                {extras.map((ex: any, exIdx: number) => {
                                  const exName = getExtraDisplayName(ex, kdsLang);
                                  return (
                                    <span 
                                      key={exIdx}
                                      className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-xs uppercase"
                                    >
                                      + {exName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* NEW ORDER ACTIONS: ACCEPT OR MUTE */}
                    <div className="pt-1 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptOrder(order.id, prepTimeCustom[order.id] || 30)}
                          className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
                        >
                          <CheckCircle className="w-5 h-5 text-white stroke-[3]" />
                          <span>{t.acceptBtn} ({prepTimeCustom[order.id] || 30} {t.min})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            stopContinuousAlarm();
                            setAcknowledgedOrderIds(prev => new Set(prev).add(String(order.id)));
                          }}
                          className="px-4 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-white font-black text-xs uppercase tracking-wider border border-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-transform"
                          title={t.muteBtn}
                        >
                          <BellOff className="w-4 h-4 text-red-400" />
                          <span>{t.muteBtn}</span>
                        </button>
                      </div>

                      {/* Fast prep time selector + Cancel */}
                      <div className="flex items-center gap-1.5">
                        {[20, 30, 45].map(min => (
                          <button
                            key={min}
                            type="button"
                            onClick={() => setPrepTimeCustom(prev => ({ ...prev, [order.id]: min }))}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-colors cursor-pointer ${
                              (prepTimeCustom[order.id] || 30) === min 
                                ? 'bg-amber-400 text-stone-950' 
                                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
                            }`}
                          >
                            {min} {t.min}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleOrderCancelled(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-red-950 text-stone-400 hover:text-red-400 text-xs font-bold border border-stone-700 cursor-pointer transition-colors"
                          title={kdsLang === 'th' ? 'ยกเลิกออเดอร์นี้' : 'Annulla / Rifiuta comanda'}
                        >
                          {t.cancelBtn}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleForceDeleteOrder(order.id)}
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-red-950 text-stone-500 hover:text-red-400 border border-stone-800 hover:border-red-800 cursor-pointer transition-colors"
                          title={kdsLang === 'th' ? 'ลบออเดอร์นี้ออกถาวร' : 'Elimina definitivamente dal sistema'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </>
          )}
        </div>
        </section>

        {/* ─── PHASE 2: READY FOR RIDER & DELIVERING ──────────────────────── */}
        <section className={`flex flex-col bg-[#11141c] border-2 border-stone-800 rounded-2xl overflow-hidden ${
          selectedMobileTab !== 'ready' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Column Header */}
          <div className="bg-[#181d28] px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-black text-sm lg:text-base uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Bike className="w-4 h-4 text-blue-500" />
                <span>{t.col2Title}</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-mono">
                  {readyOrders.length}
                </span>
              </h2>

              {/* TEST SUONERIA 2 (15-MIN DISPATCH REMINDER) */}
              <button
                type="button"
                onClick={toggleTestReminderAlarm}
                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  testingReminderAlarm
                    ? 'bg-amber-500 text-stone-950 border border-amber-300 animate-pulse shadow-amber-500/50 font-black'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 hover:text-white active:scale-95'
                }`}
                title={testingReminderAlarm ? 'Stop test' : 'Test suoneria promemoria rider 15 min (continua fino al prossimo click)'}
              >
                {testingReminderAlarm ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-stone-950" />
                    <span>{t.stopTestBtn} ⏹</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.testChimeBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Orders Scrollable Container */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500">
                <Bike className="w-16 h-16 text-stone-700 mb-3" />
                <p className="font-black text-base uppercase text-stone-400">{t.noReadyOrders}</p>
                <p className="text-xs text-stone-600 mt-1 max-w-sm">{t.noReadySub}</p>
              </div>
            ) : (
              readyOrders.map(order => {
                const elapsed = getElapsedMinutes(order.created_at);
                const elapsedPrep = getElapsedPrepMinutes(order);
                const isOverdue = order.status === 'preparing' && elapsedPrep >= 15;
                const snoozedUntil = reminderSnoozedUntil[String(order.id)] || 0;
                const isSnoozed = isOverdue && Date.now() < snoozedUntil;
                const snoozeRemainingMin = isSnoozed ? Math.max(1, Math.ceil((snoozedUntil - Date.now()) / 60000)) : 0;
                const items = (Array.isArray(order.items) ? order.items : []) as CartItemSaved[];
                const { address, addressTh, notes, lat, lng } = parseCoordsFromAddress(order.address);
                const orderNumber = order.id ? String(order.id).slice(-4).toUpperCase() : '----';
                const isDelivering = order.status === 'delivering';

                return (
                  <div 
                    key={order.id}
                    className={`bg-[#171c26] border-2 rounded-2xl p-3.5 shadow-lg flex flex-col gap-3 transition-all ${
                      isDelivering 
                        ? 'border-blue-500/80 shadow-blue-950/40' 
                        : isOverdue 
                          ? isSnoozed
                            ? 'border-amber-500/50 shadow-amber-950/30'
                            : 'border-amber-400 border-dashed shadow-amber-500/30 ring-2 ring-amber-400/30' 
                          : 'border-amber-500/80 shadow-amber-950/30'
                    }`}
                  >
                    {/* Header: Order Number, Status Badge & Total */}
                    <div className="flex items-center justify-between border-b border-stone-700/80 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-2xl text-white tracking-wider font-mono">
                          #{orderNumber}
                        </span>
                        {isDiningTableOrder(order) && (
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-400 text-stone-950 uppercase tracking-wider flex items-center gap-1 font-mono shadow-sm">
                            <UtensilsCrossed className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{formatTableStationName(extractTableFromAddress(order.address) || order.table_number || 'Tavolo', kdsLang === 'th' ? 'TH' : 'EN')}</span>
                          </span>
                        )}
                        {isDelivering ? (
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-600 text-white uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                            <Bike className="w-3.5 h-3.5" />
                            <span>{kdsLang === 'th' ? 'ไรเดอร์กำลังไปส่ง' : 'DELIVERING'}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-500 text-stone-950 uppercase tracking-wider flex items-center gap-1 font-black">
                            <Flame className="w-3.5 h-3.5 text-stone-950" />
                            <span>{t.cookingFor} {elapsed} {t.min}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-black text-xl text-emerald-400 font-mono">
                          {order.total} ฿
                        </span>
                        {order.payment_method?.includes('omise') ? (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600 uppercase tracking-wider mt-0.5">
                            ✅ {order.payment_method?.includes('card') ? '💳 CARD 3DS (PAID)' : '📱 PROMPTPAY (PAID)'}
                          </span>
                        ) : isDiningTableOrder(order) ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400 text-stone-950 uppercase tracking-wider mt-0.5 font-bold shadow-sm">
                            🏪 {kdsLang === 'th' ? 'ชำระที่แคชเชียร์' : kdsLang === 'mm' ? 'ငွေရှင်းကောင်တာတွင် ငွေရှင်းရန်' : 'CONTO ALLA CASSA'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-600 uppercase tracking-wider mt-0.5">
                            💵 {kdsLang === 'th' ? 'เงินสด (เก็บปลายทาง)' : 'CASH (COLLECT)'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 15+ Minutes Dispatch Alert Banner with Posticipa 10 minuti button */}
                    {isOverdue && !isDelivering && (
                      <div className={`border-2 px-3 py-2 rounded-xl flex items-center justify-between text-xs font-black transition-all ${
                        isSnoozed
                          ? 'bg-stone-900/90 border-stone-700 text-stone-300'
                          : 'bg-amber-500/20 border-amber-400/90 text-amber-200 animate-pulse'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 shrink-0 stroke-[2.5] ${isSnoozed ? 'text-stone-400' : 'text-amber-400'}`} />
                          <span>
                            {isSnoozed 
                              ? `⏳ ${t.snoozedBadge} (${snoozeRemainingMin} ${t.min})` 
                              : `${t.dispatchReminderBadge} (${elapsedPrep} ${t.min})`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSnoozeReminder(order.id, 10)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black uppercase transition-all shadow cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
                          title="Posticipa la suoneria promemoria di 10 minuti"
                        >
                          <Clock className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                          <span>{t.snoozeReminderBtn}</span>
                        </button>
                      </div>
                    )}

                    {/* Customer & Address + Open Maps Button (NO TEL/NO WHATSAPP) */}
                    <div className="text-xs space-y-1.5 text-stone-300">
                      <div className="font-black text-white text-sm flex items-center justify-between">
                        <span>👤 {order.customer_name}</span>
                        <span className="px-2.5 py-1 bg-stone-800 text-amber-300 rounded-lg text-xs font-mono font-bold">
                          📞 {order.phone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="text-stone-300 text-xs flex items-center gap-1.5 truncate flex-1 font-medium">
                          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="truncate">{kdsLang === 'th' ? addressTh : address}</span>
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shrink-0 transition-transform shadow-md cursor-pointer"
                          title="Open Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t.mapBtn}</span>
                        </a>
                      </div>
                      {notes && (
                        <div className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-start gap-1.5 mt-1">
                          <span className="shrink-0 text-sm">📝</span>
                          <span className="break-words leading-tight">{notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Full Ordered Items List with Universal Translated Extras */}
                    <div className="bg-[#0b0e14] p-3 rounded-xl border border-stone-800 space-y-3">
                      {items.map((item, idx) => {
                        const displayName = getDishDisplayName(item, kdsLang);
                        const subName = kdsLang === 'th' ? getDishDisplayName(item, 'en') : getDishDisplayName(item, 'th');
                        const variant = getVariantDisplayName(item.selectedVariant, kdsLang);
                        const extras = Array.isArray(item.selectedExtras) ? item.selectedExtras : [];

                        return (
                          <div key={idx} className="border-b border-stone-800/80 last:border-0 pb-2.5 last:pb-0">
                            <div className="flex items-baseline gap-2.5">
                              <span className="font-black text-xl lg:text-2xl text-amber-400 font-mono shrink-0">
                                {item.quantity}x
                              </span>
                              <div className="flex-1">
                                <span className="font-black text-base lg:text-lg text-white leading-tight block">
                                  {displayName}
                                </span>
                                {subName && subName !== displayName && (
                                  <span className="text-xs font-semibold text-stone-400 block mt-0.5">
                                    {subName}
                                  </span>
                                )}
                                {variant && (
                                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wide block mt-0.5">
                                    {t.sizeLabel}: {variant}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Extra ingredients translated universally */}
                            {extras.length > 0 && (
                              <div className="mt-1.5 pl-7 flex flex-wrap gap-1">
                                {extras.map((ex: any, exIdx: number) => {
                                  const exName = getExtraDisplayName(ex, kdsLang);
                                  return (
                                    <span 
                                      key={exIdx}
                                      className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-xs uppercase"
                                    >
                                      + {exName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons for Phase 2 */}
                    {!isDelivering ? (
                      /* Status is 'preparing' */
                      <div className="pt-1 flex flex-col gap-2">
                        {isDiningTableOrder(order) ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleCompleteTableOrder(order.id)}
                              className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider border border-emerald-400 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-5 h-5 text-white stroke-[2.5]" />
                              <span>{t.orderPaidBtn}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOrderCancelled(order.id)}
                              className="px-3.5 py-3.5 rounded-2xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 font-bold text-xs uppercase border border-stone-700 transition-colors cursor-pointer"
                            >
                              {t.cancelBtn}
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOrderReady(order.id)}
                              className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform ${
                                isOverdue 
                                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 hover:from-amber-400 hover:to-blue-500 text-white animate-pulse shadow-amber-500/30' 
                                  : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                              }`}
                            >
                              <Bike className="w-5 h-5 text-white" />
                              <span>{t.dispatchRiderBtn} {isOverdue ? `(15+ ${t.min})` : ''}</span>
                            </button>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleOrderCompleted(order.id)}
                                className="flex-1 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 active:scale-95 text-emerald-100 hover:text-white font-bold text-xs uppercase tracking-wider border border-emerald-600 transition-colors cursor-pointer"
                              >
                                {t.directArchiveBtn}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOrderCancelled(order.id)}
                                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 font-bold text-xs uppercase border border-stone-700 transition-colors cursor-pointer"
                              >
                                {t.cancelBtn}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Status is 'delivering': Delivered & Archived */
                      <div className="pt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOrderCompleted(order.id)}
                          className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider border border-emerald-500 shadow-lg cursor-pointer transition-transform flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5 text-white stroke-[2.5]" />
                          <span>{t.deliveredBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOrderCancelled(order.id)}
                          className="px-3 py-3.5 rounded-xl bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 font-bold text-xs uppercase border border-stone-700 transition-colors cursor-pointer"
                        >
                          {t.cancelBtn}
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>

      {/* ─── BOTTOM INTERACTIVE DOCK: ACTIVE DINING TABLES & MINIMIZED ORDERS ───────── */}
      {activeDiningOrders.length > 0 && (
        <div className="bg-[#131722] border-t-2 border-stone-800 px-3 sm:px-5 py-2.5 shrink-0 flex items-center gap-3 overflow-x-auto select-none shadow-2xl z-30">
          <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs uppercase tracking-wider shrink-0 pr-3 border-r border-stone-800">
            <UtensilsCrossed className="w-4 h-4" />
            <span>{kdsLang === 'th' ? 'ออเดอร์ในครัว & โต๊ะ:' : 'KITCHEN ORDERS & TABLES:'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-mono font-bold">
              {activeDiningOrders.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-x-auto py-0.5">
            {activeDiningOrders.map(order => {
              const tableRaw = extractTableFromAddress(order.address) || order.table_number || 'Tavolo';
              const tableDisplay = formatTableStationName(tableRaw, kdsLang === 'th' ? 'TH' : 'EN');
              const itemsCount = Array.isArray(order.items) 
                ? order.items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) 
                : 0;
              const isMinimized = minimizedTableOrderIds.has(String(order.id));
              const isPreparing = order.status === 'preparing';
              const elapsedPrep = getElapsedPrepMinutes(order);
              const isOverdue = order.status === 'preparing' && elapsedPrep >= 15;
              const snoozedUntil = reminderSnoozedUntil[String(order.id)] || 0;
              const isRinging = isOverdue && Date.now() >= snoozedUntil;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedTrayOrder(order)}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 shrink-0 transition-all cursor-pointer active:scale-95 ${
                    isRinging
                      ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-xl shadow-amber-500/60 animate-bounce ring-4 ring-amber-400 font-black'
                      : isMinimized
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-950/40 animate-pulse hover:bg-amber-500/30'
                        : isPreparing 
                          ? 'bg-blue-950/50 border-blue-500/70 text-blue-200 shadow-sm hover:bg-blue-900/50' 
                          : 'bg-[#0d1017] border-stone-800 text-stone-300 hover:border-stone-600'
                  }`}
                  title={kdsLang === 'th' ? 'แตะเพื่อเปิดดูรายการและกดส่ง' : 'Tap to view order details and dispatch'}
                >
                  <UtensilsCrossed className={`w-3.5 h-3.5 ${isRinging ? 'text-stone-950 stroke-[3]' : isMinimized ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span className={`font-black text-xs sm:text-sm uppercase tracking-tight ${isRinging ? 'text-stone-950' : 'text-white'}`}>{tableDisplay}</span>
                  {isRinging && (
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block shrink-0 animate-ping" />
                  )}
                  <span className={`text-[11px] font-mono font-bold ${isRinging ? 'text-stone-950' : 'text-amber-300'}`}>
                    {order.total} ฿
                  </span>
                  <span className={`text-[11px] font-mono ${isRinging ? 'text-stone-800' : 'text-stone-400'}`}>
                    ({itemsCount} {kdsLang === 'th' ? 'จาน' : 'items'})
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    isRinging
                      ? 'bg-stone-950 text-amber-300 font-black animate-pulse'
                      : isMinimized
                        ? 'bg-amber-400 text-stone-950 font-black'
                        : isPreparing 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                  }`}>
                    {isRinging
                      ? (kdsLang === 'th' ? '⏰ เตือน 15 น.!' : '⏰ 15+ MIN ALARM!')
                      : isMinimized 
                        ? (kdsLang === 'th' ? 'รอส่ง' : 'IN KITCHEN') 
                        : isPreparing 
                          ? (kdsLang === 'th' ? 'กำลังเสิร์ฟ' : 'IN DINING ROOM') 
                          : (kdsLang === 'th' ? 'เปิดบิล' : 'OPEN BILL')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── DINING TABLE ORDER PREVIEW & EVADI MODAL ───────────────────────── */}
      {selectedTrayOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#161b26] border-2 border-stone-700 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh] space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-white uppercase leading-none">
                      {formatTableStationName(extractTableFromAddress(selectedTrayOrder.address) || selectedTrayOrder.table_number || 'Tavolo', kdsLang === 'th' ? 'TH' : 'EN')}
                    </h3>
                    <span className="font-mono text-xs font-bold text-stone-400">
                      #{String(selectedTrayOrder.id).slice(-4).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 block mt-0.5">
                    {selectedTrayOrder.customer_name || (kdsLang === 'th' ? 'ลูกค้า' : 'Guest')} {selectedTrayOrder.phone ? `(${selectedTrayOrder.phone})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-black text-xl text-emerald-400 font-mono block leading-none">
                    {selectedTrayOrder.total} ฿
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-400">
                    {kdsLang === 'th' ? 'ชำระที่แคชเชียร์' : kdsLang === 'mm' ? 'ငွေရှင်းကောင်တာတွင် ငွေရှင်းရန်' : 'CONTO ALLA CASSA'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTrayOrder(null)}
                  className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 15+ Minutes Dispatch / Close Order Alert Banner inside Tray Modal */}
            {(() => {
              const trayElapsedPrep = getElapsedPrepMinutes(selectedTrayOrder);
              const isTrayOverdue = selectedTrayOrder.status === 'preparing' && trayElapsedPrep >= 15;
              const traySnoozedUntil = reminderSnoozedUntil[String(selectedTrayOrder.id)] || 0;
              const isTraySnoozed = isTrayOverdue && Date.now() < traySnoozedUntil;
              const traySnoozeRemaining = isTraySnoozed ? Math.max(1, Math.ceil((traySnoozedUntil - Date.now()) / 60000)) : 0;

              if (!isTrayOverdue) return null;

              return (
                <div className={`border-2 px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs font-black transition-all shrink-0 ${
                  isTraySnoozed
                    ? 'bg-stone-900/90 border-stone-700 text-stone-300'
                    : 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 animate-pulse'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 shrink-0 stroke-[2.5] ${isTraySnoozed ? 'text-stone-400' : 'text-amber-400'}`} />
                    <span>
                      {isTraySnoozed 
                        ? `⏳ ${t.snoozedBadge} (${traySnoozeRemaining} ${t.min})` 
                        : `${t.dispatchReminderBadge} (${trayElapsedPrep} ${t.min})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSnoozeReminder(selectedTrayOrder.id, 10)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 text-xs font-black uppercase transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Posticipa la suoneria promemoria di 10 minuti"
                  >
                    <Clock className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                    <span>{t.snoozeReminderBtn}</span>
                  </button>
                </div>
              );
            })()}

            {/* Dishes / Ordered Items List */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              <div className="bg-[#0b0e14] p-3 rounded-2xl border border-stone-800 space-y-3">
                {((Array.isArray(selectedTrayOrder.items) ? selectedTrayOrder.items : []) as CartItemSaved[]).map((item, idx) => {
                  const displayName = getDishDisplayName(item, kdsLang);
                  const subName = kdsLang === 'th' ? getDishDisplayName(item, 'en') : getDishDisplayName(item, 'th');
                  const variant = getVariantDisplayName(item.selectedVariant, kdsLang);
                  const extras = Array.isArray(item.selectedExtras) ? item.selectedExtras : [];

                  return (
                    <div key={idx} className="border-b border-stone-800/80 last:border-0 pb-2.5 last:pb-0">
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-black text-xl text-amber-400 font-mono shrink-0">
                          {item.quantity}x
                        </span>
                        <div className="flex-1">
                          <span className="font-black text-base text-white leading-tight block">
                            {displayName}
                          </span>
                          {subName && subName !== displayName && (
                            <span className="text-xs font-semibold text-stone-400 block mt-0.5">
                              {subName}
                            </span>
                          )}
                          {variant && (
                            <span className="text-xs font-bold text-stone-300 uppercase tracking-wide block mt-0.5">
                              {t.sizeLabel}: {variant}
                            </span>
                          )}
                        </div>
                      </div>

                      {extras.length > 0 && (
                        <div className="mt-1.5 pl-6 flex flex-wrap gap-1">
                          {extras.map((ex: any, exIdx: number) => (
                            <span 
                              key={exIdx}
                              className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-xs uppercase"
                            >
                              + {getExtraDisplayName(ex, kdsLang)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedTrayOrder.address && parseCoordsFromAddress(selectedTrayOrder.address).notes && (
                <div className="px-3 py-2 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs font-semibold">
                  📝 {parseCoordsFromAddress(selectedTrayOrder.address).notes}
                </div>
              )}

              {/* Live Listening Notice for Extra Orders from Dining Tablet */}
              <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>{t.openTableNotice}</span>
              </div>
            </div>

            {/* Action Buttons: READY FOR SETTLEMENT or Direct Pay */}
            <div className="pt-2 border-t border-stone-800 flex items-center gap-2 shrink-0">
              {minimizedTableOrderIds.has(String(selectedTrayOrder.id)) ? (
                <button
                  type="button"
                  onClick={() => handleDispatchTableOrder(String(selectedTrayOrder.id))}
                  className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
                >
                  <CheckCircle className="w-5 h-5 text-stone-950 stroke-[2.5]" />
                  <span>{t.readyForSettlementBtn}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCompleteTableOrder(selectedTrayOrder.id)}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
                >
                  <CheckCircle className="w-5 h-5 text-white stroke-[2.5]" />
                  <span>{t.orderPaidBtn}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedTrayOrder(null)}
                className="px-4 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-black text-xs uppercase cursor-pointer transition-colors shrink-0"
              >
                {kdsLang === 'th' ? 'ปิด' : 'CLOSE'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── PAUSE & SERVICE MANAGEMENT MODAL ────────────────────────────── */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b26] border-2 border-stone-700 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-6 h-6 text-amber-400" />
                <h3 className="font-black text-lg text-white uppercase">
                  {kdsLang === 'th' ? 'จัดการบริการเดลิเวอรี่' : 'MANAGE DELIVERY SERVICE'}
                </h3>
              </div>
              <button
                onClick={() => setShowPauseModal(false)}
                className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current State Info */}
            <div className="p-3.5 rounded-2xl bg-[#0d1017] border border-stone-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-bold">
                  {kdsLang === 'th' ? 'สถานะปัจจุบัน:' : 'Current Status:'}
                </span>
                <span className={`font-black uppercase px-2.5 py-1 rounded-md text-xs ${
                  serviceCalc.state === 'OPEN' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' 
                    : serviceCalc.state === 'PAUSED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                      : 'bg-stone-800 text-stone-300 border border-stone-700'
                }`}>
                  {serviceCalc.state === 'OPEN' ? t.serviceOpen : serviceCalc.state === 'PAUSED' ? t.servicePaused : t.serviceClosed}
                </span>
              </div>

              {serviceCalc.state === 'PAUSED' && serviceCalc.remainingMinutes > 0 && (
                <div className="flex justify-between items-center pt-1 text-amber-400 font-bold border-t border-stone-800/80">
                  <span>{kdsLang === 'th' ? 'จะเปิดรับในอีก:' : 'Reopening In:'}</span>
                  <span>{serviceCalc.remainingMinutes} {t.min} ({serviceCalc.reopenTimeFormatted})</span>
                </div>
              )}

              {serviceCalc.state === 'CLOSED_OFF_HOURS' && (
                <div className="flex justify-between items-center pt-1 text-stone-300 font-bold border-t border-stone-800/80">
                  <span>{kdsLang === 'th' ? 'เวลาเปิดตามรอบ:' : 'Regular Opening:'}</span>
                  <span>{serviceStatus.openingHours.openTime} - {serviceStatus.openingHours.closeTime}</span>
                </div>
              )}
            </div>

            {/* Quick Action: REOPEN NOW OR OPEN EARLY */}
            {serviceCalc.state === 'PAUSED' && (
              <button
                type="button"
                onClick={handleResumeService}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                <PlayCircle className="w-5 h-5 text-white stroke-[2.5]" />
                <span>{kdsLang === 'th' ? 'เปิดรับออเดอร์ทันที' : 'REOPEN ONLINE ORDERS NOW'}</span>
              </button>
            )}

            {serviceCalc.state === 'CLOSED_OFF_HOURS' && (
              <button
                type="button"
                onClick={handleForceOpenNow}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                <PlayCircle className="w-4 h-4 text-white stroke-[2.5]" />
                <span>{t.openNowEarly}</span>
              </button>
            )}

            {/* SECTION 1: PAUSE BUTTONS (30 MIN, 60 MIN & CUSTOM TIME) */}
            <div className="space-y-2 pt-1 border-t border-stone-800">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                {kdsLang === 'th' ? '⏸️ พักรับออเดอร์ชั่วคราว:' : '⏸️ TEMPORARY PAUSE:'}
              </span>

              {/* 30 Min and 60 Min */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPause(30)}
                  className="py-3 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-black text-xs uppercase border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <span>⏸️ 30 {t.min}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPause(60)}
                  className="py-3 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-black text-xs uppercase border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <span>⏸️ 60 {t.min}</span>
                </button>
              </div>

              {/* Custom Pause Duration Input */}
              <div className="pt-1 space-y-1">
                <label className="text-[11px] font-bold text-stone-400 block">
                  {t.customPauseLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    value={customPauseMinutes}
                    onChange={(e) => setCustomPauseMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                    className="w-24 px-3 py-2 bg-[#090b0e] border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPause(customPauseMinutes)}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow"
                  >
                    {t.applyCustomPause} ({customPauseMinutes} {t.min})
                  </button>
                </div>
              </div>

              {/* Stop For Tonight Button */}
              <button
                type="button"
                onClick={handleStopTonight}
                className="w-full py-2.5 rounded-xl bg-red-950/70 hover:bg-red-800 text-red-200 font-black text-xs uppercase border border-red-700/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors mt-2"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>{kdsLang === 'th' ? 'ปิดรับออเดอร์สำหรับคืนนี้' : 'STOP ORDERS FOR TONIGHT'}</span>
              </button>
            </div>

            {/* SECTION 2: OPENING & CLOSING HOURS CONFIGURATION */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-300 uppercase tracking-wider block">
                  🕒 {t.hoursTitle}
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>🇹🇭</span>
                  <span>Ranong (UTC+7)</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-400 block mb-1">
                    {t.openTimeLabel}
                  </label>
                  <input
                    type="time"
                    value={editOpenTime}
                    onChange={(e) => setEditOpenTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#090b0e] border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-400 block mb-1">
                    {t.closeTimeLabel}
                  </label>
                  <input
                    type="time"
                    value={editCloseTime}
                    onChange={(e) => setEditCloseTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#090b0e] border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveOpeningHours}
                className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow ${
                  hoursSavedSuccess 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:text-white'
                }`}
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>{hoursSavedSuccess ? t.hoursSaved : t.saveHoursBtn}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── COMPLETED ORDERS ARCHIVE TODAY MODAL ─────────────────────────── */}
      {showCompletedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#161b26] border-2 border-stone-700 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white uppercase leading-none">
                    {kdsLang === 'th' ? 'ประวัติออเดอร์ & จองโต๊ะที่บันทึกแล้ว' : 'TODAY COMPLETED ARCHIVE (ORDERS & TABLES)'}
                  </h3>
                  <span className="text-[11px] font-bold text-stone-400">
                    {completedTodayOrders.length + completedTableReservations.length} {kdsLang === 'th' ? 'รายการที่บันทึกใน 24 ชั่วโมงที่ผ่านมา' : 'items archived in the last 24 hours'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCompletedModal(false)}
                className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Orders & Reservations List */}
            <div className="overflow-y-auto flex-1 space-y-2.5 pr-1 min-h-[150px]">
              {completedTodayOrders.length === 0 && completedTableReservations.length === 0 ? (
                <div className="py-12 text-center text-stone-500 font-bold text-sm">
                  {kdsLang === 'th' ? 'ยังไม่มีรายการที่จัดส่งหรือบันทึกสำเร็จในวันนี้' : 'No orders or table reservations archived today.'}
                </div>
              ) : (
                <>
                  {/* Archived Table Reservations */}
                  {completedTableReservations.map((res) => (
                    <div
                      key={`arch-${res.id}`}
                      className="p-3.5 rounded-2xl bg-[#064e3b]/30 border border-emerald-700/60 text-xs space-y-2 hover:border-emerald-500 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-emerald-800/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono font-black text-xs border border-emerald-700/60">
                            #{res.id}
                          </span>
                          <span className="font-black text-white text-sm">
                            {res.customer_name}
                          </span>
                          <span className="text-stone-300 text-[11px] font-mono">
                            ({res.contact})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 text-xs font-bold">
                            📅 {res.reservation_date} · 🕒 {res.reservation_time}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500 text-stone-950">
                            ✓ {kdsLang === 'th' ? 'บันทึกแล้ว' : 'CONFIRMED'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-stone-300 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span>👥 {res.guests} {kdsLang === 'th' ? 'ท่าน' : 'Guests'}</span>
                          <span>•</span>
                          <span className="text-emerald-300 font-semibold">
                            {res.seating_area === 'hut' 
                              ? (kdsLang === 'th' ? '🛖 กระท่อมไม้ไผ่' : '🛖 Bamboo Hut') 
                              : res.seating_area === 'indoor' 
                                ? (kdsLang === 'th' ? '🏠 ห้องแอร์' : '🏠 Indoor Room') 
                                : res.seating_area === 'outdoor' 
                                  ? (kdsLang === 'th' ? '🌿 โซนสวน' : '🌿 Outdoor Garden') 
                                  : (kdsLang === 'th' ? '🎲 ไม่ระบุ' : '🎲 Any Area')}
                          </span>
                        </div>
                        {res.notes && <span className="italic text-stone-400">"{res.notes}"</span>}
                      </div>
                    </div>
                  ))}

                  {/* Archived Delivery Orders */}
                  {completedTodayOrders.map((order) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  const timeFormatted = order.created_at
                    ? new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })
                    : '--:--';

                  return (
                    <div 
                      key={order.id} 
                      className="p-3.5 rounded-2xl bg-[#0d1017] border border-stone-800 text-xs space-y-2 hover:border-stone-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-white font-mono font-black text-xs">
                            #{order.id}
                          </span>
                          <span className="font-black text-white text-sm">
                            {order.customer_name || (kdsLang === 'th' ? 'ลูกค้า' : 'Guest')}
                          </span>
                          {order.phone && (
                            <span className="text-stone-400 text-[11px] font-mono">
                              ({order.phone})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 text-xs font-bold">
                            🕒 {timeFormatted}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                            {order.total} ฿
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-stone-300">
                        {items.map((item: any, idx: number) => {
                          const displayName = getDishDisplayName(item, kdsLang);
                          const variant = getVariantDisplayName(item.selectedVariant, kdsLang);
                          const extras = Array.isArray(item.selectedExtras) ? item.selectedExtras : [];
                          return (
                            <div key={idx} className="flex justify-between items-baseline gap-2">
                              <div>
                                <strong className="text-white font-black">{item.quantity}x</strong> {displayName}
                                {variant && <span className="text-stone-400 text-[11px]"> ({variant})</span>}
                                {extras.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-0.5 pl-4">
                                    {extras.map((ex: any, exIdx: number) => (
                                      <span key={exIdx} className="text-amber-400/90 text-[10px]">
                                        + {getExtraDisplayName(ex, kdsLang)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="font-mono text-stone-400 text-[11px] shrink-0">
                                {item.itemTotal || item.total || ''} ฿
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Address & Restore Button */}
                      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-stone-400 truncate max-w-[280px] sm:max-w-md">
                          📍 {order.address || (kdsLang === 'th' ? 'รับที่ร้าน / ระนอง' : 'Pickup / Ranong')}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(kdsLang === 'th' ? `ต้องการนำออเดอร์ #${order.id} กลับมาในครัวหรือไม่?` : `Return order #${order.id} to kitchen screen?`)) {
                              await updateOrderStatus(String(order.id), 'preparing');
                              setShowCompletedModal(false);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-700 text-blue-300 hover:text-white font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                          title={kdsLang === 'th' ? 'นำออเดอร์กลับมาในครัว' : 'Return order to kitchen'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{kdsLang === 'th' ? 'นำกลับมาทำใหม่' : 'Return to kitchen'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-stone-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowCompletedModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-black text-xs uppercase cursor-pointer transition-colors"
              >
                {kdsLang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
