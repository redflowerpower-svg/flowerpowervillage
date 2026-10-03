# 🍕 Modulo Delivery Food & Pizzeria Ranong (`/pizza`) - Specifiche Tecniche & Architettura

Il modulo **Delivery Food & Pizzeria** gestisce l'intero flusso di ordinazione online, catalogo piatti, personalizzazioni, promozioni e gestione comande per **Flower Power Pizza Ranong**.

---

## 🏗️ 1. Struttura Categorie & Schede Prodotto

Il catalogo è organizzato in **14 categorie strutturate**, sincronizzate tra Website ufficiale e Dining Tablet:

1. **Specialità del Giorno (`daily-specials`)**: Vetrina dinamica con 4 sottosezioni (Primi Piatti di Mare & Paste Ripiene, Pizze Gourmet Speciali, Secondi Piatti Tradizionali con Torta Pasqualina ligure, Focacce Artigianali).
2. **Pizze Classiche (`traditional-italian-pizza`)**: 34 pizze tradizionali a lenta lievitazione (48h) con impasto 100% italiano e 27 ingredienti extra selezionabili.
3. **Primi Piatti & Pasta (`pasta`)**: 49 piatti raggruppati per condimento (Aglio Olio, Pomodoro, Pesto, Amatriciana, Bolognese, Carbonara, 4 Formaggi, Panna e Funghi/Flower Power, Specialità di mare/ripiene, Lasagne al forno).
   - *Regola Pancetta Extra*: l'opzione `Pancetta Extra` (+50฿) è limitata esclusivamente alle varianti di **Aglio, Olio e Peperoncino**.
4. **Insalate Italiane (`italian-salads`)**: 4 insalate fresche mediterranee.
5. **Focaccia & Pizza Sandwiches (`pizza-sandwich`)**: 
   - 6 Focacce Artigianali (*Milanese 210฿, Finocchiona 190฿, Pancetta Arrotolata 190฿, Porchetta 210฿, Prosciutto Cotto 190฿, Salame 190฿*) con foto WebP senza formaggio nella ricetta base.
   - 3 Pizza Sandwiches tradizionali (*Parma Ham 190฿, Salame 190฿, Spicy Salame 190฿*).
6. **Pizza Burgers (`pizza-burgers`)**: 4 burger cotti in crosta pizza con patatine.
7. **Fritti & Sfizi (`french-fries`)**: 6 snack e contorni fritti.
8. **Dolci & Dessert (`desserts`)**: 5 dolci tradizionali italiani.
9. **Colazione & Toast (`breakfast-and-snacks`)**: 10 opzioni colazione e toast.
10. **Caffetteria & Tè (`coffee-shop`)**: 10 bevande calde e caffè espresso.
11. **Frullati & Smoothie (`fruit-drinks`)**: 4 smoothie tropicali freschi.
12. **Bibite & Acqua (`soft-drinks`)**: 3 bibite analcoliche e acqua.
13. **Birre Fresche (`beers`)**: 3 birre fredde in bottiglia.
14. **Carta dei Vini Pregiati (`wines`)**: 27+ etichette italiane ed estere sincronizzate da Supabase Cloud.

---

## 🎨 2. Regole di Design & Tipografia Ferree

1. **Product Name Line Breaking (Doppia Riga)**:
   - I titoli di tutti i piatti contenenti connettori logici vengono spezzati automaticamente su due righe prima di: `\nCON `, `\nWITH `, `\nพร้อม`, `\nMIT `, `\n& `.
2. **Ereditarietà Automatica Personalizzazioni (Extras)**:
   - Le schede mostrate nelle Specialità del Giorno ereditano in modo identico tutte le personalizzazioni e gli extra della loro categoria madre.
3. **Menu a Tendina Selezioni**:
   - I selettori di varianti e opzioni utilizzano menu a tendina con formato pulito `Scelta - Prezzo` (senza parentesi, senza simboli `+`, `-`, `>`, `<`).
4. **Dashboard Controllo Specialità del Giorno**:
   - Toggle rapido a stella per includere/escludere i piatti dalla vetrina del giorno mantenendoli sempre attivi nella loro categoria nativa, con sincronizzazione istantanea via `BroadcastChannel` e `LocalStorage`.

---

## 🛒 3. Flusso Carrello & Checkout

- **Sconto 10% Primo Ordine**: Validato tramite verifica hardware/email/telefono + GPS (bypassato in locale/staging).
- **Edge-Hugger Floating Cart**: Linguetta laterale destra per l'accesso rapido al carrello drawer con pairing consigliati.
- **Notifiche Ordini & Kitchen Monitor (KDS)**: Sincronizzazione in tempo reale con Supabase `pizza_orders`, KDS cucina e Telegram Bot.
  - Gestione avanzata comande e prenotazioni tavoli con pulsanti dedicati di presa in carico, rifiuto/cancellazione immediata (`[CANCELLED:true]`) ed eliminazione definitiva (`deleteOrder` con bypass RLS tramite `service_role`).

