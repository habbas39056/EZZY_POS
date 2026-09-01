import React, { useState } from 'react';
import { ArrowLeft, Info, AlertTriangle, SlidersHorizontal, Plus, Trash2, Sparkles, Layers } from 'lucide-react';
import type { 
  Product, 
  Category, 
  Location, 
  Manufacturer, 
  UnitOfMeasure,
  ProductVariant
} from '../../../types/catalog';
import { ImageUpload300x300 } from './ImageUpload300x300';

interface AddProductViewProps {
  categories: Category[];
  locations: Location[];
  manufacturers: Manufacturer[];
  uomList: UnitOfMeasure[];
  onSave: (product: Omit<Product, 'id' | 'createdOn'>) => void;
  onCancel: () => void;
}

const ACCOUNTS = [
  'Search Account',
  'Cost of Goods Sold (COGS)',
  'Sales Revenue',
  'Inventory Asset',
  'Operating Expenses',
  'Finished Goods Inventory'
];

const TAX_RATES = [
  'Select Tax Rate',
  'Standard Sales Tax (18%)',
  'Reduced Rate (10%)',
  'Exempt / Zero Rated (0%)',
  'Services Sales Tax (15%)',
  'Special Excise (20%)'
];

export const AddProductView: React.FC<AddProductViewProps> = ({
  categories,
  locations,
  manufacturers,
  uomList,
  onSave,
  onCancel
}) => {
  // Top Basic Info
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [barCode, setBarCode] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [location, setLocation] = useState('');
  const [productUOM, setProductUOM] = useState('');

  // Purchase Settings
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [purchaseAccount, setPurchaseAccount] = useState('');
  const [purchaseTaxRate, setPurchaseTaxRate] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('');

  // Sale Settings
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [saleAccount, setSaleAccount] = useState('');
  const [saleTaxRate, setSaleTaxRate] = useState('');
  const [saleUnit, setSaleUnit] = useState('');

  // New Fields & Variations
  const [openingStock, setOpeningStock] = useState<number | ''>('');
  const [warrantyDetails, setWarrantyDetails] = useState('');
  const [variationOptions, setVariationOptions] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Flags & Description & Picture
  const [trackStock, setTrackStock] = useState(false);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [canSaleOrPurchase, setCanSaleOrPurchase] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Variant helper functions
  const handleAddVariantRow = (customName = '') => {
    const baseCode = code.trim() || 'VAR';
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

    const baseCode = code.trim() || 'VAR';
    const generated: ProductVariant[] = list.map((opt, idx) => {
      // Check if variant already exists with this name
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter Product Name.');
      return;
    }

    const varList = variationOptions.split(',').map(v => v.trim()).filter(Boolean);
    const validVariants = hasVariants ? variants.filter(v => v.name.trim()) : [];
    
    // Determine effective prices
    let effSalePrice = salePrice === '' ? 0 : Number(salePrice);
    let effPurchasePrice = purchasePrice === '' ? 0 : Number(purchasePrice);
    let effStock = openingStock === '' ? 0 : Number(openingStock);

    if (hasVariants && validVariants.length > 0) {
      if (effSalePrice === 0) effSalePrice = validVariants[0].salePrice;
      if (effPurchasePrice === 0) effPurchasePrice = validVariants[0].purchasePrice;
      effStock = validVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }

    onSave({
      name: name.trim(),
      code: code.trim() || barCode.trim() || `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
      categoryName: categoryName || 'General',
      purchasePrice: effPurchasePrice,
      salePrice: effSalePrice,
      location: location || 'Main Warehouse',
      stock: effStock,
      openingStock: effStock,
      warrantyDetails,
      variationOptions: varList,
      hasVariants: hasVariants && validVariants.length > 0,
      variants: hasVariants && validVariants.length > 0 ? validVariants : undefined,
      trackStock,
      isActive,
      description: description.trim(),
      image,
      unitOfMeasure: productUOM || purchaseUnit || 'Pcs'
    });
  };


  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-6xl mx-auto my-3 text-xs text-slate-700 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
        <h2 className="text-base font-bold text-slate-800">Add Product</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ========================================= */}
        {/* 1. BASIC INFORMATION (3x3 GRID)           */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Bar Code</label>
            <input
              type="text"
              value={barCode}
              onChange={(e) => setBarCode(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Manufacturer</label>
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Manufacturer</option>
              {manufacturers.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Category</label>
            <select
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Location</option>
              {locations.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Product UOM</label>
            <select
              value={productUOM}
              onChange={(e) => {
                setProductUOM(e.target.value);
                setPurchaseUnit(e.target.value);
                setSaleUnit(e.target.value);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Product UOM</option>
              {uomList.map(u => (
                <option key={u.id} value={u.symbol}>{u.name} ({u.symbol})</option>
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
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
                      <th className="px-3 py-2 w-1/6">Purchase Cost</th>
                      <th className="px-3 py-2 w-1/6">Sale Price *</th>
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
                      {Math.min(...variants.map(v => v.salePrice || 0)).toLocaleString()} - {Math.max(...variants.map(v => v.salePrice || 0)).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span>Total Stock: </span>
                    <strong className="text-slate-800 font-bold">
                      {variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)} {productUOM || 'Pcs'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>



        {/* ========================================= */}
        {/* 2. PURCHASE SETTINGS ⓘ                    */}
        {/* ========================================= */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            Purchase Settings <Info className="w-3.5 h-3.5 text-slate-400" />
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-600 mb-1">Purchase Price</label>
              <input
                type="number"
                min="0"
                step="any"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Account</label>
              <select
                value={purchaseAccount}
                onChange={(e) => setPurchaseAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white"
              >
                {ACCOUNTS.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Tax Rate</label>
              <select
                value={purchaseTaxRate}
                onChange={(e) => setPurchaseTaxRate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white"
              >
                {TAX_RATES.map(tax => (
                  <option key={tax} value={tax}>{tax}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-600 mb-1">Purchase unit</label>
              <select
                value={purchaseUnit}
                onChange={(e) => setPurchaseUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white"
              >
                <option value="">Search Unit</option>
                {uomList.map(u => (
                  <option key={u.id} value={u.symbol}>{u.name} ({u.symbol})</option>
                ))}
              </select>
              {!productUOM && (
                <p className="text-[10px] text-amber-600 mt-0.5">Select Product UOM first</p>
              )}
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 3. SALE SETTINGS ⓘ                        */}
        {/* ========================================= */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            Sale Settings <Info className="w-3.5 h-3.5 text-slate-400" />
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-600 mb-1">Sale Price</label>
              <input
                type="number"
                min="0"
                step="any"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Account</label>
              <select
                value={saleAccount}
                onChange={(e) => setSaleAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white"
              >
                {ACCOUNTS.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Tax Rate</label>
              <select
                value={saleTaxRate}
                onChange={(e) => setSaleTaxRate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white"
              >
                {TAX_RATES.map(tax => (
                  <option key={tax} value={tax}>{tax}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-600 mb-1">Sale Unit</label>
              <select
                value={saleUnit}
                onChange={(e) => setSaleUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] bg-white"
              >
                <option value="">Search Unit</option>
                {uomList.map(u => (
                  <option key={u.id} value={u.symbol}>{u.name} ({u.symbol})</option>
                ))}
              </select>
              {!productUOM && (
                <p className="text-[10px] text-amber-600 mt-0.5">Select Product UOM first</p>
              )}
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 4. TRACKING, DESCRIPTION & PERMISSIONS     */}
        {/* ========================================= */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={trackStock}
                onChange={(e) => setTrackStock(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0070ba]"
              />
              <span className="flex items-center gap-1">Track <Info className="w-3 h-3 text-slate-400" /></span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={canSaleOrPurchase}
                onChange={(e) => setCanSaleOrPurchase(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0070ba]"
              />
              <span>Can Sale or Purchase</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0070ba]"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="space-y-3">
            <ImageUpload300x300
              value={image}
              onChange={setImage}
              label="Product Picture"
              description="Restricted to max 300 × 300 px (Auto-optimized)"
            />

            <div>
              <label className="block text-slate-600 font-medium mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description, features, notes..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Warning Alert Note matching Screenshot */}
        <div className="pt-2 flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
          <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Product cannot be untracked and inactive once its tracked</span>
        </div>

        {/* Bottom Actions matching Screenshot */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="submit"
            className="px-6 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-xs text-xs transition"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};
