import { AutoCutLabMode } from './autoCutLabEngine';

export interface AutoCutModeRuleDetail {
  mode: AutoCutLabMode;
  code: string;
  badgeLabel: string;
  badgeColor: string; // 'rose' | 'emerald' | 'amber' | 'indigo'
  title: string;
  subtitle: string;
  targetPlatform: string; // 'Instagram Stories / Reels / TikTok'
  aspectRatio: string;    // '9:16 Canvas Verticale (720x1280)'
  durationNote: string;
  objective: string;
  assetRules: string[];
  exclusions: string[];
  typographyRules: {
    topBanner?: string;
    primaryTitle: string;
    secondaryTitle: string;
    priceBadge: string;
  };
  cameraMovement: string;
  outroSpec: {
    timing: string;
    elements: string[];
  };
  strictProhibitions: string[];
}

export const AUTOCUT_RULES_REGISTRY: Record<AutoCutLabMode, AutoCutModeRuleDetail> = {
  P1: {
    mode: 'P1',
    code: 'P1',
    badgeLabel: 'PIZZERIA STORIES P1',
    badgeColor: 'rose',
    title: '1 Piatto Culinario Iconico · Full Beat MP3 Outro',
    subtitle: 'Commercial rapido focalizzato su un singolo piatto hero con QR Code LINE nel beat',
    targetPlatform: 'TikTok · Instagram Stories & Reels',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Intero brano MP3 (~11.7s – 13.0s). Piatto: fino al cantato "Flower Power!" (~8.8s), poi Outro & QR Code nel beat fino al termine.',
    objective: 'Catturare immediatamente l’attenzione con un piatto culinario autentico di Ranong e convertire all’ordine delivery su LINE e sito entro 12 secondi.',
    assetRules: [
      '1 solo piatto culinario reale con immagine HD estratta dal catalogo ufficiale di Flower Power Pizza.',
      'Rigorosamente verificato come DISPONIBILE nel Kitchen Monitor (is_available !== false).',
      'Ammessi: Pizze Tradizionali Italiane, Paste Fresche Artigianali, Secondi Piatti, Focacce Farcite e Dolci Artigianali.'
    ],
    exclusions: [
      'DIVIETO ASSOLUTO PIATTI ESAURITI: Zero piatti contrassegnati come Sold Out (86) dal Kitchen Monitor.',
      'DIVIETO ASSOLUTO BEVANDE: Zero Soft Drinks, Zero Acqua, Zero Birre, Zero Vini, Zero Caffè.',
      'DIVIETO ASSOLUTO PIZZA NAPOLETANA: Solo "Authentic Traditional Italian Pizza".'
    ],
    typographyRules: {
      topBanner: 'Pill Ranong Delivery · ส่งถึงบ้าน (flowerpowerpizza.com • Link in Bio).',
      primaryTitle: '🇹🇭 THAI IN GRANDE SOPRA (20px font-black text-amber-300 drop-shadow). A capo semantico naturale prima dei condimenti/salse (es. ซอส, สไตล์).',
      secondaryTitle: '🇬🇧 INGLESE SOTTO (13px font-bold text-white). Taglio a senso prima dei connettori logici (es. WITH, &, AND, ALLA). Tassativamente MAI Italiano.',
      priceBadge: '🍕 Fondo banner giallo oro vivo bordato di nero (border-2 border-black), scritta del prezzo in nero (text-black), simbolo del baht ฿ (es. 8" 120 ฿ • 12" 190 ฿, o 290 ฿) e puntino rosso rubino lampeggiante più evidente.'
    },
    cameraMovement: 'Food Macro Focus a 2 sole fasi continue (Pan orizzontale morbido + Rientro al centro con Climax Zoom Macro sul cuore del piatto).',
    outroSpec: {
      timing: 'Entra a tempo di musica dentro la coda dell’MP3 (nessun secondo aggiunto).',
      elements: [
        'Logo Ufficiale Flower Power Pizza volante con rimbalzo elastico 3D.',
        'Titolo "FLOWER POWER PIZZA · RANONG THAILAND" a 36px/22px.',
        'Card Consegna con QR Code LINE Ufficiale (195px) scansionabile da schermo.',
        'Sito flowerpowerpizza.com (26px), LINE @flowerpowerpizza (22px) e sconto 10% 1° ordine.'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare piatti contrassegnati come esauriti dal Kitchen Monitor.',
      'Vietato sfumare la musica prima del termine del cantato.',
      'Vietato mostrare categorie di bevande o alcolici.',
      'Vietato usare la parola "Napoletana".'
    ]
  },

  P2: {
    mode: 'P2',
    code: 'P2',
    badgeLabel: 'PIZZERIA STORIES P2',
    badgeColor: 'rose',
    title: '3 Piatti della STESSA Categoria Culinaria',
    subtitle: 'Trilogia tematica verticale per valorizzare la profondità del menu della pizzeria',
    targetPlatform: 'TikTok · Instagram Stories & Reels',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Intero MP3 (~12s, ~4s a piatto) + 4.0s Outro Brand finale con QR Code.',
    objective: 'Mostrare la ricchezza e la varietà di una specifica specialità (es. tutte e 3 pizze tradizionali, oppure tutte e 3 paste, focacce o dolci).',
    assetRules: [
      '3 piatti appartenenti TASSATIVAMENTE alla stessa categoria culinaria omogenea.',
      'Rigorosamente verificati come DISPONIBILI nel Kitchen Monitor (zero piatti esauriti o 86).',
      'Ogni piatto possiede immagine reale HD e nome bilingue Thai/Inglese.'
    ],
    exclusions: [
      'DIVIETO ASSOLUTO PIATTI ESAURITI (86): Esclusi tutti i piatti messi come esauriti nel Kitchen Monitor.',
      'Vietato selezionare categorie di bevande, bibite, alcolici o caffè.',
      'Vietato mescolare piatti di categorie diverse nella stessa sequenza P2.'
    ],
    typographyRules: {
      topBanner: 'Pill Ranong Delivery · ส่งถึงบ้าน in alto.',
      primaryTitle: '🇹🇭 THAI SOPRA: Nome piatto in Thai grande in ambra con taglio semantico prima di salse e condimenti.',
      secondaryTitle: '🇬🇧 INGLESE SOTTO: Nome piatto in Inglese in bianco tagliato prima dei connettori (WITH, &, ecc.). MAI Italiano.',
      priceBadge: 'Doppi prezzi 8" e 12" se pizze, prezzo singolo per le altre categorie.'
    },
    cameraMovement: 'Alternanza di carrellate lente Pan & Zoom Macro (SX➔DX, poi DX➔SX, poi Centro) con crossfade vellutato continuo.',
    outroSpec: {
      timing: 'Sosta di 4.0s a fine musica.',
      elements: [
        'Logo Flower Power Pizza con alone dorato radiale.',
        'Card Ranong Delivery con QR Code LINE, sito web e link in bio.'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare piatti contrassegnati come esauriti dal Kitchen Monitor.',
      'Vietato cambiare categoria tra una scena e l’altra.',
      'Vietato inserire birre o vini.',
      'Vietato spezzare parole o sillabe a metà nei titoli.'
    ]
  },

  P3: {
    mode: 'P3',
    code: 'P3',
    badgeLabel: 'PIZZERIA STORIES P3',
    badgeColor: 'rose',
    title: '3 Piatti di DIVERSE Categorie Culinari',
    subtitle: 'Degustazione menu completo: 1 Pizza + 1 Pasta/Secondo + 1 Dessert',
    targetPlatform: 'TikTok · Instagram Stories & Reels',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Intero MP3 (~12s, ~4s a piatto) + 4.0s Outro Brand finale con QR Code.',
    objective: 'Presentare un’esperienza culinaria completa dall’antipasto al dolce, stimolando ordini con carrello ad alto valore medio.',
    assetRules: [
      '3 piatti estratti da 3 categorie culinarie differenti e complementari.',
      'Rigorosamente verificati come DISPONIBILI nel Kitchen Monitor (zero piatti esauriti o 86).',
      'Badge categoria superiore in evidenza (es. "TRADITIONAL PIZZA", "PASTA", "DESSERT").'
    ],
    exclusions: [
      'DIVIETO ASSOLUTO PIATTI ESAURITI (86): Esclusi tutti i piatti spenti o esauriti nel Kitchen Monitor.',
      'Esclusione categorica di tutte le bevande.',
      'Divieto di ripetere la stessa categoria.'
    ],
    typographyRules: {
      topBanner: 'Pill Ranong Delivery con link in bio.',
      primaryTitle: '🇹🇭 THAI SOPRA: Nome piatto in Thai grande con a capo semantico.',
      secondaryTitle: '🇬🇧 INGLESE SOTTO: Nome piatto in Inglese tagliato prima dei connettori logici. MAI Italiano.',
      priceBadge: 'Doppi prezzi 8" e 12" quando compare la pizza, prezzo singolo per gli altri.'
    },
    cameraMovement: 'Pan macro dinamico con ingresso fluido al 20% di velocità di crociera.',
    outroSpec: {
      timing: 'Sosta di 4.0s post-musica.',
      elements: [
        'Card contatti ad alto contrasto con QR Code LINE e indicazione consegna in box termico.'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare piatti contrassegnati come esauriti dal Kitchen Monitor.',
      'Vietato mostrare categorie duplicate.',
      'Vietato spezzare parole o sillabe a metà nei titoli.'
    ]
  },

  DS: {
    mode: 'DS',
    code: 'DS',
    badgeLabel: 'PIZZERIA DAILY SPECIAL DS',
    badgeColor: 'rose',
    title: '1 Piatto Daily Special Hero · Full Beat MP3 Outro',
    subtitle: 'Commercial ordinato e d’impatto con montaggio P1: 1 piatto protagonista (Vetrina o Special dello Chef) + QR Code LINE nel beat',
    targetPlatform: 'TikTok · Instagram Stories & Reels',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Intero brano MP3 (~11.7s – 13.0s, identico a P1). Piatto: fino al cantato "Flower Power!" (~8.85s), poi Outro & QR Code nel beat fino al termine (zero secondi aggiunti).',
    objective: 'Dare massimo risalto ed eleganza al piatto del giorno (es. Ravioli al Sugo di Noci in vetrina o primo speciale dello chef), convertendo gli ordini con ritmo musicale perfetto senza affollamento visivo.',
    assetRules: [
      '1 solo piatto protagonista con priorità rigorosa:',
      '  - Priorità 1: il 1° piatto attivo nella vetrina Daily Specials del Kitchen Monitor (es. Ravioli al Sugo di Noci).',
      '  - Priorità 2 (se vetrina vuota): il 1° piatto disponibile della categoria Daily Specials dal catalogo.',
      '📸 Regola Thumbnail Ufficiale: la copertina/thumbnail del video DEVE essere tassativamente il 1° piatto in vetrina al suo massimo zoom macro centrale prima dell’inizio del fade verso la 2a scena (zero ghosting / zero velo della seconda immagine).',
      'Rigorosamente verificato come DISPONIBILE nel Kitchen Monitor (Zero Sold Out / 86).'
    ],
    exclusions: [
      'DIVIETO ASSOLUTO PIATTI ESAURITI: Zero piatti contrassegnati come Sold Out dal Kitchen Monitor.',
      'DIVIETO ASSOLUTO BEVANDE: Zero bibite, alcolici o caffè.',
      'DIVIETO ASSOLUTO PAROLE ORFANE: Taglio semantico naturale prima di WITH/& in inglese e prima di salse/stile in Thai.',
      'DIVIETO ASSOLUTO PIZZA NAPOLETANA: Solo "Authentic Traditional Italian Pizza".'
    ],
    typographyRules: {
      topBanner: 'Piatto Vetrina: "● LIVE SHOWCASE · สดใหม่ในตู้โชว์ระนอง" con indicatore verde pulsante. Special Chef: "Chef Daily Special · สั่งทำสดใหม่".',
      primaryTitle: '🇹🇭 THAI SOPRA: Nome piatto grande in ambra con a capo semantico prima di salse/stile.',
      secondaryTitle: '🇬🇧 INGLESE SOTTO: Nome piatto in bianco tagliato prima dei connettori (WITH, &, ALLA). MAI Italiano.',
      priceBadge: 'Piatto Vetrina: Badge esclusivo pulsante "⭐ FRESH IN SHOWCASE TODAY". Special Chef: Badge "🍝 SPECIAL CREATION · เมนูพิเศษประจำวัน".'
    },
    cameraMovement: 'Food Macro Focus a 2 fasi continue come P1 (Pan orizzontale morbido + Rientro al centro con Climax Zoom Macro sul cuore del piatto prima del beat finale).',
    outroSpec: {
      timing: 'Entra a tempo di musica dentro la coda dell’MP3 (nessun secondo aggiunto, identico a P1).',
      elements: [
        'Logo Ufficiale Flower Power Pizza volante con rimbalzo elastico 3D.',
        'Titolo "FLOWER POWER PIZZA · RANONG THAILAND" a 36px/22px.',
        'Card Consegna con QR Code LINE Ufficiale (195px) scansionabile da schermo.',
        'Sito flowerpowerpizza.com, LINE @flowerpowerpizza e sconto 10% 1° ordine.'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare piatti contrassegnati come esauriti nel Kitchen Monitor.',
      'Vietato usare la parola "Napoletana".',
      'Vietato sfumare la musica prima della fine del brano.',
      'Vietato tagliare sillabe a metà nei titoli.'
    ]
  },

  V1: {
    mode: 'V1',
    code: 'V1',
    badgeLabel: 'VILLAGGIO STORIES V1',
    badgeColor: 'emerald',
    title: '1 Alloggio (Foto Principale) · Max 8 Secondi',
    subtitle: 'Pillola immersiva ad alto impatto per Instagram Stories: 1 camera nel verde',
    targetPlatform: 'Instagram Stories · TikTok',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Audio Koh Phayam limitato a massimo 8.0s con dissolvenza + 4.0s Outro Brand.',
    objective: 'Catturare l’immaginario tropicale del viaggiatore con una singola inquadratura mozzafiato della veranda o villa nel verde di Koh Phayam.',
    assetRules: [
      '1 sola foto principale di facciata, terrazza o camera King Size immersa nella natura.',
      'Attinto dai 18 alloggi ufficiali di Flower Power Village.'
    ],
    exclusions: [
      'DIVIETO CATEGORICO BAGNI: Zero foto di toilette, sanitari o wc.',
      'DIVIETO PREZZI: Rimosso totalmente il prezzo in V1 (riservato solo a LM1).'
    ],
    typographyRules: {
      topBanner: 'Banner Direct Booking · flowerpowervillage.com • Link in Bio.',
      primaryTitle: 'Nome alloggio in grande (es. "Green Bungalow") con sottotitolo a capo (es. "Tropical Hideaway").',
      secondaryTitle: '🇹🇭 Traduzione secca in Thai (es. "กรีน บังกะโล สไตล์ธรรมชาติใต้ร่มเงาไม้") SENZA MAI riscrivere l’inglese prima!',
      priceBadge: 'NESSUN PREZZO. Schermo 100% pulito ed emozionale.'
    },
    cameraMovement: 'Pan orizzontale dolce da Sinistra a Destra con leggero zoom in avanti a 1.15x.',
    outroSpec: {
      timing: '4.0s dopo la fine della carrellata.',
      elements: [
        'Logo Ufficiale Flower Power Village con alone smeraldo.',
        'Pulsante Gigante a 32px "🌐 flowerpowervillage.com".',
        'Benefit "✨ Best Rate Guaranteed Online" (senza parola Octorate).',
        'Call to action "👉 Link in Bio ➔ Book Your Stay".'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare prezzi in sovrimpressione.',
      'Vietato mostrare bagni.',
      'Vietato tilt verticali o punch-in centrali che tagliano la stanza.'
    ]
  },

  V2: {
    mode: 'V2',
    code: 'V2',
    badgeLabel: 'VILLAGGIO STORIES V2',
    badgeColor: 'emerald',
    title: '5 Foto Galleria dello STESSO Alloggio',
    subtitle: 'Virtual Tour cinematografico completo di un singolo bungalow o villa',
    targetPlatform: 'Instagram Stories & Reels · TikTok',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Durata dell’intero brano MP3 (~25s – 35s, ~5-7s a foto) + 4.0s Outro Brand.',
    objective: 'Fornire la visita virtuale definitiva di un alloggio specifico (dall’esterno alla veranda, dal soggiorno alla maestosa camera King Size).',
    assetRules: [
      'INTEGRITÀ STESSO ALLOGGIO: Tutte e 5 le foto appartengono TASSATIVAMENTE ed ESCLUSIVAMENTE allo stesso alloggio (es. tutte Villa Penthouse o tutte Green Bungalow).',
      'Sequenza narrativa: Facciata ➔ Veranda ➔ Living ➔ Letto King ➔ Terrazza.'
    ],
    exclusions: [
      'DIVIETO CATEGORICO BAGNI / TOILET: Mai mostrare bagni o sanitari.',
      'DIVIETO PREZZI: Zero prezzi in sovrimpressione.',
      'DIVIETO MIX: Mai mescolare foto di alloggi diversi.'
    ],
    typographyRules: {
      topBanner: 'Banner Direct Booking in alto · flowerpowervillage.com • Link in Bio.',
      primaryTitle: 'Nome alloggio in grande (es. "Green Bungalow") con sottotitolo semantico a capo (es. "Tropical Hideaway").',
      secondaryTitle: '🇹🇭 Traduzione secca in Thai della specifica inquadratura (es. "บังกะโลไม้สีเขียวท่ามกลางสวน") SENZA riscrittura dell’inglese prima!',
      priceBadge: 'NESSUN PREZZO.'
    },
    cameraMovement: '4 traiettorie ammesse dal Master Plan con partenza differenziata per alloggio per garantire zero ripetitività tra i reel.',
    outroSpec: {
      timing: '4.0s sosta a fine brano.',
      elements: [
        'Logo Flower Power Village timbrato 3D.',
        'Pulsante centrale 32px flowerpowervillage.com con bagliore smeraldo.',
        'Best Rate Guaranteed Online & Link in Bio.'
      ]
    },
    strictProhibitions: [
      'Vietato inserire foto di bagni o wc.',
      'Vietato mescolare alloggi diversi nella sequenza V2.',
      'Vietato inserire il badge del prezzo.'
    ]
  },

  V3: {
    mode: 'V3',
    code: 'V3',
    badgeLabel: 'VILLAGGIO STORIES V3',
    badgeColor: 'emerald',
    title: '5 Foto Principali di 5 DIVERSI Alloggi',
    subtitle: 'Panoramica d’insieme del resort: ville, bungalow tropicali e tende glamping',
    targetPlatform: 'Instagram Stories & Reels · TikTok',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Durata dell’intero brano MP3 (~25s – 35s, ~5-7s ad alloggio) + 4.0s Outro Brand.',
    objective: 'Mostrare la straordinaria varietà architettonica di Flower Power Village, dalle suite con terrazza ai bungalow in legno fino al glamping immerso nella giungla.',
    assetRules: [
      '5 foto principali di facciata di 5 alloggi completamente differenti del resort.',
      'Rappresentanza equilibrata: Ville, Bungalow e Tende Glamping.'
    ],
    exclusions: [
      'Divieto assoluto di bagni o spazi di servizio.',
      'Zero prezzi sui bungalow.'
    ],
    typographyRules: {
      topBanner: 'Banner Direct Booking in testata · flowerpowervillage.com • Link in Bio.',
      primaryTitle: 'Nome alloggio in grande + sottotitolo a capo (es. "Red Bungalow" a capo "Natural Retreat").',
      secondaryTitle: '🇹🇭 Traduzione secca in Thai.',
      priceBadge: 'Nessun prezzo.'
    },
    cameraMovement: 'Carrellate orizzontali e diagonali armoniose alternate a ogni alloggio.',
    outroSpec: {
      timing: '4.0s finale.',
      elements: [
        'Card prenotazione diretta gigante con pulsante web flowerpowervillage.com.'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare due volte lo stesso alloggio.',
      'Vietato mostrare prezzi.'
    ]
  },

  R1: {
    mode: 'R1',
    code: 'R1',
    badgeLabel: 'RESTAURANT STORIES R1',
    badgeColor: 'amber',
    title: '5 Piatti Ristorante Koh Phayam + WhatsApp Delivery',
    subtitle: 'Stories dedicata al Ristorante & Consegna Cibo a Koh Phayam tramite WhatsApp',
    targetPlatform: 'Instagram Stories · WhatsApp Status · TikTok',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Durata dell’intero brano MP3 isolano (~25s – 35s, ~5-7s a piatto) + 4.0s Outro Brand.',
    objective: 'Promuovere il ristorante di Flower Power Village per i clienti a Koh Phayam, stimolando la consegna al bungalow o a domicilio tramite WhatsApp.',
    assetRules: [
      '5 piatti caldi e autentici del ristorante (Pizze Tradizionali, Paste fresche, Secondi, Focacce calde, Dessert).',
      'Rigorosamente verificati come DISPONIBILI nel Kitchen Monitor (zero piatti esauriti/86).',
      'Foto culinarie reali HD con titoli bilingue Thai ed Inglese.'
    ],
    exclusions: [
      'DIVIETO ASSOLUTO PIATTI ESAURITI (86): Esclusi tutti i piatti contrassegnati come esauriti nel Kitchen Monitor.',
      'DIVIETO CATEGORICO BEVANDE: Zero birre, zero vini, zero bibite, zero caffè.',
      'DIVIETO CATEGORICO INSALATE: In R1 sono escluse tutte le insalate (solo piatti cucinati caldi e dessert).',
      'DIVIETO SITO WEB NEL BANNER SUPERIORE: Nel banner R1 non va messo il sito web (solo WhatsApp per consegna locale rapida).'
    ],
    typographyRules: {
      topBanner: 'Banner superiore a 3 righe: FLOWER POWER VILLAGE / [🟢 DELIVERY] lampeggiante · เดลิเวอรี่ / [✆ WhatsApp] +66 095 882 5573 (logo 48px, respiro a destra, zero sito web).',
      primaryTitle: '🇹🇭 Thai grande sopra.',
      secondaryTitle: '🇬🇧 Inglese sotto.',
      priceBadge: 'Prezzo singolo standard (in ฿) per tutti i piatti. Per le pizze viene esposto SOLO il prezzo della 12" (senza specifica delle 8", esattamente come piatto unico).'
    },
    cameraMovement: 'Pan macro e zoom continuo sui piatti caldi.',
    outroSpec: {
      timing: '4.0s post-brano.',
      elements: [
        'Outro Ristorante e Villaggio con logo ufficiale e contatti diretti.'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare piatti contrassegnati come esauriti dal Kitchen Monitor.',
      'Vietato mostrare insalate.',
      'Vietato mostrare bevande.',
      'Vietato inserire il sito web nel banner superiore.'
    ]
  },

  LM1: {
    mode: 'LM1',
    code: 'LM1',
    badgeLabel: 'LAST MINUTE LIVE LM1',
    badgeColor: 'amber',
    title: 'Stories Last Minute Live (Solo Camere Libere Oggi & Prezzi a Cascata)',
    subtitle: 'Format blindato che interroga il calendario Octorate ed espone solo le disponibilità odierne reali',
    targetPlatform: 'Instagram Stories · WhatsApp Status · TikTok',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Durata intero MP3 isolano divisa equamente tra gli alloggi liberi oggi (~7-10s ciascuno) + 4.0s Outro.',
    objective: 'Vendere all’istante gli alloggi rimasti invenduti per la notte odierna, offrendo il prezzo scontato reale a cascata attivo sul calendario.',
    assetRules: [
      'REGOLA 11 AGENTS.MD (Blindata & Immodificabile): Interroga live /api/octorate-grid.',
      'SOLO ALLOGGI APERTI E LIBERI OGGI (availability > 0, stopSells: false, closed: false). Mai alloggi occupati o liste casuali statiche.',
      'PREZZI REALI CON SCONTI A CASCATA: Mostra il prezzo effettivo calcolato dal calendario (es. Green Bungalow 711 ฿, Camel 387 ฿, Lagoon 387 ฿).'
    ],
    exclusions: [
      'DIVIETO CATEGORICO ALLOGGI OCCUPATI: Se un alloggio è prenotato oggi, non deve MAI comparire nel video.',
      'DIVIETO PREZZI BASE: Mai mostrare prezzi di listino generici non scontati.'
    ],
    typographyRules: {
      topBanner: 'Banner a 3 righe: FLOWER POWER VILLAGE / [🔴 LAST MINUTE] lampeggiante · ห้องว่างวันนี้ / Direct Booking • FlowerPowerVillage.com (senza Octorate).',
      primaryTitle: 'Nome alloggio in grande (es. "Green Bungalow") con sottotitolo semantico a capo (es. "Tropical Hideaway").',
      secondaryTitle: '🇹🇭 Traduzione secca in Thai (es. "กรีน บังกะโล สไตล์ธรรมชาติใต้ร่มเงาไม้").',
      priceBadge: 'Badge esclusivo giallo vivo bordato di nero con puntino rosso e simbolo ฿: [Today Last Minute: 711 ฿] (presente SOLO in LM1).'
    },
    cameraMovement: 'Pan orizzontale e diagonale sulle camere accoglienti e pronte per il check-in immediato.',
    outroSpec: {
      timing: '4.0s a fine musica.',
      elements: [
        'Logo Flower Power Village, pulsante gigante 32px flowerpowervillage.com, Best Rate Guaranteed Online.'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare alloggi non disponibili oggi sul calendario.',
      'Vietato inventare prezzi diversi da quelli a cascata del calendario.',
      'Vietato mostrare bagni.'
    ]
  },

  DS: {
    mode: 'DS',
    code: 'DS',
    badgeLabel: 'DAILY SPECIAL DS',
    badgeColor: 'amber',
    title: 'Daily Special (Fuori Menu · Piatto Fresco in Pronta Consegna)',
    subtitle: 'Commercial fuori menu dedicato alla freschezza del giorno: appena preparato e in pronta consegna a Ranong',
    targetPlatform: 'TikTok · Instagram Stories & Reels',
    aspectRatio: '9:16 Canvas Verticale (720x1280)',
    durationNote: 'Intero brano MP3 suddiviso tra i piatti speciali presenti in vetrina oggi (~4-8s a piatto) + 4.0s Outro Brand con QR Code.',
    objective: 'Promuovere le creazioni fresche del giorno dello chef e i fuori menu speciali, comunicando freschezza assoluta e pronta consegna immediata a domicilio a Ranong.',
    assetRules: [
      'REGOLA CARDINE DS: Il video si genera SOLO ED ESCLUSIVAMENTE se ci sono piatti attivi nella vetrina Daily Specials.',
      'Rigorosamente verificato come DISPONIBILE nel Kitchen Monitor (Zero piatti Sold Out / 86).',
      'Estratti fino a 4 piatti speciali attivi dal menu del giorno, ciascuno con foto HD reale, nome bilingue Thai/Inglese e prezzo ufficiale.'
    ],
    exclusions: [
      'DIVIETO ASSOLUTO GENERAZIONE A VUOTO: Se la vetrina è vuota o tutti i piatti sono Sold Out, il video non genera sequenze fittizie ma mostra lo stato informativo elegante.',
      'DIVIETO ASSOLUTO PIATTI ESAURITI (86): Esclusione istantanea dei piatti contrassegnati come esauriti nel Kitchen Monitor.',
      'DIVIETO CATEGORICO BEVANDE: Zero bevande, zero bibite, zero birre, zero caffè.'
    ],
    typographyRules: {
      topBanner: 'Pill esclusivo con logo Flower Power Pizza, [สดใหม่วันนี้ · DAILY SPECIAL] e [⚡ พร้อมส่ง • Fast Delivery • Ranong].',
      primaryTitle: '🇹🇭 THAI IN GRANDE SOPRA (20px font-black text-amber-300 drop-shadow).',
      secondaryTitle: '🇬🇧 INGLESE SOTTO (13px font-bold text-white).',
      priceBadge: 'Badge Piatto giallo vivo bordato di nero con testo nero, simbolo ฿, puntino rosso e dicitura bilingue [🔥 ทำสดใหม่ พร้อมส่งทันทีในระนอง / Freshly Made · Fast Delivery in Ranong].'
    },
    cameraMovement: 'Food Macro Focus fluido CapCut alternato (SX->DX e DX->SX con climax zoom macro sui piatti freschi).',
    outroSpec: {
      timing: '4.0s a fine musica.',
      elements: [
        'Logo Ufficiale Flower Power Pizza con rimbalzo elastico 3D.',
        'Titolo FLOWER POWER PIZZA · RANONG THAILAND.',
        'Card Consegna con QR Code LINE Ufficiale scansionabile da schermo, sito e sconto 10% 1° ordine.'
      ]
    },
    strictProhibitions: [
      'Vietato mostrare piatti non presenti nella vetrina del giorno.',
      'Vietato mostrare piatti esauriti nel Kitchen Monitor.',
      'Vietato mostrare bevande o alcolici.',
      'Vietato usare la parola "Napoletana".'
    ]
  }
};
