import React, { useState } from 'react';
import { Calendar, Plus, X, Info, ArrowLeft } from 'lucide-react';
import type { Expense, ExpenseItemRow } from '../../../types/expense';
import type { Contact } from '../../../types/contact';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { InlineAddContactModal } from '../contacts/InlineAddContactModal';

interface NewExpenseViewProps {
  initialExpense?: Expense | null;
  onSaveExpense: (exp: Expense) => void;
  onCancel: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const ACCOUNTS = [
  'Search Account',
  'Office Supplies Expense',
  'Utilities Expense (Electricity, Water)',
  'Rent Expense',
  'Fuel & Travel Expense',
  'Entertainment & Meals',
  'Repair & Maintenance',
  'Marketing & Advertising',
  'Printing & Stationery',
  'Bank Fees & Charges',
  'General & Administrative'
];

const PAID_THROUGH_ACCOUNTS = [
  'Select Account',
  'Cash in Hand',
  'Cash Register',
  'Petty Cash',
  'Meezan bank',
  'Habib Bank Limited (HBL)',
  'Standard Chartered Bank',
  'Corporate Credit Card'
];

const TAX_RATES = [
  { label: 'Select Tax Rate', value: 0 },
  { label: '0% (Exempt)', value: 0 },
  { label: '5% Reduced', value: 5 },
  { label: '10% Reduced', value: 10 },
  { label: '15% Services Tax', value: 15 },
  { label: '18% Standard Sales Tax', value: 18 }
];

export const NewExpenseView: React.FC<NewExpenseViewProps> = ({
  initialExpense,
  onSaveExpense,
  onCancel
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
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [date, setDate] = useState(initialExpense ? initialExpense.date : getTodayFormatted());
  const [referenceNo, setReferenceNo] = useState(initialExpense ? initialExpense.referenceNo : `EXP-${Math.floor(100 + Math.random() * 900)}`);
  const [paidThrough, setPaidThrough] = useState(initialExpense ? initialExpense.paidThrough : 'Cash in Hand');
  const [customer, setCustomer] = useState(initialExpense ? (initialExpense.customer || '') : '');
  const [isTaxInclusive, setIsTaxInclusive] = useState(initialExpense ? initialExpense.isTaxInclusive : true);

  // Line items
  const [items, setItems] = useState<ExpenseItemRow[]>(() => {
    if (initialExpense && initialExpense.items && initialExpense.items.length > 0) {
      return initialExpense.items;
    }
    return [
      {
        id: 'row_1',
        account: '',
        taxRatePercent: 0,
        amount: 0,
        taxAmount: 0,
        notes: ''
      },
      {
        id: 'row_2',
        account: '',
        taxRatePercent: 0,
        amount: 0,
        taxAmount: 0,
        notes: ''
      }
    ];
  });

  const handleItemChange = (index: number, field: keyof ExpenseItemRow, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    const amount = Number(item.amount) || 0;
    const taxRate = Number(item.taxRatePercent) || 0;

    let calculatedTax = 0;
    if (isTaxInclusive && taxRate > 0) {
      calculatedTax = amount - (amount / (1 + taxRate / 100));
    } else {
      calculatedTax = (amount * taxRate) / 100;
    }

    item.taxAmount = Number(calculatedTax.toFixed(2));
    updated[index] = item;
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        id: `row_${Date.now()}`,
        account: '',
        taxRatePercent: 0,
        amount: 0,
        taxAmount: 0,
        notes: ''
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalTax = items.reduce((acc, it) => acc + (Number(it.taxAmount) || 0), 0);
  const rawSum = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const subtotal = isTaxInclusive ? rawSum - totalTax : rawSum;
  const grossTotal = isTaxInclusive ? rawSum : rawSum + totalTax;

  const handleSubmit = (status: 'Approved' | 'Draft') => {
    if (!paidThrough || paidThrough === 'Select Account') {
      alert('Please select Paid Through account.');
      return;
    }

    const newExp: Expense = {
      id: initialExpense ? initialExpense.id : `exp_${Date.now()}`,
      referenceNo: referenceNo.trim(),
      date,
      paidThrough,
      customer,
      isTaxInclusive,
      items: items.filter(it => (Number(it.amount) || 0) > 0 || it.account.trim()),
      subtotal,
      totalTax,
      grossTotal,
      status: status === 'Approved' ? 'Approved' : 'Draft',
      createdAt: initialExpense ? initialExpense.createdAt : new Date().toISOString()
    };

    onSaveExpense(newExp);
    alert(`Expense ${newExp.referenceNo} saved as ${status}!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 w-full my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header matching Moneypex */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-800">{initialExpense ? 'Edit Expense' : 'New Expense'}</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Expenses
        </button>
      </div>

      {/* 2. Top Header Form Section (2 rows x 2 columns matching Screenshot) */}
      <div className="space-y-4 pb-6 border-b border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date * */}
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

          {/* Reference No * */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Reference No *
            </label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paid Through * */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Paid Through *
            </label>
            <select
              value={paidThrough}
              onChange={(e) => setPaidThrough(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {PAID_THROUGH_ACCOUNTS.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          {/* Customer / Supplier */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Customer / Supplier
            </label>
            <select
              value={customer}
              onFocus={reloadContacts}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Customer or Supplier (Optional)</option>
              {contacts.map(c => (
                <option key={c.id} value={c.name}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
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
        </div>
      </div>

      {/* 3. Expense Items Section & Table matching Screenshot */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Expense Items</h3>
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <label className="flex items-center space-x-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={isTaxInclusive}
                onChange={(e) => setIsTaxInclusive(e.target.checked)}
                className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
              />
              <span>Tax Inclusive</span>
            </label>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Full 6-Column Expense Items Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[10.5px]">
              <tr>
                <th className="px-3 py-2 min-w-[220px]">Account</th>
                <th className="px-3 py-2 w-44">TAX Rate</th>
                <th className="px-3 py-2 w-32">Amount</th>
                <th className="px-3 py-2 w-32 text-right">Tax Amount</th>
                <th className="px-3 py-2 min-w-[200px]">Notes</th>
                <th className="px-3 py-2 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
              {items.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                  {/* Account */}
                  <td className="p-1.5">
                    <select
                      value={row.account}
                      onChange={(e) => handleItemChange(idx, 'account', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded focus:border-[#0070ba] text-xs bg-white"
                    >
                      {ACCOUNTS.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </td>

                  {/* TAX Rate */}
                  <td className="p-1.5">
                    <select
                      value={row.taxRatePercent}
                      onChange={(e) => handleItemChange(idx, 'taxRatePercent', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded focus:border-[#0070ba] text-xs bg-white"
                    >
                      {TAX_RATES.map(t => (
                        <option key={t.label} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </td>

                  {/* Amount */}
                  <td className="p-1.5">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.amount || ''}
                      placeholder="0"
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono text-xs text-slate-800"
                    />
                  </td>

                  {/* Tax Amount */}
                  <td className="px-3 py-2 text-right font-mono text-slate-600">
                    {row.taxAmount.toFixed(2)}
                  </td>

                  {/* Notes */}
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </td>

                  {/* Actions (+ / ✖ matching Screenshot buttons) */}
                  <td className="p-1.5 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="w-5 h-5 rounded-full bg-[#0070ba] text-white flex items-center justify-center hover:bg-sky-700 transition"
                        title="Add line"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={items.length <= 1}
                        className="w-5 h-5 rounded-full bg-[#001e3d] text-white flex items-center justify-center hover:bg-rose-600 disabled:opacity-30 transition"
                        title="Remove line"
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

      {/* 4. Bottom Financial Calculations matching Screenshot */}
      <div className="pt-6 flex justify-end">
        <div className="w-64 space-y-2.5 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Subtotal</span>
            <span className="font-mono font-semibold text-slate-900">
              {subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Total TAX</span>
            <span className="font-mono text-slate-600">
              {totalTax.toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="font-extrabold text-slate-900">Gross Total</span>
            <span className="font-extrabold font-mono text-base text-slate-900">
              {grossTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Action Buttons matching Screenshot */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('Draft')}
          className="px-5 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('Approved')}
          className="px-5 py-2 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded text-xs transition shadow-xs"
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
          setCustomer(newContact.name);
        }}
      />
    </div>
  );
};
