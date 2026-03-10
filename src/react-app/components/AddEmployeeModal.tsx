import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { branchesService, Branch } from '../services';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: {
    name: string;
    phone: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier' | 'accountant';
    branch: string;
    pin: string;
  }) => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'cashier' as 'admin' | 'manager' | 'cashier' | 'accountant',
    branch: '',
    pin: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    pin: ''
  });

  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchList = await branchesService.list();
        setBranches(branchList);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      }
    };

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      name: '',
      phone: '',
      pin: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!/^09\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الجوال يجب أن يبدأ بـ 09 ويتكون من 10 أرقام';
    }

    if (!formData.pin.trim()) {
      newErrors.pin = 'رمز PIN مطلوب';
    } else if (!/^\d{4,6}$/.test(formData.pin)) {
      newErrors.pin = 'رمز PIN يجب أن يتكون من 4-6 أرقام';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone && !newErrors.pin;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ name: '', phone: '', email: '', role: 'cashier', branch: '', pin: '' });
      setErrors({ name: '', phone: '', pin: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', phone: '', email: '', role: 'cashier', branch: '', pin: '' });
    setErrors({ name: '', phone: '', pin: '' });
    onClose();
  };

  const roleLabels = {
    admin: 'مدير',
    manager: 'مشرف',
    cashier: 'كاشير',
    accountant: 'محاسب'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">إضافة موظف جديد</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors ${
                  errors.name ? 'border-error' : 'border-gray-300'
                }`}
                placeholder="أدخل الاسم الكامل"
              />
              {errors.name && (
                <p className="text-sm text-error mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الجوال <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors font-numbers ${
                  errors.phone ? 'border-error' : 'border-gray-300'
                }`}
                placeholder="09xxxxxxxx"
                maxLength={10}
              />
              {errors.phone && (
                <p className="text-sm text-error mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني <span className="text-gray-400 text-xs">(اختياري)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
                placeholder="example@email.com"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصلاحية <span className="text-error">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'cashier' | 'accountant' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
              >
                <option value="cashier">{roleLabels.cashier}</option>
                <option value="manager">{roleLabels.manager}</option>
                <option value="accountant">{roleLabels.accountant}</option>
                <option value="admin">{roleLabels.admin}</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفرع <span className="text-gray-400 text-xs">(اختياري)</span>
              </label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
              >
                <option value="">بدون فرع محدد</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">يمكن للمحاسبين العمل بدون فرع محدد</p>
            </div>

            {/* PIN */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز PIN للدخول <span className="text-error">*</span>
              </label>
              <input
                type="password"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors font-numbers ${
                  errors.pin ? 'border-error' : 'border-gray-300'
                }`}
                placeholder="أدخل رمز مكون من 4-6 أرقام"
                maxLength={6}
              />
              {errors.pin && (
                <p className="text-sm text-error mt-1">{errors.pin}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">سيستخدم الموظف هذا الرمز لتسجيل الدخول إلى نظام POS</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">معلومات حول الصلاحيات:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>كاشير:</strong> يمكنه إجراء العمليات ورؤية التقارير الأساسية</li>
              <li>• <strong>مشرف:</strong> يمكنه إدارة الموظفين والفروع بالإضافة لصلاحيات الكاشير</li>
              <li>• <strong>محاسب:</strong> يمكنه رؤية كافة التقارير المالية والإحصائيات</li>
              <li>• <strong>مدير:</strong> صلاحيات كاملة في النظام ماعدا حذف المتجر</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} fullWidth>
              إلغاء
            </Button>
            <Button type="submit" fullWidth>
              إضافة الموظف
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
