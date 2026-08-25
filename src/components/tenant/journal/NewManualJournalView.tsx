import React, { useState } from 'react';
import { Calendar, PlusCircle, XCircle, ArrowLeft } from 'lucide-react';
import type { ManualJournal, JournalEntryItem } from '../../../types/journal';
import { DatePicker } from '../../common/DatePicker';

interface NewManualJournalViewProps {
  onSaveJournal: (journal: ManualJournal) => void;
  onCancel: () => void;
  initialJournal?: ManualJournal | null;
  currencyCode?: string;
  currencySymbol?: string;
}

const CHART_OF_ACCOUNTS = [
  'Select Account',
  '1000 - Cash In Hand',
  '1010 - Mcb Bank Account',
  '1020 - Meezan Bank Account',
  '1100 - Accounts Receivable',
  '1200 - Inventory Asset',
  '2000 - Accounts Payable',
  '2100 - Sales Tax Payable',
  '3000 - Owner Equity / Capital',
  '4000 - Sales Income',
  '5000 - Cost of Goods Sold',
  '5100 - Customs & Freight Clearing',
  '6000 - Office Rent & Utilities Expense',
  '6100 - Salaries & Wages Expense'
];

const TAX_RATES = [
  { label: 'Select Tax', rate: 0 },
  { label: 'Standard Rate 18%', rate: 18 },
  { label: 'Reduced Rate 10%', rate: 10 },
  { label: 'Zero Rate 0%', rate: 0 }
];

