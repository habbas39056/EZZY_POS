import React, { useState } from 'react';
import { 
  Plus, 
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import type { RecurringBill } from '../../../types/recurringBill';
import { INITIAL_RECURRING_BILLS } from '../../../types/recurringBill';
import type { Contact } from '../../../types/contact';
import { INITIAL_CONTACTS } from '../../../types/contact';

interface RecurringBillsListViewProps {
  onOpenNewRecurring: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const RecurringBillsListView: React.FC<RecurringBillsListViewProps> = ({
  onOpenNewRecurring
}) => {
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    const saved = localStorage.getItem('adwiselabs_recurring_bills');
    return saved ? JSON.parse(saved) : INITIAL_RECURRING_BILLS;
  });

  const [contacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('adwiselabs_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const saveRecurringBills = (data: RecurringBill[]) => {
    setRecurringBills(data);
    localStorage.setItem('adwiselabs_recurring_bills', JSON.stringify(data));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring schedule?')) {
      saveRecurringBills(recurringBills.filter(r => r.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleToggleStatus = (rec: RecurringBill) => {
    const nextStatus = rec.status === 'Active' ? 'Paused' : 'Active';
    const updated = recurringBills.map(r => r.id === rec.id ? { ...r, status: nextStatus as any } : r);
    saveRecurringBills(updated);
    setActiveMenuId(null);
  };

  const filteredRecurring = recurringBills.filter(r => {
    const matchesSupplier = !supplierFilter || r.supplierId === supplierFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSupplier && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Supplier */}
          <div className="sm:col-span-5">
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
              <option value="">Select a Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
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
      {/* 2. RECURRING BILLS TABLE (MATCHING SCREENSHOT 1)         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Recurring Bills</h2>

          <button
            onClick={onOpenNewRecurring}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Recurring
          </button>
        </div>

        {/* Full 6-Column Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Supplier Name</th>
                <th className="px-4 py-2.5">Start Date</th>
                <th className="px-4 py-2.5 text-right">Bill Total</th>
                <th className="px-4 py-2.5 text-right">TAX</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredRecurring.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No recurring bills found. Click <strong>+ Recurring</strong> to schedule automated bills.
                  </td>
                </tr>
              ) : (
                filteredRecurring.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition relative">
                    {/* Supplier Name */}
                    <td className="px-4 py-3 font-medium text-slate-900 capitalize">
                      {rec.supplierName}
                      <span className="block text-[10.5px] text-slate-400">
                        Every {rec.repeatFrequencyNumber} {rec.repeatFrequencyUnit}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {rec.startDate}
                    </td>

                    {/* Bill Total */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {rec.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* TAX */}
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {rec.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded-full text-white font-bold text-[10px] shadow-2xs ${
                        rec.status === 'Active' ? 'bg-[#2e7d32]' : 'bg-[#e65100]'
                      }`}>
                        {rec.status}
                      </span>
                    </td>

                    {/* Manage (...) */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === rec.id ? null : rec.id)}
                        className="font-extrabold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-200 transition text-sm tracking-tighter"
                      >
                        ...
                      </button>

                      {activeMenuId === rec.id && (
                        <div className="absolute right-4 top-8 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs">
                          <button
                            onClick={() => handleToggleStatus(rec)}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium"
                          >
                            {rec.status === 'Active' ? (
                              <>
                                <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id)}
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
            {filteredRecurring.length} of {filteredRecurring.length}
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
