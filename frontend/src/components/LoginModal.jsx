import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { authAPI } from "../services/api";
import { useAuthStore } from "../context/store";
import LoadingSpinner from "./LoadingSpinner";

export default function LoginModal({ isOpen, onClose, onSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { setUser, setToken } = useAuthStore();

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login({ email, password });
      setSuccess(true);
      setToken(response.data.token);
      setUser(response.data.user);

      // Show success message then close
      setTimeout(() => {
        // Reset form
        setEmail("");
        setPassword("");
        setSuccess(false);

        // Close modal and call success callback
        onClose();
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto bg-white border border-purple-100 rounded-[32px] p-6 sm:p-8 shadow-2xl pointer-events-auto my-auto focus:outline-none scrollbar-thin text-purple-955"
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
                    🔓
                  </div>
                </div>
                <h2 className="text-2xl font-black text-purple-955 mb-1 tracking-tight">Welcome Back</h2>
                <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">Sign in to continue</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-purple-800 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-purple-55/40 border border-purple-100 rounded-xl text-purple-950 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/70 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold text-purple-800 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2 text-red-650 text-sm font-semibold"
                  >
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                    {error}
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
                    Login successful!
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading || success}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3.5 rounded-full shadow border border-transparent transition-all duration-300 flex justify-center items-center gap-2 text-sm"
                >
                  {loading ? <LoadingSpinner fullScreen={false} size="small" /> : "Sign In"}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-purple-100"></div>
                <span className="text-purple-400 text-[10px] font-black tracking-widest uppercase">OR</span>
                <div className="flex-1 h-px bg-purple-100"></div>
              </div>

              {/* Switch to Signup */}
              <p className="text-center text-purple-700 text-sm font-semibold">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="text-purple-600 hover:text-purple-800 font-extrabold transition-colors"
                >
                  Sign up now
                </button>
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
