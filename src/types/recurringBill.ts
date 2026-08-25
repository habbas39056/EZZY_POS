import type { BillItemRow } from './billing';

export interface RecurringBill {
  id: string;
  supplierId: string;
  supplierName: string;
  employee?: string;
  region?: string;
  repeatFrequencyNumber: number;
  repeatFrequencyUnit: 'Day(s)' | 'Week(s)' | 'Month(s)' | 'Year(s)';
  startDate: string;
  endDate?: string;
  dueDateTerms?: string;
  approvalMode: 'Draft' | 'Approved';
  items: BillItemRow[];
  isTaxInclusive: boolean;
  specialInstructions?: string;
  subtotal: number;
  discount: number;
  totalTax: number;
  grossTotal: number;
  status: 'Active' | 'Draft' | 'Paused' | 'Completed';
  createdAt: string;
}

export const INITIAL_RECURRING_BILLS: RecurringBill[] = [];
