import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Stations from './pages/Stations';
import StationDetail from './pages/StationDetail';
import MapView from './pages/MapView';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Bookings from './pages/dashboard/Bookings';
import BillingHistory from './pages/dashboard/BillingHistory';
import Profile from './pages/dashboard/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', background: '#1f2937', color: '#fff' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Auth routes - no navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Public routes with Navbar */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/stations" element={<PublicLayout><Stations /></PublicLayout>} />
            <Route path="/stations/:id" element={<PublicLayout><StationDetail /></PublicLayout>} />
            <Route path="/map" element={<PublicLayout><MapView /></PublicLayout>} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<PublicLayout><Dashboard /></PublicLayout>} />
              <Route path="/dashboard/bookings" element={<PublicLayout><Bookings /></PublicLayout>} />
              <Route path="/dashboard/billing" element={<PublicLayout><BillingHistory /></PublicLayout>} />
              <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
            </Route>

            {/* Admin only routes */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin" element={<PublicLayout><AdminDashboard /></PublicLayout>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
