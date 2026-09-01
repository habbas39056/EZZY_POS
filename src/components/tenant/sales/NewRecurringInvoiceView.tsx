import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, X, Info, ArrowLeft, GripVertical } from 'lucide-react';
import type { RecurringInvoice, RecurringInvoiceItemRow } from '../../../types/recurringInvoice';
import type { Contact } from '../../../types/contact';
import type { Region, Location, UnitOfMeasure, Product } from '../../../types/catalog';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_REGIONS, INITIAL_LOCATIONS, INITIAL_UOM, INITIAL_PRODUCTS } from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';
import { LocationQtySelector } from '../../common/LocationQtySelector';
import { api } from '../../../services/api';
import type { Invoice } from '../../../types/sales';

interface NewRecurringInvoiceViewProps {
  initialInvoice?: Invoice | null;
  onSaveRecurring: (rec: RecurringInvoice) => void;
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
  'Subscription Revenue'
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
  'Muhammad Usman',
  'Ali Raza',
  'Hamza Tariq',
  'Sara Ahmed'
];

const ADDITIONAL_TAXES = [
  { label: 'Select Additional Tax', value: 0 },
  { label: 'Further Tax 3%', value: 3 },
  { label: 'Extra Tax 2%', value: 2 }
];

const DUE_DATE_RULES = [
  'Select Due Date Rule',
  'Due in 7 days',
  'Due in 15 days',
  'Due in 30 days',
  'End of current month',
  'End of next month'
];

