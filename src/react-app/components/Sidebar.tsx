import { Link, useLocation } from 'react-router';
import {
  Home, CreditCard, FileText, BarChart3, Wallet, Users,
  Settings, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  label: string;
  icon: any;
  path: string;
}

const navigation: NavItem[] = [
  { label: 'الرئيسية', icon: Home, path: '/' },
  { label: 'نقطة البيع', icon: CreditCard, path: '/pos' },
  { label: 'المحفظة', icon: Wallet, path: '/wallet' },
  { label: 'العمليات', icon: BarChart3, path: '/transactions' },
  { label: 'الفواتير', icon: FileText, path: '/invoices' },
  { label: 'التقارير', icon: BarChart3, path: '/reports' },
  { label: 'العملاء', icon: Users, path: '/customers' },
  { label: 'الإعدادات', icon: Settings, path: '/settings' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const storeName = user?.merchantName || 'NavaPay';
  const isEnterprise = user?.plan === 'enterprise';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50
          w-[260px] transform transition-transform duration-300 ease-in-out
          bg-white/95 backdrop-blur-xl shadow-glass
          lg:translate-x-0 lg:static
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-lg font-bold text-white">NP</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-primary">NavaPay</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-sm text-gray-500 font-medium">{storeName}</div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                >
                  <div
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${active
                        ? 'bg-primary/10 text-primary border-r-[3px] border-primary font-bold'
                        : 'text-gray-600 hover:bg-primary-50 hover:text-primary-500'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer - Plan Badge */}
          <div className="p-3 border-t border-gray-100">
            <div className="px-3 py-2.5 bg-gradient-to-l from-primary-50 to-accent-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">
                  {isEnterprise ? 'Enterprise' : 'POS'}
                </span>
                {!isEnterprise && (
                  <button className="text-xs font-medium text-accent hover:text-accent-600 transition-colors">
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
