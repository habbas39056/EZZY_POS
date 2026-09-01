export interface RecurringInvoiceItemRow {
  id: string;
  itemDescription: string;
  productId?: string;
  variantId?: string;
  variantName?: string;
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


export interface RecurringInvoice {
  id: string;
  customerId: string;
  customerName: string;
  salesPerson?: string;
  region?: string;
  repeatFrequency: number;
  repeatUnit: 'Week(s)' | 'Month(s)' | 'Year(s)';
  startDate: string;
  dueDateRule: string;
  endDate?: string;
  creationType: 'Save as Draft' | 'Save as Approved' | 'Approved For Sending';
  discountType: 'Discount by Amount' | 'Discount by Percentage';
  items: RecurringInvoiceItemRow[];
  specialInstructions?: string;
  isTaxInclusive: boolean;
  subtotal: number;
  additionalTaxRate?: number;
  totalTax: number;
  grossTotal: number;
  status: 'Active' | 'Paused';
  createdAt: string;
}

export const INITIAL_RECURRING_INVOICES: RecurringInvoice[] = [];
