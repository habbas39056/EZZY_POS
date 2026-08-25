import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Region } from '../../../types/catalog';

interface AddRegionViewProps {
  existingRegions: Region[];
  initialRegion?: Region | null;
  onSave: (name: string, parentRegion?: string) => void;
  onCancel: () => void;
}

export const AddRegionView: React.FC<AddRegionViewProps> = ({ 
  existingRegions, 
  initialRegion,
  onSave, 
  onCancel 
}) => {
  const [regionName, setRegionName] = useState(initialRegion ? initialRegion.name : '');
  const [parentRegion, setParentRegion] = useState(initialRegion ? (initialRegion.parentRegion || '') : '');

  useEffect(() => {
    if (initialRegion) {
      setRegionName(initialRegion.name);
      setParentRegion(initialRegion.parentRegion || '');
    }
  }, [initialRegion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionName.trim()) {
      alert('Please enter region name.');
      return;
    }
    onSave(regionName.trim(), parentRegion);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto my-4 text-xs text-slate-700 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-base font-bold text-slate-800">
          {initialRegion ? 'Edit Region' : 'Add Region'}
        </h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Regions
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-slate-600 font-medium mb-1.5">
            Region Name *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800 bg-white"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1.5">
            Parent Region
          </label>
          <select
            value={parentRegion}
            onChange={(e) => setParentRegion(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
          >
            <option value="">Select Parent Region</option>
            {existingRegions
              .filter(reg => !initialRegion || reg.id !== initialRegion.id)
              .map(reg => (
                <option key={reg.id} value={reg.name}>{reg.name}</option>
              ))}
          </select>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-start gap-2.5">
          <button
            type="submit"
            className="px-6 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-xs text-xs transition"
          >
            {initialRegion ? 'Update' : 'Add'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};
