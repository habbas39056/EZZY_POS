import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RotateCcw, 
  FileText, 
  Pencil, 
  Plug, 
  Trash2 
} from 'lucide-react';
import type { BankAccount } from '../../../types/bank';
import { INITIAL_BANKS } from '../../../types/bank';
import { BankTransactionsModal } from './BankTransactionsModal';
import { BankReconcileModal } from './BankReconcileModal';
import { api } from '../../../services/api';

interface BankListViewProps {
  onOpenNewBank: () => void;
  onEditBank: (bank: BankAccount) => void;
}

export const BankListView: React.FC<BankListViewProps> = ({
  onOpenNewBank,
  onEditBank
}) => {
  const [banks, setBanks] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('adwiselabs_bank_accounts');
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  useEffect(() => {
    const load = async () => {
      try {
        const remote = await api.getBankAccounts();
        if (remote && Array.isArray(remote) && remote.length > 0) {
          setBanks(remote);
          localStorage.setItem('adwiselabs_bank_accounts', JSON.stringify(remote));
        }
      } catch (e) {}
    };
    load();
  }, []);

  const [activeTransactionBank, setActiveTransactionBank] = useState<BankAccount | null>(null);
  const [activeReconcileBank, setActiveReconcileBank] = useState<BankAccount | null>(null);

  const saveBanks = (data: BankAccount[]) => {
    setBanks(data);
    localStorage.setItem('adwiselabs_bank_accounts', JSON.stringify(data));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      saveBanks(banks.filter(b => b.id !== id));
      api.deleteBankAccount(id).catch(() => {});
    }
  };

  const handleToggleShowOnInvoices = (id: string) => {
    const updated = banks.map(b => b.id === id ? { ...b, showOnInvoices: !b.showOnInvoices } : b);
    saveBanks(updated);
  };

  const formatBalance = (val?: number | null) => {
    const num = typeof val === 'number' && !isNaN(val) ? val : (Number(val) || 0);
    if (num < 0) {
      return `(${Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2 })})`;
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 font-sans text-xs text-slate-700 select-none max-w-7xl mx-auto my-3">
      {/* ======================================================== */}
      {/* 1. TOP HEADER (MATCHING SCREENSHOT 1)                    */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#0070ba]">
          Banks
        </h2>

        <button
          onClick={onOpenNewBank}
          className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-2xs transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-[#0070ba]" />
          <span>Bank</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. BANK CARDS LIST (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="space-y-6">
        {banks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            No bank accounts configured yet. Click <strong>+ Bank</strong> to connect or add an account.
          </div>
        ) : (
          banks.map(bank => (
            <div
              key={bank.id}
              className="bg-[#f8fafc] border border-slate-200 rounded-lg p-8 shadow-xs relative hover:border-slate-300 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Left Side: Bank Details matching Screenshot 1 */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {bank.bankName}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div>
                      <span>Account Title : </span>
                      <strong className="text-slate-900">{bank.accountTitle}</strong>
                    </div>

                    <div>
                      <span>Statement Balance : </span>
                      <strong className="text-slate-900 font-mono">{formatBalance(bank.statementBalance)}</strong>
                    </div>

                    <div>
                      <span>Adwiselabs Balance : </span>
                      <strong className="text-slate-900 font-mono">{formatBalance(bank.adwiselabsBalance)}</strong>
                    </div>

                    <div>
                      <span>Unreconciled Balance : </span>
                      <strong className="text-slate-900 font-mono">{formatBalance(bank.unreconciledBalance)}</strong>
                    </div>

                    <div>
                      <span>Unreconciled Transactions : </span>
                      <strong className="text-slate-900 font-mono">{bank.unreconciledTransactionsCount || 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Right Side: 5 Action Buttons Stack matching Screenshot 1 */}
                <div className="flex flex-col space-y-2 w-full lg:w-56 shrink-0">
                  {/* 1. Reconcile */}
                  <button
                    onClick={() => setActiveReconcileBank(bank)}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Reconcile</span>
                  </button>

                  {/* 2. Account Transactions */}
                  <button
                    onClick={() => setActiveTransactionBank(bank)}
                    className="w-full py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Account Transactions</span>
                  </button>

                  {/* 3. Update */}
                  <button
                    onClick={() => onEditBank(bank)}
                    className="w-full py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Update</span>
                  </button>

                  {/* 4. Connect */}
                  <button
                    onClick={() => alert(`Connect bank feed for ${bank.bankName}`)}
                    className="w-full py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Plug className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>

                  {/* 5. Delete */}
                  <button
                    onClick={() => handleDelete(bank.id)}
                    className="w-full py-2 bg-[#ff5722] hover:bg-orange-600 text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Bottom Right Checkbox matching Screenshot 1 */}
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex justify-end">
                <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={bank.showOnInvoices}
                    onChange={() => handleToggleShowOnInvoices(bank.id)}
                    className="w-4 h-4 text-[#0070ba] rounded border-slate-300"
                  />
                  <span>Show bank information on invoices</span>
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {activeTransactionBank && (
        <BankTransactionsModal
          bank={activeTransactionBank}
          onClose={() => setActiveTransactionBank(null)}
        />
      )}

      {activeReconcileBank && (
        <BankReconcileModal
          bank={activeReconcileBank}
          onClose={() => setActiveReconcileBank(null)}
        />
      )}
    </div>
  );
};
