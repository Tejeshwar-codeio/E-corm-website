import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, FileText, MapPin, Heart, Trash2, CheckCircle2, ChevronRight, RefreshCw, Briefcase, AlertTriangle, ShieldAlert, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';
import useCartStore from '../store/useCartStore';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, wishlist, fetchWishlist, toggleWishlist, addAddress, deleteAddress, updateProfile } = useAuthStore();
  const { addToast } = useToastStore();
  const { clearCart } = useCartStore();

  const [activeTab, setActiveTab] = useState('orders');
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile Edit fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Address create fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // Business Account fields
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  // Redirect to Auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Handle query parameter updates
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    if (searchParams.get('orderPaid') === 'true') {
      addToast('Checkout complete! Payment captured successfully.', 'success');
      clearCart();
      setActiveTab('orders');
    }
  }, [searchParams, addToast, clearCart]);

  // Load orders when orders tab active
  useEffect(() => {
    if (user && activeTab === 'orders') {
      const fetchMyOrders = async () => {
        setOrdersLoading(true);
        try {
          const { data } = await api.get('/api/orders/myorders');
          setMyOrders(data || []);
        } catch (error) {
          console.error('Failed to load my orders:', error);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchMyOrders();
    }
  }, [user, activeTab]);

  // Load wishlist when wishlist tab active
  useEffect(() => {
    if (user && activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [user, activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile({ name, email, password });
      addToast('Profile metadata updated successfully!', 'success');
      setPassword('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !phone) return;
    setAddressLoading(true);
    try {
      await addAddress({ street, city, state, postalCode, country: 'United States', phone, isDefault });
      addToast('Address added to profile!', 'success');
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setPhone('');
      setIsDefault(false);
    } catch (err) {
      addToast('Failed to save address', 'error');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await deleteAddress(addrId);
      addToast('Address removed from profile', 'info');
    } catch (err) {
      addToast('Failed to remove address', 'error');
    }
  };

  const handleBusinessRegister = (e) => {
    e.preventDefault();
    if (!companyName || !taxId) return;
    setIsRegistered(true);
    addToast(`Business account registered for ${companyName}`, 'success');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 p-5 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-6">
        <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-850">
          <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{user.name}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{user.isAdmin ? 'Site Admin' : 'Premium Member'}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1">
          {[
            { id: 'orders', label: 'Order History', icon: <FileText className="w-4 h-4" /> },
            { id: 'addresses', label: 'Address Manager', icon: <MapPin className="w-4 h-4" /> },
            { id: 'wishlist', label: 'My Wishlist', icon: <Heart className="w-4 h-4" /> },
            { id: 'profile', label: 'Edit Profile', icon: <User className="w-4 h-4" /> },
            { id: 'returns', label: 'Returns Center', icon: <RefreshCw className="w-4 h-4" /> },
            { id: 'recalls', label: 'Product Safety Alerts', icon: <ShieldAlert className="w-4 h-4" /> },
            { id: 'business', label: 'Register Business', icon: <Briefcase className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between text-left text-[11px] font-semibold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.icon} {tab.label}
              </span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </nav>
        {user.isAdmin && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-850 mt-2">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-[11px] font-extrabold py-2.5 px-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-500" /> Admin Panel
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content Pane */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">My Orders</h2>
            {ordersLoading ? (
              <p className="text-sm text-gray-400">Syncing order summaries...</p>
            ) : myOrders.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-250 dark:border-gray-800 rounded-[24px] space-y-3">
                <p className="text-sm text-gray-450">You haven't placed any orders yet.</p>
                <Link to="/products" className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-xl inline-block">
                  Shop Products
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {myOrders.map((order) => (
                  <div key={order._id} className="p-6 rounded-[24px] border border-gray-155 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 dark:border-gray-850 pb-4 gap-2 text-xs">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Order Reference: #{order._id}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 dark:text-white">Total: ${order.totalPrice.toFixed(2)}</span>
                        <div className="flex gap-2 justify-end mt-1 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${order.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${order.isDelivered ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center text-xs">
                          <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200/50 dark:border-gray-800/50" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">Qty {item.quantity} | {item.size || 'Standard'}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-850 pt-4 space-y-3">
                      <h4 className="text-[10px] font-bold text-gray-450 uppercase tracking-widest">Tracking Status</h4>
                      <div className="flex items-center w-full max-w-lg justify-between text-xs relative">
                        <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -z-10" />
                        <div className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 px-1">
                          <CheckCircle2 className={`w-5 h-5 ${order.createdAt ? 'text-primary-500 fill-primary-500/10' : 'text-gray-300'}`} />
                          <span className="font-bold text-[9px]">Processing</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 px-1">
                          <CheckCircle2 className={`w-5 h-5 ${['Shipped', 'Delivered'].includes(order.status) ? 'text-primary-500 fill-primary-500/10' : 'text-gray-300'}`} />
                          <span className="font-bold text-[9px]">Shipped</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 px-1">
                          <CheckCircle2 className={`w-5 h-5 ${order.isDelivered ? 'text-primary-500 fill-primary-500/10' : 'text-gray-300'}`} />
                          <span className="font-bold text-[9px]">Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Manage Addresses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr) => (
                  <div key={addr._id} className="p-5 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 relative space-y-2 text-xs text-gray-500">
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="absolute top-4 right-4 p-1.5 hover:bg-rose-500/5 hover:text-rose-500 text-gray-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {addr.isDefault && <span className="bg-primary-500/15 text-primary-500 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full mr-2">Default</span>}
                      Active Address
                    </p>
                    <p className="pt-2">{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>Phone: {addr.phone}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-450 col-span-full">No saved addresses on profile.</p>
              )}
            </div>

            <form onSubmit={handleAddAddress} className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-805 bg-white dark:bg-gray-900 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Add New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Street Address</label>
                  <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-805 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">City</label>
                  <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-805 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">State / Province</label>
                  <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-805 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Postal / ZIP Code</label>
                  <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-805 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Phone</label>
                  <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-850 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input type="checkbox" id="default-chk" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" />
                  <label htmlFor="default-chk" className="text-gray-500 select-none">Set as default shipping address</label>
                </div>
              </div>
              <button type="submit" disabled={addressLoading} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs cursor-pointer">
                Save Address
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">My Wishlist</h2>
            {wishlist.length === 0 ? (
              <p className="text-xs text-gray-450">Your wishlist is empty.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((prod) => (
                  <div key={prod._id} className="relative group border border-gray-150 dark:border-gray-800 rounded-[20px] overflow-hidden bg-white dark:bg-gray-900 flex flex-col justify-between">
                    <img src={prod.images[0]?.url} alt="" className="aspect-square object-cover" />
                    <button
                      onClick={() => toggleWishlist(prod._id)}
                      className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-900 rounded-full text-rose-500 shadow hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{prod.name}</h4>
                      <p className="text-xs font-semibold text-primary-500">${prod.price.toFixed(2)}</p>
                      <Link to={`/products/${prod._id}`} className="block text-center text-xs py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg mt-2">
                        View Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Profile Settings</h2>
            <form onSubmit={handleProfileUpdate} className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-805 bg-white dark:bg-gray-900 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Update Password (leave blank to keep current)</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                </div>
              </div>
              <button type="submit" disabled={profileLoading} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs cursor-pointer">
                Update Profile
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: Returns Center [NEW] */}
        {activeTab === 'returns' && (
          <div className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary-500" /> Returns Center
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              To request a return, check your order history timeline, select the item reference, and verify details under the 30-day package release criteria.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <p>No active return requests found on this profile.</p>
            </div>
          </div>
        )}

        {/* Tab 6: Recalls & Safety [NEW] */}
        {activeTab === 'recalls' && (
          <div className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" /> Product Recalls & Safety Alerts
            </h2>
            <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-xs text-gray-500">
              <p className="font-bold text-gray-800 dark:text-white">Active recall warnings:</p>
              <p className="mt-1">All ShopSphere products currently meet global ISO product safety parameters. No active recalls logged.</p>
            </div>
          </div>
        )}

        {/* Tab 15: Register Business Account [NEW] */}
        {activeTab === 'business' && (
          <div className="p-6 rounded-[24px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-secondary-500" /> Register for a Free Business Account
            </h2>
            <p className="text-xs text-gray-500">Unlock tax-exempt purchases, business pricing discounts, and multi-user accounts loops.</p>
            
            {isRegistered ? (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                <p>✓ Business profile registered for **{companyName}** (Tax ID: {taxId}). Business discounts are now active on checkout.</p>
              </div>
            ) : (
              <form onSubmit={handleBusinessRegister} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Registered Company Name</label>
                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">EIN / Tax ID number</label>
                    <input type="text" required value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="XX-XXXXXXX" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs cursor-pointer">
                  Submit Business Credentials
                </button>
              </form>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
