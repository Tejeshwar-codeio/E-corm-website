import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, ShoppingCart, Users, Package, AlertTriangle, Trash2, Plus, Edit2, X, PlusCircle, Check } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Product edit/create states
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      addToast('Access denied. Admin permissions required.', 'error');
      navigate('/');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, productsRes, ordersRes] = await Promise.all([
        api.get('/api/dashboard/analytics'),
        api.get('/api/products?limit=100'),
        api.get('/api/orders')
      ]);

      setAnalytics(analyticsRes.data);
      setProductsList(productsRes.data.products || []);
      setOrdersList(ordersRes.data || []);
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchData();
    }
  }, [user]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice('');
    setProdCategory('Electronics');
    setProdBrand('');
    setProdStock('');
    setProdDescription('');
    setProdImageUrl('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdPrice(prod.price);
    setProdCategory(prod.category);
    setProdBrand(prod.brand);
    setProdStock(prod.countInStock);
    setProdDescription(prod.description);
    setProdImageUrl(prod.images?.[0]?.url || '');
    setIsModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      price: Number(prodPrice),
      category: prodCategory,
      brand: prodBrand,
      countInStock: Number(prodStock),
      description: prodDescription,
      images: [{ url: prodImageUrl }],
      sizes: prodCategory === 'Footwear' ? ['US 8', 'US 9', 'US 10'] : prodCategory === 'Apparel' ? ['S', 'M', 'L'] : ['Standard'],
      colors: prodCategory === 'Electronics' ? ['Space Gray', 'Silver'] : ['Matte Black', 'Triple Black']
    };

    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload);
        addToast('Product updated successfully', 'success');
      } else {
        await api.post('/api/products', payload);
        addToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      addToast('Failed to save product details', 'error');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${prodId}`);
      addToast('Product deleted from inventory', 'info');
      fetchData();
    } catch (error) {
      addToast('Failed to delete product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (error) {
      addToast('Failed to update order status', 'error');
    }
  };

  const COLORS = ['#2563EB', '#7C3AED', '#F59E0B', '#10B981', '#EC4899'];

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Syncing Admin Dashboard...</p>
      </div>
    );
  }

  const { summary, monthlySales, categorySales, lowStockAlerts } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 dark:border-gray-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">Admin Operations</h1>
          <p className="text-xs text-gray-400 mt-1">Review sales dashboards, order logistics, and product matrices</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              activeTab === 'analytics' ? 'bg-primary-600 text-white' : 'border border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-350 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              activeTab === 'products' ? 'bg-primary-600 text-white' : 'border border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-350 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            Products ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              activeTab === 'orders' ? 'bg-primary-600 text-white' : 'border border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-350 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            Orders ({ordersList.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Analytics graphs & summary cards */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Summary widgets grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm">
              <div className="space-y-1">
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Total Sales</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">${summary.totalSales.toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500"><ShoppingCart className="w-5 h-5" /></div>
            </div>

            <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm">
              <div className="space-y-1">
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Total Orders</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.ordersCount}</h3>
              </div>
              <div className="p-3 bg-secondary-500/10 rounded-xl text-secondary-500"><Package className="w-5 h-5" /></div>
            </div>

            <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm">
              <div className="space-y-1">
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Site Users</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.usersCount}</h3>
              </div>
              <div className="p-3 bg-accent-500/10 rounded-xl text-accent-500"><Users className="w-5 h-5" /></div>
            </div>

            <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm">
              <div className="space-y-1">
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Active Catalog</span>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.productsCount}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Package className="w-5 h-5" /></div>
            </div>
          </div>

          {/* Charts pane */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Volume AreaChart */}
            <div className="lg:col-span-2 p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-primary-500" /> Sales Trend
              </h3>
              <div className="h-72 w-full text-xs">
                {monthlySales.length === 0 ? (
                  <p className="text-center py-20 text-gray-400">No sales data available. Place paid orders to test.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySales}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                      <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Sales Distribution Pie */}
            <div className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4 flex flex-col justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Category Split</h3>
              <div className="h-60 w-full flex items-center justify-center">
                {categorySales.length === 0 ? (
                  <p className="text-center text-xs text-gray-400">No splits available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Low stock notifications */}
          {lowStockAlerts.length > 0 && (
            <div className="p-6 rounded-[24px] border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Inventory Warnings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {lowStockAlerts.map((prod) => (
                  <div key={prod._id} className="p-4 bg-white/70 dark:bg-gray-950/20 border border-amber-500/10 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{prod.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{prod.brand} | {prod.category}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]">
                      {prod.countInStock} Left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Products CRUD Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Product Inventory</h3>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow hover:scale-105 transition-transform cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950/20 text-gray-450 uppercase font-bold">
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-105 dark:divide-gray-850">
                {productsList.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-950/10 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={prod.images?.[0]?.url} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-gray-800" />
                      <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{prod.name}</span>
                    </td>
                    <td className="p-4 text-gray-500">{prod.brand}</td>
                    <td className="p-4 text-gray-500">{prod.category}</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">${prod.price.toFixed(2)}</td>
                    <td className="p-4 font-semibold text-gray-500">{prod.countInStock}</td>
                    <td className="p-4 text-center flex items-center justify-center gap-2 mt-1">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-primary-500 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/5 text-gray-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Orders Shipment management */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Active Orders</h3>
          
          <div className="overflow-x-auto rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full border-collapse text-xs text-left font-medium">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950/20 text-gray-450 uppercase font-bold">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-105 dark:divide-gray-850">
                {ordersList.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-950/10 transition-colors">
                    <td className="p-4 text-gray-900 dark:text-white font-bold">#{order._id}</td>
                    <td className="p-4">{order.user?.name || 'Guest'}</td>
                    <td className="p-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${order.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${order.isDelivered ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="px-2 py-1 text-[10px] border border-gray-250 dark:border-gray-800 rounded bg-transparent text-gray-700 dark:text-gray-200 outline-none cursor-pointer font-bold"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Edit / Create Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-850">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display mb-6">
              {editingProduct ? 'Edit Product Details' : 'Register New Product'}
            </h3>

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Product Name</label>
                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Price ($)</label>
                <input type="number" step="0.01" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white cursor-pointer">
                  <option value="Electronics">Electronics</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Brand</label>
                <input type="text" required value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Stock Volume</label>
                <input type="number" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL</label>
                <input type="text" required value={prodImageUrl} onChange={(e) => setProdImageUrl(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                <textarea rows="4" required value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
              </div>

              <button
                type="submit"
                className="w-full sm:col-span-2 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Product Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
