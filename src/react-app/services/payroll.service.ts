/**
 * Payroll / Bulk Transfers Service
 * NavaPay Merchant Dashboard - Enterprise Only
 *
 * متوافق مع النواة المالية (fincore)
 *
 * ⚠️ ملاحظة: بعض الـ endpoints غير موجودة بالنواة وتم تعليمها
 */

import { api, ApiResponse, PaginatedResponse } from './api';

// ============================================
// Types - متوافقة مع النواة
// ============================================

export interface BulkTransfer {
  id: string;
  name: string;
  type: 'payroll' | 'suppliers' | 'refunds' | 'other';
  recipientsCount: number;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'processing' | 'completed' | 'partial_failed';
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  processedAt?: string;
}

export interface BulkTransferRecipient {
  id: string;
  name: string;
  phone: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  processedAt?: string;
  failureReason?: string;
}

export interface CreateBulkTransferDto {
  name: string;
  type: 'payroll' | 'suppliers' | 'refunds' | 'other';
  recipients?: Array<{
    name: string;
    phone: string;
    amount: number;
  }>;
}

export interface UpdateBulkTransferDto {
  name?: string;
  type?: 'payroll' | 'suppliers' | 'refunds' | 'other';
}

export interface AddItemsDto {
  items: Array<{
    name: string;
    phone: string;
    amount: number;
  }>;
}

export interface BulkTransferDetails extends BulkTransfer {
  recipients: BulkTransferRecipient[];
  items?: BulkTransferRecipient[]; // النواة تُرجع items
}

export interface BulkTransferStats {
  totalTransfers: number;
  completedTransfers: number;
  totalAmount: number;
  totalRecipients: number;
}

// ============================================
// Payroll Service - متوافق مع النواة
// ============================================

