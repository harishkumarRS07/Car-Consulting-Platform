import { create } from 'zustand';
import { authAPI, carsAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
    // Automatically trigger wishlist sync on user change
    if (user) {
      useCarsStore.getState().syncWishlist();
    }
  },

  setToken: (token) => {
    localStorage.setItem('authToken', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    set({ user: null, token: null });
    // Reset wishlist to guest list on logout
    useCarsStore.getState().syncWishlist();
  },

  setLoading: (isLoading) => set({ isLoading }),
}));

export const useCarsStore = create((set) => ({
  cars: [],
  selectedCar: null,
  wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],
  totalCars: 0,

  setCars: (cars) => set({ cars }),
  setSelectedCar: (car) => set({ selectedCar: car }),
  
  syncWishlist: async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        if (response.data?.success) {
          const dbWishlist = response.data.user.wishlist || [];
          set({ wishlist: dbWishlist });
          localStorage.setItem('wishlist', JSON.stringify(dbWishlist));
        }
      } catch (error) {
        console.error('Failed to sync wishlist with database:', error);
      }
    } else {
      // Guest mode
      const local = JSON.parse(localStorage.getItem('guest_wishlist')) || [];
      set({ wishlist: local });
      localStorage.setItem('wishlist', JSON.stringify(local));
    }
  },

  addToWishlist: async (car) => {
    set((state) => {
      const updated = [...state.wishlist, car];
      const token = localStorage.getItem('authToken');
      if (token) {
        carsAPI.addToWishlist(car._id).catch(err => console.error('Wishlist add sync error:', err));
        localStorage.setItem('wishlist', JSON.stringify(updated));
      } else {
        localStorage.setItem('guest_wishlist', JSON.stringify(updated));
        localStorage.setItem('wishlist', JSON.stringify(updated));
      }
      return { wishlist: updated };
    });
  },

  removeFromWishlist: async (carId) => {
    set((state) => {
      const updated = state.wishlist.filter((car) => car._id !== carId);
      const token = localStorage.getItem('authToken');
      if (token) {
        carsAPI.removeFromWishlist(carId).catch(err => console.error('Wishlist remove sync error:', err));
        localStorage.setItem('wishlist', JSON.stringify(updated));
      } else {
        localStorage.setItem('guest_wishlist', JSON.stringify(updated));
        localStorage.setItem('wishlist', JSON.stringify(updated));
      }
      return { wishlist: updated };
    });
  },

  setTotalCars: (total) => set({ totalCars: total }),
}));

export const useLoadingStore = create((set) => ({
  activeRequests: 0,
  startLoading: () => set((state) => ({ activeRequests: state.activeRequests + 1 })),
  stopLoading: () => set((state) => ({ activeRequests: Math.max(0, state.activeRequests - 1) })),
}));

