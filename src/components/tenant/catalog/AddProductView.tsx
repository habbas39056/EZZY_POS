import React, { useState } from 'react';
import { ArrowLeft, Info, AlertTriangle } from 'lucide-react';
import type { 
  Product, 
  Category, 
  Location, 
  Manufacturer, 
  UnitOfMeasure 
} from '../../../types/catalog';

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

  // Flags & Description
  const [trackStock, setTrackStock] = useState(false);
  const [description, setDescription] = useState('');
  const [canSaleOrPurchase, setCanSaleOrPurchase] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter Product Name.');
      return;
    }

    onSave({
      name: name.trim(),
      code: code.trim() || barCode.trim(),
      categoryName: categoryName || 'General',
      purchasePrice: purchasePrice === '' ? 0 : Number(purchasePrice),
      salePrice: salePrice === '' ? 0 : Number(salePrice),
      location: location || 'Main Warehouse',
      stock: 0,
      trackStock,
      isActive,
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

          <div>
            <label className="block text-slate-600 font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba]"
            />
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
