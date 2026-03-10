// Mock Data for NavaPay Merchant Dashboard

export interface Store {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  plan: 'pos' | 'enterprise';
  logo: string;
  qrCode: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'cashier' | 'accountant';
  avatar: string | null;
}

export interface Wallet {
  balance: number;
  pendingIn: number;
  pendingOut: number;
  currency: string;
}

export interface TodayStats {
  sales: number;
  salesChange: number;
  transactions: number;
  refunds: number;
  pendingInvoices: number;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'transfer';
  amount: number;
  customerName: string;
  customerPhone: string;
  method: 'nfc' | 'qr' | 'phone';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  employeeName?: string;
  branchName?: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  items?: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalSpent: number;
  transactionsCount: number;
  lastTransaction: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: 'owner' | 'admin' | 'manager' | 'cashier' | 'accountant';
  branch: string | null;
  status: 'active' | 'suspended';
  pin: string;
  lastLogin: string;
  transactionsCount?: number;
  totalSales?: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string | null;
  employeesCount: number;
  isMain: boolean;
  monthlySales?: number;
}

export interface PaymentLink {
  id: string;
  name: string;
  url: string;
  amount: number | 'open';
  status: 'active' | 'disabled' | 'expired';
  usageCount: number;
  createdAt: string;
  expiresAt?: string;
}

export interface RecurringInvoice {
  id: string;
  name: string;
  customerName: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'ended';
  nextDate: string;
  startDate: string;
  endDate?: string;
}

export interface BulkTransfer {
  id: string;
  name: string;
  type: 'payroll' | 'suppliers' | 'refunds' | 'other';
  recipientsCount: number;
  totalAmount: number;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'partial_failed';
  createdAt: string;
  createdBy: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'invoice' | 'refund' | 'system';
  read: boolean;
  createdAt: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'disabled';
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
  requestCount: number;
}

export interface APIRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  responseTime: number;
  apiKeyId: string;
  createdAt: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'disabled';
  secret: string;
  createdAt: string;
  lastTriggered: string | null;
  successRate: number;
  totalDeliveries: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  statusCode: number | null;
  attempts: number;
  responseTime: number | null;
  createdAt: string;
  payload?: any;
  response?: string;
}

// Mock Store Data
export const mockStore: Store = {
  id: 'store_123',
  name: 'متجر الأمل',
  type: 'retail',
  phone: '0912345678',
  email: 'info@alamal.com',
  address: 'دمشق، المزة، شارع الجلاء',
  plan: 'pos',
  logo: '/logo.png',
  qrCode: 'STORE-ABC123',
  createdAt: '2024-01-15'
};

// Mock Current User
export const mockCurrentUser: User = {
  id: 'user_1',
  name: 'أحمد محمد',
  phone: '0912345678',
  email: 'ahmed@email.com',
  role: 'owner',
  avatar: null
};

// Mock Wallet
export const mockWallet: Wallet = {
  balance: 2450000,
  pendingIn: 150000,
  pendingOut: 0,
  currency: 'SYP'
};

// Mock Today Stats
export const mockTodayStats: TodayStats = {
  sales: 850000,
  salesChange: 12,
  transactions: 23,
  refunds: 75000,
  pendingInvoices: 3
};

