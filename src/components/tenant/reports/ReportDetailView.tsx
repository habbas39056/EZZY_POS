import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight 
} from 'lucide-react';
import { generateAgedPayables, generateAgedReceivables, generateGenericReportData } from '../../../utils/reportEngine';
import { exportToCSV } from '../../../utils/csvExport';

interface ReportDetailViewProps {
  reportId: string;
  reportName: string;
  category?: string;
  companyName: string;
  onBack: () => void;
  currencyCode?: string;
  currencySymbol?: string;
}

const MONTHS_LIST = [
  'August 2026',
  'July 2026',
  'June 2026',
  'May 2026',
  'April 2026',
  'March 2026',
  'February 2026',
  'January 2026',
  'December 2025'
];

export const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  reportId,
  reportName,
  companyName,
  onBack,
  currencyCode = 'PKR'
}) => {
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [isGenerated, setIsGenerated] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // Parse Month and Previous Months for Aging headers
  const getPeriodHeaders = () => {
    return {
      current: 'Current',
      m1: 'February',
      m2: 'January',
      m3: 'December',
      older: 'Older'
    };
  };

  const periodHeaders = getPeriodHeaders();

  const agedPayablesData = React.useMemo(() => generateAgedPayables(selectedMonth), [selectedMonth]);
  const agedReceivablesData = React.useMemo(() => generateAgedReceivables(selectedMonth), [selectedMonth]);
  const genericReportData = React.useMemo(() => generateGenericReportData(reportId, selectedMonth, selectedMonth), [reportId, selectedMonth]);

  const handleExportCSV = () => {
    if (reportId.includes('aged_payables')) {
      exportToCSV(agedPayablesData, `Aged_Payables_${selectedMonth}`);
    } else if (reportId.includes('aged_rec')) {
      exportToCSV(agedReceivablesData, `Aged_Receivables_${selectedMonth}`);
    } else {
      const exportData = genericReportData.rows.map(r => {
        const obj: Record<string, any> = {};
        genericReportData.columns.forEach((col, idx) => {
          obj[col] = r[idx];
        });
        return obj;
      });
      exportToCSV(exportData, `${reportId}_${selectedMonth}`);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none pb-12">
      {/* ======================================================== */}
      {/* 1. TOP CONFIGURATION CARD (MATCHING SCREENSHOT 1)        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Title Bar with Back Action */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#0070ba]">
            {reportName}
          </h2>
          <button
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Reports
          </button>
        </div>

        {/* Filter Controls Row matching Screenshot 1 */}
        <div className="flex flex-col sm:flex-row items-end gap-3">
          {/* Date Select */}
          <div className="flex-1 w-full max-w-xl">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Date
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800 font-medium"
            >
              {MONTHS_LIST.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Get Report Button (Dark Navy) */}
          <button
            type="button"
            onClick={() => setIsGenerated(true)}
            className="px-6 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs shrink-0"
          >
            Get Report
          </button>

          {/* Export Button (Green) */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-6 py-1.5 bg-[#2e7d32] hover:bg-emerald-700 text-white font-bold rounded text-xs transition flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. GENERATED REPORT STATEMENT (MATCHING SCREENSHOT 2)    */}
      {/* ======================================================== */}
      {isGenerated && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Centered Statement Header matching Screenshot 2 */}
          <div className="text-center space-y-1 py-2">
            <h3 className="text-base font-extrabold text-slate-900">
              {reportName.replace(' Report', '')}
            </h3>
            <p className="text-xs font-bold text-slate-800">
              {companyName || 'ARKIT Services'}
            </p>
            <p className="text-xs font-semibold text-slate-600 font-mono">
              {selectedMonth}
            </p>
          </div>

          {/* Table Render based on Report Type */}
          {reportId.includes('aged_payables') ? (
            /* AGED PAYABLES TABLE MATCHING SCREENSHOT 2 */
            <div className="border border-slate-200 rounded-lg overflow-x-auto min-h-[360px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5 min-w-[180px]">Supplier Name</th>
                    <th className="px-4 py-2.5 text-center">{periodHeaders.current}</th>
                    <th className="px-4 py-2.5 text-center">{periodHeaders.m1}</th>
                    <th className="px-4 py-2.5 text-center">{periodHeaders.m2}</th>
                    <th className="px-4 py-2.5 text-center">{periodHeaders.m3}</th>
                    <th className="px-4 py-2.5 text-right">{periodHeaders.older}</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {agedPayablesData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{row.name}</td>
                      <td className="px-4 py-2.5 text-center text-slate-400 font-mono">{row.current}</td>
                      <td className="px-4 py-2.5 text-center text-slate-400 font-mono">{row.m1}</td>
                      <td className="px-4 py-2.5 text-center text-slate-400 font-mono">{row.m2}</td>
                      <td className="px-4 py-2.5 text-center text-slate-700 font-mono">
                        {typeof row.m3 === 'number' ? row.m3.toLocaleString('en-US', { minimumFractionDigits: 2 }) : row.m3}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-800">
                        {typeof row.older === 'number' ? row.older.toLocaleString('en-US', { minimumFractionDigits: 2 }) : row.older}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                        {row.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : reportId.includes('aged_rec') ? (
            /* AGED RECEIVABLES TABLE */
            <div className="border border-slate-200 rounded-lg overflow-x-auto min-h-[360px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5 min-w-[180px]">Customer Name</th>
                    <th className="px-4 py-2.5 text-right">{periodHeaders.current}</th>
                    <th className="px-4 py-2.5 text-right">{periodHeaders.m1}</th>
                    <th className="px-4 py-2.5 text-right">{periodHeaders.m2}</th>
                    <th className="px-4 py-2.5 text-right">{periodHeaders.m3}</th>
                    <th className="px-4 py-2.5 text-right">{periodHeaders.older}</th>
                    <th className="px-4 py-2.5 text-right">Total Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {agedReceivablesData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{row.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{typeof row.current === 'number' ? row.current.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{typeof row.m1 === 'number' ? row.m1.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{typeof row.m2 === 'number' ? row.m2.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{typeof row.m3 === 'number' ? row.m3.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{typeof row.older === 'number' ? row.older.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-extrabold text-[#0070ba]">{row.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* GENERAL DYNAMIC STATEMENT TABLE (GENERIC ENGINE) */
            <div className="border border-slate-200 rounded-lg overflow-x-auto min-h-[360px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    {genericReportData.columns.map((col, idx) => (
                      <th key={idx} className="px-4 py-2.5">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {genericReportData.rows.length > 0 ? (
                    genericReportData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 transition">
                        {row.map((cell: any, cIdx: number) => (
                          <td key={cIdx} className="px-4 py-2.5 font-medium text-slate-800">
                            {cell === null || cell === undefined ? '-' : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={genericReportData.columns.length} className="px-4 py-8 text-center text-slate-400">
                        No data available for this report.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Pagination Footer matching Screenshot 2 */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-4 text-[11px] text-slate-500">
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
              1 - {agedPayablesData.length} of {agedPayablesData.length}
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
      )}
    </div>
  );
};
