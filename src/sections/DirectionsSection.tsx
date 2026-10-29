import { useState, useEffect } from 'react';
import { 
  Plane, Ship, MapPin, Compass, AlertCircle, ExternalLink, Sparkles, 
  MessageCircle, Mail, Car, Bike, Bus, X, ArrowRight, ArrowLeftRight, Clock, ShieldCheck, Radio,
  UserCheck, Ticket, PhoneCall, HeartHandshake
} from 'lucide-react';
import { Language } from '../booking/lib/translations';

interface Props {
  lang?: Language;
}

const hubData = {
  "IT": {
    "general": {
      "tag": "Come Raggiungerci & Ripartenza",
      "title": "Il Tuo Viaggio verso Koh Phayam",
      "desc": "Raggiungere il Flower Power Farm Village a Buffalo Bay (Ao Khao Kwai) e pianificare il tuo rientro è semplice. Segui le 3 fasi o apri la guida interattiva completa ai trasporti per Bangkok, Phuket e le Isole.",
      "phaseBtn": "Fase",
      "openModalBtn": "Guida Completa Trasporti & Partenze da Ranong",
      "modalBadge": "Hub Trasporti & Collegamenti Thailandia",
      "modalTitle": "Guida ai Trasporti: Arrivo e Partenza da Ranong",
      "modalSubtitle": "Tutti i collegamenti da e per Bangkok, Phuket, Khao Lak e le Isole del Golfo.",
      "tabArrival": "Arrivo a Koh Phayam",
      "tabDeparture": "Ripartenza da Koh Phayam",
      "liveRadarBadge": "Live Flight Radar · Sincronizzato con l'Aeroporto di Ranong (UNX)",
      "flightsTitle": "Voli Diretti Bangkok (DMK) ↔ Ranong (UNX)",
      "flightsSubtitle": "Orari ufficiali Thai AirAsia con coincidenze consigliate con i motoscafi",
      "routeSelectorLabel": "Seleziona la tua provenienza o destinazione:",
      "routes": {
        "bangkok": "Da / Verso Bangkok",
        "phuket": "Da / Verso Phuket & Khao Lak",
        "gulf": "Da / Verso Golfo (Samui, Phangan, Tao)",
        "car": "In Auto & Parcheggio"
      },
      "chokeTipTitle": "Consiglio Risparmio Biglietto Bus",
      "chokeTipDesc": "Se viaggi in autobus da o verso Bangkok, prenota direttamente sul sito ufficiale di Choke Anan Tour per pagare la tariffa base ufficiale senza commissioni di agenzia!",
      "chokeBtn": "Sito Ufficiale Choke Anan",
      "twelveGoBtn": "Consulta Orari su 12Go.asia",
      "pierMapsBtn": "Molo Ranong su Google Maps",
      "resortMapsBtn": "Flower Power Village su Google Maps",
      "islandTransportDisclaimerTitle": "Nota di trasparenza sui trasferimenti al molo di Koh Phayam",
      "islandTransportDisclaimerText": "In conformità con le normative locali sui trasporti dell'isola e per motivi di sicurezza e copertura assicurativa, i resort privati non sono autorizzati ad effettuare transfer con mezzi propri su strada pubblica, né è possibile prenotare i tuk-tuk in anticipo (non essendo rimborsabili in caso di ritardi della barca o cambi di programma). Appena scendi dalla passerella del molo troverai sempre decine di comodi tuk-tuk e moto-taxi pronti ad accompagnarti al Flower Power Village in soli 10 minuti (200–250 THB), oppure potrai noleggiare direttamente il tuo scooter al molo (150–250 THB/giorno) per avere piena libertà fin dal primo istante!",
      "boatScheduleNoticeTitle": "Frequenza e Orari delle Speedboat (Ranong ↔ Koh Phayam)",
      "boatScheduleNoticeText": "A differenza dei voli, gli orari precisi dei motoscafi vengono confermati giornalmente dalle compagnie al molo in base al calendario delle maree e alle condizioni meteo. Le corse sono frequenti circa ogni ora / ora e mezza dalle 08:00 alle 17:00 / 17:30 (andata da Ranong) e dalle 07:30 alle 16:30 (ritorno da Koh Phayam). Il nostro autista del taxi convenzionato è in contatto telefonico diretto con la biglietteria del molo per garantirti sempre il primo imbarco disponibile!",
      "closeModal": "Chiudi Guida",
      "flightRadarNoticeTitle": "Orari Voli Sincronizzati in Tempo Reale",
      "flightRadarNoticeText": "I voli Thai AirAsia (DMK ↔ UNX) sono sincronizzati direttamente con l'Aeroporto di Ranong. Monitoriamo costantemente gli arrivi per garantire che la coincidenza con il taxi e la barca sia verificata e puntuale."
    },
    "modalRoutes": {
      "arrival": {
        "bangkok": {
          "title": "Come arrivare da Bangkok a Ranong",
          "plane": "Volo diretto da Bangkok Don Mueang (DMK) a Ranong (UNX) con AirAsia (1h 15m). Dalla stazione internazionale Suvarnabhumi (BKK) navetta gratuita o taxi per DMK (~50m). L'aeroporto dista 45 minuti d'auto dal molo.",
          "bus": "Bus notturni o diurni dal Southern Bus Terminal di Bangkok (Sai Tai Mai) alla stazione bus di Ranong (8-9h). I bus notturni arrivano la mattina presto a Ranong, perfetti per prendere i primi motoscafi.",
          "train": "Treno notturno con cuccetta dalla stazione Krung Thep Aphiwat di Bangkok fino a Chumphon (7-8h). Dalla stazione ferroviaria di Chumphon partono frequenti minivan diretti per Ranong (2h, prenotabili su 12Go.asia o all'arrivo)."
        },
        "phuket": {
          "title": "Come arrivare da Phuket & Khao Lak a Ranong",
          "bus": "Bus regionali di linea (Rungkit Tour) o minivan partono quotidianamente dal Phuket Bus Terminal 2 diretti a Ranong (4h30 - 5h, circa 300-450 THB).",
          "stops": "I bus effettuano fermate anche lungo la costa a Khao Lak (~3 ore da Ranong) e Takua Pa (~2 ore). Consigliamo di prenotare in anticipo in alta stagione."
        },
        "gulf": {
          "title": "Come arrivare dalle Isole del Golfo (Samui, Phangan, Tao) & Surat Thani",
          "ferry": "Dalle isole del Golfo prendi il traghetto veloce (Lomprayah o Seatran) fino alla terraferma (Surat Thani Pier o Chumphon Pier).",
          "van": "Da Surat Thani partono comodi minivan diretti per Ranong Bus Station (circa 3h30 - 4h). Da Chumphon il minivan impiega solo 2 ore."
        },
        "car": {
          "title": "Arrivare in Auto Propria o a Noleggio",
          "parking": "Puoi guidare comodamente fino al Molo di Ranong (Saphan Pla Pier). Presso il molo è presente un parcheggio custodito e sicuro a pagamento per lasciare l'auto durante il soggiorno a Koh Phayam."
        }
      },
      "departure": {
        "bangkok": {
          "title": "Come ripartire da Ranong verso Bangkok",
          "plane": "Volo pomeridiano diretto da Ranong (UNX) a Bangkok Don Mueang (DMK) con AirAsia. Prendi il motoscafo delle 10:00 o 12:00 da Koh Phayam per raggiungere comodamente l'aeroporto di Ranong con il nostro taxi convenzionato.",
          "bus": "Bus notturni o pomeridiani dalla stazione bus di Ranong fino a Bangkok Sai Tai Mai (8-9h). Puoi goderti l'intera giornata sull'isola e prendere l'ultimo motoscafo del pomeriggio (16:00/16:30) per salire a bordo del bus notturno.",
          "train": "Minivan pomeridiano da Ranong alla stazione ferroviaria di Chumphon (2h), da dove parte il treno notturno con cuccetta che ti porta a Bangkok Krung Thep Aphiwat la mattina successiva."
        },
        "phuket": {
          "title": "Come proseguire il viaggio verso Khao Lak & Phuket",
          "bus": "Partenze mattutine e pomeridiane con i bus Rungkit Tour o minivan dalla stazione di Ranong lungo la costa delle Andamane. Arrivo a Takua Pa (~2h), Khao Lak (~3h) e Phuket Bus Terminal 2 (~4h30 - 5h).",
          "stops": "Ideale per proseguire il tour del sud della Thailandia verso le spiagge di Phuket o prendere un volo internazionale dall'aeroporto di Phuket."
        },
        "gulf": {
          "title": "Come raggiungere le Isole del Golfo (Koh Samui, Koh Phangan, Koh Tao)",
          "ferry": "Minivan mattutino da Ranong per Surat Thani o Chumphon (2-3h30), coincidenza diretta con i traghetti veloci Lomprayah per Koh Tao, Koh Phangan o Koh Samui, arrivando sulle isole del Golfo nel tardo pomeriggio.",
          "van": "Un itinerario 'coast-to-coast' ideale per combinare il Mar delle Andamane e il Golfo di Thailandia nello stesso viaggio."
        },
        "car": {
          "title": "Ritiro dell'Auto al Molo di Ranong",
          "parking": "All'arrivo con il motoscafo da Koh Phayam al Molo di Ranong (Saphan Pla), ritira la tua vettura al parcheggio custodito per proseguire il tuo itinerario in Thailandia in totale libertà."
        }
      }
    },
    "concierge": {
      "badge": "Servizio Concierge & Assistenza Transfer",
      "title": "Arrivi a Ranong in Aereo? Ti aiutiamo noi",
      "desc": "Organizziamo per te un taxi privato convenzionato dall'Aeroporto di Ranong al molo: l'autista ti attende all'uscita con un cartello con il tuo nome e può emettere per te i biglietti del motoscafo.",
      "keyPerk": "L'autista è in contatto diretto con il capitano del motoscafo: in caso di lievi ritardi del volo, può avvisare e coordinare la partenza per assicurarsi che tu non perda l'ultima barca!",
      "prices": "Tariffa taxi: 200 THB a persona (min. 2 persone) o 300 THB per chi viaggia solo · Speedboat: 350 THB a persona (pagamento diretto al driver).",
      "required": "Dati richiesti: Nome e Cognome, Numero Volo, Data e Ora di arrivo, Numero di persone.",
      "alert": "Poiché gli orari di voli e motoscafi sono soggetti a variazioni dell'ultimo minuto, accettiamo richieste esclusivamente da 7 a 3 giorni prima del tuo arrivo.",
      "btnWhatsApp": "Richiedi su WhatsApp",
      "btnEmail": "Invia Email"
    },
    "vipAirportHero": {
      "badge": "Il Modo Più Rapido e Sicuro per Arrivare",
      "title": "Transfer Diretto dall'Aeroporto di Ranong con Mr. Gong",
      "subtitle": "Accoglienza personalizzata agli arrivi, biglietti della barca già pronti e linea telefonica diretta con i capitani della speedboat per non perdere mai l'ultima barca.",
      "perkName": "Accoglienza al Gate",
      "perkNameDesc": "Mr. Gong ti attende all'uscita con un cartello con il tuo nome: nessun taxi abusivo o attesa all'aeroporto.",
      "perkTickets": "Biglietti Barca in Mano",
      "perkTicketsDesc": "I biglietti del motoscafo vengono emessi in anticipo da Mr. Gong: arrivi al molo e sali a bordo senza fare code alla cassa.",
      "perkBoatConnection": "Linea Diretta coi Capitani",
      "perkBoatConnectionDesc": "In caso di ritardo del volo (specialmente per gli arrivi del pomeriggio che rischiano di perdere l'ultima barca), Mr. Gong avvisa subito il comandante per coordinare o posticipare la partenza.",
      "faresTitle": "Tariffe Fisse Standard (Pagamento Diretto a Mr. Gong)",
      "taxiFareSolo": "Taxi Aeroporto ➔ Molo: 300 THB (per chi viaggia solo)",
      "taxiFareGroup": "Taxi Aeroporto ➔ Molo: 200 THB a persona (per 2, 3, 4 o più persone)",
      "boatFare": "Speedboat Molo ➔ Koh Phayam: 350 THB a persona",
      "courtesyServiceNote": "Servizio di Pura Cortesia (Zero Commissioni): Flower Power Village offre questa assistenza esclusivamente per la tua tranquillità, senza alcun guadagno, ricarico o profitto. Pagherai le tariffe standard direttamente a Mr. Gong all'arrivo.",
      "btnWhatsApp": "Prenota Transfer su WhatsApp",
      "btnEmail": "Richiedi via Email",
      "bookingWindowNote": "Accettiamo richieste di transfer da 7 a 3 giorni prima del tuo arrivo."
    }
  },
  "EN": {
    "general": {
      "tag": "How to Reach Us & Departure",
      "title": "Your Journey to Koh Phayam",
      "desc": "Reaching Flower Power Farm Village at Buffalo Bay (Ao Khao Kwai) and planning your return is easy. Follow the 3 steps or open the complete interactive transport guide for Bangkok, Phuket, and the Islands.",
      "phaseBtn": "Step",
      "openModalBtn": "Complete Transport & Departure Guide from Ranong",
      "modalBadge": "Thailand Transport & Connections Hub",
      "modalTitle": "Transport Guide: Arrival and Departure from Ranong",
      "modalSubtitle": "All connections to and from Bangkok, Phuket, Khao Lak, and the Gulf Islands.",
      "tabArrival": "Arrival at Koh Phayam",
      "tabDeparture": "Departure from Koh Phayam",
      "liveRadarBadge": "Live Flight Radar · Synced with Ranong Airport (UNX)",
      "flightsTitle": "Direct Flights Bangkok (DMK) ↔ Ranong (UNX)",
      "flightsSubtitle": "Official Thai AirAsia schedules with recommended speedboat connections",
      "routeSelectorLabel": "Select your origin or destination:",
      "routes": {
        "bangkok": "To / From Bangkok",
        "phuket": "To / From Phuket & Khao Lak",
        "gulf": "To / From Gulf (Samui, Phangan, Tao)",
        "car": "By Car & Parking"
      },
      "chokeTipTitle": "Bus Ticket Savings Tip",
      "chokeTipDesc": "If traveling by bus to or from Bangkok, book directly on the official Choke Anan Tour website to pay the official base fare without agency commissions!",
      "chokeBtn": "Choke Anan Official Website",
      "twelveGoBtn": "Check Schedules on 12Go.asia",
      "pierMapsBtn": "Ranong Pier on Google Maps",
      "resortMapsBtn": "Flower Power Village on Google Maps",
      "islandTransportDisclaimerTitle": "Transparency Note on Transfers at Koh Phayam Pier",
      "islandTransportDisclaimerText": "In compliance with local island transport regulations and for safety and insurance coverage reasons, private resorts are not authorized to provide transfers with their own vehicles on public roads, nor is it possible to book tuk-tuks in advance (as they are non-refundable in case of boat delays or schedule changes). As soon as you step off the pier walkway, you will always find dozens of convenient tuk-tuks and motorbike taxis ready to take you to Flower Power Village in just 10 minutes (200–250 THB), or you can rent your own scooter directly at the pier (150–250 THB/day) for full freedom from the very first moment!",
      "boatScheduleNoticeTitle": "Speedboat Frequency and Schedules (Ranong ↔ Koh Phayam)",
      "boatScheduleNoticeText": "Unlike flights, exact speedboat schedules are confirmed daily by the companies at the pier based on tide calendars and weather conditions. Boats run frequently about every hour / hour and a half from 08:00 to 17:00 / 17:30 (outbound from Ranong) and from 07:30 to 16:30 (return from Koh Phayam). Our partner taxi driver is in direct phone contact with the pier ticket office to always guarantee you the first available boarding!",
      "closeModal": "Close Guide",
      "flightRadarNoticeTitle": "Real-Time Synchronized Flight Schedules",
      "flightRadarNoticeText": "Thai AirAsia flights (DMK ↔ UNX) are synchronized directly with Ranong Airport. We constantly monitor arrivals to ensure that the connection with the taxi and boat is verified and punctual."
    },
    "modalRoutes": {
      "arrival": {
        "bangkok": {
          "title": "How to get from Bangkok to Ranong",
          "plane": "Direct flight from Bangkok Don Mueang (DMK) to Ranong (UNX) with AirAsia (1h 15m). From Suvarnabhumi International Airport (BKK), take a free shuttle or taxi to DMK (~50m). The airport is a 45-minute drive from the pier.",
          "bus": "Night or day buses from Bangkok Southern Bus Terminal (Sai Tai Mai) to Ranong bus station (8-9h). Night buses arrive in Ranong early in the morning, perfect for catching the first speedboats.",
          "train": "Night sleeper train from Bangkok Krung Thep Aphiwat station to Chumphon (7-8h). From Chumphon railway station, frequent minivans depart directly to Ranong (2h, bookable on 12Go.asia or upon arrival)."
        },
        "phuket": {
          "title": "How to get from Phuket & Khao Lak to Ranong",
          "bus": "Regular regional buses (Rungkit Tour) or minivans depart daily from Phuket Bus Terminal 2 directly to Ranong (4h30 - 5h, approximately 300-450 THB).",
          "stops": "Buses also stop along the coast at Khao Lak (~3 hours from Ranong) and Takua Pa (~2 hours). We recommend booking in advance during high season."
        },
        "gulf": {
          "title": "How to get from the Gulf Islands (Samui, Phangan, Tao) & Surat Thani",
          "ferry": "From the Gulf Islands, take the fast ferry (Lomprayah or Seatran) to the mainland (Surat Thani Pier or Chumphon Pier).",
          "van": "From Surat Thani, convenient minivans depart directly to Ranong Bus Station (about 3h30 - 4h). From Chumphon, the minivan takes only 2 hours."
        },
        "car": {
          "title": "Arriving by Your Own Car or Rental",
          "parking": "You can drive comfortably to Ranong Pier (Saphan Pla Pier). At the pier, there is a secure paid parking lot to leave your car during your stay in Koh Phayam."
        }
      },
      "departure": {
        "bangkok": {
          "title": "How to depart from Ranong to Bangkok",
          "plane": "Afternoon direct flight from Ranong (UNX) to Bangkok Don Mueang (DMK) with AirAsia. Take the 10:00 or 12:00 speedboat from Koh Phayam to comfortably reach Ranong Airport with our partner taxi.",
          "bus": "Night or afternoon buses from Ranong bus station to Bangkok Sai Tai Mai (8-9h). You can enjoy the whole day on the island and take the last afternoon speedboat (16:00/16:30) to board the night bus.",
          "train": "Afternoon minivan from Ranong to Chumphon railway station (2h), where the night sleeper train departs to Bangkok Krung Thep Aphiwat the next morning."
        },
        "phuket": {
          "title": "How to continue your journey to Khao Lak & Phuket",
          "bus": "Morning and afternoon departures with Rungkit Tour buses or minivans from Ranong station along the Andaman coast. Arrival at Takua Pa (~2h), Khao Lak (~3h), and Phuket Bus Terminal 2 (~4h30 - 5h).",
          "stops": "Ideal for continuing your southern Thailand tour to Phuket beaches or catching an international flight from Phuket Airport."
        },
        "gulf": {
          "title": "How to reach the Gulf Islands (Koh Samui, Koh Phangan, Koh Tao)",
          "ferry": "Morning minivan from Ranong to Surat Thani or Chumphon (2-3h30), direct connection with Lomprayah fast ferries to Koh Tao, Koh Phangan, or Koh Samui, arriving at the Gulf Islands in the late afternoon.",
          "van": "An ideal 'coast-to-coast' itinerary to combine the Andaman Sea and the Gulf of Thailand in the same trip."
        },
        "car": {
          "title": "Car Pickup at Ranong Pier",
          "parking": "Upon arrival by speedboat from Koh Phayam at Ranong Pier (Saphan Pla), pick up your car at the secure parking lot to continue your Thailand itinerary in total freedom."
        }
      }
    },
    "concierge": {
      "badge": "Concierge Service & Transfer Assistance",
      "title": "Arriving in Ranong by Plane? We'll Help You",
      "desc": "We can arrange a private partner taxi from Ranong Airport to the pier for you: the driver will wait for you at the exit with a sign bearing your name and can issue speedboat tickets on your behalf.",
      "keyPerk": "The driver is in direct contact with the speedboat captain: in case of slight flight delays, he can notify and coordinate departure to ensure you don't miss the last boat!",
      "prices": "Taxi fare: 200 THB per person (min. 2 people) or 300 THB for solo travelers · Speedboat: 350 THB per person (payment directly to the driver).",
      "required": "Required details: Full Name, Flight Number, Arrival Date and Time, Number of People.",
      "alert": "Since flight and speedboat schedules are subject to last-minute changes, we accept requests only from 7 to 3 days before your arrival.",
      "btnWhatsApp": "Request via WhatsApp",
      "btnEmail": "Send Email"
    },
    "vipAirportHero": {
      "badge": "The Fastest and Safest Way to Arrive",
      "title": "Direct Transfer from Ranong Airport with Mr. Gong",
      "subtitle": "Personalized welcome at arrivals, boat tickets already prepared, and a direct phone line to the speedboat captains so you never miss the last boat.",
      "perkName": "Gate Welcome",
      "perkNameDesc": "Mr. Gong waits for you at the exit with a sign bearing your name: no unlicensed taxis or waiting at the airport.",
      "perkTickets": "Boat Tickets in Hand",
      "perkTicketsDesc": "Speedboat tickets are issued in advance by Mr. Gong: you arrive at the pier and board without queuing at the ticket office.",
      "perkBoatConnection": "Direct Line with the Captains",
      "perkBoatConnectionDesc": "In case of flight delay (especially for afternoon arrivals at risk of missing the last boat), Mr. Gong immediately notifies the captain to coordinate or postpone departure.",
      "faresTitle": "Standard Fixed Fares (Payment Direct to Mr. Gong)",
      "taxiFareSolo": "Airport Taxi ➔ Pier: 300 THB (for solo travelers)",
      "taxiFareGroup": "Airport Taxi ➔ Pier: 200 THB per person (for 2, 3, 4 or more people)",
      "boatFare": "Speedboat Pier ➔ Koh Phayam: 350 THB per person",
      "courtesyServiceNote": "Pure Courtesy Service (Zero Commission): Flower Power Village offers this assistance solely for your peace of mind, with no gain, markup or profit. You will pay the standard fares directly to Mr. Gong upon arrival.",
      "btnWhatsApp": "Book Transfer on WhatsApp",
      "btnEmail": "Request via Email",
      "bookingWindowNote": "We accept transfer requests from 7 to 3 days before your arrival."
    }
  },
  "TH": {
    "general": {
      "tag": "การเดินทางมาถึงและกลับ",
      "title": "การเดินทางของคุณสู่เกาะพยาม",
      "desc": "การเดินทางมาถึง Flower Power Farm Village ที่อ่าวเขาควาย (Buffalo Bay) และการวางแผนเดินทางกลับนั้นง่ายดาย เพียงทำตาม 3 ขั้นตอนหรือเปิดคู่มือการเดินทางแบบอินเทอร์แอกทีฟฉบับสมบูรณ์สำหรับกรุงเทพฯ ภูเก็ต และหมู่เกาะ",
      "phaseBtn": "ขั้นตอน",
      "openModalBtn": "คู่มือการเดินทางและออกเดินทางจากระนองฉบับสมบูรณ์",
      "modalBadge": "ศูนย์กลางการเดินทางและการเชื่อมต่อในประเทศไทย",
      "modalTitle": "คู่มือการเดินทาง: การมาถึงและการออกเดินทางจากระนอง",
      "modalSubtitle": "การเชื่อมต่อทั้งหมดไปและกลับจากกรุงเทพฯ ภูเก็ต เขาหลัก และหมู่เกาะอ่าวไทย",
      "tabArrival": "การมาถึงเกาะพยาม",
      "tabDeparture": "การออกเดินทางจากเกาะพยาม",
      "liveRadarBadge": "เรดาร์เที่ยวบินสด · ซิงโครไนซ์กับสนามบินระนอง (UNX)",
      "flightsTitle": "เที่ยวบินตรง กรุงเทพฯ (DMK) ↔ ระนอง (UNX)",
      "flightsSubtitle": "ตารางเวลาอย่างเป็นทางการของไทยแอร์เอเชีย พร้อมการเชื่อมต่อที่แนะนำกับเรือสปีดโบ๊ท",
      "routeSelectorLabel": "เลือกต้นทางหรือปลายทางของคุณ:",
      "routes": {
        "bangkok": "จาก / ไป กรุงเทพฯ",
        "phuket": "จาก / ไป ภูเก็ตและเขาหลัก",
        "gulf": "จาก / ไป อ่าวไทย (สมุย พะงัน เต่า)",
        "car": "เดินทางด้วยรถยนต์ส่วนตัวและที่จอดรถ"
      },
      "chokeTipTitle": "เคล็ดลับประหยัดตั๋วรถบัส",
      "chokeTipDesc": "หากคุณเดินทางโดยรถบัสจากหรือไปกรุงเทพฯ จองโดยตรงบนเว็บไซต์ทางการของ Choke Anan Tour เพื่อจ่ายราคาตั๋วพื้นฐานอย่างเป็นทางการโดยไม่มีค่าคอมมิชชั่นจากตัวแทน!",
      "chokeBtn": "เว็บไซต์ทางการ Choke Anan",
      "twelveGoBtn": "ตรวจสอบตารางเวลาบน 12Go.asia",
      "pierMapsBtn": "ท่าเรือระนองบน Google Maps",
      "resortMapsBtn": "Flower Power Village บน Google Maps",
      "islandTransportDisclaimerTitle": "หมายเหตุความโปร่งใสเกี่ยวกับการรับส่งที่ท่าเรือเกาะพยาม",
      "islandTransportDisclaimerText": "ตามกฎระเบียบการขนส่งท้องถิ่นของเกาะและเพื่อความปลอดภัยและความคุ้มครองประกันภัย รีสอร์ทเอกชนไม่ได้รับอนุญาตให้ให้บริการรับส่งด้วยรถของตนเองบนถนนสาธารณะ และไม่สามารถจองรถตุ๊กตุ๊กล่วงหน้าได้ (เนื่องจากไม่สามารถขอคืนเงินได้ในกรณีที่เรือล่าช้าหรือเปลี่ยนแปลงกำหนดการ) เมื่อคุณก้าวลงจากสะพานท่าเรือ คุณจะพบรถตุ๊กตุ๊กและมอเตอร์ไซค์รับจ้างหลายสิบคันพร้อมให้บริการนำคุณไปยัง Flower Power Village ในเวลาเพียง 10 นาที (200–250 บาท) หรือคุณสามารถเช่ามอเตอร์ไซค์ได้โดยตรงที่ท่าเรือ (150–250 บาท/วัน) เพื่อความอิสระเต็มที่ตั้งแต่แรกเริ่ม!",
      "boatScheduleNoticeTitle": "ความถี่และตารางเวลาเรือสปีดโบ๊ท (ระนอง ↔ เกาะพยาม)",
      "boatScheduleNoticeText": "ต่างจากเที่ยวบิน เวลาที่แน่นอนของเรือสปีดโบ๊ทจะได้รับการยืนยันจากบริษัทต่าง ๆ ที่ท่าเรือทุกวันตามปฏิทินน้ำขึ้นน้ำลงและสภาพอากาศ มีเที่ยวเรือบ่อยประมาณทุกชั่วโมงหรือชั่วโมงครึ่ง ตั้งแต่ 08:00 ถึง 17:00 / 17:30 น. (ขาไปจากระนอง) และตั้งแต่ 07:30 ถึง 16:30 น. (ขากลับจากเกาะพยาม) คนขับแท็กซี่ที่เราร่วมมือด้วยมีการติดต่อทางโทรศัพท์โดยตรงกับเคาน์เตอร์จำหน่ายตั๋วที่ท่าเรือ เพื่อให้คุณได้ขึ้นเรือเที่ยวแรกที่มีอยู่เสมอ!",
      "closeModal": "ปิดคู่มือ",
      "flightRadarNoticeTitle": "ตารางเที่ยวบินที่ซิงค์แบบเรียลไทม์",
      "flightRadarNoticeText": "เที่ยวบินไทยแอร์เอเชีย (DMK ↔ UNX) ได้รับการซิงค์โดยตรงกับสนามบินระนอง เราติดตามเที่ยวบินขาเข้าอย่างต่อเนื่อง เพื่อให้แน่ใจว่าการเชื่อมต่อกับแท็กซี่และเรือได้รับการตรวจสอบและตรงเวลา"
    },
    "modalRoutes": {
      "arrival": {
        "bangkok": {
          "title": "วิธีเดินทางจากกรุงเทพฯ ไประนอง",
          "plane": "เที่ยวบินตรงจากกรุงเทพฯ ดอนเมือง (DMK) ไประนอง (UNX) กับแอร์เอเชีย (1 ชม. 15 นาที) จากสนามบินนานาชาติสุวรรณภูมิ (BKK) มีรถรับส่งฟรีหรือแท็กซี่ไปดอนเมือง (~50 นาที) สนามบินอยู่ห่างจากท่าเรือ 45 นาทีโดยรถยนต์",
          "bus": "รถบัสกลางคืนหรือกลางวันจากสถานีขนส่งสายใต้ใหม่ (Sai Tai Mai) กรุงเทพฯ ไปสถานีขนส่งระนอง (8-9 ชม.) รถบัสกลางคืนจะถึงระนองเช้าตรู่ เหมาะสำหรับการขึ้นเรือสปีดโบ๊ทเที่ยวแรก",
          "train": "รถไฟนอนพร้อมเตียงจากสถานีกรุงเทพอภิวัฒน์ กรุงเทพฯ ไปชุมพร (7-8 ชม.) จากสถานีรถไฟชุมพรมีรถตู้โดยสารตรงไประนองบ่อยครั้ง (2 ชม. จองได้ที่ 12Go.asia หรือเมื่อมาถึง)"
        },
        "phuket": {
          "title": "วิธีเดินทางจากภูเก็ตและเขาหลักไประนอง",
          "bus": "รถบัสประจำทาง (รุ่งกิจทัวร์) หรือรถตู้โดยสารออกจากสถานีขนส่งภูเก็ต 2 ทุกวันตรงไประนอง (4 ชม. 30 นาที - 5 ชม. ประมาณ 300-450 บาท)",
          "stops": "รถบัสยังจอดตามชายฝั่งที่เขาหลัก (~3 ชม. จากระนอง) และตะกั่วป่า (~2 ชม.) แนะนำให้จองล่วงหน้าในฤดูท่องเที่ยว"
        },
        "gulf": {
          "title": "วิธีเดินทางจากหมู่เกาะอ่าวไทย (สมุย พะงัน เต่า) และสุราษฎร์ธานี",
          "ferry": "จากหมู่เกาะอ่าวไทย ใช้เรือเฟอร์รี่เร็ว (ลมพระยา หรือซีทราน) ไปยังแผ่นดินใหญ่ (ท่าเรือสุราษฎร์ธานี หรือท่าเรือชุมพร)",
          "van": "จากสุราษฎร์ธานีมีรถตู้โดยสารตรงไปสถานีขนส่งระนอง (ประมาณ 3 ชม. 30 นาที - 4 ชม.) จากชุมพรใช้เวลาเพียง 2 ชม."
        },
        "car": {
          "title": "การเดินทางด้วยรถยนต์ส่วนตัวหรือรถเช่า",
          "parking": "คุณสามารถขับรถไปถึงท่าเรือระนอง (ท่าเรือสะพานปลา) ได้อย่างสะดวก ที่ท่าเรือมีที่จอดรถที่ปลอดภัยมีผู้ดูแลและมีค่าบริการสำหรับฝากรถระหว่างพักที่เกาะพยาม"
        }
      },
      "departure": {
        "bangkok": {
          "title": "วิธีเดินทางกลับจากระนองไปกรุงเทพฯ",
          "plane": "เที่ยวบินตรงช่วงบ่ายจากระนอง (UNX) ไปกรุงเทพฯ ดอนเมือง (DMK) กับแอร์เอเชีย ขึ้นเรือสปีดโบ๊ทเวลา 10:00 หรือ 12:00 น. จากเกาะพยามเพื่อไปถึงสนามบินระนองอย่างสะดวกด้วยแท็กซี่ที่เราร่วมมือด้วย",
          "bus": "รถบัสกลางคืนหรือช่วงบ่ายจากสถานีขนส่งระนองไปกรุงเทพฯ สายใต้ใหม่ (8-9 ชม.) คุณสามารถเพลิดเพลินกับทั้งวันบนเกาะและขึ้นเรือสปีดโบ๊ทเที่ยวสุดท้ายช่วงบ่าย (16:00/16:30 น.) เพื่อขึ้นรถบัสกลางคืน",
          "train": "รถตู้ช่วงบ่ายจากระนองไปสถานีรถไฟชุมพร (2 ชม.) ซึ่งมีรถไฟนอนพร้อมเตียงออกเดินทางไปกรุงเทพฯ กรุงเทพอภิวัฒน์ในเช้าวันถัดไป"
        },
        "phuket": {
          "title": "วิธีเดินทางต่อไปยังเขาหลักและภูเก็ต",
          "bus": "ออกเดินทางช่วงเช้าและบ่ายด้วยรถบัส rungkit tour หรือรถตู้จากสถานีระนองเลียบชายฝั่งอันดามัน ถึงตะกั่วป่า (~2 ชม.) เขาหลัก (~3 ชม.) และสถานีขนส่งภูเก็ต 2 (~4 ชม. 30 นาที - 5 ชม.)",
          "stops": "เหมาะสำหรับการเดินทางต่อไปยังชายหาดภูเก็ตหรือขึ้นเที่ยวบินระหว่างประเทศจากสนามบินภูเก็ต"
        },
        "gulf": {
          "title": "วิธีเดินทางไปหมู่เกาะอ่าวไทย (เกาะสมุย เกาะพะงัน เกาะเต่า)",
          "ferry": "รถตู้ช่วงเช้าจากระนองไปสุราษฎร์ธานีหรือชุมพร (2-3 ชม. 30 นาที) เชื่อมต่อโดยตรงกับเรือเฟอร์รี่เร็วลมพระยาไปเกาะเต่า เกาะพะงัน หรือเกาะสมุย ถึงหมู่เกาะอ่าวไทยในช่วงบ่ายแก่",
          "van": "เส้นทาง 'ชายฝั่งสู่ชายฝั่ง' ที่เหมาะสำหรับการรวมทะเลอันดามันและอ่าวไทยไว้ในการเดินทางเดียวกัน"
        },
        "car": {
          "title": "การรับรถคืนที่ท่าเรือระนอง",
          "parking": "เมื่อเดินทางมาถึงด้วยเรือสปีดโบ๊ทจากเกาะพยามที่ท่าเรือระนอง (สะพานปลา) รับรถคืนที่ลานจอดรถที่มีผู้ดูแลเพื่อเดินทางต่อไปยังจุดหมายในประเทศไทยได้อย่างอิสระ"
        }
      }
    },
    "concierge": {
      "badge": "บริการคอนเซียร์จและช่วยเหลือการรับส่ง",
      "title": "มาถึงระนองโดยเครื่องบิน? เราช่วยคุณได้",
      "desc": "เราจัดแท็กซี่ส่วนตัวที่ร่วมมือด้วยจากสนามบินระนองไปท่าเรือให้คุณ คนขับจะรอคุณที่ทางออกพร้อมป้ายชื่อของคุณและสามารถออกตั๋วเรือสปีดโบ๊ทให้คุณได้",
      "keyPerk": "คนขับติดต่อโดยตรงกับกัปตันเรือสปีดโบ๊ท: ในกรณีที่เที่ยวบินล่าช้าเล็กน้อย เขาสามารถแจ้งและประสานเวลาเดินทางเพื่อให้คุณไม่พลาดเรือเที่ยวสุดท้าย!",
      "prices": "ค่าแท็กซี่: 200 บาทต่อคน (ขั้นต่ำ 2 คน) หรือ 300 บาทสำหรับผู้เดินทางคนเดียว · เรือสปีดโบ๊ท: 350 บาทต่อคน (ชำระโดยตรงกับคนขับ)",
      "required": "ข้อมูลที่ต้องการ: ชื่อและนามสกุล หมายเลขเที่ยวบิน วันที่และเวลาที่มาถึง จำนวนคน",
      "alert": "เนื่องจากตารางเวลาเที่ยวบินและเรือสปีดโบ๊ทอาจมีการเปลี่ยนแปลงในนาทีสุดท้าย เราจึงรับคำขอเฉพาะล่วงหน้า 7 ถึง 3 วันก่อนการมาถึงของคุณเท่านั้น",
      "btnWhatsApp": "สอบถามทาง WhatsApp",
      "btnEmail": "ส่งอีเมล"
    },
    "vipAirportHero": {
      "badge": "วิธีที่เร็วและปลอดภัยที่สุดในการเดินทางมาถึง",
      "title": "บริการรับส่งตรงจากสนามบินระนองกับ Mr. Gong",
      "subtitle": "การต้อนรับส่วนตัวที่จุดรับผู้โดยสารขาเข้า ตั๋วเรือเตรียมพร้อมไว้แล้ว และสายตรงกับกัปตันเรือสปีดโบ๊ท เพื่อไม่ให้คุณพลาดเรือเที่ยวสุดท้าย",
      "perkName": "การต้อนรับที่ประตูทางออก",
      "perkNameDesc": "Mr. Gong จะรอคุณที่ทางออกพร้อมป้ายชื่อของคุณ: ไม่ต้องกังวลเรื่องแท็กซี่เถื่อนหรือการรอคอยที่สนามบิน",
      "perkTickets": "ตั๋วเรือพร้อมในมือ",
      "perkTicketsDesc": "ตั๋วเรือสปีดโบ๊ทออกล่วงหน้าโดย Mr. Gong: คุณมาถึงท่าเรือและขึ้นเรือได้เลยโดยไม่ต้องต่อคิวที่เคาน์เตอร์",
      "perkBoatConnection": "สายตรงกับกัปตันเรือ",
      "perkBoatConnectionDesc": "ในกรณีที่เที่ยวบินล่าช้า (โดยเฉพาะเที่ยวบินช่วงบ่ายที่เสี่ยงพลาดเรือเที่ยวสุดท้าย) Mr. Gong จะแจ้งกัปตันทันทีเพื่อประสานงานหรือเลื่อนเวลาออกเรือ",
      "faresTitle": "อัตราค่าบริการมาตรฐานคงที่ (ชำระโดยตรงกับ Mr. Gong)",
      "taxiFareSolo": "แท็กซี่สนามบิน ➔ ท่าเรือ: 300 บาท (สำหรับผู้เดินทางคนเดียว)",
      "taxiFareGroup": "แท็กซี่สนามบิน ➔ ท่าเรือ: 200 บาทต่อคน (สำหรับ 2, 3, 4 คนขึ้นไป)",
      "boatFare": "เรือสปีดโบ๊ท ท่าเรือ ➔ เกาะพยาม: 350 บาทต่อคน",
      "courtesyServiceNote": "บริการด้วยความเต็มใจ (ไม่มีค่าคอมมิชชั่น): Flower Power Village ให้ความช่วยเหลือนี้เพื่อความสบายใจของคุณเท่านั้น โดยไม่มีผลกำไร ไม่มีการบวกเพิ่ม หรือแสวงหาผลประโยชน์ใดๆ คุณจะชำระค่าบริการมาตรฐานโดยตรงกับ Mr. Gong เมื่อเดินทางมาถึง",
      "btnWhatsApp": "จองบริการรับส่งผ่าน WhatsApp",
      "btnEmail": "สอบถามทางอีเมล",
      "bookingWindowNote": "เรารับคำขอรับส่งล่วงหน้าตั้งแต่ 7 ถึง 3 วันก่อนวันเดินทางมาถึงของคุณ"
    }
  },
  "DE": {
    "general": {
      "tag": "Anreise & Abreise",
      "title": "Ihre Reise nach Koh Phayam",
      "desc": "Das Flower Power Farm Village in der Buffalo Bay (Ao Khao Kwai) zu erreichen und Ihre Rückreise zu planen, ist ganz einfach. Folgen Sie den 3 Schritten oder öffnen Sie den vollständigen interaktiven Transportführer für Bangkok, Phuket und die Inseln.",
      "phaseBtn": "Schritt",
      "openModalBtn": "Vollständiger Transportführer & Abfahrten ab Ranong",
      "modalBadge": "Transport-Hub & Verbindungen in Thailand",
      "modalTitle": "Transportführer: Ankunft und Abreise ab Ranong",
      "modalSubtitle": "Alle Verbindungen von und nach Bangkok, Phuket, Khao Lak und den Golfinseln.",
      "tabArrival": "Ankunft auf Koh Phayam",
      "tabDeparture": "Abreise von Koh Phayam",
      "liveRadarBadge": "Live Flight Radar · Synchronisiert mit dem Flughafen Ranong (UNX)",
      "flightsTitle": "Direktflüge Bangkok (DMK) ↔ Ranong (UNX)",
      "flightsSubtitle": "Offizielle Flugzeiten von Thai AirAsia mit empfohlenen Anschlüssen zu den Speedbooten",
      "routeSelectorLabel": "Wählen Sie Ihre Herkunft oder Ihr Ziel:",
      "routes": {
        "bangkok": "Von / Nach Bangkok",
        "phuket": "Von / Nach Phuket & Khao Lak",
        "gulf": "Von / Nach Golf (Samui, Phangan, Tao)",
        "car": "Mit dem Auto & Parken"
      },
      "chokeTipTitle": "Spartipp für Bustickets",
      "chokeTipDesc": "Wenn Sie mit dem Bus von oder nach Bangkok reisen, buchen Sie direkt auf der offiziellen Website von Choke Anan Tour, um den offiziellen Grundtarif ohne Agenturgebühren zu zahlen!",
      "chokeBtn": "Offizielle Website Choke Anan",
      "twelveGoBtn": "Fahrzeiten auf 12Go.asia prüfen",
      "pierMapsBtn": "Hafen Ranong auf Google Maps",
      "resortMapsBtn": "Flower Power Village auf Google Maps",
      "islandTransportDisclaimerTitle": "Transparenzhinweis zu Transfers am Hafen von Koh Phayam",
      "islandTransportDisclaimerText": "In Übereinstimmung mit den lokalen Transportvorschriften der Insel und aus Sicherheits- und Versicherungsgründen dürfen private Resorts keine Transfers mit eigenen Fahrzeugen auf öffentlichen Straßen durchführen, und Tuk-Tuks können nicht im Voraus gebucht werden (da sie bei Bootsverspätungen oder Programmänderungen nicht erstattungsfähig sind). Sobald Sie die Gangway des Hafens verlassen, finden Sie stets Dutzende komfortabler Tuk-Tuks und Motorradtaxis, die bereit sind, Sie in nur 10 Minuten (200–250 THB) zum Flower Power Village zu bringen, oder Sie können direkt am Hafen Ihren eigenen Roller mieten (150–250 THB/Tag), um vom ersten Moment an völlige Freiheit zu genießen!",
      "boatScheduleNoticeTitle": "Frequenz und Fahrzeiten der Speedboote (Ranong ↔ Koh Phayam)",
      "boatScheduleNoticeText": "Anders als bei Flügen werden die genauen Fahrzeiten der Speedboote täglich von den Gesellschaften am Hafen je nach Gezeitenkalender und Wetterbedingungen bestätigt. Die Fahrten erfolgen häufig etwa jede Stunde / anderthalb Stunden von 08:00 bis 17:00 / 17:30 Uhr (Hinfahrt ab Ranong) und von 07:30 bis 16:30 Uhr (Rückfahrt ab Koh Phayam). Unser Fahrer des Partner-Taxis steht in direktem telefonischem Kontakt mit dem Ticketschalter am Hafen, um Ihnen stets die erste verfügbare Überfahrt zu garantieren!",
      "closeModal": "Führer schließen",
      "flightRadarNoticeTitle": "Flugzeiten in Echtzeit synchronisiert",
      "flightRadarNoticeText": "Die Flüge von Thai AirAsia (DMK ↔ UNX) sind direkt mit dem Flughafen Ranong synchronisiert. Wir überwachen die Ankünfte kontinuierlich, um sicherzustellen, dass der Anschluss an Taxi und Boot überprüft und pünktlich ist."
    },
    "modalRoutes": {
      "arrival": {
        "bangkok": {
          "title": "So erreichen Sie Ranong von Bangkok aus",
          "plane": "Direktflug von Bangkok Don Mueang (DMK) nach Ranong (UNX) mit AirAsia (1 Std. 15 Min.). Vom internationalen Flughafen Suvarnabhumi (BKK) kostenloser Shuttle oder Taxi nach DMK (ca. 50 Min.). Der Flughafen ist 45 Autominuten vom Hafen entfernt.",
          "bus": "Nacht- oder Tagesbusse vom Southern Bus Terminal in Bangkok (Sai Tai Mai) zum Busbahnhof Ranong (8–9 Std.). Die Nachtbusse erreichen Ranong am frühen Morgen – ideal, um die ersten Speedboote zu nehmen.",
          "train": "Nachtzug mit Liegewagen vom Bahnhof Krung Thep Aphiwat in Bangkok nach Chumphon (7–8 Std.). Vom Bahnhof Chumphon fahren regelmäßig Minivans direkt nach Ranong (2 Std., buchbar auf 12Go.asia oder bei Ankunft)."
        },
        "phuket": {
          "title": "So erreichen Sie Ranong von Phuket & Khao Lak aus",
          "bus": "Linienbusse (Rungkit Tour) oder Minivans fahren täglich vom Phuket Bus Terminal 2 direkt nach Ranong (4 Std. 30 Min. – 5 Std., ca. 300–450 THB).",
          "stops": "Die Busse halten auch entlang der Küste in Khao Lak (ca. 3 Std. von Ranong) und Takua Pa (ca. 2 Std.). Wir empfehlen, in der Hochsaison frühzeitig zu buchen."
        },
        "gulf": {
          "title": "So erreichen Sie Ranong von den Golfinseln (Samui, Phangan, Tao) & Surat Thani aus",
          "ferry": "Von den Golfinseln nehmen Sie die Schnellfähre (Lomprayah oder Seatran) zum Festland (Surat Thani Pier oder Chumphon Pier).",
          "van": "Ab Surat Thani fahren komfortable Minivans direkt zum Ranong Bus Station (ca. 3 Std. 30 Min. – 4 Std.). Ab Chumphon benötigt der Minivan nur 2 Stunden."
        },
        "car": {
          "title": "Anreise mit dem eigenen Auto oder Mietwagen",
          "parking": "Sie können bequem bis zum Hafen von Ranong (Saphan Pla Pier) fahren. Am Hafen steht ein bewachter und sicherer kostenpflichtiger Parkplatz zur Verfügung, auf dem Sie Ihr Auto während Ihres Aufenthalts auf Koh Phayam abstellen können."
        }
      },
      "departure": {
        "bangkok": {
          "title": "So reisen Sie von Ranong nach Bangkok ab",
          "plane": "Nachmittagsflug direkt von Ranong (UNX) nach Bangkok Don Mueang (DMK) mit AirAsia. Nehmen Sie das Speedboot um 10:00 oder 12:00 Uhr ab Koh Phayam, um mit unserem Partner-Taxi bequem den Flughafen Ranong zu erreichen.",
          "bus": "Nacht- oder Nachmittagsbusse vom Busbahnhof Ranong nach Bangkok Sai Tai Mai (8–9 Std.). Sie können den ganzen Tag auf der Insel genießen und das letzte Speedboot am Nachmittag (16:00/16:30 Uhr) nehmen, um den Nachtbus zu erreichen.",
          "train": "Nachmittags-Minivan von Ranong zum Bahnhof Chumphon (2 Std.), von wo der Nachtzug mit Liegewagen abfährt, der Sie am nächsten Morgen nach Bangkok Krung Thep Aphiwat bringt."
        },
        "phuket": {
          "title": "So setzen Sie Ihre Reise nach Khao Lak & Phuket fort",
          "bus": "Morgen- und Nachmittagsabfahrten mit den Bussen von Rungkit Tour oder Minivans vom Bahnhof Ranong entlang der Andamanenküste. Ankunft in Takua Pa (ca. 2 Std.), Khao Lak (ca. 3 Std.) und Phuket Bus Terminal 2 (ca. 4 Std. 30 Min. – 5 Std.).",
          "stops": "Ideal, um Ihre Südthailand-Rundreise zu den Stränden von Phuket fortzusetzen oder einen internationalen Flug vom Flughafen Phuket zu nehmen."
        },
        "gulf": {
          "title": "So erreichen Sie die Golfinseln (Koh Samui, Koh Phangan, Koh Tao)",
          "ferry": "Morgendlicher Minivan von Ranong nach Surat Thani oder Chumphon (2–3 Std. 30 Min.), direkter Anschluss an die Lomprayah-Schnellfähren nach Koh Tao, Koh Phangan oder Koh Samui – Ankunft auf den Golfinseln am späten Nachmittag.",
          "van": "Eine ideale 'Coast-to-Coast'-Route, um die Andamanensee und den Golf von Thailand in einer einzigen Reise zu verbinden."
        },
        "car": {
          "title": "Abholung des Autos am Hafen von Ranong",
          "parking": "Bei Ihrer Ankunft mit dem Speedboot von Koh Phayam am Hafen von Ranong (Saphan Pla) holen Sie Ihr Fahrzeug am bewachten Parkplatz ab und setzen Ihre Reise durch Thailand in völliger Freiheit fort."
        }
      }
    },
    "concierge": {
      "badge": "Concierge-Service & Transfer-Assistenz",
      "title": "Sie kommen mit dem Flugzeug in Ranong an? Wir helfen Ihnen",
      "desc": "Wir organisieren für Sie ein privates Partner-Taxi vom Flughafen Ranong zum Hafen: Der Fahrer erwartet Sie am Ausgang mit einem Schild mit Ihrem Namen und kann für Sie die Speedboot-Tickets ausstellen.",
      "keyPerk": "Der Fahrer steht in direktem Kontakt mit dem Kapitän des Speedboots: Bei leichten Flugverspätungen kann er Bescheid geben und die Abfahrt koordinieren, damit Sie das letzte Boot nicht verpassen!",
      "prices": "Taxitarif: 200 THB pro Person (mind. 2 Personen) oder 300 THB für Alleinreisende · Speedboot: 350 THB pro Person (Zahlung direkt an den Fahrer).",
      "required": "Erforderliche Angaben: Vor- und Nachname, Flugnummer, Ankunftsdatum und -uhrzeit, Anzahl der Personen.",
      "alert": "Da die Fahrzeiten von Flügen und Speedbooten kurzfristigen Änderungen unterliegen können, nehmen wir Anfragen ausschließlich 7 bis 3 Tage vor Ihrer Ankunft entgegen.",
      "btnWhatsApp": "Über WhatsApp anfragen",
      "btnEmail": "E-Mail senden"
    },
    "vipAirportHero": {
      "badge": "Der schnellste und sicherste Weg anzukommen",
      "title": "Direkter Transfer vom Flughafen Ranong mit Mr. Gong",
      "subtitle": "Persönlicher Empfang bei der Ankunft, bereits vorbereitete Bootstickets und eine direkte Telefonverbindung zu den Speedboat-Kapitänen, damit Sie nie das letzte Boot verpassen.",
      "perkName": "Empfang am Gate",
      "perkNameDesc": "Mr. Gong erwartet Sie am Ausgang mit einem Schild mit Ihrem Namen: kein unseriöses Taxi und kein Warten am Flughafen.",
      "perkTickets": "Bootstickets in der Hand",
      "perkTicketsDesc": "Die Tickets für das Motorboot werden im Voraus von Mr. Gong ausgestellt: Sie kommen am Pier an und gehen an Bord, ohne an der Kasse anzustehen.",
      "perkBoatConnection": "Direkte Leitung zu den Kapitänen",
      "perkBoatConnectionDesc": "Bei Flugverspätung (besonders bei Nachmittagsankünften, die Gefahr laufen, das letzte Boot zu verpassen) informiert Mr. Gong sofort den Kapitän, um die Abfahrt zu koordinieren oder zu verschieben.",
      "faresTitle": "Feste Standardtarife (Direktzahlung an Mr. Gong)",
      "taxiFareSolo": "Taxi Flughafen ➔ Pier: 300 THB (für Alleinreisende)",
      "taxiFareGroup": "Taxi Flughafen ➔ Pier: 200 THB pro Person (für 2, 3, 4 oder mehr Personen)",
      "boatFare": "Speedboat Pier ➔ เกาะพยาม: 350 THB pro Person",
      "courtesyServiceNote": "Reiner Kulanzservice (null Provision): Flower Power Village bietet diese Unterstützung ausschließlich zu Ihrer Beruhigung an, ohne jeglichen Gewinn, Aufschlag oder Profit. Sie zahlen die Standardtarife direkt bei der Ankunft an Mr. Gong.",
      "btnWhatsApp": "Transfer über WhatsApp buchen",
      "btnEmail": "Per E-Mail anfragen",
      "bookingWindowNote": "Wir nehmen Transferanfragen 7 bis 3 Tage vor Ihrer Ankunft entgegen."
    }
  }
};

