/**
 * Reminders Service
 * APIs: reminders.controller.ts -> /merchant/reminders/*
 */

import { api } from './api';

export interface Reminder {
  id: string;
  customerPhone: string;
  customerName?: string;
  amount: number;
  currency: string;
  message?: string;
  status: 'pending' | 'sent' | 'paid' | 'cancelled';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemindersListResponse {
  reminders: Reminder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateReminderDto {
  customerPhone: string;
  amount: number;
  currency?: string;
  message?: string;
  dueDate?: string;
}

export const remindersService = {
  /**
   * List reminders
   * GET /merchant/reminders
   */
  async list(params?: { page?: number; limit?: number; status?: string; customerPhone?: string }) {
    return api.get<RemindersListResponse>('/merchant/reminders', {
      page: params?.page || 1,
      limit: params?.limit || 20,
      ...(params?.status && { status: params.status }),
      ...(params?.customerPhone && { customerPhone: params.customerPhone }),
    });
  },

  /**
   * Get single reminder
   * GET /merchant/reminders/:id
   */
  async getById(id: string) {
    return api.get<Reminder>(`/merchant/reminders/${id}`);
  },

  /**
   * Create reminder
   * POST /merchant/reminders
   */
  async create(data: CreateReminderDto) {
    return api.post<Reminder>('/merchant/reminders', data);
  },

  /**
   * Cancel reminder
   * DELETE /merchant/reminders/:id
   */
  async cancel(id: string) {
    return api.delete(`/merchant/reminders/${id}`);
  },
};
