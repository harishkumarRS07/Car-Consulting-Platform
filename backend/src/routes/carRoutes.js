import express from 'express';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  addToWishlist,
  removeFromWishlist,
  getFeaturedCars,
  getNewArrivals,
  getDashboardStats,
} from '../controllers/carController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/featured', getFeaturedCars);
router.get('/new-arrivals', getNewArrivals);
router.get('/:id', getCarById);

// Admin routes
router.post('/', verifyToken, isAdmin, createCar);
router.put('/:id', verifyToken, isAdmin, updateCar);
router.delete('/:id', verifyToken, isAdmin, deleteCar);

// Wishlist routes
router.post('/wishlist/add', verifyToken, addToWishlist);
router.delete('/wishlist/remove/:carId', verifyToken, removeFromWishlist);

// Stats route
router.get('/admin/stats', getDashboardStats);

export default router;
