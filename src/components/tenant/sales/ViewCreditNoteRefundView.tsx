import React, { useState } from 'react';
import { ArrowLeft, Printer, FileText, Trash2, Calendar } from 'lucide-react';
import type { CreditNote, CreditNoteRefundRecord } from '../../../types/creditNote';
import { CreditNotePaymentDetailsView } from './CreditNotePaymentDetailsView';
import { DatePicker } from '../../common/DatePicker';

interface ViewCreditNoteRefundViewProps {
  creditNote: CreditNote;
  onBack: () => void;
  onUpdateCreditNote?: (updated: CreditNote) => void;
  currencySymbol?: string;
}

const PAYMENT_ACCOUNTS = [
  'Select a Account',
  'Cash In Hand',
  'Main Operating Account',
  'Bank Account - Meezan Bank',
  'Bank Account - HBL',
  'Petty Cash'
];

const WHT_OPTIONS = [
  { label: 'Select a WithHolding Tax', rate: 0 },
  { label: 'WHT 1% (Services)', rate: 1 },
  { label: 'WHT 2% (Supplies)', rate: 2 },
  { label: 'WHT 3% (Standard)', rate: 3 },
  { label: 'WHT 4% (Goods)', rate: 4 },
  { label: 'WHT 5% (Contracts)', rate: 5 }
];

