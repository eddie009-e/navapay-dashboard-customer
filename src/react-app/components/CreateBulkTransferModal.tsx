import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from './Button';

interface Recipient {
  id: string;
  name: string;
  phone: string;
  amount: number;
}

interface CreateBulkTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transfer: {
    name: string;
    type: 'payroll' | 'suppliers' | 'refunds' | 'other';
    recipients: Recipient[];
  }) => void;
}

export default function CreateBulkTransferModal({ isOpen, onClose, onSubmit }: CreateBulkTransferModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'payroll' as 'payroll' | 'suppliers' | 'refunds' | 'other'
  });

  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: '', phone: '', amount: 0 }
  ]);

  const [errors, setErrors] = useState({
    name: '',
    recipients: ''
  });

  if (!isOpen) return null;

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { id: Date.now().toString(), name: '', phone: '', amount: 0 }
    ]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id));
    }
  };

  const updateRecipient = (id: string, field: keyof Recipient, value: string | number) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      recipients: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الدفعة مطلوب';
    }

    const validRecipients = recipients.filter(r => 
      r.name.trim() && r.phone.trim() && r.amount > 0
    );

    if (validRecipients.length === 0) {
      newErrors.recipients = 'يجب إضافة مستلم واحد على الأقل بمعلومات صحيحة';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.recipients;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const validRecipients = recipients.filter(r => 
        r.name.trim() && r.phone.trim() && r.amount > 0
      );

      onSubmit({
        name: formData.name,
        type: formData.type,
        recipients: validRecipients
      });

      setFormData({ name: '', type: 'payroll' });
      setRecipients([{ id: '1', name: '', phone: '', amount: 0 }]);
      setErrors({ name: '', recipients: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', type: 'payroll' });
    setRecipients([{ id: '1', name: '', phone: '', amount: 0 }]);
    setErrors({ name: '', recipients: '' });
    onClose();
  };

  const totalAmount = recipients.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const typeLabels = {
    payroll: 'رواتب الموظفين',
    suppliers: 'دفعات الموردين',
    refunds: 'استرجاعات',
    other: 'أخرى'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إنشاء دفعة جماعية</h2>
            <p className="text-sm text-gray-600">أرسل دفعات متعددة في عملية واحدة</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الدفعة <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors ${
                  errors.name ? 'border-error' : 'border-gray-300'
                }`}
                placeholder="مثال: رواتب يناير 2026"
              />
              {errors.name && (
                <p className="text-sm text-error mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الدفعة <span className="text-error">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'payroll' | 'suppliers' | 'refunds' | 'other' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
              >
                <option value="payroll">{typeLabels.payroll}</option>
                <option value="suppliers">{typeLabels.suppliers}</option>
                <option value="refunds">{typeLabels.refunds}</option>
                <option value="other">{typeLabels.other}</option>
              </select>
            </div>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">المستلمون</h3>
                <p className="text-sm text-gray-600">أضف الأشخاص أو الجهات التي ستستلم الدفعات</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                leftIcon={<Plus size={18} />}
                onClick={addRecipient}
              >
                إضافة مستلم
              </Button>
            </div>

            {errors.recipients && (
              <p className="text-sm text-error mb-3">{errors.recipients}</p>
            )}

            <div className="space-y-3">
              {recipients.map((recipient, index) => (
                <div key={recipient.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">مستلم #{index + 1}</h4>
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient.id)}
                        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        الاسم
                      </label>
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors text-sm"
                        placeholder="أدخل الاسم"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        رقم الجوال
                      </label>
                      <input
                        type="tel"
                        value={recipient.phone}
                        onChange={(e) => updateRecipient(recipient.id, 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors text-sm font-numbers"
                        placeholder="09xxxxxxxx"
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        المبلغ (ل.س)
                      </label>
                      <input
                        type="number"
                        value={recipient.amount || ''}
                        onChange={(e) => updateRecipient(recipient.id, 'amount', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors text-sm font-numbers"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">عدد المستلمين</p>
                <p className="text-2xl font-bold text-primary font-numbers">
                  {recipients.filter(r => r.name.trim() && r.phone.trim() && r.amount > 0).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي المبلغ</p>
                <p className="text-2xl font-bold text-primary font-numbers">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">متوسط المبلغ</p>
                <p className="text-2xl font-bold text-primary font-numbers">
                  {formatCurrency(recipients.length > 0 ? totalAmount / recipients.length : 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>تنبيه:</strong> سيتم خصم المبلغ الإجمالي من رصيدك فوراً عند إنشاء الدفعة. 
              تأكد من صحة البيانات قبل المتابعة.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} fullWidth>
              إلغاء
            </Button>
            <Button type="submit" fullWidth>
              إنشاء الدفعة
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
