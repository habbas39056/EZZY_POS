export interface CustomerPaymentLinkedInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  total: number;
  tax: number;
  balance: number;
  amountPaid: number;
}

export interface CustomerPayment {
  id: string;
  referenceNo: string;
  customerId: string;
  customerName: string;
  paymentDate: string;
  paymentAccount: string;
  paymentAmount: number;
  whtAmount: number;
  whtTaxPercent?: number;
  balance: number;
  status: 'Applied' | 'UnApplied' | 'Draft';
  notes?: string;
  linkedInvoices?: CustomerPaymentLinkedInvoice[];
  createdAt: string;
}

export interface DepositRow {
  id: string;
  customerId: string;
  customerName: string;
  paymentAccount: string;
  chequeNo: string;
  chequeDate: string;
  referenceNo: string;
  balance: number;
  cashReceived: number;
  remainingBalance: number;
  whtTax: number;
  notes: string;
}

export const INITIAL_CUSTOMER_PAYMENTS: CustomerPayment[] = [];
export const SAMPLE_UNPAID_INVOICES: CustomerPaymentLinkedInvoice[] = [];
