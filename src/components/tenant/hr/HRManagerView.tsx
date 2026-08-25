import React, { useState } from 'react';
import { User, HelpCircle } from 'lucide-react';
import { EmployeesListView } from './EmployeesListView';
import { NewEmployeeModal } from './NewEmployeeModal';
import type { Employee } from '../../../types/employee';
import { INITIAL_EMPLOYEES } from '../../../types/employee';

export const HRManagerView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'new' | 'edit'>('list');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleSaveEmployee = (emp: Employee) => {
    const saved = localStorage.getItem('adwiselabs_employees');
    const list: Employee[] = saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    const existingIndex = list.findIndex(e => e.id === emp.id);

    if (existingIndex >= 0) {
      list[existingIndex] = emp;
    } else {
      list.unshift(emp);
    }

    localStorage.setItem('adwiselabs_employees', JSON.stringify(list));
    setViewMode('list');
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-3 font-sans text-xs text-slate-700 select-none">
      {/* Top Horizontal Sub-tab matching Screenshot 1 */}
      <div className="bg-[#e9edf2] border-b border-slate-300 -mx-4 -mt-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto text-xs font-semibold py-1">
          <button
            onClick={() => { setViewMode('list'); setEditingEmployee(null); }}
            className="px-3 py-1.5 rounded-t-md flex items-center gap-1.5 transition bg-white text-slate-900 border-t-2 border-[#0070ba] font-bold shadow-xs"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Employees</span>
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700 cursor-pointer" />
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <EmployeesListView
          onOpenAddEmployee={() => { setEditingEmployee(null); setViewMode('new'); }}
          onEditEmployee={(emp) => { setEditingEmployee(emp); setViewMode('edit'); }}
        />
      ) : (
        <NewEmployeeModal
          initialEmployee={editingEmployee}
          onSaveEmployee={handleSaveEmployee}
          onClose={() => { setViewMode('list'); setEditingEmployee(null); }}
        />
      )}
    </div>
  );
};
