import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Search, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  Wind,
  Sun,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Coffee,
  CheckCircle
} from 'lucide-react';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { fetchOctorateMonthlyGrid } from '../../../booking/lib/octorate';

export interface AgencyBadge {
  name: string;
  color: string;
  bg: string;
  border: string;
}

export interface SubChildNode {
  id: string;
  name: string;
  ruleTag: string; // e.g. "+200฿ AMR", "+400฿ AMR"
  ruleDesc: string;
  agencies: AgencyBadge[];
}

export interface Level1Node {
  id: string;
  name: string;
  ruleTag: string; // e.g. "-, AM", "+400฿ AM", "+500฿ AM"
  ruleDesc: string;
  agencies: AgencyBadge[];
  subChild?: SubChildNode; // Sub-child hanging directly underneath
}

export interface AccommodationTreeScheme {
  motherId: string;
  name: string;
  category: 'Villa' | 'Bungalow' | 'Glamping' | 'Hub Guesthouse' | 'TEST';
  hasAirCon: boolean;
  basePrice: number;
  description: string;
  level1Nodes: Level1Node[];
}

// Common Agency Badges
const AGENCY_WEBSITE: AgencyBadge = { name: 'WEBSITE', color: 'text-emerald-300', bg: 'bg-emerald-950', border: 'border-emerald-500/70' };
const AGENCY_BOOKING: AgencyBadge = { name: 'BOOKING', color: 'text-blue-200 font-extrabold', bg: 'bg-[#003580]', border: 'border-blue-400/80' };
const AGENCY_EXPEDIA: AgencyBadge = { name: 'EXPEDIA', color: 'text-sky-300 font-extrabold', bg: 'bg-sky-950', border: 'border-sky-400/80' };
const AGENCY_AGODA: AgencyBadge = { name: 'AGODA', color: 'text-purple-300 font-extrabold', bg: 'bg-purple-950', border: 'border-purple-500/70' };
const AGENCY_AIRBNB: AgencyBadge = { name: 'AIRBNB', color: 'text-rose-300 font-extrabold', bg: 'bg-rose-950', border: 'border-rose-500/70' };
const AGENCY_AIRBNB_AC: AgencyBadge = { name: 'AIRBNB AC', color: 'text-rose-200 font-black', bg: 'bg-rose-900', border: 'border-rose-400' };

