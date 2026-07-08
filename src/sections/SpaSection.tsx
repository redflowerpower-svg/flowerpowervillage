import { Calendar, Clock, Sparkles } from 'lucide-react';

const treatments = [
  {
    name: 'Massaggio Tradizionale Thai',
    duration: '60 / 90 min',
    desc: 'Antica tecnica di guarigione che combina digitopressione, posture yoga assistite e allungamenti per sbloccare l\'energia e ritrovare l\'equilibrio.',
    image: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Aromaterapia Rilassante',
    duration: '60 / 90 min',
    desc: 'Oli essenziali caldi stesi con movimenti fluidi e leggeri per un rilassamento profondo del sistema nervoso e sollievo dallo stress quotidiano.',
    image: 'https://images.pexels.com/photos/3807571/pexels-photo-3807571.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Terapia Hot Stone',
    duration: '90 min',
    desc: 'Pietre vulcaniche levigate e riscaldate posizionate sui punti energetici del corpo per sciogliere le tensioni muscolari profonde e calmare la mente.',
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Massaggio Testa e Spalle',
    duration: '30 / 45 min',
    desc: 'Trattamento mirato a collo, spalle e cuoio capelluto, ideale per alleviare la stanchezza dopo il viaggio o una giornata all\'aria aperta.',
    image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

const facilities = [
  {
    name: 'Sauna Svedese & Bagno di Ghiaccio',
    desc: 'Una rigenerante terapia del contrasto caldo-freddo per stimolare la circolazione sanguigna, ridurre le infiammazioni e accelerare il recupero muscolare.',
    image: 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Bamboo Tattoo Studio',
    desc: 'Tatuaggi tradizionali thailandesi eseguiti a mano con la tecnica del bamboo da maestri locali, garantendo massima igiene e un disegno eterno.',
    image: 'https://images.pexels.com/photos/2183131/pexels-photo-2183131.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Nail Art & Estetica',
    desc: 'Servizi professionali dedicati alla cura della persona: manicure, pedicure accurata, nail art artistica ed epilazione delicata.',
    image: 'https://images.pexels.com/photos/3997389/pexels-photo-3997389.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    name: 'Tempio dello Yoga',
    desc: 'Uno shala in legno all\'aperto immerso nella vegetazione tropicale del resort, a disposizione per auto-pratica, meditazione o lezioni guidate con insegnanti.',
    image: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

export default function SpaSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-5">
          <p className="text-xs tracking-[0.4em] uppercase text-amber-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Spa & Centro Benessere
          </p>
          <h2
            className="text-stone-800 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}
          >
            Rigenera. Respira. <em>Ritrova Te Stesso.</em>
          </h2>
          <div className="w-12 h-px bg-amber-500 mx-auto mb-5" />
          <p className="text-stone-500 text-sm max-w-xl mx-auto leading-relaxed">
            La nostra spa è un santuario naturale dedicato alla cura di sé. Il centro è aperto tutti i giorni della settimana a partire dalle ore 09:00.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          <div className="flex items-center gap-2 text-xs md:text-sm bg-amber-50 border border-amber-100 px-5 py-2.5 text-amber-800 font-medium">
            <Calendar size={14} />
            <span>Apertura Stagionale: Dicembre – Aprile</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm bg-stone-50 border border-stone-100 px-5 py-2.5 text-stone-700 font-medium">
            <Clock size={14} />
            <span>Orario: Tutti i giorni dalle 09:00</span>
          </div>
        </div>

        {/* Treatments Grid */}
        <div className="mb-20">
          <h3
            className="text-stone-700 mb-8 pb-2 border-b border-stone-100 font-light text-xl"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            I Nostri Trattamenti Massaggio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {treatments.map((t, i) => (
              <div key={i} className="group overflow-hidden border border-stone-100 hover:shadow-lg transition-shadow duration-400">
                <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-white text-xs px-2 py-1 bg-black/30 backdrop-blur-sm border border-white/20">
                    {t.duration}
                  </span>
                </div>
                <div className="p-5">
                  <h3
                    className="text-stone-800 mb-2 font-medium"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem' }}
                  >
                    {t.name}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8 pb-2 border-b border-stone-100">
            <Sparkles className="text-amber-600" size={18} />
            <h3
              className="text-stone-700 font-light text-xl"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Servizi Aggiuntivi & Strutture Benessere
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((f, i) => (
              <div key={i} className="group overflow-hidden border border-stone-100 hover:shadow-lg transition-shadow duration-400 bg-stone-50/50">
                <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-5">
                  <h3
                    className="text-stone-800 mb-2 font-medium"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem' }}
                  >
                    {f.name}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Footer */}
        <div className="p-6 md:p-8 bg-stone-50 border border-stone-100 text-center max-w-2xl mx-auto">
          <p className="text-sm text-stone-600 leading-relaxed mb-5">
            Consigliamo la prenotazione dei trattamenti in anticipo. Puoi riservare le tue sedute benessere comodamente durante la prenotazione del tuo alloggio.
          </p>
          <a
            href="mailto:flowerpowerphayam@gmail.com?subject=Prenotazione trattamenti Spa"
            className="inline-block px-8 py-3.5 bg-amber-600 text-white text-xs tracking-[0.2em] uppercase hover:bg-amber-700 transition-colors duration-300 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Prenota un Trattamento
          </a>
        </div>
      </div>
    </section>
  );
}
