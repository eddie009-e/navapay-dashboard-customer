import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Bell, Check, CheckCheck, Trash2, DollarSign, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { SkeletonList } from '@/react-app/components/LoadingSpinner';
import { notificationsService, Notification } from '../services';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationsService.list({ limit: 100 });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return <DollarSign size={20} className="text-accent-700" />;
      case 'invoice':
        return <FileText size={20} className="text-warning" />;
      case 'refund':
        return <RefreshCw size={20} className="text-error" />;
      case 'system':
        return <AlertCircle size={20} className="text-primary" />;
    }
  };

  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return 'bg-accent-50';
      case 'invoice':
        return 'bg-warning/10';
      case 'refund':
        return 'bg-error/10';
      case 'system':
        return 'bg-primary/10';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;

    return date.toLocaleDateString('ar-SY', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bell size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الإشعارات</h1>
                {unreadCount > 0 && (
                  <p className="text-gray-500">لديك {unreadCount} إشعار غير مقروء</p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/5 rounded-xl transition-colors font-medium"
              >
                <CheckCheck size={18} />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              غير مقروءة ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <SkeletonList items={5} />
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? 'رائع! لقد قرأت جميع إشعاراتك'
                : 'ستظهر الإشعارات الجديدة هنا'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`glass-card p-5 transition-all group hover:shadow-md ${
                  notification.read
                    ? ''
                    : 'border-primary/20 shadow-sm'
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className={`font-bold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
                        >
                          <Check size={14} />
                          <span>تحديد كمقروء</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/5 rounded-xl transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
