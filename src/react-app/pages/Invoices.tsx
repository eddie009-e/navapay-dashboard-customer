import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Download, Send, Eye, Copy, FileDown, X, MoreVertical, FileText } from 'lucide-react';
import Button from '@/react-app/components/Button';
import EmptyState from '@/react-app/components/EmptyState';
import { useToast } from '@/react-app/contexts/ToastContext';
import { invoicesService, Invoice } from '@/react-app/services';

type InvoiceStatus = 'all' | 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export default function Invoices() {
  const { showToast } = useToast();
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

  // Debounce search
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
      draft: { text: 'مسودة', class: 'bg-gray-100 text-gray-700' },
      pending: { text: 'معلقة', class: 'bg-warning/10 text-warning' },
      paid: { text: 'مدفوعة', class: 'bg-success/10 text-success' },
      overdue: { text: 'متأخرة', class: 'bg-error/10 text-error' },
      cancelled: { text: 'ملغاة', class: 'bg-gray-100 text-gray-500' }
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
    showToast('info', 'جاري تحميل التقرير...');
    // TODO: Implement export functionality
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">الفواتير</h1>
          <Link to="/invoices/create">
            <Button leftIcon={<Plus size={20} />}>
              فاتورة جديدة
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <Button variant="outline" leftIcon={<Download size={20} />} onClick={handleExport}>
            تصدير
          </Button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-4 md:p-6">
        <div className="space-y-4">
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
                  className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow animate-slideUp"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{invoice.invoiceNumber || invoice.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                          {badge.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{invoice.customerName}</span>
                        <span className="font-numbers">{invoice.customerPhone}</span>
                      </div>
                    </div>

                    <div className="text-left">
                      <p className="text-2xl font-bold text-gray-900 font-numbers mb-1">
                        {formatCurrency(invoice.total)}
                      </p>
                      <p className="text-sm text-gray-600">
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
                      <Button size="sm" variant="outline" leftIcon={<Eye size={16} />}>
                        عرض
                      </Button>
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() => setShowActionsMenu(showActionsMenu === invoice.id ? null : invoice.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>

                      {showActionsMenu === invoice.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowActionsMenu(null)}
                          />
                          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 min-w-48">
                            {invoice.status === 'draft' && (
                              <Link to={`/invoices/${invoice.id}/edit`}>
                                <button className="w-full px-4 py-2 text-right hover:bg-gray-50 transition-colors text-gray-700">
                                  تعديل
                                </button>
                              </Link>
                            )}
                            <button
                              onClick={() => handleCopyPaymentLink(invoice)}
                              className="w-full px-4 py-2 text-right hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                            >
                              <Copy size={16} />
                              نسخ رابط الدفع
                            </button>
                            <button
                              onClick={() => showToast('info', 'جاري تحميل PDF...')}
                              className="w-full px-4 py-2 text-right hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                            >
                              <FileDown size={16} />
                              تحميل PDF
                            </button>
                            <button
                              onClick={() => showToast('success', `تم إرسال الفاتورة إلى ${invoice.customerName}`)}
                              className="w-full px-4 py-2 text-right hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                            >
                              <Send size={16} />
                              إرسال للعميل
                            </button>
                            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                              <button
                                onClick={() => handleCancelInvoice(invoice)}
                                className="w-full px-4 py-2 text-right hover:bg-gray-50 transition-colors text-error flex items-center gap-2"
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

        {/* Pagination */}
        {invoices.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              السابق
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
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
