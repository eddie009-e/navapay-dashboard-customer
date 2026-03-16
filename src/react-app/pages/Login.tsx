import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Smartphone, Mail, Lock, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { ApiError } from '@/react-app/services/api';

type LoginMethod = 'password' | 'otp';
type OtpStep = 'phone' | 'code';

export default function Login() {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp, loginWithOtp, loginWithPassword, isAuthenticated } = useAuth();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [otpStep, setOtpStep] = useState<OtpStep>('phone');
  // Password login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // OTP login fields
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (expiresIn > 0) {
      const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [expiresIn]);

  const handlePasswordLogin = async () => {
    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }
    if (!password) {
      setError('كلمة المرور مطلوبة');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await loginWithPassword(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'فشل في تسجيل الدخول');
      } else if (err instanceof Error) {
        setError(err.message || 'حدث خطأ في الاتصال بالخادم');
      } else {
        setError('حدث خطأ في الاتصال بالخادم');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      setOtpStep('code');
      setExpiresIn(response.expiresIn || 300);
      setCountdown(60);
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

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

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
      const verifyResponse = await verifyOtp(phone, otpValue, 'login');

      if (verifyResponse.verified && verifyResponse.otpToken) {
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
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary to-primary-400 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl" />

      <BackButton />
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl mb-4 shadow-glass-lg border border-white/20">
            <span className="text-3xl font-bold text-white">NP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NavaPay</h1>
          <p className="text-white/60">لوحة تحكم التاجر</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-slideUp border border-white/30">
          {/* Method Tabs */}
          {otpStep === 'phone' && (
            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => { setLoginMethod('password'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  loginMethod === 'password' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                البريد وكلمة المرور
              </button>
              <button
                onClick={() => { setLoginMethod('otp'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  loginMethod === 'otp' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                رمز التحقق (OTP)
              </button>
            </div>
          )}

          {/* Password Login */}
          {loginMethod === 'password' && otpStep === 'phone' && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">تسجيل الدخول</h2>
                <p className="text-sm text-gray-500 mt-1">أدخل بريدك الإلكتروني وكلمة المرور</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="merchant@example.com"
                    className="w-full pr-10 pl-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg bg-gray-50/50"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg bg-gray-50/50"
                    dir="ltr"
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordLogin(); }}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-error/5 border border-error/20 rounded-xl p-3 text-error text-sm">
                  {error}
                </div>
              )}

              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={handlePasswordLogin}
                disabled={isLoading || !email || !password}
                leftIcon={isLoading ? <Loader2 className="animate-spin" size={20} /> : undefined}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">أو</span>
                </div>
              </div>

              <Link to="/login/pin">
                <Button type="button" variant="outline" fullWidth size="lg">
                  الدخول برمز PIN (للموظفين)
                </Button>
              </Link>

              <p className="text-center text-sm text-gray-500 mt-6">
                ليس لديك حساب؟{' '}
                <Link to="/register" className="text-primary font-semibold hover:text-primary-400 transition-colors">
                  سجل الآن
                </Link>
              </p>
            </div>
          )}

          {/* OTP Login - Phone Step */}
          {loginMethod === 'otp' && otpStep === 'phone' && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">تسجيل الدخول</h2>
                <p className="text-sm text-gray-500 mt-1">أدخل رقم جوالك لإرسال رمز التحقق</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">رقم الجوال</label>
                <div className="relative">
                  <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(''); }}
                    placeholder="0912345678"
                    className="w-full pr-10 pl-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-numbers text-lg bg-gray-50/50"
                    dir="ltr"
                    maxLength={10}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-error/5 border border-error/20 rounded-xl p-3 text-error text-sm">
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">أو</span>
                </div>
              </div>

              <Link to="/login/pin">
                <Button type="button" variant="outline" fullWidth size="lg">
                  الدخول برمز PIN (للموظفين)
                </Button>
              </Link>

              <p className="text-center text-sm text-gray-500 mt-6">
                ليس لديك حساب؟{' '}
                <Link to="/register" className="text-primary font-semibold hover:text-primary-400 transition-colors">
                  سجل الآن
                </Link>
              </p>
            </div>
          )}

          {/* OTP Login - Code Step */}
          {loginMethod === 'otp' && otpStep === 'code' && (
            <div className="space-y-5">
              <button
                onClick={() => {
                  setOtpStep('phone');
                  setOtpCode(['', '', '', '', '', '']);
                  setError('');
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
              >
                <ArrowRight size={20} />
                <span>تغيير الرقم</span>
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">رمز التحقق</h2>
                <p className="text-sm text-gray-500 mt-1">أدخل الرمز المرسل إلى</p>
                <p className="font-numbers font-bold text-primary mt-1">{phone}</p>
              </div>

              <div className="flex justify-center gap-2.5 dir-ltr">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50/50"
                    maxLength={1}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {expiresIn > 0 && (
                <p className="text-center text-sm text-gray-500">
                  ينتهي الرمز خلال <span className="font-bold text-primary font-numbers">{formatTime(expiresIn)}</span>
                </p>
              )}

              {error && (
                <div className="bg-error/5 border border-error/20 rounded-xl p-3 text-error text-sm">
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

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className={`inline-flex items-center gap-2 text-sm ${
                    countdown > 0 ? 'text-gray-400' : 'text-primary hover:text-primary-400'
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

        <p className="text-center text-sm text-white/40 mt-6">
          مدعوم بتقنية NavaPay &copy; 2026
        </p>
      </div>
    </div>
  );
}
