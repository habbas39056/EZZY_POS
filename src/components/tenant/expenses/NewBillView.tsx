import React, { useState } from 'react';
import { 
  HelpCircle, 
  Calendar, 
  Info, 
  Plus, 
  X, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import type { Bill, BillItemRow } from '../../../types/billing';
import type { Contact } from '../../../types/contact';
import type { Region, Location, UnitOfMeasure, Product } from '../../../types/catalog';
import type { PurchaseOrder } from '../../../types/purchaseOrder';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_REGIONS, INITIAL_LOCATIONS, INITIAL_UOM, INITIAL_PRODUCTS } from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';
import { InlineAddContactModal } from '../contacts/InlineAddContactModal';
import { api } from '../../../services/api';

interface NewBillViewProps {
  initialPO?: PurchaseOrder | null;
  onSaveBill?: (bill: Bill) => void;
  onOpenAddContact?: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const DEFAULT_ACCOUNTS = [
  '09001 - Inventory',
  'Search Account',
  'Cost of Goods Sold (COGS)',
  'Inventory Asset',
  'Operating Expenses',
  'Office Supplies',
  'Freight & Shipping',
  'Utilities Expense',
  'Finished Goods'
];

const TAX_RATE_OPTIONS = [
  { label: '0% (Exempt)', value: 0 },
  { label: '5% Reduced', value: 5 },
  { label: '10% Reduced', value: 10 },
  { label: '15% Services', value: 15 },
  { label: '18% Standard Sales Tax', value: 18 },
  { label: '20% Special Excise', value: 20 }
];

export const NewBillView: React.FC<NewBillViewProps> = ({
  initialPO,
  onSaveBill,
  onOpenAddContact,
  currencySymbol = 'Rs'
}) => {
  // Datasets from storage/mock
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  const reloadContacts = () => {
    try {
      const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
      if (saved) setContacts(JSON.parse(saved));
    } catch (e) {}
  };

  const [regions] = useState<Region[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_regions');
    return saved ? JSON.parse(saved) : INITIAL_REGIONS;
  });

  const [locations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [uomList] = useState<UnitOfMeasure[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_uom');
    return saved ? JSON.parse(saved) : INITIAL_UOM;
  });

  const [products] = useState<Product[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Top Form Fields
  const [supplierId, setSupplierId] = useState(initialPO ? initialPO.supplierId : '');
  const [employeeName, setEmployeeName] = useState('');
  const [region, setRegion] = useState('');
  const [billNo, setBillNo] = useState(`BILL-${Math.floor(1000 + Math.random() * 9000)}`);
  
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [issueDate, setIssueDate] = useState(initialPO && initialPO.poDate ? initialPO.poDate : getTodayFormatted());
  const [dueDate, setDueDate] = useState(initialPO && initialPO.dueDate ? initialPO.dueDate : '');
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);

  // Line items
  const [items, setItems] = useState<BillItemRow[]>(() => {
    if (initialPO && initialPO.items && initialPO.items.length > 0) {
      return initialPO.items.map((it, idx) => ({
        id: `row_${Date.now()}_${idx}`,
        productId: it.productId,
        itemDescription: it.item,
        batchNumber: it.batchNumber || '',
        batchExpiryDate: '',
        uom: it.uom || 'Pcs',
        qty: Number(it.qtyOrdered) || 1,
        unitPrice: Number(it.purchasePrice) || 0,
        location: '',
        account: it.account || '09001 - Inventory',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: Number(it.netAmount) || (Number(it.qtyOrdered || 1) * Number(it.purchasePrice || 0)),
        supplierCode: ''
      }));
    }
    return [
      {
        id: 'row_1',
        itemDescription: '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: 'Pcs',
        qty: 1,
        unitPrice: 0,
        location: '',
        account: '09001 - Inventory',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: 0,
        supplierCode: ''
      },
      {
        id: 'row_2',
        itemDescription: '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: 'Pcs',
        qty: 1,
        unitPrice: 0,
        location: '',
        account: '09001 - Inventory',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: 0,
        supplierCode: ''
      }
    ];
  });

