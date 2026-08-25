import React, { useState } from 'react';
import { Calendar, Plus, X, Info, ArrowLeft } from 'lucide-react';
import type { DebitNote, DebitNoteItemRow } from '../../../types/debitNote';
import type { Contact } from '../../../types/contact';
import type { Region, Location, UnitOfMeasure, Product } from '../../../types/catalog';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_REGIONS, INITIAL_LOCATIONS, INITIAL_UOM, INITIAL_PRODUCTS } from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';

import { InlineAddContactModal } from '../contacts/InlineAddContactModal';
import type { Bill } from '../../../types/billing';

interface NewDebitNoteViewProps {
  initialBill?: Bill | null;
  onSaveDN: (dn: DebitNote) => void;
  onCancel: () => void;
  onOpenAddContact?: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const DEFAULT_ACCOUNTS = [
  'Search Account',
  'Cost of Goods Sold (COGS)',
  'Purchase Returns & Allowances',
  '09001 - Inventory',
  'Inventory Asset',
  'Operating Expenses',
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

export const NewDebitNoteView: React.FC<NewDebitNoteViewProps> = ({
  initialBill,
  onSaveDN,
  onCancel,
  onOpenAddContact
}) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
    return saved ? JSON.parse(saved) : [];
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

  const [projects] = useState<any[]>(() => {
    const saved = localStorage.getItem('adwiselabs_projects');
    return saved ? JSON.parse(saved) : [
      { id: 'proj_1', name: 'Al-Madina Commercial Tower' },
      { id: 'proj_2', name: 'Software Development 2026' },
      { id: 'proj_3', name: 'Retail Outlet Expansion' }
    ];
  });

  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [supplierId, setSupplierId] = useState(initialBill ? initialBill.supplierId : '');
  const [referenceNo, setReferenceNo] = useState('');
  const [region, setRegion] = useState(initialBill ? (initialBill.region || '') : '');
  const [debitNoteNo, setDebitNoteNo] = useState(`DN-${Math.floor(100 + Math.random() * 900)}`);
  const [date, setDate] = useState(getTodayFormatted());
  const [dueDate, setDueDate] = useState('');
  const [isTaxInclusive, setIsTaxInclusive] = useState(initialBill ? initialBill.isTaxInclusive : false);
  const [specialInstructions, setSpecialInstructions] = useState(initialBill ? (initialBill.specialInstructions || '') : '');
  const [discount, setDiscount] = useState<number | ''>(initialBill ? (initialBill.discount || 0) : 0);

  // Line items
  const [items, setItems] = useState<DebitNoteItemRow[]>(() => {
    if (initialBill && initialBill.items && initialBill.items.length > 0) {
      return initialBill.items.map(it => ({
        id: `dn_item_${Date.now()}_${it.id}`,
        itemDescription: it.itemDescription,
        productId: it.productId,
        batchNumber: it.batchNumber || '',
        batchExpiryDate: it.batchExpiryDate || '',
        uom: it.uom || 'Pcs',
        qty: it.qty || 1,
        unitPrice: it.unitPrice || 0,
        location: it.location || '',
        account: it.account || 'Purchase Returns & Allowances',
        taxRatePercent: it.taxRatePercent || 0,
        taxAmount: it.taxAmount || 0,
        netAmount: it.netAmount || 0,
        projectId: '',
        projectName: ''
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
        account: 'Purchase Returns & Allowances',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: 0,
        projectId: '',
        projectName: ''
      }
    ];
  });

  const handleItemChange = (index: number, field: keyof DebitNoteItemRow, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-fill from Product selection
    if (field === 'itemDescription') {
      const matched = products.find(p => p.name === value || p.code === value);
      if (matched) {
        item.productId = matched.id;
        item.unitPrice = matched.purchasePrice || 0;
        item.location = matched.location || '';
        item.uom = matched.unitOfMeasure || 'Pcs';
      }
    }

    const qty = Number(item.qty) || 0;
    const price = Number(item.unitPrice) || 0;
    const rate = Number(item.taxRatePercent) || 0;

    let baseAmount = qty * price;
    let computedTax = 0;
    let net = 0;

    if (isTaxInclusive) {
      const taxComponent = baseAmount - (baseAmount / (1 + rate / 100));
      computedTax = taxComponent;
      net = baseAmount;
    } else {
      computedTax = (baseAmount * rate) / 100;
      net = baseAmount + computedTax;
    }

    item.taxAmount = Number(computedTax.toFixed(2));
    item.netAmount = Number(net.toFixed(2));

    updated[index] = item;
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
        account: 'Purchase Returns & Allowances',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: 0,
        projectId: '',
        projectName: ''
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

  const handleSubmit = (status: 'Approved' | 'Draft') => {
    if (!supplierId) {
      alert('Please select a Supplier.');
      return;
    }
    if (!debitNoteNo.trim()) {
      alert('Please enter a Debit Note Number.');
      return;
    }

    const supplierObj = contacts.find(c => c.id === supplierId);
    const newDN: DebitNote = {
      id: `dn_${Date.now()}`,
      debitNoteNumber: debitNoteNo.trim(),
      serialNumber: `0000${Math.floor(3 + Math.random() * 90)}`,
      referenceNo: referenceNo.trim(),
      supplierId,
      supplierName: supplierObj ? supplierObj.name : 'Unknown Supplier',
      region,
      date,
      dueDate,
      specialInstructions,
      items: items.filter(it => it.itemDescription.trim() || it.qty > 0),
      isTaxInclusive,
      subtotal,
      discount: discountVal,
      totalTax,
      grossTotal,
      balance: grossTotal,
      status: status === 'Approved' ? 'Refund' : 'Draft',
      createdAt: new Date().toISOString()
    };

    onSaveDN(newDN);
    alert(`Debit Note ${newDN.debitNoteNumber} saved as ${status}!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 w-full my-3 text-xs text-slate-700 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
        <h2 className="text-base font-bold text-slate-800">New Debit Note</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Debit Notes
        </button>
      </div>

      {/* Top 2-Column Form (Screenshot Replica) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pb-6 border-b border-slate-100">
        {/* Left Column: Supplier * + Reference No. + Region */}
        <div className="space-y-3.5">
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
            {!supplierId && (
              <p className="text-[10.5px] text-rose-500 mt-1">
                Supplier not selected. Select or add Supplier
              </p>
            )}
            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              className="mt-1.5 text-xs text-[#0070ba] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              + Add Contact
            </button>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Reference No.
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. REF-001"
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            />
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

        {/* Right Column: Debit Note No. *, Date *, Due Date */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Debit Note No. *
            </label>
            <input
              type="text"
              required
              value={debitNoteNo}
              onChange={(e) => setDebitNoteNo(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Date *
            </label>
            <DatePicker
              value={date}
              onChange={setDate}
            />
          </div>

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

      {/* Debit Note Items Table Header & Checkbox */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Debit Note Items</h3>
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={isTaxInclusive}
                onChange={(e) => setIsTaxInclusive(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
              />
              <span>Tax Inclusive</span>
            </label>
          </div>
        </div>

        {/* Full 12-Column Debit Note Items Table (Including Project) */}
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
                <th className="px-2.5 py-2 min-w-[120px]">Project</th>
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
                      list={`dn-product-list-${idx}`}
                      placeholder="Type or select product..."
                      value={row.itemDescription}
                      onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] text-xs"
                    />
                    <datalist id={`dn-product-list-${idx}`}>
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

                  {/* Project */}
                  <td className="p-1">
                    <select
                      value={row.projectId || ''}
                      onChange={(e) => {
                        const proj = projects.find(p => p.id === e.target.value);
                        handleItemChange(idx, 'projectId', e.target.value);
                        if (proj) handleItemChange(idx, 'projectName', proj.name || proj.projectName);
                      }}
                      className="w-full px-1.5 py-1 border border-slate-200 rounded text-[10.5px] bg-white text-slate-700"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name || p.projectName || p.id}</option>
                      ))}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="p-1 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="w-5 h-5 rounded-full bg-[#0070ba] text-white flex items-center justify-center hover:bg-sky-700 transition cursor-pointer"
                        title="Add row"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition cursor-pointer"
                          title="Remove row"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions & Financial Calculations */}
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

        {/* Right: Subtotal, Discount, Total TAX, Gross Total */}
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

      {/* Action Buttons */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => handleSubmit('Draft')}
          className="px-5 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs transition"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('Approved')}
          className="px-5 py-2 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded shadow-xs text-xs transition"
        >
          Save & Approve
        </button>
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
