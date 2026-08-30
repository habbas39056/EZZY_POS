export interface InvoiceItemRow {
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

export interface InvoiceNote {
  id: string;
  text: string;
  user: string;
  createdOn: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  serialNumber?: string;
  customerId: string;
  customerName: string;
  salesPerson?: string;
  region?: string;
  invoiceDate: string;
  dueDate: string;
  requiresDeliveryChallan: boolean;
  discountType: 'Discount by Amount' | 'Discount by Percentage';
  items: InvoiceItemRow[];
  specialInstructions?: string;
  isTaxInclusive: boolean;
  subtotal: number;
  discount: number;
  additionalTaxRate?: number;
  totalTax: number;
  grossTotal: number;
  balance: number;
  paidAmount?: number;
  previousPaidAmount?: number;
  status: 'Unapproved' | 'Receive Payment' | 'Completed' | 'Draft' | 'Approved' | 'Paid' | 'Overdue';
  notes?: InvoiceNote[];
  createdAt: string;
}

export const INITIAL_INVOICES: Invoice[] = [];
