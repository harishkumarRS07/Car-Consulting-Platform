import { motion } from 'framer-motion';
import { useState } from 'react';
import SkeletonBrandSelector from './SkeletonBrandSelector';

const BrandSelector = ({ brands, selectedBrand, onSelectBrand, loading }) => {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (brandName) => {
    setImageErrors(prev => ({ ...prev, [brandName]: true }));
  };

  const fallbackLogo = (
    <div className="w-9 h-9 sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-purple-700">
      Logo
    </div>
  );

  if (loading) {
    return <SkeletonBrandSelector />;
  }


  // Format brand names nicely
  const formatBrandName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <div className="w-full">
      {/* Horizontal Scroll Layout for Mobile */}
      <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory gap-3 pb-3 px-1 scrollbar-none w-full scroll-smooth">
        {brands.map((brand) => (
          <button
            key={`mobile-${brand.name}`}
            onClick={() => onSelectBrand(brand.name)}
            className={`
              flex-shrink-0 snap-start w-[110px] h-[100px] p-3 rounded-xl border-2 transition-all duration-[200ms]
              flex flex-col items-center justify-center gap-1.5 relative select-none
              ${
                selectedBrand === brand.name
                  ? 'border-purple-600 bg-purple-50/50 shadow-[0_4px_10px_rgba(124,58,237,0.06)]'
                  : 'border-gray-100 bg-white active:border-purple-200'
              }
            `}
          >
            {/* Logo Container */}
            <div className="flex items-center justify-center h-[36px] w-[45px]">
              {imageErrors[brand.name] ? (
                fallbackLogo
              ) : (
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="h-[36px] w-auto max-w-[45px] object-contain transition-transform"
                  onError={() => handleImageError(brand.name)}
                  loading="lazy"
                />
              )}
            </div>

            {/* Brand Name */}
            <span
              className={`
                text-xs font-bold text-center leading-tight truncate w-full
                ${
                  selectedBrand === brand.name
                    ? 'text-purple-700'
                    : 'text-gray-700'
                }
              `}
            >
              {formatBrandName(brand.name)}
            </span>

            {/* Selection Check Indicator */}
            {selectedBrand === brand.name && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Grid Layout for Tablet, Laptop, and Desktop */}
      <div className="hidden sm:block max-h-[490px] overflow-y-auto pr-2 pb-2 mx-auto w-fit [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-100 hover:[&::-webkit-scrollbar-thumb]:bg-purple-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 justify-center justify-items-center">
          {brands.map((brand) => (
            <motion.button
              key={`desktop-${brand.name}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectBrand(brand.name)}
              className={`
                group relative w-[160px] h-[140px] p-4 sm:p-5 rounded-2xl border-2 transition-all duration-[250ms] ease-in-out
                flex flex-col items-center justify-center gap-3 select-none
                ${
                  selectedBrand === brand.name
                    ? 'border-purple-600 bg-purple-50/50 shadow-[0_4px_12px_rgba(124,58,237,0.08)]'
                    : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
                }
              `}
            >
              {/* Logo Container */}
              <div className="flex items-center justify-center h-[48px] w-[56px] sm:h-[52px] sm:w-[60px]">
                {imageErrors[brand.name] ? (
                  fallbackLogo
                ) : (
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    className="h-[48px] sm:h-[52px] w-auto max-w-[56px] sm:max-w-[60px] object-contain transition-transform duration-[250ms] ease-in-out group-hover:scale-105"
                    onError={() => handleImageError(brand.name)}
                    loading="lazy"
                  />
                )}
              </div>

              {/* Brand Name */}
              <span
                className={`
                  text-sm sm:text-base font-bold text-center transition-colors duration-[250ms] ease-in-out leading-tight
                  ${
                    selectedBrand === brand.name
                      ? 'text-purple-700'
                      : 'text-gray-700 group-hover:text-purple-600'
                  }
                `}
              >
                {formatBrandName(brand.name)}
              </span>

              {/* Selection Indicator */}
              {selectedBrand === brand.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
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
    </div>
  );
};

export default BrandSelector;
