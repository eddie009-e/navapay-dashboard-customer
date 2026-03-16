import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Building2, Plus, Search, Users, DollarSign, TrendingUp, MapPin, Phone, Crown, Star, ChevronLeft, Loader2 } from 'lucide-react';
import Button from '@/react-app/components/Button';
import AddBranchModal from '@/react-app/components/AddBranchModal';
import { branchesService, Branch, CreateBranchDto } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';

export default function Branches() {
  const { isEnterprise } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY').format(amount) + ' ل.س';
  };

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      if (!isEnterprise) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await branchesService.list();
        setBranches(data);
      } catch (error) {
        console.error('Failed to load branches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranches();
  }, [isEnterprise]);

  const handleAddBranch = async (branchData: {
    name: string;
    address: string;
    phone: string;
    manager: string;
  }) => {
    try {
      const createData: CreateBranchDto = {
        name: branchData.name,
        code: branchData.name.substring(0, 3).toUpperCase() + Date.now().toString().slice(-4),
        address: branchData.address,
        phone: branchData.phone || undefined,
        managerEmployeeId: branchData.manager || undefined
      };

      const newBranch = await branchesService.create(createData);
      setBranches([...branches, newBranch]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create branch:', error);
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
          <p className="text-lg text-gray-500 mb-8">
            إدارة الفروع متاحة فقط في الباقة Enterprise. قم بالترقية للاستفادة من هذه الميزة.
          </p>
          <div className="glass-card p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">ما الذي ستحصل عليه؟</h3>
            <ul className="text-right space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-accent-700 text-xl">✓</span>
                <span>إضافة فروع متعددة لعملك</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-700 text-xl">✓</span>
                <span>تعيين مديرين وموظفين لكل فرع</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-700 text-xl">✓</span>
                <span>تتبع أداء ومبيعات كل فرع</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-700 text-xl">✓</span>
                <span>تقارير مفصلة لكل فرع على حدة</span>
              </li>
            </ul>
          </div>
          <Button size="lg" disabled className="opacity-50">
            الترقية للباقة Enterprise (قريباً)
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Filter branches
  const filteredBranches = branches.filter(branch => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        branch.name.toLowerCase().includes(query) ||
        branch.address.toLowerCase().includes(query) ||
        (branch.phone && branch.phone.includes(query)) ||
        (branch.managerName && branch.managerName.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Calculate stats
  const totalBranches = branches.length;
  const totalEmployees = branches.reduce((sum, b) => sum + b.employeesCount, 0);
  const totalSales = 0; // Would come from a separate stats endpoint
  const topBranch = branches[0] || null;

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الفروع</h1>
                <p className="text-gray-500">إدارة فروع العمل</p>
              </div>
            </div>
            <Button leftIcon={<Plus size={20} />} onClick={() => setIsAddModalOpen(true)}>
              إضافة فرع
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={20} className="text-primary" />
                <p className="text-sm text-gray-700">إجمالي الفروع</p>
              </div>
              <p className="text-3xl font-bold text-primary font-numbers">{totalBranches}</p>
            </div>

            <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-4 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-accent-700" />
                <p className="text-sm text-gray-700">إجمالي الموظفين</p>
              </div>
              <p className="text-3xl font-bold text-accent-700 font-numbers">{totalEmployees}</p>
            </div>

            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-accent" />
                <p className="text-sm text-gray-700">إجمالي المبيعات</p>
              </div>
              <p className="text-2xl font-bold text-accent font-numbers">{formatCurrency(totalSales)}</p>
            </div>

            <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl p-4 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-secondary" />
                <p className="text-sm text-gray-700">أفضل فرع</p>
              </div>
              <p className="text-lg font-bold text-secondary truncate">{topBranch?.name || '-'}</p>
              <p className="text-sm text-gray-500 font-numbers">-</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card p-6 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، العنوان، أو رقم الهاتف..."
              className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <Loader2 size={48} className="animate-spin text-primary" />
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="col-span-full">
              <div className="glass-card p-16 text-center">
                <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {searchQuery ? 'لا توجد نتائج' : 'لا يوجد فروع بعد'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة فرعك الأول'}
                </p>
                {!searchQuery && (
                  <Button leftIcon={<Plus size={20} />} onClick={() => setIsAddModalOpen(true)}>
                    إضافة فرع
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))
          )}
        </div>
      </div>

      {/* Add Branch Modal */}
      <AddBranchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBranch}
      />
    </MainLayout>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="glass-card hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <div className={`p-6 ${branch.isMain ? 'bg-gradient-to-br from-primary/10 to-primary/5' : 'bg-surface'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              branch.isMain ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {branch.name}
                {branch.isMain && (
                  <Star size={16} className="text-primary fill-primary" />
                )}
              </h3>
              {branch.isMain && (
                <span className="text-xs text-primary font-medium">الفرع الرئيسي</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin size={16} className="flex-shrink-0 mt-0.5" />
            <span>{branch.address}</span>
          </div>
          {branch.phone && (
            <div className="flex items-center gap-2 text-gray-700">
              <Phone size={16} className="flex-shrink-0" />
              <span className="font-numbers">{branch.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-surface rounded-xl">
            <p className="text-xs text-gray-500 mb-1">عدد الموظفين</p>
            <p className="text-2xl font-bold text-primary font-numbers">{branch.employeesCount}</p>
          </div>
          <div className="text-center p-3 bg-surface rounded-xl">
            <p className="text-xs text-gray-500 mb-1">المبيعات الشهرية</p>
            <p className="text-lg font-bold text-accent-700 font-numbers">-</p>
          </div>
        </div>

        {/* Manager */}
        <div className="mb-4 p-3 bg-surface rounded-xl">
          <p className="text-xs text-gray-500 mb-1">المدير المسؤول</p>
          <p className="font-medium text-gray-900">{branch.managerName || 'غير محدد'}</p>
        </div>

        {/* Actions */}
        <Link to={`/branches/${branch.id}`}>
          <Button variant="outline" size="sm" fullWidth leftIcon={<ChevronLeft size={16} />}>
            عرض التفاصيل
          </Button>
        </Link>
      </div>
    </div>
  );
}