// Mock Transactions
export const mockTransactions: Transaction[] = [
  { 
    id: 'TXN-123456', 
    type: 'payment', 
    amount: 250000, 
    customerName: 'أحمد محمد', 
    customerPhone: '0912345678', 
    method: 'nfc', 
    status: 'completed', 
    createdAt: '2026-01-20T10:45:00',
    employeeName: 'سامر علي',
    branchName: 'الفرع الرئيسي'
  },
  { 
    id: 'TXN-123455', 
    type: 'payment', 
    amount: 125000, 
    customerName: 'سارة علي', 
    customerPhone: '0934567890', 
    method: 'qr', 
    status: 'completed', 
    createdAt: '2026-01-20T10:30:00',
    employeeName: 'سامر علي',
    branchName: 'الفرع الرئيسي'
  },
  { 
    id: 'TXN-123454', 
    type: 'refund', 
    amount: 75000, 
    customerName: 'خالد حسن', 
    customerPhone: '0956789012', 
    method: 'nfc', 
    status: 'completed', 
    createdAt: '2026-01-20T10:15:00',
    employeeName: 'منى أحمد',
    branchName: 'الفرع الرئيسي'
  },
  { 
    id: 'TXN-123453', 
    type: 'payment', 
    amount: 180000, 
    customerName: 'فاطمة محمود', 
    customerPhone: '0945678901', 
    method: 'phone', 
    status: 'completed', 
    createdAt: '2026-01-20T09:50:00'
  },
  { 
    id: 'TXN-123452', 
    type: 'payment', 
    amount: 95000, 
    customerName: 'محمد خالد', 
    customerPhone: '0923456789', 
    method: 'qr', 
    status: 'completed', 
    createdAt: '2026-01-20T09:20:00'
  },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  { 
    id: 'INV-2024-0045', 
    customerName: 'أحمد محمد', 
    customerPhone: '0912345678', 
    amount: 250000, 
    status: 'pending', 
    dueDate: '2026-01-25', 
    createdAt: '2026-01-20',
    items: [
      { description: 'خدمة صيانة', quantity: 1, price: 150000 },
      { description: 'قطع غيار', quantity: 2, price: 50000 }
    ],
    notes: 'يرجى السداد قبل نهاية الأسبوع'
  },
  { 
    id: 'INV-2024-0044', 
    customerName: 'سارة علي', 
    customerPhone: '0934567890', 
    amount: 125000, 
    status: 'paid', 
    dueDate: '2026-01-24', 
    paidAt: '2026-01-19', 
    createdAt: '2026-01-19',
    items: [
      { description: 'منتجات', quantity: 5, price: 25000 }
    ]
  },
  { 
    id: 'INV-2024-0043', 
    customerName: 'خالد حسن', 
    customerPhone: '0956789012', 
    amount: 180000, 
    status: 'overdue', 
    dueDate: '2026-01-18', 
    createdAt: '2026-01-15',
    items: [
      { description: 'اشتراك شهري', quantity: 1, price: 180000 }
    ]
  },
  { 
    id: 'INV-2024-0042', 
    customerName: 'فاطمة محمود', 
    customerPhone: '0945678901', 
    amount: 320000, 
    status: 'pending', 
    dueDate: '2026-01-22', 
    createdAt: '2026-01-17',
    items: [
      { description: 'طلب خاص', quantity: 1, price: 320000 }
    ]
  },
  { 
    id: 'INV-2024-0041', 
    customerName: 'محمد خالد', 
    customerPhone: '0923456789', 
    amount: 95000, 
    status: 'draft', 
    dueDate: '2026-01-30', 
    createdAt: '2026-01-20',
    items: [
      { description: 'خدمات استشارية', quantity: 2, price: 47500 }
    ]
  },
];

// Mock Customers
export const mockCustomers: Customer[] = [
  { 
    id: 'cust_1', 
    name: 'أحمد محمد', 
    phone: '0912345678', 
    email: 'ahmed@email.com', 
    totalSpent: 1500000, 
    transactionsCount: 15, 
    lastTransaction: '2026-01-20' 
  },
  { 
    id: 'cust_2', 
    name: 'سارة علي', 
    phone: '0934567890', 
    email: null, 
    totalSpent: 850000, 
    transactionsCount: 8, 
    lastTransaction: '2026-01-19' 
  },
  { 
    id: 'cust_3', 
    name: 'خالد حسن', 
    phone: '0956789012', 
    email: 'khaled@email.com', 
    totalSpent: 2100000, 
    transactionsCount: 22, 
    lastTransaction: '2026-01-18' 
  },
  { 
    id: 'cust_4', 
    name: 'فاطمة محمود', 
    phone: '0945678901', 
    email: 'fatima@email.com', 
    totalSpent: 980000, 
    transactionsCount: 12, 
    lastTransaction: '2026-01-20' 
  },
  { 
    id: 'cust_5', 
    name: 'محمد خالد', 
    phone: '0923456789', 
    email: null, 
    totalSpent: 1200000, 
    transactionsCount: 18, 
    lastTransaction: '2026-01-19' 
  },
];

