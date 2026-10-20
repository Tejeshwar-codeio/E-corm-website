import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import useToastStore from '../store/useToastStore';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { addToast } = useToastStore();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    addToast('Thank you for subscribing to our premium newsletter!', 'success');
    setEmail('');
  };

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400">
      {/* Features Showcase */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Free Expedited Delivery</h4>
            <p className="text-xs">On orders exceeding $150. Fast tracking enabled.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary-500/10 rounded-xl text-secondary-500">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">30-Day Premium Return</h4>
            <p className="text-xs">Return items in original packaging for instant exchange.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-500/10 rounded-xl text-accent-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Fully Secured Payments</h4>
            <p className="text-xs">Stripe and Razorpay multi-layered fraud validation.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1 space-y-6">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-600 bg-clip-text text-transparent tracking-tight">
            ShopSphere
          </span>
          <p className="text-sm">
            Forging the future of retail. Combining aesthetics, micro-interactions, and high-performance e-commerce mechanics.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" aria-label="Twitter X">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a href="#" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Collections</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="/products?category=Electronics" className="hover:text-primary-500 transition-colors">Electronics</a></li>
            <li><a href="/products?category=Footwear" className="hover:text-primary-500 transition-colors">Premium Footwear</a></li>
            <li><a href="/products?category=Apparel" className="hover:text-primary-500 transition-colors">Tech Apparel</a></li>
            <li><a href="/products?category=Accessories" className="hover:text-primary-500 transition-colors">Smart Accessories</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Company</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="/about" className="hover:text-primary-500 transition-colors">About Us</a></li>
            <li><a href="/contact" className="hover:text-primary-500 transition-colors">Support Center</a></li>
            <li><a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Join the Sphere</h4>
          <p className="text-sm">Subscribe to receive launch announcements, private sales, and seasonal releases.</p>
          <form onSubmit={handleSubscribe} className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:border-primary-500 pr-12 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs">
        <p>© {new Date().getFullYear()} ShopSphere Inc. All rights reserved. Designed for excellence.</p>
      </div>
    </footer>
  );
};

export default Footer;
