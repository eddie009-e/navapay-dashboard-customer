import { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';

import { useToast } from '@/react-app/contexts/ToastContext';
import { categoriesService } from '@/react-app/services/categories.service';
import type { Category, CreateCategoryDto } from '@/react-app/services/categories.service';

const PRESET_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#64748b'];

export default function TransactionCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [systemCategories, setSystemCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateCategoryDto>({ name: '', nameAr: '', color: PRESET_COLORS[0] });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [merchantRes, systemRes] = await Promise.all([
        categoriesService.list(),
        categoriesService.getSystem(),
      ]);
      if (Array.isArray(merchantRes)) setCategories(merchantRes);
      if (Array.isArray(systemRes)) setSystemCategories(systemRes);
    } catch {
      // Silent — show empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editId) {
        await categoriesService.update(editId, form);
      } else {
        await categoriesService.create(form);
      }
      setShowCreate(false);
      setEditId(null);
      setForm({ name: '', nameAr: '', color: PRESET_COLORS[0] });
      fetchCategories();
    } catch {
      showToast('error', 'فشل في حفظ التصنيف');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try {
      await categoriesService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch {
      showToast('error', 'فشل في حذف التصنيف');
    }
  };

  const startEdit = (cat: Category) => {
    setForm({ name: cat.name, nameAr: cat.nameAr, color: cat.color || PRESET_COLORS[0] });
    setEditId(cat.id);
    setShowCreate(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Tag className="w-7 h-7 text-primary" />
              تصنيفات المعاملات
            </h1>
            <p className="text-gray-500 mt-1">تنظيم المعاملات حسب تصنيفات مخصصة</p>
          </div>
          <button
            onClick={() => { setEditId(null); setForm({ name: '', nameAr: '', color: PRESET_COLORS[0] }); setShowCreate(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-green-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            تصنيف جديد
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* System Categories */}
            {systemCategories.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 mb-3">تصنيفات النظام</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {systemCategories.map(cat => (
                    <div key={cat.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (cat.color || '#64748b') + '20' }}>
                        <Tag className="w-4 h-4" style={{ color: cat.color || '#64748b' }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{cat.nameAr || cat.name}</p>
                        <p className="text-xs text-gray-400">نظام</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Categories */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 mb-3">تصنيفاتك ({categories.length})</h2>
              {categories.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">لم تقم بإضافة تصنيفات بعد</p>
                  <p className="text-sm text-gray-400 mt-1">أضف تصنيفات لتنظيم معاملاتك</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (cat.color || '#64748b') + '20' }}>
                          <Tag className="w-5 h-5" style={{ color: cat.color || '#64748b' }} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{cat.nameAr || cat.name}</p>
                          {cat.nameAr && cat.name !== cat.nameAr && <p className="text-xs text-gray-400">{cat.name}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(cat)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Create/Edit Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">{editId ? 'تعديل التصنيف' : 'تصنيف جديد'}</h2>
                <button onClick={() => { setShowCreate(false); setEditId(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (إنجليزي)</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Food & Drinks"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي)</label>
                  <input
                    type="text"
                    value={form.nameAr || ''}
                    onChange={e => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="طعام ومشروبات"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        className="w-8 h-8 rounded-lg border-2 transition flex items-center justify-center"
                        style={{ backgroundColor: c, borderColor: form.color === c ? '#000' : 'transparent' }}
                      >
                        {form.color === c && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={!form.name || saving}
                  className="flex-1 py-2 bg-primary text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editId ? 'حفظ التعديلات' : 'إنشاء'}
                </button>
                <button
                  onClick={() => { setShowCreate(false); setEditId(null); }}
                  className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
