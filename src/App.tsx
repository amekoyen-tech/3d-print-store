import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { CartProvider, useCart } from './contexts/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { ShoppingCart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const FloatingCartButton: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  if (location.pathname.startsWith('/admin') || location.pathname === '/login') return null;

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
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
      <CartDrawer />
      <FloatingCartButton />
    </>
  );
};

import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
};

export default App;
