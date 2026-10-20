import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Award, Zap, Shield, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/api/products?limit=4');
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60', desc: 'Audio, Wearables & Hubs' },
    { name: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60', desc: 'AeroSwift Sprint Series' },
    { name: 'Apparel', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60', desc: 'Tech Performance Shirts' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60', desc: 'Smart Watches & Sleeves' }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-radial from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-6 pt-16">
        {/* Soft Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-secondary-500/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8 text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-500/10 rounded-full">
              <Zap className="w-3 h-3 fill-current" /> Future Forward Retail
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] font-display">
              A New Era of <br />
              <span className="bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
                Digital Elegance
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
              Immerse yourself in precision craftsmanship. Experience intuitive interfaces, smooth transitions, and premium goods curated for innovators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/products"
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                Shop the Catalog
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-250 dark:border-gray-850 hover:bg-white/80 dark:hover:bg-gray-900 rounded-xl text-gray-900 dark:text-white font-bold text-sm flex items-center justify-center transition-all cursor-pointer"
              >
                Our Manifesto
              </Link>
            </div>
          </motion.div>

          {/* Hero Right Media Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-[450px] aspect-square rounded-[32px] overflow-hidden glass-panel border border-white/20 dark:border-gray-800/30 shadow-2xl p-4">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
                alt="ShopSphere Premium Headset"
                className="w-full h-full object-cover rounded-[24px]"
              />
              <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl glass-panel bg-white/70 dark:bg-gray-950/70 border border-white/10 dark:border-gray-800/10 flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Featured Arrival</p>
                  <h4 className="text-sm font-bold text-gray-950 dark:text-white mt-0.5">Vision Pro Max</h4>
                  <p className="text-xs font-semibold text-primary-500 mt-0.5">$899.00</p>
                </div>
                <Link
                  to="/products"
                  className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:scale-105 transition-all shadow-md"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Premium Category Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Shop by Catalog</h2>
            <p className="text-sm text-gray-500 mt-2">Explore handcrafted categories engineered for active styles.</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors mt-4 md:mt-0">
            View all categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${cat.name}`}
              className="group relative h-[360px] rounded-[24px] overflow-hidden border border-gray-200/40 dark:border-gray-800/40 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-6"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
              
              <div className="relative z-20 space-y-2 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">{cat.name}</span>
                <h3 className="text-xl font-bold font-display">{cat.desc}</h3>
                <span className="text-xs font-semibold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Special Seasonal Offer Callout Banner */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[32px] overflow-hidden glass-panel border border-primary-500/10 bg-gradient-to-r from-primary-600/15 via-secondary-500/10 to-accent-500/5 px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary-500/10 blur-[90px] -z-10 pointer-events-none"></div>
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="px-3.5 py-1.5 bg-accent-500 text-white font-bold text-[10px] tracking-wider uppercase rounded-full shadow-sm">
              Limited Release Promo
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-display">
              Seasonal Launch Offer: Save 20%
            </h2>
            <p className="text-sm text-gray-500 max-w-md">
              Unlock a premium 20% discount on all ShopSphere products by entering coupon code <strong className="text-gray-900 dark:text-white underline">SHOPSPHERE20</strong> at check out.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl font-extrabold font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              SHOPSPHERE20
            </span>
            <Link
              to="/products"
              className="px-6 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              Shop Release Now
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Curated Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Featured Essentials</h2>
            <p className="text-sm text-gray-500 mt-2">Curated electronics and accessories crafted for high performance.</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors mt-4 md:mt-0">
            View All Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <SkeletonLoader count={4} />
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p className="text-sm text-gray-400 col-span-full text-center">No products found. Please seed the database.</p>
          )}
        </div>
      </section>

      {/* 5. Trust Badges & Storytelling */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 space-y-4">
          <Award className="w-8 h-8 text-primary-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Nike-inspired Materials</h3>
          <p className="text-sm text-gray-500">
            Breathable, durable, carbon-reinforced components designed to survive high-impact workouts and long daily runs.
          </p>
        </div>
        <div className="p-8 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 space-y-4">
          <Zap className="w-8 h-8 text-secondary-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Apple-level Aesthetics</h3>
          <p className="text-sm text-gray-500">
            Minimalist casing, tactile touch interfaces, and spatial acoustic structures built with premium materials.
          </p>
        </div>
        <div className="p-8 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 space-y-4">
          <Shield className="w-8 h-8 text-accent-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Amazon-fast Integrations</h3>
          <p className="text-sm text-gray-500">
            Instant checkouts, multi-gateway secure verification pipelines, and fully transparent shipment tracking timelines.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
