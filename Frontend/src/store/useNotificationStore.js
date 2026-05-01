import { create } from 'zustand';
import api from '../lib/axios';
import socketService from '../lib/socket';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  _listening: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/notifications');
      if (response.success) {
        set({
          notifications: response.data.notifications,
          unreadCount: response.data.unreadCount,
          loading: false,
        });
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          (n._id === id || n.id === id) ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  },

  // Start listening for real-time notifications via the shared socket
  startListening: () => {
    if (get()._listening) return;

    const handleNew = (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    };

    const handleCount = (data) => {
      set({ unreadCount: data.count });
    };

    socketService.on('notification:new', handleNew);
    socketService.on('notification:count', handleCount);
    set({ _listening: true });
  },

  stopListening: () => {
    socketService.off('notification:new');
    socketService.off('notification:count');
    set({ _listening: false });
  },
}));
