import React, { useState } from 'react';
import { FileSpreadsheet, HelpCircle } from 'lucide-react';
import { ManualJournalListView } from './ManualJournalListView';
import { NewManualJournalView } from './NewManualJournalView';
import type { ManualJournal } from '../../../types/journal';
import { INITIAL_JOURNALS } from '../../../types/journal';

export const ManualJournalManagerView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'new' | 'edit'>('list');
  const [editingJournal, setEditingJournal] = useState<ManualJournal | null>(null);

  const handleSaveJournal = (journal: ManualJournal) => {
    const saved = localStorage.getItem('adwiselabs_manual_journals');
    const list: ManualJournal[] = saved ? JSON.parse(saved) : INITIAL_JOURNALS;
    const existingIndex = list.findIndex(j => j.id === journal.id);

    if (existingIndex >= 0) {
      list[existingIndex] = journal;
    } else {
      list.unshift(journal);
    }

    localStorage.setItem('adwiselabs_manual_journals', JSON.stringify(list));
    setViewMode('list');
    setEditingJournal(null);
  };

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* Top Horizontal Sub-tab matching Screenshot 1 */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            onClick={() => { setViewMode('list'); setEditingJournal(null); }}
            className="px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Manual Journal</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <ManualJournalListView
          onOpenNewJournal={() => { setEditingJournal(null); setViewMode('new'); }}
          onEditJournal={(j) => { setEditingJournal(j); setViewMode('edit'); }}
        />
      ) : (
        <NewManualJournalView
          initialJournal={editingJournal}
          onSaveJournal={handleSaveJournal}
          onCancel={() => { setViewMode('list'); setEditingJournal(null); }}
        />
      )}
    </div>
  );
};
