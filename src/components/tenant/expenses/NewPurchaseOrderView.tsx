import React, { useState } from 'react';
import { Calendar, Plus, X, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import type { PurchaseOrder, POItemRow } from '../../../types/purchaseOrder';
import type { Contact } from '../../../types/contact';
import type { UnitOfMeasure, Product } from '../../../types/catalog';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_UOM, INITIAL_PRODUCTS } from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';
import { InlineAddContactModal } from '../contacts/InlineAddContactModal';

interface NewPurchaseOrderViewProps {
  onSavePO: (po: PurchaseOrder) => void;
  onCancel: () => void;
  onOpenAddContact?: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const DEFAULT_ACCOUNTS = [
  'Search Account',
  'Cost of Goods Sold (COGS)',
  'Inventory Asset',
  'Operating Expenses',
  'Office Supplies',
  'Freight & Shipping',
  'Finished Goods'
];

export const NewPurchaseOrderView: React.FC<NewPurchaseOrderViewProps> = ({
  onSavePO,
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

  const [supplierId, setSupplierId] = useState('');
  const [poNo, setPoNo] = useState(`0000${Math.floor(5 + Math.random() * 95)}`);
  const [poDate, setPoDate] = useState(getTodayFormatted());
  const [dueDate, setDueDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Line items
  const [items, setItems] = useState<POItemRow[]>([
    {
      id: 'row_1',
      item: '',
      batchNumber: '',
      uom: '',
      qtyOrdered: 0,
      purchasePrice: 0,
      account: '',
      netAmount: 0
    },
    {
      id: 'row_2',
      item: '',
      batchNumber: '',
      uom: '',
      qtyOrdered: 0,
      purchasePrice: 0,
      account: '',
      netAmount: 0
    }
  ]);

  const handleItemChange = (index: number, field: keyof POItemRow, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-fill from Product selection
    if (field === 'item') {
      const matched = products.find(p => p.name === value || p.code === value);
      if (matched) {
        item.productId = matched.id;
        item.purchasePrice = matched.purchasePrice || 0;
        item.uom = matched.unitOfMeasure || 'Pcs';
      }
    }

    const qty = Number(item.qtyOrdered) || 0;
    const price = Number(item.purchasePrice) || 0;
    item.netAmount = Number((qty * price).toFixed(2));

    updated[index] = item;
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        id: `row_${Date.now()}`,
        item: '',
        batchNumber: '',
        uom: '',
        qtyOrdered: 0,
        purchasePrice: 0,
        account: '',
        netAmount: 0
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const grossTotal = items.reduce((acc, it) => acc + (Number(it.netAmount) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert('Please select a Supplier.');
      return;
    }
    if (!poNo.trim()) {
      alert('Please enter a PO Number.');
      return;
    }

    const supplierObj = contacts.find(c => c.id === supplierId);
    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: poNo.trim(),
      supplierId,
      supplierName: supplierObj ? supplierObj.name : 'Unknown Supplier',
      poDate,
      dueDate,
      specialInstructions,
      items: items.filter(it => it.item.trim() || it.qtyOrdered > 0),
      total: grossTotal,
      status: 'Partial',
      notes: newNote,
      createdAt: new Date().toISOString()
    };

    onSavePO(newPO);
    alert(`Purchase Order ${newPO.poNumber} created successfully!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
        <h2 className="text-base font-bold text-slate-800">New Purchase Order</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Purchase Orders
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ======================================================== */}
        {/* 1. TOP 3-COLUMN FORM SECTION (SCREENSHOT 2 REPLICA)      */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-100 items-start">
          {/* Column 1: Supplier * + Add Contact */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Supplier *
            </label>
            <select
              value={supplierId}
              onFocus={reloadContacts}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Supplier</option>
              {contacts.filter(c => !c.type || c.type === 'supplier' || c.type === 'both').map(c => (
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

          {/* Column 2: PO No *, Date *, Due Date */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                PO No *
              </label>
              <input
                type="text"
                required
                value={poNo}
                onChange={(e) => setPoNo(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Date *
              </label>
              <DatePicker
                value={poDate}
                onChange={setPoDate}
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

          {/* Column 3: Special Instructions */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Special Instructions
            </label>
            <textarea
              rows={4}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. PURCHASE ORDER ITEMS TABLE (SCREENSHOT 2 REPLICA)     */}
        {/* ======================================================== */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Purchase Order Items</h3>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[10.5px]">
                <tr>
                  <th className="px-3 py-2 min-w-[200px]">Item</th>
                  <th className="px-3 py-2 w-32 text-center">Batch Number</th>
                  <th className="px-3 py-2 w-28">UOM</th>
                  <th className="px-3 py-2 w-28 text-center">Qty Ordered</th>
                  <th className="px-3 py-2 w-28 text-right">Purchase Price</th>
                  <th className="px-3 py-2 min-w-[180px]">Account</th>
                  <th className="px-3 py-2 w-28 text-right">Net Amount</th>
                  <th className="px-3 py-2 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
                {items.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    {/* Item with product auto-fill */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        list={`po-product-list-${idx}`}
                        placeholder="Type or select item..."
                        value={row.item}
                        onChange={(e) => handleItemChange(idx, 'item', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded focus:border-[#0070ba] text-xs"
                      />
                      <datalist id={`po-product-list-${idx}`}>
                        {products.map(p => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                    </td>

                    {/* Batch Number */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        placeholder="N/A"
                        value={row.batchNumber}
                        onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                        className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-center text-slate-500 placeholder-slate-400 text-xs"
                      />
                    </td>

                    {/* UOM */}
                    <td className="p-1.5">
                      <select
                        value={row.uom}
                        onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                        className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800"
                      >
                        <option value="">Select UOM</option>
                        {uomList.map(u => (
                          <option key={u.id} value={u.symbol}>{u.symbol}</option>
                        ))}
                      </select>
                    </td>

                    {/* Qty Ordered */}
                    <td className="p-1.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.qtyOrdered || ''}
                        onChange={(e) => handleItemChange(idx, 'qtyOrdered', e.target.value)}
                        className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-center font-semibold text-xs text-slate-900"
                      />
                    </td>

                    {/* Purchase Price */}
                    <td className="p-1.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.purchasePrice || ''}
                        onChange={(e) => handleItemChange(idx, 'purchasePrice', e.target.value)}
                        className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-right font-mono text-xs"
                      />
                    </td>

                    {/* Account */}
                    <td className="p-1.5">
                      <select
                        value={row.account}
                        onChange={(e) => handleItemChange(idx, 'account', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800"
                      >
                        {DEFAULT_ACCOUNTS.map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </td>

                    {/* Net Amount */}
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                      {row.netAmount.toFixed(2)}
                    </td>

                    {/* Actions (+ / ✖) */}
                    <td className="p-1.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
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

        {/* 3. Gross Total */}
        <div className="pt-2 flex justify-end">
          <div className="w-64 flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
            <span className="font-medium text-slate-700">Gross Total</span>
            <span className="font-extrabold font-mono text-slate-900 text-base">
              {grossTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 4. Bottom Save Button matching Screenshot 2 */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs"
          >
            Save
          </button>
        </div>

        {/* 5. Collapsible Notes Accordion matching Screenshot 2 */}
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
                  placeholder="Add internal vendor instructions or terms..."
                  className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newNote.trim()) return;
                  alert('Note saved to this PO session!');
                }}
                className="px-4 py-1.5 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded text-xs transition"
              >
                Save Note
              </button>
            </div>
          )}
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

