import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Loader2, Phone, DollarSign, X } from 'lucide-react';

import { useToast } from '@/react-app/contexts/ToastContext';
import { remindersService } from '@/react-app/services/reminders.service';
import type { Reminder, CreateReminderDto } from '@/react-app/services/reminders.service';

export default function Reminders() {
  const { showToast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState<CreateReminderDto>({
    customerPhone: '',
    amount: 0,
    message: '',
  });

  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await remindersService.list({ limit: 50, status: filter !== 'all' ? filter : undefined });
      if (res && res.reminders) {
        setReminders(res.reminders);
      } else if (Array.isArray(res)) {
        setReminders(res);
      }
    } catch {
      setError('فشل في جلب التذكيرات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [filter]);

  const handleCreate = async () => {
    if (!form.customerPhone || !form.amount) return;
    setCreating(true);
    try {
      await remindersService.create(form);
      setShowCreate(false);
      setForm({ customerPhone: '', amount: 0, message: '' });
      fetchReminders();
    } catch {
      showToast('error', 'فشل في إنشاء التذكير');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا التذكير؟')) return;
    try {
      await remindersService.cancel(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch {
      showToast('error', 'فشل في إلغاء التذكير');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">قيد الانتظار</span>;
      case 'sent': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">تم الإرسال</span>;
      case 'paid': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">مدفوع</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">ملغى</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">{status}</span>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-7 h-7 text-primary" />
              تذكيرات الدفع
            </h1>
            <p className="text-gray-500 mt-1">إرسال تذكيرات للعملاء بالمبالغ المستحقة</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-green-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            تذكير جديد
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'pending', 'sent', 'paid', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'الكل' : s === 'pending' ? 'قيد الانتظار' : s === 'sent' ? 'مرسل' : s === 'paid' ? 'مدفوع' : 'ملغى'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد تذكيرات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map(r => (
              <div key={r.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{r.customerName || r.customerPhone}</p>
                      <p className="text-sm text-gray-500">{r.customerPhone}</p>
                      {r.message && <p className="text-xs text-gray-400 mt-1">{r.message}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{formatCurrency(r.amount)}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('ar-SY')}</p>
                    </div>
                    {getStatusBadge(r.status)}
                    {(r.status === 'pending' || r.status === 'sent') && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                        title="إلغاء"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">تذكير دفع جديد</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم هاتف العميل</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                      placeholder="09xxxxxxxx"
                      className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ل.س)</label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={form.amount || ''}
                      onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رسالة (اختياري)</label>
                  <textarea
                    value={form.message || ''}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="رسالة للعميل..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  disabled={!form.customerPhone || !form.amount || creating}
                  className="flex-1 py-2 bg-primary text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  إرسال التذكير
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
