import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { carsAPI, sellAPI } from '../services/api';
import { Plus, Edit2, Trash2, BarChart3, FileText, Settings, TrendingUp, MessageCircle, Menu, X, Search, Calendar, Phone, MapPin, BookOpen, Bell, Lock, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import AdminCarForm from '../components/AdminCarForm';
import AdminCarList from '../components/AdminCarList';
import StatCard from '../components/StatCard';
import InventoryTableRow from '../components/InventoryTableRow';
import SidebarNav from '../components/SidebarNav';
import { formatPriceCompact } from '../utils/priceFormatter';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalCars: 0, activeListing: 0, bookedCars: 0, soldCars: 0, avgPrice: 0 });
  const [scheduleStats, setScheduleStats] = useState({ totalScheduled: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, notificationsSent: 0 });
  const [cars, setCars] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('all');
  
  // Settings state
  const [settingsTab, setSettingsTab] = useState('account');
  const [accountSettings, setAccountSettings] = useState({
    businessName: 'Vishnu Car Consulting',
    email: 'admin@vishnucar.com',
    phone: '+91-9876543210',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    whatsappNotifications: true,
    bookingAlerts: true,
    salesAlerts: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.accountSettings) setAccountSettings(parsed.accountSettings);
      if (parsed.notificationSettings) setNotificationSettings(parsed.notificationSettings);
      if (parsed.twoFactorEnabled !== undefined) setTwoFactorEnabled(parsed.twoFactorEnabled);
    }
  }, []);

  // Scroll to top on component mount and tab change
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [activeTab]);

  useEffect(() => {
    fetchStats();
    fetchCars();
    if (activeTab === 'schedules') {
      fetchSchedules();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchSchedules();
      fetchScheduleStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await carsAPI.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await carsAPI.getCars({ limit: 1000, admin: true });
      setCars(response.data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    setSchedulesLoading(true);
    try {
      const params = {
        limit: 100,
        searchQuery: scheduleSearchQuery,
      };
      if (scheduleStatusFilter !== 'all') {
        params.status = scheduleStatusFilter;
      }
      const response = await sellAPI.getSchedules(params);
      setSchedules(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      alert('Failed to fetch schedules. Please check your connection.');
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchScheduleStats = async () => {
    try {
      const response = await sellAPI.getScheduleStats();
      setScheduleStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching schedule stats:', error);
    }
  };

  const handleUpdateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      await sellAPI.updateScheduleStatus(scheduleId, newStatus);
      alert('Status updated successfully!');
      fetchSchedules();
      fetchScheduleStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      await carsAPI.deleteCar(carId);
      setCars(cars.filter((car) => car._id !== carId));
      fetchStats();
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Error deleting car');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCar(null);
  };

  const handleEditCar = async (carToEdit) => {
    try {
      // Fetch full car details (including all Base64 images) before opening the form
      const response = await carsAPI.getCarById(carToEdit._id);
      setEditingCar(response.data.car);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching car details:', error);
      alert('Error loading car details. Please check connection.');
      // Fallback to partial data if fetch fails
      setEditingCar(carToEdit);
      setShowForm(true);
    }
  };

  const handleFormSubmit = () => {
    handleFormClose();
    fetchCars();
    fetchStats();
  };

  // Settings Functions
  const handleSaveSettings = () => {
    const settingsToSave = {
      accountSettings,
      notificationSettings,
      twoFactorEnabled,
    };
    localStorage.setItem('adminSettings', JSON.stringify(settingsToSave));
    setEditMode(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleChangePassword = () => {
    setPasswordError('');
    
    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Simulate password change (in real app, send to backend)
    setPasswordSuccess('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess('');
    }, 2000);
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      // Enable 2FA
      setTwoFactorEnabled(true);
      localStorage.setItem('adminSettings', JSON.stringify({
        accountSettings,
        notificationSettings,
        twoFactorEnabled: true,
      }));
      alert('✓ Two-Factor Authentication enabled successfully!');
    } else {
      // Disable 2FA
      if (window.confirm('Are you sure you want to disable Two-Factor Authentication?')) {
        setTwoFactorEnabled(false);
        localStorage.setItem('adminSettings', JSON.stringify({
          accountSettings,
          notificationSettings,
          twoFactorEnabled: false,
        }));
        alert('✓ Two-Factor Authentication disabled');
      }
    }
  };

  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Dashboard' },
    { id: 'listings', icon: FileText, label: 'My Listings' },
    { id: 'schedules', icon: Calendar, label: 'Scheduled Consulting' },
    { id: 'sold', icon: TrendingUp, label: 'Sold Vehicles' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed md:static top-0 left-0 w-[280px] z-40 bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden"
      >
        <div className="p-6 flex flex-col">
          {/* Logo */}
          <div className="mb-8">
            <h3 className="text-xs tracking-widest uppercase font-bold text-purple-600">
              VCC Admin
            </h3>
          </div>

          {/* Navigation */}
          <SidebarNav 
            navItems={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sidebarOpen={true}
          />

          {/* Concierge Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-auto pt-6 border-t border-gray-200"
          >
            <h4 className="text-xs tracking-widest uppercase text-gray-500 font-semibold mb-3">CONCIERGE SUPPORT</h4>
            <p className="text-sm text-gray-600 mb-4">Need help with high-value transactions?</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-purple-100 hover:bg-purple-200 text-purple-600 border border-purple-300 rounded-xl py-2 text-sm font-semibold transition-all"
            >
              Contact Expert
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 h-[78px] flex items-center px-8">
          <div className="flex items-center justify-between gap-6 w-full">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all md:hidden"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{navItems.find(i => i.id === activeTab)?.label || 'Overview'}</h1>
                <p className="text-sm text-gray-500">Manage your vehicle listings and consultations.</p>
              </div>
            </div>

            {/* Center Search */}
            <div className="hidden md:flex flex-1 max-w-sm">
              <div className="relative w-full h-12 flex items-center">
                <Search size={18} className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'schedules' ? 'Search bookings...' : 'Search inventory...'}
                  value={activeTab === 'schedules' ? scheduleSearchQuery : searchQuery}
                  onChange={(e) => activeTab === 'schedules' ? setScheduleSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                  className="w-full h-full pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Right Section */}
            {activeTab !== 'schedules' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-12 rounded-xl font-semibold inline-flex items-center gap-2 shadow-md transition-all whitespace-nowrap"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add New Car</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Add Car Form */}
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFormClose}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition-colors"
                    >
                      ← Back to Dashboard
                    </motion.button>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingCar ? 'Edit Car' : 'Add New Car'}
                    </h2>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl"
                  >
                    <AdminCarForm
                      car={editingCar}
                      onClose={handleFormClose}
                      onSubmit={handleFormSubmit}
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Stats Grid */}
              {!showForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="TOTAL CARS"
                  value={stats.totalCars}
                  change="+12% vs last month"
                  icon={null}
                  trend="up"
                />
                <StatCard
                  label="ACTIVE LISTINGS"
                  value={stats.activeListing}
                  change="Live in showroom"
                  icon={null}
                  trend="up"
                />
                <StatCard
                  label="SOLD CARS"
                  value={stats.bookedCars}
                  change={`Avg Price: ${formatPriceCompact(stats.avgPrice)}`}
                  icon={null}
                  trend="up"
                />
                <StatCard
                  label="MESSAGES"
                  value={scheduleStats.pending || 0}
                  change="Pending bookings"
                  icon={MessageCircle}
                  trend="neutral"
                />
              </div>
              )}

              {/* Managed Inventory */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Managed Inventory</h2>
                      <p className="text-gray-500">Managing the world's most exclusive second-hand vehicles.</p>
                    </div>
                    <motion.a
                      whileHover={{ x: 4 }}
                      href="#"
                      className="text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                    >
                      View Complete Catalog <span>→</span>
                    </motion.a>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">VEHICLE</span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">PRICE</span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">LISTING DATE</span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">ACTIONS</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.filter(c => c.availability !== 'sold').slice(0, 8).map((car, i) => (
                        <InventoryTableRow
                          key={car._id}
                          car={car}
                          index={i}
                          onEdit={handleEditCar}
                          onDelete={handleDelete}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/20">
                  <p className="text-sm text-slate-400">Showing {Math.min(8, cars.length)} of {cars.length} vehicles</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pb-8"
            >
              {!showForm ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-6">Your Listings</h2>
                  </div>

                  <AdminCarList
                    cars={cars.filter(c => c.availability !== 'sold')}
                    loading={loading}
                    onEdit={handleEditCar}
                    onDelete={handleDelete}
                  />
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFormClose}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition-colors"
                    >
                      ← Back to Listings
                    </motion.button>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingCar ? 'Edit Car' : 'Add New Car'}
                    </h2>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl"
                  >
                    <AdminCarForm
                      car={editingCar}
                      onClose={handleFormClose}
                      onSubmit={handleFormSubmit}
                    />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Scheduled Consulting Tab */}
          {activeTab === 'schedules' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pb-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="TOTAL BOOKINGS"
                  value={scheduleStats.totalScheduled || 0}
                  change="All time"
                  trend="neutral"
                />
                <StatCard
                  label="PENDING"
                  value={scheduleStats.pending || 0}
                  change="Awaiting confirmation"
                  trend="up"
                />
                <StatCard
                  label="CONFIRMED"
                  value={scheduleStats.confirmed || 0}
                  change="Scheduled evaluations"
                  trend="up"
                />
                <StatCard
                  label="NOTIFICATIONS SENT"
                  value={scheduleStats.notificationsSent || 0}
                  change="WhatsApp messages"
                  trend="up"
                />
              </div>

              {/* Filter Section */}
              <div className="flex gap-4 flex-wrap">
                <select
                  value={scheduleStatusFilter}
                  onChange={(e) => {
                    setScheduleStatusFilter(e.target.value);
                    setScheduleSearchQuery('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={fetchSchedules}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Refresh
                </button>
              </div>

              {/* Schedules Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Car Evaluation Bookings</h2>
                </div>

                {/* Table */}
                {schedulesLoading ? (
                  <div className="min-h-[260px] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-gray-500 mt-4">Loading bookings...</p>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="min-h-[260px] flex flex-col items-center justify-center">
                    <BookOpen size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500">No bookings found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Car</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map((schedule, idx) => (
                          <motion.tr
                            key={schedule._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-5">
                              <div>
                                <p className="font-semibold text-gray-900">{schedule.name}</p>
                                <p className="text-xs text-gray-500">{schedule.area}</p>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-gray-900">
                                <Phone size={16} className="text-gray-400" />
                                {schedule.phone}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <p className="font-semibold text-gray-900">{schedule.brand} {schedule.model}</p>
                              <p className="text-xs text-gray-500">{schedule.year} • {schedule.variant}</p>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-gray-900">
                                <Calendar size={16} className="text-gray-400" />
                                {schedule.date} {schedule.timeSlot}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(schedule.status)}`}>
                                {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <select
                                value={schedule.status}
                                onChange={(e) => handleUpdateScheduleStatus(schedule._id, e.target.value)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">Showing {schedules.length} of {scheduleStats.totalScheduled || 0} bookings</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Sold Vehicles Tab */}
          {activeTab === 'sold' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pb-8"
            >
              {!showForm ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-6">Sold Vehicles</h2>
                  </div>

                  <AdminCarList
                    cars={cars.filter(c => c.availability === 'sold')}
                    loading={loading}
                    onEdit={handleEditCar}
                    onDelete={handleDelete}
                  />
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFormClose}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition-colors"
                    >
                      ← Back to Sold Vehicles
                    </motion.button>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingCar ? 'Edit Car' : 'Add New Car'}
                    </h2>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl"
                  >
                    <AdminCarForm
                      car={editingCar}
                      onClose={handleFormClose}
                      onSubmit={handleFormSubmit}
                    />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Settings Header */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Settings size={32} className="text-purple-600" />
                  <h2 className="text-3xl font-bold text-gray-900">Settings & Preferences</h2>
                </div>
                
                {/* Settings Tabs */}
                <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                  {[
                    { id: 'account', label: 'Account', icon: FileText },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'security', label: 'Security', icon: Lock },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                        settingsTab === tab.id
                          ? 'border-purple-600 text-purple-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Settings */}
              {settingsTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Account Information</h3>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    )}
                  </div>

                  {settingsSaved && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800 font-semibold"
                    >
                      <CheckCircle2 size={20} className="text-green-600" />
                      Settings saved successfully!
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={accountSettings.businessName}
                        onChange={(e) => setAccountSettings({...accountSettings, businessName: e.target.value})}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={accountSettings.email}
                        onChange={(e) => setAccountSettings({...accountSettings, email: e.target.value})}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={accountSettings.phone}
                        onChange={(e) => setAccountSettings({...accountSettings, phone: e.target.value})}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {editMode && (
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleSaveSettings}
                          className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Save size={18} /> Save Changes
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Notification Settings */}
              {settingsTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-4"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h3>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, emailNotifications: !notificationSettings.emailNotifications})}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        notificationSettings.emailNotifications
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {notificationSettings.emailNotifications ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* WhatsApp Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <MessageCircle size={20} className="text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">WhatsApp Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via WhatsApp</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, whatsappNotifications: !notificationSettings.whatsappNotifications})}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        notificationSettings.whatsappNotifications
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {notificationSettings.whatsappNotifications ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* Booking Alerts */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Booking Alerts</p>
                        <p className="text-sm text-gray-600">Get notified about new bookings</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, bookingAlerts: !notificationSettings.bookingAlerts})}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        notificationSettings.bookingAlerts
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {notificationSettings.bookingAlerts ? 'On' : 'Off'}
                    </button>
                  </div>

                  {/* Sales Alerts */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-orange-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Sales Alerts</p>
                        <p className="text-sm text-gray-600">Get notified about sales</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, salesAlerts: !notificationSettings.salesAlerts})}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        notificationSettings.salesAlerts
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {notificationSettings.salesAlerts ? 'On' : 'Off'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Security Settings */}
              {settingsTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-6"
                >
                  <h3 className="text-2xl font-bold text-gray-900">Security Settings</h3>

                  {/* Change Password */}
                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Lock size={20} className="text-red-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Change Password</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Update your password regularly to keep your account secure</p>
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Change Password
                    </button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        twoFactorEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <button 
                      onClick={handleToggle2FA}
                      className={`px-6 py-3 font-semibold rounded-lg transition-all text-white ${
                        twoFactorEnabled
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>

                  {/* Active Sessions */}
                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Current Device</p>
                          <p className="text-sm text-gray-600">Chrome • Windows • Last active: now</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Active</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Password Change Modal */}
              {showPasswordModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowPasswordModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200 shadow-xl"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h3>

                    {passwordError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-semibold mb-4"
                      >
                        {passwordError}
                      </motion.div>
                    )}

                    {passwordSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold mb-4"
                      >
                        {passwordSuccess}
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleChangePassword}
                        className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                      >
                        Update Password
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setPasswordError('');
                        }}
                        className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
