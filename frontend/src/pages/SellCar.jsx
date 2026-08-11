import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Calendar, MapPin, Clock, CheckCircle2, Phone, Mail, User, X } from 'lucide-react';
import { sellAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { brandsData } from '../utils/brandLogoMap';
import { getModelsByBrand } from '../utils/carModelsMap';
import BrandSelector from '../components/BrandSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastNotifications';

// Area/City data for autocomplete
const INDIAN_CITIES = [
  'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Mumbai', 'Delhi', 'Pune', 'Chandigarh',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Coimbatore', 'Kochi', 'Vadodara', 'Surat', 'Indore',
  'Visakhapatnam', 'Agra', 'Mysore', 'Gurgaon', 'Noida', 'Ghaziabad', 'Karur', 'Salem',
  'Erode', 'Tiruppur', 'Madurai', 'Trichy', 'Vellore', 'Nellore', 'Vizag', 'Bhopal'
].sort();

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
    carImages: [],
    
    // Seller Details
    name: '',
    phone: '',
    email: '',
    area: '',
    whatsappConsent: true,
    
    // Schedule
    date: '',
    timeSlot: '',

    // Pricing & Description
    expectedPrice: '',
    description: '',
  });

  const [models, setModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess] = useState(false);
  const [bookingId] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('sellCarDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('sellCarDraft', JSON.stringify(formData));
  }, [formData]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [step]);

  // SEO
  useEffect(() => {
    document.title = 'Sell Your Car | Vishnu Car Consulting';
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

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

  // Better phone validation - reject common invalid patterns
  const isValidPhone = (phone) => {
    const cleaned = phone.trim();
    if (!/^[0-9]{10}$/.test(cleaned)) return false;
    // Reject patterns like 0000000000, 1111111111, 1234567890
    if (/^(\d)\1{9}$/.test(cleaned)) return false; // All same digits
    if (/^1234567890$/.test(cleaned)) return false; // Sequential
    if (cleaned.startsWith('0')) return false; // Can't start with 0
    return true;
  };

  const validateSellerDetails = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (formData.phone && !isValidPhone(formData.phone)) errors.phone = 'Invalid phone number';
    if (formData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})?$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.area.trim()) errors.area = 'Area/City is required';
    
    // Expected price is required when submitting step 10
    if (step === 10 && !formData.expectedPrice) {
      errors.expectedPrice = 'Expected price is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAreaChange = (value) => {
    updateData('area', value);
    if (value.length > 0) {
      const filtered = INDIAN_CITIES.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setAreaSuggestions(filtered);
    } else {
      setAreaSuggestions([]);
    }
  };

  const handleAreaSelect = (city) => {
    updateData('area', city);
    setAreaSuggestions([]);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 10;
    const currentCount = previewImages.length;
    
    if (currentCount + files.length > maxImages) {
      showErrorToast(`Maximum ${maxImages} images allowed`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        showErrorToast(`File "${file.name}" rejected: Only JPG, JPEG, PNG, and WEBP formats are allowed`);
        return;
      }
      if (file.size > maxSize) {
        showErrorToast(`File "${file.name}" rejected: Each image must be less than 10MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImages(prev => [...prev, event.target.result]);
        setFormData(prev => ({
          ...prev,
          carImages: [...prev.carImages, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      carImages: prev.carImages.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 10));
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
      case 7: // Car images (optional, can skip)
        return true;
      case 8: // Seller details - validated separately
        return false; // Has its own button
      case 9: // Schedule - has its own button
        return false;
      case 10: // Review - has its own button
        return false;
      default:
        return false;
    }
  };

  // Progress steps definition
  const progressSteps = [
    'Brand', 'Model', 'Year', 'Fuel', 'Owner', 'KMs', 'Photos', 'Details', 'Schedule', 'Review'
  ];

  // Render visual progress indicator - ENHANCED
  const renderProgressIndicator = () => (
    <motion.div 
      className="mt-6 mb-7 flex flex-col gap-4 w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Progress Percentage Bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500">Step {step} of 10</span>
        <span className="text-sm font-bold text-purple-600">{Math.round((step / 10) * 100)}%</span>
      </div>
      <div className="h-[2px] bg-gray-200 rounded-full overflow-hidden w-full">
        <motion.div 
          className="h-full bg-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${(step / 10) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Step Indicators */}
      <div className="relative flex items-center justify-between w-full mt-2 select-none">
        {/* Background Line */}
        <div className="absolute left-[5%] right-[5%] top-[13px] sm:top-[17px] h-[2px] bg-gray-100 -translate-y-1/2 z-0" />
        
        {/* Progress Line */}
        <div 
          className="absolute left-[5%] top-[13px] sm:top-[17px] h-[2px] bg-purple-600 -translate-y-1/2 transition-all duration-[250ms] ease-in-out z-0"
          style={{ width: `${((Math.min(step, 10) - 1) / 9) * 90}%` }}
        />

        {progressSteps.map((stepName, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1 sm:gap-1.5 z-10 bg-transparent flex-1">
            <div
              className={`w-6 h-6 sm:w-[34px] sm:h-[34px] rounded-full flex items-center justify-center font-bold text-[10px] sm:text-sm transition-all duration-[250ms] ease-in-out border-2 ${
                idx + 1 === step
                  ? 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-500/20 ring-4 ring-purple-100'
                  : idx + 1 < step
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-200 bg-white text-gray-400'
              }`}
            >
              {idx + 1 < step ? '✓' : idx + 1}
            </div>
            <span className={`hidden sm:block text-[10px] sm:text-xs md:text-sm font-semibold text-center transition-colors duration-[250ms] ease-in-out leading-none ${
              idx + 1 <= step ? 'text-gray-800 font-semibold' : 'text-gray-400 font-medium'
            }`}>
              {stepName}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  // Render vehicle summary card - COMPACT VERSION
  const renderVehicleSummary = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 bg-purple-50/30 border border-purple-100/80 rounded-2xl p-4 max-w-[560px] mx-auto"
    >
      <div className="space-y-1.5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {formData.brand && (
            <span className="text-base font-bold text-gray-900">{formData.brand}</span>
          )}
          {formData.model && (
            <span className="text-base font-bold text-gray-900">{formData.model}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 font-medium">
          {formData.year && <span>{formData.year}</span>}
          {formData.variant && <span>• {formData.variant}</span>}
          {formData.owner && <span>• {formData.owner}</span>}
          {formData.kms && <span>• {formData.kms}</span>}
        </div>
      </div>
    </motion.div>
  );

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
    const toastId = showLoadingToast('Submitting your car details...');
    try {
      // Clean comma formatted expectedPrice before sending to API
      const cleanPrice = formData.expectedPrice ? Number(formData.expectedPrice.replace(/,/g, '')) : 500000;
      
      const payload = {
        ...formData,
        expectedPrice: cleanPrice,
      };

      const res = await sellAPI.createEvaluation(payload);
      if (res.data.success) {
        const reqId = res.data.requestId || res.data.bookingId;
        localStorage.removeItem('sellCarDraft');
        dismissToast(toastId);
        showSuccessToast('Your evaluation request has been submitted successfully!');
        
        // Redirect to Success Page with request details in state
        navigate('/sell/success', {
          state: {
            requestId: reqId,
            brand: formData.brand,
            model: formData.model,
            expectedPrice: cleanPrice,
          }
        });
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      dismissToast(toastId);
      const errorMessage = error?.response?.data?.message || 'Error submitting request. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Static Data Options
  const yearOptions = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => new Date().getFullYear() - i);
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
    const scheduledDate = new Date(formData.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf7ff] to-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-gray-100 rounded-[20px] max-w-[560px] w-full text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-32 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle2 size={64} className="text-white" />
            </motion.div>
          </div>

          <div className="p-10">
            <h2 className="text-[26px] md:text-[32px] font-bold text-gray-900 mb-2">Booking Confirmed! ✅</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Your evaluation request has been received</p>

            <div className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-6 mb-6 space-y-4 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Booking ID</span>
                <span className="font-mono text-lg font-bold text-purple-600">{bookingId}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Vehicle</p>
                <p className="font-bold text-gray-900">{formData.brand} {formData.model}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Scheduled Date</p>
                  <p className="font-bold text-gray-900">{scheduledDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Time Slot</p>
                  <p className="font-bold text-gray-900">{formData.timeSlot}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Contact</p>
                <p className="font-bold text-gray-900">{formData.phone}</p>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-[14px] p-4 mb-6">
              <p className="text-sm text-blue-900 text-left font-medium leading-relaxed">
                <span className="font-bold block text-blue-950 mb-1">📱 WhatsApp Confirmation</span>
                A detailed confirmation and reminders have been sent to your WhatsApp number.
              </p>
            </div>

            <button 
              onClick={() => {
                localStorage.removeItem('sellCarDraft');
                navigate('/');
              }}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-[14px] transition duration-[250ms] shadow-md shadow-purple-500/10"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7ff] to-white pt-4 pb-32 md:py-12 font-sans select-none">
      <div className="max-w-[1320px] w-[94%] mx-auto px-6">
        
        {/* Header Progress with Visual Steps */}
        {renderProgressIndicator()}

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-gray-100 overflow-hidden max-w-[1000px] mx-auto"
        >

          {/* Content Area */}
          <div className="p-5 sm:p-10">
            <AnimatePresence mode='wait'>
            {/* STEP 1: BRAND */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-4 text-center leading-tight">What's your car's brand?</h2>
                
                <div className="relative mx-auto w-[90%] md:w-[70%] max-w-[560px] h-[52px] mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search your brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full bg-gray-50 border border-gray-200 rounded-[14px] pl-[46px] pr-4 text-base placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 focus:bg-white transition-all duration-[250ms] ease-in-out"
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
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-4 text-center leading-tight">Select the Model</h2>
                
                <div className="relative mx-auto w-[90%] md:w-[70%] max-w-[560px] h-[52px] mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={`Search ${formData.brand} models...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full bg-gray-50 border border-gray-200 rounded-[14px] pl-[46px] pr-4 text-base placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 focus:bg-white transition-all duration-[250ms] ease-in-out"
                  />
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mx-auto w-full max-w-3xl animate-pulse">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-full h-[48px] sm:h-[54px] rounded-[14px] border-2 border-gray-100 bg-gray-50/50" />
                    ))}
                  </div>
                ) : models.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 max-h-[350px] overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-100 hover:[&::-webkit-scrollbar-thumb]:bg-purple-200 [&::-webkit-scrollbar-thumb]:rounded-full mx-auto w-full max-w-3xl">
                    {models.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase())).map((model) => (
                      <motion.button
                        key={model}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModelSelect(model)}
                        className="w-full h-[48px] sm:h-[54px] flex items-center justify-center p-3 rounded-[14px] border-2 border-gray-100 bg-white text-gray-700 text-xs sm:text-sm font-semibold text-center hover:border-purple-200 hover:text-purple-600 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-[250ms] ease-in-out leading-tight"
                      >
                        {model}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-10">
                     <p className="text-gray-500 mb-4 font-medium">No active models found in database for {formData.brand}.</p>
                     <input
                        type="text"
                        placeholder="Type your model exactly..."
                        className="w-full max-w-xs bg-gray-50 border border-gray-200 rounded-[14px] px-4 py-3.5 text-base focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 transition-all duration-[250ms] mx-auto"
                        onKeyPress={(e) => { if(e.key === 'Enter') handleModelSelect(e.target.value) }}
                      />
                      <p className="text-xs text-gray-400 mt-2 font-medium">Press enter to continue</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: YEAR */}
            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-6 text-center leading-tight">Manufacturing Year</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-5 w-full max-w-2xl mx-auto">
                  {yearOptions.map((year) => (
                    <motion.button
                      key={year}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateData('year', year); nextStep(); }}
                      className={`w-full h-[48px] sm:h-[50px] flex items-center justify-center rounded-[14px] border-2 transition-all duration-[250ms] ease-in-out font-semibold text-sm sm:text-base ${
                        formData.year === year 
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20' 
                          : 'bg-white text-gray-700 border-gray-100 hover:border-purple-200 hover:text-purple-600 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
                      }`}
                    >
                      {year}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: VARIANT/FUEL */}
            {step === 4 && (
              <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-6 text-center leading-tight">Fuel Type / Variant</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5 w-full max-w-3xl mx-auto">
                  {variantOptions.map((variant) => (
                    <motion.button
                      key={variant}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateData('variant', variant); nextStep(); }}
                      className={`w-full h-[48px] sm:h-[54px] flex items-center justify-center rounded-[14px] border-2 transition-all duration-[250ms] ease-in-out font-bold text-sm sm:text-base ${
                        formData.variant === variant 
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20' 
                          : 'bg-white text-gray-700 border-gray-100 hover:border-purple-200 hover:text-purple-600 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
                      }`}
                    >
                      {variant}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: OWNERSHIP */}
            {step === 5 && (
              <motion.div key="step5" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-6 text-center leading-tight">Ownership History</h2>
                <div className="max-w-[560px] mx-auto flex flex-col gap-3">
                  {ownerOptions.map((owner) => (
                    <motion.button
                      key={owner}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { updateData('owner', owner); nextStep(); }}
                      className={`w-full p-5 rounded-[14px] border-2 text-left font-semibold text-base transition-all duration-[250ms] ease-in-out flex items-center justify-between ${
                        formData.owner === owner 
                          ? 'bg-purple-50/50 border-purple-600 text-purple-700' 
                          : 'bg-white border-gray-100 text-gray-700 hover:border-purple-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
                      }`}
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
              <motion.div key="step6" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-6 text-center leading-tight">Kilometers Driven</h2>
                <div className="max-w-[560px] mx-auto flex flex-col gap-3">
                  {kmsOptions.map((km) => (
                    <motion.button
                      key={km}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { updateData('kms', km); nextStep(); }}
                      className={`w-full p-5 rounded-[14px] border-2 text-left font-semibold text-base transition-all duration-[250ms] ease-in-out flex items-center justify-between ${
                        formData.kms === km 
                          ? 'bg-purple-50/50 border-purple-600 text-purple-700' 
                          : 'bg-white border-gray-100 text-gray-700 hover:border-purple-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
                      }`}
                    >
                      {km}
                      {formData.kms === km && <CheckCircle2 className="text-purple-600" size={20} />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 7: CAR IMAGES */}
            {step === 7 && (
              <motion.div key="step7" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-2 text-center leading-tight">Upload Car Photos</h2>
                <p className="text-gray-500 font-medium text-center mb-6 text-sm">Add up to 10 images for faster evaluation (Optional)</p>
                
                {renderVehicleSummary()}

                <div className="max-w-[560px] mx-auto">
                  {/* Upload Area - FIXED & ENLARGED */}
                  <label className="flex flex-col items-center justify-center min-h-[220px] border-2 border-dashed border-purple-200 rounded-[20px] p-6 text-center cursor-pointer hover:bg-purple-50/40 hover:border-purple-300 transition duration-[250ms] bg-white">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-3"
                    >
                      <svg className="w-12 h-12 text-purple-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-4m6 4l6-4" />
                      </svg>
                    </motion.div>
                    <p className="font-bold text-gray-800 mb-1 text-base">Drag & Drop Images</p>
                    <p className="text-sm text-gray-500 mb-2 font-medium">or browse files</p>
                    <p className="text-xs text-gray-400 font-medium">JPG • PNG • WEBP up to 10 MB each</p>
                    <p className="text-xs font-semibold text-purple-600 mt-3">{previewImages.length}/10 images selected</p>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={previewImages.length >= 10}
                    />
                  </label>

                  {/* Recommended Photos Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 border border-blue-100 rounded-[20px] p-5"
                  >
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Recommended Photos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Front View', icon: '🎯' },
                        { label: 'Rear View', icon: '🔙' },
                        { label: 'Side View', icon: '➡️' },
                        { label: 'Interior', icon: '🪑' },
                        { label: 'Dashboard', icon: '📊' },
                        { label: 'Odometer', icon: '⏱️' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-base">{item.icon}</span>
                          <span className="text-gray-700 font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Image Previews Grid - ENHANCED */}
                  {previewImages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6"
                    >
                      <h3 className="font-bold text-gray-900 mb-3 text-sm">Preview ({previewImages.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {previewImages.map((img, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group rounded-[12px] overflow-hidden bg-gray-50 aspect-square border border-gray-100"
                          >
                            <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeImage(idx);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-all bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="absolute top-2 right-2 bg-white/90 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-905">
                              {idx + 1}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons - BOTH OPTIONS VISIBLE */}
                  <div className="mt-8 flex gap-4">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={nextStep}
                      className="flex-1 py-3.5 border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-[14px] transition-all duration-[250ms] ease-in-out text-sm"
                    >
                      Skip & Continue
                    </motion.button>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={nextStep}
                      disabled={previewImages.length === 0}
                      className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-[14px] shadow-md shadow-purple-500/10 transition-all duration-[250ms] ease-in-out text-sm"
                    >
                      Upload & Continue
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 8: SELLER DETAILS */}
            {step === 8 && (
              <motion.div key="step8" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-2 text-center leading-tight">Your Details</h2>
                <p className="text-gray-500 font-medium text-center mb-6 text-sm">Help us contact you for the evaluation</p>
                
                {renderVehicleSummary()}

                <div className="max-w-[560px] mx-auto space-y-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <User size={16} className="text-purple-600" /> Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => updateData('name', e.target.value)}
                      className={`w-full px-4 py-3.5 border rounded-[14px] focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 bg-gray-50/30 transition-all duration-[250ms] ease-in-out text-base ${formErrors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-purple-600" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit phone number"
                      maxLength="10"
                      value={formData.phone}
                      onChange={(e) => updateData('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`w-full px-4 py-3.5 border rounded-[14px] focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 bg-gray-50/30 transition-all duration-[250ms] ease-in-out text-base ${formErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-purple-600" /> Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => updateData('email', e.target.value)}
                      className={`w-full px-4 py-3.5 border rounded-[14px] focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 bg-gray-50/30 transition-all duration-[250ms] ease-in-out text-base ${formErrors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.email}</p>}
                  </div>

                  {/* Area with Autocomplete */}
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin size={16} className="text-purple-600" /> Area / City *
                    </label>
                    <input
                      type="text"
                      placeholder="Search your city..."
                      value={formData.area}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      className={`w-full px-4 py-3.5 border rounded-[14px] focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 bg-gray-50/30 transition-all duration-[250ms] ease-in-out text-base ${formErrors.area ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}
                    />
                    {areaSuggestions.length > 0 && (
                      <motion.div className="absolute top-[80px] left-0 right-0 mt-1 bg-white border border-gray-150 rounded-[14px] shadow-lg z-10 overflow-hidden">
                        {areaSuggestions.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => handleAreaSelect(city)}
                            className="w-full text-left px-5 py-3.5 hover:bg-purple-50 text-sm text-gray-700 font-bold transition-all"
                          >
                            {city}
                          </button>
                        ))}
                      </motion.div>
                    )}
                    {formErrors.area && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.area}</p>}
                  </div>

                  {/* WhatsApp Consent */}
                  <label className="flex items-start gap-3 p-4 bg-blue-50/30 rounded-[14px] border border-blue-100 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.whatsappConsent}
                      onChange={(e) => updateData('whatsappConsent', e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-blue-900 font-semibold leading-relaxed">
                      I agree to receive updates and reminders via WhatsApp
                    </span>
                  </label>

                </div>

                <div className="max-w-[320px] mx-auto mt-8">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (validateSellerDetails()) {
                        nextStep();
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-[14px] shadow-lg shadow-purple-500/10 transition-all duration-[250ms] ease-in-out text-sm"
                  >
                    Continue to Schedule
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 9: SCHEDULE */}
            {step === 9 && (
              <motion.div key="step9" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-2 text-center leading-tight">Schedule Free Evaluation</h2>
                <p className="text-gray-500 font-medium text-center mb-6 text-sm">Select your preferred date and time</p>
                
                {renderVehicleSummary()}

                <div className="max-w-[720px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Date Selection */}
                  <div className="bg-gradient-to-br from-purple-50/20 to-indigo-50/20 p-6 rounded-[20px] border border-purple-100/80">
                    <div className="flex items-center gap-2 text-gray-800 font-bold mb-4">
                      <Calendar size={18} className="text-purple-600" /> Select Date
                    </div>
                    <input 
                      type="date"
                      value={formData.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => updateData('date', e.target.value)}
                      className="w-full p-3.5 border border-gray-200 rounded-[14px] focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 bg-white transition-all duration-[250ms] ease-in-out text-base font-semibold"
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="bg-gradient-to-br from-purple-50/20 to-indigo-50/20 p-6 rounded-[20px] border border-purple-100/80">
                    <div className="flex items-center gap-2 text-gray-800 font-bold mb-4">
                      <Clock size={18} className="text-purple-600" /> Select Time Slot
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlotOptions.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => updateData('timeSlot', slot)}
                          className={`p-2.5 text-sm rounded-[12px] border-2 transition-all duration-[250ms] ease-in-out font-bold ${
                            formData.timeSlot === slot 
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20' 
                              : 'bg-white text-gray-700 border-gray-100 hover:border-purple-200 hover:text-purple-600'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="max-w-[320px] mx-auto mt-8">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep}
                    disabled={!formData.date || !formData.timeSlot}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-[14px] shadow-lg shadow-purple-500/10 transition-all duration-[250ms] ease-in-out text-sm"
                  >
                    Review & Confirm
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 10: REVIEW & CONFIRM */}
            {step === 10 && (
              <motion.div key="step10" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-[26px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 mb-2 text-center leading-tight">Review Your Details</h2>
                <p className="text-gray-500 font-medium text-center mb-6 text-sm">Verify everything before submitting</p>

                <div className="max-w-[720px] mx-auto space-y-4">
                  
                  {/* Vehicle Details */}
                  <div className="bg-gradient-to-br from-purple-50/20 to-indigo-50/20 rounded-[20px] p-6 border border-purple-100/80">
                    <h3 className="font-bold text-gray-900 mb-4 text-[18px]">Vehicle Details</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div><p className="text-gray-500 font-medium mb-0.5">Brand</p><p className="font-bold text-gray-900 text-base">{formData.brand}</p></div>
                      <div><p className="text-gray-500 font-medium mb-0.5">Model</p><p className="font-bold text-gray-900 text-base">{formData.model}</p></div>
                      <div><p className="text-gray-500 font-medium mb-0.5">Year</p><p className="font-bold text-gray-900 text-base">{formData.year}</p></div>
                      <div><p className="text-gray-500 font-medium mb-0.5">Fuel Type</p><p className="font-bold text-gray-900 text-base">{formData.variant}</p></div>
                      <div><p className="text-gray-500 font-medium mb-0.5">Owner</p><p className="font-bold text-gray-900 text-base">{formData.owner}</p></div>
                      <div><p className="text-gray-500 font-medium mb-0.5">KMs</p><p className="font-bold text-gray-900 text-base">{formData.kms}</p></div>
                    </div>
                  </div>

                  {/* Seller Details */}
                  <div className="bg-gradient-to-br from-blue-50/20 to-cyan-50/20 rounded-[20px] p-6 border border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-[18px]">Your Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-500 font-medium mb-0.5">Name</p><p className="font-bold text-gray-900 text-base">{formData.name}</p></div>
                      <div><p className="text-gray-500 font-medium mb-0.5">Phone</p><p className="font-bold text-gray-900 text-base">{formData.phone}</p></div>
                      {formData.email && <div><p className="text-gray-500 font-medium mb-0.5">Email</p><p className="font-bold text-gray-900 text-base">{formData.email}</p></div>}
                      <div><p className="text-gray-500 font-medium mb-0.5">Area</p><p className="font-bold text-gray-900 text-base">{formData.area}</p></div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-gradient-to-br from-green-50/20 to-emerald-50/20 rounded-[20px] p-6 border border-green-150">
                    <h3 className="font-bold text-gray-900 mb-4 text-[18px]">Appointment Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-500 font-medium mb-0.5">Date</p><p className="font-bold text-gray-900 text-base">{new Date(formData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
                      <div><p className="text-gray-500 font-medium mb-0.5">Time</p><p className="font-bold text-gray-900 text-base">{formData.timeSlot}</p></div>
                    </div>
                  </div>

                  {/* Car Photos Count */}
                  {previewImages.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50/20 to-amber-50/20 rounded-[20px] p-6 border border-orange-100">
                      <p className="text-sm text-gray-500 font-semibold mb-1">Car Photos</p>
                      <p className="font-bold text-gray-900 text-base">{previewImages.length} photo{previewImages.length !== 1 ? 's' : ''} uploaded</p>
                    </div>
                  )}

                  {/* Estimation fields (Expected Price & Comments) */}
                  <div className="bg-gradient-to-br from-purple-50/30 to-indigo-50/30 rounded-[20px] p-6 border border-purple-150/80 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-900 text-[18px]">Price & Notes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Expected Price (₹) *</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-base">₹</span>
                          <input
                            type="text"
                            placeholder="e.g. 6,50,000"
                            value={formData.expectedPrice}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              const formatted = val ? Number(val).toLocaleString('en-IN') : '';
                              updateData('expectedPrice', formatted);
                            }}
                            className={`w-full pl-8 pr-4 py-3 border rounded-[12px] focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 bg-white font-bold text-gray-900 transition-all ${
                              formErrors.expectedPrice ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white'
                            }`}
                          />
                        </div>
                        {formErrors.expectedPrice && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.expectedPrice}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Vehicle Notes / Description</label>
                        <textarea
                          placeholder="Describe condition, history, scratches, etc..."
                          rows="2"
                          value={formData.description}
                          onChange={(e) => updateData('description', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 bg-white text-sm text-gray-800 transition-all placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Confirmation */}
                  <div className="bg-blue-50/30 border border-blue-100 rounded-[14px] p-4">
                    <div className="flex gap-3">
                      <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-blue-950 text-sm">WhatsApp Confirmation</p>
                        <p className="text-xs text-blue-800 mt-1 font-semibold">Confirmation and reminders will be sent to {formData.phone}</p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="max-w-[320px] mx-auto mt-8 space-y-3">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitForm}
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-[14px] shadow-lg shadow-purple-500/10 transition-all duration-[250ms] ease-in-out flex justify-center items-center gap-2 text-sm pointer-events-auto"
                  >
                    {submitting ? (
                      <LoadingSpinner fullScreen={false} size="small" />
                    ) : (
                      <>✓ Book Free Evaluation</>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={submitting}
                    className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-[14px] hover:bg-gray-50 transition duration-[250ms] disabled:opacity-50 text-sm"
                  >
                    Back to Schedule
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation (Sticky bottom on mobile, inline on desktop) */}
          <div className="fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-4 border-t border-gray-150 flex justify-between items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:static md:bg-gray-50/50 md:border-t md:border-gray-100 md:px-10 md:py-5 md:shadow-none pb-safe-bottom w-full">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={submitting}
                className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-extrabold transition duration-[250ms] disabled:opacity-50 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-purple-200 rounded-[8px] p-1.5"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}
            
            <span className="text-xs sm:text-sm font-bold text-gray-500">
              Step {step} of 10
            </span>

            {step < 10 && step !== 8 && step !== 9 && (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceedNext() || submitting}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] font-extrabold transition duration-[250ms] text-xs sm:text-sm select-none ${
                  canProceedNext() && !submitting
                    ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
                    : 'opacity-40 text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                Next <ChevronRight size={16} />
              </button>
            )}
            {(step === 8 || step === 9 || step === 10) && <div />}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellCar;
