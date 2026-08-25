import React, { useState } from 'react';
import type { Employee } from '../../../types/employee';

interface NewEmployeeModalProps {
  onClose: () => void;
  onSaveEmployee: (employee: Employee) => void;
  initialEmployee?: Employee | null;
}

export const NewEmployeeModal: React.FC<NewEmployeeModalProps> = ({
  onClose,
  onSaveEmployee,
  initialEmployee
}) => {
  const [employeeCode, setEmployeeCode] = useState(initialEmployee?.employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [firstName, setFirstName] = useState(initialEmployee?.firstName || '');
  const [lastName, setLastName] = useState(initialEmployee?.lastName || '');
  const [email, setEmail] = useState(initialEmployee?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(initialEmployee?.phoneNumber || '');
  const [commissionOnSales, setCommissionOnSales] = useState<number | ''>(initialEmployee?.commissionOnSales ?? '');
  const [isActive, setIsActive] = useState(initialEmployee?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim()) {
      alert('Please enter Employee Code.');
      return;
    }
    if (!firstName.trim()) {
      alert('Please enter First Name.');
      return;
    }
    if (!lastName.trim()) {
      alert('Please enter Last Name.');
      return;
    }
    if (!email.trim()) {
      alert('Please enter Email.');
      return;
    }

    const getTodayFormatted = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = now.toLocaleString('en-US', { month: 'short' });
      const year = now.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const newEmp: Employee = {
      id: initialEmployee ? initialEmployee.id : `emp_${Date.now()}`,
      employeeCode: employeeCode.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      employeeName: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      commissionOnSales: Number(commissionOnSales) || 0,
      isActive,
      createdOn: initialEmployee ? initialEmployee.createdOn : getTodayFormatted()
    };

    onSaveEmployee(newEmp);
    onClose();
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 max-w-4xl mx-auto my-3 text-xs text-slate-700 font-sans select-none space-y-6">
      {/* Header matching Screenshot 2 */}
      <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
        {initialEmployee ? 'Edit Employee' : 'Add Employee'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Employee Code * */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            Employee Code *
          </label>
          <input
            type="text"
            required
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            className="w-full px-3 py-2 border-2 border-sky-400 rounded-md focus:outline-none focus:border-[#0070ba] text-xs font-mono text-slate-800 bg-white"
          />
        </div>

        {/* First Name * */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            First Name *
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
          />
        </div>

        {/* Last Name * */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            Last Name *
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
          />
        </div>

        {/* Email * */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            Email *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs bg-white text-slate-800"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            Phone Number
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 03000065202"
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono bg-white text-slate-800"
          />
        </div>

        {/* Commission on Sales % */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5 text-xs">
            Commission on Sales %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={commissionOnSales}
            onChange={(e) => setCommissionOnSales(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#0070ba] text-xs font-mono bg-white text-slate-800"
          />
        </div>

        {/* Status */}
        <div className="pt-2 space-y-1.5">
          <label className="block text-slate-600 font-medium text-xs">
            Status
          </label>
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
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition"
          >
            Close
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#70b0ea] hover:bg-sky-600 text-white font-bold rounded shadow-xs text-xs transition"
          >
            {initialEmployee ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};
