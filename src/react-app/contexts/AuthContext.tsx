/**
 * Authentication Context
 * NavaPay Merchant Dashboard
 *
 * متوافق مع النواة المالية (fincore) - OTP Flow
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, tokenManager, PinLoginRequest, LoginResponse, MerchantProfile, OtpResponse, OtpVerifyResponse, AuthResponse } from '../services';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  plan?: 'pos' | 'enterprise';
  merchantName?: string;
}

interface Merchant {
  id: string;
  name: string;
  type: string;
  plan: 'pos' | 'enterprise';
  logo?: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // OTP Flow methods
  requestOtp: (phone: string, purpose?: 'login' | 'register' | 'reset_pin') => Promise<OtpResponse>;
  verifyOtp: (phone: string, code: string, purpose?: 'login' | 'register' | 'reset_pin') => Promise<OtpVerifyResponse>;
  loginWithOtp: (otpToken: string) => Promise<AuthResponse>;
  registerWithOtp: (otpToken: string, fullName?: string, email?: string, password?: string) => Promise<AuthResponse>;
  // Password Login (for merchants)
  loginWithPassword: (email: string, password: string) => Promise<AuthResponse>;
  // PIN Login (for employees)
  loginWithPin: (credentials: PinLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<MerchantProfile>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isEnterprise: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = tokenManager.getUserData();
      const storedMerchant = tokenManager.getMerchantData();

      if (tokenManager.isAuthenticated() && storedUser) {
        setUser(storedUser as User);
        if (storedMerchant) {
          setMerchant(storedMerchant as Merchant);
        }

        // Try to load merchant profile
        try {
          const profile = await authService.getProfile();
          const merchantData: Merchant = {
            id: profile.id,
            name: profile.businessNameAr || profile.businessName,
            type: profile.businessType,
            plan: 'enterprise', // Will be determined by backend
            logo: profile.logoUrl,
            address: profile.address,
            phone: profile.contactPhone,
          };
          setMerchant(merchantData);
          tokenManager.setMerchantData(merchantData);

          // Update user with merchant name
          setUser(prev => prev ? { ...prev, merchantName: merchantData.name } : prev);
        } catch (error) {
          console.error('Profile fetch failed, using stored data:', error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // OTP Flow Methods
  const requestOtp = useCallback(async (phone: string, purpose: 'login' | 'register' | 'reset_pin' = 'login'): Promise<OtpResponse> => {
    return authService.requestOtp(phone, purpose);
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string, purpose: 'login' | 'register' | 'reset_pin' = 'login'): Promise<OtpVerifyResponse> => {
    return authService.verifyOtp(phone, code, purpose);
  }, []);

  const loginWithOtp = useCallback(async (otpToken: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(otpToken);

      const userData: User = {
        id: response.user.id,
        name: response.user.fullName || response.user.name || '',
        phone: response.user.phone,
        role: 'owner',
      };

      setUser(userData);
      tokenManager.setUserData(userData);

      // Load merchant profile
      try {
        const profile = await authService.getProfile();
        const merchantData: Merchant = {
          id: profile.id,
          name: profile.businessNameAr || profile.businessName,
          type: profile.businessType,
          plan: 'enterprise',
          logo: profile.logoUrl,
          address: profile.address,
          phone: profile.contactPhone,
        };
        setMerchant(merchantData);
        tokenManager.setMerchantData(merchantData);

        // Update user with merchant name
        const updatedUser: User = { ...userData, merchantName: merchantData.name };
        setUser(updatedUser);
        tokenManager.setUserData(updatedUser);
      } catch (error) {
        console.error('New user without merchant profile:', error);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithPassword = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithPassword(email, password);

      const userData: User = {
        id: response.user.id,
        name: response.user.fullName || response.user.name || '',
        phone: response.user.phone,
        email,
        role: 'owner',
      };

      setUser(userData);
      tokenManager.setUserData(userData);

      // Load merchant profile
      try {
        const profile = await authService.getProfile();
        const merchantData: Merchant = {
          id: profile.id,
          name: profile.businessNameAr || profile.businessName,
          type: profile.businessType,
          plan: 'enterprise',
          logo: profile.logoUrl,
          address: profile.address,
          phone: profile.contactPhone,
        };
        setMerchant(merchantData);
        tokenManager.setMerchantData(merchantData);

        const updatedUser: User = { ...userData, merchantName: merchantData.name };
        setUser(updatedUser);
        tokenManager.setUserData(updatedUser);
      } catch (error) {
        console.error('New user without merchant profile:', error);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerWithOtp = useCallback(async (otpToken: string, fullName?: string, email?: string, password?: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(otpToken, fullName, email, password);

      const userData: User = {
        id: response.user.id,
        name: response.user.fullName || response.user.name || fullName || '',
        phone: response.user.phone,
        email,
        role: 'owner',
      };

      setUser(userData);
      tokenManager.setUserData(userData);

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithPin = useCallback(async (credentials: PinLoginRequest) => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await authService.loginWithPin(credentials);
      setUser(response.user as User);
      setMerchant(response.merchant as Merchant);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setMerchant(null);
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<MerchantProfile>) => {
    await authService.updateProfile(data);
    // Reload profile
    try {
      const profile = await authService.getProfile();
      setMerchant((prev) =>
        prev
          ? {
              ...prev,
              name: profile.businessNameAr || profile.businessName || prev.name,
            }
          : null,
      );
    } catch (error) {
      console.error('Profile reload after update failed:', error);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === 'owner' || user.role === 'admin') return true;
      // Check employee permissions from user object
      const permissions = (user as any).permissions || [];
      return permissions.includes(permission);
    },
    [user],
  );

  // DEV: Force enterprise plan on user and merchant for testing
  const devUser = user ? { ...user, plan: 'enterprise' as const } : null;
  const devMerchant = merchant ? { ...merchant, plan: 'enterprise' as const } : null;

  const value: AuthContextType = {
    user: devUser,
    merchant: devMerchant,
    isAuthenticated: !!user && tokenManager.isAuthenticated(),
    isLoading,
    requestOtp,
    verifyOtp,
    loginWithOtp,
    registerWithOtp,
    loginWithPassword,
    loginWithPin,
    logout,
    updateProfile,
    hasPermission,
    isEnterprise: true, // DEV: all features unlocked for testing
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireEnterprise?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requireEnterprise,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, isEnterprise } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h1>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  if (requireEnterprise && !isEnterprise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">الترقية مطلوبة</h1>
          <p className="text-gray-600">هذه الميزة متاحة فقط لخطة Enterprise</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthContext;