export const ViewCreditNoteRefundView: React.FC<ViewCreditNoteRefundViewProps> = ({
  creditNote,
  onBack,
  onUpdateCreditNote,
  currencySymbol = 'Rs'
}) => {
  const [currentCN, setCurrentCN] = useState<CreditNote>(creditNote);
  const [viewingDetails, setViewingDetails] = useState(false);

  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Form State
  const [amount, setAmount] = useState<number>(currentCN.balance > 0 ? currentCN.balance : currentCN.grossTotal);
  const [refundDate, setRefundDate] = useState<string>(getTodayFormatted());
  const [account, setAccount] = useState<string>('Select a Account');
  const [whtRate, setWhtRate] = useState<number>(0);
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const refunds = currentCN.refunds || [];
  const paidAmount = refunds.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const totalAmount = currentCN.grossTotal || 0;
  const balance = Math.max(0, totalAmount - paidAmount);

  const handleAddRefund = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const refundAmt = Number(amount);
    if (isNaN(refundAmt) || refundAmt <= 0) {
      setErrorMsg('Please enter a valid refund amount greater than 0.');
      return;
    }

    if (refundAmt > balance) {
      setErrorMsg(`Refund amount cannot exceed remaining balance of ${balance.toFixed(2)}.`);
      return;
    }

    if (account === 'Select a Account' || !account) {
      setErrorMsg('Please select a Payment Account.');
      return;
    }

    const whtAmt = Number(((refundAmt * whtRate) / 100).toFixed(2));
    const netAmt = Number((refundAmt - whtAmt).toFixed(2));

    const newRecord: CreditNoteRefundRecord = {
      id: `ref_${Date.now()}`,
      paymentAccount: account,
      amount: refundAmt,
      netAmount: netAmt,
      whtAmount: whtAmt,
      chequeNumber: '-',
      chequeDate: '-',
      refundDate,
      referenceNo: referenceNo.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes.trim() || '-'
    };

    const updatedRefunds = [...refunds, newRecord];
    const newPaid = updatedRefunds.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const newBalance = Math.max(0, Number((totalAmount - newPaid).toFixed(2)));
    const newStatus = newBalance === 0 ? 'Refunded' : 'Partially Refunded';

    const updatedCN: CreditNote = {
      ...currentCN,
      balance: newBalance,
      status: newStatus,
      refunds: updatedRefunds
    };

    setCurrentCN(updatedCN);

    // Save to localStorage
    const saved = localStorage.getItem('adwiselabs_credit_notes');
    if (saved) {
      const list: CreditNote[] = JSON.parse(saved);
      const updatedList = list.map(c => (c.id === updatedCN.id ? updatedCN : c));
      localStorage.setItem('adwiselabs_credit_notes', JSON.stringify(updatedList));
    }

    if (onUpdateCreditNote) {
      onUpdateCreditNote(updatedCN);
    }

    // Reset inputs
    setReferenceNo('');
    setNotes('');
    setAmount(newBalance);
  };

  const handleDeleteRefund = (refId: string) => {
    if (!confirm('Are you sure you want to delete this refund record?')) return;

    const updatedRefunds = refunds.filter(r => r.id !== refId);
    const newPaid = updatedRefunds.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const newBalance = Math.max(0, Number((totalAmount - newPaid).toFixed(2)));
    const newStatus = newPaid === 0 ? 'Refund' : newBalance === 0 ? 'Refunded' : 'Partially Refunded';

    const updatedCN: CreditNote = {
      ...currentCN,
      balance: newBalance,
      status: newStatus,
      refunds: updatedRefunds
    };

    setCurrentCN(updatedCN);

    // Save to localStorage
    const saved = localStorage.getItem('adwiselabs_credit_notes');
    if (saved) {
      const list: CreditNote[] = JSON.parse(saved);
      const updatedList = list.map(c => (c.id === updatedCN.id ? updatedCN : c));
      localStorage.setItem('adwiselabs_credit_notes', JSON.stringify(updatedList));
    }

    if (onUpdateCreditNote) {
      onUpdateCreditNote(updatedCN);
    }

    setAmount(newBalance);
  };

  if (viewingDetails) {
    return (
      <CreditNotePaymentDetailsView
        creditNote={currentCN}
        onClose={() => setViewingDetails(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition flex items-center gap-1.5 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Credit Notes</span>
        </button>
        <span className="text-slate-500 font-medium">
          Credit Note: <strong className="text-slate-900 font-mono">#{currentCN.creditNoteNumber}</strong> | Customer: <strong className="text-slate-900">{currentCN.customerName}</strong>
        </span>
      </div>

      {/* ======================================================== */}
      {/* 1. TOP SECTION: ADD REFUND FORM (EXACT SCREENSHOT MATCH) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-sm font-bold text-[#0070ba]">
            Add Refund
          </h2>
        </div>

        {errorMsg && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleAddRefund} className="space-y-4">
          {/* Row 1: Amount *, Refund Date *, Account * */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-xs">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              />
            </div>

            {/* Refund Date * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-xs">
                Refund Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={refundDate}
                onChange={setRefundDate}
              />
            </div>

            {/* Account * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-xs">
                Account <span className="text-red-500">*</span>
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700"
              >
                {PAYMENT_ACCOUNTS.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: WithHolding Tax */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-xs">
                WithHolding Tax
              </label>
              <select
                value={whtRate}
                onChange={(e) => setWhtRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-700"
              >
                {WHT_OPTIONS.map(w => (
                  <option key={w.label} value={w.rate}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Reference No *, Notes, Add Refund Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Reference No * */}
            <div className="md:col-span-4">
              <label className="block text-slate-600 font-medium mb-1 text-xs">
                Reference No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. REF-01"
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-6">
              <label className="block text-slate-600 font-medium mb-1 text-xs">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder=""
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              />
            </div>

            {/* Add Refund Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-1.5 px-4 bg-[#6ba3e4] hover:bg-[#5293dd] text-white font-medium rounded text-xs transition shadow-xs"
              >
                Add Refund
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 2. BOTTOM SECTION: REFUNDS LIST (EXACT SCREENSHOT MATCH) */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        {/* Header & 3 KPI Blocks */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-[#0070ba]">
            Refunds List
          </h2>

          {/* 3 KPI Metric Blocks on the right */}
          <div className="flex items-center space-x-1.5">
            {/* Balance */}
            <div className="border border-slate-300 rounded overflow-hidden text-center min-w-[75px]">
              <div className="bg-white px-2.5 py-0.5 text-[10.5px] font-medium text-slate-500 border-b border-slate-300">
                Balance
              </div>
              <div className="bg-[#002d5b] text-white px-2.5 py-1 font-semibold font-mono text-xs">
                {balance.toFixed(2)}
              </div>
            </div>

            {/* Paid */}
            <div className="border border-slate-300 rounded overflow-hidden text-center min-w-[75px]">
              <div className="bg-white px-2.5 py-0.5 text-[10.5px] font-medium text-slate-500 border-b border-slate-300">
                Paid
              </div>
              <div className="bg-[#002d5b] text-white px-2.5 py-1 font-semibold font-mono text-xs">
                {paidAmount.toFixed(2)}
              </div>
            </div>

            {/* Total */}
            <div className="border border-slate-300 rounded overflow-hidden text-center min-w-[75px]">
              <div className="bg-white px-2.5 py-0.5 text-[10.5px] font-medium text-slate-500 border-b border-slate-300">
                Total
              </div>
              <div className="bg-[#002d5b] text-white px-2.5 py-1 font-semibold font-mono text-xs">
                {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* 9-Column Refunds Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto min-h-[140px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-3.5 py-2">Refund Date</th>
                <th className="px-3.5 py-2">Account</th>
                <th className="px-3.5 py-2 text-right">Net Amount</th>
                <th className="px-3.5 py-2 text-center">WHT(Amount)</th>
                <th className="px-3.5 py-2">Cheque Number</th>
                <th className="px-3.5 py-2">Cheque Date</th>
                <th className="px-3.5 py-2 text-right">Total Amount</th>
                <th className="px-3.5 py-2">Notes</th>
                <th className="px-3.5 py-2 text-center w-20">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    No refunds added yet. Use the form above to add a refund.
                  </td>
                </tr>
              ) : (
                refunds.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    {/* Refund Date */}
                    <td className="px-3.5 py-2.5 font-mono text-slate-700">
                      {r.refundDate}
                    </td>

                    {/* Account */}
                    <td className="px-3.5 py-2.5 font-medium text-slate-800">
                      {r.paymentAccount}
                    </td>

                    {/* Net Amount */}
                    <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-900">
                      {(r.netAmount !== undefined ? r.netAmount : r.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* WHT(Amount) */}
                    <td className="px-3.5 py-2.5 text-center font-mono text-slate-500">
                      {r.whtAmount !== undefined && r.whtAmount > 0 ? r.whtAmount.toFixed(2) : '-'}
                    </td>

                    {/* Cheque Number */}
                    <td className="px-3.5 py-2.5 font-mono text-slate-500">
                      {r.chequeNumber || '-'}
                    </td>

                    {/* Cheque Date */}
                    <td className="px-3.5 py-2.5 font-mono text-slate-500">
                      {r.chequeDate || '-'}
                    </td>

                    {/* Total Amount */}
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">
                      {r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Notes */}
                    <td className="px-3.5 py-2.5 text-slate-500">
                      {r.notes || '-'}
                    </td>

                    {/* Manage */}
                    <td className="px-3.5 py-2.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => alert(`Printing refund voucher for ${r.refundDate}`)}
                          className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition"
                          title="Print Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingDetails(true)}
                          className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition"
                          title="View Payment Details"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRefund(r.id)}
                          className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition"
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
