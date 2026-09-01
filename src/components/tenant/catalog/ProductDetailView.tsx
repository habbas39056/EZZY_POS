import React, { useState } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  Plus, 
  Info, 
  AlertTriangle,
  Building2,
  Factory,
  Globe,
  FolderTree,
  Package,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  QrCode,
  SlidersHorizontal,
  Trash2,
  Sparkles,
  Layers
} from 'lucide-react';
import type { 
  Product, 
  Category, 
  Location, 
  Manufacturer, 
  StockAdjustment,
  ProductVariant
} from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';
import { ProductQRLabelModal } from './ProductQRLabelModal';
import { ImageUpload300x300 } from './ImageUpload300x300';

interface ProductDetailViewProps {
  product: Product;
  categories: Category[];
  locations: Location[];
  manufacturers: Manufacturer[];
  onBack: () => void;
  onUpdate: (updatedProduct: Product) => void;
  currencyCode?: string;
  currencySymbol?: string;
  onTabChange?: (tab: string) => void;
}

const PURCHASE_ACCOUNTS = [
  '02001 - Cost of Goods Sold',
  '09001 - Inventory',
  '10001 - Inventory Asset',
  '60001 - Operating Expenses',
  '50001 - Finished Goods'
];

const SALE_ACCOUNTS = [
  '01001 - Sales',
  '40001 - Sales Revenue',
  '40002 - Service Revenue'
];

const TAX_RATE_LIST = [
  'Tax Exempt - (0%)',
  'Standard Sales Tax - (18%)',
  'Reduced Rate - (10%)',
  'Services Tax - (15%)',
  'Special Excise - (20%)'
];

