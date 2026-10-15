import { Language } from '../config/languages';

export interface DiningQrTranslation {
  modalTitle: string;
  modalSubtitle: string;
  tableCodeLabel: string;
  scanInstructions: string;
  copyLink: string;
  linkCopied: string;
  openInPhoneBtn: string;
  liveConnectedNotice: string;
  settledNotice: string;
  settledDesc: string;
  backHomeBtn: string;
  guestBannerTitle: string;
  guestBannerSubtitle: string;
  sessionActiveBadge: string;
}

export const I18N_DINING_QR: Record<Language, DiningQrTranslation> = {
  "IT": {
    "modalTitle": "Ordina dal tuo Smartphone",
    "modalSubtitle": "Inquadra per ordinare insieme a questo tavolo",
    "tableCodeLabel": "Postazione:",
    "scanInstructions": "Inquadra questo QR Code con la fotocamera del tuo telefono per aprire il menu e inviare ordini direttamente al tavolo.",
    "copyLink": "Copia Link Tavolo",
    "linkCopied": "Link Copiato negli Appunti!",
    "openInPhoneBtn": "📱 Mostra QR Code Smartphone",
    "liveConnectedNotice": "Sessione Attiva e Condivisa",
    "settledNotice": "Conto Saldato • Sessione Tavolo Conclusa",
    "settledDesc": "Questo tavolo e il relativo conto sono stati saldati. Grazie per aver mangiato con noi!",
    "backHomeBtn": "Torna alla Home / Delivery",
    "guestBannerTitle": "Menu al Tavolo (Ordinazione Diretta)",
    "guestBannerSubtitle": "Stai ordinando dal tuo smartphone",
    "sessionActiveBadge": "Sessione Aperta"
  },
  "EN": {
    "modalTitle": "Order from Your Smartphone",
    "modalSubtitle": "Scan to order together at this table",
    "tableCodeLabel": "Table:",
    "scanInstructions": "Scan this QR Code with your phone's camera to open the menu and send orders directly to the table.",
    "copyLink": "Copy Table Link",
    "linkCopied": "Link Copied to Clipboard!",
    "openInPhoneBtn": "📱 Show Smartphone QR Code",
    "liveConnectedNotice": "Active and Shared Session",
    "settledNotice": "Bill Settled • Table Session Closed",
    "settledDesc": "This table and its bill have been settled. Thank you for dining with us!",
    "backHomeBtn": "Back to Home / Delivery",
    "guestBannerTitle": "Table Menu (Direct Ordering)",
    "guestBannerSubtitle": "You are ordering from your smartphone",
    "sessionActiveBadge": "Session Open"
  },
  "TH": {
    "modalTitle": "สั่งจากสมาร์ทโฟนของคุณ",
    "modalSubtitle": "สแกนเพื่อสั่งร่วมกับโต๊ะนี้",
    "tableCodeLabel": "ตำแหน่ง:",
    "scanInstructions": "สแกน QR Code นี้ด้วยกล้องโทรศัพท์ของคุณเพื่อเปิดเมนูและส่งคำสั่งตรงไปยังโต๊ะ",
    "copyLink": "คัดลอกลิงก์โต๊ะ",
    "linkCopied": "คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว!",
    "openInPhoneBtn": "📱 แสดง QR Code สมาร์ทโฟน",
    "liveConnectedNotice": "เซสชันเปิดใช้งานและแชร์อยู่",
    "settledNotice": "ชำระบิลแล้ว • เซสชันโต๊ะสิ้นสุด",
    "settledDesc": "โต๊ะนี้และบิลที่เกี่ยวข้องได้รับการชำระแล้ว ขอบคุณที่รับประทานอาหารกับเรา!",
    "backHomeBtn": "กลับหน้าหลัก / เดลิเวอรี",
    "guestBannerTitle": "เมนูที่โต๊ะ (สั่งโดยตรง)",
    "guestBannerSubtitle": "คุณกำลังสั่งจากสมาร์ทโฟนของคุณ",
    "sessionActiveBadge": "เซสชันเปิดอยู่"
  },
  "MM": {
    "modalTitle": "သင့်စမတ်ဖုန်းမှ မှာယူပါ",
    "modalSubtitle": "ဤစားပွဲနှင့်အတူ မှာယူရန် စကင်ဖတ်ပါ",
    "tableCodeLabel": "နေရာ:",
    "scanInstructions": "မီနူးကိုဖွင့်ရန်နှင့် ဤစားပွဲသို့ တိုက်ရိုက်မှာယူရန် သင့်ဖုန်းကင်မရာဖြင့် ဤ QR ကုဒ်ကို စကင်ဖတ်ပါ။",
    "copyLink": "စားပွဲလင့်ခ်ကို ကူးယူပါ",
    "linkCopied": "လင့်ခ်ကို ကလစ်ဘုတ်သို့ ကူးယူပြီးပါပြီ!",
    "openInPhoneBtn": "📱 စမတ်ဖုန်း QR ကုဒ်ကို ပြပါ",
    "liveConnectedNotice": "အသက်ဝင်ပြီး မျှဝေထားသော ဆက်ရှင်",
    "settledNotice": "ငွေရှင်းပြီးပါပြီ • စားပွဲဆက်ရှင် ပြီးဆုံးပါပြီ",
    "settledDesc": "ဤစားပွဲနှင့် ဆက်စပ်ငွေတောင်းခံလွှာကို ရှင်းလင်းပြီးပါပြီ။ ကျွန်ုပ်တို့နှင့်အတူ စားသုံးပေးသည့်အတွက် ကျေးဇူးတင်ပါသည်!",
    "backHomeBtn": "ပင်မစာမျက်နှာ / ပို့ဆောင်ရေးသို့ ပြန်သွားပါ",
    "guestBannerTitle": "စားပွဲမီနူး (တိုက်ရိုက်မှာယူခြင်း)",
    "guestBannerSubtitle": "သင်သည် သင့်စမတ်ဖုန်းမှ မှာယူနေပါသည်",
    "sessionActiveBadge": "ဆက်ရှင် ဖွင့်ထားသည်"
  },
  "DE": {
    "modalTitle": "Bestellen Sie von Ihrem Smartphone",
    "modalSubtitle": "Scannen Sie, um zusammen an diesem Tisch zu bestellen",
    "tableCodeLabel": "Standort:",
    "scanInstructions": "Scannen Sie diesen QR-Code mit der Kamera Ihres Telefons, um das Menü zu öffnen und Bestellungen direkt an den Tisch zu senden.",
    "copyLink": "Tisch-Link kopieren",
    "linkCopied": "Link in die Zwischenablage kopiert!",
    "openInPhoneBtn": "📱 QR-Code für Smartphone anzeigen",
    "liveConnectedNotice": "Aktive und geteilte Sitzung",
    "settledNotice": "Rechnung beglichen • Tischsitzung beendet",
    "settledDesc": "Dieser Tisch und die zugehörige Rechnung wurden beglichen. Vielen Dank, dass Sie bei uns gegessen haben!",
    "backHomeBtn": "Zurück zur Startseite / Lieferung",
    "guestBannerTitle": "Tischmenü (Direktbestellung)",
    "guestBannerSubtitle": "Sie bestellen von Ihrem Smartphone",
    "sessionActiveBadge": "Sitzung geöffnet"
  },
  "FR": {
    "modalTitle": "Commandez depuis votre Smartphone",
    "modalSubtitle": "Scannez pour commander avec cette table",
    "tableCodeLabel": "Emplacement :",
    "scanInstructions": "Scannez ce QR Code avec l'appareil photo de votre téléphone pour ouvrir le menu et envoyer les commandes directement à la table.",
    "copyLink": "Copier le lien de la table",
    "linkCopied": "Lien copié dans le presse-papiers !",
    "openInPhoneBtn": "📱 Afficher le QR Code Smartphone",
    "liveConnectedNotice": "Session active et partagée",
    "settledNotice": "Addition réglée • Session de table terminée",
    "settledDesc": "Cette table et son addition ont été réglées. Merci d'avoir mangé avec nous !",
    "backHomeBtn": "Retour à l'accueil / Livraison",
    "guestBannerTitle": "Menu à table (Commande directe)",
    "guestBannerSubtitle": "Vous commandez depuis votre smartphone",
    "sessionActiveBadge": "Session ouverte"
  },
  "ES": {
    "modalTitle": "Ordena desde tu Smartphone",
    "modalSubtitle": "Escanea para ordenar junto a esta mesa",
    "tableCodeLabel": "Ubicación:",
    "scanInstructions": "Escanea este código QR con la cámara de tu teléfono para abrir el menú y enviar pedidos directamente a la mesa.",
    "copyLink": "Copiar Enlace de Mesa",
    "linkCopied": "¡Enlace Copiado al Portapapeles!",
    "openInPhoneBtn": "📱 Mostrar Código QR del Smartphone",
    "liveConnectedNotice": "Sesión Activa y Compartida",
    "settledNotice": "Cuenta Liquidada • Sesión de Mesa Finalizada",
    "settledDesc": "Esta mesa y su cuenta han sido liquidadas. ¡Gracias por comer con nosotros!",
    "backHomeBtn": "Volver al Inicio / Delivery",
    "guestBannerTitle": "Menú en Mesa (Pedido Directo)",
    "guestBannerSubtitle": "Estás ordenando desde tu smartphone",
    "sessionActiveBadge": "Sesión Abierta"
  },
  "RU": {
    "modalTitle": "Заказывайте со смартфона",
    "modalSubtitle": "Отсканируйте, чтобы заказать за этим столом",
    "tableCodeLabel": "Место:",
    "scanInstructions": "Отсканируйте этот QR-код камерой телефона, чтобы открыть меню и отправлять заказы прямо за стол.",
    "copyLink": "Скопировать ссылку стола",
    "linkCopied": "Ссылка скопирована в буфер обмена!",
    "openInPhoneBtn": "📱 Показать QR-код для смартфона",
    "liveConnectedNotice": "Сессия активна и общая",
    "settledNotice": "Счёт оплачен • Сессия стола завершена",
    "settledDesc": "Этот стол и соответствующий счёт были оплачены. Спасибо, что поели с нами!",
    "backHomeBtn": "Вернуться на главную / Доставка",
    "guestBannerTitle": "Меню за столом (прямой заказ)",
    "guestBannerSubtitle": "Вы заказываете со смартфона",
    "sessionActiveBadge": "Сессия открыта"
  },
  "ZH": {
    "modalTitle": "通过智能手机点餐",
    "modalSubtitle": "扫描二维码与同桌一起点餐",
    "tableCodeLabel": "桌号：",
    "scanInstructions": "用手机摄像头扫描此二维码，打开菜单并直接向餐桌发送订单。",
    "copyLink": "复制餐桌链接",
    "linkCopied": "链接已复制到剪贴板！",
    "openInPhoneBtn": "📱 显示智能手机二维码",
    "liveConnectedNotice": "会话已激活并共享",
    "settledNotice": "账单已结清 • 餐桌会话已结束",
    "settledDesc": "此餐桌及相关账单已结清。感谢您与我们共进美食！",
    "backHomeBtn": "返回首页 / 外卖",
    "guestBannerTitle": "餐桌菜单（直接点餐）",
    "guestBannerSubtitle": "您正在通过智能手机点餐",
    "sessionActiveBadge": "会话已开启"
  }
};