interface FlightItem {
  flightNumber: string;
  airline: string;
  direction: 'arrival' | 'departure';
  depTime: string;
  arrTime: string;
  route: string;
  status?: string;
  statusText?: Record<Language, string>;
  boatTip: Record<Language, string>;
}

const defaultFlightsData: FlightItem[] = [
  {
    flightNumber: "FD 3140",
    airline: "Thai AirAsia",
    direction: "arrival",
    depTime: "07:45",
    arrTime: "09:05",
    route: "Bangkok (DMK) ➔ Ranong (UNX)",
    status: "SCHEDULED",
    boatTip: {
      IT: "Motoscafo consigliato: 10:30 o 11:30 dal Molo di Ranong",
      EN: "Recommended speedboat: 10:30 or 11:30 AM from Ranong Pier",
      TH: "เรือสปีดโบ๊ทแนะนำ: 10:30 หรือ 11:30 น. จากท่าเรือระนอง",
      DE: "Empfohlenes Speedboot: 10:30 oder 11:30 Uhr ab Ranong Pier"
    }
  },
  {
    flightNumber: "FD 3141",
    airline: "Thai AirAsia",
    direction: "departure",
    depTime: "09:35",
    arrTime: "10:55",
    route: "Ranong (UNX) ➔ Bangkok (DMK)",
    status: "SCHEDULED",
    boatTip: {
      IT: "Motoscafo da Koh Phayam: primo mattino ore 07:00 / 07:30",
      EN: "Speedboat from Koh Phayam: early morning 07:00 / 07:30 AM",
      TH: "เรือสปีดโบ๊ทจากเกาะพยาม: เช้าตรู่ 07:00 / 07:30 น.",
      DE: "Speedboot von Koh Phayam: Frühmorgens 07:00 / 07:30 Uhr"
    }
  },
  {
    flightNumber: "FD 3142",
    airline: "Thai AirAsia",
    direction: "arrival",
    depTime: "13:45",
    arrTime: "15:05",
    route: "Bangkok (DMK) ➔ Ranong (UNX)",
    status: "SCHEDULED",
    boatTip: {
      IT: "Motoscafo consigliato: 16:00 o 16:30 (Ultimo motoscafo del giorno!)",
      EN: "Recommended speedboat: 4:00 or 4:30 PM (Last boat of the day!)",
      TH: "เรือสปีดโบ๊ทแนะนำ: 16:00 หรือ 16:30 น. (เรือเที่ยวสุดท้ายของวัน!)",
      DE: "Empfohlenes Speedboot: 16:00 oder 16:30 Uhr (Letztes Boot des Tages!)"
    }
  },
  {
    flightNumber: "FD 3143",
    airline: "Thai AirAsia",
    direction: "departure",
    depTime: "15:35",
    arrTime: "16:55",
    route: "Ranong (UNX) ➔ Bangkok (DMK)",
    status: "SCHEDULED",
    boatTip: {
      IT: "Motoscafo da Koh Phayam: ore 12:00 o 13:00 per coincidenza comoda",
      EN: "Speedboat from Koh Phayam: 12:00 or 1:00 PM for easy connection",
      TH: "เรือสปีดโบ๊ทจากเกาะพยาม: 12:00 หรือ 13:00 น. เพื่อการต่อเครื่องที่สะดวก",
      DE: "Speedboot von Koh Phayam: 12:00 oder 13:00 Uhr für entspannten Anschluss"
    }
  }
];

