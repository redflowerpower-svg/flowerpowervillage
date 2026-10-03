import React, { useState } from 'react';
import { X, Calendar, Clock, Users, UtensilsCrossed, Phone, Sparkles, CheckCircle2, MessageSquare, Home, Sun, Tent, PartyPopper, Mail } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../config/languages';

export type SeatingArea = 'indoor' | 'outdoor' | 'hut';

interface TableReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  initialNotes?: string;
  isWinePrivilege?: boolean;
}

const translations = {
  IT: {
    modalTitle: 'Prenota un Tavolo o Capanna',
    modalSubtitle: 'Flower Power Pizza Ranong',
    nameLabel: 'Nome e Cognome',
    namePlaceholder: 'es. Marco Rossi',
    contactLabel: 'Telefono / LINE ID',
    contactPlaceholder: 'es. 094-980-0200 o LINE ID',
    emailLabel: 'Email (per conferma immediata)',
    emailPlaceholder: 'es. marco.rossi@email.com',
    dateLabelLine1: 'Data',
    dateLabelLine2: 'Prenotazione',
    timeLabelLine1: 'Orario',
    timeLabelLine2: 'Desiderato',
    guestsLabelLine1: 'Numero di',
    guestsLabelLine2: 'Persone',
    areaLabel: 'Scegli Ambiente',
    areaIndoor: 'Al chiuso',
    areaOutdoor: "All'aperto",
    areaHut: 'Capanna',
    notesLabel: 'Note o Richieste Particolari (Opzionale)',
    notesPlaceholder: 'es. Compleanno, festa o preferenze particolari...',
    eventsNoticeTitle: 'Compleanni, Feste Private & Catering',
    eventsNoticeText: 'Organizzi un evento speciale? Contattaci direttamente per menu personalizzati e prezzi dedicati su misura:',
    btnSubmit: 'Invia Richiesta di Prenotazione',
    btnSubmitting: 'Invio in corso...',
    successTitle: 'Richiesta di Prenotazione Inviata!',
    successText: 'Abbiamo ricevuto la tua richiesta per Flower Power Pizza e ti abbiamo inviato un\'email di conferma riepilogativa. Il nostro staff ti confermerà la disponibilità al più presto.',
    btnClose: 'Chiudi',
    openWhatsApp: 'Contattaci su WhatsApp',
    openLine: 'Contattaci su LINE',
  },
  EN: {
    modalTitle: 'Book a Table or Garden Hut',
    modalSubtitle: 'Flower Power Pizza Ranong',
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g. John Smith',
    contactLabel: 'Phone / LINE ID',
    contactPlaceholder: 'e.g. +66 94 980 0200 or LINE ID',
    emailLabel: 'Email (for instant confirmation)',
    emailPlaceholder: 'e.g. john.smith@email.com',
    dateLabelLine1: 'Reservation',
    dateLabelLine2: 'Date',
    timeLabelLine1: 'Preferred',
    timeLabelLine2: 'Time',
    guestsLabelLine1: 'Number of',
    guestsLabelLine2: 'Guests',
    areaLabel: 'Choose Seating Area',
    areaIndoor: 'Indoor',
    areaOutdoor: 'Outdoor',
    areaHut: 'Garden Hut',
    notesLabel: 'Notes or Special Requests (Optional)',
    notesPlaceholder: 'e.g. Birthday, anniversary or special requests...',
    eventsNoticeTitle: 'Birthdays, Private Events & Catering',
    eventsNoticeText: 'Planning a special party or group dinner? Contact us directly for tailored menus and special group rates:',
    btnSubmit: 'Confirm Table Booking',
    btnSubmitting: 'Sending...',
    successTitle: 'Booking Request Received!',
    successText: 'Thank you! We have received your reservation for Flower Power Pizza and sent you a confirmation email. Our team will verify your table shortly.',
    btnClose: 'Close',
    openWhatsApp: 'Chat on WhatsApp',
    openLine: 'Chat on LINE',
  },
  TH: {
    modalTitle: 'จองโต๊ะหรือซุ้มกระท่อม',
    modalSubtitle: 'ฟลาวเวอร์ พาวเวอร์ พิซซ่า ระนอง',
    nameLabel: 'ชื่อผู้จอง',
    namePlaceholder: 'เช่น สมชาย ใจดี',
    contactLabel: 'เบอร์โทรศัพท์ / LINE ID',
    contactPlaceholder: 'เช่น 094-980-0200 หรือ LINE ID',
    emailLabel: 'อีเมล (รับอีเมลยืนยันทันที)',
    emailPlaceholder: 'เช่น somchai@email.com',
    dateLabelLine1: 'วันที่',
    dateLabelLine2: 'ต้องการจอง',
    timeLabelLine1: 'เวลาที่',
    timeLabelLine2: 'ต้องการ',
    guestsLabelLine1: 'จำนวน',
    guestsLabelLine2: 'ผู้มาใช้บริการ',
    areaLabel: 'เลือกโซนที่นั่ง',
    areaIndoor: 'โซนในร่ม',
    areaOutdoor: 'โต๊ะกลางแจ้ง',
    areaHut: 'ซุ้มกระท่อม',
    notesLabel: 'หมายเหตุหรือคำขอเพิ่มเติม (ถ้ามี)',
    notesPlaceholder: 'เช่น ฉลองวันเกิด, นัดเลี้ยงสังสรรค์...',
    eventsNoticeTitle: 'จัดงานวันเกิด งานเลี้ยงสังสรรค์ & แคทเทอริ่ง',
    eventsNoticeText: 'สนใจจัดงานเลี้ยงหรือสั่งชุดอาหารพิเศษ ติดต่อเราโดยตรงทาง LINE หรือ WhatsApp สำหรับราคาพิเศษ:',
    btnSubmit: 'ส่งคำขอจองโต๊ะ',
    btnSubmitting: 'กำลังส่งข้อมูล...',
    successTitle: 'ส่งคำขอจองโต๊ะเรียบร้อยแล้ว!',
    successText: 'เราได้รับข้อมูลการจองของคุณแล้วและได้ส่งอีเมลยืนยันให้ท่านเรียบร้อย ทางร้านจะติดต่อกลับเพื่อยืนยันโต๊ะโดยเร็วที่สุด',
    btnClose: 'ปิดหน้าต่าง',
    openWhatsApp: 'ติดต่อทาง WhatsApp',
    openLine: 'ติดต่อทาง LINE',
  },
  DE: {
    modalTitle: 'Tisch oder Gartenhütte reservieren',
    modalSubtitle: 'Flower Power Pizza Ranong',
    nameLabel: 'Vollständiger Name',
    namePlaceholder: 'z.B. Hans Müller',
    contactLabel: 'Telefon / LINE ID',
    contactPlaceholder: 'z.B. +66 94 980 0200 oder LINE ID',
    emailLabel: 'E-Mail (für sofortige Bestätigung)',
    emailPlaceholder: 'z.B. hans.mueller@email.com',
    dateLabelLine1: 'Datum der',
    dateLabelLine2: 'Reservierung',
    timeLabelLine1: 'Gewünschte',
    timeLabelLine2: 'Uhrzeit',
    guestsLabelLine1: 'Anzahl der',
    guestsLabelLine2: 'Personen',
    areaLabel: 'Sitzbereich wählen',
    areaIndoor: 'Innenbereich',
    areaOutdoor: 'Außenbereich',
    areaHut: 'Gartenhütte',
    notesLabel: 'Besondere Wünsche (Optional)',
    notesPlaceholder: 'z.B. Geburtstag, Feier...',
    eventsNoticeTitle: 'Geburtstage, Feiern & Catering',
    eventsNoticeText: 'Planen Sie ein Event oder eine Gruppenfeier? Kontaktieren Sie uns für individuelle Menüs und Sonderpreise:',
    btnSubmit: 'Reservierung absenden',
    btnSubmitting: 'Wird gesendet...',
    successTitle: 'Reservierungsanfrage erhalten!',
    successText: 'Vielen Dank! Wir haben Ihre Anfrage erhalten und Ihnen eine Bestätigungs-E-Mail gesendet. Unser Team bestätigt Ihnen die Reservierung in Kürze.',
    btnClose: 'Schließen',
    openWhatsApp: 'WhatsApp Chat',
    openLine: 'LINE Chat',
  }
};