const DEFAULT_CHART_OF_ACCOUNTS = [
  '20001 - Retained Earnings',
  '09001 - Inventory',
  '50001 - Cost of Goods Sold (COGS)',
  '10001 - Inventory Asset',
  '60001 - Operating Expenses',
  '40001 - Sales Revenue'
];

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  categories,
  locations,
  manufacturers,
  onBack,
  onUpdate,
  currencyCode = 'PKR',
  currencySymbol = 'Rs',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState<'detail' | 'history'>('detail');

  // Form State
  const [name, setName] = useState(product.name);
  const [code, setCode] = useState(product.code || '');
  const [barCode, setBarCode] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [categoryName, setCategoryName] = useState(product.categoryName || '');
  const [location, setLocation] = useState(product.location || '');

  // Purchase Settings
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(product.purchasePrice ?? 0);
  const [purchaseAccount, setPurchaseAccount] = useState('02001 - Cost of Goods Sold');
  const [purchaseTaxRate, setPurchaseTaxRate] = useState('Tax Exempt - (0%)');

  // Sale Settings
  const [salePrice, setSalePrice] = useState<number | ''>(product.salePrice ?? 0);
  const [saleAccount, setSaleAccount] = useState('01001 - Sales');
  const [saleTaxRate, setSaleTaxRate] = useState('Tax Exempt - (0%)');

  // Track & Description & Picture
  const [trackStock, setTrackStock] = useState(product.trackStock ?? true);
  const [trackAccount, setTrackAccount] = useState('Inventory');
  const [description, setDescription] = useState(product.description || '');
  const [image, setImage] = useState(product.image || '');
  const [canSaleOrPurchase, setCanSaleOrPurchase] = useState(true);
  const [isActive, setIsActive] = useState(product.isActive ?? true);

  // New Fields & Variations
  const [openingStock, setOpeningStock] = useState<number | ''>(product.openingStock ?? '');
  const [warrantyDetails, setWarrantyDetails] = useState(product.warrantyDetails || '');
  const [variationOptions, setVariationOptions] = useState(product.variationOptions?.join(', ') || '');
  const [hasVariants, setHasVariants] = useState<boolean>(product.hasVariants ?? (Boolean(product.variants && product.variants.length > 0)));
  const [variants, setVariants] = useState<ProductVariant[]>(product.variants || []);

  // Variant helper functions
  const handleAddVariantRow = (customName = '') => {
    const baseCode = code.trim() || product.code || 'VAR';
    const newVariant: ProductVariant = {
      id: `v_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: customName || `Variant ${variants.length + 1}`,
      sku: `${baseCode}-${variants.length + 1}`,
      purchasePrice: purchasePrice === '' ? 0 : Number(purchasePrice),
      salePrice: salePrice === '' ? 0 : Number(salePrice),
      stock: openingStock === '' ? 0 : Number(openingStock)
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateVariantsFromOptions = (optionsStr: string) => {
    const list = optionsStr.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length === 0) return;

    const baseCode = code.trim() || product.code || 'VAR';
    const generated: ProductVariant[] = list.map((opt, idx) => {
      const existing = variants.find(v => v.name.toLowerCase() === opt.toLowerCase());
      if (existing) return existing;

      return {
        id: `v_${Date.now()}_${idx}`,
        name: opt,
        sku: `${baseCode}-${opt.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}`,
        purchasePrice: purchasePrice === '' ? 0 : Number(purchasePrice),
        salePrice: salePrice === '' ? 0 : Number(salePrice),
        stock: openingStock === '' ? 0 : Number(openingStock)
      };
    });

    setVariants(generated);
    setHasVariants(true);
  };

  // Stock Adjustment Modal & QR Label Modal
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [adjType, setAdjType] = useState<'Increase' | 'Decrease'>('Increase');
  const [adjQty, setAdjQty] = useState<number | ''>('');
  const [adjUnitPrice, setAdjUnitPrice] = useState<number | ''>(product.purchasePrice ?? 0);
  const [adjAccount, setAdjAccount] = useState<string>('20001 - Retained Earnings');
  const [adjSelectedVariantId, setAdjSelectedVariantId] = useState<string>('');
  const [newVarName, setNewVarName] = useState<string>('');
  const [newVarSku, setNewVarSku] = useState<string>('');
  const [newVarSalePrice, setNewVarSalePrice] = useState<number | ''>('');
  const [newVarPurchasePrice, setNewVarPurchasePrice] = useState<number | ''>('');
  
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [adjDate, setAdjDate] = useState<string>(getTodayFormatted());
  const [adjNote, setAdjNote] = useState<string>('');

  // Stock History Filters
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem('adwiselabs_stock_adjustments');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'adj_001',
        productId: product.id,
        productName: product.name,
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

  const [historyFilterType, setHistoryFilterType] = useState<string>('All');
  const [historyStartDate, setHistoryStartDate] = useState<string>('');
  const [historyEndDate, setHistoryEndDate] = useState<string>('');

  const saveAdjustments = (data: StockAdjustment[]) => {
    setStockAdjustments(data);
    localStorage.setItem('adwiselabs_stock_adjustments', JSON.stringify(data));
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product Name is required.');
      return;
    }

    const varList = variationOptions.split(',').map(v => v.trim()).filter(Boolean);
    const validVariants = hasVariants ? variants.filter(v => v.name.trim()) : [];
    
    let effSalePrice = salePrice === '' ? 0 : Number(salePrice);
    let effPurchasePrice = purchasePrice === '' ? 0 : Number(purchasePrice);
    let effStock = openingStock === '' ? 0 : Number(openingStock);

    if (hasVariants && validVariants.length > 0) {
      if (effSalePrice === 0) effSalePrice = validVariants[0].salePrice;
      if (effPurchasePrice === 0) effPurchasePrice = validVariants[0].purchasePrice;
      effStock = validVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }

    const updated: Product = {
      ...product,
      name: name.trim(),
      code: code.trim(),
      categoryName: categoryName || 'General',
      location: location || 'Warehouse Main',
      purchasePrice: effPurchasePrice,
      salePrice: effSalePrice,
      stock: effStock,
      openingStock: effStock,
      warrantyDetails,
      variationOptions: varList,
      hasVariants: hasVariants && validVariants.length > 0,
      variants: hasVariants && validVariants.length > 0 ? validVariants : undefined,
      trackStock,
      isActive,
      description: description.trim(),
      image
    };

    onUpdate(updated);
    alert(`Product "${updated.name}" updated successfully!`);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNumber = Number(adjQty) || 0;
    if (qtyNumber <= 0) {
      alert('Please enter a valid Quantity.');
      return;
    }

    const priceNumber = Number(adjUnitPrice) || 0;
    const totalVal = qtyNumber * priceNumber;

    let updatedProd: Product;
    let historyNote = adjNote;

    if (adjSelectedVariantId === 'new') {
      if (!newVarName.trim()) {
        alert('Please enter a Variation Name.');
        return;
      }
      const newVariant: ProductVariant = {
        id: `var_${Date.now()}`,
        name: newVarName.trim(),
        sku: newVarSku.trim() || `${product.code || 'PRD'}-${Math.floor(1000 + Math.random() * 9000)}`,
        purchasePrice: priceNumber > 0 ? priceNumber : (Number(newVarPurchasePrice) || product.purchasePrice || 0),
        salePrice: Number(newVarSalePrice) || product.salePrice || 0,
        stock: qtyNumber
      };
      const existingVariants = product.variants || [];
      const updatedVariants = [...existingVariants, newVariant];
      const totalStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

      updatedProd = {
        ...product,
        hasVariants: true,
        variants: updatedVariants,
        stock: totalStock
      };
      historyNote = adjNote || `Created New Variation "${newVarName.trim()}" with initial stock of ${qtyNumber} units`;
    } else if (adjSelectedVariantId && product.variants && product.variants.length > 0) {
      const targetVariant = product.variants.find(v => v.id === adjSelectedVariantId);
      const updatedVariants = product.variants.map(v => {
        if (v.id === adjSelectedVariantId) {
          const currStock = Number(v.stock) || 0;
          const newStock = adjType === 'Increase' ? currStock + qtyNumber : Math.max(0, currStock - qtyNumber);
          return { ...v, stock: newStock, purchasePrice: priceNumber > 0 ? priceNumber : v.purchasePrice };
        }
        return v;
      });
      const totalStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

      updatedProd = {
        ...product,
        hasVariants: true,
        variants: updatedVariants,
        stock: totalStock
      };
      historyNote = adjNote || `Stock Adjustment (${adjType}) on Variation "${targetVariant?.name || adjSelectedVariantId}"`;
    } else {
      const newStock = adjType === 'Increase'
        ? product.stock + qtyNumber
        : Math.max(0, product.stock - qtyNumber);

      updatedProd = {
        ...product,
        stock: newStock,
        purchasePrice: priceNumber > 0 ? priceNumber : product.purchasePrice
      };
      historyNote = adjNote || (adjType === 'Increase' ? 'Stock Adjustment (Increase)' : 'Stock Adjustment (Decrease)');
    }

    onUpdate(updatedProd);

    const newRecord: StockAdjustment = {
      id: `adj_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      adjustmentType: 'Stock Adjustment',
      date: adjDate || getTodayFormatted(),
      quantity: adjType === 'Increase' ? qtyNumber : -qtyNumber,
      unitPrice: priceNumber,
      totalValue: totalVal,
      accountHead: adjAccount,
      notes: historyNote,
      createdOn: getTodayFormatted()
    };

    saveAdjustments([newRecord, ...stockAdjustments]);
    alert(`Stock adjusted successfully! Total product stock is now ${updatedProd.stock} units.`);
    setShowAdjustmentModal(false);
  };


  const filteredHistory = stockAdjustments.filter(adj => {
    const matchesProduct = adj.productId === product.id || adj.productName.toLowerCase() === product.name.toLowerCase();
    const matchesType = historyFilterType === 'All' || adj.adjustmentType === historyFilterType;
    return matchesProduct && matchesType;
  });

  const totalHistoryQty = filteredHistory.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto my-2 text-xs text-slate-700 font-sans select-none">
      {/* 1. TOP SUB-NAVIGATION RIBBON */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-[11px] font-semibold text-slate-600">
          <button
            onClick={() => onTabChange ? onTabChange('department') : onBack()}
            className="px-3 py-1.5 rounded hover:bg-slate-100 flex items-center gap-1.5 transition"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Department</span>
          </button>
          <button
            onClick={() => onTabChange ? onTabChange('manufacturer') : onBack()}
            className="px-3 py-1.5 rounded hover:bg-slate-100 flex items-center gap-1.5 transition"
          >
            <Factory className="w-3.5 h-3.5 text-slate-500" />
            <span>Manufacturer</span>
          </button>
          <button
            onClick={() => onTabChange ? onTabChange('region') : onBack()}
            className="px-3 py-1.5 rounded hover:bg-slate-100 flex items-center gap-1.5 transition"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Region</span>
          </button>
          <button
            onClick={() => onTabChange ? onTabChange('category') : onBack()}
            className="px-3 py-1.5 rounded hover:bg-slate-100 flex items-center gap-1.5 transition"
          >
            <FolderTree className="w-3.5 h-3.5 text-slate-500" />
            <span>Category</span>
          </button>
          <button
            onClick={() => onBack()}
            className="px-3 py-1.5 rounded bg-slate-200 text-slate-900 font-bold flex items-center gap-1.5 transition"
          >
            <Package className="w-3.5 h-3.5 text-slate-700" />
            <span>Product</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition mr-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </button>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADER & 3 METRIC SUMMARY CARDS */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {product.name}
              </h1>
              <span className="text-xs text-slate-500 font-mono">
                {product.code} • {product.categoryName || 'General'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#0070ba]" /> Print QR Label
            </button>
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Adjustment
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Cards in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Current Stock */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <span className="block text-[11px] text-slate-500 font-medium mb-1">
              Current Stock
            </span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {product.stock}
            </span>
          </div>

          {/* Card 2: Purchase Price */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <span className="block text-[11px] text-slate-500 font-medium mb-1">
              Purchase Price
            </span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {product.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Card 3: Total Purchase Order */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <span className="block text-[11px] text-slate-500 font-medium mb-1">
              Total Purchase Order
            </span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              0
            </span>
          </div>
        </div>

        {/* 3. SUB-TABS: Product Detail / Stock History */}
        <div className="border-b border-slate-200 pt-2 flex items-center space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('detail')}
            className={`pb-2.5 transition relative ${
              activeTab === 'detail'
                ? 'text-[#0070ba] font-bold border-b-2 border-[#0070ba]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Detail
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 transition relative ${
              activeTab === 'history'
                ? 'text-[#0070ba] font-bold border-b-2 border-[#0070ba]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Stock History
          </button>
        </div>

        {/* TAB 1: PRODUCT DETAIL ("Update Product" form) */}
        {activeTab === 'detail' && (
          <form onSubmit={handleUpdateProductSubmit} className="pt-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 mb-3">
              Update Product
            </h2>

            {/* Row 1: Name *, Code, Bar Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Bar Code
                </label>
                <input
                  type="text"
                  value={barCode}
                  onChange={(e) => setBarCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                />
              </div>
            </div>

            {/* Row 2: Manufacturer, Category, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Manufacturer
                </label>
                <select
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700"
                >
                  <option value="">Select Manufacturer</option>
                  {manufacturers.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Category
                </label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700"
                >
                  <option value="">Select Location</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Opening Stock</label>
                <input
                  type="number"
                  value={openingStock}
                  onChange={(e) => setOpeningStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Warranty Details</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year, 6 Months"
                  value={warrantyDetails}
                  onChange={(e) => setWarrantyDetails(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800"
                />
              </div>
            </div>

            {/* ======================================================== */}
            {/* VARIATIONS & INDIVIDUAL PRICING MATRIX SECTION           */}
            {/* ======================================================== */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#0070ba]/10 text-[#0070ba] flex items-center justify-center font-bold">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Product Variations & Pricing</h3>
                    <p className="text-[10.5px] text-slate-500">Configure different options (e.g. Size, Color, Storage) with distinct selling prices</p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setHasVariants(val);
                      if (val && variants.length === 0 && variationOptions.trim()) {
                        handleGenerateVariantsFromOptions(variationOptions);
                      } else if (val && variants.length === 0) {
                        handleAddVariantRow();
                      }
                    }}
                    className="w-3.5 h-3.5 text-[#0070ba] rounded focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Different price per variation</span>
                </label>
              </div>
              
              {/* Quick insert from saved variations */}
              {(() => {
                try {
                  const saved = localStorage.getItem('adwiselabs_catalog_variations');
                  const savedVars: Array<{ name: string; values: string[] }> = saved ? JSON.parse(saved) : [];
                  if (savedVars.length === 0) return null;
                  return (
                    <div className="space-y-1.5 bg-white border border-slate-200 rounded-md p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Quick Add From Catalog Variations:</span>
                        <span className="text-[10px] text-slate-400">Click to toggle values</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {savedVars.map(v => (
                          <div key={v.name} className="bg-slate-50 border border-slate-200 rounded-md p-1.5 flex flex-wrap items-center gap-1">
                            <span className="text-[10.5px] font-bold text-[#0070ba] mr-1">{v.name}:</span>
                            {v.values.map(val => {
                              const tag = `${v.name}: ${val}`;
                              const currentList = variationOptions.split(',').map(s => s.trim()).filter(Boolean);
                              const isSelected = currentList.includes(tag);
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => {
                                    let nextList: string[];
                                    if (isSelected) {
                                      nextList = currentList.filter(s => s !== tag);
                                    } else {
                                      nextList = [...currentList, tag];
                                    }
                                    const nextStr = nextList.join(', ');
                                    setVariationOptions(nextStr);
                                    if (hasVariants) {
                                      handleGenerateVariantsFromOptions(nextStr);
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                                    isSelected 
                                      ? 'bg-[#0070ba] text-white border-[#0070ba]' 
                                      : 'bg-white hover:bg-sky-50 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()}

              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[11px]">Variation Tags (comma separated)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Size: Small, Size: Medium, Size: Large or 128GB, 256GB"
                    value={variationOptions}
                    onChange={(e) => {
                      setVariationOptions(e.target.value);
                      if (hasVariants && e.target.value.trim()) {
                        handleGenerateVariantsFromOptions(e.target.value);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800 bg-white"
                  />
                  {variationOptions.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        handleGenerateVariantsFromOptions(variationOptions);
                      }}
                      className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#0070ba] border border-sky-200 rounded font-semibold text-[11px] shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Generate Matrix
                    </button>
                  )}
                </div>
              </div>

              {/* ======================================================== */}
              {/* 📊 VARIANT PRICING & STOCK MATRIX TABLE                  */}
              {/* ======================================================== */}
              {hasVariants && (
                <div className="mt-3 border border-sky-200 rounded-lg bg-white overflow-hidden shadow-xs">
                  <div className="px-3 py-2 bg-sky-50/80 border-b border-sky-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#0070ba]" />
                      <span className="text-xs font-bold text-slate-800">Variation Pricing & Stock Breakdown</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                        {variants.length} Variant{variants.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddVariantRow()}
                      className="px-2.5 py-1 bg-[#0070ba] hover:bg-[#005a96] text-white rounded text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Variant Row
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10.5px]">
                        <tr>
                          <th className="px-3 py-2 w-1/4">Variation Name / Option *</th>
                          <th className="px-3 py-2 w-1/5">SKU / Barcode</th>
                          <th className="px-3 py-2 w-1/6">Purchase Cost ({currencySymbol})</th>
                          <th className="px-3 py-2 w-1/6">Sale Price ({currencySymbol}) *</th>
                          <th className="px-3 py-2 w-20">Stock Qty</th>
                          <th className="px-3 py-2 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {variants.map((v, idx) => (
                          <tr key={v.id || idx} className="hover:bg-slate-50/60 transition">
                            <td className="px-3 py-1.5">
                              <input
                                type="text"
                                required
                                placeholder="e.g. Size: Medium or 256GB"
                                value={v.name}
                                onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] focus:outline-none text-xs font-semibold text-slate-800"
                              />
                            </td>
                            <td className="px-3 py-1.5">
                              <input
                                type="text"
                                placeholder="SKU-001"
                                value={v.sku || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] focus:outline-none text-xs font-mono text-slate-700"
                              />
                            </td>
                            <td className="px-3 py-1.5">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0.00"
                                value={v.purchasePrice}
                                onChange={(e) => handleUpdateVariant(idx, 'purchasePrice', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] focus:outline-none text-xs text-slate-700"
                              />
                            </td>
                            <td className="px-3 py-1.5">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                required
                                placeholder="0.00"
                                value={v.salePrice}
                                onChange={(e) => handleUpdateVariant(idx, 'salePrice', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-sky-300 bg-sky-50/30 rounded focus:border-[#0070ba] focus:outline-none text-xs font-bold text-slate-800"
                              />
                            </td>
                            <td className="px-3 py-1.5">
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={v.stock || 0}
                                onChange={(e) => handleUpdateVariant(idx, 'stock', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] focus:outline-none text-xs text-slate-700"
                              />
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                title="Remove variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {variants.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-slate-400">
                              No variants added yet. Click <strong>Auto-Generate Matrix</strong> or <strong>Add Variant Row</strong>.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Bar */}
                  {variants.length > 0 && (
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2 font-medium">
                      <div>
                        <span>Price Range: </span>
                        <strong className="text-slate-800 font-bold">
                          {currencySymbol} {Math.min(...variants.map(v => v.salePrice || 0)).toLocaleString()} - {currencySymbol} {Math.max(...variants.map(v => v.salePrice || 0)).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span>Total Stock: </span>
                        <strong className="text-slate-800 font-bold">
                          {variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)} Pcs
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>



            {/* ========================================= */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1.5">
                <span>Purchase Settings</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Purchase Price *</label>
                  <input
                    type="number"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Account</label>
                  <select
                    value={purchaseAccount}
                    onChange={(e) => setPurchaseAccount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700"
                  >
                    {PURCHASE_ACCOUNTS.map(acc => (
                      <option key={acc} value={acc}>{acc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Tax Rate</label>
                  <div className="relative">
                    <select
                      value={purchaseTaxRate}
                      onChange={(e) => setPurchaseTaxRate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700 pr-7"
                    >
                      {TAX_RATE_LIST.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {purchaseTaxRate && (
                      <button
                        type="button"
                        onClick={() => setPurchaseTaxRate('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Sale Settings (i) */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1.5">
                <span>Sale Settings</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Sale Price *</label>
                  <input
                    type="number"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Account</label>
                  <select
                    value={saleAccount}
                    onChange={(e) => setSaleAccount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700"
                  >
                    {SALE_ACCOUNTS.map(acc => (
                      <option key={acc} value={acc}>{acc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Tax Rate</label>
                  <div className="relative">
                    <select
                      value={saleTaxRate}
                      onChange={(e) => setSaleTaxRate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700 pr-7"
                    >
                      {TAX_RATE_LIST.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {saleTaxRate && (
                      <button
                        type="button"
                        onClick={() => setSaleTaxRate('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5: Track (i) */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                <input
                  type="checkbox"
                  id="trackStockCheckbox"
                  checked={trackStock}
                  onChange={(e) => setTrackStock(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                />
                <label htmlFor="trackStockCheckbox" className="cursor-pointer">Track</label>
                <Info className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Account *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={trackAccount}
                      onChange={(e) => setTrackAccount(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white pr-7"
                    />
                    {trackAccount && (
                      <button
                        type="button"
                        onClick={() => setTrackAccount('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <ImageUpload300x300
                    value={image}
                    onChange={setImage}
                    label="Product Picture"
                    description="Restricted to max 300 × 300 px (Auto-optimized)"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product description..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Row 6: Can Sale or Purchase */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="canSaleCheckbox"
                checked={canSaleOrPurchase}
                onChange={(e) => setCanSaleOrPurchase(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
              />
              <label htmlFor="canSaleCheckbox" className="text-[11px] font-medium text-slate-700 cursor-pointer">
                Can Sale or Purchase
              </label>
            </div>

            {/* Row 7: Active & Warning note */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activeProductCheckbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                />
                <label htmlFor="activeProductCheckbox" className="text-[11px] font-medium text-slate-700 cursor-pointer">
                  Active
                </label>
              </div>

              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Product cannot be untracked and inactive once its tracked</span>
              </div>
            </div>

            {/* Bottom Update Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-[#002f5c] hover:bg-[#001f3f] text-white text-xs font-bold rounded shadow-xs transition"
              >
                Update
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: STOCK HISTORY */}
        {activeTab === 'history' && (
          <div className="pt-2 space-y-4">
            {/* Filter Bar matching Screenshot 3 */}
            <div className="flex flex-wrap items-end gap-3 pb-3 border-b border-slate-100">
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

            {/* History Table */}
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
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No stock history entries found.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map(item => (
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

                  {filteredHistory.length > 0 && (
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

            {/* Pagination Footer */}
            <div className="flex items-center justify-end space-x-4 text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span>Items per page:</span>
                <select className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 font-semibold" defaultValue={20}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div>
                1 - {filteredHistory.length} of {filteredHistory.length}
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
        )}
      </div>

      {/* 4. PRODUCT STOCK ADJUSTMENT MODAL */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Product Stock Adjustment
              </h3>
              <button 
                onClick={() => setShowAdjustmentModal(false)} 
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Name</label>
                <input
                  type="text"
                  readOnly
                  value={product.name}
                  className="w-full px-3 py-2 border border-sky-400 rounded focus:outline-none bg-white text-slate-800 text-xs shadow-2xs"
                />
              </div>

              {/* Variation Selection & Creation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-500 font-medium">
                    Variation / Stock Target
                  </label>
                  {adjSelectedVariantId !== 'new' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdjSelectedVariantId('new');
                        setNewVarName('');
                        setNewVarSku(`${product.code || 'PRD'}-VAR${(product.variants?.length || 0) + 1}`);
                        setNewVarSalePrice(product.salePrice || '');
                        setNewVarPurchasePrice(adjUnitPrice || product.purchasePrice || '');
                      }}
                      className="text-xs font-semibold text-[#0070ba] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      + Create New Variation
                    </button>
                  )}
                </div>

                <select
                  value={adjSelectedVariantId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAdjSelectedVariantId(val);
                    if (val === 'new') {
                      setNewVarName('');
                      setNewVarSku(`${product.code || 'PRD'}-VAR${(product.variants?.length || 0) + 1}`);
                      setNewVarSalePrice(product.salePrice || '');
                      setNewVarPurchasePrice(adjUnitPrice || product.purchasePrice || '');
                    } else if (val) {
                      const v = product.variants?.find(item => item.id === val);
                      if (v) {
                        setAdjUnitPrice(v.purchasePrice || product.purchasePrice || 0);
                      }
                    } else {
                      setAdjUnitPrice(product.purchasePrice || 0);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
                >
                  <option value="">Main Product Stock (Total: {product.stock} units)</option>
                  {product.variants && product.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      Variation: {v.name} (Current Stock: {v.stock || 0}, Sale: Rs {v.salePrice})
                    </option>
                  ))}
                  <option value="new">➕ + Create New Variation for this Product</option>
                </select>
              </div>

              {/* If "Create New Variation" is selected, render new variant inputs */}
              {adjSelectedVariantId === 'new' && (
                <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-sky-200">
                    <span className="font-bold text-[#0070ba] text-xs flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Create New Variation Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdjSelectedVariantId(product.hasVariants && product.variants?.length ? product.variants[0].id : '')}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Cancel New Variation
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Variation Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 550W Black Frame / Red XL"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-sky-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        SKU / Code
                      </label>
                      <input
                        type="text"
                        placeholder="Optional SKU"
                        value={newVarSku}
                        onChange={(e) => setNewVarSku(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Sale Price (Rs) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1500"
                        value={newVarSalePrice}
                        onChange={(e) => setNewVarSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-sky-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                        Cost / Purchase Price (Rs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1000"
                        value={newVarPurchasePrice}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setNewVarPurchasePrice(val);
                          if (val !== '') setAdjUnitPrice(val);
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-medium mb-1">Current Stock</label>
                <input
                  type="text"
                  readOnly
                  value={
                    adjSelectedVariantId === 'new'
                      ? '0 (New Variation)'
                      : (() => {
                          const targetVar = product.variants?.find(v => v.id === adjSelectedVariantId);
                          return targetVar ? targetVar.stock || 0 : product.stock;
                        })()
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white text-slate-800 text-xs font-semibold font-mono"
                />
              </div>


              <div>
                <label className="block text-slate-500 font-medium mb-1.5">Stock Adjustment Type</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="detailStockAdjType"
                      checked={adjType === 'Increase'}
                      onChange={() => setAdjType('Increase')}
                      className="w-4 h-4 text-[#0070ba] focus:ring-sky-400"
                    />
                    <span className="text-slate-800 font-medium">Increase</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="detailStockAdjType"
                      checked={adjType === 'Decrease'}
                      onChange={() => setAdjType('Decrease')}
                      className="w-4 h-4 text-[#0070ba] focus:ring-sky-400"
                    />
                    <span className="text-slate-800 font-medium">Decrease</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Unit Price *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjUnitPrice}
                  onChange={(e) => setAdjUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Chart of Accounts *</label>
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

              <div>
                <label className="block text-slate-500 font-medium mb-1">Stock Adjustment Date *</label>
                <DatePicker
                  value={adjDate}
                  onChange={setAdjDate}
                  placeholder="DD-MMM-YYYY"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Note *</label>
                <textarea
                  rows={3}
                  value={adjNote}
                  onChange={(e) => setAdjNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white resize-y"
                />
              </div>

              <div className="pt-3 flex justify-end items-center space-x-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#70b0ea] hover:bg-[#5aa0df] text-white text-xs font-semibold rounded shadow-xs transition cursor-pointer"
                >
                  Save and Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-5 py-2 bg-[#d1d5db] hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Label Print & Preview Modal */}
      {showQrModal && (
        <ProductQRLabelModal
          products={[product]}
          initialSelectedProductId={product.id}
          currencySymbol={currencySymbol}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
