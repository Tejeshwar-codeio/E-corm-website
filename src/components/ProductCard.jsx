import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useToastStore from '../store/useToastStore';

const ProductCard = ({ product }) => {
  const { toggleWishlist, wishlist } = useAuthStore();
  const { addItem, setCartOpen } = useCartStore();
  const { addToast } = useToastStore();

  const isWishlisted = wishlist.includes(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select default size and color if available
    const defaultSize = product.sizes?.[0] || '';
    const defaultColor = product.colors?.[0] || '';
    
    addItem(product, 1, defaultSize, defaultColor);
    addToast(`${product.name} added to cart`, 'success');
    setCartOpen(true);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
    addToast(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      isWishlisted ? 'info' : 'success'
    );
  };

  return (
    <div className="group relative rounded-[20px] bg-white dark:bg-gray-900 border border-gray-150/80 dark:border-gray-800/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
      {/* Product Image Panel */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-950/20">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 cubic-bezier(0.15, 1, 0.3, 1) group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleWishlistToggle}
            className={`p-2.5 rounded-full border backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
                : 'bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-950'
            }`}
          >
            <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Offer Tag */}
        {product.discountPrice > 0 && (
          <span className="absolute top-4 left-4 px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-accent-500 text-white rounded-full shadow-sm">
            Save ${Math.round(product.price - product.discountPrice)}
          </span>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 rounded-xl bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-gray-900 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-gray-900 dark:hover:bg-white transition-all shadow-lg cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Brand & Stars */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <span>{product.brand}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
              <span className="text-gray-600 dark:text-gray-300 font-semibold">{product.rating}</span>
              <span>({product.numReviews})</span>
            </div>
          </div>

          {/* Name */}
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="font-semibold text-gray-850 dark:text-gray-100 hover:text-primary-500 dark:hover:text-primary-400 transition-colors line-clamp-1 text-base">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price Tag & Prime Badge */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {product.discountPrice > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900 dark:text-white">${product.discountPrice.toFixed(2)}</span>
                <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
            )}
          </div>
          {(product.discountPrice || product.price) > 50 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-extrabold text-primary-600 dark:text-primary-400 bg-primary-500/10 dark:bg-primary-500/15 rounded-md shadow-sm">
              ✓ prime
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
