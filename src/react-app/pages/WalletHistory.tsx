import { useState, useEffect } from 'react';
import { Search, Filter, Download, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import { walletService, WalletTransaction } from '../services';

type TransactionType = 'all' | 'credit' | 'debit';

export default function WalletHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
    };
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await walletService.getTransactions('default', {
          type: typeFilter === 'all' ? undefined : typeFilter,
          limit: 50
        });
        setTransactions(response.data || []);
        setTotalTransactions(response.total || 0);
      } catch (error) {
        console.error('Failed to fetch wallet transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [typeFilter]);

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery) return true;
    return transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleExport = () => {
    console.log('Export wallet transactions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">سجل المحفظة</h1>
        <p className="text-gray-600">عرض وإدارة جميع حركات المحفظة</p>
      </div>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ابحث في الحركات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              leftIcon={<Filter size={20} />}
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary/5 border-primary' : ''}
            >
              فلاتر
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              leftIcon={<Download size={20} />}
              onClick={handleExport}
            >
              تصدير
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الحركة</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TransactionType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
                >
                  <option value="all">الكل</option>
                  <option value="credit">وارد</option>
                  <option value="debit">صادر</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            عرض {filteredTransactions.length} من أصل {totalTransactions} حركة
          </p>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعرف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد بعد</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => {
                      const { date, time } = formatDateTime(transaction.createdAt);

                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                transaction.type === 'credit' ? 'bg-success/10' : 'bg-error/10'
                              }`}>
                                {transaction.type === 'credit' ? (
                                  <TrendingUp size={16} className="text-success" />
                                ) : (
                                  <TrendingDown size={16} className="text-error" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-900 font-numbers">{transaction.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            {transaction.reference && (
                              <p className="text-sm text-gray-600 font-numbers">{transaction.reference}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">{date}</p>
                            <p className="text-sm text-gray-600 font-numbers">{time}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className={`font-bold font-numbers ${
                              transaction.type === 'credit' ? 'text-success' : 'text-error'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-numbers text-gray-900">
                              {formatCurrency(transaction.balanceAfter ?? 0)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedTransaction(transaction)}
                              className="text-sm text-primary hover:text-primary-600 font-medium"
                            >
                              التفاصيل
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">لا توجد حركات مطابقة</p>
                  <p className="text-sm text-gray-500">جرب تغيير الفلاتر أو البحث</p>
                </div>
              )}
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

function TransactionDetailsModal({ transaction, onClose }: { transaction: WalletTransaction; onClose: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">تفاصيل الحركة</h3>
            <p className="text-sm text-gray-600 font-numbers">{transaction.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Amount Card */}
        <div className={`rounded-lg p-6 mb-6 ${
          transaction.type === 'credit'
            ? 'bg-gradient-to-br from-success/10 to-success/5 border border-success/20'
            : 'bg-gradient-to-br from-error/10 to-error/5 border border-error/20'
        }`}>
          <p className="text-sm text-gray-700 mb-2">
            {transaction.type === 'credit' ? 'مبلغ وارد' : 'مبلغ صادر'}
          </p>
          <p className={`text-4xl font-bold font-numbers ${
            transaction.type === 'credit' ? 'text-success' : 'text-error'
          }`}>
            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">التاريخ والوقت</p>
              <p className="font-medium text-gray-900">{formatDateTime(transaction.createdAt)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">الرصيد بعد</p>
              <p className="font-medium text-gray-900 font-numbers">
                {formatCurrency(transaction.balanceAfter ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">الوصف</p>
            <p className="font-medium text-gray-900">{transaction.description}</p>
          </div>

          {transaction.reference && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">المرجع</p>
              <p className="font-medium text-gray-900 font-numbers">{transaction.reference}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <Button variant="outline" fullWidth onClick={onClose}>
          إغلاق
        </Button>
      </div>
    </div>
  );
}
