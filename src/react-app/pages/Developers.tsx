import { useState, useEffect } from 'react';
import MainLayout from '@/react-app/components/MainLayout';
import { Code2, Key, Activity, Book, Plus, Copy, Eye, EyeOff, Trash2, CheckCircle, AlertCircle, Clock, Webhook, Send } from 'lucide-react';
import Button from '@/react-app/components/Button';
import { SkeletonTable } from '@/react-app/components/LoadingSpinner';
import { developersService, ApiKey, Webhook as WebhookType, ApiLog, CreateApiKeyDto, CreateWebhookDto } from '../services';

export default function Developers() {
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'logs' | 'docs'>('keys');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateWebhookModalOpen, setIsCreateWebhookModalOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [_selectedLog, _setSelectedLog] = useState<ApiLog | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [keysData, webhooksData, logsData] = await Promise.all([
          developersService.listApiKeys(),
          developersService.listWebhooks(),
          developersService.getApiLogs()
        ]);

        setApiKeys(keysData);
        setWebhooks(webhooksData);
        setApiLogs(logsData.data ?? []);
      } catch (error) {
        console.error('Failed to load developer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Create API Key
  const handleCreateApiKey = async (data: CreateApiKeyDto) => {
    try {
      const newKey = await developersService.createApiKey(data);
      setApiKeys([newKey, ...apiKeys]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  // Revoke API Key
  const handleRevokeApiKey = async (id: string) => {
    try {
      await developersService.revokeApiKey(id);
      setApiKeys(apiKeys.filter(k => k.id !== id));
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  // Create Webhook
  const handleCreateWebhook = async (data: CreateWebhookDto) => {
    try {
      const newWebhook = await developersService.createWebhook(data);
      setWebhooks([newWebhook, ...webhooks]);
      setIsCreateWebhookModalOpen(false);
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  // Delete Webhook
  const handleDeleteWebhook = async (id: string) => {
    try {
      await developersService.deleteWebhook(id);
      setWebhooks(webhooks.filter(w => w.id !== id));
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const toggleSecretVisibility = (webhookId: string) => {
    setVisibleSecrets(prev => {
      const next = new Set(prev);
      if (next.has(webhookId)) {
        next.delete(webhookId);
      } else {
        next.add(webhookId);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ar-SY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-accent-700';
    if (status >= 400 && status < 500) return 'text-warning';
    return 'text-error';
  };

  /* Reserved for future webhook delivery status display
  const getDeliveryStatusColor = (status: 'success' | 'failed' | 'pending') => {
    if (status === 'success') return 'bg-success/20 text-accent-700';
    if (status === 'failed') return 'bg-error/20 text-error';
    return 'bg-warning/20 text-warning';
  }; */

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Code2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">المطورين</h1>
              <p className="text-gray-500">إدارة مفاتيح API ومراقبة الطلبات والأحداث</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Key size={20} className="text-primary" />
                <p className="text-sm text-gray-700">مفاتيح API</p>
              </div>
              <p className="text-3xl font-bold text-primary font-numbers">
                {apiKeys.filter(k => k.isActive).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">نشط من أصل {apiKeys.length}</p>
            </div>

            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Webhook size={20} className="text-accent" />
                <p className="text-sm text-gray-700">Webhooks</p>
              </div>
              <p className="text-3xl font-bold text-accent font-numbers">
                {webhooks.filter(w => w.isActive).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">نشط من أصل {webhooks.length}</p>
            </div>

            <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-4 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={20} className="text-accent-700" />
                <p className="text-sm text-gray-700">الطلبات اليوم</p>
              </div>
              <p className="text-3xl font-bold text-accent-700 font-numbers">{apiLogs.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {apiLogs.length > 0
                  ? `معدل النجاح ${Math.round((apiLogs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length / apiLogs.length) * 100)}%`
                  : '-'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-warning/5 to-warning/10 rounded-xl p-4 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-warning" />
                <p className="text-sm text-gray-700">متوسط الاستجابة</p>
              </div>
              <p className="text-3xl font-bold text-warning font-numbers">
                {apiLogs.length > 0
                  ? Math.round(apiLogs.reduce((sum, l) => sum + l.responseTimeMs, 0) / apiLogs.length)
                  : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-1">ميلي ثانية</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-6">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('keys')}
              className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'keys'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-primary-50/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Key size={20} />
                <span>مفاتيح API</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'webhooks'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-primary-50/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Webhook size={20} />
                <span>Webhooks</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-primary-50/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity size={20} />
                <span>سجل الطلبات</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex-1 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-primary-50/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Book size={20} />
                <span>التوثيق</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'keys' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">مفاتيح API</h2>
                    <p className="text-sm text-gray-500">إدارة مفاتيح الوصول إلى API</p>
                  </div>
                  <Button leftIcon={<Plus size={20} />} onClick={() => setIsCreateModalOpen(true)}>
                    إنشاء مفتاح جديد
                  </Button>
                </div>

                {isLoading ? (
                  <SkeletonTable rows={5} />
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-16">
                    <Key size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد مفاتيح API</h3>
                    <p className="text-gray-500 mb-6">قم بإنشاء مفتاح API للبدء</p>
                    <Button leftIcon={<Plus size={20} />} onClick={() => setIsCreateModalOpen(true)}>
                      إنشاء مفتاح جديد
                    </Button>
                  </div>
                ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className={`border-2 rounded-xl p-6 transition-all ${
                        key.isActive
                          ? 'border-success/30 bg-success/5'
                          : 'border-gray-100 bg-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{key.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              key.isActive
                                ? 'bg-accent-50 text-accent-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {key.isActive ? (
                                <>
                                  <CheckCircle size={12} />
                                  نشط
                                </>
                              ) : (
                                <>
                                  <AlertCircle size={12} />
                                  معطل
                                </>
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            تم الإنشاء في {formatDateTime(key.createdAt)}
                          </p>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 font-mono text-sm">
                              {visibleKeys.has(key.id)
                                ? `****${key.lastFour}`
                                : `••••••••••••${key.lastFour}`}
                            </div>
                            <button
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
                              title={visibleKeys.has(key.id) ? 'إخفاء' : 'عرض'}
                            >
                              {visibleKeys.has(key.id) ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="glass-card p-3">
                              <p className="text-xs text-gray-500 mb-1">الصلاحيات</p>
                              <p className="text-sm font-medium text-gray-900">
                                {key.permissions.length > 0 ? key.permissions.join(', ') : 'كل الصلاحيات'}
                              </p>
                            </div>
                            <div className="glass-card p-3">
                              <p className="text-xs text-gray-500 mb-1">آخر استخدام</p>
                              <p className="text-sm font-medium text-gray-900">
                                {key.lastUsedAt ? formatDateTime(key.lastUsedAt).split(',')[0] : 'لم يستخدم'}
                              </p>
                            </div>
                            <div className="glass-card p-3">
                              <p className="text-xs text-gray-500 mb-1">تاريخ الانتهاء</p>
                              <p className="text-sm font-medium text-gray-900">
                                {key.expiresAt ? formatDateTime(key.expiresAt).split(',')[0] : 'لا ينتهي'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRevokeApiKey(key.id)}
                          className="p-2 hover:bg-error/10 text-error rounded-xl transition-colors"
                          title="إلغاء"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Webhooks</h2>
                    <p className="text-sm text-gray-500">استقبال إشعارات الأحداث في تطبيقك</p>
                  </div>
                  <Button leftIcon={<Plus size={20} />} onClick={() => setIsCreateWebhookModalOpen(true)}>
                    إنشاء Webhook
                  </Button>
                </div>

                {isLoading ? (
                  <SkeletonTable rows={5} />
                ) : webhooks.length === 0 ? (
                  <div className="text-center py-16">
                    <Webhook size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد Webhooks</h3>
                    <p className="text-gray-500 mb-6">قم بإنشاء Webhook لاستقبال الإشعارات</p>
                    <Button leftIcon={<Plus size={20} />} onClick={() => setIsCreateWebhookModalOpen(true)}>
                      إنشاء Webhook
                    </Button>
                  </div>
                ) : (
                <>
                {/* Webhooks List */}
                <div className="space-y-4 mb-8">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className={`border-2 rounded-xl p-6 transition-all ${
                        webhook.isActive
                          ? 'border-success/30 bg-success/5'
                          : 'border-gray-100 bg-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{webhook.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              webhook.isActive
                                ? 'bg-accent-50 text-accent-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {webhook.isActive ? (
                                <>
                                  <CheckCircle size={12} />
                                  نشط
                                </>
                              ) : (
                                <>
                                  <AlertCircle size={12} />
                                  معطل
                                </>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 font-mono text-sm break-all">
                              {webhook.url}
                            </div>
                            <button
                              onClick={() => copyToClipboard(webhook.url)}
                              className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors flex-shrink-0"
                              title="نسخ"
                            >
                              <Copy size={20} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <p className="text-xs text-gray-500">Signing Secret:</p>
                            <div className="flex-1 bg-gray-100 rounded-xl px-4 py-2 font-mono text-xs">
                              {visibleSecrets.has(webhook.id)
                                ? webhook.secret
                                : webhook.secret.slice(0, 15) + '•••••••••••'}
                            </div>
                            <button
                              onClick={() => toggleSecretVisibility(webhook.id)}
                              className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
                              title={visibleSecrets.has(webhook.id) ? 'إخفاء' : 'عرض'}
                            >
                              {visibleSecrets.has(webhook.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(webhook.secret)}
                              className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
                              title="نسخ"
                            >
                              <Copy size={18} />
                            </button>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">الأحداث المفعلة:</p>
                            <div className="flex flex-wrap gap-2">
                              {webhook.events.map((event) => (
                                <span
                                  key={event}
                                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-mono"
                                >
                                  {event}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="glass-card p-3">
                              <p className="text-xs text-gray-500 mb-1">التسليمات الناجحة</p>
                              <p className="text-lg font-bold text-accent-700 font-numbers">
                                {webhook.successCount.toLocaleString()}
                              </p>
                            </div>
                            <div className="glass-card p-3">
                              <p className="text-xs text-gray-500 mb-1">التسليمات الفاشلة</p>
                              <p className="text-lg font-bold text-error font-numbers">
                                {webhook.failureCount.toLocaleString()}
                              </p>
                            </div>
                            <div className="glass-card p-3">
                              <p className="text-xs text-gray-500 mb-1">آخر تفعيل</p>
                              <p className="text-sm font-medium text-gray-900">
                                {webhook.lastTriggeredAt ? formatDateTime(webhook.lastTriggeredAt).split(',')[0] : 'لم يفعل'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="p-2 hover:bg-error/10 text-error rounded-xl transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                </>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">سجل الطلبات</h2>
                  <p className="text-sm text-gray-500">مراقبة استخدام API في الوقت الفعلي</p>
                </div>

                {isLoading ? (
                  <SkeletonTable rows={8} />
                ) : apiLogs.length === 0 ? (
                  <div className="text-center py-16">
                    <Activity size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات</h3>
                    <p className="text-gray-500">لم يتم تسجيل أي طلبات API بعد</p>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الوقت</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الطريقة</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">نقطة النهاية</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">زمن الاستجابة</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {apiLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-primary-50/20 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900 font-numbers">
                                {formatDateTime(log.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${
                                log.method === 'GET' ? 'bg-primary/10 text-primary' :
                                log.method === 'POST' ? 'bg-accent-50 text-accent-700' :
                                log.method === 'PUT' || log.method === 'PATCH' ? 'bg-accent/10 text-accent' :
                                'bg-error/10 text-error'
                              }`}>
                                {log.method}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900 font-mono">{log.endpoint}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold font-mono ${getStatusColor(log.statusCode)}`}>
                                {log.statusCode}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900 font-numbers">
                                {log.responseTimeMs} ms
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-500 truncate max-w-[150px] inline-block font-mono">
                                {log.ipAddress || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">توثيق NavaPay API</h2>
                <p className="text-gray-700 mb-6">
                  استخدم NavaPay API لدمج نظام الدفع في تطبيقاتك وخدماتك.
                </p>

                <div className="bg-surface rounded-xl p-6 border border-gray-100 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">نقطة النهاية الأساسية</h3>
                  <code className="block bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm">
                    https://api.navapay.com/v1
                  </code>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">المصادقة</h3>
                    <p className="text-gray-700 mb-3">
                      استخدم مفتاح API في رأس Authorization:
                    </p>
                    <div className="bg-gray-900 text-white p-4 rounded-xl font-mono text-sm overflow-x-auto">
                      <div className="text-gray-500">// cURL</div>
                      <div className="text-green-400">curl -X GET \</div>
                      <div className="text-green-400 mr-4">https://api.navapay.com/v1/payments \</div>
                      <div className="text-green-400 mr-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Webhooks</h3>
                    <p className="text-gray-700 mb-3">
                      استقبل إشعارات فورية عند حدوث أحداث معينة في حسابك. يتم إرسال POST request إلى URL المسجل مع توقيع HMAC للتحقق.
                    </p>
                    <div className="bg-surface rounded-xl p-4 border border-gray-100 mb-3">
                      <p className="text-sm font-bold text-gray-900 mb-2">الأحداث المتاحة:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li><code className="bg-gray-200 px-2 py-0.5 rounded text-xs">payment.completed</code> - اكتملت عملية الدفع</li>
                        <li><code className="bg-gray-200 px-2 py-0.5 rounded text-xs">payment.failed</code> - فشلت عملية الدفع</li>
                        <li><code className="bg-gray-200 px-2 py-0.5 rounded text-xs">invoice.created</code> - تم إنشاء فاتورة جديدة</li>
                        <li><code className="bg-gray-200 px-2 py-0.5 rounded text-xs">invoice.paid</code> - تم دفع الفاتورة</li>
                        <li><code className="bg-gray-200 px-2 py-0.5 rounded text-xs">invoice.overdue</code> - تأخرت الفاتورة</li>
                        <li><code className="bg-gray-200 px-2 py-0.5 rounded text-xs">refund.completed</code> - اكتمل الاسترجاع</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 text-white p-4 rounded-xl font-mono text-sm overflow-x-auto">
                      <div className="text-gray-500">// التحقق من التوقيع (Node.js)</div>
                      <div className="text-green-400">const crypto = require('crypto');</div>
                      <div className="text-green-400">const signature = req.headers['x-navapay-signature'];</div>
                      <div className="text-green-400">const hash = crypto</div>
                      <div className="text-green-400 mr-4">.createHmac('sha256', WEBHOOK_SECRET)</div>
                      <div className="text-green-400 mr-4">.update(JSON.stringify(req.body))</div>
                      <div className="text-green-400 mr-4">.digest('hex');</div>
                      <div className="text-green-400">if (hash === signature) {'{'} /* verified */ {'}'}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">إنشاء دفعة</h3>
                    <div className="bg-gray-900 text-white p-4 rounded-xl font-mono text-sm overflow-x-auto mb-3">
                      <div className="text-gray-500">// POST /v1/payments</div>
                      <div className="text-green-400">{'{'}</div>
                      <div className="text-green-400 mr-4">"amount": 250000,</div>
                      <div className="text-green-400 mr-4">"customer_phone": "0912345678",</div>
                      <div className="text-green-400 mr-4">"method": "nfc",</div>
                      <div className="text-green-400 mr-4">"description": "عملية شراء"</div>
                      <div className="text-green-400">{'}'}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">رموز الحالة</h3>
                    <div className="bg-surface rounded-xl p-4 border border-gray-100">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-3">
                          <span className="font-mono text-accent-700 font-bold">200</span>
                          <span className="text-gray-700">نجح الطلب</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="font-mono text-accent-700 font-bold">201</span>
                          <span className="text-gray-700">تم الإنشاء بنجاح</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="font-mono text-warning font-bold">400</span>
                          <span className="text-gray-700">طلب غير صالح</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="font-mono text-warning font-bold">401</span>
                          <span className="text-gray-700">غير مصرح</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="font-mono text-error font-bold">500</span>
                          <span className="text-gray-700">خطأ في الخادم</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateAPIKeyModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateApiKey}
        />
      )}

      {isCreateWebhookModalOpen && (
        <CreateWebhookModal
          onClose={() => setIsCreateWebhookModalOpen(false)}
          onCreate={handleCreateWebhook}
        />
      )}
    </MainLayout>
  );
}

function CreateAPIKeyModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: CreateApiKeyDto) => void }) {
  const [keyName, setKeyName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['transactions:read']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!keyName.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate({
        name: keyName,
        permissions: permissions.length > 0 ? permissions : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permission: string) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-card bg-white/95 backdrop-blur-xl max-w-lg w-full p-8 shadow-2xl animate-slideUp">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">إنشاء مفتاح API جديد</h3>
            <p className="text-gray-500">قم بإنشاء مفتاح API للوصول إلى خدمات NavaPay</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              اسم المفتاح
            </label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="مثال: Production API Key"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              الصلاحيات
            </label>
            <div className="space-y-3">
              <button
                onClick={() => togglePermission('read')}
                className={`w-full p-4 rounded-xl border-2 text-right transition-all ${
                  permissions.includes('read')
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    permissions.includes('read')
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {permissions.includes('read') && (
                      <CheckCircle size={14} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">قراءة (Read)</p>
                    <p className="text-sm text-gray-500">الوصول لقراءة البيانات فقط</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => togglePermission('write')}
                className={`w-full p-4 rounded-xl border-2 text-right transition-all ${
                  permissions.includes('write')
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    permissions.includes('write')
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {permissions.includes('write') && (
                      <CheckCircle size={14} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">كتابة (Write)</p>
                    <p className="text-sm text-gray-500">إنشاء وتعديل البيانات</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">تنبيه أمان</p>
                <p className="text-sm text-gray-700">
                  احتفظ بمفتاح API في مكان آمن. لن تتمكن من رؤيته مرة أخرى بعد إنشائه.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} fullWidth>
            إلغاء
          </Button>
          <Button fullWidth disabled={!keyName.trim() || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المفتاح'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreateWebhookModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: CreateWebhookDto) => void }) {
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableEvents = [
    'payment.completed',
    'payment.failed',
    'payment.refunded',
    'invoice.created',
    'invoice.paid',
    'invoice.overdue',
    'transfer.completed',
    'transfer.failed'
  ];

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const handleSubmit = async () => {
    if (!webhookName.trim() || !webhookUrl.trim() || selectedEvents.length === 0) return;
    setIsSubmitting(true);
    try {
      await onCreate({
        name: webhookName,
        url: webhookUrl,
        events: selectedEvents
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="glass-card bg-white/95 backdrop-blur-xl max-w-2xl w-full p-8 shadow-2xl animate-slideUp my-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">إنشاء Webhook جديد</h3>
            <p className="text-gray-500">استقبل إشعارات الأحداث في تطبيقك</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-50/20 rounded-xl transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              اسم Webhook
            </label>
            <input
              type="text"
              value={webhookName}
              onChange={(e) => setWebhookName(e.target.value)}
              placeholder="مثال: Production Webhook"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              URL نقطة النهاية
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://example.com/api/webhooks/navapay"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              سيتم إرسال POST requests إلى هذا العنوان عند حدوث الأحداث المختارة
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              الأحداث المطلوبة
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableEvents.map((event) => (
                <button
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={`p-4 rounded-xl border-2 text-right transition-all ${
                    selectedEvents.includes(event)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedEvents.includes(event)
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {selectedEvents.includes(event) && (
                        <CheckCircle size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm text-gray-900">{event}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex gap-3">
              <Send size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">معلومة</p>
                <p className="text-sm text-gray-700">
                  سيتم توليد Signing Secret تلقائياً للتحقق من صحة الإشعارات. استخدمه للتحقق من توقيع HMAC في header: x-navapay-signature
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} fullWidth>
            إلغاء
          </Button>
          <Button fullWidth disabled={!webhookName.trim() || !webhookUrl.trim() || selectedEvents.length === 0 || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء Webhook'}
          </Button>
        </div>
      </div>
    </div>
  );
}
