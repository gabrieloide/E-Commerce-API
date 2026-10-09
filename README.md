# Nexus Commerce — E-Commerce API & Storefront 🛒

Full-stack E-Commerce platform built following the [Roadmap.sh E-Commerce API](https://roadmap.sh/projects/ecommerce-api) project specifications.

Features a robust **ASP.NET Core Minimal API (.NET 10)** backend with JWT authentication, Entity Framework Core, inventory validation, and **Stripe Checkout** integration, paired with a modern **React 19 + TypeScript + Tailwind CSS** storefront.

---

## 🏗️ Architecture & Project Structure (Monorepo)

```
E-Commerce API/
├── E-Commerce API/                  # ASP.NET Core Minimal API (Backend)
│   ├── DTO/                         # Data Transfer Objects
│   │   ├── Auth/                    # LoginDto, RegisterDto, AuthResponseDto
│   │   ├── Checkout/                # CheckoutRequestDto, CheckoutItemDto, ShippingAddressDto
│   │   └── Products/                # CreateProductDto
│   ├── Endpoints/                   # Modular Minimal API Route Groups
│   │   ├── AuthEndpoints.cs         # /api/auth (register, login)
│   │   ├── ProductEndpoints.cs      # /api/products (CRUD + search/filter)
│   │   └── CheckoutEndpoints.cs     # /api/checkout (checkout, orders history)
│   ├── Migrations/                  # EF Core Migrations (SQLite schema)
│   ├── Models/                      # Relational Entities (User, Product, Category, Order, OrderItem)
│   ├── Options/                     # Strongly-typed configs (JwtOptions)
│   ├── Services/                    # Encapsulated Business Services
│   │   ├── TokenService.cs          # HMAC-SHA256 JWT generation with Claims
│   │   └── PaymentService.cs        # Stripe.net SDK session creation
│   ├── ECommerceDb.cs               # EF Core DbContext
│   ├── Program.cs                   # Middleware pipeline, CORS, DI, endpoints mapping
│   └── appsettings.json             # Configuration settings
│
├── ecommerce-frontend/              # React 19 + TypeScript + Vite (Frontend)
│   ├── src/
│   │   ├── components/              # Navbar, ProductCard, CartDrawer, CheckoutModal, OrdersView, AdminPanel
│   │   ├── context/                 # AuthContext, CartContext, ToastContext
│   │   ├── services/                # API Client with auto-login, bearer tokens, error handling
│   │   └── types/                   # TypeScript interfaces & DTO shapes
│   └── package.json
│
└── README.md
```

---

## 🚀 Tech Stack

### Backend
- **Runtime:** .NET 10 (C# 14)
- **Framework:** ASP.NET Core Minimal APIs
- **Database / ORM:** SQLite + Entity Framework Core 10
- **Authentication:** JWT Bearer Token (HMAC-SHA256) with custom Claims (`NameIdentifier`, `Email`, `Role`)
- **Authorization:** Role-Based Access Control (`customer` vs `admin`)
- **Payments:** Official `Stripe.net` SDK (Stripe Checkout Sessions)
- **CORS:** Configured for local dev client origins (`http://localhost:5173`)

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Modern minimal UI)
- **Icons:** Lucide React
- **State Management:** Context API (Auth, Cart with localStorage persistence, Toasts)

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account with hashed credentials |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue signed JWT token |

### 📦 Products & Catalog (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products with query filtering (`?search=...&category=...`) |
| `GET` | `/api/products/{id}` | Public | Get product details by ID |
| `POST` | `/api/products` | Admin | Create product (auto-creates category if missing) |
| `PUT` | `/api/products/{id}` | Admin | Update existing product details, price, or stock |
| `DELETE` | `/api/products/{id}` | Admin | Delete product from catalog |

### 💳 Checkout, Inventory & Orders (`/api/checkout`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/checkout` | Customer/Admin | Validates stock, deducts inventory, creates `Order` + `OrderItem`, and creates Stripe Checkout session |
| `GET` | `/api/checkout/orders` | Customer/Admin | List orders eager-loaded with related items and products |

---

## 🛠️ Getting Started

### 1. Prerequisites
- [.NET SDK 10](https://dotnet.microsoft.com/)
- [Node.js 20+](https://nodejs.org/)

### 2. Configure Backend Secrets
Create or update `E-Commerce API/appsettings.Development.json` (ignored by git for security):
```json
{
  "Stripe": {
    "Secret Key": "sk_test_your_stripe_secret_key_here"
  }
}
```

### 3. Run the Backend
```bash
cd "E-Commerce API"
dotnet run --launch-profile http
```
The API will start listening at: **`http://localhost:5175`**

### 4. Run the Frontend
```bash
cd ecommerce-frontend
npm install
npm run dev
```
The application will open at: **`http://localhost:5173`**

---

## 🧪 Testing Credentials & Demo Accounts

### Admin Account (Seeded in SQLite)
- **Email:** `test_user_unique@nexus.com`
- **Password:** `Password123!`
- **Role:** `admin` (Full access to Admin Panel, product creation, editing, inventory management)

### Stripe Test Payment Card
When checking out, you will be redirected to the secure **Stripe Checkout** test portal:
- **Card Number:** `4242 4242 4242 4242`
- **Exp Date:** Any future date (e.g., `12/28`)
- **CVC:** `123`
- **Postal Code:** Any valid postal code (e.g., `28013` or `1050`)
- Stripe will process the mock charge and redirect back to the store with a verified order confirmation!

---

## 📜 Roadmap Milestone Completion

- [x] JWT user authentication & authorization
- [x] Full CRUD operations on products & categories
- [x] Search & category query filters with EF Core LINQ
- [x] Shopping cart with persistent state and inventory checks
- [x] Server-side stock deduction and order persistence
- [x] Orders history tracking with eager loading
- [x] External payment gateway integration via **Stripe Checkout**
- [x] Admin Panel for real-time inventory management
