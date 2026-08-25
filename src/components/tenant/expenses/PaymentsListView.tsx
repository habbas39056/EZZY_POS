import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Download,
  FileText,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';
import type { SupplierPayment } from '../../../types/payment';
import { INITIAL_SUPPLIER_PAYMENTS } from '../../../types/payment';
import type { Contact } from '../../../types/contact';
import { INITIAL_CONTACTS } from '../../../types/contact';
import { PaymentDetailsView } from './PaymentDetailsView';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';
import { api } from '../../../services/api';

interface PaymentsListViewProps {
  onOpenNewPayment: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const PaymentsListView: React.FC<PaymentsListViewProps> = ({
  onOpenNewPayment,
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [payments, setPayments] = useState<SupplierPayment[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const remote = await api.getSupplierPayments();
        if (remote) {
          setPayments(remote);
        } else {
          const saved = localStorage.getItem('adwiselabs_supplier_payments');
          setPayments(saved ? JSON.parse(saved) : INITIAL_SUPPLIER_PAYMENTS);
        }
      } catch (e) {}
    };
    load();
  }, []);

  const [contacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [supplierFilter, setSupplierFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // View Details Full View State
  const [selectedPayment, setSelectedPayment] = useState<SupplierPayment | null>(null);

  const savePayments = (data: SupplierPayment[]) => {
    setPayments(data);
  };

  const handleDeletePayment = async (id: string) => {
    await api.deleteSupplierPayment(id);
    savePayments(payments.filter(p => p.id !== id));
  };

  const handleExportCSV = () => {
    alert('Exporting Payments data to CSV/Excel...');
  };

  const filteredPayments = payments.filter(p => {
    const matchesSupplier = !supplierFilter || p.supplierId === supplierFilter || p.supplierName.toLowerCase().includes(supplierFilter.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    const matchesDate = isDateInRange(p.paymentDate || p.createdAt, startDate, endDate);
    return matchesSupplier && matchesStatus && matchesDate;
  });

  if (selectedPayment) {
    return (
      <PaymentDetailsView
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onDeletePayment={handleDeletePayment}
        currencySymbol={currencySymbol}
      />
    );
  }

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Supplier */}
          <div className="sm:col-span-3">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Supplier
            </label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select a Supplier</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              End Date
            </label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select</option>
              <option value="Applied">Applied</option>
              <option value="Unapplied">Unapplied</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Search Button (Dark Navy) */}
          <div className="sm:col-span-1.5 flex items-end">
            <button
              type="button"
              onClick={() => {}}
              className="w-full py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs"
            >
              Search
            </button>
          </div>

          {/* Export Button (Green) */}
          <div className="sm:col-span-1.5 flex items-end">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full py-1.5 bg-[#2e7d32] hover:bg-emerald-800 text-white font-bold rounded text-xs transition shadow-xs flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PAYMENTS TABLE CONTAINER (MATCHING SCREENSHOT 1)      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Payments</h2>

          <button
            onClick={onOpenNewPayment}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Payment
          </button>
        </div>

        {/* Full 9-Column Payments Table */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Reference No</th>
                <th className="px-4 py-2.5">Supplier</th>
                <th className="px-4 py-2.5">Payment Date</th>
                <th className="px-4 py-2.5">Payment Account</th>
                <th className="px-4 py-2.5 text-right">Payment Amount</th>
                <th className="px-4 py-2.5 text-right">WHT</th>
                <th className="px-4 py-2.5 text-right">Balance</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No payment records found. Click <strong>+ Payment</strong> to make a payment.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    {/* Reference No */}
                    <td className="px-4 py-3 font-semibold text-slate-800 font-mono">
                      {p.referenceNo}
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3 font-medium text-slate-900 capitalize">
                      {p.supplierName}
                    </td>

                    {/* Payment Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {p.paymentDate}
                    </td>

                    {/* Payment Account */}
                    <td className="px-4 py-3 text-slate-700">
                      {p.paymentAccount}
                    </td>

                    {/* Payment Amount */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {p.paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* WHT */}
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {p.withholdingTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                      {p.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status (Applied Green Pill) */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#2e7d32] text-white font-bold text-[10px] shadow-2xs">
                        {p.status}
                      </span>
                    </td>

                    {/* Manage (Details / Receipt icon matching Screenshot 1) */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center justify-center transition"
                        title="View Payment Details"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Footer matching Screenshot 1 */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-end space-x-4 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 font-semibold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div>
            1 - {filteredPayments.length} of {filteredPayments.length}
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-slate-700 disabled:opacity-30" disabled>
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
