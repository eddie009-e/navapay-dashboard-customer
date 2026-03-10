import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '@/react-app/hooks/useLoading';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: { name: string; phone: string; email: string }) => void;
}

export default function AddCustomerModal({ isOpen, onClose, onSubmit }: AddCustomerModalProps) {
  const { isLoading, withLoading } = useLoading();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: ''
  });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      name: '',
      phone: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!/^09\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الجوال يجب أن يبدأ بـ 09 ويتكون من 10 أرقام';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await withLoading(
        new Promise((resolve) => {
          setTimeout(() => {
            onSubmit(formData);
            setFormData({ name: '', phone: '', email: '' });
            setErrors({ name: '', phone: '' });
            onClose();
            resolve(undefined);
          }, 500);
        })
      );
    }
  };

  const handleClose = () => {
    setFormData({ name: '', phone: '', email: '' });
    setErrors({ name: '', phone: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">إضافة عميل جديد</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
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

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} fullWidth disabled={isLoading}>
              إلغاء
            </Button>
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" color="text-white" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                'إضافة العميل'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
