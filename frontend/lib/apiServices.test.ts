/**
 * Unit tests for API service functions
 */

import {
  fetchProducts,
  createOrder,
  adminLogin,
  fetchOrders,
  updateOrderStatus,
} from './apiServices';
import { ApiError } from './api';

// Mock the entire api module
jest.mock('./api', () => ({
  apiRequest: jest.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public statusCode?: number,
      public details?: any
    ) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

// Import the mocked function
import { apiRequest } from './api';
const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('API Service Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        {
          _id: '1',
          name: 'Audi Wall Art',
          price: 50,
          image: '/images/audi.jpg',
          category: 'Audi',
          inStock: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce({ products: mockProducts });

      const result = await fetchProducts();

      expect(mockApiRequest).toHaveBeenCalledWith(
        '/api/products',
        { method: 'GET' },
        false
      );
      expect(result).toEqual(mockProducts);
    });

    it('should handle fetch products error', async () => {
      const error = new ApiError('Network error', 500);
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(fetchProducts()).rejects.toThrow(ApiError);
      await expect(fetchProducts()).rejects.toThrow('Network error');
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          address: '123 Main St',
        },
        products: [
          {
            productId: '1',
            name: 'Audi Wall Art',
            price: 50,
            quantity: 1,
          },
        ],
        totalPrice: 50,
      };

      const mockResponse = {
        success: true,
        orderId: 'order123',
        message: 'Order created successfully',
      };

      mockApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await createOrder(orderData);

      expect(mockApiRequest).toHaveBeenCalledWith(
        '/api/orders',
        {
          method: 'POST',
          body: JSON.stringify(orderData),
        },
        false
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation error when creating order', async () => {
      const orderData = {
        customer: {
          firstName: '',
          lastName: 'Doe',
          phone: '1234567890',
          address: '123 Main St',
        },
        products: [],
        totalPrice: 0,
      };

      const error = new ApiError('Validation error', 400);
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(createOrder(orderData)).rejects.toThrow(ApiError);
    });
  });

  describe('adminLogin', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const mockResponse = {
        token: 'jwt-token-123',
        admin: {
          id: 'admin1',
          email: 'admin@example.com',
        },
      };

      mockApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await adminLogin(credentials);

      expect(mockApiRequest).toHaveBeenCalledWith(
        '/api/admin/login',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        },
        false
      );
      expect(result).toEqual(mockResponse);
      expect(result.token).toBe('jwt-token-123');
    });

    it('should handle invalid credentials error', async () => {
      const credentials = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      const error = new ApiError('Invalid credentials', 401);
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(adminLogin(credentials)).rejects.toThrow(ApiError);
    });
  });

  describe('fetchOrders', () => {
    it('should fetch orders successfully with authentication', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          customer: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '1234567890',
            address: '123 Main St',
          },
          products: [
            {
              productId: '1',
              name: 'Audi Wall Art',
              price: 50,
              quantity: 1,
            },
          ],
          totalPrice: 50,
          paymentMethod: 'Cash on Delivery',
          status: 'pending' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce({ orders: mockOrders });

      const result = await fetchOrders();

      expect(mockApiRequest).toHaveBeenCalledWith(
        '/api/orders',
        { method: 'GET' },
        true // Requires authentication
      );
      expect(result).toEqual(mockOrders);
    });

    it('should handle unauthorized error when fetching orders', async () => {
      const error = new ApiError('Authorization header missing', 401);
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(fetchOrders()).rejects.toThrow(ApiError);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = 'order123';
      const newStatus = 'confirmed';

      const mockResponse = {
        success: true,
        order: {
          _id: orderId,
          customer: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '1234567890',
            address: '123 Main St',
          },
          products: [
            {
              productId: '1',
              name: 'Audi Wall Art',
              price: 50,
              quantity: 1,
            },
          ],
          totalPrice: 50,
          paymentMethod: 'Cash on Delivery',
          status: newStatus as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      mockApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await updateOrderStatus(orderId, newStatus);

      expect(mockApiRequest).toHaveBeenCalledWith(
        `/api/orders/${orderId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        },
        true // Requires authentication
      );
      expect(result).toEqual(mockResponse.order);
      expect(result.status).toBe('confirmed');
    });

    it('should handle order not found error', async () => {
      const orderId = 'invalid-order-id';
      const error = new ApiError('Order not found', 404);
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(
        updateOrderStatus(orderId, 'confirmed')
      ).rejects.toThrow(ApiError);
    });

    it('should handle invalid status error', async () => {
      const orderId = 'order123';
      const error = new ApiError('Invalid status', 400);
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(
        updateOrderStatus(orderId, 'confirmed')
      ).rejects.toThrow(ApiError);
    });

    it('should update to different status values', async () => {
      const orderId = 'order123';
      const statuses: Array<'pending' | 'confirmed' | 'delivered' | 'cancelled'> = [
        'pending',
        'confirmed',
        'delivered',
        'cancelled',
      ];

      for (const status of statuses) {
        const mockResponse = {
          success: true,
          order: {
            _id: orderId,
            customer: {
              firstName: 'John',
              lastName: 'Doe',
              phone: '1234567890',
              address: '123 Main St',
            },
            products: [],
            totalPrice: 50,
            paymentMethod: 'Cash on Delivery',
            status,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        };

        mockApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await updateOrderStatus(orderId, status);
        expect(result.status).toBe(status);
      }
    });
  });
});
