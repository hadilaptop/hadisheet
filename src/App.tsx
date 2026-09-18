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
  const { isInitialized, initDb } = useStore();
  const [currentView, setCurrentView] = useState<'home' | 'detail' | 'settings'>('home');

  useEffect(() => {
    initDb();
  }, [initDb]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50" dir="rtl">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
        <p className="text-slate-500 font-medium font-sans">در حال راه‌اندازی پایگاه داده...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans">
      <AnimatePresence>
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 overflow-y-auto bg-slate-50"
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 overflow-y-auto bg-slate-50 shadow-2xl"
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 overflow-y-auto bg-slate-50 shadow-2xl"
          >
            <SheetTypesManager onBack={() => setCurrentView('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
