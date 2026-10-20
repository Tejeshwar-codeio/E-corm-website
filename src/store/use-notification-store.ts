import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'order' | 'inventory' | 'support' | 'security';
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (item: Omit<NotificationItem, 'id' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'init-1',
      title: 'Database Synced',
      description: 'Enterprise catalog successfully synced with regional data centers.',
      type: 'security',
      timestamp: new Date(),
      read: false
    }
  ],
  addNotification: (item) => set((state) => ({
    notifications: [
      {
        ...item,
        id: Math.random().toString(36).substring(7),
        read: false
      },
      ...state.notifications
    ]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),
  clearAll: () => set({ notifications: [] })
}));
