"use client";

import React, { useState } from 'react';
import { Sun, Moon, Bell, Search, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { useNotificationStore } from '@/store/use-notification-store';

interface HeaderProps {
  onSearchClick: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <button 
        onClick={onSearchClick}
        className="flex items-center gap-2.5 px-4 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl text-xs text-gray-400 font-semibold cursor-pointer w-64 text-left transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Type Ctrl+K to search...</span>
      </button>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl p-4 z-50 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-2">
                <span className="font-extrabold text-xs uppercase tracking-wider text-gray-400">System Notifications</span>
                <div className="flex gap-2">
                  <button onClick={markAllAsRead} className="text-[10px] text-amber-500 hover:underline">Mark read</button>
                  <button onClick={clearAll} className="text-[10px] text-rose-500 hover:underline">Clear</button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-gray-400 font-semibold">No active warnings in logs.</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => markAsRead(notif.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        notif.read 
                          ? 'border-gray-100 dark:border-gray-900 bg-transparent opacity-60' 
                          : 'border-amber-500/10 bg-amber-500/5 dark:bg-amber-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[10px] uppercase text-amber-500">{notif.type}</span>
                        <span className="text-[8px] text-gray-400">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mt-0.5">{notif.title}</h4>
                      <p className="text-gray-400 text-[10px] mt-0.5 leading-snug">{notif.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left text-[10px]">
            <h4 className="font-extrabold text-gray-900 dark:text-white leading-tight">{user?.name || 'Administrator'}</h4>
            <p className="text-gray-400 mt-0.5 font-bold flex items-center gap-0.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Admin Access</p>
          </div>
        </div>
      </div>
    </header>
  );
}
