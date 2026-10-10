# Nexus Commerce — Full-Stack E-Commerce Platform 🛒

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout_%26_Webhooks-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Tests](https://img.shields.io/badge/xUnit-19_Passed-brightgreen?logo=dotnet&logoColor=white)](#-automated-testing-suite)
[![Roadmap.sh](https://img.shields.io/badge/Roadmap.sh-E--Commerce_API-orange)](https://roadmap.sh/projects/ecommerce-api)

A production-ready full-stack E-Commerce platform built following the **[Roadmap.sh E-Commerce API](https://roadmap.sh/projects/ecommerce-api)** specification.

It features a high-performance **ASP.NET Core Minimal API (.NET 10)** backend with JWT authentication, role-based authorization, **FluentValidation** pipeline filters, Entity Framework Core 10 with SQLite, transactional inventory management, and **Stripe Checkout & Webhook** reconciliation. On the frontend, it provides an ultra-responsive storefront crafted with **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 📑 Table of Contents

- [🏗️ Monorepo Architecture](#️-monorepo-architecture)
- [⚡ Tech Stack](#-tech-stack)
- [🛡️ Key Backend Features](#️-key-backend-features)
  - [1. Authentication & Role-Based Access Control](#1-authentication--role-based-access-control)
  - [2. Request Validation Pipeline (FluentValidation)](#2-request-validation-pipeline-fluentvalidation)
  - [3. Two-Phase Transactional Checkout & Stripe Webhooks](#3-two-phase-transactional-checkout--stripe-webhooks)
- [💻 Frontend Features](#-frontend-features)
- [📡 API Endpoints Reference](#-api-endpoints-reference)
- [💳 Stripe Payment & Webhook Workflow](#-stripe-payment--webhook-workflow)
- [🧪 Automated Testing Suite](#-automated-testing-suite)
- [🚀 Quickstart & Installation](#-quickstart--installation)
  - [Prerequisites](#prerequisites)
  - [1. Configure Backend Secrets](#1-configure-backend-secrets)
  - [2. Run Backend API](#2-run-backend-api)
  - [3. Run Frontend Storefront](#3-run-frontend-storefront)
  - [4. Listen for Stripe Webhooks (Local Dev)](#4-listen-for-stripe-webhooks-local-dev)
- [🔑 Demo Credentials & Test Cards](#-demo-credentials--test-cards)
- [📜 Roadmap Checklist](#-roadmap-checklist)

---

## 🏗️ Monorepo Architecture

```
E-Commerce API/
├── E-Commerce API/                  # ASP.NET Core Minimal API (Backend)
│   ├── DTO/                         # Data Transfer Objects
│   │   ├── Auth/                    # LoginDto, RegisterDto, AuthResponseDto, UserDto
│   │   ├── Checkout/                # CheckoutRequestDto, CheckoutItemDto, ShippingAddressDto
│   │   └── Products/                # CreateProductDto, UpdateProductDto
│   ├── Endpoints/                   # Modular Minimal API Route Groups
│   │   ├── AuthEndpoints.cs         # /api/auth (register, login)
│   │   ├── ProductEndpoints.cs      # /api/products (CRUD, LINQ search & category filtering)
│   │   └── CheckoutEndpoints.cs     # /api/checkout (checkout session, orders, Stripe webhook)
│   ├── Migrations/                  # EF Core Migrations (SQLite schema)
│   ├── Models/                      # Relational Entities (User, Product, Category, Order, OrderItem)
│   ├── Options/                     # Strongly-typed configuration options (JwtOptions)
│   ├── Services/                    # Core Business & Infrastructure Services
│   │   ├── TokenService.cs          # HMAC-SHA256 JWT token generator with Claim mapping
│   │   └── PaymentService.cs        # Stripe.net SDK session builder
│   ├── Validators/                  # FluentValidation validators & generic endpoint filter
│   │   ├── ValidatorFilter.cs       # Generic IEndpointFilter running DI validators
│   │   ├── RegisterDtoValidator.cs
│   │   ├── LoginDtoValidator.cs
│   │   ├── CreateProductDtoValidator.cs
│   │   └── CheckoutRequestDtoValidator.cs
│   ├── ECommerceDb.cs               # EF Core DbContext
│   ├── Program.cs                   # Middleware pipeline, DI container, CORS, endpoint mapping
│   ├── appsettings.json             # Application settings template
│   └── appsettings.Development.json # Development secrets & local keys (gitignored)
│
├── E-Commerce API.Tests/            # Automated Test Suite (xUnit + WebApplicationFactory)
│   ├── Infrastructure/
│   │   ├── CustomWebApplicationFactory.cs # In-memory SQLite test fixture & mock overrides
│   │   ├── FakePaymentService.cs    # Mock Stripe payment service (no external network calls)
│   │   ├── TestAuthHelper.cs        # Authenticates client and injects Bearer header
│   │   └── TestDbSeeder.cs          # Seeds initial test database state
│   ├── Integration/
│   │   ├── AuthTests.cs             # Registration, conflicts, login, bad requests
│   │   ├── ProductTests.cs          # Public viewing, admin RBAC, CRUD operations
│   │   └── CheckoutTests.cs         # Stock verification, checkout URL, webhook signature, orders
│   └── Unit/
│       └── TokenServiceTests.cs     # JWT signature, claims, expiration assertions
│
├── ecommerce-frontend/              # React 19 + TypeScript + Vite (Frontend Storefront)
│   ├── src/
│   │   ├── assets/                  # Hero banners, brand icons
│   │   ├── components/              # Navbar, ProductCard, CartDrawer, CheckoutModal,
│   │   │                            # OrdersView, AdminPanel, ApiContractModal, ApiSettingsModal
│   │   ├── context/                 # AuthContext, CartContext, ToastContext
│   │   ├── data/                    # Fallback data & demo profiles
│   │   ├── services/api.ts          # Strongly-typed API client with JWT interceptor
│   │   └── types/index.ts           # Frontend TypeScript types matching backend DTOs
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## ⚡ Tech Stack

### Backend
- **Runtime:** .NET 10 (C# 14)
- **Framework:** ASP.NET Core Minimal APIs
- **Database & ORM:** SQLite with Entity Framework Core 10
- **Validation:** **FluentValidation** via endpoint filters
- **Authentication:** JWT Bearer tokens signed with HMAC-SHA256 (`NameIdentifier`, `Email`, `Role`)
- **Authorization:** Role-Based Access Control (`customer` vs. `admin` policies)
- **Payment Gateway:** Official `Stripe.net` SDK (Checkout Sessions + Webhook events)
- **Testing:** xUnit, `Microsoft.AspNetCore.Mvc.Testing` (`WebApplicationFactory`), In-memory SQLite

### Frontend
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (Modern glassmorphism & responsive layout)
- **Icons:** Lucide React
- **State Management:** Context API with `localStorage` persistence (Cart, Auth, Toasts)

---

## 🛡️ Key Backend Features

### 1. Authentication & Role-Based Access Control
- Passwords and user accounts stored in SQLite.
- JWT tokens issued via `TokenService` contain claims for user identity and role.
- Role-protected endpoints enforce authorization using ASP.NET Core policies (e.g., `.RequireAuthorization(policy => policy.RequireRole("admin"))`).

### 2. Request Validation Pipeline (FluentValidation)
- Integrated using a custom, reusable generic Minimal API filter: `ValidatorFilter<T>`.
- Any incoming request failing validation rules immediately returns standard HTTP **400 Bad Request** with structured RFC 7807 `ValidationProblem` details before reaching endpoint handlers.
- Validates email formats, required fields, positive prices, inventory levels, cart item quantities, and complete shipping addresses.

### 3. Two-Phase Transactional Checkout & Stripe Webhooks
To eliminate cart abandonment inventory leaks and race conditions:
1. **Phase 1 (Order Placement):**
   - User submits cart items and shipping details to `POST /api/checkout`.
   - Inventory availability is verified.
   - An `Order` is recorded in the database with status `OrderStatus.Pending`.
   - A Stripe Checkout session is created with `ClientReferenceId = order.Id`.
   - **Crucial:** Stock is *not* deducted yet, protecting inventory if the customer abandons the checkout window.
2. **Phase 2 (Payment Confirmation via Webhook):**
   - Stripe sends an asynchronous `checkout.session.completed` event to `POST /api/checkout/webhook`.
   - The webhook signature is cryptographically validated using `EventUtility.ConstructEvent` and the secret key (`Stripe-Signature`).
   - The handler initiates an atomic database transaction.
   - Stock is decremented using EF Core 10's batch `ExecuteUpdateAsync` with an atomic predicate check (`p.Stock >= item.Quantity`).
   - If stock is sufficient, the order transitions to `OrderStatus.Completed` and the transaction commits.
   - If stock was exhausted concurrently, the transaction rolls back, and the order transitions to `OrderStatus.Cancelled`.

---

## 💻 Frontend Features

- **Product Catalog:** Real-time search and category filtering with instant UI feedback.
- **Persistent Cart Drawer:** Slide-over cart remembering user selection across reloads.
- **Embedded Checkout:** Complete shipping address input with one-click redirect to Stripe Checkout.
- **Customer Orders View:** View order status (`Pending`, `Completed`, `Cancelled`), items purchased, and prices.
- **Interactive Admin Panel:** Allows store administrators to create products, update prices/stock, and remove items.
- **API Settings & Contract Viewer:** Change API connection URLs dynamically and inspect API endpoints in-app.

---

## 📡 API Endpoints Reference

Base URL: `http://localhost:5175`

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive signed JWT token |

#### Register Payload Example
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "customer"
}
```

#### Login Response Example
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer"
  }
}
```

---

### 📦 Products & Catalog (`/api/products`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products (Supports query params: `?search=...&category=...`) |
| `GET` | `/api/products/{id}` | Public | Get product details by ID |
| `POST` | `/api/products` | Admin | Create product (auto-creates category if new) |
| `PUT` | `/api/products/{id}` | Admin | Update product details, pricing, and stock |
| `DELETE` | `/api/products/{id}` | Admin | Delete product from catalog |

#### Create Product Payload Example
```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with red switches",
  "price": 89.99,
  "stock": 15,
  "category": "Technology",
  "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
}
```

---

### 💳 Checkout, Orders & Webhooks (`/api/checkout`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/checkout` | Customer/Admin | Initiates checkout, creates `Pending` order, returns Stripe Checkout URL |
| `GET` | `/api/checkout/orders` | Customer/Admin | Returns order history for current authenticated user |
| `POST` | `/api/checkout/webhook` | Stripe (HMAC) | Stripe event webhook handler for atomic inventory decrement |

#### Checkout Payload Example
```json
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "shippingAddress": {
    "fullName": "Jane Doe",
    "addressLine1": "123 Market St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "US"
  }
}
```

#### Checkout Response Example
```json
{
  "orderId": 42,
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "message": "Checkout successful."
}
```

---

## 💳 Stripe Payment & Webhook Workflow

```
[Customer Browser]           [Backend API]            [Stripe Checkout]
       |                           |                          |
       |-- POST /api/checkout ---->|                          |
       |   (Cart & Address)        |-- Create Session ------->|
       |                           |<-- Returns Session URL --|
       |<-- Returns CheckoutUrl ---|                          |
       |                                                      |
       |------------ Redirects to Stripe Portal ------------->|
       |                                                      |
       |                    Customer Pays Card                |
       |                                                      |
       |                           |<-- POST /webhook --------|
       |                           |    (checkout.session.    |
       |                           |     completed)           |
       |                           |                          |
       |                           |-- Validate Signature     |
       |                           |-- Deduct Stock (Atomic)  |
       |                           |-- Order -> Completed     |
       |                                                      |
       |<----------- Redirect to Store (?success=true) -------|
```

---

## 🧪 Automated Testing Suite

The project includes an end-to-end integration and unit testing suite built with **xUnit** and **Microsoft.AspNetCore.Mvc.Testing**.

- **Isolated In-Memory Database:** Each test run uses an independent SQLite in-memory instance (`DataSource=:memory:`), ensuring zero side-effects.
- **Mock Payment Gateway:** Uses `FakePaymentService` to generate deterministic Stripe test URLs without making external API calls.
- **Seeded State:** `TestDbSeeder` seeds standard categories, products, customer accounts, and admin accounts.

### Run All Tests
```bash
dotnet test
```

### Test Coverage Highlights
- ✅ **AuthTests:** Valid registration, duplicate email rejection (409 Conflict), empty payload validation (400 Bad Request), valid credentials login (200 OK + JWT), invalid credentials rejection (401 Unauthorized).
- ✅ **ProductTests:** Public catalog listing, product lookup by ID, 404 for missing products, unauthorized product creation, customer role forbidden (403), admin product creation (201 Created), admin product deletion (204 NoContent).
- ✅ **CheckoutTests:** Unauthenticated rejection (401), empty items rejection (400), insufficient stock prevention (400), successful checkout returning Stripe URL while preserving stock, webhook signature verification (400 on invalid signature), authenticated order history retrieval.
- ✅ **TokenServiceTests:** Correct HMAC-SHA256 token signing, email and role claims verification, valid token expiration.

---

## 🚀 Quickstart & Installation

### Prerequisites
- [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) *(optional, for local webhook testing)*

### 1. Configure Backend Secrets
Create or update `E-Commerce API/appsettings.Development.json` with your Stripe API keys:
```json
{
  "Stripe": {
    "Secret Key": "sk_test_your_stripe_secret_key",
    "WebhookSecret": "whsec_your_stripe_webhook_signing_secret"
  }
}
```

### 2. Run Backend API
```bash
cd "E-Commerce API"
dotnet run --launch-profile http
```
The API starts at **`http://localhost:5175`**.

### 3. Run Frontend Storefront
In a separate terminal:
```bash
cd ecommerce-frontend
npm install
npm run dev
```
The storefront will be available at **`http://localhost:5173`**.

### 4. Listen for Stripe Webhooks (Local Dev)
To test the full payment lifecycle locally:
```bash
stripe listen --forward-to http://localhost:5175/api/checkout/webhook
```
Copy the webhook signing secret output by the Stripe CLI (`whsec_...`) into `appsettings.Development.json` under `Stripe:WebhookSecret`.

---

## 🔑 Demo Credentials & Test Cards

### Pre-Seeded Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `test_user_unique@nexus.com` | `Password123!` | Full admin access (create, edit, delete products, manage inventory) |
| **Customer** | `gabriel@test.com` | `123` | Browsing, shopping cart, checkout, orders history |

> *Tip: The frontend login modal includes a **"Quick Demo"** shortcut to sign in with one click.*

### Stripe Test Card
When redirected to the Stripe Checkout page, use:
- **Card Number:** `4242 4242 4242 4242`
- **Expiration:** Any future date (e.g. `12/28`)
- **CVC:** `123`
- **Postal Code:** Any valid ZIP code (e.g. `94105` or `10001`)

---

## 📜 Roadmap Checklist

- [x] **User Authentication:** Registration & login with JWT tokens and password validation
- [x] **Role-Based Authorization:** Separate policies for `customer` and `admin` roles
- [x] **Input Validation:** Request validation using **FluentValidation** and custom endpoint filters
- [x] **Product Catalog:** Full CRUD operations for products & categories
- [x] **Search & Filters:** Search by query term and filter by category with EF Core LINQ
- [x] **Shopping Cart:** Reactive cart with real-time totals and localStorage persistence
- [x] **Payment Gateway:** External checkout integration using **Stripe Checkout**
- [x] **Webhook Synchronization:** Webhook handler with signature verification for payment fulfillment
- [x] **Transactional Inventory:** Pre-order stock verification and post-payment atomic deduction
- [x] **Order History:** Customer order history with order items and status tracking
- [x] **Admin Dashboard:** In-store admin interface for inventory and product catalog management
- [x] **Automated Testing:** 19/19 passing integration and unit tests with xUnit and WebApplicationFactory
