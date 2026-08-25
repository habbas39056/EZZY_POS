import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  MoreVertical, 
  Edit3, 
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';
import type { Expense } from '../../../types/expense';
import { INITIAL_EXPENSES } from '../../../types/expense';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';
import { NewExpenseView } from './NewExpenseView';
import { api } from '../../../services/api';

interface ExpensesListViewProps {
  onOpenNewExpense: () => void;
  onEditExpense?: (exp: Expense) => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const PAID_THROUGH_OPTIONS = [
  'All Accounts',
  'Cash in Hand',
  'Cash Register',
  'Petty Cash',
  'Operating Bank Account',
  'Meezan bank',
  'Habib Bank Limited (HBL)',
  'Standard Chartered Bank',
  'Director Loan Account'
];

export const ExpensesListView: React.FC<ExpensesListViewProps> = ({
  onOpenNewExpense,
  onEditExpense,
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const remote = await api.getDirectExpenses();
        if (remote) {
          setExpenses(remote);
        } else {
          const saved = localStorage.getItem('adwiselabs_expenses');
          setExpenses(saved ? JSON.parse(saved) : INITIAL_EXPENSES);
        }
      } catch (e) {}
    };
    load();
  }, []);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paidThroughFilter, setPaidThroughFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedEditExpense, setSelectedEditExpense] = useState<Expense | null>(null);

  const saveExpenses = (data: Expense[]) => {
    setExpenses(data);
  };

  if (selectedEditExpense) {
    return (
      <NewExpenseView
        initialExpense={selectedEditExpense}
        onSaveExpense={async (updatedExp) => {
          await api.saveDirectExpense(updatedExp);
          const updated = expenses.map(e => e.id === updatedExp.id ? updatedExp : e);
          saveExpenses(updated);
          setSelectedEditExpense(null);
        }}
        onCancel={() => setSelectedEditExpense(null)}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
      />
    );
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense record?')) {
      await api.deleteDirectExpense(id);
      saveExpenses(expenses.filter(e => e.id !== id));
      setActiveMenuId(null);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesPaidThrough = !paidThroughFilter || paidThroughFilter === 'All Accounts' || exp.paidThrough === paidThroughFilter;
    const matchesDate = isDateInRange(exp.date, startDate, endDate);
    return matchesPaidThrough && matchesDate;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Start Date */}
          <div className="sm:col-span-3">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-3">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              End Date
            </label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          {/* Paid Through */}
          <div className="sm:col-span-4">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Paid Through
            </label>
            <select
              value={paidThroughFilter}
              onChange={(e) => setPaidThroughFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              {PAID_THROUGH_OPTIONS.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
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
      {/* 2. EXPENSES TABLE CONTAINER (MATCHING SCREENSHOT 1)      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Expenses</h2>

          <button
            onClick={onOpenNewExpense}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> New Expense
          </button>
        </div>

        {/* Full 8-Column Expenses Table */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Reference#</th>
                <th className="px-4 py-2.5">Paid Through</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5 text-right">Total Expense</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No expense records found. Click <strong>+ New Expense</strong> to record a payment.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition relative">
                    {/* Date */}
                    <td className="px-4 py-3 text-slate-600 font-mono text-[10.5px]">
                      {exp.date}
                    </td>

                    {/* Reference# */}
                    <td 
                      onClick={() => setSelectedEditExpense(exp)}
                      className="px-4 py-3 font-semibold text-[#0070ba] hover:underline font-mono cursor-pointer"
                    >
                      {exp.referenceNo}
                    </td>

                    {/* Paid Through */}
                    <td className="px-4 py-3 text-slate-700">
                      {exp.paidThrough}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {exp.customer || '-'}
                    </td>

                    {/* Total Expense */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {exp.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Total (0.00 in Moneypex) */}
                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      0.00
                    </td>

                    {/* Status (Green Pill "Approved") */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#2e7d32] text-white font-bold text-[10px] shadow-2xs">
                        {exp.status || 'Approved'}
                      </span>
                    </td>

                    {/* Actions (Vertical dots ⋮ with Edit dropdown matching Screenshot 1) */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === exp.id ? null : exp.id)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Popup matching Screenshot ("Edit") */}
                      {activeMenuId === exp.id && (
                        <div className="absolute right-4 top-8 w-28 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs">
                          <button
                            onClick={() => {
                              setSelectedEditExpense(exp);
                              if (onEditExpense) onEditExpense(exp);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-rose-600 font-medium cursor-pointer"
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
            1 - {expenses.length} of {expenses.length}
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
