import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import LoadingSpinner from '../components/LoadingSpinner';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastNotifications';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Scroll to top on component mount
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuthStore();

  // Validation functions
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    setLoading(true);
    const toastId = showLoadingToast('Logging in...');

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      setSuccess(true);
      setToken(response.data.token);
      setUser(response.data.user);

      // Store token in localStorage for persistence
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      dismissToast(toastId);
      showSuccessToast('Login successful! Redirecting...');

      // Show success message then redirect
      setTimeout(() => {
        // Redirect to admin page if user is admin, otherwise to home
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(location.state?.from?.pathname || '/');
        }
      }, 1000);
    } catch (error) {
      dismissToast(toastId);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      showErrorToast(errorMessage);
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gray-50 font-sans select-none w-full">
      {/* Left Visual Panel - Desktop Only */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-tr from-purple-700 via-indigo-800 to-indigo-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative Blur Orbs */}
        <div className="absolute top-[-20%] left-[-20%] w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-3xl" />

        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-3 z-10 cursor-pointer w-fit">
          <span className="text-3xl">🚗</span>
          <span className="font-black tracking-tight text-xl">Mech Doctor Automation</span>
        </Link>

        {/* Feature/Value Prop */}
        <div className="my-auto space-y-6 z-10 max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Your Gateway to Certified Luxury Cars
            </h2>
            <p className="text-indigo-200 text-base leading-relaxed font-semibold">
              Browse verified cars, track inspection history, and schedule custom consultations in seconds.
            </p>
          </motion.div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-3xl font-black text-white">10k+</p>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-1">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">250+</p>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-1">Inspected Cars</p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="z-10 text-xs font-semibold text-indigo-300">
          © Mech Doctor Automation. Secure portal.
        </div>
      </div>
      {/* Right Form Panel - Responsive */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-4 sm:px-8 py-12 md:py-16 bg-slate-50/50 relative overflow-hidden min-h-screen">
        {/* Subtle background patterns for mobile/desktop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[10%] w-[350px] h-[350px] bg-purple-200/50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[350px] h-[350px] bg-indigo-200/40 rounded-full blur-[100px]"></div>
        </div>

        {/* Form Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-[420px] bg-white border border-purple-100/80 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(124,58,237,0.06)] z-10 text-purple-950"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4 lg:hidden">
              <span className="text-4xl">🚗</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-purple-950 mb-1 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-purple-400 font-bold uppercase tracking-wider">Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-purple-800 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-purple-55/40 border border-purple-100 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/70 transition-all duration-300 font-semibold"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-xs mt-1.5 font-bold flex items-center gap-1"
                >
                  <AlertCircle size={14} /> {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-purple-800">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-purple-600 hover:text-purple-700 font-bold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-purple-55/40 border border-purple-100 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/70 transition-all duration-300 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-xs mt-1.5 font-bold flex items-center gap-1"
                >
                  <AlertCircle size={14} /> {errors.password}
                </motion.p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-purple-200 bg-white text-purple-600 cursor-pointer accent-purple-600"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-purple-850 cursor-pointer font-bold select-none">
                Remember me for 30 days
              </label>
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
                className="bg-green-50 border border-green-200 rounded-xl p-3.5 flex items-center gap-2 text-green-650 text-sm font-semibold"
              >
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                Login successful! Redirecting...
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || success}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-full shadow-lg shadow-purple-500/15 transition-all duration-300 flex justify-center items-center gap-2 text-sm"
            >
              {loading ? <LoadingSpinner fullScreen={false} size="small" /> : 'Sign In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-purple-100"></div>
            <span className="text-purple-400 text-[10px] font-black tracking-widest uppercase">OR</span>
            <div className="flex-1 h-px bg-purple-100"></div>
          </div>

          {/* Signup Link */}
          <p className="text-center text-purple-700 text-sm font-semibold">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-purple-600 hover:text-purple-800 font-extrabold transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </motion.div>

        {/* Bottom ornament */}
        <div className="mt-8 text-center text-purple-400 text-xs font-bold flex items-center gap-2 select-none">
          <span>✓ Secure SSL Encryption</span>
          <span className="text-purple-300">•</span>
          <span>✓ 24/7 Support</span>
        </div>
      </div>
    </div>
  );
}
