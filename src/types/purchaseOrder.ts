export interface POItemRow {
  id: string;
  item: string;
  productId?: string;
  batchNumber: string;
  uom: string;
  qtyOrdered: number;
  purchasePrice: number;
  account: string;
  netAmount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  poDate: string;
  dueDate?: string;
  specialInstructions?: string;
  items: POItemRow[];
  total: number;
  status: 'Partial' | 'Closed' | 'Draft' | 'Pending';
  notes?: string;
  createdAt: string;
}

export interface GoodsReceivingNote {
  id: string;
  poId: string;
  poNumber: string;
  billNo?: string;
  grnDate: string;
  receivedBy: string;
  location: string;
  notes?: string;
  createdAt: string;
}

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [];
