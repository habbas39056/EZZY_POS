export interface PaymentLinkedBill {
  id: string;
  billNo: string;
  billDate: string;
  total: number;
  tax?: number;
  balance: number;
  amountPaid: number;
}

export interface SupplierPayment {
  id: string;
  referenceNo: string;
  supplierId: string;
  supplierName: string;
  paymentDate: string;
  paymentAccount: string;
  paymentAmount: number;
  withholdingTax: number;
  balance: number;
  notes?: string;
  status: 'Applied' | 'Unapplied' | 'Draft';
  linkedBills: PaymentLinkedBill[];
  createdAt: string;
}

export const INITIAL_SUPPLIER_PAYMENTS: SupplierPayment[] = [];
export const INITIAL_PAYMENTS: SupplierPayment[] = [];
