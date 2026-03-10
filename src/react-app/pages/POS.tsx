import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { RotateCcw, FileText, QrCode, History, Monitor } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { posService, POSPaymentSession, RecentCustomer } from '../services';

type PaymentMethod = 'nfc' | 'qr-scan' | 'qr-display' | 'phone' | null;

export default function POS() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('0');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);

  const formatAmount = (value: string) => {
    const num = parseInt(value) || 0;
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  const handleNumberClick = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else if (amount.length < 10) {
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    if (amount.length === 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleClear = () => {
    setAmount('0');
  };

  const handleCollect = () => {
    if (amount === '0') return;
    setShowPaymentMethods(true);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  if (showPaymentMethods && !paymentMethod) {
    return <PaymentMethodSelection amount={amount} onSelect={handlePaymentMethodSelect} onBack={() => setShowPaymentMethods(false)} />;
  }

  if (paymentMethod === 'nfc') {
    return <NFCPayment amount={amount} onBack={() => setPaymentMethod(null)} onSuccess={() => navigate('/pos/success')} />;
  }

  if (paymentMethod === 'qr-scan') {
    return <QRScanPayment amount={amount} onBack={() => setPaymentMethod(null)} onSuccess={() => navigate('/pos/success')} />;
  }

  if (paymentMethod === 'qr-display') {
    return <QRDisplayPayment amount={amount} onBack={() => setPaymentMethod(null)} onSuccess={() => navigate('/pos/success')} />;
  }

  if (paymentMethod === 'phone') {
    return <PhonePayment amount={amount} onBack={() => setPaymentMethod(null)} onSuccess={() => navigate('/pos/success')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white p-4">
      <BackButton to="/" label="الرئيسية" />
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">نقطة البيع</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/pos/customer-display', '_blank')}
              className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
              title="شاشة العميل"
            >
              <Monitor size={22} />
            </button>
            <button
              onClick={() => navigate('/pos/history')}
              className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
              title="السجل"
            >
              <History size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Main POS Interface */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Amount Display */}
          <div className="bg-gradient-to-r from-primary to-primary-600 p-8 text-center">
            <p className="text-white/80 text-sm mb-2">المبلغ المطلوب</p>
            <p className="text-white text-5xl md:text-6xl font-bold font-numbers mb-2">
              {formatAmount(amount)}
            </p>
            <p className="text-white/80 text-lg">ليرة سورية</p>
          </div>

          {/* Numpad */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-2xl font-bold text-gray-800 transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={handleClear}
                className="h-16 bg-error/10 hover:bg-error/20 active:bg-error/30 rounded-xl text-lg font-bold text-error transition-colors"
              >
                C
              </button>
              <button
                onClick={() => handleNumberClick('0')}
                className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-2xl font-bold text-gray-800 transition-colors"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-xl font-bold text-gray-800 transition-colors"
              >
                ⌫
              </button>
            </div>

            {/* Collect Button */}
            <Button
              fullWidth
              size="lg"
              onClick={handleCollect}
              disabled={amount === '0'}
              className="h-14 text-xl"
            >
              تحصيل المبلغ
            </Button>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              <button className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <RotateCcw size={20} className="text-primary" />
                <span className="text-xs font-medium text-gray-700">استرجاع</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <FileText size={20} className="text-primary" />
                <span className="text-xs font-medium text-gray-700">فاتورة</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <QrCode size={20} className="text-primary" />
                <span className="text-xs font-medium text-gray-700">QR ثابت</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <History size={20} className="text-primary" />
                <span className="text-xs font-medium text-gray-700">آخر عملية</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Method Selection Component
function PaymentMethodSelection({ amount, onSelect, onBack }: { amount: string; onSelect: (method: PaymentMethod) => void; onBack: () => void }) {
  const formatAmount = (value: string) => {
    const num = parseInt(value) || 0;
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  const methods = [
    {
      id: 'nfc' as PaymentMethod,
      icon: '📱',
      title: 'NFC - تقريب الجوال',
      description: 'قرّب جوال العميل من الجهاز'
    },
    {
      id: 'qr-scan' as PaymentMethod,
      icon: '📷',
      title: 'مسح QR العميل',
      description: 'امسح رمز الدفع من تطبيق العميل'
    },
    {
      id: 'qr-display' as PaymentMethod,
      icon: '⬛',
      title: 'عرض QR للعميل',
      description: 'العميل يمسح الرمز من جواله'
    },
    {
      id: 'phone' as PaymentMethod,
      icon: '🔢',
      title: 'رقم الجوال',
      description: 'أدخل رقم جوال العميل للتحصيل'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Amount Display */}
          <div className="bg-gradient-to-r from-primary to-primary-600 p-6 text-center">
            <p className="text-white/80 text-sm mb-1">المبلغ المطلوب</p>
            <p className="text-white text-4xl font-bold font-numbers">
              {formatAmount(amount)} ل.س
            </p>
          </div>

          {/* Payment Methods */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">اختر طريقة الدفع</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => onSelect(method.id)}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-primary hover:bg-primary-50 rounded-xl transition-all text-right"
                >
                  <div className="text-4xl">{method.icon}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">{method.title}</p>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <Button variant="outline" fullWidth onClick={onBack}>
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// NFC Payment Component
function NFCPayment({ amount, onBack, onSuccess }: { amount: string; onBack: () => void; onSuccess: () => void }) {
  const [session, setSession] = useState<POSPaymentSession | null>(null);

  const formatAmount = (value: string) => {
    const num = parseInt(value) || 0;
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  useEffect(() => {
    const createSession = async () => {
      try {
        const paymentSession = await posService.createPaymentSession({
          amount: parseInt(amount),
          method: 'nfc'
        });
        setSession(paymentSession);
      } catch (error) {
        console.error('Failed to create NFC session:', error);
      }
    };

    createSession();
  }, [amount]);

  useEffect(() => {
    if (!session) return;

    const checkStatus = async () => {
      try {
        const updated = await posService.checkSessionStatus(session.id);
        if (updated.status === 'completed') {
          onSuccess();
        } else if (updated.status === 'failed' || updated.status === 'expired') {
          onBack();
        }
      } catch (error) {
        console.error('Failed to check session status:', error);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [session, onSuccess, onBack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md animate-scaleIn">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">{formatAmount(amount)} ل.س</p>
          
          {/* NFC Animation */}
          <div className="my-8 relative">
            <div className="w-32 h-32 mx-auto bg-primary-100 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 bg-primary-200 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-3xl">📱</span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-4 border-primary rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">قرّب جوال العميل من الجهاز</h2>
          <p className="text-gray-600 mb-8 flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            بانتظار الاتصال...
          </p>

          <Button variant="outline" fullWidth onClick={onBack}>
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}

// QR Scan Payment Component
function QRScanPayment({ amount, onBack }: { amount: string; onBack: () => void; onSuccess: () => void }) {
  const formatAmount = (value: string) => {
    const num = parseInt(value) || 0;
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md animate-scaleIn">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <p className="text-xl font-bold text-gray-900 mb-6 text-center">{formatAmount(amount)} ل.س</p>
          
          {/* Camera Preview */}
          <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-6 aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-white rounded-lg">
                {/* Scan line animation */}
                <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-pulse"></div>
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm">وجّه الكاميرا نحو QR العميل</p>
            </div>
          </div>

          <Button variant="outline" fullWidth onClick={onBack}>
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}

// QR Display Payment Component
function QRDisplayPayment({ amount, onBack, onSuccess }: { amount: string; onBack: () => void; onSuccess: () => void }) {
  const [timer, setTimer] = useState(300); // 5 minutes
  const [session, setSession] = useState<POSPaymentSession | null>(null);
  const [_isLoading, setIsLoading] = useState(true);

  const formatAmount = (value: string) => {
    const num = parseInt(value) || 0;
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    const createSession = async () => {
      try {
        const paymentSession = await posService.createPaymentSession({
          amount: parseInt(amount),
          method: 'qr'
        });
        setSession(paymentSession);
      } catch (error) {
        console.error('Failed to create QR session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    createSession();
  }, [amount]);

  useEffect(() => {
    if (!session) return;

    const checkStatus = async () => {
      try {
        const updated = await posService.checkSessionStatus(session.id);
        if (updated.status === 'completed') {
          onSuccess();
        } else if (updated.status === 'failed' || updated.status === 'expired') {
          onBack();
        }
      } catch (error) {
        console.error('Failed to check session status:', error);
      }
    };

    const statusInterval = setInterval(checkStatus, 2000);
    const countdownInterval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(countdownInterval);
    };
  }, [session, onSuccess, onBack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md animate-scaleIn">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-3xl font-bold text-gray-900 mb-6 font-numbers">{formatAmount(amount)} ل.س</p>
          
          {/* QR Code */}
          <div className="bg-white p-6 rounded-xl shadow-inner mb-6 inline-block">
            <div className="w-64 h-64 bg-gray-900 rounded-lg flex items-center justify-center">
              <QrCode size={200} className="text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">امسح الرمز من تطبيق NavaPay</h2>
          <p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            بانتظار الدفع...
          </p>

          <div className={`text-lg font-bold font-numbers mb-6 ${timer < 60 ? 'text-error' : 'text-gray-600'}`}>
            ينتهي خلال {formatTime(timer)}
          </div>

          <Button variant="outline" fullWidth onClick={onBack}>
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}

// Phone Payment Component
function PhonePayment({ amount, onBack, onSuccess }: { amount: string; onBack: () => void; onSuccess: () => void }) {
  const [phone, setPhone] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [session, setSession] = useState<POSPaymentSession | null>(null);
  const [_customerName, setCustomerName] = useState('');

  const formatAmount = (value: string) => {
    const num = parseInt(value) || 0;
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  useEffect(() => {
    const fetchRecentCustomers = async () => {
      try {
        const customers = await posService.getRecentCustomers(5);
        setRecentCustomers(customers);
      } catch (error) {
        console.error('Failed to fetch recent customers:', error);
      }
    };

    fetchRecentCustomers();
  }, []);

  useEffect(() => {
    if (!session) return;

    const checkStatus = async () => {
      try {
        const updated = await posService.checkSessionStatus(session.id);
        if (updated.status === 'completed') {
          onSuccess();
        } else if (updated.status === 'failed' || updated.status === 'expired') {
          setIsWaiting(false);
          setSession(null);
        }
      } catch (error) {
        console.error('Failed to check session status:', error);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [session, onSuccess]);

  const handleSubmit = async () => {
    setIsWaiting(true);
    try {
      const paymentSession = await posService.createPaymentSession({
        amount: parseInt(amount),
        method: 'phone',
        customerPhone: phone
      });
      setSession(paymentSession);
    } catch (error) {
      console.error('Failed to create payment session:', error);
      setIsWaiting(false);
    }
  };

  const handleSelectCustomer = (customer: RecentCustomer) => {
    setPhone(customer.phone);
    setCustomerName(customer.name);
  };

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white p-4 flex items-center justify-center">
        <div className="w-full max-w-md animate-scaleIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-6 font-numbers">{formatAmount(amount)} ل.س</p>
            
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-3xl">📱</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">بانتظار الدفع من</h2>
            <p className="text-lg text-gray-700 mb-1">أحمد محمد</p>
            <p className="text-gray-600 font-numbers mb-4">{phone}</p>
            <p className="text-sm text-success mb-6">تم إرسال إشعار للعميل</p>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth>إعادة إرسال</Button>
              <Button variant="outline" fullWidth onClick={onBack}>إلغاء</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <p className="text-2xl font-bold text-gray-900 mb-6 text-center font-numbers">{formatAmount(amount)} ل.س</p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم جوال العميل</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200 font-numbers text-lg"
              dir="ltr"
            />
          </div>

          {recentCustomers.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">أو اختر من العملاء السابقين</p>
              <div className="space-y-2">
                {recentCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 hover:border-primary hover:bg-primary-50 rounded-lg transition-all text-right"
                  >
                    <span className="font-medium text-gray-900">{customer.name}</span>
                    <span className="text-gray-600 font-numbers text-sm">{customer.phone}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onBack}>إلغاء</Button>
            <Button fullWidth onClick={handleSubmit} disabled={!phone}>طلب الدفع</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
