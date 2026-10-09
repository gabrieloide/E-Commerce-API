import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  totalAmount: number;
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = 'nexus_ecommerce_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      showToast('Este producto está agotado actualmente.', 'error');
      return;
    }

    const existing = items.find(item => item.productId === product.id);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        showToast(`Solo quedan ${product.stock} unidades disponibles en inventario.`, 'error');
        return;
      }
      setItems(prev =>
        prev.map(item =>
          item.productId === product.id ? { ...item, quantity: newQty } : item
        )
      );
      showToast(`Se actualizó la cantidad de "${product.name}" en el carrito.`, 'success');
    } else {
      if (quantity > product.stock) {
        showToast(`Solo quedan ${product.stock} unidades disponibles.`, 'error');
        return;
      }
      setItems(prev => [
        ...prev,
        {
          id: product.id,
          productId: product.id,
          product,
          quantity,
          price: product.price
        }
      ]);
      showToast(`"${product.name}" añadido al carrito.`, 'success');
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = items.find(i => i.productId === productId);
    if (item && quantity > item.product.stock) {
      showToast(`Máximo ${item.product.stock} unidades en stock.`, 'info');
      setItems(prev =>
        prev.map(i => i.productId === productId ? { ...i, quantity: item.product.stock } : i)
      );
      return;
    }

    setItems(prev =>
      prev.map(i => i.productId === productId ? { ...i, quantity } : i)
    );
  };

  const removeFromCart = (productId: number) => {
    const item = items.find(i => i.productId === productId);
    if (item) {
      showToast(`"${item.product.name}" eliminado del carrito.`, 'info');
    }
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = Number(
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        totalCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
