import axios from 'axios';

/**
 * WhatsApp Cloud API Service
 * Handles WhatsApp notifications sent via Meta's Cloud API
 * Uses client's own WABA credentials (access token, phone number ID, etc.)
 */

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const BUSINESS_PHONE_NUMBER = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER; // Admin phone
const API_VERSION = 'v19.0';

/**
 * Send WhatsApp notification to admin when new booking is created
 * @param {Object} bookingData - The booking details
 * @returns {Promise<Object>} WhatsApp API response
 */
export const sendBookingNotification = async (bookingData) => {
  try {
    // Validate credentials
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN || !BUSINESS_PHONE_NUMBER) {
      console.error('Missing WhatsApp credentials in environment variables');
      return {
        success: false,
        error: 'WhatsApp service not configured',
      };
    }

    // Format the message content
    const messageContent = formatBookingMessage(bookingData);

    // WhatsApp Cloud API endpoint
    const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

    // If template doesn't exist, fallback to text message
    const fallbackPayload = {
      messaging_product: 'whatsapp',
      to: BUSINESS_PHONE_NUMBER,
      type: 'text',
      text: {
        body: messageContent,
      },
    };

    // Send request to Meta Cloud API
    const response = await axios.post(url, fallbackPayload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('WhatsApp notification sent successfully:', response.data);

    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      status: response.data.messages?.[0]?.message_status,
    };
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
};

/**
 * Format booking message for WhatsApp
 * @param {Object} bookingData - The booking details
 * @returns {string} Formatted message
 */
const formatBookingMessage = (bookingData) => {
  return `
🚗 *New Car Evaluation Booking*

👤 *Name:* ${bookingData.name}
📞 *Phone:* ${bookingData.phone}
📍 *Area:* ${bookingData.area}
${bookingData.email ? `📧 *Email:* ${bookingData.email}\n` : ''}
🚘 *Car:* ${bookingData.brand} ${bookingData.model}
📅 *Year:* ${bookingData.year}
⛽ *Fuel Type:* ${bookingData.variant}
👨 *Owner:* ${bookingData.owner}
🛣️ *KMs Driven:* ${bookingData.kms}

📅 *Scheduled Date:* ${bookingData.date}
⏰ *Time Slot:* ${bookingData.timeSlot}
🔖 *Booking ID:* ${bookingData.bookingId}

---
*Action Required:* Contact customer to confirm evaluation schedule.
  `.trim();
};

/**
 * Send opt-in request to customer (optional feature)
 * @param {string} customerPhone - Customer phone number
 * @param {string} customerName - Customer name
 * @returns {Promise<Object>} WhatsApp API response
 */
export const sendCustomerOptIn = async (customerPhone, customerName) => {
  try {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return { success: false, error: 'WhatsApp service not configured' };
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: customerPhone,
      type: 'text',
      text: {
        body: `Hi ${customerName}! 👋\n\nThank you for booking a car evaluation with us. Our expert will contact you shortly to confirm the details.\n\nBooking Reference: Check your email/SMS for booking ID.\n\n- CarConsult Team`,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('Error sending customer opt-in:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get WhatsApp server status (for health checks)
 * @returns {Promise<Object>} Service status
 */
export const getWhatsAppStatus = async () => {
  try {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return {
        configured: false,
        message: 'WhatsApp credentials not configured',
      };
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    return {
      configured: true,
      phoneNumberId: PHONE_NUMBER_ID,
      displayPhoneNumber: response.data.display_phone_number,
      qualityRating: response.data.quality_rating,
    };
  } catch (error) {
    console.error('Error fetching WhatsApp status:', error.message);
    return {
      configured: false,
      error: error.message,
    };
  }
};

export default {
  sendBookingNotification,
  sendCustomerOptIn,
  getWhatsAppStatus,
};
