import React, { useState } from 'react';
import { 
  HelpCircle, 
  Receipt, 
  CreditCard, 
  FileText, 
  ShoppingCart, 
  FileMinus, 
  Repeat, 
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import type { Contact } from '../../../types/contact';
import { DatePicker } from '../../common/DatePicker';

interface ContactPaymentViewProps {
  contact: Contact;
  type: 'make' | 'receive';
  onBack: () => void;
  onSave: (amount: number, details: any) => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const PAYMENT_ACCOUNTS = [
  'Cash In Hand',
  'Cash Register (Store)',
  'Petty Cash',
  'Meezan bank - Main Operations',
  'Habib Bank Limited (HBL)',
  'Standard Chartered Bank',
  'Corporate Credit Card'
];

const WHT_OPTIONS = [
  { label: 'Select Withholding Tax', value: 0 },
  { label: 'WHT 1% (Goods - Filer)', value: 1 },
  { label: 'WHT 2% (Goods - Non-Filer)', value: 2 },
  { label: 'WHT 3% (Services - Filer)', value: 3 },
  { label: 'WHT 5% (Standard WHT)', value: 5 },
  { label: 'WHT 10% (Services - Non-Filer)', value: 10 }
];

export const ContactPaymentView: React.FC<ContactPaymentViewProps> = ({
  contact,
  type,
  onBack,
  onSave
}) => {
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isSupplier = type === 'make';

  // Form State
  const [paymentDate, setPaymentDate] = useState(getTodayFormatted());
  const [referenceNo, setReferenceNo] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('Cash In Hand');
  const [whtRate, setWhtRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [paidAmount, setPaidAmount] = useState<string>('');

  // Sample Bills (for Supplier Payment) matching screenshot
  const [bills, setBills] = useState([
    {
      id: 'bill_04',
      billNo: '04',
      date: '15-Aug-2026',
      total: 2000000.0,
      tax: 0.0,
      balance: 2000000.0,
      amountToPay: 0.0,
      selected: false
    }
  ]);

  // Sample Invoices (for Customer Payment)
  const [invoices, setInvoices] = useState([
    {
      id: 'inv_01',
      invNo: 'INV-0042',
      date: '15-Aug-2026',
      total: 500000.0,
      tax: 0.0,
      balance: 500000.0,
      amountToReceive: 0.0,
      selected: false
    }
  ]);

  const totalOutstanding = isSupplier 
    ? (contact.payables || 2000000.0) 
    : (contact.receivables || 500000.0);

  // Toggle single bill selection
  const handleToggleBill = (index: number) => {
    const updated = [...bills];
    const item = updated[index];
    item.selected = !item.selected;
    if (item.selected) {
      item.amountToPay = item.balance;
    } else {
      item.amountToPay = 0;
    }
    setBills(updated);

    const sum = updated.filter(b => b.selected).reduce((acc, b) => acc + b.amountToPay, 0);
    setPaidAmount(sum > 0 ? String(sum) : '');
  };

  // Toggle all bills
  const handleToggleAllBills = () => {
    const allSelected = bills.every(b => b.selected);
    const updated = bills.map(b => ({
      ...b,
      selected: !allSelected,
      amountToPay: !allSelected ? b.balance : 0
    }));
    setBills(updated);

    const sum = updated.filter(b => b.selected).reduce((acc, b) => acc + b.amountToPay, 0);
    setPaidAmount(sum > 0 ? String(sum) : '');
  };

  // Change amount to paid on a bill
  const handleBillAmountChange = (index: number, val: number) => {
    const updated = [...bills];
    updated[index].amountToPay = val;
    if (val > 0 && !updated[index].selected) {
      updated[index].selected = true;
    } else if (val <= 0) {
      updated[index].selected = false;
    }
    setBills(updated);

    const sum = updated.filter(b => b.selected).reduce((acc, b) => acc + b.amountToPay, 0);
    setPaidAmount(sum > 0 ? String(sum) : '');
  };

  // Toggle invoice for customer payment
  const handleToggleInvoice = (index: number) => {
    const updated = [...invoices];
    const item = updated[index];
    item.selected = !item.selected;
    if (item.selected) {
      item.amountToReceive = item.balance;
    } else {
      item.amountToReceive = 0;
    }
    setInvoices(updated);

    const sum = updated.filter(i => i.selected).reduce((acc, i) => acc + i.amountToReceive, 0);
    setPaidAmount(sum > 0 ? String(sum) : '');
  };

  const selectedBillsTotal = isSupplier
    ? bills.filter(b => b.selected).reduce((acc, b) => acc + b.amountToPay, 0)
    : invoices.filter(i => i.selected).reduce((acc, i) => acc + i.amountToReceive, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(paidAmount) || 0;
    if (finalAmount <= 0) {
      alert(isSupplier ? 'Please enter a valid Paid Amount.' : 'Please enter a valid Received Amount.');
      return;
    }

    onSave(finalAmount, {
      paymentDate,
      referenceNo,
      paymentAccount,
      whtRate,
      notes,
      isSupplier
    });

    alert(
      `${isSupplier ? 'Supplier Payment' : 'Customer Payment'} of Rs ${finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} recorded successfully!`
    );
    onBack();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f4f6f9] text-slate-800 font-sans text-xs pb-12">
      {/* 1. TOP MODULE NAVIGATION BAR (matching Screenshot) */}
      <div className="bg-[#e9ecef] border-b border-slate-300 px-4 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {isSupplier ? (
            <>
              <button onClick={onBack} className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs transition flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Billing</span>
              </button>
              <button onClick={onBack} className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs transition flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Expenses</span>
              </button>
              <button onClick={onBack} className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs transition flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                <span>Purchase Order</span>
              </button>
              <button onClick={onBack} className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs transition flex items-center gap-1">
                <FileMinus className="w-3.5 h-3.5 text-slate-500" />
                <span>Debit Notes</span>
              </button>
              <button onClick={onBack} className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs transition flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-slate-500" />
                <span>Recurring Bills</span>
              </button>
              <button className="px-3 py-1 bg-[#002f5c] text-white text-xs font-semibold rounded shadow-2xs flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Make Payments</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={onBack} className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs transition flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Invoices</span>
              </button>
              <button onClick={onBack} className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-2xs transition flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Quotations</span>
              </button>
              <button className="px-3 py-1 bg-[#002f5c] text-white text-xs font-semibold rounded shadow-2xs flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Receive Payments</span>
              </button>
            </>
          )}
        </div>

        <button className="text-slate-500 hover:text-slate-800 transition" title="Help">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-[1550px] mx-auto px-4 pt-3 space-y-3">
        {/* 2. TITLE BAR (matching Screenshot) */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-2xs">
          <h1 className="text-base font-bold text-[#002f5c] tracking-tight">
            {isSupplier ? 'Supplier Payment' : 'Customer Payment'}
          </h1>
          <h2 className="text-sm font-bold text-[#002f5c] mt-0.5">
            {contact.name || 'Fahad'}
          </h2>
        </div>

        {/* 3. MAIN PAYMENT FORM CARD (matching Screenshot) */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-2xs">
          {/* Row 1: Payment Date, Reference No, Payment Account */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-slate-600 text-[11px] mb-1 font-medium">Payment Date *</label>
              <DatePicker value={paymentDate} onChange={setPaymentDate} />
            </div>

            <div>
              <label className="block text-slate-600 text-[11px] mb-1 font-medium">Reference No *</label>
              <input
                type="text"
                placeholder=""
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 text-[11px] mb-1 font-medium">Payment Account *</label>
              <select
                value={paymentAccount}
                onChange={(e) => setPaymentAccount(e.target.value)}
                className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] bg-white text-slate-800"
              >
                {PAYMENT_ACCOUNTS.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Withholding Tax, Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            <div>
              <label className="block text-slate-600 text-[11px] mb-1 font-medium">Withholding Tax</label>
              <select
                value={whtRate}
                onChange={(e) => setWhtRate(Number(e.target.value))}
                className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] bg-white text-slate-800"
              >
                {WHT_OPTIONS.map(w => (
                  <option key={w.label} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 text-[11px] mb-1 font-medium">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder=""
                className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] bg-white resize-y"
              />
            </div>
          </div>

          {/* Row 3: Total Outstanding, Selected Bills Total, Paid Amount *, Action Button */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
            <div className="sm:col-span-3">
              <label className="block text-slate-600 text-[11px] mb-1 font-medium">Total Outstanding</label>
              <input
                type="text"
                readOnly
                value={totalOutstanding.toFixed(2)}
                className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-slate-50 font-mono text-slate-800 font-bold"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-slate-600 text-[11px] mb-1 font-medium">
                {isSupplier ? 'Selected Bills Total' : 'Selected Invoices Total'}
              </label>
              <input
                type="text"
                readOnly
                value={selectedBillsTotal.toFixed(2)}
                className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-slate-50 font-mono text-slate-800 font-bold"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-slate-600 text-[11px] mb-1 font-medium">
                {isSupplier ? 'Paid Amount *' : 'Received Amount *'}
              </label>
              <input
                type="number"
                step="any"
                required
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0070ba] font-mono font-bold bg-white text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full px-4 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded text-xs shadow-xs transition cursor-pointer"
              >
                {isSupplier ? 'Make Payment' : 'Receive Payment'}
              </button>
            </div>
          </div>

          {/* 4. BILLS / INVOICES TABLE SECTION (matching Screenshot) */}
          <div className="pt-3">
            {/* Ribbon Header */}
            <div className="bg-[#002f5c] text-white px-3 py-1.5 font-bold text-xs rounded-t">
              {isSupplier ? `Bills (${bills.length})` : `Invoices (${invoices.length})`}
            </div>

            {/* Table */}
            <div className="border border-slate-300 border-t-0 rounded-b overflow-x-auto bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isSupplier ? bills.every(b => b.selected) : invoices.every(i => i.selected)}
                        onChange={isSupplier ? handleToggleAllBills : () => {}}
                        className="w-3.5 h-3.5 text-[#0070ba] border-slate-300 rounded"
                      />
                    </th>
                    <th className="px-4 py-2 font-semibold">{isSupplier ? 'Bill No' : 'Invoice No'}</th>
                    <th className="px-4 py-2 font-semibold">Date</th>
                    <th className="px-4 py-2 text-right font-semibold">Total</th>
                    <th className="px-4 py-2 text-right font-semibold">Tax</th>
                    <th className="px-4 py-2 text-right font-semibold">Balance</th>
                    <th className="px-4 py-2 text-right font-semibold">
                      {isSupplier ? 'Amount to Paid' : 'Amount to Receive'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {isSupplier ? (
                    bills.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={b.selected}
                            onChange={() => handleToggleBill(idx)}
                            className="w-3.5 h-3.5 text-[#0070ba] border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-2 font-mono font-bold text-[#0070ba]">{b.billNo}</td>
                        <td className="px-4 py-2">{b.date}</td>
                        <td className="px-4 py-2 text-right font-mono">{b.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-right font-mono">{b.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-slate-800">{b.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-right font-mono">
                          <input
                            type="number"
                            step="any"
                            value={b.amountToPay || ''}
                            onChange={(e) => handleBillAmountChange(idx, Number(e.target.value))}
                            placeholder="0.00"
                            className="w-28 px-2 py-0.5 border border-slate-300 rounded text-right text-xs font-mono font-bold"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    invoices.map((inv, idx) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={inv.selected}
                            onChange={() => handleToggleInvoice(idx)}
                            className="w-3.5 h-3.5 text-[#0070ba] border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-2 font-mono font-bold text-[#0070ba]">{inv.invNo}</td>
                        <td className="px-4 py-2">{inv.date}</td>
                        <td className="px-4 py-2 text-right font-mono">{inv.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-right font-mono">{inv.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-slate-800">{inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-right font-mono">
                          <input
                            type="number"
                            step="any"
                            value={inv.amountToReceive || ''}
                            onChange={(e) => {
                              const updated = [...invoices];
                              updated[idx].amountToReceive = Number(e.target.value);
                              setInvoices(updated);
                            }}
                            placeholder="0.00"
                            className="w-28 px-2 py-0.5 border border-slate-300 rounded text-right text-xs font-mono font-bold"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
