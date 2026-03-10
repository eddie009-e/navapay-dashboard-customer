import { useState, useEffect } from 'react';
import { Search, Download, Eye, X, RotateCcw, Receipt, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import EmptyState from '@/react-app/components/EmptyState';
import { useToast } from '@/react-app/contexts/ToastContext';
import { transactionsService, Transaction, TransactionStats } from '../services';

type TransactionType = 'all' | 'payment' | 'refund' | 'transfer';
type TransactionStatus = 'all' | 'completed' | 'pending' | 'failed';
type PaymentMethod = 'all' | 'nfc' | 'qr' | 'phone';

export default function Transactions() {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>('all');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod>('all');
  const [periodFilter, setPeriodFilter] = useState('today');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('ar-SY', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Calculate date range based on period
  const getDateRange = () => {
    const to = new Date();
    const from = new Date();

    switch (periodFilter) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case 'week':
        from.setDate(from.getDate() - 7);
        break;
      case 'month':
        from.setMonth(from.getMonth() - 1);
        break;
      default:
        from.setHours(0, 0, 0, 0);
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  };

  // Load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const { from, to } = getDateRange();
        const filters: any = { from, to, page, limit: 20 };

        if (typeFilter !== 'all') filters.type = typeFilter;
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (methodFilter !== 'all') filters.method = methodFilter;
        if (searchQuery) filters.search = searchQuery;

        const [transactionsResponse, statsResponse] = await Promise.all([
          transactionsService.list(filters),
          transactionsService.getStats({ from, to })
        ]);

        setTransactions(transactionsResponse.data ?? []);
        setTotal(transactionsResponse.total);
        setTotalPages(transactionsResponse.totalPages);
        setStats(statsResponse);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [typeFilter, statusFilter, methodFilter, periodFilter, searchQuery, page]);

  // Summary values from stats
  const totalAmount = stats?.totalAmount || 0;
  const totalTransactions = stats?.totalTransactions || 0;
  const averageTransaction = stats?.averageTransaction || 0;
  const highestTransaction = stats?.highestTransaction || 0;

  // Use transactions from API
  const filteredTransactions = transactions;

  const getStatusBadge = (status: Transaction['status']) => {
    const badges = {
      completed: { text: 'مكتملة', class: 'bg-success/10 text-success' },
      pending: { text: 'معلقة', class: 'bg-warning/10 text-warning' },
      failed: { text: 'فاشلة', class: 'bg-error/10 text-error' }
    };
    return badges[status];
  };

  const getTypeIcon = (type: Transaction['type']) => {
    if (type === 'payment') return '💰';
    if (type === 'refund') return '↩️';
    return '💸';
  };

  const getMethodText = (method: Transaction['method']) => {
    const methods = {
      nfc: 'NFC',
      qr: 'QR',
      phone: 'رقم الجوال'
    };
    return methods[method];
  };

  const handleExport = async () => {
    setIsExporting(true);
    showToast('info', 'جاري تصدير البيانات...');
    try {
      const { from, to } = getDateRange();
      const filters: any = { from, to, format: 'csv' };

      if (typeFilter !== 'all') filters.type = typeFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const blob = await transactionsService.export(filters);

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${from}-${to}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('success', 'تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('Failed to export:', error);
      showToast('error', 'فشل تصدير البيانات');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">العمليات</h1>
          <Button
            leftIcon={isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'جاري التصدير...' : 'تصدير'}
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث برقم العملية أو العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">كل الأنواع</option>
            <option value="payment">دفع</option>
            <option value="refund">استرجاع</option>
            <option value="transfer">تحويل</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TransactionStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">كل الحالات</option>
            <option value="completed">مكتملة</option>
            <option value="pending">معلقة</option>
            <option value="failed">فاشلة</option>
          </select>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
          >
            <option value="today">اليوم</option>
            <option value="yesterday">أمس</option>
            <option value="week">آخر 7 أيام</option>
            <option value="month">هذا الشهر</option>
            <option value="custom">تاريخ مخصص</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as PaymentMethod)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">كل الطرق</option>
            <option value="nfc">NFC</option>
            <option value="qr">QR</option>
            <option value="phone">رقم الجوال</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6 animate-slideUp">
          <div className="bg-white rounded-lg p-3 md:p-6 shadow-sm border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-1">إجمالي الفترة</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900 font-numbers">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-6 shadow-sm border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-1">عدد العمليات</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900 font-numbers">{totalTransactions}</p>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-6 shadow-sm border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-1">متوسط العملية</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900 font-numbers">{formatCurrency(averageTransaction)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-6 shadow-sm border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-1">أعلى عملية</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900 font-numbers">{formatCurrency(highestTransaction)}</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={48} className="animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || methodFilter !== 'all' ? (
              <EmptyState
                icon={Search}
                title="لا توجد نتائج"
                description="جرب تعديل الفلاتر أو البحث بكلمات مختلفة"
              />
            ) : (
              <EmptyState
                icon={Receipt}
                title="لا توجد عمليات"
                description="ستظهر هنا جميع عمليات الدفع والتحويل والاسترجاع"
              />
            )
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">رقم العملية</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">النوع</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">العميل</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">المبلغ</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الطريقة</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الحالة</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">التاريخ</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">إجراءات</th>
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
                            <div>
                              <p className="font-medium text-gray-900">{transaction.customerName}</p>
                              <p className="text-sm text-gray-600 font-numbers">{transaction.customerPhone}</p>
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

              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    عرض <span className="font-medium">{filteredTransactions.length}</span> من أصل <span className="font-medium">{total}</span> عملية
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      السابق
                    </button>
                    <span className="px-4 py-2 text-sm font-medium">
                      {page} / {totalPages || 1}
                    </span>
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}

function TransactionDetailsModal({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const { showToast } = useToast();
  const [isRefunding, setIsRefunding] = useState(false);

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

  const getStatusBadge = (status: Transaction['status']) => {
    const badges = {
      completed: { text: 'مكتملة', class: 'bg-success/10 text-success' },
      pending: { text: 'معلقة', class: 'bg-warning/10 text-warning' },
      failed: { text: 'فاشلة', class: 'bg-error/10 text-error' }
    };
    return badges[status];
  };

  const badge = getStatusBadge(transaction.status);

  const handlePrintReceipt = () => {
    showToast('info', 'جاري طباعة الإيصال...');
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/transactions/${transaction.id}`);
    showToast('success', 'تم نسخ رابط المشاركة');
  };

  const handleRefund = async () => {
    setIsRefunding(true);
    try {
      await transactionsService.requestRefund(transaction.id);
      showToast('success', 'تم إنشاء طلب استرجاع بنجاح');
      onClose();
    } catch (error) {
      console.error('Failed to request refund:', error);
      showToast('error', 'فشل إنشاء طلب الاسترجاع');
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 md:p-8 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">تفاصيل العملية</h3>
            <p className="font-mono text-gray-600">{transaction.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
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
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">المبلغ</p>
            <p className={`text-4xl font-bold font-numbers ${
              transaction.type === 'payment' ? 'text-success' : 'text-error'
            }`}>
              {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">اسم العميل</p>
              <p className="font-medium text-gray-900">{transaction.customerName}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">رقم الجوال</p>
              <p className="font-medium text-gray-900 font-numbers">{transaction.customerPhone}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">طريقة الدفع</p>
              <p className="font-medium text-gray-900">
                {transaction.method === 'nfc' ? 'NFC - تقريب الجوال' :
                 transaction.method === 'qr' ? 'QR - مسح الرمز' :
                 'رقم الجوال'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">التاريخ والوقت</p>
              <p className="font-medium text-gray-900 font-numbers">{formatDateTime(transaction.createdAt)}</p>
            </div>
            {transaction.employeeName && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">الموظف المنفذ</p>
                <p className="font-medium text-gray-900">{transaction.employeeName}</p>
              </div>
            )}
            {transaction.branchName && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">الفرع</p>
                <p className="font-medium text-gray-900">{transaction.branchName}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" fullWidth leftIcon={<Download size={20} />} onClick={handlePrintReceipt}>
              طباعة إيصال
            </Button>
            <Button variant="outline" fullWidth leftIcon={<Download size={20} />} onClick={handleShare}>
              مشاركة
            </Button>
            {transaction.type === 'payment' && transaction.status === 'completed' && (
              <Button
                variant="outline"
                fullWidth
                leftIcon={isRefunding ? <Loader2 size={20} className="animate-spin" /> : <RotateCcw size={20} />}
                className="text-error border-error hover:bg-error/10"
                onClick={handleRefund}
                disabled={isRefunding}
              >
                {isRefunding ? 'جاري الاسترجاع...' : 'استرجاع'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
