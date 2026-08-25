import React, { useState } from 'react';
import { FolderKanban, HelpCircle } from 'lucide-react';
import { ProjectsListView } from './ProjectsListView';
import { NewProjectModal } from './NewProjectModal';
import type { Project } from '../../../types/project';
import { INITIAL_PROJECTS } from '../../../types/project';

export const ProjectsManagerView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'new' | 'edit'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleSaveProject = (project: Project) => {
    const saved = localStorage.getItem('adwiselabs_projects');
    const list: Project[] = saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    const existingIndex = list.findIndex(p => p.id === project.id);

    if (existingIndex >= 0) {
      list[existingIndex] = project;
    } else {
      list.unshift(project);
    }

    localStorage.setItem('adwiselabs_projects', JSON.stringify(list));
    setViewMode('list');
    setEditingProject(null);
  };

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* Top Horizontal Tab matching Screenshot 1 */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            onClick={() => { setViewMode('list'); setEditingProject(null); }}
            className="px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs"
          >
            <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
            <span>Project</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <ProjectsListView
          onOpenAddProject={() => { setEditingProject(null); setViewMode('new'); }}
          onEditProject={(proj) => { setEditingProject(proj); setViewMode('edit'); }}
        />
      ) : (
        <NewProjectModal
          initialProject={editingProject}
          onSaveProject={handleSaveProject}
          onClose={() => { setViewMode('list'); setEditingProject(null); }}
        />
      )}
    </div>
  );
};
