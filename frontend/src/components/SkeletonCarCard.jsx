import { motion } from 'framer-motion';

const SkeletonCarCard = () => {
  const shimmerAnimation = {
    animate: { x: ['-100%', '100%'] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
  };

  const ShimmerOverlay = () => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 opacity-60"
      {...shimmerAnimation}
    />
  );

  return (
    <div className="relative rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm flex flex-col h-full select-none">
      {/* Top Section (Image Placeholder) */}
      <div className="relative w-full h-[140px] sm:h-[160px] md:h-[175px] bg-gray-200 overflow-hidden">
        <ShimmerOverlay />
        
        {/* Faux Badge */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-6 py-2 rounded-full bg-white/70 backdrop-blur-sm z-10" />
        
        {/* Faux Wishlist Button */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/70 backdrop-blur-sm z-10" />

        {/* Faux Year Tag */}
        <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 px-8 py-2 rounded bg-black/30 backdrop-blur-sm z-10" />
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between bg-white space-y-3">
        <div className="space-y-2">
          {/* Faux Title */}
          <div className="relative h-4 bg-gray-200 rounded w-4/5 overflow-hidden">
            <ShimmerOverlay />
          </div>
          
          {/* Faux Subtitle / Variant */}
          <div className="relative h-3 bg-gray-200 rounded w-3/5 overflow-hidden">
            <ShimmerOverlay />
          </div>

          {/* Faux Price */}
          <div className="relative h-5 bg-gray-200 rounded w-2/5 overflow-hidden">
            <ShimmerOverlay />
          </div>

          {/* Faux Specs Pills */}
          <div className="flex gap-1.5 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative h-4.5 bg-gray-150 rounded-md w-12 overflow-hidden">
                <ShimmerOverlay />
              </div>
            ))}
          </div>

          {/* Faux Location */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="w-3.5 h-3.5 bg-gray-250 rounded-full flex-shrink-0 animate-pulse" />
            <div className="relative h-3.5 bg-gray-200 rounded w-1/3 overflow-hidden">
              <ShimmerOverlay />
            </div>
          </div>
        </div>

        {/* Faux Button */}
        <div className="relative h-9.5 bg-gray-200 rounded-lg overflow-hidden mt-2">
          <ShimmerOverlay />
        </div>
      </div>

      {/* Faux Assured Footer */}
      <div className="w-full bg-gray-50/50 border-t border-gray-100 px-3 py-2 sm:px-3.5 flex items-center justify-between mt-auto">
        <div className="relative h-3 bg-gray-200 rounded w-1/3 overflow-hidden">
          <ShimmerOverlay />
        </div>
        <div className="w-12 h-4 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonCarCard;

