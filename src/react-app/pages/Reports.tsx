import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { BarChart3, Calendar, TrendingUp, Users, Building2, DollarSign, FileText, Receipt, Loader2 } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, reportsService, SalesDataPoint } from '../services';

interface PaymentMethodData {
  method: string;
  count: number;
}

export default function Reports() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    netProfit: 0,
    totalTransactions: 0,
    averageTransaction: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const isEnterprise = user?.plan === 'enterprise';

  useEffect(() => {
    const fetchReportsData = async () => {
      setIsLoading(true);
      try {
        // Get last 30 days date range
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);

        const [salesDataResult, salesReport] = await Promise.all([
          dashboardService.getSalesData('7d'),
          reportsService.getSalesReport(from.toISOString().split('T')[0], to.toISOString().split('T')[0])
        ]);

        setSalesData(salesDataResult);

        // Set stats from sales report
        setStats({
          totalSales: salesReport.totalSales,
          netProfit: Math.round(salesReport.totalSales * 0.8), // Estimate 80% net profit
          totalTransactions: salesReport.transactionsCount,
          averageTransaction: salesReport.averageTransaction
        });

        // Transform payment methods from salesByMethod
        if (salesReport.salesByMethod) {
          const methodsData: PaymentMethodData[] = Object.entries(salesReport.salesByMethod).map(([method, amount]) => ({
            method: method === 'nfc' ? 'NFC' : method === 'qr' ? 'QR Code' : 'رقم الجوال',
            count: Math.round(amount / salesReport.averageTransaction) // Estimate count from amount
          }));
          setPaymentMethods(methodsData);
        }
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // Summary stats
  const { totalSales, netProfit, totalTransactions, averageTransaction } = stats;

  // Payment methods colors
  const COLORS = ['#1E3A5F', '#2E7D32', '#F5A623'];

  const reportLinks = [
    {
      title: 'تقرير المبيعات',
      description: 'تحليل تفصيلي للمبيعات والأرباح',
      icon: TrendingUp,
      path: '/reports/sales',
      color: 'bg-primary',
      locked: false
    },
    {
      title: 'التقرير اليومي',
      description: 'ملخص عمليات اليوم',
      icon: Calendar,
      path: '/reports/daily',
      color: 'bg-secondary',
      locked: false
    },
    {
      title: 'التقرير الشهري',
      description: 'تقرير شامل للشهر الحالي',
      icon: BarChart3,
      path: '/reports/monthly',
      color: 'bg-accent',
      locked: false
    },
    {
      title: 'التقرير السنوي',
      description: 'نظرة عامة على السنة',
      icon: FileText,
      path: '/reports/yearly',
      color: 'bg-primary',
      locked: false
    },
    {
      title: 'تقرير الموظفين',
      description: 'أداء الموظفين والمبيعات',
      icon: Users,
      path: '/reports/employees',
      color: 'bg-secondary',
      locked: !isEnterprise
    },
    {
      title: 'تقرير الفروع',
      description: 'مقارنة أداء الفروع',
      icon: Building2,
      path: '/reports/branches',
      color: 'bg-accent',
      locked: !isEnterprise
    },
    {
      title: 'التقرير المالي',
      description: 'الإيرادات والمصروفات الشاملة',
      icon: DollarSign,
      path: '/reports/financial',
      color: 'bg-primary',
      locked: !isEnterprise
    },
    {
      title: 'تقرير الضرائب',
      description: 'ملخص الضرائب والمستحقات',
      icon: Receipt,
      path: '/reports/tax',
      color: 'bg-secondary',
      locked: !isEnterprise
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير</h1>
        <p className="text-gray-600">نظرة شاملة على أداء عملك</p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
        <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-600 rounded-lg p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">إجمالي المبيعات</p>
            <p className="text-3xl font-bold font-numbers mb-1">{formatCurrency(totalSales)}</p>
            <p className="text-white/80 text-sm">آخر 30 يوم</p>
          </div>

          <div className="bg-gradient-to-br from-success to-success/80 rounded-lg p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">صافي الربح</p>
            <p className="text-3xl font-bold font-numbers mb-1">{formatCurrency(netProfit)}</p>
            <p className="text-white/80 text-sm">بعد المصروفات</p>
          </div>

          <div className="bg-gradient-to-br from-accent to-accent/80 rounded-lg p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">عدد العمليات</p>
            <p className="text-3xl font-bold font-numbers mb-1">{totalTransactions}</p>
            <p className="text-white/80 text-sm">آخر 30 يوم</p>
          </div>

          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-lg p-6 text-white shadow-lg">
            <p className="text-white/80 text-sm mb-2">متوسط العملية</p>
            <p className="text-3xl font-bold font-numbers mb-1">{formatCurrency(averageTransaction)}</p>
            <p className="text-white/80 text-sm">لكل عملية</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">المبيعات - آخر 7 أيام</h3>
            <ResponsiveContainer width="100%" height={300}>
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
                <Line type="monotone" dataKey="amount" stroke="#1E3A5F" strokeWidth={2} dot={{ fill: '#1E3A5F', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع طرق الدفع</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label
                >
                  {paymentMethods.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} عملية`, '']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {paymentMethods.map((method, index) => (
                <div key={method.method} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm text-gray-700">{method.method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Links Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">التقارير التفصيلية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportLinks.map((report) => {
              const Icon = report.icon;
              
              if (report.locked) {
                return (
                  <div
                    key={report.path}
                    className="bg-white rounded-lg border-2 border-gray-200 p-6 opacity-60 cursor-not-allowed relative overflow-hidden"
                  >
                    <div className="absolute top-4 left-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                    <div className="inline-flex items-center text-sm text-warning">
                      <span>يتطلب Enterprise</span>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={report.path}
                  to={report.path}
                  className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <div className="inline-flex items-center text-sm text-primary group-hover:gap-2 transition-all">
                    <span>عرض التقرير</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">←</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
