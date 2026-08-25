import React, { useState } from 'react';
import { ArrowLeft, Printer, Trash2 } from 'lucide-react';
import type { SupplierPayment } from '../../../types/payment';
import { DocumentPrintPreviewModal } from '../common/DocumentPrintPreviewModal';
import type { Invoice } from '../../../types/sales';

interface PaymentDetailsViewProps {
  payment: SupplierPayment;
  onClose: () => void;
  onDeletePayment?: (id: string) => void;
  currencySymbol?: string;
}

export const PaymentDetailsView: React.FC<PaymentDetailsViewProps> = ({
  payment,
  onClose,
  onDeletePayment,
  currencySymbol = 'Rs'
}) => {
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [linkedBills, setLinkedBills] = useState(payment.linkedBills || []);
  const [printingPayment, setPrintingPayment] = useState(false);

  const handleToggleSelectBill = (id: string) => {
    setSelectedBills(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleUnlink = () => {
    if (selectedBills.length === 0) {
      alert('Please select at least one linked bill to unlink.');
      return;
    }
    if (confirm(`Unlink ${selectedBills.length} bill(s) from this payment?`)) {
      setLinkedBills(prev => prev.filter(b => !selectedBills.includes(b.id)));
      setSelectedBills([]);
      alert('Selected bill(s) unlinked successfully!');
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete Payment Ref #${payment.referenceNo}?`)) {
      if (onDeletePayment) onDeletePayment(payment.id);
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-7xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header matching Screenshot 3 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-base font-bold text-slate-800">Payment Details</h2>
        </div>

        <button
          onClick={() => setPrintingPayment(true)}
          className="px-4 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white rounded font-bold flex items-center gap-1.5 text-xs transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      {/* 3-Column Info Grid matching Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-2 border-b border-slate-100">
        {/* Column 1 */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Supplier Name</span>
            <span className="font-bold text-slate-900 text-xs capitalize">{payment.supplierName}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Reference No</span>
            <span className="font-bold text-slate-900 font-mono text-xs">{payment.referenceNo}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">WithHolding Tax</span>
            <span className="text-slate-700 text-xs font-mono">{payment.withholdingTax ? `${currencySymbol} ${payment.withholdingTax.toFixed(2)}` : '-'}</span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Payment Date</span>
            <span className="font-bold text-slate-900 font-mono text-xs">{payment.paymentDate}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Notes</span>
            <span className="text-slate-700 text-xs">{payment.notes || '-'}</span>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Payment Account</span>
            <span className="font-bold text-slate-900 text-xs">{payment.paymentAccount}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Amount</span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">
              {payment.paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Bills Table matching Screenshot 3 */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-800">Linked Bills</h3>

        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedBills.length > 0 && selectedBills.length === linkedBills.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedBills(linkedBills.map(b => b.id));
                      else setSelectedBills([]);
                    }}
                    className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-2.5">Bill No</th>
                <th className="px-4 py-2.5">Bill Date</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5 text-right">Amount Paid</th>
                <th className="px-4 py-2.5 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {linkedBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    No linked bills attached to this payment.
                  </td>
                </tr>
              ) : (
                linkedBills.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(b.id)}
                        onChange={() => handleToggleSelectBill(b.id)}
                        className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{b.billNo}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{b.billDate}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800">
                      {b.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {b.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {b.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Buttons matching Screenshot 3 */}
      <div className="pt-4 flex items-center justify-end space-x-2.5">
        <button
          type="button"
          onClick={handleUnlink}
          disabled={selectedBills.length === 0}
          className="px-4 py-2 bg-[#6ba4e8] hover:bg-[#5293e0] text-white font-bold rounded text-xs transition disabled:opacity-40 shadow-xs"
        >
          Unlink Bill(s)
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Delete Payment</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition"
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
            customerId: payment.supplierId,
            customerName: payment.supplierName,
            invoiceDate: payment.paymentDate,
            dueDate: payment.paymentDate,
            requiresDeliveryChallan: false,
            discountType: 'Discount by Amount',
            items: (payment.linkedBills || []).map(b => ({
              id: b.id,
              itemDescription: `Payment for Bill ${b.billNo}`,
              batchNumber: '',
              batchExpiryDate: '',
              uom: '',
              qty: 1,
              unitPrice: b.amountPaid,
              location: '',
              discount: 0,
              account: '',
              taxRatePercent: 0,
              taxAmount: 0,
              netAmount: b.amountPaid
            })),
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
