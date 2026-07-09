import { Phone, Mail, Instagram, Facebook, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', checkin: '', checkout: '', guests: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Richiesta di prenotazione da ${form.name}`);
    const body = encodeURIComponent(
      `Nome: ${form.name}\nEmail: ${form.email}\nCheck-in: ${form.checkin}\nCheck-out: ${form.checkout}\nOspiti: ${form.guests}\n\nMessaggio:\n${form.message}`
    );
    window.location.href = `mailto:flowerpowerphayam@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-amber-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Contattaci
          </p>
          <h2
            className="text-stone-850 mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}
          >
            Prenota il Tuo Soggiorno Diretto
          </h2>
          <div className="w-12 h-px bg-amber-500 mx-auto mb-5" />
          <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
            Prenota direttamente con noi per ottenere un risparmio garantito del 10% rispetto a tutte le piattaforme di prenotazione online.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact info */}
          <div>
            <h3
              className="text-stone-750 mb-7 font-light text-xl"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Informazioni di Contatto
            </h3>
            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-amber-50 flex items-center justify-center shrink-0 rounded-lg">
                  <MapPin size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 mb-0.5">Indirizzo</p>
                  <p className="text-sm text-stone-500 leading-relaxed mb-1.5">
                    14/32 Moo 1, Than Boun,<br />Koh Phayam, Amphoe Muang,<br />Ranong 85000, Thailandia
                  </p>
                  <a
                    href="https://maps.app.goo.gl/62jFof8xt6Fj5nwT7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Vedi su Google Maps</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-amber-50 flex items-center justify-center shrink-0 rounded-lg">
                  <Phone size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 mb-0.5">Telefono / WhatsApp</p>
                  <div className="flex flex-col gap-1">
                    <a href="tel:+66958825573" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                      +66 95 882 5573 <span className="text-stone-400 text-xs font-normal">(Inglese / Italiano)</span>
                    </a>
                    <a href="tel:+66834512741" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                      +66 83 451 2741 <span className="text-stone-400 text-xs font-normal">(Thai)</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-amber-50 flex items-center justify-center shrink-0 rounded-lg">
                  <Mail size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 mb-0.5">Email</p>
                  <a href="mailto:flowerpowerphayam@gmail.com" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    flowerpowerphayam@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-amber-50 flex items-center justify-center shrink-0 rounded-lg">
                  <Clock size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 mb-0.5">Orari Check-in / Check-out</p>
                  <p className="text-sm text-stone-500">Check-in: 13:00 – 21:30 · Check-out: 11:00</p>
                </div>
              </div>
            </div>

            <h4 className="text-stone-600 text-xs tracking-widest uppercase mb-4 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              Seguici
            </h4>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/flowerpowerphayam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-stone-600 text-xs hover:border-amber-400 hover:text-amber-600 transition-all rounded-xl font-medium bg-white shadow-sm"
              >
                <Instagram size={14} />
                @flowerpowerphayam
              </a>
              <a
                href="https://www.facebook.com/flowerpowerphayam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-stone-600 text-xs hover:border-amber-400 hover:text-amber-600 transition-all rounded-xl font-medium bg-white shadow-sm"
              >
                <Facebook size={14} />
                Facebook
              </a>
            </div>
          </div>

          {/* Booking form */}
          <div className="bg-white p-6 sm:p-8 border border-stone-200 rounded-3xl shadow-sm">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-12 h-12 bg-amber-50 flex items-center justify-center mb-4 rounded-xl">
                  <Mail size={20} className="text-amber-600" />
                </div>
                <h3
                  className="text-stone-850 mb-2 font-semibold"
                  style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem' }}
                >
                  Richiesta Inviata!
                </h3>
                <p className="text-sm text-stone-500">Ti risponderemo via email il prima possibile per darti conferma.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3
                  className="text-stone-750 mb-6 font-semibold"
                  style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem' }}
                >
                  Invia una Richiesta di Prenotazione
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">Nome e Cognome *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-850 font-medium focus:outline-none focus:border-amber-500 transition-all bg-stone-50/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">Indirizzo Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-850 font-medium focus:outline-none focus:border-amber-500 transition-all bg-stone-50/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">Arrivo (Check-in) *</label>
                    <input
                      type="date"
                      required
                      value={form.checkin}
                      onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-850 font-medium focus:outline-none focus:border-amber-500 transition-all bg-stone-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">Partenza (Check-out) *</label>
                    <input
                      type="date"
                      required
                      value={form.checkout}
                      onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-850 font-medium focus:outline-none focus:border-amber-500 transition-all bg-stone-50/50"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">Numero di Ospiti *</label>
                  <select
                    required
                    value={form.guests}
                    onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-850 font-medium focus:outline-none focus:border-amber-500 transition-all bg-stone-50/50"
                  >
                    <option value="">Seleziona</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'persona' : 'persone'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">Messaggio / Richieste Particolari</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Eventuali richieste speciali o domande..."
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-850 font-medium focus:outline-none focus:border-amber-500 transition-all bg-stone-50/50 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs tracking-[0.2em] uppercase transition-colors duration-300 font-semibold rounded-xl shadow-sm cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Invia Richiesta (Sconto Diretto 10%)
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