// Mock Employees (Enterprise)
export const mockEmployees: Employee[] = [
  { 
    id: 'emp_1', 
    name: 'سامر علي', 
    phone: '0911111111', 
    email: null,
    role: 'cashier', 
    branch: 'الفرع الرئيسي', 
    status: 'active', 
    pin: '1234', 
    lastLogin: '2026-01-20T08:00:00',
    transactionsCount: 45,
    totalSales: 3200000
  },
  { 
    id: 'emp_2', 
    name: 'منى أحمد', 
    phone: '0922222222',
    email: 'mona@email.com', 
    role: 'manager', 
    branch: 'الفرع الرئيسي', 
    status: 'active', 
    pin: '5678', 
    lastLogin: '2026-01-20T09:30:00',
    transactionsCount: 67,
    totalSales: 5800000
  },
  { 
    id: 'emp_3', 
    name: 'علي حسن', 
    phone: '0933333333',
    email: 'ali@email.com', 
    role: 'accountant', 
    branch: null, 
    status: 'active', 
    pin: '9012', 
    lastLogin: '2026-01-19T14:00:00',
    transactionsCount: 0,
    totalSales: 0
  },
  { 
    id: 'emp_4', 
    name: 'ليلى محمد', 
    phone: '0944444444',
    email: null, 
    role: 'cashier', 
    branch: 'فرع حلب', 
    status: 'active', 
    pin: '3456', 
    lastLogin: '2026-01-20T07:45:00',
    transactionsCount: 38,
    totalSales: 2900000
  },
];

// Mock Branches (Enterprise)
export const mockBranches: Branch[] = [
  { 
    id: 'branch_1', 
    name: 'الفرع الرئيسي', 
    address: 'دمشق - المزة', 
    phone: '0111234567', 
    manager: 'منى أحمد', 
    employeesCount: 5, 
    isMain: true,
    monthlySales: 8500000
  },
  { 
    id: 'branch_2', 
    name: 'فرع حلب', 
    address: 'حلب - العزيزية', 
    phone: '0211234567', 
    manager: null, 
    employeesCount: 3, 
    isMain: false,
    monthlySales: 4200000
  },
  { 
    id: 'branch_3', 
    name: 'فرع حمص', 
    address: 'حمص - الوعر', 
    phone: '0311234567', 
    manager: 'سامر علي', 
    employeesCount: 2, 
    isMain: false,
    monthlySales: 2800000
  },
];

// Mock Payment Links
export const mockPaymentLinks: PaymentLink[] = [
  {
    id: 'link_1',
    name: 'دفع الاشتراك الشهري',
    url: 'https://pay.navapay.com/store_123/link_1',
    amount: 150000,
    status: 'active',
    usageCount: 12,
    createdAt: '2026-01-01'
  },
  {
    id: 'link_2',
    name: 'دفع مرن',
    url: 'https://pay.navapay.com/store_123/link_2',
    amount: 'open',
    status: 'active',
    usageCount: 45,
    createdAt: '2025-12-15'
  },
  {
    id: 'link_3',
    name: 'تبرعات',
    url: 'https://pay.navapay.com/store_123/link_3',
    amount: 'open',
    status: 'active',
    usageCount: 8,
    createdAt: '2026-01-10'
  },
];

// Mock Recurring Invoices
export const mockRecurringInvoices: RecurringInvoice[] = [
  {
    id: 'rec_1',
    name: 'اشتراك صيانة شهري',
    customerName: 'أحمد محمد',
    amount: 200000,
    frequency: 'monthly',
    status: 'active',
    nextDate: '2026-02-01',
    startDate: '2025-06-01'
  },
  {
    id: 'rec_2',
    name: 'إيجار مخزن',
    customerName: 'شركة الأمل',
    amount: 500000,
    frequency: 'monthly',
    status: 'active',
    nextDate: '2026-02-01',
    startDate: '2025-01-01'
  },
  {
    id: 'rec_3',
    name: 'اشتراك سنوي',
    customerName: 'خالد حسن',
    amount: 1800000,
    frequency: 'yearly',
    status: 'paused',
    nextDate: '2026-06-15',
    startDate: '2024-06-15'
  },
];

