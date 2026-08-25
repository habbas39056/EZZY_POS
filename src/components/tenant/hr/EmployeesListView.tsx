import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Pencil,
  Trash2
} from 'lucide-react';
import type { Employee } from '../../../types/employee';
import { INITIAL_EMPLOYEES } from '../../../types/employee';
import { DatePicker } from '../../common/DatePicker';
import { isDateInRange } from '../../../utils/dateUtils';

interface EmployeesListViewProps {
  onOpenAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
}

export const EmployeesListView: React.FC<EmployeesListViewProps> = ({
  onOpenAddEmployee,
  onEditEmployee
}) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('adwiselabs_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [nameFilter, setNameFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const saveEmployees = (data: Employee[]) => {
    setEmployees(data);
    localStorage.setItem('adwiselabs_employees', JSON.stringify(data));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      saveEmployees(employees.filter(e => e.id !== id));
      setActiveMenuId(null);
    }
  };

  const filtered = employees.filter(e => {
    if (nameFilter && !e.employeeName.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }
    const matchesDate = isDateInRange(e.createdOn, startDate, endDate);
    return matchesDate;
  });

  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 select-none">
      {/* ======================================================== */}
      {/* 1. TOP SEARCH CARD (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-800 mb-3">Search</h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Employee Name */}
          <div className="sm:col-span-5">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Employee Name
            </label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
            />
          </div>

          {/* Start Date */}
          <div className="sm:col-span-3">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-3">
            <label className="block text-slate-500 font-medium mb-1 text-[11px]">
              End Date
            </label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          {/* Search Button (Dark Navy) */}
          <div className="sm:col-span-1 flex items-end">
            <button
              type="button"
              onClick={() => {}}
              className="w-full py-1.5 bg-[#001e3d] hover:bg-slate-900 text-white font-bold rounded text-xs transition shadow-xs"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. EMPLOYEES TABLE (MATCHING SCREENSHOT 1)               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Employees</h2>

          <button
            onClick={onOpenAddEmployee}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded transition flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#0070ba]" /> Employee
          </button>
        </div>

        {/* Full 7-Column Table matching Screenshot 1 */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[120px]">Employee Code</th>
                <th className="px-4 py-3 min-w-[170px]">Employee Name</th>
                <th className="px-4 py-3 min-w-[160px]">Email</th>
                <th className="px-4 py-3 min-w-[130px]">Phone Number</th>
                <th className="px-4 py-3 min-w-[110px]">Created On</th>
                <th className="px-4 py-3 text-center min-w-[90px]">Status</th>
                <th className="px-4 py-3 text-center min-w-[80px]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No employee records found. Click <strong>+ Employee</strong> to add a team member.
                  </td>
                </tr>
              ) : (
                filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition relative">
                    <td className="px-4 py-3 font-semibold text-slate-800 font-mono">
                      {emp.employeeCode}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {emp.employeeName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {emp.email}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {emp.phoneNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10.5px]">
                      {emp.createdOn}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#2e7d32] text-white font-bold text-[10px] shadow-2xs">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                        className="font-extrabold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded hover:bg-slate-200 transition text-sm tracking-tighter"
                      >
                        ...
                      </button>

                      {activeMenuId === emp.id && (
                        <div className="absolute right-4 top-8 w-32 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left text-xs">
                          <button
                            onClick={() => { onEditEmployee(emp); setActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-medium"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#0070ba]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-rose-600 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
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
