import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Send, Copy, FileDown, Printer, X, Check, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { invoicesService, Invoice } from '../services';
import { useAuth } from '../contexts/AuthContext';

export default function InvoiceDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { merchant } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load invoice
  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await invoicesService.getById(id);
        setInvoice(data);
      } catch (error) {
        console.error('Failed to load invoice:', error);
        setInvoice(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الفاتورة غير موجودة</h2>
          <Button onClick={() => navigate('/invoices')}>العودة للفواتير</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ar-SY', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: typeof invoice.status) => {
    const badges = {
      draft: { text: 'مسودة', class: 'bg-gray-100 text-gray-700' },
      pending: { text: 'معلقة', class: 'bg-warning/10 text-warning' },
      paid: { text: 'مدفوعة', class: 'bg-success/10 text-success' },
      overdue: { text: 'متأخرة', class: 'bg-error/10 text-error' },
      cancelled: { text: 'ملغاة', class: 'bg-gray-100 text-gray-500' }
    };
    return badges[status];
  };

  const getDaysUntilDue = () => {
    const due = new Date(invoice.dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotals = () => {
    const subtotal = invoice.subtotal || invoice.items?.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || item.price)), 0) || invoice.total;
    const tax = invoice.tax || 0;
    const discount = invoice.discount || 0;
    const total = invoice.total;
    return { subtotal, tax, discount, total };
  };

  const badge = getStatusBadge(invoice.status);
  const daysUntilDue = getDaysUntilDue();
  const { subtotal, tax, discount, total } = calculateTotals();

  // Activity timeline
  const activities = [
    { type: 'created', date: invoice.createdAt, text: 'أُنشئت الفاتورة' },
    ...(invoice.status !== 'draft' ? [{ type: 'sent', date: invoice.createdAt, text: 'أُرسلت للعميل' }] : []),
    ...(invoice.status === 'paid' && invoice.paidAt ? [{ type: 'paid', date: invoice.paidAt, text: 'تم الدفع' }] : []),
  ];

  const handleCopyLink = () => {
    const link = `https://pay.navapay.com/invoice/${invoice.id}`;
    navigator.clipboard.writeText(link);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await invoicesService.update(invoice.id, { status: 'cancelled' });
      setShowCancelModal(false);
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to cancel invoice:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      await invoicesService.sendReminder(invoice.id);
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton to="/invoices" label="الفواتير" />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{invoice.id}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
              {badge.text}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status === 'draft' && (
              <Button variant="outline">تعديل</Button>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Alert */}
            {invoice.status === 'pending' && daysUntilDue >= 0 && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <p className="text-warning font-medium">
                  {daysUntilDue === 0 
                    ? '⚠️ هذه الفاتورة تستحق اليوم'
                    : `⏰ تستحق خلال ${daysUntilDue} يوم`
                  }
                </p>
              </div>
            )}

            {invoice.status === 'overdue' && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <p className="text-error font-medium">
                  ❌ متأخرة {Math.abs(daysUntilDue)} يوم
                </p>
              </div>
            )}

            {/* Invoice Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
                <div>
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-white">NP</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{merchant?.name || 'NavaPay'}</h3>
                  <p className="text-sm text-gray-600">-</p>
                  <p className="text-sm text-gray-600 font-numbers">-</p>
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">فاتورة</h2>
                  <p className="text-sm text-gray-600 font-mono">{invoice.id}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">إلى:</h4>
                  <p className="font-medium text-gray-900">{invoice.customerName}</p>
                  <p className="text-sm text-gray-600 font-numbers">{invoice.customerPhone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">تفاصيل الفاتورة:</h4>
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-600">تاريخ الإنشاء: </span>
                    {formatDate(invoice.createdAt)}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-600">تاريخ الاستحقاق: </span>
                    {formatDate(invoice.dueDate)}
                  </p>
                  {invoice.paidAt && (
                    <p className="text-sm text-success">
                      <span className="text-gray-600">تاريخ الدفع: </span>
                      {formatDate(invoice.paidAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              {invoice.items && invoice.items.length > 0 && (
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-right py-3 text-sm font-medium text-gray-700">الوصف</th>
                      <th className="text-center py-3 text-sm font-medium text-gray-700">الكمية</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-700">السعر</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-700">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 text-sm text-gray-900">{item.description}</td>
                        <td className="py-4 text-sm text-gray-900 text-center font-numbers">
                          {item.quantity}
                        </td>
                        <td className="py-4 text-sm text-gray-900 text-left font-numbers">
                          {formatCurrency(item.unitPrice || item.price)}
                        </td>
                        <td className="py-4 text-sm text-gray-900 text-left font-numbers">
                          {formatCurrency(item.amount || item.quantity * (item.unitPrice || item.price))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">المجموع:</span>
                    <span className="font-numbers text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">الضريبة:</span>
                      <span className="font-numbers text-gray-900">{formatCurrency(tax)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">الخصم:</span>
                      <span className="font-numbers text-error">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                    <span className="font-bold text-gray-900">الإجمالي:</span>
                    <span className="text-xl font-bold text-primary font-numbers">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">ملاحظات:</p>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">سجل النشاط</h3>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'paid' ? 'bg-success' :
                        activity.type === 'sent' ? 'bg-primary' :
                        'bg-gray-300'
                      }`}>
                        {activity.type === 'paid' ? (
                          <Check size={16} className="text-white" />
                        ) : (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className="font-medium text-gray-900">{activity.text}</p>
                      <p className="text-sm text-gray-600 font-numbers">
                        {formatDateTime(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات</h3>
              <div className="space-y-3">
                {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                  <Button
                    fullWidth
                    leftIcon={<Send size={20} />}
                    onClick={handleSendReminder}
                  >
                    إرسال تذكير
                  </Button>
                )}
                
                <Button
                  fullWidth
                  variant="outline"
                  leftIcon={<Copy size={20} />}
                  onClick={handleCopyLink}
                >
                  نسخ رابط الدفع
                </Button>

                <Button
                  fullWidth
                  variant="outline"
                  leftIcon={<FileDown size={20} />}
                >
                  تحميل PDF
                </Button>

                <Button
                  fullWidth
                  variant="outline"
                  leftIcon={<Printer size={20} />}
                >
                  طباعة
                </Button>

                {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                  <Button
                    fullWidth
                    variant="outline"
                    leftIcon={<X size={20} />}
                    onClick={() => setShowCancelModal(true)}
                    className="text-error hover:bg-error/10 border-error"
                  >
                    إلغاء الفاتورة
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إلغاء الفاتورة</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من إلغاء الفاتورة <span className="font-mono font-medium">{invoice.id}</span>؟
              لن يتمكن العميل من دفعها بعد الإلغاء.
            </p>
            <div className="flex gap-3">
              <Button
                fullWidth
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                تراجع
              </Button>
              <Button
                fullWidth
                onClick={handleCancel}
                className="bg-error hover:bg-error/90"
                disabled={isCancelling}
              >
                {isCancelling ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
