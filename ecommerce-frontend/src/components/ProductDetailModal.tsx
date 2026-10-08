import React, { useState } from 'react';
import { X, ShoppingCart, Check, ShieldCheck, Truck, RotateCcw, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, items } = useCart();

  if (!product) return null;

  const cartItem = items.find(i => i.productId === product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row max-h-[90vh] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="text-xs text-indigo-600 font-semibold tracking-wider uppercase mb-1">
              ID #{product.id}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-black text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">Impuestos incluidos</span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Inventory Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-2.5 rounded-xl text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Producto agotado actualmente</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-medium">Inventario disponible:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md shadow-xs">
                    {product.stock} unidades
                  </span>
                </div>
              )}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 mb-6">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                <Truck className="w-4 h-4 text-indigo-500 mb-1" />
                <span>Envío Rápido</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                <span>Pago Seguro</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-blue-500 mb-1" />
                <span>Garantía 30d</span>
              </div>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="pt-4 border-t border-slate-100">
            {!isOutOfStock && (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium text-slate-600">Cantidad:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              }`}
            >
              {cartItem ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Actualizar Carrito (+{quantity})</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Añadir al Carrito (${(product.price * quantity).toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
