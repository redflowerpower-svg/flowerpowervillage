import { useState } from 'react';
import { X, ShieldCheck, Truck, RotateCcw, Building2, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../config/languages';

export type PolicyTab = 'delivery' | 'refund' | 'privacy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
  lang?: Language;
}

const content = {
  IT: {
    modalTitle: 'Informative Legali & Politiche di Servizio',
    modalSubtitle: 'Conformità trasparente e protezione del consumatore',
    tabDelivery: 'Consegna & Spedizione',
    tabRefund: 'Cancellazione & Rimborsi',
    tabPrivacy: 'Privacy & Sicurezza Pagamenti',
    companySectionTitle: 'Dati Societari & Recapiti Ufficiali',
    headOfficeLabel: 'Sede Legale (Head Office)',
    branchLabel: 'Punto Vendita & Ristorante Pizzeria',
    taxIdLabel: 'Codice Fiscale / Tax ID',
    phoneLabel: 'Telefono / Assistenza',
    emailLabel: 'Email Ufficiale',

    // Delivery Policy
    deliveryTitle: 'Termini e Condizioni di Consegna (Shipping Policy)',
    delPoint1Title: 'Raggio e Zone di Consegna',
    delPoint1Desc: 'Il servizio di consegna a domicilio Flower Power Pizza è attivo esclusivamente per la città di Ranong entro un raggio massimo di 5,0 km dal nostro punto vendita a Bang Rin (Ranong Hot Springs).',
    delPoint2Title: 'Tariffe e Consegna Gratuita',
    delPoint2Desc: 'La consegna è GRATUITA per tutti gli ordini pari o superiori a 300 Baht (฿). Per ordini inferiori a 300 Baht, viene applicato un costo di spedizione fisso di 30 Baht.',
    delPoint3Title: 'Tempi di Preparazione e Consegna',
    delPoint3Desc: 'I tempi medi stimati di consegna sono compresi tra 30 e 45 minuti dall’accettazione della comanda da parte della cucina. In orari di punta o in caso di condizioni meteo avverse, il tempo potrebbe estendersi fino a 60 minuti con tempestiva notifica.',

    // Refund Policy
    refundTitle: 'Politica di Cancellazione e Rimborso (Refund & Cancellation)',
    refPoint1Title: 'Cancellazione dell’Ordine',
    refPoint1Desc: 'Il cliente può annullare gratuitamente il proprio ordine solo prima che la cucina lo accetti o che le pizze vengano infornate. Una volta avviata la cottura degli ingredienti freschi, l’ordine non potrà più essere annullato.',
    refPoint2Title: 'Rimborsi Integrali al 100%',
    refPoint2Desc: 'In caso di rifiuto dell’ordine da parte della cucina, prodotto esaurito o impossibilità di effettuare la consegna per cause di forza maggiore, al cliente viene garantito il rimborso totale e immediato del 100% dell’importo addebitato.',
    refPoint3Title: 'Tempistiche di Accredito Omise',
    refPoint3Desc: 'Tutti i rimborsi per pagamenti elettronici effettuati tramite il gateway Omise (Carta di Credito/Debito o PromptPay QR) vengono riaccreditati automaticamente sullo stesso conto o strumento bancario utilizzato in fase di acquisto entro 3 - 5 giorni lavorativi, in conformità agli standard interbancari.',

    // Privacy Policy
    privacyTitle: 'Informativa sulla Privacy & Sicurezza dei Pagamenti (PDPA & GDPR)',
    privPoint1Title: 'Finalità del Trattamento Dati Personali',
    privPoint1Desc: 'Raccogliamo unicamente i dati necessari al corretto recapito dell’ordine (nome, recapito telefonico, indirizzo di consegna e coordinate geografiche GPS). Tali dati non saranno mai venduti, ceduti o condivisi con terze parti per finalità di marketing.',
    privPoint2Title: 'Crittografia e Zero Conservazione Carte',
    privPoint2Desc: 'Tutte le transazioni online sono elaborate tramite il gateway finanziario OMISE (Opn Payments) con crittografia SSL a 256-bit e protocollo 3D Secure. I numeri completi delle carte di credito/debito e i codici CVV non transitano e NON vengono mai salvati nei nostri database o server, rispettando il massimo livello di certificazione PCI-DSS Level 1.',
    privPoint3Title: 'Diritti dell’Interessato',
    privPoint3Desc: 'In conformità con il Personal Data Protection Act (PDPA) thailandese e il GDPR europeo, il cliente ha diritto in qualsiasi momento di richiedere la verifica, modifica o cancellazione definitiva dei propri dati inviando un’email a flowerpowerpizzaranong.th@gmail.com.',
    closeBtn: 'Chiudi'
  },
  EN: {
    modalTitle: 'Legal Information & Service Policies',
    modalSubtitle: 'Full regulatory compliance & customer protection',
    tabDelivery: 'Delivery & Shipping',
    tabRefund: 'Cancellation & Refunds',
    tabPrivacy: 'Privacy & Payment Security',
    companySectionTitle: 'Official Corporate Details & Contacts',
    headOfficeLabel: 'Head Office (Registered Company)',
    branchLabel: 'Restaurant & Kitchen Branch',
    taxIdLabel: 'Taxpayer Identification Number (Tax ID)',
    phoneLabel: 'Phone & Customer Support',
    emailLabel: 'Official Email',

    // Delivery Policy
    deliveryTitle: 'Delivery & Shipping Policy',
    delPoint1Title: 'Coverage Area & Delivery Radius',
    delPoint1Desc: 'Flower Power Pizza food delivery service is available exclusively within Ranong city, serving up to a maximum radius of 5.0 km from our restaurant in Bang Rin (Ranong Hot Springs).',
    delPoint2Title: 'Delivery Rates & Free Delivery Threshold',
    delPoint2Desc: 'Delivery is FREE for all orders of 300 Baht (฿) or more. For orders below 300 Baht, a standard flat delivery fee of 30 Baht applies.',
    delPoint3Title: 'Preparation & Estimated Delivery Time',
    delPoint3Desc: 'Estimated delivery time is between 30 and 45 minutes from kitchen acceptance. During peak hours or tropical rain conditions, delivery may take up to 60 minutes.',

    // Refund Policy
    refundTitle: 'Cancellation & Refund Policy',
    refPoint1Title: 'Order Cancellation',
    refPoint1Desc: 'Customers can cancel their order free of charge before the kitchen accepts the ticket or starts baking. Once baking has begun, cancellations cannot be accepted due to fresh food preparation.',
    refPoint2Title: '100% Full Refund Guarantee',
    refPoint2Desc: 'If an order is rejected by the kitchen, an item is out of stock, or delivery is impossible due to force majeure, a full 100% refund is issued immediately.',
    refPoint3Title: 'Omise Refund Processing Time',
    refPoint3Desc: 'Refunds for online transactions processed through Omise (Credit/Debit Card or PromptPay QR) are returned directly to the original bank card or account within 3 to 5 business days, in compliance with Thai banking regulations.',

    // Privacy Policy
    privacyTitle: 'Privacy Policy & Payment Security (PDPA & GDPR)',
    privPoint1Title: 'Personal Data Collection & Purpose',
    privPoint1Desc: 'We collect customer names, phone numbers, delivery addresses, and GPS coordinates solely for food preparation, delivery logistics, and rider communication. We never sell, rent, or trade personal data.',
    privPoint2Title: 'Zero Card Data Storage & Omise Vault',
    privPoint2Desc: 'All online payments are securely processed through OMISE (Opn Payments) with 256-bit SSL encryption and mandatory 3D Secure authentication. Credit card numbers and CVV codes are NEVER stored on or processed through our servers, fully compliant with PCI-DSS Level 1 standards.',
    privPoint3Title: 'Customer Data Rights (PDPA Compliance)',
    privPoint3Desc: 'Under Thailand’s Personal Data Protection Act (PDPA) and GDPR, customers may request access, correction, or deletion of their personal information by contacting flowerpowerpizzaranong.th@gmail.com.',
    closeBtn: 'Close'
  },
  TH: {
    modalTitle: 'ข้อมูลทางกฎหมายและนโยบายการให้บริการ',
    modalSubtitle: 'การปฏิบัติตามกฎระเบียบและความคุ้มครองผู้บริโภค',
    tabDelivery: 'การจัดส่งสินค้า',
    tabRefund: 'การยกเลิกและการคืนเงิน',
    tabPrivacy: 'ความเป็นส่วนตัวและความปลอดภัย',
    companySectionTitle: 'ข้อมูลนิติบุคคลและช่องทางการติดต่ออย่างเป็นทางการ',
    headOfficeLabel: 'สำนักงานใหญ่ (บริษัทที่จดทะเบียน)',
    branchLabel: 'สาขาร้านอาหารและพิซเซอเรีย',
    taxIdLabel: 'เลขประจำตัวผู้เสียภาษีอากร',
    phoneLabel: 'เบอร์โทรศัพท์ติดต่อ',
    emailLabel: 'อีเมลอย่างเป็นทางการ',

    // Delivery Policy
    deliveryTitle: 'นโยบายการจัดส่งสินค้า (Delivery Policy)',
    delPoint1Title: 'พื้นที่และรัศมีการให้บริการจัดส่ง',
    delPoint1Desc: 'บริการจัดส่งอาหารของ ฟลาวเวอร์ พาวเวอร์ พิซซ่า ให้บริการเฉพาะในเขตพื้นที่อำเภอเมืองระนอง ในรัศมีไม่เกิน 5.0 กิโลเมตร จากหน้าร้าน ณ ต.บางริ้น (บ่อน้ำร้อนระนอง)',
    delPoint2Title: 'อัตราค่าจัดส่งและสิทธิ์จัดส่งฟรี',
    delPoint2Desc: 'บริการจัดส่งฟรี เมื่อมียอดสั่งซื้อตั้งแต่ 300 บาท (฿) ขึ้นไป สำหรับคำสั่งซื้อที่ต่ำกว่า 300 บาท จะมีค่าจัดส่งตามมาตรฐาน 30 บาท',
    delPoint3Title: 'ระยะเวลาในการจัดเตรียมและจัดส่ง',
    delPoint3Desc: 'ระยะเวลาจัดส่งโดยประมาณอยู่ที่ 30 ถึง 45 นาที หลังจากทางครัวกดยืนยันรับออเดอร์ ในช่วงเวลาเร่งด่วนหรือสภาพอากาศฝนตกหนักอาจใช้เวลาสูงสุดประมาณ 60 นาที',

    // Refund Policy
    refundTitle: 'นโยบายการยกเลิกและการคืนเงิน (Cancellation & Refund Policy)',
    refPoint1Title: 'การยกเลิกคำสั่งซื้อ',
    refPoint1Desc: 'ลูกค้าสามารถขอยกเลิกคำสั่งซื้อได้โดยไม่มีค่าใช้จ่าย ก่อนที่ทางครัวจะกดยืนยันรับออเดอร์หรือเริ่มนำพิซซ่าเข้าเตาอบ เมื่อเริ่มการอบแล้วจะไม่สามารถยกเลิกได้เนื่องจากเป็นอาหารปรุงสด',
    refPoint2Title: 'การคืนเงินเต็มจำนวน 100%',
    refPoint2Desc: 'ในกรณีที่ทางร้านปฏิเสธคำสั่งซื้อ สินค้าหมด หรือไม่สามารถจัดส่งได้เนื่องจากเหตุสุดวิสัย ลูกค้าจะได้รับเงินคืนเต็มจำนวน 100% ทันที',
    refPoint3Title: 'ระยะเวลาดำเนินการคืนเงินผ่านระบบ Omise',
    refPoint3Desc: 'การคืนเงินสำหรับธุรกรรมที่ชำระผ่านเกตเวย์ Omise (บัตรเครดิต/เดบิต หรือ พร้อมเพย์ QR) ยอดเงินจะถูกโอนคืนเข้าสู่บัญชีธนาคารหรือบัตรเดิมของลูกค้าภายใน 3 ถึง 5 วันทำการ ตามมาตรฐานระบบธนาคารแห่งประเทศไทย',

    // Privacy Policy
    privacyTitle: 'นโยบายความเป็นส่วนตัวและความปลอดภัยในการชำระเงิน (PDPA)',
    privPoint1Title: 'การเก็บรวบรวมและการใช้ข้อมูลส่วนบุคคล',
    privPoint1Desc: 'เราจัดเก็บเฉพาะข้อมูลที่จำเป็นต่อการจัดส่งอาหาร ได้แก่ ชื่อ เบอร์โทรศัพท์ ที่อยู่จัดส่ง และพิกัด GPS เพื่อใช้ในการนำส่งอาหารเท่านั้น เราไม่มีนโยบายจำหน่ายหรือเปิดเผยข้อมูลแก่บุคคลภายนอก',
    privPoint2Title: 'ความปลอดภัยของระบบชำระเงิน ไม่เก็บข้อมูลบัตรในเซิร์ฟเวอร์',
    privPoint2Desc: 'การชำระเงินออนไลน์ทั้งหมดดำเนินการผ่าน OMISE (Opn Payments) ซึ่งได้รับการรับรองความปลอดภัยระดับสูงสุด PCI-DSS Level 1 พร้อมระบบ 3D Secure และการเข้ารหัส SSL 256-bit ทางเราไม่มีการจัดเก็บหมายเลขบัตรเครดิตหรือรหัส CVV บนเซิร์ฟเวอร์ของเราอย่างเด็ดขาด',
    privPoint3Title: 'สิทธิของเจ้าของข้อมูลส่วนบุคคล (ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล)',
    privPoint3Desc: 'ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ลูกค้ามีสิทธิขอตรวจสอบ แก้ไข หรือลบข้อมูลส่วนบุคคลของท่านได้ โดยติดต่อผ่านอีเมล flowerpowerpizzaranong.th@gmail.com',
    closeBtn: 'ปิดหน้าต่าง'
  },
  DE: {
    modalTitle: 'Rechtliche Informationen & Service-Richtlinien',
    modalSubtitle: 'Vollständige Konformität und Verbraucherschutz',
    tabDelivery: 'Lieferbedingungen',
    tabRefund: 'Stornierung & Erstattung',
    tabPrivacy: 'Datenschutz & Sicherheit',
    companySectionTitle: 'Unternehmensdaten & Offizielle Kontakte',
    headOfficeLabel: 'Hauptsitz (Eingetragenes Unternehmen)',
    branchLabel: 'Pizzeria- & Restaurant-Filiale',
    taxIdLabel: 'Steuernummer / Tax ID',
    phoneLabel: 'Telefon & Kundenservice',
    emailLabel: 'Offizielle E-Mail',

    // Delivery Policy
    deliveryTitle: 'Liefer- und Versandrichtlinien (Delivery Policy)',
    delPoint1Title: 'Liefergebiet & Radius',
    delPoint1Desc: 'Der Lieferservice von Flower Power Pizza ist ausschließlich innerhalb der Stadt Ranong in einem Radius von maximal 5,0 km ab unserem Standort in Bang Rin (Ranong Hot Springs) verfügbar.',
    delPoint2Title: 'Lieferkosten & Kostenlose Lieferung',
    delPoint2Desc: 'Die Lieferung ist KOSTENLOS für alle Bestellungen ab 300 Baht (฿). Für Bestellungen unter 300 Baht berechnen wir eine feste Liefergebühr von 30 Baht.',
    delPoint3Title: 'Zubereitungs- und Lieferzeiten',
    delPoint3Desc: 'Die geschätzte Lieferzeit beträgt 30 bis 45 Minuten ab Auftragsbestätigung durch die Küche.',

    // Refund Policy
    refundTitle: 'Stornierungs- und Rückerstattungsrichtlinien',
    refPoint1Title: 'Stornierung der Bestellung',
    refPoint1Desc: 'Bestellungen können gebührenfrei storniert werden, bevor die Küche den Auftrag annimmt oder mit dem Backen beginnt.',
    refPoint2Title: '100% Volle Rückerstattung',
    refPoint2Desc: 'Wird eine Bestellung von der Küche abgelehnt oder ist eine Lieferung unmöglich, erstatten wir 100% des Betrags unverzüglich zurück.',
    refPoint3Title: 'Bearbeitungszeit über Omise',
    refPoint3Desc: 'Rückerstattungen über Omise (Kreditkarte oder PromptPay QR) erfolgen innerhalb von 3 bis 5 Werktagen direkt auf die ursprüngliche Zahlungsmethode.',

    // Privacy Policy
    privacyTitle: 'Datenschutzerklärung & Zahlungssicherheit (PDPA & DSGVO)',
    privPoint1Title: 'Datenerhebung zu Lieferzwecken',
    privPoint1Desc: 'Wir erfassen Namen, Telefonnummern und Lieferadressen ausschließlich zur Auftragsabwicklung und Speisenzustellung.',
    privPoint2Title: 'Keine Speicherung von Kartendaten & Omise Vault',
    privPoint2Desc: 'Kartenzahlungen werden nach PCI-DSS Level 1 über Omise (Opn Payments) mit 3D Secure abgewickelt. Es werden niemals Kartennummern oder CVV-Codes auf unseren Servern gespeichert.',
    privPoint3Title: 'Ihre Rechte (PDPA & DSGVO)',
    privPoint3Desc: 'Sie haben das Recht auf Auskunft, Korrektur oder Löschung Ihrer Daten via flowerpowerpizzaranong.th@gmail.com.',
    closeBtn: 'Schließen'
  }
};

