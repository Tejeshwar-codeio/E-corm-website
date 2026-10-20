"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShieldAlert, FileText, 
  Briefcase, MessageSquare, Shield, Settings, ChevronLeft, ChevronRight, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products Catalog', path: '/products', icon: Package },
    { name: 'Inventory & Warehouses', path: '/inventory', icon: ShieldAlert },
    { name: 'Orders Logistics', path: '/orders', icon: FileText },
    { name: 'Marketplace Vendors', path: '/sellers', icon: Briefcase },
    { name: 'Support Tickets', path: '/support', icon: MessageSquare },
    { name: 'Audit Trail Logs', path: '/audit-logs', icon: Shield },
    { name: 'Global Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-all duration-300 relative shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between px-6">
          {!isCollapsed && (
            <span className="text-xs font-extrabold uppercase bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent font-display tracking-wider">
              ★ Enterprise Ops
            </span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-1.5 rounded-lg border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ml-auto"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold transition-all relative ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : ''}`} />
                {!isCollapsed && <span>{item.name}</span>}
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-r"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-900">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/5 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
