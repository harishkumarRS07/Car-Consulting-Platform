/**
 * Format price in Indian format (Lakhs and Crores)
 * @param {number} price - Price in rupees
 * @returns {string} Formatted price string
 */
export const formatPriceInINR = (price) => {
  if (!price || price === 0) return '₹0';
  
  const lakhs = price / 100000;
  const crores = price / 10000000;
  
  // If price is 1 crore or more, show in crores
  if (crores >= 1) {
    return `₹${crores.toFixed(2)} Cr`;
  }
  
  // Otherwise show in lakhs
  return `₹${lakhs.toFixed(2)} L`;
};

/**
 * Format price with compact notation (e.g., "50 L", "1.5 Cr")
 * @param {number} price - Price in rupees
 * @returns {string} Compact formatted price string
 */
export const formatPriceCompact = (price) => {
  if (!price || price === 0) return '₹0';
  
  const lakhs = price / 100000;
  const crores = price / 10000000;
  
  // If price is 1 crore or more, show in crores
  if (crores >= 1) {
    return `₹${crores.toFixed(1)} Cr`;
  }
  
  // Otherwise show in lakhs
  return `₹${lakhs.toFixed(1)} L`;
};
