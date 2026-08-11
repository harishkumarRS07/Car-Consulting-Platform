import Testimonial from '../models/Testimonial.js';
import AppError from '../utils/AppError.js';
import { uploadToCloudinary } from '../utils/cloudinaryHelper.js';

// Get active testimonials for public Home page
export const getTestimonialsPublic = async (req, res, next) => {
  try {
    // Only return active testimonials, ordered by displayOrder asc, then newest first
    const testimonials = await Testimonial.find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    next(error);
  }
};

// Get all testimonials for Admin Panel (supports search, filter, and pagination)
export const getTestimonialsAdmin = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Search query matches customerName, carName, city, or review text
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { carName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { review: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [testimonials, totalTestimonials] = await Promise.all([
      Testimonial.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ displayOrder: 1, createdAt: -1 }),
      Testimonial.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      testimonials,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTestimonials / limit),
        totalTestimonials,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single testimonial by ID
export const getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return next(new AppError('Testimonial not found', 404));
    }

    res.status(200).json({
      success: true,
      testimonial,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid testimonial ID format', 400));
    }
    next(error);
  }
};

// Create a new testimonial
export const createTestimonial = async (req, res, next) => {
  try {
    const { customerName, city, review, carName, customerPhoto, carPhoto, rating, status, displayOrder } = req.body;

    // Upload images to Cloudinary (will return fallback URLs if configuration is missing/invalid)
    const customerPhotoUrl = await uploadToCloudinary(customerPhoto, 'customer');
    const carPhotoUrl = await uploadToCloudinary(carPhoto, 'car');

    const testimonial = new Testimonial({
      customerName,
      city,
      review,
      carName,
      customerPhoto: customerPhotoUrl,
      carPhoto: carPhotoUrl,
      rating,
      status: status || 'active',
      displayOrder: displayOrder || 0,
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      testimonial,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return next(new AppError(`Validation error: ${  messages}`, 400));
    }
    next(error);
  }
};

// Update an existing testimonial
export const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new AppError('Testimonial ID is required', 400));
    }

    const { customerName, city, review, carName, customerPhoto, carPhoto, rating, status, displayOrder } = req.body;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return next(new AppError('Testimonial not found', 404));
    }

    // Upload new images if they are in base64 format (otherwise keep current url)
    const customerPhotoUrl = customerPhoto ? await uploadToCloudinary(customerPhoto, 'customer') : testimonial.customerPhoto;
    const carPhotoUrl = carPhoto ? await uploadToCloudinary(carPhoto, 'car') : testimonial.carPhoto;

    testimonial.customerName = customerName || testimonial.customerName;
    testimonial.city = city || testimonial.city;
    testimonial.review = review || testimonial.review;
    testimonial.carName = carName || testimonial.carName;
    testimonial.customerPhoto = customerPhotoUrl;
    testimonial.carPhoto = carPhotoUrl;
    testimonial.rating = rating !== undefined ? rating : testimonial.rating;
    testimonial.status = status || testimonial.status;
    testimonial.displayOrder = displayOrder !== undefined ? displayOrder : testimonial.displayOrder;

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      testimonial,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return next(new AppError(`Validation error: ${  messages}`, 400));
    }
    if (error.name === 'CastError') {
      return next(new AppError('Invalid testimonial ID format', 400));
    }
    next(error);
  }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return next(new AppError('Testimonial not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid testimonial ID format', 400));
    }
    next(error);
  }
};
