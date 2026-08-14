import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { carsAPI } from '../services/api';
import { MapPin, Fuel, Zap, Users, Heart, CheckCircle, X, ChevronLeft, ChevronRight, Home, ChevronDown, MessageCircle, Phone } from 'lucide-react';
import { useCarsStore, useAuthStore } from '../context/store';
import CarCard from '../components/CarCard';
import SkeletonCarDetails from '../components/SkeletonCarDetails';
import { formatPriceCompact } from '../utils/priceFormatter';
import { showErrorToast } from '../utils/toastNotifications';

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [similarCars, setSimilarCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();
  const { user } = useAuthStore();

  // Mobile Accordion Sections
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    features: false,
    about: false,
    specs: false,
  });

  // Swipe gesture variables
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
        if (error.response && error.response.status === 404) {
          navigate('/404');
        } else {
          showErrorToast('Failed to load car details. Please try again.');
          setCar(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <SkeletonCarDetails />
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Vehicle Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The vehicle you're looking for doesn't exist or has been removed.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
          >
            <Home size={20} />
            Go Back
          </motion.button>
        </motion.div>
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
  const whatsappLink = `https://wa.me/918072028295?text=${encodeURIComponent(whatsappMessage)}`;

  // Mobile Gallery Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!car.images || car.images.length <= 1) return;
    const offset = touchStart - touchEnd;
    const currentIndex = car.images.indexOf(displayImage);

    if (offset > 50) {
      // swipe left -> next image
      const nextIndex = currentIndex < car.images.length - 1 ? currentIndex + 1 : 0;
      setMainImage(car.images[nextIndex]);
    } else if (offset < -50) {
      // swipe right -> prev image
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : car.images.length - 1;
      setMainImage(car.images[prevIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] pb-24 lg:pb-16 overflow-x-hidden">
      <div className="max-w-[1450px] w-[95%] mx-auto px-2 sm:px-4 md:px-10 py-4 sm:py-6">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 space-y-2 px-1"
        >
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-gray-400 select-none">
            <a href="/" className="hover:text-purple-600 transition-colors">Home</a>
            <span>/</span>
            <a href="/cars" className="hover:text-purple-600 transition-colors">Used Cars</a>
            <span>/</span>
            <span className="capitalize">{car.brand}</span>
            <span>/</span>
            <span className="text-gray-600 capitalize">{car.model}</span>
          </div>

          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[34px] xl:text-[38px] font-black text-gray-950 tracking-tight leading-tight mb-1 select-none">
              {car.title}
            </h1>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
              <MapPin size={12} className="text-purple-600 flex-shrink-0" />
              <span>{car.location}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[68%_32%] gap-6 mb-12 items-start">

          {/* Left Column: Image Gallery + Modular Info Cards */}
          <div className="space-y-5 sm:space-y-6">

            {/* Gallery Wrapper */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-full h-[220px] sm:h-[320px] md:h-[360px] lg:h-[380px] rounded-[20px] overflow-hidden border border-gray-150 shadow-[0_4px_24px_rgba(0,0,0,0.01)] bg-white group select-none cursor-pointer"
            >
              <img
                src={displayImage}
                alt={car.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                onClick={() => {
                  const idx = car.images.indexOf(displayImage);
                  setCurrentImageIndex(idx >= 0 ? idx : 0);
                  setShowAllImages(true);
                }}
              />

              {/* Floating Nav Arrows (Hidden on Mobile) */}
              {car.images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = car.images.indexOf(displayImage);
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : car.images.length - 1;
                      setMainImage(car.images[prevIndex]);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-gray-900 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hidden md:flex"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = car.images.indexOf(displayImage);
                      const nextIndex = currentIndex < car.images.length - 1 ? currentIndex + 1 : 0;
                      setMainImage(car.images[nextIndex]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-gray-900 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hidden md:flex"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>

                  {/* Mobile Slide Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 md:hidden bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    {car.images.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${car.images.indexOf(displayImage) === i ? 'bg-white w-3' : 'bg-white/40'
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery (Directly Beneath Main Image) */}
            {car.images?.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 select-none scrollbar-thin">
                {car.images.slice(0, 10).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-[80px] sm:w-[110px] md:w-[120px] h-[60px] sm:h-[80px] rounded-xl overflow-hidden border-2 transition-all ${displayImage === img
                      ? 'border-purple-650 shadow-[0_0_10px_rgba(124,58,237,0.15)]'
                      : 'border-gray-200 hover:border-purple-300'
                      }`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {car.images.length > 10 && (
                  <button
                    onClick={() => {
                      setShowAllImages(true);
                      setCurrentImageIndex(10);
                    }}
                    className="flex-shrink-0 w-[80px] sm:w-[110px] h-[60px] sm:h-[80px] bg-gray-100 border-2 border-gray-300 rounded-xl flex items-center justify-center font-bold text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    +{car.images.length - 10} More
                  </button>
                )}
              </div>
            )}

            {/* Modular Card 1: Car Overview */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[18px] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-gray-100"
            >
              {/* Header - Clickable on mobile */}
              <button
                onClick={() => toggleSection('overview')}
                className="w-full text-left flex justify-between items-center select-none"
              >
                <h3 className="text-base sm:text-lg font-black text-gray-950 flex items-center gap-2">
                  <CheckCircle size={18} className="text-purple-600" />
                  Car Overview
                </h3>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 sm:hidden transform transition-transform duration-300 ${expandedSections.overview ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Body */}
              <div className={`mt-5 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 ${expandedSections.overview ? 'grid' : 'hidden sm:grid'}`}>
                {[
                  { label: 'Fuel Type', value: car.fuelType, icon: Fuel },
                  { label: 'Transmission', value: car.transmission, icon: Zap },
                  { label: 'Seats', value: car.seats ? `${car.seats} Seats` : 'N/A', icon: Users },
                  { label: 'RTO Registration', value: car.rto || 'N/A', icon: MapPin },
                  { label: 'Exterior Color', value: car.color || 'N/A', icon: Zap },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 capitalize">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Modular Card 2: Features & Safety */}
            {car.features?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[18px] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-gray-100"
              >
                {/* Header */}
                <button
                  onClick={() => toggleSection('features')}
                  className="w-full text-left flex justify-between items-center select-none"
                >
                  <h3 className="text-base sm:text-lg font-black text-gray-955 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    Features & Safety
                  </h3>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 sm:hidden transform transition-transform duration-300 ${expandedSections.features ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Body */}
                <div className={`mt-5 grid grid-cols-2 md:grid-cols-3 gap-y-3.5 gap-x-4 ${expandedSections.features ? 'grid' : 'hidden sm:grid'}`}>
                  {car.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4.5 h-4.5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={12} className="text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 capitalize truncate">{feature.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Modular Card 3: About This Car */}
            {car.description && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[18px] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-gray-100"
              >
                {/* Header */}
                <button
                  onClick={() => toggleSection('about')}
                  className="w-full text-left flex justify-between items-center select-none"
                >
                  <h3 className="text-base sm:text-lg font-black text-gray-955">About This Vehicle</h3>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 sm:hidden transform transition-transform duration-300 ${expandedSections.about ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Body */}
                <div className={`mt-4 ${expandedSections.about ? 'block' : 'hidden sm:block'}`}>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm font-medium">{car.description}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <div className="space-y-6 h-fit lg:sticky lg:top-24">
            {/* Price & Summary Card (Hidden on mobile sticky footer) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-[18px] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]"
            >
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Price</span>
                <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-black text-purple-650 mt-1 select-none leading-none">
                  {formatPriceCompact(car.price)}
                </h2>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Ex-showroom price (inclusive of all taxes)</p>
              </div>

              {/* Specification Specs List */}
              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-500 font-semibold">Kilometers driven</span>
                  <span className="font-bold text-gray-900">{car.kmsDriven}km</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-500 font-semibold">Registration Year</span>
                  <span className="font-bold text-gray-900">{car.year}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-500 font-semibold">Fuel Type</span>
                  <span className="font-bold text-gray-900 capitalize">{car.fuelType}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-500 font-semibold">Transmission</span>
                  <span className="font-bold text-gray-900 capitalize">{car.transmission}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-gray-500 font-semibold">Number of Owners</span>
                  <span className="font-bold text-gray-900">{car.owner}</span>
                </div>
              </div>

              {/* Action Buttons (Desktop layout trigger) */}
              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 duration-200 text-xs sm:text-sm"
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp</span>
                </a>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleWishlist}
                  className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all text-xs sm:text-sm ${isInWishlist
                    ? 'bg-red-50 text-red-650 border-red-300 hover:bg-red-100/50'
                    : 'bg-white text-purple-750 border-purple-200 hover:bg-purple-50/50'
                    }`}
                >
                  <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
                  {isInWishlist ? 'Saved to Favorites' : 'Save to Favorites'}
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-[10px] text-gray-500 font-bold select-none">
                <div className="flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                  <span>Verified Vehicle</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                  <span>Transparent Pricing</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                  <span>Ownership Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
                  <span>Roadside Assist</span>
                </div>
              </div>
            </motion.div>

            {/* Additional Specifications Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-[18px] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]"
            >
              {/* Header */}
              <button
                onClick={() => toggleSection('specs')}
                className="w-full text-left flex justify-between items-center select-none"
              >
                <h3 className="text-sm sm:text-base font-bold text-gray-95 mb-0 sm:mb-4 pb-0 sm:pb-2 border-b border-gray-100 flex-grow text-left">Additional Specifications</h3>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 sm:hidden transform transition-transform duration-300 ${expandedSections.specs ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Body */}
              <div className={`space-y-3.5 mt-3 sm:mt-0 ${expandedSections.specs ? 'block' : 'hidden sm:block'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">{car.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Availability</span>
                  <span className={`text-xs sm:text-sm font-bold ${car.availability === 'in-stock' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {car.availability === 'in-stock' ? '✓ In Stock' : car.availability}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">RTO Location</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 uppercase">{car.rto || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Exterior Color</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">{car.color || 'N/A'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Similar Cars Section */}
        {similarCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <h3 className="text-lg md:text-2xl font-bold text-gray-950 mb-6 border-b border-gray-100 pb-3">Similar Vehicles</h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
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

        {/* Sticky Bottom Actions Bar (Mobile & Tablet Only) */}
        <div className="fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100 flex items-center justify-between p-3 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden pb-safe-bottom">
          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Price</span>
            <p className="text-base font-extrabold text-purple-700 leading-tight">
              {formatPriceCompact(car.price)}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {/* Call Support */}
            <a
              href="tel:+918072028295"
              className="p-2.5 rounded-xl border border-gray-250 bg-gray-50 text-gray-600 flex items-center justify-center active:scale-95 transition-all"
              aria-label="Call Support"
            >
              <Phone size={16} />
            </a>

            {/* WhatsApp enquiry */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <MessageCircle size={14} />
              <span>Enquire Now</span>
            </a>

            {/* Save Favorities */}
            <button
              onClick={handleWishlist}
              className={`p-2.5 rounded-xl border transition-all ${isInWishlist ? 'bg-red-50 text-red-650 border-red-200' : 'bg-gray-55 text-gray-400 border-gray-200'
                }`}
              aria-label="Save to wishlist"
            >
              <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Fullscreen Image Gallery Lightbox Modal */}
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
                  className="relative max-w-4xl w-full mx-auto p-4"
                >
                  <img
                    src={car.images[currentImageIndex]}
                    alt={`${car.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-[70vh] object-contain rounded-[20px]"
                  />

                  {/* Image Counter */}
                  <div className="absolute top-8 left-8 bg-black/60 px-4 py-2 rounded-full text-white font-bold text-xs">
                    {currentImageIndex + 1} / {car.images.length}
                  </div>
                </motion.div>

                {/* Left Arrow */}
                {currentImageIndex > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
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
                    className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                  >
                    <ChevronRight size={32} />
                  </motion.button>
                )}

                {/* Bottom Thumbnail Strip */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-thin">
                    {car.images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${idx === currentImageIndex
                          ? 'border-purple-500 shadow-lg shadow-purple-500/50'
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
                className="bg-white rounded-[18px] shadow-2xl p-8 max-w-md w-full border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-955">Save to Wishlist</h2>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-650 text-sm font-medium mb-4">
                    Please log in to save this car to your wishlist. You can compare cars, save your favorites, and track them easily!
                  </p>
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                    <Heart size={22} className="text-purple-600" fill="currentColor" />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false);
                      window.dispatchEvent(new CustomEvent('openLoginModal'));
                    }}
                    className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-300 text-sm flex items-center justify-center shadow-md shadow-purple-600/10"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginPrompt(false);
                      window.dispatchEvent(new CustomEvent('openSignupModal'));
                    }}
                    className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-all duration-300 text-sm flex items-center justify-center"
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
