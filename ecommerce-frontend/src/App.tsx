import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppContent } from './AppContent';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
