import { Clock, UtensilsCrossed } from 'lucide-react';

const menu = [
  {
    category: 'Breakfast & Starters',
    items: [
      { name: 'Italian Colazione', desc: 'Espresso o cappuccino, cornetto caldo e succo d\'arancia fresco — l\'inizio perfetto.' },
      { name: 'Full English Breakfast', desc: 'Uova, bacon, salsiccia, toast, pomodori alla piastra e fagioli.' },
      { name: 'Fresh Fruit Platter', desc: 'Selezione stagionale di frutta tropicale fresca dell\'isola (mango, papaya, ananas).' },
    ],
  },
  {
    category: 'Le Nostre Pizze',
    items: [
      { name: 'Margherita DOC', desc: 'Pomodori San Marzano, fior di latte fresco, basilico, olio extravergine d\'oliva.' },
      { name: 'Diavola', desc: 'Salame piccante italiano, fior di latte, pomodoro, peperoncino fresco.' },
      { name: 'Quattro Stagioni', desc: 'Carciofi, prosciutto cotto, funghi, olive nere su base margherita.' },
      { name: 'Vegetariana', desc: 'Verdure grigliate di stagione dall\'orto, mozzarella, pomodoro fresco.' },
    ],
  },
  {
    category: 'Primi e Secondi Italiani',
    items: [
      { name: 'Spaghetti al Pomodoro & Basilico', desc: 'Pasta artigianale con sugo di pomodori freschi, basilico e parmigiano.' },
      { name: 'Penne all\'Arrabbiata', desc: 'Salsa piccante al pomodoro, aglio e peperoncino — tradizione romana.' },
      { name: 'Risotto ai Funghi Selvatici', desc: 'Riso Arborio cremoso cotto lentamente con funghi, vino bianco e parmigiano.' },
      { name: 'Filetto di Branzino al Forno', desc: 'Filetto di branzino cotto al forno con erbe aromatiche, limone e capperi.' },
    ],
  },
  {
    category: 'Specialità Thai & Burmese',
    items: [
      { name: 'Classic Pad Thai', desc: 'Tagliatelle di riso saltate con salsa al tamarindo, tofu, uovo, germogli di soia e arachidi.' },
      { name: 'Burmese Tea Leaf Salad (Lahpet Thoke)', desc: 'Foglie di tè fermentate, mix croccante di frutta secca tostata, aglio fritto, peperoncino e lime. Piatto tradizionale birmano.' },
      { name: 'Green Curry (Gaeng Keow Wan)', desc: 'Curry verde aromatico a base di latte di cocco con germogli di bambù, melanzane thai e basilico dolce.' },
    ],
  },
  {
    category: 'Scelte Vegane & Healthy',
    items: [
      { name: 'Vegan Margherita', desc: 'Pizza cotta nel forno a legna con mozzarella alternativa vegetale, pomodoro e basilico fresco.' },
      { name: 'Stufato di Ceci e Cocco', desc: 'Ceci cotti a fuoco lento con spinaci novelli e patate dolci in un profumato brodo di latte di cocco e spezie.' },
      { name: 'Avocado Garden Toast', desc: 'Pane a lievitazione naturale fatto in casa, avocado schiacciato, pomodorini e germogli freschi.' },
    ],
  },
  {
    category: 'Dolci & Bevande Fresche',
    items: [
      { name: 'Tiramisù della Casa', desc: 'Il classico dolce italiano con savoiardi bagnati nel caffè espresso, crema al mascarpone e cacao.' },
      { name: 'Mango Sticky Rice', desc: 'Il dolce thai più amato: mango dolce maturo servito con riso glutinosre tiepido e latte di cocco.' },
      { name: 'Fresh Coconut Shake', desc: 'Frullato cremoso a base di acqua e polpa di cocco fresco dell\'isola, super rinfrescante.' },
    ],
  },
];

export default function RestaurantSection() {
  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 lg:mb-20">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-amber-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Autentica Cucina Italiana & Sapori Locali
            </p>
            <h2
              className="text-stone-800 mb-5"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, lineHeight: 1.1 }}
            >
              L'Italia incontra le<br /><em>spiagge di Koh Phayam</em>
            </h2>
            <div className="w-10 h-px bg-amber-500 mb-6" />
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Il ristorante del Flower Power è un crocevia di culture culinarie. Proponiamo piatti della tradizione italiana al 100% — con pizza cotta nel forno a legna e pasta fatta in casa — affiancati da specialità tipiche tailandesi e birmane e un intero menu dedicato a ricette vegane e salutari.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock size={14} className="text-amber-600" />
                <span>08:00 – 21:15 daily</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <UtensilsCrossed size={14} className="text-amber-600" />
                <span>Breakfast · Lunch · Dinner</span>
              </div>
            </div>
          </div>
          {/* Contenitore immagini: su mobile layout verticale, su desktop overlay */}
          <div className="relative mt-8 lg:mt-0">
            <img
              src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Italian cuisine"
              className="w-full aspect-[4/3] object-cover"
            />
            {/* Immagine secondaria: visibile su mobile sotto la principale, su lg in overlay */}
            <div className="flex lg:hidden mt-3 gap-3">
              <img
                src="https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Wood fired pizza"
                className="w-1/3 aspect-square object-cover border-2 border-white shadow-md"
              />
              <p className="text-stone-400 text-xs leading-relaxed self-center italic">
                Autentica pizza cotta nel forno a legna — una tradizione napoletana sull'isola di Koh Phayam.
              </p>
            </div>
            <img
              src="https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Wood fired pizza"
              className="absolute -bottom-8 -left-8 w-40 h-40 object-cover border-4 border-white shadow-xl hidden lg:block"
            />
          </div>
        </div>

        {/* Menu highlights */}
        <div className="mt-16">
          <h3
            className="text-center text-stone-700 mb-10"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300 }}
          >
            Menu Highlights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {menu.map((cat, i) => (
              <div key={i} className="bg-white p-6 md:p-8 border border-stone-100">
                <h4
                  className="text-amber-700 mb-5 pb-3 border-b border-stone-100"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 400, letterSpacing: '0.05em' }}
                >
                  {cat.category}
                </h4>
                <ul className="space-y-5">
                  {cat.items.map((item, j) => (
                    <li key={j}>
                      <p className="text-stone-800 text-sm font-medium mb-0.5">{item.name}</p>
                      <p className="text-stone-400 text-xs leading-relaxed">{item.desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-stone-400 text-xs mt-8 italic">
            Menu items are indicative. Seasonal availability may vary. Ask our team for daily specials.
          </p>
        </div>
      </div>
    </section>
  );
}
