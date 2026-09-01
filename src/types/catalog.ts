export interface Department {
  id: string;
  name: string;
  createdOn: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  code?: string;
  createdOn: string;
}

export interface Region {
  id: string;
  name: string;
  parentRegion?: string;
  code?: string;
  createdOn: string;
}

export interface Category {
  id: string;
  name: string;
  departmentName?: string;
  departmentId?: string;
  image?: string;
  createdOn: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  createdOn: string;
}

export interface Location {
  id: string;
  name: string;
  parentLocation?: string;
  code?: string;
  createdOn: string;
}

export interface Variation {
  id: string;
  name: string;
  code?: string;
  values: string[];
  description?: string;
  createdOn: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size: Small", "128GB / Black", "XL"
  sku?: string;
  barcode?: string;
  purchasePrice: number;
  salePrice: number;
  stock?: number;
  image?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryName: string;
  departmentName?: string;
  purchasePrice: number;
  location: string;
  salePrice: number;
  stock: number;
  trackStock: boolean;
  isActive: boolean;
  unitOfMeasure?: string;
  createdOn: string;
  openingStock?: number;
  warrantyDetails?: string;
  variationOptions?: string[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
  description?: string;
  image?: string;
}


export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  adjustmentType: 'Bill Invoice' | 'Stock Adjustment' | 'Opening Stock' | 'Sales Invoice' | 'Damage / Loss';
  date: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  accountHead: string;
  notes: string;
  createdOn?: string;
}

export const INITIAL_DEPARTMENTS: Department[] = [];
export const INITIAL_MANUFACTURERS: Manufacturer[] = [];
export const INITIAL_REGIONS: Region[] = [];
export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_VARIATIONS: Variation[] = [
  {
    id: 'var_01',
    name: 'Size',
    code: 'VAR-SIZE',
    values: ['Small', 'Medium', 'Large', 'XL', 'XXL'],
    description: 'Standard apparel & item sizing',
    createdOn: '01-Jan-2026'
  },
  {
    id: 'var_02',
    name: 'Color',
    code: 'VAR-COLOR',
    values: ['Red', 'Blue', 'Green', 'Black', 'White', 'Navy Blue'],
    description: 'Primary product shade and finish options',
    createdOn: '01-Jan-2026'
  },
  {
    id: 'var_03',
    name: 'Storage / Capacity',
    code: 'VAR-STORAGE',
    values: ['64GB', '128GB', '256GB', '512GB', '1TB'],
    description: 'Digital capacity and memory spec variations',
    createdOn: '01-Jan-2026'
  }
];
export const INITIAL_UOM: UnitOfMeasure[] = [
  { id: 'uom_01', name: 'Piece', symbol: 'Pcs', createdOn: '01-Jan-2026' },
  { id: 'uom_02', name: 'Kilogram', symbol: 'Kg', createdOn: '01-Jan-2026' },
  { id: 'uom_03', name: 'Box', symbol: 'Box', createdOn: '01-Jan-2026' },
  { id: 'uom_04', name: 'Meter', symbol: 'Mtr', createdOn: '01-Jan-2026' }
];
export const INITIAL_LOCATIONS: Location[] = [
  { id: 'loc_01', name: 'Warehouse Main', code: 'WH-01', createdOn: '01-Jan-2026' },
  { id: 'loc_02', name: 'Store Karachi', code: 'ST-01', createdOn: '01-Jan-2026' }
];
export const INITIAL_PRODUCTS: Product[] = [];

