export interface CreditNoteItemRow {
  id: string;
  itemDescription: string;
  productId?: string;
  batchNumber: string;
  batchExpiryDate: string;
  uom: string;
  qty: number;
  unitPrice: number;
  location: string;
  discount: number;
  account: string;
  taxRatePercent: number;
  taxAmount: number;
  netAmount: number;
}

export interface CreditNoteRefundRecord {
  id: string;
  paymentAccount: string;
  amount: number;
  netAmount?: number;
  whtAmount?: number;
  chequeNumber?: string;
  chequeDate?: string;
  notes?: string;
  refundDate: string;
  referenceNo: string;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerId: string;
  customerName: string;
  region?: string;
  date: string;
  discountType: 'Discount by Amount' | 'Discount by Percentage';
  items: CreditNoteItemRow[];
  specialInstructions?: string;
  isTaxInclusive: boolean;
  subtotal: number;
  totalTax: number;
  grossTotal: number;
  balance: number;
  status: 'Refund' | 'Refunded' | 'Completed' | 'Draft' | 'Approved' | 'Partially Refunded';
  refunds?: CreditNoteRefundRecord[];
  createdAt: string;
}

export const INITIAL_CREDIT_NOTES: CreditNote[] = [];
