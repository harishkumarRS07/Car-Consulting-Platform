import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCarsStore } from '../context/store';
import {
  User,
  Mail,
  Shield,
  Bell,
  Heart,
  LogOut,
  Car,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../utils/toastNotifications';
import { authAPI, sellAPI } from '../services/api';
import CarCard from '../components/CarCard';

export default function Profile() {
  const { user, setUser, logout } = useAuthStore();
  const { wishlist, removeFromWishlist } = useCarsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'personal';
  });

  // Synchronize activeTab if search query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['personal', 'security', 'notifications', 'requirements', 'wishlist'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: user?.phone || '+91 98765 43210'
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newListings: user?.notificationSettings?.newListings ?? true,
    priceDrops: user?.notificationSettings?.priceDrops ?? true,
    schedules: user?.notificationSettings?.schedules ?? false,
    digest: user?.notificationSettings?.digest ?? true
  });

  // Requirements / bookings state
  const [requirements, setRequirements] = useState([]);
  const [requirementsLoading, setRequirementsLoading] = useState(false);

  // Saving states
  const [personalSaving, setPersonalSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [notificationsSaving, setNotificationsSaving] = useState(false);

  // Fresh user profile load
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        if (res.data.success) {
          setUser(res.data.user);
          setPersonalForm({
            name: res.data.user.name || '',
            email: res.data.user.email || '',
            phone: res.data.user.phone || '',
          });
          if (res.data.user.notificationSettings) {
            setNotificationSettings(res.data.user.notificationSettings);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchLatestProfile();
  }, [setUser]);

  // Fetch sell requests on requirements tab active
  useEffect(() => {
    if (activeTab === 'requirements') {
      const fetchRequirements = async () => {
        setRequirementsLoading(true);
        try {
          const res = await sellAPI.getMyRequests();
          if (res.data.success) {
            setRequirements(res.data.requests || []);
          }
        } catch (err) {
          console.error('Failed to load sell requests:', err);
          showErrorToast('Failed to load your valuation requests.');
        } finally {
          setRequirementsLoading(false);
        }
      };
      fetchRequirements();
    }
  }, [activeTab]);

  // Access check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf7ff] to-white py-36 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto px-6"
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">
              Access Your Profile
            </h1>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Please sign in to view and manage your profile details, settings, and shortlisted cars.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all duration-300 text-center shadow-lg shadow-purple-500/20"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'HA';
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  const sections = [
    { id: 'personal', icon: <User size={18} />, label: 'Personal Details', description: 'Update name & phone details' },
    { id: 'security', icon: <Shield size={18} />, label: 'Login & Security', description: 'Manage password & settings' },
    { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications', description: 'Choose update alerts' },
    { id: 'requirements', icon: <ClipboardList size={18} />, label: 'My Requirements', description: 'Track valuation requests' },
    { id: 'wishlist', icon: <Heart size={18} />, label: 'Shortlisted Cars', description: 'Manage saved listings' },
  ];

  // Handlers
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    if (!personalForm.name.trim()) {
      showErrorToast('Name cannot be empty');
      return;
    }
    if (!personalForm.phone.trim()) {
      showErrorToast('Phone number cannot be empty');
      return;
    }
    setPersonalSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: personalForm.name,
        phone: personalForm.phone
      });
      if (res.data.success) {
        setUser(res.data.user);
        showSuccessToast('Personal Information updated successfully!');
      }
    } catch (err) {
      console.error(err);
      showErrorToast(err?.response?.data?.message || 'Failed to update personal details');
    } finally {
      setPersonalSaving(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (!securityForm.currentPassword) {
      showErrorToast('Please enter your current password');
      return;
    }
    if (securityForm.newPassword.length < 6) {
      showErrorToast('New password must be at least 6 characters long');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showErrorToast('Confirm password does not match new password');
      return;
    }
    setSecuritySaving(true);
    try {
      const res = await authAPI.updateProfile({
        password: securityForm.newPassword
      });
      if (res.data.success) {
        setUser(res.data.user);
        showSuccessToast('Password updated successfully!');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error(err);
      showErrorToast(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setNotificationsSaving(true);
    try {
      const res = await authAPI.updateProfile({
        notificationSettings
      });
      if (res.data.success) {
        setUser(res.data.user);
        showSuccessToast('Notification preferences updated!');
      }
    } catch (err) {
      console.error(err);
      showErrorToast(err?.response?.data?.message || 'Failed to update preferences');
    } finally {
      setNotificationsSaving(false);
    }
  };

  const handleWishlistToggle = (car) => {
    removeFromWishlist(car._id);
    showSuccessToast(`${car.brand ? car.brand.toUpperCase() : ''} ${car.model ? car.model.toUpperCase() : ''} removed from shortlist`);
  };

  const handleLogout = () => {
    logout();
    showSuccessToast('Logged out successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7ff] to-white pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] p-6 md:p-8 shadow-md border border-purple-100/50 mb-8 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg ring-4 ring-purple-50">
            {initials}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight mb-2">
              {displayName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3.5 text-gray-500 font-medium">
              <span className="flex items-center gap-2 bg-gray-50 px-3.5 py-1.5 rounded-full text-xs border border-gray-100">
                <Mail size={14} className="text-purple-500" />
                {user?.email}
              </span>
              <span className="flex items-center gap-2 bg-purple-50 px-3.5 py-1.5 rounded-full text-xs border border-purple-100 text-purple-700">
                <Shield size={14} />
                {user?.role === 'admin' ? 'Elite Admin' : 'Premium Member'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 hover:text-red-700 transition-all shadow-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </motion.div>

        {/* Tab Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Navigation Sidebar Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[24px] border border-gray-100/80 p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 mb-2 block select-none">
                Account Settings
              </span>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl transition-all text-left ${activeTab === section.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10'
                      : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className={`mt-0.5 ${activeTab === section.id ? 'text-white' : 'text-purple-600'}`}>
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight">{section.label}</h3>
                    <p className={`text-[10px] leading-normal font-medium mt-0.5 ${activeTab === section.id ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                      {section.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Pane Column */}
          <div className="lg:col-span-8 bg-white rounded-[24px] border border-gray-100/80 p-6 md:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >

                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <form onSubmit={handleSavePersonal} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-gray-950 mb-1">Personal Details</h2>
                      <p className="text-xs text-gray-500 font-medium">Keep your core profile details up to date</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                          type="text"
                          value={personalForm.name}
                          onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          placeholder="Your Name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                          type="email"
                          value={personalForm.email}
                          disabled
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed select-none"
                          placeholder="Email"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                        <input
                          type="text"
                          value={personalForm.phone}
                          onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={personalSaving}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/15 flex items-center justify-center gap-2"
                    >
                      {personalSaving && <Loader2 size={14} className="animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </form>
                )}

                {/* Login & Security Tab */}
                {activeTab === 'security' && (
                  <form onSubmit={handleSaveSecurity} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-gray-950 mb-1">Login & Security</h2>
                      <p className="text-xs text-gray-500 font-medium">Manage your security credentials</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Current Password</label>
                        <input
                          type="password"
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">New Password</label>
                        <input
                          type="password"
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={securitySaving}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/15 flex items-center justify-center gap-2"
                    >
                      {securitySaving && <Loader2 size={14} className="animate-spin" />}
                      <span>Update Password</span>
                    </button>
                  </form>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <form onSubmit={handleSaveNotifications} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-gray-950 mb-1">Notification Preferences</h2>
                      <p className="text-xs text-gray-500 font-medium">Choose what updates you want to receive and where</p>
                    </div>

                    <div className="divide-y divide-gray-100">
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-950">New Listings Alerts</h4>
                          <p className="text-[10px] text-gray-500">Get notified when new cars matching your favorites are posted</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.newListings}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newListings: e.target.checked })}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-950">Price Drops Alerts</h4>
                          <p className="text-[10px] text-gray-500">Receive alerts when cars on your wishlist drop in price</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.priceDrops}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, priceDrops: e.target.checked })}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-950">Evaluation Schedules</h4>
                          <p className="text-[10px] text-gray-500">Get notifications for active valuation appointments & sell requests</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.schedules}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, schedules: e.target.checked })}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-950">Monthly Marketplace Digest</h4>
                          <p className="text-[10px] text-gray-500">Receive our monthly market report on trending cars and prices</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.digest}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, digest: e.target.checked })}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={notificationsSaving}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/15 flex items-center justify-center gap-2"
                    >
                      {notificationsSaving && <Loader2 size={14} className="animate-spin" />}
                      <span>Save Preferences</span>
                    </button>
                  </form>
                )}

                {/* Requirements Tab */}
                {activeTab === 'requirements' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-gray-950 mb-1">My Requirements & Bookings</h2>
                      <p className="text-xs text-gray-500 font-medium">
                        {requirementsLoading
                          ? 'Loading valuation requests...'
                          : requirements.length === 0
                            ? 'No valuation requests booked yet'
                            : `You have ${requirements.length} valuation request${requirements.length !== 1 ? 's' : ''} active`}
                      </p>
                    </div>

                    {requirementsLoading ? (
                      <div className="space-y-4 animate-pulse">
                        {[1, 2].map((i) => (
                          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                              <div className="space-y-2">
                                <div className="h-3.5 bg-gray-100 rounded w-24" />
                                <div className="h-5 bg-gray-200 rounded w-48" />
                              </div>
                              <div className="h-7 bg-gray-200 rounded-full w-20" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                              {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="space-y-2">
                                  <div className="h-3 bg-gray-100 rounded w-16" />
                                  <div className="h-4.5 bg-gray-200 rounded w-28" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : requirements.length === 0 ? (
                      <div className="bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Car size={32} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">No Valuation Request Booked</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                          Want to sell your car? Get an instant valuation slot scheduled at your convenience.
                        </p>
                        <Link
                          to="/sell"
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-600/15"
                        >
                          Book Valuation Now
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {requirements.map((req) => {
                          const statusColors = {
                            pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
                            confirmed: 'bg-green-50 text-green-700 border-green-200/60',
                            completed: 'bg-blue-50 text-blue-700 border-blue-200/60',
                            cancelled: 'bg-red-50 text-red-700 border-red-200/60'
                          };

                          return (
                            <motion.div
                              key={req._id}
                              whileHover={{ y: -2, scale: 1.005 }}
                              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-200/60 transition-all duration-300"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-50">
                                <div>
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                      Booking ID
                                    </span>
                                    <span className="text-xs font-black text-gray-800 tracking-tight">
                                      #{req.bookingId || req._id.substring(req._id.length - 8).toUpperCase()}
                                    </span>
                                  </div>
                                  <h3 className="text-base font-black text-gray-950 mt-1">
                                    {req.brand} {req.model}
                                  </h3>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${statusColors[req.status] || 'bg-gray-50 text-gray-600'}`}>
                                  {req.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs font-medium text-gray-600">
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Year & Variant</span>
                                  <span className="text-gray-900 font-semibold">{req.year} • {req.variant}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">KMS & Owner</span>
                                  <span className="text-gray-900 font-semibold">{req.kms} • {req.owner}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Appointment</span>
                                  <span className="text-gray-900 font-semibold">{req.date} @ {req.timeSlot}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Location/Area</span>
                                  <span className="text-gray-900 font-semibold">{req.area}</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Shortlisted Cars Tab */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-black text-gray-950 mb-1">My Shortlisted Cars</h2>
                      <p className="text-xs text-gray-500 font-medium">
                        {wishlist.length === 0
                          ? 'No items saved to your shortlist'
                          : `You have ${wishlist.length} saved vehicle${wishlist.length !== 1 ? 's' : ''} in your shortlist`}
                      </p>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                        <Heart size={40} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-sm font-bold text-gray-900 mb-1">Your shortlist is empty</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                          Explore our collection and click the heart icon on any vehicle card to add it to your shortlist.
                        </p>
                        <Link
                          to="/cars"
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-600/15"
                        >
                          Explore Cars
                        </Link>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-6">
                        {wishlist.map((car) => (
                          <div key={car._id} className="relative group">
                            <CarCard
                              car={car}
                              onWishlist={() => handleWishlistToggle(car)}
                              isInWishlist={true}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
