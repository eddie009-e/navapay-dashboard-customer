/**
 * API Service Layer - Base Configuration
 * NavaPay Merchant Dashboard
 */

// Base URL - يُقرأ من متغير البيئة VITE_API_URL
// ⚠️ يجب ضبط VITE_API_URL في ملف .env (مثلاً: http://78.47.51.234:8090/api/v1)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Token Storage Keys
const ACCESS_TOKEN_KEY = 'nava_access_token';
const REFRESH_TOKEN_KEY = 'nava_refresh_token';
const USER_DATA_KEY = 'nava_user_data';
const MERCHANT_DATA_KEY = 'nava_merchant_data';
const DEVICE_ID_KEY = 'nava_device_id';

// Device Info - مطلوب للنواة
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'web_' + generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

const getDeviceHeaders = (): Record<string, string> => {
  return {
    'X-Device-Id': getDeviceId(),
    'X-Device-Type': 'web',
    'X-Device-Name': navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
    'X-Os-Version': navigator.platform || 'Unknown',
    'X-App-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
  };
};

// Token Management
export const tokenManager = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(MERCHANT_DATA_KEY);
  },

  getUserData: () => {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  setUserData: (data: any) => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  },

  getMerchantData: () => {
    const data = localStorage.getItem(MERCHANT_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  setMerchantData: (data: any) => {
    localStorage.setItem(MERCHANT_DATA_KEY, JSON.stringify(data));
  },

  isAuthenticated: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  total: number;
  totalPages: number;
}

// API Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP Request Helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getDeviceHeaders(), // إضافة معلومات الجهاز
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle token refresh on 401
    if (response.status === 401 && tokenManager.getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry original request
        return request(endpoint, options);
      }
      // Refresh failed, clear tokens and redirect
      tokenManager.clearTokens();
      window.location.href = '/login';
      throw new ApiError('Session expired', 401);
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Request failed',
        response.status,
        data,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
    );
  }
}

// Token Refresh
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.accessToken) {
      tokenManager.setTokens(data.accessToken, data.refreshToken || refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Export API Methods
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  },

  post: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export default api;
