import React, { useState } from 'react';
import { X, Settings, Check, AlertCircle, Copy, CheckCheck, RefreshCw, Server } from 'lucide-react';
import { ApiConfig, getApiConfig, saveApiConfig } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: (config: ApiConfig) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [config, setConfig] = useState<ApiConfig>(getApiConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCors, setCopiedCors] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiConfig(config);
    onConfigChanged(config);
    showToast('Configuración de API guardada.', 'success');
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      let base = (config.baseUrl || 'http://localhost:5175/api').trim().replace(/\/+$/, '');
      if (!base.endsWith('/api')) {
        base += '/api';
      }

      // Probamos el endpoint público /products (devuelve HTTP 200 con el catálogo cargado)
      const url = `${base}/products`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : 0;
        setTestResult({
          success: true,
          message: `¡Conexión exitosa! Tu backend de C# respondió con código HTTP 200 OK. Catálogo conectado en vivo con ${count} productos.`
        });
      } else if (res.status === 401) {
        setTestResult({
          success: true,
          message: `¡Conexión exitosa! Tu backend de C# respondió con código HTTP 401. El servidor está activo y autenticando peticiones.`
        });
      } else {
        setTestResult({
          success: false,
          message: `El servidor C# respondió con código HTTP ${res.status}: ${res.statusText}. Verifica que la ruta exista y termine en /api.`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Fallo de conexión (${err.message}). Verifica que tu API de C# esté corriendo en ${config.baseUrl}.`
      });
    } finally {
      setTesting(false);
    }
  };

  const corsSnippet = `// En Program.cs de tu Web API de C#:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Y antes de los endpoints:
app.UseCors("AllowFrontend");`;

  const copyCors = () => {
    navigator.clipboard.writeText(corsSnippet);
    setCopiedCors(true);
    setTimeout(() => setCopiedCors(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <Server className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Conexión con tu Backend C#</h3>
              <p className="text-xs text-slate-400">Alterna entre Modo Simulación y API Real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
          {/* Mode Switcher */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 text-sm block">Modo Simulación (Mock)</label>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Permite probar y navegar por toda la tienda, carrito, pagos y panel admin sin necesidad de tener el backend corriendo.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.useMock}
                onChange={e => setConfig({ ...config, useMock: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 cursor-pointer"
              />
            </div>
            {config.useMock ? (
              <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                🟡 Modo Mock activado: Los datos se guardan en el LocalStorage de tu navegador.
              </div>
            ) : (
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                🟢 Modo Live activado: Las peticiones van directo a tu API de ASP.NET Core con tokens JWT.
              </div>
            )}
          </div>

          {/* Base URL Input */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              URL Base de tu API ASP.NET Core
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={config.baseUrl}
                onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="http://localhost:5000/api"
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                <span>Probar Ping</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Revisa el puerto configurado en tu `launchSettings.json` (por ejemplo `http://localhost:5000/api` o `https://localhost:7123/api`).
            </p>
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div>{testResult.message}</div>
            </div>
          )}

          {/* CORS Helper Box */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs">Habilitar CORS en tu C# Web API:</span>
              <button
                type="button"
                onClick={copyCors}
                className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedCors ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCors ? '¡Copiado!' : 'Copiar código'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {corsSnippet}
            </pre>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
