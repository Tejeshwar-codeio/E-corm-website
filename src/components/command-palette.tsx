"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Terminal, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const commands = [
    { name: 'Go to Dashboard', category: 'Navigation', action: () => router.push('/dashboard') },
    { name: 'View Product Inventory Catalog', category: 'Navigation', action: () => router.push('/products') },
    { name: 'Open Warehouse Stock Adjuster', category: 'Navigation', action: () => router.push('/inventory') },
    { name: 'Check Order Timelines & Shipping', category: 'Navigation', action: () => router.push('/orders') },
    { name: 'Open Ticketing & Live Chat Support', category: 'Navigation', action: () => router.push('/support') },
    { name: 'Inspect Administrative Audit Logs', category: 'Navigation', action: () => router.push('/audit-logs') },
    { name: 'View Global Settings', category: 'Navigation', action: () => router.push('/settings') },
    { name: 'Trigger Full Database Backup', category: 'Database', action: () => alert('Mock Backup process initiated!') }
  ];

  const filteredCommands = commands.filter((cmd) => 
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-850">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or page path..."
            className="flex-1 text-xs bg-transparent outline-none text-gray-900 dark:text-white border-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-gray-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-8 font-semibold">No commands matching query.</p>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                className="w-full flex items-center justify-between text-left text-xs font-semibold p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-gray-700 dark:text-gray-300"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-500" />
                  <span>{cmd.name}</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-400">
                  {cmd.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
