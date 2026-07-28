// api/_helpers/stripe.ts
import Stripe from "stripe";
var target = process.env.STRIPE_TARGET;
if (!target) {
  throw new Error(
    "FATAL: STRIPE_TARGET is not defined in the environment. Must be set to one of: IT, TH, TEST. Server execution blocked."
  );
}
var allowedTargets = ["IT", "TH", "TEST"];
if (!allowedTargets.includes(target)) {
  throw new Error(
    `FATAL: STRIPE_TARGET "${target}" is invalid. Must be set to one of: IT, TH, TEST. Server execution blocked.`
  );
}
var secretKey = "";
if (target === "IT") {
  secretKey = process.env.STRIPE_SECRET_KEY_IT || "";
} else if (target === "TH") {
  secretKey = process.env.STRIPE_SECRET_KEY_TH || "";
} else if (target === "TEST") {
  secretKey = process.env.STRIPE_SECRET_KEY_TEST || "";
}
if (!secretKey) {
  throw new Error(
    `FATAL: Stripe secret key is missing for target environment "${target}". Please set STRIPE_SECRET_KEY_${target} in your environment. Server execution blocked.`
  );
}
var stripe = new Stripe(secretKey, {
  apiVersion: "2023-10-16"
});

// api/verify-checkout-session.ts
import { createClient } from "@supabase/supabase-js";

