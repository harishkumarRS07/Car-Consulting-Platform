import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Hero() {
  const images = [
    '/hero1.png',
    '/hero2.png',
    '/hero3.png',
  ];

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
    <div className="relative w-full h-[85vh] overflow-hidden">
      {/* Background Image with transition */}
      <div className="absolute inset-0">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Hero slide ${idx + 1}`}
            className={`absolute w-full h-full object-cover transition-all duration-1000 transform scale-105 ${
              idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
          />
        ))}
      </div>

      {/* Modern Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/40 to-transparent z-10"
      ></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-6 md:px-20 lg:px-32 z-20">
        <div className="max-w-2xl text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              DRIVE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">ELITE</span>
            </h1>

            <p className="mt-8 text-xl md:text-2xl text-gray-200 font-medium max-w-lg leading-relaxed">
              India's premier destination for certified luxury and performance vehicles.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              <Link
                to="/cars"
                className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 px-10 py-4 rounded-2xl text-white font-black text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(147,51,234,0.4)]"
              >
                Browse Inventory
              </Link>
              <Link
                to="/sell"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 px-10 py-4 rounded-2xl text-white font-black text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-xl"
              >
                Sell Your Car
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all duration-300 z-20 group"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all duration-300 z-20 group"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Reduced Blend Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-24 z-20" style={{
        background: 'linear-gradient(to top, rgba(255,255,255,0.3), transparent)'
      }}></div>
    </div>
  );
}
