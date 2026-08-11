import express from 'express';
import {
  getTestimonialsPublic,
  getTestimonialsAdmin,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validate, testimonialValidator } from '../middleware/validator.js';

const router = express.Router();

// Public route to get active testimonials
router.get('/', getTestimonialsPublic);

// Admin routes (require verification and admin role)
router.get('/admin', verifyToken, isAdmin, getTestimonialsAdmin);
router.get('/:id', verifyToken, isAdmin, getTestimonialById);
router.post('/', verifyToken, isAdmin, validate(testimonialValidator), createTestimonial);
router.put('/:id', verifyToken, isAdmin, validate(testimonialValidator), updateTestimonial);
router.delete('/:id', verifyToken, isAdmin, deleteTestimonial);

export default router;
