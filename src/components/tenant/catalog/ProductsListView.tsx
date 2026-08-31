import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  MoreVertical, 
  Search, 
  Trash2, 
  Warehouse,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  X,
  QrCode,
  FileSpreadsheet,
  Package
} from 'lucide-react';
import type { Product, StockAdjustment } from '../../../types/catalog';
import { INITIAL_PRODUCTS } from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';
import { ProductDetailView } from './ProductDetailView';
import { ProductQRLabelModal } from './ProductQRLabelModal';
import type { Category, Location, Manufacturer } from '../../../types/catalog';
import { INITIAL_CATEGORIES, INITIAL_LOCATIONS, INITIAL_MANUFACTURERS } from '../../../types/catalog';

import { api } from '../../../services/api';
import { parseCSV, downloadProductExcelTemplate } from '../../../utils/csvImport';

interface ProductsListViewProps {
  products?: Product[];
  categories?: Category[];
  locations?: Location[];
  manufacturers?: Manufacturer[];
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onBulkAddProducts?: (products: Product[]) => void;
  currencyCode?: string;
  currencySymbol?: string;
  onOpenAddProduct: () => void;
  onTabChange?: (tab: string) => void;
}

const DEFAULT_CHART_OF_ACCOUNTS = [
  '20001 - Retained Earnings',
  '09001 - Inventory',
  '50001 - Cost of Goods Sold (COGS)',
  '10001 - Inventory Asset',
  '60001 - Operating Expenses',
  '40001 - Sales Revenue'
];

