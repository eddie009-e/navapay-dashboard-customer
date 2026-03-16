import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Download, Upload, Plus, TrendingUp, TrendingDown, CreditCard, X, Wallet as WalletIcon } from 'lucide-react';
import Button from '@/react-app/components/Button';
import EmptyState from '@/react-app/components/EmptyState';
import LoadingSpinner, { SkeletonList } from '@/react-app/components/LoadingSpinner';
import { useToast } from '@/react-app/contexts/ToastContext';
import { useLoading } from '@/react-app/hooks/useLoading';
import { walletService, Wallet as WalletType, WalletTransaction, BankAccount } from '@/react-app/services';

export default function Wallet() {
  const { showToast } = useToast();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [walletData, transactionsData, accountsData] = await Promise.allSettled([
          walletService.getWallet(),
          walletService.getTransactions('default', { limit: 5 }),
          walletService.getBankAccounts(),
        ]);

        if (walletData.status === 'fulfilled') {
          setWallet(walletData.value);
        }
        if (transactionsData.status === 'fulfilled') {
          setTransactions(transactionsData.value.data || []);
        }
        if (accountsData.status === 'fulfilled') {
          setBankAccounts(accountsData.value);
        }
      } catch {
        // Promise.allSettled never rejects, so this is unreachable
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('ar-SY', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleAddAccount = async (data: { bankCode: string; accountNumber: string; accountHolder: string }) => {
    try {
      const newAccount = await walletService.addBankAccount(data);
      setBankAccounts([...bankAccounts, newAccount]);
      setShowAddAccountModal(false);
      showToast('success', 'تم إضافة الحساب البنكي بنجاح');
    } catch {
      showToast('error', 'فشل في إضافة الحساب البنكي');
    }
  };

  const handleDeposit = async (amount: number, bankAccountId: string) => {
    try {
      await walletService.deposit({ amount, bankAccountId });
      showToast('success', `تم إنشاء طلب إيداع بقيمة ${formatCurrency(amount)}`);
      setShowDepositModal(false);
      const walletData = await walletService.getWallet();
      setWallet(walletData);
    } catch {
      showToast('error', 'فشل في إنشاء طلب الإيداع');
    }
  };

  const handleWithdraw = async (amount: number, bankAccountId: string) => {
    try {
      await walletService.transferToBank({ amount, bankAccountId });
      showToast('success', `تم إنشاء طلب سحب بقيمة ${formatCurrency(amount)}`);
      setShowWithdrawModal(false);
      const walletData = await walletService.getWallet();
      setWallet(walletData);
    } catch {
      showToast('error', 'فشل في إنشاء طلب السحب');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-4 md:p-6">
        <SkeletonList />
      </div>
    );
  }

  const balance = wallet?.balance || 0;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="glass-card mx-4 md:mx-6 mt-4 md:mt-6 p-4 md:p-6 animate-fadeIn">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">المحفظة</h1>
        <p className="text-gray-500 text-sm">إدارة رصيدك وحساباتك البنكية</p>
      </div>

      <div className="p-4 md:p-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-l from-primary to-primary-400 rounded-3xl p-6 md:p-8 text-white mb-4 md:mb-6 shadow-glass animate-slideUp">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-white/70 text-sm mb-2">الرصيد الحالي</p>
              <p className="text-4xl md:text-5xl font-bold font-numbers mb-4">
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center">
              <WalletIcon size={32} className="text-white" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 hover:bg-white/20 text-white"
              leftIcon={<Download size={20} />}
              onClick={() => setShowWithdrawModal(true)}
            >
              سحب
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 hover:bg-white/20 text-white"
              leftIcon={<Upload size={20} />}
              onClick={() => setShowDepositModal(true)}
            >
              إيداع
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Transactions */}
          <div className="glass-card p-4 md:p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">آخر الحركات</h3>
              <Link to="/wallet/history" className="text-sm text-primary hover:text-primary-600 font-medium">
                عرض الكل ←
              </Link>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <EmptyState
                  icon={WalletIcon}
                  title="لا توجد حركات"
                  description="ستظهر هنا حركات المحفظة الأخيرة"
                />
              ) : (
                transactions.map(transaction => {
                  const { date, time } = formatDateTime(transaction.createdAt);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-primary-50/30 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === 'credit' ? 'bg-accent-50 text-accent-700' : 'bg-red-50 text-error'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <TrendingUp size={20} />
                          ) : (
                            <TrendingDown size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-400 font-numbers">{date} • {time}</p>
                        </div>
                      </div>
                      <p className={`font-bold font-numbers text-sm ${
                        transaction.type === 'credit' ? 'text-accent-700' : 'text-error'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="glass-card p-4 md:p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">الحسابات البنكية</h3>
              <button
                onClick={() => setShowAddAccountModal(true)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-600 font-medium"
              >
                <Plus size={16} />
                إضافة حساب
              </button>
            </div>

            <div className="space-y-3">
              {bankAccounts.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="لا توجد حسابات"
                  description="أضف حساباً بنكياً لتتمكن من السحب"
                  actionLabel="إضافة حساب"
                  onAction={() => setShowAddAccountModal(true)}
                />
              ) : (
                bankAccounts.map(account => (
                  <div key={account.id} className="p-4 bg-primary-50/30 border border-primary-100 rounded-xl hover:border-primary-200 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                          <CreditCard size={24} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{account.bankName}</p>
                          <p className="text-sm text-gray-500 font-numbers">•••• {account.accountNumber?.slice(-4)}</p>
                        </div>
                      </div>
                      {account.isDefault && (
                        <span className="bg-accent-50 text-accent-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                          افتراضي
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showWithdrawModal && (
        <WithdrawModal
          balance={balance}
          bankAccounts={bankAccounts}
          onClose={() => setShowWithdrawModal(false)}
          onSubmit={handleWithdraw}
        />
      )}

      {showDepositModal && (
        <DepositModal
          bankAccounts={bankAccounts}
          onClose={() => setShowDepositModal(false)}
          onSubmit={handleDeposit}
        />
      )}

      {showAddAccountModal && (
        <AddAccountModal
          onClose={() => setShowAddAccountModal(false)}
          onSubmit={handleAddAccount}
        />
      )}
    </div>
  );
}

function WithdrawModal({
  balance,
  bankAccounts,
  onClose,
  onSubmit,
}: {
  balance: number;
  bankAccounts: BankAccount[];
  onClose: () => void;
  onSubmit: (amount: number, bankAccountId: string) => Promise<void>;
}) {
  const { isLoading, withLoading } = useLoading();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0]?.id || '');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const handleSubmit = async () => {
    await withLoading(onSubmit(Number(amount), selectedAccount));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-card bg-white/95 backdrop-blur-xl max-w-md w-full p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">سحب للبنك</h3>

        <div className="bg-gradient-to-l from-primary-50 to-accent-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">الرصيد المتاح</p>
          <p className="text-2xl font-bold text-primary font-numbers">{formatCurrency(balance)}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ <span className="text-error">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50 font-numbers transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحساب البنكي <span className="text-error">*</span>
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50 transition-all"
            >
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bankName} •••• {account.accountNumber?.slice(-4)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-warning/10 rounded-xl p-3 mb-6">
          <p className="text-sm text-gray-600">
            سيصل المبلغ خلال 1-3 أيام عمل
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={!amount || Number(amount) > balance || !selectedAccount || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" color="text-white" />
                <span>جاري المعالجة...</span>
              </div>
            ) : (
              'طلب السحب'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DepositModal({
  bankAccounts,
  onClose,
  onSubmit,
}: {
  bankAccounts: BankAccount[];
  onClose: () => void;
  onSubmit: (amount: number, bankAccountId: string) => Promise<void>;
}) {
  const { isLoading, withLoading } = useLoading();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0]?.id || '');

  const formatCurrencyLocal = (val: number) => {
    return new Intl.NumberFormat('ar-SY').format(val) + ' ل.س';
  };

  const handleSubmit = async () => {
    await withLoading(onSubmit(Number(amount), selectedAccount));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-card bg-white/95 backdrop-blur-xl max-w-md w-full p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">إيداع</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ <span className="text-error">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50 font-numbers transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحساب البنكي <span className="text-error">*</span>
            </label>
            {bankAccounts.length > 0 ? (
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50 transition-all"
              >
                {bankAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} •••• {account.accountNumber?.slice(-4)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-xl">
                لا توجد حسابات بنكية. أضف حساباً بنكياً أولاً.
              </p>
            )}
          </div>
        </div>

        <div className="bg-primary-50/50 rounded-xl p-3 mb-6">
          <p className="text-sm text-gray-600">
            سيتم إيداع المبلغ في محفظتك بعد التحقق من العملية
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={!amount || Number(amount) <= 0 || !selectedAccount || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" color="text-white" />
                <span>جاري المعالجة...</span>
              </div>
            ) : (
              'طلب الإيداع'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddAccountModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { bankCode: string; accountNumber: string; accountHolder: string }) => Promise<void>;
}) {
  const { isLoading, withLoading } = useLoading();
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const handleSubmit = async () => {
    await withLoading(onSubmit({ bankCode, accountNumber, accountHolder }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-card bg-white/95 backdrop-blur-xl max-w-md w-full p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">إضافة حساب بنكي</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم البنك <span className="text-error">*</span>
            </label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50 transition-all"
            >
              <option value="">اختر البنك</option>
              <option value="cbs">المصرف التجاري السوري</option>
              <option value="bsib">بنك سورية الدولي الإسلامي</option>
              <option value="bemo">بنك بيمو السعودي الفرنسي</option>
              <option value="other">بنك آخر</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الحساب <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="1234567890"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50 font-numbers transition-all"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم صاحب الحساب <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="الاسم كما يظهر في البنك"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50/50 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button fullWidth onClick={handleSubmit} disabled={!bankCode || !accountNumber || !accountHolder || isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" color="text-white" />
                <span>جاري الحفظ...</span>
              </div>
            ) : (
              'إضافة الحساب'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