export default function DirectionsSection({ lang = 'IT' }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDirection, setModalDirection] = useState<'arrival' | 'departure'>('arrival');
  const [activeRouteTab, setActiveRouteTab] = useState<'bangkok' | 'phuket' | 'gulf' | 'car'>('bangkok');
  const [flights, setFlights] = useState<FlightItem[]>(defaultFlightsData);
  const [isLiveRadar, setIsLiveRadar] = useState(false);

  const content = hubData[lang] || hubData['IT'];
  const t = content.general;
  const concierge = content.concierge;
  const vip = content.vipAirportHero;
  const routesContent = content.modalRoutes[modalDirection];

  // Fetch real-time flight radar status
  useEffect(() => {
    let isMounted = true;
    async function loadFlights() {
      try {
        const res = await fetch('/api/ranong-flights');
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.flights) && isMounted) {
          const mapped: FlightItem[] = json.flights.map((f: any) => ({
            flightNumber: f.flightNumber,
            airline: f.airline,
            direction: f.direction,
            depTime: f.departureScheduled,
            arrTime: f.arrivalScheduled,
            route: `${f.originIata} ➔ ${f.destinationIata}`,
            status: f.status,
            statusText: f.statusText,
            boatTip: f.recommendedBoat
          }));
          setFlights(mapped);
          setIsLiveRadar(true);
        }
      } catch {
        // Fallback silently to default schedule
      }
    }
    loadFlights();
    return () => { isMounted = false; };
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const whatsappVipMessage = encodeURIComponent(
    `Hello Flower Power Village! I would like to request the Airport Transfer & Speedboat connection with Mr. Gong:\n\n` +
    `• Full Name: \n` +
    `• Flight Number: \n` +
    `• Arrival Date & Time: \n` +
    `• Number of People: \n\nThank you!`
  );

  const emailSubject = encodeURIComponent(
    lang === 'IT' ? 'Richiesta transfer Aeroporto Ranong - Mr. Gong' :
    lang === 'DE' ? 'Anfrage Flughafen-Transfer Ranong - Mr. Gong' :
    lang === 'TH' ? 'ขอรับบริการจัดรถรับส่งสนามบินระนองกับ Mr. Gong' :
    'Request for Ranong Airport Transfer & Boat Assistance (Mr. Gong)'
  );

  const emailBody = encodeURIComponent(
    `Hello Flower Power Team,\n\nI would like to request the Airport Transfer with Mr. Gong and speedboat connection:\n\n` +
    `- Name and Surname:\n` +
    `- Flight Number:\n` +
    `- Date and Time of Arrival:\n` +
    `- Number of People:\n\nThank you!`
  );

  // Filtered flights for the active direction
  const activeFlights = flights.filter(f => f.direction === modalDirection);

  const getStatusBadge = (f: FlightItem) => {
    const text = f.statusText ? (f.statusText[lang] || f.statusText['IT']) : 
      (lang === 'IT' ? 'In Orario' : lang === 'TH' ? 'ตรงเวลา' : lang === 'DE' ? 'Pünktlich' : 'On Time');
    
    if (f.status === 'AIRBORNE') {
      return (
        <span className="text-xs font-black px-2.5 py-1 rounded bg-blue-100 text-blue-800 animate-pulse">
          ✈️ {text}
        </span>
      );
    }
    if (f.status === 'BOARDING') {
      return (
        <span className="text-xs font-black px-2.5 py-1 rounded bg-amber-100 text-amber-800 animate-pulse">
          ⏳ {text}
        </span>
      );
    }
    if (f.status === 'LANDED') {
      return (
        <span className="text-xs font-bold px-2.5 py-1 rounded bg-stone-200 text-stone-700">
          ✓ {text}
        </span>
      );
    }
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
        ✓ {text}
      </span>
    );
  };

  return (
    <section className="py-12 md:py-20 bg-stone-50 animate-fadeIn" id="directions">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <p 
            className="text-xs tracking-[0.4em] uppercase text-emerald-700 mb-3" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {t.tag}
          </p>
          <h2
            className="text-stone-855 mb-4 font-light"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {t.title.split(' verso ')[0].split(' to ')[0].split('สู่')[0].split(' nach ')[0]} <em>{lang === 'IT' ? 'verso Koh Phayam' : lang === 'EN' ? 'to Koh Phayam' : lang === 'TH' ? 'สู่เกาะพยาม' : 'nach Koh Phayam'}</em>
          </h2>
          <div className="w-12 h-px bg-emerald-600 mx-auto mb-5" />
          <p 
            className="text-stone-550 text-sm max-w-2xl mx-auto leading-relaxed font-light mb-4"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            {t.desc}
          </p>

          {/* Live Flight Radar Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-medium text-blue-900 shadow-2xs mb-2">
            <Radio size={13} className="text-blue-600 animate-pulse" />
            <span>{t.liveRadarBadge}</span>
          </div>
        </div>

        {/* 🌟 HERO CARD: VIP ARRIVAL FAST-TRACK CON MR. GONG 🌟 */}
        <div className="mb-14 rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-white p-7 md:p-10 shadow-xl border border-emerald-500/30 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-wide uppercase">
                  <Sparkles size={14} className="text-amber-300" />
                  <span>{vip.badge}</span>
                </div>
                <h3 
                  className="text-2xl md:text-3xl font-bold text-white tracking-tight"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {vip.title}
                </h3>
                <p className="text-stone-200 text-sm sm:text-base max-w-3xl font-normal leading-relaxed">
                  {vip.subtitle}
                </p>
              </div>

              {/* Direct Action Buttons */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <a
                  href={`https://wa.me/66834512741?text=${whatsappVipMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm tracking-wider uppercase transition-all duration-300 font-bold rounded-2xl shadow-lg hover:shadow-emerald-900/50 cursor-pointer"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  <MessageCircle size={18} />
                  <span>{vip.btnWhatsApp}</span>
                </a>

                <a
                  href={`mailto:flowerpowerphayam@gmail.com?subject=${emailSubject}&body=${emailBody}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs tracking-wider uppercase transition-all duration-300 font-medium rounded-2xl cursor-pointer"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  <Mail size={15} />
                  <span>{vip.btnEmail}</span>
                </a>
              </div>
            </div>

            {/* 3 Pillars of Security with Mr. Gong */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <UserCheck size={18} />
                  </div>
                  <h4 className="font-semibold text-white text-sm">{vip.perkName}</h4>
                </div>
                <p className="text-stone-200 text-sm sm:text-base font-normal leading-relaxed">
                  {vip.perkNameDesc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Ticket size={18} />
                  </div>
                  <h4 className="font-semibold text-white text-sm">{vip.perkTickets}</h4>
                </div>
                <p className="text-stone-200 text-sm sm:text-base font-normal leading-relaxed">
                  {vip.perkTicketsDesc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <PhoneCall size={18} />
                  </div>
                  <h4 className="font-semibold text-white text-sm">{vip.perkBoatConnection}</h4>
                </div>
                <p className="text-stone-200 text-sm sm:text-base font-normal leading-relaxed">
                  {vip.perkBoatConnectionDesc}
                </p>
              </div>
            </div>

            {/* Fares & Transparency Box */}
            <div className="p-4 md:p-5 rounded-2xl bg-black/40 border border-white/10 text-xs text-stone-300 font-light space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <ShieldCheck size={15} />
                  <span>{vip.faresTitle}</span>
                </span>
                <span className="text-[11px] text-stone-400">
                  {vip.bookingWindowNote}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-stone-200">
                <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  🚗 {vip.taxiFareSolo}
                </div>
                <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  👥 {vip.taxiFareGroup}
                </div>
                <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  🚤 {vip.boatFare}
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-amber-200/90 pt-1">
                <HeartHandshake size={15} className="mt-0.5 shrink-0 text-amber-400" />
                <span>{vip.courtesyServiceNote}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button to Open Full Hub Modal */}
        <div className="text-center mb-12">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm sm:text-base font-black tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer group"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            <Compass size={18} className="text-emerald-300 group-hover:rotate-45 transition-transform duration-300" />
            <span>{t.openModalBtn}</span>
            <ArrowRight size={16} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* MOBILE VIEW: Segmented Switcher + Single Card */}
        <div className="block md:hidden mb-10">
          <div className="flex bg-stone-200/60 p-1.5 rounded-2xl mb-6 border border-stone-300/40">
            {[1, 2, 3].map((stepNum, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-900 shadow-sm border border-stone-200/50'
                      : 'text-stone-500 hover:text-stone-850'
                  }`}
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {t.phaseBtn} {stepNum}
                </button>
              );
            })}
          </div>

          {/* Active Card Mobile */}
          <div className="bg-white p-6 border border-stone-200 rounded-3xl shadow-sm flex flex-col justify-between min-h-[420px]">
            {activeStep === 0 && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 bg-emerald-50 flex items-center justify-center rounded-xl shrink-0">
                    <Plane className="text-emerald-700" size={24} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-emerald-700 font-black uppercase tracking-wider block">
                      {lang === 'IT' ? 'Fase 1' : lang === 'EN' ? 'Step 1' : lang === 'TH' ? 'ขั้นตอนที่ 1' : 'Schritt 1'}
                    </span>
                    <h3 className="text-stone-850 font-bold text-lg">
                      {lang === 'IT' ? 'Arrivare a Ranong (Terraferma)' : lang === 'EN' ? 'Arriving in Ranong (Mainland)' : lang === 'TH' ? 'เดินทางมาระนอง (แผ่นดินใหญ่)' : 'Anreise nach Ranong (Festland)'}
                    </h3>
                  </div>
                </div>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-4 font-normal">
                  {lang === 'IT' ? "Ranong è la porta d'accesso sulla terraferma per Koh Phayam. I collegamenti principali:" :
                   lang === 'EN' ? 'Ranong on the mainland is the gateway to Koh Phayam. Main transport links:' :
                   lang === 'TH' ? 'จังหวัดระนองเป็นประตูสู่เกาะพยาม การเดินทางหลักมีดังนี้:' :
                   'Ranong auf dem Festland ist das Tor nach Koh Phayam. Die wichtigsten Verbindungen:'}
                </p>
                <ul className="space-y-3.5 mb-4 text-sm sm:text-base text-stone-700 font-normal">
                  <li className="flex items-start gap-2">
                    <Plane size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>{lang === 'IT' ? 'In Aereo' : lang === 'EN' ? 'By Plane' : lang === 'TH' ? 'เครื่องบิน' : 'Flugzeug'}:</strong> {lang === 'IT' ? "Voli Don Mueang (DMK) con AirAsia (1h 15m). L'aeroporto dista 45m dal molo." : lang === 'EN' ? 'Flights from Don Mueang (DMK) with AirAsia (1h 15m). Airport is 45m from pier.' : lang === 'TH' ? 'เที่ยวบินดอนเมือง (DMK) กับแอร์เอเชีย (1 ชม. 15 นาที) สนามบินห่างจากท่าเรือ 45 นาที' : 'Flüge ab Don Mueang (DMK) mit AirAsia (1 Std. 15 Min.). Flughafen 45 Min. zum Pier.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Bus size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>{lang === 'IT' ? 'In Autobus' : lang === 'EN' ? 'By Bus' : lang === 'TH' ? 'รถบัส' : 'Bus'}:</strong> {lang === 'IT' ? 'Bus VIP notturni e diurni da Bangkok Sai Tai Mai (8-9h).' : lang === 'EN' ? 'Overnight & daytime VIP buses from Bangkok Sai Tai Mai (8-9h).' : lang === 'TH' ? 'รถบัส VIP กลางคืนและกลางวันจากกรุงเทพฯ สายใต้ใหม่ (8-9 ชม.)' : 'VIP-Nacht- und Tagesbusse ab Bangkok Sai Tai Mai (8-9 Std.).'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Car size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>{lang === 'IT' ? 'In Auto' : lang === 'EN' ? 'By Car' : lang === 'TH' ? 'รถยนต์ส่วนตัว' : 'Mit dem Auto'}:</strong> {lang === 'IT' ? 'Guida fino al Molo di Ranong con comodo parcheggio custodito a pagamento.' : lang === 'EN' ? 'Drive straight to Ranong Pier with safe guarded paid parking.' : lang === 'TH' ? 'ขับตรงมาที่ท่าเรือสะพานปลา มีที่จอดรถรับฝากปลอดภัย' : 'Direktfahrt zum Ranong Pier mit bewachtem Parkplatz.'}</span>
                  </li>
                </ul>

                {/* Symmetrical Flight Radar Notice Mobile */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs sm:text-sm text-blue-950 font-normal leading-relaxed mb-4">
                  <strong>🛰️ {t.flightRadarNoticeTitle}:</strong> {t.flightRadarNoticeText}
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200/60"
                >
                  <span>{lang === 'IT' ? 'Orari Voli Live & Ripartenza da Ranong' : lang === 'EN' ? 'Live Flight Timetable & Ranong Departures' : lang === 'TH' ? 'ตารางบินสดและเส้นทางขากลับ' : 'Live-Flugplan & Abreise ab Ranong'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}

            {activeStep === 1 && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 bg-emerald-50 flex items-center justify-center rounded-xl shrink-0">
                    <Ship className="text-emerald-700" size={24} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-emerald-700 font-black uppercase tracking-wider block">
                      {lang === 'IT' ? 'Fase 2' : lang === 'EN' ? 'Step 2' : lang === 'TH' ? 'ขั้นตอนที่ 2' : 'Schritt 2'}
                    </span>
                    <h3 className="text-stone-850 font-bold text-lg">
                      {lang === 'IT' ? 'La Barca per Koh Phayam' : lang === 'EN' ? 'Boat to Koh Phayam' : lang === 'TH' ? 'ต่อเรือไปเกาะพยาม' : 'Fähre nach Koh Phayam'}
                    </h3>
                  </div>
                </div>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-4 font-normal">
                  {lang === 'IT' ? "Le barche partono dal Molo di Ranong (Saphan Pla Pier) direttamente per l'isola:" :
                   lang === 'EN' ? 'Boats depart from Ranong Pier (Saphan Pla Pier) directly to the island:' :
                   lang === 'TH' ? 'เรือโดยสารออกจากท่าเรือสะพานปลา ระนอง ตรงสู่เกาะพยาม:' :
                   'Die Boote fahren vom Ranong Pier (Saphan Pla Pier) direkt zur Insel:'}
                </p>
                <ul className="space-y-3.5 mb-4 text-sm sm:text-base text-stone-700 font-normal">
                  <li className="flex items-start gap-2">
                    <Ship size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Speedboat:</strong> {lang === 'IT' ? 'Partenze frequenti ogni 60-90 minuti (08:00 - 17:30, 40 min, 350 THB).' : lang === 'EN' ? 'Frequent departures every 60-90 min (08:00 - 17:30, 40 min, 350 THB).' : lang === 'TH' ? 'ออกบ่อยทุก 60-90 นาที (08:00 - 17:30 น. 40 นาที 350 บาท)' : 'Abfahrten alle 60-90 Min. (08:00 - 17:30 Uhr, 40 Min., 350 THB).'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ship size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Slow Boat:</strong> {lang === 'IT' ? 'Tradizionale barca di legno (10:00 e 15:00, 2 ore, ~280 THB).' : lang === 'EN' ? 'Traditional scenic boat (10:00 AM & 3:00 PM, 2 hours, ~280 THB).' : lang === 'TH' ? 'เรือไม้ดั้งเดิม (10:00 และ 15:00 น. 2 ชั่วโมง ประมาณ 280 บาท)' : 'Traditionelles Holzboot (10:00 und 15:00 Uhr, 2 Std., ca. 280 THB).'}</span>
                  </li>
                </ul>

                {/* Tidal note */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs sm:text-sm text-blue-950 font-normal leading-relaxed">
                  <strong>🌊 {t.boatScheduleNoticeTitle}:</strong> {t.boatScheduleNoticeText}
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-11 h-11 bg-emerald-50 flex items-center justify-center rounded-xl shrink-0">
                    <MapPin className="text-emerald-700" size={24} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-emerald-700 font-black uppercase tracking-wider block">
                      {lang === 'IT' ? 'Fase 3' : lang === 'EN' ? 'Step 3' : lang === 'TH' ? 'ขั้นตอนที่ 3' : 'Schritt 3'}
                    </span>
                    <h3 className="text-stone-850 font-bold text-lg">
                      {lang === 'IT' ? 'Dal Molo di Phayam al Resort' : lang === 'EN' ? 'From Phayam Pier to Resort' : lang === 'TH' ? 'จากท่าเรือเกาะพยามถึงรีสอร์ท' : 'Vom Pier zum Resort'}
                    </h3>
                  </div>
                </div>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-4 font-normal">
                  {lang === 'IT' ? 'Sbarcato al molo di Koh Phayam, raggiungi Buffalo Bay con le opzioni locali:' :
                   lang === 'EN' ? 'Once at Koh Phayam pier, reach Buffalo Bay with local island options:' :
                   lang === 'TH' ? 'เมื่อถึงท่าเรือเกาะพยาม เดินทางสู่อ่าวเขาควายได้ด้วยยานพาหนะท้องถิ่น:' :
                   'Am Pier von Koh Phayam angekommen, gibt es lokale Optionen nach Buffalo Bay:'}
                </p>
                <ul className="space-y-3 mb-4 text-sm sm:text-base text-stone-700 font-normal">
                  <li><strong>Tuk-Tuk (Sidecar):</strong> ~200-250 THB {lang === 'IT' ? '(comodo con valigie)' : '(ideal with luggage)'}</li>
                  <li><strong>Moto Taxi:</strong> 60-80 THB {lang === 'IT' ? '(rapido per chi viaggia solo)' : '(fast for solo travellers)'}</li>
                  <li><strong>{lang === 'IT' ? 'Noleggio Scooter' : 'Scooter Rental'}:</strong> 150-250 THB/{lang === 'IT' ? 'giorno' : 'day'} {lang === 'IT' ? '(al molo o in villaggio)' : '(at pier or resort)'}</li>
                  <li><strong>{lang === 'IT' ? 'A Piedi' : 'On Foot'}:</strong> ~4 km {lang === 'IT' ? 'nella natura tropicale' : 'walk through tropical nature'}</li>
                </ul>

                {/* Island transport disclaimer */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs sm:text-sm text-amber-950 font-normal leading-relaxed mb-3">
                  <strong>⚠️ {t.islandTransportDisclaimerTitle}:</strong> {t.islandTransportDisclaimerText}
                </div>
              </div>
            )}
            <div className="text-xs sm:text-sm text-stone-600 italic pt-3 border-t border-stone-100 font-medium">
              {lang === 'IT' ? 'Indica al conducente: "Flower Power Village - Ao Khao Kwai (Buffalo Bay)"' :
               lang === 'EN' ? 'Tell the driver: "Flower Power Village - Buffalo Bay (Ao Khao Kwai)"' :
               lang === 'TH' ? 'แจ้งคนขับ: "ฟลาวเวอร์ พาวเวอร์ วิลเลจ - อ่าวเขาควาย"' :
               'Nennen Sie dem Fahrer: "Flower Power Village - Buffalo Bay"'}
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW: Sleek 3-Column Grid */}
        <div className="hidden md:grid grid-cols-3 gap-8 mb-16 items-stretch">
          
          {/* Card 1 */}
          <div className="bg-white p-8 border border-stone-200 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-xl">
                  <Plane className="text-emerald-700" size={24} />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>UNX Radar</span>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-semibold tracking-widest uppercase block mb-2">
                {lang === 'IT' ? 'Fase 1' : lang === 'EN' ? 'Step 1' : lang === 'TH' ? 'ขั้นตอนที่ 1' : 'Schritt 1'}
              </span>
              <h3 className="text-stone-855 mb-4 font-semibold text-xl">
                {lang === 'IT' ? 'Arrivare a Ranong' : lang === 'EN' ? 'Arriving in Ranong' : lang === 'TH' ? 'การเดินทางมาระนอง' : 'Anreise nach Ranong'}
              </h3>
              <p className="text-stone-550 text-sm leading-relaxed mb-4 font-light">
                {lang === 'IT' ? "Ranong sulla terraferma è la porta d'accesso per Koh Phayam. I collegamenti principali:" :
                 lang === 'EN' ? 'Ranong on the mainland is the gateway to Koh Phayam. Key transport routes:' :
                 lang === 'TH' ? 'จังหวัดระนองเป็นจุดเริ่มต้นสู่เกาะพยาม เส้นทางหลักมีดังนี้:' :
                 'Ranong auf dem Festland ist das Tor nach Koh Phayam. Wichtigste Verbindungen:'}
              </p>
              <ul className="space-y-3.5 text-stone-600 text-sm mb-5 font-light">
                <li className="flex items-start gap-2.5">
                  <Plane size={16} className="text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-stone-850 font-semibold">{lang === 'IT' ? 'In Aereo' : lang === 'EN' ? 'By Plane' : lang === 'TH' ? 'เครื่องบิน' : 'Flugzeug'}:</strong> {lang === 'IT' ? "Voli Don Mueang (DMK) con AirAsia (1h 15m). Aeroporto a 45m dal molo." : lang === 'EN' ? 'Flights from Don Mueang (DMK) via AirAsia (1h 15m). Airport is 45m from pier.' : lang === 'TH' ? 'เที่ยวบินดอนเมือง (DMK) กับแอร์เอเชีย (1 ชม. 15 นาที) สนามบินห่างจากท่าเรือ 45 นาที' : 'Flüge ab Don Mueang (DMK) mit AirAsia (1 Std. 15 Min.). 45 Min. zum Pier.'}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Bus size={16} className="text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-stone-850 font-semibold">{lang === 'IT' ? 'In Autobus' : lang === 'EN' ? 'By Bus' : lang === 'TH' ? 'รถบัส' : 'Bus'}:</strong> {lang === 'IT' ? 'Bus VIP notturni e diurni da Bangkok Sai Tai Mai (8-9h).' : lang === 'EN' ? 'Overnight & daytime VIP buses from Bangkok Sai Tai Mai (8-9h).' : lang === 'TH' ? 'รถบัส VIP กลางคืนและกลางวันจากกรุงเทพฯ สายใต้ใหม่ (8-9 ชม.)' : 'VIP-Nacht- und Tagesbusse ab Bangkok Sai Tai Mai (8-9 Std.).'}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Car size={16} className="text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-stone-850 font-semibold">{lang === 'IT' ? 'In Auto' : lang === 'EN' ? 'By Car' : lang === 'TH' ? 'รถยนต์ส่วนตัว' : 'Mit dem Auto'}:</strong> {lang === 'IT' ? 'Guida fino al Molo di Ranong con parcheggio custodito a pagamento.' : lang === 'EN' ? 'Drive to Ranong Pier with safe guarded paid parking.' : lang === 'TH' ? 'ขับมาที่ท่าเรือสะพานปลา มีที่จอดรถรับฝากที่ปลอดภัย' : 'Direkt zum Pier mit bewachtem Parkplatz.'}
                  </div>
                </li>
              </ul>

              {/* Symmetrical Flight Radar Notice Desktop */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 font-light leading-relaxed mb-4">
                <strong className="font-semibold text-blue-950">🛰️ {t.flightRadarNoticeTitle}:</strong> {t.flightRadarNoticeText}
              </div>
            </div>
            
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200/60"
              >
                <span>{lang === 'IT' ? 'Orari Voli Live & Ripartenza da Ranong' : lang === 'EN' ? 'Live Flight Timetable & Ranong Departures' : lang === 'TH' ? 'ตารางบินสดและเส้นทางขากลับ' : 'Live-Flugplan & Abreise ab Ranong'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 border border-stone-200 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center mb-6 rounded-xl">
                <Ship className="text-emerald-700" size={24} />
              </div>
              <span className="text-xs text-emerald-700 font-semibold tracking-widest uppercase block mb-2">
                {lang === 'IT' ? 'Fase 2' : lang === 'EN' ? 'Step 2' : lang === 'TH' ? 'ขั้นตอนที่ 2' : 'Schritt 2'}
              </span>
              <h3 className="text-stone-855 mb-4 font-semibold text-xl">
                {lang === 'IT' ? 'La Barca per Koh Phayam' : lang === 'EN' ? 'Boat to Koh Phayam' : lang === 'TH' ? 'ต่อเรือไปเกาะพยาม' : 'Fähre nach Koh Phayam'}
              </h3>
              <p className="text-stone-550 text-sm leading-relaxed mb-4 font-light">
                {lang === 'IT' ? "Le imbarcazioni partono dal Molo di Ranong (Saphan Pla Pier) direttamente per l'isola:" :
                 lang === 'EN' ? 'Boats depart from Ranong Pier (Saphan Pla Pier) directly to the island:' :
                 lang === 'TH' ? 'เรือโดยสารออกจากท่าเรือสะพานปลา ระนอง ตรงสู่เกาะพยาม:' :
                 'Die Boote fahren vom Ranong Pier (Saphan Pla Pier) direkt zur Insel:'}
              </p>
              <ul className="space-y-3.5 text-stone-600 text-sm mb-5 font-light">
                <li className="flex items-start gap-2.5">
                  <Ship size={16} className="text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-stone-850 font-semibold">Speedboat:</strong> {lang === 'IT' ? 'Partenze frequenti ogni 60-90 minuti (08:00 - 17:30, 40 min, 350 THB a persona). Biglietti al molo o tramite il nostro taxi.' : lang === 'EN' ? 'Frequent departures every 60-90 min (08:00 - 17:30, 40 min, 350 THB/pax). Tickets at pier or via our taxi.' : lang === 'TH' ? 'ออกบ่อยทุก 60-90 นาที (08:00 - 17:30 น. 40 นาที 350 บาท) ซื้อที่ท่าเรือหรือผ่านคนขับของเรา' : 'Abfahrten alle 60-90 Min. (08:00 - 17:30 Uhr, 40 Min., 350 THB).'}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Ship size={16} className="text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-stone-850 font-semibold">Slow Boat:</strong> {lang === 'IT' ? 'Tradizionale barca di legno (10:00 e 15:00, 2 ore, ~280 THB).' : lang === 'EN' ? 'Traditional scenic wooden ferry (10:00 AM & 3:00 PM, 2 hours, ~280 THB).' : lang === 'TH' ? 'เรือไม้ดั้งเดิมชมวิว (10:00 และ 15:00 น. 2 ชั่วโมง ประมาณ 280 บาท)' : 'Traditionelles Holzboot (10:00 und 15:00 Uhr, 2 Std., ca. 280 THB).'}
                  </div>
                </li>
              </ul>

              {/* Speedboat tidal notice desktop */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 font-light leading-relaxed mb-4">
                <strong className="font-semibold text-blue-950">🌊 {t.boatScheduleNoticeTitle}:</strong> {t.boatScheduleNoticeText}
              </div>
            </div>
            <div className="text-xs text-stone-400 italic pt-4 border-t border-stone-100 font-light">
              {lang === 'IT' ? "Il nostro autista all'aeroporto coordina l'imbarco telefonando direttamente al capitano." :
               lang === 'EN' ? 'Our airport driver coordinates departure by directly calling boat captains.' :
               lang === 'TH' ? 'คนขับรถรับส่งสนามบินของเราจะโทรประสานงานกับกัปตันเรือโดยตรงเพื่อความมั่นใจ' :
               'Unser Flughafen-Fahrer koordiniert den Anschluss direkt telefonisch mit den Bootskapitänen.'}
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 border border-stone-200 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center mb-6 rounded-xl">
                <MapPin className="text-emerald-700" size={24} />
              </div>
              <span className="text-xs text-emerald-700 font-semibold tracking-widest uppercase block mb-2">
                {lang === 'IT' ? 'Fase 3' : lang === 'EN' ? 'Step 3' : lang === 'TH' ? 'ขั้นตอนที่ 3' : 'Schritt 3'}
              </span>
              <h3 className="text-stone-855 mb-4 font-semibold text-xl">
                {lang === 'IT' ? 'Dal Molo al Resort' : lang === 'EN' ? 'Pier to Resort' : lang === 'TH' ? 'จากท่าเรือถึงรีสอร์ท' : 'Vom Pier zum Resort'}
              </h3>
              <p className="text-stone-550 text-sm leading-relaxed mb-4 font-light">
                {lang === 'IT' ? 'Sbarcato al molo principale di Koh Phayam, puoi raggiungerci a Buffalo Bay con le opzioni locali:' :
                 lang === 'EN' ? 'Once at Koh Phayam pier, reach Buffalo Bay with convenient island options:' :
                 lang === 'TH' ? 'เมื่อขึ้นฝั่งที่ท่าเรือเกาะพยาม สามารถเดินทางมายังอ่าวเขาควายได้ด้วยยานพาหนะท้องถิ่น:' :
                 'Am Pier von Koh Phayam angekommen, erreichen Sie Buffalo Bay wie folgt:'}
              </p>
              <ul className="space-y-2.5 text-stone-600 text-sm mb-5 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Tuk-Tuk (Sidecar):</strong> ~200-250 THB {lang === 'IT' ? '(comodo con valigie)' : '(best with luggage)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Moto Taxi:</strong> 60-80 THB {lang === 'IT' ? '(veloce per chi viaggia solo)' : '(fast for solo travellers)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>{lang === 'IT' ? 'Noleggio Scooter' : 'Scooter Rental'}:</strong> 150-250 THB/{lang === 'IT' ? 'giorno al molo o al villaggio' : 'day at pier or resort'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>{lang === 'IT' ? 'A Piedi' : 'On Foot'}:</strong> ~4 km {lang === 'IT' ? 'nella natura tropicale' : 'walk through nature'}</span>
                </li>
              </ul>

              {/* Island transport disclaimer desktop */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 font-light leading-relaxed mb-4">
                <strong className="font-semibold text-amber-950">⚠️ {t.islandTransportDisclaimerTitle}:</strong> {t.islandTransportDisclaimerText}
              </div>
            </div>
            <div className="text-xs text-stone-400 italic pt-4 border-t border-stone-100 font-light">
              {lang === 'IT' ? 'Al molo indica al conducente: "Flower Power Village - Buffalo Bay (Ao Khao Kwai)"' :
               lang === 'EN' ? 'Simply tell the driver: "Flower Power Village - Buffalo Bay (Ao Khao Kwai)"' :
               lang === 'TH' ? 'แจ้งคนขับรถว่าต้องการไป: "ฟลาวเวอร์ พาวเวอร์ วิลเลจ - อ่าวเขาควาย"' :
               'Nennen Sie dem Fahrer: "Flower Power Village - Buffalo Bay"'}
            </div>
          </div>
        </div>
      </div>

      {/* FULL INTERACTIVE MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fadeIn">
          
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col z-10">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-stone-150 bg-stone-50/70 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold tracking-wide uppercase mb-2">
                  <Compass size={13} />
                  <span>{t.modalBadge}</span>
                </div>
                <h3 
                  className="text-stone-850 font-bold text-xl md:text-2xl"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {t.modalTitle}
                </h3>
                <p className="text-stone-500 text-xs md:text-sm font-light mt-1">
                  {t.modalSubtitle}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-650 hover:text-stone-900 transition-colors shrink-0 cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
              
              {/* DIRECTION SWITCHER: ARRIVAL vs DEPARTURE */}
              <div className="bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200 flex gap-2">
                <button
                  onClick={() => setModalDirection('arrival')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    modalDirection === 'arrival'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>{t.tabArrival}</span>
                </button>

                <button
                  onClick={() => setModalDirection('departure')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    modalDirection === 'departure'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ArrowLeftRight size={15} />
                  <span>{t.tabDeparture}</span>
                </button>
              </div>

              {/* FLIGHT TIMETABLE & STATUS WIDGET */}
              <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 border border-blue-200/70 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Plane size={20} className="text-blue-600" />
                    <div>
                      <h4 className="text-stone-850 font-bold text-sm md:text-base">
                        {t.flightsTitle}
                      </h4>
                      <p className="text-stone-500 text-[11px] font-light">
                        {t.flightsSubtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-[10px] font-semibold uppercase tracking-wider">
                      <Radio size={11} className={isLiveRadar ? "text-blue-600 animate-pulse" : "text-blue-500"} />
                      <span>{t.liveRadarBadge}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeFlights.map((f, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-stone-850">{f.flightNumber} · {f.airline}</span>
                        {getStatusBadge(f)}
                      </div>
                      <div className="text-xs text-stone-600 flex items-center gap-2 mb-2">
                        <span className="font-semibold text-stone-800 text-sm">{f.depTime}</span>
                        <span className="text-stone-400">➔</span>
                        <span className="font-semibold text-stone-800 text-sm">{f.arrTime}</span>
                        <span className="text-stone-400 text-[11px]">({f.route})</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50/70 text-[11px] text-emerald-900 border border-emerald-100 font-light">
                        ⚡ {f.boatTip[lang] || f.boatTip['IT']}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPEEDBOAT TIDAL NOTICE & ISLAND DISCLAIMER IN MODAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-950 font-light leading-relaxed">
                  <span className="font-semibold text-blue-900 block mb-1">🌊 {t.boatScheduleNoticeTitle}:</span>
                  {t.boatScheduleNoticeText}
                </div>
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 font-light leading-relaxed">
                  <span className="font-semibold text-amber-900 block mb-1">⚠️ {t.islandTransportDisclaimerTitle}:</span>
                  {t.islandTransportDisclaimerText}
                </div>
              </div>

              {/* ROUTE SELECTOR TABS */}
              <div>
                <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
                  {t.routeSelectorLabel}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setActiveRouteTab('bangkok')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      activeRouteTab === 'bangkok'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>🏙️ {t.routes.bangkok}</span>
                  </button>

                  <button
                    onClick={() => setActiveRouteTab('phuket')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      activeRouteTab === 'phuket'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>🌴 {t.routes.phuket}</span>
                  </button>

                  <button
                    onClick={() => setActiveRouteTab('gulf')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      activeRouteTab === 'gulf'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>🌊 {t.routes.gulf}</span>
                  </button>

                  <button
                    onClick={() => setActiveRouteTab('car')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      activeRouteTab === 'car'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>🚗 {t.routes.car}</span>
                  </button>
                </div>
              </div>

              {/* ROUTE DETAIL CARD */}
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                
                {/* Bangkok */}
                {activeRouteTab === 'bangkok' && (
                  <div className="space-y-4">
                    <h5 className="font-bold text-stone-850 text-base flex items-center gap-2">
                      <span>🏙️</span> {routesContent.bangkok.title}
                    </h5>
                    
                    <div className="space-y-3 text-xs md:text-sm text-stone-650 font-light leading-relaxed">
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                        <strong className="text-stone-850 block mb-1">✈️ {lang === 'IT' ? 'In Aereo' : lang === 'EN' ? 'By Flight' : lang === 'TH' ? 'เครื่องบิน' : 'Flug'}:</strong>
                        {routesContent.bangkok.plane}
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                        <strong className="text-stone-850 block mb-1">🚌 {lang === 'IT' ? 'In Autobus VIP' : lang === 'EN' ? 'By VIP Bus' : lang === 'TH' ? 'รถบัส VIP' : 'VIP Bus'}:</strong>
                        {routesContent.bangkok.bus}

                        {/* Choke Anan Insider Tip */}
                        <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed font-normal">
                          <span className="font-bold text-amber-950 block mb-1">💡 {t.chokeTipTitle}:</span>
                          {t.chokeTipDesc}
                          <div className="mt-2.5 flex flex-wrap gap-2.5">
                            <a
                              href="https://www.chokeanantour.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition-colors"
                            >
                              <span>{t.chokeBtn}</span>
                              <ExternalLink size={11} />
                            </a>
                            <a
                              href="https://12go.asia"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:text-stone-900 text-xs font-medium transition-colors"
                            >
                              <span>{t.twelveGoBtn}</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                        <strong className="text-stone-850 block mb-1">🚆 {lang === 'IT' ? 'In Treno Notturno (via Chumphon)' : lang === 'EN' ? 'Night Train (via Chumphon)' : lang === 'TH' ? 'รถไฟนอน (ผ่านชุมพร)' : 'Nachtzug (über Chumphon)'}:</strong>
                        {routesContent.bangkok.train}
                      </div>
                    </div>
                  </div>
                )}

                {/* Phuket & Khao Lak */}
                {activeRouteTab === 'phuket' && (
                  <div className="space-y-4">
                    <h5 className="font-bold text-stone-850 text-base flex items-center gap-2">
                      <span>🌴</span> {routesContent.phuket.title}
                    </h5>
                    <div className="space-y-3 text-xs md:text-sm text-stone-650 font-light leading-relaxed">
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                        <strong className="text-stone-850 block mb-1">🚌 {lang === 'IT' ? 'Bus Rungkit Tour & Minivan' : 'Rungkit Tour Bus & Minivans'}:</strong>
                        {routesContent.phuket.bus}
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                        <strong className="text-stone-850 block mb-1">📍 {lang === 'IT' ? 'Fermate Intermedie & Consigli' : 'Intermediate Stops & Tips'}:</strong>
                        {routesContent.phuket.stops}
                      </div>
                      <div>
                        <a
                          href="https://12go.asia"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                        >
                          <span>{t.twelveGoBtn}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gulf Islands & Surat Thani */}
                {activeRouteTab === 'gulf' && (
                  <div className="space-y-4">
                    <h5 className="font-bold text-stone-850 text-base flex items-center gap-2">
                      <span>🌊</span> {routesContent.gulf.title}
                    </h5>
                    <div className="space-y-3 text-xs md:text-sm text-stone-650 font-light leading-relaxed">
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                        <strong className="text-stone-850 block mb-1">⛴️ {lang === 'IT' ? 'Traghetti Veloci (Lomprayah / Seatran)' : 'Fast Ferries (Lomprayah / Seatran)'}:</strong>
                        {routesContent.gulf.ferry}
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                        <strong className="text-stone-850 block mb-1">🚐 {lang === 'IT' ? 'Minivan di Collegamento Terraferma' : 'Connecting Mainland Minivans'}:</strong>
                        {routesContent.gulf.van}
                      </div>
                      <div>
                        <a
                          href="https://12go.asia"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                        >
                          <span>{t.twelveGoBtn}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Car */}
                {activeRouteTab === 'car' && (
                  <div className="space-y-4">
                    <h5 className="font-bold text-stone-850 text-base flex items-center gap-2">
                      <span>🚗</span> {routesContent.car.title}
                    </h5>
                    <div className="space-y-3 text-xs md:text-sm text-stone-650 font-light leading-relaxed">
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
                        <strong className="text-stone-850 block mb-1">🅿️ {lang === 'IT' ? 'Parcheggio Custodito al Molo' : 'Guarded Pier Parking'}:</strong>
                        {routesContent.car.parking}
                      </div>
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <a
                          href="https://maps.app.goo.gl/ef3wv84NXeNE3GvSA"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                        >
                          <span>{t.pierMapsBtn}</span>
                          <ExternalLink size={12} />
                        </a>
                        <a
                          href="https://maps.app.goo.gl/QfUobXJvpPvZfZXJ7"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:text-stone-900 text-xs font-medium transition-colors"
                        >
                          <span>{t.resortMapsBtn}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-light hidden sm:inline">
                Flower Power Farm Village & Restaurant · Koh Phayam
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-750 font-semibold text-xs transition-colors ml-auto cursor-pointer"
              >
                {t.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
