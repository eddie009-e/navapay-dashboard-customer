/**
 * Authentication Service
 * NavaPay Merchant Dashboard
 *
 * متوافق مع النواة المالية (fincore)
 * النواة تستخدم نظام OTP للمصادقة
 */

import { api, tokenManager, ApiResponse } from './api';

// ============================================
// Types - متوافقة مع النواة
// ============================================

export interface RequestOtpDto {
  phone: string;
  purpose: 'login' | 'register' | 'reset_pin';
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
  purpose: 'login' | 'register' | 'reset_pin';
}

export interface RegisterDto {
  otpToken: string;
  fullName?: string;
}

export interface LoginDto {
  otpToken: string;
}

export interface PinLoginRequest {
  phone: string;
  pin: string;
}

// Response من النواة
export interface OtpResponse {
  expiresIn: number;
  attemptsRemaining?: number;
}

export interface OtpVerifyResponse {
  verified: boolean;
  otpToken?: string;
  attemptsRemaining?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    phone: string;
    fullName?: string;
    name?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  requiresPinSetup?: boolean;
  device?: {
    isTrusted: boolean;
    requiresVerification: boolean;
  };
}

export interface MerchantProfile {
  id: string;
  merchantCode: string;
  businessName: string;
  businessNameAr?: string;
  businessType: string;
  status: string;
  feeRate?: string;
  settlementCycle?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
  };
  merchant: {
    id: string;
    name: string;
    type: string;
    plan: 'pos' | 'enterprise';
    logo?: string;
  };
}

// ============================================
// Auth Service - متوافق مع النواة
// ============================================

