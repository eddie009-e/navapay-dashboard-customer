/**
 * Employees Service
 * NavaPay Merchant Dashboard
 */

import { api, ApiResponse, PaginatedResponse } from './api';

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'admin' | 'manager' | 'cashier' | 'accountant';
  pin?: string;
  permissions: string[];
  branchId?: string;
  branchName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateEmployeeDto {
  name: string;
  phone: string;
  email?: string;
  role: 'admin' | 'manager' | 'cashier' | 'accountant';
  pinCode: string;
  permissions?: string[];
  branchId?: string;
}

export interface UpdateEmployeeDto {
  name?: string;
  phone?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'cashier' | 'accountant';
  pinCode?: string;
  branchId?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export const EMPLOYEE_PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',

  // POS
  POS_ACCESS: 'pos:access',
  POS_REFUND: 'pos:refund',
  POS_DISCOUNT: 'pos:discount',

  // Transactions
  TRANSACTIONS_VIEW: 'transactions:view',
  TRANSACTIONS_EXPORT: 'transactions:export',

  // Customers
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_MANAGE: 'customers:manage',

  // Invoices
  INVOICES_VIEW: 'invoices:view',
  INVOICES_MANAGE: 'invoices:manage',

  // Wallet
  WALLET_VIEW: 'wallet:view',
  WALLET_TRANSFER: 'wallet:transfer',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',

  // Employees
  EMPLOYEES_VIEW: 'employees:view',
  EMPLOYEES_MANAGE: 'employees:manage',
};

export const employeesService = {
  /**
   * List employees
   */
  async list(params?: {
    page?: number;
    limit?: number;
    branchId?: string;
    role?: string;
  }): Promise<PaginatedResponse<Employee>> {
    try {
      const response = await api.get<PaginatedResponse<Employee>>('/merchant/employees', params);
      return response;
    } catch {
      // API not available
    }
    return { success: false, data: [], page: 1, total: 0, totalPages: 0 };
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee> {
    const response = await api.get<ApiResponse<Employee>>(`/merchant/employees/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get employee');
  },

  /**
   * Create employee
   */
  async create(data: CreateEmployeeDto): Promise<Employee> {
    const response = await api.post<ApiResponse<Employee>>('/merchant/employees', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create employee');
  },

  /**
   * Update employee
   * PUT /api/v1/merchant/employees/:id
   */
  async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const response = await api.put<ApiResponse<Employee>>(`/merchant/employees/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update employee');
  },

  /**
   * Delete employee
   */
  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/employees/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete employee');
    }
  },

  /**
   * Toggle employee active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<Employee> {
    const response = await api.put<ApiResponse<Employee>>(`/merchant/employees/${id}`, {
      status: isActive ? 'active' : 'inactive',
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to toggle employee status');
  },

  /**
   * Reset employee PIN
   * PUT /api/v1/merchant/employees/:id
   */
  async resetPin(id: string, newPin: string): Promise<void> {
    const response = await api.put<ApiResponse>(`/merchant/employees/${id}`, { pinCode: newPin });
    if (!response.success) {
      throw new Error('Failed to reset PIN');
    }
  },
};

export default employeesService;
