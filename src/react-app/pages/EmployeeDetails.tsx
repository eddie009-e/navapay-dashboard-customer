import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import MainLayout from '@/react-app/components/MainLayout';
import { Phone, Mail, Calendar, DollarSign, ShoppingBag, Shield, Lock, Edit, AlertCircle, CheckCircle, Eye, Loader2, X } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { SkeletonTable } from '@/react-app/components/LoadingSpinner';
import { useToast } from '@/react-app/contexts/ToastContext';
import { employeesService, transactionsService, Employee, Transaction } from '../services';

export default function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeTransactions, setEmployeeTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const [employeeData, transactionsData] = await Promise.all([
          employeesService.getById(id),
          transactionsService.list({ employeeId: id, limit: 50 })
        ]);

        setEmployee(employeeData);
        setEmployeeTransactions(transactionsData.data || []);
      } catch (error) {
        console.error('Failed to fetch employee data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-6">
          <SkeletonTable rows={8} />
        </div>
      </MainLayout>
    );
  }

  if (!employee) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الموظف غير موجود</h2>
          <p className="text-gray-500 mb-6">لم يتم العثور على هذا الموظف</p>
          <Link to="/employees">
            <Button>العودة للموظفين</Button>
          </Link>
        </div>
      </MainLayout>
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('ar-SY', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getRoleBadge = (role: Employee['role']) => {
    const badges: Record<string, { text: string; class: string }> = {
      admin: { text: 'مدير', class: 'bg-red-100 text-red-700' },
      manager: { text: 'مشرف', class: 'bg-primary-100 text-primary-700' },
      cashier: { text: 'كاشير', class: 'bg-accent-100 text-accent-700' },
      accountant: { text: 'محاسب', class: 'bg-secondary-100 text-secondary-700' }
    };
    return badges[role] || { text: role, class: 'bg-gray-100 text-gray-700' };
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? { text: 'نشط', class: 'bg-accent-50 text-accent-700', icon: <CheckCircle size={16} /> }
      : { text: 'معلق', class: 'bg-gray-100 text-gray-700', icon: <AlertCircle size={16} /> };
  };

  const roleBadge = getRoleBadge(employee.role);
  const statusBadge = getStatusBadge(employee.isActive);

  // Calculate stats
  const averageTransaction = employeeTransactions.length > 0
    ? employeeTransactions.reduce((sum, t) => sum + t.amount, 0) / employeeTransactions.length
    : 0;

  return (
    <MainLayout>
      <BackButton to="/employees" label="الموظفين" />
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="mb-6">

          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-bold text-3xl">
                    {employee.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{employee.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span className="font-numbers">{employee.phone}</span>
                    </div>
                    {employee.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{employee.email}</span>
                      </div>
                    )}
                    {employee.lastLoginAt && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>آخر دخول: {formatDate(employee.lastLoginAt)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleBadge.class}`}>
                      {roleBadge.text}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                      {statusBadge.icon}
                      {statusBadge.text}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" leftIcon={<Edit size={20} />} onClick={() => {
                  setEditName(employee.name);
                  setIsEditNameOpen(true);
                }}>
                  تعديل البيانات
                </Button>
                <Button
                  variant={employee.isActive ? 'outline' : 'primary'}
                  leftIcon={<Lock size={20} />}
                  onClick={async () => {
                    try {
                      const updated = await employeesService.toggleActive(employee.id, !employee.isActive);
                      setEmployee(updated);
                    } catch (error) {
                      console.error('Failed to toggle status:', error);
                    }
                  }}
                >
                  {employee.isActive ? 'تعليق الحساب' : 'تفعيل الحساب'}
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={20} className="text-primary" />
                  <p className="text-sm text-gray-700">عدد العمليات</p>
                </div>
                <p className="text-3xl font-bold text-primary font-numbers">{employeeTransactions.length}</p>
              </div>

              <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-4 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-accent-700" />
                  <p className="text-sm text-gray-700">إجمالي المبيعات</p>
                </div>
                <p className="text-2xl font-bold text-accent-700 font-numbers">{formatCurrency(employeeTransactions.reduce((sum, t) => sum + t.amount, 0))}</p>
              </div>

              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-accent" />
                  <p className="text-sm text-gray-700">متوسط العملية</p>
                </div>
                <p className="text-xl font-bold text-accent font-numbers">
                  {formatCurrency(averageTransaction)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl p-4 border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={20} className="text-secondary" />
                  <p className="text-sm text-gray-700">الفرع</p>
                </div>
                <p className="text-lg font-bold text-secondary truncate">{employee.branchName || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-primary" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">الصلاحيات والأذونات</h2>
                <p className="text-sm text-gray-500">إدارة ما يمكن للموظف الوصول إليه</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={18} />}
              onClick={() => setIsEditPermissionsOpen(true)}
            >
              تعديل الصلاحيات
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PermissionCard
              title="معالجة المدفوعات"
              description="استقبال الدفعات من العملاء عبر NFC و QR"
              granted={['cashier', 'manager', 'admin'].includes(employee.role)}
            />
            <PermissionCard
              title="إصدار الفواتير"
              description="إنشاء وتعديل فواتير البيع للعملاء"
              granted={['cashier', 'manager', 'admin', 'accountant'].includes(employee.role)}
            />
            <PermissionCard
              title="معالجة الاسترجاعات"
              description="إجراء عمليات استرجاع الأموال للعملاء"
              granted={['manager', 'admin'].includes(employee.role)}
            />
            <PermissionCard
              title="عرض التقارير"
              description="الوصول إلى تقارير المبيعات والإحصائيات"
              granted={['manager', 'admin', 'accountant'].includes(employee.role)}
            />
            <PermissionCard
              title="إدارة الموظفين"
              description="إضافة وتعديل وحذف حسابات الموظفين"
              granted={['admin'].includes(employee.role)}
            />
            <PermissionCard
              title="إدارة الفروع"
              description="إنشاء وتعديل معلومات الفروع"
              granted={['admin'].includes(employee.role)}
            />
            <PermissionCard
              title="إدارة الإعدادات"
              description="تعديل إعدادات المتجر والحساب"
              granted={['admin'].includes(employee.role)}
            />
            <PermissionCard
              title="الدفعات الجماعية"
              description="إنشاء دفعات جماعية للرواتب والموردين"
              granted={['admin', 'accountant'].includes(employee.role)}
            />
          </div>
        </div>

        {/* Security Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={24} className="text-primary" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">الأمان والخصوصية</h2>
              <p className="text-sm text-gray-500">إعدادات الأمان وتسجيل الدخول</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">رقم PIN</p>
                <p className="text-sm text-gray-500">يستخدم لتسجيل الدخول إلى نقطة البيع</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg text-gray-900">****</span>
                <Button variant="outline" size="sm" onClick={() => {
                  setNewPin('');
                  setIsChangePinOpen(true);
                }}>
                  تغيير
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">كلمة المرور</p>
                <p className="text-sm text-gray-500">لتسجيل الدخول إلى لوحة التحكم</p>
              </div>
              <Button variant="outline" size="sm" disabled title="قريباً">
                إعادة تعيين
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">المصادقة الثنائية</p>
                <p className="text-sm text-gray-500">طبقة حماية إضافية للحساب</p>
              </div>
              <Button variant="outline" size="sm" disabled title="قريباً">
                تفعيل
              </Button>
            </div>
          </div>
        </div>

        {/* Activity History */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">سجل النشاط</h2>
            <p className="text-sm text-gray-500">
              عرض <span className="font-bold font-numbers">{employeeTransactions.length}</span> عملية
            </p>
          </div>

          {employeeTransactions.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عمليات</h3>
              <p className="text-gray-500">لم يقم هذا الموظف بأي عمليات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">رقم العملية</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">النوع</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المبلغ</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الطريقة</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employeeTransactions.map((transaction) => {
                    const { date, time } = formatDateTime(transaction.createdAt);

                    return (
                      <tr key={transaction.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.customerName}</p>
                            <p className="text-sm text-gray-500 font-numbers">{transaction.customerPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {transaction.type === 'payment' ? '💰 دفع' : '↩️ استرجاع'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold font-numbers ${
                            transaction.type === 'payment' ? 'text-accent-700' : 'text-error'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary">
                            {transaction.method === 'nfc' ? 'NFC' : transaction.method === 'qr' ? 'QR' : 'جوال'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{date}</p>
                            <p className="text-gray-500 font-numbers">{time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Eye size={16} />}
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            عرض
                          </Button>
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

      {/* Edit Name Modal */}
      {isEditNameOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card bg-white/95 backdrop-blur-xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">تعديل اسم الموظف</h3>
              <button onClick={() => setIsEditNameOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
              placeholder="اسم الموظف"
            />
            <div className="flex gap-3">
              <Button fullWidth onClick={async () => {
                if (editName && editName !== employee.name) {
                  try {
                    const updated = await employeesService.update(employee.id, { name: editName });
                    setEmployee(updated);
                    showToast('success', 'تم تحديث اسم الموظف بنجاح');
                  } catch {
                    showToast('error', 'فشل في تحديث اسم الموظف');
                  }
                }
                setIsEditNameOpen(false);
              }} disabled={!editName.trim()}>
                حفظ
              </Button>
              <Button variant="outline" fullWidth onClick={() => setIsEditNameOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {isChangePinOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card bg-white/95 backdrop-blur-xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">تغيير رقم PIN</h3>
              <button onClick={() => setIsChangePinOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">أدخل رقم PIN الجديد (4 أرقام)</p>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4 text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="----"
              maxLength={4}
              dir="ltr"
            />
            <div className="flex gap-3">
              <Button fullWidth onClick={async () => {
                if (!/^\d{4}$/.test(newPin)) {
                  showToast('error', 'يجب أن يكون PIN مكوناً من 4 أرقام');
                  return;
                }
                try {
                  await employeesService.resetPin(employee.id, newPin);
                  showToast('success', 'تم تغيير رقم PIN بنجاح');
                  setIsChangePinOpen(false);
                } catch {
                  showToast('error', 'فشل في تغيير رقم PIN');
                }
              }} disabled={newPin.length !== 4}>
                تغيير PIN
              </Button>
              <Button variant="outline" fullWidth onClick={() => setIsChangePinOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {isEditPermissionsOpen && (
        <EditPermissionsModal
          employee={employee}
          onClose={() => setIsEditPermissionsOpen(false)}
          onSave={(updated) => setEmployee(updated)}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </MainLayout>
  );
}

function PermissionCard({ title, description, granted }: { title: string; description: string; granted: boolean }) {
  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      granted
        ? 'bg-success/5 border-success/30'
        : 'bg-surface border-gray-100'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          granted ? 'bg-accent-700 text-white' : 'bg-gray-300 text-gray-500'
        }`}>
          {granted ? <CheckCircle size={14} /> : <span className="text-xs">✕</span>}
        </div>
        <div>
          <p className="font-medium text-gray-900 mb-1">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function EditPermissionsModal({ employee, onClose, onSave }: { employee: Employee; onClose: () => void; onSave: (updated: Employee) => void }) {
  const [selectedRole, setSelectedRole] = useState(employee.role);
  const [isSaving, setIsSaving] = useState(false);

  const roles = [
    {
      value: 'admin',
      label: 'مدير',
      description: 'صلاحيات كاملة لإدارة المتجر والموظفين',
      color: 'red'
    },
    {
      value: 'manager',
      label: 'مشرف',
      description: 'إدارة العمليات اليومية والتقارير',
      color: 'primary'
    },
    {
      value: 'cashier',
      label: 'كاشير',
      description: 'معالجة المدفوعات وإصدار الفواتير فقط',
      color: 'accent'
    },
    {
      value: 'accountant',
      label: 'محاسب',
      description: 'الوصول إلى التقارير المالية والدفعات',
      color: 'secondary'
    }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await employeesService.update(employee.id, { role: selectedRole });
      onSave(updated);
      onClose();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-card bg-white/95 backdrop-blur-xl max-w-2xl w-full p-8 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">تعديل الصلاحيات</h3>
            <p className="text-gray-500">{employee.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value as Employee['role'])}
              className={`w-full p-4 rounded-xl border-2 text-right transition-all ${
                selectedRole === role.value
                  ? `border-${role.color}-500 bg-${role.color}-50`
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  selectedRole === role.value
                    ? `border-${role.color}-500 bg-${role.color}-500`
                    : 'border-gray-300'
                }`}>
                  {selectedRole === role.value && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">{role.label}</p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} fullWidth disabled={isSaving}>
            إلغاء
          </Button>
          <Button fullWidth onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TransactionDetailsModal({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
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

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-card bg-white/95 backdrop-blur-xl max-w-2xl w-full p-8 shadow-2xl animate-slideUp">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">تفاصيل العملية</h3>
            <p className="font-mono text-gray-500">{transaction.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">المبلغ</p>
            <p className={`text-4xl font-bold font-numbers ${
              transaction.type === 'payment' ? 'text-accent-700' : 'text-error'
            }`}>
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">اسم العميل</p>
              <p className="font-medium text-gray-900">{transaction.customerName}</p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">رقم الجوال</p>
              <p className="font-medium text-gray-900 font-numbers">{transaction.customerPhone}</p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">طريقة الدفع</p>
              <p className="font-medium text-gray-900">
                {transaction.method === 'nfc' ? 'NFC - تقريب الجوال' :
                 transaction.method === 'qr' ? 'QR - مسح الرمز' :
                 'رقم الجوال'}
              </p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">التاريخ والوقت</p>
              <p className="font-medium text-gray-900 text-sm">{formatDateTime(transaction.createdAt)}</p>
            </div>
          </div>

          <Button variant="outline" fullWidth onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
