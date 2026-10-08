import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrdersView: React.FC<{ onGoToShop: () => void }> = ({ onGoToShop }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const all = await api.orders.getAll();
        // If logged in, filter to current user orders (or show all if admin/demo)
        setOrders(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-150">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Mis Compras & Pedidos
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Historial de compras registradas en el backend con estado de pago y entrega.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Cargando órdenes...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">Aún no tienes pedidos registrados</h3>
          <p className="text-xs text-slate-500 mb-6">
            Cuando completes una compra a través del checkout, aparecerá aquí con su estado y recibo.
          </p>
          <button
            onClick={onGoToShop}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition cursor-pointer"
          >
            Ir a Comprar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Destino: {order.shippingAddress.city}, {order.shippingAddress.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    order.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : order.status === 'Cancelled'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {order.status === 'Completed' ? '✓ Entregado' : order.status}
                  </span>

                  <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                    {order.paymentStatus === 'Paid' ? '💳 Pagado' : order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="pt-4 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-medium">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-bold text-slate-900">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total con envío e impuestos</span>
                <span className="text-base font-black text-indigo-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
