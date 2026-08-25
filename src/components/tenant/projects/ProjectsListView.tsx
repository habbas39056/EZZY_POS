import React, { useState } from 'react';
import { 
  Plus, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Pencil,
  Trash2
} from 'lucide-react';
import type { Project } from '../../../types/project';
import { INITIAL_PROJECTS } from '../../../types/project';

interface ProjectsListViewProps {
  onOpenAddProject: () => void;
  onEditProject: (project: Project) => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({
  onOpenAddProject,
  onEditProject
}) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('adwiselabs_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  const saveProjects = (data: Project[]) => {
    setProjects(data);
    localStorage.setItem('adwiselabs_projects', JSON.stringify(data));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      saveProjects(projects.filter(p => p.id !== id));
    }
  };

  const filtered = projects.filter(p => {
    if (!statusFilter) return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="flex flex-col sm:flex-row items-end gap-3 max-w-lg">
          <div className="flex-1 w-full">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            >
              <option value="">Select Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Planning">Planning</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {}}
            className="px-6 py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PROJECTS TABLE (MATCHING SCREENSHOT 1)                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Projects</h2>

          <button
            onClick={onOpenAddProject}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Project
          </button>
        </div>

        {/* Decorative Progress Strip matching Screenshot 1 */}
        <div className="h-1 w-full bg-sky-200 flex">
          <div className="h-full bg-[#001e3d] w-1/6" />
        </div>

        {/* Full 7-Column Table matching Screenshot 1 */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[180px]">Project Name</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Estimate</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Income</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Cost</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Profit</th>
                <th className="px-4 py-3 text-center min-w-[100px]">Status</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No project records found. Click <strong>+ Project</strong> to create a new project.
                  </td>
                </tr>
              ) : (
                filtered.map(proj => (
                  <tr key={proj.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {proj.projectName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {proj.estimatedCost ? proj.estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">
                      {proj.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-rose-600">
                      {proj.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {proj.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        proj.status === 'In Progress' ? 'bg-sky-100 text-sky-800' :
                        proj.status === 'On Hold' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onEditProject(proj)}
                          className="p-1 text-slate-600 hover:text-[#0070ba] rounded hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1 text-slate-600 hover:text-rose-600 rounded hover:bg-slate-100 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Footer matching Screenshot 1 */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-end space-x-4 text-[11px] text-slate-500">
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
            1 - {filtered.length} of {filtered.length}
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
    </div>
  );
};