// api/_helpers/booking-confirmation.ts
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
var ACCOMMODATION_DETAILS = {
  529784: {
    name: "Jungle Villa",
    category: "Ville",
    description: "La Jungle Villa \xE8 la struttura pi\xF9 ampia del villaggio, ideale per grandi gruppi che vogliono condividere l'esperienza. Doppie cucine, doppi salotti outdoor e due camere con letti King e divani Queen accolgono comodamente fino a otto ospiti. Due bagni privati e una splendida vista sulla piscina rendono questo soggiorno davvero indimenticabile.",
    features: ["Private Kitchen", "Pool Access", "Hot Shower", "WiFi", "Double Living Room"],
    beds: "2 King Size + 2 Sofa Bed Queen"
  },
  495807: {
    name: "Jungle Villa Left",
    category: "Ville",
    description: "Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un'unit\xE0 semi-indipendente pensata per chi vuole comfort, privacy e un'immersione autentica nella giungla.",
    features: ["Private Kitchen", "Pool Access", "Hot Shower", "WiFi", "Outdoor Living Room"],
    beds: "1 King Size + 1 Sofa Bed Queen"
  },
  495980: {
    name: "Jungle Villa Right",
    category: "Ville",
    description: "Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un'unit\xE0 semi-indipendente pensata per chi vuole comfort, privacy e un'immersione autentica nella giungla.",
    features: ["Private Kitchen", "Pool Access", "Hot Shower", "WiFi", "Outdoor Living Room"],
    beds: "1 King Size + 1 Sofa Bed Queen"
  },
  495566: {
    name: "Peace & Love Villa",
    category: "Ville",
    description: `Situata di fronte alla piscina, questa villa indipendente vanta un'ampia terrazza privata e una camera principale con letto King size e divano letto Queen adattabile. Cucina interna attrezzata, bagno privato con acqua calda e TV 40" Android TV completano ogni comfort. Perfetta per ospitare fino a quattro persone in un'atmosfera rilassata e panoramica.`,
    features: ["Equipped Kitchen", "Pool Access", "Hot Shower", "WiFi", "Android TV"],
    beds: "1 King Size + 1 Sofa Bed Queen"
  },
  449348: {
    name: "Villa Penthouse",
    category: "Ville",
    description: 'La Penthouse Villa \xE8 la sistemazione pi\xF9 esclusiva del villaggio, con camera padronale King size, bagno privato e salotto separato con secondo bagno e divano letto King. Una cucina outdoor, TV 40" Android TV e un giardino privato completano lo spazio per la massima privacy. La scelta ideale per chi cerca il lusso assoluto immerso nella natura tropicale.',
    features: ["Outdoor Kitchen", "Pool Access", "Private Garden", "2 Bathrooms", "Android TV"],
    beds: "1 King Size + 1 Sofa Bed King"
  },
  449385: {
    name: "Yellow Bungalow",
    category: "Bungalow",
    description: "Il Yellow Bungalow \xE8 la cupola pi\xF9 spaziosa del villaggio, immersa in un giardino con fiori vibranti, alberi da frutto, buceri e sunbirds. Cucina privata, soggiorno, sala pranzo, letto King, bagno caldo, frigo e ventilatore garantiscono il massimo del comfort. Un angolo dall'anima sognante, perfetto per vivere la giungla con assoluta comodit\xE0.",
    features: ["Private Kitchen", "Hot Shower", "Fridge", "Fan", "Private Dining"],
    beds: "1 King Size + 1 Extra Single"
  },
  449422: {
    name: "Red Bungalow",
    category: "Bungalow",
    description: "Il Red Bungalow a cupola \xE8 avvolto da un giardino lussureggiante con fauna tropicale da scoprire direttamente dal tuo tavolo esterno privato. Letto King, bagno caldo, frigo/bar e ventilatore offrono tutto il necessario per un soggiorno rilassante. Un'ambientazione fiabesca sospesa nella natura, capace di combinare intimit\xE0 e totale riservatezza.",
    features: ["Private Garden Table", "Hot Shower", "Fridge/Bar", "Fan", "Romantic Vibe"],
    beds: "1 King Size + 1 Extra Single"
  },
  449668: {
    name: "Green Bungalow",
    category: "Bungalow",
    description: "Il Green Bungalow a cupola \xE8 immerso in un giardino di fiori e alberi da frutto, dove avvistare buceri, scoiattoli e sunbirds dal tavolo esterno \xE8 la norma. Offre letto King, bagno caldo, frigo/bar e ventilatore in un ambiente intimo e riservato. Un rifugio d'incanto che unisce atmosfera fiabesca e massimo comfort nella natura tropicale.",
    features: ["Garden Views", "Hot Shower", "Fridge/Bar", "Fan", "Fauna Watching"],
    beds: "1 King Size + 1 Extra Single"
  },
  449675: {
    name: "Camel Tent Glamping",
    category: "Tende Glamping",
    description: "Il Camel Glamping \xE8 una tenda esclusiva su piattaforma rialzata in legno, riparata da un tetto in foglie naturali per vivere la giungla in totale comfort. Offre un comodo letto, bagno privato con acqua calda e un patio con amache per il relax. L'ambiente ideale per ascoltare i suoni della foresta e disconnettersi dalla quotidianit\xE0.",
    features: ["Raised Wooden Platform", "Private Bathroom", "Hot Shower", "Hammocks", "Forest Sounds"],
    beds: "1 King Size"
  },
  449674: {
    name: "Lagoon Tent Glamping",
    category: "Tende Glamping",
    description: "Il Laguna Glamping \xE8 un'esclusiva tenda sollevata su pedana di legno, protetta da un tetto in foglie naturali per un'immersione autentica nella giungla. Offre un comodo letto e un bagno privato con acqua calda, avvolti dai suai della foresta in totale protezione. La scelta perfetta per chi vuole vivere la natura senza rinunciare al comfort essenziale.",
    features: ["Raised Wooden Platform", "Private Bathroom", "Hot Shower", "Nature View", "Thatch Roof"],
    beds: "1 King Size"
  },
  449678: {
    name: "Room 1",
    category: "The Hub Guesthouse",
    description: "La Room #1 di HUBit@ \xE8 pensata per nomadi digitali e famiglie che cercano comfort e connettivit\xE0 a Koh Phayam. Include letto King size, scrivania dedicata, bagno privato con acqua calda e balcone, con accesso a cucina comune e WiFi a 100 Mbps. Un rifugio elegante per lavorare e rilassarsi godendo l'autentico fascino dell'isola.",
    features: ["Dedicated Desk", "Private Balcony", "Hot Shower", "100 Mbps WiFi", "Shared Kitchen"],
    beds: "1 King Size + 1 Extra Single"
  },
  449684: {
    name: "Room 2",
    category: "The Hub Guesthouse",
    description: "La Room #2 di HUBit@ unisce comfort moderno e produttivit\xE0 con letto King size, postazione di lavoro dedicata, bagno privato e balcone privato. Cucina comune attrezzata e connessione WiFi ultra-rapida a 100 Mbps garantiscono il massimo per lo smart working. Un angolo esclusivo per famiglie e remote worker, con vista sui profili tropicali di Koh Phayam.",
    features: ["Workstation", "Private Balcony", "Hot Shower", "100 Mbps WiFi", "Shared Kitchen"],
    beds: "1 King Size + 1 Sofa Bed King"
  },
  449699: {
    name: "Room 3",
    category: "The Hub Guesthouse",
    description: "La Room #3 di HUBit@ offre un ambiente sereno con letto King size, scrivania ergonomica e balcone privato per moments di relax a Koh Phayam. Accesso a cucina comune e area coworking con WiFi a 100 Mbps inclusi. Sistemazione perfetta per remote worker e famiglie in cerca di ispirazione e connettivit\xE0 affidabile.",
    features: ["Ergonomic Desk", "Private Balcony", "Hot Shower", "100 Mbps WiFi", "Shared Kitchen"],
    beds: "1 King Size + 1 Sofa Bed Queen"
  },
  449724: {
    name: "Room 4",
    category: "The Hub Guesthouse",
    description: "La Room #4 di HUBit@ \xE8 la scelta ideale per chi lavora da remoto e vuole vivere Koh Phayam in totale comodit\xE0. Letto King size, scrivania privata, bagno con acqua calda e balcone si uniscono all'accesso a cucina comune e WiFi a 100 Mbps. Uno spazio funzionale e accogliente che garantisce produttivit\xE0 e relax in egual misura.",
    features: ["Private Desk", "Private Balcony", "Hot Shower", "100 Mbps WiFi", "Shared Kitchen"],
    beds: "1 King Size + 1 Sofa Bed King"
  },
  449730: {
    name: "Room 5",
    category: "The Hub Guesthouse",
    description: "La Room #5 di HUBit@ \xE8 il rifugio pi\xF9 intimo e silenzioso, ideale per coppie o nomadi solitari che cercano concentrazione totale. Dispone di letto Queen size, scrivania, bagno con acqua calda e accesso completo all'area coworking con WiFi a 100 Mbps. Senza balcone, \xE8 uno spazio compatto ed elegante perfetto per dedicarsi interamente ai propri progetti.",
    features: ["Desk", "Hot Shower", "100 Mbps WiFi", "Coworking Access", "Compact Design"],
    beds: "1 Queen Size"
  },
  449736: {
    name: "Lodge 1",
    category: "The Hub Guesthouse",
    description: "Il Lodge #1 \xE8 un appartamento premium a livelli per famiglie e digital nomad, con cucina e salotto privati ed accesso agli spazi comuni di HUBit@. Il soggiorno su piattaforma rialzata con divano letto si trasforma all'occorrenza in una seconda camera per 4 ospiti. Scendendo 5 gradini nel terrapieno posteriore si scopre la camera principale con letto King, scrivania, bagno caldo e balcone.",
    features: ["Split-Level Layout", "Private Kitchen & Living", "Private Balcony", "Desk", "Coworking Access"],
    beds: "1 King Size + 1 Sofa Bed King"
  },
  923905: {
    name: "Lodge 2",
    category: "The Hub Guesthouse",
    description: "Il Lodge #2 di HUBit@ offre un raffinato appartamento su pi\xF9 livelli ideale per smart worker e famiglie. Spaziose zone giorno e notte con letto King, balcone privato e postazione PC ergonomica. Accesso condiviso a coworking e cucina attrezzata con WiFi fino a 100 Mbps. Il connubio ottimale per lavoro focalizzato e vacanze rigeneranti a Koh Phayam.",
    features: ["Workstation", "Private Balcony", "Hot Shower", "100 Mbps WiFi", "Shared Kitchen"],
    beds: "1 King Size + 1 Sofa Bed King"
  },
  449742: {
    name: "Internal Room",
    category: "The Hub Guesthouse",
    description: "Camera matrimoniale situata nel nucleo principale di HUBit@, dotata di letto King size, bagno privato con doccia ad acqua calda e connessione WiFi super rapida. L'opzione ottimale per coppie e professionisti che desiderano un appoggio riservato con tutti i benefici della struttura di coworking e della cucina condivisa.",
    features: ["Shared Kitchen", "Hot Shower", "100 Mbps WiFi", "Quiet Room"],
    beds: "1 King Size"
  }
};
var RESORT_INFO = {
  name: "Flower Power Farm Village & Spa",
  shortName: "Flower Power Village",
  address: "14/32 Moo 1, Than Boun, Koh Phayam, Amphoe Muang, Ranong 85000, Thailandia",
  email: "flowerpowerphayam@gmail.com",
  phone: "+66 95 882 5573",
  phoneTh: "+66 83 451 2741",
  whatsapp: "+66 95 882 5573",
  websiteDefault: "https://flowerpower-phayam.com",
  checkInTime: "13:00 \u2013 21:30",
  checkOutTime: "11:00",
  cancellationPolicy: "Free cancellation and full refund of your deposit up to 10 days before check-in. Within 10 days, the deposit is non-refundable."
};
var LABELS = {
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
    acceptedMethodsList: "\u2022 Contanti (Thai Baht)  |  \u2022 Wise (nessuna commissione)\n\u2022 Revolut (nessuna commissione)  |  \u2022 PayPal (+10% tariffa di gestione)",
    arrivalTitle: "INFORMAZIONI DI ARRIVO E CHECK-IN",
    checkInTimeLabel: "Orario Check-in: ",
    checkOutTimeLabel: "Orario Check-out: ",
    directionsTitle: "Come Raggiungere il Flower Power Village a Koh Phayam:",
    direction1: "1. Molo di Ranong: Raggiungi il molo Saphan Pla a Ranong town. Gli speedboat partono frequentemente per Koh Phayam (circa 40 minuti, 350 THB a persona).",
    direction2: "2. Dal Molo di Koh Phayam: Prendi un Moto Taxi (70-100 THB) o un Tuk-Tuk con sidecar (250-400 THB) e chiedi di 'Flower Power' a Buffalo Bay (Ao Khao Kwai).",
    direction3: "3. Check-in tardivo: Se prevedi di arrivare dopo le 21:00, ti preghiamo di avvisarci in anticipo via email o WhatsApp/Line (+66 95 882 5573).",
    cancellationPolicyLabel: "Politica di Cancellazione: ",
    cancellationPolicyDesc: "Cancellazione gratuita con rimborso totale del deposito fino a 10 giorni prima dell'arrivo. Oltre tale termine il deposito non \xE8 rimborsabile.",
    proofTitle: "DICHIARAZIONE UFFICIALE DI ALLOGGIO",
    proofText: `"Il presente documento certifica che il suddetto ospite dispone di una prenotazione confermata presso il Flower Power Village per le date indicate. Questa conferma pu\xF2 essere utilizzata come prova dell'alloggio per motivi di viaggio o per la richiesta del visto."`,
    // Email specific
    emailSubject: "Prenotazione Confermata - Flower Power Village",
    emailGreeting: "Gentile {name},",
    emailLead: "Grazie per aver scelto <strong>{resort}</strong> per il tuo soggiorno a Koh Phayam! Siamo lieti di confermare la tua prenotazione.<br><br>Abbiamo registrato correttamente la tua richiesta. La ricevuta ufficiale di pagamento (PDF) \xE8 allegata a questa email e pu\xF2 essere stampata o esibita come prova di alloggio alle autorit\xE0 doganali o uffici immigrazione per scopi turistici o richiesta visti.",
    emailClosing: "Il nostro staff rimane a tua completa disposizione per qualsiasi necessit\xE0 o domanda prima del tuo arrivo. Non esitare a contattarci via email o WhatsApp!",
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
    acceptedMethodsList: "\u2022 Cash (Thai Baht)  |  \u2022 Wise (no commission)\n\u2022 Revolut (no commission)  |  \u2022 PayPal (+10% fee)",
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
    proofText: '"This document certifies that the above-mentioned guest has a confirmed accommodation reservation at Flower Power Village for the dates indicated above. This confirmation may be used as proof of accommodation for travel or visa application purposes."',
    // Email specific
    emailSubject: "Booking Confirmed - Flower Power Village",
    emailGreeting: "Dear {name},",
    emailLead: "Thank you for choosing <strong>{resort}</strong> for your stay in Koh Phayam! We are delighted to confirm your booking.<br><br>We have successfully registered your reservation. Your official payment receipt & confirmation PDF is attached to this email and can be printed or displayed at airport terminals or immigration offices as proof of accommodation for travel or visa application purposes.",
    emailClosing: "Our staff remains at your complete disposal for any inquiries or assistance you may need before your departure. Feel free to contact us via email or WhatsApp!",
    emailTeam: "Warm regards,\nFlower Power Village Team"
  },
  DE: {
    title: "OFFIZIELLE UNTERKUNFTSBEST\xC4TIGUNG",
    ref: "Buchungsreferenz",
    issueDate: "Ausstellungsdatum",
    guestDetails: "G\xC4STEDETAILS",
    stayDetails: "AUFENTHALTSDETAILS",
    primaryGuest: "Hauptgast",
    email: "E-Mail des Gastes",
    phone: "Telefon des Gastes",
    totalGuests: "G\xE4ste Gesamt",
    requests: "Besondere W\xFCnsche",
    accommodation: "Unterkunft",
    checkIn: "Check-in Datum",
    checkOut: "Check-out Datum",
    nights: "N\xE4chte Gesamt",
    accommodationInfo: "UNTERKUNFTSINFO & SERVICES",
    type: "Typ",
    beds: "Bettkonfiguration",
    services: "Inklusive Leistungen",
    paymentsSummary: "ZAHLUNGEN & FINANZ\xDCBERSICHT",
    financialSummary: "FINANZ\xDCBERSICHT (THB)",
    totalPrice: "Gesamtpreis Aufenthalt",
    depositPaid: "Anzahlung geleistet (30%)",
    balanceDue: "Restbetrag bei Anreise zu zahlen",
    remainingBalance: "Restbetrag",
    policyTitle: "ZAHLUNGS- & STORNOBEDINGUNGEN",
    depositInfo: "Erhaltene Anzahlung: 30% des Gesamtbetrags der Reservierung.",
    balanceInfo: "Restbetrag: zahlbar bei Ankunft beim Check-in.",
    acceptedMethods: "Akzeptierte Zahlungsmethoden:",
    acceptedMethodsList: "\u2022 Bargeld (Thai Baht)  |  \u2022 Wise (keine Provision)\n\u2022 Revolut (keine Provision)  |  \u2022 PayPal (+10% Bearbeitungsgeb\xFChr)",
    arrivalTitle: "ANKUNFT & CHECK-IN INFORMATIONEN",
    checkInTimeLabel: "Check-in Zeit: ",
    checkOutTimeLabel: "Check-out Zeit: ",
    directionsTitle: "So erreichen Sie das Flower Power Village auf Koh Phayam:",
    direction1: "1. Ranong Pier: Fahren Sie zum Saphan Pla Pier in Ranong Town. Schnellboote fahren regelm\xE4\xDFig nach Koh Phayam (ca. 40 Minuten, 350 THB/Person).",
    direction2: "2. Vom Pier Koh Phayam: Nehmen Sie ein Motorradtaxi (70-100 THB) oder ein Beiwagen-Tuk-Tuk (250-400 THB) und fragen Sie nach 'Flower Power' in Buffalo Bay.",
    direction3: "3. Sp\xE4ter Check-in: Wenn Sie nach 21:00 Uhr anreisen, benachrichtigen Sie uns bitte im Voraus per E-Mail oder WhatsApp/Line (+66 95 882 5573).",
    cancellationPolicyLabel: "Stornierungsbedingungen: ",
    cancellationPolicyDesc: "Kostenlose Stornierung und volle R\xFCckerstattung der Anzahlung bis zu 10 Tage vor Anreise. Innerhalb von 10 Tagen ist die Anzahlung nicht erstattbar.",
    proofTitle: "OFFIZIELLE ERKL\xC4RUNG \xDCBER DIE UNTERKUNFT",
    proofText: '"Dieses Dokument best\xE4tigt, dass der oben genannte Gast eine best\xE4tigte Unterkunft Reservierung im Flower Power Village f\xFCr die angegebenen Termine hat. Diese Best\xE4tigung kann als Unterkunftsnachweis f\xFCr Reisen oder Visumantr\xE4ge verwendet werden."',
    // Email specific
    emailSubject: "Buchungsbest\xE4tigung - Flower Power Village",
    emailGreeting: "Sehr geehrte(r) {name},",
    emailLead: "Vielen Dank, dass Sie sich f\xFCr das <strong>{resort}</strong> f\xFCr Ihren Aufenthalt auf Koh Phayam entschieden haben! Wir freuen uns, Ihre Buchung best\xE4tigen zu k\xF6nnen.<br><br>Wir haben Ihre Reservierung erfolgreich registriert. Ihre offizielle Zahlungsbest\xE4tigung und Buchungsbest\xE4tigung (PDF) ist dieser E-Mail beigef\xFCgt und kann ausgedruckt oder an Flughafenterminals oder Einreisebeh\xF6rden als Unterkunftsnachweis f\xFCr Reise- oder Visumantr\xE4ge vorgelegt werden.",
    emailClosing: "Unser Team steht Ihnen vor Ihrer Abreise jederzeit gerne f\xFCr Fragen oder Unterst\xFCtzung zur Verf\xFCgung. Kontaktieren Sie uns gerne per E-Mail oder WhatsApp!",
    emailTeam: "Mit freundlichen Gr\xFC\xDFen,\nIhr Flower Power Village Team"
  },
  TH: {
    title: "\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23",
    ref: "\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E25\u0E02\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07",
    issueDate: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E2D\u0E2D\u0E01\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23",
    guestDetails: "\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E1C\u0E39\u0E49\u0E40\u0E02\u0E49\u0E32\u0E1E\u0E31\u0E01",
    stayDetails: "\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E1E\u0E31\u0E01",
    primaryGuest: "\u0E1C\u0E39\u0E49\u0E40\u0E02\u0E49\u0E32\u0E1E\u0E31\u0E01\u0E2B\u0E25\u0E31\u0E01",
    email: "\u0E2D\u0E35\u0E40\u0E21\u0E25",
    phone: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C",
    totalGuests: "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E1C\u0E39\u0E49\u0E40\u0E02\u0E49\u0E32\u0E1E\u0E31\u0E01\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",
    requests: "\u0E04\u0E33\u0E02\u0E2D\u0E1E\u0E34\u0E40\u0E28\u0E29",
    accommodation: "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E2B\u0E49\u0E2D\u0E07\u0E1E\u0E31\u0E01",
    checkIn: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E0A\u0E47\u0E04\u0E2D\u0E34\u0E19",
    checkOut: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E0A\u0E47\u0E04\u0E40\u0E2D\u0E32\u0E17\u0E4C",
    nights: "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E04\u0E37\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",
    accommodationInfo: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E41\u0E25\u0E30\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E40\u0E2A\u0E23\u0E34\u0E21",
    type: "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17",
    beds: "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E40\u0E15\u0E35\u0E22\u0E07",
    services: "\u0E2A\u0E34\u0E48\u0E07\u0E2D\u0E33\u0E19\u0E27\u0E22\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E30\u0E14\u0E27\u0E01\u0E43\u0E19\u0E2B\u0E49\u0E2D\u0E07\u0E1E\u0E31\u0E01",
    paymentsSummary: "\u0E2A\u0E23\u0E38\u0E1B\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E01\u0E32\u0E23\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19",
    financialSummary: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22 (THB)",
    totalPrice: "\u0E23\u0E32\u0E04\u0E32\u0E23\u0E27\u0E21\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",
    depositPaid: "\u0E40\u0E07\u0E34\u0E19\u0E21\u0E31\u0E14\u0E08\u0E33\u0E0A\u0E33\u0E23\u0E30\u0E41\u0E25\u0E49\u0E27 (30%)",
    balanceDue: "\u0E22\u0E2D\u0E14\u0E04\u0E49\u0E32\u0E07\u0E0A\u0E33\u0E23\u0E30 (\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E0A\u0E47\u0E04\u0E2D\u0E34\u0E19)",
    remainingBalance: "\u0E22\u0E2D\u0E14\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E04\u0E49\u0E32\u0E07\u0E0A\u0E33\u0E23\u0E30",
    policyTitle: "\u0E19\u0E42\u0E22\u0E1A\u0E32\u0E22\u0E01\u0E32\u0E23\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07",
    depositInfo: "\u0E21\u0E31\u0E14\u0E08\u0E33\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A: 30% \u0E02\u0E2D\u0E07\u0E23\u0E32\u0E04\u0E32\u0E23\u0E27\u0E21\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14",
    balanceInfo: "\u0E22\u0E2D\u0E14\u0E04\u0E49\u0E32\u0E07\u0E0A\u0E33\u0E23\u0E30: \u0E0A\u0E33\u0E23\u0E30\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E0A\u0E47\u0E04\u0E2D\u0E34\u0E19\u0E40\u0E02\u0E49\u0E32\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01",
    acceptedMethods: "\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E17\u0E35\u0E48\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A:",
    acceptedMethodsList: "\u2022 \u0E40\u0E07\u0E34\u0E19\u0E2A\u0E14 (\u0E40\u0E07\u0E34\u0E19\u0E1A\u0E32\u0E17\u0E44\u0E17\u0E22)  |  \u2022 Wise (\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32\u0E18\u0E23\u0E23\u0E21\u0E40\u0E19\u0E35\u0E22\u0E21)\n\u2022 Revolut (\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32\u0E18\u0E23\u0E23\u0E21\u0E40\u0E19\u0E35\u0E22\u0E21)  |  \u2022 PayPal (\u0E21\u0E35\u0E04\u0E48\u0E32\u0E18\u0E23\u0E23\u0E21\u0E40\u0E19\u0E35\u0E22\u0E21\u0E40\u0E1E\u0E34\u0E48\u0E21 +10%)",
    arrivalTitle: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E40\u0E0A\u0E47\u0E04\u0E2D\u0E34\u0E19",
    checkInTimeLabel: "\u0E40\u0E27\u0E25\u0E32\u0E40\u0E0A\u0E47\u0E04\u0E2D\u0E34\u0E19: ",
    checkOutTimeLabel: "\u0E40\u0E27\u0E25\u0E32\u0E40\u0E0A\u0E47\u0E04\u0E40\u0E2D\u0E32\u0E17\u0E4C: ",
    directionsTitle: "\u0E27\u0E34\u0E18\u0E35\u0E01\u0E32\u0E23\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07\u0E21\u0E32\u0E22\u0E31\u0E07 Flower Power Village (\u0E40\u0E01\u0E32\u0E30\u0E1E\u0E22\u0E32\u0E21):",
    direction1: "1. \u0E17\u0E48\u0E32\u0E40\u0E23\u0E37\u0E2D\u0E23\u0E30\u0E19\u0E2D\u0E07: \u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07\u0E21\u0E32\u0E22\u0E31\u0E07\u0E17\u0E48\u0E32\u0E40\u0E23\u0E37\u0E2D\u0E2A\u0E30\u0E1E\u0E32\u0E19\u0E1B\u0E25\u0E32\u0E43\u0E19\u0E15\u0E31\u0E27\u0E40\u0E21\u0E37\u0E2D\u0E07\u0E23\u0E30\u0E19\u0E2D\u0E07 \u0E21\u0E35\u0E40\u0E23\u0E37\u0E2D\u0E2A\u0E1B\u0E35\u0E14\u0E42\u0E1A\u0E4A\u0E17\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E44\u0E1B\u0E22\u0E31\u0E07\u0E40\u0E01\u0E32\u0E30\u0E1E\u0E22\u0E32\u0E21 (\u0E43\u0E0A\u0E49\u0E40\u0E27\u0E25\u0E32\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 40 \u0E19\u0E32\u0E17\u0E35 \u0E04\u0E48\u0E32\u0E42\u0E14\u0E22\u0E2A\u0E32\u0E23 350 \u0E1A\u0E32\u0E17/\u0E17\u0E48\u0E32\u0E19)",
    direction2: "2. \u0E08\u0E32\u0E01\u0E17\u0E48\u0E32\u0E40\u0E23\u0E37\u0E2D\u0E40\u0E01\u0E32\u0E30\u0E1E\u0E22\u0E32\u0E21: \u0E19\u0E31\u0E48\u0E07\u0E21\u0E2D\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E44\u0E0B\u0E04\u0E4C\u0E23\u0E31\u0E1A\u0E08\u0E49\u0E32\u0E07 (70-100 \u0E1A\u0E32\u0E17) \u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E16\u0E2A\u0E32\u0E21\u0E25\u0E49\u0E2D\u0E1E\u0E48\u0E27\u0E07\u0E02\u0E49\u0E32\u0E07 (250-400 \u0E1A\u0E32\u0E17) \u0E41\u0E08\u0E49\u0E07\u0E27\u0E48\u0E32\u0E44\u0E1B 'Flower Power' \u0E17\u0E35\u0E48\u0E2D\u0E48\u0E32\u0E27\u0E40\u0E02\u0E32\u0E04\u0E27\u0E32\u0E22",
    direction3: "3. \u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E25\u0E48\u0E32\u0E0A\u0E49\u0E32: \u0E2B\u0E32\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E40\u0E0A\u0E47\u0E04\u0E2D\u0E34\u0E19\u0E2B\u0E25\u0E31\u0E07 21:00 \u0E19. \u0E42\u0E1B\u0E23\u0E14\u0E41\u0E08\u0E49\u0E07\u0E25\u0E48\u0E27\u0E07\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E32\u0E07\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E2B\u0E23\u0E37\u0E2D WhatsApp/Line (+66 95 882 5573)",
    cancellationPolicyLabel: "\u0E19\u0E42\u0E22\u0E1A\u0E32\u0E22\u0E01\u0E32\u0E23\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01: ",
    cancellationPolicyDesc: "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E1F\u0E23\u0E35\u0E41\u0E25\u0E30\u0E04\u0E37\u0E19\u0E40\u0E07\u0E34\u0E19\u0E21\u0E31\u0E14\u0E08\u0E33\u0E40\u0E15\u0E47\u0E21\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E41\u0E08\u0E49\u0E07\u0E25\u0E48\u0E27\u0E07\u0E2B\u0E19\u0E49\u0E32\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 10 \u0E27\u0E31\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E27\u0E31\u0E19\u0E40\u0E0A\u0E47\u0E04\u0E2D\u0E34\u0E19 \u0E2B\u0E32\u0E01\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32 10 \u0E27\u0E31\u0E19\u0E08\u0E30\u0E44\u0E21\u0E48\u0E04\u0E37\u0E19\u0E40\u0E07\u0E34\u0E19\u0E21\u0E31\u0E14\u0E08\u0E33",
    proofTitle: "\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E1E\u0E31\u0E01\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23",
    proofText: '"\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E09\u0E1A\u0E31\u0E1A\u0E19\u0E35\u0E49\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E27\u0E48\u0E32\u0E1C\u0E39\u0E49\u0E40\u0E02\u0E49\u0E32\u0E1E\u0E31\u0E01\u0E15\u0E32\u0E21\u0E23\u0E32\u0E22\u0E0A\u0E37\u0E48\u0E2D\u0E02\u0E49\u0E32\u0E07\u0E15\u0E49\u0E19\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E17\u0E35\u0E48 Flower Power Village \u0E15\u0E32\u0E21\u0E27\u0E31\u0E19\u0E40\u0E27\u0E25\u0E32\u0E17\u0E35\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E44\u0E27\u0E49 \u0E41\u0E25\u0E30\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E43\u0E0A\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E22\u0E37\u0E48\u0E19\u0E02\u0E2D\u0E27\u0E35\u0E0B\u0E48\u0E32\u0E44\u0E14\u0E49"',
    // Email specific
    emailSubject: "\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13 - Flower Power Village",
    emailGreeting: "\u0E40\u0E23\u0E35\u0E22\u0E19\u0E04\u0E38\u0E13 {name},",
    emailLead: "\u0E02\u0E2D\u0E02\u0E2D\u0E1A\u0E1E\u0E23\u0E30\u0E04\u0E38\u0E13\u0E40\u0E1B\u0E47\u0E19\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E22\u0E34\u0E48\u0E07\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01 <strong>{resort}</strong> \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E1E\u0E31\u0E01\u0E1C\u0E48\u0E2D\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E17\u0E35\u0E48\u0E40\u0E01\u0E32\u0E30\u0E1E\u0E22\u0E32\u0E21! \u0E17\u0E32\u0E07\u0E40\u0E23\u0E32\u0E21\u0E35\u0E04\u0E27\u0E32\u0E21\u0E22\u0E34\u0E19\u0E14\u0E35\u0E40\u0E1B\u0E47\u0E19\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E22\u0E34\u0E48\u0E07\u0E17\u0E35\u0E48\u0E08\u0E30\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E41\u0E25\u0E49\u0E27<br><br>\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22 \u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E41\u0E25\u0E30\u0E43\u0E1A\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19 (PDF) \u0E44\u0E14\u0E49\u0E41\u0E19\u0E1A\u0E21\u0E32\u0E01\u0E31\u0E1A\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E09\u0E1A\u0E31\u0E1A\u0E19\u0E35\u0E49 \u0E04\u0E38\u0E13\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E2A\u0E31\u0E48\u0E07\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E2B\u0E23\u0E37\u0E2D\u0E41\u0E2A\u0E14\u0E07\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E17\u0E35\u0E48\u0E2A\u0E19\u0E32\u0E21\u0E1A\u0E34\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E15\u0E23\u0E27\u0E08\u0E04\u0E19\u0E40\u0E02\u0E49\u0E32\u0E40\u0E21\u0E37\u0E2D\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E1E\u0E31\u0E01\u0E43\u0E19\u0E01\u0E32\u0E23\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E01\u0E32\u0E23\u0E02\u0E2D\u0E27\u0E35\u0E0B\u0E48\u0E32\u0E17\u0E48\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27\u0E44\u0E14\u0E49",
    emailClosing: "\u0E17\u0E35\u0E21\u0E07\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E40\u0E23\u0E32\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E41\u0E25\u0E30\u0E15\u0E2D\u0E1A\u0E02\u0E49\u0E2D\u0E2A\u0E07\u0E2A\u0E31\u0E22\u0E15\u0E48\u0E32\u0E07 \u0E46 \u0E01\u0E48\u0E2D\u0E19\u0E01\u0E32\u0E23\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13 \u0E2B\u0E32\u0E01\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E2A\u0E07\u0E2A\u0E31\u0E22\u0E43\u0E14\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E40\u0E23\u0E32\u0E44\u0E14\u0E49\u0E17\u0E32\u0E07\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E2B\u0E23\u0E37\u0E2D WhatsApp \u0E15\u0E25\u0E2D\u0E14\u0E40\u0E27\u0E25\u0E32!",
    emailTeam: "\u0E14\u0E49\u0E27\u0E22\u0E04\u0E27\u0E32\u0E21\u0E40\u0E04\u0E32\u0E23\u0E1E\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E2A\u0E39\u0E07,\n\u0E17\u0E35\u0E21\u0E07\u0E32\u0E19 Flower Power Village"
  }
};
function getNightsCount(checkInStr, checkOutStr) {
  const start = new Date(checkInStr);
  const end = new Date(checkOutStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(diffTime / (1e3 * 60 * 60 * 24)));
}
async function generateConfirmationPDF(metadata, octorateId, websiteUrl) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));
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
      let logoPath = path.join(process.cwd(), "public", "FP_04_-_LOGO_OFFICIAL_HD.png");
      let hasLogo = false;
      if (fs.existsSync(logoPath)) {
        hasLogo = true;
      } else {
        const alternativePath = path.join(__dirname, "../public", "FP_04_-_LOGO_OFFICIAL_HD.png");
        if (fs.existsSync(alternativePath)) {
          logoPath = alternativePath;
          hasLogo = true;
        }
      }
      if (hasLogo) {
        doc.image(logoPath, 40, 25, { width: 70 });
      }
      doc.fillColor("#047857").font("Helvetica-Bold").fontSize(16);
      doc.text(RESORT_INFO.name, 130, 28, { align: "right" });
      doc.fillColor("#4b5563").font("Helvetica").fontSize(8);
      doc.text(RESORT_INFO.address, 130, 46, { align: "right" });
      doc.text(`Email: ${RESORT_INFO.email}  |  WhatsApp/Line: ${RESORT_INFO.phone}`, 130, 58, { align: "right" });
      doc.text(`Website: ${websiteUrl}`, 130, 68, { align: "right" });
      const bookingRef = octorateId || `ST-FALLBACK-${metadata.stripeSessionId?.substring(0, 10) || "UNKNOWN"}`;
      const issueDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      doc.fillColor("#111827").font("Helvetica-Bold").fontSize(13);
      doc.text(t.title, 40, 100);
      doc.fillColor("#374151").font("Helvetica").fontSize(9);
      doc.text(`${t.ref}: `, 40, 120, { continued: true });
      doc.font("Helvetica-Bold").text(bookingRef);
      doc.font("Helvetica").text(`${t.issueDate}: `, 40, 132, { continued: true });
      doc.font("Helvetica-Bold").text(issueDate);
      const gridTop = doc.y + 15;
      const gridHeight = 135;
      doc.rect(40, gridTop, 515, gridHeight).fillAndStroke("#f9fafb", "#e5e7eb");
      doc.fillColor("#111827");
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
      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(300, gridTop + 10).lineTo(300, gridTop + gridHeight - 10).stroke();
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
      const nightsLabel = pdfLang === "IT" ? "Notte/i" : pdfLang === "DE" ? "Nacht/N\xE4chte" : "Night(s)";
      doc.font("Helvetica").fontSize(9).text(`${t.nights}: `, 310, rightY, { continued: true }).font("Helvetica-Bold").text(`${nights} ${nightsLabel}`);
      rightY = doc.y + 4;
      const extraItems = [];
      if (metadata.extraBreakfast === "true") extraItems.push("Breakfast included");
      if (metadata.extraAC === "true") extraItems.push("Air Conditioning surcharge included");
      if (extraItems.length > 0) {
        doc.font("Helvetica").fontSize(8).fillColor("#047857").text(`Extras: ${extraItems.join(", ")}`, 310, rightY);
        rightY = doc.y + 4;
      }
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
        doc.font("Helvetica").fillColor("#047857").text(roomFeatures.join(" \u2022 "));
        currentY = doc.y + 15;
      }
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(10).text(t.paymentsSummary, 40, currentY);
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(40, currentY + 13).lineTo(555, currentY + 13).stroke();
      currentY += 20;
      const priceBoxHeight = 85;
      doc.rect(40, currentY, 240, priceBoxHeight).fillAndStroke("#fcfdfd", "#e5e7eb");
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(9).text(t.financialSummary, 48, currentY + 10);
      const totalPrice = Number(metadata.totalPrice || 0);
      const depositPaid = Number(metadata.depositPaid || 0);
      const balanceDue = Number(metadata.balanceDue || totalPrice - depositPaid);
      doc.font("Helvetica").fontSize(8.5).text(`${t.totalPrice}:`, 48, currentY + 28);
      doc.font("Helvetica-Bold").text(`THB ${totalPrice.toLocaleString("en-US")}`, 160, currentY + 28, { align: "right", width: 110 });
      doc.font("Helvetica").fontSize(8.5).text(`${t.depositPaid}:`, 48, currentY + 44);
      doc.font("Helvetica-Bold").fillColor("#047857").text(`THB ${depositPaid.toLocaleString("en-US")}`, 160, currentY + 44, { align: "right", width: 110 });
      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(48, currentY + 58).lineTo(272, currentY + 58).stroke();
      doc.fillColor("#111827").font("Helvetica-Bold").fontSize(9).text(`${t.remainingBalance}:`, 48, currentY + 66);
      doc.fillColor("#b91c1c").font("Helvetica-Bold").text(`THB ${balanceDue.toLocaleString("en-US")}`, 160, currentY + 66, { align: "right", width: 110 });
      doc.rect(295, currentY, 260, priceBoxHeight).fillAndStroke("#f9fafb", "#e5e7eb");
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(8.5).text(t.policyTitle, 303, currentY + 10);
      doc.font("Helvetica").fontSize(8).fillColor("#374151");
      doc.text(t.depositInfo, 303, currentY + 24);
      doc.text(t.balanceInfo, 303, currentY + 36);
      doc.font("Helvetica-Bold").text(t.acceptedMethods, 303, currentY + 48);
      doc.font("Helvetica").text(t.acceptedMethodsList, 303, currentY + 58, { lineGap: 1 });
      currentY += priceBoxHeight + 15;
      doc.fillColor("#111827");
      doc.font("Helvetica-Bold").fontSize(10).text(t.arrivalTitle, 40, currentY);
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(40, currentY + 13).lineTo(555, currentY + 13).stroke();
      currentY += 20;
      doc.font("Helvetica-Bold").fontSize(8.5).text(t.checkInTimeLabel, 40, currentY, { continued: true }).font("Helvetica").text(`${RESORT_INFO.checkInTime}   |   `, { continued: true }).font("Helvetica-Bold").text(t.checkOutTimeLabel, { continued: true }).font("Helvetica").text(RESORT_INFO.checkOutTime);
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
      if (RESORT_INFO.cancellationPolicy) {
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#b91c1c").text(t.cancellationPolicyLabel, 40, currentY, { continued: true });
        doc.font("Helvetica").fillColor("#4b5563").text(t.cancellationPolicyDesc, { width: 515 });
        currentY = doc.y + 15;
      }
      doc.rect(40, 735, 515, 60).fillAndStroke("#ecfdf5", "#a7f3d0");
      doc.fillColor("#065f46").font("Helvetica-Bold").fontSize(8).text(t.proofTitle, 40, 743, { align: "center", width: 515 });
      doc.fillColor("#047857").font("Helvetica-Oblique").fontSize(8.2).text(t.proofText, 50, 756, { align: "center", width: 495, lineGap: 1 });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
