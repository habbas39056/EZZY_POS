import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  CreditCard, 
  FileText, 
  MoreVertical, 
  Printer, 
  Trash2,
  Clock,
  Banknote,
  Info,
  Copy,
  Tag,
  AlarmClock,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';
import type { Bill } from '../../../types/billing';
import { INITIAL_BILLS } from '../../../types/billing';
import { ViewPaymentView } from './ViewPaymentView';
import { NewRecurringBillView } from './NewRecurringBillView';
import { NewDebitNoteView } from './NewDebitNoteView';
import { BillAdjustmentView } from './BillAdjustmentView';
import { BillRemindersView } from './BillRemindersView';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';
import { api } from '../../../services/api';

interface BillsListViewProps {
  onOpenNewBill: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const BillsListView: React.FC<BillsListViewProps> = ({
  onOpenNewBill,
  currencyCode = 'PKR',
  currencySymbol = 'Rs'
}) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBills = async () => {
    try {
      const remote = await api.getBills();
      if (remote) {
        setBills(remote);
      } else {
        const saved = localStorage.getItem('adwiselabs_bills');
        setBills(saved ? JSON.parse(saved) : INITIAL_BILLS);
      }
    } catch (e) {
      console.error('Error loading bills:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Table selection & pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Sub-view navigation states matching Manage actions
  const [selectedPaymentBill, setSelectedPaymentBill] = useState<Bill | null>(null);
  const [selectedRecurringBill, setSelectedRecurringBill] = useState<Bill | null>(null);
  const [selectedDebitNoteBill, setSelectedDebitNoteBill] = useState<Bill | null>(null);
  const [selectedAdjustmentBill, setSelectedAdjustmentBill] = useState<Bill | null>(null);
  const [selectedReminderBill, setSelectedReminderBill] = useState<Bill | null>(null);

  // Kept for signature compatibility, but individual saves happen via API
  const saveBills = async (data: Bill[]) => {
    setBills(data);
  };

  const handleCopyBill = async (bill: Bill) => {
    const copied: Bill = {
      ...bill,
      id: `bill_${Date.now()}`,
      billNumber: `${bill.billNumber}-COPY`,
      createdAt: new Date().toISOString()
    };
    await api.saveBill(copied);
    setBills([copied, ...bills]);
    alert(`Bill ${bill.billNumber} copied successfully as ${copied.billNumber}!`);
  };

  if (selectedAdjustmentBill) {
    return (
      <BillAdjustmentView
        bill={selectedAdjustmentBill}
        currencyCode={currencyCode}
        currencySymbol={currencySymbol}
        onCancel={() => setSelectedAdjustmentBill(null)}
        onSuccess={async (updated) => {
          await api.saveBill(updated);
          setBills(bills.map(b => b.id === updated.id ? updated : b));
          setSelectedAdjustmentBill(null);
        }}
      />
    );
  }

  if (selectedReminderBill) {
    return (
      <BillRemindersView
        bill={selectedReminderBill}
        currencySymbol={currencySymbol}
        onBack={() => setSelectedReminderBill(null)}
      />
    );
  }

  if (selectedPaymentBill) {
    return (
      <ViewPaymentView
        bill={selectedPaymentBill}
        onBack={() => setSelectedPaymentBill(null)}
        onUpdateBill={async (updated) => {
          await api.saveBill(updated);
          setBills(bills.map(b => b.id === updated.id ? updated : b));
        }}
      />
    );
  }

  if (selectedRecurringBill) {
    return (
      <NewRecurringBillView
        initialBill={selectedRecurringBill}
        onSaveRecurring={(rec) => {
          const saved = localStorage.getItem('adwiselabs_recurring_bills');
          const list = saved ? JSON.parse(saved) : [];
          localStorage.setItem('adwiselabs_recurring_bills', JSON.stringify([rec, ...list]));
          setSelectedRecurringBill(null);
          alert(`Recurring Bill created successfully!`);
        }}
        onCancel={() => setSelectedRecurringBill(null)}
      />
    );
  }

  if (selectedDebitNoteBill) {
    return (
      <NewDebitNoteView
        initialBill={selectedDebitNoteBill}
        onSaveDN={async (dn) => {
          await api.saveDebitNote(dn);
          setSelectedDebitNoteBill(null);
          alert(`Debit Note ${dn.debitNoteNumber} created successfully!`);
        }}
        onCancel={() => setSelectedDebitNoteBill(null)}
      />
    );
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredBills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBills.map(b => b.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      await api.deleteBill(id);
      setBills(bills.filter(b => b.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleMakePayment = (bill: Bill) => {
    const updatedBill: Bill = {
      ...bill,
      balance: 0,
      isOverdue: false,
      status: 'Completed' as const
    };
    const updated = bills.map(b => b.id === bill.id ? updatedBill : b);
    saveBills(updated);
    api.saveBill(updatedBill).catch(() => {});
    alert(`Payment completed for Bill ${bill.billNumber}! Balance cleared.`);
    setActiveMenuId(null);
  };

  // Filter logic
  const filteredBills = bills.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      b.billNumber.toLowerCase().includes(q) ||
      (b.serialNumber && b.serialNumber.toLowerCase().includes(q)) ||
      b.supplierName.toLowerCase().includes(q) ||
      b.grossTotal.toString().includes(q);

    const matchesStatus = !statusFilter || b.status === statusFilter;
    const matchesDate = isDateInRange(b.issueDate || b.createdAt, startDate, endDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate live dynamic metrics across all bills
  const totalBillAmount = bills.reduce((acc, b) => acc + (Number(b.grossTotal) || 0), 0);
  const totalTaxAmount = bills.reduce((acc, b) => acc + (Number(b.totalTax) || 0), 0);
  const totalBalanceAmount = bills.reduce((acc, b) => acc + (Number(b.balance) || 0), 0);

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT)                 */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Bill No, Supplier, Bill Total */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Bill No, Supplier, Bill Total
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            />
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
              <option value="Completed">Completed</option>
              <option value="Make Payment">Make Payment</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Search Button (Dark Navy) */}
          <div className="sm:col-span-1 flex items-end">
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
      {/* 2. BILLS TABLE CONTAINER (MATCHING SCREENSHOT)           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Actions Row: Title + Batch Buttons */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-800">Bills</h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Batch Payments wizard ready for selected bills!')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1.5 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Batch Payments</span>
            </button>
            <button
              onClick={() => alert('Batch Bills import/export wizard opened!')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Batch Bills</span>
            </button>
            <button
              onClick={onOpenNewBill}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Bill
            </button>
            <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Summary Strip directly above columns (Screenshot Replica) */}
        <div className="px-5 py-2 bg-slate-50/60 border-b border-slate-200 flex justify-end items-center space-x-6 text-[11px] font-semibold text-slate-700">
          <div>
            <span>Bill Total: </span>
            <span className="font-mono font-bold text-slate-900">{totalBillAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span>TAX: </span>
            <span className="font-mono font-bold text-slate-900">{totalTaxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span>Balance: </span>
            <span className="font-mono font-bold text-slate-900">{totalBalanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. FULL 10-COLUMN BILLS TABLE (MATCHING SCREENSHOT)      */}
        {/* ======================================================== */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredBills.length}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 min-w-[110px]">Bill No.</th>
                <th className="px-4 py-3 min-w-[100px]">Serial No.</th>
                <th className="px-4 py-3 min-w-[160px]">Supplier</th>
                <th className="px-4 py-3 min-w-[110px]">Bill Date</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Bill Total</th>
                <th className="px-4 py-3 text-right min-w-[90px]">TAX</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Balance</th>
                <th className="px-4 py-3 text-center min-w-[100px]">Status</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    No bills found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredBills.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition relative">
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(b.id)}
                        onChange={() => handleToggleSelectOne(b.id)}
                        className="w-3.5 h-3.5 text-[#0070ba] rounded border-slate-300"
                      />
                    </td>

                    {/* Bill No (Clickable Blue Text) */}
                    <td className="px-4 py-3 font-semibold text-[#0070ba] cursor-pointer hover:underline">
                      {b.billNumber}
                    </td>

                    {/* Serial No (Clickable Blue Text) */}
                    <td className="px-4 py-3 font-semibold text-[#0070ba] cursor-pointer hover:underline font-mono">
                      {b.serialNumber || '00600'}
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3 font-medium text-slate-900 capitalize">
                      {b.supplierName}
                    </td>

                    {/* Bill Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {b.issueDate}
                    </td>

                    {/* Bill Total (with Overdue Tag next to it if overdue) */}
                    <td className="px-4 py-3 text-right font-mono text-slate-800">
                      <div className="flex items-center justify-end space-x-2">
                        {b.isOverdue && (
                          <span className="px-2 py-0.5 rounded-full bg-[#800000] text-white font-bold text-[9px] uppercase tracking-wider shadow-2xs">
                            Overdue
                          </span>
                        )}
                        <span className="font-semibold">{b.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>

                    {/* TAX */}
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {b.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                      {b.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status (Completed Green Pill / Make Payment Orange Pill / Draft Blue Pill) */}
                    <td className="px-4 py-3 text-center">
                      {b.balance === 0 || b.status === 'Completed' || b.status === 'paid' ? (
                        <span className="inline-block px-3 py-0.5 rounded-full bg-[#2e7d32] text-white font-bold text-[10px] shadow-2xs">
                          Completed
                        </span>
                      ) : b.status === 'draft' || b.status === 'Draft' ? (
                        <span className="inline-block px-3 py-0.5 rounded-full bg-[#0288d1] text-white font-bold text-[10px] shadow-2xs">
                          Draft
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMakePayment(b)}
                          className="inline-block px-3 py-0.5 rounded-full bg-[#e65100] hover:bg-orange-700 text-white font-bold text-[10px] transition shadow-2xs cursor-pointer"
                          title="Click to record payment"
                        >
                          Make Payment
                        </button>
                      )}
                    </td>

                    {/* Manage (•••) Dropdown Button matching Screenshot 1 */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(prev => (prev === b.id ? null : b.id));
                        }}
                        className="font-bold text-sky-700 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-100 transition text-sm tracking-widest cursor-pointer"
                        title="Manage Bill"
                      >
                        •••
                      </button>

                      {/* Dropdown Popup matching Screenshot 1 */}
                      {activeMenuId && activeMenuId === b.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-4 top-8 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-left text-xs"
                        >
                          {/* 1. Recurring */}
                          <button
                            onClick={() => {
                              setSelectedRecurringBill(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <Clock className="w-4 h-4 text-slate-700" />
                            <span>Recurring</span>
                          </button>

                          {/* 2. Add Payment */}
                          <button
                            onClick={() => {
                              setSelectedPaymentBill(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-slate-700" />
                            <span>Add Payment</span>
                          </button>

                          {/* 3. Copy Bill */}
                          <button
                            onClick={() => {
                              handleCopyBill(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <Copy className="w-4 h-4 text-slate-700" />
                            <span>Copy Bill</span>
                          </button>

                          {/* 4. Add Debit Note */}
                          <button
                            onClick={() => {
                              setSelectedDebitNoteBill(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-slate-700" />
                            <span>Add Debit Note</span>
                          </button>

                          {/* 5. Bill Adjustment */}
                          <button
                            onClick={() => {
                              setSelectedAdjustmentBill(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <Tag className="w-4 h-4 text-slate-700" />
                            <span>Bill Adjustment</span>
                          </button>

                          {/* 6. Set Reminder */}
                          <button
                            onClick={() => {
                              setSelectedReminderBill(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <AlarmClock className="w-4 h-4 text-slate-700" />
                            <span>Set Reminder</span>
                          </button>

                          {/* 7. Void Bill */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to VOID Bill "${b.billNumber}"?`)) {
                                const updated = bills.map(item => item.id === b.id ? { ...item, status: 'Void' as any, balance: 0 } : item);
                                saveBills(updated);
                                alert(`Bill ${b.billNumber} has been marked as VOID.`);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-medium transition cursor-pointer"
                          >
                            <Info className="w-4 h-4 text-slate-700" />
                            <span>Void Bill</span>
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

        {/* 4. Pagination Footer matching Moneypex structure */}
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
            1 - {bills.length} of {bills.length}
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
