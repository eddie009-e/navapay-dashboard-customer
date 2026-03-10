import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Home, CreditCard, FileText, BarChart3, Wallet, Users,
  UserCog, DollarSign, Building2, Code, Settings, ChevronDown,
  ChevronUp, Lock, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  label: string;
  icon: any;
  path: string;
  locked?: boolean;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: 'الرئيسية', icon: Home, path: '/' },
  { label: 'نقطة البيع', icon: CreditCard, path: '/pos' },
  { 
    label: 'الفواتير', 
    icon: FileText, 
    path: '/invoices',
    children: [
      { label: 'كل الفواتير', icon: FileText, path: '/invoices' },
      { label: 'الدورية', icon: FileText, path: '/invoices/recurring', locked: true },
      { label: 'روابط الدفع', icon: FileText, path: '/invoices/payment-links' },
    ]
  },
  { label: 'العمليات', icon: BarChart3, path: '/transactions' },
  { 
    label: 'التقارير', 
    icon: BarChart3, 
    path: '/reports',
    children: [
      { label: 'نظرة عامة', icon: BarChart3, path: '/reports' },
      { label: 'المبيعات', icon: BarChart3, path: '/reports/sales' },
      { label: 'اليومي', icon: BarChart3, path: '/reports/daily' },
      { label: 'الشهري', icon: BarChart3, path: '/reports/monthly' },
      { label: 'السنوي', icon: BarChart3, path: '/reports/yearly' },
      { label: 'الموظفين', icon: BarChart3, path: '/reports/employees', locked: true },
      { label: 'الفروع', icon: BarChart3, path: '/reports/branches', locked: true },
      { label: 'المالي', icon: BarChart3, path: '/reports/financial', locked: true },
    ]
  },
  { label: 'المحفظة', icon: Wallet, path: '/wallet' },
  { label: 'العملاء', icon: Users, path: '/customers' },
];

const enterpriseNavigation: NavItem[] = [
  { label: 'الموظفين', icon: UserCog, path: '/employees', locked: true },
  { label: 'الرواتب', icon: DollarSign, path: '/payroll', locked: true },
  { label: 'الفروع', icon: Building2, path: '/branches', locked: true },
  { label: 'المطورين', icon: Code, path: '/developers', locked: true },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const isEnterprise = user?.plan === 'enterprise';
  const storeName = user?.merchantName || 'NavaPay';

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children?: NavItem[]) => 
    children?.some(child => location.pathname === child.path) || false;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 right-0 h-full bg-white shadow-xl z-50 
          w-64 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-lg
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">NP</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-primary">NavaPay</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="text-sm text-gray-600 font-medium">{storeName}</div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => (
              <NavItemComponent
                key={item.label}
                item={item}
                isActive={isActive}
                isParentActive={isParentActive}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
                onClose={onClose}
              />
            ))}

            {/* Enterprise Section */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Enterprise
              </div>
              {enterpriseNavigation.map((item) => (
                <NavItemComponent
                  key={item.label}
                  item={item}
                  isActive={isActive}
                  isParentActive={isParentActive}
                  expandedItems={expandedItems}
                  toggleExpanded={toggleExpanded}
                  onClose={onClose}
                  showLockIcon
                />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link to="/settings" onClick={onClose}>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={20} />
                <span className="font-medium">الإعدادات</span>
              </button>
            </Link>
            
            {/* Plan Badge */}
            <div className="mt-3 px-3 py-2 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  {isEnterprise ? 'Enterprise' : 'POS'}
                </span>
                {!isEnterprise && (
                  <button className="text-xs font-medium text-primary hover:text-primary-600">
                    ترقية
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItemComponent({ 
  item, 
  isActive, 
  isParentActive,
  expandedItems, 
  toggleExpanded,
  onClose,
  showLockIcon = false
}: { 
  item: NavItem; 
  isActive: (path: string) => boolean;
  isParentActive: (children?: NavItem[]) => boolean;
  expandedItems: string[];
  toggleExpanded: (label: string) => void;
  onClose: () => void;
  showLockIcon?: boolean;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.includes(item.label);
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => toggleExpanded(item.label)}
          className={`
            w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors
            ${isParentActive(item.children) ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}
          `}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="font-medium">{item.label}</span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isExpanded && (
          <div className="mr-4 mt-1 space-y-1">
            {item.children?.map((child) => (
              <Link 
                key={child.path} 
                to={child.locked ? '#' : child.path}
                onClick={(e) => {
                  if (child.locked) {
                    e.preventDefault();
                    // Show upgrade modal
                  } else {
                    onClose();
                  }
                }}
              >
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive(child.path) ? 'bg-primary-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}
                    ${child.locked ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="text-sm">{child.label}</span>
                  {child.locked && <Lock size={14} className="text-gray-400" />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link 
      to={item.locked ? '#' : item.path}
      onClick={(e) => {
        if (item.locked) {
          e.preventDefault();
          // Show upgrade modal
        } else {
          onClose();
        }
      }}
    >
      <div
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
          ${isActive(item.path) ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}
          ${item.locked ? 'opacity-60' : ''}
        `}
      >
        <Icon size={20} />
        <span className="font-medium flex-1">{item.label}</span>
        {(item.locked || showLockIcon) && <Lock size={16} className="text-gray-400" />}
      </div>
    </Link>
  );
}
