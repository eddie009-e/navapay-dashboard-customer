import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { employeesService, Employee } from '../services';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (branch: {
    name: string;
    address: string;
    phone: string;
    manager: string;
  }) => void;
}

export default function AddBranchModal({ isOpen, onClose, onSubmit }: AddBranchModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeesService.list({ limit: 100 });
        setEmployees(response.data || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };

    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      name: '',
      address: '',
      phone: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الفرع مطلوب';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^09\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.address && !newErrors.phone;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ name: '', address: '', phone: '', manager: '' });
      setErrors({ name: '', address: '', phone: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', address: '', phone: '', manager: '' });
    setErrors({ name: '', address: '', phone: '' });
    onClose();
  };

  // Get available managers (admin or manager role employees)
  const availableManagers = employees.filter(e =>
    ['admin', 'manager'].includes(e.role) && e.isActive
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إضافة فرع جديد</h2>
            <p className="text-sm text-gray-600">أضف معلومات الفرع الجديد</p>
          </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الفرع <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors ${
                  errors.name ? 'border-error' : 'border-gray-300'
                }`}
                placeholder="مثال: فرع دمشق"
              />
              {errors.name && (
                <p className="text-sm text-error mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف <span className="text-error">*</span>
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
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors ${
                errors.address ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="مثال: دمشق - المزة - شارع الجلاء"
            />
            {errors.address && (
              <p className="text-sm text-error mt-1">{errors.address}</p>
            )}
          </div>

          {/* Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدير المسؤول (اختياري)
            </label>
            <select
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
            >
              <option value="">بدون مدير</option>
              {availableManagers.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} - {emp.role === 'admin' ? 'مدير' : 'مشرف'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              يمكنك تعيين مدير أو مشرف لإدارة هذا الفرع
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>ملاحظة:</strong> سيتم إنشاء الفرع بحالة نشطة. يمكنك إضافة موظفين للفرع بعد الإنشاء من صفحة الموظفين.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} fullWidth>
              إلغاء
            </Button>
            <Button type="submit" fullWidth>
              إضافة الفرع
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
