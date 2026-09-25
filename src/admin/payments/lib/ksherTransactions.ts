export interface KsherRecordedTransaction {
  orderNo: string;
  customerName: string;
  customerEmail?: string;
  roomName?: string;
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
    roomName: 'Fake Bungalow 2 (Test Live)',
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
    roomName: 'Jungle Villa (Koh Phayam - Caparra 30%)',
    amount: 3600,
    channel: 'card',
    date: '2026-09-24T10:15:00Z',
    status: 'PAID'
  },
  {
    orderNo: 'FPBK28824102',
    customerName: 'Somchai Prasert',
    customerEmail: 'somchai@email.th',
    roomName: 'Red Bungalow (PromptPay QR)',
    amount: 540,
    channel: 'promptpay',
    date: '2026-09-23T16:45:00Z',
    status: 'PAID'
  },
  {
    orderNo: 'FPBK28833918',
    customerName: 'Elena Bianchi',
    customerEmail: 'elena.b@gmail.com',
    roomName: 'Yellow Bungalow (Caparra 30%)',
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
      // Ensure FPBK27797776 is present in the list
      const hasRealTest = parsed.some((t: any) => t.orderNo === 'FPBK27797776');
      if (!hasRealTest) {
        parsed.unshift(INITIAL_TRANSACTIONS[0]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
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
