import React, { useState } from 'react';
import { X, FileCode2, Copy, CheckCheck, Shield, KeyRound, Database, ShoppingCart, CreditCard } from 'lucide-react';

export const ApiContractModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'csharp_dtos'>('endpoints');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const endpoints = [
    {
      method: 'POST',
      url: '/api/auth/register',
      auth: 'Público',
      desc: 'Registra un nuevo usuario en la base de datos.',
      body: '{\n  "name": "Gabriel",\n  "email": "gabriel@test.com",\n  "password": "Password123!",\n  "role": "customer" // o "admin"\n}',
      response: '{\n  "token": "eyJhbGciOi...",\n  "user": { "id": 1, "name": "Gabriel", "email": "gabriel@test.com", "role": "customer" }\n}'
    },
    {
      method: 'POST',
      url: '/api/auth/login',
      auth: 'Público',
      desc: 'Valida credenciales y genera el token JWT con Claims (sub, role, email).',
      body: '{\n  "email": "gabriel@test.com",\n  "password": "Password123!"\n}',
      response: '{\n  "token": "eyJhbGciOi...",\n  "user": { "id": 1, "name": "Gabriel", "email": "gabriel@test.com", "role": "customer" }\n}'
    },
    {
      method: 'GET',
      url: '/api/products?search={term}&category={cat}',
      auth: 'Público',
      desc: 'Retorna el catálogo de productos con filtros opcionales de búsqueda y categoría.',
      body: 'None',
      response: '[\n  {\n    "id": 1,\n    "name": "Auriculares Pro ANC",\n    "description": "...",\n    "price": 149.99,\n    "stock": 25,\n    "category": "Audio",\n    "imageUrl": "https://..."\n  }\n]'
    },
    {
      method: 'GET',
      url: '/api/products/{id}',
      auth: 'Público',
      desc: 'Obtiene un producto específico por su ID numérico.',
      body: 'None',
      response: '{\n  "id": 1,\n  "name": "Auriculares Pro ANC",\n  "price": 149.99,\n  ...\n}'
    },
    {
      method: 'POST',
      url: '/api/products',
      auth: 'Bearer Token (Role: Admin)',
      desc: 'Crea un nuevo producto en el catálogo. Requiere rol de administrador.',
      body: '{\n  "name": "Nuevo Producto",\n  "description": "...",\n  "price": 49.99,\n  "stock": 10,\n  "category": "Periféricos",\n  "imageUrl": "https://..."\n}',
      response: '{\n  "id": 9,\n  "name": "Nuevo Producto",\n  ...\n}'
    },
    {
      method: 'PUT',
      url: '/api/products/{id}',
      auth: 'Bearer Token (Role: Admin)',
      desc: 'Actualiza los datos, precio o inventario de un producto existente.',
      body: '{\n  "name": "Nombre Actualizado",\n  "price": 39.99,\n  "stock": 15\n}',
      response: '{\n  "id": 1,\n  ...\n}'
    },
    {
      method: 'DELETE',
      url: '/api/products/{id}',
      auth: 'Bearer Token (Role: Admin)',
      desc: 'Elimina un producto del catálogo por su ID.',
      body: 'None',
      response: '204 No Content (o 200 OK con confirmación)'
    },
    {
      method: 'POST',
      url: '/api/checkout',
      auth: 'Opcional / Bearer Token',
      desc: 'Crea una orden de compra e inicia la sesión de Stripe Checkout.',
      body: '{\n  "items": [\n    { "productId": 1, "quantity": 2 }\n  ],\n  "shippingAddress": {\n    "fullName": "Juan Pérez",\n    "addressLine1": "Gran Vía 42",\n    "city": "Madrid",\n    "postalCode": "28013",\n    "country": "España"\n  }\n}',
      response: '{\n  "orderId": "ORD-12345",\n  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_...",\n  "message": "Sesión creada exitosamente"\n}'
    },
    {
      method: 'GET',
      url: '/api/orders',
      auth: 'Bearer Token',
      desc: 'Retorna el historial de órdenes del usuario actual (o todas si es admin).',
      body: 'None',
      response: '[\n  {\n    "id": "ORD-12345",\n    "totalAmount": 299.98,\n    "status": "Completed",\n    "paymentStatus": "Paid",\n    "createdAt": "2026-10-06T12:00:00Z"\n  }\n]'
    }
  ];

  const csharpDtosSnippet = `// ==========================================
// DTOs Y MODELOS PARA TU BACKEND EN C#
// ==========================================

namespace EcommerceApi.Models;

public record RegisterDto(
    string Name, 
    string Email, 
    string Password, 
    string Role = "customer"
);

public record LoginDto(
    string Email, 
    string Password
);

public record AuthResponseDto(
    string Token, 
    UserDto User
);

public record UserDto(
    int Id, 
    string Name, 
    string Email, 
    string Role
);

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Category { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public record CreateProductDto(
    string Name, 
    string Description, 
    decimal Price, 
    int Stock, 
    string Category, 
    string ImageUrl
);

public record UpdateProductDto(
    string? Name, 
    string? Description, 
    decimal? Price, 
    int? Stock, 
    string? Category, 
    string? ImageUrl
);

public record CheckoutItemDto(
    int ProductId, 
    int Quantity
);

public record ShippingAddressDto(
    string FullName, 
    string AddressLine1, 
    string City, 
    string PostalCode, 
    string Country
);

public record CheckoutRequestDto(
    List<CheckoutItemDto> Items, 
    ShippingAddressDto ShippingAddress
);

public record CheckoutResponseDto(
    string OrderId, 
    string? CheckoutUrl, 
    string Message
);`;

  const copyDtos = () => {
    navigator.clipboard.writeText(csharpDtosSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Contrato de API & DTOs para tu Backend C#</h3>
              <p className="text-xs text-slate-400">Guía exacta de endpoints y modelos de datos esperados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex px-6 pt-3 border-b border-slate-100 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === 'endpoints'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Endpoints REST ({endpoints.length})
          </button>
          <button
            onClick={() => setActiveTab('csharp_dtos')}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === 'csharp_dtos'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Modelos y Records en C# (DTOs)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'endpoints' ? (
            <div className="space-y-4">
              {endpoints.map((ep, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        ep.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        ep.method === 'POST' ? 'bg-emerald-100 text-emerald-700' :
                        ep.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{ep.url}</span>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      ep.auth.includes('Admin')
                        ? 'bg-purple-100 text-purple-700'
                        : ep.auth.includes('Bearer')
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {ep.auth}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs">{ep.desc}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-sans font-semibold">Request Body:</span>
                      <pre className="p-2 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto">
                        {ep.body}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-sans font-semibold">Response JSON:</span>
                      <pre className="p-2 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto">
                        {ep.response}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-500">
                  Copia y pega estas definiciones directamente en tu solución de ASP.NET Core:
                </p>
                <button
                  onClick={copyDtos}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedCode ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '¡Copiado!' : 'Copiar DTOs en C#'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {csharpDtosSnippet}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