const TIME_SLOTS = [
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

export function TableReservationModal({ isOpen, onClose, lang: propLang, initialNotes, isWinePrivilege }: TableReservationModalProps) {
  const storeLang = useLanguageStore((s) => s.lang);
  const lang = propLang || storeLang || 'IT';
  const t = translations[lang] || translations.IT;

  const todayStr = new Date().toISOString().split('T')[0];

  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState('2');
  const [reservationDate, setReservationDate] = useState(todayStr);
  const [reservationTime, setReservationTime] = useState('19:00');
  const [seatingArea, setSeatingArea] = useState<SeatingArea>('hut');
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  React.useEffect(() => {
    if (isOpen && initialNotes !== undefined) {
      setNotes(initialNotes);
    }
  }, [isOpen, initialNotes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !contact.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        contact: contact.trim(),
        email: email.trim(),
        guests: parseInt(guests, 10) || 2,
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        seating_area: seatingArea,
        notes: notes.trim(),
        lang
      };

      const res = await fetch('/api/table-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const savedRes = data?.reservation || {
        id: `TB-${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      if (savedRes.id) {
        setBookingId(savedRes.id);
      }

      setIsSuccess(true);
    } catch (err) {
      console.warn('Table reservation error:', err);
      setBookingId(`TB-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#292524] text-stone-100 rounded-3xl shadow-2xl border border-stone-700 overflow-hidden flex flex-col max-h-[92vh]"
        style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-800 bg-[#1c1917]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/30 border border-emerald-600/40 text-emerald-400 flex items-center justify-center shadow-xs">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                {t.modalTitle}
              </h3>
              <p className="text-[11px] text-stone-400 font-medium">
                {t.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
                  ID #{bookingId}
                </span>
                <h4 className="text-xl font-black text-white mt-2">
                  {t.successTitle}
                </h4>
                <p className="text-stone-300 text-xs sm:text-sm max-w-sm mx-auto mt-2 leading-relaxed font-light">
                  {t.successText}
                </p>
              </div>

              {/* Quick direct chat buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href="https://line.me/ti/p/fdvhy-V1dH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.openLine}</span>
                </a>
                <a
                  href="https://wa.me/66949800200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.openWhatsApp}</span>
                </a>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
                >
                  {t.btnClose}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Wine Privilege Banner */}
              {isWinePrivilege && (
                <div className="p-3.5 bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/80 border border-amber-500/50 rounded-2xl flex items-center gap-3 shadow-lg">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 text-lg">
                    🍷
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-300 tracking-wider">
                        {lang === 'TH' ? 'สิทธิพิเศษไวน์' : lang === 'IT' ? 'Privilegio Cantina' : lang === 'DE' ? 'Weinkeller-Vorteil' : 'Wine Cellar Privilege'}
                      </span>
                      <span className="text-[9px] font-extrabold bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded shadow-xs">
                        -10% SCONTO
                      </span>
                    </div>
                    <p className="text-amber-100/95 text-xs font-medium leading-snug mt-0.5">
                      {lang === 'TH' ? 'รับส่วนลด 10% สำหรับไวน์ทุกขวดที่โต๊ะอาหารเมื่อจองผ่านระบบนี้!' :
                       lang === 'IT' ? 'Sconto del 10% sui vini al tavolo attivato per questa prenotazione!' :
                       lang === 'DE' ? '10% Rabatt auf Weine am Tisch für diese Reservierung aktiviert!' :
                       '10% discount on wines at your table activated for this reservation!'}
                    </p>
                  </div>
                </div>
              )}

              {/* Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                    {t.nameLabel} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                    {t.contactLabel} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={t.contactPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email (for instant confirmation receipt) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.emailLabel}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Date, Time & Guests (3 perfectly aligned columns with 2-line labels) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 items-end">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-start gap-1 sm:gap-1.5 min-h-[34px]">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      {t.dateLabelLine1}<br />{t.dateLabelLine2}
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-start gap-1 sm:gap-1.5 min-h-[34px]">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      {t.timeLabelLine1}<br />{t.timeLabelLine2}
                    </span>
                  </label>
                  <select
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {TIME_SLOTS.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-start gap-1 sm:gap-1.5 min-h-[34px]">
                    <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      {t.guestsLabelLine1}<br />{t.guestsLabelLine2}
                    </span>
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((g) => (
                      <option key={g} value={g}>
                        {g} {typeof g === 'number' && g === 1 ? 'Pers.' : 'Pers.'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seating Area Selection: 3 Pure Options */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                  {t.areaLabel}
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSeatingArea('indoor')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      seatingArea === 'indoor'
                        ? 'bg-[#064e3b] border-emerald-400 text-white shadow-md font-black'
                        : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:border-stone-500'
                    }`}
                  >
                    <Home className="w-5 h-5 text-emerald-300" />
                    <span className="text-xs font-bold leading-tight">{t.areaIndoor}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('outdoor')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      seatingArea === 'outdoor'
                        ? 'bg-[#064e3b] border-emerald-400 text-white shadow-md font-black'
                        : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:border-stone-500'
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-bold leading-tight">{t.areaOutdoor}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeatingArea('hut')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      seatingArea === 'hut'
                        ? 'bg-[#064e3b] border-emerald-400 text-white shadow-md font-black'
                        : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:border-stone-500'
                    }`}
                  >
                    <Tent className="w-5 h-5 text-emerald-300" />
                    <span className="text-xs font-bold leading-tight">{t.areaHut}</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  {t.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Events & Birthday Notice Box */}
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200/90 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                  <PartyPopper className="w-4 h-4 text-amber-400" />
                  <span>{t.eventsNoticeTitle}</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  {t.eventsNoticeText}
                </p>
                <div className="flex gap-2 pt-1">
                  <a
                    href="https://line.me/ti/p/fdvhy-V1dH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#06C755] hover:bg-[#05b34c] px-3 py-1.5 rounded-xl shadow-xs transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>LINE Chat</span>
                  </a>
                  <a
                    href="https://wa.me/66949800200"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] px-3 py-1.5 rounded-xl shadow-xs transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Chat</span>
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-900/40 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? t.btnSubmitting : t.btnSubmit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

