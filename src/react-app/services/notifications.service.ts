/**
 * Notifications Service
 * NavaPay Merchant Dashboard
 *
 * متوافق مع النواة المالية (fincore)
 */

import { api, ApiResponse, PaginatedResponse } from './api';

// ============================================
// Types - متوافقة مع النواة
// ============================================

export interface Notification {
  id: string;
  type: 'payment' | 'invoice' | 'refund' | 'system' | string;
  title: string;
  message: string;
  body?: string; // النواة تستخدم body
  status?: 'sent' | 'read';
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

// ============================================
// Notifications Service - متوافق مع النواة
// ============================================

export const notificationsService = {
  /**
   * List notifications
   * GET /api/v1/notifications
   */
  async list(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    read?: boolean;
  }): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<ApiResponse<{
      notifications: Array<{
        id: string;
        type: string;
        title: string;
        body: string;
        status: 'sent' | 'read';
        data?: Record<string, any>;
        createdAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>('/notifications', {
      page: params?.page || 1,
      limit: params?.limit || 20,
      unreadOnly: params?.unreadOnly || (params?.read === false),
    });

    if (response.success && response.data) {
      // تحويل من شكل النواة لشكل اللوحة
      const notifications: Notification[] = response.data.notifications.map(n => ({
        id: n.id,
        type: n.type as any,
        title: n.title,
        message: n.body, // النواة تستخدم body
        body: n.body,
        status: n.status,
        read: n.status === 'read',
        data: n.data,
        createdAt: n.createdAt,
      }));

      return {
        success: true,
        data: notifications,
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
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
   * Get notification statistics (unread count)
   * GET /api/v1/notifications/unread-count
   */
  async getStats(): Promise<NotificationStats> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');

    if (response.success && response.data) {
      return {
        total: 0, // النواة لا توفر total
        unread: response.data.count,
      };
    }

    return {
      total: 0,
      unread: 0,
    };
  },

  /**
   * Mark notification as read
   * POST /api/v1/notifications/:id/read
   */
  async markAsRead(id: string): Promise<void> {
    const response = await api.post<ApiResponse>(`/notifications/${id}/read`);
    if (!response.success) {
      throw new Error('Failed to mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   * POST /api/v1/notifications/read-all
   */
  async markAllAsRead(): Promise<void> {
    const response = await api.post<ApiResponse>('/notifications/read-all');
    if (!response.success) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:id
   */
  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/notifications/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete notification');
    }
  },

  /**
   * Delete all notifications
   * DELETE /api/v1/notifications/all
   */
  async deleteAll(): Promise<void> {
    const response = await api.delete<ApiResponse>('/notifications/all');
    if (!response.success) {
      throw new Error('Failed to delete all notifications');
    }
  },
};

export default notificationsService;
