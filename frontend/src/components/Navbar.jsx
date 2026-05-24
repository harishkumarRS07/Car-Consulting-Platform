import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../context/store';
import { Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavLinkItem from './NavLinkItem';
import AccountMenu from './AccountMenu';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const vcLogo = '/logos/vc-logo.jpeg';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState('login'); // 'login' or 'signup'
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/cars?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const openAuthModal = (type) => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const handleSwitchToSignup = () => {
    setAuthModalType('signup');
  };

  const handleSwitchToLogin = () => {
    setAuthModalType('login');
  };

  const navLinks = [
    { to: '/cars', label: 'Browse Cars' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/sell', label: 'Sell Car' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 border-b border-white/10 shadow-2xl backdrop-blur-md h-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="flex items-center justify-between gap-10 w-full h-full">
          {/* Left Section: Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative">
                <img
                  src={vcLogo}
                  alt="Vishnu Car Consulting Logo"
                  className="w-11 h-11 rounded-xl group-hover:rotate-6 transition-transform duration-500 shadow-xl ring-2 ring-white/30"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-600/20 to-transparent pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white leading-none tracking-tight">
                  Vishnu Car
                </span>
                <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mt-1">
                  Consulting
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Center Section: Expanded Search + Navigation */}
          <div className="hidden lg:flex items-center gap-10 flex-1 max-w-4xl">
            {/* Expanded Search Bar */}
            <div className="flex-1 relative h-12 flex items-center group/search">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-200 group-focus-within/search:text-white transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by make, model or year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="w-full h-12 bg-white/10 border border-white/20 rounded-2xl px-12 text-[15px] text-white placeholder-purple-200/70 focus:outline-none focus:border-white/50 focus:bg-white/20 focus:ring-4 focus:ring-white/5 transition-all duration-300"
              />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-8 whitespace-nowrap">
              {navLinks.map((link) => (
                <NavLinkItem
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  external={link.external}
                />
              ))}
            </div>
          </div>

          {/* Right Section: Profile & Contact */}
          <div className="hidden md:flex items-center gap-8 flex-shrink-0">
            <div className="flex flex-col items-end justify-center border-r border-white/20 pr-8">
              <span className="text-[10px] font-bold text-purple-200 uppercase tracking-tighter">Support</span>
              <span className="text-white font-black text-[15px] whitespace-nowrap">+91 9566728834</span>
            </div>

            {user ? (
              <AccountMenu
                user={user}
                onLogout={handleLogout}
                onNavigate={navigate}
              />
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, shadow: '0 0 20px rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal('login')}
                className="px-8 py-3 rounded-2xl bg-white text-purple-700 font-black text-sm hover:bg-gray-50 transition-all duration-300"
              >
                Sign In
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <Menu size={24} className="text-white" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden mt-4 pt-4 border-t border-purple-500"
            >
              <div className="space-y-4 pb-4">
                {/* Mobile Search */}
                <div className="relative px-4">
                  <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-purple-200" size={18} />
                  <input
                    type="text"
                    placeholder="Search cars..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                    className="w-full bg-purple-500/30 border border-purple-400/50 rounded-full px-10 py-2.5 text-sm text-white placeholder-purple-200 focus:outline-none focus:border-white/50 transition-all duration-300"
                  />
                </div>

                {/* Mobile Nav Links */}
                {navLinks.map((link) => (
                  <motion.div
                    key={link.to}
                    whileHover={{ x: 4 }}
                  >
                    {link.external ? (
                      <a
                        href={link.to}
                        className="block px-4 py-2.5 text-purple-100 hover:text-white hover:bg-purple-500 rounded-lg transition-colors duration-300 text-sm font-medium"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2.5 text-purple-100 hover:text-white hover:bg-purple-500 rounded-lg transition-colors duration-300 text-sm font-medium"
                      >
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Admin Dashboard - Mobile */}
                {user?.role === 'admin' && (
                  <motion.div whileHover={{ x: 4 }}>
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2.5 text-purple-100 hover:text-white hover:bg-purple-500 rounded-lg transition-colors duration-300 text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                )}

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-purple-500">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-4">
                        <p className="text-xs text-purple-200 mb-1">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.email}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          navigate('/profile');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-purple-100 hover:text-white hover:bg-purple-500 rounded-lg transition-colors duration-300 text-sm font-medium text-left"
                      >
                        My Profile
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          navigate('/settings');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-purple-100 hover:text-white hover:bg-purple-500 rounded-lg transition-colors duration-300 text-sm font-medium text-left"
                      >
                        Settings
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-red-200 hover:text-red-100 hover:bg-red-600/50 rounded-lg transition-colors duration-300 text-sm font-medium text-left"
                      >
                        Logout
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        openAuthModal('login');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2.5 bg-white text-purple-600 font-semibold text-sm rounded-lg text-center hover:bg-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      Sign In
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Modal (Login or Signup) */}
      {authModalType === 'login' ? (
        <LoginModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          onSuccess={() => {
            // Modal will auto-close, user will be logged in
          }}
          onSwitchToSignup={handleSwitchToSignup}
        />
      ) : (
        <SignupModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          onSuccess={() => {
            // Modal will auto-close, user will be registered
          }}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </motion.nav>
  );
}
