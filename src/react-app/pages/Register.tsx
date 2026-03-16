import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { User, Smartphone, Mail, Lock, Store, MapPin, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Input from '@/react-app/components/Input';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';
import { authService } from '../services';

interface Step1Form {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

interface Step2Form {
  storeName: string;
  businessType: string;
  address: string;
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Form | null>(null);

  const handleStep1Complete = (data: Step1Form) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Complete = async (data: Step2Form) => {
    setStep2Data(data);
    // Request OTP for registration when step 2 is completed
    if (step1Data) {
      try {
        await authService.requestOtp(step1Data.phone, 'register');
        setCurrentStep(3);
      } catch (error) {
        console.error('OTP request failed:', error);
        alert(error instanceof Error ? error.message : 'فشل في إرسال رمز التحقق');
      }
    }
  };

  const ProgressIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all
              ${currentStep >= step ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}
            `}
          >
            {currentStep > step ? <Check size={20} /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 transition-all ${
                currentStep > step ? 'bg-primary' : 'bg-gray-100'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary to-primary-400 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl" />

      <BackButton />
      <div className="w-full max-w-2xl relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl mb-4 shadow-glass-lg border border-white/20">
            <span className="text-3xl font-bold text-white">NP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">إنشاء حساب تاجر</h1>
          <p className="text-white/60">انضم إلى NavaPay وابدأ باستقبال المدفوعات</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-slideUp border border-white/30">
          <ProgressIndicator />

          {currentStep === 1 && <Step1 onComplete={handleStep1Complete} />}
          {currentStep === 2 && <Step2 onComplete={handleStep2Complete} onBack={() => setCurrentStep(1)} />}
          {currentStep === 3 && <Step3 step1Data={step1Data!} step2Data={step2Data!} onBack={() => setCurrentStep(2)} />}

          {/* Login Link */}
          {currentStep === 1 && (
            <p className="text-center text-sm text-gray-500 mt-6">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-primary font-medium hover:text-primary-600 transition-colors">
                تسجيل الدخول
              </Link>
            </p>
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

function Step1({ onComplete }: { onComplete: (data: Step1Form) => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step1Form>();
  const password = watch('password', '');

  const getPasswordStrength = () => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };
    return checks;
  };

  const strength = getPasswordStrength();

  return (
    <form onSubmit={handleSubmit(onComplete)} className="space-y-5">
      <h2 className="text-xl font-bold text-gray-800 mb-4">المعلومات الشخصية</h2>

      <Input
        label="الاسم الكامل"
        placeholder="أحمد محمد"
        leftIcon={<User size={20} />}
        error={errors.fullName?.message}
        {...register('fullName', { required: 'الاسم مطلوب' })}
      />

      <Input
        label="رقم الجوال"
        type="tel"
        placeholder="0912345678"
        leftIcon={<Smartphone size={20} />}
        error={errors.phone?.message}
        {...register('phone', {
          required: 'رقم الجوال مطلوب',
          pattern: {
            value: /^09\d{8}$/,
            message: 'رقم الجوال يجب أن يبدأ بـ 09 ويكون 10 أرقام'
          }
        })}
      />

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="example@email.com"
        leftIcon={<Mail size={20} />}
        error={errors.email?.message}
        {...register('email', {
          required: 'البريد الإلكتروني مطلوب',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'البريد الإلكتروني غير صالح'
          }
        })}
      />

      <div>
        <Input
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={20} />}
          error={errors.password?.message}
          {...register('password', {
            required: 'كلمة المرور مطلوبة',
            minLength: { value: 8, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
          })}
        />
        {password && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm">
              <span className={strength.length ? 'text-success' : 'text-gray-400'}>
                {strength.length ? '✓' : '✗'}
              </span>
              <span className="mr-2">8 أحرف على الأقل</span>
            </div>
            <div className="flex items-center text-sm">
              <span className={strength.uppercase ? 'text-success' : 'text-gray-400'}>
                {strength.uppercase ? '✓' : '✗'}
              </span>
              <span className="mr-2">حرف كبير واحد على الأقل</span>
            </div>
            <div className="flex items-center text-sm">
              <span className={strength.number ? 'text-success' : 'text-gray-400'}>
                {strength.number ? '✓' : '✗'}
              </span>
              <span className="mr-2">رقم واحد على الأقل</span>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" fullWidth size="lg" rightIcon={<ArrowLeft size={18} />}>
        التالي
      </Button>
    </form>
  );
}

function Step2({ onComplete, onBack }: { onComplete: (data: Step2Form) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Form>();

  const businessTypes = [
    'مطعم/مقهى',
    'بقالة',
    'صيدلية',
    'ملابس',
    'إلكترونيات',
    'خدمات',
    'أخرى'
  ];

  return (
    <form onSubmit={handleSubmit(onComplete)} className="space-y-5">
      <h2 className="text-xl font-bold text-gray-800 mb-4">معلومات المتجر</h2>

      <Input
        label="اسم المتجر"
        placeholder="متجر الأمل"
        leftIcon={<Store size={20} />}
        error={errors.storeName?.message}
        {...register('storeName', { required: 'اسم المتجر مطلوب' })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          نوع النشاط
          <span className="text-error mr-1">*</span>
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
          {...register('businessType', { required: 'نوع النشاط مطلوب' })}
        >
          <option value="">اختر نوع النشاط</option>
          {businessTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.businessType && (
          <p className="mt-1 text-sm text-error">{errors.businessType.message}</p>
        )}
      </div>

      <Input
        label="العنوان"
        placeholder="دمشق، المزة، شارع الجلاء"
        leftIcon={<MapPin size={20} />}
        hint="اختياري"
        {...register('address')}
      />

      <div className="flex gap-3">
        <Button type="button" variant="outline" fullWidth size="lg" onClick={onBack} leftIcon={<ArrowRight size={18} />}>
          السابق
        </Button>
        <Button type="submit" fullWidth size="lg" rightIcon={<ArrowLeft size={18} />}>
          التالي
        </Button>
      </div>
    </form>
  );
}

function Step3({ step1Data, step2Data, onBack }: { step1Data: Step1Form; step2Data: Step2Form; onBack: () => void }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  useState(() => {
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

    return () => clearInterval(interval);
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-submit when all filled
    if (value && index === 5 && newOtp.every(digit => digit)) {
      handleSubmit();
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async () => {
    if (otp.some(digit => !digit)) {
      setError('يرجى إدخال الرمز كاملاً');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const code = otp.join('');
      const verifyResult = await authService.verifyOtp(step1Data.phone, code, 'register');
      if (verifyResult.otpToken) {
        // 1. Register user with email + password
        await authService.register(verifyResult.otpToken, step1Data.fullName, step1Data.email, step1Data.password);

        // 2. Register as merchant with store data
        await authService.registerMerchant({
          businessName: step2Data.storeName,
          businessType: step2Data.businessType,
          contactPhone: step1Data.phone,
          contactEmail: step1Data.email,
          address: step2Data.address || undefined,
        });
      }
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'الرمز غير صحيح');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.requestOtp(step1Data.phone, 'register');
      setTimer(45);
      setCanResend(false);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'فشل في إعادة إرسال الرمز');
    }
  };

  const maskedPhone = step1Data.phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3');

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-800 mb-2">التحقق من رقم الجوال</h2>
      <p className="text-gray-500 text-sm mb-6">
        أدخل الرمز المرسل إلى {maskedPhone}
      </p>

      {/* OTP Input */}
      <div>
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

        {/* Timer */}
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error/5 border border-error/20 rounded-xl p-3 text-error text-sm text-center animate-shake">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        fullWidth
        size="lg"
        isLoading={isLoading}
        disabled={otp.some(digit => !digit)}
      >
        إكمال التسجيل
      </Button>

      <Button
        type="button"
        variant="outline"
        fullWidth
        size="lg"
        onClick={onBack}
        leftIcon={<ArrowRight size={18} />}
        disabled={isLoading}
      >
        السابق
      </Button>

      {/* Help Text */}
      <div className="mt-4 text-center text-sm text-gray-500 bg-primary-50/30 rounded-xl p-3">
        <p>للاختبار، استخدم الرمز: <span className="font-mono font-bold">123456</span></p>
      </div>
    </div>
  );
}
