"use client";

import React, { useState, useEffect } from 'react';
import { Award, RefreshCw } from 'lucide-react';

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const userInfoString = localStorage.getItem('userInfo');
      const token = userInfoString ? JSON.parse(userInfoString).token : '';
      const res = await fetch('http://localhost:5000/api/enterprise/sellers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSellers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, commissionRate?: number) => {
    const userInfoString = localStorage.getItem('userInfo');
    const token = userInfoString ? JSON.parse(userInfoString).token : '';
    try {
      const res = await fetch(`http://localhost:5000/api/enterprise/sellers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, commissionRate })
      });
      if (res.ok) {
        alert('Vendor onboarding verification status updated!');
        fetchSellers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-400 text-xs font-bold animate-pulse">Loading vendor directory ledger...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-250/20 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">Marketplace Vendors</h1>
          <p className="text-xs text-gray-400 mt-1">Audit seller registrations, modify commission rates, and execute payouts</p>
        </div>
        <button 
          onClick={fetchSellers}
          className="p-2 rounded-xl border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">Vendor Identity</th>
                <th className="p-4">Contact Email</th>
                <th className="p-4">Commission Split</th>
                <th className="p-4">Sales Volume</th>
                <th className="p-4">Payout Balance</th>
                <th className="p-4">Onboarding Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {sellers.map((sel) => (
                <tr key={sel._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div>
                      <h4 className="font-bold text-gray-905 dark:text-white flex items-center gap-1">
                        {sel.vendorName}
                        {sel.performanceRating >= 4.5 && <Award className="w-3.5 h-3.5 text-amber-500" />}
                      </h4>
                      <p className="text-[9px] text-gray-400 mt-0.5">Rating: {sel.performanceRating.toFixed(1)} ★</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-gray-400">{sel.contactEmail}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        defaultValue={sel.commissionRate}
                        onBlur={(e) => handleUpdateStatus(sel._id, sel.status, Number(e.target.value))}
                        className="w-12 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center font-bold text-gray-900 dark:text-white"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">${sel.sales.toFixed(2)}</td>
                  <td className="p-4 text-gray-400">${sel.payoutBalance.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      sel.status === 'Approved' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : sel.status === 'Pending' 
                        ? 'bg-amber-500/10 text-amber-500' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {sel.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {sel.status !== 'Approved' && (
                      <button 
                        onClick={() => handleUpdateStatus(sel._id, 'Approved')}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer border-none shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                    {sel.status === 'Pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(sel._id, 'Rejected')}
                        className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer border-none shadow-sm"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
