import { 
  generateDiningTableSession, 
  validateDiningTableSession, 
  revokeDiningTableSession, 
  buildDiningQrUrl 
} from '../src/pizza/services/diningSessionService.js';

// Polyfill localStorage & BroadcastChannel for Node testing environment
const mockStore = new Map();
global.localStorage = {
  getItem: (k) => mockStore.get(k) || null,
  setItem: (k, v) => mockStore.set(k, String(v)),
  removeItem: (k) => mockStore.delete(k)
};
global.BroadcastChannel = class {
  constructor(name) { this.name = name; }
  postMessage() {}
  close() {}
};
global.window = {
  location: { origin: 'http://localhost:3000' }
};

async function testFlow() {
  console.log('🧪 Inizio test automatico flusso Sessione Tavolo Dinamica & QR Code...\n');

  // 1. Creazione sessione per Tavolo 4
  const sessionT4 = generateDiningTableSession('tavolo-4', 'Tavolo 4');
  console.log('1. Sessione generata per Tavolo 4:', sessionT4);
  if (!sessionT4.token.startsWith('tb_tavolo4_')) {
    throw new Error('Token non conforme per Tavolo 4');
  }

  // 2. Costruzione URL QR Code
  const qrUrl = buildDiningQrUrl('tavolo-4', sessionT4.token);
  console.log('2. URL generato per il QR Code:', qrUrl);
  if (!qrUrl.includes('table=tavolo-4') || !qrUrl.includes(`token=${sessionT4.token}`)) {
    throw new Error('URL QR Code non corretto');
  }

  // 3. Validazione token da smartphone ospite (Sessione attiva)
  const validationActive = await validateDiningTableSession('tavolo-4', sessionT4.token);
  console.log('3. Validazione token ospite (attivo):', validationActive);
  if (!validationActive.valid || validationActive.status !== 'active') {
    throw new Error('La sessione valida attiva non è stata accettata');
  }

  // 4. Test Token Non Valido / Manomesso
  const validationInvalid = await validateDiningTableSession('tavolo-4', 'token_manomesso_hacker');
  console.log('4. Validazione token errato (rifiutato):', validationInvalid);
  if (validationInvalid.valid) {
    throw new Error('Token errato erroneamente convalidato');
  }

  // 5. Chiusura / Revoca Sessione (Simulazione Pagamento Conto KDS / Cassa)
  revokeDiningTableSession('tavolo-4');
  console.log('5. Revoca sessione eseguita per Tavolo 4.');

  // 6. Validazione token post-pagamento (Sessione conclusa)
  const validationSettled = await validateDiningTableSession('tavolo-4', sessionT4.token);
  console.log('6. Validazione token post-pagamento:', validationSettled);
  if (validationSettled.valid || validationSettled.status !== 'settled') {
    throw new Error('La sessione revocata non risulta settled');
  }

  console.log('\n🎉 TUTTI I 6 TEST DEL PROTOCOLLO DINING QR SONO PASSATI CON SUCCESSO!');
}

testFlow().catch((err) => {
  console.error('❌ Errore test:', err);
  process.exit(1);
});
