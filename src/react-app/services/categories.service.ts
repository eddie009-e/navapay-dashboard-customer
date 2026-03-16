/**
 * Transaction Categories Service
 * APIs: transaction-categories.controller.ts -> /merchant/categories/*
 */

import { api } from './api';

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  color?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  nameAr?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  nameAr?: string;
  icon?: string;
  color?: string;
}

export const categoriesService = {
  /**
   * List merchant categories
   * GET /merchant/categories
   */
  async list() {
    return api.get<Category[]>('/merchant/categories');
  },

  /**
   * Get system default categories
   * GET /categories/system
   */
  async getSystem() {
    return api.get<Category[]>('/categories/system');
  },

  /**
   * Create category
   * POST /merchant/categories
   */
  async create(data: CreateCategoryDto) {
    return api.post<Category>('/merchant/categories', data);
  },

  /**
   * Update category
   * PUT /merchant/categories/:id
   */
  async update(id: string, data: UpdateCategoryDto) {
    return api.put<Category>(`/merchant/categories/${id}`, data);
  },

  /**
   * Delete category
   * DELETE /merchant/categories/:id
   */
  async delete(id: string) {
    return api.delete(`/merchant/categories/${id}`);
  },
};
