import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { carsAPI, sellAPI, testimonialsAPI } from '../services/api';
import { Plus, Edit2, Trash2, BarChart3, FileText, Settings, TrendingUp, MessageCircle, Menu, X, Search, Calendar, Phone, MapPin, BookOpen, Bell, Lock, Save, Eye, EyeOff, CheckCircle2, Star, Upload, Mail, Gauge, UserCheck, Clock, Compass, ClipboardList } from 'lucide-react';
import AdminCarForm from '../components/AdminCarForm';
import AdminCarList from '../components/AdminCarList';
import StatCard from '../components/StatCard';
import InventoryTableRow from '../components/InventoryTableRow';
import SidebarNav from '../components/SidebarNav';
import SkeletonTable from '../components/SkeletonTable';
import { formatPriceCompact } from '../utils/priceFormatter';
import { showSuccessToast, showErrorToast } from '../utils/toastNotifications';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ totalCars: 0, activeListing: 0, bookedCars: 0, soldCars: 0, avgPrice: 0 });
  const [scheduleStats, setScheduleStats] = useState({ totalScheduled: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, notificationsSent: 0 });
  const [cars, setCars] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) return tabParam;
    return 'overview';
  });
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialSearchQuery, setTestimonialSearchQuery] = useState('');
  const [testimonialStatusFilter, setTestimonialStatusFilter] = useState('all');
  const [testimonialPage, setTestimonialPage] = useState(1);
  const [testimonialTotalPages, setTestimonialTotalPages] = useState(1);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialFormData, setTestimonialFormData] = useState({
    customerName: '',
    city: '',
    review: '',
    carName: '',
    customerPhoto: '',
    carPhoto: '',
    rating: 5,
    status: 'active',
    displayOrder: 0
  });
  const [customerPhotoPreview, setCustomerPhotoPreview] = useState('');
  const [carPhotoPreview, setCarPhotoPreview] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);

  // Settings state
  const [settingsTab, setSettingsTab] = useState('account');
  const [accountSettings, setAccountSettings] = useState({
    businessName: 'Vishnu Car Consulting',
    email: 'admin@vishnucar.com',
    phone: '+91-9566728834',
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

  const fetchStats = async () => {
    try {
      const response = await carsAPI.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showErrorToast('Failed to load dashboard stats');
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await carsAPI.getCars({ limit: 1000, admin: true });
      setCars(response.data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      showErrorToast('Failed to load cars list');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const params = {
        page: testimonialPage,
        limit: 10,
        search: testimonialSearchQuery,
        status: testimonialStatusFilter
      };
      const response = await testimonialsAPI.getTestimonialsAdmin(params);
      setTestimonials(response.data.testimonials || []);
      setTestimonialTotalPages(response.data.pagination.totalPages || 1);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      showErrorToast('Failed to load testimonials');
    } finally {
      setTestimonialsLoading(false);
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
      showErrorToast('Failed to load schedules');
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
      showErrorToast('Failed to load schedule statistics');
    }
  };

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

  // Sync activeTab state when URL query parameter changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchSchedules();
      fetchScheduleStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, scheduleSearchQuery, scheduleStatusFilter]);

  useEffect(() => {
    if (activeTab === 'testimonials') {
      fetchTestimonials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, testimonialPage, testimonialSearchQuery, testimonialStatusFilter]);



  const handleOpenTestimonialForm = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setTestimonialFormData({
        customerName: testimonial.customerName,
        city: testimonial.city,
        review: testimonial.review,
        carName: testimonial.carName,
        customerPhoto: testimonial.customerPhoto,
        carPhoto: testimonial.carPhoto,
        rating: testimonial.rating,
        status: testimonial.status,
        displayOrder: testimonial.displayOrder
      });
      setCustomerPhotoPreview(testimonial.customerPhoto);
      setCarPhotoPreview(testimonial.carPhoto);
    } else {
      setEditingTestimonial(null);
      setTestimonialFormData({
        customerName: '',
        city: '',
        review: '',
        carName: '',
        customerPhoto: '',
        carPhoto: '',
        rating: 5,
        status: 'active',
        displayOrder: testimonials.length ? Math.max(...testimonials.map(t => t.displayOrder || 0)) + 1 : 1
      });
      setCustomerPhotoPreview('');
      setCarPhotoPreview('');
    }
    setShowTestimonialForm(true);
  };

  const handleTestimonialImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (field === 'customerPhoto') {
        setCustomerPhotoPreview(event.target.result);
        setTestimonialFormData(prev => ({ ...prev, customerPhoto: event.target.result }));
      } else if (field === 'carPhoto') {
        setCarPhotoPreview(event.target.result);
        setTestimonialFormData(prev => ({ ...prev, carPhoto: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    if (!testimonialFormData.customerName.trim()) {
      showErrorToast('Customer name is required');
      return;
    }
    if (!testimonialFormData.city.trim()) {
      showErrorToast('City is required');
      return;
    }
    if (!testimonialFormData.review.trim()) {
      showErrorToast('Review is required');
      return;
    }
    if (!testimonialFormData.carName.trim()) {
      showErrorToast('Purchased car name is required');
      return;
    }
    if (!testimonialFormData.customerPhoto) {
      showErrorToast('Customer photo is required');
      return;
    }
    if (!testimonialFormData.carPhoto) {
      showErrorToast('Car photo is required');
      return;
    }

    setSubmittingTestimonial(true);
    try {
      if (editingTestimonial) {
        await testimonialsAPI.updateTestimonial(editingTestimonial._id, testimonialFormData);
        showSuccessToast('Testimonial updated successfully!');
      } else {
        await testimonialsAPI.createTestimonial(testimonialFormData);
        showSuccessToast('Testimonial added successfully!');
      }
      setShowTestimonialForm(false);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      showErrorToast(error.response?.data?.message || 'Failed to save testimonial');
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const handleToggleTestimonialStatus = async (testimonial) => {
    const newStatus = testimonial.status === 'active' ? 'hidden' : 'active';
    try {
      await testimonialsAPI.updateTestimonial(testimonial._id, {
        ...testimonial,
        status: newStatus
      });
      showSuccessToast(`Testimonial is now ${newStatus}!`);
      setTestimonials(prev => prev.map(t => t._id === testimonial._id ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error toggling status:', error);
      showErrorToast('Failed to update status');
    }
  };

  const handleUpdateDisplayOrder = async (testimonial, order) => {
    try {
      const parsedOrder = parseInt(order);
      if (isNaN(parsedOrder)) return;
      await testimonialsAPI.updateTestimonial(testimonial._id, {
        ...testimonial,
        displayOrder: parsedOrder
      });
      showSuccessToast('Display order updated!');
      setTestimonials(prev => prev.map(t => t._id === testimonial._id ? { ...t, displayOrder: parsedOrder } : t).sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error('Error updating display order:', error);
      showErrorToast('Failed to update display order');
    }
  };

  const handleOpenDeleteConfirm = (testimonial) => {
    setTestimonialToDelete(testimonial);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteTestimonial = async () => {
    if (!testimonialToDelete) return;
    try {
      await testimonialsAPI.deleteTestimonial(testimonialToDelete._id);
      showSuccessToast('Testimonial deleted successfully');
      setShowDeleteConfirm(false);
      setTestimonialToDelete(null);
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      showErrorToast('Failed to delete testimonial');
    }
  };



  const handleUpdateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      await sellAPI.updateScheduleStatus(scheduleId, newStatus);
      showSuccessToast('Status updated successfully!');
      if (selectedSchedule && selectedSchedule._id === scheduleId) {
        setSelectedSchedule(prev => ({ ...prev, status: newStatus }));
      }
      fetchSchedules();
      fetchScheduleStats();
    } catch (error) {
      console.error('Error updating status:', error);
      showErrorToast('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      await carsAPI.deleteCar(carId);
      setCars(cars.filter((car) => car._id !== carId));
      showSuccessToast('Car deleted successfully');
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
    { id: 'sell-requests', icon: ClipboardList, label: 'Scheduled Consulting' },
    { id: 'sold', icon: TrendingUp, label: 'Sold Vehicles' },
    { id: 'testimonials', icon: MessageCircle, label: 'Testimonials' },
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
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
      {/* Backdrop for Mobile/Tablet */}
      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed top-16 sm:top-20 inset-x-0 bottom-0 bg-black/55 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen || isDesktop ? 0 : -300 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        className="fixed lg:static top-16 sm:top-20 lg:top-0 left-0 w-[280px] z-40 lg:z-auto bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] lg:h-auto lg:min-h-screen flex flex-col"
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
            onTabChange={(tabId) => {
              if (tabId === 'sell-requests') {
                navigate('/admin/sell-requests');
              } else {
                setActiveTab(tabId);
                navigate(`/admin?tab=${tabId}`);
              }
              if (!isDesktop) setSidebarOpen(false); // Close sidebar on mobile select
            }}
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
      <div className="flex-1 w-full flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 h-[78px] flex items-center px-4 md:px-8">
          <div className="flex items-center justify-between gap-6 w-full">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all lg:hidden text-gray-700"
              >
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
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
                  placeholder={
                    activeTab === 'schedules'
                      ? 'Search bookings...'
                      : activeTab === 'testimonials'
                        ? 'Search testimonials...'
                        : 'Search inventory...'
                  }
                  value={
                    activeTab === 'schedules'
                      ? scheduleSearchQuery
                      : activeTab === 'testimonials'
                        ? testimonialSearchQuery
                        : searchQuery
                  }
                  onChange={(e) => {
                    if (activeTab === 'schedules') {
                      setScheduleSearchQuery(e.target.value);
                    } else if (activeTab === 'testimonials') {
                      setTestimonialSearchQuery(e.target.value);
                      setTestimonialPage(1);
                    } else {
                      setSearchQuery(e.target.value);
                    }
                  }}
                  className="w-full h-full pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Right Section */}
            {activeTab !== 'schedules' && activeTab !== 'settings' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={
                  activeTab === 'testimonials'
                    ? () => handleOpenTestimonialForm(null)
                    : () => setShowForm(true)
                }
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-12 rounded-xl font-semibold inline-flex items-center gap-2 shadow-md transition-all whitespace-nowrap"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">
                  {activeTab === 'testimonials' ? 'Add Testimonial' : 'Add New Car'}
                </span>
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
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => setActiveTab('listings')}
                        className="text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-2 font-semibold"
                      >
                        View Complete Catalog <span>→</span>
                      </motion.button>
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
                    <SkeletonTable rows={4} columns={5} />
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
                                <p className="text-xs text-gray-500">
                                  {schedule.year} • {schedule.variant}
                                  {schedule.kms && ` • ${schedule.kms}`}
                                  {schedule.owner && ` • ${schedule.owner}`}
                                </p>
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
                                <div className="flex items-center gap-3">
                                  <select
                                    value={schedule.status}
                                    onChange={(e) => handleUpdateScheduleStatus(schedule._id, e.target.value)}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                  <button
                                    onClick={() => setSelectedSchedule(schedule)}
                                    className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                                    title="View Full Details"
                                  >
                                    <Eye size={18} />
                                  </button>
                                </div>
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

            {/* Testimonials Tab */}
            {activeTab === 'testimonials' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 pb-8"
              >
                {/* Stats / Overview Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    label="TOTAL TESTIMONIALS"
                    value={testimonials.length}
                    change="All reviews from customers"
                    icon={null}
                    trend="neutral"
                  />
                  <StatCard
                    label="ACTIVE STORIES"
                    value={testimonials.filter(t => t.status === 'active').length}
                    change="Displayed on homepage"
                    icon={null}
                    trend="up"
                  />
                  <StatCard
                    label="HIDDEN STORIES"
                    value={testimonials.filter(t => t.status === 'hidden').length}
                    change="Hidden from homepage"
                    icon={null}
                    trend="down"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-4 flex-wrap items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex gap-4 flex-wrap">
                    <select
                      value={testimonialStatusFilter}
                      onChange={(e) => {
                        setTestimonialStatusFilter(e.target.value);
                        setTestimonialPage(1);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>

                  <button
                    onClick={fetchTestimonials}
                    className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-sm hover:bg-purple-100 transition-colors font-medium"
                  >
                    Refresh Data
                  </button>
                </div>

                {/* Table / List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                  {testimonialsLoading ? (
                    <SkeletonTable rows={4} columns={5} />
                  ) : testimonials.length === 0 ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                      <MessageCircle size={48} className="text-gray-400 mb-4" />
                      <p className="text-gray-900 font-bold text-lg mb-1">No testimonials found</p>
                      <p className="text-gray-500 text-sm max-w-sm mb-4">Add your first testimonial to showcase customer love stories on the Home page.</p>
                      <button
                        onClick={() => handleOpenTestimonialForm(null)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      >
                        Create Testimonial
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <th className="px-6 py-4">Customer</th>
                              <th className="px-6 py-4">Review Details</th>
                              <th className="px-6 py-4">Car Details</th>
                              <th className="px-6 py-4">Rating</th>
                              <th className="px-6 py-4">Display Order</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {testimonials.map((test) => (
                              <tr key={test._id} className="hover:bg-gray-50 transition-colors text-sm text-gray-900">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={test.customerPhoto}
                                      alt={test.customerName}
                                      className="w-10 h-10 rounded-full object-cover border border-purple-100"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/150?text=Profile';
                                      }}
                                    />
                                    <div>
                                      <p className="font-semibold text-gray-950">{test.customerName}</p>
                                      <p className="text-xs text-gray-500">{test.city}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                  <p className="line-clamp-2 text-gray-600" title={test.review}>
                                    "{test.review}"
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={test.carPhoto}
                                      alt={test.carName}
                                      className="w-12 h-8 rounded object-cover border border-gray-100"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/150?text=Car';
                                      }}
                                    />
                                    <span className="font-medium text-gray-900">{test.carName}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-0.5 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={14}
                                        fill={i < test.rating ? 'currentColor' : 'none'}
                                        className={i < test.rating ? 'text-amber-500' : 'text-gray-300'}
                                      />
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <input
                                    type="number"
                                    value={test.displayOrder}
                                    onChange={(e) => handleUpdateDisplayOrder(test, e.target.value)}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleToggleTestimonialStatus(test)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold select-none transition-all ${test.status === 'active'
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                  >
                                    {test.status === 'active' ? 'Active' : 'Hidden'}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => handleOpenTestimonialForm(test)}
                                      className="text-purple-600 hover:text-purple-900 transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleOpenDeleteConfirm(test)}
                                      className="text-red-600 hover:text-red-900 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {testimonialTotalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                          <button
                            onClick={() => setTestimonialPage(prev => Math.max(prev - 1, 1))}
                            disabled={testimonialPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {testimonialPage} of {testimonialTotalPages}
                          </span>
                          <button
                            onClick={() => setTestimonialPage(prev => Math.min(prev + 1, testimonialTotalPages))}
                            disabled={testimonialPage === testimonialTotalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
                        className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${settingsTab === tab.id
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
                          onChange={(e) => setAccountSettings({ ...accountSettings, businessName: e.target.value })}
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
                          onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
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
                          onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
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
                        onClick={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${notificationSettings.emailNotifications
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
                        onClick={() => setNotificationSettings({ ...notificationSettings, whatsappNotifications: !notificationSettings.whatsappNotifications })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${notificationSettings.whatsappNotifications
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
                        onClick={() => setNotificationSettings({ ...notificationSettings, bookingAlerts: !notificationSettings.bookingAlerts })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${notificationSettings.bookingAlerts
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
                        onClick={() => setNotificationSettings({ ...notificationSettings, salesAlerts: !notificationSettings.salesAlerts })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${notificationSettings.salesAlerts
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
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${twoFactorEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <button
                        onClick={handleToggle2FA}
                        className={`px-6 py-3 font-semibold rounded-lg transition-all text-white ${twoFactorEnabled
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
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
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
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
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
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
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

      {/* Testimonial Add/Edit Form Modal */}
      {showTestimonialForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-950">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              <button
                onClick={() => setShowTestimonialForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleTestimonialSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm text-gray-900">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={testimonialFormData.customerName}
                  onChange={(e) => setTestimonialFormData({ ...testimonialFormData, customerName: e.target.value })}
                  placeholder="e.g. Devendra K."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">City *</label>
                <input
                  type="text"
                  required
                  value={testimonialFormData.city}
                  onChange={(e) => setTestimonialFormData({ ...testimonialFormData, city: e.target.value })}
                  placeholder="e.g. Pune"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Purchased Car Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Purchased Car Name *</label>
                <input
                  type="text"
                  required
                  value={testimonialFormData.carName}
                  onChange={(e) => setTestimonialFormData({ ...testimonialFormData, carName: e.target.value })}
                  placeholder="e.g. Porsche Panamera"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Review / Feedback */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Review/Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={testimonialFormData.review}
                  onChange={(e) => setTestimonialFormData({ ...testimonialFormData, review: e.target.value })}
                  placeholder="Write customer review text..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Star Rating & Display Order & Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Rating *</label>
                  <select
                    value={testimonialFormData.rating}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Display Order</label>
                  <input
                    type="number"
                    value={testimonialFormData.displayOrder}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Status</label>
                  <select
                    value={testimonialFormData.status}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              {/* Customer Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Customer Photo *</label>
                <div className="flex items-center gap-4">
                  {customerPhotoPreview ? (
                    <img
                      src={customerPhotoPreview}
                      alt="Customer Preview"
                      className="w-14 h-14 rounded-full object-cover border border-purple-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-400">
                      <Upload size={20} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTestimonialImageUpload(e, 'customerPhoto')}
                      className="hidden"
                      id="customer-photo-upload"
                    />
                    <label
                      htmlFor="customer-photo-upload"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload size={16} /> Choose Photo
                    </label>
                  </div>
                </div>
              </div>

              {/* Car Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Car Photo *</label>
                <div className="flex items-center gap-4">
                  {carPhotoPreview ? (
                    <img
                      src={carPhotoPreview}
                      alt="Car Preview"
                      className="w-20 h-14 rounded object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-14 rounded bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-400">
                      <Upload size={20} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTestimonialImageUpload(e, 'carPhoto')}
                      className="hidden"
                      id="car-photo-upload"
                    />
                    <label
                      htmlFor="car-photo-upload"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer inline-flex items-center gap-2"
                    >
                      <Upload size={16} /> Choose Photo
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submittingTestimonial}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {submittingTestimonial && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{editingTestimonial ? 'Save Changes' : 'Create Testimonial'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTestimonialForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Testimonial Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 text-center"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-950 mb-2">Delete Testimonial?</h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">
              Are you sure you want to delete this testimonial from <span className="font-semibold text-gray-950">{testimonialToDelete?.customerName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDeleteTestimonial}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTestimonialToDelete(null);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detailed Booking Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden text-gray-900"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 relative flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-200 uppercase tracking-widest font-bold">Booking Details</span>
                <h3 className="text-xl font-extrabold flex items-center gap-2 mt-1">
                  {selectedSchedule.bookingId || 'Evaluation Request'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Top Banner Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-500">Current Status:</span>
                  <span className={`px-3.5 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedSchedule.status)}`}>
                    {selectedSchedule.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-500">Update Status:</span>
                  <select
                    value={selectedSchedule.status}
                    onChange={(e) => handleUpdateScheduleStatus(selectedSchedule._id, e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Two Column Grid: Vehicle & Customer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Details */}
                <div className="p-5 border border-purple-100 bg-purple-50/40 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-purple-100 pb-2.5">
                    <Gauge size={18} className="text-purple-600" />
                    <h4 className="font-bold text-purple-950">Booked Vehicle Details</h4>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Brand:</span>
                      <span className="font-semibold text-gray-900">{selectedSchedule.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Model:</span>
                      <span className="font-semibold text-gray-900">{selectedSchedule.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Year:</span>
                      <span className="font-semibold text-gray-900">{selectedSchedule.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Fuel Variant:</span>
                      <span className="font-semibold text-gray-900">{selectedSchedule.variant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Kms Driven:</span>
                      <span className="font-semibold text-gray-900">{selectedSchedule.kms || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Owner History:</span>
                      <span className="font-semibold text-gray-900">{selectedSchedule.owner || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-5 border border-indigo-100 bg-indigo-50/30 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-indigo-100 pb-2.5">
                    <UserCheck size={18} className="text-indigo-600" />
                    <h4 className="font-bold text-indigo-950">Customer Information</h4>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Name:</span>
                      <span className="font-semibold text-gray-900">{selectedSchedule.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Phone:</span>
                      <a href={`tel:${selectedSchedule.phone}`} className="font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                        <Phone size={14} /> {selectedSchedule.phone}
                      </a>
                    </div>
                    {selectedSchedule.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Email:</span>
                        <a href={`mailto:${selectedSchedule.email}`} className="font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                          <Mail size={14} /> {selectedSchedule.email}
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Location/Area:</span>
                      <span className="font-semibold text-gray-900 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" /> {selectedSchedule.area}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consulting Appointment & WhatsApp Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appointment Schedule */}
                <div className="p-5 border border-gray-200 rounded-2xl bg-white space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                    <Clock size={18} className="text-gray-600" />
                    <h4 className="font-bold text-gray-800">Appointment Slot</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-semibold">{selectedSchedule.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time Slot:</span>
                      <span className="font-semibold">{selectedSchedule.timeSlot}</span>
                    </div>
                  </div>
                </div>

                {/* Notifications & System Info */}
                <div className="p-5 border border-gray-200 rounded-2xl bg-white space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                    <Compass size={18} className="text-gray-600" />
                    <h4 className="font-bold text-gray-800">System Logs</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">WhatsApp Alert:</span>
                      <span className={`font-semibold ${selectedSchedule.notificationSent ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedSchedule.notificationSent ? '✓ Sent Successfully' : 'Not Sent'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Request Created:</span>
                      <span className="font-semibold text-gray-500">
                        {new Date(selectedSchedule.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-150 flex justify-end gap-3">
              <a
                href={`https://wa.me/91${selectedSchedule.phone}?text=Hello%20${encodeURIComponent(selectedSchedule.name)},%20this%20is%20regarding%20your%20Vishnu%20Car%20Consulting%20evaluation%20booking%20${selectedSchedule.bookingId || ''}.`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                Chat on WhatsApp
              </a>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
