import React, { useState } from 'react';
import type { Project } from '../../../types/project';
import { DatePicker } from '../../common/DatePicker';

interface NewProjectModalProps {
  onClose: () => void;
  onSaveProject: (project: Project) => void;
  initialProject?: Project | null;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  onClose,
  onSaveProject,
  initialProject
}) => {
  const [projectName, setProjectName] = useState(initialProject?.projectName || '');
  const [status, setStatus] = useState<Project['status']>(initialProject?.status || 'In Progress');
  const [estimatedCost, setEstimatedCost] = useState<number | ''>(initialProject?.estimatedCost ?? '');
  const [startDate, setStartDate] = useState(initialProject?.startDate || '');
  const [endDate, setEndDate] = useState(initialProject?.endDate || '');
  const [dueDate, setDueDate] = useState(initialProject?.dueDate || '');
  const [isActive, setIsActive] = useState(initialProject?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      alert('Project Name is required');
      return;
    }

    const projectData: Project = {
      id: initialProject ? initialProject.id : `proj_${Date.now()}`,
      projectName: projectName.trim(),
      status,
      estimatedCost: estimatedCost === '' ? 0 : Number(estimatedCost),
      income: initialProject ? initialProject.income : 0,
      cost: initialProject ? initialProject.cost : 0,
      profit: initialProject ? initialProject.profit : 0,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      dueDate: dueDate.trim(),
      isActive,
      createdAt: initialProject ? initialProject.createdAt : new Date().toISOString()
    };

    onSaveProject(projectData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">
            {initialProject ? 'Edit Project' : 'New Project'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name * */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-600 font-medium mb-1.5 text-xs">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Project['status'])}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Not Started">Not Started</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="block text-slate-600 font-medium mb-1.5 text-xs">
              Estimated Cost
            </label>
            <input
              type="number"
              step="any"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono text-slate-800"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-slate-600 font-medium mb-1.5 text-xs">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-slate-600 font-medium mb-1.5 text-xs">
              End Date
            </label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-slate-600 font-medium mb-1.5 text-xs">
              Due Date
            </label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="DD-MMM-YYYY"
            />
          </div>

          {/* Active Checkbox */}
          <div className="pt-2">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-800 font-semibold text-xs">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#0070ba] rounded border-slate-300"
              />
              <span>Active</span>
            </label>
          </div>

        {/* Bottom Actions matching Screenshot 2 */}
        <div className="pt-6 flex items-center justify-end space-x-3">
          <button
            type="submit"
            className="px-6 py-2 bg-[#70b0ea] hover:bg-sky-600 text-white font-bold rounded shadow-xs text-xs transition"
          >
            {initialProject ? 'Update' : 'Add'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};
