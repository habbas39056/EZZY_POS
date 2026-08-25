import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import type { BankAccount, BankTransaction } from '../../../types/bank';

interface BankTransactionsModalProps {
  bank: BankAccount;
  onClose: () => void;
}

export const BankTransactionsModal: React.FC<BankTransactionsModalProps> = ({
  bank,
  onClose
}) => {
  const [transactions] = useState<BankTransaction[]>([
    {
      id: 'tx_1',
      bankId: bank.id,
      date: '10-Aug-2026',
      description: 'Customer Payment Received - Arshad',
      referenceNo: 'REC-0091',
      receivedAmount: 250000.00,
      balance: 1212233.33,
      isReconciled: true
    },
    {
      id: 'tx_2',
      bankId: bank.id,
      date: '04-Aug-2026',
      description: 'Supplier Bill Payment - Ali Trade',
      referenceNo: 'PAY-0043',
      spentAmount: 612000.00,
      balance: 962233.33,
      isReconciled: true
    },
    {
      id: 'tx_3',
      bankId: bank.id,
      date: '28-Jul-2026',
      description: 'Office Rent & Utilities - Head Office',
      referenceNo: 'EXP-0082',
      spentAmount: 85000.00,
      balance: 1574233.33,
      isReconciled: false
    }
  ]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0070ba]">
              Account Transactions - {bank.bankName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Account Title: <strong>{bank.accountTitle}</strong> | Account No: <strong>{bank.accountNumber}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => alert('Exporting bank statement...')}
              className="px-3 py-1.5 bg-[#2e7d32] text-white font-bold rounded text-xs flex items-center gap-1 hover:bg-emerald-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Balance Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#001e3d] text-white rounded-lg p-4">
            <div className="text-[11px] text-slate-300 font-semibold uppercase">Statement Balance</div>
            <div className="text-xl font-bold font-mono mt-1">
              Rs {bank.statementBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#001e3d] text-white rounded-lg p-4">
            <div className="text-[11px] text-slate-300 font-semibold uppercase">Adwiselabs Balance</div>
            <div className="text-xl font-bold font-mono mt-1">
              Rs {bank.adwiselabsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#001e3d] text-white rounded-lg p-4">
            <div className="text-[11px] text-slate-300 font-semibold uppercase">Unreconciled Balance</div>
            <div className="text-xl font-bold font-mono mt-1">
              Rs {bank.unreconciledBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[100px]">Date</th>
                <th className="px-4 py-3 min-w-[180px]">Description</th>
                <th className="px-4 py-3 min-w-[120px]">Reference No</th>
                <th className="px-4 py-3 text-right min-w-[100px]">Spent</th>
                <th className="px-4 py-3 text-right min-w-[100px]">Received</th>
                <th className="px-4 py-3 text-right min-w-[120px]">Running Balance</th>
                <th className="px-4 py-3 text-center min-w-[90px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-slate-600">{tx.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{tx.description}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{tx.referenceNo || '-'}</td>
                  <td className="px-4 py-3 text-right font-mono text-rose-600 font-semibold">
                    {tx.spentAmount ? tx.spentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">
                    {tx.receivedAmount ? tx.receivedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                    {tx.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      tx.isReconciled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tx.isReconciled ? 'Reconciled' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