export const payrollService = {
  /**
   * List bulk transfers
   * GET /api/v1/merchant/bulk-transfers
   */
  async list(params?: {
    page?: number;
    limit?: number;
    type?: 'payroll' | 'suppliers' | 'refunds' | 'other';
    status?: 'draft' | 'pending' | 'approved' | 'processing' | 'completed' | 'partial_failed';
    search?: string;
  }): Promise<PaginatedResponse<BulkTransfer>> {
    try {
      const response = await api.get<ApiResponse<BulkTransfer[]> & { pagination?: any }>('/merchant/bulk-transfers', {
        page: params?.page || 1,
        limit: params?.limit || 20,
        status: params?.status,
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          page: response.pagination?.page || params?.page || 1,
          total: response.pagination?.total || response.data.length,
          totalPages: response.pagination?.totalPages || Math.ceil((response.pagination?.total || response.data.length) / (params?.limit || 20)),
        };
      }
    } catch {
      // API not available
    }
    return { success: false, data: [], page: 1, total: 0, totalPages: 0 };
  },

  /**
   * Get bulk transfer by ID with recipients
   * GET /api/v1/merchant/bulk-transfers/:id
   */
  async getById(id: string): Promise<BulkTransferDetails> {
    const response = await api.get<ApiResponse<BulkTransferDetails>>(`/merchant/bulk-transfers/${id}`);
    if (response.success && response.data) {
      // النواة تُرجع items بدلاً من recipients
      const data = response.data;
      if (data.items && !data.recipients) {
        data.recipients = data.items;
      }
      return data;
    }
    throw new Error('Failed to get bulk transfer');
  },

  /**
   * Create bulk transfer
   * POST /api/v1/merchant/bulk-transfers
   */
  async create(data: CreateBulkTransferDto): Promise<BulkTransfer> {
    const response = await api.post<ApiResponse<BulkTransfer>>('/merchant/bulk-transfers', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create bulk transfer');
  },

  /**
   * Update bulk transfer
   * PUT /api/v1/merchant/bulk-transfers/:id
   */
  async update(id: string, data: UpdateBulkTransferDto): Promise<BulkTransfer> {
    const response = await api.put<ApiResponse<BulkTransfer>>(`/merchant/bulk-transfers/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update bulk transfer');
  },

  /**
   * Add items/recipients to bulk transfer
   * POST /api/v1/merchant/bulk-transfers/:id/items
   */
  async addItems(id: string, items: AddItemsDto['items']): Promise<BulkTransferRecipient[]> {
    const response = await api.post<ApiResponse<BulkTransferRecipient[]>>(`/merchant/bulk-transfers/${id}/items`, {
      items,
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to add items to bulk transfer');
  },

  /**
   * Remove item/recipient from bulk transfer
   * DELETE /api/v1/merchant/bulk-transfers/:id/items/:itemId
   */
  async removeItem(id: string, itemId: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/bulk-transfers/${id}/items/${itemId}`);
    if (!response.success) {
      throw new Error('Failed to remove item from bulk transfer');
    }
  },

  /**
   * Approve bulk transfer (before execution)
   * POST /api/v1/merchant/bulk-transfers/:id/approve
   */
  async approve(id: string): Promise<BulkTransfer> {
    const response = await api.post<ApiResponse<BulkTransfer>>(`/merchant/bulk-transfers/${id}/approve`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to approve bulk transfer');
  },

  /**
   * Execute approved bulk transfer
   * POST /api/v1/merchant/bulk-transfers/:id/execute
   */
  async execute(id: string): Promise<BulkTransfer> {
    const response = await api.post<ApiResponse<BulkTransfer>>(`/merchant/bulk-transfers/${id}/execute`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to execute bulk transfer');
  },

  /**
   * Retry failed recipients
   * POST /api/v1/merchant/bulk-transfers/:id/retry
   */
  async retryFailed(id: string): Promise<BulkTransfer> {
    const response = await api.post<ApiResponse<BulkTransfer>>(`/merchant/bulk-transfers/${id}/retry`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to retry bulk transfer');
  },

  /**
   * Cancel/Delete draft bulk transfer
   * DELETE /api/v1/merchant/bulk-transfers/:id
   */
  async cancel(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/bulk-transfers/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete bulk transfer');
    }
  },

  /**
   * Get bulk transfer stats
   * GET /api/v1/merchant/bulk-transfers/stats
   */
  async getStats(): Promise<BulkTransferStats> {
    try {
      const response = await api.get<ApiResponse<BulkTransferStats>>('/merchant/bulk-transfers/stats');
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return { totalTransfers: 0, completedTransfers: 0, totalAmount: 0, totalRecipients: 0 };
  },

  /**
   * Export bulk transfer data
   * GET /api/v1/merchant/bulk-transfers/:id/export
   * يدعم format: 'csv' | 'json'
   */
  async export(id: string, format: 'csv' | 'json' = 'json'): Promise<{ data: any; filename?: string }> {
    // للـ CSV نحتاج معالجة خاصة
    if (format === 'csv') {
      // النواة تُرسل ملف CSV مباشرة
      const url = `/merchant/bulk-transfers/${id}/export?format=csv`;
      // نُرجع الـ URL للتنزيل المباشر
      return {
        data: url,
        filename: `bulk-transfer-${id}.csv`,
      };
    }

    const response = await api.get<ApiResponse<any>>(`/merchant/bulk-transfers/${id}/export?format=json`);
    if (response.success && response.data) {
      return {
        data: response.data,
        filename: `bulk-transfer-${id}.json`,
      };
    }
    throw new Error('Failed to export bulk transfer');
  },

  /**
   * Export bulk transfer to PDF
   * ⚠️ ناقص بالنواة - نستخدم JSON/CSV بدلاً منه
   * @deprecated استخدم export() بدلاً منه
   */
  async exportPdf(id: string): Promise<{ data: string; filename: string }> {
    // النواة لا توفر تصدير PDF - نستخدم CSV كبديل
    console.warn('PDF export is not supported - using CSV instead');
    return this.export(id, 'csv') as Promise<{ data: string; filename: string }>;
  },
};

export default payrollService;
