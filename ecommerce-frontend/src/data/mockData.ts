import { Product, Order, User } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Admin Developer',
    email: 'admin@nexus.com',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Cliente Demo',
    email: 'cliente@nexus.com',
    role: 'customer',
    createdAt: '2026-02-01T00:00:00Z',
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-98214',
    userId: 2,
    customerName: 'Cliente Demo',
    customerEmail: 'cliente@nexus.com',
    items: [
      {
        productId: 1,
        productName: 'Auriculares Inalámbricos Pro ANC',
        quantity: 1,
        unitPrice: 149.99,
        subtotal: 149.99
      },
      {
        productId: 5,
        productName: 'Mochila Impermeable para Portátil 16"',
        quantity: 1,
        unitPrice: 49.90,
        subtotal: 49.90
      }
    ],
    totalAmount: 199.89,
    status: 'Completed',
    paymentStatus: 'Paid',
    shippingAddress: {
      fullName: 'Cliente Demo',
      addressLine1: 'Av. Principal #123, Depto 4B',
      city: 'Madrid',
      postalCode: '28001',
      country: 'España'
    },
    createdAt: '2026-03-28T15:20:00Z',
    stripeSessionId: 'cs_test_a1b2c3d4e5f6g7h8'
  }
];
