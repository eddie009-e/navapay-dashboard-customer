/**
 * Wallet Service
 * NavaPay Merchant Dashboard
 *
 * متوافق مع النواة المالية (fincore)
 */

import { api, ApiResponse, PaginatedResponse } from './api';

// ============================================
// Types - متوافقة مع النواة
// ============================================

export interface Wallet {
  id: string;
  walletId?: string;
  walletNumber?: string;
  balance: number;
  availableBalance?: number;
  heldBalance?: number;
  currency: string;
  status: string;
  type?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter?: number;
  description: string;
  reference?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode?: string;
  accountNumber?: string;
  accountNumberMasked?: string;
  iban?: string;
  accountHolder: string;
  nickname?: string;
  isDefault: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt?: string;
}

export interface TransferRequest {
  amount: number;
  bankAccountId: string;
  description?: string;
  pinToken?: string;
}

// ============================================
// Wallet Service - متوافق مع النواة
// ============================================

export const walletService = {
  /**
   * Get merchant wallet info
   * GET /api/v1/merchant/wallet
   */
  async getWallet(): Promise<Wallet> {
    try {
      const response = await api.get<ApiResponse<{
        walletId: string;
        currency: string;
        balance: string | number;
        availableBalance: string | number;
        heldBalance: string | number;
      }>>('/merchant/wallet');

      if (response.success && response.data) {
        return {
          id: response.data.walletId,
          walletId: response.data.walletId,
          balance: typeof response.data.balance === 'string'
            ? parseFloat(response.data.balance)
            : response.data.balance,
          availableBalance: typeof response.data.availableBalance === 'string'
            ? parseFloat(response.data.availableBalance)
            : response.data.availableBalance,
          heldBalance: typeof response.data.heldBalance === 'string'
            ? parseFloat(response.data.heldBalance)
            : response.data.heldBalance,
          currency: response.data.currency,
          status: 'active',
        };
      }
    } catch {
      // API not available
    }
    return { id: '', balance: 0, availableBalance: 0, heldBalance: 0, currency: 'SYP', status: 'active' };
  },

  /**
   * Get user wallets list
   * GET /api/v1/wallets
   */
  async getWallets(): Promise<Wallet[]> {
    try {
      const response = await api.get<ApiResponse<Array<{
        id: string;
        walletNumber: string;
        type: string;
        currency: string;
        status: string;
        createdAt: string;
      }>>>('/wallets');

      if (response.success && response.data) {
        return response.data.map(w => ({
          id: w.id,
          walletNumber: w.walletNumber,
          type: w.type,
          balance: 0, // نحتاج استدعاء getBalance للرصيد
          currency: w.currency,
          status: w.status,
        }));
      }
    } catch {
      // API not available
    }
    return [];
  },

  /**
   * Get wallet balance
   * GET /api/v1/wallets/:id/balance
   */
  async getBalance(walletId: string): Promise<{
    balance: number;
    availableBalance: number;
    heldBalance: number;
    currency: string;
  }> {
    const response = await api.get<ApiResponse<{
      walletId: string;
      currency: string;
      balance: string | number;
      availableBalance: string | number;
      heldBalance: string | number;
    }>>(`/wallets/${walletId}/balance`);

    if (response.success && response.data) {
      return {
        balance: typeof response.data.balance === 'string'
          ? parseFloat(response.data.balance)
          : response.data.balance,
        availableBalance: typeof response.data.availableBalance === 'string'
          ? parseFloat(response.data.availableBalance)
          : response.data.availableBalance,
        heldBalance: typeof response.data.heldBalance === 'string'
          ? parseFloat(response.data.heldBalance)
          : response.data.heldBalance,
        currency: response.data.currency,
      };
    }

    throw new Error('Failed to get balance');
  },

  /**
   * Get wallet transactions
   * GET /api/v1/wallets/:id/transactions
   */
  async getTransactions(walletId: string, params?: {
    page?: number;
    limit?: number;
    type?: 'credit' | 'debit';
  }): Promise<PaginatedResponse<WalletTransaction>> {
    try {
      const response = await api.get<ApiResponse<{
        transactions: WalletTransaction[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>>(`/wallets/${walletId}/transactions`, params);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.transactions,
          page: response.data.pagination.page,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        };
      }
    } catch {
      // API not available
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
   * Get linked bank accounts
   * GET /api/v1/user/bank-accounts
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    try {
      const response = await api.get<ApiResponse<Array<{
        id: string;
        bankName: string;
        bankCode: string;
        accountNumberMasked: string;
        iban?: string;
        accountHolder: string;
        nickname?: string;
        isDefault: boolean;
        isVerified: boolean;
        verifiedAt?: string;
        createdAt: string;
      }>>>('/user/bank-accounts');

      if (response.success && response.data) {
        return response.data.map(acc => ({
          id: acc.id,
          bankName: acc.bankName,
          bankCode: acc.bankCode,
          accountNumberMasked: acc.accountNumberMasked,
          accountNumber: acc.accountNumberMasked, // للتوافق
          iban: acc.iban,
          accountHolder: acc.accountHolder,
          nickname: acc.nickname,
          isDefault: acc.isDefault,
          isVerified: acc.isVerified,
          verifiedAt: acc.verifiedAt,
          createdAt: acc.createdAt,
        }));
      }
    } catch {
      // API not available
    }
    return [];
  },

  /**
   * Add bank account
   * POST /api/v1/user/bank-accounts
   */
  async addBankAccount(data: {
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    nickname?: string;
  }): Promise<BankAccount> {
    const response = await api.post<ApiResponse<BankAccount>>('/user/bank-accounts', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to add bank account');
  },

  /**
   * Remove bank account
   * DELETE /api/v1/user/bank-accounts/:id
   */
  async removeBankAccount(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/user/bank-accounts/${id}`);
    if (!response.success) {
      throw new Error('Failed to remove bank account');
    }
  },

  /**
   * Set default bank account
   * POST /api/v1/user/bank-accounts/:id/default
   */
  async setDefaultBankAccount(id: string): Promise<void> {
    const response = await api.post<ApiResponse>(`/user/bank-accounts/${id}/default`);
    if (!response.success) {
      throw new Error('Failed to set default bank account');
    }
  },

  /**
   * Verify bank account
   * POST /api/v1/user/bank-accounts/:id/verify
   */
  async verifyBankAccount(id: string): Promise<{ isVerified: boolean; verifiedAt?: string }> {
    const response = await api.post<ApiResponse<{ isVerified: boolean; verifiedAt?: string }>>(
      `/user/bank-accounts/${id}/verify`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to verify bank account');
  },

  /**
   * Withdraw to bank account (Transfer to bank)
   * POST /api/v1/user/wallet/withdraw
   */
  async transferToBank(data: TransferRequest): Promise<{
    transactionId: string;
    status: string;
    amount: number;
    fees: number;
    netAmount: number;
  }> {
    const response = await api.post<ApiResponse<{
      transactionId: string;
      internalReference: string;
      amount: number;
      fees: number;
      netAmount: number;
      status: string;
      requiresApproval?: boolean;
    }>>('/user/wallet/withdraw', {
      amount: data.amount.toString(),
      bankAccountId: data.bankAccountId,
      description: data.description,
      pinToken: data.pinToken,
    });

    if (response.success && response.data) {
      return {
        transactionId: response.data.transactionId || response.data.internalReference,
        status: response.data.status,
        amount: response.data.amount,
        fees: response.data.fees,
        netAmount: response.data.netAmount,
      };
    }
    throw new Error('Failed to initiate transfer');
  },

  /**
   * Deposit to wallet
   * POST /api/v1/user/wallet/deposit
   */
  async deposit(data: {
    amount: number;
    bankAccountId?: string;
    bankCardId?: string;
  }): Promise<{
    transactionId: string;
    status: string;
    amount: number;
    fees: number;
    netAmount: number;
  }> {
    const response = await api.post<ApiResponse<{
      transactionId: string;
      internalReference: string;
      amount: number;
      fees: number;
      netAmount: number;
      status: string;
    }>>('/user/wallet/deposit', {
      amount: data.amount.toString(),
      bankAccountId: data.bankAccountId,
      bankCardId: data.bankCardId,
    });

    if (response.success && response.data) {
      return {
        transactionId: response.data.transactionId || response.data.internalReference,
        status: response.data.status,
        amount: response.data.amount,
        fees: response.data.fees,
        netAmount: response.data.netAmount,
      };
    }
    throw new Error('Failed to initiate deposit');
  },

  /**
   * Get bank transactions history
   * GET /api/v1/user/bank-transactions
   */
  async getBankTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    fees: number;
    netAmount: number;
    status: string;
    reference: string;
    description?: string;
    createdAt: string;
    completedAt?: string;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        transactions: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>>('/user/bank-transactions', params);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.transactions,
          page: response.data.pagination.page,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        };
      }
    } catch {
      // API not available
    }
    return {
      success: false,
      data: [],
      page: 1,
      total: 0,
      totalPages: 0,
    };
  },
};

export default walletService;
