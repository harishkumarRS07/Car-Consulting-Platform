import express from 'express';
import { 
  getActiveBrands, 
  getModelsByBrand, 
  createSellRequest,
  getScheduledRequests,
  updateRequestStatus,
  getScheduleStats
} from '../controllers/sellController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.get('/brands', getActiveBrands);
router.get('/models/:brand', getModelsByBrand);
router.post('/request', createSellRequest);

// Admin Routes (Protected)
router.get('/admin/schedules', verifyToken, getScheduledRequests);
router.put('/admin/schedules/:id', verifyToken, updateRequestStatus);
router.get('/admin/schedule-stats', verifyToken, getScheduleStats);

export default router;
