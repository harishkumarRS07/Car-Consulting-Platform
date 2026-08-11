import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a base64 image string to Cloudinary.
 * If the string is already a URL, returns it as-is.
 * If upload fails or credentials are dummy, returns a beautiful fallback URL in development.
 * 
 * @param {string} base64Str - The image source (base64 data URI or HTTP URL)
 * @param {'customer' | 'car'} type - Context for the image fallback
 * @returns {Promise<string>} The uploaded image URL or a fallback URL
 */
export const uploadToCloudinary = async (base64Str, _type = 'customer') => {
  if (!base64Str) {return '';}

  // If it's already an uploaded image URL, return it
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
    return base64Str;
  }

  try {
    // Check if Cloudinary credentials are set and not default placeholders
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || cloudName === 'demo' || !apiKey || apiKey === '123456789' || !apiSecret || apiSecret === 'test_secret_key') {
      throw new Error('Placeholder or missing Cloudinary credentials');
    }

    const uploadResponse = await cloudinary.uploader.upload(base64Str, {
      folder: 'testimonials',
      resource_type: 'image',
    });

    return uploadResponse.secure_url;
  } catch (error) {
    console.warn(`⚠️ Cloudinary upload skipped or failed: ${error.message}. Storing base64 string locally in MongoDB.`);
    
    // In production, throw error if it's not a placeholder credentials bypass
    if (process.env.NODE_ENV === 'production' && !error.message.includes('Placeholder')) {
      throw new Error(`Cloudinary upload failed: ${error.message}`, { cause: error });
    }

    // Fall back to returning the original base64 string so it displays correctly
    return base64Str;
  }
};

/**
 * Uploads a base64 image string specifically for sell requests.
 * Stores both secure_url and public_id.
 * If credentials are mock or missing, returns an Unsplash fallback to avoid DB bloating.
 * 
 * @param {string} base64Str - base64 string of the image
 * @param {string} requestId - The generated Request ID for folder organization
 * @returns {Promise<{ url: string, publicId: string } | null>} Image object
 */
export const uploadSellRequestImage = async (base64Str, requestId) => {
  if (!base64Str) {return null;}

  // If it's already an uploaded image URL, return it
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
    return { url: base64Str, publicId: 'external-image' };
  }

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || cloudName === 'demo' || !apiKey || apiKey === '123456789' || !apiSecret || apiSecret === 'test_secret_key') {
      throw new Error('Placeholder or missing Cloudinary credentials');
    }

    const uploadResponse = await cloudinary.uploader.upload(base64Str, {
      folder: `carconsult/sell-requests/${requestId}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id
    };
  } catch (error) {
    console.warn(`⚠️ Cloudinary upload skipped or failed: ${error.message}. Returning high-quality mock URL to avoid MongoDB bloat.`);
    
    // In production, throw error if not placeholder credentials bypass
    if (process.env.NODE_ENV === 'production' && !error.message.includes('Placeholder')) {
      throw new Error(`Cloudinary upload failed: ${error.message}`, { cause: error });
    }

    const mockId = `carconsult/sell-requests/${requestId}/mock_car_${Math.floor(Math.random() * 100000)}`;
    const mockUrls = [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200'
    ];
    const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    
    return {
      url: randomUrl,
      publicId: mockId
    };
  }
};

/**
 * Deletes a file from Cloudinary by public ID.
 * 
 * @param {string} publicId - The public ID of the Cloudinary resource
 * @returns {Promise<boolean>} Success status
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId === 'external-image' || publicId.includes('mock_')) {
    return true; // Bypass for external or mock items
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error(`Error deleting from Cloudinary (${publicId}):`, error.message);
    return false;
  }
};

