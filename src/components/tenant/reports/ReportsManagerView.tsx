import React, { useState } from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';
import { ReportsDirectoryView } from './ReportsDirectoryView';
import { ReportDetailView } from './ReportDetailView';

interface ReportsManagerViewProps {
  currencyCode?: string;
  currencySymbol?: string;
  companyName?: string;
}

export const ReportsManagerView: React.FC<ReportsManagerViewProps> = ({
  currencyCode,
  currencySymbol,
  companyName = 'ARKIT Services'
}) => {
  const [activeReport, setActiveReport] = useState<{ id: string; name: string; category: string } | null>(null);

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* Top Horizontal Sub-tab matching Screenshot 1 & 2 */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            onClick={() => setActiveReport(null)}
            className="px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Reports</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Main Content: Directory or Selected Report Detail */}
      {!activeReport ? (
        <ReportsDirectoryView
          onSelectReport={(rep) => setActiveReport(rep)}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
        />
      ) : (
        <ReportDetailView
          reportId={activeReport.id}
          reportName={activeReport.name}
          category={activeReport.category}
          companyName={companyName}
          onBack={() => setActiveReport(null)}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
};
