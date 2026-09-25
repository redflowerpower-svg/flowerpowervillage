export interface KsherRecordedTransaction {
  orderNo: string;
  customerName: string;
  customerEmail?: string;
  purchaseType?: string; // es. 'Prenotazione Alloggio', 'Caparra Villaggio 30%', 'Link Diretto'
  roomName?: string;
  itemDescription?: string;
  datesSummary?: string; // es. '24/09/2026 - 25/09/2026 (1 notte)'
  amount: number; // in THB
  channel: 'card' | 'promptpay';
  date: string;
  status: 'PAID' | 'REFUNDED';
  refundedAmount?: number;
}

const STORAGE_KEY = 'fp_ksher_transactions';

const INITIAL_TRANSACTIONS: KsherRecordedTransaction[] = [
  {
    orderNo: 'FPBK27797776',
    customerName: 'Test Ospite Carta',
    customerEmail: 'admin@flowerpower-phayam.com',
    purchaseType: 'Prenotazione Alloggio',
    roomName: 'Fake Bungalow 2 (Test Live)',
    itemDescription: 'Fake Bungalow 2 (Test Live)',
    datesSummary: '24/09/2026 - 25/09/2026 (1 notte)',
    amount: 99,
    channel: 'card',
    date: '2026-09-24T12:31:05Z',
    status: 'REFUNDED',
    refundedAmount: 99
  },
  {
    orderNo: 'FPBK28819041',
    customerName: 'Marco Rossi',
    customerEmail: 'marco.rossi@example.it',
    purchaseType: 'Caparra Villaggio 30%',
    roomName: 'Jungle Villa (Koh Phayam)',
    itemDescription: 'Jungle Villa (Koh Phayam - Caparra 30%)',
    datesSummary: '10/11/2026 - 15/11/2026 (5 notti)',
    amount: 3600,
    channel: 'card',
    date: '2026-09-24T10:15:00Z',
    status: 'PAID'
  },
  {
    orderNo: 'FPBK28824102',
    customerName: 'Somchai Prasert',
    customerEmail: 'somchai@email.th',
    purchaseType: 'Prenotazione Alloggio (Saldo 100%)',
    roomName: 'Red Bungalow (PromptPay QR)',
    itemDescription: 'Red Bungalow (PromptPay QR)',
    datesSummary: '01/10/2026 - 02/10/2026 (1 notte)',
    amount: 540,
    channel: 'promptpay',
    date: '2026-09-23T16:45:00Z',
    status: 'PAID'
  },
  {
    orderNo: 'FPBK28833918',
    customerName: 'Elena Bianchi',
    customerEmail: 'elena.b@gmail.com',
    purchaseType: 'Caparra Villaggio 30%',
    roomName: 'Yellow Bungalow (Caparra 30%)',
    itemDescription: 'Yellow Bungalow (Caparra 30%)',
    datesSummary: '15/12/2026 - 18/12/2026 (3 notti)',
    amount: 1200,
    channel: 'card',
    date: '2026-09-22T14:20:00Z',
    status: 'PAID'
  }
];

export function getKsherTransactions(): KsherRecordedTransaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Enrich transactions with purchaseType/roomName/datesSummary if missing
      const enriched = parsed.map((t: any) => {
        const initMatch = INITIAL_TRANSACTIONS.find((it) => it.orderNo === t.orderNo);
        if (initMatch) {
          return {
            ...initMatch,
            ...t,
            purchaseType: t.purchaseType || initMatch.purchaseType,
            roomName: t.roomName || initMatch.roomName,
            itemDescription: t.itemDescription || initMatch.itemDescription,
            datesSummary: t.datesSummary || initMatch.datesSummary
          };
        }
        return {
          ...t,
          purchaseType: t.purchaseType || (t.roomName ? 'Prenotazione Alloggio' : 'Pagamento Servizi / Alloggio')
        };
      });

      // Ensure FPBK27797776 is present in the list
      const hasRealTest = enriched.some((t: any) => t.orderNo === 'FPBK27797776');
      if (!hasRealTest) {
        enriched.unshift(INITIAL_TRANSACTIONS[0]);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
      return enriched;
    }
    return INITIAL_TRANSACTIONS;
  } catch (err) {
    console.warn('[KsherTransactions] Error reading transactions:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function recordKsherTransaction(tx: Omit<KsherRecordedTransaction, 'status'> & { status?: 'PAID' | 'REFUNDED' }): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getKsherTransactions();
    const existingIndex = list.findIndex((t) => t.orderNo === tx.orderNo);
    const item: KsherRecordedTransaction = {
      ...tx,
      status: tx.status || 'PAID'
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...item };
    } else {
      list.unshift(item);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.warn('[KsherTransactions] Error recording transaction:', err);
  }
}

export function markKsherTransactionRefunded(orderNo: string, refundAmount?: number): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getKsherTransactions();
    const updated = list.map((t) => {
      if (t.orderNo === orderNo) {
        return {
          ...t,
          status: 'REFUNDED' as const,
          refundedAmount: refundAmount || t.amount
        };
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[KsherTransactions] Error marking refunded:', err);
  }
}
