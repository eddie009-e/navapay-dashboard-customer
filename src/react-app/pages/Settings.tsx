import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Settings as SettingsIcon, User, Store, Shield, Bell, CreditCard, Receipt, Upload, Save, Camera, Lock, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

type Tab = 'profile' | 'store' | 'security' | 'notifications' | 'billing' | 'receipt';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile' as Tab, label: 'الملف الشخصي', icon: User },
    { id: 'store' as Tab, label: 'بيانات المتجر', icon: Store },
    { id: 'security' as Tab, label: 'الأمان', icon: Shield },
    { id: 'notifications' as Tab, label: 'الإشعارات', icon: Bell },
    { id: 'billing' as Tab, label: 'الفواتير والباقة', icon: CreditCard },
    { id: 'receipt' as Tab, label: 'تخصيص الإيصال', icon: Receipt },
  ];

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-lg">
              <SettingsIcon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
              <p className="text-gray-500">إدارة حسابك ومعلومات المتجر</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 hover:bg-primary-50/50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'store' && <StoreSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationsSettings />}
            {activeTab === 'billing' && <BillingSettings />}
            {activeTab === 'receipt' && <ReceiptSettings />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        businessNameAr: formData.name,
        contactEmail: formData.email || undefined,
        contactPhone: formData.phone || undefined,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">الملف الشخصي</h2>
        <p className="text-sm text-gray-500">قم بتحديث معلوماتك الشخصية</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-4xl">
                {formData.name.charAt(0)}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
              <Camera size={16} className="text-gray-600" />
            </button>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">{formData.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{user?.role === 'owner' ? 'مالك' : user?.role === 'admin' ? 'مدير' : 'موظف'}</p>
            <Button variant="outline" size="sm" leftIcon={<Upload size={16} />} disabled className="opacity-50">
              تغيير الصورة (قريباً)
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الجوال
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 font-numbers transition-all"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            leftIcon={isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StoreSettings() {
  const { merchant, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: merchant?.name || '',
    type: merchant?.type || 'retail',
    email: '',
    phone: '',
    address: ''
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        businessNameAr: formData.name,
        businessType: formData.type,
        contactEmail: formData.email || undefined,
        contactPhone: formData.phone || undefined,
        address: formData.address || undefined,
      });
    } catch (error) {
      console.error('Failed to update store:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">بيانات المتجر</h2>
        <p className="text-sm text-gray-500">معلومات متجرك وبيانات الاتصال</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Store Logo */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-primary-50/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-primary-200">
            <Store size={32} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">شعار المتجر</h3>
            <p className="text-sm text-gray-500 mb-2">سيظهر على الإيصالات وروابط الدفع</p>
            <Button variant="outline" size="sm" leftIcon={<Upload size={16} />} disabled className="opacity-50">
              رفع شعار (قريباً)
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المتجر
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع النشاط
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all"
            >
              <option value="retail">تجزئة</option>
              <option value="restaurant">مطعم</option>
              <option value="service">خدمات</option>
              <option value="wholesale">جملة</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 font-numbers transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان
            </label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 text-gray-400" size={20} />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Store ID */}
        <div className="bg-gradient-to-l from-primary-50 to-accent-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">معرف المتجر</p>
              <p className="font-mono text-lg font-bold text-gray-900">{merchant?.id || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">نوع الباقة</p>
              <p className="font-mono text-lg font-bold text-gray-900">{merchant?.plan === 'enterprise' ? 'Enterprise' : 'POS'}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            leftIcon={isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const { showToast } = useToast();
  const [isEndingSessions, setIsEndingSessions] = useState(false);

  const handleEndAllSessions = async () => {
    setIsEndingSessions(true);
    try {
      const { authService } = await import('../services/auth.service');
      const result = await authService.logoutAll();
      showToast('success', `تم إنهاء ${result.terminatedSessions} جلسة`);
      // Redirect to login since all sessions are terminated
      window.location.href = '/login';
    } catch {
      showToast('error', 'فشل في إنه��ء الجلسات');
    } finally {
      setIsEndingSessions(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">الأمان</h2>
        <p className="text-sm text-gray-500">إعدادات الأمان وحماية الحساب</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Change PIN */}
        <div className="p-4 bg-primary-50/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">الرمز السري (PIN)</h3>
              <p className="text-sm text-gray-500">رمز التحقق لتأكيد العمليات المالية</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Lock size={16} />} onClick={() => showToast('info', 'استخدم التطبيق لتغيير الرمز السري')}>
              تغيير
            </Button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 bg-primary-50/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">المصادقة الثنائية</h3>
              <p className="text-sm text-gray-500">حسابك محمي عبر رمز OTP يُرسل برسالة SMS</p>
            </div>
            <span className="px-3 py-1 bg-accent-50 text-accent-700 rounded-lg text-sm font-medium">مُفعّل عبر SMS</span>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-4 bg-primary-50/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">الجلسات النشطة</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndAllSessions}
              disabled={isEndingSessions}
            >
              {isEndingSessions ? 'جاري الإنهاء...' : 'إنهاء الكل'}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            سيتم تسجيل خروجك من جميع الأجهزة
          </p>
        </div>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  const [settings, setSettings] = useState({
    paymentNotifications: true,
    invoiceNotifications: true,
    refundNotifications: true,
    systemNotifications: false,
    emailNotifications: true,
    smsNotifications: false
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Try to fetch saved settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { api } = await import('../services/api');
        const response = await api.get<any>('/notifications/settings');
        if (response.success && response.data) {
          setSettings(prev => ({ ...prev, ...response.data }));
        }
      } catch {
        // Use defaults if endpoint not available
      }
    };
    fetchSettings();
  }, []);

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const { api } = await import('../services/api');
      await api.patch('/notifications/settings', settings);
      showToast('success', 'تم حفظ إعدادات الإشعارات');
    } catch {
      showToast('error', 'فشل في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">الإشعارات</h2>
        <p className="text-sm text-gray-500">تحكم في كيفية تلقي الإشعارات</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Notification Types */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4">أنواع الإشعارات</h3>
          <div className="space-y-3">
            <ToggleSetting
              label="إشعارات الدفع"
              description="تنبيهات عند استلام دفعات جديدة"
              enabled={settings.paymentNotifications}
              onToggle={() => toggle('paymentNotifications')}
            />
            <ToggleSetting
              label="إشعارات الفواتير"
              description="تنبيهات عن الفواتير المستحقة والمدفوعة"
              enabled={settings.invoiceNotifications}
              onToggle={() => toggle('invoiceNotifications')}
            />
            <ToggleSetting
              label="إشعارات الاسترجاع"
              description="تنبيهات عند معالجة عمليات الاسترجاع"
              enabled={settings.refundNotifications}
              onToggle={() => toggle('refundNotifications')}
            />
            <ToggleSetting
              label="إشعارات النظام"
              description="تحديثات وأخبار المنصة"
              enabled={settings.systemNotifications}
              onToggle={() => toggle('systemNotifications')}
            />
          </div>
        </div>

        {/* Notification Channels */}
        <div className="pt-6 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">قنوات الإشعارات</h3>
          <div className="space-y-3">
            <ToggleSetting
              label="البريد الإلكتروني"
              description="إرسال الإشعارات عبر البريد"
              enabled={settings.emailNotifications}
              onToggle={() => toggle('emailNotifications')}
            />
            <ToggleSetting
              label="الرسائل النصية"
              description="إرسال الإشعارات عبر SMS"
              enabled={settings.smsNotifications}
              onToggle={() => toggle('smsNotifications')}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            leftIcon={isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            onClick={handleSaveNotifications}
            disabled={isSaving}
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  const { merchant } = useAuth();
  const currentPlan = merchant?.plan || 'pos';

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">الباقة الحالية</h2>
          <p className="text-sm text-gray-500">معلومات اشتراكك وطرق الدفع</p>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-l from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {currentPlan === 'enterprise' ? 'Enterprise' : 'POS'}
                </h3>
                <p className="text-gray-500">
                  {currentPlan === 'enterprise' ? 'للشركات الكبيرة' : 'للشركات الصغيرة'}
                </p>
              </div>
              <div className="text-left">
                <p className="text-3xl font-bold text-primary font-numbers">$99</p>
                <p className="text-sm text-gray-500">شهرياً</p>
              </div>
            </div>

            {currentPlan === 'pos' ? (
              <Button fullWidth disabled className="opacity-50">
                الترقية إلى Enterprise (قريباً)
              </Button>
            ) : (
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">
                  تاريخ التجديد التالي: <span className="font-bold text-gray-900">1 فبراير 2026</span>
                </p>
                <Button variant="outline" size="sm" disabled className="opacity-50">
                  إلغاء الاشتراك
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">طريقة الدفع</h2>
        </div>

        <div className="p-6">
          <div className="bg-primary-50/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-br from-primary to-primary-400 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-500">تنتهي في 12/26</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled className="opacity-50">
                تعديل
              </Button>
            </div>
          </div>

          <Button variant="outline" fullWidth disabled className="opacity-50">
            إضافة طريقة دفع جديدة (قريباً)
          </Button>
        </div>
      </div>

      {/* Billing History */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">سجل الفواتير</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            { date: '2026-01-01', amount: 99, status: 'paid' },
            { date: '2025-12-01', amount: 99, status: 'paid' },
            { date: '2025-11-01', amount: 99, status: 'paid' },
          ].map((invoice, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-primary-50/20 transition-colors">
              <div>
                <p className="font-bold text-gray-900 font-numbers">
                  {new Date(invoice.date).toLocaleDateString('ar-SY', { year: 'numeric', month: 'long' })}
                </p>
                <p className="text-sm text-gray-500">فاتورة شهرية</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 font-numbers">${invoice.amount}</p>
                <p className="text-sm text-accent-700">مدفوعة</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReceiptSettings() {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    showLogo: true,
    showAddress: true,
    showPhone: true,
    showEmail: false,
    footerText: 'شكراً لتعاملكم معنا',
    showQR: true
  });

  // Try to fetch saved settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { api } = await import('../services/api');
        const response = await api.get<any>('/merchant/receipt-settings');
        if (response.success && response.data) {
          setSettings(prev => ({ ...prev, ...response.data }));
        }
      } catch {
        // Use defaults if endpoint not available
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">تخصيص الإيصال</h2>
          <p className="text-sm text-gray-500">خصص شكل الإيصالات المطبوعة</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">عناصر الإيصال</h3>
            <div className="space-y-3">
              <ToggleSetting
                label="إظهار الشعار"
                enabled={settings.showLogo}
                onToggle={() => setSettings({ ...settings, showLogo: !settings.showLogo })}
              />
              <ToggleSetting
                label="إظهار العنوان"
                enabled={settings.showAddress}
                onToggle={() => setSettings({ ...settings, showAddress: !settings.showAddress })}
              />
              <ToggleSetting
                label="إظهار الهاتف"
                enabled={settings.showPhone}
                onToggle={() => setSettings({ ...settings, showPhone: !settings.showPhone })}
              />
              <ToggleSetting
                label="إظهار البريد الإلكتروني"
                enabled={settings.showEmail}
                onToggle={() => setSettings({ ...settings, showEmail: !settings.showEmail })}
              />
              <ToggleSetting
                label="إظهار رمز QR"
                enabled={settings.showQR}
                onToggle={() => setSettings({ ...settings, showQR: !settings.showQR })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نص التذييل
            </label>
            <textarea
              value={settings.footerText}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all resize-none"
              placeholder="أضف رسالة شكر أو ملاحظة"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              leftIcon={isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  const { api } = await import('../services/api');
                  await api.patch('/merchant/receipt-settings', settings);
                  showToast('success', 'تم حفظ إعدادات الإيصال');
                } catch {
                  showToast('error', 'فشل في حفظ الإعدادات');
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">معاينة</h2>
          <p className="text-sm text-gray-500">شكل الإيصال النهائي</p>
        </div>

        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-xl p-8 font-mono text-sm shadow-sm">
            {/* Logo */}
            {settings.showLogo && (
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary-50 rounded-xl mx-auto flex items-center justify-center mb-2">
                  <Store size={32} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg">اسم المتجر</h3>
              </div>
            )}

            {/* Store Info */}
            <div className="text-center mb-6 space-y-1 text-gray-600">
              {settings.showAddress && <p>عنوان المتجر</p>}
              {settings.showPhone && <p className="font-numbers">+963 XXX XXX XXX</p>}
              {settings.showEmail && <p>email@example.com</p>}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

            {/* Transaction Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span className="font-numbers">2026-01-20</span>
              </div>
              <div className="flex justify-between">
                <span>رقم العملية:</span>
                <span className="font-numbers">TXN-123456</span>
              </div>
              <div className="flex justify-between">
                <span>الطريقة:</span>
                <span>NFC</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

            {/* Amount */}
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>المبلغ:</span>
              <span className="font-numbers">250,000 ل.س</span>
            </div>

            {/* QR Code */}
            {settings.showQR && (
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-400">QR Code</span>
                </div>
              </div>
            )}

            {/* Footer */}
            {settings.footerText && (
              <div className="text-center text-gray-500 mt-4 pt-4 border-t border-gray-200">
                {settings.footerText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, enabled, onToggle }: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-primary-50/20 rounded-xl">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
