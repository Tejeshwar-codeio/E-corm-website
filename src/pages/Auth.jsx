import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, googleLogin, user, error, loading } = useAuthStore();
  const { addToast } = useToastStore();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      navigate(redirect ? `/${redirect}` : '/dashboard');
    }
  }, [user, navigate, redirect]);

  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (!window.google) return;
      
      window.google.accounts.id.initialize({
        client_id: '888796686463-kbmmh3h9r9r2sv86gdptdjc47uuhum8o.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: '100%', shape: 'pill' }
      );
    };

    const loadGoogleScript = () => {
      if (window.google) {
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

    const handleGoogleCredentialResponse = async (response) => {
      try {
        const idToken = response.credential;
        await googleLogin(idToken);
        addToast('Welcome to ShopSphere with Google!', 'success');
        navigate(redirect ? `/${redirect}` : '/dashboard');
      } catch (err) {
        addToast(err.response?.data?.message || 'Google Auth verification failed', 'error');
      }
    };

    loadGoogleScript();
  }, [googleLogin, navigate, redirect, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      addToast('Please complete all form fields', 'error');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        addToast('Welcome back to ShopSphere!', 'success');
      } else {
        await register(name, email, password);
        addToast('Registration complete. Welcome to the Sphere!', 'success');
      }
      navigate(redirect ? `/${redirect}` : '/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 pt-24 pb-12 relative overflow-hidden bg-radial from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-secondary-500/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full rounded-[32px] glass-panel border border-gray-150/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 p-8 shadow-2xl relative z-10 space-y-8">
        {/* Header Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              isLogin
                ? 'border-primary-500 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              !isLogin
                ? 'border-primary-500 text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Story details */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight font-display">
            {isLogin ? 'Welcome Back' : 'Join ShopSphere'}
          </h2>
          <p className="text-xs text-gray-400">
            {isLogin
              ? 'Access your saved orders, wishlist, and dashboard profiles.'
              : 'Sign up to redeem coupons and check out with premium speed.'}
          </p>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-4 h-4" /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
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
                className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
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
                Processing request...
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Sign Up'}
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

        {/* Google sign-in container */}
        <div id="google-signin-btn" className="w-full flex justify-center"></div>

        <div className="flex items-center gap-2 justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured authentication portal</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
