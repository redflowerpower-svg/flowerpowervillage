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
    orderNo: 'FPBK25093767',
    customerName: 'Marco Damonte',
    customerEmail: 'redflowerpower@gmail.com',
    purchaseType: 'Caparra Prenotazione 30%',
    roomName: 'Internal room (Internal BE)',
    itemDescription: 'Internal room (Internal BE)',
    datesSummary: '25/09/2026 - 27/09/2026 (2 notti)',
    amount: 140,
    channel: 'card',
    date: '2026-09-25T15:32:00Z',
    status: 'PAID'
  },
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
  }
];

// List of mock order IDs to purge from storage
const MOCK_ORDER_IDS = new Set(['FPBK28819041', 'FPBK28824102', 'FPBK28833918']);

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
      // Filter out demo mock transactions
      const cleaned = parsed.filter((t: any) => !MOCK_ORDER_IDS.has(t.orderNo));

      // Enrich transactions with purchaseType/roomName/datesSummary if missing
      const enriched = cleaned.map((t: any) => {
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
