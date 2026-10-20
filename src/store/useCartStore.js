import { create } from 'zustand';
import api from '../services/api';

const useCartStore = create((set, get) => ({
  cart: JSON.parse(localStorage.getItem('cartItems')) || [],
  coupon: null, // { code: 'SHOPSPHERE20', discountPercent: 20 }
  couponError: null,
  shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')) || null,
  paymentMethod: 'Stripe',
  recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed')) || [],
  compareProducts: [],
  isCartOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),

  // Add Item to Cart
  addItem: async (product, quantity = 1, size = '', color = '') => {
    const currentCart = [...get().cart];
    const existingIndex = currentCart.findIndex(
      (item) =>
        item.product._id === product._id &&
        item.size === size &&
        item.color === color
    );

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push({ product, quantity, size, color });
    }

    set({ cart: currentCart });
    localStorage.setItem('cartItems', JSON.stringify(currentCart));

    // Sync with backend if logged in
    await get().syncCartWithBackend();
  },

  // Remove Item
  removeItem: async (productId, size = '', color = '') => {
    const updatedCart = get().cart.filter(
      (item) =>
        !(item.product._id === productId && item.size === size && item.color === color)
    );

    set({ cart: updatedCart });
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));

    await get().syncCartWithBackend();
  },

  // Update Quantity
  updateQuantity: async (productId, quantity, size = '', color = '') => {
    const updatedCart = get().cart.map((item) => {
      if (item.product._id === productId && item.size === size && item.color === color) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });

    set({ cart: updatedCart });
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));

    await get().syncCartWithBackend();
  },

  // Sync with Backend
  syncCartWithBackend: async () => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    if (userInfo) {
      try {
        const payload = get().cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }));
        await api.post('/api/auth/cart/sync', { cartItems: payload });
      } catch (error) {
        console.error('Failed to sync cart with backend:', error);
      }
    }
  },

  // Load Cart from Backend (usually called after login)
  loadCartFromBackend: async () => {
    try {
      const { data } = await api.get('/api/auth/cart');
      if (data && data.length > 0) {
        // Format populated database items to match store structure
        const formattedCart = data.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }));
        set({ cart: formattedCart });
        localStorage.setItem('cartItems', JSON.stringify(formattedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from backend:', error);
    }
  },

  // Apply Coupon
  applyCoupon: (code) => {
    set({ couponError: null });
    const uppercaseCode = code.toUpperCase();

    if (uppercaseCode === 'WELCOME10') {
      set({ coupon: { code: 'WELCOME10', discountPercent: 10 } });
    } else if (uppercaseCode === 'SHOPSPHERE20') {
      set({ coupon: { code: 'SHOPSPHERE20', discountPercent: 20 } });
    } else if (uppercaseCode === 'FREESHIP') {
      set({ coupon: { code: 'FREESHIP', discountPercent: 100, isFreeShipping: true } });
    } else {
      set({ couponError: 'Invalid coupon code. Try WELCOME10 or SHOPSPHERE20' });
      return false;
    }
    return true;
  },

  removeCoupon: () => {
    set({ coupon: null, couponError: null });
  },

  // Totals calculations
  getCartTotals: () => {
    const itemsPrice = get().cart.reduce(
      (acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity,
      0
    );

    const coupon = get().coupon;
    let discount = 0;
    if (coupon && !coupon.isFreeShipping) {
      discount = (itemsPrice * coupon.discountPercent) / 100;
    }

    const shippingPrice = itemsPrice > 150 || (coupon && coupon.isFreeShipping) ? 0 : 15;
    const taxPrice = (itemsPrice - discount) * 0.08; // 8% Tax
    const totalPrice = itemsPrice - discount + shippingPrice + taxPrice;

    return {
      itemsCount: get().cart.reduce((acc, item) => acc + item.quantity, 0),
      itemsPrice,
      discount,
      shippingPrice,
      taxPrice,
      totalPrice
    };
  },

  saveShippingAddress: (address) => {
    set({ shippingAddress: address });
    localStorage.setItem('shippingAddress', JSON.stringify(address));
  },

  savePaymentMethod: (method) => {
    set({ paymentMethod: method });
  },

  clearCart: () => {
    set({ cart: [], coupon: null });
    localStorage.removeItem('cartItems');
  },

  // Recently Viewed Product Tracking
  addRecentlyViewed: (product) => {
    let list = [...get().recentlyViewed];
    // Filter out existing to avoid duplicates
    list = list.filter((p) => p._id !== product._id);
    list.unshift(product); // Prepend to beginning
    if (list.length > 5) list.pop(); // Max 5 items

    set({ recentlyViewed: list });
    localStorage.setItem('recentlyViewed', JSON.stringify(list));
  },

  // Product Comparison System
  toggleCompare: (product) => {
    const list = [...get().compareProducts];
    const exists = list.some((p) => p._id === product._id);

    if (exists) {
      set({ compareProducts: list.filter((p) => p._id !== product._id) });
    } else {
      if (list.length >= 3) {
        // Remove first item if limit reached
        list.shift();
      }
      list.push(product);
      set({ compareProducts: list });
    }
  }
}));

export default useCartStore;
