export interface BillItemRow {
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
  supplierCode: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  serialNumber?: string;
  supplierId: string;
  supplierName: string;
  employeeName?: string;
  region?: string;
  issueDate: string;
  dueDate: string;
  items: BillItemRow[];
  specialInstructions?: string;
  isTaxInclusive: boolean;
  subtotal: number;
  discount: number;
  additionalTaxRate?: number;
  totalTax: number;
  grossTotal: number;
  balance: number;
  isOverdue?: boolean;
  status: 'Completed' | 'Make Payment' | 'draft' | 'Draft' | 'approved' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
}

export const INITIAL_BILLS: Bill[] = [];
