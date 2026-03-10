/**
 * POS Service
 * NavaPay Merchant Dashboard
 *
 * متوافق مع النواة المالية (fincore)
 *
 * ⚠️ ملاحظة: بعض الـ endpoints غير موجودة بالنواة وتم تعليمها
 */

import { api, ApiResponse } from './api';

// ============================================
// Types
// ============================================

export interface POSPaymentRequest {
  amount: number;
  method?: 'nfc' | 'qr' | 'phone';
  customerPhone?: string;
  branchId?: string;
  employeeId?: string;
  description?: string;
  reference?: string;
  currency?: string;
  expiresIn?: number; // seconds
}

export interface POSPaymentSession {
  id: string;
  requestId?: string;
  amount: number;
  method?: 'nfc' | 'qr' | 'phone';
  status: 'pending' | 'completed' | 'failed' | 'expired';
  qrCode?: string;
  paymentLink?: string;
  expiresAt: string;
  createdAt: string;
}

export interface POSPaymentResult {
  success: boolean;
  transactionId?: string;
  refundId?: string;
  customerName?: string;
  customerPhone?: string;
  amount: number;
  fee?: number;
  netAmount?: number;
  status?: string;
  timestamp?: string;
}

export interface POSConfig {
  merchantName: string;
  merchantLogo?: string;
  branchName?: string;
  employeeName?: string;
  defaultCurrency: string;
  receiptFooter?: string;
}

export interface RecentCustomer {
  id: string;
  name: string;
  phone: string;
  lastTransactionAt?: string;
}

export interface POSShift {
  id: string;
  employeeId: string;
  status: 'open' | 'suspended' | 'closed';
  openingCash: number;
  expectedCash: number;
  closingCash?: number;
  difference?: number;
  openedAt: string;
  closedAt?: string;
}

// ============================================
// POS Service - متوافق مع النواة
// ============================================

