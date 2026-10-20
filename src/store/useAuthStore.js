import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('userInfo')) || null,
  wishlist: [],
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, loading: false });
      
      // Sync wishlist and cart after login
      get().fetchWishlist();
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      throw err;
    }
  },

  googleLogin: async (idToken) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/google', { idToken });
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, loading: false });
      
      get().fetchWishlist();
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Google authentication failed', loading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error on backend:', err);
    } finally {
      localStorage.removeItem('userInfo');
      set({ user: null, wishlist: [], loading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put('/api/auth/profile', profileData);
      const updatedUser = { ...get().user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update profile', loading: false });
      throw err;
    }
  },

  fetchWishlist: async () => {
    if (!get().user) return;
    try {
      const { data } = await api.get('/api/auth/wishlist');
      set({ wishlist: data });
    } catch (err) {
      console.error('Fetch wishlist failed:', err);
    }
  },

  toggleWishlist: async (productId) => {
    if (!get().user) {
      // Local storage guest wishlist fallback
      let guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
      if (guestWishlist.includes(productId)) {
        guestWishlist = guestWishlist.filter(id => id !== productId);
      } else {
        guestWishlist.push(productId);
      }
      localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
      // Standard local sync or trigger warning
      return;
    }

    try {
      const { data } = await api.post('/api/auth/wishlist', { productId });
      get().fetchWishlist();
      return data;
    } catch (err) {
      console.error('Toggle wishlist failed:', err);
    }
  },

  addAddress: async (addressData) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/api/auth/addresses', addressData);
      const updatedUser = { ...get().user, addresses: data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to add address', loading: false });
      throw err;
    }
  },

  deleteAddress: async (addressId) => {
    set({ loading: true });
    try {
      const { data } = await api.delete(`/api/auth/addresses/${addressId}`);
      const updatedUser = { ...get().user, addresses: data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete address', loading: false });
      throw err;
    }
  }
}));

export default useAuthStore;
