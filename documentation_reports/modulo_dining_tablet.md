# 📱 Modulo Dining Tablet al Tavolo (`/dining`) - Specifiche & Allineamento Totale

Il modulo **Dining Tablet** è la web app dedicata agli ordini autonomi dei clienti direttamente ai tavoli del ristorante **Flower Power Pizza Ranong**.

---

## 🎯 1. Caratteristiche & Regole Operative

1. **Parità 100% di Catalogo con il Sito Ufficiale**:
   - Tutte le 14 categorie e tutti i piatti a catalogo (49 piatti di pasta, 34 pizze classiche, 6 focacce, 3 sandwich, 3 secondi, ecc.) sono visibili e sincronizzati.
   - Allineamento completo dei pattern di riconoscimento condimenti per tutte le salse di pasta (*Aglio Olio, Pomodoro, Pesto, Amatriciana, Bolognese, Carbonara, 4 Formaggi, Flower Power/Panna Funghi, Specialità di Mare, Lasagne*).
2. **Sconto Fisso al Tavolo (-5%)**:
   - Ogni articolo mostra il prezzo normale barrato e il prezzo scontato del 5% in evidenza con badge verde.
   - Nessun vincolo di primo ordine o minimo di spesa: applicato istantaneamente a tutto il carrello.
3. **Vini & Birre 100% Sbloccati**:
   - Tutte le schede dei vini italiani ed esteri (sincronizzati da Supabase Cloud) e delle birre sono aperte e ordinabili al tavolo con filtri enoteca dedicati.
4. **Esperienza Fluida Roving Tablet (Dispositivo Singolo Itinerante)**:
   - Accesso diretto immediato al menu senza schermate bloccanti o richieste di PIN all'avvio.
   - Cambio tavolo istantaneo in 1 tap direttamente dal selettore nella barra di navigazione superiore (`Tavolo 1..12`, `Capanne`, `Terrazza`, `Bancone`, o campo libero).
   - Reset automatico del carrello e della schermata dopo l'invio dell'ordine (4 secondi) per essere subito pronto a essere consegnato al tavolo successivo.
   - Linguetta flottante laterale destra (Edge-Hugger) identica al sito ufficiale, eliminando barre inferiori per non ostacolare la visuale dei piatti.
   - Modale prenotazione tavolo disattivata nel carrello (il cliente è già seduto al ristorante).
5. **Modalità Pagamento al Tavolo (3 Opzioni)**:
   - **PromptPay K-Shop Kasikorn Bank (0% Commissioni)** con QR Code zoomabile a schermo intero.
   - **Carta di Credito / Bancomat (POS Portatile al Tavolo)** portato dal personale.
   - **Contanti al Tavolo (Cash)** pagati al cameriere.
6. **Lead Gen & Cross-Selling**:
   - Al checkout rilascia un **Coupon Sconto del 10%** inviato via messaggio per futuri ordini delivery da casa su `flowerpowerpizza.com`.
