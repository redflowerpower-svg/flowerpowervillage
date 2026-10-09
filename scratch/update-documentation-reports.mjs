import fs from 'fs';

// 1. modulo_pizza_delivery.md
const pizzaDocPath = 'documentation_reports/modulo_pizza_delivery.md';
let pizzaDoc = fs.readFileSync(pizzaDocPath, 'utf8');
const pizzaSection = `
## 🍕 11. Isolamento Z-Index Banner Promozionale & Traduzioni DeepSeek a 9 Lingue (\`PizzaPromoBanner.tsx\`, \`DeliveryMenu.tsx\`)

1. **Risoluzione Ostacoli Visivi e Gerarchia Z-Index**:
   - **Banner Promozionale Flottante (\`PizzaPromoBanner.tsx\`)**: Abbassato a \`z-30\` (prima era a \`z-[60]\`) con ombra soft superiore per rimanere sullo sfondo rispetto a qualsiasi interazione avanzata.
   - **Schede di Personalizzazione e Modali (\`ProductModal.tsx\`, \`CartDrawer.tsx\`, \`CheckoutFlow.tsx\`, \`MenuGrid.tsx\`)**: Elevati a \`z-[70]\` (backdrop) e \`z-[80]\` (pannello cassetto), garantendo che la barra di azione inferiore (*"TOTALE FINITO ... AGGIUNGI AL CARRELLO"*) rimanga sempre al 100% libera, cliccabile e mai coperta dal banner sconti.
   - **Auto-Hide Intelligente (\`DeliveryMenu.tsx\`)**: Il banner promozionale si nasconde automaticamente ogni volta che è aperta una scheda piatto (\`selectedItem\`), il carrello (\`isCartOpen\`), il checkout (\`showCheckout\`), la modale prenotazione tavolo o le policy legali.

2. **Copertura Multilingua DeepSeek Certificata a 9 Lingue (\`BANNER_I18N\`)**:
   - Allineamento completo a tutte le 9 lingue del sito (\`IT\`, \`EN\`, \`TH\`, \`MM\`, \`DE\`, \`ES\`, \`FR\`, \`RU\`, \`ZH\`) tramite traduzione ufficiale da API DeepSeek per etichetta copertura, codice applicato, nota esplicativa alimenti e tooltip di cancellazione coupon.
`;
if (!pizzaDoc.includes('11. Isolamento Z-Index Banner Promozionale')) {
  pizzaDoc = pizzaDoc.trimEnd() + '\n' + pizzaSection + '\n';
  fs.writeFileSync(pizzaDocPath, pizzaDoc, 'utf8');
  console.log('✅ Updated modulo_pizza_delivery.md');
}

// 2. modulo_village.md
const villageDocPath = 'documentation_reports/modulo_village.md';
let villageDoc = fs.readFileSync(villageDocPath, 'utf8');
const villageSection = `
## 🌴 12. Ottimizzazione Banner Promozionale Villaggio & Allineamento a 9 Lingue (\`booking-engine.tsx\`)

1. **Gerarchia Z-Index & Auto-Hide durante il Checkout**:
   - Impostato a \`z-30\` e configurato con soppressione automatica non appena viene selezionato un alloggio (\`!selectedRoom\`), evitando sovrapposizioni visive con il riepilogo finanziario o i pulsanti di pagamento Kasikorn Bank / Ksher / PayPal.
2. **Localizzazione DeepSeek N-Lingue**:
   - Banner promozionale giallo-rosso arricchito con le 9 traduzioni certificate DeepSeek (\`IT\`, \`EN\`, \`TH\`, \`MM\`, \`DE\`, \`ES\`, \`FR\`, \`RU\`, \`ZH\`) con dicitura dedicata alla validità per camera + ospiti extra.
`;
if (!villageDoc.includes('12. Ottimizzazione Banner Promozionale Villaggio')) {
  villageDoc = villageDoc.trimEnd() + '\n' + villageSection + '\n';
  fs.writeFileSync(villageDocPath, villageDoc, 'utf8');
  console.log('✅ Updated modulo_village.md');
}

// 3. motore_prezzi_sconti.md
const promoDocPath = 'documentation_reports/motore_prezzi_sconti.md';
let promoDoc = fs.readFileSync(promoDocPath, 'utf8');
const promoSection = `
## 🎟️ 8. Sincronizzazione Universale Cloud Promozioni Supabase & Parità UI Pizzeria/Villaggio

1. **Architettura Cloud Supabase Storage (\`site-images/pizza_promo_codes.json\` & \`resort_promo_codes.json\`)**:
   - Endpoint unificato backend \`/api/promo-codes\` (\`api/_handlers/promo-codes.ts\`) con supporto GET / POST tramite Service Role Key.
   - Sincronizzazione atomica bidirezionale tra pannello admin, storage cloud Supabase e front-end live sia per il Villaggio a Koh Phayam che per la Pizzeria a Ranong.
2. **Banner Flottante Giallo-Rosso in Parità Perfetta**:
   - Stessa interfaccia grafica vivace con badge sconto percentuale / fisso pulsante, Z-Index blindato a \`z-30\`, auto-hide sui flussi di checkout e traduzione DeepSeek a 9 lingue simultanee.
`;
if (!promoDoc.includes('8. Sincronizzazione Universale Cloud Promozioni')) {
  promoDoc = promoDoc.trimEnd() + '\n' + promoSection + '\n';
  fs.writeFileSync(promoDocPath, promoDoc, 'utf8');
  console.log('✅ Updated motore_prezzi_sconti.md');
}
