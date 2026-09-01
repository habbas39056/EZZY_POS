export interface QuotationItemRow {
  id: string;
  item: string;
  productId?: string;
  variantId?: string;
  variantName?: string;
  unit: string;
  qtyOrdered: number;
  unitPrice: number;
  discount: number;
  account: string;
  taxRatePercent: number;
  taxAmount: number;
  netAmount: number;
}


export interface Quotation {
  id: string;
  quotationNumber: string;
  referenceNo?: string;
  customerId: string;
  customerName: string;
  salesPerson?: string;
  region?: string;
  date: string;
  dueDate?: string;
  discountType: 'Discount by Amount' | 'Discount by Percentage';
  items: QuotationItemRow[];
  specialInstructions?: string;
  isTaxInclusive: boolean;
  subtotal: number;
  additionalTaxRate?: number;
  totalTax: number;
  grossTotal: number;
  status: 'Closed' | 'Partial' | 'Draft' | 'Sent';
  conversionNotes?: string;
  notes?: string;
  createdAt: string;
}

export const INITIAL_QUOTATIONS: Quotation[] = [];
