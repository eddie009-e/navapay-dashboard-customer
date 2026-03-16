import { useState, useEffect } from 'react';
import { Activity, Loader2, RefreshCw, Monitor, Smartphone, Globe } from 'lucide-react';
import MainLayout from '@/react-app/components/MainLayout';
import { api } from '@/react-app/services/api';

interface ActivityItem {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface ActivityResponse {
  activities: ActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const translateAction = (action: string): string => {
  const translations: Record<string, string> = {
    login: 'تسجيل دخول',
    logout: 'تسجيل خروج',
    transfer_created: 'إنشاء تحويل',
    transfer_completed: 'تحويل مكتمل',
    invoice_created: 'إنشاء فاتورة',
    invoice_paid: 'فاتورة مدفوعة',
    password_changed: 'تغيير كلمة المرور',
    pin_changed: 'تغيير رمز PIN',
    profile_updated: 'تحديث الملف الشخصي',
    device_added: 'إضافة جهاز جديد',
    bank_account_added: 'إضافة حساب بنكي',
    kyc_submitted: 'تقديم طلب KYC',
    card_created: 'إنشاء بطاقة',
    card_frozen: 'تجميد بطاقة',
    pos_payment: 'دفعة نقطة بيع',
  };
  return translations[action] || action;
};

const getDeviceIcon = (userAgent?: string) => {
  if (!userAgent) return <Globe className="w-4 h-4" />;
  const lower = userAgent.toLowerCase();
  if (lower.includes('android') || lower.includes('iphone') || lower.includes('mobile')) {
    return <Smartphone className="w-4 h-4" />;
  }
  return <Monitor className="w-4 h-4" />;
};

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivity = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<ActivityResponse>('/users/activity', { page: p, limit: 30 });
      if (res && res.activities) {
        setActivities(res.activities);
        setTotalPages(res.pagination?.totalPages || 1);
      } else if (Array.isArray(res)) {
        setActivities(res);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivity(page); }, [page]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-7 h-7 text-primary" />
              سجل النشاط
            </h1>
            <p className="text-gray-500 mt-1">تتبع جميع الأنشطة على حسابك</p>
          </div>
          <button
            onClick={() => fetchActivity(page)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        {/* Activity List */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد أنشطة مسجلة</p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {activities.map(item => {
                const { date, time } = formatDate(item.createdAt);
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-primary-50/20 transition">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      {getDeviceIcon(item.userAgent)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{translateAction(item.action)}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        {item.ipAddress && <span className="font-mono">{item.ipAddress}</span>}
                        {item.entityType && <span>{item.entityType}</span>}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">{time}</p>
                      <p className="text-xs text-gray-400">{date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 bg-gray-100 rounded-xl text-sm disabled:opacity-50 hover:bg-gray-200 transition"
            >
              السابق
            </button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-gray-100 rounded-xl text-sm disabled:opacity-50 hover:bg-gray-200 transition"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
