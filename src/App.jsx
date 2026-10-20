import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/ToastContainer';
import LocationModal from './components/LocationModal';
import AIChatbot from './components/AIChatbot';

// Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';

// State Stores
import useThemeStore from './store/useThemeStore';
import useAuthStore from './store/useAuthStore';
import useCartStore from './store/useCartStore';

function App() {
  const { initTheme } = useThemeStore();
  const { user, fetchWishlist } = useAuthStore();
  const { loadCartFromBackend } = useCartStore();

  useEffect(() => {
    // Initialize Theme (dark/light) once on mount
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    // Load active customer state on startup
    if (user) {
      fetchWishlist();
      loadCartFromBackend();
    }
  }, [user, fetchWishlist, loadCartFromBackend]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        {/* Core Layout Items */}
        <Navbar />
        <CartDrawer />
        <ToastContainer />
        <LocationModal />
        <AIChatbot />

        {/* Content routing view port */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