function generateConfirmationEmailHTML(metadata, octorateId, websiteUrl) {
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
  const balanceDue = Number(metadata.balanceDue || totalPrice - depositPaid);
  const includedServicesList = roomInfo?.features.map((f) => `<li>${f}</li>`).join("") || "";
  const emailGreeting = t.emailGreeting.replace("{name}", metadata.guestName || "Guest");
  const emailLead = t.emailLead.replace("{resort}", RESORT_INFO.shortName);
  const nightsLabel = emailLang === "IT" ? `${nights} notte/e` : emailLang === "DE" ? `${nights} Nacht/N\xE4chte` : emailLang === "TH" ? `${nights} \u0E04\u0E37\u0E19` : `${nights} night(s)`;
  const guestsLabel = emailLang === "IT" ? `${metadata.guests || 1} ospite/i` : emailLang === "DE" ? `${metadata.guests || 1} Gast/G\xE4ste` : emailLang === "TH" ? `${metadata.guests || 1} \u0E17\u0E48\u0E32\u0E19` : `${metadata.guests || 1} guest(s)`;
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
          </div>` : ""}
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
        </div>` : ""}

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
async function sendConfirmationEmail(metadata, octorateId, pdfBuffer, websiteUrl) {
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
      pass: smtpPass
    }
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

