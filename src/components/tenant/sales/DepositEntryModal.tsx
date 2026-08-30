import React, { useState, useEffect } from 'react';
import { ChevronUp, Info } from 'lucide-react';
import { DatePicker } from '../../common/DatePicker';
import type { Contact } from '../../../types/contact';
import type { DepositRow } from '../../../types/customerPayment';
import type { Invoice } from '../../../types/sales';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_INVOICES } from '../../../types/sales';
import { api } from '../../../services/api';

interface DepositEntryModalProps {
  onClose: () => void;
  onSaveDeposit: (rows: DepositRow[]) => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const RECOVERY_PERSONS = [
  'Select Recovery Person',
  'Muhammad Usman',
  'Ali Raza',
  'Hamza Tariq',
  'Khurshid Ahmed'
];

const PAYMENT_ACCOUNTS = [
  'Cash In Hand',
  'Cash Register (Store)',
  'Meezan Bank - Main Operations',
  'HBL - Corporate Account'
];

const WHT_RATES = [
  { label: 'Select WHT Tax', value: 0 },
  { label: 'WHT 1%', value: 1 },
  { label: 'WHT 2%', value: 2 },
  { label: 'WHT 5%', value: 5 }
];

export const DepositEntryModal: React.FC<DepositEntryModalProps> = ({
  onClose,
  onSaveDeposit
}) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('adwiselabs_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const remoteContacts = await api.getContacts();
        if (remoteContacts && Array.isArray(remoteContacts) && remoteContacts.length > 0) {
          setContacts(remoteContacts);
          localStorage.setItem('adwiselabs_contacts', JSON.stringify(remoteContacts));
        }
      } catch (e) {}

