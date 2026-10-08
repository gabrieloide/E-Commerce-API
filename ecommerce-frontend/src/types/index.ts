// Data models matching the E-Commerce API requirements

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'admin';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt?: string;
}

export interface CartItem {
  id: number; // CartItem ID or Product ID
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string | number;
  userId: string | number;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  shippingAddress: ShippingAddress;
  createdAt: string;
  stripeSessionId?: string;
}

export interface CheckoutRequest {
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  orderId: string | number;
  checkoutUrl?: string; // Stripe Checkout session URL
  message: string;
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  authRequired: boolean;
  requiredRole?: 'admin' | 'customer';
  requestBody?: any;
  responseBody?: any;
}
