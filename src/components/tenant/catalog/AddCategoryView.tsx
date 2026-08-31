import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Department } from '../../../types/catalog';
import { ImageUpload300x300 } from './ImageUpload300x300';

interface AddCategoryViewProps {
  departments: Department[];
  onSave: (name: string, departmentName?: string, image?: string) => void;
  onCancel: () => void;
}

export const AddCategoryView: React.FC<AddCategoryViewProps> = ({ 
  departments, 
  onSave, 
  onCancel 
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert('Please enter category name.');
      return;
    }
    onSave(categoryName.trim(), departmentName, image);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto my-4 text-xs text-slate-700 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-base font-bold text-slate-800">Add Category</h2>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-slate-600 font-medium mb-1.5">
            Category Name *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1.5">
            Department
          </label>
          <select
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <ImageUpload300x300
            value={image}
            onChange={setImage}
            label="Category Picture (Optional)"
            description="Restricted to max 300 × 300 px (Auto-optimized)"
          />
        </div>

        {/* Bottom Actions matching Screenshot */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-start gap-2.5">
          <button
            type="submit"
            className="px-6 py-2 bg-[#0070ba] hover:bg-sky-700 text-white font-bold rounded shadow-xs text-xs transition cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