// api/verify-checkout-session.ts
import * as https from "https";
function httpsPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const payload = JSON.stringify(body);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...headers
      },
      timeout: 2e4
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => resolve({ status: res.statusCode || 0, body: data }));
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Octorate request timed out after 20s"));
    });
    req.write(payload);
    req.end();
  });
}
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
var supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
var OCTORATE_STRUCTURE_ID = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(450).json({ error: "Method not allowed" });
  }
  const { session_id } = req.query;
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid session_id parameter" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.status(400).json({
        paid: false,
        error: "Session is not paid yet",
        status: session.payment_status
      });
    }
    const {
      accommodationId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      extraBreakfast,
      extraAC,
      totalPrice,
      depositPaid,
      balanceDue
    } = session.metadata || {};
    if (!accommodationId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(422).json({
        paid: true,
        error: "Session paid but booking metadata is incomplete or missing in Stripe session",
        metadata: session.metadata
      });
    }
    if (session.metadata?.emailSent === "true") {
      console.log(`[Verify API] Session ${session.id} already verified and emailed. Returning cached reservation.`);
      return res.status(200).json({
        paid: true,
        stripeSessionId: session.id,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
        octorateReservationId: session.metadata.octorateReservationId || null,
        octorateStatus: session.metadata.octorateReservationId ? "confirmed" : null,
        bookingData: {
          accommodationId: Number(accommodationId),
          checkIn,
          checkOut,
          guests: Number(guests),
          guestName,
          guestEmail,
          guestPhone,
          extraBreakfast: extraBreakfast === "true",
          extraAC: extraAC === "true",
          totalPrice: Number(totalPrice)
        }
      });
    }
    let octorateReservationId = null;
    let octorateStatus = null;
    let octorateError = null;
    try {
      const { data: tokenData } = await supabase.from("octorate_tokens").select("access_token, refresh_token").eq("id", "singleton").maybeSingle();
      if (tokenData?.access_token) {
        const OCTORATE_API_BASE = "https://api.octorate.com/connect/rest/v1";
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const [givenName, ...lastNameParts] = (guestName || "Guest Guest").split(" ");
        const familyName = lastNameParts.join(" ") || "Guest";
        const totalGuest = Number(guests || 1);
        const guestsList = [{
          type: "BOOKER",
          givenName,
          familyName,
          email: guestEmail || "",
          phone: guestPhone || "",
          checkin: checkIn,
          checkout: checkOut,
          sex: "MALE"
        }];
        const sessionSuffix = session.id.replace(/^cs_test_|^cs_/, "");
        const refer = (Date.now().toString(36).substring(0, 8) + sessionSuffix.slice(-17)).substring(0, 25);
        const depositPaidAmt = Number(depositPaid || 0);
        const balanceDueAmt = Number(balanceDue || 0);
        const stayNights = Number(session.metadata?.nights || 0);
        const discountPct = Number(session.metadata?.discountPercent || 0);
        const hasAC = extraAC === "true";
        const hasBreakfast = extraBreakfast === "true";
        const numGuests = Number(guests || 1);
        const breakfastCount = hasBreakfast ? numGuests * stayNights : 0;
        let discountLine = "";
        if (discountPct >= 20) {
          discountLine = `| Discount Applied    : -20% (Long-Stay Coliving \u2265 30 nights)`;
        } else if (discountPct >= 15) {
          discountLine = `| Discount Applied    : -15% (Medium-Stay \u2265 15 nights)`;
        } else if (discountPct > 0) {
          discountLine = `| Discount Applied    : -10% (Direct Booking Price)`;
        } else {
          discountLine = `| Discount Applied    : None`;
        }
        const privateNotes = [
          `=== FLOWER POWER VILLAGE \u2014 BOOKING SUMMARY ===`,
          `| Stripe Session      : ${session.id}`,
          `| Total Amount        : \u0E3F${Number(totalPrice || 0).toLocaleString("en")}`,
          `| Deposit Paid (30%)  : \u0E3F${depositPaidAmt.toLocaleString("en")} (charged via Stripe)`,
          `| Balance Due (70%)   : \u0E3F${balanceDueAmt.toLocaleString("en")} (to be paid at check-in)`,
          `| Stay                : ${stayNights} night${stayNights !== 1 ? "s" : ""} (${checkIn} \u2192 ${checkOut})`,
          discountLine,
          `| Air Conditioning    : ${hasAC ? "YES \u2014 AC surcharge included" : "No"}`,
          `| Breakfast           : ${hasBreakfast ? `YES \u2014 ${breakfastCount} breakfast${breakfastCount !== 1 ? "s" : ""} (${numGuests} guest${numGuests !== 1 ? "s" : ""} \xD7 ${stayNights} night${stayNights !== 1 ? "s" : ""})` : "No"}`,
          `===============================================`
        ].join("\n");
        const reservationBody = {
          status: "CONFIRMED",
          refer,
          channelId: 233,
          // Octorate direct booking channel (confirmed working via test)
          product: Number(accommodationId),
          // The Octorate product ID (= accommodationId = ratePlan)
          checkin: `${checkIn}T14:00:00Z`,
          checkout: `${checkOut}T12:00:00Z`,
          createTime: now,
          updateTime: now,
          guests: guestsList,
          roomGross: Number(totalPrice),
          totalGuest,
          totalChildren: 0,
          totalInfants: 0,
          privateNotes
        };
        console.log("[Verify API] Posting to Octorate:", `${OCTORATE_API_BASE}/reservation/${OCTORATE_STRUCTURE_ID}`);
        console.log("[Verify API] checkIn:", checkIn, "| checkOut:", checkOut, "| accommodationId:", accommodationId, "| totalPrice:", totalPrice);
        console.log("[Verify API] Payload (sanitized):", JSON.stringify({
          ...reservationBody,
          guests: [{ type: "BOOKER", givenName: "***", familyName: "***", email: "***", phone: "***", checkin: checkIn, checkout: checkOut, sex: "MALE" }]
        }, null, 2));
        console.log("[Verify API] channelId:", reservationBody.channelId, "| refer:", refer);
        let currentToken = tokenData.access_token;
        const httpsPostForm = (url, params, hdrs = {}) => new Promise((resolve, reject) => {
          const payload = new URLSearchParams(params).toString();
          const parsed = new URL(url);
          const req2 = https.request({
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(payload), ...hdrs },
            timeout: 15e3
          }, (res2) => {
            let d = "";
            res2.on("data", (c) => d += c);
            res2.on("end", () => resolve({ status: res2.statusCode || 0, body: d }));
          });
          req2.on("error", reject);
          req2.on("timeout", () => req2.destroy(new Error("refresh token timeout")));
          req2.write(payload);
          req2.end();
        });
        let octRaw = await httpsPost(`${OCTORATE_API_BASE}/reservation/${OCTORATE_STRUCTURE_ID}`, reservationBody, { "Authorization": `Bearer ${currentToken}` });
        console.log("[Verify API] Octorate initial response status:", octRaw.status);
        if (octRaw.status === 401 && tokenData.refresh_token) {
          console.log("[Verify API] 401 - Octorate token expired, attempting refresh...");
          const refreshRaw = await httpsPostForm(`${OCTORATE_API_BASE}/identity/refresh`, {
            grant_type: "refresh_token",
            refresh_token: tokenData.refresh_token,
            client_id: process.env.VITE_OCTORATE_CLIENT_ID || "",
            client_secret: process.env.VITE_OCTORATE_SECRET_KEY || ""
          });
          if (refreshRaw.status >= 200 && refreshRaw.status < 300) {
            const newTokens = JSON.parse(refreshRaw.body);
            console.log("[Verify API] Refresh successful, new token starts with:", String(newTokens.access_token).substring(0, 10));
            currentToken = newTokens.access_token;
            await supabase.from("octorate_tokens").upsert({
              id: "singleton",
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token || tokenData.refresh_token,
              expires_in: newTokens.expires_in,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            octRaw = await httpsPost(`${OCTORATE_API_BASE}/reservation/${OCTORATE_STRUCTURE_ID}`, reservationBody, { "Authorization": `Bearer ${currentToken}` });
            console.log("[Verify API] Octorate retry response status:", octRaw.status);
          } else {
            console.error("[Verify API] Token refresh FAILED:", refreshRaw.status, refreshRaw.body);
          }
        }
        if (octRaw.status >= 200 && octRaw.status < 300) {
          const octData = JSON.parse(octRaw.body);
          octorateReservationId = String(octData.id || octData.reservationId || "") || null;
          octorateStatus = "confirmed";
          console.log(`[Verify API] Octorate reservation created: ${octorateReservationId}`);
          if (octorateReservationId) {
            const depositAmount = depositPaid ? Number(depositPaid) : Math.round(Number(totalPrice || 0) * 0.3);
            const paymentBody = {
              paymentMode: "CREDITCARD",
              referenceTime: (/* @__PURE__ */ new Date()).toISOString(),
              amount: depositAmount,
              transaction: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
              description: `Caparra 30% pagata via Stripe - Session: ${session.id}`,
              status: "NORMAL"
            };
            try {
              console.log(`[Verify API] Registering deposit payment of \u0E3F${depositAmount} in Octorate for reservation ${octorateReservationId}...`);
              const payRaw = await httpsPost(
                `${OCTORATE_API_BASE}/reservation/${OCTORATE_STRUCTURE_ID}/${octorateReservationId}/payment`,
                paymentBody,
                { "Authorization": `Bearer ${currentToken}` }
              );
              if (payRaw.status >= 200 && payRaw.status < 300) {
                console.log(`[Verify API] Octorate deposit payment successfully registered.`);
              } else {
                console.warn(`[Verify API] Failed to register deposit payment in Octorate:`, payRaw.status, payRaw.body);
              }
            } catch (payErr) {
              console.error(`[Verify API] Error registering Octorate payment:`, payErr);
            }
          }
        } else {
          octorateError = `Octorate API error (${octRaw.status}): ${octRaw.body}`;
          console.error(`[Verify API] ${octorateError}`);
        }
      } else {
        console.log("[Verify API] No Octorate tokens found \u2014 skipping Octorate reservation.");
        octorateError = "Octorate non connesso. La prenotazione \xE8 registrata solo su Stripe.";
      }
    } catch (octErr) {
      octorateError = `Octorate error: ${octErr.message}`;
      console.error("[Verify API] Octorate reservation error:", octErr);
    }
    try {
      const websiteUrl = session.success_url ? new URL(session.success_url).origin : "https://flowerpower-phayam.com";
      console.log(`[Verify API] Generating PDF and sending email for session ${session.id}...`);
      const pdfBuffer = await generateConfirmationPDF(session.metadata, octorateReservationId, websiteUrl);
      await sendConfirmationEmail(session.metadata, octorateReservationId, pdfBuffer, websiteUrl);
      console.log(`[Verify API] Updating Stripe Checkout Session ${session.id} metadata...`);
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          emailSent: "true",
          octorateReservationId: octorateReservationId || ""
        }
      });
    } catch (emailErr) {
      console.error("[Verify API] Confirmation email / Stripe metadata update failed:", emailErr);
    }
    return res.status(200).json({
      paid: true,
      stripeSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
      octorateReservationId,
      octorateStatus,
      octorateError,
      bookingData: {
        accommodationId: Number(accommodationId),
        checkIn,
        checkOut,
        guests: Number(guests),
        guestName,
        guestEmail,
        guestPhone,
        extraBreakfast: extraBreakfast === "true",
        extraAC: extraAC === "true",
        totalPrice: Number(totalPrice)
      }
    });
  } catch (error) {
    console.error("[Stripe API] Checkout session verification failed:", error);
    return res.status(500).json({ error: error.message || "Failed to verify checkout session" });
  }
}
export {
  handler as default
};
