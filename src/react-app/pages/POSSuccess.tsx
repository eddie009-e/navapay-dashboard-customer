import { useNavigate, useLocation } from 'react-router';
import { Check, Printer, Share2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import BackButton from '@/react-app/components/BackButton';

interface TransactionState {
  amount: number;
  customerName?: string;
  customerPhone?: string;
  transactionId: string;
  timestamp: string;
  fee?: number;
  netAmount?: number;
}

export default function POSSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get transaction data from navigation state or use default
  const transactionState = location.state as TransactionState | undefined;

  const transaction = {
    amount: transactionState?.amount || 0,
    customerName: transactionState?.customerName || 'عميل',
    time: transactionState?.timestamp
      ? new Date(transactionState.timestamp).toLocaleString('ar-SY')
      : new Date().toLocaleString('ar-SY'),
    reference: transactionState?.transactionId || 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    fee: transactionState?.fee || 0,
    netAmount: transactionState?.netAmount || transactionState?.amount || 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-white p-4 flex items-center justify-center">
      <BackButton to="/pos" label="نقاط البيع" />
      <div className="w-full max-w-md">
        <div className="glass-card p-8 text-center animate-scaleIn">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="w-32 h-32 mx-auto bg-accent-700 rounded-full flex items-center justify-center animate-scaleIn">
              <Check size={64} className="text-white" strokeWidth={3} />
            </div>
            {/* Confetti effect could be added here */}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            تم الدفع بنجاح! 🎉
          </h1>

          <div className="my-8 space-y-3">
            <div className="bg-surface rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">المبلغ</p>
              <p className="text-3xl font-bold text-gray-900 font-numbers">
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            <div className="bg-surface rounded-xl p-3 text-right">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">من:</span>
                <span className="font-medium text-gray-900">{transaction.customerName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">الوقت:</span>
                <span className="font-medium text-gray-900 font-numbers">{transaction.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">المرجع:</span>
                <span className="font-medium text-gray-900 font-mono">{transaction.reference}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Printer size={20} />}
              >
                طباعة
              </Button>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Share2 size={20} />}
              >
                مشاركة
              </Button>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/pos')}
              leftIcon={<Check size={20} />}
            >
              عملية جديدة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
