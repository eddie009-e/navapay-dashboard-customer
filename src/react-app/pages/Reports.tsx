import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { BarChart3, Calendar, TrendingUp, Users, Building2, DollarSign, FileText, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { SkeletonDashboard } from '@/react-app/components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, reportsService, SalesDataPoint } from '../services';

interface PaymentMethodData {
  method: string;
  count: number;
}

export default function Reports() {
  const { isEnterprise } = useAuth();
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

  useEffect(() => {
    const fetchReportsData = async () => {
      setIsLoading(true);
      try {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);

        const [salesDataResult, salesReport] = await Promise.all([
          dashboardService.getSalesData('7d'),
          reportsService.getSalesReport(from.toISOString().split('T')[0], to.toISOString().split('T')[0])
        ]);

        setSalesData(salesDataResult);

        setStats({
          totalSales: salesReport.totalSales,
          netProfit: Math.round(salesReport.totalSales * 0.8),
          totalTransactions: salesReport.transactionsCount,
          averageTransaction: salesReport.averageTransaction
        });

        if (salesReport.salesByMethod) {
          const methodsData: PaymentMethodData[] = Object.entries(salesReport.salesByMethod).map(([method, amount]) => ({
            method: method === 'nfc' ? 'NFC' : method === 'qr' ? 'QR Code' : 'رقم الجوال',
            count: Math.round(amount / salesReport.averageTransaction)
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

  const { totalSales, netProfit, totalTransactions, averageTransaction } = stats;

  const COLORS = ['#1E3A5F', '#52B788', '#F5A623'];

  const reportLinks = [
    {
      title: 'تقرير المبيعات',
      description: 'تحليل تفصيلي للمبيعات والأرباح',
      icon: TrendingUp,
      path: '/reports/sales',
      color: 'from-primary to-primary-400',
      locked: false
    },
    {
      title: 'التقرير اليومي',
      description: 'ملخص عمليات اليوم',
      icon: Calendar,
      path: '/reports/daily',
      color: 'from-accent-700 to-accent',
      locked: false
    },
    {
      title: 'التقرير الشهري',
      description: 'تقرير شامل للشهر الحالي',
      icon: BarChart3,
      path: '/reports/monthly',
      color: 'from-purple-600 to-purple-400',
      locked: false
    },
    {
      title: 'التقرير السنوي',
      description: 'نظرة عامة على السنة',
      icon: FileText,
      path: '/reports/yearly',
      color: 'from-orange-600 to-orange-400',
      locked: false
    },
    {
      title: 'تقرير الموظفين',
      description: 'أداء الموظفين والمبيعات',
      icon: Users,
      path: '/reports/employees',
      color: 'from-primary to-primary-400',
      locked: !isEnterprise
    },
    {
      title: 'تقرير الفروع',
      description: 'مقارنة أداء الفروع',
      icon: Building2,
      path: '/reports/branches',
      color: 'from-accent-700 to-accent',
      locked: !isEnterprise
    },
    {
      title: 'التقرير المالي',
      description: 'الإيرادات والمصروفات الشاملة',
      icon: DollarSign,
      path: '/reports/financial',
      color: 'from-purple-600 to-purple-400',
      locked: !isEnterprise
    },
    {
      title: 'تقرير الضرائب',
      description: 'ملخص الضرائب والمستحقات',
      icon: Receipt,
      path: '/reports/tax',
      color: 'from-orange-600 to-orange-400',
      locked: !isEnterprise
    }
  ];

  const freeReports = reportLinks.filter(r => !r.locked);
  const enterpriseReports = reportLinks.filter(r => r.locked);

  return (
    <div className="bg-surface">
      {/* Header */}
      <div className="glass-card mx-4 md:mx-6 mt-4 md:mt-6 p-5 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">التقارير</h1>
        <p className="text-gray-500 text-sm">نظرة شاملة على أداء عملك</p>
      </div>

      <div className="p-4 md:p-6">
        {isLoading ? (
          <SkeletonDashboard />
        ) : (
        <>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-gradient-to-l from-primary to-primary-400 rounded-2xl p-4 md:p-5 text-white shadow-stat">
            <p className="text-white/70 text-xs md:text-sm mb-1">إجمالي المبيعات</p>
            <p className="text-xl md:text-2xl font-bold font-numbers">{formatCurrency(totalSales)}</p>
            <p className="text-white/50 text-xs mt-1">آخر 30 يوم</p>
          </div>

          <div className="bg-gradient-to-l from-accent-700 to-accent rounded-2xl p-4 md:p-5 text-white shadow-stat">
            <p className="text-white/70 text-xs md:text-sm mb-1">صافي الربح</p>
            <p className="text-xl md:text-2xl font-bold font-numbers">{formatCurrency(netProfit)}</p>
            <p className="text-white/50 text-xs mt-1">بعد المصروفات</p>
          </div>

          <div className="bg-gradient-to-l from-purple-600 to-purple-400 rounded-2xl p-4 md:p-5 text-white shadow-stat">
            <p className="text-white/70 text-xs md:text-sm mb-1">عدد العمليات</p>
            <p className="text-xl md:text-2xl font-bold font-numbers">{totalTransactions}</p>
            <p className="text-white/50 text-xs mt-1">آخر 30 يوم</p>
          </div>

          <div className="bg-gradient-to-l from-orange-600 to-orange-400 rounded-2xl p-4 md:p-5 text-white shadow-stat">
            <p className="text-white/70 text-xs md:text-sm mb-1">متوسط العملية</p>
            <p className="text-xl md:text-2xl font-bold font-numbers">{formatCurrency(averageTransaction)}</p>
            <p className="text-white/50 text-xs mt-1">لكل عملية</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="glass-card p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">المبيعات - آخر 7 أيام</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="reportsColorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                <XAxis dataKey="date" stroke="#A9BDD3" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#A9BDD3" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #EEF2F7',
                    borderRadius: '12px',
                    direction: 'rtl',
                    boxShadow: '0 8px 32px rgba(30,58,95,0.12)'
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#1E3A5F" strokeWidth={2.5} fill="url(#reportsColorAmount)" dot={{ fill: '#1E3A5F', r: 4, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع طرق الدفع</h3>
            <ResponsiveContainer width="100%" height={280}>
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
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #EEF2F7',
                    borderRadius: '12px',
                    direction: 'rtl'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {paymentMethods.map((method, index) => (
                <div key={method.method} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm text-gray-600">{method.method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Links Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">التقارير التفصيلية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {freeReports.map((report) => {
              const Icon = report.icon;
              return (
                <Link
                  key={report.path}
                  to={report.path}
                  className="glass-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Enterprise Reports */}
        {enterpriseReports.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">تقارير متقدمة</h2>
              {!isEnterprise && (
                <span className="text-sm text-primary font-medium bg-primary-50 px-3 py-1 rounded-lg">
                  Enterprise فقط
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {enterpriseReports.map((report) => {
                const Icon = report.icon;

                if (!isEnterprise) {
                  return (
                    <div
                      key={report.path}
                      className="glass-card p-5 opacity-50 cursor-not-allowed"
                    >
                      <div className={`w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-4`}>
                        <Icon size={22} className="text-gray-400" />
                      </div>
                      <h3 className="font-bold text-gray-700 mb-1">{report.title}</h3>
                      <p className="text-sm text-gray-400">{report.description}</p>
                    </div>
                  );
                }

                return (
                  <Link
                    key={report.path}
                    to={report.path}
                    className="glass-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