// Mock Bulk Transfers
export const mockBulkTransfers: BulkTransfer[] = [
  {
    id: 'bulk_1',
    name: 'رواتب يناير 2026',
    type: 'payroll',
    recipientsCount: 8,
    totalAmount: 12000000,
    status: 'completed',
    createdAt: '2026-01-05',
    createdBy: 'أحمد محمد'
  },
  {
    id: 'bulk_2',
    name: 'دفعات الموردين',
    type: 'suppliers',
    recipientsCount: 5,
    totalAmount: 4500000,
    status: 'completed',
    createdAt: '2026-01-15',
    createdBy: 'أحمد محمد'
  },
  {
    id: 'bulk_3',
    name: 'رواتب ديسمبر 2025',
    type: 'payroll',
    recipientsCount: 7,
    totalAmount: 10500000,
    status: 'completed',
    createdAt: '2025-12-05',
    createdBy: 'أحمد محمد'
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    title: 'دفعة جديدة',
    message: 'تم استلام دفعة بقيمة 250,000 ل.س من أحمد محمد',
    type: 'payment',
    read: false,
    createdAt: '2026-01-20T10:45:00'
  },
  {
    id: 'notif_2',
    title: 'فاتورة متأخرة',
    message: 'الفاتورة INV-2024-0043 متأخرة بـ 2 يوم',
    type: 'invoice',
    read: false,
    createdAt: '2026-01-20T09:00:00'
  },
  {
    id: 'notif_3',
    title: 'طلب استرجاع',
    message: 'تم استرجاع مبلغ 75,000 ل.س للعميل خالد حسن',
    type: 'refund',
    read: true,
    createdAt: '2026-01-20T08:30:00'
  },
  {
    id: 'notif_4',
    title: 'تحديث النظام',
    message: 'تم إضافة ميزات جديدة إلى لوحة التحكم',
    type: 'system',
    read: true,
    createdAt: '2026-01-19T15:00:00'
  },
  {
    id: 'notif_5',
    title: 'فاتورة مدفوعة',
    message: 'تم دفع الفاتورة INV-2024-0044 من سارة علي',
    type: 'invoice',
    read: true,
    createdAt: '2026-01-19T11:20:00'
  },
];

// Sales data for charts (last 7 days)
export const mockSalesData = [
  { date: '14 يناير', amount: 650000 },
  { date: '15 يناير', amount: 720000 },
  { date: '16 يناير', amount: 580000 },
  { date: '17 يناير', amount: 810000 },
  { date: '18 يناير', amount: 690000 },
  { date: '19 يناير', amount: 920000 },
  { date: '20 يناير', amount: 850000 },
];

// Payment methods distribution
export const mockPaymentMethods = [
  { method: 'NFC', count: 45, percentage: 52 },
  { method: 'QR', count: 28, percentage: 32 },
  { method: 'رقم الجوال', count: 14, percentage: 16 },
];

// Mock API Keys
export const mockAPIKeys: APIKey[] = [
  {
    id: 'key_1',
    name: 'Production API Key',
    key: 'nava_prod_xxxxxxxxxxxxxxxxxxxxxxxx',
    status: 'active',
    permissions: ['read', 'write'],
    createdAt: '2025-12-01',
    lastUsed: '2026-01-20T10:30:00',
    requestCount: 12450
  },
  {
    id: 'key_2',
    name: 'Development API Key',
    key: 'nava_dev_xxxxxxxxxxxxxxxxxxxxxxxx',
    status: 'active',
    permissions: ['read'],
    createdAt: '2026-01-10',
    lastUsed: '2026-01-19T15:45:00',
    requestCount: 3280
  },
  {
    id: 'key_3',
    name: 'Legacy API Key',
    key: 'nava_legacy_xxxxxxxxxxxxxxxxxxxxxxxx',
    status: 'disabled',
    permissions: ['read', 'write'],
    createdAt: '2024-06-15',
    lastUsed: '2025-11-20T08:15:00',
    requestCount: 45600
  }
];

// Mock Webhooks
export const mockWebhooks: Webhook[] = [
  {
    id: 'webhook_1',
    name: 'Production Webhook',
    url: 'https://myapp.com/api/webhooks/navapay',
    events: ['payment.completed', 'payment.failed', 'invoice.paid'],
    status: 'active',
    secret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2025-12-01',
    lastTriggered: '2026-01-20T10:30:00',
    successRate: 98.5,
    totalDeliveries: 1234
  },
  {
    id: 'webhook_2',
    name: 'Invoice Updates',
    url: 'https://accounting.example.com/webhooks',
    events: ['invoice.created', 'invoice.paid', 'invoice.overdue'],
    status: 'active',
    secret: 'whsec_yyyyyyyyyyyyyyyyyyyyyyyy',
    createdAt: '2026-01-05',
    lastTriggered: '2026-01-19T14:20:00',
    successRate: 95.2,
    totalDeliveries: 456
  },
  {
    id: 'webhook_3',
    name: 'Test Webhook',
    url: 'https://webhook.site/unique-url',
    events: ['payment.completed'],
    status: 'disabled',
    secret: 'whsec_zzzzzzzzzzzzzzzzzzzzzzzz',
    createdAt: '2025-11-20',
    lastTriggered: '2025-12-15T09:00:00',
    successRate: 87.3,
    totalDeliveries: 89
  }
];

