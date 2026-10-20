"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Truck, MapPin, Printer, RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const userInfoString = localStorage.getItem('userInfo');
      const token = userInfoString ? JSON.parse(userInfoString).token : '';
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
      if (data.length > 0) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, statusField: string, value: boolean) => {
    const userInfoString = localStorage.getItem('userInfo');
    const token = userInfoString ? JSON.parse(userInfoString).token : '';
    let endpoint = `http://localhost:5000/api/orders/${id}`;
    if (statusField === 'isPaid') endpoint += '/pay';
    else if (statusField === 'isDelivered') endpoint += '/deliver';

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Order logistics status updated successfully!');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const printShippingLabel = (order: any) => {
    alert(`----------------------------------------\nFASTLOGISTICS COURIER PARTNER LABEL\n----------------------------------------\nAWB Tracking: AWB-${order._id.substring(16).toUpperCase()}\nFulfillment Center: WH-NY-01\nRecipient Name: ${order.shippingAddress.address}\nCourier Service: Economy Air Line\n----------------------------------------`);
  };

  const downloadMockInvoice = (order: any) => {
    alert(`SHOPSPHERE CORP ENTERPRISE INVOICE\n========================================\nInvoice ID: INV-${order._id.substring(16).toUpperCase()}\nPayment: ${order.paymentMethod}\nSubtotal: $${order.itemsPrice.toFixed(2)}\nTax (GST): $${order.taxPrice.toFixed(2)}\nShipping fee: $${order.shippingPrice.toFixed(2)}\nTotal Amount: $${order.totalPrice.toFixed(2)}\n========================================`);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-400 text-xs font-bold animate-pulse">Loading orders pipeline logistics...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-250/20 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">Orders & Logistics</h1>
          <p className="text-xs text-gray-400 mt-1">Review live delivery status, process transactions, refunds, and label printing</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="p-2 rounded-xl border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-sm h-[650px] flex flex-col">
          <div className="overflow-y-auto flex-1 text-xs font-semibold">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-gray-400 font-bold uppercase tracking-wider sticky top-0">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Logistics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400">No client orders recorded.</td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr 
                      key={ord._id} 
                      onClick={() => setSelectedOrder(ord)}
                      className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        selectedOrder?._id === ord._id ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="p-4 font-mono text-[10px] text-gray-400">#{ord._id.substring(16).toUpperCase()}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{ord.user?.name || 'Guest User'}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">${ord.totalPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          ord.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {ord.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold uppercase tracking-wider text-[9px]">
                        <span className={`px-2 py-0.5 rounded-full ${
                          ord.isDelivered ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'
                        }`}>
                          {ord.isDelivered ? 'Delivered' : 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {selectedOrder ? (
            <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] p-6 space-y-5 text-xs font-semibold">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Order Detail</h3>
                  <p className="text-[9px] text-gray-400 font-mono mt-0.5">#{selectedOrder._id.toUpperCase()}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => printShippingLabel(selectedOrder)}
                    className="p-2 rounded-lg border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    onClick={() => downloadMockInvoice(selectedOrder)}
                    className="p-2 rounded-lg border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white line-clamp-1 flex-1 pr-4">{item.name}</span>
                      <span className="text-gray-400 font-mono text-[10px] shrink-0">{item.quantity} x ${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Shipping Address</h4>
                <p className="text-gray-900 dark:text-white leading-normal">
                  {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
                </p>
              </div>

              <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Logistics Status Timeline</h4>
                <div className="space-y-4 pl-3 relative border-l border-gray-200 dark:border-gray-800/80 ml-1.5 mt-2">
                  <div className="relative">
                    <span className="absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <p className="font-bold text-gray-900 dark:text-white">Order Placed & Confirmed</p>
                    <p className="text-[8px] text-gray-400">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full ${selectedOrder.isPaid ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}></span>
                    <p className="font-bold text-gray-900 dark:text-white">Invoice Settlement Paid</p>
                    <p className="text-[8px] text-gray-400">{selectedOrder.isPaid ? `Settled on ${new Date(selectedOrder.paidAt).toLocaleString()}` : 'Payment verification pending'}</p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -left-[17px] top-0.5 w-2.5 h-2.5 rounded-full ${selectedOrder.isDelivered ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}></span>
                    <p className="font-bold text-gray-900 dark:text-white">Package Dispatched & Shipped</p>
                    <p className="text-[8px] text-gray-400">{selectedOrder.isDelivered ? `Delivered on ${new Date(selectedOrder.deliveredAt).toLocaleString()}` : 'In transit logistics processing'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                {!selectedOrder.isPaid && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'isPaid', true)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer border-none shadow"
                  >
                    Confirm Payment
                  </button>
                )}
                {!selectedOrder.isDelivered && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'isDelivered', true)}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer border-none shadow"
                  >
                    Dispatch / Deliver
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-20 text-gray-400 text-xs font-semibold">Select an invoice to inspect logistics status.</p>
          )}
        </div>
      </div>
    </div>
  );
}
