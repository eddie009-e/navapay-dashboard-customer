/**
 * Branches Service
 * NavaPay Merchant Dashboard - Enterprise Only
 */

import { api, ApiResponse } from './api';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone?: string;
  email?: string;
  managerEmployeeId?: string;
  managerName?: string;
  isMain: boolean;
  isActive: boolean;
  operatingHours?: {
    [day: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  employeesCount: number;
  createdAt: string;
}

export interface BranchStats {
  todaySales: number;
  todayTransactions: number;
  monthSales: number;
  monthTransactions: number;
  employeesCount: number;
  activeEmployees: number;
}

export interface CreateBranchDto {
  name: string;
  code: string;
  address: string;
  phone?: string;
  email?: string;
  managerEmployeeId?: string;
  operatingHours?: {
    [day: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  managerEmployeeId?: string;
  isActive?: boolean;
  operatingHours?: {
    [day: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
}

export const branchesService = {
  /**
   * List branches
   */
  async list(): Promise<Branch[]> {
    try {
      const response = await api.get<ApiResponse<Branch[]>>('/merchant/branches');
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return [];
  },

  /**
   * Get branch by ID
   */
  async getById(id: string): Promise<Branch> {
    const response = await api.get<ApiResponse<Branch>>(`/merchant/branches/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get branch');
  },

  /**
   * Create branch
   */
  async create(data: CreateBranchDto): Promise<Branch> {
    const response = await api.post<ApiResponse<Branch>>('/merchant/branches', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create branch');
  },

  /**
   * Update branch
   */
  async update(id: string, data: UpdateBranchDto): Promise<Branch> {
    const response = await api.patch<ApiResponse<Branch>>(`/merchant/branches/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update branch');
  },

  /**
   * Delete branch
   */
  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/branches/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete branch');
    }
  },

  /**
   * Get branch statistics
   */
  async getStats(id: string): Promise<BranchStats> {
    try {
      const response = await api.get<ApiResponse<BranchStats>>(`/merchant/branches/${id}/stats`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // API not available
    }
    return { todaySales: 0, todayTransactions: 0, monthSales: 0, monthTransactions: 0, employeesCount: 0, activeEmployees: 0 };
  },

  /**
   * Toggle branch active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<Branch> {
    return this.update(id, { isActive });
  },
};

export default branchesService;
