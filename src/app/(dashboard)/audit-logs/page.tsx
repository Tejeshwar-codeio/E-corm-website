"use client";

import React, { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const userInfoString = localStorage.getItem('userInfo');
      const token = userInfoString ? JSON.parse(userInfoString).token : '';
      const res = await fetch('http://localhost:5000/api/enterprise/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'User', 'Action', 'Details', 'IP Address', 'User Agent'];
    const csvRows = [headers.join(',')];

    for (const log of logs) {
      const values = [
        new Date(log.createdAt).toISOString(),
        log.user ? log.user.name : 'Unknown User',
        `"${log.action.replace(/"/g, '""')}"`,
        `"${log.details.replace(/"/g, '""')}"`,
        log.ipAddress || 'N/A',
        `"${(log.userAgent || 'N/A').replace(/"/g, '""')}"`
      ];
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-400 text-xs font-bold animate-pulse">Loading system audit trails...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-250/20 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">System Audit Trail</h1>
          <p className="text-xs text-gray-400 mt-1">Review chronologically tracked administrative operations and download datasets</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-none"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={fetchLogs}
            className="p-2 rounded-xl border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Operator</th>
                <th className="p-4">Operation Details</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">No system events logged.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-[9px] font-extrabold uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{log.user?.name || 'System Operator'}</td>
                    <td className="p-4 text-gray-450 leading-relaxed">{log.details}</td>
                    <td className="p-4 font-mono text-gray-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
