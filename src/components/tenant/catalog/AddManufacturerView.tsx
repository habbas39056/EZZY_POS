import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface AddManufacturerViewProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const AddManufacturerView: React.FC<AddManufacturerViewProps> = ({ onSave, onCancel }) => {
  const [manufacturerName, setManufacturerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturerName.trim()) {
      alert('Please enter manufacturer name.');
      return;
    }
    onSave(manufacturerName.trim());
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto my-4 text-xs text-slate-700 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-base font-bold text-slate-800">Add Manufacturer</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Manufacturers
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-600 font-medium mb-1.5">
            Manufacturer Name *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={manufacturerName}
            onChange={(e) => setManufacturerName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800"
          />
        </div>

        {/* Bottom Actions matching Screenshot 2 */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-start gap-2.5">
          <button
            type="submit"
            className="px-6 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-xs text-xs transition"
          >
            Add
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
