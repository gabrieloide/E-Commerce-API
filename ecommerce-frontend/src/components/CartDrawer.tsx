import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const { 
    items, 
    totalAmount, 
    totalCount, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Carrito de Compras</h2>
                <p className="text-xs text-slate-400">
                  {totalCount} {totalCount === 1 ? 'producto' : 'productos'} en total
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">Tu carrito está vacío</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explora nuestro catálogo y agrega los productos que deseas adquirir.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.productId} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-400">
                      ${item.product.price.toFixed(2)} c/u
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm font-extrabold text-slate-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Summary and Checkout button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Envío estimado</span>
                  <span className="font-semibold text-emerald-600">Gratis</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Impuestos (IVA)</span>
                  <span className="font-semibold text-slate-800">$0.00</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Total a Pagar</span>
                  <span className="text-indigo-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onOpenCheckout();
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <span>Proceder al Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <button
                    onClick={clearCart}
                    className="hover:text-rose-600 transition underline cursor-pointer"
                  >
                    Vaciar carrito
                  </button>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Pago encriptado con Stripe
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
