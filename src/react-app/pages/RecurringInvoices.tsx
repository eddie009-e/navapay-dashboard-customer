import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Play, Pause, Eye, X, MoreVertical, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import { SkeletonList } from '@/react-app/components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { recurringInvoicesService, RecurringInvoice, CreateRecurringInvoiceDto } from '../services';
import { useToast } from '@/react-app/contexts/ToastContext';

type TabType = 'active' | 'paused' | 'ended';

export default function RecurringInvoices() {
  const { isEnterprise } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecurringInvoices = async () => {
    if (!isEnterprise) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await recurringInvoicesService.list({ limit: 100 });
      setRecurringInvoices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch recurring invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringInvoices();
  }, [isEnterprise]);

  if (!isEnterprise) {
    return <UpgradeModal />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getFrequencyText = (frequency: RecurringInvoice['frequency']) => {
    const texts = {
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      yearly: 'سنوي'
    };
    return texts[frequency];
  };

  const getStatusBadge = (status: RecurringInvoice['status']) => {
    const badges = {
      active: { text: 'نشط', class: 'bg-accent-50 text-accent-700' },
      paused: { text: 'متوقف', class: 'bg-warning/10 text-warning' },
      ended: { text: 'منتهي', class: 'bg-gray-100 text-gray-500' }
    };
    return badges[status];
  };

  const countByStatus = (status: TabType) => {
    return recurringInvoices.filter(inv => inv.status === status).length;
  };

  const filteredInvoices = recurringInvoices.filter(inv => inv.status === activeTab);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'active', label: 'نشطة' },
    { id: 'paused', label: 'متوقفة' },
    { id: 'ended', label: 'منتهية' }
  ];

  return (
    <div className="bg-surface">
      {/* Header */}
      <div className="glass-card mx-4 md:mx-6 mt-4 md:mt-6 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الفواتير الدورية</h1>
            <p className="text-gray-500 mt-1">إنشاء فواتير تلقائية بشكل دوري</p>
          </div>
          <Button leftIcon={<Plus size={20} />} onClick={() => setShowCreateModal(true)}>
            فاتورة دورية جديدة
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({countByStatus(tab.id)})
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-6">
        {isLoading ? (
          <SkeletonList />
        ) : (
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لا توجد فواتير {activeTab === 'active' ? 'نشطة' : activeTab === 'paused' ? 'متوقفة' : 'منتهية'}
              </h3>
              <p className="text-gray-500 mb-6">
                أنشئ فواتير دورية لأتمتة عملية الفوترة
              </p>
              <Button leftIcon={<Plus size={20} />} onClick={() => setShowCreateModal(true)}>
                إنشاء فاتورة دورية
              </Button>
            </div>
          ) : (
            filteredInvoices.map(invoice => {
              const badge = getStatusBadge(invoice.status);

              return (
                <div
                  key={invoice.id}
                  className="glass-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <span className="text-xl">🔄</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{invoice.name}</h3>
                          <p className="text-sm text-gray-500">{invoice.customerName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${badge.class}`}>
                          {badge.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                        <div>
                          <span className="text-gray-500">المبلغ: </span>
                          <span className="font-bold text-gray-900 font-numbers">
                            {formatCurrency(invoice.amount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">التكرار: </span>
                          <span className="font-medium text-gray-900">
                            {getFrequencyText(invoice.frequency)}
                          </span>
                        </div>
                        {invoice.status === 'active' && (
                          <div>
                            <span className="text-gray-500">الفاتورة القادمة: </span>
                            <span className="font-medium text-primary">
                              {formatDate(invoice.nextDate)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">بدأت: </span>
                          <span className="font-medium text-gray-900">
                            {formatDate(invoice.startDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {invoice.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Pause size={16} />}
                          onClick={async () => {
                            try {
                              await recurringInvoicesService.pause(invoice.id);
                              fetchRecurringInvoices();
                            } catch (error) {
                              console.error('Failed to pause:', error);
                            }
                          }}
                        >
                          إيقاف
                        </Button>
                      )}
                      {invoice.status === 'paused' && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Play size={16} />}
                          onClick={async () => {
                            try {
                              await recurringInvoicesService.resume(invoice.id);
                              fetchRecurringInvoices();
                            } catch (error) {
                              console.error('Failed to resume:', error);
                            }
                          }}
                        >
                          استئناف
                        </Button>
                      )}
                      <Button size="sm" variant="outline" leftIcon={<Eye size={16} />} onClick={() => navigate(`/invoices/recurring/${invoice.id}`)}>
                        عرض
                      </Button>
                      <button className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors">
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRecurringInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchRecurringInvoices();
          }}
        />
      )}
    </div>
  );
}

function CreateRecurringInvoiceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sendAuto, setSendAuto] = useState(true);
  const [reminder, setReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data: CreateRecurringInvoiceDto = {
        name,
        customerId,
        amount: parseFloat(amount),
        frequency,
        startDate,
        endDate: endDate || undefined,
        sendAuto,
        sendReminder: reminder
      };
      await recurringInvoicesService.create(data);
      onSuccess();
    } catch {
      showToast('error', 'فشل في إنشاء الفاتورة الدورية');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card bg-white/95 backdrop-blur-xl max-w-2xl w-full p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">إنشاء فاتورة دورية جديدة</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الفاتورة <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: اشتراك صيانة شهري"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العميل <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="ابحث عن عميل أو أدخل رقم الجوال"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ <span className="text-error">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:border-primary focus:ring-2 focus:ring-primary/10 font-numbers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التكرار <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(freq => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    frequency === freq
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {freq === 'daily' ? 'يومي' :
                   freq === 'weekly' ? 'أسبوعي' :
                   freq === 'monthly' ? 'شهري' : 'سنوي'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ البدء <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الانتهاء (اختياري)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-surface rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendAuto}
                onChange={(e) => setSendAuto(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">إرسال تلقائي للعميل</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reminder}
                onChange={(e) => setReminder(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">تذكير قبل الاستحقاق</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={!name || !customerId || !amount || !startDate || isSubmitting}
            leftIcon={isSubmitting ? <Loader2 className="animate-spin" size={20} /> : undefined}
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UpgradeModal() {
  return (
    <div className="bg-surface flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-8 text-center">
        <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔒</span>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          الفواتير الدورية متاحة في باقة Enterprise
        </h2>

        <p className="text-gray-500 mb-8">
          قم بالترقية إلى باقة Enterprise للحصول على الفواتير الدورية وميزات متقدمة أخرى
        </p>

        {/* Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-gray-100 rounded-xl p-6 text-right">
            <h3 className="text-lg font-bold text-gray-900 mb-4">باقة POS</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✓ نقطة البيع</p>
              <p>✓ 50 فاتورة/شهر</p>
              <p>✓ روابط الدفع</p>
              <p>✓ التقارير الأساسية</p>
              <p className="text-gray-400">✗ الفواتير الدورية</p>
              <p className="text-gray-400">✗ الموظفين والفروع</p>
            </div>
          </div>

          <div className="border-2 border-primary rounded-xl p-6 text-right bg-primary/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">باقة Enterprise</h3>
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-lg">موصى به</span>
            </div>
            <div className="space-y-2 text-sm text-gray-900">
              <p>✓ كل ميزات POS</p>
              <p>✓ فواتير غير محدودة</p>
              <p>✓ الفواتير الدورية</p>
              <p>✓ الموظفين والصلاحيات</p>
              <p>✓ الفروع المتعددة</p>
              <p>✓ التقارير المتقدمة</p>
              <p>✓ API Access</p>
            </div>
            <div className="mt-6 p-4 bg-white rounded-xl">
              <p className="text-2xl font-bold text-primary mb-1">500,000 ل.س/شهر</p>
              <p className="text-xs text-gray-500">تُدفع سنوياً</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            العودة
          </Button>
          <Button size="lg" className="px-8 opacity-50" disabled>
            ترقية للـ Enterprise (قريباً)
          </Button>
        </div>
      </div>
    </div>
  );
}