  // Bottom financial controls
  const [specialInstructions, setSpecialInstructions] = useState(initialPO ? (initialPO.specialInstructions || initialPO.notes || '') : '');
  const [discount, setDiscount] = useState<number | ''>(0);
  const [additionalTaxPercent, setAdditionalTaxPercent] = useState<number>(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Calculation Helper
  const computeRowAmounts = (qtyInput: any, priceInput: any, taxRateInput: any, taxInclusive: boolean) => {
    const qty = Number(qtyInput) || 0;
    const price = Number(priceInput) || 0;
    const taxRate = Number(taxRateInput) || 0;

    const baseAmount = qty * price;
    let taxAmt = 0;
    let netAmt = 0;
    let subtotalAmt = 0;

    if (taxInclusive && taxRate > 0) {
      taxAmt = baseAmount - (baseAmount / (1 + taxRate / 100));
      subtotalAmt = baseAmount - taxAmt;
      netAmt = baseAmount;
    } else {
      taxAmt = (baseAmount * taxRate) / 100;
      subtotalAmt = baseAmount;
      netAmt = baseAmount + taxAmt;
    }

    return {
      qty,
      price,
      taxRate,
      subtotal: Number(subtotalAmt.toFixed(2)),
      taxAmount: Number(taxAmt.toFixed(2)),
      netAmount: Number(netAmt.toFixed(2))
    };
  };

  // Row update handler
  const handleItemChange = (index: number, field: keyof BillItemRow, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-fill from Product selection
    if (field === 'itemDescription') {
      const matched = products.find(p => p.name === value || p.code === value);
      if (matched) {
        item.productId = matched.id;
        item.unitPrice = matched.purchasePrice || 0;
        if (!item.qty || item.qty === 0) {
          item.qty = 1;
        }
        item.supplierCode = matched.code || '';
      }
    }

    const calc = computeRowAmounts(item.qty, item.unitPrice, item.taxRatePercent, isTaxInclusive);
    item.taxAmount = calc.taxAmount;
    item.netAmount = calc.netAmount;

    updated[index] = item;
    setItems(updated);
  };

  const handleTaxInclusiveToggle = (checked: boolean) => {
    setIsTaxInclusive(checked);
    const updated = items.map(item => {
      const calc = computeRowAmounts(item.qty, item.unitPrice, item.taxRatePercent, checked);
      return { ...item, taxAmount: calc.taxAmount, netAmount: calc.netAmount };
    });
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        id: `row_${Date.now()}`,
        itemDescription: '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: 'Pcs',
        qty: 1,
        unitPrice: 0,
        location: '',
        account: '09001 - Inventory',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: 0,
        supplierCode: ''
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Dynamic Financial Totals across all rows
  const computedRowList = items.map(it => computeRowAmounts(it.qty, it.unitPrice, it.taxRatePercent, isTaxInclusive));
  const subtotal = computedRowList.reduce((acc, it) => acc + it.subtotal, 0);
  const itemsTax = computedRowList.reduce((acc, it) => acc + it.taxAmount, 0);
  const discountVal = Number(discount) || 0;
  const taxableSubtotal = Math.max(0, subtotal - discountVal);
  const additionalTaxAmt = (taxableSubtotal * (Number(additionalTaxPercent) || 0)) / 100;
  const totalTax = itemsTax + additionalTaxAmt;
  const grossTotal = Math.max(0, taxableSubtotal + (isTaxInclusive ? 0 : totalTax));

  const handleSave = (status: 'draft' | 'approved') => {
    if (!supplierId) {
      alert('Please select a Supplier.');
      return;
    }
    if (!billNo.trim()) {
      alert('Please enter a Bill Number.');
      return;
    }

    const supplierObj = contacts.find(c => c.id === supplierId);
    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      billNumber: billNo.trim(),
      supplierId,
      supplierName: supplierObj ? supplierObj.name : 'Unknown Supplier',
      employeeName,
      region,
      issueDate,
      dueDate,
      items: items.filter(it => it.itemDescription.trim() || it.qty > 0),
      specialInstructions,
      isTaxInclusive,
      subtotal,
      discount: discountVal,
      additionalTaxRate: additionalTaxPercent,
      totalTax,
      grossTotal,
      balance: grossTotal,
      isOverdue: false,
      status: status === 'approved' ? 'Make Payment' : 'draft',
      notes: newNote,
      createdAt: new Date().toISOString()
    };

    // Save to MySQL
    api.saveBill(newBill).catch(() => {});

    if (initialPO) {
      try {
        const updatedPO = { ...initialPO, status: 'Closed' as const };
        api.savePurchaseOrder(updatedPO).catch(() => {});
      } catch (e) {}
    }

    if (onSaveBill) onSaveBill(newBill);
    alert(`Bill ${billNo} has been saved as ${status.toUpperCase()}!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 w-full my-3 text-xs text-slate-700 font-sans select-none">
      {/* 1. Header matching Screenshot */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
        <h2 className="text-base font-bold text-slate-800">
          {initialPO ? `New Bill (From PO #${initialPO.poNumber})` : 'New Bill'}
        </h2>
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
        </div>
      </div>

      {/* PO Banner */}
      {initialPO && (
        <div className="mb-5 bg-sky-50 border border-sky-200 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0070ba] animate-pulse"></span>
            <span className="text-xs text-sky-900 font-semibold">
              Converted from Purchase Order <strong className="font-mono">{initialPO.poNumber}</strong>. Supplier, Items, Quantities, and Rates have been automatically populated.
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-sky-900">
            PO Total: {currencySymbol} {initialPO.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* 2. Top Header Form Section (2 Columns matching Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pb-6 border-b border-slate-100">
        {/* Left Column */}
        <div className="space-y-3.5">
          {/* Supplier with Red Outline when empty + Add Contact button */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Supplier *
            </label>
            <select
              value={supplierId}
              onFocus={reloadContacts}
              onChange={(e) => setSupplierId(e.target.value)}
              className={`w-full px-3 py-1.5 border rounded focus:outline-none text-xs bg-white text-slate-800 ${
                !supplierId ? 'border-rose-400' : 'border-slate-300 focus:border-[#0070ba]'
              }`}
            >
              <option value="">Select Supplier</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              className="mt-1.5 text-xs text-[#0070ba] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              + Add Contact
            </button>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Employee
            </label>
            <select
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Employee</option>
              <option value="Admin">Admin</option>
              <option value="Oliver Harrison">Oliver Harrison</option>
              <option value="Fatima Al-Mansoor">Fatima Al-Mansoor</option>
              <option value="Hamza Malik">Hamza Malik</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Region</option>
              {regions.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3.5">
          {/* Bill No * */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Bill No *
            </label>
            <input
              type="text"
              required
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono"
            />
          </div>

          {/* Date * */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Date *
            </label>
            <DatePicker
              value={issueDate}
              onChange={setIssueDate}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Due Date
            </label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="DD-MMM-YYYY"
            />
          </div>
        </div>
      </div>

      {/* 3. Bill Items Table Header & Checkbox (Screenshot Replica) */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Bill Items</h3>
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={isTaxInclusive}
                onChange={(e) => handleTaxInclusiveToggle(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
              />
              <span>Tax Inclusive</span>
            </label>
          </div>
        </div>

        {/* 4. Bill Items Table (Matching img1 exactly) */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="px-3 py-2 min-w-[200px]">Item/Description</th>
                <th className="px-2 py-2 w-20 text-center">Qty</th>
                <th className="px-2 py-2 w-24 text-right">Unit Price</th>
                <th className="px-3 py-2 min-w-[160px]">Account</th>
                <th className="px-3 py-2 min-w-[140px]">TAX Rate</th>
                <th className="px-2 py-2 w-20 text-right">TAX</th>
                <th className="px-3 py-2 w-28 text-right">Net Amount</th>
                <th className="px-3 py-2 w-28">supplier Code</th>
                <th className="px-2 py-2 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
              {items.map((row, idx) => {
                const rowCalc = computeRowAmounts(row.qty, row.unitPrice, row.taxRatePercent, isTaxInclusive);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    {/* Item/Description */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        list={`product-list-${idx}`}
                        placeholder=""
                        value={row.itemDescription}
                        onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] focus:outline-none text-xs"
                      />
                      <datalist id={`product-list-${idx}`}>
                        {products.map(p => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                    </td>

                    {/* Qty */}
                    <td className="p-1.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.qty !== undefined ? row.qty : 1}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-center font-semibold text-slate-900 text-xs"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="p-1.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.unitPrice !== undefined ? row.unitPrice : 0}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-right font-mono text-xs"
                      />
                    </td>

                    {/* Account */}
                    <td className="p-1.5">
                      <select
                        value={row.account}
                        onChange={(e) => handleItemChange(idx, 'account', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white text-slate-700 focus:outline-none focus:border-[#0070ba]"
                      >
                        <option value="">Search Account</option>
                        {DEFAULT_ACCOUNTS.map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </td>

                    {/* TAX Rate */}
                    <td className="p-1.5">
                      <select
                        value={row.taxRatePercent}
                        onChange={(e) => handleItemChange(idx, 'taxRatePercent', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-[#0070ba]"
                      >
                        {TAX_RATE_OPTIONS.map(t => (
                          <option key={t.label} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* TAX */}
                    <td className="px-2 py-1.5 text-right font-mono text-slate-700 font-medium">
                      {rowCalc.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Net Amount */}
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900">
                      {rowCalc.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* supplier Code */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.supplierCode}
                        onChange={(e) => handleItemChange(idx, 'supplierCode', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                      />
                    </td>

                    {/* Actions (+ / ✖ matching Screenshot) */}
                    <td className="p-1.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="w-5 h-5 rounded-full bg-[#0070ba] text-white flex items-center justify-center hover:bg-sky-700 transition cursor-pointer shadow-2xs"
                          title="Add row"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={items.length <= 1}
                          className="w-5 h-5 rounded-full bg-[#002f5c] text-white flex items-center justify-center hover:bg-rose-600 disabled:opacity-30 transition cursor-pointer shadow-2xs"
                          title="Remove row"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom Instructions & Financial Calculations (Screenshot Replica) */}
      <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Special Instructions */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            Special Instructions
          </label>
          <textarea
            rows={4}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
          />
        </div>

        {/* Right: Subtotal, Discount, Additional Tax & Gross Total */}
        <div className="space-y-3 font-sans">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Subtotal</span>
            <span className="font-mono font-bold text-slate-900">
              {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Discount</span>
            <div className="w-36">
              <input
                type="number"
                min="0"
                step="any"
                value={discount}
                onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1 border border-slate-300 rounded text-right font-mono text-xs focus:outline-none focus:border-[#0070ba]"
              />
            </div>
          </div>

          {/* Additional Tax */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Additional Tax</span>
            <div className="flex items-center space-x-1.5">
              <select
                value={additionalTaxPercent}
                onChange={(e) => setAdditionalTaxPercent(Number(e.target.value))}
                className="w-28 px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value={0}>0% Tax</option>
                <option value={2}>2% Extra</option>
                <option value={5}>5% Extra</option>
                <option value={10}>10% Extra</option>
              </select>
              <span className="font-mono text-slate-700 text-xs w-16 text-right">
                {additionalTaxAmt.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Total TAX */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center gap-1">
              Total TAX <Info className="w-3 h-3 text-slate-400" />
            </span>
            <div className="w-36">
              <input
                type="text"
                readOnly
                value={totalTax.toFixed(2)}
                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono text-xs text-slate-700 font-bold"
              />
            </div>
          </div>

          {/* Gross Total */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="font-extrabold text-slate-900">Gross Total</span>
            <span className="font-extrabold font-mono text-base text-slate-900">
              {grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Action Buttons matching Screenshot */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => handleSave('draft')}
          className="px-5 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs transition"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave('approved')}
          className="px-5 py-2 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded shadow-xs text-xs transition"
        >
          Save & Approve
        </button>
      </div>

      {/* 7. Collapsible Notes Accordion (Bottom Screenshot Replica) */}
      <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setNotesOpen(!notesOpen)}
          className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-xs font-semibold text-slate-700 border-b border-slate-200 transition"
        >
          <span>View Notes</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
            Click To Open {notesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {notesOpen && (
          <div className="p-4 bg-white space-y-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                New Note
              </label>
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add audit note or internal vendor remarks..."
                className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newNote.trim()) return;
                alert('Note saved to this bill session!');
              }}
              className="px-4 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded text-xs transition"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Inline Add Contact Modal */}
      <InlineAddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        defaultType="supplier"
        onContactCreated={(newContact) => {
          setContacts(prev => [newContact, ...prev]);
          setSupplierId(newContact.id);
        }}
      />
    </div>
  );
};
