/**
 * Invoices Service
 * NavaPay Merchant Dashboard
 */

import { api, ApiResponse, PaginatedResponse } from './api';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  price: number; // alias for unitPrice for backward compatibility
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  notes?: string;
  paymentLink?: string;
  createdAt: string;
  paidAt?: string;
}

export interface CreateInvoiceDto {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  tax?: number;
  discount?: number;
  dueDate: string;
  notes?: string;
  sendReminder?: boolean;
}

export interface UpdateInvoiceDto {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  tax?: number;
  discount?: number;
  dueDate?: string;
  notes?: string;
  status?: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
}

export const invoicesService = {
  /**
   * List invoices
   * GET /api/v1/merchant/invoices
   */
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerPhone?: string;
    search?: string;
  }): Promise<PaginatedResponse<Invoice>> {
    const response = await api.get<ApiResponse<Invoice[]> & { pagination?: any }>('/merchant/invoices', params);

    // تحويل Response للشكل المتوقع
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        page: (response as any).pagination?.page || params?.page || 1,
        total: (response as any).pagination?.total || response.data.length,
        totalPages: (response as any).pagination?.totalPages || 1,
      };
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
   * Get invoice by ID
   * GET /api/v1/merchant/invoices/:id
   */
  async getById(id: string): Promise<Invoice> {
    const response = await api.get<ApiResponse<Invoice>>(`/merchant/invoices/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get invoice');
  },

  /**
   * Create invoice
   * POST /api/v1/merchant/invoices
   */
  async create(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await api.post<ApiResponse<Invoice>>('/merchant/invoices', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create invoice');
  },

  /**
   * Update invoice
   * PUT /api/v1/merchant/invoices/:id (النواة تستخدم PUT)
   */
  async update(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    const response = await api.put<ApiResponse<Invoice>>(`/merchant/invoices/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update invoice');
  },

  /**
   * Delete invoice
   * DELETE /api/v1/merchant/invoices/:id
   */
  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/invoices/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete invoice');
    }
  },

  /**
   * Send invoice
   * POST /api/v1/merchant/invoices/:id/send
   */
  async sendReminder(id: string): Promise<void> {
    const response = await api.post<ApiResponse>(`/merchant/invoices/${id}/send`);
    if (!response.success) {
      throw new Error('Failed to send invoice');
    }
  },

  /**
   * Mark invoice as paid
   * PUT /api/v1/merchant/invoices/:id
   */
  async markAsPaid(id: string): Promise<Invoice> {
    const response = await api.put<ApiResponse<Invoice>>(`/merchant/invoices/${id}`, { status: 'paid' });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to mark as paid');
  },

  /**
   * Cancel invoice
   * POST /api/v1/merchant/invoices/:id/cancel
   */
  async cancel(id: string): Promise<Invoice> {
    const response = await api.post<ApiResponse<Invoice>>(`/merchant/invoices/${id}/cancel`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to cancel invoice');
  },
};

export default invoicesService;