export const ProductsListView: React.FC<ProductsListViewProps> = ({
  products: parentProducts,
  categories: parentCategories,
  locations: parentLocations,
  manufacturers: parentManufacturers,
  onUpdateProduct,
  onDeleteProduct,
  onBulkAddProducts,
  currencyCode = 'PKR',
  currencySymbol = 'Rs',
  onOpenAddProduct,
  onTabChange
}) => {
  const [localProducts, setLocalProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [localCategories, setLocalCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [localLocations, setLocalLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [localManufacturers, setLocalManufacturers] = useState<Manufacturer[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_manufacturers');
    return saved ? JSON.parse(saved) : INITIAL_MANUFACTURERS;
  });

  const products = parentProducts !== undefined ? parentProducts : localProducts;
  const categories = parentCategories !== undefined ? parentCategories : localCategories;
  const locations = parentLocations !== undefined ? parentLocations : localLocations;
  const manufacturers = parentManufacturers !== undefined ? parentManufacturers : localManufacturers;

  React.useEffect(() => {
    if (parentProducts !== undefined) return;
    const loadData = async () => {
      try {
        const [c, l, m, p] = await Promise.all([
          api.getCategories(),
          api.getLocations(),
          api.getManufacturers(),
          api.getProducts()
        ]);
        if (c && Array.isArray(c) && c.length > 0) setLocalCategories(c);
        if (l && Array.isArray(l) && l.length > 0) setLocalLocations(l);
        if (m && Array.isArray(m) && m.length > 0) setLocalManufacturers(m);
        if (p && Array.isArray(p) && p.length > 0) setLocalProducts(p);
      } catch (e) {}
    };
    loadData();
  }, [parentProducts]);

  // Selected Product for Detail / Edit view
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem('adwiselabs_stock_adjustments');
    if (saved) return JSON.parse(saved);
    
    // Initial sample stock history matching screenshot 3
    return [
      {
        id: 'adj_001',
        productId: 'prod_001',
        productName: 'Techno Solar Inverter 8Kw',
        adjustmentType: 'Bill Invoice',
        date: '18-Aug-2026',
        quantity: 10,
        unitPrice: 300000,
        totalValue: 3000000,
        accountHead: '09001 - Inventory',
        notes: 'Stock In',
        createdOn: '18-Aug-2026'
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        const newProducts = parsed.map(p => ({
          id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          code: p.Code || p.code || p.SKU || p.sku || `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
          name: p.Name || p.name || p['Product Name'] || p['Item Name'] || 'Unnamed Product',
          categoryName: p.Category || p.category || p['Category Name'] || 'General',
          departmentName: p.Department || p.department || p['Department Name'] || '',
          purchasePrice: Number(p['Purchase Price'] || p['Cost Price'] || p.purchasePrice) || 0,
          salePrice: Number(p['Sale Price'] || p.Price || p.salePrice || p['Unit Price']) || 0,
          stock: Number(p.Stock || p.stock || p.Quantity || p.Qty) || 0,
          openingStock: Number(p['Opening Stock'] || p.openingStock || p.Stock || 0) || 0,
          location: p.Location || p.location || 'Main Warehouse',
          unitOfMeasure: p.UOM || p.uom || p.Unit || p.unitOfMeasure || 'Pcs',
          trackStock: p['Track Stock'] !== 'false' && p.trackStock !== 'false',
          isActive: p['Active'] !== 'false' && p.isActive !== 'false',
          warrantyDetails: p['Warranty Details'] || p.Warranty || p.warranty || '',
          variationOptions: (p['Variation Options'] || p.Variations || p.variants || '')
            ? (p['Variation Options'] || p.Variations || p.variants || '').split(',').map((v: string) => v.trim()).filter(Boolean)
            : [],
          description: p.Description || p.description || '',
          image: p.Image || p.image || p.Picture || p.picture || '',
          createdOn: new Date().toISOString().split('T')[0]
        }));
        
        try {
          const res = await fetch('http://localhost:5000/api/catalog/products/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProducts)
          });
          if (res.ok) {
            alert(`Imported ${newProducts.length} products successfully!`);
          } else {
            alert('Import saved locally.');
          }
        } catch {
          // offline fallback
        }
        if (onBulkAddProducts) {
          onBulkAddProducts(newProducts);
        } else {
          saveProducts([...newProducts, ...products]);
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };


  const [showBatchQrModal, setShowBatchQrModal] = useState(false);
  const [qrModalProduct, setQrModalProduct] = useState<Product | null>(null);

  const handlePrintLabels = () => {
    setShowBatchQrModal(true);
  };

  // 1. Stock Adjustment Modal State (Screenshot 2)
  const [adjustmentModalProduct, setAdjustmentModalProduct] = useState<Product | null>(null);
  const [adjType, setAdjType] = useState<'Increase' | 'Decrease'>('Increase');
  const [adjQty, setAdjQty] = useState<number | ''>('');
  const [adjUnitPrice, setAdjUnitPrice] = useState<number | ''>(0);
  const [adjAccount, setAdjAccount] = useState<string>('20001 - Retained Earnings');
  
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [adjDate, setAdjDate] = useState<string>(getTodayFormatted());
  const [adjNote, setAdjNote] = useState<string>('');

  // 2. Stock History Modal State (Screenshot 3)
  const [historyModalProduct, setHistoryModalProduct] = useState<Product | null>(null);
  const [historyFilterType, setHistoryFilterType] = useState<string>('All');
  const [historyStartDate, setHistoryStartDate] = useState<string>('');
  const [historyEndDate, setHistoryEndDate] = useState<string>('');

  const saveProducts = (data: Product[]) => {
    setLocalProducts(data);
    localStorage.setItem('adwiselabs_catalog_products', JSON.stringify(data));
  };

  const saveAdjustments = (data: StockAdjustment[]) => {
    setStockAdjustments(data);
    localStorage.setItem('adwiselabs_stock_adjustments', JSON.stringify(data));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      if (onDeleteProduct) {
        onDeleteProduct(id);
      } else {
        saveProducts(products.filter(p => p.id !== id));
        api.deleteProduct(id).catch(() => {});
      }
      setActiveMenuId(null);
    }
  };

  const handleOpenNewAdjustment = (prod: Product) => {
    setAdjustmentModalProduct(prod);
    setAdjType('Increase');
    setAdjQty('');
    setAdjUnitPrice(prod.purchasePrice ?? 0);
    setAdjAccount('20001 - Retained Earnings');
    setAdjDate(getTodayFormatted());
    setAdjNote('');
    setActiveMenuId(null);
  };

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentModalProduct) return;

    const qtyNumber = Number(adjQty) || 0;
    if (qtyNumber <= 0) {
      alert('Please enter a valid Quantity.');
      return;
    }

    const priceNumber = Number(adjUnitPrice) || 0;
    const totalVal = qtyNumber * priceNumber;

    // Update Product Stock
    const updatedStock = adjType === 'Increase'
      ? adjustmentModalProduct.stock + qtyNumber
      : Math.max(0, adjustmentModalProduct.stock - qtyNumber);

    const updatedProd: Product = {
      ...adjustmentModalProduct,
      stock: updatedStock,
      purchasePrice: priceNumber > 0 ? priceNumber : adjustmentModalProduct.purchasePrice
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProd);
    } else {
      const updatedProductList = products.map(p => p.id === updatedProd.id ? updatedProd : p);
      saveProducts(updatedProductList);
      api.saveProduct(updatedProd).catch(() => {});
    }

    // Record Stock History Item
    const newAdjRecord: StockAdjustment = {
      id: `adj_${Date.now()}`,
      productId: adjustmentModalProduct.id,
      productName: adjustmentModalProduct.name,
      adjustmentType: 'Stock Adjustment',
      date: adjDate || getTodayFormatted(),
      quantity: adjType === 'Increase' ? qtyNumber : -qtyNumber,
      unitPrice: priceNumber,
      totalValue: totalVal,
      accountHead: adjAccount,
      notes: adjNote || (adjType === 'Increase' ? 'Stock Adjustment (Increase)' : 'Stock Adjustment (Decrease)'),
      createdOn: getTodayFormatted()
    };

    saveAdjustments([newAdjRecord, ...stockAdjustments]);
    alert(`Stock for ${adjustmentModalProduct.name} updated to ${updatedStock} units!`);
    setAdjustmentModalProduct(null);
  };

  const filteredProducts = products.filter(p => 
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter history records for the active modal product
  const productHistoryRecords = historyModalProduct
    ? stockAdjustments.filter(adj => {
        const matchesProduct = adj.productId === historyModalProduct.id || adj.productName.toLowerCase() === historyModalProduct.name.toLowerCase();
        const matchesType = historyFilterType === 'All' || adj.adjustmentType === historyFilterType;
        return matchesProduct && matchesType;
      })
    : [];

  const totalHistoryQty = productHistoryRecords.reduce((sum, r) => sum + r.quantity, 0);

  if (selectedDetailProduct) {
    return (
      <ProductDetailView
        product={selectedDetailProduct}
        categories={categories}
        locations={locations}
        manufacturers={manufacturers}
        onBack={() => setSelectedDetailProduct(null)}
        onUpdate={(updatedProduct) => {
          if (onUpdateProduct) {
            onUpdateProduct(updatedProduct);
          } else {
            const updatedList = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
            saveProducts(updatedList);
            api.saveProduct(updatedProduct).catch(() => {});
          }
          setSelectedDetailProduct(updatedProduct);
        }}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
        onTabChange={onTabChange}
      />
    );
  }

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* 1. Header Bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-800">Products</h2>

          <div className="flex items-center space-x-2">
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
            <button
              onClick={downloadProductExcelTemplate}
              title="Download Excel / CSV Template for Product Import"
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel Template
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white text-xs font-bold rounded shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={handlePrintLabels}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              Print Labels
            </button>
            <button
              onClick={onOpenAddProduct}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Product
            </button>
            <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-tab & Search Bar */}
        <div className="px-5 py-2 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center">
            <div className="px-3 py-1 bg-white text-slate-800 font-bold border-b-2 border-[#0070ba] text-xs">
              Products
            </div>
          </div>

          <div className="w-64 relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 2. Full Products Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[90px]">Code</th>
                <th className="px-4 py-3 min-w-[170px]">Item / Product Name</th>
                <th className="px-4 py-3 min-w-[130px]">Category</th>
                <th className="px-4 py-3 min-w-[150px]">Variations</th>
                <th className="px-4 py-3 min-w-[120px]">Warranty</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Purchase Price</th>
                <th className="px-4 py-3 min-w-[110px]">Location</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Sale Price</th>
                <th className="px-4 py-3 text-right min-w-[90px]">Stock</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Track</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Active</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <p className="font-semibold text-slate-600">No items or products found</p>
                      <p className="text-[10.5px] text-slate-400">Click "+ Product" to add a new inventory or service item.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition relative">
                    {/* Code */}
                    <td 
                      onClick={() => setSelectedDetailProduct(prod)}
                      className="px-4 py-3 font-mono text-slate-700 font-semibold cursor-pointer hover:text-[#0070ba]"
                    >
                      {prod.code || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Name with Tiny Thumbnail */}
                    <td 
                      onClick={() => setSelectedDetailProduct(prod)}
                      className="px-4 py-3 font-semibold text-slate-900 cursor-pointer hover:text-[#0070ba]"
                    >
                      <div className="flex items-center gap-2.5">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-7 h-7 rounded-md object-contain bg-slate-50 border border-slate-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="truncate">{prod.name}</span>
                      </div>
                    </td>

                    {/* Category Name */}
                    <td className="px-4 py-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10.5px] font-medium">
                        {prod.categoryName || 'General'}
                      </span>
                    </td>

                    {/* Variations */}
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]" title={prod.variationOptions?.join(', ')}>
                      {prod.variationOptions?.length ? prod.variationOptions.join(', ') : <span className="text-slate-300">—</span>}
                    </td>

                    {/* Warranty */}
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]" title={prod.warrantyDetails}>
                      {prod.warrantyDetails || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Purchase Price */}
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {currencySymbol} {prod.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-slate-600">
                      {prod.location || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Sale Price */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {currencySymbol} {prod.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right font-bold font-mono">
                      <span className={`px-2 py-0.5 rounded ${
                        prod.stock > 10 ? 'bg-emerald-50 text-emerald-700 font-bold' :
                        prod.stock > 0 ? 'bg-amber-50 text-amber-700 font-bold' :
                        'bg-rose-50 text-rose-700 font-bold'
                      }`}>
                        {prod.stock}
                      </span>
                    </td>

                    {/* Track */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        prod.trackStock ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {prod.trackStock ? 'Yes' : 'No'}
                      </span>
                    </td>

                    {/* Active */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        prod.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions (...) */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === prod.id ? null : prod.id)}
                        className="p-1 rounded-md text-sky-700 hover:text-slate-900 hover:bg-slate-100 transition inline-flex items-center justify-center font-bold text-sm tracking-widest"
                        title="Item Actions"
                      >
                        •••
                      </button>

                      {/* Dropdown Menu (Screenshot 1 Exact Replica) */}
                      {activeMenuId === prod.id && (
                        <div className="absolute right-4 top-8 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-left text-xs">
                          {/* + New Adjustment */}
                          <button
                            onClick={() => handleOpenNewAdjustment(prod)}
                            className="w-full px-4 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition"
                          >
                            <Plus className="w-4 h-4 text-slate-900" />
                            <span>New Adjustment</span>
                          </button>

                          {/* Stock History */}
                          <button
                            onClick={() => {
                              setHistoryModalProduct(prod);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition"
                          >
                            <Warehouse className="w-4 h-4 text-slate-900" />
                            <span>Stock History</span>
                          </button>

                          {/* Print QR Label */}
                          <button
                            onClick={() => {
                              setQrModalProduct(prod);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <QrCode className="w-4 h-4 text-[#0070ba]" />
                            <span>Print QR Label</span>
                          </button>

                          {/* Delete Product */}
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="w-full px-4 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-900 font-medium transition"
                          >
                            <Trash2 className="w-4 h-4 text-slate-900" />
                            <span>Delete Product</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-end space-x-4 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 font-semibold"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div>
            1 - {products.length} of {products.length}
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 4. PRODUCT STOCK ADJUSTMENT MODAL (SCREENSHOT 2 REPLICA) */}
      {/* ======================================================= */}
      {adjustmentModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-xs">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Product Stock Adjustment
              </h3>
              <button 
                onClick={() => setAdjustmentModalProduct(null)} 
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form matching Screenshot 2 */}
            <form onSubmit={handleSaveStockAdjustment} className="p-6 space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={adjustmentModalProduct.name}
                  className="w-full px-3 py-2 border border-sky-400 rounded focus:outline-none bg-white text-slate-800 text-xs shadow-2xs"
                />
              </div>

              {/* Current Stock */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Current Stock
                </label>
                <input
                  type="text"
                  readOnly
                  value={adjustmentModalProduct.stock}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white text-slate-800 text-xs"
                />
              </div>

              {/* Stock Adjustment Type (Radio buttons) */}
              <div>
                <label className="block text-slate-500 font-medium mb-1.5">
                  Stock Adjustment Type
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockAdjustmentType"
                      checked={adjType === 'Increase'}
                      onChange={() => setAdjType('Increase')}
                      className="w-4 h-4 text-[#0070ba] focus:ring-sky-400"
                    />
                    <span className="text-slate-800 font-medium">Increase</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockAdjustmentType"
                      checked={adjType === 'Decrease'}
                      onChange={() => setAdjType('Decrease')}
                      className="w-4 h-4 text-[#0070ba] focus:ring-sky-400"
                    />
                    <span className="text-slate-800 font-medium">Decrease</span>
                  </label>
                </div>
              </div>

              {/* Quantity * */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                  placeholder=""
                />
              </div>

              {/* Unit Price * */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Unit Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjUnitPrice}
                  onChange={(e) => setAdjUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                />
              </div>

              {/* Chart of Accounts * */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Chart of Accounts *
                </label>
                <select
                  value={adjAccount}
                  onChange={(e) => setAdjAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700"
                >
                  {DEFAULT_CHART_OF_ACCOUNTS.map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>

              {/* Stock Adjustment Date * */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Stock Adjustment Date *
                </label>
                <DatePicker
                  value={adjDate}
                  onChange={setAdjDate}
                  placeholder="DD-MMM-YYYY"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                />
              </div>

              {/* Note * */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Note *
                </label>
                <textarea
                  rows={3}
                  value={adjNote}
                  onChange={(e) => setAdjNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white resize-y"
                  placeholder=""
                />
              </div>

              {/* Action Buttons (Save and Post / Close) */}
              <div className="pt-3 flex justify-end items-center space-x-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#70b0ea] hover:bg-[#5aa0df] text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  Save and Post
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentModalProduct(null)}
                  className="px-5 py-2 bg-[#d1d5db] hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded transition"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 5. STOCK HISTORY MODAL / VIEW (SCREENSHOT 3 REPLICA)    */}
      {/* ======================================================= */}
      {historyModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden text-xs flex flex-col max-h-[90vh]">
            {/* Top Bar with Product info and Esc badge */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Stock History
                </h3>
                <p className="text-xs text-slate-500">
                  {historyModalProduct.name} ({historyModalProduct.code || 'Item'})
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setHistoryModalProduct(null)}
                  className="px-2.5 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-mono font-bold transition flex items-center gap-1"
                >
                  <span>esc</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Bar matching Screenshot 3 */}
            <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex flex-wrap items-end gap-3">
              {/* Adjustment Type */}
              <div className="w-56">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={historyFilterType}
                  onChange={(e) => setHistoryFilterType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none focus:border-[#0070ba]"
                >
                  <option value="All">All Types</option>
                  <option value="Bill Invoice">Bill Invoice</option>
                  <option value="Stock Adjustment">Stock Adjustment</option>
                  <option value="Opening Stock">Opening Stock</option>
                  <option value="Sales Invoice">Sales Invoice</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="w-48">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Start Date
                </label>
                <DatePicker
                  value={historyStartDate}
                  onChange={setHistoryStartDate}
                  placeholder="DD-MMM-YYYY"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              {/* End Date */}
              <div className="w-48">
                <label className="block text-[11px] text-slate-500 mb-1">
                  End Date
                </label>
                <DatePicker
                  value={historyEndDate}
                  onChange={setHistoryEndDate}
                  placeholder="DD-MMM-YYYY"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              {/* Get Report Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {}}
                  className="px-4 py-1.5 bg-[#002f5c] hover:bg-[#001f3f] text-white text-xs font-bold rounded shadow-xs transition"
                >
                  Get Report
                </button>
              </div>
            </div>

            {/* Table Area matching Screenshot 3 */}
            <div className="p-6 overflow-auto flex-1 bg-white">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="px-3 py-2.5 w-8"></th>
                      <th className="px-3 py-2.5 min-w-[140px]">Adjustment Type</th>
                      <th className="px-3 py-2.5 min-w-[150px]">Stock Adjustment Date</th>
                      <th className="px-3 py-2.5 text-center min-w-[80px]">Quantity</th>
                      <th className="px-3 py-2.5 text-right min-w-[110px]">Unit Price</th>
                      <th className="px-3 py-2.5 text-right min-w-[130px]">Total value</th>
                      <th className="px-3 py-2.5 min-w-[150px]">Account head</th>
                      <th className="px-3 py-2.5 min-w-[120px]">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {productHistoryRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-400">
                          No stock adjustment records found for this period.
                        </td>
                      </tr>
                    ) : (
                      productHistoryRecords.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-3 py-2 text-slate-400"></td>
                          <td className="px-3 py-2 text-slate-800 underline font-medium cursor-pointer">
                            {item.adjustmentType}
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            {item.date}
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-700">
                            {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-medium text-slate-900">
                            {item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            {item.accountHead}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {item.notes || '—'}
                          </td>
                        </tr>
                      ))
                    )}

                    {/* Highlighted Total Summary Row matching Screenshot 3 */}
                    {productHistoryRecords.length > 0 && (
                      <tr className="bg-sky-50/50 border-t border-sky-100 font-bold">
                        <td className="px-3 py-2" colSpan={3}></td>
                        <td className="px-3 py-2 text-center text-slate-900 font-bold">
                          {totalHistoryQty}
                        </td>
                        <td className="px-3 py-2" colSpan={4}></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer matching Screenshot 3 */}
              <div className="mt-3 flex items-center justify-end space-x-4 text-[11px] text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <span>Items per page:</span>
                  <select
                    className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 font-semibold"
                    defaultValue={20}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div>
                  1 - {productHistoryRecords.length} of {productHistoryRecords.length}
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Label Modal (Batch / All filtered products) */}
      {showBatchQrModal && (
        <ProductQRLabelModal
          products={filteredProducts.length > 0 ? filteredProducts : products}
          currencySymbol={currencySymbol}
          onClose={() => setShowBatchQrModal(false)}
        />
      )}

      {/* QR Label Modal (Single Product) */}
      {qrModalProduct && (
        <ProductQRLabelModal
          products={products}
          initialSelectedProductId={qrModalProduct.id}
          currencySymbol={currencySymbol}
          onClose={() => setQrModalProduct(null)}
        />
      )}
    </div>
  );
};