export const NewRecurringInvoiceView: React.FC<NewRecurringInvoiceViewProps> = ({
  initialInvoice,
  onSaveRecurring,
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

  // Fallback customer list extracted from existing invoices/credit notes if contacts is empty
  const invoiceCustomers = useMemo(() => {
    try {
      const unique = new Map<string, string>();
      const savedInvs = localStorage.getItem('adwiselabs_invoices');
      if (savedInvs) {
        const invs: any[] = JSON.parse(savedInvs);
        invs.forEach(i => {
          if (i.customerId && i.customerName) {
            unique.set(i.customerId, i.customerName);
          }
        });
      }
      const savedCNs = localStorage.getItem('adwiselabs_credit_notes');
      if (savedCNs) {
        const cns: any[] = JSON.parse(savedCNs);
        cns.forEach(c => {
          if (c.customerId && c.customerName) {
            unique.set(c.customerId, c.customerName);
          }
        });
      }
      return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
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

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const remote = await api.getProducts();
        if (remote && Array.isArray(remote) && remote.length > 0) {
          setProducts(remote);
          localStorage.setItem('adwiselabs_catalog_products', JSON.stringify(remote));
        }
      } catch (e) {}
    };
    loadProducts();
  }, []);

  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Schedule Configuration State (Screenshot 2 Top Box)
  const [repeatFrequency, setRepeatFrequency] = useState<number>(1);
  const [repeatUnit, setRepeatUnit] = useState<'Week(s)' | 'Month(s)' | 'Year(s)'>('Month(s)');
  const [startDate, setStartDate] = useState(getTodayFormatted());
  const [dueDateRule, setDueDateRule] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creationType, setCreationType] = useState<'Save as Draft' | 'Save as Approved' | 'Approved For Sending'>('Save as Draft');

  // Customer State
  const [customerId, setCustomerId] = useState(initialInvoice ? initialInvoice.customerId : '');
  const [salesPerson, setSalesPerson] = useState(initialInvoice ? (initialInvoice.salesPerson || '') : '');
  const [region, setRegion] = useState(initialInvoice ? (initialInvoice.region || '') : '');
  const [discountType, setDiscountType] = useState<'Discount by Amount' | 'Discount by Percentage'>(initialInvoice ? initialInvoice.discountType : 'Discount by Amount');
  const [isTaxInclusive, setIsTaxInclusive] = useState(initialInvoice ? initialInvoice.isTaxInclusive : false);
  const [specialInstructions, setSpecialInstructions] = useState(initialInvoice ? (initialInvoice.specialInstructions || '') : '');
  const [additionalTaxPercent, setAdditionalTaxPercent] = useState(initialInvoice ? (initialInvoice.additionalTaxRate || 0) : 0);

  // Line items matching Screenshot 2
  const [items, setItems] = useState<RecurringInvoiceItemRow[]>(() => {
    if (initialInvoice && initialInvoice.items && initialInvoice.items.length > 0) {
      return initialInvoice.items.map(it => ({
        id: `rec_item_${Date.now()}_${it.id}`,
        itemDescription: it.itemDescription,
        productId: it.productId,
        variantId: it.variantId || '',
        variantName: it.variantName || '',
        batchNumber: it.batchNumber || '',
        batchExpiryDate: it.batchExpiryDate || '',
        uom: it.uom || 'Pcs',
        qty: Number(it.qty) > 0 ? Number(it.qty) : 1,
        unitPrice: Number(it.unitPrice) || 0,
        location: it.location || '',
        discount: Number(it.discount) || 0,
        account: it.account || 'Sales Revenue (General)',
        taxRatePercent: Number(it.taxRatePercent) || 0,
        taxAmount: Number(it.taxAmount) || 0,
        netAmount: Number(it.netAmount) || 0
      }));
    }
    return [
      {
        id: 'row_1',
        itemDescription: '',
        variantId: '',
        variantName: '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: 'Pcs',
        qty: 1,
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
        variantId: '',
        variantName: '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: '',
        qty: 1,
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

  const handleItemChange = (index: number, field: keyof RecurringInvoiceItemRow, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-fill from Product or Variant selection
    if (field === 'itemDescription') {
      const cleanVal = String(value).trim().toLowerCase();
      let matchedProd = products.find(p => p.name.toLowerCase().trim() === cleanVal || p.code.toLowerCase().trim() === cleanVal || p.id === String(value));
      let matchedVariant = null;

      if (!matchedProd) {
        for (const p of products) {
          if (p.variants && p.variants.length > 0) {
            const v = p.variants.find(v => 
              `${p.name} (${v.name})`.toLowerCase().trim() === cleanVal || 
              (v.sku && v.sku.toLowerCase().trim() === cleanVal) || 
              v.name.toLowerCase().trim() === cleanVal
            );
            if (v) {
              matchedProd = p;
              matchedVariant = v;
              break;
            }
          }
        }
      }

      if (matchedProd) {
        item.productId = matchedProd.id;
        item.location = matchedProd.location || '';
        item.uom = matchedProd.unitOfMeasure || 'Pcs';
        if (!item.qty || Number(item.qty) <= 0) {
          item.qty = 1;
        }

        if (matchedVariant) {
          item.variantId = matchedVariant.id;
          item.variantName = matchedVariant.name;
          item.unitPrice = Number(matchedVariant.salePrice) || 0;
        } else if (matchedProd.variants && matchedProd.variants.length > 0) {
          const firstVar = matchedProd.variants[0];
          item.variantId = firstVar.id;
          item.variantName = firstVar.name;
          item.unitPrice = Number(firstVar.salePrice) || 0;
        } else {
          item.variantId = '';
          item.variantName = '';
          item.unitPrice = Number(matchedProd.salePrice || matchedProd.purchasePrice) || 0;
        }
      } else {
        item.productId = '';
        item.variantId = '';
        item.variantName = '';
      }
    }

    if (field === 'variantId') {
      const cleanDesc = (item.itemDescription || '').trim().toLowerCase();
      const parentProd = products.find(p => p.id === item.productId || p.name.toLowerCase().trim() === cleanDesc || p.code.toLowerCase().trim() === cleanDesc);
      if (parentProd && parentProd.variants) {
        const v = parentProd.variants.find(varItem => varItem.id === value || varItem.name.toLowerCase().trim() === String(value).toLowerCase().trim());
        if (v) {
          if (!item.qty || Number(item.qty) <= 0) {
            item.qty = 1;
          }
          item.variantId = v.id;
          item.variantName = v.name;
          item.unitPrice = Number(v.salePrice) || 0;
        } else {
          item.variantId = '';
          item.variantName = '';
          item.unitPrice = Number(parentProd.salePrice) || 0;
        }
      }
    }

    if (field === 'variantName') {
      item.variantName = String(value);
      if (!item.variantId) {
        item.variantId = `var_custom_${Date.now()}`;
      }
    }


    const qty = Number(item.qty) > 0 ? Number(item.qty) : (item.itemDescription || Number(item.unitPrice) > 0 ? 1 : 0);
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
        variantId: '',
        variantName: '',
        batchNumber: '',
        batchExpiryDate: '',
        uom: 'Pcs',
        qty: 1,
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

  const subtotal = items.reduce((acc, it) => {
    const q = Number(it.qty) > 0 ? Number(it.qty) : ((it.itemDescription || Number(it.unitPrice) > 0) ? 1 : 0);
    const p = Number(it.unitPrice) || 0;
    const d = Number(it.discount) || 0;
    return acc + Math.max(0, (q * p) - d);
  }, 0);
  const totalItemTax = items.reduce((acc, it) => acc + (Number(it.taxAmount) || 0), 0);
  const addTaxAmt = (subtotal * additionalTaxPercent) / 100;
  const totalTax = totalItemTax + addTaxAmt;
  const grossTotal = Math.max(0, subtotal + (isTaxInclusive ? 0 : totalTax));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCustId = customerId;
    let finalCustName = 'Walk-in Customer';

    const customerObj = contacts.find(c => c.id === customerId);
    if (customerObj) {
      finalCustName = customerObj.name;
    } else if (customerId && customerId.trim()) {
      finalCustName = customerId.trim();
    } else if (contacts.length > 0) {
      finalCustId = contacts[0].id;
      finalCustName = contacts[0].name;
    }

    if (!finalCustId) {
      finalCustId = `cnt_${Date.now()}`;
    }

    const validItems = items.filter(it => (it.itemDescription && it.itemDescription.trim()) || Number(it.unitPrice) > 0);
    const normalizedItems = validItems.map(it => {
      const q = Number(it.qty) > 0 ? Number(it.qty) : 1;
      const p = Number(it.unitPrice) || 0;
      const d = Number(it.discount) || 0;
      const sub = Math.max(0, (q * p) - d);
      return {
        ...it,
        qty: q,
        unitPrice: p,
        netAmount: Number(it.netAmount) > 0 ? Number(it.netAmount) : sub
      };
    });

    const computedSubtotal = normalizedItems.reduce((acc, it) => acc + (it.qty * it.unitPrice - (Number(it.discount) || 0)), 0);
    const computedItemTax = normalizedItems.reduce((acc, it) => acc + (Number(it.taxAmount) || 0), 0);
    const computedAddTax = (computedSubtotal * additionalTaxPercent) / 100;
    const computedTotalTax = computedItemTax + computedAddTax;
    const computedGrossTotal = Math.max(0, computedSubtotal + (isTaxInclusive ? 0 : computedTotalTax));

    const newRec: RecurringInvoice = {
      id: `rec_inv_${Date.now()}`,
      customerId: finalCustId,
      customerName: finalCustName,
      salesPerson: salesPerson || 'Muhammad Tariq Khan',
      region: region || 'Karachi (HQ)',
      repeatFrequency,
      repeatUnit,
      startDate: startDate || getTodayFormatted(),
      dueDateRule,
      endDate,
      creationType,
      discountType,
      items: normalizedItems.length > 0 ? normalizedItems : items,
      specialInstructions,
      isTaxInclusive,
      subtotal: computedGrossTotal > 0 ? computedSubtotal : subtotal,
      additionalTaxRate: additionalTaxPercent,
      totalTax: computedGrossTotal > 0 ? computedTotalTax : totalTax,
      grossTotal: computedGrossTotal > 0 ? computedGrossTotal : grossTotal,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    onSaveRecurring(newRec);
    alert(`Recurring Invoice schedule for ${newRec.customerName} saved successfully!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-800">Set Recurring</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Recurring Invoices
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ======================================================== */}
        {/* 1. TOP SCHEDULE CONFIGURATION CARD (SCREENSHOT 2 REPLICA) */}
        {/* ======================================================== */}
        <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {/* Repeat this Invoice In every * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Repeat this Invoice In every *
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="1"
                  value={repeatFrequency}
                  onChange={(e) => setRepeatFrequency(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 font-bold"
                />
                <select
                  value={repeatUnit}
                  onChange={(e) => setRepeatUnit(e.target.value as any)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 font-medium"
                >
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

            {/* Due Date */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Due Date
              </label>
              <select
                value={dueDateRule}
                onChange={(e) => setDueDateRule(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              >
                {DUE_DATE_RULES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
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

          {/* Creation Type Radio Group */}
          <div className="pt-2 flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="radio"
                name="creationType"
                checked={creationType === 'Save as Draft'}
                onChange={() => setCreationType('Save as Draft')}
                className="w-3.5 h-3.5 text-[#0070ba]"
              />
              <span>Save as Draft</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="radio"
                name="creationType"
                checked={creationType === 'Save as Approved'}
                onChange={() => setCreationType('Save as Approved')}
                className="w-3.5 h-3.5 text-[#0070ba]"
              />
              <span>Save as Approved</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="radio"
                name="creationType"
                checked={creationType === 'Approved For Sending'}
                onChange={() => setCreationType('Approved For Sending')}
                className="w-3.5 h-3.5 text-[#0070ba]"
              />
              <span>Approved For Sending</span>
            </label>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. CUSTOMER DETAILS CARD (SCREENSHOT 2 REPLICA)          */}
        {/* ======================================================== */}
        <div className="space-y-3.5 pb-4 border-b border-slate-100">
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
                contacts.filter(c => !c.type || c.type === 'customer' || c.type === 'both').map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
                ))
              ) : (
                invoiceCustomers.map(ic => (
                  <option key={ic.id} value={ic.id}>{ic.name}</option>
                ))
              )}
              {customerId && !contacts.some(c => c.id === customerId) && !invoiceCustomers.some(c => c.id === customerId) && (
                <option value={customerId}>{initialInvoice?.customerName || customerId}</option>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* ======================================================== */}
        {/* 3. INVOICE ITEMS SECTION (SCREENSHOT 2 REPLICA)          */}
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

          {/* 14-Column Items Table with Variation Support */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-bold text-[10.5px]">
                <tr>
                  <th className="px-2 py-2 w-8 text-center">#</th>
                  <th className="px-2.5 py-2 min-w-[150px]">Item / Description</th>
                  <th className="px-2 py-2 min-w-[140px]">Variation</th>
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
                    <td className="p-1 text-center text-slate-400">
                      <GripVertical className="w-3.5 h-3.5 mx-auto" />
                    </td>

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

                    {/* Dedicated Product Variation Dropdown / Input */}
                    <td className="p-1">
                      {(() => {
                        const cleanDesc = (row.itemDescription || '').trim().toLowerCase();
                        const selectedProd = products.find(p => 
                          (row.productId && p.id === row.productId) || 
                          (cleanDesc && p.name.toLowerCase().trim() === cleanDesc) ||
                          (cleanDesc && p.code.toLowerCase().trim() === cleanDesc)
                        );
                        const hasVars = selectedProd && selectedProd.variants && selectedProd.variants.length > 0;

                        if (hasVars && selectedProd?.variants) {
                          return (
                            <select
                              value={row.variantId || ''}
                              onChange={(e) => handleItemChange(idx, 'variantId', e.target.value)}
                              className="w-full px-2 py-1 border border-sky-400 bg-sky-50 text-[#0070ba] font-bold rounded text-xs focus:border-[#0070ba] focus:bg-white transition cursor-pointer"
                            >
                              <option value="">Select Variation ({selectedProd.variants.length})</option>
                              {selectedProd.variants.map(v => (
                                <option key={v.id} value={v.id}>
                                  {v.name} — Rs {Number(v.salePrice || 0).toLocaleString()}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (row.variantName) {
                          return (
                            <input
                              type="text"
                              placeholder="Variant Name"
                              value={row.variantName}
                              onChange={(e) => handleItemChange(idx, 'variantName', e.target.value)}
                              className="w-full px-2 py-1 border border-sky-300 bg-white rounded text-xs font-medium text-slate-800 focus:border-[#0070ba]"
                            />
                          );
                        }

                        return (
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleItemChange(idx, 'variantName', 'Standard')}
                              className="text-[11px] text-slate-400 hover:text-[#0070ba] hover:underline font-mono cursor-pointer"
                              title="Click to specify variation"
                            >
                              — (+ Var)
                            </button>
                          </div>
                        );
                      })()}
                    </td>



                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="N/A"
                        value={row.batchNumber}
                        onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-center text-slate-500 placeholder-slate-400 text-[10.5px]"
                      />
                    </td>

                    <td className="p-1">
                      <input
                        type="text"
                        placeholder="N/A"
                        value={row.batchExpiryDate}
                        onChange={(e) => handleItemChange(idx, 'batchExpiryDate', e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-center text-slate-500 placeholder-slate-400 text-[10.5px]"
                      />
                    </td>

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

                    <td className="p-1">
                      <LocationQtySelector
                        locations={locations}
                        value={row.location}
                        rowQty={Number(row.qty) || 0}
                        onChange={(val) => handleItemChange(idx, 'location', val)}
                      />
                    </td>

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

                    <td className="px-2.5 py-1 text-right font-mono font-bold text-slate-900">
                      {row.netAmount.toFixed(2)}
                    </td>

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

        {/* 5. Bottom Action Buttons matching Screenshot 2 */}
        <div className="pt-4 flex justify-end space-x-2">
          <button
            type="submit"
            className="px-5 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

