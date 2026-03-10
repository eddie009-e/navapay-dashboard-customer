import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Calendar, TrendingUp, TrendingDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Button from '@/react-app/components/Button';
import { SkeletonDashboard } from '@/react-app/components/LoadingSpinner';
import { reportsService, MonthlyReport as MonthlyReportData } from '../services';

export default function MonthlyReport() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const month = selectedMonth.getMonth() + 1;
        const year = selectedMonth.getFullYear();
        const data = await reportsService.getMonthlyReport(month, year);
        setReportData(data);
      } catch (error) {
        console.error('Failed to fetch monthly report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [selectedMonth]);

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const isCurrentMonth = selectedMonth.getMonth() === new Date().getMonth() &&
                         selectedMonth.getFullYear() === new Date().getFullYear();

  const monthName = selectedMonth.toLocaleDateString('ar-SY', { month: 'long', year: 'numeric' });

  // Prepare data from API response
  const monthlyStats = {
    totalSales: reportData?.totalSales || 0,
    totalTransactions: reportData?.totalTransactions || 0,
    averageTransaction: reportData?.totalTransactions ? (reportData?.totalSales || 0) / reportData.totalTransactions : 0,
    averageDaily: reportData?.averageDaily || 0
  };

  // Daily data for the month
  const dailyData = reportData?.dailyBreakdown?.map(item => ({
    day: new Date(item.date).getDate(),
    sales: item.amount,
    transactions: item.count
  })) || [];

  // Weekly data - derived from daily breakdown
  const weeklyData: Array<{ week: string; sales: number; transactions: number }> = (() => {
    if (!reportData?.dailyBreakdown) return [];
    const weeks: Array<{ week: string; sales: number; transactions: number }> = [];
    for (let i = 0; i < reportData.dailyBreakdown.length; i += 7) {
      const chunk = reportData.dailyBreakdown.slice(i, i + 7);
      weeks.push({
        week: `الأسبوع ${weeks.length + 1}`,
        sales: chunk.reduce((sum, d) => sum + d.amount, 0),
        transactions: chunk.reduce((sum, d) => sum + d.count, 0),
      });
    }
    return weeks;
  })();

  // Category breakdown - not provided by the monthly report API yet, default to empty
  const categoryBreakdown: Array<{ category: string; sales: number; percentage: number }> = [];

  // Comparison data - not provided by the monthly report API yet, default to empty
  const comparisonData: Array<{ metric: string; current: number; previous: number }> = [];

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">التقرير الشهري</h1>
                <p className="text-gray-500">{monthName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <button
                onClick={() => setSelectedMonth(new Date())}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  isCurrentMonth ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                هذا الشهر
              </button>
              <button
                onClick={goToNextMonth}
                disabled={isCurrentMonth}
                className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={24} />
              </button>
              <Button
                leftIcon={<Download size={20} />}
                variant="outline"
                onClick={async () => {
                  try {
                    const year = selectedMonth.getFullYear();
                    const month = selectedMonth.getMonth();
                    const from = new Date(year, month, 1).toISOString().split('T')[0];
                    const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
                    const result = await reportsService.exportTransactions({ from, to, format: 'csv' });
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
            <p className="text-white/80 text-sm mb-2">إجمالي المبيعات</p>
            <p className="text-3xl font-bold font-numbers mb-2">{formatCurrency(monthlyStats.totalSales)}</p>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">متوسط المبيعات اليومية</p>
            <p className="text-3xl font-bold font-numbers mb-2">{formatCurrency(monthlyStats.averageDaily)}</p>
          </div>

          <div className="bg-gradient-to-br from-accent to-accent/80 rounded-xl p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">عدد العمليات</p>
            <p className="text-3xl font-bold font-numbers mb-2">{monthlyStats.totalTransactions}</p>
            <p className="text-white/80 text-sm">
              متوسط {formatCurrency(monthlyStats.averageTransaction)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-xl p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">أفضل يوم</p>
            <p className="text-2xl font-bold font-numbers mb-1">
              {formatCurrency(reportData?.bestDay?.amount || 0)}
            </p>
            <p className="text-xs text-white/80">
              {reportData?.bestDay?.date ? new Date(reportData.bestDay.date).toLocaleDateString('ar-SY') : '-'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Sales Trend */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">المبيعات اليومية</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" style={{ fontSize: '12px' }} />
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
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#1E3A5F"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Comparison */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">مقارنة الأسابيع</h2>
            <div className="space-y-4">
              {weeklyData.map((week) => {
                const percentage = (week.sales / monthlyStats.totalSales) * 100;
                return (
                  <div key={week.week}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{week.week}</span>
                      <span className="text-sm font-bold text-gray-900 font-numbers">
                        {formatCurrency(week.sales)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{week.transactions} عمليات</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">المبيعات حسب الفئة</h2>
            <div className="space-y-4">
              {categoryBreakdown.map((category, index) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 font-numbers">
                        {formatCurrency(category.sales)}
                      </p>
                      <p className="text-xs text-gray-500">{category.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        index === 0 ? 'bg-primary' :
                        index === 1 ? 'bg-success' :
                        index === 2 ? 'bg-accent' : 'bg-secondary'
                      }`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison with Last Month */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">مقارنة مع الشهر الماضي</h2>
            <div className="space-y-6">
              {comparisonData.map((item) => {
                const change = item.current - item.previous;
                const changePercentage = ((change / item.previous) * 100).toFixed(1);
                const isPositive = change > 0;

                return (
                  <div key={item.metric} className="p-4 bg-surface rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">{item.metric}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 font-numbers mb-1">
                          {typeof item.current === 'number' && item.current > 1000
                            ? formatCurrency(item.current)
                            : item.current}
                        </p>
                        <p className="text-sm text-gray-500 font-numbers">
                          الشهر الماضي: {typeof item.previous === 'number' && item.previous > 1000
                            ? formatCurrency(item.previous)
                            : item.previous}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${
                        isPositive ? 'bg-accent-50 text-accent-700' : 'bg-error/10 text-error'
                      }`}>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="font-bold text-sm">{isPositive ? '+' : ''}{changePercentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
