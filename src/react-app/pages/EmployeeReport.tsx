import { useState, useEffect } from 'react';

import { Users, TrendingUp, DollarSign, Award, Lock, Crown } from 'lucide-react';
import Button from '@/react-app/components/Button';
import { SkeletonDashboard } from '@/react-app/components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { employeesService, transactionsService, Employee, Transaction } from '../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmployeePerformance {
  name: string;
  sales: number;
  transactions: number;
  avgTransaction: number;
}

export default function EmployeeReport() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const showUpgradeModal = user?.plan === 'pos';

  useEffect(() => {
    const fetchData = async () => {
      if (showUpgradeModal) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get last 30 days
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);

        const [employeesResponse, transactionsResponse] = await Promise.all([
          employeesService.list({ limit: 100 }),
          transactionsService.list({
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0],
            limit: 1000
          })
        ]);

        setEmployees(employeesResponse.data || []);
        setAllTransactions(transactionsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch employee report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showUpgradeModal]);

  // Calculate employee performance from transactions
  const employeePerformance: EmployeePerformance[] = employees
    .map(emp => {
      const empTransactions = allTransactions.filter(t => t.employeeId === emp.id && t.type === 'payment');
      const sales = empTransactions.reduce((sum, t) => sum + t.amount, 0);
      const transactionCount = empTransactions.length;
      return {
        name: emp.name,
        sales,
        transactions: transactionCount,
        avgTransaction: transactionCount > 0 ? Math.round(sales / transactionCount) : 0
      };
    })
    .filter(emp => emp.sales > 0)
    .sort((a, b) => b.sales - a.sales);

  const totalSales = employeePerformance.reduce((sum, emp) => sum + emp.sales, 0);
  const totalTransactions = employeePerformance.reduce((sum, emp) => sum + emp.transactions, 0);
  const topPerformer = employeePerformance[0];

  if (showUpgradeModal) {
    return (
      <>
        <div className="animate-fadeIn">
          <div className="glass-card p-12 text-center max-w-3xl mx-auto mt-12">
            <div className="w-20 h-20 bg-gradient-to-br from-warning to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock size={40} className="text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              تقارير الموظفين - ميزة Enterprise
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
              احصل على رؤية شاملة لأداء فريقك مع تقارير تفصيلية عن المبيعات والإنتاجية لكل موظف
            </p>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-8 mb-8 border-2 border-primary/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <Crown size={24} className="text-warning" />
                ماذا ستحصل مع Enterprise؟
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">تقارير أداء الموظفين</p>
                    <p className="text-sm text-gray-500">تتبع مبيعات وإنتاجية كل موظف</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">تقارير الفروع</p>
                    <p className="text-sm text-gray-500">مقارنة أداء فروعك المختلفة</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">إدارة متقدمة للموظفين</p>
                    <p className="text-sm text-gray-500">صلاحيات وأدوار مخصصة</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">نظام الرواتب</p>
                    <p className="text-sm text-gray-500">إدارة ودفع رواتب الفريق</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">تقارير مفصلة</p>
                    <p className="text-sm text-gray-500">رسوم بيانية وتحليلات متقدمة</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">إدارة عدة فروع</p>
                    <p className="text-sm text-gray-500">تحكم كامل في فروعك من مكان واحد</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                العودة
              </Button>
              <Button
                leftIcon={<Crown size={20} />}
                disabled
                className="opacity-50"
              >
                الترقية إلى Enterprise (قريباً)
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <SkeletonDashboard />
      </>
    );
  }

  return (
    <>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-lg">
              <Users size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تقارير الموظفين</h1>
              <p className="text-gray-500">تحليل أداء ومبيعات فريق العمل</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-primary" />
                <p className="text-sm text-gray-700">إجمالي الموظفين</p>
              </div>
              <p className="text-3xl font-bold text-primary font-numbers">
                {employees.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">موظف نشط</p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-accent-700" />
                <p className="text-sm text-gray-700">إجمالي المبيعات</p>
              </div>
              <p className="text-3xl font-bold text-accent-700 font-numbers">
                {(totalSales / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">ليرة سورية</p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-accent" />
                <p className="text-sm text-gray-700">إجمالي المعاملات</p>
              </div>
              <p className="text-3xl font-bold text-accent font-numbers">{totalTransactions}</p>
              <p className="text-xs text-gray-500 mt-1">عملية</p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Award size={20} className="text-warning" />
                <p className="text-sm text-gray-700">أفضل موظف</p>
              </div>
              <p className="text-lg font-bold text-warning">{topPerformer?.name}</p>
              <p className="text-xs text-gray-500 mt-1 font-numbers">
                {(topPerformer?.sales / 1000000).toFixed(1)}M ل.س
              </p>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">مبيعات الموظفين</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  direction: 'rtl'
                }}
                formatter={(value) => [`${Number(value || 0).toLocaleString()} ل.س`, 'المبيعات']}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">تفاصيل الأداء</h2>
            <p className="text-sm text-gray-500">مقاييس تفصيلية لكل موظف</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الترتيب</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الموظف</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">إجمالي المبيعات</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">عدد المعاملات</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">متوسط المعاملة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المساهمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employeePerformance.map((emp, index) => {
                  const contribution = ((emp.sales / totalSales) * 100).toFixed(1);

                  return (
                    <tr key={emp.name} className="hover:bg-primary-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Award size={20} className="text-warning" />
                          )}
                          <span className="font-bold text-gray-900 font-numbers">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{emp.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-accent-700 font-numbers">
                          {emp.sales.toLocaleString()} ل.س
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-numbers">{emp.transactions}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-numbers">
                          {emp.avgTransaction.toLocaleString()} ل.س
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${contribution}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-primary font-numbers min-w-[45px]">
                            {contribution}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
