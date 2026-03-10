import { useState, useEffect } from 'react';
import { Download, Search, Loader2 } from 'lucide-react';
import BackButton from '@/react-app/components/BackButton';
import { transactionsService, reportsService, Transaction } from '../services';

export default function POSHistory() {
  const [filter, setFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getDateRange = () => {
    const today = new Date(); void today;
    const from = new Date();
    const to = new Date();

    switch (filter) {
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
        from.setHours(0, 0, 0, 0);
        break;
      case 'month':
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        break;
      default:
        from.setHours(0, 0, 0, 0);
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const { from, to } = getDateRange();
        const response = await transactionsService.list({
          from,
          to,
          search: searchQuery || undefined,
          limit: 100
        });
        setTransactions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filter, searchQuery]);

  // Calculate totals
  const totalAmount = transactions.reduce((sum, t) => {
    return sum + (t.type === 'payment' ? t.amount : -t.amount);
  }, 0);

  const totalPayments = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunds = transactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionCount = transactions.length;

  const handleExport = async () => {
    try {
      const { from, to } = getDateRange();
      const result = await reportsService.exportTransactions({ from, to, format: 'csv' });
      reportsService.downloadFile(result.data, result.filename, 'csv');
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton to="/pos" label="نقطة البيع" />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">سجل العمليات</h1>
            <div className="w-20"></div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="بحث برقم العملية أو اسم العميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
            >
              <option value="today">اليوم</option>
              <option value="yesterday">أمس</option>
              <option value="week">آخر 7 أيام</option>
              <option value="month">هذا الشهر</option>
              <option value="custom">تاريخ مخصص</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Download size={20} />
              <span>تصدير</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">الإجمالي (صافي)</p>
            <p className="text-2xl font-bold text-gray-900 font-numbers">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">المدفوعات</p>
            <p className="text-2xl font-bold text-success font-numbers">{formatCurrency(totalPayments)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">الاسترجاعات</p>
            <p className="text-2xl font-bold text-error font-numbers">{formatCurrency(totalRefunds)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">عدد العمليات</p>
            <p className="text-2xl font-bold text-gray-900 font-numbers">{transactionCount}</p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">لا توجد عمليات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">رقم العملية</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">اسم العميل</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">طريقة الدفع</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">المبلغ</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => {
                    const { date, time } = formatDateTime(transaction.createdAt);
                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.customerName}</p>
                            <p className="text-sm text-gray-600 font-numbers">{transaction.customerPhone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary">
                            {transaction.method === 'nfc' ? 'NFC' :
                             transaction.method === 'qr' ? 'QR' : 'رقم الجوال'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-bold font-numbers ${
                            transaction.type === 'payment' ? 'text-success' : 'text-error'
                          }`}>
                            {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{date}</p>
                            <p className="text-gray-600 font-numbers">{time}</p>
                          </div>
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
    </div>
  );
}
