import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickLoginAs, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tab === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, role });
      }
      onClose();
    } catch {
      // error handled in context toast
    }
  };

  const handleQuickDemo = async (targetRole: 'admin' | 'customer') => {
    try {
      await quickLoginAs(targetRole);
      onClose();
    } catch {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 bg-linear-to-b from-indigo-50/50 to-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-600/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Autenticación segura basada en tokens JWT Bearer
          </p>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mt-4 text-xs font-bold">
            <button
              onClick={() => setTab('login')}
              className={`py-2 rounded-lg transition ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ya tengo cuenta
            </button>
            <button
              onClick={() => setTab('register')}
              className={`py-2 rounded-lg transition ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Registrarme
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4 text-xs">
          {tab === 'register' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Gabriel Developer"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Rol de Usuario</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'customer' | 'admin')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition font-medium"
              >
                <option value="customer">Cliente (Comprador)</option>
                <option value="admin">Administrador (Gestión de Productos)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{tab === 'login' ? 'Acceder a mi cuenta' : 'Crear mi cuenta'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Buttons for Rapid Testing */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-400 font-medium text-center mb-2">
              Pruebas rápidas (1 clic para testing):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] border border-purple-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Como Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Como Cliente</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
