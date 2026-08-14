import { Heart, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPriceCompact } from '../utils/priceFormatter';

// Helper to capitalize words
const capitalize = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function CarCard({ car, onWishlist, isInWishlist }) {
  const year = car.year || '';
  const brand = car.brand ? capitalize(car.brand) : '';
  const model = car.model ? capitalize(car.model) : '';
  const fullTitle = `${year} ${brand} ${model}`.trim() || car.title || 'Car Details';

  const variantText = car.variant
    ? capitalize(car.variant)
    : `${capitalize(car.color || 'Standard')} • ${car.owner || '1st'} Owner`;

  // Filter tags for responsiveness (hide RTO or make compact on mobile)
  const tags = [
    car.kmsDriven ? `${(car.kmsDriven / 1000).toFixed(0)}K km` : null,
    car.fuelType ? capitalize(car.fuelType) : null,
    car.transmission ? capitalize(car.transmission) : null,
    car.rto ? car.rto.toUpperCase() : null,
  ].filter(Boolean);

  const getTagline = () => {
    if (car.category === 'luxury') return 'Premium Luxury Selection';
    if (car.category === 'assured') return '150-Point Checked';
    if (car.availability === 'in-stock') return 'Ready for Immediate Delivery';
    return 'Excellent Condition';
  };

  const defaultImg = 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      className="relative rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col h-full group"
    >
      {/* Top Section (Image & Badges) */}
      <div className="relative w-full h-[140px] sm:h-[160px] md:h-[175px] bg-gray-50 overflow-hidden select-none">
        <img
          src={car.images?.[0] || defaultImg}
          alt={fullTitle}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Body Type Badge */}
        {car.bodyType && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-gray-900 shadow-sm z-10 border border-white/40">
            {capitalize(car.bodyType)}
          </span>
        )}

        {/* Availability Badge */}
        {car.availability && car.availability !== 'in-stock' && (
          <span className={`absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm z-10 ${car.availability === 'booked' ? 'bg-red-500' : 'bg-amber-500'
            }`}>
            {car.availability}
          </span>
        )}

        {/* Wishlist Heart Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onWishlist) onWishlist(car);
          }}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-md border transition-all duration-200 z-10 ${isInWishlist
            ? 'bg-red-500 text-white border-red-400'
            : 'bg-white/80 text-gray-700 hover:bg-white border-white/60'
            }`}
        >
          <Heart
            size={13}
            className={isInWishlist ? 'fill-white stroke-white' : 'stroke-gray-800'}
            strokeWidth={2.2}
          />
        </motion.button>

        {/* Bottom Image Model Year Tag */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-2.5 sm:left-2.5 sm:right-2.5 flex justify-between items-end z-10">
          {car.year && (
            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold bg-black/50 backdrop-blur-md text-white/90">
              {car.year} Model
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between bg-white">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Header & Title */}
          <div>
            <div className="flex justify-between items-start gap-2 mb-0.5">
              <Link to={`/cars/${car._id}`} className="block flex-1 min-w-0 group-hover:text-purple-600 transition-colors">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug tracking-tight">
                  {fullTitle}
                </h3>
              </Link>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate leading-normal">
              {variantText}
            </p>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
            <span className="text-sm sm:text-base font-extrabold text-purple-700 tracking-tight">
              {formatPriceCompact(car.price)}
            </span>
            {car.price && car.price > 500000 && (
              <span className="text-[8px] sm:text-[10px] font-medium text-slate-400 whitespace-nowrap">
                (EMI from ₹{(Math.round(car.price * 0.018)).toLocaleString()}/mo)
              </span>
            )}
          </div>

          {/* Specs Pills (Compact on Mobile) */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-0.5 sm:text-[10px] font-semibold bg-slate-100/90 text-slate-650 rounded-md tracking-tight select-none ${idx === 3 ? 'hidden sm:inline-block' : 'inline-block' // Hide 4th tag (RTO) on mobile to prevent overflow wrap
                  }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-slate-400 pt-0.5">
            <MapPin size={11} className="text-purple-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">
              {car.location || 'Location Available'}
            </span>
          </div>
        </div>

        {/* Action Button - 48px min touch target on mobile via padding */}
        <div className="pt-2 mt-1.5">
          <Link
            to={`/cars/${car._id}`}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 sm:py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-purple-500/10 hover:shadow-md transition-all duration-200 group/btn min-h-[38px] sm:min-h-0"
          >
            <span>View Details</span>
            <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* Assured Banner Footer */}
      <div className="w-full bg-slate-50/80 border-t border-slate-100 px-3 py-1.5 sm:px-3.5 sm:py-1.5 flex items-center justify-between gap-2 text-[9px] sm:text-[10px] text-slate-500 select-none mt-auto">
        <span className="font-medium text-slate-600 truncate">{getTagline()}</span>
        <div className="flex items-center gap-1 text-purple-700 font-semibold flex-shrink-0">
          <ShieldCheck size={12} className="text-purple-600" />
          <span>Assured</span>
        </div>
      </div>
    </motion.div>
  );
}
