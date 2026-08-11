import SellRequest from '../models/SellRequest.js';
import Car from '../models/Car.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { sendBookingNotification } from '../services/whatsappService.js';
import { getModelsByBrand as getModelsForBrand } from '../utils/carModelsMap.js';
import { uploadSellRequestImage, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

// Get unique car brands from currently active listings
export const getActiveBrands = async (req, res, next) => {
  try {
    const brands = await Car.distinct('brand', { availability: { $nin: ['booked', 'sold'] } });
    
    // Add default fallbacks just in case the DB is completely empty (better UX)
    const fallbackBrands = ['Maruti', 'Hyundai', 'Honda', 'Toyota', 'Tata', 'Renault', 'Volkswagen', 'Ford', 'Skoda', 'Mahindra'];
    
    res.status(200).json({
      success: true,
      brands: brands.length > 0 ? brands : fallbackBrands,
    });
  } catch (error) {
    next(error);
  }
};

// Get associated models based on brand
export const getModelsByBrand = async (req, res, next) => {
  try {
    const { brand } = req.params;
    
    // Use the comprehensive car models map
    const models = getModelsForBrand(brand);
    
    res.status(200).json({
      success: true,
      models,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create sell request and send WhatsApp notification asynchronously
 * The notification is sent in the background without blocking the API response
 */
export const createSellRequest = async (req, res, next) => {
  // We define uploadedImages array here to make it accessible in catch block for rollback
  const uploadedImages = [];
  try {
    const {
      brand,
      model,
      year,
      variant,
      owner,
      kms,
      carImages,
      name,
      phone,
      email,
      area,
      date,
      timeSlot,
      whatsappConsent,
      expectedPrice,
      description,
    } = req.body;

    // Pre-generate sequential Request ID before uploading images
    const requestId = await SellRequest.generateNextRequestId();

    // Upload base64 images to Cloudinary concurrently (returns mock fallbacks if credentials are mock/missing)
    if (carImages && Array.isArray(carImages)) {
      const uploadPromises = carImages.map(async (base64Str) => {
        try {
          const result = await uploadSellRequestImage(base64Str, requestId);
          return { success: true, result };
        } catch (error) {
          return { success: false, error };
        }
      });

      // Wait for all uploads to resolve in parallel
      const uploadResults = await Promise.all(uploadPromises);

      // Check if any upload failed
      const failure = uploadResults.find(r => !r.success);
      if (failure) {
        // Rollback all successfully uploaded images
        for (const r of uploadResults) {
          if (r.success && r.result?.publicId) {
            await deleteFromCloudinary(r.result.publicId);
          }
        }
        return next(new AppError(`Image upload failed: ${failure.error.message}`, 500));
      }

      // Collect successfully uploaded images
      for (const r of uploadResults) {
        if (r.result) {
          uploadedImages.push({
            url: r.result.url,
            publicId: r.result.publicId
          });
        }
      }
    }

    // Determine default fuelType based on variant
    const fuelType = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].includes(variant) ? variant : 'Petrol';

    // Create the sell request
    const sellRequest = new SellRequest({
      requestId,
      bookingId: requestId, // legacy compatibility
      ownerName: name,
      phone,
      email,
      brand,
      model,
      variant: variant || 'Standard',
      year: year ? parseInt(year) : new Date().getFullYear(),
      fuelType,
      transmission: 'Manual', // Default as it is not present in the customer form wizard
      kmDriven: kms,
      ownership: owner,
      registrationState: 'Karnataka', // Default state fallback
      registrationCity: area,
      expectedPrice: expectedPrice ? parseFloat(expectedPrice) : 500000,
      description: description || '',
      images: uploadedImages,
      status: 'Pending',

      // Keep legacy fields populated for backward compatibility
      name,
      owner,
      kms,
      area,
      date,
      timeSlot,
      whatsappConsent: whatsappConsent !== false
    });

    try {
      await sellRequest.save();
    } catch (saveError) {
      // Rollback all uploaded images if DB save fails
      for (const img of uploadedImages) {
        if (img.publicId) {
          await deleteFromCloudinary(img.publicId);
        }
      }
      throw saveError;
    }

    // Prepare success response (don't wait for WhatsApp notification)
    const responseData = {
      success: true,
      message: 'Evaluation booked successfully',
      requestId: sellRequest.requestId,
      bookingId: sellRequest.bookingId, // legacy compatibility
      sellRequest,
    };

    // Send WhatsApp notification asynchronously (fire and forget)
    triggerWhatsAppNotification(sellRequest).catch(error => {
      console.error('Background WhatsApp notification failed:', error);
    });

    res.status(201).json(responseData);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return next(new AppError(`Validation error: ${  messages}`, 400));
    }
    next(error);
  }
};

/**
 * Send WhatsApp notification in the background
 * Updates the database with notification status after sending
 */
async function triggerWhatsAppNotification(sellRequest) {
  try {
    const result = await sendBookingNotification({
      name: sellRequest.ownerName,
      phone: sellRequest.phone,
      email: sellRequest.email,
      area: sellRequest.registrationCity,
      brand: sellRequest.brand,
      model: sellRequest.model,
      year: sellRequest.year,
      variant: sellRequest.variant,
      owner: sellRequest.ownership,
      kms: sellRequest.kmDriven,
      date: sellRequest.date || new Date().toISOString().split('T')[0],
      timeSlot: sellRequest.timeSlot || '09:00 AM',
      bookingId: sellRequest.bookingId,
    });

    // Update notification status in database
    if (result.success) {
      sellRequest.notificationSent = true;
      if (result.messageId) {
        sellRequest.whatsappMessageId = result.messageId;
      }
      await sellRequest.save();
      console.log(`WhatsApp notification sent successfully for booking ${sellRequest.requestId}`);
    } else {
      console.warn(`Failed to send WhatsApp notification for booking ${sellRequest.requestId}:`, result.error);
    }
  } catch (error) {
    console.error(`Error in triggerWhatsAppNotification for ${sellRequest.requestId}:`, error);
  }
}

/**
 * Get all scheduling requests (for admin dashboard) with advanced filter/search/sort
 */
export const getScheduledRequests = async (req, res, next) => {
  try {
    const {
      status,
      searchQuery,
      brand,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      sort,
      limit = 100,
      skip = 0
    } = req.query;
    
    // Build filter
    const filter = {};
    
    // Status Filter (handle both legacy lowercase and new capitalized statuses)
    if (status && status !== 'all') {
      const statusMap = {
        'pending': 'Pending',
        'confirmed': 'Inspection Scheduled',
        'completed': 'Purchased',
        'cancelled': 'Rejected',
        'under review': 'Under Review',
        'inspection scheduled': 'Inspection Scheduled',
        'offer sent': 'Offer Sent',
        'purchased': 'Purchased',
        'rejected': 'Rejected'
      };
      
      const mappedStatus = statusMap[status.toLowerCase()] || status;
      filter.status = mappedStatus;
    }
    
    // Brand Filter
    if (brand && brand !== 'all') {
      filter.brand = { $regex: `^${brand}$`, $options: 'i' };
    }

    // Date Range Filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Price Range Filter
    if (minPrice || maxPrice) {
      filter.expectedPrice = {};
      if (minPrice) {
        filter.expectedPrice.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.expectedPrice.$lte = parseFloat(maxPrice);
      }
    }

    // Search Query (RequestId, customer name, phone, brand, model)
    if (searchQuery) {
      filter.$or = [
        { requestId: { $regex: searchQuery, $options: 'i' } },
        { ownerName: { $regex: searchQuery, $options: 'i' } },
        { name: { $regex: searchQuery, $options: 'i' } }, // legacy name
        { phone: { $regex: searchQuery, $options: 'i' } },
        { brand: { $regex: searchQuery, $options: 'i' } },
        { model: { $regex: searchQuery, $options: 'i' } },
        { bookingId: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    // Sort order mapping
    let sortOption = { createdAt: -1 }; // default newest
    if (sort) {
      switch (sort) {
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'highest_price':
          sortOption = { expectedPrice: -1 };
          break;
        case 'lowest_price':
          sortOption = { expectedPrice: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const requests = await SellRequest.find(filter)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await SellRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      requests,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update scheduling request status (maps legacy states too)
 */
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    // Convert legacy lowercase statuses to new capitalized format
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Inspection Scheduled',
      'completed': 'Purchased',
      'cancelled': 'Rejected'
    };
    if (statusMap[status]) {
      status = statusMap[status];
    }

    const validStatuses = ['Pending', 'Under Review', 'Inspection Scheduled', 'Offer Sent', 'Purchased', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const sellRequest = await SellRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!sellRequest) {
      return next(new AppError('Scheduling request not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      sellRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get scheduling statistics
 */
export const getScheduleStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const stats = {
      totalRequests: await SellRequest.countDocuments(),
      pending: await SellRequest.countDocuments({ status: 'Pending' }),
      purchased: await SellRequest.countDocuments({ status: 'Purchased' }),
      rejected: await SellRequest.countDocuments({ status: 'Rejected' }),
      todayRequests: await SellRequest.countDocuments({ createdAt: { $gte: startOfToday } }),

      // Keep legacy fields so we don't break existing tabs
      totalScheduled: await SellRequest.countDocuments(),
      confirmed: await SellRequest.countDocuments({ status: { $in: ['Inspection Scheduled', 'Offer Sent'] } }),
      completed: await SellRequest.countDocuments({ status: 'Purchased' }),
      cancelled: await SellRequest.countDocuments({ status: 'Rejected' }),
      notificationsSent: await SellRequest.countDocuments({ notificationSent: true }),
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySellRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Query both fields for compatibility
    const requests = await SellRequest.find({
      $or: [
        { email: user.email },
        { ownerName: user.name }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a sell request, including all associated Cloudinary images
 */
export const deleteSellRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sellRequest = await SellRequest.findById(id);
    if (!sellRequest) {
      return next(new AppError('Sell request not found', 404));
    }

    // Delete every associated Cloudinary image using its publicId
    if (sellRequest.images && sellRequest.images.length > 0) {
      for (const img of sellRequest.images) {
        if (img.publicId) {
          await deleteFromCloudinary(img.publicId);
        }
      }
    }

    // Delete the database document
    await SellRequest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Sell request and associated images deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getActiveBrands,
  getModelsByBrand,
  createSellRequest,
  getScheduledRequests,
  updateRequestStatus,
  getScheduleStats,
  getMySellRequests,
  deleteSellRequest,
};

