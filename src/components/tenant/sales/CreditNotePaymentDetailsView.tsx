import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import type { CreditNote } from '../../../types/creditNote';

interface CreditNotePaymentDetailsViewProps {
  creditNote: CreditNote;
  onClose: () => void;
  onDeletePayment?: () => void;
}

export const CreditNotePaymentDetailsView: React.FC<CreditNotePaymentDetailsViewProps> = ({
  creditNote,
  onClose,
  onDeletePayment
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([creditNote.id]);

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds([creditNote.id]);
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* ======================================================== */}
      {/* 1. HEADER BAR WITH PRINT BUTTON (SCREENSHOT REPLICA)     */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-base font-bold text-[#0070ba]">
          Payment Details
        </h2>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. 3-COLUMN SUMMARY GRID (MATCHING SCREENSHOT)           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-2 border-b border-slate-100">
        {/* Column 1: Customer Name, Reference No, WithHolding Tax */}
        <div className="space-y-4">
          <div>
            <span className="block text-[11px] text-slate-400">Customer Name</span>
            <span className="text-sm font-bold text-slate-900">{creditNote.customerName || 'Haider'}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">Reference No</span>
            <span className="text-xs font-mono font-semibold text-slate-800">875</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">WithHolding Tax</span>
            <span className="text-xs text-slate-600">-</span>
          </div>
        </div>

        {/* Column 2: Refund Date, Notes */}
        <div className="space-y-4">
          <div>
            <span className="block text-[11px] text-slate-400">Refund Date</span>
            <span className="text-xs font-mono text-slate-800">08-Jun-2026</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">Notes</span>
            <span className="text-xs text-slate-600">-</span>
          </div>
        </div>

        {/* Column 3: Payment Account, Amount Received */}
        <div className="space-y-4">
          <div>
            <span className="block text-[11px] text-slate-400">Payment Account</span>
            <span className="text-xs font-medium text-slate-800">Cash In Hand</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">Amount Received</span>
            <span className="text-base font-extrabold font-mono text-slate-900">
              {creditNote.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '1000'}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. LINKED CREDIT NOTES SECTION (SCREENSHOT REPLICA)      */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-800">Linked Credit Notes</h3>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(creditNote.id)}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-2.5">Credit Note No</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5 text-right">Amount Paid</th>
                <th className="px-4 py-2.5 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr className="hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(creditNote.id)}
                    onChange={() => setSelectedIds(prev => prev.includes(creditNote.id) ? [] : [creditNote.id])}
                    className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                  />
                </td>
                <td className="px-4 py-3 font-mono font-semibold text-[#0070ba]">
                  {creditNote.creditNoteNumber || '00002'}
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">
                  {creditNote.date || '02-Jun-2025'}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                  {creditNote.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '1,000.00'}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                  {creditNote.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '1,000.00'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">
                  0.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. BOTTOM ACTION BUTTONS (MATCHING SCREENSHOT)           */}
      {/* ======================================================== */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to delete this payment record?')) {
              if (onDeletePayment) onDeletePayment();
              onClose();
            }
          }}
          className="px-4 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs transition"
        >
          Delete Payment
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
