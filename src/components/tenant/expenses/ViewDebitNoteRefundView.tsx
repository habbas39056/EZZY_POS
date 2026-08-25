import React, { useState } from 'react';
import { ArrowLeft, Printer, Trash2 } from 'lucide-react';
import type { DebitNote } from '../../../types/debitNote';
import { DatePicker } from '../../common/DatePicker';

export interface DebitNoteRefundRecord {
  id: string;
  refundDate: string;
  accountHead: string;
  netAmount: number;
  whtAmount: number;
  chequeNumber: string;
  chequeDate: string;
  totalAmount: number;
  notes: string;
}

interface ViewDebitNoteRefundViewProps {
  debitNote: DebitNote;
  onBack: () => void;
  onUpdateDebitNote?: (updatedDN: DebitNote) => void;
  currencySymbol?: string;
}

const ACCOUNT_OPTIONS = [
  'Select a Account',
  '10010 - Cash in Hand',
  '10020 - Petty Cash',
  '20010 - Meezan Bank Ltd (Current A/C)',
  '20020 - Habib Bank Limited (HBL Corporate)',
  '20030 - Bank Al Habib Ltd',
  '20040 - Standard Chartered Bank',
  '10050 - Accounts Payable Adjustment'
];

const WHT_OPTIONS = [
  { label: 'Select a WithHolding Tax', rate: 0 },
  { label: 'Tax Exempt - (0%)', rate: 0 },
  { label: 'WHT on Goods - (4%)', rate: 4 },
  { label: 'WHT on Services - (8%)', rate: 8 },
  { label: 'WHT on Contracts - (7%)', rate: 7 },
  { label: 'WHT - (10%)', rate: 10 }
];

