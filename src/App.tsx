import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Lazy load route components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
import { CartProvider, useCart } from './contexts/CartContext';
import { DialogProvider } from './contexts/DialogContext';
import { FontSizeProvider } from './contexts/FontSizeContext';
import { CartDrawer } from './components/CartDrawer';
import FontSizeController from './components/FontSizeController';
import { ShoppingCart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Loading screen component for lazy-loaded routes
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60 text-sm tracking-wider uppercase">載入中...</p>
      </div>
    </div>
  );
};

const FloatingCartButton: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  // 隱藏條件：管理頁面、登入頁面、或購物車為空
  if (location.pathname.startsWith('/admin') || location.pathname === '/login' || totalItems === 0) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-[#FF5722] text-black rounded-full shadow-[0_10px_30px_rgba(255,87,34,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingCart size={28} className="group-hover:rotate-12 transition-transform" />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span 
            key={totalItems}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-black border-2 border-[#FF5722] text-white rounded-full flex items-center justify-center font-bold text-xs"
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const AppContent: React.FC = () => {
  const isEmulator = import.meta.env.VITE_USE_EMULATORS === 'true';

  return (
    <>
      {isEmulator && (
          <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-[10px] font-black py-1 px-4 text-center uppercase tracking-[0.3em] shadow-lg animate-pulse">
              ⚠️ SIMULATION MODE: Connected to Local Emulator Suite (Safe for Testing)
          </div>
      )}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminPage />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <CartDrawer />
      <FloatingCartButton />
      <FontSizeController />
    </>
  );
};

import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <FontSizeProvider>
        <DialogProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </DialogProvider>
      </FontSizeProvider>
    </ErrorBoundary>
  );
};

export default App;
