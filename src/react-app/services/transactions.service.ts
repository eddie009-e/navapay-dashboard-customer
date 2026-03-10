/**
 * Transactions Service
 * NavaPay Merchant Dashboard
 */

import { api, ApiResponse, PaginatedResponse } from './api';

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'transfer';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: 'nfc' | 'qr' | 'phone';
  customerName: string;
  customerPhone: string;
  employeeId?: string;
  employeeName?: string;
  branchId?: string;
  branchName?: string;
  description?: string;
  createdAt: string;
}

export interface TransactionFilters {
  type?: 'payment' | 'refund' | 'transfer';
  status?: 'completed' | 'pending' | 'failed';
  method?: 'nfc' | 'qr' | 'phone';
  employeeId?: string;
  branchId?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionStats {
  totalAmount: number;
  totalTransactions: number;
  averageTransaction: number;
  highestTransaction: number;
}

export const transactionsService = {
  /**
   * List transactions with filters
   */
  async list(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get<PaginatedResponse<Transaction>>('/merchant/transactions', filters);
    return response;
  },

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<Transaction> {
    const response = await api.get<ApiResponse<Transaction>>(`/merchant/transactions/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get transaction');
  },

  /**
   * Get transaction stats
   */
  async getStats(filters?: { from?: string; to?: string }): Promise<TransactionStats> {
    const response = await api.get<ApiResponse<TransactionStats>>('/merchant/transactions/stats', filters);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get transaction stats');
  },

  /**
   * Request refund
   * POST /api/v1/merchant/payments/:id/refund
   */
  async requestRefund(transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>(`/merchant/payments/${transactionId}/refund`, {
      amount,
      reason
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to request refund');
  },

  /**
   * Export transactions
   */
  async export(filters?: TransactionFilters & { format?: 'csv' | 'json' }): Promise<Blob> {
    const response = await api.get<Blob>('/merchant/transactions/export', filters);
    return response;
  },
};

export default transactionsService;
