"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { useAuthStore } from '@/store/use-auth-store';
import { useNotificationStore } from '@/store/use-notification-store';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import CommandPalette from '@/components/command-palette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || !user.isAdmin) return;

    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Socket client connected to backend server');
    });

    socket.on('notification', (payload: any) => {
      addNotification({
        title: payload.title,
        description: payload.description,
        type: payload.type || 'order',
        timestamp: new Date(payload.timestamp || Date.now())
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, addNotification]);

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-xs">
        <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Checking Authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onSearchClick={() => setIsSearchOpen(true)} />

        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(!isSearchOpen)} />
    </div>
  );
}
