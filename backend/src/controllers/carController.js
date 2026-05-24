import Car from '../models/Car.js';
import User from '../models/User.js';

export const getCars = async (req, res) => {
  try {
    const { search, brand, fuelType, transmission, priceMin, priceMax, yearMin, yearMax, bodyType, owner, location, category, page = 1, limit = 12, admin } = req.query;

    let filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Brand filter (supports multiple brands)
    if (brand) {
      const brands = brand.split(',').map((b) => b.toLowerCase().trim());
      filter.brand = { $in: brands };
    }

    // Fuel type filter
    if (fuelType) {
      const fuelTypes = fuelType.split(',').map((f) => f.toLowerCase().trim());
      filter.fuelType = { $in: fuelTypes };
    }

    // Transmission filter
    if (transmission) {
      const transmissions = transmission.split(',').map((t) => t.toLowerCase().trim());
      filter.transmission = { $in: transmissions };
    }

    // Price range filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    // Year range filter
    if (yearMin || yearMax) {
      filter.year = {};
      if (yearMin) filter.year.$gte = parseFloat(yearMin);
      if (yearMax) filter.year.$lte = parseFloat(yearMax);
    }

    // Body type filter
    if (bodyType) {
      const bodyTypes = bodyType.split(',').map((b) => b.toLowerCase().trim());
      filter.bodyType = { $in: bodyTypes };
    }

    // Owner filter
    if (owner) {
      const owners = owner.split(',').map((o) => o.toLowerCase().trim());
      filter.owner = { $in: owners };
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Category filter
    if (category) {
      const categories = category.split(',').map((c) => c.toLowerCase().trim());
      filter.category = { $in: categories };
    }

    // Exclude booked and sold cars from user UI
    if (!admin) {
      filter.availability = { $nin: ['booked', 'sold'] };
    }

    const skip = (page - 1) * limit;

    const [cars, totalCars] = await Promise.all([
      Car.find(filter)
        .select({ images: { $slice: 1 }, description: 0 })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
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
    res.status(500).json({ success: false, message: 'Error fetching cars', error: error.message });
  }
};

export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
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
    res.status(500).json({ success: false, message: 'Error fetching car', error: error.message });
  }
};

export const createCar = async (req, res) => {
  try {
    const carData = req.body;

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
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error: ' + messages,
        error: messages 
      });
    }

    res.status(500).json({ success: false, message: 'Error creating car', error: error.message });
  }
};

export const updateCar = async (req, res) => {
  try {
    // Validate that ID is provided
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'Car ID is required' });
    }

    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
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
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error: ' + messages,
        error: messages 
      });
    }
    
    // Handle cast errors (invalid ID format)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid car ID format' 
      });
    }

    res.status(500).json({ success: false, message: 'Error updating car', error: error.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting car', error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Error adding to wishlist', error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Error removing from wishlist', error: error.message });
  }
};

export const getFeaturedCars = async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Error fetching featured cars', error: error.message });
  }
};

export const getNewArrivals = async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Error fetching new arrivals', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
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
