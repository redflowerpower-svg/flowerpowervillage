import { Phone, Instagram, Facebook, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { Language } from '../booking/lib/translations';

// Custom TikTok Icon
const TiktokIcon = ({ className, size = 14 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const translations = {
  "IT": {
    "tag": "Contattaci",
    "title": "Prenota il Tuo Soggiorno Diretto",
    "desc": "Prenota direttamente con noi per ottenere un risparmio garantito del 10% rispetto a tutte le piattaforme di prenotazione online.",
    "infoTitle": "Informazioni di Contatto",
    "addressLabel": "Indirizzo",
    "addressText": "14/32 Moo 1, Than Boun, Koh Phayam, Amphoe Muang, Ranong 85000, Thailandia",
    "mapsLink": "Vedi su Google Maps",
    "phoneLabel": "Telefono / WhatsApp",
    "hoursLabel": "Orari di Apertura",
    "hoursText": "Tutti i giorni: 08:00 – 22:00",
    "socialLabel": "Seguici sui Social",
    "formTitle": "Richiesta di Disponibilità",
    "fieldName": "Nome e Cognome",
    "fieldEmail": "Email",
    "fieldCheckin": "Data di Arrivo",
    "fieldCheckout": "Data di Partenza",
    "fieldGuests": "Numero di Ospiti",
    "selectGuests": "Seleziona numero",
    "fieldMessage": "Messaggio / Richieste speciali",
    "messagePlaceholder": "Esempio: preferenze per la tipologia di letto, orario di arrivo stimato, ecc.",
    "submitBtn": "Invia Richiesta via Email",
    "successMsg": "Richiesta creata con successo! Il tuo client email si aprirà tra un attimo per confermare l'invio.",
    "emailSubject": "Richiesta di prenotazione da"
  },
  "EN": {
    "tag": "Contact Us",
    "title": "Book Your Direct Stay",
    "desc": "Book directly with us to obtain a guaranteed 10% savings compared to all online booking platforms.",
    "infoTitle": "Contact Information",
    "addressLabel": "Address",
    "addressText": "14/32 Moo 1, Than Boun, Koh Phayam, Amphoe Muang, Ranong 85000, Thailand",
    "mapsLink": "View on Google Maps",
    "phoneLabel": "Phone / WhatsApp",
    "hoursLabel": "Opening Hours",
    "hoursText": "Every day: 08:00 – 22:00",
    "socialLabel": "Follow Us on Socials",
    "formTitle": "Request Availability",
    "fieldName": "Full Name",
    "fieldEmail": "Email Address",
    "fieldCheckin": "Arrival Date",
    "fieldCheckout": "Departure Date",
    "fieldGuests": "Number of Guests",
    "selectGuests": "Select number",
    "fieldMessage": "Message / Special requests",
    "messagePlaceholder": "Example: bed preferences, estimated arrival time, extra requirements, etc.",
    "submitBtn": "Send Request via Email",
    "successMsg": "Request generated successfully! Your email client will open in a moment to complete sending.",
    "emailSubject": "Booking request from"
  },
  "TH": {
    "tag": "ติดต่อเรา",
    "title": "จองห้องพักตรงเพื่อข้อเสนอที่ดีที่สุด",
    "desc": "จองโดยตรงกับเราเพื่อรับส่วนลดการจองพิเศษ 10% ทันที เมื่อเทียบกับแพลตฟอร์มการจองออนไลน์ทั่วไป",
    "infoTitle": "ข้อมูลการติดต่อ",
    "addressLabel": "ที่อยู่ของรีสอร์ท",
    "addressText": "14/32 หมู่ 1, ตำบลปากน้ำ, เกาะพยาม, อำเภอเมือง, ระนอง 85000, ประเทศไทย",
    "mapsLink": "เปิดใน Google Maps",
    "phoneLabel": "เบอร์โทรศัพท์ / WhatsApp",
    "hoursLabel": "เวลาทำการติดต่อ",
    "hoursText": "ทุกวัน: 08:00 – 22:00 น.",
    "socialLabel": "ติดตามเราบนโซเชียลมีเดีย",
    "formTitle": "ส่งคำขอตรวจสอบห้องว่าง",
    "fieldName": "ชื่อ - นามสกุล",
    "fieldEmail": "ที่อยู่อีเมล",
    "fieldCheckin": "วันที่เข้าพัก (Check-in)",
    "fieldCheckout": "วันที่เช็คเอาท์ (Check-out)",
    "fieldGuests": "จำนวนผู้เข้าพัก",
    "selectGuests": "กรุณาเลือกจำนวนคน",
    "fieldMessage": "ข้อความเพิ่มเติม / คำขอพิเศษ",
    "messagePlaceholder": "ตัวอย่าง: รูปแบบเตียงที่ต้องการ, เวลาเดินทางมาถึงโดยประมาณ, ความช่วยเหลือพิเศษ ฯลฯ",
    "submitBtn": "ส่งคำขอผ่านอีเมล",
    "successMsg": "สร้างคำขอจองตรงสำเร็จแล้ว! ระบบจะเปิดแอปอีเมลของคุณขึ้นมาเพื่อกดส่งยืนยันในอีกสักครู่",
    "emailSubject": "คำขอจองห้องพักจากคุณ"
  },
  "DE": {
    "tag": "Kontakt",
    "title": "Buchen Sie Ihren Aufenthalt Direkt",
    "desc": "Buchen Sie direkt bei uns, um eine garantierte Ersparnis von 10% gegenüber allen Online-Buchungsplattformen zu erhalten.",
    "infoTitle": "Kontaktinformationen",
    "addressLabel": "Adresse",
    "addressText": "14/32 Moo 1, Than Boun, Koh Phayam, Amphoe Muang, Ranong 85000, Thailand",
    "mapsLink": "Auf Google Maps anzeigen",
    "phoneLabel": "Telefon / WhatsApp",
    "hoursLabel": "Öffnungszeiten",
    "hoursText": "Täglich: 08:00 – 22:00 Uhr",
    "socialLabel": "Folgen Sie uns",
    "formTitle": "Verfügbarkeit anfragen",
    "fieldName": "Vollständiger Name",
    "fieldEmail": "E-Mail-Adresse",
    "fieldCheckin": "Ankunftsdatum",
    "fieldCheckout": "Abreisedatum",
    "fieldGuests": "Anzahl der Gäste",
    "selectGuests": "Anzahl auswählen",
    "fieldMessage": "Nachricht / Besondere Wünsche",
    "messagePlaceholder": "Beispiel: Bettpräferenzen, geschätzte Ankunftszeit, Extrawünsche usw.",
    "submitBtn": "Anfrage per E-Mail senden",
    "successMsg": "Anfrage erfolgreich erstellt! Ihr E-Mail-Programm öffnet sich in Kürze, um den Versand zu bestätigen.",
    "emailSubject": "Buchungsanfrage von"
  }
};

interface Props {
  lang?: Language;
}

export default function ContactSection({ lang = 'IT' }: Props) {
  const [form, setForm] = useState({ name: '', email: '', checkin: '', checkout: '', guests: '', message: '' });
  const [sent, setSent] = useState(false);

  const t = translations[lang] || translations['IT'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`${t.emailSubject} ${form.name}`);
    const body = encodeURIComponent(
      `Nome: ${form.name}\nEmail: ${form.email}\nCheck-in: ${form.checkin}\nCheck-out: ${form.checkout}\nOspiti: ${form.guests}\n\nMessaggio:\n${form.message}`
    );
    window.location.href = `mailto:flowerpowerphayam@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section className="py-16 md:py-24 bg-stone-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p 
            className="text-xs tracking-[0.4em] uppercase text-emerald-700 mb-3" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {t.tag}
          </p>
          <h2
            className="text-stone-850 mb-4 font-light"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {t.title.split(' Soggiorno ')[0].split(' Direct ')[0].split('ตรงเพื่อ')[0].split(' Aufenthalt ')[0]} <em>{lang === 'IT' ? 'il Tuo Soggiorno Diretto' : lang === 'EN' ? 'Your Direct Stay' : lang === 'TH' ? 'ตรงเพื่อข้อเสนอที่ดีที่สุด' : 'Ihren Aufenthalt direkt'}</em>
          </h2>
          <div className="w-12 h-px bg-emerald-600 mx-auto mb-5" />
          <p 
            className="text-stone-550 text-sm max-w-md mx-auto leading-relaxed font-light"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            {t.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact info */}
          <div>
            <h3
              className="text-stone-750 mb-7 font-light text-xl"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.infoTitle}
            </h3>
            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center shrink-0 rounded-lg">
                  <MapPin size={15} className="text-emerald-700" />
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold text-stone-800 mb-0.5"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.addressLabel}
                  </p>
                  <p 
                    className="text-sm text-stone-550 leading-relaxed mb-1.5 font-light"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.addressText}
                  </p>
                  <a
                    href="https://maps.app.goo.gl/62jFof8xt6Fj5nwT7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 transition-colors"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    <span>{t.mapsLink}</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center shrink-0 rounded-lg">
                  <Phone size={15} className="text-emerald-700" />
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold text-stone-800 mb-0.5"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.phoneLabel}
                  </p>
                  <div className="flex flex-col gap-1">
                    <a href="tel:+66958825573" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">
                      +66 95 882 5573 <span className="text-stone-450 text-xs font-normal">(English / Italiano)</span>
                    </a>
                    <a href="tel:+66834512741" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">
                      +66 83 451 2741 <span className="text-stone-450 text-xs font-normal">(Thai)</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center shrink-0 rounded-lg">
                  <Clock size={15} className="text-emerald-700" />
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold text-stone-800 mb-0.5"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.hoursLabel}
                  </p>
                  <p 
                    className="text-sm text-stone-550 leading-relaxed font-light"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.hoursText}
                  </p>
                </div>
              </div>
            </div>

            <h3
              className="text-stone-750 mb-4 font-light text-xl"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.socialLabel}
            </h3>
            <div className="flex gap-4">
              <a
                href="https://www.tiktok.com/@flowerpowerphayam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 border border-stone-250 flex items-center justify-center rounded-xl hover:border-emerald-700 hover:text-emerald-700 transition-colors text-stone-500"
              >
                <TiktokIcon size={16} />
              </a>
              <a
                href="https://www.instagram.com/flowerpowerphayam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 border border-stone-250 flex items-center justify-center rounded-xl hover:border-emerald-700 hover:text-emerald-700 transition-colors text-stone-500"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.facebook.com/flowerpowerphayam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 border border-stone-250 flex items-center justify-center rounded-xl hover:border-emerald-700 hover:text-emerald-700 transition-colors text-stone-500"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-6 md:p-8 border border-stone-200 rounded-3xl shadow-sm">
            <h3
              className="text-stone-850 mb-6 font-semibold text-lg"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.formTitle}
            </h3>
            {sent ? (
              <div 
                className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-850 text-sm rounded-2xl"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {t.successMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label 
                    className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.fieldName}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
                <div>
                  <label 
                    className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.fieldEmail}
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                    >
                      {t.fieldCheckin}
                    </label>
                    <input
                      type="date"
                      required
                      value={form.checkin}
                      onChange={(e) => setForm({ ...form, checkin: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                    >
                      {t.fieldCheckout}
                    </label>
                    <input
                      type="date"
                      required
                      value={form.checkout}
                      onChange={(e) => setForm({ ...form, checkout: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label 
                    className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.fieldGuests}
                  </label>
                  <select
                    required
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-750 text-sm focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer font-light"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    <option value="">{t.selectGuests}</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label 
                    className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  >
                    {t.fieldMessage}
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t.messagePlaceholder}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-emerald-600 transition-colors resize-none font-light"
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs tracking-[0.2em] uppercase font-bold rounded-xl transition-colors cursor-pointer"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {t.submitBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