export const posService = {
  /**
   * Get POS configuration
   * ⚠️ ناقص بالنواة - نستخدم merchant/profile كبديل
   */
  async getConfig(): Promise<POSConfig> {
    try {
      const response = await api.get<ApiResponse<{
        businessName: string;
        businessNameAr?: string;
        logoUrl?: string;
      }>>('/merchant/profile');

      if (response.success && response.data) {
        return {
          merchantName: response.data.businessNameAr || response.data.businessName,
          merchantLogo: response.data.logoUrl,
          defaultCurrency: 'SYP',
        };
      }
    } catch {
      // fallback
    }

    return {
      merchantName: 'NavaPay',
      defaultCurrency: 'SYP',
    };
  },

  /**
   * Create a new payment session (QR code)
   * POST /api/v1/merchant/payments/request
   */
  async createPaymentSession(data: POSPaymentRequest): Promise<POSPaymentSession> {
    const response = await api.post<ApiResponse<{
      requestId: string;
      qrCode: string;
      paymentLink: string;
      expiresAt: string;
    }>>('/merchant/payments/request', {
      amount: data.amount,
      currency: data.currency || 'SYP',
      description: data.description,
      reference: data.reference,
      expiresIn: data.expiresIn || 3600,
    });

    if (response.success && response.data) {
      return {
        id: response.data.requestId,
        requestId: response.data.requestId,
        amount: data.amount,
        method: data.method || 'qr',
        status: 'pending',
        qrCode: response.data.qrCode,
        paymentLink: response.data.paymentLink,
        expiresAt: response.data.expiresAt,
        createdAt: new Date().toISOString(),
      };
    }

    throw new Error('Failed to create payment session');
  },

  /**
   * Check payment session status
   * GET /api/v1/merchant/payments/sessions/:id
   */
  async checkSessionStatus(sessionId: string): Promise<POSPaymentSession> {
    const response = await api.get<ApiResponse<{
      requestId: string;
      status: 'pending' | 'completed' | 'failed' | 'cancelled';
      amount: number | null;
      transactionId: string | null;
      completedAt?: string;
    }>>(`/merchant/payments/sessions/${sessionId}`);

    if (response.success && response.data) {
      return {
        id: sessionId,
        requestId: response.data.requestId,
        amount: response.data.amount || 0,
        status: response.data.status === 'cancelled' ? 'expired' : response.data.status,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
      };
    }

    // fallback
    return {
      id: sessionId,
      amount: 0,
      status: 'pending',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Complete payment (for phone method)
   * ⚠️ الدفع يتم من تطبيق العميل - نتحقق من الحالة فقط
   */
  async completePayment(sessionId: string): Promise<POSPaymentResult> {
    // الدفع يتم من جهة العميل، نتحقق من الحالة
    const session = await this.checkSessionStatus(sessionId);

    if (session.status === 'completed') {
      return {
        success: true,
        amount: session.amount,
        status: 'completed',
      };
    }

    throw new Error('Payment not completed yet - waiting for customer');
  },

  /**
   * Cancel payment session
   * DELETE /api/v1/merchant/payments/sessions/:id
   */
  async cancelSession(sessionId: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/payments/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error('Failed to cancel session');
    }
  },

  /**
   * Get recent customers for quick selection
   * نستخدم GET /api/v1/merchant/customers كبديل
   */
  async getRecentCustomers(limit?: number): Promise<RecentCustomer[]> {
    try {
      const response = await api.get<ApiResponse<Array<{
        id: string;
        name: string;
        phone: string;
        createdAt?: string;
      }>>>('/merchant/customers', {
        limit: limit || 5,
        page: 1,
      });

      if (response.success && response.data) {
        return response.data.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          lastTransactionAt: c.createdAt,
        }));
      }
    } catch {
      // fallback
    }

    return [];
  },

  /**
   * Request refund
   * POST /api/v1/merchant/payments/:id/refund
   */
  async requestRefund(transactionId: string, amount?: number, reason?: string): Promise<POSPaymentResult> {
    const response = await api.post<ApiResponse<{
      refundId: string;
      status: string;
      amount: string | number;
    }>>(`/merchant/payments/${transactionId}/refund`, {
      amount: amount?.toString(),
      reason: reason || 'Merchant initiated refund',
    });

    if (response.success && response.data) {
      return {
        success: true,
        refundId: response.data.refundId,
        transactionId,
        amount: typeof response.data.amount === 'string'
          ? parseFloat(response.data.amount)
          : response.data.amount,
        status: response.data.status,
      };
    }

    throw new Error('Failed to request refund');
  },

  /**
   * Get today's POS stats
   * نستخدم GET /api/v1/merchant/stats/today
   */
  async getTodayStats(): Promise<{
    totalSales: number;
    totalTransactions: number;
    totalRefunds: number;
    netSales: number;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        totalRevenue?: number;
        totalSales?: number;
        totalTransactions?: number;
        transactionsCount?: number;
      }>>('/merchant/stats/today');

      if (response.success && response.data) {
        return {
          totalSales: response.data.totalRevenue || response.data.totalSales || 0,
          totalTransactions: response.data.totalTransactions || response.data.transactionsCount || 0,
          totalRefunds: 0, // النواة لا توفر هذا الحقل
          netSales: response.data.totalRevenue || response.data.totalSales || 0,
        };
      }
    } catch {
      // fallback
    }

    return {
      totalSales: 0,
      totalTransactions: 0,
      totalRefunds: 0,
      netSales: 0,
    };
  },

  // ==========================================
  // Shift Management - متوفر بالنواة
  // ==========================================

  /**
   * Get current shift
   * GET /api/v1/merchant/pos/shifts/current
   */
  async getCurrentShift(): Promise<POSShift | null> {
    try {
      const response = await api.get<ApiResponse<POSShift>>('/merchant/pos/shifts/current');
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // No current shift
    }
    return null;
  },

  /**
   * Open new shift
   * POST /api/v1/merchant/pos/shifts/open
   */
  async openShift(openingCash: number, branchId?: string): Promise<POSShift> {
    const response = await api.post<ApiResponse<POSShift>>('/merchant/pos/shifts/open', {
      openingCash,
      branchId,
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to open shift');
  },

  /**
   * Close current shift
   * POST /api/v1/merchant/pos/shifts/:id/close
   */
  async closeShift(shiftId: string, closingCash: number, notes?: string): Promise<POSShift> {
    const response = await api.post<ApiResponse<POSShift>>(`/merchant/pos/shifts/${shiftId}/close`, {
      closingCash,
      notes,
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to close shift');
  },

  /**
   * Get shift summary
   * GET /api/v1/merchant/pos/shifts/:id/summary
   */
  async getShiftSummary(shiftId: string): Promise<{
    totalSales: number;
    totalRefunds: number;
    cashSales: number;
    digitalSales: number;
    transactionsCount: number;
  }> {
    const response = await api.get<ApiResponse<{
      totalSales: number;
      totalRefunds: number;
      cashSales: number;
      digitalSales: number;
      transactionsCount: number;
    }>>(`/merchant/pos/shifts/${shiftId}/summary`);

    if (response.success && response.data) {
      return response.data;
    }

    return {
      totalSales: 0,
      totalRefunds: 0,
      cashSales: 0,
      digitalSales: 0,
      transactionsCount: 0,
    };
  },
};

export default posService;