export const NewManualJournalView: React.FC<NewManualJournalViewProps> = ({
  onSaveJournal,
  onCancel,
  initialJournal
}) => {
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [narration, setNarration] = useState(initialJournal?.narration || '');
  const [date, setDate] = useState(initialJournal?.date || getTodayFormatted());
  const [isTaxInclusive, setIsTaxInclusive] = useState(initialJournal?.isTaxInclusive || false);

  const [items, setItems] = useState<JournalEntryItem[]>(() => {
    if (initialJournal && initialJournal.items.length > 0) return initialJournal.items;
    return [
      {
        id: 'row_1',
        description: '',
        accountId: '',
        accountName: '',
        taxRate: 0,
        debit: 0,
        credit: 0,
        netAmount: 0
      },
      {
        id: 'row_2',
        description: '',
        accountId: '',
        accountName: '',
        taxRate: 0,
        debit: 0,
        credit: 0,
        netAmount: 0
      }
    ];
  });

  const handleRowChange = (index: number, field: keyof JournalEntryItem, value: any) => {
    const updated = [...items];
    const row = { ...updated[index], [field]: value };

    if (field === 'debit') {
      const d = Number(value) || 0;
      row.debit = d;
      if (d > 0) row.credit = 0;
      row.netAmount = d;
    } else if (field === 'credit') {
      const c = Number(value) || 0;
      row.credit = c;
      if (c > 0) row.debit = 0;
      row.netAmount = c;
    }

    updated[index] = row;
    setItems(updated);
  };

  const handleAddRow = (index: number) => {
    const newRow: JournalEntryItem = {
      id: `row_${Date.now()}_${Math.random()}`,
      description: '',
      accountId: '',
      accountName: '',
      taxRate: 0,
      debit: 0,
      credit: 0,
      netAmount: 0
    };
    const updated = [...items];
    updated.splice(index + 1, 0, newRow);
    setItems(updated);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 2) {
      alert('A journal entry must have at least 2 line items.');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const sumDebit = items.reduce((acc, row) => acc + (Number(row.debit) || 0), 0);
  const sumCredit = items.reduce((acc, row) => acc + (Number(row.credit) || 0), 0);

  const handleSubmit = (status: 'Draft' | 'Posted') => {
    if (!narration.trim()) {
      alert('Please enter a Narration.');
      return;
    }

    const validRows = items.filter(r => r.accountId && (r.debit > 0 || r.credit > 0));
    if (validRows.length < 2) {
      alert('Please configure at least 2 valid journal lines with accounts and amounts.');
      return;
    }

    if (status === 'Posted' && Math.abs(sumDebit - sumCredit) > 0.01) {
      alert(`Journal is out of balance! Sum of Debit (${sumDebit.toFixed(2)}) must equal Sum of Credit (${sumCredit.toFixed(2)}).`);
      return;
    }

    const journal: ManualJournal = {
      id: initialJournal ? initialJournal.id : `jou_${Math.floor(100000 + Math.random() * 900000)}`,
      journalId: initialJournal ? initialJournal.journalId : String(Math.floor(100000 + Math.random() * 900000)),
      narration: narration.trim(),
      date,
      createdDate: initialJournal ? initialJournal.createdDate : getTodayFormatted(),
      isTaxInclusive,
      total: Math.max(sumDebit, sumCredit),
      status,
      items: validRows
    };

    onSaveJournal(journal);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header matching Screenshot 2 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#0070ba]">
          New Manual Journal
        </h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Journals
        </button>
      </div>

      {/* Top Form Inputs matching Screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        {/* Narration * */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            Narration *
          </label>
          <input
            type="text"
            required
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="Enter narration..."
            className="w-full px-3 py-2 border-2 border-sky-400 rounded-md focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
          />
        </div>

        {/* Date * */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            Date *
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            required
          />
        </div>
      </div>

      {/* Section: Manual Journal Items matching Screenshot 2 */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            Manual Journal Items
          </h3>

          <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600">
            <input
              type="checkbox"
              checked={isTaxInclusive}
              onChange={(e) => setIsTaxInclusive(e.target.checked)}
              className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
            />
            <span>Tax Inclusive</span>
          </label>
        </div>

        {/* Table matching Screenshot 2 */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-3 py-2 min-w-[200px]">Description</th>
                <th className="px-3 py-2 min-w-[220px]">Account</th>
                <th className="px-3 py-2 w-32">TAX</th>
                <th className="px-3 py-2 w-28 text-right">Debit</th>
                <th className="px-3 py-2 w-28 text-right">Credit</th>
                <th className="px-3 py-2 w-28 text-right">Net Amount</th>
                <th className="px-3 py-2 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {items.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  {/* Description */}
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                      placeholder="Line description..."
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                    />
                  </td>

                  {/* Account */}
                  <td className="p-1.5">
                    <select
                      value={row.accountId}
                      onChange={(e) => {
                        handleRowChange(idx, 'accountId', e.target.value);
                        handleRowChange(idx, 'accountName', e.target.value);
                      }}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800"
                    >
                      {CHART_OF_ACCOUNTS.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </td>

                  {/* TAX */}
                  <td className="p-1.5">
                    <select
                      value={row.taxRate}
                      onChange={(e) => handleRowChange(idx, 'taxRate', Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800"
                    >
                      {TAX_RATES.map(t => (
                        <option key={t.label} value={t.rate}>{t.label}</option>
                      ))}
                    </select>
                  </td>

                  {/* Debit */}
                  <td className="p-1.5">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.debit || ''}
                      onChange={(e) => handleRowChange(idx, 'debit', Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-right font-mono font-semibold text-slate-900 text-xs"
                    />
                  </td>

                  {/* Credit */}
                  <td className="p-1.5">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.credit || ''}
                      onChange={(e) => handleRowChange(idx, 'credit', Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-right font-mono font-semibold text-slate-900 text-xs"
                    />
                  </td>

                  {/* Net Amount */}
                  <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-800">
                    {row.netAmount.toFixed(2)}
                  </td>

                  {/* Actions matching Screenshot 2 */}
                  <td className="p-1.5 text-center">
                    <div className="flex items-center justify-center space-x-1.5 text-[#0070ba]">
                      <button
                        type="button"
                        onClick={() => handleAddRow(idx)}
                        className="hover:scale-110 transition"
                        title="Add row"
                      >
                        <PlusCircle className="w-4 h-4 fill-[#0070ba] text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="hover:scale-110 transition"
                        title="Remove row"
                      >
                        <XCircle className="w-4 h-4 fill-[#0070ba] text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sum of Debit & Credit Summary matching Screenshot 2 */}
        <div className="flex flex-col items-end space-y-1.5 pt-3 text-xs">
          <div className="flex items-center space-x-8 text-slate-600">
            <span>Sum of Debit</span>
            <span className="font-mono font-bold text-slate-900 min-w-[80px] text-right">
              {sumDebit.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center space-x-8 text-slate-600">
            <span>Sum of Credit</span>
            <span className="font-mono font-bold text-slate-900 min-w-[80px] text-right">
              {sumCredit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bottom Actions matching Screenshot 2 */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleSubmit('Draft')}
            className="px-6 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('Posted')}
            className="px-6 py-2 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded shadow-xs text-xs transition"
          >
            Save & Post
          </button>
        </div>
      </div>
    </div>
  );
};
