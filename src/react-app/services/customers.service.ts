/**
 * Customers Service
 * NavaPay Merchant Dashboard
 */

import { api, ApiResponse, PaginatedResponse } from './api';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalSpent: number;
  transactionsCount: number;
  lastTransactionAt?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags?: string[];
}

export interface CustomerTransaction {
  id: string;
  amount: number;
  type: 'payment' | 'refund' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  method: 'nfc' | 'qr' | 'phone';
  employeeName?: string;
  branchName?: string;
  description?: string;
  createdAt: string;
}

export const customersService = {
  /**
   * List customers with pagination
   */
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Customer>> {
    const response = await api.get<PaginatedResponse<Customer>>('/merchant/customers', params);
    return response;
  },

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<Customer> {
    const response = await api.get<ApiResponse<Customer>>(`/merchant/customers/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get customer');
  },

  /**
   * Create new customer
   */
  async create(data: CreateCustomerDto): Promise<Customer> {
    const response = await api.post<ApiResponse<Customer>>('/merchant/customers', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create customer');
  },

  /**
   * Update customer
   */
  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await api.patch<ApiResponse<Customer>>(`/merchant/customers/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update customer');
  },

  /**
   * Delete customer
   */
  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/customers/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete customer');
    }
  },

  /**
   * Get customer transactions
   */
  async getTransactions(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CustomerTransaction>> {
    const response = await api.get<PaginatedResponse<CustomerTransaction>>(
      `/merchant/customers/${id}/transactions`,
      params,
    );
    return response;
  },
};

export default customersService;
