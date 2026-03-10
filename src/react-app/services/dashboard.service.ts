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
    try {
      const response = await api.get<ApiResponse<TodayStats>>('/merchant/stats/today');
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return { sales: 0, salesChange: 0, transactionsCount: 0, transactionsChange: 0, averageTransaction: 0, newCustomers: 0 };
  },

  /**
   * Get sales data for chart
   */
  async getSalesData(period: '7d' | '30d' | '90d' = '7d'): Promise<SalesDataPoint[]> {
    try {
      const response = await api.get<ApiResponse<SalesDataPoint[]>>('/merchant/stats/sales', { period });
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return [];
  },

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(): Promise<InvoiceStats> {
    try {
      const response = await api.get<ApiResponse<InvoiceStats>>('/merchant/invoices/stats');
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return { total: 0, paid: 0, pending: 0, overdue: 0, draft: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0, overdueAmount: 0 };
  },

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit = 10): Promise<RecentTransaction[]> {
    try {
      const response = await api.get<ApiResponse<RecentTransaction[]>>('/merchant/transactions', { limit, sort: 'recent' });
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return [];
  },
};

export default dashboardService;
