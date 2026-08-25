export interface DebitNoteItemRow {
  id: string;
  itemDescription: string;
  productId?: string;
  batchNumber: string;
  batchExpiryDate: string;
  uom: string;
  qty: number;
  unitPrice: number;
  location: string;
  account: string;
  taxRatePercent: number;
  taxAmount: number;
  netAmount: number;
  projectId?: string;
  projectName?: string;
}

export interface DebitNote {
  id: string;
  debitNoteNumber: string;
  serialNumber?: string;
  referenceNo?: string;
  supplierId: string;
  supplierName: string;
  region?: string;
  date: string;
  dueDate?: string;
  specialInstructions?: string;
  items: DebitNoteItemRow[];
  isTaxInclusive: boolean;
  subtotal: number;
  discount: number;
  totalTax: number;
  grossTotal: number;
  balance: number;
  status: 'Completed' | 'Refund' | 'Draft' | 'Approved';
  createdAt: string;
}

export const INITIAL_DEBIT_NOTES: DebitNote[] = [];
