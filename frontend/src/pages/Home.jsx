import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FileCheck, Key } from "lucide-react";
import { ArrowRight, ShieldCheck, Award, Zap, Star, PhoneCall, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { carsAPI, testimonialsAPI } from '../services/api';
import CarCard from '../components/CarCard';
import Hero from '../components/Hero';
import FeaturedCars from '../components/FeaturedCars';
import ExploreByBodyType from '../components/ExploreByBodyType';
import SkeletonCarCard from '../components/SkeletonCarCard';
import SkeletonTestimonials from '../components/SkeletonTestimonials';
import { useCarsStore } from '../context/store';
import { showErrorToast } from '../utils/toastNotifications';

// Simple Counter utility for Statistics Section
function Counter({ value, duration = 2 }) {
  const [count, setCount] = useState(0);

  const isFloat = value.includes('.');
  const numericPart = value.match(/[\d.]+/);
  const end = numericPart ? parseFloat(numericPart[0]) : 0;

  useEffect(() => {
    let start = 0;
    if (isNaN(end) || start === end) {
      setCount(value);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const incrementTime = 20; // 50fps smooth updates
    const totalSteps = totalMiliseconds / incrementTime;
    const step = end / totalSteps;

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration, end]);

  const suffix = value.replace(/[\d.]/g, '');
  const displayCount = isFloat ? count.toFixed(1) : Math.round(count);

  return <span>{displayCount}{suffix}</span>;
}

function AnimatedCounter({ value }) {
  const [triggered, setTriggered] = useState(false);
  return (
    <motion.span
      onViewportEnter={() => setTriggered(true)}
      viewport={{ once: true, margin: "-50px" }}
    >
      {triggered ? <Counter value={value} /> : '0'}
    </motion.span>
  );
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const { addToWishlist, removeFromWishlist, wishlist } = useCarsStore();

  const arrivalsScrollRef = useRef(null);

  const scrollArrivals = (direction) => {
    const container = arrivalsScrollRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Testimonials state and responsive layout
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);

  const testimonialsScrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  const handleTestimonialsScroll = () => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      const container = testimonialsScrollRef.current;
      if (container) {
        const cardWidth = container.clientWidth / visibleCards;
        if (cardWidth > 0) {
          const scrollLeft = container.scrollLeft;
          const index = Math.round(scrollLeft / cardWidth);
          if (index >= 0 && index <= testimonials.length - visibleCards) {
            setTestimonialIndex(index);
          }
        }
      }
    }, 100);
  };

  const scrollToTestimonialIndex = (index) => {
    const container = testimonialsScrollRef.current;
    if (container) {
      const cardWidth = container.clientWidth / visibleCards;
      container.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setTestimonialIndex(index);
    }
  };

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Responsive logic for visible cards
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCards(4);
      } else if (window.innerWidth >= 768) {
        setVisibleCards(2);
      } else {
        setVisibleCards(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto scroll testimonials
  useEffect(() => {
    if (testimonials.length <= visibleCards) return;
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => {
        const nextIndex = prev + 1;
        const targetIndex = nextIndex <= testimonials.length - visibleCards ? nextIndex : 0;
        const container = testimonialsScrollRef.current;
        if (container) {
          const cardWidth = container.clientWidth / visibleCards;
          container.scrollTo({
            left: targetIndex * cardWidth,
            behavior: 'smooth'
          });
        }
        return targetIndex;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length, visibleCards]);

  // Smooth scroll reset on page initialization
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, []);

  // Fetch New Arrivals independently
  useEffect(() => {
    let isMounted = true;
    const fetchNewArrivals = async () => {
      try {
        const res = await carsAPI.getNewArrivals();
        if (isMounted) {
          setNewArrivals(res.data.cars || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching new arrivals:', error);
        }
      } finally {
        if (isMounted) {
          setNewArrivalsLoading(false);
        }
      }
    };

    fetchNewArrivals();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Testimonials independently
  useEffect(() => {
    let isMounted = true;
    const fetchTestimonials = async () => {
      try {
        const res = await testimonialsAPI.getTestimonialsPublic();
        if (isMounted) {
          setTestimonials(res.data.testimonials || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching testimonials:', error);
        }
      } finally {
        if (isMounted) {
          setTestimonialsLoading(false);
        }
      }
    };

    fetchTestimonials();
    return () => {
      isMounted = false;
    };
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
    <div className="min-h-screen bg-white antialiased selection:bg-purple-100 overflow-hidden">
      <div className="border-b border-purple-900/10 bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-purple-100">
            Live Updates
          </span>

          <div className="relative flex-1 overflow-hidden">
            <div className="home-ticker-track flex w-max items-center text-[11px] font-semibold uppercase tracking-[0.32em] text-purple-100 sm:text-xs">
              <div className="flex shrink-0 items-center gap-10 pr-10">
                <span>Mech Doctor Automation</span>
                <span>Certified luxury car guidance</span>
                <span>Transparent deals</span>
                <span>Trusted inspections</span>
              </div>
              <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden="true">
                <span>Mech Doctor Automation</span>
                <span>Certified luxury car guidance</span>
                <span>Transparent deals</span>
                <span>Trusted inspections</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Hero Header Section */}
      <Hero />

      {/* 2. Featured Showcase Section (White Background) */}
      <FeaturedCars />

      {/* 3. Body Style Selection (Light Gray Background #F8FAFC) */}
      <ExploreByBodyType />

      {/* 4. Premium Collection / Luxury Cars (New Arrivals) (Linear Gradient Background) */}
      <section className="bg-gradient-to-b from-white to-[#F3F4F6] py-28 relative">
        <div className="absolute top-10 left-[15%] w-72 h-72 bg-purple-200/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-600 mb-3 block">
              New Arrivals
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-950 leading-none">
              New Arrivals
            </h2>
            <p className="text-gray-600 mt-5 leading-relaxed font-normal text-base sm:text-lg">
              Explore our latest arrivals, rigorously inspected by master technicians.
            </p>
          </motion.div>

          {/* Responsive Grid */}
          {newArrivalsLoading ? (
            <div className="flex gap-6 overflow-x-auto pb-6 mb-16 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[280px] sm:min-w-[320px] md:min-w-[340px]">
                  <SkeletonCarCard />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative group mb-16">
              {/* Prev Button */}
              <button
                onClick={() => scrollArrivals("left")}
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white text-gray-800 rounded-full shadow-xl border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 hover:text-purple-600 focus:outline-none hidden md:flex"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Scroll Container */}
              <div
                ref={arrivalsScrollRef}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 pt-2 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {newArrivals.map((car, i) => (
                  <motion.div
                    key={car._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="min-w-[280px] sm:min-w-[320px] md:min-w-[340px] snap-start transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <CarCard
                      car={car}
                      onWishlist={handleWishlist}
                      isInWishlist={isInWishlist(car._id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => scrollArrivals("right")}
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white text-gray-800 rounded-full shadow-xl border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 hover:text-purple-600 focus:outline-none hidden md:flex"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              to="/cars"
              className="inline-flex items-center gap-2.5 px-10 py-4 bg-purple-600 text-white font-bold text-sm rounded-xl hover:bg-purple-700 transition-all duration-300 active:scale-95 shadow-lg shadow-purple-500/20"
            >
              <span>View All Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Visual Separator to #EEF2FF */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C400,90 800,0 1200,90 L1200,120 L0,120 Z" fill="#EEF2FF"></path>
          </svg>
        </div>
      </section>

      {/* 5. Why Choose Us (Light Purple Background #EEF2FF) */}
      <section className="bg-[#EEF2FF] py-28 relative">
        <div className="absolute top-1/2 right-[5%] w-80 h-80 bg-purple-300/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-purple-600 font-bold mb-3 block">
              Our Values
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
              Why Choose Vishnu Car Consulting
            </h2>
            <p className="text-gray-600 mt-4 max-w-xl mx-auto text-base sm:text-lg">
              We redefine luxury car brokerage with absolute transparency, client devotion, and safety guarantees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Certified Safety",
                desc: "Every vehicle is subjected to a rigorous 150-point inspection by certified master technicians to ensure pristine mechanical standing.",
              },
              {
                icon: Award,
                title: "Luxury Excellence",
                desc: "We curate only high-value, pristine-condition luxury and performance cars, offering a premium driving standard.",
              },
              {
                icon: Zap,
                title: "Seamless Processing",
                desc: "Complete convenience. From virtual evaluations to immediate bank transfers and full registration paperwork clearance.",
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-lg shadow-purple-900/5 flex flex-col items-start"
              >
                <div className="p-3.5 bg-purple-600/10 rounded-2xl mb-6">
                  <card.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-950 mb-3">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Visual Separator to Purple-Indigo Gradient (#7C3AED start) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,120 900,0 1200,120 L1200,120 L0,120 Z" fill="#7C3AED"></path>
          </svg>
        </div>
      </section>

      {/* 6. Sell Your Car CTA (Full Width Gradient Background) */}
      <section className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 py-32 relative text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-10 items-center">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-7 space-y-6"
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-200">
                Instant Valuation
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Want to Sell Your Car? <br />
                Get an Instant Quote.
              </h2>
              <p className="text-purple-100 text-base md:text-lg max-w-md leading-relaxed font-light">
                Provide a few details and schedule a free doorstep inspection. We guarantee instant paperwork approval and fast payouts.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                {["Free Doorstep Inspection", "Immediate Payout", "Zero Paperwork Hassle"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-bold text-purple-200 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                    <Check size={14} className="text-purple-300" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5"
            >
              {/* Glassmorphism Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/30 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-2xl font-bold text-white mb-2">Instant Valuation</h3>
                <p className="text-purple-100 text-sm mb-6">Book your inspection slots in just 2 minutes.</p>

                <Link
                  to="/sell"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all duration-300 active:scale-95 shadow-lg shadow-black/10"
                >
                  <PhoneCall size={18} />
                  <span>Schedule Consultation</span>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Visual Separator to Testimonials #FAFAFA */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C400,90 800,0 1200,90 L1200,120 L0,120 Z" fill="#FAFAFA"></path>
          </svg>
        </div>
      </section>

      {/* 7. Customer Testimonials (Background: #FAFAFA) */}
      <section className="bg-[#FAFAFA] py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs tracking-[0.2em] uppercase text-purple-600 font-bold mb-3 block">
              Client Feedback
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
              Love Stories
            </h2>
            <p className="text-gray-600 mt-4 max-w-md mx-auto text-sm sm:text-base">
              Listen to the voices of our distinguished customers who drive precision and luxury.
            </p>
          </motion.div>

          {/* Testimonial slider / carousel wrapper */}
          {testimonialsLoading ? (
            <SkeletonTestimonials count={3} />
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 italic">No testimonials available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="relative px-2 sm:px-12">
              {/* Carousel Viewport */}
              <div className="overflow-hidden w-full">
                <div
                  ref={testimonialsScrollRef}
                  onScroll={handleTestimonialsScroll}
                  className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {testimonials.map((test) => (
                    <div
                      key={test._id}
                      className="flex-shrink-0 px-3 snap-start transition-all duration-300"
                      style={{ width: `${100 / visibleCards}%` }}
                    >
                      {/* Premium Card */}
                      <motion.div
                        whileHover={{ y: -8 }}
                        className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-xl border border-gray-100 group cursor-pointer flex flex-col justify-end p-6 h-[450px]"
                      >
                        {/* Background Car Photo */}
                        <img
                          src={test.carPhoto}
                          alt={test.carName}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent group-hover:via-black/60 transition-colors duration-300" />

                        {/* Content Overlay */}
                        <div className="relative z-10 space-y-4">
                          {/* Rating */}
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(test.rating)].map((_, idx) => (
                              <Star key={idx} size={14} fill="currentColor" className="text-amber-400" />
                            ))}
                          </div>

                          {/* Review */}
                          <p className="text-gray-100 text-sm italic font-medium leading-relaxed line-clamp-3">
                            "{test.review}"
                          </p>

                          {/* Car model bought */}
                          <span className="inline-block text-purple-300 text-xs font-bold uppercase tracking-wider bg-purple-950/60 border border-purple-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {test.carName}
                          </span>

                          {/* Customer avatar + name + city */}
                          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                            <img
                              src={test.customerPhoto}
                              alt={test.customerName}
                              className="w-10 h-10 rounded-full object-cover border border-purple-400/40 shadow-md"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150?text=Profile';
                              }}
                            />
                            <div>
                              <h4 className="text-white font-bold text-sm leading-tight">{test.customerName}</h4>
                              <p className="text-purple-300 text-xs font-semibold mt-0.5">{test.city}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {testimonials.length > visibleCards && (
                <>
                  <button
                    onClick={() => {
                      setTestimonialIndex((prev) => {
                        const nextIndex = prev > 0 ? prev - 1 : testimonials.length - visibleCards;
                        const container = testimonialsScrollRef.current;
                        if (container) {
                          const cardWidth = container.clientWidth / visibleCards;
                          container.scrollTo({
                            left: nextIndex * cardWidth,
                            behavior: 'smooth'
                          });
                        }
                        return nextIndex;
                      });
                    }}
                    className="absolute -left-2 sm:left-2 top-[50%] transform -translate-y-1/2 z-30 p-3 bg-white/90 hover:bg-white hover:scale-105 active:scale-95 text-purple-600 rounded-full shadow-lg border border-gray-100 transition-all backdrop-blur-sm"
                    aria-label="Previous testimonials"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setTestimonialIndex((prev) => {
                        const nextIndex = prev < testimonials.length - visibleCards ? prev + 1 : 0;
                        const container = testimonialsScrollRef.current;
                        if (container) {
                          const cardWidth = container.clientWidth / visibleCards;
                          container.scrollTo({
                            left: nextIndex * cardWidth,
                            behavior: 'smooth'
                          });
                        }
                        return nextIndex;
                      });
                    }}
                    className="absolute -right-2 sm:right-2 top-[50%] transform -translate-y-1/2 z-30 p-3 bg-white/90 hover:bg-white hover:scale-105 active:scale-95 text-purple-600 rounded-full shadow-lg border border-gray-100 transition-all backdrop-blur-sm"
                    aria-label="Next testimonials"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Bullet indicators */}
          {!testimonialsLoading && testimonials.length > visibleCards && (
            <div className="flex justify-center gap-2 mt-12">
              {[...Array(testimonials.length - visibleCards + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToTestimonialIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === testimonialIndex ? 'bg-purple-600 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,120 900,0 1200,120 L1200,120 L0,120 Z" fill="#7C3AED"></path>
          </svg>
        </div>

      </section>

      {/* 8. Statistics Section (Dark Background #111827) */}
      <section className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white py-28 relative overflow-hidden">
        {/* White radial ambient overlay for extra lighting depth over the bright gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {[
              { label: "Quality Checks Passed", value: "150+" },
              { label: "Customer Rating", value: "4.8★" },
              { label: "Multi-Brand Hubs", value: "12+" },
              { label: "Verified Kilometers", value: "100%" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="space-y-3 p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl"
              >
                {/* Main Counter Text - Pure crisp white for sharp contrast */}
                <h3 className="text-5xl md:text-6xl font-black tracking-tight text-white">
                  <AnimatedCounter value={stat.value} />
                </h3>
                {/* Label Text - Light high-contrast purple tone */}
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-purple-200">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Visual Separator Curve to Brands Section (#FFFFFF handles the seamless transition) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C400,90 800,0 1200,90 L1200,120 L0,120 Z" fill="#FFFFFF"></path>
          </svg>
        </div>
      </section>

      <section className="bg-white py-24 relative border-t border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 relative">

            {/* Subtle connecting line structure for desktop screens */}
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[1px] bg-gray-100 z-0" />

            {[
              { num: "01", title: "Find Your Car", desc: "Browse our certified inventory online or at a local hub.", icon: <Search size={20} /> },
              { num: "02", title: "Instant Paperwork", desc: "We handle the complete RC transfer and financing instantly.", icon: <FileCheck size={20} /> },
              { num: "03", title: "Drive Home", desc: "Take smooth delivery at your doorstep or our nearest hub.", icon: <Key size={20} /> }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-5">
                {/* Round Icon Frame matching your brand's purple aesthetic */}
                <div className="w-20 h-20 rounded-full bg-white border-[6px] border-[#F5F3F9] shadow-sm flex items-center justify-center text-[#5A43EC] transition-transform duration-300 hover:scale-105">
                  {step.icon}
                </div>
                <div>
                  <span className="block text-sm font-black text-gray-200 mb-1 tracking-widest">{step.num}</span>
                  <h4 className="text-lg font-bold text-[#200D53] tracking-tight">{step.title}</h4>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-[250px] mx-auto font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
    </div>
  );
}
