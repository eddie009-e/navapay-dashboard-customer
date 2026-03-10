import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Users, Search, Plus, Mail, Phone, TrendingUp, DollarSign, ShoppingBag, ChevronLeft } from 'lucide-react';
import Button from '@/react-app/components/Button';
import AddCustomerModal from '@/react-app/components/AddCustomerModal';
import EmptyState from '@/react-app/components/EmptyState';
import { SkeletonTable } from '@/react-app/components/LoadingSpinner';
import { useToast } from '@/react-app/contexts/ToastContext';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { customersService, Customer, CreateCustomerDto } from '@/react-app/services';
import { Link, useLocation } from 'react-router';

const getSubTabs = (isEnterprise: boolean) => {
  const tabs = [
    { label: 'العملاء', path: '/customers' },
  ];
  if (isEnterprise) {
    tabs.push(
      { label: 'الموظفين', path: '/employees' },
      { label: 'الفروع', path: '/branches' },
      { label: 'الرواتب', path: '/payroll' },
      { label: 'المطورين', path: '/developers' },
    );
  }
  return tabs;
};

export default function Customers() {
  const { showToast } = useToast();
  const { merchant } = useAuth();
  const location = useLocation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'lastTransaction'>('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isEnterprise = merchant?.plan === 'enterprise';
  const subTabs = getSubTabs(isEnterprise);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const sortField = sortBy === 'lastTransaction' ? 'lastTransactionAt' : sortBy;
      const response = await customersService.list({
        page,
        limit: 20,
        search: searchQuery || undefined,
        sortBy: sortField,
        sortOrder: sortBy === 'name' ? 'ASC' : 'DESC',
      });

      setCustomers(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch {
      showToast('error', 'فشل في تحميل العملاء');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, sortBy, showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddCustomer = async (customerData: { name: string; phone: string; email: string }) => {
    try {
      const newCustomerData: CreateCustomerDto = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || undefined,
      };

      await customersService.create(newCustomerData);
      showToast('success', `تم إضافة العميل ${customerData.name} بنجاح`);
      setIsAddModalOpen(false);
      fetchCustomers();
    } catch {
      showToast('error', 'فشل في إضافة العميل');
    }
  };

  // Calculate stats from loaded customers
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const topCustomer = customers.length > 0
    ? customers.reduce((top, c) => c.totalSpent > top.totalSpent ? c : top, customers[0])
    : null;

  if (isLoading && customers.length === 0) {
    return (
      <MainLayout>
        <div className="animate-fadeIn">
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-lg">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">العملاء</h1>
                <p className="text-gray-500">إدارة وتتبع عملائك</p>
              </div>
            </div>
          </div>
          <SkeletonTable rows={8} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-lg">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">العملاء</h1>
                <p className="text-gray-500">إدارة وتتبع عملائك</p>
              </div>
            </div>
            <Button leftIcon={<Plus size={20} />} onClick={() => setIsAddModalOpen(true)}>
              إضافة عميل
            </Button>
          </div>

          {/* Sub-navigation tabs */}
          {subTabs.length > 1 && (
            <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
              {subTabs.map(tab => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                    location.pathname === tab.path
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-primary" />
                <p className="text-xs text-gray-600">إجمالي العملاء</p>
              </div>
              <p className="text-2xl font-bold text-primary font-numbers">{totalCustomers}</p>
            </div>

            <div className="bg-gradient-to-br from-accent-50 to-accent-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-accent-700" />
                <p className="text-xs text-gray-600">إجمالي الإيرادات</p>
              </div>
              <p className="text-xl font-bold text-accent-700 font-numbers">{formatCurrency(totalRevenue)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={18} className="text-orange-600" />
                <p className="text-xs text-gray-600">متوسط الإنفاق</p>
              </div>
              <p className="text-xl font-bold text-orange-600 font-numbers">{formatCurrency(averageSpent)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-purple-600" />
                <p className="text-xs text-gray-600">أفضل عميل</p>
              </div>
              <p className="text-sm font-bold text-purple-600 truncate">{topCustomer?.name || '-'}</p>
              <p className="text-xs text-gray-500 font-numbers">{topCustomer ? formatCurrency(topCustomer.totalSpent) : '-'}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الجوال، أو البريد الإلكتروني..."
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all"
              />
            </div>

            {/* Sort */}
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'totalSpent' | 'lastTransaction')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary bg-gray-50/50 transition-all"
              >
                <option value="name">الترتيب: الاسم</option>
                <option value="totalSpent">الترتيب: الإنفاق</option>
                <option value="lastTransaction">الترتيب: آخر تعامل</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="glass-card overflow-hidden animate-slideUp">
          {customers.length === 0 ? (
            searchQuery ? (
              <EmptyState
                icon={Search}
                title="لا توجد نتائج"
                description="جرب البحث بكلمات مختلفة أو تحقق من الإملاء"
              />
            ) : (
              <EmptyState
                icon={Users}
                title="لا يوجد عملاء بعد"
                description="ابدأ بإضافة عميلك الأول لتتبع مبيعاتك وعلاقاتك معهم"
                actionLabel="إضافة عميل"
                onAction={() => setIsAddModalOpen(true)}
              />
            )
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">العميل</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">معلومات الاتصال</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">إجمالي الإنفاق</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">العمليات</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">آخر تعامل</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold text-lg">
                                {customer.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{customer.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <span className="font-numbers">{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail size={14} />
                                <span>{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 font-numbers">
                            {formatCurrency(customer.totalSpent)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-numbers">{customer.transactionsCount}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500">{formatDate(customer.lastTransactionAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/customers/${customer.id}`}
                            className="inline-flex items-center gap-1 text-primary hover:text-primary-600 font-medium transition-colors"
                          >
                            <span>التفاصيل</span>
                            <ChevronLeft size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    السابق
                  </Button>
                  <span className="text-sm text-gray-500">
                    صفحة {page} من {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </MainLayout>
  );
}
