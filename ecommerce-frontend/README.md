# Nexus Commerce - E-Commerce API Frontend

Frontend moderno y desacoplado desarrollado con **React + TypeScript + Tailwind CSS** para consumir la práctica [E-Commerce API de Roadmap.sh](https://roadmap.sh/projects/ecommerce-api).

---

## 🚀 Cómo iniciar el Frontend

1. Abre una terminal en esta carpeta (`ecommerce-frontend`):
   ```bash
   cd ecommerce-frontend
   npm run dev
   ```
2. Abre tu navegador en la URL que indique Vite (por defecto [http://localhost:5173](http://localhost:5173)).

---

## 🌟 Características Implementadas

1. **Autenticación (JWT Bearer):**
   - Registro de usuarios (`POST /api/auth/register`)
   - Inicio de sesión (`POST /api/auth/login`)
   - Manejo de roles (`customer` y `admin`)
   - Botones de 1 clic para demo/testing rápido (Admin y Cliente).
2. **Catálogo de Productos:**
   - Listado con tarjetas interactivas, imágenes y precio.
   - Filtros por categoría y barra de búsqueda en tiempo real.
   - Indicadores de inventario (En stock, Pocas unidades, Agotado).
   - Modal de detalle de producto con selector de cantidad.
3. **Carrito de Compras:**
   - Panel lateral desplegable (*Slide-over drawer*).
   - Agregar productos, modificar cantidades con validación de stock disponible.
   - Eliminar productos o vaciar carrito.
   - Persistencia local del carrito.
4. **Checkout y Pagos:**
   - Formulario de dirección de envío.
   - Integración con pasarela de pago (Stripe) vía `POST /api/checkout`.
   - Confirmación de orden de compra con número de pedido.
5. **Panel de Administración (Admin):**
   - Exclusivo para usuarios con rol `admin`.
   - Métricas y KPIs de inventario y pedidos.
   - CRUD completo de productos (crear, editar precio/stock/categoría, eliminar).
   - Gestión y cambio de estado de pedidos de clientes (`Pending`, `Processing`, `Completed`, `Cancelled`).
6. **Historial de Pedidos:**
   - Vista de compras realizadas por el cliente.
7. **Modo Simulación (Mock) vs Backend Real:**
   - En la barra superior puedes alternar con un solo clic entre **Modo Simulación (Mock)** y **Backend Live (C#)**.
   - Puedes probar toda la tienda de inmediato sin tener el backend terminado aún.

---

## 🛠️ Cómo conectar tu Backend en C# (ASP.NET Core)

### 1. Habilitar CORS en `Program.cs` de tu Web API:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Habilitar CORS para permitir peticiones desde Vite (localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ... tus servicios JWT, DbContext, etc.

var app = builder.Build();

app.UseCors("AllowFrontend");

// ... tus endpoints de Minimal API o Controllers
```

### 2. Configurar la URL del Backend:

En la barra superior de la app, haz clic en **"Configurar Conexión API"** y escribe la URL de tu API (ej. `http://localhost:5000/api` o `https://localhost:7123/api`), desmarca la casilla **"Modo Simulación"** y haz clic en **"Guardar Configuración"**.
