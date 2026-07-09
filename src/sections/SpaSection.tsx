import { Calendar, Sparkles, Dumbbell, Flower, Mail } from 'lucide-react';

const treatments = [
  {
    name: 'Massaggio Thailandese',
    duration: '60 min',
    price: '฿300',
    desc: 'Antica tecnica terapeutica che combina digitopressione, stiramento muscolare e posture assistite di yoga per riequilibrare l\'energia vitale.',
    image: 'https://images.unsplash.com/photo-1540206107877-29bb00ad2810?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Massaggio ai Piedi',
    duration: '60 min',
    price: '฿300',
    desc: 'Trattamento di riflessologia plantare che stimola punti specifici per migliorare la circolazione, ridurre il gonfiore e regalare un relax immediato.',
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Massaggio alla Testa',
    duration: '60 min',
    price: '฿300',
    desc: 'Massaggio concentrato sul cuoio capelluto e sul collo, perfetto per alleviare la tensione mentale, lo stress accumulato ed emicranie.',
    image: 'https://images.unsplash.com/photo-1598901986949-f593ff2a31a6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Massaggio alle Spalle',
    duration: '60 min',
    price: '฿300',
    desc: 'Massaggio localizzato ideale per sciogliere le contratture muscolari nella zona cervicale e delle spalle dovute al viaggio o alla postura.',
    image: 'https://images.unsplash.com/photo-1645005512968-0c1fe99f0093?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Massaggio con Olio',
    duration: '60 min',
    price: '฿400',
    desc: 'Massaggio svedese fluido e rilassante che utilizza oli profumati per favorire il rilassamento del corpo, sciogliere i muscoli ed idratare la pelle.',
    image: 'https://images.unsplash.com/photo-1672015521020-ab4f86d5cc00?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Massaggio con Olio Caldo',
    duration: '45 min',
    price: '฿500',
    desc: 'Un profondo trattamento termico rilassante che utilizza olio caldo per penetrare in profondità nelle fibre muscolari, sciogliendo ogni tensione.',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Massaggio con Olio di Cocco',
    duration: '60 min',
    price: '฿500',
    desc: 'Trattamento super nutriente a base di puro olio di cocco biologico dell\'isola, ideale per riparare e lenire la pelle esposta al sole tropicale.',
    image: 'https://images.unsplash.com/photo-1597636319015-1fce74db8798?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Massaggio con Latte di Cocco',
    duration: '60 min',
    price: '฿500',
    desc: 'Una miscela ricca e vellutata di latte di cocco e oli idratanti per un massaggio estremamente dolce, ideale per pelli sensibili e secche.',
    image: 'https://images.unsplash.com/photo-1588710929895-6ee7a0a4d155?auto=format&fit=crop&w=800&q=80',
  },
];

const beautyServices = [
  {
    name: 'Nails (Manicure)',
    duration: '30-45 min',
    price: '฿300',
    desc: 'Cura professionale delle mani e delle unghie, con limatura, rimozione delle cuticole e stesura smalto protettivo o colorato.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Toenails (Pedicure)',
    duration: '45 min',
    price: '฿300',
    desc: 'Trattamento completo per la salute e la bellezza dei piedi: rimozione degli ispessimenti cutanei, cura delle unghie e applicazione smalto.',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Foot Scrub (Esfoliazione Piedi)',
    duration: '30 min',
    price: '฿300',
    desc: 'Scrub esfoliante levigante per rimuovere le cellule morte, seguito da un massaggio super idratante per piedi estremamente morbidi.',
    image: 'https://images.unsplash.com/photo-1577117633143-a2437fb9bdda?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ceretta Ascelle (Underarm Wax)',
    duration: '15 min',
    price: '฿300',
    desc: 'Depilazione ascelle delicata e precisa, eseguita con cera professionale adatta anche a pelli sensibili.',
    image: 'https://images.unsplash.com/photo-1674812709785-9497062872d0?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ceretta Gambe (Leg Wax)',
    duration: '30-45 min',
    price: '฿800',
    desc: 'Depilazione completa delle gambe con cera professionale per rimuovere i peli alla radice e assicurare una pelle liscia e morbida a lungo.',
    image: 'https://images.unsplash.com/photo-1707355336836-0bcd35139e6f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ceretta Braccia (Arm Wax)',
    duration: '25 min',
    price: '฿500',
    desc: 'Rimozione dei peli delle braccia con cera professionale, lasciando la pelle liscia ed idratata.',
    image: 'https://images.unsplash.com/photo-1626900518828-cc4f78ecb72d?auto=format&fit=crop&w=800&q=80',
  },
];

