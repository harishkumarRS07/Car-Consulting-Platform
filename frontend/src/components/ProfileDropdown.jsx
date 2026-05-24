import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Generate avatar from user email
  const getInitials = (email) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-1 py-1 rounded-full hover:bg-gray-100 transition-colors duration-300"
      >
        {/* Avatar Circle */}
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {getInitials(user?.email || 'U')}
        </div>

        {/* Label (Desktop) */}
        <span className="hidden sm:inline text-sm text-gray-700 font-medium max-w-[100px] truncate">
          {user?.name || user?.email?.split('@')[0] || 'Profile'}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">Signed in as</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* My Profile */}
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => handleNavigate('/profile')}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300 text-left text-sm"
              >
                <User size={18} className="text-purple-600" />
                <span>My Profile</span>
              </motion.button>

              {/* Settings */}
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => handleNavigate('/settings')}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300 text-left text-sm"
              >
                <Settings size={18} className="text-purple-600" />
                <span>Settings</span>
              </motion.button>

              {/* Divider */}
              <div className="my-2 border-t border-gray-200" />

              {/* Logout */}
              <motion.button
                whileHover={{ x: 4 }}
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-300 text-left text-sm"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
