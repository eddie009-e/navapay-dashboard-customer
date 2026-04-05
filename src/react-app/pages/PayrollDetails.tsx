import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';

import { Users, DollarSign, Calendar, CheckCircle, AlertCircle, XCircle, Download, RefreshCw, User } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { SkeletonTable } from '@/react-app/components/LoadingSpinner';
import { payrollService, BulkTransferDetails, BulkTransferRecipient } from '../services';
import { useToast } from '@/react-app/contexts/ToastContext';

export default function PayrollDetails() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [transfer, setTransfer] = useState<BulkTransferDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransferDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await payrollService.getById(id);
        setTransfer(data);
      } catch (error) {
        console.error('Failed to fetch transfer details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransferDetails();
  }, [id]);

  const handleRetryFailed = async () => {
    if (!id) return;
    try {
      await payrollService.retryFailed(id);
      // Refresh the data
      const data = await payrollService.getById(id);
      setTransfer(data);
    } catch {
      showToast('error', 'فشل في إعادة المحاولة');
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="py-6">
          <SkeletonTable rows={8} />
        </div>
      </>
    );
  }

  if (!transfer) {
    return (
      <>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الدفعة غير موجودة</h2>
          <p className="text-gray-500 mb-6">لم يتم العثور على هذه الدفعة الجماعية</p>
          <Link to="/payroll">
            <Button>العودة للدفعات الجماعية</Button>
          </Link>
        </div>
      </>
    );
  }

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const recipients = transfer.recipients || [];

  const getTypeBadge = (type: BulkTransferDetails['type']) => {
    const badges = {
      payroll: { text: 'رواتب', class: 'bg-primary-100 text-primary-700' },
      suppliers: { text: 'موردين', class: 'bg-accent-100 text-accent-700' },
      refunds: { text: 'استرجاعات', class: 'bg-warning-100 text-warning-700' },
      other: { text: 'أخرى', class: 'bg-gray-100 text-gray-700' }
    };
    return badges[type];
  };

  const getStatusBadge = (status: BulkTransferDetails['status']) => {
    const badges = {
      draft: { text: 'مسودة', class: 'bg-gray-100 text-gray-700', icon: null },
      pending: { text: 'قيد الانتظار', class: 'bg-warning/10 text-warning', icon: <AlertCircle size={16} /> },
      approved: { text: 'تمت الموافقة', class: 'bg-info/10 text-info', icon: <CheckCircle size={16} /> },
      processing: { text: 'قيد المعالجة', class: 'bg-primary/10 text-primary', icon: null },
      completed: { text: 'مكتملة', class: 'bg-accent-50 text-accent-700', icon: <CheckCircle size={16} /> },
      partial_failed: { text: 'مكتملة جزئياً', class: 'bg-error/10 text-error', icon: <AlertCircle size={16} /> }
    };
    return badges[status];
  };

  const getRecipientStatusBadge = (status: BulkTransferRecipient['status']) => {
    const badges = {
      completed: { text: 'مكتملة', class: 'bg-accent-50 text-accent-700', icon: <CheckCircle size={14} /> },
      pending: { text: 'قيد الانتظار', class: 'bg-warning/10 text-warning', icon: <AlertCircle size={14} /> },
      failed: { text: 'فاشلة', class: 'bg-error/10 text-error', icon: <XCircle size={14} /> }
    };
    return badges[status];
  };

  const typeBadge = getTypeBadge(transfer.type);
  const statusBadge = getStatusBadge(transfer.status);

  // Calculate stats
  const completedCount = recipients.filter(r => r.status === 'completed').length;
  const failedCount = recipients.filter(r => r.status === 'failed').length;
  const pendingCount = recipients.filter(r => r.status === 'pending').length;
  const successRate = recipients.length > 0 ? Math.round((completedCount / recipients.length) * 100) : 0;

  return (
    <>
      <BackButton to="/payroll" label="الدفعات الجماعية" />
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="mb-6">

          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{transfer.name}</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeBadge.class}`}>
                    {typeBadge.text}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-3">
                  <span className="font-mono text-sm">{transfer.id}</span>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(transfer.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>بواسطة {transfer.createdBy}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${statusBadge.class}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" leftIcon={<Download size={20} />} onClick={() => window.print()}>
                  طباعة
                </Button>
                {failedCount > 0 && (
                  <Button leftIcon={<RefreshCw size={20} />} onClick={handleRetryFailed}>
                    إعادة المحاولة
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} className="text-primary" />
                  <p className="text-sm text-gray-700">إجمالي المستلمين</p>
                </div>
                <p className="text-3xl font-bold text-primary font-numbers">{recipients.length}</p>
              </div>

              <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-4 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-accent-700" />
                  <p className="text-sm text-gray-700">المكتملة</p>
                </div>
                <p className="text-3xl font-bold text-accent-700 font-numbers">{completedCount}</p>
                <p className="text-sm text-accent-700 mt-1">نسبة النجاح: {successRate}%</p>
              </div>

              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-accent" />
                  <p className="text-sm text-gray-700">المبلغ الإجمالي</p>
                </div>
                <p className="text-2xl font-bold text-accent font-numbers">{formatCurrency(transfer.totalAmount)}</p>
              </div>

              <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl p-4 border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-secondary" />
                  <p className="text-sm text-gray-700">متوسط المبلغ</p>
                </div>
                <p className="text-xl font-bold text-secondary font-numbers">
                  {formatCurrency(recipients.length > 0 ? transfer.totalAmount / recipients.length : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        {(failedCount > 0 || pendingCount > 0) && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ملخص الحالة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pendingCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-warning/5 rounded-xl border border-warning/20">
                  <AlertCircle size={24} className="text-warning flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 font-numbers">{pendingCount} دفعة</p>
                    <p className="text-sm text-gray-500">قيد الانتظار</p>
                  </div>
                </div>
              )}
              {failedCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-error/5 rounded-xl border border-error/20">
                  <XCircle size={24} className="text-error flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 font-numbers">{failedCount} دفعة</p>
                    <p className="text-sm text-gray-500">فاشلة - تحتاج إعادة محاولة</p>
                  </div>
                </div>
              )}
              {completedCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-success/5 rounded-xl border border-success/20">
                  <CheckCircle size={24} className="text-accent-700 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 font-numbers">{completedCount} دفعة</p>
                    <p className="text-sm text-gray-500">مكتملة بنجاح</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recipients List */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">قائمة المستلمين</h2>
            <p className="text-sm text-gray-500">
              عرض <span className="font-bold font-numbers">{recipients.length}</span> مستلم
            </p>
          </div>

          {recipients.length === 0 ? (
            <div className="text-center py-16">
              <Users size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا يوجد مستلمين</h3>
              <p className="text-gray-500">لم يتم إضافة أي مستلمين لهذه الدفعة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الاسم</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">رقم الجوال</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المبلغ</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">وقت المعالجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recipients.map((recipient, index) => {
                    const badge = getRecipientStatusBadge(recipient.status);

                    return (
                      <tr key={recipient.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-gray-500 font-numbers">{index + 1}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{recipient.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-numbers text-gray-900">{recipient.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900 font-numbers">
                            {formatCurrency(recipient.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                            {badge.icon}
                            {badge.text}
                          </span>
                          {recipient.failureReason && (
                            <p className="text-xs text-error mt-1">{recipient.failureReason}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {recipient.processedAt ? (
                            <span className="text-sm text-gray-500 font-numbers">
                              {formatDateTime(recipient.processedAt)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">معلومات الدفعة</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">رقم الدفعة:</span>
                  <span className="font-mono font-medium text-gray-900">{transfer.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ الإنشاء:</span>
                  <span className="font-medium text-gray-900">{formatDate(transfer.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">أنشئت بواسطة:</span>
                  <span className="font-medium text-gray-900">{transfer.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">نوع الدفعة:</span>
                  <span className="font-medium text-gray-900">{typeBadge.text}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">الملخص المالي</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">عدد المستلمين:</span>
                  <span className="font-bold text-gray-900 font-numbers">{recipients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المبلغ الإجمالي:</span>
                  <span className="font-bold text-gray-900 font-numbers">{formatCurrency(transfer.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">متوسط المبلغ:</span>
                  <span className="font-bold text-gray-900 font-numbers">
                    {formatCurrency(recipients.length > 0 ? transfer.totalAmount / recipients.length : 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-bold">نسبة النجاح:</span>
                  <span className="font-bold text-accent-700 font-numbers">{successRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
