import { create } from 'zustand';
import api from '../lib/axios';

export const useBookingStore = create((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchUserBookings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/users/bookings');
      if (response.success) {
        set({ bookings: response.data.bookings, loading: false });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch bookings', loading: false });
    }
  },

  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/bookings', bookingData);
      if (response.success) {
        set((state) => ({
          bookings: [response.data.booking, ...state.bookings],
          loading: false,
        }));
        return response.data.booking;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create booking', loading: false });
      throw err;
    }
  },

  updateBookingStatusLocal: (bookingId, status) => {
    set((state) => ({
      bookings: state.bookings.map((b) => 
        b._id === bookingId ? { ...b, status } : b
      )
    }));
  },

  updateBookingOtpLocal: (bookingId, otpData) => {
    set((state) => ({
      bookings: state.bookings.map((b) => 
        b._id === bookingId ? { ...b, ...otpData } : b
      )
    }));
  }
}));
