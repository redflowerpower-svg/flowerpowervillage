/**
 * Village Master Site Data - Flower Power Village (Koh Phayam)
 * 
 * Estrazione centralizzata e strutturata dei dati ufficiali del sito:
 * - 01_Alloggi_e_Capienze (da accommodationsService.ts e ROOM_METADATA)
 * - 02_Trasporti_e_Arrivi (da DirectionsSection.tsx: Mr. Gong, voli, speedboat, taxi, bus)
 * - 03_Ristorante_e_Bakery (da RestaurantSection.tsx: orari, bakery, colazioni, pizza, Thai)
 * - 04_Policy_e_Villaggio (distanza 150m, Wi-Fi, elettricità 24h, culle, cancellazioni)
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
      "Alloggio": "Villa Penthouse",
      "Slug": "villa-penthouse",
      "Categoria": "VILLE",
      "Capacità Base": 4,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size + 1 Sofa Bed King",
      "Climatizzazione": "Aria Condizionata + Ventilatori",
      "Bagni": "2 Bagni privati con acqua calda (1 padronale + 1 salotto)",
      "Zanzariere": "Presenti su tutti i letti",
      "Cucina": "Cucina outdoor privata attrezzata",
      "Punti di Forza": "La sistemazione più esclusiva del villaggio, giardino privato, 2 bagni completi, Android TV 40 pollici, massima privacy."
    },
    {
      "Alloggio": "Peace & Love Villa",
      "Slug": "peace-love-villa",
      "Categoria": "VILLE",
      "Capacità Base": 4,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size + 1 Sofa Bed Queen",
      "Climatizzazione": "Aria Condizionata + Ventilatori",
      "Bagni": "1 Bagno privato con doccia calda e design tropicale",
      "Zanzariere": "Presenti su tutti i letti",
      "Cucina": "Cucina interna attrezzata",
      "Punti di Forza": "Affacciata direttamente sulla piscina, ampia terrazza privata con amaca, Android TV 40 pollici, ideale per famiglie o coppie."
    },
    {
      "Alloggio": "Jungle Villa",
      "Slug": "jungle-villa",
      "Categoria": "VILLE",
      "Capacità Base": 8,
      "Capacità Max": 8,
      "Configurazione Letti": "2 King Size + 2 Sofa Bed Queen",
      "Climatizzazione": "Aria Condizionata + Ventilatori",
      "Bagni": "2 Bagni privati",
      "Zanzariere": "Presenti su tutti i letti",
      "Cucina": "Doppia cucina privata attrezzata",
      "Punti di Forza": "La struttura più ampia del villaggio, doppi salotti outdoor, piscina di fronte, perfetta per 2 famiglie o grandi gruppi."
    },
    {
      "Alloggio": "Jungle Villa Left",
      "Slug": "jungle-villa-left",
      "Categoria": "VILLE",
      "Capacità Base": 4,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size + 1 Sofa Bed Queen",
      "Climatizzazione": "Aria Condizionata + Ventilatori",
      "Bagni": "1 Bagno privato al piano terra",
      "Zanzariere": "Presenti su tutti i letti",
      "Cucina": "Cucina privata e zona pranzo al piano terra",
      "Punti di Forza": "Villa su 2 piani, salotto outdoor al secondo piano affacciato sulla piscina, ottima privacy e comfort."
    },
    {
      "Alloggio": "Jungle Villa Right",
      "Slug": "jungle-villa-right",
      "Categoria": "VILLE",
      "Capacità Base": 4,
      "Capacità Max": 4,
      "Configurazione Letti": "1 King Size + 1 Sofa Bed Queen",
      "Climatizzazione": "Aria Condizionata + Ventilatori",
      "Bagni": "1 Bagno privato al piano terra",
      "Zanzariere": "Presenti su tutti i letti",
      "Cucina": "Cucina privata e zona pranzo al piano terra",
      "Punti di Forza": "Villa su 2 piani affiancata a Jungle Left, ideale per coppie di amici o famiglie che viaggiano insieme."
    },
    {
      "Alloggio": "Yellow Bungalow",
      "Slug": "yellow-bungalow",
      "Categoria": "BUNGALOW",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size + 1 Letto Singolo extra",
      "Climatizzazione": "Ventilatore a soffitto ad alta potenza",
      "Bagni": "1 Bagno privato open-air tropicale con doccia calda",
      "Zanzariere": "Presenti su tutti i letti",
      "Cucina": "Cucina privata e sala da pranzo",
      "Punti di Forza": "Bungalow a cupola più spazioso del villaggio, frigorifero, giardino di fiori con avvistamento buceri e scoiattoli."
    },
    {
      "Alloggio": "Red Bungalow",
      "Slug": "red-bungalow",
      "Categoria": "BUNGALOW",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size + 1 Letto Singolo extra",
      "Climatizzazione": "Ventilatore a soffitto ad alta potenza",
      "Bagni": "1 Bagno privato open-air tropicale con doccia calda",
      "Zanzariere": "Presenti su tutti i letti",
      "Cucina": "Frigo-bar privato",
      "Punti di Forza": "Bungalow a cupola in legno, tavolo esterno privato nel giardino fiorito, adiacente allo Yellow Bungalow."
    },
    {
      "Alloggio": "Green Bungalow",
      "Slug": "green-bungalow",
      "Categoria": "BUNGALOW",
      "Capacità Base": 2,
      "Capacità Max": 3,
      "Configurazione Letti": "1 King Size + 1 Letto Singolo extra",
      "Climatizzazione": "Ventilatore a soffitto ad alta potenza",
      "Bagni": "1 Bagno privato open-air tropicale con doccia calda",
      "Zanzariere": "Presenti su tutti i letti",
      "Cucina": "Frigo-bar privato",
      "Punti di Forza": "Cupola in legno immersa nella natura tra alberi da frutto e piante tropicali, atmosfera autentica da eco-lodge."
    },
    {
      "Alloggio": "Camel Glamping Tent",
      "Slug": "camel-tent-bungalow",
      "Categoria": "TENDE GLAMPING",
      "Capacità Base": 2,
      "Capacità Max": 2,
      "Configurazione Letti": "1 Letto King Size",
      "Climatizzazione": "Ventilatore ad alta potenza",
      "Bagni": "Bagno privato dedicato con doccia calda",
      "Zanzariere": "Zanzariera integrale sulla tenda e sul letto",
      "Cucina": "Nessuna (Ristorante e Bakery a 30 secondi a piedi)",
      "Punti di Forza": "Tenda safari montata su piattaforma rialzata in legno protetta da tetto in foglie naturali, patio privato con amache."
    },
    {
      "Alloggio": "Lagoon Glamping Tent",
      "Slug": "lagoon-tent-bungalow",
      "Categoria": "TENDE GLAMPING",
      "Capacità Base": 2,
      "Capacità Max": 2,
      "Configurazione Letti": "1 Letto King Size",
      "Climatizzazione": "Ventilatore ad alta potenza",
      "Bagni": "Bagno privato dedicato con doccia calda",
      "Zanzariere": "Zanzariera integrale sulla tenda e sul letto",
      "Cucina": "Nessuna",
      "Punti di Forza": "Tenda premium su deck in legno sopraelevato, circondata da verde lussureggiante e suoni rilassanti della foresta."
    },
    {
      "Alloggio": "Camera Interna (The Hub)",
      "Slug": "internal-room",
      "Categoria": "GUESTHOUSE",
      "Capacità Base": 2,
      "Capacità Max": 2,
      "Configurazione Letti": "1 Letto King Size",
      "Climatizzazione": "Ventilatore",
      "Bagni": "Bagno privato en-suite con doccia calda",
      "Zanzariere": "Presenti",
      "Cucina": "Accesso alla cucina comune del co-living",
      "Punti di Forza": "Costruzione in muratura fresca e silenziosa, ideale per soggiorni lunghi economici o nomadi digitali."
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
      "Voce": "Distanza dalla Spiaggia",
      "Valore Ufficiale": "150 metri",
      "Dettagli": "Buffalo Bay (Ao Khao Kwai) dista solo 150 metri, circa 1 o 2 minuti a piedi lungo una tranquilla stradina pianeggiante nel verde. Acque calme perfette per nuotare, tramonti mozzafiato, kayak e beach bar rilassanti."
    },
    {
      "Voce": "Connessione Internet Wi-Fi",
      "Valore Ufficiale": "Wi-Fi ad alta velocità",
      "Dettagli": "Copertura Wi-Fi stabile e veloce in tutti gli alloggi e nelle aree comuni del ristorante/bakery, adatta anche per lavoro da remoto e videochiamate."
    },
    {
      "Voce": "Elettricità",
      "Valore Ufficiale": "Continua 24 ore su 24",
      "Dettagli": "Energia elettrica disponibile 24/7 (a differenza di capanne spartane dell'isola che spengono i generatori durante le ore diurne)."
    },
    {
      "Voce": "Protezione Zanzare",
      "Valore Ufficiale": "Zanzariera su OGNI letto",
      "Dettagli": "Tutti gli alloggi (ville, bungalow, tende glamping e camere) sono dotati di zanzariere pulite e completamente chiuse su tutti i letti."
    },
    {
      "Voce": "Bambini & Culle",
      "Valore Ufficiale": "Bambini benvenuti · Culla 200 THB/notte",
      "Dettagli": "Villaggio sicuro e adatto a famiglie. Culla neonato disponibile su richiesta a 200 THB/notte. Letti extra disponibili nelle ville (300-500 THB/notte)."
    },
    {
      "Voce": "Animali Domestici",
      "Valore Ufficiale": "Ammessi su preavviso",
      "Dettagli": "I cani e gli animali domestici sono i benvenuti previa comunicazione e accordo anticipato."
    },
    {
      "Voce": "Termini di Cancellazione",
      "Valore Ufficiale": "Cancellazione gratuita fino a 14 giorni prima del check-in",
      "Dettagli": "Cancellazione flessibile con rimborso integrale fino a 14 giorni prima dell'arrivo."
    },
    {
      "Voce": "Pagamenti Accettati",
      "Valore Ufficiale": "Carte di credito/debito, PromptPay QR e Bonifico bancario",
      "Dettagli": "Pagamenti online sicuri su Stripe, Ksher o PromptPay con conferma immediata via calendario interattivo."
    },
    {
      "Voce": "Sconti per Soggiorni Lunghi",
      "Valore Ufficiale": "10% per 14+ notti · 15% per 28+ notti",
      "Dettagli": "Sconto applicato automaticamente sulle prenotazioni dirette di lunga durata."
    }
  ]
};

