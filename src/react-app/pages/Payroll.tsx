import { useState, useEffect } from 'react';

import { Users, Plus, Search, TrendingUp, DollarSign, CheckCircle, AlertCircle, Crown, ChevronLeft } from 'lucide-react';
import Button from '@/react-app/components/Button';
import CreateBulkTransferModal from '@/react-app/components/CreateBulkTransferModal';
import { SkeletonTable } from '@/react-app/components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { payrollService, BulkTransfer, BulkTransferStats } from '../services';
import { useToast } from '@/react-app/contexts/ToastContext';
import { Link } from 'react-router';

export default function Payroll() {
  const { isEnterprise } = useAuth();
  const { showToast } = useToast();
  const [bulkTransfers, setBulkTransfers] = useState<BulkTransfer[]>([]);
  const [stats, setStats] = useState<BulkTransferStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'payroll' | 'suppliers' | 'refunds' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending' | 'processing' | 'completed' | 'partial_failed'>('all');

  const fetchBulkTransfers = async () => {
    if (!isEnterprise) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [transfersResponse, statsResponse] = await Promise.all([
        payrollService.list({
          limit: 100,
          type: typeFilter === 'all' ? undefined : typeFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery || undefined
        }),
        payrollService.getStats()
      ]);
      setBulkTransfers(transfersResponse.data || []);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to fetch bulk transfers:', error);
      showToast('error', 'فشل في تحميل الدفعات الجماعية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkTransfers();
  }, [isEnterprise, typeFilter, statusFilter, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateTransfer = async (transferData: {
    name: string;
    type: 'payroll' | 'suppliers' | 'refunds' | 'other';
    recipients: Array<{ id: string; name: string; phone: string; amount: number }>;
  }) => {
    try {
      await payrollService.create({
        name: transferData.name,
        type: transferData.type,
        recipients: transferData.recipients.map(r => ({
          name: r.name,
          phone: r.phone,
          amount: r.amount
        }))
      });
      showToast('success', 'تم إنشاء الدفعة الجماعية بنجاح');
      fetchBulkTransfers();
    } catch {
      showToast('error', 'فشل في إنشاء الدفعة الجماعية');
    }
  };

  if (!isEnterprise) {
    return (
      <>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">ميزة مخصصة للباقة Enterprise</h2>
          <p className="text-lg text-gray-500 mb-8">
            نظام الرواتب والدفعات الجماعية متاح فقط في الباقة Enterprise. قم بالترقية للاستفادة من هذه الميزة.
          </p>
          <div className="glass-card p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">ما الذي ستحصل عليه؟</h3>
            <ul className="text-right space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-accent-700 text-xl">✓</span>
                <span>إرسال رواتب الموظفين دفعة واحدة</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-700 text-xl">✓</span>
                <span>دفع الموردين والمقاولين بسهولة</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-700 text-xl">✓</span>
                <span>معالجة استرجاعات متعددة في آن واحد</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-700 text-xl">✓</span>
                <span>تتبع حالة كل دفعة وتقارير مفصلة</span>
              </li>
            </ul>
          </div>
          <Button size="lg" disabled className="opacity-50">
            الترقية للباقة Enterprise (قريباً)
          </Button>
        </div>
      </>
    );
  }

  // Transfers are already filtered via API
  const filteredTransfers = bulkTransfers;

  // Get stats from API response or calculate from local data
  const totalTransfers = stats?.totalTransfers ?? bulkTransfers.length;
  const completedTransfers = stats?.completedTransfers ?? bulkTransfers.filter(t => t.status === 'completed').length;
  const totalAmount = stats?.totalAmount ?? bulkTransfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const totalRecipients = stats?.totalRecipients ?? bulkTransfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.recipientsCount, 0);

  const getTypeBadge = (type: BulkTransfer['type']) => {
    const badges = {
      payroll: { text: 'رواتب', class: 'bg-primary-100 text-primary-700' },
      suppliers: { text: 'موردين', class: 'bg-accent-100 text-accent-700' },
      refunds: { text: 'استرجاعات', class: 'bg-warning-100 text-warning-700' },
      other: { text: 'أخرى', class: 'bg-gray-100 text-gray-700' }
    };
    return badges[type];
  };

  const getStatusBadge = (status: BulkTransfer['status']) => {
    const badges = {
      draft: { text: 'مسودة', class: 'bg-gray-100 text-gray-700', icon: null },
      pending: { text: 'قيد الانتظار', class: 'bg-warning/10 text-warning', icon: <AlertCircle size={14} /> },
      approved: { text: 'تمت الموافقة', class: 'bg-info/10 text-info', icon: <CheckCircle size={14} /> },
      processing: { text: 'قيد المعالجة', class: 'bg-primary/10 text-primary', icon: null },
      completed: { text: 'مكتملة', class: 'bg-accent-50 text-accent-700', icon: <CheckCircle size={14} /> },
      partial_failed: { text: 'مكتملة جزئياً', class: 'bg-error/10 text-error', icon: <AlertCircle size={14} /> }
    };
    return badges[status];
  };

  return (
    <>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الرواتب والدفعات الجماعية</h1>
                <p className="text-gray-500">إدارة دفعات الموظفين والموردين</p>
              </div>
            </div>
            <Button leftIcon={<Plus size={20} />} onClick={() => setIsCreateModalOpen(true)}>
              دفعة جديدة
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-primary" />
                <p className="text-sm text-gray-700">إجمالي الدفعات</p>
              </div>
              <p className="text-3xl font-bold text-primary font-numbers">{totalTransfers}</p>
            </div>

            <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-4 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-accent-700" />
                <p className="text-sm text-gray-700">الدفعات المكتملة</p>
              </div>
              <p className="text-3xl font-bold text-accent-700 font-numbers">{completedTransfers}</p>
            </div>

            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-accent" />
                <p className="text-sm text-gray-700">إجمالي المبالغ</p>
              </div>
              <p className="text-2xl font-bold text-accent font-numbers">{formatCurrency(totalAmount)}</p>
            </div>

            <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl p-4 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-secondary" />
                <p className="text-sm text-gray-700">عدد المستلمين</p>
              </div>
              <p className="text-3xl font-bold text-secondary font-numbers">{totalRecipients}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الدفعة أو الاسم..."
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
              >
                <option value="all">كل الأنواع</option>
                <option value="payroll">رواتب</option>
                <option value="suppliers">موردين</option>
                <option value="refunds">استرجاعات</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
              >
                <option value="all">كل الحالات</option>
                <option value="completed">مكتملة</option>
                <option value="processing">قيد المعالجة</option>
                <option value="pending">قيد الانتظار</option>
                <option value="draft">مسودة</option>
                <option value="partial_failed">مكتملة جزئياً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transfers List */}
        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <SkeletonTable rows={8} />
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-16">
              <Users size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'لا توجد نتائج' : 'لا توجد دفعات جماعية بعد'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإنشاء دفعتك الأولى'}
              </p>
              {!searchQuery && (
                <Button leftIcon={<Plus size={20} />} onClick={() => setIsCreateModalOpen(true)}>
                  دفعة جديدة
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">رقم الدفعة</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">اسم الدفعة</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">النوع</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المستلمون</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المبلغ الإجمالي</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransfers.map((transfer) => {
                    const typeBadge = getTypeBadge(transfer.type);
                    const statusBadge = getStatusBadge(transfer.status);

                    return (
                      <tr key={transfer.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900">{transfer.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">{transfer.name}</p>
                            <p className="text-sm text-gray-500">بواسطة {transfer.createdBy}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeBadge.class}`}>
                            {typeBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-numbers">{transfer.recipientsCount}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 font-numbers">
                            {formatCurrency(transfer.totalAmount)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.class}`}>
                            {statusBadge.icon}
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500">{formatDate(transfer.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/payroll/${transfer.id}`}
                            className="inline-flex items-center gap-1 text-primary hover:text-primary-600 font-medium transition-colors"
                          >
                            <span>التفاصيل</span>
                            <ChevronLeft size={16} />
                          </Link>
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

      {/* Create Bulk Transfer Modal */}
      <CreateBulkTransferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTransfer}
      />
    </>
  );
}
