import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, X, Info, ArrowLeft, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import type { Invoice, InvoiceItemRow, InvoiceNote } from '../../../types/sales';
import type { Quotation } from '../../../types/quotation';
import type { Contact } from '../../../types/contact';
import type { Region, Location, UnitOfMeasure, Product } from '../../../types/catalog';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_REGIONS, INITIAL_LOCATIONS, INITIAL_UOM, INITIAL_PRODUCTS } from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';
import { LocationQtySelector } from '../../common/LocationQtySelector';
import { api } from '../../../services/api';

interface NewInvoiceViewProps {
  initialQuotation?: Quotation | null;
  onSaveInvoice: (inv: Invoice) => void;
  onCancel: () => void;
  onOpenAddContact?: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const DEFAULT_SALES_ACCOUNTS = [
  'Search Account',
  'Sales Revenue (General)',
  'Wholesale Revenue',
  'Retail Sales',
  'Services Income',
  'Consulting Revenue',
  'Other Operating Revenue'
];

const TAX_RATE_OPTIONS = [
  { label: '0% (Exempt)', value: 0 },
  { label: '5% Reduced', value: 5 },
  { label: '10% Reduced', value: 10 },
  { label: '15% Services', value: 15 },
  { label: '18% Standard Sales Tax', value: 18 }
];

const SALES_PERSONS = [
  'Select Sales Person',
  'Muhammad Usman (Regional Manager)',
  'Ali Raza (Senior Sales Executive)',
  'Hamza Tariq (Account Executive)',
  'Sara Ahmed (Direct Sales)'
];

const ADDITIONAL_TAXES = [
  { label: 'Select Additional Tax', value: 0 },
  { label: 'Further Tax 3%', value: 3 },
  { label: 'Extra Tax 2%', value: 2 },
  { label: 'Federal Excise Duty 5%', value: 5 }
];

export const NewInvoiceView: React.FC<NewInvoiceViewProps> = ({
  initialQuotation,
  onSaveInvoice,
  onCancel,
  onOpenAddContact
}) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

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
      if (saved) setContacts(JSON.parse(saved));
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

  // Header State
  const [customerId, setCustomerId] = useState(initialQuotation ? initialQuotation.customerId : '');
  const [salesPerson, setSalesPerson] = useState(initialQuotation ? (initialQuotation.salesPerson || '') : '');
  const [region, setRegion] = useState(initialQuotation ? (initialQuotation.region || '') : '');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [invoiceNo, setInvoiceNo] = useState(`0${Math.floor(1040 + Math.random() * 60)}`);
  const [invoiceDate, setInvoiceDate] = useState(initialQuotation && initialQuotation.date ? initialQuotation.date : getTodayFormatted());
  const [dueDate, setDueDate] = useState(initialQuotation && initialQuotation.dueDate ? initialQuotation.dueDate : '');
  const [requiresDeliveryChallan, setRequiresDeliveryChallan] = useState(false);
  const [discountType, setDiscountType] = useState<'Discount by Amount' | 'Discount by Percentage'>(initialQuotation ? initialQuotation.discountType : 'Discount by Amount');
  const [isTaxInclusive, setIsTaxInclusive] = useState(initialQuotation ? initialQuotation.isTaxInclusive : false);
  const [specialInstructions, setSpecialInstructions] = useState(initialQuotation ? (initialQuotation.specialInstructions || '') : '');

  // Additional Tax
  const [additionalTaxPercent, setAdditionalTaxPercent] = useState(initialQuotation ? (initialQuotation.additionalTaxRate || 0) : 0);

