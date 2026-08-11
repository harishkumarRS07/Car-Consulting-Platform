import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Phone, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import LoadingSpinner from './LoadingSpinner';

export default function SignupModal({ isOpen, onClose, onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const { setUser, setToken } = useAuthStore();

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    if (!/^[0-9]{10}$/.test(phone)) return 'Phone number must be 10 digits';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return 'Please enter a valid email';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate all fields
    const newErrors = {};
    newErrors.name = validateName(formData.name);
    newErrors.phone = validatePhone(formData.phone);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signup(formData);
      setSuccess(true);
      setToken(response.data.token);
      setUser(response.data.user);

      // Show success message then close
      setTimeout(() => {
        onClose();
        onSuccess?.();
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setSuccess(false);
      }, 1500);
    } catch (error) {
      setApiError(
        error.response?.data?.message || 'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40"
          />

          {/* Modal Centering Wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto w-full pointer-events-none select-none font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-[440px] max-h-[90vh] overflow-y-auto bg-white border border-purple-100 rounded-[32px] p-6 sm:p-8 shadow-2xl pointer-events-auto my-auto focus:outline-none scrollbar-thin text-purple-955"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-400 hover:text-purple-650"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-block mb-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl shadow-lg border border-purple-100">
                    🚘
                  </div>
                </div>
                <h2 className="text-2xl font-black text-purple-955 mb-1 tracking-tight">Create Account</h2>
                <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">Join us to start exploring</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-bold text-purple-805 mb-2">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-purple-55/40 border border-purple-100 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/70 transition-all font-semibold"
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-650 text-xs mt-1.5 font-bold flex items-center gap-1"
                    >
                      <AlertCircle size={14} /> {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-bold text-purple-805 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-purple-55/40 border border-purple-100 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/70 transition-all font-semibold"
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-655 text-xs mt-1.5 font-bold flex items-center gap-1"
                    >
                      <AlertCircle size={14} /> {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-purple-85 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-purple-55/40 border border-purple-100 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/70 transition-all font-semibold"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-655 text-xs mt-1.5 font-bold flex items-center gap-1"
                    >
                      <AlertCircle size={14} /> {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold text-purple-85 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3 bg-purple-55/40 border border-purple-100 rounded-xl text-purple-955 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/70 transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-650 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-655 text-xs mt-1.5 font-bold flex items-center gap-1"
                    >
                      <AlertCircle size={14} /> {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-bold text-purple-85 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3 bg-purple-55/40 border border-purple-100 rounded-xl text-purple-955 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/70 transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-650 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-655 text-xs mt-1.5 font-bold flex items-center gap-1"
                    >
                      <AlertCircle size={14} /> {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* API Error */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2 text-red-650 text-sm font-semibold"
                  >
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                    {apiError}
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-205 rounded-xl p-3.5 flex items-center gap-2 text-green-650 text-sm font-semibold"
                  >
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    Account created successfully!
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || success}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3.5 rounded-full shadow border border-transparent transition-all duration-300 flex justify-center items-center gap-2 text-sm"
                >
                  {loading ? <LoadingSpinner fullScreen={false} size="small" /> : 'Create Account'}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-purple-100"></div>
                <span className="text-purple-400 text-[10px] font-black tracking-widest uppercase">OR</span>
                <div className="flex-1 h-px bg-purple-100"></div>
              </div>

              {/* Login Link */}
              <p className="text-center text-purple-700 text-sm font-semibold">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-purple-600 hover:text-purple-800 font-extrabold transition-colors"
                >
                  Login now
                </button>
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
