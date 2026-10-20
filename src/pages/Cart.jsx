import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Percent } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useToastStore from '../store/useToastStore';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, getCartTotals, applyCoupon, removeCoupon, coupon, couponError } = useCartStore();
  const { addToast } = useToastStore();
  const [couponInput, setCouponInput] = useState('');

  const { itemsPrice, discount, shippingPrice, taxPrice, totalPrice, itemsCount } = getCartTotals();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (success) {
      addToast('Coupon code applied successfully!', 'success');
      setCouponInput('');
    } else {
      addToast('Invalid coupon code.', 'error');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">Shopping Cart</h1>
        <p className="text-xs text-gray-400 mt-1">Review your selected items and coupon discounts</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-250 dark:border-gray-800 rounded-[32px] space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/35 rounded-full inline-block">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Your Cart is Empty</h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">Looks like you haven't added anything yet. Explore our top catalogs to find your style.</p>
          </div>
          <Link
            to="/products"
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl text-xs inline-block shadow-lg"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List Panel */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-6">
              {cart.map((item, idx) => (
                <div
                  key={`${item.product._id}-${item.size}-${item.color}`}
                  className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 dark:border-gray-850 pb-6 last:border-b-0 last:pb-0"
                >
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl bg-gray-50 dark:bg-gray-950/20 border border-gray-200/50 dark:border-gray-800/50"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-base text-gray-900 dark:text-white">
                          {item.product.name}
                        </h4>
                        <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-gray-450 font-medium items-center">
                          <span>Brand: {item.product.brand}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          {(item.product.discountPrice || item.product.price) > 50 && (
                            <span className="inline-flex items-center text-[8px] font-extrabold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">
                              ✓ prime
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id, item.size, item.color)}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity adjusting buttons */}
                      <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl p-1 bg-white dark:bg-gray-950">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.size, item.color)}
                          className="p-1 rounded text-gray-400 hover:text-gray-650 dark:hover:text-gray-250 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-xs font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.size, item.color)}
                          className="p-1 rounded text-gray-400 hover:text-gray-650 dark:hover:text-gray-250 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          ${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                        </span>
                        {item.product.discountPrice > 0 && (
                          <p className="text-[10px] text-gray-400 line-through">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown Sidebar Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Promo coupon input */}
            <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-500" /> Apply Coupon
              </h3>
              
              {coupon ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  <span className="flex items-center gap-1.5 uppercase">
                    <Percent className="w-3.5 h-3.5" /> {coupon.code} Applied
                  </span>
                  <button onClick={removeCoupon} className="underline text-[10px] font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="relative flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="WELCOME10 or SHOPSPHERE20"
                    className="flex-1 px-4 py-2.5 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-xl hover:scale-105 transition-transform cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-rose-500 font-medium">{couponError}</p>}
            </div>

            {/* Calculations summaries */}
            <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-6">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Order Summary</h3>
              
              <div className="space-y-3.5 text-xs text-gray-500 font-medium">
                <div className="flex justify-between">
                  <span>Bag Subtotal ({itemsCount} items)</span>
                  <span className="text-gray-900 dark:text-white">${itemsPrice.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount Coupon ({coupon.discountPercent}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Expedited Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Estimated Tax/VAT (8%)</span>
                  <span className="text-gray-900 dark:text-white">${taxPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-4 text-sm font-extrabold text-gray-900 dark:text-white">
                  <span>Order Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
