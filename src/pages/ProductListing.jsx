import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Star } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Read URL query params
  const keyword = searchParams.get('keyword') || '';
  const initialCategory = searchParams.get('category') || 'All';

  // Filters State
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync category state when URL query changes
  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        keyword,
        category,
        minPrice,
        maxPrice,
        rating,
        sortBy,
        pageNumber: page
      };
      
      // Filter out empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const { data } = await api.get('/api/products', { params });
      setProducts(data.products || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, category, minPrice, maxPrice, rating, sortBy, page]);

  const handleResetFilters = () => {
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const categories = ['All', 'Electronics', 'Footwear', 'Apparel', 'Accessories'];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 space-y-8">
      {/* Listing Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
            {keyword ? `Search Results for "${keyword}"` : 'Explore Catalog'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Showing {products.length} of {total} products</p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Sorting Dropdown */}
          <div className="relative flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="text-xs font-semibold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="md:hidden flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 space-y-8 sticky top-24 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-500" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Category</h4>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setSearchParams(cat === 'All' ? {} : { category: cat });
                    setPage(1);
                  }}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Price Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ($)"
                className="px-3 py-2 text-xs border border-gray-200 dark:border-gray-850 bg-transparent rounded-lg focus:outline-none focus:border-primary-500 w-full dark:text-white"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ($)"
                className="px-3 py-2 text-xs border border-gray-200 dark:border-gray-850 bg-transparent rounded-lg focus:outline-none focus:border-primary-500 w-full dark:text-white"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Minimum Rating</h4>
            <div className="flex flex-col gap-2">
              {[4, 3, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setRating(num);
                    setPage(1);
                  }}
                  className={`text-left text-xs py-2 px-3 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    rating === num
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-accent-500 text-accent-500" />
                  <span>{num} Stars & up</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filters Drawer Panel */}
        {isMobileFiltersOpen && (
          <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
            <div className="w-full bg-white dark:bg-gray-900 rounded-t-[32px] p-6 space-y-6 max-h-[85vh] overflow-y-auto border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-4">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Filter Catalog</h3>
                <div className="flex gap-4">
                  <button onClick={handleResetFilters} className="text-xs text-primary-500 font-semibold cursor-pointer">Reset</button>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="text-xs text-gray-500 font-semibold cursor-pointer">Close</button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setPage(1);
                      }}
                      className={`text-xs px-4 py-2 rounded-full border transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-primary-600 border-primary-600 text-white font-semibold'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Price</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min ($)"
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs w-full dark:text-white focus:outline-none"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max ($)"
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl text-xs w-full dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Minimum Rating</h4>
                <div className="flex gap-2">
                  {[4, 3, 2].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setRating(num);
                        setPage(1);
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs transition-all cursor-pointer ${
                        rating === num
                          ? 'bg-accent-500 border-accent-500 text-white font-semibold'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{num}★ & up</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs cursor-pointer"
              >
                Apply Filters ({products.length} Items)
              </button>
            </div>
          </div>
        )}

        {/* Product Cards Grid Panel */}
        <div className="md:col-span-3 space-y-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonLoader count={6} />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(pages).keys()].map((pNum) => (
                    <button
                      key={pNum + 1}
                      onClick={() => setPage(pNum + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        page === pNum + 1
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {pNum + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center space-y-4">
              <p className="text-gray-400 font-medium">No products match your current search filters.</p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
