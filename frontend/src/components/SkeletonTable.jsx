import { motion } from 'framer-motion';

const SkeletonTable = ({ rows = 5, columns = 5 }) => {
  const containerVariants = {
    animate: {
      transition: { staggerChildren: 0.03 }
    }
  };

  const rowVariants = {
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full bg-white rounded-[24px] overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/75">
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-16 sm:w-24 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body Rows */}
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <motion.tr 
                key={rowIndex} 
                variants={rowVariants}
                className="border-b border-gray-100 last:border-none"
              >
                {[...Array(columns)].map((_, colIndex) => {
                  // Make columns look varied and realistic
                  let widthClass = "w-24";
                  if (colIndex === 0) widthClass = "w-32";
                  else if (colIndex === columns - 1) widthClass = "w-16";
                  
                  return (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {colIndex === 0 && (
                          // Circular avatar/icon placeholder for the first column
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 animate-pulse" />
                        )}
                        <div className={`h-4 bg-gray-100 rounded ${widthClass} animate-pulse`} />
                      </div>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SkeletonTable;
