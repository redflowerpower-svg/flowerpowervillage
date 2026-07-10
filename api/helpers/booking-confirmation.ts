import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

// Accommodation data map matching Octorate product IDs
export const ACCOMMODATION_DETAILS: Record<number, {
  name: string;
  category: string;
  description: string;
  features: string[];
  beds: string;
}> = {
  529784: {
    name: "Jungle Villa",
    category: "Ville",
    description: "La Jungle Villa è la struttura più ampia del villaggio, ideale per grandi gruppi che vogliono condividere l'esperienza. Doppie cucine, doppi salotti outdoor e due camere con letti King e divani Queen accolgono comodamente fino a otto ospiti. Due bagni privati e una splendida vista sulla piscina rendono questo soggiorno davvero indimenticabile.",
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Double Living Room'],
    beds: '2 King Size + 2 Sofa Bed Queen'
  },
  495807: {
    name: "Jungle Villa Left",
    category: "Ville",
    description: "Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un'unità semi-indipendente pensata per chi vuole comfort, privacy e un'immersione autentica nella giungla.",
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Outdoor Living Room'],
    beds: '1 King Size + 1 Sofa Bed Queen'
  },
  495980: {
    name: "Jungle Villa Right",
    category: "Ville",
    description: "Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un'unità semi-indipendente pensata per chi vuole comfort, privacy e un'immersione autentica nella giungla.",
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Outdoor Living Room'],
    beds: '1 King Size + 1 Sofa Bed Queen'
  },
  495566: {
    name: "Peace & Love Villa",
    category: "Ville",
    description: "Situata di fronte alla piscina, questa villa indipendente vanta un'ampia terrazza privata e una camera principale con letto King size e divano letto Queen adattabile. Cucina interna attrezzata, bagno privato con acqua calda e TV 40\" Android TV completano ogni comfort. Perfetta per ospitare fino a quattro persone in un'atmosfera rilassata e panoramica.",
    features: ['Equipped Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Android TV'],
    beds: '1 King Size + 1 Sofa Bed Queen'
  },
  449348: {
    name: "Villa Penthouse",
    category: "Ville",
    description: "La Penthouse Villa è la sistemazione più esclusiva del villaggio, con camera padronale King size, bagno privato e salotto separato con secondo bagno e divano letto King. Una cucina outdoor, TV 40\" Android TV e un giardino privato completano lo spazio per la massima privacy. La scelta ideale per chi cerca il lusso assoluto immerso nella natura tropicale.",
    features: ['Outdoor Kitchen', 'Pool Access', 'Private Garden', '2 Bathrooms', 'Android TV'],
    beds: '1 King Size + 1 Sofa Bed King'
  },
  449385: {
    name: "Yellow Bungalow",
    category: "Bungalow",
    description: "Il Yellow Bungalow è la cupola più spaziosa del villaggio, immersa in un giardino con fiori vibranti, alberi da frutto, buceri e sunbirds. Cucina privata, soggiorno, sala pranzo, letto King, bagno caldo, frigo e ventilatore garantiscono il massimo del comfort. Un angolo dall'anima sognante, perfetto per vivere la giungla con assoluta comodità.",
    features: ['Private Kitchen', 'Hot Shower', 'Fridge', 'Fan', 'Private Dining'],
    beds: '1 King Size + 1 Extra Single'
  },
  449422: {
    name: "Red Bungalow",
    category: "Bungalow",
    description: "Il Red Bungalow a cupola è avvolto da un giardino lussureggiante con fauna tropicale da scoprire direttamente dal tuo tavolo esterno privato. Letto King, bagno caldo, frigo/bar e ventilatore offrono tutto il necessario per un soggiorno rilassante. Un'ambientazione fiabesca sospesa nella natura, capace di combinare intimità e totale riservatezza.",
    features: ['Private Garden Table', 'Hot Shower', 'Fridge/Bar', 'Fan', 'Romantic Vibe'],
    beds: '1 King Size + 1 Extra Single'
  },
  449668: {
    name: "Green Bungalow",
    category: "Bungalow",
    description: "Il Green Bungalow a cupola è immerso in un giardino di fiori e alberi da frutto, dove avvistare buceri, scoiattoli e sunbirds dal tavolo esterno è la norma. Offre letto King, bagno caldo, frigo/bar e ventilatore in un ambiente intimo e riservato. Un rifugio d'incanto che unisce atmosfera fiabesca e massimo comfort nella natura tropicale.",
    features: ['Garden Views', 'Hot Shower', 'Fridge/Bar', 'Fan', 'Fauna Watching'],
    beds: '1 King Size + 1 Extra Single'
  },
  449675: {
    name: "Camel Tent Glamping",
    category: "Tende Glamping",
    description: "Il Camel Glamping è una tenda esclusiva su piattaforma rialzata in legno, riparata da un tetto in foglie naturali per vivere la giungla in totale comfort. Offre un comodo letto, bagno privato con acqua calda e un patio con amache per il relax. L'ambiente ideale per ascoltare i suoni della foresta e disconnettersi dalla quotidianità.",
    features: ['Raised Wooden Platform', 'Private Bathroom', 'Hot Shower', 'Hammocks', 'Forest Sounds'],
    beds: '1 King Size'
  },
  449674: {
    name: "Lagoon Tent Glamping",
    category: "Tende Glamping",
    description: "Il Laguna Glamping è un'esclusiva tenda sollevata su pedana di legno, protetta da un tetto in foglie naturali per un'immersione autentica nella giungla. Offre un comodo letto e un bagno privato con acqua calda, avvolti dai suai della foresta in totale protezione. La scelta perfetta per chi vuole vivere la natura senza rinunciare al comfort essenziale.",
    features: ['Raised Wooden Platform', 'Private Bathroom', 'Hot Shower', 'Nature View', 'Thatch Roof'],
    beds: '1 King Size'
  },
  449678: {
    name: "Room 1",
    category: "The Hub Guesthouse",
    description: "La Room #1 di HUBit@ è pensata per nomadi digitali e famiglie che cercano comfort e connettività a Koh Phayam. Include letto King size, scrivania dedicata, bagno privato con acqua calda e balcone, con accesso a cucina comune e WiFi a 100 Mbps. Un rifugio elegante per lavorare e rilassarsi godendo l'autentico fascino dell'isola.",
    features: ['Dedicated Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    beds: '1 King Size + 1 Extra Single'
  },
  449684: {
    name: "Room 2",
    category: "The Hub Guesthouse",
    description: "La Room #2 di HUBit@ unisce comfort moderno e produttività con letto King size, postazione di lavoro dedicata, bagno privato e balcone privato. Cucina comune attrezzata e connessione WiFi ultra-rapida a 100 Mbps garantiscono il massimo per lo smart working. Un angolo esclusivo per famiglie e remote worker, con vista sui profili tropicali di Koh Phayam.",
    features: ['Workstation', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    beds: '1 King Size + 1 Sofa Bed King'
  },
  449699: {
    name: "Room 3",
    category: "The Hub Guesthouse",
    description: "La Room #3 di HUBit@ offre un ambiente sereno con letto King size, scrivania ergonomica e balcone privato per moments di relax a Koh Phayam. Accesso a cucina comune e area coworking con WiFi a 100 Mbps inclusi. Sistemazione perfetta per remote worker e famiglie in cerca di ispirazione e connettività affidabile.",
    features: ['Ergonomic Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    beds: '1 King Size + 1 Sofa Bed Queen'
  },
  449724: {
    name: "Room 4",
    category: "The Hub Guesthouse",
    description: "La Room #4 di HUBit@ è la scelta ideale per chi lavora da remoto e vuole vivere Koh Phayam in totale comodità. Letto King size, scrivania privata, bagno con acqua calda e balcone si uniscono all'accesso a cucina comune e WiFi a 100 Mbps. Uno spazio funzionale e accogliente che garantisce produttività e relax in egual misura.",
    features: ['Private Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    beds: '1 King Size + 1 Sofa Bed King'
  },
  449730: {
    name: "Room 5",
    category: "The Hub Guesthouse",
    description: "La Room #5 di HUBit@ è il rifugio più intimo e silenzioso, ideale per coppie o nomadi solitari che cercano concentrazione totale. Dispone di letto Queen size, scrivania, bagno con acqua calda e accesso completo all'area coworking con WiFi a 100 Mbps. Senza balcone, è uno spazio compatto ed elegante perfetto per dedicarsi interamente ai propri progetti.",
    features: ['Desk', 'Hot Shower', '100 Mbps WiFi', 'Coworking Access', 'Compact Design'],
    beds: '1 Queen Size'
  },
  449736: {
    name: "Lodge 1",
    category: "The Hub Guesthouse",
    description: "Il Lodge #1 è un appartamento premium a livelli per famiglie e digital nomad, con cucina e salotto privati ed accesso agli spazi comuni di HUBit@. Il soggiorno su piattaforma rialzata con divano letto si trasforma all'occorrenza in una seconda camera per 4 ospiti. Scendendo 5 gradini nel terrapieno posteriore si scopre la camera principale con letto King, scrivania, bagno caldo e balcone.",
    features: ['Split-Level Layout', 'Private Kitchen & Living', 'Private Balcony', 'Desk', 'Coworking Access'],
    beds: '1 King Size + 1 Sofa Bed King'
  },
  923905: {
    name: "Lodge 2",
    category: "The Hub Guesthouse",
    description: "Il Lodge #2 di HUBit@ offre un raffinato appartamento su più livelli ideale per smart worker e famiglie. Spaziose zone giorno e notte con letto King, balcone privato e postazione PC ergonomica. Accesso condiviso a coworking e cucina attrezzata con WiFi fino a 100 Mbps. Il connubio ottimale per lavoro focalizzato e vacanze rigeneranti a Koh Phayam.",
    features: ['Workstation', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    beds: '1 King Size + 1 Sofa Bed King'
  },
  449742: {
    name: "Internal Room",
    category: "The Hub Guesthouse",
    description: "Camera matrimoniale situata nel nucleo principale di HUBit@, dotata di letto King size, bagno privato con doccia ad acqua calda e connessione WiFi super rapida. L'opzione ottimale per coppie e professionisti che desiderano un appoggio riservato con tutti i benefici della struttura di coworking e della cucina condivisa.",
    features: ['Shared Kitchen', 'Hot Shower', '100 Mbps WiFi', 'Quiet Room'],
    beds: '1 King Size'
  }
};

// General information & contacts
export const RESORT_INFO = {
  name: "Flower Power Farm Village & Spa",
  shortName: "Flower Power Village",
  address: "14/32 Moo 1, Than Boun, Koh Phayam, Amphoe Muang, Ranong 85000, Thailandia",
  email: "flowerpowerphayam@gmail.com",
  phone: "+66 95 882 5573",
  phoneTh: "+66 83 451 2741",
  whatsapp: "+66 95 882 5573",
  websiteDefault: "https://flowerpower-phayam.com",
  checkInTime: "13:00 – 21:30",
  checkOutTime: "11:00",
  cancellationPolicy: "Free cancellation and full refund of your deposit up to 10 days before check-in. Within 10 days, the deposit is non-refundable."
};

// Multilingual labels dictionary
export const LABELS: Record<string, Record<string, string>> = {
  IT: {
    title: "CONFERMA UFFICIALE DI PRENOTAZIONE",
    ref: "Riferimento Prenotazione",
    issueDate: "Data di Emissione",
    guestDetails: "DETTAGLI OSPITE",
    stayDetails: "DETTAGLI SOGGIORNO",
    primaryGuest: "Ospite Principale",
    email: "Email Ospite",
    phone: "Telefono Ospite",
    totalGuests: "Ospiti Totali",
    requests: "Richieste Speciali",
    accommodation: "Alloggio",
    checkIn: "Data Check-in",
    checkOut: "Data Check-out",
    nights: "Notti Totali",
    accommodationInfo: "INFO ALLOGGIO E SERVIZI",
    type: "Tipologia",
    beds: "Configurazione Letti",
    services: "Servizi Inclusi",
    paymentsSummary: "PAGAMENTI E RIEPILOGO FINANZIARIO",
    financialSummary: "RIEPILOGO FINANZIARIO (THB)",
    totalPrice: "Prezzo Totale Soggiorno",
    depositPaid: "Acconto Pagato (30%)",
    balanceDue: "Saldo da Pagare all'Arrivo",
    remainingBalance: "Saldo Residuo",
    policyTitle: "POLITICA DI CANCELLAZIONE E PAGAMENTO",
    depositInfo: "Acconto ricevuto: 30% del totale della prenotazione.",
    balanceInfo: "Saldo residuo: da pagare all'arrivo al check-in.",
    acceptedMethods: "Metodi di pagamento accettati:",
    acceptedMethodsList: "• Contanti (Thai Baht)  |  • Wise (nessuna commissione)\n• Revolut (nessuna commissione)  |  • PayPal (+10% tariffa di gestione)",
    arrivalTitle: "INFORMAZIONI DI ARRIVO E CHECK-IN",
    checkInTimeLabel: "Orario Check-in: ",
    checkOutTimeLabel: "Orario Check-out: ",
    directionsTitle: "Come Raggiungere il Flower Power Village a Koh Phayam:",
    direction1: "1. Molo di Ranong: Raggiungi il molo Saphan Pla a Ranong town. Gli speedboat partono frequentemente per Koh Phayam (circa 40 minuti, 350 THB a persona).",
    direction2: "2. Dal Molo di Koh Phayam: Prendi un Moto Taxi (70-100 THB) o un Tuk-Tuk con sidecar (250-400 THB) e chiedi di 'Flower Power' a Buffalo Bay (Ao Khao Kwai).",
    direction3: "3. Check-in tardivo: Se prevedi di arrivare dopo le 21:00, ti preghiamo di avvisarci in anticipo via email o WhatsApp/Line (+66 95 882 5573).",
    cancellationPolicyLabel: "Politica di Cancellazione: ",
    cancellationPolicyDesc: "Cancellazione gratuita con rimborso totale del deposito fino a 10 giorni prima dell'arrivo. Oltre tale termine il deposito non è rimborsabile.",
    proofTitle: "DICHIARAZIONE UFFICIALE DI ALLOGGIO",
    proofText: "\"Il presente documento certifica che il suddetto ospite dispone di una prenotazione confermata presso il Flower Power Village per le date indicate. Questa conferma può essere utilizzata come prova dell'alloggio per motivi di viaggio o per la richiesta del visto.\"",
    
    // Email specific
    emailSubject: "Prenotazione Confermata - Flower Power Village",
    emailGreeting: "Gentile {name},",
    emailLead: "Grazie per aver scelto <strong>{resort}</strong> per il tuo soggiorno a Koh Phayam! Siamo lieti di confermare la tua prenotazione.<br><br>Abbiamo registrato correttamente la tua richiesta. La ricevuta ufficiale di pagamento (PDF) è allegata a questa email e può essere stampata o esibita come prova di alloggio alle autorità doganali o uffici immigrazione per scopi turistici o richiesta visti.",
    emailClosing: "Il nostro staff rimane a tua completa disposizione per qualsiasi necessità o domanda prima del tuo arrivo. Non esitare a contattarci via email o WhatsApp!",
    emailTeam: "Un cordiale saluto,\nIl Team di Flower Power Village"
  },
  EN: {
    title: "OFFICIAL ACCOMMODATION CONFIRMATION",
    ref: "Booking Reference",
    issueDate: "Date of Issue",
    guestDetails: "GUEST DETAILS",
    stayDetails: "STAY DETAILS",
    primaryGuest: "Primary Guest",
    email: "Guest Email",
    phone: "Guest Phone",
    totalGuests: "Total Guests",
    requests: "Special Requests",
    accommodation: "Accommodation",
    checkIn: "Check-in Date",
    checkOut: "Check-out Date",
    nights: "Total Nights",
    accommodationInfo: "ACCOMMODATION INFO & SERVICES",
    type: "Type",
    beds: "Bed Configuration",
    services: "Included Services",
    paymentsSummary: "PAYMENTS & FINANCIAL SUMMARY",
    financialSummary: "FINANCIAL SUMMARY (THB)",
    totalPrice: "Total Stay Price",
    depositPaid: "Deposit Paid (30%)",
    balanceDue: "Remaining Balance (Payable on arrival)",
    remainingBalance: "Remaining Balance",
    policyTitle: "PAYMENTS & CANCELLATION POLICY",
    depositInfo: "Deposit received: 30% of the reservation total.",
    balanceInfo: "Remaining balance: payable upon arrival at check-in.",
    acceptedMethods: "Accepted payment methods:",
    acceptedMethodsList: "• Cash (Thai Baht)  |  • Wise (no commission)\n• Revolut (no commission)  |  • PayPal (+10% fee)",
    arrivalTitle: "ARRIVAL & CHECK-IN INFORMATION",
    checkInTimeLabel: "Check-in Time: ",
    checkOutTimeLabel: "Check-out Time: ",
    directionsTitle: "How to Reach Flower Power Village on Koh Phayam:",
    direction1: "1. Ranong Pier: Head to Saphan Pla Pier in Ranong town. Speedboats leave frequently to Koh Phayam (approx. 40 minutes, 350 THB/person).",
    direction2: "2. From Koh Phayam Pier: Take a Moto Taxi (70-100 THB) or a Tuk-Tuk Sidecar (250-400 THB) and ask for 'Flower Power' at Buffalo Bay.",
    direction3: "3. Late Check-in: If you plan to arrive after 21:00, please notify us in advance via email or WhatsApp/Line (+66 95 882 5573).",
    cancellationPolicyLabel: "Cancellation Policy: ",
    cancellationPolicyDesc: "Free cancellation and full refund of your deposit up to 10 days before check-in. Within 10 days, the deposit is non-refundable.",
    proofTitle: "OFFICIAL PROOF OF ACCOMMODATION DECLARATION",
    proofText: "\"This document certifies that the above-mentioned guest has a confirmed accommodation reservation at Flower Power Village for the dates indicated above. This confirmation may be used as proof of accommodation for travel or visa application purposes.\"",
    
    // Email specific
    emailSubject: "Booking Confirmed - Flower Power Village",
    emailGreeting: "Dear {name},",
    emailLead: "Thank you for choosing <strong>{resort}</strong> for your stay in Koh Phayam! We are delighted to confirm your booking.<br><br>We have successfully registered your reservation. Your official payment receipt & confirmation PDF is attached to this email and can be printed or displayed at airport terminals or immigration offices as proof of accommodation for travel or visa application purposes.",
    emailClosing: "Our staff remains at your complete disposal for any inquiries or assistance you may need before your departure. Feel free to contact us via email or WhatsApp!",
    emailTeam: "Warm regards,\nFlower Power Village Team"
  },
  DE: {
    title: "OFFIZIELLE UNTERKUNFTSBESTÄTIGUNG",
    ref: "Buchungsreferenz",
    issueDate: "Ausstellungsdatum",
    guestDetails: "GÄSTEDETAILS",
    stayDetails: "AUFENTHALTSDETAILS",
    primaryGuest: "Hauptgast",
    email: "E-Mail des Gastes",
    phone: "Telefon des Gastes",
    totalGuests: "Gäste Gesamt",
    requests: "Besondere Wünsche",
    accommodation: "Unterkunft",
    checkIn: "Check-in Datum",
    checkOut: "Check-out Datum",
    nights: "Nächte Gesamt",
    accommodationInfo: "UNTERKUNFTSINFO & SERVICES",
    type: "Typ",
    beds: "Bettkonfiguration",
    services: "Inklusive Leistungen",
    paymentsSummary: "ZAHLUNGEN & FINANZÜBERSICHT",
    financialSummary: "FINANZÜBERSICHT (THB)",
    totalPrice: "Gesamtpreis Aufenthalt",
    depositPaid: "Anzahlung geleistet (30%)",
    balanceDue: "Restbetrag bei Anreise zu zahlen",
    remainingBalance: "Restbetrag",
    policyTitle: "ZAHLUNGS- & STORNOBEDINGUNGEN",
    depositInfo: "Erhaltene Anzahlung: 30% des Gesamtbetrags der Reservierung.",
    balanceInfo: "Restbetrag: zahlbar bei Ankunft beim Check-in.",
    acceptedMethods: "Akzeptierte Zahlungsmethoden:",
    acceptedMethodsList: "• Bargeld (Thai Baht)  |  • Wise (keine Provision)\n• Revolut (keine Provision)  |  • PayPal (+10% Bearbeitungsgebühr)",
    arrivalTitle: "ANKUNFT & CHECK-IN INFORMATIONEN",
    checkInTimeLabel: "Check-in Zeit: ",
    checkOutTimeLabel: "Check-out Zeit: ",
    directionsTitle: "So erreichen Sie das Flower Power Village auf Koh Phayam:",
    direction1: "1. Ranong Pier: Fahren Sie zum Saphan Pla Pier in Ranong Town. Schnellboote fahren regelmäßig nach Koh Phayam (ca. 40 Minuten, 350 THB/Person).",
    direction2: "2. Vom Pier Koh Phayam: Nehmen Sie ein Motorradtaxi (70-100 THB) oder ein Beiwagen-Tuk-Tuk (250-400 THB) und fragen Sie nach 'Flower Power' in Buffalo Bay.",
    direction3: "3. Später Check-in: Wenn Sie nach 21:00 Uhr anreisen, benachrichtigen Sie uns bitte im Voraus per E-Mail oder WhatsApp/Line (+66 95 882 5573).",
    cancellationPolicyLabel: "Stornierungsbedingungen: ",
    cancellationPolicyDesc: "Kostenlose Stornierung und volle Rückerstattung der Anzahlung bis zu 10 Tage vor Anreise. Innerhalb von 10 Tagen ist die Anzahlung nicht erstattbar.",
    proofTitle: "OFFIZIELLE ERKLÄRUNG ÜBER DIE UNTERKUNFT",
    proofText: "\"Dieses Dokument bestätigt, dass der oben genannte Gast eine bestätigte Unterkunft Reservierung im Flower Power Village für die angegebenen Termine hat. Diese Bestätigung kann als Unterkunftsnachweis für Reisen oder Visumanträge verwendet werden.\"",
    
    // Email specific
    emailSubject: "Buchungsbestätigung - Flower Power Village",
    emailGreeting: "Sehr geehrte(r) {name},",
    emailLead: "Vielen Dank, dass Sie sich für das <strong>{resort}</strong> für Ihren Aufenthalt auf Koh Phayam entschieden haben! Wir freuen uns, Ihre Buchung bestätigen zu können.<br><br>Wir haben Ihre Reservierung erfolgreich registriert. Ihre offizielle Zahlungsbestätigung und Buchungsbestätigung (PDF) ist dieser E-Mail beigefügt und kann ausgedruckt oder an Flughafenterminals oder Einreisebehörden als Unterkunftsnachweis für Reise- oder Visumanträge vorgelegt werden.",
    emailClosing: "Unser Team steht Ihnen vor Ihrer Abreise jederzeit gerne für Fragen oder Unterstützung zur Verfügung. Kontaktieren Sie uns gerne per E-Mail oder WhatsApp!",
    emailTeam: "Mit freundlichen Grüßen,\nIhr Flower Power Village Team"
  },
  TH: {
    title: "เอกสารยืนยันการจองที่พักอย่างเป็นทางการ",
    ref: "หมายเลขการจอง",
    issueDate: "วันที่ออกเอกสาร",
    guestDetails: "รายละเอียดผู้เข้าพัก",
    stayDetails: "รายละเอียดการเข้าพัก",
    primaryGuest: "ผู้เข้าพักหลัก",
    email: "อีเมล",
    phone: "เบอร์โทรศัพท์",
    totalGuests: "จำนวนผู้เข้าพักทั้งหมด",
    requests: "คำขอพิเศษ",
    accommodation: "ประเภทห้องพัก",
    checkIn: "วันที่เช็คอิน",
    checkOut: "วันที่เช็คเอาท์",
    nights: "จำนวนคืนทั้งหมด",
    accommodationInfo: "ข้อมูลที่พักและบริการเสริม",
    type: "ประเภท",
    beds: "ประเภทเตียง",
    services: "สิ่งอำนวยความสะดวกในห้องพัก",
    paymentsSummary: "สรุปรายละเอียดการชำระเงิน",
    financialSummary: "ข้อมูลรายละเอียดค่าใช้จ่าย (THB)",
    totalPrice: "ราคารวมทั้งหมด",
    depositPaid: "เงินมัดจำชำระแล้ว (30%)",
    balanceDue: "ยอดค้างชำระ (ชำระเมื่อเช็คอิน)",
    remainingBalance: "ยอดคงเหลือค้างชำระ",
    policyTitle: "นโยบายการชำระเงินและการยกเลิกการจอง",
    depositInfo: "มัดจำที่ได้รับ: 30% ของราคารวมทั้งหมด",
    balanceInfo: "ยอดค้างชำระ: ชำระเมื่อเช็คอินเข้าที่พัก",
    acceptedMethods: "ช่องทางการชำระเงินที่รองรับ:",
    acceptedMethodsList: "• เงินสด (เงินบาทไทย)  |  • Wise (ไม่มีค่าธรรมเนียม)\n• Revolut (ไม่มีค่าธรรมเนียม)  |  • PayPal (มีค่าธรรมเนียมเพิ่ม +10%)",
    arrivalTitle: "ข้อมูลการเดินทางและการเช็คอิน",
    checkInTimeLabel: "เวลาเช็คอิน: ",
    checkOutTimeLabel: "เวลาเช็คเอาท์: ",
    directionsTitle: "วิธีการเดินทางมายัง Flower Power Village (เกาะพยาม):",
    direction1: "1. ท่าเรือระนอง: เดินทางมายังท่าเรือสะพานปลาในตัวเมืองระนอง มีเรือสปีดโบ๊ทให้บริการไปยังเกาะพยาม (ใช้เวลาประมาณ 40 นาที ค่าโดยสาร 350 บาท/ท่าน)",
    direction2: "2. จากท่าเรือเกาะพยาม: นั่งมอเตอร์ไซค์รับจ้าง (70-100 บาท) หรือรถสามล้อพ่วงข้าง (250-400 บาท) แจ้งว่าไป 'Flower Power' ที่อ่าวเขาควาย",
    direction3: "3. การเข้าที่พักล่าช้า: หากต้องการเช็คอินหลัง 21:00 น. โปรดแจ้งล่วงหน้าทางอีเมลหรือ WhatsApp/Line (+66 95 882 5573)",
    cancellationPolicyLabel: "นโยบายการยกเลิก: ",
    cancellationPolicyDesc: "ยกเลิกฟรีและคืนเงินมัดจำเต็มจำนวนเมื่อแจ้งล่วงหน้าอย่างน้อย 10 วันก่อนวันเช็คอิน หากน้อยกว่า 10 วันจะไม่คืนเงินมัดจำ",
    proofTitle: "เอกสารรับรองการเข้าพักอย่างเป็นทางการ",
    proofText: "\"เอกสารฉบับนี้รับรองว่าผู้เข้าพักตามรายชื่อข้างต้นได้รับการยืนยันการจองที่พักที่ Flower Power Village ตามวันเวลาที่ระบุไว้ และสามารถใช้เป็นหลักฐานประกอบการเดินทางหรือยื่นขอวีซ่าได้\"",
    
    // Email specific
    emailSubject: "ยืนยันการจองที่พักของคุณ - Flower Power Village",
    emailGreeting: "เรียนคุณ {name},",
    emailLead: "ขอขอบพระคุณเป็นอย่างยิ่งที่เลือก <strong>{resort}</strong> สำหรับการพักผ่อนของคุณที่เกาะพยาม! ทางเรามีความยินดีเป็นอย่างยิ่งที่จะยืนยันการจองที่พักของคุณสำเร็จแล้ว<br><br>ข้อมูลการจองของคุณได้รับการบันทึกเรียบร้อย เอกสารยืนยันและใบเสร็จรับเงิน (PDF) ได้แนบมากับอีเมลฉบับนี้ คุณสามารถสั่งพิมพ์หรือแสดงเอกสารที่สนามบินหรือสำนักงานตรวจคนเข้าเมืองเพื่อเป็นหลักฐานยืนยันการจองที่พักในการเดินทางหรือการขอวีซ่าท่องเที่ยวได้",
    emailClosing: "ทีมงานของเราพร้อมช่วยเหลือและตอบข้อสงสัยต่าง ๆ ก่อนการเดินทางของคุณ หากมีข้อสงสัยใดเพิ่มเติมสามารถติดต่อเราได้ทางอีเมลหรือ WhatsApp ตลอดเวลา!",
    emailTeam: "ด้วยความเคารพอย่างสูง,\nทีมงาน Flower Power Village"
  }
};

// Helper to calculate nights between check-in and check-out
export function getNightsCount(checkInStr: string, checkOutStr: string): number {
  const start = new Date(checkInStr);
  const end = new Date(checkOutStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// Generate Confirmation PDF using pdfkit
export async function generateConfirmationPDF(
  metadata: any,
  octorateId: string | null,
  websiteUrl: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Retrieve language. PDF standard Helvetica only supports Western Latin glyphs.
      // So if the selected language is Thai (TH), we fall back to English (EN) for the PDF
      // to avoid character corruption/garbled boxes, while the email content is sent in Thai.
      const langCode = (metadata.lang || "EN").toUpperCase();
      const pdfLang = ["IT", "EN", "DE"].includes(langCode) ? langCode : "EN";
      const t = LABELS[pdfLang];

      const accId = Number(metadata.accommodationId);
      const roomInfo = ACCOMMODATION_DETAILS[accId];
      const roomName = roomInfo?.name || metadata.accommodationName || `Room #${accId}`;
      const roomDesc = roomInfo?.description || "";
      const roomFeatures = roomInfo?.features || [];
      
      const checkInDate = metadata.checkIn;
      const checkOutDate = metadata.checkOut;
      const nights = getNightsCount(checkInDate, checkOutDate);

      // Try loading official logo
      let logoPath = path.join(process.cwd(), "public", "FP_04_-_LOGO_OFFICIAL_HD.png");
      let hasLogo = false;
      if (fs.existsSync(logoPath)) {
        hasLogo = true;
      } else {
        // Fallback check
        const alternativePath = path.join(__dirname, "../public", "FP_04_-_LOGO_OFFICIAL_HD.png");
        if (fs.existsSync(alternativePath)) {
          logoPath = alternativePath;
          hasLogo = true;
        }
      }

      // 1. HEADER SECTION
      if (hasLogo) {
        doc.image(logoPath, 40, 25, { width: 70 });
      }

      // Structure contacts (Header Right)
      doc.fillColor("#047857").font("Helvetica-Bold").fontSize(16);
      doc.text(RESORT_INFO.name, 130, 28, { align: "right" });
      
      doc.fillColor("#4b5563").font("Helvetica").fontSize(8);
      doc.text(RESORT_INFO.address, 130, 46, { align: "right" });
      doc.text(`Email: ${RESORT_INFO.email}  |  WhatsApp/Line: ${RESORT_INFO.phone}`, 130, 58, { align: "right" });
      doc.text(`Website: ${websiteUrl}`, 130, 68, { align: "right" });

      // 2. CONFIRMATION TITLE & META INFO
      const bookingRef = octorateId || `ST-FALLBACK-${metadata.stripeSessionId?.substring(0, 10) || "UNKNOWN"}`;
      const issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      
      doc.fillColor("#111827").font("Helvetica-Bold").fontSize(13);
      doc.text(t.title, 40, 100);
      
      // Meta box (Reference & Date)
      doc.fillColor("#374151").font("Helvetica").fontSize(9);
      doc.text(`${t.ref}: `, 40, 120, { continued: true });
      doc.font("Helvetica-Bold").text(bookingRef);
      doc.font("Helvetica").text(`${t.issueDate}: `, 40, 132, { continued: true });
      doc.font("Helvetica-Bold").text(issueDate);

      // 3. MAIN GUEST & BOOKING DETAILS GRID
      const gridTop = doc.y + 15;
      
      // Draw grid container background
      const gridHeight = 135;
      doc.rect(40, gridTop, 515, gridHeight).fillAndStroke("#f9fafb", "#e5e7eb");
      
      // Write Grid Content
      doc.fillColor("#111827");
      
      // Left Column Flow
      let leftY = gridTop + 12;
      doc.font("Helvetica-Bold").fontSize(9).text(t.guestDetails, 50, leftY);
      leftY += 16;
      
      doc.font("Helvetica").fontSize(9).text(`${t.primaryGuest}: `, 50, leftY, { continued: true }).font("Helvetica-Bold").text(metadata.guestName || "-");
      leftY = doc.y + 4;
      
      doc.font("Helvetica").fontSize(9).text(`${t.email}: `, 50, leftY, { continued: true }).font("Helvetica-Bold").text(metadata.guestEmail || "-");
      leftY = doc.y + 4;
      
      doc.font("Helvetica").fontSize(9).text(`${t.phone}: `, 50, leftY, { continued: true }).font("Helvetica-Bold").text(metadata.guestPhone || "-");
      leftY = doc.y + 4;
      
      const guestsLabel = pdfLang === "IT" ? "Adulti" : pdfLang === "DE" ? "Erwachsene" : "Adult(s)";
      doc.font("Helvetica").fontSize(9).text(`${t.totalGuests}: `, 50, leftY, { continued: true }).font("Helvetica-Bold").text(`${metadata.guests || 1} ${guestsLabel}`);
      leftY = doc.y + 4;
      
      if (metadata.requests) {
        doc.font("Helvetica").fontSize(9).text(`${t.requests}: `, 50, leftY, { continued: true }).font("Helvetica-Bold").text(metadata.requests);
        leftY = doc.y + 4;
      }

      // Vertical Divider
      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(300, gridTop + 10).lineTo(300, gridTop + gridHeight - 10).stroke();

      // Right Column Flow
      let rightY = gridTop + 12;
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(9).text(t.stayDetails, 310, rightY);
      rightY += 16;
      
      doc.font("Helvetica").fontSize(9).text(`${t.accommodation}: `, 310, rightY, { continued: true }).font("Helvetica-Bold").text(roomName);
      rightY = doc.y + 4;
      
      doc.font("Helvetica").fontSize(9).text(`${t.checkIn}: `, 310, rightY, { continued: true }).font("Helvetica-Bold").text(checkInDate);
      rightY = doc.y + 4;
      
      doc.font("Helvetica").fontSize(9).text(`${t.checkOut}: `, 310, rightY, { continued: true }).font("Helvetica-Bold").text(checkOutDate);
      rightY = doc.y + 4;
      
      const nightsLabel = pdfLang === "IT" ? "Notte/i" : pdfLang === "DE" ? "Nacht/Nächte" : "Night(s)";
      doc.font("Helvetica").fontSize(9).text(`${t.nights}: `, 310, rightY, { continued: true }).font("Helvetica-Bold").text(`${nights} ${nightsLabel}`);
      rightY = doc.y + 4;
      
      const extraItems = [];
      if (metadata.extraBreakfast === "true") extraItems.push("Breakfast included");
      if (metadata.extraAC === "true") extraItems.push("Air Conditioning surcharge included");
      if (extraItems.length > 0) {
        doc.font("Helvetica").fontSize(8).fillColor("#047857").text(`Extras: ${extraItems.join(", ")}`, 310, rightY);
        rightY = doc.y + 4;
      }

      // 4. ACCOMMODATION INFORMATION
      doc.fillColor("#111827");
      let currentY = gridTop + gridHeight + 15;
      
      doc.font("Helvetica-Bold").fontSize(10).text(t.accommodationInfo, 40, currentY);
      
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(40, currentY + 13).lineTo(555, currentY + 13).stroke();
      
      currentY += 20;
      doc.font("Helvetica-Bold").fontSize(9).text(`${t.type}: `, 40, currentY, { continued: true }).font("Helvetica").text(roomInfo?.category || "Resort Room");
      if (roomInfo?.beds) {
        doc.font("Helvetica-Bold").fontSize(9).text(`  |  ${t.beds}: `, 180, currentY, { continued: true }).font("Helvetica").text(roomInfo.beds);
      }
      
      currentY = doc.y + 8;
      if (roomDesc) {
        doc.font("Helvetica").fontSize(8.5).fillColor("#4b5563").text(roomDesc, 40, currentY, { width: 515, align: "justify", lineGap: 2 });
        currentY = doc.y + 10;
      }
      
      if (roomFeatures.length > 0) {
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#111827").text(`${t.services}: `, 40, currentY, { continued: true });
        doc.font("Helvetica").fillColor("#047857").text(roomFeatures.join(" • "));
        currentY = doc.y + 15;
      }

      // 5. PAYMENTS & DEPOSIT SECTION
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(10).text(t.paymentsSummary, 40, currentY);
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(40, currentY + 13).lineTo(555, currentY + 13).stroke();
      
      currentY += 20;
      
      // Draw Price calculation Box
      const priceBoxHeight = 85;
      doc.rect(40, currentY, 240, priceBoxHeight).fillAndStroke("#fcfdfd", "#e5e7eb");
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(9).text(t.financialSummary, 48, currentY + 10);
      
      const totalPrice = Number(metadata.totalPrice || 0);
      const depositPaid = Number(metadata.depositPaid || 0);
      const balanceDue = Number(metadata.balanceDue || (totalPrice - depositPaid));

      doc.font("Helvetica").fontSize(8.5).text(`${t.totalPrice}:`, 48, currentY + 28);
      doc.font("Helvetica-Bold").text(`THB ${totalPrice.toLocaleString("en-US")}`, 160, currentY + 28, { align: "right", width: 110 });

      doc.font("Helvetica").fontSize(8.5).text(`${t.depositPaid}:`, 48, currentY + 44);
      doc.font("Helvetica-Bold").fillColor("#047857").text(`THB ${depositPaid.toLocaleString("en-US")}`, 160, currentY + 44, { align: "right", width: 110 });

      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(48, currentY + 58).lineTo(272, currentY + 58).stroke();

      doc.fillColor("#111827").font("Helvetica-Bold").fontSize(9).text(`${t.remainingBalance}:`, 48, currentY + 66);
      doc.fillColor("#b91c1c").font("Helvetica-Bold").text(`THB ${balanceDue.toLocaleString("en-US")}`, 160, currentY + 66, { align: "right", width: 110 });

      // Draw Payments rules details Box
      doc.rect(295, currentY, 260, priceBoxHeight).fillAndStroke("#f9fafb", "#e5e7eb");
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(8.5).text(t.policyTitle, 303, currentY + 10);
      
      doc.font("Helvetica").fontSize(8).fillColor("#374151");
      doc.text(t.depositInfo, 303, currentY + 24);
      doc.text(t.balanceInfo, 303, currentY + 36);
      doc.font("Helvetica-Bold").text(t.acceptedMethods, 303, currentY + 48);
      doc.font("Helvetica").text(t.acceptedMethodsList, 303, currentY + 58, { lineGap: 1 });
      
      currentY += priceBoxHeight + 15;

      // 6. ARRIVAL INFORMATION
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(10).text(t.arrivalTitle, 40, currentY);
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(40, currentY + 13).lineTo(555, currentY + 13).stroke();
      
      currentY += 20;
      
      doc.font("Helvetica-Bold").fontSize(8.5).text(t.checkInTimeLabel, 40, currentY, { continued: true })
         .font("Helvetica").text(`${RESORT_INFO.checkInTime}   |   `, { continued: true })
         .font("Helvetica-Bold").text(t.checkOutTimeLabel, { continued: true })
         .font("Helvetica").text(RESORT_INFO.checkOutTime);
      
      currentY = doc.y + 10;
      doc.font("Helvetica-Bold").fontSize(8.5).text(t.directionsTitle, 40, currentY);
      
      currentY = doc.y + 6;
      doc.font("Helvetica").fontSize(8).fillColor("#4b5563");
      doc.text(t.direction1, 40, currentY, { width: 515 });
      currentY = doc.y + 6;
      doc.text(t.direction2, 40, currentY, { width: 515 });
      currentY = doc.y + 6;
      doc.text(t.direction3, 40, currentY, { width: 515 });

      currentY = doc.y + 12;

      // 7. CANCELLATION POLICY
      if (RESORT_INFO.cancellationPolicy) {
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#b91c1c").text(t.cancellationPolicyLabel, 40, currentY, { continued: true });
        doc.font("Helvetica").fillColor("#4b5563").text(t.cancellationPolicyDesc, { width: 515 });
        currentY = doc.y + 15;
      }

      // 8. OFFICIAL VISA DECLARATION FOOTER (Centered Box at Bottom)
      doc.rect(40, 735, 515, 60).fillAndStroke("#ecfdf5", "#a7f3d0");
      doc.fillColor("#065f46").font("Helvetica-Bold").fontSize(8).text(t.proofTitle, 40, 743, { align: "center", width: 515 });
      doc.fillColor("#047857").font("Helvetica-Oblique").fontSize(8.2).text(t.proofText, 50, 756, { align: "center", width: 495, lineGap: 1 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Generate HTML email content
export function generateConfirmationEmailHTML(
  metadata: any,
  octorateId: string | null,
  websiteUrl: string
): string {
  const emailLang = (metadata.lang || "EN").toUpperCase();
  const t = LABELS[emailLang] || LABELS["EN"];

  const accId = Number(metadata.accommodationId);
  const roomInfo = ACCOMMODATION_DETAILS[accId];
  const roomName = roomInfo?.name || metadata.accommodationName || `Room #${accId}`;
  const roomDesc = roomInfo?.description || "";
  const checkInDate = metadata.checkIn;
  const checkOutDate = metadata.checkOut;
  const nights = getNightsCount(checkInDate, checkOutDate);
  const bookingRef = octorateId || `ST-FALLBACK-${metadata.stripeSessionId?.substring(0, 10) || "UNKNOWN"}`;
  
  const totalPrice = Number(metadata.totalPrice || 0);
  const depositPaid = Number(metadata.depositPaid || 0);
  const balanceDue = Number(metadata.balanceDue || (totalPrice - depositPaid));

  const includedServicesList = roomInfo?.features.map(f => `<li>${f}</li>`).join("") || "";

  // Dynamic values substitutions
  const emailGreeting = t.emailGreeting.replace("{name}", metadata.guestName || "Guest");
  const emailLead = t.emailLead.replace("{resort}", RESORT_INFO.shortName);

  const nightsLabel = emailLang === "IT" ? `${nights} notte/e` : emailLang === "DE" ? `${nights} Nacht/Nächte` : emailLang === "TH" ? `${nights} คืน` : `${nights} night(s)`;
  const guestsLabel = emailLang === "IT" ? `${metadata.guests || 1} ospite/i` : emailLang === "DE" ? `${metadata.guests || 1} Gast/Gäste` : emailLang === "TH" ? `${metadata.guests || 1} ท่าน` : `${metadata.guests || 1} guest(s)`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.emailSubject.replace("{ref}", bookingRef)}</title>
  <style>
    body {
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f4;
      color: #1c1917;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f5f5f4;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02);
      border: 1px solid #e7e5e4;
    }
    .header {
      background-color: #047857;
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 10px 0 0 0;
      font-size: 24px;
      font-weight: 300;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: bold;
      color: #111827;
      margin-top: 0;
    }
    .lead {
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .card-grid {
      background-color: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .card-title {
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #047857;
      border-bottom: 1px solid #e7e5e4;
      padding-bottom: 8px;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .grid-row {
      display: table;
      width: 100%;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .grid-row:last-child {
      margin-bottom: 0;
    }
    .grid-label {
      display: table-cell;
      font-weight: 600;
      color: #78716c;
      width: 150px;
    }
    .grid-value {
      display: table-cell;
      color: #1c1917;
      font-weight: 700;
    }
    .financials {
      background-color: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .financial-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .financial-row.total {
      border-top: 1px dashed #d6d3d1;
      padding-top: 8px;
      margin-top: 8px;
      font-weight: bold;
      font-size: 14px;
      color: #111827;
    }
    .financial-row.deposit {
      font-weight: bold;
      color: #047857;
    }
    .financial-row.balance {
      font-weight: bold;
      color: #b91c1c;
    }
    .policy-box {
      font-size: 11px;
      color: #57534e;
      line-height: 1.5;
      background-color: #fdf2f8;
      border: 1px solid #fbcfe8;
      border-radius: 8px;
      padding: 12px;
      margin-top: 10px;
    }
    .services-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #4b5563;
      line-height: 1.6;
    }
    .info-section {
      margin-bottom: 30px;
    }
    .info-section h3 {
      font-size: 15px;
      font-weight: bold;
      color: #1c1917;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px solid #e7e5e4;
      padding-bottom: 5px;
    }
    .info-section p, .info-section li {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.6;
      margin-top: 0;
    }
    .footer-declaration {
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-top: 40px;
    }
    .footer-declaration p {
      font-size: 12px;
      color: #047857;
      margin: 0;
      line-height: 1.6;
      font-style: italic;
    }
    .footer-decl-title {
      font-weight: bold;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px !important;
      font-style: normal !important;
    }
    .footer-resort-contacts {
      text-align: center;
      font-size: 11px;
      color: #78716c;
      margin-top: 30px;
      border-top: 1px solid #e7e5e4;
      padding-top: 20px;
      line-height: 1.5;
    }
    .footer-resort-contacts a {
      color: #047857;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Flower Power Village</h1>
        <div style="font-size: 12px; font-weight: 300; opacity: 0.85; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Koh Phayam, Thailand</div>
      </div>
      
      <div class="content">
        <p class="greeting">${emailGreeting}</p>
        <p class="lead">${emailLead}</p>

        <!-- BOOKING OVERVIEW -->
        <div class="card-grid">
          <h2 class="card-title">${t.title}</h2>
          <div class="grid-row">
            <div class="grid-label">${t.ref}:</div>
            <div class="grid-value" style="color: #047857;">${bookingRef}</div>
          </div>
          <div class="grid-row">
            <div class="grid-label">${t.accommodation}:</div>
            <div class="grid-value">${roomName}</div>
          </div>
          <div class="grid-row">
            <div class="grid-label">${t.checkIn}:</div>
            <div class="grid-value">${checkInDate}</div>
          </div>
          <div class="grid-row">
            <div class="grid-label">${t.checkOut}:</div>
            <div class="grid-value">${checkOutDate}</div>
          </div>
          <div class="grid-row">
            <div class="grid-label">${t.nights}:</div>
            <div class="grid-value">${nightsLabel}</div>
          </div>
          <div class="grid-row">
            <div class="grid-label">${t.totalGuests}:</div>
            <div class="grid-value">${guestsLabel}</div>
          </div>
          ${metadata.requests ? `
          <div class="grid-row" style="margin-top: 10px;">
            <div class="grid-label">${t.requests}:</div>
            <div class="grid-value" style="font-weight: normal; font-style: italic;">${metadata.requests}</div>
          </div>` : ''}
        </div>

        <!-- ROOM DESCRIPTION & SERVICES -->
        ${roomInfo ? `
        <div class="info-section">
          <h3>${t.accommodationInfo}</h3>
          <p>${roomDesc}</p>
          <p><strong>${t.beds}:</strong> ${roomInfo.beds}</p>
          <p><strong>${t.services}:</strong></p>
          <ul class="services-list">
            ${includedServicesList}
          </ul>
        </div>` : ''}

        <!-- PAYMENT AND FINANCE -->
        <div class="info-section">
          <h3>${t.paymentsSummary}</h3>
          <div class="financials">
            <div class="financial-row">
              <span style="color: #78716c;">${t.totalPrice}:</span>
              <span style="font-weight: bold;">THB ${totalPrice.toLocaleString("en-US")}</span>
            </div>
            <div class="financial-row deposit">
              <span>${t.depositPaid}:</span>
              <span>- THB ${depositPaid.toLocaleString("en-US")}</span>
            </div>
            <div class="financial-row total balance">
              <span>${t.balanceDue}:</span>
              <span>THB ${balanceDue.toLocaleString("en-US")}</span>
            </div>
          </div>

          <p><strong>${t.policyTitle}:</strong><br>
            ${t.depositInfo}<br>
            ${t.balanceInfo}<br><br>
            <strong>${t.acceptedMethods}</strong>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 13px; color: #4b5563;">
              <li>Cash (Thai Baht)</li>
              <li>Wise (no commission)</li>
              <li>Revolut (no commission)</li>
              <li>PayPal (+10% processing fee)</li>
            </ul>
          </p>

          <div class="policy-box">
            <strong>${t.cancellationPolicyLabel}</strong><br>
            ${t.cancellationPolicyDesc}
          </div>
        </div>

        <!-- ARRIVAL INSTRUCTIONS -->
        <div class="info-section">
          <h3>${t.arrivalTitle}</h3>
          <p>
            <strong>${t.checkInTimeLabel}</strong> ${RESORT_INFO.checkInTime}<br>
            <strong>${t.checkOutTimeLabel}</strong> ${RESORT_INFO.checkOutTime}
          </p>
          <p><strong>${t.directionsTitle}</strong></p>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #4b5563; line-height: 1.6;">
            <li>${t.direction1}</li>
            <li>${t.direction2}</li>
            <li>${t.direction3}</li>
          </ol>
        </div>

        <p class="lead" style="margin-top: 40px; margin-bottom: 20px;">
          ${t.emailClosing}
        </p>
        <p class="lead" style="font-weight: bold; color: #111827; margin-bottom: 0;">
          ${t.emailTeam.replace("\n", "<br>")}
        </p>

        <!-- IMMIGRATION DECLARATION -->
        <div class="footer-declaration">
          <p class="footer-decl-title">${t.proofTitle}</p>
          <p>${t.proofText}</p>
        </div>

        <!-- FOOTER CONTACTS -->
        <div class="footer-resort-contacts">
          <strong>${RESORT_INFO.name}</strong><br>
          ${RESORT_INFO.address}<br>
          Email: <a href="mailto:${RESORT_INFO.email}">${RESORT_INFO.email}</a>  |  WhatsApp/Line: ${RESORT_INFO.phone}<br>
          Website: <a href="${websiteUrl}">${websiteUrl}</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Send booking confirmation email with PDF attachment using nodemailer
export async function sendConfirmationEmail(
  metadata: any,
  octorateId: string | null,
  pdfBuffer: Buffer,
  websiteUrl: string
): Promise<void> {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT || "465";
  const smtpUser = process.env.SMTP_USER || "flowerpowerphayam@gmail.com";
  const smtpPass = process.env.SMTP_PASS || "SnookeR01";

  const emailLang = (metadata.lang || "EN").toUpperCase();
  const t = LABELS[emailLang] || LABELS["EN"];
  const bookingRef = octorateId || `ST-FALLBACK-${metadata.stripeSessionId?.substring(0, 10) || "UNKNOWN"}`;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || `"${RESORT_INFO.shortName}" <${smtpUser}>`,
    to: metadata.guestEmail,
    subject: `${t.emailSubject.replace("{ref}", bookingRef)}`,
    html: generateConfirmationEmailHTML(metadata, octorateId, websiteUrl),
    attachments: [
      {
        filename: `Flower_Power_Booking_${octorateId || "Confirmation"}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ]
  };

  console.log(`[BookingConfirm] Sending confirmation email to ${metadata.guestEmail} in language: ${emailLang}...`);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[BookingConfirm] Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error(`[BookingConfirm] Failed to send email via SMTP to ${metadata.guestEmail}:`, error);
  }
}
