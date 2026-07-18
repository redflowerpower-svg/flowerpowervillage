import { useState } from 'react';
import { Plane, Ship, MapPin, Compass, AlertCircle } from 'lucide-react';
import { Language } from '../booking/lib/translations';

interface Props {
  lang?: Language;
}

const translations = {
  "IT": {
    "tag": "Come Raggiungerci",
    "title": "Il Tuo Viaggio verso Koh Phayam",
    "desc": "Raggiungere il Flower Power Farm Village è un'avventura affascinante. Segui le tre fasi per organizzare al meglio il viaggio.",
    "phaseBtn": "Fase",
    "helpTitle": "Ti aiutiamo ad organizzare il viaggio",
    "helpDesc": "Per rendere il tuo arrivo il più confortevole possibile, possiamo organizzare per te un servizio taxi privato direttamente dall'aeroporto o dalla stazione dei bus di Ranong fino al molo. Inoltre, possiamo assisterti nella prenotazione dei biglietti del motoscafo.",
    "helpAlert": "Poiché gli orari di barche e voli possono subire variazioni anche con breve preavviso, vi chiediamo gentilmente di contattarci non prima di una settimana dalla data del vostro arrivo.",
    "helpBtn": "Richiedi Assistenza"
  },
  "EN": {
    "tag": "Directions",
    "title": "Your Journey to Koh Phayam",
    "desc": "Getting to Flower Power Farm Village is a fascinating adventure. Follow these three steps to arrange your travel smoothly.",
    "phaseBtn": "Step",
    "helpTitle": "We help you arrange your travel",
    "helpDesc": "To make your arrival as comfortable as possible, we can organize a private taxi transfer directly from Ranong Airport or Ranong Bus Station to the pier. We can also assist you with speedboat ticket reservations.",
    "helpAlert": "Since boat and flight schedules can change at short notice, we kindly ask you to contact us no earlier than one week before your arrival date.",
    "helpBtn": "Request Assistance"
  },
  "TH": {
    "tag": "การเดินทาง",
    "title": "การเดินทางสู่เกาะพยามของคุณ",
    "desc": "การเดินทางมายัง ฟลาวเวอร์ พาวเวอร์ คือส่วนหนึ่งของการผจญภัยที่น่าค้นหา ทำตาม 3 ขั้นตอนนี้เพื่อวางแผนการเดินทางของคุณอย่างราบรื่น",
    "phaseBtn": "ขั้นตอน",
    "helpTitle": "เราช่วยคุณจัดการและวางแผนการเดินทางได้",
    "helpDesc": "เพื่อการเดินทางที่สะดวกสบายที่สุด เราสามารถจัดเตรียมบริการรถแท็กซี่ส่วนตัวรับส่งโดยตรงจากสนามบินระนอง หรือสถานีขนส่งระนองไปยังท่าเรือ รวมถึงอำนวยความสะดวกในการจองตั๋วเรือสปีดโบ๊ทให้กับคุณ",
    "helpAlert": "เนื่องจากตารางบินและเวลาเรือเดินโดยสารอาจมีการเปลี่ยนแปลงอย่างกะทันหัน โปรดติดต่อเราล่วงหน้าไม่เกิน 1 สัปดาห์ก่อนวันเดินทางจริง",
    "helpBtn": "ขอรับการช่วยเหลือ"
  },
  "DE": {
    "tag": "Anreise",
    "title": "Ihre Reise nach Koh Phayam",
    "desc": "Die Anreise zum Flower Power Farm Village ist ein faszinierendes Abenteuer. Folgen Sie den drei Schritten, um Ihre Reise optimal zu planen.",
    "phaseBtn": "Schritt",
    "helpTitle": "Wir helfen Ihnen bei der Reiseplanung",
    "helpDesc": "Um Ihre Ankunft so bequem wie möglich zu gestalten, können wir für Sie einen privaten Taxi-Transfer direkt vom Flughafen Ranong oder Busbahnhof Ranong zum Pier organisieren. Zudem unterstützen wir Sie gerne bei der Schnellboot-Reservierung.",
    "helpAlert": "Da sich Boots- und Flugpläne kurzfristig ändern können, bitten wir Sie, uns frühestens eine Woche vor Ihrem Ankunftsdatum zu kontaktieren.",
    "helpBtn": "Unterstützung anfordern"
  }
};
const stepsData = {
  "IT": [
    {
      "phase": "Fase 1",
      "title": "Arrivare a Ranong",
      "desc": "La provincia di Ranong, sulla terraferma, è la porta d'accesso per Koh Phayam. Puoi raggiungerla in due modi:",
      "items": [
        {
          "type": "Aereo",
          "text": "Voli giornalieri da Bangkok (Don Mueang) a Ranong con Nok Air o AirAsia (1h 15m)."
        },
        {
          "type": "Autobus",
          "text": "Bus notturni o diurni dal Southern Bus Terminal di Bangkok alla stazione di Ranong (8-9h)."
        }
      ],
      "note": "Consigliamo di prenotare i bus tramite 12Go.asia o con Choke Anan Tour."
    },
    {
      "phase": "Fase 2",
      "title": "Traghettare a Koh Phayam",
      "desc": "Le imbarcazioni partono dal Molo di Ranong (Saphan Pla Pier). Scegli tra:",
      "items": [
        {
          "type": "Speedboat",
          "text": "Frequenti in alta stagione (Nov-Apr), partono circa ogni ora (08:00 - 16:30). Impiegano 40 minuti (circa 350 THB)."
        },
        {
          "type": "Slow Boat",
          "text": "Corsa panoramica. Parte solitamente alle 10:00 e alle 15:00, impiega 2 ore (circa 280 THB)."
        }
      ],
      "note": "Gli orari possono subire riduzioni nella stagione dei monsoni (da Maggio a Ottobre)."
    },
    {
      "phase": "Fase 3",
      "title": "Arrivo al Resort",
      "desc": "Una volta sbarcato al molo principale di Koh Phayam, puoi raggiungerci a Buffalo Bay tramite:",
      "items": [
        {
          "type": "Moto Taxi",
          "text": "Il mezzo più rapido e comune. Il tragitto dura circa 10 minuti ed ha un costo di 70-100 THB a persona."
        },
        {
          "type": "Tuk-Tuk / Sidecar",
          "text": "Ideale se viaggi con bagagli voluminosi. Costo indicativo di 250-400 THB a corsa."
        }
      ],
      "note": "Mostra al conducente il nome \"Flower Power\" o indica la spiaggia di Buffalo Bay."
    }
  ],
  "EN": [
    {
      "phase": "Phase 1",
      "title": "Arriving in Ranong",
      "desc": "Ranong province on the mainland is the gateway to Koh Phayam. You can reach it in two ways:",
      "items": [
        {
          "type": "By Plane",
          "text": "Daily flights from Bangkok (Don Mueang) to Ranong with Nok Air or AirAsia (1h 15m)."
        },
        {
          "type": "By Bus",
          "text": "Overnight or daytime buses from Bangkok’s Southern Bus Terminal to Ranong Station (8-9h)."
        }
      ],
      "note": "We recommend booking buses via 12Go.asia or with Choke Anan Tour."
    },
    {
      "phase": "Phase 2",
      "title": "Ferry to Koh Phayam",
      "desc": "Boats depart from the Ranong Pier (Saphan Pla Pier). Choose between:",
      "items": [
        {
          "type": "Speedboat",
          "text": "Frequent in high season (Nov-Apr), departing approximately every hour (08:00 - 16:30). Takes 40 minutes (approx. 350 THB)."
        },
        {
          "type": "Slow Boat",
          "text": "Scenic local option. Usually departs at 10:00 and 15:00, taking about 2 hours (approx. 280 THB)."
        }
      ],
      "note": "Schedules can be reduced during the monsoon season (May to October)."
    },
    {
      "phase": "Phase 3",
      "title": "Arriving at the Resort",
      "desc": "Once you land at Koh Phayam's main pier, you can reach us at Buffalo Bay by:",
      "items": [
        {
          "type": "Motorbike Taxi",
          "text": "The quickest and most common option. The trip takes about 10 minutes and costs 70-100 THB per person."
        },
        {
          "type": "Tuk-Tuk / Sidecar",
          "text": "Ideal if you travel with bulky luggage. Costs around 250-400 THB per trip."
        }
      ],
      "note": "Show the driver the name \"Flower Power\" or say Buffalo Bay beach."
    }
  ],
  "TH": [
    {
      "phase": "ขั้นตอนที่ 1",
      "title": "การเดินทางมาระนอง",
      "desc": "จังหวัดระนองบนฝั่งแผ่นดินใหญ่คือประตูสู่เกาะพยาม คุณสามารถเดินทางมาที่นี่ได้สองวิธีหลัก:",
      "items": [
        {
          "type": "เครื่องบิน",
          "text": "มีเที่ยวบินตรงทุกวันจากกรุงเทพฯ (ดอนเมือง) ไปยังระนอง โดยสายการบินนกแอร์ หรือแอร์เอเชีย (ใช้เวลา 1 ชม. 15 นาที)"
        },
        {
          "type": "รถทัวร์โดยสาร",
          "text": "รถทัวร์ปรับอากาศทั้งแบบกลางวันและรถนอนกลางคืน จากสถานีขนส่งสายใต้ใหม่ไปยังระนอง (ใช้เวลา 8-9 ชม.)"
        }
      ],
      "note": "แนะนำให้จองตั๋วรถทัวร์ล่วงหน้าผ่านเว็บไซต์ 12Go.asia หรือติดต่อ โชคอนันต์ทัวร์"
    },
    {
      "phase": "ขั้นตอนที่ 2",
      "title": "ต่อเรือไปเกาะพยาม",
      "desc": "เรือโดยสารจะออกเดินทางจากท่าเรือเทศบาลตำบลปากน้ำ (ท่าเรือสะพานปลา ระนอง) มีให้เลือกสองประเภท:",
      "items": [
        {
          "type": "เรือสปีดโบ๊ท",
          "text": "ให้บริการถี่มากในช่วงฤดูท่องเที่ยว (พ.ย. - เม.ย.) ออกเดินทางเกือบทุกชั่วโมง (08:00 - 16:30 น.) ใช้เวลาเดินทาง 40 นาที (ประมาณ 350 บาท)"
        },
        {
          "type": "เรือไม้ (เรือช้า)",
          "text": "นั่งกินลมชมวิวแบบสโลว์ไลฟ์ ปกติออกวันละสองรอบ เวลา 10:00 น. และ 15:00 น. ใช้เวลาเดินทาง 2 ชั่วโมง (ประมาณ 280 บาท)"
        }
      ],
      "note": "ตารางเดินเรืออาจมีการปรับลดลงในช่วงฤดูมรสุม (พฤษภาคม ถึง ตุลาคม)"
    },
    {
      "phase": "ขั้นตอนที่ 3",
      "title": "เดินทางถึงรีสอร์ท",
      "desc": "เมื่อเดินทางถึงท่าเทียบเรือหลักของเกาะพยามแล้ว คุณสามารถเดินทางมายังรีสอร์ทที่อ่าวเขาควายได้โดย:",
      "items": [
        {
          "type": "มอเตอร์ไซค์รับจ้าง",
          "text": "วิธีที่สะดวกรวดเร็วและเป็นที่นิยมที่สุด ใช้เวลาเดินทางประมาณ 10 นาที อัตราค่าบริการ 70-100 บาทต่อท่าน"
        },
        {
          "type": "รถพ่วงข้าง (ซาเล้ง)",
          "text": "เหมาะอย่างยิ่งสำหรับผู้ที่มีสัมภาระขนาดใหญ่หรือเดินทางหลายท่าน อัตราค่าบริการประมาณ 250-400 บาทต่อเที่ยว"
        }
      ],
      "note": "แจ้งคนขับรถว่าต้องการไป \"ฟลาวเวอร์พาวเวอร์\" หรือ \"อ่าวเขาควาย\""
    }
  ],
  "DE": [
    {
      "phase": "Phase 1",
      "title": "Anreise nach Ranong",
      "desc": "Die Provinz Ranong auf dem Festland ist das Tor nach Koh Phayam. Sie können sie auf zwei Wegen erreichen:",
      "items": [
        {
          "type": "Flugzeug",
          "text": "Tägliche Flüge von Bangkok (Don Mueang) nach Ranong mit Nok Air oder AirAsia (1 Std. 15 Min.)."
        },
        {
          "type": "Bus",
          "text": "Nacht- oder Tagesbusse vom Southern Bus Terminal in Bangkok zum Bahnhof von Ranong (8-9 Std.)."
        }
      ],
      "note": "Wir empfehlen die Buchung von Bussen über 12Go.asia oder mit Choke Anan Tour."
    },
    {
      "phase": "Phase 2",
      "title": "Fähre nach Koh Phayam",
      "desc": "Boote fahren vom Ranong Pier (Saphan Pla Pier) ab. Wählen Sie zwischen:",
      "items": [
        {
          "type": "Schnellboot",
          "text": "Häufig in der Hochsaison (Nov-Apr), Abfahrt etwa stündlich (08:00 - 16:30 Uhr). Dauert 40 Minuten (ca. 350 THB)."
        },
        {
          "type": "Langsames Boot",
          "text": "Panoramaroute. Fährt normalerweise um 10:00 und 15:00 Uhr ab, dauert 2 Stunden (ca. 280 THB)."
        }
      ],
      "note": "Die Fahrpläne können während der Monsunzeit (Mai bis Oktober) reduziert sein."
    },
    {
      "phase": "Phase 3",
      "title": "Ankunft im Resort",
      "desc": "Sobald Sie am Hauptpier von Koh Phayam ankommen, erreichen Sie uns in Buffalo Bay wie folgt:",
      "items": [
        {
          "type": "Motorrad-Taxi",
          "text": "Die schnellste und flexibelste Option. Die Fahrt dauert ca. 10 Minuten und kostet 70-100 THB pro Person."
        },
        {
          "type": "Tuk-Tuk / Beiwagen",
          "text": "Ideal, wenn Sie mit sperrigem Gepäck reisen. Richtpreis 250-400 THB pro Fahrt."
        }
      ],
      "note": "Zeigen Sie dem Fahrer den Namen \"Flower Power\" oder nennen Sie Buffalo Bay Strand."
    }
  ]
};

