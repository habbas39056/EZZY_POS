import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Receipt, 
  Landmark, 
  FileSpreadsheet, 
  Package, 
  Users2, 
  FolderKanban, 
  MapPin, 
  Layers, 
  Truck, 
  Star 
} from 'lucide-react';
import { REPORT_CATEGORIES } from '../../../types/reports';
import type { ReportCategory } from '../../../types/reports';
import { ReportViewerModal } from './ReportViewerModal';

interface ReportsDirectoryViewProps {
  onSelectReport: (report: { id: string; name: string; category: string }) => void;
  currencyCode?: string;
  currencySymbol?: string;
}

export const ReportsDirectoryView: React.FC<ReportsDirectoryViewProps> = ({
  onSelectReport,
  currencyCode,
  currencySymbol
}) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('adwiselabs_favorite_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedReport, setSelectedReport] = useState<{ id: string; name: string; category: string } | null>(null);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('adwiselabs_favorite_reports', JSON.stringify(updated));
  };

  const getIcon = (catId: string) => {
    switch (catId) {
      case 'purchases': return <ShoppingCart className="w-4 h-4 text-[#0070ba]" />;
      case 'sales': return <Receipt className="w-4 h-4 text-[#0070ba]" />;
      case 'financial': return <Landmark className="w-4 h-4 text-[#0070ba]" />;
      case 'accounting': return <FileSpreadsheet className="w-4 h-4 text-[#0070ba]" />;
      case 'inventory': return <Package className="w-4 h-4 text-[#0070ba]" />;
      case 'tax': return <FileSpreadsheet className="w-4 h-4 text-[#0070ba]" />;
      case 'employee': return <Users2 className="w-4 h-4 text-[#0070ba]" />;
      case 'project': return <FolderKanban className="w-4 h-4 text-[#0070ba]" />;
      case 'location': return <MapPin className="w-4 h-4 text-[#0070ba]" />;
      case 'batch_location': return <Layers className="w-4 h-4 text-[#0070ba]" />;
      case 'distribution': return <Truck className="w-4 h-4 text-[#0070ba]" />;
      default: return <FileSpreadsheet className="w-4 h-4 text-[#0070ba]" />;
    }
  };

  // Divide into left & right column according to screenshot layout
  const leftColumnCatIds = ['purchases', 'sales', 'financial', 'accounting'];
  const rightColumnCatIds = ['inventory', 'tax', 'employee', 'project', 'location', 'batch_location', 'distribution'];

  const leftCategories = REPORT_CATEGORIES.filter(c => leftColumnCatIds.includes(c.id));
  const rightCategories = REPORT_CATEGORIES.filter(c => rightColumnCatIds.includes(c.id));

  const renderCard = (cat: ReportCategory) => (
    <div key={cat.id} className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
      {/* Category Header matching Screenshot */}
      <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 flex items-center space-x-2">
        {getIcon(cat.id)}
        <h3 className="text-xs font-bold text-slate-800 tracking-wide">{cat.title}</h3>
      </div>

      {/* Reports List matching Screenshot */}
      <div className="divide-y divide-slate-100 text-xs">
        {cat.reports.map(rep => {
          const isFav = favorites.includes(rep.id);
          return (
            <div
              key={rep.id}
              onClick={() => onSelectReport({ id: rep.id, name: rep.name, category: cat.title })}
              className="px-4 py-2 flex items-center justify-between hover:bg-sky-50/50 cursor-pointer group transition"
            >
              <span className="text-slate-700 group-hover:text-[#0070ba] transition font-medium text-[11px]">
                {rep.name}
              </span>

              <button
                type="button"
                onClick={(e) => toggleFavorite(rep.id, e)}
                className="p-1 text-slate-300 hover:text-amber-500 transition"
              >
                <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="font-sans text-xs text-slate-700 select-none pb-12">
      {/* 2-Column Responsive Grid matching Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {leftCategories.map(renderCard)}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {rightCategories.map(renderCard)}
        </div>
      </div>

      {/* Modal Report Viewer */}
      {selectedReport && (
        <ReportViewerModal
          reportId={selectedReport.id}
          reportName={selectedReport.name}
          category={selectedReport.category}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};
