import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, TrendingUp, Receipt, FileWarning, CreditCard, FileText, Send, UserPlus } from 'lucide-react';
import MainLayout from '@/react-app/components/MainLayout';
import StatCard from '@/react-app/components/StatCard';
import Button from '@/react-app/components/Button';
import { SkeletonDashboard } from '@/react-app/components/LoadingSpinner';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { useToast } from '@/react-app/contexts/ToastContext';
import {
  dashboardService,
  walletService,
  invoicesService,
  TodayStats,
  SalesDataPoint
} from '@/react-app/services';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Fallback mock data for development
const mockTodayStats: TodayStats = {
  sales: 250000,
  salesChange: 12.5,
  transactionsCount: 42,
  transactionsChange: 5.2,
  averageTransaction: 5952,
  newCustomers: 8,
};

const mockSalesData: SalesDataPoint[] = [
  { date: 'السبت', amount: 45000 },
  { date: 'الأحد', amount: 52000 },
  { date: 'الاثنين', amount: 48000 },
  { date: 'الثلاثاء', amount: 61000 },
  { date: 'الأربعاء', amount: 55000 },
  { date: 'الخميس', amount: 72000 },
  { date: 'الجمعة', amount: 68000 },
];

interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  customerName: string;
  method: string;
  createdAt: string;
}

interface PendingInvoice {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  dueDate: string;
}