export default function DirectionsSection({ lang = 'IT' }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  const t = translations[lang] || translations['IT'];
  const steps = stepsData[lang] || stepsData['IT'];

  const getStepIcon = (idx: number) => {
    if (idx === 0) return <Plane className="text-emerald-700" size={24} />;
    if (idx === 1) return <Ship className="text-emerald-700" size={24} />;
    return <MapPin className="text-emerald-700" size={24} />;
  };

  return (
    <section className="py-12 md:py-20 bg-stone-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
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
            className="text-stone-550 text-sm max-w-xl mx-auto leading-relaxed font-light"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            {t.desc}
          </p>
        </div>

        {/* MOBILE VIEW: Segmented Switcher + Single Card */}
        <div className="block md:hidden mb-10">
          {/* Tabs */}
          <div className="flex bg-stone-200/60 p-1.5 rounded-2xl mb-6 border border-stone-300/40">
            {steps.map((_, idx) => {
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
                  {t.phaseBtn} {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Card */}
          <div className="bg-white p-6 border border-stone-200 rounded-3xl shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-11 h-11 bg-emerald-50 flex items-center justify-center rounded-xl">
                  {getStepIcon(activeStep)}
                </div>
                <div>
                  <span 
                    className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {steps[activeStep].phase}
                  </span>
                  <h3 
                    className="text-stone-850 font-bold text-lg" 
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>
              <p 
                className="text-stone-600 text-xs leading-relaxed mb-4 font-light"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {steps[activeStep].desc}
              </p>
              <ul className="space-y-3.5 mb-5">
                {steps[activeStep].items.map((item, i) => (
                  <li 
                    key={i} 
                    className="text-xs text-stone-600 leading-relaxed flex items-start gap-2 font-light"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span><strong>{item.type}:</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div 
              className="text-[10px] text-stone-400 italic pt-4 border-t border-stone-100 font-light"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {steps[activeStep].note}
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW: Full 3-Column Grid */}
        <div className="hidden md:grid grid-cols-3 gap-8 mb-16">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-8 border border-stone-200 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center mb-6 rounded-xl">
                  {getStepIcon(idx)}
                </div>
                <span 
                  className="text-xs text-emerald-700 font-semibold tracking-widest uppercase block mb-2" 
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {step.phase}
                </span>
                <h3 
                  className="text-stone-855 mb-4 font-semibold text-xl" 
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {step.title}
                </h3>
                <p 
                  className="text-stone-550 text-sm leading-relaxed mb-4 font-light"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {step.desc}
                </p>
                <ul className="space-y-3 text-stone-600 text-sm mb-6">
                  {step.items.map((item, i) => (
                    <li 
                      key={i} 
                      className="flex items-start gap-2 font-light"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                    >
                      <span className="text-emerald-600 font-semibold mt-0.5">•</span>
                      <span><strong>{item.type}:</strong> {item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div 
                className="text-xs text-stone-400 italic pt-4 border-t border-stone-100 mt-4 font-light"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {step.note}
              </div>
            </div>
          ))}
        </div>

        {/* Resort Assistance Card */}
        <div className="p-6 md:p-10 border border-emerald-200 bg-emerald-50/20 rounded-3xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-sm">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 flex items-center justify-center shrink-0 rounded-full text-emerald-800">
            <Compass size={28} />
          </div>
          <div className="flex-1 space-y-2 md:space-y-3 text-center md:text-left">
            <h4 
              className="text-stone-855 font-semibold text-lg md:text-2xl" 
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.helpTitle}
            </h4>
            <p 
              className="text-stone-600 text-xs md:text-sm leading-relaxed font-light"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.helpDesc}
            </p>
            <div 
              className="flex items-start gap-2 text-[10px] md:text-xs text-emerald-800 bg-emerald-100/50 px-3 py-2 rounded-lg mx-auto md:mx-0 text-left font-light"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{t.helpAlert}</span>
            </div>
          </div>
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <a
              href="mailto:flowerpowerphayam@gmail.com?subject=Richiesta assistenza viaggio Koh Phayam"
              className="block text-center px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs tracking-[0.15em] uppercase transition-colors duration-300 w-full md:w-auto font-bold rounded-xl cursor-pointer"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.helpBtn}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
