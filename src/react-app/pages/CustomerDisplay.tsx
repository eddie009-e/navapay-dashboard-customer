import { useState, useEffect } from 'react';
import { Check, X, QrCode } from 'lucide-react';
import BackButton from '@/react-app/components/BackButton';
import { useAuth } from '../contexts/AuthContext';
import { posService, POSPaymentSession } from '../services';
import { useLocation } from 'react-router';

type DisplayState = 'idle' | 'amount' | 'waiting' | 'success' | 'failed';

interface DisplayLocationState {
  sessionId?: string;
  amount?: number;
}

export default function CustomerDisplay() {
  const { user } = useAuth();
  const location = useLocation();
  const locationState = location.state as DisplayLocationState | undefined;

  const [state, setState] = useState<DisplayState>('idle');
  const [amount, setAmount] = useState(locationState?.amount || 0);
  const [, setSession] = useState<POSPaymentSession | null>(null);

  const storeName = user?.merchantName || 'NavaPay';

  // Poll for session status if we have a session ID
  useEffect(() => {
    if (!locationState?.sessionId) return;

    const checkStatus = async () => {
      try {
        const sessionData = await posService.checkSessionStatus(locationState.sessionId!);
        setSession(sessionData);
        setAmount(sessionData.amount);

        if (sessionData.status === 'pending') {
          setState('amount');
        } else if (sessionData.status === 'completed') {
          setState('success');
        } else if (sessionData.status === 'failed' || sessionData.status === 'expired') {
          setState('failed');
        }
      } catch {
        setState('failed');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [locationState?.sessionId]);

  // If no session ID, show demo mode
  useEffect(() => {
    if (locationState?.sessionId) return;

    // Demo mode simulation
    const timer1 = setTimeout(() => setState('amount'), 2000);
    const timer2 = setTimeout(() => setState('waiting'), 5000);
    const timer3 = setTimeout(() => setState('success'), 10000);
    const timer4 = setTimeout(() => setState('idle'), 15000);

    setAmount(250000); // Demo amount

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [locationState?.sessionId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-primary-700 flex items-center justify-center p-8">
      <BackButton to="/pos" label="نقاط البيع" className="bg-white/90 backdrop-blur-sm" />
      <div className="w-full max-w-2xl">
        {/* Idle State */}
        {state === 'idle' && (
          <div className="text-center animate-fadeIn">
            <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-6xl font-bold text-primary">NP</span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4">مرحباً بك</h1>
            <p className="text-3xl text-white/80">{storeName}</p>
          </div>
        )}

        {/* Amount Entered State */}
        {state === 'amount' && (
          <div className="text-center animate-scaleIn">
            <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-6xl font-bold text-primary">NP</span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 mb-8">
              <p className="text-white/80 text-2xl mb-4">المبلغ المطلوب</p>
              <p className="text-white text-7xl font-bold font-numbers mb-8">
                {formatCurrency(amount)}
              </p>
              
              {/* QR Code */}
              <div className="inline-block bg-white p-8 rounded-2xl shadow-xl">
                <div className="w-64 h-64 bg-gray-900 rounded-lg flex items-center justify-center">
                  <QrCode size={200} className="text-white" />
                </div>
              </div>
              
              <p className="text-white text-2xl mt-8">امسح للدفع بتطبيق NavaPay</p>
            </div>
            <p className="text-white/60 text-xl">{storeName}</p>
          </div>
        )}

        {/* Waiting State */}
        {state === 'waiting' && (
          <div className="text-center animate-scaleIn">
            <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-6xl font-bold text-primary">NP</span>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 mb-8">
              <p className="text-white text-7xl font-bold font-numbers mb-4">
                {formatCurrency(amount)}
              </p>
              <div className="flex items-center justify-center gap-4 text-white text-2xl">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-white text-2xl mt-4">جاري المعالجة...</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="text-center animate-scaleIn">
            <div className="w-48 h-48 mx-auto mb-8 bg-success rounded-full flex items-center justify-center shadow-2xl animate-scaleIn">
              <Check size={120} className="text-white" strokeWidth={3} />
            </div>
            <h1 className="text-7xl font-bold text-white mb-4">شكراً لك! 🎉</h1>
            <p className="text-4xl text-white/90 font-bold font-numbers mb-8">
              {formatCurrency(amount)}
            </p>
            <p className="text-white/60 text-2xl">{storeName}</p>
          </div>
        )}

        {/* Failed State */}
        {state === 'failed' && (
          <div className="text-center animate-scaleIn">
            <div className="w-48 h-48 mx-auto mb-8 bg-error rounded-full flex items-center justify-center shadow-2xl">
              <X size={120} className="text-white" strokeWidth={3} />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4">فشل الدفع</h1>
            <p className="text-2xl text-white/80 mb-8">يرجى المحاولة مرة أخرى</p>
            <p className="text-white/60 text-xl">{storeName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
