import nodemailer from "nodemailer";

export interface DiningVoucherEmailPayload {
  toEmail: string;
  customerName?: string;
  promoCode: string;
  expiryDateStr: string; // e.g. "2026-10-19"
  lang: string; // "IT" | "EN" | "TH" | "MM" | "DE" | "ES" | "FR" | "RU" | "ZH"
}

const EMAIL_TEXTS: Record<string, {
  subject: (code: string) => string;
  preheader: string;
  greeting: (name: string) => string;
  thankYou: string;
  giftTitle: string;
  giftDesc: string;
  codeLabel: string;
  validityNote: (date: string) => string;
  ctaButton: string;
  howToUseTitle: string;
  howToUse1: string;
  howToUse2: string;
  signoff: string;
}> = {
  IT: {
    subject: (code) => `🎁 Il tuo Regalo Speciale 10% Sconto Flower Power Pizza Ranong (${code})`,
    preheader: "Grazie per aver scelto Flower Power! Ecco il tuo voucher sconto del 10% valido 10 giorni.",
    greeting: (name) => name ? `Ciao ${name}!` : "Ciao!",
    thankYou: "È stato un vero piacere averti nostro ospite al tavolo da Flower Power Pizza Ranong. Speriamo che la nostra pizza artigianale cotta nel forno a legna e i nostri piatti abbiano reso speciale il tuo momento!",
    giftTitle: "Un Regalo per la tua Prossima Pizza 🍕",
    giftDesc: "Per ringraziarti di aver mangiato da noi, siamo felicissimi di regalarti un buono sconto esclusivo del 10% per il tuo prossimo ordine da asporto o consegna a domicilio sul nostro sito web.",
    codeLabel: "IL TUO CODICE SCONTO PERSONALE (10%):",
    validityNote: (d) => `⏳ Valido per 10 giorni (fino al ${d}). Utilizzabile per 1 ordine sul nostro sito web.`,
    ctaButton: "Ordina Online con il 10% di Sconto",
    howToUseTitle: "Come usare il tuo sconto:",
    howToUse1: "1. Clicca sul pulsante qui sopra (lo sconto del 10% si attiverà automaticamente).",
    howToUse2: "2. Oppure inserisci manualmente il codice al momento del pagamento sul sito flowerpowerpizza.com",
    signoff: "A presto e buona pizza!\nIl Team di Flower Power Pizza Ranong"
  },
  EN: {
    subject: (code) => `🎁 Your 10% Discount Gift from Flower Power Pizza Ranong (${code})`,
    preheader: "Thank you for dining with us! Here is your 10% discount voucher valid for 10 days.",
    greeting: (name) => name ? `Hello ${name}!` : "Hello!",
    thankYou: "It was an absolute pleasure having you at our table at Flower Power Pizza Ranong. We hope you truly enjoyed our authentic wood-fired pizzas and homemade Italian dishes!",
    giftTitle: "A Special Gift for Your Next Order 🍕",
    giftDesc: "To thank you for being our guest, we are thrilled to give you an exclusive 10% discount voucher for your next takeaway or home delivery order on our website.",
    codeLabel: "YOUR EXCLUSIVE 10% PROMO CODE:",
    validityNote: (d) => `⏳ Valid for 10 days (until ${d}). Single-use for 1 order on our official website.`,
    ctaButton: "Order Online with 10% Off",
    howToUseTitle: "How to use your voucher:",
    howToUse1: "1. Click the button above to auto-activate the 10% discount on the website.",
    howToUse2: "2. Or simply enter your promo code at checkout on flowerpowerpizza.com",
    signoff: "See you soon & enjoy authentic pizza!\nThe Flower Power Pizza Ranong Team"
  },
  TH: {
    subject: (code) => `🎁 ของขวัญพิเศษส่วนลด 10% จาก Flower Power Pizza Ranong (${code})`,
    preheader: "ขอบคุณที่มาทานอาหารกับเรา! รับคูปองส่วนลด 10% ใช้ได้ 10 วัน",
    greeting: (name) => name ? `สวัสดีครับ/ค่ะ คุณ ${name}!` : "สวัสดีครับ/ค่ะ!",
    thankYou: "พวกเราชาว Flower Power Pizza Ranong ขอขอบคุณจากใจที่ท่านมาอุดหนุนและนั่งทานอาหารที่ร้านของเรา หวังว่าคุณจะประทับใจในพิซซ่าเตาฟืนและอาหารอิตาเลียนโฮมเมดของเราครับ/ค่ะ!",
    giftTitle: "ของขวัญแทนคำขอบคุณสำหรับมื้อถัดไป 🍕",
    giftDesc: "เพื่อเป็นการขอบคุณ เราขอมอบคูปองส่วนลดพิเศษ 10% สำหรับการสั่งอาหารเดลิเวอรี่ส่งถึงบ้านหรือรับที่ร้านผ่านทางเว็บไซต์",
    codeLabel: "โค้ดส่วนลด 10% พิเศษของคุณ:",
    validityNote: (d) => `⏳ ใช้ได้ 10 วัน (ถึงวันที่ ${d}) ใช้ได้ 1 ครั้งบนเว็บไซต์ของเรา`,
    ctaButton: "สั่งออนไลน์พร้อมรับส่วนลด 10%",
    howToUseTitle: "วิธีใช้งานโค้ดส่วนลด:",
    howToUse1: "1. คลิกปุ่มด้านบน ระบบจะเปิดส่วนลด 10% ให้อัตโนมัติ",
    howToUse2: "2. หรือพิมพ์โค้ดส่วนลดในหน้าเช็คเอาท์บน flowerpowerpizza.com",
    signoff: "แล้วพบกันใหม่นะครับ/ค่ะ!\nทีมงาน Flower Power Pizza Ranong"
  },
  MM: {
    subject: (code) => `🎁 Flower Power Pizza Ranong မှ အထူး ၁၀% လျှော့စျေး လက်ဆောင် (${code})`,
    preheader: "ကျွန်ုပ်တို့ထံ လာရောက်အားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်! ၁၀ ရက် သက်တမ်းရှိ ၁၀% လျှော့စျေး ကူပွန်။",
    greeting: (name) => name ? `မင်္ဂလာပါ ${name}!` : "မင်္ဂလာပါ!",
    thankYou: "Flower Power Pizza Ranong တွင် လာရောက်သုံးဆောင်ပေးသည့်အတွက် အထူးပင် ကျေးဇူးတင်ရှိပါသည်။ ကျွန်ုပ်တို့၏ ထင်းမီးဖိုဖြင့် ဖုတ်ထားသော အီတလီပီဇာနှင့် ဟင်းလျာများကို နှစ်သက်မည်ဟု မျှော်လင့်ပါသည်။",
    giftTitle: "နောက်တစ်ကြိမ်မှာယူမှုအတွက် အထူးလက်ဆောင် 🍕",
    giftDesc: "ကျေးဇူးတုံ့ပြန်သောအားဖြင့် ကျွန်ုပ်တို့၏ ဝဘ်ဆိုက်မှတစ်ဆင့် အိမ်အရောက်ပို့ သို့မဟုတ် အပြင်ယူမှာယူမှုအတွက် ၁၀% လျှော့စျေး ကူပွန်ကို ပေးအပ်ပါသည်။",
    codeLabel: "သင့်အတွက် သီးသန့် ၁၀% လျှော့စျေးကုဒ်:",
    validityNote: (d) => `⏳ ၁၀ ရက် သက်တမ်းရှိသည် (${d} အထိ)။ ဝဘ်ဆိုက်တွင် ၁ ကြိမ် အသုံးပြုနိုင်ပါသည်။`,
    ctaButton: "၁၀% လျှော့စျေးဖြင့် အွန်လိုင်းမှ မှာယူမည်",
    howToUseTitle: "အသုံးပြုနည်း:",
    howToUse1: "၁။ အထက်ပါ ခလုတ်ကို နှိပ်ပါက လျှော့စျေး အလိုအလျောက် ပွင့်ပါမည်။",
    howToUse2: "၂။ သို့မဟုတ် flowerpowerpizza.com တွင် ငွေရှင်းချိန်၌ ဤကုဒ်ကို ထည့်သွင်းပါ။",
    signoff: "မကြာမီ ပြန်လည်တွေ့ဆုံပါမည်!\nFlower Power Pizza Ranong အဖွဲ့"
  },
  DE: {
    subject: (code) => `🎁 Dein 10% Rabatt-Gutschein von Flower Power Pizza Ranong (${code})`,
    preheader: "Danke für deinen Besuch! Hier ist dein 10% Rabattgutschein, gültig für 10 Tage.",
    greeting: (name) => name ? `Hallo ${name}!` : "Hallo!",
    thankYou: "Es war uns eine große Freude, dich bei Flower Power Pizza Ranong zu bewirten. Wir hoffen, unsere authentischen Holzofenpizzen und Gerichte haben dir geschmeckt!",
    giftTitle: "Ein Geschenk für deine nächste Bestellung 🍕",
    giftDesc: "Als Dankeschön schenken wir dir einen exklusiven 10% Rabattgutschein für deine nächste Bestellung zur Lieferung oder zum Mitnehmen auf unserer Website.",
    codeLabel: "DEIN PERSÖNLICHER 10% PROMO-CODE:",
    validityNote: (d) => `⏳ Gültig für 10 Tage (bis ${d}). Einmalig einlösbar auf flowerpowerpizza.com`,
    ctaButton: "Online mit 10% Rabatt bestellen",
    howToUseTitle: "So löst du den Gutschein ein:",
    howToUse1: "1. Klicke auf den Button oben (der 10% Rabatt wird automatisch aktiviert).",
    howToUse2: "2. Oder gib den Code beim Checkout auf flowerpowerpizza.com ein.",
    signoff: "Bis bald & guten Appetit!\nDein Flower Power Pizza Ranong Team"
  },
  ES: {
    subject: (code) => `🎁 Tu Regalo del 10% de Descuento de Flower Power Pizza Ranong (${code})`,
    preheader: "¡Gracias por visitarnos! Aquí tienes tu cupón del 10% de descuento válido por 10 días.",
    greeting: (name) => name ? `¡Hola ${name}!` : "¡Hola!",
    thankYou: "Fue un verdadero placer tenerte en Flower Power Pizza Ranong. ¡Esperamos que hayas disfrutado de nuestras auténticas pizzas al horno de leña y platos caseros!",
    giftTitle: "Un Regalo para tu Próximo Pedido 🍕",
    giftDesc: "Para agradecerte tu visita, nos alegra regalarte un cupón exclusivo del 10% de descuento para tu próximo pedido a domicilio o para llevar en nuestro sitio web.",
    codeLabel: "TU CÓDIGO DE DESCUENTO DEL 10%:",
    validityNote: (d) => `⏳ Válido durante 10 días (hasta el ${d}). De un solo uso en nuestro sitio web.`,
    ctaButton: "Pedir Online con 10% de Descuento",
    howToUseTitle: "Cómo usar tu cupón:",
    howToUse1: "1. Haz clic en el botón superior (el descuento se aplicará automáticamente).",
    howToUse2: "2. O introduce el código al finalizar la compra en flowerpowerpizza.com",
    signoff: "¡Hasta pronto y buen provecho!\nEl equipo de Flower Power Pizza Ranong"
  },
  FR: {
    subject: (code) => `🎁 Votre Cadeau de 10% de Réduction Flower Power Pizza Ranong (${code})`,
    preheader: "Merci pour votre visite ! Voici votre coupon de 10 % valable 10 jours.",
    greeting: (name) => name ? `Bonjour ${name} !` : "Bonjour !",
    thankYou: "Ce fut un réel plaisir de vous accueillir chez Flower Power Pizza Ranong. Nous espérons que vous avez apprécié nos pizzas authentiques au feu de bois et nos spécialités maison !",
    giftTitle: "Un Cadeau pour votre Prochaine Commande 🍕",
    giftDesc: "Pour vous remercier, nous sommes ravis de vous offrir un coupon exclusif de 10 % de réduction sur votre prochaine commande en livraison ou à emporter sur notre site web.",
    codeLabel: "VOTRE CODE PROMO EXCLUSIF (10%) :",
    validityNote: (d) => `⏳ Valable 10 jours (jusqu'au ${d}). Utilisable 1 fois sur notre site web.`,
    ctaButton: "Commander en Ligne avec -10%",
    howToUseTitle: "Comment utiliser votre bon :",
    howToUse1: "1. Cliquez sur le bouton ci-dessus pour activer automatiquement la réduction.",
    howToUse2: "2. Ou saisissez le code lors du paiement sur flowerpowerpizza.com",
    signoff: "À très bientôt et bon appétit !\nL'équipe Flower Power Pizza Ranong"
  },
  RU: {
    subject: (code) => `🎁 Ваш подарок: Скидка 10% от Flower Power Pizza Ranong (${code})`,
    preheader: "Спасибо за визит! Ваш купон на скидку 10%, действительный 10 дней.",
    greeting: (name) => name ? `Здравствуйте, ${name}!` : "Здравствуйте!",
    thankYou: "Нам было очень приятно видеть вас в Flower Power Pizza Ranong. Надеемся, вам понравилась наша настоящая итальянская пицца из дровяной печи и домашние блюда!",
    giftTitle: "Подарок к вашему следующему заказу 🍕",
    giftDesc: "В знак благодарности мы дарим вам эксклюзивный купон на скидку 10% на следующий заказ с доставкой на дом или на вынос на нашем сайте.",
    codeLabel: "ВАШ ПЕРСОНАЛЬНЫЙ ПРОМОКОД (10%):",
    validityNote: (d) => `⏳ Действителен 10 дней (до ${d}). Одноразовое использование на сайте.`,
    ctaButton: "Заказать онлайн со скидкой 10%",
    howToUseTitle: "Как использовать промокод:",
    howToUse1: "1. Нажмите кнопку выше (скидка 10% активируется автоматически).",
    howToUse2: "2. Или введите код при оформлении заказа на flowerpowerpizza.com",
    signoff: "До скорой встречи и приятного аппетита!\nКоманда Flower Power Pizza Ranong"
  },
  ZH: {
    subject: (code) => `🎁 来自 Flower Power Pizza Ranong 的 10% 折扣专享礼遇 (${code})`,
    preheader: "感谢您的光临！为您奉上有效期10天的10%折扣优惠券。",
    greeting: (name) => name ? `您好 ${name}！` : "您好！",
    thankYou: "非常高兴能在 Flower Power Pizza Ranong 为您服务。希望您喜欢我们正宗的柴火意式披萨和手工精致料理！",
    giftTitle: "为您下一次点单准备的专属礼物 🍕",
    giftDesc: "为感谢您的光顾，我们很高兴为您提供一张专属的 10% 折扣优惠券，可用于您下次在我们网站上的外卖自取或配送上门订单。",
    codeLabel: "您的专属 10% 优惠码：",
    validityNote: (d) => `⏳ 有效期 10 天（截止至 ${d}）。可在官方网站单次使用。`,
    ctaButton: "立即在线点餐享 10% 优惠",
    howToUseTitle: "如何使用优惠码：",
    howToUse1: "1. 点击上方按钮（网站将自动激活 10% 折扣环境）。",
    howToUse2: "2. 或在 flowerpowerpizza.com 结账时手动输入该优惠码。",
    signoff: "期待再次相遇，祝您用餐愉快！\nFlower Power Pizza Ranong 团队"
  }
};