export const authService = {
  // ==========================================
  // OTP Flow (النظام الأساسي بالنواة)
  // ==========================================

  /**
   * طلب OTP
   * POST /api/v1/auth/otp/request
   */
  async requestOtp(phone: string, purpose: 'login' | 'register' | 'reset_pin' = 'login'): Promise<OtpResponse> {
    const response = await api.post<ApiResponse<OtpResponse>>('/auth/otp/request', {
      phone,
      purpose,
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'فشل في إرسال رمز التحقق');
  },

  /**
   * التحقق من OTP
   * POST /api/v1/auth/otp/verify
   */
  async verifyOtp(phone: string, code: string, purpose: 'login' | 'register' | 'reset_pin' = 'login'): Promise<OtpVerifyResponse> {
    const response = await api.post<ApiResponse<OtpVerifyResponse>>('/auth/otp/verify', {
      phone,
      code,
      purpose,
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'رمز التحقق غير صحيح');
  },

  /**
   * تسجيل مستخدم جديد (بعد التحقق من OTP)
   * POST /api/v1/auth/register
   */
  async register(otpToken: string, fullName?: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      otpToken,
      fullName,
    });

    if (response.success && response.data) {
      const { tokens, user } = response.data;
      tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
      tokenManager.setUserData(user);
      return response.data;
    }

    throw new Error(response.message || 'فشل في التسجيل');
  },

  /**
   * تسجيل الدخول (بعد التحقق من OTP)
   * POST /api/v1/auth/login
   */
  async login(otpToken: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      otpToken,
    });

    if (response.success && response.data) {
      const { tokens, user } = response.data;
      tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
      tokenManager.setUserData(user);
      return response.data;
    }

    throw new Error(response.message || 'فشل في تسجيل الدخول');
  },

  /**
   * تسجيل دخول الموظف بـ PIN
   * POST /api/v1/merchant/pos/login
   */
  async loginWithPin(credentials: PinLoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<{ employee: any; permissions: string[] }>>(
      '/merchant/pos/login',
      credentials,
    );

    if (response.success && response.data) {
      const { employee, permissions: _permissions } = response.data;

      // تحويل Response للشكل المتوقع
      const loginResponse: LoginResponse = {
        accessToken: '', // POS login قد لا يعطي tokens
        refreshToken: '',
        user: {
          id: employee.id,
          name: employee.name,
          phone: employee.phone,
          role: employee.role,
        },
        merchant: {
          id: '',
          name: '',
          type: 'pos',
          plan: 'pos',
        },
      };

      tokenManager.setUserData(loginResponse.user);
      return loginResponse;
    }

    throw new Error(response.message || 'فشل في تسجيل الدخول');
  },

  /**
   * تسجيل الخروج
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      tokenManager.clearTokens();
    }
  },

  /**
   * تسجيل الخروج من جميع الأجهزة
   * POST /api/v1/auth/logout-all
   */
  async logoutAll(): Promise<{ terminatedSessions: number }> {
    const response = await api.post<ApiResponse<{ terminatedSessions: number }>>('/auth/logout-all');
    tokenManager.clearTokens();

    if (response.success && response.data) {
      return response.data;
    }

    return { terminatedSessions: 0 };
  },

  // ==========================================
  // PIN Management
  // ==========================================

  /**
   * تعيين PIN
   * POST /api/v1/auth/pin/set
   */
  async setPin(pin: string, confirmPin: string): Promise<void> {
    const response = await api.post<ApiResponse>('/auth/pin/set', {
      pin,
      confirmPin,
    });

    if (!response.success) {
      throw new Error(response.message || 'فشل في تعيين PIN');
    }
  },

  /**
   * طلب OTP لتغيير PIN
   * POST /api/v1/auth/pin/change/request
   */
  async requestPinChangeOtp(): Promise<{ expiresIn: number }> {
    const response = await api.post<ApiResponse<{ expiresIn: number }>>('/auth/pin/change/request');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'فشل في إرسال رمز التحقق');
  },

  /**
   * تغيير PIN مع OTP
   * POST /api/v1/auth/pin/change/confirm
   */
  async changePinWithOtp(otp: string, currentPin: string, newPin: string, confirmNewPin: string): Promise<void> {
    const response = await api.post<ApiResponse>('/auth/pin/change/confirm', {
      otp,
      currentPin,
      newPin,
      confirmNewPin,
    });

    if (!response.success) {
      throw new Error(response.message || 'فشل في تغيير PIN');
    }
  },

  /**
   * تغيير PIN (بدون OTP - deprecated)
   * POST /api/v1/auth/pin/change
   */
  async changePin(currentPin: string, newPin: string, confirmNewPin: string): Promise<void> {
    const response = await api.post<ApiResponse>('/auth/pin/change', {
      currentPin,
      newPin,
      confirmNewPin,
    });

    if (!response.success) {
      throw new Error(response.message || 'فشل في تغيير PIN');
    }
  },

  /**
   * التحقق من PIN
   * POST /api/v1/auth/pin/verify
   */
  async verifyPin(pin: string, action?: string, amount?: number): Promise<{ pinToken: string; expiresIn: number }> {
    const response = await api.post<ApiResponse<{ pinToken: string; expiresIn: number }>>('/auth/pin/verify', {
      pin,
      action,
      amount,
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'PIN غير صحيح');
  },

  /**
   * طلب إعادة تعيين PIN
   * POST /api/v1/auth/pin/reset/request
   */
  async requestPinReset(phone: string): Promise<{ expiresIn: number }> {
    const response = await api.post<ApiResponse<{ expiresIn: number }>>('/auth/pin/reset/request', {
      phone,
      purpose: 'reset_pin',
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'فشل في إرسال رمز التحقق');
  },

  /**
   * تأكيد إعادة تعيين PIN
   * POST /api/v1/auth/pin/reset/confirm
   */
  async confirmPinReset(otpToken: string, newPin: string, confirmNewPin: string): Promise<void> {
    const response = await api.post<ApiResponse>('/auth/pin/reset/confirm', {
      otpToken,
      newPin,
      confirmNewPin,
    });

    if (!response.success) {
      throw new Error(response.message || 'فشل في إعادة تعيين PIN');
    }
  },

  // ==========================================
  // Merchant Profile
  // ==========================================

  /**
   * الحصول على ملف التاجر
   * GET /api/v1/merchant/profile
   */
  async getProfile(): Promise<MerchantProfile> {
    const response = await api.get<ApiResponse<MerchantProfile>>('/merchant/profile');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('فشل في الحصول على الملف الشخصي');
  },

  /**
   * تحديث ملف التاجر
   * PATCH /api/v1/merchant/profile
   */
  async updateProfile(data: Partial<{
    businessNameAr: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    logo: string;
  }>): Promise<void> {
    const response = await api.patch<ApiResponse>('/merchant/profile', data);
    if (!response.success) {
      throw new Error(response.message || 'فشل في تحديث الملف الشخصي');
    }
  },

  /**
   * تسجيل كتاجر
   * POST /api/v1/merchant/register
   */
  async registerMerchant(data: {
    businessName: string;
    businessNameAr?: string;
    businessType: string;
    categoryCode?: string;
    registrationNumber?: string;
    taxId?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
  }): Promise<{ merchantId: string; merchantCode: string; status: string }> {
    const response = await api.post<ApiResponse<{ merchantId: string; merchantCode: string; status: string }>>(
      '/merchant/register',
      data,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'فشل في تسجيل التاجر');
  },

  // ==========================================
  // Session & Utility
  // ==========================================

  /**
   * الحصول على معلومات الجلسة
   * GET /api/v1/auth/session
   */
  async getSession(): Promise<any> {
    const response = await api.get<ApiResponse>('/auth/session');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('فشل في الحصول على معلومات الجلسة');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },

  /**
   * Get stored user data
   */
  getUser() {
    return tokenManager.getUserData();
  },

  /**
   * Get stored merchant data
   */
  getMerchant() {
    return tokenManager.getMerchantData();
  },
};

export default authService;
