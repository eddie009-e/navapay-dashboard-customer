import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Calendar, TrendingUp, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Button from '@/react-app/components/Button';
import { reportsService, YearlyReport as YearlyReportData } from '../services';

export default function YearlyReport() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<YearlyReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const data = await reportsService.getYearlyReport(selectedYear);
        setReportData(data);
      } catch (error) {
        console.error('Failed to fetch yearly report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [selectedYear]);

  const goToPreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const goToNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const isCurrentYear = selectedYear === new Date().getFullYear();

  // Prepare data from API response
  const yearlyStats = {
    totalSales: reportData?.totalSales || 0,
    totalTransactions: reportData?.totalTransactions || 0,
    averageTransaction: reportData?.totalTransactions ? (reportData?.totalSales || 0) / reportData.totalTransactions : 0,
    averageMonthly: reportData?.averageMonthly || 0,
    growthRate: reportData?.growthRate || 0,
    bestMonth: reportData?.bestMonth?.month || '',
    bestMonthSales: reportData?.bestMonth?.amount || 0
  };

  // Monthly data for the year from API
  const monthlyData = reportData?.monthlyBreakdown?.map((item, index) => ({
    month: months[index] || item.month,
    sales: item.amount,
    transactions: item.count
  })) || [];

  // Top performing months
  const topMonths = [...monthlyData]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Quarterly data - derived from monthly breakdown
  const quarterlyData: Array<{ quarter: string; sales: number; transactions: number; growth: number }> = (() => {
    const quarters = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'];
    return quarters.map((quarter, qi) => {
      const qMonths = monthlyData.slice(qi * 3, qi * 3 + 3);
      const sales = qMonths.reduce((sum, m) => sum + m.sales, 0);
      const transactions = qMonths.reduce((sum, m) => sum + m.transactions, 0);
      return { quarter, sales, transactions, growth: 0 };
    });
  })();

  // Year comparison - not provided by the yearly report API yet, default to current year only
  const yearComparison: Array<{ year: number; sales: number }> = [
    { year: selectedYear, sales: yearlyStats.totalSales },
  ];

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">التقرير السنوي</h1>
                <p className="text-gray-600">عام {selectedYear}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousYear}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <button
                onClick={() => setSelectedYear(new Date().getFullYear())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isCurrentYear ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                هذه السنة
              </button>
              <button
                onClick={goToNextYear}
                disabled={isCurrentYear}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={24} />
              </button>
              <Button
                leftIcon={<Download size={20} />}
                variant="outline"
                onClick={async () => {
                  try {
                    const from = `${selectedYear}-01-01`;
                    const to = `${selectedYear}-12-31`;
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
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">إجمالي المبيعات</p>
            <p className="text-3xl font-bold font-numbers mb-2">{formatCurrency(yearlyStats.totalSales)}</p>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp size={16} />
              <span>+{yearlyStats.growthRate}% عن العام الماضي</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-success to-success/80 rounded-xl p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">متوسط المبيعات الشهرية</p>
            <p className="text-3xl font-bold font-numbers mb-2">{formatCurrency(yearlyStats.averageMonthly)}</p>
          </div>

          <div className="bg-gradient-to-br from-accent to-accent/80 rounded-xl p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">إجمالي العمليات</p>
            <p className="text-3xl font-bold font-numbers mb-2">{yearlyStats.totalTransactions}</p>
            <p className="text-white/80 text-sm">
              متوسط {formatCurrency(yearlyStats.averageTransaction)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-xl p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">أفضل شهر</p>
            <p className="text-2xl font-bold font-numbers mb-1">{formatCurrency(yearlyStats.bestMonthSales)}</p>
            <p className="text-xs text-white/80">{yearlyStats.bestMonth}</p>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Sales Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">المبيعات الشهرية</h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorYearlySales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '11px' }} />
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
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorYearlySales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quarterly Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">الأداء الفصلي</h2>
            <div className="space-y-4">
              {quarterlyData.map((quarter) => (
                <div key={quarter.quarter} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{quarter.quarter}</span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                      quarter.growth > 25 ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-700'
                    }`}>
                      <TrendingUp size={14} />
                      <span className="text-xs font-bold">+{quarter.growth}%</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 font-numbers mb-1">
                    {formatCurrency(quarter.sales)}
                  </p>
                  <p className="text-sm text-gray-600">{quarter.transactions} عملية</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Year-over-Year Comparison */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">المقارنة السنوية</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="year" stroke="#6B7280" style={{ fontSize: '12px' }} />
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

          {/* Top Performing Months */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">أفضل 5 أشهر</h2>
            <div className="space-y-4">
              {topMonths.map((month, index) => (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary text-lg">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{month.month}</p>
                    <p className="text-sm text-gray-600">{month.transactions} عمليات</p>
                  </div>
                  <p className="font-bold text-gray-900 font-numbers">
                    {formatCurrency(month.sales)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">مؤشرات الأداء</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">معدل النمو السنوي</p>
              <p className="text-3xl font-bold text-gray-900 font-numbers mb-2">
                {yearlyStats.growthRate}%
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp size={16} className="text-success" />
                <p className="text-sm text-gray-600">مقارنة بالسنة الماضية</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">متوسط العملية</p>
              <p className="text-3xl font-bold text-gray-900 font-numbers mb-2">
                {formatCurrency(yearlyStats.averageTransaction)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">إجمالي العمليات</p>
              <p className="text-3xl font-bold text-gray-900 font-numbers mb-2">
                {yearlyStats.totalTransactions}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">أفضل شهر</p>
              <p className="text-xl font-bold text-gray-900 mb-1">
                {yearlyStats.bestMonth}
              </p>
              <p className="text-sm text-success font-numbers">
                {formatCurrency(yearlyStats.bestMonthSales)}
              </p>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
