import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Smartphone, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { ApiError } from '@/react-app/services/api';

type Step = 'phone' | 'otp';

export default function Login() {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp, loginWithOtp, isAuthenticated } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // OTP expiry countdown
  useEffect(() => {
    if (expiresIn > 0) {
      const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [expiresIn]);

  const validatePhone = (value: string) => {
    return /^09\d{8}$/.test(value);
  };

  const handleRequestOtp = async () => {
    if (!validatePhone(phone)) {
      setError('رقم الجوال يجب أن يبدأ بـ 09 ويكون 10 أرقام');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await requestOtp(phone, 'login');
      setStep('otp');
      setExpiresIn(response.expiresIn || 300);
      setCountdown(60); // 60 seconds before resend
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'فشل في إرسال رمز التحقق');
      } else if (err instanceof Error) {
        setError(err.message || 'حدث خطأ في الاتصال بالخادم');
      } else {
        setError('حدث خطأ في الاتصال بالخادم');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpValue = code || otpCode.join('');
    if (otpValue.length !== 6) {
      setError('الرجاء إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Verify OTP
      const verifyResponse = await verifyOtp(phone, otpValue, 'login');

      if (verifyResponse.verified && verifyResponse.otpToken) {
        // Step 2: Login with OTP token
        await loginWithOtp(verifyResponse.otpToken);
        navigate('/');
      } else {
        setError('رمز التحقق غير صحيح');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'رمز التحقق غير صحيح');
      } else if (err instanceof Error) {
        setError(err.message || 'حدث خطأ في التحقق');
      } else {
        setError('حدث خطأ في الاتصال بالخادم');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError('');
    setOtpCode(['', '', '', '', '', '']);

    try {
      const response = await requestOtp(phone, 'login');
      setExpiresIn(response.expiresIn || 300);
      setCountdown(60);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'فشل في إعادة إرسال الرمز');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-8">
      <BackButton />
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">NP</span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">NavaPay</h1>
          <p className="text-gray-600">لوحة تحكم التاجر</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slideUp">
          {step === 'phone' ? (
            // Step 1: Phone Number
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">تسجيل الدخول</h2>
                <p className="text-sm text-gray-600 mt-1">أدخل رقم جوالك لإرسال رمز التحقق</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال
                </label>
                <div className="relative">
                  <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError('');
                    }}
                    placeholder="0912345678"
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors font-numbers text-lg"
                    dir="ltr"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border border-error rounded-lg p-3 text-error text-sm">
                  {error}
                </div>
              )}

              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={handleRequestOtp}
                disabled={isLoading || !phone}
                leftIcon={isLoading ? <Loader2 className="animate-spin" size={20} /> : undefined}
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">أو</span>
                </div>
              </div>

              {/* Employee PIN Login */}
              <Link to="/login/pin">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  size="lg"
                >
                  الدخول برمز PIN (للموظفين)
                </Button>
              </Link>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                ليس لديك حساب؟{' '}
                <Link to="/register" className="text-primary font-medium hover:text-primary-600 transition-colors">
                  سجل الآن
                </Link>
              </p>
            </div>
          ) : (
            // Step 2: OTP Verification
            <div className="space-y-5">
              <button
                onClick={() => {
                  setStep('phone');
                  setOtpCode(['', '', '', '', '', '']);
                  setError('');
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowRight size={20} />
                <span>تغيير الرقم</span>
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">رمز التحقق</h2>
                <p className="text-sm text-gray-600 mt-1">
                  أدخل الرمز المرسل إلى
                </p>
                <p className="font-numbers font-bold text-primary mt-1">{phone}</p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-2 dir-ltr">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-200 transition-colors"
                    maxLength={1}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Timer */}
              {expiresIn > 0 && (
                <p className="text-center text-sm text-gray-600">
                  ينتهي الرمز خلال <span className="font-bold text-primary font-numbers">{formatTime(expiresIn)}</span>
                </p>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border border-error rounded-lg p-3 text-error text-sm">
                  {error}
                </div>
              )}

              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpCode.some(d => !d)}
                leftIcon={isLoading ? <Loader2 className="animate-spin" size={20} /> : undefined}
              >
                {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className={`inline-flex items-center gap-2 text-sm ${
                    countdown > 0 ? 'text-gray-400' : 'text-primary hover:text-primary-600'
                  } transition-colors`}
                >
                  <RefreshCw size={16} />
                  {countdown > 0 ? (
                    <span>إعادة الإرسال بعد <span className="font-numbers">{countdown}</span> ثانية</span>
                  ) : (
                    <span>إعادة إرسال الرمز</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          مدعوم بتقنية NavaPay © 2026
        </p>
      </div>
    </div>
  );
}
