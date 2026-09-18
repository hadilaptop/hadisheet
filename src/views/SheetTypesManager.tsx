import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { Trash2, Layers } from 'lucide-react';
import { motion } from 'motion/react';

export function SheetTypesManager({ onBack }: { onBack: () => void }) {
  // ۳. استفاده از سلکتورهای مشخص برای جلوگیری از Re-render کامپوننت
  const sheetTypes = useStore((state) => state.sheetTypes);
  const addSheetType = useStore((state) => state.addSheetType);
  const deleteSheetType = useStore((state) => state.deleteSheetType);
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    // ۴. ثبت خوش‌بینانه و فوری در رابط کاربری
    addSheetType(name);
    setNewName('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-safe">
      <Header title="مدیریت انواع ورق" onBack={onBack} />
      
      <div className="flex-1 p-4 space-y-6">
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">افزودن نوع جدید</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-lg font-medium text-slate-900"
              placeholder="مثلا: مات ۲۰۰ گرم"
            />
          </div>
          <button 
            type="submit"
            disabled={!newName.trim()}
            className="w-full h-14 bg-slate-900 text-white text-lg font-bold rounded-2xl hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/10"
          >
            افزودن ورق
          </button>
        </form>

        <div>
          <h2 className="text-sm font-bold text-slate-500 ms-2 mb-4">انواع موجود</h2>
          <div className="space-y-3">
            {sheetTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Layers size={40} className="mb-3 opacity-30 text-amber-500" />
                <p className="font-medium text-slate-500">ورقی تعریف نشده است.</p>
              </div>
            ) : (
              sheetTypes.map(type => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100"
                >
                  <div className="flex items-center text-slate-800 font-semibold text-lg">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center me-3 text-amber-600 border border-amber-100">
                      <Layers size={20} />
                    </div>
                    {type.name}
                  </div>
                  <button 
                    onClick={() => deleteSheetType(type.id)}
                    className="p-3 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
