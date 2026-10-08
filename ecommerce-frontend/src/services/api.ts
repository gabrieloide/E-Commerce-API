import { 
  AuthResponse, 
  CheckoutRequest, 
  CheckoutResponse, 
  LoginRequest, 
  Order, 
  Product, 
  RegisterRequest, 
  User 
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, MOCK_USERS } from '../data/mockData';

// Configuration keys in localStorage
const STORAGE_PREFIX = 'nexus_ecommerce_';
const TOKEN_KEY = `${STORAGE_PREFIX}jwt_token`;
const USER_KEY = `${STORAGE_PREFIX}user`;
const PRODUCTS_KEY = `${STORAGE_PREFIX}products`;
const ORDERS_KEY = `${STORAGE_PREFIX}orders`;
const CONFIG_KEY = `${STORAGE_PREFIX}config`;

export interface ApiConfig {
  baseUrl: string;
  useMock: boolean;
}

export const getApiConfig = (): ApiConfig => {
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    baseUrl: 'http://localhost:5175/api',
    useMock: true // Starts in mock mode so the frontend is 100% functional immediately, can be toggled in 1 click
  };
};

export const saveApiConfig = (config: ApiConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

// Token helpers
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setStoredUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

// Initial Mock storage setup
const initMockStorage = () => {
  // Clear any placeholder products previously cached in browser
  if (localStorage.getItem(PRODUCTS_KEY) && JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]').length > 0) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  }
};
initMockStorage();

// Generic HTTP fetch wrapper for Live Backend
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config = getApiConfig();
  const token = getStoredToken();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${config.baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const cloned = response.clone();
        const errorData = await cloned.json();
        errorMessage = errorData.message || errorData.title || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
      } catch {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    // Check if response has content
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error(`No se pudo conectar a la API en "${url}". ¿Está corriendo tu backend C# y tiene CORS habilitado?`);
    }
    throw err;
  }
}

