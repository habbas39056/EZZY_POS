import React, { useState } from 'react';
import { X, CheckCircle, RotateCcw } from 'lucide-react';
import type { BankAccount } from '../../../types/bank';

interface BankReconcileModalProps {
  bank: BankAccount;
  onClose: () => void;
}

export const BankReconcileModal: React.FC<BankReconcileModalProps> = ({
  bank,
  onClose
}) => {
  const [statementBalance, setStatementBalance] = useState(bank.statementBalance);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleReconcile = () => {
    setIsCompleted(true);
    setTimeout(() => {
      alert(`Bank account ${bank.bankName} reconciled successfully!`);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-6 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold text-[#0070ba] flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reconcile Account - {bank.bankName}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="block text-[11px] text-slate-500 font-semibold">Adwiselabs Ledger Balance</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                Rs {bank.adwiselabsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-500 font-semibold">Bank Statement Ending Balance</span>
              <input
                type="number"
                step="any"
                value={statementBalance}
                onChange={(e) => setStatementBalance(Number(e.target.value))}
                className="mt-1 px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 text-xs w-full bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-sky-50 rounded-lg border border-sky-100 text-xs text-sky-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#0070ba]" />
              Automated Rule Matching
            </div>
            <p>
              All matching payments and receipts in this period will be auto-cleared against your verified bank statement.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReconcile}
            disabled={isCompleted}
            className="px-5 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Complete Reconciliation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
