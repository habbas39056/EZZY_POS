import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { CustomerPayment, CustomerPaymentLinkedInvoice } from '../../../types/customerPayment';
import type { Contact } from '../../../types/contact';
import type { Invoice } from '../../../types/sales';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { INITIAL_INVOICES } from '../../../types/sales';
import { DatePicker } from '../../common/DatePicker';
import { api } from '../../../services/api';

interface NewCustomerPaymentViewProps {
  onSavePayment: (payment: CustomerPayment) => void;
  onCancel: () => void;
  currencyCode?: string;
  currencySymbol?: string;
  initialInvoice?: Invoice | null;
}

const PAYMENT_ACCOUNTS = [
  'Cash In Hand',
  'Cash Register (Store)',
  'Meezan Bank - Main Operations',
  'HBL - Corporate Account',
  'Bank Alfalah - Commercial'
];

const WHT_RATES = [
  { label: 'Select Withholding Tax', value: 0 },
  { label: 'WHT 1% (Active Tax Payer)', value: 1 },
  { label: 'WHT 2% (Non-Active Tax Payer)', value: 2 },
  { label: 'WHT 5% (Services)', value: 5 }
];

export const NewCustomerPaymentView: React.FC<NewCustomerPaymentViewProps> = ({
  onSavePayment,
  onCancel,
  initialInvoice
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

  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Find customer match from initial invoice
  const matchedContact = initialInvoice
    ? contacts.find(
        (c) =>
          c.id === initialInvoice.customerId ||
          (initialInvoice.customerName &&
            (c.name.trim().toLowerCase() === initialInvoice.customerName.trim().toLowerCase() ||
              (c.businessName && c.businessName.trim().toLowerCase() === initialInvoice.customerName.trim().toLowerCase())))
      )
    : null;

  const initialCustomerIdVal = matchedContact
    ? matchedContact.id
    : initialInvoice?.customerId || '';

  const initialInvoiceAmount = initialInvoice
    ? (initialInvoice.balance !== undefined ? initialInvoice.balance : initialInvoice.grossTotal)
    : '';

  const [customerId, setCustomerId] = useState(initialCustomerIdVal);
  const [paymentDate, setPaymentDate] = useState(getTodayFormatted());
  const [referenceNo, setReferenceNo] = useState(`REF-${Math.floor(100 + Math.random() * 900)}`);
  const [paymentAccount, setPaymentAccount] = useState('Cash In Hand');
  const [whtRate, setWhtRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [receivedAmount, setReceivedAmount] = useState<number | ''>(initialInvoiceAmount);

  // Selected invoices for allocation
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(
    initialInvoice ? [initialInvoice.id] : []
  );
  const [invoiceAllocations, setInvoiceAllocations] = useState<Record<string, number>>(
    initialInvoice && initialInvoiceAmount !== ''
      ? { [initialInvoice.id]: Number(initialInvoiceAmount) }
      : {}
  );

  const selectedContact = useMemo(() => contacts.find((c) => c.id === customerId), [contacts, customerId]);

  // Filter invoices STRICTLY for selected customer
  const customerInvoices = useMemo(() => {
    if (!customerId) return [];
    return invoices.filter((inv) => {
      // 1. Direct ID match
      if (inv.customerId && inv.customerId === customerId) return true;

      // 2. Name match against selected contact
      if (selectedContact) {
        const invCust = (inv.customerName || '').trim().toLowerCase();
        const contactName = (selectedContact.name || '').trim().toLowerCase();
        const contactBiz = (selectedContact.businessName || '').trim().toLowerCase();

        if (invCust && (invCust === contactName || (contactBiz && invCust === contactBiz))) {
          return true;
        }
      }

      // 3. Fallback direct match with customerId string
      if (inv.customerName && inv.customerName.trim().toLowerCase() === customerId.trim().toLowerCase()) {
        return true;
      }

      // 4. Initial invoice exception
      if (initialInvoice && inv.id === initialInvoice.id) {
        return true;
      }

      return false;
    });
  }, [invoices, customerId, selectedContact, initialInvoice]);

  const totalOutstanding = useMemo(() => {
    return customerInvoices.reduce((acc, inv) => acc + (Number(inv.balance !== undefined ? inv.balance : inv.grossTotal) || 0), 0);
  }, [customerInvoices]);

  const handleToggleInvoice = (inv: Invoice) => {
    if (selectedInvoiceIds.includes(inv.id)) {
      const remainingIds = selectedInvoiceIds.filter(id => id !== inv.id);
      setSelectedInvoiceIds(remainingIds);
      const updated = { ...invoiceAllocations };
      delete updated[inv.id];
      setInvoiceAllocations(updated);
      const newTotal = remainingIds.reduce((sum, id) => sum + (updated[id] || 0), 0);
      setReceivedAmount(newTotal > 0 ? newTotal : '');
    } else {
      const invBal = inv.balance !== undefined ? inv.balance : inv.grossTotal;
      const newIds = [...selectedInvoiceIds, inv.id];
      const updated = {
        ...invoiceAllocations,
        [inv.id]: invBal
      };
      setSelectedInvoiceIds(newIds);
      setInvoiceAllocations(updated);
      const newTotal = newIds.reduce((sum, id) => sum + (updated[id] || 0), 0);
      setReceivedAmount(newTotal);
    }
  };

  const selectedInvoicesTotal = selectedInvoiceIds.reduce((acc, id) => {
    return acc + (invoiceAllocations[id] || 0);
  }, 0);

  const handleAllocationChange = (invId: string, val: number) => {
    const updated = {
      ...invoiceAllocations,
      [invId]: val
    };
    setInvoiceAllocations(updated);
    const newTotal = selectedInvoiceIds.reduce((sum, id) => sum + (updated[id] || 0), 0);
    setReceivedAmount(newTotal > 0 ? newTotal : '');
  };

  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    setSelectedInvoiceIds([]);
    setInvoiceAllocations({});
    setReceivedAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Please select a Customer.');
      return;
    }
    if (!referenceNo.trim()) {
      alert('Please enter a Reference Number.');
      return;
    }

    const finalAmount = Number(receivedAmount) || selectedInvoicesTotal;
    if (finalAmount <= 0) {
      alert('Please enter a Received Amount greater than 0.');
      return;
    }

    const customerObj = contacts.find(c => c.id === customerId);
    const selectedInvs = customerInvoices.filter(i => selectedInvoiceIds.includes(i.id));

    const linked: CustomerPaymentLinkedInvoice[] = selectedInvs.map(i => ({
      id: `li_${i.id}`,
      invoiceNo: i.invoiceNumber,
      invoiceDate: i.invoiceDate,
      total: i.grossTotal,
      tax: i.totalTax,
      balance: Math.max(0, (i.balance || i.grossTotal) - (invoiceAllocations[i.id] || finalAmount)),
      amountPaid: invoiceAllocations[i.id] || finalAmount
    }));

    const newPayment: CustomerPayment = {
      id: `pay_${Date.now()}`,
      referenceNo: referenceNo.trim(),
      customerId,
      customerName: customerObj ? customerObj.name : (initialInvoice?.customerName || 'Unknown Customer'),
      paymentDate,
      paymentAccount,
      paymentAmount: finalAmount,
      whtAmount: (finalAmount * whtRate) / 100,
      whtTaxPercent: whtRate,
      balance: 0.00,
      status: 'Applied',
      notes,
      linkedInvoices: linked,
      createdAt: new Date().toISOString()
    };

    // Update invoice balances in localStorage
    try {
      const saved = localStorage.getItem('adwiselabs_invoices');
      if (saved) {
        const invList: Invoice[] = JSON.parse(saved);
        const updatedInvList = invList.map(inv => {
          if (selectedInvoiceIds.includes(inv.id)) {
            const paid = invoiceAllocations[inv.id] || (selectedInvoiceIds.length === 1 ? finalAmount : 0);
            const currentBal = inv.balance !== undefined ? inv.balance : inv.grossTotal;
            const newBal = Math.max(0, currentBal - paid);
            return {
              ...inv,
              balance: newBal,
              status: newBal === 0 ? ('Completed' as const) : ('Receive Payment' as const)
            };
          }
          return inv;
        });
        localStorage.setItem('adwiselabs_invoices', JSON.stringify(updatedInvList));
      }
    } catch (e) {}

    onSavePayment(newPayment);
    api.savePayment(newPayment).catch(() => {});
    alert(`Payment of ${newPayment.paymentAmount} received for ${newPayment.customerName}!`);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-[#0070ba]">Payment</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Payments
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ======================================================== */}
        {/* ROW 1: Customer *, Payment Date *, Ref No *, Account *   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Customer</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
              ))}
              {customerId && !contacts.some(c => c.id === customerId) && (
                <option value={customerId}>
                  {initialInvoice?.customerName || customerId}
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Payment Date *
            </label>
            <DatePicker
              value={paymentDate}
              onChange={setPaymentDate}
            />
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
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Payment Account *
            </label>
            <select
              value={paymentAccount}
              onChange={(e) => setPaymentAccount(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-medium"
            >
              {PAYMENT_ACCOUNTS.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ROW 2: WithHolding Tax, Notes                            */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              WithHolding Tax
            </label>
            <select
              value={whtRate}
              onChange={(e) => setWhtRate(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {WHT_RATES.map(w => (
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
              placeholder="Payment remarks..."
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* ROW 3: Outstanding, Selected Total, Received Amount, Btn */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end pt-1">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Total Outstanding
            </label>
            <input
              type="text"
              readOnly
              value={totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Selected Invoices Total
            </label>
            <input
              type="text"
              readOnly
              value={selectedInvoicesTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Received Amount *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 bg-[#42a5f5] hover:bg-sky-600 text-white font-bold rounded shadow-xs text-xs transition"
            >
              Receive Payment
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* OUTSTANDING INVOICES ALLOCATION TABLE (SCREENSHOT 1)     */}
        {/* ======================================================== */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mt-6">
          <div className="bg-[#003366] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider">
            INVOICES ({customerInvoices.length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedInvoiceIds.length > 0 && selectedInvoiceIds.length === customerInvoices.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoiceIds(customerInvoices.map(i => i.id));
                          const allocs: Record<string, number> = {};
                          customerInvoices.forEach(i => { allocs[i.id] = i.balance || i.grossTotal; });
                          setInvoiceAllocations(allocs);
                        } else {
                          setSelectedInvoiceIds([]);
                          setInvoiceAllocations({});
                        }
                      }}
                      className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                    />
                  </th>
                  <th className="px-4 py-2.5">Invoice No</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5 text-right">Tax</th>
                  <th className="px-4 py-2.5 text-right">Balance</th>
                  <th className="px-4 py-2.5 text-right w-36">Amount to Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {customerInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      {customerId ? 'No unpaid invoices found for this customer.' : 'Please select a customer above to view their unpaid invoices.'}
                    </td>
                  </tr>
                ) : (
                  customerInvoices.map(inv => {
                    const isSelected = selectedInvoiceIds.includes(inv.id);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleInvoice(inv)}
                            className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                          />
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-800">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{inv.invoiceDate}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-800">
                          {inv.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          {inv.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                          {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            disabled={!isSelected}
                            value={invoiceAllocations[inv.id] !== undefined ? invoiceAllocations[inv.id] : ''}
                            onChange={(e) => handleAllocationChange(inv.id, Number(e.target.value))}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-right font-mono text-xs font-semibold disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
};