  // Notes state
  const [notesOpen, setNotesOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [notesList, setNotesList] = useState<InvoiceNote[]>([]);

  // Line items
  const [items, setItems] = useState<InvoiceItemRow[]>(() => {
    if (initialQuotation && initialQuotation.items && initialQuotation.items.length > 0) {
      return initialQuotation.items.map((it, idx) => ({
        id: `row_${Date.now()}_${idx}`,
        itemDescription: it.item || '',
        productId: it.productId || '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: it.unit || 'Pcs',
        qty: Number(it.qtyOrdered) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        location: '',
        discount: Number(it.discount) || 0,
        account: it.account || '',
        taxRatePercent: Number(it.taxRatePercent) || 0,
        taxAmount: Number(it.taxAmount) || 0,
        netAmount: Number(it.netAmount) || 0
      }));
    }
    return [
      {
        id: 'row_1',
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
      },
      {
        id: 'row_2',
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
    ];
  });

  const handleItemChange = (index: number, field: keyof InvoiceItemRow, value: any) => {
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
  const totalItemTax = items.reduce((acc, it) => acc + (Number(it.taxAmount) || 0), 0);
  const addTaxAmt = (subtotal * additionalTaxPercent) / 100;
  const totalTax = totalItemTax + addTaxAmt;
  const grossTotal = Math.max(0, subtotal + (isTaxInclusive ? 0 : totalTax));

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    const note: InvoiceNote = {
      id: `note_${Date.now()}`,
      text: newNoteText.trim(),
      user: 'Super Admin',
      createdOn: getTodayFormatted()
    };
    setNotesList([note, ...notesList]);
    setNewNoteText('');
  };

  const handleSubmit = (status: 'Approved' | 'Draft') => {
    if (!customerId) {
      alert('Please select a Customer.');
      return;
    }
    if (!invoiceNo.trim()) {
      alert('Please enter an Invoice Number.');
      return;
    }

    const customerObj = contacts.find(c => c.id === customerId);
    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `${invoicePrefix}${invoiceNo.trim()}`,
      serialNumber: `INV-2026-${invoiceNo.slice(-3)}`,
      customerId,
      customerName: customerObj ? customerObj.name : 'Unknown Customer',
      salesPerson,
      region,
      invoiceDate,
      dueDate,
      requiresDeliveryChallan,
      discountType,
      items: items.filter(it => it.itemDescription.trim() || it.qty > 0),
      specialInstructions,
      isTaxInclusive,
      subtotal,
      discount: 0,
      additionalTaxRate: additionalTaxPercent,
      totalTax,
      grossTotal,
      balance: grossTotal,
      status: status === 'Approved' ? 'Receive Payment' : 'Unapproved',
      notes: notesList,
      createdAt: new Date().toISOString()
    };

    // If converted from quotation, mark quotation as Closed
    if (initialQuotation) {
      try {
        const updatedQuot = {
          ...initialQuotation,
          status: 'Closed' as const,
          conversionNotes: `Quotation #${initialQuotation.quotationNumber} converted to Invoice #${newInv.invoiceNumber} on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`
        };
        api.saveQuotation(updatedQuot).catch(() => {});
      } catch (e) {}
    }

    onSaveInvoice(newInv);
    alert(`Invoice ${newInv.invoiceNumber} saved as ${status}!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* 1. Header matching Screenshot */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-800">New Invoice</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Invoices
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP 2-COLUMN HEADER FORM (MATCHING SCREENSHOT)        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pb-6 border-b border-slate-100">
        {/* Left Column: Customer *, Sales Person, Region */}
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
              <option value="">{customerId ? 'Select Customer' : 'Customer is required'}</option>
              {contacts.length > 0 ? (
                contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
                ))
              ) : (
                invoiceCustomers.map(ic => (
                  <option key={ic.id} value={ic.id}>{ic.name}</option>
                ))
              )}
              {customerId && !contacts.some(c => c.id === customerId) && !invoiceCustomers.some(c => c.id === customerId) && (
                <option value={customerId}>{initialQuotation?.customerName || customerId}</option>
              )}
            </select>
            <button
              type="button"
              onClick={onOpenAddContact}
              className="mt-1 text-xs text-[#0070ba] hover:underline font-semibold flex items-center gap-1"
            >
              + Add Contact
            </button>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Sales Person
            </label>
            <select
              value={salesPerson}
              onChange={(e) => setSalesPerson(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {SALES_PERSONS.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
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

        {/* Right Column: Invoice No. *, Invoice Date *, Due Date, Delivery Challan */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Invoice No. *
            </label>
            <div className="flex items-center space-x-1.5">
              <select
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-24 px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 font-mono"
              >
                <option value="INV-">INV-</option>
                <option value="TAX-">TAX-</option>
                <option value="POS-">POS-</option>
              </select>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Invoice Date *
            </label>
            <DatePicker
              value={invoiceDate}
              onChange={setInvoiceDate}
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

          <div className="pt-1">
            <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700 text-xs">
              <input
                type="checkbox"
                checked={requiresDeliveryChallan}
                onChange={(e) => setRequiresDeliveryChallan(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
              />
              <span>Requires Delivery Challan</span>
            </label>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. INVOICE ITEMS SECTION (MATCHING SCREENSHOT)           */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Invoice Items</h3>

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

        {/* 13-Column Table matching Screenshot */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-bold text-[10.5px]">
              <tr>
                <th className="px-2 py-2 w-8 text-center">#</th>
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
                  {/* Grip drag handle */}
                  <td className="p-1 text-center text-slate-400 cursor-move">
                    <GripVertical className="w-3.5 h-3.5 mx-auto" />
                  </td>

                  {/* Item Description */}
                  <td className="p-1">
                    <input
                      type="text"
                      list={`inv-product-list-${idx}`}
                      placeholder="Type or select product..."
                      value={row.itemDescription}
                      onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded focus:border-[#0070ba] text-xs"
                    />
                    <datalist id={`inv-product-list-${idx}`}>
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
      {/* 4. INSTRUCTIONS & TOTALS (MATCHING SCREENSHOT)           */}
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

        {/* Right: Subtotal, Additional TAX, Total TAX, Gross Total */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Subtotal</span>
            <span className="font-mono font-bold text-slate-900">
              {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Additional TAX */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">Additional TAX</span>
            <div className="w-48 flex items-center space-x-1.5">
              <select
                value={additionalTaxPercent}
                onChange={(e) => setAdditionalTaxPercent(Number(e.target.value))}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800"
              >
                {ADDITIONAL_TAXES.map(t => (
                  <option key={t.label} value={t.value}>{t.label}</option>
                ))}
              </select>
              <span className="font-mono text-xs text-slate-700">
                {addTaxAmt.toFixed(2)}
              </span>
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
      {/* 5. BOTTOM ACTIONS (MATCHING SCREENSHOT)                  */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 6. COLLAPSIBLE NOTES ACCORDION (MATCHING SCREENSHOT)     */}
      {/* ======================================================== */}
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
          <div className="p-4 bg-white space-y-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                New Note
              </label>
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type internal remarks for this invoice..."
                className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveNote}
              className="px-4 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded text-xs transition"
            >
              Save
            </button>

            {/* Notes Table */}
            <div className="pt-2">
              <h4 className="font-bold text-slate-700 mb-2 text-xs">Notes</h4>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="px-4 py-2">Note</th>
                      <th className="px-4 py-2 w-40">User</th>
                      <th className="px-4 py-2 w-40">Created On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {notesList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-slate-400">
                          No notes added yet.
                        </td>
                      </tr>
                    ) : (
                      notesList.map(n => (
                        <tr key={n.id}>
                          <td className="px-4 py-2 text-slate-800">{n.text}</td>
                          <td className="px-4 py-2 text-slate-600 font-medium">{n.user}</td>
                          <td className="px-4 py-2 text-slate-500 font-mono">{n.createdOn}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
