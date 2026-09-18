import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { FAB } from '@/components/FAB';
import { BottomSheet } from '@/components/BottomSheet';
import { format } from 'date-fns';
import { Trash2, FileText, Ruler, Calendar, AlignRight } from 'lucide-react';
import { motion } from 'motion/react';

export function CustomerDetail({ onBack }: { onBack: () => void }) {
  // ۳. استفاده از سلکتورهای مجزا جهت جلوگیری از رندرهای اضافی
  const currentCustomer = useStore((state) => state.currentCustomer);
  const workItems = useStore((state) => state.workItems);
  const loadWorkItems = useStore((state) => state.loadWorkItems);
  const sheetTypes = useStore((state) => state.sheetTypes);
  const addWorkItem = useStore((state) => state.addWorkItem);
  const deleteWorkItem = useStore((state) => state.deleteWorkItem);

  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    name: '',
    sheetTypeId: '',
    length: '',
    width: '',
    price: '',
    notes: ''
  });

  useEffect(() => {
    if (currentCustomer?.id) {
      loadWorkItems(currentCustomer.id);
    }
  }, [currentCustomer?.id, loadWorkItems]);

  if (!currentCustomer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sheetTypeId) return;
    
    // ۴. اعمال فوری در رابط کاربری بدون منتظر ماندن برای ذخیره در دیتابیس
    addWorkItem({
      customerId: currentCustomer.id,
      date: formData.date,
      name: formData.name.trim(),
      sheetTypeId: formData.sheetTypeId,
      length: parseFloat(formData.length) || 0,
      width: parseFloat(formData.width) || 0,
      price: parseFloat(formData.price) || 0,
      notes: formData.notes
    });
    
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      name: '',
      sheetTypeId: '',
      length: '',
      width: '',
      price: '',
      notes: ''
    });
    setIsAdding(false);
  };

  const getSheetName = (id: string) => sheetTypes.find(s => s.id === id)?.name || 'ناشناس';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title={currentCustomer.name} onBack={onBack} />
      
      <div className="flex-1 p-4 space-y-4">
        <h2 className="text-sm font-bold text-slate-500 ms-2 mt-2 mb-4">لیست سفارشات</h2>
        
        {workItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <FileText size={48} className="mb-4 opacity-30 text-amber-500" />
            <p className="font-medium text-slate-500">سفارشی ثبت نشده است</p>
          </div>
        ) : (
          workItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 end-0 w-2 h-full bg-amber-400" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-xl leading-tight">{item.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-2 font-medium">
                    <Calendar size={14} className="me-1.5" />
                    <span dir="ltr">{format(new Date(item.date), 'yyyy/MM/dd')}</span>
                  </div>
                </div>
                <div className="text-end flex flex-col items-end gap-2">
                  <span className="font-bold text-slate-900 text-xl tracking-tight">
                    {item.price.toLocaleString()} <span className="text-xs text-slate-500 font-medium tracking-normal ms-0.5">تومان</span>
                  </span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">{getSheetName(item.sheetTypeId)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100 font-medium">
                <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <Ruler size={14} className="me-2 text-amber-500" />
                  <span className="text-slate-400 mx-1">طول:</span> {item.length}
                </div>
                <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <Ruler size={14} className="me-2 text-amber-500 rotate-90" />
                  <span className="text-slate-400 mx-1">عرض:</span> {item.width}
                </div>
              </div>
              
              {item.notes && (
                <div className="flex items-start text-sm text-slate-700 mb-4 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/50 leading-relaxed font-medium">
                  <AlignRight size={16} className="me-2 text-amber-500 mt-0.5 shrink-0" />
                  <p>{item.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                  onClick={() => deleteWorkItem(item.id)}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center text-sm font-bold active:bg-red-100"
                >
                  <Trash2 size={16} className="me-1.5" /> حذف سفارش
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <FAB onClick={() => setIsAdding(true)} />

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="ثبت سفارش جدید">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">تاریخ</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">قیمت (تومان)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-slate-900 font-bold text-end"
                placeholder="0"
                dir="ltr"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">نام سفارش</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-slate-900 font-medium"
              placeholder="مثلا: پرده پذیرایی"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">نوع ورق</label>
            <div className="relative">
              <select
                required
                value={formData.sheetTypeId}
                onChange={(e) => setFormData({...formData, sheetTypeId: e.target.value})}
                className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all appearance-none text-slate-900 font-medium"
              >
                <option value="" disabled>انتخاب کنید...</option>
                {sheetTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">طول (سانتی‌متر)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.length}
                onChange={(e) => setFormData({...formData, length: e.target.value})}
                className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-slate-900 font-bold text-end"
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">عرض (سانتی‌متر)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.width}
                onChange={(e) => setFormData({...formData, width: e.target.value})}
                className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-slate-900 font-bold text-end"
                placeholder="0"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">توضیحات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all min-h-[120px] resize-none text-slate-900 font-medium"
              placeholder="نکات تکمیلی..."
            />
          </div>

          <button 
            type="submit"
            className="w-full h-14 mt-6 bg-slate-900 text-white text-lg font-bold rounded-2xl hover:bg-slate-800 active:bg-slate-950 transition-all shadow-xl shadow-slate-900/20"
          >
            ذخیره سفارش
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