// Complete 18 Accommodations Array in EXACT Website & Calendar Order
export const COMPLETE_DERIVATION_SCHEMES: AccommodationTreeScheme[] = [
  {
    name: 'Jungle Villa (Madre Intera)',
    motherId: '529773',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 2290,
    description: 'Tariffa Madre Master per la villa intera (Fan Base)',
    level1Nodes: [
      {
        id: '529784',
        name: 'JV BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '529778',
        name: 'JV 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '529779',
        name: 'JV 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '529792',
        name: 'JV Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '529788',
        name: 'JV Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '529780',
        name: 'JV AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '916817',
          name: 'JV AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '529781',
        name: 'JV AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '529801',
          name: 'JV AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921868',
        name: 'JV AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921869',
        name: 'JV AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '529783',
        name: 'JV AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '529813',
          name: 'JV AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Jungle Villa Left',
    motherId: '495795',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 1390,
    description: 'Sotto-unitร  Sinistra (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '495807',
        name: 'JVL BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '495803',
        name: 'JVL 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '495804',
        name: 'JVL 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '496009',
        name: 'JVL Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '496001',
        name: 'JVL Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '495805',
        name: 'JVL AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '496022',
          name: 'JVL AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '495806',
        name: 'JVL AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '496031',
          name: 'JVL AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921870',
        name: 'JVL AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921871',
        name: 'JVL AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '495810',
        name: 'JVL AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '496057',
          name: 'JVL AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Jungle Villa Right',
    motherId: '495796',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 1250,
    description: 'Sotto-unitร  Destra (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '495980',
        name: 'JVR BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '495976',
        name: 'JVR 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '495977',
        name: 'JVR 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '496010',
        name: 'JVR Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '496002',
        name: 'JVR Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '495978',
        name: 'JVR AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '496021',
          name: 'JVR AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '495979',
        name: 'JVR AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '496030',
          name: 'JVR AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921872',
        name: 'JVR AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921873',
        name: 'JVR AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '495982',
        name: 'JVR AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '496056',
          name: 'JVR AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Peace & Love Villa',
    motherId: '494840',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 1200,
    description: 'Villa Indipendente (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '495566',
        name: 'P&L BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '495549',
        name: 'P&L 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '495551',
        name: 'P&L 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '495580',
        name: 'P&L Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '495575',
        name: 'P&L Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '495552',
        name: 'P&L AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '495587',
          name: 'P&L AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '495565',
        name: 'P&L AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '495593',
          name: 'P&L AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921874',
        name: 'P&L AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921875',
        name: 'P&L AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '495569',
        name: 'P&L AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '495609',
          name: 'P&L AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Villa Penthouse',
    motherId: '421511',
    category: 'Villa',
    hasAirCon: true,
    basePrice: 1200,
    description: 'Attico di lusso (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449348',
        name: 'Penthouse BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422445',
        name: 'Pent 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '421513',
        name: 'Pent 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '421516',
        name: 'Pent Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '421520',
        name: 'Pent Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '421522',
        name: 'Pent AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '421525',
          name: 'Pent AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '421527',
        name: 'Pent AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '421530',
          name: 'Pent AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921876',
        name: 'Pent AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921877',
        name: 'Pent AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '421532',
        name: 'Pent AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '421533',
          name: 'Pent AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Yellow Bungalow',
    motherId: '293957',
    category: 'Bungalow',
    hasAirCon: true,
    basePrice: 990,
    description: 'Bungalow tropicale (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449385',
        name: 'Yellow BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422422',
        name: 'Yellow 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293958',
        name: 'Yellow 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332055',
        name: 'Yellow Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332054',
        name: 'Yellow Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '331921',
        name: 'Yellow AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332057',
          name: 'Yellow AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '331922',
        name: 'Yellow AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332060',
          name: 'Yellow AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921878',
        name: 'Yellow AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921879',
        name: 'Yellow AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297022',
        name: 'Yellow AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '340198',
          name: 'Yellow AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Red Bungalow',
    motherId: '293954',
    category: 'Bungalow',
    hasAirCon: true,
    basePrice: 790,
    description: 'Bungalow iconico (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449422',
        name: 'Red BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422131',
        name: 'Red 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293953',
        name: 'Red 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332030',
        name: 'Red Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332029',
        name: 'Red Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '330964',
        name: 'Red AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332035',
          name: 'Red AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '330970',
        name: 'Red AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332036',
          name: 'Red AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921880',
        name: 'Red AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921881',
        name: 'Red AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297021',
        name: 'Red AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '340196',
          name: 'Red AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Green Bungalow',
    motherId: '293962',
    category: 'Bungalow',
    hasAirCon: true,
    basePrice: 790,
    description: 'Bungalow immerso nel verde (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449668',
        name: 'Green BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422402',
        name: 'Green 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293961',
        name: 'Green 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332070',
        name: 'Green Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332066',
        name: 'Green Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '331923',
        name: 'Green AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332072',
          name: 'Green AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '331924',
        name: 'Green AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332074',
          name: 'Green AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921882',
        name: 'Green AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921883',
        name: 'Green AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297023',
        name: 'Green AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '340200',
          name: 'Green AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Camel Tent Bungalow',
    motherId: '293965',
    category: 'Glamping',
    hasAirCon: false,
    basePrice: 450,
    description: 'Tenda Glamping Safari (Solo Ventilatore - Nessuna opzione AC)',
    level1Nodes: [
      {
        id: '449675',
        name: 'Camel BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422325',
        name: 'Camel 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293966',
        name: 'Camel 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332089',
        name: 'Camel Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332084',
        name: 'Camel Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '297025',
        name: 'Camel AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB]
      },
    ]
  },
  {
    name: 'Lagoon Tent Bungalow',
    motherId: '293955',
    category: 'Glamping',
    hasAirCon: false,
    basePrice: 450,
    description: 'Tenda Glamping Laguna (Solo Ventilatore - Nessuna opzione AC)',
    level1Nodes: [
      {
        id: '449674',
        name: 'Lagoon BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422351',
        name: 'Lagoon 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293956',
        name: 'Lagoon 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332081',
        name: 'Lagoon Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332077',
        name: 'Lagoon Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '297024',
        name: 'Lagoon AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB]
      },
    ]
  },
  {
    name: 'Room 1',
    motherId: '293963',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449678',
        name: 'Room 1 BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422300',
        name: 'Room 1 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293964',
        name: 'Room 1 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332737',
        name: 'Room 1 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332735',
        name: 'Room 1 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '331976',
        name: 'Room 1 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '916818',
          name: 'Room 1 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '331977',
        name: 'Room 1 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '916402',
          name: 'Room 1 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921889',
        name: 'Room 1 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921890',
        name: 'Room 1 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297033',
        name: 'Room 1 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '421505',
          name: 'Room 1 AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Room 2',
    motherId: '293959',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449684',
        name: 'Room 2 BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422296',
        name: 'Room 2 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293960',
        name: 'Room 2 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332741',
        name: 'Room 2 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332739',
        name: 'Room 2 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '331966',
        name: 'Room 2 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332119',
          name: 'Room 2 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '331967',
        name: 'Room 2 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332134',
          name: 'Room 2 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921891',
        name: 'Room 2 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921900',
        name: 'Room 2 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297032',
        name: 'Room 2 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '421506',
          name: 'Room 2 AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Room 3',
    motherId: '293948',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449699',
        name: 'Room 3 BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422293',
        name: 'Room 3 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293947',
        name: 'Room 3 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332743',
        name: 'Room 3 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332757',
        name: 'Room 3 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '331968',
        name: 'Room 3 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332121',
          name: 'Room 3 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '331969',
        name: 'Room 3 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332136',
          name: 'Room 3 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921892',
        name: 'Room 3 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921893',
        name: 'Room 3 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297028',
        name: 'Room 3 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '421507',
          name: 'Room 3 AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Room 4',
    motherId: '293945',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449724',
        name: 'Room 4 BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422265',
        name: 'Room 4 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293946',
        name: 'Room 4 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332759',
        name: 'Room 4 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332746',
        name: 'Room 4 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '331970',
        name: 'Room 4 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332123',
          name: 'Room 4 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '331971',
        name: 'Room 4 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332138',
          name: 'Room 4 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921894',
        name: 'Room 4 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921895',
        name: 'Room 4 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297029',
        name: 'Room 4 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '421508',
          name: 'Room 4 AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Room 5',
    motherId: '293943',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449730',
        name: 'Room 5 BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422213',
        name: 'Room 5 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293944',
        name: 'Room 5 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332765',
        name: 'Room 5 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332763',
        name: 'Room 5 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '331972',
        name: 'Room 5 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332125',
          name: 'Room 5 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '331973',
        name: 'Room 5 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332140',
          name: 'Room 5 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921896',
        name: 'Room 5 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921897',
        name: 'Room 5 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297031',
        name: 'Room 5 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '421509',
          name: 'Room 5 AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Lodge 1',
    motherId: '293951',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 400,
    description: 'Lodge Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449736',
        name: 'Lodge 1 BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '422149',
        name: 'Lodge 1 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293952',
        name: 'Lodge 1 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332769',
        name: 'Lodge 1 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332767',
        name: 'Lodge 1 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '331974',
        name: 'Lodge 1 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332129',
          name: 'Lodge 1 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '422157',
        name: 'Lodge 1 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '332142',
          name: 'Lodge 1 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921884',
        name: 'Lodge 1 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921885',
        name: 'Lodge 1 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297030',
        name: 'Lodge 1 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '421510',
          name: 'Lodge 1 AC AirBnB',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Lodge 2',
    motherId: '883795',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 400,
    description: 'Lodge Guesthouse Hub (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '923905',
        name: 'Lodge 2 BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '916110',
        name: 'Lodge 2 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '916108',
        name: 'Lodge 2 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '916107',
        name: 'Lodge 2 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '916109',
        name: 'Lodge 2 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '916114',
        name: 'Lodge 2 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '916829',
          name: 'Lodge 2 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '916105',
        name: 'Lodge 2 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '916830',
          name: 'Lodge 2 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921886',
        name: 'Lodge 2 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921887',
        name: 'Lodge 2 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '916103',
        name: 'Lodge 2 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '916104',
          name: 'Lodge 2 AC AirBnB',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    name: 'Internal Room',
    motherId: '293942',
    category: 'Hub Guesthouse',
    hasAirCon: true,
    basePrice: 350,
    description: 'Camera economica vista interna (Madre Master Fan Base)',
    level1Nodes: [
      {
        id: '449742',
        name: 'Inter BE',
        ruleTag: '-, AM',
        ruleDesc: 'Sconto 10% Sito',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '872182',
        name: 'Inter 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '293941',
        name: 'Inter 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '332109',
        name: 'Inter Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '332105',
        name: 'Inter Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '340367',
        name: 'Inter AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '916840',
          name: 'Inter AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '421998',
        name: 'Inter AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '916838',
          name: 'Inter AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '921898',
        name: 'Inter AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '921899',
        name: 'Inter AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '297027',
        name: 'Inter AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '422147',
          name: 'Inter AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      },
    ]
  },
  {
    motherId: '649669',
    name: 'Fake Bungalow 1',
    category: 'TEST',
    hasAirCon: false,
    basePrice: 1000,
    description: 'Unitร  di test isolata dalle OTA โ€” simulazioni MinStay e scrittura sicura',
    level1Nodes: [
      {
        id: '932243',
        name: 'FB1 BE',
        ruleTag: 'Master',
        ruleDesc: 'Booking Engine Master Rate',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '932244',
        name: 'FB1 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '932245',
        name: 'FB1 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '932246',
        name: 'FB1 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '932247',
        name: 'FB1 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '932248',
        name: 'FB1 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '932254',
          name: 'FB1 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '932249',
        name: 'FB1 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '932255',
          name: 'FB1 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '932250',
        name: 'FB1 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '932251',
        name: 'FB1 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '932252',
        name: 'FB1 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '932253',
          name: 'FB1 AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      }
    ]
  },
  {
    motherId: '921799',
    name: 'Fake Bungalow 2',
    category: 'TEST',
    hasAirCon: false,
    basePrice: 1000,
    description: 'Unitร  di test isolata dalle OTA โ€” simulazioni MinStay e scrittura sicura',
    level1Nodes: [
      {
        id: '932256',
        name: 'FB2 BE',
        ruleTag: 'Master',
        ruleDesc: 'Booking Engine Master Rate',
        agencies: [AGENCY_WEBSITE]
      },
      {
        id: '932257',
        name: 'FB2 7d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '932258',
        name: 'FB2 14d',
        ruleTag: '-, AM',
        ruleDesc: 'Standard Promo 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA, AGENCY_AGODA]
      },
      {
        id: '932259',
        name: 'FB2 Main bnb-7d',
        ruleTag: '-, AM',
        ruleDesc: 'Booking/Expedia Fan 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '932260',
        name: 'FB2 Main bnb-14d',
        ruleTag: '+200฿ AM',
        ruleDesc: 'Booking/Expedia Fan 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
      },
      {
        id: '932261',
        name: 'FB2 AC7d',
        ruleTag: '+400฿ AM',
        ruleDesc: 'Master AC 7d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '932267',
          name: 'FB2 AC bnb-7d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 7d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '932262',
        name: 'FB2 AC14d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Master AC 14d',
        agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA],
        subChild: {
          id: '932268',
          name: 'FB2 AC bnb-14d',
          ruleTag: '+200฿ AMR',
          ruleDesc: 'Booking & Expedia AC 14d',
          agencies: [AGENCY_BOOKING, AGENCY_EXPEDIA]
        }
      },
      {
        id: '932263',
        name: 'FB2 AGD AC-7d',
        ruleTag: '+500฿ AM',
        ruleDesc: 'Agoda AC 7d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '932264',
        name: 'FB2 AGD AC-14d',
        ruleTag: '-, AM',
        ruleDesc: 'Agoda AC 14d',
        agencies: [AGENCY_AGODA]
      },
      {
        id: '932265',
        name: 'FB2 AirBnB',
        ruleTag: '-, AM',
        ruleDesc: 'Airbnb Fan',
        agencies: [AGENCY_AIRBNB],
        subChild: {
          id: '932266',
          name: 'FB2 AirBnB AC',
          ruleTag: '+400฿ AMR',
          ruleDesc: 'Airbnb AirCon',
          agencies: [AGENCY_AIRBNB_AC]
        }
      }
    ]
  },
];

export function DerivedRatesTreeSection() {
  const { rawOctorateGridItems, isSimulationActive, simulatedOctorateGridItems } = useResortAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedDateISO, setSelectedDateISO] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [loadingSync, setLoadingSync] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  // Unified base prices state for AC and Breakfast
  const [customAcInput, setCustomAcInput] = useState<number>(() => {
    const saved = localStorage.getItem('fpv_derived_ac_price');
    return saved ? Number(saved) : 400;
  });
  const [appliedAcPrice, setAppliedAcPrice] = useState<number>(() => {
    const saved = localStorage.getItem('fpv_derived_ac_price');
    return saved ? Number(saved) : 400;
  });

  const [customBreakfastInput, setCustomBreakfastInput] = useState<number>(() => {
    const saved = localStorage.getItem('fpv_derived_breakfast_price');
    return saved ? Number(saved) : 150;
  });
  const [appliedBreakfastPrice, setAppliedBreakfastPrice] = useState<number>(() => {
    const saved = localStorage.getItem('fpv_derived_breakfast_price');
    return saved ? Number(saved) : 150;
  });

  const [confirmModal, setConfirmModal] = useState<{ type: 'AC' | 'BREAKFAST'; val: number } | null>(null);
  const [unificationStatus, setUnificationStatus] = useState<string | null>(null);

  const handleApplyUnification = (type: 'AC' | 'BREAKFAST', val: number) => {
    if (type === 'AC') {
      setAppliedAcPrice(val);
      localStorage.setItem('fpv_derived_ac_price', String(val));
      setUnificationStatus(`Prezzo unico Aria Condizionata (${val} ฿) applicato con successo a tutte le tariffe derivate AC del villaggio!`);
    } else {
      setAppliedBreakfastPrice(val);
      localStorage.setItem('fpv_derived_breakfast_price', String(val));
      setUnificationStatus(`Prezzo unico 1 Colazione (${val} ฿) applicato con successo a tutte le derivate!`);
    }
    setConfirmModal(null);
  };

  const toggleRoom = (name: string) => {
    setExpandedRooms(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    COMPLETE_DERIVATION_SCHEMES.forEach(item => { all[item.name] = true; });
    setExpandedRooms(all);
  };

  const collapseAll = () => {
    setExpandedRooms({});
  };

  const handleRefreshLiveGrid = async () => {
    setLoadingSync(true);
    try {
      await fetchOctorateMonthlyGrid(selectedDateISO, selectedDateISO);
    } catch (err) {
      console.warn('[DerivedRatesTreeSection] Live sync error:', err);
    } finally {
      setLoadingSync(false);
    }
  };

  useEffect(() => {
    if (rawOctorateGridItems.length === 0 && !isSimulationActive) {
      handleRefreshLiveGrid();
    }
  }, [selectedDateISO]);

  const getNodeLiveData = (nodeId: string) => {
    let foundSimulated = false;
    let found = null;

    if (isSimulationActive && simulatedOctorateGridItems && simulatedOctorateGridItems.length > 0) {
      found = simulatedOctorateGridItems.find(item => String(item.id || item.ratePlanId || item.rate_id) === String(nodeId));
      if (found) foundSimulated = true;
    }

    if (!found && rawOctorateGridItems && rawOctorateGridItems.length > 0) {
      found = rawOctorateGridItems.find(item => String(item.id || item.ratePlanId || item.rate_id) === String(nodeId));
    }

    if (!found) return null;

    const price = Number(found.price || found.days?.[0]?.price || 0);
    const minstay = Number(found.minStay || found.minstay || found.days?.[0]?.minStay || 2);
    const isStopSell = Boolean(
      found.stopSell || 
      found.stopSells || 
      found.days?.[0]?.stopSell || 
      price >= 10000 || 
      found.availability === 0 || 
      found.available === false
    );
    const isAvailable = !isStopSell && price > 0 && 10000 > price;

    return {
      price,
      minstay,
      isStopSell,
      isAvailable,
      rawItem: found,
      isSimulated: foundSimulated || Boolean(found.isSimulated || isSimulationActive)
    };
  };

  const checkPriceSanity = (parentPrice: number, ruleTag: string, livePrice: number) => {
    if (!parentPrice || !livePrice || parentPrice <= 0 || livePrice <= 0) {
      return { isDiscrepancy: false, expectedPrice: 0, diff: 0 };
    }

    let expectedPrice = parentPrice;
    if (ruleTag.includes('Sconto 10%') || ruleTag.includes('-10%')) {
      expectedPrice = Math.round(parentPrice * 0.9);
    } else if (ruleTag.includes('AC') || ruleTag.includes('AirCon') || ruleTag.includes('+400') || ruleTag.includes('+500')) {
      expectedPrice = parentPrice + appliedAcPrice;
    } else if (ruleTag.includes('Colazione') || ruleTag.includes('Breakfast')) {
      expectedPrice = parentPrice + appliedBreakfastPrice;
    } else if (ruleTag.includes('+200฿')) {
      expectedPrice = parentPrice + 200;
    }

    const diff = livePrice - expectedPrice;
    const isDiscrepancy = Math.abs(diff) > 10;

    return { isDiscrepancy, expectedPrice, diff };
  };

  // Map trees dynamically to apply unified AC and Breakfast rules
  const activeTrees = COMPLETE_DERIVATION_SCHEMES.map((scheme) => ({
    ...scheme,
    level1Nodes: scheme.level1Nodes.map((l1) => {
      const isAcNode = l1.name.toLowerCase().includes('ac') || l1.ruleDesc.toLowerCase().includes('ac') || l1.ruleTag.includes('+400') || l1.ruleTag.includes('+500');
      const updatedTag = isAcNode ? `+${appliedAcPrice}฿ AM` : l1.ruleTag;
      
      let updatedSubChild = l1.subChild;
      if (l1.subChild) {
        const isSubAc = l1.subChild.name.toLowerCase().includes('ac') || l1.subChild.ruleDesc.toLowerCase().includes('ac');
        updatedSubChild = {
          ...l1.subChild,
          ruleTag: isSubAc ? `+${appliedAcPrice}฿ AMR` : l1.subChild.ruleTag
        };
      }

      return {
        ...l1,
        ruleTag: updatedTag,
        subChild: updatedSubChild
      };
    })
  }));

  const filteredTrees = activeTrees.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.motherId.includes(searchQuery) ||
      item.level1Nodes.some(l1 => 
        l1.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l1.id.includes(searchQuery) ||
        (l1.subChild && (l1.subChild.name.toLowerCase().includes(searchQuery.toLowerCase()) || l1.subChild.id.includes(searchQuery)))
      );
    
    const matchesCategory = filterCategory === 'All' || 
      (filterCategory === 'TEST' ? item.category === 'TEST' : item.category.toLowerCase() === filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-stone-100 font-sans">
      
      {/* Header Banner & Live Sync Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Albero delle Tariffe Derivate (Monitor Live PMS)
              </h3>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Live Sync: {rawOctorateGridItems.length} Rate Plans
              </span>
              {isSimulationActive && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  👁️ ANTEPRIMA SIMULATA ATTIVA
                </span>
              )}
            </div>
            <p className="text-stone-400 text-xs font-medium mt-0.5">
              Controllo in tempo reale di tutte le 212 tariffe derivate (Prezzi Live, MinStay, Stop Sell & Discrepanze)
            </p>
          </div>
        </div>

        {/* Global Controls & Date Picker */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-1.5 rounded-xl border border-amber-500/40 text-xs font-bold text-amber-400">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-stone-400 uppercase">Data Live:</span>
            <input
              type="date"
              value={selectedDateISO}
              onChange={(e) => setSelectedDateISO(e.target.value)}
              className="bg-transparent text-amber-400 font-mono font-bold text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          <button
            type="button"
            onClick={handleRefreshLiveGrid}
            disabled={loadingSync}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
            <span>{loadingSync ? 'Aggiornamento...' : 'Sincronizza Live'}</span>
          </button>

          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ChevronDown className="w-4 h-4 text-emerald-400" />
            <span>Espandi Tutti</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ChevronUp className="w-4 h-4 text-amber-400" />
            <span>Comprimi Tutti</span>
          </button>
        </div>
      </div>

      {/* PANNELLO DI CONTROLLO: PREZZI UNIFICATI AC E COLAZIONE PER TUTTE LE DERIVATE */}
      <div className="bg-stone-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-black text-xs sm:text-sm uppercase tracking-wider">
            <Wind className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>PANNELLO DI CONTROLLO UNIFICAZIONE TARIFFE DERIVATE (AC & COLAZIONE)</span>
          </div>
          <span className="text-[10px] font-bold text-stone-400 bg-stone-950 px-3 py-1 rounded-full border border-stone-800">
            Regola Madre Applicata a tutte le 18 Camere
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* CASELLA 1: ARIA CONDIZIONATA (AC) */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex justify-between items-start">
              <label className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-400" />
                <span>Prezzo Base Aria Condizionata (AC)</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                Attuale: {appliedAcPrice} ฿ / notte
              </span>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              Imposta il prezzo unico base per l'Aria Condizionata per uniformare tutte le 18 camere derivate AC.
            </p>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={customAcInput}
                  onChange={(e) => setCustomAcInput(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-750 rounded-xl px-4 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  placeholder="es. 400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold">THB (฿)</span>
              </div>

              <button
                type="button"
                onClick={() => setConfirmModal({ type: 'AC', val: customAcInput })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>CONFERMA & APPLICA AC</span>
              </button>
            </div>
          </div>

          {/* CASELLA 2: COLAZIONE (1 BREAKFAST) */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex justify-between items-start">
              <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Prezzo Base 1 Colazione (Breakfast)</span>
              </label>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60">
                Attuale: {appliedBreakfastPrice} ฿ / persona
              </span>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              Imposta il prezzo unico base per 1 Colazione per uniformare il supplemento su tutte le tariffe derivate.
            </p>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={customBreakfastInput}
                  onChange={(e) => setCustomBreakfastInput(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-750 rounded-xl px-4 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  placeholder="es. 150"
                />
                <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-bold">THB (฿)</span>
              </div>

              <button
                type="button"
                onClick={() => setConfirmModal({ type: 'BREAKFAST', val: customBreakfastInput })}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>CONFERMA & APPLICA COLAZIONE</span>
              </button>
            </div>
          </div>
        </div>

        {/* NOTIFICA DI STATO UNIFICAZIONE */}
        {unificationStatus && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{unificationStatus}</span>
          </div>
        )}
      </div>

      {/* INTERACTIVE CONFIRMATION MODAL DIALOG */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              {confirmModal.type === 'AC' ? <Wind className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
            </div>
            
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              {confirmModal.type === 'AC' ? 'Conferma Prezzo Unificato Aria Condizionata' : 'Conferma Prezzo Unificato Colazione'}
            </h3>
            
            <p className="text-xs text-stone-300 leading-relaxed font-medium">
              Sei sicuro di voler unificare ed applicare il prezzo di <strong className="text-emerald-400 text-sm font-mono">{confirmModal.val} THB</strong> a <strong>TUTTE le tariffe derivate</strong> del villaggio?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => handleApplyUnification(confirmModal.type, confirmModal.val)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Sì, Conferma e Applica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/80 p-3 rounded-2xl border border-stone-800 shadow">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per alloggio, ID prodotto (es. 529773, 293954) o nome tariffa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Villa', 'Bungalow', 'Glamping', 'Hub Guesthouse', 'TEST'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-amber-500 text-stone-950 shadow font-black'
                  : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
              }`}
            >
              {cat === 'All' ? `Tutti gli Alloggi (${COMPLETE_DERIVATION_SCHEMES.length})` : (cat === 'TEST' ? '🧪 Ambiente di Test (2)' : cat)}
            </button>
          ))}
        </div>
      </div>

      {/* FULL VISUAL TREE SCHEMES */}
      <div className="space-y-8">
        {filteredTrees.map((scheme, idx) => {
          const isExpanded = expandedRooms[scheme.name] ?? false;
          const motherLiveData = getNodeLiveData(scheme.motherId);
          const motherPrice = motherLiveData?.price || scheme.basePrice;

          return (
            <React.Fragment key={scheme.motherId}>
              {/* SEPARATORE ED INTESTAZIONE DEDICATA PER AMBIENTE DI TEST */}
              {idx > 0 && scheme.category === 'TEST' && filteredTrees[idx - 1]?.category !== 'TEST' && (
                <div className="pt-6 pb-2 my-6 border-t-2 border-dashed border-amber-500/40">
                  <div className="flex items-center gap-3 bg-stone-900 border border-amber-500/30 p-4 rounded-2xl shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-lg">
                      ๐ ๏ธ
                    </div>
                    <div>
                      <h4 className="text-base font-black text-amber-300 uppercase tracking-wider">
                        AMBIENTE DI SIMULAZIONE E TEST (Scollegato dalle OTA)
                      </h4>
                      <p className="text-xs font-medium text-stone-400 mt-0.5">
                        Unitร  isolate dal canale di vendita pubblico per simulazioni, test di calcolo MinStay e verifiche di scrittura sicure.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div 
                className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl space-y-4"
              >
              {/* TOP HEADER CONTROLLER */}
              <div 
                onClick={() => toggleRoom(scheme.name)}
                className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 cursor-pointer flex items-center justify-between hover:bg-stone-850 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-black text-white tracking-tight">
                        {scheme.name}
                      </span>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/40 text-xs font-mono font-black px-2.5 py-0.5 rounded-lg shadow-sm">
                        #{scheme.motherId} (Madre Master)
                      </span>
                      <span className="bg-stone-800 text-stone-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {scheme.category}
                      </span>
                      {motherLiveData?.isStopSell ? (
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-3 h-3 text-rose-400" /> STOP SELL
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                          <Unlock className="w-3 h-3 text-emerald-400" /> VENDIBILE
                        </span>
                      )}
                    </div>
                    <p className="text-stone-400 text-xs font-medium mt-1">{scheme.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Prezzo Live Madre ({selectedDateISO})</span>
                    <span className="text-base font-mono font-black text-amber-400">
                      ฿{motherPrice.toLocaleString('it-IT')}
                    </span>
                  </div>
                  <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs text-stone-300 font-mono font-bold">
                    {scheme.level1Nodes.length} Derivate Dirette
                  </div>
                </div>
              </div>

              {/* VISUAL DIAGRAM CANVAS */}
              {isExpanded && (
                <div className="p-4 sm:p-8 bg-stone-950/90 overflow-x-auto space-y-6">
                  
                  {/* LEVEL 0: TOP CENTERED MOTHER CARD */}
                  <div className="flex flex-col items-center justify-center relative">
                    <div className={`w-64 border-2 rounded-2xl p-3.5 shadow-2xl text-center space-y-1.5 z-10 transition-colors ${
                      motherLiveData?.isStopSell
                        ? 'bg-gradient-to-b from-rose-950 to-stone-900 border-rose-500/80 text-rose-200'
                        : 'bg-gradient-to-b from-teal-950 to-stone-900 border-teal-500/80 text-white'
                    }`}>
                      <div className="flex items-center justify-between border-b border-teal-500/40 pb-1">
                        <span className="text-[10px] font-mono font-black text-teal-300 bg-teal-900/80 px-2 py-0.5 rounded border border-teal-400/50">
                          #{scheme.motherId}
                        </span>
                        {motherLiveData?.isStopSell ? (
                          <span className="text-[9px] font-black bg-rose-900 text-rose-200 px-1.5 py-0.5 rounded border border-rose-500/60 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> STOP SELL
                          </span>
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <h3 className="text-sm font-black tracking-tight text-white">{scheme.name}</h3>
                      <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs font-black">
                        <span className="text-amber-400">฿{motherPrice.toLocaleString('it-IT')}</span>
                        {motherLiveData && <span className="text-stone-300 text-[10px]">| Min: {motherLiveData.minstay}n</span>}
                      </div>
                    </div>

                    {/* DOWNWARD STEM TO HORIZONTAL BAR */}
                    <div className="w-0.5 h-8 bg-teal-500/60" />

                    {/* TOP HORIZONTAL TRUNK LINE CONNECTING ALL LEVEL 1 NODES */}
                    <div className="w-[96%] h-0.5 bg-teal-500/60 relative" />
                  </div>

                  {/* LEVEL 1 & LEVEL 2 VISUAL NODES IN RIGID SEQUENCE ORDER */}
                  <div className="flex items-start justify-between gap-2.5 min-w-[1100px] pt-1 px-1">
                    {scheme.level1Nodes.map((l1) => {
                      const l1LiveData = getNodeLiveData(l1.id);
                      const l1Price = l1LiveData?.price || 0;
                      const l1Sanity = checkPriceSanity(motherPrice, l1.ruleTag, l1Price);

                      const subLiveData = l1.subChild ? getNodeLiveData(l1.subChild.id) : null;
                      const subPrice = subLiveData?.price || 0;
                      const subSanity = l1.subChild ? checkPriceSanity(l1Price > 0 ? l1Price : motherPrice, l1.subChild.ruleTag, subPrice) : null;

                      // Level 1 card background style
                      let l1CardStyle = 'bg-stone-900 border-stone-700/80 hover:border-amber-400 text-stone-200';
                      if (l1LiveData?.isSimulated) {
                        l1CardStyle = 'bg-sky-950/90 border-2 border-sky-400 text-sky-200 shadow-lg shadow-sky-500/30';
                      } else if (l1LiveData?.isStopSell) {
                        l1CardStyle = 'bg-rose-950/80 border-rose-500/80 text-rose-200';
                      } else if (l1LiveData?.isAvailable) {
                        l1CardStyle = 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200';
                      }

                      if (l1Sanity.isDiscrepancy && !l1LiveData?.isSimulated) {
                        l1CardStyle = 'bg-amber-950/90 border-2 border-amber-400 animate-pulse text-amber-200 shadow-lg shadow-amber-500/30';
                      }

                      return (
                        <div key={l1.id} className="flex flex-col items-center flex-1 min-w-[115px] max-w-[145px] space-y-2 relative">
                          
                          {/* Vertical line connecting from top trunk */}
                          <div className="w-0.5 h-4 bg-teal-500/60 -mt-2" />

                          {/* DERIVATION RULE TAG PILL OVER LINE */}
                          <div className="bg-teal-950 border border-teal-500/60 px-2 py-0.5 rounded-full text-[8px] font-mono font-black text-teal-300 shadow shadow-teal-950 z-10 whitespace-nowrap">
                            {l1.ruleTag}
                          </div>

                          {/* LEVEL 1 CARD */}
                          <div className={`w-full border rounded-xl p-2.5 space-y-1.5 shadow-lg text-center flex flex-col justify-between transition-all ${l1CardStyle}`}>
                            <div className="flex items-center justify-between border-b border-stone-800/80 pb-1">
                              <span className="text-[9px] font-mono font-black text-amber-400 bg-stone-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                                #{l1.id}
                              </span>
                              {l1LiveData?.isStopSell ? (
                                <span className="text-[8px] font-black text-rose-300 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> STOP
                                </span>
                              ) : l1LiveData?.isAvailable ? (
                                <span className="text-[8px] font-black text-emerald-300 flex items-center gap-0.5">
                                  <Unlock className="w-2.5 h-2.5" /> OK
                                </span>
                              ) : null}
                            </div>

                            <h4 className="text-[11px] font-black leading-tight truncate" title={l1.name}>
                              {l1.name}
                            </h4>

                            {/* Live Price & MinStay Display */}
                            {l1LiveData ? (
                              <div className="bg-stone-950/80 py-1 px-1 rounded border border-stone-800 text-center font-mono space-y-0.5">
                                <div className="text-[11px] font-black text-amber-300">
                                  ฿{l1LiveData.price.toLocaleString('it-IT')}
                                </div>
                                <div className="text-[9px] text-stone-400 font-bold">
                                  MinStay: {l1LiveData.minstay}n
                                </div>
                              </div>
                            ) : (
                              <div className="text-[9px] text-stone-500 font-mono italic">
                                Sincronizzazione...
                              </div>
                            )}

                            {/* Price Sanity Warning Badge */}
                            {l1Sanity.isDiscrepancy && (
                              <div className="bg-amber-900/90 text-amber-200 border border-amber-400 text-[8px] font-black p-1 rounded uppercase tracking-tighter flex items-center justify-center gap-0.5">
                                <AlertTriangle className="w-3 h-3 text-amber-300 flex-shrink-0" />
                                <span>Atteso ฿{l1Sanity.expectedPrice}</span>
                              </div>
                            )}

                            {/* Agencies Badges */}
                            <div className="flex flex-wrap items-center justify-center gap-1 pt-0.5">
                              {l1.agencies.map((ag, aIdx) => (
                                <span 
                                  key={aIdx}
                                  className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${ag.bg} ${ag.color} ${ag.border} uppercase`}
                                >
                                  {ag.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* LEVEL 2 SUB-CHILD BRANCH (DIRECTLY BELOW PARENT) */}
                          {l1.subChild && (() => {
                            let subCardStyle = 'bg-stone-950 border-2 border-amber-500/80 text-amber-200';
                            if (subLiveData?.isSimulated) {
                              subCardStyle = 'bg-sky-950/90 border-2 border-sky-400 text-sky-200 shadow-lg shadow-sky-500/30';
                            } else if (subLiveData?.isStopSell) {
                              subCardStyle = 'bg-rose-950/90 border-2 border-rose-500/80 text-rose-200';
                            } else if (subLiveData?.isAvailable) {
                              subCardStyle = 'bg-emerald-950/90 border-2 border-emerald-500/80 text-emerald-200';
                            }

                            if (subSanity?.isDiscrepancy && !subLiveData?.isSimulated) {
                              subCardStyle = 'bg-amber-950/95 border-2 border-amber-400 animate-pulse text-amber-200 shadow-lg shadow-amber-500/30';
                            }

                            return (
                              <div className="flex flex-col items-center w-full space-y-1 pt-1">
                                {/* Downward Stem Line */}
                                <div className="w-0.5 h-5 bg-amber-500/70" />

                                {/* SUB-CHILD DERIVATION RULE TAG */}
                                <div className="bg-amber-950 border border-amber-500/70 px-2 py-0.5 rounded-full text-[8px] font-mono font-black text-amber-300 shadow z-10 whitespace-nowrap">
                                  {l1.subChild.ruleTag}
                                </div>

                                {/* LEVEL 2 CARD (SUB-DERIVATA) */}
                                <div className={`w-full rounded-xl p-2.5 space-y-1.5 shadow-xl text-center transition-all ${subCardStyle}`}>
                                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-1">
                                    <span className="text-[9px] font-mono font-black text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/50">
                                      #{l1.subChild.id}
                                    </span>
                                    {subLiveData?.isStopSell ? (
                                      <span className="text-[8px] font-black text-rose-300 flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" /> STOP
                                      </span>
                                    ) : subLiveData?.isAvailable ? (
                                      <span className="text-[8px] font-black text-emerald-300 flex items-center gap-0.5">
                                        <Unlock className="w-2.5 h-2.5" /> OK
                                      </span>
                                    ) : null}
                                  </div>

                                  <h5 className="text-[10px] font-black leading-tight truncate" title={l1.subChild.name}>
                                    {l1.subChild.name}
                                  </h5>

                                  {/* Sub-child Live Price & MinStay Display */}
                                  {subLiveData ? (
                                    <div className="bg-stone-950/80 py-1 px-1 rounded border border-amber-500/30 text-center font-mono space-y-0.5">
                                      <div className="text-[11px] font-black text-amber-300">
                                        ฿{subLiveData.price.toLocaleString('it-IT')}
                                      </div>
                                      <div className="text-[9px] text-stone-400 font-bold">
                                        MinStay: {subLiveData.minstay}n
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-stone-500 font-mono italic">
                                      Sincronizzazione...
                                    </div>
                                  )}

                                  {/* Sub-child Price Sanity Warning Badge */}
                                  {subSanity?.isDiscrepancy && (
                                    <div className="bg-amber-900/90 text-amber-200 border border-amber-400 text-[8px] font-black p-1 rounded uppercase tracking-tighter flex items-center justify-center gap-0.5">
                                      <AlertTriangle className="w-3 h-3 text-amber-300 flex-shrink-0" />
                                      <span>Atteso ฿{subSanity.expectedPrice}</span>
                                    </div>
                                  )}

                                  {/* Sub-child Agencies Badges */}
                                  <div className="flex flex-wrap items-center justify-center gap-1 pt-0.5">
                                    {l1.subChild.agencies.map((sag, sIdx) => (
                                      <span 
                                        key={sIdx}
                                        className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${sag.bg} ${sag.color} ${sag.border} uppercase`}
                                      >
                                        {sag.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
      </div>

    </div>
  );
}
