import fs from 'fs';

const fullAccommodationsData = [
  {
    name: 'Jungle Villa (Madre Intera)',
    keyName: 'jungle villa',
    motherId: '529773',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 2290,
    description: 'Tariffa Madre Master per la villa intera (Fan Base)',
    level1Nodes: [
      { id: '529784', name: 'JV BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '529778', name: 'JV 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '529779', name: 'JV 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '529792', name: 'JV Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '529788', name: 'JV Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '529780', name: 'JV AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '916817', name: 'JV AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '529781', name: 'JV AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '529801', name: 'JV AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921868', name: 'JV AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921869', name: 'JV AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '529783', name: 'JV AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '529813', name: 'JV AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Jungle Villa Left',
    keyName: 'jungle villa left',
    motherId: '495795',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 1390,
    description: 'Sotto-unità Sinistra (Madre Master Fan Base)',
    level1Nodes: [
      { id: '495807', name: 'JVL BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '495803', name: 'JVL 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '495804', name: 'JVL 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '496009', name: 'JVL Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '496001', name: 'JVL Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '495805', name: 'JVL AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '496022', name: 'JVL AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '495806', name: 'JVL AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '496031', name: 'JVL AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921870', name: 'JVL AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921871', name: 'JVL AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '495810', name: 'JVL AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '496057', name: 'JVL AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Jungle Villa Right',
    keyName: 'jungle villa right',
    motherId: '495796',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 1250,
    description: 'Sotto-unità Destra (Madre Master Fan Base)',
    level1Nodes: [
      { id: '495980', name: 'JVR BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '495976', name: 'JVR 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '495977', name: 'JVR 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '496010', name: 'JVR Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '496002', name: 'JVR Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '495978', name: 'JVR AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '496021', name: 'JVR AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '495979', name: 'JVR AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '496030', name: 'JVR AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921872', name: 'JVR AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921873', name: 'JVR AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '495982', name: 'JVR AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '496056', name: 'JVR AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Peace & Love Villa',
    keyName: 'peace & love villa',
    motherId: '494840',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 1200,
    description: 'Villa Indipendente (Madre Master Fan Base)',
    level1Nodes: [
      { id: '495566', name: 'P&L BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '495549', name: 'P&L 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '495551', name: 'P&L 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '495580', name: 'P&L Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '495575', name: 'P&L Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '495552', name: 'P&L AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '495587', name: 'P&L AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '495565', name: 'P&L AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '495593', name: 'P&L AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921874', name: 'P&L AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921875', name: 'P&L AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '495569', name: 'P&L AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '495609', name: 'P&L AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Villa Penthouse',
    keyName: 'villa penthouse',
    motherId: '421511',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 1200,
    description: 'Attico di lusso (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449348', name: 'Penthouse BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422445', name: 'Pent 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '421513', name: 'Pent 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '421516', name: 'Pent Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '421520', name: 'Pent Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '421522', name: 'Pent AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '421525', name: 'Pent AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '421527', name: 'Pent AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '421530', name: 'Pent AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921876', name: 'Pent AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921877', name: 'Pent AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '421532', name: 'Pent AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '421533', name: 'Pent AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Yellow Bungalow',
    keyName: 'yellow bungalow',
    motherId: '293957',
    category: 'Bungalow',
    hasAirCon: true,
    basePrice: 990,
    description: 'Bungalow tropicale (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449385', name: 'Yellow BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422422', name: 'Yellow 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293958', name: 'Yellow 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332055', name: 'Yellow Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332054', name: 'Yellow Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '331921', name: 'Yellow AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332057', name: 'Yellow AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '331922', name: 'Yellow AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332060', name: 'Yellow AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921878', name: 'Yellow AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921879', name: 'Yellow AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297022', name: 'Yellow AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '340198', name: 'Yellow AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Red Bungalow',
    keyName: 'red bungalow',
    motherId: '293954',
    category: 'Bungalow',
    hasAirCon: true,
    basePrice: 790,
    description: 'Bungalow iconico (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449422', name: 'Red BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422131', name: 'Red 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293953', name: 'Red 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332030', name: 'Red Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332029', name: 'Red Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '330964', name: 'Red AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332035', name: 'Red AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '330970', name: 'Red AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332036', name: 'Red AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921880', name: 'Red AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921881', name: 'Red AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297021', name: 'Red AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '340196', name: 'Red AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Green Bungalow',
    keyName: 'green bungalow',
    motherId: '293962',
    category: 'Bungalow',
    hasAirCon: true,
    basePrice: 790,
    description: 'Bungalow immerso nel verde (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449668', name: 'Green BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422402', name: 'Green 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293961', name: 'Green 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332070', name: 'Green Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332066', name: 'Green Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '331923', name: 'Green AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332072', name: 'Green AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '331924', name: 'Green AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332074', name: 'Green AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921882', name: 'Green AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921883', name: 'Green AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297023', name: 'Green AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '340200', name: 'Green AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Camel Tent Bungalow',
    keyName: 'camel tent bungalow',
    motherId: '293965',
    category: 'Glamping',
    hasAirCon: false,
    basePrice: 450,
    description: 'Tenda Glamping Safari (Solo Ventilatore - Nessuna opzione AC)',
    level1Nodes: [
      { id: '449675', name: 'Camel BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422325', name: 'Camel 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293966', name: 'Camel 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332089', name: 'Camel Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332084', name: 'Camel Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '297025', name: 'Camel AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'] }
    ]
  },
  {
    name: 'Lagoon Tent Bungalow',
    keyName: 'lagoon tent bungalow',
    motherId: '293955',
    category: 'Glamping',
    hasAirCon: false,
    basePrice: 450,
    description: 'Tenda Glamping Laguna (Solo Ventilatore - Nessuna opzione AC)',
    level1Nodes: [
      { id: '449674', name: 'Lagoon BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422351', name: 'Lagoon 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293956', name: 'Lagoon 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332081', name: 'Lagoon Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332077', name: 'Lagoon Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '297024', name: 'Lagoon AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'] }
    ]
  },
  {
    name: 'Room 1',
    keyName: 'room 1',
    motherId: '293963',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449678', name: 'Room 1 BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422300', name: 'Room 1 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293964', name: 'Room 1 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332737', name: 'Room 1 Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332735', name: 'Room 1 Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '331976', name: 'Room 1 AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '916818', name: 'Room 1 AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '331977', name: 'Room 1 AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '916402', name: 'Room 1 AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921889', name: 'Room 1 AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921890', name: 'Room 1 AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297033', name: 'Room 1 AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '421505', name: 'Room 1 AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Room 2',
    keyName: 'room 2',
    motherId: '293959',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449684', name: 'Room 2 BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422296', name: 'Room 2 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293960', name: 'Room 2 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332741', name: 'Room 2 Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332739', name: 'Room 2 Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '331966', name: 'Room 2 AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332119', name: 'Room 2 AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '331967', name: 'Room 2 AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332134', name: 'Room 2 AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921891', name: 'Room 2 AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921900', name: 'Room 2 AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297032', name: 'Room 2 AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '421506', name: 'Room 2 AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Room 3',
    keyName: 'room 3',
    motherId: '293948',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449699', name: 'Room 3 BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422293', name: 'Room 3 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293947', name: 'Room 3 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332743', name: 'Room 3 Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332757', name: 'Room 3 Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '331968', name: 'Room 3 AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332121', name: 'Room 3 AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '331969', name: 'Room 3 AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332136', name: 'Room 3 AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921892', name: 'Room 3 AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921893', name: 'Room 3 AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297028', name: 'Room 3 AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '421507', name: 'Room 3 AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Room 4',
    keyName: 'room 4',
    motherId: '293945',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449724', name: 'Room 4 BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422265', name: 'Room 4 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293946', name: 'Room 4 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332759', name: 'Room 4 Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332746', name: 'Room 4 Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '331970', name: 'Room 4 AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332123', name: 'Room 4 AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '331971', name: 'Room 4 AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332138', name: 'Room 4 AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921894', name: 'Room 4 AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921895', name: 'Room 4 AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297029', name: 'Room 4 AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '421508', name: 'Room 4 AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Room 5',
    keyName: 'room 5',
    motherId: '293943',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449730', name: 'Room 5 BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422213', name: 'Room 5 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293944', name: 'Room 5 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332765', name: 'Room 5 Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332763', name: 'Room 5 Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '331972', name: 'Room 5 AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332125', name: 'Room 5 AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '331973', name: 'Room 5 AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332140', name: 'Room 5 AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921896', name: 'Room 5 AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921897', name: 'Room 5 AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297031', name: 'Room 5 AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '421509', name: 'Room 5 AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Lodge 1',
    keyName: 'lodge 1',
    motherId: '293951',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 400,
    description: 'Lodge Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449736', name: 'Lodge 1 BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '422149', name: 'Lodge 1 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293952', name: 'Lodge 1 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332769', name: 'Lodge 1 Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332767', name: 'Lodge 1 Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '331974', name: 'Lodge 1 AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332129', name: 'Lodge 1 AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '422157', name: 'Lodge 1 AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '332142', name: 'Lodge 1 AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921884', name: 'Lodge 1 AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921885', name: 'Lodge 1 AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297030', name: 'Lodge 1 AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '421510', name: 'Lodge 1 AC AirBnB', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Lodge 2',
    keyName: 'lodge 2',
    motherId: '883795',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 400,
    description: 'Lodge Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      { id: '923905', name: 'Lodge 2 BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '916110', name: 'Lodge 2 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '916108', name: 'Lodge 2 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '916107', name: 'Lodge 2 Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '916109', name: 'Lodge 2 Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '916114', name: 'Lodge 2 AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '916829', name: 'Lodge 2 AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '916105', name: 'Lodge 2 AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '916830', name: 'Lodge 2 AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921886', name: 'Lodge 2 AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921887', name: 'Lodge 2 AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '916103', name: 'Lodge 2 AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '916104', name: 'Lodge 2 AC AirBnB', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  },
  {
    name: 'Internal Room',
    keyName: 'internal room',
    motherId: '293942',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera economica vista interna (Madre Master Fan Base)',
    level1Nodes: [
      { id: '449742', name: 'Inter BE', ruleTag: '-, AM', ruleDesc: 'Sconto 10% Sito', agencies: ['AGENCY_WEBSITE'] },
      { id: '872182', name: 'Inter 7d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '293941', name: 'Inter 14d', ruleTag: '-, AM', ruleDesc: 'Standard Promo 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA', 'AGENCY_AGODA'] },
      { id: '332109', name: 'Inter Main bnb-14d', ruleTag: '+200฿ AM', ruleDesc: 'Booking/Expedia Fan 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { id: '332105', name: 'Inter Main bnb-7d', ruleTag: '-, AM', ruleDesc: 'Booking/Expedia Fan 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] },
      { 
        id: '340367', name: 'Inter AC7d', ruleTag: '+400฿ AM', ruleDesc: 'Master AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '916840', name: 'Inter AC bnb-7d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 7d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { 
        id: '421998', name: 'Inter AC14d', ruleTag: '+500฿ AM', ruleDesc: 'Master AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'],
        subChild: { id: '916838', name: 'Inter AC bnb-14d', ruleTag: '+200฿ AMR', ruleDesc: 'Booking & Expedia AC 14d', agencies: ['AGENCY_BOOKING', 'AGENCY_EXPEDIA'] }
      },
      { id: '921898', name: 'Inter AGD AC-7d', ruleTag: '+500฿ AM', ruleDesc: 'Agoda AC 7d', agencies: ['AGENCY_AGODA'] },
      { id: '921899', name: 'Inter AGD AC-14d', ruleTag: '-, AM', ruleDesc: 'Agoda AC 14d', agencies: ['AGENCY_AGODA'] },
      { 
        id: '297027', name: 'Inter AirBnB', ruleTag: '-, AM', ruleDesc: 'Airbnb Fan', agencies: ['AGENCY_AIRBNB'],
        subChild: { id: '422147', name: 'Inter AirBnB AC', ruleTag: '+400฿ AMR', ruleDesc: 'Airbnb AirCon', agencies: ['AGENCY_AIRBNB_AC'] }
      }
    ]
  }
];

// Write updated DerivedRatesTreeSection.tsx data structure
console.log('Writing updated DerivedRatesTreeSection.tsx data...');
let derivedFile = fs.readFileSync('src/admin/resort/components/DerivedRatesTreeSection.tsx', 'utf8');

// Convert JS array to TS string representation
function serializeSchemes(schemes) {
  let str = 'export const COMPLETE_DERIVATION_SCHEMES: AccommodationTreeScheme[] = [\n';
  for (const s of schemes) {
    str += `  {\n`;
    str += `    name: '${s.name}',\n`;
    str += `    motherId: '${s.motherId}',\n`;
    str += `    category: '${s.category}',\n`;
    str += `    hasAirCon: ${s.hasAirCon},\n`;
    str += `    basePrice: ${s.basePrice},\n`;
    str += `    description: '${s.description}',\n`;
    str += `    level1Nodes: [\n`;
    for (const node of s.level1Nodes) {
      str += `      {\n`;
      str += `        id: '${node.id}',\n`;
      str += `        name: '${node.name}',\n`;
      str += `        ruleTag: '${node.ruleTag}',\n`;
      str += `        ruleDesc: '${node.ruleDesc}',\n`;
      str += `        agencies: [${node.agencies.join(', ')}]`;
      if (node.subChild) {
        str += `,\n        subChild: {\n`;
        str += `          id: '${node.subChild.id}',\n`;
        str += `          name: '${node.subChild.name}',\n`;
        str += `          ruleTag: '${node.subChild.ruleTag}',\n`;
        str += `          ruleDesc: '${node.subChild.ruleDesc}',\n`;
        str += `          agencies: [${node.subChild.agencies.join(', ')}]\n`;
        str += `        }\n`;
      } else {
        str += `\n`;
      }
      str += `      },\n`;
    }
    str += `    ]\n`;
    str += `  },\n`;
  }
  str += '];\n';
  return str;
}

const startMarker = 'export const COMPLETE_DERIVATION_SCHEMES: AccommodationTreeScheme[] = [';
const endMarker = 'export function DerivedRatesTreeSection() {';

const startIdx = derivedFile.indexOf(startMarker);
const endIdx = derivedFile.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const newContent = derivedFile.substring(0, startIdx) + serializeSchemes(fullAccommodationsData) + '\n' + derivedFile.substring(endIdx);
  fs.writeFileSync('src/admin/resort/components/DerivedRatesTreeSection.tsx', newContent);
  console.log('Successfully updated DerivedRatesTreeSection.tsx with all 200 IDs!');
} else {
  console.error('Markers not found in DerivedRatesTreeSection.tsx');
}

// Write updated ResortVisualCalendar.tsx ALL_ACCOMMODATIONS_MAP
let calendarFile = fs.readFileSync('src/admin/resort/components/ResortVisualCalendar.tsx', 'utf8');

function extractAllIdsForRoom(acc) {
  const set = new Set();
  set.add(acc.motherId);
  for (const n of acc.level1Nodes) {
    set.add(n.id);
    if (n.subChild) set.add(n.subChild.id);
  }
  return Array.from(set);
}

// Current keywords map from calendar
const keywordsMap = {
  'jungle villa': [['jungle', 'jv'], ['villa', 'ac']],
  'jungle villa left': [['jungle', 'jv'], ['left', 'jvl']],
  'jungle villa right': [['jungle', 'jv'], ['right', 'jvr']],
  'peace & love villa': [['peace', 'love', 'p&l']],
  'villa penthouse': [['penthouse', 'pent']],
  'yellow bungalow': [['yellow']],
  'red bungalow': [['red']],
  'green bungalow': [['green']],
  'camel tent bungalow': [['camel']],
  'lagoon tent bungalow': [['lagoon']],
  'room 1': [['room', 'hub'], ['1', 'one']],
  'room 2': [['room', 'hub'], ['2', 'two']],
  'room 3': [['room', 'hub'], ['3', 'three']],
  'room 4': [['room', 'hub'], ['4', 'four']],
  'room 5': [['room', 'hub'], ['5', 'five']],
  'lodge 1': [['lodge'], ['1', 'one']],
  'lodge 2': [['lodge'], ['2', 'two']],
  'internal room': [['internal', 'inter']]
};

let mapStr = 'const ALL_ACCOMMODATIONS_MAP: Record<string, { ids: string[]; keywords: string[][] }> = {\n';
for (const acc of fullAccommodationsData) {
  const ids = extractAllIdsForRoom(acc);
  const kw = keywordsMap[acc.keyName] || [[acc.keyName.split(' ')[0]]];
  mapStr += `  '${acc.keyName}': {\n`;
  mapStr += `    ids: [${ids.map(i => `'${i}'`).join(', ')}],\n`;
  mapStr += `    keywords: ${JSON.stringify(kw)}\n`;
  mapStr += `  },\n`;
}
mapStr += '};\n';

const mapStartMarker = 'const ALL_ACCOMMODATIONS_MAP: Record<string, { ids: string[]; keywords: string[][] }> = {';
const mapEndMarker = 'function toThailandDateStr(raw: any): string {';

const mStart = calendarFile.indexOf(mapStartMarker);
const mEnd = calendarFile.indexOf(mapEndMarker);

if (mStart !== -1 && mEnd !== -1) {
  const newCal = calendarFile.substring(0, mStart) + mapStr + '\n' + calendarFile.substring(mEnd);
  fs.writeFileSync('src/admin/resort/components/ResortVisualCalendar.tsx', newCal);
  console.log('Successfully updated ResortVisualCalendar.tsx ALL_ACCOMMODATIONS_MAP!');
} else {
  console.error('Map markers not found in ResortVisualCalendar.tsx');
}
