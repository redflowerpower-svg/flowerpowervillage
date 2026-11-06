/**
 * Village Master Site Data - Flower Power Village (Koh Phayam)
 * 
 * Estrazione centralizzata e strutturata dei dati ufficiali del resort:
 * - 01_Alloggi_e_Capienze (caratteristiche reali, configurazione letti, sconti 10%/15%, link diretti)
 * - 02_Trasporti_e_Arrivi (Mr. Gong, voli AirAsia, speedboat, taxi, bus da Bangkok e minivan)
 * - 03_Ristorante_e_Bakery (orari continuati, colazioni à la carte, pizza forno su pietra, pasta fresca, specialità Thai)
 * - 04_Policy_e_Villaggio (A/C a consumo vs all-inclusive, soggiorno min 2 notti, divieto fuochi/tende giardino, spiaggia 150m, Wi-Fi fibra)
 */

export interface SheetRow {
  [column: string]: string | number | boolean;
}

export interface VillageMasterDataset {
  alloggi: SheetRow[];
  trasporti: SheetRow[];
  ristorante: SheetRow[];
  policy: SheetRow[];
}

export const VILLAGE_MASTER_DATA: VillageMasterDataset = {
  alloggi: [
    {
      "Alloggio": "Jungle Villa",
      "Slug": "52-jungle-villa",
      "Categoria": "VILLAS",
      "Capacità Base": 4,
      "Capacità Max": 8,
      "Configurazione Letti": "2 King Size + 2 Sofa Bed Queen",
      "Dotazioni": "2 camere, 2 bagni, 2 cucine e 2 salotti",
      "Climatizzazione": "Condizionatori portatili + Ventilatori",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/52-jungle-villa",
      "Punti di Forza": "La struttura più ampia del villaggio, ideale per 2 famiglie o grandi gruppi (4+4 persone)."
    },
    {
      "Alloggio": "Jungle Villa Left",
      "Slug": "53-jungle-villa-left",
      "Categoria": "VILLAS",
      "Capacità Base": 2,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size + 1 Sofa Bed Queen",
      "Dotazioni": "1 camera, 1 bagno, cucina e salotto privato",
      "Climatizzazione": "Condizionatore portatile + Ventilatore",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/53-jungle-villa-left",
      "Punti di Forza": "Villa su 2 piani affacciata sulla piscina per 2+2 persone."
    },
    {
      "Alloggio": "Jungle Villa Right",
      "Slug": "54-jungle-villa-right",
      "Categoria": "VILLAS",
      "Capacità Base": 2,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size + 1 Sofa Bed Queen",
      "Dotazioni": "1 camera, 1 bagno, cucina e salotto",
      "Climatizzazione": "Condizionatore portatile + Ventilatore",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/54-jungle-villa-right",
      "Punti di Forza": "Villa su 2 piani gemella di Jungle Left per 2+2 persone."
    },
    {
      "Alloggio": "Peace & Love Villa",
      "Slug": "51-villa-peace-love",
      "Categoria": "VILLAS",
      "Capacità Base": 2,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size + 1 Sofa Bed Queen",
      "Dotazioni": "1 camera, 1 bagno tropicale, cucina e salotto privato",
      "Climatizzazione": "Condizionatore portatile (1 unità) + Ventilatore",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/51-villa-peace-love",
      "Punti di Forza": "Affacciata direttamente sulla piscina con terrazza, amaca, TV 40 pollici per 2+2 persone."
    },
    {
      "Alloggio": "Villa Penthouse",
      "Slug": "22-villa-penthouse",
      "Categoria": "VILLAS",
      "Capacità Base": 4,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size + 1 Sofa Bed King",
      "Dotazioni": "2 camere, 2 bagni completi, cucina e salotto",
      "Climatizzazione": "Condizionatori portatili (2 unità, 1 per stanza) + Ventilatori",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/22-villa-penthouse",
      "Punti di Forza": "La sistemazione più esclusiva del villaggio, giardino privato, 2 bagni, Android TV, per 4 persone."
    },
    {
      "Alloggio": "Yellow Bungalow",
      "Slug": "11-yellow-bungalow",
      "Categoria": "BUNGALOWS",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size + Extra Single Bed disponibile",
      "Dotazioni": "Cucina privata e salotto tropicale",
      "Climatizzazione": "Aria condizionata fissa tradizionale + Ventilatore",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/11-yellow-bungalow",
      "Punti di Forza": "Bungalow a cupola spazioso, cucina, giardino con fiori e scoiattoli per 2+1 persone."
    },
    {
      "Alloggio": "Red Bungalow",
      "Slug": "12-red-bungalow",
      "Categoria": "BUNGALOWS",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size + Extra Single Bed disponibile",
      "Dotazioni": "Bagno tropicale open-air con doccia calda, frigo",
      "Climatizzazione": "Aria condizionata fissa tradizionale + Ventilatore",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/12-red-bungalow",
      "Punti di Forza": "Cupola in legno, tavolo privato nel giardino tropicale per 2+1 persone."
    },
    {
      "Alloggio": "Green Bungalow",
      "Slug": "13-green-bungalow",
      "Categoria": "BUNGALOWS",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size + Extra Single Bed disponibile",
      "Dotazioni": "Bagno tropicale open-air con doccia calda, frigo",
      "Climatizzazione": "Aria condizionata fissa tradizionale + Ventilatore",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/13-green-bungalow",
      "Punti di Forza": "Cupola in legno immersa tra alberi da frutto e piante tropicali per 2+1 persone."
    },
    {
      "Alloggio": "Lagoon Glamping Tent",
      "Slug": "21-lagoon-tent",
      "Categoria": "GLAMPING TENTS",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size + Extra Single Bed disponibile",
      "Dotazioni": "Bagno privato dedicato con doccia calda, deck rialzato in legno",
      "Climatizzazione": "Ventilatore ad alta potenza (NO condizionatore)",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/21-lagoon-tent",
      "Punti di Forza": "Tenda safari premium su piattaforma rialzata, contatto autentico con la natura per 2 persone."
    },
    {
      "Alloggio": "Camel Glamping Tent",
      "Slug": "23-camel-tent",
      "Categoria": "GLAMPING TENTS",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size + Extra Single Bed disponibile",
      "Dotazioni": "Bagno privato dedicato con doccia calda, patio privato con amache",
      "Climatizzazione": "Ventilatore ad alta potenza (NO condizionatore)",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/23-camel-tent",
      "Punti di Forza": "Tenda safari in legno e tessuto traspirante, amaca privata per 2 persone."
    },
    {
      "Alloggio": "Camera Interna (Budget Room)",
      "Slug": "41-room-internal",
      "Categoria": "BUDGET ROOM",
      "Capacità Base": 2,
      "Capacità Max": 2,
      "Configurazione Letti": "1 King Size",
      "Dotazioni": "Bagno privato en-suite (No acqua calda)",
      "Climatizzazione": "Ventilatore ad alta potenza (NO condizionatore, no acqua calda)",
      "Sconto": "10% Direct Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/41-room-internal",
      "Punti di Forza": "Camera in muratura silenziosa ed economica per 2 persone."
    },
    {
      "Alloggio": "Guesthouse Room 1",
      "Slug": "guesthouse-room-1",
      "Categoria": "GUESTHOUSE",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size Bed + 1 Single Size Extra bed",
      "Dotazioni": "Bagno privato con doccia, frigo",
      "Climatizzazione": "Condizionatore tradizionale fisso",
      "Sconto": "15% Pre-Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/calendar",
      "Punti di Forza": "Camera guesthouse per 2+1 persone con sconto 15% pre-booking."
    },
    {
      "Alloggio": "Guesthouse Room 2, 3, 4, 5",
      "Slug": "guesthouse-rooms-2-3-4-5",
      "Categoria": "GUESTHOUSE",
      "Capacità Base": 2,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size Bed + 1 Sofa Bed Queen Size",
      "Dotazioni": "Bagno privato, terrazzino",
      "Climatizzazione": "Condizionatore tradizionale fisso",
      "Sconto": "15% Pre-Booking Discount",
      "Link Dettagli": "https://www.flowerpowervillage.com/calendar",
      "Punti di Forza": "Camere guesthouse per 2+2 persone con sconto 15% pre-booking."
    },
    {
      "Alloggio": "Lodge 1 & Lodge 2 (Mini Apartment)",
      "Slug": "lodge-mini-apartments",
      "Categoria": "GUESTHOUSE",
      "Capacità Base": 2,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size Bed + 1 Sofa Bed King Size",
      "Dotazioni": "Mini appartamento con angolo cottura",
      "Climatizzazione": "In allestimento",
      "Sconto": "In progress - Not yet bookable",
      "Link Dettagli": "In allestimento",
      "Punti di Forza": "Nuova ala in fase di completamento (non ancora prenotabile)."
    }
  ],

  trasporti: [
    {
      "Ambito": "Voli Bangkok ↔ Ranong",
      "Dettaglio / Tratta": "Bangkok Don Mueang (DMK) ➔ Ranong Airport (UNX)",
      "Compagnia / Mezzo": "Thai AirAsia",
      "Durata": "1h 15m di volo",
      "Costi Indicativi": "Circa 1.200 - 2.500 THB a tratta in base ad anticipo",
      "Note Operative": "Voli giornalieri. L'aeroporto di Ranong dista circa 40-45 minuti d'auto dal molo degli imbarchi."
    },
    {
      "Ambito": "Transfer Aeroporto ➔ Molo",
      "Dettaglio / Tratta": "Aeroporto di Ranong ➔ Molo Speedboat (Tai Kak / Saphan Pla)",
      "Compagnia / Mezzo": "Taxi convenzionato con autista dedicato Mr. Gong",
      "Durata": "35-40 minuti",
      "Costi Indicativi": "200 THB a persona (per 2 o più persone) · 300 THB per chi viaggia solo",
      "Note Operative": "Accoglienza personalizzata con cartello con il tuo nome all'uscita del gate. Mr. Gong emette anche i biglietti della barca in anticipo ed è in contatto telefonico diretto con i capitani della speedboat per coordinare le partenze in caso di lievi ritardi del volo."
    },
    {
      "Ambito": "Speedboat Terraferma ↔ Isola",
      "Dettaglio / Tratta": "Molo di Ranong (Saphan Pla / Tai Kak) ➔ Molo di Koh Phayam",
      "Compagnia / Mezzo": "Motoscafo veloce (Speedboat)",
      "Durata": "35-40 minuti di traversata",
      "Costi Indicativi": "350 THB a persona a tratta",
      "Note Operative": "Corse frequenti ogni ora / ora e mezza dalle 08:00 alle 17:00 / 17:30 (da Ranong) e dalle 07:30 alle 16:30 (da Koh Phayam). Orari confermati giornalmente in base alle maree."
    },
    {
      "Ambito": "Arrivo al Molo di Koh Phayam",
      "Dettaglio / Tratta": "Molo di Koh Phayam ➔ Flower Power Village (Buffalo Bay)",
      "Compagnia / Mezzo": "Tuk-tuk locali o Moto-Taxi",
      "Durata": "10 minuti",
      "Costi Indicativi": "200–250 THB per veicolo",
      "Note Operative": "Troverai decine di tuk-tuk e taxi pronti all'uscita della passerella del molo. I resort non possono fare transfer con mezzi propri su strada pubblica per normative dell'isola."
    },
    {
      "Ambito": "Noleggio Scooter sull'Isola",
      "Dettaglio / Tratta": "Direttamente al Molo di Koh Phayam o tramite il resort",
      "Compagnia / Mezzo": "Scooter 110cc / 125cc",
      "Durata": "Noleggio giornaliero",
      "Costi Indicativi": "150–250 THB al giorno in base al modello e stagione",
      "Note Operative": "Sull'isola non ci sono automobili (solo scooter, biciclette e sentieri immersi nella natura). Lo scooter è il mezzo più comodo e divertente per esplorare le baie."
    },
    {
      "Ambito": "Bus da Bangkok",
      "Dettaglio / Tratta": "Bangkok Southern Bus Terminal (Sai Tai Mai) ➔ Stazione Bus Ranong",
      "Compagnia / Mezzo": "Autobus notturno o diurno Choke Anan Tour",
      "Durata": "8-9 ore",
      "Costi Indicativi": "Circa 600 - 900 THB per sedile VIP",
      "Note Operative": "I bus notturni arrivano la mattina presto a Ranong, perfetti per salire sul primo motoscafo delle 08:00 / 09:00."
    },
    {
      "Ambito": "Minivan da Phuket & Khao Lak",
      "Dettaglio / Tratta": "Phuket Bus Terminal 2 ➔ Khao Lak ➔ Ranong Bus Station",
      "Compagnia / Mezzo": "Bus di linea Rungkit Tour o minivan",
      "Durata": "4h30 - 5h da Phuket, circa 3h da Khao Lak",
      "Costi Indicativi": "Circa 300 - 450 THB",
      "Note Operative": "Partenze quotidiane regolari lungo la costa delle Andamane."
    },
    {
      "Ambito": "In Auto Propria / a Noleggio",
      "Dettaglio / Tratta": "Fino al Molo di Ranong (Saphan Pla Pier)",
      "Compagnia / Mezzo": "Auto",
      "Durata": "In base alla partenza",
      "Costi Indicativi": "Parcheggio custodito ~100 THB/giorno",
      "Note Operative": "Presso il molo è presente un parcheggio custodito e sicuro a pagamento dove lasciare l'auto durante il soggiorno a Koh Phayam."
    }
  ],

  ristorante: [
    {
      "Argomento": "Orari Ristorante & Bakery",
      "Descrizione / Valore": "Aperto tutti i giorni con orario continuato 08:00 – 21:15",
      "Dettaglio": "Servizio Colazione, Pranzo e Cena. Cucina sempre attiva."
    },
    {
      "Argomento": "Colazione all'Italiana & Bakery",
      "Descrizione / Valore": "Caffè espresso, cappuccino italiano cremoso e cornetti caldi/brioche appena sfornati",
      "Dettaglio": "La colazione è servita alla carta presso la bakery (costo tipico ~150-250 THB a persona). Non inclusa nella tariffa base delle stanze, ma disponibile ogni mattina."
    },
    {
      "Argomento": "Pizza Tradizionale Italiana",
      "Descrizione / Valore": "Autentica pizza cotta su pietra con ingredienti italiani",
      "Dettaglio": "Farine selezionate, lievitazione naturale e mozzarella di qualità, considerata tra le migliori pizze delle isole thailandesi."
    },
    {
      "Argomento": "Pasta Fresca & Cucina Italiana",
      "Descrizione / Valore": "Pasta fresca fatta a mano ogni giorno",
      "Dettaglio": "Tagliatelle, gnocchi, ravioli ripieni, condimenti tradizionali italiani, focacce e bruschette artigianali."
    },
    {
      "Argomento": "Cucina Thai & Specialità Birmane",
      "Descrizione / Valore": "Piatti tipici preparati freschi al momento con ingredienti e spezie locali",
      "Dettaglio": "Curry tradizionali, Pad Thai, pesce fresco locale, specialità birmane tradizionali."
    },
    {
      "Argomento": "Opzioni Vegane & Senza Glutine",
      "Descrizione / Valore": "Menu dedicato con ricette 100% vegetali e salutari",
      "Dettaglio": "Smoothie bowl di frutta tropicale, piatti vegani completi e opzioni su misura per intolleranze."
    }
  ],

  policy: [
    {
      "Voce": "Aria Condizionata & Piani Energetici",
      "Valore Ufficiale": "Portatili: 400฿/unità (consigliato consumo 40฿/kWh) · Fissi: 500฿/giorno",
      "Dettagli": "1) Alloggi con condizionatore PORTATILE: Peace & Love (1 unità: 400฿/giorno), Jungle Villa Left (1 unità: 400฿/giorno), Jungle Villa Right (1 unità: 400฿/giorno), Jungle Villa completa Left+Right (2 unità: 800฿/giorno), Villa Penthouse (2 unità: 800฿/giorno). PER GLI ALLOGGI CON A/C PORTATILE È VIVAMENTE CONSIGLIATO IL PAGAMENTO A CONSUMO (Pay-per-use) a 40฿ per kWh (~20฿ all'ora | ~0.50€) calcolato al checkout in base al contatore. 2) Alloggi con condizionatore FISSO TRADIZIONALE: Yellow Bungalow, Red Bungalow, Green Bungalow e Guesthouse Room 1, 2, 3, 4, 5 hanno un costo All-Inclusive di 500฿/giorno (oppure a consumo 40฿/kWh; non consigliamo una scelta specifica, l'ospite sceglie liberamente). 3) Tende Glamping (Lagoon e Camel) e Camera Interna: NESSUN condizionatore (ventilatori ad alta potenza immersi nella natura). L'elettricità a Koh Phayam è prodotta localmente ed è molto costosa."
    },
    {
      "Voce": "Soggiorno Minimo Stagionale & Regola Buchi",
      "Valore Ufficiale": "2 notti (1 apr – 30 nov) · 5 notti (1 dic – 31 mar) · Buchi intermedi prenotabili",
      "Dettagli": "In alta stagione (dal 1° Dicembre al 31 Marzo) il soggiorno minimo è di 5 notti consecutive. In bassa/media stagione (dal 1° Aprile al 30 Novembre) il soggiorno minimo è di 2 notti consecutive. ECCEZIONE BUCHI: Gli intervalli di notti rimaste isolate/libere tra due prenotazioni nel calendario possono essere prenotati anche per durate inferiori (il numero esatto di notti minime ammesse per ciascun buco è indicato direttamente all'interno delle caselle del calendario)."
    },
    {
      "Voce": "Trasparenza Assoluta sulle Disponibilità Consecutive",
      "Valore Ufficiale": "Non illudere il cliente se non ci sono notti consecutive libere per l'intero soggiorno",
      "Dettagli": "Se un ospite richiede soggiorni da 7 o 14 notti e non ci sono alloggi disponibili per l'intera durata continua, l'AI deve dichiarare con onestà ed educazione che al momento non abbiamo disponibilità consecutiva per l'intero periodo di 7–14 notti. Deve spiegare che ci sono date singole e buchi intermedi liberi e invitare a consultare la griglia interattiva del calendario live."
    },
    {
      "Voce": "Divieti nel Giardino",
      "Valore Ufficiale": "Severamente vietato accendere fuochi e campeggiare con tende nel giardino",
      "Dettagli": "Norma assoluta per la prevenzione antincendio nel villaggio immerso nella foresta e per la salvaguardia della tranquillità degli ospiti."
    },
    {
      "Voce": "Sconti Prenotazione Diretta & Long Stay (Website)",
      "Valore Ufficiale": "-10% Diretto Website · -15% oltre 14 notti (15+d) · -20% oltre 30 notti (30+d)",
      "Dettagli": "I prezzi visualizzati nelle caselle del calendario online sono le tariffe ufficiali standard (gli sconti non sono ancora visibili nel calendario). Prenotando direttamente tramite il nostro sito web (flowerpowervillage.com), al checkout vengono applicati automaticamente sconti progressivi esclusivi: 1) -10% Sconto Diretto Garantito per tutte le prenotazioni sul sito (15% pre-booking per Guesthouse); 2) -15% Sconto Long Stay per soggiorni oltre 14 giorni (15+ notti); 3) -20% Tariffa Long Stay per soggiorni oltre 30 giorni (30+ notti). Il nostro booking engine calcola automaticamente lo sconto massimo al checkout senza bisogno di coupon."
    },
    {
      "Voce": "Distanza dalla Spiaggia",
      "Valore Ufficiale": "150 metri",
      "Dettagli": "Buffalo Bay (Ao Khao Kwai) dista solo 150 metri, circa 1 o 2 minuti a piedi lungo una tranquilla stradina pianeggiante nel verde. Acque calme perfette per nuotare, tramonti mozzafiato, kayak e beach bar rilassanti."
    },
    {
      "Voce": "Connessione Internet Wi-Fi",
      "Valore Ufficiale": "Wi-Fi fibra ottica ad alta velocità",
      "Dettagli": "Copertura Wi-Fi stabile e veloce in tutti gli alloggi e nelle aree comuni del ristorante/bakery, adatta anche per lavoro da remoto e videochiamate."
    },
    {
      "Voce": "Elettricità",
      "Valore Ufficiale": "Continua 24 ore su 24",
      "Dettagli": "Energia elettrica disponibile 24/7 continua."
    },
    {
      "Voce": "Protezione Zanzare",
      "Valore Ufficiale": "Zanzariera su OGNI letto",
      "Dettagli": "Tutti gli alloggi (ville, bungalow, tende glamping e camere) sono dotati di zanzariere pulite e completamente chiuse su tutti i letti."
    },
    {
      "Voce": "Bambini & Culle",
      "Valore Ufficiale": "Bambini benvenuti · Culla 100-200 THB/notte",
      "Dettagli": "Villaggio sicuro e adatto a famiglie. Culla neonato disponibile su richiesta."
    },
    {
      "Voce": "Animali Domestici",
      "Valore Ufficiale": "Ammessi su preavviso",
      "Dettagli": "I cani e gli animali domestici sono i benvenuti previa comunicazione e accordo anticipato."
    },
    {
      "Voce": "Deposito & Modalità di Pagamento",
      "Valore Ufficiale": "30% alla prenotazione · Carta di Credito o PayPal sul nostro sito web",
      "Dettagli": "Per confermare la prenotazione diretta è richiesto un deposito pari al 30% del totale del soggiorno pagabile direttamente sul nostro sito web tramite Carta di Credito o PayPal. Il saldo del 70% può essere pagato comodamente online sul sito web o all'arrivo al check-in (Carta di Credito, PayPal o contanti THB). Il cliente può gestire l'intera prenotazione e pagamento in totale autonomia online."
    },
    {
      "Voce": "Termini di Cancellazione e Rimborso 100%",
      "Valore Ufficiale": "Rimborso totale 100% fino a 14 giorni prima del check-in",
      "Dettagli": "Il deposito del 30% è completamente e al 100% rimborsabile per qualsiasi cancellazione comunicata fino a 14 giorni prima della data di arrivo. Per cancellazioni effettuate nei 14 giorni precedenti l'arrivo, l'importo della caparra viene trattenuto."
    },
    {
      "Voce": "Soggiorno Minimo Contestuale",
      "Valore Ufficiale": "Comunicare solo il soggiorno minimo del periodo richiesto",
      "Dettagli": "Quando un cliente indica date o mesi precisi, comunicare SOLO il soggiorno minimo relativo a quel periodo specifico: 5 notti per l'Alta Stagione (1 Dic – 31 Mar, es. Gennaio) oppure 2 notti per la Bassa/Media Stagione (1 Apr – 30 Nov). Non recitare entrambi i periodi. Segnalare sempre l'eccezione delle notti isolate ('buchi') prenotabili singolarmente."
    }
  ]
};
