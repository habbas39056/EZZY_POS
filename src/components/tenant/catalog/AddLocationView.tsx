import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Location } from '../../../types/catalog';

interface AddLocationViewProps {
  existingLocations: Location[];
  initialLocation?: Location | null;
  onSave: (name: string, parentLocation?: string) => void;
  onCancel: () => void;
}

export const AddLocationView: React.FC<AddLocationViewProps> = ({ 
  existingLocations, 
  initialLocation,
  onSave, 
  onCancel 
}) => {
  const [locationName, setLocationName] = useState(initialLocation ? initialLocation.name : '');
  const [parentLocation, setParentLocation] = useState(initialLocation ? (initialLocation.parentLocation || '') : '');

  useEffect(() => {
    if (initialLocation) {
      setLocationName(initialLocation.name);
      setParentLocation(initialLocation.parentLocation || '');
    }
  }, [initialLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      alert('Please enter location name.');
      return;
    }
    onSave(locationName.trim(), parentLocation);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto my-4 text-xs text-slate-700 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-base font-bold text-slate-800">
          {initialLocation ? 'Edit Location' : 'Add Location'}
        </h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Locations
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-slate-600 font-medium mb-1.5">
            Location Name *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800 bg-white"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1.5">
            Parent Location
          </label>
          <select
            value={parentLocation}
            onChange={(e) => setParentLocation(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
          >
            <option value="">Select Parent Location</option>
            {existingLocations
              .filter(loc => !initialLocation || loc.id !== initialLocation.id)
              .map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
          </select>
        </div>

        {/* Bottom Actions matching Screenshot 4 */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-start gap-2.5">
          <button
            type="submit"
            className="px-6 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-xs text-xs transition"
          >
            {initialLocation ? 'Update' : 'Add'}
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
