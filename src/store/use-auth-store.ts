import { create } from 'zustand';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null,
  loading: false,
  logout: () => {
    localStorage.removeItem('userInfo');
    set({ user: null });
  },
  setUser: (user) => {
    localStorage.setItem('userInfo', JSON.stringify(user));
    set({ user });
  }
}));
