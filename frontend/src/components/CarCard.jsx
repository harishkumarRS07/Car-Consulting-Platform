import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPriceCompact } from '../utils/priceFormatter';

export default function CarCard({ car, onWishlist, isInWishlist }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ y: -4 }}
      className="relative rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-shadow duration-300 group cursor-pointer w-full flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - Compact with Gradient Background */}
      <div className="relative h-[160px] w-full overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <img
          src={car.images?.[0] || 'https://via.placeholder.com/400x300?text=Car'}
          alt={car.title}
          className="w-full h-full object-cover"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(car);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
            isInWishlist 
              ? 'bg-red-500 text-white shadow-md' 
              : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'
          }`}
        >
          <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Stock Badge */}
        {car.availability === 'in-stock' && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md z-10">
            In Stock
          </div>
        )}

        {/* Booked/Upcoming Badge */}
        {car.availability && car.availability !== 'in-stock' && (
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md z-10 ${
            car.availability === 'booked' ? 'bg-red-500' : 'bg-amber-500'
          } text-white`}>
            {car.availability === 'booked' ? 'Booked' : 'Upcoming'}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Car Title */}
        <Link to={`/cars/${car._id}`} className="block mb-2">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
            {car.title}
          </h3>
        </Link>

        {/* Price - Large and Bold */}
        <div className="mb-3">
          <p className="text-lg font-black text-gray-900 leading-none">
            {formatPriceCompact(car.price)}
          </p>
        </div>

        {/* Metadata Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* Fuel Type Chip */}
          <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
            {car.fuelType}
          </span>

          {/* Transmission Chip */}
          <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-md border border-purple-100">
            {car.transmission}
          </span>

          {/* Year Chip */}
          <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-md border border-gray-200">
            {car.year}
          </span>
        </div>

        {/* Quick Specs Row */}
        <div className="flex items-center gap-3 mb-3 py-2.5 border-t border-b border-gray-100 text-xs text-gray-600">
          <div className="flex-1 text-center">
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">KMS</p>
            <p className="font-bold text-gray-900">{(car.kmsDriven / 1000).toFixed(0)}k</p>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex-1 text-center">
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Location</p>
            <p className="font-bold text-gray-900 text-xs line-clamp-1">{car.location || 'N/A'}</p>
          </div>
        </div>

        {/* View Details Button */}
        <Link
          to={`/cars/${car._id}`}
          className="w-full py-2.5 px-3 bg-purple-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors duration-200 text-center active:scale-95"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
