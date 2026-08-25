import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CheckCircle,
  FileText,
  X
} from 'lucide-react';
import type { Quotation } from '../../../types/quotation';
import { INITIAL_QUOTATIONS } from '../../../types/quotation';
import type { Region } from '../../../types/catalog';
import { INITIAL_REGIONS } from '../../../types/catalog';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';

import { api } from '../../../services/api';

interface QuotationsListViewProps {
  onOpenNewQuotation: () => void;
  onConvertToInvoice?: (quotation: Quotation) => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const QuotationsListView: React.FC<QuotationsListViewProps> = ({
  onOpenNewQuotation,
  onConvertToInvoice
}) => {
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('adwiselabs_quotations');
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const loadQuotations = async () => {
    try {
      const remote = await api.getQuotations();
      if (remote && Array.isArray(remote) && remote.length > 0) {
        setQuotations(remote);
        localStorage.setItem('adwiselabs_quotations', JSON.stringify(remote));
        return;
      }
    } catch (e) {}

    try {
      const saved = localStorage.getItem('adwiselabs_quotations');
      if (saved) setQuotations(JSON.parse(saved));
      else setQuotations(INITIAL_QUOTATIONS);
    } catch (e) {}
  };

  useEffect(() => {
    loadQuotations();
    const handleStorageChange = () => loadQuotations();
    window.addEventListener('storage', handleStorageChange);
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  const [regions] = useState<Region[]>(() => {
    const saved = localStorage.getItem('adwiselabs_catalog_regions');
    return saved ? JSON.parse(saved) : INITIAL_REGIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Conversion Notes Modal
  const [activeConversionNote, setActiveConversionNote] = useState<Quotation | null>(null);

  const filteredQuotations = quotations.filter(q => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      q.quotationNumber.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      q.grossTotal.toString().includes(term);

    const matchesStatus = !statusFilter || q.status === statusFilter;
    const matchesRegion = !regionFilter || q.region === regionFilter;
    const matchesDate = isDateInRange(q.date, startDate, endDate);
    return matchesSearch && matchesStatus && matchesRegion && matchesDate;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Quotation No, Customer, Total */}
          <div className="sm:col-span-4">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Quotation No, Customer, Total
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
          <div className="sm:col-span-1">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select</option>
              <option value="Closed">Closed</option>
              <option value="Partial">Partial</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Region */}
          <div className="sm:col-span-2">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Region
            </label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Region</option>
              {regions.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
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
      {/* 2. QUOTATIONS TABLE CONTAINER (MATCHING SCREENSHOT 1)    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Quotations</h2>

          <button
            onClick={onOpenNewQuotation}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Quotation
          </button>
        </div>

        {/* Full 7-Column Table matching Screenshot 1 */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[130px]">Quotation No.</th>
                <th className="px-4 py-3 min-w-[180px]">Customer</th>
                <th className="px-4 py-3 min-w-[110px]">Date</th>
                <th className="px-4 py-3 min-w-[110px]">Due Date</th>
                <th className="px-4 py-3 text-right min-w-[120px]">Total Amount</th>
                <th className="px-4 py-3 text-center min-w-[100px]">Status</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No quotations found. Click <strong>+ Quotation</strong> to create a new quotation.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition relative">
                    {/* Quotation No. (Clickable Blue Link) */}
                    <td className="px-4 py-3 font-semibold text-[#0070ba] font-mono cursor-pointer hover:underline">
                      {q.quotationNumber}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 font-medium text-slate-900 capitalize">
                      {q.customerName}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {q.date}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {q.dueDate || '-'}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {q.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Badges matching Screenshot 1 */}
                    <td className="px-4 py-3 text-center">
                      {q.status === 'Closed' ? (
                        <span className="inline-block px-3.5 py-0.5 rounded-full bg-[#2e7d32] text-white font-bold text-[10px] shadow-2xs">
                          Closed
                        </span>
                      ) : (
                        <span className="inline-block px-3.5 py-0.5 rounded-full bg-[#e65100] text-white font-bold text-[10px] shadow-2xs">
                          Partial
                        </span>
                      )}
                    </td>

                    {/* Manage (...) with Convert to Invoice and Conversion Notes */}
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === q.id ? null : q.id);
                        }}
                        className="font-extrabold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-200 transition text-sm tracking-tighter cursor-pointer"
                      >
                        ...
                      </button>

                      {activeMenuId === q.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-4 top-8 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs"
                        >
                          {/* Option 1: Convert to Invoice (shown for Partial status) */}
                          {q.status !== 'Closed' && (
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                if (onConvertToInvoice) {
                                  onConvertToInvoice(q);
                                }
                              }}
                              className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#0070ba]" />
                              <span>Convert to Invoice</span>
                            </button>
                          )}

                          {/* Option 2: Conversion Notes */}
                          <button
                            onClick={() => {
                              setActiveConversionNote(q);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Conversion Notes</span>
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
            1 - {filteredQuotations.length} of {filteredQuotations.length}
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
      {/* 4. CONVERSION NOTES MODAL DIALOG                         */}
      {/* ======================================================== */}
      {activeConversionNote && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Conversion Notes - Quotation #{activeConversionNote.quotationNumber}
              </h3>
              <button
                onClick={() => setActiveConversionNote(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 text-sky-900 font-medium">
                {activeConversionNote.conversionNotes || `Quotation ${activeConversionNote.quotationNumber} converted to Sales Invoice for ${activeConversionNote.customerName}.`}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Customer: <strong>{activeConversionNote.customerName}</strong></span>
                <span>Amount: <strong>{activeConversionNote.grossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveConversionNote(null)}
                className="px-4 py-1.5 bg-[#001e3d] text-white font-semibold rounded text-xs hover:bg-slate-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
