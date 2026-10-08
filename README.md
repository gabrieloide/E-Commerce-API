# E-Commerce API & Storefront 🛒

Full-stack E-Commerce platform built following the [Roadmap.sh E-Commerce API](https://roadmap.sh/projects/ecommerce-api) project specifications.

---

## 🏗️ Architecture (Monorepo)

This repository contains both the backend API and frontend application:

```
E-Commerce API/
├── E-Commerce API/       # ASP.NET Core Minimal API (Backend)
│   ├── Controllers / Endpoints
│   ├── DTOs / Models
│   ├── ECommerceDb.cs   (Entity Framework Core + SQLite)
│   └── Program.cs
│
├── ecommerce-frontend/  # React 19 + TypeScript + Tailwind CSS (Frontend)
│   ├── src/
│   │   ├── components/  # Modals, Navbar, Product Cards, Cart, Admin Panel
│   │   ├── context/     # Auth & Toast context providers
│   │   └── services/    # Live API client with fallback simulation
│   └── package.json
│
└── README.md
```

---

## 🚀 Tech Stack

### Backend
- **Framework:** ASP.NET Core (.NET 10 Minimal API)
- **Database / ORM:** SQLite + Entity Framework Core
- **Authentication:** JWT Bearer Token & Role-based Access Control (`customer` vs `admin`)

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Features:** Catalog browsing, Cart management, Checkout simulation, Admin inventory panel, and API connection tester.

---

## 🛠️ Getting Started

### 1. Prerequisites
- [.NET SDK 10](https://dotnet.microsoft.com/)
- [Node.js 20+](https://nodejs.org/)

### 2. Run the Backend
```bash
cd "E-Commerce API"
dotnet run --launch-profile http
```
The API will start listening at: `http://localhost:5175`

### 3. Run the Frontend
```bash
cd ecommerce-frontend
npm install
npm run dev
```
The application will open at: `http://localhost:5173`
