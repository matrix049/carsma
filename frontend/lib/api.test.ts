/**
 * Unit tests for centralized API request handler
 */

import { apiRequest, ApiError } from './api';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('apiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('should make successful GET request', async () => {
    const mockData = { products: [{ id: '1', name: 'Test Product' }] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await apiRequest('/api/products');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/products',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result).toEqual(mockData);
  });

  it('should make successful POST request with body', async () => {
    const requestBody = { email: 'test@example.com', password: 'password' };
    const mockResponse = { token: 'abc123' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/admin/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestBody),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should add authorization header for authenticated requests', async () => {
    const token = 'test-jwt-token';
    localStorageMock.setItem('authToken', token);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ orders: [] }),
    });

    await apiRequest('/api/orders', { method: 'GET' }, true);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/orders',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      })
    );
  });

  it('should throw ApiError for HTTP error responses', async () => {
    const errorMessage = 'Invalid credentials';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: true, message: errorMessage }),
    });

    try {
      await apiRequest('/api/admin/login');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe(errorMessage);
      expect((error as ApiError).statusCode).toBe(401);
    }
  });

  it('should throw ApiError with status code for HTTP errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: true, message: 'Not found' }),
    });

    try {
      await apiRequest('/api/orders/invalid-id');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(404);
    }
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new TypeError('Network request failed')
    );

    await expect(apiRequest('/api/products')).rejects.toThrow(ApiError);
    await expect(apiRequest('/api/products')).rejects.toThrow(
      /Network error/
    );
  });

  it('should handle JSON parsing errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Invalid JSON');
      },
    });

    try {
      await apiRequest('/api/products');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toMatch(/Failed to parse server response/);
    }
  });

  it('should handle missing authorization token gracefully', async () => {
    // No token in localStorage
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ orders: [] }),
    });

    await apiRequest('/api/orders', { method: 'GET' }, true);

    // Should still make the request without Authorization header
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/orders',
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.anything(),
        }),
      })
    );
  });

  it('should preserve custom headers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiRequest(
      '/api/test',
      {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      },
      false
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        }),
      })
    );
  });
});
