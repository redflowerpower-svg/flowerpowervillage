import type { StoryboardConfig } from '../types/storyboardTypes';

export const DEFAULT_STORYBOARDS: StoryboardConfig[] = [
  {
    id: 'tiktok-pizza-order-15s',
    name: '🍕 TikTok Promo: Ordine Margherita Gigante & Consegna Gratis (15s)',
    description: 'Video rapido e dinamico in formato 9:16 che mostra la navigazione del menu, la selezione di una pizza con extra, carrello e cassa.',
    targetFormat: '9:16',
    targetDevice: 'iPhone 14 Pro Max',
    viewportWidth: 1080,
    viewportHeight: 1920,
    deviceScaleFactor: 2,
    language: 'IT',
    cursorSimulation: true,
    recordingSpeed: 1.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'b1',
        type: 'navigate',
        title: '🏠 Ingresso nel Menu Delivery',
        description: 'Apertura del menu delivery locale con caricamento fluido',
        durationMs: 1500,
        pauseAfterMs: 800,
        speechText: 'Ordina la vera pizza italiana a Ranong direttamente dal tuo telefono!'
      },
      {
        id: 'b2',
        type: 'focus_element',
        title: '🟢 Soffermati su Banner Tricolore',
        description: 'Focus sul banner con consegna gratis e sconto primo ordine',
        durationMs: 1200,
        pauseAfterMs: 600,
        targetSelector: '#top-banners-container',
        speechText: 'Consegna rapida e gratuita a Ranong per ordini superiori a 300 Baht!'
      },
      {
        id: 'b3',
        type: 'scroll_down',
        title: '📜 Scorrimento Menu Pizze',
        description: 'Scorrimento morbido per mostrare le pizze artigianali nel forno',
        durationMs: 1500,
        scrollAmount: 420,
        pauseAfterMs: 600
      },
      {
        id: 'b4',
        type: 'open_product_modal',
        title: '🍕 Apertura Scheda Margherita',
        description: 'Tocco sulla scheda della Pizza Margherita con apertura modal',
        durationMs: 1800,
        targetProductName: 'Margherita',
        pauseAfterMs: 800,
        speechText: 'Mozzarella fior di latte italiana e pomodoro San Marzano'
      },
      {
        id: 'b5',
        type: 'select_variant',
        title: '📐 Selezione Taglia Gigante',
        description: 'Selezione opzione formato pizza Gigante (38cm)',
        durationMs: 1200,
        targetVariantName: 'Gigante',
        pauseAfterMs: 500
      },
      {
        id: 'b6',
        type: 'add_to_cart_and_close',
        title: '🛒 Aggiunta al Carrello',
        description: 'Aggiunta al carrello con chiusura modal e animazione badge',
        durationMs: 1400,
        pauseAfterMs: 800
      },
      {
        id: 'b7',
        type: 'open_cart_drawer',
        title: '🛍️ Apertura Carrello Laterale',
        description: 'Apertura del carrello per mostrare il subtotale e sconto applicato',
        durationMs: 1600,
        pauseAfterMs: 1000,
        speechText: 'Sconto 10% sul primo ordine calcolato automaticamente!'
      },
      {
        id: 'b8',
        type: 'click_checkout_button',
        title: '💳 Passaggio a Checkout & PromptPay',
        description: 'Apertura schermata di pagamento PromptPay e compilazione dati',
        durationMs: 2000,
        pauseAfterMs: 1200,
        speechText: 'Paga comodamente con PromptPay QR o contanti alla consegna'
      }
    ]
  },
  {
    id: 'tiktok-table-reservation-12s',
    name: '🛖 TikTok Promo: Prenota il tuo Tavolo in Capanna (12s)',
    description: 'Video che evidenzia l’atmosfera del locale e il nuovo modulo di prenotazione tavoli e capanne 24H.',
    targetFormat: '9:16',
    targetDevice: 'iPhone 14 Pro Max',
    viewportWidth: 1080,
    viewportHeight: 1920,
    deviceScaleFactor: 2,
    language: 'IT',
    cursorSimulation: true,
    recordingSpeed: 1.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'tr1',
        type: 'navigate',
        title: '🏠 Ingresso Home Page',
        description: 'Apertura del sito ufficiale Flower Power Pizza',
        durationMs: 1500,
        pauseAfterMs: 600,
        speechText: 'Vuoi cenare in una tipica capanna tropicale a Ranong?'
      },
      {
        id: 'tr2',
        type: 'open_table_reservation_modal',
        title: '🟢 Clic sul Banner Verde Prenota Tavolo',
        description: 'Apertura del modale interattivo di prenotazione 24H',
        durationMs: 1800,
        pauseAfterMs: 800,
        speechText: 'Prenota il tuo tavolo in capanna in pochi secondi!'
      },
      {
        id: 'tr3',
        type: 'fill_table_reservation',
        title: '✍️ Compilazione Prenotazione Tavolo',
        description: 'Selezione Capanna, 4 Persone, Orario 19:30 e Nome Ospite',
        durationMs: 2500,
        pauseAfterMs: 1000,
        formValues: {
          name: 'Marco & Friends',
          phone: '0949800200',
          email: 'marco.guest@gmail.com',
          guests: 4,
          time: '19:30',
          area: 'hut',
          notes: 'Tavolo capanna per 4 persone'
        },
        speechText: 'Ricevi la conferma immediata via email e al tavolo!'
      },
      {
        id: 'tr4',
        type: 'pause',
        title: '🎉 Mostra Conferma & Chiusura',
        description: 'Pausa di fine video con logo e invito all’azione',
        durationMs: 2000,
        speechText: 'Ti aspettiamo stasera a Flower Power Pizza Ranong!'
      }
    ]
  },
  {
    id: 'tiktok-pasta-and-wine-15s',
    name: '🍝 TikTok Promo: Pasta Fresca Fatta in Casa & Carta Vini (15s)',
    description: 'Video che presenta la selezione di pasta fatta a mano (Carbonara, Pesto, Lasagne) e la collezione di vini italiani.',
    targetFormat: '9:16',
    targetDevice: 'iPhone 14 Pro Max',
    viewportWidth: 1080,
    viewportHeight: 1920,
    deviceScaleFactor: 2,
    language: 'IT',
    cursorSimulation: true,
    recordingSpeed: 1.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'pw1',
        type: 'navigate',
        title: '🏠 Ingresso Menu',
        description: 'Apertura menu con focus sulle categorie gourmet',
        durationMs: 1500,
        pauseAfterMs: 600
      },
      {
        id: 'pw2',
        type: 'click_category',
        title: '🍝 Selezione Categoria Pasta',
        description: 'Filtro sulla categoria Pasta Fresca con menu a tendina',
        durationMs: 1800,
        targetCategory: 'pasta',
        pauseAfterMs: 800,
        speechText: 'Pasta fresca artigianale preparata ogni giorno con ingredienti genuini'
      },
      {
        id: 'pw3',
        type: 'scroll_down',
        title: '📜 Scorrimento Piatti Pasta',
        description: 'Mostra Carbonara, Ragù Bolognese e Lasagne fatte in casa',
        durationMs: 2000,
        scrollAmount: 380,
        pauseAfterMs: 800
      },
      {
        id: 'pw4',
        type: 'click_category',
        title: '🍷 Selezione Carta Vini Italiani',
        description: 'Navigazione nella collezione esclusiva di vini italiani e internazionali',
        durationMs: 2000,
        targetCategory: 'wines',
        pauseAfterMs: 1000,
        speechText: 'Accompagna i tuoi piatti con una pregiata selezione di vini'
      }
    ]
  }
];
