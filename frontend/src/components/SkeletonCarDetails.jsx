import { motion } from 'framer-motion';

const SkeletonCarDetails = () => {
  const shimmerAnimation = {
    animate: { x: ['-100%', '100%'] },
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  };

  const ShimmerOverlay = () => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 opacity-60"
      {...shimmerAnimation}
    />
  );

  const SkeletonLine = ({ width = 'w-full', height = 'h-4' }) => (
    <div className={`${width} ${height} bg-gray-200 rounded relative overflow-hidden`}>
      <ShimmerOverlay />
    </div>
  );

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Large image skeleton */}
      <div className="w-full h-64 sm:h-[400px] bg-gray-200 relative overflow-hidden">
        <ShimmerOverlay />
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Title skeleton */}
        <SkeletonLine width="w-2/3" height="h-8" />

        {/* Price skeleton */}
        <SkeletonLine width="w-1/3" height="h-6" />

        {/* Specs grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <SkeletonLine width="w-1/2" height="h-3" />
              <SkeletonLine width="w-4/5" height="h-5" />
            </div>
          ))}
        </div>

        {/* Description skeleton */}
        <div className="space-y-3 pt-4">
          <SkeletonLine width="w-1/4" height="h-5" />
          {[1, 2, 3].map((i) => (
            <SkeletonLine key={i} width="w-full" height="h-4" />
          ))}
          <SkeletonLine width="w-2/3" height="h-4" />
        </div>

        {/* Buttons skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
          {[1, 2].map((i) => (
            <div key={i} className="relative h-12 bg-gray-200 rounded-xl overflow-hidden">
              <ShimmerOverlay />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonCarDetails;

