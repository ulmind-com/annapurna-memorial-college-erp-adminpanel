import React, { useState, useEffect } from 'react';
import { History, Search, Shield, Filter, Clock } from 'lucide-react';
import { AuditLog } from '../../types';
import { api } from '../../services/api';
import { formatIST } from '../../utils/date';
import { Pagination } from '../common/Pagination';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getAuditLogs();
        setLogs(res.items);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_email && l.user_email.toLowerCase().includes(search.toLowerCase())) ||
      l.entity_type.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedLogs = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Institutional Security & Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable event tracking in Indian Standard Time (IST) for governance and data integrity
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user email, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {filtered.length} Events Logged
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-3.5 px-5">Timestamp (IST)</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">User & Role</th>
                <th className="py-3.5 px-5">Entity Type</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {formatIST(l.timestamp)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{l.action}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{l.user_email || 'System'}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{l.user_role || 'AUTOMATED'}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {l.entity_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    {l.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 text-xs truncate max-w-xs">
                    {JSON.stringify(l.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 15, 30, 50]}
        />
      </div>
    </div>
  );
};
