import { motion } from 'framer-motion';

const SkeletonTestimonials = ({ count = 3 }) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0.5, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
    >
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className="relative rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-end p-6 h-[400px] sm:h-[450px] animate-pulse"
        >
          {/* Faux Shimmer Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
          
          <div className="relative z-10 space-y-4 w-full">
            {/* Rating Stars Shimmer */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="w-3.5 h-3.5 bg-slate-800 rounded-full" />
              ))}
            </div>

            {/* Review text Shimmer */}
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-5/6" />
              <div className="h-4 bg-slate-800 rounded w-4/6" />
            </div>

            {/* Tags / Model Shimmer */}
            <div className="h-6 bg-slate-800 rounded-full w-24" />

            {/* Client Info Shimmer */}
            <div className="flex items-center gap-3 pt-2">
              {/* Avatar placeholder */}
              <div className="w-10 h-10 rounded-full bg-slate-800" />
              <div className="space-y-1.5 flex-1">
                {/* Client name */}
                <div className="h-3.5 bg-slate-800 rounded w-24" />
                {/* Client location */}
                <div className="h-3 bg-slate-800 rounded w-16" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SkeletonTestimonials;
