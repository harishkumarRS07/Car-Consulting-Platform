import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { carsAPI } from '../services/api';
import FilterSidebar from '../components/FilterSidebar';
import CarCard from '../components/CarCard';
import { useFilterReducer } from '../hooks/useFilterReducer';
import { useCarsStore } from '../context/store';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function Cars() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCars: 0 });
  const { filters, queryParams, setPage, setBodyType } = useFilterReducer();
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();

  // Scroll to top on component mount and route change
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [searchParams]);

  // Initialize bodyType filter from URL
  useEffect(() => {
    const bodyTypeFromUrl = searchParams.get('bodyType');
    if (bodyTypeFromUrl) {
      setBodyType([bodyTypeFromUrl.toLowerCase()]);
    }
  }, [searchParams, setBodyType]);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const response = await carsAPI.getCars(Object.fromEntries(queryParams));
        setCars(response.data.cars || []);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [queryParams]);

  const handleWishlist = (car) => {
    if (wishlist.find((w) => w._id === car._id)) {
      removeFromWishlist(car._id);
    } else {
      addToWishlist(car);
    }
  };

  const isInWishlist = (carId) => wishlist.some((w) => w._id === carId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7ff] to-white pt-10 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] mb-3">
            Elite Inventory
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Browse Our Collection
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Discover a curated selection of premium vehicles, meticulously inspected to ensure peak performance and uncompromising luxury.
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-1 h-full">
            <div className="sticky top-28">
              <FilterSidebar onFilterChange={() => setPage(1)} />
            </div>
          </aside>

          {/* Cars Grid Area */}
          <main className="lg:col-span-1">
            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100/50 border border-gray-100 rounded-[28px] h-[520px] animate-pulse"
                  />
                ))}
              </div>
            ) : cars.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch mb-12">
                  {cars.map((car, i) => (
                    <motion.div
                      key={car._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CarCard
                        car={car}
                        onWishlist={handleWishlist}
                        isInWishlist={isInWishlist(car._id)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 mt-8"
                  >
                    <button
                      onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
                      disabled={pagination.currentPage === 1}
                      className="p-2 rounded-lg bg-gray-100 border border-gray-200 hover:border-purple-300 disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>

                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          pagination.currentPage === i + 1
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                            : 'bg-white border border-gray-200 hover:border-purple-300 text-gray-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="p-2 rounded-lg bg-gray-100 border border-gray-200 hover:border-purple-300 disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-100 bg-gray-50 min-h-[320px] flex flex-col items-center justify-center p-8 text-center"
              >
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No cars found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms
                </p>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
