import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { CartProvider } from './store/CartContext';
import { AnimatePresence, motion } from 'framer-motion';

// Import Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import MenuPage from './pages/MenuPage';
import CustomPizzaBuilder from './pages/CustomPizzaBuilder';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import RealTimeTrackingPage from './pages/RealTimeTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import Layout Components
import Navbar from './components/Navbar';

// Create Toast Notification Context
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/auth" replace />;
};

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-dark-text">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute animate-ping h-20 w-20 rounded-full border border-primary/30 opacity-75"></div>
          <span className="text-6xl animate-bounce">🍕</span>
        </div>
        <h2 className="text-xl font-accent glow-text tracking-widest text-primary animate-pulse uppercase">Entering PizzaVerse...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text font-sans">
      <Navbar />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/menu" element={<MenuPage />} />
          
          {/* Protected Customer Routes */}
          <Route path="/builder" element={
            <ProtectedRoute>
              <CustomPizzaBuilder />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/order-success" element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          } />
          <Route path="/track-order/:id" element={
            <ProtectedRoute>
              <RealTimeTrackingPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          } />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  const [toasts, setToasts] = useState([]);

  // Trigger Toast Notification helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // 4 seconds duration
  };

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastContext.Provider value={{ showToast }}>
            <AppContent />
            
            {/* Elegant Floating Toast Center */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
              <AnimatePresence>
                {toasts.map((toast) => (
                  <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.85, x: 20, transition: { duration: 0.2 } }}
                    className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-glass border backdrop-blur-glass text-sm font-semibold tracking-wide ${
                      toast.type === 'error'
                        ? 'border-nonveg/30 bg-nonveg/10 text-nonveg-glow text-red-200 shadow-glow-red'
                        : toast.type === 'warning'
                        ? 'border-primary/30 bg-primary/10 text-orange-200 shadow-glow'
                        : 'border-veg/30 bg-veg/10 text-veg-glow text-green-200 shadow-glow-green'
                    }`}
                  >
                    <span>{toast.type === 'error' ? '⚠️' : toast.type === 'warning' ? '⚡' : '🍕'}</span>
                    <span>{toast.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ToastContext.Provider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
