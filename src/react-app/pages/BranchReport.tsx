import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Building2, DollarSign, Award, Lock, Crown, Users } from 'lucide-react';
import Button from '@/react-app/components/Button';
import { SkeletonDashboard } from '@/react-app/components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { branchesService, Branch, BranchStats } from '../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface BranchPerformance {
  name: string;
  sales: number;
  employees: number;
  salesPerEmployee: number;
  isMain: boolean;
}

export default function BranchReport() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStats, setBranchStats] = useState<Record<string, BranchStats>>({});
  const showUpgradeModal = user?.plan === 'pos';

  useEffect(() => {
    const fetchBranchData = async () => {
      if (showUpgradeModal) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const branchList = await branchesService.list();
        setBranches(branchList);

        // Fetch stats for each branch
        const statsPromises = branchList.map(async (branch) => {
          try {
            const stats = await branchesService.getStats(branch.id);
            return { branchId: branch.id, stats };
          } catch {
            return { branchId: branch.id, stats: null };
          }
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap: Record<string, BranchStats> = {};
        statsResults.forEach(({ branchId, stats }) => {
          if (stats) {
            statsMap[branchId] = stats;
          }
        });
        setBranchStats(statsMap);
      } catch (error) {
        console.error('Failed to fetch branch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchData();
  }, [showUpgradeModal]);

  // Generate branch performance data
  const branchPerformance: BranchPerformance[] = branches
    .map(branch => {
      const stats = branchStats[branch.id];
      const monthlySales = stats?.monthSales || 0;
      return {
        name: branch.name,
        sales: monthlySales,
        employees: branch.employeesCount,
        salesPerEmployee: branch.employeesCount > 0
          ? Math.round(monthlySales / branch.employeesCount)
          : 0,
        isMain: branch.isMain
      };
    })
    .sort((a, b) => b.sales - a.sales);

  const totalSales = branchPerformance.reduce((sum, branch) => sum + branch.sales, 0);
  const totalEmployees = branchPerformance.reduce((sum, branch) => sum + branch.employees, 0);
  const topBranch = branchPerformance[0];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (showUpgradeModal) {
    return (
      <MainLayout>
        <div className="animate-fadeIn">
          <div className="glass-card p-12 text-center max-w-3xl mx-auto mt-12">
            <div className="w-20 h-20 bg-gradient-to-br from-warning to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock size={40} className="text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              تقارير الفروع - ميزة Enterprise
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
              قارن أداء فروعك المختلفة وتتبع المبيعات والإنتاجية لكل موقع
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
                    <p className="font-bold text-gray-900">تقارير أداء الفروع</p>
                    <p className="text-sm text-gray-500">قارن مبيعات وأداء فروعك</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">إدارة عدة فروع</p>
                    <p className="text-sm text-gray-500">تحكم في جميع مواقعك من مكان واحد</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">تحليلات متقدمة</p>
                    <p className="text-sm text-gray-500">رسوم بيانية ومقاييس تفصيلية</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">تعيين المديرين</p>
                    <p className="text-sm text-gray-500">حدد مدير لكل فرع</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">تقارير الموظفين</p>
                    <p className="text-sm text-gray-500">أداء الموظفين في كل فرع</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-700 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">إدارة الرواتب</p>
                    <p className="text-sm text-gray-500">نظام متكامل لدفع رواتب الفريق</p>
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
                onClick={() => alert('سيتم توجيهك لصفحة الترقية')}
              >
                الترقية إلى Enterprise
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <SkeletonDashboard />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تقارير الفروع</h1>
              <p className="text-gray-500">تحليل أداء ومبيعات الفروع المختلفة</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={20} className="text-accent" />
                <p className="text-sm text-gray-700">إجمالي الفروع</p>
              </div>
              <p className="text-3xl font-bold text-accent font-numbers">
                {branches.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">فرع نشط</p>
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

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-primary" />
                <p className="text-sm text-gray-700">إجمالي الموظفين</p>
              </div>
              <p className="text-3xl font-bold text-primary font-numbers">{totalEmployees}</p>
              <p className="text-xs text-gray-500 mt-1">موظف</p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-4 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Award size={20} className="text-warning" />
                <p className="text-sm text-gray-700">أفضل فرع</p>
              </div>
              <p className="text-lg font-bold text-warning">{topBranch?.name}</p>
              <p className="text-xs text-gray-500 mt-1 font-numbers">
                {(topBranch?.sales / 1000000).toFixed(1)}M ل.س
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">مبيعات الفروع</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  angle={-20}
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

          {/* Pie Chart */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">توزيع المبيعات</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={branchPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {branchPerformance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                  formatter={(value) => [`${Number(value || 0).toLocaleString()} ل.س`, 'المبيعات']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">تفاصيل الأداء</h2>
            <p className="text-sm text-gray-500">مقاييس تفصيلية لكل فرع</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الترتيب</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الفرع</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المبيعات</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الموظفين</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المبيعات/موظف</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المساهمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {branchPerformance.map((branch, index) => {
                  const contribution = ((branch.sales / totalSales) * 100).toFixed(1);

                  return (
                    <tr key={branch.name} className="hover:bg-primary-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Award size={20} className="text-warning" />
                          )}
                          <span className="font-bold text-gray-900 font-numbers">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{branch.name}</span>
                          {branch.isMain && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              رئيسي
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-accent-700 font-numbers">
                          {branch.sales.toLocaleString()} ل.س
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-numbers">{branch.employees}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-numbers">
                          {branch.salesPerEmployee.toLocaleString()} ل.س
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${contribution}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold font-numbers min-w-[45px]" style={{ color: COLORS[index % COLORS.length] }}>
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
    </MainLayout>
  );
}
