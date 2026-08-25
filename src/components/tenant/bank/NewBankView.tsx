import React, { useState } from 'react';
import { Landmark, ArrowLeft } from 'lucide-react';
import type { BankAccount } from '../../../types/bank';

interface NewBankViewProps {
  onSaveBank: (bank: BankAccount) => void;
  onCancel: () => void;
  initialBank?: BankAccount | null;
}

export const NewBankView: React.FC<NewBankViewProps> = ({
  onSaveBank,
  onCancel,
  initialBank
}) => {
  // Step 1 = Choice (Screenshot 2), Step 2 = Form (Screenshot 3)
  const [step, setStep] = useState<1 | 2>(initialBank ? 2 : 1);

  const [bankName, setBankName] = useState(initialBank?.bankName || '');
  const [accountTitle, setAccountTitle] = useState(initialBank?.accountTitle || '');
  const [accountNumber, setAccountNumber] = useState(initialBank?.accountNumber || '');
  const [iban, setIban] = useState(initialBank?.iban || '');
  const [isActive, setIsActive] = useState(initialBank?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) {
      alert('Please enter Bank Name.');
      return;
    }
    if (!accountTitle.trim()) {
      alert('Please enter Account Title.');
      return;
    }
    if (!accountNumber.trim()) {
      alert('Please enter Account Number.');
      return;
    }

    const newBank: BankAccount = {
      id: initialBank ? initialBank.id : `bank_${Date.now()}`,
      bankName: bankName.trim(),
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      iban: iban.trim(),
      isActive,
      showOnInvoices: initialBank ? initialBank.showOnInvoices : false,
      statementBalance: initialBank ? initialBank.statementBalance : 0.00,
      adwiselabsBalance: initialBank ? initialBank.adwiselabsBalance : 0.00,
      unreconciledBalance: initialBank ? initialBank.unreconciledBalance : 0.00,
      unreconciledTransactionsCount: initialBank ? initialBank.unreconciledTransactionsCount : 0,
      createdAt: initialBank ? initialBank.createdAt : new Date().toISOString()
    };

    onSaveBank(newBank);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 max-w-5xl mx-auto my-4 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header matching Screenshot 2 & 3 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-[#0070ba]">
          New Bank
        </h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Banks
        </button>
      </div>

      {step === 1 ? (
        /* ======================================================== */
        /* STEP 1: CHOICE CARD (MATCHING SCREENSHOT 2)              */
        /* ======================================================== */
        <div className="space-y-6 pt-4 max-w-xl">
          <h3 className="text-lg font-bold text-slate-800">
            What would you like to add?
          </h3>

          <div
            onClick={() => setStep(2)}
            className="p-6 rounded-2xl border-2 border-slate-200 hover:border-[#0070ba] hover:shadow-md cursor-pointer transition flex flex-col space-y-3 bg-white group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0070ba] flex items-center justify-center border border-sky-100 group-hover:scale-105 transition">
              <Landmark className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-[#0070ba] transition">
                Bank Account
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Connect a real bank account for automatic transaction feeds
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* STEP 2: FORM (MATCHING SCREENSHOT 3)                     */
        /* ======================================================== */
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Top Row: Bank *, Account Title *, Account No. * */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs">
                Bank *
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Mcb Bank, Meezan Bank"
                className="w-full px-3 py-2 border-2 border-sky-400 rounded-md focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs">
                Account Title*
              </label>
              <input
                type="text"
                required
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                placeholder="e.g. ALi Trade"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs">
                Account No. *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 10982348123"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Second Row: IBAN *, Active */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs">
                IBAN *
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="e.g. PK36MCB0010982348123"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-mono"
              />
            </div>

            <div className="pt-6">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-800 font-bold text-xs">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#0070ba] rounded border-slate-300"
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          {/* Bottom Actions matching Screenshot 3 */}
          <div className="pt-6 border-t border-slate-100 flex items-center space-x-3">
            <button
              type="submit"
              className="px-6 py-2 bg-[#70b0ea] hover:bg-sky-600 text-white font-bold rounded shadow-xs text-xs transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
