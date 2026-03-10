import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { Home, CreditCard, Wallet, BarChart3, MoreHorizontal } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const bottomTabs = [
  { label: 'الرئيسية', icon: Home, path: '/' },
  { label: 'POS', icon: CreditCard, path: '/pos' },
  { label: 'المحفظة', icon: Wallet, path: '/wallet' },
  { label: 'العمليات', icon: BarChart3, path: '/transactions' },
];

export default function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-bottom-bar">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                  active
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
          {/* More button - opens sidebar */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-medium">المزيد</span>
          </button>
        </div>
      </div>
    </div>
  );
}
