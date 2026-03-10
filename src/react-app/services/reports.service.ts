/**
 * Reports Service
 * NavaPay Merchant Dashboard
 */

import { api, ApiResponse } from './api';

export interface SalesReport {
  totalSales: number;
  transactionsCount: number;
  averageTransaction: number;
  salesByMethod: Record<string, number>;
  salesByDay: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export interface DailyReport {
  date: string;
  sales: number;
  transactions: number;
  refunds: number;
  netSales: number;
  hourlyBreakdown: Array<{
    hour: number;
    amount: number;
    count: number;
  }>;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalSales: number;
  totalTransactions: number;
  averageDaily: number;
  bestDay: {
    date: string;
    amount: number;
  };
  worstDay: {
    date: string;
    amount: number;
  };
  dailyBreakdown: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export interface YearlyReport {
  year: number;
  totalSales: number;
  totalTransactions: number;
  averageMonthly: number;
  bestMonth: {
    month: string;
    amount: number;
  };
  monthlyBreakdown: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  growthRate: number;
}

export interface TransactionExport {
  data: string; // CSV or JSON string
  filename: string;
}

export const reportsService = {
  /**
   * Get sales report
   */
  async getSalesReport(from: string, to: string): Promise<SalesReport> {
    try {
      const response = await api.get<ApiResponse<SalesReport>>('/merchant/reports/sales', { from, to });
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return { totalSales: 0, transactionsCount: 0, averageTransaction: 0, salesByMethod: {}, salesByDay: [] };
  },

  /**
   * Get daily report
   */
  async getDailyReport(date?: string): Promise<DailyReport> {
    try {
      const params = date ? { date } : {};
      const response = await api.get<ApiResponse<DailyReport>>('/merchant/reports/daily', params);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return { date: new Date().toISOString().split('T')[0], sales: 0, transactions: 0, refunds: 0, netSales: 0, hourlyBreakdown: [] };
  },

  /**
   * Get monthly report
   */
  async getMonthlyReport(month?: number, year?: number): Promise<MonthlyReport> {
    try {
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const response = await api.get<ApiResponse<MonthlyReport>>('/merchant/reports/monthly', params);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return { month: '', year: new Date().getFullYear(), totalSales: 0, totalTransactions: 0, averageDaily: 0, bestDay: { date: '', amount: 0 }, worstDay: { date: '', amount: 0 }, dailyBreakdown: [] };
  },

  /**
   * Get yearly report
   */
  async getYearlyReport(year?: number): Promise<YearlyReport> {
    try {
      const params = year ? { year } : {};
      const response = await api.get<ApiResponse<YearlyReport>>('/merchant/reports/yearly', params);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return { year: new Date().getFullYear(), totalSales: 0, totalTransactions: 0, averageMonthly: 0, bestMonth: { month: '', amount: 0 }, monthlyBreakdown: [], growthRate: 0 };
  },

  /**
   * Export transactions
   */
  async exportTransactions(params: {
    from: string;
    to: string;
    format?: 'csv' | 'json';
    status?: string;
  }): Promise<TransactionExport> {
    const response = await api.get<ApiResponse<TransactionExport>>('/merchant/transactions/export', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to export transactions');
  },

  /**
   * Download exported file
   */
  downloadFile(content: string, filename: string, format: 'csv' | 'json' = 'csv') {
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reportsService;
