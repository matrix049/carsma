/**
 * API service functions for interacting with the backend
 * Provides typed interfaces for all API endpoints
 */

import { apiRequest } from './api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export interface Order {
  _id: string;
  customer: Customer;
  products: OrderProduct[];
  totalPrice: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customer: Customer;
  products: OrderProduct[];
  totalPrice: number;
  paymentMethod?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  message: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
  };
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  order: Order;
}

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Fetch all products from the backend
 * @returns Array of products
 */
export async function fetchProducts(): Promise<Product[]> {
  const response = await apiRequest<{ products: Product[] }>(
    '/api/products',
    { method: 'GET' },
    false
  );
  // Enforce pricing rule: all prices are 100
  return response.products.map(product => ({
    ...product,
    price: 100
  }));
}

/**
 * Create a new order from customer checkout
 * @param orderData - Order information including customer details and products
 * @returns Order creation response with orderId
 */
export async function createOrder(
  orderData: CreateOrderRequest
): Promise<CreateOrderResponse> {
  return apiRequest<CreateOrderResponse>(
    '/api/orders',
    {
      method: 'POST',
      body: JSON.stringify(orderData),
    },
    false
  );
}

/**
 * Admin login - authenticate and receive JWT token
 * @param credentials - Admin email and password
 * @returns Login response with JWT token and admin info
 */
export async function adminLogin(
  credentials: AdminLoginRequest
): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>(
    '/api/admin/login',
    {
      method: 'POST',
      body: JSON.stringify(credentials),
    },
    false
  );
}

/**
 * Fetch all orders (admin only)
 * Requires authentication token
 * @returns Array of orders sorted by creation date (newest first)
 */
export async function fetchOrders(): Promise<Order[]> {
  const response = await apiRequest<{ orders: Order[] }>(
    '/api/orders',
    { method: 'GET' },
    true // Requires authentication
  );
  return response.orders;
}

/**
 * Update order status (admin only)
 * Requires authentication token
 * @param orderId - ID of the order to update
 * @param status - New status value
 * @returns Updated order
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
): Promise<Order> {
  const response = await apiRequest<UpdateOrderStatusResponse>(
    `/api/orders/${orderId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
    },
    true // Requires authentication
  );
  return response.order;
}
