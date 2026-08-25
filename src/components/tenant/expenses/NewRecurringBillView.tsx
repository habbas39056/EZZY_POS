import React, { useState } from 'react';
import { Calendar, Plus, X, Info, ArrowLeft } from 'lucide-react';
import type { RecurringBill } from '../../../types/recurringBill';
import type { Bill, BillItemRow } from '../../../types/billing';
import type { Contact } from '../../../types/contact';
import type { Region, Location, UnitOfMeasure, Product } from '../../../types/catalog';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_REGIONS, INITIAL_LOCATIONS, INITIAL_UOM, INITIAL_PRODUCTS } from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';
import { InlineAddContactModal } from '../contacts/InlineAddContactModal';

interface NewRecurringBillViewProps {
  initialBill?: Bill | null;
  onSaveRecurring: (rec: RecurringBill) => void;
  onCancel: () => void;
  onOpenAddContact?: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const DEFAULT_ACCOUNTS = [
  'Search Account',
  'Cost of Goods Sold (COGS)',
  '09001 - Inventory',
  'Inventory Asset',
  'Operating Expenses',
  'Utilities Expense',
  'Rent Expense',
  'Office Supplies',
  'Finished Goods'
];

const TAX_RATE_OPTIONS = [
  { label: 'Tax Exempt - (0%)', value: 0 },
  { label: '0% (Exempt)', value: 0 },
  { label: '5% Reduced', value: 5 },
  { label: '10% Reduced', value: 10 },
  { label: '15% Services', value: 15 },
  { label: '18% Standard Sales Tax', value: 18 }
];

const EMPLOYEES = [
  'Select Employee',
  'Muhammad Usman (Manager)',
  'Ali Raza (Procurement Officer)',
  'Ahmed Khan (Accounts Lead)'
];

export const NewRecurringBillView: React.FC<NewRecurringBillViewProps> = ({
  initialBill,
  onSaveRecurring,
  onCancel,
  onOpenAddContact
}) => {
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

  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Schedule Fields
  const [repeatNumber, setRepeatNumber] = useState<number>(1);
  const [repeatUnit, setRepeatUnit] = useState<'Day(s)' | 'Week(s)' | 'Month(s)' | 'Year(s)'>('Week(s)');
  const [startDate, setStartDate] = useState(getTodayFormatted());
  const [dueDateTerms, setDueDateTerms] = useState('');
  const [endDate, setEndDate] = useState('');
  const [approvalMode, setApprovalMode] = useState<'Draft' | 'Approved'>('Draft');

  // Supplier info
  const [supplierId, setSupplierId] = useState(initialBill ? initialBill.supplierId : '');
  const [employee, setEmployee] = useState(initialBill ? (initialBill.employeeName || '') : '');
  const [region, setRegion] = useState(initialBill ? (initialBill.region || '') : '');
  const [isTaxInclusive, setIsTaxInclusive] = useState(initialBill ? initialBill.isTaxInclusive : false);
  const [specialInstructions, setSpecialInstructions] = useState(initialBill ? (initialBill.specialInstructions || '') : '');
  const [discount, setDiscount] = useState<number | ''>(initialBill ? (initialBill.discount || 0) : 0);

  // Line items
  const [items, setItems] = useState<BillItemRow[]>(() => {
    if (initialBill && initialBill.items && initialBill.items.length > 0) {
      return initialBill.items;
    }
    return [
      {
        id: 'row_1',
        itemDescription: '',
        supplierCode: '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: 'Pcs',
        qty: 1,
        unitPrice: 0,
        location: '',
        account: '09001 - Inventory',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: 0
      }
    ];
  });

  const handleItemChange = (index: number, field: keyof BillItemRow, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-fill from Product selection
    if (field === 'itemDescription') {
      const matched = products.find(p => p.name === value || p.code === value);
      if (matched) {
        item.productId = matched.id;
        item.supplierCode = matched.code || '';
        item.unitPrice = matched.purchasePrice || 0;
        item.location = matched.location || '';
        item.uom = matched.unitOfMeasure || 'Pcs';
      }
    }

    const qty = Number(item.qty) || 0;
    const price = Number(item.unitPrice) || 0;
    const taxRate = Number(item.taxRatePercent) || 0;

    let sub = qty * price;
    let taxAmt = 0;

    if (isTaxInclusive && taxRate > 0) {
      taxAmt = sub - (sub / (1 + taxRate / 100));
      sub = sub - taxAmt;
    } else {
      taxAmt = (sub * taxRate) / 100;
    }

    item.taxAmount = Number(taxAmt.toFixed(2));
    item.netAmount = Number((sub + (isTaxInclusive ? 0 : taxAmt)).toFixed(2));

    updated[index] = item;
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        id: `row_${Date.now()}`,
        itemDescription: '',
        supplierCode: '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: '',
        qty: 0,
        unitPrice: 0,
        location: '',
        account: '',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: 0
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)), 0);
  const totalTax = items.reduce((acc, it) => acc + (Number(it.taxAmount) || 0), 0);
  const discountVal = Number(discount) || 0;
  const grossTotal = Math.max(0, subtotal - discountVal + (isTaxInclusive ? 0 : totalTax));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert('Please select a Supplier.');
      return;
    }

    const supplierObj = contacts.find(c => c.id === supplierId);
    const newRec: RecurringBill = {
      id: `rec_${Date.now()}`,
      supplierId,
      supplierName: supplierObj ? supplierObj.name : 'Unknown Supplier',
      employee,
      region,
      repeatFrequencyNumber: repeatNumber,
      repeatFrequencyUnit: repeatUnit,
      startDate,
      endDate,
      dueDateTerms,
      approvalMode,
      items: items.filter(it => it.itemDescription.trim() || it.qty > 0),
      isTaxInclusive,
      specialInstructions,
      subtotal,
      discount: discountVal,
      totalTax,
      grossTotal,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    onSaveRecurring(newRec);
    alert(`Recurring Bill for ${newRec.supplierName} saved successfully!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-800">Set Recurring</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Recurring Bills
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ======================================================== */}
        {/* 1. TOP RECURRING SCHEDULE CARD (SCREENSHOT 2 REPLICA)    */}
        {/* ======================================================== */}
        <div className="bg-[#fcfdfe] p-4 rounded-lg border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Repeat this transaction every * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Repeat this transaction every *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={repeatNumber}
                  onChange={(e) => setRepeatNumber(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono"
                />
                <select
                  value={repeatUnit}
                  onChange={(e) => setRepeatUnit(e.target.value as any)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
                >
                  <option value="Day(s)">Day(s)</option>
                  <option value="Week(s)">Week(s)</option>
                  <option value="Month(s)">Month(s)</option>
                  <option value="Year(s)">Year(s)</option>
                </select>
              </div>
            </div>

            {/* Start Date * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Start Date *
              </label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date terms */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Due Date
              </label>
              <select
                value={dueDateTerms}
                onChange={(e) => setDueDateTerms(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
              >
                <option value="">Select Due Terms / Days</option>
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Due on End of Month">Due on End of Month</option>
              </select>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                End Date
              </label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="DD-MMM-YYYY"
              />
            </div>
          </div>

          {/* Radio Group: Save as Draft vs Save as Approved */}
          <div className="flex items-center space-x-6 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700 text-xs">
              <input
                type="radio"
                name="approvalMode"
                checked={approvalMode === 'Draft'}
                onChange={() => setApprovalMode('Draft')}
                className="text-[#0070ba] focus:ring-[#0070ba]"
              />
              <span>Save as Draft</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700 text-xs">
              <input
                type="radio"
                name="approvalMode"
                checked={approvalMode === 'Approved'}
                onChange={() => setApprovalMode('Approved')}
                className="text-[#0070ba] focus:ring-[#0070ba]"
              />
              <span>Save as Approved</span>
            </label>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SUPPLIER & REGION DETAILS (SCREENSHOT 2 REPLICA)      */}
        {/* ======================================================== */}
        <div className="w-full md:w-1/2 space-y-3.5 pb-4 border-b border-slate-100">
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
              className="mt-1 text-xs text-[#0070ba] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              + Add Contact
            </button>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Employee
            </label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {EMPLOYEES.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

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

        {/* ======================================================== */}
        {/* 3. BILL ITEMS TABLE (SCREENSHOT 2 REPLICA)               */}
        {/* ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Bill Items</h3>
            <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-xs text-slate-600">
              <input
                type="checkbox"
                checked={isTaxInclusive}
                onChange={(e) => setIsTaxInclusive(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
              />
              <span>Tax Inclusive</span>
            </label>
          </div>

          {/* Full 12-Column Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-bold text-[10.5px]">
                <tr>
                  <th className="px-2.5 py-2 min-w-[150px]">Item / Description</th>
                  <th className="px-2 py-2 w-24 text-center">Batch Number</th>
                  <th className="px-2 py-2 w-28 text-center">Batch Expiry Date</th>
                  <th className="px-2 py-2 w-24">UOM</th>
                  <th className="px-2 py-2 w-16 text-center">Qty</th>
                  <th className="px-2 py-2 w-20 text-right">Unit Price</th>
                  <th className="px-2 py-2 w-28 text-center">Location</th>
                  <th className="px-2.5 py-2 min-w-[140px]">Account</th>
                  <th className="px-2 py-2 w-28">TAX Rate</th>
                  <th className="px-2 py-2 w-16 text-right">TAX</th>
                  <th className="px-2.5 py-2 w-24 text-right">Net Amount</th>
                  <th className="px-2 py-2 w-16 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
                {items.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    {/* Item Description */}
                    <td className="p-1">
                      <input
                        type="text"
                        list={`rec-product-list-${idx}`}
                        placeholder="Type or select product..."
                        value={row.itemDescription}
                        onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] text-xs"
                      />
                      <datalist id={`rec-product-list-${idx}`}>
                        {products.map(p => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                    </td>

                    {/* Batch Number */}
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="N/A"
                        value={row.batchNumber}
                        onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-center text-slate-500 placeholder-slate-400 text-[10.5px]"
                      />
                    </td>

                    {/* Batch Expiry Date */}
                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="N/A"
                        value={row.batchExpiryDate}
                        onChange={(e) => handleItemChange(idx, 'batchExpiryDate', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-center text-slate-500 placeholder-slate-400 text-[10.5px]"
                      />
                    </td>

                    {/* UOM */}
                    <td className="p-1">
                      <select
                        value={row.uom}
                        onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-[11px] bg-white"
                      >
                        <option value="">Select UOM</option>
                        {uomList.map(u => (
                          <option key={u.id} value={u.symbol}>{u.symbol}</option>
                        ))}
                      </select>
                    </td>

                    {/* Qty */}
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.qty || ''}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-center font-semibold text-slate-900 text-xs"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.unitPrice || ''}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-right font-mono text-xs"
                      />
                    </td>

                    {/* Location */}
                    <td className="p-1">
                      <select
                        value={row.location}
                        onChange={(e) => handleItemChange(idx, 'location', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-[10.5px] bg-white text-slate-700"
                      >
                        <option value="">N/A</option>
                        {locations.map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Account */}
                    <td className="p-1">
                      <select
                        value={row.account}
                        onChange={(e) => handleItemChange(idx, 'account', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-[10.5px] bg-white text-slate-700"
                      >
                        {DEFAULT_ACCOUNTS.map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </td>

                    {/* Tax Rate */}
                    <td className="p-1">
                      <select
                        value={row.taxRatePercent}
                        onChange={(e) => handleItemChange(idx, 'taxRatePercent', Number(e.target.value))}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-[10.5px] bg-white"
                      >
                        {TAX_RATE_OPTIONS.map(t => (
                          <option key={t.label} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* TAX */}
                    <td className="px-2 py-1 text-right font-mono text-slate-600">
                      {row.taxAmount.toFixed(2)}
                    </td>

                    {/* Net Amount */}
                    <td className="px-2 py-1 text-right font-mono font-bold text-slate-900">
                      {row.netAmount.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="p-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="w-5 h-5 rounded-full bg-[#0070ba] text-white flex items-center justify-center hover:bg-sky-700 transition"
                          title="Add row"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={items.length <= 1}
                          className="w-5 h-5 rounded-full bg-[#001e3d] text-white flex items-center justify-center hover:bg-rose-600 disabled:opacity-30 transition"
                          title="Remove row"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. INSTRUCTIONS & TOTALS (SCREENSHOT 2 REPLICA)          */}
        {/* ======================================================== */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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

          {/* Right: Subtotal, Discount, Additional TAX, Total TAX, Gross Total */}
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-medium">Subtotal</span>
              <span className="font-mono font-bold text-slate-900">
                {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

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

            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                Total TAX <Info className="w-3 h-3 text-slate-400" />
              </span>
              <div className="w-36 flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value={totalTax.toFixed(2)}
                  className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono text-xs text-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="font-extrabold text-slate-900">Gross Total</span>
              <span className="font-extrabold font-mono text-base text-slate-900">
                {grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. BOTTOM ACTIONS (SCREENSHOT 2 REPLICA)                 */}
        {/* ======================================================== */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="submit"
            className="px-6 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded shadow-xs text-xs transition"
          >
            Cancel
          </button>
        </div>
      </form>

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
