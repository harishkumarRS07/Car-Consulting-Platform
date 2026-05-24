import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Fuel, Zap, Users, Trash2, LogIn, UserPlus } from 'lucide-react';
import { useCarsStore, useAuthStore } from '../context/store';
import { formatPriceCompact } from '../utils/priceFormatter';
import { Link } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useCarsStore();
  const { user } = useAuthStore();
  const [filterBrand, setFilterBrand] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Show authentication gate if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto px-6"
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Heart size={40} className="text-red-600" fill="currentColor" />
              </div>
            </motion.div>

            {/* Content */}
            <h1 className="text-3xl font-black text-gray-900 mb-3">
              Sign in to Your Wishlist
            </h1>
            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              Log in to save your favorite cars and manage your wishlist. Create an account if you're new to Vishnu Car Consulting.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full py-3.5 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
              >
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                Sign In
              </button>
              <button
                onClick={() => setShowSignupModal(true)}
                className="w-full py-3.5 px-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
              >
                <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
                Create Account
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Continue Shopping */}
            <Link
              to="/cars"
              className="inline-block px-6 py-2.5 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              Continue browsing cars →
            </Link>
          </div>
        </motion.div>

        {/* Login Modal */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            window.location.reload();
          }}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />

        {/* Signup Modal */}
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSuccess={() => {
            setShowSignupModal(false);
            window.location.reload();
          }}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      </div>
    );
  }

  // Get unique brands from wishlist
  const brands = useMemo(() => {
    return [...new Set(wishlist.map((car) => car.brand))].sort();
  }, [wishlist]);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let filtered = wishlist;

    if (filterBrand) {
      filtered = filtered.filter((car) => car.brand === filterBrand);
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'year') {
      filtered.sort((a, b) => b.year - a.year);
    }

    return filtered;
  }, [wishlist, filterBrand, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <Heart size={32} className="text-red-600" fill="currentColor" />
            <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <p className="text-gray-600 text-lg">
            {filteredCars.length === 0
              ? 'No cars in your wishlist yet'
              : `${filteredCars.length} car${filteredCars.length !== 1 ? 's' : ''} saved`}
          </p>
        </motion.div>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl border border-gray-200 p-16 text-center"
          >
            <Heart size={64} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring cars and save your favorites to your wishlist. You'll find them all here!
            </p>
            <Link
              to="/cars"
              className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Browse Cars
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Filters & Sort */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6 mb-8"
            >
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Brand
                </label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                >
                  <option value="">All Brands ({wishlist.length})</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand} ({wishlist.filter((car) => car.brand === brand).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="year">Year: Newest First</option>
                </select>
              </div>
            </motion.div>

            {/* Cars Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCars.map((car) => (
                <motion.div
                  key={car._id}
                  variants={itemVariants}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Car Image */}
                  <Link to={`/cars/${car._id}`}>
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={car.images?.[0] || 'https://via.placeholder.com/400x300'}
                        alt={car.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <Heart size={14} fill="currentColor" />
                          Saved
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white font-bold text-lg">{formatPriceCompact(car.price)}</p>
                      </div>
                    </div>
                  </Link>

                  {/* Car Info */}
                  <div className="p-4">
                    <Link to={`/cars/${car._id}`}>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {car.title}
                      </h3>
                    </Link>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-4">
                      <MapPin size={16} className="text-gray-500" />
                      <span>{car.location || 'Location not available'}</span>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Fuel size={16} className="text-purple-600" />
                        <span className="text-xs text-gray-600 capitalize">{car.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-purple-600" />
                        <span className="text-xs text-gray-600 capitalize">{car.transmission}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-purple-600" />
                        <span className="text-xs text-gray-600">{car.seats} Seats</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {(car.kmsDriven / 1000).toFixed(0)}k km
                      </div>
                    </div>

                    {/* Year and Owner */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div>
                        <p className="text-gray-500">Year</p>
                        <p className="font-semibold text-gray-900">{car.year}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Owner</p>
                        <p className="font-semibold text-gray-900">{car.owner}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/cars/${car._id}`}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors duration-300 text-center"
                      >
                        View Details
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeFromWishlist(car._id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
