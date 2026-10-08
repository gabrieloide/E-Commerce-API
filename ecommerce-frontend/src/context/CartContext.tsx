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

    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Solo quedan ${product.stock} unidades disponibles en inventario.`, 'error');
          return prev;
        }
        showToast(`Se actualizó la cantidad de "${product.name}" en el carrito.`, 'success');
        return prev.map(item =>
          item.productId === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock) {
          showToast(`Solo quedan ${product.stock} unidades disponibles.`, 'error');
          return prev;
        }
        showToast(`"${product.name}" añadido al carrito.`, 'success');
        return [
          ...prev,
          {
            id: product.id,
            productId: product.id,
            product,
            quantity,
            price: product.price
          }
        ];
      }
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          if (quantity > item.product.stock) {
            showToast(`Máximo ${item.product.stock} unidades en stock.`, 'info');
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => {
      const item = prev.find(i => i.productId === productId);
      if (item) {
        showToast(`"${item.product.name}" eliminado del carrito.`, 'info');
      }
      return prev.filter(i => i.productId !== productId);
    });
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
