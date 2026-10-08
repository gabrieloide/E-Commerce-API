import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Search, 
  X, 
  RotateCcw,
  Check,
  ShoppingBag,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Product, Order } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const { showToast } = useToast();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Audio',
    imageUrl: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        api.products.getAll(),
        api.orders.getAll()
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err: any) {
      showToast(err.message || 'Error cargando datos del panel admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 99.99,
      stock: 20,
      category: 'Audio',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      stock: prod.stock,
      category: prod.category,
      imageUrl: prod.imageUrl,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto del catálogo?')) return;

    try {
      await api.products.delete(id);
      showToast('Producto eliminado exitosamente', 'info');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Error eliminando producto', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const updated = await api.products.update(editingProduct.id, {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        });
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast('Producto actualizado exitosamente', 'success');
      } else {
        const created = await api.products.create({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        });
        setProducts(prev => [created, ...prev]);
        showToast('Nuevo producto agregado al catálogo', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el producto', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string | number, status: Order['status']) => {
    try {
      const updated = await api.orders.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      showToast(`Orden #${orderId} actualizada a "${status}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar orden', 'error');
    }
  };

  // Metrics
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            Panel de Control Exclusivo
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gestión de Inventario & Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administra los productos de la API, actualiza precios, controla el stock y supervisa órdenes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'inventory' && (
            <button
              onClick={handleOpenCreate}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          )}

          <button
            onClick={() => {
              api.products.resetToDefault();
              loadData();
              showToast('Datos reiniciados al estado por defecto.', 'info');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Restablecer datos de prueba"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer Mock</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Productos</div>
            <div className="text-xl font-black text-slate-900">{products.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Poco Stock (&le; 5)</div>
            <div className="text-xl font-black text-amber-600">{lowStockCount} ítems</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Valor de Inventario</div>
            <div className="text-xl font-black text-slate-900">${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Órdenes Realizadas</div>
            <div className="text-xl font-black text-slate-900">{orders.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 relative transition cursor-pointer ${
            activeTab === 'inventory' ? 'text-purple-700' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span>Inventario de Productos ({products.length})</span>
          {activeTab === 'inventory' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 relative transition cursor-pointer ${
            activeTab === 'orders' ? 'text-purple-700' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span>Órdenes de Clientes ({orders.length})</span>
          {activeTab === 'orders' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Product Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Search Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nombre o categoría..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Mostrando {filteredProducts.length} de {products.length}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{prod.description}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                        {prod.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ${prod.price.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        prod.stock <= 0
                          ? 'bg-rose-50 text-rose-700'
                          : prod.stock <= 5
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {prod.stock <= 0 ? 'Sin stock (0)' : `${prod.stock} disp.`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">ID de Orden</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Pago</th>
                  <th className="py-3 px-4">Estado Pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={e => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-xs outline-none focus:border-purple-500"
                      >
                        <option value="Pending">Pendiente</option>
                        <option value="Processing">En Proceso</option>
                        <option value="Completed">Completado</option>
                        <option value="Cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/60">
              <h3 className="font-black text-slate-900 text-base">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Teclado Mecánico Custom"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles técnicos, materiales y especificaciones..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Precio ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stock (Unidades)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Monitores">Monitores</option>
                    <option value="Hogar & Oficina">Hogar & Oficina</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">URL de Imagen</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
