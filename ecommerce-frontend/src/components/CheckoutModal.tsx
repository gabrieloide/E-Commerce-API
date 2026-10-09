import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Truck, 
  ShieldCheck, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { ShippingAddress } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | number | null>(null);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name || '',
    addressLine1: 'Gran Vía 42, Piso 3',
    city: 'Madrid',
    postalCode: '28013',
    country: 'España'
  });

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('No hay artículos en el carrito para procesar.', 'error');
      return;
    }

    if (!address.fullName || !address.addressLine1 || !address.city) {
      showToast('Por favor completa todos los datos de envío.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.checkout.createCheckoutSession({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address,
      });

      if (response.checkoutUrl && response.checkoutUrl.startsWith('http')) {
        clearCart();
        showToast('Redirigiendo a la pasarela segura de Stripe...', 'info');
        window.location.href = response.checkoutUrl;
        return;
      }

      setSuccessOrderId(response.orderId);
      clearCart();
      showToast('¡Pago procesado exitosamente!', 'success');
      onOrderCompleted();
    } catch (err: any) {
      showToast(err.message || 'Error al procesar el pago en el backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOrderId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Finalizar Compra & Pago</h3>
              <p className="text-xs text-slate-400">Integración con Pasarela de Pago (Stripe)</p>
            </div>
          </div>
          <button
            onClick={successOrderId ? handleCloseSuccess : onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {successOrderId ? (
            /* Success Screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">¡Pago Confirmado!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tu orden ha sido registrada en el sistema con éxito.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Número de Orden:</span>
                  <span className="font-mono font-bold text-slate-900">{successOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Pagado:</span>
                  <span className="font-bold text-emerald-600">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado del Pago:</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Pagado (Stripe Test)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destinatario:</span>
                  <span className="font-medium text-slate-800">{address.fullName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Puedes revisar el historial y estado de este pedido en la sección "Mis Pedidos".
              </p>

              <button
                onClick={handleCloseSuccess}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-md transition cursor-pointer"
              >
                Volver a la Tienda
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isAuthenticated && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Comprando como Invitado:</span> Te recomendamos iniciar sesión para vincular automáticamente tus compras a tu cuenta.
                  </div>
                </div>
              )}

              {/* Shipping Address Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  Dirección de Envío
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={e => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="Ej. Juan Pérez"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Dirección (Calle y número)</label>
                    <input
                      type="text"
                      required
                      value={address.addressLine1}
                      onChange={e => setAddress({ ...address, addressLine1: e.target.value })}
                      placeholder="Ej. Av. Siempre Viva 742"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ciudad</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })}
                      placeholder="Ciudad"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Código Postal</label>
                    <input
                      type="text"
                      required
                      value={address.postalCode}
                      onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                      placeholder="28001"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Datos de Pago (Stripe Test)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Tarjeta de Pruebas</span>
                </h4>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Número de Tarjeta</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Expira</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={e => setCardExp(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 outline-none text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">CVC / CWW</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 outline-none text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total & Submit */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Total a debitar:</div>
                  <div className="text-xl font-black text-slate-900">${totalAmount.toFixed(2)}</div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando con Stripe...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pagar Ahora (${totalAmount.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
