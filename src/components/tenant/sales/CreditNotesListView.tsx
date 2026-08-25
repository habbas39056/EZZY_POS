import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CreditCard,
  PlusCircle,
  Trash2,
  MoreVertical
} from 'lucide-react';
import type { CreditNote } from '../../../types/creditNote';
import { INITIAL_CREDIT_NOTES } from '../../../types/creditNote';
import { ViewCreditNoteRefundView } from './ViewCreditNoteRefundView';
import { AddCreditNoteRefundModal } from './AddCreditNoteRefundModal';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';
import { api } from '../../../services/api';

interface CreditNotesListViewProps {
  onOpenNewCreditNote: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const CreditNotesListView: React.FC<CreditNotesListViewProps> = ({
  onOpenNewCreditNote,
  currencySymbol = 'Rs'
}) => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(() => {
    const saved = localStorage.getItem('adwiselabs_credit_notes');
    return saved ? JSON.parse(saved) : INITIAL_CREDIT_NOTES;
  });

  useEffect(() => {
    const load = async () => {
      try {
        const remote = await api.getCreditNotes();
        if (remote && Array.isArray(remote) && remote.length > 0) {
          setCreditNotes(remote);
          localStorage.setItem('adwiselabs_credit_notes', JSON.stringify(remote));
        }
      } catch (e) {}
    };
    load();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [viewingRefundCN, setViewingRefundCN] = useState<CreditNote | null>(null);
  const [refundingCN, setRefundingCN] = useState<CreditNote | null>(null);

  const saveCreditNotes = (data: CreditNote[]) => {
    setCreditNotes(data);
    localStorage.setItem('adwiselabs_credit_notes', JSON.stringify(data));
  };

  const filteredCNs = creditNotes.filter(cn => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      cn.creditNoteNumber.toLowerCase().includes(q) ||
      cn.customerName.toLowerCase().includes(q) ||
      cn.grossTotal.toString().includes(q);
    const matchesDate = isDateInRange(cn.date || '', startDate, endDate);
    return matchesSearch && matchesDate;
  });

  const totalCN = creditNotes.reduce((acc, c) => acc + (Number(c.grossTotal) || 0), 0);
  const totalTax = creditNotes.reduce((acc, c) => acc + (Number(c.totalTax) || 0), 0);
  const totalBalance = creditNotes.reduce((acc, c) => acc + (Number(c.balance) || 0), 0);

  if (viewingRefundCN) {
    return (
      <ViewCreditNoteRefundView
        creditNote={viewingRefundCN}
        onBack={() => setViewingRefundCN(null)}
        onUpdateCreditNote={(updated) => {
          const updatedList = creditNotes.map(c => c.id === updated.id ? updated : c);
          saveCreditNotes(updatedList);
          setViewingRefundCN(updated);
        }}
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
          {/* Credit Note No, Customer, Credit Note Total */}
          <div className="sm:col-span-6">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Credit Note No, Customer, Credit Note Total
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
      {/* 2. CREDIT NOTES TABLE (MATCHING SCREENSHOT 1)            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Credit Notes</h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewCreditNote}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Credit Note
            </button>

            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Summary Strip (Exact values from Screenshot 1) */}
        <div className="px-5 py-2 bg-slate-50/60 border-b border-slate-200 flex justify-end items-center space-x-6 text-[11px] font-semibold text-slate-700">
          <div>
            <span>Credit Note Total: </span>
            <span className="font-mono font-bold text-slate-900">{totalCN.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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

        {/* Full 8-Column Table matching Screenshot 1 */}
        <div className="overflow-x-auto min-h-[340px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Credit Note No.</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right">Credit Note Total</th>
                <th className="px-4 py-2.5 text-right">TAX</th>
                <th className="px-4 py-2.5 text-right">Balance</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredCNs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No credit notes found. Click <strong>+ Credit Note</strong> to create a new credit note.
                  </td>
                </tr>
              ) : (
                filteredCNs.map(cn => (
                  <tr key={cn.id} className="hover:bg-slate-50/80 transition relative">
                    {/* Credit Note No. (Clickable Blue Link) */}
                    <td className="px-4 py-3 font-semibold text-[#0070ba] font-mono cursor-pointer hover:underline">
                      {cn.creditNoteNumber}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 font-medium text-slate-900 capitalize">
                      {cn.customerName}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {cn.date}
                    </td>

                    {/* Credit Note Total */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {cn.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* TAX */}
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {cn.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                      {cn.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Badges matching Moneypex */}
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        let displayStatus: string = cn.status || 'Refund';
                        let badgeClass = 'bg-[#f57c00] text-white';

                        if (cn.balance <= 0 && cn.grossTotal > 0) {
                          displayStatus = 'Refunded';
                          badgeClass = 'bg-blue-600 text-white';
                        } else if (cn.refunds && cn.refunds.length > 0 && cn.balance > 0) {
                          displayStatus = 'Partially Refunded';
                          badgeClass = 'bg-amber-600 text-white';
                        } else if (displayStatus === 'Approved' || displayStatus === 'Completed' || displayStatus === 'Refund') {
                          displayStatus = 'Refund';
                          badgeClass = 'bg-[#f57c00] text-white';
                        } else if (displayStatus === 'Draft') {
                          displayStatus = 'Draft';
                          badgeClass = 'bg-slate-500 text-white';
                        }

                        return (
                          <span className={`inline-block px-3.5 py-0.5 rounded-full font-bold text-[10px] shadow-2xs ${badgeClass}`}>
                            {displayStatus}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Manage (...) with Add Refund and View Refund options */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === cn.id ? null : cn.id)}
                        className="font-extrabold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-200 transition text-sm tracking-tighter"
                      >
                        ...
                      </button>

                      {activeMenuId === cn.id && (
                        <div className="absolute right-4 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs divide-y divide-slate-100">
                          <div className="py-0.5">
                            {/* Add Refund */}
                            {cn.balance > 0 && cn.status !== 'Draft' && (
                              <button
                                onClick={() => {
                                  setViewingRefundCN(cn);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-sky-50 text-slate-800 font-medium transition"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-[#0070ba]" />
                                <span>Add Refund</span>
                              </button>
                            )}

                            {/* View Refund */}
                            <button
                              onClick={() => {
                                setViewingRefundCN(cn);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium transition"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Refund</span>
                            </button>
                          </div>

                          {/* Delete */}
                          <div className="py-0.5">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete Credit Note ${cn.creditNoteNumber}?`)) {
                                  const updated = creditNotes.filter(c => c.id !== cn.id);
                                  saveCreditNotes(updated);
                                }
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 text-red-600 font-medium transition"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Refund Modal */}
        {refundingCN && (
          <AddCreditNoteRefundModal
            creditNote={refundingCN}
            currencySymbol={currencySymbol}
            onClose={() => setRefundingCN(null)}
            onSaveRefund={(updatedCN) => {
              const updated = creditNotes.map(c => c.id === updatedCN.id ? updatedCN : c);
              saveCreditNotes(updated);
              setRefundingCN(null);
            }}
          />
        )}

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
            1 - {filteredCNs.length} of {filteredCNs.length}
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
