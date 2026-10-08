export interface OmiseRecordedTransaction {
  orderNo: string;
  chargeId: string;
  customerName: string;
  customerEmail?: string;
  purchaseType?: string; // es. 'Pizza Delivery Ranong', 'Ordine Pizzeria'
  itemDescription?: string;
  amount: number; // in THB
  channel: 'card' | 'promptpay';
  date: string;
  status: 'PAID' | 'REFUNDED' | 'PENDING' | 'EXPIRED';
  refundedAmount?: number;
}

const STORAGE_KEY = 'fp_omise_transactions';

const INITIAL_TRANSACTIONS: OmiseRecordedTransaction[] = [
  {
    orderNo: 'ORD-PIZZA-2701',
    chargeId: 'chrg_test_68i6gq9a1b2c3d4e',
    customerName: 'Mario Rossi (Demo)',
    customerEmail: 'mario.rossi@gmail.com',
    purchaseType: 'Pizza Delivery Ranong',
    itemDescription: '1x Margherita + 1x Diavola (Consegna Bang Rin)',
    amount: 540,
    channel: 'card',
    date: '2026-09-25T12:30:00Z',
    status: 'PAID'
  },
  {
    orderNo: 'ORD-PIZZA-2702',
    chargeId: 'chrg_test_68i6gq9x9y8z7w6v',
    customerName: 'Somchai Prasert (Demo)',
    customerEmail: 'somchai@gmail.com',
    purchaseType: 'Pizza Delivery Ranong',
    itemDescription: '2x Quattro Formaggi',
    amount: 620,
    channel: 'promptpay',
    date: '2026-09-25T11:15:00Z',
    status: 'PAID'
  }
];

export function getOmiseTransactions(): OmiseRecordedTransaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TRANSACTIONS;
  } catch (err) {
    console.warn('[OmiseTransactions] Error reading localStorage:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function recordOmiseTransaction(tx: Omit<OmiseRecordedTransaction, 'status'> & { status?: 'PAID' | 'REFUNDED' }): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getOmiseTransactions();
    const existingIndex = list.findIndex(t => t.orderNo === tx.orderNo || t.chargeId === tx.chargeId);

    const record: OmiseRecordedTransaction = {
      ...tx,
      status: tx.status || 'PAID'
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record };
    } else {
      list.unshift(record);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('[OmiseTransactions] Error saving transaction:', err);
  }
}

export function markOmiseTransactionRefunded(identifier: string, refundAmount?: number): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getOmiseTransactions();
    const updated = list.map(t => {
      if (t.orderNo === identifier || t.chargeId === identifier) {
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
    console.warn('[OmiseTransactions] Error marking refunded:', err);
  }
}
