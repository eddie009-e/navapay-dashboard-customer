import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, TrendingUp, Receipt, FileWarning, CreditCard, FileText, Send, UserPlus } from 'lucide-react';
import MainLayout from '@/react-app/components/MainLayout';
import StatCard from '@/react-app/components/StatCard';
import Button from '@/react-app/components/Button';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { useToast } from '@/react-app/contexts/ToastContext';
import {
  dashboardService,
  walletService,
  invoicesService,
  TodayStats,
  SalesDataPoint
} from '@/react-app/services';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        // Fetch all data in parallel
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

        // Fetch recent transactions
        try {
          const transactions = await dashboardService.getRecentTransactions(5);
          setRecentTransactions(transactions as RecentTransaction[]);
        } catch {
          // Use empty array if failed
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8 animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {getGreeting()}، {user?.name || 'التاجر'}
        </h1>
        <p className="text-gray-600">{getCurrentDate()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 animate-slideUp">
        <StatCard
          title="رصيد المحفظة"
          value={formatCurrency(walletBalance)}
          icon={<Wallet size={24} />}
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
          onClick={() => navigate('/invoices?status=pending')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 animate-slideUp">
          <h2 className="text-xl font-bold text-gray-900 mb-6">المبيعات - آخر 7 أيام</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000)}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  direction: 'rtl'
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#1E3A5F"
                strokeWidth={3}
                dot={{ fill: '#1E3A5F', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 animate-slideUp">
          <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
          <div className="space-y-3">
            <Button
              fullWidth
              leftIcon={<CreditCard size={20} />}
              onClick={() => navigate('/pos')}
            >
              POS جديد
            </Button>
            <Button
              fullWidth
              variant="outline"
              leftIcon={<FileText size={20} />}
              onClick={() => navigate('/invoices/create')}
            >
              فاتورة جديدة
            </Button>
            <Button
              fullWidth
              variant="outline"
              leftIcon={<Send size={20} />}
              onClick={() => navigate('/payroll/create')}
            >
              تحويل جماعي
            </Button>
            <Button
              fullWidth
              variant="outline"
              leftIcon={<UserPlus size={20} />}
              onClick={() => navigate('/customers')}
            >
              إضافة عميل
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">آخر العمليات</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-sm text-primary hover:text-primary-600 font-medium"
            >
              عرض الكل
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد عمليات حديثة</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => navigate(`/transactions/${transaction.id}`)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'payment' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {transaction.type === 'payment' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.method === 'nfc' ? 'NFC' :
                         transaction.method === 'qr' ? 'QR' : 'رقم الجوال'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold font-numbers ${
                      transaction.type === 'payment' ? 'text-success' : 'text-error'
                    }`}>
                      {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
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
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">فواتير تحتاج انتباه</h2>
            <button
              onClick={() => navigate('/invoices')}
              className="text-sm text-primary hover:text-primary-600 font-medium"
            >
              عرض الكل
            </button>
          </div>
          <div className="space-y-4">
            {pendingInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد فواتير معلقة</p>
            ) : (
              pendingInvoices.slice(0, 3).map((invoice) => {
                const dueDate = new Date(invoice.dueDate);
                const today = new Date();
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                let statusText = '';
                let statusColor = '';

                if (invoice.status === 'overdue' || daysUntilDue < 0) {
                  statusText = `متأخرة ${Math.abs(daysUntilDue)} يوم`;
                  statusColor = 'text-error bg-error/10';
                } else if (daysUntilDue === 0) {
                  statusText = 'تستحق اليوم';
                  statusColor = 'text-warning bg-warning/10';
                } else if (daysUntilDue === 1) {
                  statusText = 'تستحق غداً';
                  statusColor = 'text-warning bg-warning/10';
                } else {
                  statusText = `تستحق خلال ${daysUntilDue} يوم`;
                  statusColor = 'text-gray-600 bg-gray-100';
                }

                return (
                  <div
                    key={invoice.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{invoice.customerName}</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">{invoice.id}</p>
                      <p className="font-bold text-gray-900 font-numbers">{formatCurrency(invoice.amount)}</p>
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
                        variant="outline"
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
