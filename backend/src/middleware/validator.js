import { body, validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

// Middleware to handle validation results
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const messages = errors.array().map((err) => err.msg).join(', ');
    return next(new AppError(`Validation error: ${messages}`, 400));
  };
};

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const carValidator = [
  body('title').trim().notEmpty().withMessage('Car title is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('fuelType').isIn(['petrol', 'diesel', 'cng', 'electric', 'hybrid']).withMessage('Invalid fuel type'),
  body('transmission').isIn(['manual', 'automatic']).withMessage('Invalid transmission type'),
  body('kmsDriven').isNumeric().withMessage('KMs driven must be a number'),
  body('year').isNumeric().withMessage('Year must be a number'),
  body('bodyType').isIn(['sedan', 'suv', 'hatchback', 'muv', 'coupe', 'convertible', 'sports']).withMessage('Invalid body type'),
  body('location').trim().notEmpty().withMessage('Location is required'),
];

export const sellRequestValidator = [
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isNumeric().withMessage('Year must be a number'),
  body('variant').trim().notEmpty().withMessage('Variant is required'),
  body('owner').trim().notEmpty().withMessage('Owner is required'),
  body('kms').trim().notEmpty().withMessage('KMs driven is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  body('area').trim().notEmpty().withMessage('Area is required'),
  body('date').trim().notEmpty().withMessage('Date is required'),
  body('timeSlot').trim().notEmpty().withMessage('Time slot is required'),
  body('carImages')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) {return true;}
      if (!Array.isArray(value)) {
        throw new Error('Images must be an array');
      }
      if (value.length > 10) {
        throw new Error('Maximum 10 images are allowed');
      }
      for (const img of value) {
        if (!img) {continue;}
        if (img.startsWith('http://') || img.startsWith('https://')) {
          continue;
        }

        // Validate base64 format (data:image/jpeg;base64,...)
        const match = img.match(/^data:image\/(jpeg|jpg|png|webp);base64,/);
        if (!match) {
          throw new Error('Only JPG, JPEG, PNG, and WEBP formats are allowed');
        }

        // Validate size (10 MB = 10 * 1024 * 1024 bytes)
        const base64Content = img.split(',')[1];
        if (!base64Content) {
          throw new Error('Invalid image data');
        }
        const sizeInBytes = Buffer.from(base64Content, 'base64').length;
        if (sizeInBytes > 10 * 1024 * 1024) {
          throw new Error('Each image must be less than 10MB');
        }
      }
      return true;
    }),
];

export const testimonialValidator = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('review').trim().notEmpty().withMessage('Review is required'),
  body('carName').trim().notEmpty().withMessage('Purchased car name is required'),
  body('customerPhoto').notEmpty().withMessage('Customer photo is required'),
  body('carPhoto').notEmpty().withMessage('Car photo is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('status').optional().isIn(['active', 'hidden']).withMessage('Invalid status value'),
  body('displayOrder').optional().isInt().withMessage('Display order must be an integer'),
];

