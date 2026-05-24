import SellRequest from '../models/SellRequest.js';
import Car from '../models/Car.js';
import { sendBookingNotification } from '../services/whatsappService.js';
import { getModelsByBrand as getModelsForBrand, getAllBrandsWithModels } from '../utils/carModelsMap.js';

// Get unique car brands from currently active listings
export const getActiveBrands = async (req, res) => {
  try {
    const brands = await Car.distinct('brand', { availability: { $nin: ['booked', 'sold'] } });
    
    // Add default fallbacks just in case the DB is completely empty (better UX)
    const fallbackBrands = ['Maruti', 'Hyundai', 'Honda', 'Toyota', 'Tata', 'Renault', 'Volkswagen', 'Ford', 'Skoda', 'Mahindra'];
    
    res.status(200).json({
      success: true,
      brands: brands.length > 0 ? brands : fallbackBrands,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching brands', error: error.message });
  }
};

// Get associated models based on brand
export const getModelsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    
    // Use the comprehensive car models map
    const models = getModelsForBrand(brand);
    
    res.status(200).json({
      success: true,
      models: models,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching models', error: error.message });
  }
};

/**
 * Create sell request and send WhatsApp notification asynchronously
 * The notification is sent in the background without blocking the API response
 */
export const createSellRequest = async (req, res) => {
  try {
    const requestData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'area', 'brand', 'model', 'date', 'timeSlot'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Create and save the sell request
    const sellRequest = new SellRequest(requestData);
    await sellRequest.save();

    // Prepare success response (don't wait for WhatsApp notification)
    const responseData = {
      success: true,
      message: 'Evaluation booked successfully',
      bookingId: sellRequest.bookingId,
      sellRequest,
    };

    // Send WhatsApp notification asynchronously (fire and forget)
    // This ensures the API response is fast and not blocked by external API calls
    triggerWhatsAppNotification(sellRequest).catch(error => {
      console.error('Background WhatsApp notification failed:', error);
    });

    res.status(201).json(responseData);
  } catch (error) {
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
    res.status(500).json({ success: false, message: 'Error booking evaluation', error: error.message });
  }
};

/**
 * Send WhatsApp notification in the background
 * Updates the database with notification status after sending
 */
async function triggerWhatsAppNotification(sellRequest) {
  try {
    const result = await sendBookingNotification({
      name: sellRequest.name,
      phone: sellRequest.phone,
      email: sellRequest.email,
      area: sellRequest.area,
      brand: sellRequest.brand,
      model: sellRequest.model,
      year: sellRequest.year,
      variant: sellRequest.variant,
      owner: sellRequest.owner,
      kms: sellRequest.kms,
      date: sellRequest.date,
      timeSlot: sellRequest.timeSlot,
      bookingId: sellRequest.bookingId,
    });

    // Update notification status in database
    if (result.success) {
      sellRequest.notificationSent = true;
      if (result.messageId) {
        sellRequest.whatsappMessageId = result.messageId;
      }
      await sellRequest.save();
      console.log(`WhatsApp notification sent successfully for booking ${sellRequest.bookingId}`);
    } else {
      console.warn(`Failed to send WhatsApp notification for booking ${sellRequest.bookingId}:`, result.error);
    }
  } catch (error) {
    console.error(`Error in triggerWhatsAppNotification for ${sellRequest.bookingId}:`, error);
  }
}

/**
 * Get all scheduling requests (for admin dashboard)
 */
export const getScheduledRequests = async (req, res) => {
  try {
    const { status, searchQuery, limit = 50, skip = 0 } = req.query;
    
    // Build filter
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } },
        { area: { $regex: searchQuery, $options: 'i' } },
        { brand: { $regex: searchQuery, $options: 'i' } },
        { bookingId: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const requests = await SellRequest.find(filter)
      .sort({ createdAt: -1 })
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
    res.status(500).json({ success: false, message: 'Error fetching requests', error: error.message });
  }
};

/**
 * Update scheduling request status
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const sellRequest = await SellRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!sellRequest) {
      return res.status(404).json({ success: false, message: 'Scheduling request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      sellRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
  }
};

/**
 * Get scheduling statistics
 */
export const getScheduleStats = async (req, res) => {
  try {
    const stats = {
      totalScheduled: await SellRequest.countDocuments(),
      pending: await SellRequest.countDocuments({ status: 'pending' }),
      confirmed: await SellRequest.countDocuments({ status: 'confirmed' }),
      completed: await SellRequest.countDocuments({ status: 'completed' }),
      cancelled: await SellRequest.countDocuments({ status: 'cancelled' }),
      notificationsSent: await SellRequest.countDocuments({ notificationSent: true }),
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};

export default {
  getActiveBrands,
  getModelsByBrand,
  createSellRequest,
  getScheduledRequests,
  updateRequestStatus,
  getScheduleStats,
};
