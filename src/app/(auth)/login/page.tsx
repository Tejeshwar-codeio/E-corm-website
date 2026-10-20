"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && user.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please complete all form fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      if (!data.isAdmin) {
        throw new Error('Access denied. Administrator permissions required.');
      }

      setUser(data);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (!(window as any).google) return;
      
      (window as any).google.accounts.id.initialize({
        client_id: '888796686463-kbmmh3h9r9r2sv86gdptdjc47uuhum8o.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: '100%', shape: 'pill' }
      );
    };

    const loadGoogleScript = () => {
      if ((window as any).google) {
        initializeGoogleAuth();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.body.appendChild(script);
    };

    const handleGoogleCredentialResponse = async (response: any) => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: response.credential })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Google verification failed');
        }

        const data = await res.json();
        if (!data.isAdmin) {
          throw new Error('Access denied. Administrator permissions required.');
        }

        setUser(data);
        router.push('/dashboard');
      } catch (err: any) {
        setErrorMsg(err.message || 'Google Auth verification failed');
      } finally {
        setLoading(false);
      }
    };

    loadGoogleScript();
  }, [setUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-radial from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-md w-full rounded-[32px] border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 p-8 shadow-2xl space-y-8 backdrop-blur-md">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold font-display tracking-tight uppercase bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            ★ Operations Hub
          </h2>
          <p className="text-xs text-gray-400">Sign in to manage inventory, orders, and settlements</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-4 h-4" /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopsphere.com"
                className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-4 h-4" /></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing security checks...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-x-0 h-px bg-gray-200 dark:bg-gray-800"></div>
          <span className="relative bg-white dark:bg-gray-900 px-3 text-[10px] uppercase font-bold text-gray-400">
            or continue with
          </span>
        </div>

        <div id="google-signin-btn" className="w-full flex justify-center"></div>

        <div className="flex items-center gap-2 justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured operations portal</span>
        </div>
      </div>
    </div>
  );
}
