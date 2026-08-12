import Car from '../models/Car.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { uploadToCloudinary } from '../utils/cloudinaryHelper.js';

export const getCars = async (req, res, next) => {
  try {
    const { search, brand, fuelType, transmission, priceMin, priceMax, yearMin, yearMax, bodyType, owner, location, category, page = 1, limit = 12, admin, sort } = req.query;

    console.log('[DEBUG BACKEND] Raw Query Params:', req.query);

    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { variant: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Brand filter (supports multiple brands, case-insensitive)
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim()).filter(Boolean);
      if (brands.length > 0) {
        filter.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
      }
    }

    // Fuel type filter
    if (fuelType) {
      const fuelTypes = fuelType.split(',').map((f) => f.trim()).filter(Boolean);
      if (fuelTypes.length > 0) {
        filter.fuelType = { $in: fuelTypes.map((f) => new RegExp(`^${f}$`, 'i')) };
      }
    }

    // Transmission filter
    if (transmission) {
      const transmissions = transmission.split(',').map((t) => t.trim()).filter(Boolean);
      if (transmissions.length > 0) {
        filter.transmission = { $in: transmissions.map((t) => new RegExp(`^${t}$`, 'i')) };
      }
    }

    // Price range filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) {filter.price.$gte = parseFloat(priceMin);}
      if (priceMax) {filter.price.$lte = parseFloat(priceMax);}
    }

    // Year range filter
    if (yearMin || yearMax) {
      filter.year = {};
      if (yearMin) {filter.year.$gte = parseFloat(yearMin);}
      if (yearMax) {filter.year.$lte = parseFloat(yearMax);}
    }

    // Body type filter (exact case-insensitive match)
    if (bodyType) {
      const bodyTypes = bodyType.split(',').map((b) => b.trim()).filter(Boolean);
      if (bodyTypes.length > 0) {
        filter.bodyType = { $in: bodyTypes.map((b) => new RegExp(`^${b}$`, 'i')) };
      }
    }

    // Owner filter
    if (owner) {
      const owners = owner.split(',').map((o) => o.trim()).filter(Boolean);
      if (owners.length > 0) {
        filter.owner = { $in: owners.map((o) => new RegExp(`^${o}$`, 'i')) };
      }
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Category filter
    if (category) {
      const categories = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        filter.category = { $in: categories.map((c) => new RegExp(`^${c}$`, 'i')) };
      }
    }

    // Exclude booked and sold cars from user UI
    if (!admin) {
      filter.availability = { $nin: ['booked', 'sold'] };
    }

    const skip = (page - 1) * limit;

    let sortCriteria = { createdAt: -1 }; // default newest
    if (sort) {
      if (sort === 'pricelow') {sortCriteria = { price: 1 };}
      else if (sort === 'pricehigh') {sortCriteria = { price: -1 };}
      else if (sort === 'year') {sortCriteria = { year: -1 };}
    }

    const [cars, totalCars] = await Promise.all([
      Car.find(filter)
        .select({ images: { $slice: 1 }, description: 0 })
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortCriteria),
      Car.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      cars,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCars / limit),
        totalCars,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return next(new AppError('Car not found', 404));
    }

    // Get similar cars
    const similarCars = await Car.find({
      brand: car.brand,
      _id: { $ne: car._id },
      availability: { $nin: ['booked', 'sold'] },
    })
      .select({ images: { $slice: 1 } })
      .limit(5)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      car,
      similar: similarCars,
    });
  } catch (error) {
    next(error);
  }
};

export const createCar = async (req, res, next) => {
  try {
    const carData = { ...req.body };

    // Process base64 images through Cloudinary if present
    if (carData.images && Array.isArray(carData.images)) {
      const processedImages = await Promise.all(
        carData.images.map((img) => uploadToCloudinary(img, 'car'))
      );
      carData.images = processedImages.filter(Boolean);
    }

    const car = new Car(carData);
    await car.save();

    res.status(201).json({
      success: true,
      message: 'Car added successfully',
      car,
    });
  } catch (error) {
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return next(new AppError(`Validation error: ${messages}`, 400));
    }

    next(error);
  }
};

export const updateCar = async (req, res, next) => {
  try {
    // Validate that ID is provided
    if (!req.params.id) {
      return next(new AppError('Car ID is required', 400));
    }

    const updateData = { ...req.body };

    // Process base64 images through Cloudinary if present
    if (updateData.images && Array.isArray(updateData.images)) {
      const processedImages = await Promise.all(
        updateData.images.map((img) => uploadToCloudinary(img, 'car'))
      );
      updateData.images = processedImages.filter(Boolean);
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      return next(new AppError('Car not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      car,
    });
  } catch (error) {
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return next(new AppError(`Validation error: ${  messages}`, 400));
    }
    
    // Handle cast errors (invalid ID format)
    if (error.name === 'CastError') {
      return next(new AppError('Invalid car ID format', 400));
    }

    next(error);
  }
};

export const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      return next(new AppError('Car not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { carId } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: carId } }, { new: true }).populate('wishlist');

    res.status(200).json({
      success: true,
      message: 'Car added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const carId = req.params.carId;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(userId, { $pull: { wishlist: carId } }, { new: true }).populate('wishlist');

    res.status(200).json({
      success: true,
      message: 'Car removed from wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedCars = async (req, res, next) => {
  try {
    const cars = await Car.find({ availability: { $nin: ['booked', 'sold'] } })
      .select({ images: { $slice: 1 }, description: 0 })
      .limit(12)
      .sort({ rating: -1, reviews: -1 });

    res.status(200).json({
      success: true,
      cars,
    });
  } catch (error) {
    next(error);
  }
};

export const getNewArrivals = async (req, res, next) => {
  try {
    const cars = await Car.find({ availability: { $nin: ['booked', 'sold'] } })
      .select({ images: { $slice: 1 }, description: 0 })
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      cars,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalCars, activeListing, bookedCars, soldCars, avgPriceData] = await Promise.all([
      Car.countDocuments(),
      Car.countDocuments({ availability: 'in-stock' }),
      Car.countDocuments({ availability: 'booked' }),
      Car.countDocuments({ availability: 'sold' }),
      Car.aggregate([{ $group: { _id: null, avgPrice: { $avg: '$price' } } }])
    ]);

    const avgPrice = avgPriceData[0]?.avgPrice || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCars,
        activeListing,
        bookedCars,
        soldCars,
        avgPrice,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  addToWishlist,
  removeFromWishlist,
  getFeaturedCars,
  getDashboardStats,
};
