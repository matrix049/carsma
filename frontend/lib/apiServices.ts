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
  /**
   * Free-form size string shown on the product page. Defaults to
   * `120cm x 35cm` on the backend; admins can override per product.
   */
  dimensions?: string;
  /** Pieces left when tracked (the limited 3D editions); null/absent = not tracked, 0 = sold out. */
  stockQuantity?: number | null;
  /** Extra photos shown after `image` on the product page. */
  gallery?: string[];
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

export type OrderFinish = 'brilliant' | 'matte' | null;

export interface Order {
  _id: string;
  orderNumber: number;
  customer: Customer;
  products: OrderProduct[];
  totalPrice: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  /** Finish chosen for the wall art — set by admins after confirming with the customer. */
  finish?: OrderFinish;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderRequest {
  status?: Order['status'];
  finish?: OrderFinish;
  products?: OrderProduct[];
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

/** The short card the chat assistant writes for the team. */
export interface RequestBrief {
  want: string;
  piece?: string;
  side?: string;
  style?: string;
  colour?: string;
  size?: string;
  price?: string;
  /** What the customer still waits for from the team. */
  pending?: string;
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
  /** "chatbot" when confirmed in the chat assistant. */
  source?: 'form' | 'chatbot';
  transcript?: ChatTurn[];
  /** Chat requests: what the customer wants in one line + key details. */
  brief?: RequestBrief;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomOrderRequest {
  firstName: string;
  /** Optional — the customize form only collects a single name field. */
  lastName?: string;
  phone: string;
  /** Optional — the customize form skips email; admins see whatever's stored. */
  email?: string;
  carName: string;
  /** Optional — frontend folds brand + model into `carName`. */
  model?: string;
  year: string;
  notes?: string;
}

export interface ContactMessage {
  _id: string;
  customer: {
    name: string;
    phone?: string;
    /** Legacy field — older records used email instead of phone. */
    email?: string;
  };
  message: string;
  status: 'unread' | 'read' | 'resolved' | 'archived';
  /** "chatbot" for hand-offs from the chat assistant. Older records have none. */
  source?: 'form' | 'chatbot';
  transcript?: ChatTurn[];
  /** Chat requests: what the customer wants in one line + key details. */
  brief?: RequestBrief;
  createdAt: string;
  updatedAt: string;
}

/** One message in a chat-assistant conversation. */
export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatReply {
  reply: string;
  offerHandoff: boolean;
  /** The assistant asked "do you want to confirm your order?" — recap in orderSummary. */
  askConfirm?: boolean;
  orderSummary?: string[];
  products: Pick<Product, '_id' | 'name' | 'price' | 'image' | 'category' | 'inStock'>[];
}

export interface CreateContactMessageRequest {
  name: string;
  phone: string;
  message: string;
}

// ============================================================================
// Public API Functions
// ============================================================================

// Last product list seen in this tab. Lets a product page render instantly
// on client-side navigation (and its image morph from the card) while a
// fresh fetch still runs. Never served instead of a fetch.
let lastProducts: Product[] | null = null;

/** Products from the most recent fetchProducts() call, if any. */
export function peekProducts(): Product[] | null {
  return lastProducts;
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await apiRequest<{ products: Product[] }>(
    '/api/products',
    { method: 'GET' },
    false
  );
  lastProducts = response.products;
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
 * Update an order (admin only).
 *
 * Accepts any subset of `status`, `finish`, `products`. Server recalculates
 * totalPrice when products change so it can't drift.
 */
export async function updateOrder(
  orderId: string,
  updates: UpdateOrderRequest,
): Promise<Order> {
  const response = await apiRequest<UpdateOrderStatusResponse>(
    `/api/orders/${orderId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    true,
  );
  return response.order;
}

/**
 * Update only the status — kept for back-compat with existing call sites.
 * New code should use {@link updateOrder} directly.
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
): Promise<Order> {
  return updateOrder(orderId, { status });
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
 * Ask the chat assistant. Throws ApiError (status 503) when no AI model is
 * available — callers fall back to built-in answers.
 */
export async function sendChatMessage(messages: ChatTurn[], language: string): Promise<ChatReply> {
  return apiRequest<ChatReply>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, language }),
  });
}

/** Confirm an order from the chat (lands in Admin → Custom Orders). */
export async function sendChatOrder(data: {
  name: string;
  phone: string;
  language: string;
  summary: string[];
  item?: string;
  messages: ChatTurn[];
}): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/api/chat/order', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Send a chat conversation to the team (lands in Admin → Contact Messages). */
export async function sendChatHandoff(data: {
  name: string;
  phone: string;
  note?: string;
  language: string;
  messages: ChatTurn[];
  details?: string[];
}): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/api/chat/handoff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
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
 * Upload product image (Admin only)
 * Requires authentication token
 * @param imageFile - Image file to upload
 * @returns Upload response with image URL
 */
export async function uploadProductImage(imageFile: File): Promise<{ success: boolean; imageUrl: string; filename: string }> {
  const formData = new FormData();
  formData.append('image', imageFile);

  // Get token from localStorage (same key as AuthContext)
  const token = localStorage.getItem('wall-decoration-auth-token');
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // Don't set Content-Type for FormData, let browser set it
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload image');
  }

  return response.json();
}

/**
 * Delete uploaded image (Admin only)
 * Requires authentication token
 * @param filename - Name of the file to delete
 * @returns Success response
 */
export async function deleteUploadedImage(filename: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(
    `/api/upload/image/${filename}`,
    {
      method: 'DELETE',
    },
    true // Requires authentication
  );
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
  dimensions?: string;
  stockQuantity?: number | null;
  gallery?: string[];
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
  dimensions?: string;
  stockQuantity?: number | null;
  gallery?: string[];
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

// ============================================================================
// Dashboard numbers (Admin only)
// ============================================================================

export type StatsRange = 'today' | '7d' | '30d' | '90d';

export interface Compare {
  current: number;
  previous: number;
}

export interface ProductPerformance {
  _id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  stockQuantity: number | null;
  inStock: boolean;
  views: number;
  visitors: number;
  clicks: number;
  addToCart: number;
  sold: number;
  revenue: number;
}

export interface Overview {
  range: { key: StatsRange; days: number; from: string; to: string; bucket: 'hour' | 'day'; timeZone: string };
  /** First page view of the site-wide tracker; before it only product views were counted. */
  trackingSince: string | null;
  kpis: {
    revenue: Compare;
    orders: Compare;
    avgOrder: Compare;
    visitors: Compare;
    pageViews: Compare;
    /** Orders ÷ visitors, in %. */
    conversion: Compare;
  };
  /** One row per hour (today) or per day, oldest first, in Moroccan time. */
  series: { key: string; orders: number; revenue: number; visitors: number; pageViews: number }[];
  orderStatus: { pending: number; confirmed: number; delivered: number; cancelled: number };
  pendingValue: number;
  funnel: { visitors: number; viewedProduct: number; addedToCart: number; checkout: number; orders: number };
  actions: {
    productClicks: Compare;
    addToCart: Compare;
    whatsapp: Compare;
    calls: Compare;
    instagram: Compare;
    chats: Compare;
  };
  requests: { chatOrders: number; chatQuestions: number; formRequests: number; formMessages: number };
  devices: { device: string; visitors: number }[];
  sources: { source: string; visits: number }[];
  pages: { page: string; views: number; visitors: number }[];
  cities: { city: string; orders: number }[];
  products: ProductPerformance[];
  inbox: {
    pendingOrders: number;
    newCustomOrders: number;
    unreadMessages: number;
    soldOut: number;
    lowStock: { _id: string; name: string; stockQuantity: number }[];
  };
}

export async function fetchOverview(range: StatsRange, fresh = false): Promise<Overview> {
  const res = await apiRequest<{ success: boolean; data: Overview }>(
    `/api/analytics/overview?range=${range}${fresh ? '&fresh=1' : ''}`,
    { method: 'GET' },
    true,
  );
  return res.data;
}
