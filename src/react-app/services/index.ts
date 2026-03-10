/**
 * Services Index
 * NavaPay Merchant Dashboard
 */

// Base API
export * from './api';

// Service modules
export { authService } from './auth.service';
export { dashboardService } from './dashboard.service';
export { customersService } from './customers.service';
export { reportsService } from './reports.service';
export { walletService } from './wallet.service';
export { invoicesService } from './invoices.service';
export { employeesService, EMPLOYEE_PERMISSIONS } from './employees.service';
export { branchesService } from './branches.service';
export { developersService, WEBHOOK_EVENTS, API_PERMISSIONS } from './developers.service';
export { transactionsService } from './transactions.service';
export { posService } from './pos.service';
export { paymentLinksService } from './paymentLinks.service';
export { recurringInvoicesService } from './recurringInvoices.service';
export { notificationsService } from './notifications.service';
export { payrollService } from './payroll.service';

// Re-export types
export type { PinLoginRequest, LoginResponse, MerchantProfile, OtpResponse, OtpVerifyResponse, AuthResponse } from './auth.service';
export type { TodayStats, SalesDataPoint, InvoiceStats, RecentTransaction } from './dashboard.service';
export type { Customer, CreateCustomerDto, UpdateCustomerDto, CustomerTransaction } from './customers.service';
export type { SalesReport, DailyReport, MonthlyReport, YearlyReport, TransactionExport } from './reports.service';
export type { Wallet, WalletTransaction, BankAccount, TransferRequest } from './wallet.service';
export type { Invoice, InvoiceItem, CreateInvoiceDto, UpdateInvoiceDto } from './invoices.service';
export type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from './employees.service';
export type { Branch, BranchStats, CreateBranchDto, UpdateBranchDto } from './branches.service';
export type { ApiKey, ApiKeyWithSecret, Webhook, ApiLog, CreateApiKeyDto, CreateWebhookDto, UpdateWebhookDto } from './developers.service';
export type { Transaction, TransactionFilters, TransactionStats } from './transactions.service';
export type { POSPaymentRequest, POSPaymentSession, POSPaymentResult, POSConfig, RecentCustomer } from './pos.service';
export type { PaymentLink, CreatePaymentLinkDto, UpdatePaymentLinkDto } from './paymentLinks.service';
export type { RecurringInvoice, CreateRecurringInvoiceDto, UpdateRecurringInvoiceDto } from './recurringInvoices.service';
export type { Notification, NotificationStats } from './notifications.service';
export type { BulkTransfer, BulkTransferRecipient, BulkTransferDetails, CreateBulkTransferDto, BulkTransferStats } from './payroll.service';
