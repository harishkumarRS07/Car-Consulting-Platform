import { motion } from 'framer-motion';

const SkeletonBrandSelector = () => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0.6 },
    animate: { 
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const skeletonItemMobile = (key) => (
    <motion.div
      key={key}
      variants={itemVariants}
      className="flex-shrink-0 w-[110px] h-[100px] p-3 rounded-xl border-2 border-gray-100 bg-white flex flex-col items-center justify-center gap-2.5"
    >
      {/* Circle Logo Placeholder */}
      <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
      {/* Name Placeholder */}
      <div className="w-14 h-3 bg-gray-100 rounded animate-pulse" />
    </motion.div>
  );

  const skeletonItemDesktop = (key) => (
    <motion.div
      key={key}
      variants={itemVariants}
      className="w-[160px] h-[140px] p-5 rounded-2xl border-2 border-gray-100 bg-white flex flex-col items-center justify-center gap-4 animate-pulse"
    >
      {/* Circle Logo Placeholder */}
      <div className="w-14 h-14 rounded-full bg-gray-200" />
      {/* Name Placeholder */}
      <div className="w-20 h-4 bg-gray-200 rounded" />
    </motion.div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full"
    >
      {/* Mobile Horizontal Scroll Layout */}
      <div className="flex sm:hidden overflow-x-auto gap-3 pb-3 px-1 scrollbar-none w-full">
        {[...Array(5)].map((_, i) => skeletonItemMobile(`mobile-skeleton-${i}`))}
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden sm:block mx-auto w-fit">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 justify-center justify-items-center">
          {[...Array(10)].map((_, i) => skeletonItemDesktop(`desktop-skeleton-${i}`))}
        </div>
      </div>
    </motion.div>
  );
};

export default SkeletonBrandSelector;
