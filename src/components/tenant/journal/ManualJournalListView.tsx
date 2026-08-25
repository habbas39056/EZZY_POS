import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Pencil,
  RotateCcw
} from 'lucide-react';
import type { ManualJournal } from '../../../types/journal';
import { INITIAL_JOURNALS } from '../../../types/journal';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';

interface ManualJournalListViewProps {
  onOpenNewJournal: () => void;
  onEditJournal: (journal: ManualJournal) => void;
}

export const ManualJournalListView: React.FC<ManualJournalListViewProps> = ({
  onOpenNewJournal,
  onEditJournal
}) => {
  const [journals, setJournals] = useState<ManualJournal[]>(() => {
    const saved = localStorage.getItem('adwiselabs_manual_journals');
    return saved ? JSON.parse(saved) : INITIAL_JOURNALS;
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  const saveJournals = (data: ManualJournal[]) => {
    setJournals(data);
    localStorage.setItem('adwiselabs_manual_journals', JSON.stringify(data));
  };

  const handleRevert = (j: ManualJournal) => {
    if (confirm(`Reverse journal ${j.journalId} (${j.narration})?`)) {
      const reversed: ManualJournal = {
        ...j,
        id: `jou_rev_${Date.now()}`,
        journalId: `${j.journalId}-REV`,
        narration: `Reversal of ${j.narration}`,
        status: 'Posted',
        items: j.items.map(item => ({
          ...item,
          id: `ji_rev_${Math.random()}`,
          debit: item.credit,
          credit: item.debit
        }))
      };
      saveJournals([reversed, ...journals]);
      alert(`Journal entry reversed successfully!`);
    }
  };

  const filteredJournals = journals.filter(j => isDateInRange(j.date || j.createdDate, startDate, endDate));

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end max-w-2xl">
          {/* Start Date */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-5">
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
      {/* 2. MANUAL JOURNAL TRANSACTIONS (SCREENSHOT 1)            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Manual Journal Transactions</h2>

          <button
            onClick={onOpenNewJournal}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Journal
          </button>
        </div>

        {/* Full 7-Column Table matching Screenshot 1 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="px-4 py-2.5">Journal Id</th>
                <th className="px-4 py-2.5">Narration</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5">Created Date</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No manual journals match criteria.
                  </td>
                </tr>
              ) : (
                filteredJournals.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-800 font-mono">
                      {j.journalId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {j.narration}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[10.5px]">
                      {j.date}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {j.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {j.createdDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded-full font-bold text-[10px] shadow-2xs ${
                        j.status === 'Posted' ? 'bg-[#2e7d32] text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleRevert(j)}
                          className="p-1 text-slate-600 hover:text-emerald-700 rounded hover:bg-slate-100 transition"
                          title="Reverse Journal"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditJournal(j)}
                          className="p-1 text-slate-600 hover:text-[#0070ba] rounded hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            1 - {journals.length} of {journals.length}
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
