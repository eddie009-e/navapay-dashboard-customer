import { useState, useEffect } from 'react';
import { Plus, Copy, QrCode, MoreVertical, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import { paymentLinksService, PaymentLink, CreatePaymentLinkDto } from '../services';

export default function PaymentLinks() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState<PaymentLink | null>(null);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPaymentLinks = async () => {
    setIsLoading(true);
    try {
      const response = await paymentLinksService.list({ limit: 100 });
      setPaymentLinks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch payment links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentLinks();
  }, []);

  const formatCurrency = (amount: number | 'open') => {
    if (amount === 'open') return 'مبلغ مفتوح';
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: PaymentLink['status']) => {
    const badges = {
      active: { text: 'نشط', class: 'bg-success/10 text-success' },
      disabled: { text: 'معطل', class: 'bg-gray-100 text-gray-500' },
      expired: { text: 'منتهي', class: 'bg-error/10 text-error' }
    };
    return badges[status];
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    // Show toast
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">روابط الدفع</h1>
          <Button leftIcon={<Plus size={20} />} onClick={() => setShowCreateModal(true)}>
            رابط جديد
          </Button>
        </div>
      </div>

      {/* Links List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
        <>
        <div className="grid grid-cols-1 gap-4">
          {paymentLinks.map(link => {
            const badge = getStatusBadge(link.status);
            
            return (
              <div
                key={link.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <LinkIcon size={20} className="text-primary" />
                      <h3 className="text-lg font-bold text-gray-900">{link.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                        {badge.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono text-xs">
                        {link.url}
                      </code>
                      <button
                        onClick={() => handleCopyLink(link.url)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="نسخ الرابط"
                      >
                        <Copy size={16} className="text-primary" />
                      </button>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        المبلغ: <span className="font-numbers">{formatCurrency(link.amount)}</span>
                      </span>
                      <span>
                        الاستخدامات: <span className="font-numbers font-medium text-gray-900">{link.usageCount}</span>
                      </span>
                      <span>
                        أُنشئ: {formatDate(link.createdAt)}
                      </span>
                      {link.expiresAt && (
                        <span className="text-warning">
                          ينتهي: {formatDate(link.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowQRModal(link)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="عرض QR"
                    >
                      <QrCode size={20} className="text-primary" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {paymentLinks.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد روابط دفع</h3>
            <p className="text-gray-600 mb-6">أنشئ أول رابط دفع لك لتسهيل تحصيل المدفوعات</p>
            <Button leftIcon={<Plus size={20} />} onClick={() => setShowCreateModal(true)}>
              إنشاء رابط جديد
            </Button>
          </div>
        )}
        </>
        )}
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPaymentLinks();
          }}
        />
      )}

      {/* QR Modal */}
      {showQRModal && (
        <QRModal link={showQRModal} onClose={() => setShowQRModal(null)} />
      )}
    </div>
  );
}

function CreateLinkModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [amountType, setAmountType] = useState<'fixed' | 'open'>('fixed');
  const [amount, setAmount] = useState('');
  const [expiryType, setExpiryType] = useState<'unlimited' | 'date' | 'single'>('unlimited');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data: CreatePaymentLinkDto = {
        name,
        amount: amountType === 'open' ? 'open' : parseFloat(amount),
        expiryType,
        expiresAt: expiryType === 'date' ? expiryDate : undefined
      };
      await paymentLinksService.create(data);
      onSuccess();
    } catch (error) {
      console.error('Failed to create payment link:', error);
      alert('فشل في إنشاء رابط الدفع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 animate-scaleIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">إنشاء رابط دفع جديد</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الرابط <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: دفع الاشتراك الشهري"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع المبلغ</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="amountType"
                  checked={amountType === 'fixed'}
                  onChange={() => setAmountType('fixed')}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">مبلغ ثابت</p>
                  <p className="text-sm text-gray-600">حدد مبلغاً ثابتاً للدفع</p>
                </div>
              </label>
              
              {amountType === 'fixed' && (
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200 font-numbers"
                />
              )}

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="amountType"
                  checked={amountType === 'open'}
                  onChange={() => setAmountType('open')}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">مبلغ مفتوح</p>
                  <p className="text-sm text-gray-600">العميل يحدد المبلغ</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">صلاحية الرابط</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="expiryType"
                  checked={expiryType === 'unlimited'}
                  onChange={() => setExpiryType('unlimited')}
                  className="w-4 h-4 text-primary"
                />
                <span className="font-medium text-gray-900">بلا حد</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="expiryType"
                  checked={expiryType === 'date'}
                  onChange={() => setExpiryType('date')}
                  className="w-4 h-4 text-primary"
                />
                <span className="font-medium text-gray-900">ينتهي بتاريخ</span>
              </label>

              {expiryType === 'date' && (
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
                />
              )}

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="expiryType"
                  checked={expiryType === 'single'}
                  onChange={() => setExpiryType('single')}
                  className="w-4 h-4 text-primary"
                />
                <span className="font-medium text-gray-900">استخدام واحد فقط</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={!name || (amountType === 'fixed' && !amount) || isSubmitting}
            leftIcon={isSubmitting ? <Loader2 className="animate-spin" size={20} /> : undefined}
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الرابط'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function QRModal({ link, onClose }: { link: PaymentLink; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-8 animate-scaleIn text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{link.name}</h3>
        
        {/* QR Code */}
        <div className="bg-white p-6 rounded-xl shadow-inner mb-6 inline-block">
          <div className="w-64 h-64 bg-gray-900 rounded-lg flex items-center justify-center">
            <QrCode size={200} className="text-white" />
          </div>
        </div>

        <p className="text-gray-600 mb-6">امسح الرمز للدفع</p>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth>
            تحميل QR
          </Button>
          <Button variant="outline" fullWidth>
            طباعة
          </Button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-gray-600 hover:text-gray-900 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
