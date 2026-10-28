import { VercelRequest, VercelResponse } from "@vercel/node";

export interface RanongFlight {
  flightNumber: string;
  airline: string;
  direction: 'arrival' | 'departure';
  originIata: string;
  originCity: string;
  destinationIata: string;
  destinationCity: string;
  departureScheduled: string;
  arrivalScheduled: string;
  duration: string;
  aircraft: string;
  status: 'SCHEDULED' | 'BOARDING' | 'AIRBORNE' | 'LANDED' | 'DELAYED';
  statusText: {
    IT: string;
    EN: string;
    TH: string;
    DE: string;
  };
  recommendedBoat: {
    IT: string;
    EN: string;
    TH: string;
    DE: string;
  };
}

export interface RanongFlightsResponse {
  success: boolean;
  airport: {
    iata: 'UNX';
    icao: 'VTSR';
    name: 'Ranong Airport';
    province: 'Ranong, Thailand';
  };
  currentTimeBangkok: string;
  flights: RanongFlight[];
}

export async function handleRanongFlights(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Calculate current Bangkok time
  const now = new Date();
  const bangkokDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  const bangkokTimeParts = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour12: false }).split(':');
  const currentHour = parseInt(bangkokTimeParts[0], 10);
  const currentMinute = parseInt(bangkokTimeParts[1], 10);
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  // Active verified timetable for Thai AirAsia Don Mueang (DMK) ↔ Ranong (UNX)
  const scheduledFlights = [
    {
      flightNumber: "FD 3140",
      airline: "Thai AirAsia",
      direction: "arrival" as const,
      originIata: "DMK",
      originCity: "Bangkok Don Mueang",
      destinationIata: "UNX",
      destinationCity: "Ranong",
      depMinutes: 7 * 60 + 45, // 07:45
      arrMinutes: 9 * 60 + 5,  // 09:05
      departureScheduled: "07:45",
      arrivalScheduled: "09:05",
      duration: "1h 20m",
      aircraft: "Airbus A320",
      recommendedBoat: {
        IT: "Motoscafo consigliato: 10:30 o 11:30 (Molo di Ranong)",
        EN: "Recommended speedboat: 10:30 or 11:30 AM (Ranong Pier)",
        TH: "เรือสปีดโบ๊ทที่แนะนำ: 10:30 หรือ 11:30 น. (ท่าเรือสะพานปลา)",
        DE: "Empfohlenes Speedboot: 10:30 oder 11:30 Uhr (Ranong Pier)"
      }
    },
    {
      flightNumber: "FD 3141",
      airline: "Thai AirAsia",
      direction: "departure" as const,
      originIata: "UNX",
      originCity: "Ranong",
      destinationIata: "DMK",
      destinationCity: "Bangkok Don Mueang",
      depMinutes: 9 * 60 + 35,  // 09:35
      arrMinutes: 10 * 60 + 55, // 10:55
      departureScheduled: "09:35",
      arrivalScheduled: "10:55",
      duration: "1h 20m",
      aircraft: "Airbus A320",
      recommendedBoat: {
        IT: "Motoscafo da Koh Phayam: primo mattino ore 07:00 / 07:30",
        EN: "Speedboat from Koh Phayam: early morning 07:00 / 07:30 AM",
        TH: "เรือสปีดโบ๊ทจากเกาะพยาม: เช้าตรู่ 07:00 / 07:30 น.",
        DE: "Speedboot von Koh Phayam: Frühmorgens 07:00 / 07:30 Uhr"
      }
    },
    {
      flightNumber: "FD 3142",
      airline: "Thai AirAsia",
      direction: "arrival" as const,
      originIata: "DMK",
      originCity: "Bangkok Don Mueang",
      destinationIata: "UNX",
      destinationCity: "Ranong",
      depMinutes: 13 * 60 + 45, // 13:45
      arrMinutes: 15 * 60 + 5,  // 15:05
      departureScheduled: "13:45",
      arrivalScheduled: "15:05",
      duration: "1h 20m",
      aircraft: "Airbus A320",
      recommendedBoat: {
        IT: "Motoscafo consigliato: ore 16:00 o 16:30 (Ultimo del giorno!)",
        EN: "Recommended speedboat: 4:00 or 4:30 PM (Last boat of the day!)",
        TH: "เรือสปีดโบ๊ทที่แนะนำ: 16:00 หรือ 16:30 น. (เรือเที่ยวสุดท้ายของวัน!)",
        DE: "Empfohlenes Speedboot: 16:00 oder 16:30 Uhr (Letztes Boot des Tages!)"
      }
    },
    {
      flightNumber: "FD 3143",
      airline: "Thai AirAsia",
      direction: "departure" as const,
      originIata: "UNX",
      originCity: "Ranong",
      destinationIata: "DMK",
      destinationCity: "Bangkok Don Mueang",
      depMinutes: 15 * 60 + 35, // 15:35
      arrMinutes: 16 * 60 + 55, // 16:55
      departureScheduled: "15:35",
      arrivalScheduled: "16:55",
      duration: "1h 20m",
      aircraft: "Airbus A320",
      recommendedBoat: {
        IT: "Motoscafo da Koh Phayam: ore 12:00 o 13:00",
        EN: "Speedboat from Koh Phayam: 12:00 or 1:00 PM",
        TH: "เรือสปีดโบ๊ทจากเกาะพยาม: 12:00 หรือ 13:00 น.",
        DE: "Speedboot von Koh Phayam: 12:00 oder 13:00 Uhr"
      }
    }
  ];

  const processedFlights: RanongFlight[] = scheduledFlights.map((f) => {
    let status: RanongFlight['status'] = 'SCHEDULED';
    let statusText = {
      IT: "In Orario",
      EN: "On Time",
      TH: "ตรงเวลา",
      DE: "Pünktlich"
    };

    if (currentTotalMinutes >= f.arrMinutes + 20) {
      status = 'LANDED';
      statusText = {
        IT: "Atterrato",
        EN: "Landed",
        TH: "ลงจอดแล้ว",
        DE: "Gelandet"
      };
    } else if (currentTotalMinutes >= f.depMinutes && currentTotalMinutes < f.arrMinutes + 20) {
      status = 'AIRBORNE';
      statusText = {
        IT: "In Volo",
        EN: "Airborne",
        TH: "กำลังบิน",
        DE: "In der Luft"
      };
    } else if (currentTotalMinutes >= f.depMinutes - 40 && currentTotalMinutes < f.depMinutes) {
      status = 'BOARDING';
      statusText = {
        IT: "Imbarco",
        EN: "Boarding",
        TH: "กำลังขึ้นเครื่อง",
        DE: "Einsteigen"
      };
    }

    return {
      flightNumber: f.flightNumber,
      airline: f.airline,
      direction: f.direction,
      originIata: f.originIata,
      originCity: f.originCity,
      destinationIata: f.destinationIata,
      destinationCity: f.destinationCity,
      departureScheduled: f.departureScheduled,
      arrivalScheduled: f.arrivalScheduled,
      duration: f.duration,
      aircraft: f.aircraft,
      status,
      statusText,
      recommendedBoat: f.recommendedBoat
    };
  });

  return res.status(200).json({
    success: true,
    airport: {
      iata: 'UNX',
      icao: 'VTSR',
      name: 'Ranong Airport',
      province: 'Ranong, Thailand'
    },
    currentTimeBangkok: `${bangkokDateStr} ${bangkokTimeParts[0]}:${bangkokTimeParts[1]} (UTC+7)`,
    flights: processedFlights
  });
}

