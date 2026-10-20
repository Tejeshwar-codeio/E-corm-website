import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import useCartStore from '../store/useCartStore';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { cart, isCartOpen, setCartOpen, updateQuantity, removeItem, getCartTotals } = useCartStore();

  const { itemsPrice, itemsCount } = getCartTotals();

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-100 dark:border-gray-800"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-lg text-gray-850 dark:text-white">Your Bag ({itemsCount})</h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/35 rounded-full">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Your bag is empty</h4>
                    <p className="text-xs text-gray-450 mt-1 max-w-xs">Looks like you haven't added anything yet. Explore our top catalogs to find your style.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate('/products');
                    }}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex gap-4 border-b border-gray-100 dark:border-gray-800/50 pb-6">
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-gray-50 dark:bg-gray-950/20 border border-gray-200/50 dark:border-gray-800/50"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-gray-450 font-medium items-center">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          {(item.product.discountPrice || item.product.price) > 50 && (
                            <span className="inline-flex items-center text-[8px] font-extrabold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">
                              ✓ prime
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 dark:border-gray-850 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.size, item.color)}
                            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-850 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.size, item.color)}
                            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            ${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product._id, item.size, item.color)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950/20 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">${itemsPrice.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-gray-450">Taxes, shipping, and promotional discounts applied at checkout.</p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setCartOpen(false)}
                    className="w-full py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-xs text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    View Bag
                  </button>
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                  >
                    Check Out
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
