import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import { Plus, Search, Download, Send, Eye, Copy, FileDown, X, MoreVertical, FileText } from 'lucide-react';
import Button from '@/react-app/components/Button';
import EmptyState from '@/react-app/components/EmptyState';
import { SkeletonTable } from '@/react-app/components/LoadingSpinner';
import { useToast } from '@/react-app/contexts/ToastContext';
import { invoicesService, Invoice } from '@/react-app/services';

type InvoiceStatus = 'all' | 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

const subTabs = [
  { label: 'كل الفواتير', path: '/invoices' },
  { label: 'الدورية', path: '/invoices/recurring' },
  { label: 'روابط الدفع', path: '/invoices/payment-links' },
];

export default function Invoices() {
  const { showToast } = useToast();
  const location = useLocation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InvoiceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_statusCounts, _setStatusCounts] = useState<Record<string, number>>({});

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await invoicesService.list({
        page,
        limit: 10,
        status: activeTab === 'all' ? undefined : activeTab,
        search: searchQuery || undefined,
      });

      setInvoices(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch {
      showToast('error', 'فشل في تحميل الفواتير');
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab, searchQuery, showToast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; class: string }> = {
      draft: { text: 'مسودة', class: 'bg-gray-100 text-gray-600' },
      pending: { text: 'معلقة', class: 'bg-amber-50 text-warning' },
      paid: { text: 'مدفوعة', class: 'bg-accent-50 text-accent-700' },
      overdue: { text: 'متأخرة', class: 'bg-red-50 text-error' },
      cancelled: { text: 'ملغاة', class: 'bg-gray-50 text-gray-400' }
    };
    return badges[status] || badges.draft;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tabs: { id: InvoiceStatus; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'draft', label: 'مسودة' },
    { id: 'pending', label: 'معلقة' },
    { id: 'paid', label: 'مدفوعة' },
    { id: 'overdue', label: 'متأخرة' },
    { id: 'cancelled', label: 'ملغاة' }
  ];

  const handleCopyPaymentLink = (invoice: Invoice) => {
    const link = invoice.paymentLink || `https://navapay.app/pay/${invoice.id}`;
    navigator.clipboard.writeText(link);
    showToast('success', 'تم نسخ رابط الدفع إلى الحافظة');
    setShowActionsMenu(null);
  };

  const handleSendReminder = async (invoice: Invoice) => {
    try {
      await invoicesService.sendReminder(invoice.id);
      showToast('success', `تم إرسال تذكير إلى ${invoice.customerName}`);
    } catch {
      showToast('error', 'فشل في إرسال التذكير');
    }
  };

  const handleCancelInvoice = async (invoice: Invoice) => {
    try {
      await invoicesService.cancel(invoice.id);
      showToast('warning', `تم إلغاء الفاتورة ${invoice.invoiceNumber || invoice.id}`);
      setShowActionsMenu(null);
      fetchInvoices();
    } catch {
      showToast('error', 'فشل في إلغاء الفاتورة');
    }
  };

  const handleExport = () => {
    if (invoices.length === 0) {
      showToast('warning', 'لا توجد فواتير للتصدير');
      return;
    }
    const headers = ['رقم الفاتورة', 'العميل', 'الهاتف', 'المبلغ', 'الحالة', 'تاريخ الاستحقاق'];
    const rows = invoices.map(inv => [
      inv.invoiceNumber || inv.id,
      inv.customerName,
      inv.customerPhone,
      inv.total,
      inv.status,
      inv.dueDate,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'تم تحميل التقرير');
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="glass-card mx-4 md:mx-6 mt-4 md:mt-6 p-4 md:p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">الفواتير</h1>
          <Link to="/invoices/create">
            <Button leftIcon={<Plus size={20} />}>
              فاتورة جديدة
            </Button>
          </Link>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {subTabs.map(tab => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                location.pathname === tab.path
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all text-sm ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث بالرقم أو اسم العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50/50"
            />
          </div>
          <Button variant="outline" leftIcon={<Download size={20} />} onClick={handleExport}>
            تصدير
          </Button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-4 md:p-6">
        {isLoading && invoices.length === 0 ? (
          <SkeletonTable rows={5} />
        ) : (
          <div className="space-y-3">
            {invoices.length === 0 ? (
              searchQuery ? (
                <EmptyState
                  icon={Search}
                  title="لا توجد نتائج"
                  description="جرب البحث بكلمات مختلفة أو تحقق من الفلاتر المطبقة"
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="لا توجد فواتير"
                  description="ابدأ بإنشاء فاتورتك الأولى لتتبع المدفوعات والديون"
                  actionLabel="إنشاء فاتورة جديدة"
                  onAction={() => window.location.href = '/invoices/create'}
                />
              )
            ) : (
              invoices.map(invoice => {
                const badge = getStatusBadge(invoice.status);
                const daysUntilDue = getDaysUntilDue(invoice.dueDate);

                return (
                  <div
                    key={invoice.id}
                    className="glass-card p-4 md:p-5 hover:shadow-card-hover transition-all duration-200 animate-slideUp"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-bold text-gray-900">{invoice.invoiceNumber || invoice.id}</h3>
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${badge.class}`}>
                            {badge.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">{invoice.customerName}</span>
                          <span className="font-numbers">{invoice.customerPhone}</span>
                        </div>
                      </div>

                      <div className="text-left">
                        <p className="text-xl font-bold text-gray-900 font-numbers mb-1">
                          {formatCurrency(invoice.total)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {invoice.status === 'paid' && invoice.paidAt
                            ? `دُفعت في ${formatDate(invoice.paidAt)}`
                            : `تستحق في ${formatDate(invoice.dueDate)}`
                          }
                        </p>
                        {invoice.status === 'pending' && daysUntilDue >= 0 && (
                          <p className="text-xs text-warning mt-1">
                            {daysUntilDue === 0 ? 'تستحق اليوم' : `تستحق خلال ${daysUntilDue} يوم`}
                          </p>
                        )}
                        {invoice.status === 'overdue' && (
                          <p className="text-xs text-error mt-1">
                            متأخرة {Math.abs(daysUntilDue)} يوم
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Send size={16} />}
                          onClick={() => handleSendReminder(invoice)}
                        >
                          تذكير
                        </Button>
                      )}
                      <Link to={`/invoices/${invoice.id}`}>
                        <Button size="sm" variant="ghost" leftIcon={<Eye size={16} />}>
                          عرض
                        </Button>
                      </Link>

                      <div className="relative">
                        <button
                          onClick={() => setShowActionsMenu(showActionsMenu === invoice.id ? null : invoice.id)}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <MoreVertical size={18} className="text-gray-400" />
                        </button>

                        {showActionsMenu === invoice.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowActionsMenu(null)}
                            />
                            <div className="absolute left-0 top-full mt-1 glass-card py-2 z-20 min-w-48 animate-scaleIn">
                              {invoice.status === 'draft' && (
                                <Link to={`/invoices/${invoice.id}/edit`}>
                                  <button className="w-full px-4 py-2.5 text-right hover:bg-primary-50 transition-colors text-gray-600 text-sm">
                                    تعديل
                                  </button>
                                </Link>
                              )}
                              <button
                                onClick={() => handleCopyPaymentLink(invoice)}
                                className="w-full px-4 py-2.5 text-right hover:bg-primary-50 transition-colors text-gray-600 flex items-center gap-2 text-sm"
                              >
                                <Copy size={16} />
                                نسخ رابط الدفع
                              </button>
                              <button
                                onClick={() => window.print()}
                                className="w-full px-4 py-2.5 text-right hover:bg-primary-50 transition-colors text-gray-600 flex items-center gap-2 text-sm"
                              >
                                <FileDown size={16} />
                                طباعة
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await invoicesService.send(invoice.id);
                                    showToast('success', `تم إرسال الفاتورة إلى ${invoice.customerName}`);
                                    setShowActionsMenu(null);
                                    fetchInvoices();
                                  } catch {
                                    showToast('error', 'فشل في إرسال الفاتورة');
                                  }
                                }}
                                className="w-full px-4 py-2.5 text-right hover:bg-primary-50 transition-colors text-gray-600 flex items-center gap-2 text-sm"
                              >
                                <Send size={16} />
                                إرسال للعميل
                              </button>
                              {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                                <button
                                  onClick={() => handleCancelInvoice(invoice)}
                                  className="w-full px-4 py-2.5 text-right hover:bg-red-50 transition-colors text-error flex items-center gap-2 text-sm"
                                >
                                  <X size={16} />
                                  إلغاء الفاتورة
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {invoices.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              السابق
            </Button>
            <span className="px-4 py-2 text-sm text-gray-500">
              صفحة {page} من {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              التالي
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
