/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { CustomerList } from './views/CustomerList';
import { CustomerDetail } from './views/CustomerDetail';
import { SheetTypesManager } from './views/SheetTypesManager';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  // ۳. استفاده از سلکتور به جای کل استور جهت جلوگیری از رندرهای مجدد
  const isInitialized = useStore((state) => state.isInitialized);
  const initDb = useStore((state) => state.initDb);
  const [currentView, setCurrentView] = useState<'home' | 'detail' | 'settings'>('home');

  // ۱. اتصال غیرهمگام در پس‌زمینه
  useEffect(() => {
    initDb();
  }, [initDb]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans" dir="rtl">
        <Loader2 className="animate-spin text-amber-500 mb-3" size={36} />
        <p className="text-slate-500 text-sm font-medium">در حال راه‌اندازی نرم‌افزار...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-slate-900 overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 overflow-y-auto bg-slate-50 will-change-transform transform-gpu"
          >
            <CustomerList 
              onSelectCustomer={() => setCurrentView('detail')} 
              onOpenSettings={() => setCurrentView('settings')}
            />
          </motion.div>
        )}
        
        {currentView === 'detail' && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className="absolute inset-0 overflow-y-auto bg-slate-50 shadow-2xl will-change-transform transform-gpu"
          >
            <CustomerDetail onBack={() => setCurrentView('home')} />
          </motion.div>
        )}

        {currentView === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className="absolute inset-0 overflow-y-auto bg-slate-50 shadow-2xl will-change-transform transform-gpu"
          >
            <SheetTypesManager onBack={() => setCurrentView('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
