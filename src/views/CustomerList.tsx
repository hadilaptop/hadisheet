import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/Header';
import { FAB } from '@/components/FAB';
import { BottomSheet } from '@/components/BottomSheet';
import { ChevronLeft, Settings, User, Search } from 'lucide-react';
import { motion } from 'motion/react';

export function CustomerList({ onSelectCustomer, onOpenSettings }: { onSelectCustomer: (id: string) => void, onOpenSettings: () => void }) {
  // ۳. استفاده از سلکتورهای مجزا به جای useStore() کلی
  const customers = useStore((state) => state.customers);
  const addCustomer = useStore((state) => state.addCustomer);
  const setCurrentCustomer = useStore((state) => state.setCurrentCustomer);

  const [isAdding, setIsAdding] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(query));
  }, [customers, searchQuery]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCustomerName.trim();
    if (!name) return;

    // ۴. آپدیت خوش‌بینانه: بلافاصله استیت تغییر می‌کند و فرم بسته می‌شود
    addCustomer(name);
    setNewCustomerName('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header 
        title="مشتریان" 
        rightAction={
          <button onClick={onOpenSettings} className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-full active:scale-95 transition-all">
            <Settings size={22} />
          </button>
        }
      />
      
      <div className="flex-1 p-4 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 ps-12 pe-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-sm text-slate-800 placeholder:text-slate-400 font-medium"
            placeholder="جستجوی مشتری..."
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 mt-4">
            <User size={48} className="mb-4 opacity-30 text-slate-500" />
            <p className="text-lg font-medium text-slate-500">هیچ مشتری یافت نشد</p>
            <p className="text-sm mt-2 text-slate-400">برای افزودن روی دکمه + کلیک کنید</p>
          </div>
        ) : (
          filteredCustomers.map((c) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                setCurrentCustomer(c);
                onSelectCustomer(c.id);
              }}
              className="w-full flex items-center justify-between p-5 bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-md hover:border-slate-200 active:scale-[0.98] transition-all text-right group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-lg border border-amber-100 shadow-sm shadow-amber-100/50 group-hover:scale-105 transition-transform">
                  {c.name.charAt(0)}
                </div>
                <span className="text-lg font-bold text-slate-800">{c.name}</span>
              </div>
              <ChevronLeft size={20} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
            </motion.button>
          ))
        )}
      </div>

      <FAB onClick={() => setIsAdding(true)} />

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="مشتری جدید">
        <form onSubmit={handleAdd} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">نام مشتری</label>
            <input
              type="text"
              autoFocus
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-lg text-slate-900 font-medium"
              placeholder="مثلا: شرکت آلفا"
            />
          </div>
          <button 
            type="submit"
            disabled={!newCustomerName.trim()}
            className="w-full h-14 bg-slate-900 text-white text-lg font-bold rounded-2xl hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 disabled:active:bg-slate-900 transition-all shadow-xl shadow-slate-900/10"
          >
            ثبت مشتری
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
