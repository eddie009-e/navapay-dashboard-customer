import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import MainLayout from '@/react-app/components/MainLayout';
import { Phone, Mail, Calendar, DollarSign, ShoppingBag, TrendingUp, Eye, Download, Filter, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { customersService, Customer, CustomerTransaction } from '../services';

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'payment' | 'refund'>('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<CustomerTransaction | null>(null);

  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await customersService.getById(id);
        setCustomer(data);
      } catch (error) {
        console.error('Failed to load customer:', error);
        setCustomer(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  // Load customer transactions
  useEffect(() => {
    const loadTransactions = async () => {
      if (!id) return;

      setIsLoadingTransactions(true);
      try {
        const response = await customersService.getTransactions(id);
        setCustomerTransactions(response.data ?? []);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={48} className="animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!customer) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">العميل غير موجود</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على هذا العميل</p>
          <Link to="/customers">
            <Button>العودة للعملاء</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Apply filters
  const filteredTransactions = customerTransactions.filter(transaction => {
    if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('ar-SY', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusBadge = (status: CustomerTransaction['status']) => {
    const badges: Record<string, { text: string; class: string }> = {
      completed: { text: 'مكتملة', class: 'bg-success/10 text-success' },
      pending: { text: 'معلقة', class: 'bg-warning/10 text-warning' },
      failed: { text: 'فاشلة', class: 'bg-error/10 text-error' }
    };
    return badges[status] || badges['pending'];
  };

  const getTypeIcon = (type: CustomerTransaction['type']) => {
    if (type === 'payment') return '💰';
    if (type === 'refund') return '↩️';
    return '💸';
  };

  const getMethodText = (method: CustomerTransaction['method']) => {
    const methods: Record<string, string> = {
      nfc: 'NFC',
      qr: 'QR',
      phone: 'رقم الجوال'
    };
    return methods[method] || method;
  };

  // Calculate period stats
  const totalPayments = filteredTransactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalRefunds = filteredTransactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <MainLayout>
      <BackButton to="/customers" label="العملاء" />
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="mb-6">

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-bold text-3xl">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{customer.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span className="font-numbers">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.lastTransactionAt && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>آخر تعامل: {formatDate(customer.lastTransactionAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" leftIcon={<Download size={20} />}>
                تصدير البيانات
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-4 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-success" />
                  <p className="text-sm text-gray-700">إجمالي الإنفاق</p>
                </div>
                <p className="text-3xl font-bold text-success font-numbers">{formatCurrency(customer.totalSpent)}</p>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={20} className="text-primary" />
                  <p className="text-sm text-gray-700">عدد العمليات</p>
                </div>
                <p className="text-3xl font-bold text-primary font-numbers">{customer.transactionsCount}</p>
              </div>

              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-4 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-accent" />
                  <p className="text-sm text-gray-700">متوسط العملية</p>
                </div>
                <p className="text-2xl font-bold text-accent font-numbers">
                  {formatCurrency(customer.totalSpent / customer.transactionsCount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">تصفية العمليات</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع العملية</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'payment' | 'refund')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
              >
                <option value="all">كل الأنواع</option>
                <option value="payment">دفع</option>
                <option value="refund">استرجاع</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفترة الزمنية</label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
              >
                <option value="all">كل الفترات</option>
                <option value="today">اليوم</option>
                <option value="week">آخر 7 أيام</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذا العام</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">إحصائيات الفترة</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-success/5 rounded-lg p-2 text-center border border-success/20">
                  <p className="text-xs text-gray-600 mb-1">الدفعات</p>
                  <p className="text-sm font-bold text-success font-numbers">{formatCurrency(totalPayments)}</p>
                </div>
                <div className="bg-error/5 rounded-lg p-2 text-center border border-error/20">
                  <p className="text-xs text-gray-600 mb-1">الاسترجاعات</p>
                  <p className="text-sm font-bold text-error font-numbers">{formatCurrency(totalRefunds)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">سجل العمليات</h2>
            <p className="text-sm text-gray-600">
              عرض <span className="font-bold font-numbers">{filteredTransactions.length}</span> عملية
            </p>
          </div>

          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={48} className="animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عمليات</h3>
              <p className="text-gray-600">لم يقم هذا العميل بأي عمليات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">رقم العملية</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">النوع</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">المبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الطريقة</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => {
                    const { date, time } = formatDateTime(transaction.createdAt);
                    const badge = getStatusBadge(transaction.status);
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getTypeIcon(transaction.type)}</span>
                            <span className="text-sm text-gray-900">
                              {transaction.type === 'payment' ? 'دفع' : 
                               transaction.type === 'refund' ? 'استرجاع' : 'تحويل'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold font-numbers ${
                            transaction.type === 'payment' ? 'text-success' : 'text-error'
                          }`}>
                            {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary">
                            {getMethodText(transaction.method)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{date}</p>
                            <p className="text-gray-600 font-numbers">{time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Eye size={16} />}
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            عرض
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          customer={customer}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </MainLayout>
  );
}

function TransactionDetailsModal({ transaction, customer, onClose }: { transaction: CustomerTransaction; customer: Customer; onClose: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: CustomerTransaction['status']) => {
    const badges: Record<string, { text: string; class: string }> = {
      completed: { text: 'مكتملة', class: 'bg-success/10 text-success' },
      pending: { text: 'معلقة', class: 'bg-warning/10 text-warning' },
      failed: { text: 'فاشلة', class: 'bg-error/10 text-error' }
    };
    return badges[status] || badges['pending'];
  };

  const badge = getStatusBadge(transaction.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl animate-slideUp">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">تفاصيل العملية</h3>
            <p className="font-mono text-gray-600">{transaction.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${badge.class}`}>
              {badge.text}
            </span>
            <span className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
              {transaction.type === 'payment' ? 'دفع' : 
               transaction.type === 'refund' ? 'استرجاع' : 'تحويل'}
            </span>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">المبلغ</p>
            <p className={`text-4xl font-bold font-numbers ${
              transaction.type === 'payment' ? 'text-success' : 'text-error'
            }`}>
              {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">اسم العميل</p>
              <p className="font-medium text-gray-900">{customer.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">رقم الجوال</p>
              <p className="font-medium text-gray-900 font-numbers">{customer.phone}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">طريقة الدفع</p>
              <p className="font-medium text-gray-900">
                {transaction.method === 'nfc' ? 'NFC - تقريب الجوال' :
                 transaction.method === 'qr' ? 'QR - مسح الرمز' :
                 'رقم الجوال'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">التاريخ والوقت</p>
              <p className="font-medium text-gray-900 text-sm">{formatDateTime(transaction.createdAt)}</p>
            </div>
            {transaction.employeeName && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">الموظف المنفذ</p>
                <p className="font-medium text-gray-900">{transaction.employeeName}</p>
              </div>
            )}
            {transaction.branchName && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">الفرع</p>
                <p className="font-medium text-gray-900">{transaction.branchName}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" fullWidth leftIcon={<Download size={20} />}>
              طباعة إيصال
            </Button>
            <Button variant="outline" fullWidth onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
