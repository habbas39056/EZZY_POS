import React, { useState } from 'react';
import { 
  Plus, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Trash2,
  Pause,
  Play
} from 'lucide-react';
import type { RecurringInvoice } from '../../../types/recurringInvoice';
import { INITIAL_RECURRING_INVOICES } from '../../../types/recurringInvoice';
import type { Contact } from '../../../types/contact';
import { INITIAL_CONTACTS } from '../../../types/contact';

interface RecurringInvoicesListViewProps {
  onOpenNewRecurring: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const RecurringInvoicesListView: React.FC<RecurringInvoicesListViewProps> = ({
  onOpenNewRecurring
}) => {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>(() => {
    const saved = localStorage.getItem('adwiselabs_recurring_invoices');
    return saved ? JSON.parse(saved) : INITIAL_RECURRING_INVOICES;
  });

  const [contacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const saveRecurring = (data: RecurringInvoice[]) => {
    setRecurringInvoices(data);
    localStorage.setItem('adwiselabs_recurring_invoices', JSON.stringify(data));
  };

  const handleToggleStatus = (rec: RecurringInvoice) => {
    const updated = recurringInvoices.map(r => 
      r.id === rec.id 
        ? { ...r, status: (r.status === 'Active' ? 'Paused' : 'Active') as 'Active' | 'Paused' }
        : r
    );
    saveRecurring(updated);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring schedule?')) {
      saveRecurring(recurringInvoices.filter(r => r.id !== id));
      setActiveMenuId(null);
    }
  };

  const filtered = recurringInvoices.filter(r => {
    const matchesCustomer = !customerFilter || r.customerId === customerFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesCustomer && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Customer */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Customer
            </label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select a Customer</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          {/* Search Button (Dark Navy) */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="button"
              onClick={() => {}}
              className="w-full py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. RECURRING INVOICES TABLE (MATCHING SCREENSHOT 1)      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Recurring Invoices</h2>

          <button
            onClick={onOpenNewRecurring}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Recurring
          </button>
        </div>

        {/* Full 6-Column Table matching Screenshot 1 */}
        <div className="overflow-x-auto min-h-[340px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Customer Name</th>
                <th className="px-4 py-2.5">Start Date</th>
                <th className="px-4 py-2.5 text-right">Invoice Total</th>
                <th className="px-4 py-2.5 text-right">TAX</th>
                <th className="px-4 py-2.5 text-center">Type</th>
                <th className="px-4 py-2.5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No recurring invoice records found. Click <strong>+ Recurring</strong> to schedule an invoice.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition relative">
                    <td className="px-4 py-3 font-semibold text-slate-900 capitalize">
                      {r.customerName}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {r.startDate}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {r.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {r.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                        Every {r.repeatFrequency} {r.repeatUnit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === r.id ? null : r.id)}
                        className="font-extrabold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-200 transition text-sm tracking-tighter"
                      >
                        ...
                      </button>

                      {activeMenuId === r.id && (
                        <div className="absolute right-4 top-8 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs">
                          <button
                            onClick={() => handleToggleStatus(r)}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium"
                          >
                            {r.status === 'Active' ? (
                              <>
                                <Pause className="w-3.5 h-3.5 text-amber-500" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-rose-600 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
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
            1 - {filtered.length} of {filtered.length}
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
