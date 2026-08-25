import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import type { CreditNote, CreditNoteRefundRecord } from '../../../types/creditNote';
import { DatePicker } from '../../common/DatePicker';

interface AddCreditNoteRefundModalProps {
  creditNote: CreditNote;
  currencySymbol?: string;
  onClose: () => void;
  onSaveRefund: (updatedCN: CreditNote) => void;
}

const PAYMENT_ACCOUNTS = [
  'Cash In Hand',
  'Main Operating Account',
  'Bank Account - Meezan Bank',
  'Bank Account - HBL',
  'Petty Cash'
];

export const AddCreditNoteRefundModal: React.FC<AddCreditNoteRefundModalProps> = ({
  creditNote,
  currencySymbol = 'Rs',
  onClose,
  onSaveRefund
}) => {
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [amount, setAmount] = useState<number>(creditNote.balance > 0 ? creditNote.balance : creditNote.grossTotal);
  const [refundDate, setRefundDate] = useState<string>(getTodayFormatted());
  const [paymentAccount, setPaymentAccount] = useState<string>('Cash In Hand');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const remainingBalance = creditNote.balance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refundAmount = Number(amount);

    if (isNaN(refundAmount) || refundAmount <= 0) {
      setError('Please enter a valid refund amount greater than 0.');
      return;
    }

    if (refundAmount > remainingBalance) {
      setError(`Refund amount cannot exceed remaining balance of ${currencySymbol} ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }

    const newRefundRecord: CreditNoteRefundRecord = {
      id: `ref_${Date.now()}`,
      paymentAccount,
      amount: refundAmount,
      refundDate,
      referenceNo: referenceNo.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const updatedRefunds = [...(creditNote.refunds || []), newRefundRecord];
    const newBalance = Math.max(0, Number((remainingBalance - refundAmount).toFixed(2)));
    const newStatus = newBalance === 0 ? 'Refunded' : 'Partially Refunded';

    const updatedCreditNote: CreditNote = {
      ...creditNote,
      balance: newBalance,
      status: newStatus,
      refunds: updatedRefunds
    };

    onSaveRefund(updatedCreditNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs text-slate-700 font-sans">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0070ba]" />
            <h3 className="text-sm font-bold text-slate-800">
              Add Refund - Credit Note #{creditNote.creditNoteNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Details */}
        <div className="px-5 py-3 bg-sky-50/60 border-b border-sky-100 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div>
            <span className="block text-slate-500">Customer</span>
            <span className="font-semibold text-slate-800 truncate block">{creditNote.customerName}</span>
          </div>
          <div>
            <span className="block text-slate-500">Total Amount</span>
            <span className="font-mono font-bold text-slate-900">
              {currencySymbol} {creditNote.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="block text-slate-500">Remaining Balance</span>
            <span className="font-mono font-bold text-emerald-700">
              {currencySymbol} {remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-[11px] font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Refund Amount */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                Refund Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                max={remainingBalance}
                step="any"
                required
                value={amount || ''}
                onChange={(e) => {
                  setError('');
                  setAmount(parseFloat(e.target.value) || 0);
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0070ba] bg-white text-xs"
              />
            </div>

            {/* Refund Date */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                Refund Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={refundDate}
                onChange={setRefundDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Payment Account */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                Payment Account <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentAccount}
                onChange={(e) => setPaymentAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#0070ba] bg-white text-xs"
              >
                {PAYMENT_ACCOUNTS.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>

            {/* Reference No */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                Reference No.
              </label>
              <input
                type="text"
                placeholder="e.g. REF-0091"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
              Notes / Remarks
            </label>
            <input
              type="text"
              placeholder="Reason for refund or transaction notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs transition text-xs flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Save Refund</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
