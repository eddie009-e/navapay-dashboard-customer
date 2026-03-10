import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import MainLayout from '@/react-app/components/MainLayout';
import { Building2, MapPin, Phone, User, Users, DollarSign, ShoppingBag, TrendingUp, Edit, ChevronLeft, Calendar, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { branchesService, employeesService, transactionsService, Branch, BranchStats, Employee, Transaction } from '../services';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BranchDetails() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branchStats, setBranchStats] = useState<BranchStats | null>(null);
  const [branchEmployees, setBranchEmployees] = useState<Employee[]>([]);
  const [branchTransactions, setBranchTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const [branchData, statsData, employeesData, transactionsData] = await Promise.all([
          branchesService.getById(id),
          branchesService.getStats(id),
          employeesService.list({ branchId: id }),
          transactionsService.list({ branchId: id, limit: 50 })
        ]);

        setBranch(branchData);
        setBranchStats(statsData);
        setBranchEmployees(employeesData.data || []);
        setBranchTransactions(transactionsData.data || []);
      } catch (error) {
        console.error('Failed to fetch branch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </MainLayout>
    );
  }

  if (!branch) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الفرع غير موجود</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على هذا الفرع</p>
          <Link to="/branches">
            <Button>العودة للفروع</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

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

  // Calculate stats
  const totalTransactions = branchTransactions.length;
  const totalSales = branchTransactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = branchTransactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Calculate employee sales from transactions
  const getEmployeeSales = (employeeId: string) => {
    return branchTransactions
      .filter(t => t.employeeId === employeeId && t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getEmployeeTransactionsCount = (employeeId: string) => {
    return branchTransactions.filter(t => t.employeeId === employeeId).length;
  };

  // Top performing employee
  const employeesWithSales = branchEmployees.map(emp => ({
    ...emp,
    totalSales: getEmployeeSales(emp.id),
    transactionsCount: getEmployeeTransactionsCount(emp.id)
  }));

  const topEmployee = employeesWithSales.reduce(
    (top, emp) => (emp.totalSales || 0) > (top?.totalSales || 0) ? emp : top,
    employeesWithSales[0] || null
  );

  // Sales chart data (mock weekly data)
  const salesChartData = [
    { day: 'السبت', amount: 1200000 },
    { day: 'الأحد', amount: 980000 },
    { day: 'الاثنين', amount: 1350000 },
    { day: 'الثلاثاء', amount: 1100000 },
    { day: 'الأربعاء', amount: 1450000 },
    { day: 'الخميس', amount: 1280000 },
    { day: 'الجمعة', amount: 1140000 },
  ];

  return (
    <MainLayout>
      <BackButton to="/branches" label="الفروع" />
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="mb-6">

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                  branch.isMain ? 'bg-gradient-to-br from-primary to-primary-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
                  <Building2 size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{branch.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span className="font-numbers">{branch.phone}</span>
                    </div>
                    {branch.managerName && (
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>المدير: {branch.managerName}</span>
                      </div>
                    )}
                  </div>
                  {branch.isMain && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      الفرع الرئيسي
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" leftIcon={<Edit size={20} />}>
                  تعديل البيانات
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} className="text-primary" />
                  <p className="text-sm text-gray-700">عدد الموظفين</p>
                </div>
                <p className="text-3xl font-bold text-primary font-numbers">{branchStats?.employeesCount || branch.employeesCount}</p>
              </div>

              <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-4 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-success" />
                  <p className="text-sm text-gray-700">المبيعات الشهرية</p>
                </div>
                <p className="text-2xl font-bold text-success font-numbers">
                  {formatCurrency(branchStats?.monthSales || 0)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-4 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={20} className="text-accent" />
                  <p className="text-sm text-gray-700">عدد العمليات</p>
                </div>
                <p className="text-3xl font-bold text-accent font-numbers">{branchStats?.monthTransactions || totalTransactions}</p>
              </div>

              <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg p-4 border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-secondary" />
                  <p className="text-sm text-gray-700">متوسط العملية</p>
                </div>
                <p className="text-xl font-bold text-secondary font-numbers">
                  {formatCurrency(averageTransaction)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">تقرير المبيعات</h2>
              <p className="text-sm text-gray-600">أداء الفرع خلال الفترة المحددة</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodFilter('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodFilter === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                أسبوع
              </button>
              <button
                onClick={() => setPeriodFilter('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodFilter === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                شهر
              </button>
              <button
                onClick={() => setPeriodFilter('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodFilter === 'year'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                سنة
              </button>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="amount" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-success font-numbers">
                {formatCurrency(totalSales)}
              </p>
            </div>
            <div className="text-center p-4 bg-error/5 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">إجمالي الاسترجاعات</p>
              <p className="text-2xl font-bold text-error font-numbers">
                {formatCurrency(totalRefunds)}
              </p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">صافي المبيعات</p>
              <p className="text-2xl font-bold text-primary font-numbers">
                {formatCurrency(totalSales - totalRefunds)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Performers */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">أفضل الموظفين</h2>
              <p className="text-sm text-gray-600">الموظفون الأكثر مبيعاً هذا الشهر</p>
            </div>
            <div className="p-6">
              {employeesWithSales.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">لا يوجد موظفين في هذا الفرع</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employeesWithSales
                    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
                    .slice(0, 5)
                    .map((emp, index) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                          index === 0 ? 'bg-primary text-white' :
                          index === 1 ? 'bg-accent text-white' :
                          index === 2 ? 'bg-secondary text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{emp.name}</p>
                          <p className="text-sm text-gray-600 font-numbers">
                            {emp.transactionsCount || 0} عملية
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-success font-numbers">
                            {formatCurrency(emp.totalSales || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">إحصائيات سريعة</h2>
              <p className="text-sm text-gray-600">ملخص أداء الفرع</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">عدد أيام العمل</p>
                    <p className="text-sm text-gray-600">هذا الشهر</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary font-numbers">20</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">متوسط المبيعات اليومية</p>
                    <p className="text-sm text-gray-600">هذا الشهر</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-success font-numbers">
                  {formatCurrency((branchStats?.monthSales || 0) / 20)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">النمو مقارنة بالشهر الماضي</p>
                    <p className="text-sm text-gray-600">معدل التحسن</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-accent font-numbers">+12%</p>
              </div>

              {topEmployee && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">موظف الشهر</p>
                      <p className="text-sm text-gray-600">{topEmployee.name}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-primary font-numbers">
                    {formatCurrency(topEmployee.totalSales || 0)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">قائمة الموظفين</h2>
              <p className="text-sm text-gray-600">
                <span className="font-bold font-numbers">{employeesWithSales.length}</span> موظف
              </p>
            </div>
            <Link to="/employees">
              <Button variant="outline" size="sm">
                عرض الكل
              </Button>
            </Link>
          </div>

          {employeesWithSales.length === 0 ? (
            <div className="text-center py-16">
              <Users size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد موظفين</h3>
              <p className="text-gray-600 mb-6">لم يتم تعيين موظفين لهذا الفرع بعد</p>
              <Link to="/employees">
                <Button>إضافة موظف</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {employeesWithSales.map((employee) => (
                <div key={employee.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {employee.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-600">
                        {employee.role === 'admin' ? 'مدير' :
                         employee.role === 'manager' ? 'مشرف' :
                         employee.role === 'cashier' ? 'كاشير' :
                         employee.role === 'accountant' ? 'محاسب' : employee.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="text-sm text-gray-600">العمليات</p>
                      <p className="font-bold text-gray-900 font-numbers">
                        {employee.transactionsCount || 0}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">المبيعات</p>
                      <p className="font-bold text-success font-numbers">
                        {formatCurrency(employee.totalSales || 0)}
                      </p>
                    </div>
                    <Link to={`/employees/${employee.id}`}>
                      <Button variant="outline" size="sm" leftIcon={<ChevronLeft size={16} />}>
                        التفاصيل
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">العمليات الأخيرة</h2>
            <p className="text-sm text-gray-600">
              آخر <span className="font-bold font-numbers">{Math.min(branchTransactions.length, 10)}</span> عملية
            </p>
          </div>

          {branchTransactions.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عمليات</h3>
              <p className="text-gray-600">لم يتم تسجيل أي عمليات في هذا الفرع بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">رقم العملية</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">العميل</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الموظف</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">النوع</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">المبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branchTransactions.slice(0, 10).map((transaction) => {
                    const { date, time } = formatDateTime(transaction.createdAt);
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.customerName}</p>
                            <p className="text-sm text-gray-600 font-numbers">{transaction.customerPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{transaction.employeeName || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'payment' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                          }`}>
                            {transaction.type === 'payment' ? 'دفع' : 'استرجاع'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold font-numbers ${
                            transaction.type === 'payment' ? 'text-success' : 'text-error'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
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
    </MainLayout>
  );
}