export const ViewDebitNoteRefundView: React.FC<ViewDebitNoteRefundViewProps> = ({
  debitNote,
  onBack,
  onUpdateDebitNote,
  currencySymbol = 'Rs'
}) => {
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // State for Add Refund Form (Matching top half of Screenshot)
  const [amount, setAmount] = useState<number | ''>(debitNote.balance > 0 ? debitNote.balance : '');
  const [refundDate, setRefundDate] = useState<string>(getTodayFormatted());
  const [selectedAccount, setSelectedAccount] = useState<string>('Select a Account');
  const [selectedWHT, setSelectedWHT] = useState<string>('Select a WithHolding Tax');
  const [referenceNo, setReferenceNo] = useState<string>(`REF-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState<string>('');

  // Persisted Refunds History
  const [refunds, setRefunds] = useState<DebitNoteRefundRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`adwiselabs_dn_refunds_${debitNote.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const totalPaid = refunds.reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0);
  const remainingBalance = Math.max(0, debitNote.grossTotal - totalPaid);

  const handleAddRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const refundAmt = Number(amount) || 0;
    if (refundAmt <= 0) {
      alert('Please enter a valid Amount.');
      return;
    }
    if (selectedAccount === 'Select a Account' || !selectedAccount) {
      alert('Please select an Account.');
      return;
    }
    if (!referenceNo.trim()) {
      alert('Please enter a Reference No.');
      return;
    }
    if (refundAmt > remainingBalance) {
      alert(`Refund amount cannot exceed remaining balance of ${remainingBalance.toFixed(2)}.`);
      return;
    }

    const matchedWHT = WHT_OPTIONS.find(w => w.label === selectedWHT);
    const whtRate = matchedWHT ? matchedWHT.rate : 0;
    const whtAmount = Number(((refundAmt * whtRate) / 100).toFixed(2));
    const netAmount = Number((refundAmt - whtAmount).toFixed(2));

    const newRecord: DebitNoteRefundRecord = {
      id: `refund_${Date.now()}`,
      refundDate,
      accountHead: selectedAccount,
      netAmount,
      whtAmount,
      chequeNumber: referenceNo.trim(),
      chequeDate: refundDate,
      totalAmount: refundAmt,
      notes: notes.trim() || 'Refund received'
    };

    const updatedRefunds = [newRecord, ...refunds];
    setRefunds(updatedRefunds);
    localStorage.setItem(`adwiselabs_dn_refunds_${debitNote.id}`, JSON.stringify(updatedRefunds));

    const newTotalPaid = updatedRefunds.reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0);
    const newBal = Math.max(0, debitNote.grossTotal - newTotalPaid);

    const updatedDN: DebitNote = {
      ...debitNote,
      balance: Number(newBal.toFixed(2)),
      status: (newBal === 0 ? 'Completed' : 'Refund') as any
    };

    // Update local storage directly by id & debitNoteNumber
    try {
      const savedList = localStorage.getItem('adwiselabs_debit_notes');
      if (savedList) {
        const list: DebitNote[] = JSON.parse(savedList);
        const nextList = list.map(d => (d.id === updatedDN.id || d.debitNoteNumber === updatedDN.debitNoteNumber) ? updatedDN : d);
        localStorage.setItem('adwiselabs_debit_notes', JSON.stringify(nextList));
      }
    } catch (err) {}

    if (onUpdateDebitNote) {
      onUpdateDebitNote(updatedDN);
    }

    // Reset form
    setAmount(newBal > 0 ? newBal : '');
    setNotes('');
    alert(`Refund of ${currencySymbol} ${refundAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been added successfully!`);
  };

  const handleDeleteRefund = (refundId: string) => {
    if (!confirm('Are you sure you want to delete this refund record?')) return;
    const updatedRefunds = refunds.filter(r => r.id !== refundId);
    setRefunds(updatedRefunds);
    localStorage.setItem(`adwiselabs_dn_refunds_${debitNote.id}`, JSON.stringify(updatedRefunds));

    const newTotalPaid = updatedRefunds.reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0);
    const newBal = Math.max(0, debitNote.grossTotal - newTotalPaid);

    const updatedDN: DebitNote = {
      ...debitNote,
      balance: Number(newBal.toFixed(2)),
      status: (newBal === 0 ? 'Completed' : 'Refund') as any
    };

    try {
      const savedList = localStorage.getItem('adwiselabs_debit_notes');
      if (savedList) {
        const list: DebitNote[] = JSON.parse(savedList);
        const nextList = list.map(d => (d.id === updatedDN.id || d.debitNoteNumber === updatedDN.debitNoteNumber) ? updatedDN : d);
        localStorage.setItem('adwiselabs_debit_notes', JSON.stringify(nextList));
      }
    } catch (err) {}

    if (onUpdateDebitNote) {
      onUpdateDebitNote(updatedDN);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 w-full my-3 text-xs text-slate-700 font-sans select-none space-y-8">
      {/* Top Breadcrumb / Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <button
          onClick={onBack}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Debit Notes
        </button>

        <span className="font-mono text-xs text-slate-500 font-bold">
          Debit Note #{debitNote.debitNoteNumber} &bull; Supplier: <strong className="text-slate-800">{debitNote.supplierName}</strong>
        </span>
      </div>

      {/* ======================================================== */}
      {/* 1. ADD REFUND FORM SECTION (MATCHING SCREENSHOT TOP)     */}
      {/* ======================================================== */}
      <form onSubmit={handleAddRefund} className="space-y-4 pb-6 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800 pb-1">Add Refund</h2>

        {/* Row 1: Amount * | Refund Date * | Account * */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Amount * */}
          <div>
            <label className="block text-slate-600 font-medium mb-1 text-[11px]">
              Amount *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono bg-white"
            />
          </div>

          {/* Refund Date * */}
          <div>
            <label className="block text-slate-600 font-medium mb-1 text-[11px]">
              Refund Date *
            </label>
            <DatePicker
              value={refundDate}
              onChange={setRefundDate}
            />
          </div>

          {/* Account * */}
          <div>
            <label className="block text-slate-600 font-medium mb-1 text-[11px]">
              Account *
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {ACCOUNT_OPTIONS.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: WithHolding Tax */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-600 font-medium mb-1 text-[11px]">
              WithHolding Tax
            </label>
            <select
              value={selectedWHT}
              onChange={(e) => setSelectedWHT(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {WHT_OPTIONS.map(w => (
                <option key={w.label} value={w.label}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Reference No * | Notes | Add Refund Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Reference No * */}
          <div className="md:col-span-4">
            <label className="block text-slate-600 font-medium mb-1 text-[11px]">
              Reference No *
            </label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-6">
            <label className="block text-slate-600 font-medium mb-1 text-[11px]">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
            />
          </div>

          {/* Add Refund Button (Sky blue matching screenshot) */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-1.5 bg-[#42a5f5] hover:bg-[#1e88e5] text-white font-semibold rounded text-xs transition shadow-xs cursor-pointer text-center"
            >
              Add Refund
            </button>
          </div>
        </div>
      </form>

      {/* ======================================================== */}
      {/* 2. REFUNDS LIST SECTION (MATCHING SCREENSHOT BOTTOM)     */}
      {/* ======================================================== */}
      <div className="space-y-3">
        {/* Header & KPI Summary Boxes */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Refunds List</h2>

          {/* 3 Square KPI Boxes: Balance | Paid | Total (Exact Screenshot Match) */}
          <div className="flex items-center space-x-1 font-sans text-xs">
            {/* Box 1: Balance */}
            <div className="flex flex-col text-center w-20 border border-slate-300 rounded overflow-hidden">
              <div className="bg-white text-slate-500 py-0.5 text-[10px] font-medium border-b border-slate-200">
                Balance
              </div>
              <div className="bg-[#001e3d] text-white py-1 font-mono font-bold text-xs">
                {remainingBalance > 0 ? remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
              </div>
            </div>

            {/* Box 2: Paid */}
            <div className="flex flex-col text-center w-20 border border-slate-300 rounded overflow-hidden">
              <div className="bg-white text-slate-500 py-0.5 text-[10px] font-medium border-b border-slate-200">
                Paid
              </div>
              <div className="bg-[#001e3d] text-white py-1 font-mono font-bold text-xs">
                {totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Box 3: Total */}
            <div className="flex flex-col text-center w-24 border border-slate-300 rounded overflow-hidden">
              <div className="bg-white text-slate-500 py-0.5 text-[10px] font-medium border-b border-slate-200">
                Total
              </div>
              <div className="bg-[#001e3d] text-white py-1 font-mono font-bold text-xs">
                {debitNote.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Refunds List Table (All 9 Columns matching Screenshot) */}
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[10.5px]">
              <tr>
                <th className="px-3 py-2">Refund Date</th>
                <th className="px-3 py-2">Account Head</th>
                <th className="px-3 py-2 text-right">Net Amount</th>
                <th className="px-3 py-2 text-right">WHT (Amount)</th>
                <th className="px-3 py-2 text-center">Cheque Number</th>
                <th className="px-3 py-2 text-center">Cheque Date</th>
                <th className="px-3 py-2 text-right">Total Amount</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    No refunds recorded for this debit note yet. Fill in the form above and click <strong>Add Refund</strong>.
                  </td>
                </tr>
              ) : (
                refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-3 py-2.5 font-mono text-slate-600">{r.refundDate}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">{r.accountHead}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-800">
                      {r.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                      {r.whtAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-700">{r.chequeNumber}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-500">{r.chequeDate}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                      {r.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{r.notes}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => alert(`Printing Refund Voucher for Debit Note #${debitNote.debitNoteNumber}`)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          title="Print Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRefund(r.id)}
                          className="p-1 rounded hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          title="Delete Refund"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
