/**
 * Dashboard Stats Service
 * NavaPay Merchant Dashboard
 */

import { api, ApiResponse } from './api';

export interface TodayStats {
  sales: number;
  salesChange: number;
  transactionsCount: number;
  transactionsChange: number;
  averageTransaction: number;
  newCustomers: number;
}

export interface SalesDataPoint {
  date: string;
  amount: number;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  draft: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  method: string;
  status: string;
  createdAt: string;
}

export const dashboardService = {
  /**
   * Get today's statistics
   */
  async getTodayStats(): Promise<TodayStats> {
    const response = await api.get<ApiResponse<TodayStats>>('/merchant/stats/today');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get today stats');
  },

  /**
   * Get sales data for chart
   */
  async getSalesData(period: '7d' | '30d' | '90d' = '7d'): Promise<SalesDataPoint[]> {
    const response = await api.get<ApiResponse<SalesDataPoint[]>>('/merchant/stats/sales', { period });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get sales data');
  },

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(): Promise<InvoiceStats> {
    const response = await api.get<ApiResponse<InvoiceStats>>('/merchant/invoices/stats');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get invoice stats');
  },

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit = 10): Promise<RecentTransaction[]> {
    const response = await api.get<ApiResponse<RecentTransaction[]>>('/merchant/transactions', { limit, sort: 'recent' });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get recent transactions');
  },
};

export default dashboardService;
