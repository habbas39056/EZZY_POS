import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Trash2 } from 'lucide-react';
import type { Bill } from '../../../types/billing';
import { DatePicker } from '../../common/DatePicker';
import { DocumentPrintPreviewModal } from '../common/DocumentPrintPreviewModal';
import type { Invoice, InvoiceItemRow } from '../../../types/sales';
import { api } from '../../../services/api';
interface ViewPaymentViewProps {
  bill: Bill;
  onBack: () => void;
  onUpdateBill?: (updatedBill: Bill) => void;
}

interface PaymentRecord {
  id: string;
  paymentDate: string;
  accountHead: string;
  netAmount: number;
  whtAmount: number;
  chequeNumber?: string;
  chequeDate?: string;
  totalAmount: number;
  notes?: string;
}

const ACCOUNT_OPTIONS = [
  'Select a Account',
  '10001 - Cash in Hand',
  '10002 - Primary Bank Account',
  '10003 - Pettty Cash',
  '20001 - Accounts Payable',
  '50001 - Operating Expenses'
];

const WHT_OPTIONS = [
  { label: 'Select a WithHolding Tax', percent: 0 },
  { label: '1% WHT on Supplies', percent: 1 },
  { label: '2% WHT on Contracts', percent: 2 },
  { label: '5% WHT on Services', percent: 5 },
  { label: '10% WHT General', percent: 10 }
];

