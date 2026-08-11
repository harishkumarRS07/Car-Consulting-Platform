import express from 'express';
import { 
  getActiveBrands, 
  getModelsByBrand, 
  createSellRequest,
  getScheduledRequests,
  updateRequestStatus,
  getScheduleStats,
  getMySellRequests,
  deleteSellRequest
} from '../controllers/sellController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validate, sellRequestValidator } from '../middleware/validator.js';

const router = express.Router();

// Public Routes
router.get('/brands', getActiveBrands);
router.get('/models/:brand', getModelsByBrand);
router.post('/request', validate(sellRequestValidator), createSellRequest);

// User Routes (Protected)
router.get('/my-requests', verifyToken, getMySellRequests);

// Admin Routes (Protected)
router.get('/admin/schedules', verifyToken, isAdmin, getScheduledRequests);
router.put('/admin/schedules/:id', verifyToken, isAdmin, updateRequestStatus);
router.get('/admin/schedule-stats', verifyToken, isAdmin, getScheduleStats);
router.delete('/admin/schedules/:id', verifyToken, isAdmin, deleteSellRequest);

export default router;