// Mock Webhook Deliveries
export const mockWebhookDeliveries: WebhookDelivery[] = [
  {
    id: 'del_1',
    webhookId: 'webhook_1',
    event: 'payment.completed',
    status: 'success',
    statusCode: 200,
    attempts: 1,
    responseTime: 145,
    createdAt: '2026-01-20T10:30:00',
    payload: { transaction_id: 'TXN-123456', amount: 250000 },
    response: 'OK'
  },
  {
    id: 'del_2',
    webhookId: 'webhook_2',
    event: 'invoice.paid',
    status: 'success',
    statusCode: 200,
    attempts: 1,
    responseTime: 98,
    createdAt: '2026-01-19T14:20:00',
    payload: { invoice_id: 'INV-2024-0044', amount: 125000 },
    response: 'Received'
  },
  {
    id: 'del_3',
    webhookId: 'webhook_1',
    event: 'payment.failed',
    status: 'failed',
    statusCode: 500,
    attempts: 3,
    responseTime: 2340,
    createdAt: '2026-01-19T11:15:00',
    payload: { transaction_id: 'TXN-123450', error: 'Insufficient funds' },
    response: 'Internal Server Error'
  },
  {
    id: 'del_4',
    webhookId: 'webhook_2',
    event: 'invoice.overdue',
    status: 'success',
    statusCode: 200,
    attempts: 1,
    responseTime: 120,
    createdAt: '2026-01-19T09:00:00',
    payload: { invoice_id: 'INV-2024-0043', days_overdue: 2 },
    response: 'OK'
  },
  {
    id: 'del_5',
    webhookId: 'webhook_1',
    event: 'payment.completed',
    status: 'pending',
    statusCode: null,
    attempts: 0,
    responseTime: null,
    createdAt: '2026-01-20T10:35:00',
    payload: { transaction_id: 'TXN-123457', amount: 180000 }
  },
  {
    id: 'del_6',
    webhookId: 'webhook_2',
    event: 'invoice.created',
    status: 'failed',
    statusCode: 404,
    attempts: 2,
    responseTime: 890,
    createdAt: '2026-01-18T16:30:00',
    payload: { invoice_id: 'INV-2024-0045', amount: 250000 },
    response: 'Not Found'
  }
];

// Mock API Requests
export const mockAPIRequests: APIRequest[] = [
  {
    id: 'req_1',
    method: 'POST',
    endpoint: '/api/v1/payments',
    status: 200,
    responseTime: 145,
    apiKeyId: 'key_1',
    createdAt: '2026-01-20T10:30:00'
  },
  {
    id: 'req_2',
    method: 'GET',
    endpoint: '/api/v1/invoices',
    status: 200,
    responseTime: 82,
    apiKeyId: 'key_1',
    createdAt: '2026-01-20T10:25:00'
  },
  {
    id: 'req_3',
    method: 'GET',
    endpoint: '/api/v1/customers/cust_123',
    status: 200,
    responseTime: 65,
    apiKeyId: 'key_2',
    createdAt: '2026-01-20T10:20:00'
  },
  {
    id: 'req_4',
    method: 'POST',
    endpoint: '/api/v1/refunds',
    status: 201,
    responseTime: 230,
    apiKeyId: 'key_1',
    createdAt: '2026-01-20T10:15:00'
  },
  {
    id: 'req_5',
    method: 'DELETE',
    endpoint: '/api/v1/invoices/inv_456',
    status: 204,
    responseTime: 95,
    apiKeyId: 'key_1',
    createdAt: '2026-01-20T10:10:00'
  },
  {
    id: 'req_6',
    method: 'PUT',
    endpoint: '/api/v1/customers/cust_789',
    status: 200,
    responseTime: 120,
    apiKeyId: 'key_2',
    createdAt: '2026-01-20T10:05:00'
  },
  {
    id: 'req_7',
    method: 'GET',
    endpoint: '/api/v1/transactions',
    status: 200,
    responseTime: 180,
    apiKeyId: 'key_1',
    createdAt: '2026-01-20T10:00:00'
  },
  {
    id: 'req_8',
    method: 'POST',
    endpoint: '/api/v1/payments',
    status: 400,
    responseTime: 45,
    apiKeyId: 'key_2',
    createdAt: '2026-01-20T09:55:00'
  }
];