export const ViewPaymentView: React.FC<ViewPaymentViewProps> = ({
  bill,
  onBack,
  onUpdateBill
}) => {
  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Payment Form State
  const [currentBill, setCurrentBill] = useState<Bill>(bill);
  const [amount, setAmount] = useState<number | ''>(bill.balance > 0 ? bill.balance : 0);
  const [paymentDate, setPaymentDate] = useState(getTodayFormatted());
  const [account, setAccount] = useState('10002 - Primary Bank Account');
  const [whtRate, setWhtRate] = useState(0);
  const [referenceNo, setReferenceNo] = useState(`REF-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('');
  const [printingPayment, setPrintingPayment] = useState<PaymentRecord | null>(null);

  // Payment Records List State
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const savedPayments = localStorage.getItem(`adwiselabs_bill_payments_${bill.id}`);
    if (savedPayments) {
      try {
        return JSON.parse(savedPayments);
      } catch (e) {
        // fallback
      }
    }
    const initialPaid = bill.grossTotal - bill.balance;
    if (initialPaid > 0) {
      return [
        {
          id: `pay_${bill.id}_1`,
          paymentDate: bill.issueDate || getTodayFormatted(),
          accountHead: '10002 - Primary Bank Account',
          netAmount: initialPaid,
          whtAmount: 0.00,
          chequeNumber: 'CHQ-98214',
          chequeDate: bill.issueDate || getTodayFormatted(),
          totalAmount: initialPaid,
          notes: 'Initial partial payment'
        }
      ];
    }
    return [];
  });

  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const currentBalance = Math.max(0, currentBill.grossTotal - totalPaid);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = Number(amount) || 0;
    if (payAmt <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }
    if (!account || account === 'Select a Account') {
      alert('Please select a payment Account.');
      return;
    }
    if (!referenceNo.trim()) {
      alert('Please enter a Reference Number.');
      return;
    }

    const whtAmt = (payAmt * whtRate) / 100;
    const netAmt = payAmt - whtAmt;

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      paymentDate,
      accountHead: account,
      netAmount: Number(netAmt.toFixed(2)),
      whtAmount: Number(whtAmt.toFixed(2)),
      chequeNumber: referenceNo.trim(),
      chequeDate: paymentDate,
      totalAmount: Number(payAmt.toFixed(2)),
      notes: notes.trim()
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    localStorage.setItem(`adwiselabs_bill_payments_${bill.id}`, JSON.stringify(updatedPayments));

    const newTotalPaid = updatedPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
    const newBalance = Math.max(0, currentBill.grossTotal - newTotalPaid);
    const updatedStatus = newBalance <= 0 ? 'Completed' : 'Make Payment';

    const updatedBill: Bill = {
      ...currentBill,
      balance: Number(newBalance.toFixed(2)),
      status: updatedStatus,
      isOverdue: false
    };

    setCurrentBill(updatedBill);

    // Save to master bills localStorage
    try {
      const savedBills = localStorage.getItem('adwiselabs_bills');
      if (savedBills) {
        const billsList: Bill[] = JSON.parse(savedBills);
        const newBills = billsList.map(b => b.id === updatedBill.id ? updatedBill : b);
        localStorage.setItem('adwiselabs_bills', JSON.stringify(newBills));
        window.dispatchEvent(new Event('storage'));
      }
      
      // Update Live Database automatically
      await api.saveBill(updatedBill);
      await api.saveSupplierPayment({
        id: newPayment.id,
        referenceNo: newPayment.chequeNumber || '',
        supplierId: updatedBill.supplierId || '',
        supplierName: updatedBill.supplierName,
        paymentDate: newPayment.paymentDate,
        paymentAccount: newPayment.accountHead,
        paymentAmount: newPayment.totalAmount,
        withholdingTax: newPayment.whtAmount,
        balance: newBalance,
        status: 'Applied',
        linkedBills: [updatedBill.id],
        notes: newPayment.notes
      });
    } catch (err) {
      console.error('Error updating live database or bill balance:', err);
    }

    if (onUpdateBill) {
      onUpdateBill(updatedBill);
    }

    // Reset Form
    setAmount(newBalance > 0 ? newBalance : '');
    setNotes('');
    alert(`Payment of Rs ${payAmt.toLocaleString()} added successfully!`);
  };

  const handleDeletePayment = async (payId: string) => {
    if (!confirm('Are you sure you want to remove this payment record?')) return;
    const updatedPayments = payments.filter(p => p.id !== payId);
    setPayments(updatedPayments);
    localStorage.setItem(`adwiselabs_bill_payments_${bill.id}`, JSON.stringify(updatedPayments));

    const newTotalPaid = updatedPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
    const newBalance = Math.max(0, currentBill.grossTotal - newTotalPaid);
    const updatedBill: Bill = {
      ...currentBill,
      balance: Number(newBalance.toFixed(2)),
      status: newBalance <= 0 ? 'Completed' : 'Make Payment'
    };

    setCurrentBill(updatedBill);

    try {
      const savedBills = localStorage.getItem('adwiselabs_bills');
      if (savedBills) {
        const billsList: Bill[] = JSON.parse(savedBills);
        const newBills = billsList.map(b => b.id === updatedBill.id ? updatedBill : b);
        localStorage.setItem('adwiselabs_bills', JSON.stringify(newBills));
        window.dispatchEvent(new Event('storage'));
      }
      
      // Update Live Database automatically
      await api.saveBill(updatedBill);
      await api.deleteSupplierPayment(payId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs text-slate-700 select-none">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Bills
        </button>
        <span className="text-xs text-slate-500 font-mono">
          Bill No: <strong className="text-slate-800 font-bold">{currentBill.billNumber}</strong> ({currentBill.supplierName})
        </span>
      </div>

      {/* ======================================================== */}
      {/* 1. ADD PAYMENT FORM SECTION (SCREENSHOT 3 REPLICA)       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
          Add Payment
        </h2>

        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                Amount *
              </label>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono bg-white text-slate-800"
              />
            </div>

            {/* Payment Date * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                Payment Date *
              </label>
              <DatePicker
                value={paymentDate}
                onChange={setPaymentDate}
                placeholder="DD-MMM-YYYY"
              />
            </div>

            {/* Account * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                Account *
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              >
                {ACCOUNT_OPTIONS.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WithHolding Tax */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                WithHolding Tax
              </label>
              <select
                value={whtRate}
                onChange={(e) => setWhtRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              >
                {WHT_OPTIONS.map(w => (
                  <option key={w.label} value={w.percent}>{w.label}</option>
                ))}
              </select>
            </div>

            {/* Reference No * */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                Reference No *
              </label>
              <input
                type="text"
                required
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Reference / Cheque Number"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarks / Note"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Add Payment Button (Matching Screenshot 3) */}
          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#5dade2] hover:bg-[#3498db] text-white font-bold rounded text-xs transition shadow-xs cursor-pointer"
            >
              Add Payment
            </button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 2. PAYMENTS LIST SECTION WITH 3 METRIC BOXES             */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
        {/* Header Title + 3 Metric Boxes (Screenshot Replica) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-800">Payments List</h2>

          {/* 3 Metric Boxes: Balance, Paid, Total */}
          <div className="flex items-center space-x-2">
            {/* Box 1: Balance */}
            <div className="border border-slate-300 rounded overflow-hidden text-center min-w-[85px] shadow-2xs">
              <div className="px-2 py-0.5 bg-white text-[10px] text-slate-500 font-semibold border-b border-slate-300">
                Balance
              </div>
              <div className="px-2.5 py-1 bg-[#001e3d] text-white font-mono font-bold text-[11px]">
                {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Box 2: Paid */}
            <div className="border border-slate-300 rounded overflow-hidden text-center min-w-[85px] shadow-2xs">
              <div className="px-2 py-0.5 bg-white text-[10px] text-slate-500 font-semibold border-b border-slate-300">
                Paid
              </div>
              <div className="px-2.5 py-1 bg-[#001e3d] text-white font-mono font-bold text-[11px]">
                {totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Box 3: Total */}
            <div className="border border-slate-300 rounded overflow-hidden text-center min-w-[85px] shadow-2xs">
              <div className="px-2 py-0.5 bg-white text-[10px] text-slate-500 font-semibold border-b border-slate-300">
                Total
              </div>
              <div className="px-2.5 py-1 bg-[#001e3d] text-white font-mono font-bold text-[11px]">
                {currentBill.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Payments List Table */}
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[10.5px]">
              <tr>
                <th className="px-3 py-2">Payment Date</th>
                <th className="px-3 py-2">Account</th>
                <th className="px-3 py-2 text-right">Net Amount</th>
                <th className="px-3 py-2 text-right">WHT (Amount)</th>
                <th className="px-3 py-2">Cheque Number</th>
                <th className="px-3 py-2">Cheque Date</th>
                <th className="px-3 py-2 text-right">Total Amount</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-slate-400">
                    No payment records added for this bill yet.
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-[10.5px]">
                      {p.paymentDate}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {p.accountHead}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                      {p.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                      {p.whtAmount.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">
                      {p.chequeNumber || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 font-mono text-[10.5px]">
                      {p.chequeDate || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                      {p.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 italic">
                      {p.notes || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-center flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setPrintingPayment(p)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                        title="Print Payment Voucher"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Payment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT MODAL */}
      {printingPayment && (
        <DocumentPrintPreviewModal
          documentType="Payment Voucher"
          document={{
            id: printingPayment.id,
            invoiceNumber: printingPayment.chequeNumber || printingPayment.id,
            customerId: currentBill.supplierId || '',
            customerName: currentBill.supplierName,
            invoiceDate: printingPayment.paymentDate,
            dueDate: printingPayment.paymentDate,
            requiresDeliveryChallan: false,
            status: currentBill.balance <= 0 ? 'Paid' : 'Partial',
            createdAt: printingPayment.paymentDate,
            grossTotal: currentBill.grossTotal || 0,
            balance: currentBill.balance || 0,
            paidAmount: (currentBill.grossTotal || 0) - (currentBill.balance || 0),
            isTaxInclusive: currentBill.isTaxInclusive || false,
            discount: currentBill.discount || 0,
            discountType: 'Discount by Amount',
            items: (currentBill.items || []).filter(item => item.itemDescription || item.netAmount > 0) as unknown as InvoiceItemRow[],
            subtotal: currentBill.subtotal || currentBill.grossTotal || 0,
            totalTax: currentBill.totalTax || 0,
          } as Invoice}
          onClose={() => setPrintingPayment(null)}
        />
      )}
    </div>
  );
};
