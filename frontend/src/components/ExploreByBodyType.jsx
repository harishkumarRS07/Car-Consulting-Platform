import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, Zap, TrendingUp, Grid, Sparkles, Wind, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import { carsAPI } from '../services/api';
import { useCarsStore } from '../context/store';
import CarCard from './CarCard';
import SkeletonCarCard from './SkeletonCarCard';

export default function ExploreByBodyType() {
  const navigate = useNavigate();
  const [activeBodyType, setActiveBodyType] = useState('hatchback');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();
  const bodyScrollRef = useRef(null);

  const scrollBody = (direction) => {
    const container = bodyScrollRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Text capitalization utility
  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Body type configuration with icons and labels
  const bodyTypes = [
    {
      id: 'hatchback',
      label: 'Hatchback',
      icon: Car,
    },
    {
      id: 'sedan',
      label: 'Sedan',
      icon: TrendingUp,
    },
    {
      id: 'suv',
      label: 'SUV',
      icon: Grid,
    },
    {
      id: 'muv',
      label: 'MUV',
      icon: Zap,
    },
    {
      id: 'coupe',
      label: 'Coupe',
      icon: Sparkles,
    },
    {
      id: 'convertible',
      label: 'Convertible',
      icon: Wind,
    },
    {
      id: 'sports',
      label: 'Sports',
      icon: Rocket,
    },
  ];

  // Fetch cars for selected body type
  useEffect(() => {
    let isMounted = true;
    const fetchCarsByBodyType = async () => {
      setLoading(true);
      const startTime = Date.now();
      try {
        const response = await carsAPI.getCars({ bodyType: activeBodyType, limit: 100 });
        
        // Enforce a minimum loader layout visibility of 600ms for smooth professional feel
        const elapsedTime = Date.now() - startTime;
        const minimumLoadTime = 600;
        if (elapsedTime < minimumLoadTime) {
          await new Promise((resolve) => setTimeout(resolve, minimumLoadTime - elapsedTime));
        }

        if (isMounted) {
          setCars(response.data.cars || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching cars:', error);
          setCars([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCarsByBodyType();
    return () => {
      isMounted = false;
    };
  }, [activeBodyType]);

  const displayedCars = (cars || [])
    .filter((car) => car?.bodyType?.toLowerCase() === activeBodyType.toLowerCase())
    .slice(0, 4);

  const handleWishlist = (car) => {
    if (wishlist.find((w) => w._id === car._id)) {
      removeFromWishlist(car._id);
    } else {
      addToWishlist(car);
    }
  };

  const isInWishlist = (carId) => wishlist.some((w) => w._id === carId);

  const handleViewAll = () => {
    navigate(`/cars?bodyType=${activeBodyType}`);
  };

  return (
    <section className="bg-[#F8FAFC] py-14 px-6 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/2 left-[-10%] w-[450px] h-[450px] bg-purple-100/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-10 right-[-10%] w-[400px] h-[400px] bg-indigo-100/20 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <span className="text-xs tracking-[0.18em] uppercase text-purple-600 font-bold mb-1.5 block">
            Category Discovery
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 leading-tight">
            Explore by Body Type
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm font-medium leading-relaxed">
            Filter through our curated fleet dynamically sorted by vehicular architecture.
          </p>
        </motion.div>

        {/* Floating Category Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-start md:justify-center mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-200/50"
        >
          <div className="flex gap-2.5 p-1.5 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 w-fit">
            {bodyTypes.map((bodyType) => {
              const IconComponent = bodyType.icon;
              return (
                <motion.button
                  key={bodyType.id}
                  onClick={() => setActiveBodyType(bodyType.id)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 min-w-fit select-none ${activeBodyType === bodyType.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 border-transparent'
                    : 'bg-white text-slate-700 hover:text-purple-600 border border-slate-100 hover:border-purple-200'
                    }`}
                >
                  <IconComponent size={15} className={activeBodyType === bodyType.id ? 'text-white' : 'text-purple-500'} />
                  {bodyType.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Cars Grid inside a Luxury Rounded Container */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-3 sm:p-4 shadow-lg shadow-gray-200/20 mb-6">
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[260px] sm:min-w-[280px] md:min-w-[290px] flex-shrink-0">
                  <SkeletonCarCard />
                </div>
              ))}
            </div>
          ) : displayedCars && displayedCars.length > 0 ? (
            <div className="relative group">
              {/* Prev Button */}
              <button
                onClick={() => scrollBody("left")}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-white/95 text-gray-800 rounded-full shadow-xl border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600 hover:text-white focus:outline-none hidden md:flex hover:scale-110"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Scroll Container */}
              <motion.div
                ref={bodyScrollRef}
                layout
                className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 pt-1 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <AnimatePresence mode="popLayout">
                  {displayedCars.map((car) => (
                    <motion.div
                      key={car._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="min-w-[260px] sm:min-w-[280px] md:min-w-[295px] max-w-[300px] flex-shrink-0 snap-start h-full"
                    >
                      <CarCard
                        car={car}
                        onWishlist={handleWishlist}
                        isInWishlist={isInWishlist(car._id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Next Button */}
              <button
                onClick={() => scrollBody("right")}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-white/95 text-gray-800 rounded-full shadow-xl border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600 hover:text-white focus:outline-none hidden md:flex hover:scale-110"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car size={26} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No {formatText(activeBodyType)}s Available</h3>
              <p className="text-slate-500 text-xs sm:text-xs max-w-md mx-auto leading-relaxed">We couldn't find any vehicles matching this body type currently in stock. Check back soon or browse our full collection.</p>
            </div>
          )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleViewAll}
            className="px-7 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl tracking-wide transition-all duration-200 shadow-md shadow-purple-500/20 capitalize"
          >
            Explore all {activeBodyType}s
          </motion.button>
        </motion.div>
      </div>

      {/* Visual Separator Transition: Curved Bottom Border into white */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C400,90 800,0 1200,90 L1200,120 L0,120 Z" fill="#FFFFFF"></path>
        </svg>
      </div>
    </section>
  );
}
