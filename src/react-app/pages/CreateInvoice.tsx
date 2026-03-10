import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Send, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { invoicesService } from '../services';
import { useAuth } from '../contexts/AuthContext';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { merchant } = useAuth();
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, price: 0 }
  ]);
  const [dueDate, setDueDate] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [sendReminder, setSendReminder] = useState(true);
  const [sendNow, setSendNow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.1; // 10% tax example
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  };

  const addItem = () => {
    if (items.length < 20) {
      setItems([...items, { description: '', quantity: 1, price: 0 }]);
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (_asDraft: boolean = false) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const invoiceData = {
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        tax: tax,
        discount: discount || undefined,
        dueDate,
        notes: notes || undefined,
        sendReminder,
      };

      await invoicesService.create(invoiceData);
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('فشل في إنشاء الفاتورة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, tax, total } = calculateTotal();
  const invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton to="/invoices" label="الفواتير" />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">إنشاء فاتورة جديدة</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">تفاصيل الفاتورة</h2>

            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">معلومات العميل</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الجوال <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200 font-numbers"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العميل <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أحمد محمد"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">بنود الفاتورة</h3>
                <button
                  onClick={addItem}
                  disabled={items.length >= 20}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  إضافة بند
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="الوصف"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200 text-sm"
                    />
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="الكمية"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200 text-sm font-numbers"
                      min="1"
                    />
                    <input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                      placeholder="السعر"
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200 text-sm font-numbers"
                      min="0"
                    />
                    <div className="w-28 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-numbers text-gray-700 flex items-center">
                      {formatCurrency(item.quantity * item.price)}
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الاستحقاق <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الخصم (اختياري)
                </label>
                <input
                  type="number"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200 font-numbers"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="أضف ملاحظات للفاتورة..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendReminder}
                  onChange={(e) => setSendReminder(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">إرسال تذكير تلقائي قبل الاستحقاق بيوم</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendNow}
                  onChange={(e) => setSendNow(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">إرسال الفاتورة فوراً للعميل عند الإنشاء</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || !customerPhone || !customerName || !dueDate || items.some(i => !i.description || i.price === 0)}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'حفظ كمسودة'}
              </Button>
              <Button
                fullWidth
                onClick={() => handleSubmit(false)}
                leftIcon={isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                disabled={isSubmitting || !customerPhone || !customerName || !dueDate || items.some(i => !i.description || i.price === 0)}
              >
                إنشاء وإرسال
              </Button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 sticky top-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">معاينة الفاتورة</h2>

            {/* Invoice Preview */}
            <div className="border-2 border-gray-200 rounded-lg p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-white">NP</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{merchant?.name || 'اسم المتجر'}</h3>
                  <p className="text-sm text-gray-600">{merchant?.address || 'العنوان'}</p>
                  <p className="text-sm text-gray-600 font-numbers">{merchant?.phone || 'رقم الهاتف'}</p>
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">فاتورة</h2>
                  <p className="text-sm text-gray-600">{invoiceNumber}</p>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('ar-SY')}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">إلى:</h4>
                <p className="font-medium text-gray-900">{customerName || 'اسم العميل'}</p>
                <p className="text-sm text-gray-600 font-numbers">{customerPhone || 'رقم الجوال'}</p>
              </div>

              {/* Items Table */}
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-2 text-sm font-medium text-gray-700">الوصف</th>
                    <th className="text-center py-2 text-sm font-medium text-gray-700">الكمية</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-700">السعر</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-700">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">
                        {item.description || `بند ${index + 1}`}
                      </td>
                      <td className="py-3 text-sm text-gray-900 text-center font-numbers">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-sm text-gray-900 text-left font-numbers">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 text-sm text-gray-900 text-left font-numbers">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المجموع:</span>
                  <span className="font-numbers text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الضريبة (10%):</span>
                  <span className="font-numbers text-gray-900">{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الخصم:</span>
                    <span className="font-numbers text-error">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">الإجمالي:</span>
                  <span className="text-xl font-bold text-primary font-numbers">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              <div className="p-4 bg-warning/10 rounded-lg mb-4">
                <p className="text-sm">
                  <span className="font-medium">تاريخ الاستحقاق: </span>
                  <span className="font-numbers">{dueDate || 'لم يُحدد بعد'}</span>
                </p>
              </div>

              {/* Notes */}
              {notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{notes}</p>
                </div>
              )}

              {/* Payment Button Preview */}
              <button className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-600 transition-colors">
                ادفع الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