export default function PizzaPoliciesModal({ isOpen, onClose, initialTab = 'delivery', lang: propLang }: Props) {
  const storeLang = useLanguageStore((s) => s.lang);
  const lang = propLang || storeLang || 'IT';
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const t = content[lang] || content.EN;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>{t.modalTitle}</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5">{t.modalSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 bg-stone-100 p-1.5 border-b border-stone-200 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('delivery')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[10px] sm:text-xs uppercase tracking-wider ${
              activeTab === 'delivery'
                ? 'bg-white text-[#8B1E1E] shadow-sm font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tabDelivery}</span>
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[10px] sm:text-xs uppercase tracking-wider ${
              activeTab === 'refund'
                ? 'bg-white text-[#8B1E1E] shadow-sm font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tabRefund}</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[10px] sm:text-xs uppercase tracking-wider ${
              activeTab === 'privacy'
                ? 'bg-white text-[#8B1E1E] shadow-sm font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tabPrivacy}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-stone-800 text-xs sm:text-sm leading-relaxed">
          
          {/* TAB 1: DELIVERY */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm sm:text-base font-black text-[#8B1E1E] uppercase tracking-wide">
                {t.deliveryTitle}
              </h3>
              
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-black text-stone-900 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.delPoint1Title}</span>
                  </h4>
                  <p className="text-stone-600 pl-6 text-xs">{t.delPoint1Desc}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <h4 className="font-black text-amber-950 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t.delPoint2Title}</span>
                  </h4>
                  <p className="text-stone-700 pl-6 text-xs font-medium">{t.delPoint2Desc}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-black text-stone-900 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.delPoint3Title}</span>
                  </h4>
                  <p className="text-stone-600 pl-6 text-xs">{t.delPoint3Desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REFUND & CANCELLATION */}
          {activeTab === 'refund' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm sm:text-base font-black text-[#8B1E1E] uppercase tracking-wide">
                {t.refundTitle}
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-black text-stone-900 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.refPoint1Title}</span>
                  </h4>
                  <p className="text-stone-600 pl-6 text-xs">{t.refPoint1Desc}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <h4 className="font-black text-emerald-950 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.refPoint2Title}</span>
                  </h4>
                  <p className="text-emerald-900 pl-6 text-xs font-semibold">{t.refPoint2Desc}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-black text-stone-900 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.refPoint3Title}</span>
                  </h4>
                  <p className="text-stone-600 pl-6 text-xs">{t.refPoint3Desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & OMISE PAYMENT SECURITY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm sm:text-base font-black text-[#8B1E1E] uppercase tracking-wide">
                {t.privacyTitle}
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-black text-stone-900 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.privPoint1Title}</span>
                  </h4>
                  <p className="text-stone-600 pl-6 text-xs">{t.privPoint1Desc}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <h4 className="font-black text-emerald-950 flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.privPoint2Title}</span>
                  </h4>
                  <p className="text-emerald-900 pl-6 text-xs font-medium">{t.privPoint2Desc}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-black text-stone-900 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.privPoint3Title}</span>
                  </h4>
                  <p className="text-stone-600 pl-6 text-xs">{t.privPoint3Desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* OFFICIAL CORPORATE ENTITY & CONTACT BOX (MANDATORY FOR OMISE KYC) */}
          <div className="mt-6 p-4 rounded-2xl bg-stone-900 text-stone-300 border border-stone-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-2 text-white font-black text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{t.companySectionTitle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">{t.headOfficeLabel}</p>
                <p className="text-white font-bold mt-0.5">ONLY PON CO., LTD (Head office)</p>
                <p className="text-[10px] text-amber-400 font-thai">บริษัท โอนลี่พล จำกัด (สำนักงานใหญ่)</p>
                <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                  14/32 M.1 Sub-district Koh Phayam, District Mueang Ranong, Province Ranong 85000<br />
                  <span className="font-thai text-[10px]">14/32 ม.1 ต.เกาะพยาม อ.เมืองระนอง จ.ระนอง 85000</span>
                </p>
                <p className="text-[11px] text-stone-300 mt-1.5">
                  <span className="font-bold text-white">{t.taxIdLabel}:</span> <span className="font-mono text-amber-300 font-bold">0845562009083</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">{t.branchLabel}</p>
                <p className="text-white font-bold mt-0.5">FLOWER POWER PIZZA</p>
                <p className="text-[10px] text-amber-400 font-thai">ฟลาวเวอร์ พาวเวอร์ พิซซ่า ระนอง</p>
                <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                  129/6 Moo 1, Tambon Bang Rin, Mueang Ranong, 85000<br />
                  <span className="font-thai text-[10px]">129/6 หมู่1 ต.บางริ้น อ.เมือง จ.ระนอง 85000</span>
                </p>
                
                <div className="mt-2 space-y-1 text-[11px]">
                  <p className="flex items-center gap-1.5 text-stone-300">
                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>085 884 4852 / 095 650 2969</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-stone-300">
                    <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">flowerpowerpizzaranong.th@gmail.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
