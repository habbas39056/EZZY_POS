import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, X, Info, ArrowLeft } from 'lucide-react';
import type { CreditNote, CreditNoteItemRow } from '../../../types/creditNote';
import type { Contact } from '../../../types/contact';
import type { Region, Location, UnitOfMeasure, Product } from '../../../types/catalog';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_REGIONS, INITIAL_LOCATIONS, INITIAL_UOM, INITIAL_PRODUCTS } from '../../../types/catalog';
import { InlineAddContactModal } from '../contacts/InlineAddContactModal';
import { LocationQtySelector } from '../../common/LocationQtySelector';
import { api } from '../../../services/api';

import type { Invoice } from '../../../types/sales';

interface NewCreditNoteViewProps {
  initialInvoice?: Invoice | null;
  onSaveCreditNote: (cn: CreditNote) => void;
  onCancel: () => void;
  onOpenAddContact?: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const DEFAULT_SALES_ACCOUNTS = [
  'Search Account',
  'Sales Returns and Allowances',
  'Sales Revenue (General)',
  'Wholesale Revenue',
  'Retail Sales',
  'Services Income'
];

const TAX_RATE_OPTIONS = [
  { label: '0% (Exempt)', value: 0 },
  { label: '5% Reduced', value: 5 },
  { label: '10% Reduced', value: 10 },
  { label: '15% Services', value: 15 },
  { label: '18% Standard Sales Tax', value: 18 }
];

export const NewCreditNoteView: React.FC<NewCreditNoteViewProps> = ({
  initialInvoice,
  onSaveCreditNote,
  onCancel,
  onOpenAddContact
}) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const remote = await api.getContacts();
        if (remote && Array.isArray(remote) && remote.length > 0) {
          setContacts(remote);
          localStorage.setItem('adwiselabs_contacts', JSON.stringify(remote));
          return;
        }
      } catch (e) {}

      const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
      if (saved) {
        setContacts(JSON.parse(saved));
      }
    };
    loadContacts();
  }, []);

  // Extra customers extracted from existing invoices if contacts is empty
  const invoiceCustomers = useMemo(() => {
    try {
      const saved = localStorage.getItem('adwiselabs_invoices');
      if (saved) {
        const invs: Invoice[] = JSON.parse(saved);
        const unique = new Map<string, string>();
        invs.forEach(i => {
          if (i.customerId && i.customerName) {
            unique.set(i.customerId, i.customerName);
          } else if (i.customerName) {
            unique.set(i.customerName, i.customerName);
          }
        });
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
      }
    } catch (e) {}
    return [];
  }, []);

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

  const [customerId, setCustomerId] = useState(initialInvoice ? initialInvoice.customerId : '');
  const [referenceNo, setReferenceNo] = useState(initialInvoice ? (initialInvoice.serialNumber || initialInvoice.invoiceNumber) : '');
  const [region, setRegion] = useState(initialInvoice ? (initialInvoice.region || '') : '');
  const [date, setDate] = useState(getTodayFormatted());
  const [discountType, setDiscountType] = useState<'Discount by Amount' | 'Discount by Percentage'>(initialInvoice ? initialInvoice.discountType : 'Discount by Amount');
  const [isTaxInclusive, setIsTaxInclusive] = useState(initialInvoice ? initialInvoice.isTaxInclusive : false);
  const [specialInstructions, setSpecialInstructions] = useState(initialInvoice ? (initialInvoice.specialInstructions || '') : '');

  // Line items matching Screenshot 2
  const [items, setItems] = useState<CreditNoteItemRow[]>(() => {
    if (initialInvoice && initialInvoice.items && initialInvoice.items.length > 0) {
      return initialInvoice.items.map(it => ({
        id: `cn_item_${Date.now()}_${it.id}`,
        itemDescription: it.itemDescription,
        productId: it.productId,
        batchNumber: it.batchNumber || '',
        batchExpiryDate: it.batchExpiryDate || '',
        uom: it.uom || 'Pcs',
        qty: it.qty || 1,
        unitPrice: it.unitPrice || 0,
        location: it.location || '',
        discount: it.discount || 0,
        account: it.account || 'Sales Returns and Allowances',
        taxRatePercent: it.taxRatePercent || 0,
        taxAmount: it.taxAmount || 0,
        netAmount: it.netAmount || 0
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
        discount: 0,
        account: 'Sales Returns and Allowances',
        taxRatePercent: 0,
        taxAmount: 0,
        netAmount: 0
      }
    ];
  });

  const handleItemChange = (index: number, field: keyof CreditNoteItemRow, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-fill from Product selection
    if (field === 'itemDescription') {
      const matched = products.find(p => p.name === value || p.code === value);
      if (matched) {
        item.productId = matched.id;
        item.unitPrice = matched.salePrice || matched.purchasePrice || 0;
        item.location = matched.location || '';
        item.uom = matched.unitOfMeasure || 'Pcs';
      }
    }

    const qty = Number(item.qty) || 0;
    const price = Number(item.unitPrice) || 0;
    const itemDisc = Number(item.discount) || 0;
    const taxRate = Number(item.taxRatePercent) || 0;

    let sub = Math.max(0, (qty * price) - itemDisc);
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
        batchNumber: '',
        batchExpiryDate: '',
        uom: '',
        qty: 0,
        unitPrice: 0,
        location: '',
        discount: 0,
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

  const subtotal = items.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.unitPrice) || 0) - (Number(it.discount) || 0)), 0);
  const totalTax = items.reduce((acc, it) => acc + (Number(it.taxAmount) || 0), 0);
  const grossTotal = Math.max(0, subtotal + (isTaxInclusive ? 0 : totalTax));

  const handleSubmit = (status: 'Approved' | 'Draft') => {
    if (!customerId) {
      alert('Please select a Customer.');
      return;
    }

    const customerObj = contacts.find(c => c.id === customerId);
    const newCN: CreditNote = {
      id: `cn_${Date.now()}`,
      creditNoteNumber: `0000${Math.floor(3 + Math.random() * 97)}`,
      customerId,
      customerName: customerObj ? customerObj.name : 'Unknown Customer',
      region,
      date,
      discountType,
      items: items.filter(it => it.itemDescription.trim() || it.qty > 0),
      specialInstructions,
      isTaxInclusive,
      subtotal,
      totalTax,
      grossTotal,
      balance: status === 'Approved' ? grossTotal : 0,
      status: status === 'Approved' ? 'Refund' : 'Draft',
      createdAt: new Date().toISOString()
    };

    onSaveCreditNote(newCN);
    api.saveCreditNote(newCN).catch(() => {});
    alert(`Credit Note ${newCN.creditNoteNumber} saved!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-800">New Credit Note</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Credit Notes
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. TOP 2-COLUMN FORM (MATCHING SCREENSHOT 2)             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pb-6 border-b border-slate-100 items-start">
        {/* Left: Customer *, Reference No., Region */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={`w-full px-3 py-1.5 border rounded focus:outline-none text-xs bg-white text-slate-800 ${
                !customerId ? 'border-rose-400' : 'border-slate-300 focus:border-[#0070ba]'
              }`}
            >
              <option value="">Select Customer</option>
              {contacts.length > 0 ? (
                contacts
                  .filter(c => c.type === 'customer' || c.type === 'both' || !c.type || c.id === customerId)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.businessName ? `(${c.businessName})` : ''}
                    </option>
                  ))
              ) : (
                invoiceCustomers.map(ic => (
                  <option key={ic.id} value={ic.id}>
                    {ic.name}
                  </option>
                ))
              )}
              {customerId && !contacts.some(c => c.id === customerId) && !invoiceCustomers.some(c => c.id === customerId) && (
                <option value={customerId}>
                  {initialInvoice?.customerName || customerId}
                </option>
              )}
            </select>
            <button
              type="button"
              onClick={() => {
                if (onOpenAddContact) onOpenAddContact();
                else setIsAddContactModalOpen(true);
              }}
              className="mt-1 text-xs text-[#0070ba] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
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
              placeholder="Reference Number"
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

        {/* Right: Invoice No / Balance (if from invoice) & Date * */}
        <div className="space-y-4">
          {initialInvoice && (
            <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Invoice No.</span>
                <span className="font-mono font-bold text-slate-900">{initialInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                <span className="text-slate-500 font-medium">Invoice Balance</span>
                <span className="font-mono font-bold text-[#0070ba]">
                  {(initialInvoice.balance ?? initialInvoice.grossTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Date *
            </label>
            <div className="relative">
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CREDIT NOTE ITEMS TABLE (MATCHING SCREENSHOT 2)       */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Credit Note Items</h3>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700"
            >
              <option value="Discount by Amount">Discount by Amount</option>
              <option value="Discount by Percentage">Discount by Percentage</option>
            </select>

            <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-600">
              <input
                type="checkbox"
                checked={isTaxInclusive}
                onChange={(e) => setIsTaxInclusive(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
              />
              <span>Tax Inclusive</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </label>
          </div>
        </div>

        {/* 12-Column Table matching Screenshot 2 */}
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
                <th className="px-2 py-2 min-w-[150px] text-center">Location</th>
                <th className="px-2 py-2 w-20 text-right">Discount</th>
                <th className="px-2.5 py-2 min-w-[140px]">Account</th>
                <th className="px-2 py-2 w-28">TAX Rate</th>
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
                      list={`cn-product-list-${idx}`}
                      placeholder="Type or select item..."
                      value={row.itemDescription}
                      onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] text-xs"
                    />
                    <datalist id={`cn-product-list-${idx}`}>
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
                    <LocationQtySelector
                      locations={locations}
                      value={row.location}
                      rowQty={Number(row.qty) || 0}
                      onChange={(val) => handleItemChange(idx, 'location', val)}
                    />
                  </td>

                  {/* Discount */}
                  <td className="p-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.discount || ''}
                      onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                      className="w-full px-1.5 py-1 border border-slate-200 rounded text-right font-mono text-xs"
                    />
                  </td>

                  {/* Account */}
                  <td className="p-1">
                    <select
                      value={row.account}
                      onChange={(e) => handleItemChange(idx, 'account', e.target.value)}
                      className="w-full px-1.5 py-1 border border-slate-200 rounded text-[10.5px] bg-white text-slate-700"
                    >
                      {DEFAULT_SALES_ACCOUNTS.map(acc => (
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

                  {/* Net Amount */}
                  <td className="px-2.5 py-1 text-right font-mono font-bold text-slate-900">
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
      {/* 3. INSTRUCTIONS & TOTALS (MATCHING SCREENSHOT 2)         */}
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

        {/* Right: Subtotal, Total TAX, Gross Total */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Subtotal</span>
            <span className="font-mono font-bold text-slate-900">
              {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
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

      {/* 4. Bottom Action Buttons matching Screenshot 2 */}
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
          className="px-5 py-2 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded shadow-xs text-xs transition cursor-pointer"
        >
          Save & Approve
        </button>
      </div>

      {/* Inline Add Contact Modal */}
      <InlineAddContactModal
        isOpen={isAddContactModalOpen}
        defaultType="customer"
        onClose={() => setIsAddContactModalOpen(false)}
        onContactCreated={(newContact) => {
          setContacts(prev => [newContact, ...prev.filter(c => c.id !== newContact.id)]);
          setCustomerId(newContact.id);
          setIsAddContactModalOpen(false);
        }}
      />
    </div>
  );
};
