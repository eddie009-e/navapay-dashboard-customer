/**
 * Payment Links Service
 * NavaPay Merchant Dashboard
 *
 * متوافق مع النواة المالية (fincore)
 *
 * ⚠️ ملاحظة: روابط الدفع بالنواة تُنشأ عبر نظام الفواتير
 * POST /merchant/payment-links يُنشئ فاتورة مع رابط دفع
 */

import { api, ApiResponse, PaginatedResponse } from './api';

// ============================================
// Types
// ============================================

export interface PaymentLink {
  id: string;
  name: string;
  url: string;
  paymentUrl?: string;
  amount: number | 'open';
  status: 'active' | 'disabled' | 'expired';
  usageCount: number;
  usageLimit?: number;
  expiresAt?: string;
  qrCode?: string;
  paymentLinkToken?: string;
  createdAt: string;
}

export interface CreatePaymentLinkDto {
  name: string;
  amount: number | 'open';
  description?: string;
  expiryType?: 'unlimited' | 'date' | 'single';
  expiresAt?: string;
}

export interface UpdatePaymentLinkDto {
  name?: string;
  amount?: number | 'open';
  status?: 'active' | 'disabled';
  expiresAt?: string;
}

// ============================================
// Payment Links Service - متوافق مع النواة
// ============================================

export const paymentLinksService = {
  /**
   * List payment links
   * ⚠️ ناقص جزئياً بالنواة - نستخدم الفواتير مع payment link token
   */
  async list(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'disabled' | 'expired';
  }): Promise<PaginatedResponse<PaymentLink>> {
    // النواة لا توفر endpoint مخصص لقائمة روابط الدفع
    // روابط الدفع هي فواتير مع paymentLinkToken
    // يمكن البحث في الفواتير كبديل
    try {
      const response = await api.get<ApiResponse<any[]> & { pagination?: any }>('/merchant/invoices', {
        page: params?.page || 1,
        limit: params?.limit || 20,
        // يمكن إضافة filter لاحقاً إذا دعمته النواة
      });

      if (response.success && response.data) {
        // نُحوّل الفواتير التي لها payment link إلى شكل PaymentLink
        const paymentLinks: PaymentLink[] = response.data
          .filter((inv: any) => inv.paymentLinkToken)
          .map((inv: any) => ({
            id: inv.id,
            name: inv.notes || `Invoice #${inv.invoiceNumber}`,
            url: `/api/v1/pay/${inv.paymentLinkToken}`,
            paymentUrl: `/api/v1/pay/${inv.paymentLinkToken}`,
            amount: inv.totalAmount || inv.amount,
            status: inv.status === 'draft' ? 'active' : inv.status === 'paid' ? 'disabled' : 'active',
            usageCount: inv.viewCount || 0,
            paymentLinkToken: inv.paymentLinkToken,
            createdAt: inv.createdAt,
          }));

        return {
          success: true,
          data: paymentLinks,
          page: (response as any).pagination?.page || params?.page || 1,
          total: (response as any).pagination?.total || paymentLinks.length,
          totalPages: (response as any).pagination?.totalPages || 1,
        };
      }
    } catch {
      // fallback
    }

    return {
      success: false,
      data: [],
      page: 1,
      total: 0,
      totalPages: 0,
    };
  },

  /**
   * Get payment link by ID
   * ⚠️ ناقص بالنواة - نستخدم الفواتير
   */
  async getById(id: string): Promise<PaymentLink> {
    const response = await api.get<ApiResponse<any>>(`/merchant/invoices/${id}`);

    if (response.success && response.data) {
      const inv = response.data;
      return {
        id: inv.id,
        name: inv.notes || `Invoice #${inv.invoiceNumber}`,
        url: inv.paymentLinkToken ? `/api/v1/pay/${inv.paymentLinkToken}` : '',
        amount: inv.totalAmount || inv.amount,
        status: 'active',
        usageCount: inv.viewCount || 0,
        paymentLinkToken: inv.paymentLinkToken,
        createdAt: inv.createdAt,
      };
    }

    throw new Error('Failed to get payment link');
  },

  /**
   * Create payment link
   * POST /api/v1/merchant/payment-links
   */
  async create(data: CreatePaymentLinkDto): Promise<PaymentLink> {
    const response = await api.post<ApiResponse<{
      invoice: any;
      paymentUrl: string;
    }>>('/merchant/payment-links', {
      name: data.name,
      description: data.description || data.name,
      amount: data.amount === 'open' ? null : data.amount,
      allowCustomAmount: data.amount === 'open',
    });

    if (response.success && response.data) {
      const { invoice, paymentUrl } = response.data;
      return {
        id: invoice.id,
        name: data.name,
        url: paymentUrl,
        paymentUrl,
        amount: data.amount,
        status: 'active',
        usageCount: 0,
        paymentLinkToken: invoice.paymentLinkToken,
        createdAt: invoice.createdAt || new Date().toISOString(),
      };
    }

    throw new Error('Failed to create payment link');
  },

  /**
   * Update payment link
   * ⚠️ ناقص بالنواة - نستخدم تحديث الفاتورة
   */
  async update(id: string, data: UpdatePaymentLinkDto): Promise<PaymentLink> {
    // نحاول تحديث الفاتورة المرتبطة
    const response = await api.put<ApiResponse<any>>(`/merchant/invoices/${id}`, {
      notes: data.name,
      totalAmount: data.amount === 'open' ? undefined : data.amount,
    });

    if (response.success && response.data) {
      const inv = response.data;
      return {
        id: inv.id,
        name: data.name || inv.notes || `Invoice #${inv.invoiceNumber}`,
        url: inv.paymentLinkToken ? `/api/v1/pay/${inv.paymentLinkToken}` : '',
        amount: inv.totalAmount || inv.amount,
        status: data.status || 'active',
        usageCount: inv.viewCount || 0,
        paymentLinkToken: inv.paymentLinkToken,
        createdAt: inv.createdAt,
      };
    }

    throw new Error('Failed to update payment link');
  },

  /**
   * Delete payment link
   * ⚠️ ناقص بالنواة - نستخدم حذف الفاتورة
   */
  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/invoices/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete payment link');
    }
  },

  /**
   * Toggle payment link status
   * ⚠️ ناقص بالنواة
   */
  async toggleStatus(id: string, status: 'active' | 'disabled'): Promise<PaymentLink> {
    // النواة لا توفر تعطيل/تفعيل روابط الدفع
    // يمكن إلغاء الفاتورة كبديل للتعطيل
    if (status === 'disabled') {
      await api.post<ApiResponse>(`/merchant/invoices/${id}/cancel`);
    }

    return this.getById(id);
  },

  /**
   * Get QR code for payment link
   * ⚠️ ناقص بالنواة - يمكن توليده من الـ URL
   */
  async getQRCode(id: string): Promise<string> {
    // النواة لا توفر endpoint لـ QR code لروابط الدفع
    // يمكن توليد QR من الـ payment URL في الواجهة
    console.warn('QR code generation is not directly supported by backend');

    // نُرجع الـ payment link كـ base64 string للتوليد في الواجهة
    const link = await this.getById(id);
    return link.url;
  },
};

export default paymentLinksService;
