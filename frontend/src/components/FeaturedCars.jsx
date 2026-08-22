import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { carsAPI } from "../services/api";
import { useCarsStore } from "../context/store";
import CarCard from "./CarCard";
import SkeletonCarCard from "./SkeletonCarCard";


export default function FeaturedCars() {
  const [activeTab, setActiveTab] = useState("best");
  const [rawCars, setRawCars] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await carsAPI.getNewArrivals();
        if (isMounted) {
          setRawCars(response.data.cars || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching cars:', err);
          setError('Failed to load cars');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCars();
    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  useEffect(() => {
    if (activeTab === "best") {
      const shuffled = [...rawCars];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setCars(shuffled);
    } else {
      setCars(rawCars);
    }
  }, [activeTab, rawCars]);

  const handleWishlist = (car) => {
    if (wishlist.find((w) => w._id === car._id)) {
      removeFromWishlist(car._id);
    } else {
      addToWishlist(car);
    }
  };

  const isInWishlist = (carId) => wishlist.some((w) => w._id === carId);

  return (
    <section className="bg-white py-14 px-6 relative overflow-hidden">
      {/* Premium Blurred Decorative Orbs */}
      <div className="absolute top-24 left-[5%] w-80 h-80 bg-purple-200/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-24 right-[5%] w-96 h-96 bg-indigo-200/15 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <span className="text-xs tracking-[0.18em] uppercase text-purple-600 font-bold mb-1.5 block">
            Curated Showroom
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 leading-tight">
            Featured Inventory
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm font-medium leading-relaxed">
            Experience handpicked masterpieces selected for pure performance and premium quality.
          </p>

          {/* Luxury Tab Switcher */}
          <div className="flex justify-center mt-6 bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-2xl w-fit mx-auto border border-slate-200/60">
            <button
              onClick={() => setActiveTab("best")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === "best"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Best buys for you
            </button>

            <button
              onClick={() => setActiveTab("new")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === "new"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Newly added
            </button>
          </div>
        </motion.div>

        {/* Grid Container */}
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-6 mb-16 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[280px] sm:min-w-[320px] md:min-w-[340px]">
                <SkeletonCarCard />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-4">
            <p className="text-red-500 font-semibold">{error}</p>
            <p className="text-slate-500 text-xs max-w-md px-4">
              The server took too long to respond or there is a temporary connection issue. Please try again.
            </p>
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-purple-700 transition duration-200 shadow-md shadow-purple-500/25 active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-semibold">No vehicles found in this category.</p>
          </div>
        ) : (
          <div className="relative group mb-8">
            {/* Prev Button */}
            <button
              onClick={() => scroll("left")}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white text-gray-800 rounded-full shadow-xl border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 hover:text-purple-600 focus:outline-none hidden md:flex"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Scroll Container */}
            <motion.div
              ref={scrollContainerRef}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 pt-2 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {cars.map((car) => (
                <motion.div
                  key={car._id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { type: "spring", stiffness: 100, damping: 15 },
                    },
                  }}
                  className="min-w-[280px] sm:min-w-[320px] md:min-w-[340px] snap-start transform hover:-translate-y-1 transition-all duration-300"
                >
                  <CarCard
                    car={car}
                    onWishlist={handleWishlist}
                    isInWishlist={isInWishlist(car._id)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Next Button */}
            <button
              onClick={() => scroll("right")}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white text-gray-800 rounded-full shadow-xl border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 hover:text-purple-600 focus:outline-none hidden md:flex"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center"
        >
          <Link
            to="/cars"
            className="inline-flex items-center justify-center px-10 py-4 border border-purple-600 text-purple-600 font-bold text-sm rounded-xl hover:bg-purple-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-purple-100"
          >
            Explore Full Showroom
          </Link>
        </motion.div>

      </div>

      {/* Visual Transition Wave Separator to #F8FAFC */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C300,120 900,0 1200,120 L1200,120 L0,120 Z" fill="#F8FAFC"></path>
        </svg>
      </div>
    </section>
  );
}
