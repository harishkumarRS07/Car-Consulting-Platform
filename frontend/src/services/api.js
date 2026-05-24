import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Auth API
export const authAPI = {
  signup: (data) => apiClient.post('/auth/register', data),
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
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
  addToWishlist: (carId) => apiClient.post('/cars/wishlist/add', { carId }),
  removeFromWishlist: (carId) => apiClient.delete(`/cars/wishlist/remove/${carId}`),
  getDashboardStats: () => apiClient.get('/cars/admin/stats'),
};

// Sell API
export const sellAPI = {
  getActiveBrands: () => apiClient.get('/sell/brands'),
  getModelsByBrand: (brand) => apiClient.get(`/sell/models/${brand}`),
  createEvaluation: (data) => apiClient.post('/sell/request', data),
  // Admin schedules
  getSchedules: (params) => apiClient.get('/sell/admin/schedules', { params }),
  updateScheduleStatus: (id, status) => apiClient.put(`/sell/admin/schedules/${id}`, { status }),
  getScheduleStats: () => apiClient.get('/sell/admin/schedule-stats'),
};

export default apiClient;
