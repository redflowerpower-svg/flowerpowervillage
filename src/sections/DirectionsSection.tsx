import { useState } from 'react';
import { Plane, Ship, MapPin, Compass, AlertCircle } from 'lucide-react';

export default function DirectionsSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      phase: 'Fase 1',
      title: 'Arrivare a Ranong',
      icon: <Plane className="text-emerald-700" size={24} />,
      desc: "La provincia di Ranong, sulla terraferma, è la porta d'accesso per Koh Phayam. Puoi raggiungerla in due modi:",
      items: [
        { type: 'Aereo', text: 'Voli giornalieri da Bangkok (Don Mueang) a Ranong con Nok Air o AirAsia (1h 15m).' },
        { type: 'Autobus', text: 'Bus notturni o diurni dal Southern Bus Terminal di Bangkok alla stazione di Ranong (8-9h).' }
      ],
      note: 'Consigliamo di prenotare i bus tramite 12Go.asia o con Choke Anan Tour.'
    },
    {
      phase: 'Fase 2',
      title: 'Traghettare a Koh Phayam',
      icon: <Ship className="text-emerald-700" size={24} />,
      desc: 'Le imbarcazioni partono dal Molo di Ranong (Saphan Pla Pier). Scegli tra:',
      items: [
        { type: 'Speedboat', text: 'Frequenti in alta stagione (Nov-Apr), partono circa ogni ora (08:00 - 16:30). Impiegano 40 minuti (circa 350 THB).' },
        { type: 'Slow Boat', text: 'Corsa panoramica. Parte solitamente alle 10:00 e alle 15:00, impiega 2 ore (circa 280 THB).' }
      ],
      note: 'Gli orari possono subire riduzioni nella stagione dei monsoni (da Maggio a Ottobre).'
    },
    {
      phase: 'Fase 3',
      title: 'Arrivo al Resort',
      icon: <MapPin className="text-emerald-700" size={24} />,
      desc: 'Una volta sbarcato al molo principale di Koh Phayam, puoi raggiungerci a Buffalo Bay tramite:',
      items: [
        { type: 'Moto Taxi', text: 'Il mezzo più rapido e comune. Il tragitto dura circa 10 minuti ed ha un costo di 70-100 THB a persona.' },
        { type: 'Tuk-Tuk / Sidecar', text: 'Ideale se viaggi con bagagli voluminosi. Costo indicativo di 250-400 THB a corsa.' }
      ],
      note: 'Mostra al conducente il nome "Flower Power" o indica la spiaggia di Buffalo Bay.'
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-emerald-700 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Come Raggiungerci
          </p>
          <h2
            className="text-stone-850 mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}
          >
            Il Tuo Viaggio verso <em>Koh Phayam</em>
          </h2>
          <div className="w-12 h-px bg-emerald-600 mx-auto mb-5" />
          <p className="text-stone-550 text-sm max-w-xl mx-auto leading-relaxed">
            Raggiungere il Flower Power Farm Village è un'avventura affascinante. Segui le tre fasi per organizzare al meglio il viaggio.
          </p>
        </div>

        {/* MOBILE VIEW: Segmented Switcher + Single Card (saves vertical space) */}
        <div className="block md:hidden mb-10">
          {/* Tabs */}
          <div className="flex bg-stone-200/60 p-1.5 rounded-2xl mb-6 border border-stone-300/40">
            {steps.map((_, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-emerald-900 shadow-sm border border-stone-200/50'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Fase {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Card */}
          <div className="bg-white p-6 border border-stone-200 rounded-3xl shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-11 h-11 bg-emerald-50 flex items-center justify-center rounded-xl">
                  {steps[activeStep].icon}
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                    {steps[activeStep].phase}
                  </span>
                  <h3 className="text-stone-850 font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed mb-4">
                {steps[activeStep].desc}
              </p>
              <ul className="space-y-3.5 mb-5">
                {steps[activeStep].items.map((item, i) => (
                  <li key={i} className="text-xs text-stone-600 leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span><strong>{item.type}:</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-[10px] text-stone-400 italic pt-4 border-t border-stone-100">
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
                  {step.icon}
                </div>
                <span className="text-xs text-emerald-700 font-semibold tracking-widest uppercase block mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {step.phase}
                </span>
                <h3 className="text-stone-850 mb-4 font-semibold text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-4">
                  {step.desc}
                </p>
                <ul className="space-y-3 text-stone-600 text-sm mb-6">
                  {step.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-semibold mt-0.5">•</span>
                      <span><strong>{item.type}:</strong> {item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-stone-400 italic pt-4 border-t border-stone-100 mt-4">
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
            <h4 className="text-stone-850 font-semibold text-lg md:text-2xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ti aiutiamo ad organizzare il viaggio
            </h4>
            <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
              Per rendere il tuo arrivo il più confortevole possibile, possiamo organizzare per te un <strong>servizio taxi privato</strong> direttamente dall'aeroporto o dalla stazione dei bus di Ranong fino al molo. Inoltre, possiamo assisterti nella <strong>prenotazione dei biglietti del motoscafo</strong>.
            </p>
            <div className="flex items-start gap-2 text-[10px] md:text-xs text-emerald-800 bg-emerald-100/50 px-3 py-2 rounded-lg mx-auto md:mx-0 text-left">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>Poiché gli orari di barche e voli possono subire variazioni anche con breve preavviso, vi chiediamo gentilmente di contattarci non prima di una settimana dalla data del vostro arrivo.</span>
            </div>
          </div>
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <a
              href="mailto:flowerpowerphayam@gmail.com?subject=Richiesta assistenza viaggio Koh Phayam"
              className="block text-center px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs tracking-[0.15em] uppercase transition-colors duration-300 w-full md:w-auto font-semibold rounded-xl"
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
