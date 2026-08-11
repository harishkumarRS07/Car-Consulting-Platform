import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { carsAPI } from '../services/api';
import FilterSidebar from '../components/FilterSidebar';
import CarCard from '../components/CarCard';
import SkeletonCarCard from '../components/SkeletonCarCard';
import EmptyState from '../components/EmptyState';
import { useFilterReducer } from '../hooks/useFilterReducer';
import { useCarsStore } from '../context/store';
import { ChevronLeft, ChevronRight, X, SlidersHorizontal, ChevronUp } from 'lucide-react';
import { showErrorToast } from '../utils/toastNotifications';

export default function Cars() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCars: 0 });
  const [sort, setSort] = useState('newest');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const {
    filters,
    queryParams,
    setSearch,
    setBrand,
    setFuelType,
    setTransmission,
    setPriceRange,
    setYearRange,
    setBodyType,
    setCategory,
    setPage,
    setAllFilters,
    reset,
  } = useFilterReducer();
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();

  // SEO
  useEffect(() => {
    document.title = 'Browse Cars | Vishnu Car Consulting';
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to top on component mount and search
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [searchParams]);

  // Smooth scroll to top on pagination change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pagination.currentPage]);

  // Synchronize URL search parameters to filter reducer state atomically
  useEffect(() => {
    const searchVal = searchParams.get('search') || '';
    const bodyTypeVal = searchParams.get('bodyType');
    const brandVal = searchParams.get('brand');
    const categoryVal = searchParams.get('category');
    const fuelTypeVal = searchParams.get('fuelType');
    const transmissionVal = searchParams.get('transmission');
    const priceMinVal = searchParams.get('priceMin');
    const priceMaxVal = searchParams.get('priceMax');
    const yearMinVal = searchParams.get('yearMin');
    const yearMaxVal = searchParams.get('yearMax');
    const pageVal = searchParams.get('page');

    setAllFilters({
      search: searchVal,
      bodyType: bodyTypeVal ? bodyTypeVal.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean) : [],
      brand: brandVal ? brandVal.split(',').map((s) => s.trim()).filter(Boolean) : [],
      category: categoryVal ? categoryVal.split(',').map((s) => s.trim()).filter(Boolean) : [],
      fuelType: fuelTypeVal ? fuelTypeVal.split(',').map((s) => s.trim()).filter(Boolean) : [],
      transmission: transmissionVal ? transmissionVal.split(',').map((s) => s.trim()).filter(Boolean) : [],
      priceMin: priceMinVal ? parseInt(priceMinVal, 10) : 0,
      priceMax: priceMaxVal ? parseInt(priceMaxVal, 10) : 50000000,
      yearMin: yearMinVal ? parseInt(yearMinVal, 10) : 2000,
      yearMax: yearMaxVal ? parseInt(yearMaxVal, 10) : new Date().getFullYear(),
      page: pageVal ? parseInt(pageVal, 10) : 1,
    });
  }, [searchParams, setAllFilters]);

  useEffect(() => {
    let isMounted = true;
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestParams = { ...Object.fromEntries(queryParams), sort };
        const response = await carsAPI.getCars(requestParams);
        
        if (isMounted) {
          const fetchedCars = response.data.cars || [];
          setCars(fetchedCars);
          setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalCars: fetchedCars.length });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching cars:', error);
          setError(error);
          showErrorToast('Failed to load cars. Please try again.');
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
  }, [queryParams, sort]);

  const handleWishlist = (car) => {
    if (wishlist.find((w) => w._id === car._id)) {
      removeFromWishlist(car._id);
    } else {
      addToWishlist(car);
    }
  };

  const isInWishlist = (carId) => wishlist.some((w) => w._id === carId);

  // Helper to get filter chip label
  const getFilterChipLabel = (filterType, value) => {
    const labels = {
      brand: (v) => v.charAt(0).toUpperCase() + v.slice(1),
      fuelType: (v) => v.charAt(0).toUpperCase() + v.slice(1),
      transmission: (v) => v.charAt(0).toUpperCase() + v.slice(1),
      bodyType: (v) => v.charAt(0).toUpperCase() + v.slice(1),
      category: (v) => v.charAt(0).toUpperCase() + v.slice(1),
    };
    return labels[filterType]?.(value) || value;
  };

  // Remove individual filter chip
  const removeFilterChip = (filterType, value) => {
    const currentFilters = filters[filterType];
    if (!currentFilters) return;
    const updated = currentFilters.filter((item) => item !== value);
    
    if (filterType === 'brand') setBrand(updated);
    else if (filterType === 'fuelType') setFuelType(updated);
    else if (filterType === 'transmission') setTransmission(updated);
    else if (filterType === 'bodyType') setBodyType(updated);
    else if (filterType === 'category') setCategory(updated);
    
    setPage(1);
  };

  // Get all active filters for chips
  const getActiveFilters = () => {
    const active = [];
    if (filters.brand?.length) {
      filters.brand.forEach(b => active.push({ type: 'brand', value: b }));
    }
    if (filters.fuelType?.length) {
      filters.fuelType.forEach(f => active.push({ type: 'fuelType', value: f }));
    }
    if (filters.transmission?.length) {
      filters.transmission.forEach(t => active.push({ type: 'transmission', value: t }));
    }
    if (filters.bodyType?.length) {
      filters.bodyType.forEach(b => active.push({ type: 'bodyType', value: b }));
    }
    if (filters.category?.length) {
      filters.category.forEach(c => active.push({ type: 'category', value: c }));
    }
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7ff] to-white pt-4 sm:pt-6 pb-20 overflow-x-hidden">
      <div className="max-w-[1600px] w-[95%] mx-auto px-2 sm:px-6">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 text-center"
        >
          <p className="text-[10px] sm:text-xs font-extrabold text-purple-600 uppercase tracking-[0.2em] mb-1 sm:mb-2">
            Elite Inventory
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2 sm:mb-3">
            Browse Our Collection
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-[10px] sm:text-xs md:text-sm font-semibold leading-relaxed px-2">
            Discover a curated selection of premium vehicles, meticulously inspected to ensure peak performance and uncompromising luxury.
          </p>
        </motion.div>

        {/* Mobile Sticky Control Bar (Sticky when scrolling) */}
        <div className="sticky top-16 sm:top-20 z-30 bg-[#faf7ff]/95 backdrop-blur-md py-3 px-3 border-b border-purple-100 flex items-center justify-between gap-4 lg:hidden rounded-2xl shadow-sm mb-4">
          <div className="text-xs font-bold text-gray-900">
            {pagination.totalCars} Vehicles
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="pricelow">Price Low to High</option>
              <option value="pricehigh">Price High to Low</option>
              <option value="year">Year Newest</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-[11px] font-bold rounded-lg shadow-sm active:scale-95 transition-all select-none"
            >
              <SlidersHorizontal size={12} />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 bg-white text-purple-700 rounded-full flex items-center justify-center text-[9px] font-black">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          
          {/* Desktop Permanent Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 h-full sticky top-24">
            <FilterSidebar
              filters={filters}
              setSearch={setSearch}
              setBrand={setBrand}
              setFuelType={setFuelType}
              setTransmission={setTransmission}
              setPriceRange={setPriceRange}
              setYearRange={setYearRange}
              setBodyType={setBodyType}
              setCategory={setCategory}
              reset={reset}
              onFilterChange={() => setPage(1)}
            />
          </aside>

          {/* Cars Grid Area */}
          <main className="lg:col-span-1 min-w-0">
            {/* Results Count & Sort Section (Desktop Only) */}
            {!loading && cars.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden lg:flex items-center justify-between gap-4 mb-5 pb-3 border-b border-gray-100"
              >
                <div>
                  <h2 className="text-sm md:text-base font-bold text-gray-900 tracking-tight flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {filters.search ? (
                      <span className="text-purple-600">
                        Showing {pagination.totalCars} results for "{filters.search}"
                      </span>
                    ) : filters.bodyType?.length > 0 ? (
                      <span className="text-purple-600 uppercase tracking-tight font-extrabold">
                        Showing {pagination.totalCars} {filters.bodyType.map(b => b.toUpperCase()).join(', ')} cars
                      </span>
                    ) : (
                      <>
                        Used Cars
                        <span className="text-[11px] md:text-xs font-medium text-gray-400">
                          ({pagination.totalCars} Vehicles &bull; Page {pagination.currentPage} of {pagination.totalPages})
                        </span>
                      </>
                    )}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Sort By:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:border-purple-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 transition-all cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="pricelow">Price Low to High</option>
                    <option value="pricehigh">Price High to Low</option>
                    <option value="year">Year Newest</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-1.5 mb-5 pb-3 border-b border-gray-105"
              >
                {activeFilters.map((filter, idx) => (
                  <motion.div
                    key={`${filter.type}-${filter.value}-${idx}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[10px] sm:text-xs font-semibold text-purple-700"
                  >
                    <span>{getFilterChipLabel(filter.type, filter.value)}</span>
                    <button
                      onClick={() => removeFilterChip(filter.type, filter.value)}
                      className="ml-0.5 hover:text-purple-900 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </motion.div>
                ))}
                <button
                  onClick={() => reset()}
                  className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-gray-500 hover:text-gray-905 hover:bg-gray-100 transition-colors"
                >
                  Clear All
                </button>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8"
              >
                <p className="text-red-800 font-semibold mb-3">Failed to load cars</p>
                <button
                  onClick={() => {
                    setError(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCarCard key={i} />
                ))}
              </div>
            ) : cars.length > 0 ? (
              <>
                {/* Responsive Car Listing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-stretch mb-12">
                  {cars.map((car, i) => (
                    <motion.div
                      key={car._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
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
                    className="flex items-center justify-center gap-1 mt-8"
                  >
                    <button
                      onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
                      disabled={pagination.currentPage === 1}
                      className="p-2 rounded-lg bg-gray-55 border border-gray-200 hover:border-purple-300 disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft size={16} className="text-gray-600" />
                    </button>

                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-lg font-bold transition-all text-xs ${
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
                      className="p-2 rounded-lg bg-gray-55 border border-gray-200 hover:border-purple-300 disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight size={16} className="text-gray-600" />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <EmptyState 
                title={
                  filters.search 
                    ? "No matching vehicles found" 
                    : filters.bodyType?.length > 0 
                      ? `No ${filters.bodyType.map(b => b.toUpperCase()).join(', ')} cars found` 
                      : "No vehicles match your criteria"
                }
                message={
                  filters.search 
                    ? `We couldn't find any cars matching "${filters.search}". Try refining your search query or clearing the filters.` 
                    : filters.bodyType?.length > 0
                      ? `We couldn't find any ${filters.bodyType.map(b => b.toUpperCase()).join(', ')} cars. Try clearing the filters.`
                      : "Try adjusting your search filters to find what you're looking for."
                }
                onClearFilters={() => reset()}
                icon="search"
              />
            )}
          </main>
        </div>
      </div>

      {/* Slide-over Filter Drawer for Mobile & Tablet */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0.05, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white z-50 shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
                <span className="font-extrabold text-sm uppercase tracking-wider">Filters</span>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-4">
                <FilterSidebar
                  filters={filters}
                  setSearch={setSearch}
                  setBrand={setBrand}
                  setFuelType={setFuelType}
                  setTransmission={setTransmission}
                  setPriceRange={setPriceRange}
                  setYearRange={setYearRange}
                  setBodyType={setBodyType}
                  setCategory={setCategory}
                  reset={reset}
                  onFilterChange={() => setPage(1)}
                  hideHeader={true}
                />
              </div>
              <div className="p-4 border-t border-gray-150 bg-gray-50 flex gap-3">
                <button
                  onClick={() => {
                    reset();
                    setIsFilterDrawerOpen(false);
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl active:scale-95 transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 bg-purple-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-purple-500/10"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Back to Top Button (Positioned safely above sticky bottom navigation) */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-4 sm:right-6 p-3 sm:p-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg z-40 transition-all active:scale-95 flex items-center justify-center"
            aria-label="Back to top"
          >
            <ChevronUp size={20} className="stroke-[2.5px]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
