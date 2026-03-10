/**
 * Developers Service
 * NavaPay Merchant Dashboard - Enterprise Only
 */

import { api, ApiResponse, PaginatedResponse } from './api';

export interface ApiKey {
  id: string;
  name: string;
  lastFour: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  secretKey: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  successCount: number;
  failureCount: number;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  apiKeyId?: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface CreateApiKeyDto {
  name: string;
  permissions?: string[];
  expiresAt?: string;
}

export interface CreateWebhookDto {
  name: string;
  url: string;
  events?: string[];
}

export interface UpdateWebhookDto {
  name?: string;
  url?: string;
  events?: string[];
}

// Available webhook events
export const WEBHOOK_EVENTS = {
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',
  TRANSFER_COMPLETED: 'transfer.completed',
  TRANSFER_FAILED: 'transfer.failed',
};

// Available API permissions
export const API_PERMISSIONS = {
  READ_TRANSACTIONS: 'transactions:read',
  READ_INVOICES: 'invoices:read',
  WRITE_INVOICES: 'invoices:write',
  READ_CUSTOMERS: 'customers:read',
  WRITE_CUSTOMERS: 'customers:write',
  READ_WALLET: 'wallet:read',
  INITIATE_PAYMENTS: 'payments:initiate',
  ALL: '*',
};

export const developersService = {
  // ==================== API Keys ====================

  /**
   * List API keys
   */
  async listApiKeys(): Promise<ApiKey[]> {
    const response = await api.get<ApiResponse<ApiKey[]>>('/merchant/api-keys');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get API keys');
  },

  /**
   * Create API key
   */
  async createApiKey(data: CreateApiKeyDto): Promise<ApiKeyWithSecret> {
    const response = await api.post<ApiResponse<ApiKeyWithSecret>>('/merchant/api-keys', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create API key');
  },

  /**
   * Revoke API key
   */
  async revokeApiKey(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/api-keys/${id}`);
    if (!response.success) {
      throw new Error('Failed to revoke API key');
    }
  },

  // ==================== Webhooks ====================

  /**
   * List webhooks
   */
  async listWebhooks(): Promise<Webhook[]> {
    const response = await api.get<ApiResponse<Webhook[]>>('/merchant/webhooks');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get webhooks');
  },

  /**
   * Create webhook
   */
  async createWebhook(data: CreateWebhookDto): Promise<Webhook> {
    const response = await api.post<ApiResponse<Webhook>>('/merchant/webhooks', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create webhook');
  },

  /**
   * Update webhook
   */
  async updateWebhook(id: string, data: UpdateWebhookDto): Promise<Webhook> {
    const response = await api.patch<ApiResponse<Webhook>>(`/merchant/webhooks/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update webhook');
  },

  /**
   * Delete webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/merchant/webhooks/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete webhook');
    }
  },

  /**
   * Toggle webhook active status
   */
  async toggleWebhook(id: string, isActive: boolean): Promise<Webhook> {
    const response = await api.patch<ApiResponse<Webhook>>(`/merchant/webhooks/${id}/toggle`, { isActive });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to toggle webhook');
  },

  // ==================== API Logs ====================

  /**
   * Get API logs
   */
  async getApiLogs(params?: {
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ApiLog>> {
    const response = await api.get<PaginatedResponse<ApiLog>>('/merchant/api-logs', params);
    return response;
  },
};

export default developersService;
