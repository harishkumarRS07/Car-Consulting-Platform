import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { carsAPI } from '../services/api';
import CarCard from '../components/CarCard';
import Hero from '../components/Hero';
import FeaturedCars from '../components/FeaturedCars';
import ExploreByBodyType from '../components/ExploreByBodyType';
import { useCarsStore } from '../context/store';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();

  // Smooth scroll reset on page initialization
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, []);

  // API parallelized data retrieval
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newArrivalsRes] = await Promise.all([
          carsAPI.getFeaturedCars(),
          carsAPI.getNewArrivals()
        ]);
        setFeaturedCars(featuredRes.data.cars || []);
        setNewArrivals(newArrivalsRes.data.cars || []);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWishlist = (car) => {
    if (wishlist.find((w) => w._id === car._id)) {
      removeFromWishlist(car._id);
    } else {
      addToWishlist(car);
    }
  };

  const isInWishlist = (carId) => wishlist.some((w) => w._id === carId);

  return (
    <div className="min-h-screen bg-white antialiased selection:bg-purple-100">
      {/* Hero Header Component */}
      <Hero />

      {/* Featured Inventory Showcase */}
      <FeaturedCars cars={featuredCars} />

      {/* Body Style Navigation Matrix */}
      <ExploreByBodyType />

      {/* New Arrivals Grid Section */}
      <section className="bg-white py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-12 max-w-2xl"
          >
            <p className="text-xs font-bold tracking-widest uppercase text-purple-600 mb-3">
              Explore Inventory
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-none">
              New Arrivals
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed font-normal">
              Our latest certified precision-engineered vehicles, rigorously inspected by master technicians.
            </p>
          </motion.div>

          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-gray-100 rounded-3xl h-[350px] animate-pulse" 
                />
              ))
            ) : (
              newArrivals.map((car, i) => (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
                >
                  <CarCard
                    car={car}
                    onWishlist={handleWishlist}
                    isInWishlist={isInWishlist(car._id)}
                  />
                </motion.div>
              ))
            )}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-800 transition-colors duration-300 active:scale-95"
            >
              <span>View All Cars</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
