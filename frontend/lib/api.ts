/**
 * Centralized API request handler with error handling
 * Handles network errors, HTTP error responses, JSON parsing, and authorization
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Centralized API request function
 * @param endpoint - API endpoint path (e.g., '/api/products')
 * @param options - Fetch options (method, body, headers, etc.)
 * @param requiresAuth - Whether the request requires authentication
 * @returns Parsed JSON response
 * @throws ApiError for network errors or HTTP error responses
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = false
): Promise<T> {
  try {
    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge existing headers if provided
    if (options.headers) {
      const existingHeaders = new Headers(options.headers);
      existingHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    }

    // Add authorization header for authenticated requests
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse JSON response
    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      // If JSON parsing fails, throw error with status code
      throw new ApiError(
        'Failed to parse server response',
        response.status
      );
    }

    // Handle HTTP error responses
    if (!response.ok) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data.details
      );
    }

    return data as T;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError(
        'Network error: Unable to connect to the server. Please check your internet connection.',
        undefined,
        error
      );
    }

    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle unknown errors
    throw new ApiError(
      'An unexpected error occurred. Please try again later.',
      undefined,
      error
    );
  }
}

/**
 * Get authentication token from localStorage
 * @returns JWT token or null if not found
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('wall-decoration-auth-token');
}
