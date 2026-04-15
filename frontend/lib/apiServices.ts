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

export interface CustomOrder {
  _id: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  carDetails: {
    carName: string;
    model: string;
    year: string;
  };
  status: 'pending' | 'reviewed' | 'contacted' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomOrderRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  carName: string;
  model: string;
  year: string;
  notes?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  pendingOrders: number;
}

export interface ContactMessage {
  _id: string;
  customer: {
    name: string;
    email: string;
  };
  message: string;
  status: 'unread' | 'read' | 'resolved' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactMessageRequest {
  name: string;
  email: string;
  message: string;
}

// ============================================================================
// Public API Functions
// ============================================================================

export async function fetchProducts(): Promise<Product[]> {
  const response = await apiRequest<{ products: Product[] }>(
    '/api/products',
    { method: 'GET' },
    false
  );
  return response.products;
}

/**
 * Fetch single product by ID
 * @param id - Product ID
 * @returns Single product
 */
export async function fetchProductById(id: string): Promise<Product> {
  const response = await apiRequest<{ product: Product }>(
    `/api/products/${id}`,
    { method: 'GET' },
    false
  );
  return response.product;
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
 * Fetch dashboard analytics/stats
 * @returns DashboardStats object
 */
export async function fetchStats(): Promise<DashboardStats> {
  const orders = await fetchOrders();
  const totalRevenue = orders
    .filter(o => o.status === 'confirmed' || o.status === 'delivered')
    .reduce((acc, order) => acc + order.totalPrice, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  return {
    totalRevenue,
    orderCount: orders.length,
    pendingOrders
  };
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

/**
 * Submit a request for a custom wall art design
 * @param data - Custom car details and customer contact info
 */
export async function createCustomOrder(
  data: CreateCustomOrderRequest
): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(
    '/api/custom-orders',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    false
  );
}

/**
 * Fetch all custom design requests (Admin only)
 * @returns Array of custom orders
 */
export async function fetchCustomOrders(): Promise<CustomOrder[]> {
  const response = await apiRequest<{ customOrders: CustomOrder[] }>(
    '/api/custom-orders',
    { method: 'GET' },
    true
  );
  return response.customOrders;
}

/**
 * Update custom order status (Admin only)
 * @param id - Request ID
 * @param status - New status
 */
export async function updateCustomOrderStatus(
  id: string,
  status: CustomOrder['status']
): Promise<CustomOrder> {
  const response = await apiRequest<{ success: boolean; customOrder: CustomOrder }>(
    `/api/custom-orders/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
    },
    true
  );
  return response.customOrder;
}

/**
 * Submit a contact message from the public contact form
 * @param data - Contact message data with name, email, and message
 * @returns Success response
 */
export async function createContactMessage(
  data: CreateContactMessageRequest
): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(
    '/api/contact',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    false // Public endpoint
  );
}

/**
 * Fetch all contact messages (Admin only)
 * Requires authentication token
 * @returns Array of contact messages sorted by creation date (newest first)
 */
export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const response = await apiRequest<{ contactMessages: ContactMessage[] }>(
    '/api/contact',
    { method: 'GET' },
    true // Requires authentication
  );
  return response.contactMessages;
}

/**
 * Update contact message status (Admin only)
 * Requires authentication token
 * @param id - ID of the contact message to update
 * @param status - New status value
 * @returns Updated contact message
 */
export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status']
): Promise<ContactMessage> {
  const response = await apiRequest<{ success: boolean; contactMessage: ContactMessage }>(
    `/api/contact/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
    },
    true // Requires authentication
  );
  return response.contactMessage;
}

/**
 * Create a new product (Admin only)
 * Requires authentication token
 * @param productData - Product information including name, price, image, description, category
 * @returns Created product
 */
export async function createProduct(productData: {
  name: string;
  price: number;
  image: string;
  description?: string;
  category: string;
  inStock?: boolean;
}): Promise<Product> {
  const response = await apiRequest<{ success: boolean; product: Product }>(
    '/api/products',
    {
      method: 'POST',
      body: JSON.stringify(productData),
    },
    true // Requires authentication
  );
  return response.product;
}

/**
 * Update an existing product (Admin only)
 * Requires authentication token
 * @param productId - ID of the product to update
 * @param productData - Updated product information
 * @returns Updated product
 */
export async function updateProduct(productId: string, productData: {
  name: string;
  price: number;
  image: string;
  description?: string;
  category: string;
  inStock?: boolean;
}): Promise<Product> {
  const response = await apiRequest<{ success: boolean; product: Product }>(
    `/api/products/${productId}`,
    {
      method: 'PUT',
      body: JSON.stringify(productData),
    },
    true // Requires authentication
  );
  return response.product;
}

/**
 * Delete a product (Admin only)
 * Requires authentication token
 * @param productId - ID of the product to delete
 * @returns Success response
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(
    `/api/products/${productId}`,
    {
      method: 'DELETE',
    },
    true // Requires authentication
  );
}
