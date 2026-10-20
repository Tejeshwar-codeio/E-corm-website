"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, BrainCircuit, Barcode } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [countInStock, setCountInStock] = useState(50);
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  
  const [_aiLoading, setAiLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data.products || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleGenerateSKU = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const skuCode = `${brand.slice(0, 3).toUpperCase()}-${category.slice(0, 3).toUpperCase()}-${randomSuffix}`;
    setSku(skuCode);
  };

  const handleGenerateAIDescription = async () => {
    if (!name || !brand) {
      alert('Please fill out name and brand first to supply context to the AI.');
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      setDescription(`Introducing the all-new ${name} by ${brand}. Engineered for premium performance, this product features state-of-the-art craftsmanship and aligns seamlessly with your daily active lifestyle. Perfect for users seeking high-end specifications at competitive value.`);
      setAiLoading(false);
    }, 1200);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInfoString = localStorage.getItem('userInfo');
    const token = userInfoString ? JSON.parse(userInfoString).token : '';
    const bodyData = {
      name,
      price,
      brand,
      category,
      countInStock,
      description,
      sku,
      image: '/images/sample.jpg'
    };

    try {
      let res;
      if (isEditing) {
        res = await fetch(`http://localhost:5000/api/products/${isEditing._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      } else {
        res = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
      }

      if (res.ok) {
        fetchProducts();
        closeModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product listing?')) return;
    const userInfoString = localStorage.getItem('userInfo');
    const token = userInfoString ? JSON.parse(userInfoString).token : '';
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (prod: any = null) => {
    if (prod) {
      setIsEditing(prod);
      setName(prod.name);
      setPrice(prod.price);
      setBrand(prod.brand);
      setCategory(prod.category);
      setCountInStock(prod.countInStock);
      setDescription(prod.description || '');
      setSku(prod.sku || '');
    } else {
      setIsEditing(null);
      setName('');
      setPrice(0);
      setBrand('');
      setCategory('Electronics');
      setCountInStock(50);
      setDescription('');
      setSku('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-250/20 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">Products Catalog</h1>
          <p className="text-xs text-gray-400 mt-1">Manage global inventory items, dynamic descriptions, and SKUs</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-none"
        >
          <Plus className="w-4 h-4" /> Create Product
        </button>
      </div>

      <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Quantity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400">Loading catalog items...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400">No products configured in catalog.</td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-[10px] text-gray-400">{prod.sku || 'N/A'}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{prod.name}</td>
                      <td className="p-4">{prod.category}</td>
                      <td className="p-4 font-bold text-gray-450">{prod.brand}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">${prod.price.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          prod.countInStock < 10 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {prod.countInStock} In Stock
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2.5">
                        <button 
                          onClick={() => openModal(prod)}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-gray-500 cursor-pointer transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 cursor-pointer transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-150 dark:border-gray-800">
            <h3 className="text-xl font-extrabold font-display tracking-tight text-gray-900 dark:text-white mb-6">
              {isEditing ? 'Modify Product Listing' : 'Create Product Listing'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs font-semibold text-gray-400">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Brand Partner</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={countInStock}
                    onChange={(e) => setCountInStock(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex justify-between">
                  <span>SKU Code Reference</span>
                  <button 
                    type="button" 
                    onClick={handleGenerateSKU}
                    className="text-[9px] text-amber-500 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-none"
                  >
                    <Barcode className="w-3.5 h-3.5" /> Auto-generate SKU
                  </button>
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. NIK-SHO-8054"
                  className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex justify-between">
                  <span>Sales & Marketing Description</span>
                  <button 
                    type="button" 
                    onClick={handleGenerateAIDescription}
                    className="text-[9px] text-primary-500 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-none"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" /> Generate AI Description
                  </button>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details..."
                  rows={4}
                  className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white leading-normal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-250/20 dark:border-gray-850 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-gray-500 font-extrabold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer border-none font-extrabold flex items-center gap-1.5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
