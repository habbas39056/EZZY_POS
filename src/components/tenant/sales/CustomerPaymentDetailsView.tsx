import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';
import type { CustomerPayment } from '../../../types/customerPayment';
import { DocumentPrintPreviewModal } from '../common/DocumentPrintPreviewModal';
import type { Invoice } from '../../../types/sales';

interface CustomerPaymentDetailsViewProps {
  payment: CustomerPayment;
  onClose: () => void;
  onDeletePayment?: () => void;
  onUnlinkInvoices?: (ids: string[]) => void;
}

export const CustomerPaymentDetailsView: React.FC<CustomerPaymentDetailsViewProps> = ({
  payment,
  onClose,
  onDeletePayment,
  onUnlinkInvoices
}) => {
  const linkedInvoices = payment.linkedInvoices && payment.linkedInvoices.length > 0
    ? payment.linkedInvoices
    : [
        {
          id: 'li_default',
          invoiceNo: '23236',
          invoiceDate: payment.paymentDate || '22-Jul-2026',
          total: (payment.paymentAmount * 2) || 400.00,
          tax: 0.00,
          balance: payment.paymentAmount || 200.00,
          amountPaid: payment.paymentAmount || 200.00
        }
      ];

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [printingPayment, setPrintingPayment] = useState(false);

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoiceIds(linkedInvoices.map(i => i.id));
    } else {
      setSelectedInvoiceIds([]);
    }
  };

  const handleToggleOne = (id: string) => {
    setSelectedInvoiceIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6 relative">
      {/* Top Esc Close Button matching Screenshot 4 */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 flex flex-col items-center text-slate-400 hover:text-slate-700 transition"
      >
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
          <X className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-semibold text-slate-400 mt-0.5">esc</span>
      </button>

      {/* ======================================================== */}
      {/* 1. HEADER BAR (MATCHING SCREENSHOT 4)                    */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 pr-12">
        <h2 className="text-base font-bold text-[#0070ba]">
          Payment Details
        </h2>

        <button
          type="button"
          onClick={() => setPrintingPayment(true)}
          className="px-4 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. 3-COLUMN SUMMARY GRID (MATCHING SCREENSHOT 4)         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-2 border-b border-slate-100">
        {/* Column 1: Customer Name, Reference No, WithHolding Tax */}
        <div className="space-y-4">
          <div>
            <span className="block text-[11px] text-slate-400">Customer Name</span>
            <span className="text-sm font-bold text-slate-900">{payment.customerName || 'Arshad'}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">Reference No</span>
            <span className="text-xs font-mono font-semibold text-slate-800">{payment.referenceNo || '789'}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">WithHolding Tax</span>
            <span className="text-xs text-slate-600">-</span>
          </div>
        </div>

        {/* Column 2: Payment Date, Notes */}
        <div className="space-y-4">
          <div>
            <span className="block text-[11px] text-slate-400">Payment Date</span>
            <span className="text-xs font-mono text-slate-800">{payment.paymentDate || '22-Jul-2026'}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">Notes</span>
            <span className="text-xs text-slate-600">{payment.notes || '-'}</span>
          </div>
        </div>

        {/* Column 3: Payment Account, Amount Received */}
        <div className="space-y-4">
          <div>
            <span className="block text-[11px] text-slate-400">Payment Account</span>
            <span className="text-xs font-medium text-slate-800">{payment.paymentAccount || 'Cash In Hand'}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">Amount Received</span>
            <span className="text-base font-extrabold font-mono text-slate-900">
              {payment.paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. LINKED INVOICES TABLE (MATCHING SCREENSHOT 4)         */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-800">Linked Invoices</h3>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedInvoiceIds.length > 0 && selectedInvoiceIds.length === linkedInvoices.length}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-2.5">Invoice No</th>
                <th className="px-4 py-2.5">Invoice Date</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5 text-right">Amount Paid</th>
                <th className="px-4 py-2.5 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {linkedInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedInvoiceIds.includes(inv.id)}
                      onChange={() => handleToggleOne(inv.id)}
                      className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                    {inv.invoiceNo}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {inv.invoiceDate}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                    {inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {inv.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. BOTTOM ACTION BUTTONS (MATCHING SCREENSHOT 4)         */}
      {/* ======================================================== */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
        <button
          type="button"
          disabled={selectedInvoiceIds.length === 0}
          onClick={() => {
            if (onUnlinkInvoices) onUnlinkInvoices(selectedInvoiceIds);
            alert(`Unlinked ${selectedInvoiceIds.length} invoice(s) from this payment.`);
          }}
          className="px-4 py-1.5 bg-[#42a5f5] hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded shadow-xs text-xs transition"
        >
          Unlink Invoice(s)
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to delete this payment record?')) {
              if (onDeletePayment) onDeletePayment();
              onClose();
            }
          }}
          className="px-4 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded shadow-xs text-xs transition"
        >
          Delete Payment
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
        >
          Close
        </button>
      </div>

      {/* PRINT MODAL */}
      {printingPayment && (
        <DocumentPrintPreviewModal
          documentType="Payment Voucher"
          document={{
            id: payment.id,
            invoiceNumber: payment.referenceNo,
            customerId: payment.customerId,
            customerName: payment.customerName,
            invoiceDate: payment.paymentDate,
            dueDate: payment.paymentDate,
            requiresDeliveryChallan: false,
            discountType: 'Discount by Amount',
            items: linkedInvoices.map(inv => {
              let productNames = '';
              try {
                const saved = localStorage.getItem('adwiselabs_invoices');
                if (saved) {
                  const allInvoices = JSON.parse(saved);
                  const originalInvoice = allInvoices.find((i: any) => i.id === inv.id);
                  console.log('Checking inv.id:', inv.id, 'Found invoice:', originalInvoice);
                  if (originalInvoice && originalInvoice.items) {
                    productNames = originalInvoice.items.map((item: any) => item.itemDescription).filter(Boolean).join(', ');
                    console.log('Product names found:', productNames);
                  }
                }
              } catch (e) {
                // ignore parse errors
              }
              
              const description = productNames 
                ? `Payment for Invoice ${inv.invoiceNo} (${productNames})`
                : `Payment for Invoice ${inv.invoiceNo}`;

              return {
                id: inv.id,
                itemDescription: description,
                batchNumber: '',
                batchExpiryDate: '',
                uom: '',
                qty: 1,
                unitPrice: inv.amountPaid,
                location: '',
                discount: 0,
                account: '',
                taxRatePercent: 0,
                taxAmount: 0,
                netAmount: inv.amountPaid
              };
            }),
            isTaxInclusive: false,
            subtotal: payment.paymentAmount,
            discount: 0,
            totalTax: 0,
            grossTotal: payment.paymentAmount,
            balance: 0,
            status: 'Paid',
            createdAt: payment.paymentDate
          } as Invoice}
          onClose={() => setPrintingPayment(false)}
        />
      )}
    </div>
  );
};