export default function SpaSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-amber-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Spa & Centro Benessere
          </p>
          <h2
            className="text-stone-850 mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}
          >
            Benessere e Sport a <em>Flower Power</em>
          </h2>
          <div className="w-12 h-px bg-amber-500 mx-auto" />
        </div>

        {/* Seasonality Callout Box */}
        <div className="max-w-4xl mx-auto mb-16 bg-stone-50 border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-amber-600 w-5 h-5 flex-shrink-0" />
            <h3 className="text-stone-800 font-bold text-sm uppercase tracking-wider">
              Disponibilità Stagionale & Servizi
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-stone-200 items-stretch">
            {/* Column 1: Operators */}
            <div className="space-y-3 pb-6 md:pb-0">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                <Sparkles size={16} />
                <span>Servizi con Operatore (Dicembre – Aprile)</span>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Tutti i servizi assistiti che richiedono la presenza di operatori qualificati — come i <strong>massaggi, trattamenti spa, corsi di yoga e attività guidate</strong> — sono attivi esclusivamente durante l\'alta stagione, nel periodo compreso tra dicembre e aprile.
              </p>
            </div>
            {/* Column 2: Free Use Spaces */}
            <div className="space-y-3 pt-6 md:pt-0 md:pl-6">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <Dumbbell size={16} />
                <span>Spazi ad Uso Libero (Tutto l\'Anno)</span>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed">
                Gli spazi dedicati al benessere fisico e mentale, ovvero l\'<strong>area fitness all\'aperto</strong> e lo <strong>Yoga Temple</strong> shala, rimangono accessibili gratuitamente per tutti gli ospiti per l\'uso libero ed individuale durante tutto l\'anno.
              </p>
            </div>
          </div>
        </div>

        {/* Treatments Section */}
        <div className="mb-20">
          <div className="flex items-center gap-2.5 mb-8 pb-2 border-b border-stone-200">
            <Sparkles className="text-amber-600" size={18} />
            <h3
              className="text-stone-750 font-light text-xl"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              I Nostri Trattamenti Massaggio (Attivi Dicembre – Aprile)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {treatments.map((t, i) => (
              <div key={i} className="group overflow-hidden border border-stone-200 bg-stone-50/20 rounded-2xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-white text-[10px] font-bold px-2 py-1 bg-black/40 backdrop-blur-sm border border-white/20 rounded">
                      {t.duration}
                    </span>
                    <span className="absolute bottom-3 right-4 text-white text-xs font-black px-2.5 py-1 bg-emerald-800/90 rounded shadow-sm">
                      {t.price}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3
                      className="text-stone-850 mb-2 font-semibold text-[1.1rem]"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {t.name}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beauty Services Section */}
        <div className="mb-20">
          <div className="flex items-center gap-2.5 mb-8 pb-2 border-b border-stone-200">
            <Sparkles className="text-amber-600" size={18} />
            <h3
              className="text-stone-750 font-light text-xl"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Estetica, Unghie & Depilazione (Attivi Dicembre – Aprile)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {beautyServices.map((t, i) => (
              <div key={i} className="group overflow-hidden border border-stone-200 bg-stone-50/20 rounded-2xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-white text-[10px] font-bold px-2 py-1 bg-black/40 backdrop-blur-sm border border-white/20 rounded">
                      {t.duration}
                    </span>
                    <span className="absolute bottom-3 right-4 text-white text-xs font-black px-2.5 py-1 bg-emerald-800/90 rounded shadow-sm">
                      {t.price}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3
                      className="text-stone-850 mb-2 font-semibold text-[1.1rem]"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {t.name}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8 pb-2 border-b border-stone-200">
            <Dumbbell className="text-amber-600" size={18} />
            <h3
              className="text-stone-750 font-light text-xl"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Spazi Benessere & Fitness (Aperti tutto l\'anno)
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Facility 1: Gym */}
            <div className="group overflow-hidden border border-stone-200 bg-stone-50/30 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
                    alt="Palestra all'aperto"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-6 md:p-8">
                  <h3
                    className="text-stone-850 mb-3 font-semibold text-[1.3rem] flex items-center gap-2"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Dumbbell className="text-amber-600 w-5 h-5" />
                    Area Fitness & Palestra all'Aperto
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mb-6">
                    Uno spazio attrezzato all\'aperto per l\'allenamento quotidiano, circondato dalla rigogliosa natura del resort. Accessibile liberamente e gratuitamente per tutti gli ospiti per sessioni individuali tutto l\'anno.
                  </p>
                  
                  {/* Equipment list */}
                  <h4 className="text-stone-700 font-bold text-xs uppercase tracking-wider mb-3">Attrezzatura Disponibile:</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      'Home Gym (stazione multifunzione)',
                      'Ellittica',
                      'Cyclette',
                      'Sacco da boxe',
                      'Panca per addominali',
                      'Panca piana',
                      'Panca romana',
                      'Bilanciere'
                    ].map((equip, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-stone-600 text-xs">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                        <span>{equip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Facility 2: Yoga Temple */}
            <div className="group overflow-hidden border border-stone-200 bg-stone-50/30 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
                    alt="Yoga Temple"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-6 md:p-8">
                  <h3
                    className="text-stone-850 mb-3 font-semibold text-[1.3rem] flex items-center gap-2"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Flower className="text-amber-600 w-5 h-5" />
                    Tempio dello Yoga (Yoga Temple)
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">
                    Lo <strong>Yoga Temple</strong> shala è a dispositione gratuita di tutti i nostri ospiti per la pratica e la meditazione individuale durante tutto l\'anno. Immerso nella pace del giardino tropicale, offre il perfetto ambiente silenzioso per riconnettersi con sé stessi.
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed mb-6">
                    Le discipline specifiche, i corsi di gruppo e gli orari con insegnanti verranno pianificati e resi disponibili <strong>a partire da dicembre</strong> (stagione alta).
                  </p>

                  {/* Collaboration callout */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <h4 className="text-emerald-800 font-bold text-xs mb-1">Sei un insegnante o istruttore di yoga?</h4>
                    <p className="text-emerald-700/90 text-[11px] leading-relaxed">
                      Se soggiorni presso la nostra struttura e desideri organizzare lezioni o corsi per gli ospiti nel nostro shala, contattaci! Saremo lieti di prendere accordi e collaborare insieme.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking/Contact Footer */}
        <div className="p-8 bg-stone-50 border border-stone-200 rounded-3xl text-center max-w-2xl mx-auto shadow-sm">
          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            Desideri prenotare un massaggio per la tua vacanza o concordare una collaborazione come insegnante? Contatta il nostro team!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:flowerpowerphayam@gmail.com?subject=Prenotazione trattamenti Spa"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs tracking-[0.2em] uppercase transition-colors duration-300 font-semibold rounded-xl shadow-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Sparkles size={14} />
              Prenota Massaggio
            </a>
            <a
              href="mailto:flowerpowerphayam@gmail.com?subject=Collaborazione Yoga / Istruttore"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-800 hover:bg-stone-900 text-white text-xs tracking-[0.2em] uppercase transition-colors duration-300 font-semibold rounded-xl shadow-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Mail size={14} />
              Collabora con Noi
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
