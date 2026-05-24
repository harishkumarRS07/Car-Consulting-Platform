import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Calendar, MapPin, Clock, CheckCircle2, Phone, Mail, User } from 'lucide-react';
import { sellAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { brandsData } from '../utils/brandLogoMap';
import { getModelsByBrand } from '../utils/carModelsMap';
import BrandSelector from '../components/BrandSelector';

const SellCar = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Car Details
    brand: '',
    model: '',
    year: '',
    variant: '',
    owner: '',
    kms: '',
    
    // Seller Details
    name: '',
    phone: '',
    email: '',
    area: '',
    
    // Schedule
    date: '',
    timeSlot: '',
  });

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Scroll to top on component mount
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  useEffect(() => {
    // Use local brands data with logos
    setBrands(brandsData.map(b => b.name));
    setLoading(false);
  }, []);

  const fetchBrands = async () => {
    // Brands are now from local brandsData
  };

  const fetchModels = (brand) => {
    // Use local car models map instead of API call
    const brandModels = getModelsByBrand(brand);
    setModels(brandModels);
  };

  const updateData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field when user starts editing
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateSellerDetails = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!/^[0-9]{10}$/.test(formData.phone.trim())) errors.phone = 'Phone must be 10 digits';
    if (formData.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})?$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.area.trim()) errors.area = 'Area/City is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 8));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Validate if we can proceed to next step
  const canProceedNext = () => {
    switch (step) {
      case 1: // Brand selection
        return !!formData.brand;
      case 2: // Model selection
        return !!formData.model;
      case 3: // Year selection
        return !!formData.year;
      case 4: // Variant selection
        return !!formData.variant;
      case 5: // Owner selection
        return !!formData.owner;
      case 6: // KMs selection
        return !!formData.kms;
      case 7: // Seller details - validated separately
        return false; // Has its own button
      case 8: // Schedule - has its own button
        return false;
      default:
        return false;
    }
  };

  const handleBrandSelect = (brand) => {
    updateData('brand', brand);
    fetchModels(brand);
    setSearchQuery('');
    nextStep();
  };

  const handleModelSelect = (model) => {
    updateData('model', model);
    nextStep();
  };

  const submitForm = async () => {
    if (!validateSellerDetails()) return;
    if (!formData.date || !formData.timeSlot) return;
    
    setSubmitting(true);
    try {
      const res = await sellAPI.createEvaluation(formData);
      if (res.data.success) {
        setBookingId(res.data.bookingId);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Static Data Options
  const yearOptions = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);
  const variantOptions = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
  const ownerOptions = ['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner'];
  const kmsOptions = ['0 - 10,000 km', '10,000 - 30,000 km', '30,000 - 50,000 km', '50,000 - 80,000 km', '80,000+ km'];
  const timeSlotOptions = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

  // Framer Motion Variants
  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-gray-200 p-10 rounded-2xl max-w-md w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed! ✅</h2>
          <p className="text-gray-500 text-sm mb-4">Booking ID: <span className="font-mono font-bold text-purple-600">{bookingId}</span></p>
          <p className="text-gray-600 mb-8">Our team will contact you shortly to confirm the evaluation schedule for your {formData.brand} {formData.model}.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // Generate the top selection summary pills
  const renderBreadcrumbs = () => {
    const pills = [formData.brand, formData.model, formData.year, formData.variant, formData.owner, formData.kms, formData.name, formData.area]
      .filter(Boolean);
    
    return (
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {pills.map((val, idx) => (
          <span key={idx} className="px-3 py-1 bg-purple-50 rounded-full text-xs text-purple-700 border border-purple-100 shadow-sm font-medium">
            {val}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Progress */}
        <div className="flex items-center justify-between mb-8 text-gray-900">
          {step > 1 ? (
            <button onClick={prevStep} className="flex items-center gap-1 hover:text-purple-600 transition p-2 rounded-full hover:bg-purple-50">
              <ChevronLeft size={20} /> Back
            </button>
          ) : (
            <div className="w-[84px]"></div>
          )}
          <span className="font-bold px-4 py-1.5 bg-white rounded-full border border-gray-200 text-sm shadow-sm text-purple-600">
            Step {step} of 8
          </span>
          {step < 7 ? (
            <button 
              onClick={nextStep}
              disabled={!canProceedNext()}
              className={`flex items-center gap-1 px-4 py-2 rounded-full transition ${
                canProceedNext() 
                  ? 'hover:bg-purple-50 hover:text-purple-600 cursor-pointer' 
                  : 'opacity-40 cursor-not-allowed text-gray-400'
              }`}
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <div className="w-[84px]"></div>
          )}
        </div>

        {renderBreadcrumbs()}

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-[20px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-purple-100 relative overflow-hidden min-h-[100px]">
          
          {/* Progress Bar (Absolute top) */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 8) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode='wait'>
            {/* STEP 1: BRAND */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What's your car's brand?</h2>
                
                <div className="relative mb-8 max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search your brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-[42px] pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <BrandSelector
                  brands={brandsData.filter(b => 
                    b.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )}
                  selectedBrand={formData.brand}
                  onSelectBrand={handleBrandSelect}
                  loading={loading}
                />
              </motion.div>
            )}

            {/* STEP 2: MODEL */}
            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select the Model</h2>
                
                <div className="relative mb-6 max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder={`Search ${formData.brand} models...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-[42px] pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                {loading ? (
                   <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
                ) : models.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {models.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase())).map((model) => (
                      <motion.button
                        key={model}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleModelSelect(model)}
                        className="p-4 rounded-xl border-2 border-gray-100 bg-white hover:border-purple-200 hover:shadow-md transition-all shadow-sm text-gray-700 font-semibold"
                      >
                        {model}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                     <p className="text-gray-500 mb-4">No active models found in database for {formData.brand}.</p>
                     {/* Fallback open text input if DB is empty */}
                     <input
                        type="text"
                        placeholder="Type your model exactly..."
                        className="w-full max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mx-auto"
                        onKeyPress={(e) => { if(e.key === 'Enter') handleModelSelect(e.target.value) }}
                      />
                      <p className="text-xs text-gray-400 mt-2">Press enter to continue</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: YEAR */}
            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Manufacturing Year</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {yearOptions.map((year) => (
                    <motion.button
                      key={year}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { updateData('year', year); nextStep(); }}
                      className={`py-3 rounded-lg border transition-all font-medium ${formData.year === year ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-white'}`}
                    >
                      {year}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: VARIANT/FUEL */}
            {step === 4 && (
              <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Fuel Type / Variant</h2>
                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                  {variantOptions.map((variant) => (
                    <motion.button
                      key={variant}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { updateData('variant', variant); nextStep(); }}
                      className={`px-8 py-4 rounded-xl border-2 font-semibold transition-all ${formData.variant === variant ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'}`}
                    >
                      {variant}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: OWNERSHIP */}
            {step === 5 && (
              <motion.div key="step5" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Ownership History</h2>
                <div className="max-w-lg mx-auto flex flex-col gap-3">
                  {ownerOptions.map((owner) => (
                    <motion.button
                      key={owner}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateData('owner', owner); nextStep(); }}
                      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between ${formData.owner === owner ? 'bg-purple-50 border-purple-600 text-purple-800' : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'}`}
                    >
                      {owner}
                      {formData.owner === owner && <CheckCircle2 className="text-purple-600" size={20} />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 6: KILOMETERS */}
            {step === 6 && (
              <motion.div key="step6" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Kilometers Driven</h2>
                <div className="max-w-lg mx-auto flex flex-col gap-3">
                  {kmsOptions.map((km) => (
                    <motion.button
                      key={km}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateData('kms', km); nextStep(); }}
                      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between ${formData.kms === km ? 'bg-purple-50 border-purple-600 text-purple-800' : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'}`}
                    >
                      {km}
                      {formData.kms === km && <CheckCircle2 className="text-purple-600" size={20} />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 7: SELLER DETAILS */}
            {step === 7 && (
              <motion.div key="step7" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Your Details</h2>
                <div className="max-w-lg mx-auto space-y-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <User size={16} /> Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => updateData('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={16} /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit phone number"
                      maxLength="10"
                      value={formData.phone}
                      onChange={(e) => updateData('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail size={16} /> Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => updateData('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Area/City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin size={16} /> Area / City *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your area or city"
                      value={formData.area}
                      onChange={(e) => updateData('area', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${formErrors.area ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                    />
                    {formErrors.area && <p className="text-red-500 text-xs mt-1">{formErrors.area}</p>}
                  </div>

                </div>

                <div className="max-w-xs mx-auto mt-10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (validateSellerDetails()) {
                        nextStep();
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all"
                  >
                    Continue to Schedule
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 8: SCHEDULE */}
            {step === 8 && (
              <motion.div key="step8" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Schedule Free Evaluation</h2>
                <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Date Selection */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold mb-4">
                      <Calendar size={18} /> Select Date
                    </div>
                    <input 
                      type="date"
                      value={formData.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => updateData('date', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold mb-4">
                      <Clock size={18} /> Select Time Slot
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlotOptions.map(slot => (
                        <button
                          key={slot}
                          onClick={() => updateData('timeSlot', slot)}
                          className={`p-2 text-sm rounded-lg border transition-all ${formData.timeSlot === slot ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 hover:border-purple-300'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="max-w-xs mx-auto mt-10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitForm}
                    disabled={!formData.date || !formData.timeSlot || submitting}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-purple-500/30 transition-all disabled:opacity-50 flex justify-center items-center gap-2 text-lg"
                  >
                    {submitting ? (
                       <span className="animate-pulse">Booking...</span>
                    ) : (
                       <>Book Free Evaluation</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default SellCar;
