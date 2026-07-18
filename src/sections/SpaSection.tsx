import { Calendar, Sparkles, Dumbbell, Flower, Mail } from 'lucide-react';
import { Language } from '../booking/lib/translations';

const treatmentsData = [
  { key: 'thai', duration: '60 min', price: '฿300', image: 'https://images.unsplash.com/photo-1540206107877-29bb00ad2810?auto=format&fit=crop&w=800&q=80' },
  { key: 'foot', duration: '60 min', price: '฿300', image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80' },
  { key: 'head', duration: '60 min', price: '฿300', image: 'https://images.unsplash.com/photo-1598901986949-f593ff2a31a6?auto=format&fit=crop&w=800&q=80' },
  { key: 'shoulder', duration: '60 min', price: '฿300', image: 'https://images.unsplash.com/photo-1645005512968-0c1fe99f0093?auto=format&fit=crop&w=800&q=80' },
  { key: 'oil', duration: '60 min', price: '฿400', image: 'https://images.unsplash.com/photo-1672015521020-ab4f86d5cc00?auto=format&fit=crop&w=800&q=80' },
  { key: 'hot_oil', duration: '45 min', price: '฿500', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80' },
  { key: 'coconut_oil', duration: '60 min', price: '฿500', image: 'https://images.unsplash.com/photo-1597636319015-1fce74db8798?auto=format&fit=crop&w=800&q=80' },
  { key: 'coconut_milk', duration: '60 min', price: '฿500', image: 'https://images.unsplash.com/photo-1588710929895-6ee7a0a4d155?auto=format&fit=crop&w=800&q=80' }
];

const beautyServicesData = [
  { key: 'manicure', duration: '30-45 min', price: '฿300', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80' },
  { key: 'pedicure', duration: '45 min', price: '฿300', image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80' },
  { key: 'scrub', duration: '30 min', price: '฿300', image: 'https://images.unsplash.com/photo-1577117633143-a2437fb9bdda?auto=format&fit=crop&w=800&q=80' },
  { key: 'underarm_wax', duration: '15 min', price: '฿300', image: 'https://images.unsplash.com/photo-1674812709785-9497062872d0?auto=format&fit=crop&w=800&q=80' },
  { key: 'leg_wax', duration: '30-45 min', price: '฿800', image: 'https://images.unsplash.com/photo-1707355336836-0bcd35139e6f?auto=format&fit=crop&w=800&q=80' },
  { key: 'arm_wax', duration: '25 min', price: '฿500', image: 'https://images.unsplash.com/photo-1626900518828-cc4f78ecb72d?auto=format&fit=crop&w=800&q=80' }
];

const translations: Record<Language, any> = {
  "IT": {
    "tag": "Spa & Centro Benessere",
    "title": "Benessere e Sport a Flower Power",
    "calHeader": "Disponibilità Stagionale & Servizi",
    "col1Title": "Servizi con Operatore (Dicembre – Aprile)",
    "col1Desc": "Tutti i servizi assistiti che richiedono la presenza di operatori qualificati — come i massaggi, trattamenti spa, corsi di yoga e attività guidate — sono attivi esclusivamente durante l'alta stagione, nel periodo compreso tra dicembre e aprile.",
    "col2Title": "Spazi ad Uso Libero (Tutto l'Anno)",
    "col2Desc": "Gli spazi dedicati al benessere fisico e mentale, ovvero l'area fitness all'aperto e lo Yoga Temple shala, rimangono accessibili gratuitamente per tutti gli ospiti per l'uso libero ed individuale durante tutto l'anno.",
    "treatmentsHeader": "I Nostri Trattamenti Massaggio (Attivi Dicembre – Aprile)",
    "beautyHeader": "Estetica, Unghie & Depilazione (Attivi Dicembre – Aprile)",
    "facilitiesHeader": "Spazi Benessere & Fitness (Aperti tutto l'anno)",
    "gymTitle": "Area Fitness & Palestra all'Aperto",
    "gymDesc": "Uno spazio attrezzato all'aperto per l'allenamento quotidiano, circondato dalla rigogliosa natura del resort. Accessibile liberamente e gratuitamente per tutti gli ospiti per sessioni individuali tutto l'anno.",
    "gymEquipTitle": "Attrezzatura Disponibile:",
    "gymEquip": [
      "Home Gym (stazione multifunzione)",
      "Ellittica",
      "Cyclette",
      "Sacco da boxe",
      "Panca per addominali",
      "Panca piana",
      "Panca romana",
      "Bilanciere"
    ],
    "yogaTitle": "Tempio dello Yoga (Yoga Temple)",
    "yogaDesc1": "Lo Yoga Temple shala è a disposizione gratuita di tutti i nostri ospiti per la pratica e la meditazione individuale durante tutto l'anno. Immerso nella pace del giardino tropicale, offre il perfetto ambiente silenzioso per riconnettersi con sé stessi.",
    "yogaDesc2": "Le discipline specifiche, i corsi di gruppo e gli orari con insegnanti verranno pianificati e resi disponibili a partire da dicembre (stagione alta).",
    "yogaCalloutTitle": "Sei un insegnante o istruttore di yoga?",
    "yogaCalloutDesc": "Se soggiorni presso la nostra struttura e desideri organizzare lezioni o corsi per gli ospiti nel nostro shala, contattaci! Saremo lieti di prendere accordi e collaborare insieme.",
    "footerText": "Desideri prenotare un massaggio per la tua vacanza o concordare una collaborazione come insegnante? Contatta il nostro team!",
    "bookButton": "Prenota Massaggio",
    "collabButton": "Collabora con Noi",
    "treatments": {
      "thai": {
        "name": "Massaggio Thailandese",
        "desc": "Antica tecnica terapeutica che combina digitopressione, stiramento muscolare e posture assistite di yoga per riequilibrare l'energia vitale."
      },
      "foot": {
        "name": "Massaggio ai Piedi",
        "desc": "Trattamento di riflessologia plantare che stimola punti specifici per migliorare la considerazione, ridurre il gonfiore e regalare un relax immediato."
      },
      "head": {
        "name": "Massaggio alla Testa",
        "desc": "Massaggio concentrato sul cuoio capelluto e sul collo, perfetto per alleviare la tensione mentale, lo stress accumulato ed emicranie."
      },
      "shoulder": {
        "name": "Massaggio alle Spalle",
        "desc": "Massaggio localizzato ideale per sciogliere le contratture muscolari nella zona cervicale e delle spalle dovute al viaggio o alla postura."
      },
      "oil": {
        "name": "Massaggio con Olio",
        "desc": "Massaggio svedese fluido e rilassante che utilizza oli profumati per favorire il rilassamento del corpo, sciogliere i muscoli ed idratare la pelle."
      },
      "hot_oil": {
        "name": "Massaggio con Olio Caldo",
        "desc": "Un profondo trattamento termico rilassante che utilizza olio caldo per penetrare in profondità nelle fibre muscolari, sciogliendo ogni tensione."
      },
      "coconut_oil": {
        "name": "Massaggio con Olio di Cocco",
        "desc": "Trattamento super nutriente a base di puro olio di cocco biologico dell'isola, ideale per riparare e lenire la pelle esposta al sole tropicale."
      },
      "coconut_milk": {
        "name": "Massaggio con Latte di Cocco",
        "desc": "Una miscela ricca e vellutata di latte di cocco e oli idratanti per un massaggio estremamente dolce, ideale per pelli sensibili e secche."
      }
    },
    "beauty": {
      "manicure": {
        "name": "Nails (Manicure)",
        "desc": "Cura professionale delle mani e delle unghie, con limatura, rimozione delle cuticole e stesura smalto protettivo o colorato."
      },
      "pedicure": {
        "name": "Toenails (Pedicure)",
        "desc": "Trattamento completo per la salute e la bellezza dei piedi: rimozione degli ispessimenti cutanei, cura delle unghie e applicazione smalto."
      },
      "scrub": {
        "name": "Foot Scrub (Esfoliazione Piedi)",
        "desc": "Scrub esfoliante levigante per rimuovere le cellule morte, seguito da un massaggio super idratante per piedi estremamente morbidi."
      },
      "underarm_wax": {
        "name": "Ceretta Ascelle (Underarm Wax)",
        "desc": "Depilazione ascelle delicata e precisa, eseguita con cera professionale adatta anche a pelli sensibili."
      },
      "leg_wax": {
        "name": "Ceretta Gambe (Leg Wax)",
        "desc": "Depilazione completa delle gambe con cera professionale per rimuovere i peli alla radice e assicurare una pelle liscia e morbida a lungo."
      },
      "arm_wax": {
        "name": "Ceretta Braccia (Arm Wax)",
        "desc": "Rimozione dei peli delle braccia con cera professionale, lasciando la pelle liscia ed idratata."
      }
    }
  },
  "EN": {
    "tag": "Spa & Wellness Centre",
    "title": "Wellness and Sport at Flower Power",
    "calHeader": "Seasonal Availability & Services",
    "col1Title": "Services with Operator (December – April)",
    "col1Desc": "All assisted services that require qualified operators — such as massages, spa treatments, yoga classes, and guided activities — are active exclusively during the high season, from December to April.",
    "col2Title": "Free Use Spaces (All Year Round)",
    "col2Desc": "Spaces dedicated to physical and mental wellness, namely the outdoor fitness area and the Yoga Temple shala, remain freely accessible to all guests for individual use throughout the year.",
    "treatmentsHeader": "Our Massage Treatments (Active December – April)",
    "beautyHeader": "Beauty, Nails & Waxing (Active December – April)",
    "facilitiesHeader": "Wellness & Fitness Spaces (Open All Year)",
    "gymTitle": "Outdoor Fitness Area & Gym",
    "gymDesc": "An equipped outdoor space for daily workouts, surrounded by the resort’s lush nature. Open and free of charge for all guests for individual sessions all year round.",
    "gymEquipTitle": "Available Equipment:",
    "gymEquip": [
      "Home Gym (multi-function station)",
      "Elliptical",
      "Exercise bike",
      "Punching bag",
      "Abdominal bench",
      "Flat bench",
      "Roman bench",
      "Barbell"
    ],
    "yogaTitle": "Yoga Temple",
    "yogaDesc1": "The Yoga Temple shala is free of charge for all our guests for individual practice and meditation all year round. Immersed in the peace of the tropical garden, it offers the perfect quiet environment to reconnect with yourself.",
    "yogaDesc2": "Specific disciplines, group classes, and schedules with instructors will be planned and available starting in December (high season).",
    "yogaCalloutTitle": "Are you a yoga teacher or instructor?",
    "yogaCalloutDesc": "If you are staying at our property and wish to organize classes or courses for guests in our shala, contact us! We will be happy to make arrangements and collaborate.",
    "footerText": "Would you like to book a massage for your holiday or discuss a collaboration as an instructor? Contact our team!",
    "bookButton": "Book Massage",
    "collabButton": "Collaborate with Us",
    "treatments": {
      "thai": {
        "name": "Thai Massage",
        "desc": "Ancient therapeutic technique combining acupressure, muscle stretching, and assisted yoga postures to rebalance vital energy."
      },
      "foot": {
        "name": "Foot Massage",
        "desc": "Reflexology treatment stimulating specific points to improve circulation, reduce swelling, and provide immediate relaxation."
      },
      "head": {
        "name": "Head Massage",
        "desc": "Massage focused on the scalp and neck, perfect for relieving mental tension, accumulated stress, and headaches."
      },
      "shoulder": {
        "name": "Shoulder Massage",
        "desc": "Targeted massage ideal for melting muscle tension in the cervical and shoulder areas due to travel or posture."
      },
      "oil": {
        "name": "Oil Massage",
        "desc": "Fluid and relaxing Swedish massage using scented oils to promote body relaxation, loosen muscles, and hydrate the skin."
      },
      "hot_oil": {
        "name": "Hot Oil Massage",
        "desc": "A deeply relaxing heat treatment using warm oil to penetrate deep into muscle fibers, melting away all tension."
      },
      "coconut_oil": {
        "name": "Coconut Oil Massage",
        "desc": "Super nourishing treatment made with pure organic island coconut oil, ideal for repairing and soothing sun-exposed skin."
      },
      "coconut_milk": {
        "name": "Coconut Milk Massage",
        "desc": "A rich and velvety blend of coconut milk and moisturizing oils for an extremely gentle massage, ideal for sensitive and dry skin."
      }
    },
    "beauty": {
      "manicure": {
        "name": "Manicure",
        "desc": "Professional hand and nail care, including shaping, cuticle removal, and protective or colored polish application."
      },
      "pedicure": {
        "name": "Pedicure",
        "desc": "Complete treatment for foot health and beauty: hard skin removal, nail care, and polish application."
      },
      "scrub": {
        "name": "Foot Scrub",
        "desc": "Smoothing exfoliating scrub to remove dead cells, followed by a super moisturizing massage for baby-soft feet."
      },
      "underarm_wax": {
        "name": "Underarm Waxing",
        "desc": "Gentle and precise underarm hair removal performed with professional wax suitable for sensitive skin."
      },
      "leg_wax": {
        "name": "Leg Waxing",
        "desc": "Full leg hair removal with professional wax to remove hair from the root, ensuring smooth and soft skin for a long time."
      },
      "arm_wax": {
        "name": "Arm Waxing",
        "desc": "Arm hair removal using professional wax, leaving the skin smooth and hydrated."
      }
    }
  },
  "TH": {
    "tag": "สปา & เวลเนส เซ็นเตอร์",
    "title": "สุขภาพและกีฬาที่ ฟลาวเวอร์ พาวเวอร์",
    "calHeader": "บริการที่พร้อมให้บริการตามฤดูกาล",
    "col1Title": "บริการโดยเจ้าหน้าที่ผู้เชี่ยวชาญ (ธันวาคม – เมษายน)",
    "col1Desc": "บริการทรีทเมนท์และกิจกรรมทั้งหมดที่ต้องมีผู้เชี่ยวชาญดูแล เช่น การนวด ทรีทเมนท์สปา คลาสโยคะ และกิจกรรมที่มีผู้นำทาง จะเปิดให้บริการเฉพาะในช่วงฤดูท่องเที่ยว (High Season) ตั้งแต่เดือนธันวาคมถึงเมษายนเท่านั้น",
    "col2Title": "พื้นที่สำหรับใช้งานด้วยตัวเองฟรี (ตลอดทั้งปี)",
    "col2Desc": "พื้นที่สำหรับดูแลสุขภาพกายและใจ ได้แก่ โซนฟิตเนสกลางแจ้ง และอาคารโยคะเทมเพิล (Yoga Temple) เปิดให้แขกผู้เข้าพักทุกท่านเข้าใช้งานเพื่อฝึกซ้อมส่วนตัวได้ฟรีตลอดทั้งปี",
    "treatmentsHeader": "ทรีทเมนท์นวดของเรา (เปิดให้บริการ ธันวาคม – เมษายน)",
    "beautyHeader": "ความงาม ทำเล็บ & แว็กซ์ขน (เปิดให้บริการ ธันวาคม – เมษายน)",
    "facilitiesHeader": "พื้นที่บริการสุขภาพ & ฟิตเนส (เปิดให้บริการตลอดทั้งปี)",
    "gymTitle": "พื้นที่ฟิตเนส & ยิมกลางแจ้ง",
    "gymDesc": "พื้นที่ออกกำลังกายกลางแจ้งพร้อมอุปกรณ์ครบครัน โอบล้อมด้วยธรรมชาติอันร่มรื่นของรีสอร์ท เปิดให้ผู้เข้าพักทุกท่านเข้าใช้บริการฝึกซ้อมส่วนตัวได้ฟรีตลอดทั้งปี",
    "gymEquipTitle": "อุปกรณ์ที่มีให้บริการ:",
    "gymEquip": [
      "โฮมยิม (เครื่องฝึกกล้ามเนื้ออเนกประสงค์)",
      "เครื่องเดินวงรี (Elliptical)",
      "จักรยานออกกำลังกาย",
      "กระสอบทรายชกมวย",
      "ม้านั่งซิทอัพ",
      "ม้านั่งยกน้ำหนัก",
      "ม้านั่งโรมัน",
      "บาร์เบลยกน้ำหนัก"
    ],
    "yogaTitle": "วิหารโยคะ (Yoga Temple)",
    "yogaDesc1": "อาคารโยคะเทมเพิล (Yoga Temple) เปิดให้ผู้เข้าพักทุกท่านเข้าใช้เพื่อการฝึกโยคะส่วนตัวและนั่งสมาธิได้ฟรีตลอดทั้งปี ท่ามกลางบรรยากาศอันแสนสงบและร่มรื่นในสวนเขตร้อน เหมาะสำหรับการผ่อนคลายและเชื่อมโยงกับตัวเอง",
    "yogaDesc2": "สำหรับคลาสเรียนโยคะกลุ่มและตารางการเรียนสอนโดยครูโยคะมืออาชีพ จะมีกำหนดการเปิดให้บริการตั้งแต่เดือนธันวาคมเป็นต้นไป (ฤดูท่องเที่ยว)",
    "yogaCalloutTitle": "คุณเป็นครูหรือผู้สอนโยคะใช่หรือไม่?",
    "yogaCalloutDesc": "หากคุณพักผ่อนกับเราและต้องการจัดคลาสเรียนโยคะหรือหลักสูตรพิเศษสำหรับแขกในศาลาของเรา โปรดติดต่อเรา! เรายินดีที่จะประสานงานและร่วมงานกับคุณ",
    "footerText": "ต้องการจองบริการนวดสำหรับวันหยุดของคุณ หรือต้องการร่วมงานกับเราในฐานะผู้สอนโยคะ? โปรดติดต่อทีมงานของเรา!",
    "bookButton": "จองบริการนวด",
    "collabButton": "ร่วมงานกับเรา",
    "treatments": {
      "thai": {
        "name": "นวดแผนไทย",
        "desc": "ศาสตร์การบำบัดแบบโบราณที่ผสมผสานการกดจุด การยืดกล้ามเนื้อ และการจัดท่าโยคะเพื่อปรับสมดุลพลังชีวิต"
      },
      "foot": {
        "name": "นวดเท้า",
        "desc": "การนวดสะท้อนจุดบนฝ่าเท้าเพื่อกระตุ้นระบบไหลเวียนโลหิต ลดอาการบวม และให้ความรู้สึกผ่อนคลายในทันที"
      },
      "head": {
        "name": "นวดศีรษะ",
        "desc": "การนวดเน้นบริเวณหนังศีรษะและลำคอ เหมาะอย่างยิ่งสำหรับการบรรเทาความตึงเครียดของสมอง ความเครียดสะสม และอาการปวดหัว"
      },
      "shoulder": {
        "name": "นวดบ่าไหล่",
        "desc": "การนวดเฉพาะจุดเพื่อคลายกล้ามเนื้อตึงบริเวณคอ บ่า และไหล่ จากการเดินทางหรือการทำงาน"
      },
      "oil": {
        "name": "นวดน้ำมัน",
        "desc": "การนวดสไตล์สวีดิชที่นุ่มนวลและผ่อนคลาย โดยใช้น้ำมันหอมระเหยเพื่อช่วยผ่อนคลายร่างกาย คลายกล้ามเนื้อ และเติมความชุ่มชื้นให้ผิวพรรณ"
      },
      "hot_oil": {
        "name": "นวดน้ำมันอุ่น",
        "desc": "การบำบัดด้วยความร้อนที่ช่วยผ่อนคลายอย่างล้ำลึก โดยใช้น้ำมันอุ่นซึมซาบเข้าสู่เส้นใยกล้ามเนื้อ ช่วยสลายความตึงเครียดของร่างกาย"
      },
      "coconut_oil": {
        "name": "นวดน้ำมันมะพร้าว",
        "desc": "ทรีทเมนท์บำรุงผิวอย่างล้ำลึกด้วยน้ำมันมะพร้าวออร์แกนิกบริสุทธิ์ของเกาะ เหมาะสำหรับการฟื้นฟูและปลอบประโลมผิวหลังออกแดด"
      },
      "coconut_milk": {
        "name": "นวดน้ำนมมะพร้าว",
        "desc": "สูตรผสมที่อุดมไปด้วยน้ำนมมะพร้าวและน้ำมันบำรุงผิวสำหรับการนวดที่อ่อนโยนเป็นพิเศษ เหมาะสำหรับผู้ที่มีผิวแห้งหรือแพ้ง่าย"
      }
    },
    "beauty": {
      "manicure": {
        "name": "ทำเล็บมือ (Manicure)",
        "desc": "การดูแลเล็บและมือโดยผู้เชี่ยวชาญ รวมถึงการตัดแต่งทรงเล็บ ตัดหนัง และทาสีเล็บเพื่อการปกป้องและเพิ่มความสวยงาม"
      },
      "pedicure": {
        "name": "ทำเล็บเท้า (Pedicure)",
        "desc": "การดูแลสุขภาพและความงามของเท้าอย่างครบวงจร: ขัดผิวส้นเท้าที่หยาบกร้าน ตกแต่งเล็บเท้า และทาสีเล็บ"
      },
      "scrub": {
        "name": "สครับขัดเท้า (Foot Scrub)",
        "desc": "สครับผลัดเซลล์ผิวเพื่อขจัดเซลล์ผิวเสื่อมสภาพอย่างอ่อนโยน ตามด้วยการนวดบำรุงเพื่อส้นเท้าที่เนียนนุ่มน่าสัมผัส"
      },
      "underarm_wax": {
        "name": "แว็กซ์ขนรักแร้",
        "desc": "การกำจัดขนรักแร้อย่างอ่อนโยนและหมดจด โดยใช้วิธีและแว็กซ์ระดับมืออาชีพที่เหมาะสำหรับผิวบอบบาง"
      },
      "leg_wax": {
        "name": "แว็กซ์ขนขา",
        "desc": "การกำจัดขนขาทั้งสองข้างอย่างหมดจดด้วยแว็กซ์คุณภาพดี ช่วยถอนรากถอนโคนและช่วยให้ผิวขาเนียนเรียบยาวนาน"
      },
      "arm_wax": {
        "name": "แว็กซ์ขนแขน",
        "desc": "การกำจัดขนแขนด้วยแว็กซ์สูตรอ่อนโยน เผยผิวแขนที่สะอาดเนียนและคงความชุ่มชื้น"
      }
    }
  },
  "DE": {
    "tag": "Spa & Wellnesscenter",
    "title": "Wellness und Sport im Flower Power",
    "calHeader": "Saisonale Verfügbarkeit & Dienstleistungen",
    "col1Title": "Dienstleistungen mit Masseur (Dezember – April)",
    "col1Desc": "Alle betreuten Dienstleistungen, die qualifizierte Masseure erfordern — wie Massagen, Spa-Behandlungen, Yogakurse und geführte Aktivitäten — sind ausschließlich während der Hochsaison von Dezember bis April aktiv.",
    "col2Title": "Frei nutzbare Räumlichkeiten (Ganzjährig)",
    "col2Desc": "Die dem physischen und geistigen Wohlbefinden gewidmeten Bereiche, d.h. der Outdoor-Fitnessbereich und das Yoga Temple Shala, stehen allen Gästen das ganze Jahr über zur individuellen Nutzung kostenlos zur Verfügung.",
    "treatmentsHeader": "Unsere Massageanwendungen (Aktiv Dezember – April)",
    "beautyHeader": "Kosmetik, Nägel & Wachsen (Aktiv Dezember – April)",
    "facilitiesHeader": "Wellness- & Fitnessräume (Ganzjährig geöffnet)",
    "gymTitle": "Outdoor-Fitnessbereich & Fitnessstudio",
    "gymDesc": "Ein ausgestatteter Außenbereich für das tägliche Training, umgeben von der üppigen Natur des Resorts. Ganzjährig kostenlos für alle Gäste zur individuellen Nutzung zugänglich.",
    "gymEquipTitle": "Verfügbare Ausrüstung:",
    "gymEquip": [
      "Home Gym (Multifunktionsstation)",
      "Crosstrainer",
      "Heimtrainer",
      "Boxsack",
      "Bauchmuskelbank",
      "Flachbank",
      "Römische Bank",
      "Langhantel"
    ],
    "yogaTitle": "Yogatempel (Yoga Temple)",
    "yogaDesc1": "Das Yoga Temple Shala steht allen unseren Gästen das ganze Jahr über kostenlos für individuelle Praxis und Meditation zur Verfügung. Eingebettet in die Ruhe des tropischen Gartens bietet es die perfekte Umgebung, um zu sich selbst zu finden.",
    "yogaDesc2": "Spezifische Disziplinen, Gruppenkurse und Termine mit Lehrern werden ab Dezember geplant und angeboten (Hochsaison).",
    "yogaCalloutTitle": "Sind Sie Yogalehrer oder -lehrerin?",
    "yogaCalloutDesc": "Wenn Sie in unserer Unterkunft übernachten und Unterricht oder Kurse für Gäste in unserem Shala organisieren möchten, kontaktieren Sie uns! Wir freuen uns auf eine Zusammenarbeit.",
    "footerText": "Möchten Sie eine Massage für Ihren Urlaub buchen oder eine Zusammenarbeit als Lehrer vereinbaren? Kontaktieren Sie unser Team!",
    "bookButton": "Massage buchen",
    "collabButton": "Mit uns arbeiten",
    "treatments": {
      "thai": {
        "name": "Thailändische Massage",
        "desc": "Alte therapeutische Technik, die Akupressur, Muskeldehnung und unterstützte Yoga-Haltungen kombiniert, um die Lebensenergie auszugleichen."
      },
      "foot": {
        "name": "Fußmassage",
        "desc": "Reflexzonenmassage, die bestimmte Punkte stimuliert, um die Durchblutung zu fördern, Schwellungen zu reduzieren und sofortige Entspannung zu schenken."
      },
      "head": {
        "name": "Kopfmassage",
        "desc": "Konzentrierte Massage von Kopfhaut und Nacken, ideal zur Linderung von mentaler Anspannung, angesammeltem Stress und Kopfschmerzen."
      },
      "shoulder": {
        "name": "Schultermassage",
        "desc": "Gezielte Massage, ideal zum Lösen von Muskelverspannungen im Nacken- und Schulterbereich durch Reisen oder Haltung."
      },
      "oil": {
        "name": "Ölmassage",
        "desc": "Fließende und entspannende schwedische Massage mit duftenden Ölen, um die Entspannung des Körpers zu fördern, die Muskeln zu lockern und die Haut mit Feuchtigkeit zu versorgen."
      },
      "hot_oil": {
        "name": "Warme Ölmassage",
        "desc": "Eine tief entspannende Wärmebehandlung mit warmem Öl, das tief in die Muskelfasern eindringt und jegliche Verspannung löst."
      },
      "coconut_oil": {
        "name": "Kokosölmassage",
        "desc": "Super nährende Behandlung mit reinem Bio-Kokosöl von der Insel, ideal zur Regeneration und Beruhigung sonnengestresster Haut."
      },
      "coconut_milk": {
        "name": "Kokosmilchmassage",
        "desc": "Eine reichhaltige und samtige Mischung aus Kokosmilch und feuchtigkeitsspendenden Ölen für eine sanfte Massage, ideal für empfindliche und trockene Haut."
      }
    },
    "beauty": {
      "manicure": {
        "name": "Maniküre",
        "desc": "Professionelle Hand- und Nagelpflege, einschließlich Feilen, Entfernen der Nagelhaut und Auftragen von Schutz- oder Farblack."
      },
      "pedicure": {
        "name": "Pediküre",
        "desc": "Komplette Behandlung für Fußgesundheit und -schönheit: Entfernung von Hornhaut, Nagelpflege und Lackieren."
      },
      "scrub": {
        "name": "Fußpeeling",
        "desc": "Glättendes Peeling zur Entfernung abgestorbener Hautschüppchen, gefolgt von einer feuchtigkeitsspendenden Massage für babyweiche Füße."
      },
      "underarm_wax": {
        "name": "Unterarmwachs",
        "desc": "Sanfte und präzise Haarentfernung an den Achseln mit professionellem Wachs, auch für empfindliche Haut geeignet."
      },
      "leg_wax": {
        "name": "Beinwachs",
        "desc": "Komplette Haarentfernung der Beine mit professionellem Wachs, um die Haare an der Wurzel zu entfernen und langanhaltend glatte Haut zu garantieren."
      },
      "arm_wax": {
        "name": "Armwachs",
        "desc": "Haarentfernung an den Armen mit professionellem Wachs für eine glatte und mit Feuchtigkeit versorgte Haut."
      }
    }
  }
};

interface Props {
  lang?: Language;
}

export default function SpaSection({ lang = 'IT' }: Props) {
  const t = translations[lang] || translations['IT'];

  return (
    <section className="py-16 md:py-24 bg-white animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p 
            className="text-xs tracking-[0.4em] uppercase text-emerald-700 mb-3" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {t.tag}
          </p>
          <h2
            className="text-stone-850 mb-4"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}
          >
            {t.title.split(' a ')[0]} <em>{lang === 'IT' ? 'a Flower Power' : lang === 'EN' ? 'at Flower Power' : lang === 'TH' ? 'ที่ ฟลาวเวอร์ พาวเวอร์' : 'im Flower Power'}</em>
          </h2>
          <div className="w-12 h-px bg-emerald-600 mx-auto" />
        </div>

        {/* Seasonality Callout Box */}
        <div className="max-w-4xl mx-auto mb-16 bg-stone-50 border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-emerald-700 w-5 h-5 flex-shrink-0" />
            <h3 
              className="text-stone-800 font-bold text-sm uppercase tracking-wider"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.calHeader}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-stone-200 items-stretch">
            {/* Column 1: Operators */}
            <div className="space-y-3 pb-6 md:pb-0">
              <div 
                className="flex items-center gap-2 text-emerald-800 font-semibold text-sm"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                <Sparkles size={16} />
                <span>{t.col1Title}</span>
              </div>
              <p 
                className="text-stone-600 text-xs leading-relaxed font-light"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {t.col1Desc}
              </p>
            </div>
            {/* Column 2: Free Use Spaces */}
            <div className="space-y-3 pt-6 md:pt-0 md:pl-6">
              <div 
                className="flex items-center gap-2 text-emerald-800 font-semibold text-sm"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                <Dumbbell size={16} />
                <span>{t.col2Title}</span>
              </div>
              <p 
                className="text-stone-600 text-xs leading-relaxed font-light"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {t.col2Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Treatments Section */}
        <div className="mb-20">
          <div className="flex items-center gap-2.5 mb-8 pb-2 border-b border-stone-200">
            <Sparkles className="text-emerald-750" size={18} />
            <h3
              className="text-stone-750 font-light text-xl"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.treatmentsHeader}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {treatmentsData.map((item, i) => {
              const tr = t.treatments[item.key] || t.treatments['thai'];
              return (
                <div key={i} className="group overflow-hidden border border-stone-200 bg-stone-50/20 rounded-2xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={tr.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-3 left-4 text-white text-[10px] font-bold px-2 py-1 bg-black/40 backdrop-blur-sm border border-white/20 rounded">
                        {item.duration}
                      </span>
                      <span className="absolute bottom-3 right-4 text-white text-xs font-black px-2.5 py-1 bg-emerald-800/90 rounded shadow-sm">
                        {item.price}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3
                        className="text-stone-850 mb-2 font-semibold text-[1.1rem]"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                      >
                        {tr.name}
                      </h3>
                      <p 
                        className="text-xs text-stone-500 leading-relaxed font-light"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                      >
                        {tr.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Beauty Services Section */}
        <div className="mb-20">
          <div className="flex items-center gap-2.5 mb-8 pb-2 border-b border-stone-200">
            <Sparkles className="text-emerald-750" size={18} />
            <h3
              className="text-stone-750 font-light text-xl"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.beautyHeader}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {beautyServicesData.map((item, i) => {
              const be = t.beauty[item.key] || t.beauty['manicure'];
              return (
                <div key={i} className="group overflow-hidden border border-stone-200 bg-stone-50/20 rounded-2xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={be.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-3 left-4 text-white text-[10px] font-bold px-2 py-1 bg-black/40 backdrop-blur-sm border border-white/20 rounded">
                        {item.duration}
                      </span>
                      <span className="absolute bottom-3 right-4 text-white text-xs font-black px-2.5 py-1 bg-emerald-800/90 rounded shadow-sm">
                        {item.price}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3
                        className="text-stone-850 mb-2 font-semibold text-[1.1rem]"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                      >
                        {be.name}
                      </h3>
                      <p 
                        className="text-xs text-stone-500 leading-relaxed font-light"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                      >
                        {be.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Facilities Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8 pb-2 border-b border-stone-200">
            <Dumbbell className="text-emerald-750" size={18} />
            <h3
              className="text-stone-750 font-light text-xl"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.facilitiesHeader}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Facility 1: Gym */}
            <div className="group overflow-hidden border border-stone-200 bg-stone-50/30 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 animate-fadeIn">
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
                    alt={t.gymTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-6 md:p-8">
                  <h3
                    className="text-stone-850 mb-3 font-semibold text-[1.3rem] flex items-center gap-2"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    <Dumbbell className="text-emerald-700 w-5 h-5" />
                    {t.gymTitle}
                  </h3>
                  <p 
                    className="text-xs text-stone-550 leading-relaxed mb-6 font-light"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.gymDesc}
                  </p>
                  
                  {/* Equipment list */}
                  <h4 
                    className="text-stone-700 font-bold text-xs uppercase tracking-wider mb-3"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.gymEquipTitle}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {t.gymEquip.map((equip: string, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2 text-stone-600 text-xs font-light"
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                      >
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0" />
                        <span>{equip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Facility 2: Yoga Temple */}
            <div className="group overflow-hidden border border-stone-200 bg-stone-50/30 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 animate-fadeIn">
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
                    alt={t.yogaTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-6 md:p-8">
                  <h3
                    className="text-stone-850 mb-3 font-semibold text-[1.3rem] flex items-center gap-2"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    <Flower className="text-emerald-700 w-5 h-5" />
                    {t.yogaTitle}
                  </h3>
                  <p 
                    className="text-xs text-stone-550 leading-relaxed mb-4 font-light"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.yogaDesc1}
                  </p>
                  <p 
                    className="text-xs text-stone-550 leading-relaxed mb-6 font-light"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.yogaDesc2}
                  </p>

                  {/* Collaboration callout */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <h4 
                      className="text-emerald-800 font-bold text-xs mb-1"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                    >
                      {t.yogaCalloutTitle}
                    </h4>
                    <p 
                      className="text-emerald-700/90 text-[11px] leading-relaxed font-light"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                    >
                      {t.yogaCalloutDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking/Contact Footer */}
        <div className="p-8 bg-stone-50 border border-stone-200 rounded-3xl text-center max-w-2xl mx-auto shadow-sm">
          <p 
            className="text-sm text-stone-600 leading-relaxed mb-6 font-light"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            {t.footerText}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:flowerpowerphayam@gmail.com?subject=Prenotazione trattamenti Spa"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs tracking-[0.2em] uppercase transition-colors duration-300 font-semibold rounded-xl shadow-sm cursor-pointer"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              <Calendar size={14} />
              {t.bookButton}
            </a>
            <a
              href="mailto:flowerpowerphayam@gmail.com?subject=Collaborazione Yoga / Istruttore"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-800 hover:bg-stone-900 text-white text-xs tracking-[0.2em] uppercase transition-colors duration-300 font-semibold rounded-xl shadow-sm cursor-pointer"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              <Mail size={14} />
              {t.collabButton}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
