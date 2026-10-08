import React, { useState } from 'react';
import { 
  ShoppingCart, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Search, 
  Settings, 
  FileCode2, 
  Package, 
  Store,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ApiConfig } from '../services/api';

interface NavbarProps {
  currentTab: 'shop' | 'admin' | 'orders';
  setCurrentTab: (tab: 'shop' | 'admin' | 'orders') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAuth: () => void;
  onOpenConfig: () => void;
  onOpenDocs: () => void;
  apiConfig: ApiConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onOpenConfig,
  onOpenDocs,
  apiConfig,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* Top micro-bar: Environment status and quick developer helpers */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiConfig.useMock ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${apiConfig.useMock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="hidden sm:inline font-mono">
            {apiConfig.useMock ? 'Modo Mock Activo (Datos simulados locales)' : `Backend Live: ${apiConfig.baseUrl}`}
          </span>
          <span className="sm:hidden font-mono">
            {apiConfig.useMock ? 'Mock Mode' : 'Live API'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition cursor-pointer hover:underline"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            <span>Configurar Conexión API</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-100 font-medium transition cursor-pointer hover:underline"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Contrato API / DTOs (C#)</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('shop')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                Nexus<span className="text-indigo-600">Commerce</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider -mt-1">
                E-Commerce API Client
              </div>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('shop')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                currentTab === 'shop'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Tienda</span>
            </button>

            <button
              onClick={() => setCurrentTab('orders')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                currentTab === 'orders'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Mis Pedidos</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  currentTab === 'admin'
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}
          </nav>
        </div>

        {/* Search Bar (Only visible if on shop page) */}
        {currentTab === 'shop' && (
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por producto, marca o especificación..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons: Cart & User */}
        <div className="flex items-center gap-3">
          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
            title="Ver carrito de compras"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[11px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-white shadow-sm">
                {totalCount}
              </span>
            )}
          </button>

          {/* User Auth */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium capitalize">
                    {user.role === 'admin' ? '⭐ Administrador' : 'Cliente'}
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
                      Rol: {user.role}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setCurrentTab('admin')}
                      className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Ir al Panel Admin
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentTab('orders')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Mis Compras
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      {currentTab === 'shop' && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
};
