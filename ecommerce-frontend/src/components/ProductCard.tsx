import React from 'react';
import { ShoppingCart, Check, AlertTriangle, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, items } = useCart();
  const cartItem = items.find(i => i.productId === product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Category Tag & Stock Status */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-slate-100">
          {product.category}
        </span>

        {isOutOfStock ? (
          <span className="bg-rose-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            Agotado
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            ¡Solo {product.stock}!
          </span>
        ) : null}
      </div>

      {/* Product Image */}
      <div 
        onClick={() => onSelect(product)}
        className="relative w-full h-52 bg-slate-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback image if broken
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white text-slate-900 text-xs font-semibold py-1.5 px-3 rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Ver detalles
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onSelect(product)}
            className="font-bold text-slate-900 text-base leading-snug line-clamp-1 hover:text-indigo-600 transition cursor-pointer mb-1.5"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Precio</div>
            <div className="text-lg font-extrabold text-slate-900">
              ${product.price.toFixed(2)}
            </div>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : cartItem
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {cartItem ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>En carrito ({cartItem.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