const quickActions = [
  { label: 'POS جديد', icon: CreditCard, path: '/pos', color: 'bg-primary-50 text-primary' },
  { label: 'فاتورة', icon: FileText, path: '/invoices/create', color: 'bg-accent-50 text-accent-700' },
  { label: 'تحويل', icon: Send, path: '/payroll/create', color: 'bg-purple-50 text-purple-600' },
  { label: 'عميل', icon: UserPlus, path: '/customers', color: 'bg-orange-50 text-orange-600' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [todayStats, setTodayStats] = useState<TodayStats>(mockTodayStats);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>(mockSalesData);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
  const [pendingInvoicesCount, setPendingInvoicesCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [walletData, stats, sales, invoicesData] = await Promise.allSettled([
          walletService.getWallet(),
          dashboardService.getTodayStats(),
          dashboardService.getSalesData('7d'),
          invoicesService.list({ status: 'pending', limit: 5 }),
        ]);

        if (walletData.status === 'fulfilled') {
          setWalletBalance(walletData.value.balance);
        }

        if (stats.status === 'fulfilled') {
          setTodayStats(stats.value);
        }

        if (sales.status === 'fulfilled') {
          setSalesData(sales.value);
        }

        if (invoicesData.status === 'fulfilled') {
          const mapped = (invoicesData.value.data || []).map((inv) => ({
            id: inv.id,
            customerName: inv.customerName,
            amount: inv.total,
            status: inv.status,
            dueDate: inv.dueDate,
          }));
          setPendingInvoices(mapped);
          setPendingInvoicesCount(invoicesData.value.total || 0);
        }

        try {
          const transactions = await dashboardService.getRecentTransactions(5);
          setRecentTransactions(transactions as RecentTransaction[]);
        } catch {
          setRecentTransactions([]);
        }
      } catch (error) {
        showToast('error', 'فشل في تحميل بيانات لوحة التحكم');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ar-SY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      await invoicesService.sendReminder(invoiceId);
      showToast('success', 'تم إرسال التذكير بنجاح');
    } catch {
      showToast('error', 'فشل في إرسال التذكير');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <SkeletonDashboard />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8 bg-gradient-to-l from-primary to-primary-400 rounded-2xl p-6 text-white animate-fadeIn shadow-glass">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {getGreeting()}، {user?.name || 'التاجر'}
        </h1>
        <p className="text-white/70 text-sm">{getCurrentDate()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard
          title="رصيد المحفظة"
          value={formatCurrency(walletBalance)}
          icon={<Wallet size={24} />}
          variant="gradient"
          color="green"
          onClick={() => navigate('/wallet')}
        />
        <StatCard
          title="مبيعات اليوم"
          value={formatCurrency(todayStats.sales)}
          icon={<TrendingUp size={24} />}
          change={todayStats.salesChange}
          trend={todayStats.salesChange >= 0 ? 'up' : 'down'}
          onClick={() => navigate('/reports/sales')}
        />
        <StatCard
          title="عمليات اليوم"
          value={todayStats.transactionsCount.toString()}
          icon={<Receipt size={24} />}
          onClick={() => navigate('/transactions')}
        />
        <StatCard
          title="فواتير معلقة"
          value={pendingInvoicesCount.toString()}
          icon={<FileWarning size={24} />}
          color="orange"
          onClick={() => navigate('/invoices?status=pending')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-card p-4 md:p-6 animate-slideUp">
          <h2 className="text-lg font-bold text-gray-900 mb-4">المبيعات - آخر 7 أيام</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
              <XAxis
                dataKey="date"
                stroke="#A9BDD3"
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#A9BDD3"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000)}k`}
                tickLine={false}
                axisLine={false}
              />
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
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#1E3A5F"
                strokeWidth={2.5}
                fill="url(#colorAmount)"
                dot={{ fill: '#1E3A5F', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, stroke: '#1E3A5F', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-4 md:p-6 animate-slideUp">
          <h2 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-white border border-gray-100"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Transactions */}
        <div className="glass-card p-4 md:p-6 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">آخر العمليات</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-sm text-primary hover:text-primary-400 font-medium"
            >
              عرض الكل
            </button>
          </div>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">لا توجد عمليات حديثة</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => navigate(`/transactions/${transaction.id}`)}
                  className="flex items-center justify-between p-3 hover:bg-primary-50/50 rounded-xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      transaction.type === 'payment' ? 'bg-accent-50 text-accent' : 'bg-red-50 text-error'
                    }`}>
                      {transaction.type === 'payment' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{transaction.customerName}</p>
                      <p className="text-xs text-gray-400">
                        {transaction.method === 'nfc' ? 'NFC' :
                         transaction.method === 'qr' ? 'QR' : 'رقم الجوال'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold font-numbers text-sm ${
                      transaction.type === 'payment' ? 'text-accent' : 'text-error'
                    }`}>
                      {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.createdAt).toLocaleTimeString('ar-SY', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="glass-card p-4 md:p-6 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">فواتير تحتاج انتباه</h2>
            <button
              onClick={() => navigate('/invoices')}
              className="text-sm text-primary hover:text-primary-400 font-medium"
            >
              عرض الكل
            </button>
          </div>
          <div className="space-y-3">
            {pendingInvoices.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">لا توجد فواتير معلقة</p>
            ) : (
              pendingInvoices.slice(0, 3).map((invoice) => {
                const dueDate = new Date(invoice.dueDate);
                const today = new Date();
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                let statusText = '';
                let statusColor = '';

                if (invoice.status === 'overdue' || daysUntilDue < 0) {
                  statusText = `متأخرة ${Math.abs(daysUntilDue)} يوم`;
                  statusColor = 'text-error bg-red-50';
                } else if (daysUntilDue === 0) {
                  statusText = 'تستحق اليوم';
                  statusColor = 'text-warning bg-amber-50';
                } else if (daysUntilDue === 1) {
                  statusText = 'تستحق غداً';
                  statusColor = 'text-warning bg-amber-50';
                } else {
                  statusText = `تستحق خلال ${daysUntilDue} يوم`;
                  statusColor = 'text-gray-500 bg-gray-50';
                }

                return (
                  <div
                    key={invoice.id}
                    className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">{invoice.customerName}</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">{invoice.id}</p>
                      <p className="font-bold text-gray-900 font-numbers text-sm">{formatCurrency(invoice.amount)}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        fullWidth
                        onClick={() => handleSendReminder(invoice.id)}
                      >
                        تذكير
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        fullWidth
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        عرض
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
