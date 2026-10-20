"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingCart, Users, Package, AlertTriangle, 
  BrainCircuit, ArrowUpRight, ArrowDownRight, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const userInfoString = localStorage.getItem('userInfo');
      const token = userInfoString ? JSON.parse(userInfoString).token : '';
      const res = await fetch('http://localhost:5000/api/dashboard/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
  const { summary, monthlySales, categorySales, lowStockAlerts, latestOrders } = data;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center border-b border-gray-250/20 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">System Diagnostics</h1>
          <p className="text-xs text-gray-400 mt-1">Review dynamic conversions, shipping lines, and settlements metrics</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="p-2 rounded-xl border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm relative overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Gross Income</span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">${summary.totalSales.toFixed(2)}</h3>
            <p className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-0.5"><ArrowUpRight className="w-3.5 h-3.5" /> +14.2% MoM</p>
          </div>
          <div className="p-3.5 bg-primary-500/10 rounded-2xl text-primary-500 z-10"><TrendingUp className="w-5 h-5" /></div>
        </div>

        <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm relative overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Active Invoices</span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.ordersCount}</h3>
            <p className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-0.5"><ArrowUpRight className="w-3.5 h-3.5" /> +8.5% YoY</p>
          </div>
          <div className="p-3.5 bg-secondary-500/10 rounded-2xl text-secondary-500 z-10"><ShoppingCart className="w-5 h-5" /></div>
        </div>

        <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm relative overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Accounts Active</span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.usersCount}</h3>
            <p className="text-[9px] text-rose-500 font-extrabold flex items-center gap-0.5"><ArrowDownRight className="w-3.5 h-3.5" /> -2.4% last week</p>
          </div>
          <div className="p-3.5 bg-accent-500/10 rounded-2xl text-accent-500 z-10"><Users className="w-5 h-5" /></div>
        </div>

        <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm relative overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Total Listings</span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.productsCount}</h3>
            <p className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-0.5"><ArrowUpRight className="w-3.5 h-3.5" /> +2 new today</p>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500 z-10"><Package className="w-5 h-5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Sales Volume Trend</h3>
          <div className="h-72 w-full text-xs">
            {monthlySales.length === 0 ? (
              <p className="text-center py-20 text-gray-400 font-semibold">No transactions available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', borderRadius: '12px', border: 'none', color: '#fff' }} />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Categories Allocation</h3>
          <div className="h-72 w-full text-xs flex flex-col justify-between">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categorySales.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[10px] font-semibold text-gray-500">
              {categorySales.map((entry: any, index: number) => (
                <span key={entry.name} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name} (${entry.value.toFixed(0)})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">AI Dynamic Pricing Insights</h3>
          </div>
          <p className="text-[10px] text-gray-400 leading-snug">Suggested listing updates based on user demand, checkout rates, and inventory metrics:</p>
          
          <div className="space-y-2.5 text-xs font-semibold">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-gray-900 dark:text-white">AeroSwift Running Pro</p>
                <p className="text-[9px] text-gray-400 mt-0.5">High demand, stock levels stable</p>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                Suggest +$5.50
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-gray-900 dark:text-white">EcoDry Sweatpants</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Slow sales frequency, excess catalog stock</p>
              </div>
              <span className="text-[10px] font-extrabold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg">
                Suggest -$3.00
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary-500" />
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">AI Inventory Demand Forecasts</h3>
          </div>
          <p className="text-[10px] text-gray-400 leading-snug">Predictive stock depletion levels and ordering thresholds for the upcoming month:</p>

          <div className="space-y-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-950 dark:text-white">Footwear Category depletion risk</span>
                <span className="text-rose-500 font-extrabold">CRITICAL (88%)</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-950 dark:text-white">Electronics Category depletion risk</span>
                <span className="text-emerald-500 font-extrabold">LOW (15%)</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Low Stock Alerts
          </h3>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {lowStockAlerts.length === 0 ? (
              <p className="text-center py-6 text-gray-400 text-xs">No active low-stock inventory warnings.</p>
            ) : (
              lowStockAlerts.map((prod: any) => (
                <div key={prod._id} className="p-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 dark:bg-rose-500/10 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{prod.name}</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">{prod.brand} • {prod.category}</p>
                  </div>
                  <span className="text-rose-500 font-extrabold text-xs">{prod.countInStock} left</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Live Invoices Pipeline</h3>
          <div className="overflow-x-auto text-xs font-semibold">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5">Price</th>
                  <th className="py-2.5">Payment</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {latestOrders.map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 font-bold text-gray-900 dark:text-white">
                      {ord.user ? ord.user.name : 'Guest User'}
                    </td>
                    <td className="py-3">{ord.paymentMethod}</td>
                    <td className="py-3 font-bold text-gray-900 dark:text-white">${ord.totalPrice.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        ord.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {ord.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-[9px] font-extrabold uppercase">
                        {ord.isDelivered ? 'Delivered' : 'Processing'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
