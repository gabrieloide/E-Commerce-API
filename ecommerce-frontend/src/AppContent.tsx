import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Sparkles, 
  SlidersHorizontal, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { OrdersView } from './components/OrdersView';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { ApiContractModal } from './components/ApiContractModal';

import { Product } from './types';
import { api, getApiConfig, ApiConfig } from './services/api';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'shop' | 'admin' | 'orders'>('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const [apiConfig, setApiConfig] = useState<ApiConfig>(getApiConfig());
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const categories = ['Todos', 'Audio', 'Periféricos', 'Wearables', 'Accesorios', 'Monitores', 'Hogar & Oficina'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.products.getAll({
        search: searchQuery,
        category: selectedCategory === 'Todos' ? undefined : selectedCategory,
      });
      setProducts(data);
    } catch (err: any) {
      showToast(err.message || 'Error al obtener productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, apiConfig]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenConfig={() => setIsSettingsOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        apiConfig={apiConfig}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
            {/* Hero Banner */}
            <div className="relative rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 mb-10 overflow-hidden shadow-xl border border-slate-800">
              <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Frontend conectado a tu E-Commerce API</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                  Tecnología de Vanguardia para Desarrolladores
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                  Explora nuestro catálogo con autenticación JWT, carrito de compras sincronizado y pasarela de pago Stripe lista para integrar con tu backend en C#.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsDocsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>Ver Endpoints & Modelos C#</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-3 rounded-xl transition cursor-pointer border border-white/10"
                  >
                    Configurar Conexión API
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchProducts}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white transition cursor-pointer shrink-0"
                title="Recargar catálogo"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                    <div className="w-full h-48 bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                    <div className="h-8 bg-slate-100 rounded-xl w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 text-base mb-1">Catálogo Vacío</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Aún no hay productos guardados en tu base de datos SQLite. Cuando implementes tu endpoint <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-[11px]">GET /api/products</code> en C# o agregues productos desde el Panel Admin, aparecerán aquí automáticamente.
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    Ir al Panel Admin para Crear Productos
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(prod => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'admin' && (
          <AdminPanel />
        )}

        {currentTab === 'orders' && (
          <OrdersView onGoToShop={() => setCurrentTab('shop')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-slate-900">Nexus Commerce</span> — Frontend cliente para el roadmap{' '}
            <a 
              href="https://roadmap.sh/projects/ecommerce-api" 
              target="_blank" 
              rel="noreferrer"
              className="text-indigo-600 hover:underline font-semibold"
            >
              E-Commerce API
            </a>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-slate-900">
              Contrato de API
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-slate-900">
              Configuración
            </button>
            <span>ASP.NET Core Minimal API + JWT + Stripe</span>
          </div>
        </div>
      </footer>

      {/* Slide-over & Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={() => {
          fetchProducts();
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigChanged={newCfg => setApiConfig(newCfg)}
      />

      <ApiContractModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
};
