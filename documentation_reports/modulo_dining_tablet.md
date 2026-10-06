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
4. **Esperienza Fluida Roving Tablet (Dispositivo Singolo Itinerante & Griglia Tavoli)**:
   - Accesso diretto al menu con selezione del tavolo. Quando un tavolo è occupato (`🟢 1 Ordine Attivo`), riaprendo il tavolo dal tablet il carrello reidrata automaticamente i piatti già ordinati e consente di inviare integrazioni comanda sullo stesso conto.
   - Chiusura automatica a 0ms del modale di checkout all'accettazione da parte della cucina (`ORDER_ACCEPTED` via BroadcastChannel) e ritorno alla Griglia Selezione Tavolo.
   - Linguetta flottante laterale destra (Edge-Hugger) identica al sito ufficiale, eliminando barre inferiori per non ostacolare la visuale dei piatti.
   - Modale prenotazione tavolo disattivata nel carrello (il cliente è già seduto al ristorante).
5. **Flusso Pagamento Unificato alla Cassa (Pay at Counter / Conto alla Cassa)**:
   - Eliminata la selezione forzata del metodo di pagamento al momento dell'invio dei piatti.
   - Singolo pulsante di azione: **`📨 INVIA ORDINE ALLA CASSA (-5%)`** con indicazione chiara che il conto verrà comodamente saldato alla cassa al termine della consumazione.
   - Payload ordine salvato con `payment_method: 'cassa'`.
6. **Sincronizzazione Atomica Kitchen Monitor (KDS)**:
   - All'accettazione della comanda da parte della cucina, l'allarme sonoro si arresta immediatamente a 0ms (`audioCtx.suspend()`).
   - Tutti gli ordini del tavolo vengono raggruppati a icona nel dock inferiore.
   - Alla chiusura del tavolo (`ORDER PAID`), tutti i record del tavolo vengono archiviati su Supabase e viene emesso l'evento `TABLE_SETTLED` per liberare il tavolo su tutti i tablet in sala.
7. **Lead Gen & Cross-Selling**:
   - Al checkout rilascia un **Coupon Sconto del 10%** inviato via messaggio per futuri ordini delivery da casa su `flowerpowerpizza.com`.
8. **Traduzioni Certificate DeepSeek AI**:
   - Tutte le etichette, bottoni e dialoghi sono localizzati tramite API live DeepSeek in 5 lingue: 🇮🇹 IT, 🇬🇧 EN, 🇹🇭 TH, 🇩🇪 DE, 🇲🇲 MM.
