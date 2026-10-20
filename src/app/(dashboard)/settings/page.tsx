"use client";

import React, { useState } from 'react';
import { Save, Globe, KeyRound, Database } from 'lucide-react';

export default function SettingsPage() {
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(8.25);
  const [stripeSecret, setStripeSecret] = useState('sk_test_••••••••••••••••••••');
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_••••••••••••••••••••');
  const [autoPricing, setAutoPricing] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert('Global configurations saved successfully!');
      setLoading(false);
    }, 800);
  };

  const handleBackup = () => {
    alert('System backup initiated! A compressed archive has been stored securely in object storage.');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-250/20 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">Global Settings</h1>
          <p className="text-xs text-gray-400 mt-1">Configure transactional tax lines, payment gateways, and API tokens</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs font-semibold text-gray-500 dark:text-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> Localization & Taxations
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider">Base Settlement Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                >
                  <option value="USD">USD - United States Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="EUR">EUR - Euro Zone</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider">Standard Tax / GST Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-gray-905 dark:text-white">AI Dynamic Pricing Optimizer</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Let AI auto-adjust pricing suggested intervals</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoPricing} 
                  onChange={(e) => setAutoPricing(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" /> API Gateways & Credentials
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider">Stripe Private Key</label>
                <input
                  type="password"
                  value={stripeSecret}
                  onChange={(e) => setStripeSecret(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider">Razorpay secret token</label>
                <input
                  type="password"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0 h-fit"><Database className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-gray-950 dark:text-white text-sm">Database System Archiving</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-md">Compile a localized archive backup containing orders records, users profiles, and product catalogs configuration.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleBackup}
            className="px-5 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold cursor-pointer transition-colors border-none shrink-0"
          >
            Trigger Full Backup
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-150 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold cursor-pointer transition-colors border-none flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" /> Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
