import { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '@/react-app/components/Button';
import { SkeletonDashboard } from '@/react-app/components/LoadingSpinner';
import { reportsService, SalesReport as SalesReportType } from '../services';

interface SalesDataPoint {
  date: string;
  fullDate: string;
  sales: number;
  transactions: number;
}

export default function SalesReport() {
  const [dateRange, setDateRange] = useState('30days');
  const [viewType, setViewType] = useState<'chart' | 'table'>('chart');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [reportData, setReportData] = useState<SalesReportType | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  // Calculate date range
  const getDateRange = () => {
    const to = new Date();
    const from = new Date();

    switch (dateRange) {
      case '7days':
        from.setDate(from.getDate() - 7);
        break;
      case '30days':
        from.setDate(from.getDate() - 30);
        break;
      case '90days':
        from.setDate(from.getDate() - 90);
        break;
      case 'year':
        from.setFullYear(from.getFullYear() - 1);
        break;
      default:
        from.setDate(from.getDate() - 30);
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  };

  // Load sales data
  useEffect(() => {
    const loadSalesData = async () => {
      setIsLoading(true);
      try {
        const { from, to } = getDateRange();
        const report = await reportsService.getSalesReport(from, to);
        setReportData(report);

        // Transform to chart data
        const chartData: SalesDataPoint[] = report.salesByDay?.map((day) => ({
          date: new Date(day.date).toLocaleDateString('ar-SY', { month: 'short', day: 'numeric' }),
          fullDate: new Date(day.date).toLocaleDateString('ar-SY'),
          sales: day.amount,
          transactions: day.count
        })) || [];

        setSalesData(chartData);
      } catch (error) {
        console.error('Failed to load sales data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSalesData();
  }, [dateRange]);

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { from, to } = getDateRange();
      const result = await reportsService.exportTransactions({ from, to, format: 'csv' });
      reportsService.downloadFile(result.data, result.filename || `sales-report-${from}-${to}.csv`, 'csv');
    } catch (error) {
      console.error('Failed to export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalSales = reportData?.totalSales || salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalTransactions = reportData?.transactionsCount || salesData.reduce((sum, day) => sum + day.transactions, 0);
  const averageDailySales = salesData.length > 0 ? totalSales / salesData.length : 0;
  const bestDay = salesData.length > 0 ? salesData.reduce((best, day) => day.sales > best.sales ? day : best, salesData[0]) : null;

  return (
    <div className="bg-surface">
      {/* Header */}
      <div className="glass-card mx-4 md:mx-6 mt-4 md:mt-6 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تقرير المبيعات</h1>
            <p className="text-gray-500 mt-1">تحليل تفصيلي للمبيعات والأرباح</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="7days">آخر 7 أيام</option>
              <option value="30days">آخر 30 يوم</option>
              <option value="90days">آخر 90 يوم</option>
              <option value="year">هذه السنة</option>
              <option value="custom">تاريخ مخصص</option>
            </select>
            <Button
              leftIcon={isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'جاري التصدير...' : 'تصدير'}
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('chart')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              viewType === 'chart' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            رسم بياني
          </button>
          <button
            onClick={() => setViewType('table')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              viewType === 'table' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            جدول
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <p className="text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
            <p className="text-3xl font-bold text-primary font-numbers">{formatCurrency(totalSales)}</p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-gray-500 mb-1">عدد العمليات</p>
            <p className="text-3xl font-bold text-gray-900 font-numbers">{totalTransactions}</p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-gray-500 mb-1">متوسط المبيعات اليومية</p>
            <p className="text-3xl font-bold text-gray-900 font-numbers">{formatCurrency(averageDailySales)}</p>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-gray-500 mb-1">أفضل يوم</p>
            <p className="text-xl font-bold text-accent-700 font-numbers mb-1">{bestDay ? formatCurrency(bestDay.sales) : '-'}</p>
            <p className="text-sm text-gray-500">{bestDay?.fullDate || '-'}</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <SkeletonDashboard />
        ) : salesData.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-xl font-bold text-gray-900 mb-2">لا توجد بيانات</p>
            <p className="text-gray-500">لا توجد مبيعات في الفترة المحددة</p>
          </div>
        ) : viewType === 'chart' ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Line Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">المبيعات اليومية</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#1E3A5F" strokeWidth={2} dot={{ fill: '#1E3A5F', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">عدد العمليات اليومية</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }}
                  />
                  <Bar dataKey="transactions" fill="#2E7D32" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المبيعات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">العمليات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">متوسط العملية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesData.reverse().map((day, index) => (
                    <tr key={index} className="hover:bg-primary-50/20">
                      <td className="px-6 py-4 text-sm text-gray-900">{day.fullDate}</td>
                      <td className="px-6 py-4 text-sm font-bold text-primary font-numbers">
                        {formatCurrency(day.sales)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-numbers">{day.transactions}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-numbers">
                        {formatCurrency(day.sales / day.transactions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-surface border-t-2 border-gray-300">
                  <tr>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">الإجمالي</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary font-numbers">
                      {formatCurrency(totalSales)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 font-numbers">
                      {totalTransactions}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 font-numbers">
                      {formatCurrency(totalSales / totalTransactions)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
