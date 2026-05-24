import { motion } from 'framer-motion';
import { useState } from 'react';

const BrandSelector = ({ brands, selectedBrand, onSelectBrand, loading }) => {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (brandName) => {
    setImageErrors(prev => ({ ...prev, [brandName]: true }));
  };

  const fallbackLogo = (
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center text-xs font-bold text-purple-700">
      Logo
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {brands.map((brand) => (
        <motion.button
          key={brand.name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectBrand(brand.name)}
          className={`
            group relative p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm
            flex flex-col items-center justify-center gap-3 min-h-[180px]
            ${
              selectedBrand === brand.name
                ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-lg hover:bg-gray-50'
            }
          `}
        >
          {/* Logo Container */}
          <div className="flex items-center justify-center h-16 w-16">
            {imageErrors[brand.name] ? (
              fallbackLogo
            ) : (
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                onError={() => handleImageError(brand.name)}
                loading="lazy"
              />
            )}
          </div>

          {/* Brand Name */}
          <span
            className={`
              text-sm sm:text-base font-semibold text-center transition-colors duration-300
              ${
                selectedBrand === brand.name
                  ? 'text-purple-700'
                  : 'text-gray-700 group-hover:text-purple-600'
              }
            `}
          >
            {brand.name}
          </span>

          {/* Selection Indicator */}
          {selectedBrand === brand.name && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}
        </motion.button>
      ))}
      </div>
    </div>
  );
};

export default BrandSelector;
