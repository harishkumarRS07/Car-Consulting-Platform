import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('authToken', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    set({ user: null, token: null });
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
  addToWishlist: (car) => {
    set((state) => {
      const updated = [...state.wishlist, car];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return { wishlist: updated };
    });
  },

  removeFromWishlist: (carId) => {
    set((state) => {
      const updated = state.wishlist.filter((car) => car._id !== carId);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return { wishlist: updated };
    });
  },

  setTotalCars: (total) => set({ totalCars: total }),
}));
