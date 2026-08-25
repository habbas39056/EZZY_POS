export interface ExpenseItemRow {
  id: string;
  account: string;
  taxRatePercent: number;
  amount: number;
  taxAmount: number;
  notes: string;
}

export interface Expense {
  id: string;
  date: string;
  referenceNo: string;
  paidThrough: string;
  customer?: string;
  items: ExpenseItemRow[];
  isTaxInclusive: boolean;
  subtotal: number;
  totalTax: number;
  grossTotal: number;
  status: 'Approved' | 'Draft' | 'Pending';
  createdAt: string;
}

export const INITIAL_EXPENSES: Expense[] = [];
