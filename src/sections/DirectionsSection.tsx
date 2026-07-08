import { Plane, Bus, Ship, MapPin, Compass, AlertCircle } from 'lucide-react';

export default function DirectionsSection() {
  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-amber-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Come Raggiungerci
          </p>
          <h2
            className="text-stone-800 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}
          >
            Il Tuo Viaggio verso <em>Koh Phayam</em>
          </h2>
          <div className="w-12 h-px bg-amber-500 mx-auto mb-5" />
          <p className="text-stone-500 text-sm max-w-xl mx-auto leading-relaxed">
            Raggiungere il Flower Power Farm Village è un'avventura affascinante. Ecco tutte le informazioni utili per pianificare il tuo viaggio dalla terraferma fino al nostro angolo di paradiso.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Step 1 */}
          <div className="bg-white p-8 border border-stone-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 flex items-center justify-center mb-6">
                <Plane className="text-amber-600" size={24} />
              </div>
              <span className="text-xs text-amber-600 font-semibold tracking-widest uppercase block mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Fase 1
              </span>
              <h3 className="text-stone-800 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 400 }}>
                Arrivare a Ranong
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                La provincia di Ranong, sulla terraferma, è la porta d'accesso per Koh Phayam. Puoi raggiungerla facilmente in due modi:
              </p>
              <ul className="space-y-3 text-stone-500 text-sm mb-6">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-semibold mt-0.5">•</span>
                  <span><strong>In Aereo:</strong> Voli giornalieri da Bangkok (Don Mueang Airport) all'Aeroporto di Ranong con Nok Air o AirAsia (circa 1 ora e 15 minuti).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-semibold mt-0.5">•</span>
                  <span><strong>In Autobus:</strong> Autobus notturni o diurni dal Southern Bus Terminal (Sai Tai Mai) di Bangkok fino alla stazione dei bus di Ranong (circa 8-9 ore).</span>
                </li>
              </ul>
            </div>
            <div className="text-xs text-stone-400 italic">
              Consigliamo di prenotare i bus tramite 12Go.asia o direttamente con Choke Anan Tour.
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 border border-stone-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 flex items-center justify-center mb-6">
                <Ship className="text-amber-600" size={24} />
              </div>
              <span className="text-xs text-amber-600 font-semibold tracking-widest uppercase block mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Fase 2
              </span>
              <h3 className="text-stone-800 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 400 }}>
                Traghettare a Koh Phayam
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Tutte le imbarcazioni partono dal <strong>Molo di Ranong (Saphan Pla Pier)</strong>. A seconda delle tue preferenze puoi scegliere tra:
              </p>
              <ul className="space-y-3 text-stone-500 text-sm mb-6">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-semibold mt-0.5">•</span>
                  <span><strong>Motoscafo (Speedboat):</strong> Molto frequenti in alta stagione (Nov-Apr), partono circa ogni ora dalle 08:00 alle 16:30. Impiegano solo 40 minuti (circa 350 THB a persona).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-semibold mt-0.5">•</span>
                  <span><strong>Barca Lenta (Slow Boat):</strong> Perfetta per un viaggio panoramico. Parte solitamente alle 10:00 e alle 15:00, impiega circa 2 ore (circa 280 THB a persona).</span>
                </li>
              </ul>
            </div>
            <div className="text-xs text-stone-400 italic">
              Gli orari possono subire riduzioni nella stagione dei monsoni (da Maggio a Ottobre).
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 border border-stone-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 flex items-center justify-center mb-6">
                <MapPin className="text-amber-600" size={24} />
              </div>
              <span className="text-xs text-amber-600 font-semibold tracking-widest uppercase block mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Fase 3
              </span>
              <h3 className="text-stone-800 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 400 }}>
                Arrivo al Resort
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Una volta sbarcato al molo principale di Koh Phayam, troverai diverse opzioni per raggiungerci a Buffalo Bay (Aow Khao Kwai):
              </p>
              <ul className="space-y-3 text-stone-500 text-sm mb-6">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-semibold mt-0.5">•</span>
                  <span><strong>Moto Taxi:</strong> Il modo più rapido e comune sull'isola. Il tragitto dura circa 10 minuti ed ha un costo di 70-100 THB a persona.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-semibold mt-0.5">•</span>
                  <span><strong>Tuk-Tuk / Sidecar:</strong> Ideale se viaggi con bagagli voluminosi o in gruppo. Costo indicativo di 250-400 THB a corsa.</span>
                </li>
              </ul>
            </div>
            <div className="text-xs text-stone-400 italic">
              Mostra al conducente il nome "Flower Power" o indica la spiaggia di Buffalo Bay.
            </div>
          </div>
        </div>

        {/* Resort Assistance Service Card */}
        <div className="p-8 md:p-10 border border-amber-200 bg-amber-50/40 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="w-16 h-16 bg-amber-100 flex items-center justify-center shrink-0 rounded-full text-amber-700">
            <Compass size={32} />
          </div>
          <div className="flex-1 space-y-3">
            <h4 className="text-stone-800" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.6rem', fontWeight: 400 }}>
              Ti aiutiamo ad organizzare il viaggio
            </h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              Per rendere il tuo arrivo il più confortevole possibile, possiamo organizzare per te un <strong>servizio taxi privato</strong> direttamente dall'aeroporto o dalla stazione dei bus di Ranong fino al molo. Inoltre, possiamo assisterti nella <strong>prenotazione dei biglietti del motoscafo</strong>.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100/50 px-3 py-1.5 inline-flex">
              <AlertCircle size={14} />
              <span>Servizio da richiedere con almeno 2 settimane di anticipo</span>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <a
              href="mailto:flowerpowerphayam@gmail.com?subject=Richiesta assistenza viaggio Koh Phayam"
              className="block text-center px-6 py-3.5 bg-amber-600 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-700 transition-colors duration-300 w-full md:w-auto font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Richiedi Assistenza
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
