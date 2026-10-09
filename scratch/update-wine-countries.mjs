import fs from 'fs';
import path from 'path';

const wineDataPath = path.resolve('src/pizza/data/wineData.tsx');

const WINE_COUNTRY_OPTIONS_CODE = `export const WINE_COUNTRY_OPTIONS = [
  { flag: '🇮🇹', code: 'IT', label: 'Italia', names: { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', DE: 'ITALIEN', MM: 'အီတလီ', ES: 'ITALIA', FR: 'ITALIE', RU: 'ИТАЛИЯ', ZH: '意大利' } },
  { flag: '🇫🇷', code: 'FR', label: 'Francia', names: { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH', MM: 'ပြင်သစ်', ES: 'FRANCIA', FR: 'FRANCE', RU: 'ФРАНЦИЯ', ZH: '法国' } },
  { flag: '🇦🇺', code: 'AU', label: 'Australia', names: { IT: 'AUSTRALIA', EN: 'AUSTRALIA', TH: 'ออสเตรเลีย', DE: 'AUSTRALIEN', MM: 'သြစတြေးလျ', ES: 'AUSTRALIA', FR: 'AUSTRALIE', RU: 'АВСТРАЛИЯ', ZH: '澳大利亚' } },
  { flag: '🇨🇱', code: 'CL', label: 'Cile', names: { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', DE: 'CHILE', MM: 'ချီလီ', ES: 'CHILE', FR: 'CHILI', RU: 'ЧИЛИ', ZH: '智利' } },
  { flag: '🇪🇸', code: 'ES', label: 'Spagna', names: { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', DE: 'SPANIEN', MM: 'စပိန်', ES: 'ESPAÑA', FR: 'ESPAGNE', RU: 'ИСПАНИЯ', ZH: '西班牙' } },
  { flag: '🇿🇦', code: 'ZA', label: 'Sudafrica', names: { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', DE: 'SÜDAFRIKA', MM: 'တောင်အာဖရိက', ES: 'SUDÁFRICA', FR: 'AFRIQUE DU SUD', RU: 'ЮЖНАЯ АФРИКА', ZH: '南非' } },
  { flag: '🇩🇪', code: 'DE', label: 'Germania', names: { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', DE: 'DEUTSCHLAND', MM: 'ဂျာမနီ', ES: 'ALEMANIA', FR: 'ALLEMAGNE', RU: 'ГЕРМАНИЯ', ZH: '德国' } },
  { flag: '🇦🇷', code: 'AR', label: 'Argentina', names: { IT: 'ARGENTINA', EN: 'ARGENTINA', TH: 'อาร์เจนตินา', DE: 'ARGENTINIEN', MM: 'အာဂျင်တီးနား', ES: 'ARGENTINA', FR: 'ARGENTINE', RU: 'АРГЕНТИНА', ZH: '阿根廷' } },
  { flag: '🇺🇸', code: 'US', label: 'Stati Uniti', names: { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', DE: 'USA', MM: 'အမေရိကန်', ES: 'ESTADOS UNIDOS', FR: 'ÉTATS-UNIS', RU: 'США', ZH: '美国' } },
  { flag: '🇳🇿', code: 'NZ', label: 'Nuova Zelanda', names: { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', DE: 'NEUSEELAND', MM: 'နယူးဇီလန်', ES: 'NUEVA ZELANDA', FR: 'NOUVELLE-ZÉLANDE', RU: 'НОВАЯ ЗЕЛАНДИЯ', ZH: '新西兰' } },
  { flag: '🇵🇹', code: 'PT', label: 'Portogallo', names: { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', DE: 'PORTUGAL', MM: 'ပေါ်တူဂီ', ES: 'PORTUGAL', FR: 'PORTUGAL', RU: 'ПОРТУГАЛИЯ', ZH: '葡萄牙' } },
  { flag: '🇲🇽', code: 'MX', label: 'Messico', names: { IT: 'MESSICO', EN: 'MEXICO', TH: 'เม็กซิโก', DE: 'MEXIKO', MM: 'မက္ကဆီကို', ES: 'MÉXICO', FR: 'MEXIQUE', RU: 'МЕКСИКА', ZH: '墨西哥' } },
  { flag: '🇬🇷', code: 'GR', label: 'Grecia', names: { IT: 'GRECIA', EN: 'GREECE', TH: 'กรีซ', DE: 'GRIECHENLAND', MM: 'ဂရိ', ES: 'GRECIA', FR: 'GRÈCE', RU: 'ГРЕЦИЯ', ZH: '希腊' } },
  { flag: '🇦🇹', code: 'AT', label: 'Austria', names: { IT: 'AUSTRIA', EN: 'AUSTRIA', TH: 'ออสเตรีย', DE: 'ÖSTERREICH', MM: 'သြစတြီးယား', ES: 'AUSTRIA', FR: 'AUTRICHE', RU: 'АВСТРИЯ', ZH: '奥地利' } },
  { flag: '🇨🇭', code: 'CH', label: 'Svizzera', names: { IT: 'SVIZZERA', EN: 'SWITZERLAND', TH: 'สวิตเซอร์แลนด์', DE: 'SCHWEIZ', MM: 'ဆွစ်ဇာလန်', ES: 'SUIZA', FR: 'SUISSE', RU: 'ШВЕЙЦАРИЯ', ZH: '瑞士' } },
  { flag: '🇬🇧', code: 'GB', label: 'Regno Unito', names: { IT: 'REGNO UNITO', EN: 'UNITED KINGDOM', TH: 'สหราชอาณาจักร', DE: 'VEREINIGTES KÖNIGREICH', MM: 'ယူကေ', ES: 'REINO UNIDO', FR: 'ROYAUME-UNI', RU: 'ВЕЛИКОБРИТАНИЯ', ZH: '英国' } },
  { flag: '🇭🇺', code: 'HU', label: 'Ungheria', names: { IT: 'UNGHERIA', EN: 'HUNGARY', TH: 'ฮังการี', DE: 'UNGARN', MM: 'ဟန်ဂေရီ', ES: 'HUNGRÍA', FR: 'HONGRIE', RU: 'ВЕНГРИЯ', ZH: '匈牙利' } },
  { flag: '🇬🇪', code: 'GE', label: 'Georgia', names: { IT: 'GEORGIA', EN: 'GEORGIA', TH: 'จอร์เจีย', DE: 'GEORGIEN', MM: 'ဂျော်ဂျီယာ', ES: 'GEORGIA', FR: 'GÉORGIE', RU: 'ГРУЗИЯ', ZH: '格鲁吉亚' } },
  { flag: '🇹🇷', code: 'TR', label: 'Turchia', names: { IT: 'TURCHIA', EN: 'TURKEY', TH: 'ตุรกี', DE: 'TÜRKEI', MM: 'တူရကီ', ES: 'TURQUÍA', FR: 'TURQUIE', RU: 'ТУРЦИЯ', ZH: '土耳其' } },
  { flag: '🇱🇧', code: 'LB', label: 'Libano', names: { IT: 'LIBANO', EN: 'LEBANON', TH: 'เลบานอน', DE: 'LIBANON', MM: 'လက်ဘနွန်', ES: 'LÍBANO', FR: 'LIBAN', RU: 'ЛИВАН', ZH: '黎巴嫩' } },
];`;

let wineContent = fs.readFileSync(wineDataPath, 'utf8');
wineContent = wineContent.replace(/export const WINE_COUNTRY_OPTIONS = \[[\s\S]*?\n\];/, WINE_COUNTRY_OPTIONS_CODE);
fs.writeFileSync(wineDataPath, wineContent, 'utf8');
console.log('Successfully updated WINE_COUNTRY_OPTIONS in wineData.tsx');