export async function sendDiningVoucherEmail(payload: DiningVoucherEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { toEmail, customerName = "", promoCode, expiryDateStr, lang = "IT" } = payload;

  if (!toEmail || !toEmail.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }

  const upperLang = (lang || "IT").toUpperCase();
  const t = EMAIL_TEXTS[upperLang] || EMAIL_TEXTS.EN || EMAIL_TEXTS.IT;

  const directLink = `https://flowerpowerpizza.com/?promo=${encodeURIComponent(promoCode)}`;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.VITE_SMTP_USER || "";
  const pass = process.env.SMTP_PASS || process.env.VITE_SMTP_PASS || "";

  if (!user || !pass) {
    console.warn("[DiningVoucherEmail] SMTP credentials missing in environment variables.");
    return { success: false, error: "SMTP credentials not configured" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject(promoCode)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
    
    <!-- Top Header / Logo -->
    <div style="text-align: center; padding-bottom: 24px;">
      <div style="display: inline-block; padding: 8px 16px; border-radius: 9999px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
        Flower Power Pizza • Ranong
      </div>
      <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 16px 0 4px 0; letter-spacing: -0.5px;">
        ${t.giftTitle}
      </h1>
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        ${t.preheader}
      </p>
    </div>

    <!-- Main Card -->
    <div style="background: #141721; border: 1px solid #272d3d; border-radius: 24px; padding: 28px 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      
      <p style="font-size: 16px; font-weight: 700; color: #f59e0b; margin-top: 0;">
        ${t.greeting(customerName)}
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #d1d5db; margin-bottom: 20px;">
        ${t.thankYou}
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #e5e7eb; margin-bottom: 24px;">
        ${t.giftDesc}
      </p>

      <!-- Promo Code Box -->
      <div style="background: linear-gradient(135deg, #1f2536 0%, #171c2a 100%); border: 2px dashed #f59e0b; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="display: block; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 8px; text-transform: uppercase;">
          ${t.codeLabel}
        </span>
        <div style="font-size: 32px; font-weight: 900; font-family: monospace; letter-spacing: 4px; color: #fbbf24; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 12px; display: inline-block;">
          ${promoCode}
        </div>
        <p style="font-size: 12px; font-weight: 700; color: #fbbf24; margin: 12px 0 0 0;">
          ${t.validityNote(expiryDateStr)}
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0 20px 0;">
        <a href="${directLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 16px 32px; border-radius: 9999px; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.4); text-transform: uppercase; letter-spacing: 1px;">
          ${t.ctaButton} →
        </a>
      </div>

      <!-- How to use box -->
      <div style="border-top: 1px solid #272d3d; padding-top: 20px; margin-top: 24px; color: #9ca3af; font-size: 12px; line-height: 1.6;">
        <p style="font-weight: 700; color: #d1d5db; margin: 0 0 8px 0;">${t.howToUseTitle}</p>
        <p style="margin: 4px 0;">${t.howToUse1}</p>
        <p style="margin: 4px 0;">${t.howToUse2}</p>
      </div>

    </div>

    <!-- Signoff & Footer -->
    <div style="text-align: center; padding-top: 24px; color: #6b7280; font-size: 12px; line-height: 1.5;">
      <p style="color: #9ca3af; font-style: italic; white-space: pre-line; margin-bottom: 16px;">
        ${t.signoff}
      </p>
      <p style="margin: 4px 0;">
        📍 Flower Power Pizza • Ranong, Thailand
      </p>
      <p style="margin: 4px 0;">
        🌐 <a href="https://flowerpowerpizza.com" style="color: #f59e0b; text-decoration: none;">www.flowerpowerpizza.com</a>
      </p>
    </div>

  </div>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: `"Flower Power Pizza Ranong" <${user}>`,
      to: toEmail,
      subject: t.subject(promoCode),
      html: htmlContent
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[DiningVoucherEmail] Send error:", err);
    return { success: false, error: err.message || "Failed sending email" };
  }
}
