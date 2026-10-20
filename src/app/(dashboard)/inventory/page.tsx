"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, Layers, ArrowLeftRight } from 'lucide-react';

export default function InventoryPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [transferQty, setTransferQty] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userInfoString = localStorage.getItem('userInfo');
      const token = userInfoString ? JSON.parse(userInfoString).token : '';
      
      const [whRes, supRes, prodRes] = await Promise.all([
        fetch('http://localhost:5000/api/enterprise/warehouses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/enterprise/suppliers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/products')
      ]);

      const whData = await whRes.json();
      const supData = await supRes.json();
      const prodData = await prodRes.json();

      setWarehouses(whData);
      setSuppliers(supData);
      setProducts(prodData.products || prodData);
      
      if (whData.length >= 2) {
        setFromWarehouse(whData[0]._id);
        setToWarehouse(whData[1]._id);
      }
      const allProds = prodData.products || prodData;
      if (allProds.length > 0) {
        setSelectedProduct(allProds[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouse === toWarehouse) {
      alert('Source and destination warehouses must be different.');
      return;
    }
    
    setActionLoading(true);
    try {
      const userInfoString = localStorage.getItem('userInfo');
      const token = userInfoString ? JSON.parse(userInfoString).token : '';
      const res = await fetch('http://localhost:5000/api/enterprise/warehouses/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fromWarehouseId: fromWarehouse,
          toWarehouseId: toWarehouse,
          productId: selectedProduct,
          quantity: Number(transferQty)
        })
      });

      if (res.ok) {
        alert('Stock transferred successfully!');
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'Stock transfer failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-400 text-xs font-bold animate-pulse">Loading Inventory logistics grids...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-250/20 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">Inventory Logistics</h1>
          <p className="text-xs text-gray-400 mt-1">Review multi-warehouse layout allocations, stock transfers, and suppliers</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-2 rounded-xl border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Fulfillment Center Stock Allocations
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {warehouses.map((wh) => (
                <div key={wh._id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{wh.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{wh.location} • Code: {wh.code}</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                      Capacity {wh.capacity} m³
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-gray-500 dark:text-gray-300">
                    {wh.inventory.length === 0 ? (
                      <p className="text-[10px] text-gray-400">No active stock in this warehouse.</p>
                    ) : (
                      wh.inventory.map((inv: any) => (
                        <div key={inv._id} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-950/20 p-2 rounded-xl">
                          <span>{inv.product ? inv.product.name : 'Unknown Product'}</span>
                          <span className="text-gray-900 dark:text-white font-extrabold">{inv.quantity} units</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4" /> Stock Transfer Manager
            </h3>
            <p className="text-[10px] text-gray-400 leading-snug">Transfer items from regional hubs to localized fulfillment centers:</p>

            <form onSubmit={handleTransferStock} className="space-y-4 text-xs font-semibold text-gray-400">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider">Source Warehouse</label>
                <select
                  value={fromWarehouse}
                  onChange={(e) => setFromWarehouse(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                >
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider">Destination Warehouse</label>
                <select
                  value={toWarehouse}
                  onChange={(e) => setToWarehouse(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                >
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                >
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md"
              >
                Execute Stock Transfer
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-4">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Supplier Ledger</h3>
        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-2.5">Supplier Name</th>
                <th className="py-2.5">Contact Agent</th>
                <th className="py-2.5">Email Address</th>
                <th className="py-2.5">Phone Line</th>
                <th className="py-2.5">Payment Terms</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {suppliers.map((sup) => (
                <tr key={sup._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-gray-900 dark:text-white">{sup.name}</td>
                  <td className="py-3">{sup.contactName}</td>
                  <td className="py-3">{sup.email}</td>
                  <td className="py-3">{sup.phone}</td>
                  <td className="py-3 font-mono">{sup.paymentTerms}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold uppercase">
                      {sup.status}
                    </span>
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
