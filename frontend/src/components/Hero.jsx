import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const images = [
  '/hero1.png',
  '/hero2.png',
  '/hero3.png',
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[85vh] xl:h-[90vh] overflow-hidden">
      {/* Background Image with transition */}
      <div className="absolute inset-0 z-0">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Hero slide ${idx + 1}`}
            className={`absolute w-full h-full object-cover transition-all duration-1000 transform scale-105 ${idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
          />
        ))}
      </div>

      {/* Modern Deep Dark Overlay (#0F172A) */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/50 to-[#0F172A]/95 z-10"
      ></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-4 sm:px-12 md:px-20 lg:px-32 z-20">
        <div className="max-w-3xl w-full text-center lg:text-left mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center lg:items-start"
          >
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-purple-400 mb-3 sm:mb-4 block">
              Purity • Performance • Luxury
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.0] sm:leading-[0.9] text-white">
              DRIVE THE <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400">
                ELITE
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-300 font-normal max-w-md md:max-w-lg leading-relaxed">
              India's premier destination for certified luxury and performance vehicles. Curated by experts, tailored for your desires.
            </p>

            {/* Quick Action CTAs */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full sm:w-auto">
              <Link
                to="/cars"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-purple-600/30 text-center hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Browse Collection
              </Link>
              <Link
                to="/sell"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white/10 text-white text-xs sm:text-sm font-bold border border-white/20 rounded-xl text-center hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Sell Your Car
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Left Arrow (Hidden on Mobile) */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/15 border border-white/10 p-3 rounded-full transition-all duration-300 z-20 group hidden md:block"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Right Arrow (Hidden on Mobile) */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/15 border border-white/10 p-3 rounded-full transition-all duration-300 z-20 group hidden md:block"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
              ? 'bg-purple-500 w-6 sm:w-8'
              : 'bg-white/30 hover:bg-white/60 w-1.5'
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Subtle Bottom Transition */}
      <div className="absolute bottom-0 left-0 w-full h-12 z-20 pointer-events-none bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}
