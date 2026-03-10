import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Store } from 'lucide-react';
import Input from '@/react-app/components/Input';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { ApiError } from '@/react-app/services/api';

export default function LoginPin() {
  const navigate = useNavigate();
  const { loginWithPin, isAuthenticated } = useAuth();
  const [storeCode, setStoreCode] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handlePinChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeCode || !phone || pin.some(digit => !digit)) {
      setError('يرجى إكمال جميع الحقول');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const pinCode = pin.join('');
      await loginWithPin({
        phone,
        pin: pinCode,
      });

      // Navigate based on user role (the backend response contains role info)
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'رمز المتجر أو رمز PIN غير صحيح');
      } else {
        setError('حدث خطأ في الاتصال بالخادم');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary to-primary-400 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl" />

      <BackButton to="/login" label="تسجيل الدخول" />
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl mb-4 shadow-glass-lg border border-white/20">
            <span className="text-3xl font-bold text-white">NP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">دخول الموظف</h1>
          <p className="text-white/60">أدخل رمز المتجر ورمز PIN الخاص بك</p>
        </div>

        {/* PIN Login Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-slideUp border border-white/30">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Store Code */}
            <Input
              label="رمز المتجر"
              type="text"
              placeholder="STORE-ABC123"
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value.toUpperCase())}
              leftIcon={<Store size={20} />}
              required
            />

            {/* Phone Number */}
            <Input
              label="رقم الجوال"
              type="tel"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز PIN
                <span className="text-error mr-1">*</span>
              </label>
              <div className="flex gap-3 justify-center" dir="ltr">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50/50"
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error/5 border border-error/20 rounded-xl p-3 text-error text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              دخول
            </Button>

            {/* Back Link */}
            <Link to="/login">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                leftIcon={<ArrowRight size={18} />}
              >
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/40 mt-6">
          مدعوم بتقنية NavaPay &copy; 2026
        </p>
      </div>
    </div>
  );
}
