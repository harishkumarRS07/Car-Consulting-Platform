import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoadingStore } from '../context/store';
import LoadingSpinner from './LoadingSpinner';

const RouteTransitionLoader = () => {
  const [pageTransition, setPageTransition] = useState(false);
  const location = useLocation();
  const activeRequests = useLoadingStore((state) => state.activeRequests);

  useEffect(() => {
    // Show spinner immediately on route change
    setPageTransition(true);
    
    // Smooth minimum visual buffer time for transition overlay (250ms)
    const minDisplayTimer = setTimeout(() => {
      setPageTransition(false);
    }, 250);

    return () => clearTimeout(minDisplayTimer);
  }, [location]);

  // Show loader if page transition is running OR we are actively fetching API data
  const showLoader = pageTransition || activeRequests > 0;

  return (
    <AnimatePresence mode="wait">
      {showLoader && (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-4"
        >
          <LoadingSpinner fullScreen={false} size="default" message="Gathering data..." />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouteTransitionLoader;


