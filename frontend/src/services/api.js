import axios from 'axios';
import { useAuthStore, useLoadingStore } from '../context/store';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

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
      }
    }
    return Promise.reject(error);
  }
);

// In-flight pending requests map: cacheKey -> Promise
const inFlightRequests = new Map();

// Short-lived response cache map: cacheKey -> { data, timestamp }
const responseCache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL

export const clearApiCache = () => {
  responseCache.clear();
  inFlightRequests.clear();
};

export const deduplicatedGet = async (url, config = {}) => {
  const { skipCache, ...axiosConfig } = config;
  const cacheKey = `${url}?${JSON.stringify(axiosConfig.params || {})}`;

  // 1. Return cached response if valid
  if (!skipCache && responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    responseCache.delete(cacheKey);
  }

  // 2. Return existing in-flight promise if duplicate call occurs concurrently
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Dispatch HTTP request and track promise until settled
  const requestPromise = (async () => {
    try {
      const response = await apiClient.get(url, axiosConfig);
      if (!skipCache && response.status === 200) {
        responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
      }
      return response;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// Auth API
export const authAPI = {
  signup: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => deduplicatedGet('/auth/profile', { skipLoader: true }),
  updateProfile: async (data) => {
    const res = await apiClient.put('/auth/profile', data);
    clearApiCache();
    return res;
  },
};

// Cars API
export const carsAPI = {
  getCars: (params) => deduplicatedGet('/cars', { params }),
  getCarById: (id) => deduplicatedGet(`/cars/${id}`),
  createCar: async (data) => {
    const res = await apiClient.post('/cars', data);
    clearApiCache();
    return res;
  },
  updateCar: async (id, data) => {
    const res = await apiClient.put(`/cars/${id}`, data);
    clearApiCache();
    return res;
  },
  deleteCar: async (id) => {
    const res = await apiClient.delete(`/cars/${id}`);
    clearApiCache();
    return res;
  },
  getFeaturedCars: () => deduplicatedGet('/cars/featured'),
  getNewArrivals: () => deduplicatedGet('/cars/new-arrivals'),
  addToWishlist: (carId) => apiClient.post('/cars/wishlist/add', { carId }, { skipLoader: true }),
  removeFromWishlist: (carId) => apiClient.delete(`/cars/wishlist/remove/${carId}`, { skipLoader: true }),
  getDashboardStats: () => deduplicatedGet('/cars/admin/stats', { skipCache: true }),
};

// Sell API
export const sellAPI = {
  getActiveBrands: () => deduplicatedGet('/sell/brands'),
  getModelsByBrand: (brand) => deduplicatedGet(`/sell/models/${brand}`),
  createEvaluation: async (data) => {
    const res = await apiClient.post('/sell/request', data);
    clearApiCache();
    return res;
  },
  getMyRequests: () => deduplicatedGet('/sell/my-requests'),
  // Admin schedules
  getSchedules: (params) => deduplicatedGet('/sell/admin/schedules', { params, skipCache: true }),
  updateScheduleStatus: async (id, status) => {
    const res = await apiClient.put(`/sell/admin/schedules/${id}`, { status });
    clearApiCache();
    return res;
  },
  getScheduleStats: () => deduplicatedGet('/sell/admin/schedule-stats', { skipCache: true }),
  deleteSchedule: async (id) => {
    const res = await apiClient.delete(`/sell/admin/schedules/${id}`);
    clearApiCache();
    return res;
  },
};

// Testimonials API
export const testimonialsAPI = {
  getTestimonialsPublic: () => deduplicatedGet('/testimonials'),
  getTestimonialsAdmin: (params) => deduplicatedGet('/testimonials/admin', { params, skipCache: true }),
  getTestimonialById: (id) => deduplicatedGet(`/testimonials/${id}`),
  createTestimonial: async (data) => {
    const res = await apiClient.post('/testimonials', data);
    clearApiCache();
    return res;
  },
  updateTestimonial: async (id, data) => {
    const res = await apiClient.put(`/testimonials/${id}`, data);
    clearApiCache();
    return res;
  },
  deleteTestimonial: async (id) => {
    const res = await apiClient.delete(`/testimonials/${id}`);
    clearApiCache();
    return res;
  },
};

export default apiClient;
