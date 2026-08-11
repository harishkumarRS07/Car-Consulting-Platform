import axios from 'axios';
import { useAuthStore, useLoadingStore } from '../context/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests & track active loading requests safely
apiClient.interceptors.request.use((config) => {
  if (!config.skipLoader) {
    useLoadingStore.getState().startLoading();
    config._loaderIncremented = true;
  }
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  if (error?.config?._loaderIncremented) {
    useLoadingStore.getState().stopLoading();
    error.config._loaderIncremented = false;
  }
  return Promise.reject(error);
});

// Handle expired or invalid tokens globally and server/network errors
apiClient.interceptors.response.use(
  (response) => {
    if (response?.config?._loaderIncremented) {
      useLoadingStore.getState().stopLoading();
      response.config._loaderIncremented = false;
    }
    return response;
  },
  (error) => {
    if (error?.config?._loaderIncremented) {
      useLoadingStore.getState().stopLoading();
      error.config._loaderIncremented = false;
    }
    if (error?.response) {
      if (error.response.status === 401) {
        // Clear authentication data and logout on 401 Unauthorized
        useAuthStore.getState().logout();
        console.warn('Session expired or invalid token. Logged out automatically.');
      } else if (error.response.status >= 500) {
        // Redirect to Server Error page
        window.location.href = '/500';
      }
    } else {
      // Network error (server offline/unreachable)
      window.location.href = '/500';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile', { skipLoader: true }),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

// Cars API
export const carsAPI = {
  getCars: (params) => apiClient.get('/cars', { params }),
  getCarById: (id) => apiClient.get(`/cars/${id}`),
  createCar: (data) => apiClient.post('/cars', data),
  updateCar: (id, data) => apiClient.put(`/cars/${id}`, data),
  deleteCar: (id) => apiClient.delete(`/cars/${id}`),
  getFeaturedCars: () => apiClient.get('/cars/featured'),
  getNewArrivals: () => apiClient.get('/cars/new-arrivals'),
  addToWishlist: (carId) => apiClient.post('/cars/wishlist/add', { carId }, { skipLoader: true }),
  removeFromWishlist: (carId) => apiClient.delete(`/cars/wishlist/remove/${carId}`, { skipLoader: true }),
  getDashboardStats: () => apiClient.get('/cars/admin/stats'),
};

// Sell API
export const sellAPI = {
  getActiveBrands: () => apiClient.get('/sell/brands'),
  getModelsByBrand: (brand) => apiClient.get(`/sell/models/${brand}`),
  createEvaluation: (data) => apiClient.post('/sell/request', data),
  getMyRequests: () => apiClient.get('/sell/my-requests'),
  // Admin schedules
  getSchedules: (params) => apiClient.get('/sell/admin/schedules', { params }),
  updateScheduleStatus: (id, status) => apiClient.put(`/sell/admin/schedules/${id}`, { status }),
  getScheduleStats: () => apiClient.get('/sell/admin/schedule-stats'),
  deleteSchedule: (id) => apiClient.delete(`/sell/admin/schedules/${id}`),
};

// Testimonials API
export const testimonialsAPI = {
  getTestimonialsPublic: () => apiClient.get('/testimonials'),
  getTestimonialsAdmin: (params) => apiClient.get('/testimonials/admin', { params }),
  getTestimonialById: (id) => apiClient.get(`/testimonials/${id}`),
  createTestimonial: (data) => apiClient.post('/testimonials', data),
  updateTestimonial: (id, data) => apiClient.put(`/testimonials/${id}`, data),
  deleteTestimonial: (id) => apiClient.delete(`/testimonials/${id}`),
};

export default apiClient;
