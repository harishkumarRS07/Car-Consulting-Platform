import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, Zap, TrendingUp, Grid, Sparkles, Wind, Rocket } from 'lucide-react';
import { carsAPI } from '../services/api';
import { useCarsStore } from '../context/store';
import { formatPriceCompact } from '../utils/priceFormatter';

export default function ExploreByBodyType() {
  const navigate = useNavigate();
  const [activeBodyType, setActiveBodyType] = useState('hatchback');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();

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
      count: 0,
    },
    {
      id: 'sedan',
      label: 'Sedan',
      icon: TrendingUp,
      count: 0,
    },
    {
      id: 'suv',
      label: 'SUV',
      icon: Grid,
      count: 0,
    },
    {
      id: 'muv',
      label: 'MUV',
      icon: Zap,
      count: 0,
    },
    {
      id: 'coupe',
      label: 'Coupe',
      icon: Sparkles,
      count: 0,
    },
    {
      id: 'convertible',
      label: 'Convertible',
      icon: Wind,
      count: 0,
    },
    {
      id: 'sports',
      label: 'Sports',
      icon: Rocket,
      count: 0,
    },
  ];

  // Fetch cars for selected body type
  useEffect(() => {
    const fetchCarsByBodyType = async () => {
      setLoading(true);
      try {
        // Fetch cars - the API should handle bodyType filtering
        const response = await carsAPI.getCars({ limit: 100 });
        const allCars = response.data.cars || [];
        
        // If cars have bodyType, filter them. Otherwise show first 10 cars
        const hasBodyType = allCars.some(car => car.bodyType);
        
        let filteredCars = allCars;
        if (hasBodyType) {
          filteredCars = allCars.filter(car => 
            car.bodyType?.toLowerCase() === activeBodyType.toLowerCase()
          );
        }
        
        setCars(filteredCars);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarsByBodyType();
  }, [activeBodyType]);

  // Get displayed cars - always show 4 if available, fallback to all
  const filteredByType = (cars || []).filter(
    (car) => car?.bodyType?.toLowerCase() === activeBodyType.toLowerCase()
  );
  
  const displayedCars = 
    filteredByType.length >= 4
      ? filteredByType.slice(0, 4)
      : cars.slice(0, 4);

  // Handle wishlist toggle
  const handleWishlist = (car) => {
    if (wishlist.find((w) => w._id === car._id)) {
      removeFromWishlist(car._id);
    } else {
      addToWishlist(car);
    }
  };

  const isInWishlist = (carId) => wishlist.some((w) => w._id === carId);1

  const handleViewAll = () => {
    navigate(`/cars?bodyType=${activeBodyType}`);
  };

  return (
    <section className="bg-gradient-to-b from-white via-gray-50 to-white py-20 px-6">
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-wider uppercase text-purple-600 font-semibold mb-4">
            Smart Discovery
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore by Body Type
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find your perfect car by browsing through our carefully curated collection by body type
          </p>
        </motion.div>

        {/* Body Type Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12 overflow-x-auto md:overflow-visible"
        >
          <div className="flex gap-3 bg-white/40 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-purple-200/50 w-fit">
            {bodyTypes.map((bodyType, idx) => {
              const IconComponent = bodyType.icon;
              return (
                <motion.button
                  key={bodyType.id}
                  onClick={() => setActiveBodyType(bodyType.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 min-w-fit ${
                    activeBodyType === bodyType.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                      : 'text-purple-700 hover:bg-purple-100/50'
                  }`}
                >
                  <IconComponent size={20} />
                  {bodyType.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-200 rounded-xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : displayedCars && displayedCars.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10"
          >
            <AnimatePresence>
              {displayedCars.map((car, idx) => (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative h-40 w-full overflow-hidden bg-gray-200">
                      <motion.img
                        src={car.images?.[0] || 'https://via.placeholder.com/400x300?text=Car'}
                        alt={`${car.brand} ${car.model}`}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                      />
                      {/* Wishlist Button */}
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWishlist(car)}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
                          isInWishlist(car._id)
                            ? 'bg-red-500 text-white'
                            : 'bg-black/30 text-white hover:bg-black/50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={isInWishlist(car._id) ? 'currentColor' : 'none'} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                        {formatText(`${car.brand} ${car.model}`)}
                      </h3>
                      <p className="text-lg font-bold text-purple-600 mb-3">
                        {formatPriceCompact(car.price)}
                      </p>

                      {/* Specs Row */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-3 border-t border-gray-200">
                        <div className="text-center flex-1">
                          <p className="text-gray-400 mb-1">KMS</p>
                          <p className="font-semibold text-gray-900">{(car.kmsDriven / 1000).toFixed(0)}k</p>
                        </div>
                        <div className="text-center flex-1 border-l border-gray-200">
                          <p className="text-gray-400 mb-1">Year</p>
                          <p className="font-semibold text-gray-900">{car.year}</p>
                        </div>
                        <div className="text-center flex-1 border-l border-gray-200">
                          <p className="text-gray-400 mb-1">Type</p>
                          <p className="font-semibold text-gray-900 capitalize">{car.bodyType || 'N/A'}</p>
                        </div>
                      </div>

                      {/* CTA */}
                      <a
                        href={`/cars/${car._id}`}
                        className="w-full mt-3 px-3 py-2 bg-purple-50 text-purple-600 border border-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-100 transition-all duration-300 text-center block hover:scale-105 transform"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-12 mb-10">
            <p className="text-gray-500 font-semibold">No cars available for {activeBodyType}</p>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewAll}
            className="px-8 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all duration-300 capitalize"
          >
            View all {activeBodyType}s
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
