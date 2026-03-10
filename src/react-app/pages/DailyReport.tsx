import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Calendar, TrendingUp, DollarSign, Receipt, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '@/react-app/components/Button';
import { SkeletonDashboard } from '@/react-app/components/LoadingSpinner';
import { reportsService, DailyReport as DailyReportData } from '../services';

export default function DailyReport() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const dateStr = formatDateForApi(selectedDate);
        const data = await reportsService.getDailyReport(dateStr);
        setReportData(data);
      } catch (error) {
        console.error('Failed to fetch daily report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [selectedDate]);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Prepare data from API response
  const dailyStats = {
    sales: reportData?.sales || 0,
    transactions: reportData?.transactions || 0,
    refunds: reportData?.refunds || 0,
    netRevenue: reportData?.netSales || 0,
    averageTransaction: reportData?.transactions ? (reportData?.sales || 0) / reportData.transactions : 0
  };

  const hourlyData = reportData?.hourlyBreakdown?.map(item => ({
    hour: `${item.hour}:00`,
    sales: item.amount,
    transactions: item.count
  })) || [];

  // Payment methods - not provided by the daily report API yet, default to empty
  const paymentMethods: Array<{ method: string; amount: number; count: number }> = [];

  // Top products - not provided by the daily report API yet, default to empty
  const topProducts: Array<{ name: string; quantity: number; sales: number }> = [];

  const COLORS = ['#1E3A5F', '#2E7D32', '#F5A623'];

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">التقرير اليومي</h1>
                <p className="text-gray-500">
                  {selectedDate.toLocaleDateString('ar-SY', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  isToday ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                اليوم
              </button>
              <button
                onClick={goToNextDay}
                disabled={isToday}
                className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={24} />
              </button>
              <Button
                leftIcon={<Download size={20} />}
                variant="outline"
                onClick={async () => {
                  try {
                    const dateStr = formatDateForApi(selectedDate);
                    const result = await reportsService.exportTransactions({
                      from: dateStr,
                      to: dateStr,
                      format: 'csv'
                    });
                    reportsService.downloadFile(result.data, result.filename, 'csv');
                  } catch (error) {
                    console.error('Failed to export:', error);
                  }
                }}
              >
                تصدير
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <SkeletonDashboard />
        ) : (
          <>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-400 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm">إجمالي المبيعات</p>
              <DollarSign size={24} className="text-white/80" />
            </div>
            <p className="text-3xl font-bold font-numbers mb-2">{formatCurrency(dailyStats.sales)}</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">صافي الإيرادات</p>
              <TrendingUp size={24} className="text-accent-700" />
            </div>
            <p className="text-3xl font-bold text-gray-900 font-numbers mb-2">
              {formatCurrency(dailyStats.netRevenue)}
            </p>
            <p className="text-sm text-gray-500">بعد الاسترجاعات</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">عدد العمليات</p>
              <Receipt size={24} className="text-accent" />
            </div>
            <p className="text-3xl font-bold text-gray-900 font-numbers mb-2">
              {dailyStats.transactions}
            </p>
            <p className="text-sm text-gray-500">
              متوسط {formatCurrency(dailyStats.averageTransaction)}
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">الاسترجاعات</p>
              <RefreshCw size={24} className="text-error" />
            </div>
            <p className="text-3xl font-bold text-error font-numbers mb-2">
              {formatCurrency(dailyStats.refunds)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hourly Sales Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">المبيعات حسب الساعة</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hour" stroke="#6B7280" style={{ fontSize: '12px' }} />
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
                <Bar dataKey="sales" fill="#1E3A5F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">طرق الدفع</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label
                >
                  {paymentMethods.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
              {paymentMethods.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-gray-700">{method.method}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 font-numbers">
                      {formatCurrency(method.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{method.count} عمليات</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products and Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">المنتجات الأكثر مبيعاً</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} وحدات</p>
                  </div>
                  <p className="font-bold text-gray-900 font-numbers">
                    {formatCurrency(product.sales)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">معلومات إضافية</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-error/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <RefreshCw size={20} className="text-error" />
                  <span className="font-medium text-gray-900">الاسترجاعات</span>
                </div>
                <p className="font-bold text-error font-numbers">
                  {formatCurrency(dailyStats.refunds)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <span className="font-medium text-gray-900">ساعات الذروة</span>
                <p className="font-bold text-gray-900">12:00 - 14:00</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <span className="font-medium text-gray-900">أول عملية</span>
                <p className="font-bold text-gray-900">08:15 صباحاً</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <span className="font-medium text-gray-900">آخر عملية</span>
                <p className="font-bold text-gray-900">21:45 مساءً</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
                <span className="font-medium text-gray-900">أكبر عملية</span>
                <p className="font-bold text-accent-700 font-numbers">
                  {formatCurrency(125000)}
                </p>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
