import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Users, Search, Plus, Mail, Phone, TrendingUp, DollarSign, ChevronLeft, Crown, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import AddEmployeeModal from '@/react-app/components/AddEmployeeModal';
import { employeesService, Employee, CreateEmployeeDto } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';

export default function Employees() {
  const { isEnterprise } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'cashier' | 'accountant'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      if (!isEnterprise) {
        setIsLoading(false);
        return;
      }

      try {
        const params: { role?: string; branchId?: string } = {};
        if (roleFilter !== 'all') params.role = roleFilter;

        const response = await employeesService.list(params);
        setEmployees(response.data ?? []);
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [isEnterprise, roleFilter]);

  const handleAddEmployee = async (employeeData: {
    name: string;
    phone: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier' | 'accountant';
    branch: string;
    pin: string;
  }) => {
    try {
      const createData: CreateEmployeeDto = {
        name: employeeData.name,
        phone: employeeData.phone,
        email: employeeData.email || undefined,
        role: employeeData.role,
        pin: employeeData.pin,
        permissions: [],
        branchId: employeeData.branch || undefined
      };

      const newEmployee = await employeesService.create(createData);
      setEmployees([newEmployee, ...employees]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

  if (!isEnterprise) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Crown size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">ميزة مخصصة للباقة Enterprise</h2>
          <p className="text-lg text-gray-600 mb-8">
            إدارة الموظفين والفروع متاحة فقط في الباقة Enterprise. قم بالترقية للاستفادة من هذه الميزة.
          </p>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
            <h3 className="font-bold text-gray-900 mb-4">ما الذي ستحصل عليه؟</h3>
            <ul className="text-right space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-success text-xl">✓</span>
                <span>إضافة موظفين غير محدودين مع صلاحيات مخصصة</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success text-xl">✓</span>
                <span>إدارة فروع متعددة وتتبع أداء كل فرع</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success text-xl">✓</span>
                <span>تقارير تفصيلية لأداء الموظفين والفروع</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success text-xl">✓</span>
                <span>نظام رواتب متكامل ودفعات جماعية</span>
              </li>
            </ul>
          </div>
          <Button size="lg">
            الترقية للباقة Enterprise
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const isActive = employee.isActive;
    if (statusFilter === 'active' && !isActive) return false;
    if (statusFilter === 'suspended' && isActive) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.phone.includes(query) ||
        (employee.email && employee.email.toLowerCase().includes(query)) ||
        (employee.branchName && employee.branchName.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.isActive).length;
  const totalSales = 0; // Would come from a separate stats endpoint
  const topEmployee = employees[0] || null;

  const getRoleBadge = (role: Employee['role']) => {
    const badges: Record<string, { text: string; class: string }> = {
      owner: { text: 'مالك', class: 'bg-purple-100 text-purple-700' },
      admin: { text: 'مدير', class: 'bg-red-100 text-red-700' },
      manager: { text: 'مشرف', class: 'bg-primary-100 text-primary-700' },
      cashier: { text: 'كاشير', class: 'bg-accent-100 text-accent-700' },
      accountant: { text: 'محاسب', class: 'bg-secondary-100 text-secondary-700' }
    };
    return badges[role] || { text: role, class: 'bg-gray-100 text-gray-700' };
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? { text: 'نشط', class: 'bg-success/10 text-success' }
      : { text: 'معلق', class: 'bg-gray-100 text-gray-700' };
  };

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الموظفين</h1>
                <p className="text-gray-600">إدارة وتتبع فريق العمل</p>
              </div>
            </div>
            <Button leftIcon={<Plus size={20} />} onClick={() => setIsAddModalOpen(true)}>
              إضافة موظف
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-primary" />
                <p className="text-sm text-gray-700">إجمالي الموظفين</p>
              </div>
              <p className="text-3xl font-bold text-primary font-numbers">{totalEmployees}</p>
            </div>

            <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-4 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-success" />
                <p className="text-sm text-gray-700">الموظفون النشطون</p>
              </div>
              <p className="text-3xl font-bold text-success font-numbers">{activeEmployees}</p>
            </div>

            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-accent" />
                <p className="text-sm text-gray-700">إجمالي المبيعات</p>
              </div>
              <p className="text-2xl font-bold text-accent font-numbers">{formatCurrency(totalSales)}</p>
            </div>

            <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg p-4 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-secondary" />
                <p className="text-sm text-gray-700">أفضل موظف</p>
              </div>
              <p className="text-lg font-bold text-secondary truncate">{topEmployee?.name || '-'}</p>
              <p className="text-sm text-gray-600 font-numbers">-</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الجوال، أو الفرع..."
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'manager' | 'cashier' | 'accountant')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
              >
                <option value="all">كل الصلاحيات</option>
                <option value="admin">مدير</option>
                <option value="manager">مشرف</option>
                <option value="cashier">كاشير</option>
                <option value="accountant">محاسب</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary transition-colors"
              >
                <option value="all">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="suspended">معلق</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={48} className="animate-spin text-primary" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-16">
              <Users size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'لا توجد نتائج' : 'لا يوجد موظفين بعد'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة موظفك الأول'}
              </p>
              {!searchQuery && (
                <Button leftIcon={<Plus size={20} />} onClick={() => setIsAddModalOpen(true)}>
                  إضافة موظف
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الموظف</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">معلومات الاتصال</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الصلاحية</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الفرع</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الإحصائيات</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">آخر دخول</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => {
                    const roleBadge = getRoleBadge(employee.role);
                    const statusBadge = getStatusBadge(employee.isActive);

                    return (
                      <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold text-lg">
                                {employee.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{employee.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone size={14} />
                              <span className="font-numbers">{employee.phone}</span>
                            </div>
                            {employee.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail size={14} />
                                <span>{employee.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleBadge.class}`}>
                            {roleBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{employee.branchName || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900 font-numbers">-</p>
                            <p className="text-gray-600 font-numbers">-</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 font-numbers">
                            {employee.lastLoginAt ? formatDateTime(employee.lastLoginAt) : '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.class}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/employees/${employee.id}`}
                            className="inline-flex items-center gap-1 text-primary hover:text-primary-600 font-medium transition-colors"
                          >
                            <span>التفاصيل</span>
                            <ChevronLeft size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEmployee}
      />
    </MainLayout>
  );
}
