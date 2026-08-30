import React, { useState } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import type { SupplierPayment, PaymentLinkedBill } from '../../../types/payment';
import type { Contact } from '../../../types/contact';
import type { Bill } from '../../../types/billing';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_BILLS } from '../../../types/billing';
import { InlineAddContactModal } from '../contacts/InlineAddContactModal';

interface NewPaymentViewProps {
  onSavePayment: (payment: SupplierPayment) => void;
  onCancel: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const PAYMENT_ACCOUNTS = [
  'Cash in Hand',
  'Cash Register',
  'Petty Cash',
  'Meezan bank',
  'Habib Bank Limited (HBL)',
  'Standard Chartered Bank',
  'Corporate Credit Card'
];

const WHT_OPTIONS = [
  { label: 'Select Withholding Tax', value: 0 },
  { label: '0% - None', value: 0 },
  { label: '1% - Goods (Filer)', value: 1 },
  { label: '2% - Goods (Non-Filer)', value: 2 },
  { label: '3% - Services (Filer)', value: 3 },
  { label: '5% - Standard WHT', value: 5 },
  { label: '10% - Services (Non-Filer)', value: 10 }
];

export const NewPaymentView: React.FC<NewPaymentViewProps> = ({
  onSavePayment,
  onCancel
}) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  const reloadContacts = () => {
    try {
      const saved = localStorage.getItem('adwiselabs_contacts') || localStorage.getItem('adwiselabs_tenant_contacts');
      if (saved) setContacts(JSON.parse(saved));
    } catch (e) {}
  };

  const [allBills, setAllBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('adwiselabs_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const reloadBills = () => {
    try {
      const saved = localStorage.getItem('adwiselabs_bills');
      if (saved) setAllBills(JSON.parse(saved));
    } catch (e) {}
  };

  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [supplierId, setSupplierId] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayFormatted());
  const [referenceNo, setReferenceNo] = useState(`${Math.floor(100 + Math.random() * 900)}`);
  const [paymentAccount, setPaymentAccount] = useState('Cash in Hand');
  const [whtPercent, setWhtPercent] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');

