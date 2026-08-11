import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/store';
import { Menu, X, Search, Heart, Car, Plus, User, Phone, LogOut, LayoutDashboard, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavLinkItem from './NavLinkItem';
import AccountMenu from './AccountMenu';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const vcLogo = '/logos/vc-logo.jpeg';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState('login'); // 'login' or 'signup'
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on page transitions
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/cars?search=${searchQuery}`);
      setSearchQuery('');
      setIsMobileSearchOpen(false);
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

  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'HA';
  };

  return (
    <>
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sticky top-0 z-50 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 border-b border-white/10 shadow-lg backdrop-blur-md h-16 sm:h-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="flex items-center justify-between gap-4 sm:gap-10 w-full h-full">

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                <div className="relative">
                  <img
                    src={vcLogo}
                    alt="Mech Doctor Automation Logo"
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full group-hover:rotate-3 transition-transform duration-500 shadow-md ring-2 ring-white/20"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/20 to-transparent pointer-events-none" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-xl font-black text-white leading-none tracking-tight">
                    Mech Doctor
                  </span>
                  <span className="text-[8px] sm:text-[10px] font-bold text-purple-200 uppercase tracking-widest mt-0.5 sm:mt-1">
                    Automation
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation & Search */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-10 flex-grow max-w-3xl">
              {/* Desktop Search */}
              <div className="flex-grow relative h-10 xl:h-12 flex items-center group/search">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-200 group-focus-within/search:text-white transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search by brand, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full h-10 xl:h-12 bg-white/10 border border-white/20 rounded-xl px-12 text-sm text-white placeholder-purple-200/70 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                />
              </div>

              {/* Desktop Links */}
              <div className="flex items-center gap-6 xl:gap-8 whitespace-nowrap">
                {navLinks.map((link) => (
                  <NavLinkItem
                    key={link.to}
                    to={link.to}
                    label={link.label}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6 flex-shrink-0">
              <a href="tel:+919566728834" className="flex flex-col items-end justify-center border-r border-white/25 pr-6 hover:opacity-90 transition-opacity">
                <span className="text-[9px] font-bold text-purple-200 uppercase tracking-wider">Support</span>
                <span className="text-white font-extrabold text-sm sm:text-xs xl:text-sm whitespace-nowrap">+91 9566728834</span>
              </a>

              {user ? (
                <AccountMenu
                  user={user}
                  onLogout={handleLogout}
                  onNavigate={navigate}
                />
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-2.5 rounded-xl bg-white text-purple-700 font-extrabold text-xs xl:text-sm hover:bg-purple-50 transition-all duration-300 shadow-sm"
                >
                  Sign In
                </motion.button>
              )}
            </div>

            {/* Mobile Header Actions */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Search Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                aria-label="Toggle search"
              >
                <Search size={20} />
              </motion.button>

              {/* Hamburger Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                aria-label="Toggle navigation drawer"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Down Search Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-16 bg-gradient-to-r from-purple-700 to-indigo-700 shadow-md border-b border-white/10 px-4 py-3 z-40 md:hidden"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 text-purple-200" size={16} />
                <input
                  type="text"
                  placeholder="Search by brand, model or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full bg-white/15 border border-white/25 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-purple-200 focus:outline-none focus:border-white/50"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 text-purple-200 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Drawer (Animated Sidebar) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0.05, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-white z-50 shadow-2xl flex flex-col md:hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2">
                  <img src={vcLogo} alt="Logo" className="w-8 h-8 rounded-full shadow-sm" />
                  <span className="font-extrabold text-sm tracking-tight">Navigation</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-grow overflow-y-auto px-4 py-6 space-y-6">

                {/* User details if logged in */}
                {user ? (
                  <div className="p-4 bg-purple-50 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                      {getInitials()}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h4 className="text-xs font-extrabold text-purple-950 truncate">
                        {user.name || user.email.split('@')[0]}
                      </h4>
                      <p className="text-[10px] text-purple-600 truncate">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-200 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-gray-500 font-medium">Log in to view personalized offers</p>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}

                {/* Primary Navigation Links */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Menu</span>
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === link.to
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      {link.to === '/cars' && <Compass size={18} />}
                      {link.to === '/wishlist' && <Heart size={18} />}
                      {link.to === '/sell' && <Plus size={18} />}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Profile Links & Admin if authenticated */}
                {user && (
                  <div className="space-y-1 pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Account</span>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-purple-600 hover:bg-purple-50/50"
                      >
                        <LayoutDashboard size={18} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>
                )}

                {/* Contact & Support */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Helpline</span>
                  <a
                    href="tel:+919566728834"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-extrabold text-gray-700 bg-gray-50 border border-gray-100"
                  >
                    <Phone size={16} className="text-purple-600" />
                    <span>Call Support: +91 9566728834</span>
                  </a>
                </div>
              </div>

              {/* Drawer Footer (Sign out button) */}
              {user && (
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Tab Bar (thumb navigation) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden flex justify-around items-center py-2 px-2 select-none pb-safe-bottom">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] text-center ${location.pathname === '/' ? 'text-purple-600 font-extrabold' : 'text-gray-450'
            }`}
        >
          <Car size={18} className={location.pathname === '/' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[9px] font-bold tracking-tight">Home</span>
        </Link>
        <Link
          to="/cars"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] text-center ${location.pathname === '/cars' ? 'text-purple-600 font-extrabold' : 'text-gray-450'
            }`}
        >
          <Compass size={18} className={location.pathname === '/cars' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[9px] font-bold tracking-tight">Browse</span>
        </Link>
        <Link
          to="/sell"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] text-center ${location.pathname === '/sell' ? 'text-purple-600 font-extrabold' : 'text-gray-450'
            }`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 transform -translate-y-1">
            <Plus size={16} strokeWidth={3} />
          </div>
          <span className="text-[9px] font-bold tracking-tight">Sell Car</span>
        </Link>
        <Link
          to="/wishlist"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] text-center ${location.pathname === '/wishlist' ? 'text-purple-600 font-extrabold' : 'text-gray-450'
            }`}
        >
          <Heart size={18} className={location.pathname === '/wishlist' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[9px] font-bold tracking-tight">Wishlist</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] text-center ${location.pathname.startsWith('/profile') ? 'text-purple-600 font-extrabold' : 'text-gray-450'
            }`}
        >
          <User size={18} className={location.pathname.startsWith('/profile') ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[9px] font-bold tracking-tight">Profile</span>
        </Link>
      </div>

      {/* Auth Modals */}
      {authModalType === 'login' ? (
        <LoginModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          onSuccess={() => { }}
          onSwitchToSignup={handleSwitchToSignup}
        />
      ) : (
        <SignupModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          onSuccess={() => { }}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </>
  );
}
