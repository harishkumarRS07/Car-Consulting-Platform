import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { carsAPI } from '../services/api';
import { MapPin, Fuel, Zap, Users, Heart, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCarsStore, useAuthStore } from '../context/store';
import CarCard from '../components/CarCard';
import { formatPriceCompact } from '../utils/priceFormatter';

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [similarCars, setSimilarCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();
  const { user } = useAuthStore();

  // Scroll to top on component mount and car ID change
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [id]);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await carsAPI.getCarById(id);
        setCar(response.data.car);
        setSimilarCars(response.data.similar || []);
        // Set main image to first image or placeholder
        if (response.data.car?.images?.length > 0) {
          setMainImage(response.data.car.images[0]);
        }
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="card h-96 skeleton mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card h-80 skeleton" />
            <div className="card h-80 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Car not found</h1>
          <p className="text-gray-600">The car you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  const isInWishlist = wishlist.some((w) => w._id === car._id);
  const displayImage = mainImage || car.images?.[0] || 'https://via.placeholder.com/600x400';

  const handleWishlist = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (isInWishlist) {
      removeFromWishlist(car._id);
    } else {
      addToWishlist(car);
    }
  };

  const whatsappMessage = `Hi, I'm interested in ${car.title}. Can you please provide more details?`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const highlightedFeatures = [
    { label: 'Price', value: formatPriceCompact(car.price), icon: '💰' },
    { label: 'KMs Driven', value: `${(car.kmsDriven / 1000).toFixed(0)}k`, icon: '📏' },
    { label: 'Year', value: car.year, icon: '📅' },
    { label: 'Owner', value: car.owner, icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{car.title}</h1>
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-500" />
              <span className="font-medium">{car.location}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left: Image Gallery + Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            
            {/* Main Image */}
            <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white">
              <img
                src={displayImage}
                alt={car.title}
                className="w-full h-[450px] object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {car.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 bg-white rounded-lg p-3 border border-gray-200 mb-6">
                {car.images.slice(0, 6).map((img, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img
                        ? 'border-purple-600 shadow-md'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
                {car.images.length > 6 && (
                  <button
                    onClick={() => {
                      setShowAllImages(true);
                      setCurrentImageIndex(6);
                    }}
                    className="flex-shrink-0 w-24 h-24 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    +{car.images.length - 6}
                  </button>
                )}
              </div>
            )}

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Fuel Type', value: car.fuelType, icon: Fuel },
                { label: 'Transmission', value: car.transmission, icon: Zap },
                { label: 'Body Type', value: car.bodyType, icon: Users },
                { label: 'Seats', value: car.seats, icon: Users },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <item.icon size={22} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1 capitalize">{item.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Features Section */}
            {car.features?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <CheckCircle size={22} className="text-green-600" />
                  Features & Safety
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {car.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700 capitalize">{feature.replace('-', ' ')}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* About Section */}
            {car.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">About This Car</h3>
                <p className="text-gray-700 leading-relaxed text-base">{car.description}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Price Panel - Sticky */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-md mb-6"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Price</span>
              <h2 className="text-4xl font-bold text-purple-600 mt-2 mb-6">{formatPriceCompact(car.price)}</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Kilometers driven</span>
                  <span className="font-semibold text-gray-900">{(car.kmsDriven / 1000).toFixed(0)}k km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Year of registration</span>
                  <span className="font-semibold text-gray-900">{car.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Number of owners</span>
                  <span className="font-semibold text-gray-900">{car.owner}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.149c-1.488.789-2.783 1.91-3.656 3.218C2.867 11.34 2.4 12.924 2.4 14.595c0 1.671.467 3.255 1.354 4.643l1.524 2.529c.41.68 1.304 1.077 2.138 1.077h.006c.734 0 1.41-.294 1.914-.823l1.289-1.293c.411-.412.856-.659 1.289-.659.433 0 .878.247 1.289.659l1.289 1.293c.504.529 1.18.823 1.914.823h.006c.834 0 1.728-.397 2.138-1.077l1.524-2.529c.887-1.388 1.354-2.972 1.354-4.643 0-1.671-.467-3.255-1.354-4.643-1.873-3.108-5.141-5.587-8.975-5.587z" />
                  </svg>
                  Chat on WhatsApp
                </a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWishlist}
                  disabled={!user}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border-2 transition-all ${
                    !user
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : isInWishlist
                      ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                  {!user ? 'Login to Save' : isInWishlist ? 'Saved' : 'Save to Wishlist'}
                </motion.button>
              </div>
            </motion.div>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-5">Car Details</h3>
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Category</p>
                  <p className="text-gray-900 font-semibold mt-1 capitalize">{car.category}</p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Availability</p>
                  <p className={`font-semibold mt-1 ${car.availability === 'in-stock' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {car.availability === 'in-stock' ? '✓ In Stock' : car.availability}
                  </p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">RTO</p>
                  <p className="text-gray-900 font-semibold mt-1">{car.rto || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Color</p>
                  <p className="text-gray-900 font-semibold mt-1 capitalize">{car.color || 'N/A'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Similar Cars Section */}
        {similarCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Similar Cars</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {similarCars.map((similarCar) => (
                <CarCard
                  key={similarCar._id}
                  car={similarCar}
                  onWishlist={() => {
                    if (wishlist.find((w) => w._id === similarCar._id)) {
                      removeFromWishlist(similarCar._id);
                    } else {
                      addToWishlist(similarCar);
                    }
                  }}
                  isInWishlist={wishlist.some((w) => w._id === similarCar._id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Fullscreen Image Gallery Modal */}
        <AnimatePresence>
          {showAllImages && car?.images && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setShowAllImages(false)}
            >
              <div
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAllImages(false)}
                  className="absolute top-6 right-6 z-10 p-3 rounded-full bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                >
                  <X size={24} />
                </motion.button>

                {/* Main Image Display */}
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative max-w-4xl w-full mx-auto"
                >
                  <img
                    src={car.images[currentImageIndex]}
                    alt={`${car.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-[70vh] object-contain"
                  />
                  
                  {/* Image Counter */}
                  <div className="absolute top-4 left-4 bg-black/60 px-4 py-2 rounded-lg text-white font-semibold">
                    {currentImageIndex + 1} / {car.images.length}
                  </div>
                </motion.div>

                {/* Left Arrow */}
                {currentImageIndex > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-6 p-3 rounded-full bg-indigo-500/80 hover:bg-indigo-600 text-white transition-colors z-10"
                  >
                    <ChevronLeft size={32} />
                  </motion.button>
                )}

                {/* Right Arrow */}
                {currentImageIndex < car.images.length - 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="absolute right-6 p-3 rounded-full bg-indigo-500/80 hover:bg-indigo-600 text-white transition-colors z-10"
                  >
                    <ChevronRight size={32} />
                  </motion.button>
                )}

                {/* Bottom Thumbnail Strip */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                    {car.images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex
                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/50'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Prompt Modal */}
        <AnimatePresence>
          {showLoginPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowLoginPrompt(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Save to Wishlist</h2>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="mb-8">
                  <p className="text-gray-600 mb-4">
                    Please log in to save this car to your wishlist. You can compare cars, save your favorites, and track them easily!
                  </p>
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                    <Heart size={24} className="text-purple-600" fill="currentColor" />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false);
                      // Trigger login modal in parent
                      window.dispatchEvent(new CustomEvent('openLoginModal'));
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false);
                      // Trigger signup modal in parent
                      window.dispatchEvent(new CustomEvent('openSignupModal'));
                    }}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors duration-300"
                  >
                    Create Account
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
