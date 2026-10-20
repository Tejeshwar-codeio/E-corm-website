import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw, MessageSquare, Zap } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useToastStore from '../store/useToastStore';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleWishlist, wishlist } = useAuthStore();
  const { addItem, addRecentlyViewed, recentlyViewed, setCartOpen, clearCart } = useCartStore();
  const { addToast } = useToastStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  // Selection states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/products/${id}`);
      setProduct(data);
      setActiveImage(data.images?.[0]?.url || '');
      setSelectedSize(data.sizes?.[0] || '');
      setSelectedColor(data.colors?.[0] || '');
      setQuantity(1);

      // Track recently viewed
      addRecentlyViewed(data);

      // Fetch related recommendations
      const recResponse = await api.get(`/api/products/recommendations?productId=${data._id}`);
      setRelatedProducts(recResponse.data || []);
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // Scroll to top when loading a new product detail page
    window.scrollTo(0, 0);
  }, [id]);

  const isWishlisted = product && wishlist.includes(product._id);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.countInStock === 0) {
      addToast('Sorry, this product is out of stock', 'error');
      return;
    }
    addItem(product, quantity, selectedSize, selectedColor);
    addToast(`${product.name} added to cart`, 'success');
    setCartOpen(true);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product._id);
    addToast(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      isWishlisted ? 'info' : 'success'
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to write a review', 'error');
      return;
    }
    if (!commentInput.trim()) {
      addToast('Please write a comment', 'error');
      return;
    }

    setReviewSubmitLoading(true);
    try {
      await api.post(`/api/products/${product._id}/reviews`, {
        rating: ratingInput,
        comment: commentInput
      });
      addToast('Review submitted successfully!', 'success');
      setCommentInput('');
      fetchProduct(); // Refresh product page
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  // Calculate review star percentage breakdown
  const totalReviews = product?.reviews ? product.reviews.length : 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (product?.reviews) {
    product.reviews.forEach((rev) => {
      const roundedRating = Math.round(rev.rating);
      if (ratingCounts[roundedRating] !== undefined) {
        ratingCounts[roundedRating]++;
      }
    });
  }

  const getPercentage = (stars) => {
    if (totalReviews === 0) return 0;
    return Math.round((ratingCounts[stars] / totalReviews) * 100);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.countInStock === 0) {
      addToast('Sorry, this product is out of stock', 'error');
      return;
    }
    clearCart();
    addItem(product, quantity, selectedSize, selectedColor);
    addToast('Direct checkout initiated!', 'success');
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Loading details from ShopSphere...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Not Found</h2>
        <p className="text-gray-400">The product you are trying to view does not exist or has been removed.</p>
        <Link to="/products" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-semibold inline-block">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 space-y-24">
      {/* Product Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square rounded-[24px] overflow-hidden bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 flex items-center justify-center p-4">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950/20 border transition-all relative flex-shrink-0 cursor-pointer ${
                    activeImage === img.url
                      ? 'border-primary-500 scale-95 ring-2 ring-primary-500/20'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-primary-500">{product.brand}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight font-display">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1">
                {[...Array(5).keys()].map((num) => (
                  <Star
                    key={num}
                    className={`w-4 h-4 ${
                      num < Math.round(product.rating)
                        ? 'text-accent-500 fill-accent-500'
                        : 'text-gray-200 dark:text-gray-800'
                    }`}
                  />
                ))}
                <span className="text-gray-900 dark:text-white font-bold ml-1">{product.rating}</span>
              </div>
              <span>|</span>
              <a href="#reviews" className="hover:underline flex items-center gap-1 text-primary-500">
                <MessageSquare className="w-3.5 h-3.5" />
                {product.numReviews} Verified Reviews
              </a>
            </div>
          </div>

          {/* Pricing & Prime Shipping Badge */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-baseline gap-3">
              {product.discountPrice > 0 ? (
                <>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${product.discountPrice.toFixed(2)}</span>
                  <span className="text-base text-gray-400 line-through font-medium">${product.price.toFixed(2)}</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                    Save ${Math.round(product.price - product.discountPrice)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
              )}
            </div>
            {(product.discountPrice || product.price) > 50 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold text-primary-600 dark:text-primary-400 bg-primary-500/10 dark:bg-primary-500/15 rounded-md shadow-sm">
                ✓ prime Free Shipping
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

          {/* Variant Selectors */}
          <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-850">
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Size</label>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Color</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</label>
              <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl w-32 justify-between p-1 bg-white dark:bg-gray-950">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold text-sm text-gray-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart & Buy Now Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Bag
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-gray-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              Buy Now
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-4 rounded-xl border backdrop-blur-md transition-all shadow-sm cursor-pointer w-fit self-center sm:self-auto ${
                isWishlisted
                  ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-950'
              }`}
            >
              <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Core Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100 dark:border-gray-850 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary-500" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-secondary-500" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-500" />
              <span>Secure Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Panel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct._id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews and Commenting Panel */}
      <section id="reviews" className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-gray-150 dark:border-gray-850 items-start">
        {/* Left Side: Create a Review & Star Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Customer Reviews</h2>
          
          {/* Amazon-style Review Rating Distribution Breakdown Box */}
          <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
              <div>
                <div className="flex items-center">
                  {[...Array(5).keys()].map((num) => (
                    <Star
                      key={num}
                      className={`w-4 h-4 ${
                        num < Math.round(product.rating)
                          ? 'text-accent-500 fill-accent-500'
                          : 'text-gray-200 dark:text-gray-800'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-450 mt-0.5">{totalReviews} customer ratings</p>
              </div>
            </div>

            {/* Dynamic Star Progress Bars */}
            <div className="space-y-2.5 pt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = getPercentage(stars);
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-8 text-right shrink-0">{stars} star</span>
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-accent-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right shrink-0">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 space-y-4 bg-white dark:bg-gray-900">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Share Your Feedback</h3>
              
              {/* Star Rating select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</label>
                <div className="flex gap-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="text-gray-400 hover:text-accent-500 cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${star <= ratingInput ? 'text-accent-500 fill-accent-500' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Comments</label>
                <textarea
                  rows="4"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Review the products size, details, durability..."
                  className="w-full px-4 py-3 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitLoading}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="p-6 rounded-[24px] border border-dashed border-gray-300 dark:border-gray-800 text-center space-y-3">
              <p className="text-sm text-gray-400">Please sign in to write a product review.</p>
              <Link to="/auth" className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-xl inline-block">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Reviews List */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Reviews & Ratings ({product.reviews.length})</h3>
          
          <div className="space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-6">Be the first to review this product. No feedback yet.</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 space-y-3 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{rev.name}</h4>
                      <p className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>
                    {/* Review stars */}
                    <div className="flex gap-0.5">
                      {[...Array(5).keys()].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star < rev.rating ? 'text-accent-500 fill-accent-500' : 'text-gray-200 dark:text-gray-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