      try {
        const remoteInvoices = await api.getInvoices();
        if (remoteInvoices && Array.isArray(remoteInvoices) && remoteInvoices.length > 0) {
          setInvoices(remoteInvoices);
          localStorage.setItem('adwiselabs_invoices', JSON.stringify(remoteInvoices));
        }
      } catch (e) {}
    };
    loadData();
  }, []);

  const [recoveryPerson, setRecoveryPerson] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('Cash In Hand');
  const [whtTax, setWhtTax] = useState(0);

  const [rows, setRows] = useState<DepositRow[]>([
    {
      id: 'dep_1',
      customerId: '',
      customerName: '',
      paymentAccount: 'Cash In Hand',
      chequeNo: '',
      chequeDate: '',
      referenceNo: '',
      balance: 0,
      cashReceived: 0,
      remainingBalance: 0,
      whtTax: 0,
      notes: ''
    }
  ]);

  const handleRowChange = (index: number, field: keyof DepositRow, value: any) => {
    const updated = [...rows];
    const row = { ...updated[index], [field]: value };

    if (field === 'customerId') {
      const c = contacts.find(item => item.id === value);
      if (c) {
        row.customerName = c.name;
        // Compute customer's real outstanding balance from invoices
        const customerInvs = invoices.filter(inv => {
          const isMatch = inv.customerId === c.id ||
            (inv.customerName && (
              inv.customerName.trim().toLowerCase() === c.name.trim().toLowerCase() ||
              (c.businessName && inv.customerName.trim().toLowerCase() === c.businessName.trim().toLowerCase())
            ));
          const bal = inv.balance !== undefined ? inv.balance : inv.grossTotal;
          return isMatch && bal > 0;
        });

        const totalUnpaid = customerInvs.reduce(
          (sum, inv) => sum + (Number(inv.balance !== undefined ? inv.balance : inv.grossTotal) || 0),
          0
        );

        const contactRec = Number(c.receivables) || (c.openingBalanceType === 'debit' ? Number(c.openingBalance) || 0 : 0);
        const realBal = totalUnpaid > 0 ? totalUnpaid : contactRec;

        row.balance = realBal;
        row.remainingBalance = Math.max(0, realBal - (Number(row.cashReceived) || 0));
      } else {
        row.customerName = '';
        row.balance = 0;
        row.remainingBalance = 0;
      }
    }

    if (field === 'cashReceived') {
      const received = Number(value) || 0;
      row.remainingBalance = Math.max(0, row.balance - received);
    }

    updated[index] = row;
    setRows(updated);
  };

  const totalReceivable = rows.reduce((acc, r) => acc + (Number(r.balance) || 0), 0);
  const totalCashReceived = rows.reduce((acc, r) => acc + (Number(r.cashReceived) || 0), 0);
  const totalRemaining = Math.max(0, totalReceivable - totalCashReceived);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = rows.filter(r => r.customerId && r.cashReceived > 0);
    if (valid.length === 0) {
      alert('Please select a customer and specify cash received.');
      return;
    }
    onSaveDeposit(valid);
    alert(`Deposit of ${totalCashReceived.toLocaleString()} received successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[94vh] overflow-y-auto p-6 space-y-4 animate-in fade-in zoom-in duration-150 relative">
        {/* Top Esc Close Button matching Screenshot */}
        <button
          onClick={onClose}
          className="absolute right-6 top-4 flex flex-col items-center text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronUp className="w-4 h-4" />
          <span className="text-[9px] font-semibold text-slate-400 -mt-0.5">esc</span>
        </button>

        {/* Title */}
        <h2 className="text-base font-bold text-[#0070ba] pb-2 border-b border-slate-200">
          Deposit Entry
        </h2>

        {/* Notice Strip matching Screenshot */}
        <div className="p-2 bg-[#f0f4f9] text-[#0070ba] text-[11px] flex items-center gap-2 rounded">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Select Recovery Person, Payment Date and Payment Account — these will apply to all rows below.</span>
        </div>

        {/* Top Form Controls + KPI Mini Box matching Screenshot */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
              {/* Recovery Person * */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                  Recovery Person *
                </label>
                <select
                  value={recoveryPerson}
                  onChange={(e) => setRecoveryPerson(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
                >
                  {RECOVERY_PERSONS.map(rp => (
                    <option key={rp} value={rp}>{rp}</option>
                  ))}
                </select>
              </div>

              {/* Payment Date * */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                  Payment Date *
                </label>
                <DatePicker
                  value={paymentDate}
                  onChange={setPaymentDate}
                />
              </div>

              {/* Payment Account * */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                  Payment Account *
                </label>
                <select
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
                >
                  {PAYMENT_ACCOUNTS.map(pa => (
                    <option key={pa} value={pa}>{pa}</option>
                  ))}
                </select>
              </div>

              {/* WHT Tax */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                  WHT Tax
                </label>
                <select
                  value={whtTax}
                  onChange={(e) => setWhtTax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
                >
                  {WHT_RATES.map(w => (
                    <option key={w.label} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* KPI Mini Box matching Screenshot */}
            <div className="border border-slate-200 bg-white rounded flex items-center shrink-0 text-center text-xs divide-x divide-slate-200 shadow-2xs">
              <div className="px-4 py-1.5">
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider">TOTAL RECEIVABLE</div>
                <div className="text-xs font-extrabold font-mono text-[#0070ba] mt-0.5">
                  {totalReceivable.toFixed(2)}
                </div>
              </div>
              <div className="px-4 py-1.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider">CASH RECEIVED</div>
                <div className="text-xs font-extrabold font-mono text-emerald-600 mt-0.5">
                  {totalCashReceived.toFixed(2)}
                </div>
              </div>
              <div className="px-4 py-1.5">
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider">REMAINING</div>
                <div className="text-xs font-extrabold font-mono text-slate-800 mt-0.5">
                  {totalRemaining.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Multi-row Table matching Screenshot */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="px-3 py-2 min-w-[140px]">Customer</th>
                  <th className="px-3 py-2 min-w-[130px]">Payment Account</th>
                  <th className="px-2.5 py-2 w-24">Cheque #</th>
                  <th className="px-2.5 py-2 w-32">Cheque Date</th>
                  <th className="px-2.5 py-2 w-28">Reference No</th>
                  <th className="px-2.5 py-2 w-20 text-right">Balance</th>
                  <th className="px-2.5 py-2 w-24 text-right">Cash Received</th>
                  <th className="px-2.5 py-2 w-24 text-right">Remaining Balance</th>
                  <th className="px-2.5 py-2 w-20">WHT Tax</th>
                  <th className="px-3 py-2 min-w-[120px]">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {rows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    {/* Customer */}
                    <td className="p-1">
                      <select
                        value={r.customerId}
                        onChange={(e) => handleRowChange(idx, 'customerId', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                      >
                        <option value=""></option>
                        {contacts.filter(c => !c.type || c.type === 'customer' || c.type === 'both').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Payment Account */}
                    <td className="p-1">
                      <select
                        value={r.paymentAccount}
                        onChange={(e) => handleRowChange(idx, 'paymentAccount', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                      >
                        {PAYMENT_ACCOUNTS.map(pa => (
                          <option key={pa} value={pa}>{pa}</option>
                        ))}
                      </select>
                    </td>

                    {/* Cheque # */}
                    <td className="p-1">
                      <input
                        type="text"
                        value={r.chequeNo}
                        onChange={(e) => handleRowChange(idx, 'chequeNo', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                    </td>

                    {/* Cheque Date */}
                    <td className="p-1">
                      <DatePicker
                        value={r.chequeDate}
                        onChange={(val) => handleRowChange(idx, 'chequeDate', val)}
                        className="py-1 px-2 font-mono text-[11px]"
                      />
                    </td>

                    {/* Reference No */}
                    <td className="p-1">
                      <input
                        type="text"
                        value={r.referenceNo}
                        onChange={(e) => handleRowChange(idx, 'referenceNo', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                    </td>

                    {/* Balance */}
                    <td className="px-2.5 py-1 text-right font-mono text-slate-800">
                      {r.balance}
                    </td>

                    {/* Cash Received */}
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        value={r.cashReceived || ''}
                        onChange={(e) => handleRowChange(idx, 'cashReceived', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-right font-mono font-bold text-slate-900 text-xs"
                      />
                    </td>

                    {/* Remaining Balance */}
                    <td className="px-2.5 py-1 text-right font-mono text-slate-800">
                      {r.remainingBalance}
                    </td>

                    {/* WHT Tax */}
                    <td className="p-1">
                      <select
                        value={r.whtTax}
                        onChange={(e) => handleRowChange(idx, 'whtTax', Number(e.target.value))}
                        className="w-full px-1 py-1 border border-slate-300 rounded text-xs bg-white"
                      >
                        {WHT_RATES.map(w => (
                          <option key={w.label} value={w.value}>{w.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Notes */}
                    <td className="p-1">
                      <input
                        type="text"
                        value={r.notes}
                        onChange={(e) => handleRowChange(idx, 'notes', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Buttons matching Screenshot */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded shadow-xs text-xs transition"
            >
              Receive Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

