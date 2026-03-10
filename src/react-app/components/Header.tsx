import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Bell, Menu, ChevronDown, User, Settings, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationsService, Notification } from '../services';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notifResponse, statsResponse] = await Promise.all([
          notificationsService.list({ limit: 5 }),
          notificationsService.getStats()
        ]);
        setNotifications(notifResponse.data || []);
        setUnreadCount(statsResponse.unread);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const recentNotifications = notifications;
  const showBackButton = location.pathname !== '/';

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="px-3 md:px-5 py-2.5 md:py-3 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-primary px-3 py-2 hover:bg-primary-50 rounded-xl transition-all duration-200"
            >
              <ArrowRight size={20} />
              <span className="hidden sm:inline text-sm font-medium">الرئيسية</span>
            </button>
          )}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-primary p-2 hover:bg-primary-50 rounded-xl transition-all duration-200"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-500 hover:text-primary hover:bg-primary-50 rounded-xl transition-all duration-200"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute left-0 mt-2 w-80 glass-card z-50 animate-scaleIn overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">الإشعارات</h3>
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-sm text-primary hover:text-primary-400 font-medium"
                    >
                      عرض الكل
                    </Link>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        لا توجد إشعارات
                      </div>
                    ) : (
                      recentNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-primary-50/50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-primary-50/30' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              notification.type === 'payment' ? 'bg-accent' :
                              notification.type === 'invoice' ? 'bg-primary-300' :
                              notification.type === 'refund' ? 'bg-warning' :
                              'bg-gray-300'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                              <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString('ar-SY', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-primary-50 rounded-xl transition-all duration-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-sm">
                <User size={18} className="text-white" />
              </div>
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name || 'المستخدم'}</div>
                <div className="text-xs text-gray-500">{user?.merchantName || 'NavaPay'}</div>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute left-0 mt-2 w-64 glass-card z-50 animate-scaleIn overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-md">
                        <User size={22} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{user?.name || 'المستخدم'}</div>
                        <div className="text-sm text-gray-500">{user?.phone || ''}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 bg-primary-50 px-2.5 py-1.5 rounded-lg font-medium">
                      {user?.merchantName || 'NavaPay'}
                    </div>
                  </div>

                  <div className="p-2">
                    <Link to="/settings/profile" onClick={() => setShowUserMenu(false)}>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary rounded-xl transition-all duration-200 text-right">
                        <User size={18} />
                        <span className="font-medium">الملف الشخصي</span>
                      </button>
                    </Link>
                    <Link to="/settings" onClick={() => setShowUserMenu(false)}>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary rounded-xl transition-all duration-200 text-right">
                        <Settings size={18} />
                        <span className="font-medium">الإعدادات</span>
                      </button>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-error hover:bg-error/10 rounded-xl transition-all duration-200 text-right"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
