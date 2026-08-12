import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sellAPI } from '../services/api';
import {
  ClipboardList, Search, Calendar, Phone, MapPin, Eye, MessageCircle,
  FileSpreadsheet, RefreshCw, X, ZoomIn, ZoomOut,
  Maximize2, Clock, CheckCircle2, AlertTriangle,
  BarChart3, FileText, Settings, TrendingUp, Menu, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import SidebarNav from '../components/SidebarNav';
import StatCard from '../components/StatCard';
import SkeletonTable from '../components/SkeletonTable';
import { showSuccessToast, showErrorToast } from '../utils/toastNotifications';

export default function AdminSellRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    purchased: 0,
    rejected: 0,
    todayRequests: 0
  });
  
  const [loading, setLoading] = useState(true);
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
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Modals & Previews State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [zoomImageIndex, setZoomImageIndex] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Keyboard navigation for image lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (zoomImageIndex === null || !selectedRequest?.images?.length) return;
      if (e.key === 'ArrowLeft') {
        setZoomImageIndex((prev) => (prev > 0 ? prev - 1 : selectedRequest.images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setZoomImageIndex((prev) => (prev < selectedRequest.images.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setZoomImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomImageIndex, selectedRequest]);

  // Handle request deletion
  const handleDeleteRequest = async (id) => {
    setDeletingId(id);
    try {
      const res = await sellAPI.deleteSchedule(id);
      if (res.data.success) {
        showSuccessToast('Sell request deleted successfully');
        // Remove from local list
        setRequests(prev => prev.filter(r => r._id !== id));
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(null);
        }
        // Refresh stats
        const statsRes = await sellAPI.getScheduleStats();
        if (statsRes.data.success) {
          setStats(statsRes.data.stats || {});
        }
      }
    } catch (err) {
      console.error('Failed to delete request:', err);
      showErrorToast(err?.response?.data?.message || 'Failed to delete request');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
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

  // List of popular brands for filtering
  const brandsList = ['Maruti', 'Hyundai', 'Honda', 'Toyota', 'Tata', 'Renault', 'Volkswagen', 'Ford', 'Skoda', 'Mahindra', 'BMW', 'Mercedes-Benz', 'Audi'];

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = {
        searchQuery,
        status: statusFilter,
        brand: brandFilter,
        startDate,
        endDate,
        minPrice,
        maxPrice,
        sort: sortOrder
      };
      
      const [requestsRes, statsRes] = await Promise.all([
        sellAPI.getSchedules(params),
        sellAPI.getScheduleStats()
      ]);

      if (requestsRes.data.success) {
        setRequests(requestsRes.data.requests || []);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to fetch admin sell requests data:', err);
      showErrorToast('Failed to load Sell Requests. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Sell Requests Admin | Vishnu Car Consulting';
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, brandFilter, startDate, endDate, minPrice, maxPrice, sortOrder]);

  const handleTabChange = (tabId) => {
    if (tabId === 'sell-requests') return;
    navigate(`/admin?tab=${tabId}`);
  };

  // Change request status
  const handleStatusUpdate = async (requestId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await sellAPI.updateScheduleStatus(requestId, newStatus);
      if (res.data.success) {
        showSuccessToast(`Status successfully updated to ${newStatus}`);
        
        // Update local requests list
        setRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: newStatus } : r));
        
        // Update selected request in details view
        if (selectedRequest && selectedRequest._id === requestId) {
          setSelectedRequest(prev => ({ ...prev, status: newStatus }));
        }

        // Re-fetch stats
        const statsRes = await sellAPI.getScheduleStats();
        if (statsRes.data.success) {
          setStats(statsRes.data.stats || {});
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showErrorToast('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export to CSV Function
  const exportToCSV = () => {
    if (requests.length === 0) {
      showErrorToast('No requests available to export');
      return;
    }

    const headers = [
      'Request ID', 'Customer Name', 'Phone', 'Email', 'Brand', 'Model', 
      'Variant', 'Year', 'Fuel Type', 'Transmission', 'KMs Driven', 
      'Ownership', 'Expected Price (INR)', 'City', 'Status', 'Submission Date'
    ];

    const csvRows = [headers.join(',')];

    for (const r of requests) {
      const row = [
        r.requestId || r.bookingId || '',
        `"${(r.ownerName || r.name || '').replace(/"/g, '""')}"`,
        r.phone || '',
        r.email || '',
        r.brand || '',
        r.model || '',
        r.variant || '',
        r.year || '',
        r.fuelType || '',
        r.transmission || 'Manual',
        r.kmDriven || r.kms || '',
        r.ownership || r.owner || '',
        r.expectedPrice || '',
        `"${(r.registrationCity || r.area || '').replace(/"/g, '""')}"`,
        r.status || 'Pending',
        new Date(r.createdAt).toLocaleDateString('en-IN')
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CarConsult_SellRequests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessToast('CSV Exported Successfully!');
  };

  // Get color badges for statuses
  const getStatusBadge = (status) => {
    const base = "px-3 py-1 text-xs font-bold rounded-full border shadow-sm flex items-center gap-1.5 w-fit ";
    switch (status) {
      case 'Pending':
        return base + "bg-amber-50 text-amber-700 border-amber-200";
      case 'Under Review':
        return base + "bg-blue-50 text-blue-700 border-blue-200";
      case 'Inspection Scheduled':
        return base + "bg-purple-50 text-purple-700 border-purple-200";
      case 'Offer Sent':
        return base + "bg-cyan-50 text-cyan-700 border-cyan-200";
      case 'Purchased':
        return base + "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'Rejected':
        return base + "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return base + "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Format currency
  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  // Zoom controls
  const handleZoom = (direction) => {
    if (direction === 'in') {
      setZoomScale(prev => Math.min(prev + 0.25, 3));
    } else {
      setZoomScale(prev => Math.max(prev - 0.25, 0.75));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 overflow-x-hidden relative">
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

      {/* Sidebar Panel */}
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

          <SidebarNav
            navItems={navItems}
            activeTab="sell-requests"
            onTabChange={(tabId) => {
              handleTabChange(tabId);
              if (!isDesktop) setSidebarOpen(false); // Close drawer on selection
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

      {/* Main Page Layout */}
      <div className="flex-1 w-full flex flex-col min-h-screen overflow-x-hidden min-w-0">
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 h-auto min-h-[78px] py-4 flex items-center px-4 md:px-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-150 rounded-xl transition lg:hidden text-gray-600 flex-shrink-0"
              >
                <Menu size={22} />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                  <ClipboardList className="text-purple-600 flex-shrink-0" size={24} /> Scheduled Consulting
                </h1>
                <p className="hidden sm:block text-sm text-gray-500 font-semibold">Track, inspect, and purchase customer vehicles.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto w-full sm:w-auto justify-end">
              <button
                onClick={exportToCSV}
                className="bg-purple-50 hover:bg-purple-100/80 text-purple-700 px-4 py-2.5 rounded-xl font-bold border border-purple-200 inline-flex items-center gap-2 shadow-sm transition duration-200 text-xs sm:text-sm whitespace-nowrap"
              >
                <FileSpreadsheet size={16} />
                Export CSV
              </button>
              <button
                onClick={fetchData}
                className="p-2.5 bg-gray-100 hover:bg-gray-150 border border-gray-200 text-gray-600 rounded-xl transition duration-200 flex-shrink-0"
                title="Refresh Table Data"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-8 space-y-6 max-w-[1500px] w-full mx-auto">
          {/* Summary Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            <StatCard
              label="PENDING EVALUATION"
              value={stats.pending || 0}
              change="Awaiting Initial Review"
              icon={Clock}
              trend="up"
              className="bg-white border-l-4 border-l-amber-500"
            />
            <StatCard
              label="TODAY'S REQUESTS"
              value={stats.todayRequests || 0}
              change="New Listings Submitted"
              icon={Calendar}
              trend="up"
              className="bg-white border-l-4 border-l-purple-500"
            />
            <StatCard
              label="VEHICLES PURCHASED"
              value={stats.purchased || 0}
              change="Successfully Closed Deals"
              icon={CheckCircle2}
              trend="up"
              className="bg-white border-l-4 border-l-emerald-500"
            />
            <StatCard
              label="REQUESTS REJECTED"
              value={stats.rejected || 0}
              change="Declined / Archived"
              icon={X}
              trend="down"
              className="bg-white border-l-4 border-l-rose-500"
            />
            <StatCard
              label="TOTAL REQUESTS"
              value={stats.totalRequests || 0}
              change="All-time Submissions"
              icon={ClipboardList}
              trend="neutral"
              className="bg-white border-l-4 border-l-purple-700"
            />
          </div>

          {/* Filter, Search, and Sort Panel */}
          <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Text Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Request ID, customer, phone, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 transition-all font-semibold"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-[14px] font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-100/50 text-sm cursor-pointer shadow-sm hover:border-purple-300 transition"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Inspection Scheduled">Inspection Scheduled</option>
                  <option value="Offer Sent">Offer Sent</option>
                  <option value="Purchased">Purchased</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Brand Filter */}
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-[14px] font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-100/50 text-sm cursor-pointer shadow-sm hover:border-purple-300 transition"
                >
                  <option value="all">All Brands</option>
                  {brandsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                {/* Sort Order Selector */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-[14px] font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-100/50 text-sm cursor-pointer shadow-sm hover:border-purple-300 transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest_price">Highest Price</option>
                  <option value="lowest_price">Lowest Price</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Expandable Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Submitted Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-[12px] text-sm focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Submitted End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-[12px] text-sm focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-[12px] text-sm focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-[12px] text-sm focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Sell Requests Table */}
          <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden">
            {loading ? (
              <SkeletonTable rows={6} columns={6} />
            ) : requests.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center bg-white p-8 text-center">
                <div className="w-16 h-16 bg-purple-55 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList size={30} />
                </div>
                <p className="text-gray-900 font-black text-xl mb-1">No Sell Requests Found</p>
                <p className="text-gray-400 font-semibold text-sm max-w-sm">
                  Try clearing your search term, modifying your filtering criteria, or refreshing the dashboard.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[600px] select-none">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-50 z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thumbnail</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Request ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expected Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req, idx) => {
                      const firstImage = req.images && req.images.length > 0 ? req.images[0].url : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=150';
                      return (
                        <motion.tr
                          key={req._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-gray-150 hover:bg-purple-50/10 transition duration-150"
                        >
                          {/* Thumbnail */}
                          <td className="px-6 py-4">
                            <div className="w-[64px] h-[48px] rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-100 flex-shrink-0">
                              <img src={firstImage} alt="Car Preview" className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          </td>

                          {/* Request ID */}
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                              {req.requestId || req.bookingId}
                            </span>
                          </td>

                          {/* Customer Name */}
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900 block">{req.ownerName || req.name}</span>
                            <span className="text-xs text-gray-400 font-semibold">{req.email || 'No email provided'}</span>
                          </td>

                          {/* Phone */}
                          <td className="px-6 py-4 font-semibold text-gray-700">
                            {req.phone}
                          </td>

                          {/* Vehicle */}
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-800 block">{req.brand} {req.model}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                              {req.year} • {req.variant} • {req.kmDriven || req.kms}
                            </span>
                          </td>

                          {/* Expected Price */}
                          <td className="px-6 py-4">
                            <span className="font-black text-gray-900">{formatPrice(req.expectedPrice || 500000)}</span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            <div className={getStatusBadge(req.status)}>
                              {req.status}
                            </div>
                          </td>

                          {/* Created Date */}
                          <td className="px-6 py-4 font-medium text-gray-600 text-sm">
                            {new Date(req.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="px-3 py-1.5 border border-purple-200 text-purple-650 hover:bg-purple-600 hover:text-white rounded-xl font-bold text-sm shadow-sm transition duration-200 inline-flex items-center gap-1"
                              >
                                <Eye size={15} /> View
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(req._id)}
                                className="px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-600 hover:text-white rounded-xl font-bold text-sm shadow-sm transition duration-200 inline-flex items-center gap-1"
                              >
                                <Trash2 size={15} /> Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm font-semibold text-gray-500">
              <span>Showing {requests.length} sell request records</span>
            </div>
          </div>
        </div>
      </div>

      {/* REQUEST DETAIL DIALOG / MODAL */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25 }}
                className="relative bg-white border border-purple-100 rounded-[32px] max-w-[1000px] w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-10 flex flex-col"
              >
                {/* Modal Header */}
                <div className="px-4 sm:px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-black text-purple-650 bg-purple-50 border border-purple-100 px-3.5 py-1.5 rounded-xl shadow-sm">
                      {selectedRequest.requestId || selectedRequest.bookingId}
                    </span>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Sell Request Details</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Submitted on {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-2 hover:bg-gray-200 text-gray-500 rounded-xl transition duration-150"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Content Grid */}
                <div className="px-4 sm:px-8 py-6 overflow-y-auto max-h-[60vh] space-y-8 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-100 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-200">
                  
                  {/* Status Timeline Progress */}
                  <div className="bg-purple-50/20 border border-purple-100/60 rounded-3xl p-5 shadow-inner">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Clock size={15} className="text-purple-600" /> Status Timeline
                    </h4>
                    <div className="relative flex items-center justify-between w-full mt-2 select-none px-4">
                      {/* Gray Line */}
                      <div className="absolute left-[8%] right-[8%] top-[12px] h-[2px] bg-gray-200 -translate-y-1/2 z-0" />
                      
                      {/* Color Progress Line */}
                      <div 
                        className="absolute left-[8%] top-[12px] h-[2px] bg-purple-600 -translate-y-1/2 transition-all duration-[400ms] z-0"
                        style={{
                          width: selectedRequest.status === 'Pending' ? '0%' :
                                 selectedRequest.status === 'Under Review' ? '25%' :
                                 selectedRequest.status === 'Inspection Scheduled' ? '50%' :
                                 selectedRequest.status === 'Offer Sent' ? '75%' : '100%'
                        }}
                      />

                      {[
                        { label: 'Pending', active: true },
                        { label: 'Under Review', active: ['Under Review', 'Inspection Scheduled', 'Offer Sent', 'Purchased', 'Rejected'].includes(selectedRequest.status) },
                        { label: 'Inspection Scheduled', active: ['Inspection Scheduled', 'Offer Sent', 'Purchased', 'Rejected'].includes(selectedRequest.status) },
                        { label: 'Offer Sent', active: ['Offer Sent', 'Purchased', 'Rejected'].includes(selectedRequest.status) },
                        { label: selectedRequest.status === 'Rejected' ? 'Rejected' : 'Purchased', active: ['Purchased', 'Rejected'].includes(selectedRequest.status), final: true }
                      ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 z-10">
                          <div className={`w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                            step.active 
                              ? selectedRequest.status === 'Rejected' && step.final
                                ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20'
                                : 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            {step.active ? '✓' : idx + 1}
                          </div>
                          <span className={`hidden sm:block text-[10px] sm:text-xs font-black tracking-tight text-center ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer, Vehicle, Registration Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer details */}
                    <div className="bg-white border border-gray-150 rounded-[20px] p-5 space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone size={15} className="text-purple-600" /> Customer Details</h4>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                        <p className="font-bold text-gray-800 text-base">{selectedRequest.ownerName || selectedRequest.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                        <p className="font-bold text-gray-800 text-sm">{selectedRequest.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                        <p className="font-bold text-gray-800 text-sm break-all">{selectedRequest.email || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Vehicle details */}
                    <div className="bg-white border border-gray-150 rounded-[20px] p-5 space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><ClipboardList size={15} className="text-purple-600" /> Vehicle Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Brand</p>
                          <p className="font-bold text-gray-800">{selectedRequest.brand}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Model</p>
                          <p className="font-bold text-gray-800">{selectedRequest.model}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Year</p>
                          <p className="font-bold text-gray-800">{selectedRequest.year}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Fuel Type</p>
                          <p className="font-bold text-gray-800">{selectedRequest.fuelType || selectedRequest.variant}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Transmission</p>
                          <p className="font-bold text-gray-800">{selectedRequest.transmission || 'Manual'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">KMs Driven</p>
                          <p className="font-bold text-gray-800">{selectedRequest.kmDriven || selectedRequest.kms}</p>
                        </div>
                      </div>
                    </div>

                    {/* Registration, Pricing, Condition */}
                    <div className="bg-white border border-gray-150 rounded-[20px] p-5 space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin size={15} className="text-purple-600" /> Registration & Valuation</h4>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Location (City, State)</p>
                        <p className="font-bold text-gray-800 text-sm">
                          {selectedRequest.registrationCity || selectedRequest.area}, {selectedRequest.registrationState || 'Karnataka'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Ownership</p>
                        <p className="font-bold text-gray-800 text-sm">{selectedRequest.ownership || selectedRequest.owner}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Expected Price</p>
                        <p className="font-black text-purple-700 text-base">{formatPrice(selectedRequest.expectedPrice || 500000)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Additional Comments/Description */}
                  <div className="bg-gray-50/50 border border-gray-150 rounded-[20px] p-5">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Description / Additional Notes</h4>
                    <p className="text-sm font-semibold text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedRequest.description || "No description or comments provided by the customer."}
                    </p>
                  </div>

                  {/* Responsive Lightbox Image Gallery */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Maximize2 size={15} className="text-purple-600" /> Vehicle Images Gallery ({selectedRequest.images?.length || 0})
                    </h4>
                    {selectedRequest.images && selectedRequest.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedRequest.images.map((img, idx) => (
                          <motion.div
                            key={img._id || idx}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                              setZoomImageIndex(idx);
                              setZoomScale(1);
                            }}
                            className="relative group rounded-2xl overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-50 cursor-pointer shadow-sm"
                          >
                            <img src={img.url} alt={`Car ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-black bg-purple-600/90 border border-purple-400 px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
                                <Maximize2 size={12} /> Preview
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 right-2.5 bg-black/55 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              {idx + 1}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[20px] p-8 text-center">
                        <AlertTriangle className="text-amber-500 mx-auto mb-2" size={32} />
                        <p className="text-sm font-bold text-gray-500">No images uploaded for this evaluation request.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="px-4 sm:px-8 py-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Status Dropdown Selection */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-bold text-gray-500 whitespace-nowrap">Change Status:</label>
                    <select
                      value={selectedRequest.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusUpdate(selectedRequest._id, e.target.value)}
                      className="px-4 py-2 border border-gray-250 rounded-[14px] font-bold text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-purple-100/50 text-sm shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Inspection Scheduled">Inspection Scheduled</option>
                      <option value="Offer Sent">Offer Sent</option>
                      <option value="Purchased">Purchased</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Dealer WhatsApp Click-to-Chat Button & Close */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <a
                      href={`https://wa.me/91${selectedRequest.phone}?text=${encodeURIComponent(
                        `Hi ${selectedRequest.ownerName || selectedRequest.name}\n\nWe received your Sell Car request.\n\nRequest ID:\n${selectedRequest.requestId || selectedRequest.bookingId}\n\nOur executive will contact you shortly.\n\nThank you.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20ba56] text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow transition duration-200 text-sm border border-green-500 w-full sm:w-auto"
                    >
                      <MessageCircle size={18} className="fill-current" />
                      Chat on WhatsApp
                    </a>
                    
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="bg-white border border-gray-250 hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm transition duration-200 w-full sm:w-auto"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL LIGHTBOX IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {zoomImageIndex !== null && selectedRequest?.images?.[zoomImageIndex] && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomImageIndex(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full h-[85vh] flex flex-col items-center justify-between z-10 select-none"
            >
              {/* Zoom Buttons Bar */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <button
                  onClick={() => handleZoom('in')}
                  className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl transition border border-white/10"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl transition border border-white/10"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => setZoomImageIndex(null)}
                  className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition border border-rose-500 ml-2"
                  title="Close Image"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Controls */}
              {selectedRequest.images.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomImageIndex(prev => prev > 0 ? prev - 1 : selectedRequest.images.length - 1);
                      setZoomScale(1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/85 text-white rounded-full transition border border-white/10 z-20"
                    title="Previous Image"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomImageIndex(prev => prev < selectedRequest.images.length - 1 ? prev + 1 : 0);
                      setZoomScale(1);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/85 text-white rounded-full transition border border-white/10 z-20"
                    title="Next Image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Box Image container */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden p-8 mt-12 mb-8">
                <motion.img
                  key={zoomImageIndex}
                  src={selectedRequest.images[zoomImageIndex].url}
                  alt={`Zoomed Vehicle ${zoomImageIndex + 1}`}
                  animate={{ scale: zoomScale }}
                  transition={{ duration: 0.15 }}
                  className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-2xl bg-black/20"
                  loading="lazy"
                />
              </div>

              {/* Image Counter Indicator */}
              <div className="bg-black/60 border border-white/10 px-4 py-2 rounded-full text-white text-xs font-bold mb-4 z-20">
                Image {zoomImageIndex + 1} of {selectedRequest.images.length}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white border border-gray-150 rounded-3xl max-w-md w-full shadow-2xl p-6 z-10 text-center"
              >
                <div className="w-14 h-14 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Delete Sell Request?</h3>
                <p className="text-sm text-gray-500 font-semibold mb-6">
                  Are you sure you want to delete this request? This action will permanently remove the record and all uploaded images from Cloudinary. This cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={deletingId !== null}
                    className="flex-1 py-3 border border-gray-250 text-gray-700 font-bold rounded-xl text-sm transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(deleteConfirmId)}
                    disabled={deletingId !== null}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-red-500/10 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {deletingId ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
