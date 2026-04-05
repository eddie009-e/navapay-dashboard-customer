import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';

import { Building2, MapPin, Phone, User, Users, DollarSign, ShoppingBag, TrendingUp, Edit, ChevronLeft, Calendar, X } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { SkeletonTable } from '@/react-app/components/LoadingSpinner';
import { useToast } from '@/react-app/contexts/ToastContext';
import { branchesService, employeesService, transactionsService, Branch, BranchStats, Employee, Transaction } from '../services';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BranchDetails() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branchStats, setBranchStats] = useState<BranchStats | null>(null);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editName, setEditName] = useState('');
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
      <>
        <div className="py-6">
          <SkeletonTable rows={8} />
        </div>
      </>
    );
  }

  if (!branch) {
    return (
      <>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الفرع غير موجود</h2>
          <p className="text-gray-500 mb-6">لم يتم العثور على هذا الفرع</p>
          <Link to="/branches">
            <Button>العودة للفروع</Button>
          </Link>
        </div>
      </>
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

  // Sales chart data — computed from actual branch transactions
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const salesChartData = (() => {
    const last7Days: { day: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayTotal = branchTransactions
        .filter(t => t.createdAt?.startsWith(dayStr))
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      last7Days.push({ day: dayNames[d.getDay()], amount: dayTotal });
    }
    return last7Days;
  })();

  return (
    <>
      <BackButton to="/branches" label="الفروع" />
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="mb-6">

          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                  branch.isMain ? 'bg-gradient-to-br from-primary to-primary-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
                  <Building2 size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{branch.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-2">
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
                <Button variant="outline" leftIcon={<Edit size={20} />} onClick={() => {
                  setEditName(branch.name);
                  setIsEditNameOpen(true);
                }}>
                  تعديل البيانات
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} className="text-primary" />
                  <p className="text-sm text-gray-700">عدد الموظفين</p>
                </div>
                <p className="text-3xl font-bold text-primary font-numbers">{branchStats?.employeesCount || branch.employeesCount}</p>
              </div>

              <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-4 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-accent-700" />
                  <p className="text-sm text-gray-700">المبيعات الشهرية</p>
                </div>
                <p className="text-2xl font-bold text-accent-700 font-numbers">
                  {formatCurrency(branchStats?.monthSales || 0)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={20} className="text-accent" />
                  <p className="text-sm text-gray-700">عدد العمليات</p>
                </div>
                <p className="text-3xl font-bold text-accent font-numbers">{branchStats?.monthTransactions || totalTransactions}</p>
              </div>

              <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl p-4 border border-secondary/20">
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
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">تقرير المبيعات</h2>
              <p className="text-sm text-gray-500">أداء الفرع خلال الفترة المحددة</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodFilter('week')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  periodFilter === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                أسبوع
              </button>
              <button
                onClick={() => setPeriodFilter('month')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  periodFilter === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                شهر
              </button>
              <button
                onClick={() => setPeriodFilter('year')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
                    borderRadius: '0.75rem'
                  }}
                />
                <Bar dataKey="amount" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center p-4 bg-success/5 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-accent-700 font-numbers">
                {formatCurrency(totalSales)}
              </p>
            </div>
            <div className="text-center p-4 bg-error/5 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">إجمالي الاسترجاعات</p>
              <p className="text-2xl font-bold text-error font-numbers">
                {formatCurrency(totalRefunds)}
              </p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">صافي المبيعات</p>
              <p className="text-2xl font-bold text-primary font-numbers">
                {formatCurrency(totalSales - totalRefunds)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Performers */}
          <div className="glass-card">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">أفضل الموظفين</h2>
              <p className="text-sm text-gray-500">الموظفون الأكثر مبيعاً هذا الشهر</p>
            </div>
            <div className="p-6">
              {employeesWithSales.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">لا يوجد موظفين في هذا الفرع</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employeesWithSales
                    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
                    .slice(0, 5)
                    .map((emp, index) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-4 p-3 bg-surface rounded-xl hover:bg-primary-50/20 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                          index === 0 ? 'bg-primary text-white' :
                          index === 1 ? 'bg-accent text-white' :
                          index === 2 ? 'bg-secondary text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{emp.name}</p>
                          <p className="text-sm text-gray-500 font-numbers">
                            {emp.transactionsCount || 0} عملية
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-accent-700 font-numbers">
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
          <div className="glass-card">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">إحصائيات سريعة</h2>
              <p className="text-sm text-gray-500">ملخص أداء الفرع</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center">
                    <Calendar size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">عدد أيام العمل</p>
                    <p className="text-sm text-gray-500">هذا الشهر</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary font-numbers">20</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} className="text-accent-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">متوسط المبيعات اليومية</p>
                    <p className="text-sm text-gray-500">هذا الشهر</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-accent-700 font-numbers">
                  {formatCurrency((branchStats?.monthSales || 0) / 20)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">النمو مقارنة بالشهر الماضي</p>
                    <p className="text-sm text-gray-500">معدل التحسن</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-accent font-numbers">+12%</p>
              </div>

              {topEmployee && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">موظف الشهر</p>
                      <p className="text-sm text-gray-500">{topEmployee.name}</p>
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
        <div className="glass-card mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">قائمة الموظفين</h2>
              <p className="text-sm text-gray-500">
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
              <p className="text-gray-500 mb-6">لم يتم تعيين موظفين لهذا الفرع بعد</p>
              <Link to="/employees">
                <Button>إضافة موظف</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {employeesWithSales.map((employee) => (
                <div key={employee.id} className="p-6 flex items-center justify-between hover:bg-primary-50/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {employee.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">
                        {employee.role === 'admin' ? 'مدير' :
                         employee.role === 'manager' ? 'مشرف' :
                         employee.role === 'cashier' ? 'كاشير' :
                         employee.role === 'accountant' ? 'محاسب' : employee.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="text-sm text-gray-500">العمليات</p>
                      <p className="font-bold text-gray-900 font-numbers">
                        {employee.transactionsCount || 0}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">المبيعات</p>
                      <p className="font-bold text-accent-700 font-numbers">
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
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">العمليات الأخيرة</h2>
            <p className="text-sm text-gray-500">
              آخر <span className="font-bold font-numbers">{Math.min(branchTransactions.length, 10)}</span> عملية
            </p>
          </div>

          {branchTransactions.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عمليات</h3>
              <p className="text-gray-500">لم يتم تسجيل أي عمليات في هذا الفرع بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">رقم العملية</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الموظف</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">النوع</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المبلغ</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchTransactions.slice(0, 10).map((transaction) => {
                    const { date, time } = formatDateTime(transaction.createdAt);

                    return (
                      <tr key={transaction.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.customerName}</p>
                            <p className="text-sm text-gray-500 font-numbers">{transaction.customerPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{transaction.employeeName || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'payment' ? 'bg-accent-50 text-accent-700' : 'bg-error/10 text-error'
                          }`}>
                            {transaction.type === 'payment' ? 'دفع' : 'استرجاع'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold font-numbers ${
                            transaction.type === 'payment' ? 'text-accent-700' : 'text-error'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{date}</p>
                            <p className="text-gray-500 font-numbers">{time}</p>
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

      {/* Edit Name Modal */}
      {isEditNameOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card bg-white/95 backdrop-blur-xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">تعديل اسم الفرع</h3>
              <button onClick={() => setIsEditNameOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
              placeholder="اسم الفرع"
            />
            <div className="flex gap-3">
              <Button fullWidth onClick={async () => {
                if (editName && editName !== branch.name) {
                  try {
                    const updated = await branchesService.update(branch.id, { name: editName });
                    setBranch(updated);
                    showToast('success', 'تم تحديث اسم الفرع بنجاح');
                  } catch {
                    showToast('error', 'فشل في تحديث اسم الفرع');
                  }
                }
                setIsEditNameOpen(false);
              }} disabled={!editName.trim()}>
                حفظ
              </Button>
              <Button variant="outline" fullWidth onClick={() => setIsEditNameOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
