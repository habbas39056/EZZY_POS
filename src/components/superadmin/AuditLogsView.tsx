import React, { useState } from 'react';
import { FileText, Search, Download } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      (log.targetTenant && log.targetTenant.toLowerCase().includes(search.toLowerCase())) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0070ba]" /> Security & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logging for tenant provisioning, impersonations, permission changes, and billing transactions.
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition self-start sm:self-auto border border-slate-200 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" /> Export Logs JSON
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action code, administrator, tenant, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070ba] focus:bg-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#0070ba] w-full sm:w-auto font-medium"
          >
            <option value="all">All Events ({auditLogs.length})</option>
            <option value="success">Success Events</option>
            <option value="warning">Warnings</option>
            <option value="error">Errors</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Code</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target Organization</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition font-mono text-[11px]">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9.5px] ${
                      log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      log.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    <span className="font-sans font-bold text-slate-900">{log.actorName}</span>
                    <span className="text-slate-400 block text-[10px]">{log.actorRole}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-sans">
                    {log.targetTenant ? (
                      <span className="font-semibold text-[#0070ba]">{log.targetTenant}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-sans text-xs max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
