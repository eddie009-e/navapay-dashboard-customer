import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  RotateCcw, FileText, QrCode, History, Monitor,
  Smartphone, Wifi, Camera, Phone, Loader2, Delete,
  User, Clock, SendHorizontal, Scan
} from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { posService, POSPaymentSession, RecentCustomer } from '../services';

type PaymentMethod = 'unified' | 'qr-scan' | 'phone' | null;

export default function POS() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('0');
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
    setPaymentMethod('unified');
  };

  // Unified payment → NFC + QR (default)
  if (paymentMethod === 'unified') {
    return (
      <UnifiedPayment
        amount={amount}
        onBack={() => setPaymentMethod(null)}
        onSuccess={() => navigate('/pos/success')}
        onSwitchMethod={(method: 'qr-scan' | 'phone') => setPaymentMethod(method)}
      />
    );
  }

  // QR Scan → camera to scan customer's QR
  if (paymentMethod === 'qr-scan') {
    return <QRScanPayment amount={amount} onBack={() => setPaymentMethod('unified')} onSuccess={() => navigate('/pos/success')} />;
  }

  // Phone → enter customer phone number
  if (paymentMethod === 'phone') {
    return <PhonePayment amount={amount} onBack={() => setPaymentMethod('unified')} onSuccess={() => navigate('/pos/success')} />;
  }

  return (
    <div className="bg-surface p-4">
      <BackButton to="/" label="الرئيسية" />
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">نقطة البيع</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/pos/customer-display', '_blank')}
              className="p-2.5 text-primary hover:bg-primary-50 rounded-xl transition-colors"
              title="شاشة العميل"
            >
              <Monitor size={22} />
            </button>
            <button
              onClick={() => navigate('/pos/history')}
              className="p-2.5 text-primary hover:bg-primary-50 rounded-xl transition-colors"
              title="السجل"
            >
              <History size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Main POS Interface */}
      <div className="max-w-2xl mx-auto">
        <div className="glass-card overflow-hidden shadow-glass">
          {/* Amount Display */}
          <div className="bg-gradient-to-l from-primary-800 via-primary to-primary-400 p-8 md:p-10 text-center relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-15%] w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[150px] h-[150px] bg-white/5 rounded-full blur-2xl" />

            <p className="text-white/60 text-sm font-medium mb-3 tracking-wide relative z-10">المبلغ المطلوب</p>
            <div className="relative z-10">
              <p className={`text-white font-bold font-numbers mb-2 transition-all duration-200 ${
                amount === '0' ? 'text-4xl md:text-5xl text-white/40' : 'text-5xl md:text-6xl'
              }`}>
                {formatAmount(amount)}
              </p>
            </div>
            <p className="text-white/50 text-base font-medium relative z-10">ليرة سورية</p>
          </div>

          {/* Numpad */}
          <div className="p-5 md:p-6 bg-gray-50/30">
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="h-14 md:h-16 bg-white hover:bg-gray-50 active:bg-gray-100 active:scale-[0.97] rounded-2xl text-2xl font-bold text-gray-800 transition-all duration-150 shadow-card hover:shadow-card-hover border border-gray-100/80 select-none"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <button
                onClick={handleClear}
                className="h-14 md:h-16 bg-red-50 hover:bg-red-100 active:bg-red-200 active:scale-[0.97] rounded-2xl text-lg font-bold text-error transition-all duration-150 shadow-card border border-red-100/80 select-none"
              >
                C
              </button>
              <button
                onClick={() => handleNumberClick('0')}
                className="h-14 md:h-16 bg-white hover:bg-gray-50 active:bg-gray-100 active:scale-[0.97] rounded-2xl text-2xl font-bold text-gray-800 transition-all duration-150 shadow-card hover:shadow-card-hover border border-gray-100/80 select-none"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 md:h-16 bg-white hover:bg-gray-50 active:bg-gray-100 active:scale-[0.97] rounded-2xl transition-all duration-150 shadow-card hover:shadow-card-hover border border-gray-100/80 flex items-center justify-center select-none"
              >
                <Delete size={22} className="text-gray-600" />
              </button>
            </div>

            {/* Collect Button */}
            <Button
              fullWidth
              size="lg"
              onClick={handleCollect}
              disabled={amount === '0'}
              className="h-14 text-xl rounded-2xl"
            >
              تحصيل المبلغ
            </Button>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2.5 mt-5">
              {[
                { icon: RotateCcw, label: 'استرجاع', color: 'bg-orange-50 text-orange-600', path: '/transactions' },
                { icon: FileText, label: 'فاتورة', color: 'bg-accent-50 text-accent-700', path: '/invoices/create' },
                { icon: QrCode, label: 'QR ثابت', color: 'bg-purple-50 text-purple-600', path: '/pos/qr' },
                { icon: History, label: 'آخر عملية', color: 'bg-primary-50 text-primary', path: '/transactions' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:shadow-card transition-all duration-200 hover:-translate-y-0.5 bg-white/60 border border-gray-100/50"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Unified Payment Screen (NFC always active + QR displayed)
// ============================================================
function UnifiedPayment({
  amount,
  onBack,
  onSuccess,
  onSwitchMethod,
}: {
  amount: string;
  onBack: () => void;
  onSuccess: () => void;
  onSwitchMethod: (method: 'qr-scan' | 'phone') => void;
}) {
  const [session, setSession] = useState<POSPaymentSession | null>(null);
  const [timer, setTimer] = useState(300);

  const formatAmount = (value: string) => {
    const num = parseInt(value) || 0;
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Create NFC payment session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const paymentSession = await posService.createPaymentSession({
          amount: parseInt(amount),
          method: 'nfc'
        });
        setSession(paymentSession);
      } catch (error) {
        console.error('Failed to create payment session:', error);
      }
    };

    createSession();
  }, [amount]);

  // Poll session status + countdown timer
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
    <div className="bg-surface p-4 flex items-center justify-center">
      <div className="w-full max-w-lg animate-scaleIn">
        <div className="glass-card overflow-hidden shadow-glass">
          {/* Amount Header */}
          <div className="bg-gradient-to-l from-primary-800 via-primary to-primary-400 p-6 text-center relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-15%] w-[150px] h-[150px] bg-white/5 rounded-full blur-2xl" />
            <p className="text-white/60 text-sm mb-1 relative z-10">المبلغ المطلوب</p>
            <p className="text-white text-4xl font-bold font-numbers relative z-10">
              {formatAmount(amount)} ل.س
            </p>
          </div>

          <div className="p-6 md:p-8">
            {/* NFC Section - Primary */}
            <div className="text-center mb-6">
              {/* NFC Animation - Concentric Rings */}
              <div className="relative flex items-center justify-center mb-4" style={{ height: '160px' }}>
                {/* Outer pulsing rings */}
                <div className="absolute w-40 h-40 border-2 border-primary-200 rounded-full animate-ping opacity-10" style={{ animationDuration: '2s' }} />
                <div className="absolute w-32 h-32 border-2 border-primary-300 rounded-full animate-ping opacity-15" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
                <div className="absolute w-24 h-24 border-2 border-primary-400 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s', animationDelay: '0.8s' }} />

                {/* Static rings */}
                <div className="absolute w-32 h-32 border border-primary-100 rounded-full" />
                <div className="absolute w-24 h-24 border border-primary-200 rounded-full" />

                {/* Center icon */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary-400 rounded-full flex items-center justify-center shadow-glass-lg z-10">
                  <Smartphone size={28} className="text-white" />
                </div>

                {/* NFC badge */}
                <div className="absolute top-[50%] right-[50%] translate-x-[42px] -translate-y-[42px] z-20">
                  <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-md">
                    <Wifi size={12} className="text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-1">قرّب جوال العميل</h2>
              <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span>NFC بانتظار الاتصال...</span>
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">أو امسح الرمز</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* QR Code Section - Secondary */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-lg scale-110" />
                <div className="relative bg-white p-4 rounded-xl shadow-card border border-gray-100">
                  <div className="w-40 h-40 bg-gray-900 rounded-lg flex flex-col items-center justify-center p-3 overflow-hidden">
                    {session?.qrCode ? (
                      <p className="text-white text-[9px] font-mono break-all text-center leading-relaxed">{session.qrCode}</p>
                    ) : (
                      <QrCode size={80} className="text-white/60" />
                    )}
                  </div>
                  <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">NavaPay</p>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-1.5 mb-5">
              <Clock size={14} className={timer < 60 ? 'text-error' : 'text-gray-400'} />
              <span className={`text-sm font-numbers font-medium ${timer < 60 ? 'text-error' : 'text-gray-400'}`}>
                {formatTime(timer)}
              </span>
            </div>

            {/* Alternative Methods */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => onSwitchMethod('qr-scan')}
                className="flex-1 flex items-center justify-center gap-2 p-3 border border-gray-200 hover:border-primary-200 hover:bg-primary-50/30 rounded-xl transition-all duration-200 text-sm"
              >
                <Camera size={16} className="text-gray-500" />
                <span className="font-medium text-gray-700">مسح QR العميل</span>
              </button>
              <button
                onClick={() => onSwitchMethod('phone')}
                className="flex-1 flex items-center justify-center gap-2 p-3 border border-gray-200 hover:border-primary-200 hover:bg-primary-50/30 rounded-xl transition-all duration-200 text-sm"
              >
                <Phone size={16} className="text-gray-500" />
                <span className="font-medium text-gray-700">رقم الجوال</span>
              </button>
            </div>

            {/* Cancel */}
            <Button variant="outline" fullWidth onClick={onBack}>
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// QR Scan Payment Component (Camera to scan customer's QR)
// ============================================================
function QRScanPayment({ amount, onBack }: { amount: string; onBack: () => void; onSuccess: () => void }) {
  const formatAmount = (value: string) => {
    const num = parseInt(value) || 0;
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  return (
    <div className="bg-surface p-4 flex items-center justify-center">
      <div className="w-full max-w-md animate-scaleIn">
        <div className="glass-card p-8 shadow-glass">
          <p className="text-xl font-bold text-gray-900 mb-6 text-center">{formatAmount(amount)} ل.س</p>

          {/* Camera Preview with scanning animation */}
          <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden mb-6 aspect-square shadow-glass-lg">
            {/* Corner brackets (scan frame) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-56 h-56">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                {/* Scanning line animation */}
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-scan-line" />
              </div>
            </div>

            {/* Center QR icon hint */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Scan size={64} className="text-white" />
            </div>

            {/* Bottom instruction */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8 text-center">
              <p className="text-white text-sm font-medium">وجّه الكاميرا نحو QR العميل</p>
            </div>
          </div>

          <Button variant="outline" fullWidth onClick={onBack}>
            رجوع
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Phone Payment Component
// ============================================================
function PhonePayment({ amount, onBack, onSuccess }: { amount: string; onBack: () => void; onSuccess: () => void }) {
  const [phone, setPhone] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [session, setSession] = useState<POSPaymentSession | null>(null);
  const [customerName, setCustomerName] = useState('');

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
      <div className="bg-surface p-4 flex items-center justify-center">
        <div className="w-full max-w-md animate-scaleIn">
          <div className="glass-card p-8 text-center shadow-glass">
            <p className="text-2xl font-bold text-gray-900 mb-6 font-numbers">{formatAmount(amount)} ل.س</p>

            {/* Waiting animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-30" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 bg-primary-100 rounded-full" />
              <div className="absolute inset-3 bg-gradient-to-br from-primary to-primary-400 rounded-full flex items-center justify-center shadow-stat">
                <Smartphone size={28} className="text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">بانتظار الدفع من</h2>
            <p className="text-lg text-gray-700 mb-1">{customerName || phone}</p>
            <p className="text-gray-500 font-numbers mb-4">{phone}</p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mb-6">
              <SendHorizontal size={14} />
              <span>تم إرسال إشعار للعميل</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => {
                // Re-trigger payment notification to customer
                handleSubmit();
              }}>إعادة إرسال</Button>
              <Button variant="outline" fullWidth onClick={onBack}>رجوع</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface p-4 flex items-center justify-center">
      <div className="w-full max-w-md animate-slideUp">
        <div className="glass-card p-8 shadow-glass">
          <p className="text-2xl font-bold text-gray-900 mb-6 text-center font-numbers">{formatAmount(amount)} ل.س</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم جوال العميل</label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Phone size={16} className="text-primary" />
                </div>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full pr-14 pl-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50 font-numbers text-lg transition-all"
                dir="ltr"
              />
            </div>
          </div>

          {recentCustomers.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">أو اختر من العملاء السابقين</p>
              <div className="space-y-2">
                {recentCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full flex items-center gap-3 p-3 border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 hover:shadow-card rounded-xl transition-all duration-200 text-right"
                  >
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{customer.name}</p>
                      <p className="text-gray-400 font-numbers text-xs">{customer.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onBack}>رجوع</Button>
            <Button fullWidth onClick={handleSubmit} disabled={!phone}>طلب الدفع</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
