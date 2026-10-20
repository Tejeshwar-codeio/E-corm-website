import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Sun, Moon, Heart, User, LogOut, Menu, X, LayoutDashboard, MapPin, Award, Play } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useThemeStore from '../store/useThemeStore';
import useLanguageStore from '../store/useLanguageStore';
import useLocationStore from '../store/useLocationStore';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { theme, toggleTheme } = useThemeStore();
  const { user, logout, wishlist } = useAuthStore();
  const { getCartTotals, setCartOpen, recentlyViewed } = useCartStore();
  const { language, setLanguage, t } = useLanguageStore();
  const { location, setModalOpen } = useLocationStore();

  const { itemsCount } = getCartTotals();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = [];
    if (searchQuery.trim()) {
      queryParams.push(`keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (searchCategory && searchCategory !== 'All') {
      queryParams.push(`category=${encodeURIComponent(searchCategory)}`);
    }
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    navigate(`/products${queryString}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-navbar py-3 shadow-md'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand & Delivery Location Wrapper */}
        <div className="flex items-center gap-6">
          {/* Brand Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            ShopSphere
          </Link>

          {/* Deliver to Location Picker */}
          <button
            onClick={() => setModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs cursor-pointer text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-800/50"
          >
            <span className="p-1.5 rounded bg-primary-500/10 text-primary-500"><MapPin className="w-3.5 h-3.5" /></span>
            <div>
              <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">{t('deliverTo')}</p>
              <p className="font-bold text-gray-800 dark:text-white leading-tight">
                {location.country === 'United States' ? `US ${location.zipCode}` : `${location.country} (${location.zipCode})`}
              </p>
            </div>
          </button>
        </div>

        {/* Amazon-style Prominent Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-lg mx-6 items-center bg-white/95 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all overflow-hidden"
        >
          {/* Category Dropdown */}
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-3 py-2 text-[10px] font-extrabold uppercase text-gray-605 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <option value="All" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">All Departments</option>
            <option value="Electronics" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Electronics</option>
            <option value="Footwear" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Footwear</option>
            <option value="Apparel" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Apparel</option>
            <option value="Accessories" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Accessories</option>
          </select>

          {/* Search input field */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="flex-1 px-4 py-2 text-xs bg-transparent text-gray-900 dark:text-white outline-none border-none"
          />

          {/* Search Submit Button */}
          <button
            type="submit"
            className="p-2.5 bg-accent-500 hover:bg-accent-600 text-white transition-colors cursor-pointer flex items-center justify-center border-none"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Interaction Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Toggle */}
          <div className="relative md:hidden">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="px-4 py-2 text-xs w-48 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-650 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Wishlist Icon */}
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all relative"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </Link>

          {/* Cart Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all relative cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full border-2 border-white dark:border-gray-900">
                {itemsCount}
              </span>
            )}
          </button>

          {/* Amazon-style Premium AccountDropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="hidden sm:flex flex-col items-start text-left px-3 py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer"
            >
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                {user ? `Hello, ${user.name.split(' ')[0]}` : 'Hello, Sign In'}
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1">
                {t('accountLists')} <span className="text-[9px]">▼</span>
              </span>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-[540px] rounded-3xl glass-panel border border-gray-150 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 shadow-2xl p-6 z-50 grid grid-cols-2 gap-6">
                
                {/* Left Column: Lists and Keep Shopping */}
                <div className="border-r border-gray-100 dark:border-gray-800 pr-6 space-y-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Your Lists</h4>
                  <div className="flex flex-col gap-2.5 text-xs font-semibold">
                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="hover:text-primary-500 transition-colors">
                      {t('yourWishlist')}
                    </Link>
                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="hover:text-primary-500 transition-colors">
                      {t('yourRecs')}
                    </Link>
                  </div>
                  
                  {/* Keep Shopping For section */}
                  {recentlyViewed.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">
                        {t('keepShopping')}
                      </h5>
                      <div className="flex gap-2">
                        {recentlyViewed.slice(0, 3).map((prod) => (
                          <Link
                            key={prod._id}
                            to={`/products/${prod._id}`}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="w-12 h-12 rounded-lg border border-gray-200/50 dark:border-gray-800/50 overflow-hidden hover:scale-105 transition-transform"
                          >
                            <img src={prod.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Account Links */}
                <div className="space-y-4 text-xs font-semibold">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Your Account</h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="hover:text-primary-500 transition-colors">
                      {t('yourAccount')}
                    </Link>
                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="hover:text-primary-500 transition-colors">
                      {t('yourOrders')}
                    </Link>
                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="hover:text-primary-500 transition-colors">
                      {t('returns')}
                    </Link>
                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="hover:text-primary-500 transition-colors">
                      {t('recalls')}
                    </Link>
                    {user && user.isAdmin && (
                      <Link to="/admin" onClick={() => setIsProfileDropdownOpen(false)} className="hover:text-amber-500 transition-colors text-amber-500 font-extrabold flex items-center gap-1">
                        ★ Admin Panel
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-1 flex flex-col gap-2.5">
                      <Link to="/auth?switch=true" onClick={() => setIsProfileDropdownOpen(false)} className="hover:text-primary-500 transition-colors">
                        {t('switchAccounts')}
                      </Link>
                      <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="text-secondary-500 hover:opacity-80 transition-opacity">
                        {t('businessAccount')}
                      </Link>
                      {user ? (
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center justify-between text-left text-rose-500 hover:bg-rose-500/5 py-1 px-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>{t('signout')}</span>
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Link
                          to="/auth"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-center flex items-center justify-center gap-1.5 shadow"
                        >
                          {t('signin')}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Secondary Sub-Navbar for Navigation & Deals (Amazon-style) */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-6 mt-3 pt-2.5 border-t border-gray-100/30 dark:border-gray-800/30 items-center justify-between text-xs font-semibold text-gray-605 dark:text-gray-400">
        <div className="flex items-center gap-6">
          <Link to="/products" className="flex items-center gap-1 hover:text-primary-500 transition-colors font-bold text-gray-800 dark:text-white">
            <Menu className="w-3.5 h-3.5" /> All Products
          </Link>
          <Link to="/" className="hover:text-primary-500 transition-colors">
            {t('home')}
          </Link>
          <Link to="/products" className="hover:text-primary-500 transition-colors">
            {t('shop')}
          </Link>
          <Link to="/about" className="hover:text-primary-500 transition-colors">
            {t('about')}
          </Link>
          <Link to="/contact" className="hover:text-primary-500 transition-colors">
            {t('contact')}
          </Link>

        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-accent-600 dark:text-accent-500">
            SHOPSPHERE20 code saves 20%
          </span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] bottom-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md z-30 px-6 py-8 flex flex-col justify-between overflow-y-auto">
          <div className="flex flex-col gap-6 text-xl font-semibold">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary-500 transition-colors">
              {t('home')}
            </Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary-500 transition-colors">
              {t('shop')}
            </Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary-500 transition-colors">
              {t('about')}
            </Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary-500 transition-colors">
              {t('contact')}
            </Link>
             {user && (
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary-500 transition-colors">
                {t('yourAccount')}
              </Link>
            )}
            {user && user.isAdmin && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 text-amber-500 transition-colors font-bold">
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setModalOpen(true);
              }}
              className="text-left hover:text-primary-500 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-5 h-5 text-primary-500" />
              {t('deliverTo')}: {location.zipCode}
            </button>
          </div>

          <div className="pt-8">
            {user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition-colors cursor-pointer font-semibold"
              >
                <LogOut className="w-5 h-5" />
                {t('signout')}
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold flex items-center justify-center shadow-lg"
              >
                {t('signin')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
