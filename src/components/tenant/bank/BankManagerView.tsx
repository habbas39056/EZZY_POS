import React, { useState } from 'react';
import { Landmark, HelpCircle } from 'lucide-react';
import { BankListView } from './BankListView';
import { NewBankView } from './NewBankView';
import type { BankAccount } from '../../../types/bank';
import { INITIAL_BANKS } from '../../../types/bank';
import { api } from '../../../services/api';

export const BankManagerView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'new' | 'edit'>('list');
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);

  const handleSaveBank = (bank: BankAccount) => {
    const saved = localStorage.getItem('adwiselabs_bank_accounts');
    const list: BankAccount[] = saved ? JSON.parse(saved) : INITIAL_BANKS;
    const existingIndex = list.findIndex(b => b.id === bank.id);

    if (existingIndex >= 0) {
      list[existingIndex] = bank;
    } else {
      list.unshift(bank);
    }

    localStorage.setItem('adwiselabs_bank_accounts', JSON.stringify(list));
    api.saveBankAccount(bank).catch(() => {});
    setViewMode('list');
    setEditingBank(null);
  };

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* Top Horizontal Tab matching Screenshot 1 */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            onClick={() => { setViewMode('list'); setEditingBank(null); }}
            className="px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs"
          >
            <Landmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Bank</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <BankListView
          onOpenNewBank={() => { setEditingBank(null); setViewMode('new'); }}
          onEditBank={(bank) => { setEditingBank(bank); setViewMode('edit'); }}
        />
      ) : (
        <NewBankView
          initialBank={editingBank}
          onSaveBank={handleSaveBank}
          onCancel={() => { setViewMode('list'); setEditingBank(null); }}
        />
      )}
    </div>
  );
};
