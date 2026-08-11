import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import RouteTransitionLoader from './components/RouteTransitionLoader';
import { LoadingProvider } from './context/loadingContext';
import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import Wishlist from './pages/Wishlist';
import SellCar from './pages/SellCar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import SellCarSuccess from './pages/SellCarSuccess';
import AdminSellRequests from './pages/AdminSellRequests';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import ProtectedRoute from './components/ProtectedRoute';
import { useCarsStore } from './context/store';
import './styles/globals.css';

function App() {
  const syncWishlist = useCarsStore((state) => state.syncWishlist);

  useEffect(() => {
    syncWishlist();
  }, [syncWishlist]);

  return (
    <ErrorBoundary>
      <LoadingProvider>
        <Router>
          <ScrollToTop />
          <RouteTransitionLoader />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/sell" element={<SellCar />} />
            <Route path="/sell/success" element={<SellCarSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sell-requests"
              element={
                <ProtectedRoute>
                  <AdminSellRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Admin/SellRequests"
              element={
                <ProtectedRoute>
                  <AdminSellRequests />
                </ProtectedRoute>
              }
            />
            <Route path="/500" element={<ServerError />} />
            <Route path="/server-error" element={<ServerError />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Router>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
