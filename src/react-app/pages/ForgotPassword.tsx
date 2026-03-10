import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Smartphone, ArrowRight, Lock } from 'lucide-react';
import Input from '@/react-app/components/Input';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { authService } from '../services';

interface ForgotPasswordForm {
  phone: string;
}

interface ResetPinForm {
  newPin: string;
  confirmNewPin: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'reset'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [otpToken, setOtpToken] = useState('');

  const { register: registerPhone, handleSubmit: handleSubmitPhone, formState: { errors: errorsPhone } } = useForm<ForgotPasswordForm>();
  const { register: registerReset, handleSubmit: handleSubmitReset, watch, formState: { errors: errorsReset } } = useForm<ResetPinForm>();

  const onSubmitPhone = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError('');

    try {
      await authService.requestOtp(data.phone, 'reset_pin');
      setPhone(data.phone);
      setStep('otp');
      startTimer();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'فشل في إرسال رمز التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    setTimer(45);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index === 5 && newOtp.every(digit => digit)) {
      verifyOtpCode(newOtp.join(''));
    }

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const verifyOtpCode = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.verifyOtp(phone, code, 'reset_pin');
      if (result.otpToken) {
        setOtpToken(result.otpToken);
      }
      setStep('reset');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'الرمز غير صحيح');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data: ResetPinForm) => {
    if (data.newPin !== data.confirmNewPin) {
      setError('رموز PIN غير متطابقة');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.confirmPinReset(otpToken, data.newPin, data.confirmNewPin);
      navigate('/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'فشل في إعادة تعيين PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.requestOtp(phone, 'reset_pin');
      startTimer();
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'فشل في إعادة إرسال الرمز');
    }
  };

  const maskedPhone = phone ? phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3') : '';

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
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 'phone' && 'استعادة رمز PIN'}
            {step === 'otp' && 'التحقق من رقم الجوال'}
            {step === 'reset' && 'إعادة تعيين رمز PIN'}
          </h1>
          <p className="text-white/60">
            {step === 'phone' && 'أدخل رقم جوالك لاستلام رمز التحقق'}
            {step === 'otp' && `أدخل الرمز المرسل إلى ${maskedPhone}`}
            {step === 'reset' && 'أدخل رمز PIN الجديد'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-slideUp border border-white/30">
          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handleSubmitPhone(onSubmitPhone)} className="space-y-5">
              <Input
                label="رقم الجوال"
                type="tel"
                placeholder="0912345678"
                leftIcon={<Smartphone size={20} />}
                error={errorsPhone.phone?.message}
                {...registerPhone('phone', {
                  required: 'رقم الجوال مطلوب',
                  pattern: {
                    value: /^09\d{8}$/,
                    message: 'رقم الجوال يجب أن يبدأ بـ 09 ويكون 10 أرقام'
                  }
                })}
              />

              {error && (
                <div className="bg-error/5 border border-error/20 rounded-xl p-3 text-error text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                إرسال رمز التحقق
              </Button>

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
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div className="flex gap-2 justify-center mb-4" dir="ltr">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50/50"
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="text-center mb-4">
                {!canResend ? (
                  <p className="text-sm text-gray-500">
                    ينتهي خلال <span className="font-mono font-bold text-primary">{String(timer).padStart(2, '0')}</span> ثانية
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm text-primary hover:text-primary-600 font-medium"
                  >
                    إعادة الإرسال
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-error/5 border border-error/20 rounded-xl p-3 text-error text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                onClick={() => setStep('phone')}
                variant="outline"
                fullWidth
                size="lg"
                leftIcon={<ArrowRight size={18} />}
              >
                تغيير رقم الجوال
              </Button>

              <div className="mt-4 text-center text-sm text-gray-500 bg-primary-50/30 rounded-xl p-3">
                <p>للاختبار، استخدم الرمز: <span className="font-mono font-bold">123456</span></p>
              </div>
            </div>
          )}

          {/* Reset PIN Step */}
          {step === 'reset' && (
            <form onSubmit={handleSubmitReset(onSubmitReset)} className="space-y-5">
              <Input
                label="رمز PIN الجديد"
                type="password"
                placeholder="••••••"
                leftIcon={<Lock size={20} />}
                error={errorsReset.newPin?.message}
                {...registerReset('newPin', {
                  required: 'رمز PIN مطلوب',
                  minLength: { value: 4, message: 'رمز PIN يجب أن يكون 4 أرقام على الأقل' },
                  pattern: { value: /^\d+$/, message: 'رمز PIN يجب أن يحتوي على أرقام فقط' }
                })}
              />

              <Input
                label="تأكيد رمز PIN"
                type="password"
                placeholder="••••••"
                leftIcon={<Lock size={20} />}
                error={errorsReset.confirmNewPin?.message}
                {...registerReset('confirmNewPin', {
                  required: 'تأكيد رمز PIN مطلوب',
                  validate: (value) => value === watch('newPin') || 'رموز PIN غير متطابقة'
                })}
              />

              {error && (
                <div className="bg-error/5 border border-error/20 rounded-xl p-3 text-error text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                إعادة تعيين رمز PIN
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/40 mt-6">
          مدعوم بتقنية NavaPay &copy; 2026
        </p>
      </div>
    </div>
  );
}
