import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Bill } from '../../../types/billing';

interface BillAdjustmentViewProps {
  bill: Bill;
  onCancel: () => void;
  onSuccess: (updatedBill: Bill) => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const DISCOUNT_ACCOUNTS = [
  'Select discount account',
  'Sales Discount',
  '40010 - Sales Discounts Allowed',
  '50010 - Purchase Discounts Received',
  '50020 - Supplier Rebates',
  '50030 - Purchase Returns & Allowances',
  '50099 - Miscellaneous Expense Adjustment'
];

export const BillAdjustmentView: React.FC<BillAdjustmentViewProps> = ({
  bill,
  onCancel,
  onSuccess,
  currencySymbol = 'Rs'
}) => {
  const [adjustmentAmount, setAdjustmentAmount] = useState<number | ''>('');
  const [selectedAccount, setSelectedAccount] = useState('Select discount account');
  const [reason, setReason] = useState('');

  const currentBalance = bill.balance ?? bill.grossTotal ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adjAmt = Number(adjustmentAmount) || 0;

    if (adjAmt <= 0) {
      alert('Please enter a valid adjustment amount greater than 0.');
      return;
    }

    if (adjAmt > currentBalance) {
      alert(`Adjustment amount cannot exceed current balance of ${currencySymbol} ${currentBalance.toLocaleString()}.`);
      return;
    }

    if (!selectedAccount || selectedAccount === 'Select discount account') {
      alert('Please select a discount account.');
      return;
    }

    if (!reason.trim()) {
      alert('Please enter reason/description for discount.');
      return;
    }

    const newBalance = Math.max(0, currentBalance - adjAmt);
    const updatedBill: Bill = {
      ...bill,
      balance: Number(newBalance.toFixed(2)),
      discount: (bill.discount || 0) + adjAmt,
      status: newBalance <= 0 ? 'Completed' : bill.status
    };

    // Save adjustment record
    const adjustmentRecord = {
      id: `adj_bill_${Date.now()}`,
      billId: bill.id,
      billNumber: bill.billNumber,
      supplierName: bill.supplierName,
      amount: adjAmt,
      account: selectedAccount,
      reason: reason.trim(),
      createdOn: new Date().toISOString()
    };

    try {
      const savedAdj = localStorage.getItem('adwiselabs_bill_adjustments');
      const adjList = savedAdj ? JSON.parse(savedAdj) : [];
      localStorage.setItem('adwiselabs_bill_adjustments', JSON.stringify([adjustmentRecord, ...adjList]));

      // Update in master bills
      const savedBills = localStorage.getItem('adwiselabs_bills');
      if (savedBills) {
        const billsList: Bill[] = JSON.parse(savedBills);
        const updatedList = billsList.map(b => b.id === updatedBill.id ? updatedBill : b);
        localStorage.setItem('adwiselabs_bills', JSON.stringify(updatedList));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Error saving bill adjustment:', err);
    }

    alert(`Adjustment of ${currencySymbol} ${adjAmt.toLocaleString()} applied successfully!`);
    onSuccess(updatedBill);
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none max-w-7xl mx-auto my-2">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
            title="Back to Bills"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-[#0070ba]">Bill Adjustment</h2>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold rounded text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-[#5dade2] hover:bg-[#3498db] text-white font-bold rounded text-xs transition shadow-xs cursor-pointer"
          >
            Apply Adjustment
          </button>
        </div>
      </div>

      {/* Bill Meta Card */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Bill No</span>
            <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{bill.billNumber}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Supplier</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{bill.supplierName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Bill Total</span>
            <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
              {(bill.grossTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Current Balance</span>
            <span className="font-extrabold text-[#001737] font-mono text-sm mt-0.5 block">
              {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Adjustment Form Fields */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Amount * */}
          <div className="md:col-span-4">
            <label className="block text-slate-700 font-medium mb-1.5 text-xs">
              Amount *
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              max={currentBalance}
              required
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono bg-white text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Maximum adjustment: {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Account * */}
          <div className="md:col-span-4">
            <label className="block text-slate-700 font-medium mb-1.5 text-xs">
              Account *
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {DISCOUNT_ACCOUNTS.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          {/* Reason/Description * */}
          <div className="md:col-span-4">
            <label className="block text-slate-700 font-medium mb-1.5 text-xs">
              Reason/Description *
            </label>
            <textarea
              rows={3}
              required
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for discount"
              className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 resize-none"
            />
            <div className="text-right text-[10px] text-slate-400 mt-0.5">
              {reason.length}/500
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
