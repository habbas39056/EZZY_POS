import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Printer,
  CreditCard
} from 'lucide-react';
import type { DebitNote } from '../../../types/debitNote';
import { INITIAL_DEBIT_NOTES } from '../../../types/debitNote';
import { ViewDebitNoteRefundView } from './ViewDebitNoteRefundView';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';
import { api } from '../../../services/api';
import { DocumentPrintPreviewModal } from '../common/DocumentPrintPreviewModal';
import type { Invoice } from '../../../types/sales';

interface DebitNotesListViewProps {
  onOpenNewDN: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const DebitNotesListView: React.FC<DebitNotesListViewProps> = ({
  onOpenNewDN,
  currencySymbol = 'Rs'
}) => {
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);

  const loadDebitNotes = async () => {
    try {
      const remote = await api.getDebitNotes();
      if (remote) {
        setDebitNotes(remote);
      } else {
        const saved = localStorage.getItem('adwiselabs_debit_notes');
        setDebitNotes(saved ? JSON.parse(saved) : INITIAL_DEBIT_NOTES);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadDebitNotes();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [printingDN, setPrintingDN] = useState<DebitNote | null>(null);

  // Add Refund Modal State
  const [refundModalDN, setRefundModalDN] = useState<DebitNote | null>(null);
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  const [refundDate, setRefundDate] = useState<string>('');
  const [refundAccount, setRefundAccount] = useState<string>('Cash in Hand');
  const [chequeNo, setChequeNo] = useState<string>('');
  const [refundNotes, setRefundNotes] = useState<string>('');

  const openAddRefundModal = (dn: DebitNote) => {
    setRefundModalDN(dn);
    setRefundAmount(dn.balance || dn.grossTotal);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    setRefundDate(`${day}-${month}-${year}`);
    setRefundAccount('Cash in Hand');
    setChequeNo('');
    setRefundNotes(`Refund received for Debit Note #${dn.debitNoteNumber}`);
    setActiveMenuId(null);
  };

  const handleSaveRefundModal = () => {
    if (!refundModalDN) return;
    const amt = Number(refundAmount) || 0;
    if (amt <= 0) {
      alert('Please enter a valid refund amount.');
      return;
    }
    if (amt > refundModalDN.balance) {
      alert(`Refund amount cannot exceed remaining balance of ${refundModalDN.balance.toFixed(2)}.`);
      return;
    }

    const newBalance = Math.max(0, refundModalDN.balance - amt);
    const updated = debitNotes.map(d => {
      if (d.id === refundModalDN.id) {
        return {
          ...d,
          balance: Number(newBalance.toFixed(2)),
          status: (newBalance === 0 ? 'Completed' : 'Refund') as any
        };
      }
      return d;
    });

    const dnToSave = updated.find(d => d.id === refundModalDN.id);
    if (dnToSave) {
      api.saveDebitNote(dnToSave).catch(() => {});
    }

    setDebitNotes(updated);
    alert(`Refund of ${currencySymbol} ${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })} recorded successfully!`);
    setRefundModalDN(null);
  };

  const handleVoidDebitNote = (dn: DebitNote) => {
    if (confirm(`Are you sure you want to void Debit Note ${dn.debitNoteNumber}?`)) {
      const voidedDn = { ...dn, status: 'Draft' as const, balance: 0 };
      api.saveDebitNote(voidedDn).catch(() => {});
      const updated = debitNotes.map(d => d.id === dn.id ? voidedDn : d);
      setDebitNotes(updated);
      alert(`Debit Note ${dn.debitNoteNumber} has been voided.`);
      setActiveMenuId(null);
    }
  };

  // Full Screen View Refund State
  const [selectedRefundDN, setSelectedRefundDN] = useState<DebitNote | null>(null);

  if (selectedRefundDN) {
    return (
      <ViewDebitNoteRefundView
        debitNote={selectedRefundDN}
        onBack={() => {
          setSelectedRefundDN(null);
          loadDebitNotes();
        }}
        onUpdateDebitNote={async (updated) => {
          await api.saveDebitNote(updated);
          const next = debitNotes.map(d => d.id === updated.id ? updated : d);
          setDebitNotes(next);
          setSelectedRefundDN(updated);
        }}
        currencySymbol={currencySymbol}
      />
    );
  }

  // Kept for signature compatibility
  const saveDebitNotes = (data: DebitNote[]) => {
    setDebitNotes(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this debit note?')) {
      await api.deleteDebitNote(id);
      setDebitNotes(debitNotes.filter(d => d.id !== id));
      setActiveMenuId(null);
    }
  };

  const getDNComputed = (dn: DebitNote): DebitNote => {
    const gross = Number(dn.grossTotal) || 0;
    const tax = Number(dn.totalTax) || 0;
    let bal = typeof dn.balance === 'number' ? dn.balance : gross;
    try {
      const savedRefunds = localStorage.getItem(`adwiselabs_dn_refunds_${dn.id}`);
      if (savedRefunds) {
        const refundsList = JSON.parse(savedRefunds);
        if (Array.isArray(refundsList) && refundsList.length > 0) {
          const paid = refundsList.reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0);
          bal = Math.max(0, Number((gross - paid).toFixed(2)));
        }
      }
    } catch (e) {}
    return {
      ...dn,
      grossTotal: gross,
      totalTax: tax,
      balance: bal,
      status: (bal === 0 ? 'Completed' : (dn.status === 'Draft' ? 'Draft' : 'Refund')) as any
    };
  };

  const computedList = debitNotes.map(getDNComputed);

  const filteredNotes = computedList.filter(dn => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      dn.debitNoteNumber.toLowerCase().includes(q) ||
      (dn.serialNumber && dn.serialNumber.toLowerCase().includes(q)) ||
      dn.supplierName.toLowerCase().includes(q) ||
      dn.grossTotal.toString().includes(q);

    const matchesStatus = !statusFilter || dn.status === statusFilter;
    const matchesDate = isDateInRange(dn.date || dn.createdAt, startDate, endDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalDN = computedList.reduce((acc, d) => acc + (Number(d.grossTotal) || 0), 0);
  const totalTax = computedList.reduce((acc, d) => acc + (Number(d.totalTax) || 0), 0);
  const totalBalance = computedList.reduce((acc, d) => acc + (Number(d.balance) || 0), 0);

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. FILTER & SEARCH CARD                                  */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Debit Note No, Supplier, DN Total */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Debit Note No, Supplier, DN Total
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
              <option value="Refund">Refund</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Search Button (Dark Navy) */}
          <div className="sm:col-span-1 flex items-end">
            <button
              type="button"
              onClick={() => {}}
              className="w-full py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DEBIT NOTES TABLE CONTAINER                           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Debit Notes</h2>

          <button
            onClick={onOpenNewDN}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Debit Note
          </button>
        </div>

        {/* Metrics Summary Strip */}
        <div className="px-5 py-2 bg-slate-50/60 border-b border-slate-200 flex justify-end items-center space-x-6 text-[11px] font-semibold text-slate-700">
          <div>
            <span>Debit Note Total: </span>
            <span className="font-mono font-bold text-slate-900">{totalDN.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span>TAX: </span>
            <span className="font-mono font-bold text-slate-900">{totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span>Balance: </span>
            <span className="font-mono font-bold text-slate-900">{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Full 9-Column Debit Notes Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Debit Note No.</th>
                <th className="px-4 py-2.5">Serial No.</th>
                <th className="px-4 py-2.5">Supplier</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right">Debit Note Total</th>
                <th className="px-4 py-2.5 text-right">TAX</th>
                <th className="px-4 py-2.5 text-right">Balance</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No debit notes found. Click <strong>+ Debit Note</strong> to record a purchase return.
                  </td>
                </tr>
              ) : (
                filteredNotes.map((dn) => (
                  <tr key={dn.id} className="hover:bg-slate-50/80 transition">
                    {/* Debit Note No. */}
                    <td className="px-4 py-3 font-semibold text-[#0070ba] font-mono cursor-pointer hover:underline" onClick={() => setSelectedRefundDN(dn)}>
                      {dn.debitNoteNumber}
                    </td>

                    {/* Serial No. */}
                    <td className="px-4 py-3 font-mono text-[#0070ba] cursor-pointer hover:underline" onClick={() => setSelectedRefundDN(dn)}>
                      {dn.serialNumber || '00001'}
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3 font-medium text-slate-900 capitalize">
                      {dn.supplierName}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {dn.date}
                    </td>

                    {/* Debit Note Total */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {(Number(dn.grossTotal) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* TAX */}
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {(Number(dn.totalTax) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                      {(Number(dn.balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status (Completed Green Pill / Refund Orange Pill) */}
                    <td className="px-4 py-3 text-center">
                      {dn.balance === 0 || dn.status === 'Completed' ? (
                        <span className="inline-block px-3 py-0.5 rounded-full bg-[#2e7d32] text-white font-bold text-[10px] shadow-2xs">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedRefundDN(dn)}
                          className="inline-block px-3 py-0.5 rounded-full bg-[#e65100] hover:bg-orange-700 text-white font-bold text-[10px] transition shadow-2xs cursor-pointer"
                          title="Click to Add Refund"
                        >
                          Refund
                        </button>
                      )}
                    </td>

                    {/* Manage (...) Matching MoneyPex Reference */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === dn.id ? null : dn.id)}
                        className="font-extrabold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-200 transition text-sm tracking-tighter cursor-pointer"
                      >
                        ...
                      </button>

                      {activeMenuId === dn.id && (
                        <div className="absolute right-4 top-8 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs">
                          {dn.balance > 0 || dn.status === 'Refund' ? (
                            <>
                              {/* MoneyPex Screenshot Option 1: Add Refund */}
                              <button
                                onClick={() => {
                                  setSelectedRefundDN(dn);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-slate-700" />
                                <span>Add Refund</span>
                              </button>

                              {/* MoneyPex Screenshot Option 2: Void Debit Note */}
                              <button
                                onClick={() => handleVoidDebitNote(dn)}
                                className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                              >
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">!</span>
                                <span>Void Debit Note</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRefundDN(dn);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Refund</span>
                              </button>
                              <button
                                onClick={() => {
                                  setPrintingDN(dn);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Print</span>
                              </button>
                              <button
                                onClick={() => handleDelete(dn.id)}
                                className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-rose-600 font-medium cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
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
            1 - {debitNotes.length} of {debitNotes.length}
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

      {/* ======================================================== */}
      {/* 3. ADD REFUND MODAL DIALOG                               */}
      {/* ======================================================== */}
      {refundModalDN && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#001e3d] to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Add Debit Note Refund</h3>
              </div>
              <button
                onClick={() => setRefundModalDN(null)}
                className="text-slate-300 hover:text-white transition p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Form */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              {/* Summary Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Debit Note No:</span>
                  <span className="font-mono font-bold text-slate-900">{refundModalDN.debitNoteNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Supplier:</span>
                  <span className="font-semibold text-slate-900">{refundModalDN.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Amount:</span>
                  <span className="font-mono font-semibold text-slate-800">{currencySymbol} {refundModalDN.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Refundable Balance:</span>
                  <span className="font-mono font-bold text-orange-600">{currencySymbol} {refundModalDN.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Refund Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Refund Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    max={refundModalDN.balance}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Refund Date *
                  </label>
                  <DatePicker
                    value={refundDate}
                    onChange={setRefundDate}
                  />
                </div>
              </div>

              {/* Payment Account Head */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Refund Account Head *
                </label>
                <select
                  value={refundAccount}
                  onChange={(e) => setRefundAccount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs bg-white text-slate-800"
                >
                  <option value="Cash in Hand">Cash in Hand (Petty Cash)</option>
                  <option value="Meezan Bank - A/C 023910293">Meezan Bank - A/C 023910293</option>
                  <option value="HBL - Corporate A/C 109283">HBL - Corporate A/C 109283</option>
                  <option value="Bank Al Habib - Current A/C">Bank Al Habib - Current A/C</option>
                  <option value="Standard Chartered">Standard Chartered</option>
                </select>
              </div>

              {/* Cheque / Reference No */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Cheque / Transaction Ref No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHQ-92810 / TXN-0192"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-[#0070ba] text-xs resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRefundModalDN(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-medium text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRefundModal}
                className="px-4 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white rounded font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Save Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRINT MODAL */}
      {printingDN && (
        <DocumentPrintPreviewModal
          documentType="Debit Note"
          document={{
            id: printingDN.id,
            invoiceNumber: printingDN.debitNoteNumber,
            serialNumber: printingDN.serialNumber,
            customerId: printingDN.supplierId,
            customerName: printingDN.supplierName,
            invoiceDate: printingDN.date,
            dueDate: printingDN.dueDate || printingDN.date,
            requiresDeliveryChallan: false,
            discountType: 'Discount by Amount',
            items: printingDN.items.map(item => ({
              ...item,
              itemDescription: item.itemDescription,
            })),
            isTaxInclusive: printingDN.isTaxInclusive,
            subtotal: printingDN.subtotal,
            discount: printingDN.discount,
            totalTax: printingDN.totalTax,
            grossTotal: printingDN.grossTotal,
            balance: printingDN.balance,
            status: printingDN.balance === 0 ? 'Completed' : 'Approved',
            createdAt: printingDN.createdAt
          } as Invoice}
          onClose={() => setPrintingDN(null)}
        />
      )}
    </div>
  );
};