// -------------------------------------------------------------
// API CLIENT IMPLEMENTATION
// -------------------------------------------------------------
export const api = {
  // Config
  getConfig: getApiConfig,
  saveConfig: saveApiConfig,

  // Authentication
  auth: {
    async login(req: LoginRequest): Promise<AuthResponse> {
      const config = getApiConfig();
      if (!config.useMock) {
        const res = await fetchWithAuth<any>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(req),
        });
        const token = res.token || 'live_session_token';
        const user = res.user || (res.email ? res : {
          id: res.id || 1,
          email: req.email,
          name: req.email.split('@')[0],
          role: req.email.includes('admin') ? 'admin' : 'customer'
        });
        setStoredToken(token);
        setStoredUser(user);
        return { token, user };
      }

      // Mock login simulation
      await new Promise(r => setTimeout(r, 400));
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === req.email.toLowerCase());
      const role = (foundUser?.role || (req.email.includes('admin') ? 'admin' : 'customer')) as 'admin' | 'customer';
      const user: User = {
        id: foundUser ? foundUser.id : Date.now(),
        email: req.email,
        name: foundUser ? foundUser.name : req.email.split('@')[0],
        role: role,
        createdAt: new Date().toISOString()
      };

      const mockToken = `mock_jwt_token_${btoa(JSON.stringify({ sub: user.email, role: user.role }))}`;
      setStoredToken(mockToken);
      setStoredUser(user);
      return { token: mockToken, user };
    },

    async register(req: RegisterRequest): Promise<AuthResponse> {
      const config = getApiConfig();
      if (!config.useMock) {
        const res = await fetchWithAuth<any>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(req),
        });
        const token = res.token || 'registered_session_token';
        const user = res.user || (res.email ? res : req);
        setStoredToken(token);
        setStoredUser(user);
        return { token, user };
      }

      // Mock register simulation
      await new Promise(r => setTimeout(r, 400));
      const role = (req.role || (req.email.includes('admin') ? 'admin' : 'customer')) as 'admin' | 'customer';
      const user: User = {
        id: Date.now(),
        email: req.email,
        name: req.name,
        role: role,
        createdAt: new Date().toISOString()
      };

      const mockToken = `mock_jwt_token_${btoa(JSON.stringify({ sub: user.email, role: user.role }))}`;
      setStoredToken(mockToken);
      setStoredUser(user);
      return { token: mockToken, user };
    },

    logout() {
      setStoredToken(null);
      setStoredUser(null);
    }
  },

  // Products
  products: {
    async getAll(params?: { search?: string; category?: string }): Promise<Product[]> {
      const config = getApiConfig();
      if (!config.useMock) {
        try {
          const query = new URLSearchParams();
          if (params?.search) query.append('search', params.search);
          if (params?.category) query.append('category', params.category);
          const queryStr = query.toString() ? `?${query.toString()}` : '';
          return await fetchWithAuth<Product[]>(`/products${queryStr}`);
        } catch {
          // Si aún no has implementado /api/products en C#, usamos la lista visual
          // para que puedas probar Auth y Registro sin que la página quede rota
          return INITIAL_PRODUCTS;
        }
      }

      // Mock filtering
      await new Promise(r => setTimeout(r, 200));
      let products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
      if (params?.search) {
        const q = params.search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      if (params?.category && params.category !== 'Todos') {
        products = products.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
      }
      return products;
    },

    async getById(id: number): Promise<Product> {
      const config = getApiConfig();
      if (!config.useMock) {
        return fetchWithAuth<Product>(`/products/${id}`);
      }
      const products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
      const product = products.find(p => p.id === id);
      if (!product) throw new Error(`Producto con ID #${id} no encontrado.`);
      return product;
    },

    async create(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
      const config = getApiConfig();
      if (!config.useMock) {
        return fetchWithAuth<Product>('/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
      }

      const products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
      const newProduct: Product = {
        ...productData,
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        createdAt: new Date().toISOString()
      };
      products.unshift(newProduct);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return newProduct;
    },

    async update(id: number, productData: Partial<Product>): Promise<Product> {
      const config = getApiConfig();
      if (!config.useMock) {
        return fetchWithAuth<Product>(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
      }

      const products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Producto no encontrado');
      const updated = { ...products[index], ...productData };
      products[index] = updated;
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return updated;
    },

    async delete(id: number): Promise<void> {
      const config = getApiConfig();
      if (!config.useMock) {
        return fetchWithAuth<void>(`/products/${id}`, {
          method: 'DELETE',
        });
      }

      let products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
      products = products.filter(p => p.id !== id);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    },

    resetToDefault() {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
  },

  // Checkout and Orders
  checkout: {
    async createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResponse> {
      const config = getApiConfig();
      if (!config.useMock) {
        return fetchWithAuth<CheckoutResponse>('/checkout', {
          method: 'POST',
          body: JSON.stringify(request),
        });
      }

      await new Promise(r => setTimeout(r, 600));
      const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      const products: Product[] = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
      const currentUser = getStoredUser();

      const orderItems = request.items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        const price = prod?.price || 0;
        return {
          productId: item.productId,
          productName: prod?.name || `Producto #${item.productId}`,
          quantity: item.quantity,
          unitPrice: price,
          subtotal: price * item.quantity
        };
      });

      const total = orderItems.reduce((acc, i) => acc + i.subtotal, 0);
      const newOrder: Order = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: currentUser?.id || 'guest',
        customerName: request.shippingAddress.fullName,
        customerEmail: currentUser?.email || 'cliente@ejemplo.com',
        items: orderItems,
        totalAmount: Number(total.toFixed(2)),
        status: 'Completed',
        paymentStatus: 'Paid',
        shippingAddress: request.shippingAddress,
        createdAt: new Date().toISOString(),
        stripeSessionId: `cs_test_${Math.random().toString(36).substring(2)}`
      };

      // Deduct stock in mock
      products.forEach(p => {
        const bought = request.items.find(i => i.productId === p.id);
        if (bought) {
          p.stock = Math.max(0, p.stock - bought.quantity);
        }
      });
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

      orders.unshift(newOrder);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

      return {
        orderId: newOrder.id,
        checkoutUrl: 'simulated_stripe_success',
        message: 'Sesión de pago Stripe creada exitosamente.'
      };
    }
  },

  orders: {
    async getAll(): Promise<Order[]> {
      const config = getApiConfig();
      if (!config.useMock) {
        return fetchWithAuth<Order[]>('/orders');
      }
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    },

    async updateStatus(orderId: string | number, status: Order['status']): Promise<Order> {
      const config = getApiConfig();
      if (!config.useMock) {
        return fetchWithAuth<Order>(`/orders/${orderId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      }

      const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      const order = orders.find(o => String(o.id) === String(orderId));
      if (!order) throw new Error('Orden no encontrada');
      order.status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return order;
    }
  }
};