  // Selected bill ids for payment
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);
  const [billAllocations, setBillAllocations] = useState<{ [id: string]: number }>({});

  const handleSupplierChange = (newSupplierId: string) => {
    setSupplierId(newSupplierId);
    setSelectedBillIds([]);
    setBillAllocations({});
    setPaidAmount('');
    reloadBills();
  };

  // Filter bills STRICTLY by selected supplier that have outstanding balance > 0
  const selectedSupplier = contacts.find(c => c.id === supplierId);
  const supplierBills = !supplierId ? [] : allBills.filter(b => {
    const bal = typeof b.balance === 'number' ? b.balance : b.grossTotal;
    if (bal <= 0) return false;

    const matchesId = b.supplierId && b.supplierId === supplierId;
    const matchesName = selectedSupplier && b.supplierName && (
      b.supplierName.trim().toLowerCase() === selectedSupplier.name.trim().toLowerCase() ||
      (selectedSupplier.businessName && b.supplierName.trim().toLowerCase() === selectedSupplier.businessName.trim().toLowerCase())
    );

    return matchesId || matchesName;
  });

  const totalOutstanding = supplierBills.reduce((acc, b) => acc + (typeof b.balance === 'number' ? b.balance : b.grossTotal), 0);

  const selectedBills = supplierBills.filter(b => selectedBillIds.includes(b.id));
  const selectedBillsTotal = selectedBills.reduce((acc, b) => acc + (typeof b.balance === 'number' ? b.balance : b.grossTotal), 0);

  const handleToggleSelectBill = (b: Bill) => {
    const bBal = typeof b.balance === 'number' ? b.balance : b.grossTotal;
    if (selectedBillIds.includes(b.id)) {
      setSelectedBillIds(selectedBillIds.filter(id => id !== b.id));
      const updated = { ...billAllocations };
      delete updated[b.id];
      setBillAllocations(updated);
      const remainingTotal = selectedBills.filter(sb => sb.id !== b.id).reduce((acc, sb) => acc + (billAllocations[sb.id] || (typeof sb.balance === 'number' ? sb.balance : sb.grossTotal)), 0);
      setPaidAmount(remainingTotal > 0 ? remainingTotal : '');
    } else {
      setSelectedBillIds([...selectedBillIds, b.id]);
      setBillAllocations({
        ...billAllocations,
        [b.id]: bBal
      });
      // Auto update paid amount
      const newTotal = selectedBillsTotal + bBal;
      setPaidAmount(newTotal);
    }
  };

  const handleAllocationChange = (billId: string, val: number) => {
    const updated = {
      ...billAllocations,
      [billId]: val
    };
    setBillAllocations(updated);
    const sum = Object.values(updated).reduce((a, b) => a + (Number(b) || 0), 0);
    setPaidAmount(sum > 0 ? sum : '');
  };

  const handleMakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert('Please select a Supplier.');
      return;
    }
    const finalAmount = Number(paidAmount) || 0;
    if (finalAmount <= 0) {
      alert('Please enter a valid Paid Amount.');
      return;
    }

    const supplierObj = contacts.find(c => c.id === supplierId);
    const linked: PaymentLinkedBill[] = selectedBills.map(b => {
      const bBal = typeof b.balance === 'number' ? b.balance : b.grossTotal;
      const alloc = billAllocations[b.id] !== undefined ? billAllocations[b.id] : bBal;
      return {
        id: `lb_${b.id}`,
        billNo: b.billNumber,
        billDate: b.issueDate,
        total: b.grossTotal,
        tax: b.totalTax,
        balance: Math.max(0, Number((bBal - alloc).toFixed(2))),
        amountPaid: alloc
      };
    });

    // Update bills in storage & state
    const updatedAllBills = allBills.map(b => {
      if (selectedBillIds.includes(b.id)) {
        const bBal = typeof b.balance === 'number' ? b.balance : b.grossTotal;
        const alloc = billAllocations[b.id] !== undefined ? billAllocations[b.id] : bBal;
        const newBal = Math.max(0, Number((bBal - alloc).toFixed(2)));
        return {
          ...b,
          balance: newBal,
          status: (newBal === 0 ? 'Paid' : 'Unpaid') as any
        };
      }
      return b;
    });

    setAllBills(updatedAllBills);
    try {
      localStorage.setItem('adwiselabs_bills', JSON.stringify(updatedAllBills));
    } catch (err) {}

    const newPayment: SupplierPayment = {
      id: `pay_${Date.now()}`,
      referenceNo: referenceNo.trim() || `${Math.floor(100 + Math.random() * 900)}`,
      supplierId,
      supplierName: supplierObj ? supplierObj.name : 'Supplier',
      paymentDate,
      paymentAccount,
      paymentAmount: finalAmount,
      withholdingTax: (finalAmount * whtPercent) / 100,
      balance: 0,
      notes,
      status: 'Applied',
      linkedBills: linked,
      createdAt: new Date().toISOString()
    };

    onSavePayment(newPayment);
    alert(`Payment of Rs ${finalAmount.toLocaleString()} recorded successfully for ${newPayment.supplierName}!`);
    setSelectedBillIds([]);
    setBillAllocations({});
    setPaidAmount('');
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 w-full my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header matching Screenshot 2 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">Payment</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Payments
        </button>
      </div>

      <form onSubmit={handleMakePayment} className="space-y-5">
        {/* Row 1: Supplier *, Payment Date *, Reference No *, Payment Account * */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Supplier *
            </label>
            <select
              required
              value={supplierId}
              onFocus={reloadContacts}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select a Supplier</option>
              {contacts.filter(c => !c.type || c.type === 'supplier' || c.type === 'both').map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsAddContactModalOpen(true)}
              className="mt-1 text-xs text-[#0070ba] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              + Add Contact
            </button>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Payment Date *
            </label>
            <div className="relative">
              <input
                type="text"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Reference No *
            </label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Payment Account *
            </label>
            <select
              value={paymentAccount}
              onChange={(e) => setPaymentAccount(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {PAYMENT_ACCOUNTS.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: WithHolding Tax & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              WithHolding Tax
            </label>
            <select
              value={whtPercent}
              onChange={(e) => setWhtPercent(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {WHT_OPTIONS.map(w => (
                <option key={w.label} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
            />
          </div>
        </div>

        {/* Row 3: Total Outstanding, Selected Bills Total, Paid Amount *, Make Payment Button */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-2">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Total Outstanding
            </label>
            <input
              type="text"
              readOnly
              value={totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Selected Bills Total
            </label>
            <input
              type="text"
              readOnly
              value={selectedBillsTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Paid Amount *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              placeholder="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] font-mono text-xs text-slate-900 font-bold"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-1.5 bg-[#6ba4e8] hover:bg-[#5293e0] text-white font-bold rounded text-xs transition shadow-xs"
            >
              Make Payment
            </button>
          </div>
        </div>

        {/* Section 4: Outstanding Bills Strip & Table matching Screenshot 2 */}
        <div className="pt-4 space-y-0 overflow-hidden rounded border border-slate-200">
          {/* Dark Blue Header Banner matching Screenshot 2 */}
          <div className="bg-[#004a87] text-white font-bold px-4 py-2 text-xs flex items-center justify-between">
            <span>Bills ({supplierBills.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedBillIds.length > 0 && selectedBillIds.length === supplierBills.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBillIds(supplierBills.map(b => b.id));
                          const allocs: any = {};
                          supplierBills.forEach(b => { allocs[b.id] = b.balance || b.grossTotal; });
                          setBillAllocations(allocs);
                          setPaidAmount(totalOutstanding);
                        } else {
                          setSelectedBillIds([]);
                          setBillAllocations({});
                          setPaidAmount('');
                        }
                      }}
                      className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                    />
                  </th>
                  <th className="px-4 py-2.5">Bill No</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5 text-right">Tax</th>
                  <th className="px-4 py-2.5 text-right">Balance</th>
                  <th className="px-4 py-2.5 text-right">Amount to Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] bg-white">
                {supplierBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">
                      {supplierId ? 'No outstanding unpaid bills for this supplier.' : 'Please select a supplier above to load outstanding bills.'}
                    </td>
                  </tr>
                ) : (
                  supplierBills.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedBillIds.includes(b.id)}
                          onChange={() => handleToggleSelectBill(b)}
                          className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">{b.billNumber}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{b.issueDate}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800">
                        {b.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {b.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {b.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={billAllocations[b.id] ?? ''}
                          placeholder={b.balance.toString()}
                          onChange={(e) => handleAllocationChange(b.id, Number(e.target.value))}
                          className="w-28 px-2 py-1 border border-slate-300 rounded text-right font-mono text-xs focus:outline-none focus:border-[#0070ba]"
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

      {/* Inline Add Contact Modal */}
      <InlineAddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        defaultType="supplier"
        onContactCreated={(newContact) => {
          setContacts(prev => [newContact, ...prev]);
          handleSupplierChange(newContact.id);
        }}
      />
    </div>
  );
};

