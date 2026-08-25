import React, { useState } from 'react';
import { Building2, HelpCircle } from 'lucide-react';
import { OrganizationDetailsView } from './OrganizationDetailsView';

export const SettingsManagerView: React.FC = () => {
  const [activeTab] = useState<'org'>('org');

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* Top Horizontal Sub-tab matching layout */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            className={`px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition ${
              activeTab === 'org'
                ? 'bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Organization Details</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Main Settings Content */}
      <OrganizationDetailsView />
    </div>
  );
};
