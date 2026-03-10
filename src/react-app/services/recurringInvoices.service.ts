/**
 * Recurring Invoices Service
 * NavaPay Merchant Dashboard - Enterprise Only
 */

import { api, ApiResponse, PaginatedResponse } from './api';

export interface RecurringInvoice {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'ended';
  startDate: string;
  endDate?: string;
  nextDate: string;
  lastGeneratedAt?: string;
  invoicesGenerated: number;
  sendAuto: boolean;
  sendReminder: boolean;
  createdAt: string;
}

export interface CreateRecurringInvoiceDto {
  name: string;
  customerId: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  sendAuto?: boolean;
  sendReminder?: boolean;
}

export interface UpdateRecurringInvoiceDto {
  name?: string;
  amount?: number;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  endDate?: string;
  sendAuto?: boolean;
  sendReminder?: boolean;
}

export const recurringInvoicesService = {
  /**
   * List recurring invoices
   */
  async list(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'paused' | 'ended';
  }): Promise<PaginatedResponse<RecurringInvoice>> {
    try {
      const response = await api.get<PaginatedResponse<RecurringInvoice>>('/merchant/recurring-invoices', params);
      return response;
    } catch {
      // API not available
    }
    return { success: false, data: [], page: 1, total: 0, totalPages: 0 };
  },

  /**
   * Get recurring invoice by ID
   */
  async getById(id: string): Promise<RecurringInvoice> {
    const response = await api.get<ApiResponse<RecurringInvoice>>(`/merchant/recurring-invoices/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get recurring invoice');
  },

  /**
   * Create recurring invoice
   */
  async create(data: CreateRecurringInvoiceDto): Promise<RecurringInvoice> {
    const response = await api.post<ApiResponse<RecurringInvoice>>('/merchant/recurring-invoices', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create recurring invoice');
  },

  /**
   * Update recurring invoice
   * PUT /api/v1/merchant/recurring-invoices/:id (النواة تستخدم PUT)
   */
  async update(id: string, data: UpdateRecurringInvoiceDto): Promise<RecurringInvoice> {
    const response = await api.put<ApiResponse<RecurringInvoice>>(`/merchant/recurring-invoices/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update recurring invoice');
  },

  /**
   * Delete/Cancel recurring invoice
   * DELETE /api/v1/merchant/recurring-invoices/:id
   */
  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/recurring-invoices/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete recurring invoice');
    }
  },

  /**
   * Pause recurring invoice
   */
  async pause(id: string): Promise<RecurringInvoice> {
    const response = await api.post<ApiResponse<RecurringInvoice>>(`/merchant/recurring-invoices/${id}/pause`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to pause recurring invoice');
  },

  /**
   * Resume recurring invoice
   */
  async resume(id: string): Promise<RecurringInvoice> {
    const response = await api.post<ApiResponse<RecurringInvoice>>(`/merchant/recurring-invoices/${id}/resume`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to resume recurring invoice');
  },

  /**
   * End/Cancel recurring invoice
   * DELETE /api/v1/merchant/recurring-invoices/:id (النواة تستخدم DELETE للإلغاء)
   */
  async end(id: string): Promise<RecurringInvoice> {
    // النواة تستخدم DELETE لإلغاء الفواتير الدورية
    const response = await api.delete<ApiResponse<RecurringInvoice>>(`/merchant/recurring-invoices/${id}`);
    if (response.success) {
      // نُرجع كائن وهمي لأن DELETE عادة لا يُرجع البيانات
      return {
        id,
        status: 'ended',
      } as RecurringInvoice;
    }
    throw new Error('Failed to end recurring invoice');
  },

  /**
   * Get generated invoices for a recurring invoice
   */
  async getGeneratedInvoices(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<{ id: string; amount: number; status: string; createdAt: string }>> {
    try {
      const response = await api.get<PaginatedResponse<{ id: string; amount: number; status: string; createdAt: string }>>(
        `/merchant/recurring-invoices/${id}/invoices`,
        params
      );
      return response;
    } catch {
      // API not available
    }
    return { success: false, data: [], page: 1, total: 0, totalPages: 0 };
  },
};

export default recurringInvoicesService;
